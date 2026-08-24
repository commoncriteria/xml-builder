// Imports
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import store from "../../../../../app/store.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  handleSnackBarError,
  handleSnackBarSuccess,
  updateEvaluationActivities,
  updateManagementFunctionItems,
} from "../../../../../utils/securityComponents.jsx";
import { getEvaluationActivityDependencyDropdown, getFeatureDependencyMap } from "../../../../../utils/evaluationActivityDependencies.js";
import CardTemplate from "../../CardTemplate.jsx";
import SfrTestList from "./SfrTestList.jsx";
import SfrEvaluationActivityCard from "./SfrEvaluationActivityCard.jsx";

/**
 * The SfrTestListSection class that displays the evaluation activity test list section
 * @param isManagementFunction the is management function (boolean)
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrTestListSection({ isManagementFunction }) {
  // Prop Validation
  SfrTestListSection.propTypes = {
    isManagementFunction: PropTypes.bool.isRequired,
  };

  // Constants
  const { secondary, icons } = useSelector((state) => state.styling);
  const platforms = useSelector((state) => state.accordionPane.platformData.platforms);
  const implementationFeatures = useSelector((state) => state.features?.featureList || []);
  const { element, selectedSfrElement, activities, elementMaps, evaluationActivitiesUI, managementFunctionUI } = useSelector(
    (state) => ({
      element: state.sfrWorksheetUI.element,
      selectedSfrElement: state.sfrWorksheetUI.selectedSfrElement,
      activities: state.sfrWorksheetUI.activities,
      elementMaps: state.sfrWorksheetUI.elementMaps,
      evaluationActivitiesUI: state.sfrWorksheetUI.evaluationActivitiesUI,
      managementFunctionUI: state.sfrWorksheetUI.managementFunctionUI,
    }),
    shallowEqual
  );
  const { managementFunctions } = element;
  const { dependencyMap, selectedEvaluationActivity, selectedUUID } = evaluationActivitiesUI;
  const { activity, rowIndex } = managementFunctionUI;
  const dependencyMapWithFeatures = useMemo(
    () => getFeatureDependencyMap(dependencyMap, implementationFeatures),
    [dependencyMap, implementationFeatures]
  );
  const selectedDependencyContext = useMemo(
    () => (isManagementFunction ? [selectedSfrElement] : selectedEvaluationActivity),
    [isManagementFunction, selectedSfrElement, selectedEvaluationActivity]
  );
  const isSelected = selectedDependencyContext?.length > 0;
  const isActivitiesValid = Object.prototype.hasOwnProperty.call(activities || {}, selectedUUID) && isSelected;
  const isValid = (isManagementFunction || isActivitiesValid) && isSelected;
  const dependencyDropdown = useMemo(
    () =>
      getEvaluationActivityDependencyDropdown({
        selected: isValid ? selectedDependencyContext : [],
        isManagementFunction,
        dependencyMap: dependencyMapWithFeatures,
        platforms,
        elementMaps,
        features: implementationFeatures,
      }),
    [isValid, selectedDependencyContext, isManagementFunction, dependencyMapWithFeatures, platforms, elementMaps, implementationFeatures]
  );
  const testListEntries = useMemo(() => {
    if (!isValid) return [];

    const testLists = isManagementFunction ? activity?.testLists : activities?.[selectedUUID]?.testLists;
    return Object.entries(testLists || {}).filter(([, list]) => list.parentTestUUID === null);
  }, [isValid, isManagementFunction, activity, activities, selectedUUID]);

  // Methods
  /**
   * Handles adding a new test list
   * @param {*} parentTestUUID  UUID of the test where this testlist is being added to
   */
  const handleNewTestList = (parentTestUUID = null) => {
    try {
      const newTestUUID = uuidv4();
      const newTestListUUID = uuidv4();

      const newTestList = {
        description: "",
        dependencies: [],
        parentTestUUID: parentTestUUID,
        testUUIDs: [newTestUUID],
      };

      const newTest = {
        testListUUID: newTestListUUID,
        dependencies: [],
        objective: "",
        nestedTestListUUIDs: [],
      };

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        let activityCopy = deepCopy(latestActivity);

        activityCopy.testLists = {
          ...activityCopy.testLists,
          [newTestListUUID]: newTestList,
        };

        activityCopy.tests = {
          ...activityCopy.tests,
          [newTestUUID]: newTest,
        };

        // If this is a nested test list, link it
        if (parentTestUUID) {
          const parentTest = activityCopy.tests[parentTestUUID];
          if (parentTest) {
            parentTest.nestedTestListUUIDs = [...parentTest.nestedTestListUUIDs, newTestListUUID];
          }
        }

        updateManagementFunctionItems(
          {
            value: activityCopy,
            rowIndex,
            type: "evaluationActivity",
          },
          managementFunctions,
          true
        );
      } else {
        if (!selectedUUID || !activities?.hasOwnProperty(selectedUUID)) return;

        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivities = store.getState().sfrWorksheetUI.activities;
        let activitiesCopy = deepCopy(latestActivities);
        let activityEntry = activitiesCopy[selectedUUID];

        if (!activityEntry.testLists) {
          activityEntry.testLists = {};
        }
        if (!activityEntry.tests) {
          activityEntry.tests = {};
        }

        activityEntry.testLists[newTestListUUID] = newTestList;
        activityEntry.tests[newTestUUID] = newTest;

        // If this is a nested test list, link it
        if (parentTestUUID) {
          const parentTest = deepCopy(activityEntry.tests[parentTestUUID]);
          parentTest.nestedTestListUUIDs = [...parentTest.nestedTestListUUIDs, newTestListUUID];

          activityEntry.tests[parentTestUUID] = parentTest;
        }
        activitiesCopy[selectedUUID] = activityEntry;

        updateEvaluationActivities(activitiesCopy);
      }

      handleSnackBarSuccess(parentTestUUID ? "New Nested Test List Successfully Added" : "New Test List Successfully Added");
    } catch (e) {
      console.error(e);
      handleSnackBarError("Failed to add test list.");
    }
  };

  // Components
  /**
   * Gets the test list card section
   * @returns {JSX.Element|null}
   */
  const getTestListCard = () => {
    // Return the valid test list
    return (
      isValid && (
        <CardTemplate
          type={"section"}
          header={
            <Tooltip
              id={"TestsTooltip"}
              title={`Taken Directly from the Wiki: The goal of testing is to determine the whether the TOE 
                                 behaves as described in the ST and as specified in the evaluation evidence 
                                 (described in the ADV class).`}
              arrow>
              <label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Tests</label>
            </Tooltip>
          }
          body={
            <div className='w-full m-0 p-0'>
              <div className='min-w-full mb-3 p-0 m-0'>
                <div className='mx-[-16px] mt-[-6px]'>
                  <SfrEvaluationActivityCard isManagementFunction={isManagementFunction} sectionType={"testIntroduction"} cardTitle={"Introduction"} />
                </div>
                {testListEntries.length > 0 && (
                  <div className='min-w-full m-0 p-0 mt-[-6px]  '>
                    {testListEntries.map(([uuid, list], index) => (
                      <SfrTestList
                        key={uuid}
                        testListIndex={index}
                        testListDescription={list.description}
                        testListConclusion={list.conclusion}
                        testListDependencies={list.dependencies || []}
                        testUUIDs={list.testUUIDs}
                        testListDepends={list.depends || []}
                        dependencyMap={dependencyMapWithFeatures}
                        dependencyDropdown={dependencyDropdown}
                        isManagementFunction={isManagementFunction}
                        testListUUID={uuid}
                        handleNewTestList={handleNewTestList}
                      />
                    ))}
                  </div>
                )}
                <div className={`mx-[-16px] ${testListEntries.length > 0 ? "mt-[-6px]" : "mt-[2px]"} mb-[-4px]`}>
                  <SfrEvaluationActivityCard isManagementFunction={isManagementFunction} sectionType={"testClosing"} cardTitle={"Conclusion Text"} />
                </div>
              </div>
              <div className='border-t-2 border-gray-200 m-0 p-0 mx-[-16px] mt-1'>
                <div className='w-full p-1 justify-items-center'>
                  <IconButton sx={{ marginBottom: "-8px" }} key={"NewTestButton"} variant='contained' onClick={() => handleNewTestList()}>
                    <Tooltip title={"Add New Test List"} id={"AddNewTestListTooltip"}>
                      <AddCircleRoundedIcon htmlColor={secondary} sx={icons.medium} />
                    </Tooltip>
                  </IconButton>
                </div>
              </div>
            </div>
          }
        />
      )
    );
  };

  // Return Method
  return <div>{getTestListCard()}</div>;
}

// Export SfrTestListSection.jsx
export default SfrTestListSection;
