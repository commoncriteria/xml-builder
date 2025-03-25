import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "279086d8-89df-41fd-9dff-53be9f979877": {
        title: "Appendix E - Implicitly Satisfied Requirements",
        definition: "",
        open: false,
        sfrs: [
            // {
            //     "a575cbde-2002-4000-a06c-deda5f2d1c27": {
            //         title: "FIA_UAU.1 - Timing of authentication",
            //         sfr_component: "FIA_UAU.1", // TODO: needs to pull UUID from SFRs
            //         rationale: "FIA_AFL.1 implicitly requires that the OS perform all necessary actions, including those on behalf of the user who has not been authenticated, in order to authenticate; therefore it is duplicative to include these actions as a separate assignment and test.",
            //         open: false,
            //         tableOpen: false
            //     }
            // },
            // {
            //     "738d3402-d2f4-4959-8fd3-1d11cbd6ac89": {
            //         title: "FIA_UID.1 - Timing of identification",
            //         sfr_component: "FIA_UID.1 ", // TODO: needs to pull UUID from SFRs
            //         rationale: "FIA_AFL.1 implicitly requires that the OS perform all necessary actions, including those on behalf of the user who has not been identified, in order to authenticate; therefore it is duplicative to include these actions as a separate assignment and test.",
            //         open: false,
            //         tableOpen: false
            //     }
            // }
            {
                uuid: "a575cbde-2002-4000-a06c-deda5f2d1c27",
                title: "FIA_UAU.1 - Timing of authentication",
                sfr_component: "FIA_UAU.1",
                rationale: "FIA_AFL.1 implicitly requires that the OS perform all necessary actions, including those on behalf of the user who has not been authenticated, in order to authenticate; therefore it is duplicative to include these actions as a separate assignment and test.",
                open: false,
                tableOpen: false

            },
            {
                uuid: "738d3402-d2f4-4959-8fd3-1d11cbd6ac89", // TODO: needs to pull UUID from SFRs
                title: "FIA_UID.1 - Timing of identification",
                sfr_component: "FIA_UID.1 ",
                rationale: "FIA_AFL.1 implicitly requires that the OS perform all necessary actions, including those on behalf of the user who has not been identified, in order to authenticate; therefore it is duplicative to include these actions as a separate assignment and test.",
                open: false,
                tableOpen: false
            }
        ]
    },
}

export const appendixESlice = createSlice({
    name: 'appendixE',
    initialState,
    reducers: {
        CREATE_OBJECTIVE_SECTION: (state, action) => {
            let newId = uuidv4();
            let title = action.payload.title
            if (!state.hasOwnProperty(newId)) {
                state[newId] = {
                    title: title,
                    definition: "",
                    terms: {},
                    open: false
                };
                action.payload = newId
            } else {
                action.payload = null
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const {
    CREATE_OBJECTIVE_SECTION,
} = appendixESlice.actions

export default appendixESlice.reducer