// Imports
import '../components.css';
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import { COLLAPSE_THREAT_SECTION, CREATE_THREAT_TERM, DELETE_OBJECTIVE_FROM_THREAT_USING_UUID, DELETE_SFR_FROM_THREAT_USING_UUID, DELETE_THREAT_SECTION, UPDATE_THREAT_SECTION_DEFINITION, UPDATE_THREAT_SECTION_TITLE } from "../../../reducers/threatsSlice.js";
import { DELETE_ACCORDION_FORM_ITEM } from "../../../reducers/accordionPaneSlice.js";
import { COLLAPSE_OBJECTIVE_SECTION, CREATE_OBJECTIVE_TERM, DELETE_OBJECTIVE_SECTION, UPDATE_OBJECTIVE_SECTION_DEFINITION, UPDATE_OBJECTIVE_SECTION_TITLE } from "../../../reducers/objectivesSlice.js";
import { COLLAPSE_SAR_SECTION, CREATE_SAR_COMPONENT, DELETE_SAR, UPDATE_SAR_SECTION_SUMMARY, UPDATE_SAR_SECTION_TITLE } from "../../../reducers/sarsSlice.js";
import { COLLAPSE_SFR_SECTION, DELETE_SFR, UPDATE_SFR_SECTION_DEFINITION, UPDATE_SFR_SECTION_TITLE } from "../../../reducers/SFRs/sfrSlice.js";
import { CREATE_SFR_COMPONENT, DELETE_SFR_SECTION } from "../../../reducers/SFRs/sfrSectionSlice.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import SecurityComponents from "../../../utils/securityComponents.jsx";
import ExtendedComponent from "./sfrComponents/extendedComponent/ExtendedComponent.jsx";
import Definition from "./Definition.jsx";
import SarSections from "./sarComponents/SarSections.jsx";
import SfrSections from "./sfrComponents/SfrSections.jsx";
import TipTapEditor from "../TipTapEditor.jsx";
import DeleteConfirmation from '../../modalComponents/DeleteConfirmation.jsx';

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
        sarComponents: PropTypes.array,
        item: PropTypes.object,
        section: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        contentType: PropTypes.string.isRequired,
    }

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch()
    const { primary, secondary, icons } = useSelector((state) => state.styling);
    const sarComponents = useSelector((state) => state.sars.components);
    const [newSarComponent, setNewSarComponent] = useState("")
    const [newSfrComponent, setNewSfrComponent] = useState("")
    const [openDeleteDialog, setDeleteDialog] = useState(false);

    // Methods
    const handleNewSfrComponent = (componentUUID) => {
        setNewSfrComponent(componentUUID)
    }
    const handleNewSarComponent = (componentUUID) => {
        setNewSarComponent(componentUUID)
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
            case "sars": {
                dispatch(UPDATE_SAR_SECTION_TITLE({uuid: props.uuid, title: props.title, newTitle: event.target.value}))
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
            case "sars": {
                dispatch(UPDATE_SAR_SECTION_SUMMARY({uuid: props.uuid, newSummary: event}))
                break;
            }
            default:
                break;
        }
    }
    const deleteItemsList = async() => {
        const { contentType, accordionUUID, uuid, title } = props

        try {
            switch (contentType) {
                case "threats": {
                    await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: accordionUUID, uuid: uuid}))
                    await dispatch(DELETE_THREAT_SECTION({title: title, uuid: uuid}))
                    handleSnackBarSuccess("Section Successfully Removed")
                    break;
                }
                case "objectives": {
                    const { item } = props
                    await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: accordionUUID, uuid: uuid}))
                    Object.keys(item.terms).map(async (key) => {
                        await dispatch(DELETE_OBJECTIVE_FROM_THREAT_USING_UUID({objectiveUUID: key}))
                    })
                    await dispatch(DELETE_OBJECTIVE_SECTION({title: title, uuid: uuid}))
                    handleSnackBarSuccess("Objective Section Successfully Removed")
                    break;
                }
                case "sfrs": {
                    const { sfrList } = props
                    await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: accordionUUID, uuid: uuid}))
                    if (sfrList && Object.entries(sfrList).length > 0) {
                        Object.keys(sfrList).map(async (key) => {
                            await dispatch(DELETE_SFR_FROM_THREAT_USING_UUID({sfrUUID: key}))
                        })
                    }
                    await dispatch(DELETE_SFR({title: title, uuid: uuid}))
                    await dispatch(DELETE_SFR_SECTION({sfrUUID: uuid}))
                    handleSnackBarSuccess("SFR Section Successfully Removed")
                    break;
                }
                case "sars": {
                    await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: accordionUUID, uuid: uuid}))
                    await dispatch(DELETE_SAR({sarUUID: uuid}))
                    handleSnackBarSuccess("SAR Section Successfully Removed")
                    break;
                }
                default:
                    handleSnackBarError("Error - Section type is not valid, nothing was removed")
                    break;
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const addHandler = async () => {
        const { contentType, uuid } = props

        try {
            switch (contentType) {
                case "threats": {
                    await dispatch(CREATE_THREAT_TERM({threatUUID: uuid}))
                    handleSnackBarSuccess("Term Successfully Added")
                    break;
                }
                case "objectives": {
                    await dispatch(CREATE_OBJECTIVE_TERM({objectiveUUID: uuid}))
                    handleSnackBarSuccess("Objective Term Successfully Added")
                    break;
                }
                case "sfrs": {
                    let sfrUUID = await dispatch(CREATE_SFR_COMPONENT({sfrUUID: uuid})).payload
                    if (sfrUUID) {
                        handleNewSfrComponent(sfrUUID)
                    }
                    handleSnackBarSuccess("SFR Component Successfully Added")
                    break;
                }
                case "sars": {
                    let sarUUID = await dispatch(CREATE_SAR_COMPONENT({sarUUID: uuid})).payload
                    if (sarUUID) {
                        handleNewSarComponent(sarUUID)
                    }
                    handleSnackBarSuccess("SAR Component Successfully Added")
                    break;
                }
                default:
                    handleSnackBarError("Error - Term type does not exist. No term added.")
                    break;
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
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
            case "sars": {
                dispatch(COLLAPSE_SAR_SECTION({uuid: props.uuid, title: props.title}))
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
                        <label className="mr-2 resize-none font-bold text-[14px] text-secondary" key={props.uuid + "Section"}>{props.section}</label>
                        <span/>
                        <textarea className="w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary"
                                  value={props.title} onChange={updateItemTitle}>{props.title}</textarea>
                        <span/>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={() => setDeleteDialog(!openDeleteDialog)} variant="contained">
                            <Tooltip title={"Delete Section"} id={props.uuid + "deleteSectionSecurityContentTooltip"}>
                                <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.large }/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseHandler} variant="contained">
                            <Tooltip id={(props.open ? "collapse" : "expand") + props.uuid + "SecurityContentTooltip"}
                                title={`${props.open ? "Collapse " : "Expand "} Section`}>
                                {
                                    props.open ?
                                        <RemoveIcon htmlColor={ primary } sx={ icons.large }/>
                                        :
                                        <AddIcon htmlColor={ primary } sx={ icons.large }/>
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
                                    <TipTapEditor
                                        className="w-full"
                                        uuid={props.uuid}
                                        text={props.definition}
                                        contentType={"term"}
                                        handleTextUpdate={updateItemDefinition}
                                    />
                                </div>
                                { props.contentType === "sfrs" &&
                                    <div className="p-1 mb-[-8px]">
                                        <ExtendedComponent uuid={props.uuid}/>
                                    </div>
                                }
                                {
                                    props.contentType !== "sfrs" && props.contentType !== "sars" ?
                                        <div className="p-0">
                                            {
                                                (Object.entries(props.item.terms) && Object.entries(props.item.terms).length >= 1) ?
                                                    <div className="min-w-full m-0 p-0 ">
                                                        {Object.entries(props.item.terms).map(([key, value], index) => {
                                                            return (
                                                                <Definition
                                                                    key={props.uuid + "Definition-" + key}
                                                                    index={index}
                                                                    accordionUUID={props.accordionUUID}
                                                                    accordionTitle={props.title}
                                                                    termUUID={props.uuid}
                                                                    uuid={key}
                                                                    title={value.title}
                                                                    open={value.open}
                                                                    definition={value.definition}
                                                                    item={value}
                                                                    contentType={props.contentType}
                                                                />
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
                                            {
                                                (props.sarComponents && (props.sarComponents).length >= 1) ?
                                                    <div className="min-w-full m-0 p-0 ">
                                                        {props.sarComponents.map((key, index) => {
                                                            let value = sarComponents[key]
                                                            return (
                                                                <SarSections accordionUUID={props.accordionUUID}
                                                                             sarUUID={props.uuid}
                                                                             componentUUID={key}
                                                                             index={index}
                                                                             value={value}
                                                                             key={key + "-SfrSection"}
                                                                             newSarComponent={newSarComponent}
                                                                             handleNewSarComponent={handleNewSarComponent}
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
                                <IconButton onClick={addHandler} variant="contained">
                                    <Tooltip title={"Add Item"} id={"addSecurityContentItem"}>
                                        <AddCircleRoundedIcon htmlColor={ secondary } sx={ icons.large }/>
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </CardFooter>
                        :
                        <div className="m-0 p-0 mt-[-15px]"/>
                }
            </Card>
            <DeleteConfirmation
                title={props.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteItemsList}
            />
        </div>
    )
}

// Export SecurityContent.jsx
export default SecurityContent;