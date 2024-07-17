import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "132a214e-ce03-4c48-abe8-5f7d460b5fdf": {
        title: "Common Criteria Terms",
        open: false,
        "7dd1b1a6-9d15-4754-9f25-7ade6efe7b5d": {
            title: "Assurance",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "Grounds for confidence that a TOE meets the SFRs [CC].",
            open: true,
        },
        "dd05d04a-6400-453d-a2ec-014cb885b05c": {
            title: "Base Protection Profile (Base-PP)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "Protection Profile used as a basis to build a PP-Configuration.",
            open: true,
        },
        "ec318062-6a76-4f4d-a716-9607e535e8f8": {
            title: "Collaborative Protection Profile (cPP)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A Protection Profile developed by international technical communities and approved by multiple schemes.",
            open: true,
        },
        "3ae7d712-1a17-4141-b49a-6068c47f8095": {
            title: "Common Criteria (CC)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "Common Criteria for Information Technology Security Evaluation (International Standard ISO/IEC 15408).",
            open: true,
        },
        "c5b1ddf5-45e4-42f8-bb15-f4c745788aa8": {
            title: "Common Criteria Testing Laboratory",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "Within the context of the Common Criteria Evaluation and Validation Scheme (CCEVS), an IT " +
                "security evaluation facility accredited by the National Voluntary Laboratory Accreditation " +
                "Program (NVLAP) and approved by the NIAP Validation Body to conduct Common Criteria-based evaluations.",
            open: true,
        },
        "5479f15a-5765-48ed-a6fe-345c32be70bb": {
            title: "Common Evaluation Methodology (CEM)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "Common Evaluation Methodology for Information Technology Security Evaluation.",
            open: true,
        },
        "9f3bb798-30ea-46e2-80c7-ac4d20d0a85a": {
            title: "Distributed TOE",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A TOE composed of multiple components operating as a logical whole.",
            open: true,
        },
        "1787ff35-2e38-4201-bb02-305431346949": {
            title: "Extended Package (EP)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A deprecated document form for collecting SFRs that implement a particular protocol, technology, " +
                "or functionality. See Functional Packages.",
            open: true,
        },
        "aa934082-36fb-4867-aa16-71b11b21cec1": {
            title: "Functional Package (FP)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A document that collects SFRs for a particular protocol, technology, or functionality.",
            open: true,
        },
        "ebe08309-699b-40b9-a92a-a42ce7d507b2": {
            title: "Operational Environment (OE)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "Hardware and software that are outside the TOE boundary that support the TOE functionality and " +
                "security policy.",
            open: true,
        },
        "13873beb-39ce-4f2b-972d-a402d7f8d5ff": {
            title: "Protection Profile (PP)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "An implementation-independent set of security requirements for a category of products.",
            open: true,
        },
        "a1c3a4f0-6251-45e2-a259-334daa77fdf2": {
            title: "Protection Profile Configuration (PP-Configuration)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A comprehensive set of security requirements for a product type that consists of at least one " +
                "Base-PP and at least one PP-Module.",
            open: true,
        },
        "5edcd70c-1ba4-4da3-89bf-e431affa3eb7": {
            title: "Protection Profile Module (PP-Module)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "An implementation-independent statement of security needs for a TOE type complementary to one " +
                "or more Base-PPs.",
            open: true,
        },
        "e53da5ec-9229-4f43-a9f0-a19a293a5e71": {
            title: "Security Assurance Requirement (SAR)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A requirement to assure the security of the TOE.",
            open: true,
        },
        "26e9b5c0-c3b7-49b2-9bd7-384f925a8897": {
            title: "Security Functional Requirement (SFRs)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A requirement for security enforcement by the TOE.",
            open: true,
        },
        "a351f17c-89c3-4041-a7fb-dc95695e0a04": {
            title: "Security Target (ST)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A set of implementation-dependent security requirements for a specific product.",
            open: true,
        },
        "4163f61f-55d1-4549-a9d1-e48df0b71292": {
            title: "Target of Evaluation (TOE)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "The product under evaluation.",
            open: true,
        },
        "0a95e3de-95fd-4d46-a27d-3ba12339c879": {
            title: "TOE Security Functionality (TSF)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "The security functionality of the product under evaluation.",
            open: true,
        },
        "a45f8169-cf82-401d-998c-123cca8d5a1e": {
            title: "TOE Summary Specification (TSS)",
            xmlTagMeta: {
                tagName: "term",
                attributes: {}
            },
            definition: "A definition of how a TOE satisfies the SFRs in an ST.",
            open: true,
        },
    },
    "2a9beedb-a7ce-4586-b374-1c22ac37c6fa": {
        title: "Technical Terms",
        open: false,
        xmlTagMeta: {
            tagName: "tech-terms",
            attributes: {}
        },
    },
    "1f3f5182-ffbf-4259-9074-2b8f8942151e": {
        title: "Acronyms",
        open: false,
        xmlTagMeta: {
            tagName: "",
            attributes: {}
        },
    },
    "4fe05e05-3d61-47a6-b4c0-ccc1fcd29391": {
        title: "Use Cases",
        open: true,
        xmlTagMeta: {
            tagName: "usecases",
            attributes: {}
        },
        "336b6e55-48c0-4070-8e61-4d3637c2e371": {
            title: "Content Creation",
            xmlTagMeta: {
                tagName: "usecase",
                attributes: {}
            },
            definition: "The application allows a user to create content, saving it to either local or remote storage. " +
                        "Example content includes text documents, presentations, and images.",
            open: true,
        },
        "d7aa3ae4-04a4-41cd-a616-1b8de595b3c8": {
            title: "Content Consumption",
            xmlTagMeta: {
                tagName: "usecase",
                attributes: {}
            },
            definition: "The application allows a user to consume content, retrieving it from either local or remote " +
                        "storage. Example content includes web pages and video.",
            open: true,
        },
        "a5b8b22d-e1c3-49e4-a574-d42a318a2b96": {
            title: "Communication",
            xmlTagMeta: {
                tagName: "usecase",
                attributes: {}
            },
            definition: "The application allows for communication interactively or non-interactively with other users " +
                        "or applications over a communications channel. Example communications include instant messages, " +
                        "email, and voice.",
            open: true,
        },
    }
}

