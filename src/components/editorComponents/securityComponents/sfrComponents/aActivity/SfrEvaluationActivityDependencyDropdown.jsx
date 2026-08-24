import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import store from "../../../../../app/store.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { handleSnackBarError, updateEvaluationActivities, updateManagementFunctionItems } from "../../../../../utils/securityComponents.jsx";
import {
  convertDependenciesFromStoredIds,
  convertDependenciesToStoredIds,
  EA_SECTION_DEPENDENCY_FIELDS,
} from "../../../../../utils/evaluationActivityDependencies.js";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";

function SfrEvaluationActivityDependencyDropdown({ isManagementFunction, sectionType, dependencyMenuOptions }) {
  SfrEvaluationActivityDependencyDropdown.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
    sectionType: PropTypes.oneOf(["tss", "guidance"]).isRequired,
    dependencyMenuOptions: PropTypes.object.isRequired,
  };

  const { element, activities, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { managementFunctions } = element;
  const { dependencyMap, selectedUUID } = evaluationActivitiesUI;
  const { activity, rowIndex } = managementFunctionUI;
  const [selected, setSelected] = useState([]);
  const dependencyField = EA_SECTION_DEPENDENCY_FIELDS[sectionType];
  const activityData = isManagementFunction ? activity : activities?.[selectedUUID];

  useEffect(() => {
    const dependencies = activityData?.[dependencyField] || [];
    const dropdownSelections = convertDependenciesFromStoredIds(dependencies, dependencyMap, dependencyMenuOptions);

    if (JSON.stringify(dropdownSelections) !== JSON.stringify(selected)) {
      setSelected(dropdownSelections);
    }
  }, [activityData, dependencyField, dependencyMap, dependencyMenuOptions]);

  const handleSelect = (title, selections) => {
    try {
      const selectionList = (Array.isArray(selections) ? selections : [selections]).filter(Boolean).slice(-1);
      const validSelections = [];
      const menuProperties = ["Platforms", "Selectables", "ComplexSelectablesEA"];

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

      const newDependencies = convertDependenciesToStoredIds(validSelections, dependencyMap);

      if (isManagementFunction) {
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        const activityCopy = deepCopy(latestActivity);

        if (JSON.stringify(activityCopy[dependencyField] || []) !== JSON.stringify(newDependencies)) {
          activityCopy[dependencyField] = newDependencies;
          updateManagementFunctionItems(
            {
              value: activityCopy,
              rowIndex,
              type: "evaluationActivity",
            },
            managementFunctions,
            true
          );
        }
      } else {
        if (!selectedUUID || !activities?.hasOwnProperty(selectedUUID)) return;

        const latestActivities = store.getState().sfrWorksheetUI.activities;
        const activitiesCopy = deepCopy(latestActivities);

        if (activitiesCopy[selectedUUID] && JSON.stringify(activitiesCopy[selectedUUID][dependencyField] || []) !== JSON.stringify(newDependencies)) {
          activitiesCopy[selectedUUID][dependencyField] = newDependencies;
          updateEvaluationActivities(activitiesCopy);
        }
      }

      setSelected(validSelections);
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };

  const hasOptions = Object.values(dependencyMenuOptions || {}).some((options) => Array.isArray(options) && options.length > 0);

  if (!hasOptions) {
    return null;
  }

  return (
    <div className='w-full pb-4 pt-2'>
      <MultiSelectDropdown
        selectionOptions={dependencyMenuOptions}
        selections={selected}
        title={"Dependencies"}
        handleSelections={handleSelect}
        multiple={false}
        style={"primary"}
      />
    </div>
  );
}

export default SfrEvaluationActivityDependencyDropdown;
