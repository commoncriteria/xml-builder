// Imports
import {IconButton, Tooltip} from "@mui/material";
import TextEditor from "../../TextEditor.jsx";
import SfrCard from "./SfrCard.jsx";
import PropTypes from "prop-types";
import React, {useState} from "react";
import SfrTest from "./SfrTest.jsx";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import {useSelector} from "react-redux";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

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
        dependencyDropdown: PropTypes.object.isRequired,
        updateEvaluationActivities: PropTypes.func.isRequired
    };

    // Constants
    const style = {primary: "#d926a9", secondary: "#1FB2A6"}
    const [collapse, setCollapse] = useState(true)
    const evaluationActivities = useSelector((state) => state.evaluationActivities)

    // Methods
    const handleNewTest = () => {
        const { activities, uuid, testListIndex } = props
        if (activities && uuid && uuid !== "") {
            let activitiesCopy = JSON.parse(JSON.stringify(activities))
            if (!activitiesCopy[uuid].testList[testListIndex].hasOwnProperty("tests")) {
                activitiesCopy[uuid].testList[testListIndex].tests = []
            }
            activitiesCopy[uuid].testList[testListIndex].tests.push({dependencies: [], objective: ""})
            props.updateEvaluationActivities(activitiesCopy)
        }
    }
    const handleTextUpdate = (event, type, index, uuid) => {
        const { activities, testListIndex } = props
        const isValid = (uuid && uuid !== "" && activities && activities.hasOwnProperty(uuid))
        if (isValid) {
            let activitiesCopy = JSON.parse(JSON.stringify(activities))
            activitiesCopy[uuid].testList[testListIndex].description = event

            // Update evaluation activities
            props.updateEvaluationActivities(activitiesCopy)
        }
    }
    const handleDeleteTestList = (index) => {
        const { uuid, activities } = props
        const isValid = props.uuid && props.uuid !== "" && props.activities && props.activities.hasOwnProperty(props.uuid)
        if (isValid) {
            let activitiesCopy = JSON.parse(JSON.stringify(activities))
            activitiesCopy[uuid].testList.splice(index, 1)
            props.updateEvaluationActivities(activitiesCopy)
        }
    }
    const collapseHandler = () => {
        setCollapse(!collapse)
    }

    // Return Method
    return (
        <div className="mt-1">
            <SfrCard
                type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-4px]">
                         <span className="flex justify-stretch min-w-full">
                             <div className="flex justify-center w-full pl-4">
                                 <label className="resize-none font-bold text-[16px] p-0 m-0 text-secondary pr-1 mt-[6px]">{`Test List ${(props.testListIndex + 1)}`}</label>
                                 <IconButton sx={{marginTop: "-8px", margin: 0, padding: 0}} onClick={() => {handleDeleteTestList(props.testListIndex)}}>
                                     <Tooltip title={`Delete Test ${(props.testListIndex + 1)}`}>
                                         <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 26, height: 26 }}/>
                                     </Tooltip>
                                 </IconButton>
                             </div>
                             <div className="flex justify-end w-[0px] pr-1">
                                <IconButton sx={{marginTop: "-8px", margin: 0, marginRight: 1, padding: 0}} onClick={collapseHandler} key={ + "ToolTip"}>
                                    <Tooltip title={`${(collapse ? "Collapse " : "Expand ") + `Test List ${(props.testListIndex + 1)}`}`}>
                                        {
                                            collapse ?
                                                <RemoveIcon htmlColor={style.primary} sx={{ width: 32, height: 32, stroke: style.primary, strokeWidth: 0.2 }}/>
                                                :
                                                <AddIcon htmlColor={style.primary} sx={{ width: 32, height: 32, stroke: style.primary, strokeWidth: 0.2 }}/>
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
                                <TextEditor className="w-full" contentType={"term"} title={"testListDescription"} handleTextUpdate={handleTextUpdate}
                                            text={props.testListDescription} uuid={evaluationActivities.selectedUUID}
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
                                                    test={test ? JSON.parse(JSON.stringify(test)) : {}}
                                                    testListIndex={props.testListIndex}
                                                    index={index}
                                                    dependencyMenuOptions={props.dependencyDropdown}
                                                    updateEvaluationActivities={props.updateEvaluationActivities}
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
                                    <IconButton sx={{marginBottom: "-8px"}} key={"NewTestButton"} onClick={handleNewTest}>
                                        <Tooltip title={"Add New Test"}>
                                            <AddCircleRoundedIcon htmlColor={style.primary} sx={{ width: 28, height: 28 }}/>
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