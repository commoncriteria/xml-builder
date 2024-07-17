// Imports
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SfrCard from "./SfrCard.jsx";
import { GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE, UPDATE_SFR_SECTION_ELEMENT } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { useDispatch } from "react-redux";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import Checkbox from "@mui/material/Checkbox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { GET_COMPLEX_SELECTABLE_PREVIEW } from "../../../../reducers/SFRs/sfrPreview.js";
import parse from 'html-react-parser';
import { escapedTagsRegex } from "../../../../utils/fileParser.js"

/**
 * The SfrComplexSelectableCard class that displays the complex selectable card
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrComplexSelectableCard(props) {
    // Prop Validation
    SfrComplexSelectableCard.propTypes = {
        id: PropTypes.string.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        elementUUID: PropTypes.string.isRequired,
        element: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
    };

    // Constants
    const style = {
        primary: "#d926a9",
        secondary: "#1FB2A6",
        checkbox: { color: "#9E9E9E", paddingLeft: "4px", '&.Mui-checked': { color: "#d926a9" }, "&:hover": { backgroundColor: "transparent" } },
        switch: { color: "#1FB2A6", '&.Mui-checked': { color: "#1FB2A6" } }
    }
    const dispatch = useDispatch();
    const [currentSelectable, setCurrentSelectable] = useState({ exclusive: false, notSelectable: false, description: [] })
    const [complexSelectableType, setComplexSelectableType] = useState("Selectables")
    const [previewToggle, setPreviewToggle] = useState(false)

    // Use Effects
    useEffect(() => {
        if (props.element.selectableGroups[props.id] && (JSON.stringify(props.element.selectableGroups[props.id]) !==
            JSON.stringify(currentSelectable))) {
            setCurrentSelectable(JSON.parse(JSON.stringify(props.element.selectableGroups[props.id])))
        }
    }, [props])

    // Methods
    const handleSetComplexSelectableType = (event) => {
        setComplexSelectableType(event.target.value)
    }
    const handleExclusiveCheckbox = (event) => {
        if (props.element.selectableGroups) {
            let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
            selectableGroups[props.id].exclusive = event.target.checked
            updateSelectableGroups(selectableGroups)
        }
    }
    const handleNotSelectableCheckbox = (event) => {
        if (props.element.selectableGroups) {
            let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
            selectableGroups[props.id].notSelectable = event.target.checked
            updateSelectableGroups(selectableGroups)
        }
    }
    const handleNewComplexSelectableSubmit = () => {
        if (props.element.selectableGroups) {
            let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
            let description = selectableGroups[props.id].description ? JSON.parse(JSON.stringify(selectableGroups[props.id].description)) : []
            if (complexSelectableType === "Text") {
                description.push({ text: "" })
                selectableGroups[props.id].description = description
                updateSelectableGroups(selectableGroups)
                setComplexSelectableType("Selectables")
            } else if (complexSelectableType === "Selectables") {
                description.push({ groups: [] })
                selectableGroups[props.id].description = description
                updateSelectableGroups(selectableGroups)
            }
        }
    }
    const handleSetPreviewToggle = (event) => {
        let toggle = event.target.checked
        setPreviewToggle(toggle)
    }
    const handleTextUpdate = (event, index) => {
        if (props.element.selectableGroups) {
            let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
            let description = selectableGroups[props.id].description
            if (description && description[index]) {
                description[index].text = event.target.value
                updateSelectableGroups(selectableGroups)
            }
        }
    }
    const handleDeleteComplexSelectableItem = (index) => {
        if (props.element.selectableGroups) {
            let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
            let description = selectableGroups[props.id].description
            if (description && description[index]) {
                description.splice(index, 1)
                updateSelectableGroups(selectableGroups)
            }
        }
    }
    const handleMultiselect = (title, selections, mainIndex) => {
        let newSelections = []
        let selectables = JSON.parse(JSON.stringify(props.element.selectables))
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
        Object.entries(selectables).map(([key, value]) => {
            let name = value.id ? (`${value.description} (${value.id})`) : value.description
            selections?.map((selection, index) => {
                if (name === selection && selection && (typeof selection === "string") && !newSelections.includes(key)) {
                    newSelections[index] = key
                } else if (selectableGroups.hasOwnProperty(selection)) {
                    newSelections[index] = selection
                }
            })
        })

        // Update selectable group
        selectableGroups[props.id].description[mainIndex] = { groups: newSelections }
        updateSelectableGroups(selectableGroups)
    }
    const handleDeleteSelectableGroup = () => {
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
        let title = JSON.parse(JSON.stringify(props.element.title))
        if (selectableGroups[props.id]) {
            delete selectableGroups[props.id]
            Object.values(selectableGroups).map((group) => {
                let groups = group.groups
                if (groups && groups.length > 0 && groups.includes(props.id)) {
                    let index = groups.findIndex((value) => props.id === value)
                    if (index !== -1) {
                        groups.splice(index, 1)
                    }
                }
            })
            // Delete title selections sections that contain the selection uuid key
            title.map((section, index) => {
                if (section.hasOwnProperty("selections") && section.selections === props.id) {
                    title.splice(index, 1)
                }
            })

            // Update selectable groups and title
            let itemMap = { selectableGroups: selectableGroups, title: title }
            dispatch(UPDATE_SFR_SECTION_ELEMENT({
                sfrUUID: props.sfrUUID,
                sectionUUID: props.componentUUID,
                elementUUID: props.elementUUID,
                itemMap: itemMap
            }))
        }
    }

    // Use Memos
    const getPreview = useMemo(
        () => {
            if (previewToggle && currentSelectable && currentSelectable.description) {
                let complexSelectable = ""
                try {
                    // Get the element selectables and selectableGroups
                    let element = dispatch(GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE({
                        sfrUUID: props.sfrUUID,
                        componentUUID: props.componentUUID,
                        elementUUID: props.elementUUID
                    }))
                    if (element.payload.element) {
                        const elementItems = element.payload.element
                        let selectable = dispatch(GET_COMPLEX_SELECTABLE_PREVIEW({
                            selectables: elementItems.selectables ? elementItems.selectables : {},
                            selectableGroups: elementItems.selectableGroups ? elementItems.selectableGroups : {},
                            currentSelectable: currentSelectable ? currentSelectable : {}
                        }))
                        if (selectable.payload.complexSelectable) {
                            complexSelectable = selectable.payload.complexSelectable
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
                // return (<div className="preview">{parse(complexSelectable)}</div>)

                // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise 
                // would be omitted by the quill editor due to not knowing how to interpret them)
                return (<div className="preview">{parse(complexSelectable.replace(escapedTagsRegex, (match, tagContent) => `&lt;${tagContent}&gt;`))}</div>)
            }
        },
        [previewToggle]
    );

    // Helper Methods
    const showTextContent = (value, index) => {
        let text = value.text ? value.text : ""
        return (
            <div className="mb-4" key={index + "TextContent"}>
                <span className="min-w-full inline-flex items-baseline">
                    <div className="w-[94%]">
                        <FormControl fullWidth>
                            <TextField color="secondary" key={text} label="Text" defaultValue={text}
                                onBlur={(event) => handleTextUpdate(event, index)} />
                        </FormControl>
                    </div>
                    <div className="w-[6%]">
                        <IconButton sx={{ marginBottom: "-26px" }} onClick={() => handleDeleteComplexSelectableItem(index)}>
                            <Tooltip title={"Delete Text"}>
                                <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 30, height: 30 }} />
                            </Tooltip>
                        </IconButton>
                    </div>

                </span>
            </div>
        )
    }
    const showSelectablesContent = (value, index) => {
        let selected = props.element.selectableGroups[props.id].description[index] ?
            JSON.parse(JSON.stringify(getSFRSelectables(index))) : []
        let selectableOptions = JSON.parse(JSON.stringify(props.getSelectablesMaps().dropdownOptions))
        return (
            <div className="mb-4" key={index + "SelectablesContent"}>
                <span className="min-w-full inline-flex items-baseline">
                    <div className="w-[94%]">
                        <MultiSelectDropdown selectionOptions={selectableOptions}
                            selections={selected}
                            title={"Selectables"}
                            groupID={props.id}
                            handleSelections={handleMultiselect}
                            index={index}
                            style={"primary"}
                        />
                    </div>
                    <div className="w-[6%]">
                        <IconButton sx={{ marginBottom: "-26px" }} onClick={() => handleDeleteComplexSelectableItem(index)}>
                            <Tooltip title={"Delete Selectables"}>
                                <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 30, height: 30 }} />
                            </Tooltip>
                        </IconButton>
                    </div>

                </span>
            </div>
        )
    }
    const getSFRSelectables = (index) => {
        let selectables = []
        let selected = props.element.selectableGroups[props.id].description[index].groups ?
            JSON.parse(JSON.stringify(props.element.selectableGroups[props.id].description[index].groups)) : []
        let selectableOptions = JSON.parse(JSON.stringify(props.element.selectables))
        let selectableGroupOptions = Object.keys(JSON.parse(JSON.stringify(props.element.selectableGroups)))
        selected?.map((value, index) => {
            if (selectableOptions.hasOwnProperty(value) && value !== undefined) {
                let selection = selectableOptions[value]
                let name = selection.id ? (`${selection.description} (${selection.id})`) : selection.description
                if (!selectables.includes(name)) {
                    selectables[index] = name
                }
            } else if (selectableGroupOptions.includes(value) && value !== undefined) {
                if (!selectables.includes(value)) {
                    selectables[index] = value
                }
            }
        })
        return selectables
    }
    const updateSelectableGroups = (selectableGroups) => {
        let itemMap = { selectableGroups: selectableGroups }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: props.componentUUID,
            elementUUID: props.elementUUID,
            itemMap: itemMap
        }))
    }

    // Return Method
    return (
        <div key={`${props.id}-group-card`}>
            <SfrCard type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-6px]">
                        <span className="flex justify-stretch min-w-full">
                            <div className="flex justify-center text-center w-full pl-4">
                                <Tooltip
                                    title={"This section allows a user to create a complex selectable based on the " +
                                        "selections, groups and assignments that have been previously constructed. " +
                                        "Complex selectables can have the option of either text that will be separated " +
                                        "by a space or select multiple selections, groups and/or assignments that will " +
                                        "be separated by a comma."} arrow>
                                    <label className="resize-none font-bold text-[16px] p-0 m-0 text-accent pr-1 mt-[8px]">{props.id}</label>
                                </Tooltip>
                                <IconButton sx={{ marginTop: "-8px", margin: 0, padding: 0 }} onClick={handleDeleteSelectableGroup}>
                                    <Tooltip title={"Delete Complex Selectable"}>
                                        <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 26, height: 26 }} />
                                    </Tooltip>
                                </IconButton>
                            </div>
                            <div className="flex justify-end w-[0px] pr-1">
                                <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                                    <Typography noWrap style={{ color: style.secondary, fontSize: "14px", fontWeight: 600 }}>Preview</Typography>
                                    <Tooltip arrow placement={"top"}
                                        title={
                                            <div>
                                                <h1>Toggling this allows a user to see what the fully constructed
                                                    complex
                                                    selectable will look like when exported. Use this to see what
                                                    the
                                                    selection below will look like.
                                                </h1>
                                                <br />
                                                <h1>* Note: Results may vary</h1>
                                            </div>

                                        }
                                    >
                                        <Switch sx={style.switch} checked={previewToggle} onChange={handleSetPreviewToggle} />
                                    </Tooltip>
                                </Stack>
                                <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                                    <Typography noWrap style={{ color: style.primary, fontSize: "13px", fontWeight: 600 }}>Exclusive</Typography>
                                    <Tooltip title={"Selections that when selected, exclude all other selections."} arrow>
                                        <Checkbox sx={style.checkbox} size={"small"} onChange={handleExclusiveCheckbox}
                                            checked={currentSelectable.exclusive} />
                                    </Tooltip>
                                </Stack>
                            </div>
                        </span>
                    </div>
                }
                body={
                    <div>
                        {!previewToggle ?
                            <div className="mt-[-8px]">
                                <span className="flex justify-end mb-2 mr-[-8px]">
                                    <Stack direction="row" component="label" alignItems="center" justifyContent="center"
                                        sx={{ paddingRight: "4px" }}>
                                        <Typography noWrap style={{ color: style.primary, fontSize: "13px", fontWeight: 600 }}>Not Selectable</Typography>
                                        <Tooltip title={"Selections that must be viewable, but not selectable."} arrow>
                                            <Checkbox sx={style.checkbox} size={"small"} onChange={handleNotSelectableCheckbox}
                                                checked={currentSelectable.notSelectable} />
                                        </Tooltip>
                                    </Stack>
                                    <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                                        <Typography noWrap style={{ color: style.primary, fontSize: "13px", fontWeight: 600 }}>Exclusive</Typography>
                                        <Tooltip title={"Selections that when selected, exclude all other selections."} arrow>
                                            <Checkbox sx={style.checkbox} size={"small"} onChange={handleExclusiveCheckbox}
                                                checked={currentSelectable.exclusive} />
                                        </Tooltip>
                                    </Stack>
                                </span>

                                {(currentSelectable && currentSelectable.description && currentSelectable.description.length > 0) ?
                                    <div className={"mb-2"} key={props.id + "complexSelectableDescription"}>
                                        {currentSelectable.description.map((value, index) => {
                                            if (value.hasOwnProperty("text")) {
                                                return showTextContent(value, index)
                                            } else if (value.hasOwnProperty("groups")) {
                                                return showSelectablesContent(value, index)
                                            }
                                        })}
                                    </div>
                                    : null
                                }
                                <div className="border-t-2 border-gray-200 m-0 p-0 pt-4 mx-[-16px]">
                                    <div className="px-4 pt-0 pb-2">
                                        <span className="min-w-full inline-flex items-baseline">
                                            <div className="w-[94%]">
                                                <FormControl fullWidth color={"primary"}>
                                                    <InputLabel key="type-label">Type</InputLabel>
                                                    <Select value={complexSelectableType}
                                                        label="Type"
                                                        autoWidth
                                                        onChange={handleSetComplexSelectableType}
                                                        sx={{ textAlign: "left" }}
                                                    >
                                                        <MenuItem key={"Selectables"} value={"Selectables"}>Selectables</MenuItem>
                                                        <MenuItem key={"Text"} value={"Text"}>Text</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className="w-[6%]">
                                                <IconButton sx={{ marginBottom: "-26px" }} onClick={handleNewComplexSelectableSubmit}>
                                                    <Tooltip title={"Add Selectable Item"}>
                                                        <AddCircleIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }} />
                                                    </Tooltip>
                                                </IconButton>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            :
                            <div>
                                {getPreview}
                            </div>
                        }
                    </div>
                }
            />
        </div>
    );
}

// Export SfrComplexSelectableCard.jsx
export default SfrComplexSelectableCard;