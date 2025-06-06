// Imports
import { createSlice } from "@reduxjs/toolkit";
import { deepCopy } from "../../utils/deepCopy.js";
import { getComponentXmlID, getElementId, handleSnackBarError } from "../../utils/securityComponents.jsx";

const initialState = {
  openSfrWorksheet: false,
  isSfrWorksheetValid: false,
  sfrUUID: null,
  componentUUID: null,
  elementUUID: null,
  component: {},
  element: {},
  selectedSfrElement: "",
  openSfrComponent: true,
  openSfrElement: true,
  currentElements: {},
  elementXmlId: "",
  newElementUUID: null,
  deletedElement: false,

  // Management Functions
  refIdOptions: [],
  managementFunctionUI: {
    openManagementFunctionModal: false,
    openEditManagementFunctionModal: false,
    rowIndex: 0,
    activity: {
      isNoTest: false,
      noTest: "",
      introduction: "",
      tss: "",
      guidance: "",
      testIntroduction: "",
      testClosing: "",
      testLists: {},
      tests: {},
      refIds: [],
    },
    note: [],
    textArray: [],
  },

  // Tabularize
  tabularizeUI: {
    title: "",
    titleError: false,
    titleHelperText: "",
    id: "",
    idError: false,
    idHelperText: "",
    definition: [],
    componentType: "Column Header",
    selectType: "Selectables",
    row: {},
    rowDefinitions: {},
    originalRows: [],
    dropdownOptions: [],
    selectedColumn: "",
    rowIndex: -1,
    tabularizeUUIDs: [],
    currentUUID: null,
    openRowModal: false,
    openDefinitionModal: false,
    openDeleteRowsModal: false,
    deleteRowModalData: [],
    openDeleteComponentModal: false,
    deleteComponentIndex: null,
    deleteTableModal: false,
  },

  // Evaluation Activities
  activities: {},
  evaluationActivitiesUI: {
    selectedEvaluationActivity: [],
    newSelectedEvaluationActivity: [],
    selectedUUID: "",
    dependencyMap: {
      elementsToSelectables: {},
      elementsToComplexSelectables: {},
      selectablesToUUID: {},
      uuidToSelectables: {},
    },
    evaluationActivityDropdown: {
      Component: [],
      Elements: [],
    },
    newEvaluationActivityDropdown: {
      Component: [],
      Elements: [],
    },
  },

  // Maps
  elementMaps: {
    componentName: "",
    componentUUID: "",
    elementNames: [],
    elementNameMap: {},
    elementUUIDMap: {},
  },
  selectablesMap: {
    dropdownOptions: {
      assignments: [],
      complexSelectables: [],
      groups: [],
      selectables: [],
    },
    nameMap: {
      assignments: {},
      selectables: {},
    },
    uuidMap: {
      assignments: {},
      selectables: {},
    },
  },
  allSfrOptionsMap: {
    dropdownOptions: {
      components: [],
      elements: [],
      selections: [],
      useCases: [],
    },
    nameMap: {
      components: {},
      elements: {},
      selections: {},
      useCases: {},
    },
    uuidMap: {
      components: {},
      elements: {},
      selections: {},
      useCases: {},
    },
    useCaseUUID: null,
    elementSelections: {},
  },
};

