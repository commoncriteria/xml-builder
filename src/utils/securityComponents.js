// Imports
import store from '../app/store.js';
import { UPDATE_EDIT_ROW_DATA, UPDATE_TABULARIZE_UI_ITEMS } from "../reducers/SFRs/tabularizeUI.js";

/**
 * The Security Components utilities class used for global methods for security components
 */
class SecurityComponents {
    // Constants
    static instance;

    // Constructor
    constructor() {
        if (SecurityComponents.instance) {
            return SecurityComponents.instance;
        }
        SecurityComponents.instance = this;
    }

    // Methods
    handleCryptoUpdate(params) {
        const { updateType, key, value, index, definitionType } = params
        const state = store.getState();
        const { row } = state.tabularize;
        let itemMap = {}
        const updateRow = true

        // Handle selectables
        if (definitionType === "selectcol") {
            let currentCell = JSON.parse(JSON.stringify(row[key]))

            // Handle adding a new type
            if (updateType === "add") {
                currentCell.push(value)
            }
            // Handle deleting an item
            else if (updateType === "delete") {
                currentCell.splice(index, 1)
            }
            // Handle updating
            else if (updateType === "update") {
                const isValidIndex = index !== undefined && index !== null && typeof index === "number"

                // Handle updating an item at a specific index
                if (isValidIndex) {
                    currentCell[index] = value
                }
                // Handle updating the entire cell value
                else {
                    currentCell = value
                }
            }

            // Update itemMap
            itemMap = {
                key: key,
                value: currentCell
            }
        }
        // Handle text updates
        else if (definitionType === "textcol" && updateType === "update") {
            itemMap = {
                key: key,
                value: value
            }
        }

        // Update tabularize ui
        this.updateTabularizeUI(itemMap, updateRow)
    }

    // Helper Methods
    updateTabularizeUI (itemMap, updateRow) {
        // Update row data
        if (updateRow) {
            store.dispatch(UPDATE_EDIT_ROW_DATA(itemMap))
        }
        // Update ui items
        else {
            store.dispatch(UPDATE_TABULARIZE_UI_ITEMS({itemMap}))
        }
    }
}

// Export Security Components
export default new SecurityComponents();