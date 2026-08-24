import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { deepCopy } from "../utils/deepCopy.js";

const featuresDefaults = {
  title: "Product Features Mapped to Implementation-dependent Requirements",
  text: "",
  featureList: [],
  xmlTagMeta: {
    tagName: "section",
    attributes: {
      title: "Product Features Mapped to Implementation-dependent Requirements",
      id: "sec-features",
    },
  },
  open: false,
};

const createDefaultFeatures = () => ({
  uuid: uuidv4(),
  ...deepCopy(featuresDefaults),
});

const initialState = createDefaultFeatures();

export const featuresSlice = createSlice({
  name: "features",
  initialState,
  reducers: {
    UPDATE_FEATURES: (state, action) => {
      const { itemMap } = action.payload;

      if (itemMap && Object.keys(itemMap).length > 0) {
        Object.entries(itemMap).forEach(([key, value]) => {
          if (state.hasOwnProperty(key)) {
            state[key] = value;
          }
        });
      }

      if (!state.uuid) {
        state.uuid = uuidv4();
      }
    },
    ADD_FEATURE: (state) => {
      state.featureList.push({ id: "", title: "", description: "" });
    },
    RESET_FEATURES_STATE: () => createDefaultFeatures(),
  },
});

export const { UPDATE_FEATURES, ADD_FEATURE, RESET_FEATURES_STATE } = featuresSlice.actions;

export default featuresSlice.reducer;
