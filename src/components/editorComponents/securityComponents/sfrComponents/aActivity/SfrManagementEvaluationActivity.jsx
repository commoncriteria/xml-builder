// Imports
import PropTypes from "prop-types";
import React, { useState } from "react";
import CardTemplate from "../../CardTemplate.jsx";
import SfrIntroduction from "./SfrIntroduction.jsx";
import SfrTss from "./SfrTss.jsx";
import SfrGuidance from "./SfrGuidance.jsx";
import SfrTestListSection from "./SfrTestListSection.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import SfrNoTestToggle from "./SfrNoTestToggle.jsx";
import SfrNoTest from "./SfrNoTest.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import { v4 as uuidv4 } from 'uuid';

/**
 * The SfrManagementEvaluationActivity class that displays the evaluation activity for mangement functions
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrManagementEvaluationActivity(props) {
    // Prop Validation
    SfrManagementEvaluationActivity.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        rowIndex: PropTypes.number.isRequired,
        initializeManagementFunctions: PropTypes.func.isRequired,
        getCurrentManagementFunction: PropTypes.func.isRequired,
        updateManagementFunctions: PropTypes.func.isRequired,
        updateRefIds: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
    };

    // Constants
    const { getElementMaps, handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const [open, setOpen] = useState(true)

    // Methods
    const handleSetOpen = () => {
        setOpen(!open)
    }
    const handleTextUpdates = (event, type) => {
        try {
            let managementFunctions = props.initializeManagementFunctions("evaluationActivity")
            let activity = managementFunctions.rows[props.rowIndex].evaluationActivity

            // Update activity if it is not already the same value
            if (JSON.stringify(activity[type]) !== JSON.stringify(event)) {
                activity[type] = event

                // Update management functions
                props.updateManagementFunctions(managementFunctions)
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleNewTestList = () => {
        try {
            let managementFunctions = props.getElementValuesByType("managementFunctions")
            let activity = managementFunctions.rows[props.rowIndex].evaluationActivity
            if (!activity.hasOwnProperty("testList")) {
                activity.testList = []
            }
            activity.testList.push({
                description: "",
                tests: [{
                    uuid: uuidv4(),
                    dependencies: [],
                    objective: ""
                }]
            })

            // Update management functions
            props.updateManagementFunctions(managementFunctions)

            // Update snackbar
            handleSnackBarSuccess("New Test List Successfully Added")
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleNoTestToggle = (isNoTest) => {
        try {
            let managementFunctions = props.initializeManagementFunctions("evaluationActivity")

            // Update activity if it is not already the same value
            managementFunctions.rows[props.rowIndex].evaluationActivity = {
                isNoTest: isNoTest,
                noTest: "",
                introduction: "",
                tss: "",
                guidance: "",
                testIntroduction: "",
                testClosing: "",
                testList: [],
                refIds: []
            }

            // Update management functions
            props.updateManagementFunctions(managementFunctions)
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }

    // Helper Methods
    const updateRefIds = (title, event, index) => {
        const type = "aactivity"
        props.updateRefIds({ event, index, type })
    }

    // Components
    const getSections = () => {
        const { rowIndex, componentUUID, component } = props
        let { evaluationActivity, refIdOptions } = props.getCurrentManagementFunction()
        const selected = [props.elementTitle]
        const testIntroduction = evaluationActivity.testIntroduction ? deepCopy(evaluationActivity.testIntroduction) : ""
        const testList = evaluationActivity.testList ? deepCopy(evaluationActivity.testList) : []
        const elementMaps = deepCopy(getElementMaps(componentUUID, component))
        const testClosing = evaluationActivity.testClosing ? deepCopy(evaluationActivity.testClosing): ""
        const isNoTest = evaluationActivity.hasOwnProperty("isNoTest") ? evaluationActivity.isNoTest : false
        const refIds = evaluationActivity.refIds ? deepCopy(evaluationActivity.refIds) : []

        if (isNoTest) {
            return (
                <div className="mt-2">
                    <SfrNoTest
                        isManagementFunction={true}
                        activities={evaluationActivity}
                        rowIndex={rowIndex}
                        handleTextUpdate={handleTextUpdates}
                    />
                </div>
            )
        } else {
            return (
                <div className="mt-2">
                    <div className="w-full px-4 py-2">
                        <MultiSelectDropdown
                            title={"Included Management Function's"}
                            selections={refIds}
                            selectionOptions={refIdOptions}
                            handleSelections={updateRefIds}
                            index={rowIndex}
                        />
                    </div>
                    <SfrIntroduction
                        isManagementFunction={true}
                        activities={evaluationActivity}
                        rowIndex={rowIndex}
                        handleTextUpdate={handleTextUpdates}
                    />
                    <SfrTss
                        isManagementFunction={true}
                        activities={evaluationActivity}
                        rowIndex={rowIndex}
                        handleTextUpdate={handleTextUpdates}
                    />
                    <SfrGuidance
                        isManagementFunction={true}
                        activities={evaluationActivity}
                        rowIndex={rowIndex}
                        handleTextUpdate={handleTextUpdates}
                    />
                    <SfrTestListSection
                        selected={selected}
                        activities={evaluationActivity}
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        uuid={props.elementUUID}
                        testIntroduction={testIntroduction}
                        testClosing={testClosing}
                        testList={testList}
                        elementMaps={elementMaps}
                        rowIndex={rowIndex}
                        isManagementFunction={true}
                        handleTextUpdate={handleTextUpdates}
                        handleNewTestList={handleNewTestList}
                        updateManagementFunctions={props.updateManagementFunctions}
                        getElementValuesByType={props.getElementValuesByType}
                        handleNewNestedTestList={handleNewNestedTestList}
                    />
                </div>
            )
        }
    }
    const getNoTestToggle = () => {
        let evaluationActivity = props.getCurrentManagementFunction("evaluationActivity")
        let isNoTest = evaluationActivity.hasOwnProperty("isNoTest") ? evaluationActivity.isNoTest : false

        // Return Method
        return (
            <SfrNoTestToggle
                isNoTest={isNoTest}
                handleNoTestToggle={handleNoTestToggle}
                isManagementFunction={true}
            />
        )
    }

    // Return Method
    return (
        <div className="w-full px-4 pt-2">
            <CardTemplate
                type={"parent"}
                header={
                    <span className="flex justify-stretch min-w-full">
                        <div className="flex justify-left text-center w-full">
                            <label className="resize-none justify-start flex font-bold text-[14px] p-0 pr-4 text-secondary">Evaluation Activities</label>
                        </div>
                        { open &&
                            <div className="flex justify-end text-center w-[10%]">
                                {getNoTestToggle()}
                            </div>
                        }
                    </span>
                }
                tooltip={"Evaluation Activities for Management Function"}
                collapse={open}
                collapseHandler={handleSetOpen}
                borderColor={"border-gray-200"}
                body={getSections()}
            />
        </div>
    )
}

// Export SfrManagementEvaluationActivity.jsx
export default SfrManagementEvaluationActivity;