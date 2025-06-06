// Imports
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { CREATE_SAR_ELEMENT, DELETE_SAR_ELEMENT, UPDATE_SAR_COMPONENT_ITEMS, UPDATE_SAR_ELEMENT } from "../../../../reducers/sarsSlice.js";
import { handleSnackBarSuccess, handleSnackbarTextUpdates } from "../../../../utils/securityComponents.jsx";
import CardTemplate from "../CardTemplate.jsx";
import Modal from "../../../modalComponents/Modal.jsx";
import TipTapEditor from "../../TipTapEditor.jsx";

/**
 * The SarWorksheet class that displays the data for the sar worksheet as a modal
 * @returns {JSX.Element}   the sar worksheet modal content
 * @constructor             passes in props to the class
 */
function SarWorksheet(props) {
  // Prop Validation
  SarWorksheet.propTypes = {
    sarUUID: PropTypes.string.isRequired,
    componentUUID: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const sarElements = useSelector((state) => state.sars.elements);
  const { primary, secondary, primaryMenu, checkboxSecondary, secondaryToggleTypography, icons } = useSelector((state) => state.styling);

  // The element values
  const [elementMenuOptions, setElementMenuOptions] = useState([]);
  const [selectedElementUUID, setSelectedElementUUID] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [aactivity, setAactivity] = useState("");

  // The element type
  const [selectedElementType, setSelectedElementType] = useState("");
  const [selectedNewElementType, setSelectedNewElementType] = useState("");
  const elementTypeMenuOptions = [
    { key: "C", value: "Content and Presentation" },
    { key: "D", value: "Developer Action" },
    { key: "E", value: "Evaluator Action" },
  ];

  // Collapse card values
  const [openSarComponent, setOpenSarComponent] = useState(true);
  const [openSarElement, setOpenSarElement] = useState(true);

  // Use Effects
  useEffect(() => {
    // Update element dropdown
    updateElementDropdown();

    // Update element items
    updateElementItems(selectedElementUUID);

    // Update new selected element type
    setSelectedNewElementType("");
  }, [props]);
  useEffect(() => {
    // Update element items
    updateElementItems(selectedElementUUID);
  }, [selectedElementUUID]);
  useEffect(() => {
    // Update element dropdown
    updateElementDropdown();
  }, [selectedElementType]);

  // Handle Methods
  /**
   * Handles opening the sar component
   */
  const handleSetOpenSarComponent = () => {
    setOpenSarComponent(!openSarComponent);
  };
  /**
   * Handles the selected element
   * @param event the event
   */
  const handleSelectedElement = (event) => {
    setSelectedElementUUID(event.target.value);
  };
  /**
   * Handles selected sar type
   * @param event the event
   */
  const handleSelectedSarType = (event) => {
    const elementUUID = selectedElementUUID;

    if (elementUUID && elementUUID !== "" && sarElements.hasOwnProperty(elementUUID)) {
      const key = event.target.value;
      const selectedKey = key === "C" || key === "D" || key === "E" ? key : "";
      updateElementHelper({ type: selectedKey });
      setSelectedElementType(selectedKey);
    } else {
      setSelectedElementType("");
    }
  };
  /**
   * Handles the new selected element type
   * @param event
   */
  const handleSelectedNewElementType = (event) => {
    setSelectedNewElementType(event.target.value);
  };
  /**
   * Handles opening the sar element
   */
  const handleSetOpenSarElement = () => {
    setOpenSarElement(!openSarElement);
  };
  /**
   * Handles creating the new element
   */
  const handleCreateNewElement = () => {
    const isValid = isNewTypeSelected();

    if (!isValid) {
      // Get the element type
      const type = selectedNewElementType === "C" || selectedNewElementType === "D" || selectedNewElementType === "E" ? selectedNewElementType : "C";
      let element = { type: type };
      let elementUUID = dispatch(CREATE_SAR_ELEMENT({ componentUUID: props.componentUUID, element: element })).payload;
      if (elementUUID && elementUUID !== "") {
        setSelectedElementUUID(elementUUID);
      } else {
        setSelectedElementUUID("");
        setSelectedElementType("");
      }

      // Update dropdowns
      setSelectedNewElementType("");

      // Update snackbar
      handleSnackBarSuccess("New SAR Element Successfully Added");
    }
  };
  /**
   * Handles deleting the element
   */
  const handleDeleteElement = () => {
    const elementUUID = selectedElementUUID;

    if (elementUUID && elementUUID !== "" && sarElements.hasOwnProperty(elementUUID)) {
      dispatch(DELETE_SAR_ELEMENT({ componentUUID: props.componentUUID, elementUUID: elementUUID }));
      setSelectedElementUUID("");
      setSelectedElementType("");
      setSelectedNewElementType("");

      // Update snackbar
      handleSnackBarSuccess("SAR Element Successfully Deleted");
    }
  };

  // Update Methods
  /**
   * Updates the name
   * @param event the event
   */
  const updateName = (event) => {
    updateComponentHelper(props.componentUUID, { name: event.target.value });
  };
  /**
   * Updates optional
   * @param event the event
   */
  const updateOptional = (event) => {
    updateComponentHelper(props.componentUUID, { optional: event.target.checked });
  };
  /**
   * Updates the summary
   * @param event the event
   */
  const updateSummary = (event) => {
    updateComponentHelper(props.componentUUID, { summary: event });
  };
  /**
   * Updates the cc id
   * @param event the event
   */
  const updateCcID = (event) => {
    updateComponentHelper(props.componentUUID, { ccID: event.target.value.toUpperCase() });
    setSelectedNewElementType("");
  };
  /**
   * Updates the element items
   * @param elementUUID the element uuid
   */
  const updateElementItems = (elementUUID) => {
    // Update type
    let currentTypeValue = getElementValuesByType(elementUUID, "type");
    if (JSON.stringify(currentTypeValue) !== JSON.stringify(selectedElementType)) {
      setSelectedElementType(currentTypeValue);
    }

    // Update title
    let currentTitle = getElementValuesByType(elementUUID, "title");
    if (JSON.stringify(currentTitle) !== JSON.stringify(title)) {
      setTitle(currentTitle);
    }

    // Update note
    let currentNote = getElementValuesByType(elementUUID, "note");
    if (JSON.stringify(currentNote) !== JSON.stringify(note)) {
      setNote(currentNote);
    }

    // Update aactivity
    let currentAactivity = getElementValuesByType(elementUUID, "aactivity");
    if (JSON.stringify(currentAactivity) !== JSON.stringify(aactivity)) {
      setAactivity(currentAactivity);
    }
  };
  /**
   * Updates the element dropdown
   */
  const updateElementDropdown = () => {
    const elementMenuItems = getElementMenuItems();

    if (JSON.stringify(elementMenuItems) !== JSON.stringify(elementMenuOptions)) {
      setElementMenuOptions(elementMenuItems);
    }
  };
  /**
   * Updates the title
   * @param event the event
   */
  const updateTitle = (event) => {
    // Update element title
    updateElementHelper({ title: event });

    if (JSON.stringify(title) !== JSON.stringify(event)) {
      setTitle(event);
    }
  };
  /**
   * Updates the application note
   * @param event the event
   */
  const updateApplicationNote = (event) => {
    // Update element application note
    updateElementHelper({ note: event });
    if (JSON.stringify(note) !== JSON.stringify(event)) {
      setNote(event);
    }
  };
  /**
   * Updates the aactivity
   * @param event the event
   */
  const updateAactivity = (event) => {
    // Update element aactivity
    updateElementHelper({ aactivity: event });
    if (JSON.stringify(aactivity) !== JSON.stringify(event)) {
      setAactivity(event);
    }
  };

  // Helper Methods
  /**
   * Is new type selected
   * @returns {boolean}
   */
  const isNewTypeSelected = () => {
    const key = elementTypeMenuOptions.find((option) => option.key === selectedNewElementType);
    return selectedNewElementType && selectedNewElementType !== "" && key ? false : true;
  };
  /**
   * Update component helper
   * @param componentUUID the component uuid
   * @param itemMap the item map
   */
  const updateComponentHelper = (componentUUID, itemMap) => {
    dispatch(
      UPDATE_SAR_COMPONENT_ITEMS({
        componentUUID,
        itemMap,
      })
    );
  };
  /**
   * Update element helper
   * @param itemMap the item map
   */
  const updateElementHelper = (itemMap) => {
    if (selectedElementUUID && selectedElementUUID !== "" && sarElements.hasOwnProperty(selectedElementUUID)) {
      dispatch(
        UPDATE_SAR_ELEMENT({
          elementUUID: selectedElementUUID,
          itemMap,
        })
      );
    }
  };
  /**
   * Gets the element menu items
   * @returns {*[]}
   */
  const getElementMenuItems = () => {
    const uuidArray = props.value.elementIDs;
    let elementMenuItems = [];
    let counters = {
      C: 0,
      D: 0,
      E: 0,
    };

    // Create the dropdown list by type
    uuidArray.forEach((uuid) => {
      if (sarElements.hasOwnProperty(uuid)) {
        const type = sarElements[uuid].type ? sarElements[uuid].type : "C";
        let value = `${props.value.ccID.toUpperCase()}.${++counters[type]} (${type})`;
        let element = { key: uuid, value: value };
        if (!elementMenuItems.includes(element)) {
          elementMenuItems.push(element);
        }
      }
    });

    // Sort the dropdown list
    elementMenuItems.sort((a, b) => a.value.localeCompare(b.value));
    return elementMenuItems;
  };
  /**
   * Gets the element value by type
   * @param currentUUID the current uuid
   * @param type the type
   * @returns {*|string|string}
   */
  const getElementValuesByType = (currentUUID, type) => {
    if (currentUUID && currentUUID !== "" && sarElements.hasOwnProperty(currentUUID)) {
      const element = sarElements[currentUUID];
      return element && element.hasOwnProperty(type) && element[type] ? element[type] : "";
    }

    return "";
  };

  // Use Memos
  /**
   * The summary editor section
   * @type {Element}
   */
  const SummaryEditor = useMemo(() => {
    return (
      <TipTapEditor
        uuid={props.componentUUID}
        text={props.value && props.value.summary ? props.value.summary : ""}
        contentType={"term"}
        handleTextUpdate={updateSummary}
      />
    );
  }, [props.componentUUID, props.value.summary]);
  /**
   * The title editor section
   * @type {Element}
   */
  const TitleEditor = useMemo(() => {
    return <TipTapEditor className='w-full' uuid={props.componentUUID} text={title ? title : ""} contentType={"term"} handleTextUpdate={updateTitle} />;
  }, [props.componentUUID, title]);
  /**
   * The note editor section
   * @type {Element}
   */
  const NoteEditor = useMemo(() => {
    return <TipTapEditor className='w-full' uuid={props.componentUUID} text={note ? note : ""} contentType={"term"} handleTextUpdate={updateApplicationNote} />;
  }, [props.componentUUID, note]);
  /**
   * The aactivity editor section
   * @type {Element}
   */
  const AActivityEditor = useMemo(() => {
    return <TipTapEditor uuid={props.componentUUID} text={aactivity ? aactivity : ""} contentType={"term"} handleTextUpdate={updateAactivity} />;
  }, [props.componentUUID, aactivity]);

  // Return Method
  return (
    <div className='w-screen'>
      <Modal
        title={"SAR Worksheet"}
        content={
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
            <CardTemplate
              type={"parent"}
              title={"SAR Component"}
              tooltip={"SAR Component"}
              collapse={openSarComponent}
              collapseHandler={handleSetOpenSarComponent}
              body={
                <div className='min-w-full mt-4 justify-items-left grid grid-flow-row auto-rows-max'>
                  <div
                    className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-3 gap-4 p-2 pl-4 pr-2.5'
                    style={{ gridTemplateColumns: "1fr 1fr 80px" }}>
                    <FormControl fullWidth>
                      <Tooltip arrow id={"ccIDTooltip"} title={"Full ID of the SAR Component."}>
                        <TextField
                          key={props.value.ccID}
                          label='CC-ID'
                          onBlur={(event) => handleSnackbarTextUpdates(updateCcID, event)}
                          defaultValue={props.value.ccID}
                        />
                      </Tooltip>
                    </FormControl>
                    <FormControl fullWidth>
                      <Tooltip arrow title={"Full name of the component."} id={"nameTooltip"}>
                        <TextField
                          key={props.value.name}
                          label='Name'
                          onBlur={(event) => handleSnackbarTextUpdates(updateName, event)}
                          defaultValue={props.value.name}
                        />
                      </Tooltip>
                    </FormControl>
                    <Stack direction='row' component='label' alignItems='center' justifyContent='right'>
                      <Typography noWrap style={secondaryToggleTypography}>
                        Optional
                      </Typography>
                      <Checkbox sx={checkboxSecondary} size={"small"} onChange={updateOptional} checked={props.value.optional ? props.value.optional : false} />
                    </Stack>
                  </div>
                  <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
                    <CardTemplate
                      type={"section"}
                      header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Summary</label>}
                      body={SummaryEditor}
                    />
                  </div>
                </div>
              }
            />
            <CardTemplate
              type={"parent"}
              title={"SAR Element"}
              tooltip={"SAR Element"}
              collapse={openSarElement}
              collapseHandler={handleSetOpenSarElement}
              body={
                <div className='min-w-full mt-4 grid grid-flow-row auto-rows-max'>
                  <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-3 gap-4 p-2 px-4 pb-0'>
                    <FormControl>
                      <Tooltip
                        id={"selectElementTooltip"}
                        title={`This dropdown list allows a user to select between any of the previously 
                                                     created SFR elements attached to this component. New elements can be 
                                                     created by clicking the green "plus" symbol at the bottom of this section.`}
                        arrow>
                        <InputLabel key='element-select-label'>Select Element</InputLabel>
                      </Tooltip>
                      <Select value={selectedElementUUID} label='Select Element' autoWidth onChange={handleSelectedElement} sx={{ textAlign: "left" }}>
                        {elementMenuOptions.map((option) => (
                          <MenuItem key={option.key} value={option.key}>
                            {option.value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {selectedElementUUID && selectedElementUUID !== "" && (
                      <FormControl>
                        <Tooltip id={"selectTypeElementTooltip"} title={`This dropdown list allows a user to select between any of the SAR types.`} arrow>
                          <InputLabel key='element-select-type-label'>Select Element Type</InputLabel>
                        </Tooltip>
                        <Select value={selectedElementType} label='Select Element Type' autoWidth onChange={handleSelectedSarType} sx={{ textAlign: "left" }}>
                          {elementTypeMenuOptions.map((option) => (
                            <MenuItem key={option.key} value={option.key}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {selectedElementUUID && selectedElementUUID !== "" && (
                      <div>
                        <span className='flex justify-stretch min-w-full'>
                          <div className='flex justify-center w-full'>
                            <div className='w-full pr-2'>
                              <Tooltip
                                id={"componentIDTooltip"}
                                title={`This is an automatically generated ID that is defined 
                                                                     by the component id and the number of the element added.`}
                                arrow>
                                <TextField
                                  className='w-full'
                                  key={`${props.componentUUID}-sar-element-id`}
                                  label='Component ID'
                                  disabled={true}
                                  value={selectedElementUUID && selectedElementUUID !== "" ? props.value.ccID.toUpperCase() : ""}
                                />
                              </Tooltip>
                            </div>
                            <IconButton onClick={handleDeleteElement} variant='contained'>
                              <Tooltip title={`Delete Element`} id={"deleteElementTooltip"}>
                                <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                              </Tooltip>
                            </IconButton>
                          </div>
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedElementUUID && selectedElementUUID !== "" && (
                    <div className='min-w-full justify-items-left grid grid-flow-row auto-rows-max'>
                      <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg pb-2 pl-4 pr-6'>
                        <div className='min-w-full mt-4 justify-items-left grid grid-flow-row auto-rows-max mx-[-16px]'>
                          <CardTemplate
                            className={"w-full"}
                            type={"section"}
                            header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Title</label>}
                            body={TitleEditor}
                          />
                          <CardTemplate
                            className={"w-full"}
                            type={"section"}
                            header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Application Note</label>}
                            body={NoteEditor}
                          />
                          <CardTemplate
                            type={"section"}
                            header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Evaluation Activity</label>}
                            body={AActivityEditor}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              }
              footer={
                <div className='w-full flex justify-center p-4 rounded-b-lg border-t-2 border-gray-200 bg-white' key={props.componentUUID + "-NewSarFormItem"}>
                  <span className='min-w-full inline-flex items-baseline'>
                    <FormControl fullWidth color='secondary'>
                      <Tooltip id={"selectNewElementTooltip"} title={"Select Element Type"} arrow>
                        <InputLabel key='element-select-new-type-label'>Select New Element Type</InputLabel>
                      </Tooltip>
                      <Select
                        value={selectedNewElementType}
                        label='Select New Element Type'
                        autoWidth
                        onChange={handleSelectedNewElementType}
                        sx={{ textAlign: "left" }}>
                        {elementTypeMenuOptions.map((option) => (
                          <MenuItem sx={primaryMenu} key={option.key} value={option.key}>
                            {option.value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <div className='pl-2'>
                      <IconButton
                        key={props.componentUUID + "-CreateNewSarElement"}
                        onClick={handleCreateNewElement}
                        variant='contained'
                        disabled={isNewTypeSelected()}>
                        <Tooltip title={"Create New Element"} id={"createNewSarElementTooltip"}>
                          <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
                        </Tooltip>
                      </IconButton>
                    </div>
                  </span>
                </div>
              }
            />
          </div>
        }
        open={props.open}
        handleOpen={props.handleOpen}
        hideSubmit={true}
      />
    </div>
  );
}

// Export SarWorksheet.jsx
export default SarWorksheet;
