import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    loadedfile: {
        filename: "",
        content: "",
        pp: false,
        mod: false
    },
    platformData: {
        description: "",
        platforms: []
    },
    snackbar: {
        open: false,
        message: "",
        severity: "success",
        vertical: "bottom",
        horizontal: "left",
        autoHideDuration: 3000
    },
    metadata: {
        open: false,
        ppType: "Protection Profile",
        ppTemplateVersion: "CC2022 Standard",
        ppName: "",
        author: "",
        keywords: "",
        version: "",
        releaseDate: "",
        revisionHistory: [],
        xmlTagMeta: {}
    },
    sections: {}
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
                keyValues.splice(index + 1, 0, [uuid, { title: title, open: false, formItems: [] }]);
                state.sections = Object.fromEntries(keyValues)
            } else {
                state.sections[uuid] = { title: title, open: false, formItems: [] }
            }

            // Return the uuid of the accordion
            action.payload.uuid = uuid
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
        CREATE_ACCORDION_SAR_FORM_ITEM: (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let editorUUID = action.payload.editorUUID
            let sarUUID = action.payload.sarUUID
            if (accordionUUID && editorUUID && sarUUID && state.sections.hasOwnProperty(accordionUUID) &&
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
                                uuid: sarUUID,
                                contentType: "sars"
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
        GET_ACCORDION_SAR_FORM_ITEMS: (state, action) => {
            let accordionUUID = action.payload.accordionUUID
            let editorUUID = action.payload.editorUUID
            action.payload.sars = []
            if (accordionUUID && editorUUID && state.sections.hasOwnProperty(accordionUUID) &&
                state.sections[accordionUUID].hasOwnProperty("formItems")) {
                let formItems = state.sections[accordionUUID].formItems
                if (formItems && formItems.length > 0) {
                    formItems.map((item) => {
                        let uuid = item.uuid
                        let contentType = item.contentType
                        if (uuid === editorUUID && contentType === "editor") {
                            if (item.hasOwnProperty("formItems") && item.formItems.length > 0) {
                                item.formItems.map((sarItem) => {
                                    let sarUUID = sarItem.uuid
                                    if (!action.payload.sars.includes(sarUUID)) {
                                        action.payload.sars.push(sarUUID)
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
            const { filename, content, pp, mod } = action.payload
            if (filename) {
                state.loadedfile.filename = filename
            }
            if (content) {
                state.loadedfile.content = content ? content: ""
            }
            if (pp !== undefined && typeof pp === "boolean") {
                state.loadedfile.pp = pp
            }
            if (mod !== undefined && typeof mod === "boolean") {
                state.loadedfile.mod = mod
            }
        },
        updatePlatforms: (state, action) => {
            state.platformData.description = action.payload.description
            state.platformData.platforms = action.payload.platforms
            state.platformData.xml = action.payload.xml
        },
        updateSnackBar: (state, action) => {
            const { open, message, severity, vertical, horizontal, autoHideDuration } = action.payload

            // Update values
            state.snackbar = {
                open: open !== undefined ? open : false,
                message: message !== undefined ? message : "",
                severity: severity !== undefined ? severity : "success",
                vertical: vertical !== undefined ? vertical : "bottom",
                horizontal: horizontal !== undefined ? horizontal : "left",
                autoHideDuration: autoHideDuration !== undefined ? autoHideDuration : 4000,
            }
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
        SET_ACCORDION_PANE_INITIAL_STATE: (state, action) => {
            const { loadedfile, platformData, metadata, sections } = action.payload

            try {
                state.loadedfile = loadedfile
                state.platformData = platformData
                state.metadata = metadata
                state.sections = sections
            } catch (e) {
                console.log(e)
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
    CREATE_ACCORDION_SAR_FORM_ITEM,
    GET_ACCORDION_SFR_FORM_ITEMS,
    GET_ACCORDION_SAR_FORM_ITEMS,
    RESET_ACCORDION_PANE_STATE,
    SET_ACCORDION_PANE_INITIAL_STATE,
    updateMetaDataItem,
    setIsAccordionOpen,
    expandAllAccordions,
    collapseAllAccordions,
    updateFileUploaded,
    updatePlatforms,
    updateSnackBar
} = accordionPaneSlice.actions

export default accordionPaneSlice.reducer