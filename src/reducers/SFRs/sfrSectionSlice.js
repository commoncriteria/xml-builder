import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "b31a725c-c861-4894-af59-6bbc3f4cfb24": {
        // title: "Class: Security Audit (FAU)"
        "9ce22307-61ea-4778-9f30-81f7af625870": {
            title: "Audit Data Generation",
            cc_id: "FAU_GEN.1",
            iteration_id: "",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            extendedComponentDefinition: {
                toggle: false,
                audit: "",
                managementFunction: "",
                componentLeveling: "",
                dependencies: ""
            },
            auditEvents: {
                "bd595640-f13e-11ee-ae3b-325096b39f47": {
                    optional: false,
                    description: "",
                    items: []
                }
            },
            open: false,
            elements: {
                "6aaee42c-f624-4a62-a01d-d7fb9c78fa5b": {
                    // id: "FAU_GEN.1.1",
                    selectables: {
                        "ba859cb8-3e22-420e-a74b-4484334504de": {
                            id: "",
                            leadingText: "audit records reaching",
                            description: "integer value less than 100",
                            trailingText: "percentage of audit capacity",
                            assignment: true,
                            exclusive: false,
                            notSelectable: false,
                        },
                        "f461d82e-c057-4705-8d17-3ac9524eba9a": {
                            id: "",
                            description: "Specifically defined auditable events in Table 3",
                            assignment: false,
                            exclusive: false,
                            notSelectable: false,
                        },
                        "f8087f7c-e262-48fe-a62e-6b654206af32": {
                            id: "test",
                            description: "no additional auditable events",
                            assignment: true,
                            exclusive: false,
                            notSelectable: false,
                        },
                        "1a4967c2-dbe3-412f-847b-f2ca39f6cbdc": {
                            id: "",
                            description: "other auditable events derived from this Protection Profile",
                            assignment: true,
                            exclusive: false,
                            notSelectable: false,
                        }
                    },
                    selectableGroups: {
                        "group": {
                            onlyOne: false,
                            groups: [
                                "ba859cb8-3e22-420e-a74b-4484334504de",
                                "f461d82e-c057-4705-8d17-3ac9524eba9a",
                                "1a4967c2-dbe3-412f-847b-f2ca39f6cbdc",
                                "f8087f7c-e262-48fe-a62e-6b654206af32"
                            ]
                        }
                    },
                    title: [
                        {
                            description: "<p>The TSF shall be able to generate an audit record of the following auditable " +
                                "events: </p><ol style=\"list-style-type:decimal\"><li>Start-up and shutdown of " +
                                "the audit functions</li><li>All auditable events for the <strong>[not selected] " +
                                "</strong>level of audit </li><li><strong>All administrative actions </strong></li>" +
                                "<li><strong>Start-up and shutdown of the OS </strong></li>" +
                                "<li><strong>Insertion or removal of removable media </strong></li>" +
                                "<li><strong>Specifically defined auditable events in Table 2 </strong></li>" +
                                "<li><br></li></ol>"
                        },
                        { selections: "group" }
                    ],
                    note: "",
                    open: false
                },
                "137211a1-db7c-4ebb-b73b-d31b2b85521f": {
                    // id: "FAU_GEN.1.2",
                    selectables: {
                        "fd49a778-0fc4-41d3-958f-62f912600a78": {
                            id: "",
                            description: "Additional information in Table 3",
                            assignment: false,
                            exclusive: false,
                            notSelectable: false,
                        },
                        "2bd5989a-d8b5-4986-a43f-239876a261f1": {
                            id: "",
                            description: "no additional information",
                            assignment: false,
                            exclusive: false,
                            notSelectable: false,
                        }
                    },
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false,
                },
            },
            evaluationActivities: {
                "9ce22307-61ea-4778-9f30-81f7af625870": {
                    introduction: "",
                    tss: "",
                    guidance: "",
                    testIntroduction: "",
                    testList: [{
                        description: "",
                        tests: [{ dependencies: [], objective: "" }]
                    }],
                },
                "6aaee42c-f624-4a62-a01d-d7fb9c78fa5b": {
                    introduction: "",
                    tss: "",
                    guidance: "",
                    testIntroduction: "",
                    testList: [{
                        description: "",
                        tests: [{ dependencies: [], objective: "" }]
                    }],
                }
            },
        },
        "12e6d5ba-6240-40c7-8c8b-651dc247854d": {
            title: "Audit Storage Protection",
            cc_id: "FAU_STG.1",
            iteration_id: "",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "fba70d79-df18-47e2-89f7-e49e04f3e034": {
                    // id: "FAU_STG.1.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "b88e0fbc-e831-40b5-adaa-eed42d999042": {
                    // id: "FAU_STG.1.2",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
        "6db719ed-9003-47a4-bd24-848b7c6888b0": {
            title: "Prevention of Audit Data Loss",
            cc_id: "FAU_STG.4",
            iteration_id: "",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "3d2d39cd-d08d-4499-a610-20dd47bc739f": {
                    // id: "FAU_STG.4.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        }
    },
    "d1c1f277-ad2e-42ac-9df6-0c3042e6f95e": {
        // title: "Class: Cryptographic Support (FCS)"
        "74d0714a-229e-458b-8dd3-9314372bd4fd": {
            title: "Cryptographic Key Generation",
            cc_id: "FCS_CKM.1",
            iteration_id: "",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "b3f03d82-e69e-44b3-829a-e89b944de7d8": {
                    // id: "FCS_CKM.1.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
        "61e99f04-032e-45ac-a0f9-f0470f2e26bb": {
            title: "Cryptographic Key Establishment",
            cc_id: "FCS_CKM.2",
            iteration_id: "UNLOCKED",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "185f0fe0-6612-4414-8fd6-abf79ea77f63": {
                    // id: "FCS_CKM.2.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
        "3dd17cdb-6d99-45df-8b28-e9f182c45abd": {
            title: "Cryptographic Key Establishment",
            cc_id: "FCS_CKM.1",
            iteration_id: "LOCKED",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "18c2e22d-9220-4b91-b2b3-78cbd1a358ca": {
                    // id: "FCS_CKM.1.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
        "d386a177-27fe-4564-b15b-2e303cfe14cc": {
            title: "Cryptographic Key Support",
            cc_id: "FCS_CKM_EXT.1",
            iteration_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "0bad1a2b-25a5-4c86-9b9a-b3047fd78a4d": {
                    // id: "FCS_CKM_EXT.1.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "66d8fca7-2e73-46a6-92a6-4b8026a6b3cf": {
                    // id: "FCS_CKM_EXT.1.2",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "331b53cc-1277-4006-862b-fa7a2d15061d": {
                    // id: "FCS_CKM_EXT.1.3",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
        "d0131ab2-e3db-446b-aac9-205ede2ec119": {
            title: "Cryptographic Key Random Generation",
            cc_id: "FCS_CKM_EXT.2",
            iteration_id: "",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "a216e064-4d3c-448b-a35f-4e4bf3a229e6": {
                    // id: "FCS_CKM_EXT.2.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
    },
    "4bb085f1-8c48-4eb5-89e2-ac64d3240672": {
        // title: "Class: Cryptographic Storage (FCS_STG)"
        "85f64540-8ec6-4dee-b435-d214534db780": {
            title: "Cryptographic Key Storage",
            cc_id: "FCS_STG_EXT.1",
            iteration_id: "",
            xml_id: "",
            definition: "",
            optional: false,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            tableOpen: true,
            objectives: [],
            elements: {
                "ab504a83-aa96-4665-adcc-b5b572a358ab": {
                    // id: "FCS_STG_EXT.1.1",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "f2ce0f29-08db-4cc0-a594-3d057e19c1ef": {
                    // id: "FCS_STG_EXT.1.2",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "44f32193-f429-4a34-8274-8a56694f9d40": {
                    // id: "FCS_STG_EXT.1.3",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "f92d9b59-e7a8-4d2b-b32d-0d04f9700c6a": {
                    // id: "FCS_STG_EXT.1.4",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
                "50d70234-d59d-4679-88b7-e2db2aad3d26": {
                    // id: "FCS_STG_EXT.1.5",
                    selectables: {},
                    selectableGroups: {},
                    title: [],
                    note: "",
                    open: false
                },
            },
            open: false
        },
    },
}

export const sfrSectionSlice = createSlice({
    name: 'sfrSections',
    initialState,
    reducers: {
        CREATE_SFR_SECTION_SLICE: (state, action) => {
            let sfrUUID = action.payload.sfrUUID ? action.payload.sfrUUID : uuidv4();
            if (!state.hasOwnProperty(sfrUUID)) {
                state[sfrUUID] = {}
            }
        },
        DELETE_SFR_SECTION: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            if (state.hasOwnProperty(sfrUUID)) {
                delete state[sfrUUID]
            }
        },
        CREATE_SFR_COMPONENT: (state, action) => {
            let familyUUID = action.payload.sfrUUID;
            let componentUUID = uuidv4();
            let component = action.payload.component;

            if (familyUUID) {
                if (!state.hasOwnProperty(familyUUID)) {
                    state[familyUUID] = {}
                }

                state[familyUUID][componentUUID] = {
                    title: component && component.title ? component.title : "",
                    cc_id: component && component.cc_id ? component.cc_id : "",
                    iteration_id: component && component.iteration_id ? component.iteration_id : "",
                    xml_id: component && component.xml_id ? component.xml_id : "",
                    definition: component && component.definition ? component.definition : "",
                    optional: component && component.optional ? component.optional : false,
                    objective: component && component.objective ? component.objective : false,
                    selectionBased: component && component.selectionBased ? component.selectionBased : false,
                    selections: component && component.selections ? component.selections : {},
                    useCaseBased: component && component.useCaseBased ? component.useCaseBased : false,
                    useCases: component && component.useCases ? component.useCases : [],
                    implementationDependent: component && component.implementationDependent ? component.implementationDependent : false,
                    reasons: component && component.reasons ? component.reasons : [],
                    tableOpen: component && component.tableOpen ? component.tableOpen : true,
                    objectives: component && component.objectives ? component.objectives : [],
                    extendedComponentDefinition: component && component.extendedComponentDefinition ? component.extendedComponentDefinition
                        : {toggle: false, audit: "", managementFunction: "", componentLeveling: "", dependencies: ""},
                    auditEvents: component && component.auditEvents ? component.auditEvents : {},
                    open: component && component.open ? component.open : false,
                    elements: component && component.elements ? component.elements : {},
                    evaluationActivities: component && component.evaluationActivities ? component.evaluationActivities : {},
                }
            }
            action.payload = componentUUID
        },
        UPDATE_SFR_COMPONENT_ITEMS: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let uuid = action.payload.uuid;
            let itemMap = action.payload.itemMap
            let sfrSection = state[sfrUUID][uuid]
            if (sfrSection && Object.entries(itemMap).length > 0) {
                Object.entries(itemMap).map(([key, updatedValue]) => {
                    if (key !== "element" && JSON.stringify(sfrSection[key]) !== JSON.stringify(updatedValue)) {
                        sfrSection[key] = updatedValue
                    }
                })
            }
        },
        UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let uuid = action.payload.uuid;
            let sfrSection = state[sfrUUID][uuid];
            let eAUUID = action.payload.eAUUID;
            let selectionMap = action.payload.selectionMap; // maps selectable ID to UUID (only for applicable dependecies for this evaluation activity)

            sfrSection.evaluationActivities[eAUUID].testList.forEach(testlist => {
                testlist.tests.forEach(test => {
                    test.dependencies.map((dependency) => {
                        let selectionUUID = selectionMap[dependency];
                        if (!test.dependencies.includes(selectionUUID)) {
                            test.dependencies.push(selectionUUID)
                        }
                    })
                });
            });
        },
        DELETE_SFR_COMPONENT: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let uuid = action.payload.uuid;
            if (state[sfrUUID][uuid]) {
                delete state[sfrUUID][uuid]
            }
        },
        CREATE_SFR_SECTION_ELEMENT: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let sectionUUID = action.payload.sectionUUID;
            let element = action.payload.element;
            let elementUUID = uuidv4();
            let sfrSection = state[sfrUUID][sectionUUID]
            if (sfrSection) {
                sfrSection.elements[elementUUID] = {
                    selectables: element && element.selectables ? element.selectables : {},
                    selectableGroups: element && element.selectableGroups ? element.selectableGroups : {},
                    title: element && element.title ? element.title : [],
                    note: element && element.note ? element.note : "",
                    open: element && element.open ? element.open : false
                }
            }
        },
        UPDATE_SFR_SECTION_ELEMENT: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let sectionUUID = action.payload.sectionUUID;
            let elementUUID = action.payload.elementUUID;
            let itemMap = action.payload.itemMap
            let sfrSection = state[sfrUUID][sectionUUID]
            let elementSection = sfrSection.elements[elementUUID]
            if (sfrSection && elementSection && Object.entries(itemMap).length > 0) {
                Object.entries(itemMap).map(([key, updatedValue]) => {
                    if (JSON.stringify(elementSection[key]) !== JSON.stringify(updatedValue)) {
                        elementSection[key] = updatedValue
                    }
                })
            }
        },
        DELETE_SFR_SECTION_ELEMENT: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let sectionUUID = action.payload.sectionUUID;
            let elementUUID = action.payload.elementUUID;
            let elements = state[sfrUUID][sectionUUID].elements
            if (elements && elements.hasOwnProperty(elementUUID)) {
                delete elements[elementUUID]
            }
        },
        DELETE_ALL_SFR_SECTION_ELEMENTS: (state) => {
            Object.entries(state).map(([key, value]) => {
                delete state[key];
            })
        },
        ADD_SFR_TERM_OBJECTIVE: (state, action) => {
            const { sfrUUID, uuid, objectiveUUID, title } = action.payload
            const sfrSection = state[sfrUUID][uuid];
            const rationale = action.payload.rationale ? action.payload.rationale : ""
            const entryExists = state.hasOwnProperty(sfrUUID) && sfrSection && sfrSection.title === title
            if (entryExists) {
                let uuidExists = false
                sfrSection.objectives.map((objective) => {
                    if (objective.uuid === objectiveUUID) {
                        uuidExists = true
                    }
                })
                if (!uuidExists) {
                    sfrSection.objectives.push({ uuid: objectiveUUID, rationale: rationale })
                }
            }
        },
        UPDATE_SFR_TERM_OBJECTIVE_RATIONALE: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let uuid = action.payload.uuid;
            let objectiveUUID = action.payload.objectiveUUID;
            let newRationale = action.payload.newRationale;
            let sfrSection = state[sfrUUID][uuid]
            if (state.hasOwnProperty(sfrUUID) && sfrSection) {
                sfrSection.objectives.map((objective) => {
                    if (objective.uuid === objectiveUUID) {
                        objective.rationale = newRationale
                    }
                })
            }
        },
        DELETE_SFR_TERM_OBJECTIVE: (state, action) => {
            let sfrUUID = action.payload.sfrUUID;
            let uuid = action.payload.uuid;
            let objectiveUUID = action.payload.objectiveUUID;
            let sfrSection = state[sfrUUID][uuid]
            if (state.hasOwnProperty(sfrUUID) && sfrSection) {
                sfrSection.objectives.map((objective, index) => {
                    if (objective.uuid === objectiveUUID) {
                        sfrSection.objectives.splice(index, 1)
                    }
                })
            }
        },
        DELETE_OBJECTIVE_FROM_SFR_USING_UUID: (state, action) => {
            let objectiveUUID = action.payload.objectiveUUID
            Object.values(state).map((sfrValue) => {
                Object.values(sfrValue).map((sfrSection) => {
                    if (sfrSection.objectives && Object.entries(sfrSection.objectives).length > 0) {
                        (sfrSection.objectives)?.map((objective, index) => {
                            if (objective.uuid === objectiveUUID) {
                                sfrSection.objectives.splice(index, 1)
                            }
                        })
                    }
                })
            })
        },
        GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE: (state, action) => {
            const { sfrUUID, componentUUID, elementUUID } = action.payload
            action.payload.element = getSfrTitleHelper(state, sfrUUID, componentUUID, elementUUID, false)
        },
        GET_SFR_ELEMENT_VALUES_FOR_TITLE: (state, action) => {
            const { sfrUUID, componentUUID, elementUUID } = action.payload
            action.payload.element = getSfrTitleHelper(state, sfrUUID, componentUUID, elementUUID, true)
        },
        sortObjectivesFromSfrsHelper: (state, action) => {
            let sfrUUID = action.payload.sfrUUID
            let uuid = action.payload.uuid
            let uuidMap = action.payload.uuidMap
            let objectives = state[sfrUUID][uuid].objectives
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
        sortSfrSectionsHelper: (state) => {
            Object.entries(state).map(([key, sfr]) => {
                let sorted = Object.entries(sfr).sort((a, b) => {
                    const nameA = (a[1].cc_id + a[1].iteration_id).toUpperCase();
                    const nameB = (b[1].cc_id + b[1].iteration_id).toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    // names must be equal
                    return 0;
                })
                let result = Object.fromEntries(sorted)
                if (JSON.stringify(state[key]) !== JSON.stringify(result)) {
                    state[key] = result
                }
            })
        },
        RESET_SFR_SECTION_STATE: () => initialState,
    },
})

// Helper Methods
const getSfrTitleHelper = (state, sfrUUID, componentUUID, elementUUID, isTitle) => {
    let elementItems = {}
    try {
        if (state[sfrUUID][componentUUID].elements[elementUUID]) {
            const element = JSON.parse(JSON.stringify(state[sfrUUID][componentUUID].elements[elementUUID]))
            if (element.hasOwnProperty("selectables")) {
                elementItems.selectables = element.selectables
            }
            if (element.hasOwnProperty("selectableGroups")) {
                elementItems.selectableGroups = element.selectableGroups
            }
            if (isTitle && element.hasOwnProperty("title")) {
                elementItems.title = element.title
            }
        }
    } catch (e) {
        console.log(e)
    }
    return elementItems
}

// Action creators are generated for each case reducer function
export const {
    CREATE_SFR_SECTION_SLICE,
    DELETE_SFR_SECTION,
    CREATE_SFR_COMPONENT,
    UPDATE_SFR_COMPONENT_ITEMS,
    DELETE_SFR_COMPONENT,
    CREATE_SFR_SECTION_ELEMENT,
    UPDATE_SFR_SECTION_ELEMENT,
    DELETE_SFR_SECTION_ELEMENT,
    ADD_SFR_TERM_OBJECTIVE,
    UPDATE_SFR_TERM_OBJECTIVE_RATIONALE,
    DELETE_SFR_TERM_OBJECTIVE,
    DELETE_OBJECTIVE_FROM_SFR_USING_UUID,
    GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE,
    GET_SFR_ELEMENT_VALUES_FOR_TITLE,
    sortObjectivesFromSfrsHelper,
    sortSfrSectionsHelper,
    DELETE_ALL_SFR_SECTION_ELEMENTS,
    RESET_SFR_SECTION_STATE,
    UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES,
} = sfrSectionSlice.actions

export default sfrSectionSlice.reducer