// Imports
import PropTypes from "prop-types";
import {useDispatch} from 'react-redux'
import { COLLAPSE_TERM_ITEM, DELETE_TERM_ITEM, UPDATE_TERM_DEFINITION, UPDATE_TERM_TITLE } from '../../reducers/termsSlice.js'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import './components.css';
import { IconButton, Tooltip } from "@mui/material";
import TextEditor from "./TextEditor.jsx";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import React from "react";

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
    const dispatch = useDispatch();
    const style = {secondary: "#1FB2A6"}

    // Methods
    const updateTermTitle = (event) => {
        dispatch(UPDATE_TERM_TITLE({title: props.title, termUUID: props.termUUID, uuid: props.uuid, newTitle: event.target.value}));
    }
    const updateTermDefinition = (event) => {
        dispatch(UPDATE_TERM_DEFINITION({title: props.title, termUUID: props.termUUID, uuid: props.uuid, newDefinition: event}))
    }
    const deleteTerm = () => {
        {dispatch(DELETE_TERM_ITEM({title: props.title, termUUID: props.termUUID, uuid: props.uuid}))}
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
                                <textarea className="w-full font-bold text-[15px] text-accent" onChange={updateTermTitle}
                                          rows={`${!props.open ? "1" : ""}`} value={props.title}>{props.title}</textarea>
                            </div>
                        </th>
                            {
                                props.open ?
                                    <td className="py-2 px-2 justify-center align-middle w-[55%]">
                                        <TextEditor className="w-full" uuid={props.uuid} text={props.definition} contentType={"term"}
                                                    handleTextUpdate={updateTermDefinition}/>

                                    </td>
                                    :
                                    null
                            }
                        <td className="pr-6 px-0 text-end align-middle w-[15%]">
                            <div className="mb-2">
                                <IconButton onClick={deleteTerm}>
                                    <Tooltip title={"Delete Term"}>
                                        <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
                                    </Tooltip>
                                </IconButton>
                                <span/>
                                <IconButton onClick={collapseHandler}>
                                    <Tooltip title={`${props.open ? "Collapse " : "Expand "} Term`}>
                                        {
                                            props.open ?
                                                <RemoveIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }}/>
                                                :
                                                <AddIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }}/>
                                        }
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

// Export Term.jsx
export default Term;