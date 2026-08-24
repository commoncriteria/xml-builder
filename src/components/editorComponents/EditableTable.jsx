// Imports
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { Checkbox, Chip, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Select, Tooltip } from "@mui/material";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import MenuIcon from "@mui/icons-material/Menu";
import { deepCopy } from "../../utils/deepCopy.js";
import { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } from "../../utils/securityComponents.jsx";
import { COMMON_REGEX, UI_REGEX } from "../../utils/regexUtils.js";
import AddColumnIcon from "../../icons/AddColumnIcon.svg";
import AddRowIcon from "../../icons/AddRowIcon.svg";
import DeleteColumnIcon from "../../icons/DeleteColumnIcon.svg";
import DeleteRowIcon from "../../icons/DeleteRowIcon.svg";
import CardTemplate from "./securityComponents/CardTemplate.jsx";
import MultiSelectDropdown from "./securityComponents/MultiSelectDropdown.jsx";
import NewTableColumn from "../modalComponents/NewTableColumn.jsx";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

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
    disableColumnSorting: PropTypes.bool,
    isBasePP: PropTypes.bool,
    editFullRow: PropTypes.bool,
    showPreview: PropTypes.func,
    bottomBorderCss: PropTypes.string,
    styling: PropTypes.object,
    requirementType: PropTypes.string,
    tableInstructions: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    dropdownMenuOptions: PropTypes.array,
    multiSelectMenuOptions: PropTypes.array,
    collapse: PropTypes.bool,
    handleNewTableRow: PropTypes.func,
    handleUpdateTableRow: PropTypes.func,
    handleDeleteTableRows: PropTypes.func,
    handleAddNewTableColumn: PropTypes.func,
    handleRemoveTableColumn: PropTypes.func,
    handleCellButtonClick: PropTypes.func,
    handleCellDoubleClick: PropTypes.func,
    handleUpdateTitle: PropTypes.func,
    handleCheckboxClick: PropTypes.func,
    handleCollapseInnerTableSection: PropTypes.func,
    handleEditFullRow: PropTypes.func,
    handleDropdownMenuSelect: PropTypes.func,
    handleMoveTableRows: PropTypes.func,
    handleMultiSelectDropdown: PropTypes.func,
    handleCollapse: PropTypes.func,
  };

  // Constants
  const gridRef = useRef();
  const { primary, secondary, grayText, icons, checkboxPrimaryNoPad, checkboxSecondaryNoPad } = useSelector((state) => state.styling);
  const [newColumnDialog, setNewColumnDialog] = useState(false);
  const [collapseTable, setCollapseTable] = useState(props.hasOwnProperty("collapse") ? props.collapse : false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [rowData, setRowData] = useState([]);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [columnDefs, setColumnDefs] = useState([]);
  const [editable, setEditable] = useState(false);
  const [innerStyling, setInnerStyling] = useState({
    primaryColor: primary,
    secondaryColor: secondary,
    checkbox: checkboxPrimaryNoPad,
  });

  // Use Effects
  useEffect(() => {
    handleProps(props);
  }, [props]);

  // Methods
  /**
   * Handles the props
   * @param props the props
   */
  const handleProps = (props) => {
    // Set styling
    const { styling } = props;
    let newStyling = {};

    // Check for styling prop
    if (styling) {
      const { requirementType, isBasePP } = props;
      const { primaryColor, secondaryColor } = styling;
      const isNotTile = requirementType !== undefined && (requirementType === "crypto" || requirementType === "managementFunctions");
      const checkbox = isNotTile ? checkboxSecondaryNoPad : checkboxPrimaryNoPad;

      // Update new styling value
      if (isBasePP) {
        newStyling = {
          primaryColor: secondary,
          secondaryColor: primary,
        };
      } else {
        newStyling = {
          primaryColor: secondaryColor ? secondaryColor : secondary,
          secondaryColor: primaryColor ? primaryColor : primary,
          checkbox: checkbox,
        };
      }

      // Update styling
      if (JSON.stringify(newStyling) !== JSON.stringify(styling)) {
        setInnerStyling(newStyling);
      }
    }

    // Set column data
    if (props.columnData && props.columnData.length > 0) {
      const colDefs = props.columnData.map((column) => {
        const { headerName, field, editable, resizable, flex, type, dropdownMenuOptions, disabled = false, maxLength } = column;
        const headerTooltip = column.hasOwnProperty("headerTooltip") ? column.headerTooltip : null;
        const children = column.hasOwnProperty("children") ? column.children : null;
        const style = Object.keys(newStyling).length > 0 ? newStyling : styling;
        return getColumnDataByType(
          headerName,
          field,
          editable,
          resizable,
          flex,
          type,
          headerTooltip,
          children,
          style,
          dropdownMenuOptions,
          disabled,
          maxLength
        );
      });
      if (JSON.stringify(columnDefs) !== JSON.stringify(colDefs)) {
        setColumnDefs(colDefs);
      }
    }

    // Set row data
    if (JSON.stringify(props.rowData) !== JSON.stringify(rowData)) {
      setRowData(props.rowData);
      setSelectedRowCount(0);
    }

    // Set editable
    const { addColumn, addRow, moveRow, removeColumn, removeRow } = props.editable;
    if (addColumn || addRow || moveRow || removeColumn || removeRow) {
      setEditable(true);
    }
  };
  /**
   * Handles adding a row
   */
  const handleAddRow = () => {
    // Close the menu
    handleMenuClose();

    // Add new table row
    props.handleNewTableRow();

    // Update snackbar
    if (!props.isTabularizeTable) {
      handleSnackBarSuccess("New Row Successfully Added");
    }
  };
  /**
   * Handles removing a selected row
   */
  const handleRemoveSelectedRow = () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);

    if (selectedData.length === 0) {
      handleSnackBarError("Select at least one row to remove");
      handleMenuClose();
      return;
    }

    let newData = rowData.filter((row) => !selectedData.includes(row));
    newData.forEach((obj) => {
      delete obj["index"];
    });

    // Close the menu
    handleMenuClose();

    // Delete the table rows
    const shouldShowDeleteSuccess = props.handleDeleteTableRows(newData, selectedData) !== false;

    // Update snackbar
    if (!props.isTabularizeTable && shouldShowDeleteSuccess) {
      const dataLength = selectedData.length;
      const message = dataLength > 1 ? `Selected ${dataLength} Rows were Successfully Removed` : "Selected Row Successfully Removed";

      // Update snackbar
      handleSnackBarSuccess(message);
    }
  };
  /**
   * Handles moving selected rows up or down
   * @param {"up"|"down"} direction the direction to move selected rows
   */
  const handleMoveSelectedRows = (direction) => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedIndexes = selectedNodes
      .map((node) => {
        const rowIndex = rowData.findIndex((row) => row === node.data);
        return rowIndex >= 0 ? rowIndex : node.rowIndex;
      })
      .filter((rowIndex) => rowIndex >= 0)
      .sort((a, b) => a - b);

    if (selectedIndexes.length === 0) {
      handleSnackBarError("Select at least one row to move");
      handleMenuClose();
      return;
    }

    let newData = deepCopy(rowData);
    const selectedIndexSet = new Set(selectedIndexes);
    let moved = false;

    if (direction === "up") {
      selectedIndexes.forEach((rowIndex) => {
        if (rowIndex === 0 || selectedIndexSet.has(rowIndex - 1)) return;

        [newData[rowIndex - 1], newData[rowIndex]] = [newData[rowIndex], newData[rowIndex - 1]];
        selectedIndexSet.delete(rowIndex);
        selectedIndexSet.add(rowIndex - 1);
        moved = true;
      });
    } else {
      [...selectedIndexes].reverse().forEach((rowIndex) => {
        if (rowIndex === rowData.length - 1 || selectedIndexSet.has(rowIndex + 1)) return;

        [newData[rowIndex + 1], newData[rowIndex]] = [newData[rowIndex], newData[rowIndex + 1]];
        selectedIndexSet.delete(rowIndex);
        selectedIndexSet.add(rowIndex + 1);
        moved = true;
      });
    }

    handleMenuClose();

    if (!moved) {
      handleSnackBarError(`Selected row(s) cannot be moved ${direction}`);
      return;
    }

    if (props.handleMoveTableRows(newData) !== false) {
      handleSnackBarSuccess("Selected Row(s) Successfully Moved");
    }
  };
  /**
   * Handles adding a column
   * @param columnName the column name
   * @returns {Promise<void>}
   */
  const handleAddColumn = async (columnName) => {
    const field = createFieldValue(columnName);
    const newColumn = { headerName: columnName, field: field, editable: true };

    // Close the menu
    handleMenuClose();

    // Add new table column
    props.handleAddNewTableColumn([...columnDefs, newColumn]);

    // Update snackbar
    handleSnackBarSuccess(`New Column "${columnName}" Successfully Added`);
  };
  /**
   * Handles removing the last column
   */
  const handleRemoveLastColumn = () => {
    if (columnDefs.length > 0) {
      const lastIndex = columnDefs.length - 1;
      const lastField = columnDefs[lastIndex].field;
      // Check for required fields and send an alert if the last column has the required field
      if (props.requiredFields && props.requiredFields.length > 0 && props.requiredFields.includes(lastField)) {
        const headerName = columnDefs[lastIndex].headerName;
        const errorMessage = `Error - Cannot delete. The column "${headerName}" is required.`;

        // Update snackbar
        handleSnackBarError(errorMessage);
      } else {
        // Remove last column
        const newColumnDefs = columnDefs.slice(0, -1);

        // Remove last field from rows
        let newRowDefs = deepCopy(rowData);
        newRowDefs.forEach((obj) => {
          delete obj[lastField];
        });

        // Close the menu
        handleMenuClose();

        // Return updates
        props.handleRemoveTableColumn(newColumnDefs, newRowDefs);

        // Update snackbar
        handleSnackBarSuccess("Last Column Successfully Removed");
      }
    }
  };
  /**
   * Handles the menu click
   * @param event
   */
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /**
   * Handles the menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  /**
   * Handles row selection updates.
   */
  const handleSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() || [];
    setSelectedRowCount(selectedNodes.length);
  };
  /**
   * Handles the table collapse
   */
  const handleCollapseTable = () => {
    setCollapseTable(!collapseTable);

    // Update collapse in parent
    if (props.hasOwnProperty("collapse") && props.collapse !== undefined) {
      props.handleCollapse(collapseTable);
    }

    // Update inner table section collapse
    if (props.handleCollapseInnerTableSection) {
      props.handleCollapseInnerTableSection();
    }
  };
  /**
   * Handles opening a new column dialog
   */
  const handleOpenNewColumnDialog = () => {
    // Close the menu
    handleMenuClose();

    // Update the new column dialog
    setNewColumnDialog(!newColumnDialog);
  };
  /**
   * Handles on row double-clicked
   * @param params the params
   */
  const handleOnRowDoubleClicked = (params) => {
    if (props.editFullRow) {
      const rowIndex = params.node.rowIndex;
      props.handleEditFullRow(rowIndex, params);
    }
  };

  // Helper Methods
  /**
   * Creates the field value
   * @param originalString the original string
   * @returns {string}
   */
  const createFieldValue = (originalString) => {
    originalString = originalString.trim().replace(COMMON_REGEX.allWhitespace, "").replace(UI_REGEX.nonLetter, "");
    return originalString.charAt(0).toLowerCase() + originalString.slice(1);
  };

  // Components
  /**
   * Gets the menu item
   * @param handler the handler
   * @param label the label
   * @param icon the icons
   * @param iconSize the icon size
   * @returns {JSX.Element}
   */
  const getMenuItem = (handler, label, icon, iconSize, disabled = false) => {
    const { color } = icons;
    const iconColor = innerStyling.primaryColor === primary ? color.primary : color.secondary;
    const IconComponent = icon;

    return (
      <MenuItem key={label} value={label} onClick={handler} disabled={disabled}>
        <ListItemIcon>
          {typeof icon === "string" ? (
            <img src={icon} style={{ ...iconSize, ...iconColor, opacity: disabled ? 0.38 : 1 }} />
          ) : (
            <IconComponent htmlColor={innerStyling.primaryColor} sx={{ ...iconSize, opacity: disabled ? 0.38 : 1 }} />
          )}
        </ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </MenuItem>
    );
  };
  /**
   * Gets the column data by type
   * @param headerName the header name
   * @param field the field
   * @param editable the editable value
   * @param resizable the resizable value
   * @param flex the flex value
   * @param type the type
   * @param headerTooltip the header tooltip
   * @param children the children
   * @param style the style
   * @returns {{autoHeight: boolean, headerName: *, field: *, resizable: *, editable: *, flex: *|number, cellStyle: {paddingBottom: string, textAlign: string, lineHeight: string, paddingTop: string}}}
   */
  const getColumnDataByType = (
    headerName,
    field,
    editable,
    resizable,
    flex,
    type,
    headerTooltip,
    children,
    style,
    dropdownMenuOptions,
    disabled,
    maxLength
  ) => {
    let columnData = {
      headerName: headerName,
      field: field,
      editable: editable,
      resizable: resizable,
      flex: flex ? flex : resizable ? 1 : 0,
      ...(props.disableColumnSorting ? { sortable: false } : {}),
      autoHeight: true,
      cellStyle: {
        lineHeight: "1.5",
        paddingTop: "12px",
        paddingBottom: "10px",
        textAlign: "start",
      },
    };
    let dropdownMenu = deepCopy(dropdownMenuOptions ?? props.dropdownMenuOptions ?? []);

    // Add header tooltip if one was provided
    if (headerTooltip) {
      columnData.headerTooltip = headerTooltip;
    }

    // Remove cell border on click if the edit full row has been selected
    if (props.editFullRow) {
      columnData.cellClass = "no-border";
    }

    // Format children data if it is present
    if (children) {
      if (children.length > 0) {
        children = children.map((child) => {
          const { headerName, field, editable, resizable, flex, type } = child;
          const innerChildren = child.hasOwnProperty("children") ? child.children : null;
          return getColumnDataByType(headerName, field, editable, resizable, flex, type, headerTooltip, innerChildren, style);
        });
      }
      columnData.children = children;
    }

    // Add more column data based on type
    let additionalColumnData = {};
    switch (type) {
      case "Index": {
        additionalColumnData = {
          valueGetter: (params) => params.node.rowIndex + 1,
        };
        break;
      }
      case "Number": {
        additionalColumnData = {
          cellEditor: "agNumberCellEditor",
          cellEditorParams: {
            precision: 2,
            step: 0.1,
            showStepperButtons: true,
          },
          filter: "agNumberColumnFilter",
          valueParser: (params) => {
            const newValue = Number(params.newValue);
            return isNaN(newValue) ? null : newValue;
          },
        };
        break;
      }
      case "Button":
      case "Title":
      case "Editor": {
        const isTitleButton = type === "Button" && !props.isManagementFunction && !props.isTabularizeTable;
        const isBasePPColor = props.isBasePP ? secondary : primary;

        additionalColumnData = {
          cellEditor: "agTextCellEditor",
          cellEditorParams: {
            maxLength: 100,
            useFormatter: type === "Editor" ? true : false,
          },
          cellStyle: {
            ...columnData.cellStyle,
            fontSize: type === "Title" || isTitleButton ? "13px" : "14px",
            color: type === "Title" || isTitleButton ? isBasePPColor : "black",
            fontWeight: type === "Title" || isTitleButton ? "bold" : "normal",
          },
          onCellDoubleClicked: (event) => {
            if (type === "Button" && props.isManagementFunction) {
              props.handleCellButtonClick(event);
            }
          },
          cellRenderer: (params) => {
            return getCellRenderer(type, params, props);
          },
          valueParser: (params) => {
            const newValue = params.newValue;
            return newValue ? newValue : "";
          },
        };
        break;
      }
      case "Large Editor": {
        additionalColumnData = {
          cellEditor: "agLargeTextCellEditor",
          cellEditorPopup: true,
          cellEditorParams: {
            maxLength: maxLength || 500,
          },
          tooltipValueGetter: () => (editable === false ? "This cell is read-only" : 'Double click to edit. \nHold "Shift + Enter" \nto add a new line.'),
          cellRenderer: (params) => {
            const { value } = params;
            return <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: value }} />;
          },
        };
        break;
      }
      case "Date": {
        additionalColumnData = {
          cellEditor: "agDateStringCellEditor",
          cellDataType: "dateString",
          cellEditorParams: {
            useFormatter: true,
          },
          valueFormatter: (params) => {
            return params.value ? new Date(params.value).toLocaleDateString("en-US", { timeZone: "UTC" }) : "";
          },
        };
        break;
      }
      case "Inner Table": {
        additionalColumnData = {
          cellRenderer: (params) => {
            const editable = { addColumn: false, addRow: false, removeColumn: false, removeRow: false };
            let colors = {
              primaryColor: style && style.primaryColor === primary ? secondary : primary,
              secondaryColor: style && style.secondaryColor === secondary ? primary : secondary,
            };

            // Set inner table colors for base pp table
            if (props.isBasePP) {
              colors = {
                primaryColor: secondary,
                secondaryColor: primary,
              };
            }

            return (
              <div className='mb-[5px]'>
                <EditableTable
                  title={""}
                  editable={editable}
                  columnData={props.innerColumnData}
                  rowData={params.value}
                  disableCard={true}
                  styling={{
                    ...style,
                    ...colors,
                  }}
                />
              </div>
            );
          },
        };
        break;
      }
      case "Multiline": {
        additionalColumnData = {
          cellRenderer: (params) => {
            const { value } = params;
            return <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: value }} />;
          },
        };
        break;
      }
      case "Chips": {
        additionalColumnData = {
          autoHeight: true,
          cellRenderer: (params) => {
            return (
              <div style={{ whiteSpace: "pre-wrap" }}>
                {params.value.map((chip, index) => (
                  <Tooltip key={index} title={chip}>
                    <Chip label={chip} style={{ margin: 2 }} />
                  </Tooltip>
                ))}
              </div>
            );
          },
        };
        break;
      }
      case "Checkbox": {
        additionalColumnData = {
          autoHeight: true,
          cellRenderer: (params) => {
            const type = params.colDef.field;
            const { uuid } = params.data;

            return (
              <div className='text-center'>
                <Checkbox
                  checked={params.value !== undefined ? params.value : false}
                  size={"small"}
                  sx={style.checkbox}
                  onChange={(event) => {
                    props.handleCheckboxClick(event, type, uuid);
                  }}
                  disabled={disabled}
                />
              </div>
            );
          },
        };
        break;
      }
      case "Select": {
        additionalColumnData = {
          autoHeight: true,
          cellRenderer: (params) => {
            const type = params.colDef.field;
            const { uuid } = params.data;
            const rowIndex = params.node.rowIndex;
            const color = props.styling.primaryColor === primary ? "primary" : "secondary";
            let selectValue = "";

            // Update select value if it is an object
            const paramsIsString = params.value !== undefined && typeof params.value === "string";
            const paramsIsObject = params.value !== undefined && typeof params.value !== "string" && params.value.hasOwnProperty("label");
            if (paramsIsString) {
              selectValue = params.value;
            } else if (paramsIsObject) {
              selectValue = params.value.label;
            }

            return (
              <div>
                <Select
                  fullWidth
                  value={selectValue}
                  onChange={(event) => {
                    event.rowIndex = rowIndex;
                    props.handleDropdownMenuSelect(event, type, uuid);
                  }}
                  color={color}>
                  {dropdownMenu.map((item) => {
                    const label = typeof item === "string" ? item : item.label;
                    const key = typeof item === "string" ? item : item.key;
                    const disabled = typeof item === "string" ? false : item.disabled;

                    const isSelected = label === selectValue;

                    return (
                      <MenuItem
                        key={key}
                        value={label}
                        sx={{
                          ...props.styling.primaryMenu,
                          ...(isSelected ? { display: "none" } : {}), // hide only in the menu
                        }}
                        disabled={disabled}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
            );
          },
        };
        break;
      }
      case "Multiselect": {
        additionalColumnData = {
          cellDataType: false,
          autoHeight: true,
          cellRenderer: (params) => {
            const { uuid, disabled, multiselect } = params.data;

            return (
              <span className='flex justify-stretch min-w-full pb-2'>
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
            );
          },
        };
        break;
      }
      default:
        break;
    }
    const readOnlyCellStyle =
      editable === false
        ? {
            backgroundColor: "#e9ecef",
            color: grayText,
          }
        : {};
    const cellClass = [columnData.cellClass, additionalColumnData.cellClass].filter(Boolean).join(" ");

    return {
      ...columnData,
      ...additionalColumnData,
      ...(cellClass ? { cellClass } : {}),
      cellStyle: {
        ...columnData.cellStyle,
        ...additionalColumnData.cellStyle,
        ...readOnlyCellStyle,
      },
    };
  };
  /**
   * Gets the cell renderer
   * @param type the type
   * @param params the params
   * @param props the props
   * @returns {JSX.Element}
   */
  const getCellRenderer = (type, params, props) => {
    const { value, data } = params;
    if (props.isManagementFunction || props.isTabularizeTable) {
      if (type === "Button") {
        return <div>{props.showPreview(true, value)}</div>;
      } else if (type === "Editor") {
        return <div style={{ whiteSpace: "normal", lineHeight: "1.5", margin: 0, padding: 0 }}>{value}</div>;
      }
    }
    if (type === "Button") {
      return (
        <Tooltip title={props.buttonTooltip ? props.buttonTooltip : ""} id={"auditTableButton"}>
          <button
            onClick={() => {
              props.handleCellButtonClick(data);
            }}>
            {value}
          </button>
        </Tooltip>
      );
    } else {
      return <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: value }} />;
    }
  };
  const canMoveRows = Boolean(props.editable.moveRow && props.handleMoveTableRows);
  const getAgGrid = () => {
    const maxHeight = props.disableCard === true ? "400px" : "500px";
    return (
      <div
        style={{
          width: "100%",
          maxHeight: maxHeight,
          overflowY: "auto",
          overflowX: "auto",
          "--ag-header-foreground-color": innerStyling.secondaryColor,
        }}
        className={`ag-theme-quartz ${canMoveRows ? "ag-row-selection-highlight" : "ag-no-row-selection-highlight"}`}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          groupSelectsChildren={true}
          rowSelection='multiple'
          rowMultiSelectWithClick={true}
          domLayout='autoHeight'
          enableBrowserToolips={true}
          tooltipShowDelay={200}
          suppressNoRowsOverlay={true}
          defaultColDef={{ editable: true }}
          popupParent={document.querySelector("body") || undefined}
          onCellValueChanged={(event) => {
            try {
              props.handleUpdateTableRow(event);
              handleSnackBarSuccess("Successfully Updated");
            } catch (e) {
              handleSnackBarError(e);
            }
          }}
          onRowDoubleClicked={handleOnRowDoubleClicked}
          onCellDoubleClicked={(event) => {
            const shouldContinue = props.handleCellDoubleClick ? props.handleCellDoubleClick(event) : true;
            if (shouldContinue === false) {
              return;
            }
            if (!props.editFullRow && event.colDef.editable) {
              event.api.startEditingCell({ rowIndex: event.rowIndex, colKey: event.column.getId() });
            }
          }}
          onSelectionChanged={handleSelectionChanged}
          editType={props.editFullRow ? "fullRow" : ""}
          stopEditingWhenCellsLoseFocus={true}
          suppressClickEdit={true}
        />
      </div>
    );
  };
  const isMoveRowsDisabled = selectedRowCount === 0 || selectedRowCount === rowData.length;

  // Return Method
  return (
    <div className='ag-theme-quartz'>
      {props.disableCard ? (
        <div>{getAgGrid()}</div>
      ) : (
        <div>
          <NewTableColumn open={newColumnDialog} handleOpen={handleOpenNewColumnDialog} handleSubmit={handleAddColumn} columnDefs={columnDefs} />
          <CardTemplate
            type={"parent"}
            tooltip={"Table"}
            collapseIconColor={innerStyling.primaryColor}
            header={
              <div className='w-full p-0 m-0'>
                <span className='flex justify-between min-w-full'>
                  <div className='flex justify-start w-full'>
                    {props.isTitleEditable ? (
                      <textarea
                        style={{ color: innerStyling.primaryColor }}
                        className='w-full resize-none font-bold text-[14px] mb-0 h-[25px] p-0'
                        onBlur={(event) => handleSnackbarTextUpdates(props.handleUpdateTitle, event)}
                        defaultValue={props.title}
                      />
                    ) : (
                      <label style={{ color: innerStyling.primaryColor }} className='font-bold text-[14px] p-0 pr-4 text-secondary'>
                        {props.title}
                      </label>
                    )}
                  </div>
                  <div className='flex justify-end pr-4 w-full'>
                    {collapseTable && editable ? (
                      <Tooltip title={`Edit Table`} id={"editTableButton"}>
                        <IconButton
                          sx={{ marginTop: "-8px" }}
                          variant='contained'
                          aria-controls={openMenu ? "basic-menu" : undefined}
                          aria-haspopup='true'
                          aria-expanded={openMenu ? "true" : undefined}
                          onClick={handleMenuClick}>
                          <MenuIcon htmlColor={innerStyling.primaryColor} sx={icons.large} />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </div>
                </span>
              </div>
            }
            collapse={collapseTable}
            collapseHandler={handleCollapseTable}
            body={
              <div className='min-w-full p-4 pb-2'>
                <Menu
                  id='basic-menu'
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}>
                  <MenuList className='m-0 p-0'>
                    {props.editable.addColumn && getMenuItem(handleOpenNewColumnDialog, "Add Column", AddColumnIcon, icons.medium)}
                    {props.editable.addRow && getMenuItem(handleAddRow, "Add Row", AddRowIcon, icons.medium)}
                    {props.editable.moveRow &&
                      props.handleMoveTableRows &&
                      getMenuItem(() => handleMoveSelectedRows("up"), "Move Selected Row(s) Up", ArrowUpwardRoundedIcon, icons.medium, isMoveRowsDisabled)}
                    {props.editable.moveRow &&
                      props.handleMoveTableRows &&
                      getMenuItem(
                        () => handleMoveSelectedRows("down"),
                        "Move Selected Row(s) Down",
                        ArrowDownwardRoundedIcon,
                        icons.medium,
                        isMoveRowsDisabled
                      )}
                    {props.editable.removeColumn && getMenuItem(handleRemoveLastColumn, "Remove Last Column", DeleteColumnIcon, icons.large)}
                    {props.editable.removeRow &&
                      getMenuItem(handleRemoveSelectedRow, "Remove Selected Row", DeleteRowIcon, icons.extraLarge, selectedRowCount === 0)}
                  </MenuList>
                </Menu>
                {props.tableInstructions && (
                  <div className='pb-4 break-words text-left' style={{ color: grayText }}>
                    {props.tableInstructions}
                  </div>
                )}
                {getAgGrid()}
              </div>
            }
            bottomBorderCss={props.bottomBorderCss ? props.bottomBorderCss : ""}
          />
        </div>
      )}
    </div>
  );
}

// Export EditableTable.jsx
export default EditableTable;
