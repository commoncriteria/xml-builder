// Imports
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import { GET_DEPENDENCY_MAP, UPDATE_EVALUATION_ACTIVITY_UI_ITEMS } from "../../../../../reducers/SFRs/evaluationActivitiesUI.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded.js";
import CardTemplate from "../../CardTemplate.jsx";
import SfrTestList from "./SfrTestList.jsx";
import TextEditor from "../../../TextEditor.jsx";

/**
 * The SfrTestListSection class that displays the evaluation activity test list section
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrTestListSection(props) {
    // Prop Validation
    SfrTestListSection.propTypes = {
        selected: PropTypes.array.isRequired,
        activities: PropTypes.object.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        testIntroduction: PropTypes.string.isRequired,
        testClosing: PropTypes.string.isRequired,
        testList: PropTypes.array.isRequired,
        elementMaps: PropTypes.object.isRequired,
        rowIndex: PropTypes.number,
        isManagementFunction: PropTypes.bool,
        handleTextUpdate: PropTypes.func.isRequired,
        handleNewTestList: PropTypes.func.isRequired,
        updateEvaluationActivities: PropTypes.func,
        updateManagementFunctions: PropTypes.func,
        getElementValuesByType: PropTypes.func,
    };

    // Constants
    const dispatch = useDispatch();
    const { secondary, icons } = useSelector((state) => state.styling);
    const sfrSections = useSelector((state) => state.sfrSections);
    const platforms = useSelector((state) => state.accordionPane.platformdata.platforms);
    const evaluationActivities = useSelector((state) => state.evaluationActivities);

    // Use Effects
    useEffect(() => {
        // Get dependency map
        const { sfrUUID, componentUUID, elementMaps } = props
        const dependencies = getDependencyMap(sfrUUID, componentUUID, elementMaps)

        if (dependencies && (JSON.stringify(evaluationActivities.dependencyMap) !== JSON.stringify(dependencies))) {
            let updateMap = {
                dependencyMap: dependencies
            }

            // Update evaluation activities UI
            updateEvaluationActivitiesUI(updateMap)
        }
    }, [props]);

    // Helper Methods
    const updateEvaluationActivitiesUI = (updateMap) => {
        dispatch(UPDATE_EVALUATION_ACTIVITY_UI_ITEMS({updateMap: updateMap}))
    }
    const getDependencyMap = () => {
        return dispatch(
            GET_DEPENDENCY_MAP({
                sfrUUID: props.sfrUUID,
                componentUUID: props.componentUUID,
                elementMaps: props.elementMaps,
                sfrSections: JSON.parse(JSON.stringify(sfrSections))}
            )).payload.dependencies
    }
    const getDependencyDropdown = (selected) => {
        let dropdown = {
            Platforms: [],
            Selectables: [],
            ComplexSelectablesEA: []
        }

        try {
            const isValid = selected && selected.length > 0;
            const isManagementFunctionValid = props.isManagementFunction && isValid;
            if ((isManagementFunctionValid || isValid) && evaluationActivities?.hasOwnProperty("dependencyMap")) {
                let dependencyMap = JSON.parse(JSON.stringify(evaluationActivities.dependencyMap))

                // Add Platforms
                let platformMenu = platforms.map(platform => platform.name)
                if (platformMenu && platformMenu.length > 0) {
                    platformMenu.forEach((platform) => {
                        if (!dropdown.Platforms.includes(platform)) {
                            dropdown.Platforms.push(platform)
                        }
                    })
                }
                dropdown.Platforms.sort()

                // Add selectable and complex selectable options to dropdowns
                // Check to see if the selected evaluation activity is a component
                const isComponent = props.elementMaps.componentName === selected[0] && dependencyMap.hasOwnProperty("selectablesToUUID")
                let dependencies = JSON.parse(JSON.stringify(dependencyMap))
                let selectables = dependencyMap.elementsToSelectables
                let complexSelectables = dependencyMap.elementsToComplexSelectables

                if (isComponent) {
                    let UUIDs = dependencies.selectablesToUUID
                    dropdown.Selectables = Object.keys(UUIDs).sort()
                }
                // Check to see if the selected evaluation activity is an element
                else {
                    const selectedIsValid = props.elementMaps.elementNames.includes(selected[0])

                    // Add selectables
                    if (selectedIsValid && selectables.hasOwnProperty(selected[0])) {
                        let selectableItem = selectables[selected[0]]
                        dropdown.Selectables = JSON.parse(JSON.stringify(selectableItem.sort()))
                    }

                    // Add complex selectables
                    if (selectedIsValid && complexSelectables.hasOwnProperty(selected[0])) {
                        let complexSelectableItem = complexSelectables[selected[0]]
                        dropdown.ComplexSelectablesEA = JSON.parse(JSON.stringify(complexSelectableItem.sort()))
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
        return dropdown
    }

    // Components
    const getTestListCard = () => {
        const { selected, activities, sfrUUID, componentUUID, uuid, testIntroduction, testClosing, testList, rowIndex, isManagementFunction } = props
        const isTestListValid = (isManagementFunction || (uuid && uuid !== "" && activities && activities[uuid])) && selected && selected.length > 0

        if (isTestListValid) {
            let dependencyDropdown = getDependencyDropdown(selected)
            return (
                <CardTemplate
                    type={"section"}
                    header={
                        <Tooltip
                            id={"TestsTooltip"}
                            title={`Taken Directly from the Wiki: The goal of testing is to determine the whether the TOE 
                                    behaves as described in the ST and as specified in the evaluation evidence 
                                    (described in the ADV class).`}
                            arrow
                        >
                            <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">Tests</label>
                        </Tooltip>
                    }
                    body={
                        <div className="w-full m-0 p-0">
                            <div className="min-w-full mb-3 p-0 m-0">
                                <div className="mb-4">
                                    <TextEditor
                                        className="w-full"
                                        contentType={"term"}
                                        title={"testIntroduction"}
                                        handleTextUpdate={props.handleTextUpdate}
                                        index={rowIndex ? rowIndex : null}
                                        text={testIntroduction}
                                        uuid={uuid}
                                        showTable
                                    />
                                </div>
                                { testList && testList.length > 0 ?
                                    <div className="min-w-full m-0 p-0 mx-[-16px] mt-[-6px]">
                                        { testList.map((list, index) => {
                                            return (
                                                <SfrTestList
                                                    key={"TestListSection" + index}
                                                    activities={activities}
                                                    sfrUUID={sfrUUID}
                                                    componentUUID={componentUUID}
                                                    uuid={uuid}
                                                    testListIndex={index}
                                                    testListDescription={list.description ? list.description : ""}
                                                    tests={list.tests ? JSON.parse(JSON.stringify(list.tests)) : []}
                                                    dependencyDropdown={dependencyDropdown}
                                                    isManagementFunction={props.isManagementFunction}
                                                    rowIndex={props.rowIndex}
                                                    updateEvaluationActivities={props.updateEvaluationActivities}
                                                    updateManagementFunctions={props.updateManagementFunctions}
                                                    getElementValuesByType={props.getElementValuesByType}
                                                />
                                            )
                                        })}
                                    </div>
                                    :
                                    null
                                }
                                { isManagementFunction && 
                                    <div className="mb-4">
                                        <TextEditor
                                            className="w-full"
                                            contentType={"term"}
                                            title={"testClosing"}
                                            handleTextUpdate={props.handleTextUpdate}
                                            index={rowIndex ? rowIndex : null}
                                            text={testClosing}
                                            uuid={uuid}
                                            showTable
                                        />
                                    </div>
                                }
                                
                            </div>
                            <div className="border-t-2 border-gray-200 m-0 p-0 mx-[-16px] mt-1">
                                <div className="w-full p-1 justify-items-center">
                                    <IconButton
                                        sx={{marginBottom: "-8px"}}
                                        key={"NewTestButton"}
                                        variant="contained"
                                        onClick={() => props.handleNewTestList(activities, uuid)}
                                    >
                                        <Tooltip
                                            title={"Add New Test List"}
                                            id={uuid + "AddNewTestListTooltip"}
                                        >
                                            <AddCircleRoundedIcon htmlColor={ secondary } sx={ icons.medium }/>
                                        </Tooltip>
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    }
                />
            )
        } else {
            return null;
        }
    }

    // Return Method
    return (
        <div>
            {getTestListCard()}
        </div>
    )
}

// Export SfrTestListSection.jsx
export default SfrTestListSection;