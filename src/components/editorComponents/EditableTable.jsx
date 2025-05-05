// Imports
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AgGridReact } from 'ag-grid-react';
import { Checkbox, Chip, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Select, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { deepCopy } from "../../utils/deepCopy.js";
import SecurityComponents from "../../utils/securityComponents.jsx";
import AddColumnIcon from '../../icons/AddColumnIcon.svg';
import AddRowIcon from '../../icons/AddRowIcon.svg';
import DeleteColumnIcon from '../../icons/DeleteColumnIcon.svg';
import DeleteRowIcon from '../../icons/DeleteRowIcon.svg';
import CardTemplate from "./securityComponents/CardTemplate.jsx";
import MultiSelectDropdown from "./securityComponents/MultiSelectDropdown.jsx";
import NewTableColumn from "../modalComponents/NewTableColumn.jsx";

/**
 * The EditableTable component
 * @param props         the import props
 * @returns {Element}   the element
 * @constructor         passes in props to the className
 */
function EditableTable(props) {
    // Prop Types
    EditableTable.propTypes = {
        title: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.string.isRequired]),
        editable: PropTypes.object.isRequired,
        columnData: PropTypes.array.isRequired,
        innerColumnData: PropTypes.array,
        requiredFields: PropTypes.array,
        rowData: PropTypes.array.isRequired,
        disableCard: PropTypes.bool,
        isTitleEditable: PropTypes.bool,
        buttonTooltip: PropTypes.string,
        isManagementFunction: PropTypes.bool,
        isTabularizeTable: PropTypes.bool,
        editFullRow: PropTypes.bool,
        handleNewTableRow: PropTypes.func,
        handleUpdateTableRow: PropTypes.func,
        handleDeleteTableRows: PropTypes.func,
        handleAddNewTableColumn: PropTypes.func,
        handleRemoveTableColumn: PropTypes.func,
        handleCellButtonClick: PropTypes.func,
        handleUpdateTitle: PropTypes.func,
        handleCheckboxClick: PropTypes.func,
        handleCollapseInnerTableSection: PropTypes.func,
        handleEditFullRow: PropTypes.func,
        handleDropdownMenuSelect: PropTypes.func,
        handleMultiSelectDropdown: PropTypes.func,
        showPreview: PropTypes.func,
        bottomBorderCss: PropTypes.string,
        styling: PropTypes.object,
        requirementType: PropTypes.string,
        tableInstructions: PropTypes.string,
        dropdownMenuOptions: PropTypes.array,
        multiSelectMenuOptions: PropTypes.array
    }

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } = SecurityComponents
    const gridRef = useRef();
    const { primary, secondary, grayText, icons, checkboxPrimaryNoPad, checkboxSecondaryNoPad } = useSelector((state) => state.styling);
    const [newColumnDialog, setNewColumnDialog] = useState(false);
    const [collapseTable, setCollapseTable] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [editable, setEditable] = useState(false);
    const [innerStyling, setInnerStyling] = useState({
        primaryColor: primary,
        secondaryColor: secondary,
        checkbox: checkboxPrimaryNoPad,
    })

    // Use Effects
    useEffect(() => {
        handleProps(props)
    }, [props]);

    // Methods
    const handleProps = (props) => {
        // Set styling
        const { styling } = props
        let newStyling = {}

        // Check for styling prop
        if (styling) {
            const { requirementType } = props
            const { primaryColor, secondaryColor } = styling
            const isNotTile = requirementType !== undefined && (requirementType === "crypto" || requirementType === "managementFunctions")
            const checkbox = isNotTile ? checkboxSecondaryNoPad : checkboxPrimaryNoPad

            // Update new styling value
            newStyling = {
                primaryColor: secondaryColor ? secondaryColor : secondary,
                secondaryColor: primaryColor ? primaryColor : primary,
                checkbox: checkbox,
            }

            // Update styling
            if (JSON.stringify(newStyling) !== JSON.stringify(styling)) {
                setInnerStyling(newStyling)
            }
        }

        // Set column data
        if (props.columnData && props.columnData.length > 0) {
            const colDefs = props.columnData.map((column) => {
                const { headerName, field, editable, resizable, flex, type } = column
                const headerTooltip = column.hasOwnProperty("headerTooltip") ? column.headerTooltip : null
                const children = column.hasOwnProperty("children") ? column.children : null
                const style = Object.keys(newStyling).length > 0 ? newStyling : styling
                return getColumnDataByType(headerName, field, editable, resizable, flex, type, headerTooltip, children, style)
            })
            if (JSON.stringify(columnDefs) !== JSON.stringify(colDefs)) {
                setColumnDefs(colDefs);
            }
        }

        // Set row data
        if (JSON.stringify(props.rowData) !== JSON.stringify(rowData)) {
            setRowData(props.rowData)
        }

        // Set editable
        const { addColumn, addRow, removeColumn, removeRow } = props.editable
        if (addColumn || addRow || removeColumn || removeRow) {
            setEditable(true);
        }
    }
    const addRow = () => {
        // Close the menu
        handleMenuClose();

        // Add new table row
        props.handleNewTableRow()

        // Update snackbar
        if (!props.isTabularizeTable) {
            handleSnackBarSuccess("New Row Successfully Added")
        }
    }
    const removeSelectedRow = () => {
        const selectedNodes = gridRef.current.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        let newData = rowData.filter(row => !selectedData.includes(row));
        newData.forEach(obj => {
            delete obj['index'];
        });

        // Close the menu
        handleMenuClose();

        // Delete the table rows
        props.handleDeleteTableRows(newData, selectedData)

        // Update snackbar
        if (!props.isTabularizeTable) {
            const dataLength = selectedData.length
            const message = dataLength > 1 ?
                `Selected ${dataLength} Rows were Successfully Removed` :
                "Selected Row Successfully Removed"

            // Update snackbar
            handleSnackBarSuccess(message)
        }
    }
    const addColumn = async (columnName) => {
        const field = createFieldValue(columnName)
        const newColumn = { headerName: columnName, field: field, editable: true };

        // Close the menu
        handleMenuClose();

        // Add new table column
        props.handleAddNewTableColumn([...columnDefs, newColumn])

        // Update snackbar
        handleSnackBarSuccess(`New Column "${columnName}" Successfully Added`)
    }
    const removeLastColumn = () => {
        if (columnDefs.length > 0) {
            const lastIndex = columnDefs.length - 1;
            const lastField = columnDefs[lastIndex].field;
            // Check for required fields and send an alert if the last column has the required field
            if (props.requiredFields && props.requiredFields.length > 0 && props.requiredFields.includes(lastField)) {
                const headerName = columnDefs[lastIndex].headerName;
                const errorMessage = `Error - Cannot delete. The column "${headerName}" is required.`

                // Update snackbar
                handleSnackBarError(errorMessage)
            } else {
                // Remove last column
                const newColumnDefs = columnDefs.slice(0, -1);

                // Remove last field from rows
                let newRowDefs = deepCopy(rowData)
                newRowDefs.forEach(obj => {
                    delete obj[lastField];
                });

                // Close the menu
                handleMenuClose();

                // Return updates
                props.handleRemoveTableColumn(newColumnDefs, newRowDefs)

                // Update snackbar
                handleSnackBarSuccess("Last Column Successfully Removed")
            }
        }
    }
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleMenuClose = () => {
        setAnchorEl(null);
    }
    const handleCollapseTable = () => {
        setCollapseTable(!collapseTable);
        if (props.handleCollapseInnerTableSection) {
            props.handleCollapseInnerTableSection()
        }
    }
    const handleOpenNewColumnDialog = () => {
        // Close the menu
        handleMenuClose();

        // Update the new column dialog
        setNewColumnDialog(!newColumnDialog);
    }
    const onRowDoubleClicked = (params) => {
        if (props.editFullRow) {
            const rowIndex = params.node.rowIndex
            props.handleEditFullRow(rowIndex, params)
        }
    };

    // Helper Methods
    const getMenuItem = (handler, label, icon, iconSize) => {
        const { color } = icons
        const iconColor = innerStyling.primaryColor === primary ? color.primary : color.secondary

        return (
            <MenuItem
                key={label}
                value={label}
                onClick={handler}
            >
                <ListItemIcon>
                    <img
                        src={icon}
                        style={{ ...iconSize, ...iconColor }}
                    />
                </ListItemIcon>
                <ListItemText>
                    {label}
                </ListItemText>
            </MenuItem>
        )
    }
    const createFieldValue = (originalString) => {
        originalString = originalString.trim().replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '');
        return originalString.charAt(0).toLowerCase() + originalString.slice(1);
    }
    const getColumnDataByType = (headerName, field, editable, resizable, flex, type, headerTooltip, children, style) => {
        let columnData = {
            headerName: headerName,
            field: field,
            editable: editable,
            resizable: resizable,
            flex: flex ? flex : resizable ? 1 : 0,
            autoHeight: true,
            cellStyle: {
                lineHeight: '1.5',
                paddingTop: '12px',
                paddingBottom: '10px',
                textAlign: 'start'
            }
        }
        let dropdownMenu = props.dropdownMenuOptions ? deepCopy(props.dropdownMenuOptions) : []

        // Add header tooltip if one was provided
        if (headerTooltip) {
            columnData.headerTooltip = headerTooltip;
        }

        // Remove cell border on click if the edit full row has been selected
        if (props.editFullRow) {
            columnData.suppressCellFocus = true
            columnData.cellClass = 'no-border'
        }

        // Format children data if it is present
        if (children) {
            if (children.length > 0) {
                children = children.map((child) => {
                    const { headerName, field, editable, resizable, flex, type } = child
                    const innerChildren = child.hasOwnProperty("children") ? child.children : null
                    return getColumnDataByType(headerName, field, editable, resizable, flex, type, headerTooltip, innerChildren, style)
                })
            }
            columnData.children = children
        }

        // Add more column data based on type
        let additionalColumnData = {}
        switch (type) {
            case "Index": {
                additionalColumnData = {
                    valueGetter: (params) => params.node.rowIndex + 1,
                }
                break;
            }
            case "Number": {
                additionalColumnData = {
                    cellEditor: 'agNumberCellEditor',
                    cellEditorParams: {
                        precision: 2,
                        step: 0.1,
                        showStepperButtons: true
                    },
                    filter: 'agNumberColumnFilter',
                    valueParser: (params) => {
                        const newValue = Number(params.newValue);
                        return isNaN(newValue) ? null : newValue;
                    }
                }
                break;
            }
            case "Button":
            case "Title":
            case "Editor": {
                const isTitleButton = (type === "Button" && !props.isManagementFunction && !props.isTabularizeTable)

                additionalColumnData = {
                    cellEditor: 'agTextCellEditor',
                    cellEditorParams: {
                        maxLength: 100
                    },
                    cellStyle: {
                        ...columnData.cellStyle,
                        fontSize: type === "Title" || isTitleButton ? '13px' : '14px',
                        color: type === "Title" || isTitleButton ? primary : 'black',
                        fontWeight: type === "Title" || isTitleButton ? 'bold' : 'normal'
                    },
                    onCellDoubleClicked: (event) => {
                        if (type === "Button" && (props.isManagementFunction)) {
                            props.handleCellButtonClick(event)
                        }
                    },
                    cellRenderer: (params) => {
                        return getCellRenderer(type, params, props)
                    }
                }
                break;
            }
            case "Large Editor": {
                additionalColumnData = {
                    cellEditor: 'agLargeTextCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: {
                        maxLength: 500
                    },
                    cellRenderer: (params) => {
                        const { value } = params;
                        return (
                            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: value }} />
                        )
                    }
                }
                break;
            }
            case "Date": {
                additionalColumnData = {
                    cellEditor: 'agDateStringCellEditor',
                    cellDataType: 'dateString',
                    cellEditorParams: {
                        useFormatter: true,
                    },
                    valueFormatter: (params) => {
                        return params.value ? new Date(params.value).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ""
                    },
                }
                break;
            }
            case "Inner Table": {
                additionalColumnData = {
                    cellRenderer: (params) => {
                        const editable = { addColumn: false, addRow: false, removeColumn: false, removeRow: false }
                        return (
                            <div className="mb-[5px]">
                                <EditableTable
                                    title={""}
                                    editable={editable}
                                    columnData={props.innerColumnData}
                                    rowData={params.value}
                                    disableCard={true}
                                    styling={{
                                        ...style,
                                        primaryColor: style && style.primaryColor === primary ? secondary : primary,
                                        secondaryColor: style && style.secondaryColor === secondary ? primary : secondary
                                    }}
                                />
                            </div>
                        );
                    }
                }
                break;
            }
            case "Multiline": {
                additionalColumnData = {
                    cellRenderer: (params) => {
                        const { value } = params;
                        return (
                            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: value }} />
                        );
                    }
                }
                break;
            }
            case "Chips": {
                additionalColumnData = {
                    autoHeight: true,
                    cellRenderer: (params) => {
                        return (
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                {params.value.map((chip, index) => (
                                    <Tooltip key={index} title={chip}>
                                        <Chip label={chip} style={{ margin: 2 }} />
                                    </Tooltip>
                                ))}
                            </div>
                        )
                    }
                }
                break;
            }
            case "Checkbox": {
                additionalColumnData = {
                    autoHeight: true,
                    cellRenderer: (params) => {
                        const type = params.colDef.field;
                        const { uuid } = params.data

                        return (
                            <div className="text-center">
                                <Checkbox
                                    checked={params.value !== undefined ? params.value : false}
                                    size={"small"}
                                    sx={style.checkbox}
                                    onChange={(event) => {
                                        props.handleCheckboxClick(event, type, uuid)
                                    }}
                                />
                            </div>
                        )
                    }
                }
                break;
            }
            case "Select": {
                additionalColumnData = {
                    dropdownMenu: dropdownMenu,
                    autoHeight: true,
                    cellRenderer: (params) => {
                        const type = params.colDef.field;
                        const { uuid } = params.data
                        const rowIndex = params.node.rowIndex
                        const color = props.styling.primaryColor === primary ? "primary" : "secondary"
                        let selectValue = ""

                        // Update select value if it is an object
                        const paramsIsString = params.value !== undefined && typeof params.value === "string"
                        const paramsIsObject = params.value !== undefined && typeof params.value !== "string" && params.value.hasOwnProperty("label")
                        if (paramsIsString) {
                            selectValue = params.value
                        } else if (paramsIsObject) {
                            selectValue = params.value.label
                        }

                        return (
                            <div>
                                <Select
                                    fullWidth
                                    value={selectValue}
                                    onChange={(event) => {
                                        event.rowIndex = rowIndex
                                        props.handleDropdownMenuSelect(event, type, uuid)
                                    }}
                                    color={color}
                                >
                                    {dropdownMenu.map((value) => {
                                        if (typeof value === "string") {
                                            return (
                                                <MenuItem
                                                    key={value}
                                                    value={value}
                                                    sx={props.styling.primaryMenu}
                                                >
                                                    {value}
                                                </MenuItem>
                                            )
                                        } else {
                                            let { key, label, disabled } = value

                                            return (
                                                <MenuItem
                                                    key={key}
                                                    value={label}
                                                    sx={props.styling.primaryMenu}
                                                    disabled={disabled}
                                                >
                                                    {label}
                                                </MenuItem>
                                            )
                                        }
                                    })}
                                </Select>
                                );
                            </div>
                        )
                    }
                }
                break;
            }
            case "Multiselect": {
                additionalColumnData = {
                    autoHeight: true,
                    cellRenderer: (params) => {
                        const { uuid, disabled, multiselect } = params.data

                        return (
                            <span className="flex justify-stretch min-w-full pb-2">
                                <MultiSelectDropdown
                                    index={uuid}
                                    selectionOptions={props.multiSelectMenuOptions}
                                    selections={params.value !== undefined ? params.value : []}
                                    title={""}
                                    handleSelections={props.handleMultiSelectDropdown}
                                    multiple={multiselect !== undefined ? multiselect : true}
                                    required={true}
                                    disabled={disabled}
                                    style={props.styling === "primary" ? "secondary" : "primary"}
                                />
                            </span>
                        )
                    }
                }
                break;
            }
            default:
                break;
        }
        return { ...columnData, ...additionalColumnData }
    }
    const getCellRenderer = (type, params, props) => {
        const { value, data, node } = params;
        if (props.isManagementFunction || props.isTabularizeTable) {
            if (type === "Button") {
                return (
                    <div>
                        {props.showPreview(true, value, node.rowIndex)}
                    </div>
                )
            } else if (type === "Editor") {
                return (
                    <div style={{ whiteSpace: 'normal', lineHeight: "1.5", margin: 0, padding: 0 }}>
                        {value}
                    </div>
                )
            }
        }
        if (type === "Button") {
            return (
                <Tooltip
                    title={props.buttonTooltip ? props.buttonTooltip : ""} id={"auditTableButton"}
                >
                    <button onClick={() => {
                        props.handleCellButtonClick(data)
                    }}>{value}</button>
                </Tooltip>
            )
        } else {
            return (
                <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: value }} />
            )
        }
    }
    const getAgGrid = () => {
        const maxHeight = props.disableCard === true ? '400px' : '500px';
        return (
            <div
                style={{ width: '100%', maxHeight: maxHeight, overflowY: 'auto', overflowX: 'auto', '--ag-header-foreground-color': innerStyling.secondaryColor }}
                className={`ag-theme-quartz`}
            >
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    groupSelectsChildren={true}
                    rowSelection="multiple"
                    domLayout="autoHeight"
                    enableBrowserToolips={true}
                    tooltipShowDelay={200}
                    suppressNoRowsOverlay={true}
                    defaultColDef={{ editable: true }}
                    popupParent={document.querySelector('body') || undefined}
                    onCellValueChanged={(event) => {
                        console.log("Row text")
                        props.handleUpdateTableRow(event)
                    }}
                    onRowDoubleClicked={onRowDoubleClicked}
                    editType={props.editFullRow ? "fullRow" : ""}
                    stopEditingWhenCellsLoseFocus={true}
                />
            </div>
        )
    }

    // Return Method
    return (
        <div className="ag-theme-quartz">
            {props.disableCard ?
                <div>
                    {getAgGrid()}
                </div>
                :
                <div>
                    <NewTableColumn
                        open={newColumnDialog}
                        handleOpen={handleOpenNewColumnDialog}
                        handleSubmit={addColumn}
                        columnDefs={columnDefs}
                    />
                    <CardTemplate
                        type={"parent"}
                        tooltip={"Table"}
                        collapseIconColor={innerStyling.primaryColor}
                        header={
                            <div className="w-full p-0 m-0">
                                <span className="flex justify-between min-w-full">
                                    <div className="flex justify-start w-full">
                                        {props.isTitleEditable ?
                                            <textarea
                                                style={{ color: innerStyling.primaryColor }}
                                                className="w-full resize-none font-bold text-[14px] mb-0 h-[25px] p-0"
                                                onBlur={(event) => handleSnackbarTextUpdates(props.handleUpdateTitle, event)}
                                                defaultValue={props.title} />
                                            :
                                            <label
                                                style={{ color: innerStyling.primaryColor }}
                                                className="font-bold text-[14px] p-0 pr-4 text-secondary"
                                            >
                                                {props.title}
                                            </label>
                                        }
                                    </div>
                                    <div className="flex justify-end pr-4 w-full">
                                        <IconButton
                                            sx={{ marginTop: "-8px", display: !collapseTable || !editable ? 'none' : null }}
                                            variant="contained"
                                            aria-controls={openMenu ? 'basic-menu' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={openMenu ? 'true' : undefined}
                                            onClick={handleMenuClick}
                                        >
                                            <Tooltip
                                                title={`Edit Table`}
                                                id={"editTableButton"}
                                            >
                                                <MenuIcon
                                                    htmlColor={innerStyling.primaryColor}
                                                    sx={icons.large}
                                                />
                                            </Tooltip>
                                        </IconButton>
                                    </div>
                                </span>
                            </div>
                        }
                        collapse={collapseTable}
                        collapseHandler={handleCollapseTable}
                        body={
                            <div className="min-w-full p-4 pb-2">
                                <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    <MenuList className="m-0 p-0">
                                        {props.editable.addColumn ?
                                            getMenuItem(handleOpenNewColumnDialog, "Add Column", AddColumnIcon, icons.medium)
                                            :
                                            null
                                        }
                                        {props.editable.addRow ?
                                            getMenuItem(addRow, "Add Row", AddRowIcon, icons.medium)
                                            :
                                            null
                                        }
                                        {props.editable.removeColumn ?
                                            getMenuItem(removeLastColumn, "Remove Last Column", DeleteColumnIcon, icons.large)
                                            :
                                            null
                                        }
                                        {props.editable.removeRow ?
                                            getMenuItem(removeSelectedRow, "Remove Selected Row", DeleteRowIcon, icons.extraLarge)
                                            :
                                            null
                                        }
                                    </MenuList>
                                </Menu>
                                {
                                    props.tableInstructions ?
                                        <div className="pb-4 break-words text-left" style={{ color: grayText }}>
                                            {props.tableInstructions}
                                        </div>
                                        :
                                        null
                                }
                                {getAgGrid()}
                            </div>
                        }
                        bottomBorderCss={props.bottomBorderCss ? props.bottomBorderCss : ""}
                    />
                </div>
            }
        </div>
    )
}

// Export EditableTable.jsx
export default EditableTable;