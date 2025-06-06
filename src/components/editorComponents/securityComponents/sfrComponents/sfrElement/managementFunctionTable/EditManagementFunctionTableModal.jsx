// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ApplicationNote from "../ApplicationNote.jsx";
import Modal from "../../../../../modalComponents/Modal.jsx";
import SfrEvaluationActivity from "../../aActivity/SfrEvaluationActivity.jsx";
import SfrRequirements from "../requirements/SfrRequirements.jsx";

/**
 * The EditManagementFunctionTableModal class that edits the management function text
 * @returns {JSX.Element}   management function text edit modal content
 * @constructor             passes in props to the class
 */
function EditManagementFunctionTableModal(props) {
  // Prop Validation
  EditManagementFunctionTableModal.propTypes = {
    title: PropTypes.string.isRequired,
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  const { managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { openEditManagementFunctionModal } = managementFunctionUI;

  // Return Method
  return (
    <Modal
      title={props.title}
      content={
        openEditManagementFunctionModal ? (
          <div className='min-w-full'>
            <SfrRequirements requirementType={"managementFunctions"} />
            <ApplicationNote isManagementFunction={true} />
            <SfrEvaluationActivity isManagementFunction={true} />
          </div>
        ) : (
          <div></div>
        )
      }
      hideSubmit={true}
      open={openEditManagementFunctionModal}
      handleOpen={() => {
        props.handleOpen();
      }}
    />
  );
}

// Export EditManagementFunctionTableModal.jsx
export default EditManagementFunctionTableModal;
