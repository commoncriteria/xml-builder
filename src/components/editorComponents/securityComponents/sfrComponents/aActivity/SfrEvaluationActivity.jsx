// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_SFR_COMPONENT_ITEMS } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { GET_DEPENDENCY_MAP, RESET_EVALUATION_ACTIVITY_UI, UPDATE_EVALUATION_ACTIVITY_UI_ITEMS } from "../../../../../reducers/SFRs/evaluationActivitiesUI.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import SfrIntroduction from "./SfrIntroduction.jsx";
import SfrTss from "./SfrTss.jsx";
import SfrGuidance from "./SfrGuidance.jsx";
import SfrTestListSection from "./SfrTestListSection.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import SfrNoTestToggle from "./SfrNoTestToggle.jsx";
import SfrNoTest from "./SfrNoTest.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import { v4 as uuidv4 } from 'uuid';

/**
 * The SfrEvaluationActivity class that displays the evaluation activities for specified components/elements
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrEvaluationActivity(props) {
    // Prop Validation
    SfrEvaluationActivity.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        elementMaps: PropTypes.object.isRequired,
    };

    // Constants
    const { handleSnackBarSuccess, handleSnackBarError } = SecurityComponents
    const { primary, secondary, icons } = useSelector((state) => state.styling);
    const dispatch = useDispatch();
    const sfrSections = useSelector((state) => state.sfrSections);
    const evaluationActivities = useSelector((state) => state.evaluationActivities)
    const [openEvaluationActivity, setOpenEvaluationActivity] = useState(true)

    // Use Effects
    useEffect(() => {
        initializeValues(props.elementMaps, props.sfrUUID, props.componentUUID)
    }, [props])

    // Methods
    const sfrElementSort = (sfrArray) => {
        // Sort the SFR elements in ascending order
        sfrArray.sort((a, b) => {
            const getLastNumber = (str) => parseInt(str.substring(str.lastIndexOf('.') + 1), 10);
            return getLastNumber(a) - getLastNumber(b);
        });
    }

    const initializeValues = (elementMaps, sfrUUID, componentUUID) => {
        let mainDropdown = { Component: [], Elements: [] }
        let newDropdown = { Component: [], Elements: [] }
        let activities = getEvaluationActivitiesList()

        // Run through activities and add to main dropdown
        if (activities) {
            Object.keys(activities).forEach((uuid) => {
                // Add components to dropdown
                if (elementMaps.componentUUID === uuid && !mainDropdown.Component.includes(elementMaps.componentName)) {
                    mainDropdown.Component.push(elementMaps.componentName)
                } else if (elementMaps.elementUUIDMap.hasOwnProperty(uuid)) {
                    let name = elementMaps.elementUUIDMap[uuid]
                    if (!mainDropdown.Elements.includes(name)) {
                        mainDropdown.Elements.push(name)
                    }
                }
            })
            sfrElementSort(mainDropdown.Elements);
        }

        // Run through remaining components/elements and add to new evaluation activity dropdown options
        if (!mainDropdown.Component.includes(elementMaps.componentName) && !newDropdown.Component.includes(elementMaps.componentName)) {
            newDropdown.Component.push(elementMaps.componentName)
        }
        elementMaps.elementNames.forEach((name) => {
            if (!mainDropdown.Elements.includes(name) && !newDropdown.Elements.includes(name)) {
                newDropdown.Elements.push(name)
            }
        })
        sfrElementSort(newDropdown.Elements);

        // Get dependency map
        let dependencies = getDependencyMap(sfrUUID, componentUUID, elementMaps)

        // Update State
        let updateMap = {}
        if (mainDropdown && (JSON.stringify(evaluationActivities.evaluationActivityDropdown) !== JSON.stringify(mainDropdown))) {
            updateMap.evaluationActivityDropdown = mainDropdown
        }
        if (newDropdown && (JSON.stringify(evaluationActivities.newEvaluationActivityDropdown) !== JSON.stringify(newDropdown))) {
            updateMap.newEvaluationActivityDropdown = newDropdown
        }
        if (dependencies && (JSON.stringify(evaluationActivities.dependencyMap) !== JSON.stringify(dependencies))) {
            updateMap.dependencyMap = dependencies
        }
        updateEvaluationActivitiesUI(updateMap)
    }
    const handleSetOpenEvaluationActivity = () => {
        setOpenEvaluationActivity(!openEvaluationActivity)
    }
    const handleSelectEvaluationActivity = (title, selections) => {
        if (selections) {
            let updateMap = { selectedEvaluationActivity: selections, selectedUUID: "" }
            if (props.elementMaps && props.elementMaps.hasOwnProperty("componentName") &&
                props.elementMaps.hasOwnProperty("componentUUID") &&
                props.elementMaps.componentName === selections[0]) {
                updateMap.selectedUUID = props.elementMaps.componentUUID
            } else if (props.elementMaps && props.elementMaps.hasOwnProperty("elementNameMap") &&
                props.elementMaps.elementNameMap.hasOwnProperty(selections[0])) {
                updateMap.selectedUUID = props.elementMaps.elementNameMap[selections[0]]
            }
            updateEvaluationActivitiesUI(updateMap)
        }
    }
    const handleNewSelectedEvaluationActivity = (title, selections) => {
        if (selections && (JSON.stringify(evaluationActivities.newSelectedEvaluationActivity) !== JSON.stringify(selections))) {
            updateEvaluationActivitiesUI({ newSelectedEvaluationActivity: selections })
        }
    }
    const handleSubmitNewEvaluationActivities = () => {
        if (evaluationActivities.newSelectedEvaluationActivity && evaluationActivities.newSelectedEvaluationActivity.length > 0) {
            let selected = evaluationActivities.newSelectedEvaluationActivity
            let mainDropdown = evaluationActivities.evaluationActivityDropdown
            let activities = getEvaluationActivitiesList()
            if (selected && selected.length > 0 && mainDropdown && props.elementMaps) {
                selected.forEach((name) => {
                    let uuid;
                    if (props.elementMaps.hasOwnProperty("componentName") && props.elementMaps.componentName === name && !mainDropdown.Component.includes(name)) {
                        uuid = props.elementMaps.componentUUID
                    } else if (props.elementMaps.hasOwnProperty("elementNameMap") && props.elementMaps.elementNameMap.hasOwnProperty(name) && !mainDropdown.Elements.includes(name)) {
                        uuid = props.elementMaps.elementNameMap[name]
                    }
                    if (uuid && !activities.hasOwnProperty(uuid)) {
                        activities[uuid] = {
                            isNoTest: false,
                            noTest: "",
                            introduction: "",
                            tss: "",
                            guidance: "",
                            testIntroduction: "",
                            testList: []
                        }
                    }
                })
                updateEvaluationActivities(activities)
                dispatch(RESET_EVALUATION_ACTIVITY_UI())

                // Update snackbar
                handleSnackBarSuccess("New Evaluation Activity Successfully Added")
            }
        }
    }
    const handleDeleteEvaluationActivity = () => {
        let activities = getEvaluationActivitiesList()
        let uuid = evaluationActivities.selectedUUID
        if (uuid && uuid !== "") {
            if (uuid && activities.hasOwnProperty(uuid)) {
                delete activities[uuid];
                updateEvaluationActivities(activities)
                updateEvaluationActivitiesUI({ selectedUUID: "", selectedEvaluationActivity: [] })

                // Update snackbar
                handleSnackBarSuccess("Evaluation Activity Successfully Removed")
            }
        }
    }
    const handleTextUpdate = (event, type, index, uuid) => {
        let activities = getEvaluationActivitiesList()

        if (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid)) {
            if (type === "introduction") {
                activities[uuid].introduction = event
            } else if (type === "tss") {
                activities[uuid].tss = event
            } else if (type === "guidance") {
                activities[uuid].guidance = event
            } else if (type === "testIntroduction") {
                activities[uuid].testIntroduction = event
            } else if (type === "noTest") {
                activities[uuid].noTest = event
            }

            // Update evaluation activities
            updateEvaluationActivities(activities)
        }
    }
    const handleNewTestList = (activities, uuid) => {
        if (activities && uuid && uuid !== "") {
            if (!activities[uuid].hasOwnProperty("testList")) {
                activities[uuid].testList = []
            }
            activities[uuid].testList.push({
                testListUUID: uuidv4(),
                description: "",
                tests: [{ dependencies: [], objective: "" }]
            })
            updateEvaluationActivities(activities)

            // Update snackbar
            handleSnackBarSuccess("New Test List Successfully Added")
        }
    }
    const handleNewNestedTestList = (activities, uuid, parentTestUUID) => {
        if (!activities || !uuid || uuid === "" || !parentTestUUID) {
            console.error("Missing required parameters.");
            return;
        }
    
        const findTestByUUID = (tests) => {
            for (const test of tests) {
                if (test.uuid === parentTestUUID) {
                    return test;
                }
                if (Array.isArray(test.nestedTests)) {
                    const found = findTestByUUID(test.nestedTests);
                    if (found) return found;
                }
            }
            return null;
        };
    
        const testList = activities[uuid]?.testList;
        if (!Array.isArray(testList)) {
            console.error("Test list not found for the given UUID.");
            return;
        }
    
        for (const list of testList) {
            const parentTest = findTestByUUID(list.tests || []);
            if (parentTest) {
                if (!Array.isArray(parentTest.nestedTests)) {
                    parentTest.nestedTests = [];
                }
                parentTest.nestedTests.push({
                    testListUUID: uuidv4(),
                    dependencies: [],
                    objective: "",
                    nestedTests: []
                });
                updateEvaluationActivities(activities);
                handleSnackBarSuccess("New Nested Test List Successfully Added");
                return;
            }
        }
    
        console.error("Parent test not found for the given UUID.");
        handleSnackBarError("Failed to add nested test list.");
    }
    const handleNoTestToggle = (isNoTest, uuid) => {
        let activities = getEvaluationActivitiesList()

        if (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid)) {
            activities[uuid] = {
                isNoTest: isNoTest,
                noTest: "",
                introduction: "",
                tss: "",
                guidance: "",
                testIntroduction: "",
                testList: [],
            }

            // Update evaluation activities
            updateEvaluationActivities(activities)
        }
    }

    // Helper Methods
    const getEvaluationActivitiesList = () => {
        return sfrSections[props.sfrUUID][props.componentUUID].evaluationActivities ?
            deepCopy(sfrSections[props.sfrUUID][props.componentUUID].evaluationActivities) : {}
    }
    const updateEvaluationActivities = (activities) => {
        let originalActivities = getEvaluationActivitiesList()
        if (JSON.stringify(originalActivities) !== JSON.stringify(activities)) {
            let itemMap = { evaluationActivities: activities }
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({ sfrUUID: props.sfrUUID, uuid: props.componentUUID, itemMap: itemMap }))
        }
    }
    const updateEvaluationActivitiesUI = (updateMap) => {
        dispatch(UPDATE_EVALUATION_ACTIVITY_UI_ITEMS({ updateMap: updateMap }))
    }

    // Methods
    const getDependencyMap = () => {
        return dispatch(
            GET_DEPENDENCY_MAP({
                sfrUUID: props.sfrUUID,
                componentUUID: props.componentUUID,
                elementMaps: props.elementMaps,
                sfrSections: deepCopy(sfrSections)
            }
        )).payload.dependencies
    }
    const getSections = () => {
        const selected = evaluationActivities.selectedEvaluationActivity
        let activities = getEvaluationActivitiesList()
        let uuid = evaluationActivities.selectedUUID
        let testIntroduction = activities[uuid].hasOwnProperty("testIntroduction") ? deepCopy(activities[uuid].testIntroduction) : ""
        let testClosing = activities[uuid].hasOwnProperty("testClosing") ? deepCopy(activities[uuid].testClosing) : ""
        let testList = activities[uuid].hasOwnProperty("testList") ? deepCopy(activities[uuid].testList) : []
        let isNoTest = activities.hasOwnProperty(uuid) && activities[uuid].hasOwnProperty("isNoTest") ? activities[uuid].isNoTest : false

        if (isNoTest) {
            return (
                <div className="mt-2">
                    <SfrNoTest
                        selected={selected}
                        activities={activities}
                        uuid={uuid}
                        handleTextUpdate={handleTextUpdate}
                    />
                </div>
            )
        } else {
            return (
                <div className="mt-2">
                    <SfrIntroduction
                        selected={selected}
                        activities={activities}
                        uuid={uuid}
                        handleTextUpdate={handleTextUpdate}
                    />
                    <SfrTss
                        selected={selected}
                        activities={activities}
                        uuid={uuid}
                        handleTextUpdate={handleTextUpdate}
                    />
                    <SfrGuidance
                        selected={selected}
                        activities={activities}
                        uuid={uuid}
                        handleTextUpdate={handleTextUpdate}
                    />
                    <SfrTestListSection
                        selected={selected}
                        activities={activities}
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        uuid={uuid}
                        testIntroduction={testIntroduction}
                        testClosing={testClosing}
                        testList={testList}
                        elementMaps={props.elementMaps}
                        handleTextUpdate={handleTextUpdate}
                        handleNewTestList={handleNewTestList}
                        updateEvaluationActivities={updateEvaluationActivities}
                        updateEvaluationActivitiesUI={updateEvaluationActivitiesUI}
                        handleNewNestedTestList={handleNewNestedTestList}
                    />
                </div>
            )
        }
    }
    const noTestToggle = () => {
        const activities = getEvaluationActivitiesList()
        const uuid = evaluationActivities.selectedUUID
        const isNoTest = activities.hasOwnProperty(uuid) && activities[uuid].hasOwnProperty("isNoTest") ? activities[uuid].isNoTest : false

        if (activities.hasOwnProperty(uuid)) {
            return (
                <SfrNoTestToggle
                    isNoTest={isNoTest}
                    handleNoTestToggle={handleNoTestToggle}
                    isManagementFunction={false}
                    uuid={uuid}
                />
            )
        }
    }

    // Return Method
    return (
        <div>
            <CardTemplate type={"parent"} title={"Evaluation Activities"} tooltip={"Evaluation Activities"}
                collapse={openEvaluationActivity} collapseHandler={handleSetOpenEvaluationActivity}
                body={
                    <div className="mb-2">
                        <div className="mt-4 px-4 w-full">
                            <span className="flex justify-stretch min-w-full">
                                <div className="flex justify-center w-full">
                                    <div className="w-full">
                                        <MultiSelectDropdown
                                            selectionOptions={evaluationActivities.evaluationActivityDropdown}
                                            selections={evaluationActivities.selectedEvaluationActivity}
                                            title={"Evaluation Activity"}
                                            handleSelections={handleSelectEvaluationActivity}
                                            multiple={false}
                                        />
                                    </div>
                                    {noTestToggle()}
                                    <IconButton
                                        key={"DeleteEvaluationActivityButton"}
                                        disabled={evaluationActivities.selectedEvaluationActivity &&
                                        evaluationActivities.selectedEvaluationActivity.length > 0 ? false : true}
                                        onClick={handleDeleteEvaluationActivity}
                                        variant="contained">
                                        <Tooltip
                                            title={"Delete Evaluation Activity"}
                                            id={props.componentUUID + "DeleteEvaluationActivityTooltip"}
                                        >
                                            <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large}/>
                                        </Tooltip>
                                    </IconButton>
                                </div>
                            </span>
                        </div>
                        {evaluationActivities.selectedEvaluationActivity && evaluationActivities.selectedEvaluationActivity.length > 0 ?
                            getSections()
                            : null
                        }
                    </div>
                }
                footer={
                    <div
                        className="min-w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white"
                        key={"NewEvaluationActivityFooter"}
                    >
                        <div className="p-3 px-4 w-full">
                            <span className="w-full inline-flex items-baseline">
                                <div className="w-[96%]">
                                    <MultiSelectDropdown
                                        selectionOptions={evaluationActivities.newEvaluationActivityDropdown}
                                        selections={evaluationActivities.newSelectedEvaluationActivity}
                                        title={"Evaluation Activities"}
                                        handleSelections={handleNewSelectedEvaluationActivity}
                                        style={"primary"}
                                    />
                                </div>
                                <div className="w-[4%]">
                                    <IconButton
                                        sx={{ marginBottom: "-32px" }}
                                        key={"NewEvaluationActivitiesButton"}
                                        disabled={evaluationActivities.newSelectedEvaluationActivity &&
                                            evaluationActivities.newSelectedEvaluationActivity.length > 0 ? false : true}
                                        onClick={handleSubmitNewEvaluationActivities}
                                        variant="contained"
                                    >
                                        <Tooltip
                                            title={"Add New Evaluation Activities"}
                                            id={props.componentUUID + "addNewEvaluationActivityTooltip"}
                                        >
                                            <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
                                        </Tooltip>
                                    </IconButton>
                                </div>
                            </span>
                        </div>
                    </div>
                }
            />
        </div>
    );
}

// Export SfrEvaluationActivity.jsx
export default SfrEvaluationActivity;