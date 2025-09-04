// Imports
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { deepCopy } from "../../utils/deepCopy.js";

// Constants
const sfrComponentDefault = {
  title: "",
  cc_id: "",
  iteration_id: "",
  xml_id: "",
  definition: "",
  optional: false,
  objective: false,
  selectionBased: false,
  selections: {},
  useCaseBased: false,
  useCases: [],
  implementationDependent: false,
  reasons: [],
  tableOpen: false,
  objectives: [],
  extendedComponentDefinition: {
    toggle: false,
    audit: "",
    managementFunction: "",
    componentLeveling: "",
    dependencies: "",
  },
  auditEvents: {},
  open: false,
  elements: {},
  invisible: false,
  evaluationActivities: {},
  modifiedSfr: false,
  additionalSfr: false,
  consistencyRationale: "",
  xPathDetails: {},
  sfrType: "",
};
export const defaultModifiedSfrComponent = {
  fromPkgData: {
    name: "",
    short: "",
    version: "",
    git: {
      url: "",
      branch: "",
      open: true,
    },
    toggle: false,
    open: false,
  },
};

// Initial State
const initialState = {};

export const sfrSectionSlice = createSlice({
  name: "sfrSections",
  initialState,
  reducers: {
    CREATE_SFR_SECTION_SLICE: (state, action) => {
      let sfrUUID = action.payload.sfrUUID ? action.payload.sfrUUID : uuidv4();
      if (!state.hasOwnProperty(sfrUUID)) {
        state[sfrUUID] = {};
      }
    },
    DELETE_SFR_SECTION: (state, action) => {
      let sfrUUID = action.payload.sfrUUID;
      if (state.hasOwnProperty(sfrUUID)) {
        delete state[sfrUUID];
      }
    },
    CREATE_SFR_COMPONENT: (state, action) => {
      const { sfrUUID: familyUUID, component } = action.payload;
      const defaultSfr = deepCopy(sfrComponentDefault);
      const defaultModifiedSfr = deepCopy(defaultModifiedSfrComponent);

      // Generate a unique ID for the component if not provided
      const sfrCompUUID = component?.sfrCompUUID || uuidv4();

      // Check that the family ID is valid and generate new component
      if (familyUUID) {
        if (!state.hasOwnProperty(familyUUID)) {
          state[familyUUID] = {};
        }

        // Create component
        let newComponent = {
          title: component?.title || defaultSfr.title,
          cc_id: component?.cc_id || defaultSfr.cc_id,
          iteration_id: component?.iteration_id || defaultSfr.iteration_id,
          xml_id: component?.xml_id || defaultSfr.xml_id,
          definition: component?.definition || defaultSfr.definition,
          optional: component?.optional || defaultSfr.optional,
          objective: component?.objective || defaultSfr.objective,
          selectionBased: component?.selectionBased || defaultSfr.selectionBased,
          selections: component?.selections || defaultSfr.selections,
          useCaseBased: component?.useCaseBased || defaultSfr.useCaseBased,
          useCases: component?.useCases || defaultSfr.useCases,
          implementationDependent: component?.implementationDependent || defaultSfr.implementationDependent,
          reasons: component?.reasons || defaultSfr.reasons,
          tableOpen: component?.tableOpen || defaultSfr.tableOpen,
          objectives: component?.objectives || defaultSfr.objectives,
          extendedComponentDefinition: component?.extendedComponentDefinition || defaultSfr.extendedComponentDefinition,
          auditEvents: component?.auditEvents || defaultSfr.auditEvents,
          open: component?.open || defaultSfr.open,
          elements: component?.elements || defaultSfr.elements,
          invisible: component?.invisible || defaultSfr.invisible,
          evaluationActivities: component?.evaluationActivities || defaultSfr.evaluationActivities,
          modifiedSfr: component?.modifiedSfr || defaultSfr.modifiedSfr,
          additionalSfr: component?.additionalSfr || defaultSfr.additionalSfr,
          consistencyRationale: component?.consistencyRationale || defaultSfr.consistencyRationale,
          notNew: component?.notNew,
          xPathDetails: component?.xPathDetails || defaultSfr.xPathDetails,
          classDescription: component?.classDescription,
          sfrType: component?.sfrType || defaultSfr.sfrType,
        };

        // Adjust component if it is a modified sfr
        if (newComponent.modifiedSfr) {
          // Add modified sfr specific objects
          newComponent.fromPkgData = component?.fromPkgData || defaultModifiedSfr.fromPkgData;

          // Remove extended component
          delete newComponent.extendedComponentDefinition;
        }

        // Add the new component to the state
        state[familyUUID][sfrCompUUID] = newComponent;
      }

      // Attach the generated UUID to the action payload
      action.payload.id = sfrCompUUID;
    },
    UPDATE_SFR_COMPONENT_ITEMS: (state, action) => {
      const { sfrUUID, uuid, itemMap } = action.payload;
      let sfrSection = state[sfrUUID][uuid];
      if (sfrSection && Object.entries(itemMap).length > 0) {
        Object.entries(itemMap).map(([key, updatedValue]) => {
          if (key !== "element" && JSON.stringify(sfrSection[key]) !== JSON.stringify(updatedValue)) {
            sfrSection[key] = updatedValue;
          }
        });
      }
    },
    UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES: (state, action) => {
      const { sfrUUID, uuid, eAUUID, selectionMap } = action.payload;
      const sfrSection = state[sfrUUID][uuid];
      const tests = sfrSection.evaluationActivities[eAUUID].tests;

      Object.values(tests).forEach((test) => {
        if (Array.isArray(test.dependencies)) {
          // Convert each dependency to UUID using the selectionMap
          test.dependencies = test.dependencies.map((dep) => {
            return selectionMap[dep] || dep; // fall back to original if no mapping exists
          });
        }
      });
    },
    DELETE_SFR_COMPONENT: (state, action) => {
      let sfrUUID = action.payload.sfrUUID;
      let uuid = action.payload.uuid;
      if (state[sfrUUID][uuid]) {
        delete state[sfrUUID][uuid];
      }
    },
    CREATE_SFR_SECTION_ELEMENT: (state, action) => {
      const { sfrUUID, sectionUUID, element } = action.payload;
      const elementUUID = uuidv4();
      let sfrSection = state[sfrUUID][sectionUUID];
      if (sfrSection) {
        sfrSection.elements[elementUUID] = {
          elementXMLID: element && element.elementXMLID ? element.elementXMLID : "",
          isManagementFunction: element && element.isManagementFunction ? element.isManagementFunction : false,
          managementFunctions: element && element.managementFunctions ? element.managementFunctions : {},
          selectables: element && element.selectables ? element.selectables : {},
          selectableGroups: element && element.selectableGroups ? element.selectableGroups : {},
          title: element && element.title ? element.title : [],
          note: element && element.note ? element.note : "",
          open: element && element.open ? element.open : false,
        };
      }
      action.payload.uuid = elementUUID;
    },
    UPDATE_SFR_SECTION_ELEMENT: (state, action) => {
      const { sfrUUID, sectionUUID, elementUUID, itemMap } = action.payload;
      const sfrSection = state[sfrUUID][sectionUUID];
      let elementSection = sfrSection.elements[elementUUID];
      if (sfrSection && elementSection && Object.entries(itemMap).length > 0) {
        Object.entries(itemMap).map(([key, updatedValue]) => {
          if (JSON.stringify(elementSection[key]) !== JSON.stringify(updatedValue)) {
            elementSection[key] = updatedValue;
          }
        });
      }
    },
    UPDATE_SFR_SECTION_ELEMENT_SELECTABLE: (state, action) => {
      try {
        const { sfrUUID, componentUUID, elementUUID, selectableUUID, itemMap } = action.payload;
        let selectable = state[sfrUUID][componentUUID].elements[elementUUID].selectables[selectableUUID];

        // Update selectable
        if (selectable) {
          Object.entries(itemMap).map(([key, updatedValue]) => {
            selectable[key] = updatedValue;
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    DELETE_SFR_SECTION_ELEMENT: (state, action) => {
      const { sfrUUID, sectionUUID, elementUUID } = action.payload;
      let elements = state[sfrUUID][sectionUUID].elements;
      if (elements && elements.hasOwnProperty(elementUUID)) {
        delete elements[elementUUID];
      }
    },
    DELETE_ALL_SFR_SECTION_ELEMENTS: (state) => {
      Object.entries(state).map(([key, value]) => {
        delete state[key];
      });
    },
    ADD_SFR_TERM_OBJECTIVE: (state, action) => {
      const { sfrUUID, uuid, objectiveUUID, title } = action.payload;
      const sfrSection = state[sfrUUID][uuid];
      const rationale = action.payload.rationale ? action.payload.rationale : "";
      const entryExists = state.hasOwnProperty(sfrUUID) && sfrSection && sfrSection.title === title;
      if (entryExists) {
        let uuidExists = false;
        sfrSection.objectives.map((objective) => {
          if (objective.uuid === objectiveUUID) {
            uuidExists = true;
          }
        });
        if (!uuidExists) {
          sfrSection.objectives.push({ uuid: objectiveUUID, rationale: rationale });
        }
      }
    },
    UPDATE_SFR_TERM_OBJECTIVE_RATIONALE: (state, action) => {
      const { sfrUUID, uuid, objectiveUUID, newRationale } = action.payload;
      let sfrSection = state[sfrUUID][uuid];
      if (state.hasOwnProperty(sfrUUID) && sfrSection) {
        sfrSection.objectives.map((objective) => {
          if (objective.uuid === objectiveUUID) {
            objective.rationale = newRationale;
          }
        });
      }
    },
    DELETE_SFR_TERM_OBJECTIVE: (state, action) => {
      const { sfrUUID, uuid, objectiveUUID } = action.payload;
      let sfrSection = state[sfrUUID][uuid];
      if (state.hasOwnProperty(sfrUUID) && sfrSection) {
        sfrSection.objectives.map((objective, index) => {
          if (objective.uuid === objectiveUUID) {
            sfrSection.objectives.splice(index, 1);
          }
        });
      }
    },
    DELETE_OBJECTIVE_FROM_SFR_USING_UUID: (state, action) => {
      const objectiveUUID = action.payload.objectiveUUID;
      Object.values(state).map((sfrValue) => {
        Object.values(sfrValue).map((sfrSection) => {
          if (sfrSection.objectives && Object.entries(sfrSection.objectives).length > 0) {
            sfrSection.objectives?.map((objective, index) => {
              if (objective.uuid === objectiveUUID) {
                sfrSection.objectives.splice(index, 1);
              }
            });
          }
        });
      });
    },
    RESET_ALL_SFR_OBJECTIVES: (state) => {
      Object.values(state).forEach((parent) => {
        Object.values(parent).forEach((component) => {
          component.objectives = [];
        });
      });
    },
    GET_ALL_SFR_OPTIONS_MAP: (state, action) => {
      let { sfrSections, terms } = action.payload;
      let sfrOptionsMap = {
        dropdownOptions: { components: [], elements: [], selections: [], useCases: [] },
        nameMap: { components: {}, elements: {}, selections: {}, useCases: {} },
        uuidMap: { components: {}, elements: {}, selections: {}, useCases: {} },
        useCaseUUID: null,
        elementSelections: {},
      };
      try {
        // Get component and element data
        Object.values(sfrSections).map((sfrClass) => {
          Object.entries(sfrClass).map(([componentUUID, sfrComponent]) => {
            // Get component data
            let componentName = sfrComponent.cc_id;
            let iterationID = sfrComponent.iteration_id;
            let iterationTitle = iterationID && typeof iterationID === "string" && iterationID !== "" ? "/" + iterationID : "";
            let componentTitle = componentName + iterationTitle;
            if (!sfrOptionsMap.dropdownOptions.components.includes(componentTitle)) {
              sfrOptionsMap.dropdownOptions.components.push(componentTitle);
              sfrOptionsMap.nameMap.components[componentTitle] = componentUUID;
              sfrOptionsMap.uuidMap.components[componentUUID] = componentTitle;
            }
            // Get element data
            Object.entries(sfrComponent.elements).map(([elementUUID, sfrElement], index) => {
              let elementName = `${componentName}.${index + 1}${iterationTitle}`;
              if (!sfrOptionsMap.dropdownOptions.elements.includes(elementName)) {
                sfrOptionsMap.dropdownOptions.elements.push(elementName);
                sfrOptionsMap.nameMap.elements[elementName] = elementUUID;
                sfrOptionsMap.uuidMap.elements[elementUUID] = elementName;
                // Get selections data
                if (sfrElement.selectables && Object.keys(sfrElement.selectables).length > 0) {
                  sfrOptionsMap.elementSelections[elementUUID] = [];
                  let elementSelections = sfrOptionsMap.elementSelections[elementUUID];
                  Object.entries(sfrElement.selectables).map(([selectionUUID, selection]) => {
                    // Get component data
                    let id = selection.id;
                    let assignment = selection.assignment;
                    let description = selection.description;
                    let selectable = id ? `${description} (${id})` : description;
                    if (!sfrOptionsMap.dropdownOptions.selections.includes(selectable) && !assignment) {
                      sfrOptionsMap.dropdownOptions.selections.push(selectable);
                      sfrOptionsMap.nameMap.selections[selectable] = selectionUUID;
                      sfrOptionsMap.uuidMap.selections[selectionUUID] = selectable;
                      if (!elementSelections.includes(selectionUUID)) {
                        elementSelections.push(selectionUUID);
                      }
                    }
                  });
                }
              }
            });
          });
        });

        // Get use case data
        Object.entries(terms).map(([sectionUUID, termSection]) => {
          const title = termSection.title;
          if (title === "Use Cases") {
            sfrOptionsMap.useCaseUUID = sectionUUID;
            Object.entries(termSection).map(([termUUID, term]) => {
              // Get use case term data
              const termTitle = term.title;
              if (termUUID !== "title" && termUUID !== "open" && termTitle && !sfrOptionsMap.dropdownOptions.useCases.includes(termTitle)) {
                sfrOptionsMap.dropdownOptions.useCases.push(termTitle);
                sfrOptionsMap.nameMap.useCases[termTitle] = termUUID;
                sfrOptionsMap.uuidMap.useCases[termUUID] = termTitle;
              }
            });
          } else {
            sfrOptionsMap.useCaseUUID = null;
          }
        });

        // If use cases do not exist set items to default
        if (sfrOptionsMap.useCaseUUID === null) {
          sfrOptionsMap.dropdownOptions.useCases = [];
          sfrOptionsMap.nameMap.useCases = {};
          sfrOptionsMap.uuidMap.useCases = {};
        }

        // Sort drop down menu options
        sfrOptionsMap.dropdownOptions.components.sort();
        sfrOptionsMap.dropdownOptions.elements.sort();
        sfrOptionsMap.dropdownOptions.selections.sort();
        sfrOptionsMap.dropdownOptions.useCases.sort();
      } catch (e) {
        console.log(e);
      }
      action.payload = sfrOptionsMap;
    },
    SORT_OBJECTIVES_FROM_SFRS_HELPER: (state, action) => {
      const { sfrUUID, uuid, uuidMap } = action.payload;
      let objectives = state[sfrUUID][uuid].objectives;
      objectives.sort((a, b) => {
        const nameA = uuidMap[a.uuid].toUpperCase();
        const nameB = uuidMap[b.uuid].toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    },
    SORT_SFR_SECTIONS_HELPER: (state) => {
      Object.entries(state).map(([key, sfr]) => {
        let sorted = Object.entries(sfr).sort((a, b) => {
          const nameA = (a[1].cc_id + a[1].iteration_id).toUpperCase();
          const nameB = (b[1].cc_id + b[1].iteration_id).toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          // names must be equal
          return 0;
        });
        let result = Object.fromEntries(sorted);
        if (JSON.stringify(state[key]) !== JSON.stringify(result)) {
          state[key] = result;
        }
      });
    },
    SET_SFR_SECTIONS_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_SFR_SECTION_STATE: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  CREATE_SFR_SECTION_SLICE,
  DELETE_SFR_SECTION,
  CREATE_SFR_COMPONENT,
  UPDATE_SFR_COMPONENT_ITEMS,
  DELETE_SFR_COMPONENT,
  CREATE_SFR_SECTION_ELEMENT,
  UPDATE_SFR_SECTION_ELEMENT,
  UPDATE_SFR_SECTION_ELEMENT_SELECTABLE,
  DELETE_SFR_SECTION_ELEMENT,
  ADD_SFR_TERM_OBJECTIVE,
  UPDATE_SFR_TERM_OBJECTIVE_RATIONALE,
  DELETE_SFR_TERM_OBJECTIVE,
  DELETE_OBJECTIVE_FROM_SFR_USING_UUID,
  RESET_ALL_SFR_OBJECTIVES,
  GET_ALL_SFR_OPTIONS_MAP,
  SORT_OBJECTIVES_FROM_SFRS_HELPER,
  SORT_SFR_SECTIONS_HELPER,
  DELETE_ALL_SFR_SECTION_ELEMENTS,
  RESET_SFR_SECTION_STATE,
  UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES,
  SET_SFR_SECTIONS_INITIAL_STATE,
} = sfrSectionSlice.actions;

export default sfrSectionSlice.reducer;
