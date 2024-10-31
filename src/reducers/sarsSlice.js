import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from "uuid";

const initialState = {
    xmlTagMeta: {
        tagName: "section",
        attributes: {}
    },
    sections: {
        "c69fa400-74bd-4c0a-82a9-dacb8f1bc7f4": {
            title: "Class ASE: Security Target",
            summary: "As per ASE activities defined in <xref to=\"bibCEM\"/>.",
            open: false,
            componentIDs: []
        },
        "91d2a9f7-b0ae-4113-9a31-d12caf12f294": {
            title: "Class ADV: Development",
            summary: "The information about the TOE is contained in the guidance documentation available to the end user as " +
                "well as the TSS portion of the ST. The TOE developer must concur with the description of the product " +
                "that is contained in the TSS as it relates to the functional requirements. The evaluation activities " +
                "contained in <xref to=\"SFRs\"/> should provide the ST authors with sufficient information to " +
                "determine the appropriate content for the TSS section.",
            open: false,
            componentIDs: [
                "57b55381-e780-4bf7-992f-15670c0f96e7",
            ]
        },
    },
    components: {
        "57b55381-e780-4bf7-992f-15670c0f96e7": {
            ccID: "ADV_FSP.1",
            name: "Basic Functional Specification",
            optional: false,
            summary: "The functional specification describes the TSFIs. It is not necessary to have a formal or complete " +
                "specification of these interfaces. Additionally, because TOEs conforming to this PP will necessarily " +
                "have interfaces to the Operational Environment that are not directly invocable by TOE users,  there " +
                "is little point specifying that such interfaces be described in and of themselves since only indirect " +
                "testing of such interfaces may be possible. For this PP, the activities for this family should focus " +
                "on understanding the interfaces presented in the TSS in response to the functional requirements and " +
                "the interfaces presented in the AGD documentation. No additional “functional specification” " +
                "documentation is necessary to satisfy the evaluation activities specified. The interfaces that need " +
                "to be evaluated are characterized through the information needed to perform the assurance activities " +
                "listed, rather than as an independent, abstract list. ",
            elementIDs: [
                "e4f8bb06-6486-40e6-9058-593c06fd5ba5",
                "a6b31aae-ee41-4129-9287-c4eb0aba611d",
                "c5c69267-3361-4099-9442-96e1da168145",
                "9a503195-0e47-4864-ac08-cf94a78114b3",
                "50932319-ad87-452a-ab9a-0747211d69f9",
                "04064ee9-c7ed-49e6-ba10-5a5e207ae9ac",
                "f913d547-8b8c-4e9c-86d7-f7b21e2a0779",
                "44846696-43d4-4b5c-bbb7-bbbef17c517b"
            ]
        },
    },
    elements: {
        "e4f8bb06-6486-40e6-9058-593c06fd5ba5": {
            type: "D",
            title: "The developer shall provide a functional specification.",
            note: "",
            aactivity: ""
        },
        "a6b31aae-ee41-4129-9287-c4eb0aba611d": {
            type: "D",
            title: "The developer shall provide a tracing from the functional specification to the SFRs.",
            note: "As indicated in the introduction to this section, the functional specification is comprised of the " +
                "information contained in the AGD_OPE and AGD_PRE documentation. The developer may reference a website " +
                "accessible to application developers and the evaluator. The evaluation activities in the functional " +
                "requirements point to evidence that should exist in the documentation and TSS section; since these are " +
                "directly associated with the SFRs, the tracing in element ADV_FSP.1.2D is implicitly already done and " +
                "no additional documentation is necessary.",
            aactivity: ""
        },
        "c5c69267-3361-4099-9442-96e1da168145": {
            type: "C",
            title: "The functional specification shall describe the purpose and method of use for each SFR-enforcing and SFR-supporting TSFI.",
            note: "",
            aactivity: ""
        },
        "9a503195-0e47-4864-ac08-cf94a78114b3": {
            type: "C",
            title: "The functional specification shall identify all parameters associated with each SFR-enforcing and SFR-supporting TSFI.",
            note: "",
            aactivity: ""
        },
        "50932319-ad87-452a-ab9a-0747211d69f9": {
            type: "C",
            title: "The functional specification shall identify all parameters associated with each SFR-enforcing and SFR-supporting TSFI.",
            note: "",
            aactivity: ""
        },
        "04064ee9-c7ed-49e6-ba10-5a5e207ae9ac": {
            type: "C",
            title: "The tracing shall demonstrate that the SFRs trace to TSFIs in the functional specification.",
            note: "",
            aactivity: ""
        },
        "f913d547-8b8c-4e9c-86d7-f7b21e2a0779": {
            type: "E",
            title: "The evaluator shall confirm that the information provided meets all requirements for content and presentation of evidence.",
            note: "",
            aactivity: ""
        },
        "44846696-43d4-4b5c-bbb7-bbbef17c517b": {
            type: "E",
            title: "The evaluator shall determine that the functional specification is an accurate and complete instantiation of the SFRs.",
            note: "",
            aactivity: "There are no specific evaluation activities associated with these SARs, except ensuring the information " +
                "is provided. The functional specification documentation is provided to support the evaluation activities " +
                "described in <xref to=\"SFRs\"/>, and other activities described for AGD, ATE, and AVA SARs. The " +
                "requirements on the content of the functional specification information is implicitly assessed by " +
                "virtue of the other evaluation activities being performed; if the evaluator is unable to perform " +
                "an activity because there is insufficient interface information, then an adequate functional " +
                "specification has not been provided."
        },
    },
}

