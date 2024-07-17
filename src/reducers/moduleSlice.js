import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xml: "",
}

export const modules = createSlice({
    name: 'modules',
    initialState,
    reducers: {
        setModulesXML: (state, modules) => {
            state.xml = modules;
        },
        RESET_MODULES_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setModulesXML, RESET_MODULES_STATE } = modules.actions

export default modules.reducer