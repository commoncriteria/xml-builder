import store from "../app/store.js";
import { UPDATE_SFR_COMPONENT_ITEMS, UPDATE_SFR_SECTION_ELEMENT } from "../reducers/SFRs/sfrSectionSlice.js";
import { UPDATE_SFR_WORKSHEET_ITEMS } from "../reducers/SFRs/sfrWorksheetUI.js";
import { deepCopy } from "./deepCopy.js";

const DIRECT_DEPENDENCY_FIELDS = {
  tssDependencies: "tss",
  guidanceDependencies: "guidance",
};

const DEPENDENCY_SECTION_FIELDS = {
  tssDependencySections: "tss",
  guidanceDependencySections: "guidance",
};

const emptyUsage = () => ({
  total: 0,
  tss: 0,
  guidance: 0,
  test: 0,
  testList: 0,
});

const getDependencySet = (dependencyValues = []) =>
  new Set(
    (Array.isArray(dependencyValues) ? dependencyValues : [dependencyValues])
      .map((dependency) => dependency?.valueOf?.() ?? dependency)
      .filter((dependency) => dependency !== null && dependency !== undefined && dependency !== "")
      .map(String)
  );

const isTargetDependency = (dependency, dependencySet) => dependencySet.has(String(dependency?.valueOf?.() ?? dependency));

const hasTargetDependsAttribute = (depend = {}, dependencySet) => {
  return Object.values(depend || {}).some((value) => isTargetDependency(value, dependencySet));
};

const countMatches = (dependencies = [], dependencySet) => {
  if (!Array.isArray(dependencies)) return 0;
  return dependencies.filter((dependency) => isTargetDependency(dependency, dependencySet)).length;
};

const countRawDependsMatches = (depends = [], dependencySet) => {
  if (!Array.isArray(depends)) return 0;
  return depends.filter((depend) => hasTargetDependsAttribute(depend, dependencySet)).length;
};

const filterDependencies = (dependencies = [], dependencySet) => {
  if (!Array.isArray(dependencies)) return { dependencies: [], removed: 0 };

  const filtered = dependencies.filter((dependency) => !isTargetDependency(dependency, dependencySet));
  return {
    dependencies: filtered,
    removed: dependencies.length - filtered.length,
  };
};

const filterRawDepends = (depends = [], dependencySet) => {
  if (!Array.isArray(depends)) return { depends: [], removed: 0 };

  const filtered = depends.filter((depend) => !hasTargetDependsAttribute(depend, dependencySet));
  return {
    depends: filtered,
    removed: depends.length - filtered.length,
  };
};

const mergeUsage = (target, source) => {
  Object.keys(target).forEach((key) => {
    target[key] += source[key] || 0;
  });
  return target;
};

export const getEvaluationActivityDependencyUsage = (activity = {}, dependencyValues = []) => {
  const dependencySet = getDependencySet(dependencyValues);
  const usage = emptyUsage();

  if (dependencySet.size === 0 || !activity) {
    return usage;
  }

  Object.entries(DIRECT_DEPENDENCY_FIELDS).forEach(([field, usageKey]) => {
    const count = countMatches(activity[field], dependencySet);
    usage[usageKey] += count;
    usage.total += count;
  });

  Object.entries(DEPENDENCY_SECTION_FIELDS).forEach(([field, usageKey]) => {
    (activity[field] || []).forEach((dependencySection) => {
      const count = countMatches(dependencySection?.dependencies, dependencySet);
      usage[usageKey] += count;
      usage.total += count;
    });
  });

  Object.values(activity.tests || {}).forEach((test) => {
    const count = countMatches(test?.dependencies, dependencySet);
    usage.test += count;
    usage.total += count;
  });

  Object.values(activity.testLists || {}).forEach((testList) => {
    const dependencyCount = countMatches(testList?.dependencies, dependencySet);
    const rawDependsCount = countRawDependsMatches(testList?.depends, dependencySet);
    const count = dependencyCount + rawDependsCount;
    usage.testList += count;
    usage.total += count;
  });

  return usage;
};

export const getSfrSectionsEvaluationActivityDependencyUsage = (sfrSections = {}, dependencyValues = []) => {
  const usage = emptyUsage();

  Object.values(sfrSections || {}).forEach((family) => {
    Object.values(family || {}).forEach((component) => {
      Object.values(component?.evaluationActivities || {}).forEach((activity) => {
        mergeUsage(usage, getEvaluationActivityDependencyUsage(activity, dependencyValues));
      });

      Object.values(component?.elements || {}).forEach((element) => {
        (element?.managementFunctions?.rows || []).forEach((row) => {
          mergeUsage(usage, getEvaluationActivityDependencyUsage(row?.evaluationActivity, dependencyValues));
        });
      });
    });
  });

  return usage;
};

