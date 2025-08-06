import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { defaultAudit } from "./sfrBasePPsSlice.js";
import { deepCopy } from "../../utils/deepCopy.js";

// Constants
export const defaultToeSfr = {
  open: false,
  audit: deepCopy(defaultAudit),
};
export const sfrTypeMap = {
  Mandatory: "mandatory",
  Optional: "optional",
  Objective: "objective",
  "Selection-based": "selectionBased",
  "Implementation-dependent": "implementationDependent",
};

const initialState = {
  auditSection: "",
  sfrDefinition: `<p>This chapter describes the security requirements which have to be fulfilled by the product under
                    evaluation. Those requirements comprise functional components from Part 2 and assurance components
                    from Part 3 of [CC].The following conventions are used for the completion of operations:</p>
                    <ul><li><strong>Refinement </strong>operation (denoted by <strong>bold text </strong>or
                    <s>strikethrough text</s>): Is used to add details to a requirement (including replacing an assignment
                    with a more restrictive selection) or to remove part of the requirement that is made irrelevant through
                    the completion of another operation, and thus further restricts a requirement.</li><li><strong>
                    Selection </strong>(denoted by <em>italicized text</em>): Is used to select one or more options provided
                    by the [CC] in stating a requirement.</li><li><strong>Assignment operation </strong>(denoted by italicized text):
                    Is used to assign a specific value to an unspecified parameter, such as the length of a password.
                    Showing the value in square brackets indicates assignment.</li><li><strong>Iteration operation</strong>:
                    Is indicated by appending the SFRs name with a slash and unique identifier suggesting the purpose of
                    the operation, e.g. "/EXAMPLE1."</li></ul>`,
  toeSfrs: {
    mandatory: deepCopy(defaultToeSfr),
    optional: deepCopy(defaultToeSfr),
    objective: deepCopy(defaultToeSfr),
    selectionBased: deepCopy(defaultToeSfr),
    implementationDependent: deepCopy(defaultToeSfr),
  },
  sections: {},
};

