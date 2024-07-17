import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const validationGuidelinesAppendixSlice = createSlice({
    name: 'validationGuidelinesAppendix',
    initialState,
    reducers: {
        setValidationGuidelinesXML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        RESET_VALIDATION_GUIDELINES_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setValidationGuidelinesXML, RESET_VALIDATION_GUIDELINES_APPENDIX_STATE } = validationGuidelinesAppendixSlice.actions

export default validationGuidelinesAppendixSlice.reducer
