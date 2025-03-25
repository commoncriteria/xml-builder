// Imports
import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";

/**
 * The NoEaConfirmation class that sends a pop-up confirmation for deleting the sfr sections
 * @returns {JSX.Element}   the sfr sections confirmation modal content
 * @constructor             passes in props to the class
 */
function NoEaConfirmation(props) {
    // Prop Validation
    NoEaConfirmation.propTypes = {
        toggleValue: PropTypes.bool.isRequired,
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired,
        handleSubmit:PropTypes.func.isRequired,
    };

    // Methods
    const handleSubmit = () => {
        // Update the is no test toggle
        props.handleSubmit();

        // Close the dialog
        props.handleOpen()
    }

    // Return Method
    return (
        <div>
            <Modal
                title={"No Ea's Confirmation"}
                content={(
                    <div className="p-4 text-[14px] italic">
                        {`Are you sure you want to turn ${props.toggleValue ? `off` : `on`} No Ea's?`}
                        <br/>
                        <br/>
                        Note: All of your current data will be lost.
                    </div>
                )}
                open={props.open}
                handleOpen={props.handleOpen}
                handleSubmit={handleSubmit}
            />
        </div>
    );
}

// Export NoEaConfirmation.jsx
export default NoEaConfirmation;