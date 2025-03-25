// Imports
import React from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION } from "../../reducers/SFRs/sfrSectionSlice.js";
import ApplicationNote from "../editorComponents/securityComponents/sfrComponents/ApplicationNote.jsx";
import Modal from "./Modal.jsx";
import SfrRequirements from "../editorComponents/securityComponents/sfrComponents/requirements/SfrRequirements.jsx";
import SfrManagementEvaluationActivity from "../editorComponents/securityComponents/sfrComponents/aActivity/SfrManagementEvaluationActivity.jsx";
import SecurityComponents from "../../utils/securityComponents.jsx";
import { deepCopy } from "../../utils/deepCopy.js";

/**
 * The EditManagementFunctionTable class that edits the management function text
 * @returns {JSX.Element}   management function text edit modal content
 * @constructor             passes in props to the class
 */
function EditManagementFunctionTable(props) {
    // Prop Validation
    EditManagementFunctionTable.propTypes = {
        rowIndex: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
        showManagementFunctionPreview: PropTypes.func.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
    };

    // Constants
    const { handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();

    // Helper Methods
    const initializeManagementFunctions = (type) => {
        let managementFunctions = deepCopy(props.getElementValuesByType("managementFunctions"))
        let row = managementFunctions.rows[props.rowIndex]
        if (!row.hasOwnProperty(type)) {
            if (type === "evaluationActivity") {
                row.evaluationActivity = {
                    isNoTest: false,
                    noTest: "",
                    introduction: "",
                    tss: "",
                    guidance: "",
                    testIntroduction: "",
                    testClosing: "",
                    testList: [],
                    refIds: []
                }
            } else {
                row[type] = []
            }
        }

        return managementFunctions
    }
    const getCurrentManagementFunction = (type) => {
        const { sfrUUID, componentUUID, elementUUID, rowIndex } = props;

        const payload = deepCopy(dispatch(GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION({
            sfrUUID,
            componentUUID,
            elementUUID,
            rowIndex
        })).payload.element);

        return type ? payload[type] : payload;
    };
    const updateManagementFunctions = (managementFunctions) => {
        let itemMap = {
            managementFunctions: managementFunctions
        }
        props.updateSfrSectionElement(props.elementUUID, props.componentUUID, itemMap)
    }
    const updateApplicationNote = (event, type, index) => {
        const { rowIndex } = props
        let managementFunctions = initializeManagementFunctions("note");
        let note = managementFunctions.rows[rowIndex].note

        // Update note
        if (type === "note") {
            if (!note[index].hasOwnProperty("note")) {
                note[index].note = ""
            }

            if (JSON.stringify(note[index].note) !== JSON.stringify(event)) {
                note[index].note = event
                updateManagementFunctions(managementFunctions)
            }
        }
        // Update refIds
        else if (type === "refIds") {
            if (!note[index].hasOwnProperty("refIds")) {
                note[index].refIds = []
            }

            if (JSON.stringify(note[index].refIds) !== JSON.stringify(event)) {
                note[index].refIds = event
                updateManagementFunctions(managementFunctions)
            }
        }
    }
    const updateEaRefIds = (event) => {
        const { rowIndex } = props
        let managementFunctions = initializeManagementFunctions("evaluationActivity");
        let evaluationActivity = managementFunctions.rows[rowIndex].evaluationActivity

        // Update refIds
        if (!evaluationActivity.hasOwnProperty("refIds")) {
            evaluationActivity.refIds = []
        }

        if (JSON.stringify(evaluationActivity.refIds) !== JSON.stringify(event)) {
            evaluationActivity.refIds = event
            updateManagementFunctions(managementFunctions)
        }
    }
    const updateRefIds = (data) => {
        const { event, index, type } = data
        if (event && event.length > 1) {
            event.sort((a, b) => {
                const lowerA = a.toLowerCase();
                const lowerB = b.toLowerCase();

                // Sort with lowercase sorting
                if (lowerA < lowerB) {
                    return -1;
                }
                if (lowerA > lowerB) {
                    return 1;
                }
                return 0;
            });
        }

        // Update application note
        if (type && type === "note") {
            updateApplicationNote(event, "refIds", index)
        }
        // Update evaluation activity
        else if (type && type === "aactivity") {
            updateEaRefIds(event)
        }
    }
    const addApplicationNote = () => {
        let managementFunctions = initializeManagementFunctions("note");
        managementFunctions.rows[props.rowIndex].note.push({
            note: "",
            refIds: []
        })
        updateManagementFunctions(managementFunctions)

        // Update snackbar
        handleSnackBarSuccess("Application Note Successfully Added")
    }
    const deleteApplicationNote = (index) => {
        let managementFunctions = initializeManagementFunctions("note");
        managementFunctions.rows[props.rowIndex].note.splice(index, 1)
        updateManagementFunctions(managementFunctions)

        // Update snackbar
        handleSnackBarSuccess("Application Note Successfully Removed")
    }

    // Return Method
    return (
        <Modal
            title={props.title}
            content={(props.open ?
                <div className="min-w-full">
                    <SfrRequirements
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        component={props.component}
                        elementUUID={props.elementUUID}
                        elementTitle={props.elementTitle}
                        getSelectablesMaps={props.getSelectablesMaps}
                        getElementValuesByType={props.getElementValuesByType}
                        getSelectionBasedArrayByType={props.getSelectionBasedArrayByType}
                        requirementType={"managementFunctions"}
                        rowIndex={props.rowIndex}
                        updateManagementFunctions={updateManagementFunctions}
                        showManagementFunctionPreview={props.showManagementFunctionPreview}
                        initializeManagementFunctions={initializeManagementFunctions}
                        getCurrentManagementFunction={getCurrentManagementFunction}
                        updateSfrSectionElement={props.updateSfrSectionElement}
                    />
                    <ApplicationNote
                        isManagementFunction={true}
                        updateApplicationNote={updateApplicationNote}
                        updateRefIds={updateRefIds}
                        deleteApplicationNote={deleteApplicationNote}
                        addApplicationNote={addApplicationNote}
                        getCurrentManagementFunction={getCurrentManagementFunction}
                        rowIndex={props.rowIndex}
                    />
                    <SfrManagementEvaluationActivity
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        component={props.component}
                        elementUUID={props.elementUUID}
                        elementTitle={props.elementTitle}
                        rowIndex={props.rowIndex}
                        initializeManagementFunctions={initializeManagementFunctions}
                        getCurrentManagementFunction={getCurrentManagementFunction}
                        updateManagementFunctions={updateManagementFunctions}
                        updateRefIds={updateRefIds}
                        getElementValuesByType={props.getElementValuesByType}
                    />
                </div>
                :
                <div></div>
            )}
            hideSubmit={true}
            open={props.open}
            handleOpen={() => {props.handleOpen()}}
        />
    );
}

// Export EditManagementFunctionTable.jsx
export default EditManagementFunctionTable;