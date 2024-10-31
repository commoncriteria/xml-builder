// Imports
import axios from "axios";
import React, { useCallback, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { useDropzone } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { XMLValidator } from "fast-xml-parser";
import { create } from "xmlbuilder2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormControlLabel from "@mui/material/FormControlLabel";
import PPXML from "../../assets/xml/pp-template.xml";
import MODXML from "../../assets/xml/module-template.xml";
import { SET_XMLTAGMETA, DELETE_ALL_SAR_SECTIONS, RESET_SAR_STATE, CREATE_SAR_SECTION, CREATE_SAR_COMPONENT, CREATE_SAR_ELEMENT } from "../../reducers/sarsSlice.js";
import * as fileParser from "../../utils/fileParser.js";
import { CREATE_TERM_ITEM, DELETE_ALL_SECTION_TERMS, RESET_TERMS_STATE } from "../../reducers/termsSlice.js";
import { CREATE_THREAT_TERM, DELETE_ALL_THREAT_TERMS, RESET_THREATS_STATE, UPDATE_THREAT_SECTION_DEFINITION, UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION } from "../../reducers/threatsSlice.js";
import { CREATE_OBJECTIVE_TERM, DELETE_ALL_OBJECTIVE_TERMS, RESET_OBJECTIVES_STATE } from "../../reducers/objectivesSlice.js";
import { CREATE_EDITOR, UPDATE_EDITOR_TEXT, RESET_EDITOR_STATE, UPDATE_EDITOR_METADATA } from "../../reducers/editorSlice.js";
import { DELETE_ALL_SFR_SECTION_ELEMENTS, RESET_SFR_SECTION_STATE, CREATE_SFR_COMPONENT, UPDATE_SFR_COMPONENT_ITEMS, UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES } from "../../reducers/SFRs/sfrSectionSlice.js";
import { DELETE_ALL_SFR_SECTIONS, UPDATE_MAIN_SFR_DEFINITION, UPDATE_AUDIT_SECTION, RESET_SFR_STATE, CREATE_SFR_SECTION, SET_IMPLMENTATION_REASONING } from "../../reducers/SFRs/sfrSlice.js";
import { CREATE_ACCORDION_FORM_ITEM, DELETE_ALL_ACCORDION_FORM_ITEMS, RESET_ACCORDION_PANE_STATE, CREATE_ACCORDION_SUB_FORM_ITEM, updateMetaDataItem, updateFileUploaded, updatePlatforms, updateSnackBar } from "../../reducers/accordionPaneSlice.js";
import { ADD_ENTRIES, RESET_BIBLIOGRAPHY_STATE } from "../../reducers/bibliographySlice.js";
import { setEntropyXML, RESET_ENTROPY_APPENDIX_STATE } from "../../reducers/entropyAppendixSlice.js";
import { setEquivGuidelinesXML, RESET_EQUIVALENCY_APPENDIX_STATE } from "../../reducers/equivalencyGuidelinesAppendix.js";
import { ADD_PACKAGE, RESET_PACKAGE_STATE } from "../../reducers/includePackageSlice.js";
import { setModulesXML, RESET_MODULES_STATE } from "../../reducers/moduleSlice.js";
import validator from 'validator';
import _ from 'lodash';
import { setSatisfiedReqsXML, RESET_SATISFIED_REQS_APPENDIX_STATE } from "../../reducers/satisfiedReqsAppendix.js";
import { setValidationGuidelinesXML, RESET_VALIDATION_GUIDELINES_APPENDIX_STATE } from "../../reducers/validationGuidelinesAppendix.js";
import { RESET_VECTOR_APPENDIX_STATE, setVectorXML } from "../../reducers/vectorAppendix.js";
import { RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE, setAcknowledgementsXML } from "../../reducers/acknowledgementsAppendix.js";
import { RESET_PROGRESS, setProgress } from "../../reducers/progressSlice.js";
import ProgressBar from "../ProgressBar.jsx";
import { setPreferenceXML, RESET_PREFERENCE_STATE } from "../../reducers/ppPreferenceSlice.js";

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
    const dispatch = useDispatch();
    const checkboxStyling = { color: "#1FB2A6", '&.Mui-checked': { color: "#1FB2A6" } }
    const [isLoading, setIsLoading] = useState(false);
    // const state = useSelector((state) => state);
    const { pp, mod, filename } = useSelector((state) => state.accordionPane.loadedfile);
    const stateAccordionPane = useSelector((state) => state.accordionPane);
    const stateEditors = useSelector((state) => state.editors);
    const stateObjectives = useSelector((state) => state.objectives);
    const stateSars = useSelector((state) => state.sars);
    const stateSfrs = useSelector((state) => state.sfrs);
    const stateSfrSections = useSelector((state) => state.sfrSections);
    const stateTerms = useSelector((state) => state.terms);
    const stateThreats = useSelector((state) => state.threats);
    const ppPreference = useSelector((state) => state.ppPreference);
    const previousSfrSectionsRef = useRef(_.cloneDeep(stateSfrSections));

    // Use Effects
    // useEffect(() => {
    //     console.log(ppPreference);
    // }, [ppPreference])
    useEffect(() => {
        // Post-processing to convert selection dependent selections/elements/components IDs + test dependency IDs to UUID
        // Need to put this code in useEffect, or else it doesn't get latest state value for sfrSections and UUIDs
        // for families is all wrong

        // Use a deep comparison to determine if the state has changed -- need this or else infinite re-render happens (due to evaluation activity dropdown changing state)
        const previousSfrSections = previousSfrSectionsRef.current;

        if (props.open && !_.isEqual(previousSfrSections.current, stateSfrSections)) {
            // Update the ref to the current state
            previousSfrSections.current = stateSfrSections;

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
                                    if (selectionUUID != null) {
                                        selections.push(selectionUUID);
                                    }
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
    }, [stateSfrSections]);

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

                setTimeout(() => {
                    // Update progress
                    const currentProgress = 100
                    const currentSteps = {
                        "Appendices": true
                    }
                    handleProgressBar(currentProgress, currentSteps)
                }, 500)
            }, 1000);

            return "success";
        } catch (err) {
            const timeout = 1000;
            const errorMessage = `XML is not Valid: ${err}\nResetting to local template values.`
            console.log(errorMessage);

            // Update snackbar
            handleSnackBar({
                open: true,
                message: errorMessage,
                severity: "error",
                autoHideDuration: 6000
            }, timeout)

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

        // Load all file values
        setTimeout(() => {
            // Load initial components
            loadPackages(xml)
            loadModules(xml)
            loadPlatforms(xml)
            loadPPReference(xml)
            loadOverview(xml);
            loadTOEOverview(xml);
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
            loadConformanceClaim(xml);

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
            const { objectivesMap, sfrToObjectivesMap } = loadObjectives(xml);
            loadOEs(xml, objectivesMap);
            loadSecurityProblemDescription(xml);
            loadThreats(xml, objectivesMap);
            loadAssumptions(xml, objectivesMap);

            // Update progress
            const currentProgress = 70
            const currentSteps = {
                "Objectives": true,
                "OEs": true,
                "Threats": true,
                "Assumptions": true,
            }
            handleProgressBar(currentProgress, currentSteps)

            // Load SFRS and SARs
            loadSFRs(xml, sfrToObjectivesMap, useCaseMap);
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
            loadImplementationDeps(xml);
        }, 5000);
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
        const sectionUUID = getUUIDByTitle(slice, sectionTitle);
        switch (sliceName) {
            case "objectives":
                dispatch(DELETE_ALL_OBJECTIVE_TERMS({ title: sectionTitle, objectiveUUID: sectionUUID }));
                return
            case "terms":
                dispatch(DELETE_ALL_SECTION_TERMS({ title: sectionTitle, termUUID: sectionUUID }));
                return
            case "threats":
                dispatch(DELETE_ALL_THREAT_TERMS({ title: sectionTitle, threatUUID: sectionUUID }));
                return
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
                return
            }
            case "sars": {
                // Delete SAR Family (and associated component + elements)
                dispatch(DELETE_ALL_SAR_SECTIONS());

                // Delete any intro text (part of editor slice)
                const sarEditorUUID = getUUIDByTitle(stateEditors, "Security Assurance Requirements");
                dispatch(UPDATE_EDITOR_TEXT({ uuid: sarEditorUUID, newText: "" }));

                return
            }
            case "conformance_claims": {
                const conformanceClaimsUUID = getUUIDByTitle(stateAccordionPane.sections, sectionTitle);
                const cc_section_uuids = stateAccordionPane.sections[conformanceClaimsUUID].formItems.map(editor => editor.uuid);

                cc_section_uuids.forEach(uuid => {
                    dispatch(UPDATE_EDITOR_TEXT({ uuid: uuid, newText: "" }));
                });
                return
            }
            default:
                return null
        }
    }

    /**
     * Clears out the sections
     */
    const clearOutSections = () => {
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
        }, 300)
    }

    /**
     * Loads in the PP Reference
     * @param xml the xml
     */
    const loadPPReference = (xml) => {
        try {
            const ppReference = fileParser.getPPReference(xml);
            const ppMeta = fileParser.getPPMetadata(xml);

            dispatch(updateMetaDataItem({ type: 'xmlTagMeta', item: ppMeta }));
            dispatch(updateMetaDataItem({ type: 'ppName', item: ppReference.PPTitle }));
            dispatch(updateMetaDataItem({ type: 'version', item: ppReference.PPVersion }));
            dispatch(updateMetaDataItem({ type: 'releaseDate', item: ppReference.PPPubDate }));
            dispatch(updateMetaDataItem({ type: 'revisionHistory', item: ppReference.RevisionHistory }));
        } catch (err) {
            console.log(`Failed to load PP Reference Data: ${err}`);
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
            console.log(`Failed to load Package Data: ${err}`);
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
                dispatch(setPreferenceXML({ preference: preferences }));
            }
        } catch (err) {
            console.log(`Failed to load PP Preference Data: ${err}`);
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
                dispatch(setModulesXML({ modules: mods }));
            }
        } catch (err) {
            console.log(`Failed to load Module Data: ${err}`);
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
            console.log(`Failed to load Platform Data: ${err}`);
        }
    }

    /**
     * Loads the overview
     * @param xml the xml
     */
    const loadOverview = (xml) => {
        try {
            const overviewUUID = getUUIDByTitle(stateEditors, "Objectives of Document");
            const overviewData = fileParser.getDocumentObjectives(xml);

            if (overviewData.doc_objectives.length != 0) {
                dispatch(UPDATE_EDITOR_TEXT({ uuid: overviewUUID, newText: overviewData.doc_objectives }));
            }

            dispatch(UPDATE_EDITOR_METADATA({ uuid: overviewUUID, xmlTagMeta: overviewData.xmlTagMeta }));
        } catch (err) {
            console.log(`Failed to load Overview Data: ${err}`);
        }
    }

    /**
     * Loads the TOE overview
     * @param xml the xml
     */
    const loadTOEOverview = (xml) => {
        try {
            const introductionUUID = getUUIDByTitle(stateAccordionPane.sections, "Introduction");
            const TOEoverviewUUID = getUUIDByTitle(stateEditors, "TOE Overview");
            const compliantTOE = fileParser.getCompliantTOE(xml);

            if (compliantTOE) {
                const toeOverview = compliantTOE.toe_overview;
                const toeBoundary = compliantTOE.toe_boundary;
                const toePlatform = compliantTOE.toe_platform;

                // Load TOE Overview (if exists)
                dispatch(UPDATE_EDITOR_TEXT({ uuid: TOEoverviewUUID, newText: toeOverview }));

                // Create the editor if there is content in the xml for TOE Boundary
                if (toeBoundary.length != 0) {
                    let editorUUID = dispatch(CREATE_EDITOR({ title: "TOE Boundary" })).payload;

                    dispatch(UPDATE_EDITOR_TEXT({ uuid: editorUUID, newText: toeBoundary }));

                    if (editorUUID) {
                        // Add the editor to the TOE Overview as a subsection
                        dispatch(CREATE_ACCORDION_SUB_FORM_ITEM({ accordionUUID: introductionUUID, uuid: editorUUID, formUUID: TOEoverviewUUID, contentType: "editor" }));
                    }
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
        } catch (err) {
            console.log(`Failed to load TOE Overview Data: ${err}`);
        }
    }

    /**
     * Loads the Scope of the Document Section (if exists)
     * @param xml the xml
     */
    const loadDocumentScope = (xml) => {
        try {
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
            console.log(`Failed to load Scope of the Document Data: ${err}`);
        }
    }

    /**
     * Loads the Scope of the Document Section (if exists)
     * @param xml the xml
     */
    const loadIntendedReadership = (xml) => {
        try {
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
            console.log(`Failed to load Indended Readership Data: ${err}`);
        }
    }

    /**
     * Loads the tech terms
     * @param xml the xml
     */
    const loadTechTerms = (xml) => {
        try {
            // Get UUID of the Tech Terms section in order to add terms to that section
            const termUUID = getUUIDByTitle(stateTerms, "Technical Terms");
            const acronymUUID = getUUIDByTitle(stateTerms, "Acronyms");

            // Get all the Tech Terms
            const terms = fileParser.getAllTechTerms(xml);
            if (terms) {
                const techTerms = terms.termsArray;
                const acronyms = terms.acronymsArray;

                // Populate tech terms
                Object.values(techTerms).map((term) => {
                    dispatch(CREATE_TERM_ITEM({ termUUID: termUUID, name: term.name, definition: term.definition, tagMeta: term.xmlTagMeta }));
                });

                // Populate acronym terms
                Object.values(acronyms).map((term) => {
                    dispatch(CREATE_TERM_ITEM({ termUUID: acronymUUID, name: term.name, definition: term.definition, tagMeta: term.xmlTagMeta }));
                });
            }

        } catch (err) {
            console.log(`Failed to load Tech Terms Data: ${err}`);
        }
    }

    /**
     * Loads the use cases
     * @param xml the xml
     */
    const loadUseCase = (xml) => {
        let useCaseMap = {}
        try {
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
            console.log(`Failed to load Usecase Data: ${err}`);
        }
        return useCaseMap
    }

    /**
     * Loads the conformance claim
     * @param xml the xml
     */
    const loadConformanceClaim = (xml) => {
        try {
            const conformanceStatementUUID = getUUIDByTitle(stateEditors, "Conformance Statement");
            const ccConformanceClaimsUUID = getUUIDByTitle(stateEditors, "CC Conformance Claims");
            const ppClaimUUID = getUUIDByTitle(stateEditors, "PP Claims");
            const packageClaimUUID = getUUIDByTitle(stateEditors, "Package Claims");

            const allCClaims = fileParser.getCClaims(xml);
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
                        default:
                            return null;
                    }
                });
            }
        } catch (err) {
            console.log(`Failed to load Conformance Claims Data: ${err}`);
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

        try {
            // Get Objectives
            const objectivesUUID = getUUIDByTitle(stateObjectives, "Security Objectives for the TOE");
            const toeObjectives = fileParser.getAllSecurityObjectivesTOE(xml);
            Object.values(toeObjectives).map((objective) => {
                const name = objective.name;
                const definition = objective.definition;
                const sfrs = objective.sfrs;
                const result = dispatch(CREATE_OBJECTIVE_TERM({ objectiveUUID: objectivesUUID, title: name, definition: definition, sfrs: sfrs }));
                const objectiveUUID = result.payload.id;
                objectivesMap[name] = objectiveUUID;
                const isSfrValid = sfrs && sfrs.length > 0;
                if (isSfrValid) {
                    sfrs.forEach((sfr) => {
                        if (sfr && sfr.sfrDetails && sfr.sfrDetails.sfr_name) {
                            const sfrName = sfr.sfrDetails.sfr_name.replace(/["']/g, '').trim().split("(")[0].replace(/\s/g, '');
                            const isRationale = sfr.rationale && sfr.rationale.description;
                            const objective = { uuid: objectiveUUID, rationale: isRationale ? sfr.rationale.description : "" };

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
            console.log(`Failed to load Objectives Data: ${err}`);
        }
        return { objectivesMap, sfrToObjectivesMap };
    }

    /**
     * Loads the OEs
     * @param xml the xml
     * @param objectivesMap the objectives map
     */
    const loadOEs = (xml, objectivesMap) => {
        try {
            const oeUUID = getUUIDByTitle(stateObjectives, "Security Objectives for the Operational Environment");
            const OEs = fileParser.getAllSecurityObjectivesOE(xml);
            Object.values(OEs).map((objective) => {
                const name = objective.name;
                const definition = objective.definition;
                const sfrs = objective.sfrs;
                const result = dispatch(CREATE_OBJECTIVE_TERM({ objectiveUUID: oeUUID, title: name, definition: definition, sfrs: sfrs }));
                objectivesMap[name] = result.payload.id;
            })
        } catch (err) {
            console.log(`Failed to load Operational Objectives of the Environment Data: ${err}`);
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
            console.log(`Failed to load Threat Data: ${err}`);
        }
    }

    /**
     * Loads the threats
     * @param xml the xml
     * @param objectivesMap the objectives map
     */
    const loadThreats = (xml, objectivesMap) => {
        try {
            const threatsUUID = getUUIDByTitle(stateThreats, "Threats");
            const threatMeta = fileParser.getAllThreats(xml);
            const threatDescription = threatMeta.threat_description;
            const allThreats = threatMeta.threats;

            // Set the description
            dispatch(UPDATE_THREAT_SECTION_DEFINITION({ uuid: threatsUUID, title: "Threats", newDefinition: threatDescription }));


            Object.values(allThreats).map((threat) => {
                const objectivesWithUUID = Object.values(threat.securityObjectives).map((so) => {
                    // get UUID of the matching objective
                    const objectiveUUID = objectivesMap[so.name];

                    // return a new securityObjective object that includes the UUID
                    return {
                        ...so,
                        uuid: objectiveUUID
                    };
                });

                dispatch(CREATE_THREAT_TERM({ threatUUID: threatsUUID, title: threat.name, definition: threat.definition, objectives: objectivesWithUUID }));
            })
        } catch (err) {
            console.log(`Failed to load Threat Data: ${err}`);
        }
    }

    /**
     * Loads the assumptions
     * @param xml the xml
     */
    const loadAssumptions = (xml, objectivesMap) => {
        try {
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
            console.log(`Failed to load Assumptions Data: ${err}`);
        }
    }

    /**
     * Loads the sfrs
     * @param xml the xml
     * @param sfrToObjectivesMap the sfrToObjectives map
     * @param useCaseMap the use case map
     */
    const loadSFRs = (xml, sfrToObjectivesMap, useCaseMap) => {
        // Load audit section
        dispatch(UPDATE_AUDIT_SECTION({ newDefinition: fileParser.getAuditSection(xml) }));

        // SFRs
        const allSFRs = fileParser.getSFRs(xml);
        let previousSfrFamily = null;
        let previousFamilyUUID = null;
        let sfrComponents = [];
        let sfrFamilyUUID = null;

        let familiesDone = [];
        allSFRs.forEach((sfr, index) => {
            if (!familiesDone.includes(sfr.family_id) || index == 0) {
                // Create SFR slices (SFR Classes parent high level)
                const result = dispatch(CREATE_SFR_SECTION({ title: `Class: ${sfr.family_name.replace("Class: ", "")}`, definition: sfr.familyDescription }));
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
                    const sfrName = `${cc_id}${iteration_id && iteration_id !== "" ? "/" + iteration_id : ""}`;

                    // Get the objectives based off of the sfrName and set to empty if no objectives exist for the entry
                    if (sfrToObjectivesMap.hasOwnProperty(sfrName)) {
                        component.objectives = JSON.parse(JSON.stringify(sfrToObjectivesMap[sfrName]));
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
                    dispatch(CREATE_SFR_COMPONENT({ sfrUUID: previousFamilyUUID, component: component }));
                });
                sfrComponents = [];
            }

            sfrComponents.push(sfr);
            previousSfrFamily = sfr.family_id;
            previousFamilyUUID = sfrFamilyUUID;
            familiesDone.push(sfr.family_id);
        });

        // Create component (if PP only has 1 SFR)
        sfrComponents.forEach(component => {
            dispatch(CREATE_SFR_COMPONENT({ sfrUUID: previousFamilyUUID, component: component }));
        })
    }

    /**
     * Loads the SARs
     * @param xml the xml
     */
    const loadSARs = (xml) => {
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
            dispatch(setEntropyXML({ xml: appendix.entropyAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Application Software Equivalency Guidelines
     * @param xml the xml
     */
    const loadGuidelinesAppendix = (xml) => {
        const appendix = fileParser.getEquivGuidelinesAppendix(xml);

        if (appendix.guidelinesAppendix) {
            dispatch(setEquivGuidelinesXML({ xml: appendix.guidelinesAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Implicitly Satisfied Requirements
     * @param xml the xml
     */
    const loadSatisfiedReqsAppendix = (xml) => {
        const appendix = fileParser.getSatisfiedReqsAppendix(xml);

        if (appendix.satisfiedReqsAppendix) {
            dispatch(setSatisfiedReqsXML({ xml: appendix.satisfiedReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Validation Guidelines
     * @param xml the xml
     */
    const loadValidationGuidelinesAppendix = (xml) => {
        const appendix = fileParser.getValidationGuidelinesAppendix(xml);

        if (appendix.valGuideAppendix) {
            dispatch(setValidationGuidelinesXML({ xml: appendix.valGuideAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }


    /**
     * Load Initialization Vector Requirements for NIST-Approved Cipher Modes
     * @param xml the xml
     */
    const loadVectorAppendix = (xml) => {
        const appendix = fileParser.getVectorAppendix(xml);

        if (appendix.vectorReqsAppendix) {
            dispatch(setVectorXML({ xml: appendix.vectorReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load Acknowledgements
     * @param xml the xml
     */
    const loadAcknowledgementsAppendix = (xml) => {
        const appendix = fileParser.getAcknowledgementsAppendix(xml);

        if (appendix.acknowledgementsReqsAppendix) {
            dispatch(setAcknowledgementsXML({ xml: appendix.acknowledgementsReqsAppendix, xmlTagMeta: appendix.xmlTagMeta }));
        }
    }

    /**
     * Load implementation dependent reasonings
     * @param xml the xml
     */
    const loadImplementationDeps = (xml) => {
        const implementations = fileParser.getImplementations(xml);

        if (implementations) {
            dispatch(SET_IMPLMENTATION_REASONING({ xml: implementations }));
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
            const timeout = 3000;
            setIsLoading(false);
            resetState();
            handleSnackBar({
                open: true,
                message: `Failed to Load ${file.name}`,
                severity: "error"
            }, timeout)
        }
        reader.onerror = () => {
            const timeout = 3000;
            setIsLoading(false);
            resetState();
            handleSnackBar({
                open: true,
                message: `Failed to Load XML ${file.name}`,
                severity: "error"
            }, timeout)
        }

        reader.onload = () => {
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
                    const timeout = 1000;
                    handleSnackBar({
                        open: true,
                        message: `Loaded in ${file.name}`
                    }, timeout)
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
     * Handles updates to the snackbar
     * @param snackbar the snackbar values
     */
    const handleSnackBar = (snackbar, timeout) => {
        setTimeout(() => {
            dispatch(updateSnackBar(snackbar))
        }, timeout)
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
     * Loads in the default templates for pp, mod
     * @param {*} type : the type of xml to load
     */
    function loadDefaultXML(type) {
        const XML = type === "pp" ? PPXML : MODXML;
        return axios.get(XML, {
            "Content-Type": "application/xml; charset=utf-8"
        }).then((response) => {
            // Validate XML
            const validation = validate_XML(response.data);

            setTimeout(() => {
                setIsLoading(false)
            }, 6000);

            return validation
        })
    }

    /**
     * Handles the checkbox changes
     * @param event the checkbox event
     */
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;

        // Update according to checkbox selection
        if (name === "pp" || name === "mod") {
            const fileName = name.toUpperCase();

            // Remove files
            resetState();

            // Update files
            setTimeout(() => {
                const currentPP = name === "pp" ? checked : false;
                const currentMod = name === "mod" ? checked : false;
                handleUpdateFiles("", "", currentPP, currentMod);
            }, 500)

            // Load in the XML
            if (checked) {
                try {
                    loadDefaultXML(name).then((response) => {
                        if (response === "success") {
                            // Update snackbar
                            const timeout = 6000;
                            handleSnackBar({
                                open: true,
                                message: `Loaded in ${fileName} XML`
                            }, timeout)
                        } else {
                            // Update files
                            setTimeout(() => {
                                handleUpdateFiles("", "", false, false);
                            }, 500)
                        }
                    })
                } catch (e) {
                    // Update snackbar
                    const timeout = 1000;
                    handleSnackBar({
                        open: true,
                        message: `Unable to load in ${fileName} XML`,
                        severity: "error"
                    }, timeout)
                    console.log(e)

                    // Update files
                    setTimeout(() => {
                        handleUpdateFiles("", "", false, false);
                    }, timeout)
                }
            } else {
                // Update snackbar
                const timeout = 1000;
                handleSnackBar({
                    open: true,
                    message: `Loaded in Default XML Template`
                }, timeout)
            }
        }
    };

    // Use Dropzones
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        disabled: pp || mod,
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
                            <CardBody className="border-b-2 rounded-b-sm border-gray-300 text-secondary">
                                <div {...getRootProps()} style={{ display: 'inline-block', padding: 2 }}>
                                    <input {...getInputProps()} />
                                    <Button
                                        sx={{ fontSize: "12px" }}
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon />}
                                        style={{ color: "white", marginTop: '0px', marginBottom: '10px', pointerEvents: pp || mod ? 'none' : 'auto' }}
                                        disabled={isLoading || pp || mod}
                                    >
                                        {/* {`Upload PP XML`} */}
                                        {filename !== "" ? 'Replace File' : 'Upload PP XML'}
                                    </Button>
                                </div>
                                {(!isLoading && filename !== "" && !pp && !mod) &&
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ textAlign: 'left', paddingTop: 10, fontSize: "13px" }}>{filename}</span>
                                        <Button
                                            sx={{ fontSize: "12px" }}
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => {
                                                resetState()

                                                // Update snackbar
                                                const timeout = 1000;
                                                handleSnackBar({
                                                    open: true,
                                                    message: `Loaded in Default XML Template`
                                                }, timeout)
                                            }}
                                            style={{ marginLeft: '10px', textAlign: 'right' }}
                                            disabled={isLoading}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                }
                                <ProgressBar isLoading={isLoading} />
                            </CardBody>
                            <CardFooter>
                                <div className="py-1">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={pp}
                                                onChange={handleCheckboxChange}
                                                name="pp"
                                                sx={checkboxStyling}
                                                disabled={(isLoading || mod) ? true : false}
                                            />
                                        }
                                        label={<span style={{ fontSize: '13px' }}>Use PP Template</span>}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={mod}
                                                onChange={handleCheckboxChange}
                                                name="mod"
                                                sx={checkboxStyling}
                                                disabled={(isLoading || pp) ? true : false}
                                            />
                                        }
                                        label={<span style={{ fontSize: '13px' }}>Use Module Template</span>}
                                    />
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                )}
                open={props.open}
                handleOpen={() => { props.handleOpen() }}
                hideSubmit={true}
            />
        </div>
    );
}

// Export FileLoader.jsx
export default FileLoader;