export const termsSlice = createSlice({
    name: 'terms',
    initialState,
    reducers: {
        CREATE_TERMS_LIST: (state, action) => {
            let newId = uuidv4();
            let title = action.payload.title
            if (!state.hasOwnProperty(newId)) {
                state[newId] = {
                    title: title,
                    open: true
                };
                action.payload = newId
            } else {
                action.payload = null
            }
        },
        UPDATE_TERMS_LIST_TITLE: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].title = newTitle
                }
            }
        },
        DELETE_TERMS_LIST: (state, action) => {
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    delete state[uuid];
                }
            }
        },
        COLLAPSE_TERMS_LIST: (state, action) => {
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].open = (open !== null && typeof open === "boolean") ? open : !state[uuid].open
                    Object.keys(state[uuid]).map((key) => {
                        if (key !== "title" && key !== "open") {
                            let value = state[uuid][key]
                            let input = {
                                payload: {
                                    termUUID: uuid,
                                    uuid: key,
                                    title: value.title,
                                    open: state[uuid].open
                                }
                            }
                            termsSlice.caseReducers.COLLAPSE_TERM_ITEM(state, input)
                        }
                    })
                }
            }
        },
        CREATE_TERM_ITEM: (state, action) => {
            let termUUID = action.payload.termUUID;
            let tagMeta = action.payload.tagMeta;
            let metaData = action.payload.metaData;
            let uuid = uuidv4();
            if (state.hasOwnProperty(termUUID)) {
                let currentTermList = state[termUUID]
                if (!currentTermList.hasOwnProperty(uuid)) {
                    currentTermList[uuid] = {
                        title: action.payload.name,
                        definition: action.payload.definition,
                        open: true,
                        xmlTagMeta: tagMeta,
                        metaData: metaData,
                    }
                }
            }
            action.payload.uuid = uuid
        },
        UPDATE_TERM_TITLE: (state, action) => {
            let termUUID = action.payload.termUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(termUUID)) {
                let currentTermList = state[termUUID]
                if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === originalTitle) {
                    currentTermList[uuid].title = newTitle
                }
            }
        },
        UPDATE_TERM_DEFINITION: (state, action) => {
            let termUUID = action.payload.termUUID;
            let uuid = action.payload.uuid;
            let originalTitle = action.payload.title;
            let newDefinition = action.payload.newDefinition;
            if (state.hasOwnProperty(termUUID)) {
                let currentTermList = state[termUUID]
                if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === originalTitle) {
                    currentTermList[uuid].definition = newDefinition
                }
            }
        },
        DELETE_TERM_ITEM: (state, action) => {
            let termUUID = action.payload.termUUID;
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(termUUID)) {
                let currentTermList = state[termUUID]
                if (currentTermList.hasOwnProperty(uuid) && currentTermList[uuid].title === title) {
                    delete currentTermList[uuid];
                }
            }
        },
        DELETE_ALL_SECTION_TERMS: (state, action) => {
            let termUUID = action.payload.termUUID;
            let title = action.payload.title;
            if (state.hasOwnProperty(termUUID) && state[termUUID].title === title) {
                Object.entries(state[termUUID]).map(([key, value]) => {
                    if (key !== "open" && key !== "title") {
                        let input = {
                            payload: {
                                title: value.title,
                                termUUID: termUUID,
                                uuid: key,
                            }
                        }
                        termsSlice.caseReducers.DELETE_TERM_ITEM(state, input)
                    }
                })
            }
        },
        COLLAPSE_TERM_ITEM: (state, action) => {
            let termUUID = action.payload.termUUID
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(termUUID) && state[termUUID].hasOwnProperty(uuid)) {
                let term = state[termUUID][uuid]
                if (term.title === title) {
                    term.open = (open !== null && typeof open === "boolean") ? open : !term.open
                }
            }
        },
        RESET_TERMS_STATE: () => initialState,
    },
})

// Action creators are generated for each case reducer function
export const {
    CREATE_TERMS_LIST,
    UPDATE_TERMS_LIST_TITLE,
    DELETE_TERMS_LIST,
    COLLAPSE_TERMS_LIST,
    CREATE_TERM_ITEM,
    UPDATE_TERM_TITLE,
    UPDATE_TERM_DEFINITION,
    DELETE_ALL_SECTION_TERMS,
    DELETE_TERM_ITEM,
    COLLAPSE_TERM_ITEM,
    RESET_TERMS_STATE
} = termsSlice.actions

export default termsSlice.reducer