// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { CREATE_SFR_SECTION_ELEMENT, DELETE_SFR_SECTION_ELEMENT, UPDATE_SFR_SECTION_ELEMENT, UPDATE_SFR_COMPONENT_ITEMS } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { RESET_EVALUATION_ACTIVITY_UI } from "../../../../reducers/SFRs/evaluationActivitiesUI.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import Modal from "../../../modalComponents/Modal.jsx";
import MultiSelectDropdown from "../MultiSelectDropdown.jsx";
import SfrAuditEvents from "./auditEvents/SfrAuditEvents.jsx";
import CardTemplate from "../CardTemplate.jsx";
import SfrEvaluationActivity from "./aActivity/SfrEvaluationActivity.jsx";
import SfrRequirements from "./requirements/SfrRequirements.jsx";
import ManagementFunctionTable from "./requirements/ManagementFunctionTable.jsx";
import ResetDataConfirmation from "../../../modalComponents/ResetDataConfirmation.jsx";
import ApplicationNote from "./ApplicationNote.jsx";
import ImplementationDependent from "./ImplementationDependent.jsx";
import ToggleSwitch from "../../../ToggleSwitch.jsx";
import TipTapEditor from "../../TipTapEditor.jsx";
import SecurityComponents from "../../../../utils/securityComponents.jsx";
import { deepCopy } from "../../../../utils/deepCopy.js";

/**
 * The SfrWorksheet class that displays the data for the sfr worksheet as a modal
 * @returns {JSX.Element}   the sfr worksheet modal content
 * @constructor             passes in props to the class
 */
