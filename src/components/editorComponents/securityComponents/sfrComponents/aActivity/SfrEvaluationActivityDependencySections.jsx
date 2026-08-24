import PropTypes from "prop-types";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import store from "../../../../../app/store.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { handleSnackBarError, updateEvaluationActivities, updateManagementFunctionItems } from "../../../../../utils/securityComponents.jsx";
import {
  convertDependenciesFromStoredIds,
  convertDependenciesToStoredIds,
  EA_SECTION_DEPENDENCY_SECTION_FIELDS,
} from "../../../../../utils/evaluationActivityDependencies.js";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

function SfrEvaluationActivityDependencySections({ isManagementFunction, sectionType, dependencyMenuOptions }) {
  SfrEvaluationActivityDependencySections.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
    sectionType: PropTypes.oneOf(["tss", "guidance"]).isRequired,
    dependencyMenuOptions: PropTypes.object.isRequired,
  };

  const { element, activities, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { icons, primary, secondary } = useSelector((state) => state.styling);
  const { managementFunctions } = element;
  const { dependencyMap, selectedUUID } = evaluationActivitiesUI;
  const { activity, rowIndex } = managementFunctionUI;
  const sectionField = EA_SECTION_DEPENDENCY_SECTION_FIELDS[sectionType];
  const activityData = isManagementFunction ? activity : activities?.[selectedUUID];
  const dependencySections = useMemo(() => {
    return Array.isArray(activityData?.[sectionField]) ? activityData[sectionField] : [];
  }, [activityData, sectionField]);
  const hasOptions = Object.values(dependencyMenuOptions || {}).some((options) => Array.isArray(options) && options.length > 0);

  if (!hasOptions) {
    return null;
  }

  const updateSections = (updatedSections) => {
    if (isManagementFunction) {
      const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
      const activityCopy = latestActivity ? deepCopy(latestActivity) : {};
      activityCopy[sectionField] = updatedSections;

      updateManagementFunctionItems(
        {
          value: activityCopy,
          rowIndex,
          type: "evaluationActivity",
        },
        managementFunctions,
        true
      );
      return;
    }

    if (!selectedUUID || !activities?.hasOwnProperty(selectedUUID)) return;

    const latestActivities = store.getState().sfrWorksheetUI.activities;
    const activitiesCopy = latestActivities ? deepCopy(latestActivities) : {};

    if (activitiesCopy[selectedUUID]) {
      activitiesCopy[selectedUUID][sectionField] = updatedSections;
      updateEvaluationActivities(activitiesCopy);
    }
  };

  const getValidSelections = (selections) => {
    const selectionList = (Array.isArray(selections) ? selections : [selections]).filter(Boolean).slice(-1);
    const menuProperties = ["Platforms", "Selectables", "ComplexSelectablesEA"];
    const validSelections = [];

    selectionList.forEach((selection) => {
      menuProperties.forEach((menuProperty) => {
        if (
          dependencyMenuOptions.hasOwnProperty(menuProperty) &&
          dependencyMenuOptions[menuProperty].includes(selection) &&
          !validSelections.includes(selection)
        ) {
          validSelections.push(selection);
        }
      });
    });

    return validSelections;
  };

  const handleDependencySelect = (...args) => {
    try {
      const selections = args[1];
      const index = args[2];
      const updatedSections = deepCopy(dependencySections);
      const validSelections = getValidSelections(selections);
      updatedSections[index] = {
        dependencies: convertDependenciesToStoredIds(validSelections, dependencyMap),
        text: updatedSections[index]?.text || "",
      };

      updateSections(updatedSections);
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };

  const handleTextUpdate = (...args) => {
    try {
      const value = args[0];
      const index = args[2];
      const updatedSections = deepCopy(dependencySections);
      updatedSections[index] = {
        dependencies: Array.isArray(updatedSections[index]?.dependencies) ? updatedSections[index].dependencies : [],
        text: value,
      };

      updateSections(updatedSections);
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };

  const handleAddSection = () => {
    try {
      updateSections([...dependencySections, { dependencies: [], text: "" }]);
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };

  const handleDeleteSection = (index) => {
    try {
      const updatedSections = dependencySections.filter((_, sectionIndex) => sectionIndex !== index);
      updateSections(updatedSections);
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };

  return (
    <div className='w-full pt-2'>
      {dependencySections.map((dependencySection, index) => (
        <div className='mb-4 rounded-md border border-gray-200 bg-white p-3' key={`${sectionField}-${index}`}>
          <div className='flex w-full items-center gap-2 pb-3'>
            <MultiSelectDropdown
              selectId={`${sectionField}-${index}`}
              selectionOptions={dependencyMenuOptions}
              selections={convertDependenciesFromStoredIds(dependencySection.dependencies || [], dependencyMap, dependencyMenuOptions)}
              title={"Dependencies"}
              handleSelections={handleDependencySelect}
              multiple={false}
              index={index}
              style={"primary"}
            />
            <IconButton onClick={() => handleDeleteSection(index)} variant='contained'>
              <Tooltip title={"Delete Dependency Section"} id={`${sectionField}-${index}-delete-tooltip`}>
                <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.medium} />
              </Tooltip>
            </IconButton>
          </div>
          <TipTapEditor
            contentType={"term"}
            title={`${sectionField}-${index}`}
            handleTextUpdate={handleTextUpdate}
            index={index}
            text={dependencySection.text || ""}
            uuid={`${isManagementFunction ? "management-function" : selectedUUID}-${sectionField}-${index}`}
          />
        </div>
      ))}
      <div className='flex justify-start pb-2'>
        <Button
          color='secondary'
          size='small'
          startIcon={<AddCircleRoundedIcon htmlColor={primary} sx={icons.small} />}
          onClick={handleAddSection}
          variant='text'>
          Add Dependency Section
        </Button>
      </div>
    </div>
  );
}

export default SfrEvaluationActivityDependencySections;
