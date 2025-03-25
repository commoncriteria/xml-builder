import navBarReducer from '../reducers/navBarSlice'
import contentPaneReducer from '../reducers/contentPaneSlice'
import accordionPaneReducer from '../reducers/accordionPaneSlice'
import termsReducer from '../reducers/termsSlice'
import editorReducer from '../reducers/editorSlice'
import threatsReducer from '../reducers/threatsSlice'
import objectivesReducer from '../reducers/objectivesSlice'
import sfrReducer from '../reducers/SFRs/sfrSlice'
import sfrPreviewReducer from '../reducers/SFRs/sfrPreview.js'
import sfrSectionReducer from '../reducers/SFRs/sfrSectionSlice'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import exportReducer from '../reducers/exportSlice'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST,PURGE, REGISTER } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import sarsReducer from '../reducers/sarsSlice'
import evaluationActivitiesReducer from "../reducers/SFRs/evaluationActivitiesUI.js";
import bibliographyReducer from '../reducers/bibliographySlice.js';
import entropyAppendixReducer from '../reducers/entropyAppendixSlice.js';
import equivGuidelinesAppendixReducer from '../reducers/equivalencyGuidelinesAppendix.js';
import includePackageReducer from '../reducers/includePackageSlice.js';
import moduleReducer from '../reducers/moduleSlice.js';
import satisfiedReqsAppendixReducer from "../reducers/satisfiedReqsAppendix.js";
import validationGuidelinesAppendixReducer from "../reducers/validationGuidelinesAppendix.js";
import vectorAppendixReducer from "../reducers/vectorAppendix.js"
import acknowledgementsAppendixReducer from "../reducers/acknowledgementsAppendix.js"
import stylingReducer from "../reducers/styling.js"
import tabularizeReducer from '../reducers/SFRs/tabularizeUI.js'
import progressBarReducer from "../reducers/progressSlice.js"
import preferenceReducer from '../reducers/ppPreferenceSlice.js';
import conformanceClaimsReducer from "../reducers/conformanceClaimsSlice.js"
import distributedTOE from "../reducers/distributedToeSlice.js"
import compliantTargetsOfEvaluationReducer from "../reducers/compliantTargetsOfEvaluationSlice.js"

const persistConfig = {
    key: 'root',
    version: 1,
    storage: sessionStorage,
}

const reducer = combineReducers({
    navBar: navBarReducer,
    contentPane: contentPaneReducer,
    accordionPane: accordionPaneReducer,
    terms: termsReducer,
    editors: editorReducer,
    threats: threatsReducer,
    objectives: objectivesReducer,
    sfrs: sfrReducer,
    sfrPreview: sfrPreviewReducer,
    sfrSections: sfrSectionReducer,
    exports: exportReducer,
    sars: sarsReducer,
    evaluationActivities: evaluationActivitiesReducer,
    bibliography: bibliographyReducer,
    entropyAppendix: entropyAppendixReducer,
    equivGuidelinesAppendix: equivGuidelinesAppendixReducer,
    satisfiedReqsAppendix: satisfiedReqsAppendixReducer,
    validationGuidelinesAppendix: validationGuidelinesAppendixReducer,
    vectorAppendix: vectorAppendixReducer,
    acknowledgementsAppendix: acknowledgementsAppendixReducer,
    includePackage: includePackageReducer,
    modules: moduleReducer,
    ppPreference: preferenceReducer,
    styling: stylingReducer,
    tabularize: tabularizeReducer,
    progressBar: progressBarReducer,
    conformanceClaims: conformanceClaimsReducer,
    distributedTOE: distributedTOE,
    compliantTargetsOfEvaluation: compliantTargetsOfEvaluationReducer
});

const persistedReducer = persistReducer(persistConfig, reducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export default store;