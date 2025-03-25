import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';
import { deepCopy } from '../../utils/deepCopy';

const initialState = { }

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
            let component = action.payload.hasOwnProperty("component") ? action.payload.component : { sfrCompUUID: uuidv4() }

            if (familyUUID) {
                if (!state.hasOwnProperty(familyUUID)) {
                    state[familyUUID] = {}
                }

                state[familyUUID][component.sfrCompUUID] = {
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
                    tableOpen: component && component.tableOpen ? component.tableOpen : false,
                    objectives: component && component.objectives ? component.objectives : [],
                    extendedComponentDefinition: component && component.extendedComponentDefinition ? component.extendedComponentDefinition
                        : {toggle: false, audit: "", managementFunction: "", componentLeveling: "", dependencies: ""},
                    auditEvents: component && component.auditEvents ? component.auditEvents : {},
                    open: component && component.open ? component.open : false,
                    elements: component && component.elements ? component.elements : {},
                    invisible: component && component.invisible ? component.invisible : false,
                    evaluationActivities: component && component.evaluationActivities ? component.evaluationActivities : {},
                }
            }
            action.payload.id = component.sfrCompUUID
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
            let { sfrUUID, sectionUUID, element } = action.payload
            let elementUUID = uuidv4();
            let sfrSection = state[sfrUUID][sectionUUID]
            if (sfrSection) {
                sfrSection.elements[elementUUID] = {
                    elementXMLID: element && element.elementXMLID? element.elementXMLID : "",
                    isManagementFunction: element && element.isManagementFunction ? element.isManagementFunction : false,
                    managementFunctions: element && element.managementFunctions ? element.managementFunctions : {},
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
        UPDATE_SFR_SECTION_ELEMENT_SELECTABLE: (state, action) => {
            try {
                const { sfrUUID, componentUUID, elementUUID, selectableUUID, itemMap } = action.payload
                let selectable = state[sfrUUID][componentUUID].elements[elementUUID].selectables[selectableUUID]

                // Update selectable
                if (selectable) {
                    Object.entries(itemMap).map(([key, updatedValue]) => {
                        selectable[key] = updatedValue
                    })
                }
            } catch (e) {
                console.log(e)
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
        RESET_ALL_SFR_OBJECTIVES: (state) => {
            Object.values(state).forEach((parent) => {
                Object.values(parent).forEach((component) => {
                    component.objectives = []
                })
            })
        },
        GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE: (state, action) => {
            let inputs = {
                state: state,
                isTitle: false,
                isManagementFunction: false,
                ...action.payload
            }

            action.payload.element = getSfrTextPreviewHelper(inputs)
        },
        GET_SFR_ELEMENT_VALUES_FOR_TITLE: (state, action) => {
            let inputs = {
                state: state,
                isTitle: true,
                isManagementFunction: false,
                ...action.payload,
            }

            action.payload.element = getSfrTextPreviewHelper(inputs)
        },
        GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION: (state, action) => {
            let inputs = {
                state: state,
                isTitle: false,
                isManagementFunction: true,
                ...action.payload,
            }

            action.payload.element = getSfrTextPreviewHelper(inputs)
        },
        GET_SFR_ELEMENT_VALUES_FOR_TABULARIZE_TABLE: (state, action) => {
            let inputs = {
                state: state,
                isTitle: false,
                isManagementFunction: false,
                isTabularize: true,
                ...action.payload,
            }

            action.payload.element = getSfrTextPreviewHelper(inputs)
        },
        GET_ALL_SFR_OPTIONS_MAP: (state, action) => {
            let { sfrSections, terms } = action.payload
            let sfrOptionsMap = {
                dropdownOptions: {components: [], elements: [], selections: [], useCases: []},
                nameMap: {components: {}, elements: {}, selections: {}, useCases: {}},
                uuidMap: {components: {}, elements: {}, selections: {}, useCases: {}},
                useCaseUUID: null,
                elementSelections: {}
            }
            try {
                // Get component and element data
                Object.values(sfrSections).map((sfrClass) => {
                    Object.entries(sfrClass).map(([componentUUID, sfrComponent]) => {
                        // Get component data
                        let componentName = sfrComponent.cc_id
                        let iterationID = sfrComponent.iteration_id
                        let iterationTitle =  (iterationID && typeof iterationID === "string" && iterationID !== "") ? ("/" + iterationID) : ""
                        let componentTitle = componentName + iterationTitle
                        if (!sfrOptionsMap.dropdownOptions.components.includes(componentTitle)) {
                            sfrOptionsMap.dropdownOptions.components.push(componentTitle)
                            sfrOptionsMap.nameMap.components[componentTitle] = componentUUID
                            sfrOptionsMap.uuidMap.components[componentUUID] = componentTitle
                        }
                        // Get element data
                        Object.entries(sfrComponent.elements).map(([elementUUID, sfrElement], index) => {
                            let elementName = `${componentName}.${(index + 1)}${iterationTitle}`
                            if (!sfrOptionsMap.dropdownOptions.elements.includes(elementName)) {
                                sfrOptionsMap.dropdownOptions.elements.push(elementName)
                                sfrOptionsMap.nameMap.elements[elementName] = elementUUID
                                sfrOptionsMap.uuidMap.elements[elementUUID] = elementName
                                // Get selections data
                                if (sfrElement.selectables && Object.keys(sfrElement.selectables).length > 0) {
                                    sfrOptionsMap.elementSelections[elementUUID] = []
                                    let elementSelections = sfrOptionsMap.elementSelections[elementUUID]
                                    Object.entries(sfrElement.selectables).map(([selectionUUID, selection]) => {
                                        // Get component data
                                        let id = selection.id
                                        let assignment = selection.assignment
                                        let description = selection.description
                                        let selectable = id ? (`${description} (${id})`) : description
                                        if (!sfrOptionsMap.dropdownOptions.selections.includes(selectable) && !assignment) {
                                            sfrOptionsMap.dropdownOptions.selections.push(selectable)
                                            sfrOptionsMap.nameMap.selections[selectable] = selectionUUID
                                            sfrOptionsMap.uuidMap.selections[selectionUUID] = selectable
                                            if (!elementSelections.includes(selectionUUID)) {
                                                elementSelections.push(selectionUUID)
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    })
                })

                // Get use case data
                Object.entries(terms).map(([sectionUUID, termSection]) => {
                    let title = termSection.title
                    if (title === "Use Cases") {
                        sfrOptionsMap.useCaseUUID = sectionUUID
                        Object.entries(termSection).map(([termUUID, term]) => {
                            // Get use case term data
                            let termTitle = term.title
                            if (termUUID !== "title" && termUUID !== "open" && termTitle &&
                                !sfrOptionsMap.dropdownOptions.useCases.includes(termTitle)) {
                                sfrOptionsMap.dropdownOptions.useCases.push(termTitle)
                                sfrOptionsMap.nameMap.useCases[termTitle] = termUUID
                                sfrOptionsMap.uuidMap.useCases[termUUID] = termTitle
                            }
                        })
                    } else {
                        sfrOptionsMap.useCaseUUID = null
                    }
                })

                // If use cases do not exist set items to default
                if (sfrOptionsMap.useCaseUUID === null) {
                    sfrOptionsMap.dropdownOptions.useCases = []
                    sfrOptionsMap.nameMap.useCases = {}
                    sfrOptionsMap.uuidMap.useCases = {}
                }

                // Sort drop down menu options
                sfrOptionsMap.dropdownOptions.components.sort()
                sfrOptionsMap.dropdownOptions.elements.sort()
                sfrOptionsMap.dropdownOptions.selections.sort()
                sfrOptionsMap.dropdownOptions.useCases.sort()
            } catch (e) {
                console.log(e)
            }
            action.payload = sfrOptionsMap
        },
        SORT_OBJECTIVES_FROM_SFRS_HELPER: (state, action) => {
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
        SORT_SFR_SECTIONS_HELPER: (state) => {
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
        SET_SFR_SECTIONS_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_SFR_SECTION_STATE: () => initialState,
    },
})

// Helper Methods
const getSfrTextPreviewHelper = (inputs) => {
    let elementItems = {}
    try {
        let {
            state,
            sfrUUID,
            componentUUID,
            elementUUID,
            isTitle,
            isManagementFunction,
            textArray,
            managementNote,
            managementEA,
            rowIndex,
            isTabularize,
            tabularizeUUID
        } = inputs
        if (state[sfrUUID][componentUUID].elements[elementUUID]) {
            const element = deepCopy(state[sfrUUID][componentUUID].elements[elementUUID])
            if (element.hasOwnProperty("selectables")) {
                elementItems.selectables = element.selectables
            }
            if (element.hasOwnProperty("selectableGroups")) {
                elementItems.selectableGroups = element.selectableGroups
            }
            if (isTitle && element.hasOwnProperty("title")) {
                elementItems.title = element.title
            }
            if (isTitle && element.hasOwnProperty("tabularize")) {
                elementItems.tabularize = {}

                // Update definition string
                Object.entries(element.tabularize).forEach(([key, value]) => {
                    const { definition } = value
                    value.definitionString = getTabularizeDefinitionString(definition);
                    elementItems.tabularize[key] = value
                });
            }

            const isManagementFunctionValid = isManagementFunction && element.hasOwnProperty("managementFunctions") && element.managementFunctions.hasOwnProperty("rows")

            // Get management function textArray
            if (isManagementFunction && textArray) {
                elementItems.textArray = textArray
            } else if (isManagementFunctionValid && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].textArray) {
                elementItems.textArray = element.managementFunctions.rows[rowIndex].textArray
            } else {
                elementItems.textArray = []
            }

            // Get management function management note
            if (isManagementFunction && managementNote) {
                elementItems.note = managementNote
            } else if (isManagementFunctionValid && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].hasOwnProperty("note")) {
                elementItems.note = element.managementFunctions.rows[rowIndex].note
            } else {
                elementItems.note = []
            }

            // Get management function evaluation activity
            if (isManagementFunction && managementEA) {
                elementItems.evaluationActivity = managementEA
            } else if (isManagementFunctionValid && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].evaluationActivity) {
                elementItems.evaluationActivity = element.managementFunctions.rows[rowIndex].evaluationActivity
            } else {
                elementItems.evaluationActivity = []
            }

            // Get management function refIds array
            if (isManagementFunctionValid && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].id) {
                const currentRowId = element.managementFunctions.rows[rowIndex].id
                let rows = element.managementFunctions.rows
                elementItems.refIdOptions = getManagementFunctionRowIds(rows, currentRowId)
            }

            // Get tabularize
            if (isTabularize && tabularizeUUID && tabularizeUUID !== "" && element.hasOwnProperty("tabularize") && element.tabularize.hasOwnProperty(tabularizeUUID)) {
                let tabularize = deepCopy(element.tabularize[tabularizeUUID])
                let definition = tabularize.hasOwnProperty("definition") ? tabularize.definition : []
                elementItems.definitionString = getTabularizeDefinitionString(definition)
                elementItems.tabularize = tabularize
            }
        }
    } catch (e) {
        console.log(e)
    }
    return elementItems
}

// Internal Methods
const getManagementFunctionRowIds = (rows, currentRowId) => {
    return rows
        // Extract all IDs
        .map(row => row.id)
        // Exclude the current row's ID
        .filter(id => id !== currentRowId)
        // Sort the array
        .sort((a, b) => {
            const lowerA = a.toLowerCase();
            const lowerB = b.toLowerCase();

            if (lowerA < lowerB) {
                return -1;
            }
            if (lowerA > lowerB) {
                return 1;
            }
            return 0;
        });
}
const getTabularizeDefinitionString = (definition) => {
    let requirementString = ""
    try {
        definition.map((item) => {
            const { value, type } = item

            if (value !== "Selectable ID" && value !== "Identifier") {
                if (type === "reqtext") {
                   requirementString += `${value} `
                } else if (type === "selectcol" || type === "textcol") {
                    requirementString += `[<b>selection</b>: <i>${value}</i>] `
                }
            }
        })
    } catch (e) {
        console.log(e)
    }
    return requirementString
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
    UPDATE_SFR_SECTION_ELEMENT_SELECTABLE,
    DELETE_SFR_SECTION_ELEMENT,
    ADD_SFR_TERM_OBJECTIVE,
    UPDATE_SFR_TERM_OBJECTIVE_RATIONALE,
    DELETE_SFR_TERM_OBJECTIVE,
    DELETE_OBJECTIVE_FROM_SFR_USING_UUID,
    RESET_ALL_SFR_OBJECTIVES,
    GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE,
    GET_SFR_ELEMENT_VALUES_FOR_TITLE,
    GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION,
    GET_SFR_ELEMENT_VALUES_FOR_TABULARIZE_TABLE,
    GET_ALL_SFR_OPTIONS_MAP,
    SORT_OBJECTIVES_FROM_SFRS_HELPER,
    SORT_SFR_SECTIONS_HELPER,
    DELETE_ALL_SFR_SECTION_ELEMENTS,
    RESET_SFR_SECTION_STATE,
    UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES,
    SET_SFR_SECTIONS_INITIAL_STATE
} = sfrSectionSlice.actions

export default sfrSectionSlice.reducer