// Imports
import { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  getRefIdDropdown,
  handleSnackBarSuccess,
  updateApplicationNoteForManagementFunction,
  updateManagementFunctionItems,
  updateRefIds,
  updateSfrSectionElement,
} from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The Application Note component
 * @param isManagementFunction the is management function (boolean)
 * @returns {JSX.Element}
 * @constructor passes in props to the className
 */
function ApplicationNote({ isManagementFunction }) {
  // Prop Validation
  ApplicationNote.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
  };

  // Constants
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const styling = {
    secondary: isManagementFunction ? primary : secondary,
  };
  const { element, refIdOptions, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { managementFunctions } = element;
  const { note, rowIndex } = managementFunctionUI;

  // Methods
  /**
   * Adds a new application note for management functions
   */
  const handleAddApplicationNote = () => {
    let noteCopy = deepCopy(note);

    // Add a new note
    noteCopy.push({
      note: "",
      refIds: [],
    });

    // Update the management functions
    updateManagementFunctionItems(
      {
        value: noteCopy,
        rowIndex,
        type: "note",
      },
      managementFunctions,
      true
    );

    // Update snackbar
    handleSnackBarSuccess("Application Note Successfully Added");
  };
  /**
   * Handles deleting an application note for a management function
   * @param index the index to delete
   */
  const handleDeleteApplicationNote = (index) => {
    let noteCopy = deepCopy(note);

    // Remove the index
    noteCopy.splice(index, 1);

    // Update management functions
    updateManagementFunctionItems(
      {
        value: noteCopy,
        rowIndex,
        type: "note",
      },
      managementFunctions,
      true
    );

    // Update snackbar
    handleSnackBarSuccess("Application Note Successfully Removed");
  };

  // Helper Methods
  /**
   * Updates the application note based on type
   * @param event the event
   * @param type the type
   * @param index the index
   */
  const updateApplicationNote = (event, type, index) => {
    // Update the application note based on type
    if (isManagementFunction) {
      updateApplicationNoteForManagementFunction(event, type, index, note, managementFunctions, rowIndex);
    } else {
      updateSfrSectionElement({
        note: event,
      });
    }
  };
  /**
   * Updates the note ref ids
   * @param title the title
   * @param event the event
   * @param index the index
   */
  const updateNoteRefIds = (title, event, index) => {
    const type = "note";
    updateRefIds({
      event,
      index,
      type,
    });
  };

  // Components
  /**
   * Gets the management function notes
   * @returns {JSX.Element}
   */
  const getManagementFunctionNotes = () => {
    const noteCopy = deepCopy(note);
    const refIdOptionsCopy = getRefIdDropdown(refIdOptions, rowIndex);

    if (noteCopy && refIdOptionsCopy) {
      return (
        <div key={`managementFunctionNotes`}>
          {noteCopy.map((currentNote, index) => {
            let { note, refIds } = currentNote;

            return (
              <div className='w-full p-2 px-4 mb-4 rounded-md border-2 border-gray-300' key={`note-${index + 1}`}>
                <table className='border-0'>
                  <tbody>
                    <tr>
                      <td className='p-0 pb-4 text-center align-center w-full'>{getDropdown(refIds, refIdOptionsCopy, index)}</td>
                      <td className='p-0 text-center align-middle'>
                        <IconButton
                          sx={{ marginLeft: 1, marginBottom: 2 }}
                          onClick={() => {
                            handleDeleteApplicationNote(index);
                          }}
                          variant='contained'>
                          <Tooltip title={"Delete Application Note"} id={"deleteApplicationNoteTooltip" + index}>
                            <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                          </Tooltip>
                        </IconButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className='p-0 w-full bg-white'>
                  <Tooltip
                    title={
                      <div>
                        {`Add in "<_/>" to indicate the placeholder for the referenced management function.`}
                        <br />
                        <br />
                        {`For Example: Functions <_/> must be implemented on a device-wide basis but may also
                                                  be implemented on a per-app basis or on a per-group of applications basis in which
                                                  the configuration includes the list of applications or groups of applications to
                                                  which the enable/disable applies.`}
                      </div>
                    }>
                    {getTextEditor(note, index)}
                  </Tooltip>
                </div>
              </div>
            );
          })}
          <div className='border-t-2 mx-[-16px] mt-1'>
            <IconButton sx={{ marginTop: 1 }} onClick={handleAddApplicationNote} key={"AddNoteButton"} variant='contained'>
              <Tooltip title={"Add New Application Note"} id={"addNewApplicationNoteTooltip"}>
                <AddCircleRoundedIcon htmlColor={styling.secondary} sx={{ ...icons.medium }} />
              </Tooltip>
            </IconButton>
          </div>
        </div>
      );
    }
  };
  /**
   * Gets the dropdown
   * @param refIds the ref ids
   * @param refIdOptions the ref id options
   * @param index the index
   * @returns {JSX.Element}
   */
  const getDropdown = (refIds, refIdOptions, index) => {
    return (
      <MultiSelectDropdown
        title={"Included Management Functions"}
        index={index}
        selections={refIds}
        selectionOptions={refIdOptions}
        handleSelections={updateNoteRefIds}
      />
    );
  };
  /**
   * Gets the text editor
   * @param note the note
   * @param index the index
   * @returns {JSX.Element}
   */
  const getTextEditor = (note, index = -1) => {
    return (
      <div className='p-0 w-full bg-white'>
        <TipTapEditor title={"note"} className='w-full' contentType={"term"} handleTextUpdate={updateApplicationNote} text={note} index={index} />
      </div>
    );
  };

  // Use Memos
  /**
   * The AppNoteEditor component
   * @type {JSX.Element}
   */
  const AppNoteEditor = useMemo(() => {
    if (isManagementFunction) {
      return getManagementFunctionNotes();
    } else {
      const { note } = element;

      return getTextEditor(note ? note : "");
    }
  }, [isManagementFunction, element, rowIndex, note, refIdOptions]);

  // Return Method
  return (
    <CardTemplate
      type={"section"}
      header={
        <Tooltip
          arrow
          id={"applicationNotesTooltip"}
          title={
            "Optional section that contains guidance for ST Authors on filling out the selections and assignments.\n" +
            "Additionally, if any of the following cases are true, then these should be documented. " +
            "1. If SFR is Selection-based, the App Note should document the selections that cause the Component to be claimed. " +
            "2. If the SFR is Implementation-based, the App Note should document the product feature that the Component depends on. " +
            "3. If any selections in the Element cause other SFRs to be claimed in the ST."
          }>
          <label style={{ color: styling.secondary }} className='resize-none font-bold text-[14px] p-0 pr-4'>
            Application Notes
          </label>
        </Tooltip>
      }
      body={<div>{AppNoteEditor}</div>}
    />
  );
}

// Export ApplicationNote.jsx
export default ApplicationNote;
