import { createSlice } from '@reduxjs/toolkit'
import { deepCopy } from "../../utils/deepCopy.js";

const initialState = {
    title: "",
    titleError: false,
    titleHelperText: "",
    id: "",
    idError: false,
    idHelperText: "",
    definition: [],
    componentType: "Column Header",
    selectType: "Selectables",
    row: {},
    rowDefinitions: {},
    originalRows: [],
    dropdownOptions: [],
    selectedColumn: "",
}

export const tabularizeUI = createSlice({
    name: 'tabularize',
    initialState,
    reducers: {
        TRANSFORM_TABULARIZE_DATA: (state, action) => {
            const {
                title = "",
                id = "",
                definition = [],
                rows= [],
                columns = [],
                type
            } = action.payload;

            // Transform definition
            if (type === "transform") {
                // Update title
                validateTitle(state, title)

                // Update id
                validateId(state, id)

                // Update definition
                state.definition = transformData(definition, rows, columns)

                // Set component Type
                state.componentType = "Column Header";
            }

            // Reverse definition
            else if (type === "reverse") {
                action.payload.tabularize = reverseData(title, id, definition)
            }
        },
        UPDATE_TABULARIZE_UI_ITEMS: (state, action) => {
            const itemMap = action.payload.itemMap
            Object.entries(itemMap).map(([key, value]) => {
                if (key === "title") {
                    const title = value ? value : ""
                    validateTitle(state, title)
                } else if (key === "id") {
                    const id = value ? value : ""
                    validateId(state, id)
                } else if (key === "definition") {
                    state[key] = value
                    let currentDefinition = value ? deepCopy(value) : []
                    state.definition = validateDefinition(currentDefinition)
                } else {
                    state[key] = value
                }
            })
        },
        INITIALIZE_EDIT_ROW_DATA: (state, action) => {
            const { newRow, definition, originalRows } = action.payload
            let { row } = action.payload
            let dropdownOptions = []
            let rowDef = {}

            // Define row definitions
            definition?.forEach((def) => {
                const { value, type } = def
                if (type === "selectcol" || type === "textcol") {
                    const field = createFieldValue(value)
                    if (field && field !== "") {
                        // Define row if it is a new row
                        if (newRow) {
                            row[field] = type === "selectcol" ? [] : ""
                        }

                        // Set definition for cell
                        rowDef[field] = type

                        // Add item to dropdown list
                        const item = {
                            key: field,
                            value: value
                        }
                        if (!dropdownOptions.includes(item)) {
                            dropdownOptions.push(item)
                        }
                    }
                }
            })

            // Update row
            state.row = row ? row : {}

            // Update row definitions
            state.rowDefinitions = rowDef

            // Set original rows
            state.originalRows = originalRows

            // Define dropdown options
            state.dropdownOptions = dropdownOptions

            // Set initialize selected column value
            state.selectedColumn = dropdownOptions && dropdownOptions.length > 0 ? dropdownOptions[0].key : ""
        },
        UPDATE_EDIT_ROW_DATA: (state, action) => {
            const { key, value } = action.payload

            // Update the row value
            if (state.row.hasOwnProperty(key)) {
                state.row[key] = value
            }
        },
        CREATE_FIELD_VALUE : (state, action) => {
            const { value } = action.payload;
            action.payload.field = createFieldValue(value)
        },
        RESET_TABULARIZE_UI: () => initialState
    },
})

