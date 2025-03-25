import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const entropyAppendixSlice = createSlice({
    name: 'entropyAppendix',
    initialState,
    reducers: {
        SET_ENTROPY_XML: (state, action) => {
            state.xmlContent = action.payload.xml;
            if(Object.keys(state.xmlTagMeta).length === 0) {
              state.xmlTagMeta = action.payload.xmlTagMeta ? action.payload.xmlTagMeta : 
              {
                tagName: "appendix",
                attributes: {}
              };
            }
        },
        SET_ENTROPY_APPENDIX_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_ENTROPY_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    SET_ENTROPY_XML,
    SET_ENTROPY_APPENDIX_INITIAL_STATE,
    RESET_ENTROPY_APPENDIX_STATE
} = entropyAppendixSlice.actions

export default entropyAppendixSlice.reducer
