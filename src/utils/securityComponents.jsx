// Imports
import React from "react";
import store from '../app/store.js';
import { Tooltip } from "@mui/material";
import { UPDATE_EDIT_ROW_DATA, UPDATE_TABULARIZE_UI_ITEMS } from "../reducers/SFRs/tabularizeUI.js";
import { SET_ACCORDION_PANE_INITIAL_STATE, updateSnackBar } from "../reducers/accordionPaneSlice.js";
import { SET_TERMS_INITIAL_STATE } from "../reducers/termsSlice.js";
import { SET_EDITORS_INITIAL_STATE } from "../reducers/editorSlice.js";
import { SET_THREATS_INITIAL_STATE } from "../reducers/threatsSlice.js";
import { SET_OBJECTIVES_INITIAL_STATE } from "../reducers/objectivesSlice.js";
import { SET_SFRS_INITIAL_STATE } from "../reducers/SFRs/sfrSlice.js";
import { SET_SFR_SECTIONS_INITIAL_STATE } from "../reducers/SFRs/sfrSectionSlice.js";
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
import { deepCopy } from "./deepCopy.js";
import CardTemplate from "../components/editorComponents/securityComponents/CardTemplate.jsx";

/**
 * The Security Components utilities class used for global methods for security components
 */
class SecurityComponents {
    // Constants
    static instance;
    noTestTooltip = (
        <span>
            {`In the event that there are no EAs for a requirement, if the EAs can be
            found elsewhere, or they are covered by another requirement, this toggle can be pressed.
            Click here to find out more: `}
            <a
                href="https://github.com/commoncriteria/pp-template/wiki/Evaluation-Activities"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
            >
                Evaluation Activities
            </a>
            .
            <br />
            <br />
            * Note: If this button is pressed, all previous data will be lost.
        </span>
    )

    // Constructor
    constructor() {
        if (SecurityComponents.instance) {
            return SecurityComponents.instance;
        }
        SecurityComponents.instance = this;

        // Bind methods
        this.handleCryptoUpdate = this.handleCryptoUpdate.bind(this);
        this.handleSnackBarSuccess = this.handleSnackBarSuccess.bind(this);
        this.handleSnackBarError = this.handleSnackBarError.bind(this);
        this.handleSnackbarTextUpdates = this.handleSnackbarTextUpdates.bind(this);
        this.updateTabularizeUI = this.updateTabularizeUI.bind(this);
        this.getSnackBarObject = this.getSnackBarObject.bind(this);
        this.fetchTemplateData = this.fetchTemplateData.bind(this);
        this.loadTemplateJson = this.loadTemplateJson.bind(this);
        this.clearSessionStorageExcept = this.clearSessionStorageExcept.bind(this);
        this.getDeletedRowIds = this.getDeletedRowIds.bind(this);
        this.handleSubmitResetDataMenu = this.handleSubmitResetDataMenu.bind(this);
        this.getObjectiveMaps = this.getObjectiveMaps.bind(this);
        this.getSfrMaps = this.getSfrMaps.bind(this);
        this.getCardTemplate = this.getCardTemplate.bind(this);
        this.getSfrTitle = this.getSfrTitle.bind(this);
        this.getThreatMaps = this.getThreatMaps.bind(this);
        this.transformThreatsToObjectiveMap = this.transformThreatsToObjectiveMap.bind(this);
        this.getElementMaps = this.getElementMaps.bind(this);
        this.getComponentXmlID = this.getComponentXmlID.bind(this);
        this.getElementId = this.getElementId.bind(this);
        this.getFormattedXmlID = this.getFormattedXmlID.bind(this);
    }

