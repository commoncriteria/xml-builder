import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    title: "TOE Overview",
    xmlTagMeta: {
        tagName: "section",
        attributes: {
            title: "Compliant Targets of Evaluation"
        }
    },
    introText: "",
    columnData: [
        { headerName: "Component", field: "componentID", editable: true, resizable: true, type: "Select", flex: 0.5 },
        { headerName: "Explanation", field: "notes", editable: true, resizable: true, type: "Editor", flex: 1 },
    ],
    rowData: [],
    dropdownMenuOptions: [],
    additionalText: "",
    open: false
}

export const compliantTargetsOfEvaluationSlice = createSlice({
    name: 'compliantTargetsOfEvaluation',
    initialState,
    reducers: {
        SET_COMPLIANT_TARGETS_OF_EVALUATION_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        ADD_NEW_TABLE_ROW: (state) => {
            let newRow = {
                componentID: [],
                notes: ""
            }
            state.rowData.push(newRow)

            // Sort row data
            sortByLabel(state.rowData, true)
        },
        UPDATE_ROW_DATA_COMPONENT_ID_BY_INDEX: (state, action) => {
            const { index, value, sfrMaps } = action.payload;
            const { sfrNameMap } = sfrMaps

            // Update component id
            const rowIndexIsValid = state.rowData[index] && state.rowData[index].hasOwnProperty("componentID")
            const includesSfrName = sfrMaps && sfrNameMap.hasOwnProperty(value)
            if (rowIndexIsValid && includesSfrName) {
                const uuid = sfrNameMap[value]
                state.rowData[index].componentID = {
                    label: value,
                    key: uuid
                }
            }

            // Sort Row Data
            state.rowData = sortByLabel(state.rowData, true)
        },
        UPDATE_ROW_DATA_NOTES_BY_INDEX: (state, action) => {
            const { index, value } = action.payload;

            // Update notes
            if (state.rowData[index] && state.rowData[index].hasOwnProperty("notes")) {
                state.rowData[index].notes = value
            }
        },
        UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY: (state, action) => {
            let { itemMap } = action.payload

            if (itemMap && Object.keys(itemMap).length > 0) {
                Object.entries(itemMap).forEach(([key, value]) => {
                    if (state.hasOwnProperty(key)) {
                        state[key] = value
                    }
                })
            }
        },
        UPDATE_DROPDOWN_MENU_OPTIONS: (state, action) => {
            const { sfrMaps } = action.payload;
            let dropdownMenuOptions = []

            // Update dropdown menu options
            if (sfrMaps) {
                const { sfrUUIDMap } = sfrMaps

                // Generate dropdown menu
                if (sfrUUIDMap) {
                    // Update the rowData if the component has changed
                    state.rowData.map((row, index) => {
                        let { componentID } = row

                        // Update the row data if the componentID has the expected values
                        if (componentID && componentID.hasOwnProperty("label") && componentID.hasOwnProperty("key")) {
                            let { label, key: uuid } = componentID

                            // Check if the sfrUUIDMap has the uuid
                            if (sfrUUIDMap[uuid]) {
                                // Update the name of the component if it has changed
                                if (sfrUUIDMap[uuid] !== label) {
                                    state.rowData[index].componentID.label = sfrUUIDMap[uuid]
                                }
                            }

                            // Delete rowData entry if the sfrUUIDMap no longer has the selected uuid
                            else {
                                state.rowData.splice(index, 1);
                            }
                        }
                    })

                    // Get updated selected row data
                    const selected = state.rowData
                        .filter(item => item.hasOwnProperty("componentID") && item.componentID.hasOwnProperty("key"))
                        .map(item => item.componentID.key);

                    // Update the dropdown values
                    Object.entries(sfrUUIDMap).forEach(([key, value]) => {
                        // Set disabled if the option has already been selected
                        const disabled = selected.includes(key) ? true : false

                        // Create the menu option
                        const option = {
                            disabled: disabled,
                            key: key,
                            label: value
                        }

                        // Add to drop down menu
                        if (!dropdownMenuOptions.includes(option)) {
                            dropdownMenuOptions.push(option)
                        }
                    })
                }
            }

            // Sort dropdown menu
            dropdownMenuOptions = sortByLabel(dropdownMenuOptions, false)

            // Update the state
            if (JSON.stringify(state.dropdownMenuOptions) !== JSON.stringify(dropdownMenuOptions)) {
                state.dropdownMenuOptions = dropdownMenuOptions
            }
        },
        RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE: () => ({...initialState}),
    },
})

// Local Methods
/**
 * Sorts the array by label
 * @param inputArray the input array
 * @param componentID if the array includes componentID
 * @returns {*}
 */
const sortByLabel = (inputArray, componentID) => {
    return inputArray.sort((a, b) => {
        let nameA;
        let nameB;

        // Update labels
        if (componentID) {
            nameA = a.componentID.label ? a.componentID.label.toUpperCase() : ""
            nameB = b.componentID.label ? b.componentID.label.toUpperCase() : ""
        } else {
            nameA = a.label ? a.label.toUpperCase() : ""
            nameB = b.label ? b.label.toUpperCase() : ""
        }

        // Sort by name
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    });
}

// Action creators are generated for each case reducer function
export const {
    SET_COMPLIANT_TARGETS_OF_EVALUATION_INITIAL_STATE,
    UPDATE_ROW_DATA_COMPONENT_ID_BY_INDEX,
    UPDATE_ROW_DATA_NOTES_BY_INDEX,
    UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY,
    UPDATE_DROPDOWN_MENU_OPTIONS,
    ADD_NEW_TABLE_ROW,
    RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE
} = compliantTargetsOfEvaluationSlice.actions

export default compliantTargetsOfEvaluationSlice.reducer