// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { getRefIdDropdown, updateRefIds } from "../../../../../utils/securityComponents.jsx";
import SfrTestListSection from "./SfrTestListSection.jsx";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import SfrEvaluationActivityCard from "./SfrEvaluationActivityCard.jsx";

/**
 * The SfrEvaluationActivitySection class that displays the sfr evaluation activity section
 * @param isManagementFunction the is management function (boolean)
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrEvaluationActivitySection({ isManagementFunction }) {
  // Prop Validation
  SfrEvaluationActivitySection.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
  };

  // Constants
  const { activities, refIdOptions, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { selectedUUID } = evaluationActivitiesUI;
  const { activity, rowIndex } = managementFunctionUI;

  // Helper Methods
  /**
   * Gets is no test section
   * @returns {boolean|*}
   */
  const getIsNoTest = () => {
    let activityCopy = isManagementFunction ? deepCopy(activity) : deepCopy(activities);

    if (isManagementFunction) {
      return activityCopy.hasOwnProperty("isNoTest") ? activityCopy.isNoTest : false;
    } else {
      const isUUID = activityCopy.hasOwnProperty(selectedUUID);
      return isUUID && activityCopy[selectedUUID].hasOwnProperty("isNoTest") ? activityCopy[selectedUUID].isNoTest : false;
    }
  };
  /**
   * Updates the evaluation activity ref ids
   * @param title the title
   * @param event the event
   * @param index the index
   */
  const updateEaRefIds = (title, event, index) => {
    updateRefIds({
      event,
      index,
      type: "aactivity",
    });
  };

  // Components
  /**
   * Gets the management function multiselect dropdown
   * @param activityCopy the activity copy
   * @returns {JSX.Element}
   */
  const ManagementFunctionDropdown = () => {
    let activityCopy = deepCopy(activity);
    const refIdOptionsCopy = getRefIdDropdown(refIdOptions, rowIndex);
    const refIds = activityCopy.refIds ? deepCopy(activityCopy.refIds) : [];

    return (
      <div className='w-full px-4 py-2'>
        <MultiSelectDropdown
          title={"Included Management Functions"}
          selections={refIds}
          selectionOptions={refIdOptionsCopy}
          handleSelections={updateEaRefIds}
          index={rowIndex}
        />
      </div>
    );
  };

  // Return Method
  return (
    <div>
      {getIsNoTest() ? (
        <div className='mt-2'>
          <SfrEvaluationActivityCard isManagementFunction={isManagementFunction} sectionType={"noTest"} cardTitle={"No Evaluation Activity Explanation"} />
        </div>
      ) : (
        <div className='mt-2'>
          {isManagementFunction && ManagementFunctionDropdown()}
          <SfrEvaluationActivityCard isManagementFunction={isManagementFunction} sectionType={"introduction"} cardTitle={"Introduction"} />
          <SfrEvaluationActivityCard
            isManagementFunction={isManagementFunction}
            sectionType={"tss"}
            cardTitle={"TSS"}
            tooltip={`Taken directly from the WIki: ASE_TSS.1 requires that the developer provide a TOE Summary 
                             Specification (TSS) that describes how the TOE meets each SFR. Other SARs require that the 
                             TSS describe how the TOE protects itself against interference, logical tampering, and 
                             bypass. Since the SARs already require that the TSS describe how the TOE meets all the 
                             requirements, this activity should be used only to point out specific aspects of the 
                             requirement that must be documented in the the TSS.`}
          />
          <SfrEvaluationActivityCard
            isManagementFunction={isManagementFunction}
            sectionType={"guidance"}
            cardTitle={"Guidance"}
            tooltip={`Taken directly from the Wiki: The CC:2022 requires at least two types of Guidance documentation: 
                             Operational Guidance and Administrator Guidance. Administrator Guidance contains of instructions 
                             for putting the TOE into the evaluated configuration. The Operational Guidance is documentation 
                             for users of the system. This activity concerns the Operational Guidance, or the Guidance in general. 
                             It is sometimes referred to as "AGD."`}
          />
          <SfrTestListSection isManagementFunction={isManagementFunction} />
        </div>
      )}
    </div>
  );
}

// Export SfrEvaluationActivitySection.jsx
export default SfrEvaluationActivitySection;
