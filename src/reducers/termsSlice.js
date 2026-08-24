import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {};

export const termsSlice = createSlice({
  name: "terms",
  initialState,
  reducers: {
    UPDATE_USE_CASE_INTRO: (state, action) => {
      const { uuid, newIntro } = action.payload;
      if (state.hasOwnProperty(uuid)) {
        state[uuid].useCaseIntro = newIntro;
      }
    },
    CREATE_TERMS_LIST: (state, action) => {
      const newId = uuidv4();
      const title = action.payload.title;
      if (!state.hasOwnProperty(newId)) {
        state[newId] = {
          title: title,
          open: false,
          custom: action.payload.custom,
          xmlTagMeta: action.payload?.xmlTagMeta,
        };
        action.payload = newId;
      } else {
        action.payload = null;
      }
    },
    UPDATE_TERMS_LIST_TITLE: (state, action) => {
      const title = action.payload.title;
      const uuid = action.payload.uuid;
      const newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].title = newTitle;
        }
      }
    },
    DELETE_TERMS_LIST: (state, action) => {
      const title = action.payload.title;
      const uuid = action.payload.uuid;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          delete state[uuid];
        }
      }
    },
    COLLAPSE_TERMS_LIST: (state, action) => {
      const uuid = action.payload.uuid;
      const title = action.payload.title;
      const open = action.payload.open;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].open = open && typeof open === "boolean" ? open : !state[uuid].open;
          Object.keys(state[uuid]).map((key) => {
            if (
              key !== "title" &&
              key !== "open" &&
              key !== "custom" &&
              key !== "xmlTagMeta" &&
              key !== "useCaseIntro" &&
              typeof value === "object" &&
              value !== null
            ) {
              const value = state[uuid][key];
              const input = {
                payload: {
                  termUUID: uuid,
                  uuid: key,
                  title: value.title,
                  open: state[uuid].open,
                },
              };
              termsSlice.caseReducers.COLLAPSE_TERM_ITEM(state, input);
            }
          });
        }
      }
    },
    CREATE_TERM_ITEM: (state, action) => {
      const { termUUID, tagMeta, name, abbr, definition, useCaseConfig } = action.payload;
      const uuid = uuidv4();

      if (state.hasOwnProperty(termUUID)) {
        const currentTermList = state[termUUID];

        if (!currentTermList.hasOwnProperty(uuid)) {
          currentTermList[uuid] = {
            title: name ? name : "",
            abbr: abbr ? abbr : "",
            definition: definition ? definition : "",
            open: true,
            ...(tagMeta ? { xmlTagMeta: tagMeta } : {}),
            ...(useCaseConfig ? { useCaseConfig } : {}),
          };
        }
      }
      action.payload.uuid = uuid;
    },
    UPDATE_TERM_TITLE: (state, action) => {
      const termUUID = action.payload.termUUID;
      const uuid = action.payload.uuid;
      const originalTitle = action.payload.title;
      const newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(termUUID)) {
        const currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === originalTitle) {
          currentTermList[uuid].title = newTitle;
        }
      }
    },
    UPDATE_TERM_ABBR: (state, action) => {
      const termUUID = action.payload.termUUID;
      const uuid = action.payload.uuid;
      const originalTitle = action.payload.title;
      const newAbbr = action.payload.newAbbr;
      if (state.hasOwnProperty(termUUID)) {
        const currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === originalTitle) {
          currentTermList[uuid].abbr = newAbbr;
          currentTermList[uuid].xmlTagMeta.attributes.abbr = newAbbr;
        }
      }
    },
    UPDATE_TERM_DEFINITION: (state, action) => {
      const termUUID = action.payload.termUUID;
      const uuid = action.payload.uuid;
      const newDefinition = action.payload.newDefinition;
      if (state.hasOwnProperty(termUUID)) {
        const currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid)) {
          currentTermList[uuid].definition = newDefinition;
        }
      }
    },
    UPDATE_USE_CASE_CONFIG: (state, action) => {
      const termUUID = action.payload.termUUID;
      const uuid = action.payload.uuid;
      if (state.hasOwnProperty(termUUID)) {
        const currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid)) {
          currentTermList[uuid].useCaseConfig = action.payload.newUseCaseConfig;
        }
      }
    },
    DELETE_TERM_ITEM: (state, action) => {
      const termUUID = action.payload.termUUID;
      const title = action.payload.title;
      const uuid = action.payload.uuid;
      if (state.hasOwnProperty(termUUID)) {
        const currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === title) {
          delete currentTermList[uuid];
        }
      }
    },
    DELETE_ALL_SECTION_TERMS: (state, action) => {
      const termUUID = action.payload.termUUID;
      const title = action.payload.title;
      if (state.hasOwnProperty(termUUID) && state[termUUID].title === title) {
        Object.entries(state[termUUID]).map(([key, value]) => {
          if (key !== "open" && key !== "title") {
            const input = {
              payload: {
                title: value.title,
                termUUID: termUUID,
                uuid: key,
              },
            };
            termsSlice.caseReducers.DELETE_TERM_ITEM(state, input);
          }
        });
      }
    },
    COLLAPSE_TERM_ITEM: (state, action) => {
      const termUUID = action.payload.termUUID;
      const uuid = action.payload.uuid;
      const title = action.payload.title;
      const open = action.payload.open;
      if (state.hasOwnProperty(termUUID) && state[termUUID].hasOwnProperty(uuid)) {
        const term = state[termUUID][uuid];
        if (term.title === title) {
          term.open = open !== null && typeof open === "boolean" ? open : !term.open;
        }
      }
    },
    SET_TERMS_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_TERMS_STATE: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  UPDATE_USE_CASE_INTRO,
  UPDATE_USE_CASE_CONFIG,
  CREATE_TERMS_LIST,
  UPDATE_TERMS_LIST_TITLE,
  DELETE_TERMS_LIST,
  COLLAPSE_TERMS_LIST,
  CREATE_TERM_ITEM,
  UPDATE_TERM_TITLE,
  UPDATE_TERM_ABBR,
  UPDATE_TERM_DEFINITION,
  DELETE_ALL_SECTION_TERMS,
  DELETE_TERM_ITEM,
  COLLAPSE_TERM_ITEM,
  SET_TERMS_INITIAL_STATE,
  RESET_TERMS_STATE,
} = termsSlice.actions;

export default termsSlice.reducer;
