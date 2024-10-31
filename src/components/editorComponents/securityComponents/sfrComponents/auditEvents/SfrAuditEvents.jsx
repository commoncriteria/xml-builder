// Imports
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { UPDATE_SFR_COMPONENT_ITEMS } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import CardTemplate from "../../CardTemplate.jsx";

/**
 * The SfrAuditEvents class that displays the sfr audit events section
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrAuditEvents(props) {
    // Prop Validation
    SfrAuditEvents.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        value: PropTypes.object.isRequired,
    };

    // Constants
    const dispatch = useDispatch();
    const { primary, secondary, checkboxPrimaryNoPad, checkboxSecondaryNoPad, icons } = useSelector((state) => state.styling);

    // Methods
    const handleAuditEventDescription = (event, auditEvents, uuid) => {
        let description = event.target.value
        if (auditEvents.hasOwnProperty(uuid)) {
            auditEvents[uuid].description = description
        } else {
            auditEvents[uuid] = {
                optional: false,
                description: description
            }
        }
        updateAuditEvents(auditEvents)
    }
    const handleAuditEventOptionalToggle = (event, auditEvents, uuid) => {
        let optional = event.target.checked
        if (auditEvents.hasOwnProperty(uuid)) {
            auditEvents[uuid].optional = optional
        } else {
            auditEvents[uuid] = {
                optional: optional,
                description: ""
            }
        }
        updateAuditEvents(auditEvents)
    }
    const handleAddAuditEvent = () => {
        let auditEvents = props.value.auditEvents ? JSON.parse(JSON.stringify(props.value.auditEvents)) : {}
        let uuid = uuidv4();
        auditEvents[uuid] = {
            optional: false,
            description: "",
            items: []
        }
        updateAuditEvents(auditEvents)
    }
    const handleDeleteAuditEvent = (auditEvents, uuid) => {
        if (auditEvents.hasOwnProperty(uuid)) {
            delete auditEvents[uuid]
            updateAuditEvents(auditEvents)
        }
    }
    const handleAddAuditEventItem = (auditEvents, uuid) => {
        if (auditEvents.hasOwnProperty(uuid)) {
            if (!auditEvents[uuid].hasOwnProperty("items")) {
                auditEvents[uuid].items = []
            }
            auditEvents[uuid].items.push({info: "", optional: false})
            updateAuditEvents(auditEvents)
        }
    }
    const handleUpdateAuditEventItem = (event, type, index, auditEvents, uuid) => {
        if (auditEvents.hasOwnProperty(uuid)) {
            if (auditEvents[uuid].items && auditEvents[uuid].items[index]) {
                if (type === "description") {
                    auditEvents[uuid].items[index].description = event.target.value
                } else if (type === "info") {
                    auditEvents[uuid].items[index].info = event.target.value
                } else if (type === "optional") {
                    auditEvents[uuid].items[index].optional = event.target.checked
                }
                updateAuditEvents(auditEvents)
            }
        }
    }
    const handleDeleteAuditEventItem = (index, auditEvents, uuid) => {
        if (auditEvents.hasOwnProperty(uuid)) {
            if (auditEvents[uuid].items && auditEvents[uuid].items[index]) {
                auditEvents[uuid].items.splice(index, 1)
                updateAuditEvents(auditEvents)
            }
        }
    }

    // Helper Methods
    const updateAuditEvents = (auditEvents) => {
        let itemMap = {auditEvents: auditEvents}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const getAuditItems = (item, index, auditEvents, uuid) => {
        if (item.hasOwnProperty("info")) {
            if (!item.hasOwnProperty("optional")) {
                item.optional = false
            }
            return (
                <div className="mb-5" key={`${uuid}-audit-event-item-${index}`}>
                    <span className="flex justify-center min-w-full">
                        <div className="w-[100%]">
                            <TextField className="w-full" key={item.info} label="Info" defaultValue={item.info}
                                       onBlur={(event) => {
                                           handleUpdateAuditEventItem(event, "info", index, auditEvents, uuid)
                                       }}
                            />
                        </div>
                        <div className="pt-2 ml-3 border-[#BDBDBD] border-[1px] rounded-[5px]">
                            <Stack direction="row" component="label" alignItems="center" justifyContent="center" sx={{paddingX: 1}}>
                                <Typography noWrap style={{fontSize: "11px", fontWeight: 500, color: "#4d4d4d"}}>Optional</Typography>
                                <Checkbox sx={checkboxSecondaryNoPad} size={"small"} checked={item.optional}
                                          onChange={(event) => {
                                              handleUpdateAuditEventItem(event, "optional", index, auditEvents, uuid)
                                          }}
                                />
                            </Stack>
                        </div>
                        <div className="mt-4 ml-3">
                            <IconButton variant="contained" sx={{margin: 0, padding: 0}} onClick={() => {handleDeleteAuditEventItem(index, auditEvents, uuid)}}>
                                <Tooltip title={`Delete Info`} id={props.uuid + "deleteInfoTooltip" + index}>
                                    <DeleteForeverRoundedIcon htmlColor={ secondary } sx={ icons.medium }/>
                                </Tooltip>
                            </IconButton>
                        </div>
                    </span>
                </div>
            )
        }
    }
    const displayAuditEvents = () => {
        let auditEvents = props.value.hasOwnProperty("auditEvents") ? JSON.parse(JSON.stringify(props.value.auditEvents)) : {}
        if (Object.entries(auditEvents).length > 0) {
            return (
                Object.entries(auditEvents).map(([key, auditEvent], index) => {
                    let optional = auditEvent.hasOwnProperty("optional") ? auditEvent.optional : false;
                    let description = auditEvent.hasOwnProperty("description") ? auditEvent.description : "";
                    let items =  auditEvent.hasOwnProperty("items") ? auditEvent.items : [];
                    return (
                        <div className="p-0 m-0 mx-[-12px] pb-1" key={"AuditEventsCard-" + key + "-" + index}>
                            <CardTemplate
                                type={"section"}
                                header={
                                    <div className="p-0 m-0 my-[-6px]">
                                        <span className="flex justify-stretch min-w-full">
                                            <div className="flex justify-center w-[100%]">
                                                 <label className="resize-none font-bold text-[13px] p-0 m-0 text-secondary pr-1 mt-[10px]">
                                                     {`Audit Event ${(index + 1)}`}
                                                 </label>
                                                <IconButton variant="contained" sx={{marginTop: "-8px", margin: 0, padding: 0}} onClick={() => {handleDeleteAuditEvent(auditEvents, key)}}>
                                                    <Tooltip title={`Delete Audit Event ${(index + 1)}`} id={props.uuid + "deleteAuditEventTooltip" + index}>
                                                        <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.small }/>
                                                    </Tooltip>
                                                </IconButton>
                                            </div>
                                            <div className="flex justify-end w-[1%]">
                                                <Stack direction="row" component="label" alignItems="center" justifyContent="center" sx={{paddingX: 1}}>
                                                    <Typography noWrap style={{fontSize: "13px", fontWeight: 500, color: "#4d4d4d"}}>Optional</Typography>
                                                    <Checkbox
                                                        sx={checkboxPrimaryNoPad}
                                                        size={"small"}
                                                        onChange={(event) => {
                                                            handleAuditEventOptionalToggle(event, auditEvents, key)
                                                        }}
                                                        checked={optional}
                                                    />
                                                </Stack>
                                            </div>
                                        </span>
                                    </div>
                                }
                                body={
                                    <div className="w-full p-0 m-0 mt-[-8px] mb-[2px]">
                                        <div className="pt-3 px-2">
                                            <div className={"pb-5"}>
                                                <TextField className="w-full" key={description} label="Audit Event Description" defaultValue={description}
                                                           onBlur={(event) => {handleAuditEventDescription(event, auditEvents, key)}}/>
                                            </div>
                                            {items?.map((item, index) => {
                                                return getAuditItems(item, index, auditEvents, key)
                                            })}
                                        </div>
                                        <div className="border-t-2 border-gray-200 mx-[-16px]">
                                            <div className="w-full p-1 justify-items-center">
                                                <span className="flex justify-center min-w-full pl-5 pr-3">
                                                    <div className="w-[100%]">
                                                        <IconButton sx={{marginBottom: "-8px"}}key={`NewAuditEventButton${key}-${index}`} variant="contained"
                                                                    onClick={() => {handleAddAuditEventItem(auditEvents, key)}}>
                                                            <Tooltip title={"Add New Info"} id={"addNewInfoTooltip" + index}>
                                                                <AddCircleRoundedIcon htmlColor={ primary } sx={ icons.medium }/>
                                                            </Tooltip>
                                                        </IconButton>
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    )
                })
            )
        }
    }

    // Return Method
    return (
        <div className="w-full">
            <CardTemplate
                type={"section"}
                header={
                    <Tooltip id={"auditEventTooltip"}
                         arrow
                         title={
                             <div>
                                 {`Each audit event includes a description (shown in the "Auditable Events" 
                                 column in a PP audit table) and any number of additional info items (shown in the 
                                 "Additional Audit Record Contents” column in a PP audit table). Enabling the 
                                 "optional" check box for the audit event results in the Auditable Event presenting 
                                 in the PP as a selection between the offered description and “none”. Enabling the 
                                 "optional" check box for the Info item results in the Additional Audit Record 
                                 Contents column for that audit event presenting in the PP as a selection between 
                                 the described Info and "No additional information".`}
                                 <br/>
                                 <br/>
                                 * Note: Audit Events will only be used/exported when the SFR Component, FAU_GEN.1 is included.
                             </div>
                         }
                    >
                        <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">Audit Events</label>
                    </Tooltip>
                }
                body={
                    <div>
                        <div className="mb-2 mt-[-5px]">
                            {displayAuditEvents()}
                        </div>
                        <div className="border-t-2 border-gray-200 mx-[-16px]">
                            <div className="w-full p-1 justify-items-center">
                                <IconButton sx={{marginBottom: "-8px"}} key={"NewAuditEventsButton"} onClick={handleAddAuditEvent} variant="contained">
                                    <Tooltip title={"Add New Audit Event"} id={props.uuid + "addNewAuditEventTooltip"}>
                                        <AddCircleRoundedIcon htmlColor={ secondary } sx={ icons.medium }/>
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
}

// Export SfrAuditEvents.jsx
export default SfrAuditEvents;