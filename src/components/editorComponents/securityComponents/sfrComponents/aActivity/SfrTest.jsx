// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import SfrTestList from "./SfrTestList.jsx";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded.js";

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
        testListUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        initialIndex: PropTypes.number,
        nestedIndex: PropTypes.number,
        dependencyMenuOptions: PropTypes.object.isRequired,
        handleNewNestedTestList: PropTypes.func,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        updateEvaluationActivities: PropTypes.func,
        updateManagementFunctions: PropTypes.func,
        getElementValuesByType: PropTypes.func,
        isNested: PropTypes.bool,
        testUUID: PropTypes.string.isRequired,
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
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
    const handleTextUpdate = (event, type, index) => {
        try {
            const { activities, testListIndex, initialIndex, testListUUID, isNested, testUUID, uuid } = props
            if (props.isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions")
                let tests = managementFunctions.rows[props.rowIndex].evaluationActivity.testList[testListUUID].tests[testUUID]

                if (JSON.stringify(tests.objective) !== JSON.stringify(event)) {
                    tests.objective = event

                    // Update management functions
                    props.updateManagementFunctions(managementFunctions)
                }
            } else if (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid)) {
                let activitiesCopy = deepCopy(activities)
                
                // if (isNested)
                //     activitiesCopy[uuid].testList[testListUUID].tests[testUUID].nestedTests[testUUID].objective = event
                // else
                //     activitiesCopy[uuid].testList[testListUUID].tests[testUUID].objective = event
                if (!editTestRecursively(activitiesCopy, uuid, testUUID, event))
                    throw new Error(`Target UUID: ${testUUID} was not found!`)

                // Update evaluation activities
                props.updateEvaluationActivities(activitiesCopy)
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }

  
      const editTestRecursively = (activity, uuid, targetTestUUID, event) => {
        for (let i = 0; i < activity[uuid].testList.length; i++) {
            const testListItem = activity[uuid].testList[i];
    
            // Base case
            if (Array.isArray(testListItem.tests)) {
                for (let test of testListItem.tests) {
                    if (test.uuid === targetTestUUID) {
                        test.objective = event; 
                        return true; 
                    }
    
                    // recurse into nestedTestList
                    if (Array.isArray(test.nestedTests)) {
                        const found = editTestRecursively({     testList: test.nestedTests }, 
                            "testList", targetTestUUID, event);
                        if (found) 
                            return true;
                    }
                }
            }
        }
        return false;
    };

    const handleSelect = (title, selections) => {
        try {            
            const { isManagementFunction, activities, uuid, testUUID, rowIndex, test, dependencyMenuOptions } = props;

            const findTest = (tests) => {
                for (const test of tests) {
                    if (test.uuid === testUUID) return test;
                    if (Array.isArray(test.nestedTests)) {
                        const found = findTest(test.nestedTests);
                        if (found) return found;
                    }
                }
                return null;
            };
    
            const isValid = selections && activities?.hasOwnProperty(uuid) && dependencyMenuOptions;
            if (!((isManagementFunction && dependencyMenuOptions) || isValid)) return;

            let validSelections = [];
            const menuProperties = ["Platforms", "Selectables", "ComplexSelectablesEA"];
    
            selections?.forEach((selection) => {
                menuProperties.forEach((menuProperty) => {
                    if (dependencyMenuOptions[menuProperty]?.includes(selection)) {
                        if (!validSelections.includes(selection)) {
                            validSelections.push(selection);
                        }
                    }
                });
            });
    
            const newSelections = [...new Set(convertDependenciesToUUID(validSelections))];
            let dependencies = deepCopy(test.dependencies)

            let testItem = null;
            let obj = null;
            let testLists = [];
            if (JSON.stringify(dependencies) !== JSON.stringify(newSelections)) {
                if (isManagementFunction) {
                    obj = props.getElementValuesByType("managementFunctions");
                    testLists = obj.rows[rowIndex].evaluationActivity.testList;
                    
                } else if (uuid && activities?.hasOwnProperty(uuid)) {
                    obj = deepCopy(activities);
                    testLists = obj[uuid].testList;
                }
    
                for (const list of testLists) {
                    testItem = findTest(list.tests || []);
                    console.log(testItem)
                    if (testItem) break;
                }
    
                testItem.dependencies = newSelections;
    
                if (isManagementFunction) {
                    props.updateManagementFunctions(obj);
                } else {
                    props.updateEvaluationActivities(obj);
                }
    
                setSelected(selections);
            }

        } catch (e) {
            console.error(e);
            handleSnackBarError(e);
        }
    }    
    const handleDeleteTestByUUID = (targetTestUUID) => {
        try {
            const { uuid, activities, isManagementFunction, rowIndex } = props;
    
            const deleteTestRecursively = (testArray) => {
                for (let i = 0; i < testArray.length; i++) {
                    const test = testArray[i];
    
                    // Base case: test matches UUID
                    if (test.uuid === targetTestUUID) {
                        testArray.splice(i, 1);
                        return true;
                    }
    
                    // Recurse into nestedTests
                    if (Array.isArray(test.nestedTests)) {
                        const found = deleteTestRecursively(test.nestedTests);
                        if (found) return true;
                    }
                }
                return false;
            };
    
            const deleteTestFromTestLists = (testLists) => {
                for (const testList of testLists) {
                    if (deleteTestRecursively(testList.tests)) return true;
                }
                return false;
            };
    
            if (isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions");
                let testLists = managementFunctions.rows[rowIndex].evaluationActivity.testList;
    
                if (deleteTestFromTestLists(testLists)) {
                    props.updateManagementFunctions(managementFunctions);
                    handleSnackBarSuccess("Test successfully deleted");
                } else {
                    handleSnackBarError("Test not found");
                }
    
            } else if (uuid && activities?.hasOwnProperty(uuid)) {
                let activitiesCopy = deepCopy(activities);
                let testLists = activitiesCopy[uuid].testList;

                if (deleteTestFromTestLists(testLists)) {
                    props.updateEvaluationActivities(activitiesCopy);
                    handleSnackBarSuccess("Test successfully deleted");
                } else {
                    handleSnackBarError("Test not found");

                }
            }
        } catch (e) {
            console.error(e);
            handleSnackBarError("Failed to delete test.");
        }
    };
    
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
            handleSnackBarError(e)
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
            handleSnackBarError(e)
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
                                sx={{ marginTop: "-8px", margin: 0, padding: 0 }}
                                onClick={() => handleDeleteTestByUUID(props.testUUID)}
                            >
                                <Tooltip
                                    title={`Delete Test ${(props.index + 1)}`}
                                    id={"deleteTestTooltip" + (props.index + 1)}
                                >
                                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.small} />
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

                    <TipTapEditor
                        className="w-full"
                        contentType={"term"}
                        title={"objective"}
                        index={props.index}
                        uuid={props.uuid}
                        text={props.test.objective ? props.test.objective : ""}
                        handleTextUpdate={handleTextUpdate}
                    />

                    <div className="mt-2">
                        {props.test?.nestedTests && props.test?.nestedTests.length > 0 ? (
                            <SfrTestList
                                    activities={props.activities}
                                    sfrUUID={props.sfrUUID}
                                    componentUUID={props.componentUUID}
                                    uuid={props.uuid}
                                    testListIndex={props.testListIndex}
                                    testListDescription={""}
                                    tests={props.test?.nestedTests}
                                    initialIndex={props.index}
                                    isManagementFunction={props.isManagementFunction}
                                    rowIndex={props.rowIndex}
                                    dependencyDropdown={props.dependencyMenuOptions}
                                    updateEvaluationActivities={props.updateEvaluationActivities}
                                    updateManagementFunctions={props.updateManagementFunctions}
                                    getElementValuesByType={props.getElementValuesByType}
                                    isNested={true}
                                    handleNewNestedTestList={props.handleNewNestedTestList}
                                    testListUUID={props.test.nestedTests[0].testListUUID}
                                />
                            ) : (
                            <IconButton
                                sx={{marginBottom: "-8px"}}
                                key={"NewTestButton"}
                                variant="contained"
                                onClick={() => props.handleNewNestedTestList(props.activities, props.uuid, props.testUUID)}
                            >
                                <Tooltip
                                    title={"Add New Test List"}
                                    id={props.uuid + "AddNewTestListTooltip"}
                                >
                                    <AddCircleRoundedIcon htmlColor={ secondary } sx={ icons.medium }/>
                                </Tooltip>
                            </IconButton>
                        )}
                    </div>
                </div>
            }
        />
    )
}

// Export SfrTest.jsx
export default SfrTest;