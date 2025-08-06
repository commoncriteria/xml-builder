// Imports
import { useEffect, useMemo, useState } from "react";
import { FormControl, TextField, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import RestoreIcon from "@mui/icons-material/Restore";
import useToggle from "../../utils/Hooks/useToggle.js";
import { SET_ACCORDION_PANE_INITIAL_STATE, updateMetaDataItem } from "../../reducers/accordionPaneSlice.js";
import {
  RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE,
  UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY,
} from "../../reducers/compliantTargetsOfEvaluationSlice.js";
import { RESET_CONFORMANCE_CLAIMS_STATE } from "../../reducers/conformanceClaimsSlice.js";
import { SET_EDITORS_INITIAL_STATE } from "../../reducers/editorSlice.js";
import { RESET_PACKAGE_STATE } from "../../reducers/includePackageSlice.js";
import { RESET_SAR_STATE, SET_SARS_INITIAL_STATE } from "../../reducers/sarsSlice.js";
import { RESET_ALL_SFR_OBJECTIVES } from "../../reducers/SFRs/sfrSectionSlice.js";
import { RESET_ALL_THREAT_TERM_OBJECTIVES } from "../../reducers/threatsSlice.js";
import { DELETE_OBJECTIVE_SECTION, GET_OBJECTIVE_UUID_BY_TITLE } from "../../reducers/objectivesSlice.js";
import { deepCopy } from "../../utils/deepCopy.js";
import {
  fetchTemplateData,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  handleSubmitResetDataMenu,
  loadTemplateJson,
} from "../../utils/securityComponents.jsx";
import AccordionContent from "./AccordionContent.jsx";
import CardTemplate from "../editorComponents/securityComponents/CardTemplate.jsx";
import EditableTable from "../editorComponents/EditableTable.jsx";
import MultiSelectDropdown from "../editorComponents/securityComponents/MultiSelectDropdown.jsx";
import SwitchWarning from "../modalComponents/SwitchWarning.jsx";
import ResetDataConfirmation from "../modalComponents/ResetDataConfirmation.jsx";

/**
 * The MetadataSection class that the metadata section of the content pane
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function MetadataSection() {
  // Constants
  const dispatch = useDispatch();
  const currentAccordionPane = useSelector((state) => state.accordionPane);
  const { metadata: metadataSection, sections: accordionSections } = currentAccordionPane;
  const currentEditorSections = useSelector((state) => state.editors);
  const { ppTemplateVersion, ppType } = metadataSection;
  const sars = useSelector((state) => state.sars);
  const columnData = [
    { headerName: "Version", field: "version", editable: true, resizable: true, type: "Number", flex: 1 },
    { headerName: "Date", field: "date", editable: true, resizable: true, type: "Date", flex: 1 },
    { headerName: "Comments", field: "comment", editable: true, resizable: true, type: "Large Editor", flex: 3 },
  ];
  const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true };
  const [openSwitchWarning, handleOpenSwitchWarning] = useToggle(false);
  const [openPPTypeSwitchWarning, handleOpenPPTypeSwitchWarning] = useToggle(false);
  const [openResetDataMenu, setOpenResetDataMenu] = useState(false);
  const [targetPPTemplate, handleTargetPPTemplate] = useState("");
  const [targetPPType, handleTargetPPType] = useState("");
  const isLoading = sessionStorage.getItem("isLoading");
  const isLoadingValid = isLoading === null || isLoading === "false";

  // Use Effects
  useEffect(() => {
    // Check if the ppTemplateVersion has changed
    try {
      convertTemplateData(ppTemplateVersion, ppType, dispatch);
    } catch (e) {
      console.error("Error:", e);
      handleSnackBarError(e);
    }
  }, [dispatch, ppTemplateVersion]);
  useEffect(() => {
    // Check if the ppType has changed
    try {
      convertPPType(ppType);
    } catch (e) {
      console.error("Error:", e);
      handleSnackBarError(e);
    }
  }, [dispatch, ppType]);

  // Methods
  /**
   * Handles updates by type
   * @param type the type
   * @param event the event as a DOM handler
   */
  const handleUpdates = (type, event) => {
    let item;
    switch (type) {
      case "Select PP Template Version": {
        item = targetPPTemplate;
        type = "ppTemplateVersion";
        break;
      }
      case "Select PP Type": {
        item = targetPPType;
        type = "ppType";
        break;
      }
      case "ppName": {
        item = event.target.value;
        break;
      }
      case "version": {
        item = event.target.value;
        break;
      }
      case "releaseDate": {
        item = event.target.value;
        break;
      }
      case "open": {
        item = !metadataSection.open.valueOf();
        break;
      }
      default:
        break;
    }

    // Update metadata
    dispatch(
      updateMetaDataItem({
        type,
        item,
      })
    );
  };
  /**
   * Handles the pp template select
   * @param type the type
   * @param selection the selection
   */
  const handlePPTemplateSelect = (type, selection) => {
    handleTargetPPTemplate(selection && selection ? selection[0] : "CC2022 Standard");
    handleOpenSwitchWarning();
  };
  /**
   * Handles the pp type select
   * @param type the type
   * @param selection the selection
   */
  const handlePPTypeSelect = (type, selection) => {
    handleTargetPPType(selection && selection ? selection[0] : "Protection Profile");
    handleOpenPPTypeSwitchWarning();
  };
  /**
   * Handles the close warning
   * @param type the type
   * @param selection the selection
   */
  const handleCloseWarning = (type, selection) => {
    handleUpdates(type, selection);
    handleSnackBarSuccess(type === "Select PP Type" ? "PP Type Successfully Switched" : "PP Template Successfully Switched");

    // Close modal
    if (type === "Select PP Type") {
      handleOpenPPTypeSwitchWarning();
    } else {
      handleOpenSwitchWarning();
    }
  };
  /**
   * Handles adding a new table row
   */
  const handleNewTableRow = () => {
    const type = "revisionHistory";
    let revisionHistory = metadataSection.revisionHistory ? deepCopy(metadataSection.revisionHistory) : [];

    // Add to revision history
    revisionHistory.push({
      version: "",
      date: "",
      comment: "",
    });

    // Update metadata
    dispatch(
      updateMetaDataItem({
        type,
        item: revisionHistory,
      })
    );
  };
  /**
   * Hnaldes updating the table row
   * @param updatedRow the updated row
   */
  const handleUpdateTableRow = (updatedRow) => {
    const type = "revisionHistory";
    const { version, date, comment, index } = updatedRow.data;
    let revisionHistory = metadataSection.revisionHistory ? deepCopy(metadataSection.revisionHistory) : [];

    if (revisionHistory[index]) {
      // Update revision history index
      revisionHistory[index] = {
        version,
        date: date && date !== "" ? date : "",
        comment,
      };

      // Update metadata
      dispatch(
        updateMetaDataItem({
          type,
          item: revisionHistory,
        })
      );
    }
  };
  /**
   * Handles deleting the table rows
   * @param updatedRows
   */
  const handleDeleteTableRows = (updatedRows) => {
    if (updatedRows) {
      const type = "revisionHistory";
      dispatch(
        updateMetaDataItem({
          type,
          item: updatedRows,
        })
      );
    }
  };
  /**
   * Handles opening the reset data menu
   */
  const handleOpenResetDataMenu = () => {
    setOpenResetDataMenu(!openResetDataMenu);
  };

  // Helper Methods
  /**
   * Depending on the inputs and outputs of the conversion, generate an overview of diffs
   * @param type the switch type
   * @returns {string}
   */
  const generateDiffs = (type) => {
    if (type === "ppType") {
      return `The conversion of ${metadataSection.ppType} to ${targetPPType} will result in irreversible changes due to inserted boilerplate`;
    } else if (type === "ppTemplateVersion") {
      return `The conversion of ${metadataSection.ppTemplateVersion} to ${targetPPTemplate} will result in irreversible changes due to inserted boilerplate`;
    } else {
      return "";
    }
  };
  /**
   * Generates the metadata table values
   * @returns {unknown[] | undefined}
   */
  const generateMetaDataTableValues = () => {
    return metadataSection.revisionHistory?.map((revision, index) => {
      const { version, date, comment } = revision;
      return {
        version,
        date,
        comment,
        index,
      };
    });
  };
  /**
   * Gets the pp template filtered menu options
   * @param ppTemplateVersion the pp template version
   * @returns {[{disabled: boolean, label: string},{disabled: boolean, label: string},{disabled: boolean, label: string}]}
   */
  const getPPTemplateFilteredMenuOptions = (ppTemplateVersion) => {
    let ppTemplateVersionOptions = [
      { label: "CC2022 Direct Rationale", disabled: false },
      { label: "CC2022 Standard", disabled: false },
      { label: "Version 3.1", disabled: false },
    ];

    if (ppTemplateVersion === "CC2022 Standard") {
      ppTemplateVersionOptions[2].disabled = true;
    } else if (ppTemplateVersion === "CC2022 Direct Rationale") {
      ppTemplateVersionOptions[1].disabled = true;
      ppTemplateVersionOptions[2].disabled = true;
    }

    return ppTemplateVersionOptions;
  };
  /**
   * Gets the pp type filtered menu options
   * @param ppType the pp type
   * @returns {[{disabled: boolean, label: string},{disabled: boolean, label: string},{disabled: boolean, label: string}]}
   */
  const getPPTypeFilteredMenuOptions = (ppType) => {
    const ppTypeOptions = [
      { label: "Functional Package", disabled: false },
      { label: "Module", disabled: false },
      { label: "Protection Profile", disabled: false },
    ];

    if (ppType === "Functional Package") {
      ppTypeOptions.forEach((option) => {
        if (option.label !== "Functional Package") {
          option.disabled = true;
        }
      });
    } else if (ppType === "Module") {
      ppTypeOptions.forEach((option) => {
        if (option.label !== "Module") {
          option.disabled = true;
        }
      });
    }

    return ppTypeOptions;
  };
  /**
   * Converts the pp template version
   * @param ppTemplateVersion the pp template version
   * @param ppType the pp type
   */
  const convertTemplateData = (ppTemplateVersion, ppType) => {
    // Retrieve the last known version from local storage
    const storedVersion = sessionStorage.getItem("ppTemplateVersion");

    // Check if the ppTemplateVersion has changed
    if (ppTemplateVersion && ppTemplateVersion !== storedVersion && isLoadingValid) {
      try {
        switch (storedVersion) {
          case "CC2022 Standard":
            if (ppTemplateVersion === "CC2022 Direct Rationale") {
              convertStandardToDirectRationale();
            }
            break;
          case "Version 3.1":
            if (ppTemplateVersion === "CC2022 Direct Rationale" || ppTemplateVersion === "CC2022 Standard") {
              convertFromVersion3_1(ppTemplateVersion, ppType);
            }
            break;
          default:
            fetchTemplateData({
              version: ppTemplateVersion,
              type: ppType,
              base: false,
            }).then();
            break;
        }
      } catch (e) {
        console.log(e);
        handleSnackBarError(e);
      }
    }
  };
  /**
   * Converts from version 3.1
   * @param ppTemplateVersion the pp template version
   * @param ppType the pp type
   */
  const convertFromVersion3_1 = (ppTemplateVersion, ppType) => {
    try {
      loadTemplateJson({
        version: ppTemplateVersion,
        type: ppType,
        base: false,
      })
        .then((data) => {
          let originalAccordionPane = deepCopy(currentAccordionPane);
          let originalEditors = deepCopy(currentEditorSections);
          let originalSars = deepCopy(sars);

          // Convert conformance claims
          convertConformanceClaims(originalAccordionPane, originalEditors, data);

          // Convert SARS for CC2022 Standard
          const newSars = convertSars(originalAccordionPane, originalEditors, originalSars, data);

          return { originalAccordionPane, originalEditors, newSars };
        })
        .then(({ originalAccordionPane, originalEditors, newSars }) => {
          // Convert objectives if the ppTemplateVersion is "CC2022 Direct Rationale"
          if (ppTemplateVersion === "CC2022 Direct Rationale") {
            convertObjectives(originalAccordionPane);
          }

          // Set the editors to reflect the updated sections
          if (originalEditors) {
            dispatch(SET_EDITORS_INITIAL_STATE(originalEditors));
          }

          // Update SARS section if newSars is provided
          if (newSars) {
            dispatch(SET_SARS_INITIAL_STATE(newSars));
          }

          // Set the accordion pane to reflect the updated sections
          if (originalAccordionPane) {
            dispatch(SET_ACCORDION_PANE_INITIAL_STATE(originalAccordionPane));
          }
        });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    } finally {
      sessionStorage.setItem("ppTemplateVersion", ppTemplateVersion);
    }
  };
  /**
   * Converts CC2022 standard to CC2022 direct rationale
   */
  const convertStandardToDirectRationale = () => {
    try {
      let originalAccordionPane = deepCopy(currentAccordionPane);

      // Convert objectives
      convertObjectives(originalAccordionPane);

      // Set the accordion pane to reflect the updated sections
      if (originalAccordionPane) {
        dispatch(SET_ACCORDION_PANE_INITIAL_STATE(originalAccordionPane));
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    } finally {
      sessionStorage.setItem("ppTemplateVersion", ppTemplateVersion);
    }
  };
  /**
   * Converts conformance claims
   * @param originalAccordionPane the original accordion pane
   * @param currentEditorSections the current editor sections
   * @param data the accordion pane data
   */
  const convertConformanceClaims = (originalAccordionPane, currentEditorSections, data) => {
    const { accordionPane } = data;
    const { sections: standardSections } = accordionPane;
    const [originalUUID, originalClaim] = getSectionByTitle(accordionSections, "Conformance Claims");
    const newClaim = getSectionByTitle(standardSections, "Conformance Claims")[1];
    const { formItems } = originalClaim;

    // Convert conformance claim to new version
    if (originalAccordionPane.hasOwnProperty("sections") && originalAccordionPane.sections.hasOwnProperty(originalUUID)) {
      originalAccordionPane.sections[originalUUID] = newClaim;

      // Reset the conformance claims state
      dispatch(RESET_CONFORMANCE_CLAIMS_STATE());
    }

    // Delete conformance claim associated editors
    if (formItems) {
      formItems
        .filter((item) => item.contentType === "editor")
        .map((item) => item.uuid)
        .forEach((uuid) => {
          if (currentEditorSections.hasOwnProperty(uuid)) {
            delete currentEditorSections[uuid];
          }
        });
    }
  };
  /**
   * Converts sars
   * @param originalAccordionPane the original accordion pane
   * @param originalEditor the original editor
   * @param originalSars the original sars
   * @param data the data
   * @returns {*}
   */
  const convertSars = (originalAccordionPane, originalEditor, originalSars, data) => {
    // Extract original data
    const { components: originalComponents, elements: originalElements } = originalSars;
    const { sections: originalSections } = originalAccordionPane;
    const originalRequirements = getSectionByTitle(originalSections, "Security Requirements")[1];
    const { formItems: originalFormItems } = originalRequirements;

    // Extract new data
    const { accordionPane: newAccordionPane, sars: newSars, editors: newEditors } = data;
    const { components: newComponents, elements: newElements } = newSars;
    const { sections: newSections } = newAccordionPane;
    const newRequirements = getSectionByTitle(newSections, "Security Requirements")[1];
    const { formItems: newFormItems } = newRequirements;

    // Check if formItems are valid
    if (originalFormItems?.length > 1 && newFormItems?.length > 1) {
      const originalEditorUUID = originalFormItems[1].hasOwnProperty("uuid") ? originalFormItems[1].uuid : null;
      const newEditorUUID = newFormItems[1].hasOwnProperty("uuid") ? newFormItems[1].uuid : null;

      // Add new editor and remove previous editor
      const editorsExist = originalEditorUUID && newEditorUUID && newEditors.hasOwnProperty(newEditorUUID) && newEditors[newEditorUUID].hasOwnProperty("text");

      if (editorsExist) {
        const newText = newEditors[newEditorUUID].text;

        // If the uuid's are the same, update the text only
        if (JSON.stringify(originalEditorUUID) === JSON.stringify(newEditorUUID)) {
          originalEditor[originalEditorUUID].text = newText;
        } else {
          // Delete previous editor
          delete originalEditor[originalEditorUUID];

          // Create new editor with updated uuid
          originalEditor[newEditorUUID] = {
            title: "Security Assurance Requirements",
            text: newText,
            open: false,
          };
        }
      }

      // Update formItems in the original requirements
      originalRequirements.formItems[1] = deepCopy(newFormItems[1]);
    }

    // Update evaluation activities and notes for overlapping SAR elements
    if (originalComponents && originalElements && newComponents && newElements) {
      const originalElementMap = getSarElementUUIDToComponentIdMap(deepCopy(originalComponents), deepCopy(originalElements));
      const newElementMap = getSarElementUUIDToComponentIdMap(deepCopy(newComponents), deepCopy(newElements));

      // Update sar EAs and Notes
      updateSarEAsAndNotes(originalElementMap, originalElements, newElementMap, newElements);
    }

    return newSars;
  };
  /**
   * Converts objectives
   * @param originalAccordionPane the original accordion pane
   */
  const convertObjectives = (originalAccordionPane) => {
    const { sections: originalSections } = originalAccordionPane;
    let toeTitle = "Security Objectives for the TOE";

    const toeUUID = dispatch(
      GET_OBJECTIVE_UUID_BY_TITLE({
        title: toeTitle,
      })
    ).payload.uuid;

    // Delete TOE section
    if (toeUUID) {
      // Delete TOE section from accordion sections
      let originalObjectiveSection = getSectionByTitle(originalSections, "Security Objectives")[1];
      let { formItems } = originalObjectiveSection;

      if (formItems) {
        originalObjectiveSection.formItems = formItems.filter((item) => item.uuid !== toeUUID);
      }
    }

    // Remove objectives from threat terms
    dispatch(RESET_ALL_THREAT_TERM_OBJECTIVES());

    // Remove objectives from sfrSections
    dispatch(RESET_ALL_SFR_OBJECTIVES());

    // Delete TOE section from objectives
    dispatch(
      DELETE_OBJECTIVE_SECTION({
        uuid: toeUUID,
        title: toeTitle,
      })
    );
  };
  /**
   * Converts the pp type
   * @param ppType the pp type
   */
  const convertPPType = (ppType) => {
    // Retrieve the last known version from local storage
    let storedVersion = sessionStorage.getItem("ppType");

    // Update ppType in session storage if it doesn't exist
    if (!storedVersion) {
      sessionStorage.setItem("ppType", ppType);
      storedVersion = ppType;
    }

    // Check if the ppType has changed
    if (ppType && ppType !== storedVersion && isLoadingValid) {
      try {
        if (ppType === "Functional Package") {
          convertToFunctionalPackage(ppType).then();
        } else if (ppType === "Module") {
          convertToModule(ppType).then();
        }
      } catch (e) {
        console.log(e);
        handleSnackBarError(e);
      } finally {
        sessionStorage.setItem("ppType", ppType);
      }
    }
  };
  /**
   * Converts to functional package
   * @param ppType the pp type
   * @returns {Promise<void>}
   */
  const convertToFunctionalPackage = async (ppType) => {
    try {
      // Get original data
      let originalAccordionPane = deepCopy(currentAccordionPane);
      let editors = deepCopy(currentEditorSections);
      let { metadata, sections } = originalAccordionPane;
      let [introductionUUID, introductionSection] = getSectionByTitle(sections, "Introduction");
      let [requirementsUUID, requirements] = getSectionByTitle(sections, "Security Requirements");
      let { formItems: requirementsFormItems } = requirements;
      const [toeOverviewUUID, toeOverviewEditor] = getSectionByTitle(editors, "TOE Overview");

      // Set new ppType
      if (metadata) {
        metadata.ppType = ppType;
      }

      // Reset compliant targets of evaluation
      dispatch(RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE());

      // Update compliant targets of evaluation
      const isToeAValidSecton = toeOverviewUUID && toeOverviewEditor && introductionUUID && sections.hasOwnProperty(introductionUUID);

      if (isToeAValidSecton) {
        // Add in compliant targets of evaluation to accordion pane sections
        const searchContentType = "editor";
        const newContentType = "compliantTargetsOfEvaluation";
        sections[introductionUUID] = updateContentType(introductionSection, toeOverviewUUID, searchContentType, newContentType);

        // Grab text from TOE Overview in editor section
        const { text, title } = toeOverviewEditor;
        if (text && title) {
          const itemMap = { introText: text };
          dispatch(UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY({ itemMap }));
        }
        // Delete TOE Overview in editor section
        deleteEditor(editors, toeOverviewUUID, title);
      }

      // Remove sars and remove from accordionPane and editor section
      if (requirementsFormItems && requirementsFormItems.length > 0) {
        const [sarUUID, sarEditor] = getSectionByTitle(editors, "Security Assurance Requirements");

        // Remove sars from accordionPane sections and editor
        if (sarUUID && sarEditor) {
          // Find index of sars in formItems using findIndex
          const deleteIndex = requirementsFormItems.findIndex((item) => item.uuid === sarUUID);

          // Delete sars from accordionPane if found
          const formItemExists = deleteIndex !== -1 && sections.hasOwnProperty(requirementsUUID) && sections[requirementsUUID].hasOwnProperty("formItems");

          if (formItemExists) {
            sections[requirementsUUID].formItems = requirementsFormItems.filter((_, index) => index !== deleteIndex);
          }

          // Delete sars from editor
          let { title } = sarEditor;
          if (title) {
            deleteEditor(editors, sarUUID, title);
          }
        }

        // Reset sars
        dispatch(RESET_SAR_STATE());
      }

      // Reset include packages
      dispatch(RESET_PACKAGE_STATE());

      // Update editor state
      dispatch(SET_EDITORS_INITIAL_STATE(editors));

      // Set the accordion pane to reflect the updated sections
      dispatch(SET_ACCORDION_PANE_INITIAL_STATE(originalAccordionPane));
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Converts to module
   * @param ppType the pp type
   * @returns {Promise<void>}
   */
  const convertToModule = async (ppType) => {
    // TODO: Update in issue #200
    try {
      fetchTemplateData({
        version: "CC2022 Standard",
        type: ppType,
        base: true,
      }).then();
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Updates the content type
   * @param data the data
   * @param searchUUID the search UUID
   * @param searchContentType the search content type
   * @param newContentType the new content type
   * @returns {*&{formItems}}
   */
  function updateContentType(data, searchUUID, searchContentType, newContentType) {
    // Helper function to recursively search and update
    function recursiveUpdate(items) {
      return items.map((item) => {
        // Check if the current item matches the UUID and contentType
        if (item.uuid === searchUUID && item.contentType === searchContentType) {
          // Update the contentType
          return { ...item, contentType: newContentType };
        }

        // If the item has nested formItems, recurse into them
        if (item.formItems) {
          return { ...item, formItems: recursiveUpdate(item.formItems) };
        }

        // Return the item unchanged if no match is found
        return item;
      });
    }

    // Start the recursive update with the top-level formItems
    return {
      ...data,
      formItems: recursiveUpdate(data.formItems),
    };
  }
  /**
   * Updates the sar evaluation activities and notes
   * @param originalElementMap the original element map
   * @param originalElements the original elements
   * @param newElementMap the new element map
   * @param newElements the new elements
   */
  const updateSarEAsAndNotes = (originalElementMap, originalElements, newElementMap, newElements) => {
    try {
      Object.entries(originalElements).forEach(([originalUUID, originalElement]) => {
        const { title, type, note, aactivity } = originalElement;
        const originalID = originalElementMap[originalUUID];

        // Filter through newElements to find the matching title, type and ccID of the originalElements
        Object.entries(newElements)
          .filter(([newUUID, newElement]) => compareSarTitles(newElement.title, title) && newElement.type === type && originalID === newElementMap[newUUID])
          .forEach(([newUUID, newElement]) => {
            newElements[newUUID] = {
              ...newElement,
              note: note ? note : "",
              aactivity: aactivity ? aactivity : "",
            };
          });
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }

    // Remove excess whitespace and compare the sar title strings
    /**
     * Converts sar titles
     * @param string1 the first string
     * @param string2 the second string
     * @returns {boolean}
     */
    function compareSarTitles(string1, string2) {
      const normalized1 = string1.split(/\s+/).join(" ").trim();
      const normalized2 = string2.split(/\s+/).join(" ").trim();

      // Compare the normalized strings
      return normalized1 === normalized2;
    }
  };
  /**
   * gets the sar element UUID to component id map
   * @param components the components
   * @param elements the elements
   * @returns {{}}
   */
  const getSarElementUUIDToComponentIdMap = (components, elements) => {
    const map = {};

    // Get the uuid to component id map
    try {
      if (components && elements) {
        Object.values(components).forEach((component) => {
          const { elementIDs, ccID } = component;
          if (ccID && elementIDs && elementIDs.length > 1) {
            elementIDs.forEach((id) => {
              if (elements.hasOwnProperty(id)) {
                map[id] = ccID;
              }
            });
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    return map;
  };
  /**
   * Gets the section by title
   * @param sections the sections
   * @param title the title
   * @returns {[string, unknown]|*[]}
   */
  const getSectionByTitle = (sections, title) => {
    let result = Object.entries(sections).find(([key, section]) => section.title === title);

    if (result) {
      return result;
    } else {
      return [null, null];
    }
  };
  /**
   * Deletes the editor
   * @param editors the editors
   * @param uuid the uuid
   * @param title the title
   */
  const deleteEditor = (editors, uuid, title) => {
    const editorExists = editors && editors.hasOwnProperty(uuid) && editors[uuid].title === title;

    if (editorExists) {
      delete editors[uuid];
    }
  };

  // Use Memos
  /**
   * The pp template dropdown section
   */
  const ppTemplateDropdown = useMemo(() => {
    const { ppTemplateVersion, ppType } = metadataSection;
    const filteredOptions = getPPTemplateFilteredMenuOptions(ppTemplateVersion);

    return (
      <span className='flex justify-stretch min-w-full pb-2'>
        <MultiSelectDropdown
          selectionOptions={filteredOptions}
          selections={ppTemplateVersion}
          selectId='pp_template_version'
          title={"Select PP Template Version"}
          handleSelections={handlePPTemplateSelect}
          multiple={false}
          required={true}
          defaultValue={"CC2022 Standard"}
          // TODO: Update in issue #200
          disabled={ppType === "Module" ? true : false}
        />
      </span>
    );
  }, [metadataSection]);
  /**
   * The pp type dropdown
   */
  const ppTypeDropdown = useMemo(() => {
    const filteredOptions = getPPTypeFilteredMenuOptions(metadataSection.ppType);

    return (
      <span className='flex justify-stretch min-w-full pb-2'>
        <MultiSelectDropdown
          selectionOptions={filteredOptions}
          selections={metadataSection.ppType}
          title={"Select PP Type"}
          handleSelections={handlePPTypeSelect}
          multiple={false}
          required={true}
          defaultValue={"Protection Profile"}
        />
      </span>
    );
  }, [metadataSection.ppType]);

  // Return Method
  return (
    <div>
      <AccordionContent
        title={"Metadata Section"}
        open={metadataSection.open}
        metadata={
          <div className='min-w-full'>
            <div className='min-w-full px-4 pb-2 border-gray-300'>
              <div className='mx-[-16px] mt-[-8px]'>
                <CardTemplate
                  type={"section"}
                  header={<label className='resize-none justify-center flex font-bold text-[14px] p-0 pr-4 text-secondary'>Base PP</label>}
                  body={
                    <div className='min-w-full'>
                      <span className='flex justify-stretch min-w-full pb-2'>
                        <FormControl fullWidth>{ppTemplateDropdown}</FormControl>
                        <FormControl fullWidth sx={{ paddingLeft: 2 }}>
                          {ppTypeDropdown}
                        </FormControl>
                      </span>
                      <div className='flex justify-center mb-2'>
                        <Tooltip arrow title={`This will reset all data to the default template data`}>
                          <Button
                            startIcon={<RestoreIcon />}
                            sx={{ fontSize: "12px" }}
                            component='label'
                            variant='contained'
                            color='primary'
                            onClick={handleOpenResetDataMenu}
                            style={{ color: "white", textAlign: "center", textTransform: "none" }}>
                            Reset Template Data
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  }
                />
                <CardTemplate
                  type={"section"}
                  header={<label className='resize-none justify-center flex font-bold text-[14px] p-0 pr-4 text-secondary'>Current Revision</label>}
                  body={
                    <span className='flex justify-stretch min-w-full pb-2'>
                      <FormControl fullWidth>
                        <TextField
                          required
                          color={"primary"}
                          label={"PP Name"}
                          key={metadataSection.ppName}
                          defaultValue={metadataSection.ppName}
                          inputProps={{ style: { fontSize: 13 }, "data-testid": "pp_name" }}
                          InputLabelProps={{ style: { fontSize: 13 } }}
                          onBlur={(event) => {
                            handleSnackbarTextUpdates(handleUpdates, "ppName", event);
                          }}
                        />
                      </FormControl>
                      <FormControl fullWidth sx={{ paddingLeft: 2 }}>
                        <TextField
                          required
                          color={"primary"}
                          label={"Version"}
                          type={"number"}
                          key={metadataSection.version}
                          defaultValue={metadataSection.version}
                          inputProps={{ style: { fontSize: 13 } }}
                          InputLabelProps={{ style: { fontSize: 13 } }}
                          onBlur={(event) => {
                            handleSnackbarTextUpdates(handleUpdates, "version", event);
                          }}
                        />
                      </FormControl>
                      <FormControl fullWidth sx={{ paddingLeft: 2 }}>
                        <TextField
                          required
                          color={"primary"}
                          label={"Release Date"}
                          type={"date"}
                          key={metadataSection.releaseDate}
                          defaultValue={metadataSection.releaseDate}
                          inputProps={{ style: { fontSize: 13 } }}
                          InputLabelProps={{ style: { fontSize: 13 }, shrink: true }}
                          onBlur={(event) => {
                            handleSnackbarTextUpdates(handleUpdates, "releaseDate", event);
                          }}
                        />
                      </FormControl>
                    </span>
                  }
                />
              </div>
              <div className='mt-2 mb-[-8px]'>
                <EditableTable
                  title={"Revision History"}
                  editable={editable}
                  columnData={columnData}
                  rowData={generateMetaDataTableValues()}
                  handleNewTableRow={handleNewTableRow}
                  handleUpdateTableRow={handleUpdateTableRow}
                  handleDeleteTableRows={handleDeleteTableRows}
                  tableInstructions={`To edit a cell, double-click on it.`}
                />
              </div>
            </div>
            <SwitchWarning
              type={"ppTemplateVersion"}
              open={openSwitchWarning}
              handleClose={() => handleCloseWarning("Select PP Template Version", targetPPTemplate)}
              handleOpen={handleOpenSwitchWarning}
              currentPPTemplate={metadataSection.ppTemplateVersion}
              targetPPTemplate={targetPPTemplate}>
              {generateDiffs("ppTemplateVersion")}
            </SwitchWarning>
            <SwitchWarning
              type={"ppType"}
              open={openPPTypeSwitchWarning}
              handleClose={() => handleCloseWarning("Select PP Type", targetPPType)}
              handleOpen={handleOpenPPTypeSwitchWarning}>
              {generateDiffs("ppType")}
            </SwitchWarning>
          </div>
        }
        handleMetaDataCollapse={handleUpdates}
      />
      <ResetDataConfirmation
        title={"Reset Data Confirmation"}
        text={"Are you sure you want to reset all data to its initial state?"}
        open={openResetDataMenu}
        handleOpen={handleOpenResetDataMenu}
        handleSubmit={() => handleSubmitResetDataMenu(handleOpenResetDataMenu)}
      />
    </div>
  );
}

// Export MetadataSection.jsx
export default MetadataSection;
