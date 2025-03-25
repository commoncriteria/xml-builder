// Imports
import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";


/**
 * The DeleteSectionConfirmation class that sends a pop-up confirmation for deleting an accordion section or subsection
 * @returns {JSX.Element}   the deletion confirmation modal content
 * @constructor             passes in props to the class
 */
function DeleteConfirmation(props) {
    // Prop Validation
    DeleteConfirmation.propTypes = {
        title: PropTypes.string,
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired
    };


    // Return Method
    return (
        <div>
            <Modal title={"Delete Section"}
                content={(
                <div className="p-4 text-[14px] italic">
                    Are you sure you want to delete the <span className="font-bold">{props.title}</span> section?
                </div>)}
                open={props.open}
                handleOpen={() => {props.handleOpen()}}
                handleSubmit={() => {
                    // close the modal
                    props.handleOpen();
                    // emit handleSubmit function in parent
                    props.handleSubmit();
                }}
            />
        </div>
    );
}

// Export DeleteConfirmation.jsx
export default DeleteConfirmation;
