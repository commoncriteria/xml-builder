// Imports
import store from "../app/store.js";
import { Tooltip } from "@mui/material";
import { DELETE_ACCORDION_FORM_ITEM, SET_ACCORDION_PANE_INITIAL_STATE, updateSnackBar } from "../reducers/accordionPaneSlice.js";
import { SET_TERMS_INITIAL_STATE } from "../reducers/termsSlice.js";
import { SET_EDITORS_INITIAL_STATE } from "../reducers/editorSlice.js";
import { DELETE_SFR_FROM_THREAT_USING_UUID, SET_THREATS_INITIAL_STATE, UPDATE_THREAT_TERM_FROM } from "../reducers/threatsSlice.js";
import { SET_OBJECTIVES_INITIAL_STATE } from "../reducers/objectivesSlice.js";
import { DELETE_SFR, SET_SFRS_INITIAL_STATE, UPDATE_TOE_SFRS } from "../reducers/SFRs/sfrSlice.js";
import {
  CREATE_SFR_COMPONENT,
  DELETE_SFR_SECTION,
  GET_ALL_SFR_OPTIONS_MAP,
  SET_SFR_SECTIONS_INITIAL_STATE,
  UPDATE_SFR_COMPONENT_ITEMS,
  UPDATE_SFR_SECTION_ELEMENT,
} from "../reducers/SFRs/sfrSectionSlice.js";
import { SET_SARS_INITIAL_STATE } from "../reducers/sarsSlice.js";
import { SET_BIBLIOGRAPHY_INITIAL_STATE } from "../reducers/bibliographySlice.js";
import { SET_ENTROPY_APPENDIX_INITIAL_STATE } from "../reducers/entropyAppendixSlice.js";
import { SET_EQUIV_GUIDELINES_APPENDIX_INITIAL_STATE } from "../reducers/equivalencyGuidelinesAppendix.js";
import { SET_SATISFIED_REQS_APPENDIX_INITIAL_STATE } from "../reducers/satisfiedReqsAppendix.js";
import { SET_VALIDATION_GUIDELINES_APPENDIX_INITIAL_STATE } from "../reducers/validationGuidelinesAppendix.js";
import { SET_VECTOR_APPENDIX_INITIAL_STATE } from "../reducers/vectorAppendix.js";
import { SET_ACKNOWLEDGEMENTS_APPENDIX_INITIAL_STATE } from "../reducers/acknowledgementsAppendix.js";
import { SET_INCLUDE_PACKAGE_INITIAL_STATE } from "../reducers/includePackageSlice.js";
import { SET_MODULES_INITIAL_STATE } from "../reducers/moduleSlice.js";
import { SET_PP_PREFERENCE_INITIAL_STATE } from "../reducers/ppPreferenceSlice.js";
import { RESET_CONFORMANCE_CLAIMS_STATE } from "../reducers/conformanceClaimsSlice.js";
import {
  DELETE_BASE_PP_SFR_SECTION,
  DELETE_SFR_BASE_PP,
  RESET_SFR_BASE_PP_STATE,
  SET_SFR_BASE_PP_INITIAL_STATE,
  UPDATE_ADDITIONAL_SFRS,
  UPDATE_MODIFIED_SFRS,
} from "../reducers/SFRs/sfrBasePPsSlice.js";
import {
  RESET_EVALUATION_ACTIVITY_UI,
  RESET_SFR_WORKSHEET_UI,
  TRANSFORM_TABULARIZE_DATA,
  UPDATE_EVALUATION_ACTIVITY_UI_ITEMS,
  UPDATE_MANAGEMENT_FUNCTION_UI_ITEMS,
  UPDATE_SFR_WORKSHEET_COMPONENT,
  UPDATE_SFR_WORKSHEET_ITEMS,
  UPDATE_TABULARIZE_UI_ITEMS,
} from "../reducers/SFRs/sfrWorksheetUI.js";
import { deepCopy } from "./deepCopy.js";
import { removeTagEqualities } from "./fileParser.js";
import { getSfrPreviewTextString } from "./sfrPreview.jsx";
import CardTemplate from "../components/editorComponents/securityComponents/CardTemplate.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx";
import app from "../../public/data/sfr_components/app_cc2022.json";
import mdm from "../../public/data/sfr_components/mdm.json";
import gpcp from "../../public/data/sfr_components/gpcp_cc2022.json";
import gpos from "../../public/data/sfr_components/gpos_cc2022.json";
import mdf from "../../public/data/sfr_components/mdf.json";
import tls from "../../public/data/sfr_components/tls_cc2022.json";
import virtualization from "../../public/data/sfr_components/virtualization_cc2022.json";

// Constants
export const noTestTooltip = (
  <span>
    {`In the event that there are no EAs for a requirement, if the EAs can be
        found elsewhere, or they are covered by another requirement, this toggle can be pressed.
        Click here to find out more: `}
    <a
      href='https://github.com/commoncriteria/pp-template/wiki/Evaluation-Activities'
      target='_blank'
      rel='noopener noreferrer'
      style={{ textDecoration: "underline" }}>
      Evaluation Activities
    </a>
    .
    <br />
    <br />* Note: If this button is pressed, all previous data will be lost.
  </span>
);

// Methods
/**
 * Handles updates for crypto tables
 * @param params
 */