// Additional Methods
const deleteComponent = (state, sarUUID, componentUUID) => {
    if (state.components.hasOwnProperty(componentUUID)) {
        let currentComponent = state.components[componentUUID];
        if (currentComponent.hasOwnProperty("elementIDs") && currentComponent.elementIDs.length > 0) {
            // Run through elements and delete associated elements
            let elementIDs = JSON.parse(JSON.stringify(currentComponent.elementIDs));
            elementIDs.forEach((elementUUID) => {
               if (state.elements.hasOwnProperty(elementUUID)) {
                   deleteElement(state, componentUUID, elementUUID)
                }
            })
        }
        // Delete from components
        delete state.components[componentUUID]

        // Delete from parent section array if sarUUID was included
        if (sarUUID && state.sections.hasOwnProperty(sarUUID) && state.sections[sarUUID].hasOwnProperty("componentIDs")) {
            let componentIDs = state.sections[sarUUID].componentIDs;
            if (componentIDs && componentIDs.length > 0) {
                let componentIndex = componentIDs.indexOf(componentUUID)
                if (componentIndex > -1) {
                    componentIDs.splice(componentIndex, 1)
                }
            }
        }
    }
}
const deleteElement = (state, componentUUID, elementUUID) => {
    if (state.elements.hasOwnProperty(elementUUID)) {
        // Delete from parent section array if componentUUID was included
        if (componentUUID && state.components.hasOwnProperty(componentUUID) && state.components[componentUUID].hasOwnProperty("elementIDs")) {
            let elementIDs = JSON.parse(JSON.stringify(state.components[componentUUID].elementIDs));
            if (elementIDs && elementIDs.length > 0) {
                let elementIndex = elementIDs.indexOf(elementUUID)
                if (elementIndex > -1) {
                    state.components[componentUUID].elementIDs.splice(elementIndex, 1)
                }
            }
        }

        // Delete from elements
        delete state.elements[elementUUID]
    }
}

