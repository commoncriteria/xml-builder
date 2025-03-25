import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = { }

export const editorSlice = createSlice({
    name: 'Editor',
    initialState,
    reducers: {
        CREATE_EDITOR: (state, action) => {
            let title = action.payload.title;
            let index = Object.values(state).findIndex((value) => value.title === title)
            if (index === -1) {
                let newId = uuidv4();
                state[newId] = {
                    title: title,
                    text: "",
                    open: false
                };
                action.payload = newId;
            } else {
                action.payload = null;
            }
        },
        UPDATE_EDITOR_TITLE: (state, action) => {
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            let newTitle = action.payload.newTitle;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid] = { ...state[uuid], title: newTitle };
                }
            }
        },
        UPDATE_EDITOR_TEXT: (state, action) => {
            let uuid = action.payload.uuid;
            let newText = action.payload.newText;
            if (state.hasOwnProperty(uuid)) {
                state[uuid] = { ...state[uuid], text: newText };
            }
        },
        UPDATE_EDITOR_METADATA: (state, action) => {
            let uuid = action.payload.uuid;

            if (state.hasOwnProperty(uuid)) {
                state[uuid].xmlTagMeta = action.payload.xmlTagMeta;
            }
        },
        DELETE_EDITOR: (state, action) => {
            let title = action.payload.title;
            let uuid = action.payload.uuid;
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    delete state[uuid];
                }
            }
        },
        COLLAPSE_EDITOR: (state, action) => {
            let uuid = action.payload.uuid
            let title = action.payload.title
            let open = action.payload.open
            if (state.hasOwnProperty(uuid)) {
                if (state[uuid].title === title) {
                    state[uuid].open = (open !== null && typeof open === "boolean") ? open : !state[uuid].open
                }
            }
        },
        SET_EDITORS_INITIAL_STATE: (state, action) => {
            try {
                return {
                    ...action.payload
                }
            } catch (e) {
                console.log(e)
            }
        },
        RESET_EDITOR_STATE: () => initialState,
    },
})

// Action creators are generated for each case reducer function

export const {
    CREATE_EDITOR,
    UPDATE_EDITOR_TITLE,
    UPDATE_EDITOR_TEXT,
    UPDATE_EDITOR_METADATA,
    DELETE_EDITOR,
    COLLAPSE_EDITOR,
    SET_EDITORS_INITIAL_STATE,
    RESET_EDITOR_STATE
} = editorSlice.actions

export default editorSlice.reducer