import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "securityProblemDefinition": "",
    "c0dbc61b-cf58-4db6-985b-5539ae2f7455": {
        title: "Threats",
        xmlTagMeta: {
            tagName: "sec:Threats",
            childTagName: "threats",
            attributes: {}
        },
        definition: "",
        open: true,
        terms: {
            "879ebadf-0293-4a90-b4c1-66462a66b553": {
                title: "T.NETWORK_EAVESDROP",
                xmlTagMeta: {
                    tagName: "threat",
                    attributes: {}
                },
                definition: "",
                objectives: [
                    {
                        uuid: "7c436dd3-daf9-40a7-b4b0-71eb3e18cb62",
                        rationale: ""
                    },
                ],
                open: true,
                tableOpen: false
            }
        }
    },
    "3a8ef499-784b-485c-8321-a02083aafda8": {
        title: "Assumptions",
        xmlTagMeta: {
            tagName: "sec:Assumptions",
            childTagName: "assumptions",
            attributes: {}
        },
        definition: "",
        open: true,
        terms: {
            "9bba769f-6aa8-4249-9c3f-a7c38da06e41": {
                title: "A.CONFIG",
                xmlTagMeta: {
                    tagName: "assumption",
                    attributes: {}
                },
                definition: "",
                objectives: [],
                open: true,
                tableOpen: false
            }
        }
    },
}

