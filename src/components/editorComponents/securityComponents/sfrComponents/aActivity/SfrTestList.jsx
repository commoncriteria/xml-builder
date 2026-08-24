// Imports
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip, Typography } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import store from "../../../../../app/store.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  handleSnackBarError,
  handleSnackBarSuccess,
  updateEvaluationActivities,
  updateManagementFunctionItems,
} from "../../../../../utils/securityComponents.jsx";
import {
  convertDependenciesToStoredIds,
  getValidDependencyDropdownSelections,
} from "../../../../../utils/evaluationActivityDependencies.js";
import CardTemplate from "../../CardTemplate.jsx";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import SfrTest from "./SfrTest.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The SfrTestList class that displays the evaluation activity test list for specified components/elements
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrTestList(props) {
  // Prop Validation
  SfrTestList.propTypes = {
    dependencyDropdown: PropTypes.object.isRequired,
    handleNewTestList: PropTypes.func.isRequired,
    dependencyMap: PropTypes.object,
    isManagementFunction: PropTypes.bool,
    parentTestNumber: PropTypes.string,
    testListIndex: PropTypes.number,
    testListDescription: PropTypes.string.isRequired,
    testListUUID: PropTypes.string,
    testListDependencies: PropTypes.array,
    testListDepends: PropTypes.array,
  };

  // Constants
  const { elementUUID, element, activities, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { managementFunctions } = element;
  const { rowIndex, activity } = managementFunctionUI;
  const { dependencyMap: uiDependencyMap, selectedUUID } = evaluationActivitiesUI;
  const dependencyMap = props.dependencyMap || uiDependencyMap;
  const { primary, icons } = useSelector((state) => state.styling);
  const [collapse, setCollapse] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const uuid = props.isManagementFunction ? elementUUID : selectedUUID;
  const testUUIDs = props.isManagementFunction
    ? managementFunctionUI.activity?.testLists?.[props.testListUUID]?.testUUIDs
    : activities?.[selectedUUID]?.testLists?.[props.testListUUID]?.testUUIDs;
  const activityTests = props.isManagementFunction ? managementFunctionUI.activity?.tests : activities?.[selectedUUID]?.tests;
  const hasDependencyOptions = Object.values(props.dependencyDropdown || {}).some((options) => Array.isArray(options) && options.length > 0);
  const testListDependencyValues = useMemo(() => {
    const dependencies = props.testListDependencies || [];

    if (dependencies.length > 0) {
      return dependencies;
    }

    return (props.testListDepends || [])
      .map((depend) => depend?.["@on"] || depend?.on || depend?.["@ref"] || depend?.ref || Object.values(depend || {})[0])
      .filter(Boolean);
  }, [props.testListDependencies, props.testListDepends]);
  const validTestListDependencies = useMemo(
    () => getValidDependencyDropdownSelections(testListDependencyValues, dependencyMap, props.dependencyDropdown),
    [testListDependencyValues, dependencyMap, props.dependencyDropdown]
  );
  const hasTestListDependencies = validTestListDependencies.length > 0;
  const hasDirectTestDependencies = (testUUIDs || []).some(
    (testUUID) => getValidDependencyDropdownSelections(activityTests?.[testUUID]?.dependencies || [], dependencyMap, props.dependencyDropdown).length > 0
  );

  // Use Effects
  useEffect(() => {
    if (JSON.stringify(validTestListDependencies) !== JSON.stringify(selectedDependencies)) {
      setSelectedDependencies(validTestListDependencies);
    }
  }, [validTestListDependencies, selectedDependencies]);

  // Methods
  /**
   * Handles adding a new test
   */
  const handleNewTest = () => {
    try {
      const { isManagementFunction, testListUUID } = props;

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        let activityCopy = deepCopy(latestActivity);

        const newTestUUID = uuidv4();

        // Create the new test object
        activityCopy.tests[newTestUUID] = {
          testListUUID: testListUUID,
          dependencies: [],
          objective: "",
          nestedTestListUUIDs: [],
        };

        // Add the test to the parent in the testLists object
        const testListItem = activityCopy.testLists[testListUUID];
        if (!testListItem.testUUIDs) {
          testListItem.testUUIDs = [newTestUUID];
        } else {
          testListItem.testUUIDs.push(newTestUUID);
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

        handleSnackBarSuccess("New Test Successfully Added");
      } else {
        if (!selectedUUID || !activities?.hasOwnProperty(uuid)) return;

        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivities = store.getState().sfrWorksheetUI.activities;
        const activitiesCopy = deepCopy(latestActivities);
        const newTestUUID = uuidv4();

        // Create the new test object
        activitiesCopy[selectedUUID].tests[newTestUUID] = {
          testListUUID,
          dependencies: [],
          objective: "",
          nestedTestListUUIDs: [],
        };

        // Push UUID into testList's testUUIDs array
        const targetTestList = activitiesCopy[selectedUUID].testLists[testListUUID];
        if (!targetTestList?.testUUIDs) {
          targetTestList.testUUIDs = [newTestUUID];
        } else {
          targetTestList.testUUIDs.push(newTestUUID);
        }

        updateEvaluationActivities(activitiesCopy);
        handleSnackBarSuccess("New Test Successfully Added");
      }
    } catch (e) {
      console.error(e);
      handleSnackBarError("Failed to add new test.");
    }
  };
  /**
   * Handles the text update
   * @param event the text from the textbox
   * @param type 'description' or 'conclusion' depending on what part of the testList object we're editing
   */
  const handleTextUpdate = (event, type) => {
    try {
      const { isManagementFunction } = props;

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        let activityCopy = deepCopy(latestActivity);

        let testListItem = activityCopy.testLists[props.testListUUID];
        if (testListItem) {
          type === "conclusion" ? (testListItem["conclusion"] = event) : (testListItem["description"] = event);
        }

        // Update management functions
        updateManagementFunctionItems(
          {
            value: activityCopy,
            rowIndex,
            type: "evaluationActivity",
          },
          managementFunctions,
          true
        );
      } else if (uuid && activities?.hasOwnProperty(uuid)) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivities = store.getState().sfrWorksheetUI.activities;
        let activitiesCopy = deepCopy(latestActivities);

        let testListItem = activitiesCopy[uuid].testLists[props.testListUUID];
        if (testListItem) {
          type === "conclusion" ? (testListItem["conclusion"] = event) : (testListItem["description"] = event);

          // Update evaluation activities
          updateEvaluationActivities(activitiesCopy);
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the test list dependency dropdown.
   * @param title throwaway variable
   * @param selections the selections
   */
  const handleDependencySelect = (title, selections) => {
    try {
      if (hasDirectTestDependencies) return;

      const { isManagementFunction, testListUUID } = props;
      const validSelections = getValidDependencyDropdownSelections(selections, dependencyMap, props.dependencyDropdown);

      const newDependencies = [...new Set(convertDependenciesToStoredIds(validSelections, dependencyMap))];
      const clearDirectTestDependencies = (activityCopy, testListItem) => {
        if (newDependencies.length === 0) return;

        testListItem?.testUUIDs?.forEach((testUUID) => {
          if (activityCopy.tests?.[testUUID]) {
            activityCopy.tests[testUUID].dependencies = [];
          }
        });
      };

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        const activityCopy = deepCopy(latestActivity);
        const testListItem = activityCopy.testLists?.[testListUUID];

        if (testListItem && (JSON.stringify(testListItem.dependencies || []) !== JSON.stringify(newDependencies) || (testListItem.depends || []).length > 0)) {
          testListItem.dependencies = newDependencies;
          testListItem.depends = [];
          clearDirectTestDependencies(activityCopy, testListItem);

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
        if (!uuid || !Object.prototype.hasOwnProperty.call(activities || {}, uuid)) return;

        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivities = store.getState().sfrWorksheetUI.activities;
        const activitiesCopy = deepCopy(latestActivities);
        const testListItem = activitiesCopy[uuid]?.testLists?.[testListUUID];

        if (testListItem && (JSON.stringify(testListItem.dependencies || []) !== JSON.stringify(newDependencies) || (testListItem.depends || []).length > 0)) {
          testListItem.dependencies = newDependencies;
          testListItem.depends = [];
          clearDirectTestDependencies(activitiesCopy[uuid], testListItem);

          updateEvaluationActivities(activitiesCopy);
        }
      }

      setSelectedDependencies(validSelections);
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles deleting a Test List
   */
  const handleDeleteTestList = () => {
    try {
      const { isManagementFunction, testListUUID } = props;

      // Recursive function to delete nested test lists and their tests
      const deleteTestListAndChildren = (listUUID, testsMap, testListsMap) => {
        const testUUIDs = testListsMap[listUUID]?.testUUIDs;

        for (const test_uuid of testUUIDs) {
          const nestedUUIDs = testsMap[test_uuid]?.nestedTestListUUIDs;

          // Recursively delete nested test lists
          for (const nestedUUID of nestedUUIDs) {
            deleteTestListAndChildren(nestedUUID, testsMap, testListsMap);
          }

          // Delete the test
          delete testsMap[test_uuid];
        }

        // Delete the test list itself
        delete testListsMap[listUUID];
      };

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        console.log(latestActivity);
        let activityCopy = deepCopy(latestActivity);

        deleteTestListAndChildren(testListUUID, activityCopy.tests, activityCopy.testLists);

        // Update management functions
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
        if (!uuid || !activities?.hasOwnProperty(uuid)) return;

        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivities = store.getState().sfrWorksheetUI.activities;
        const activitiesCopy = deepCopy(latestActivities);

        deleteTestListAndChildren(testListUUID, activitiesCopy[uuid].tests, activitiesCopy[uuid].testLists);

        updateEvaluationActivities(activitiesCopy);
      }

      handleSnackBarSuccess("Test List Successfully Deleted");
    } catch (e) {
      console.error(e);
      handleSnackBarError("Failed to delete test list");
    }
  };
  /**
   * Handles the collapse
   */
  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  // Use Memos
  /**
   * The TestListEditor component
   */
  const TestListEditor = useMemo(() => {
    return (
      <div className='border border-[#BDBDBD] rounded-lg bg-gray-50 mb-3 overflow-hidden'>
        <div className='flex items-center px-3 py-1.5 border-b border-[#BDBDBD] bg-white'>
          <Typography style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Test List Intro Text
          </Typography>
        </div>
        <div className='mb-[-8px]'>
          <TipTapEditor
            className='w-full'
            contentType={"term"}
            title={"testListDescription"}
            handleTextUpdate={(event) => handleTextUpdate(event, "description")}
            text={props.testListDescription}
            uuid={uuid}
          />
        </div>
      </div>
    );
  }, [props.testListDescription, activity, activities]);
  /**
   * The TestListConclusion component
   */
  const TestListConclusion = useMemo(() => {
    return (
      <div className='border border-[#BDBDBD] rounded-lg bg-gray-50 mt-3 overflow-hidden'>
        <div className='flex items-center px-3 py-1.5 border-b border-[#BDBDBD] bg-white'>
          <Typography style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Test List Conclusion Text
          </Typography>
        </div>
        <div className='mb-[-8px]'>
          <TipTapEditor
            className='w-full'
            contentType={"term"}
            title={"testListConclusion"}
            handleTextUpdate={(event) => handleTextUpdate(event, "conclusion")}
            text={props.testListConclusion}
            uuid={uuid}
          />
        </div>
      </div>
    );
  }, [props.testListConclusion, activity, activities]);

  /**
   * Dynamically generate test list numbering
   * @type {*|number|number}
   */
  const testListIndex = useMemo(() => {
    const testLists = props.isManagementFunction ? managementFunctionUI.activity?.testLists : activities?.[selectedUUID]?.testLists;

    const tests = props.isManagementFunction ? managementFunctionUI.activity?.tests : activities?.[selectedUUID]?.tests;

    const testList = testLists?.[props.testListUUID];

    if (!testList) return;

    if (testList.parentTestUUID) {
      // It's a nested test list — find its index in parent test's nested list
      const parent = tests?.[testList.parentTestUUID];
      if (parent && Array.isArray(parent.nestedTestListUUIDs)) {
        return parent.nestedTestListUUIDs.indexOf(props.testListUUID);
      }
      return -1; // Returning number on failure instead of undefined/NaN
    } else {
      // It's a top-level test list — find its index among all top-level ones
      const topLevelTestLists = Object.entries(testLists)
        .filter(([, list]) => list.parentTestUUID === null)
        .map(([uuid]) => uuid);

      return topLevelTestLists.indexOf(props.testListUUID);
    }
  }, [props.isManagementFunction, props.testListUUID, activities, managementFunctionUI.activity, selectedUUID]);
  const testListNumber = props.parentTestNumber || `${testListIndex + 1}`;
  const testListLabel = props.parentTestNumber ? `Nested Test List ${testListNumber}` : `Test List ${testListNumber}`;

  // Return Method
  return (
    <div className='mt-4'>
      <CardTemplate
        type={"parent"}
        header={
          <div className='w-full p-0 m-0 my-[-4px] ml-[-4px]'>
            <label className='resize-none font-bold text-[13px] p-0 m-0 text-secondary mt-[6px]'>{testListLabel}</label>
            <IconButton
              variant='contained'
              sx={{ marginTop: "-8px", marginLeft: "-4px" }}
              onClick={() => {
                handleDeleteTestList();
              }}>
              <Tooltip title={`Delete ${testListLabel}`} id={`deleteTestTooltip-Test-List-${testListNumber}`}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.small} />
              </Tooltip>
            </IconButton>
          </div>
        }
        body={
          collapse && (
            <div className='w-full m-0 p-0 px-4'>
              <div className='min-w-full my-4 p-0 m-0'>
                {hasDependencyOptions && (
                  <div className='w-full pb-4 pt-2'>
                    <MultiSelectDropdown
                      selectionOptions={props.dependencyDropdown}
                      selections={selectedDependencies}
                      title={"Dependencies"}
                      tooltip={hasDirectTestDependencies ? "Test List dependency - disabled due to Test dependency" : "Test List dependency"}
                      index={testListIndex}
                      handleSelections={handleDependencySelect}
                      allowEmptySelection
                      disabled={hasDirectTestDependencies}
                      style={"primary"}
                    />
                  </div>
                )}
                {TestListEditor}
                {testUUIDs && testUUIDs.length > 0 ? (
                  <div className='min-w-full m-0 p-0 mx-[-16px]'>
                    {testUUIDs.map((testUUID) => {
                      const test = props.isManagementFunction ? managementFunctionUI.activity?.tests?.[testUUID] : activities[selectedUUID]?.tests?.[testUUID];
                      return (
                        <SfrTest
                          key={testUUID}
                          test={test}
                          testListIndex={testListIndex}
                          dependencyMenuOptions={props.dependencyDropdown}
                          dependencyMap={dependencyMap}
                          isManagementFunction={props.isManagementFunction}
                          testNumberPrefix={testListNumber}
                          testListUUID={props.testListUUID}
                          testListDepends={props.testListDepends || []}
                          dependencyDisabled={hasTestListDependencies}
                          testUUID={testUUID}
                          handleNewTestList={props.handleNewTestList}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className='mb-6' />
                )}
                {TestListConclusion}
              </div>
              <div className='border-t-2 border-gray-200 m-0 p-0 mx-[-16px] mt-[-6px]'>
                <div className='w-full p-1 justify-items-center'>
                  <IconButton sx={{ marginBottom: "-8px" }} key={"NewTestButton"} onClick={handleNewTest} variant='contained'>
                    <Tooltip title={"Add New Test"} id={"addNewTest"}>
                      <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
                    </Tooltip>
                  </IconButton>
                </div>
              </div>
            </div>
          )
        }
        collapse={collapse}
        collapseHandler={handleCollapse}
        tooltip={testListLabel}
      />
    </div>
  );
}

// Export SfrTestList.jsx
export default SfrTestList;
