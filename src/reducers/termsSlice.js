import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {};

export const termsSlice = createSlice({
  name: "terms",
  initialState,
  reducers: {
    CREATE_TERMS_LIST: (state, action) => {
      let newId = uuidv4();
      let title = action.payload.title;
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
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].title = newTitle;
        }
      }
    },
    DELETE_TERMS_LIST: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          delete state[uuid];
        }
      }
    },
    COLLAPSE_TERMS_LIST: (state, action) => {
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].open = open && typeof open === "boolean" ? open : !state[uuid].open;
          Object.keys(state[uuid]).map((key) => {
            if (key !== "title" && key !== "open" && key !== "custom" && key !== "xmlTagMeta") {
              let value = state[uuid][key];
              let input = {
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
      const { termUUID, tagMeta, name, definition } = action.payload;
      const uuid = uuidv4();

      if (state.hasOwnProperty(termUUID)) {
        let currentTermList = state[termUUID];

        if (!currentTermList.hasOwnProperty(uuid)) {
          currentTermList[uuid] = {
            title: name ? name : "",
            definition: definition ? definition : "",
            open: true,
            ...(tagMeta ? { xmlTagMeta: tagMeta } : {}),
          };
        }
      }
      action.payload.uuid = uuid;
    },
    UPDATE_TERM_TITLE: (state, action) => {
      let termUUID = action.payload.termUUID;
      let uuid = action.payload.uuid;
      let originalTitle = action.payload.title;
      let newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(termUUID)) {
        let currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === originalTitle) {
          currentTermList[uuid].title = newTitle;
        }
      }
    },
    UPDATE_TERM_DEFINITION: (state, action) => {
      let termUUID = action.payload.termUUID;
      let uuid = action.payload.uuid;
      let newDefinition = action.payload.newDefinition;
      if (state.hasOwnProperty(termUUID)) {
        let currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid)) {
          currentTermList[uuid].definition = newDefinition;
        }
      }
    },
    DELETE_TERM_ITEM: (state, action) => {
      let termUUID = action.payload.termUUID;
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.hasOwnProperty(termUUID)) {
        let currentTermList = state[termUUID];
        if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === title) {
          delete currentTermList[uuid];
        }
      }
    },
    DELETE_ALL_SECTION_TERMS: (state, action) => {
      let termUUID = action.payload.termUUID;
      let title = action.payload.title;
      if (state.hasOwnProperty(termUUID) && state[termUUID].title === title) {
        Object.entries(state[termUUID]).map(([key, value]) => {
          if (key !== "open" && key !== "title") {
            let input = {
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
      let termUUID = action.payload.termUUID;
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.hasOwnProperty(termUUID) && state[termUUID].hasOwnProperty(uuid)) {
        let term = state[termUUID][uuid];
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
  CREATE_TERMS_LIST,
  UPDATE_TERMS_LIST_TITLE,
  DELETE_TERMS_LIST,
  COLLAPSE_TERMS_LIST,
  CREATE_TERM_ITEM,
  UPDATE_TERM_TITLE,
  UPDATE_TERM_DEFINITION,
  DELETE_ALL_SECTION_TERMS,
  DELETE_TERM_ITEM,
  COLLAPSE_TERM_ITEM,
  SET_TERMS_INITIAL_STATE,
  RESET_TERMS_STATE,
} = termsSlice.actions;

export default termsSlice.reducer;
