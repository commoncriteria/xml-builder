import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  xmlContent: "",
  xmlTagMeta: {},
};

export const acknowledgementsAppendixSlice = createSlice({
  name: "acknowledgementsAppendix",
  initialState,
  reducers: {
    SET_ACKNOWLEDGEMENTS_XML: (state, action) => {
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
    SET_ACKNOWLEDGEMENTS_APPENDIX_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE: () => ({ ...initialState }),
  },
});

// Action creators are generated for each case reducer function
export const { SET_ACKNOWLEDGEMENTS_XML, SET_ACKNOWLEDGEMENTS_APPENDIX_INITIAL_STATE, RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE } =
  acknowledgementsAppendixSlice.actions;

export default acknowledgementsAppendixSlice.reducer;
