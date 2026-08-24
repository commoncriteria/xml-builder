// Imports
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { UPDATE_SFR_COMPONENT_ITEMS } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { handleSnackBarSuccess } from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The SfrAuditEvents class that displays the sfr audit events section
 * @returns {JSX.Element}   the generic modal content
 */
function SfrAuditEvents() {
  // Constants
  const dispatch = useDispatch();
  const { primary, secondary, checkboxPrimaryNoPad, checkboxSecondaryNoPad, icons } = useSelector((state) => state.styling);
  const { sfrUUID, componentUUID, component } = useSelector((state) => state.sfrWorksheetUI);

  // Methods
  const handleAuditEventDescription = (description, auditEvents, uuid) => {
    if (auditEvents.hasOwnProperty(uuid)) {
      auditEvents[uuid].description = description;
    } else {
      auditEvents[uuid] = {
        optional: false,
        description: description,
      };
    }
    updateAuditEvents(auditEvents);
  };
  const handleAuditEventOptionalToggle = (event, auditEvents, uuid) => {
    let optional = event.target.checked;
    if (auditEvents.hasOwnProperty(uuid)) {
      auditEvents[uuid].optional = optional;
    } else {
      auditEvents[uuid] = {
        optional: optional,
        description: "",
      };
    }
    updateAuditEvents(auditEvents);
  };
  const handleAddAuditEvent = () => {
    let auditEvents = component.auditEvents ? deepCopy(component.auditEvents) : {};
    let uuid = uuidv4();
    auditEvents[uuid] = {
      optional: false,
      description: "",
      items: [],
    };
    updateAuditEvents(auditEvents);

    // Update snackbar
    handleSnackBarSuccess("Audit Event Successfully Added");
  };
  const handleDeleteAuditEvent = (auditEvents, uuid) => {
    if (auditEvents.hasOwnProperty(uuid)) {
      delete auditEvents[uuid];
      updateAuditEvents(auditEvents);

      // Update snackbar
      handleSnackBarSuccess("Audit Event Successfully Removed");
    }
  };
  const handleAddAuditEventItem = (auditEvents, uuid) => {
    if (auditEvents.hasOwnProperty(uuid)) {
      if (!auditEvents[uuid].hasOwnProperty("items")) {
        auditEvents[uuid].items = [];
      }
      auditEvents[uuid].items.push({ info: "", optional: false });
      updateAuditEvents(auditEvents);

      // Update snackbar
      handleSnackBarSuccess("Audit Event Item Successfully Added");
    }
  };
  const handleUpdateAuditEventItem = (event, type, index, auditEvents, uuid) => {
    if (auditEvents.hasOwnProperty(uuid)) {
      if (auditEvents[uuid].items && auditEvents[uuid].items[index]) {
        if (type === "description") {
          auditEvents[uuid].items[index].description = event;
        } else if (type === "info") {
          auditEvents[uuid].items[index].info = event;
        } else if (type === "optional") {
          auditEvents[uuid].items[index].optional = event.target.checked;
        }
        updateAuditEvents(auditEvents);
      }
    }
  };
  const handleDeleteAuditEventItem = (index, auditEvents, uuid) => {
    if (auditEvents.hasOwnProperty(uuid)) {
      if (auditEvents[uuid].items && auditEvents[uuid].items[index]) {
        auditEvents[uuid].items.splice(index, 1);
        updateAuditEvents(auditEvents);

        // Update snackbar
        handleSnackBarSuccess("Audit Event Item Successfully Removed");
      }
    }
  };

  // Helper Methods
  const updateAuditEvents = (auditEvents) => {
    let itemMap = { auditEvents: auditEvents };
    dispatch(UPDATE_SFR_COMPONENT_ITEMS({ sfrUUID: sfrUUID, uuid: componentUUID, itemMap: itemMap }));
  };
  const getAuditItems = (item, index, auditEvents, uuid) => {
    if (item.hasOwnProperty("info")) {
      if (!item.hasOwnProperty("optional")) {
        item.optional = false;
      }

      return (
        <div className='mb-3' key={`${uuid}-audit-event-item-${index}`}>
          <div className='border border-[#BDBDBD] rounded-lg bg-gray-50 overflow-hidden'>
            {/* Card header */}
            <div className='flex items-center justify-between px-3 py-1.5 border-b border-[#BDBDBD] bg-white'>
              <Typography style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Info
              </Typography>
              <div className='flex items-center gap-2'>
                <Stack direction='row' component='label' alignItems='center' gap={0.5}>
                  <Typography noWrap style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Optional
                  </Typography>
                  <Checkbox
                    sx={checkboxSecondaryNoPad}
                    size={"small"}
                    checked={item.optional}
                    onChange={(event) => {
                      handleUpdateAuditEventItem(event, "optional", index, auditEvents, uuid);
                    }}
                  />
                </Stack>
                <IconButton
                  variant='contained'
                  sx={{ margin: 0, padding: 0 }}
                  onClick={() => {
                    handleDeleteAuditEventItem(index, auditEvents, uuid);
                  }}>
                  <Tooltip title={"Delete Info"} id={componentUUID + "deleteInfoTooltip" + index}>
                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.small} />
                  </Tooltip>
                </IconButton>
              </div>
            </div>
            {/* Card body */}
            <div className='mb-[-8px]'>
              <TipTapEditor
                className='w-full'
                contentType={"term"}
                handleTextUpdate={(event) => handleUpdateAuditEventItem(event, "info", index, auditEvents, uuid)}
                text={item.info || ""}
              />
            </div>
          </div>
        </div>
      );
    }
  };
  const displayAuditEvents = () => {
    let auditEvents = component.hasOwnProperty("auditEvents") ? deepCopy(component.auditEvents) : {};
    if (Object.entries(auditEvents).length > 0) {
      return Object.entries(auditEvents).map(([key, auditEvent], index) => {
        let optional = auditEvent.hasOwnProperty("optional") ? auditEvent.optional : false;
        let description = auditEvent.hasOwnProperty("description") ? auditEvent.description : "";
        let items = auditEvent.hasOwnProperty("items") ? auditEvent.items : [];

        return (
          <div className='p-0 m-0 mx-[-12px] pb-1' key={"AuditEventsCard-" + key + "-" + index}>
            <CardTemplate
              type={"section"}
              header={
                <div className='p-0 m-0 my-[-6px]'>
                  <span className='flex justify-stretch min-w-full'>
                    <div className='flex justify-center items-center w-[100%]'>
                      <label className='resize-none font-bold text-[13px] p-0 m-0 text-secondary pr-1'>{`Audit Event ${index + 1}`}</label>
                      <IconButton
                        variant='contained'
                        sx={{ margin: 0, padding: 0 }}
                        onClick={() => {
                          handleDeleteAuditEvent(auditEvents, key);
                        }}>
                        <Tooltip title={`Delete Audit Event ${index + 1}`} id={componentUUID + "deleteAuditEventTooltip" + index}>
                          <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.small} />
                        </Tooltip>
                      </IconButton>
                    </div>
                    <div className='flex justify-end items-center shrink-0'>
                      <Stack direction='row' component='label' alignItems='center' gap={0.5} sx={{ paddingX: 1 }}>
                        <Typography noWrap style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Optional
                        </Typography>
                        <Checkbox
                          sx={checkboxPrimaryNoPad}
                          size={"small"}
                          onChange={(event) => {
                            handleAuditEventOptionalToggle(event, auditEvents, key);
                          }}
                          checked={optional}
                        />
                      </Stack>
                    </div>
                  </span>
                </div>
              }
              body={
                <div className='w-full p-0 m-0 mt-[-8px] mb-[2px]'>
                  <div className='pt-3 px-2'>
                    <div className={"pb-4"}>
                      <div className='border border-[#BDBDBD] rounded-lg bg-gray-50 overflow-hidden'>
                        <div className='flex items-center px-3 py-1.5 border-b border-[#BDBDBD] bg-white'>
                          <Typography style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Audit Event Description
                          </Typography>
                        </div>
                        <div className='mb-[-8px]'>
                          <TipTapEditor
                            className='w-full'
                            contentType={"term"}
                            handleTextUpdate={(event) => handleAuditEventDescription(event, auditEvents, key)}
                            text={description || ""}
                          />
                        </div>
                      </div>
                    </div>
                    {items?.map((item, index) => {
                      return getAuditItems(item, index, auditEvents, key);
                    })}
                  </div>
                  <div className='border-t-2 border-gray-200 mx-[-16px]'>
                    <div className='w-full p-1 justify-items-center'>
                      <span className='flex justify-center min-w-full pl-5 pr-3'>
                        <div className='w-[100%]'>
                          <IconButton
                            sx={{ marginBottom: "-8px" }}
                            key={`NewAuditEventButton${key}-${index}`}
                            variant='contained'
                            onClick={() => {
                              handleAddAuditEventItem(auditEvents, key);
                            }}>
                            <Tooltip title={"Add New Info"} id={"addNewInfoTooltip" + index}>
                              <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
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
        );
      });
    }
  };

  // Return Method
  return (
    <div className='w-full'>
      <CardTemplate
        type={"section"}
        header={
          <Tooltip
            id={"auditEventTooltip"}
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
                <br />
                <br />* Note: Audit Events will only be used/exported when the SFR Component, FAU_GEN.1 is included.
              </div>
            }>
            <label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Audit Events</label>
          </Tooltip>
        }
        body={
          <div>
            <div className='mb-2 mt-[-5px]'>{displayAuditEvents()}</div>
            <div className='border-t-2 border-gray-200 mx-[-16px]'>
              <div className='w-full p-1 justify-items-center'>
                <IconButton sx={{ marginBottom: "-8px" }} key={"NewAuditEventsButton"} onClick={handleAddAuditEvent} variant='contained'>
                  <Tooltip title={"Add New Audit Event"} id={componentUUID + "addNewAuditEventTooltip"}>
                    <AddCircleRoundedIcon htmlColor={secondary} sx={icons.medium} />
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
