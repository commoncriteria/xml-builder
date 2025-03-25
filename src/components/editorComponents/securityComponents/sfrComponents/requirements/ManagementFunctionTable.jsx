// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FormControl, TextField } from "@mui/material";
import { GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { GET_MANAGEMENT_FUNCTION_TEXT_PREVIEW } from "../../../../../reducers/SFRs/sfrPreview.js";
import { UPDATE_EVALUATION_ACTIVITY_UI_ITEMS } from "../../../../../reducers/SFRs/evaluationActivitiesUI.js";
import { removeTagEqualities } from "../../../../../utils/fileParser.js";
import CardTemplate from "../../CardTemplate.jsx";
import EditableTable from "../../../EditableTable.jsx";
import EditManagementFunctionTable from "../../../../modalComponents/EditManagementFunctionTable.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";

/**
 * The ManagementFunctionTable class that displays the management function table for the sfr worksheet
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function ManagementFunctionTable(props) {
    // Prop Validation
    ManagementFunctionTable.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
        managementFunctions: PropTypes.object.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
    };

    // Constants
    const { getDeletedRowIds, handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const { id } = props.managementFunctions;
    const [overallID, setOverallID] = useState(id || "");
    const [markers, setMarkers] = useState("");
    const [rowData, setRowData] = useState([])
    const [columnData, setColumnData] = useState([])
    const [openEditModal, setOpenEditModal] = useState(false)
    const [rowIndex, setRowIndex] = useState(0)
    const [rowID, setRowID] = useState("")
    const editable = { addColumn: true, addRow: true, removeColumn: true, removeRow: true }
    const requiredColumns = [
        { headerName: '#', field: 'rowNum', editable: false, resizable: true, type: "Index", flex: 0.5 },
        { headerName: 'ID', field: 'id', editable: true, resizable: true, type: "Editor", flex: 1 },
        { headerName: 'Management Function', field: 'textArray', editable: false, resizable: true, type: "Button", flex: 2 },
    ]
    const requiredFields = ['rowNum', 'id', 'textArray']

    // UseEffects
    useEffect(() => {
        handleProps(props.managementFunctions)
    }, [props.managementFunctions]);

    // Methods
    const handleProps = (managementFunctions) => {
        const { id, tableName, statusMarkers, rows, columns } = managementFunctions;
        if (tableName && JSON.stringify(tableName) !== JSON.stringify(name)) {
            setName(tableName)
        }
        if (statusMarkers && JSON.stringify(statusMarkers) !== JSON.stringify(markers)) {
            setMarkers(statusMarkers)
        }
        if (rows && JSON.stringify(rows) !== JSON.stringify(rowData)) {
            setRowData(rows)
        }
        if (id && JSON.stringify(id) !== JSON.stringify(overallID)) {
            setOverallID(id)
        }

        // If the initial columns are empty add the required columns
        if (typeof columns === "object" && columns.length === 0) {
            setColumnData(requiredColumns)
        } else if (columns && JSON.stringify(columns) !== JSON.stringify(columnData)) {
            setColumnData(columns)
        }
    }
    const handleIDChange = (event) => {
        const currentID = event.target.value

        // Update the management functions
        updateManagementFunction({
            id: currentID
        })
    }
    const handleNameChange = (event) => {
        const currentName = event.target.value

        // Update the management functions
        updateManagementFunction({
            tableName: currentName
        })
    }
    const handleMarkersChange = (event) => {
        const currentMarkers = event

        // Update the management functions
        updateManagementFunction({
            statusMarkers: currentMarkers
        })
    }
    const handleNewTableRow = () => {
        const rowFields = getCurrentFields();
        let newRow = Object.fromEntries(rowFields.map(key =>
            [key, key === "textArray" ? [] : ""]
        ));
        let rows = deepCopy(rowData)

        // Add new rows
        rows.push(newRow)

        // Update the rows
        setRowData(rows)

        // Update the management functions
        updateManagementFunction({
            rows: rows
        })
    }
    const handleUpdateTableRow = (event) => {
        try {
            const {data, rowIndex} = event
            let rows = deepCopy(rowData)

            // Update the application note refIds if the id was updated
            const oldId = deepCopy(rows[rowIndex].id)
            const newId = data.id

            if (oldId && newId && oldId !== newId) {
                updateRefIds(rows, {oldId, newId})
            }

            // Update the rows
            rows[rowIndex] = data
            setRowData(rows)

            // Update the management functions
            updateManagementFunction({
                rows: rows,
            })

            // Update snackbar
            handleSnackBarSuccess("Row Successfully Updated")
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleDeleteTableRows = (rows) => {
        try {
            let originalRows = deepCopy(rowData)
            const deletedRowIds = getDeletedRowIds(originalRows, rows)

            // Update the deleted refIds from the application notes and/or evaluation activities if they were deleted
            updateRefIds(rows, { deletedRowIds })

            // Update the management functions
            updateManagementFunction({
                rows: rows,
            })
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleAddNewTableColumn = (columns) => {
        // Update the columns
        const lastIndex = columns.length - 1;
        const { headerName, field} = columns[lastIndex]
        let updatedColumns = deepCopy(columnData)
        updatedColumns[lastIndex] = {
            headerName: headerName,
            field: field,
            editable: true,
            resizable: true,
            type: "Editor",
            flex: 0.5
        }
        setColumnData(updatedColumns)

        // Update the rows
        let rows = deepCopy(rowData)
        rows.forEach((row) => {
            row[field] = ""
        });
        setRowData(rows)

        // Update the management functions
        updateManagementFunction({
            rows: rows,
            columns: updatedColumns
        })
    }
    const handleRemoveTableColumn = (columns, rows) => {
        const lastIndex = columns.length;
        let updatedColumns = deepCopy(columnData)
        updatedColumns.splice(lastIndex, 1)

        // Update the management functions
        updateManagementFunction({
            rows: rows,
            columns: updatedColumns
        })

        // Update the state
        setColumnData(updatedColumns)
        setRowData(rows)
    }
    const handleCellButtonClick = (event) => {
        const { rowIndex, data } = event
        setRowIndex(rowIndex)
        setRowID(data.id)
        setOpenEditModal(true)
    }
    const handleOpenEditModal = () => {
        let updateMap = {
            selectedUUID: !openEditModal ? props.elementUUID : "",
            selectedEvaluationActivity: !openEditModal ? [props.elementTitle] : [],
        }

        // Update evaluation activity ui
        dispatch(UPDATE_EVALUATION_ACTIVITY_UI_ITEMS({updateMap: updateMap}))

        // Update the open value
        setOpenEditModal(!openEditModal)
    }

    // Helper Methods
    const updateManagementFunction = (data) => {
        let managementFunctions = deepCopy(props.managementFunctions)

        // Update the management functions based on the input data
        Object.entries(data).forEach(([key, value]) => {
            managementFunctions[key] = value
        })
        let itemMap = {
            managementFunctions: {
                ...managementFunctions
            }
        };
        props.updateSfrSectionElement(props.elementUUID, props.componentUUID, itemMap)
    }
    const getCurrentFields = () => {
        const fields = columnData.map(item => item["field"]);
        return fields ? fields : []
    }
    const updateRefIds = (currentRows, inputs) => {
        // Loop through the current rows
        currentRows?.map((row) => {
            const { note: notes, evaluationActivity } = row

            // Loop through and update the notes if there were notable changes
            notes?.map(note => {
                updateRefIdsHelper(note, inputs)
            });

            // Update evaluation activity refIds if there were notable changes
            if (evaluationActivity) {
                updateRefIdsHelper(evaluationActivity, inputs)
            }
        })
    }
    const removeIds = (idsToRemove, targetArray) => {
        // Create a Set from idsToRemove for efficient lookup
        const idsToRemoveSet = new Set(idsToRemove);

        // Filter the targetArray to exclude any IDs present in idsToRemoveSet
        const filteredArray = targetArray.filter(id => !idsToRemoveSet.has(id));

        return filteredArray;
    };
    const updateRefIdsHelper = (value, inputs) => {
        const { oldId, newId, deletedRowIds } = inputs
        let { refIds } = value
        const isDeletedRowIdsValid = deletedRowIds && deletedRowIds.length > 0
        const isRefIdsValid = refIds && refIds.length > 0

        // Update input refIds if the current selection contains items that were deleted
        if (isDeletedRowIdsValid && isRefIdsValid) {
            value.refIds = removeIds(deletedRowIds, refIds)
        }
        // Update the input refIds if the original id has been updated by the user
        else if (oldId && newId) {
            const index = value.refIds.indexOf(oldId);
            if (index !== -1) {
                value.refIds[index] = newId;
            }
        }
    }

    // Components
    const showManagementFunctionPreview = (previewToggle, textArray, rowIndex) => {
        let section = ""
        try {
            if (previewToggle) {
                // Get the element selectables, selectableGroups and management function array
                let initialElementValues = dispatch(GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION({
                    sfrUUID: props.sfrUUID,
                    componentUUID: props.componentUUID,
                    elementUUID: props.elementUUID,
                    textArray: textArray,
                    rowIndex: rowIndex
                }))
                if (initialElementValues.payload.element) {
                    const { selectables, selectableGroups, textArray } = initialElementValues.payload.element
                    let selectable = dispatch(GET_MANAGEMENT_FUNCTION_TEXT_PREVIEW({
                        selectables: selectables ? selectables : {},
                        selectableGroups: selectableGroups ? selectableGroups : {},
                        textArray: textArray ? textArray : [],
                    }))
                    if (selectable.payload.managementFunctionText) {
                        section = selectable.payload.managementFunctionText
                    }
                }
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }

        // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
        // would be omitted by the quill editor due to not knowing how to interpret them)
        return (
            <div className="preview" style={{whiteSpace: 'normal', lineHeight: "1.5", margin: 0, padding: 4, paddingBottom: 10}}>
                {removeTagEqualities(section, true)}
            </div>
        )
    }

    // Return Method
    return (
        <CardTemplate
            type={"section"}
            header={
                <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">Management Functions</label>
            }
            body={
                <div>
                    <FormControl fullWidth>
                        <TextField
                            label={"ID"}
                            color="secondary"
                            defaultValue={overallID}
                            onChange={(event) => handleIDChange(event)}
                            key={"managementFunctionID"}
                            inputProps={{style: {fontSize: 13}}}
                            InputLabelProps={{style: {fontSize: 13}}}
                        />
                    </FormControl>
                    <div className="mt-2 mx-[-16px] pb-[6px]">
                        <CardTemplate
                            className="border-gray-300"
                            type={"section"}
                            header={
                                <label className="resize-none font-bold text-[14px] p-0 pr-4 text-secondary">Status Markers</label>
                            }
                            body={
                                <TipTapEditor
                                    className="w-full"
                                    contentType={"term"}
                                    handleTextUpdate={handleMarkersChange}
                                    text={markers}
                                />
                            }
                        />
                    </div>
                    <EditableTable
                        title={name}
                        editable={editable}
                        columnData={deepCopy(columnData)}
                        requiredFields={requiredFields}
                        rowData={deepCopy(rowData)}
                        isTitleEditable={true}
                        isManagementFunction={true}
                        handleUpdateTitle={handleNameChange}
                        handleNewTableRow={handleNewTableRow}
                        handleUpdateTableRow={handleUpdateTableRow}
                        handleDeleteTableRows={handleDeleteTableRows}
                        handleAddNewTableColumn={handleAddNewTableColumn}
                        handleRemoveTableColumn={handleRemoveTableColumn}
                        handleCellButtonClick={handleCellButtonClick}
                        showPreview={showManagementFunctionPreview}
                        tableInstructions={`To edit a cell, double-click on it. To edit management-specific functions, 
                                            application notes and evaluation activities for a row, double-click on the 
                                            desired cell in the 'Management Function' column.`}
                    />
                    <div className={"z-[1000]"}>
                        <EditManagementFunctionTable
                            rowIndex={rowIndex}
                            title={`Edit Management Function Text (${rowID && rowID !== "" ? rowID : ""})`}
                            open={openEditModal}
                            handleOpen={handleOpenEditModal}
                            sfrUUID={props.sfrUUID}
                            componentUUID={props.componentUUID}
                            component={props.component}
                            elementUUID={props.elementUUID}
                            elementTitle={props.elementTitle}
                            getSelectablesMaps={props.getSelectablesMaps}
                            getElementValuesByType={props.getElementValuesByType}
                            getSelectionBasedArrayByType={props.getSelectionBasedArrayByType}
                            updateSfrSectionElement={props.updateSfrSectionElement}
                            showManagementFunctionPreview={showManagementFunctionPreview}
                        />
                    </div>
                </div>
            }
        />
    )
}

// Export ManagementFunctionTable.jsx
export default ManagementFunctionTable;