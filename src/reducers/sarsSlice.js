import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xmlContent: "",
}

export const sarsSlice = createSlice({
    name: 'sars',
    initialState,
    reducers: {
        setXML: (state, xml) => {
            state.xmlContent = xml;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setXML } = sarsSlice.actions

export default sarsSlice.reducer