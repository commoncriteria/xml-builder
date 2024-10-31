// Imports
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE, UPDATE_SFR_SECTION_ELEMENT } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { GET_COMPLEX_SELECTABLE_PREVIEW } from "../../../../../reducers/SFRs/sfrPreview.js";
import { removeTagEqualities } from "../../../../../utils/fileParser.js"
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import CardTemplate from "../../CardTemplate.jsx";

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
        styling: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
    };

    // Constants
    const { icons } = useSelector((state) => state.styling);
    const dispatch = useDispatch();
    const [currentSelectable, setCurrentSelectable] = useState({ exclusive: false, notSelectable: false, description: [] })
    const [complexSelectableType, setComplexSelectableType] = useState("Selectables")
    const [previewToggle, setPreviewToggle] = useState(false)
    const { styling } = props

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

                // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise 
                // would be omitted by the quill editor due to not knowing how to interpret them)
                return (
                    <div className="preview">
                        {removeTagEqualities(complexSelectable, true)}
                    </div>
                )
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
                            <TextField
                                color={styling.secondaryTextField}
                                key={text}
                                label="Text"
                                defaultValue={text}
                                onBlur={(event) => handleTextUpdate(event, index)}
                            />
                        </FormControl>
                    </div>
                    <div className="w-[6%]">
                        <IconButton
                            sx={{ marginBottom: "-26px" }}
                            onClick={() => handleDeleteComplexSelectableItem(index)}
                            variant="contained"
                        >
                            <Tooltip
                                title={"Delete Text"}
                                id={props.elementUUID + "deleteTextTooltip"}
                            >
                                <DeleteForeverRoundedIcon htmlColor={ styling.secondaryColor } sx={ icons.large }/>
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
                            style={styling.primaryTextField}
                        />
                    </div>
                    <div className="w-[6%]">
                        <IconButton
                            sx={{ marginBottom: "-26px" }}
                            onClick={() => handleDeleteComplexSelectableItem(index)}
                            variant="contained"
                        >
                            <Tooltip
                                title={"Delete Selectables"}
                                id={props.elementUUID + "deleteSelectablesTooltip"}
                            >
                                <DeleteForeverRoundedIcon htmlColor={ styling.secondaryColor } sx={ icons.large }/>
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
        <div key={`${props.id}-complex-selectable-card`}>
            <CardTemplate type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-6px]">
                        <span className="flex justify-stretch min-w-full">
                            <div className="flex justify-center text-center w-full pl-4">
                                <Tooltip id={"sfrComplexSelectableTooltip"}
                                    title={"This section allows a user to create a complex selectable based on the " +
                                        "selections, groups and assignments that have been previously constructed. " +
                                        "Complex selectables can have the option of either text that will be separated " +
                                        "by a space or select multiple selections, groups and/or assignments that will " +
                                        "be separated by a comma."} arrow>
                                    <label
                                        style={{color: styling.primaryColor}}
                                        className="resize-none font-bold text-[13px] p-0 m-0 pr-1 mt-[10px]">
                                        {props.id}
                                    </label>
                                </Tooltip>
                                <IconButton
                                    sx={{ marginTop: "-8px", margin: 0, padding: 0 }}
                                    onClick={handleDeleteSelectableGroup}
                                    variant="contained"
                                >
                                    <Tooltip
                                        title={"Delete Complex Selectable"}
                                        id={props.elementUUID + "deleteTooltip"}
                                    >
                                        <DeleteForeverRoundedIcon htmlColor={ styling.primaryColor } sx={ icons.small }/>
                                    </Tooltip>
                                </IconButton>
                            </div>
                            <div className="flex justify-end w-[0px] pr-1">
                                <Stack
                                    direction="row"
                                    component="label"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography
                                        noWrap
                                        style={styling.primaryToggleTypography}
                                    >
                                        Preview
                                    </Typography>
                                    <Tooltip
                                        arrow placement={"top"}
                                        id={props.elementUUID + "previewToggleTooltip"}
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
                                        <Switch
                                            sx={previewToggle ? styling.secondaryToggleSwitch : {}}
                                            checked={previewToggle}
                                            onChange={handleSetPreviewToggle}
                                        />
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
                                    <Stack
                                        direction="row"
                                        component="label"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{ paddingRight: "4px" }}
                                    >
                                        <Typography
                                            noWrap
                                            style={styling.secondaryToggleTypography}
                                        >
                                            Not Selectable
                                        </Typography>
                                        <Tooltip
                                            title={"Selections that must be viewable, but not selectable."}
                                            arrow
                                            id={props.elementUUID + "NotSelectableCheckboxTooltip"}
                                        >
                                            <Checkbox
                                                sx={styling.secondaryCheckboxNoPad}
                                                size={"small"}
                                                onChange={handleNotSelectableCheckbox}
                                                checked={currentSelectable.notSelectable}
                                            />
                                        </Tooltip>
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        component="label"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Typography
                                            noWrap
                                            style={styling.secondaryToggleTypography}
                                        >
                                            Exclusive
                                        </Typography>
                                        <Tooltip
                                            title={"Selections that when selected, exclude all other selections."}
                                            arrow
                                            id={props.elementUUID + "ExclusiveCheckboxTooltip"}
                                        >
                                            <Checkbox
                                                sx={styling.secondaryCheckboxNoPad}
                                                size={"small"}
                                                onChange={handleExclusiveCheckbox}
                                                checked={currentSelectable.exclusive}
                                            />
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
                                                <FormControl fullWidth color={styling.primaryTextField}>
                                                    <InputLabel key="type-label">Type</InputLabel>
                                                    <Select
                                                        value={complexSelectableType}
                                                        label="Type"
                                                        autoWidth
                                                        onChange={handleSetComplexSelectableType}
                                                        sx={{ textAlign: "left" }}
                                                    >
                                                        <MenuItem
                                                            sx={styling.secondaryMenu}
                                                            key={"Selectables"}
                                                            value={"Selectables"}
                                                        >
                                                            Selectables
                                                        </MenuItem>
                                                        <MenuItem
                                                            sx={styling.secondaryMenu}
                                                            key={"Text"}
                                                            value={"Text"}
                                                        >
                                                            Text
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            <div className="w-[6%]">
                                                <IconButton
                                                    sx={{ marginBottom: "-36px" }}
                                                    onClick={handleNewComplexSelectableSubmit}
                                                >
                                                    <Tooltip
                                                        title={"Add Selectable Item"}
                                                        id={"addComplexSelectableItemTooltip"}
                                                    >
                                                        <AddCircleIcon htmlColor={ styling.primaryColor } sx={ icons.medium }/>
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