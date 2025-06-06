// Imports
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { CREATE_TABULARIZE_FIELD_VALUE, RESET_TABULARIZE_UI } from "../../../../../../reducers/SFRs/sfrWorksheetUI.js";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import {
  getElementValuesByType,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  transformTabularizeData,
  updateSfrSectionElement,
  updateTabularizeUI,
} from "../../../../../../utils/securityComponents.jsx";
import Modal from "../../../../../modalComponents/Modal.jsx";
import ResetDataConfirmation from "../../../../../modalComponents/ResetDataConfirmation.jsx";

/**
 * The EditTabularizeDefinitionModal class that displays the higher level tabularize table data
 * @returns {JSX.Element}   the new column header modal content
 * @constructor             passes in props to the class
 */
function EditTabularizeDefinitionModal(props) {
  // Prop Validation
  EditTabularizeDefinitionModal.propTypes = {
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const { secondary, primary, primaryMenu, icons, grayText } = useSelector((state) => state.styling);
  const { element, tabularizeUI } = useSelector((state) => state.sfrWorksheetUI);
  const {
    title,
    titleError,
    titleHelperText,
    id,
    idError,
    idHelperText,
    definition,
    componentType,
    selectType,
    openDefinitionModal,
    openDeleteComponentModal,
    deleteComponentIndex,
    currentUUID,
  } = tabularizeUI;
  const [disabled, setDisabled] = useState(true);
  const componentMenu = ["Column Header", "Requirements Text"];
  const selectTypeMenu = ["Selectables", "Text"];

  // Use Effects
  useEffect(() => {
    setDisabled(getDisabled());
  }, [tabularizeUI]);

  // Methods
  /**
   * Handles the open
   * @returns {Promise<void>}
   */
  const handleOpen = async () => {
    // Reset the initial values
    await dispatch(RESET_TABULARIZE_UI());

    // Close the dialog
    props.handleOpen();
  };
  /**
   * Handles the submit
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    // Get new tabularize object and then create new or update item
    const newTabularize = transformTabularizeData({
      title: title ? title : "",
      id: id ? id : "",
      definition: definition ? definition : [],
      type: "reverse",
    });

    if (newTabularize && Object.keys(newTabularize).length > 0) {
      let tabularize = deepCopy(getElementValuesByType(element, "tabularize"));
      const uuid = currentUUID && tabularize.hasOwnProperty(currentUUID) ? currentUUID : uuidv4();

      // Update tabularize value at the specified uuid
      tabularize[uuid] = newTabularize;

      // Update tabularize item
      let itemMap = {
        tabularize: tabularize,
      };
      updateSfrSectionElement(itemMap);

      // Update snackbar
      handleSnackBarSuccess("Crypto Selection Table Definition Successfully Updated");
    }

    // Close the dialog
    await handleOpen();
  };
  /**
   * Handles the text update
   * @param event the event
   * @param type the type
   */
  const handleTextUpdate = (event, type) => {
    try {
      const value = event.target.value;

      // Update the tabularize ui
      updateTabularizeUI({
        [type]: value,
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles component type selection
   * @param event the event
   */
  const handleComponentTypeSelection = (event) => {
    try {
      const componentType = event.target.value;

      // Update the tabularize ui
      updateTabularizeUI({
        componentType,
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the select type selection
   * @param event the event
   */
  const handleSelectTypeSelection = (event) => {
    try {
      const selectType = event.target.value;

      // Update the tabularize ui
      updateTabularizeUI({
        selectType,
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles adding a new table component
   */
  const handleAddNewTableComponent = () => {
    try {
      if (componentType && componentType !== "") {
        let component = "reqtext";

        if (componentType === "Column Header") {
          component = selectType && selectType !== "" && selectType === "Selectables" ? "selectcol" : "textcol";
        }

        // Update definition
        updateDefinition({
          selectionType: component,
          type: "new",
        });

        // Update snackbar
        handleSnackBarSuccess(`${selectType} ${componentType} Successfully Added`);
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the definition text
   * @param event the event
   * @param index the index
   * @param type the type
   */
  const handleDefinitionText = (event, index, type) => {
    try {
      const newText = event.target.value;

      // Update definition
      updateDefinition({
        selectionType: type,
        newText: newText,
        type: "update",
        index: index,
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the definition selection type
   * @param event the event
   * @param index the index
   */
  const handleDefinitionSelectionType = (event, index) => {
    try {
      const selectionType = event.target.value;

      // Update definition
      updateDefinition({
        selectionType: selectionType,
        index: index,
        type: "select",
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles deleting the definition item
   * @param index the index to delete
   */
  const handleDeleteDefinitionItem = (index) => {
    try {
      let currentDefinition = deepCopy(definition);

      // Delete definition item and update rows/columns
      if (currentDefinition[index]) {
        // Delete from definition
        updateDefinition({
          index: index,
          type: "delete",
        });

        // Update snackbar
        handleSnackBarSuccess("Definition Item Successfully Removed");
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the open for the delete component modal
   */
  const handleDeleteComponentModalOpen = () => {
    try {
      // Update the worksheet
      updateTabularizeUI({
        openDeleteComponentModal: !openDeleteComponentModal,
        deleteComponentIndex: !openDeleteComponentModal ? deleteComponentIndex : null,
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the submit for the delete component modal
   */
  const handleDeleteComponentModalSubmit = () => {
    try {
      // Delete the items from the modal
      handleDeleteDefinitionItem(deleteComponentIndex);

      // Close the modal
      handleDeleteComponentModalOpen();

      // Update snackbar
      handleSnackBarSuccess("Item Successfully Removed");
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Helper Methods
  /**
   * Updates the definition
   * @param updateMap the update map
   */
  const updateDefinition = (updateMap) => {
    try {
      let { selectionType, newText, index, type } = updateMap;
      let currentDefinition = deepCopy(definition);

      // Update definition based on type
      if (currentDefinition) {
        if (currentDefinition[index]) {
          if (type === "delete") {
            currentDefinition.splice(index, 1);
          } else if (type === "select" && selectionType) {
            currentDefinition[index].type = selectionType;
            if (selectionType !== "reqtext") {
              currentDefinition[index].column = defineColumn(selectionType);
              currentDefinition[index].rows = defineRows({
                currentDefinition,
                selectionType,
                type,
                index,
              });
            }
          } else if (type === "update" && selectionType) {
            currentDefinition[index].value = newText;

            // Update field value for selectcol or textcol
            if (selectionType !== "reqtext") {
              const value = newText;
              const field = dispatch(
                CREATE_TABULARIZE_FIELD_VALUE({
                  value,
                })
              ).payload.field;
              currentDefinition[index].field = field;
            }
          }
        } else if (type === "new" && selectionType) {
          const newDefinition = {
            value: "",
            type: selectionType,
            field: "",
          };

          // Return new object based on selection type
          if (selectionType !== "reqtext") {
            newDefinition.rows = defineRows({
              currentDefinition,
              selectionType,
              type,
            });
            newDefinition.column = defineColumn(selectionType);
          }

          // Add object to current definition
          currentDefinition.push(newDefinition);
        }

        // Update definition
        if (JSON.stringify(definition) !== JSON.stringify(currentDefinition)) {
          updateTabularizeUI({
            definition: currentDefinition,
          });
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Defines the rows
   * @param update the update object
   * @returns {{value: []|string}[]|*[]}
   */
  const defineRows = (update) => {
    const { currentDefinition, selectionType, type, index } = update;
    const isCurrentDefinitionValid = currentDefinition && currentDefinition.length > 0 && currentDefinition[type === "new" ? 0 : index].hasOwnProperty("rows");

    if (type === "new" && isCurrentDefinitionValid) {
      // Generate new rows
      return fillArray(0);
    } else if (type === "select" && isCurrentDefinitionValid) {
      // Generate new rows
      return fillArray(index);
    } else if (type === "new" || type === "select") {
      // Return empty array
      return [];
    }

    /**
     * Fills the array based on selected type "textcol" or "selectcol"
     * @param index the index
     * @returns {{value: []|string}[]}
     */
    function fillArray(index) {
      const rowCount = currentDefinition[index].rows.length;

      return Array(rowCount)
        .fill()
        .map(() => ({
          value: selectionType === "selectcol" ? [] : "",
        }));
    }
  };
  /**
   * Defines the column
   * @param selectionType the selection type
   * @returns {{resizable: boolean, editable: boolean, flex: (number), type: (string)}}
   */
  const defineColumn = (selectionType) => {
    return {
      editable: false,
      resizable: true,
      type: selectionType === "textcol" ? "Editor" : "Button",
      flex: selectionType === "textcol" ? 3 : 5,
    };
  };
  /**
   * Gets the disabled value
   * @returns {boolean}
   */
  const getDisabled = () => {
    const currentDefinition = deepCopy(definition);

    // Check for title and id error
    if (titleError || idError) {
      return true;
    }

    // Check for definition errors
    return currentDefinition?.filter((x) => x.hasOwnProperty("error") && x.error).length > 0;
  };

  // Components
  /**
   * The definition section
   * @param value the value
   * @param type the type
   * @param index the index
   * @returns {*}
   */
  const getDefinitionSection = (value, type, index) => {
    if (type === "selectcol" || type === "textcol") {
      return getColumnHeader(value, type, index);
    } else if (type === "reqtext") {
      return getRequirementsText(value, type, index);
    }
  };
  /**
   * The column header section
   * @param value the value
   * @param type the type
   * @param index the index
   * @returns {JSX.Element}
   */
  const getColumnHeader = (value, type, index) => {
    const editingDisabled = value === "Selectable ID" ? true : false;
    const currentDefinition = deepCopy(definition);
    const { error, helperText, selectDisabled } = currentDefinition[index];
    const isError = error ? error : false;

    return (
      <span className='min-w-full inline-flex items-baseline'>
        <div className='w-[74%]'>
          <FormControl fullWidth>
            <TextField
              required
              key={"columnHeaderText" + index}
              label='Column Header'
              onBlur={(event) => {
                handleSnackbarTextUpdates(handleDefinitionText, event, index, type);
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
            <InputLabel key='element-select-label'>Column Type</InputLabel>
            <Select
              sx={{ textAlign: "left" }}
              value={type}
              label='Column Type'
              autoWidth
              disabled={editingDisabled || isError || selectDisabled}
              onChange={(event) => {
                handleDefinitionSelectionType(event, index);
              }}>
              <MenuItem key={"selectcol"} value={"selectcol"}>
                Selectables
              </MenuItem>
              <MenuItem key={"textcol"} value={"textcol"}>
                Text
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        {!editingDisabled ? <div className='w-[4%] pl-2'>{getDeleteIcon("Delete Column Header", index, error)}</div> : null}
      </span>
    );
  };
  /**
   * The requirements text section
   * @param value the value
   * @param type the type
   * @param index the index
   * @returns {JSX.Element}
   */
  const getRequirementsText = (value, type, index) => {
    const error = definition[index].error ? definition[index].error : false;
    const helperText = definition[index].helperText ? definition[index].helperText : "";

    return (
      <span className='min-w-full inline-flex items-baseline'>
        <div className='w-[96%]'>
          <FormControl fullWidth>
            <TextField
              required
              key={"requirementsText" + index}
              label='Requirements Text'
              onBlur={(event) => {
                handleSnackbarTextUpdates(handleDefinitionText, event, index, type);
              }}
              defaultValue={value}
              error={error}
              helperText={helperText}
            />
          </FormControl>
        </div>
        <div className='w-[4%] pl-2'>{getDeleteIcon("Delete Requirements Text", index)}</div>
      </span>
    );
  };
  /**
   * The select menu section
   * @param label the label
   * @param value the value
   * @param dropdown the dropdown
   * @param handler the handler
   * @returns {JSX.Element}
   */
  const getSelectMenu = (label, value, dropdown, handler) => {
    return (
      <FormControl fullWidth color={"secondary"}>
        <InputLabel key={label}>{label}</InputLabel>
        <Select value={value} label={label} autoWidth onChange={handler} sx={{ textAlign: "left" }}>
          {dropdown.map((value) => (
            <MenuItem sx={primaryMenu} key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
  /**
   * The delete icon section
   * @param label the label
   * @param index the index
   * @returns {JSX.Element}
   */
  const getDeleteIcon = (label, index) => {
    return (
      <IconButton
        variant='contained'
        sx={{ marginBottom: "-32px" }}
        onClick={() => {
          updateTabularizeUI({
            openDeleteComponentModal: true,
            deleteComponentIndex: index,
          });
        }}>
        <Tooltip title={label} id={`${label} Tooltip`}>
          <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
        </Tooltip>
      </IconButton>
    );
  };
  /**
   * The reset data confirmation text section
   * @returns {string}
   */
  const getResetDataConfirmationText = () => {
    const currentDefinition = deepCopy(definition);
    let confirmationText = "Are you sure that you want to delete this requirements text component?";

    if (openDeleteComponentModal && deleteComponentIndex && currentDefinition && currentDefinition[deleteComponentIndex]) {
      const { value, type } = currentDefinition[deleteComponentIndex];

      if (type === "selectcol" || type === "textcol") {
        const typeText = type === "selectcol" ? "select" : "text";
        const columnName = value !== "" ? `the [${value}]` : "this";
        confirmationText = (
          <div>
            <Typography>{`Are you sure that you want to delete ${columnName} ${typeText} column component?`}</Typography>
            <br />
            <Typography>Any associated rows and columns will also be deleted.</Typography>
          </div>
        );
      }
    }
    return confirmationText;
  };

  // Return Method
  return (
    <Modal
      title={
        <div>
          Crypto Selection Table Definitions
          <br />
          <label style={{ fontWeight: "normal", fontSize: "13px", color: grayText }}>{` (Press Confirm to Save Changes)`}</label>
        </div>
      }
      content={
        <div className='min-w-full justify-items-left grid grid-flow-row auto-rows-max mb-[-16px]'>
          <div style={{ zIndex: 1000 }} key={"resetComponentConfirmation"}>
            <ResetDataConfirmation
              title={"Delete Component Confirmation"}
              text={getResetDataConfirmationText()}
              open={openDeleteComponentModal}
              handleOpen={handleDeleteComponentModalOpen}
              handleSubmit={handleDeleteComponentModalSubmit}
            />
          </div>
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-row rows-2 gap-4 p-2'>
            <FormControl fullWidth>
              <TextField
                required
                key={id + "-id"}
                label='Table ID'
                onBlur={(event) => {
                  handleSnackbarTextUpdates(handleTextUpdate, event, "id");
                }}
                defaultValue={id}
                error={idError ? idError : false}
                helperText={idHelperText ? idHelperText : ""}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                required
                key={title + "-title"}
                label='Table Title'
                onBlur={(event) => {
                  handleSnackbarTextUpdates(handleTextUpdate, event, "title");
                }}
                defaultValue={title}
                error={titleError ? titleError : false}
                helperText={titleHelperText ? titleHelperText : ""}
              />
            </FormControl>
          </div>
          {definition.map((item, index) => (
            <div
              key={`definitionSection${index}`}
              className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2'>
              {getDefinitionSection(item.value, item.type, index)}
            </div>
          ))}
        </div>
      }
      dialogActions={
        <div className='m-0 p-0 pt-4 m-[-16px] mb-1 z-30'>
          <div className='border-t-2 border-gray-200 pl-8 pr-4 pt-6 pb-2'>
            <span className='min-w-full inline-flex items-center'>
              <div className={componentType === "Column Header" ? "w-[47%]" : "w-[94%]"}>
                {getSelectMenu("Table Component Type", componentType, componentMenu, handleComponentTypeSelection)}
              </div>
              {componentType === "Column Header" && (
                <div className='w-[47%] pl-4'>{getSelectMenu("Column Type", selectType, selectTypeMenu, handleSelectTypeSelection)}</div>
              )}
              <div className='w-[6%] pl-2'>
                <IconButton onClick={handleAddNewTableComponent} variant='contained'>
                  <Tooltip title={"Add New Table Component"} id={"addTableComponentTooltip"}>
                    <AddCircleIcon htmlColor={primary} sx={icons.medium} />
                  </Tooltip>
                </IconButton>
              </div>
            </span>
          </div>
        </div>
      }
      disabled={disabled}
      open={openDefinitionModal}
      handleOpen={handleOpen}
      handleSubmit={handleSubmit}
    />
  );
}

// Export EditTabularizeDefinitionModal.jsx
export default EditTabularizeDefinitionModal;
