// Imports
import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import CardTemplate from "../CardTemplate.jsx";
import TipTapEditor from "../../TipTapEditor.jsx";
import MultiSelectDropdown from "../MultiSelectDropdown.jsx";

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
        updateRefIds: PropTypes.func,
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

    // Helper Methods
    const updateRefIds = (title, event, index) => {
        const type = "note"
        props.updateRefIds({ event, index, type })
    }

    // Components
    const getManagementFunctionNotes = () => {
        let { note: notes, refIdOptions } = props.getCurrentManagementFunction()

        return (
            <div key={`managementFunctionNotes`}>
                {notes.map((currentNote, index) => {
                    let { note, refIds } = currentNote

                    return (
                        <div className="w-full p-2 px-4 mb-4 rounded-md border-2 border-gray-300"
                             key={`note-${index + 1}`}>
                            <table className="border-0">
                                <tbody>
                                    <tr>
                                        <td className="p-0 pb-4 text-center align-center w-full">
                                            {getDropdown(refIds, refIdOptions, index)}
                                        </td>
                                        <td className="p-0 text-center align-middle">
                                            <IconButton
                                                sx={{marginLeft: 1, marginBottom: 2}}
                                                onClick={() => {
                                                    props.deleteApplicationNote(index)
                                                }}
                                                variant="contained"
                                            >
                                                <Tooltip title={"Delete Application Note"}
                                                         id={"deleteApplicationNoteTooltip" + index}>
                                                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large}/>
                                                </Tooltip>
                                            </IconButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="p-0 w-full bg-white">
                                <Tooltip
                                    title={
                                        <div>
                                            {`Add in "<_/>" to indicate the placeholder for the referenced management function.`}
                                            <br/>
                                            <br/>
                                            {`For Example: Functions <_/> must be implemented on a device-wide basis but may also
                                             be implemented on a per-app basis or on a per-group of applications basis in which
                                             the configuration includes the list of applications or groups of applications to
                                             which the enable/disable applies.`}
                                        </div>
                                    }
                                >
                                    {getTextEditor(note, index)}
                                </Tooltip>
                            </div>
                        </div>
                    )
                })}
                <div className="border-t-2 mx-[-16px] mt-1">
                    <IconButton
                        sx={{marginTop: 1}}
                        onClick={() => {
                            props.addApplicationNote()
                        }}
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
    const getDropdown = (refIds, refIdOptions, index) => {
        return (
            <MultiSelectDropdown
                title={"Included Management Function's"}
                index={index}
                selections={refIds}
                selectionOptions={refIdOptions}
                handleSelections={updateRefIds}
            />
        )
    }
    const getTextEditor = (note, index) => {
        return (
            <div className="p-0 w-full bg-white">
                <TipTapEditor
                    title={"note"}
                    className="w-full"
                    contentType={"term"}
                    handleTextUpdate={props.updateApplicationNote}
                    text={note}
                    index={index}
                />
            </div>
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