export const sfrWorksheetUI = createSlice({
  name: "sfrWorksheetUI",
  initialState,
  reducers: {
    UPDATE_SFR_WORKSHEET_ITEMS: (state, action) => {
      const { itemMap } = action.payload;

      if (itemMap && Object.keys(itemMap).length > 0) {
        Object.entries(itemMap).forEach(([key, value]) => {
          if (state.hasOwnProperty(key)) {
            state[key] = value;
          }
        });
      }

      // If selectedSfrElement was updated, update selectables map
      if (itemMap.hasOwnProperty("selectedSfrElement")) {
        const { selectedSfrElement } = itemMap;

        // Update selectables map if an element has been selected
        if (selectedSfrElement) {
          const { componentUUID, component, element, elementMaps } = state;

          // Update selectables map
          updateSelectablesMap(componentUUID, component, element, selectedSfrElement, elementMaps, state);
        }
      }

      // Update sfr worksheet validation
      sfrWorksheetValidation(state, itemMap);
    },
    UPDATE_SFR_WORKSHEET_COMPONENT: (state, action) => {
      const { openSfrWorksheet, sfrUUID, componentUUID, component, activities, elementMaps, allSfrOptionsMap } = state;

      if (openSfrWorksheet) {
        const { sfrSections, newSfrOptions } = action.payload;
        const isValid = sfrUUID && componentUUID && sfrSections;
        const componentExists = sfrSections.hasOwnProperty(sfrUUID) && sfrSections[sfrUUID].hasOwnProperty(componentUUID);

        if (isValid && componentExists) {
          const newComponent = deepCopy(sfrSections[sfrUUID][componentUUID]);
          const newElementMaps = getElementMaps(componentUUID, newComponent);

          // Update the component
          if (JSON.stringify(component) !== JSON.stringify(newComponent)) {
            state.component = newComponent;

            // Generate evaluation activities
            const newEvaluationActivities = newComponent.hasOwnProperty("evaluationActivities") ? newComponent.evaluationActivities : {};
            const isNewEvaluationActivities = JSON.stringify(activities) !== JSON.stringify(newEvaluationActivities);
            if (isNewEvaluationActivities) {
              state.activities = newEvaluationActivities;
            }

            // Generate element maps
            const isNewElementMaps = JSON.stringify(elementMaps) !== JSON.stringify(newElementMaps);
            if (isNewElementMaps) {
              state.elementMaps = newElementMaps;
            }

            // Update all sfr options map
            if (JSON.stringify(allSfrOptionsMap) !== JSON.stringify(newSfrOptions)) {
              state.allSfrOptionsMap = newSfrOptions;
            }

            // Update evaluation activities ui
            const elMapsCopy = deepCopy(isNewElementMaps ? newElementMaps : elementMaps);
            const activitiesCopy = deepCopy(isNewEvaluationActivities ? newEvaluationActivities : activities);
            initializeEvaluationActivitiesUI(elMapsCopy, activitiesCopy, sfrSections, state);

            // Update the elements
            initializeElements(newComponent, newSfrOptions, elMapsCopy, state);
          }
        }

        // Update sfr worksheet validation
        const itemMap = {
          sfrSections: sfrSections,
          openSfrWorksheet: state.openSfrWorksheet,
        };
        sfrWorksheetValidation(state, itemMap);
      }
    },
    UPDATE_MANAGEMENT_FUNCTION_UI_ITEMS: (state, action) => {
      const { updateMap } = action.payload;

      updateManagementFunctionUiItems(updateMap, state);
    },
    UPDATE_TABULARIZE_UI_ITEMS: (state, action) => {
      const { itemMap, updateRow } = action.payload;

      // Update tabularize ui
      if (updateRow) {
        // Update row data
        updateEditTabularizeRowData(itemMap, state);
      } else {
        // Update ui items
        updateTabularizeUiItems(itemMap, state);
      }
    },
    TRANSFORM_TABULARIZE_DATA: (state, action) => {
      const { title = "", id = "", definition = [], rows = [], columns = [], type } = action.payload;

      // Transform definition
      if (type === "transform") {
        // Update title
        validateTitle(state, title);

        // Update id
        validateId(state, id);

        // Update definition
        state.tabularizeUI.definition = transformData(definition, rows, columns);

        // Set component Type
        state.tabularizeUI.componentType = "Column Header";
      }

      // Reverse definition
      else if (type === "reverse") {
        action.payload.tabularize = reverseData(title, id, definition);
      }
    },
    INITIALIZE_TABULARIZE_EDIT_ROW_DATA: (state, action) => {
      const { newRow, definition, originalRows } = action.payload;
      let { row } = action.payload;
      let dropdownOptions = [];
      let rowDef = {};

      // Define row definitions
      definition?.forEach((def) => {
        const { value, type } = def;
        if (type === "selectcol" || type === "textcol") {
          const field = createFieldValue(value);
          if (field) {
            // Define row if it is a new row
            if (newRow) {
              row[field] = type === "selectcol" ? [] : "";
            }

            // Set definition for cell
            rowDef[field] = type;

            // Add item to dropdown list
            const item = {
              key: field,
              value: value,
            };
            if (!dropdownOptions.includes(item)) {
              dropdownOptions.push(item);
            }
          }
        }
      });

      // Update row
      state.tabularizeUI.row = row ? row : {};

      // Update row definitions
      state.tabularizeUI.rowDefinitions = rowDef;

      // Set original rows
      state.tabularizeUI.originalRows = originalRows;

      // Define dropdown options
      state.tabularizeUI.dropdownOptions = dropdownOptions;

      // Set initialize selected column value
      state.tabularizeUI.selectedColumn = dropdownOptions && dropdownOptions.length > 0 ? dropdownOptions[0].key : "";
    },
    CREATE_TABULARIZE_FIELD_VALUE: (state, action) => {
      const { value } = action.payload;
      action.payload.field = createFieldValue(value);
    },
    UPDATE_EVALUATION_ACTIVITY_UI_ITEMS: (state, action) => {
      const { updateMap } = action.payload;

      updateEvaluationActivitiesUiItems(updateMap, state);
    },
    RESET_SFR_ELEMENT_UI: (state, action) => {
      const { allValues } = action.payload;
      resetSfrElementUI(state, allValues);
    },
    RESET_TABULARIZE_UI: (state) => {
      const { tabularizeUI } = initialState;
      state.tabularizeUI = deepCopy(tabularizeUI);
    },
    RESET_EVALUATION_ACTIVITY_UI: (state) => {
      resetEvaluationActivitiesUI(state);
    },
    RESET_SFR_WORKSHEET_UI: () => initialState,
  },
});

