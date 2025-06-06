// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { handleSnackBarError, handleSnackBarSuccess, updateTabularizeRowsObject } from "../../../../../../utils/securityComponents.jsx";
import Modal from "../../../../../modalComponents/Modal.jsx";
import SfrRequirements from "../requirements/SfrRequirements.jsx";

/**
 * The EditTabularizeRowModal class that displays the edit tabularize row modal
 * @returns {JSX.Element}   the reset data confirmation modal content
 * @constructor             passes in props to the class
 */
function EditTabularizeRowModal(props) {
  // Prop Validation
  EditTabularizeRowModal.propTypes = {
    requirementType: PropTypes.string.isRequired,
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  const { grayText } = useSelector((state) => state.styling);
  const { tabularizeUI } = useSelector((state) => state.sfrWorksheetUI);
  const { row, originalRows, openRowModal, rowIndex } = tabularizeUI;

  // Methods
  /**
   * Handles submit
   */
  const handleSubmit = () => {
    try {
      // Update or add new row
      if (originalRows && row) {
        let newRows = deepCopy(originalRows);

        // Update the current row
        if (newRows[rowIndex]) {
          newRows[rowIndex] = row;
        }

        // Otherwise, add a new row
        else if (newRows.length === rowIndex) {
          newRows.push(row);
        }

        // Update tabularize object to update or add new row
        if (JSON.stringify(newRows) !== JSON.stringify(originalRows)) {
          const updatedRows = newRows ? deepCopy(newRows) : [];

          // Update tabularize rows object
          updateTabularizeRowsObject(updatedRows);

          // Update snack bar
          if (originalRows.length === newRows.length) {
            handleSnackBarSuccess("Row Successfully Updated");
          } else {
            handleSnackBarSuccess("New Row Successfully Added");
          }
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }

    // Close Dialog
    props.handleOpen();
  };

  // Return Method
  return (
    <Modal
      title={
        <div>
          {`Edit Crypto Selection Table Row: ${rowIndex + 1}`}
          <br />
          <label style={{ fontWeight: "normal", fontSize: "13px", color: grayText }}>{` (Press Confirm to Save Changes)`}</label>
        </div>
      }
      content={
        <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
          <SfrRequirements requirementType={props.requirementType} />
        </div>
      }
      open={openRowModal}
      handleOpen={() => {
        props.handleOpen();
      }}
      handleSubmit={handleSubmit}
    />
  );
}

// Export EditTabularizeRowModal.jsx
export default EditTabularizeRowModal;
