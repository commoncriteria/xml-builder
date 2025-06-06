// Imports
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  handleSnackBarError,
  handleSnackBarSuccess,
  noTestTooltip,
  updateEvaluationActivities,
  updateManagementFunctionItems,
} from "../../../../../utils/securityComponents.jsx";
import NoEaConfirmation from "../../../../modalComponents/NoEaConfirmation.jsx";
import ToggleSwitch from "../../../../ToggleSwitch.jsx";

/**
 * The SfrIntroduction class that displays the no tests toggle logic
 * @param isManagementFunction the is management function (boolean)
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrNoTestToggle({ isManagementFunction }) {
  // Prop Validation
  SfrNoTestToggle.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
  };

  // Constants
  const { element, activities, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { managementFunctions } = element;
  const { selectedUUID } = evaluationActivitiesUI;
  const { activity, rowIndex } = managementFunctionUI;
  const { primaryToggleTypographyLarge, primaryToggleSwitch, secondaryToggleTypographyLarge, secondaryToggleSwitch } = useSelector((state) => state.styling);
  const toggleStyling = {
    largeToggleTypography: isManagementFunction ? primaryToggleTypographyLarge : secondaryToggleTypographyLarge,
    secondaryToggleSwitch: isManagementFunction ? primaryToggleSwitch : secondaryToggleSwitch,
  };
  const [open, setOpen] = useState(false);
  const [isNoTest, setIsNoTest] = useState(false);

  // Use Effects
  useEffect(() => {
    updateIsNoTest(isManagementFunction, activity, activities, selectedUUID);
  }, [isManagementFunction, activity, activities, evaluationActivitiesUI]);

  // Methods
  /**
   * Handles open
   */
  const handleOpen = () => {
    setOpen(!open);
  };
  /**
   * Handles the no test toggle
   */
  const handleNoTestToggle = () => {
    try {
      if (isManagementFunction) {
        let newActivity = {
          isNoTest: !isNoTest,
          noTest: "",
          introduction: "",
          tss: "",
          guidance: "",
          testIntroduction: "",
          testClosing: "",
          testLists: {},
          tests: {},
          refIds: [],
        };

        // Update management functions
        updateManagementFunctionItems(
          {
            value: newActivity,
            rowIndex,
            type: "evaluationActivity",
          },
          managementFunctions,
          true
        );
      } else {
        let activitiesCopy = deepCopy(activities);
        const isSelectedUUID = selectedUUID && selectedUUID !== "";
        const isValidActivity = activitiesCopy && activitiesCopy.hasOwnProperty(selectedUUID);

        if (isSelectedUUID && isValidActivity) {
          activitiesCopy[selectedUUID] = {
            isNoTest: !isNoTest,
            noTest: "",
            introduction: "",
            tss: "",
            guidance: "",
            testIntroduction: "",
            testClosing: "",
            testLists: {},
            tests: {},
          };

          // Update evaluation activities
          updateEvaluationActivities(activitiesCopy);
        }
      }

      // Update snackbar
      const message = !isNoTest ? "Successfully Created No EAs" : "Successfully Removed No EAs";
      handleSnackBarSuccess(message);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Helper Methods
  /**
   * Update is no test
   * @param isManagementFunction the is management function
   * @param activity the activity
   * @param activities the activities
   * @param selectedUUID the selected uuid
   */
  const updateIsNoTest = (isManagementFunction, activity, activities, selectedUUID) => {
    let noTest;

    if (isManagementFunction) {
      let activityCopy = activity ? deepCopy(activity) : {};
      noTest = activityCopy.hasOwnProperty("isNoTest") ? activityCopy.isNoTest : false;
    } else {
      let activitiesCopy = activities ? deepCopy(activities) : {};
      noTest =
        activitiesCopy.hasOwnProperty(selectedUUID) && activitiesCopy[selectedUUID].hasOwnProperty("isNoTest") ? activitiesCopy[selectedUUID].isNoTest : false;
    }

    // Update is no test value
    setIsNoTest(noTest);
  };

  // Return Method
  return (
    <div>
      <ToggleSwitch
        isToggled={isNoTest}
        isSfrWorksheetToggle={false}
        handleUpdateToggle={handleOpen}
        tooltip={noTestTooltip}
        tooltipID={"noTestToggle"}
        title={"No Ea's"}
        styling={toggleStyling}
        addBorder={isManagementFunction ? false : true}
      />
      <NoEaConfirmation toggleValue={isNoTest} open={open} handleOpen={handleOpen} handleSubmit={handleNoTestToggle} />
    </div>
  );
}

// Export SfrNoTestToggle.jsx
export default SfrNoTestToggle;
