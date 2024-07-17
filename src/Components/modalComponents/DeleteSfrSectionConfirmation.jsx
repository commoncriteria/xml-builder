// Imports
import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";
import {DELETE_ACCORDION_FORM_ITEM, GET_ACCORDION_SFR_FORM_ITEMS} from "../../reducers/accordionPaneSlice.js";
import {useDispatch} from "react-redux";
import {DELETE_SFR_SECTION} from "../../reducers/SFRs/sfrSectionSlice.js";
import {DELETE_SFR} from "../../reducers/SFRs/sfrSlice.js";
import {DELETE_EDITOR} from "../../reducers/editorSlice.js";

/**
 * The DeleteSfrSectionConfirmation class that sends a pop-up confirmation for deleting the sfr sections
 * @returns {JSX.Element}   the sfr sections confirmation modal content
 * @constructor             passes in props to the class
 */
function DeleteSfrSectionConfirmation(props) {
    // Prop Validation
    DeleteSfrSectionConfirmation.propTypes = {
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
        // Get the sfr section UUIDs and delete the sfr sections from all the appropriate places
        let sfrs = await dispatch(GET_ACCORDION_SFR_FORM_ITEMS({accordionUUID: props.accordionUUID, editorUUID: props.editorUUID})).payload.sfrs
        if (sfrs && sfrs.length > 0) {
            sfrs.map((sfrUUID) => {
                dispatch(DELETE_SFR_SECTION({sfrUUID: sfrUUID}))
                dispatch(DELETE_SFR({uuid: sfrUUID}))
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
            <Modal title={"Delete SFR Confirmation"}
                   content={(
                       <div className="p-4 text-[16px] italic">
                          Are you sure you want to delete this entire SFR section and its sub-sections?
                       </div>
                   )}
                   open={props.open}
                   handleOpen={() => {props.handleOpen()}}
                   handleSubmit={handleSubmit}
            />
        </div>
    );
}

// Export DeleteSfrSectionConfirmation.jsx
export default DeleteSfrSectionConfirmation;