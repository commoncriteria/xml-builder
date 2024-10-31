// Imports
import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import TextEditor from "../../TextEditor.jsx";
import CardTemplate from "../CardTemplate.jsx";

/**
 * The Application Note component
 * @returns {JSX.Element}
 * @constructor             passes in props to the className
 */
function ApplicationNote(props) {
    // Prop Validation
    ApplicationNote.propTypes = {
        isManagementFunction: PropTypes.bool.isRequired,
        updateApplicationNote: PropTypes.func.isRequired,
        deleteApplicationNote: PropTypes.func,
        addApplicationNote: PropTypes.func,
        getElementValuesByType: PropTypes.func,
        getCurrentManagementFunction: PropTypes.func,
        rowIndex: PropTypes.number,
    }

    // Constants
    const { primary, secondary, icons } = useSelector((state) => state.styling);
    const styling = {
        secondary: props.isManagementFunction ? primary : secondary,
    }

    // Components
    const getManagementFunctionNotes = () => {
        let notes = props.getCurrentManagementFunction("note")
        return (
            <div className="pt-1" key={`managementFunctionNotes`}>
                {notes.map((note, index) => {
                    return (
                        <div className="w-full pb-3 px-1" key={`note-${index + 1}`}>
                            <table className="border-0 m-0 pb-2">
                                <tbody>
                                    <tr>
                                        <td className="p-0 text-center align-center w-full">
                                            {getTextEditor(note, index)}
                                        </td>
                                        <td className="p-0 text-center align-middle">
                                            <IconButton
                                                sx={{marginLeft: 2}}
                                                onClick={() => {props.deleteApplicationNote(index)}}
                                                variant="contained"
                                            >
                                                <Tooltip title={"Delete Application Note"} id={"deleteApplicationNoteTooltip" + index}>
                                                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large}/>
                                                </Tooltip>
                                            </IconButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                })}
                <div className="border-t-2 mx-[-16px] mt-1">
                    <IconButton
                        sx={{marginTop: 1}}
                        onClick={() => {props.addApplicationNote()}}
                        key={"AddNoteButton"}
                        variant="contained"
                    >
                        <Tooltip title={"Add New Application Note"} id={"addNewApplicationNoteTooltip"}>
                            <AddCircleRoundedIcon htmlColor={styling.secondary} sx={{...icons.medium}}/>
                        </Tooltip>
                    </IconButton>
                </div>
            </div>
        )
    }
    const getTextEditor = (note, index) => {
        return (
            <TextEditor
                className="w-full"
                contentType={"term"}
                handleTextUpdate={props.updateApplicationNote}
                text={note}
                index={index}
            />
        )
    }

    // Return Method
    return (
        <CardTemplate
            type={"section"}
            header={
                <Tooltip id={"applicationNotesTooltip"}
                         title={"Optional section that contains guidance for ST Authors on filling out the selections and assignments.\n" +
                             "Additionally, if any of the following cases are true, then these should be documented. " +
                             "1. If SFR is Selection-based, the App Note should document the selections that cause the Component to be claimed. " +
                             "2. If the SFR is Implementation-based, the App Note should document the product feature that the Component depends on. " +
                             "3. If any selections in the Element cause other SFRs to be claimed in the ST."} arrow>
                    <label
                        style={{color: styling.secondary}}
                        className="resize-none font-bold text-[14px] p-0 pr-4"
                    >
                        Application Notes
                    </label>
                </Tooltip>
            }
            body={
                <div>
                    {props.isManagementFunction ?
                        getManagementFunctionNotes()
                        :
                        getTextEditor(props.getElementValuesByType("note"))
                    }
                </div>
            }
        />
    )
}

// Export ApplicationNote.jsx
export default ApplicationNote;