// Imports
import { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { handleEvaluationActivityTextUpdate } from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The SfrEvaluationActivityCard class that displays a specific sfr evaluation activity card
 * @param isManagementFunction the is management function (boolean)
 * @param sectionType the section type
 * @param cardTitle the card title
 * @param tooltip the tooltip
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrEvaluationActivityCard({ isManagementFunction, sectionType, cardTitle, tooltip }) {
  // Prop Validation
  SfrEvaluationActivityCard.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
    sectionType: PropTypes.string.isRequired,
    cardTitle: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
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
    const activities = isManagementFunction ? deepCopy(activity) : deepCopy(evaluationActivities);

    if (isManagementFunction) {
      if (!activities.hasOwnProperty(sectionType)) {
        activities[sectionType] = "";
      }

      return activities[sectionType];
    } else {
      const { selectedUUID, selectedEvaluationActivity } = evaluationActivitiesUI;
      const isSelectedUUID = selectedUUID;
      const isSelectedEvaluationActivity = selectedEvaluationActivity && selectedEvaluationActivity.length > 0;

      if (isSelectedEvaluationActivity && isSelectedUUID && activities && activities.hasOwnProperty(selectedUUID)) {
        if (!activities[selectedUUID].hasOwnProperty(sectionType)) {
          activities[selectedUUID][sectionType] = "";
        }

        return activities[selectedUUID][sectionType];
      }
    }

    return "";
  };

  // Use Memos
  /**
   * The evaluation activity section editor
   */
  const EvaluationActivitySectionEditor = useMemo(() => {
    return (
      <TipTapEditor
        className='w-full'
        contentType={"term"}
        title={sectionType}
        handleTextUpdate={handleEvaluationActivityTextUpdate}
        index={rowIndex !== undefined && rowIndex !== null ? rowIndex : null}
        text={getEvaluationActivityItem()}
        uuid={isManagementFunction ? "isManagementFunction" : selectedUUID}
      />
    );
  }, [evaluationActivities, evaluationActivitiesUI, managementFunctionUI]);

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