export const removeDependenciesFromEvaluationActivity = (activity = {}, dependencyValues = []) => {
  const dependencySet = getDependencySet(dependencyValues);
  const updatedActivity = activity ? deepCopy(activity) : {};
  let removed = 0;

  if (dependencySet.size === 0) {
    return { activity: updatedActivity, removed };
  }

  Object.keys(DIRECT_DEPENDENCY_FIELDS).forEach((field) => {
    const result = filterDependencies(updatedActivity[field], dependencySet);
    updatedActivity[field] = result.dependencies;
    removed += result.removed;
  });

  Object.keys(DEPENDENCY_SECTION_FIELDS).forEach((field) => {
    if (!Array.isArray(updatedActivity[field])) return;

    updatedActivity[field] = updatedActivity[field].map((dependencySection) => {
      const result = filterDependencies(dependencySection?.dependencies, dependencySet);
      removed += result.removed;
      return {
        ...(dependencySection || {}),
        dependencies: result.dependencies,
      };
    });
  });

  Object.values(updatedActivity.tests || {}).forEach((test) => {
    const result = filterDependencies(test?.dependencies, dependencySet);
    test.dependencies = result.dependencies;
    removed += result.removed;
  });

  Object.values(updatedActivity.testLists || {}).forEach((testList) => {
    const dependencyResult = filterDependencies(testList?.dependencies, dependencySet);
    const rawDependsResult = filterRawDepends(testList?.depends, dependencySet);

    testList.dependencies = dependencyResult.dependencies;
    testList.depends = rawDependsResult.depends;
    removed += dependencyResult.removed + rawDependsResult.removed;
  });

  return { activity: updatedActivity, removed };
};

const removeDependenciesFromEvaluationActivities = (evaluationActivities = {}, dependencyValues = []) => {
  const updatedActivities = {};
  let removed = 0;

  Object.entries(evaluationActivities || {}).forEach(([activityUUID, activity]) => {
    const result = removeDependenciesFromEvaluationActivity(activity, dependencyValues);
    updatedActivities[activityUUID] = result.activity;
    removed += result.removed;
  });

  return { evaluationActivities: updatedActivities, removed };
};

const removeDependenciesFromManagementFunctions = (managementFunctions = {}, dependencyValues = []) => {
  const updatedManagementFunctions = deepCopy(managementFunctions || {});
  let removed = 0;

  (updatedManagementFunctions.rows || []).forEach((row) => {
    if (!row?.evaluationActivity) return;

    const result = removeDependenciesFromEvaluationActivity(row.evaluationActivity, dependencyValues);
    row.evaluationActivity = result.activity;
    removed += result.removed;
  });

  return { managementFunctions: updatedManagementFunctions, removed };
};

const refreshWorksheetEvaluationActivityCache = () => {
  const state = store.getState();
  const { sfrSections, sfrWorksheetUI } = state;
  const { openSfrWorksheet, sfrUUID, componentUUID, elementUUID, managementFunctionUI } = sfrWorksheetUI;

  if (!openSfrWorksheet || !sfrUUID || !componentUUID) return;

  const component = sfrSections?.[sfrUUID]?.[componentUUID];
  if (!component) return;

  const itemMap = {
    component: deepCopy(component),
    activities: deepCopy(component.evaluationActivities || {}),
    currentElements: deepCopy(component.elements || {}),
  };

  const element = elementUUID ? component.elements?.[elementUUID] : null;
  if (element) {
    itemMap.element = deepCopy(element);
  }

  const rowIndex = managementFunctionUI?.rowIndex;
  const row = element?.managementFunctions?.rows?.[rowIndex];
  if (row) {
    itemMap.managementFunctionUI = {
      ...deepCopy(managementFunctionUI),
      activity: deepCopy(row.evaluationActivity || managementFunctionUI.activity),
      note: deepCopy(row.note || managementFunctionUI.note),
      textArray: deepCopy(row.textArray || managementFunctionUI.textArray),
    };
  }

  store.dispatch(
    UPDATE_SFR_WORKSHEET_ITEMS({
      itemMap,
    })
  );
};

export const removeEvaluationActivityDependenciesFromSfrSections = (dependencyValues = []) => {
  const state = store.getState();
  const { sfrSections } = state;
  let removed = 0;

  Object.entries(sfrSections || {}).forEach(([sfrUUID, family]) => {
    Object.entries(family || {}).forEach(([componentUUID, component]) => {
      const evaluationActivityResult = removeDependenciesFromEvaluationActivities(component?.evaluationActivities, dependencyValues);

      if (evaluationActivityResult.removed > 0) {
        store.dispatch(
          UPDATE_SFR_COMPONENT_ITEMS({
            sfrUUID,
            uuid: componentUUID,
            itemMap: {
              evaluationActivities: evaluationActivityResult.evaluationActivities,
            },
          })
        );
        removed += evaluationActivityResult.removed;
      }

      Object.entries(component?.elements || {}).forEach(([elementUUID, element]) => {
        const managementFunctionResult = removeDependenciesFromManagementFunctions(element?.managementFunctions, dependencyValues);

        if (managementFunctionResult.removed > 0) {
          store.dispatch(
            UPDATE_SFR_SECTION_ELEMENT({
              sfrUUID,
              sectionUUID: componentUUID,
              elementUUID,
              itemMap: {
                managementFunctions: managementFunctionResult.managementFunctions,
              },
            })
          );
          removed += managementFunctionResult.removed;
        }
      });
    });
  });

  if (removed > 0) {
    refreshWorksheetEvaluationActivityCache();
  }

  return removed;
};

export const getDependencyUsageSummary = (usage = emptyUsage()) => {
  return [
    usage.tss > 0 ? `${usage.tss} TSS` : null,
    usage.guidance > 0 ? `${usage.guidance} Guidance` : null,
    usage.test > 0 ? `${usage.test} Test` : null,
    usage.testList > 0 ? `${usage.testList} Test List` : null,
  ].filter(Boolean);
};
