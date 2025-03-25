import { createSlice } from '@reduxjs/toolkit'
import { deepCopy } from '../../utils/deepCopy'

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
        GET_DEPENDENCY_MAP: (state, action) => {
            let { sfrUUID, componentUUID, elementMaps, sfrSections } = action.payload
            let dependencies = {
                elementsToSelectables: {},
                elementsToComplexSelectables: {},
                selectablesToUUID: {},
                uuidToSelectables: {}
            }

            // Create dependency map
            if (sfrSections.hasOwnProperty(sfrUUID) && sfrSections[sfrUUID].hasOwnProperty(componentUUID) && sfrSections[sfrUUID][componentUUID].hasOwnProperty("elements")) {
                let elements = deepCopy(sfrSections[sfrUUID][componentUUID].elements)
                if (elements && Object.entries(elements).length > 0) {
                    Object.entries(elements).forEach(([uuid, element]) => {
                        if (elementMaps.elementUUIDMap.hasOwnProperty(uuid)) {
                            let name = elementMaps.elementUUIDMap[uuid]

                            // Get selectables
                            let selectableArray = []
                            if (element.hasOwnProperty("selectables")) {
                                let selectables = deepCopy(element.selectables)
                                if (selectables && Object.entries(selectables).length > 0) {
                                    Object.entries(selectables).forEach(([selectableUUID, selectable]) => {
                                        let isAssignment = selectable.assignment ? true : false
                                        if (!isAssignment) {
                                            let selectableName = selectable.id ? (`${selectable.description} (${selectable.id})`) : selectable.description
                                            dependencies.selectablesToUUID[selectableName] = selectableUUID
                                            dependencies.uuidToSelectables[selectableUUID] = selectableName
                                            if (!selectableArray.includes(selectableName)) {
                                                selectableArray.push(selectableName)
                                            }
                                        }
                                    })
                                    selectableArray.sort()
                                    dependencies.elementsToSelectables[name] = selectableArray
                                }
                            }

                            // Get complex selectables
                            let complexSelectableArray = []
                            if (element.hasOwnProperty("selectableGroups")) {
                                let selectableGroups = deepCopy(element.selectableGroups)
                                if (selectableGroups && Object.entries(selectableGroups).length > 0) {
                                    Object.entries(selectableGroups).forEach(([selectableGroupID, value]) => {
                                        let isComplexSelectable = value.hasOwnProperty("description") ? true : false
                                        if (isComplexSelectable) {
                                            if (!complexSelectableArray.includes(selectableGroupID)) {
                                                complexSelectableArray.push(selectableGroupID)
                                            }
                                        }
                                    })
                                    complexSelectableArray.sort()
                                    dependencies.elementsToComplexSelectables[name] = complexSelectableArray
                                }
                            }
                        }
                    })
                }
            }
            action.payload.dependencies = dependencies
        },
        RESET_EVALUATION_ACTIVITY_UI: () => initialState
    },
})

// Action creators are generated for each case reducer function
export const {
    UPDATE_EVALUATION_ACTIVITY_UI_ITEMS,
    GET_DEPENDENCY_MAP,
    RESET_EVALUATION_ACTIVITY_UI
} = evaluationActivitiesUI.actions

export default evaluationActivitiesUI.reducer