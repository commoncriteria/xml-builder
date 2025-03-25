// Imports
import '../../components.css';
import { useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import { UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE, UPDATE_THREAT_TERM_SFR_RATIONALE } from "../../../../reducers/threatsSlice.js";
import { UPDATE_SFR_TERM_OBJECTIVE_RATIONALE } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SecurityComponents from "../../../../utils/securityComponents.jsx";

/**
 * The RationaleTable component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function RationaleItem(props) {
    // Prop Types
    RationaleItem.propTypes = {
        termUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        tableUUID: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        rationale: PropTypes.string.isRequired,
        tableType: PropTypes.string.isRequired,
        contentType: PropTypes.string,
        threatMaps: PropTypes.object,
        handleDeleteDialog: PropTypes.func
    }

    // Constants
    const { handleSnackBarError, handleSnackbarTextUpdates } = SecurityComponents
    const dispatch = useDispatch()
    const { secondary, icons } = useSelector((state) => state.styling);
    const threats = useSelector((state) => state.threats);
    const prevRationaleRef = useRef(props.rationale); // store previous value so that it can be string replaced

    // Methods
    const updateRationale = (event) => {
        const { tableType } = props
        const newRationale = event.target.value
        const prevRationale = prevRationaleRef.current;

        try {
            if (tableType === "objectives") {
                updateObjectiveRationale(prevRationale, newRationale)
            } else if (tableType === "sfrs") {
                updateSfrRationale(prevRationale, newRationale)
            }
        } catch (e) {
            handleSnackBarError(e)
            console.log(e)
        }
    }

    // Helper Methods
    const updateObjectiveRationale = (prevRationale, newRationale) => {
        const { contentType, termUUID, uuid, tableUUID, } = props

        switch (contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE({
                    threatUUID: termUUID,
                    uuid: uuid,
                    objectiveUUID: tableUUID,
                    newRationale: newRationale
                }))
                break;
            }
            case "sfrs": {
                dispatch(UPDATE_SFR_TERM_OBJECTIVE_RATIONALE({
                    sfrUUID: termUUID,
                    uuid: uuid,
                    objectiveUUID: tableUUID,
                    newRationale: newRationale
                }))

                // Find the threat(s) that are mapped to this objective
                const relatedThreats = props.threatMaps.objectiveToThreats[tableUUID];
                relatedThreats.forEach(threatUUID => {
                    dispatch(UPDATE_THREAT_TERM_SFR_RATIONALE({
                        threatUUID: Object.entries(threats).find(([_, obj]) => obj.title === "Threats")[0],
                        uuid: threatUUID,
                        sfrUUID: uuid,
                        prevRationale: prevRationale,
                        newRationale: newRationale
                    }))
                });
                break;
            }
            default:
                break;
        }
    }
    const updateSfrRationale = (prevRationale, newRationale) => {
        const { termUUID, uuid, tableUUID } = props

        dispatch(UPDATE_THREAT_TERM_SFR_RATIONALE({
            threatUUID: termUUID,
            uuid: uuid,
            sfrUUID: tableUUID,
            prevRationale: prevRationale,
            newRationale: newRationale
        }))
    }

    // Return Method
    return (
        <>
            <tr>
                <th scope="row">
                    <label className="pt-4 px-1 w-full text-[12px] text-center align-center font-bold text-accent/80">
                        {props.title}
                    </label>
                </th>
                <td className="pt-4 px-1 text-center align-center">
                    <FormControl fullWidth>
                        <TextField
                            color={"primary"}
                            className="w-full"
                            key={"rationaleTextField"}
                            defaultValue={props.rationale}
                            onBlur={(event) => handleSnackbarTextUpdates(updateRationale, event)}
                            multiline
                            maxRows={3}
                        />
                    </FormControl>
                </td>
                <td className="pt-4 px-4 text-center align-middle">
                    <IconButton
                        onClick={() => props.handleDeleteDialog(props)}
                        variant="contained"
                    >
                        <Tooltip
                            title={props.tableType === "objectives" ? "Delete Objective" : "Delete SFR"}
                            id={props.uuid + "deleteObjectiveTooltip"}
                        >
                            <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                        </Tooltip>
                    </IconButton>
                </td>
            </tr>
        </>
    )
}

// Export RationaleItem.jsx
export default RationaleItem;