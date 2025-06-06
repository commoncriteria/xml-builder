import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  xmlContent: "",
  xmlTagMeta: {},
};

export const satisfiedReqsAppendixSlice = createSlice({
  name: "satisfiedReqsAppendix",
  initialState,
  reducers: {
    SET_SATISFIED_REQS_XML: (state, action) => {
      state.xmlContent = action.payload.xml;
      if (Object.keys(state.xmlTagMeta).length === 0) {
        state.xmlTagMeta = action.payload.xmlTagMeta
          ? action.payload.xmlTagMeta
          : {
              tagName: "appendix",
              attributes: {},
            };
      }
    },
    SET_SATISFIED_REQS_APPENDIX_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_SATISFIED_REQS_APPENDIX_STATE: () => ({ ...initialState }),
  },
});

// Action creators are generated for each case reducer function
export const { SET_SATISFIED_REQS_XML, SET_SATISFIED_REQS_APPENDIX_INITIAL_STATE, RESET_SATISFIED_REQS_APPENDIX_STATE } = satisfiedReqsAppendixSlice.actions;

export default satisfiedReqsAppendixSlice.reducer;
