import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { deepCopy } from "../../utils/deepCopy.js";

// Constants
export const defaultTipTapValues = { text: "", open: true };
export const defaultAudit = {
  isAudit: true,
  section: {
    id: "",
    title: "",
    description: "",
    open: false,
  },
  auditTable: {
    id: "",
    table: "",
    title: "",
    open: false,
  },
  eventsTableOpen: false,
  open: true,
};
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
    introduction: "",
    sfrSections: {},
    open: false,
  },
  additionalSfrs: {
    introduction: "",
    audit: deepCopy(defaultAudit),
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
      const { declarationAndRef, modifiedSfrs, additionalSfrs, consistencyRationale, name } = action.payload;

      if (!state.hasOwnProperty(newId)) {
        state[newId] = {
          declarationAndRef: declarationAndRef ? declarationAndRef : deepCopy(defaultBasePP.declarationAndRef),
          modifiedSfrs: modifiedSfrs ? modifiedSfrs : deepCopy(defaultBasePP.modifiedSfrs),
          additionalSfrs: additionalSfrs ? additionalSfrs : deepCopy(defaultBasePP.additionalSfrs),
          consistencyRationale: consistencyRationale ? consistencyRationale : deepCopy(defaultBasePP.consistencyRationale),
          open: false,
        };

        // Add name for cases of adding a new base pp section from the ui
        if (name) {
          state[newId].declarationAndRef.name = name;
        }

        // Return the new id
        action.payload = newId;
      } else {
        action.payload = null;
      }
    },
    CREATE_BASE_PP_SFR_SECTION_SLICE: (state, action) => {
      const { parentUUID, title, parentKey } = action.payload;
      const sfrUUID = uuidv4();
      const isParentValid = state.hasOwnProperty(parentUUID);
      const key = "sfrSections";
      let sfrSection = {
        title: title || "",
        definition: "",
        open: true,
      };

      // Check for parent uuid and create new additional sfr section
      if (isParentValid) {
        // Set initial value if it is not valid
        if (!state[parentUUID].hasOwnProperty(parentKey)) {
          state[parentUUID][parentKey] = deepCopy(defaultBasePP[parentKey]);
        }

        // Update sfrs
        let sfrs = state[parentUUID][parentKey];

        // Set sfrSections if it is not present
        if (!sfrs.hasOwnProperty(key)) {
          sfrs[key] = {};
        }

        // Add to sfr section based on parentKey
        if (parentKey === "additionalSfrs") {
          sfrSection.extendedComponentDefinition = [];
          sfrSection.extendedComponentOpen = false;
        } else {
          sfrSection.id = "";
        }

        // Generate sfr
        sfrs[key][sfrUUID] = sfrSection;

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
    UPDATE_MODIFIED_SFRS: (state, action) => {
      const { uuid, key, value } = action.payload;
      const parentKey = "modifiedSfrs";

      // Updates the modified sfrs value by key
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
    DELETE_BASE_PP_SFR_SECTION: (state, action) => {
      const { sfrUUID, uuid, parentKey } = action.payload;
      const isSfrTypeValid = state.hasOwnProperty(sfrUUID) && state[sfrUUID].hasOwnProperty(parentKey);

      // Check if the sfr type is valid
      if (isSfrTypeValid) {
        let sfrSection = isSfrTypeValid ? state[sfrUUID][parentKey] : {};
        const isSectionValid = sfrSection.hasOwnProperty("sfrSections") && sfrSection.sfrSections.hasOwnProperty(uuid);

        // Delete section
        if (isSectionValid) {
          delete state[sfrUUID][parentKey].sfrSections[uuid];
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
  CREATE_BASE_PP_SFR_SECTION_SLICE,
  UPDATE_MAIN_SFR_BASE_PP_DEFINITION,
  UPDATE_SFR_BASE_PP_SECTION_NAME,
  UPDATE_DECLARATION_AND_REFERENCE,
  UPDATE_ADDITIONAL_SFRS,
  UPDATE_MODIFIED_SFRS,
  UPDATE_CONSISTENCY_RATIONALE,
  COLLAPSE_SFR_BASE_PP_SECTION,
  COLLAPSE_SFR_BASE_PP_INNER_SECTION,
  SET_SFR_BASE_PP_INITIAL_STATE,
  DELETE_SFR_BASE_PP,
  DELETE_BASE_PP_SFR_SECTION,
  RESET_SFR_BASE_PP_STATE,
} = sfrBasePPsSlice.actions;

export default sfrBasePPsSlice.reducer;
