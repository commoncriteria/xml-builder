// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  ADD_THREAT_TERM_OBJECTIVE,
  COLLAPSE_THREAT_RATIONALE_TABLE,
  SORT_OBJECTIVES_FROM_THREATS_HELPER,
  ADD_THREAT_TERM_SFR,
} from "../../../../reducers/threatsSlice.js";
import { ADD_SFR_TERM_OBJECTIVE, SORT_OBJECTIVES_FROM_SFRS_HELPER, UPDATE_SFR_COMPONENT_ITEMS } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { DELETE_THREAT_TERM_OBJECTIVE, DELETE_THREAT_TERM_SFR } from "../../../../reducers/threatsSlice.js";
import { DELETE_SFR_TERM_OBJECTIVE } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { handleSnackBarError, handleSnackBarSuccess } from "../../../../utils/securityComponents.jsx";
import RationaleItem from "./RationaleItem.jsx";
import DeleteConfirmation from "../../../modalComponents/DeleteConfirmation.jsx";
import "../../components.css";

/**
 * The Rationale Table component
 * @param termUUID the term uuid
 * @param index the index
 * @param uuid the uuid
 * @param title the title
 * @param objectives the objectives
 * @param contentType the content type
 * @param open the open value
 * @param objectiveMaps the objective maps
 * @param threatMaps the threat maps
 * @param sfrMaps the sfr maps
 * @param objectiveSFRsMap the objective sfrs map
 * @returns {JSX.Element}
 * @constructor
 */