export const threatsSlice = createSlice({
    name: 'threats',
    initialState,
    reducers: {
        UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION: (state, action) => {
            state.securityProblemDefinition = action.payload.newDefinition
        },
        CREATE_THREAT_SECTION: (state, action) => {
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
        UPDATE_THREAT_SECTION_TITLE: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].title = newTitle
                }
            }
        },
        UPDATE_THREAT_SECTION_DEFINITION: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newDefinition = action.payload.newDefinition;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].definition = newDefinition
                }
            }
        },
        DELETE_THREAT_SECTION: (state, action) => {
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    delete state[uuid];
                }
            }
        },
        COLLAPSE_THREAT_SECTION: (state, action) => {
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].open = (open !== null && typeof open === "boolean") ? open : !state[uuid].open
                }
            }
        },
        CREATE_THREAT_TERM: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let title = action.payload.title;
            let definition = action.payload.definition;
            let objectives = action.payload.objectives;
            let uuid = uuidv4();
            if (state.hasOwnProperty(threatUUID)) {
                let currentTermList = state[threatUUID]
                if (!currentTermList.hasOwnProperty(uuid)) {
                    currentTermList.terms[uuid] = {
                        title: title ? title : "",
                        definition: definition ? definition : "",
                        objectives: objectives ? objectives: [],
                        open: true,
                        tableOpen: false,
                    }
                }
            }
            // Sort terms lists
            threatsSlice.caseReducers.sortThreatsTermsListHelper(state)
        },
        UPDATE_THREAT_TERM_TITLE: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(threatUUID)) {
                if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === originalTitle) {
                    state[threatUUID].terms[uuid].title = newTitle
                }
            }
            // Sort terms lists
            threatsSlice.caseReducers.sortThreatsTermsListHelper(state)
        },
        UPDATE_THREAT_TERM_DEFINITION: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            let newDefinition = action.payload.newDefinition;
            if (state.hasOwnProperty(threatUUID)) {
                if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === originalTitle) {
                    state[threatUUID].terms[uuid].definition = newDefinition
                }
            }
        },
        DELETE_THREAT_TERM: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(threatUUID)) {
                if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === title) {
                    delete state[threatUUID].terms[uuid]
                }
            }
            // Sort terms lists
            threatsSlice.caseReducers.sortThreatsTermsListHelper(state)
        },
        DELETE_ALL_THREAT_TERMS: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let title = action.payload.title;
            if (state.hasOwnProperty(threatUUID) && state[threatUUID].title === title) {
                let terms = state[threatUUID].terms
                if (terms && terms !== undefined) {
                    state[threatUUID].terms = {}
                }
            }
        },
        COLLAPSE_THREAT_TERM: (state, action) => {
            let threatUUID = action.payload.threatUUID
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(threatUUID)) {
                if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === title) {
                    let threat = state[threatUUID].terms[uuid]
                    threat.open = (open !== null && typeof open === "boolean") ? open : !threat.open
                }
            }
        },
        ADD_THREAT_TERM_OBJECTIVE: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let uuid = action.payload.uuid;
            let objectiveUUID = action.payload.objectiveUUID;
            let rationale = action.payload.rationale ? action.payload.rationale : ""
            let originalTitle = action.payload.title;
            if (state.hasOwnProperty(threatUUID)) {
                let currentThreatList = state[threatUUID].terms
                if (currentThreatList.hasOwnProperty(uuid) && currentThreatList[uuid].title === originalTitle) {
                    let uuidExists = false
                    currentThreatList[uuid].objectives.map((objective) => {
                        if (objective.uuid === objectiveUUID) {
                            uuidExists = true
                        }
                    })
                    if (!uuidExists) {
                        currentThreatList[uuid].objectives.push({ uuid: objectiveUUID, rationale: rationale })
                    }
                }
            }
        },
        UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let uuid = action.payload.uuid;
            let objectiveUUID = action.payload.objectiveUUID;
            let newRationale = action.payload.newRationale;
            if (state.hasOwnProperty(threatUUID)) {
                let currentThreatList = state[threatUUID].terms
                if (currentThreatList.hasOwnProperty(uuid)) {
                    currentThreatList[uuid].objectives.map((objective) => {
                        if (objective.uuid === objectiveUUID) {
                            objective.rationale = newRationale
                        }
                    })
                }
            }
        },
        DELETE_THREAT_TERM_OBJECTIVE: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let uuid = action.payload.uuid;
            let objectiveUUID = action.payload.objectiveUUID;
            if (state.hasOwnProperty(threatUUID)) {
                let currentThreatList = state[threatUUID].terms
                if (currentThreatList.hasOwnProperty(uuid)) {
                    currentThreatList[uuid].objectives.map((objective, index) => {
                        if (objective.uuid === objectiveUUID) {
                            currentThreatList[uuid].objectives.splice(index, 1)
                        }
                    })
                }
            }
        },
        COLLAPSE_THREAT_TO_OBJECTIVE_TABLE: (state, action) => {
            let threatUUID = action.payload.threatUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            if (state.hasOwnProperty(threatUUID)) {
                let currentThreatList = state[threatUUID].terms
                if (currentThreatList.hasOwnProperty(uuid) && currentThreatList[uuid].title === originalTitle) {
                    let threat = state[threatUUID].terms[uuid]
                    threat.tableOpen = !threat.tableOpen
                }
            }
        },
        DELETE_OBJECTIVE_FROM_THREAT_USING_UUID: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID
            Object.values(state).map((value) => {
                Object.values(value.terms).map((term) => {
                    if (term.objectives && Object.entries(term.objectives).length > 0) {
                        (term.objectives)?.map((objective, index) => {
                            if (objective.uuid === objectiveUUID) {
                                term.objectives.splice(index, 1)
                            }
                        })
                    }
                })
            })
        },
        sortThreatsTermsListHelper: (state) => {
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
        sortObjectivesFromThreatsHelper: (state, action) => {
            let threatUUID = action.payload.threatUUID
            let uuid = action.payload.uuid
            let uuidMap = action.payload.uuidMap
            let objectives = state[threatUUID].terms[uuid].objectives
            objectives.sort((a, b) => {
                const nameA = uuidMap[a.uuid].toUpperCase();
                const nameB = uuidMap[b.uuid].toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                // names must be equal
                return 0;
            });
        },
        RESET_THREATS_STATE: () => initialState,
        // TODO: add in delete objectives on parent delete
    }
})

// Action creators are generated for each case reducer function
export const {
    UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION,
    CREATE_THREAT_SECTION,
    UPDATE_THREAT_SECTION_TITLE,
    UPDATE_THREAT_SECTION_DEFINITION,
    DELETE_THREAT_SECTION,
    COLLAPSE_THREAT_SECTION,
    CREATE_THREAT_TERM,
    UPDATE_THREAT_TERM_TITLE,
    UPDATE_THREAT_TERM_DEFINITION,
    DELETE_THREAT_TERM,
    DELETE_ALL_THREAT_TERMS,
    COLLAPSE_THREAT_TERM,
    ADD_THREAT_TERM_OBJECTIVE,
    UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE,
    DELETE_THREAT_TERM_OBJECTIVE,
    COLLAPSE_THREAT_TO_OBJECTIVE_TABLE,
    DELETE_OBJECTIVE_FROM_THREAT_USING_UUID,
    sortThreatsTermsListHelper,
    sortObjectivesFromThreatsHelper,
    RESET_THREATS_STATE
} = threatsSlice.actions

export default threatsSlice.reducer