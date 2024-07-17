import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const satisfiedReqsAppendixSlice = createSlice({
    name: 'satisfiedReqsAppendix',
    initialState,
    reducers: {
        setSatisfiedReqsXML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        RESET_SATISFIED_REQS_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setSatisfiedReqsXML, RESET_SATISFIED_REQS_APPENDIX_STATE } = satisfiedReqsAppendixSlice.actions

export default satisfiedReqsAppendixSlice.reducer
