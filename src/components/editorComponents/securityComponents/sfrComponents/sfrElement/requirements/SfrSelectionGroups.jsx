// Imports
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody } from "@material-tailwind/react";
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveIcon from "@mui/icons-material/Remove";
import { updateSnackBar } from "../../../../../../reducers/accordionPaneSlice.js";
import { UPDATE_SFR_SECTION_ELEMENT, UPDATE_SFR_SECTION_ELEMENT_SELECTABLE } from "../../../../../../reducers/SFRs/sfrSectionSlice.js";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { removeTagEqualities } from "../../../../../../utils/fileParser.js";
import { handleSnackBarError, handleSnackBarSuccess, updateSfrSectionElement } from "../../../../../../utils/securityComponents.jsx";
import {
  getSfrSectionsEvaluationActivityDependencyUsage,
  removeEvaluationActivityDependenciesFromSfrSections,
} from "../../../../../../utils/evaluationActivityDependencyRemoval.js";
import { COMMON_REGEX, UI_REGEX } from "../../../../../../utils/regexUtils.js";
import { applySelectionFormatting, getSelectionFormatting } from "../../../../../../utils/selectionFormatting.js";
import CardTemplate from "../../../CardTemplate.jsx";
import EditableTable from "../../../../EditableTable.jsx";
import TipTapEditor from "../../../../TipTapEditor.jsx";
import Modal from "../../../../../modalComponents/Modal.jsx";
import DependencyDeleteWarning from "../../../../../modalComponents/DependencyDeleteWarning.jsx";
import SfrComplexSelectableCard from "./SfrComplexSelectableCard.jsx";
import SfrSelectionGroupCard from "./SfrSelectionGroupCard.jsx";

/**
 * Gets the default selectable/assignment ID base from the current element name.
 * @param selectedSfrElement the selected SFR element name
 * @param element the current element
 * @param ppShortName the PP/package short name
 * @returns {string}
 */
const getSelectableIDBase = (selectedSfrElement, element, ppShortName = "") => {
  const elementName = selectedSfrElement && selectedSfrElement !== "" ? selectedSfrElement : element?.elementXMLID;
  const formattedShortName = String(ppShortName || "").trim().replace(UI_REGEX.shortNameSeparator, "_").toLowerCase();
  if (!elementName || elementName.trim() === "") {
    return formattedShortName ? `${formattedShortName}_selection` : "selection";
  }

  const [base, ...iterations] = elementName.trim().replace(COMMON_REGEX.allWhitespace, "_").split("/");
  const formattedBase = base.toLowerCase();
  const formattedIterations = iterations.map((iteration) => iteration.toUpperCase());

  return [formattedShortName, formattedBase, ...formattedIterations].filter(Boolean).join("_");
};
/**
 * Gets existing selectable IDs across the full SFR state.
 * @param sfrSections the SFR sections state
 * @param currentSelectables the local selectables to include
 * @returns {Set<string>}
 */
const getExistingSelectableIDs = (sfrSections, currentSelectables = {}) => {
  const ids = new Set();
  const addID = (id) => {
    if (id && typeof id === "string") {
      ids.add(id);
    }
  };

  Object.values(sfrSections || {}).forEach((sfrSection) => {
    Object.values(sfrSection || {}).forEach((component) => {
      Object.values(component.elements || {}).forEach((elem) => {
        Object.values(elem.selectables || {}).forEach((selectable) => addID(selectable.id));
        Object.keys(elem.selectableGroups || {}).forEach(addID);
      });
    });
  });

  Object.values(currentSelectables || {}).forEach((selectable) => addID(selectable.id));

  return ids;
};
/**
 * Gets the next default selectable/assignment ID for the current element.
 * @param selectedSfrElement the selected SFR element name
 * @param element the current element
 * @param sfrSections the SFR sections state
 * @param currentSelectables the local selectables to include
 * @param ppShortName the PP/package short name
 * @returns {string}
 */
const getNextSelectableID = ({ selectedSfrElement, element, sfrSections, currentSelectables = element?.selectables || {}, ppShortName = "" }) => {
  const baseID = getSelectableIDBase(selectedSfrElement, element, ppShortName);
  const existingIDs = getExistingSelectableIDs(sfrSections, currentSelectables);
  let counter = 1;
  let nextID = `${baseID}_${counter}`;

  while (existingIDs.has(nextID)) {
    counter += 1;
    nextID = `${baseID}_${counter}`;
  }

  return nextID;
};
/**
 * Gets the component ID that already uses a selectable ID.
 * @param sfrSections the SFR sections state
 * @param selectableID the selectable ID to check
 * @param ignoredSelectableUUID the selectable UUID to ignore
 * @returns {string|null}
 */
const getDuplicateSelectableComponentCCID = (sfrSections, selectableID, ignoredSelectableUUID = null) => {
  if (!selectableID || selectableID === "") {
    return null;
  }

  let duplicateComponentCCID = null;

  Object.values(sfrSections || {}).forEach((sfrSection) => {
    Object.values(sfrSection || {}).forEach((component) => {
      if (!component.elements) return;

      Object.values(component.elements).forEach((elem) => {
        Object.entries(elem.selectables || {}).forEach(([selKey, sel]) => {
          if (selKey !== ignoredSelectableUUID && sel.id === selectableID) {
            duplicateComponentCCID = component.cc_id || "unknown";
          }
        });

        Object.keys(elem.selectableGroups || {}).forEach((key) => {
          if (key === selectableID) {
            duplicateComponentCCID = component.cc_id || "unknown";
          }
        });
      });
    });
  });

  return duplicateComponentCCID;
};
/**
 * Checks the current element for a duplicate selectable/group ID.
 * @param element the current element
 * @param selectionID the selectable/group ID to check
 * @param ignoredSelectableUUID the selectable UUID to ignore
 * @param ignoredSelectableGroupID the selectable group ID to ignore
 * @returns {boolean}
 */
