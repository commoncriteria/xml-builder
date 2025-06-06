// Imports
import { createSlice } from "@reduxjs/toolkit";

// Initial State
const initialState = {
  progress: 0,
  steps: {
    "Initial File Load": false,
    Packages: false,
    Modules: false,
    Platforms: false,
    "PP Reference": false,
    Overview: false,
    "TOE Overview": false,
    "Document Scope": false,
    "Intended Readership": false,
    "Tech Terms": false,
    "Use Cases": false,
    "Conformance Claims": false,
    Objectives: false,
    OEs: false,
    Threats: false,
    Assumptions: false,
    SFRs: false,
    SARS: false,
    Appendices: false,
  },
};

const progressSlice = createSlice({
  name: "progressBar",
  initialState: initialState,
  reducers: {
    setProgress: (state, action) => {
      const { progress, steps } = action.payload;

      // Update state
      state.progress = progress;
      state.steps = {
        ...state.steps,
        ...steps,
      };
    },
    RESET_PROGRESS: () => initialState,
  },
});

export const { setProgress, RESET_PROGRESS } = progressSlice.actions;
export default progressSlice.reducer;
