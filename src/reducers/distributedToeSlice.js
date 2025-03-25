import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    intro: "",
    xmlTagMeta: {},
}

export const distributedToeSlice = createSlice({
    name: 'distributedTOE',
    initialState,
    reducers: {
        UPDATE_DISTRIBUTED_TOE_INTRO: (state, action) => {
            state.intro = action.payload.newIntro
            if(Object.keys(state.xmlTagMeta).length === 0) {
                state.xmlTagMeta = action.payload.xmlTagMeta ? action.payload.xmlTagMeta : 
                {
                    tagName: "section",
                    attributes: {}
                };
            }
        },
        SET_DISTRIBUTED_TOE_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_DISTRIBUTED_TOE_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    UPDATE_DISTRIBUTED_TOE_INTRO,
    SET_DISTRIBUTED_TOE_INITIAL_STATE,
    RESET_DISTRIBUTED_TOE_STATE
} = distributedToeSlice.actions

export default distributedToeSlice.reducer
