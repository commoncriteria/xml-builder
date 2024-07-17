import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const equivGuidelinesAppendixSlice = createSlice({
    name: 'equivGuidelinesAppendix',
    initialState,
    reducers: {
        setEquivGuidelinesXML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        RESET_EQUIVALENCY_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setEquivGuidelinesXML, RESET_EQUIVALENCY_APPENDIX_STATE } = equivGuidelinesAppendixSlice.actions

export default equivGuidelinesAppendixSlice.reducer
