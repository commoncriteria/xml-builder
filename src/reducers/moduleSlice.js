import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xml: "",
}

export const modules = createSlice({
    name: 'modules',
    initialState,
    reducers: {
        SET_MODULES_XML: (state, modules) => {
            state.xml = modules;
        },
        SET_MODULES_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_MODULES_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    SET_MODULES_XML,
    SET_MODULES_INITIAL_STATE,
    RESET_MODULES_STATE
} = modules.actions

export default modules.reducer