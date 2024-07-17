import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isNavOpen: false,
    isPreviewToggled: false,
}

export const navBarSlice = createSlice({
    name: 'navBar',
    initialState,
    reducers: {
        setIsNavBarOpen: (state) => {
            state.isNavOpen = !state.isNavOpen
        },
        setIsPreviewToggled: (state) => {
            state.isPreviewToggled = !state.isPreviewToggled
        },
    },
})

// Action creators are generated for each case reducer function
export const { setIsNavBarOpen, setIsPreviewToggled } = navBarSlice.actions

export default navBarSlice.reducer