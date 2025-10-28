// Imports
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
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
import CardTemplate from "../../CardTemplate.jsx";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import SfrTestList from "./SfrTestList.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The SfrTest class that displays the evaluation activity test for specified components/elements
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrTest(props) {
  // Prop Validation
  SfrTest.propTypes = {
    test: PropTypes.object.isRequired,
    dependencyMenuOptions: PropTypes.object.isRequired,
    isManagementFunction: PropTypes.bool,
    testUUID: PropTypes.string.isRequired,
    handleNewTestList: PropTypes.func.isRequired,
    testListUUID: PropTypes.string,
  };

  // Constants
  const { elementUUID, element, activities, evaluationActivitiesUI, managementFunctionUI } = useSelector((state) => state.sfrWorksheetUI);
  const { managementFunctions } = element;
  const { rowIndex } = managementFunctionUI;
  const { dependencyMap, selectedUUID } = evaluationActivitiesUI;
  const { secondary, icons } = useSelector((state) => state.styling);
  const [selected, setSelected] = useState([]);
  const uuid = props.isManagementFunction ? elementUUID : selectedUUID;
  const activityData = props.isManagementFunction ? managementFunctionUI.activity : activities[selectedUUID];

  // Use Effects
  useEffect(() => {
    updateDependencyDropdown(selected);
  }, [selected, props]);

  // Methods
  /**
   * Handles the text update
   * @param event the text from the textbox
   */
  const handleTextUpdate = (event, type) => {
    try {
      const { isManagementFunction, testUUID } = props;

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        let activityCopy = deepCopy(latestActivity);

        let testItem = activityCopy.tests[testUUID];
        if (testItem) {
          type === "conclusion" ? (testItem["conclusion"] = event) : (testItem["objective"] = event);
        } else {
          handleSnackBarError(`Test UUID ${testUUID} not found`);
        }

        if (JSON.stringify(testItem.objective) !== JSON.stringify(event)) {
          testItem.objective = event;

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
        }
      } else if (uuid && activities?.hasOwnProperty(uuid)) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivities = store.getState().sfrWorksheetUI.activities;
        let activitiesCopy = deepCopy(latestActivities);

        let testItem = activitiesCopy[uuid].tests?.[testUUID];
        if (testItem) {
          type === "conclusion" ? (testItem["conclusion"] = event) : (testItem["objective"] = event);

          // Update evaluation activities
          updateEvaluationActivities(activitiesCopy);
        } else {
          handleSnackBarError(`Test UUID ${testUUID} not found`);
        }
      }
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the selection dependency dropdown
   * @param title throwaway variable
   * @param selections the selections
   */
  const handleSelect = (title, selections) => {
    try {
      const { isManagementFunction, testUUID, dependencyMenuOptions } = props;

      const isValid = selections && activities?.hasOwnProperty(uuid) && dependencyMenuOptions;

      if ((isManagementFunction && dependencyMenuOptions) || isValid) {
        let validSelections = [];
        const menuProperties = ["Platforms", "Selectables", "ComplexSelectablesEA"];

        selections?.forEach((selection) => {
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

        const newSelections = [...new Set(convertDependenciesToUUID(validSelections))];
        let dependencies = deepCopy(props.test.dependencies);

        if (JSON.stringify(dependencies) !== JSON.stringify(newSelections)) {
          if (isManagementFunction) {
            // Pull latest activity state from store - to avoid conflicting updates to the state
            const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
            let activityCopy = deepCopy(latestActivity);

            let testItem = activityCopy.tests[testUUID];

            if (testItem && JSON.stringify(testItem.dependencies) !== JSON.stringify(newSelections)) {
              testItem.dependencies = newSelections;

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
            // Pull latest activity state from store - to avoid conflicting updates to the state
            const latestActivities = store.getState().sfrWorksheetUI.activities;
            let activitiesCopy = deepCopy(latestActivities);

            const testObj = activitiesCopy[uuid]?.tests?.[testUUID];
            if (testObj) {
              testObj.dependencies = newSelections;

              updateEvaluationActivities(activitiesCopy);
            } else {
              console.error(`Test with UUID ${testUUID} not found.`);
            }
          }
          setSelected(selections);
        }
      }
    } catch (e) {
      console.error(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles deleting a test
   */
  const handleDeleteTest = () => {
    try {
      const { isManagementFunction, testUUID, testListUUID } = props;

      if (isManagementFunction) {
        // Pull latest activity state from store - to avoid conflicting updates to the state
        const latestActivity = store.getState().sfrWorksheetUI.managementFunctionUI.activity;
        let activityCopy = deepCopy(latestActivity);

        // Delete the test from the tests dictionary
        if (activityCopy.tests[testUUID]) {
          delete activityCopy.tests[testUUID];
        }

        // Remove the testUUID from its parent testList's testUUIDs array
        const testList = activityCopy.testLists[testListUUID];
        if (testList) {
          testList.testUUIDs = testList.testUUIDs.filter((uuid) => uuid !== testUUID);
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
      } else {
        if (!selectedUUID || !activities?.hasOwnProperty(uuid)) return;

        let activitiesCopy = deepCopy(activities);

        // Remove test from dictionary
        delete activitiesCopy[selectedUUID].tests[testUUID];

        // Also remove the UUID from the test list's testUUIDs array
        const testList = activitiesCopy[selectedUUID].testLists?.[testListUUID];
        if (testList) {
          testList.testUUIDs = testList.testUUIDs.filter((uuid) => uuid !== testUUID);
        }

        updateEvaluationActivities(activitiesCopy);
      }

      handleSnackBarSuccess("Test Successfully Removed");
    } catch (e) {
      console.error(e);
      handleSnackBarError("Failed to delete test");
    }
  };

  // Helper Methods
  /**
   * Gets the test index
   * @returns {number}
   */
  const getTestIndex = () => {
    const testList = props.isManagementFunction
      ? store.getState().sfrWorksheetUI.managementFunctionUI.activity.testLists?.[props.testListUUID]
      : activities?.[selectedUUID]?.testLists?.[props.testListUUID];

    if (!testList || !testList.testUUIDs) {
      console.error(`Test UUID ${props.testUUID} not found in test list ${props.testListUUID}`);
    }

    return testList.testUUIDs.indexOf(props.testUUID);
  };
  /**
   * Updates the dependency dropdown
   * @param selected the selected
   */
  const updateDependencyDropdown = (selected) => {
    const { dependencyMenuOptions, test } = props;

    if (test && test.hasOwnProperty("dependencies")) {
      let newSelectables = [...new Set(convertDependenciesFromUUID(test.dependencies))];
      let validSelections = [];

      newSelectables?.forEach((selection) => {
        const isNewSelection = !validSelections.includes(selection);
        const isValidPlatform = dependencyMenuOptions.hasOwnProperty("Platforms") && dependencyMenuOptions.Platforms.includes(selection) && isNewSelection;
        const isValidSelectables =
          dependencyMenuOptions.hasOwnProperty("Selectables") && dependencyMenuOptions.Selectables.includes(selection) && isNewSelection;
        const isValidComplexSelectablesEA =
          dependencyMenuOptions.hasOwnProperty("ComplexSelectablesEA") && dependencyMenuOptions.ComplexSelectablesEA.includes(selection) && isNewSelection;

        // Add new valid selections
        if (isValidPlatform) {
          validSelections.push(selection);
        }
        if (isValidSelectables) {
          validSelections.push(selection);
        }
        if (isValidComplexSelectablesEA) {
          validSelections.push(selection);
        }
      });

      if (JSON.stringify(validSelections) !== JSON.stringify(selected)) {
        setSelected(validSelections);
      }
    }
  };
  /**
   * Converts the dependencies to uuid
   * @param dependencies the dependencies
   * @returns {*[]}
   */
  const convertDependenciesToUUID = (dependencies) => {
    let convertedDependencies = [];
    try {
      if (dependencies && dependencies.length > 0) {
        dependencies.forEach((dependency) => {
          if (dependencyMap && dependencyMap.hasOwnProperty("selectablesToUUID")) {
            let newDependency = dependency;

            if (dependencyMap.selectablesToUUID.hasOwnProperty(dependency)) {
              newDependency = dependencyMap.selectablesToUUID[dependency];
            }
            if (!convertedDependencies.includes(newDependency)) {
              convertedDependencies.push(newDependency);
            }
          }
        });
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
    return convertedDependencies;
  };
  /**
   * Converts the dependencies from uuid
   * @param dependencies the dependencies
   * @returns {*[]}
   */
  const convertDependenciesFromUUID = (dependencies) => {
    let convertedDependencies = [];

    try {
      if (dependencies && dependencies.length > 0) {
        dependencies.forEach((dependency) => {
          if (dependencyMap && dependencyMap.hasOwnProperty("uuidToSelectables")) {
            let newDependency = dependency.valueOf();

            if (dependencyMap.uuidToSelectables.hasOwnProperty(dependency)) {
              newDependency = dependencyMap.uuidToSelectables[dependency];
            }
            if (!convertedDependencies.includes(newDependency)) {
              convertedDependencies.push(newDependency);
            }
          }
        });
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }

    return convertedDependencies;
  };
  /**
   * Gets the nested test lists
   * @type {[string, unknown][]}
   */
  const nestedTestLists = Object.entries(activityData?.testLists).filter(([, list]) => list.parentTestUUID === props.testUUID);

  // Use Memos
  /**
   * The TestIndex value
   */
  const TestIndex = useMemo(() => getTestIndex(), [props.testListUUID, props.testUUID, JSON.stringify(activityData)]);

  /**
   * The TestEditor component
   */
  const TestEditor = useMemo(() => {
    /**
     * Track nested test list depth in order to prevent user from adding infinite nested test lists
     * @param {*} testUUID
     * @returns Depth (number) from root test list
     */
    const getNestingDepth = (testUUID) => {
      let currentTestUUID = testUUID;
      let depth = 1;

      while (true) {
        // Find the test list that this test belongs to
        const testList = Object.values(activityData?.testLists).find((list) => list.testUUIDs?.includes(currentTestUUID));

        if (!testList || !testList.parentTestUUID) {
          break; // No parent means this is the root
        }

        currentTestUUID = testList.parentTestUUID;
        depth += 1;
      }

      return depth;
    };
    const nestingDepth = getNestingDepth(props.testUUID);
    const disableNestedTestList = nestingDepth > 3; // limit nested testlists to 3 levels

    return (
      <div>
        <TipTapEditor
          className='w-full'
          contentType={"term"}
          title={"objective"}
          index={TestIndex}
          uuid={uuid}
          text={props.test.objective || ""}
          handleTextUpdate={(event) => handleTextUpdate(event, "objective")}
        />
        <div className='mt-2 mb-[-8px]'>
          {nestedTestLists.length > 0 ? (
            nestedTestLists.map(([testListUUID, testList]) => (
              <SfrTestList
                key={"TestListSection_" + testListUUID}
                testListDescription={testList.description || ""}
                testListConclusion={testList.conclusion}
                testUUIDs={testList.testUUIDs}
                dependencyDropdown={props.dependencyMenuOptions}
                isManagementFunction={props.isManagementFunction}
                testListUUID={testListUUID}
                handleNewTestList={props.handleNewTestList}
              />
            ))
          ) : !disableNestedTestList ? (
            <div className='border-t-2 border-gray-200 m-0 p-0 mx-[-16px] mt-4'>
              <div className='w-full p-1 justify-items-center mb-2'>
                <IconButton sx={{ marginBottom: "-8px" }} key={"NewTestButton"} variant='contained' onClick={() => props.handleNewTestList(props.testUUID)}>
                  <Tooltip
                    title={
                      "Add New Test List (Note: Only one nested Test List can be created per Test, and a maximum of 3 levels of nested Test List's can be created)"
                    }
                    id={uuid + "AddNewTestListTooltip"}>
                    <AddCircleRoundedIcon htmlColor={secondary} sx={icons.medium} />
                  </Tooltip>
                </IconButton>
              </div>
            </div>
          ) : (
            <div className='mb-4' />
          )}
        </div>
        {/* Test Conclusion RTE */}
        <TipTapEditor
          className='w-full'
          contentType={"term"}
          title={"testConclusion"}
          index={TestIndex}
          uuid={uuid}
          text={props.test.conclusion || ""}
          handleTextUpdate={(event) => handleTextUpdate(event, "conclusion")}
        />
      </div>
    );
  }, [props.test.objective, props.test.conclusion, props.testUUID, JSON.stringify(activityData)]);

  // Return Method
  return (
    <CardTemplate
      type={"section"}
      header={
        <div className='w-full p-0 m-0 my-[-6px]'>
          <span className='flex justify-stretch min-w-full'>
            <div className='flex justify-center w-full pl-4'>
              <label className='resize-none font-bold text-[13px] p-0 m-0 text-accent pr-1 mt-[6px]'>{`Test ${TestIndex + 1}`}</label>
              <IconButton variant='contained' sx={{ marginTop: "-8px", margin: 0, padding: 0 }} onClick={() => handleDeleteTest()}>
                <Tooltip title={`Delete Test ${TestIndex + 1}`} id={"deleteTestTooltip" + (TestIndex + 1)}>
                  <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.small} />
                </Tooltip>
              </IconButton>
            </div>
          </span>
        </div>
      }
      body={
        <div className='w-full p-0 m-0 mt-[-8px] mb-[2px]'>
          <div className='w-full pb-4 pt-2'>
            <MultiSelectDropdown
              selectionOptions={props.dependencyMenuOptions}
              selections={selected}
              title={"Dependencies"}
              index={TestIndex}
              handleSelections={handleSelect}
              style={"primary"}
            />
          </div>
          {TestEditor}
        </div>
      }
    />
  );
}

// Export SfrTest.jsx
export default SfrTest;