export const handleCryptoUpdate = (params) => {
  try {
    const state = store.getState();
    const { row } = state.sfrWorksheetUI.tabularizeUI;
    const { updateType, key, value, index, definitionType } = params;
    let itemMap = {};
    const updateRow = true;

    // Handle selectables
    if (definitionType === "selectcol") {
      let currentCell = deepCopy(row[key]);

      // Handle adding a new type
      if (updateType === "add") {
        currentCell.push(value);
      }
      // Handle deleting an item
      else if (updateType === "delete") {
        currentCell.splice(index, 1);
      }
      // Handle updating
      else if (updateType === "update") {
        const isValidIndex = index !== undefined && index !== null && typeof index === "number";

        // Handle updating an item at a specific index
        if (isValidIndex) {
          currentCell[index] = value;
        }
        // Handle updating the entire cell value
        else {
          currentCell = value;
        }
      }

      // Update itemMap
      itemMap = {
        key: key,
        value: currentCell,
      };
    }
    // Handle text updates
    else if (definitionType === "textcol" && updateType === "update") {
      itemMap = {
        key: key,
        value: value,
      };
    }

    // Update tabularize ui
    updateTabularizeUI(itemMap, updateRow);
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Handles the text update
 * @param event the event
 * @param type the type
 * @param index the index
 * @param uuid the uuid
 */
export const handleEvaluationActivityTextUpdate = (event, type, index, uuid) => {
  try {
    const state = store.getState();
    const { activities, element, managementFunctionUI } = state.sfrWorksheetUI;
    const { managementFunctions } = element;
    const { activity } = managementFunctionUI;

    // Update evaluation activity text by type
    if (uuid === "isManagementFunction") {
      let activityCopy = activity ? deepCopy(activity) : {};

      // Update activity
      activityCopy[type] = event;

      // Update management functions
      updateManagementFunctionItems(
        {
          value: activityCopy,
          rowIndex: index,
          type: "evaluationActivity",
        },
        managementFunctions,
        true
      );
    } else {
      let activitiesCopy = activities ? deepCopy(activities) : {};
      const isTypeValid =
        type === "introduction" || type === "tss" || type === "guidance" || type === "testIntroduction" || type === "testClosing" || type === "noTest";

      if (uuid && uuid !== "" && activitiesCopy && activitiesCopy.hasOwnProperty(uuid) && isTypeValid) {
        activitiesCopy[uuid][type] = event;

        // Update evaluation activities
        updateEvaluationActivities(activitiesCopy);
      }
    }
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Handles updates to the snackbar upon success
 * @param message the snackbar success message
 * @param additionalArgs any additional arguments for the snack bar (in the form of an object)
 */
export const handleSnackBarSuccess = (message, additionalArgs) => {
  const snackBar = getSnackBarObject(message, "success", additionalArgs);

  // Show snack bar success message
  setTimeout(() => {
    store.dispatch(updateSnackBar(snackBar));
  }, 1000);
};
/**
 * Handles updates to the snackbar upon error
 * @param message the snackbar error message
 * @param additionalArgs any additional arguments for the snack bar (in the form of an object)
 */
export const handleSnackBarError = (message, additionalArgs) => {
  const snackBar = getSnackBarObject(message.toString(), "error", additionalArgs);

  // Show snack bar error message
  setTimeout(() => {
    store.dispatch(updateSnackBar(snackBar));
  }, 1000);
};
/**
 * Handles snack bar updates for text updates
 * @param logicCallback the function logic that gets passed in
 * @param args any arguments used for the logicCallback function
 */
export const handleSnackbarTextUpdates = (logicCallback, ...args) => {
  let message = "";
  let severity = "success";

  try {
    // Execute the passed logic
    logicCallback(...args);
    message = "Text Successfully Updated";
  } catch (e) {
    console.error(e);
    message = e.toString();
    severity = "error";
  }

  // Update snackbar
  if (message !== "") {
    if (severity === "success") {
      handleSnackBarSuccess(message);
    } else if (severity === "error") {
      handleSnackBarError(message);
    }
  }
};
/**
 * Handles the submit reset data menu
 * @param closeMenu the function that closes the menu
 */
export const handleSubmitResetDataMenu = (closeMenu) => {
  try {
    // Close the dialog
    closeMenu();

    // Scroll back to the top of the page
    window.scrollTo(0, 0);

    // Reload the page after clearing out session storage
    // A snackbar message will pop up after the page is reloaded
    sessionStorage.setItem("resetData", "true");
    clearSessionStorageExcept(["resetData"]).then(() => {
      // Reload the page
      location.reload();
    });
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};

// Helper Methods
/**
 * Creates the snack bar object
 * @param message the snack bar message
 * @param severity the snack bar severity type
 * @param additionalArgs any additional arguments for the snack bar (in the form of an object)
 */
export const getSnackBarObject = (message, severity, additionalArgs) => {
  return {
    open: true,
    message: message.toString(),
    severity: severity,
    ...(additionalArgs || {}),
  };
};
/**
 * Fetches the template data
 * @param version the version
 * @param type the type
 * @param base if the base template is required
 * @returns {Promise<void>}
 */
export const fetchTemplateData = async ({ version, type, base }) => {
  try {
    // Clear session storage and reset template data to its original state
    await clearSessionStorageExcept(["ppTemplateVersion", "ppType", "isLoading"]);

    // Load json template data
    const data = await loadTemplateJson({ version, type, base });

    let {
      accordionPane,
      terms,
      editors,
      threats,
      objectives,
      sfrBasePPs,
      sfrs,
      sfrSections,
      sars,
      bibliography,
      entropyAppendix,
      equivGuidelinesAppendix,
      satisfiedReqsAppendix,
      validationGuidelinesAppendix,
      vectorAppendix,
      acknowledgementsAppendix,
      includePackage,
      modules,
      ppPreference,
    } = data;

    // Dispatch actions to update different slices
    if (version !== "Version 3.1") {
      accordionPane.metadata.ppTemplateVersion = version;
    }

    // Set initial states
    store.dispatch(SET_ACCORDION_PANE_INITIAL_STATE(accordionPane));
    store.dispatch(SET_TERMS_INITIAL_STATE(terms));
    store.dispatch(SET_EDITORS_INITIAL_STATE(editors));
    store.dispatch(SET_THREATS_INITIAL_STATE(threats));
    store.dispatch(SET_OBJECTIVES_INITIAL_STATE(objectives));
    store.dispatch(SET_SFRS_INITIAL_STATE(sfrs));
    store.dispatch(SET_SFR_SECTIONS_INITIAL_STATE(sfrSections));
    store.dispatch(SET_SARS_INITIAL_STATE(sars));
    store.dispatch(SET_BIBLIOGRAPHY_INITIAL_STATE(bibliography));
    store.dispatch(SET_ENTROPY_APPENDIX_INITIAL_STATE(entropyAppendix));
    store.dispatch(SET_EQUIV_GUIDELINES_APPENDIX_INITIAL_STATE(equivGuidelinesAppendix));
    store.dispatch(SET_SATISFIED_REQS_APPENDIX_INITIAL_STATE(satisfiedReqsAppendix));
    store.dispatch(SET_VALIDATION_GUIDELINES_APPENDIX_INITIAL_STATE(validationGuidelinesAppendix));
    store.dispatch(SET_VECTOR_APPENDIX_INITIAL_STATE(vectorAppendix));
    store.dispatch(SET_ACKNOWLEDGEMENTS_APPENDIX_INITIAL_STATE(acknowledgementsAppendix));
    store.dispatch(SET_INCLUDE_PACKAGE_INITIAL_STATE(includePackage));
    store.dispatch(SET_MODULES_INITIAL_STATE(modules));
    store.dispatch(SET_PP_PREFERENCE_INITIAL_STATE(ppPreference));
    store.dispatch(RESET_CONFORMANCE_CLAIMS_STATE());

    // Add in sfr module
    if (type === "Module") {
      store.dispatch(SET_SFR_BASE_PP_INITIAL_STATE(sfrBasePPs));
    } else {
      store.dispatch(RESET_SFR_BASE_PP_STATE());
    }
  } catch (error) {
    console.error("Error fetching template data:", error);
    // Handle the error as needed, e.g., dispatch an error action or return a value
  } finally {
    // Update the local storage with the current version
    sessionStorage.setItem("ppTemplateVersion", version);

    // Update pp type
    sessionStorage.setItem("ppType", type);
  }
};

/**
 * Loads in the template data
 * @param version the version
 * @param type the type
 * @param base if the base template is required
 * @returns {Promise<any>}
 */
export const loadTemplateJson = async ({ version, type, base }) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const dataFolder = `${basePath}data`;
  const baseDataFolder = `${dataFolder}/base_data`;

  let filePath;

  if (base) {
    switch (
      version // used for imported PPs
    ) {
      case "CC2022 Direct Rationale":
        if (type === "Protection Profile") {
          filePath = `${baseDataFolder}/base_cc2022_direct_rationale.json`;
        } else if (type === "Functional Package") {
          filePath = `${baseDataFolder}/base_cc2022_fp.json`;
        } else if (type === "Module") {
          filePath = `${baseDataFolder}/base_cc2022_module_direct_rationale.json`;
        }
        break;
      case "CC2022 Standard":
        if (type === "Protection Profile") {
          filePath = `${baseDataFolder}/base_cc2022_standard.json`;
        } else if (type === "Functional Package") {
          filePath = `${baseDataFolder}/base_cc2022_fp.json`; // using same template as base since FPs normally don't have SARs
        } else if (type === "Module") {
          filePath = `${baseDataFolder}/base_cc2022_module_standard.json`;
        }
        break;
      case "Version 3.1":
        filePath = `${baseDataFolder}/base_version_3.1.json`;
        break;
      // Add more cases as needed
      default:
        handleSnackBarError("Unsupported version", version);
        throw new Error(`Unsupported version: ${version}`);
    }
  } else {
    switch (version) {
      case "CC2022 Direct Rationale":
        if (type === "Protection Profile") {
          filePath = `${dataFolder}/cc2022_direct_rationale.json`;
        } else if (type === "Functional Package") {
          filePath = `${baseDataFolder}/base_cc2022_fp.json`; // using same template as base since FPs normally dont have SARs
        } else if (type === "Module") {
          filePath = `${baseDataFolder}/base_cc2022_module_direct_rationale.json`;
        }
        break;
      case "CC2022 Standard":
        if (type === "Protection Profile") {
          filePath = `${dataFolder}/cc2022_standard.json`;
        } else if (type === "Functional Package") {
          filePath = `${baseDataFolder}/base_cc2022_fp.json`;
        } else if (type === "Module") {
          filePath = `${baseDataFolder}/base_cc2022_module_standard.json`;
        }
        break;
      // Add more cases as needed
      default:
        handleSnackBarError("Unsupported version", version);
        throw new Error(`Unsupported version: ${version}`);
    }
  }

  // Fetch the JSON data
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    handleSnackBarError("Failed to load JSON", error.message);
    throw error;
  }
};
/**
 * Clears out the session storage except for one key
 * @param keysToKeep the keys to keep
 */
export const clearSessionStorageExcept = async (keysToKeep) => {
  // Create a map to store the values of the items you want to keep
  const valuesToKeep = {};

  // Retrieve and store the values of the items you want to keep
  keysToKeep.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value !== null) {
      valuesToKeep[key] = value;
    }
  });

  // Clear all items from sessionStorage
  await sessionStorage.clear();

  // Restore the items you wanted to keep
  Object.keys(valuesToKeep).forEach((key) => {
    sessionStorage.setItem(key, valuesToKeep[key]);
  });
};
/**
 * Updates the ref ids
 * @param data the table data
 */
