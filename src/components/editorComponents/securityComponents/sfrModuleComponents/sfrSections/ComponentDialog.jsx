// Imports
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import app from "../../../../../../public/data/sfr_components/app_cc2022.json";
import mdm from "../../../../../../public/data/sfr_components/mdm.json";
import gpcp from "../../../../../../public/data/sfr_components/gpcp_cc2022.json";
import gpos from "../../../../../../public/data/sfr_components/gpos_cc2022.json";
import mdf from "../../../../../../public/data/sfr_components/mdf.json";
import tls from "../../../../../../public/data/sfr_components/tls_cc2022.json";
import virtualization from "../../../../../../public/data/sfr_components/virtualization_cc2022.json";
import Modal from "../../../../modalComponents/Modal.jsx";
import ToggleSwitch from "../../../../ToggleSwitch.jsx";

/**
 * The ComponentDialog class that sends a pop-up confirmation for selecting a sfr component for the module type
 * @param sfrUUID the uuid of the sfr base pp
 * @param title the title of the sfr section
 * @param open determines if the dialog is open
 * @param handleOpen handles closing the dialog
 * @param handleSubmit handles submitting the dialog
 * @returns {Element}
 * @constructor
 */
function ComponentDialog({ sfrUUID, title, open, handleOpen, handleSubmit }) {
  // Prop Validation
  ComponentDialog.propTypes = {
    sfrUUID: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  // Constants
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const declarationAndRef = sfrBasePPs[sfrUUID]?.declarationAndRef || {};
  const { short = "" } = declarationAndRef;
  const { secondary, secondaryToggleSwitch } = useSelector((state) => state.styling);
  const toggleStyling = {
    titleColor: secondary,
    primaryToggleSwitch: secondaryToggleSwitch,
  };
  const [sfrList, setSfrList] = useState({});
  const [selectedSfr, setSelectedSfr] = useState("");
  const [isEmptySfr, setIsEmptySfr] = useState(false);
  const dataMap = { app, gpcp, gpos, mdf, mdm, tls, virtualization };

  // Use Effects
  useEffect(() => {
    handleProps(open);
  }, [open]);

  // Methods
  /**
   * Handles the props upon the open value update
   * @param open the value of the dialog being open or closed
   */
  const handleProps = (open) => {
    if (open) {
      // Generate the sfr list upon opening the dialog
      const list = generateSfrList();

      // Update sfr list upon open
      if (JSON.stringify(sfrList) !== JSON.stringify(list)) {
        setSfrList(list);
      }

      // Create new sfr component and close the dialog if the list is empty
      if (Object.keys(list).length === 0) {
        handleConfirm();
      }
    } else {
      // Reset the state values upon close
      setSelectedSfr("");
      setSfrList({});
      setIsEmptySfr(false);
    }
  };
  /**
   * Handles the toggle
   * @param event the event as a domNode
   */
  const handleToggle = (event) => {
    const toggle = event.target.checked;
    setIsEmptySfr(toggle);

    // Clear out the selected sfr
    if (toggle) {
      setSelectedSfr("");
    }
  };
  /**
   * Handles selecting the sfr value
   * @param event the event as a domNode
   */
  const handleSelectedSfr = (event) => {
    setSelectedSfr(event.target.value);
  };
  /**
   * Handles the dialog confirmation button
   */
  const handleConfirm = () => {
    // Close the dialog
    handleOpen();

    // Grab the selected sfr and create the new sfr component
    const isSelectedSfr = selectedSfr && selectedSfr !== "";
    const isSfrList = isSelectedSfr && sfrList && Object.keys(sfrList).length > 0 && sfrList.hasOwnProperty(selectedSfr);
    let newComponent = isSfrList ? deepCopy(sfrList[selectedSfr]) : {};

    // Find the component uuid if it exists within the evaluation activities
    if (Object.keys(newComponent).length > 0) {
      findComponentUUID(newComponent);
    }

    // Add new component
    handleSubmit(newComponent);

    // Reset the state values upon close
    setSelectedSfr("");
    setSfrList({});
    setIsEmptySfr(false);
  };

  // Helper Methods
  /**
   * Finds the component uuid value from the evaluation activities (if it exists)
   * @param newComponent The value of the component to be updated
   */
  const findComponentUUID = (newComponent) => {
    let elementKeys = newComponent.hasOwnProperty("elements") ? Object.keys(newComponent.elements) : [];
    let evaluationActivityKeys = newComponent.hasOwnProperty("evaluationActivities") ? Object.keys(newComponent.evaluationActivities) : [];

    // Search for the component uuid in evaluationActivities
    if (evaluationActivityKeys.length > 0) {
      let componentUUIDs = evaluationActivityKeys.filter((key) => !elementKeys.includes(key));

      // Update the component id to match the evaluation activity uuid for the component
      if (componentUUIDs.length === 1) {
        newComponent.sfrCompUUID = componentUUIDs[0];
      }
    }
  };
  /**
   * Generates the sfr list used for the dropdown and for generating a new component upon selection
   * @returns {{}}
   */
  const generateSfrList = () => {
    const sfrTag = extractInnerString(title);
    const isSfrTagValid = sfrTag && sfrTag !== "";
    const isShortNameValid = short && short !== "";

    // Return the sfr list if it is valid
    if (isSfrTagValid && isShortNameValid) {
      const shortName = short.toLowerCase();

      // Filter the data
      if (dataMap[shortName]) {
        let data = deepCopy(dataMap[shortName]);
        let filteredData = {};
        Object.entries(data).forEach(([key, value]) => {
          if (key.toLowerCase().includes(sfrTag.toLowerCase())) {
            filteredData[key] = value;
          }
        });

        return filteredData;
      }
    }

    return {};
  };
  /**
   * Extracts the inner string of the sfr family to grab the tag value
   * @param inputString the string title of the sfr family
   * @returns {*|string}
   */
  const extractInnerString = (inputString) => {
    // Regular expression to find text within parentheses
    const match = inputString.match(/\(([^)]+)\)/);

    // Return the matched group or an empty string if no match
    return match ? match[1] : "";
  };

  // Return Method
  return (
    <div>
      <Modal
        title={"Select Sfr Component"}
        content={
          <div className='p-2 text-[14px]'>
            <div className={`${!isEmptySfr ? "p-2 pb-0 w-[230px] border-[1px] border-[#bdbdbd] rounded-[4px]" : ""}`}>
              <ToggleSwitch
                title={"Use Empty Sfr Component"}
                tooltip={"Sets Sfr Component to an empty value, if checked"}
                tooltipID={"selectSfrComponentDialogTooltip"}
                isToggled={isEmptySfr}
                isSfrWorksheetToggle={true}
                handleUpdateToggle={handleToggle}
                styling={toggleStyling}
              />
            </div>
            {!isEmptySfr && (
              <FormControl style={{ minWidth: "230px", marginRight: 4, marginTop: 16 }} key={"SelectSfrComponent"} required>
                <InputLabel id='demo-simple-select-label'>Select Sfr Component</InputLabel>
                <Select value={selectedSfr} label='Select Sfr Component' onChange={handleSelectedSfr} sx={{ textAlign: "left" }}>
                  {Object.keys(sfrList).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        }
        open={open}
        handleOpen={handleOpen}
        handleSubmit={handleConfirm}
      />
    </div>
  );
}

// Export ComponentDialog.jsx
export default ComponentDialog;
