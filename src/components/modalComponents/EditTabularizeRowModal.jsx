// Imports
import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";
import Modal from "./Modal.jsx";
import SfrRequirements from "../editorComponents/securityComponents/sfrComponents/requirements/SfrRequirements.jsx";
import { deepCopy } from "../../utils/deepCopy.js";
import SecurityComponents from "../../utils/securityComponents.jsx";

/**
 * The EditTabularizeRowModal class that displays the edit tabularize row modal
 * @returns {JSX.Element}   the reset data confirmation modal content
 * @constructor             passes in props to the class
 */
function EditTabularizeRowModal(props) {
    // Prop Validation
    EditTabularizeRowModal.propTypes = {
        open: PropTypes.bool.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        tabularizeUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        requirementType: PropTypes.string.isRequired,
        rowIndex: PropTypes.number.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
        showTabularizeTablePreview: PropTypes.func.isRequired,
        updateTabularizeObject: PropTypes.func.isRequired,
        handleOpen: PropTypes.func.isRequired,
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const { row, originalRows } = useSelector((state) => state.tabularize);
    const { grayText } = useSelector((state) => state.styling);

    // Methods
    const handleSubmit = () => {
        try {
            // Update row data
            const {rowIndex} = props

            // Update or add new row
            if (originalRows && row) {
                let newRows = deepCopy(originalRows)

                // Update the current row
                if (newRows[rowIndex]) {
                    newRows[rowIndex] = row
                }

                // Otherwise, add a new row
                else if (newRows.length === rowIndex) {
                    newRows.push(row)
                }

                // Update tabularize object to update or add new row
                if (JSON.stringify(newRows) !== JSON.stringify(originalRows)) {
                    const updateMap = {
                        rows: newRows ? deepCopy(newRows) : []
                    }
                    props.updateTabularizeObject(updateMap)

                    // Update snack bar
                    if (originalRows.length === newRows.length) {
                        handleSnackBarSuccess("Row Successfully Updated")
                    } else {
                        handleSnackBarSuccess("New Row Successfully Added")
                    }
                }
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }

        // Close Dialog
        props.handleOpen()
    }

    // Return Method
    return (
        <Modal
            title={
                <div>
                    {`Edit Crypto Selection Table Row: ${props.rowIndex + 1}`}
                    <br/>
                    <label style={{fontWeight: "normal", fontSize: "13px", color: grayText}}
                    >{` (Press Confirm to Save Changes)`}
                    </label>
                </div>
            }
            content={(
                <div className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                    <SfrRequirements
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        component={props.component}
                        elementUUID={props.elementUUID}
                        elementTitle={props.elementTitle}
                        requirementType={props.requirementType}
                        rowIndex={props.rowIndex}
                        getSelectablesMaps={props.getSelectablesMaps}
                        getElementValuesByType={props.getElementValuesByType}
                        getSelectionBasedArrayByType={props.getSelectionBasedArrayByType}
                        showTabularizeTablePreview={props.showTabularizeTablePreview}
                        updateSfrSectionElement={props.updateSfrSectionElement}
                    />
                </div>
            )}
            open={props.open}
            handleOpen={() => {props.handleOpen()}}
            handleSubmit={handleSubmit}
        />
    );
}

// Export EditTabularizeRowModal.jsx
export default EditTabularizeRowModal;