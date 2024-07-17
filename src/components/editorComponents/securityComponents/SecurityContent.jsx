// Imports
import React, {useState} from "react";
import '../components.css';
import {Card, CardBody, CardFooter} from "@material-tailwind/react";
import {IconButton, Tooltip} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";
import TextEditor from "../TextEditor.jsx";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import {COLLAPSE_THREAT_SECTION, CREATE_THREAT_TERM, DELETE_OBJECTIVE_FROM_THREAT_USING_UUID, DELETE_THREAT_SECTION, UPDATE_THREAT_SECTION_DEFINITION, UPDATE_THREAT_SECTION_TITLE} from "../../../reducers/threatsSlice.js";
import {DELETE_ACCORDION_FORM_ITEM} from "../../../reducers/accordionPaneSlice.js";
import {COLLAPSE_OBJECTIVE_SECTION, CREATE_OBJECTIVE_TERM, DELETE_OBJECTIVE_SECTION, UPDATE_OBJECTIVE_SECTION_DEFINITION, UPDATE_OBJECTIVE_SECTION_TITLE} from "../../../reducers/objectivesSlice.js";
import {COLLAPSE_SFR_SECTION, DELETE_SFR, UPDATE_SFR_SECTION_DEFINITION, UPDATE_SFR_SECTION_TITLE} from "../../../reducers/SFRs/sfrSlice.js";
import {CREATE_SFR_COMPONENT, DELETE_SFR_SECTION} from "../../../reducers/SFRs/sfrSectionSlice.js";
import Definition from "./Definition.jsx";
import SfrSections from "./sfrComponents/SfrSections.jsx";

