export const EA_SECTION_DEPENDENCY_FIELDS = {
  tss: "tssDependencies",
  guidance: "guidanceDependencies",
};

export const EA_SECTION_DEPENDENCY_SECTION_FIELDS = {
  tss: "tssDependencySections",
  guidance: "guidanceDependencySections",
};

export const EA_DEPENDENCY_MENU_PROPERTIES = ["Platforms", "Selectables", "ComplexSelectablesEA", "Features"];

export const emptyDependencyDropdown = () => ({
  Platforms: [],
  Selectables: [],
  ComplexSelectablesEA: [],
  Features: [],
});

export const getFeatureLabel = (feature) => {
  const id = feature?.id || "";
  const title = feature?.title || "";

  if (title && id) {
    return `${title} (${id})`;
  }

  return title || id;
};

export const getFeatureDependencyOptions = (features = []) => {
  const featureOptions = [];
  const featuresToID = {};
  const idToFeatures = {};

  features.forEach((feature) => {
    const label = getFeatureLabel(feature);
    const id = feature?.id || label;

    if (!label || !id) return;

    if (!featureOptions.includes(label)) {
      featureOptions.push(label);
    }

    featuresToID[label] = id;
    idToFeatures[id] = label;
  });

  featureOptions.sort();

  return {
    featureOptions,
    featuresToID,
    idToFeatures,
  };
};

export const getFeatureDependencyMap = (dependencyMap = {}, features = []) => {
  const { featuresToID, idToFeatures } = getFeatureDependencyOptions(features);

  return {
    ...(dependencyMap || {}),
    featuresToID: {
      ...(dependencyMap?.featuresToID || {}),
      ...featuresToID,
    },
    idToFeatures: {
      ...(dependencyMap?.idToFeatures || {}),
      ...idToFeatures,
    },
  };
};

export const getEvaluationActivityDependencyDropdown = ({
  selected = [],
  isManagementFunction = false,
  dependencyMap = {},
  platforms = [],
  elementMaps = {},
  features = [],
}) => {
  const dropdown = emptyDependencyDropdown();
  const isValid = selected && selected.length > 0;
  const { featureOptions } = getFeatureDependencyOptions(features);
  dropdown.Features = featureOptions;

  if ((!isManagementFunction && !isValid) || !dependencyMap) {
    return dropdown;
  }

  platforms.forEach((platform) => {
    if (platform?.name && !dropdown.Platforms.includes(platform.name)) {
      dropdown.Platforms.push(platform.name);
    }
  });
  dropdown.Platforms.sort();

  const selectedName = selected[0];
  const isComponent = elementMaps.componentName === selectedName && dependencyMap.hasOwnProperty("selectablesToUUID");

  if (isComponent) {
    dropdown.Selectables = Object.keys(dependencyMap.selectablesToUUID || {}).sort();
    return dropdown;
  }

  const selectedIsValid = elementMaps.elementNames?.includes(selectedName);
  if (selectedIsValid && dependencyMap.elementsToSelectables?.hasOwnProperty(selectedName)) {
    dropdown.Selectables = [...dependencyMap.elementsToSelectables[selectedName]].sort();
  }

  if (selectedIsValid && dependencyMap.elementsToComplexSelectables?.hasOwnProperty(selectedName)) {
    dropdown.ComplexSelectablesEA = [...dependencyMap.elementsToComplexSelectables[selectedName]].sort();
  }

  return dropdown;
};

export const getAllSfrDependencyDropdown = ({ sfrSections = {}, platforms = [] }) => {
  const dropdown = emptyDependencyDropdown();

  platforms.forEach((platform) => {
    if (platform?.name && !dropdown.Platforms.includes(platform.name)) {
      dropdown.Platforms.push(platform.name);
    }
  });

  Object.values(sfrSections || {}).forEach((family) => {
    Object.values(family || {}).forEach((component) => {
      Object.values(component?.elements || {}).forEach((element) => {
        Object.values(element?.selectables || {}).forEach((selectable) => {
          if (selectable?.assignment) return;

          const selectableName = selectable.id ? `${selectable.description} (${selectable.id})` : selectable.description;
          if (selectableName && !dropdown.Selectables.includes(selectableName)) {
            dropdown.Selectables.push(selectableName);
          }
        });

        Object.entries(element?.selectableGroups || {}).forEach(([selectableGroupID, value]) => {
          if (value?.description && !dropdown.ComplexSelectablesEA.includes(selectableGroupID)) {
            dropdown.ComplexSelectablesEA.push(selectableGroupID);
          }
        });
      });
    });
  });

  dropdown.Platforms.sort();
  dropdown.Selectables.sort();
  dropdown.ComplexSelectablesEA.sort();

  return dropdown;
};

export const getAllSfrDependencyMap = (sfrSections = {}) => {
  const dependencyMap = {
    selectablesToUUID: {},
    uuidToSelectables: {},
  };

  Object.values(sfrSections || {}).forEach((family) => {
    Object.values(family || {}).forEach((component) => {
      Object.values(component?.elements || {}).forEach((element) => {
        Object.entries(element?.selectables || {}).forEach(([selectableUUID, selectable]) => {
          if (selectable?.assignment) return;

          const selectableName = selectable.id ? `${selectable.description} (${selectable.id})` : selectable.description;
          if (selectableName) {
            dependencyMap.selectablesToUUID[selectableName] = selectableUUID;
            dependencyMap.uuidToSelectables[selectableUUID] = selectableName;
          }
        });
      });
    });
  });

  return dependencyMap;
};

