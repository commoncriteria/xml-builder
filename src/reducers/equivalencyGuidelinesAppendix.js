import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  xmlContent: "",
  xmlTagMeta: {},
};

export const equivGuidelinesAppendixSlice = createSlice({
  name: "equivGuidelinesAppendix",
  initialState,
  reducers: {
    SET_EQUIV_GUIDELINES_XML: (state, action) => {
      state.xmlContent = action.payload.xml;
      state.xmlTagMeta = action.payload.xmlTagMeta;
    },
    SET_EQUIV_GUIDELINES_APPENDIX_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_EQUIVALENCY_APPENDIX_STATE: () => ({ ...initialState }),
  },
});

// Action creators are generated for each case reducer function
export const { SET_EQUIV_GUIDELINES_XML, SET_EQUIV_GUIDELINES_APPENDIX_INITIAL_STATE, RESET_EQUIVALENCY_APPENDIX_STATE } = equivGuidelinesAppendixSlice.actions;

export default equivGuidelinesAppendixSlice.reducer;