export const updateRefIds = (data) => {
  const state = store.getState();
  const { element, managementFunctionUI } = state.sfrWorksheetUI;
  const { managementFunctions } = element;
  const { rowIndex, activity, note } = managementFunctionUI;
  const { event, index, type } = data;

  // Sort the ref ids
  if (event && event.length > 1) {
    event.sort((a, b) => {
      const lowerA = a.toLowerCase();
      const lowerB = b.toLowerCase();

      // Sort with lowercase sorting
      if (lowerA < lowerB) {
        return -1;
      }
      if (lowerA > lowerB) {
        return 1;
      }
      return 0;
    });
  }

  // Update application note
  if (type && type === "note") {
    updateApplicationNoteForManagementFunction(event, "refIds", index, note, managementFunctions, rowIndex);
  }
  // Update evaluation activity
  else if (type && type === "aactivity") {
    updateEaRefIdsForManagementFunctions(event, activity, managementFunctions, rowIndex);
  }
};
/**
 * Updates the application note for management function
 * @param event the event
 * @param type the type
 * @param index the index
 * @param note the note
 * @param managementFunctions the management functions
 * @param rowIndex the row index
 */
export const updateApplicationNoteForManagementFunction = (event, type, index, note, managementFunctions, rowIndex) => {
  let noteCopy = deepCopy(note);

  // Update note
  if (type === "note") {
    if (!noteCopy[index].hasOwnProperty("note")) {
      noteCopy[index].note = "";
    }

    if (JSON.stringify(noteCopy[index].note) !== JSON.stringify(event)) {
      noteCopy[index].note = event;
    }
  }
  // Update refIds
  else if (type === "refIds") {
    if (!noteCopy[index].hasOwnProperty("refIds")) {
      noteCopy[index].refIds = [];
    }

    if (JSON.stringify(noteCopy[index].refIds) !== JSON.stringify(event)) {
      noteCopy[index].refIds = event;
    }
  }

  // Update management functions
  if (JSON.stringify(noteCopy) !== JSON.stringify(note)) {
    updateManagementFunctionItems(
      {
        value: noteCopy,
        rowIndex,
        type: "note",
      },
      managementFunctions,
      true
    );
  }
};
/**
 * Gets the ref id dropdown
 * @param refIdOptions the ref id options
 * @param rowIndex the row index
 * @returns {*}
 */
export const getRefIdDropdown = (refIdOptions, rowIndex) => {
  return deepCopy(refIdOptions)?.map((value) => {
    let { key } = value;

    if (JSON.stringify(key) === JSON.stringify(rowIndex)) {
      value.disabled = true;
    }
    return value;
  });
};
/**
 * Gets the objective maps
 * @returns Object containing various relationships for name, UUID
 */