export const getDropdownOptionFromDependency = (dependency, dependencyMenuOptions = {}) => {
  const dependencyValue = dependency?.valueOf();
  const dropdownValues = Object.values(dependencyMenuOptions || {}).flatMap((value) => (Array.isArray(value) ? value : []));

  return dropdownValues.find((option) => option === dependencyValue || (typeof option === "string" && option.endsWith(`(${dependencyValue})`)));
};

export const convertDependenciesToStoredIds = (dependencies = [], dependencyMap = {}) => {
  const convertedDependencies = [];

  dependencies.forEach((dependency) => {
    let newDependency = dependency;

    if (dependencyMap?.selectablesToUUID?.hasOwnProperty(dependency)) {
      newDependency = dependencyMap.selectablesToUUID[dependency];
    } else if (dependencyMap?.featuresToID?.hasOwnProperty(dependency)) {
      newDependency = dependencyMap.featuresToID[dependency];
    }

    if (newDependency && !convertedDependencies.includes(newDependency)) {
      convertedDependencies.push(newDependency);
    }
  });

  return convertedDependencies;
};

export const convertDependenciesFromStoredIds = (dependencies = [], dependencyMap = {}, dependencyMenuOptions = {}) => {
  const convertedDependencies = [];

  dependencies.forEach((dependency) => {
    let newDependency = dependency?.valueOf();

    if (dependencyMap?.uuidToSelectables?.hasOwnProperty(dependency)) {
      newDependency = dependencyMap.uuidToSelectables[dependency];
    } else if (dependencyMap?.idToFeatures?.hasOwnProperty(dependency)) {
      newDependency = dependencyMap.idToFeatures[dependency];
    } else {
      newDependency = getDropdownOptionFromDependency(dependency, dependencyMenuOptions) || newDependency;
    }

    if (newDependency && !convertedDependencies.includes(newDependency)) {
      convertedDependencies.push(newDependency);
    }
  });

  return convertedDependencies;
};

export const getValidDependencySelections = (
  selections = [],
  dependencyMenuOptions = {},
  menuProperties = EA_DEPENDENCY_MENU_PROPERTIES
) => {
  const selectionList = (Array.isArray(selections) ? selections : [selections]).filter(Boolean);
  const validSelections = [];

  selectionList.forEach((selection) => {
    const isValidSelection = menuProperties.some(
      (menuProperty) =>
        Object.prototype.hasOwnProperty.call(dependencyMenuOptions || {}, menuProperty) &&
        Array.isArray(dependencyMenuOptions[menuProperty]) &&
        dependencyMenuOptions[menuProperty].includes(selection)
    );

    if (isValidSelection && !validSelections.includes(selection)) {
      validSelections.push(selection);
    }
  });

  return validSelections;
};

export const getValidDependencyDropdownSelections = (
  dependencies = [],
  dependencyMap = {},
  dependencyMenuOptions = {},
  menuProperties = EA_DEPENDENCY_MENU_PROPERTIES
) => {
  return getValidDependencySelections(
    convertDependenciesFromStoredIds(dependencies, dependencyMap, dependencyMenuOptions),
    dependencyMenuOptions,
    menuProperties
  );
};

export const formatEvaluationActivityDependencies = (dependencies = [], selectableUUIDtoID = {}, platforms = []) => {
  return dependencies.filter(Boolean).map((dependency) => {
    if (Object.prototype.hasOwnProperty.call(selectableUUIDtoID, dependency)) {
      return {
        depends: {
          "@on": selectableUUIDtoID[dependency],
        },
      };
    }

    const platformObject = platforms.find((platform) => platform.name === dependency);
    return {
      depends: {
        [platformObject ? "@ref" : "@on"]: platformObject ? platformObject.id : dependency,
      },
    };
  });
};

export const getEvaluationActivitySectionContent = (
  content = "",
  dependencies = [],
  selectableUUIDtoID = {},
  platforms = [],
  dependencySections = []
) => {
  const formattedDependencies = formatEvaluationActivityDependencies(dependencies, selectableUUIDtoID, platforms);
  const validDependencySections = Array.isArray(dependencySections) ? dependencySections : [];

  if (validDependencySections.length === 0 && formattedDependencies.length === 0) {
    return content || "";
  }

  if (validDependencySections.length === 0) {
    return {
      div: {
        "#": [formattedDependencies, content || ""],
      },
    };
  }

  const sectionContent = [];

  if (formattedDependencies.length > 0) {
    sectionContent.push({
      div: {
        "#": [formattedDependencies, content || ""],
      },
    });
  } else if (content) {
    sectionContent.push(content);
  }

  validDependencySections.forEach((dependencySection) => {
    const sectionDependencies = Array.isArray(dependencySection?.dependencies) ? dependencySection.dependencies : [];
    const sectionText = dependencySection?.text || "";
    const formattedSectionDependencies = formatEvaluationActivityDependencies(sectionDependencies, selectableUUIDtoID, platforms);

    if (formattedSectionDependencies.length > 0) {
      sectionContent.push({
        div: {
          "#": [formattedSectionDependencies, sectionText],
        },
      });
    } else if (sectionText) {
      sectionContent.push(sectionText);
    }
  });

  if (sectionContent.length === 0) {
    return "";
  }

  return {
    "#": sectionContent,
  };
};
