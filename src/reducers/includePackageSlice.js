import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    packages: [],
}

export const includePackage = createSlice({
    name: 'includePackage',
    initialState,
    reducers: {
        ADD_PACKAGE: (state, pkg) => {
            state.packages.push(pkg);
        },
        RESET_PACKAGE_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { ADD_PACKAGE, RESET_PACKAGE_STATE } = includePackage.actions

export default includePackage.reducer