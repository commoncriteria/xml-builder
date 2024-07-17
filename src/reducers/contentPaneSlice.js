import { createSlice } from '@reduxjs/toolkit'

const initialState = { }

export const contentPaneSlice = createSlice({
    name: 'contentPane',
    initialState,
    reducers: { },
})

// Action creators are generated for each case reducer function
export const { } = contentPaneSlice.actions

export default contentPaneSlice.reducer