// Imports
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { CREATE_SFR_SECTION_SLICE } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { CREATE_ADDITIONAL_SFR_SECTION_SLICE } from "../../../../../reducers/SFRs/sfrBasePPsSlice.js";
import { handleSnackbarTextUpdates, updateAdditionalSfr } from "../../../../../utils/securityComponents.jsx";
import AdditionalSfr from "./AdditionalSfr.jsx";
import AuditableEvents from "./AuditableEvents.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The AdditionalSfrs component
 * @param uuid the uuid
 * @constructor
 */
function AdditionalSfrs({ uuid }) {
  // Prop Validation
  AdditionalSfrs.propTypes = {
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const [sfrSectionName, setSfrSectionName] = useState("");
  const [disabled, setDisabled] = useState(true);
  const { grayText, secondary, icons } = useSelector((state) => state.styling);
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  let additionalSfrs = sfrBasePPs[uuid]?.additionalSfrs || {};
  const { introduction = "", sfrSections = {} } = additionalSfrs;

  // Methods
  /**
   * Handles the text update
   * @param event the event
   */
  const handleTextUpdate = (event) => {
    // Update additional sfr
    updateAdditionalSfr(uuid, "introduction", event);
  };
  /**
   * Handles adding a new additional sfr
   * @returns {Promise<void>}
   */
  const handleNewAdditionalSfr = async () => {
    // Generate additional sfr section slice
    const sfrUUID = await dispatch(
      CREATE_ADDITIONAL_SFR_SECTION_SLICE({
        parentUUID: uuid,
        title: sfrSectionName,
      })
    ).payload.sfrUUID;

    // Create sfr section slice
    if (sfrUUID) {
      await dispatch(
        CREATE_SFR_SECTION_SLICE({
          sfrUUID: sfrUUID,
        })
      );
    }

    // Reset sfr section name and disabled value
    setSfrSectionName("");
    setDisabled(true);
  };
  /**
   * Handles updating the sfr section name
   * @param event
   */
  const handleSfrSectionName = (event) => {
    setSfrSectionName(event.target.value);
  };

  // Helper Methods
  /**
   * Gets the disabled value
   * @param event the event
   */
  const getDisabled = (event) => {
    const text = event.target.value;

    // Update disabled value
    setDisabled(text && text !== "" ? false : true);
  };

  // Use Memos
  /**
   * The IntroductionEditor section
   */
  const IntroductionEditor = useMemo(() => {
    return <TipTapEditor text={introduction} contentType={"term"} handleTextUpdate={handleTextUpdate} />;
  }, [additionalSfrs, introduction]);

  // Return Method
  return (
    <div className='m-0 p-0 w-full border-0'>
      <div key={"AdditionalSfrEditor"} className='text-left w-full overflow-x-hidden'>
        {IntroductionEditor}
      </div>
      <div className='min-w-full m-0 p-0 mt-2 mb-[-16px]'>
        <AuditableEvents uuid={uuid} />
      </div>
      <div className='w-full m-0 p-0'>
        <div className='min-w-full mb-4 mt-8 p-0 m-0'>
          {sfrSections &&
            Object.keys(sfrSections).length > 0 &&
            Object.keys(sfrSections).map((sectionUUID) => <AdditionalSfr key={sectionUUID} sfrUUID={uuid} uuid={sectionUUID} />)}
        </div>
        <div className='min-w-full border-t-2 border-gray-200 mt-4 mx-[-16px]'>
          <div className='w-full mt-6 pb-1 pl-6 pr-4'>
            <span className='min-w-full inline-flex items-baseline'>
              <div className='w-[98%]'>
                <FormControl fullWidth>
                  <TextField
                    color='primary'
                    required
                    key={sfrSectionName}
                    onChange={(event) => getDisabled(event)}
                    onBlur={(event) => handleSnackbarTextUpdates(handleSfrSectionName, event)}
                    defaultValue={sfrSectionName}
                    label='New Additional SFR Section Name'
                  />
                </FormControl>
              </div>
              <div className='pl-1'>
                <IconButton sx={{ marginBottom: "-32px" }} onClick={handleNewAdditionalSfr} variant='contained' disabled={disabled}>
                  <Tooltip title={"Add New Additional SFR Section"} id={"addNewAdditionalSfrSectionTooltip"}>
                    <AddCircleIcon htmlColor={disabled ? grayText : secondary} sx={icons.large} />
                  </Tooltip>
                </IconButton>
              </div>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export AdditionalSfrs.jsx
export default AdditionalSfrs;
