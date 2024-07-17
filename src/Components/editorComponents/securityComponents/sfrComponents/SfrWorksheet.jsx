// Imports
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Modal from "../../../modalComponents/Modal.jsx";
import {FormControl, IconButton, InputLabel, MenuItem, Select, Switch, TextField, Tooltip, Typography} from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextEditor from "../../TextEditor.jsx";
import SfrCard from "./SfrCard.jsx";
import {CREATE_SFR_SECTION_ELEMENT, DELETE_SFR_SECTION_ELEMENT, UPDATE_SFR_SECTION_ELEMENT, UPDATE_SFR_COMPONENT_ITEMS} from "../../../../reducers/SFRs/sfrSectionSlice.js";
import {useDispatch} from "react-redux";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import SfrRequirements from "./SfrRequirements.jsx";
import SfrEvaluationActivity from "./SfrEvaluationActivity.jsx";
import SfrAuditEvents from "./SfrAuditEvents.jsx";
import {RESET_EVALUATION_ACTIVITY_UI} from "../../../../reducers/SFRs/evaluationActivitiesUI.js";

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
    const style = {primary: "#d926a9", secondary: "#1FB2A6", borderColor: "#9CA3AF", grayTitle: {color: "#4d4d4d"},
                       checkbox: {color: "#9E9E9E", '&.Mui-checked': {color: "#1FB2A6"}},
                       switch: {color: "#1FB2A6", '&.Mui-checked': {color: "#1FB2A6"}}}
    const [openSfrComponent, setOpenSfrComponent] = useState(true)
    const [openSfrElement, setOpenSfrElement] = useState(true)
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
        let optional = event.target.checked
        let itemMap = {optional: optional}
        if (optional) {
            itemMap.objective = false
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateObjectiveCheckbox = (event) => {
        let objective = event.target.checked
        let itemMap = {objective: objective}
        if (objective) {
            itemMap.optional = false
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateSelectionBasedToggle = (event) => {
        let selectionBased = event.target.checked
        let itemMap = {selectionBased: selectionBased}
        if (!selectionBased) {
            itemMap.selections = {}
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
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
        let useCaseBased = event.target.checked
        let itemMap = {useCaseBased: useCaseBased}
        if (!useCaseBased) {
            itemMap.useCases = []
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateUseCaseBasedSelections = (title, selections) => {
        let useCaseSelections = getSelectionBasedArrayByType(selections, title, "uuid")
        let itemMap = {useCases: useCaseSelections}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const updateImplementationDependentToggle = (event) => {
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
        dispatch(UPDATE_SFR_SECTION_ELEMENT({sfrUUID: props.sfrUUID, sectionUUID: props.uuid, elementUUID: elementUUID, itemMap: itemMap}))
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
                    return element[type]
                } case "element": {
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

    // Helper Methods
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
        let titleStyle = !props.value.selectionBased ? { fontSize: 16, fontWeight: "medium" } : { fontSize: 16, fontWeight: "bold", color: style.secondary }
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
        let toggleDivStyle = { paddingX: 1 }
        if (!props.value.selectionBased) {
            toggleDivStyle.display = "flex"
            toggleDivStyle.justifyContent = "left"
        }
        let toggle = (
            <FormControlLabel
                sx={toggleDivStyle}
                control={
                    <Tooltip title={"Selecting this indicates that this SFR is dependent on a selection elsewhere in the " +
                                    "document."} arrow>
                        <Switch onChange={updateSelectionBasedToggle} checked={props.value.selectionBased} sx={style.switch}/>
                    </Tooltip>
                }
                label={<Typography sx={titleStyle}>Selection Based</Typography>}
            />
        )
        if (!props.value.selectionBased) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <SfrCard type={"section"}
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
        let titleStyle = !props.value.useCaseBased ? { fontSize: 16, fontWeight: "medium" } : { fontSize: 16, fontWeight: "bold", color: style.secondary }
        let selectionOptions = props.allSfrOptions.dropdownOptions.useCases
        let currentUseCases = JSON.parse(JSON.stringify(props.value.useCases))
        let selectedUseCases = getSelectionBasedArrayByType(currentUseCases, "Use Cases", "name")
        let toggleDivStyle = { paddingX: 1 }
        if (!props.value.useCaseBased) {
            toggleDivStyle.display = "flex"
            toggleDivStyle.justifyContent = "left"
        }
        let toggle = (
            <FormControlLabel
                sx={toggleDivStyle}
                control={
                    <Tooltip title={"Selecting this indicates that this SFR is dependent on a Use Case defined in the " +
                                    "Use Case section."} arrow>
                        <Switch onChange={updateUseCaseBasedToggle}
                                checked={props.value.useCaseBased}
                                sx={style.switch}
                                disabled={props.allSfrOptions.useCaseUUID === null}/>
                    </Tooltip>
                }
                label={<Typography sx={titleStyle}>Use Case Based</Typography>}/>
        )
        if (!props.value.useCaseBased) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <SfrCard type={"section"}
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
        let titleStyle = !props.value.implementationDependent ? { fontSize: 16, fontWeight: "medium" } : { fontSize: 16, fontWeight: "bold", color: style.secondary }
        let reasons = JSON.parse(JSON.stringify(props.value.reasons))
        let toggleDivStyle = { paddingX: 1 }
        if (!props.value.implementationDependent) {
            toggleDivStyle.display = "flex"
            toggleDivStyle.justifyContent = "left"
        }
        let toggle = (
            <FormControlLabel
                sx={toggleDivStyle}
                control={
                    <Tooltip title={"Selecting this indicates that this SFR is dependent on a feature defined elsewhere " +
                                    "in the document."} arrow>
                        <Switch onChange={updateImplementationDependentToggle}
                                checked={props.value.implementationDependent}
                                sx={style.switch}/>
                    </Tooltip>
                }
                label={<Typography sx={titleStyle}>Implementation Dependent</Typography>}/>
        )
        if (!props.value.implementationDependent) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <SfrCard type={"section"}
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
                                                             <FormControl fullWidth>
                                                                 <TextField label={`Reason ${index + 1}`} defaultValue={reason} key={reason}
                                                                            onBlur={(event) => {updateReasons(event, "update", index)}} />
                                                             </FormControl>
                                                         </td>
                                                         <td className="p-0 text-center align-middle">
                                                             <IconButton onClick={() => {updateReasons(null, "delete", index)}}
                                                                         disabled={!!(props.value.reasons && props.value.reasons.length === 1)}>
                                                                 <Tooltip title={"Delete Reason"}>
                                                                     <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
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
                                         <IconButton onClick={() => {updateReasons("", "add", null)}} key={props.tooltip + "ToolTip"}>
                                             <Tooltip title={"Add a New Reason"}>
                                                 <AddCircleRoundedIcon htmlColor={style.secondary} sx={{ width: 28, height: 28 }}/>
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
        let titleStyle = !extendedComponentDefinition.toggle ? { fontSize: 16, fontWeight: "medium" } : { fontSize: 16, fontWeight: "bold", color: style.secondary }
        let toggleDivStyle = { paddingX: 1 }
        if (!extendedComponentDefinition.toggle) {
            toggleDivStyle.display = "flex"
            toggleDivStyle.justifyContent = "left"
        }
        let toggle = (
            <FormControlLabel
                sx={toggleDivStyle}
                control={
                    <Tooltip title={"Selecting this indicates that this SFR is an extension of an SFR defined in the " +
                                    "Common Criteria, and may therefore implement Component Leveling, SFR-specific " +
                                    "Management Functions, Audit events, and Dependencies."} arrow>
                        <Switch onChange={(event) => {updateExtendedDefinitionToggle(event, extendedComponentDefinition)}}
                                checked={extendedComponentDefinition.toggle}
                                sx={style.switch}/>
                    </Tooltip>
                }
                label={<Typography sx={titleStyle}>Extended Component Definition</Typography>}/>
        )
        if (!extendedComponentDefinition.toggle) {
            return toggle
        } else {
            return (
                <div className="mx-[-10px]">
                    <SfrCard type={"section"}
                             header={
                                 <div className="my-[-6px]">
                                    {toggle}
                                 </div>
                             }
                             body={
                                 <div className="p-0 m-0 py-[6px] w-full" key={`${props.uuid}-extended-component-definition}`}>
                                     <div className="mt-[-8px] mx-[-10px] pb-[6px]">
                                         <SfrCard
                                             className="border-gray-300"
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[15px] p-0 pr-4 text-secondary">Component Leveling Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleComponentLevelingText}
                                                             text={extendedComponentDefinition.componentLeveling}
                                                 />
                                             }
                                         />
                                     </div>
                                     <div className="mx-[-10px]">
                                         <SfrCard
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[15px] p-0 pr-4 text-secondary">Management Function Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleManagementFunctionText}
                                                             text={extendedComponentDefinition.managementFunction}
                                                 />
                                             }
                                         />
                                     </div>
                                     <div className="mx-[-10px]">
                                         <SfrCard
                                             className="border-gray-300"
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[15px] p-0 pr-4 text-secondary">Audit Extended Component Description</label>
                                             }
                                             body={
                                                 <TextEditor className="w-full" contentType={"term"} handleTextUpdate={handleAuditText}
                                                             text={extendedComponentDefinition.audit}
                                                 />
                                             }
                                         />
                                     </div>
                                     <div className="mx-[-10px]">
                                         <SfrCard
                                             className="border-gray-300"
                                             type={"section"}
                                             header={
                                                 <label className="resize-none font-bold text-[15px] p-0 pr-4 text-secondary">Dependencies Extended Component Description</label>
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
                           <SfrCard type={"parent"} title={"SFR Component"} tooltip={"SFR Component"}
                               collapse={openSfrComponent} collapseHandler={handleSetOpenSfrComponent}
                               body={
                                   <div className="min-w-full mt-4 justify-items-left grid grid-flow-row auto-rows-max">
                                       <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4">
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"Full ID of the SFR Component. Should follow the following format: " +
                                                   "(3 letter Family)_(3 Letter Class)_(Optional EXT).(Number representing the component)"}>
                                                    <TextField key={props.value.cc_id} label="CC-ID" onBlur={updateCcID} defaultValue={props.value.cc_id}/>
                                               </Tooltip>
                                           </FormControl>
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"Full name of the component."}>
                                                   <TextField key={props.value.title} label="Name" onBlur={updateTitle} defaultValue={props.value.title}/>
                                               </Tooltip>
                                           </FormControl>
                                       </div>
                                       <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4">
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"Optional iteration abbreviation (Used in ID creation)."}>
                                                   <TextField key={props.value.iteration_id} label="Iteration ID" onBlur={updateIterationID} defaultValue={props.value.iteration_id}/>
                                               </Tooltip>
                                           </FormControl>
                                           <FormControl fullWidth>
                                               <Tooltip arrow title={"ID that will be used when the document is translated to XML."}>
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
                                           <SfrCard
                                               type={"section"}
                                               header={<label className="resize-none font-bold text-[18px] p-0 pr-4 text-accent">Component Selections</label>}
                                               body={
                                                   <div>
                                                       <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           <FormControl fullWidth sx={style.grayTitle}>
                                                               <FormControlLabel
                                                                   sx={{paddingX: 1}}
                                                                   control={
                                                                       <Tooltip title={"Selecting this indicates " +
                                                                           "that this is an optional SFR, and may be " +
                                                                           "claimed in the ST at the discretion of " +
                                                                           "the ST author."} arrow>
                                                                           <Checkbox onChange={updateOptionalCheckbox}
                                                                                     checked={props.value.optional}
                                                                                     sx={style.checkbox}/>
                                                                       </Tooltip>
                                                                   }
                                                                   label={<Typography sx={{ fontSize: 16 }}>Optional</Typography>}
                                                               />
                                                           </FormControl>
                                                       </div>
                                                       <div className="max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                                                           <FormControl fullWidth sx={style.grayTitle}>
                                                               <FormControlLabel
                                                                   sx={{paddingX: 1}}
                                                                   control={
                                                                       <Tooltip title={"Selecting this requirement indicates that " +
                                                                           "this SFR is not recognized by the common " +
                                                                           "criteria, but NIAP expects it to become a " +
                                                                           "mandatory requirement in the future."} arrow>
                                                                           <Checkbox onChange={updateObjectiveCheckbox}
                                                                                     checked={props.value.objective}
                                                                                     sx={style.checkbox}/>
                                                                       </Tooltip>
                                                                   }
                                                                   label={<Typography sx={{ fontSize: 16 }}>Objective</Typography>}
                                                               />
                                                           </FormControl>
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
                                                <SfrAuditEvents sfrUUID={props.sfrUUID} uuid={props.uuid} value={props.value}/>
                                           </div>
                                       </div>
                                   </div>
                               }
                           />
                           <SfrCard type={"parent"} title={"SFR Element"} tooltip={"SFR Element"}
                                collapse={openSfrElement} collapseHandler={handleSetOpenSfrElement}
                                body={
                                    <div className="min-w-full mt-4 grid grid-flow-row auto-rows-max">
                                        <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-3 gap-4 p-2 px-4">
                                            <FormControl fullWidth>
                                                <Tooltip
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
                                                                 <Tooltip
                                                                     title={"This is an automatically generated ID that " +
                                                                            "is defined by the component id and the number " +
                                                                            "of the element added."} arrow>
                                                                     <TextField className="w-full" key={`${props.uuid}-element-id`} label="Component ID" disabled={true}
                                                                                defaultValue={selectedSfrElement && selectedSfrElement !== "" ? (JSON.parse(JSON.stringify(getElementMaps())).componentName) : ""}/>
                                                                 </Tooltip>
                                                             </div>
                                                            <IconButton onClick={() => {handleDeleteElement(selectedSfrElement)}}>
                                                                <Tooltip title={`Delete Element`}>
                                                                    <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 28, height: 28 }}/>
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
                                                    />
                                                    <SfrCard
                                                        type={"section"}
                                                        header={
                                                            <Tooltip title={"Optional section that contains guidance for ST Authors on filling out the selections and assignments.\n" +
                                                                "Additionally, if any of the following cases are true, then these should be documented. " +
                                                                "1. If SFR is Selection-based, the App Note should document the selections that cause the Component to be claimed. " +
                                                                "2. If the SFR is Implementation-based, the App Note should document the product feature that the Component depends on. " +
                                                                "3. If any selections in the Element cause other SFRs to be claimed in the ST."} arrow>
                                                                <label className="resize-none font-bold text-[18px] p-0 pr-4 text-accent">Application Notes</label>
                                                            </Tooltip>
                                                        }
                                                        body={
                                                            <div>
                                                                <TextEditor className="w-full" contentType={"term"} handleTextUpdate={updateApplicationNote}
                                                                            text={getElementValuesByType("note") ? getElementValuesByType("note") : ""}
                                                                />
                                                            </div>
                                                        }
                                                    />
                                                </div>
                                                :
                                                null
                                        }
                                    </div>
                                }
                                footer={
                                    <div className="w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white" key={props.uuid + "-NewFormItem"}>
                                        <IconButton key={props.uuid + "-CreateNewElement"} onClick={handleCreateNewElement}>
                                            <Tooltip title={"Create New Element"}>
                                                <AddCircleRoundedIcon htmlColor={"#1FB2A6"} sx={{ width: 28, height: 28 }}/>
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
        </div>
    );
}

// Export SfrWorksheet.jsx
export default SfrWorksheet;