export const sfrSlice = createSlice({
  name: "sfrs",
  initialState,
  reducers: {
    UPDATE_MAIN_SFR_DEFINITION: (state, action) => {
      state.sfrDefinition = action.payload.newDefinition;
    },
    UPDATE_AUDIT_SECTION: (state, action) => {
      state.auditSection = action.payload.newDefinition;
    },
    CREATE_SFR_SECTION: (state, action) => {
      let newId = uuidv4();
      const { id, title, sfrType, definition, classDescription, extendedComponentDefinition } = action.payload;

      if (!state.sections.hasOwnProperty(newId)) {
        state.sections[newId] = {
          title,
          id: id ? id : "",
          sfrType: sfrType ? sfrType : "",
          definition: definition ? definition : "",
          classDescription: classDescription ? classDescription : "",
          extendedComponentDefinition: extendedComponentDefinition ? extendedComponentDefinition : [],
          open: false,
        };
        action.payload = newId;
      } else {
        action.payload = null;
      }
    },
    UPDATE_SFR_SECTION_TITLE: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newTitle = action.payload.newTitle;
      if (state.sections.hasOwnProperty(uuid)) {
        if (state.sections[uuid].title === title) {
          state.sections[uuid].title = newTitle;
        }
      }
    },
    UPDATE_SFR_SECTION_ID: (state, action) => {
      const { id, uuid } = action.payload;

      if (state.sections.hasOwnProperty(uuid)) {
        state.sections[uuid].id = id;
      }
    },
    UPDATE_SFR_SECTION_TYPE: (state, action) => {
      const { sfrType, uuid } = action.payload;

      if (state.sections.hasOwnProperty(uuid)) {
        state.sections[uuid].sfrType = sfrType;
      }
    },
    UPDATE_SFR_SECTION_DEFINITION: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newDefinition = action.payload.newDefinition;
      if (state.sections.hasOwnProperty(uuid)) {
        if (state.sections[uuid].title === title) {
          state.sections[uuid].definition = newDefinition;
        }
      }
    },
    DELETE_SFR: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.sections.hasOwnProperty(uuid)) {
        if (!title) {
          delete state.sections[uuid];
        } else {
          if (state.sections[uuid].title === title) {
            delete state.sections[uuid];
          }
        }
      }
    },
    DELETE_ALL_SFR_SECTIONS: (state) => {
      Object.entries(state.sections).map(([key, value]) => {
        delete state.sections[key];
      });
    },
    COLLAPSE_SFR_SECTION: (state, action) => {
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.sections.hasOwnProperty(uuid)) {
        if (state.sections[uuid].title === title) {
          state.sections[uuid].open = open !== null && typeof open === "boolean" ? open : !state.sections[uuid].open;
        }
      }
    },
    CREATE_ECD_ITEM: (state, action) => {
      const { uuid } = action.payload;
      if (state.hasOwnProperty("sections") && state.sections.hasOwnProperty(uuid)) {
        const extendedComponentDefinition = state.sections[uuid].extendedComponentDefinition;
        extendedComponentDefinition.push({
          famId: "",
          title: "New ECD Title",
          famBehavior: "",
        });
      }
    },
    DELETE_ECD_ITEM: (state, action) => {
      const { uuid, index } = action.payload;

      if (state.hasOwnProperty("sections") && state.sections.hasOwnProperty(uuid)) {
        const extendedComponentDefinition = state.sections[uuid].extendedComponentDefinition;

        if (extendedComponentDefinition[index]) {
          extendedComponentDefinition.splice(index, 1);
        }
      }
    },
    UPDATE_ECD_ITEM: (state, action) => {
      const { uuid, index, type, value } = action.payload;

      if (state.hasOwnProperty("sections") && state.sections.hasOwnProperty(uuid)) {
        const extendedComponentDefinition = state.sections[uuid].extendedComponentDefinition;

        if (extendedComponentDefinition[index]) {
          let currentEcdItem = extendedComponentDefinition[index];

          if (currentEcdItem.hasOwnProperty(type)) {
            currentEcdItem[type] = value;
          }
        }
      }
    },
    UPDATE_TOE_SFRS: (state, action) => {
      try {
        const { sfrType, key, value } = action.payload;

        // Initialize toe sfr
        initializeToeSfr(state, sfrType, key);

        // Update the value of the toeSfr key
        state.toeSfrs[sfrType][key] = value;
      } catch (e) {
        console.log(e);
      }
    },
    SET_SFRS_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_SFR_STATE: () => initialState,
  },
});

// Internal Methods
/**
 * Initializes the toe sfrs if the values do not already exist
 * @param state the state
 * @param sfrType the sfr type (mandatory, optional, objective, selectionBased, implementationDependent)
 */
const initializeToeSfr = (state, sfrType) => {
  try {
    if (!state.hasOwnProperty("toeSfrs")) {
      state.toeSfrs = deepCopy(initialState.toeSfrs);
    }

    if (!state.toeSfrs?.hasOwnProperty(sfrType)) {
      state.toeSfrs[sfrType] = deepCopy(defaultToeSfr);
    }
  } catch (e) {
    console.log(e);
  }
};

// Action creators are generated for each case reducer function
export const {
  UPDATE_MAIN_SFR_DEFINITION,
  CREATE_SFR_SECTION,
  UPDATE_AUDIT_SECTION,
  UPDATE_SFR_SECTION_TITLE,
  UPDATE_SFR_SECTION_ID,
  UPDATE_SFR_SECTION_TYPE,
  UPDATE_SFR_SECTION_DEFINITION,
  UPDATE_TOE_SFRS,
  DELETE_ALL_SFR_SECTIONS,
  COLLAPSE_SFR_SECTION,
  RESET_SFR_STATE,
  DELETE_SFR,
  CREATE_ECD_ITEM,
  UPDATE_ECD_ITEM,
  DELETE_ECD_ITEM,
  SET_SFRS_INITIAL_STATE,
} = sfrSlice.actions;

export default sfrSlice.reducer;
