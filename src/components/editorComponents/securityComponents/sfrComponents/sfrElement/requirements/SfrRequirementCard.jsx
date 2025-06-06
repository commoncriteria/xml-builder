// Imports
import PropTypes from "prop-types";
import Delta from "quill-delta";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { removeTagEqualities } from "../../../../../../utils/fileParser.js";
import {
  getElementValuesByType,
  getTabularizeDefinitionString,
  handleCryptoUpdate,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  showManagementFunctionPreview,
  showTabularizeTablePreview,
  updateManagementFunctionItems,
  updateSfrSectionElement,
} from "../../../../../../utils/securityComponents.jsx";
import { getSfrPreviewTextString } from "../../../../../../utils/sfrPreview.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import TipTapEditor from "../../../../TipTapEditor.jsx";
import ToggleSwitch from "../../../../../ToggleSwitch.jsx";

/**
 * The SfrRequirementCard class that displays the requirement card
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrRequirementCard(props) {
  // Prop Validation
  SfrRequirementCard.propTypes = {
    requirementType: PropTypes.string.isRequired,
    styling: PropTypes.object.isRequired,
    cryptoColumnName: PropTypes.string,
  };

  // Constants
  const { icons } = useSelector((state) => state.styling);
  const sfrWorksheetUI = useSelector((state) => state.sfrWorksheetUI);
  const { elementUUID, component, element, selectedSfrElement, selectablesMap, managementFunctionUI, tabularizeUI } = sfrWorksheetUI;
  const { managementFunctions } = element;
  const { rowIndex, textArray } = managementFunctionUI;
  const { row, selectedColumn } = tabularizeUI;
  const [title, setTitle] = useState("Requirement");
  const [description, setDescription] = useState("requirement");
  const [isTitleAndFcs, setIsTitleAndFcs] = useState(false);
  const [additionalDescription, setAdditionalDescription] = useState(", crypto selection table");
  const [previewToggle, setPreviewToggle] = useState(false);
  const [selectedRequirementType, setSelectedRequirementType] = useState("Additional Text");
  const requirementMenu = ["Additional Text", "Assignment", "Crypto Selection Table", "Description", "Selection Group"];
  const { styling } = props;

  // Use Effects
  useEffect(() => {
    handleProps(props);
  }, [selectedSfrElement, props.requirementType]);

  // Methods
  /**
   * Handles the props
   */
  const handleProps = () => {
    const { requirementType } = props;

    // Update if requirement is a title and is of the FCS family
    const titleAndFcs = requirementType === "title" && selectedSfrElement.toLowerCase().includes("fcs");
    setIsTitleAndFcs(titleAndFcs);

    // Update title, description and additional description
    if (requirementType === "title" || requirementType === "crypto") {
      setTitle(requirementType === "title" ? "Requirement" : `Column Text`);
      setDescription("requirement");
      setAdditionalDescription(titleAndFcs ? ", crypto selection table" : "");
    } else if (requirementType === "managementFunctions") {
      setTitle("Management Function Text");
      setDescription("management function");
      setAdditionalDescription("");
    }
  };
  /**
   * Handles the select requirement type
   * @param selected the selected
   */
  const handleSetSelectedRequirementType = (selected) => {
    if (JSON.stringify(selected) !== JSON.stringify(selectedRequirementType)) {
      setSelectedRequirementType(selected);
    }
  };
  /**
   * Handles the preview toggle
   * @param event the event
   */
  const handlePreviewToggle = (event) => {
    setPreviewToggle(event.target.checked);
  };
  /**
   * Handles adding a new requirement
   */
  const handleAddNewRequirement = () => {
    // Check for selected requirement type
    if (selectedRequirementType !== "") {
      let section;

      // Generate requirement by selected type
      switch (selectedRequirementType) {
        case "Additional Text": {
          section = { text: "" };
          break;
        }
        case "Assignment": {
          section = { assignment: "" };
          break;
        }
        case "Description": {
          section = { description: "" };
          break;
        }
        case "Selection Group": {
          section = { selections: "" };
          break;
        }
        case "Crypto Selection Table": {
          if (isTitleAndFcs) {
            section = { tabularize: "" };
          }
          break;
        }
        default:
          break;
      }

      // Add values by requirement type
      if (section) {
        const updateMap = {
          updateType: "add",
          key: selectedColumn,
          value: section,
          definitionType: "selectcol",
        };
        updateRequirementByType(updateMap);

        // Update requirement change and type
        handleSetSelectedRequirementType("");

        // Update snackbar
        handleSnackBarSuccess(`${selectedRequirementType} Item Successfully Added`);
      }
    }
  };
  /**
   * Handles updating the fields
   * @param event the event
   * @param uuid the uuid
   * @param index the index
   * @param updateType the update type
   */
  const handleUpdateFields = (event, uuid, index, updateType) => {
    const { requirementType, cryptoColumnName } = props;

    // Update value
    let value;
    if (requirementType === "title" && component.elements[uuid].title) {
      value = deepCopy(component.elements[uuid].title);
    } else if (requirementType === "managementFunctions") {
      value = deepCopy(textArray);
    } else if (requirementType === "crypto") {
      value = deepCopy(row[cryptoColumnName]);
    } else {
      value = [];
    }

    // Handle updates by update type
    if (updateType === "add") {
      value.push(event);
    } else if (updateType === "update") {
      value[index] = event;
    } else if (updateType === "delete") {
      value.splice(index, 1);
    }

    // Update values by requirement type
    const updateMap = {
      updateType: "update",
      key: selectedColumn,
      value: value,
      definitionType: "selectcol",
    };
    updateRequirementByType(updateMap);
  };
  /**
   * Handles deleting a requirement item
   * @param elementUUID the element UUID
   * @param index the index
   */
  const handleDeleteRequirementItem = (elementUUID, index) => {
    // Delete values by requirement type
    const updateMap = {
      updateType: "delete",
      key: selectedColumn,
      index: index,
      definitionType: "selectcol",
    };
    updateRequirementByType(updateMap);

    // Update requirement change and type
    handleSetSelectedRequirementType("");

    // Update snackbar
    handleSnackBarSuccess("Item Successfully Removed");
  };
  /**
   * Handles an assignement selection
   * @param event the event
   * @param elementUUID the element uuid
   * @param index the index
   */
  const handleAssignmentSelection = (event, elementUUID, index) => {
    const name = event.target.value;
    const uuid = selectablesMap.nameMap.assignments[name];

    // Update assignment by requirement type
    const updateMap = {
      updateType: "update",
      key: selectedColumn,
      value: {
        assignment: uuid ? uuid : "",
      },
      index: index,
      definitionType: "selectcol",
    };
    updateRequirementByType(updateMap);
  };
  /**
   * Handles the tabularize selection
   * @param event the event
   * @param elementUUID the element UUID
   * @param index the index
   */
  const handleTabularizeSelection = (event, elementUUID, index) => {
    // Check if the type is title and of the fcs family
    if (isTitleAndFcs) {
      const uuid = event.target.value;

      // Update tabularize
      const updateMap = {
        updateType: "update",
        value: {
          tabularize: uuid ? uuid : "",
        },
        index: index,
      };
      handleTitleUpdate(updateMap);
    }
  };
  /**
   * Handles the selectables selection
   * @param event the event
   * @param elementUUID the element UUID
   * @param index the index
   */
  const handleSelectablesSelection = (event, elementUUID, index) => {
    const name = event.target.value;
    const selections = { selections: name };

    // Update selections by requirement type
    const updateMap = {
      updateType: "update",
      key: selectedColumn,
      value: selections,
      index: index,
      definitionType: "selectcol",
    };
    updateRequirementByType(updateMap);
  };
  /**
   * Handles the title update
   * @param updateMap the update map
   */
  const handleTitleUpdate = (updateMap) => {
    const { updateType, value, index } = updateMap;
    const originalTitle = deepCopy(component.elements[elementUUID].title);
    let title = deepCopy(component.elements[elementUUID].title);

    // Set item map by type
    switch (updateType) {
      case "add": {
        title.push(value);
        break;
      }
      case "update": {
        if (index) {
          title[index] = value;
        } else {
          title = value;
        }
        break;
      }
      case "delete": {
        title.splice(index, 1);
        break;
      }
      default:
        break;
    }

    // Update the title if it has not changed
    if (JSON.stringify(originalTitle) !== JSON.stringify(title)) {
      // Update title
      const itemMap = {
        title: title,
      };
      updateSfrSectionElement(itemMap);
    }
  };
  /**
   * Handles a management function update
   * @param updateMap the update map
   */
  const handleManagementFunctionUpdate = (updateMap) => {
    const { updateType, value, index } = updateMap;
    let textArrayCopy = deepCopy(textArray);

    // Set management function by type
    switch (updateType) {
      case "add": {
        textArrayCopy.push(value);
        break;
      }
      case "update": {
        if (index) {
          textArrayCopy[index] = value;
        } else {
          textArrayCopy = value;
        }
        break;
      }
      case "delete": {
        textArrayCopy.splice(index, 1);
        break;
      }
      default:
        break;
    }

    // Update management function
    updateManagementFunctionItems(
      {
        value: textArrayCopy,
        rowIndex,
        type: "textArray",
      },
      managementFunctions,
      true
    );

    // Update snackbar
    if (updateType === "add" || updateType === "delete") {
      const message = updateType === "add" ? "Management Function Item Successfully Added" : "Management Function Item Successfully Removed";
      handleSnackBarSuccess(message);
    }
  };

  // Helper Methods
  /**
   * Updates the requirement type
   * @param updateMap the update map
   */
  const updateRequirementByType = (updateMap) => {
    const { requirementType } = props;

    // Update values by requirement type
    if (requirementType === "title") {
      handleTitleUpdate(updateMap);
    } else if (requirementType === "managementFunctions") {
      handleManagementFunctionUpdate(updateMap);
    } else if (requirementType === "crypto") {
      handleCryptoUpdate(updateMap);
    }
  };

  // Components
  /**
   * Gets the requirements body section
   * @returns {JSX.Element}
   */
  const getRequirementBody = () => {
    try {
      const { requirementType, cryptoColumnName } = props;
      let section = [];

      // Get section
      if (requirementType === "title") {
        section = deepCopy(getElementValuesByType(element, "title"));
      } else if (requirementType === "managementFunctions") {
        section = deepCopy(textArray);
      } else if (requirementType === "crypto") {
        section = deepCopy(row[cryptoColumnName]);
      }

      // Get requirements body
      if (section && elementUUID) {
        return (
          <div className='p-0 m-0 mb-1'>
            {section && Object.keys(section).length > 0 && (
              <div className='mt-[-12px] mb-[-4px]'>{section?.map((item, index) => getRequirementModalSection(item, index, elementUUID, section))}</div>
            )}
          </div>
        );
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Gets the requirements modal section
   * @param item the item
   * @param index the index
   * @param elementUUID the element UUID
   * @param parent the paremt
   * @returns {JSX.Element}
   */
  const getRequirementModalSection = (item, index, elementUUID, parent) => {
    const entry = Object.entries(item)[0];
    const key = entry[0];
    const value = entry[1];
    const capitalizedKey = key !== "text" ? key.charAt(0).toUpperCase() + key.slice(1) : "Additional Text";

    return (
      <div key={`${key}-${index}`} className='w-full'>
        <div className='w-full p-0 border-0 grid grid-flow-col columns-1'>
          <span className='w-full inline-flex items-baseline'>
            <div className={`w-[100%] pb-2`}>{getCurrentSection(key, elementUUID, value, index, parent)}</div>
            <div className='pl-2'>
              <IconButton
                sx={{ marginBottom: key === "description" ? "-36px" : "-32px" }}
                onClick={() => {
                  handleDeleteRequirementItem(elementUUID, index);
                }}
                variant='contained'>
                <Tooltip title={"Delete " + capitalizedKey} id={"delete" + capitalizedKey + "Tooltip"}>
                  <DeleteForeverRoundedIcon htmlColor={styling.secondaryColor} sx={icons.large} />
                </Tooltip>
              </IconButton>
            </div>
          </span>
        </div>
      </div>
    );
  };
  /**
   * Gets the current section
   * @param type the type
   * @param uuid the uuid
   * @param value the value
   * @param index the index
   * @param currentSection the current section
   * @returns {false|JSX.Element|null}
   */
  const getCurrentSection = (type, uuid, value, index, currentSection) => {
    if (selectedSfrElement && selectedSfrElement !== "") {
      let style = {
        marginTop: index === 0 ? 12 : 4,
        marginBottom: 2,
      };

      switch (type) {
        case "description": {
          let delta = typeof value === "string" ? value : new Delta(value);
          const style = `w-full mb-[-4px] ${index === 0 ? " pt-2" : ""}`;

          return (
            <div className={style} key={`element-title-section-${uuid}-${index}-${type}`}>
              <TipTapEditor text={delta} contentType={"requirement"} elementData={{ uuid: uuid, index: index }} handleTextUpdate={handleUpdateFields} />
            </div>
          );
        }
        case "selections": {
          let selectable = currentSection[index].selections ? currentSection[index].selections : "";
          let selectables = deepCopy(selectablesMap.dropdownOptions);
          let selectionOptions = [...new Set([...selectables.groups, ...selectables.complexSelectables])];

          return (
            <div style={style} key={`element-title-section-${uuid}-${index}-${type}`}>
              <FormControl fullWidth color={styling.secondaryTextField}>
                <InputLabel key='selectables-requirement-label'>Select Selectables</InputLabel>
                <Select
                  value={selectable ? selectable : ""}
                  label='Select Selectables'
                  autoWidth
                  onChange={(event) => {
                    handleSelectablesSelection(event, uuid, index);
                  }}
                  sx={{ textAlign: "left" }}>
                  {selectionOptions.map((value) => getMenuItems(value, styling.primaryMenu))}
                </Select>
              </FormControl>
            </div>
          );
        }
        case "text": {
          return (
            <div style={style} key={`element-title-section-${uuid}-${index}-${type}`}>
              <FormControl fullWidth>
                <TextField
                  color={styling.secondaryTextField}
                  key={value}
                  label={"Additional Text"}
                  defaultValue={value}
                  onBlur={(event) => {
                    let update = { text: event.target.value };
                    handleSnackbarTextUpdates(handleUpdateFields, update, uuid, index, "update");
                  }}
                />
              </FormControl>
            </div>
          );
        }
        case "assignment": {
          const options = deepCopy(selectablesMap);
          let assignmentOptions = options.dropdownOptions.assignments;
          let assignmentValue = options.uuidMap.assignments[value];

          return (
            <div style={style} key={`element-title-section-${uuid}-${index}-${type}`}>
              <FormControl fullWidth required color={styling.secondaryTextField}>
                <InputLabel id={`assignment-label-${uuid}-${index}`}>Assignment</InputLabel>
                <Select
                  value={assignmentValue ? assignmentValue : ""}
                  label='Assignment'
                  autoWidth
                  onChange={(event) => {
                    handleAssignmentSelection(event, uuid, index);
                  }}
                  sx={{ textAlign: "left" }}>
                  {assignmentOptions.map((value) => getMenuItems(value, styling.primaryMenu))}
                </Select>
              </FormControl>
            </div>
          );
        }
        case "tabularize": {
          const tabularizeItems = deepCopy(getElementValuesByType(element, "tabularize"));

          return (
            isTitleAndFcs && (
              <div style={style} key={`tabularize-title-section-${uuid}-${index}-${type}`}>
                <FormControl fullWidth required color={styling.secondaryTextField}>
                  <InputLabel id={`tabularize-label-${uuid}-${index}`}>Crypto Selection Table</InputLabel>
                  <Select
                    value={value}
                    label='Crypto Selection Table'
                    autoWidth
                    onChange={(event) => {
                      handleTabularizeSelection(event, uuid, index);
                    }}
                    sx={{
                      textAlign: "left",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                    }}>
                    {Object.entries(tabularizeItems).map(([tabularizeUUID, item]) => {
                      let title = `${item.title} (${item.id})`;

                      return (
                        <MenuItem
                          sx={{
                            ...styling.primaryMenu,
                            fontSize: "13px",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          }}
                          key={tabularizeUUID}
                          value={tabularizeUUID}>
                          {title}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            )
          );
        }
        default:
          return null;
      }
    }
  };
  /**
   * The show title preview section
   * @param previewToggle the preview title
   * @returns {*|JSX.Element}
   */
  const showTitlePreview = (previewToggle) => {
    const { requirementType, cryptoColumnName } = props;

    if (requirementType === "title") {
      let section = "";

      try {
        if (previewToggle && element) {
          const { selectables, selectableGroups, title, tabularize } = element;

          let newTabularize = {};
          if (tabularize && Object.keys(tabularize.length > 0)) {
            Object.entries(tabularize).forEach(([key, value]) => {
              const { definition } = value;
              const definitionString = getTabularizeDefinitionString(definition);

              // Add to new tabularize object
              newTabularize[key] = {
                ...value,
                definitionString: definitionString,
              };
            });
          }

          section = getSfrPreviewTextString({
            selectables: selectables ? deepCopy(selectables) : {},
            selectableGroups: selectableGroups ? deepCopy(selectableGroups) : {},
            currentTextArray: title ? deepCopy(title) : [],
            tabularize: deepCopy(newTabularize),
          });
        }
      } catch (e) {
        console.log(e);
        handleSnackBarError(e);
      }

      // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
      // would be omitted by the RTE due to not knowing how to interpret them)
      return <div className='preview'>{removeTagEqualities(section, true)}</div>;
    } else if (requirementType === "managementFunctions") {
      const textArrayCopy = deepCopy(textArray);

      return showManagementFunctionPreview(previewToggle, textArrayCopy, element);
    } else if (requirementType === "crypto") {
      const textArrayCopy = row[cryptoColumnName] ? deepCopy(row[cryptoColumnName]) : [];

      return showTabularizeTablePreview(previewToggle, textArrayCopy, element);
    }
  };
  /**
   * The get menu items section
   * @param value the value
   * @param styling the styling
   * @returns {JSX.Element}
   */
  const getMenuItems = (value, styling) => {
    if ((value === "Crypto Selection Table" && isTitleAndFcs) || value !== "Crypto Selection Table") {
      return (
        <MenuItem sx={styling} key={value} value={value}>
          {value}
        </MenuItem>
      );
    }
  };

  // Use Memos
  /**
   * The requirements section
   * @type {JSX.Element}
   */
  const getRequirements = useMemo(() => {
    if (!previewToggle) {
      return getRequirementBody();
    }
  }, [previewToggle, isTitleAndFcs, sfrWorksheetUI]);

  // Return Method
  return (
    <div className='min-w-full'>
      <CardTemplate
        type={"section"}
        header={
          <div className='w-full p-0 m-0 my-[-6px]'>
            <span className='flex justify-stretch min-w-full'>
              <div className='flex justify-center w-full pl-4'>
                <Tooltip
                  id={"requirementDescriptionTooltip"}
                  title={`This is the primary section for the definition of the ${description} text. This section 
                                            consists of descriptive text, complex selections, selections, selection groups 
                                            ${additionalDescription} and assignments.`}
                  arrow>
                  <label style={{ color: styling.primaryColor }} className='resize-none font-bold text-[14px] pr-6 mt-[8px]'>
                    {title}
                  </label>
                </Tooltip>
              </div>
              <ToggleSwitch
                title={"Preview"}
                isToggled={previewToggle}
                isSfrWorksheetToggle={false}
                handleUpdateToggle={handlePreviewToggle}
                styling={styling}
                tooltip={
                  <div>
                    {`Toggling this allows a user to see what the fully constructed ${description} 
                                          text will look like when exported. Use this to see what the selection below 
                                          will look like.`}
                    <br />
                    <br />* Note: Results may vary
                  </div>
                }
                tooltipId={"requirementsPreviewToggleTooltip"}
              />
            </span>
          </div>
        }
        body={
          previewToggle ? (
            <div id='requirements-title-preview' className='min-w-full'>
              {showTitlePreview(previewToggle)}
            </div>
          ) : (
            <div className='min-w-full'>
              {getRequirements}
              <div className='border-t-2 border-gray-200 m-0 p-0 pt-2 mx-[-16px]'>
                <div className='p-2 px-4'>
                  <span className='min-w-full inline-flex items-baseline'>
                    <div className='w-[94%]'>
                      <FormControl fullWidth color={styling.primaryTextField}>
                        <InputLabel key='element-requirement-type-select-label'>{`Add to ${title}`}</InputLabel>
                        <Select
                          value={selectedRequirementType}
                          label={`Select ${title}`}
                          autoWidth
                          onChange={(event) => handleSetSelectedRequirementType(event.target.value)}
                          sx={{ textAlign: "left" }}>
                          {requirementMenu.map((requirement) => getMenuItems(requirement, styling.secondaryMenu))}
                        </Select>
                      </FormControl>
                    </div>
                    <div className='w-[6%]'>
                      <IconButton sx={{ marginBottom: "-36px" }} onClick={handleAddNewRequirement} variant='contained'>
                        <Tooltip id='addNewRequirementItemTooltip' title={`This allows a user to add one of several options to the ${description}.`}>
                          <AddCircleIcon htmlColor={styling.primaryColor} sx={icons.medium} />
                        </Tooltip>
                      </IconButton>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}

// Export SfrRequirementCard.jsx
export default SfrRequirementCard;
