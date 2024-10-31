// Imports
import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";
import {DELETE_ACCORDION_FORM_ITEM, GET_ACCORDION_SAR_FORM_ITEMS,} from "../../reducers/accordionPaneSlice.js";
import {useDispatch} from "react-redux";
import {DELETE_EDITOR} from "../../reducers/editorSlice.js";
import {DELETE_SAR} from "../../reducers/sarsSlice.js";

/**
 * The DeleteSarSectionConfirmation class that sends a pop-up confirmation for deleting the sfr sections
 * @returns {JSX.Element}   the sfr sections confirmation modal content
 * @constructor             passes in props to the class
 */
function DeleteSarSectionConfirmation(props) {
    // Prop Validation
    DeleteSarSectionConfirmation.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        editorUUID: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired
    };

    // Constants
    const dispatch = useDispatch();

    // Methods
    const handleSubmit = async () => {
        // Get the sar section UUIDs and delete the sar sections from all the appropriate places
        let sars = await dispatch(GET_ACCORDION_SAR_FORM_ITEMS({accordionUUID: props.accordionUUID, editorUUID: props.editorUUID})).payload.sars
        if (sars && sars.length > 0) {
            sars.map((sarUUID) => {
                dispatch(DELETE_SAR({sarUUID: sarUUID}))
            })
        }
        await (dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: props.accordionUUID, uuid: props.editorUUID})))
        await dispatch(DELETE_EDITOR({title: props.title, uuid: props.editorUUID}))

        // Close the dialog
        props.handleOpen()
    }

    // Return Method
    return (
        <div>
            <Modal title={"Delete SAR Confirmation"}
                   content={(
                       <div className="p-4 text-[14px] italic">
                          Are you sure you want to delete this entire SAR section and its sub-sections?
                       </div>
                   )}
                   open={props.open}
                   handleOpen={() => {props.handleOpen()}}
                   handleSubmit={handleSubmit}
            />
        </div>
    );
}

// Export DeleteSarSectionConfirmation.jsx
export default DeleteSarSectionConfirmation;