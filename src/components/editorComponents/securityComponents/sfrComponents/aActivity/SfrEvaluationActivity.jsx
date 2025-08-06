// Imports
import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  clearEvaluationActivityStorage,
  handleSnackBarError,
  handleSnackBarSuccess,
  updateEvaluationActivities,
  updateEvaluationActivitiesUI,
} from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import SfrNoTestToggle from "./SfrNoTestToggle.jsx";
import SfrEvaluationActivitySection from "./SfrEvaluationActivitySection.jsx";

/**
 * The SfrEvaluationActivity class that displays the evaluation activities for specified components/elements
 * @param isManagementFunction the is management function (boolean)
 * @returns {JSX.Element} the generic modal content
 * @constructor passes in props to the class
 */
function SfrEvaluationActivity({ isManagementFunction }) {
  // Prop Validation
  SfrEvaluationActivity.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
  };
  // Constants
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const { componentUUID, activities, evaluationActivitiesUI, elementMaps } = useSelector((state) => state.sfrWorksheetUI);
  const { selectedUUID, newSelectedEvaluationActivity, evaluationActivityDropdown, newEvaluationActivityDropdown, selectedEvaluationActivity } =
    evaluationActivitiesUI;
  const [open, setOpen] = useState(true);

  // Methods
  /**
   * Handles open
   */
  const handleSetOpen = () => {
    setOpen(!open);
  };
  /**
   * Handles the select evaluation activity
   * @param title the title
   * @param selections the selections
   */
  const handleSelectEvaluationActivity = (title, selections) => {
    if (selections) {
      let updateMap = {
        selectedEvaluationActivity: selections,
        selectedUUID: "",
      };
      const isComponentName =
        elementMaps &&
        elementMaps.hasOwnProperty("componentName") &&
        elementMaps.hasOwnProperty("componentUUID") &&
        elementMaps.componentName === selections[0];
      const isElementNameMap = elementMaps && elementMaps.hasOwnProperty("elementNameMap") && elementMaps.elementNameMap.hasOwnProperty(selections[0]);

      if (isComponentName) {
        updateMap.selectedUUID = elementMaps.componentUUID;
      } else if (isElementNameMap) {
        updateMap.selectedUUID = elementMaps.elementNameMap[selections[0]];
      }

      // Update the evaluation activities ui
      updateEvaluationActivitiesUI(updateMap);
    }
  };
  /**
   * Handles a newly selected evaluation activity
   * @param title the title
   * @param selections the selections
   */
  const handleNewSelectedEvaluationActivity = (title, selections) => {
    if (selections && JSON.stringify(newSelectedEvaluationActivity) !== JSON.stringify(selections)) {
      updateEvaluationActivitiesUI({
        newSelectedEvaluationActivity: selections,
      });
    }
  };
  /**
   * Handles submit for adding a new evaluation activity
   */
  const handleSubmitNewEvaluationActivities = () => {
    if (newSelectedEvaluationActivity && newSelectedEvaluationActivity.length > 0) {
      const activitiesCopy = deepCopy(activities);

      if (newSelectedEvaluationActivity && newSelectedEvaluationActivity.length > 0 && evaluationActivityDropdown && elementMaps) {
        newSelectedEvaluationActivity.forEach((name) => {
          let uuid;

          if (elementMaps.hasOwnProperty("componentName") && elementMaps.componentName === name && !evaluationActivityDropdown.Component.includes(name)) {
            uuid = elementMaps.componentUUID;
          } else if (
            elementMaps.hasOwnProperty("elementNameMap") &&
            elementMaps.elementNameMap.hasOwnProperty(name) &&
            !evaluationActivityDropdown.Elements.includes(name)
          ) {
            uuid = elementMaps.elementNameMap[name];
          }

          if (uuid && !activitiesCopy.hasOwnProperty(uuid)) {
            activitiesCopy[uuid] = {
              isNoTest: false,
              noTest: "",
              introduction: "",
              tss: "",
              guidance: "",
              testIntroduction: "",
              testClosing: "",
              testLists: {},
              tests: {},
            };
          }
        });

        // Update selected evaluation activity
        setSelectedEvaluationActivity(activitiesCopy, newSelectedEvaluationActivity, "New Evaluation Activity Successfully Added");
      }
    }
  };
  /**
   * Handles deleting an evaluation activity
   */
  const handleDeleteEvaluationActivity = () => {
    const activitiesCopy = deepCopy(activities);

    if (selectedUUID) {
      if (selectedUUID && activitiesCopy.hasOwnProperty(selectedUUID)) {
        delete activitiesCopy[selectedUUID];

        // Update evaluation activity
        const componentsDropdown = deepCopy(evaluationActivityDropdown.Component);
        const elementDropdown = deepCopy(evaluationActivityDropdown.Elements);
        const newDropdownOptions = [...componentsDropdown, ...elementDropdown];

        // Update selected evaluation activity
        setSelectedEvaluationActivity(activitiesCopy, newDropdownOptions, "Evaluation Activity Successfully Removed");
      }
    }
  };

  // Helper Methods
  /**
   * Updates the selected value for the current evaluation activity
   * @param activitiesCopy the activities copy
   * @param dropdownSelections the dropdown selections
   * @param updateSnackBarMessage the update snack bar message
   */
  const setSelectedEvaluationActivity = (activitiesCopy, dropdownSelections, updateSnackBarMessage) => {
    try {
      // Find the selected values
      const { newUUID, selected } = getUpdatedSelectedValues(activitiesCopy, dropdownSelections);

      // Update evaluation activities ui
      updateEvaluationActivitiesUI({
        selectedUUID: newUUID,
        selectedEvaluationActivity: selected && selected.length > 0 && selected[0] ? [selected[0]] : [],
        newSelectedEvaluationActivity: [],
      });

      // Update the evaluation activities for the component
      updateEvaluationActivities(activitiesCopy);

      // Update snackbar
      handleSnackBarSuccess(updateSnackBarMessage);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
      clearEvaluationActivityStorage();
    }
  };
  /**
   * Gets the updated selected values for the main dropdown
   * @param activitiesCopy the activities copy
   * @param options the options
   * @returns {{newUUID: string, selected: *[]}}
   */
  const getUpdatedSelectedValues = (activitiesCopy, options) => {
    const activitiesKeys = Object.keys(activitiesCopy);
    const componentName = elementMaps.componentName;
    const componentUUID = elementMaps.componentUUID;
    const elementNameMap = deepCopy(elementMaps.elementNameMap);
    let newUUID = "";
    let selected = [];

    if (options.length > 0) {
      // Select component, otherwise select element
      if (options.includes(componentName) && activitiesKeys.includes(componentUUID)) {
        newUUID = componentUUID;
        selected = [componentName];
      } else {
        for (const name of options) {
          if (elementNameMap.hasOwnProperty(name)) {
            const uuid = elementNameMap[name];

            if (activitiesKeys.includes(uuid)) {
              newUUID = uuid;
              selected = [name];
              break;
            }
          }
        }
      }
    }

    return {
      newUUID,
      selected,
    };
  };

  // Return Method
  return (
    <div className={isManagementFunction ? "w-full px-4 pt-2" : ""}>
      <CardTemplate
        type={"parent"}
        title={"Evaluation Activities"}
        tooltip={`Evaluation Activities ${isManagementFunction ? "for Management Function" : ""}`}
        collapse={open}
        collapseHandler={handleSetOpen}
        borderColor={isManagementFunction ? "border-gray-200" : null}
        header={
          isManagementFunction && (
            <span className='flex justify-stretch min-w-full'>
              <div className='flex justify-left text-center w-full'>
                <label className='resize-none justify-start flex font-bold text-[14px] p-0 pr-4 text-secondary'>Evaluation Activities</label>
              </div>
              {open && (
                <div className='flex justify-end text-center w-[10%]'>
                  <SfrNoTestToggle isManagementFunction={isManagementFunction} />
                </div>
              )}
            </span>
          )
        }
        body={
          isManagementFunction ? (
            <SfrEvaluationActivitySection isManagementFunction={isManagementFunction} />
          ) : (
            <div className='mb-2'>
              <div className='mt-4 px-4 w-full'>
                <span className='flex justify-stretch min-w-full'>
                  <div className='flex justify-center w-full'>
                    <div className='w-full'>
                      <MultiSelectDropdown
                        selectId='eval_act_select'
                        selectionOptions={evaluationActivityDropdown}
                        selections={selectedEvaluationActivity}
                        title={"Evaluation Activity"}
                        handleSelections={handleSelectEvaluationActivity}
                        multiple={false}
                      />
                    </div>
                    {selectedUUID && <SfrNoTestToggle isManagementFunction={isManagementFunction} />}
                    <IconButton
                      key={"DeleteEvaluationActivityButton"}
                      disabled={selectedEvaluationActivity && selectedEvaluationActivity.length > 0 ? false : true}
                      onClick={handleDeleteEvaluationActivity}
                      variant='contained'>
                      <Tooltip title={"Delete Evaluation Activity"} id={componentUUID + "DeleteEvaluationActivityTooltip"}>
                        <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                      </Tooltip>
                    </IconButton>
                  </div>
                </span>
              </div>
              {selectedEvaluationActivity && selectedEvaluationActivity.length > 0 && (
                <SfrEvaluationActivitySection isManagementFunction={isManagementFunction} />
              )}
            </div>
          )
        }
        footer={
          !isManagementFunction && (
            <div className='min-w-full flex justify-center p-0 py-1 rounded-b-lg border-t-2 border-gray-200 bg-white' key={"NewEvaluationActivityFooter"}>
              <div className='p-3 px-4 w-full'>
                <span className='w-full inline-flex items-baseline'>
                  <div className='w-[96%]'>
                    <MultiSelectDropdown
                      selectId='new_eval_act_select'
                      selectionOptions={newEvaluationActivityDropdown}
                      selections={newSelectedEvaluationActivity}
                      title={"Evaluation Activities"}
                      handleSelections={handleNewSelectedEvaluationActivity}
                      style={"primary"}
                    />
                  </div>
                  <div className='w-[4%]'>
                    <IconButton
                      sx={{ marginBottom: "-32px" }}
                      key={"NewEvaluationActivitiesButton"}
                      disabled={newSelectedEvaluationActivity && newSelectedEvaluationActivity.length > 0 ? false : true}
                      onClick={handleSubmitNewEvaluationActivities}
                      variant='contained'>
                      <Tooltip title={"Add New Evaluation Activities"} id={componentUUID + "addNewEvaluationActivityTooltip"}>
                        <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
                      </Tooltip>
                    </IconButton>
                  </div>
                </span>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}

// Export SfrEvaluationActivity.jsx
export default SfrEvaluationActivity;