export const sarsSlice = createSlice({
    name: 'sars',
    initialState,
    reducers: {
        SET_XMLTAGMETA: (state, action) => {
            state.xmlTagMeta = action.payload.xmlTagMeta;
        },
        CREATE_SAR_SECTION: (state, action) => {
            let newId = uuidv4();
            const {title, summary} = action.payload;
            let id = action.payload.id ? action.payload.id : "";
            if (!state.sections.hasOwnProperty(newId)) {
                state.sections[newId] = {
                    title: title,
                    id: id,
                    summary: summary,
                    open: false,
                    componentIDs: []
                };
                action.payload = newId
            } else {
                action.payload = null
            }
        },
        DELETE_SAR: (state, action) => {
            const sarUUID = action.payload.sarUUID;
            if (state.sections.hasOwnProperty(sarUUID)) {
                let currentSection = state.sections[sarUUID];
                if (currentSection.hasOwnProperty("componentIDs") && currentSection.componentIDs.length > 0) {
                    // Run through components and delete associated components
                    let componentIDs = JSON.parse(JSON.stringify(currentSection.componentIDs));
                    componentIDs.forEach((componentUUID) => {
                        if (state.components.hasOwnProperty(componentUUID)) {
                            deleteComponent(state, sarUUID, componentUUID)
                        }
                    })
                }
                // Delete the SAR section
                delete state.sections[sarUUID];
            }
        },
        UPDATE_SAR_SECTION_SUMMARY: (state, action) => {
            const { uuid, newSummary } = action.payload;
            if (state.sections.hasOwnProperty(uuid)) {
                state.sections[uuid].summary = newSummary
            }
        },
        UPDATE_SAR_SECTION_TITLE: (state, action) => {
            const { uuid, title, newTitle } = action.payload;
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title) {
                    state.sections[uuid].title = newTitle
                }
            }
        },
        COLLAPSE_SAR_SECTION: (state, action) => {
            const { uuid, title, open } = action.payload;
            if (state.sections.hasOwnProperty(uuid)) {
                if (state.sections[uuid].title === title) {
                    state.sections[uuid].open = (open !== null && typeof open === "boolean") ? open : !state.sections[uuid].open
                }
            }
        },
        CREATE_SAR_COMPONENT: (state, action) => {
            const componentUUID = uuidv4();
            const { sarUUID, component } = action.payload;
            if (sarUUID) {
                if (!state.sections.hasOwnProperty(sarUUID)) {
                    state.sections[sarUUID] = {
                        title: "",
                        summary: "",
                        open: false,
                        componentIDs: []
                    };
                }

                // Add component ID to currentSAR
                let currentSAR = state.sections[sarUUID]
                if (!currentSAR.hasOwnProperty("componentIDs")) {
                    currentSAR.componentIDs = []
                }
                if (!currentSAR.componentIDs.includes(componentUUID)) {
                    currentSAR.componentIDs.push(componentUUID)
                }

                // Set the component ID
                let compCCID = "";
                let compName = "";
                if (component.hasOwnProperty("xmlTagMeta")) { // Attributes from imported xml
                    if (component.xmlTagMeta.attributes.hasOwnProperty("cc-id")) {
                        compCCID = component.xmlTagMeta.attributes["cc-id"];
                    }

                    if (component.xmlTagMeta.attributes.hasOwnProperty("name")) {
                        compName = component.xmlTagMeta.attributes["name"];
                    }

                    if (component.xmlTagMeta.attributes.hasOwnProperty("status")) {
                        
                        if (component.xmlTagMeta.attributes["status"] == "optional") {
                            component.optional = true;
                        }
                    }
                }

                if (component.ccID) {
                    compCCID = component.ccID.toUpperCase();
                }

                // Create new component
                state.components[componentUUID] = {
                    ccID: compCCID,
                    name: compName,
                    optional: component && component.optional ? component.optional : false,
                    summary: component && component.summary ? component.summary : "",
                    elementIDs: [],
                }
            }
            action.payload = componentUUID
        },
        UPDATE_SAR_COMPONENT_ITEMS: (state, action) => {
            const { componentUUID, itemMap } = action.payload;
            const sarSection = state.components[componentUUID]
            if (sarSection && Object.entries(itemMap).length > 0) {
                Object.entries(itemMap).forEach(([key, updatedValue]) => {
                    if (JSON.stringify(sarSection[key]) !== JSON.stringify(updatedValue)) {
                        sarSection[key] = (key === "ccID") ? updatedValue.toUpperCase() : updatedValue;
                    }
                })
            }
        },
        DELETE_SAR_COMPONENT: (state, action) => {
            const { sarUUID, componentUUID } = action.payload;

            // Delete Component
            deleteComponent(state, sarUUID, componentUUID)
        },
        CREATE_SAR_ELEMENT: (state, action) => {
            const elementUUID = uuidv4();
            const { componentUUID, element } = action.payload;

            if (componentUUID) {
                if (!state.components.hasOwnProperty(componentUUID)) {
                    state.components[componentUUID] = {
                        ccID: "",
                        name: "",
                        optional: false,
                        summary: "",
                        elementIDs: []
                    };
                }

                // Add element ID to currentComponent
                let currentComponent = state.components[componentUUID]
                if (!currentComponent.hasOwnProperty("elementIDs")) {
                    currentComponent.elementIDs = []
                }
                if (!currentComponent.elementIDs.includes(elementUUID)) {
                    currentComponent.elementIDs.push(elementUUID)
                }

                // Set the type
                let elementType = "C";
                if (element.hasOwnProperty("xmlTagMeta")) { // Attributes from imported xml
                    if (element.xmlTagMeta.attributes.hasOwnProperty("type")) {
                        elementType = element.xmlTagMeta.attributes.type;
                    }
                }

                if (element.type) {
                    elementType = element.type;
                }


                // Create new element
                state.elements[elementUUID] = {
                    type: elementType,
                    title: element && element.title ? element.title : "",
                    note: element && element.note ? element.note : "",
                    aactivity: element && element.aactivity ? element.aactivity : "",
                }
            }
            action.payload = elementUUID
        },
        UPDATE_SAR_ELEMENT: (state, action) => {
            const { elementUUID, itemMap } = action.payload;
            const elementSection = state.elements[elementUUID]
            if (elementSection && Object.entries(itemMap).length > 0) {
                Object.entries(itemMap).forEach(([key, updatedValue]) => {
                    if (JSON.stringify(elementSection[key]) !== JSON.stringify(updatedValue)) {
                        elementSection[key] = updatedValue
                    }
                })
            }
        },
        DELETE_SAR_ELEMENT: (state, action) => {
            const { elementUUID, componentUUID } = action.payload;

            // Delete the element
            deleteElement(state, componentUUID, elementUUID)
        },
        DELETE_ALL_SAR_SECTIONS: (state) => {
            // Delete all elements
            Object.entries(state.elements).map(([key, value]) => {
                delete state.elements[key];
            });

            // Delete all components
            Object.entries(state.components).map(([key, value]) => {
                delete state.components[key];
            });

            // Delete all families
            Object.entries(state.sections).map(([key, value]) => {
                delete state.sections[key];
            });
        },
        RESET_SAR_STATE: () => initialState
    },
})

// Action creators are generated for each case reducer function
export const {
    SET_XMLTAGMETA,
    CREATE_SAR_SECTION,
    DELETE_SAR,
    UPDATE_SAR_SECTION_TITLE,
    UPDATE_SAR_SECTION_SUMMARY,
    COLLAPSE_SAR_SECTION,
    CREATE_SAR_COMPONENT,
    UPDATE_SAR_COMPONENT_ITEMS,
    DELETE_SAR_COMPONENT,
    CREATE_SAR_ELEMENT,
    UPDATE_SAR_ELEMENT,
    DELETE_SAR_ELEMENT,
    DELETE_ALL_SAR_SECTIONS,
    RESET_SAR_STATE
} = sarsSlice.actions

export default sarsSlice.reducer