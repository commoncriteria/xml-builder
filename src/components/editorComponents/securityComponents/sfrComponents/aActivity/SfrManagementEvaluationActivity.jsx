// Imports
import PropTypes from "prop-types";
import React, { useState } from "react";
import CardTemplate from "../../CardTemplate.jsx";
import SfrIntroduction from "./SfrIntroduction.jsx";
import SfrTss from "./SfrTss.jsx";
import SfrGuidance from "./SfrGuidance.jsx";
import SfrTestListSection from "./SfrTestListSection.jsx";

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
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        rowIndex: PropTypes.number.isRequired,
        getElementMaps: PropTypes.func.isRequired,
        initializeManagementFunctions: PropTypes.func.isRequired,
        getCurrentManagementFunction: PropTypes.func.isRequired,
        updateManagementFunctions: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
    };

    // Constants
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
                    dependencies: [],
                    objective: ""
                }]
            })

            // Update management functions
            props.updateManagementFunctions(managementFunctions)
        } catch (e) {
            console.log(e)
        }
    }

    // Components
    const getSections = () => {
        const { rowIndex } = props
        let evaluationActivity = props.getCurrentManagementFunction("evaluationActivity")
        const selected = [props.elementTitle]
        const testIntroduction = evaluationActivity.testIntroduction ? JSON.parse(JSON.stringify(evaluationActivity.testIntroduction)) : ""
        const testList = evaluationActivity.testList ? JSON.parse(JSON.stringify(evaluationActivity.testList)) : []
        const elementMaps = JSON.parse(JSON.stringify(props.getElementMaps()))
        const testClosing = evaluationActivity.testClosing ? JSON.parse(JSON.stringify(evaluationActivity.testClosing)): ""

        return (
            <div className="mt-2">
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
                />
            </div>
        )
    }

    // Return Method
    return (
        <div className="w-full px-4 pt-2">
            <CardTemplate
                type={"parent"}
                title={"Evaluation Activities"}
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