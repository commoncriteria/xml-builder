// Imports
import PropTypes from "prop-types";
import React, {useState} from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import CardTemplate from "../../CardTemplate.jsx";
import SfrTest from "./SfrTest.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * The SfrTestList class that displays the evaluation activity test list for specified components/elements
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrTestList(props) {
    // Prop Validation
    SfrTestList.propTypes = {
        activities: PropTypes.object.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        testListIndex: PropTypes.number.isRequired,
        testListDescription: PropTypes.string.isRequired,
        tests: PropTypes.array.isRequired,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        dependencyDropdown: PropTypes.object.isRequired,
        updateEvaluationActivities: PropTypes.func,
        updateManagementFunctions: PropTypes.func,
        getElementValuesByType: PropTypes.func,
        isNested: PropTypes.bool,
        handleNewNestedTestList: PropTypes.func.isRequired,
        testListUUID: PropTypes.string,
        initialIndex: PropTypes.number,
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const { primary, icons } = useSelector((state) => state.styling);
    const [collapse, setCollapse] = useState(false)
    const evaluationActivities = useSelector((state) => state.evaluationActivities)

    // Methods
    const handleNewTest = () => {
        try {
            const { isManagementFunction, activities, uuid, testListIndex } = props

            if (isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions")
                let testListItem = managementFunctions.rows[props.rowIndex].evaluationActivity.testList[testListIndex]
                if (!testListItem.hasOwnProperty("tests")) {
                    testListItem.tests = []
                }
                testListItem.tests.push({
                    uuid: uuidv4(),
                    dependencies: [],
                    objective: ""
                })

                // Update management functions
                props.updateManagementFunctions(managementFunctions)

                // Update snackbar
                handleSnackBarSuccess("New Test Successfully Added")
            } else if (activities && uuid && uuid !== "") {
                let activitiesCopy = deepCopy(activities)
                let testListItem = activitiesCopy[uuid].testList[testListIndex]
                if (!testListItem.hasOwnProperty("tests")) {
                    testListItem.tests = []
                }
                testListItem.tests.push({
                    uuid: uuidv4(),
                    dependencies: [],
                    objective: ""
                })

                // Update evaluation activities
                props.updateEvaluationActivities(activitiesCopy)

                // Update snackbar
                handleSnackBarSuccess("New Test Successfully Added")
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleNewNestedTest = () => {
        try {
            const { isManagementFunction, activities, uuid, testListIndex, initialIndex, rowIndex } = props;
    
            const newNestedTest = {
                uuid: uuidv4(),
                dependencies: [],
                objective: "",
                nestedTests: []
            };
    
            if (isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions");
                let parentTest = managementFunctions.rows[rowIndex].evaluationActivity.testList[testListIndex].tests[initialIndex];
    
                if (!Array.isArray(parentTest.nestedTests)) {
                    parentTest.nestedTests = [];
                }
    
                parentTest.nestedTests.push(newNestedTest);
                props.updateManagementFunctions(managementFunctions);
            } else if (activities && uuid && uuid !== "") {
                let activitiesCopy = deepCopy(activities);
                let parentTest = activitiesCopy[uuid].testList[testListIndex].tests[initialIndex];
    
                if (!Array.isArray(parentTest.nestedTests)) {
                    parentTest.nestedTests = [];
                }
    
                parentTest.nestedTests.push(newNestedTest);
                props.updateEvaluationActivities(activitiesCopy);
            }
    
            handleSnackBarSuccess("New Nested Test Successfully Added");
        } catch (e) {
            console.error(e);
            handleSnackBarError("Failed to add nested test");
        }
    };    
    const handleTextUpdate = (event, type, index, uuid) => {
        try {
            const { activities, testListIndex } = props
            if (props.isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions")
                let testListItem = managementFunctions.rows[props.rowIndex].evaluationActivity.testList[testListIndex]
                testListItem.description = event

                // Update management functions
                props.updateManagementFunctions(managementFunctions)
            } else if (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid)) {
                let activitiesCopy = deepCopy(activities)
                let testListItem = activitiesCopy[uuid].testList[testListIndex]
                testListItem.description = event

                // Update evaluation activities
                props.updateEvaluationActivities(activitiesCopy)
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleDeleteTestList = () => {
        try {
            const { uuid, activities, isManagementFunction, rowIndex, testListUUID } = props;
    
            const deleteTestListByUUID = (testListArray, targetUUID) => {
                for (let i = 0; i < testListArray.length; i++) {
                    const testList = testListArray[i];
    
                    // Top-level match = remove the testList itself
                    if (testList.testListUUID === targetUUID) {
                        testListArray.splice(i, 1);
                        return true;
                    }
    
                    for (const test of testList.tests) {
                        if (test.nestedTests && test.nestedTests.length > 0) {
                            // Check for nested testListUUID match
                            const originalLength = test.nestedTests.length;
                            test.nestedTests = test.nestedTests.filter(nested => nested.testListUUID !== targetUUID);
                            if (test.nestedTests.length < originalLength) return true;
    
                            const found = deleteTestListByUUID([{ tests: test.nestedTests }], targetUUID);
                            if (found) return true;
                        }
                    }
                }
                return false;
            };
    
            if (isManagementFunction) {
                let managementFunctions = props.getElementValuesByType("managementFunctions");
                let testLists = managementFunctions.rows[rowIndex].evaluationActivity.testList;
    
                if (deleteTestListByUUID(testLists, testListUUID)) {
                    props.updateManagementFunctions(managementFunctions);
                    handleSnackBarSuccess("Test List Successfully Deleted");
                } else {
                    handleSnackBarError("Test List not found");
                }
            } else if (uuid && activities?.hasOwnProperty(uuid)) {
                let activitiesCopy = deepCopy(activities);
                let testLists = activitiesCopy[uuid].testList;
    
                if (deleteTestListByUUID(testLists, testListUUID)) {
                    props.updateEvaluationActivities(activitiesCopy);
                    handleSnackBarSuccess("Test List Successfully Deleted");
                } else {
                    handleSnackBarError("Test List not found");
                }
            }
        } catch (e) {
            console.error(e);
            handleSnackBarError("Failed to delete test list");
        }
    };
    const collapseHandler = () => {
        setCollapse(!collapse)
    }

    // Return Method
    return (
        <div className="mt-1">
            <CardTemplate
                type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-4px]">
                         <span className="flex justify-stretch min-w-full">
                             <div className="flex justify-center w-full pl-4">
                                 <label className="resize-none font-bold text-[13px] p-0 m-0 text-secondary pr-1 mt-[6px]">
                                    {props.isNested ? `Test List 1`  : `Test List ${(props.testListIndex + 1)}`}
                                 </label>
                                 <IconButton
                                     variant="contained"
                                     sx={{marginTop: "-8px", margin: 0, padding: 0}}
                                    onClick={() => {handleDeleteTestList()}}
                                 >
                                     <Tooltip
                                        title={props.isNested ? `Delete Test List 1` : `Delete Test List ${props.testListIndex + 1}`}
                                        id={props.isNested ? `deleteTestTooltip-Test-List-1` : `deleteTestTooltip-Test-List-${props.testListIndex + 1}`}
                                     >
                                         <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.small }/>
                                     </Tooltip>
                                 </IconButton>
                             </div>
                             <div className="flex justify-end w-[0px] pr-1">
                                <IconButton
                                    key={"testListCollapseButton"}
                                    variant="contained"
                                    sx={{marginTop: "-8px", margin: 0, marginRight: 1, padding: 0}}
                                    onClick={collapseHandler}
                                >
                                    <Tooltip
                                        title={props.isNested ? `${collapse ? "Collapse " : "Expand "} Test List 1` : `${collapse ? "Collapse " : "Expand "} Test List ${(props.testListIndex + 1)}`}
                                        id={props.isNested ? `${collapse ? "collapse" : "expand"}TestListTooltip-1` : `${collapse ? "collapse" : "expand"}TestListTooltip-${props.testListIndex + 1}`}
                                    >
                                        {
                                            collapse ?
                                                <RemoveIcon htmlColor={ primary } sx={{ ...icons.large, stroke: primary, strokeWidth: 0.2 }}/>
                                                :
                                                <AddIcon htmlColor={ primary } sx={{ ...icons.large, stroke: primary, strokeWidth: 0.2 }}/>
                                        }
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </span>
                    </div>
                }
                body={
                    collapse ?
                        <div className="w-full m-0 p-0">
                            <div className="min-w-full mb-4 p-0 m-0">
                                <TipTapEditor
                                    className="w-full"
                                    contentType={"term"}
                                    title={"testListDescription"}
                                    handleTextUpdate={handleTextUpdate}
                                    text={props.testListDescription}
                                    uuid={evaluationActivities.selectedUUID}
                                />
                                { props.tests && props.tests.length > 0 ?
                                    <div className="min-w-full m-0 p-0 mx-[-16px]">
                                        { props.tests.map((test, index) => {
                                            return (
                                                <SfrTest
                                                    key={`${props.sfrUUID}-testList-${props.testListIndex}-Test${index}`}
                                                    activities={props.activities}
                                                    sfrUUID={props.sfrUUID}
                                                    componentUUID={props.componentUUID}
                                                    uuid={props.uuid}
                                                    test={test ? deepCopy(test) : {}}
                                                    testListIndex={props.testListIndex}
                                                    testListUUID={props.testListUUID}
                                                    index={index}
                                                    dependencyMenuOptions={props.dependencyDropdown}
                                                    isManagementFunction={props.isManagementFunction}
                                                    rowIndex={props.rowIndex}
                                                    updateManagementFunctions={props.updateManagementFunctions}
                                                    updateEvaluationActivities={props.updateEvaluationActivities}
                                                    getElementValuesByType={props.getElementValuesByType}
                                                    isNested={props.isNested ? props.isNested : (test && test.nestedTests && test.nestedTests.length > 0)}
                                                    handleNewNestedTestList={props.handleNewNestedTestList}
                                                    testUUID={test.uuid}
                                                />)
                                            })
                                        }
                                    </div>
                                    :
                                    null
                                }
                                
                            </div>
                            <div className="border-t-2 border-gray-200 m-0 p-0 mx-[-16px] mt-[-4px]">
                                <div className="w-full p-1 justify-items-center">
                                    <IconButton sx={{marginBottom: "-8px"}} key={"NewTestButton"} onClick={props.isNested ? handleNewNestedTest : handleNewTest} variant="contained">
                                        <Tooltip title={"Add New Test"} id={"addNewTest"}>
                                            <AddCircleRoundedIcon htmlColor={ primary } sx={ icons.medium }/>
                                        </Tooltip>
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    :
                    null
                }
            />
        </div>
    )
}

// Export SfrTestList.jsx
export default SfrTestList;