// Helper Methods
/**
 * This updates the states sfr worksheet validation
 * @param state the state
 * @param itemMap the item map
 */
const sfrWorksheetValidation = (state, itemMap) => {
  if (itemMap.hasOwnProperty("openSfrWorksheet") && itemMap.hasOwnProperty("sfrSections")) {
    const { sfrSections } = itemMap;
    const { openSfrWorksheet, sfrUUID, componentUUID, component } = state;
    const isSfrUUID = sfrUUID;
    const isComponentUUID = componentUUID;
    const isSfrSections = sfrSections && sfrSections.hasOwnProperty(sfrUUID) && sfrSections[sfrUUID].hasOwnProperty(componentUUID);
    const isComponent = component !== null && component !== undefined && Object.keys(component).length > 0;

    // Validation for opening the sfr worksheet
    const isValid = openSfrWorksheet && isSfrUUID && isComponentUUID && isSfrSections && isComponent;

    if (isValid) {
      state.isSfrWorksheetValid = true;
    } else {
      state.isSfrWorksheetValid = false;
    }
  }
};
/**
 * Initializes the elements
 * @param newComponent the new component
 * @param newSfrOptions the new sfr options
 * @param elementMaps the element maps
 * @param state the state
 */
const initializeElements = (newComponent, newSfrOptions, elementMaps, state) => {
  const { componentUUID, elementUUID, element, currentElements, selectedSfrElement } = state;

  // Update the elements
  if (newComponent.hasOwnProperty("elements")) {
    const newElements = deepCopy(newComponent.elements);

    // Update the current elements
    if (JSON.stringify(currentElements) !== JSON.stringify(newElements)) {
      state.currentElements = newElements;
    }

    // Update the element in the state
    if (elementUUID && newElements.hasOwnProperty(elementUUID)) {
      const newElement = deepCopy(newComponent.elements[elementUUID]);
      const isNewElement = JSON.stringify(element) !== JSON.stringify(newElement);

      // Update the selected sfr element
      if (
        newSfrOptions.hasOwnProperty("uuidMap") &&
        newSfrOptions.uuidMap.hasOwnProperty("elements") &&
        newSfrOptions.uuidMap.elements.hasOwnProperty(elementUUID)
      ) {
        const newSelectedSfrElement = newSfrOptions.uuidMap.elements[elementUUID].toUpperCase();
        const isNewSelectedSfr = JSON.stringify(selectedSfrElement) !== JSON.stringify(newSelectedSfrElement);
        const selected = isNewSelectedSfr ? newSelectedSfrElement : selectedSfrElement;

        // Update selected sfr element
        if (isNewSelectedSfr) {
          state.selectedSfrElement = newSelectedSfrElement;
        }

        // Update selectables map
        const getElement = deepCopy(isNewElement ? newElement : element);
        updateSelectablesMap(componentUUID, newComponent, getElement, selected, elementMaps, state);
      } else {
        resetSfrElementUI(state);
      }

      // Update the selected element
      if (isNewElement) {
        // Initialize management functions
        initializeManagementFunctions(newElement, state);

        // Update element
        state.element = newElement;
      }
    } else {
      // Clear the sfr element ui storage
      resetSfrElementUI(state);
    }
  } else {
    // Clear the sfr element ui storage
    resetSfrElementUI(state);
  }
};
/**
 * Resets the sfr element ui
 * @param state the state
 * @param allValues the is all values boolean
 */
const resetSfrElementUI = (state, allValues = false) => {
  const {
    elementUUID,
    element,
    selectedSfrElement,
    elementXmlId,
    newElementUUID,
    deletedElement,
    refIdOptions,
    managementFunctionUI,
    tabularizeUI,
    selectablesMap,
  } = initialState;
  state.elementUUID = elementUUID;
  state.element = element;
  state.selectedSfrElement = selectedSfrElement;
  state.elementXmlId = elementXmlId;
  state.refIdOptions = refIdOptions;
  state.managementFunctionUI = deepCopy(managementFunctionUI);
  state.tabularizeUI = deepCopy(tabularizeUI);
  state.selectablesMap = deepCopy(selectablesMap);

  if (allValues) {
    state.newElementUUID = newElementUUID;
    state.deletedElement = deletedElement;
  }
};

// Management Function Helper Methods
/**
 * Updates the management function ui items
 * @param updateMap the update map
 * @param state the state
 */
