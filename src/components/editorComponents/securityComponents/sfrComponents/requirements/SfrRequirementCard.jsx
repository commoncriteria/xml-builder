// Imports
import PropTypes from "prop-types";
import Delta from "quill-delta";
import React, {useEffect, useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { GET_SFR_ELEMENT_VALUES_FOR_TITLE } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { GET_REQUIREMENTS_TITLE_PREVIEW } from "../../../../../reducers/SFRs/sfrPreview.js";
import { removeTagEqualities } from "../../../../../utils/fileParser.js";
import SecurityComponents from "../../../../../utils/securityComponents.js";
import AddCircleIcon from "@mui/icons-material/AddCircle.js";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import CardTemplate from "../../CardTemplate.jsx";
import TextEditor from "../../../TextEditor.jsx";

/**
 * The SfrRequirementCard class that displays the requirement card
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrRequirementCard(props) {
    // Prop Validation
    SfrRequirementCard.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        requirementType: PropTypes.string.isRequired,
        allSfrOptions: PropTypes.object.isRequired,
        styling: PropTypes.object.isRequired,
        cryptoColumnName: PropTypes.string,
        rowIndex: PropTypes.number,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        updateSfrSectionElement: PropTypes.func,
        updateManagementFunctions: PropTypes.func,
        initializeManagementFunctions: PropTypes.func,
        getCurrentManagementFunction: PropTypes.func,
        showManagementFunctionPreview: PropTypes.func,
        showTabularizeTablePreview: PropTypes.func,
    }

    // Constants
    const dispatch = useDispatch();
    const { icons } = useSelector((state) => state.styling);
    const { row, selectedColumn } = useSelector((state) => state.tabularize);
    const [title, setTitle] = useState("Requirement")
    const [description, setDescription] = useState("requirement")
    const [isTitleAndFcs, setIsTitleAndFcs] = useState(false)
    const [additionalDescription, setAdditionalDescription] = useState(", crypto selection table")
    const [previewToggle, setPreviewToggle] = useState(false)
    const [selectedRequirementType, setSelectedRequirementType] = useState("Additional Text")
    const [requirementsChange, setRequirementsChange] = useState(false)
    const requirementMenu = ["Additional Text", "Assignment", "Crypto Selection Table", "Description", "Selection Group"]
    const { styling } = props

    // Use Effects
    useEffect(() => {
        handleProps(props)
    }, [props.elementTitle, props.requirementType]);

    // Methods
    const handleProps = () => {
        const { elementTitle, requirementType } = props

        // Update if requirement is a title and is of the FCS family
        const titleAndFcs = (requirementType === "title" && elementTitle.toLowerCase().includes("fcs"))
        setIsTitleAndFcs(titleAndFcs)

        // Update title, description and additional description
        if (requirementType === "title" || requirementType === "crypto") {
            setTitle(requirementType === "title" ? "Requirement" : `Column Text`)
            setDescription("requirement")
            setAdditionalDescription(titleAndFcs ? ", crypto selection table" : "")
        } else if (requirementType === "managementFunctions") {
            setTitle("Management Function Text")
            setDescription("management function")
            setAdditionalDescription("")
        }
    }
    const handleSetSelectedRequirementType = (selected) => {
        if (JSON.stringify(selected) !== JSON.stringify(selectedRequirementType)) {
            setSelectedRequirementType(selected)
        }
    }
    const handlePreviewToggle = (event) => {
        setPreviewToggle(event.target.checked)
    }
    const handleAddNewRequirement = () => {
        // Check for selected requirement type
        if (selectedRequirementType !== "") {
            let section;

            // Generate requirement by selected type
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
                case "Crypto Selection Table": {
                    if (isTitleAndFcs) {
                        section = { tabularize: "" }
                    }
                    break;
                }
                default: break;
            }

            // Add values by requirement type
            if (section) {
                const updateMap = {
                    updateType: "add",
                    key: selectedColumn,
                    value: section,
                    definitionType: "selectcol",
                }
                updateRequirementByType(updateMap)

                // Update requirement change and type
                handleSetSelectedRequirementType("")
                setRequirementsChange(true)
            }
        }
    }
    const handleUpdateFields = (event, uuid, index, updateType) => {
        const { requirementType, component, cryptoColumnName } = props

        // Update value
        let value;
        if (requirementType === "title" && component.elements[uuid].title) {
            value = JSON.parse(JSON.stringify(component.elements[uuid].title))
        } else if (requirementType === "managementFunctions") {
            value = JSON.parse(JSON.stringify(props.getCurrentManagementFunction("textArray")))
        } else if (requirementType === "crypto") {
            value = JSON.parse(JSON.stringify(row[cryptoColumnName]))
        } else {
            value = [];
        }

        // Handle updates by update type
        if (updateType === "add") {
            value.push(event)
        } else if (updateType === "update") {
            value[index] = event
        } else if (updateType === "delete") {
            value.splice(index, 1)
        }

        // Update values by requirement type
        const updateMap = {
            updateType: "update",
            key: selectedColumn,
            value: value,
            definitionType: "selectcol",
        }
        updateRequirementByType(updateMap)
    }
    const handleDeleteRequirementItem = (elementUUID, index) => {
        // Delete values by requirement type
        const updateMap = {
            updateType: "delete",
            key: selectedColumn,
            index: index,
            definitionType: "selectcol",
        }
        updateRequirementByType(updateMap)

        // Update requirement change and type
        handleSetSelectedRequirementType("")
        setRequirementsChange(true)
    }
    const handleAssignmentSelection = (event, elementUUID, index) => {
        const name = event.target.value
        const uuid = props.getSelectablesMaps().nameMap.assignments[name]

        // Update assignment by requirement type
        const updateMap = {
            updateType: "update",
            key: selectedColumn,
            value: {
                assignment: uuid ? uuid : ""
            },
            index: index,
            definitionType: "selectcol",
        }
        updateRequirementByType(updateMap)

        // Update requirements change
        setRequirementsChange(true)
    }
    const handleTabularizeSelection = (event, elementUUID, index) => {
        // Check if the type is title and of the fcs family
        if (isTitleAndFcs) {
            const uuid = event.target.value

            // Update tabularize
            const updateMap = {
                updateType: "update",
                value: {
                    tabularize: uuid ? uuid : ""
                },
                index: index,
            }
            handleTitleUpdate(updateMap)

            // Update requirements change
            setRequirementsChange(true)
        }
    }
    const handleSelectablesSelection = (event, elementUUID, index) => {
        const name = event.target.value
        const selections = { selections: name }

        // Update selections by requirement type
        const updateMap = {
            updateType: "update",
            key: selectedColumn,
            value: selections,
            index: index,
            definitionType: "selectcol",
        }
        updateRequirementByType(updateMap)

        // Update requirements change
        setRequirementsChange(true)
    }
    const handleTitleUpdate = (updateMap) => {
        const { updateType, value, index } = updateMap
        const { component, elementUUID, componentUUID } = props
        let title = JSON.parse(JSON.stringify(component.elements[elementUUID].title));

        // Set item map by type
        switch (updateType) {
            case "add": {
                title.push(value)
                break;
            }
            case "update": {
                if (index) {
                    title[index] = value
                } else {
                    title = value
                }
                break;
            }
            case "delete": {
                title.splice(index, 1)
                break;
            }
            default: break;
        }

        // Update title
        let itemMap = {
            title: title
        }
        props.updateSfrSectionElement(elementUUID, componentUUID, itemMap)
    }
    const handleManagementFunctionUpdate = (updateMap) => {
        const { rowIndex } = props
        const { updateType, value, index } = updateMap
        let managementFunctions = props.initializeManagementFunctions("textArray");

        // Set management function by type
        switch (updateType) {
            case "add": {
                managementFunctions.rows[rowIndex].textArray.push(value)
                break;
            }
            case "update": {
                if (index) {
                    managementFunctions.rows[rowIndex].textArray[index] = value
                } else {
                    managementFunctions.rows[rowIndex].textArray = value
                }
                break;
            }
            case "delete": {
                managementFunctions.rows[rowIndex].textArray.splice(index, 1)
                break;
            }
            default: break;
        }

        // Update management function
        props.updateManagementFunctions(managementFunctions)
    }

    // Helper Methods
    const updateRequirementByType = (updateMap) => {
        const { requirementType } = props

        // Update values by requirement type
        if (requirementType === "title") {
            handleTitleUpdate(updateMap)
        } else if (requirementType === "managementFunctions") {
            handleManagementFunctionUpdate(updateMap)
        } else if (requirementType === "crypto") {
            SecurityComponents.handleCryptoUpdate(updateMap)
        }
    }

    // Components
    const getRequirementBody = () => {
        try {
            const { requirementType, elementTitle, cryptoColumnName } = props
            const elementUUID = props.allSfrOptions.nameMap.elements[elementTitle]
            let section = []

            // Get section
            if (requirementType === "title") {
                section = props.getElementValuesByType("title")
            } else if (requirementType === "managementFunctions") {
                section = props.getCurrentManagementFunction("textArray")
            } else if (requirementType === "crypto") {
                section = JSON.parse(JSON.stringify(row[cryptoColumnName]))
            }

            // Get requirements body
            if (section && elementUUID) {
                if (requirementsChange) {
                    setRequirementsChange(false)
                }
                return (
                    <div className="p-0 m-0 mb-1">
                        {(section && Object.keys(section).length > 0) ?
                            <div className="mt-[-12px] mb-[-4px]">
                                {section?.map((item, index) => (
                                    getRequirementModalSection(item, index, elementUUID, section)
                                ))}
                            </div>
                            :
                            null
                        }
                    </div>
                )
            }
        } catch (e) {
            console.log(e)
        }
    }
    const getRequirementModalSection = (item, index, elementUUID, parent) => {
        const entry = Object.entries(item)[0]
        const key = entry[0]
        const value = entry[1]
        const capitalizedKey = (key !== "text") ? key.charAt(0).toUpperCase() + key.slice(1) : "Additional Text"

        return (
            <div key={`${key}-${index}`} className="w-full">
                <div className="w-full p-0 border-0 grid grid-flow-col columns-1">
                    <span className="w-full inline-flex items-baseline">
                        <div className={`w-[100%] pb-2`}>
                            {getCurrentSection(key, elementUUID, value, index, parent)}
                        </div>
                        <div className="pl-2">
                            <IconButton
                                sx={key !== "description" ? { marginBottom: "-32px" } : { marginBottom: "-36px" }}
                                onClick={() => { handleDeleteRequirementItem(elementUUID, index) }}
                                variant="contained"
                            >
                                <Tooltip
                                    title={"Delete " + capitalizedKey}
                                    id={"delete" + capitalizedKey + "Tooltip"}
                                >
                                    <DeleteForeverRoundedIcon htmlColor={ styling.secondaryColor } sx={ icons.large }/>
                                </Tooltip>
                            </IconButton>
                        </div>
                    </span>
                </div>
            </div>
        )
    }
    const getCurrentSection = (type, uuid, value, index, currentSection) => {
        const { elementTitle } = props
        if (elementTitle && elementTitle !== "") {
            let style = {
                marginTop: index === 0 ? 12: 4,
                marginBottom: 2
            }

            switch (type) {
                case "description": {
                    let delta = typeof value === "string" ? value : new Delta(value)
                    return (
                        <div className="w-full mb-[-4px]" key={`element-title-section-${uuid}-${index}-${type}`} >
                            <TextEditor
                                text={delta}
                                contentType={"requirement"}
                                elementData={{ uuid: uuid, index: index }}
                                handleTextUpdate={handleUpdateFields}
                            />
                        </div>
                    )
                }
                case "selections": {
                    let selectable = currentSection[index].selections ? currentSection[index].selections : ""
                    let selectables = JSON.parse(JSON.stringify(props.getSelectablesMaps())).dropdownOptions
                    let selectionOptions = [...new Set([...selectables.groups, ...selectables.complexSelectables])]
                    return (
                        <div style={style} key={`element-title-section-${uuid}-${index}-${type}`}>
                            <FormControl fullWidth color={styling.secondaryTextField}>
                                <InputLabel key="selectables-requirement-label">Select Selectables</InputLabel>
                                <Select
                                    value={selectable ? selectable : ""}
                                    label="Select Selectables"
                                    autoWidth
                                    onChange={(event) => {
                                        handleSelectablesSelection(event, uuid, index)
                                    }}
                                    sx={{ textAlign: "left" }}
                                >
                                    {selectionOptions.map((value) => (
                                        getMenuItems(value, styling.primaryMenu)
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    )
                }
                case "text": {
                    return (
                        <div style={style} key={`element-title-section-${uuid}-${index}-${type}`}>
                            <FormControl fullWidth>
                                <TextField
                                    color={styling.secondaryTextField}
                                    key={value}
                                    label={"Additional Text"}
                                    defaultValue={value}
                                    onBlur={(event) => {
                                        let update = { text: event.target.value }
                                        handleUpdateFields(update, uuid, index, "update")
                                    }}
                                />
                            </FormControl>
                        </div>
                    )
                }
                case "assignment": {
                    let assignmentOptions = JSON.parse(JSON.stringify(props.getSelectablesMaps().dropdownOptions.assignments))
                    let assignmentValue = props.getSelectablesMaps().uuidMap.assignments[value]
                    return (
                        <div style={style} key={`element-title-section-${uuid}-${index}-${type}`}>
                            <FormControl fullWidth required color={styling.secondaryTextField}>
                                <InputLabel id={`assignment-label-${uuid}-${index}`}>Assignment</InputLabel>
                                <Select
                                    value={assignmentValue ? assignmentValue : ""}
                                    label="Assignment"
                                    autoWidth
                                    onChange={(event) => {
                                        handleAssignmentSelection(event, uuid, index)
                                    }}
                                    sx={{ textAlign: "left" }}
                                >
                                    {assignmentOptions.map((value) => (
                                        getMenuItems(value, styling.primaryMenu)
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    )
                }
                case "tabularize": {
                    const tabularizeItems = props.getElementValuesByType("tabularize")

                    return (
                        isTitleAndFcs ?
                            <div style={style} key={`tabularize-title-section-${uuid}-${index}-${type}`}>
                                <FormControl fullWidth required color={styling.secondaryTextField}>
                                    <InputLabel id={`tabularize-label-${uuid}-${index}`}>Crypto Selection Table</InputLabel>
                                    <Select
                                        value={value}
                                        label="Crypto Selection Table"
                                        autoWidth
                                        onChange={(event) => { handleTabularizeSelection(event, uuid, index) }}
                                        sx={{
                                            textAlign: "left",
                                            wordBreak: 'break-word',
                                            whiteSpace: 'normal',
                                            overflowWrap: 'break-word',
                                        }}
                                    >
                                        {
                                            Object.entries(tabularizeItems).map(([tabularizeUUID, item]) => {
                                                let title = `${item.title} (${item.id})`
                                                return (
                                                    <MenuItem
                                                        sx={{
                                                            ...styling.primaryMenu,
                                                            fontSize: "13px",
                                                            wordBreak: 'break-word',
                                                            whiteSpace: 'normal',
                                                            overflowWrap: 'break-word',
                                                        }}
                                                        key={tabularizeUUID}
                                                        value={tabularizeUUID}
                                                    >
                                                        {title}
                                                    </MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                            :
                            null
                    )
                }
                default:
                    return null
            }
        }
    }
    const showTitlePreview = (previewToggle) => {
        const { requirementType, sfrUUID, elementUUID, componentUUID, cryptoColumnName, rowIndex } = props

        if (requirementType === "title") {
            let section = ""
            try {
                if (previewToggle) {
                    // Get the element selectables, selectableGroups and title
                    let initialElementValues = dispatch(GET_SFR_ELEMENT_VALUES_FOR_TITLE({
                        sfrUUID: sfrUUID,
                        componentUUID: componentUUID,
                        elementUUID: elementUUID
                    }))
                    if (initialElementValues.payload.element) {
                        const elementTitleValues = initialElementValues.payload.element
                        const selectable = dispatch(GET_REQUIREMENTS_TITLE_PREVIEW({
                            selectables: elementTitleValues.selectables ? elementTitleValues.selectables : {},
                            selectableGroups: elementTitleValues.selectableGroups ? elementTitleValues.selectableGroups : {},
                            title: elementTitleValues.title,
                            tabularize: elementTitleValues.tabularize ? elementTitleValues.tabularize : {}
                        }))
                        if (selectable.payload.titleSection) {
                            section = selectable.payload.titleSection
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            }

            // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
            // would be omitted by the quill editor due to not knowing how to interpret them)
            return (
                <div className="preview">
                    {removeTagEqualities(section, true)}
                </div>
            )
        } else if (requirementType === "managementFunctions") {
            const currentManagementFunction = props.getCurrentManagementFunction("textArray")
            return props.showManagementFunctionPreview(previewToggle, currentManagementFunction, rowIndex)
        } else if (requirementType === "crypto") {
            const textArray = row[cryptoColumnName] ? JSON.parse(JSON.stringify(row[cryptoColumnName])) : []
            return props.showTabularizeTablePreview(previewToggle, textArray, rowIndex)
        }
    }
    const getMenuItems = (value, styling) => {
        if ((value === "Crypto Selection Table" && isTitleAndFcs) || value !== "Crypto Selection Table") {
          return (
              <MenuItem
                  sx={styling}
                  key={value}
                  value={value}
              >
                  {value}
              </MenuItem>
          )
        }
    }

    // Use Memos
    const getRequirements = useMemo(
        () => {
            if (!previewToggle || requirementsChange) {
                return getRequirementBody()
            }
        }, [previewToggle, requirementsChange, props.component, selectedColumn, isTitleAndFcs]
    )

    // Return Method
    return (
        <div className="min-w-full">
            <CardTemplate
                type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-6px]">
                        <span className="flex justify-stretch min-w-full">
                            <div className="flex justify-center w-full pl-4">
                                <Tooltip
                                    id={"requirementDescriptionTooltip"}
                                    title={`This is the primary section for the definition of the ${description} text. This section 
                                            consists of descriptive text, complex selections, selections, selection groups 
                                            ${additionalDescription} and assignments.`}
                                    arrow
                                >
                                    <label
                                        style={{color: styling.primaryColor}}
                                        className="resize-none font-bold text-[14px] pr-6 mt-[8px]"
                                    >
                                        {title}
                                    </label>
                                </Tooltip>
                            </div>
                            <div className="flex justify-end w-[0px] pr-2">
                                <Stack
                                    direction="row"
                                    component="label"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography
                                        noWrap
                                        style={styling.largeToggleTypography}
                                    >
                                        Preview
                                    </Typography>
                                    <Tooltip arrow placement={"top"} id={"requirementsPreviewToggleTooltip"}
                                             title={
                                                 <div>
                                                     <h1>
                                                         {`Toggling this allows a user to see what the fully constructed 
                                                         ${description} text will look like when exported. Use this to see what the 
                                                         selection below will look like.`}
                                                     </h1>
                                                     <br/>
                                                     <h1>* Note: Results may vary</h1>
                                                 </div>
                                             }
                                    >
                                        <Switch
                                            sx={previewToggle ? styling.secondaryToggleSwitch : {}}
                                            checked={previewToggle}
                                            onChange={handlePreviewToggle}
                                        />
                                    </Tooltip>
                                </Stack>
                            </div>
                        </span>
                    </div>
                }
                body={ previewToggle ?
                    <div id="requirements-title-preview" className="min-w-full">{showTitlePreview(previewToggle)}</div>
                    :
                    <div className="min-w-full">
                        {getRequirements}
                        <div className="border-t-2 border-gray-200 m-0 p-0 pt-2 mx-[-16px]">
                            <div className="p-2 px-4">
                                <span className="min-w-full inline-flex items-baseline">
                                    <div className="w-[94%]">
                                        <FormControl fullWidth color={styling.primaryTextField}>
                                            <InputLabel key="element-requirement-type-select-label">
                                                {`Add to ${title}`}
                                            </InputLabel>
                                            <Select
                                                value={selectedRequirementType}
                                                label={`Select ${title}`}
                                                autoWidth
                                                onChange={(event) => handleSetSelectedRequirementType(event.target.value)}
                                                sx={{ textAlign: "left" }}
                                            >
                                                {requirementMenu.map((requirement) => (
                                                    getMenuItems(requirement, styling.secondaryMenu)
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="w-[6%]">
                                        <IconButton
                                            sx={{ marginBottom: "-36px" }}
                                            onClick={handleAddNewRequirement}
                                            variant="contained"
                                        >
                                            <Tooltip
                                                id="addNewRequirementItemTooltip"
                                                title={`This allows a user to add one of several options to the ${description}.`}>
                                                <AddCircleIcon htmlColor={ styling.primaryColor } sx={ icons.medium }/>
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
    )
}

// Export SfrRequirementCard.jsx
export default SfrRequirementCard;