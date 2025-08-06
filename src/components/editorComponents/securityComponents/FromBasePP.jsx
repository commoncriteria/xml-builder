// Imports
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Box, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { handleSnackBarSuccess, updateThreatTermFromTag } from "../../../utils/securityComponents.jsx";
import CardTemplate from "./CardTemplate.jsx";

/**
 * The FromBasePP class that displays the threats from base pp section
 * @param threatUUID the threat uuid
 * @param termUUID the threat term uuid
 * @param from the from tag used to indicate that a PP-Module inherits a threat from a Base PP
 * @returns {JSX.Element}
 * @constructor
 */
function FromBasePP({ threatUUID, termUUID, from }) {
  // Prop Validation
  FromBasePP.propTypes = {
    threatUUID: PropTypes.string.isRequired,
    termUUID: PropTypes.string.isRequired,
    from: PropTypes.array.isRequired,
  };

  // Constants
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const { secondary, icons, grayText } = useSelector((state) => state.styling);
  const [collapsed, setCollapsed] = useState(true);
  const [selectedValue, setSelectedValue] = useState("");
  const [shortList, setShortList] = useState({});

  // Use Effects
  useEffect(() => {
    updateShortList();
  });

  // Methods
  /**
   * Handles the select value for the dropdown
   * @param uuid the uuid value of the base pp
   */
  const handleSelectedValue = (uuid) => {
    setSelectedValue(uuid);
  };
  /**
   * Handles adding a new base pp tag to the list
   */
  const handleAddTag = () => {
    if (selectedValue.trim() && !from.includes(selectedValue)) {
      const updated = [...from, selectedValue.trim()];

      updateThreatTermFromTag(threatUUID, termUUID, updated);
      setSelectedValue("");
      handleSnackBarSuccess("Successfully Added");
    }
  };
  /**
   * Handles deleting the chip from the list
   * @param deletedChip the chip that needs to be deleted
   */
  const handleDelete = (deletedChip) => {
    const updated = from.filter((chip) => chip !== deletedChip);

    updateThreatTermFromTag(threatUUID, termUUID, updated);
    handleSnackBarSuccess("Successfully Deleted");
  };
  /**
   * Handles the local collapse of the from base pps section
   */
  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Helper Methods
  /**
   * Updates the short list when the sfr base pp is updated
   */
  const updateShortList = () => {
    let newShortList = {};

    Object.entries(sfrBasePPs)?.forEach(([uuid, basePP]) => {
      if (uuid !== "sfrBasePPDefinition") {
        const { short } = basePP.declarationAndRef || {};

        if (short) {
          newShortList[uuid] = short;
        }
      }
    });

    // Update short list if it has changed
    if (JSON.stringify(shortList) !== JSON.stringify(newShortList)) {
      setShortList(newShortList);
    }
  };
  /**
   * The disabled value used for the add circle icon
   * @returns {boolean}
   */
  const getDisabled = () => {
    return !(selectedValue && selectedValue !== "" && !from.includes(selectedValue));
  };

  // Return Method
  return (
    <CardTemplate
      type={"parent"}
      header={
        <Tooltip
          arrow
          id={"fromTooltip"}
          title={`The <from> tag is used to indicate that a PP-Module inherits a threat from a Base PP. Starting now, 
               inherited threats are documented in the Threats section along with the threats that are specific to the 
               PP-Module (in the past inherited threats were not displayed). If an inherited threat does not include a 
               <description> tag, a boilerplate description is output. Naturally, the remainder of the information 
               appears in the TOE Security Functional Requirements Rationale table.`}>
          <label style={{ color: secondary }} className='resize-none font-bold text-[14px] p-0'>
            Base PPs
          </label>
        </Tooltip>
      }
      body={
        <div>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, paddingTop: 2, marginX: 2 }}>
            {from?.map((uuid) => (
              <Chip key={uuid} label={shortList[uuid]} style={{ margin: 2 }} onDelete={() => handleDelete(uuid)} />
            ))}
          </Box>
          <div className='min-w-full border-t-2 border-gray-200 mt-4'>
            <div className='w-full my-6 pl-6 pr-4'>
              <span className='min-w-full inline-flex items-baseline'>
                <div className='w-[98%]'>
                  <FormControl fullWidth>
                    <Tooltip
                      id={"selectThreatFromBasePPTooltip"}
                      title={`Base PP shorthand values are defined within each Security Requirements Base PP section under "Short" in "Declaration and Reference"`}
                      arrow>
                      <InputLabel key='threat-from-base-pp-select-label'>Select Threat from Base PP</InputLabel>
                    </Tooltip>
                    <Select
                      value={selectedValue}
                      label='Select Threat from Base PP'
                      autoWidth
                      id='threat-from-base-pp_select'
                      onChange={(event) => handleSelectedValue(event.target.value)}
                      sx={{ textAlign: "left" }}>
                      {Object.entries(shortList)?.map(([uuid, shortName]) => {
                        if (!from.includes(uuid)) {
                          return (
                            <MenuItem key={uuid} value={uuid}>
                              {shortName}
                            </MenuItem>
                          );
                        }
                      })}
                    </Select>
                  </FormControl>
                </div>
                <div className='pl-1'>
                  <IconButton sx={{ marginBottom: "-32px" }} onClick={handleAddTag} variant='contained' disabled={getDisabled()}>
                    <Tooltip title={"Add New Threat From Base PP"} id={"addNewFromTagTooltip"}>
                      <AddCircleIcon htmlColor={getDisabled() ? grayText : secondary} sx={icons.large} />
                    </Tooltip>
                  </IconButton>
                </div>
              </span>
            </div>
          </div>
        </div>
      }
      tooltip={"Base PPs"}
      collapse={collapsed}
      collapseHandler={handleCollapse}
      collapseIconColor={secondary}
    />
  );
}

// Export ThreatFromSection.jsx
export default FromBasePP;
