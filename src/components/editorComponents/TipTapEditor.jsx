import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { useDispatch, useSelector } from 'react-redux'
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaSuperscript, FaSubscript, FaListUl, FaAlignCenter, FaAlignRight, FaAlignJustify, FaAlignLeft, FaListOl } from 'react-icons/fa';
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { RiDeleteColumn, RiDeleteRow, RiInsertColumnLeft, RiInsertColumnRight } from "react-icons/ri";
import { GrTableAdd } from "react-icons/gr";
import { TbTableMinus } from "react-icons/tb";
import { StarterKit } from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline'
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { COLLAPSE_EDITOR, DELETE_EDITOR, UPDATE_EDITOR_TEXT, UPDATE_EDITOR_TITLE } from "../../reducers/editorSlice.js";
import { CREATE_ACCORDION_SAR_FORM_ITEM, CREATE_ACCORDION_SFR_FORM_ITEM, DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import { CREATE_SFR_SECTION } from "../../reducers/SFRs/sfrSlice.js";
import { CREATE_SFR_SECTION_SLICE } from "../../reducers/SFRs/sfrSectionSlice.js";
import { CREATE_SAR_SECTION } from "../../reducers/sarsSlice.js";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import RemoveIcon from "@mui/icons-material/Remove.js";
import AddIcon from "@mui/icons-material/Add.js";
import AddCircleIcon from "@mui/icons-material/AddCircle.js";
import DeleteSfrSectionConfirmation from "../modalComponents/DeleteSfrSectionConfirmation.jsx";
import DeleteSarSectionConfirmation from "../modalComponents/DeleteSarSectionConfirmation.jsx";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import "../../../index.css"
import SecurityComponents from "../../utils/securityComponents.jsx";
import { deepCopy } from '../../utils/deepCopy.js';
import DeleteConfirmation from '../modalComponents/DeleteConfirmation.jsx';

/**
* The TipTapEditor rich text editor
 * @returns {React.JSX.Element|null}
 * @constructor
 */
const TipTapEditor = (props) => {
    // Prop Validation
    TipTapEditor.propTypes = {
        title: PropTypes.string,
        section: PropTypes.string,
        accordionUUID: PropTypes.string,
        uuid: PropTypes.string,
        text: PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.object.isRequired
        ]),
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
    const { handleSnackBarSuccess, handleSnackBarError, handleSnackbarTextUpdates } = SecurityComponents
    const dispatch = useDispatch();
    const accordions = useSelector((state) => state.accordionPane.sections)
    const { primary, secondary, icons } = useSelector((state) => state.styling);
    const [sfrSectionName, setSfrSectionName] = useState("")
    const [sarSectionName, setSarSectionName] = useState("")
    const [isSfr, setIsSfr] = useState(false)
    const [isSar, setIsSar] = useState(false)
    const [openSfrConfirmationDialog, setOpenSfrConfirmationDialog] = useState(false)
    const [openSarConfirmationDialog, setOpenSarConfirmationDialog] = useState(false)
    const [openDeleteDialog, setDeleteDialog] = useState(false);
    const editor = useEditor({
        extensions: [
            StarterKit,
            Text,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            Underline,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'right', 'center', 'justify'],
                defaultAlignment: 'left',
            }),
            Placeholder.configure({
                placeholder: 'Enter your text here',
            }),
        ],
        content: props.text ? props.text : '',
        onBlur({ editor }) {
            handleSnackbarTextUpdates(getEditorContent, editor);
        },
    });

    // Use Effects
    useEffect(() => {
        const { accordionUUID, title, readOnly, text } = props

        if (accordions.hasOwnProperty(accordionUUID) && accordions[accordionUUID].hasOwnProperty("title")
            && accordions[accordionUUID].title === "Security Requirements") {
            if (title === "Security Functional Requirements") {
                setIsSfr(true)
            } else if (title === "Security Assurance Requirements") {
                setIsSar(true)
            }
        }

        // Update editor to not be editable if it is readOnly
        if (readOnly) {
            editor.setEditable(false)
        }

        // Update text
        if (editor) {
            editor.commands.setContent(text ? text : "");
        }
    }, [props]);


    // Methods
    const updateEditorTitle = (event) => {
        const { title, uuid, text } = props

        dispatch(UPDATE_EDITOR_TITLE({
            title: title,
            uuid: uuid,
            text: text,
            newTitle: event.target.value
        }))
    }
    const getEditorContent = (editor) => {
        // Get content as HTML
        const { contentType, uuid, title, index, elementData, readOnly, handleTextUpdate } = props
        const htmlContent = deepCopy(editor.getHTML());
        const update = { description: htmlContent }

        // Update the content based on type
        if (contentType === "editor") {
            dispatch(UPDATE_EDITOR_TEXT({
                uuid: uuid,
                newText: htmlContent
            }))
        } else if (contentType === "term") {
            handleTextUpdate(htmlContent, title, index, uuid)
        } else if (contentType === "element" || (contentType === "requirement" && readOnly === undefined)) {
            handleTextUpdate(update, elementData.uuid, elementData.index, "update")
        }
    }
    const deleteEditor = async () => {
        const { contentType } = props
        if (contentType === "editor") {
            if (isSfr) {
                handleOpenSfrConfirmationDialog()
            } else if (isSar) {
                handleOpenSarConfirmationDialog()
            } else {
                setDeleteDialog(!openDeleteDialog)
            }
        }
    }
    const deleteSection = async () => {
        try {
            await dispatch(DELETE_ACCORDION_FORM_ITEM({
              accordionUUID: props.accordionUUID,
              uuid: props.uuid
            }))
            await dispatch(DELETE_EDITOR({
                title: props.title,
                uuid: props.uuid
            }))
    
            // Update snackbar
            handleSnackBarSuccess("Section Successfully Removed")
        } catch(err) {
          handleSnackBarError(err)
        }
    }
    const collapseHandler = () => {
        const { uuid, title } = props

        dispatch(COLLAPSE_EDITOR({
            uuid: uuid,
            title: title
        }))
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
            const sfrUUID = await dispatch(CREATE_SFR_SECTION({ title: sfrSectionName })).payload

            if (sfrUUID) {
                await dispatch(CREATE_SFR_SECTION_SLICE({
                    sfrUUID: sfrUUID
                }))
                await dispatch(CREATE_ACCORDION_SFR_FORM_ITEM({
                    accordionUUID: props.accordionUUID,
                    editorUUID: props.uuid,
                    sfrUUID: sfrUUID
                }))

                // Update snackbar
                handleSnackBarSuccess("New SFR Section Successfully Added")
            }
            setSfrSectionName("")
        }
    }
    const handleNewSarSection = async () => {
        if (isSar && sarSectionName && sarSectionName !== "") {
            // Create SAR UUID
            let sarUUID = await dispatch(CREATE_SAR_SECTION({ title: sarSectionName })).payload

            if (sarUUID) {
                await dispatch(CREATE_ACCORDION_SAR_FORM_ITEM({
                    accordionUUID: props.accordionUUID,
                    editorUUID: props.uuid,
                    sarUUID: sarUUID
                }))

                // Update snackbar
                handleSnackBarSuccess("New SAR Section Successfully Added")
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

    // Return Method
    return (
        <div className="mb-2">
            <Card className={`${props.contentType !== "editor" ? "border-0 p-0 m-0 " : "border-2 border-gray-300"}`}>
                { props.contentType === "editor" ?
                    <CardBody className="mb-[-42px]">
                        <div className="flex">
                            <label className="mr-2 resize-none font-bold text-[14px] text-secondary">{props.section}</label>
                            <span/>
                            <Tooltip
                                title={props.titleTooltip ? props.titleTooltip : ""} arrow
                                id={props.uuid + props.titleTooltip}
                                disableHoverListener={!props.titleTooltip}>
                                <textarea className="w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary"
                                          onChange={updateEditorTitle} value={props.title}>{props.title}
                                </textarea>
                            </Tooltip>
                            <span/>
                            <IconButton sx={{marginTop: "-8px"}} onClick={deleteEditor} variant="contained">
                                <Tooltip title={"Delete Section"} id={props.uuid + "deleteTextEditorSection"}>
                                    <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large}/>
                                </Tooltip>
                            </IconButton>
                            { props.contentType === "editor" ?
                                <div>
                                    <span/>
                                    <IconButton sx={{marginTop: "-8px"}} onClick={collapseHandler}
                                                variant="contained">
                                        <Tooltip
                                            id={(props.open ? "collapse" : "expand") + props.uuid + (isSfr ? "SfrSection" : (isSar ? "SarSection" : "TextEditor"))}
                                            title={`${props.open ? "Collapse " : "Expand "} ${isSfr ? "SFR Section" : (isSar ? "SAR Section" : "Text Editor")}`}>
                                            {
                                                props.open ?
                                                    <RemoveIcon htmlColor={primary} sx={icons.large}/>
                                                    :
                                                    <AddIcon htmlColor={primary} sx={icons.large}/>
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
                    {((props.contentType === "editor" && props.open) || props.contentType === "term" || props.contentType === "element" || props.contentType === "requirement") ?
                        <div className="m-0 p-0 w-full border-0">
                            { editor &&
                                <div className={"bg-[#f9f9f9] border-2 border-gray-300 rounded-lg w-full overflow-x-hidden min-w-full"}>
                                    { !props.readOnly &&
                                        <div>
                                            <MenuBar
                                                editor={editor}
                                                showTable={props.showTable}
                                                icons={icons}
                                            />
                                            <TableBubbleMenu editor={editor}/>
                                        </div>
                                    }
                                    <div className="p-4 text-left">
                                        <EditorContent editor={editor}/>
                                    </div>
                                </div>
                            }
                            { isSfr ?
                                <div className="min-w-full border-t-2 border-gray-200 mt-6 mx-[-24px]">
                                    <div className="w-full mt-6 pb-1 pl-6 pr-4">
                                        <span className="min-w-full inline-flex items-baseline">
                                            <div className="w-[98%]">
                                                <FormControl fullWidth>
                                                    <TextField
                                                        color="primary"
                                                        required
                                                        key={sfrSectionName}
                                                        onBlur={(event) => handleSnackbarTextUpdates(handleSfrSectionName, event)}
                                                        defaultValue={sfrSectionName}
                                                        label="New SFR Section Name"
                                                    />
                                                </FormControl>
                                            </div>
                                            <div className="pl-1">
                                                <IconButton sx={{marginBottom: "-32px"}}
                                                            onClick={handleNewSfrSection} variant="contained"
                                                            disabled={isSfr && sfrSectionName && sfrSectionName !== "" ? false : true}>
                                                    <Tooltip title={"Add New SFR Section"}
                                                             id={"addNewSfrSectionTooltip"}>
                                                        <AddCircleIcon htmlColor={secondary} sx={icons.large}/>
                                                    </Tooltip>
                                                </IconButton>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                                :
                                null
                            }
                            { isSar ?
                                <div className="min-w-full border-t-2 border-gray-200 mt-6 mx-[-24px]">
                                    <div className="w-full mt-6 pb-1 pl-6 pr-4">
                                        <span className="min-w-full inline-flex items-baseline">
                                            <div className="w-[98%]">
                                                <FormControl fullWidth>
                                                    <TextField
                                                        color="primary"
                                                        required
                                                        key={sarSectionName}
                                                        onBlur={(event) => handleSnackbarTextUpdates(handleSarSectionName, event)}
                                                        defaultValue={sarSectionName}
                                                        label="New SAR Section Name"
                                                    />
                                                </FormControl>
                                            </div>
                                            <div className="pl-1">
                                                <IconButton sx={{marginBottom: "-32px"}}
                                                            onClick={handleNewSarSection} variant="contained"
                                                            disabled={isSar && sarSectionName && sarSectionName !== "" ? false : true}>
                                                    <Tooltip title={"Add New SAR Section"}
                                                             id={"addNewSarSectionTooltip"}>
                                                        <AddCircleIcon htmlColor={secondary} sx={icons.large}/>
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
            { isSfr ?
                <DeleteSfrSectionConfirmation
                    accordionUUID={props.accordionUUID}
                    editorUUID={props.uuid}
                    title={props.title}
                    open={openSfrConfirmationDialog}
                    handleOpen={handleOpenSfrConfirmationDialog}
                />
                :
                null
            }
            { isSar ?
                <DeleteSarSectionConfirmation
                    accordionUUID={props.accordionUUID}
                    editorUUID={props.uuid}
                    title={props.title}
                    open={openSarConfirmationDialog}
                    handleOpen={handleOpenSarConfirmationDialog}
                />
                :
                null
            }
            <DeleteConfirmation
                title={props.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteSection}
            />
        </div>
    );
};

// Export TipTapEditor.jsx
export default TipTapEditor;

// External Components
/**
 * The MenuBar used to update the rich text editor
 * @param editor
 * @returns {Element}
 * @constructor
 */
const MenuBar = ({ editor, showTable, icons }) => {
    // Prop Types
    MenuBar.propTypes = {
        editor: PropTypes.object.isRequired,
        showTable: PropTypes.bool,
        icons: PropTypes.object.isRequired,
    }

    // Constants
    const { textEditor } = icons

    // Return Method
    return (
        <div className="menu-bar">
            <Tooltip title={"Bold"}>
                <button onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'is-active' : ''}>
                    <FaBold style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Italic"}>
                <button onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'is-active' : ''}>
                    <FaItalic style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Underline"}>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? 'is-active' : ''}>
                    <FaUnderline style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Heading 1"}>
                <button onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                        className={editor.isActive('heading', {level: 1}) ? 'is-active' : ''}>
                    <LuHeading1/>
                </button>
            </Tooltip>
            <Tooltip title={"Heading 2"}>
                <button onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                        className={editor.isActive('heading', {level: 3}) ? 'is-active' : ''}>
                    <LuHeading2/>
                </button>
            </Tooltip>
            <Tooltip title={"Strike Through"}>
                <button onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'is-active' : ''}>
                    <FaStrikethrough style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Superscript"}>
                <button onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        className={editor.isActive('superscript') ? 'is-active' : ''}>
                    <FaSuperscript style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Subscript"}>
                <button onClick={() => editor.chain().focus().toggleSubscript().run()}
                        className={editor.isActive('subscript') ? 'is-active' : ''}>
                    <FaSubscript style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Left"}>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({textAlign: 'left'}) ? 'is-active' : ''}>
                    <FaAlignLeft style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Center"}>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({textAlign: 'center'}) ? 'is-active' : ''}>
                    <FaAlignCenter style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Right"}>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({textAlign: 'right'}) ? 'is-active' : ''}>
                    <FaAlignRight style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Justify"}>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={editor.isActive({textAlign: 'justify'}) ? 'is-active' : ''}>
                    <FaAlignJustify style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Bullet List"}>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'is-active' : ''}>
                    <FaListUl style={textEditor}/>
                </button>
            </Tooltip>
            <Tooltip title={"Ordered List"}>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'is-active' : ''}>
                    <FaListOl style={textEditor}/>
                </button>
            </Tooltip>
            { showTable &&
                <Tooltip title={"Insert Table"}>
                    <button onClick={() => editor.chain().focus().insertTable({rows: 3, cols: 3}).run()}>
                        <GrTableAdd style={textEditor}/>
                    </button>
                </Tooltip>
            }
        </div>
    )
}

/**
 * The table bubble menu used for editing the table in the rich text editor
 * @param editor
 * @returns {Element}
 * @constructor
 */
const TableBubbleMenu = ({ editor }) => {
    // Prop Types
    TableBubbleMenu.propTypes = {
        editor: PropTypes.object.isRequired,
    }

    // Return Method
    return (
        editor &&
        <BubbleMenu
            editor={editor}
            shouldShow={({editor, view, state, oldState, from, to}) => {
                // only show the bubble menu for tables
                return editor.isActive('table')
            }}
        >
            <div className="bubble-menu">
                <Tooltip title={"Insert Left"}>
                    <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
                        <RiInsertColumnLeft className="tiptap-icon"/>
                    </button>
                </Tooltip>
                <Tooltip title={"Insert Right"}>
                    <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <RiInsertColumnRight className="tiptap-icon"/>
                    </button>
                </Tooltip>
                <Tooltip title={"Insert Above"}>
                    <button onClick={() => editor.chain().focus().addRowBefore().run()}>
                        <RiInsertColumnLeft className="row-before-icon"/>
                    </button>
                </Tooltip>
                <Tooltip title={"Insert Below"}>
                    <button onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <RiInsertColumnLeft className="row-after-icon"/>
                    </button>
                </Tooltip>
                <Tooltip title={"Delete Column"}>
                    <button onClick={() => editor.chain().focus().deleteColumn().run()}>
                        <RiDeleteColumn className="tiptap-icon"/>
                    </button>
                </Tooltip>
                <Tooltip title={"Delete Row"}>
                    <button onClick={() => editor.chain().focus().deleteRow().run()}>
                        <RiDeleteRow className="tiptap-icon"/>
                    </button>
                </Tooltip>
                <Tooltip title={"Delete Table"}>
                    <button onClick={() => editor.chain().focus().deleteTable().run()}>
                        <TbTableMinus className="tiptap-icon"/>
                    </button>
                </Tooltip>
            </div>
        </BubbleMenu>
    )
}