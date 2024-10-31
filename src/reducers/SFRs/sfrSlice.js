import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    auditSection: "",
    sfrDefinition: "<p>This chapter describes the security requirements which have to be fulfilled by the product under " +
                    "evaluation.Those requirements comprise functional components from Part 2 and assurance components " +
                    "from Part 3 of [CC].The following conventions are used for the completion of operations:" +
                    "</p><ul><li><strong>Refinement </strong>operation (denoted by <strong>bold text </strong>or " +
                    "<s>strikethrough text</s>): Is used to add details to a requirement (including replacing an assignment " +
                    "with a more restrictive selection) or to remove part of the requirement that is made irrelevant through " +
                    "the completion of another operation, and thus further restricts a requirement.</li><li><strong>" +
                    "Selection </strong>(denoted by <em>italicized text</em>): Is used to select one or more options provided " +
                    "by the [CC] in stating a requirement.</li><li><strong>Assignment operation </strong>(denoted by italicized text): " +
                    "Is used to assign a specific value to an unspecified parameter, such as the length of a password. " +
                    "Showing the value in square brackets indicates assignment.</li><li><strong>Iteration operation</strong>: " +
                    "Is indicated by appending the SFRs name with a slash and unique identifier suggesting the purpose of " +
                    "the operation, e.g. \"/EXAMPLE1.\"</li></ul>",
    sections: {
        "b31a725c-c861-4894-af59-6bbc3f4cfb24": {
            title: "Class: Security Audit (FAU)",
            definition: "",
            open: false,
        },
        "d1c1f277-ad2e-42ac-9df6-0c3042e6f95e": {
            title: "Class: Cryptographic Support (FCS)",
            definition: "",
            open: false,
        },
        "4bb085f1-8c48-4eb5-89e2-ac64d3240672": {
            title: "Class: Cryptographic Storage (FCS_STG)",
            definition: "",
            open: false
        },
        "51e17056-64d3-47b3-b6ac-965ebb96a48a": {
            title: "Class: User Data Protection (FDP)",
            definition: "",
            open: false
        },
        "7736aac5-991f-473c-99dd-dcbf1946b2a7": {
            title: "Class: Identification and Authentication (FIA)",
            definition: "",
            open: false
        },
        "2cc212e3-ab29-476a-bc5f-808538963720": {
            title: "Class: Security Management (FMT)",
            definition: "",
            open: false
        },
        "fae72dca-fe47-4c3f-a729-782d6750c6c6": {
            title: "Class: Protection of the TSF (FPT)",
            definition: "",
            open: false
        },
        "5c4b2567-2084-4b28-89ea-d3fb21806eb5": {
            title: "Class: TOE Access (FTA)",
            definition: "",
            open: false
        },
        "011e6f21-8cc9-46d5-ab10-ea9ee86d677c": {
            title: "Class: Trusted Path/Channels (FTP)",
            definition: "",
            open: false
        },
    },
    implementation_based: {
        reasoning: ""
    }
}

export const sfrSlice = createSlice({
    name: 'sfrs',
    initialState,
    reducers: {
        UPDATE_MAIN_SFR_DEFINITION: (state, action) => {
            state.sfrDefinition = action.payload.newDefinition
        },
        UPDATE_AUDIT_SECTION: (state, action) => {
            state.auditSection = action.payload.newDefinition
        },
        CREATE_SFR_SECTION: (state, action) => {
            let newId = uuidv4();
            let title = action.payload.title
            let definition = action.payload.definition
            if (!state.sections.hasOwnProperty(newId)) {
                state.sections[newId] = {
                    title: title,
                    definition: definition,
                    open: false
                };
                action.payload = newId
            } else {
                action.payload = null
            }
        },
        UPDATE_SFR_SECTION_TITLE: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newTitle = action.payload.newTitle;
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title){
                    state.sections[uuid].title = newTitle
                }
            }
        },
        UPDATE_SFR_SECTION_DEFINITION: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newDefinition = action.payload.newDefinition;
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title){
                    state.sections[uuid].definition = newDefinition
                }
            }
        },
        DELETE_SFR: (state, action) => {
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.sections.hasOwnProperty(uuid)) {
                if (!title) {
                    delete state.sections[uuid];
                } else {
                    if (state.sections[uuid].title === title) {
                        delete state.sections[uuid];
                    }
                }
            }
        },
        DELETE_ALL_SFR_SECTIONS: (state) => {
            Object.entries(state.sections).map(([key, value]) => {
                delete state.sections[key];
            })
        },
        COLLAPSE_SFR_SECTION: (state, action) => {
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title) {
                    state.sections[uuid].open = (open !== null && typeof open === "boolean") ? open : !state.sections[uuid].open
                }
            }
        },
        SET_IMPLMENTATION_REASONING: (state, action) => {
            state.implementation_based = action.payload.xml
        },
        RESET_SFR_STATE: () => initialState
    }
})

// Action creators are generated for each case reducer function
export const {
    UPDATE_MAIN_SFR_DEFINITION,
    CREATE_SFR_SECTION,
    UPDATE_AUDIT_SECTION,
    UPDATE_SFR_SECTION_TITLE,
    UPDATE_SFR_SECTION_DEFINITION,
    DELETE_ALL_SFR_SECTIONS,
    COLLAPSE_SFR_SECTION,
    RESET_SFR_STATE,
    DELETE_SFR,
    SET_IMPLMENTATION_REASONING
} = sfrSlice.actions

export default sfrSlice.reducer