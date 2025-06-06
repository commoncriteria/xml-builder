// Imports
import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";

/**
 * The ResetDataConfirmation class that displays the confirmation dialog for resetting the data to the initial state
 * @returns {JSX.Element}   the reset data confirmation modal content
 * @constructor             passes in props to the class
 */
function ResetDataConfirmation(props) {
  // Prop Validation
  ResetDataConfirmation.propTypes = {
    title: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  // Return Method
  return (
    <div>
      <Modal
        title={props.title}
        content={<div className='p-4 text-[14px] italic'>{props.text}</div>}
        open={props.open}
        handleOpen={() => {
          props.handleOpen();
        }}
        handleSubmit={props.handleSubmit}
      />
    </div>
  );
}

// Export ResetDataConfirmation.jsx
export default ResetDataConfirmation;
