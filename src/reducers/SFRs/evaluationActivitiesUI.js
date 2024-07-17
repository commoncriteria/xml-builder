import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    selectedEvaluationActivity: [],
    evaluationActivityDropdown: {Component: [], Elements: []},
    newSelectedEvaluationActivity: [],
    newEvaluationActivityDropdown: {Component: [], Elements: []},
    selectedUUID: "",
    dependencyMap: {},
}

export const evaluationActivitiesUI = createSlice({
    name: 'evaluationActivities',
    initialState,
    reducers: {
        UPDATE_EVALUATION_ACTIVITY_UI_ITEMS: (state, action) => {
            const updateMap = action.payload.updateMap
            Object.entries(updateMap).map(([key, value]) => {
                state[key] = value
            })
        },
        RESET_EVALUATION_ACTIVITY_UI: () => initialState
    },
})

// Action creators are generated for each case reducer function
export const { UPDATE_EVALUATION_ACTIVITY_UI_ITEMS, RESET_EVALUATION_ACTIVITY_UI} = evaluationActivitiesUI.actions

export default evaluationActivitiesUI.reducer