    // Methods
    /**
     * Handles updates for crypto tables
     * @param params
     */
    handleCryptoUpdate(params) {
        const { updateType, key, value, index, definitionType } = params
        const state = store.getState();
        const { row } = state.tabularize;
        let itemMap = {}
        const updateRow = true

        // Handle selectables
        if (definitionType === "selectcol") {
            let currentCell = deepCopy(row[key])

            // Handle adding a new type
            if (updateType === "add") {
                currentCell.push(value)
            }
            // Handle deleting an item
            else if (updateType === "delete") {
                currentCell.splice(index, 1)
            }
            // Handle updating
            else if (updateType === "update") {
                const isValidIndex = index !== undefined && index !== null && typeof index === "number"

                // Handle updating an item at a specific index
                if (isValidIndex) {
                    currentCell[index] = value
                }
                // Handle updating the entire cell value
                else {
                    currentCell = value
                }
            }

            // Update itemMap
            itemMap = {
                key: key,
                value: currentCell
            }
        }
        // Handle text updates
        else if (definitionType === "textcol" && updateType === "update") {
            itemMap = {
                key: key,
                value: value
            }
        }

        // Update tabularize ui
        this.updateTabularizeUI(itemMap, updateRow)
    }
    /**
     * Handles updates to the snackbar upon success
     * @param message the snackbar success message
     * @param additionalArgs any additional arguments for the snack bar (in the form of an object)
     */
    handleSnackBarSuccess(message, additionalArgs) {
        const snackBar = this.getSnackBarObject(message, "success", additionalArgs)

        // Show snack bar success message
        setTimeout(() => {
            store.dispatch(updateSnackBar(snackBar))
        }, 1000)
    }
    /**
     * Handles updates to the snackbar upon error
     * @param message the snackbar error message
     * @param additionalArgs any additional arguments for the snack bar (in the form of an object)
     */
    handleSnackBarError(message, additionalArgs) {
        const snackBar = this.getSnackBarObject(message.toString(), "error", additionalArgs)

        // Show snack bar error message
        setTimeout(() => {
            store.dispatch(updateSnackBar(snackBar))
        }, 1000)
    }
    /**
     * Handles snack bar updates for text updates
     * @param logicCallback the function logic that gets passed in
     * @param args any arguments used for the logicCallback function
     */
    handleSnackbarTextUpdates = (logicCallback, ...args) => {
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
                this.handleSnackBarSuccess(message)
            } else if (severity === "error") {
                this.handleSnackBarError(message)
            }
        }
    };

    // Helper Methods
    /**
     * Updates the tabularize UI
     * @param itemMap The itemMap object for updating the values
     * @param updateRow The boolean for updating the row if true or updating the UI items if false
     */
    updateTabularizeUI(itemMap, updateRow) {
        // Update row data
        if (updateRow) {
            store.dispatch(UPDATE_EDIT_ROW_DATA(itemMap))
        }
        // Update ui items
        else {
            store.dispatch(UPDATE_TABULARIZE_UI_ITEMS({ itemMap }))
        }
    }
    /**
     * Creates the snack bar object
     * @param message the snack bar message
     * @param severity the snack bar severity type
     * @param additionalArgs any additional arguments for the snack bar (in the form of an object)
     */
    getSnackBarObject(message, severity, additionalArgs) {
        return {
            open: true,
            message: message.toString(),
            severity: severity,
            ...(additionalArgs || {}),
        }
    }
    /**
     * Fetches the template data
     * @param version the version
     * @param base if the base template is required
     * @param dispatch the dispatch method
     * @returns {Promise<void>}
     */
    fetchTemplateData = async ({ version, type, base }, dispatch) => {
        // let ppType;
        try {
            // Clear session storage and reset template data to its original state
            await this.clearSessionStorageExcept(["ppTemplateVersion", "ppType", "isLoading"]);

            // Load json template data
            const data = await this.loadTemplateJson({ version, type, base });

            let {
                accordionPane,
                terms,
                editors,
                threats,
                objectives,
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
            dispatch(SET_ACCORDION_PANE_INITIAL_STATE(accordionPane));
            dispatch(SET_TERMS_INITIAL_STATE(terms));
            dispatch(SET_EDITORS_INITIAL_STATE(editors));
            dispatch(SET_THREATS_INITIAL_STATE(threats));
            dispatch(SET_OBJECTIVES_INITIAL_STATE(objectives));
            dispatch(SET_SFRS_INITIAL_STATE(sfrs));
            dispatch(SET_SFR_SECTIONS_INITIAL_STATE(sfrSections));
            dispatch(SET_SARS_INITIAL_STATE(sars));
            dispatch(SET_BIBLIOGRAPHY_INITIAL_STATE(bibliography));
            dispatch(SET_ENTROPY_APPENDIX_INITIAL_STATE(entropyAppendix));
            dispatch(SET_EQUIV_GUIDELINES_APPENDIX_INITIAL_STATE(equivGuidelinesAppendix));
            dispatch(SET_SATISFIED_REQS_APPENDIX_INITIAL_STATE(satisfiedReqsAppendix));
            dispatch(SET_VALIDATION_GUIDELINES_APPENDIX_INITIAL_STATE(validationGuidelinesAppendix));
            dispatch(SET_VECTOR_APPENDIX_INITIAL_STATE(vectorAppendix));
            dispatch(SET_ACKNOWLEDGEMENTS_APPENDIX_INITIAL_STATE(acknowledgementsAppendix));
            dispatch(SET_INCLUDE_PACKAGE_INITIAL_STATE(includePackage));
            dispatch(SET_MODULES_INITIAL_STATE(modules));
            dispatch(SET_PP_PREFERENCE_INITIAL_STATE(ppPreference));
            dispatch(RESET_CONFORMANCE_CLAIMS_STATE());
        } catch (error) {
            console.error("Error fetching template data:", error);
            // Handle the error as needed, e.g., dispatch an error action or return a value
        } finally {
            // Update the local storage with the current version
            sessionStorage.setItem('ppTemplateVersion', version);
            sessionStorage.setItem('ppType', type);

        }
    }
    /**
     * Loads in the template data
     * @param version the version
     * @param base if the base template is required
     * @returns {Promise<any>}
     */
    loadTemplateJson = async ({ version, type, base }) => {
        const basePath = import.meta.env.BASE_URL || '/';
        const dataFolder = `${basePath}data`;
        const baseDataFolder = `${dataFolder}/base_data`;

        let filePath;

        if (base) {
            switch (version) { // used for imported PPs
                case 'CC2022 Direct Rationale':
                    if (type === "Protection Profile") {
                        filePath = `${baseDataFolder}/base_cc2022_direct_rationale.json`;
                    } else if (type === "Functional Package") {
                        filePath = `${baseDataFolder}/base_cc2022_fp.json`;
                    }
                    break;
                case 'CC2022 Standard':
                    if (type === "Protection Profile") {
                        filePath = `${baseDataFolder}/base_cc2022_standard.json`
                    } else if (type === "Functional Package") {
                        filePath = `${baseDataFolder}/base_cc2022_fp.json`;
                    }
                    break;
                case 'Version 3.1':
                    filePath = `${baseDataFolder}/base_version_3.1.json`;
                    break;
                // Add more cases as needed
                default:
                    this.handleSnackBarError('Unsupported version', version);
                    throw new Error(`Unsupported version: ${version}`);
            }
        } else {
            switch (version) {
                case 'CC2022 Direct Rationale':
                    if (type === "Protection Profile") {
                        filePath = `${dataFolder}/cc2022_direct_rationale.json`;
                    } else if (type === "Functional Package") {
                        filePath = `${baseDataFolder}/base_cc2022_fp.json`;
                    }
                    break;
                case 'CC2022 Standard':
                    if (type === "Protection Profile") {
                        filePath = `${dataFolder}/cc2022_standard.json`;
                    } else if (type === "Functional Package") {
                        filePath = `${baseDataFolder}/base_cc2022_fp.json`;
                    }
                    break;
                // Add more cases as needed
                default:
                    this.handleSnackBarError('Unsupported version', version);
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
            this.handleSnackBarError('Failed to load JSON', error.message);
            throw error;
        }
    };
    /**
     * Clears out the session storage except for one key
     * @param keysToKeep the keys to keep
     */
    async clearSessionStorageExcept(keysToKeep) {
        // Create a map to store the values of the items you want to keep
        const valuesToKeep = {};

        // Retrieve and store the values of the items you want to keep
        keysToKeep.forEach(key => {
            const value = sessionStorage.getItem(key);
            if (value !== null) {
                valuesToKeep[key] = value;
            }
        });

        // Clear all items from sessionStorage
        await sessionStorage.clear();

        // Restore the items you wanted to keep
        Object.keys(valuesToKeep).forEach(key => {
            sessionStorage.setItem(key, valuesToKeep[key]);
        });
    }
    /**
     * Gets the ids as an array of rows that were deleted
     * @param originalRows the original row data
     * @param newRows the new row data
     * @returns {*} the deleted row ids as an array
     */
    getDeletedRowIds = (originalRows, newRows) => {
        // Create a Set of IDs from the newRows for quick lookup
        const newRowIds = new Set(newRows.map(row => row.id));

        // Filter the originalRows to find IDs not present in newRows
        const deletedRowIds = originalRows
            .filter(row => !newRowIds.has(row.id))
            .map(row => row.id);

        return deletedRowIds;
    };
    /**
     * Handles the submit reset data menu
     * @param closeMenu the function that closes the menu
     */
    handleSubmitResetDataMenu(closeMenu) {
        // Clear session storage and reset template data to its original state
        sessionStorage.clear()

        // Reload the page after clearing out local storage
        location.reload()

        // Close the dialog
        closeMenu()

        // Scroll back to the top of the page
        window.scrollTo(0, 0)

        // Update snackbar
        this.handleSnackBarSuccess("Data Successfully Reset to Default")
    }
    /**
     * Gets the objective maps
     * @param {*} objectives Objectives slice
     * @returns Object containing various relationships for name, UUID
     */
    getObjectiveMaps = (objectives) => {
        let objectiveMap = {
            objectiveNames: [],
            objectiveNameMap: {},
            objectiveUUIDMap: {}
        }
        Object.values(objectives).map((value) => {
            let terms = value.terms
            Object.entries(terms).map(([key, value]) => {
                let title = value.title
                if (!objectiveMap.objectiveNames.includes(title)) {
                    objectiveMap.objectiveNames.push(title)
                    objectiveMap.objectiveNameMap[title] = key
                    objectiveMap.objectiveUUIDMap[key] = title
                }
            })
        })
        objectiveMap.objectiveNames.sort()
        return objectiveMap
    }
    /**
     * Gets the SFR maps
     * @param {*} sfrSections sfrSections slice
     * @returns Object containing various relationships for name, UUID, and objectives
     */
    getSfrMaps = (sfrSections) => {
        let sfrMap = {
            sfrNames: [],
            sfrNameMap: {},
            sfrUUIDMap: {},
            objectivesSFRMap: {},
        }
        try {
            Object.values(sfrSections).map((sfrContent) => {
                Object.entries(sfrContent).map(([elementUUID, sfrElement]) => {
                    const { cc_id, iteration_id } = sfrElement
                    const title = this.getSfrTitle(cc_id, iteration_id)

                    if (!sfrMap.sfrNames.includes(title)) {
                        sfrMap.sfrNames.push(title)
                        sfrMap.sfrNameMap[title] = elementUUID
                        sfrMap.sfrUUIDMap[elementUUID] = title
                    }
                })
            })
        } catch (e) {
            this.handleSnackBarError(e)
            console.log(e)
        }

        sfrMap.sfrNames.sort()
        return sfrMap
    }
    /**
     * Gets the sfr title
     * @param cc_id the cc_id
     * @param iteration_id the iteration_id
     * @returns {*|string}
     */
    getSfrTitle = (cc_id, iteration_id) => {
        let title = cc_id ? cc_id : ""

        if (iteration_id) {
            title += `/${iteration_id}`
        }

        return title
    }
    /**
     * Gets the threat maps
     * @param {*} threats Threat slice
     * @returns Object containing various relationships for name, UUID, and objectives
     */
    getThreatMaps = (threats) => {
        let threatMap = {
            threatSectionUUID: "",
            threatNames: [],
            threatNameMap: {},
            threatUUIDMap: {},
            objectiveToThreats: {}
        }

        const [threatKey, threatsObject] = Object.entries(threats).find(([_, obj]) => obj.title === "Threats")
        const terms = threatsObject.terms
        threatMap.threatSectionUUID = threatKey;

        Object.entries(terms).map(([key, value]) => {
            let title = value.title
            if (!threatMap.threatNames.includes(title)) {
                threatMap.threatNames.push(title)
                threatMap.threatNameMap[title] = key
                threatMap.threatUUIDMap[key] = title
            }
        });

        threatMap.objectiveToThreats = this.transformThreatsToObjectiveMap(terms);
        threatMap.threatNames.sort();

        return threatMap
    }
    /**
     * Transforms threats to objectives through a map
     * @param {*} threatsData Threat slice
     * @returns Object that maps a single objective to one or more threats
     */
    transformThreatsToObjectiveMap = (threatsData) => {
        let objectiveToThreatsMap = {};

        Object.entries(threatsData).forEach(([threatUUID, threatData]) => {
            threatData.objectives.forEach(objective => {
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

        return objectiveToThreatsMap;
    };
    /**
     * Gets the element maps
     * @param componentUUID the component UUID
     * @param component the component
     * @returns {{elementNames: *[], elementNameMap: {}, componentName: *, elementUUIDMap: {}, componentUUID}}
     */
    getElementMaps = (componentUUID, component) => {
        let { cc_id, iteration_id, elements } = component
        elements = elements ? deepCopy(elements) : {}
        let { formattedCcId, formattedIterationId, componentXmlId } = this.getComponentXmlID(cc_id, iteration_id, true, true)
        let elementMap = {
            componentName: componentXmlId,
            componentUUID: componentUUID,
            elementNames: [],
            elementNameMap: {},
            elementUUIDMap: {}
        }

        // Generate the element map
        if (elements && Object.entries(elements).length > 0) {
            Object.keys(elements).forEach((key, index) => {
                let name = this.getElementId(formattedCcId, formattedIterationId, index, false)
                if (!elementMap.elementNames.includes(name)) {
                    elementMap.elementNames.push(name)
                    elementMap.elementNameMap[name] = key
                    elementMap.elementUUIDMap[key] = name
                }
            })
        }
        elementMap.elementNames.sort()
        return elementMap
    }
    getComponentXmlID = (ccID, iterationID, isRequirementsFormat, getSplitValues) => {
        let formattedIterationId = ""
        let formattedCcId =
            ccID ?
                (
                    isRequirementsFormat ?
                        ccID.valueOf().toUpperCase() :
                        ccID.valueOf().toLowerCase()
                ).replace(/\s+/g, '')
                : ""

        // Get the iteration value
        if (iterationID && typeof iterationID === "string" && iterationID !== "") {
            formattedIterationId = (
                isRequirementsFormat ?
                    "/" + iterationID.toUpperCase() :
                    "-" + iterationID.toLowerCase()
            ).replace(/\s+/g, '')
        }

        // Get formatted values
        let componentXmlId = formattedCcId + formattedIterationId
        componentXmlId = isRequirementsFormat ? componentXmlId : this.getFormattedXmlID(componentXmlId)

        return getSplitValues ? { formattedCcId, formattedIterationId, componentXmlId } : componentXmlId
    }
    getElementId = (ccID, iterationID, index, isElementXMLID) => {
        let elementId = `${ccID + (isElementXMLID ? "e" : ".") + (index + 1) + iterationID}`
        return isElementXMLID ? this.getFormattedXmlID(elementId) : elementId
    }
    getFormattedXmlID = (xmlId) => {
        if (xmlId) {
            return xmlId
                .replace(/\s+/g, '-')
                .replace(/_/g, '-')
                .replace(/\./g, '-')
                .toLowerCase();
        } else {
            return ""
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
     * @returns {Element}
     */
    getCardTemplate(header, body, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor) {
        const headerText = headerTextColor ? headerTextColor : 'text-secondary';
        const iconColor = collapseIconColor ? collapseIconColor : "#d926a9";

        // Return Method
        return (
            <CardTemplate
                type={"parent"}
                header={
                    <Tooltip
                        arrow
                        title={tooltip}
                    >
                        <label className={`resize-none justify-start flex font-bold text-[14px] p-0 ${headerText}`}>
                            {header}
                        </label>
                    </Tooltip>
                }
                body={
                    <span className="flex justify-stretch min-w-full pb-2">
                        {body}
                    </span>
                }
                collapse={collapse}
                collapseHandler={() => handleSectionCollapse(collapse)}
                tooltip={header}
                collapseIconColor={iconColor}
            />
        )
    }
}

// Export Security Components
export default new SecurityComponents();