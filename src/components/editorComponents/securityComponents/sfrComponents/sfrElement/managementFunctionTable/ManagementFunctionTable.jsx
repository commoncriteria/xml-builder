// Imports
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { FormControl, TextField } from "@mui/material";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import {
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  showManagementFunctionPreview,
  updateEvaluationActivitiesUI,
  updateManagementFunctionItems,
  updateManagementFunctionUI,
} from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import EditableTable from "../../../../EditableTable.jsx";
import EditManagementFunctionTableModal from "./EditManagementFunctionTableModal.jsx";
import TipTapEditor from "../../../../TipTapEditor.jsx";

/**
 * The ManagementFunctionTable class that displays the management function table for the sfr worksheet
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function ManagementFunctionTable() {
  // Constants
  const { element, elementUUID, selectedSfrElement, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { managementFunctions } = element;
  const { id, tableName, statusMarkers, rows, columns } = managementFunctions;
  const { rowIndex, openEditManagementFunctionModal } = managementFunctionUI;
  const editable = { addColumn: true, addRow: true, removeColumn: true, removeRow: true };
  const requiredColumns = [
    { headerName: "#", field: "rowNum", editable: false, resizable: true, type: "Index", flex: 0.5 },
    { headerName: "ID", field: "id", editable: true, resizable: true, type: "Editor", flex: 1 },
    { headerName: "Management Function", field: "textArray", editable: false, resizable: true, type: "Button", flex: 2 },
  ];
  const requiredFields = ["rowNum", "id", "textArray"];
  const style = { fontSize: 13 };

  // UseEffects
  useEffect(() => {
    // If the initial columns are empty add the required columns
    if (typeof columns === "object" && columns.length === 0) {
      // Update the management function
      updateManagementFunctionItems(
        {
          columns: requiredColumns,
        },
        managementFunctions
      );
    }
  }, [columns]);

  // Methods
  /**
   * Handles the ID change
   * @param event the event
   */
  const handleIDChange = (event) => {
    const currentID = event.target.value;

    // Update the management functions
    handleSnackbarTextUpdates(
      updateManagementFunctionItems,
      {
        id: currentID,
      },
      managementFunctions
    );
  };
  /**
   * Handles the name change
   * @param event
   */
  const handleNameChange = (event) => {
    const currentName = event.target.value;

    // Update the management functions
    handleSnackbarTextUpdates(
      updateManagementFunctionItems,
      {
        tableName: currentName,
      },
      managementFunctions
    );
  };
  /**
   * Handles the markers change
   * @param event the event
   */
  const handleMarkersChange = (event) => {
    const currentMarkers = event;

    // Update the management functions
    handleSnackbarTextUpdates(
      updateManagementFunctionItems,
      {
        statusMarkers: currentMarkers,
      },
      managementFunctions
    );
  };
  /**
   * Handles adding a new table row
   */
  const handleNewTableRow = () => {
    let currentRows = deepCopy(rows);
    const rowFields = getCurrentFields();
    let newRow = Object.fromEntries(rowFields.map((key) => [key, key === "textArray" ? [] : ""]));
    newRow = {
      ...newRow,
      id: `mf-${rows.length + 1}`,
      note: [],
      evaluationActivity: {
        isNoTest: false,
        noTest: "",
        introduction: "",
        tss: "",
        guidance: "",
        testIntroduction: "",
        testClosing: "",
        testLists: {},
        tests: {},
        refIds: [],
      },
    };

    // Add new rows
    currentRows.push(newRow);

    // Update the management functions
    updateManagementFunctionItems(
      {
        rows: currentRows,
      },
      managementFunctions
    );

    // Update snackbar
    handleSnackBarSuccess("New Row Successfully Created");
  };
  /**
   * Handles updating the table row
   * @param event the event
   */
  const handleUpdateTableRow = (event) => {
    try {
      const { data, rowIndex, colDef } = event;
      let currentRows = deepCopy(rows);

      // Update the application note refIds if the id was updated
      if (colDef.field === "id") {
        const oldId = deepCopy(currentRows[rowIndex].id);
        const newId = data.id;
        const isOldIdValid = oldId !== null && oldId !== undefined;
        const isNewIdValid = newId !== null && newId !== undefined;

        if (isOldIdValid && isNewIdValid && oldId !== newId) {
          updateAllRefIds(currentRows, {
            isDeleted: false,
            oldName: oldId,
            newName: newId,
          });
        }
      }

      // Update the rows
      currentRows[rowIndex] = data;

      // Update the management functions
      updateManagementFunctionItems(
        {
          rows: currentRows,
        },
        managementFunctions
      );

      // Update snackbar
      handleSnackBarSuccess("Row Successfully Updated");
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles deleting the table rows
   * @param newRows the newRows to delete
   * @param removedRows the removed rows to delete
   */
  const handleDeleteTableRows = (newRows, removedRows) => {
    try {
      const deletedRowIds = removedRows.map((item) => item.id);

      // Update the deleted refIds from the application notes and/or evaluation activities if they were deleted
      updateAllRefIds(newRows, {
        isDeleted: true,
        deletedRowIds,
      });

      // Update the management functions
      updateManagementFunctionItems(
        {
          rows: newRows,
        },
        managementFunctions
      );
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles adding a new table column
   * @param newColumns the new columns
   */
  const handleAddNewTableColumn = (newColumns) => {
    // Update the columns
    const lastIndex = newColumns.length - 1;
    const { headerName, field } = newColumns[lastIndex];
    let updatedColumns = deepCopy(columns);
    updatedColumns.push({
      headerName: headerName,
      field: field,
      editable: true,
      resizable: true,
      type: "Editor",
      flex: 0.5,
    });

    // Update the rows
    let currentRows = deepCopy(rows);
    currentRows.forEach((row) => {
      row[field] = "";
    });

    // Update the management functions
    updateManagementFunctionItems(
      {
        rows: currentRows,
        columns: updatedColumns,
      },
      managementFunctions
    );
  };
  /**
   * Handles removing a table column
   * @param currentColumns the current columns
   * @param rows the current rows
   */
  const handleRemoveTableColumn = (currentColumns, rows) => {
    const lastIndex = currentColumns.length;
    let updatedColumns = deepCopy(columns);
    updatedColumns.splice(lastIndex, 1);

    // Update the management functions
    updateManagementFunctionItems(
      {
        rows: rows,
        columns: updatedColumns,
      },
      managementFunctions
    );
  };
  /**
   * Handles the cell button click
   * @param event the cell event
   */
  const handleCellButtonClick = (event) => {
    const { rowIndex, data } = event;

    if (data.id && data.id !== "") {
      // Update the management function row index
      updateManagementFunctionUI({
        rowIndex,
        openEditManagementFunctionModal: true,
      });
    } else {
      handleSnackBarError("Unable to edit cell, please add an ID.");
    }
  };
  /**
   * Handles opening the edit modal
   */
  const handleOpenEditModal = () => {
    // Update evaluation activity ui
    updateEvaluationActivitiesUI({
      selectedUUID: !openEditManagementFunctionModal ? elementUUID : "",
      selectedEvaluationActivity: !openEditManagementFunctionModal ? [selectedSfrElement] : [],
    });

    // Update the open value
    updateManagementFunctionUI({
      openEditManagementFunctionModal: !openEditManagementFunctionModal,
    });
  };

  // Helper Methods
  /**
   * Gets the current fields
   * @returns {*[]}
   */
  const getCurrentFields = () => {
    const fields = columns.map((item) => item["field"]);
    return fields ? fields : [];
  };
  /**
   * Updates all the ref ids
   * @param rows the rows
   * @param data the update data
   */
  const updateAllRefIds = (rows, data) => {
    rows.map((row) => {
      const { note: notes, evaluationActivity } = row;

      // Update note refIds
      notes?.forEach((note) => {
        const { refIds } = note;

        note.refIds = updateRefIdsHelper(refIds, data);
      });

      // Update evaluation activity refIds
      const { refIds } = evaluationActivity;

      evaluationActivity.refIds = updateRefIdsHelper(refIds, data);
    });
  };
  /**
   * The helper for updating the ref ids
   * @param refIds the ref ids
   * @param data the update data
   * @returns {*[]}
   */
  const updateRefIdsHelper = (refIds, data) => {
    const { isDeleted, deletedRowIds, oldName, newName } = data;

    if (refIds && refIds.length > 0) {
      if (isDeleted) {
        deletedRowIds.forEach((rowId) => {
          refIds = refIds.filter((id) => id !== rowId);
        });
      } else {
        refIds = refIds
          .map((id) => {
            if (id === oldName) {
              return newName;
            }
            return id;
          })
          .filter((id) => id !== "");
      }
    } else {
      refIds = [];
    }

    return refIds;
  };
  /**
   * Gets the row id for the edit management function table modal
   */
  const getRowID = () => {
    const currentRow = rows[rowIndex];

    if (currentRow && currentRow.hasOwnProperty("id")) {
      return currentRow.id;
    } else {
      return "";
    }
  };

  // Use Memos
  /**
   * The status markers editor section
   * @type {Element}
   */
  const StatusMarkersEditor = useMemo(() => {
    return <TipTapEditor className='w-full' contentType={"term"} handleTextUpdate={handleMarkersChange} text={statusMarkers} />;
  }, [statusMarkers]);

  // Return Method
  return (
    <CardTemplate
      type={"section"}
      header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Management Functions</label>}
      body={
        <div>
          <FormControl fullWidth>
            <TextField
              label={"ID"}
              color='secondary'
              defaultValue={id}
              onBlur={(event) => handleIDChange(event)}
              key={id + "managementFunctionID"}
              inputProps={{ style }}
              InputLabelProps={{ style }}
            />
          </FormControl>
          <div className='mt-2 mx-[-16px] pb-[6px]'>
            <CardTemplate
              className='border-gray-300'
              type={"section"}
              header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-secondary'>Status Markers</label>}
              body={StatusMarkersEditor}
            />
          </div>
          <EditableTable
            title={tableName}
            editable={editable}
            columnData={deepCopy(columns)}
            requiredFields={requiredFields}
            rowData={deepCopy(rows)}
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
            tableInstructions={`To edit a cell, double-click on it. To edit management-specific functions, application notes 
                             and evaluation activities for a row, double-click on the desired cell in the 'Management 
                             Function' column.`}
          />
          <div className={"z-[1000]"}>
            <EditManagementFunctionTableModal title={`Edit Management Function Text (${getRowID()})`} handleOpen={handleOpenEditModal} />
          </div>
        </div>
      }
    />
  );
}

// Export ManagementFunctionTable.jsx
export default ManagementFunctionTable;
