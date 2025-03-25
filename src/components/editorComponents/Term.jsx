// Imports
import PropTypes from "prop-types";
import { useDispatch, useSelector } from 'react-redux'
import { COLLAPSE_TERM_ITEM, DELETE_TERM_ITEM, UPDATE_TERM_DEFINITION, UPDATE_TERM_TITLE } from '../../reducers/termsSlice.js'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import './components.css';
import { IconButton, Tooltip } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import TipTapEditor from "./TipTapEditor.jsx";
import SecurityComponents from "../../utils/securityComponents.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";

/**
 * The Term component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function Term(props) {
    // Prop Validation
    Term.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        termUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        definition: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired
    }

    // Constants
    const { handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();
    const { secondary, icons } = useSelector((state) => state.styling);
    const [openDeleteDialog, setDeleteDialog] = useState(false);
    

    // Methods
    const updateTermTitle = (event) => {
        dispatch(UPDATE_TERM_TITLE({title: props.title, termUUID: props.termUUID, uuid: props.uuid, newTitle: event.target.value}));
    }
    const updateTermDefinition = (event) => {
        dispatch(UPDATE_TERM_DEFINITION({title: props.title, termUUID: props.termUUID, uuid: props.uuid, newDefinition: event}))
    }
    const deleteTerm = () => {
        {dispatch(DELETE_TERM_ITEM({title: props.title, termUUID: props.termUUID, uuid: props.uuid}))}

        // Update snackbar
        handleSnackBarSuccess("Term Successfully Deleted")
    }
    const collapseHandler = () => {
        {dispatch(COLLAPSE_TERM_ITEM({termUUID: props.termUUID, uuid: props.uuid, title: props.title}))}
    }

    // Return Method
    return (
        <div className="mx-5 mt-0 mb-3 border-2 rounded-lg border-gray-300 bg-gray-40" key={props.uuid + "Div"}>
            <table className="w-full border-0">
                <tbody>
                    <tr>
                        <th scope="row" className={`py-2 whitespace-normal justify-left ${props.open ? "w-[30%]" : "w-[85%]"}`}>
                            <div id={props.uuid} className="ml-1">
                                <textarea className="w-full font-bold text-[13px] text-accent" onChange={updateTermTitle}
                                          rows={`${!props.open ? "1" : ""}`} value={props.title}>{props.title}</textarea>
                            </div>
                        </th>
                            {
                                props.open ?
                                    <td className="py-2 px-2 justify-center align-middle w-[55%]">
                                        <TipTapEditor
                                            className="w-full"
                                            uuid={props.uuid}
                                            text={props.definition}
                                            contentType={"term"}
                                            handleTextUpdate={updateTermDefinition}
                                        />

                                    </td>
                                    :
                                    null
                            }
                        <td className="pr-6 px-0 text-end align-middle w-[15%]">
                            <div className="mb-2">
                                <IconButton onClick={() => setDeleteDialog(!openDeleteDialog)} variant="contained">
                                    <Tooltip title={"Delete Term"} id={props.uuid + "deleteTermTooltip"}>
                                        <DeleteForeverRoundedIcon htmlColor={ secondary } sx={ icons.large }/>
                                    </Tooltip>
                                </IconButton>
                                <span/>
                                <IconButton onClick={collapseHandler} variant="contained">
                                    <Tooltip title={`${props.open ? "Collapse " : "Expand "} Term`} id={(props.open ? "collapse" : "expand") + props.uuid + "TermTooltip"}>
                                        {
                                            props.open ?
                                                <RemoveIcon htmlColor={ secondary } sx={ icons.large }/>
                                                :
                                                <AddIcon htmlColor={ secondary } sx={ icons.large }/>
                                        }
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <DeleteConfirmation
                title={props.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteTerm}
            />
        </div>
    )
}

// Export Term.jsx
export default Term;