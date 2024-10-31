import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xml: "",
}

export const preference = createSlice({
    name: 'ppPreference',
    initialState,
    reducers: {
        setPreferenceXML: (state, preference) => {
            state.xml = preference;
        },
        RESET_PREFERENCE_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const { setPreferenceXML, RESET_PREFERENCE_STATE } = preference.actions

export default preference.reducer