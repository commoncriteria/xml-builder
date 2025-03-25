import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const vectorAppendixSlice = createSlice({
    name: 'vectorAppendix',
    initialState,
    reducers: {
        SET_VECTOR_XML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        SET_VECTOR_APPENDIX_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_VECTOR_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    SET_VECTOR_XML,
    SET_VECTOR_APPENDIX_INITIAL_STATE,
    RESET_VECTOR_APPENDIX_STATE
} = vectorAppendixSlice.actions

export default vectorAppendixSlice.reducer
