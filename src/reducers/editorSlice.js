import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "37ef5096-4e69-4a5a-ba68-277440e24f70": {
        title: "Objectives of Document",
        xmlTagMeta: {
            tagName: "",
            attributes: {}
        },
        text: "<p><span style=\"color: black;\">The scope of this Protection Profile " +
            "(</span><a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#abbr_PP\" rel=\"noopener noreferrer\" " +
            "target=\"_blank\" style=\"color: blue;\">PP</a><span style=\"color: black;\">) is to describe the " +
            "security functionality of mobile devices in terms of " +
            "[</span><a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#abbr_CC\" rel=\"noopener noreferrer\" " +
            "target=\"_blank\" style=\"color: blue;\">CC</a><span style=\"color: black;\">] and to define functional " +
            "and assurance requirements for such devices.</span></p>",
        open: true
    },
    "da39f7c1-78dc-4cc0-a564-4f607d511f6f": {
        title: "Terms",
        text: "<p><span style=\"color: black;\">The following sections list Common Criteria and technology terms used in " +
            "this document.</span></p>",
        open: true
    },
    "f98870e2-4264-4d39-8b02-a5297d0a5b3d": {
        title: "TOE Overview",
        xmlTagMeta: {
            tagName: "section",
            attributes: {
                title: "Compliant Targets of Evaluation",
                id: "TOEdescription"
            },
        },
        text: "<p><span style=\"color: black;\">This assurance standard specifies information security requirements for " +
            "Mobile Devices for use in an enterprise. A Mobile Device in the context of this assurance standard is a " +
            "device, which is composed of a hardware platform and its system software. The device typically provides " +
            "wireless connectivity and may include software for functions like secure messaging, email, web,&nbsp;" +
            "</span><a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#abbr_VPN\" rel=\"noopener noreferrer\" " +
            "target=\"_blank\" style=\"color: blue;\">VPN</a><span style=\"color: black;\">&nbsp;connection, and VoIP " +
            "(Voice over&nbsp;</span><a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#abbr_IP\" " +
            "rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: blue;\">IP</a><span style=\"color: black;\">), " +
            "for access to the protected enterprise network, enterprise data and applications, and for communicating " +
            "to other Mobile Devices.</span></p>",
        open: true
    },
    "d68577d1-5737-4074-a700-764ca6a9189f": {
        title: "TOE Usage",
        xmlTagMeta: {
            tagName: "sec:Use_Cases",
            attributes: {}
        },
        text: "<p><span style=\"color: black;\">The Mobile Device may be operated in a number of use cases.&nbsp;" +
            "</span><a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#use-case-appendix\" " +
            "rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: blue;\">use-case-appendix</a><span " +
            "style=\"color: black;\">&nbsp;provides use case templates that list those selections, assignments, and " +
            "objective requirements that best support the use cases identified by this Protection Profile. In addition " +
            "to providing essential security services, the Mobile Device includes the necessary security functionality " +
            "to support configurations for these various use cases. Each use case may require additional configuration " +
            "and applications to achieve the desired security. A selection of these use cases is elaborated below." +
            "</span></p><p><span style=\"color: black;\">Several of the use case templates include objective requirements " +
            "that are strongly desired for the indicated use cases. Readers can expect those requirements to be made mandatory " +
            "in a future revision of this protection profile, and industry should aim to include that security functionality " +
            "in products in the near-term.</span></p><p><span style=\"color: black;\">As of publication of this version of " +
            "the Protection Profile, meeting the requirements in&nbsp;</span>" +
            "<a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#Security_Requirements\" rel=\"noopener noreferrer\" " +
            "target=\"_blank\" style=\"color: blue;\">Section 5 Security Requirements</a><span style=\"color: black;\">" +
            "&nbsp;is necessary for all use cases.</span></p><p><span style=\"color: black;\">An enterprise-owned device " +
            "for general-purpose business use is commonly called&nbsp;</span><em style=\"color: black;\">Corporately Owned, " +
            "Personally Enabled (COPE)</em><span style=\"color: black;\">. This use case entails a significant degree of " +
            "enterprise control over configuration and, possibly, software inventory. The enterprise elects to provide " +
            "users with Mobile Devices and additional applications (such as&nbsp;</span>" +
            "<a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#abbr_VPN\" rel=\"noopener noreferrer\" " +
            "target=\"_blank\" style=\"color: blue;\">VPN</a><span style=\"color: black;\">&nbsp;or email clients) in " +
            "order to maintain control of their Enterprise data and security of their networks. Users may use Internet " +
            "connectivity to browse the web or access corporate mail or run enterprise applications, but this connectivity " +
            "may be under significant control of the enterprise.</span></p><p><span style=\"color: black;\">For changes to " +
            "included&nbsp;</span><a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#abbr_SFR\" " +
            "rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: blue;\">SFRs</a><span style=\"color: black;\">, " +
            "selections, and assignments required for this use case, see&nbsp;</span>" +
            "<a href=\"https://www.niap-ccevs.org/MMO/PP/MDF%203.3%20PP/#appendix-uc-enterprise\" rel=\"noopener noreferrer\" " +
            "target=\"_blank\" style=\"color: blue;\">H.1 Enterprise-owned device for general-purpose enterprise use and " +
            "limited personal use</a><span style=\"color: black;\">.</span></p>",
        open: true
    },
    "1c487474-5e05-4837-a1d9-23da1530688d": {
        title: "Conformance Statement",
        xmlTagMeta: {
            tagName: "cclaim",
            attributes: {
                name: "Conformance Statement"
            }
        },
        text: "An ST must claim exact conformance to this PP, as defined in the CC and CEM addenda for Exact Conformance, Selection-Based SFRs, and Optional SFRs (dated May 2017).",
        open: true
    },
    "68244faa-e405-46b4-9df7-140246ca3463": {
        title: "CC Conformance Claims",
        xmlTagMeta: {
            tagName: "cclaim",
            attributes: {
                name: "CC Conformance Claims"
            }
        },
        text: "This PP is conformant to Parts 2 (extended) and 3 (conformant) of Common Criteria Version 3.1, Revision 5.",
        open: true
    },
    "e3d935a4-a1e1-44be-b868-fa7eb8322e00": {
        title: "PP Claims",
        xmlTagMeta: {
            tagName: "cclaim",
            attributes: {
                name: "PP Claim"
            }
        },
        text: "This PP does not claim conformance to any Protection Profile.",
        open: true
    },
    "37032788-a50d-442b-98e6-e8e3b92b26f7": {
        title: "Package Claims",
        xmlTagMeta: {
            tagName: "cclaim",
            attributes: {
                name: "Package Claim"
            }
        },
        text: "This PP does not claim conformance to any packages.",
        open: true
    },
    "849fe5bc-7364-4448-863a-d280f63d9516": {
        title: "Security Functional Requirements",
        text: "",
        open: true
    },
    "ceb738a9-60e1-48b7-bfe9-2e7c2de5153b": {
        title: "Security Assurance Requirements",
        text: "The Security Objectives for the TOE in <xref to=\"req\"/> were constructed to address threats identified in  " +
            "<xref to=\"Threats\"/>. The Security Functional Requirements (SFRs) in <xref to=\"SFRs\"/> are a formal " +
            "instantiation of the Security Objectives. The PP identifies the Security Assurance Requirements " +
            "(SARs) to frame the extent to which the evaluator assesses the documentation applicable for the evaluation " +
            "and performs independent testing.<h:p/> " +
            "This section lists the set of SARs from CC part 3 that are required in evaluations against this " +
            "PP. Individual Evaluation Activities (EAs) to be performed are specified both " +
            "in <xref to=\"req\"/> as well as in this section. <h:p/> " +
            "The general model for evaluation of TOEs against STs written to conform to this PP is as follows:<h:p/> " +
            "After the ST has been approved for evaluation, the  CCTL will obtain the TOE, supporting " +
            "environmental IT, and the administrative/user guides for the TOE. The CCTL is expected to " +
            "perform actions mandated by the Common Evaluation Methodology (CEM) for the ASE and " +
            "ALC SARs. The CCTL also performs the evaluation activities contained within <xref to=\"req\"/>, " +
            "which are intended to be an interpretation of the other CEM assurance requirements as they " +
            "apply to the specific technology instantiated in the TOE. The evaluation activities that are " +
            "captured in <xref to=\"req\"/> also provide clarification as to what the developer needs " +
            "to provide to demonstrate the TOE is compliant with the PP. The results of these activities will be documented " +
            "and presented (along with the administrative guidance used) for validation.",
        open: true
    }
}

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
                    open: true
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
        RESET_EDITOR_STATE: () => initialState,
    },
})

// Action creators are generated for each case reducer function

export const { CREATE_EDITOR, UPDATE_EDITOR_TITLE, UPDATE_EDITOR_TEXT, UPDATE_EDITOR_METADATA,
    DELETE_EDITOR, COLLAPSE_EDITOR, RESET_EDITOR_STATE
} = editorSlice.actions

export default editorSlice.reducer