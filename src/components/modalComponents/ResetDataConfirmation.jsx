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
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired
    };

    // Methods
    const handleSubmit = async () => {
        // Clear session storage and reset template data to its original state
        sessionStorage.clear()

        // Reload the page after clearing out local storage
        location.reload()

        // Close the dialog
        props.handleOpen()

        // Scroll back to the top of the page
        window.scrollTo(0, 0)
    }

    // Return Method
    return (
        <div>
            <Modal title={"Reset Data Confirmation"}
                   content={(
                       <div className="p-4 text-[16px] italic">
                          Are you sure you want to reset all data to its initial state?
                       </div>
                   )}
                   open={props.open}
                   handleOpen={() => {props.handleOpen()}}
                   handleSubmit={handleSubmit}
            />
        </div>
    );
}

// Export ResetDataConfirmation.jsx
export default ResetDataConfirmation;