const updateManagementFunctionUiItems = (updateMap, state) => {
  // Updates the evaluation activity ui
  Object.entries(updateMap).map(([key, value]) => {
    state.managementFunctionUI[key] = value;
  });

  // Initialize management function activities
  if (updateMap.hasOwnProperty("openEditManagementFunctionModal")) {
    if (updateMap.openEditManagementFunctionModal && state.element && Object.keys(state.element).length > 0) {
      initializeManagementFunctions(state.element, state);
    } else {
      resetManagementFunctionUI(state, true);
    }
  }
};
/**
 * Initializes the management functions and management functions ui
 * @param newElement the new element
 * @param state the state
 */
const initializeManagementFunctions = (newElement, state) => {
  // Update the management function activities
  const { rowIndex, openEditManagementFunctionModal, activity, note, textArray } = state.managementFunctionUI;
  let currentManagementFunctions = newElement.managementFunctions;

  if (openEditManagementFunctionModal && rowIndex > -1) {
    // Update the management functions ui
    if (currentManagementFunctions.hasOwnProperty("rows") && currentManagementFunctions.rows.length > 0 && currentManagementFunctions.rows[rowIndex]) {
      let row = currentManagementFunctions.rows[rowIndex];

      // Generate new ea if it does not exist
      if (!row.hasOwnProperty("evaluationActivity")) {
        row.evaluationActivity = {
          isNoTest: false,
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
      }

      // Generate new note if it does not exist
      if (!row.hasOwnProperty("note")) {
        row.note = [];
      }

      // Generate new text array if it does not exist
      if (!row.hasOwnProperty("textArray")) {
        row.textArray = [];
      }

      // Update management function activity
      if (JSON.stringify(activity) !== JSON.stringify(row.evaluationActivity)) {
        state.managementFunctionUI.activity = deepCopy(row.evaluationActivity);
      }

      // Update management function note
      if (JSON.stringify(note) !== JSON.stringify(row.note)) {
        state.managementFunctionUI.note = deepCopy(row.note);
      }

      // Update management function text array
      if (JSON.stringify(textArray) !== JSON.stringify(row.textArray)) {
        state.managementFunctionUI.textArray = deepCopy(row.textArray);
      }
    }
  } else {
    resetManagementFunctionUI(state, true);
  }

  // Generate the ref id options
  if (newElement.hasOwnProperty("isManagementFunction") && newElement.isManagementFunction) {
    const { refIdOptions } = state;
    const newRefIdOptions = generateRefIdOptions(deepCopy(currentManagementFunctions.rows));

    if (JSON.stringify(refIdOptions) !== JSON.stringify(newRefIdOptions)) {
      state.refIdOptions = newRefIdOptions;
    }
  } else {
    state.refIdOptions = [];
  }
};
/**
 * Resets the management function ui
 * @param state the state
 * @param notAllValues not all values boolean
 */
const resetManagementFunctionUI = (state, notAllValues) => {
  const { managementFunctionUI } = initialState;

  if (notAllValues) {
    const { rowIndex, activity, note, textArray } = managementFunctionUI;
    state.managementFunctionUI.rowIndex = rowIndex;
    state.managementFunctionUI.activity = deepCopy(activity);
    state.managementFunctionUI.note = deepCopy(note);
    state.managementFunctionUI.textArray = deepCopy(textArray);
  } else {
    state.managementFunctionUI = deepCopy(managementFunctionUI);
  }
};
/**
 * Generates the ref id options
 * @param rows the rows
 * @returns {*}
 */
const generateRefIdOptions = (rows) => {
  return (
    rows
      // Extract all IDs
      .map((row, index) => ({
        key: index,
        label: row.id,
        disabled: false,
      }))
      .sort((a, b) => {
        const lowerA = a.label.toLowerCase();
        const lowerB = b.label.toLowerCase();

        if (lowerA < lowerB) {
          return -1;
        }
        if (lowerA > lowerB) {
          return 1;
        }
        return 0;
      })
  );
};

// Tabularize Helper Methods
/**
 * Updates the tabularize ui items
 * @param updateMap the item map
 * @param state the state
 */
const updateTabularizeUiItems = (itemMap, state) => {
  // Updates the tabularize ui
  Object.entries(itemMap).map(([key, value]) => {
    if (key === "title") {
      const title = value ? value : "";
      validateTitle(state, title);
    } else if (key === "id") {
      const id = value ? value : "";
      validateId(state, id);
    } else if (key === "definition") {
      state.tabularizeUI[key] = value;
      let currentDefinition = value ? deepCopy(value) : [];
      state.tabularizeUI.definition = validateDefinition(currentDefinition);
    } else {
      state.tabularizeUI[key] = value;
    }
  });
};
/**
 * Updates the edit tabularzie row data
 * @param itemMap the item map
 * @param state the state
 */
const updateEditTabularizeRowData = (itemMap, state) => {
  const { key, value } = itemMap;

  // Update the row value
  if (state.tabularizeUI.row.hasOwnProperty(key)) {
    state.tabularizeUI.row[key] = value;
  }
};
/**
 * Transforms the tabularize data
 * @param definition the definition
 * @param rows the rows
 * @param columns the columns
 * @returns {*}
 */
const transformData = (definition, rows, columns) => {
  let transformedDefinition = [
    {
      value: "Selectable ID",
      type: "textcol",
      field: "selectableId",
      column: {
        editable: false,
        resizable: true,
        type: "Editor",
        flex: 3,
      },
      rows: [],
      selectDisabled: false,
      error: false,
      helperText: "",
    },
  ];

  // Transform definition if it is not empty
  if (definition.length > 0) {
    // Create a map of columns for quick access
    const columnMap = columns.reduce((acc, column) => {
      acc[column.field] = column;
      return acc;
    }, {});

    // Transform the definition
    transformedDefinition = definition.map((def) => {
      if (def.type === "reqtext") {
        return {
          ...def,
        };
      } else {
        const field = createFieldValue(def.value);
        const column = columnMap[field];

        return {
          ...def,
          field: field,
          column: column
            ? {
                editable: column.editable,
                resizable: column.resizable,
                type: column.type,
                flex: column.flex,
              }
            : {},
          rows: rows?.map((row) => {
            const value = row[field];
            if (Array.isArray(value)) {
              return { value: deepCopy(value) };
            }
            return { value };
          }),
          selectDisabled: rows && rows.length > 0 ? true : false,
        };
      }
    });
  }

  return validateDefinition(transformedDefinition);
};
/**
 * Reverses the tabularize data
 * @param title the title
 * @param id the id
 * @param definition the definition
 * @returns {{columns: *[], definition: *[], id, title, rows: *[]}}
 */
const reverseData = (title, id, definition) => {
  let newDefinition = [];
  let newColumns = [];
  let newRows = [];

  if (definition && definition.length > 0) {
    let currentDefinition = deepCopy(definition);

    newDefinition = currentDefinition.map((def) => {
      const { value, field, type, column, rows } = def;

      // Generate column data and add to columns
      if (column && Object.keys(column).length > 0) {
        const newColumn = {
          headerName: value,
          field: field,
          ...column,
        };
        newColumns.push(newColumn);
      }

      // Generate row data and add to rows
      if (rows && rows.length > 0) {
        rows.forEach((row, index) => {
          const { value } = row;
          if (!newRows[index]) {
            newRows.push({});
          }
          newRows[index][field] = value;
        });
      }

      // Return def
      return {
        value,
        type,
      };
    });
  }

  return {
    title: title,
    id: id,
    definition: newDefinition,
    rows: newRows,
    columns: newColumns,
  };
};
/**
 * Validates the tabularize definition
 * @param currentDefinition the current definition
 * @returns {*}
 */
const validateDefinition = (currentDefinition) => {
  const validation = currentDefinition.map((def, index) => {
    const { value, type } = def;
    const valueExists = currentDefinition.filter(
      (x, filterIndex) => filterIndex !== index && x.type !== "reqtext" && type !== "reqtext" && x.value.toLowerCase() === value.toLowerCase()
    );

    // Validate
    const { error, helperText } = getValidation(value, valueExists);
    def.error = error;
    def.helperText = helperText;

    return def;
  });
  return validation;
};
/**
 * Validates the tabularize title
 * @param state the state
 * @param title the title
 */
const validateTitle = (state, title) => {
  const { error: titleError, helperText: titleHelperText } = getValidation(title);

  // Update the tabularize ui object
  Object.assign(state.tabularizeUI, {
    title,
    titleError,
    titleHelperText,
  });
};
/**
 * Validates the tabularize id
 * @param state the state
 * @param id the id
 */
const validateId = (state, id) => {
  const { error: idError, helperText: idHelperText } = getValidation(id);

  // Update the tabularize ui object
  Object.assign(state.tabularizeUI, {
    id,
    idError,
    idHelperText,
  });
};
/**
 * Gets the tabularize validation
 * @param value the value
 * @param valueExists the boolean if value exists
 * @returns {{error: boolean, helperText: string}}
 */
const getValidation = (value, valueExists) => {
  let error = false;
  let helperText = "";

  // Check for input values
  if (value === null || value === undefined || value === "") {
    error = true;
    helperText = "Field required";
  }

  // Check if value exists
  else if (valueExists && valueExists.length > 0) {
    error = true;
    helperText = "Field already exists";
  }

  return { error, helperText };
};
/**
 * Creates the tabularize field value
 * @param originalString the original string
 * @returns {string}
 */
const createFieldValue = (originalString) => {
  // Update the field value to be camel case
  if (originalString === null || originalString === undefined || originalString === "") {
    return "";
  } else if (originalString === "Selectable ID") {
    return "selectableId";
  } else {
    return originalString
      .toLowerCase()
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join("");
  }
};

// Evaluation Activity Helper Methods
/**
 * Updates the evaluation activities ui items
 * @param updateMap the update map
 * @param state the state
 */
const updateEvaluationActivitiesUiItems = (updateMap, state) => {
  // Updates the evaluation activity ui
  Object.entries(updateMap).map(([key, value]) => {
    state.evaluationActivitiesUI[key] = value;
  });
};
/**
 * Initializes the evaluation activities ui
 * @param elementMaps the element maps
 * @param activities the activities
 * @param sfrSections the sfr sections
 * @param state the state
 */
const initializeEvaluationActivitiesUI = (elementMaps, activities, sfrSections, state) => {
  let updateMap = {};
  const { sfrUUID, componentUUID, evaluationActivitiesUI } = state;
  const { selectedEvaluationActivity, selectedUUID, dependencyMap, evaluationActivityDropdown, newEvaluationActivityDropdown } = evaluationActivitiesUI;
  let mainDropdown = {
    Component: [],
    Elements: [],
  };
  let newDropdown = {
    Component: [],
    Elements: [],
  };

  // Run through activities and add to main dropdown
  if (activities) {
    Object.keys(activities).forEach((uuid) => {
      // Add components to dropdown
      if (elementMaps.componentUUID === uuid && !mainDropdown.Component.includes(elementMaps.componentName)) {
        mainDropdown.Component.push(elementMaps.componentName);
      } else if (elementMaps.elementUUIDMap.hasOwnProperty(uuid)) {
        let name = elementMaps.elementUUIDMap[uuid];
        if (!mainDropdown.Elements.includes(name)) {
          mainDropdown.Elements.push(name);
        }
      }
    });
    sfrElementSort(mainDropdown.Elements);
  }

  // Run through remaining components/elements and add to new evaluation activity dropdown options
  if (!mainDropdown.Component.includes(elementMaps.componentName) && !newDropdown.Component.includes(elementMaps.componentName)) {
    newDropdown.Component.push(elementMaps.componentName);
  }
  elementMaps.elementNames.forEach((name) => {
    if (!mainDropdown.Elements.includes(name) && !newDropdown.Elements.includes(name)) {
      newDropdown.Elements.push(name);
    }
  });
  sfrElementSort(newDropdown.Elements);

  // Generate main dropdown
  if (mainDropdown && JSON.stringify(evaluationActivityDropdown) !== JSON.stringify(mainDropdown)) {
    updateMap.evaluationActivityDropdown = mainDropdown;

    // Get newly selected if the name was changed
    if (selectedUUID) {
      if (selectedEvaluationActivity && selectedEvaluationActivity.length > 0) {
        const selectedEa = selectedEvaluationActivity[0];
        const componentUUID = elementMaps.componentUUID;
        const componentName = elementMaps.componentName;
        const elementUUIDMap = elementMaps.elementUUIDMap;

        // Update selected evaluation activity to the component, or element uuid, or clear it out
        if (selectedUUID === componentUUID && selectedEa !== componentName) {
          updateMap.selectedEvaluationActivity = [componentName];
        } else if (elementUUIDMap.hasOwnProperty(selectedUUID) && elementUUIDMap[selectedUUID] !== selectedEa) {
          updateMap.selectedEvaluationActivity = [elementUUIDMap[selectedUUID]];
        } else if (selectedUUID !== componentUUID && !elementUUIDMap.hasOwnProperty(selectedUUID)) {
          updateMap.selectedUUID = "";
          updateMap.selectedEvaluationActivity = [];
        }
      }
    }
  }

  // Generate new dropdown
  if (newDropdown && JSON.stringify(newEvaluationActivityDropdown) !== JSON.stringify(newDropdown)) {
    updateMap.newEvaluationActivityDropdown = newDropdown;
    updateMap.newSelectedEvaluationActivity = [];
  }

  // Generate dependency map
  const newDependencyMap = getDependencyMap(sfrUUID, componentUUID, sfrSections, elementMaps);
  if (newDependencyMap && JSON.stringify(dependencyMap) !== JSON.stringify(newDependencyMap)) {
    updateMap.dependencyMap = newDependencyMap;
  }

  // Update the evaluation activity ui items
  updateEvaluationActivitiesUiItems(updateMap, state);
};
/**
 * Sorts the sfr elements
 * @param sfrArray the sfr array
 */
const sfrElementSort = (sfrArray) => {
  // Sort the SFR elements in ascending order
  sfrArray.sort((a, b) => {
    const getLastNumber = (str) => parseInt(str.substring(str.lastIndexOf(".") + 1), 10);
    return getLastNumber(a) - getLastNumber(b);
  });
};
/**
 * Resets the evaluation activities ui
 * @param state the state
 */
const resetEvaluationActivitiesUI = (state) => {
  const { evaluationActivitiesUI } = initialState;
  state.evaluationActivitiesUI = deepCopy(evaluationActivitiesUI);
};

// Map Helper Methods
/**
 * Gets the element maps
 * @param componentUUID the component UUID
 * @param component the component
 * @returns {{elementNames: *[], elementNameMap: {}, componentName: *, elementUUIDMap: {}, componentUUID}}
 */
const getElementMaps = (componentUUID, component) => {
  let { cc_id, iteration_id, elements } = component;
  elements = elements ? deepCopy(elements) : {};
  let { formattedCcId, formattedIterationId, componentXmlId } = getComponentXmlID(cc_id, iteration_id, true, true);
  let elementMap = {
    componentName: componentXmlId,
    componentUUID: componentUUID,
    elementNames: [],
    elementNameMap: {},
    elementUUIDMap: {},
  };

  // Generate the element map
  if (elements && Object.entries(elements).length > 0) {
    Object.keys(elements).forEach((key, index) => {
      let name = getElementId(formattedCcId, formattedIterationId, index, false);
      if (!elementMap.elementNames.includes(name)) {
        elementMap.elementNames.push(name);
        elementMap.elementNameMap[name] = key;
        elementMap.elementUUIDMap[key] = name;
      }
    });
  }
  elementMap.elementNames.sort();
  return elementMap;
};
/**
 * Gets the selectable maps
 * @param componentUUID the component uuid
 * @param component the component
 * @param element the element to get the selectable map from
 * @returns {{dropdownOptions: {assignments: *[], complexSelectables: *[], selectables: *[], groups: *[]}, nameMap: {assignments: {}, selectables: {}}, uuidMap: {assignments: {}, selectables: {}}}}
 */
const getSelectablesMaps = (componentUUID, component, element) => {
  let selectablesMap = {
    dropdownOptions: {
      assignments: [],
      complexSelectables: [],
      groups: [],
      selectables: [],
    },
    nameMap: {
      assignments: {},
      selectables: {},
    },
    uuidMap: {
      assignments: {},
      selectables: {},
    },
  };

  try {
    let currentElement = element !== undefined && element !== null ? deepCopy(element) : {};

    // Get selectable and assignment data
    if (currentElement && currentElement.hasOwnProperty("selectables")) {
      Object.entries(currentElement.selectables).forEach(([selectableUUID, selectable]) => {
        let selectableName = selectable.id ? `${selectable.description} (${selectable.id})` : selectable.description;
        let isAssignment = selectable.assignment ? true : false;

        if (isAssignment) {
          if (!selectablesMap.dropdownOptions.assignments.includes(selectableName)) {
            selectablesMap.dropdownOptions.assignments.push(selectableName);
            selectablesMap.nameMap.assignments[selectableName] = selectableUUID;
            selectablesMap.uuidMap.assignments[selectableUUID] = selectableName;
          }
        } else {
          if (!selectablesMap.dropdownOptions.selectables.includes(selectableName)) {
            selectablesMap.dropdownOptions.selectables.push(selectableName);
            selectablesMap.nameMap.selectables[selectableName] = selectableUUID;
            selectablesMap.uuidMap.selectables[selectableUUID] = selectableName;
          }
        }
      });
    }

    // Get selectable and assignment data
    if (currentElement && currentElement.hasOwnProperty("selectableGroups")) {
      Object.entries(currentElement.selectableGroups).forEach(([group, value]) => {
        if (value.hasOwnProperty("groups")) {
          if (!selectablesMap.dropdownOptions.groups.includes(group)) {
            selectablesMap.dropdownOptions.groups.push(group);
          }
        } else if (value.hasOwnProperty("description")) {
          if (!selectablesMap.dropdownOptions.complexSelectables.includes(group)) {
            selectablesMap.dropdownOptions.complexSelectables.push(group);
          }
        }
      });
    }

    // Sort drop down menu options
    const { selectables, assignments, groups, complexSelectables } = selectablesMap.dropdownOptions;
    selectablesMap.dropdownOptions = {
      selectables: sortDropdown(selectables),
      assignments: sortDropdown(assignments),
      groups: sortDropdown(groups),
      complexSelectables: sortDropdown(complexSelectables),
    };
  } catch (e) {
    console.log(e);
    handleSnackBarError(e);
  }

  return selectablesMap;
};
/**
 * Sorts the dropdown
 * @param dropdown the dropdown to sort
 * @returns {*}
 */
const sortDropdown = (dropdown) => {
  return dropdown.sort((a, b) => {
    const aMatch = a.match(/group-(\d+)/);
    const bMatch = b.match(/group-(\d+)/);

    // If both strings have a numeric part, compare them numerically
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }

    // If one of the strings doesn't have a numeric part, keep it at the end
    if (aMatch) return -1;
    if (bMatch) return 1;

    // If neither string has a numeric part, compare them lexicographically
    return a.localeCompare(b);
  });
};
/**
 * Gets the dependency map for the evaluation activity ui
 * @param sfrUUID the sfr uuid
 * @param componentUUID the component uuid
 * @param sfrSections the sfr sections
 * @param elementMaps the element maps
 * @returns {{elementsToComplexSelectables: {}, elementsToSelectables: {}, selectablesToUUID: {}, uuidToSelectables: {}}}
 */
