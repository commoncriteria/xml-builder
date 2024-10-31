// Imports
import React from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION } from "../../reducers/SFRs/sfrSectionSlice.js";
import ApplicationNote from "../editorComponents/securityComponents/sfrComponents/ApplicationNote.jsx";
import Modal from "./Modal.jsx";
import SfrRequirements from "../editorComponents/securityComponents/sfrComponents/requirements/SfrRequirements.jsx";
import SfrManagementEvaluationActivity from "../editorComponents/securityComponents/sfrComponents/aActivity/SfrManagementEvaluationActivity.jsx";

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
        getElementMaps: PropTypes.func.isRequired,
        allSfrOptions: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
        showManagementFunctionPreview: PropTypes.func.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
    };

    // Constants
    const dispatch = useDispatch();

    // Helper Methods
    const initializeManagementFunctions = (type) => {
        let managementFunctions = JSON.parse(JSON.stringify(props.getElementValuesByType("managementFunctions")))
        let row = managementFunctions.rows[props.rowIndex]
        if (!row.hasOwnProperty(type)) {
            if (type === "evaluationActivity") {
                row.evaluationActivity = {
                    introduction: "",
                    tss: "",
                    guidance: "",
                    testIntroduction: "",
                    testClosing: "",
                    testList: []
                }
            } else {
                row[type] = []
            }
        }

        return managementFunctions
    }
    const getCurrentManagementFunction = (type) => {
        const currentManagementFunction = JSON.parse(JSON.stringify(
            dispatch(GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION({
                sfrUUID: props.sfrUUID,
                componentUUID: props.componentUUID,
                elementUUID: props.elementUUID,
                rowIndex: props.rowIndex
            })).payload.element[type]))
        return currentManagementFunction
    }
    const updateManagementFunctions = (managementFunctions) => {
        let itemMap = {
            managementFunctions: managementFunctions
        }
        props.updateSfrSectionElement(props.elementUUID, props.componentUUID, itemMap)
    }
    const updateApplicationNote = (event, title, index) => {
        let managementFunctions = initializeManagementFunctions("note");
        let note = managementFunctions.rows[props.rowIndex].note

        if (JSON.stringify(note[index]) !== JSON.stringify(event)) {
            note[index] = event
            updateManagementFunctions(managementFunctions)
        }
    }
    const addApplicationNote = () => {
        let managementFunctions = initializeManagementFunctions("note");
        managementFunctions.rows[props.rowIndex].note.push("")
        updateManagementFunctions(managementFunctions)
    }
    const deleteApplicationNote = (index) => {
        let managementFunctions = initializeManagementFunctions("note");
        managementFunctions.rows[props.rowIndex].note.splice(index, 1)
        updateManagementFunctions(managementFunctions)
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
                        getElementMaps={props.getElementMaps}
                        allSfrOptions={props.allSfrOptions}
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
                        deleteApplicationNote={deleteApplicationNote}
                        addApplicationNote={addApplicationNote}
                        getCurrentManagementFunction={getCurrentManagementFunction}
                        rowIndex={props.rowIndex}
                    />
                    <SfrManagementEvaluationActivity
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        elementUUID={props.elementUUID}
                        elementTitle={props.elementTitle}
                        rowIndex={props.rowIndex}
                        getElementMaps={props.getElementMaps}
                        initializeManagementFunctions={initializeManagementFunctions}
                        getCurrentManagementFunction={getCurrentManagementFunction}
                        updateManagementFunctions={updateManagementFunctions}
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