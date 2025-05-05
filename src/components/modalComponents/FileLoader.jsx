// Imports
import React, { useCallback, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";
import { Card, CardBody } from "@material-tailwind/react";
import Button from "@mui/material/Button";
import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { XMLValidator } from "fast-xml-parser";
import { create } from "xmlbuilder2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { SET_XMLTAGMETA, DELETE_ALL_SAR_SECTIONS, RESET_SAR_STATE, CREATE_SAR_SECTION, CREATE_SAR_COMPONENT, CREATE_SAR_ELEMENT } from "../../reducers/sarsSlice.js";
import * as fileParser from "../../utils/fileParser.js";
import { CREATE_TERM_ITEM, DELETE_ALL_SECTION_TERMS, RESET_TERMS_STATE } from "../../reducers/termsSlice.js";
import { CREATE_THREAT_TERM, UPDATE_THREAT_TERM_SFRS, DELETE_ALL_THREAT_TERMS, RESET_THREATS_STATE, UPDATE_THREAT_SECTION_DEFINITION, UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION } from "../../reducers/threatsSlice.js";
import { CREATE_OBJECTIVE_TERM, DELETE_ALL_OBJECTIVE_TERMS, RESET_OBJECTIVES_STATE, UPDATE_OBJECTIVE_SECTION_DEFINITION } from "../../reducers/objectivesSlice.js";
import { CREATE_EDITOR, UPDATE_EDITOR_TEXT, RESET_EDITOR_STATE, UPDATE_EDITOR_METADATA } from "../../reducers/editorSlice.js";
import { DELETE_ALL_SFR_SECTION_ELEMENTS, RESET_SFR_SECTION_STATE, CREATE_SFR_COMPONENT, UPDATE_SFR_COMPONENT_ITEMS, UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES } from "../../reducers/SFRs/sfrSectionSlice.js";
import { DELETE_ALL_SFR_SECTIONS, UPDATE_MAIN_SFR_DEFINITION, UPDATE_AUDIT_SECTION, RESET_SFR_STATE, CREATE_SFR_SECTION } from "../../reducers/SFRs/sfrSlice.js";
import { CREATE_ACCORDION_FORM_ITEM, DELETE_ALL_ACCORDION_FORM_ITEMS, RESET_ACCORDION_PANE_STATE, CREATE_ACCORDION_SUB_FORM_ITEM, updateMetaDataItem, updateFileUploaded, updatePlatforms } from "../../reducers/accordionPaneSlice.js";
import { ADD_ENTRIES, RESET_BIBLIOGRAPHY_STATE } from "../../reducers/bibliographySlice.js";
import { SET_ENTROPY_XML, RESET_ENTROPY_APPENDIX_STATE } from "../../reducers/entropyAppendixSlice.js";
import { SET_EQUIV_GUIDELINES_XML, RESET_EQUIVALENCY_APPENDIX_STATE } from "../../reducers/equivalencyGuidelinesAppendix.js";
import { ADD_PACKAGE, RESET_PACKAGE_STATE } from "../../reducers/includePackageSlice.js";
import { SET_MODULES_XML, RESET_MODULES_STATE } from "../../reducers/moduleSlice.js";
import validator from 'validator';
import { SET_SATISFIED_REQS_XML, RESET_SATISFIED_REQS_APPENDIX_STATE } from "../../reducers/satisfiedReqsAppendix.js";
import { SET_VALIDATION_GUIDELINES_XML, RESET_VALIDATION_GUIDELINES_APPENDIX_STATE } from "../../reducers/validationGuidelinesAppendix.js";
import { RESET_VECTOR_APPENDIX_STATE, SET_VECTOR_XML } from "../../reducers/vectorAppendix.js";
import { RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE, SET_ACKNOWLEDGEMENTS_XML } from "../../reducers/acknowledgementsAppendix.js";
import { RESET_PROGRESS, setProgress } from "../../reducers/progressSlice.js";
import { SET_PREFERENCE_XML, RESET_PREFERENCE_STATE } from "../../reducers/ppPreferenceSlice.js";
import { UPDATE_ST_CONFORMANCE_DROPDOWN, UPDATE_PART_2_CONFORMANCE_DROPDOWN, UPDATE_PART_3_CONFORMANCE_DROPDOWN, UPDATE_CC_ERRATA, CREATE_NEW_PP_CLAIM, CREATE_NEW_PACKAGE_CLAIM, CREATE_NEW_EVALUATION_METHOD, UPDATE_ADDITIONAL_INFORMATION_TEXT, RESET_CONFORMANCE_CLAIMS_STATE } from "../../reducers/conformanceClaimsSlice.js";
import ProgressBar from "../ProgressBar.jsx";
import SecurityComponents from "../../utils/securityComponents.jsx";
import { deepCopy } from "../../utils/deepCopy.js";
import { getPpTemplateVersion, getPpType } from "../../utils/fileParser.js";
import { UPDATE_DISTRIBUTED_TOE_INTRO, RESET_DISTRIBUTED_TOE_STATE } from "../../reducers/distributedToeSlice.js"
import { CREATE_ACCORDION } from "../../reducers/accordionPaneSlice.js";
import { SET_COMPLIANT_TARGETS_OF_EVALUATION_INTRO, SET_COMPLIANT_TARGETS_OF_EVALUATION_ADDITIONAL_TEXT, LOAD_TABLE_ROWS, RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE } from "../../reducers/compliantTargetsOfEvaluationSlice.js"

/**
 * The FileLoader class that gives various options for file loading
 * @returns {JSX.Element}   the file loader modal content
 * @constructor             passes in props to the class
 */
function FileLoader(props) {
    // Prop Validation
    FileLoader.propTypes = {
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const state = useSelector((state) => state);
    const stateRef = useRef(state);
    const { filename } = state.accordionPane.loadedfile;
    const { clearSessionStorageExcept, fetchTemplateData } = SecurityComponents

    // Use Effects
    useEffect(() => {
        stateRef.current = state;
        // console.log(state);
    }, [state]);

    // Methods
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
                setIsLoading(true)
            }, 500);

            // Validate and generate xml
            XMLValidator.validate(xml);
            var xmlReal = create(xml);

            // Load in the xml
            setTimeout(() => {
                const currentProgress = 10
                const currentSteps = {
                    "Initial File Load": true
                }
                handleProgressBar(currentProgress, currentSteps)

                // Clear out sections
                clearOutSections();

                // LOAD XML CONTENTS INTO REDUX SLICES
                loadPPXML(xmlReal.node)
            }, 1000);

            return "success";
        } catch (err) {
            const timeout = 1000;
            const errorMessage = `XML is not Valid: ${err}\nResetting to local template values.`
            console.log(errorMessage);

            // Update snackbar
            handleSnackBarError(errorMessage)

            setTimeout(() => {
                setIsLoading(false)
            }, timeout)

            resetState();

            return "fail";
        }
    }

    /**
     * Load PP sections into redux slices
     * @param xml the xml
     */
    const loadPPXML = (xml) => {
        let useCaseMap = {}
        let ppTemplateVersion = "CC2022 Standard"
        let ppType = "Protection Profile";

        // Create accordions, editors and terms
        try {
            let ppMeta = createDefaultSlices(xml)
            ppTemplateVersion = ppMeta.ppTemplateVersion
            ppType = ppMeta.ppType
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        } finally {
            // Load all file values
            setTimeout(() => {
                // Load initial components
                loadPackages(xml)
                loadModules(xml)
                loadPlatforms(xml)
                loadPPReference(xml, ppType);
                loadOverview(xml);
                loadTOEOverview(xml, ppType);
                loadDistributedTOE(xml);
                loadPreferences(xml);

                // Update progress
                const currentProgress = 30
                const currentSteps = {
                    "Packages": true,
                    "Modules": true,
                    "Platforms": true,
                    "PP Reference": true,
                    "Overview": true,
                    "TOE Overview": true,
                }
                handleProgressBar(currentProgress, currentSteps)
            }, 500);
            setTimeout(() => {
                // Load more components
                loadDocumentScope(xml);
                loadIntendedReadership(xml);
                loadTechTerms(xml);
                useCaseMap = loadUseCase(xml);
                loadConformanceClaim(xml, ppTemplateVersion);

                // Update progress
                const currentProgress = 50
                const currentSteps = {
                    "Document Scope": true,
                    "Intended Readership": true,
                    "Tech Terms": true,
                    "Use Cases": true,
                    "Conformance Claims": true,
                }
                handleProgressBar(currentProgress, currentSteps)
            }, 500);

            setTimeout(() => {
                // Get maps from objectives and load other components
                const { objectivesMap, sfrToObjectivesMap, objectivetoSfrsMap } = loadObjectives(xml);
                loadOEs(xml, objectivesMap);
                loadSecurityProblemDescription(xml);
                const threatWithSFR = loadThreats(xml, objectivesMap, objectivetoSfrsMap, ppTemplateVersion);
                loadAssumptions(xml, objectivesMap);
                loadOSPs(xml, objectivesMap);

                // Update progress
                const currentProgress = 70
                const currentSteps = {
                    "Objectives": true,
                    "OEs": true,
                    "Threats": true,
                    "Assumptions": true,
                }
                handleProgressBar(currentProgress, currentSteps)

                loadSecurityRequirement(xml)

                // Load SFRS and SARs
                const { sfrsMap } = loadSFRs(xml, sfrToObjectivesMap, useCaseMap);

                // Add SFR data to the threats
                if (ppTemplateVersion != "Version 3.1") {
                    updateUUIDDirectRationale(sfrsMap, threatWithSFR);
                }

                loadSARs(xml);
            }, 500);
            setTimeout(() => {
                // Update progress
                const currentProgress = 90
                const currentSteps = {
                    "SFRs": true,
                    "SARS": true
                }
                handleProgressBar(currentProgress, currentSteps)

                // Load the remaining appendices
                loadBibliography(xml);
                loadEntropyAppendix(xml);
                loadGuidelinesAppendix(xml);
                loadSatisfiedReqsAppendix(xml);
            }, 500);
            setTimeout(() => {
                loadValidationGuidelinesAppendix(xml);
                loadVectorAppendix(xml);
                loadAcknowledgementsAppendix(xml);
            }, 5000);
            setTimeout(() => {
                // Update progress
                const currentProgress = 100
                const currentSteps = {
                    "Appendices": true
                }
                handleProgressBar(currentProgress, currentSteps)
                
                // Update selection dependencies with their UUIDs (for component and simple selectables)
                convertSelDepToUUIDs()
            }, 500)
        }
    }

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
     * Delete all existing data in a certain section
     */
    const clear_section = (slice, sliceName, sectionTitle = "") => {
        const {
            accordionPane: stateAccordionPane,
            editors: stateEditors
        } = stateRef.current
        const sectionUUID = getUUIDByTitle(slice, sectionTitle);

        try {
            switch (sliceName) {
                case "objectives": {
                    dispatch(DELETE_ALL_OBJECTIVE_TERMS({ title: sectionTitle, objectiveUUID: sectionUUID }));
                    return
                } case "terms": {
                    dispatch(DELETE_ALL_SECTION_TERMS({ title: sectionTitle, termUUID: sectionUUID }));
                    return
                } case "threats": {
                    dispatch(DELETE_ALL_THREAT_TERMS({ title: sectionTitle, threatUUID: sectionUUID }));
                    return
                } case "sfrs": {
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
                    return
                } case "sars": {
                    // Delete SAR Family (and associated component + elements)
                    dispatch(DELETE_ALL_SAR_SECTIONS());

                    // Delete any intro text (part of editor slice)
                    const sarEditorUUID = getUUIDByTitle(stateEditors, "Security Assurance Requirements");
                    dispatch(UPDATE_EDITOR_TEXT({ uuid: sarEditorUUID, newText: "" }));

                    return
                } case "conformance_claims": {
                    const conformanceClaimsUUID = getUUIDByTitle(stateAccordionPane.sections, sectionTitle);
                    if (stateAccordionPane.sections.hasOwnProperty(conformanceClaimsUUID) && stateAccordionPane.sections[conformanceClaimsUUID].hasOwnProperty("formItems")) {
                        const cc_section_uuids = stateAccordionPane.sections[conformanceClaimsUUID].formItems.map(editor => editor.uuid);

                        cc_section_uuids.forEach(uuid => {
                            dispatch(UPDATE_EDITOR_TEXT({ uuid: uuid, newText: "" }));
                        });
                    }
                    return
                }
                default: return null
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }

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
        } = stateRef.current

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
    }

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
        }, 300)
    }

    /**
     * Loads in the PP Reference
     * @param xml the xml
     * @param ppType PP, Module, Functional Package
     */
    const loadPPReference = (xml, ppType) => {
        try {
            const ppReference = fileParser.getPPReference(xml);
            const ppMeta = fileParser.getPPMetadata(xml, ppType);

            dispatch(updateMetaDataItem({ type: 'xmlTagMeta', item: ppMeta }));
            dispatch(updateMetaDataItem({ type: 'ppName', item: ppReference.PPTitle }));
            dispatch(updateMetaDataItem({ type: 'author', item: ppReference.PPAuthor }));
            dispatch(updateMetaDataItem({ type: 'keywords', item: ppReference.Keywords }));
            dispatch(updateMetaDataItem({ type: 'version', item: ppReference.PPVersion }));
            dispatch(updateMetaDataItem({ type: 'releaseDate', item: ppReference.PPPubDate }));
            dispatch(updateMetaDataItem({ type: 'revisionHistory', item: ppReference.RevisionHistory }));
        } catch (err) {
            const errorMessage = `Failed to load PP Reference Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the external package dependencies
     * @param xml the xml
     */
    const loadPackages = (xml) => {
        try {
            const packages = fileParser.getExternalPackages(xml);

            if (packages.length != 0) {
                packages.forEach(p => {
                    dispatch(ADD_PACKAGE({ pkg: p }));
                });
            }
        } catch (err) {
            const errorMessage = `Failed to load Package Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the <pp-preferences>
     * @param xml the xml
     */
    const loadPreferences = (xml) => {
        try {
            const preferences = fileParser.getPPPreference(xml);

            if (preferences.length != 0) {
                dispatch(SET_PREFERENCE_XML({ preference: preferences }));
            }
        } catch (err) {
            const errorMessage = `Failed to load PP Preference Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the external module dependencies
     * @param xml the xml
     */
    const loadModules = (xml) => {
        try {
            const mods = fileParser.getExternalModules(xml);

            if (mods.length != 0) {
                dispatch(SET_MODULES_XML({ modules: mods }));
            }
        } catch (err) {
            const errorMessage = `Failed to load Module Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the platforms
     * @param xml the xml
     */
    const loadPlatforms = (xml) => {
        try {
            const platformMeta = fileParser.getPlatforms(xml);
            const platformData = platformMeta.platformObj;
            const platformXML = platformMeta.platformRawXML;

            dispatch(updatePlatforms({ description: platformData.description, platforms: platformData.platforms, xml: platformXML }));
        } catch (err) {
            const errorMessage = `Failed to load Platform Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the overview
     * @param xml the xml
     */
    const loadOverview = (xml) => {
        try {
            const { editors: stateEditors } = stateRef.current
            const overviewUUID = getUUIDByTitle(stateEditors, "Objectives of Document");
            const overviewData = fileParser.getDocumentObjectives(xml);

            if (overviewData.doc_objectives.length != 0) {
                dispatch(UPDATE_EDITOR_TEXT({ uuid: overviewUUID, newText: overviewData.doc_objectives }));
            }

            dispatch(UPDATE_EDITOR_METADATA({ uuid: overviewUUID, xmlTagMeta: overviewData.xmlTagMeta }));
        } catch (err) {
            const errorMessage = `Failed to load Overview Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the Distributed TOE section
     * @param xml the xml
     */
    const loadDistributedTOE = (xml) => {
        try {
            const distributedTOE = fileParser.getDistributedTOE(xml);
            if (!distributedTOE) return

            // create TOE accordion section and update intro
            const accordionUUID = dispatch(CREATE_ACCORDION({ title: 'Distributed TOE', selected_section: "Conformance Claims" })).payload.uuid;
            dispatch(UPDATE_DISTRIBUTED_TOE_INTRO({ newIntro: distributedTOE.intro.xml, xmlTagMeta: distributedTOE.intro.xmlTagMeta }));

            // create sub-sections
            for (let key of Object.keys(distributedTOE)) {
                if (key === 'intro') continue;
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

        } catch (err) {
            const errorMessage = `Failed to load Distributed TOE Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the TOE overview
     * @param xml the xml
     */
    const loadTOEOverview = (xml, ppType) => {
        try {
            const {
                accordionPane: stateAccordionPane,
                editors: stateEditors,
            } = stateRef.current
            const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");
            const TOEoverviewUUID = getUUIDByTitle(stateEditors, "TOE Overview");
            const compliantTOE = fileParser.getCompliantTOE(xml, ppType);

            if (compliantTOE) {
                const toeOverview = compliantTOE.toe_overview;

                if (ppType == "Functional Package") {
                    dispatch(SET_COMPLIANT_TARGETS_OF_EVALUATION_INTRO({ text: toeOverview }));
                    dispatch(SET_COMPLIANT_TARGETS_OF_EVALUATION_ADDITIONAL_TEXT({ text: compliantTOE.additionalText }));

                    const components = compliantTOE.components;
                    dispatch(LOAD_TABLE_ROWS({ components: components }));
                } else {
                    const toeBoundary = compliantTOE.toe_boundary;
                    const toePlatform = compliantTOE.toe_platform;

                    // Load TOE Overview (if exists)
                    dispatch(UPDATE_EDITOR_TEXT({ uuid: TOEoverviewUUID, newText: toeOverview }));

                    // Create the editor if there is content in the xml for TOE Boundary
                    if (toeBoundary.length != 0) {
                        const editorUUID = getUUIDByTitle(stateEditors, "TOE Boundary");
                        dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: toeBoundary }));
                    }

                    // Create the editor if there is content in the xml for TOE Platform
                    if (toePlatform.length != 0) {
                        let editorUUID = dispatch(CREATE_EDITOR({ title: "TOE Platform" })).payload;

                        dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: toePlatform }));

                        if (editorUUID) {
                            // Add the editor to the TOE Overview as a subsection
                            dispatch(CREATE_ACCORDION_SUB_FORM_ITEM({ accordionUUID: introductionUUID, uuid: editorUUID, formUUID: TOEoverviewUUID, contentType: "editor" }));
                        }
                    }
                }
            }
        } catch (err) {
            const errorMessage = `Failed to load TOE Overview Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the Scope of the Document Section (if exists)
     * @param xml the xml
     */
    const loadDocumentScope = (xml) => {
        try {
            const { accordionPane: stateAccordionPane } = stateRef.current
            const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");

            // Create the editor if there is content in the xml
            if (fileParser.getDocumentScope(xml).length != 0) {
                let editorUUID = dispatch(CREATE_EDITOR({ title: "Scope of the Document" })).payload;

                dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: fileParser.getDocumentScope(xml) }));

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
            }
        } catch (err) {
            const errorMessage = `Failed to load Scope of the Document Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the Scope of the Document Section (if exists)
     * @param xml the xml
     */
    const loadIntendedReadership = (xml) => {
        try {
            const { accordionPane: stateAccordionPane } = stateRef.current
            const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");

            // Create the editor if there is content in the xml
            if (fileParser.getIndendedReadership(xml).length != 0) {
                let editorUUID = dispatch(CREATE_EDITOR({ title: "Intended Readership" })).payload;

                dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: fileParser.getIndendedReadership(xml) }));

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
            }
        } catch (err) {
            const errorMessage = `Failed to load Indented Readership Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the tech terms
     * @param xml the xml
     */
    const loadTechTerms = (xml) => {
        try {
            // Get UUID of the Tech Terms section in order to add terms to that section
            const { terms: stateTerms } = stateRef.current
            const termUUID = getUUIDByTitle(stateTerms, "Technical Terms");
            const acronymUUID = getUUIDByTitle(stateTerms, "Acronyms");
            const suppressedUUID = getUUIDByTitle(stateTerms, "Suppressed Terms");

            // Get all the Tech Terms
            const terms = fileParser.getAllTechTerms(xml);
            if (terms) {
                const { termsArray, acronymsArray, suppressedTermsArray } = terms;

                const dispatchTerms = (array, uuid) => {
                    Object.values(array).forEach(term => {
                        dispatch(CREATE_TERM_ITEM({
                            termUUID: uuid,
                            name: term.name,
                            definition: term.definition,
                            tagMeta: term.xmlTagMeta
                        }));
                    });
                };

                dispatchTerms(termsArray, termUUID);
                dispatchTerms(acronymsArray, acronymUUID);
                dispatchTerms(suppressedTermsArray, suppressedUUID);
            }

        } catch (err) {
            const errorMessage = `Failed to load Tech Terms Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the use cases
     * @param xml the xml
     */
    const loadUseCase = (xml) => {
        let useCaseMap = {}
        try {
            const {
                editors: stateEditors,
                terms: stateTerms,
            } = stateRef.current
            const useCaseDescriptionUUID = getUUIDByTitle(stateEditors, "TOE Usage");
            dispatch(UPDATE_EDITOR_TEXT({ uuid: useCaseDescriptionUUID, newText: fileParser.getUseCaseDescription(xml) }));

            const useCaseUUID = getUUIDByTitle(stateTerms, "Use Cases");
            const allUseCases = fileParser.getUseCases(xml);

            if (allUseCases && allUseCases.length != 0) {
                Object.values(allUseCases).map((term) => {
                    const result = dispatch(CREATE_TERM_ITEM({ termUUID: useCaseUUID, name: term.name, definition: term.description, metaData: term.metaData.configXML, tagMeta: term.xmlTagMeta }));
                    const uuid = result.payload.uuid;
                    const id = term.id;
                    if (!useCaseMap.hasOwnProperty(id)) {
                        useCaseMap[id] = uuid;
                    }
                });
            }

        } catch (err) {
            const errorMessage = `Failed to load Use-case Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
        return useCaseMap
    }

    /**
     * Loads the conformance claim
     * @param xml the xml
     */
    const loadConformanceClaim = (xml, ppTemplateVersion) => {
        // Helper function to take PPs that are both conformant and configuration and store in its own array (to avoid duplicates in UI)
        function consolidatePPs(conformantPPs, configurationPPs, consolidatedPPs) {
            for (let i = conformantPPs.length - 1; i >= 0; i--) {
                const sourceDescription = conformantPPs[i].description;
                const matchIndex = configurationPPs.findIndex(pp => pp.description === sourceDescription);

                if (matchIndex !== -1) {
                    // If a match is found, store separately
                    consolidatedPPs.push(conformantPPs[i]);

                    // Remove the matched object from both arrays
                    conformantPPs.splice(i, 1);
                    configurationPPs.splice(matchIndex, 1);
                }
            }
        }

        try {
            const { editors: stateEditors } = stateRef.current
            const conformanceStatementUUID = getUUIDByTitle(stateEditors, "Conformance Statement");
            const ccConformanceClaimsUUID = getUUIDByTitle(stateEditors, "CC Conformance Claims");
            const ppClaimUUID = getUUIDByTitle(stateEditors, "PP Claims");
            const packageClaimUUID = getUUIDByTitle(stateEditors, "Package Claims");
            const allCClaims = fileParser.getCClaims(xml, ppTemplateVersion);
            const cClaimsAttributes = fileParser.getCClaimsAttributes(xml)

            if (cClaimsAttributes) {
                dispatch(UPDATE_CC_ERRATA({ cc_errata: cClaimsAttributes["cc-errata"]}))
            }

            if (allCClaims.length != 0) {
                Object.values(allCClaims).map((claim) => {
                    const name = claim.name;
                    const description = claim.description;

                    switch (name) {
                        case "Conformance Statement":
                            dispatch(UPDATE_EDITOR_TEXT({ uuid: conformanceStatementUUID, newText: description }));
                            return
                        case "CC Conformance Claims":
                            dispatch(UPDATE_EDITOR_TEXT({ uuid: ccConformanceClaimsUUID, newText: description }));
                            return
                        case "PP Claim":
                            dispatch(UPDATE_EDITOR_TEXT({ uuid: ppClaimUUID, newText: description }));
                            return
                        case "Package Claim":
                            dispatch(UPDATE_EDITOR_TEXT({ uuid: packageClaimUUID, newText: description }));
                            return
                        case "Conformance CC2022":
                            if (claim.tagName == "cc-st-conf") {
                                dispatch(UPDATE_ST_CONFORMANCE_DROPDOWN({ stConformance: claim.description }));
                            } else if (claim.tagName == "cc-pt2-conf") {
                                dispatch(UPDATE_PART_2_CONFORMANCE_DROPDOWN({ part2Conformance: claim.description }));
                            } else if (claim.tagName == "cc-pt3-conf") {
                                dispatch(UPDATE_PART_3_CONFORMANCE_DROPDOWN({ part3Conformance: claim.description }));
                            }
                            return
                        case "PP Claim CC2022":
                            // Initialize the conformantConfig array - need to consolidate the PPs that are both conformant and configuration
                            claim.conformantAndConfig = [];
                            consolidatePPs(claim.ppClaim, claim.configurations.pp, claim.conformantAndConfig);

                            // Store PP that is conformant and part of configuration
                            claim.conformantAndConfig.forEach(claim => {
                                dispatch(CREATE_NEW_PP_CLAIM({ isPP: true, status: ["Conformance", "Configuration"], description: claim.description }));
                            });

                            // Store PP that is only conformant
                            claim.ppClaim.forEach(claim => {
                                dispatch(CREATE_NEW_PP_CLAIM({ isPP: true, status: ["Conformance"], description: claim.description }));
                            });

                            // Store PP/Modules that are part of configuration
                            claim.configurations.pp.forEach(pp => {
                                dispatch(CREATE_NEW_PP_CLAIM({ isPP: true, status: ["Configuration"], description: pp.description }));
                            });
                            claim.configurations.modules.forEach(module => {
                                dispatch(CREATE_NEW_PP_CLAIM({ isPP: false, status: ["Configuration"], description: module.description }));
                            });
                            return
                        case "Package Claim CC2022":
                            claim.configurations.assurancePackages.forEach(aP => {
                                dispatch(CREATE_NEW_PACKAGE_CLAIM({ isFunctional: false, conf: aP.conf, text: aP.description }));
                            });

                            claim.configurations.functionalPackages.forEach(fP => {
                                dispatch(CREATE_NEW_PACKAGE_CLAIM({ isFunctional: true, conf: fP.conf, text: fP.description }));
                            });
                            return
                        case "Evaluation Methods CC2022":
                            claim.methods.forEach(method => {
                                dispatch(CREATE_NEW_EVALUATION_METHOD({ method: method.description }));
                            });
                            return
                        case "CClaim Additional Info CC2022":
                            dispatch(UPDATE_ADDITIONAL_INFORMATION_TEXT({ value: claim.description }));
                            return
                        default:
                            return null;
                    }
                });
            }
        } catch (err) {
            const errorMessage = `Failed to load Conformance Claims Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the objectives
     * @param xml the xml
     * @returns {{objectivesMap: {}, sfrToObjectivesMap: {}}} the objectives and sfrToObjectives maps
     */
    const loadObjectives = (xml) => {
        let objectivesMap = {}
        let sfrToObjectivesMap = {}
        let objectivetoSfrsMap = {}

        try {
            // Get Objectives
            const { objectives: stateObjectives } = stateRef.current
            const objectivesUUID = getUUIDByTitle(stateObjectives, "Security Objectives for the TOE");
            const toeObjectives = fileParser.getAllSecurityObjectivesTOE(xml);
            Object.values(toeObjectives).map((objective) => {
                const name = objective.name;
                const definition = objective.definition;
                const sfrs = objective.sfrs;
                const result = dispatch(CREATE_OBJECTIVE_TERM({ objectiveUUID: objectivesUUID, title: name, definition: definition }));
                const objectiveUUID = result.payload.id;
                objectivesMap[name] = objectiveUUID;
                objectivetoSfrsMap[name] = sfrs;
                const isSfrValid = sfrs && sfrs.length > 0;
                if (isSfrValid) {
                    sfrs.forEach((sfr) => {
                        if (sfr && sfr.rationale && sfr.name) {
                            const sfrName = sfr.name.replace(/["']/g, '').trim().split("(")[0].replace(/\s/g, '');
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
                    })
                }
            })
        } catch (err) {
            const errorMessage = `Failed to load Objectives Data: ${err}`
            handleSnackBarError(errorMessage)
        }
        return { objectivesMap, sfrToObjectivesMap, objectivetoSfrsMap };
    }

    /**
     * Loads the OEs
     * @param xml the xml
     * @param objectivesMap the objectives map
     */
    const loadOEs = (xml, objectivesMap) => {
        try {
            const { objectives: stateObjectives } = stateRef.current
            const oeUUID = getUUIDByTitle(stateObjectives, "Security Objectives for the Operational Environment");
            const { intro, securityObjectives } = fileParser.getAllSecurityObjectivesOE(xml);
            dispatch(UPDATE_OBJECTIVE_SECTION_DEFINITION({uuid: oeUUID, title: "Security Objectives for the Operational Environment", newDefinition: intro}))
            Object.values(securityObjectives).map((objective) => {
                const name = objective.name;
                const definition = objective.definition;
                const sfrs = objective.sfrs;
                const result = dispatch(CREATE_OBJECTIVE_TERM({ objectiveUUID: oeUUID, title: name, definition: definition, sfrs: sfrs }));
                objectivesMap[name] = result.payload.id;
            })
        } catch (err) {
            const errorMessage = `Failed to load Security Objectives of the Operational Environment Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Load Security Problem Definition
     * @param {*} xml
     */
    const loadSecurityProblemDescription = (xml) => {
        try {
            const definition = fileParser.getSecurityProblemDefinition(xml);
            if (definition.length != 0) {
                dispatch(UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION({ newDefinition: definition }));
            }
        } catch (err) {
            const errorMessage = `Failed to load Security Problem Definition: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the threats
     * @param xml the xml
     * @param objectivesMap the objectives map
     * @param objectivetoSfrsMap objective to sfr name, rationale
     * @param ppTemplateVersion PP version
     */
    const loadThreats = (xml, objectivesMap, objectivetoSfrsMap, ppTemplateVersion) => {
        let threatWithSFR = {};

        try {
            const { threats: stateThreats } = stateRef.current
            const threatsUUID = getUUIDByTitle(stateThreats, "Threats");
            const threatMeta = fileParser.getAllThreats(xml);
            const threatDescription = threatMeta.threat_description;
            const allThreats = threatMeta.threats;
            let sfrs = [];

            // Set the description
            dispatch(UPDATE_THREAT_SECTION_DEFINITION({ uuid: threatsUUID, title: "Threats", newDefinition: threatDescription }));


            threatWithSFR = Object.values(allThreats).map((threat) => {
                sfrs = [];
                const objectivesWithUUID = Object.values(threat.securityObjectives).map((so) => { // if there are objectives (non CC2022 DR version)
                    // get UUID of the matching objective
                    const objectiveUUID = objectivesMap[so.name];

                    // get SFRs associated with the objective
                    sfrs.push(...objectivetoSfrsMap[so.name].map(sfr => ({
                        ...sfr,
                        objectiveUUID: objectivesMap[so.name]
                    })));

                    // return a new securityObjective object that includes the UUID
                    return {
                        ...so,
                        uuid: objectiveUUID
                    };
                });

                if (ppTemplateVersion == "CC2022 Direct Rationale") {
                    sfrs = threat.sfrs; // SFRs associated with the threat (CC2022 DR)
                }

                const threatStateRef = dispatch(CREATE_THREAT_TERM({ threatUUID: threatsUUID, title: threat.name, definition: threat.definition, objectives: objectivesWithUUID, sfrs: sfrs }));
                return {
                    ...threat,
                    uuid: threatStateRef.payload.id,
                    sfrs: sfrs // passing sfrs here so we're not dependent on state changes by pulling threats from the state and then accessing sfrs
                }
            });

            return threatWithSFR;
        } catch (err) {
            const errorMessage = `Failed to load Threat Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * 
     * @param {*} sfrsMap 
     */
    const updateTOEComponents = (sfrsMap) => {
        // console.log(stateRef.current);
        // const { compliantTargetsOfEvaluation: stateCompliantTOE } = stateRef.current

        // console.log(stateCompliantTOE)
        // console.log(sfrsMap)


        // const updatedCompliantTOE = stateCompliantTOE.map(entry => ({
        //     ...entry,
        //     uuid: sfrsMap[entry.componentID]
        //   }));          
    }

    /**
     * Add the UUID for the SFRs in the threat -> SFR relationship for v3.1 to CC2022 DR conversion
     * @param {*} sfrsMap
     * @param {*} threatWithSFR 
     */
    const updateUUIDDirectRationale = (sfrsMap, threatWithSFR) => {
        // Passing data via threatsWithSfr instead of using another useState as this is a one time operation
        const { threats: stateThreats } = stateRef.current
        const sectionUUID = getUUIDByTitle(stateThreats, "Threats");

        Object.values(threatWithSFR).forEach((threat) => {
            const sfrMap = new Map();

            threat.sfrs.forEach((sfr) => {
                const sfrName = sfr.name;
                const sfrUUID = sfrsMap[sfrName];
                const rationale = sfr.rationale;
        
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
            });

            const sfrsWithGroupedRationale = Array.from(sfrMap.values());
            dispatch(
                UPDATE_THREAT_TERM_SFRS({
                    threatUUID: sectionUUID,
                    uuid: threat.uuid,
                    sfrs: sfrsWithGroupedRationale
                })
            );
        });
    }

    /**
     * Convert simple selectables and component dependencies to UUIDs
     */
    const convertSelDepToUUIDs = () => {
        const { sfrSections: stateSfrSections } = stateRef.current

        for (const familiyUUID in stateSfrSections) {
            const family = stateSfrSections[familiyUUID];

            for (const componentUUID in family) {
                const component = family[componentUUID];

                // Set the test dependencies
                let dependencyMap = {}; // Maps selectable id to UUID (value remains same for complex selectable simce there is no UUID)
                let eAUUID = ';'

                if (component.evaluationActivities) {
                    // Iterate through tests in Evaluation Activities for component
                    for (const [uuid, eADetails] of Object.entries(component.evaluationActivities)) {
                        eAUUID = uuid;
                        if (eADetails.testList.length != 0) {
                            eADetails.testList.forEach(testlist => {
                                testlist["tests"].forEach(test => {
                                    if (test.hasOwnProperty("dependencies") && test["dependencies"].length != 0) {
                                        test["dependencies"].forEach(dep => {
                                            // Get the UUID for the selectable
                                            let selectionUUID = fileParser.getUUID(stateSfrSections, dep, "selectable");

                                            // If there is no UUID found, it is likely a complex selectable
                                            if (selectionUUID != null) {
                                                dependencyMap[dep] = selectionUUID;
                                            } else {
                                                dependencyMap[dep] = dep;
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    }

                    // Set the updated test dependencies in the state
                    if (Object.keys(dependencyMap).length != 0) {
                        dispatch(UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES({ sfrUUID: familiyUUID, uuid: componentUUID, eAUUID: eAUUID, selectionMap: dependencyMap }));

                    }
                }

                // Set the selection dependencies
                if (component.selections.hasOwnProperty("selections") && component.selections.hasOwnProperty("elements") && component.selections.hasOwnProperty("components")) {
                    if (component.selections.selections.length != 0 || component.selections.components.length != 0 || component.selections.elements.length != 0) {
                        let selection_obj = {
                            components: [],
                            elements: [],
                            selections: [],
                        }

                        let selections = [];
                        component.selections.selections.forEach(selectionID => {
                            if (!validator.isUUID(selectionID)) {
                                let selectionUUID = fileParser.getUUID(stateSfrSections, selectionID, "selectable");
                                // If id is a complex selectable, leave it
                                selectionUUID ? selections.push(selectionUUID) : selections.push(selectionID)
                            } else {
                                // If selection dependency is already a UUID, just keep it
                                selections.push(selectionID);
                            }

                        });
                        selection_obj.selections = selections;

                        let components = [];
                        component.selections.components.forEach(componentID => {
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
                        component.selections.elements.forEach(elementID => {
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
                        dispatch(UPDATE_SFR_COMPONENT_ITEMS({ sfrUUID: familiyUUID, uuid: componentUUID, itemMap: { 'selections': selection_obj } }));
                    }
                }
            }
        }

    }

    /**
     * Loads the assumptions
     * @param xml the xml
     */
    const loadAssumptions = (xml, objectivesMap) => {
        try {
            const { threats: stateThreats } = stateRef.current
            const assumptionsUUID = getUUIDByTitle(stateThreats, "Assumptions");
            const allAssumptions = fileParser.getAllAssumptions(xml);
            Object.values(allAssumptions).map((assumption) => {
                const name = assumption.name;
                const definition = assumption.definition;
                const objectivesWithUUID = Object.values(assumption.securityObjectives).map((soe) => {
                    // get UUID of the matching objective
                    const objectiveUUID = objectivesMap[soe.name];

                    // return a new securityObjective object that includes the UUID
                    return {
                        ...soe,
                        uuid: objectiveUUID
                    };
                });
                dispatch(CREATE_THREAT_TERM({ threatUUID: assumptionsUUID, title: name, definition: definition, objectives: objectivesWithUUID }));
            })
        } catch (err) {
            const errorMessage = `Failed to load Assumptions Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the OSPs (Organizational Security Policies)
     * @param xml the xml
     */
    const loadOSPs = (xml, objectivesMap) => {
        try {
            const { threats: stateThreats } = stateRef.current
            const ospUUID = getUUIDByTitle(stateThreats, "Organizational Security Policies");
            const allOSPs = fileParser.getAllOSPs(xml);
            Object.values(allOSPs).map((osp) => {
                const name = osp.name;
                const definition = osp.definition;
                const objectivesWithUUID = Object.values(osp.securityObjectives).map((soe) => {
                    // get UUID of the matching objective
                    const objectiveUUID = objectivesMap[soe.name];

                    // return a new securityObjective object that includes the UUID
                    return {
                        ...soe,
                        uuid: objectiveUUID
                    };
                });
                dispatch(CREATE_THREAT_TERM({ threatUUID: ospUUID, title: name, definition: definition, objectives: objectivesWithUUID }));
            })
        } catch (err) {
            const errorMessage = `Failed to load OSPs Data: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the Security Requirement
     * @param xml the xml
     */
    const loadSecurityRequirement = (xml) => {
        try {
            const securityRequirement = fileParser.getSecurityRequirement(xml);
            dispatch(UPDATE_MAIN_SFR_DEFINITION({ newDefinition: securityRequirement }))
        } catch (err) {
            const errorMessage = `Failed to load Security Requirement: ${err}`
            console.log(errorMessage);
            handleSnackBarError(errorMessage)
        }
    }

    /**
     * Loads the sfrs
     * @param xml the xml
     * @param sfrToObjectivesMap the sfrToObjectives map
     * @param useCaseMap the use case map
     */
    const loadSFRs = (xml, sfrToObjectivesMap, useCaseMap) => {
        const {
            accordionPane: stateAccordionPane,
            editors: stateEditors
        } = stateRef.current

        // Load audit section
        dispatch(UPDATE_AUDIT_SECTION({ newDefinition: fileParser.getAuditSection(xml) }));

        // SFRs
        const extCompDefMap = fileParser.getSectionExtendedComponentDefinitionMap(xml);
        const allSFRs = fileParser.getSFRs(xml, extCompDefMap);
        let previousSfrFamily = null;
        let previousFamilyUUID = null;
        let sfrComponents = [];
        let sfrFamilyUUID = null;
        let sfrName = "";
        let sfrsMap = {}; // SFR to UUID, to be used in direct rationale mapping


        let familiesDone = new Set();
        allSFRs.forEach((sfr, index) => {
            if (!familiesDone.has(sfr.family_id) || index == 0) {
                // Create SFR slices (SFR Classes parent high level)
                const result = dispatch(CREATE_SFR_SECTION({
                    title: `Class: ${sfr.family_name.replace("Class: ", "")}`,
                    definition: sfr.familyDescription,
                    extendedComponentDefinition: sfr.familyExtCompDef
                }));
                sfrFamilyUUID = result.payload;

                // Create these classes under the Security Functional Requirements section which is under the Security Requirements accordionPane section
                const secReqsUUID = getUUIDByTitle(stateAccordionPane.sections, "Security Requirements");
                const secFuncReqsUUID = getUUIDByTitle(stateEditors, "Security Functional Requirements");

                dispatch(CREATE_ACCORDION_SUB_FORM_ITEM({ accordionUUID: secReqsUUID, uuid: sfrFamilyUUID, formUUID: secFuncReqsUUID, contentType: "sfrs" }));
            }

            if (sfr.family_id != previousSfrFamily && index != 0) {
                // Create sfrSections slices (content for the SFR Classes)
                sfrComponents.forEach(component => {
                    // Get objectives
                    const { cc_id, iteration_id } = component;
                    sfrName = `${cc_id}${iteration_id && iteration_id !== "" ? "/" + iteration_id : ""}`;

                    // Get the objectives based off of the sfrName and set to empty if no objectives exist for the entry
                    if (sfrToObjectivesMap.hasOwnProperty(sfrName)) {
                        component.objectives = deepCopy(sfrToObjectivesMap[sfrName]);
                    } else {
                        component.objectives = [];
                    }

                    // Convert the use case dependency names into UUIDs
                    let use_cases = [];
                    component.useCases.forEach(use_case => {
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
            previousSfrFamily = sfr.family_id;
            previousFamilyUUID = sfrFamilyUUID;
            familiesDone.add(sfr.family_id);
        });

        // Create component (if PP only has 1 SFR)
        sfrComponents.forEach(component => {
            const { cc_id, iteration_id } = component;
            sfrName = `${cc_id}${iteration_id && iteration_id !== "" ? "/" + iteration_id : ""}`;

            const result = dispatch(CREATE_SFR_COMPONENT({ sfrUUID: previousFamilyUUID, component: component }));
            const componentUUID = result.payload.id;
            sfrsMap[sfrName] = componentUUID;
        })

        return { sfrsMap };
    }

    /**
     * Loads the SARs
     * @param xml the xml
     */
    const loadSARs = (xml) => {
        const {
            accordionPane: stateAccordionPane,
            editors: stateEditors
        } = stateRef.current
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
        families.forEach(family => {
            const title = family.xmlTagMeta.attributes.hasOwnProperty("title") ? family.xmlTagMeta.attributes.title : "";
            const id = family.xmlTagMeta.attributes.hasOwnProperty("id") ? family.xmlTagMeta.attributes.id : "";

            // Create the SAR Family Accordions
            const sarSection = dispatch(CREATE_SAR_SECTION({ title: title, summary: family.summary, id: id }));
            const sarFamilyUUID = sarSection.payload;

            // Create these Families under the Security Assurance Requirements section which is under the Security Requirements accordionPane section
            const secReqsUUID = getUUIDByTitle(stateAccordionPane.sections, "Security Requirements");
            const secAssuranceReqsUUID = getUUIDByTitle(stateEditors, "Security Assurance Requirements");
            dispatch(CREATE_ACCORDION_SUB_FORM_ITEM({ accordionUUID: secReqsUUID, uuid: sarFamilyUUID, formUUID: secAssuranceReqsUUID, contentType: "sars" }));

            family.components.forEach(component => {
                // Create the components
                const componentSection = dispatch(CREATE_SAR_COMPONENT({ sarUUID: sarFamilyUUID, component: component }));
                const componentUUID = componentSection.payload;

                // Create the elements
                component.elements.forEach(element => {
                    dispatch(CREATE_SAR_ELEMENT({ componentUUID: componentUUID, element: element }));
                });
            });
        });
    }

    /**
     * Load Bibliography
     * @param xml the xml
     */
    const loadBibliography = (xml) => {
        const bibliography = fileParser.getBibliography(xml);

        if (bibliography) {
            dispatch(ADD_ENTRIES({ entries: bibliography.entries }));
        }
    }

    /**
     * Load Entropy Appendix
     * @param xml the xml
     */
    const loadEntropyAppendix = (xml) => {
        const appendix = fileParser.getEntropyAppendix(xml);

        if (appendix.entropyAppendix) {
            dispatch(SET_ENTROPY_XML({ xml: appendix.entropyAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Application Software Equivalency Guidelines
     * @param xml the xml
     */
    const loadGuidelinesAppendix = (xml) => {
        const appendix = fileParser.getEquivGuidelinesAppendix(xml);

        if (appendix.guidelinesAppendix) {
            dispatch(SET_EQUIV_GUIDELINES_XML({ xml: appendix.guidelinesAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Implicitly Satisfied Requirements
     * @param xml the xml
     */
    const loadSatisfiedReqsAppendix = (xml) => {
        const appendix = fileParser.getSatisfiedReqsAppendix(xml);

        if (appendix.satisfiedReqsAppendix) {
            dispatch(SET_SATISFIED_REQS_XML({ xml: appendix.satisfiedReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Validation Guidelines
     * @param xml the xml
     */
    const loadValidationGuidelinesAppendix = (xml) => {
        const appendix = fileParser.getValidationGuidelinesAppendix(xml);

        if (appendix.valGuideAppendix) {
            dispatch(SET_VALIDATION_GUIDELINES_XML({ xml: appendix.valGuideAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }


    /**
     * Load Initialization Vector Requirements for NIST-Approved Cipher Modes
     * @param xml the xml
     */
    const loadVectorAppendix = (xml) => {
        const appendix = fileParser.getVectorAppendix(xml);

        if (appendix.vectorReqsAppendix) {
            dispatch(SET_VECTOR_XML({ xml: appendix.vectorReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Acknowledgements
     * @param xml the xml
     */
    const loadAcknowledgementsAppendix = (xml) => {
        const appendix = fileParser.getAcknowledgementsAppendix(xml);

        if (appendix.acknowledgementsReqsAppendix) {
            dispatch(SET_ACKNOWLEDGEMENTS_XML({ xml: appendix.acknowledgementsReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    // Callbacks
    const onDrop = useCallback((acceptedFiles) => {
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
            sessionStorage.setItem("isLoading", "false")
            resetState();
            handleSnackBarError(`Failed to Load ${file.name}`)
        }
        reader.onerror = () => {
            setIsLoading(false);
            sessionStorage.setItem("isLoading", "false")
            resetState();
            setTimeout(() => {
                handleSnackBarError(`Failed to Load XML ${file.name}`)
            }, 3000)
        }

        reader.onload = () => {
            // Update loading in session storage
            sessionStorage.setItem("isLoading", "true")

            // Syntax validation
            const validate = validate_XML(reader.result)

            // Update based on validate value
            if (validate && validate !== "fail") {
                setTimeout(() => {
                    // Update loading
                    setTimeout(() => {
                        setIsLoading(false)
                    }, 1000);

                    // Update files
                    setTimeout(() => {
                        handleUpdateFiles(file, reader.result)
                    }, 1000);

                    // Update snackbar
                    handleSnackBarSuccess(`Loaded in ${file.name}`)

                    // Update loading in session storage
                    setTimeout(() => {
                        sessionStorage.setItem("isLoading", "false")
                    }, 1000);
                }, 3000);
            }
        };

        reader.readAsText(file);
    }, [dispatch]);

    /**
     * Handles updating the progressBar
     * @param progress  the progress as a number from 0-100
     * @param steps     any steps that should be visualized/updated
     */
    const handleProgressBar = (progress, steps) => {
        dispatch(setProgress({
            progress: progress,
            steps: steps
        }))
    }

    /**
     * Handler to update files
     * @param file      the file
     * @param content   the content
     */
    const handleUpdateFiles = (file, content, currentPP, currentMod) => {
        if (file !== "" && content !== "") {
            dispatch(updateFileUploaded({
                filename: file.name,
                content: content,
                pp: currentPP !== undefined ? currentPP : false,
                mod: currentMod !== undefined ? currentMod : false
            }));
        } else {
            dispatch(updateFileUploaded({
                filename: file,
                content: content,
                pp: currentPP !== undefined ? currentPP : false,
                mod: currentMod !== undefined ? currentMod : false
            }));
        }
    }

    /**
     * Creates the default slices
     * @param xml the input xml
     * @returns {string}
     */
    const createDefaultSlices = (xml) => {
        const ppTemplateVersion = getPpTemplateVersion(xml)
        const ppType = getPpType(xml)
        fetchTemplateData({
            version: ppTemplateVersion,
            type: ppType,
            base: true
        }, dispatch).then()
        return { ppTemplateVersion, ppType }
    }
    const resetTemplateData = async () => {
        const ppTemplateVersion = sessionStorage.getItem('ppTemplateVersion');
        const ppType = sessionStorage.getItem('ppType');
        const version = ppTemplateVersion === "Version 3.1" ? "CC2022 Standard" : ppTemplateVersion

        // Reset the state and load in the template by version
        await fetchTemplateData({
            version: version,
            type: ppType,
            base: false
        }, dispatch)

        // Update snackbar
        handleSnackBarSuccess(`Loaded in Default XML Template`)
    }
    const handleOpen = () => {
        const isLoading = sessionStorage.getItem("isLoading")

        // If the dialog was closed prematurely, reset isLoading in session storage
        if (isLoading !== null && isLoading === "true") {
            try {
                // Set fileMenuClosed to true and clear out session storage
                sessionStorage.setItem('fileMenuClosed', 'true');
                clearSessionStorageExcept(["fileMenuClosed"]).then(() => {
                    // Close Dialog
                    props.handleOpen()
                })
                sessionStorage.clear();
            } catch (e) {
                console.log(e)
                handleSnackBarError(e)
            }
        } else {
            props.handleOpen()
        }
    }

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
                content={(
                    <div>
                        <Card className="rounded-lg border-2 border-gray-200">
                            <CardBody className="border-b-0 rounded-b-sm border-gray-300 text-secondary">
                                <div {...getRootProps()} style={{ display: 'inline-block', padding: 2 }}>
                                    <input {...getInputProps()} />
                                    <Button
                                        sx={{ fontSize: "12px" }}
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        style={{ color: "white", marginTop: '0px', marginBottom: '10px', pointerEvents: 'auto' }}
                                        disabled={isLoading}
                                    >
                                        {/* {`Upload PP XML`} */}
                                        {filename !== "" ? 'Replace File' : 'Upload PP XML'}
                                    </Button>
                                </div>
                                {(!isLoading && filename !== "") &&
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ textAlign: 'left', paddingTop: 10, fontSize: "13px" }}>{filename}</span>
                                        <Button
                                            sx={{ fontSize: "12px" }}
                                            variant="outlined"
                                            color="secondary"
                                            onClick={resetTemplateData}
                                            style={{ marginLeft: '10px', textAlign: 'right' }}
                                            disabled={isLoading}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                }
                                <ProgressBar isLoading={isLoading} />
                            </CardBody>
                        </Card>
                    </div>
                )}
                open={props.open}
                handleOpen={handleOpen}
                hideSubmit={true}
            />
        </div>
    );
}

// Export FileLoader.jsx
export default FileLoader;