import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    loadedfile: {
        filename: "",
        content: ""
    },
    platformdata: {
        description: "",
        platforms: []
    },
    metadata: {
        open: true,
        ppName: "",
        version: "",
        releaseDate: "",
        revisionHistory: [],
        xmlTagMeta: {}
    },
    sections: {
        "bfeff570-4ed9-461e-b6c4-b380a4399e01": {
            title: "Introduction",
            xmlTagMeta: {
                tagName: "sec:Introduction",
                attributes: {}
            },
            open: true,
            formItems: [
                {
                    uuid: "37ef5096-4e69-4a5a-ba68-277440e24f70",
                    // title: "Objectives of Document",
                    contentType: "editor"
                },
                {
                    uuid: "da39f7c1-78dc-4cc0-a564-4f607d511f6f",
                    // title: "Terms",
                    contentType: "editor",
                    formItems: [
                        {
                            uuid: "132a214e-ce03-4c48-abe8-5f7d460b5fdf",
                            // title: "Common Criteria Terms",
                            contentType: "terms"
                        },
                        {
                            uuid: "2a9beedb-a7ce-4586-b374-1c22ac37c6fa",
                            // title: "Technical Terms",
                            contentType: "terms"
                        },
                    ],
                },
                {
                    uuid: "f98870e2-4264-4d39-8b02-a5297d0a5b3d",
                    // title: "TOE Overview",
                    contentType: "editor"
                },
                {
                    uuid: "d68577d1-5737-4074-a700-764ca6a9189f",
                    // title: "TOE Usage",
                    contentType: "editor",
                    formItems: [
                        {
                            uuid: "4fe05e05-3d61-47a6-b4c0-ccc1fcd29391",
                            // title: "Use Cases",
                            contentType: "terms"
                        },
                    ]
                },
            ]
        },
        "1c487474-5e05-4837-a1d9-23da1530688d": {
            title: "Conformance Claims",
            open: true,
            xmlTagMeta: {
                tagName: "sec:Conformance_Claims",
                childTagName: "cclaims",
                attributes: {}
            },
            formItems: [
                {
                    // title: "Conformance Statement",
                    uuid: "1c487474-5e05-4837-a1d9-23da1530688d",
                    contentType: "editor",
                },
                {
                    // title: "CC Conformance Claims",
                    uuid: "68244faa-e405-46b4-9df7-140246ca3463",
                    contentType: "editor"
                },
                {
                    // title: "PP Claim",
                    uuid: "e3d935a4-a1e1-44be-b868-fa7eb8322e00",
                    contentType: "editor"
                },
                {
                    // title: "Package Claim",
                    uuid: "37032788-a50d-442b-98e6-e8e3b92b26f7",
                    contentType: "editor"
                },
            ],
        },
        "0f2f8c02-a71b-4fe7-9e80-da93d1ea70cd": {
            title: "Security Problem Definition",
            xmlTagMeta: {
                tagName: "sec:Security_Problem_Description",
                attributes: {}
            },
            formItems: [
                {
                    uuid: "c0dbc61b-cf58-4db6-985b-5539ae2f7455",
                    // title: "Threats",
                    contentType: "threats"
                },
                {
                    uuid: "3a8ef499-784b-485c-8321-a02083aafda8",
                    // title: "Assumptions",
                    contentType: "threats",
                    xmlTagMeta: {
                        tagName: "sec:Assumptions",
                        childTagName: "assumptions",
                        attributes: {}
                    },
                },
            ],
            open: true,
        },
        "ee00eb97-a279-41d3-911f-0236fdda9567": {
            title: "Security Objectives",
            xmlTagMeta: {
                tagName: "sec:Security_Objectives",
                attributes: {}
            },
            formItems: [
                {
                    uuid: "8ba516d2-8336-4562-a6b3-751d722232d9",
                    // title: "Security Objectives for the TOE",
                    contentType: "objectives"
                },
                {
                    uuid: "9d813e26-364b-4149-ae05-f2459b2d76d5",
                    // title: "Security Objectives for the Operational Environment",
                    contentType: "objectives"
                },
            ],
            open: true,
        },
        "2687f815-d716-4e10-955d-1b506a99a448": {
            title: "Security Requirements",
            formItems: [
                {
                    uuid: "849fe5bc-7364-4448-863a-d280f63d9516",
                    // title: "Security Functional Requirements",
                    contentType: "editor",
                    formItems: [
                        {
                            uuid: "b31a725c-c861-4894-af59-6bbc3f4cfb24",
                            // title: "Class: Security Audit (FAU)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "d1c1f277-ad2e-42ac-9df6-0c3042e6f95e",
                            // title: "Class: Cryptographic Support (FCS)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "4bb085f1-8c48-4eb5-89e2-ac64d3240672",
                            // title: "Class: Cryptographic Storage (FCS_STG)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "51e17056-64d3-47b3-b6ac-965ebb96a48a",
                            // title: "Class: User Data Protection (FDP)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "7736aac5-991f-473c-99dd-dcbf1946b2a7",
                            // title: "Class: Identification and Authentication (FIA)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "2cc212e3-ab29-476a-bc5f-808538963720",
                            // title: "Class: Security Management (FMT)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "fae72dca-fe47-4c3f-a729-782d6750c6c6",
                            // title: "Class: Protection of the TSF (FPT)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "5c4b2567-2084-4b28-89ea-d3fb21806eb5",
                            // title: "Class: TOE Access (FTA)",
                            contentType: "sfrs"
                        },
                        {
                            uuid: "011e6f21-8cc9-46d5-ab10-ea9ee86d677c",
                            // title: "Class: Trusted Path/Channels (FTP)",
                            contentType: "sfrs"
                        },
                    ],

                },
                {
                    uuid: "6dab26d4-9395-4311-a30b-547b73538ac5",
                    title: "Security Assurance Requirements",
                    label: "Produced on Export",
                    contentType: "label",
                }
            ],
            open: true,
        },
        "c7cd87c6-e7c4-497e-8bed-0f7948db1e27": {
            title: "Appendix A - Optional Requirements",
            formItems: [],
            open: true,
        },
        "f86fcb19-bb13-45bb-bc01-ed91256d6743": {
            title: "Appendix B - Selection-Based Requirements",
            formItems: [],
            open: true,
        },
        "a0c8d239-42ee-42a5-8d4f-96b3992db4a5": {
            title: "Appendix C - Extended Component Definitions",
            formItems: [],
            open: true,
        },
        "0a126d67-e945-41f8-8517-eef6786dca10": {
            title: "Appendix D - Validation Guidelines",
            formItems: [],
            open: true,
        },
        "279086d8-89df-41fd-9dff-53be9f979877": {
            title: "Appendix E - Implicitly Satisfied Requirements",
            formItems: [],
            open: true,
        },
        "8bb37899-24ee-405b-b33b-4da304e3d016": {
            title: "Appendix F - Entropy Documentation And Assessment",
            formItems: [],
            open: true,
        },
        "5a189416-144b-491c-8a82-8fae63552d06": {
            title: "Appendix H - Use Case Templates",
            formItems: [],
            open: true,
        },
        "5d13f61c-550e-4ca2-90b5-54d563c44146": {
            title: "Appendix I - Acronyms",
            formItems: [
                {
                    uuid: "caa5d2b5-ca76-476d-be81-69e5478547cb",
                    contentType: "appendixI"
                },
            ],
            open: true,
        },
        "81e06b51-407f-4daf-a805-2abfd41f2ffd": {
            title: "Appendix J - Bibliography",
            formItems: [],
            open: true,
        },
        "c2c5eb25-c3a1-4c17-9595-fffdb80f655a": {
            title: "Appendix K - Acknowledgments",
            formItems: [],
            open: true,
        },
    }
}