/**
 * The SecurityContent component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function SecurityContent(props) {
    // Prop Validation
    SecurityContent.propTypes = {
        uuid: PropTypes.string.isRequired,
        accordionUUID: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        definition: PropTypes.string,
        sfrList: PropTypes.object,
        item: PropTypes.object,
        section: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        contentType: PropTypes.string.isRequired,
    }

    // Constants
    const dispatch = useDispatch()
    const style = {primary: "#d926a9", secondary: "#1FB2A6"}
    const [newSfrComponent, setNewSfrComponent] = useState("")

    // Methods
    const handleNewSfrComponent = (componentUUID) => {
        setNewSfrComponent(componentUUID)
    }
    const updateItemTitle = (event) => {
        switch (props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_SECTION_TITLE({uuid: props.uuid, title: props.title, newTitle: event.target.value}))
                break;
            }
            case "objectives": {
                dispatch(UPDATE_OBJECTIVE_SECTION_TITLE({uuid: props.uuid, title: props.title, newTitle: event.target.value}))
                break;
            }
            case "sfrs": {
                dispatch(UPDATE_SFR_SECTION_TITLE({uuid: props.uuid, title: props.title, newTitle: event.target.value}))
                break;
            }
            default:
                break;
        }
    }
    const updateItemDefinition = (event) => {
        switch (props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_SECTION_DEFINITION({uuid: props.uuid, title: props.title, newDefinition: event}))
                break;
            }
            case "objectives": {
                dispatch(UPDATE_OBJECTIVE_SECTION_DEFINITION({uuid: props.uuid, title: props.title, newDefinition: event}))
                break;
            }
            case "sfrs": {
                dispatch(UPDATE_SFR_SECTION_DEFINITION({uuid: props.uuid, title: props.title, newDefinition: event}))
                break;
            }
            default:
                break;
        }
    }
    const deleteItemsList = async() => {
        switch (props.contentType) {
            case "threats": {
                await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: props.accordionUUID, uuid: props.uuid}))
                await dispatch(DELETE_THREAT_SECTION({title: props.title, uuid: props.uuid}))
                break;
            }
            case "objectives": {
                await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: props.accordionUUID, uuid: props.uuid}))
                Object.keys(props.item.terms).map(async (key) => {
                    await dispatch(DELETE_OBJECTIVE_FROM_THREAT_USING_UUID({objectiveUUID: key}))
                })
                await dispatch(DELETE_OBJECTIVE_SECTION({title: props.title, uuid: props.uuid}))
                break;
            }
            case "sfrs": {
                await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: props.accordionUUID, uuid: props.uuid}))
                await dispatch(DELETE_SFR({title: props.title, uuid: props.uuid}))
                await dispatch(DELETE_SFR_SECTION({sfrUUID: props.uuid}))
                break;
            }
            default:
                break;
        }
    }
    const addHandler = async () => {
        switch (props.contentType) {
            case "threats": {
                await dispatch(CREATE_THREAT_TERM({threatUUID: props.uuid}))
                break;
            }
            case "objectives": {
                await dispatch(CREATE_OBJECTIVE_TERM({objectiveUUID: props.uuid}))
                break;
            }
            case "sfrs": {
                let sfrUUID = await dispatch(CREATE_SFR_COMPONENT({sfrUUID: props.uuid})).payload
                if (sfrUUID) {
                    handleNewSfrComponent(sfrUUID)
                }
                break;
            }
            default:
                break;
        }
    }
    const collapseHandler = () => {
        switch (props.contentType) {
            case "threats": {
                dispatch(COLLAPSE_THREAT_SECTION({uuid: props.uuid, title: props.title}))
                break;
            }
            case "objectives": {
                dispatch(COLLAPSE_OBJECTIVE_SECTION({uuid: props.uuid, title: props.title}))
                break;
            }
            case "sfrs": {
                dispatch(COLLAPSE_SFR_SECTION({uuid: props.uuid, title: props.title}))
                break;
            }
            default:
                break;
        }
    }

    // Return Method
    return (
        <div className="min-w-full mb-2" key={props.uuid + "Div"}>
            <Card className="h-full w-full rounded-lg border-2 border-gray-300" key={props.uuid + "Card"}>
                <CardBody className="mb-0 rounded-b-none" key={props.uuid + "CardBody"}>
                    <div className="flex" key={props.uuid + "CardBodyDiv"}>
                        <label className="mr-2 resize-none font-bold text-lg text-secondary" key={props.uuid + "Section"}>{props.section}</label>
                        <span/>
                        <textarea className="w-full resize-none font-bold text-lg mb-0 h-[30px] p-0 text-secondary"
                                  value={props.title} onChange={updateItemTitle}>{props.title}</textarea>
                        <span/>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={deleteItemsList}>
                            <Tooltip title={"Delete Section"}>
                                <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseHandler}>
                            <Tooltip title={`${props.open ? "Collapse " : "Expand "} Section`}>
                                {
                                    props.open ?
                                        <RemoveIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                        :
                                        <AddIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                }
                            </Tooltip>
                        </IconButton>
                    </div>
                </CardBody>
                {
                    props.open ?
                        <CardFooter className="min-w-full m-0 p-0 rounded-b-none border-b-2 border-gray-200 mt-[-20px] rounded-lg">
                            <div className="mx-5 mt-0 mb-3 bg-gray-40" key={props.uuid + "Div"}>
                                <div className="p-1">
                                    <TextEditor className="w-full" uuid={props.uuid} text={props.definition}
                                                contentType={"term"} handleTextUpdate={updateItemDefinition}/>
                                </div>
                                {
                                    props.contentType !== "sfrs" ?
                                        <div className="p-0">
                                            {
                                                (Object.entries(props.item.terms) && Object.entries(props.item.terms).length >= 1) ?
                                                    <div className="min-w-full m-0 p-0 ">
                                                        {Object.entries(props.item.terms).map(([key, value], index) => {
                                                            return (
                                                                <Definition key={props.uuid + "Definition-" + key} index={index} accordionUUID={props.accordionUUID}
                                                                            termUUID={props.uuid} uuid={key} title={value.title} open={value.open}
                                                                            definition={value.definition} item={value} contentType={props.contentType}/>
                                                            )
                                                        })}
                                                    </div>
                                                    :
                                                    null
                                            }
                                        </div>
                                        :
                                        <div className="p-0">
                                            {
                                                (props.sfrList && Object.entries(props.sfrList) && Object.entries(props.sfrList).length >= 1) ?
                                                    <div className="min-w-full m-0 p-0 ">
                                                        {Object.keys(props.sfrList).map((key, index) => {
                                                            let value = props.sfrList[key]
                                                            return (
                                                                <SfrSections accordionUUID={props.accordionUUID}
                                                                             sfrUUID={props.uuid}
                                                                             uuid={key}
                                                                             index={index}
                                                                             value={value}
                                                                             key={key + "-SfrSection"}
                                                                             newSfrComponent={newSfrComponent}
                                                                             handleNewSfrComponent={handleNewSfrComponent}
                                                                />
                                                            )
                                                        })}
                                                    </div>
                                                    :
                                                    null
                                            }
                                        </div>
                                }
                            </div>
                            <div className="flex flex-col items-center h-18 mt-2 mb-3 border-t-2 border-gray-300 pt-2">
                                <IconButton onClick={addHandler}>
                                    <Tooltip title={"Add Item"}>
                                        <AddCircleRoundedIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </CardFooter>
                        :
                        <div className="m-0 p-0 mt-[-15px]"/>
                }
            </Card>
        </div>
    )
}

// Export SecurityContent.jsx
export default SecurityContent;