const hasDuplicateSelectionIDInElement = (element, selectionID, ignoredSelectableUUID = null, ignoredSelectableGroupID = null) => {
  if (!element || !selectionID || selectionID === "") {
    return false;
  }

  const selectableDuplicate = Object.entries(element.selectables || {}).some(
    ([uuid, selectable]) => uuid !== ignoredSelectableUUID && selectable.id === selectionID
  );
  const selectableGroupDuplicate = Object.keys(element.selectableGroups || {}).some((key) => key !== ignoredSelectableGroupID && key === selectionID);

  return selectableDuplicate || selectableGroupDuplicate;
};
/**
 * Gets the component ID that already uses a selectable group ID.
 * @param sfrSections the SFR sections state
 * @param selectableGroupID the selectable group ID to check
 * @param ignoredElementUUID the element UUID that owns the current group
 * @param ignoredSelectableGroupID the current selectable group ID to ignore
 * @returns {string|null}
 */
const getDuplicateSelectableGroupComponentCCID = (sfrSections, selectableGroupID, ignoredElementUUID = null, ignoredSelectableGroupID = null) => {
  if (!selectableGroupID || selectableGroupID === "") {
    return null;
  }

  let duplicateComponentCCID = null;

  Object.values(sfrSections || {}).forEach((sfrSection) => {
    Object.values(sfrSection || {}).forEach((component) => {
      if (!component.elements) return;

      Object.entries(component.elements).forEach(([elemUUID, elem]) => {
        Object.values(elem.selectables || {}).forEach((sel) => {
          if (sel.id === selectableGroupID) {
            duplicateComponentCCID = component.cc_id || "unknown";
          }
        });

        Object.keys(elem.selectableGroups || {}).forEach((key) => {
          const isIgnoredGroup = elemUUID === ignoredElementUUID && key === ignoredSelectableGroupID;
          if (!isIgnoredGroup && key === selectableGroupID) {
            duplicateComponentCCID = component.cc_id || "unknown";
          }
        });
      });
    });
  });

  return duplicateComponentCCID;
};
/**
 * Gets the duplicate selectable/group ID error message.
 * @param selectionID the duplicate selection ID
 * @returns {string}
 */
const getDuplicateSelectionIDMessage = (selectionID) => `There is already an existing group/selectable with that name: "${selectionID}".`;
/**
 * Gets the SFR/component location for an element.
 * @param sfrSections the SFR sections state
 * @param elementUUID the element UUID to locate
 * @param fallbackSfrUUID the current selected SFR UUID
 * @param fallbackComponentUUID the current selected component UUID
 * @returns {{sfrUUID: string|null, componentUUID: string|null}}
 */
const getElementLocation = (sfrSections, elementUUID, fallbackSfrUUID = null, fallbackComponentUUID = null) => {
  if (fallbackSfrUUID && fallbackComponentUUID && sfrSections?.[fallbackSfrUUID]?.[fallbackComponentUUID]?.elements?.[elementUUID]) {
    return {
      sfrUUID: fallbackSfrUUID,
      componentUUID: fallbackComponentUUID,
    };
  }

  for (const [sectionUUID, sfrSection] of Object.entries(sfrSections || {})) {
    for (const [componentID, component] of Object.entries(sfrSection || {})) {
      if (component?.elements?.[elementUUID]) {
        return {
          sfrUUID: sectionUUID,
          componentUUID: componentID,
        };
      }
    }
  }

  return {
    sfrUUID: fallbackSfrUUID,
    componentUUID: fallbackComponentUUID,
  };
};
/**
 * Replaces selectable group references in a text array.
 * @param textArray the text array
 * @param oldID the original selectable group ID
 * @param newID the new selectable group ID
 * @returns {Array}
 */
const renameSelectableGroupIDInTextArray = (textArray, oldID, newID) => {
  if (!Array.isArray(textArray)) {
    return textArray;
  }

  return textArray.map((section) => {
    if (!section || typeof section !== "object") {
      return section;
    }

    const updatedSection = deepCopy(section);
    if (updatedSection.selections === oldID) {
      updatedSection.selections = newID;
    }

    return updatedSection;
  });
};
/**
 * Replaces selectable group references in selectable group content.
 * @param group the selectable group content
 * @param oldID the original selectable group ID
 * @param newID the new selectable group ID
 * @returns {Object}
 */
const renameSelectableGroupIDInGroupContent = (group, oldID, newID) => {
  const updatedGroup = deepCopy(group);

  if (Array.isArray(updatedGroup.groups)) {
    updatedGroup.groups = updatedGroup.groups.map((item) => (item === oldID ? newID : item));
  }

  if (Array.isArray(updatedGroup.description)) {
    updatedGroup.description = updatedGroup.description.map((item) => {
      const updatedItem = deepCopy(item);
      if (Array.isArray(updatedItem.groups)) {
        updatedItem.groups = updatedItem.groups.map((selection) => (selection === oldID ? newID : selection));
      }
      return updatedItem;
    });
  }

  return updatedGroup;
};
/**
 * Renames a selectable group key and updates selectable group references.
 * @param selectableGroups the selectable groups object
 * @param oldID the original selectable group ID
 * @param newID the new selectable group ID
 * @returns {Object}
 */
