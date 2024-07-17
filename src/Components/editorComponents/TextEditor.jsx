// Imports
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PropTypes from "prop-types";
import { COLLAPSE_EDITOR, DELETE_EDITOR, UPDATE_EDITOR_TEXT, UPDATE_EDITOR_TITLE } from "../../reducers/editorSlice.js";
import {CREATE_ACCORDION_SFR_FORM_ITEM, DELETE_ACCORDION_FORM_ITEM} from "../../reducers/accordionPaneSlice.js"
import {FormControl, IconButton, TextField, Tooltip} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {CREATE_SFR_SECTION} from "../../reducers/SFRs/sfrSlice.js";
import {CREATE_SFR_SECTION_SLICE} from "../../reducers/SFRs/sfrSectionSlice.js";
import DeleteSfrSectionConfirmation from "../modalComponents/DeleteSfrSectionConfirmation.jsx";

/**
 * The TextEditor class that displays the rich text editor
 * @returns {JSX.Element}   the text editor content
 * @constructor             passes in props to the class
 */
function TextEditor(props) {
    // Prop Validation
    TextEditor.propTypes = {
        title: PropTypes.string,
        section: PropTypes.string,
        accordionUUID: PropTypes.string,
        uuid: PropTypes.string,
        text: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
        contentType: PropTypes.string.isRequired,
        handleTextUpdate: PropTypes.func,
        open: PropTypes.bool,
        elementData: PropTypes.object,
        readOnly: PropTypes.bool,
        index: PropTypes.number,
        titleTooltip: PropTypes.string
    }

    // Constants
    const dispatch = useDispatch();
    const accordions = useSelector((state) => state.accordionPane.sections)
    const style = {primary: "#d926a9", secondary: "#1FB2A6", white: "#fcfcfc", borderColor: "#9CA3AF"}
    const [sfrSectionName, setSfrSectionName] = useState("")
    const [isSfr, setIsSfr] = useState(false)
    const [openSfrConfirmationDialog, setOpenSfrConfirmationDialog] = useState(false)

    // Use Effects
    useEffect(() => {
        if (accordions.hasOwnProperty(props.accordionUUID) && accordions[props.accordionUUID].hasOwnProperty("title")
            && accordions[props.accordionUUID].title === "Security Requirements") {
            setIsSfr(true)
        }
    }, [props]);

    // Methods
    const updateEditorTitle = (event) => {
        {dispatch(UPDATE_EDITOR_TITLE({title: props.title, uuid: props.uuid, text: props.text, newTitle: event.target.value}))}
    }
    
    const updateEditorText = (event, delta, source, editor) => {
        if (props.contentType === "editor") {
            {dispatch(UPDATE_EDITOR_TEXT({uuid: props.uuid, newText: editor.getHTML()}))}
        } else if (props.contentType === "term") {
            props.handleTextUpdate(editor.getHTML(), props.title, props.index, props.uuid)
        } else if (props.contentType === "element") {
            let update = {description: editor.getHTML()}
            props.handleTextUpdate(update, props.elementData.uuid, props.elementData.index, "update")
        } else if (props.contentType === "requirement" && props.readOnly === undefined) {
            let update = {description: editor.getHTML()}
            props.handleTextUpdate(update, props.elementData.uuid, props.elementData.index, "update")
        }
    }
    const deleteEditor = async () => {
        if (props.contentType === "editor") {
            if (isSfr) {
                handleOpenSfrConfirmationDialog()
            } else {
                await (dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: props.accordionUUID, uuid: props.uuid})))
                await dispatch(DELETE_EDITOR({title: props.title, uuid: props.uuid}))
            }
        }
    }
    const collapseHandler = () => {
        dispatch(COLLAPSE_EDITOR({uuid: props.uuid, title: props.title}))
    }
    const handleSfrSectionName = (event) => {
        setSfrSectionName(event.target.value)
    }
    const handleNewSfrSection = async () => {
        if (isSfr && sfrSectionName && sfrSectionName !== "") {
            // Create SFR UUID
            let sfrUUID = await dispatch(CREATE_SFR_SECTION({title: sfrSectionName})).payload
            if (sfrUUID) {
                await dispatch(CREATE_SFR_SECTION_SLICE({sfrUUID: sfrUUID}))
                await dispatch(CREATE_ACCORDION_SFR_FORM_ITEM({accordionUUID: props.accordionUUID, editorUUID: props.uuid, sfrUUID: sfrUUID}))
            }
            setSfrSectionName("")
        }
    }
    const handleOpenSfrConfirmationDialog = () => {
        setOpenSfrConfirmationDialog(!openSfrConfirmationDialog)
    }

    // Return Method
    return (
        <div className="mb-2">
            <Card className={`${props.contentType !== "editor" ? "border-0 p-0 m-0 " : "border-2 border-gray-300"}`}>
                {
                    props.contentType === "editor" ?
                        <CardBody className="mb-[-42px]">
                            <div className="flex">
                                <label className="mr-2 resize-none font-bold text-lg text-secondary">{props.section}</label>
                                <span/>
                                <Tooltip title={props.titleTooltip ? props.titleTooltip : ""} arrow
                                         disableHoverListener={!props.titleTooltip}>
                                    <textarea className="w-full resize-none font-bold text-lg mb-0 h-[30px] p-0 text-secondary "
                                              onChange={updateEditorTitle} value={props.title}>{props.title}</textarea>
                                </Tooltip>
                                <span/>
                                <IconButton sx={{marginTop: "-8px"}} onClick={deleteEditor} >
                                    <Tooltip title={"Delete Section"}>
                                        <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                    </Tooltip>
                                </IconButton>
                                {
                                    props.contentType === "editor" ?
                                    <div>
                                        <span/>
                                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseHandler}>
                                            <Tooltip title={`${props.open ? "Collapse " : "Expand "} ${isSfr ? "SFR Section" : "Text Editor"}`}>
                                                {
                                                    props.open ?
                                                        <RemoveIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                                        :
                                                        <AddIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                                }
                                            </Tooltip>
                                        </IconButton>
                                    </div>
                                    :
                                    <div/>
                                }
                            </div>
                        </CardBody>
                    :
                    <div/>
                }
                <CardFooter className={`${(props.contentType === "term" || props.contentType === "element" || props.contentType === "requirement") ? "m-0 p-0 border-0" : `${(props.contentType === "editor" && !props.open) ? "m-2 p-1" : ""} `}`}>
                    {
                        ((props.contentType === "editor" && props.open) || props.contentType === "term" || props.contentType === "element" || props.contentType === "requirement") ?
                            <div className="m-0 p-0 w-full">
                                <ReactQuill theme="snow" value={props.text} onChange={updateEditorText} placeholder={ props.readOnly ? "" : "Enter your description"}
                                            style={{border: `1px solid ${style.borderColor}`, borderRadius: '6px', backgroundColor: style.white}}
                                            modules={{
                                                toolbar: (props.contentType === "requirement" && props.readOnly) ? [] :
                                                [
                                                    [{ header: [1, 2, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                    ['link']
                                                ],
                                            }}
                                            readOnly={props.readOnly !== undefined ? props.readOnly : false}
                                />
                                {
                                    isSfr ?
                                        <div className="min-w-full border-t-2 border-gray-200 mt-6 mx-[-24px]">
                                            <div className="w-full mt-6 pb-1 pl-6 pr-4">
                                                <span className="min-w-full inline-flex items-baseline">
                                                    <div className="w-[98%]">
                                                        <FormControl fullWidth>
                                                            <TextField color="primary" required key={sfrSectionName}
                                                                       onBlur={handleSfrSectionName} defaultValue={sfrSectionName}
                                                                       label="New SFR Section Name"/>
                                                        </FormControl>
                                                    </div>
                                                    <div className="pl-1">
                                                        <IconButton sx={{marginBottom: "-32px"}} onClick={handleNewSfrSection}
                                                                    disabled={isSfr && sfrSectionName && sfrSectionName !== "" ? false : true}>
                                                            <Tooltip title={"Add New SFR Section"}>
                                                                <AddCircleIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
                                                            </Tooltip>
                                                        </IconButton>
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            :
                        <div/>
                    }
                </CardFooter>
            </Card>
            {
                isSfr ?
                    <DeleteSfrSectionConfirmation accordionUUID={props.accordionUUID} editorUUID={props.uuid} title={props.title}
                                                  open={openSfrConfirmationDialog} handleOpen={handleOpenSfrConfirmationDialog}/>
                    :
                    null
            }

        </div>
    )
}

// Export TextEditor.jsx
export default TextEditor;
