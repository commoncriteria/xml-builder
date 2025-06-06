// Imports
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { CREATE_SFR_SECTION_ELEMENT, DELETE_SFR_SECTION_ELEMENT } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { RESET_SFR_ELEMENT_UI } from "../../../../../reducers/SFRs/sfrWorksheetUI.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  getFormattedXmlID,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  setSfrWorksheetUIItems,
  updateSfrSectionElement,
} from "../../../../../utils/securityComponents.jsx";
import ApplicationNote from "./ApplicationNote.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import ManagementFunctionTable from "./managementFunctionTable/ManagementFunctionTable.jsx";
import SfrCheckBox from "../SfrCheckBox.jsx";
import SfrRequirements from "./requirements/SfrRequirements.jsx";

/**
 * The SfrElement class that displays the data for the sfr element
 * @returns {JSX.Element}   the sfr element card content
 */
function SfrElement() {
  // Constants
  const dispatch = useDispatch();
  const { sfrWorksheetUI } = useSelector((state) => state);
  const {
    sfrUUID,
    componentUUID,
    elementUUID,
    component,
    element,
    selectedSfrElement,
    openSfrElement,
    elementXmlId,
    deletedElement,
    newElementUUID,
    elementMaps,
  } = sfrWorksheetUI;
  const { isManagementFunction } = element;
  const { secondary, primary, icons } = useSelector((state) => state.styling);

  // Use Effects
  useEffect(() => {
    // Update element dropdown value to use the newly created element
    if (newElementUUID && newElementUUID !== "" && elementMaps.elementUUIDMap.hasOwnProperty(newElementUUID)) {
      updatedSelectedSfrDropdownValue(newElementUUID);
    }

    // Update element to select an available dropdown value on delete
    if (deletedElement) {
      // Update element to select an available dropdown value on delete
      updatedSelectedSfrDropdownValue();
    }
  }, [elementMaps]);

  // Methods
  /**
   * Handles the selected element
   * @param event the selected sfr element
   */
  const handleSelectedElement = (event) => {
    const selectedElement = event.toUpperCase();

    if (JSON.stringify(selectedElement) !== JSON.stringify(selectedSfrElement)) {
      const { elementUUID, element } = deepCopy(getElementValues(selectedElement));

      // Update sfr worksheet ui items
      setSfrWorksheetUIItems({
        selectedSfrElement: selectedElement,
        elementUUID: elementUUID,
        element: element,
        elementXmlId: element.elementXMLID ? element.elementXMLID : "",
      });
    }
  };
  /**
   * Handles set open sfr element
   */
  const handleSetOpenSfrElement = () => {
    const itemMap = {
      openSfrElement: !openSfrElement,
    };
    setSfrWorksheetUIItems(itemMap);
  };
  /**
   * Handles creating a new element
   */
  const handleCreateNewElement = () => {
    const uuid = dispatch(
      CREATE_SFR_SECTION_ELEMENT({
        sfrUUID: sfrUUID,
        sectionUUID: componentUUID,
      })
    ).payload.uuid;

    // Set new element uuid for sfr worksheet
    setSfrWorksheetUIItems({
      newElementUUID: uuid,
    });
  };
  /**
   * Handles deleting an element
   * @param currentElement the current element to delete
   */
  const handleDeleteElement = (currentElement) => {
    if (currentElement && currentElement !== "" && elementUUID) {
      dispatch(
        DELETE_SFR_SECTION_ELEMENT({
          sfrUUID: sfrUUID,
          sectionUUID: componentUUID,
          elementUUID: elementUUID,
        })
      );

      // Set new element uuid for sfr worksheet
      setSfrWorksheetUIItems({
        deletedElement: true,
      });

      // Update snackbar
      handleSnackBarSuccess("SFR Element Successfully Removed");
    }
  };
  /**
   * Handles updating the element xml id
   * @param event the event
   */
  const handleUpdateElementXmlId = (event) => {
    const xmlId = event.target.value;

    // Replace spaces with hyphens and convert to lowercase
    const formattedValue = getFormattedXmlID(xmlId);

    // Update sfr section element
    updateSfrSectionElement({
      elementXMLID: formattedValue,
    });

    // Update sfr worksheet ui
    if (xmlId || xmlId === "") {
      setSfrWorksheetUIItems({
        elementXmlId: formattedValue,
      });
    }
  };

  // Helper Methods
  /**
   * Updates the selected sfr dropdown value
   * @param elementUUID the element uuid (optional)
   */
  const updatedSelectedSfrDropdownValue = (elementUUID = null) => {
    try {
      const { elementNames, elementUUIDMap } = elementMaps;
      const notEmpty = elementNames && elementNames.length > 0 && elementUUIDMap && Object.keys(elementUUIDMap).length > 0;

      // Check if the element maps are valid
      if (notEmpty) {
        const isElementUUID = elementUUID && elementUUID !== "" && elementUUIDMap.hasOwnProperty(elementUUID);
        const newSelected = isElementUUID ? elementUUIDMap[elementUUID] : elementNames[0];

        // Update selected element
        handleSelectedElement(newSelected);
      }

      // Reset updated element values
      setSfrWorksheetUIItems({
        newElementUUID: null,
        deletedElement: false,
      });
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);

      // Reset the sfr element ui
      dispatch(
        RESET_SFR_ELEMENT_UI({
          allValues: true,
        })
      );
    }
  };
  /**
   * Gets the element values
   * @param selectedElement the selected sfr element
   * @returns {*|{}|boolean|[]|*[]|string|string[]}
   */
  const getElementValues = (selectedElement) => {
    let elementUUID = "";
    let element = {};
    const { elements } = component;
    const isElementMapValid =
      elementMaps && elementMaps.hasOwnProperty("elementNames") && elementMaps.elementNames.length > 0 && elementMaps.elementNames.includes(selectedElement);

    // Get the requested value by type
    if (selectedElement && isElementMapValid) {
      // Get the element uuid
      elementUUID = elementMaps.elementNameMap[selectedElement];

      // Get the current element
      if (elements && elements.hasOwnProperty(elementUUID)) {
        element = deepCopy(elements[elementUUID]);
      }
    }

    // Return the element values
    return {
      elementUUID,
      element,
    };
  };

  // Return Method
  return (
    <CardTemplate
      type={"parent"}
      title={"SFR Element"}
      tooltip={"SFR Element"}
      collapse={openSfrElement}
      collapseHandler={handleSetOpenSfrElement}
      body={
        <div className='min-w-full mt-4 grid grid-flow-row auto-rows-max'>
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-3 gap-4 p-2 px-4'>
            <FormControl fullWidth>
              <Tooltip
                id={"selectElementTooltip"}
                title={`This dropdown list allows a user to select between any of the 
                                     previously created SFR elements attached to this component. 
                                     New elements can be created by clicking the green "plus" symbol 
                                     at the bottom of this section.`}
                arrow>
                <InputLabel key='element-select-label'>Select Element</InputLabel>
              </Tooltip>
              <Select
                value={selectedSfrElement}
                label='Select Element'
                autoWidth
                onChange={(event) => handleSelectedElement(event.target.value)}
                sx={{ textAlign: "left" }}>
                {elementMaps.elementNames?.map((name, index) => {
                  return (
                    <MenuItem key={index} value={name}>
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {selectedSfrElement && selectedSfrElement !== "" && (
              <span className='flex justify-stretch min-w-full'>
                <div className='flex justify-center w-full'>
                  <div className='w-full pr-4'>
                    <FormControl fullWidth>
                      <Tooltip
                        id={"elementXmlIdTooltip"}
                        title={`Every <f-element> must have an id attribute that 
                                                        is unique to the document.`}
                        arrow>
                        <TextField
                          className='w-full'
                          key={`${elementXmlId}-element-xml-id`}
                          label='XML ID'
                          defaultValue={elementXmlId}
                          onBlur={(event) => {
                            handleSnackbarTextUpdates(handleUpdateElementXmlId, event);
                          }}
                        />
                      </Tooltip>
                    </FormControl>
                  </div>
                  <div className='w-full pr-2'>
                    <Tooltip
                      id={"componentIDTooltip"}
                      title={`This is an automatically generated ID that is defined by the component id and the number of the element added.`}
                      arrow>
                      <TextField
                        className='w-full'
                        key={`${elementMaps.componentName}-component-id`}
                        label='Component ID'
                        disabled={true}
                        defaultValue={elementMaps.componentName}
                      />
                    </Tooltip>
                  </div>
                  <div className={`w-[80%] ml-2 pr-2 pt-1 border-[1px] border-[#bdbdbd] rounded-[4px]`}>
                    <SfrCheckBox
                      title={"Management Functions"}
                      isChecked={isManagementFunction !== undefined ? isManagementFunction : false}
                      tooltipID={"managementFunctionCheckbox"}
                      tooltip={`Select if this SFR Element contains a Management Function Table`}
                      isDisabled={selectedSfrElement.toLowerCase().includes("fmt") ? false : true}
                    />
                  </div>
                  <IconButton
                    onClick={() => {
                      handleDeleteElement(selectedSfrElement);
                    }}
                    variant='contained'>
                    <Tooltip title={`Delete Element`} id={"deleteElementTooltip"}>
                      <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                    </Tooltip>
                  </IconButton>
                </div>
              </span>
            )}
          </div>
          {selectedSfrElement && selectedSfrElement !== "" && (
            <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
              <SfrRequirements requirementType={"title"} />
              {isManagementFunction && <ManagementFunctionTable />}
              <ApplicationNote isManagementFunction={false} />
            </div>
          )}
        </div>
      }
      footer={
        <div className='w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white' key={componentUUID + "-NewFormItem"}>
          <IconButton key={componentUUID + "-CreateNewElement"} onClick={handleCreateNewElement} variant='contained'>
            <Tooltip title={"Create New Element"} id={"createNewElementTooltip"}>
              <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
            </Tooltip>
          </IconButton>
        </div>
      }
    />
  );
}

// Export SfrElement.jsx
export default SfrElement;