const getDependencyMap = (sfrUUID, componentUUID, sfrSections, elementMaps) => {
  let dependencies = {
    elementsToSelectables: {},
    elementsToComplexSelectables: {},
    selectablesToUUID: {},
    uuidToSelectables: {},
  };

  // Create dependency map
  if (
    sfrSections.hasOwnProperty(sfrUUID) &&
    sfrSections[sfrUUID].hasOwnProperty(componentUUID) &&
    sfrSections[sfrUUID][componentUUID].hasOwnProperty("elements")
  ) {
    let elements = deepCopy(sfrSections[sfrUUID][componentUUID].elements);
    if (elements && Object.entries(elements).length > 0) {
      Object.entries(elements).forEach(([uuid, element]) => {
        if (elementMaps.elementUUIDMap.hasOwnProperty(uuid)) {
          let name = elementMaps.elementUUIDMap[uuid];

          // Get selectables
          let selectableArray = [];
          if (element.hasOwnProperty("selectables")) {
            let selectables = deepCopy(element.selectables);
            if (selectables && Object.entries(selectables).length > 0) {
              Object.entries(selectables).forEach(([selectableUUID, selectable]) => {
                let isAssignment = selectable.assignment ? true : false;
                if (!isAssignment) {
                  let selectableName = selectable.id ? `${selectable.description} (${selectable.id})` : selectable.description;
                  dependencies.selectablesToUUID[selectableName] = selectableUUID;
                  dependencies.uuidToSelectables[selectableUUID] = selectableName;
                  if (!selectableArray.includes(selectableName)) {
                    selectableArray.push(selectableName);
                  }
                }
              });
              selectableArray.sort();
              dependencies.elementsToSelectables[name] = selectableArray;
            }
          }

          // Get complex selectables
          let complexSelectableArray = [];
          if (element.hasOwnProperty("selectableGroups")) {
            let selectableGroups = deepCopy(element.selectableGroups);
            if (selectableGroups && Object.entries(selectableGroups).length > 0) {
              Object.entries(selectableGroups).forEach(([selectableGroupID, value]) => {
                let isComplexSelectable = value.hasOwnProperty("description") ? true : false;
                if (isComplexSelectable) {
                  if (!complexSelectableArray.includes(selectableGroupID)) {
                    complexSelectableArray.push(selectableGroupID);
                  }
                }
              });
              complexSelectableArray.sort();
              dependencies.elementsToComplexSelectables[name] = complexSelectableArray;
            }
          }
        }
      });
    }
  }
  return dependencies;
};
/**
 * Updates the selectables map
 * @param componentUUID the component uuid
 * @param component the component
 * @param element the element
 * @param selectedSfrElement the selected sfr element
 * @param elementMaps the element maps
 * @param state the state
 */