function RationaleTable({ termUUID, index, uuid, title, objectives, contentType, open, objectiveMaps, threatMaps, sfrMaps, objectiveSFRsMap }) {
  // Prop Types
  RationaleTable.propTypes = {
    termUUID: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    objectives: PropTypes.array.isRequired,
    contentType: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    objectiveMaps: PropTypes.object.isRequired,
    threatMaps: PropTypes.object,
    sfrMaps: PropTypes.object,
    objectiveSFRsMap: PropTypes.object,
  };

  // Constants
  const dispatch = useDispatch();
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [objectiveMenuOptions, setObjectiveMenuOptions] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState("");
  const { secondary, icons } = useSelector((state) => state.styling);
  const [disabled, setDisabled] = useState(true);
  const [openDeleteDialog, setDeleteDialog] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState();
  const threats = useSelector((state) => state.threats);

  // Use Effects
  useEffect(() => {
    try {
      let selected = getSelectedObjectives();
      if (JSON.stringify(selectedObjectives) !== JSON.stringify(selected)) {
        setSelectedObjectives(selected);
      }
      let availableOptions = getAvailableObjectives(selected);
      if (JSON.stringify(objectiveMenuOptions) !== JSON.stringify(availableOptions)) {
        setObjectiveMenuOptions(availableOptions);
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }

    // Sort the objectives
    try {
      if (contentType === "threats") {
        dispatch(
          SORT_OBJECTIVES_FROM_THREATS_HELPER({
            threatUUID: termUUID,
            uuid,
            uuidMap: objectiveMaps.objectiveUUIDMap,
          })
        );
      } else if (contentType === "sfrs") {
        dispatch(
          SORT_OBJECTIVES_FROM_SFRS_HELPER({
            sfrUUID: termUUID,
            uuid,
            uuidMap: objectiveMaps.objectiveUUIDMap,
          })
        );
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  }, [termUUID, index, uuid, title, objectives, contentType, open, objectiveMaps, threatMaps, sfrMaps, objectiveSFRsMap]);
  useEffect(() => {
    if (selectedObjective && selectedObjective !== "" && objectiveMenuOptions.includes(selectedObjective)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [selectedObjective]);

  // Methods
  /**
   * Handles menu selections
   * @param event the event
   */
  const handleMenuSelections = (event) => {
    let selected = event.target.value;
    setSelectedObjective(selected);
  };
  /**
   * Handles a new selection
   * @returns {Promise<void>}
   */
  const handleNewSelection = async () => {
    switch (contentType) {
      case "threats": {
        const objectiveUUID = objectiveMaps.objectiveNameMap[selectedObjective];
        if (objectiveUUID) {
          await dispatch(
            ADD_THREAT_TERM_OBJECTIVE({
              threatUUID: termUUID,
              uuid,
              title,
              rationale: "",
              objectiveUUID,
              uuidMap: objectiveMaps.objectiveUUIDMap,
            })
          );
          setSelectedObjective("");

          // When an objective is added to an threat, map any SFRs that the objective is mapped to, to the threat
          // (in the case that an objective was added to the SFR before the threat)
          objectiveSFRsMap[objectiveUUID].forEach((sfrObject) => {
            dispatch(
              ADD_THREAT_TERM_SFR({
                threatUUID: threatMaps.threatSectionUUID,
                uuid,
                title: threatMaps.threatUUIDMap[uuid],
                rationale: sfrObject.rationale,
                sfrUUID: sfrObject.sfrUUID,
                sfrName: sfrMaps.sfrUUIDMap[sfrObject.sfrUUID],
                objectiveUUID,
              })
            );
          });
        }
        break;
      }
      case "sfrs": {
        const objectiveUUID = objectiveMaps.objectiveNameMap[selectedObjective];
        if (objectiveUUID) {
          await dispatch(
            ADD_SFR_TERM_OBJECTIVE({
              sfrUUID: termUUID,
              uuid,
              title,
              rationale: "",
              objectiveUUID,
              uuidMap: objectiveMaps.objectiveUUIDMap,
            })
          );
          setSelectedObjective("");

          // When an objective is added to an SFR, additionally map the SFR to any threat that the objective is tied to
          threatMaps.objectiveToThreats[objectiveUUID].forEach((threatUUID) => {
            dispatch(
              ADD_THREAT_TERM_SFR({
                threatUUID: threatMaps.threatSectionUUID,
                uuid: threatUUID,
                title: threatMaps.threatUUIDMap[threatUUID],
                rationale: "",
                sfrUUID: uuid,
                sfrName: sfrMaps.sfrUUIDMap[uuid],
                objectiveUUID,
              })
            );
          });
        }
        break;
      }
      default:
        break;
    }

    // Update snackbar
    if (contentType === "threats" || contentType === "sfrs") {
      handleSnackBarSuccess("Objective Successfully Added");
    }
  };
  /**
   * Handles collapsing the objective table
   */
  const handleCollapseObjectiveTable = () => {
    switch (contentType) {
      case "threats": {
        dispatch(
          COLLAPSE_THREAT_RATIONALE_TABLE({
            threatUUID: termUUID,
            uuid,
            title,
          })
        );
        break;
      }
      case "sfrs": {
        const itemMap = { tableOpen: !open };
        dispatch(
          UPDATE_SFR_COMPONENT_ITEMS({
            sfrUUID: termUUID,
            uuid,
            itemMap,
          })
        );
        break;
      }
      default:
        break;
    }
  };
  /**
   * Handles opening the delete dialog
   * @param props the props
   */
  const handleDeleteDialog = (props) => {
    setObjectiveToDelete(props);
    setDeleteDialog(!openDeleteDialog);
  };
  /**
   * Handles deleting the table item
   */
  const handleDeleteTableItem = () => {
    const { tableType } = objectiveToDelete;

    try {
      if (tableType === "objectives") {
        deleteTableObjective();
      } else if (tableType === "sfrs") {
        deleteTableSfr();
      }
    } catch (e) {
      handleSnackBarError(e);
      console.log(e);
    }
  };

  // Helper Methods
  /**
   * Gets the selected objectives
   * @returns {unknown[]}
   */
  const getSelectedObjectives = () => {
    let objectiveNames = objectives?.map((objective) => {
      if (objectiveMaps && objectiveMaps.objectiveUUIDMap && objectiveMaps.objectiveUUIDMap[objective.uuid]) {
        return objectiveMaps.objectiveUUIDMap[objective.uuid];
      }
    });
    return objectiveNames.sort();
  };
  /**
   * Gets the available objectives
   * @param selected the selected
   * @returns {*[]}
   */
  const getAvailableObjectives = (selected) => {
    let availableSelections = [];
    objectiveMaps.objectiveNames?.map((objective) => {
      if (!availableSelections.includes(objective) && !selected.includes(objective)) {
        availableSelections.push(objective);
      }
    });
    availableSelections.sort();
    return availableSelections;
  };
  /**
   * Filters the threats by objective
   * @param threatSlice the threat slice
   * @param objectiveUUID the objective uuid
   * @returns {{filteredThreats: {[p: string]: unknown}, threatKey: string}}
   */
  const filterThreatsByObjective = (threatSlice, objectiveUUID) => {
    const [threatKey, threatsObject] = Object.entries(threatSlice).find(([_, obj]) => obj.title === "Threats");

    // Filter threats that contain the objective UUID
    const filteredThreats = Object.fromEntries(
      Object.entries(threatsObject.terms).filter(([_, threat]) => threat.objectives.some((obj) => obj.uuid === objectiveUUID))
    );

    return { threatKey, filteredThreats };
  };
  /**
   * Deletes the table objective
   */
  const deleteTableObjective = () => {
    try {
      // termUUID: threats slice Object UUID (threats/assumption Object)
      // uuid: threat term UUID
      // tableUUID: objective UUID
      const { contentType, termUUID, uuid, tableUUID } = objectiveToDelete;

      switch (contentType) {
        case "threats": {
          dispatch(
            DELETE_THREAT_TERM_OBJECTIVE({
              threatUUID: termUUID,
              uuid: uuid,
              objectiveUUID: tableUUID,
            })
          );

          // Remove the SFRs from the threat that they were mapped to, solely via that objective
          threats[termUUID].terms[uuid].sfrs.forEach((sfr) => {
            if (sfr.objectiveUUID === tableUUID) {
              dispatch(
                DELETE_THREAT_TERM_SFR({
                  threatUUID: termUUID,
                  uuid: uuid,
                  sfrUUID: sfr.uuid,
                  objectiveUUID: tableUUID,
                })
              );
            }
          });

          break;
        }
        case "sfrs": {
          dispatch((dispatch, getState) => {
            dispatch(
              DELETE_SFR_TERM_OBJECTIVE({
                sfrUUID: termUUID,
                uuid: uuid,
                objectiveUUID: tableUUID,
              })
            );

            // Remove the SFR from the threats that it was mapped to, solely via that objective
            const { threatKey, filteredThreats } = filterThreatsByObjective(getState().threats, tableUUID);
            Object.entries(filteredThreats).forEach(([threatUUID, threatDetails]) => {
              threatDetails.sfrs.forEach((sfr) => {
                if (sfr.uuid === uuid) {
                  dispatch(
                    DELETE_THREAT_TERM_SFR({
                      threatUUID: threatKey,
                      uuid: threatUUID,
                      sfrUUID: uuid,
                      objectiveUUID: tableUUID,
                    })
                  );
                }
              });
            });
          });
          break;
        }
        default:
          break;
      }

      // Update snackbar
      if (contentType === "threats" || contentType === "sfrs") {
        handleSnackBarSuccess("Objective Successfully Removed");
      }
    } catch (err) {
      handleSnackBarError(err);
    }
  };
  /**
   * Deletes the table sfr
   */
  const deleteTableSfr = () => {
    try {
      const { termUUID, uuid, tableUUID } = objectiveToDelete;

      dispatch(
        DELETE_THREAT_TERM_SFR({
          threatUUID: termUUID,
          uuid: uuid,
          sfrUUID: tableUUID,
        })
      );

      // Update snackbar
      handleSnackBarSuccess("SFR Successfully Removed");
    } catch (err) {
      handleSnackBarError(err);
    }
  };

  // Return Method
  return (
    <div className='border-2 rounded-lg'>
      <div className='mb-3 mx-4 mt-6'>
        <table className='w-full border-0 align-middle ml-2'>
          <thead>
            <tr>
              <th className='p-0 text-left align-center'>
                <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapseObjectiveTable} variant='contained'>
                  <Tooltip id={(open ? "collapse" : "expand") + uuid + "TableTooltip"} title={`${open ? "Collapse " : "Expand "} Table`}>
                    {open ? <RemoveIcon htmlColor={secondary} sx={icons.large} /> : <AddIcon htmlColor={secondary} sx={icons.large} />}
                  </Tooltip>
                </IconButton>
              </th>
              <th className={`p-0 align-center text-[13.5px] text-accent font-extrabold ${open ? " text-right w-[62%]" : "text-center w-[94%]"}`}>
                <label onClick={handleCollapseObjectiveTable}>Security Objective Selections</label>
              </th>
              {open && (
                <th className='p-0 text-right w-[38%] pr-2'>
                  <FormControl style={{ minWidth: "70%" }} required key={uuid + "-NewObjectiveTypeItem"}>
                    <InputLabel id='new-objective-label'>Add Objective</InputLabel>
                    <Select value={selectedObjective} label='Objective Name' onChange={handleMenuSelections} sx={{ textAlign: "left" }}>
                      {objectiveMenuOptions.map((value) => {
                        return (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <span />
                  <IconButton key={uuid + "-AddObjective"} style={{ marginTop: "4px" }} onClick={handleNewSelection} disabled={disabled} variant='contained'>
                    <Tooltip title={"Add Objective"} id={"addObjectiveTooltip"}>
                      <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
                    </Tooltip>
                  </IconButton>
                </th>
              )}
            </tr>
          </thead>
        </table>
      </div>
      {open && objectives && Object.keys(objectives).length > 0 && (
        <div className='border-2 rounded-lg border-gray-300 bg-gray-40 my-6 mx-6'>
          <table className='w-full border-0'>
            <thead className='border-b-2'>
              <tr>
                <th className='w-[30%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70'>Objective</th>
                <th className='w-[60%] pb-4 text-center align-center font-extrabold text-[12px] text-secondary/70'>Rationale</th>
                <th className='w-[10%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70'>Options</th>
              </tr>
            </thead>
            <tbody>
              {objectives?.map((objective) => {
                const currentUUID = objective.uuid;
                const isObjectiveMapValid = objectiveMaps && objectiveMaps.objectiveUUIDMap && objectiveMaps.objectiveUUIDMap[currentUUID];

                if (isObjectiveMapValid) {
                  const title = objectiveMaps.objectiveUUIDMap[currentUUID];
                  const rationale = objective.rationale ? objective.rationale : "";

                  return (
                    <RationaleItem
                      key={currentUUID + "-RationaleItem"}
                      termUUID={termUUID}
                      uuid={uuid}
                      tableUUID={currentUUID}
                      title={title}
                      rationale={rationale}
                      contentType={contentType}
                      tableType={"objectives"}
                      threatMaps={threatMaps}
                      handleDeleteDialog={handleDeleteDialog}
                    />
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      )}
      <DeleteConfirmation
        contentType={objectiveToDelete?.contentType}
        tableType={objectiveToDelete?.tableType}
        title={objectiveToDelete?.title}
        uuid={objectiveToDelete?.uuid}
        termUUID={objectiveToDelete?.termUUID}
        tableUUID={objectiveToDelete?.tableUUID}
        open={openDeleteDialog}
        handleOpen={() => setDeleteDialog(!openDeleteDialog)}
        handleSubmit={handleDeleteTableItem}
      />
    </div>
  );
}

// Export RationaleTable.jsx
export default RationaleTable;
