import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const validationGuidelinesAppendixSlice = createSlice({
    name: 'validationGuidelinesAppendix',
    initialState,
    reducers: {
        SET_VALIDATION_GUIDELINES_XML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        SET_VALIDATION_GUIDELINES_APPENDIX_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_VALIDATION_GUIDELINES_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    SET_VALIDATION_GUIDELINES_XML,
    SET_VALIDATION_GUIDELINES_APPENDIX_INITIAL_STATE,
    RESET_VALIDATION_GUIDELINES_APPENDIX_STATE
} = validationGuidelinesAppendixSlice.actions

export default validationGuidelinesAppendixSlice.reducer
