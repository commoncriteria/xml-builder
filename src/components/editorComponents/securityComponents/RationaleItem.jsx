// Imports
import React from "react";
import '../components.css';
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { DELETE_THREAT_TERM_OBJECTIVE, UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE } from "../../../reducers/threatsSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { DELETE_SFR_TERM_OBJECTIVE, UPDATE_SFR_TERM_OBJECTIVE_RATIONALE } from "../../../reducers/SFRs/sfrSectionSlice.js";
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
        objectiveUUID: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        rationale: PropTypes.string.isRequired,
        contentType: PropTypes.string.isRequired
    }

    // Constants
    const dispatch = useDispatch()
    const { secondary, icons } = useSelector((state) => state.styling);

    // Methods
    const updateObjectiveRationale = (event) => {
        switch(props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE({threatUUID: props.termUUID, uuid: props.uuid,
                                                                 objectiveUUID: props.objectiveUUID, newRationale: event.target.value}))
                break;
            }
            case "sfrs": {
                dispatch(UPDATE_SFR_TERM_OBJECTIVE_RATIONALE({sfrUUID: props.termUUID, uuid: props.uuid, objectiveUUID: props.objectiveUUID, newRationale: event.target.value}))
                break;
            }
            default:
                break;
        }
    }
    const deleteTableObjective = () => {
        switch(props.contentType) {
            case "threats": {
                dispatch(DELETE_THREAT_TERM_OBJECTIVE({threatUUID: props.termUUID, uuid: props.uuid, objectiveUUID: props.objectiveUUID}))
                break;
            }
            case "sfrs": {
                dispatch(DELETE_SFR_TERM_OBJECTIVE({sfrUUID: props.termUUID, uuid: props.uuid, objectiveUUID: props.objectiveUUID}))
                break;
            }
            default:
                break;
        }
    }

    // Return Method
    return (
        <>
            <tr>
                <th scope="row">
                    <label className="pt-4 px-1 w-full text-[12px] text-center align-center font-bold text-accent/80">{props.title}</label>
                </th>
                <td className="pt-4 px-1 text-center align-center">
                    <textarea className="w-full text-sm mb-0 p-0 border-2 rounded-md"
                              onChange={updateObjectiveRationale} value={props.rationale}>text={props.rationale}</textarea>
                </td>
                <td className="pt-4 px-4 text-center align-middle">
                    <IconButton onClick={deleteTableObjective} variant="contained">
                        <Tooltip title={"Delete Objective"} id={props.uuid + "deleteObjectiveTooltip"}>
                            <DeleteForeverRoundedIcon htmlColor={ secondary } sx={ icons.large }/>
                        </Tooltip>
                    </IconButton>
                </td>
            </tr>
        </>
    )
}

// Export RationaleItem.jsx
export default RationaleItem;