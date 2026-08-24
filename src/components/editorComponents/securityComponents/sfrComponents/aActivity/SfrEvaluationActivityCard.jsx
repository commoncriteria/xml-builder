// Imports
import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Tooltip, TextField } from "@mui/material";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { EA_SECTION_DEPENDENCY_FIELDS, EA_SECTION_DEPENDENCY_SECTION_FIELDS } from "../../../../../utils/evaluationActivityDependencies.js";
import { handleEvaluationActivityTextUpdate, handleCustomEANameChange } from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import SfrEvaluationActivityDependencyDropdown from "./SfrEvaluationActivityDependencyDropdown.jsx";
import SfrEvaluationActivityDependencySections from "./SfrEvaluationActivityDependencySections.jsx";

/**
 * The SfrEvaluationActivityCard class that displays a specific sfr evaluation activity card
 * @param isManagementFunction the is management function (boolean)
 * @param sectionType the section type
 * @param cardTitle the card title
 * @param tooltip the tooltip
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrEvaluationActivityCard({ isManagementFunction, sectionType, cardTitle, tooltip, dependencyMenuOptions = null }) {
  // Prop Validation
  SfrEvaluationActivityCard.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
    sectionType: PropTypes.string.isRequired,
    cardTitle: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
    dependencyMenuOptions: PropTypes.object,
  };

  // Constants
  const { activities: evaluationActivities, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { selectedUUID } = evaluationActivitiesUI;
  const { activity, rowIndex } = managementFunctionUI;
  const headerColor = sectionType === "testIntroduction" || sectionType === "testClosing" ? "text-secondary" : "text-accent";

  // Methods
  /**
   * Gets the evaluation activity text item
   * @returns {*|string|null}
   */
  const getEvaluationActivityItem = () => {
    return getEvaluationActivityFieldValue(sectionType);
  };

  const getEvaluationActivityFieldValue = (field) => {
    const activities = isManagementFunction ? deepCopy(activity) : deepCopy(evaluationActivities);

    if (isManagementFunction) {
      if (!activities.hasOwnProperty(field)) {
        activities[field] = "";
      }

      return activities[field];
    } else {
      const { selectedUUID, selectedEvaluationActivity } = evaluationActivitiesUI;
      const isSelectedUUID = selectedUUID;
      const isSelectedEvaluationActivity = selectedEvaluationActivity && selectedEvaluationActivity.length > 0;

      if (isSelectedEvaluationActivity && isSelectedUUID && activities && activities.hasOwnProperty(selectedUUID)) {
        if (!activities[selectedUUID].hasOwnProperty(field)) {
          activities[selectedUUID][field] = "";
        }

        if (field === "customea") {
          return activities[selectedUUID][field].text;
        }
        return activities[selectedUUID][field];
      }
    }

    return "";
  };
  const hasLegacySectionDependencies = () => {
    if (!["tss", "guidance"].includes(sectionType)) return false;

    const dependencyField = EA_SECTION_DEPENDENCY_FIELDS[sectionType];
    const dependencySectionsField = EA_SECTION_DEPENDENCY_SECTION_FIELDS[sectionType];
    const dependencies = getEvaluationActivityFieldValue(dependencyField);
    const dependencySections = getEvaluationActivityFieldValue(dependencySectionsField);

    return Array.isArray(dependencies) && dependencies.length > 0 && (!Array.isArray(dependencySections) || dependencySections.length === 0);
  };

  // Methods
  /**
   * Gets the evaluation activity text item
   * @returns {*|string|null}
   */
  const getCustomEAName = () => {
    const activities = deepCopy(evaluationActivities);

    const { selectedUUID, selectedEvaluationActivity } = evaluationActivitiesUI;
    const isSelectedUUID = selectedUUID;
    const isSelectedEvaluationActivity = selectedEvaluationActivity && selectedEvaluationActivity.length > 0;

    if (isSelectedEvaluationActivity && isSelectedUUID && activities && activities.hasOwnProperty(selectedUUID)) {
      if (!activities[selectedUUID].hasOwnProperty(sectionType)) {
        activities[selectedUUID][sectionType] = "";
      }

      return activities[selectedUUID][sectionType].nameAttribute;
    }
  };

  const [customEAName, setCustomEAName] = useState(getCustomEAName() ?? "");
  useEffect(() => {
    setCustomEAName(getCustomEAName() ?? "");
  }, [selectedUUID, evaluationActivities]);

  // Use Memos
  /**
   * The evaluation activity section editor
   */
  const EvaluationActivitySectionEditor = useMemo(() => {
    return (
      <div className='w-full'>
        {sectionType === "customea" && (
          <TextField
            fullWidth
            size='small'
            label='Custom EA Name'
            value={customEAName}
            onChange={(e) => setCustomEAName(e.target.value)}
            onBlur={() => handleCustomEANameChange({ target: { value: customEAName } }, selectedUUID)}
            sx={{ mb: 1 }}
          />
        )}
        {["tss", "guidance"].includes(sectionType) && dependencyMenuOptions && hasLegacySectionDependencies() && (
          <SfrEvaluationActivityDependencyDropdown
            isManagementFunction={isManagementFunction}
            sectionType={sectionType}
            dependencyMenuOptions={dependencyMenuOptions}
          />
        )}
        <TipTapEditor
          contentType={"term"}
          title={sectionType}
          handleTextUpdate={handleEvaluationActivityTextUpdate}
          index={rowIndex !== undefined && rowIndex !== null ? rowIndex : null}
          text={getEvaluationActivityItem()}
          uuid={isManagementFunction ? "isManagementFunction" : selectedUUID}
        />
        {["tss", "guidance"].includes(sectionType) && dependencyMenuOptions && (
          <SfrEvaluationActivityDependencySections
            isManagementFunction={isManagementFunction}
            sectionType={sectionType}
            dependencyMenuOptions={dependencyMenuOptions}
          />
        )}
      </div>
    );
  }, [evaluationActivities, evaluationActivitiesUI, managementFunctionUI, customEAName]);

  // Return Method
  return (
    <div key={sectionType + isManagementFunction ? "ManagementFunction" : "EvaluationActivities"}>
      <CardTemplate
        type={"section"}
        header={
          <Tooltip id={sectionType + "Tooltip"} title={tooltip ? tooltip : ""} arrow>
            <label className={"resize-none font-bold text-[14px] p-0 pr-4 " + headerColor}>{cardTitle}</label>
          </Tooltip>
        }
        body={
          <div key={sectionType + (isManagementFunction ? "ManagementFunction" : "EvaluationActivities") + "Editor"}>{EvaluationActivitySectionEditor}</div>
        }
      />
    </div>
  );
}

// Export SfrEvaluationActivityCard.jsx
export default SfrEvaluationActivityCard;