const renameSelectableGroupIDInSelectableGroups = (selectableGroups, oldID, newID) => {
  return Object.entries(selectableGroups || {}).reduce((updatedGroups, [key, group]) => {
    const updatedKey = key === oldID ? newID : key;
    updatedGroups[updatedKey] = renameSelectableGroupIDInGroupContent(group, oldID, newID);
    return updatedGroups;
  }, {});
};
/**
 * Replaces selectable group references in management functions.
 * @param managementFunctions the management functions object
 * @param oldID the original selectable group ID
 * @param newID the new selectable group ID
 * @returns {Object}
 */
const renameSelectableGroupIDInManagementFunctions = (managementFunctions, oldID, newID) => {
  const updatedManagementFunctions = deepCopy(managementFunctions);

  if (Array.isArray(updatedManagementFunctions.rows)) {
    updatedManagementFunctions.rows = updatedManagementFunctions.rows.map((row) => ({
      ...row,
      textArray: renameSelectableGroupIDInTextArray(row.textArray, oldID, newID),
    }));
  }

  return updatedManagementFunctions;
};
/**
 * Replaces selectable group references in tabularize table rows.
 * @param tabularize the tabularize object
 * @param oldID the original selectable group ID
 * @param newID the new selectable group ID
 * @returns {Object}
 */
const renameSelectableGroupIDInTabularize = (tabularize, oldID, newID) => {
  const updatedTabularize = deepCopy(tabularize);

  Object.values(updatedTabularize || {}).forEach((tabularizeItem) => {
    if (Array.isArray(tabularizeItem.rows)) {
      tabularizeItem.rows = tabularizeItem.rows.map((row) => {
        const updatedRow = deepCopy(row);
        Object.entries(updatedRow).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            updatedRow[field] = renameSelectableGroupIDInTextArray(value, oldID, newID);
          }
        });
        return updatedRow;
      });
    }
  });

  return updatedTabularize;
};
/**
 * The add selectable/assignment form.
 */
