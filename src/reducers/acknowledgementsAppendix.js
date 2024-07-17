import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
    xmlTagMeta: {},
}

export const acknowledgementsAppendixSlice = createSlice({
    name: 'acknowledgementsAppendix',
    initialState,
    reducers: {
        setAcknowledgementsXML: (state, action) => {
            state.xmlContent = action.payload.xml;
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setAcknowledgementsXML, RESET_ACKNOWLEDGEMENTS_APPENDIX_STATE } = acknowledgementsAppendixSlice.actions

export default acknowledgementsAppendixSlice.reducer
