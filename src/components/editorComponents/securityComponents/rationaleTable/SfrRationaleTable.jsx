// Imports
import "../../components.css";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { ADD_THREAT_TERM_SFR, COLLAPSE_THREAT_RATIONALE_TABLE, SORT_SFR_FROM_THREATS_HELPER } from "../../../../reducers/threatsSlice.js";
import { DELETE_THREAT_TERM_SFR } from "../../../../reducers/threatsSlice.js";
import { handleSnackBarError, handleSnackBarSuccess } from "../../../../utils/securityComponents.jsx";
import DeleteConfirmation from "../../../modalComponents/DeleteConfirmation.jsx";
import RationaleItem from "./RationaleItem.jsx";

/**
 * The SfrRationaleTable component
 * @param termUUID the term uuid
 * @param index the index
 * @param uuid the uuid
 * @param title the title
 * @param sfrs the sfrs
 * @param open the open value
 * @param sfrMaps the sfr maps
 * @returns {JSX.Element}
 * @constructor
 */
function SfrRationaleTable({ termUUID, index, uuid, title, sfrs, open, sfrMaps }) {
  // Prop Types
  SfrRationaleTable.propTypes = {
    termUUID: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    sfrs: PropTypes.array.isRequired,
    open: PropTypes.bool.isRequired,
    sfrMaps: PropTypes.object.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const [selectedSfrs, setSelectedSfrs] = useState([]);
  const [sfrMenuOptions, setSfrMenuOptions] = useState([]);
  const [selectedSfr, setSelectedSfr] = useState("");
  const { secondary, icons } = useSelector((state) => state.styling);
  const [disabled, setDisabled] = useState(true);
  const [openDeleteDialog, setDeleteDialog] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState();

  // Use Effects
  useEffect(() => {
    try {
      let selected = getSelectedSfrs();
      let availableOptions = getAvailableSfrs(selected);

      if (JSON.stringify(selectedSfrs) !== JSON.stringify(selected)) {
        setSelectedSfrs(selected);
      }

      if (JSON.stringify(sfrMenuOptions) !== JSON.stringify(availableOptions)) {
        setSfrMenuOptions(availableOptions);
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }

    // Sort the sfrs
    try {
      dispatch(
        SORT_SFR_FROM_THREATS_HELPER({
          threatUUID: termUUID,
          uuid,
          uuidMap: sfrMaps.sfrUUIDMap,
        })
      );
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  }, [termUUID, index, uuid, title, sfrs, open, sfrMaps]);
  useEffect(() => {
    if (selectedSfr && selectedSfr !== "" && sfrMenuOptions.includes(selectedSfr)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [selectedSfr]);

  // Methods
  /**
   * Handles menu selections
   * @param event the event
   */
  const handleMenuSelections = (event) => {
    let selected = event.target.value;
    setSelectedSfr(selected);
  };
  /**
   * Handles a new selection
   * @returns {Promise<void>}
   */
  const handleNewSelection = async () => {
    try {
      const sfrUUID = sfrMaps.sfrNameMap[selectedSfr];

      if (sfrUUID) {
        await dispatch(
          ADD_THREAT_TERM_SFR({
            threatUUID: termUUID,
            uuid,
            title,
            rationale: "",
            sfrUUID,
            sfrUUIDMap: sfrMaps.sfrUUIDMap,
            sfrName: selectedSfr,
          })
        );

        setSelectedSfr("");
      }

      // Update snackbar
      handleSnackBarSuccess("SFR Successfully Added");
    } catch (e) {
      handleSnackBarError(e);
      console.log(e);
    }
  };
  /**
   * Handles collapsing the sfr table
   */
  const handleCollapseSfrTable = () => {
    dispatch(
      COLLAPSE_THREAT_RATIONALE_TABLE({
        threatUUID: termUUID,
        uuid,
        title,
      })
    );
  };
  /**
   * Handles the delete dialog
   * @param props the props
   */
  const handleDeleteDialog = (props) => {
    setDeleteDialog(!openDeleteDialog);
    setObjectiveToDelete(props);
  };
  /**
   * Handles deleting the threat term sfr
   */
  const handleDeleteThreatTermSfr = () => {
    try {
      const { termUUID, uuid, tableUUID } = objectiveToDelete;

      dispatch(
        DELETE_THREAT_TERM_SFR({
          threatUUID: termUUID,
          uuid,
          sfrUUID: tableUUID,
        })
      );

      // Update snackbar
      handleSnackBarSuccess("SFR Successfully Removed");
    } catch (err) {
      handleSnackBarError(err);
    }
  };

  // Helper Methods
  /**
   * Gets the selected sfrs
   * @returns {*}
   */
  const getSelectedSfrs = () => {
    let sfrNames = sfrs?.map((sfr) => {
      if (sfrMaps && sfrMaps.sfrUUIDMap && sfrMaps.sfrUUIDMap[sfr.uuid]) {
        return sfrMaps.sfrUUIDMap[sfr.uuid];
      }
    });

    return sfrNames.sort();
  };
  /**
   * Gets the available sfrs
   * @param selected the selected
   * @returns {*[]}
   */
  const getAvailableSfrs = (selected) => {
    let availableSelections = [];

    sfrMaps.sfrNames?.map((sfr) => {
      if (!availableSelections.includes(sfr) && !selected.includes(sfr)) {
        availableSelections.push(sfr);
      }
    });

    availableSelections.sort();

    return availableSelections;
  };

  // Return Method
  return (
    <div className='border-2 rounded-lg'>
      <div className='mb-3 mx-4 mt-6'>
        <table className='min-w-full border-0 align-middle ml-2'>
          <thead>
            <tr>
              <th className='text-left px-4 py-2 w-[40%]'>
                <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapseSfrTable} variant='contained'>
                  <Tooltip id={(open ? "collapse" : "expand") + uuid + "TableTooltip"} title={`${open ? "Collapse " : "Expand "} Table`}>
                    {open ? <RemoveIcon htmlColor={secondary} sx={icons.large} /> : <AddIcon htmlColor={secondary} sx={icons.large} />}
                  </Tooltip>
                </IconButton>
              </th>
              <th className={`text-center align-center px-4 py-2 text-[13.5px] text-accent font-extrabold w-[20%]`}>
                <label onClick={handleCollapseSfrTable}>SFR Selections</label>
              </th>
              <th className='text-right px-4 py-2 w-[40%]'>
                {open && (
                  <div>
                    <FormControl style={{ minWidth: "85%" }} required key={uuid + "-NewSfrTypeItem"}>
                      <InputLabel id='new-sfr-label'>Add SFR</InputLabel>
                      <Select value={selectedSfr} label='SFR Name' onChange={handleMenuSelections} sx={{ textAlign: "left" }}>
                        {sfrMenuOptions.map((value) => {
                          return (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <span />
                    <IconButton key={uuid + "-AddSfr"} style={{ marginTop: "4px" }} onClick={handleNewSelection} disabled={disabled} variant='contained'>
                      <Tooltip title={"Add SFR"} id={"addSfrTooltip"}>
                        <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
                      </Tooltip>
                    </IconButton>
                  </div>
                )}
              </th>
            </tr>
          </thead>
        </table>
      </div>
      {open && sfrs && Object.keys(sfrs).length > 0 && (
        <div className='border-2 rounded-lg border-gray-300 bg-gray-40 my-6 mx-6'>
          <table className='w-full border-0'>
            <thead className='border-b-2'>
              <tr>
                <th className='w-[30%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70'>SFR</th>
                <th className='w-[60%] pb-4 text-center align-center font-extrabold text-[12px] text-secondary/70'>Rationale</th>
                <th className='w-[10%] pb-4 px-0 text-center align-center font-extrabold text-[12px] text-secondary/70'>Options</th>
              </tr>
            </thead>
            <tbody>
              {sfrs?.map((sfr) => {
                const currentUUID = sfr.uuid;
                const isSfrMapValid = sfrMaps && sfrMaps.sfrUUIDMap && sfrMaps.sfrUUIDMap[currentUUID];

                if (isSfrMapValid) {
                  const title = sfrMaps.sfrUUIDMap[currentUUID];
                  const rationale = sfr.rationale ? sfr.rationale : "";

                  return (
                    <RationaleItem
                      key={currentUUID + "-RationaleItem"}
                      termUUID={termUUID}
                      uuid={uuid}
                      tableUUID={currentUUID}
                      title={title}
                      rationale={rationale}
                      tableType={"sfrs"}
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
        title={objectiveToDelete?.title}
        open={openDeleteDialog}
        handleOpen={() => setDeleteDialog(!openDeleteDialog)}
        handleSubmit={handleDeleteThreatTermSfr}
      />
    </div>
  );
}

// Export SfrRationaleTable.jsx
export default SfrRationaleTable;
