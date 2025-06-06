// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { getSFRSelectables, handleSnackBarSuccess, updateSfrSectionElement } from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import MultiSelectDropdown from "../../../MultiSelectDropdown.jsx";

/**
 * The SfrSelectionGroupCard class that displays the selection group card for teh sfr selection group
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrSelectionGroupCard(props) {
  // Prop Validation
  SfrSelectionGroupCard.propTypes = {
    styling: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
  };

  // Constants
  const { component, element, selectablesMap } = useSelector((state) => state.sfrWorksheetUI);
  const { icons } = useSelector((state) => state.styling);
  const [selected, setSelected] = useState([]);
  const { styling } = props;

  // Use Effects
  useEffect(() => {
    const { id } = props;
    let newSelectables = getSFRSelectables(element, id, "group");

    if (JSON.stringify(newSelectables) !== JSON.stringify(selected)) {
      setSelected(newSelectables);
    }
  }, [props, component, element]);

  // Methods
  /**
   * Handles the only one checkbox
   * @param event the event
   */
  const handleOnlyOneCheckbox = (event) => {
    const { id } = props;
    let selectableGroups = deepCopy(element.selectableGroups);
    selectableGroups[id].onlyOne = event.target.checked;

    let itemMap = {
      selectableGroups: selectableGroups,
    };

    // Update sfr section element
    updateSfrSectionElement(itemMap);
  };
  /**
   * Handles the multiselect
   * @param title the title
   * @param selections the selections
   */
  const handleMultiselect = (title, selections) => {
    const { id } = props;
    let newSelections = [];
    let selectables = deepCopy(element.selectables);
    let selectableGroups = deepCopy(element.selectableGroups);

    Object.entries(selectables).map(([key, value]) => {
      let name = value.id ? `${value.description} (${value.id})` : value.description;
      selections?.map((selection, index) => {
        if (name === selection && selection && typeof selection === "string" && !newSelections.includes(key)) {
          newSelections[index] = key;
        } else if (selectableGroups.hasOwnProperty(selection)) {
          newSelections[index] = selection;
        }
      });
    });

    // Update selectable group
    selectableGroups[id].groups = newSelections;
    let itemMap = {
      selectableGroups: selectableGroups,
    };
    updateSfrSectionElement(itemMap);
  };
  /**
   * Handles the delete selectable group
   */
  const handleDeleteSelectableGroup = () => {
    const { id } = props;
    let selectableGroups = deepCopy(element.selectableGroups);
    let title = deepCopy(element.title);
    delete selectableGroups[id];

    Object.values(selectableGroups).map((group) => {
      let groups = group.groups;
      if (groups && groups.length > 0 && groups.includes(id)) {
        let index = groups.findIndex((value) => id === value);
        if (index !== -1) {
          groups.splice(index, 1);
        }
      }
    });

    // Delete title selections sections that contain the selection uuid key
    title.map((section, index) => {
      if (section.hasOwnProperty("selections") && section.selections === id) {
        title.splice(index, 1);
      }
    });

    // Generate itemMap
    let itemMap = {
      selectableGroups: selectableGroups,
      title: title,
    };

    // Delete management function sections that contain the selection uuid key
    if (
      element.hasOwnProperty("isManagementFunction") &&
      element.isManagementFunction &&
      element.hasOwnProperty("managementFunctions") &&
      element.managementFunctions.hasOwnProperty("rows")
    ) {
      let managementFunctions = deepCopy(element.managementFunctions);
      managementFunctions.rows.map((row) => {
        let { textArray } = row;

        textArray.map((section, index) => {
          if (section.hasOwnProperty("selections") && section.selections === id) {
            textArray.splice(index, 1);
          }
        });
      });
      itemMap.managementFunctions = managementFunctions;
    }

    // Update selectable groups and title
    updateSfrSectionElement(itemMap);

    // Update snackbar
    handleSnackBarSuccess("Selectable Group Successfully Removed");
  };
  // Return Method
  return (
    <div key={`${props.id}-group-card`}>
      <CardTemplate
        type={"section"}
        header={
          <div className='w-full p-0 m-0 my-[-6px]'>
            <span className='flex justify-stretch min-w-full'>
              <div className='flex justify-center w-full pl-4'>
                <Tooltip
                  arrow
                  id={props.id + "groupDescriptionTooltip"}
                  title={
                    "This section allows a user to group selectables and assignments that have " +
                    "been constructed above. Groups can be nested by selecting a inserting a " +
                    "previously defined group ID within a newly created group."
                  }>
                  <label style={{ color: styling.primaryColor }} className='resize-none font-bold text-[13px] p-0 m-0 pr-1 mt-[10px]'>
                    {props.id}
                  </label>
                </Tooltip>
                <IconButton sx={{ marginTop: "-16px", margin: 0, padding: 0 }} onClick={handleDeleteSelectableGroup} variant='contained'>
                  <Tooltip title={"Delete Selectables Group"} id={"deleteSelectablesGroupTooltip" + props.id}>
                    <DeleteForeverRoundedIcon htmlColor={styling.primaryColor} sx={icons.small} />
                  </Tooltip>
                </IconButton>
              </div>
              <div className='flex justify-end w-[0px] pr-1'>
                <Stack direction='row' component='label' alignItems='center' justifyContent='center'>
                  <Typography noWrap style={styling.primaryToggleTypography}>
                    Only One
                  </Typography>
                  <Checkbox
                    sx={styling.primaryCheckboxNoPad}
                    size={"small"}
                    onChange={handleOnlyOneCheckbox}
                    checked={element.selectableGroups[props.id].onlyOne}
                  />
                </Stack>
              </div>
            </span>
          </div>
        }
        body={
          <div key={`${props.id}-multi-select-dropdown`} className='pb-2'>
            <MultiSelectDropdown
              selectionOptions={selectablesMap.dropdownOptions}
              selections={selected}
              title={"Selectables"}
              groupID={props.id}
              handleSelections={handleMultiselect}
              style={styling.secondaryTextField}
            />
          </div>
        }
      />
    </div>
  );
}

// Export SfrSelectionGroupCard.jsx
export default SfrSelectionGroupCard;
