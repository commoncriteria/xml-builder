// Imports
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import StrikethroughSRoundedIcon from "@mui/icons-material/StrikethroughSRounded";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { removeTagEqualities } from "../../../../../../utils/fileParser.js";
import { getSFRSelectables, getUsedSelectables, handleSnackBarSuccess, updateSfrSectionElement } from "../../../../../../utils/securityComponents.jsx";
import {
  getSfrSectionsEvaluationActivityDependencyUsage,
  removeEvaluationActivityDependenciesFromSfrSections,
} from "../../../../../../utils/evaluationActivityDependencyRemoval.js";
import { getSfrPreviewTextString } from "../../../../../../utils/sfrPreview.jsx";
import { SELECTION_FORMATTING_FIELDS } from "../../../../../../utils/selectionFormatting.js";
import CardTemplate from "../../../CardTemplate.jsx";
import MultiSelectDropdown from "../../../MultiSelectDropdown.jsx";
import ToggleSwitch from "../../../../../ToggleSwitch.jsx";
import DependencyDeleteWarning from "../../../../../modalComponents/DependencyDeleteWarning.jsx";

const FORMAT_ICON_MAP = {
  bold: FormatBoldRoundedIcon,
  underline: FormatUnderlinedRoundedIcon,
  strikethrough: StrikethroughSRoundedIcon,
};

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
    handleUpdateID: PropTypes.func.isRequired,
  };

  // Constants
  const { component, element, selectablesMap } = useSelector((state) => state.sfrWorksheetUI);
  const sfrSections = useSelector((state) => state.sfrSections);
  const { icons } = useSelector((state) => state.styling);
  const [selected, setSelected] = useState([]);
  const [selectableGroupID, setSelectableGroupID] = useState(props.id);
  const [previewToggle, setPreviewToggle] = useState(false);
  const [dependencyDeleteWarning, setDependencyDeleteWarning] = useState(null);
  const { styling } = props;

  // Use Effects
  useEffect(() => {
    let newSelectables = getSFRSelectables(element, props.id, "group");

    if (JSON.stringify(newSelectables) !== JSON.stringify(selected)) {
      setSelected(newSelectables);
    }
  }, [props.id, component, element, selected]);

  useEffect(() => {
    setSelectableGroupID(props.id);
  }, [props.id]);

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
   * Handles selectable group formatting updates.
   * @param _event the toggle event
   * @param formattingValues selected formatting values
   */
  const handleFormattingChange = (_event, formattingValues) => {
    const { id } = props;
    const selectableGroups = deepCopy(element.selectableGroups);
    const selectedFormatting = Array.isArray(formattingValues) ? formattingValues : [];

    if (!selectableGroups[id]) return;

    SELECTION_FORMATTING_FIELDS.forEach(({ field }) => {
      selectableGroups[id][field] = selectedFormatting.includes(field);
    });

    updateSfrSectionElement({ selectableGroups });
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
        } else if (Object.prototype.hasOwnProperty.call(selectableGroups, selection)) {
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
  const deleteSelectableGroup = () => {
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
      if (Object.prototype.hasOwnProperty.call(section, "selections") && section.selections === id) {
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
      Object.prototype.hasOwnProperty.call(element, "isManagementFunction") &&
      element.isManagementFunction &&
      Object.prototype.hasOwnProperty.call(element, "managementFunctions") &&
      Object.prototype.hasOwnProperty.call(element.managementFunctions, "rows")
    ) {
      let managementFunctions = deepCopy(element.managementFunctions);
      managementFunctions.rows.map((row) => {
        let { textArray } = row;

        textArray.map((section, index) => {
          if (Object.prototype.hasOwnProperty.call(section, "selections") && section.selections === id) {
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
  /**
   * Handles the delete selectable group.
   */
  const handleDeleteSelectableGroup = () => {
    const { id } = props;
    const dependencyValues = [id].filter(Boolean);
    const usage = getSfrSectionsEvaluationActivityDependencyUsage(sfrSections, dependencyValues);

    if (usage.total > 0) {
      setDependencyDeleteWarning({
        dependencyValues,
        usage,
        itemLabel: `selectable group "${id}"`,
      });
      return;
    }

    deleteSelectableGroup();
  };
  /**
   * Closes the dependency delete warning.
   */
  const handleCloseDependencyDeleteWarning = () => {
    setDependencyDeleteWarning(null);
  };
  /**
   * Deletes the selectable group and removes any dependent evaluation activity relationships.
   */
  const handleSubmitDependencyDeleteWarning = () => {
    if (!dependencyDeleteWarning) return;

    deleteSelectableGroup();
    removeEvaluationActivityDependenciesFromSfrSections(dependencyDeleteWarning.dependencyValues);
    handleCloseDependencyDeleteWarning();
  };
  /**
   * Handles setting the preview toggle
   * @param event the event
   */
  const handleSetPreviewToggle = (event) => {
    setPreviewToggle(event.target.checked);
  };
  /**
   * Handles updating the selectable group ID.
   */
  const handleSelectableGroupIDBlur = () => {
    const result = props.handleUpdateID(props.id, selectableGroupID);
    setSelectableGroupID(result?.id || props.id);
  };
  /**
   * Blurs the selectable group ID field on enter.
   * @param event the keydown event
   */
  const handleSelectableGroupIDKeyDown = (event) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  /**
   * Handles reordering a selection within the group
   * @param fromIndex the index to move from
   * @param toIndex the index to move to
   */
  const handleReorder = (fromIndex, toIndex) => {
    const { id } = props;
    const selectableGroups = deepCopy(element.selectableGroups);
    const groups = selectableGroups[id].groups;
    const [moved] = groups.splice(fromIndex, 1);
    groups.splice(toIndex, 0, moved);
    updateSfrSectionElement({ selectableGroups });
  };

  // Use Memos
  const getPreview = useMemo(() => {
    if (!previewToggle) return null;
    try {
      const { selectables, selectableGroups } = element;
      const preview = getSfrPreviewTextString({
        selectables: deepCopy(selectables),
        selectableGroups: deepCopy(selectableGroups),
        currentTextArray: [{ selections: props.id }],
      });
      return <div className='preview'>{removeTagEqualities(preview, true)}</div>;
    } catch (e) {
      console.log(e);
      return null;
    }
  }, [previewToggle, element, props.id]);
  const selectedFormatting = useMemo(() => {
    const group = element.selectableGroups?.[props.id] || {};
    return SELECTION_FORMATTING_FIELDS.filter(({ field }) => Boolean(group[field])).map(({ field }) => field);
  }, [element.selectableGroups, props.id]);

  // Return Method
  return (
    <div key={`${props.id}-group-card`}>
      <CardTemplate
        type={"section"}
        header={
          <div className='w-full p-0 m-0 my-[-6px]'>
            <span className='flex min-w-full items-center gap-2'>
              <div className='flex min-w-0 flex-1 justify-center pl-4'>
                <Tooltip
                  arrow
                  id={props.id + "groupDescriptionTooltip"}
                  title={
                    "This section allows a user to group selectables and assignments that have " +
                    "been constructed above. Groups can be nested by selecting a inserting a " +
                    "previously defined group ID within a newly created group."
                  }>
                  <TextField
                    size='small'
                    variant='standard'
                    value={selectableGroupID}
                    onChange={(event) => setSelectableGroupID(event.target.value)}
                    onBlur={handleSelectableGroupIDBlur}
                    onKeyDown={handleSelectableGroupIDKeyDown}
                    inputProps={{
                      "aria-label": "Selectable Group ID",
                      style: { color: styling.primaryColor, fontWeight: "bold", fontSize: "13px", textAlign: "center", paddingBottom: "2px" },
                    }}
                    sx={{ minWidth: "180px", maxWidth: "360px", mt: "2px", pr: 1 }}
                  />
                </Tooltip>
                <Tooltip title={"Delete Selectables Group"} id={"deleteSelectablesGroupTooltip" + props.id}>
                  <IconButton sx={{ marginTop: "-16px", margin: 0, padding: 0 }} onClick={handleDeleteSelectableGroup} variant='contained'>
                    <DeleteForeverRoundedIcon htmlColor={styling.primaryColor} sx={icons.small} />
                  </IconButton>
                </Tooltip>
              </div>
              <div className='flex shrink-0 flex-wrap justify-end items-center gap-2 pr-1'>
                <ToggleButtonGroup
                  size='small'
                  value={selectedFormatting}
                  onChange={handleFormattingChange}
                  aria-label='Selectable group formatting'
                  sx={{
                    height: "26px",
                    "& .MuiToggleButton-root": {
                      minWidth: "28px",
                      px: "4px",
                      py: 0,
                      color: styling.primaryColor,
                      borderColor: "#d0d5db",
                    },
                    "& .MuiToggleButton-root.Mui-selected": {
                      color: `${styling.primaryColor} !important`,
                      backgroundColor: "rgba(31, 178, 166, 0.12)",
                    },
                  }}>
                  {SELECTION_FORMATTING_FIELDS.map(({ field, label }) => {
                    const FormatIcon = FORMAT_ICON_MAP[field];
                    return (
                      <ToggleButton key={field} value={field} aria-label={`${label} group selections`}>
                        <Tooltip title={`${label} group selections`} arrow>
                          <FormatIcon sx={{ fontSize: 16 }} />
                        </Tooltip>
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
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
                <div className='flex min-w-[96px] justify-end ml-4'>
                  <ToggleSwitch
                    title={"Preview"}
                    isToggled={previewToggle}
                    isSfrWorksheetToggle={false}
                    handleUpdateToggle={handleSetPreviewToggle}
                    styling={styling}
                    tooltip={"Toggle to preview how this selectable group will appear in the exported document."}
                    tooltipId={props.id + "previewToggleTooltip"}
                  />
                </div>
              </div>
            </span>
          </div>
        }
        body={
          <div key={`${props.id}-multi-select-dropdown`} className='pb-2'>
            {!previewToggle ? (
              <>
                <MultiSelectDropdown
                  selectionOptions={(() => {
                    const { usedUUIDs, usedIDs } = getUsedSelectables(element, { excludeGroupId: props.id });
                    const opts = selectablesMap.dropdownOptions;
                    const { nameMap } = selectablesMap;
                    return {
                      selectables: opts.selectables.filter((n) => !usedUUIDs.has(nameMap.selectables[n])),
                      assignments: opts.assignments.filter((n) => !usedUUIDs.has(nameMap.assignments[n])),
                      groups: opts.groups.filter((n) => !usedIDs.has(n)),
                      complexSelectables: opts.complexSelectables.filter((n) => !usedIDs.has(n)),
                    };
                  })()}
                  selections={selected}
                  title={"Selectables"}
                  groupID={props.id}
                  handleSelections={handleMultiselect}
                  style={styling.secondaryTextField}
                />
                {selected.length > 1 && (
                  <div className='mt-2 border-t border-gray-200 pt-2'>
                    {selected.map((name, index) => {
                      const uuid = element.selectableGroups[props.id].groups[index];
                      const isSelectable = !!element.selectables[uuid];
                      const description = isSelectable ? element.selectables[uuid].description : name;
                      return (
                        <div key={index} className='flex items-center gap-1 py-0.5'>
                          <div className='flex flex-col'>
                            <IconButton size='small' disabled={index === 0} sx={{ padding: "1px" }} onClick={() => handleReorder(index, index - 1)}>
                              <ArrowUpwardRoundedIcon sx={{ fontSize: 14, color: index === 0 ? "gray" : styling.primaryColor }} />
                            </IconButton>
                            <IconButton
                              size='small'
                              disabled={index === selected.length - 1}
                              sx={{ padding: "1px" }}
                              onClick={() => handleReorder(index, index + 1)}>
                              <ArrowDownwardRoundedIcon sx={{ fontSize: 14, color: index === selected.length - 1 ? "gray" : styling.primaryColor }} />
                            </IconButton>
                          </div>
                          <Typography sx={{ fontSize: "12px", wordBreak: "break-word", color: isSelectable ? "inherit" : "gray" }}>{description}</Typography>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div>{getPreview}</div>
            )}
          </div>
        }
      />
      <DependencyDeleteWarning
        itemLabel={dependencyDeleteWarning?.itemLabel || "selectable group"}
        open={Boolean(dependencyDeleteWarning)}
        handleOpen={handleCloseDependencyDeleteWarning}
        handleSubmit={handleSubmitDependencyDeleteWarning}
        usage={dependencyDeleteWarning?.usage}
      />
    </div>
  );
}

// Export SfrSelectionGroupCard.jsx
export default SfrSelectionGroupCard;
