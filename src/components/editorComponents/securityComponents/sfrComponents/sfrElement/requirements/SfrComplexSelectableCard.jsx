// Imports
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { removeTagEqualities } from "../../../../../../utils/fileParser.js";
import {
  getSFRSelectables,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  updateSfrSectionElement,
} from "../../../../../../utils/securityComponents.jsx";
import { getComplexSelectableTextString } from "../../../../../../utils/sfrPreview.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import MultiSelectDropdown from "../../../MultiSelectDropdown.jsx";
import ToggleSwitch from "../../../../../ToggleSwitch.jsx";

/**
 * The SfrComplexSelectableCard class that displays the complex selectable card
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrComplexSelectableCard(props) {
  // Prop Validation
  SfrComplexSelectableCard.propTypes = {
    id: PropTypes.string.isRequired,
    styling: PropTypes.object.isRequired,
  };

  // Constants
  const { icons } = useSelector((state) => state.styling);
  const sfrWorksheetUI = useSelector((state) => state.sfrWorksheetUI);
  const { elementUUID, component, element, selectablesMap } = sfrWorksheetUI;
  const [currentSelectable, setCurrentSelectable] = useState({ exclusive: false, notSelectable: false, description: [] });
  const [complexSelectableType, setComplexSelectableType] = useState("Selectables");
  const [previewToggle, setPreviewToggle] = useState(false);
  const { styling } = props;

  // Use Effects
  useEffect(() => {
    const { id } = props;

    if (element.selectableGroups[id] && JSON.stringify(element.selectableGroups[id]) !== JSON.stringify(currentSelectable)) {
      setCurrentSelectable(deepCopy(element.selectableGroups[id]));
    }
  }, [props, component]);

  // Methods
  /**
   * Handles setting the complex selectable type
   * @param event the event
   */
  const handleSetComplexSelectableType = (event) => {
    setComplexSelectableType(event.target.value);
  };
  /**
   * Handles the exclusive checkbox
   * @param event the event
   */
  const handleExclusiveCheckbox = (event) => {
    const { id } = props;

    if (element.selectableGroups) {
      let selectableGroups = deepCopy(element.selectableGroups);
      selectableGroups[id].exclusive = event.target.checked;
      updateSelectableGroups(selectableGroups);
    }
  };
  /**
   * Handles the not selectable checkbox
   * @param event the event
   */
  const handleNotSelectableCheckbox = (event) => {
    const { id } = props;

    if (element.selectableGroups) {
      let selectableGroups = deepCopy(element.selectableGroups);
      selectableGroups[id].notSelectable = event.target.checked;
      updateSelectableGroups(selectableGroups);
    }
  };
  /**
   * Handles the new complex selectable submit
   */
  const handleNewComplexSelectableSubmit = () => {
    const { id } = props;

    if (element.selectableGroups) {
      let selectableGroups = deepCopy(element.selectableGroups);
      let description = selectableGroups[id].description ? deepCopy(selectableGroups[id].description) : [];
      if (complexSelectableType === "Text") {
        description.push({ text: "" });
        selectableGroups[id].description = description;
        updateSelectableGroups(selectableGroups);
        setComplexSelectableType("Selectables");

        // Update snackbar
        handleSnackBarSuccess("New Text Item Successfully Added");
      } else if (complexSelectableType === "Selectables") {
        description.push({ groups: [] });
        selectableGroups[id].description = description;
        updateSelectableGroups(selectableGroups);

        // Update snackbar
        handleSnackBarSuccess("New Selectables Item Successfully Added");
      }
    }
  };
  /**
   * Handles setting the preview toggle
   * @param event the event
   */
  const handleSetPreviewToggle = (event) => {
    let toggle = event.target.checked;
    setPreviewToggle(toggle);
  };
  /**
   * Handles the text update
   * @param event the event
   * @param index the index
   */
  const handleTextUpdate = (event, index) => {
    const { id } = props;

    if (element.selectableGroups) {
      let selectableGroups = deepCopy(element.selectableGroups);
      let description = selectableGroups[id].description;
      if (description && description[index]) {
        description[index].text = event.target.value;
        updateSelectableGroups(selectableGroups);
      }
    }
  };
  /**
   * Handles the delete complex selectable item
   * @param index the index
   */
  const handleDeleteComplexSelectableItem = (index) => {
    const { id } = props;

    if (element.selectableGroups) {
      let selectableGroups = deepCopy(element.selectableGroups);
      let description = selectableGroups[id].description;
      if (description && description[index]) {
        description.splice(index, 1);
        updateSelectableGroups(selectableGroups);

        // Update snackbar
        handleSnackBarSuccess("Item Successfully Removed");
      }
    }
  };
  /**
   * Handles the multiselect
   * @param title the title
   * @param selections the selections
   * @param mainIndex the main index
   */
  const handleMultiselect = (title, selections, mainIndex) => {
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
    selectableGroups[id].description[mainIndex] = { groups: newSelections };
    updateSelectableGroups(selectableGroups);
  };
  /**
   * Handles delete selectable group
   */
  const handleDeleteSelectableGroup = () => {
    const { id } = props;
    let selectableGroups = deepCopy(element.selectableGroups);
    let title = deepCopy(element.title);

    if (selectableGroups[id]) {
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

      // Update selectable groups and title
      updateSfrSectionElement({
        selectableGroups,
        title,
      });

      // Update snackbar
      handleSnackBarSuccess("Complex Selectable Successfully Removed");
    }
  };
  /**
   * Updates the selectable groups
   * @param selectableGroups the selectable groups
   */
  const updateSelectableGroups = (selectableGroups) => {
    // Update the selectable groups
    updateSfrSectionElement({
      selectableGroups,
    });
  };

  // Components
  /**
   * Shows the complex selectable preview
   * @param previewToggle the preview toggle
   * @param currentSelectable the current selectable
   * @param element the element
   * @returns {JSX.Element}
   */
  const showComplexSelectablePreview = (previewToggle, currentSelectable, element) => {
    const isCurrentSelectable = currentSelectable && currentSelectable.hasOwnProperty("description");

    if (previewToggle && isCurrentSelectable && element) {
      let complexSelectable = "";

      try {
        // Get the element selectables and selectableGroups
        const { selectables, selectableGroups } = element;

        if (element) {
          complexSelectable = getComplexSelectableTextString({
            selectables: selectables ? deepCopy(selectables) : {},
            selectableGroups: selectableGroups ? deepCopy(selectableGroups) : {},
            currentSelectable: currentSelectable ? deepCopy(currentSelectable) : {},
          });
        }
      } catch (e) {
        console.log(e);
        handleSnackBarError(e);
      }

      // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
      // would be omitted by the RTE due to not knowing how to interpret them)
      return <div className='preview'>{removeTagEqualities(complexSelectable, true)}</div>;
    }
  };
  /**
   * Shows text content
   * @param value the value
   * @param index the index
   * @returns {JSX.Element}
   */
  const showTextContent = (value, index) => {
    let text = value.text ? value.text : "";

    return (
      <div className='mb-4' key={index + "TextContent"}>
        <span className='min-w-full inline-flex items-baseline'>
          <div className='w-[94%]'>
            <FormControl fullWidth>
              <TextField
                color={styling.secondaryTextField}
                key={text}
                label='Text'
                defaultValue={text}
                onBlur={(event) => handleSnackbarTextUpdates(handleTextUpdate, event, index)}
              />
            </FormControl>
          </div>
          <div className='w-[6%]'>
            <IconButton sx={{ marginBottom: "-26px" }} onClick={() => handleDeleteComplexSelectableItem(index)} variant='contained'>
              <Tooltip title={"Delete Text"} id={elementUUID + "deleteTextTooltip"}>
                <DeleteForeverRoundedIcon htmlColor={styling.secondaryColor} sx={icons.large} />
              </Tooltip>
            </IconButton>
          </div>
        </span>
      </div>
    );
  };
  /**
   * Shows the selectable content
   * @param value the value
   * @param index the index
   * @returns {JSX.Element}
   */
  const showSelectablesContent = (value, index) => {
    const { id } = props;
    let selected = element.selectableGroups[id].description[index] ? deepCopy(getSFRSelectables(element, id, "complex", index)) : [];
    let selectableOptions = deepCopy(selectablesMap.dropdownOptions);

    return (
      <div className='mb-4' key={index + "SelectablesContent"}>
        <span className='min-w-full inline-flex items-baseline'>
          <div className='w-[94%]'>
            <MultiSelectDropdown
              selectionOptions={selectableOptions}
              selections={selected}
              title={"Selectables"}
              groupID={props.id}
              handleSelections={handleMultiselect}
              index={index}
              style={styling.primaryTextField}
            />
          </div>
          <div className='w-[6%]'>
            <IconButton sx={{ marginBottom: "-26px" }} onClick={() => handleDeleteComplexSelectableItem(index)} variant='contained'>
              <Tooltip title={"Delete Selectables"} id={elementUUID + "deleteSelectablesTooltip"}>
                <DeleteForeverRoundedIcon htmlColor={styling.secondaryColor} sx={icons.large} />
              </Tooltip>
            </IconButton>
          </div>
        </span>
      </div>
    );
  };

  // Use Memos
  /**
   * Gets the preview section
   */
  const getPreview = useMemo(() => {
    if (previewToggle) {
      return showComplexSelectablePreview(previewToggle, currentSelectable, element);
    }
  }, [previewToggle, currentSelectable, element]);

  // Return Method
  return (
    <div key={`${props.id}-complex-selectable-card`}>
      <CardTemplate
        type={"section"}
        header={
          <div className='w-full p-0 m-0 my-[-6px]'>
            <span className='flex justify-stretch min-w-full'>
              <div className='flex justify-center text-center w-full pl-4'>
                <Tooltip
                  id={"sfrComplexSelectableTooltip"}
                  title={`This section allows a user to create a complex selectable based on the 
                                         selections, groups and assignments that have been previously constructed. 
                                         Complex selectables can have the option of either text that will be separated 
                                         by a space or select multiple selections, groups and/or assignments that will 
                                         be separated by a comma.`}
                  arrow>
                  <label style={{ color: styling.primaryColor }} className='resize-none font-bold text-[13px] p-0 m-0 pr-1 mt-[10px]'>
                    {props.id}
                  </label>
                </Tooltip>
                <IconButton sx={{ marginTop: "-8px", margin: 0, padding: 0 }} onClick={handleDeleteSelectableGroup} variant='contained'>
                  <Tooltip title={"Delete Complex Selectable"} id={elementUUID + "deleteTooltip"}>
                    <DeleteForeverRoundedIcon htmlColor={styling.primaryColor} sx={icons.small} />
                  </Tooltip>
                </IconButton>
              </div>
              <ToggleSwitch
                title={"Preview"}
                isToggled={previewToggle}
                isSfrWorksheetToggle={false}
                handleUpdateToggle={handleSetPreviewToggle}
                styling={styling}
                tooltip={
                  <div>
                    Toggling this allows a user to see what the fully constructed complex selectable will look like when exported. Use this to see what the
                    selection below will look like.
                    <br />
                    <br />* Note: Results may vary
                  </div>
                }
                tooltipId={elementUUID + "previewToggleTooltip"}
              />
            </span>
          </div>
        }
        body={
          <div>
            {!previewToggle ? (
              <div className='mt-[-8px]'>
                <span className='flex justify-end mb-2 mr-[-8px]'>
                  <Stack direction='row' component='label' alignItems='center' justifyContent='center' sx={{ paddingRight: "4px" }}>
                    <Typography noWrap style={styling.secondaryToggleTypography}>
                      Not Selectable
                    </Typography>
                    <Tooltip title={"Selections that must be viewable, but not selectable."} arrow id={elementUUID + "NotSelectableCheckboxTooltip"}>
                      <Checkbox
                        sx={styling.secondaryCheckboxNoPad}
                        size={"small"}
                        onChange={handleNotSelectableCheckbox}
                        checked={currentSelectable.notSelectable}
                      />
                    </Tooltip>
                  </Stack>
                  <Stack direction='row' component='label' alignItems='center' justifyContent='center'>
                    <Typography noWrap style={styling.secondaryToggleTypography}>
                      Exclusive
                    </Typography>
                    <Tooltip title={"Selections that when selected, exclude all other selections."} arrow id={elementUUID + "ExclusiveCheckboxTooltip"}>
                      <Checkbox sx={styling.secondaryCheckboxNoPad} size={"small"} onChange={handleExclusiveCheckbox} checked={currentSelectable.exclusive} />
                    </Tooltip>
                  </Stack>
                </span>
                {currentSelectable && currentSelectable.description && currentSelectable.description.length > 0 && (
                  <div className={"mb-2"} key={props.id + "complexSelectableDescription"}>
                    {currentSelectable.description.map((value, index) => {
                      if (value.hasOwnProperty("text")) {
                        return showTextContent(value, index);
                      } else if (value.hasOwnProperty("groups")) {
                        return showSelectablesContent(value, index);
                      }
                    })}
                  </div>
                )}
                <div className='border-t-2 border-gray-200 m-0 p-0 pt-4 mx-[-16px]'>
                  <div className='px-4 pt-0 pb-2'>
                    <span className='min-w-full inline-flex items-baseline'>
                      <div className='w-[94%]'>
                        <FormControl fullWidth color={styling.primaryTextField}>
                          <InputLabel key='type-label'>Type</InputLabel>
                          <Select value={complexSelectableType} label='Type' autoWidth onChange={handleSetComplexSelectableType} sx={{ textAlign: "left" }}>
                            <MenuItem sx={styling.secondaryMenu} key={"Selectables"} value={"Selectables"}>
                              Selectables
                            </MenuItem>
                            <MenuItem sx={styling.secondaryMenu} key={"Text"} value={"Text"}>
                              Text
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                      <div className='w-[6%]'>
                        <IconButton sx={{ marginBottom: "-36px" }} onClick={handleNewComplexSelectableSubmit}>
                          <Tooltip title={"Add Selectable Item"} id={"addComplexSelectableItemTooltip"}>
                            <AddCircleIcon htmlColor={styling.primaryColor} sx={icons.medium} />
                          </Tooltip>
                        </IconButton>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>{getPreview}</div>
            )}
          </div>
        }
      />
    </div>
  );
}

// Export SfrComplexSelectableCard.jsx
export default SfrComplexSelectableCard;