function SfrWorksheet(props) {
    // Prop Validation
    SfrWorksheet.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        value: PropTypes.object.isRequired,
        open: PropTypes.bool.isRequired,
        allSfrOptions: PropTypes.object.isRequired,
        handleOpen: PropTypes.func.isRequired
    };

    // Constants
    const {
        getElementMaps,
        getComponentXmlID,
        getFormattedXmlID,
        handleSnackBarError,
        handleSnackBarSuccess,
        handleSnackbarTextUpdates
    } = SecurityComponents
    const dispatch = useDispatch();
    const { textFieldBorder, secondary, primary, grayTitle, checkboxPrimaryNoPad, checkboxSecondaryNoPad, icons } = useSelector((state) => state.styling);
    const [openSfrComponent, setOpenSfrComponent] = useState(true)
    const [openSfrElement, setOpenSfrElement] = useState(true)
    const [openManagementFunctionModal, setOpenManagementFunctionModal] = useState(false)
    const [selectedSfrElement, setSelectedSfrElement] = useState('')
    const [currentElements, setCurrentElements] = useState({})
    const [elementXmlId, setElementXmlId] = useState("")

    // Use Effects
    useEffect(() => {
        let elementValues = deepCopy(props.value.elements)
        if (elementValues !== deepCopy(currentElements)) {
            setCurrentElements(elementValues)
        }
        let xmlID = props.value.xml_id
        if (xmlID === "") {
            const { cc_id, iteration_id } = props.value
            let updatedXmlID = getComponentXmlID(cc_id, iteration_id, false, false)
            updateXmlID(updatedXmlID)
        }
    }, [props]);
    useEffect(() => {
        const maps = generateElementMaps(props)
        if (maps && maps.elementNames && Object.keys(maps.elementNames).length > 0 && selectedSfrElement === '') {
            setSelectedSfrElement(maps.elementNames[0])
        }
    }, [currentElements])
    useEffect(() => {
        const xmlId = getElementValuesByType("elementXMLID")

        if (xmlId) {
            setElementXmlId(xmlId)
        } else {
            setElementXmlId("")
        }
    }, [selectedSfrElement])

    // Methods
    const handleSetOpenSfrComponent = () => {
        setOpenSfrComponent(!openSfrComponent)
    }
    /**
     * Updates the component text by type
     * @param event the event
     * @param type the text type
     *             Options: title, definition
     */
    const updateComponentTextByType = (event, type) => {
        const value = event.target.value
        const itemMap = {
            [type]: value
        }

        // Update the text value by type
        updateComponentItems(itemMap)
    }
    /**
     * Updates the component id by type
     * @param event the updated value
     * @param type the component id by type
     *             Options: cc_id, iteration_id
     */
    const updateComponentIdByType = (event, type) => {
        const { value } = props
        const updatedValue = event.target.value;
        const ccID = type === "cc_id" ? updatedValue : value.cc_id;
        const iterationID = type === "cc_id" ? value.iteration_id : updatedValue
        const xmlID = getComponentXmlID(ccID, iterationID, false, false);
        const itemMap = {
            [type]:  (type === "cc_id" ? ccID : iterationID),
            xml_id: xmlID
        }

        // Update id by type
        updateComponentItems(itemMap, true)
    }
    const updateXmlID = (xmlID) => {
        const itemMap = {
            xml_id: xmlID
        }

        // Update xmlID
        updateComponentItems(itemMap, true)
    }
    /**
     * Updates the checkbox by type
     * @param event the checked event
     * @param title the checkbox title
     *              Options: Optional, Objective, Invisible, Management Functions
     */
    const updateCheckboxByTitle = (event, title) => {
        const checked = event.target.checked

        // Updates the Optional, Objective and Invisible checkboxes
        if (title !== "Management Functions") {
            const type = title.toLowerCase();
            let itemMap = {
                [type]: checked
            }

            // Update itemMap values by type if the checkbox is checked
            if (checked) {
                switch (type) {
                    case "optional": case "objective": {
                        const reversedValue = type === "optional" ? "objective" : "optional"
                        itemMap = {
                            ...itemMap,
                            [reversedValue]: false,
                            invisible: false
                        };
                        break;
                    } case "invisible": {
                        itemMap = {
                            ...itemMap,
                            optional: false,
                            objective: false,
                            selectionBased: false,
                            selections: {},
                            useCaseBased: false,
                            useCases: [],
                            implementationDependent: false,
                            reasons: [],
                        };
                        break;
                    }
                }
            }

            // Update the checkbox values
            updateComponentItems(itemMap)
        } else {
            // Updates the management function checkbox
            if (!checked) {
                setOpenManagementFunctionModal(true)
            } else {
                const itemMap = {
                    isManagementFunction: checked,
                    managementFunctions: {
                        id: "fmt_smf",
                        tableName: "Management Functions",
                        statusMarkers: "",
                        rows: [],
                        columns: []
                    }
                }

                // Updates the management function checkbox values
                const elementUUID = generateElementMaps(props).elementNameMap[selectedSfrElement]
                updateSfrSectionElement(elementUUID, props.uuid, itemMap)
            }
        }
    }
    const updateSelectionBasedToggle = (event) => {
        if (!props.value.invisible) {
            const selectionBased = event.target.checked
            const itemMap = selectionBased ? { selectionBased: selectionBased } : {}

            // Update selection based toggle
            updateComponentItems(itemMap)
        }
    }
    const handleOpenManagementFunctionConfirmationMenu = () => {
        setOpenManagementFunctionModal(!openManagementFunctionModal)
    }
    const handleSubmitManagementFunctionConfirmationMenu = () => {
        // Set default management function values
        let itemMap = {
            isManagementFunction: false,
            managementFunctions: {}
        }
        let elementUUID = generateElementMaps(props).elementNameMap[selectedSfrElement]
        updateSfrSectionElement(elementUUID, props.uuid, itemMap)

        // Close the Modal
        handleOpenManagementFunctionConfirmationMenu()

        // Update snackbar
        handleSnackBarSuccess("Management Function Data Successfully Reset to Default Values")
    }
    const updateSelectionBasedSelections = (title, selections) => {
        let itemMap = {selections: deepCopy(props.value.selections)}
        if (!itemMap.selections.hasOwnProperty("components")) {
            itemMap.selections.components = []
        }
        if (!itemMap.selections.hasOwnProperty("elements")) {
            itemMap.selections.elements = []
        }
        if (!itemMap.selections.hasOwnProperty("selections")) {
            itemMap.selections.selections = []
        }

        // Get selections by type
        if (title.toLowerCase() === "components") {
            itemMap.selections.components = getSelectionBasedArrayByType(selections, "components", "uuid")
        } else if (title.toLowerCase() === "elements") {
            itemMap.selections.elements = getSelectionBasedArrayByType(selections, "elements", "uuid")

            // Clear out selections if elements is empty
            if (itemMap.selections.elements.length === 0 && itemMap.selections.selections.length > 0) {
                itemMap.selections.selections = []
            }
            // Update selections to remove if the associated element(s) is no longer selected
            else if (itemMap.selections.elements.length > 0 && itemMap.selections.selections.length > 0) {
                let elementSelections = props.allSfrOptions.elementSelections;
                let includedSelectables = []
                let currentSelections = deepCopy(itemMap.selections.selections)
                itemMap.selections.elements.map((uuid) => {
                    if (elementSelections.hasOwnProperty(uuid)) {
                        let selectables = elementSelections[uuid]
                        if (selectables.length > 0 && currentSelections.length > 0) {
                            currentSelections.map((selection) => {
                                if (selectables.includes(selection) && !includedSelectables.includes(selection)) {
                                    includedSelectables.push(selection)
                                }
                            })
                        }
                    }
                })
                itemMap.selections.selections = includedSelectables
            }
        } else if (title.toLowerCase() === "selections") {
            itemMap.selections.selections = getSelectionBasedArrayByType(selections, "selections", "uuid")
        }

        // Update selection based selections
        updateComponentItems(itemMap)
    }
    const updateUseCaseBasedToggle = (event) => {
        if (!props.value.invisible) {
            const useCaseBased = event.target.checked
            let itemMap = {
                useCaseBased: useCaseBased
            }

            // Set use cases to an empty array if not checked
            if (!useCaseBased) {
                itemMap.useCases = []
            }

            // Update use case based toggle
            updateComponentItems(itemMap)
        }
    }
    const updateUseCaseBasedSelections = (title, selections) => {
        const useCaseSelections = getSelectionBasedArrayByType(selections, title, "uuid")
        const itemMap = {
            useCases: useCaseSelections
        }

        // Update use case based selections
        updateComponentItems(itemMap)
    }
    const updateImplementationDependentToggle = (event) => {
        if (!props.value.invisible) {
            const implementationDependent = event.target.checked
            let itemMap = {
                implementationDependent: implementationDependent
            }
            if (!implementationDependent) {
                itemMap.reasons = []
            }

            // Update implementation dependent toggle
            updateComponentItems(itemMap)
        }
    }
    const updateExtendedDefinitionToggle = (event, extendedComponentDefinition) => {
        extendedComponentDefinition.toggle = event.target.checked

        // Clear out audit and managementFunction if toggle was set to false
        if (!extendedComponentDefinition.toggle) {
            extendedComponentDefinition.audit = ""
            extendedComponentDefinition.managementFunction = ""
            extendedComponentDefinition.componentLeveling = ""
            extendedComponentDefinition.dependencies = ""
        }

        // Update extended component definition
        const itemMap = {
            extendedComponentDefinition: extendedComponentDefinition
        }
        updateComponentItems(itemMap)
    }
    /**
     * Handles text updates by type
     * @param event the text event
     * @param type the current type
     *             Options: audit, managementFunction, componentLeveling, dependencies
     */
    const handleTextUpdateByType = (event, type) => {
        const { value } = props
        let extendedComponentDefinition =
            value.hasOwnProperty("extendedComponentDefinition")
                ?
            deepCopy(value.extendedComponentDefinition)
                :
            {
                toggle: true,
                audit: "",
                managementFunction: "",
                componentLeveling: "",
                dependencies: ""
            }

        // Check if the type exists and
        if (JSON.stringify(extendedComponentDefinition[type]) !== JSON.stringify(event)) {
            extendedComponentDefinition[type] = event

            // Update extended component definition
            const itemMap = {
                extendedComponentDefinition: extendedComponentDefinition
            }
            updateComponentItems(itemMap)
        }
    }
    const handleSelectedElement = (event) => {
        setSelectedSfrElement(event.target.value)
    }
    const handleSetOpenSfrElement = () => {
        setOpenSfrElement(!openSfrElement)
    }
    const handleCreateNewElement = () => {
        dispatch(CREATE_SFR_SECTION_ELEMENT({sfrUUID: props.sfrUUID, sectionUUID: props.uuid}))
    }
    const handleDeleteElement = (currentElement) => {
        let elementUUID = generateElementMaps(props).elementNameMap[currentElement]
        if (currentElement && currentElement !== "" && elementUUID) {
            dispatch(DELETE_SFR_SECTION_ELEMENT({sfrUUID: props.sfrUUID, sectionUUID: props.uuid, elementUUID: elementUUID}))
            setSelectedSfrElement('')
            clearEvaluationActivityStorage();

            // Update snackbar
            handleSnackBarSuccess("SFR Element Successfully Removed")
        }
    }
    const handleUpdateElementXmlId = (event) => {
        const xmlId = event.target.value

        // Replace spaces with hyphens and convert to lowercase
        const formattedValue = getFormattedXmlID(xmlId)

        // Update elementXMLID
        const itemMap = {
            elementXMLID: formattedValue
        }

        // Update sfr section element
        const elementUUID = getElementValuesByType("uuid")

        if (elementUUID) {
            updateSfrSectionElement(elementUUID, props.uuid, itemMap)
        }
    };

    // Helper Methods
    const updateApplicationNote = (event) => {
        let itemMap = {note: event}
        let elementUUID = generateElementMaps(props).elementNameMap[selectedSfrElement]
        updateSfrSectionElement(elementUUID, props.uuid, itemMap)
    }
    const updateSfrSectionElement = (elementUUID, componentUUID, itemMap) => {
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: componentUUID,
            elementUUID: elementUUID,
            itemMap: itemMap
        }))
    }
    const updateComponentItems = (itemMap, resetValues) => {
        const { sfrUUID, uuid } = props

        // Updates the sfr component items
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({
            sfrUUID: sfrUUID,
            uuid: uuid,
            itemMap: itemMap
        }))

        // Resets the selected sfr and evaluation activity storage
        if (resetValues) {
            setSelectedSfrElement("")
            clearEvaluationActivityStorage();
        }
    }
    const generateElementMaps = (props) => {
        let { uuid, value: component } = props
        return deepCopy(getElementMaps(uuid, component))
    }
    const clearEvaluationActivityStorage = () => {
        dispatch(RESET_EVALUATION_ACTIVITY_UI())
    }
    const getElementValuesByType = (type, key) => {
        let elementMaps = generateElementMaps(props)
        if (elementMaps && elementMaps.elementNames && elementMaps.elementNames.length > 0 &&
            elementMaps.elementNames.includes(selectedSfrElement)) {
            let elementUUID = elementMaps.elementNameMap[selectedSfrElement]
            let element = deepCopy(props.value.elements)[elementUUID]
            switch (type) {
                case "note": case "title": case "elementXMLID": {
                    return element.hasOwnProperty(type) ? element[type] : ""
                }
                case "isManagementFunction": {
                    return element.hasOwnProperty(type) ? element[type] : false
                }
                case "managementFunctions": {
                    return element.hasOwnProperty(type) ? element[type] : {}
                }
                case "managementTextArray": {
                    return element.hasOwnProperty(type) && element[type].hasOwnProperty("rows") && element[type].rows[key]
                           && element[type].rows[key].hasOwnProperty("textArray")  ?
                           element[type].rows[key].textArray : []
                }
                case "tabularize": {
                    if (key) {
                        return element.hasOwnProperty("tabularize") && element["tabularize"].hasOwnProperty(key) ? element["tabularize"][key] : {}
                    } else {
                        return element.hasOwnProperty("tabularize") ? element["tabularize"] : {}
                    }
                }
                case "tabularizeUUIDs": {
                    return element.hasOwnProperty("tabularize") ? Object.keys(element["tabularize"]) : []
                }
                case "element": {
                    return element
                } case "uuid": {
                    return elementUUID
                } case "selectables": {
                    return element.selectables[key]
                } case "selectableGroups": {
                    return element.selectableGroups[key]
                } default: break;
            }
        }
    }
    const getSelectionBasedArrayByType = (selections, selectionType, returnType) => {
        let selectionsArray = []
        selections?.map((value, index) => {
           let selection;
            switch(selectionType) {
                case "components": {
                    selection = (returnType === "uuid" ? props.allSfrOptions.nameMap.components[value] : props.allSfrOptions.uuidMap.components[value])
                    break;
                } case "elements": {
                    selection = (returnType === "uuid" ? props.allSfrOptions.nameMap.elements[value] : props.allSfrOptions.uuidMap.elements[value])
                    break;
                } case "selections": {
                    selection = (returnType === "uuid" ? props.allSfrOptions.nameMap.selections[value] : props.allSfrOptions.uuidMap.selections[value])
                    break;
                } case "Use Cases": {
                    if (props.allSfrOptions.useCaseUUID !== null) {
                        selection = (returnType === "uuid" ? props.allSfrOptions.nameMap.useCases[value] : props.allSfrOptions.uuidMap.useCases[value])
                    }
                    break;
                } default: break;
            }

            // Push to name array
            if (selection && (typeof selection === "string") && !selectionsArray.includes(selection)) {
                selectionsArray[index] = selection
            }
        })
        // Sort the array and return
        return selectionsArray
    }

    // Components
    const getSelectionBasedToggle = () => {
        let componentOptions = deepCopy(props.allSfrOptions.dropdownOptions.components)
        let currentComponentName = props.value.cc_id
        let index = componentOptions.indexOf(currentComponentName)
        if (index !== -1) {
            componentOptions.splice(index, 1)
        }
        let elementOptions = props.allSfrOptions.dropdownOptions.elements
        let currentlySelected = deepCopy(props.value.selections)
        let selectedComponents = getSelectionBasedArrayByType(currentlySelected.components, "components", "name")
        let selectedElements = getSelectionBasedArrayByType(currentlySelected.elements, "elements", "name")
        let selectedElementsWithUUID = getSelectionBasedArrayByType(selectedElements, "elements", "uuid")
        let selectionOptions = []
        if (selectedElementsWithUUID.length > 0) {
            selectedElementsWithUUID.map((uuid) => {
                let options = props.allSfrOptions.elementSelections[uuid]
                if (options && options.length > 0) {
                    let values = getSelectionBasedArrayByType(options, "selections", "name")
                    if (values && values.length > 0) {
                        values.map((value) => {
                            if (!selectionOptions.includes(value)) {
                                selectionOptions.push(value)
                            }
                        })
                    }
                }
            })
        }

        let selectedSelections = getSelectionBasedArrayByType(currentlySelected.selections, "selections", "name")
        const isToggled = props.value.selectionBased;
        const title = "Selection Based";
        const tooltipID = "selectionBasedToggleTooltip";
        const tooltip = "Selecting this indicates that this SFR is dependent on a selection elsewhere in the document.";
        const updateToggleMethod = updateSelectionBasedToggle;
        let toggle = getToggleSwitch(title, isToggled, tooltipID, tooltip, updateToggleMethod)

        if (!isToggled) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <CardTemplate type={"section"}
                             header={
                                 <div className="my-[-6px]">
                                     {toggle}
                                 </div>
                             }
                             body={
                                 <div className="pt-1 px-1">
                                     <div className="pb-4">
                                         <MultiSelectDropdown selectionOptions={componentOptions} selections={selectedComponents}
                                                              title={"Components"} handleSelections={updateSelectionBasedSelections}/>
                                     </div>
                                     <div className="pb-4">
                                         <MultiSelectDropdown selectionOptions={elementOptions} selections={selectedElements}
                                                              title={"Elements"} handleSelections={updateSelectionBasedSelections}/>
                                     </div>
                                     <div className="pb-3">
                                         <MultiSelectDropdown selectionOptions={selectionOptions} selections={selectedSelections}
                                                              title={"Selections"} handleSelections={updateSelectionBasedSelections}/>
                                     </div>
                                 </div>
                             }
                    />
                </div>

            )
        }
    }
    const getUseCaseBasedToggle = () => {
        let selectionOptions = props.allSfrOptions.dropdownOptions.useCases
        let currentUseCases = deepCopy(props.value.useCases)
        let selectedUseCases = getSelectionBasedArrayByType(currentUseCases, "Use Cases", "name")
        const isToggled = props.value.useCaseBased;
        const title = "Use Case Based";
        const tooltipID = "useCasedBasedToggleTooltip";
        const tooltip = "Selecting this indicates that this SFR is dependent on a Use Case defined in the Use Case section.";
        const updateToggleMethod = updateUseCaseBasedToggle;
        let toggle = getToggleSwitch(title, isToggled, tooltipID, tooltip, updateToggleMethod)

        if (!isToggled) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <CardTemplate type={"section"}
                             header={
                                 <div className="my-[-6px]">
                                     {toggle}
                                 </div>
                             }
                             body={
                                 <div className="pt-1 pb-3 px-1" key={`${props.uuid}-use-case-based}`}>
                                     <MultiSelectDropdown selectionOptions={selectionOptions} selections={selectedUseCases}
                                                          title={"Use Cases"} handleSelections={updateUseCaseBasedSelections}/>
                                 </div>
                             }
                    />
                </div>
            )
        }
    }
    const getImplementationDependentToggle = () => {
        let reasons = props.value.reasons ? deepCopy(props.value.reasons) : []
        const isToggled = props.value.implementationDependent;
        const title = "Implementation Dependent";
        const tooltipID = "implementationDependentToggleTooltip";
        const tooltip = "Selecting this indicates that this SFR is dependent on a feature defined elsewhere in the document.";
        const updateToggleMethod = updateImplementationDependentToggle;
        let toggle = getToggleSwitch(title, isToggled, tooltipID, tooltip, updateToggleMethod)

        if (!isToggled) {
            return toggle
        } else {
            return (
                <ImplementationDependent
                    sfrUUID={props.sfrUUID}
                    uuid={props.uuid}
                    reasons={reasons}
                    toggle={toggle}
                />
            )
        }
    }
    const getExtendedComponentEditorByType = (value, type, title) => {
        return (
            <CardTemplate
                className="border-gray-300"
                type={"section"}
                header={
                    <label className="resize-none font-bold text-[12px] p-0 pr-4 text-accent">
                        {`${title} Extended Component Description`}
                    </label>
                }
                body={
                    <TipTapEditor
                        className="w-full"
                        title={type}
                        contentType={"term"}
                        handleTextUpdate={handleTextUpdateByType}
                        text={value}
                    />
                }
            />
        )
    }
    const getExtendedComponentDefinitionToggle = () => {
        // Define default values for extendedComponentDefinition
        const defaultValues = deepCopy(props.value.extendedComponentDefinition)
        const extendedComponentDefinition = {
            toggle: defaultValues.hasOwnProperty("toggle") ? defaultValues.toggle : false,
            audit: defaultValues.hasOwnProperty("audit") ? defaultValues.audit : "",
            managementFunction: defaultValues.hasOwnProperty("managementFunction") ? defaultValues.managementFunction : "",
            componentLeveling: defaultValues.hasOwnProperty("componentLeveling") ? defaultValues.componentLeveling : "",
            dependencies: defaultValues.hasOwnProperty("dependencies") ? defaultValues.dependencies : "",
        };
        const { componentLeveling, managementFunction, audit, dependencies, toggle: isToggled } = extendedComponentDefinition;
        const title = "Extended Component Definition";
        const tooltipID = "extendedComponentDefinitionToggleTooltip";
        const tooltip =
            `Selecting this indicates that this SFR is an extension of an SFR defined in the Common Criteria, and may 
             therefore implement Component Leveling, SFR-specific Management Functions, Audit events, and Dependencies.`;
        const updateToggleMethod = updateExtendedDefinitionToggle
        let toggle = getToggleSwitch(title, isToggled, tooltipID, tooltip, updateToggleMethod, extendedComponentDefinition)

        if (!isToggled) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <CardTemplate
                        type={"section"}
                        header={
                          <div className="my-[-6px]">
                              {toggle}
                          </div>
                        }
                        body={
                            <div className="p-0 m-0 py-[6px] w-full" key={`${props.uuid}-extended-component-definition}`}>
                                <div className="mt-[-8px] mx-[-10px] pb-[6px]">
                                    {getExtendedComponentEditorByType(componentLeveling, "componentLeveling", "Component Leveling")}
                                </div>
                                <div className="mx-[-10px]">
                                    {getExtendedComponentEditorByType(managementFunction, "managementFunction", "Management Function")}
                                </div>
                                <div className="mx-[-10px]">
                                    {getExtendedComponentEditorByType(audit, "audit", "Audit")}
                                </div>
                                <div className="mx-[-10px]">
                                    {getExtendedComponentEditorByType(dependencies, "dependencies", "Dependencies")}
                                </div>
                            </div>
                        }
                    />
                </div>
            )
        }
    }
    const getCheckBox = (title, isChecked, tooltipID, tooltip, isDisabled) => {
        const typographyStyle = {fontSize: 13, paddingLeft: 0.5, paddingTop: 0.1}
        const checkboxStyle = title === "Management Functions" ? checkboxSecondaryNoPad : checkboxPrimaryNoPad

        // Update text color if disabled
        if (isDisabled) {
            typographyStyle.color = textFieldBorder;
        }

        // Return Method
        return (
            <div style={grayTitle}>
                <Box
                    display="flex"
                    alignItems={"center"}
                >
                    <Tooltip
                        id={tooltipID}
                        title={tooltip}
                        arrow
                    >
                        <Checkbox
                            disabled={isDisabled ? true : false}
                            onChange={(event) => {
                                updateCheckboxByTitle(event, title)
                            }}
                            checked={isChecked}
                            sx={checkboxStyle}
                            size="small"
                        />
                    </Tooltip>
                    <Typography sx={typographyStyle}>
                        {title}
                    </Typography>
                </Box>
            </div>
        )
    }
    const getToggleSwitch = (title, isToggled, tooltipID, tooltip, updateToggleMethod, extendedComponentDefinition) => {
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
       )
    }
    const getSfrEvaluationActivity = () => {
        let elementMaps = generateElementMaps(props)
        return (
            <SfrEvaluationActivity sfrUUID={props.sfrUUID}
                                   componentUUID={props.uuid}
                                   elementMaps={elementMaps}/>
        )
    }
    const getSelectablesMaps = (element) => {
        let selectablesMap = {
            dropdownOptions: {assignments: [], complexSelectables: [], groups: [], selectables: []},
            nameMap: {assignments: {}, selectables: {}},
            uuidMap: {assignments: {}, selectables: {}},
        }
        try {
            let currentElement = (element !== undefined) ? deepCopy(element) : deepCopy(getElementValuesByType("element"))
            // Get selectable and assignment data
            Object.entries(currentElement.selectables).map(([selectableUUID, selectable]) => {
                let selectableName = selectable.id ? (`${selectable.description} (${selectable.id})`) : selectable.description
                let isAssignment = selectable.assignment ? true : false
                if (isAssignment) {
                    if (!selectablesMap.dropdownOptions.assignments.includes(selectableName)) {
                        selectablesMap.dropdownOptions.assignments.push(selectableName)
                        selectablesMap.nameMap.assignments[selectableName] = selectableUUID
                        selectablesMap.uuidMap.assignments[selectableUUID] = selectableName
                    }
                } else {
                    if (!selectablesMap.dropdownOptions.selectables.includes(selectableName)) {
                        selectablesMap.dropdownOptions.selectables.push(selectableName)
                        selectablesMap.nameMap.selectables[selectableName] = selectableUUID
                        selectablesMap.uuidMap.selectables[selectableUUID] = selectableName
                    }
                }
            })

            // Get selectable and assignment data
            Object.entries(currentElement.selectableGroups).map(([group, value]) => {
                if (value.hasOwnProperty("groups")) {
                    if (!selectablesMap.dropdownOptions.groups.includes(group)) {
                        selectablesMap.dropdownOptions.groups.push(group)
                    }
                } else if (value.hasOwnProperty("description")) {
                    if (!selectablesMap.dropdownOptions.complexSelectables.includes(group)) {
                        selectablesMap.dropdownOptions.complexSelectables.push(group)
                    }
                }
            })

            // Sort drop down menu options
            selectablesMap.dropdownOptions.selectables.sort()
            selectablesMap.dropdownOptions.assignments.sort()
            selectablesMap.dropdownOptions.groups.sort()
            selectablesMap.dropdownOptions.complexSelectables.sort()
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
        return selectablesMap
    }

    // Return Method
    return (
        <div className="w-screen">
            <Modal
                title={"SFR Worksheet"}
                content={(
                    <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                        <CardTemplate
                            type={"parent"}
                            title={"SFR Component"}
                            tooltip={"SFR Component"}
                            collapse={openSfrComponent}
                            collapseHandler={handleSetOpenSfrComponent}
                            body={
                                <div className="min-w-full mt-4 justify-items-left grid grid-flow-row auto-rows-max">
                                    <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4">
                                        <FormControl fullWidth>
                                            <Tooltip
                                                arrow
                                                id={"ccIDTooltip"}
                                                title={`Full ID of the SFR Component. Should follow the following format: 
                                                        (3 letter Family)_(3 Letter Class)_(Optional EXT).(Number representing 
                                                        the component)`}
                                            >
                                                <TextField
                                                    key={props.value.cc_id}
                                                    label="CC-ID"
                                                    onBlur={(event) => handleSnackbarTextUpdates(updateComponentIdByType, event, "cc_id")}
                                                    defaultValue={props.value.cc_id}
                                                />
                                            </Tooltip>
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <Tooltip
                                                arrow
                                                title={"Full name of the component."}
                                                id={"nameTooltip"}
                                            >
                                                <TextField
                                                    key={props.value.title}
                                                    label="Name"
                                                    onBlur={(event) => handleSnackbarTextUpdates(updateComponentTextByType, event, "title")}
                                                    defaultValue={props.value.title}
                                                />
                                            </Tooltip>
                                        </FormControl>
                                    </div>
                                    <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4">
                                        <FormControl fullWidth>
                                            <Tooltip
                                                arrow
                                                title={"Optional iteration abbreviation (Used in ID creation)."}
                                                id={"iterationIDTooltip"}
                                            >
                                                <TextField
                                                    key={props.value.iteration_id}
                                                    label="Iteration ID"
                                                    onBlur={(event) => handleSnackbarTextUpdates(updateComponentIdByType, event, "iteration_id")}
                                                    defaultValue={props.value.iteration_id}
                                                />
                                            </Tooltip>
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <Tooltip
                                                arrow
                                                title={"ID that will be used when the document is translated to XML."}
                                                id={"xmlIDTooltip"}
                                            >
                                                <TextField
                                                    key={props.value.xml_id}
                                                    label="XML ID"
                                                    defaultValue={props.value.xml_id}
                                                />
                                            </Tooltip>
                                        </FormControl>
                                    </div>
                                    <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg p-2 px-4">
                                        <FormControl fullWidth>
                                            <TextField
                                                key={props.value.definition}
                                                label="Description"
                                                onBlur={(event) => handleSnackbarTextUpdates(updateComponentTextByType, event, "definition")}
                                                defaultValue={props.value.definition}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                        <CardTemplate
                                            type={"section"}
                                            header={<label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">Component Selections</label>}
                                            body={
                                                <div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {(() => {
                                                            const title = "Optional";
                                                            const isChecked = props.value.optional;
                                                            const tooltipID = "mainOptionalCheckboxTooltip";
                                                            const tooltip = `Selecting this indicates that this is an optional SFR, and may be claimed in the ST at the discretion of the ST author.`;
                                                            return getCheckBox(title, isChecked, tooltipID, tooltip);
                                                        })()}
                                                    </div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {(() => {
                                                            const title = "Objective";
                                                            const isChecked = props.value.objective;
                                                            const tooltipID = "mainObjectiveCheckboxTooltip";
                                                            const tooltip = `Selecting this requirement indicates that this SFR is not recognized by the common criteria, but NIAP expects it to become a mandatory requirement in the future.`;
                                                            return getCheckBox(title, isChecked, tooltipID, tooltip);
                                                        })()}
                                                    </div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {(() => {
                                                            const title = "Invisible";
                                                            const isChecked = props.value.invisible !== undefined ? props.value.invisible : false;
                                                            const tooltipID = "mainInvisibleCheckboxTooltip";
                                                            const tooltip = (
                                                                <span>
                                                                    {`The "invisible" status is rarely used. It's purpose is to allow 
                                                                     for the declaration of SFRs that should not appear in the PP. 
                                                                     See the wiki for more examples: `}
                                                                    <a
                                                                        href="https://github.com/commoncriteria/pp-template/wiki/Components#component-declaration"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ textDecoration: 'underline' }}
                                                                    >
                                                                        Component Declaration Wiki
                                                                    </a>
                                                                    .
                                                                    <br/>
                                                                    <br/>
                                                                    * Note: This box can only be selected with Extended Component Definition.
                                                                </span>
                                                            )
                                                            return getCheckBox(title, isChecked, tooltipID, tooltip);
                                                        })()}
                                                    </div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {getSelectionBasedToggle()}
                                                    </div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {getUseCaseBasedToggle()}
                                                    </div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {getImplementationDependentToggle()}
                                                    </div>
                                                    <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                        {getExtendedComponentDefinitionToggle()}
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                            <SfrAuditEvents
                                                sfrUUID={props.sfrUUID}
                                                uuid={props.uuid}
                                                value={props.value}
                                            />
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                        <CardTemplate
                            type={"parent"}
                            title={"SFR Element"}
                            tooltip={"SFR Element"}
                            collapse={openSfrElement} collapseHandler={handleSetOpenSfrElement}
                            body={
                                <div className="min-w-full mt-4 grid grid-flow-row auto-rows-max">
                                    <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-3 gap-4 p-2 px-4">
                                        <FormControl fullWidth>
                                            <Tooltip
                                                id={"selectElementTooltip"}
                                                title={"This dropdown list allows a user to select between any " +
                                                    "of the previously created SFR elements attached to this component. " +
                                                    "New elements can be created by clicking the green \"plus\" symbol " +
                                                    "at the bottom of this section."} arrow>
                                                <InputLabel key="element-select-label">Select Element</InputLabel>
                                            </Tooltip>
                                            <Select
                                                value={selectedSfrElement}
                                                label="Select Element"
                                                autoWidth
                                                onChange={handleSelectedElement}
                                                sx = {{textAlign: "left"}}
                                            >
                                                {generateElementMaps(props).elementNames?.map((name, index) => {
                                                    return(
                                                        <MenuItem key={index} value={name}>{name}</MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        </FormControl>
                                        { selectedSfrElement && selectedSfrElement !== "" &&
                                            <span className="flex justify-stretch min-w-full">
                                                <div className="flex justify-center w-full">
                                                    <div className="w-full pr-4">
                                                        <FormControl fullWidth>
                                                            <Tooltip
                                                                id={"elementXmlIdTooltip"}
                                                                title={`Every <f-element> must have an id attribute that is unique to the document.`}
                                                                arrow
                                                            >
                                                                <TextField
                                                                    className="w-full"
                                                                    key={`${props.uuid}-element-xml-id`}
                                                                    label="XML ID"
                                                                    value={elementXmlId}
                                                                    onBlur={(event) => {
                                                                        handleSnackbarTextUpdates(handleUpdateElementXmlId, event)
                                                                    }}
                                                                    onChange={(event) => {
                                                                        const xmlId = event.target.value

                                                                        if (xmlId || xmlId === "") {
                                                                            setElementXmlId(getFormattedXmlID(xmlId))
                                                                        }
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </FormControl>
                                                    </div>
                                                    <div className="w-full pr-2">
                                                        <Tooltip
                                                            id={"componentIDTooltip"}
                                                            title={`This is an automatically generated ID that is defined by the component id and the number of the element added.`}
                                                            arrow
                                                        >
                                                            <TextField
                                                                className="w-full"
                                                                key={`${props.uuid}-component-id`}
                                                                label="Component ID"
                                                                disabled={true}
                                                                defaultValue={(generateElementMaps(props).componentName)}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                    <div className={`w-[80%] ml-2 pr-2 pt-1 border-[1px] border-[#bdbdbd] rounded-[4px]`}>
                                                        {(() => {
                                                            const title = "Management Functions";
                                                            const isChecked = getElementValuesByType("isManagementFunction");
                                                            const tooltipID = "managementFunctionCheckbox";
                                                            const tooltip = "Select if this SFR Element contains a Management Function Table";
                                                            const isDisabled = selectedSfrElement.toLowerCase().includes("fmt") ? false : true;
                                                            return getCheckBox(title, isChecked, tooltipID, tooltip, isDisabled);
                                                        })()}
                                                    </div>
                                                    <IconButton
                                                        onClick={() => {
                                                            handleDeleteElement(selectedSfrElement)
                                                        }}
                                                        variant="contained"
                                                    >
                                                        <Tooltip
                                                            title={`Delete Element`}
                                                            id={"deleteElementTooltip"}
                                                        >
                                                            <DeleteForeverRoundedIcon
                                                                htmlColor={secondary}
                                                                sx={icons.large}
                                                            />
                                                        </Tooltip>
                                                    </IconButton>
                                                </div>
                                            </span>
                                        }
                                    </div>
                                    { selectedSfrElement && selectedSfrElement !== "" &&
                                        <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                            <SfrRequirements
                                                requirementType={"title"}
                                                sfrUUID={props.sfrUUID}
                                                componentUUID={props.uuid}
                                                component={props.value}
                                                elementUUID={getElementValuesByType("uuid")}
                                                elementTitle={selectedSfrElement}
                                                getSelectablesMaps={getSelectablesMaps}
                                                getElementValuesByType={getElementValuesByType}
                                                getSelectionBasedArrayByType={getSelectionBasedArrayByType}
                                                updateSfrSectionElement={updateSfrSectionElement}
                                            />
                                            { getElementValuesByType("isManagementFunction") &&
                                                <ManagementFunctionTable
                                                    sfrUUID={props.sfrUUID}
                                                    componentUUID={props.uuid}
                                                    component={props.value}
                                                    elementUUID={getElementValuesByType("uuid")}
                                                    elementTitle={selectedSfrElement}
                                                    getSelectablesMaps={getSelectablesMaps}
                                                    getElementValuesByType={getElementValuesByType}
                                                    getSelectionBasedArrayByType={getSelectionBasedArrayByType}
                                                    managementFunctions={getElementValuesByType("managementFunctions")}
                                                    updateSfrSectionElement={updateSfrSectionElement}
                                                />
                                            }
                                            <ApplicationNote
                                                isManagementFunction={false}
                                                updateApplicationNote={updateApplicationNote}
                                                getElementValuesByType={getElementValuesByType}
                                            />
                                        </div>
                                    }
                                </div>
                            }
                            footer={
                                <div className="w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white" key={props.uuid + "-NewFormItem"}>
                                    <IconButton
                                        key={props.uuid + "-CreateNewElement"}
                                        onClick={handleCreateNewElement}
                                        variant="contained"
                                    >
                                        <Tooltip
                                            title={"Create New Element"}
                                            id={"createNewElementTooltip"}
                                        >
                                            <AddCircleRoundedIcon
                                                htmlColor={ primary }
                                                sx={ icons.medium }
                                            />
                                        </Tooltip>
                                    </IconButton>
                                </div>
                            }
                        />
                        {getSfrEvaluationActivity()}
                    </div>
                )}
                open={props.open}
                handleOpen={props.handleOpen}
                hideSubmit={true}
            />
            <ResetDataConfirmation
                title={"Reset Management Functions Data Confirmation"}
                text={"Are you sure you want to reset all Management Functions data to its initial state?"}
                open={openManagementFunctionModal}
                handleOpen={handleOpenManagementFunctionConfirmationMenu}
                handleSubmit={handleSubmitManagementFunctionConfirmationMenu}
            />
        </div>
    );
}

// Export SfrWorksheet.jsx
export default SfrWorksheet;