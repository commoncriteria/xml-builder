// Imports
import React from "react";
import '../components.css';
import PropTypes from "prop-types";
import {Card, CardBody} from "@material-tailwind/react";
import {IconButton, Tooltip} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import RationaleTable from "./RationaleTable.jsx";
import {useDispatch, useSelector} from "react-redux";
import {COLLAPSE_THREAT_TERM, DELETE_OBJECTIVE_FROM_THREAT_USING_UUID, DELETE_THREAT_TERM, UPDATE_THREAT_TERM_DEFINITION, UPDATE_THREAT_TERM_TITLE} from "../../../reducers/threatsSlice.js";
import TextEditor from "../TextEditor.jsx";
import {COLLAPSE_OBJECTIVE_TERM, DELETE_OBJECTIVE_TERM, UPDATE_OBJECTIVE_TERM_DEFINITION, UPDATE_OBJECTIVE_TERM_TITLE} from "../../../reducers/objectivesSlice.js";
import {DELETE_OBJECTIVE_FROM_SFR_USING_UUID} from "../../../reducers/SFRs/sfrSectionSlice.js";

/**
 * The Definition component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function Definition(props) {
    // Prop Validation
    Definition.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        termUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        definition: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        item: PropTypes.object.isRequired,
        contentType: PropTypes.string.isRequired,
    }

    // Constants
    const dispatch = useDispatch()
    const objectives = useSelector((state) => state.objectives);
    const style = {primary: "#d926a9", secondary: "#1FB2A6", borderColor: "#9CA3AF"}

    // Methods
    const updateTitle = (event) => {
        switch(props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_TERM_TITLE({threatUUID: props.termUUID, uuid: props.uuid, title: props.title, newTitle: event.target.value}))
                break;
            }
            case "objectives": {
                dispatch(UPDATE_OBJECTIVE_TERM_TITLE({objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title, newTitle: event.target.value}))
                break;
            }
            default:
                break;
        }
    }
    const updateDefinition = (event) => {
        switch(props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_TERM_DEFINITION({threatUUID: props.termUUID, uuid: props.uuid, title: props.title, newDefinition: event}))
                break;
            }
            case "objectives": {
                dispatch(UPDATE_OBJECTIVE_TERM_DEFINITION({objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title, newDefinition: event}))
                break;
            }
            default:
                break;
        }
    }
    const deleteSection = async () => {
        switch (props.contentType) {
            case "threats": {
                await dispatch(DELETE_THREAT_TERM({threatUUID: props.termUUID, uuid: props.uuid, title: props.title}))
                break;
            }
            case "objectives": {
                await dispatch(DELETE_OBJECTIVE_FROM_SFR_USING_UUID({objectiveUUID: props.uuid}))
                await dispatch(DELETE_OBJECTIVE_FROM_THREAT_USING_UUID({objectiveUUID: props.uuid}))
                await dispatch(DELETE_OBJECTIVE_TERM({objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title}))
                break;
            }
            default:
                break;
        }
    }
    const collapseSection = () => {
        switch(props.contentType) {
            case "threats": {
                dispatch(COLLAPSE_THREAT_TERM({threatUUID: props.termUUID, uuid: props.uuid, title: props.title}))
                break;
            }
            case "objectives": {
                dispatch(COLLAPSE_OBJECTIVE_TERM({objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title}))
                break;
            }
            default:
                break;
        }
    }

    // Helper Methods
    const getObjectiveMaps = () => {
        let objectiveMap = {
            objectiveNames: [],
            objectiveNameMap: {},
            objectiveUUIDMap: {}
        }
        Object.values(objectives).map((value) => {
            let terms = value.terms
            Object.entries(terms).map(([key, value]) => {
                let title = value.title
                if (!objectiveMap.objectiveNames.includes(title)) {
                    objectiveMap.objectiveNames.push(title)
                    objectiveMap.objectiveNameMap[title] = key
                    objectiveMap.objectiveUUIDMap[key] = title
                }
            })
        })
        objectiveMap.objectiveNames.sort()
        return objectiveMap
    }

    // Return Method
    return (
        <div className="p-1 pb-3" key={props.uuid + + "DefinitionBody"} >
            <Card className="border-2 border-gray-300"  key={props.uuid + "DefinitionCard"} >
                <CardBody key={props.uuid + "CardBody"}>
                    <div className="flex" key={props.uuid + "CardBodyDiv"}>
                        <textarea className="w-full resize-none font-bold text-lg mb-0 h-[30px] p-0 text-accent"
                                  onChange={updateTitle} id={props.uuid + "Title"}
                                  value={props.title}>{props.title}</textarea>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={deleteSection}>
                            <Tooltip title={"Delete Section"}>
                                <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseSection}>
                            <Tooltip title={`${props.open ? "Collapse " : "Expand "} Item`}>
                                {
                                    props.open ?
                                        <RemoveIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
                                        :
                                        <AddIcon htmlColor={style.secondary} sx={{ width: 32, height: 32 }}/>
                                }
                            </Tooltip>
                        </IconButton>
                    </div>
                    {
                        props.open ?
                            <div>
                                <div className="m-0 p-0 pt-2" key={props.uuid + "TextEditorDiv"}>
                                    <TextEditor uuid={props.uuid} text={props.definition} contentType={"term"} handleTextUpdate={updateDefinition}/>
                                </div>
                                {
                                    props.contentType === "threats" ?
                                        <div className="pt-2" key={props.uuid + "RationaleTableDiv"}>
                                            <RationaleTable key={props.uuid + "RationaleTable"} accordionUUID={props.accordionUUID}
                                                            termUUID={props.termUUID} index={props.index} uuid={props.uuid}
                                                            title={props.title} objectives={props.item.objectives}
                                                            open={props.item.tableOpen} contentType={props.contentType}
                                                            objectiveMaps={getObjectiveMaps()}/>
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            :
                            <div className="m-0 p-0 mt-[-15px]"/>
                    }
                </CardBody>
            </Card>
        </div>
    )
}

// Export Definition.jsx
export default Definition;