// Imports
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SfrCard from "./SfrCard.jsx";
import { GET_SFR_ELEMENT_VALUES_FOR_TITLE, UPDATE_SFR_SECTION_ELEMENT } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { useDispatch } from "react-redux";
import TextEditor from "../../TextEditor.jsx";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Delta from "quill-delta";
import SfrSelectionGroups from "./SfrSelectionGroups.jsx";
import { GET_REQUIREMENTS_TITLE_PREVIEW } from "../../../../reducers/SFRs/sfrPreview.js";
import parse from "html-react-parser";
import { escapedTagsRegex } from "../../../../utils/fileParser.js"

/**
 * The SfrRequirements class that displays the requirements per sfr element
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrRequirements(props) {
    // Prop Validation
    SfrRequirements.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        getElementMaps: PropTypes.func.isRequired,
        allSfrOptions: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired
    };

    // Constants
    const dispatch = useDispatch();
    const style = {
        primary: "#d926a9",
        secondary: "#1FB2A6",
        switch: { color: "#1FB2A6", '&.Mui-checked': { color: "#1FB2A6" } }
    }
    const [requirementsChange, setRequirementsChange] = useState(false)
    const [selectedRequirementType, setSelectedRequirementType] = useState("")
    const [previewToggle, setPreviewToggle] = useState(false)

    // Methods
    const handlePreviewToggle = (event) => {
        setPreviewToggle(event.target.checked)
    }
    const handleSetSelectedRequirementType = (event) => {
        setSelectedRequirementType(event.target.value)
    }
    const handleAddNewRequirement = () => {
        if (selectedRequirementType !== "") {
            let section;
            switch (selectedRequirementType) {
                case "Additional Text": {
                    section = { text: "" }
                    break;
                }
                case "Assignment": {
                    section = { assignment: "" }
                    break;
                }
                case "Description": {
                    section = { description: "" }
                    break;
                }
                case "Selection Group": {
                    section = { selections: "" }
                    break;
                }
                default: break;
            }

            // Set the title
            if (section) {
                let title = JSON.parse(JSON.stringify(props.component.elements[props.elementUUID].title))
                title.push(section)
                let itemMap = { title: title }
                dispatch(UPDATE_SFR_SECTION_ELEMENT({
                    sfrUUID: props.sfrUUID, sectionUUID: props.componentUUID,
                    elementUUID: props.elementUUID, itemMap: itemMap
                }))
                setSelectedRequirementType("")
                setRequirementsChange(true)
            }
        }
    }
    const handleDeleteRequirementItem = (elementUUID, index) => {
        let title = JSON.parse(JSON.stringify(props.component.elements[props.elementUUID].title))
        title.splice(index, 1)
        let itemMap = { title: title }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({ sfrUUID: props.sfrUUID, sectionUUID: props.componentUUID, elementUUID: elementUUID, itemMap: itemMap }))
        setSelectedRequirementType("")
        setRequirementsChange(true)
    }
    const handleAssignmentSelection = (event, elementUUID, index) => {
        let title = JSON.parse(JSON.stringify(props.component.elements[elementUUID].title))
        let name = event.target.value
        let uuid = props.getSelectablesMaps().nameMap.assignments[name]
        title[index] = { assignment: uuid ? uuid : "" }
        let itemMap = { title: title }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({ sfrUUID: props.sfrUUID, sectionUUID: props.componentUUID, elementUUID: elementUUID, itemMap: itemMap }))
        setRequirementsChange(true)
    }
    const handleSelectablesSelection = (event, elementUUID, index) => {
        let title = JSON.parse(JSON.stringify(props.component.elements[elementUUID].title))
        let name = event.target.value
        title[index] = { selections: name }
        let itemMap = { title: title }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({ sfrUUID: props.sfrUUID, sectionUUID: props.componentUUID, elementUUID: elementUUID, itemMap: itemMap }))
        setRequirementsChange(true)
    }
    const getElementRequirementBody = () => {
        let titleSection = props.getElementValuesByType("title")
        let elementUUID = props.allSfrOptions.nameMap.elements[props.elementTitle]
        if (titleSection && elementUUID) {
            return (
                <div className="p-0 m-0 mb-1">
                    {
                        (titleSection && titleSection !== undefined && Object.keys(titleSection).length > 0) ?
                            <div className="mt-[-12px] mb-[-4px]">
                                {titleSection?.map((item, index) => {
                                    let entry = Object.entries(item)[0]
                                    let key = entry[0]
                                    let value = entry[1]
                                    const capitalizedKey = (key !== "text") ? key.charAt(0).toUpperCase() + key.slice(1) : "Additional Text"
                                    return (
                                        <div key={`${key}-${index}`}>
                                            <div className="p-0 border-0">
                                                <span className="min-w-full inline-flex items-baseline">
                                                    <div className="w-[94%] pb-2">
                                                        {getElementRequirementSection(key, elementUUID, value, index, titleSection)}
                                                    </div>
                                                    <div className="w-[4%] px-1">
                                                        <IconButton sx={key !== "description" ? { marginBottom: "-32px" } : { marginBottom: "-36px" }}
                                                            onClick={() => { handleDeleteRequirementItem(elementUUID, index) }}>
                                                            <Tooltip title={"Delete " + capitalizedKey}>
                                                                <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }} />
                                                            </Tooltip>
                                                        </IconButton>
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            :
                            null
                    }
                </div>
            )
        }
    }
    const getElementRequirementSection = (type, uuid, value, index, titleSection) => {
        if (props.elementTitle && props.elementTitle !== "") {
            let isNextTypeDescription = titleSection[index + 1] && Object.keys(titleSection[index + 1])[0] === "description" ? true : false
            let style = `${!isNextTypeDescription ? "pb-2 " : ""} ${index === 0 ? "pt-4 " : ""}`
            switch (type) {
                case "description": {
                    let delta = typeof value === "string" ? value : new Delta(value)
                    return (
                        <div key={`element-title-section-${uuid}-${index}-${type}`} >
                            <TextEditor text={delta} contentType={"requirement"} elementData={{ uuid: uuid, index: index }}
                                handleTextUpdate={updateFElementTitleFields} />
                        </div>
                    )
                }
                case "selections": {
                    let selectable = titleSection[index].selections ? titleSection[index].selections : ""
                    let selectables = JSON.parse(JSON.stringify(props.getSelectablesMaps())).dropdownOptions
                    let selectionOptions = [...new Set([...selectables.groups, ...selectables.complexSelectables])]
                    return (
                        <div className={style} key={`element-title-section-${uuid}-${index}-${type}`}>
                            <FormControl fullWidth>
                                <InputLabel key="selectables-requirement-label">Select Selectables</InputLabel>
                                <Select
                                    value={selectable}
                                    label="Select Selectables"
                                    autoWidth
                                    onChange={(event) => { handleSelectablesSelection(event, uuid, index) }}
                                    sx={{ textAlign: "left" }}
                                >
                                    {selectionOptions.map((value) => (
                                        <MenuItem key={value} value={value}>{value}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    )
                }
                case "text": {
                    return (
                        <div className={style} key={`element-title-section-${uuid}-${index}-${type}`}>
                            <FormControl fullWidth>
                                <TextField key={value} label={"Additional Text"} defaultValue={value}
                                    onBlur={(event) => {
                                        let update = { text: event.target.value }
                                        updateFElementTitleFields(update, uuid, index, "update")
                                    }} />
                            </FormControl>
                        </div>
                    )
                }
                case "assignment": {
                    let assignmentOptions = JSON.parse(JSON.stringify(props.getSelectablesMaps().dropdownOptions.assignments))
                    let assignmentValue = props.getSelectablesMaps().uuidMap.assignments[value]
                    return (
                        <div className={style} key={`element-title-section-${uuid}-${index}-${type}`}>
                            <FormControl fullWidth required>
                                <InputLabel id={`assignment-label-${uuid}-${index}`}>Assignment</InputLabel>
                                <Select
                                    value={assignmentValue}
                                    label="Assignment"
                                    onChange={(event) => { handleAssignmentSelection(event, uuid, index) }}
                                    sx={{ textAlign: "left" }}
                                >
                                    {
                                        assignmentOptions.map((value) => {
                                            return (
                                                <MenuItem key={value} value={value}>{value}</MenuItem>
                                            )
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </div>
                    )
                }
                default:
                    return
            }
        }
    }
    const updateFElementTitleFields = (event, uuid, index, updateType) => {
        let title = props.component.elements[uuid].title ? props.component.elements[uuid].title : []
        let originalTitle = JSON.parse(JSON.stringify(title))
        if (updateType === "add") {
            originalTitle.push(event)
        } else if (updateType === "update") {
            originalTitle[index] = event
        } else if (updateType === "delete") {
            originalTitle.splice(index, 1)
        }
        let itemMap = { title: originalTitle }
        let elementUUID = JSON.parse(JSON.stringify(props.getElementMaps())).elementNameMap[props.elementTitle]
        dispatch(UPDATE_SFR_SECTION_ELEMENT({ sfrUUID: props.sfrUUID, sectionUUID: props.componentUUID, elementUUID: elementUUID, itemMap: itemMap }))
    }
    const showTitlePreview = () => {
        let titleSection = ""
        try {
            if (previewToggle) {
                // Get the element selectables, selectableGroups and title
                let initialElementValues = dispatch(GET_SFR_ELEMENT_VALUES_FOR_TITLE({
                    sfrUUID: props.sfrUUID,
                    componentUUID: props.componentUUID,
                    elementUUID: props.elementUUID
                }))
                if (initialElementValues.payload.element) {
                    const elementTitleValues = initialElementValues.payload.element
                    let selectable = dispatch(GET_REQUIREMENTS_TITLE_PREVIEW({
                        selectables: elementTitleValues.selectables ? elementTitleValues.selectables : {},
                        selectableGroups: elementTitleValues.selectableGroups ? elementTitleValues.selectableGroups : {},
                        title: elementTitleValues.title
                    }))
                    if (selectable.payload.titleSection) {
                        titleSection = selectable.payload.titleSection
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
        // return (<div className="preview">{parse(titleSection)}</div>)

        // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise 
        // would be omitted by the quill editor due to not knowing how to interpret them)
        return (<div className="preview">{parse(titleSection.replace(escapedTagsRegex, (match, tagContent) => `&lt;${tagContent}&gt;`))}</div>)
    }

    // Use Memos
    const getRequirements = useMemo(
        () => {
            if (!previewToggle || requirementsChange) {
                let requirementsBody = getElementRequirementBody()
                if (requirementsChange) {
                    setRequirementsChange(false)
                }
                return requirementsBody
            }
        }, [previewToggle, requirementsChange]
    )

    // Return Method
    return (
        <div className="">
            <SfrSelectionGroups sfrUUID={props.sfrUUID} componentUUID={props.componentUUID}
                elementUUID={props.getElementValuesByType("uuid")}
                element={props.getElementValuesByType("element")}
                getSelectablesMaps={props.getSelectablesMaps}
                key={`f-element-selection-group`} />
            <SfrCard
                type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-6px]">
                        <span className="flex justify-stretch min-w-full">
                            <div className="flex justify-center w-full pl-4">
                                <Tooltip title={"This is the primary section for the definition of the requirement. This " +
                                    "section consists of descriptive text, complex selections, selections, " +
                                    "selection groups, and assignments."} arrow>
                                    <label className="resize-none font-bold text-[18px] pr-6 mt-[8px] text-accent">Requirement</label>
                                </Tooltip>
                            </div>
                            <div className="flex justify-end w-[0px] pr-2">
                                <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                                    <Typography noWrap style={{color: style.secondary, fontSize: "14px", fontWeight: 600}}>Preview</Typography>
                                    <Tooltip arrow placement={"top"}
                                        title={
                                            <div>
                                                <h1>Toggling this allows a user to see what the fully constructed
                                                    requirement
                                                    will look like when exported. Use this to see what the selection
                                                    below
                                                    will look like.
                                                </h1>
                                                <br/>
                                                <h1>* Note: Results may vary</h1>
                                            </div>
                                        }
                                    >
                                        <Switch sx={style.switch} checked={previewToggle} onChange={handlePreviewToggle}/>
                                    </Tooltip>
                                </Stack>
                            </div>
                        </span>
                    </div>
                }
                body={
                    previewToggle ?
                        <div id="requirements-title-preview" className="min-w-full">{showTitlePreview()}</div>
                        :
                        <div>
                            {getRequirements}
                            <div className="border-t-2 border-gray-200 m-0 p-0 pt-2 mx-[-16px]">
                                <div className="p-2 px-4">
                                    <span className="min-w-full inline-flex items-baseline">
                                        <div className="w-[94%]">
                                            <FormControl fullWidth>
                                                <InputLabel key="element-requirement-type-select-label">Add to Requirement</InputLabel>
                                                <Select
                                                    value={selectedRequirementType}
                                                    label="Select Requirement"
                                                    autoWidth
                                                    onChange={handleSetSelectedRequirementType}
                                                    sx={{ textAlign: "left" }}
                                                >
                                                    <MenuItem key={"Additional Text"} value={"Additional Text"}>Additional Text</MenuItem>
                                                    <MenuItem key={"Assignment"} value={"Assignment"}>Assignment</MenuItem>
                                                    <MenuItem key={"Description"} value={"Description"}>Description</MenuItem>
                                                    <MenuItem key={"Selection Group"} value={"Selection Group"}>Selection Group</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="w-[6%]">
                                            <IconButton sx={{ marginBottom: "-32px" }} onClick={handleAddNewRequirement}>
                                                <Tooltip title={"This allows a user to add one of several options to the requirement."}>
                                                    <AddCircleIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }} />
                                                </Tooltip>
                                            </IconButton>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>
                }
            />
        </div>
    );
}

// Export SfrRequirements.jsx
export default SfrRequirements;