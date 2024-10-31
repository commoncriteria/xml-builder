// Imports
import { v4 as uuidv4 } from "uuid";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { CREATE_FIELD_VALUE, RESET_TABULARIZE_UI, TRANSFORM_TABULARIZE_DATA } from "../../reducers/SFRs/tabularizeUI.js";
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle.js"
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import Modal from "./Modal.jsx";
import ResetDataConfirmation from "./ResetDataConfirmation.jsx";

/**
 * The EditTabularizeDefinitionModal class that displays the higher level tabularize table data
 * @returns {JSX.Element}   the new column header modal content
 * @constructor             passes in props to the class
 */
function EditTabularizeDefinitionModal(props) {
    // Prop Validation
    EditTabularizeDefinitionModal.propTypes = {
        open: PropTypes.bool.isRequired,
        elementUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        tabularizeUUID: PropTypes.string,
        handleOpen: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
        updateTabularizeTableUI: PropTypes.func.isRequired,
        getTabularizeObject: PropTypes.func.isRequired,
    };

    // Constants
    const dispatch = useDispatch();
    const { secondary, primary, primaryMenu, icons } = useSelector((state) => state.styling);
    const { tabularize } = useSelector((state) => state);
    const { title, titleError, titleHelperText, id, idError, idHelperText, definition, componentType, selectType } = useSelector((state) => state.tabularize);
    const [disabled, setDisabled] = useState(true);
    const [deleteComponentModal, setDeleteComponentModal] = useState({
        open: false,
        index: null
    });
    const componentMenu = ["Column Header", "Requirements Text"]
    const selectTypeMenu = ["Selectables", "Text"]
    const formControlParentStyle = "w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2"

    // Use Effects
    useEffect(() => {
        setDisabled(getDisabled())
    }, [tabularize])

    // Methods
    const handleOpen = async () => {
        // Reset the initial values
        await dispatch(RESET_TABULARIZE_UI())

        // Close the dialog
        props.handleOpen();
    }
    const handleSubmit = async () => {
        // Handle submit
        const itemMap = {
            title: title ? title : "",
            id: id ? id : "",
            definition: definition ? definition : [],
            type: "reverse"
        }

        // Get new tabularize object and then create new or update item
        const newTabularize = JSON.parse(JSON.stringify(dispatch(TRANSFORM_TABULARIZE_DATA(itemMap)).payload.tabularize));
        if (newTabularize && Object.keys(newTabularize).length > 0) {
            const {elementUUID, componentUUID, tabularizeUUID} = props
            let tabularize = props.getTabularizeObject()
            const uuid = tabularizeUUID && tabularize.hasOwnProperty(tabularizeUUID) ? tabularizeUUID : uuidv4()
            tabularize[uuid] = newTabularize

            // Update tabularize item
            let itemMap = {
                tabularize: tabularize,
            }
            props.updateSfrSectionElement(elementUUID, componentUUID, itemMap)
        }

        // Close the dialog
        await handleOpen();
    }
    const handleTextUpdate = (event, type) => {
        try {
            const value = event.target.value;
            let itemMap = {
                [type]: value,
            }
            props.updateTabularizeTableUI(itemMap)
        } catch (e) {
            console.log(e)
        }
    }
    const handleComponentTypeSelection = (event) => {
        try {
            const componentType = event.target.value
            props.updateTabularizeTableUI({componentType})
        } catch (e) {
            console.log(e)
        }
    }
    const handleSelectTypeSelection = (event) => {
        try {
            const selectType = event.target.value
            props.updateTabularizeTableUI({selectType})
        } catch (e) {
            console.log(e)
        }
    }
    const handleAddNewTableComponent = () => {
        try {
            if (componentType && componentType !== "") {
                let component = "reqtext"
                if (componentType === "Column Header") {
                    component = selectType && selectType !== "" && selectType === "Selectables" ? "selectcol" : "textcol"
                }

                const updateMap = {
                    selectionType: component,
                    type: "new",
                }

                // Update definition
                updateDefinition(updateMap)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleDefinitionText = (event, index, type) => {
        try {
            const newText = event.target.value

            // Update definition
            const updateMap = {
                selectionType: type,
                newText: newText,
                type: 'update',
                index: index
            }
            updateDefinition(updateMap)
        } catch (e) {
            console.log(e)
        }
    }
    const handleDefinitionSelectionType = (event, index) => {
        try {
            const selectionType = event.target.value

            // Update definition
            const updateMap = {
                selectionType: selectionType,
                index: index,
                type: 'select',
            }

            updateDefinition(updateMap)
        } catch (e) {
            console.log(e)
        }
    }
    const handleDeleteDefinitionItem = (index) => {
        try {
            let currentDefinition = JSON.parse(JSON.stringify(definition))

            // Delete definition item and update rows/columns
            if (currentDefinition[index]) {
                let updateMap = {
                    index: index,
                    type: 'delete'
                }

                // Delete from definition
                updateDefinition(updateMap)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleDeleteComponentModalOpen = () => {
        try {
            const open = !deleteComponentModal.open
            const index = !deleteComponentModal.open ? deleteComponentModal.index : null
            setDeleteComponentModal({
                open: open,
                index: index
            })
        } catch (e) {
            console.log(e)
        }
    }
    const handleDeleteComponentModalSubmit = () => {
        try {
            // Delete the items from the modal
            handleDeleteDefinitionItem(deleteComponentModal.index)

            // Close the modal
            handleDeleteComponentModalOpen()
        } catch (e) {
            console.log(e)
        }
    }

    // Helper Methods
    const updateDefinition = (updateMap) => {
        try {
            let { selectionType, newText, index, type } = updateMap
            let currentDefinition = JSON.parse(JSON.stringify(definition))

            // Update definition based on type
            if (currentDefinition) {
                if (currentDefinition[index]) {
                    if (type === "delete") {
                        currentDefinition.splice(index, 1);
                    } else if (type === "select" && selectionType) {
                        currentDefinition[index].type = selectionType
                        if (selectionType !== "reqtext") {
                            currentDefinition[index].column = defineColumn(selectionType)
                        }
                    } else if (type === "update" && selectionType) {
                        currentDefinition[index].value = newText

                        // Update field value for selectcol or textcol
                        if (selectionType !== "reqtext")  {
                            const value = newText
                            const field = dispatch(CREATE_FIELD_VALUE({value})).payload.field
                            currentDefinition[index].field = field
                        }
                    }
                } else if (type === "new" && selectionType) {
                    const newDefinition = {
                        value: "",
                        type: selectionType,
                        field: "",
                    }

                    // Return new object based on selection type
                    if (selectionType !== "reqtext") {
                        newDefinition.rows = defineRows({ currentDefinition, selectionType, type })
                        newDefinition.column = defineColumn(selectionType)
                    }

                    // Add object to current definition
                    currentDefinition.push(newDefinition)
                }

                // Update definition
                if (JSON.stringify(definition) !== JSON.stringify(currentDefinition)) {
                    props.updateTabularizeTableUI({
                        definition: currentDefinition
                    })
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    const defineRows = (update) => {
        const { currentDefinition, selectionType, type } = update

        if (type === "new" && currentDefinition && currentDefinition.length > 0 && currentDefinition[0].hasOwnProperty("rows")) {
            // Calculate the row length
            const rowCount = currentDefinition[0].rows.length;

            // Generate new rows
            return Array(rowCount).fill().map(() => ({value: selectionType === "selectcol" ? [] : ""}));
        } else if (type === "new") {
            // Return empty array
            return []
        }
    }
    const defineColumn = (selectionType) => {
        return {
            editable: false,
            resizable: true,
            type: selectionType === "textcol" ? "Editor" : "Button",
            flex: selectionType === "textcol" ? 3 : 5
        }
    }
    const getDisabled = () => {
        const currentDefinition = JSON.parse(JSON.stringify(definition))

        // Check for title and id error
        if (titleError || idError) {
            return true
        }

        // Check for definition errors
        return currentDefinition?.filter(x => x.hasOwnProperty("error") && x.error).length > 0
    }

    // Components
    const getDefinitionSection = (value, type, index) => {
        if (type === "selectcol" || type === "textcol") {
            return getColumnHeader(value, type, index)
        } else if (type === "reqtext") {
            return getRequirementsText(value, type, index)
        }
    }
    const getColumnHeader = (value, type, index) => {
        const editingDisabled = value === "Selectable ID" ? true : false
        const currentDefinition = JSON.parse(JSON.stringify(definition))
        const { error, helperText, selectDisabled } = currentDefinition[index]
        const isError = error ? error : false

        return (
            <span className="min-w-full inline-flex items-baseline">
                <div className="w-[74%]">
                    <FormControl fullWidth>
                        <TextField
                            required
                            key={"columnHeaderText" + index}
                            label="Column Header"
                            onBlur={(event) => {
                                handleDefinitionText(event, index, type)
                            }}
                            disabled={editingDisabled}
                            defaultValue={value}
                            error={isError}
                            helperText={helperText ? helperText : ""}
                        />
                    </FormControl>
                </div>
                <div className={editingDisabled ? "w-[26%] pl-4" : "w-[22%] pl-4"}>
                    <FormControl fullWidth color={"primary"}>
                        <InputLabel key="element-select-label">Column Type</InputLabel>
                        <Select
                            sx={{textAlign: "left"}}
                            value={type}
                            label="Column Type"
                            autoWidth
                            disabled={editingDisabled || isError || selectDisabled}
                            onChange={(event) => {
                                handleDefinitionSelectionType(event, index)
                            }}
                        >
                            <MenuItem key={"selectcol"} value={"selectcol"}>Selectables</MenuItem>
                            <MenuItem key={"textcol"} value={"textcol"}>Text</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                {!editingDisabled ?
                    <div className="w-[4%] pl-2">
                        {getDeleteIcon("Delete Column Header", index, error)}
                    </div>
                    :
                    null
                }
            </span>
        )
    }
    const getRequirementsText = (value, type, index) => {
        const error = definition[index].error ? definition[index].error : false
        const helperText = definition[index].helperText ? definition[index].helperText : ""

        return (
            <span className="min-w-full inline-flex items-baseline">
                <div className="w-[96%]">
                    <FormControl fullWidth>
                        <TextField
                            required
                            key={"requirementsText" + index}
                            label="Requirements Text"
                            onBlur={(event) => {
                                handleDefinitionText(event, index, type)
                            }}
                            defaultValue={value}
                            error={error}
                            helperText={helperText}
                        />
                    </FormControl>
                </div>
                <div className="w-[4%] pl-2">
                    {getDeleteIcon("Delete Requirements Text", index)}
                </div>
            </span>
        )
    }
    const getSelectMenu = (label, value, dropdown, handler) => {
        return (
            <FormControl fullWidth color={"secondary"}>
                <InputLabel key={label}>{label}</InputLabel>
                <Select
                    value={value}
                    label={label}
                    autoWidth
                    onChange={handler}
                    sx={{textAlign: "left"}}
                >
                    {dropdown.map(value => (
                        <MenuItem sx={primaryMenu} key={value} value={value}>{value}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        )
    }
    const getDeleteIcon = (label, index) => {
        return (
            <IconButton
                variant="contained"
                sx={{marginBottom: "-32px"}}
                onClick={() => {
                    setDeleteComponentModal({
                        open: true,
                        index: index
                    })
                }}
            >
                <Tooltip
                    title={label}
                    id={`${label} Tooltip`}
                >
                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large}/>
                </Tooltip>
            </IconButton>
        )
    }
    const getResetDataConfirmationText = () => {
        const currentDefinition = JSON.parse(JSON.stringify(definition))
        let confirmationText = "Are you sure that you want to delete this requirements text component?"
        const { open, index } = deleteComponentModal

        if (open && index && currentDefinition && currentDefinition[index]) {
            const {value, type} = currentDefinition[index]
            if (type === "selectcol" || type === "textcol") {
                const typeText = type === "selectcol" ? "select" : "text"
                const columnName = value !== "" ? `the [${value}]` : "this"
                confirmationText = (
                    <div>
                        <Typography>{`Are you sure that you want to delete ${columnName} ${typeText} column component?`}</Typography>
                        <br/>
                        <Typography>Any associated rows and columns will also be deleted.</Typography>
                    </div>
                )
            }
        }
        return confirmationText
    }

    // Return Method
    return (
        <Modal
            title={"Crypto Selection Table Definitions"}
            content={
                <div className="min-w-full justify-items-left grid grid-flow-row auto-rows-max mb-[-16px]">
                    <div style={{zIndex: 1000}} key={"resetComponentConfirmation"}>
                        <ResetDataConfirmation
                            title={"Delete Component Confirmation"}
                            text={getResetDataConfirmationText()}
                            open={deleteComponentModal.open}
                            handleOpen={handleDeleteComponentModalOpen}
                            handleSubmit={handleDeleteComponentModalSubmit}
                        />
                    </div>
                    <div className={formControlParentStyle}>
                        <FormControl fullWidth>
                            <Tooltip
                                arrow
                                id={"tableIDTooltip"}
                                title={"The Table ID"}
                            >
                                <TextField
                                    required
                                    key={"tableIDText"}
                                    label="Table ID"
                                    onBlur={(event) => {
                                        handleTextUpdate(event, "id")
                                    }}
                                    value={id}
                                    error={idError ? idError : false}
                                    helperText={idHelperText ? idHelperText : ""}
                                    onChange={(event) => {
                                        handleTextUpdate(event, "id")
                                    }}
                                />
                            </Tooltip>
                        </FormControl>
                    </div>
                    <div className={formControlParentStyle}>
                        <FormControl fullWidth>
                            <Tooltip
                                arrow
                                id={"tableTitleTooltip"}
                                title={"The Table Title"}
                            >
                                <TextField
                                    required
                                    key={"tableTitleText"}
                                    label="Table Title"
                                    onBlur={(event) => {
                                        handleTextUpdate(event, "title")
                                    }}
                                    value={title}
                                    error={titleError ? titleError : false}
                                    helperText={titleHelperText ? titleHelperText : ""}
                                    onChange={(event) => {
                                        handleTextUpdate(event, "title")
                                    }}
                                />
                            </Tooltip>
                        </FormControl>
                    </div>
                    {definition.map((item, index) => (
                        <div key={`definitionSection${index}`} className={formControlParentStyle}>
                            {getDefinitionSection(item.value, item.type, index)}
                        </div>
                    ))}
                </div>
            }
            dialogActions={
                <div className="m-0 p-0 pt-4 m-[-16px] mb-1 z-30">
                    <div className="border-t-2 border-gray-200 pl-8 pr-4 pt-6 pb-2">
                        <span className="min-w-full inline-flex items-center">
                            <div className={componentType === "Column Header" ? "w-[47%]" : "w-[94%]"}>
                                 {getSelectMenu("Table Component Type", componentType, componentMenu, handleComponentTypeSelection)}
                            </div>
                             { componentType === "Column Header" ?
                                 <div className="w-[47%] pl-4">
                                     {getSelectMenu("Column Type", selectType, selectTypeMenu, handleSelectTypeSelection)}
                                 </div>
                                 :
                                 null
                             }
                             <div className="w-[6%] pl-2">
                                 <IconButton
                                     onClick={handleAddNewTableComponent}
                                     variant="contained">
                                     <Tooltip
                                         title={"Add New Table Component"}
                                         id={"addTableComponentTooltip"}>
                                         <AddCircleIcon htmlColor={primary} sx={icons.medium}/>
                                     </Tooltip>
                                 </IconButton>
                             </div>
                        </span>
                    </div>
                </div>
            }
            disabled={disabled}
            open={props.open}
            handleOpen={handleOpen}
            handleSubmit={handleSubmit}
        />
    );
}

// Export EditTabularizeDefinitionModal.jsx
export default EditTabularizeDefinitionModal;