// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import TextEditor from "../../../TextEditor.jsx";

/**
 * The SfrTest class that displays the evaluation activity test for specified components/elements
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrTest(props) {
    // Prop Validation
    SfrTest.propTypes = {
        activities: PropTypes.object.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        test: PropTypes.object.isRequired,
        testListIndex: PropTypes.number.isRequired,
        index: PropTypes.number.isRequired,
        dependencyMenuOptions: PropTypes.object.isRequired,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        updateEvaluationActivities: PropTypes.func,
        updateManagementFunctions: PropTypes.func,
        getElementValuesByType: PropTypes.func,
    };

    // Constants
    const evaluationActivities = useSelector((state) => state.evaluationActivities)
    const { secondary, icons } = useSelector((state) => state.styling);
    const [selected, setSelected] = useState([]);

    // Use Effect
    useEffect(() => {
       updateDependencyDropdown(selected)
    }, [selected, props])

    // Methods
    const updateDependencyDropdown = (selected) => {
        if (props.test && props.test.hasOwnProperty("dependencies")) {
            let newSelectables = [...new Set(convertDependenciesFromUUID(props.test.dependencies))]
            let validSelections = []
            newSelectables?.forEach((selection) => {
                if (props.dependencyMenuOptions.hasOwnProperty("Platforms") &&
                    props.dependencyMenuOptions.Platforms.includes(selection) &&
                    !validSelections.includes(selection)) {
                    validSelections.push(selection)
                }
                if (props.dependencyMenuOptions.hasOwnProperty("Selectables") &&
                    props.dependencyMenuOptions.Selectables.includes(selection) &&
                    !validSelections.includes(selection)) {
                    validSelections.push(selection)
                }
                if (props.dependencyMenuOptions.hasOwnProperty("ComplexSelectablesEA") &&
                    props.dependencyMenuOptions.ComplexSelectablesEA.includes(selection) &&
                    !validSelections.includes(selection)) {
                    validSelections.push(selection)
                }
            })
            if (JSON.stringify(validSelections) !== JSON.stringify(selected)) {
                setSelected(validSelections)
            }
        }
    }
    const handleTextUpdate = (event, type, index, uuid) => {
        try {
            const { activities, testListIndex } = props
            if (props.isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions")
                let tests = managementFunctions.rows[props.rowIndex].evaluationActivity.testList[testListIndex].tests[index]

                if (JSON.stringify(tests.objective) !== JSON.stringify(event)) {
                    tests.objective = event

                    // Update management functions
                    props.updateManagementFunctions(managementFunctions)
                }
            } else if (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid)) {
                let activitiesCopy = JSON.parse(JSON.stringify(activities))
                activitiesCopy[uuid].testList[testListIndex].tests[index].objective = event

                // Update evaluation activities
                props.updateEvaluationActivities(activitiesCopy)
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleSelect = (title, selections) => {
        try {
            const { isManagementFunction, activities, index, testListIndex, uuid, test, dependencyMenuOptions } = props
            const isValid = (selections && activities.hasOwnProperty(uuid) && dependencyMenuOptions)
            if ((isManagementFunction && dependencyMenuOptions) || isValid) {
                let validSelections = []
                const menuProperties = [
                    "Platforms",
                    "Selectables",
                    "ComplexSelectablesEA"
                ]
                selections?.forEach((selection) => {
                    menuProperties.forEach((menuProperty) => {
                        if (dependencyMenuOptions.hasOwnProperty(menuProperty) &&
                            dependencyMenuOptions[menuProperty].includes(selection) &&
                            !validSelections.includes(selection)) {
                            validSelections.push(selection)
                        }
                    })
                })
                let newSelections = [...new Set(convertDependenciesToUUID(validSelections))]
                let dependencies = JSON.parse(JSON.stringify(test.dependencies))
                if (JSON.stringify(dependencies) !== JSON.stringify(newSelections)) {
                    if (isManagementFunction) {
                        let managementFunctions = props.getElementValuesByType("managementFunctions")
                        let testItem = managementFunctions.rows[props.rowIndex].evaluationActivity.testList[testListIndex].tests[index]

                        if (JSON.stringify(testItem.dependencies) !== JSON.stringify(newSelections)) {
                            testItem.dependencies = newSelections

                            // Update management functions
                            props.updateManagementFunctions(managementFunctions)
                        }

                    } else {
                        let activitiesCopy = JSON.parse(JSON.stringify(activities))
                        let testItem = activitiesCopy[uuid].testList[testListIndex].tests[index]
                        testItem.dependencies = newSelections

                        // Update evaluation activities
                        props.updateEvaluationActivities(activitiesCopy)
                    }
                    setSelected(selections)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleDeleteTest = (index) => {
        try {
            const { isManagementFunction, activities, testListIndex, uuid } = props
            if (isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions")
                let tests = managementFunctions.rows[props.rowIndex].evaluationActivity.testList[testListIndex].tests
                tests.splice(index, 1)

                // Update management functions
                props.updateManagementFunctions(managementFunctions)
            } else if (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid)) {
                let activitiesCopy = JSON.parse(JSON.stringify(activities))
                let tests = activitiesCopy[uuid].testList[testListIndex].tests
                tests.splice(index, 1)

                // Update evaluation activities
                props.updateEvaluationActivities(activitiesCopy)
            }
        } catch (e) {
            console.log(e)
        }
    }

    // Helper Methods
    const convertDependenciesToUUID = (dependencies) => {
        let convertedDependencies = []
        try {
            if (dependencies && dependencies.length > 0) {
                dependencies.forEach((dependency) => {
                    if (evaluationActivities && evaluationActivities.hasOwnProperty("dependencyMap") &&
                        evaluationActivities.dependencyMap.hasOwnProperty("selectablesToUUID")) {
                        let newDependency = dependency
                        if (evaluationActivities.dependencyMap.selectablesToUUID.hasOwnProperty(dependency)) {
                            newDependency = evaluationActivities.dependencyMap.selectablesToUUID[dependency]
                        }
                        if (!convertedDependencies.includes(newDependency)) {
                            convertedDependencies.push(newDependency)
                        }
                    }
                })
            }
        } catch (e) {
            console.log(e)
        }
        return convertedDependencies
    }
    const convertDependenciesFromUUID = (dependencies) => {
        let convertedDependencies = []
        try {
            if (dependencies && dependencies.length > 0) {
                dependencies.forEach((dependency) => {
                    if (evaluationActivities && evaluationActivities.hasOwnProperty("dependencyMap") &&
                        evaluationActivities.dependencyMap.hasOwnProperty("uuidToSelectables")) {
                        let newDependency = dependency.valueOf()
                        if (evaluationActivities.dependencyMap.uuidToSelectables.hasOwnProperty(dependency)) {
                            newDependency = evaluationActivities.dependencyMap.uuidToSelectables[dependency]
                        }
                        if (!convertedDependencies.includes(newDependency)) {
                            convertedDependencies.push(newDependency)
                        }
                    }
                })
            }
        } catch (e) {
            console.log(e)
        }
        return convertedDependencies
    }

    // Return Method
    return (
        <CardTemplate
            type={"section"}
            header={
                <div className="w-full p-0 m-0 my-[-6px]">
                    <span className="flex justify-stretch min-w-full">
                        <div className="flex justify-center w-full pl-4">
                            <label className="resize-none font-bold text-[13px] p-0 m-0 text-accent pr-1 mt-[6px]">{`Test ${(props.index + 1)}`}</label>
                            <IconButton
                                variant="contained"
                                sx={{marginTop: "-8px", margin: 0, padding: 0}}
                                onClick={() => {handleDeleteTest(props.index)}}
                            >
                                <Tooltip
                                    title={`Delete Test ${(props.index + 1)}`}
                                    id={"deleteTestTooltip" + (props.index + 1)}
                                >
                                    <DeleteForeverRoundedIcon htmlColor={ secondary } sx={ icons.small }/>
                                </Tooltip>
                            </IconButton>
                        </div>
                    </span>
                </div>
            }
            body={
                <div className="w-full p-0 m-0 mt-[-8px] mb-[2px]">
                    <div className="w-full pb-4 pt-2">
                        <MultiSelectDropdown
                            selectionOptions={props.dependencyMenuOptions}
                            selections={selected}
                            title={"Dependencies"}
                            index={props.index}
                            handleSelections={handleSelect}
                            style={"primary"}
                        />
                    </div>
                    <TextEditor
                        className="w-full"
                        contentType={"term"}
                        title={"objective"}
                        index={props.index}
                        uuid={props.uuid}
                        text={props.test.objective ? props.test.objective : ""}
                        handleTextUpdate={handleTextUpdate}
                    />
                </div>
            }
        />
    )
}

// Export SfrTest.jsx
export default SfrTest;