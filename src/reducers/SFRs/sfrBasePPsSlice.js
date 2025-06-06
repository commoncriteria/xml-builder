import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { deepCopy } from "../../utils/deepCopy.js";

// Constants
export const defaultTipTapValues = { text: "", open: true };
export const defaultBasePP = {
  declarationAndRef: {
    id: "",
    name: "",
    short: "",
    product: "",
    version: "",
    url: "",
    git: {
      url: "",
      branch: "",
      open: true,
    },
    secFuncReqDir: deepCopy(defaultTipTapValues),
    open: false,
  },
  modifiedSfrs: {
    open: false,
  },
  additionalSfrs: {
    introduction: "",
    audit: {
      isAudit: true,
      section: {
        id: "",
        title: "",
        open: false,
      },
      auditTable: {
        id: "",
        table: "",
        title: "",
        open: false,
      },
      open: true,
    },
    sfrSections: {},
    open: false,
  },
  consistencyRationale: {
    conToe: deepCopy(defaultTipTapValues),
    conSecProb: deepCopy(defaultTipTapValues),
    conObj: deepCopy(defaultTipTapValues),
    conOpEn: deepCopy(defaultTipTapValues),
    conMod: {
      rows: [],
      open: true,
    },
    open: false,
  },
};

// The initial state
const initialState = {
  sfrBasePPDefinition: ``,
};

export const sfrBasePPsSlice = createSlice({
  name: "sfrBasePPs",
  initialState,
  reducers: {
    CREATE_SFR_BASE_PP_SECTION: (state, action) => {
      let newId = uuidv4();
      const { declarationAndRef, modifiedSfrs, additionalSfrs, consistencyRationale } = action.payload;

      if (!state.hasOwnProperty(newId)) {
        state[newId] = {
          declarationAndRef: declarationAndRef ? declarationAndRef : deepCopy(defaultBasePP.declarationAndRef),
          modifiedSfrs: modifiedSfrs ? modifiedSfrs : deepCopy(defaultBasePP.modifiedSfrs),
          additionalSfrs: additionalSfrs ? additionalSfrs : deepCopy(defaultBasePP.additionalSfrs),
          consistencyRationale: consistencyRationale ? consistencyRationale : deepCopy(defaultBasePP.consistencyRationale),
          open: false,
        };
        action.payload = newId;
      } else {
        action.payload = null;
      }
    },
    CREATE_ADDITIONAL_SFR_SECTION_SLICE: (state, action) => {
      const { parentUUID, title } = action.payload;
      const sfrUUID = uuidv4();
      const isParentValid = state.hasOwnProperty(parentUUID);
      const parentKey = "additionalSfrs";
      const key = "sfrSections";

      // Check for parent uuid and create new additional sfr section
      if (isParentValid) {
        // Set initial value if it is not valid
        if (!state[parentUUID].hasOwnProperty(parentKey)) {
          state[parentUUID][parentKey] = deepCopy(defaultBasePP[parentKey]);
        }

        // Update additional sfrs
        let additionalSfrs = state[parentUUID][parentKey];

        // Set sfrSections if it is not present
        if (!additionalSfrs.hasOwnProperty(key)) {
          additionalSfrs[key] = {};
        }

        // Add default value for sfr section
        additionalSfrs[key][sfrUUID] = {
          title: title ? title : "",
          definition: "",
          extendedComponentDefinition: [],
          extendedComponentOpen: false,
          open: false,
        };

        // Return sfrUUID
        action.payload.sfrUUID = sfrUUID;
      }
    },
    UPDATE_MAIN_SFR_BASE_PP_DEFINITION: (state, action) => {
      state.sfrBasePPDefinition = action.payload.newDefinition;
    },
    UPDATE_SFR_BASE_PP_SECTION_NAME: (state, action) => {
      const { uuid, newTitle } = action.payload;

      if (state.hasOwnProperty(uuid)) {
        state[uuid].declarationAndRef.name = newTitle;
      }
    },
    UPDATE_DECLARATION_AND_REFERENCE: (state, action) => {
      const { uuid, key, value } = action.payload;
      const parentKey = "declarationAndRef";

      // Updates the declaration and reference value by key
      updateValueByKey(state, uuid, parentKey, key, value);
    },
    UPDATE_ADDITIONAL_SFRS: (state, action) => {
      const { uuid, key, value } = action.payload;
      const parentKey = "additionalSfrs";

      // Updates the additional sfrs value by key
      updateValueByKey(state, uuid, parentKey, key, value);
    },
    UPDATE_CONSISTENCY_RATIONALE: (state, action) => {
      const { uuid, key, value } = action.payload;
      const parentKey = "consistencyRationale";

      // Updates the consistency rationale value by key
      updateValueByKey(state, uuid, parentKey, key, value);
    },
    COLLAPSE_SFR_BASE_PP_SECTION: (state, action) => {
      const { uuid, open } = action.payload;

      if (state.hasOwnProperty(uuid)) {
        state[uuid].open = open !== null && typeof open === "boolean" ? open : !state[uuid].open;
      }
    },
    COLLAPSE_SFR_BASE_PP_INNER_SECTION: (state, action) => {
      const { uuid, key, open } = action.payload;

      if (state.hasOwnProperty(uuid) && state[uuid].hasOwnProperty(key)) {
        state[uuid][key].open = open !== null && typeof open === "boolean" ? open : !state[uuid][key].open;
      }
    },
    SET_SFR_BASE_PP_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    DELETE_SFR_BASE_PP: (state, action) => {
      const { uuid } = action.payload;

      if (state.hasOwnProperty(uuid)) {
        delete state[uuid];
      }
    },
    DELETE_ADDITIONAL_SFR_SECTION: (state, action) => {
      const { sfrUUID, uuid } = action.payload;
      const isAdditionalSfr = state.hasOwnProperty(sfrUUID) && state[sfrUUID].hasOwnProperty("additionalSfrs");

      if (isAdditionalSfr) {
        let additionalSfrs = isAdditionalSfr ? state[sfrUUID].additionalSfrs : {};
        const isSectionValid = additionalSfrs.hasOwnProperty("sfrSections") && additionalSfrs.sfrSections.hasOwnProperty(uuid);

        // Delete section
        if (isSectionValid) {
          delete state[sfrUUID].additionalSfrs.sfrSections[uuid];
        }
      }
    },
    RESET_SFR_BASE_PP_STATE: () => initialState,
  },
});