export const accordionPaneSlice = createSlice({
    name: 'accordionPane',
    initialState,
    reducers: {
        CREATE_ACCORDION: (state, action) => {
            let title = action.payload.title
            let selectedSection = action.payload.selected_section ? action.payload.selected_section : "";
            let uuid = uuidv4();
            let index = Object.values(state.sections).findIndex((value) => value.title === selectedSection)

            // Add new section if the accordion title does not already exist
            if (index !== -1) {
                let keyValues = Object.entries(state.sections);
                keyValues.splice(index + 1, 0, [uuid, { title: title, open: true, formItems: [] }]);
                state.sections = Object.fromEntries(keyValues)
            } else {
                state.sections[uuid] = { title: title, open: true, formItems: [] }
            }
        },
        DELETE_ACCORDION: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title) {
                    delete state.sections[uuid]
                }
            }
        },
        CREATE_ACCORDION_FORM_ITEM: (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let uuid = action.payload.uuid
            let contentType = action.payload.contentType
            if (state.sections.hasOwnProperty(accordionUUID)) {
                let accordion = state.sections[accordionUUID]
                if (accordion.formItems === null || accordion.formItems === undefined) {
                    accordion.formItems = []
                }
                accordion.formItems.push({
                    uuid: uuid,
                    contentType: contentType
                })
            }
        },
        CREATE_ACCORDION_SUB_FORM_ITEM: (state, action) => {
             // One layer further than CREATE_ACCORDION_FORM_ITEM
             let accordionUUID = action.payload.accordionUUID
             let uuid = action.payload.uuid
             let contentType = action.payload.contentType
             let accordionSectionFormUUID = action.payload.formUUID
        
            // Check that accordion exists and has formItems
            if (state.sections.hasOwnProperty(accordionUUID) && Array.isArray(state.sections[accordionUUID].formItems)) {
                const accordion = state.sections[accordionUUID];
        
                // Get the SFR formItem
                let formItemIndex = accordion.formItems.findIndex(item => item.uuid === accordionSectionFormUUID);
        
                // Add entry if formItem exists
                if (formItemIndex !== -1) {
                    const formItem = accordion.formItems[formItemIndex];
        
                    if (formItem.formItems === null || formItem.formItems === undefined) {
                        formItem.formItems = []
                    }
        
                    formItem.formItems.push({
                        uuid: uuid,
                        contentType: contentType
                    });
                }
            }
        },
        DELETE_ACCORDION_FORM_ITEM: (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let uuid = action.payload.uuid
            let sections = state.sections
            if (sections.hasOwnProperty(accordionUUID)) {
                let input = { payload: { sections: sections[accordionUUID], uuid: uuid } }
                // Finds the form item to delete using the delete form item helper method
                accordionPaneSlice.caseReducers.deleteFormItemHelper(state, input)
            }
        },
        DELETE_ALL_ACCORDION_FORM_ITEMS: (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let sections = state.sections

            if (sections.hasOwnProperty(accordionUUID)) {
                let formItems = sections[accordionUUID].formItems;
                formItems.forEach(formItem => {
                    // clear out nested formItems array
                    formItem.formItems = [];
                });
            }
        },
        CREATE_ACCORDION_SFR_FORM_ITEM : (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let editorUUID = action.payload.editorUUID
            let sfrUUID = action.payload.sfrUUID
            if (accordionUUID && editorUUID && sfrUUID && state.sections.hasOwnProperty(accordionUUID) &&
                state.sections[accordionUUID].hasOwnProperty("formItems")) {
                let formItems = state.sections[accordionUUID].formItems
                if (formItems && formItems.length > 0) {
                    formItems.map((item) => {
                        let uuid = item.uuid
                        let contentType = item.contentType
                        if (uuid === editorUUID &&  contentType === "editor") {
                            if (!item.hasOwnProperty("formItems")) {
                                item.formItems = []
                            }
                            item.formItems.push({
                                uuid: sfrUUID,
                                contentType: "sfrs"
                            })
                        }
                    })
                }
            }
        },
        GET_ACCORDION_SFR_FORM_ITEMS : (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let editorUUID = action.payload.editorUUID
            action.payload.sfrs = []
            if (accordionUUID && editorUUID && state.sections.hasOwnProperty(accordionUUID) &&
                state.sections[accordionUUID].hasOwnProperty("formItems")) {
                let formItems = state.sections[accordionUUID].formItems
                if (formItems && formItems.length > 0) {
                    formItems.map((item) => {
                        let uuid = item.uuid
                        let contentType = item.contentType
                        if (uuid === editorUUID && contentType === "editor") {
                            if (item.hasOwnProperty("formItems") && item.formItems.length > 0) {
                                item.formItems.map((sfrItem) => {
                                    let sfrUUID = sfrItem.uuid
                                    if (!action.payload.sfrs.includes(sfrUUID)) {
                                        action.payload.sfrs.push(sfrUUID)
                                    }
                                })
                            }
                        }
                    })
                }
            }
        },
        updateMetaDataItem: (state, action) => {
            let type = action.payload.type
            state.metadata[type] = action.payload.item
        },
        updateFileUploaded: (state, action) => {
            state.loadedfile.filename = action.payload.filename
            state.loadedfile.content = action.payload.content
        },
        updatePlatforms: (state, action) => {
            state.platformdata.description = action.payload.description
            state.platformdata.platforms = action.payload.platforms
            state.platformdata.xml = action.payload.xml
        },
        setIsAccordionOpen: (state, action) => {
            let title = action.payload.title
            let uuid = action.payload.uuid
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title) {
                    state.sections[uuid].open = !state.sections[uuid].open
                }
            }
        },
        expandAllAccordions: (state) => {
            // Expand the metadata section accordion
            state.metadata.open = true

            // Expand the accordion sections
            Object.keys(state.sections).map((uuid) => {
                let item = state.sections[uuid]
                item.open = true
            })
        },
        collapseAllAccordions: (state) => {
            // Collapse the metadata section accordion
            state.metadata.open = false

            // Collapse the accordion sections
            Object.keys(state.sections).map((uuid) => {
                let item = state.sections[uuid]
                item.open = false
            })
        },
        // Loops through the form items within each accordion until it finds the right one and deletes it
        deleteFormItemHelper: (state, action) => {
            let sections = action.payload.sections
            let uuid = action.payload.uuid
            if (sections.hasOwnProperty("formItems")) {
                sections.formItems.map((value, index) => {
                    let currentUUID = value.uuid
                    let formItems = value.hasOwnProperty("formItems") ? value.formItems : null
                    if (currentUUID === uuid) {
                        sections.formItems.splice(index, 1)
                    } else {
                        if (formItems) {
                            let input = { payload: { sections: value, uuid: uuid } }
                            accordionPaneSlice.caseReducers.deleteFormItemHelper(state, input)
                        }
                    }
                })
            }
        },
        RESET_ACCORDION_PANE_STATE: () => initialState,
    },
})

// Action creators are generated for each case reducer function
export const {
    CREATE_ACCORDION,
    DELETE_ACCORDION,
    CREATE_ACCORDION_FORM_ITEM,
    DELETE_ACCORDION_FORM_ITEM,
    DELETE_ALL_ACCORDION_FORM_ITEMS,
    CREATE_ACCORDION_SUB_FORM_ITEM,
    CREATE_ACCORDION_SFR_FORM_ITEM,
    GET_ACCORDION_SFR_FORM_ITEMS,
    updateMetaDataItem,
    setIsAccordionOpen,
    expandAllAccordions,
    collapseAllAccordions,
    RESET_ACCORDION_PANE_STATE,
    updateFileUploaded,
    updatePlatforms
} = accordionPaneSlice.actions

export default accordionPaneSlice.reducer