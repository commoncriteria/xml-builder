// Imports
import React, {useEffect, useState} from "react";
import SfrCard from "./SfrCard.jsx";
import TextEditor from "../../TextEditor.jsx";
import {IconButton, Tooltip} from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {UPDATE_SFR_COMPONENT_ITEMS} from "../../../../reducers/SFRs/sfrSectionSlice.js";
import {RESET_EVALUATION_ACTIVITY_UI, UPDATE_EVALUATION_ACTIVITY_UI_ITEMS} from "../../../../reducers/SFRs/evaluationActivitiesUI.js";
import SfrTestList from "./SfrTestList.jsx";

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
    const style = {primary: "#d926a9", secondary: "#1FB2A6"}
    const dispatch = useDispatch();
    const sfrSections = useSelector((state) => state.sfrSections);
    const platforms = useSelector((state) => state.accordionPane.platformdata.platforms);
    const evaluationActivities = useSelector((state) => state.evaluationActivities)
    const [openEvaluationActivity, setOpenEvaluationActivity] = useState(true)

    // Use Effects
    useEffect(() => {
        initializeValues(props.elementMaps, props.sfrUUID, props.componentUUID)
    }, [props])

    // Methods
    const initializeValues = (elementMaps, sfrUUID, componentUUID) => {
        let mainDropdown = {Component: [], Elements: []}
        let newDropdown = {Component: [], Elements: []}
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
            mainDropdown.Elements.sort();
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
        newDropdown.Elements.sort();

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
            let updateMap = {selectedEvaluationActivity: selections, selectedUUID: ""}
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
            updateEvaluationActivitiesUI({newSelectedEvaluationActivity: selections})
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
                    } else if (props.elementMaps.hasOwnProperty("elementNameMap") && props.elementMaps.elementNameMap.hasOwnProperty(name)&& !mainDropdown.Elements.includes(name)) {
                        uuid = props.elementMaps.elementNameMap[name]
                    }
                    if (uuid && !activities.hasOwnProperty(uuid)) {
                        activities[uuid] = {
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
                updateEvaluationActivitiesUI({selectedUUID: "", selectedEvaluationActivity: []})
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
                description: "",
                tests: [{dependencies: [], objective: ""}]
            })
            updateEvaluationActivities(activities)
        }
    }

    // Helper Methods
    const getEvaluationActivitiesList = () => {
        return sfrSections[props.sfrUUID][props.componentUUID].evaluationActivities ?
            JSON.parse(JSON.stringify(sfrSections[props.sfrUUID][props.componentUUID].evaluationActivities)) : {}
    }
    const getDependencyMap = (sfrUUID, componentUUID, elementMaps) => {
        let dependencies = {
            elementsToSelectables: {},
            elementsToComplexSelectables: {},
            selectablesToUUID: {},
            uuidToSelectables: {}
        }

        // Create dependency map
        if (sfrSections.hasOwnProperty(sfrUUID) && sfrSections[sfrUUID].hasOwnProperty(componentUUID) && sfrSections[sfrUUID][componentUUID].hasOwnProperty("elements")) {
            let elements = JSON.parse(JSON.stringify(sfrSections[sfrUUID][componentUUID].elements))
            if (elements && Object.entries(elements).length > 0) {
                Object.entries(elements).forEach(([uuid, element]) => {
                    if (elementMaps.elementUUIDMap.hasOwnProperty(uuid)) {
                        let name = elementMaps.elementUUIDMap[uuid]

                        // Get selectables
                        let selectableArray = []
                        if (element.hasOwnProperty("selectables")) {
                            let selectables = JSON.parse(JSON.stringify(element.selectables))
                            if (selectables && Object.entries(selectables).length > 0) {
                                Object.entries(selectables).forEach(([selectableUUID, selectable]) => {
                                    let isAssignment = selectable.assignment ? true : false
                                    if (!isAssignment) {
                                        let selectableName = selectable.id ? (`${selectable.description} (${selectable.id})`) : selectable.description
                                        dependencies.selectablesToUUID[selectableName] = selectableUUID
                                        dependencies.uuidToSelectables[selectableUUID] = selectableName
                                        if (!selectableArray.includes(selectableName)) {
                                            selectableArray.push(selectableName)
                                        }
                                    }
                                })
                                selectableArray.sort()
                                dependencies.elementsToSelectables[name] = selectableArray
                            }
                        }

                        // Get complex selectables
                        let complexSelectableArray = []
                        if (element.hasOwnProperty("selectableGroups")) {
                            let selectableGroups = JSON.parse(JSON.stringify(element.selectableGroups))
                            if (selectableGroups && Object.entries(selectableGroups).length > 0) {
                                Object.entries(selectableGroups).forEach(([selectableGroupID, value]) => {
                                    let isComplexSelectable = value.hasOwnProperty("description") ? true : false
                                    if (isComplexSelectable) {
                                        if (!complexSelectableArray.includes(selectableGroupID)) {
                                            complexSelectableArray.push(selectableGroupID)
                                        }
                                    }
                                })
                                complexSelectableArray.sort()
                                dependencies.elementsToComplexSelectables[name] = complexSelectableArray
                            }
                        }
                    }
                })
            }
        }
        return dependencies
    }
    const getDependencyDropdown = (selected) => {
        let dropdown = {Platforms: [], Selectables: [], ComplexSelectablesEA: []}
        try {
            if (selected && selected.length > 0 && evaluationActivities && evaluationActivities.hasOwnProperty("dependencyMap")) {
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
                if (isComponent) {
                    dropdown.Selectables = Object.keys(dependencyMap.selectablesToUUID).sort()
                }
                // Check to see if the selected evaluation activity is an element
                else {
                    // Add selectables
                    if (props.elementMaps.elementNames.includes(selected[0]) && dependencyMap.elementsToSelectables.hasOwnProperty(selected[0])) {
                        dropdown.Selectables = JSON.parse(JSON.stringify(dependencyMap.elementsToSelectables[selected[0]].sort()))
                    }
                    // Add complex selectables
                    if (props.elementMaps.elementNames.includes(selected[0]) && dependencyMap.elementsToComplexSelectables.hasOwnProperty(selected[0])) {
                        dropdown.ComplexSelectablesEA = JSON.parse(JSON.stringify(dependencyMap.elementsToComplexSelectables[selected[0]].sort()))
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
        return dropdown
    }
    const updateEvaluationActivities = (activities) => {
        let originalActivities = getEvaluationActivitiesList()
        if (JSON.stringify(originalActivities) !== JSON.stringify(activities)) {
            let itemMap = {evaluationActivities: activities}
            dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.componentUUID, itemMap: itemMap}))
        }
    }
    const updateEvaluationActivitiesUI = (updateMap) => {
        dispatch(UPDATE_EVALUATION_ACTIVITY_UI_ITEMS({updateMap: updateMap}))
    }

    // Use Memos
    const getIntroduction = () => {
        if (evaluationActivities.selectedEvaluationActivity && evaluationActivities.selectedEvaluationActivity.length > 0) {
            let uuid = evaluationActivities.selectedUUID
            let activities = getEvaluationActivitiesList()
            if (uuid && uuid !== "" && activities && activities[uuid]) {
                let introduction = activities[uuid].introduction ? JSON.parse(JSON.stringify(activities[uuid].introduction)) : ""
                return (
                    <SfrCard
                        type={"section"}
                        header={
                            <label className="resize-none font-bold text-[18px] p-0 pr-4 text-accent">Introduction</label>
                        }
                        body={
                            <div>
                                <TextEditor className="w-full" contentType={"term"} title={"introduction"}
                                            handleTextUpdate={handleTextUpdate}
                                            text={introduction} uuid={evaluationActivities.selectedUUID}
                                />
                            </div>
                        }
                    />
                )
            }
        } else {
            return null;
        }
    }
    const getTSS = () => {
        if (evaluationActivities.selectedEvaluationActivity && evaluationActivities.selectedEvaluationActivity.length > 0) {
            let uuid = evaluationActivities.selectedUUID
            let activities = getEvaluationActivitiesList()
            if (uuid && uuid !== "" && activities && activities[uuid]) {
                let tss = activities[uuid].tss ? JSON.parse(JSON.stringify(activities[uuid].tss)) : ""
                return (
                    <SfrCard
                        type={"section"}
                        header={
                            <Tooltip
                                title={"Taken directly from the WIki: ASE_TSS.1 requires that the developer provide " +
                                    "a TOE Summary Specification (TSS) that describes how the TOE meets each SFR. " +
                                    "Other SARs require that the TSS describe how the TOE protects itself against " +
                                    "interference, logical tampering, and bypass. Since the SARs already require " +
                                    "that the TSS describe how the TOE meets all the requirements, this activity " +
                                    "should be used only to point out specific aspects of the requirement that " +
                                    "must be documented in the the TSS."} arrow>
                                <label className="resize-none font-bold text-[18px] p-0 pr-4 text-accent">TSS</label>
                            </Tooltip>
                        }
                        body={
                            <div>
                                <TextEditor className="w-full" contentType={"term"} title={"tss"}
                                            handleTextUpdate={handleTextUpdate}
                                            text={tss} uuid={evaluationActivities.selectedUUID}
                                />
                            </div>
                        }
                    />
                )
            }
        } else {
            return null;
        }
    }
    const getGuidance = () => {
        if (evaluationActivities.selectedEvaluationActivity && evaluationActivities.selectedEvaluationActivity.length > 0) {
            let uuid = evaluationActivities.selectedUUID
            let activities = getEvaluationActivitiesList()
            if (uuid && uuid !== "" && activities && activities[uuid]) {
                let guidance = activities[uuid].guidance ? JSON.parse(JSON.stringify(activities[uuid].guidance)) : ""
                return (
                    <SfrCard
                        type={"section"}
                        header={
                            <Tooltip
                                title={"Taken directly from the Wiki: The CC:2022 requires at least two types of " +
                                    "Guidance documentation: Operational Guidance and Administrator Guidance. " +
                                    "Administrator Guidance contains of instructions for putting the TOE into the " +
                                    "evaluated configuration. The Operational Guidance is documentation for users " +
                                    "of the system. This activity concerns the Operational Guidance, or the " +
                                    "Guidance in general. It is sometimes referred to as \"AGD.\""} arrow>
                                <label className="resize-none font-bold text-[18px] p-0 pr-4 text-accent">Guidance</label>
                            </Tooltip>
                        }
                        body={
                            <div>
                                <TextEditor className="w-full" contentType={"term"} title={"guidance"}
                                            handleTextUpdate={handleTextUpdate}
                                            text={guidance} uuid={evaluationActivities.selectedUUID}
                                />
                            </div>
                        }
                    />
                )
            }
        } else {
            return null;
        }
    }
    const getTestList = () => {
        if (evaluationActivities.selectedEvaluationActivity && evaluationActivities.selectedEvaluationActivity.length > 0) {
            let uuid = evaluationActivities.selectedUUID
            let selected = evaluationActivities.selectedEvaluationActivity
            let activities = getEvaluationActivitiesList()
            if (selected && uuid && uuid !== "" && activities && activities[uuid]) {
                let testIntroduction = activities[uuid].testIntroduction ? JSON.parse(JSON.stringify(activities[uuid].testIntroduction)) : ""
                let testList = activities[uuid].testList ? JSON.parse(JSON.stringify(activities[uuid].testList)) : []
                let dependencyDropdown = getDependencyDropdown(selected)
                return (
                    <SfrCard
                        type={"section"}
                        header={
                            <Tooltip title={"Taken Directly from the Wiki: The goal of testing is to " +
                                "determine the whether the TOE behaves as described in the " +
                                "ST and as specified in the evaluation evidence (described " +
                                "in the ADV class)."} arrow>
                                <label className="resize-none font-bold text-[18px] p-0 pr-4 text-accent">Tests</label>
                            </Tooltip>
                        }
                        body={
                            <div className="w-full m-0 p-0">
                                <div className="min-w-full mb-3 p-0 m-0">
                                    <div className="mb-4">
                                        <TextEditor className="w-full" contentType={"term"} title={"testIntroduction"}
                                                    handleTextUpdate={handleTextUpdate}
                                                    text={testIntroduction} uuid={evaluationActivities.selectedUUID}
                                        />
                                    </div>
                                    { testList && testList.length > 0 ?
                                        <div className="min-w-full m-0 p-0 mx-[-16px] mt-[-6px]">
                                            { testList.map((list, index) => {
                                                return (
                                                    <SfrTestList
                                                        key={props.sfrUUID + "-" + props.componentUUID + "-TestList" + index}
                                                        activities={activities}
                                                        sfrUUID={props.sfrUUID}
                                                        componentUUID={props.componentUUID}
                                                        uuid={uuid}
                                                        testListIndex={index}
                                                        testListDescription={list.description ? list.description : ""}
                                                        tests={list.tests ? JSON.parse(JSON.stringify(list.tests)) : []}
                                                        dependencyDropdown={dependencyDropdown}
                                                        updateEvaluationActivities={updateEvaluationActivities}
                                                    />)
                                                })
                                            }
                                        </div>
                                        :
                                        null
                                    }
                                </div>
                                <div className="border-t-2 border-gray-200 m-0 p-0 mx-[-16px] mt-1">
                                    <div className="w-full p-1 justify-items-center">
                                        <IconButton sx={{marginBottom: "-8px"}} key={"NewTestButton"}
                                                    onClick={() => handleNewTestList(activities, uuid)}>
                                            <Tooltip title={"Add New Test List"}>
                                                <AddCircleRoundedIcon htmlColor={style.secondary} sx={{ width: 28, height: 28 }}/>
                                            </Tooltip>
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                )
            }
        } else {
            return null;
        }
    }

    // Return Method
    return (
        <div>
            <SfrCard type={"parent"} title={"Evaluation Activities"} tooltip={"Evaluation Activities"}
                     collapse={openEvaluationActivity} collapseHandler={handleSetOpenEvaluationActivity}
                     body={
                         <div className="mb-2">
                             <div className="mt-4 px-4 w-full">
                                 <span className="w-full inline-flex items-baseline">
                                     <div className="w-[96%]">
                                          <MultiSelectDropdown selectionOptions={evaluationActivities.evaluationActivityDropdown}
                                                               selections={evaluationActivities.selectedEvaluationActivity}
                                                               title={"Evaluation Activity"}
                                                               handleSelections={handleSelectEvaluationActivity}
                                                               multiple={false}
                                          />
                                     </div>
                                     <div className="w-[4%]">
                                         <IconButton sx={{marginBottom: "-32px"}} key={"DeleteEvaluationActivityButton"}
                                                     disabled={evaluationActivities.selectedEvaluationActivity &&
                                                               evaluationActivities.selectedEvaluationActivity.length > 0 ? false : true}
                                                     onClick={handleDeleteEvaluationActivity}>
                                             <Tooltip title={"Delete Evaluation Activity"}>
                                                 <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }}/>
                                             </Tooltip>
                                         </IconButton>
                                     </div>
                                 </span>
                             </div>
                             { evaluationActivities.selectedEvaluationActivity && evaluationActivities.selectedEvaluationActivity.length > 0 ?
                                 <div className="mt-2">
                                     {getIntroduction()}
                                     {getTSS()}
                                     {getGuidance()}
                                     {getTestList()}
                                 </div>
                                 : null
                             }
                         </div>
                     }
                     footer={
                         <div className="min-w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white" key={"NewEvaluationActivityFooter"}>
                             <div className="p-3 px-4 w-full">
                                 <span className="w-full inline-flex items-baseline">
                                     <div className="w-[96%]">
                                          <MultiSelectDropdown selectionOptions={evaluationActivities.newEvaluationActivityDropdown}
                                                               selections={evaluationActivities.newSelectedEvaluationActivity}
                                                               title={"Evaluation Activities"}
                                                               handleSelections={handleNewSelectedEvaluationActivity}
                                          />
                                     </div>
                                     <div className="w-[4%]">
                                         <IconButton sx={{marginBottom: "-32px"}} key={"NewEvaluationActivitiesButton"}
                                                     disabled={evaluationActivities.newSelectedEvaluationActivity &&
                                                     evaluationActivities.newSelectedEvaluationActivity.length > 0 ? false : true}
                                                     onClick={handleSubmitNewEvaluationActivities}>
                                             <Tooltip title={"Add New Evaluation Activities"}>
                                                 <AddCircleRoundedIcon htmlColor={style.secondary} sx={{ width: 28, height: 28 }}/>
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