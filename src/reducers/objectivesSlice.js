import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "8ba516d2-8336-4562-a6b3-751d722232d9": {
        title: "Security Objectives for the TOE",
        xmlTagMeta: {
            tagName: "sec:Security_Objectives_for_the_TOE",
            childTagName: "SOs",
            attributes: {}
        },
        definition: "",
        open: true,
        terms: {
            "7c436dd3-daf9-40a7-b4b0-71eb3e18cb62": {
                title: "O.PROTECTED_COMMS",
                xmlTagMeta: {
                    tagName: "SO",
                    attributes: {}
                },
                definition: "",
                open: true
            }
        }
    },
    "9d813e26-364b-4149-ae05-f2459b2d76d5": {
        title: "Security Objectives for the Operational Environment",
        xmlTagMeta: {
            tagName: "sec:Security_Objectives_for_the_Operational_Environment",
            childTagName: "SOEs",
            attributes: {}
        },
        definition: "",
        open: true,
        terms: {
            "d345b610-6ff9-4f8d-9776-c5f794862f5f": {
                title: "OE.CONFIG",
                xmlTagMeta: {
                    tagName: "SOE",
                    attributes: {}
                },
                definition: "",
                open: true
            }
        }
    },
}

export const objectivesSlice = createSlice({
    name: 'objectives',
    initialState,
    reducers: {
        CREATE_OBJECTIVE_SECTION: (state, action) => {
            let newId = uuidv4();
            let title = action.payload.title
            if (!state.hasOwnProperty(newId)) {
                state[newId] = {
                    title: title,
                    definition: "",
                    terms: {},
                    open: true
                };
                action.payload = newId
            } else {
                action.payload = null
            }
        },
        UPDATE_OBJECTIVE_SECTION_TITLE: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].title = newTitle
                }
            }
        },
        UPDATE_OBJECTIVE_SECTION_DEFINITION: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newDefinition = action.payload.newDefinition;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].definition = newDefinition
                }
            }
        },
        DELETE_OBJECTIVE_SECTION: (state, action) => {
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    delete state[uuid];
                }
            }
        },
        COLLAPSE_OBJECTIVE_SECTION: (state, action) => {
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].open = (open !== null && typeof open === "boolean") ? open : !state[uuid].open
                }
            }
        },
        CREATE_OBJECTIVE_TERM: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID;
            let title = action.payload.title;
            let definition = action.payload.definition;
            let sfrs = action.payload.sfrs;
            let uuid = uuidv4();
            if (state.hasOwnProperty(objectiveUUID)) {
                let currentTermList = state[objectiveUUID]
                if (!currentTermList.hasOwnProperty(uuid)) {
                    currentTermList.terms[uuid] = {
                        title: title ? title : "",
                        definition: definition ? definition : "",
                        sfrs: sfrs ? sfrs : [],
                        open: true,
                    }
                }
            }
            // Sort objective lists
            objectivesSlice.caseReducers.sortObjectiveTermsListHelper(state)

            // Return the uuid
            action.payload.id = uuid
        },
        UPDATE_OBJECTIVE_TERM_TITLE: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(objectiveUUID)) {
                if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === originalTitle) {
                    state[objectiveUUID].terms[uuid].title = newTitle
                }
            }
            // Sort objective lists
            objectivesSlice.caseReducers.sortObjectiveTermsListHelper(state)
        },
        UPDATE_OBJECTIVE_TERM_DEFINITION: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            let newDefinition = action.payload.newDefinition;
            if (state.hasOwnProperty(objectiveUUID)) {
                if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === originalTitle) {
                    state[objectiveUUID].terms[uuid].definition = newDefinition
                }
            }
        },
        DELETE_OBJECTIVE_TERM: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID;
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(objectiveUUID)) {
                if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === title) {
                    delete state[objectiveUUID].terms[uuid]
                }
            }
            // Sort objective lists
            objectivesSlice.caseReducers.sortObjectiveTermsListHelper(state)
        },
        DELETE_ALL_OBJECTIVE_TERMS: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID;
            let title = action.payload.title;
            if (state.hasOwnProperty(objectiveUUID) && state[objectiveUUID].title === title) {
                let terms = state[objectiveUUID].terms
                if (terms && terms !== undefined) {
                    state[objectiveUUID].terms = {}
                }
            }
        },
        COLLAPSE_OBJECTIVE_TERM: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(objectiveUUID)) {
                if (state[objectiveUUID].terms.hasOwnProperty(uuid) && state[objectiveUUID].terms[uuid].title === title) {
                    let threat = state[objectiveUUID].terms[uuid]
                    threat.open = (open !== null && typeof open === "boolean") ? open : !threat.open
                }
            }
        },
        sortObjectiveTermsListHelper: (state) => {
            Object.entries(state).map(([key, value]) => {
                if (value.terms && Object.entries(value.terms).length > 0) {
                    let sorted = Object.entries(value.terms).sort((a, b) => {
                        const nameA = a[1].title.toUpperCase();
                        const nameB = b[1].title.toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        // names must be equal
                        return 0;
                    });
                    value.terms = Object.fromEntries(sorted)
                }
            })
        },
        RESET_OBJECTIVES_STATE: () => initialState,
    }
})

// Action creators are generated for each case reducer function
export const {
    CREATE_OBJECTIVE_SECTION,
    UPDATE_OBJECTIVE_SECTION_TITLE,
    UPDATE_OBJECTIVE_SECTION_DEFINITION,
    DELETE_OBJECTIVE_SECTION,
    COLLAPSE_OBJECTIVE_SECTION,
    CREATE_OBJECTIVE_TERM,
    UPDATE_OBJECTIVE_TERM_TITLE,
    UPDATE_OBJECTIVE_TERM_DEFINITION,
    DELETE_OBJECTIVE_TERM,
    DELETE_ALL_OBJECTIVE_TERMS,
    COLLAPSE_OBJECTIVE_TERM,
    sortObjectiveTermsListHelper,
    RESET_OBJECTIVES_STATE
} = objectivesSlice.actions

export default objectivesSlice.reducer