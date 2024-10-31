// Imports
import PropTypes from "prop-types";
import ReactQuill, {Quill} from 'react-quill-new';
import QuillBetterTable from 'quill-better-table'
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { COLLAPSE_EDITOR, DELETE_EDITOR, UPDATE_EDITOR_TEXT, UPDATE_EDITOR_TITLE } from "../../reducers/editorSlice.js";
import { CREATE_ACCORDION_SAR_FORM_ITEM, CREATE_ACCORDION_SFR_FORM_ITEM, DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js"
import { CREATE_SAR_SECTION } from "../../reducers/sarsSlice.js";
import { CREATE_SFR_SECTION } from "../../reducers/SFRs/sfrSlice.js";
import { CREATE_SFR_SECTION_SLICE } from "../../reducers/SFRs/sfrSectionSlice.js";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteSarSectionConfirmation from "../modalComponents/DeleteSarSectionConfirmation.jsx";
import DeleteSfrSectionConfirmation from "../modalComponents/DeleteSfrSectionConfirmation.jsx";
import 'react-quill/dist/quill.snow.css';
import List, {ListContainer} from 'quill/formats/list';

// Classes
class UListContainer extends ListContainer {}
UListContainer.blotName = 'ulist-container'
UListContainer.tagName = 'UL'

class UListItem extends List {
    static register() {
        Quill.register(UListContainer);
    }
}

UListItem.blotName = 'ulist';
UListItem.tagName = 'LI';
UListContainer.allowedChildren = [UListItem];
UListItem.requiredContainer = UListContainer;

const ulistIcon = `
<svg viewBox="0 0 18 18">
  <line class="ql-stroke" x1="6" x2="15" y1="4" y2="4"></line>
  <line class="ql-stroke" x1="6" x2="15" y1="9" y2="9"></line>
  <line class="ql-stroke" x1="6" x2="15" y1="14" y2="14"></line>
  <line class="ql-stroke" x1="3" x2="3" y1="4" y2="4"></line>
  <line class="ql-stroke" x1="3" x2="3" y1="9" y2="9"></line>
  <line class="ql-stroke" x1="3" x2="3" y1="14" y2="14"></line>
</svg>
`;

Quill.import('ui/icons')['ulist'] = ulistIcon;

// Register
Quill.register({
    'formats/list': List,
    'formats/ulist': UListItem,
});
Quill.register({ "modules/better-table": QuillBetterTable }, true);

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
        titleTooltip: PropTypes.string,
        showTable: PropTypes.bool
    }

    // Constants
    const dispatch = useDispatch();
    const accordions = useSelector((state) => state.accordionPane.sections)
    const { primary, secondary, white, borderColor, icons } = useSelector((state) => state.styling);
    const [sfrSectionName, setSfrSectionName] = useState("")
    const [sarSectionName, setSarSectionName] = useState("")
    const [isSfr, setIsSfr] = useState(false)
    const [isSar, setIsSar] = useState(false)
    const [openSfrConfirmationDialog, setOpenSfrConfirmationDialog] = useState(false)
    const reactQuillRef = useRef(null);

    const insertTable = () => {
        if (reactQuillRef.current) {
            const editor = reactQuillRef.current.getEditor();
            const tableModule = editor.getModule("better-table");
            tableModule.insertTable(3, 3)
        }
    }
    const [openSarConfirmationDialog, setOpenSarConfirmationDialog] = useState(false)

    // Use Effects
    useEffect(() => {
        if (accordions.hasOwnProperty(props.accordionUUID) && accordions[props.accordionUUID].hasOwnProperty("title")
            && accordions[props.accordionUUID].title === "Security Requirements") {
            if (props.title === "Security Functional Requirements") {
                setIsSfr(true)
            } else if (props.title === "Security Assurance Requirements") {
                setIsSar(true)
            }
        }
        if (reactQuillRef.current) {
            const editor = reactQuillRef.current.getEditor();
            const toolbar = editor.getModule("toolbar");
            toolbar.addHandler("table", () => {
                insertTable();
            });
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
            } else if (isSar) {
                handleOpenSarConfirmationDialog()
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
    const handleSarSectionName = (event) => {
        setSarSectionName(event.target.value)
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
    const handleNewSarSection = async () => {
        if (isSar && sarSectionName && sarSectionName !== "") {
            // Create SAR UUID
            let sarUUID = await dispatch(CREATE_SAR_SECTION({title: sarSectionName})).payload
            if (sarUUID) {
                await dispatch(CREATE_ACCORDION_SAR_FORM_ITEM({accordionUUID: props.accordionUUID, editorUUID: props.uuid, sarUUID: sarUUID}))
            }
            setSarSectionName("")
        }
    }
    const handleOpenSfrConfirmationDialog = () => {
        setOpenSfrConfirmationDialog(!openSfrConfirmationDialog)
    }
    const handleOpenSarConfirmationDialog = () => {
        setOpenSarConfirmationDialog(!openSarConfirmationDialog)
    }

    const modules = useMemo(
        () => ({
            table: false,
            "better-table": {
                operationMenu: {
                    items: {
                        unmergeCells: {
                            text: "Unmerged selected cells",
                        }
                    },
                }
            },
            keyboard: {
                bindings: QuillBetterTable.keyboardBindings
            },
            toolbar: [
                [
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    { align: [] },
                    { script: "sub" },
                    { script: "super" },
                    { list: "ordered" },
                    "ulist",
                    { indent: "-1" },
                    { indent: "+1" }
                ],
                ...(props.showTable ? [["table"]] : [])
            ]
        }),
        []
    );


    // Return Method
    return (
        <div className="mb-2">
            <Card className={`${props.contentType !== "editor" ? "border-0 p-0 m-0 " : "border-2 border-gray-300"}`}>
                {
                    props.contentType === "editor" ?
                        <CardBody className="mb-[-42px]">
                            <div className="flex">
                                <label className="mr-2 resize-none font-bold text-[14px] text-secondary">{props.section}</label>
                                <span/>
                                <Tooltip title={props.titleTooltip ? props.titleTooltip : ""} arrow  id={props.uuid + props.titleTooltip}
                                         disableHoverListener={!props.titleTooltip}>
                                    <textarea className="w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary "
                                              onChange={updateEditorTitle} value={props.title}>{props.title}</textarea>
                                </Tooltip>
                                <span/>
                                <IconButton sx={{marginTop: "-8px"}} onClick={deleteEditor} variant="contained">
                                    <Tooltip title={"Delete Section"}  id={props.uuid + "deleteTextEditorSection"}
                                    >
                                        <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.large }/>
                                    </Tooltip>
                                </IconButton>
                                {
                                    props.contentType === "editor" ?
                                    <div>
                                        <span/>
                                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseHandler} variant="contained">
                                            <Tooltip  id={(props.open ? "collapse" : "expand") + props.uuid + (isSfr ? "SfrSection" : (isSar ? "SarSection" : "TextEditor"))}
                                                title={`${props.open ? "Collapse " : "Expand "} ${isSfr ? "SFR Section" : (isSar ? "SAR Section" : "TextEditor")}`}>
                                                {
                                                    props.open ?
                                                        <RemoveIcon htmlColor={ primary } sx={ icons.large }/>
                                                        :
                                                        <AddIcon htmlColor={ primary } sx={ icons.large }/>
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
                                <ReactQuill placeholder={ props.readOnly ? "" : "Enter your description"}
                                            style={{border: `1px solid ${borderColor}`, borderRadius: '6px', backgroundColor: white}}
                                            theme="snow"
                                            modules={modules}
                                            value={props.text}
                                            ref={reactQuillRef}
                                            readOnly={props.readOnly !== undefined ? props.readOnly : false}
                                            onChange={updateEditorText}
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
                                                        <IconButton sx={{marginBottom: "-32px"}} onClick={handleNewSfrSection} variant="contained"
                                                                    disabled={isSfr && sfrSectionName && sfrSectionName !== "" ? false : true}>
                                                            <Tooltip title={"Add New SFR Section"} id={"addNewSfrSectionTooltip"}>
                                                                <AddCircleIcon htmlColor={ secondary } sx={ icons.large }/>
                                                            </Tooltip>
                                                        </IconButton>
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    isSar ?
                                        <div className="min-w-full border-t-2 border-gray-200 mt-6 mx-[-24px]">
                                            <div className="w-full mt-6 pb-1 pl-6 pr-4">
                                                <span className="min-w-full inline-flex items-baseline">
                                                    <div className="w-[98%]">
                                                        <FormControl fullWidth>
                                                            <TextField color="primary" required key={sarSectionName}
                                                                       onBlur={handleSarSectionName} defaultValue={sarSectionName}
                                                                       label="New SAR Section Name"/>
                                                        </FormControl>
                                                    </div>
                                                    <div className="pl-1">
                                                        <IconButton sx={{marginBottom: "-32px"}} onClick={handleNewSarSection} variant="contained"
                                                                    disabled={isSar && sarSectionName && sarSectionName !== "" ? false : true}>
                                                            <Tooltip title={"Add New SAR Section"} id={"addNewSarSectionTooltip"}>
                                                                <AddCircleIcon htmlColor={ secondary } sx={ icons.large }/>
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
            {
                isSar ?
                    <DeleteSarSectionConfirmation accordionUUID={props.accordionUUID} editorUUID={props.uuid} title={props.title}
                                                  open={openSarConfirmationDialog} handleOpen={handleOpenSarConfirmationDialog}/>
                    :
                    null
            }
        </div>
    )
}

// Export TextEditor.jsx
export default TextEditor;