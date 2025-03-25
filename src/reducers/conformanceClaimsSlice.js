import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    stConformance: "exact",
    part2Conformance: "conformant",
    part3Conformance: "conformant",
    ppClaims: [],
    packageClaims: [],
    evaluationMethods: [],
    additionalInformation: "",
    collapseConformanceSection: false,
    collapseAdditionalInfoSection: false,
}

export const conformanceClaimsSlice = createSlice({
    name: 'conformanceClaims',
    initialState,
    reducers: {
        CREATE_NEW_PP_CLAIM: (state, action) => {
            const { isPP, description, status } = action.payload;
            const newPpClaim = {
                "pp": isPP,
                "text": description,
                "status": status
            }
            state.ppClaims.push(newPpClaim)
        },
        CREATE_NEW_PACKAGE_CLAIM: (state, action) => {
            const { isFunctional, conf, text  } = action.payload;
            const newPackageClaim = {
                "functionalPackage": isFunctional,
                "conf": conf,
                "text": text,
            }
            state.packageClaims.push(newPackageClaim)
        },
        CREATE_NEW_EVALUATION_METHOD: (state, action) => {
            const { method } = action.payload;
            state.evaluationMethods.push(method)
        },
        UPDATE_ST_CONFORMANCE_DROPDOWN: (state, action) => {
            const { stConformance } = action.payload;
            state.stConformance = stConformance ? stConformance : "";
        },
        UPDATE_PART_2_CONFORMANCE_DROPDOWN: (state, action) => {
            const { part2Conformance } = action.payload;
            state.part2Conformance = part2Conformance ? part2Conformance : "";
        },
        UPDATE_PART_3_CONFORMANCE_DROPDOWN: (state, action) => {
            const { part3Conformance } = action.payload;
            state.part3Conformance = part3Conformance ? part3Conformance : "";
        },
        UPDATE_PP_CLAIMS_INDEX_BY_KEY: (state, action) => {
            const { index, value, key } = action.payload;

            if (state.ppClaims[index] && state.ppClaims[index].hasOwnProperty(key)) {
                state.ppClaims[index][key] = value
            }
        },
        UPDATE_PACKAGE_CLAIMS_INDEX_BY_KEY: (state, action) => {
            const { index, value, key } = action.payload;

            if (state.packageClaims[index] && state.packageClaims[index].hasOwnProperty(key)) {
                state.packageClaims[index][key] = value
            }
        },
        UPDATE_EVALUATION_METHODS_BY_INDEX: (state, action) => {
            const { index, value } = action.payload;

            if (state.evaluationMethods.hasOwnProperty(index)) {
                state.evaluationMethods[index] = value
            }
        },
        UPDATE_ADDITIONAL_INFORMATION_TEXT: (state, action) => {
            const { value } = action.payload;
            state.additionalInformation = value ? value : "";
        },
        UPDATE_COLLAPSE_CONFORMATION_SECTION: (state) => {
            state.collapseConformanceSection = !state.collapseConformanceSection
        },
        UPDATE_COLLAPSE_ADDITIONAL_INFORMATION_SECTION: (state) => {
            state.collapseAdditionalInfoSection = !state.collapseAdditionalInfoSection
        },
        DELETE_MULTIPLE_PP_CLAIMS: (state, action) => {
            const { indicesToRemove } = action.payload;

            state.ppClaims = state.ppClaims.filter((_, index) => !indicesToRemove.includes(index));
        },
        DELETE_MULTIPLE_PACKAGE_CLAIMS: (state, action) => {
            const { indicesToRemove } = action.payload;

            state.packageClaims = state.packageClaims.filter((_, index) => !indicesToRemove.includes(index));
        },
        DELETE_MULTIPLE_EVALUATION_METHODS: (state, action) => {
            const { indicesToRemove } = action.payload;

            state.evaluationMethods = state.evaluationMethods.filter((_, index) => !indicesToRemove.includes(index));
        },
        RESET_CONFORMANCE_CLAIMS_STATE: () => ({...initialState}),
    },
})

// Action creators are generated for each case reducer function
export const {
    CREATE_NEW_PP_CLAIM,
    CREATE_NEW_PACKAGE_CLAIM,
    CREATE_NEW_EVALUATION_METHOD,
    UPDATE_ST_CONFORMANCE_DROPDOWN,
    UPDATE_PART_2_CONFORMANCE_DROPDOWN,
    UPDATE_PART_3_CONFORMANCE_DROPDOWN,
    UPDATE_PP_CLAIMS_INDEX_BY_KEY,
    UPDATE_PACKAGE_CLAIMS_INDEX_BY_KEY,
    UPDATE_EVALUATION_METHODS_BY_INDEX,
    UPDATE_ADDITIONAL_INFORMATION_TEXT,
    UPDATE_COLLAPSE_CONFORMATION_SECTION,
    UPDATE_COLLAPSE_ADDITIONAL_INFORMATION_SECTION,
    DELETE_MULTIPLE_PP_CLAIMS,
    DELETE_MULTIPLE_PACKAGE_CLAIMS,
    DELETE_MULTIPLE_EVALUATION_METHODS,
    RESET_CONFORMANCE_CLAIMS_STATE
} = conformanceClaimsSlice.actions

export default conformanceClaimsSlice.reducer
