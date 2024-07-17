import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const entropyAppendixSlice = createSlice({
    name: 'entropyAppendix',
    initialState,
    reducers: {
        setEntropyXML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        RESET_ENTROPY_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setEntropyXML, RESET_ENTROPY_APPENDIX_STATE } = entropyAppendixSlice.actions

export default entropyAppendixSlice.reducer
