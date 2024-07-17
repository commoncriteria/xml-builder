import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const vectorAppendixSlice = createSlice({
    name: 'vectorAppendix',
    initialState,
    reducers: {
        setVectorXML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        RESET_VECTOR_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setVectorXML, RESET_VECTOR_APPENDIX_STATE } = vectorAppendixSlice.actions

export default vectorAppendixSlice.reducer