const updateSelectablesMap = (componentUUID, component, element, selectedSfrElement, elementMaps, state) => {
  const newSelectableOptions = deepCopy(getSelectablesMaps(componentUUID, component, element));
  const { selectablesMap } = state;

  // Update selectables map
  if (JSON.stringify(selectablesMap) !== JSON.stringify(newSelectableOptions)) {
    state.selectablesMap = newSelectableOptions;
  }
};

// Action creators are generated for each case reducer function
export const {
  UPDATE_SFR_WORKSHEET_ITEMS,
  UPDATE_SFR_WORKSHEET_COMPONENT,
  UPDATE_MANAGEMENT_FUNCTION_UI_ITEMS,
  UPDATE_TABULARIZE_UI_ITEMS,
  TRANSFORM_TABULARIZE_DATA,
  INITIALIZE_TABULARIZE_EDIT_ROW_DATA,
  CREATE_TABULARIZE_FIELD_VALUE,
  UPDATE_EVALUATION_ACTIVITY_UI_ITEMS,
  RESET_SFR_ELEMENT_UI,
  RESET_TABULARIZE_UI,
  RESET_EVALUATION_ACTIVITY_UI,
  RESET_SFR_WORKSHEET_UI,
} = sfrWorksheetUI.actions;

export default sfrWorksheetUI.reducer;