export const getObjectiveMaps = () => {
  let objectiveMap = {
    objectiveNames: [],
    objectiveNameMap: {},
    objectiveUUIDMap: {},
  };

  try {
    const state = store.getState();
    const objectives = state.objectives;

    Object.values(objectives).map((value) => {
      let terms = value.terms || {};
      Object.entries(terms).map(([key, value]) => {
        let title = value.title;
        if (!objectiveMap.objectiveNames.includes(title)) {
          objectiveMap.objectiveNames.push(title);
          objectiveMap.objectiveNameMap[title] = key;
          objectiveMap.objectiveUUIDMap[key] = title;
        }
      });
    });
    objectiveMap.objectiveNames.sort();
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return objectiveMap;
};
/**
 * Gets the SFR maps
 * @returns Object containing various relationships for name, UUID, and objectives
 */
export const getSfrMaps = () => {
  const dataMap = { app, gpcp, gpos, mdf, mdm, tls, virtualization };

  let sfrMap = {
    sfrNames: [],
    sfrNameMap: {},
    sfrUUIDMap: {},
    objectivesSFRMap: {},
  };
  try {
    const state = store.getState();
    const ppType = state.accordionPane?.metadata?.ppType || "";
    const sfrs = state.sfrs;
    const sfrSections = state.sfrSections;
    const sfrBasePPs = state.sfrBasePPs;

    Object.entries(sfrSections).map(([sfrUUID, sfrContent]) => {
      const { sfrType = "" } = sfrs.sections[sfrUUID] || {};

      Object.entries(sfrContent).map(([componentUUID, sfrComponent]) => {
        const { cc_id, iteration_id, additionalSfr = false, modifiedSfr = false } = sfrComponent;

        let title = getSfrTitle(cc_id, iteration_id);

        // Get module title
        if (ppType === "Module") {
          title = getModuleTitle(title, additionalSfr, modifiedSfr, sfrUUID, sfrType);

          // Add SFRs from the base PP
          for (const sfrBasePP of Object.values(sfrBasePPs)) {
            const { declarationAndRef = { short: "" } } = sfrBasePP || {};
            const shortName = declarationAndRef.short.toLowerCase();

            if (shortName === "app") {
              const data = dataMap[shortName];

              Object.entries(data).forEach(([key, value]) => {
                const title = `${key} (from Base-PP)`;
                const componentUUID = value.compUUID;

                if (!sfrMap.sfrNames.includes(title)) {
                  sfrMap.sfrNames.push(title);
                  sfrMap.sfrNameMap[title] = componentUUID;
                  sfrMap.sfrUUIDMap[componentUUID] = title;
                }
              });
            }
          }
        }

        if (!sfrMap.sfrNames.includes(title)) {
          sfrMap.sfrNames.push(title);
          sfrMap.sfrNameMap[title] = componentUUID;
          sfrMap.sfrUUIDMap[componentUUID] = title;
        }
      });
    });

    sfrMap.sfrNames.sort();

    function getModuleTitle(title, additionalSfr, modifiedSfr, sfrUUID, sfrType) {
      try {
        if (additionalSfr || modifiedSfr) {
          for (const sfrBasePP of Object.values(sfrBasePPs)) {
            const { declarationAndRef = { short: "" }, additionalSfrs = { sfrSections: {} }, modifiedSfrs = { sfrSections: {} } } = sfrBasePP || {};
            if (additionalSfr && additionalSfrs.sfrSections.hasOwnProperty(sfrUUID)) {
              return `${title} (additional to ${declarationAndRef.short} PP)`;
            } else if (modifiedSfr && modifiedSfrs.sfrSections.hasOwnProperty(sfrUUID)) {
              return `${title} (modified from ${declarationAndRef.short} PP)`;
            }
          }
        } else {
          switch (sfrType) {
            case "optional": {
              return `${title} (optional)`;
            }
            case "objective": {
              return `${title} (objective)`;
            }
            case "selectionBased": {
              return `${title} (selection-based)`;
            }
            case "implementationDependent": {
              return `${title} (implementation-dependent)`;
            }
            default:
              return title;
          }
        }
      } catch (e) {
        console.log(e);
      }
      return title;
    }
  } catch (e) {
    handleSnackBarError(e);
    console.log(e);
  }
  console.log(sfrMap);
  return sfrMap;
};
/**
 * Maps objectives to sfrs
 * @returns {{}}
 */
export const mapObjectivesToSFRs = () => {
  let objectiveToSFRsMap = {};
  const state = store.getState();
  const { sfrSections } = state;

  try {
    if (sfrSections) {
      Object.values(sfrSections).map((sfrContent) => {
        Object.entries(sfrContent).map(([sfrUUID, sfr]) => {
          sfr.objectives.forEach((objective) => {
            const objectiveUUID = objective.uuid;

            // Initialize array
            if (!objectiveToSFRsMap[objectiveUUID]) {
              objectiveToSFRsMap[objectiveUUID] = [];
            }

            if (!Object.values(objectiveToSFRsMap[objectiveUUID]).includes(sfrUUID)) {
              objectiveToSFRsMap[objectiveUUID].push({ sfrUUID, rationale: objective.rationale });
            }
          });
        });
      });
    }
  } catch (e) {
    handleSnackBarError("Failed to map objectives to SFRs.");
    console.log(e);
  }

  return objectiveToSFRsMap;
};
/**
 * Gets the sfr title
 * @param cc_id the cc_id
 * @param iteration_id the iteration_id
 * @returns {*|string}
 */
export const getSfrTitle = (cc_id, iteration_id) => {
  let title = cc_id ? cc_id : "";

  if (iteration_id) {
    title += `/${iteration_id}`;
  }

  return title;
};
/**
 * Gets the threat maps
 * @returns Object containing various relationships for name, UUID, and objectives
 */
export const getThreatMaps = () => {
  let threatMap = {
    threatSectionUUID: "",
    threatNames: [],
    threatNameMap: {},
    threatUUIDMap: {},
    objectiveToThreats: {},
  };

  try {
    const state = store.getState();
    const threats = state.threats;
    const [threatKey, threatsObject] = Object.entries(threats ?? {}).find(([_, obj]) => obj.title === "Threats") || [];

    // Check if values are valid
    if (threatKey && threatsObject) {
      const terms = threatsObject.terms;
      threatMap.threatSectionUUID = threatKey;

      Object.entries(terms)?.map(([key, value]) => {
        let title = value.title;
        if (!threatMap.threatNames.includes(title)) {
          threatMap.threatNames.push(title);
          threatMap.threatNameMap[title] = key;
          threatMap.threatUUIDMap[key] = title;
        }
      });

      threatMap.objectiveToThreats = transformThreatsToObjectiveMap(terms);
      threatMap.threatNames.sort();
    }
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return threatMap;
};
/**
 * Transforms threats to objectives through a map
 * @param {*} threatsData Threat slice
 * @returns Object that maps a single objective to one or more threats
 */
export const transformThreatsToObjectiveMap = (threatsData) => {
  let objectiveToThreatsMap = {};

  try {
    Object.entries(threatsData).forEach(([threatUUID, threatData]) => {
      threatData.objectives.forEach((objective) => {
        const objectiveUUID = objective.uuid;

        // Initialize array
        if (!objectiveToThreatsMap[objectiveUUID]) {
          objectiveToThreatsMap[objectiveUUID] = [];
        }

        if (!objectiveToThreatsMap[objectiveUUID].includes(threatUUID)) {
          objectiveToThreatsMap[objectiveUUID].push(threatUUID);
        }
      });
    });
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return objectiveToThreatsMap;
};
/**
 * Gets the element values by type
 * @param element
 * @param type the type
 *             Options: tabularize, tabularizeUUIDs and title
 * @param key the key (optional)
 * @returns {*|{}|boolean|[]|*[]|string|string[]}
 */
export const getElementValuesByType = (element, type, key = null) => {
  // Check for a valid element and return value by type
  if (element && Object.keys(element).length > 0) {
    // Get the value by type
    switch (type) {
      case "tabularize": {
        if (key) {
          return element.hasOwnProperty("tabularize") && element["tabularize"].hasOwnProperty(key) ? element["tabularize"][key] : {};
        } else {
          return element.hasOwnProperty("tabularize") ? element["tabularize"] : {};
        }
      }
      case "tabularizeUUIDs": {
        return element.hasOwnProperty("tabularize") ? Object.keys(element["tabularize"]) : [];
      }
      case "title": {
        return element.hasOwnProperty(type) ? element[type] : [];
      }
      default:
        break;
    }
  }
};
/**
 * Gets the component xml id
 * @param ccID the ccID
 * @param iterationID the iterationID
 * @param isRequirementsFormat boolean - if it needs to be formatted in the requirements format
 * @param getSplitValues boolean - if it needs to be returned with all calculated values
 * @returns {{componentXmlId: (string|*), formattedIterationId: string, formattedCcId: (string|string)}|string|*}
 */
export const getComponentXmlID = (ccID, iterationID, isRequirementsFormat, getSplitValues) => {
  let formattedIterationId = "";
  let formattedCcId = ccID ? (isRequirementsFormat ? ccID.valueOf().toUpperCase() : ccID.valueOf().toLowerCase()).replace(/\s+/g, "") : "";

  // Get the iteration value
  if (iterationID && typeof iterationID === "string" && iterationID !== "") {
    formattedIterationId = (isRequirementsFormat ? "/" + iterationID.toUpperCase() : "-" + iterationID.toLowerCase()).replace(/\s+/g, "");
  }

  // Get formatted values
  let componentXmlId = formattedCcId + formattedIterationId;
  componentXmlId = isRequirementsFormat ? componentXmlId : getFormattedXmlID(componentXmlId);

  return getSplitValues ? { formattedCcId, formattedIterationId, componentXmlId } : componentXmlId;
};
/**
 * Gets the element id
 * @param ccID the ccID
 * @param iterationID the iterationID
 * @param index the index
 * @param isElementXMLID boolean - if the format is an element xml id
 * @returns {*|string}
 */
export const getElementId = (ccID, iterationID, index, isElementXMLID) => {
  let elementId = `${ccID + (isElementXMLID ? "e" : ".") + (index + 1) + iterationID}`;
  return isElementXMLID ? getFormattedXmlID(elementId) : elementId;
};
/**
 * Gets the formatted xml id
 * @param xmlId the xml id
 * @returns {string}
 */
export const getFormattedXmlID = (xmlId) => {
  if (xmlId) {
    return xmlId.replace(/\s+/g, "-").replace(/_/g, "-").replace(/\./g, "-").toLowerCase();
  } else {
    return "";
  }
};
/**
 * Gets the selection based array by type
 * @param allSfrOptions the sfr options
 * @param selections the selections
 * @param selectionType the selection type
 * @param returnType the return type
 * @returns {*[]}
 */
export const getSelectionBasedArrayByType = (allSfrOptions, selections, selectionType, returnType) => {
  let selectionsArray = [];

  try {
    selections?.map((value, index) => {
      let selection;
      switch (selectionType) {
        case "components": {
          selection = returnType === "uuid" ? allSfrOptions.nameMap.components[value] : allSfrOptions.uuidMap.components[value];
          break;
        }
        case "elements": {
          selection = returnType === "uuid" ? allSfrOptions.nameMap.elements[value] : allSfrOptions.uuidMap.elements[value];
          break;
        }
        case "selections": {
          selection = returnType === "uuid" ? allSfrOptions.nameMap.selections[value] : allSfrOptions.uuidMap.selections[value];
          break;
        }
        case "Use Cases": {
          if (allSfrOptions.useCaseUUID !== null) {
            selection = returnType === "uuid" ? allSfrOptions.nameMap.useCases[value] : allSfrOptions.uuidMap.useCases[value];
          }
          break;
        }
        default:
          break;
      }

      // Push to name array
      if (selection && typeof selection === "string" && !selectionsArray.includes(selection)) {
        selectionsArray[index] = selection;
      }
    });
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return selectionsArray;
};
/**
 * Updates the tabularize rows object
 * @param rows the rows
 */
export const updateTabularizeRowsObject = (rows) => {
  try {
    const state = store.getState();
    const { element, tabularizeUI } = state.sfrWorksheetUI;
    const { currentUUID } = tabularizeUI;
    let updatedTabularize = deepCopy(getElementValuesByType(element, "tabularize"));
    const isCurrentUUID = currentUUID && currentUUID !== "" && updatedTabularize.hasOwnProperty(currentUUID);
    const isUpdatedTabularizeValid = updatedTabularize && Object.keys(updatedTabularize).length > 0;

    // Update tabularize
    if (rows && isUpdatedTabularizeValid && isCurrentUUID) {
      // Update the current tabularize item
      updatedTabularize[currentUUID] = {
        ...updatedTabularize[currentUUID],
        rows: rows,
      };

      // Update tabularize object in the slice
      updateSfrSectionElement({
        tabularize: updatedTabularize,
      });
    }
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Gets the tabularize item values
 * @param element the element
 * @param tabularizeUUID the tabularizeUUID
 * @returns {*}
 */
export const getTabularizeItemValues = (element, tabularizeUUID) => {
  let currentDefinitionString = "";
  let currentTabularize = {};

  try {
    // Get the tabularize values
    const isTabularizeUUID = tabularizeUUID && tabularizeUUID !== "";
    const isElement = element && element.hasOwnProperty("tabularize") && element.tabularize.hasOwnProperty(tabularizeUUID);

    // Gets the tabularize value
    if (isTabularizeUUID && isElement) {
      currentTabularize = deepCopy(element.tabularize[tabularizeUUID]);
      let definition = currentTabularize.hasOwnProperty("definition") ? currentTabularize.definition : [];
      currentDefinitionString = getTabularizeDefinitionString(definition);
    }
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return {
    currentTabularize,
    currentDefinitionString,
  };
};
/**
 * Gets the tabularize definition string
 * @param definition the definition
 * @returns {string}
 */
export const getTabularizeDefinitionString = (definition) => {
  let requirementString = "";

  try {
    definition.map((item) => {
      const { value, type } = item;

      if (value !== "Selectable ID" && value !== "Identifier") {
        if (type === "reqtext") {
          requirementString += `${value} `;
        } else if (type === "selectcol" || type === "textcol") {
          requirementString += `[<b>selection</b>: <i>${value}</i>] `;
        }
      }
    });
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return requirementString;
};
/**
 * Gets the sfr selectables
 * @param element the element
 * @param id the id
 * @param type the type
 * @param index the index
 * @returns {*[]}
 */
export const getSFRSelectables = (element, id, type, index = -1) => {
  let selectables = [];

  try {
    let selected = [];
    let selectableOptions = deepCopy(element.selectables);
    let selectableGroupOptions = Object.keys(deepCopy(element.selectableGroups));

    // Get teh selected values by type
    if (type === "complex" && element.selectableGroups[id].description[index].groups) {
      selected = deepCopy(element.selectableGroups[id].description[index].groups);
    } else {
      selected = deepCopy(element.selectableGroups[id].groups);
    }

    // Get the sfr selectables
    selected?.map((value, index) => {
      if (selectableOptions.hasOwnProperty(value) && value !== undefined) {
        let selection = selectableOptions[value];
        let name = selection.id ? `${selection.description} (${selection.id})` : selection.description;
        if (!selectables.includes(name)) {
          selectables[index] = name;
        }
      } else if (selectableGroupOptions.includes(value) && value !== undefined) {
        if (!selectables.includes(value)) {
          selectables[index] = value;
        }
      }
    });
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return selectables;
};

// Internal Methods
/**
 * Updates evaluation activity ref ids for management functions
 * @param event the event
 * @param activity the activity
 * @param managementFunctions the management functions
 * @param rowIndex the row index
 */
const updateEaRefIdsForManagementFunctions = (event, activity, managementFunctions, rowIndex) => {
  let activityCopy = deepCopy(activity);

  // Update refIds
  if (!activityCopy.hasOwnProperty("refIds")) {
    activityCopy.refIds = [];
  }

  if (JSON.stringify(activityCopy.refIds) !== JSON.stringify(event)) {
    activityCopy.refIds = event;

    // Update the management functions
    if (JSON.stringify(activityCopy) !== JSON.stringify(activity)) {
      updateManagementFunctionItems(
        {
          value: activityCopy,
          rowIndex,
          type: "evaluationActivity",
        },
        managementFunctions,
        true
      );
    }
  }
};

// Dispatch Methods
/**
 * Adds a new sfr component
 * @param uuid the uuid of the sfr component
 * @param component the component value, set to {} by default
 * @returns {Promise<void>}
 */
export const addNewSfrComponent = async (uuid, component = {}) => {
  const newSfrComponent = await store.dispatch(
    CREATE_SFR_COMPONENT({
      sfrUUID: uuid,
      component,
    })
  ).payload;
  const { sfrUUID, id: componentUUID } = newSfrComponent;

  // Open sfr worksheet
  if (sfrUUID && componentUUID) {
    const state = store.getState();
    const { sfrSections } = state;

    setSfrWorksheetUIItems({
      openSfrWorksheet: true,
      sfrUUID,
      componentUUID,
      sfrSections: deepCopy(sfrSections),
    });
    handleSnackBarSuccess("SFR Component Successfully Added");
  }
};
/**
 * Deletes the sfr section by type: sfr, sfrBasePP, additional, modified
 * @param type the type of sfr to be deleted (sfr, sfrBasePP, additional, modified)
 * @param sfrUUID the uuid of the sfr parent
 * @param uuid the uuid of the security content
 * @param sfrList the list of sfrs
 * @param deleteSection the section object to be deleted
 * @param deleteFormItem the form item to be deleted
 * @param message the message used for the success of deleting the sfr section
 * @returns {Promise<void>}
 */
export const deleteSfrSectionByType = async ({ type, sfrUUID, uuid, sfrList, deleteSection, deleteFormItem, message }) => {
  try {
    // Remove the accordion form item
    if (type === "sfr" || type === "sfrBasePP") {
      await store.dispatch(DELETE_ACCORDION_FORM_ITEM(deleteFormItem));
    }

    // Deletes the sfr from threat
    if (type !== "sfrBasePP") {
      await deleteSfrFromThreat(sfrList);
    }

    // Deletes the sfr based on type
    switch (type) {
      case "sfr": {
        await store.dispatch(DELETE_SFR(deleteSection));
        break;
      }
      case "sfrBasePP": {
        // Delete the sfr section and sfr components from threats
        if (sfrList && Object.keys(sfrList).length > 0) {
          const state = store.getState();
          const { sfrSections } = state;
          const uuids = Object.keys(sfrList);

          // Get the component object list
          const componentList = Object.entries(sfrSections).reduce((acc, [uuid, sfrComponent]) => {
            if (uuids.includes(uuid)) {
              return { ...acc, ...sfrComponent };
            }
          }, {});

          // Deletes the sfr components from threats
          await deleteSfrFromThreat(componentList);

          // Delete the sfr base pp
          await store.dispatch(DELETE_SFR_BASE_PP({ uuid }));

          // Update threat from base pp tags
          deleteThreatTermFromTagWithUUID(uuid);

          // Delete the sfr sections
          for (const currentUUID of uuids) {
            await deleteSfrSection(currentUUID);
          }
        }
        break;
      }
      case "additional":
      case "modified": {
        await store.dispatch(
          DELETE_BASE_PP_SFR_SECTION({
            sfrUUID,
            uuid,
            parentKey: type + "Sfrs",
          })
        );
        break;
      }
      default:
        break;
    }

    // Deletes the sfr section in the sfrSectionsSlice
    if (type !== "sfrBasePP") {
      await deleteSfrSection(uuid);
    }

    // Update the snack bar
    handleSnackBarSuccess(`${message} Section Successfully Removed`);
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  /**
   * Deletes the sfr from the threat using the uuid
   * @param sfrList the sfr list of components
   * @returns {Promise<void>}
   */
  async function deleteSfrFromThreat(sfrList) {
    try {
      if (sfrList && Object.entries(sfrList).length > 0) {
        Object.keys(sfrList).map(async (key) => {
          await store.dispatch(
            DELETE_SFR_FROM_THREAT_USING_UUID({
              sfrUUID: key,
            })
          );
        });
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  }
};
/**
 * Deletes the sfr section
 * @param uuid the uuid of the sfr section
 * @returns {Promise<void>}
 */
export const deleteSfrSection = async (uuid) => {
  await store.dispatch(
    DELETE_SFR_SECTION({
      sfrUUID: uuid,
    })
  );
};
/**
 * Gets the additional and modified sfr list
 * @param uuid the uuid of the sfr base pp
 */
export const getAdditionalAndModifiedSfrList = (uuid) => {
  let additionalSfrs = {};
  let modifiedSfrs = {};

  try {
    const state = store.getState();
    const { sfrBasePPs } = state;
    const isSfrBasePP = sfrBasePPs?.hasOwnProperty(uuid);

    if (isSfrBasePP) {
      if (sfrBasePPs[uuid].hasOwnProperty("additionalSfrs")) {
        additionalSfrs = getSfrSectionUUIDs(sfrBasePPs[uuid].additionalSfrs);
      }
      if (sfrBasePPs[uuid].hasOwnProperty("modifiedSfrs")) {
        modifiedSfrs = getSfrSectionUUIDs(sfrBasePPs[uuid].modifiedSfrs);
      }
    }
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  /**
   * Gets the sfr section UUIDs
   * @param sfrs the sfrs
   * @returns {*|{}}
   */
  function getSfrSectionUUIDs(sfrs) {
    try {
      if (sfrs?.hasOwnProperty("sfrSections")) {
        return deepCopy(sfrs.sfrSections);
      }
    } catch (e) {
      console.log(e);
    }
    return {};
  }

  return { ...additionalSfrs, ...modifiedSfrs };
};
/**
 * Updates the evaluation activities ui
 * @param updateMap the update map
 */
export const updateEvaluationActivitiesUI = (updateMap) => {
  try {
    store.dispatch(
      UPDATE_EVALUATION_ACTIVITY_UI_ITEMS({
        updateMap: updateMap,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Updates the evaluation activities
 * @param activities the activities
 */
export const updateEvaluationActivities = (activities) => {
  try {
    // Check update the evaluation activity within the sfr component
    let itemMap = {
      evaluationActivities: activities,
    };

    // Update the sfr component
    updateComponentItems(itemMap);
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Updates the tabularize UI
 * @param itemMap The itemMap object for updating the values
 * @param updateRow The boolean for updating the row if true or updating the UI items if false
 */
export const updateTabularizeUI = (itemMap, updateRow = false) => {
  try {
    // Update row data
    store.dispatch(
      UPDATE_TABULARIZE_UI_ITEMS({
        itemMap,
        updateRow,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Transforms tabularize data
 * @param inputData the input data
 * @returns {*|string|null}
 */
export const transformTabularizeData = (inputData) => {
  const { type } = inputData;

  // Transform the tabularize data
  let transformedData = store.dispatch(
    TRANSFORM_TABULARIZE_DATA({
      ...inputData,
    })
  );

  return type === "reverse" ? deepCopy(transformedData.payload.tabularize) : null;
};
/**
 * Updates the management function ui
 * @param updateMap the update map
 */
export const updateManagementFunctionUI = (updateMap) => {
  try {
    store.dispatch(
      UPDATE_MANAGEMENT_FUNCTION_UI_ITEMS({
        updateMap: updateMap,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Update management function items
 * @param data the data
 * @param managementFunctions the management functions
 * @param isRowIndexUpdate the boolean for is row index update
 */
export const updateManagementFunctionItems = (data, managementFunctions, isRowIndexUpdate = false) => {
  try {
    let currentManagementFunctions = managementFunctions ? deepCopy(managementFunctions) : {};

    // Update the specific row index type
    if (isRowIndexUpdate) {
      const { value, rowIndex, type } = data;
      currentManagementFunctions.rows[rowIndex][type] = value;
    } else {
      // Update the management functions based on the input data
      Object.entries(data).forEach(([key, value]) => {
        currentManagementFunctions[key] = value;
      });
    }

    // Update the sfr section element management functions
    updateSfrSectionElement({
      managementFunctions: currentManagementFunctions,
    });
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Updates the sfr worksheet component
 * @param sfrSections the sfr sections
 * @param terms the terms
 */
export const updateSfrWorksheetComponent = (sfrSections, terms) => {
  try {
    // Get the new sfr options map
    const newSfrOptions = store.dispatch(
      GET_ALL_SFR_OPTIONS_MAP({
        sfrSections: sfrSections,
        terms: terms,
      })
    ).payload;

    // Update the component
    store.dispatch(
      UPDATE_SFR_WORKSHEET_COMPONENT({
        sfrSections,
        newSfrOptions,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Resets the sfr worksheet ui to the default state
 */
export const resetSfrWorksheetUI = () => {
  store.dispatch(RESET_SFR_WORKSHEET_UI());
};
/**
 * Updates the component items
 * @param itemMap the item map of values to update\
 */
export const updateComponentItems = (itemMap) => {
  try {
    const state = store.getState();
    const { sfrUUID, componentUUID } = state.sfrWorksheetUI;

    // Updates the sfr component items
    store.dispatch(
      UPDATE_SFR_COMPONENT_ITEMS({
        sfrUUID: sfrUUID,
        uuid: componentUUID,
        itemMap: itemMap,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Updates the sfr section element
 * @param itemMap the item map
 */
export const updateSfrSectionElement = (itemMap) => {
  try {
    const state = store.getState();
    const { sfrUUID, componentUUID, elementUUID } = state.sfrWorksheetUI;

    // Update sfr section element
    store.dispatch(
      UPDATE_SFR_SECTION_ELEMENT({
        sfrUUID: sfrUUID,
        sectionUUID: componentUUID,
        elementUUID: elementUUID,
        itemMap: itemMap,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Sets the sfr worksheet items
 * @param itemMap the item map
 */
export const setSfrWorksheetUIItems = (itemMap) => {
  try {
    store.dispatch(
      UPDATE_SFR_WORKSHEET_ITEMS({
        itemMap,
      })
    );
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Clears the evaluation activity storage
 */
export const clearEvaluationActivityStorage = () => {
  try {
    store.dispatch(RESET_EVALUATION_ACTIVITY_UI());
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }
};
/**
 * Updates the additional sfr section
 * @param uuid the uuid
 * @param key the key
 * @param value the value
 */
export const updateAdditionalSfr = (uuid, key, value) => {
  store.dispatch(
    UPDATE_ADDITIONAL_SFRS({
      uuid,
      key,
      value,
    })
  );
};
/**
 * Updates the toe sfr section by sfr type
 * @param sfrType the sfr type (mandatory, optional, objective, selectionBased, implementationDependent)
 * @param key the key used in the toe sfr for updates
 * @param value the value to update
 */
export const updateToeSfr = (sfrType, key, value) => {
  store.dispatch(
    UPDATE_TOE_SFRS({
      sfrType,
      key,
      value,
    })
  );
};
/**
 * Updates the modified sfr section
 * @param uuid the uuid
 * @param key the key
 * @param value the value
 */
export const updateModifiedSfr = (uuid, key, value) => {
  store.dispatch(
    UPDATE_MODIFIED_SFRS({
      uuid,
      key,
      value,
    })
  );
};
/**
 * Updates the from tag for threat terms
 * @param threatUUID the threat uuid
 * @param termUUID the threat term uuid
 * @param from the threat from base pp list
 */
export const updateThreatTermFromTag = (threatUUID, termUUID, from) => {
  store.dispatch(
    UPDATE_THREAT_TERM_FROM({
      threatUUID,
      uuid: termUUID,
      from,
    })
  );
};
/**
 * Deletes the specified uuid from the threat term from base pp list if it exists
 * @param uuid the uuid of the base pp to delete
 */
export const deleteThreatTermFromTagWithUUID = (uuid) => {
  const state = store.getState();
  const { threats } = state;

  // Update threat from base pp tags
  if (threats && Object.keys(threats).length > 0) {
    Object.entries(threats)?.forEach(([threatUUID, threat]) => {
      const { terms } = threat;

      if (terms && Object.keys(terms).length > 0) {
        Object.entries(terms)?.forEach(([termUUID, term]) => {
          const { from: original } = term;
          let from = original.filter((item) => uuid !== item);

          if (JSON.stringify(from) !== JSON.stringify(original)) {
            updateThreatTermFromTag(threatUUID, termUUID, from);
          }
        });
      }
    });
  }
};

// Components
/**
 * Gets the formatted card template
 * @param header the header of the card
 * @param body the body of the card
 * @param tooltip the tooltip for the card
 * @param collapse the section collpase value
 * @param handleSectionCollapse the handler for the section collapse
 * @param headerTextColor the header text color
 * @param collapseIconColor the collapse icon color
 * @returns {JSX.Element}
 */
export const getCardTemplate = (header, body, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor) => {
  const headerText = headerTextColor ? headerTextColor : "text-secondary";
  const iconColor = collapseIconColor ? collapseIconColor : "#d926a9";

  // Return Method
  return (
    <CardTemplate
      type={"parent"}
      header={
        <Tooltip arrow title={tooltip}>
          <label className={`resize-none justify-start flex font-bold text-[14px] p-0 ${headerText}`}>{header}</label>
        </Tooltip>
      }
      body={<span className='flex justify-stretch min-w-full pb-2'>{body}</span>}
      collapse={collapse}
      collapseHandler={() => handleSectionCollapse(collapse, header)}
      tooltip={header}
      collapseIconColor={iconColor}
    />
  );
};
/**
 * Gets the toggle switch
 * @param title the title
 * @param isToggled is toggled
 * @param tooltipID tooltip id
 * @param tooltip the tooltip
 * @param updateToggleMethod the update toggle method
 * @param extendedComponentDefinition the extended component definition
 * @returns {JSX.Element}
 */
export const getToggleSwitch = (title, isToggled, tooltipID, tooltip, updateToggleMethod, extendedComponentDefinition = null) => {
  return (
    <ToggleSwitch
      title={title}
      isToggled={isToggled}
      tooltipID={tooltipID}
      tooltip={tooltip}
      isSfrWorksheetToggle={true}
      handleUpdateToggle={updateToggleMethod}
      extendedComponentDefinition={extendedComponentDefinition}
    />
  );
};
/**
 * The show management function preview section
 * @param previewToggle the preview toggle
 * @param textArray the text array
 * @param element the element (optional)
 * @returns {JSX.Element}
 */
export const showManagementFunctionPreview = (previewToggle, textArray, element = null) => {
  const section = getPreviewSection(previewToggle, textArray, element);

  // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
  // would be omitted by the RTE due to not knowing how to interpret them)
  return (
    <div className='preview' style={{ whiteSpace: "normal", lineHeight: "1.5", margin: 0, padding: 4, paddingBottom: 10 }}>
      {removeTagEqualities(section, true)}
    </div>
  );
};
/**
 * The show tabularize table preview section
 * @param previewToggle the preview toggle
 * @param textArray the text array
 * @param element the element (optional)
 * @returns {JSX.Element}
 */
export const showTabularizeTablePreview = (previewToggle, textArray, element = null) => {
  const section = getPreviewSection(previewToggle, textArray, element);

  // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
  // would be omitted by the RTE due to not knowing how to interpret them)
  return (
    <div className='preview' style={{ whiteSpace: "normal", lineHeight: "1.5", margin: 0, padding: 4, paddingBottom: 10 }}>
      {removeTagEqualities(section, true)}
    </div>
  );
};

// Internal Methods
/**
 * Gets the preview section
 * @param previewToggle the preview toggle
 * @param textArray the text array
 * @param element the element (optional)
 * @returns {string}
 */
const getPreviewSection = (previewToggle, textArray, element = null) => {
  let section = "";

  try {
    if (element === null) {
      const state = store.getState();
      element = state.sfrWorksheetUI.element;
    }

    if (previewToggle && element) {
      const { selectables, selectableGroups } = deepCopy(element);

      section = getSfrPreviewTextString({
        selectables: selectables ? deepCopy(selectables) : {},
        selectableGroups: selectableGroups ? deepCopy(selectableGroups) : {},
        currentTextArray: textArray ? textArray : [],
      });
    }
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return section;
};
