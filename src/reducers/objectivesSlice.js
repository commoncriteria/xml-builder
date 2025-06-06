import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {};

export const objectivesSlice = createSlice({
  name: "objectives",
  initialState,
  reducers: {
    CREATE_OBJECTIVE_SECTION: (state, action) => {
      let newId = uuidv4();
      let title = action.payload.title;
      if (!state.hasOwnProperty(newId)) {
        state[newId] = {
          title: title,
          definition: "",
          terms: {},
          open: false,
        };
        action.payload = newId;
      } else {
        action.payload = null;
      }
    },
    UPDATE_OBJECTIVE_SECTION_TITLE: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].title = newTitle;
        }
      }
    },
    UPDATE_OBJECTIVE_SECTION_DEFINITION: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newDefinition = action.payload.newDefinition;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].definition = newDefinition;
        }
      }
    },
    DELETE_OBJECTIVE_SECTION: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          delete state[uuid];
        }
      }
    },
    COLLAPSE_OBJECTIVE_SECTION: (state, action) => {
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].open = open !== null && typeof open === "boolean" ? open : !state[uuid].open;
        }
      }
    },
    CREATE_OBJECTIVE_TERM: (state, action) => {
      let objectiveUUID = action.payload.objectiveUUID;
      let title = action.payload.title;
      let definition = action.payload.definition;
      let uuid = uuidv4();
      if (state.hasOwnProperty(objectiveUUID)) {
        let currentTermList = state[objectiveUUID];
        if (!currentTermList.hasOwnProperty(uuid)) {
          currentTermList.terms[uuid] = {
            title: title ? title : "",
            definition: definition ? definition : "",
            open: false,
          };
        }
      }
      // Sort objective lists
      objectivesSlice.caseReducers.SORT_OBJECTIVE_TERMS_LIST_HELPER(state);

      // Return the uuid
      action.payload.id = uuid;
    },
    UPDATE_OBJECTIVE_TERM_TITLE: (state, action) => {
      let objectiveUUID = action.payload.objectiveUUID;
      let uuid = action.payload.uuid;
      let originalTitle = action.payload.title;
      let newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(objectiveUUID)) {
        if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === originalTitle) {
          state[objectiveUUID].terms[uuid].title = newTitle;
        }
      }
      // Sort objective lists
      objectivesSlice.caseReducers.SORT_OBJECTIVE_TERMS_LIST_HELPER(state);
    },
    UPDATE_OBJECTIVE_TERM_DEFINITION: (state, action) => {
      let objectiveUUID = action.payload.objectiveUUID;
      let uuid = action.payload.uuid;
      let originalTitle = action.payload.title;
      let newDefinition = action.payload.newDefinition;
      if (state.hasOwnProperty(objectiveUUID)) {
        if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === originalTitle) {
          state[objectiveUUID].terms[uuid].definition = newDefinition;
        }
      }
    },
    DELETE_OBJECTIVE_TERM: (state, action) => {
      let objectiveUUID = action.payload.objectiveUUID;
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.hasOwnProperty(objectiveUUID)) {
        if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === title) {
          delete state[objectiveUUID].terms[uuid];
        }
      }
      // Sort objective lists
      objectivesSlice.caseReducers.SORT_OBJECTIVE_TERMS_LIST_HELPER(state);
    },
    DELETE_ALL_OBJECTIVE_TERMS: (state, action) => {
      let objectiveUUID = action.payload.objectiveUUID;
      let title = action.payload.title;
      if (state.hasOwnProperty(objectiveUUID) && state[objectiveUUID].title === title) {
        let terms = state[objectiveUUID].terms;
        if (terms && terms !== undefined) {
          state[objectiveUUID].terms = {};
        }
      }
    },
    COLLAPSE_OBJECTIVE_TERM: (state, action) => {
      let objectiveUUID = action.payload.objectiveUUID;
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.hasOwnProperty(objectiveUUID)) {
        if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === title) {
          let threat = state[objectiveUUID].terms[uuid];
          threat.open = open !== null && typeof open === "boolean" ? open : !threat.open;
        }
      }
    },
    GET_OBJECTIVE_UUID_BY_TITLE: (state, action) => {
      const { title } = action.payload;
      action.payload.uuid = null;

      // Search for UUID by title
      for (const [key, value] of Object.entries(state)) {
        if (value.title === title) {
          action.payload.uuid = key;
        }
      }
    },
    SORT_OBJECTIVE_TERMS_LIST_HELPER: (state) => {
      Object.entries(state).map(([key, value]) => {
        if (value.terms && Object.entries(value.terms).length > 0) {
          let sorted = Object.entries(value.terms).sort((a, b) => {
            const nameA = a[1].title.toUpperCase();
            const nameB = b[1].title.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            // names must be equal
            return 0;
          });
          value.terms = Object.fromEntries(sorted);
        }
      });
    },
    SET_OBJECTIVES_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_OBJECTIVES_STATE: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  CREATE_OBJECTIVE_SECTION,
  UPDATE_OBJECTIVE_SECTION_TITLE,
  UPDATE_OBJECTIVE_SECTION_DEFINITION,
  DELETE_OBJECTIVE_SECTION,
  COLLAPSE_OBJECTIVE_SECTION,
  CREATE_OBJECTIVE_TERM,
  UPDATE_OBJECTIVE_TERM_TITLE,
  UPDATE_OBJECTIVE_TERM_DEFINITION,
  DELETE_OBJECTIVE_TERM,
  DELETE_ALL_OBJECTIVE_TERMS,
  COLLAPSE_OBJECTIVE_TERM,
  GET_OBJECTIVE_UUID_BY_TITLE,
  SORT_OBJECTIVE_TERMS_LIST_HELPER,
  SET_OBJECTIVES_INITIAL_STATE,
  RESET_OBJECTIVES_STATE,
} = objectivesSlice.actions;

export default objectivesSlice.reducer;
