import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    xml: "",
}

export const preference = createSlice({
    name: 'ppPreference',
    initialState,
    reducers: {
        SET_PREFERENCE_XML: (state, preference) => {
            state.xml = preference;
        },
        SET_PP_PREFERENCE_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_PREFERENCE_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    SET_PREFERENCE_XML,
    SET_PP_PREFERENCE_INITIAL_STATE,
    RESET_PREFERENCE_STATE
} = preference.actions

export default preference.reducer