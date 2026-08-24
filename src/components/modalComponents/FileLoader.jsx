// Imports
import { useCallback, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import Modal from "./Modal.jsx";
import { Card, CardBody } from "@material-tailwind/react";
import Button from "@mui/material/Button";
import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { XMLValidator } from "fast-xml-parser";
import { create } from "xmlbuilder2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import store from "../../app/store.js";
import {
  SET_XMLTAGMETA,
  DELETE_ALL_SAR_SECTIONS,
  RESET_SAR_STATE,
  CREATE_SAR_SECTION,
  CREATE_SAR_COMPONENT,
  CREATE_SAR_ELEMENT,
} from "../../reducers/sarsSlice.js";
import * as fileParser from "../../utils/fileParser.js";
import { CREATE_TERM_ITEM, DELETE_ALL_SECTION_TERMS, RESET_TERMS_STATE, CREATE_TERMS_LIST, UPDATE_USE_CASE_INTRO } from "../../reducers/termsSlice.js";
import {
  CREATE_THREAT_TERM,
  UPDATE_THREAT_TERM_SFRS,
  DELETE_ALL_THREAT_TERMS,
  RESET_THREATS_STATE,
  UPDATE_THREAT_SECTION_DEFINITION,
  UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION,
  UPDATE_BOILERPLATE_FLAG,
} from "../../reducers/threatsSlice.js";
import {
  CREATE_OBJECTIVE_TERM,
  DELETE_ALL_OBJECTIVE_TERMS,
  RESET_OBJECTIVES_STATE,
  UPDATE_OBJECTIVE_SECTION_DEFINITION,
  UPDATE_OBJECTIVE_SECTION_METADATA,
  UPDATE_MAIN_OBJECTIVES_DEFINITION,
} from "../../reducers/objectivesSlice.js";
import { CREATE_EDITOR, UPDATE_EDITOR_TEXT, RESET_EDITOR_STATE, UPDATE_EDITOR_METADATA } from "../../reducers/editorSlice.js";
import {
  DELETE_ALL_SFR_SECTION_ELEMENTS,
  RESET_SFR_SECTION_STATE,
  CREATE_SFR_COMPONENT,
  UPDATE_SFR_COMPONENT_ITEMS,
  UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES,
} from "../../reducers/SFRs/sfrSectionSlice.js";
import {
  DELETE_ALL_SFR_SECTIONS,
  UPDATE_MAIN_SFR_DEFINITION,
  UPDATE_AUDIT_SECTION,
  RESET_SFR_STATE,
  CREATE_SFR_SECTION,
  UPDATE_TOE_SFRS,
} from "../../reducers/SFRs/sfrSlice.js";
import {
  CREATE_ACCORDION_FORM_ITEM,
  DELETE_ALL_ACCORDION_FORM_ITEMS,
  RESET_ACCORDION_PANE_STATE,
  CREATE_ACCORDION_SUB_FORM_ITEM,
  CREATE_ACCORDION_SFR_MODULE_FORM_ITEM,
  UPDATE_ACCORDION_FORM_ITEM_CONTENT_TYPE,
  updateMetaDataItem,
  updateFileUploaded,
  updatePlatforms,
  UPDATE_ACCORDION_XMLTAGMETA,
} from "../../reducers/accordionPaneSlice.js";
import { RESET_FEATURES_STATE, UPDATE_FEATURES } from "../../reducers/featuresSlice.js";
import { ADD_ENTRIES, RESET_BIBLIOGRAPHY_STATE } from "../../reducers/bibliographySlice.js";
import { SET_ENTROPY_XML, RESET_ENTROPY_APPENDIX_STATE } from "../../reducers/entropyAppendixSlice.js";
import { SET_EQUIV_GUIDELINES_XML, RESET_EQUIVALENCY_APPENDIX_STATE } from "../../reducers/equivalencyGuidelinesAppendix.js";
import { ADD_PACKAGE, RESET_PACKAGE_STATE } from "../../reducers/includePackageSlice.js";
import { SET_MODULES_XML, RESET_MODULES_STATE } from "../../reducers/moduleSlice.js";
import validator from "validator";
import { SET_SATISFIED_REQS_XML, RESET_SATISFIED_REQS_APPENDIX_STATE } from "../../reducers/satisfiedReqsAppendix.js";
import { SET_VALIDATION_GUIDELINES_XML, RESET_VALIDATION_GUIDELINES_APPENDIX_STATE } from "../../reducers/validationGuidelinesAppendix.js";
import { RESET_VECTOR_APPENDIX_STATE, SET_VECTOR_XML } from "../../reducers/vectorAppendix.js";
import { RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE, SET_ACKNOWLEDGEMENTS_XML } from "../../reducers/acknowledgementsAppendix.js";
import { RESET_PROGRESS, setProgress } from "../../reducers/progressSlice.js";
import { SET_PREFERENCE_XML, RESET_PREFERENCE_STATE } from "../../reducers/ppPreferenceSlice.js";
import {
  UPDATE_ST_CONFORMANCE_DROPDOWN,
  UPDATE_PART_2_CONFORMANCE_DROPDOWN,
  UPDATE_PART_3_CONFORMANCE_DROPDOWN,
  UPDATE_CC_ERRATA,
  CREATE_NEW_PP_CLAIM,
  CREATE_NEW_PACKAGE_CLAIM,
  CREATE_NEW_EVALUATION_METHOD,
  UPDATE_ADDITIONAL_INFORMATION_TEXT,
  RESET_CONFORMANCE_CLAIMS_STATE,
  SET_CONFORMANCE_SECTION_XMLTAGMETA,
  SET_CCLAIMS_XMLTAGMETA,
} from "../../reducers/conformanceClaimsSlice.js";
import ProgressBar from "../ProgressBar.jsx";
import { clearSessionStorageExcept, fetchTemplateData, getSfrMaps, handleSnackBarError, handleSnackBarSuccess } from "../../utils/securityComponents.jsx";
import { deepCopy } from "../../utils/deepCopy.js";
import { getPpTemplateVersion, getPpType } from "../../utils/fileParser.js";
import { areTechnicalDecisionHistoriesEqual, sanitizeImportedTechnicalDecisionHistory } from "../../utils/technicalDecisionHistory.js";
import { COMMON_REGEX, FILE_LOADER_REGEX } from "../../utils/regexUtils.js";
import { UPDATE_DISTRIBUTED_TOE_INTRO, RESET_DISTRIBUTED_TOE_STATE } from "../../reducers/distributedToeSlice.js";
import { CREATE_ACCORDION } from "../../reducers/accordionPaneSlice.js";
import {
  SET_COMPLIANT_TARGETS_OF_EVALUATION_INTRO,
  SET_COMPLIANT_TARGETS_OF_EVALUATION_ADDITIONAL_TEXT,
  LOAD_TABLE_ROWS,
  RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE,
} from "../../reducers/compliantTargetsOfEvaluationSlice.js";
import { CREATE_SFR_BASE_PP_SECTION, RESET_SFR_BASE_PP_STATE } from "../../reducers/SFRs/sfrBasePPsSlice.js";

/**
 * The FileLoader class that gives various options for file loading
 * @returns {JSX.Element}   the file loader modal content
 * @constructor             passes in props to the class
 */
function FileLoader(props) {
  // Prop Validation
  FileLoader.propTypes = {
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const state = useSelector((state) => state);
  const stateRef = useRef(state);
  const { filename } = state.accordionPane.loadedfile;

  // Use Effects
  useEffect(() => {
    stateRef.current = state;
    console.log(state);
  }, [state]);
  useEffect(() => {
    // Returns the snackbar success for loading in default xml template when dialog is closed prematurely
    if (sessionStorage.getItem("fileMenuClosed") === "true") {
      handleSnackBarSuccess(`Loaded in Default XML Template`);
      sessionStorage.removeItem("fileMenuClosed");
    }
  }, []);

  // Methods
  /**
   * Handles the dialog open
   */
  const handleOpen = () => {
    const isLoading = sessionStorage.getItem("isLoading");

    // If the dialog was closed prematurely, reset isLoading in session storage
    if (isLoading !== null && isLoading === "true") {
      try {
        // Set fileMenuClosed to true and clear out session storage
        sessionStorage.setItem("fileMenuClosed", "true");
        clearSessionStorageExcept(["fileMenuClosed"]).then(() => {
          // Reload the page
          location.reload();
        });
        sessionStorage.clear();
      } catch (e) {
        console.log(e);
        handleSnackBarError(e);
      }
    } else {
      props.handleOpen();
    }
  };
  /**
   * Handles updating the progressBar
   * @param progress  the progress as a number from 0-100
   * @param steps     any steps that should be visualized/updated
   */
  const handleProgressBar = (progress, steps) => {
    dispatch(
      setProgress({
        progress: progress,
        steps: steps,
      })
    );
  };
  /**
   * Handler to update files
   * @param file the file
   * @param content the content
   * @param currentPP the current pp
   * @param currentMod the current mod
   */
  const handleUpdateFiles = (file, content, currentPP, currentMod) => {
    if (file !== "" && content !== "") {
      dispatch(
        updateFileUploaded({
          filename: file.name,
          content: content,
          pp: currentPP !== undefined ? currentPP : false,
          mod: currentMod !== undefined ? currentMod : false,
        })
      );
    } else {
      dispatch(
        updateFileUploaded({
          filename: file,
          content: content,
          pp: currentPP !== undefined ? currentPP : false,
          mod: currentMod !== undefined ? currentMod : false,
        })
      );
    }
  };

  // Helper Methods
  /**
   * Validate syntax and store in redux
   * @param xml source xml as a string
   */
  const validate_XML = (xml) => {
    // Parse XML using xmlbuilder2
    // validate and store in redux
    try {
      setTimeout(() => {
        // Initialize loading
        setIsLoading(true);
      }, 500);

      // Validate and generate xml
      XMLValidator.validate(xml);
      var xmlReal = create(xml);

      // Load in the xml
      setTimeout(() => {
        const currentProgress = 10;
        const currentSteps = {
          "Initial File Load": true,
        };
        handleProgressBar(currentProgress, currentSteps);

        // Clear out sections
        clearOutSections();

        // LOAD XML CONTENTS INTO REDUX SLICES
        loadPPXML(xmlReal.node, xml);
      }, 1000);

      return "success";
    } catch (err) {
      const timeout = 1000;
      const errorMessage = `XML is not Valid: ${err}\nResetting to local template values.`;
      console.log(errorMessage);

      // Update snackbar
      handleSnackBarError(errorMessage);

      setTimeout(() => {
        setIsLoading(false);
      }, timeout);

      resetState();

      return "fail";
    }
  };
  /**
   * Load PP sections into redux slices
   * @param xml the xml
   */
  const loadPPXML = (xml, xmlString) => {
    let ppTemplateVersion = "CC2022 Standard";
    let ppType = "Protection Profile";

    // Create accordions, editors and terms
    try {
      let ppMeta = createDefaultSlices(xml);
      ppTemplateVersion = ppMeta.ppTemplateVersion;
      ppType = ppMeta.ppType;
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    } finally {
      // Load all file values
      // TODO: Progress bar can likely be removed now that XML loading is significantly faster
      setTimeout(() => {
        loadXml(xml, xmlString, ppType, ppTemplateVersion);

        // Update progress
        const currentProgress = 30;
        const currentSteps = {
          Packages: true,
          Modules: true,
          Platforms: true,
          "PP Reference": true,
          Overview: true,
          "TOE Overview": true,
        };
        handleProgressBar(currentProgress, currentSteps);
      }, 500);
      setTimeout(() => {
        // Update progress
        const currentProgress = 50;
        const currentSteps = {
          "Document Scope": true,
          "Intended Readership": true,
          "Tech Terms": true,
          "Use Cases": true,
          "Conformance Claims": true,
        };
        handleProgressBar(currentProgress, currentSteps);
      }, 500);

      setTimeout(() => {
        // Update progress
        const currentProgress = 70;
        const currentSteps = {
          Objectives: true,
          OEs: true,
          Threats: true,
          Assumptions: true,
        };
        handleProgressBar(currentProgress, currentSteps);

        if (ppType !== "Module") {
          loadSecurityRequirement(xml);
          loadSARs(xml);
        }
      }, 500);
      setTimeout(() => {
        // Update progress
        const currentProgress = 90;
        const currentSteps = {
          SFRs: true,
          SARS: true,
        };
        handleProgressBar(currentProgress, currentSteps);
      }, 500);
      setTimeout(() => {
        loadCustomCSS(xml);
        // Update progress
        const currentProgress = 100;
        const currentSteps = {
          Appendices: true,
        };
        handleProgressBar(currentProgress, currentSteps);

        // Update selection dependencies with their UUIDs (for component and simple selectables)
        convertSelDepToUUIDs();
      }, 500);
    }
  };
  /**
   * Selector function to get UUID by title
   * @param slice the slice
   * @param title the title
   * @returns {null|string} the uuid, null if no matching title is found
   */
  const getUUIDByTitle = (slice, title) => {
    for (const [uuid, termDetails] of Object.entries(slice)) {
      if (termDetails.title === title) {
        return uuid;
      }
    }
    return null; // return null if no matching title is found
  };
  /**
   * Checks whether a nested form item is already attached to a parent form item.
   * @param accordionUUID the parent accordion uuid
   * @param parentUUID the parent form item uuid
   * @param childUUID the child form item uuid
   * @returns {boolean}
   */
  const isSubFormItemPresent = (accordionUUID, parentUUID, childUUID) => {
    const accordion = stateRef.current.accordionPane.sections?.[accordionUUID];
    const parentFormItem = accordion?.formItems?.find((formItem) => formItem.uuid === parentUUID);

    return parentFormItem?.formItems?.some((formItem) => formItem.uuid === childUUID) || false;
  };
  /**
   * Delete all existing data in a certain section
   */
  const clear_section = (slice, sliceName, sectionTitle = "") => {
    const { accordionPane: stateAccordionPane, editors: stateEditors } = stateRef.current;
    const sectionUUID = getUUIDByTitle(slice, sectionTitle);

    try {
      switch (sliceName) {
        case "objectives": {
          dispatch(DELETE_ALL_OBJECTIVE_TERMS({ title: sectionTitle, objectiveUUID: sectionUUID }));
          return;
        }
        case "terms": {
          dispatch(DELETE_ALL_SECTION_TERMS({ title: sectionTitle, termUUID: sectionUUID }));
          return;
        }
        case "threats": {
          dispatch(DELETE_ALL_THREAT_TERMS({ title: sectionTitle, threatUUID: sectionUUID }));
          return;
        }
        case "sfrs": {
          // Delete definition(intro to security requirements section)
          dispatch(UPDATE_MAIN_SFR_DEFINITION({ newDefinition: "" }));

          // Delete the SFR Components
          dispatch(DELETE_ALL_SFR_SECTION_ELEMENTS());
          // Delete the SFR Class/Family
          // Get UUID of accordionPane.sections where title is "Security Requirements"
          const secReqsUUID = getUUIDByTitle(stateAccordionPane.sections, "Security Requirements");

          // Delete SFR/SAR accordions
          dispatch(DELETE_ALL_ACCORDION_FORM_ITEMS({ accordionUUID: secReqsUUID }));

          // Delete any intro text (part of editor slice)
          const sfrEditorUUID = getUUIDByTitle(stateEditors, "Security Functional Requirements");
          dispatch(UPDATE_EDITOR_TEXT({ uuid: sfrEditorUUID, newText: "" }));

          // Delete the SFR sections
          dispatch(DELETE_ALL_SFR_SECTIONS());
          return;
        }
        case "sars": {
          // Delete SAR Family (and associated component + elements)
          dispatch(DELETE_ALL_SAR_SECTIONS());

          // Delete any intro text (part of editor slice)
          const sarEditorUUID = getUUIDByTitle(stateEditors, "Security Assurance Requirements");
          dispatch(UPDATE_EDITOR_TEXT({ uuid: sarEditorUUID, newText: "" }));

          return;
        }
        case "conformance_claims": {
          const conformanceClaimsUUID = getUUIDByTitle(stateAccordionPane.sections, sectionTitle);
          if (
            stateAccordionPane.sections.hasOwnProperty(conformanceClaimsUUID) &&
            stateAccordionPane.sections[conformanceClaimsUUID].hasOwnProperty("formItems")
          ) {
            const cc_section_uuids = stateAccordionPane.sections[conformanceClaimsUUID].formItems.map((editor) => editor.uuid);

            cc_section_uuids.forEach((uuid) => {
              dispatch(UPDATE_EDITOR_TEXT({ uuid: uuid, newText: "" }));
            });
          }
          return;
        }
        default:
          return null;
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Clears out the sections
   */
  const clearOutSections = () => {
    const {
      accordionPane: stateAccordionPane,
      objectives: stateObjectives,
      sars: stateSars,
      sfrs: stateSfrs,
      terms: stateTerms,
      threats: stateThreats,
    } = stateRef.current;

    // Clear out existing Tech Terms
    clear_section(stateTerms, "terms", "Technical Terms");

    // Clear out existing Use Cases
    clear_section(stateTerms, "terms", "Use Cases");

    // Clear out existing Conformance Claims
    clear_section(stateAccordionPane.sections, "conformance_claims", "Conformance Claims");

    // Clear out existing Objectives
    clear_section(stateObjectives, "objectives", "Security Objectives for the TOE");

    // Clear out existing OEs
    clear_section(stateObjectives, "objectives", "Security Objectives for the Operational Environment");

    // Clear out existing Threats
    clear_section(stateThreats, "threats", "Threats");

    // Clear out existing Assumptions
    clear_section(stateThreats, "threats", "Assumptions");

    // Clear out existing SFR Sections
    clear_section(stateSfrs.sections, "sfrs");

    // Clear out existing SAR Sections
    clear_section(stateSars, "sars");
  };
  /**
   * Handles removing files by resetting the state
   */
  const resetState = () => {
    setTimeout(() => {
      // Reset states to initial state
      dispatch(RESET_TERMS_STATE());
      dispatch(RESET_THREATS_STATE());
      dispatch(RESET_OBJECTIVES_STATE());
      dispatch(RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE());
      dispatch(RESET_EDITOR_STATE());
      dispatch(RESET_SFR_SECTION_STATE());
      dispatch(RESET_SFR_STATE());
      dispatch(RESET_SAR_STATE());
      dispatch(RESET_ACCORDION_PANE_STATE());
      dispatch(RESET_FEATURES_STATE());
      dispatch(RESET_PACKAGE_STATE());
      dispatch(RESET_BIBLIOGRAPHY_STATE());
      dispatch(RESET_MODULES_STATE());
      dispatch(RESET_ENTROPY_APPENDIX_STATE());
      dispatch(RESET_EQUIVALENCY_APPENDIX_STATE());
      dispatch(RESET_SATISFIED_REQS_APPENDIX_STATE());
      dispatch(RESET_VALIDATION_GUIDELINES_APPENDIX_STATE());
      dispatch(RESET_VECTOR_APPENDIX_STATE());
      dispatch(RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE());
      dispatch(RESET_PROGRESS());
      dispatch(RESET_PREFERENCE_STATE());
      dispatch(RESET_CONFORMANCE_CLAIMS_STATE());
      dispatch(RESET_DISTRIBUTED_TOE_STATE());
      dispatch(RESET_SFR_BASE_PP_STATE());
    }, 300);
  };
  /**
   * Loads xml prolog tags <?xml> <?xml-stylesheet> <?xml-model>
   * @param xml the xml
   * @param xmlString xml string
   */
  const loadPrologTags = (xml, xmlString) => {
    const prologTags = fileParser.getPrologTags(xml, xmlString);

    dispatch(updateMetaDataItem({ type: "prologTags", item: prologTags }));
  };
  /**
   * Loads in the PP Reference
   * @param xml the xml
   * @param ppType PP, Module, Functional Package
   */
  const loadPPReference = (xml, ppType) => {
    const ppReference = fileParser.getPPReference(xml);
    const ppMeta = fileParser.getPPMetadata(xml, ppType);

    dispatch(updateMetaDataItem({ type: "xmlTagMeta", item: ppMeta }));
    dispatch(updateMetaDataItem({ type: "ppName", item: ppReference.PPTitle }));
    dispatch(updateMetaDataItem({ type: "author", item: ppReference.PPAuthor }));
    dispatch(updateMetaDataItem({ type: "keywords", item: ppReference.Keywords }));
    dispatch(updateMetaDataItem({ type: "version", item: ppReference.PPVersion }));
    dispatch(updateMetaDataItem({ type: "releaseDate", item: ppReference.PPPubDate }));
    dispatch(updateMetaDataItem({ type: "revisionHistory", item: ppReference.RevisionHistory }));
    dispatch(updateMetaDataItem({ type: "technicalDecisionHistory", item: ppReference.TechnicalDecisionHistory }));
  };
  /**
   * Removes imported TD affects refs that do not point to an imported component CC-ID or element XML ID.
   */
  const cleanImportedTechnicalDecisionAffects = () => {
    const currentState = store.getState();
    const technicalDecisionHistory = currentState.accordionPane.metadata.technicalDecisionHistory;
    const sanitizedTechnicalDecisionHistory = sanitizeImportedTechnicalDecisionHistory(technicalDecisionHistory, currentState.sfrSections);

    if (!areTechnicalDecisionHistoriesEqual(technicalDecisionHistory, sanitizedTechnicalDecisionHistory)) {
      dispatch(
        updateMetaDataItem({
          type: "technicalDecisionHistory",
          item: sanitizedTechnicalDecisionHistory,
        })
      );
    }
  };
  /**
   * Loads the external package dependencies
   * @param xml the xml
   */
  const loadPackages = (xml) => {
    const packages = fileParser.getExternalPackages(xml);

    if (packages.length != 0) {
      packages.forEach((p) => {
        dispatch(ADD_PACKAGE({ pkg: p }));
      });
    }
  };
  /**
   * Loads the <pp-preferences>
   * @param xml the xml
   */
  const loadPreferences = (xml) => {
    const preferences = fileParser.getPPPreference(xml);

    if (preferences.length != 0) {
      dispatch(SET_PREFERENCE_XML({ preference: preferences }));
    }
  };
  /**
   * Loads the external module dependencies
   * @param xml the xml
   */
  const loadModules = (xml) => {
    const mods = fileParser.getExternalModules(xml);

    if (mods.length != 0) {
      dispatch(SET_MODULES_XML({ modules: mods }));
    }
  };
  /**
   * Loads the platforms
   * @param platformMeta parsed platform data
   */
  const loadPlatforms = (platformMeta) => {
    const platformData = platformMeta.platformObj;
    const platformXML = platformMeta.platformRawXML;

    if (platformData.platforms.length !== 0) {
      dispatch(
        updatePlatforms({
          description: platformData.description,
          platforms: platformData.platforms,
          xml: platformXML,
        })
      );
    }
  };
  /**
   * Loads the implementation-dependent feature catalog into the Introduction section
   * @param implementationData parsed implementation-dependent feature data
   */
  const loadImplementations = (implementationData) => {
    const { accordionPane: stateAccordionPane, features: stateFeatures } = stateRef.current;
    const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");
    const introduction = stateAccordionPane.sections[introductionUUID];
    const implementationUUID = stateFeatures?.uuid || implementationData.uuid || uuidv4();
    const existingImplementationFormItem = introduction?.formItems?.find(
      (formItem) => formItem.uuid === implementationUUID || formItem.contentType === "implementations"
    );

    dispatch(
      UPDATE_FEATURES({
        itemMap: {
          ...implementationData,
          uuid: implementationUUID,
        },
      })
    );

    if (introductionUUID && !existingImplementationFormItem) {
      dispatch(
        CREATE_ACCORDION_FORM_ITEM({
          accordionUUID: introductionUUID,
          uuid: implementationUUID,
          contentType: "implementations",
        })
      );
    } else if (introductionUUID) {
      dispatch(
        UPDATE_ACCORDION_FORM_ITEM_CONTENT_TYPE({
          accordionUUID: introductionUUID,
          uuid: existingImplementationFormItem.uuid,
          newUUID: implementationUUID,
          contentType: "implementations",
        })
      );
    }
  };
  /**
   * This function loads all the parsed XML data into the store
   * @param xml the xml
   * @param ppType PP, Module, Functional Package
   * @param ppVersion PP template version
   */
  // const loadXml = (xml, ppType, ppVersion) => {
  const loadXml = (xml, xmlString, ppType, ppVersion) => {
    let useCaseMap = {};
    let objectivesMap;
    let sfrToObjectivesMap;
    let objectivetoSfrsMap;
    let threatWithSFR;
    let sfrsMap;

    // Error handling - to point to specific section
    const safeLoad = (sectionName, fn) => {
      try {
        fn();
      } catch (err) {
        const errorMessage = `Failed to load section: "${sectionName}" - ${err}`;
        console.error(errorMessage, err);
        handleSnackBarError(errorMessage);
      }
    };

    try {
      // Load metadata and structural components first
      safeLoad("Packages", () => loadPackages(xml));
      safeLoad("Modules", () => loadModules(xml));
      safeLoad("PP Reference", () => loadPPReference(xml, ppType));
      safeLoad("Preferences", () => loadPreferences(xml));
      safeLoad("Prolog Tags", () => loadPrologTags(xml, xmlString));

      // Parse main XML data
      let returnObject = fileParser.getXmlData(xml, ppType, ppVersion);
      if (returnObject.parseErrors?.length > 0) {
        const errorMessage = `Failed to parse sections: ${returnObject.parseErrors.join(", ")}`;
        console.error(errorMessage);
        handleSnackBarError(errorMessage);
      }

      // 1.0 Introduction
      for (const introSection of returnObject.intro) {
        if ("overview" in introSection) {
          safeLoad("Introduction > Overview", () => loadOverview(introSection.overview));
        } else if ("techTerms" in introSection) {
          safeLoad("Introduction > Tech Terms", () => loadTechTerms(introSection.techTerms));
        } else if ("compliantTOE" in introSection) {
          safeLoad("Introduction > Compliant TOE", () => loadTOEOverview(introSection.compliantTOE, ppType));
        } else if ("useCaseDescription" in introSection) {
          safeLoad("Introduction > Use Cases", () => {
            const useCasesIndex = returnObject.intro.findIndex((introSection) => introSection.hasOwnProperty("useCases"));
            const useCases = useCasesIndex !== -1 ? returnObject.intro[useCasesIndex].useCases : [];
            useCaseMap = loadUseCase(introSection.useCaseDescription, useCases);
          });
        } else if ("platforms" in introSection) {
          safeLoad("Introduction > Platforms", () => loadPlatforms(introSection.platforms));
        } else if ("implementations" in introSection) {
          safeLoad("Introduction > Implementation-dependent Requirements", () => loadImplementations(introSection.implementations));
        } else if ("scope" in introSection) {
          safeLoad("Introduction > Scope", () => loadDocumentScope(introSection.scope));
        } else if ("intended" in introSection) {
          safeLoad("Introduction > Intended Readership", () => loadIntendedReadership(introSection.intended));
        }
      }

      // 1.0 Intro custom sections
      returnObject.customIntro.forEach((customIntroSec, idx) => {
        safeLoad(`Introduction > Custom Section [${idx}]`, () => loadCustomIntroSections(customIntroSec));
      });

      // 2.0 Conformance Claims
      if (returnObject.cClaims?.cClaims && returnObject.cClaims?.cClaimsAttributes) {
        safeLoad("Conformance Claims", () => loadConformanceClaim(returnObject.cClaims.cClaims, returnObject.cClaims?.cClaimsAttributes));
      }

      // 4.0 Security Objectives
      if (returnObject.securityObjectives?.objectivesDefinition) {
        safeLoad("Security Objectives > Definition", () =>
          dispatch(UPDATE_MAIN_OBJECTIVES_DEFINITION({ newDefinition: returnObject.securityObjectives.objectivesDefinition }))
        );
      }
      if (returnObject.securityObjectives?.toeObjectives) {
        safeLoad("Security Objectives > TOE Objectives", () => {
          ({ objectivesMap, sfrToObjectivesMap, objectivetoSfrsMap } = loadObjectives(returnObject.securityObjectives.toeObjectives));
        });
      }
      if (returnObject.securityObjectives?.oeObjectives) {
        safeLoad("Security Objectives > OE Objectives", () => {
          const { intro, securityObjectives, xmlTagMeta } = returnObject.securityObjectives.oeObjectives;
          loadOEs(intro, securityObjectives, objectivesMap, xmlTagMeta);
        });
      }

      // 3.0 (for MDM) Distributed TOE
      if (Object.keys(returnObject.distributedToe).length > 0) {
        safeLoad("Distributed TOE", () => loadDistributedTOE(returnObject.distributedToe));
      }

      // 3.0 Security Problem Definition
      if (returnObject.spd.definition) {
        safeLoad("Security Problem Definition > Description", () => loadSecurityProblemDescription(returnObject.spd.definition));
      }
      if (returnObject.spd.threats) {
        safeLoad("Security Problem Definition > Threats", () => {
          threatWithSFR = loadThreats(returnObject.spd.threats, objectivesMap, objectivetoSfrsMap, ppVersion);
        });
      }
      if (returnObject.spd.assumptions) {
        safeLoad("Security Problem Definition > Assumptions", () => loadAssumptions(returnObject.spd.assumptions, objectivesMap));
      }
      if (returnObject.spd.osp) {
        safeLoad("Security Problem Definition > OSPs", () => loadOSPs(returnObject.spd.osp, objectivesMap));
      }
      if (returnObject.spd.xmlTagMeta) {
        safeLoad("Security Problem Definition > XML Tag Meta", () => {
          const spdUUID = getUUIDByTitle(stateRef.current.accordionPane.sections, "Security Problem Definition");
          dispatch(UPDATE_ACCORDION_XMLTAGMETA({ uuid: spdUUID, xmlTagMeta: returnObject.spd.xmlTagMeta }));
        });
      }

      // 5.0 Security Requirements
      if (returnObject.sfr.sfrs) {
        safeLoad("Security Requirements > SFRs", () => {
          loadSFRs(returnObject.sfr.sfrs, sfrToObjectivesMap, useCaseMap, returnObject.sfr.auditSection, ppType);
          if (ppType === "Module") {
            safeLoad("Security Requirements > Base PPs", () => loadBasePPs(xml));
            safeLoad("Security Requirements > SFR Audit Tables", () => loadSfrAuditTables(xml));
          }
          safeLoad("Security Requirements > Technical Decision Affects Cleanup", () => cleanImportedTechnicalDecisionAffects());
        });
      }
      if (returnObject.sfr.xmlTagMeta) {
        safeLoad("Security Requirements > XML Tag Meta", () => {
          const sfrUUID = getUUIDByTitle(stateRef.current.accordionPane.sections, "Security Requirements");
          dispatch(UPDATE_ACCORDION_XMLTAGMETA({ uuid: sfrUUID, xmlTagMeta: returnObject.sfr.xmlTagMeta }));
        });
      }

      // Add SFR data to threats
      if (ppVersion !== "Version 3.1" && threatWithSFR) {
        safeLoad("Threats > SFR Rationale Update", () => {
          sfrsMap = getSfrMaps().sfrNameMap;
          updateUUIDDirectRationale(sfrsMap, threatWithSFR, ppType);
        });
      }

      // Custom top level sections
      returnObject.custom.forEach((customSection, idx) => {
        safeLoad(`Custom Section [${idx}]`, () => loadCustomTopLevelSections(customSection));
      });

      // Appendices
      for (const appendix of returnObject.appendices) {
        if ("entropy" in appendix) {
          safeLoad("Appendix > Entropy", () => loadEntropyAppendix(appendix.entropy));
        } else if ("satisfied" in appendix) {
          safeLoad("Appendix > Satisfied Requirements", () => loadSatisfiedReqsAppendix(appendix.satisfied));
        } else if ("bibliography" in appendix) {
          safeLoad("Appendix > Bibliography", () => loadBibliography(appendix.bibliography));
        } else if ("acknowledgements" in appendix) {
          safeLoad("Appendix > Acknowledgements", () => loadAcknowledgementsAppendix(appendix.acknowledgements));
        } else if ("validation" in appendix) {
          safeLoad("Appendix > Validation Guidelines", () => loadValidationGuidelinesAppendix(appendix.validation));
        } else if ("equivalency" in appendix) {
          safeLoad("Appendix > Equivalency Guidelines", () => loadGuidelinesAppendix(appendix.equivalency));
        } else if ("vector" in appendix) {
          safeLoad("Appendix > Vector", () => loadVectorAppendix(appendix.vector));
        }
      }
    } catch (err) {
      const errorMessage = `Failed to load XML: ${err}`;
      console.error(errorMessage, err);
      handleSnackBarError(errorMessage);
    }
  };

  /**
   * Loads the overview
   * @param overviewData parsed overview data
   */
  const loadOverview = (overviewData) => {
    const { editors: stateEditors } = stateRef.current;
    const overviewUUID = getUUIDByTitle(stateEditors, "Objectives of Document");
    if (overviewData.doc_objectives.length != 0) {
      dispatch(UPDATE_EDITOR_TEXT({ uuid: overviewUUID, newText: overviewData.doc_objectives }));
    }

    dispatch(UPDATE_EDITOR_METADATA({ uuid: overviewUUID, xmlTagMeta: overviewData.xmlTagMeta }));
  };
  /**
   * Loads the Distributed TOE section
   * @param distributedTOE object containing the intro, registration,
   * allocation, security sections of Distributed TOE
   */
  const loadDistributedTOE = (distributedTOE) => {
    // create TOE accordion section and update intro
    const accordionUUID = dispatch(
      CREATE_ACCORDION({
        title: "Distributed TOE",
        selected_section: "Conformance Claims",
      })
    ).payload.uuid;
    dispatch(
      UPDATE_DISTRIBUTED_TOE_INTRO({
        newIntro: distributedTOE.intro.xml,
        xmlTagMeta: distributedTOE.intro.xmlTagMeta,
      })
    );

    // create sub-sections
    for (let key of Object.keys(distributedTOE)) {
      if (key === "intro") continue;
      let editorUUID = dispatch(CREATE_EDITOR({ title: distributedTOE[key].xmlTagMeta.attributes.title })).payload;
      dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: distributedTOE[key].xml }));
      dispatch(UPDATE_EDITOR_METADATA({ uuid: editorUUID, xmlTagMeta: distributedTOE[key].xmlTagMeta }));
      dispatch(
        CREATE_ACCORDION_FORM_ITEM({
          accordionUUID: accordionUUID,
          uuid: editorUUID,
          contentType: "editor",
        })
      );
    }
  };
  /**
   * Loads the TOE overview
   * @param compliantTOE parsed compliantTOE data
   * @param ppType the pp type
   */
  const loadTOEOverview = (compliantTOE, ppType) => {
    const { accordionPane: stateAccordionPane, editors: stateEditors } = stateRef.current;
    const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");
    const TOEoverviewUUID = getUUIDByTitle(stateEditors, "TOE Overview");

    if (compliantTOE) {
      const toeOverview = compliantTOE.toe_overview;

      if (ppType === "Functional Package") {
        dispatch(SET_COMPLIANT_TARGETS_OF_EVALUATION_INTRO({ text: toeOverview }));
        dispatch(SET_COMPLIANT_TARGETS_OF_EVALUATION_ADDITIONAL_TEXT({ text: compliantTOE.additionalText }));

        const components = compliantTOE.components;
        dispatch(LOAD_TABLE_ROWS({ components: components }));
      } else {
        const toeBoundary = compliantTOE.toe_boundary;
        const toePlatform = compliantTOE.toe_platform;
        const toeOE = compliantTOE.toe_oe;
        const loadedSubsectionUUIDs = {};

        // Load TOE Overview (if exists)
        dispatch(UPDATE_EDITOR_TEXT({ uuid: TOEoverviewUUID, newText: toeOverview }));

        // Update with imported tagname/attributes
        dispatch(UPDATE_EDITOR_METADATA({ uuid: TOEoverviewUUID, xmlTagMeta: compliantTOE.xmlTagMeta }));

        const defaultSubsections = [
          { title: "TOE Boundary", content: toeBoundary, xmlTagMeta: { tagName: "sec:TOE_Boundary", attributes: {} } },
          { title: "TOE Platform", content: toePlatform, xmlTagMeta: { tagName: "sec:TOE_Platform", attributes: {} } },
          {
            title: "TOE Operational Environment",
            content: toeOE.content,
            xmlTagMeta: { tagName: toeOE.tagName, attributes: toeOE.attributes },
          },
        ];
        const subsections = compliantTOE.subsections?.length > 0 ? compliantTOE.subsections : defaultSubsections;

        subsections.forEach((subsection) => {
          const title = subsection.title;
          const content = subsection.content || "";
          const xmlTagMeta = subsection.xmlTagMeta || { tagName: "section", attributes: { title } };

          if (!title || content.length === 0) {
            return;
          }

          let editorUUID = loadedSubsectionUUIDs[title] || getUUIDByTitle(stateEditors, title);

          if (!editorUUID) {
            editorUUID = dispatch(CREATE_EDITOR({ title, xmlTagMeta })).payload;
          }

          if (editorUUID) {
            loadedSubsectionUUIDs[title] = editorUUID;

            if (!isSubFormItemPresent(introductionUUID, TOEoverviewUUID, editorUUID)) {
              dispatch(
                CREATE_ACCORDION_SUB_FORM_ITEM({
                  accordionUUID: introductionUUID,
                  uuid: editorUUID,
                  formUUID: TOEoverviewUUID,
                  contentType: "editor",
                })
              );
            }

            dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: content }));
            dispatch(UPDATE_EDITOR_METADATA({ uuid: editorUUID, xmlTagMeta }));
          }
        });
      }
    }
  };
  /**
   * Loads the Scope of the Document Section (if exists)
   * @param documentScope
   */
  const loadDocumentScope = (documentScope) => {
    const { accordionPane: stateAccordionPane } = stateRef.current;
    const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");

    let editorUUID = dispatch(CREATE_EDITOR({ title: "Scope of Document" })).payload;
    dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: documentScope }));

    // Add the editor to the Introduction section
    if (editorUUID) {
      dispatch(
        CREATE_ACCORDION_FORM_ITEM({
          accordionUUID: introductionUUID,
          uuid: editorUUID,
          contentType: "editor",
        })
      );
    }
  };
  /**
   * Loads the Scope of the Document Section (if exists)
   * @param intendedReadership
   */
  const loadIntendedReadership = (intendedReadership) => {
    const { accordionPane: stateAccordionPane } = stateRef.current;
    const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");

    let editorUUID = dispatch(CREATE_EDITOR({ title: "Intended Readership" })).payload;
    dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: intendedReadership }));

    // Add the editor to the Introduction section
    if (editorUUID) {
      dispatch(
        CREATE_ACCORDION_FORM_ITEM({
          accordionUUID: introductionUUID,
          uuid: editorUUID,
          contentType: "editor",
        })
      );
    }
  };
  /**
   * Loads the tech terms
   * @param terms parsed terms data
   */
  const loadTechTerms = (terms) => {
    // Get UUID of the Tech Terms section in order to add terms to that section
    const { terms: stateTerms } = stateRef.current;
    const termUUID = getUUIDByTitle(stateTerms, "Technical Terms");
    const acronymUUID = getUUIDByTitle(stateTerms, "Acronyms");
    const suppressedUUID = getUUIDByTitle(stateTerms, "Suppressed Terms");

    if (terms) {
      const { termsArray, acronymsArray, suppressedTermsArray } = terms;

      const dispatchTerms = (array, uuid) => {
        Object.values(array).forEach((term) => {
          dispatch(
            CREATE_TERM_ITEM({
              termUUID: uuid,
              name: term.name,
              abbr: term.abbr,
              definition: term.definition,
              tagMeta: term.xmlTagMeta,
            })
          );
        });
      };

      dispatchTerms(termsArray, termUUID);
      dispatchTerms(acronymsArray, acronymUUID);
      dispatchTerms(suppressedTermsArray, suppressedUUID);
    }
  };
  /**
   * Loads the use cases
   * @param useCaseDescription description
   * @param allUseCases use cases array
   */
  const loadUseCase = (useCaseDescription, allUseCases) => {
    let useCaseMap = {};
    const { terms: stateTerms } = stateRef.current;
    const useCaseUUID = getUUIDByTitle(stateTerms, "Use Cases");

    if (useCaseDescription.length != 0) {
      dispatch(UPDATE_USE_CASE_INTRO({ uuid: useCaseUUID, newIntro: useCaseDescription }));
    }

    if (allUseCases && allUseCases.length != 0) {
      Object.values(allUseCases).map((term) => {
        const result = dispatch(
          CREATE_TERM_ITEM({
            termUUID: useCaseUUID,
            name: term.name,
            definition: term.description,
            useCaseConfig: term.useCaseConfig,
            tagMeta: term.xmlTagMeta,
          })
        );
        const uuid = result.payload.uuid;
        const id = term.id;
        if (!useCaseMap.hasOwnProperty(id)) {
          useCaseMap[id] = uuid;
        }
      });
    }
    return useCaseMap;
  };
  /**
   * Loads the conformance claim
   * @param xml the xml
   */
  const loadConformanceClaim = (allCClaims, cClaimsAttributes) => {
    // Helper function to take PPs that are both conformant and configuration and store in its own array (to avoid duplicates in UI)
    function consolidatePPs(conformantPPs, configurationPPs, consolidatedPPs) {
      for (let i = conformantPPs.length - 1; i >= 0; i--) {
        const sourceDescription = conformantPPs[i].description;
        const matchIndex = configurationPPs.findIndex((pp) => pp.description === sourceDescription);

        if (matchIndex !== -1) {
          // If a match is found, store separately
          consolidatedPPs.push(conformantPPs[i]);

          // Remove the matched object from both arrays
          conformantPPs.splice(i, 1);
          configurationPPs.splice(matchIndex, 1);
        }
      }
    }

    dispatch(SET_CONFORMANCE_SECTION_XMLTAGMETA({ xmlTagMeta: allCClaims.sectionXMLTagMeta }));
    dispatch(SET_CCLAIMS_XMLTAGMETA({ cClaimsXMLTagMeta: allCClaims.cClaimsXMLTagMeta }));

    const { editors: stateEditors } = stateRef.current;
    const conformanceStatementUUID = getUUIDByTitle(stateEditors, "Conformance Statement");
    const ccConformanceClaimsUUID = getUUIDByTitle(stateEditors, "CC Conformance Claims");
    const ppClaimUUID = getUUIDByTitle(stateEditors, "PP Claims");
    const packageClaimUUID = getUUIDByTitle(stateEditors, "Package Claims");

    if (cClaimsAttributes) {
      dispatch(UPDATE_CC_ERRATA({ cc_errata: cClaimsAttributes["cc-errata"] }));
    }

    if (allCClaims.cclaimArray.length != 0) {
      Object.values(allCClaims.cclaimArray).map((claim) => {
        const name = claim.name;
        const description = claim.description;

        switch (name) {
          case "Conformance Statement":
            dispatch(UPDATE_EDITOR_TEXT({ uuid: conformanceStatementUUID, newText: description }));
            return;
          case "CC Conformance Claims":
            dispatch(UPDATE_EDITOR_TEXT({ uuid: ccConformanceClaimsUUID, newText: description }));
            return;
          case "PP Claim":
            dispatch(UPDATE_EDITOR_TEXT({ uuid: ppClaimUUID, newText: description }));
            return;
          case "Package Claim":
            dispatch(UPDATE_EDITOR_TEXT({ uuid: packageClaimUUID, newText: description }));
            return;
          case "Conformance CC2022":
            if (claim.tagName === "cc-st-conf") {
              dispatch(UPDATE_ST_CONFORMANCE_DROPDOWN({ stConformance: claim.description }));
            } else if (claim.tagName === "cc-pt2-conf") {
              dispatch(UPDATE_PART_2_CONFORMANCE_DROPDOWN({ part2Conformance: claim.description }));
            } else if (claim.tagName === "cc-pt3-conf") {
              dispatch(UPDATE_PART_3_CONFORMANCE_DROPDOWN({ part3Conformance: claim.description }));
            }
            return;
          case "PP Claim CC2022":
            // Initialize the conformantConfig array - need to consolidate the PPs that are both conformant and configuration
            claim.conformantAndConfig = [];
            consolidatePPs(claim.ppClaim, claim.configurations.pp, claim.conformantAndConfig);

            // Store PP that is conformant and part of configuration
            claim.conformantAndConfig.forEach((claim) => {
              dispatch(
                CREATE_NEW_PP_CLAIM({
                  isPP: true,
                  status: ["Conformance", "Configuration"],
                  description: claim.description,
                })
              );
            });

            // Store PP that is only conformant
            claim.ppClaim.forEach((claim) => {
              dispatch(CREATE_NEW_PP_CLAIM({ isPP: true, status: ["Conformance"], description: claim.description }));
            });

            // Store PP/Modules that are part of configuration
            claim.configurations.pp.forEach((pp) => {
              dispatch(CREATE_NEW_PP_CLAIM({ isPP: true, status: ["Configuration"], description: pp.description }));
            });
            claim.configurations.modules.forEach((module) => {
              dispatch(
                CREATE_NEW_PP_CLAIM({
                  isPP: false,
                  status: ["Configuration"],
                  description: module.description,
                })
              );
            });
            return;
          case "Package Claim CC2022":
            claim.configurations.assurancePackages.forEach((aP) => {
              dispatch(CREATE_NEW_PACKAGE_CLAIM({ isFunctional: false, conf: aP.conf, text: aP.description }));
            });

            claim.configurations.functionalPackages.forEach((fP) => {
              dispatch(CREATE_NEW_PACKAGE_CLAIM({ isFunctional: true, conf: fP.conf, text: fP.description }));
            });
            return;
          case "Evaluation Methods CC2022":
            claim.methods.forEach((method) => {
              dispatch(CREATE_NEW_EVALUATION_METHOD({ method: method.description }));
            });
            return;
          case "CClaim Additional Info CC2022":
            dispatch(UPDATE_ADDITIONAL_INFORMATION_TEXT({ value: claim.description }));
            return;
          default:
            return null;
        }
      });
    }
  };
  /**
   * Loads the objectives
   * @param toeObjectives
   * @returns {{objectivesMap: {}, sfrToObjectivesMap: {}}} the objectives and sfrToObjectives maps
   */
  const loadObjectives = (toeObjectives) => {
    let objectivesMap = {};
    let sfrToObjectivesMap = {};
    let objectivetoSfrsMap = {};

    // Get Objectives
    const { objectives: stateObjectives } = stateRef.current;
    const objectivesUUID = getUUIDByTitle(stateObjectives, "Security Objectives for the TOE");

    Object.values(toeObjectives).map((objective) => {
      const name = objective.name;
      const definition = objective.definition;
      const sfrs = objective.sfrs;
      const result = dispatch(
        CREATE_OBJECTIVE_TERM({
          objectiveUUID: objectivesUUID,
          title: name,
          definition: definition,
        })
      );
      const objectiveUUID = result.payload.id;
      objectivesMap[name] = objectiveUUID;
      objectivetoSfrsMap[name] = sfrs;
      const isSfrValid = sfrs && sfrs.length > 0;
      if (isSfrValid) {
        sfrs.forEach((sfr) => {
          if (sfr && sfr.rationale && sfr.name) {
            const sfrName = sfr.name.replace(COMMON_REGEX.quotes, "").trim().split("(")[0].replace(COMMON_REGEX.whitespaceCharacter, "");
            const isRationale = sfr.rationale;
            const objective = { uuid: objectiveUUID, rationale: isRationale ? isRationale : "" };

            // Create new key in the map if it does not yet exist
            if (!sfrToObjectivesMap.hasOwnProperty(sfrName)) {
              sfrToObjectivesMap[sfrName] = [];
            }

            // Add objective to the sfr key if it is not already included in the map
            if (!sfrToObjectivesMap[sfrName].includes(objective)) {
              sfrToObjectivesMap[sfrName].push(objective);
            }
          }
        });
      }
    });
    return { objectivesMap, sfrToObjectivesMap, objectivetoSfrsMap };
  };
  /**
   * Loads the OEs
   * @param intro
   * @param securityObjectives
   * @param objectivesMap the objectives map
   * @param xmlTagMeta tag/attribute data for the section
   */
  const loadOEs = (intro, securityObjectives, objectivesMap, xmlTagMeta) => {
    const { objectives: stateObjectives } = stateRef.current;
    const oeUUID = getUUIDByTitle(stateObjectives, "Security Objectives for the Operational Environment");

    dispatch(
      UPDATE_OBJECTIVE_SECTION_DEFINITION({
        uuid: oeUUID,
        title: "Security Objectives for the Operational Environment",
        newDefinition: intro,
      })
    );
    Object.values(securityObjectives).map((objective) => {
      const { name, definition, sfrs, rationale } = objective;
      const result = dispatch(
        CREATE_OBJECTIVE_TERM({
          objectiveUUID: oeUUID,
          title: name,
          definition: definition,
          consistencyRationale: rationale,
          sfrs: sfrs,
        })
      );
      objectivesMap[name] = result.payload.id;
    });

    dispatch(
      UPDATE_OBJECTIVE_SECTION_METADATA({
        uuid: oeUUID,
        xmlTagMeta: xmlTagMeta,
      })
    );
  };
  /**
   * Load Security Problem Definition
   * @param {String} definition
   */
  const loadSecurityProblemDescription = (definition) => {
    if (definition.length != 0) {
      dispatch(UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION({ newDefinition: definition }));
    }
  };
  /**
   * Loads the threats
   * @param threatMeta parsed threats data
   * @param objectivesMap the objectives map
   * @param objectivetoSfrsMap objective to sfr name, rationale
   * @param ppTemplateVersion PP version
   */
  const loadThreats = (threatMeta, objectivesMap, objectivetoSfrsMap, ppTemplateVersion) => {
    let threatWithSFR = {};

    const { threats: stateThreats } = stateRef.current;
    const threatsUUID = getUUIDByTitle(stateThreats, "Threats");
    const threatDescription = threatMeta.threat_description;
    const allThreats = threatMeta.threats;
    let sfrs = [];

    // Set the description
    dispatch(
      UPDATE_THREAT_SECTION_DEFINITION({
        uuid: threatsUUID,
        title: "Threats",
        newDefinition: threatDescription,
      })
    );

    threatWithSFR = Object.values(allThreats).map((threat) => {
      sfrs = [];
      const objectivesWithUUID = Object.values(threat.securityObjectives).map((so) => {
        // if there are objectives (non CC2022 DR version)
        // get UUID of the matching objective
        const objectiveUUID = objectivesMap[so.name];

        // get SFRs associated with the objective
        sfrs.push(
          ...objectivetoSfrsMap[so.name].map((sfr) => ({
            ...sfr,
            objectiveUUID: objectivesMap[so.name],
          }))
        );

        // return a new securityObjective object that includes the UUID
        return {
          ...so,
          uuid: objectiveUUID,
        };
      });

      if (ppTemplateVersion === "CC2022 Direct Rationale") {
        sfrs = threat.sfrs; // SFRs associated with the threat (CC2022 DR)
      }

      const threatStateRef = dispatch(
        CREATE_THREAT_TERM({
          threatUUID: threatsUUID,
          title: threat.name,
          definition: threat.definition,
          objectives: objectivesWithUUID,
          sfrs: sfrs,
          from: threat.basePPs,
          consistencyRationale: threat.consistencyRationale,
        })
      );
      return {
        ...threat,
        uuid: threatStateRef.payload.id,
        sfrs: sfrs, // passing sfrs here so we're not dependent on state changes by pulling threats from the state and then accessing sfrs
      };
    });

    return threatWithSFR;
  };
  /**
   * Add the UUID for the SFRs in the threat -> SFR relationship for v3.1 to CC2022 DR conversion
   * @param sfrsMap the map of sfrs
   * @param threatWithSFR the map of threats to sfrs
   * @param ppType the current pp type of the file being imported
   */
  const updateUUIDDirectRationale = (sfrsMap, threatWithSFR, ppType) => {
    // Passing data via threatsWithSfr instead of using another useState as this is a one time operation
    const { threats: stateThreats } = stateRef.current;
    const sectionUUID = getUUIDByTitle(stateThreats, "Threats");
    const isModule = ppType === "Module";

    Object.values(threatWithSFR).forEach((threat) => {
      const sfrMap = new Map();

      threat.sfrs.forEach((sfr) => {
        const initialSfrName = sfr.name;
        // Check if this is an base PP SFR
        const externalMatch = initialSfrName.match(FILE_LOADER_REGEX.externalSfrName);

        if (externalMatch) {
          const sfrUUID = `external::${initialSfrName}`;
          const sfrName = initialSfrName; // keep the full name including the base PP suffix

          if (!sfrMap.has(sfrUUID)) {
            sfrMap.set(sfrUUID, {
              name: sfrName,
              type: sfr.type,
              uuid: sfrUUID,
              rationale: sfr.rationale,
              xmlTagMeta: sfr.xmlTagMeta,
            });
          } else {
            sfrMap.get(sfrUUID).rationale += `\n\n${sfr.rationale}`;
          }
          return;
        }

        const sfrName = isModule ? getCorrectSfrType(initialSfrName, sfrsMap) : initialSfrName;
        const sfrUUID = sfrsMap[sfrName];
        const rationale = sfr.rationale;

        if (sfrUUID) {
          if (!sfrMap.has(sfrUUID)) {
            sfrMap.set(sfrUUID, {
              name: sfrName,
              type: sfr.type,
              uuid: sfrUUID,
              rationale: rationale,
              xmlTagMeta: sfr.xmlTagMeta,
            });
          } else {
            sfrMap.get(sfrUUID).rationale += `\n\n${rationale}`; // concatenate SFR rationale for objectives tied to same SFR
          }
        }
      });

      const sfrsWithGroupedRationale = Array.from(sfrMap.values());
      dispatch(
        UPDATE_THREAT_TERM_SFRS({
          threatUUID: sectionUUID,
          uuid: threat.uuid,
          sfrs: sfrsWithGroupedRationale,
        })
      );
    });

    /**
     * Gets the true sfr type instead of the generic "optional" where applicable
     * @param sfrName the original name of the sfr to update
     * @param sfrsMap the current sfrs map of the true sfr names
     * @returns {*|string}
     */
    function getCorrectSfrType(sfrName, sfrsMap) {
      try {
        const typeMatch = sfrName.match(COMMON_REGEX.parentheticalContent);
        const sfrType = typeMatch ? typeMatch[1] : null;

        // Check if the sfrType is optional and if the map does not have the name
        if (sfrType && sfrType === "optional" && !sfrsMap?.hasOwnProperty(sfrName)) {
          const sfrNameArr = sfrName.replace(COMMON_REGEX.quotes, "").split("(");
          const sfrValue = sfrNameArr[0].trim();
          const implementationDependentName = `${sfrValue} (implementation-dependent)`;
          const objectiveName = `${sfrValue} (objective)`;

          // If the name exists with implementation dependent or objective, return the updated sfr name
          if (sfrsMap.hasOwnProperty(implementationDependentName)) {
            return implementationDependentName;
          } else if (sfrsMap.hasOwnProperty(objectiveName)) {
            return objectiveName;
          }
        }
      } catch (e) {
        console.log(e);
      }

      return sfrName;
    }
  };
  /**
   * Normalize selection dependency references
   */
  const convertSelDepToUUIDs = () => {
    const { sfrSections: stateSfrSections } = stateRef.current;

    for (const familiyUUID in stateSfrSections) {
      const family = stateSfrSections[familiyUUID];

      for (const componentUUID in family) {
        const component = family[componentUUID];

        if (component.evaluationActivities) {
          for (const [eAUUID, eADetails] of Object.entries(component.evaluationActivities)) {
            const tests = eADetails.tests || {};
            const testLists = eADetails.testLists || {};
            const dependencyMap = {};
            const dependencyFields = ["tssDependencies", "guidanceDependencies"];
            const dependencySectionFields = ["tssDependencySections", "guidanceDependencySections"];

            dependencyFields.forEach((field) => {
              if (eADetails[field] && eADetails[field].length > 0) {
                eADetails[field].forEach((dep) => {
                  const selectionUUID = fileParser.getUUID(stateSfrSections, dep, "selectable");
                  dependencyMap[dep] = selectionUUID !== null ? selectionUUID : dep;
                });
              }
            });
            dependencySectionFields.forEach((field) => {
              if (Array.isArray(eADetails[field])) {
                eADetails[field].forEach((dependencySection) => {
                  if (dependencySection?.dependencies && dependencySection.dependencies.length > 0) {
                    dependencySection.dependencies.forEach((dep) => {
                      const selectionUUID = fileParser.getUUID(stateSfrSections, dep, "selectable");
                      dependencyMap[dep] = selectionUUID !== null ? selectionUUID : dep;
                    });
                  }
                });
              }
            });

            for (const testList of Object.values(testLists)) {
              if (testList.dependencies && testList.dependencies.length > 0) {
                testList.dependencies.forEach((dep) => {
                  const selectionUUID = fileParser.getUUID(stateSfrSections, dep, "selectable");

                  // If there is no UUID found, it is likely a platform or complex selectable
                  dependencyMap[dep] = selectionUUID !== null ? selectionUUID : dep;
                });
              }
            }

            for (const [_, test] of Object.entries(tests)) {
              if (test.dependencies && test.dependencies.length > 0) {
                test.dependencies.forEach((dep) => {
                  const selectionUUID = fileParser.getUUID(stateSfrSections, dep, "selectable");

                  // If there is no UUID found, it is likely a complex selectable
                  dependencyMap[dep] = selectionUUID !== null ? selectionUUID : dep;
                });
              }
            }

            // Set the updated test dependencies in the state
            if (Object.keys(dependencyMap).length > 0) {
              dispatch(
                UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES({
                  sfrUUID: familiyUUID,
                  uuid: componentUUID,
                  eAUUID,
                  selectionMap: dependencyMap,
                })
              );
            }
          }
        }

        // Set the selection dependencies
        if (
          component.selections.hasOwnProperty("selections") &&
          component.selections.hasOwnProperty("elements") &&
          component.selections.hasOwnProperty("components")
        ) {
          if (component.selections.selections.length != 0 || component.selections.components.length != 0 || component.selections.elements.length != 0) {
            let selection_obj = {
              components: [],
              elements: [],
              selections: [],
            };

            let selections = [];
            component.selections.selections.forEach((selectionID) => {
              if (selectionID != null) {
                if (validator.isUUID(selectionID)) {
                  const selectableID = fileParser.getID(stateSfrSections, selectionID, "selectable");
                  // Store selection dependencies as XML IDs only.
                  if (selectableID) {
                    selections.push(selectableID);
                  }
                } else {
                  // If id is a complex selectable, leave it
                  selections.push(selectionID);
                }
              }
            });
            selection_obj.selections = selections;

            let components = [];
            component.selections.components.forEach((componentID) => {
              if (componentID != null) {
                if (!validator.isUUID(componentID)) {
                  let componentUUID = fileParser.getUUID(stateSfrSections, componentID, "component");
                  if (componentUUID != null) {
                    components.push(componentUUID);
                  }
                } else {
                  // If selection dependency is already a UUID, just keep it
                  components.push(componentID);
                }
              }
            });
            selection_obj.components = components;

            let elements = [];
            component.selections.elements.forEach((elementID) => {
              if (elementID != null) {
                if (!validator.isUUID(elementID)) {
                  let elementUUID = fileParser.getUUID(stateSfrSections, elementID, "element");
                  if (elementUUID != null) {
                    elements.push(elementUUID);
                  }
                } else {
                  // If selection dependency is already a UUID, just keep it
                  elements.push(elementID);
                }
              }
            });
            selection_obj.elements = elements;

            // Update the selection dependent IDs in the slice
            dispatch(
              UPDATE_SFR_COMPONENT_ITEMS({
                sfrUUID: familiyUUID,
                uuid: componentUUID,
                itemMap: { selections: selection_obj },
              })
            );
          }
        }
      }
    }
  };
  /**
   * Loads the assumptions
   * @param assumptionMeta object containing assumptions array + section intro text
   * @param objectivesMap the map of objectives
   */
  const loadAssumptions = (assumptionMeta, objectivesMap) => {
    const { threats: stateThreats } = stateRef.current;
    const assumptionsUUID = getUUIDByTitle(stateThreats, "Assumptions");
    const assumptionDescription = assumptionMeta.assumption_description;

    // Set the description
    dispatch(
      UPDATE_THREAT_SECTION_DEFINITION({
        uuid: assumptionsUUID,
        title: "Assumptions",
        newDefinition: assumptionDescription,
      })
    );

    Object.values(assumptionMeta.assumptions).map((assumption) => {
      const name = assumption.name;
      const definition = assumption.definition;
      const consistencyRationale = assumption.consistency_rationale;
      const objectivesWithUUID = Object.values(assumption.securityObjectives).map((soe) => {
        // get UUID of the matching objective
        const objectiveUUID = objectivesMap[soe.name];

        // return a new securityObjective object that includes the UUID
        return {
          ...soe,
          uuid: objectiveUUID,
        };
      });
      dispatch(
        CREATE_THREAT_TERM({
          threatUUID: assumptionsUUID,
          title: name,
          definition: definition,
          consistencyRationale,
          objectives: objectivesWithUUID,
        })
      );
    });
  };
  /**
   * Loads the OSPs (Organizational Security Policies)
   * @param ospMeta
   * @param objectivesMap the map of objectives
   */
  const loadOSPs = (ospMeta, objectivesMap) => {
    const { threats: stateThreats } = stateRef.current;
    const ospUUID = getUUIDByTitle(stateThreats, "Organizational Security Policies");

    if (ospMeta.boilerplate) {
      dispatch(UPDATE_BOILERPLATE_FLAG({ boilerplate: ospMeta.boilerplate }));
    }

    Object.values(ospMeta.OSPs).map((osp) => {
      const name = osp.name;
      const definition = osp.definition;
      const consistencyRationale = osp.consistencyRationale;
      const objectivesWithUUID = Object.values(osp.securityObjectives).map((soe) => {
        // get UUID of the matching objective
        const objectiveUUID = objectivesMap[soe.name];

        // return a new securityObjective object that includes the UUID
        return {
          ...soe,
          uuid: objectiveUUID,
        };
      });
      dispatch(
        CREATE_THREAT_TERM({
          threatUUID: ospUUID,
          title: name,
          definition: definition,
          consistencyRationale,
          objectives: objectivesWithUUID,
        })
      );
    });
  };
  /**
   * Loads the Security Requirement
   * @param xml the xml
   */
  const loadSecurityRequirement = (xml) => {
    try {
      const securityRequirement = fileParser.getSecurityRequirement(xml);
      dispatch(UPDATE_MAIN_SFR_DEFINITION({ newDefinition: securityRequirement }));
    } catch (err) {
      const errorMessage = `Failed to load Security Requirement: ${err}`;
      console.log(errorMessage);
      handleSnackBarError(errorMessage);
    }
  };
  /**
   * Loading of Base PPs for Modules
   * @param {Node} xml
   */
  const loadBasePPs = (xml) => {
    const { accordionPane: stateAccordionPane } = stateRef.current;

    fileParser.getBasePPs(xml).forEach((basePP) => {
      // Create the base PP sections
      let baseSfrUUID = dispatch(
        CREATE_SFR_BASE_PP_SECTION({
          declarationAndRef: basePP.declarationAndRef,
          modifiedSfrs: basePP.modifiedSfrs,
          additionalSfrs: basePP.additionalSfrs,
          consistencyRationale: basePP.consistencyRationale,
          name: basePP.declarationAndRef.name,
        })
      ).payload;

      // Add the base PP sections to the formItems for section 5 (security requirements)
      const securityRequirementsUUID = getUUIDByTitle(stateAccordionPane.sections, "Security Requirements");
      dispatch(
        CREATE_ACCORDION_FORM_ITEM({
          accordionUUID: securityRequirementsUUID,
          uuid: baseSfrUUID,
          contentType: "sfrBasePPs",
        })
      );

      // Create the SFR components for the additional SFRs
      basePP.additionalSFRComponents?.forEach((comp) => {
        dispatch(
          CREATE_SFR_COMPONENT({
            sfrUUID: comp.familyUUID,
            component: comp,
          })
        );
      });

      // Create the SFR components for the modified SFRs according to mod reform format
      basePP.modifiedSFRElements?.forEach((elem) => {
        dispatch(
          CREATE_SFR_COMPONENT({
            sfrUUID: elem.familyUUIDMap.get(elem.sectionID),
            component: elem.matchedComponent,
            xPathDetails: elem.xPathDetails,
          })
        );
      });

      // Create SFR components for modified SFRs (old format - non mod reform)
      if (basePP.modifiedSFRElements.length == 0) {
        basePP.oldModifiedComponents?.forEach((comp) => {
          dispatch(
            CREATE_SFR_COMPONENT({
              sfrUUID: comp.familyUUID,
              component: comp,
            })
          );
        });
      }
    });
  };

  /**
   * Load audit table sections for modules
   * @param {Node} xml
   */
  const loadSfrAuditTables = (xml) => {
    const result = fileParser.getSfrAuditTables(xml);
    for (const key in result) {
      dispatch(
        UPDATE_TOE_SFRS({
          sfrType: key,
          key: "audit",
          value: result[key],
        })
      );
    }
  };

  /**
   * Loads the sfrs
   * @param allSFRs
   * @param sfrToObjectivesMap the sfrToObjectives map
   * @param useCaseMap the use case map
   * @param auditSection
   * @param ppType
   */
  const loadSFRs = (allSFRs, sfrToObjectivesMap, useCaseMap, auditSection, ppType) => {
    const { accordionPane: stateAccordionPane, editors: stateEditors } = stateRef.current;

    // Load audit section
    dispatch(UPDATE_AUDIT_SECTION({ newDefinition: auditSection }));

    // SFRs
    let previousSfrGroup = null;
    let previousFamilyUUID = null;
    let sfrComponents = [];
    let sfrFamilyUUID = null;
    let sfrName = "";
    let sfrsMap = {}; // SFR to UUID, to be used in direct rationale mapping

    let familiesDone = new Set();
    for (let index = 0; index < allSFRs.length; index++) {
      const sfr = allSFRs[index];
      const uniqueFamily = `${sfr.family_id}-${sfr.sfrType}`;
      if (!familiesDone.has(uniqueFamily) || index === 0) {
        if (ppType === "Module" && !sfr.sfrType) {
          // module SFRs without an sfrType are additional SFRs
          // which dont need to be added to sfrSlice
          continue;
        }
        // Create SFR slices (SFR Classes parent high level)
        const result = dispatch(
          CREATE_SFR_SECTION({
            title: sfr.family_name,
            id: sfr.family_id.toLowerCase(),
            definition: sfr.familyDescription,
            classDescription: sfr.classDescription,
            extendedComponentDefinition: sfr.familyExtCompDef,
            sfrType: sfr.sfrType,
          })
        );
        sfrFamilyUUID = result.payload;

        // Create these classes under the Security Functional Requirements section which is under the Security Requirements accordionPane section
        const secReqsUUID = getUUIDByTitle(stateAccordionPane.sections, "Security Requirements");
        const toeSecurityReqsUUID = getUUIDByTitle(stateEditors, "TOE Security Requirements");
        const secFuncReqsUUID = getUUIDByTitle(stateEditors, "Security Functional Requirements");

        if (ppType === "Module") {
          dispatch(
            CREATE_ACCORDION_SFR_MODULE_FORM_ITEM({
              accordionUUID: secReqsUUID,
              formUUID: toeSecurityReqsUUID,
              innerFormUUID: secFuncReqsUUID,
              newUUID: sfrFamilyUUID,
              contentType: "sfrs",
            })
          );
        } else {
          dispatch(
            CREATE_ACCORDION_SUB_FORM_ITEM({
              accordionUUID: secReqsUUID,
              uuid: sfrFamilyUUID,
              formUUID: secFuncReqsUUID,
              contentType: "sfrs",
            })
          );
        }
      }

      if (uniqueFamily !== previousSfrGroup && index != 0) {
        // Create sfrSections slices (content for the SFR Classes)
        sfrComponents.forEach((component) => {
          // Get objectives
          const { cc_id, iteration_id } = component;
          sfrName = `${cc_id}${iteration_id ? "/" + iteration_id : ""}`;

          // Get the objectives based off of the sfrName and set to empty if no objectives exist for the entry
          if (sfrToObjectivesMap && sfrToObjectivesMap.hasOwnProperty(sfrName)) {
            component.objectives = deepCopy(sfrToObjectivesMap[sfrName]);
          } else {
            component.objectives = [];
          }

          // Convert the use case dependency names into UUIDs
          let use_cases = [];
          component.useCases.forEach((use_case) => {
            // Update the use case array with the UUIDs instead of names
            if (useCaseMap.hasOwnProperty(use_case) && !use_cases.includes(useCaseMap[use_case])) {
              use_cases.push(useCaseMap[use_case]);
            }
          });
          component.useCases = use_cases;

          // Create SFR Component
          const result = dispatch(CREATE_SFR_COMPONENT({ sfrUUID: previousFamilyUUID, component: component }));
          const componentUUID = result.payload.id;
          sfrsMap[sfrName] = componentUUID;
        });
        sfrComponents = [];
      }

      sfrComponents.push(sfr);
      previousSfrGroup = uniqueFamily;
      previousFamilyUUID = sfrFamilyUUID;
      familiesDone.add(uniqueFamily);
    }

    // Create component (if PP only has 1 SFR)
    sfrComponents.forEach((component) => {
      const { cc_id, iteration_id } = component;
      sfrName = `${cc_id}${iteration_id ? "/" + iteration_id : ""}`;

      const result = dispatch(CREATE_SFR_COMPONENT({ sfrUUID: previousFamilyUUID, component: component }));
      const componentUUID = result.payload.id;
      sfrsMap[sfrName] = componentUUID;
    });

    return { sfrsMap };
  };
  /**
   * Loads the SARs
   * @param xml the xml
   */
  const loadSARs = (xml) => {
    const { accordionPane: stateAccordionPane, editors: stateEditors } = stateRef.current;
    const sars = fileParser.getSARs(xml);
    const description = sars.sarsDescription;
    const families = sars.sections;

    // Store the tag name for the SAR section
    dispatch(SET_XMLTAGMETA({ xmlTagMeta: sars.xmlTagMeta }));

    // Update intro text if any
    if (description.length != 0) {
      const sarsIntroductionUUID = getUUIDByTitle(stateEditors, "Security Assurance Requirements");
      dispatch(UPDATE_EDITOR_TEXT({ uuid: sarsIntroductionUUID, newText: description }));
    }

    // Create SARs
    families.forEach((family) => {
      const title = family.xmlTagMeta.attributes.hasOwnProperty("title") ? family.xmlTagMeta.attributes.title : "";
      const id = family.xmlTagMeta.attributes.hasOwnProperty("id") ? family.xmlTagMeta.attributes.id : "";

      // Create the SAR Family Accordions
      const sarSection = dispatch(CREATE_SAR_SECTION({ title: title, summary: family.summary, id: id }));
      const sarFamilyUUID = sarSection.payload;

      // Create these Families under the Security Assurance Requirements section which is under the Security Requirements accordionPane section
      const secReqsUUID = getUUIDByTitle(stateAccordionPane.sections, "Security Requirements");
      const secAssuranceReqsUUID = getUUIDByTitle(stateEditors, "Security Assurance Requirements");
      dispatch(
        CREATE_ACCORDION_SUB_FORM_ITEM({
          accordionUUID: secReqsUUID,
          uuid: sarFamilyUUID,
          formUUID: secAssuranceReqsUUID,
          contentType: "sars",
        })
      );

      family.components.forEach((component) => {
        // Create the components
        const componentSection = dispatch(CREATE_SAR_COMPONENT({ sarUUID: sarFamilyUUID, component: component }));
        const componentUUID = componentSection.payload;

        // Create the elements
        component.elements.forEach((element) => {
          dispatch(CREATE_SAR_ELEMENT({ componentUUID: componentUUID, element: element }));
        });
      });
    });
  };
  /**
   * Load Bibliography
   * @param bibliography
   */
  const loadBibliography = (bibliography) => {
    if (bibliography) {
      dispatch(ADD_ENTRIES({ entries: bibliography.entries }));
    }
  };
  /**
   * Load Entropy Appendix
   * @param appendix
   */
  const loadEntropyAppendix = (appendix) => {
    if (appendix.entropyAppendix) {
      dispatch(SET_ENTROPY_XML({ xml: appendix.entropyAppendix, xmlTagMeta: appendix.xmlTagMeta }));
    }
  };
  /**
   * Load Application Software Equivalency Guidelines
   * @param appendix
   */
  const loadGuidelinesAppendix = (appendix) => {
    if (appendix.guidelinesAppendix) {
      dispatch(SET_EQUIV_GUIDELINES_XML({ xml: appendix.guidelinesAppendix, xmlTagMeta: appendix.xmlTagMeta }));
    }
  };
  /**
   * Load Implicitly Satisfied Requirements
   * @param appendix
   */
  const loadSatisfiedReqsAppendix = (appendix) => {
    if (appendix.satisfiedReqsAppendix) {
      dispatch(SET_SATISFIED_REQS_XML({ xml: appendix.satisfiedReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
    }
  };
  /**
   * Load Validation Guidelines
   * @param appendix
   */
  const loadValidationGuidelinesAppendix = (appendix) => {
    dispatch(SET_VALIDATION_GUIDELINES_XML({ xml: appendix.valGuideAppendix, xmlTagMeta: appendix.xmlTagMeta }));
  };
  /**
   * Load Initialization Vector Requirements for NIST-Approved Cipher Modes
   * @param appendix
   */
  const loadVectorAppendix = (appendix) => {
    if (appendix.vectorReqsAppendix) {
      dispatch(SET_VECTOR_XML({ xml: appendix.vectorReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
    }
  };
  /**
   * Load Acknowledgements
   * @param appendix
   */
  const loadAcknowledgementsAppendix = (appendix) => {
    if (appendix.acknowledgementsReqsAppendix) {
      dispatch(SET_ACKNOWLEDGEMENTS_XML({ xml: appendix.acknowledgementsReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
    }
  };
  /**
   * Load top level custom sections
   * @param customSectionData parsed custom sectiondata
   */
  const loadCustomTopLevelSections = async (customSectionData) => {
    const previousSection = customSectionData.xmlTagMeta.attributes.previous_section || "";
    const title = customSectionData.xmlTagMeta.tagName === "appendix" ? customSectionData.xmlTagMeta.attributes.title : customSectionData.xmlTagMeta.tagName;
    const editorUUID = await dispatch(CREATE_EDITOR({ title: title, text: customSectionData.definition })).payload;
    dispatch(
      CREATE_ACCORDION({
        title: title,
        custom: editorUUID,
        selected_section: previousSection,
        isAppendix: previousSection.includes("Appendix") || customSectionData.xmlTagMeta.tagName === "appendix",
        xmlTagMeta: customSectionData.xmlTagMeta,
      })
    ).payload.uuid;
  };

  /**
   * Load user-created custom sections in introduction
   * @param customIntroSectionData prased custom intro section data
   */
  const loadCustomIntroSections = async (customIntroSectionData) => {
    const introductionUUID = getUUIDByTitle(stateRef.current.accordionPane.sections, "Introduction");
    if (customIntroSectionData.node.localName === "terms") {
      // if user created section is a terms list
      const termUUID = await dispatch(
        CREATE_TERMS_LIST({
          title: customIntroSectionData.title,
          custom: true,
          xmlTagMeta: customIntroSectionData.xmlTagMeta,
        })
      ).payload;
      if (termUUID) {
        await dispatch(
          CREATE_ACCORDION_FORM_ITEM({
            accordionUUID: introductionUUID,
            uuid: termUUID,
            contentType: "terms",
          })
        );

        for (let term of customIntroSectionData.node.childNodes) {
          if (term.nodeType === Node.ELEMENT_NODE) {
            const abbr = term.getAttribute("abbr");
            const name = abbr ? term.getAttribute("full").concat(" (", abbr, ")") : term.getAttribute("full");
            if (term.tagName === "term") {
              dispatch(
                CREATE_TERM_ITEM({
                  termUUID: termUUID,
                  name: name,
                  definition: term.textContent,
                  tagMeta: {
                    tagName: term.tagName,
                    attributes: {
                      abbr: term.getAttribute("abbr") ? term.getAttribute("abbr") : "",
                      full: term.getAttribute("full") ? term.getAttribute("full") : "",
                    },
                  },
                })
              );
            }
          }
        }
      }
    } else if (customIntroSectionData.node.localName === "section" || customIntroSectionData.node.prefix === "sec") {
      // if user created section is a text editor
      let editorUUID = await dispatch(
        CREATE_EDITOR({
          title: customIntroSectionData.title,
          custom: true,
          xmlTagMeta: customIntroSectionData.xmlTagMeta,
        })
      ).payload;
      if (editorUUID) {
        await dispatch(
          CREATE_ACCORDION_FORM_ITEM({
            accordionUUID: introductionUUID,
            uuid: editorUUID,
            contentType: "editor",
          })
        );
        dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: customIntroSectionData.text }));
      }
    }
  };

  /**
   * Load Custom CSS
   * @param xml the xml
   */
  const loadCustomCSS = (xml) => {
    const css = fileParser.getCustomCSS(xml);

    if (css) {
      dispatch(updateMetaDataItem({ type: "customCSS", item: css }));
    }
  };
  /**
   * Creates the default slices
   * @param xml the input xml
   * @returns {string}
   */
  const createDefaultSlices = (xml) => {
    const ppTemplateVersion = getPpTemplateVersion(xml);
    const ppType = getPpType(xml);
    fetchTemplateData({
      version: ppTemplateVersion,
      type: ppType,
      base: true,
    }).then();
    return {
      ppTemplateVersion,
      ppType,
    };
  };
  const resetTemplateData = async () => {
    const ppTemplateVersion = sessionStorage.getItem("ppTemplateVersion");
    const ppType = sessionStorage.getItem("ppType");
    const version = ppTemplateVersion === "Version 3.1" ? "CC2022 Standard" : ppTemplateVersion;

    // Reset the state and load in the template by version
    await fetchTemplateData({
      version: version,
      type: ppType,
      base: false,
    });

    // Update snackbar
    handleSnackBarSuccess(`Loaded in Default XML Template`);
  };

  // Callbacks
  /**
   * Handles dropping a file into the dialog
   * @type {(function(*): void)|*}
   */
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      // Reset state
      resetState();

      // Only take first file
      const file = acceptedFiles[0];

      // Start file reading
      const reader = new FileReader();
      reader.onloadstart = () => {
        resetState();
      };

      reader.onabort = () => {
        setIsLoading(false);
        sessionStorage.setItem("isLoading", "false");
        resetState();
        handleSnackBarError(`Failed to Load ${file.name}`);
      };
      reader.onerror = () => {
        setIsLoading(false);
        sessionStorage.setItem("isLoading", "false");
        resetState();
        setTimeout(() => {
          handleSnackBarError(`Failed to Load XML ${file.name}`);
        }, 3000);
      };

      reader.onload = () => {
        // Update loading in session storage
        sessionStorage.setItem("isLoading", "true");

        // Syntax validation
        const validate = validate_XML(reader.result);

        // Update based on validate value
        if (validate && validate !== "fail") {
          setTimeout(() => {
            // Update loading
            setTimeout(() => {
              setIsLoading(false);
            }, 1000);

            // Update files
            setTimeout(() => {
              handleUpdateFiles(file, reader.result);
            }, 1000);

            // Update snackbar
            handleSnackBarSuccess(`Loaded in ${file.name}`);

            // Update loading in session storage
            setTimeout(() => {
              sessionStorage.setItem("isLoading", "false");
            }, 1000);
          }, 3000);
        }
      };

      reader.readAsText(file);
    },
    [dispatch]
  );

  // Use Dropzones
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/xml": [".xml"],
    },
  });

  // Return Method
  return (
    <div>
      <Modal
        title={"Configure XML Settings"}
        content={
          <div>
            <Card className='rounded-lg border-2 border-gray-200'>
              <CardBody className='border-b-0 rounded-b-sm border-gray-300 text-secondary'>
                <div {...getRootProps()} style={{ display: "inline-block", padding: 2 }}>
                  <input {...getInputProps()} />
                  <Button
                    sx={{ fontSize: "12px" }}
                    component='label'
                    variant='contained'
                    startIcon={<CloudUploadIcon />}
                    style={{ color: "white", marginTop: "0px", marginBottom: "10px", pointerEvents: "auto" }}
                    disabled={isLoading}>
                    {/* {`Upload PP XML`} */}
                    {filename !== "" ? "Replace File" : "Upload PP XML"}
                  </Button>
                </div>
                {!isLoading && filename !== "" && (
                  <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ textAlign: "left", paddingTop: 10, fontSize: "13px" }}>{filename}</span>
                    <Button
                      sx={{ fontSize: "12px" }}
                      variant='outlined'
                      color='secondary'
                      onClick={resetTemplateData}
                      style={{ marginLeft: "10px", textAlign: "right" }}
                      disabled={isLoading}>
                      Remove
                    </Button>
                  </div>
                )}
                <ProgressBar isLoading={isLoading} />
              </CardBody>
            </Card>
          </div>
        }
        open={props.open}
        handleOpen={handleOpen}
        hideSubmit={true}
      />
    </div>
  );
}

// Export FileLoader.jsx
export default FileLoader;
