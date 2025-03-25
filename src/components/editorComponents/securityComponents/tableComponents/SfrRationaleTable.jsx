// Imports
import '../../components.css';
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import { ADD_THREAT_TERM_SFR, COLLAPSE_THREAT_RATIONALE_TABLE, SORT_SFR_FROM_THREATS_HELPER } from "../../../../reducers/threatsSlice.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SecurityComponents from "../../../../utils/securityComponents.jsx";
import RationaleItem from "./RationaleItem.jsx";
import DeleteConfirmation from '../../../modalComponents/DeleteConfirmation.jsx';
import { DELETE_THREAT_TERM_SFR } from "../../../../reducers/threatsSlice.js";

/**
 * The SfrRationaleTable component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function SfrRationaleTable(props) {
    // Prop Types
    SfrRationaleTable.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        termUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        sfrs: PropTypes.array.isRequired,
        open: PropTypes.bool.isRequired,
        sfrMaps: PropTypes.object.isRequired
    }

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch()
    const [selectedSfrs, setSelectedSfrs] = useState([])
    const [sfrMenuOptions, setSfrMenuOptions] = useState([])
    const [selectedSfr, setSelectedSfr] = useState("")
    const { secondary, icons } = useSelector((state) => state.styling);
    const [disabled, setDisabled] = useState(true)
    const [openDeleteDialog, setDeleteDialog] = useState(false);
    const [objectiveToDelete, setObjectiveToDelete] = useState();

    // Use Effects
    useEffect(() => {
        try {
            let selected = getSelectedSfrs()
            let availableOptions = getAvailableSfrs(selected)

            if (JSON.stringify(selectedSfrs) !== JSON.stringify(selected)) {
                setSelectedSfrs(selected)
            }

            if (JSON.stringify(sfrMenuOptions) !== JSON.stringify(availableOptions)) {
                setSfrMenuOptions(availableOptions)
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }

        // Sort the sfrs
        try {
            dispatch(SORT_SFR_FROM_THREATS_HELPER({
                threatUUID: props.termUUID,
                uuid: props.uuid,
                uuidMap: props.sfrMaps.sfrUUIDMap
            }))
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }, [props]);
    useEffect(() => {
        if (selectedSfr && selectedSfr !== "" && sfrMenuOptions.includes(selectedSfr)) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [selectedSfr])

    // Methods
    const getSelectedSfrs = () => {
        let sfrNames = props.sfrs?.map((sfr) => {
            if (props.sfrMaps && props.sfrMaps.sfrUUIDMap && props.sfrMaps.sfrUUIDMap[sfr.uuid]) {
                return props.sfrMaps.sfrUUIDMap[sfr.uuid]
            }
        })

        return sfrNames.sort()
    }
    const getAvailableSfrs = (selected) => {
        let availableSelections = []

        props.sfrMaps.sfrNames?.map((sfr) => {
            if (!availableSelections.includes(sfr) && !selected.includes(sfr)) {
                availableSelections.push(sfr)
            }
        })

        availableSelections.sort()

        return availableSelections
    }
    const handleMenuSelections = (event) => {
        let selected = event.target.value
        setSelectedSfr(selected)
    }
    const handleNewSelection = async () => {
        try {
            const { termUUID, uuid, title, sfrMaps } = props
            const sfrUUID = sfrMaps.sfrNameMap[selectedSfr]

            if (sfrUUID) {
                await dispatch(ADD_THREAT_TERM_SFR({
                    threatUUID: termUUID,
                    uuid: uuid,
                    title: title,
                    rationale: "",
                    sfrUUID: sfrUUID,
                    sfrUUIDMap: sfrMaps.sfrUUIDMap
                }))

                setSelectedSfr("")
            }

            // Update snackbar
            handleSnackBarSuccess("SFR Successfully Added")
        } catch (e) {
            handleSnackBarError(e)
            console.log(e)
        }
    }
    const collapseSfrTable = () => {
        dispatch(COLLAPSE_THREAT_RATIONALE_TABLE({
            threatUUID: props.termUUID,
            uuid: props.uuid,
            title: props.title
        }))
    }
    const handleDeleteDialog = (props) => {
        setDeleteDialog(!openDeleteDialog)
        setObjectiveToDelete(props)
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
        } catch(err) {
            handleSnackBarError(err)
        }
    }

    // Return Method
    return (
        <div className="border-2 rounded-lg">
            <div className="mb-3 mx-4 mt-6">
                <table className="min-w-full border-0 align-middle ml-2">
                    <thead>
                    <tr>
                        <th className="text-left px-4 py-2 w-[40%]">
                            <IconButton sx={{marginTop: "-8px"}} onClick={collapseSfrTable} variant="contained">
                                <Tooltip id={(props.open ? "collapse" : "expand") + props.uuid + "TableTooltip"}
                                    title={`${props.open ? "Collapse " : "Expand "} Table`}>
                                    {
                                        props.open ?
                                            <RemoveIcon htmlColor={ secondary } sx={ icons.large }/>
                                            :
                                            <AddIcon htmlColor={ secondary } sx={ icons.large }/>
                                    }
                                </Tooltip>
                            </IconButton>
                        </th>
                        <th className={`text-center align-center px-4 py-2 text-[13.5px] text-accent font-extrabold w-[20%]`}>
                            <label onClick={collapseSfrTable}>SFR Selections</label>
                        </th>
                        <th className="text-right px-4 py-2 w-[40%]">
                            {
                                props.open &&
                                <div>
                                    <FormControl style={{minWidth: "85%"}} required key={props.uuid + "-NewSfrTypeItem"}>
                                        <InputLabel id="new-sfr-label">Add SFR</InputLabel>
                                        <Select
                                            value={selectedSfr}
                                            label="SFR Name"
                                            onChange={handleMenuSelections}
                                            sx = {{textAlign: "left"}}
                                        >
                                            {sfrMenuOptions.map((value) => {
                                               return(<MenuItem key={value} value={value}>{value}</MenuItem>)
                                            })}
                                        </Select>
                                    </FormControl>
                                    <span/>
                                    <IconButton key={props.uuid + "-AddSfr"} style={{marginTop: "4px"}}
                                                onClick={handleNewSelection} disabled={disabled} variant="contained">
                                        <Tooltip title={"Add SFR"} id={"addSfrTooltip"}>
                                            <AddCircleRoundedIcon htmlColor={ secondary } sx={ icons.large }/>
                                        </Tooltip>
                                    </IconButton>
                                </div>
                            }
                        </th>
                    </tr>
                    </thead>
                </table>
            </div>
            {
                props.open && props.sfrs && Object.keys(props.sfrs).length > 0 ?
                    <div className="border-2 rounded-lg border-gray-300 bg-gray-40 my-6 mx-6">
                        <table className="w-full border-0">
                            <thead className="border-b-2">
                            <tr>
                                <th className="w-[30%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70">
                                    SFR
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
                                props.sfrs?.map((sfr) => {
                                    const uuid = sfr.uuid
                                    const isSfrMapValid = props.sfrMaps && props.sfrMaps.sfrUUIDMap && props.sfrMaps.sfrUUIDMap[uuid]
                                    if (isSfrMapValid) {
                                        const title = props.sfrMaps.sfrUUIDMap[uuid]
                                        const rationale = sfr.rationale ? sfr.rationale : ""
                                        return (
                                            <RationaleItem
                                                key={uuid + "-RationaleItem"}
                                                termUUID={props.termUUID}
                                                uuid={props.uuid}
                                                tableUUID={uuid}
                                                title={title}
                                                rationale={rationale}
                                                tableType={"sfrs"}
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
                title={objectiveToDelete?.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteTableSfr}
            />
        </div>
    )
}

// Export SfrRationaleTable.jsx
export default SfrRationaleTable;