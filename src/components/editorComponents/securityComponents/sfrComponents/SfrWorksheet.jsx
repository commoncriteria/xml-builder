// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Switch, TextField, Tooltip, Typography } from "@mui/material";
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
import TextEditor from "../../TextEditor.jsx";
import ManagementFunctionTable from "./requirements/ManagementFunctionTable.jsx";
import ResetDataConfirmation from "../../../modalComponents/ResetDataConfirmation.jsx";
import ApplicationNote from "./ApplicationNote.jsx";

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
    const dispatch = useDispatch();
    const { textFieldBorder, secondary, primary, grayTitle, checkboxPrimaryNoPad, checkboxSecondaryNoPad, primaryToggleSwitch, icons } = useSelector((state) => state.styling);
    const [openSfrComponent, setOpenSfrComponent] = useState(true)
    const [openSfrElement, setOpenSfrElement] = useState(true)
    const [openManagementFunctionModal, setOpenManagementFunctionModal] = useState(false)
    const [selectedSfrElement, setSelectedSfrElement] = useState('')
    const [currentElements, setCurrentElements] = useState({})

    // Use Effects
    useEffect(() => {
        let elementValues = JSON.parse(JSON.stringify(props.value.elements))
        if (elementValues !== JSON.parse(JSON.stringify(currentElements))) {
            setCurrentElements(elementValues)
        }
        let xmlID = props.value.xml_id
        if (xmlID === "") {
            let updatedXmlID = getXmlID(props.value.cc_id, props.value.iteration_id)
            updateXmlID(updatedXmlID)
        }
    }, [props]);
    useEffect(() => {
        let maps = JSON.parse(JSON.stringify(getElementMaps()))
        if (maps && maps.elementNames && Object.keys(maps.elementNames).length > 0 && selectedSfrElement === '') {
            setSelectedSfrElement(maps.elementNames[0])
        }
    }, [currentElements])

    // Methods
    const handleSetOpenSfrComponent = () => {
        setOpenSfrComponent(!openSfrComponent)
    }
    const updateTitle = (event) => {
        let title = event.target.value
        let itemMap = {title: title}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateDefinition = (event) => {
        let itemMap = {definition: event.target.value}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateCcID = (event) => {
        let ccID = event.target.value;
        let xmlID = getXmlID(ccID, props.value.iteration_id);
        let itemMap = {cc_id: ccID, xml_id:  xmlID}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        setSelectedSfrElement("")
        clearEvaluationActivityStorage();
    }
    const updateIterationID = (event) => {
        let iterationID = event.target.value;
        let xmlID = getXmlID(props.value.cc_id, iterationID);
        let itemMap = {iteration_id: iterationID, xml_id:  xmlID}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        setSelectedSfrElement("")
        clearEvaluationActivityStorage();
    }
    const updateXmlID = (xmlID) => {
        let itemMap = {xml_id: xmlID}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        setSelectedSfrElement("")
        clearEvaluationActivityStorage();
    }
    const updateOptionalCheckbox = (event) => {
        const optional = event.target.checked
        let itemMap = {
            optional: optional
        }
        if (optional) {
            itemMap.objective = false
            itemMap.invisible = false
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateObjectiveCheckbox = (event) => {
        const objective = event.target.checked
        let itemMap = {
            objective: objective
        }

        if (objective) {
            itemMap.optional = false
            itemMap.invisible = false
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateInvisibleCheckbox = (event) => {
        const invisible = event.target.checked
        let itemMap = {
            invisible: invisible
        }

        if (invisible) {
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
            }
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateSelectionBasedToggle = (event) => {
        if (!props.value.invisible) {
            let selectionBased = event.target.checked
            let itemMap = {selectionBased: selectionBased}
            if (!selectionBased) {
                itemMap.selections = {}
            }
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
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
        let elementUUID = JSON.parse(JSON.stringify(getElementMaps())).elementNameMap[selectedSfrElement]
        updateSfrSectionElement(elementUUID, props.uuid, itemMap)
        // Close the Modal
        handleOpenManagementFunctionConfirmationMenu()
    }
    const updateManagementFunctionCheckbox = (event) => {
        let isManagementFunction = event.target.checked
        if (!isManagementFunction) {
            setOpenManagementFunctionModal(true)
        } else {
            let itemMap = {
                isManagementFunction: isManagementFunction,
                managementFunctions: {
                    id: "fmt_smf",
                    tableName: "Management Functions",
                    statusMarkers: "",
                    rows: [],
                    columns: []
                }
            }
            let elementUUID = JSON.parse(JSON.stringify(getElementMaps())).elementNameMap[selectedSfrElement]
            updateSfrSectionElement(elementUUID, props.uuid, itemMap)
        }
    }
    const updateSelectionBasedSelections = (title, selections) => {
        let itemMap = {selections: JSON.parse(JSON.stringify(props.value.selections))}
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
                let currentSelections = JSON.parse(JSON.stringify(itemMap.selections.selections))
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
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateUseCaseBasedToggle = (event) => {
        if (!props.value.invisible) {
            let useCaseBased = event.target.checked
            let itemMap = {useCaseBased: useCaseBased}
            if (!useCaseBased) {
                itemMap.useCases = []
            }
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        }
    }
    const updateUseCaseBasedSelections = (title, selections) => {
        let useCaseSelections = getSelectionBasedArrayByType(selections, title, "uuid")
        let itemMap = {useCases: useCaseSelections}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateImplementationDependentToggle = (event) => {
        if (!props.value.invisible) {
            let implementationDependent = event.target.checked
            let itemMap = {implementationDependent: implementationDependent}
            if (!implementationDependent) {
                itemMap.reasons = []
            } else {
                if (props.value.reasons.length === 0) {
                    itemMap.reasons = [""]
                }
            }
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
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
        let itemMap = {extendedComponentDefinition: extendedComponentDefinition}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateReasons = (event, updateType, index) => {
        let currentReasons = JSON.parse(JSON.stringify(props.value.reasons))
        if (updateType === "add") {
            currentReasons.push(event)
        } else if (updateType === "update") {
            currentReasons[index] = event.target.value
        } else if (updateType === "delete") {
            currentReasons.splice(index, 1)
        }
        let itemMap = {reasons: currentReasons}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const handleAuditText = (event) => {
        let extendedComponentDefinition = props.value.hasOwnProperty("extendedComponentDefinition") ?
            JSON.parse(JSON.stringify(props.value.extendedComponentDefinition)) :
            {toggle: true, audit: "", managementFunction: "", componentLeveling: "", dependencies: ""}
        if (JSON.stringify(extendedComponentDefinition.audit) !== JSON.stringify(event)) {
            extendedComponentDefinition.audit = event
            let itemMap = {extendedComponentDefinition: extendedComponentDefinition}
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        }
    }
    const handleManagementFunctionText = (event) => {
        let extendedComponentDefinition = props.value.hasOwnProperty("extendedComponentDefinition") ?
            JSON.parse(JSON.stringify(props.value.extendedComponentDefinition)) :
            {toggle: true, audit: "", managementFunction: "", componentLeveling: "", dependencies: ""}
        if (JSON.stringify(extendedComponentDefinition.managementFunction) !== JSON.stringify(event)) {
            extendedComponentDefinition.managementFunction = event
            let itemMap = {extendedComponentDefinition: extendedComponentDefinition}
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        }
    }
    const handleComponentLevelingText = (event) => {
        let extendedComponentDefinition = props.value.hasOwnProperty("extendedComponentDefinition") ?
            JSON.parse(JSON.stringify(props.value.extendedComponentDefinition)) :
            {toggle: true, audit: "", managementFunction: "", componentLeveling: "", dependencies: ""}
        if (JSON.stringify(extendedComponentDefinition.componentLeveling) !== JSON.stringify(event)) {
            extendedComponentDefinition.componentLeveling = event
            let itemMap = {extendedComponentDefinition: extendedComponentDefinition}
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
        }
    }
    const handleDependenciesText = (event) => {
        let extendedComponentDefinition = props.value.hasOwnProperty("extendedComponentDefinition") ?
            JSON.parse(JSON.stringify(props.value.extendedComponentDefinition)) :
            {toggle: true, audit: "", managementFunction: "", componentLeveling: "", dependencies: ""}
        if (JSON.stringify(extendedComponentDefinition.dependencies) !== JSON.stringify(event)) {
            extendedComponentDefinition.dependencies = event
            let itemMap = {extendedComponentDefinition: extendedComponentDefinition}
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
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
        let elementUUID = JSON.parse(JSON.stringify(getElementMaps())).elementNameMap[currentElement]
        if (currentElement && currentElement !== "" && elementUUID) {
            dispatch(DELETE_SFR_SECTION_ELEMENT({sfrUUID: props.sfrUUID, sectionUUID: props.uuid, elementUUID: elementUUID}))
            setSelectedSfrElement('')
            clearEvaluationActivityStorage();
        }
    }
    const updateApplicationNote = (event) => {
        let itemMap = {note: event}
        let elementUUID = JSON.parse(JSON.stringify(getElementMaps())).elementNameMap[selectedSfrElement]
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

    // Helper Methods
    const clearEvaluationActivityStorage = () => {
        dispatch(RESET_EVALUATION_ACTIVITY_UI())
    }
    const getElementValuesByType = (type, key) => {
        let elementMaps = JSON.parse(JSON.stringify(getElementMaps()))
        if (elementMaps && elementMaps.elementNames && elementMaps.elementNames.length > 0 &&
            elementMaps.elementNames.includes(selectedSfrElement)) {
            let elementUUID = elementMaps.elementNameMap[selectedSfrElement]
            let element = JSON.parse(JSON.stringify(props.value.elements))[elementUUID]
            switch (type) {
                case "note": case "title": {
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
    const getXmlID = (ccID, iterationID) => {
        let title = ccID.valueOf().toLowerCase().replaceAll("_", "-").replaceAll(".", "-")
        if (iterationID && iterationID.length > 0) {
            iterationID = "-" + iterationID.toLowerCase()
            title += iterationID
        }
        return title
    }
    const getElementMaps = () => {
        let elements = JSON.parse(JSON.stringify(props.value.elements))
        let component = JSON.parse(JSON.stringify(props.value))
        let cc_id = component.cc_id
        let iteration_id = component.iteration_id
        let iteration_title =  (iteration_id && typeof iteration_id === "string" && iteration_id !== "") ? ("/" + iteration_id) : ""
        let componentTitle = cc_id + iteration_title
        let elementMap = {
            componentName: componentTitle,
            componentUUID: props.uuid,
            elementNames: [],
            elementNameMap: {},
            elementUUIDMap: {}
        }
        let initialName = props.value.cc_id
        if (elements && Object.entries(elements).length > 0) {
            Object.keys(elements).map((key, index) => {
                let name = `${initialName + "." + (index + 1) + iteration_title}`
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
    const getSelectionBasedToggle = () => {
        let componentOptions = JSON.parse(JSON.stringify(props.allSfrOptions.dropdownOptions.components))
        let currentComponentName = props.value.cc_id
        let index = componentOptions.indexOf(currentComponentName)
        if (index !== -1) {
            componentOptions.splice(index, 1)
        }
        let elementOptions = props.allSfrOptions.dropdownOptions.elements
        let currentlySelected = JSON.parse(JSON.stringify(props.value.selections))
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
        let currentUseCases = JSON.parse(JSON.stringify(props.value.useCases))
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
        let reasons = JSON.parse(JSON.stringify(props.value.reasons))
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
                <div className="mx-[-10px]">
                    <CardTemplate type={"section"}
                             header={
                                 <div className="my-[-6px]">
                                     {toggle}
                                 </div>
                             }
                             body={
                                 <div className="pt-1" key={`${props.uuid}-reasons}`}>
                                     {reasons.map((reason, index) => {
                                         return (
                                             <div className="w-full pb-3 px-1" key={`${props.uuid}-reason-${index + 1}`}>
                                                 <table className="border-0 m-0 pb-2">
                                                     <tbody>
                                                         <tr>
                                                             <td className="p-0 text-center align-center w-full">
                                                                 <FormControl fullWidth color={"primary"}>
                                                                     <TextField label={`Reason ${index + 1}`} defaultValue={reason} key={reason}
                                                                                onBlur={(event) => {updateReasons(event, "update", index)}} />
                                                                 </FormControl>
                                                             </td>
                                                             <td className="p-0 text-center align-middle">
                                                                 <IconButton onClick={() => {updateReasons(null, "delete", index)}}
                                                                             disabled={!!(props.value.reasons && props.value.reasons.length === 1)} variant="contained">
                                                                     <Tooltip title={"Delete Reason"} id={"deleteReasonTooltip" + index}>
                                                                         <DeleteForeverRoundedIcon htmlColor={ secondary } sx={ icons.large }/>
                                                                     </Tooltip>
                                                                 </IconButton>
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                             </div>
                                         )
                                     })}
                                     <div className="border-t-2 mx-[-16px] mt-1">
                                         <IconButton onClick={() => {updateReasons("", "add", null)}} key={"AddReasonButton"} variant="contained">
                                             <Tooltip title={"Add a New Reason"} id={"addNewReasonTooltip"}>
                                                 <AddCircleRoundedIcon htmlColor={ primary } sx={{ ...icons.medium, marginTop: 1 }}/>
                                             </Tooltip>
                                         </IconButton>
                                     </div>
                                 </div>
                             }
                    />
                </div>
            )
        }
    }
    const getExtendedComponentDefinitionToggle = () => {
        let extendedComponentDefinition = props.value.hasOwnProperty("extendedComponentDefinition") ?
            JSON.parse(JSON.stringify(props.value.extendedComponentDefinition)) : {toggle: false, audit: "", managementFunction: ""}
        if (!extendedComponentDefinition.hasOwnProperty("toggle")) {
            extendedComponentDefinition.toggle = false
        }
        if (!extendedComponentDefinition.hasOwnProperty("audit")) {
            extendedComponentDefinition.audit = ""
        }
        if (!extendedComponentDefinition.hasOwnProperty("managementFunction")) {
            extendedComponentDefinition.managementFunction = ""
        }
        if (!extendedComponentDefinition.hasOwnProperty("componentLeveling")) {
            extendedComponentDefinition.componentLeveling = ""
        }
        if (!extendedComponentDefinition.hasOwnProperty("dependencies")) {
            extendedComponentDefinition.dependencies = ""
        }

        const isToggled = extendedComponentDefinition.toggle;
        const title = "Extended Component Definition";
        const tooltipID = "extendedComponentDefinitionToggleTooltip";
        const tooltip = "Selecting this indicates that this SFR is an extension of an SFR defined in the " +
            "Common Criteria, and may therefore implement Component Leveling, SFR-specific Management Functions, " +
            "Audit events, and Dependencies.";
        const updateToggleMethod = updateExtendedDefinitionToggle
        let toggle = getToggleSwitch(title, isToggled, tooltipID, tooltip, updateToggleMethod, extendedComponentDefinition)

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
                                 <div className="p-0 m-0 py-[6px] w-full" key={`${props.uuid}-extended-component-definition}`}>
                                     <div className="mt-[-8px] mx-[-10px] pb-[6px]">
                                         <CardTemplate
                                             className="border-gray-300"
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[12px] p-0 pr-4 text-accent">Component Leveling Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleComponentLevelingText}
                                                             text={extendedComponentDefinition.componentLeveling}
                                                 />
                                             }
                                         />
                                     </div>
                                     <div className="mx-[-10px]">
                                         <CardTemplate
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[12px] p-0 pr-4 text-accent">Management Function Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleManagementFunctionText}
                                                             text={extendedComponentDefinition.managementFunction}
                                                 />
                                             }
                                         />
                                     </div>
                                     <div className="mx-[-10px]">
                                         <CardTemplate
                                             className="border-gray-300"
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[12px] p-0 pr-4 text-accent">Audit Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleAuditText}
                                                             text={extendedComponentDefinition.audit}
                                                 />
                                             }
                                         />
                                     </div>
                                     <div className="mx-[-10px]">
                                         <CardTemplate
                                             className="border-gray-300"
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[12px] p-0 pr-4 text-accent">Dependencies Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleDependenciesText}
                                                             text={extendedComponentDefinition.dependencies}
                                                 />
                                             }
                                         />
                                     </div>
                                 </div>
                             }
                    />
                </div>
            )
        }
    }
    const getCheckBox = (title, isChecked, tooltipID, tooltip, updateCheckboxMethod, isDisabled) => {
        const typographyStyle = {fontSize: 13, paddingLeft: 0.5, paddingTop: 0.1}
        const checkboxStyle = title === "Management Functions" ? checkboxSecondaryNoPad : checkboxPrimaryNoPad

        if (isDisabled) {
            typographyStyle.color = textFieldBorder;
        }

        return (
            <div style={grayTitle}>
                <Box display="flex" alignItems={"center"}>
                    <Tooltip id={tooltipID}
                             title={tooltip}
                             arrow>
                        <Checkbox
                            disabled={isDisabled ? true : false}
                            onChange={updateCheckboxMethod}
                            checked={isChecked}
                            sx={checkboxStyle}
                            size="small"/>
                    </Tooltip>
                    <Typography sx={typographyStyle}>{title}</Typography>
                </Box>
            </div>
        )
    }
    const getToggleSwitch = (title, isToggled, tooltipID, tooltip, updateToggleMethod, extendedComponentDefinition) => {
        let titleStyle = !isToggled? { fontSize: 13, fontWeight: "medium", paddingLeft: 0.5 } : { fontSize: 13, fontWeight: "bold", color: primary, paddingLeft: 0.5 }
        let toggleDivStyle = { paddingX: 1, paddingBottom: "12px", paddingTop: "2px" }
        if (!isToggled) {
            toggleDivStyle.display = "flex"
            toggleDivStyle.justifyContent = "left"
        } else {
            toggleDivStyle.marginBottom = "-16px"
            toggleDivStyle.display = "flex"
            toggleDivStyle.justifyContent = "center"
        }
        return (
            <div style={toggleDivStyle}>
                <Box display="flex" alignItems="center">
                    <Tooltip id={tooltipID} title={tooltip} arrow>
                        <Switch
                            onChange={extendedComponentDefinition ?
                                (event) => (updateToggleMethod(event, extendedComponentDefinition)) :
                                updateToggleMethod}
                            checked={isToggled}
                            sx={isToggled ? primaryToggleSwitch : {}}
                            size="small"
                        />
                    </Tooltip>
                    <Typography sx={titleStyle}>{title}</Typography>
                </Box>
            </div>
        )
    }
    const getSfrEvaluationActivity = () => {
        let elementMaps = JSON.parse(JSON.stringify(getElementMaps()))
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
            let currentElement = (element !== undefined) ? JSON.parse(JSON.stringify(element)) : JSON.parse(JSON.stringify(getElementValuesByType("element")))
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
        }
        return selectablesMap
    }

    // Return Method
    return (
        <div className="w-screen">
            <Modal title={"SFR Worksheet"}
                   content={(
                       <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                           <CardTemplate type={"parent"} title={"SFR Component"} tooltip={"SFR Component"}
                               collapse={openSfrComponent} collapseHandler={handleSetOpenSfrComponent}
                               body={
                                   <div className="min-w-full mt-4 justify-items-left grid grid-flow-row auto-rows-max">
                                       <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4">
                                           <FormControl fullWidth>
                                               <Tooltip arrow id={"ccIDTooltip"}
                                                        title={"Full ID of the SFR Component. Should follow the following format: " +
                                                                "(3 letter Family)_(3 Letter Class)_(Optional EXT).(Number representing the component)"}>
                                                    <TextField key={props.value.cc_id} label="CC-ID" onBlur={updateCcID} defaultValue={props.value.cc_id}/>
                                               </Tooltip>
                                           </FormControl>
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"Full name of the component."} id={"nameTooltip"}>
                                                   <TextField key={props.value.title} label="Name" onBlur={updateTitle} defaultValue={props.value.title}/>
                                               </Tooltip>
                                           </FormControl>
                                       </div>
                                       <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4">
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"Optional iteration abbreviation (Used in ID creation)."} id={"iterationIDTooltip"}>
                                                   <TextField key={props.value.iteration_id} label="Iteration ID" onBlur={updateIterationID} defaultValue={props.value.iteration_id}/>
                                               </Tooltip>
                                           </FormControl>
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"ID that will be used when the document is translated to XML."} id={"xmlIDTooltip"}>
                                                   <TextField key={props.value.xml_id} label="XML ID" defaultValue={props.value.xml_id}/>
                                               </Tooltip>
                                           </FormControl>
                                       </div>
                                       <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg p-2 px-4">
                                           <FormControl fullWidth>
                                               <TextField key={props.value.definition} label="Description" onBlur={updateDefinition} defaultValue={props.value.definition}/>
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
                                                               const tooltip = "Selecting this indicates that this is an optional SFR, " +
                                                                   "and may be claimed in the ST at the discretion of the ST author.";
                                                               const updateMethod = updateOptionalCheckbox;
                                                               return getCheckBox(title, isChecked, tooltipID, tooltip, updateMethod);
                                                           })()}
                                                       </div>
                                                       <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           {(() => {
                                                               const title = "Objective";
                                                               const isChecked = props.value.objective;
                                                               const tooltipID = "mainObjectiveCheckboxTooltip";
                                                               const tooltip = "Selecting this requirement indicates that this " +
                                                                   "SFR is not recognized by the common criteria, but NIAP expects " +
                                                                   "it to become a mandatory requirement in the future.";
                                                               const updateMethod = updateObjectiveCheckbox;
                                                               return getCheckBox(title, isChecked, tooltipID, tooltip, updateMethod);
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
                                                               const updateMethod = updateInvisibleCheckbox;
                                                               return getCheckBox(title, isChecked, tooltipID, tooltip, updateMethod);
                                                           })()}
                                                       </div>
                                                       <div
                                                           className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           {getSelectionBasedToggle()}
                                                       </div>
                                                       <div
                                                           className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           {getUseCaseBasedToggle()}
                                                       </div>
                                                       <div
                                                           className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           {getImplementationDependentToggle()}
                                                       </div>
                                                       <div
                                                           className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           {getExtendedComponentDefinitionToggle()}
                                                       </div>
                                                   </div>
                                               }
                                           />
                                           <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                               <SfrAuditEvents sfrUUID={props.sfrUUID} uuid={props.uuid}
                                                               value={props.value}/>
                                           </div>
                                       </div>
                                   </div>
                               }
                           />
                           <CardTemplate type={"parent"} title={"SFR Element"} tooltip={"SFR Element"}
                                         collapse={openSfrElement} collapseHandler={handleSetOpenSfrElement}
                                         body={
                                             <div className="min-w-full mt-4 grid grid-flow-row auto-rows-max">
                                                 <div
                                                     className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-3 gap-4 p-2 px-4">
                                                 <FormControl fullWidth>
                                                <Tooltip id={"selectElementTooltip"}
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
                                                    {JSON.parse(JSON.stringify(getElementMaps())).elementNames?.map((name, index) => {
                                                        return(
                                                            <MenuItem key={index} value={name}>{name}</MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </FormControl>
                                            {
                                                selectedSfrElement && selectedSfrElement !== "" ?
                                                    <span className="flex justify-stretch min-w-full">
                                                        <div className="flex justify-center w-full">
                                                            <div className="w-full pr-2">
                                                                 <Tooltip id={"componentIDTooltip"}
                                                                          title={"This is an automatically generated ID that " +
                                                                                 "is defined by the component id and the number " +
                                                                                 "of the element added."} arrow>
                                                                     <TextField className="w-full"
                                                                                key={`${props.uuid}-element-id`}
                                                                                label="Component ID" disabled={true}
                                                                                defaultValue={selectedSfrElement && selectedSfrElement !== "" ? (JSON.parse(JSON.stringify(getElementMaps())).componentName) : ""}/>
                                                                 </Tooltip>
                                                            </div>
                                                            <div className={`w-[50%] ml-2 pr-2 pt-1 border-[1px] border-[#bdbdbd] rounded-[4px]`}>
                                                                {(() => {
                                                                    const title = "Management Functions";
                                                                    const isChecked = getElementValuesByType("isManagementFunction");
                                                                    const tooltipID = "managementFunctionCheckbox";
                                                                    const tooltip = "Select if this SFR Element contains a Management Function Table";
                                                                    const updateMethod = updateManagementFunctionCheckbox;
                                                                    const isDisabled = selectedSfrElement.toLowerCase().includes("fmt") ? false : true;
                                                                    return getCheckBox(title, isChecked, tooltipID, tooltip, updateMethod, isDisabled);
                                                                })()}
                                                            </div>
                                                            <IconButton onClick={() => {
                                                                handleDeleteElement(selectedSfrElement)
                                                            }} variant="contained">
                                                                <Tooltip title={`Delete Element`} id={"deleteElementTooltip"}>
                                                                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large}/>
                                                                </Tooltip>
                                                            </IconButton>
                                                        </div>
                                                    </span>
                                                    :
                                                    null
                                            }
                                        </div>
                                        {
                                            selectedSfrElement && selectedSfrElement !== "" ?
                                                <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                    <SfrRequirements
                                                        requirementType={"title"}
                                                        sfrUUID={props.sfrUUID}
                                                        componentUUID={props.uuid}
                                                        component={props.value}
                                                        elementUUID={getElementValuesByType("uuid")}
                                                        elementTitle={selectedSfrElement}
                                                        getElementMaps={getElementMaps}
                                                        allSfrOptions={props.allSfrOptions}
                                                        getSelectablesMaps={getSelectablesMaps}
                                                        getElementValuesByType={getElementValuesByType}
                                                        getSelectionBasedArrayByType={getSelectionBasedArrayByType}
                                                        updateSfrSectionElement={updateSfrSectionElement}
                                                    />
                                                    { getElementValuesByType("isManagementFunction") ?
                                                        <ManagementFunctionTable
                                                            sfrUUID={props.sfrUUID}
                                                            componentUUID={props.uuid}
                                                            component={props.value}
                                                            elementUUID={getElementValuesByType("uuid")}
                                                            elementTitle={selectedSfrElement}
                                                            getElementMaps={getElementMaps}
                                                            allSfrOptions={props.allSfrOptions}
                                                            getSelectablesMaps={getSelectablesMaps}
                                                            getElementValuesByType={getElementValuesByType}
                                                            getSelectionBasedArrayByType={getSelectionBasedArrayByType}
                                                            managementFunctions={getElementValuesByType("managementFunctions")}
                                                            updateSfrSectionElement={updateSfrSectionElement}
                                                        />
                                                        :
                                                        null
                                                    }
                                                    <ApplicationNote
                                                        isManagementFunction={false}
                                                        updateApplicationNote={updateApplicationNote}
                                                        getElementValuesByType={getElementValuesByType}
                                                    />
                                                </div>
                                                :
                                                null
                                        }
                                    </div>
                                }
                                footer={
                                    <div className="w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white" key={props.uuid + "-NewFormItem"}>
                                        <IconButton key={props.uuid + "-CreateNewElement"} onClick={handleCreateNewElement} variant="contained">
                                            <Tooltip title={"Create New Element"} id={"createNewElementTooltip"}>
                                                <AddCircleRoundedIcon htmlColor={ primary } sx={ icons.medium }/>
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