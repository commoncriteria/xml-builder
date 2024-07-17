// Imports
import {useEffect, useState} from "react";
import '../components.css';
import PropTypes from "prop-types";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RationaleItem from "./RationaleItem.jsx";
import {useDispatch} from "react-redux";
import {ADD_THREAT_TERM_OBJECTIVE, COLLAPSE_THREAT_TO_OBJECTIVE_TABLE, sortObjectivesFromThreatsHelper} from "../../../reducers/threatsSlice.js";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {ADD_SFR_TERM_OBJECTIVE, sortObjectivesFromSfrsHelper, UPDATE_SFR_COMPONENT_ITEMS} from "../../../reducers/SFRs/sfrSectionSlice.js";

/**
 * The RationaleTable component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function RationaleTable(props) {
    // Prop Types
    RationaleTable.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        termUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        objectives: PropTypes.array.isRequired,
        contentType: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        objectiveMaps: PropTypes.object.isRequired
    }

    // Constants
    const dispatch = useDispatch()
    const [selectedObjectives, setSelectedObjectives] = useState([])
    const [objectiveMenuOptions, setObjectiveMenuOptions] = useState([])
    const [selectedObjective, setSelectedObjective] = useState("")
    const style = {primary: "#d926a9", secondary: "#1FB2A6"}
    const [disabled, setDisabled] = useState(true)

    // Use Effects
    useEffect(() => {
        try {
            let selected = getSelectedObjectives()
            if (JSON.stringify(selectedObjectives) !== JSON.stringify(selected)) {
                setSelectedObjectives(selected)
            }
            let availableOptions = getAvailableObjectives(selected)
            if (JSON.stringify(objectiveMenuOptions) !== JSON.stringify(availableOptions)) {
                setObjectiveMenuOptions(availableOptions)
            }
        } catch (e) {
            console.log(e)
        }

        // Sort the objectives
        try {
            if (props.contentType === "threats") {
                dispatch(sortObjectivesFromThreatsHelper({
                    threatUUID: props.termUUID,
                    uuid: props.uuid, uuidMap:
                    props.objectiveMaps.objectiveUUIDMap
                }))
            } else if (props.contentType === "sfrs") {
                dispatch(sortObjectivesFromSfrsHelper({
                    sfrUUID: props.termUUID,
                    uuid: props.uuid, uuidMap:
                    props.objectiveMaps.objectiveUUIDMap
                }))
            }
        } catch (e) {
            console.log(e)
        }
    }, [props]);

    useEffect(() => {
        if (selectedObjective && selectedObjective !== "" && objectiveMenuOptions.includes(selectedObjective)) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [selectedObjective])

    // Methods
    const getSelectedObjectives = () => {
        let objectiveNames = props.objectives?.map((objective) => {
            if (props.objectiveMaps && props.objectiveMaps.objectiveUUIDMap &&
                props.objectiveMaps.objectiveUUIDMap[objective.uuid]) {
                return props.objectiveMaps.objectiveUUIDMap[objective.uuid]
            }
        })
        return objectiveNames.sort()
    }
    const getAvailableObjectives = (selected) => {
        let availableSelections = []
        props.objectiveMaps.objectiveNames?.map((objective) => {
            if (!availableSelections.includes(objective) && !selected.includes(objective)) {
                availableSelections.push(objective)
            }
        })
        availableSelections.sort()
        return availableSelections
    }
    const handleMenuSelections = (event) => {
        let selected = event.target.value
        setSelectedObjective(selected)
    }
    const handleNewSelection = async () => {
        switch (props.contentType) {
            case "threats": {
                const {termUUID, uuid, title, objectiveMaps} = props
                const objectiveUUID = objectiveMaps.objectiveNameMap[selectedObjective]
                if (objectiveUUID) {
                    await dispatch(ADD_THREAT_TERM_OBJECTIVE({
                        threatUUID: termUUID,
                        uuid: uuid,
                        title: title,
                        rationale: "",
                        objectiveUUID: objectiveUUID,
                        uuidMap: objectiveMaps.objectiveUUIDMap
                    }))
                    setSelectedObjective("")
                }
                break;
            }
            case "sfrs": {
                const {termUUID, uuid, title, objectiveMaps} = props
                const objectiveUUID = objectiveMaps.objectiveNameMap[selectedObjective]
                if (objectiveUUID) {
                    await dispatch(ADD_SFR_TERM_OBJECTIVE({
                        sfrUUID: termUUID,
                        uuid: uuid,
                        title: title,
                        rationale: "",
                        objectiveUUID: objectiveUUID,
                        uuidMap: objectiveMaps.objectiveUUIDMap
                    }))
                    setSelectedObjective("")
                }
                break;
            }
            default:
                break;
        }
    }
    const collapseObjectiveTable = () => {
        switch (props.contentType) {
            case "threats": {
                dispatch(COLLAPSE_THREAT_TO_OBJECTIVE_TABLE({threatUUID: props.termUUID, uuid: props.uuid, title: props.title}))
                break;
            }
            case "sfrs": {
                let itemMap = {optional: !props.open}
                dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.termUUID, uuid: props.uuid, itemMap: itemMap}))
                break;
            }
            default:
                break;
        }
    }

    // Return Method
    return (
        <div className="border-2 rounded-lg">
            <div className="mb-3 mx-4 mt-6">
                <table className="w-full border-0 align-middle ml-2">
                    <thead>
                    <tr>
                        <th className="p-0 text-left align-center">
                            <IconButton sx={{marginTop: "-8px"}} onClick={collapseObjectiveTable}>
                                <Tooltip title={`${props.open ? "Collapse " : "Expand "} Table`}>
                                    {
                                        props.open ?
                                            <RemoveIcon htmlColor={style.secondary} sx={{ width: 30, height: 30, stroke: style.secondary, strokeWidth: 1 }}/>
                                            :
                                            <AddIcon htmlColor={style.secondary} sx={{ width: 30, height: 30, stroke: style.secondary, strokeWidth: 1 }}/>
                                    }
                                </Tooltip>
                            </IconButton>
                        </th>
                        <th className={`p-0 align-center text-lg text-accent font-extrabold ${(props.open ? ' text-right w-[62%]' : 'text-center w-[94%]')}`}>
                            <label onClick={collapseObjectiveTable}>Security Objective Selections</label>
                        </th>
                        {
                            props.open ?
                                <th className="p-0 text-right w-[38%] pr-2">
                                    <FormControl style={{minWidth: "70%"}} required key={props.uuid + "-NewObjectiveTypeItem"}>
                                        <InputLabel id="new-objective-label">Add Objective</InputLabel>
                                        <Select
                                            value={selectedObjective}
                                            label="Objective Name"
                                            onChange={handleMenuSelections}
                                            sx = {{textAlign: "left"}}
                                        >
                                            {objectiveMenuOptions.map((value) => {
                                               return(<MenuItem key={value} value={value}>{value}</MenuItem>)
                                            })}
                                        </Select>
                                    </FormControl>
                                    <span/>
                                    <IconButton key={props.uuid + "-AddObjective"} style={{marginTop: "4px"}}
                                                onClick={handleNewSelection} disabled={disabled}>
                                        <Tooltip title={"Add Objective"}>
                                            <AddCircleRoundedIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }}/>
                                        </Tooltip>
                                    </IconButton>
                                </th>
                                :
                                null
                        }
                    </tr>
                    </thead>
                </table>
            </div>
            {
                props.open && props.objectives && Object.keys(props.objectives).length > 0 ?
                    <div className="border-2 rounded-lg border-gray-300 bg-gray-40 my-6 mx-6">
                        <table className="w-full border-0">
                            <thead className="border-b-2">
                            <tr>
                                <th className="w-[30%] pb-4 px-0 text-center align-center font-extrabold text-[15px] text-secondary/70">
                                    Objective
                                </th>
                                <th className="w-[60%] pb-4 text-center align-center font-extrabold text-[15px] text-secondary/70">
                                    Rationale
                                </th>
                                <th className="w-[10%] pb-4 px-0 text-center align-center font-extrabold text-[15px] text-secondary/70">
                                    Options
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                props.objectives?.map((objective) => {
                                    const uuid = objective.uuid
                                    const isObjectiveMapValid = props.objectiveMaps && props.objectiveMaps.objectiveUUIDMap && props.objectiveMaps.objectiveUUIDMap[uuid]
                                    if (isObjectiveMapValid) {
                                        const title = props.objectiveMaps.objectiveUUIDMap[uuid]
                                        const rationale = objective.rationale ? objective.rationale : ""
                                        return (
                                            <RationaleItem termUUID={props.termUUID} uuid={props.uuid} objectiveUUID={uuid}
                                                           title={title} rationale={rationale} contentType={props.contentType}
                                                           key={uuid + "-RationaleItem"}/>
                                        )
                                    }
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                    :
                    null
            }
        </div>
    )
}

// Export RationaleTable.jsx
export default RationaleTable;