const SelectableItemAddForm = memo(function SelectableItemAddForm({ element, selectedSfrElement, sfrSections, ppShortName, styling, icons, lightGray, onSubmit }) {
  const [selectableType, setSelectableType] = useState("Selectable");
  const [selectableID, setSelectableID] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [selectableDescription, setSelectableDescription] = useState("");
  const currentDescription = selectableType === "Assignment" ? assignmentDescription : selectableDescription;
  const selectableDisabled = currentDescription === "";

  useEffect(() => {
    setSelectableID(getNextSelectableID({ selectedSfrElement, element, sfrSections, ppShortName }));
  }, [element, selectedSfrElement, sfrSections, ppShortName]);

  const handleSubmit = () => {
    const result = onSubmit({
      selectableType,
      selectableID,
      description: currentDescription,
    });

    if (result?.success) {
      setSelectableID(result.nextSelectableID || getNextSelectableID({ selectedSfrElement, element, sfrSections, ppShortName }));
      setAssignmentDescription("");
      setSelectableDescription("");
      setSelectableType("Selectable");
    } else if (result?.nextSelectableID !== undefined) {
      setSelectableID(result.nextSelectableID);
    }
  };

  return (
    <span className='min-w-full inline-flex items-baseline'>
      <div className='w-[17%]'>
        <FormControl fullWidth color={styling.secondaryTextField}>
          <InputLabel key='element-select-label'>Selectable Type</InputLabel>
          <Select
            value={selectableType}
            label='Selectable Type'
            autoWidth
            onChange={(event) => setSelectableType(event.target.value)}
            sx={{ textAlign: "left" }}>
            <MenuItem sx={styling.primaryMenu} key={"Assignment"} value={"Assignment"}>
              Assignment
            </MenuItem>
            <MenuItem sx={styling.primaryMenu} key={"Selectable"} value={"Selectable"}>
              Selectable
            </MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className='w-[16%] pl-2'>
        <FormControl fullWidth>
          <TextField label='ID' color={styling.secondaryTextField} value={selectableID} onChange={(event) => setSelectableID(event.target.value)} />
        </FormControl>
      </div>
      {selectableType === "Assignment" ? (
        <div className='w-[61%] pl-2'>
          <FormControl fullWidth>
            <TextField
              required
              color={styling.secondaryTextField}
              label='Assignment'
              value={assignmentDescription}
              onChange={(event) => setAssignmentDescription(event.target.value)}
            />
          </FormControl>
        </div>
      ) : (
        <div className='w-[61%] pl-2'>
          <FormControl fullWidth>
            <TextField
              required
              color={styling.secondaryTextField}
              label='Description'
              value={selectableDescription}
              onChange={(event) => setSelectableDescription(event.target.value)}
            />
          </FormControl>
        </div>
      )}
      <div className='w-[6%]'>
        <Tooltip title={`Add ${selectableType}`} id={"addSelectableTooltip"}>
          <span>
            <IconButton sx={{ marginBottom: "-36px" }} disabled={selectableDisabled} onClick={handleSubmit} variant='contained'>
              <AddCircleIcon htmlColor={selectableDisabled ? lightGray : styling.secondaryColor} sx={icons.medium} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </span>
  );
});
SelectableItemAddForm.propTypes = {
  element: PropTypes.object.isRequired,
  selectedSfrElement: PropTypes.string.isRequired,
  sfrSections: PropTypes.object.isRequired,
  ppShortName: PropTypes.string,
  styling: PropTypes.object.isRequired,
  icons: PropTypes.object.isRequired,
  lightGray: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const EDITABLE_CONFIG = { addColumn: false, addRow: false, removeColumn: false, removeRow: true };
const COLUMN_DATA = [
  {
    headerName: "ID",
    field: "id",
    editable: true,
    resizable: true,
    type: "Editor",
    flex: 1.5,
    headerTooltip: "The ID of the selectable or assignment. New items default to the element name plus a counter and can be edited.",
  },
  {
    headerName: "Text",
    field: "text",
    editable: true,
    resizable: true,
    type: "Editor",
    flex: 2,
    headerTooltip: "The value of the selectable or assignment.",
  },
  {
    headerName: "Not Selectable",
    field: "notSelectable",
    editable: true,
    resizable: true,
    type: "Checkbox",
    flex: 0.75,
    headerTooltip: "Selections that must be viewable, but not selectable.",
  },
  {
    headerName: "Exclusive",
    field: "exclusive",
    editable: true,
    resizable: true,
    type: "Checkbox",
    flex: 0.75,
    headerTooltip: "Selections that when selected, exclude all other selections.",
  },
];

/**
 * The SfrSelectionGroups class that displays the selection groups per f-element
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrSelectionGroups(props) {
  // Prop Validation
  SfrSelectionGroups.propTypes = {
    styling: PropTypes.object.isRequired,
    requirementType: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const { icons, lightGray } = useSelector((state) => state.styling);
  const sfrSections = useSelector((state) => state.sfrSections);
  const ppShortName = useSelector((state) => state.accordionPane.metadata.xmlTagMeta?.attributes?.short || "");
  const { sfrUUID, componentUUID, elementUUID, element, selectedSfrElement } = useSelector((state) => state.sfrWorksheetUI);
  const [collapse, setCollapse] = useState(true);
  const [selectableGroupType, setSelectableGroupType] = useState("Selectable Group");
  const [selectableGroupID, setSelectableGroupID] = useState("");
  const [complexSelectableID, setComplexSelectableID] = useState("");
  const [selectableGroupDisabled, setSelectableGroupDisabled] = useState(true);
  const [rowData, setRowData] = useState([]);
  const [collapseInnerTableSection, setCollapseInnerTableSection] = useState(false);
  const [dependencyDeleteWarning, setDependencyDeleteWarning] = useState(null);
  const [selectableTextEditor, setSelectableTextEditor] = useState(null);
  const { styling } = props;

  // Use Effects
  useEffect(() => {
    generateRowData();
  }, [element, sfrSections, props]);

  // Methods
  /**
   * Handles deleting the selectable
   * @param _newData the new data (not needed for this function, but needed to conform for positional args )
   * @param selectedData the selected data
   */
  const deleteSelectableRows = (selectedData) => {
    let selectables = element.selectables ? deepCopy(element.selectables) : {};
    let selectableGroups = element.selectableGroups ? deepCopy(element.selectableGroups) : {};
    let title = element.title ? deepCopy(element.title) : [];
    let managementFunctions = element.managementFunctions ? deepCopy(element.managementFunctions) : {};

    // Delete associated values accordingly
    selectedData.forEach((row) => {
      const { uuid } = row;

      // Delete selectable from selectables that contain the uuid key
      delete selectables[uuid];

      // Delete selection groups index that contain the selection uuid key
      Object.values(selectableGroups).forEach((group) => {
        if (group.groups && group.groups.includes(uuid)) {
          group.groups = group.groups.filter((value) => value !== uuid);
        }
      });

      // Delete title assignment sections that contain the selection uuid key
      title = title.filter((section) => !(section.hasOwnProperty("assignment") && section.assignment === uuid));

      // Delete management function sections that contain the selection uuid key
      if (
        element.hasOwnProperty("isManagementFunction") &&
        element.isManagementFunction &&
        element.hasOwnProperty("managementFunctions") &&
        element.managementFunctions.hasOwnProperty("rows")
      ) {
        managementFunctions.rows.forEach((row) => {
          row.textArray = row.textArray.filter((section) => !(section.hasOwnProperty("assignment") && section.assignment === uuid));
        });
      }
    });

    // Update the objects
    let itemMap = {
      selectables: selectables,
      selectableGroups: selectableGroups,
      title: title,
    };

    // Update management functions if they were updated
    if (element.managementFunctions && JSON.stringify(managementFunctions) !== JSON.stringify(element.managementFunctions)) {
      itemMap.managementFunctions = managementFunctions;
    }

    // Update the sfr section element
    updateSfrSectionElement(itemMap);
  };
  /**
   * Handles deleting the selectable
   * @param _newData the new data (not needed for this function, but needed to conform for positional args )
   * @param selectedData the selected data
   */
  const handleDeleteSelectable = (_newData, selectedData = []) => {
    const dependencyValues = selectedData.flatMap((row) => [row?.uuid, row?.id]).filter(Boolean);
    const usage = getSfrSectionsEvaluationActivityDependencyUsage(sfrSections, dependencyValues);

    if (usage.total > 0) {
      setDependencyDeleteWarning({
        selectedData,
        dependencyValues,
        usage,
        selectedCount: selectedData.length,
        itemLabel: selectedData.length > 1 ? `${selectedData.length} selectables` : `selectable "${selectedData[0]?.id || selectedData[0]?.uuid || ""}"`,
      });
      return false;
    }

    deleteSelectableRows(selectedData);
  };
  /**
   * Closes the dependency delete warning.
   */
  const handleCloseDependencyDeleteWarning = () => {
    setDependencyDeleteWarning(null);
  };
  /**
   * Deletes pending selectable rows and removes any dependent evaluation activity relationships.
   */
  const handleSubmitDependencyDeleteWarning = () => {
    if (!dependencyDeleteWarning) return;

    deleteSelectableRows(dependencyDeleteWarning.selectedData);
    removeEvaluationActivityDependenciesFromSfrSections(dependencyDeleteWarning.dependencyValues);
    handleSnackBarSuccess(dependencyDeleteWarning.selectedCount > 1 ? "Selected Rows were Successfully Removed" : "Selected Row Successfully Removed");
    handleCloseDependencyDeleteWarning();
  };
  /**
   * Handles the selectable checkbox selection
   * @param event the event
   * @param type the type
   * @param uuid the uuid
   */
  const handleSelectableCheckboxSelection = (event, type, uuid) => {
    // Update selectable checkbox for exclusive or not selectable types
    if (type === "exclusive" || type === "notSelectable") {
      let itemMap = {
        [type]: event.target.checked,
      };
      updateSelectable(uuid, itemMap);
    }
  };
  /**
   * Shows an immediate duplicate selectable/group ID snackbar error.
   * @param selectionID the duplicate selection ID
   */
  const showDuplicateSelectionIDError = useCallback(
    (selectionID) => {
      dispatch(
        updateSnackBar({
          open: true,
          message: getDuplicateSelectionIDMessage(selectionID),
          severity: "error",
          vertical: "bottom",
          horizontal: "left",
          autoHideDuration: 6000,
        })
      );
    },
    [dispatch]
  );
  /**
   * Handles the new selectable submit
   * @param formData the add form data
   * @returns {Promise<void>}
   */
  const handleNewSelectableSubmit = useCallback(
    (formData) => {
      const { selectableType, selectableID, description } = formData;

      if (selectableType === "Assignment" || selectableType === "Selectable") {
        let selectables = element.selectables ? deepCopy(element.selectables) : {};
        const trimmedSelectableID = selectableID.trim();
        const newSelectableID =
          trimmedSelectableID !== ""
            ? trimmedSelectableID
            : getNextSelectableID({ selectedSfrElement, element, sfrSections, currentSelectables: selectables, ppShortName });
        const duplicateIDExists =
          hasDuplicateSelectionIDInElement(element, newSelectableID) || getDuplicateSelectableComponentCCID(sfrSections, newSelectableID);

        if (duplicateIDExists) {
          showDuplicateSelectionIDError(newSelectableID);
          return { success: false };
        }

        let uuid = uuidv4();
        selectables[uuid] = {
          id: newSelectableID,
          description,
          assignment: selectableType === "Assignment",
        };

        // Update sfr section element
        updateSfrSectionElement({
          selectables,
        });

        // Update snackbar
        handleSnackBarSuccess(`${selectableType} Successfully Added`);

        return {
          success: true,
          nextSelectableID: getNextSelectableID({ selectedSfrElement, element, sfrSections, currentSelectables: selectables, ppShortName }),
        };
      }

      return { success: false, nextSelectableID: "" };
    },
    [element, selectedSfrElement, sfrSections, ppShortName, showDuplicateSelectionIDError]
  );
  /**
   * Handles setting the selectable group type
   * @param event the event
   */
  const handleSetSelectableGroupType = (event) => {
    const newType = event.target.value;
    setSelectableGroupType(newType);
    setSelectableGroupDisabled(newType === "Complex Selectable" ? complexSelectableID.trim() === "" : selectableGroupID.trim() === "");
  };
  /**
   * Handles the complex selectable ID
   * @param event the event
   */
  const handleComplexSelectableID = (event) => {
    let trimmed = event.target.value.trim();
    setComplexSelectableID(trimmed);
    setSelectableGroupDisabled(selectableGroupType === "Complex Selectable" && trimmed !== "" ? false : true);
  };
  /**
   * Handles the selectable group id
   * @param event the event
   */
  const handleSelectableGroupID = (event) => {
    let trimmed = event.target.value.trim();
    setSelectableGroupID(trimmed);
    setSelectableGroupDisabled(selectableGroupType === "Selectable Group" && trimmed !== "" ? false : true);
  };
  /**
   * Handles the new selectable group submit
   */
  const handleNewSelectableGroupSubmit = () => {
    let selectableGroups = element.selectableGroups ? deepCopy(element.selectableGroups) : {};
    let newID = "";

    if (selectableGroupType && selectableGroupType === "Selectable Group") {
      newID = selectableGroupID;
      if (newID === "") {
        handleSnackBarError(`${selectableGroupType} ID cannot be blank.`);
        return;
      }
      const duplicateIDExists = hasDuplicateSelectionIDInElement(element, newID) || getDuplicateSelectableGroupComponentCCID(sfrSections, newID);
      if (duplicateIDExists) {
        showDuplicateSelectionIDError(newID);
        return;
      }

      selectableGroups[newID] = {
        onlyOne: false,
        ...getSelectionFormatting(),
        groups: [],
      };
    } else if (selectableGroupType && selectableGroupType === "Complex Selectable") {
      newID = complexSelectableID;
      if (newID === "") {
        handleSnackBarError(`${selectableGroupType} ID cannot be blank.`);
        return;
      }
      const duplicateIDExists = hasDuplicateSelectionIDInElement(element, newID) || getDuplicateSelectableGroupComponentCCID(sfrSections, newID);
      if (duplicateIDExists) {
        showDuplicateSelectionIDError(newID);
        return;
      }

      selectableGroups[newID] = {
        exclusive: false,
        notSelectable: false,
        description: [],
      };
    }

    updateSfrSectionElement({
      selectableGroups,
    });
    setSelectableGroupDisabled(true);
    setSelectableGroupID("");
    setComplexSelectableID("");

    // Update snackbar
    handleSnackBarSuccess(`${selectableGroupType} Successfully Added`);
  };
  /**
   * Handles updating a selectable group or complex selectable ID.
   * @param oldID the current selectable group ID
   * @param newID the updated selectable group ID
   * @returns {{success: boolean, id: string}}
   */
  const handleSelectableGroupIDUpdate = useCallback(
    (oldID, newID) => {
      const selectableGroups = element.selectableGroups ? deepCopy(element.selectableGroups) : {};
      const trimmedNewID = newID.trim();
      const currentGroup = selectableGroups[oldID];
      const groupType = currentGroup?.hasOwnProperty("groups") ? "Selectable Group" : "Complex Selectable";

      if (!currentGroup) {
        handleSnackBarError(`${groupType} "${oldID}" could not be found.`);
        return { success: false, id: oldID };
      }

      if (trimmedNewID === oldID) {
        return { success: false, id: oldID };
      }

      if (trimmedNewID === "") {
        handleSnackBarError(`${groupType} ID cannot be blank.`);
        return { success: false, id: oldID };
      }

      const duplicateIDExists =
        hasDuplicateSelectionIDInElement(element, trimmedNewID, null, oldID) ||
        getDuplicateSelectableGroupComponentCCID(sfrSections, trimmedNewID, elementUUID, oldID);
      if (duplicateIDExists) {
        showDuplicateSelectionIDError(trimmedNewID);
        return { success: false, id: oldID };
      }

      const itemMap = {
        selectableGroups: renameSelectableGroupIDInSelectableGroups(selectableGroups, oldID, trimmedNewID),
        title: renameSelectableGroupIDInTextArray(element.title ? deepCopy(element.title) : [], oldID, trimmedNewID),
      };

      if (element.managementFunctions) {
        itemMap.managementFunctions = renameSelectableGroupIDInManagementFunctions(element.managementFunctions, oldID, trimmedNewID);
      }

      if (element.tabularize) {
        itemMap.tabularize = renameSelectableGroupIDInTabularize(element.tabularize, oldID, trimmedNewID);
      }

      const elementLocation = getElementLocation(sfrSections, elementUUID, sfrUUID, componentUUID);
      if (!elementLocation.sfrUUID || !elementLocation.componentUUID || !elementUUID) {
        handleSnackBarError("Unable to update selectable group ID because the current SFR element could not be located.");
        return { success: false, id: oldID };
      }

      dispatch(
        UPDATE_SFR_SECTION_ELEMENT({
          sfrUUID: elementLocation.sfrUUID,
          sectionUUID: elementLocation.componentUUID,
          elementUUID,
          itemMap,
        })
      );
      handleSnackBarSuccess(`${groupType} ID Successfully Updated`);

      return { success: true, id: trimmedNewID };
    },
    [componentUUID, dispatch, element, elementUUID, sfrSections, sfrUUID, showDuplicateSelectionIDError]
  );
  /**
   * Handles the id text update
   * @param event the event
   */
  const handleIdTextUpdate = (event) => {
    const { data, value, colDef } = event;
    const { uuid } = data;
    let selectables = element.selectables ? deepCopy(element.selectables) : {};

    if (selectables.hasOwnProperty(uuid)) {
      if (colDef.field === "text") {
        // Strip the assignment prefix if present before storing
        const rawValue = value.replace(UI_REGEX.assignmentStrongPrefix, "");
        selectables[uuid].description = rawValue;
      } else {
        // Check that no other selectable across the full state uses this ID (regular and complex selectables)
        const duplicateIDExists = hasDuplicateSelectionIDInElement(element, value, uuid) || getDuplicateSelectableComponentCCID(sfrSections, value, uuid);
        if (duplicateIDExists) {
          showDuplicateSelectionIDError(value);
          throw getDuplicateSelectionIDMessage(value);
        }
        selectables[uuid].id = value;
      }

      // Update selectables for the selected element
      updateSfrSectionElement({
        selectables,
      });
    }
  };
  /**
   * Opens the rich text editor for selectable text cells.
   * @param event the ag-grid cell double-click event
   * @returns {boolean} false when the grid should not start inline editing
   */
  const handleSelectableTextCellDoubleClick = (event) => {
    if (event.colDef?.field !== "text" || event.data?.assignment) {
      return true;
    }

    setSelectableTextEditor({
      uuid: event.data.uuid,
      id: event.data.id,
      text: applySelectionFormatting(element.selectables?.[event.data.uuid]?.description || "", element.selectables?.[event.data.uuid]),
    });

    return false;
  };
  /**
   * Closes the selectable rich text editor modal.
   */
  const handleCloseSelectableTextEditor = () => {
    setSelectableTextEditor(null);
  };
  /**
   * Updates selectable text from the rich text editor.
   * @param htmlContent the RTE html content
   */
  const handleSelectableRichTextUpdate = (htmlContent) => {
    if (!selectableTextEditor?.uuid) return;

    updateSelectable(selectableTextEditor.uuid, { description: htmlContent, ...getSelectionFormatting() });
    setSelectableTextEditor((current) => (current ? { ...current, text: htmlContent } : current));
  };
  /**
   * Handles the collapse inner table section
   */
  const handleCollapseInnerTableSection = () => {
    setCollapseInnerTableSection(!collapseInnerTableSection);
  };

  // Helper Methods
  /**
   * Generates the row data
   */
  const generateRowData = () => {
    try {
      if (element && element.hasOwnProperty("selectables") && Object.entries(element.selectables).length > 0) {
        let updatedRows = [];
        Object.entries(element.selectables).forEach(([key, value]) => {
          const { id, notSelectable, exclusive } = value;
          const description = value.assignment ? value.description : applySelectionFormatting(value.description, value);
          let row = {
            uuid: key,
            id: id ? id : "",
            text: getTableText({ ...value, description }),
            assignment: value.assignment || false,
            notSelectable: notSelectable || false,
            exclusive: exclusive || false,
          };
          updatedRows.push(row);
        });
        if (JSON.stringify(updatedRows) !== JSON.stringify(rowData)) {
          setRowData(updatedRows);
        }
      } else {
        setRowData([]);
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Gets the table text
   * @param value the value
   * @returns {string|React.JSX.Element|React.JSX.Element[]|*|string}
   */
  const getTableText = (value) => {
    const escapedContent = removeTagEqualities(value.description, false);

    try {
      if (value.assignment && value.assignment === true) {
        return `<strong>assignment</strong>: ${escapedContent}`;
      } else {
        return escapedContent;
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Update the selectable
   * @param selectableUUID the selectable UUID
   * @param itemMap the item map
   */
  const updateSelectable = (selectableUUID, itemMap) => {
    dispatch(
      UPDATE_SFR_SECTION_ELEMENT_SELECTABLE({
        sfrUUID: sfrUUID,
        componentUUID: componentUUID,
        elementUUID: elementUUID,
        selectableUUID: selectableUUID,
        itemMap: itemMap,
      })
    );
  };

  // Components
  /**
   * The selectable card section
   * @returns {*[]|null}
   */
  const getSelectableCard = () => {
    return element && element.selectableGroups && Object.keys(element.selectableGroups).length > 0
      ? Object.entries(element.selectableGroups).map(([key, value]) => {
          return (
            <div key={`${key}-selectables-card`} className='mb-2 mx-[-16px]'>
              {value.hasOwnProperty("groups") ? (
                <SfrSelectionGroupCard id={key} styling={props.styling} handleUpdateID={handleSelectableGroupIDUpdate} />
              ) : (
                <div>
                  {value.hasOwnProperty("description") && (
                    <SfrComplexSelectableCard id={key} styling={props.styling} handleUpdateID={handleSelectableGroupIDUpdate} />
                  )}
                </div>
              )}
            </div>
          );
        })
      : null;
  };

  // Return Method
  return (
    <div className='p-2 px-4'>
      <Card className='w-full rounded-lg border-2 border-gray-200'>
        <CardBody className='w-full m-0 p-0 border-b-2 border-gray-200'>
          <div className='w-full border-b-2 border-b-gray-200 p-4 pb-2'>
            <span className='min-w-full inline-flex items-baseline'>
              <div className='w-[1%]'>
                <Tooltip
                  title={`${(!collapse ? "Collapse " : "Expand ") + "Selection Groups"}`}
                  id={(collapse ? "collapse" : "expand") + "SelectionGroupsTooltip"}>
                  <IconButton
                    sx={{ marginTop: "-12px" }}
                    onClick={() => {
                      setCollapse(!collapse);
                      if (!collapse) {
                        setCollapseInnerTableSection(false);
                      }
                    }}
                    key={"SelectionGroupsToolTip"}
                    variant='contained'>
                    {!collapse ? (
                      <RemoveIcon htmlColor={styling.primaryColor} sx={icons.large} />
                    ) : (
                      <AddIcon htmlColor={styling.primaryColor} sx={icons.large} />
                    )}
                  </IconButton>
                </Tooltip>
              </div>
              <div className='w-[95%] justify-items-center'>
                <label style={{ color: styling.primaryColor }} className={`resize-none font-bold text-[14px] p-0 mt-1`}>
                  Selection Group
                </label>
              </div>
            </span>
          </div>
          {!collapse && (
            <div className='py-2 w-full'>
              <div className='m-0 p-0 px-4 mt-2 w-full max-w-6xl mb-[-8px]'>
                <div className='relative'>
                  <EditableTable
                    title={
                      <Tooltip id={"groupsItemListTooltip"} arrow>
                        <label style={{ color: styling.secondaryColor }}>Item List</label>
                      </Tooltip>
                    }
                    editable={EDITABLE_CONFIG}
                    columnData={COLUMN_DATA}
                    rowData={rowData}
                    handleCheckboxClick={handleSelectableCheckboxSelection}
                    handleUpdateTableRow={handleIdTextUpdate}
                    handleCellDoubleClick={handleSelectableTextCellDoubleClick}
                    handleDeleteTableRows={handleDeleteSelectable}
                    handleCollapseInnerTableSection={handleCollapseInnerTableSection}
                    bottomBorderCss={collapseInnerTableSection ? "rounded-b-[0px] shadow-none" : ""}
                    styling={props.styling}
                    requirementType={props.requirementType}
                    tableInstructions={`This section houses all pre-defined selections and assignments 
                                                            to be used in the Selectables section below.`}
                  />
                </div>
                {collapseInnerTableSection && (
                  <div className='relative border-2 border-t-0 rounded-b-md border-[#d0d5db] m-0 pt-6 pb-2' style={{ top: "-20px" }}>
                    <div className='p-2 px-4'>
                      <SelectableItemAddForm
                        element={element}
                        selectedSfrElement={selectedSfrElement}
                        sfrSections={sfrSections}
                        ppShortName={ppShortName}
                        styling={styling}
                        icons={icons}
                        lightGray={lightGray}
                        onSubmit={handleNewSelectableSubmit}
                      />
                    </div>
                  </div>
                )}
              </div>
              <CardTemplate
                type={"section"}
                header={
                  <Tooltip
                    id={"selectablesDescriptionTooltip"}
                    title={`This section allows a user to either create groups or complex 
                                             selectables based on the selectables and assignments that have 
                                             been constructed above.`}
                    arrow>
                    <label style={{ color: styling.secondaryColor }} className='resize-none font-bold text-[14px] p-0 pr-4'>
                      Selectables
                    </label>
                  </Tooltip>
                }
                body={
                  <div className='m-0 p-0 mt-[-8px]'>
                    <div className='w-full'>{getSelectableCard()}</div>
                    <div className='border-t-2 border-gray-200 m-0 p-0 pt-4 mx-[-16px]'>
                      <div className='px-4 pt-0 pb-2'>
                        <span className='min-w-full inline-flex items-baseline'>
                          <div className='w-[26%]'>
                            <FormControl fullWidth color={styling.secondaryTextField}>
                              <InputLabel key='element-select-label'>Selectable Type</InputLabel>
                              <Select
                                value={selectableGroupType}
                                label='Selectable Type'
                                autoWidth
                                onChange={handleSetSelectableGroupType}
                                sx={{ textAlign: "left" }}>
                                <MenuItem sx={styling.primaryMenu} key={"Complex Selectable"} value={"Complex Selectable"}>
                                  Complex Selectable
                                </MenuItem>
                                <MenuItem sx={styling.primaryMenu} key={"Selectable Group"} value={"Selectable Group"}>
                                  Selectable Group
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </div>
                          <div className='w-[68%] pl-2'>
                            {selectableGroupType === "Complex Selectable" ? (
                              <div>
                                <FormControl fullWidth>
                                  <Tooltip id={complexSelectableID + "UserDefinedIDTooltip"} title={"User-defined ID for the new complex selectable."} arrow>
                                    <TextField
                                      required
                                      color={styling.secondaryTextField}
                                      label='Complex Selectable ID'
                                      value={complexSelectableID}
                                      onChange={handleComplexSelectableID}
                                    />
                                  </Tooltip>
                                </FormControl>
                              </div>
                            ) : (
                              <div>
                                <FormControl fullWidth>
                                  <Tooltip id={selectableGroupID + "SfrGroupIDTooltip"} title={"User-defined ID for the new group."} arrow>
                                    <TextField
                                      required
                                      color={styling.secondaryTextField}
                                      label='SFR Group ID'
                                      value={selectableGroupID}
                                      onChange={handleSelectableGroupID}
                                    />
                                  </Tooltip>
                                </FormControl>
                              </div>
                            )}
                          </div>
                          <div className='w-[6%]'>
                            <Tooltip title={"Add Selectable Group"} id={"addSelectableGroupTooltip"}>
                              <span>
                                <IconButton
                                  sx={{ marginBottom: "-36px" }}
                                  disabled={selectableGroupDisabled}
                                  onClick={handleNewSelectableGroupSubmit}
                                  variant='contained'>
                                  <AddCircleIcon htmlColor={selectableGroupDisabled ? lightGray : styling.secondaryColor} sx={icons.medium} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>
      <DependencyDeleteWarning
        itemLabel={dependencyDeleteWarning?.itemLabel || "selectable"}
        open={Boolean(dependencyDeleteWarning)}
        handleOpen={handleCloseDependencyDeleteWarning}
        handleSubmit={handleSubmitDependencyDeleteWarning}
        usage={dependencyDeleteWarning?.usage}
      />
      <Modal
        title={`Edit Selectable Text${selectableTextEditor?.id ? ` (${selectableTextEditor.id})` : ""}`}
        content={
          selectableTextEditor ? (
            <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
              <TipTapEditor
                key={selectableTextEditor.uuid}
                className='w-full'
                text={selectableTextEditor.text || ""}
                contentType={"editor"}
                handleTextUpdate={handleSelectableRichTextUpdate}
              />
            </div>
          ) : (
            <div></div>
          )
        }
        hideSubmit={true}
        closeButtonText={"Done"}
        open={Boolean(selectableTextEditor)}
        handleOpen={handleCloseSelectableTextEditor}
      />
    </div>
  );
}

// Export SfrSelectionGroups.jsx
export default SfrSelectionGroups;
