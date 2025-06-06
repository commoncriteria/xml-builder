import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cc: {},
  entries: [],
};

export const bibliographySlice = createSlice({
  name: "bibliography",
  initialState,
  reducers: {
    UPDATE_CC_ENTRY: (state, action) => {
      state["cc-entry"] = action.payload.cc_entry;
    },
    ADD_ENTRIES: (state, action) => {
      const entries = action.payload.entries;

      entries.forEach((e) => {
        state.entries.push(e);
      });
    },
    SET_BIBLIOGRAPHY_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_BIBLIOGRAPHY_STATE: () => ({ ...initialState }),
  },
});

// Action creators are generated for each case reducer function
export const { UPDATE_CC_ENTRY, ADD_ENTRIES, SET_BIBLIOGRAPHY_INITIAL_STATE, RESET_BIBLIOGRAPHY_STATE } = bibliographySlice.actions;

export default bibliographySlice.reducer;
