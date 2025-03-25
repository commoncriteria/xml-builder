// Imports
import '../../components.css';
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import { ADD_THREAT_TERM_OBJECTIVE, COLLAPSE_THREAT_RATIONALE_TABLE, SORT_OBJECTIVES_FROM_THREATS_HELPER, ADD_THREAT_TERM_SFR } from "../../../../reducers/threatsSlice.js";
import { ADD_SFR_TERM_OBJECTIVE, SORT_OBJECTIVES_FROM_SFRS_HELPER, UPDATE_SFR_COMPONENT_ITEMS } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SecurityComponents from "../../../../utils/securityComponents.jsx";
import RationaleItem from "./RationaleItem.jsx";
import DeleteConfirmation from '../../../modalComponents/DeleteConfirmation.jsx';
import { DELETE_THREAT_TERM_OBJECTIVE, DELETE_THREAT_TERM_SFR } from "../../../../reducers/threatsSlice.js";
import { DELETE_SFR_TERM_OBJECTIVE } from "../../../../reducers/SFRs/sfrSectionSlice.js";

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
        objectiveMaps: PropTypes.object.isRequired,
        threatMaps: PropTypes.object,
        sfrMaps: PropTypes.object,
        objectiveSFRsMap: PropTypes.object
    }

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch()
    const [selectedObjectives, setSelectedObjectives] = useState([])
    const [objectiveMenuOptions, setObjectiveMenuOptions] = useState([])
    const [selectedObjective, setSelectedObjective] = useState("")
    const { secondary, icons } = useSelector((state) => state.styling);
    const [disabled, setDisabled] = useState(true)
    const [openDeleteDialog, setDeleteDialog] = useState(false);
    const [objectiveToDelete, setObjectiveToDelete] = useState();
    const threats = useSelector((state) => state.threats);

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
            handleSnackBarError(e)
        }

        // Sort the objectives
        try {
            if (props.contentType === "threats") {
                dispatch(SORT_OBJECTIVES_FROM_THREATS_HELPER({
                    threatUUID: props.termUUID,
                    uuid: props.uuid, uuidMap:
                        props.objectiveMaps.objectiveUUIDMap
                }))
            } else if (props.contentType === "sfrs") {
                dispatch(SORT_OBJECTIVES_FROM_SFRS_HELPER({
                    sfrUUID: props.termUUID,
                    uuid: props.uuid, uuidMap:
                        props.objectiveMaps.objectiveUUIDMap
                }))
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
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
                const { termUUID, uuid, title, objectiveMaps, objectiveSFRsMap, threatMaps, sfrMaps } = props
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

                    // When an objective is added to an threat, map any SFRs that the objective is mapped to, to the threat
                    // (in the case that an objective was added to the SFR before the threat)
                    objectiveSFRsMap[objectiveUUID].forEach(sfrObject => {
                        dispatch(ADD_THREAT_TERM_SFR({
                            threatUUID: threatMaps.threatSectionUUID,
                            uuid: uuid,
                            title: threatMaps.threatUUIDMap[uuid],
                            rationale: sfrObject.rationale,
                            sfrUUID: sfrObject.sfrUUID,
                            sfrName: sfrMaps.sfrUUIDMap[sfrObject.sfrUUID],
                            objectiveUUID: objectiveUUID
                        }))
                    });
                }
                break;
            }
            case "sfrs": {
                const { termUUID, uuid, title, objectiveMaps, threatMaps, sfrMaps } = props
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

                    // When an objective is added to an SFR, additionally map the SFR to any threat that the objective is tied to
                    threatMaps.objectiveToThreats[objectiveUUID].forEach(threatUUID => {
                        dispatch(ADD_THREAT_TERM_SFR({
                            threatUUID: threatMaps.threatSectionUUID,
                            uuid: threatUUID,
                            title: threatMaps.threatUUIDMap[threatUUID],
                            rationale: "",
                            sfrUUID: uuid,
                            sfrName: sfrMaps.sfrUUIDMap[uuid],
                            objectiveUUID: objectiveUUID
                        }))
                    });
                }
                break;
            }
            default:
                break;
        }

        // Update snackbar
        if (props.contentType === "threats" || props.contentType === "sfrs") {
            handleSnackBarSuccess("Objective Successfully Added")
        }
    }
    const collapseObjectiveTable = () => {
        switch (props.contentType) {
            case "threats": {
                dispatch(COLLAPSE_THREAT_RATIONALE_TABLE({
                    threatUUID: props.termUUID,
                    uuid: props.uuid,
                    title: props.title
                }))
                break;
            }
            case "sfrs": {
                const itemMap = { tableOpen: !props.open }
                dispatch(UPDATE_SFR_COMPONENT_ITEMS({
                    sfrUUID: props.termUUID,
                    uuid: props.uuid,
                    itemMap: itemMap
                }))
                break;
            }
            default:
                break;
        }
    }
    const handleDeleteDialog = (props) => {
        setObjectiveToDelete(props)
        setDeleteDialog(!openDeleteDialog)
    }
    const deleteTableItem = () => {
        const { tableType } = objectiveToDelete

        try {
            if (tableType === "objectives") {
                deleteTableObjective()
            } else if (tableType === "sfrs") {
                deleteTableSfr()
            }
        } catch (e) {
            handleSnackBarError(e)
            console.log(e)
        }
    }
    const filterThreatsByObjective = (threatSlice, objectiveUUID) => {
        const [threatKey, threatsObject] = Object.entries(threatSlice).find(([_, obj]) => obj.title === "Threats")

        // Filter threats that contain the objective UUID
        const filteredThreats = Object.fromEntries(
            Object.entries(threatsObject.terms).filter(([_, threat]) =>
                threat.objectives.some(obj => obj.uuid === objectiveUUID)
            )
        );

        return { threatKey, filteredThreats };
    }
    const deleteTableObjective = () => {
        try {
            // termUUID: threats slice Object UUID (threats/assumption Object)
            // uuid: threat term UUID
            // tableUUID: objective UUID
            const { contentType, termUUID, uuid, tableUUID, } = objectiveToDelete

            switch (contentType) {
                case "threats": {
                    dispatch(DELETE_THREAT_TERM_OBJECTIVE({
                        threatUUID: termUUID,
                        uuid: uuid,
                        objectiveUUID: tableUUID
                    }))

                    // Remove the SFRs from the threat that they were mapped to, solely via that objective
                    threats[termUUID].terms[uuid].sfrs.forEach(sfr => {
                        if (sfr.objectiveUUID == tableUUID) {
                            dispatch(DELETE_THREAT_TERM_SFR({
                                threatUUID: termUUID,
                                uuid: uuid,
                                sfrUUID: sfr.uuid,
                                objectiveUUID: tableUUID
                            }));
                        }
                    });

                    break;
                }
                case "sfrs": {
                    dispatch((dispatch, getState) => {
                        dispatch(DELETE_SFR_TERM_OBJECTIVE({
                            sfrUUID: termUUID,
                            uuid: uuid,
                            objectiveUUID: tableUUID
                        }));

                        // Remove the SFR from the threats that it was mapped to, solely via that objective
                        const { threatKey, filteredThreats } = filterThreatsByObjective(getState().threats, tableUUID);
                        Object.entries(filteredThreats).forEach(([threatUUID, threatDetails]) => {
                            threatDetails.sfrs.forEach(sfr => {
                                if (sfr.uuid == uuid) {
                                    dispatch(DELETE_THREAT_TERM_SFR({
                                        threatUUID: threatKey,
                                        uuid: threatUUID,
                                        sfrUUID: uuid,
                                        objectiveUUID: tableUUID
                                    }));
                                }
                            });
                        });
                    });
                    break;
                }
                default:
                    break;
            }

            // Update snackbar
            if (contentType === "threats" || contentType === "sfrs") {
                handleSnackBarSuccess("Objective Successfully Removed")
            }
        } catch (err) {
            handleSnackBarError(err)
        }
    }
    const deleteTableSfr = () => {
        try {
            const { termUUID, uuid, tableUUID } = objectiveToDelete

            dispatch(DELETE_THREAT_TERM_SFR({
                threatUUID: termUUID,
                uuid: uuid,
                sfrUUID: tableUUID
            }))

            // Update snackbar
            handleSnackBarSuccess("SFR Successfully Removed")
        } catch (err) {
            handleSnackBarError(err)
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
                                <IconButton sx={{ marginTop: "-8px" }} onClick={collapseObjectiveTable} variant="contained">
                                    <Tooltip id={(props.open ? "collapse" : "expand") + props.uuid + "TableTooltip"}
                                        title={`${props.open ? "Collapse " : "Expand "} Table`}>
                                        {
                                            props.open ?
                                                <RemoveIcon htmlColor={secondary} sx={icons.large} />
                                                :
                                                <AddIcon htmlColor={secondary} sx={icons.large} />
                                        }
                                    </Tooltip>
                                </IconButton>
                            </th>
                            <th className={`p-0 align-center text-[13.5px] text-accent font-extrabold ${(props.open ? ' text-right w-[62%]' : 'text-center w-[94%]')}`}>
                                <label onClick={collapseObjectiveTable}>Security Objective Selections</label>
                            </th>
                            {
                                props.open ?
                                    <th className="p-0 text-right w-[38%] pr-2">
                                        <FormControl style={{ minWidth: "70%" }} required key={props.uuid + "-NewObjectiveTypeItem"}>
                                            <InputLabel id="new-objective-label">Add Objective</InputLabel>
                                            <Select
                                                value={selectedObjective}
                                                label="Objective Name"
                                                onChange={handleMenuSelections}
                                                sx={{ textAlign: "left" }}
                                            >
                                                {objectiveMenuOptions.map((value) => {
                                                    return (<MenuItem key={value} value={value}>{value}</MenuItem>)
                                                })}
                                            </Select>
                                        </FormControl>
                                        <span />
                                        <IconButton key={props.uuid + "-AddObjective"} style={{ marginTop: "4px" }}
                                            onClick={handleNewSelection} disabled={disabled} variant="contained">
                                            <Tooltip title={"Add Objective"} id={"addObjectiveTooltip"}>
                                                <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
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
                                    <th className="w-[30%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70">
                                        Objective
                                    </th>
                                    <th className="w-[60%] pb-4 text-center align-center font-extrabold text-[12px] text-secondary/70">
                                        Rationale
                                    </th>
                                    <th className="w-[10%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70">
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
                                                <RationaleItem
                                                    key={uuid + "-RationaleItem"}
                                                    termUUID={props.termUUID}
                                                    uuid={props.uuid}
                                                    tableUUID={uuid}
                                                    title={title}
                                                    rationale={rationale}
                                                    contentType={props.contentType}
                                                    tableType={"objectives"}
                                                    threatMaps={props.threatMaps}
                                                    handleDeleteDialog={handleDeleteDialog}
                                                />
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
            <DeleteConfirmation
                contentType={objectiveToDelete?.contentType}
                tableType={objectiveToDelete?.tableType}
                title={objectiveToDelete?.title}
                uuid={objectiveToDelete?.uuid}
                termUUID={objectiveToDelete?.termUUID}
                tableUUID={objectiveToDelete?.tableUUID}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteTableItem}
            />

        </div>
    )
}

// Export RationaleTable.jsx
export default RationaleTable;