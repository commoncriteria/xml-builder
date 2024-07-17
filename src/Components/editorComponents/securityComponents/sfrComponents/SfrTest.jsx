// Imports
import {IconButton, Tooltip} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import TextEditor from "../../TextEditor.jsx";
import SfrCard from "./SfrCard.jsx";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";

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
        updateEvaluationActivities: PropTypes.func.isRequired
    };

    // Constants
    const evaluationActivities = useSelector((state) => state.evaluationActivities)
    const style = {primary: "#d926a9", secondary: "#1FB2A6"}
    const [selected, setSelected] = useState([]);

    // Use Effect
    useEffect(() => {
       updateDependencyDropdown(selected)
    }, [selected])

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
        const { activities, testListIndex } = props
        const isValid = (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid))
        if (isValid) {
            let activitiesCopy = JSON.parse(JSON.stringify(activities))
            activitiesCopy[uuid].testList[testListIndex].tests[index].objective = event

            // Update evaluation activities
            props.updateEvaluationActivities(activitiesCopy)
        }
    }
    const handleSelect = (title, selections) => {
        try {
            const { activities, index, testListIndex, uuid, test, dependencyMenuOptions } = props
            const isValid = (selections && activities.hasOwnProperty(uuid) && dependencyMenuOptions)
            if (isValid) {
                let validSelections = []
                selections?.forEach((selection) => {
                    if (dependencyMenuOptions.hasOwnProperty("Platforms") &&
                        dependencyMenuOptions.Platforms.includes(selection) &&
                        !validSelections.includes(selection)) {
                        validSelections.push(selection)
                    }
                    if (dependencyMenuOptions.hasOwnProperty("Selectables") &&
                        dependencyMenuOptions.Selectables.includes(selection) &&
                        !validSelections.includes(selection)) {
                        validSelections.push(selection)
                    }
                    if (dependencyMenuOptions.hasOwnProperty("ComplexSelectablesEA") &&
                        dependencyMenuOptions.ComplexSelectablesEA.includes(selection) &&
                        !validSelections.includes(selection)) {
                        validSelections.push(selection)
                    }
                })
                let newSelections = [...new Set(convertDependenciesToUUID(validSelections))]
                let dependencies = JSON.parse(JSON.stringify(test.dependencies))
                if (JSON.stringify(dependencies) !== JSON.stringify(newSelections)) {
                    let activitiesCopy = JSON.parse(JSON.stringify(activities))
                    activitiesCopy[uuid].testList[testListIndex].tests[index].dependencies = newSelections
                    props.updateEvaluationActivities(activitiesCopy)
                    setSelected(selections)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    const handleDeleteTest = (index) => {
        const { activities, testListIndex, uuid } = props
        const isValid = (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid))
        if (isValid) {
            let activitiesCopy = JSON.parse(JSON.stringify(activities))
            activitiesCopy[uuid].testList[testListIndex].tests.splice(index, 1)
            props.updateEvaluationActivities(activitiesCopy)
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
        <SfrCard
            type={"section"}
            header={
                <div className="w-full p-0 m-0 my-[-6px]">
                    <span className="flex justify-stretch min-w-full">
                        <div className="flex justify-center w-full pl-4">
                            <label className="resize-none font-bold text-[16px] p-0 m-0 text-accent pr-1 mt-[6px]">{`Test ${(props.index + 1)}`}</label>
                            <IconButton sx={{marginTop: "-8px", margin: 0, padding: 0}} onClick={() => {handleDeleteTest(props.index)}}>
                                <Tooltip title={`Delete Test ${(props.index + 1)}`}>
                                    <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 26, height: 26 }}/>
                                </Tooltip>
                            </IconButton>
                        </div>
                    </span>
                </div>
            }
            body={
                <div className="w-full p-0 m-0 mt-[-8px] mb-[2px]">
                    <div className="w-full pb-4 pt-2">
                        <MultiSelectDropdown selectionOptions={props.dependencyMenuOptions}
                                             selections={selected}
                                             title={"Dependencies"}
                                             index={props.index}
                                             handleSelections={handleSelect}
                        />
                    </div>
                    <TextEditor className="w-full" contentType={"term"} title={"objective"} index={props.index}
                                uuid={props.uuid} text={props.test.objective ? props.test.objective : ""}
                                handleTextUpdate={handleTextUpdate}/>
                </div>
            }
        />
    )
}

// Export SfrTest.jsx
export default SfrTest;