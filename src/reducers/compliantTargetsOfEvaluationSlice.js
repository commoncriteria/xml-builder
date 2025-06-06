import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  title: "TOE Overview",
  xmlTagMeta: {
    tagName: "section",
    attributes: {
      title: "Compliant Targets of Evaluation",
    },
  },
  introText: "",
  columnData: [
    { headerName: "Component", field: "componentID", editable: true, resizable: true, type: "Select", flex: 0.5 },
    { headerName: "Explanation", field: "notes", editable: true, resizable: true, type: "Large Editor", flex: 1 },
  ],
  rowData: [],
  dropdownMenuOptions: [],
  additionalText: "",
  open: false,
};

export const compliantTargetsOfEvaluationSlice = createSlice({
  name: "compliantTargetsOfEvaluation",
  initialState,
  reducers: {
    SET_COMPLIANT_TARGETS_OF_EVALUATION_INTRO: (state, action) => {
      state.introText = action.payload.text;
    },
    SET_COMPLIANT_TARGETS_OF_EVALUATION_ADDITIONAL_TEXT: (state, action) => {
      state.additionalText = action.payload.text;
    },
    SET_COMPLIANT_TARGETS_OF_EVALUATION_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    ADD_NEW_TABLE_ROW: (state) => {
      let newRow = {
        componentID: "",
        notes: "",
      };
      state.rowData.push(newRow);

      // Sort row data
      sortByLabel(state.rowData, true);
    },
    LOAD_TABLE_ROWS: (state, action) => {
      action.payload.components.forEach((component) => {
        state.rowData.push({ componentID: component.compID, notes: component.notes });
      });

      // Sort row data
      sortByLabel(state.rowData, true);
    },
    UPDATE_ROW_DATA_COMPONENT_ID_BY_INDEX: (state, action) => {
      const { index, value } = action.payload;

      // Update component id
      const rowIndexIsValid = state.rowData[index] && state.rowData[index].hasOwnProperty("componentID");
      if (rowIndexIsValid) {
        state.rowData[index].componentID = value;
      }

      // Sort Row Data
      state.rowData = sortByLabel(state.rowData, true);
    },
    UPDATE_ROW_DATA_NOTES_BY_INDEX: (state, action) => {
      const { index, value } = action.payload;

      // Update notes
      if (state.rowData[index] && state.rowData[index].hasOwnProperty("notes")) {
        state.rowData[index].notes = value;
      }
    },
    UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY: (state, action) => {
      let { itemMap } = action.payload;

      if (itemMap && Object.keys(itemMap).length > 0) {
        Object.entries(itemMap).forEach(([key, value]) => {
          if (state.hasOwnProperty(key)) {
            state[key] = value;
          }
        });
      }
    },
    UPDATE_DROPDOWN_MENU_OPTIONS: (state, action) => {
      let dropdownMenuOptions = [];

      // Get selected componentIDs from current rowData
      const selectedLabels = state.rowData.map((row) => (typeof row.componentID === "string" ? row.componentID : ""));

      // Build dropdown options
      dropdownMenuOptions = action.payload.sfrComponents.map((label) => ({
        label,
        key: uuidv4(),
        disabled: selectedLabels.includes(label),
      }));

      // Sort dropdown menu
      dropdownMenuOptions = sortByLabel(dropdownMenuOptions, false);

      // Only update state if it actually changed
      if (JSON.stringify(state.dropdownMenuOptions) !== JSON.stringify(dropdownMenuOptions)) {
        state.dropdownMenuOptions = dropdownMenuOptions;
      }
    },
    RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE: () => initialState,
  },
});

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
      nameA = a.componentID.label ? a.componentID.label.toUpperCase() : "";
      nameB = b.componentID.label ? b.componentID.label.toUpperCase() : "";
    } else {
      nameA = a.label ? a.label.toUpperCase() : "";
      nameB = b.label ? b.label.toUpperCase() : "";
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
};

// Action creators are generated for each case reducer function
export const {
  SET_COMPLIANT_TARGETS_OF_EVALUATION_INTRO,
  SET_COMPLIANT_TARGETS_OF_EVALUATION_ADDITIONAL_TEXT,
  SET_COMPLIANT_TARGETS_OF_EVALUATION_INITIAL_STATE,
  UPDATE_ROW_DATA_COMPONENT_ID_BY_INDEX,
  UPDATE_ROW_DATA_NOTES_BY_INDEX,
  UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY,
  UPDATE_DROPDOWN_MENU_OPTIONS,
  ADD_NEW_TABLE_ROW,
  LOAD_TABLE_ROWS,
  RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE,
} = compliantTargetsOfEvaluationSlice.actions;

export default compliantTargetsOfEvaluationSlice.reducer;