// Internal Methods
/**
 * Updates the value by key
 * @param state the state
 * @param uuid the uuid
 * @param parentKey the parent key
 * @param key the key
 * @param value the value
 */
const updateValueByKey = (state, uuid, parentKey, key, value) => {
  // Check if the state has the uuid
  if (state.hasOwnProperty(uuid)) {
    // Create default values if they do not exist
    if (state[uuid].hasOwnProperty(parentKey)) {
      if (!state[uuid][parentKey].hasOwnProperty(key)) {
        state[uuid][parentKey][key] = deepCopy(defaultBasePP[parentKey][key]);
      }
    } else {
      state[uuid][parentKey] = deepCopy(defaultBasePP[parentKey]);
    }

    // Update the value by key
    state[uuid][parentKey][key] = value;
  }
};

// Action creators are generated for each case reducer function
export const {
  CREATE_SFR_BASE_PP_SECTION,
  CREATE_ADDITIONAL_SFR_SECTION_SLICE,
  UPDATE_MAIN_SFR_BASE_PP_DEFINITION,
  UPDATE_SFR_BASE_PP_SECTION_NAME,
  UPDATE_DECLARATION_AND_REFERENCE,
  UPDATE_ADDITIONAL_SFRS,
  UPDATE_CONSISTENCY_RATIONALE,
  COLLAPSE_SFR_BASE_PP_SECTION,
  COLLAPSE_SFR_BASE_PP_INNER_SECTION,
  SET_SFR_BASE_PP_INITIAL_STATE,
  DELETE_SFR_BASE_PP,
  DELETE_ADDITIONAL_SFR_SECTION,
  RESET_SFR_BASE_PP_STATE,
} = sfrBasePPsSlice.actions;

export default sfrBasePPsSlice.reducer;
