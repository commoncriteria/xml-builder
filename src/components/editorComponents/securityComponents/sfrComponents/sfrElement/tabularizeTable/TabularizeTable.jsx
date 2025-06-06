// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { INITIALIZE_TABULARIZE_EDIT_ROW_DATA, RESET_TABULARIZE_UI } from "../../../../../../reducers/SFRs/sfrWorksheetUI.js";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { removeTagEqualities } from "../../../../../../utils/fileParser.js";
import {
  getElementValuesByType,
  getTabularizeItemValues,
  handleSnackBarSuccess,
  showTabularizeTablePreview,
  transformTabularizeData,
  updateSfrSectionElement,
  updateTabularizeRowsObject,
  updateTabularizeUI,
} from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import EditTabularizeDefinitionModal from "./EditTabularizeDefinitionModal.jsx";
import EditTabularizeRowModal from "./EditTabularizeRowModal.jsx";
import EditableTable from "../../../../EditableTable.jsx";
import ResetDataConfirmation from "../../../../../modalComponents/ResetDataConfirmation.jsx";

/**
 * The TabularizeTable class that displays a tabularize table for the sfr worksheet
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function TabularizeTable(props) {
  // Prop Validation
  TabularizeTable.propTypes = {
    index: PropTypes.number.isRequired,
    tabularizeUUID: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const { element, tabularizeUI } = useSelector((state) => state.sfrWorksheetUI);
  const { currentUUID, openDefinitionModal, openRowModal, openDeleteRowsModal, deleteRowModalData, deleteTableModal } = tabularizeUI;
  const editable = {
    addColumn: false,
    addRow: true,
    removeColumn: false,
    removeRow: true,
  };
  const { primary, icons } = useSelector((state) => state.styling);
  const [tabularize, setTabularize] = useState({});
  const [definitionString, setDefinitionString] = useState("");

  // Use Effect
  useEffect(() => {
    handleProps(props);
  }, [element, tabularizeUI, props]);

  // Methods
  /**
   * Handles the props
   * @param props the props
   */
  const handleProps = (props) => {
    const { tabularizeUUID } = props;

    // Set tabularize
    let { currentTabularize, currentDefinitionString } = getTabularizeItemValues(element, tabularizeUUID);

    if (JSON.stringify(tabularize) !== JSON.stringify(currentTabularize)) {
      setTabularize(currentTabularize);
    }

    // Set definition string
    if (JSON.stringify(definitionString) !== JSON.stringify(currentDefinitionString)) {
      setDefinitionString(currentDefinitionString);
    }
  };
  /**
   * Handles the open edit row modal
   * @param rowIndex the row index
   * @param newRow the new row
   */
  const handleOpenEditRowModal = (rowIndex, newRow) => {
    const { tabularizeUUID } = props;

    // Initialize row data on open
    if (!openRowModal) {
      if (tabularizeUUID && tabularizeUUID !== "") {
        let tabularize = deepCopy(getElementValuesByType(element, "tabularize", tabularizeUUID));

        if (tabularize && Object.keys(tabularize).length > 0) {
          const isNewRow = typeof newRow === "boolean" && newRow === true ? newRow : false;
          const { rows } = tabularize;

          // Update row index if it is a new row
          if (isNewRow && rowIndex === -1) {
            rowIndex = rows.length;
          }

          // Set item map and update values
          dispatch(
            INITIALIZE_TABULARIZE_EDIT_ROW_DATA({
              newRow: isNewRow,
              row: tabularize.rows && tabularize.rows[rowIndex] ? tabularize.rows[rowIndex] : {},
              definition: tabularize.definition ? tabularize.definition : [],
              originalRows: rows,
            })
          );
        }
      }
    } else {
      // Reset tabularize ui on close
      dispatch(RESET_TABULARIZE_UI());
    }

    // Update edit row modal values
    updateTabularizeUI({
      openRowModal: !openRowModal,
      rowIndex: rowIndex || rowIndex === 0 ? rowIndex : -1,
      currentUUID: !openRowModal ? tabularizeUUID : null,
    });
  };
  /**
   * Handles the delete table modal open
   */
  const handleDeleteTableModalOpen = () => {
    // Update tabularize UI
    updateTabularizeUI({
      deleteTableModal: !deleteTableModal,
      currentUUID: !deleteTableModal ? props.tabularizeUUID : null,
    });
  };
  /**
   * Handles the delete table modal submit
   */
  const handleDeleteTableModalSubmit = () => {
    // Delete Table
    const { tabularizeUUID } = props;
    let tabularize = deepCopy(getElementValuesByType(element, "tabularize"));

    if (tabularize && tabularizeUUID && tabularize.hasOwnProperty(tabularizeUUID)) {
      delete tabularize[tabularizeUUID];
    }

    // Delete from requirements title if it exists
    const title = deepCopy(getElementValuesByType(element, "title"));
    const updatedTitle = title.filter((obj) => obj.tabularize !== tabularizeUUID);

    // Update tabularize
    updateSfrSectionElement({
      tabularize: tabularize,
      title: updatedTitle,
    });

    // Close modal
    handleDeleteTableModalOpen();

    // Update snackbar
    handleSnackBarSuccess("Crypto Selection Table Successfully Removed");
  };
  /**
   * Handle open edit definition modal
   */
  const handleOpenEditDefinitionModal = () => {
    const { tabularizeUUID } = props;

    if (!openDefinitionModal) {
      if (tabularizeUUID && tabularizeUUID !== "") {
        let tabularize = deepCopy(getElementValuesByType(element, "tabularize", tabularizeUUID));

        if (tabularize && Object.keys(tabularize).length > 0) {
          // Set item map and update values
          transformTabularizeData({
            title: tabularize.title ? tabularize.title : "",
            id: tabularize.id ? tabularize.id : "",
            definition: tabularize.definition ? tabularize.definition : [],
            rows: tabularize.rows ? tabularize.rows : [],
            columns: tabularize.columns ? tabularize.columns : [],
            type: "transform",
          });
        }
      }
    }

    // Update edit definition modal
    updateTabularizeUI({
      openDefinitionModal: !openDefinitionModal,
      currentUUID: !openDefinitionModal ? tabularizeUUID : null,
    });
  };
  /**
   * Handles the delete rows modal open
   * @param newData the new data
   */
  const handleDeleteRowsModalOpen = (newData) => {
    // Update delete rows modal values
    updateTabularizeUI({
      openDeleteRowsModal: !openDeleteRowsModal,
      deleteRowModalData: !openDeleteRowsModal && newData ? newData : [],
      currentUUID: !openDeleteRowsModal ? props.tabularizeUUID : null,
    });
  };
  /**
   * Handles the delete rows modal submit
   */
  const handleDeleteRowsModalSubmit = () => {
    const deletedRows = deleteRowModalData ? deepCopy(deleteRowModalData) : [];

    // Update tabularize object to remove selected rows
    updateTabularizeRowsObject(deletedRows);

    // Close the dialog
    handleDeleteRowsModalOpen();

    // Update snackbar
    handleSnackBarSuccess("Selected Row(s) Successfully Removed");
  };
  /**
   * Handles the new table row
   */
  const handleNewTableRow = () => {
    const rowIndex = -1;
    const newRow = true;

    // Open edit row modal
    handleOpenEditRowModal(rowIndex, newRow);
  };

  // Components
  /**
   * Gets the definition preview
   * @returns {JSX.Element}
   */
  const getDefinitionPreview = () => {
    let currentString = definitionString ? definitionString : "";

    return <div className='preview'>{removeTagEqualities(currentString, true)}</div>;
  };

  // Return Method
  return (
    <div className='pt-2 my-[-8px] mx-[-16px]'>
      <ResetDataConfirmation
        title={"Delete Crypto Selection Table Row(s)"}
        text={`Are you sure that you want to delete the selected row(s) from the table?`}
        open={openDeleteRowsModal}
        handleOpen={handleDeleteRowsModalOpen}
        handleSubmit={handleDeleteRowsModalSubmit}
      />
      <ResetDataConfirmation
        title={"Delete Crypto Selection Table"}
        text={`Are you sure that you want to delete the "${tabularize.title ? tabularize.title : ""}" table?`}
        open={deleteTableModal && currentUUID !== null && currentUUID === props.tabularizeUUID}
        handleOpen={handleDeleteTableModalOpen}
        handleSubmit={handleDeleteTableModalSubmit}
      />
      <EditTabularizeDefinitionModal handleOpen={handleOpenEditDefinitionModal} />
      <CardTemplate
        type={"section"}
        header={
          <div className='w-full p-0 m-0 my-[-6px]'>
            <span className='flex justify-stretch min-w-full'>
              <div className='flex justify-center w-full pl-4'>
                <label className='resize-none font-bold text-[13px] p-0 m-0 text-secondary break-words pr-1 mt-[2px]'>
                  {tabularize.hasOwnProperty("title") ? tabularize.title : ""}
                </label>
                <IconButton variant='contained' sx={{ marginTop: "-8px", margin: 0, padding: 0, marginRight: 2 }} onClick={handleDeleteTableModalOpen}>
                  <Tooltip title={"Delete Crypto Selectable Table"} id={`deleteCryptoSelectableTooltip`}>
                    <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.small} />
                  </Tooltip>
                </IconButton>
              </div>
            </span>
          </div>
        }
        body={
          <div>
            <span className='flex justify-stretch min-w-full mb-4'>
              <div className='w-[96%] border-2 border-gray-200 rounded-md flex items-center'>{getDefinitionPreview()}</div>
              <div className='w-[4%] ml-1 flex items-center justify-center'>
                <IconButton
                  variant='contained'
                  onClick={() => {
                    handleOpenEditDefinitionModal();
                  }}>
                  <Tooltip title={"Modify Crypto Selectable Table Definitions"} id={`modifyCryptoSelectableTooltip`}>
                    <AutoFixHighIcon htmlColor={primary} sx={icons.medium} />
                  </Tooltip>
                </IconButton>
              </div>
            </span>
            <EditableTable
              title={"Selection Table"}
              editable={editable}
              columnData={tabularize && tabularize.hasOwnProperty("columns") ? deepCopy(tabularize.columns) : []}
              rowData={tabularize && tabularize.hasOwnProperty("rows") ? deepCopy(tabularize.rows) : []}
              isTitleEditable={false}
              isTabularizeTable={true}
              editFullRow={true}
              handleEditFullRow={handleOpenEditRowModal}
              handleNewTableRow={handleNewTableRow}
              handleDeleteTableRows={handleDeleteRowsModalOpen}
              showPreview={showTabularizeTablePreview}
              tableInstructions={`To edit a row, double-click on it and select the required column from the dropdown to edit further.`}
            />
            <EditTabularizeRowModal requirementType={"crypto"} handleOpen={handleOpenEditRowModal} />
          </div>
        }
      />
    </div>
  );
}

// Export TabularizeTable.jsx
export default TabularizeTable;