// Methods
const transformData = (definition, rows, columns) => {
    let transformedDefinition = [{
        value: "Selectable ID",
        type: "textcol",
        field: "selectableId",
        column: {
            "editable": false,
            "resizable": true,
            "type": "Editor",
            "flex": 3
        },
        rows: [],
        selectDisabled: false,
        error: false,
        helperText: ""
    }]

    // Transform definition if it is not empty
    if (definition.length > 0) {
        // Create a map of columns for quick access
        const columnMap = columns.reduce((acc, column) => {
            acc[column.field] = column;
            return acc;
        }, {});

        // Transform the definition
        transformedDefinition = definition.map((def) => {
            if (def.type === 'reqtext') {
                return {
                    ...def,
                }
            } else {
                const field = createFieldValue(def.value)
                const column = columnMap[field];

                return {
                    ...def,
                    field: field,
                    column: column ? {
                        editable: column.editable,
                        resizable: column.resizable,
                        type: column.type,
                        flex: column.flex
                    } : {},
                    rows: rows?.map(row => {
                        const value = row[field];
                        if (Array.isArray(value)) {
                            return {value: deepCopy(value)};
                        }
                        return {value};
                    }),
                    selectDisabled: rows && rows.length > 0 ? true : false,
                };
            }
        });
    }

    return validateDefinition(transformedDefinition);
};
const reverseData = (title, id, definition) => {
    let newDefinition = []
    let newColumns = []
    let newRows = []

    if (definition && definition.length > 0) {
        let currentDefinition = deepCopy(definition)
        newDefinition = currentDefinition.map((def) => {
            const { value, field, type, column, rows} = def

            // Generate column data and add to columns
            if (column && Object.keys(column).length > 0) {
                const newColumn = {
                    headerName: value,
                    field: field,
                    ...column
                }
                newColumns.push(newColumn)
            }

            // Generate row data and add to rows
            if (rows && rows.length > 0) {
                rows.forEach((row, index) => {
                    const { value } = row;
                    if (!newRows[index]) {
                        newRows.push({})
                    }
                    newRows[index][field] = value
                })
            }

            // Return def
            return {
                value,
                type
            }
        })
    }

    return {
        title: title,
        id: id,
        definition: newDefinition,
        rows: newRows,
        columns: newColumns
    }
}
const validateDefinition = (currentDefinition) => {
    const validation = currentDefinition.map((def, index) => {
        const { value, type } = def
        const valueExists = currentDefinition.filter((x, filterIndex) => (
            filterIndex !== index &&
            x.type !== "reqtext" &&
            type !== "reqtext" &&
            x.value.toLowerCase() === value.toLowerCase()
        ));

        // Validate
        const { error, helperText } = getValidation(value, valueExists)
        def.error = error
        def.helperText = helperText

        return def
    })
    return validation;
}
const validateTitle = (state, title) => {
    const { error: titleError, helperText: titleHelperText } = getValidation(title);
    Object.assign(state, {
        title,
        titleError,
        titleHelperText
    });
}
const validateId = (state, id) => {
    const { error: idError, helperText: idHelperText } = getValidation(id);
    Object.assign(state, {
        id,
        idError,
        idHelperText
    });
}
const getValidation = (value, valueExists) => {
    let error = false;
    let helperText = ""

    // Check for input values
    if (value === null || value === undefined || value === "") {
        error = true
        helperText = "Field required"
    }

    // Check if value exists
    else if (valueExists && valueExists.length > 0) {
        error = true
        helperText = "Field already exists"
    }

    return { error, helperText }
}
const createFieldValue = (originalString) => {
    // Update the field value to be camel case
    if (originalString === null || originalString === undefined || originalString === "") {
        return ""
    } else if (originalString === "Selectable ID") {
        return "selectableId"
    } else {
        return originalString
            .toLowerCase()
            .split(' ')
            .map((word, index) => {
                if (index === 0) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('');
    }
}

// Action creators are generated for each case reducer function
export const {
    TRANSFORM_TABULARIZE_DATA,
    UPDATE_TABULARIZE_UI_ITEMS,
    INITIALIZE_EDIT_ROW_DATA,
    UPDATE_EDIT_ROW_DATA,
    CREATE_FIELD_VALUE,
    RESET_TABULARIZE_UI,
} = tabularizeUI.actions

export default tabularizeUI.reducer