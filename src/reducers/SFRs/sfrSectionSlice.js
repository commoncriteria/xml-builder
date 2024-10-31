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
                    testClosing: "",
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
                    testClosing: "",
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
        "e263d232-87a1-4564-a3d1-e5702f669992": {
            title: "Cryptographic Key Derivation",
            cc_id: "FCS_CKM_EXT.5",
            iteration_id: "",
            xml_id: "sfr-fcs-ckm-ext-5",
            definition: "",
            optional: true,
            objective: false,
            selectionBased: false,
            selections: {},
            useCaseBased: false,
            useCases: [],
            implementationDependent: false,
            reasons: [],
            extendedComponentDefinition: {
                audit: "",
                componentLeveling: "requires the TSF to perform key derivation using a defined method, which is \n\t\t\t\tnot addressed by any other FCS_CKM component.",
                dependencies: "\n\t\t\t[FCS_CKM.1 Cryptographic Key Generation or\n\t\t\tFDP_ITC_EXT.1 Key/Credential Import]",
                managementFunction: "",
                toggle: true
            },
            tableOpen: true,
            objectives: [],
            elements: {
                "c7fc81d7-8402-44f4-af18-d22075f920e7": {
                    // id: "FCS_CKM_EXT.5.1",
                    selectables: {
                        "4da104d2-72bd-11ef-97fb-325096b39f47": {
                            "id": "",
                            "description": "key type",
                            "assignment": true,
                        },
                        "4da10784-72bd-11ef-9285-325096b39f47": {
                            "id": "sel-fcs-ckm-5-kdf-ctr-dirgen",
                            "description": "Direct Generation from a Random Bit Generator as specified in FCS_RBG_EXT.1",
                            "assignment": false,
                        },
                        "f1dfb009-3390-4a69-aa87-62bbd07dabc8": {
                            "id": "",
                            "description": "Concatenated keys",
                            "assignment": false,
                        },
                        "bb59515c-a3b8-4476-943c-fa9e033190a9": {
                            "id": "",
                            "description": "CMAC-AES-128",
                            "assignment": false,
                        },
                        "89604898-1ca0-45e2-a960-fb1506aca833": {
                            "id": "",
                            "description": "CMAC-AES-192",
                            "assignment": false,
                        },
                        "0ee44c2e-7a88-4ffb-bd3e-046adba4b748": {
                            "id": "",
                            "description": "CMAC-AES-256",
                            "assignment": false,
                        },
                        "4bca6ce2-85ae-4e91-8efe-047096c48ec9": {
                            "id": "",
                            "description": "HMAC-SHA-1",
                            "assignment": false,
                        },
                        "2d11246a-ce3f-4873-a202-b9f77e61a476": {
                            "id": "",
                            "description": "HMAC-SHA-256",
                            "assignment": false,
                        },
                        "165e4147-5751-40f3-8b12-db40ebda1926": {
                            "id": "",
                            "description": "HMAC-SHA-512",
                            "assignment": false,
                        },
                        "438f5d9a-81e8-484f-bc89-81911e28d2f4": {
                            "id": "",
                            "description": "128",
                            "assignment": false,
                        },
                        "2f14c8a5-269f-4bf2-ab8d-322fcb21f746": {
                            "id": "",
                            "description": "192",
                            "assignment": false,
                        },
                        "40d552fc-8061-496d-8ae0-38f3eed5dd2d": {
                            "id": "",
                            "description": "256",
                            "assignment": false,
                        },
                        "9143f99f-2418-4544-82ed-8d76eb20847e": {
                            "id": "",
                            "description": "ISO/IEC 9797-1:2011 (CMAC)",
                            "assignment": false,
                        },
                        "86eecf3d-2138-4765-a711-b153baab149b": {
                            "id": "",
                            "description": "NIST SP 800-38B (CMAC)",
                            "assignment": false,
                        },
                        "b2525155-8335-45be-8bd6-3326c5764919": {
                            "id": "",
                            "description": "ISO/IEC 18033-3:2010 (AES)",
                            "assignment": false,
                        },
                        "74f6aaa4-3090-44e0-bad1-6cb811511981": {
                            "id": "",
                            "description": "ISO/IEC 9797-2:2011 (HMAC)",
                            "assignment": false,
                        },
                        "9c58093a-13fd-426a-93ca-c2d6858f9ee4": {
                            "id": "",
                            "description": "ISO/IEC 9797-2:2011 (HMAC)",
                            "assignment": false,
                        },
                        "6ea3499b-24c6-4dbb-8930-55d3566f7ccc": {
                            "id": "",
                            "description": "ISO/IEC 10118-3:2018 (SHA)",
                            "assignment": false,
                        },
                        "aa465065-f8c5-4e6a-a865-0e4f783f4cec": {
                            "id": "",
                            "description": "FIPS PUB 180-4 (SHA)",
                            "assignment": false,
                        },
                        "7d00349a-c5b6-4a43-baf8-82a0e152eb87": {
                            "id": "sel-fcs-ckm-5-kdf-fb-dirgen",
                            "description": "Direct Generation from a Random Bit Generator as specified in FCS_RBG_EXT.1",
                            "assignment": false,
                        },
                        "240b7a44-dea2-4957-9993-5a68a0f3bbdb": {
                            "id": "sel-fcs-ckm-5-kdf-dpi-dirgen",
                            "description": "Direct Generation from a Random Bit Generator as specified in FCS_RBG_EXT.1",
                            "assignment": false,
                        },
                        "96b6e8f0-bfee-4f4a-9ed0-fa6b3c6fd325": {
                            "id": "",
                            "description": "exclusive OR (XOR)",
                            "assignment": false,
                        },
                        "716cc0b2-c0b2-44d0-b113-5b29863eed03": {
                            "id": "",
                            "description": "SHA-256",
                            "assignment": false,
                        },
                        "2ad3433a-8187-4ce0-b014-491667246970": {
                            "id": "",
                            "description": "SHA-512",
                            "assignment": false,
                        },
                        "5e237f32-bd5c-45bb-9afe-99209ee74995": {
                            "id": "",
                            "description": "ISO/IEC 10118-3:2018 (SHA)",
                            "assignment": false,
                        },
                        "ee657865-8f3d-4821-ba17-aff0f2a1ed01": {
                            "id": "",
                            "description": "FIPS PUB 180-4 (SHA)",
                            "assignment": false,
                        },
                        "79dddbd2-fa15-4020-9bc3-2dbdfdeded1e": {
                            "id": "",
                            "description": "AES-CCM",
                            "assignment": false,
                        },
                        "b3e7208b-b03c-4400-9ecf-cdbc35d32352": {
                            "id": "",
                            "description": "AES-GCM",
                            "assignment": false,
                        },
                        "278c36ad-025b-4489-855a-eb7917fe121f": {
                            "id": "",
                            "description": "AES-CBC",
                            "assignment": false,
                        },
                        "d9de53af-5a04-400f-a4d2-79d7572879c2": {
                            "id": "",
                            "description": "AES-KWP",
                            "assignment": false,
                        },
                        "329ef31d-461f-440b-a27e-cb8d5812d721": {
                            "id": "",
                            "description": "AES-KW",
                            "assignment": false,
                        },

                        "cd474c9a-a220-4762-87d0-eb5a082b6a2b": {
                            "id": "",
                            "description": "ISO/IEC 18033-3:2010 (subclause 5.2) (AES)",
                            "assignment": false,
                        },
                        "b5ff091c-7a18-41f5-99bd-cdee8ca878eb": {
                            "id": "",
                            "description": "FIPS PUB 197 (AES)",
                            "assignment": false,
                        },
                        "36551ef8-74aa-47ca-a94c-01d6945acc41": {
                            "id": "",
                            "description": "ISO/IEC 10116:2017 (clause 7) (CBC)",
                            "assignment": false,
                        },
                        "584adb6a-8118-4194-840b-e2a71670f44a": {
                            "id": "",
                            "description": "NIST SP 800-38A sec. 6.2 (CBC)",
                            "assignment": false,
                        },
                        "678d4023-04c1-42b3-ba74-2ea8cf51d0a8": {
                            "id": "",
                            "description": "ISO/IEC 19772:2009 (clause 8) (CCM)",
                            "assignment": false,
                        },
                        "c4551da8-a03b-4f71-9da7-a2d55214803a": {
                            "id": "",
                            "description": "NIST SP 800-38C (CCM)",
                            "assignment": false,
                        },
                        "d158cdea-89c2-400c-b2d2-ca649b79d9f1": {
                            "id": "",
                            "description": "ISO/IEC 19772:2009 (clause 11) (GCM)",
                            "assignment": false,
                        },
                        "c283a522-805d-42e8-b0cb-911906041050": {
                            "id": "",
                            "description": "NIST SP 800-38D (GCM)",
                            "assignment": false,
                        },
                        "c6d10509-5e96-46eb-84f5-eb0134e06cef": {
                            "id": "",
                            "description": "IEEE Std. 1619-2007 (XTS)",
                            "assignment": false,
                        },
                        "e1016b71-6591-46bd-bb2e-b37781f960f2": {
                            "id": "",
                            "description": "NIST SP 800-38E (XTS)",
                            "assignment": false,
                        },
                        "3a638773-e54b-43a1-a609-28a278b8dd22": {
                            "id": "",
                            "description": "ISO/IEC 19772:2009, clause 7 (Key wrap)",
                            "assignment": false,
                        },
                        "f0aa1c9e-aa40-4b9a-a7a4-64bad2d91430": {
                            "id": "",
                            "description": "NIST SP 800-38F sec. 6.2 (KW)",
                            "assignment": false,
                        },
                        "38c94aad-f3e4-42d1-ae10-1b063523d9ea": {
                            "id": "",
                            "description": "NIST SP 800-38F sec. 6.3 (KWP)",
                            "assignment": false,
                        },
                        "3a0b8fa5-30ee-4d1f-9dc4-6cfc429ccefd": {
                            "id": "",
                            "description": "Hash function from FCS_COP.1/Hash",
                            "assignment": true,
                        },
                        "0558c87d-c90f-48b0-8bf2-3103c18b9799": {
                            "id": "",
                            "description": "keyed hash from FCS_COP.1/KeyedHash",
                            "assignment": true,
                        },
                        "77e393d9-b772-4770-a1c2-24ebe4239ac8": {
                            "id": "",
                            "description": "HMAC-SHA-224",
                            "assignment": false,
                        },
                        "f3ee5f9a-4b05-4a63-862e-95f375eb066d": {
                            "id": "",
                            "description": "HMAC-SHA-384",
                            "assignment": false,
                        },
                        "17cac564-776f-428f-a49a-a4ec63fc5c40": {
                            "id": "",
                            "description": "HMAC-SHA-512/224",
                            "assignment": false,
                        },
                        "fde76804-af87-42fb-84de-afb78fcb892d": {
                            "id": "",
                            "description": "HMAC-SHA-512/256",
                            "assignment": false,
                        },
                        "cd703f3a-5abd-430b-b1be-30fa2ba29e5b": {
                            "id": "",
                            "description": "HMAC-SHA3-224",
                            "assignment": false,
                        },
                        "0835a780-e080-453f-b468-126a2848d9fc": {
                            "id": "",
                            "description": "HMAC-SHA3-256",
                            "assignment": false,
                        },
                        "0f1c0384-ca38-4478-85e2-716f2aeee631": {
                            "id": "",
                            "description": "HMAC-SHA3-384",
                            "assignment": false,
                        },
                        "c85dcf26-40bb-4d70-b64f-f8187677a5cc": {
                            "id": "",
                            "description": "HMAC-SHA3-512",
                            "assignment": false,
                        },
                    },
                    selectableGroups: {
                        "group0": {
                            "onlyOne": false,
                            "groups": [
                                "4da10784-72bd-11ef-9285-325096b39f47",
                                "f1dfb009-3390-4a69-aa87-62bbd07dabc8"
                            ]
                        },
                        "group1": {
                            "onlyOne": false,
                            "groups": [
                                "bb59515c-a3b8-4476-943c-fa9e033190a9",
                                "89604898-1ca0-45e2-a960-fb1506aca833",
                                "0ee44c2e-7a88-4ffb-bd3e-046adba4b748",
                                "4bca6ce2-85ae-4e91-8efe-047096c48ec9",
                                "2d11246a-ce3f-4873-a202-b9f77e61a476",
                                "165e4147-5751-40f3-8b12-db40ebda1926",
                            ]
                        },
                        "group2": {
                            "onlyOne": false,
                            "groups": [
                                "438f5d9a-81e8-484f-bc89-81911e28d2f4",
                                "2f14c8a5-269f-4bf2-ab8d-322fcb21f746",
                                "40d552fc-8061-496d-8ae0-38f3eed5dd2d",
                            ]
                        },
                        "group3": {
                            "onlyOne": false,
                            "groups": [
                                "9143f99f-2418-4544-82ed-8d76eb20847e",
                                "86eecf3d-2138-4765-a711-b153baab149b",
                                "b2525155-8335-45be-8bd6-3326c5764919",
                                "74f6aaa4-3090-44e0-bad1-6cb811511981",
                                "9c58093a-13fd-426a-93ca-c2d6858f9ee4",
                                "6ea3499b-24c6-4dbb-8930-55d3566f7ccc",
                                "aa465065-f8c5-4e6a-a865-0e4f783f4cec",
                            ]
                        },
                        "group4": {
                            "onlyOne": false,
                            "groups": [
                                "7d00349a-c5b6-4a43-baf8-82a0e152eb87",
                                "f1dfb009-3390-4a69-aa87-62bbd07dabc8",
                            ]
                        },
                        "group5": {
                            "onlyOne": false,
                            "groups": [
                                "96b6e8f0-bfee-4f4a-9ed0-fa6b3c6fd325",
                                "716cc0b2-c0b2-44d0-b113-5b29863eed03",
                                "2ad3433a-8187-4ce0-b014-491667246970",
                            ]
                        },
                        "group6": {
                            "onlyOne": false,
                            "groups": [
                                "5e237f32-bd5c-45bb-9afe-99209ee74995",
                                "ee657865-8f3d-4821-ba17-aff0f2a1ed01",
                            ]
                        },
                        "group7": {
                            "onlyOne": false,
                            "groups": [
                                "79dddbd2-fa15-4020-9bc3-2dbdfdeded1e",
                                "b3e7208b-b03c-4400-9ecf-cdbc35d32352",
                                "278c36ad-025b-4489-855a-eb7917fe121f",
                                "d9de53af-5a04-400f-a4d2-79d7572879c2",
                                "329ef31d-461f-440b-a27e-cb8d5812d721",
                            ]
                        },
                        "group8": {
                            "onlyOne": false,
                            "groups": [
                                "cd474c9a-a220-4762-87d0-eb5a082b6a2b",
                                "b5ff091c-7a18-41f5-99bd-cdee8ca878eb",
                                "36551ef8-74aa-47ca-a94c-01d6945acc41",
                                "584adb6a-8118-4194-840b-e2a71670f44a",
                                "678d4023-04c1-42b3-ba74-2ea8cf51d0a8",
                                "c4551da8-a03b-4f71-9da7-a2d55214803a",
                                "d158cdea-89c2-400c-b2d2-ca649b79d9f1",
                                "c283a522-805d-42e8-b0cb-911906041050",
                                "c6d10509-5e96-46eb-84f5-eb0134e06cef",
                                "e1016b71-6591-46bd-bb2e-b37781f960f2",
                                "3a638773-e54b-43a1-a609-28a278b8dd22",
                                "f0aa1c9e-aa40-4b9a-a7a4-64bad2d91430",
                                "38c94aad-f3e4-42d1-ae10-1b063523d9ea",
                            ]
                        },
                        "group9": {
                            "onlyOne": false,
                            "groups": [
                                "240b7a44-dea2-4957-9993-5a68a0f3bbdb",
                                "f1dfb009-3390-4a69-aa87-62bbd07dabc8",
                            ]
                        },
                        "group10": {
                            "onlyOne": false,
                            "groups": [
                                "4bca6ce2-85ae-4e91-8efe-047096c48ec9",
                                "77e393d9-b772-4770-a1c2-24ebe4239ac8",
                                "2d11246a-ce3f-4873-a202-b9f77e61a476",
                                "f3ee5f9a-4b05-4a63-862e-95f375eb066d",
                                "165e4147-5751-40f3-8b12-db40ebda1926",
                                "17cac564-776f-428f-a49a-a4ec63fc5c40",
                                "fde76804-af87-42fb-84de-afb78fcb892d",
                                "cd703f3a-5abd-430b-b1be-30fa2ba29e5b",
                                "0835a780-e080-453f-b468-126a2848d9fc",
                                "0f1c0384-ca38-4478-85e2-716f2aeee631",
                                "c85dcf26-40bb-4d70-b64f-f8187677a5cc",
                            ]
                        },

                    },
                    title: [
                        {
                            text: "The TSF shall derive cryptographic keys of type "
                        },
                        {
                            assignment: "4da104d2-72bd-11ef-97fb-325096b39f47"
                        },
                        {
                            tabularize: "94212fa7-3465-4010-93a0-9bb9adc8a4ce"
                        }
                    ],
                    tabularize: {
                        "94212fa7-3465-4010-93a0-9bb9adc8a4ce": {
                            "id": "fcs-ckm-keydrv-sels",
                            "title": "Choices for completion of the assignment operations in FCS_CKM_EXT.5.1",
                            "definition": [
                                {
                                    "value": "Selectable ID",
                                    "type": "textcol"
                                },
                                {
                                    "value": "Identifier",
                                    "type": "textcol"
                                },
                                {
                                    "value": "from input parameters",
                                    "type": "reqtext"
                                },
                                {
                                    "value": "Input parameters",
                                    "type": "selectcol"
                                },
                                {
                                    "value": "in accordance with a specified key derivation algorithm",
                                    "type": "reqtext"
                                },
                                {
                                    "value": "Key derivation algorithm",
                                    "type": "selectcol"
                                },
                                {
                                    "value": "and specified cryptographic key sizes",
                                    "type": "reqtext"
                                },
                                {
                                    "value": "Cryptographic key sizes",
                                    "type": "selectcol"
                                },
                                {
                                    "value": "that meet the following:",
                                    "type": "reqtext"
                                },
                                {
                                    "value": "List of standards",
                                    "type": "selectcol"
                                },
                            ],
                            "columns": [
                                // Selectable ID is always in the tabularize table
                                {
                                    "headerName": "Selectable ID",
                                    "field": "selectableId",
                                    "editable": false,
                                    "resizable": true,
                                    "type": "Editor",
                                    "flex": 3
                                },
                                {
                                    "headerName": "Identifier",
                                    "field": "identifier",
                                    "editable": false,
                                    "resizable": true,
                                    "type": "Editor",
                                    "flex": 3
                                },
                                {
                                    "headerName": "Input parameters",
                                    "field": "inputParameters",
                                    "editable": false,
                                    "resizable": true,
                                    "type": "Button",
                                    "flex": 5
                                },
                                {
                                    "headerName": "Key derivation algorithm",
                                    "field": "keyDerivationAlgorithm",
                                    "editable": false,
                                    "resizable": true,
                                    "type": "Button",
                                    "flex": 5
                                },
                                {
                                    "headerName": "Cryptographic key sizes",
                                    "field": "cryptographicKeySizes",
                                    "editable": false,
                                    "resizable": true,
                                    "type": "Button",
                                    "flex": 5
                                },
                                {
                                    "headerName": "List of standards",
                                    "field": "listOfStandards",
                                    "editable": false,
                                    "resizable": true,
                                    "type": "Button",
                                    "flex": 5
                                },
                            ],
                            "rows": [
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-ctr",
                                    "identifier": "KDF-CTR",
                                    "inputParameters": [
                                        {
                                            "selections": "group0"
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "text": "KDF in Counter Mode using ",
                                        },
                                        {
                                            "selections": "group1"
                                        },
                                        {
                                            "text": " as the PRF",
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2"
                                        },
                                        {
                                            "text": " bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "description": "NIST SP 800-108 sec. 5.1 (KDF in Counter Mode)<p/>"
                                        },
                                        {
                                            "selections": "group3"
                                        }
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-fb",
                                    "identifier": "KDF-FB",
                                    "inputParameters": [
                                        {
                                            "selections": "group4",
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "text": "KDF in Feedback Mode using ",
                                        },
                                        {
                                            "selections": "group1",
                                        },
                                        {
                                            "text": " as the PRF",
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": " bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "description": "NIST SP 800-108 sec 5.2 (KDF in Feedback Mode)<p/>",

                                        },
                                        {
                                            "selections": "group3"
                                        }
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-dpi",
                                    "identifier": "KDF-DPI",
                                    "inputParameters": [
                                        {
                                            "selections": "group9",
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "text": "KDF in Double Pipeline Iteration Mode using ",
                                        },
                                        {
                                            "selections": "group1",
                                        },
                                        {
                                            "text": " as the PRF",
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": "bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "description": "NIST SP 800-108 sec. 5.3 (KDF in n Double Pipeline Iteration Mode)<p/>",

                                        },
                                        {
                                            "selections": "group3"
                                        }
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-xor",
                                    "identifier": "KDF-XOR",
                                    "inputParameters": [
                                        {
                                            "text": "Intermediary keys",
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "selections": "group5"
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": "bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "selections": "group6"
                                        },
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-enc",
                                    "identifier": "KDF-ENC",
                                    "inputParameters": [
                                        {
                                            "text": "Two keys"
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "text": "Encryption using ",
                                        },
                                        {
                                            "selections": "group7"
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": "bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "selections": "group8"
                                        },
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-hash",
                                    "identifier": "KDF-HASH",
                                    "inputParameters": [
                                        {
                                            "text": "Shared secret, salt, output length, fixed information"
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "assignment": "3a0b8fa5-30ee-4d1f-9dc4-6cfc429ccefd"
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": "bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "text": "NIST SP 800-56C rev2, sec. 4"
                                        },
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-mac",
                                    "identifier": "KDF-MAC",
                                    "inputParameters": [
                                        {
                                            "text": "Shared secret, salt, IV, output length, fixed information"
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "assignment": "0558c87d-c90f-48b0-8bf2-3103c18b9799"
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": "bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "text": "NIST SP 800-56C rev2, sec. 4"
                                        },
                                    ],
                                },
                                {
                                    "selectableId": "sel-fcs-ckm-ext-5-kdf-pb",
                                    "identifier": "KDF-PBKDF",
                                    "inputParameters": [
                                        {
                                            "text": "Password, salt, iteration count"
                                        },
                                    ],
                                    "keyDerivationAlgorithm": [
                                        {
                                            "selections": "group10",
                                        },
                                    ],
                                    "cryptographicKeySizes": [
                                        {
                                            "selections": "group2",
                                        },
                                        {
                                            "text": "bits",
                                        },
                                    ],
                                    "listOfStandards": [
                                        {
                                            "text": "NIST SP 800-132"
                                        },
                                    ],
                                },
                            ],
                        }
                    },
                    note:  `The "key type" assignment should indicate the type type of key being derived, e.g. "<i>symmetric</i>,"
                            "<i>asymmetric</i>," or "<i>HMAC</i>."<p/>
                            This SFR must be included in the ST if key derivation is a service provided by the TOE to tenant software,
                            or if it is used by the TOE itself to support or implement PP-specified security functionality.<p/> 
                            If this SFR is included in the ST, then FCS_CKM.4 must also be claimed.<p/>
                            If "<i>KDF-XOR</i>" and at least one of the SHA hashes is selected, then FCS_COP.1/Hash must be claimed.<p/>
                            If "<i>KDF-HASH</i>" or "<i>KDF-MAC</i>" is selected, then FCS_COP.1/Hash must be claimed.<p/>
                            If "<i>KDF-MAC</i>" is selected, then FCS_COP.1/KeyedHash must be claimed.<p/>
                            If "<i>KDF-PBKDF</i>" is selected, then FCS_COP.1/KeyedHash must be claimed.<p/>
                            If "<i>KDF-CTR</i>," "<i>KDF-FB</i>," or "<i>KDF-DPI</i>" is selected, then
                            FCS_RBG_EXT.1 must be claimed.<p/>
                            If "<i>KDF-CTR</i>," "<i>KDF-FB</i>," or "<i>KDF-DPI</i>" is selected, and 
                            HMAC is selected as part of the key derivation algorithm, then FCS_COP.1/KeyedHash must be claimed.<p/>
                            For Authorization Factor Submasks, the key size to be used in the HMAC falls into a range between
                            L1 and L2 defined in ISO/IEC 10118 for the appropriate hash function (for example for SHA-256
                            L1 = 512, L2 = 256) where L2 &lt;= k &lt;= L1.<p/>
                            NIST SP 800-131A Rev 1 allows the use of SHA-1 in these use cases.<p/>
                            KDF-ENC and KDF-XOR create an “inverted key hierarchy” in which the TSF will combine two or more 
                            keys to create a third key. These same KDFs may also
                            use a submask key as input, which could be an authorization factor or derived from a PBKDF. In
                            these cases the ST Author must explicitly declare this option and should present a reasonable
                            argument that the entropy of the inputs to the KDFs will result in full entropy of the expected
                            output.`,
                    open: false
                },
            },
            evaluationActivities: {
                "c7fc81d7-8402-44f4-af18-d22075f920e7": {
                    "tss": "The evaluator shall check that the TSS includes a description of the key derivation\n\t\t\t\t\t\tfunctions and shall check that this uses a key derivation algorithm and key sizes\n\t\t\t\t\t\taccording to the specification selected in  &lt;xref to=\"fcs-ckm-keydrv-sels\"&gt;&lt;/xref&gt;. The evaluator shall confirm that the TSS supports the selected\n\t\t\t\t\t\tmethods.<p></p>\n\t\t\t\t\t\tIf key combination is used to form a KEK, the evaluator shall verify\n\t\t\t\t\t\tthat the TSS describes the method of combination and that this method is either an\n\t\t\t\t\t\tXOR, a KDF, or encryption.<p></p>\n\t\t\t\t\t\tIf a KDF is used to form a KEK, the evaluator shall ensure that the\n\t\t\t\t\t\tTSS includes a description of the key derivation function and shall verify the key\n\t\t\t\t\t\tderivation uses an approved derivation mode and key expansion algorithm\n\t\t\t\t\t\taccording to SP 800-108.<p></p>\n\t\t\t\t\t\tIf key concatenation is used to derive KEKs, the evaluator\n\t\t\t\t\t\tshall ensure the TSS includes a description of the randomness extraction step,\n\t\t\t\t\t\tincluding the following:<p></p><ul><li>The description must include how an approved untruncated MAC function is\n\t\t\t\t\t\t\tbeing used for the randomness extraction step and the evaluator must verify\n\t\t\t\t\t\t\tthe TSS describes that the output length (in bits) of the MAC function is at\n\t\t\t\t\t\t\tleast as large as the targeted security strength (in bits) of the parameter set\n\t\t\t\t\t\t\temployed by the key establishment scheme (see Tables 1-3 of SP 800-56C).</li><li>The description must include how the MAC function being used for the\n\t\t\t\t\t\t\trandomness extraction step is related to the PRF used in the key expansion and\n\t\t\t\t\t\t\tverify the TSS description includes the correct MAC function:<ul><li>If an HMAC-hash is used in the randomness extraction step, then the same\n\t\t\t\t\t\t\t\tHMAC-hash (with the same hash function hash) is used as the PRF in the\n\t\t\t\t\t\t\t\tkey expansion step.</li><li>If an AES-CMAC (with key length 128, 192, or 256 bits) is used in the\n\t\t\t\t\t\t\t\trandomness extraction step, then AES-CMAC with a 128-bit key is used\n\t\t\t\t\t\t\t\tas the PRF in the key expansion step.</li></ul></li><li>The description must include the lengths of the salt values being used in the\n\t\t\t\t\t\t\trandomness extraction step and the evaluator shall verify the TSS description\n\t\t\t\t\t\t\tincludes correct salt lengths:<ul><li>If an HMAC-hash is being used as the MAC, the salt length can be any\n\t\t\t\t\t\t\t\tvalue up to the maximum bit length permitted for input to the hash\n\t\t\t\t\t\t\t\tfunction hash.</li><li>If an AES-CMAC is being used as the MAC, the salt length shall be the\n\t\t\t\t\t\t\t\tsame length as the AES key (i.e. 128, 192, or 256 bits).</li></ul></li></ul>",
                    "guidance": "\n\t\t\t\t\t\tThe evaluator shall verify that the AGD instructs the administrator how\n\t\t\t\t\t\tto configure the TOE to use the selected key types for all uses identified in the ST.<p></p>",
                    "testIntroduction": "\n\t\t\t\t\t\tThe following tests require the developer to provide access to a test platform that\n\t\t\t\t\t\tprovides the evaluator with tools that are typically not found on factory products.<p></p>\n\t\t\t\t\t\tThe evaluator shall perform one or more of the following tests to verify the\n\t\t\t\t\t\tcorrectness of the key derivation function, depending on the specific functions that\n\t\t\t\t\t\tare supported:<p></p>\n\t\t\t\t\t\tPreconditions for testing:<ul><li>Specification of input parameter to the key derivation function to be tested</li><li>Specification of further required input parameters</li><li>Access to derived keys</li></ul>\n\t\t\t\t\t\tThe following table maps the data fields in the tests below to the notations used in\n\t\t\t\t\t\tSP 800-108 and SP 800-56C<p></p><table><tr class=\"header\"><td >Data Fields</td><td colspan=\"2\">Notations</td></tr><tr ><td ></td><td >SP 800-108</td><td >SP 800-56C</td></tr><tr ><td >Pseudorandom function</td><td >PRF</td><td >PRF</td></tr><tr ><td >Counter length</td><td >r</td><td >r</td></tr><tr ><td >Length of output of PRF</td><td >r</td><td >r</td></tr><tr ><td >Length of derived keying material</td><td >L</td><td >L</td></tr><tr ><td >Length of input values</td><td >I_length</td><td >I_length</td></tr><tr ><td >Pseudorandom input values I</td><td >K1 (key derivation key)</td><td >Z (shared secret)</td></tr><tr ><td >Pseudorandom salt values</td><td ></td><td >S</td></tr><tr ><td >Randomness extraction MAC</td><td >n/a</td><td >MAC</td></tr></table>\n\t\t\t\t\t\tThe below tests are derived from Key Derivation using Pseudorandom Functions\n\t\t\t\t\t\t(SP 800-108) Validation System (KBKDFVS), Updated 4 January 2016, Section\n\t\t\t\t\t\t6.2, from the National Institute of Standards and Technology.<p></p><b>KDF-CTR: Counter Mode Tests:</b><p></p>\n\t\t\t\t\t\tThe evaluator shall determine the following characteristics of the key derivation\n\t\t\t\t\t\tfunction:<ul><li>One or more pseudorandom functions that are supported by the\n\t\t\t\t\t\t\timplementation (PRF).</li><li>One or more of the values {8, 16, 24, 32} that equal the length of the binary\n\t\t\t\t\t\t\trepresentation of the counter (r).</li><li>The length (in bits) of the output of the PRF (h).</li><li>Minimum and maximum values for the length (in bits) of the derived keying\n\t\t\t\t\t\t\tmaterial (L). These values can be equal if only one value of L is supported.\n\t\t\t\t\t\t\tThese must be evenly divisible by h.</li><li>Up to two values of L that are NOT evenly divisible by h.</li><li>Location of the counter relative to fixed input data: before, after, or in the\n\t\t\t\t\t\t\tmiddle.<ul><li>Counter before fixed input data: fixed input data string length (in bytes),\n\t\t\t\t\t\t\t\tfixed input data string value.</li><li>Counter after fixed input data: fixed input data string length (in bytes),\n\t\t\t\t\t\t\t\tfixed input data string value.</li><li>Counter in the middle of fixed input data: length of data before counter (in\n\t\t\t\t\t\t\t\tbytes), length of data after counter (in bytes), value of string input before\n\t\t\t\t\t\t\t\tcounter, value of string input after counter.</li></ul></li><li>The length (I_length) of the input values I.</li></ul>\n\t\t\t\t\t\tFor each supported combination of I_length, MAC, salt, PRF, counter location,\n\t\t\t\t\t\tvalue of r, and value of L, the evaluator shall generate 10 test vectors that include\n\t\t\t\t\t\tpseudorandom input values I, and pseudorandom salt values. If there is only one\n\t\t\t\t\t\tvalue of L that is evenly divisible by h, the evaluator shall generate 20 test vectors\n\t\t\t\t\t\tfor it. For each test vector, the evaluator shall supply this data to the TOE in order\n\t\t\t\t\t\tto produce the keying material output.<p></p>\n\t\t\t\t\t\tThe results from each test may either be obtained by the evaluator directly or by\n\t\t\t\t\t\tsupplying the inputs to the implementer and receiving the results in response. To\n\t\t\t\t\t\tdetermine correctness, the evaluator shall compare the resulting values to those\n\t\t\t\t\t\tobtained by submitting the same inputs to a known good implementation.<p></p><b>KDF-FB: Feedback Mode Tests:</b><p></p>\n\t\t\t\t\t\tThe evaluator shall determine the following characteristics of the key derivation\n\t\t\t\t\t\tfunction:<ul><li>One or more pseudorandom functions that are supported by the\n\t\t\t\t\t\t\timplementation (PRF).</li><li>The length (in bits) of the output of the PRF (h).</li><li>Minimum and maximum values for the length (in bits) of the derived keying\n\t\t\t\t\t\t\tmaterial (L). These values can be equal if only one value of L is supported.\n\t\t\t\t\t\t\tThese must be evenly divisible by h.</li><li>Up to two values of L that are NOT evenly divisible by h.</li><li>Whether or not zero-length IVs are supported.</li><li>Whether or not a counter is used, and if so:<ul><li>One or more of the values {8, 16, 24, 32} that equal the length of the\n\t\t\t\t\t\t\t\tbinary representation of the counter (r).</li><li>Location of the counter relative to fixed input data: before, after, or in the\n\t\t\t\t\t\t\t\tmiddle.<ul><li>Counter before fixed input data: fixed input data string length (in\n\t\t\t\t\t\t\t\t\tbytes), fixed input data string value.</li><li>Counter after fixed input data: fixed input data string length (in bytes),\n\t\t\t\t\t\t\t\t\tfixed input data string value.</li><li>Counter in the middle of fixed input data: length of data before counter\n\t\t\t\t\t\t\t\t\t(in bytes), length of data after counter (in bytes), value of string input\n\t\t\t\t\t\t\t\t\tbefore counter, value of string input after counter.</li></ul></li></ul></li><li>The length (I_length) of the input values L.</li></ul>\n\t\t\t\t\t\tFor each supported combination of I_length, MAC, salt, PRF, counter location (if\n\t\t\t\t\t\ta counter is used), value of r (if a counter is used), and value of L, the evaluator\n\t\t\t\t\t\tshall generate 10 test vectors that include pseudorandom input values I and\n\t\t\t\t\t\tpseudorandom salt values. If the KDF supports zero-length IVs, five of these test\n\t\t\t\t\t\tvectors will be accompanied by pseudorandom IVs and the other five will use zero-length IVs. If zero-length IVs are not supported, each test vector will be\n\t\t\t\t\t\taccompanied by an pseudorandom IV. If there is only one value of L that is evenly\n\t\t\t\t\t\tdivisible by h, the evaluator shall generate 20 test vectors for it.<p></p>\n\t\t\t\t\t\tFor each test vector, the evaluator shall supply this data to the TOE in order to\n\t\t\t\t\t\tproduce the keying material output. The results from each test may either be\n\t\t\t\t\t\tobtained by the evaluator directly or by supplying the inputs to the implementer and\n\t\t\t\t\t\treceiving the results in response. To determine correctness, the evaluator shall\n\t\t\t\t\t\tcompare the resulting values to those obtained by submitting the same inputs to a\n\t\t\t\t\t\tknown good implementation.<p></p><b>KDF-DPI: Double Pipeline Iteration Mode Tests:</b><p></p>\n\t\t\t\t\t\tThe evaluator shall determine the following characteristics of the key derivation\n\t\t\t\t\t\tfunction:<ul><li>One or more pseudorandom functions that are supported by the\n\t\t\t\t\t\t\timplementation (PRF).</li><li>The length (in bits) of the output of the PRF (h).</li><li>Minimum and maximum values for the length (in bits) of the derived keying\n\t\t\t\t\t\t\tmaterial (L). These values can be equal if only one value of L is supported.\n\t\t\t\t\t\t\tThese must be evenly divisible by h.</li><li>Up to two values of L that are NOT evenly divisible by h.</li><li>Whether or not a counter is used, and if so:<ul><li>One or more of the values {8, 16, 24, 32} that equal the length of the\n\t\t\t\t\t\t\t\tbinary representation of the counter (r).</li><li>Location of the counter relative to fixed input data: before, after, or in the\n\t\t\t\t\t\t\t\tmiddle.<ul><li>Counter before fixed input data: fixed input data string length (in\n\t\t\t\t\t\t\t\t\tbytes), fixed input data string value.</li><li>Counter after fixed input data: fixed input data string length (in bytes),\n\t\t\t\t\t\t\t\tfixed input data string value.</li><li>Counter in the middle of fixed input data: length of data before counter\n\t\t\t\t\t\t\t\t(in bytes), length of data after counter (in bytes), value of string input\n\t\t\t\t\t\t\t\tbefore counter, value of string input after counter.</li></ul></li></ul></li><li>The length (I_length) of the input values I.</li></ul>\n\t\t\t\t\t\tFor each supported combination of I_length, MAC, salt, PRF, counter location (if\n\t\t\t\t\t\ta counter is used), value of r (if a counter is used), and value of L, the evaluator\n\t\t\t\t\t\tshall generate 10 test vectors that include pseudorandom input values I, and\n\t\t\t\t\t\tpseudorandom salt values. If there is only one value of L that is evenly divisible by\n\t\t\t\t\t\th, the evaluator shall generate 20 test vectors for it.<p></p>\n\t\t\t\t\t\tFor each test vector, the evaluator shall supply this data to the TOE in order to\n\t\t\t\t\t\tproduce the keying material output. The results from each test may either be\n\t\t\t\t\t\tobtained by the evaluator directly or by supplying the inputs to the implementer and\n\t\t\t\t\t\treceiving the results in response. To determine correctness, the evaluator shall\n\t\t\t\t\t\tcompare the resulting values to those obtained by submitting the same inputs to a\n\t\t\t\t\t\tknown good implementation.<p></p><b>KDF-XOR: Intermediate Keys Method</b><p></p>\n\t\t\t\t\t\tIf the selected algorithm is a hash, then the testing of the hash primitive is the only\n\t\t\t\t\t\trequired Evaluation Activity. If the selected algorithm is XOR, then no separate\n\t\t\t\t\t\tprimitive testing is necessary.<p></p><b>KDF-ENC: Two Keys Method</b><p></p>\n\t\t\t\t\t\tThe evaluator should confirm that the combined length of the two keys should be\n\t\t\t\t\t\tat least as long as the key size of the selected methods. There are no other tests other\n\t\t\t\t\t\tthan for the methods selected for this row from FCD_COP.1/SK.<p></p><b>KDF-HASH: Shared Secret, Salt, Output Length, Fixed Information Method</b><p></p>\n\t\t\t\t\t\tFor each supported selection of PRF, length of shared secret (Z) [selection: 128,\n\t\t\t\t\t\t256] bits, length of salt (S) [selection: length of input block of PRF, one-half length\n\t\t\t\t\t\tof input block of PRF, 0] bits, output length (L) [selection: 128, 256] bits, and length\n\t\t\t\t\t\tof fixed information (FixedInfo) [selection: length of input block of PRF, one-half length of input block of PRF, 0] bits, the evaluator shall generate 10 test vectors\n\t\t\t\t\t\tthat include pseudorandom input values for Z, salt values (for non-zero lengths,\n\t\t\t\t\t\totherwise, omit) and fixed information (for non-zero lengths, otherwise, omit).<p></p>\n\t\t\t\t\t\tFor each test vector, the evaluator shall supply this data to the TOE in order to\n\t\t\t\t\t\tproduce the keying material output. The results from each test may either be\n\t\t\t\t\t\tobtained by the evaluator directly or by supplying the inputs to the implementer and\n\t\t\t\t\t\treceiving the results in response. To determine correctness, the evaluator shall\n\t\t\t\t\t\tcompare the resulting values to those obtained by submitting the same inputs to a\n\t\t\t\t\t\tknown good implementation.<p></p><b>KDF-MAC: Shared Secret, Salt, IV, Output Length, Fixed Information Method</b><p></p>\n\t\t\t\t\t\tFor each supported selection of PRF, length of shared secret (Z), length of salt,\n\t\t\t\t\t\tlength of initialization vector (IV), output length (L), and length of fixed\n\t\t\t\t\t\tinformation (FixedInfo), the evaluator shall generate 10 test vectors that include\n\t\t\t\t\t\tpseudorandom input values for Z, salt values (for non-zero lengths, otherwise,\n\t\t\t\t\t\tomit), IV (for non-zero lengths, otherwise, use a vector of length equal to length of\n\t\t\t\t\t\tinput block of PRF and fill with zeros), and fixed information (for non-zero lengths,\n\t\t\t\t\t\totherwise, omit).<p></p>\n\t\t\t\t\t\tFor each test vector, the evaluator shall supply this data to the TOE in order to\n\t\t\t\t\t\tproduce the keying material output. The results from each test may either be\n\t\t\t\t\t\tobtained by the evaluator directly or by supplying the inputs to the implementer and\n\t\t\t\t\t\treceiving the results in response. To determine correctness, the evaluator shall\n\t\t\t\t\t\tcompare the resulting values to those obtained by submitting the same inputs to a\n\t\t\t\t\t\tknown good implementation.<p></p>",
                    "testList": [],
                    "level": "element",
                    "platformMap": {}
                }
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
    "2cc212e3-ab29-476a-bc5f-808538963720": {
        // title: "Class: Security Management (FMT)"
        "5464d84c-1a32-4482-86b3-155817c15a01": {
            title: "Specification of Management Functions",
            cc_id: "FMT_SMF.1",
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
            open: false,
            elements: {
                "73169d52-fd56-41da-86da-38f75b5b427f": {
                    "elementXMLID": "fel-smf-ext",
                    "title": [
                        {
                            "description": "The TSF shall be capable of performing the following management functions: "
                        }
                    ],
                    "selectables": {
                        "a3a43b81-7bee-41fa-8d04-af730d1096f1": {
                            "id": "s-vpn-per-app",
                            "description": "on a per-app basis",
                            "assignment": false
                        },
                        "621a6d31-f41a-48a2-b613-6fe1aa43b5d1": {
                            "id": "s-vpn-per-appgroup",
                            "description": "on a per-group of applications processes basis",
                            "assignment": false
                        },
                        "26c29863-3224-4e86-bb2c-f77d10be799d": {
                            "id": "s-vpn-exclusive",
                            "description": "no other method",
                            "assignment": false,
                            "exclusive": true
                        },
                        "11620fbd-38ac-49c1-b973-4e724cfbf7d3": {
                            "id": "a-mf-radios",
                            "description": "list of all radios",
                            "assignment": true
                        },
                        "1f49d453-1a2b-4382-8837-4c7663879efa": {
                            "id": "a-audiovisual-devs",
                            "description": "list of audio or visual collection devices",
                            "assignment": true
                        },
                        "0a5eee02-1119-492d-91b6-39655102068a": {
                            "id": "mf-appInstallRules-restrict",
                            "description": "restricting the sources of applications",
                            "assignment": false
                        },
                        "9af13552-ef18-4d1f-96ba-00574eceed4d": {
                            "id": "",
                            "description": "application characteristics",
                            "assignment": true
                        },
                        "b738e1c7-58b5-4b7b-8a5a-7b324f9b5abe": {
                            "id": "mf-appInstallRules-deny",
                            "description": "denying installation of applications",
                            "assignment": false
                        },
                        "37e6fa2a-90d3-4bd4-a24c-a9801d9f45ff": {
                            "id": "",
                            "description": "no other keys or secrets",
                            "assignment": false,
                            "exclusive": true
                        },
                        "72875dc6-67f1-4b4b-96b3-9e090f841f9b": {
                            "id": "",
                            "description": "list of other categories of keys or secrets",
                            "assignment": true
                        }
                    },
                    "selectableGroups": {
                        "group": {
                            "onlyOne": false,
                            "groups": [
                                "a3a43b81-7bee-41fa-8d04-af730d1096f1",
                                "621a6d31-f41a-48a2-b613-6fe1aa43b5d1",
                                "26c29863-3224-4e86-bb2c-f77d10be799d"
                            ]
                        },
                        "mf-appInstallRules-specify": {
                            "exclusive": false,
                            "notSelectable": false,
                            "description": [
                                {
                                    "text": "specifying a set of allowed applications based on"
                                },
                                {
                                    "groups": [
                                        "9af13552-ef18-4d1f-96ba-00574eceed4d"
                                    ]
                                },
                                {
                                    "text": "(an <snip>application allowlist</snip>)"
                                }
                            ]
                        },
                        "group2": {
                            "onlyOne": false,
                            "groups": [
                                "0a5eee02-1119-492d-91b6-39655102068a",
                                "mf-appInstallRules-specify",
                                "b738e1c7-58b5-4b7b-8a5a-7b324f9b5abe"
                            ]
                        },
                        "group3": {
                            "onlyOne": false,
                            "groups": [
                                "37e6fa2a-90d3-4bd4-a24c-a9801d9f45ff",
                                "72875dc6-67f1-4b4b-96b3-9e090f841f9b"
                            ]
                        }
                    },
                    "note": "<p>&lt;xref to=\"fmt_smf\"&gt;&lt;/xref&gt; compares the management functions required by this Protection Profile.</p><p><br></p><p>The first column lists the management functions identified in the PP.</p><p><br></p><p>In the following columns:</p><ul><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>‘M’ means Mandatory</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>‘O’ means Optional/Objective</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>'-' means that no value (M or O) can be assigned</li></ul><p><br></p><p><br></p><p>The third column (\"Impl.\") indicates whether the function is to be implemented. The ST author should select which Optional functions are implemented.</p><p><br></p><p>The fourth column (\"User Only\") indicates functions that are to be restricted to the user (i.e. not available to the administrator).</p><p><br></p><p>The fifth column (\"Admin\") indicates functions that are available to the administrator. The functions restricted to the user (column 4) cannot also be available to the administrator. Functions available to the administrator can still be available to the user, as long as the function is not restricted to the administrator (column 6). Thus, if the TOE must offer these functions to the administrator to perform, the fifth column must be selected.</p><p><br></p><p>The sixth column (FMT_MOF_EXT.1.2) indicates whether the function is to be restricted to the administrator when the device is enrolled and the administrator applies the indicated policy. If the function is restricted to the administrator the function is not available to the user. This does not prevent the user from modifying a setting to make the function stricter, but the user cannot undo the configuration enforced by the administrator.</p><p><br></p><p>The ST author may use a table in the ST, listing only those functions that are implemented. For functions that are mandatory, any sub-functions not in a selection are also mandatory and any assignments must contain at least one assigned value. For functions that are optional and contain an assignment or selection, at least one value must be assigned/selected to be included in the ST. For non-selectable sub-functions in an optional function, all sub-functions must be implemented in order for the function to be included. For functions with a \"per-app basis\" sub function and an assignment, the ST author must indicate which assigned features are manageable on a per-app basis and which are not by iterating the row.</p>",
                    "isManagementFunction": true,
                    "managementFunctions": {
                        "id": "fmt_smf",
                        "tableName": "Management Functions",
                        "statusMarkers": "<p><span>M - Mandatory</span></p><p><span>O - Optional/Objective</span></p>",
                        "rows": [
                            {
                                "rowNum": "",
                                "id": "mf-pwd",
                                "textArray": [
                                    {
                                        "description": "<p>configure password policy:</p><ul><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Minimum password length</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Minimum password complexity</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Maximum password lifetime</li></ul>"
                                    }
                                ],
                                "I": "M",
                                "U": "-",
                                "A": "M",
                                "AO": "M",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: "The evaluator shall verify the TSS defines the allowable policy options: the range " +
                                        "of values for both password length and lifetime, and a description of complexity to " +
                                        "include character set and complexity policies (e.g., configuration and enforcement " +
                                        "of number of uppercase, lowercase, and special characters per password).",
                                    guidance: "",
                                    testIntroduction:
                                        `The evaluator shall exercise the TSF configuration as the administrator 
                                         and perform positive and negative tests, with at least two values set 
                                         for each variable setting, for each of the following: <br/>
                                         <ul>
                                            <li>Minimum password length</li>
                                            <li>Minimum password complexity</li>
                                            <li>Maximum password lifetime</li>
                                         </ul>`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": []
                            },
                            {
                                "rowNum": "",
                                "id": "mf-screenlock",
                                "textArray": [
                                    {
                                        "description": "<p>configure session locking policy:</p><ul><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Screen-lock enabled/disabled</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Screen lock timeout</li></ul>"
                                    }
                                ],
                                "I": "M",
                                "U": "-",
                                "A": "M",
                                "AO": "M",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: `The evaluator shall verify the TSS defines the range of values for both timeout 
                                      period and number of authentication failures for all supported authentication mechanisms.`,
                                    guidance: "",
                                    testIntroduction:
                                        `The evaluator shall exercise the TSF configuration as the administrator. 
                                         The evaluator shall perform positive and negative tests, with at least 
                                         two values set for each variable setting, for each of the following: <br/>
                                         <ul>
                                            <li>Screen-lock enabled/disabled</li>
                                            <li>Screen lock timeout</li>
                                            <li>Number of authentication failures (may be combined with test for\tFIA_AFL_EXT.1)</li>
                                         </ul>`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": []
                            },
                            {
                                "rowNum": "",
                                "id": "mf-vpn",
                                "textArray": [
                                    {
                                        "description": "<p>enable/disable the&nbsp;<a href=\"https://commoncriteria.github.io/mobile-device/release-3.3/mobile-device-release.html#abbr_VPN\" rel=\"noopener noreferrer\" target=\"_blank\">VPN</a>&nbsp;protection:</p><ul><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Across device</li></ul>"
                                    },
                                    {
                                        "selections": "group"
                                    }
                                ],
                                "I": "M",
                                "U": "O",
                                "A": "O",
                                "AO": "O",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: "",
                                    guidance: "",
                                    testIntroduction: "The evaluator shall perform the following tests:",
                                    testClosing: "",
                                    testList: [{
                                        description: "",
                                        tests: [
                                            {
                                                dependencies: [],
                                                objective: `The evaluator shall exercise the TSF configuration to enable 
                                                            the VPN protection. These configuration actions must be used 
                                                            for the testing of the FDP_IFC_EXT.1.1 requirement.`
                                            },
                                            {
                                                dependencies: [],
                                                objective: `[conditional] If "<xref to="s-vpn-per-app"/>" is selected, the evaluator shall 
                                                            create two applications and enable one to use the VPN and the other to not 
                                                            use the VPN. The evaluator shall exercise each application (attempting to 
                                                            access network resources; for example, by browsing different websites) 
                                                            individually while capturing packets from the TOE. The evaluator shall 
                                                            verify from the packet capture that the traffic from the VPN-enabled 
                                                            application is encapsulated in IPsec and that the traffic from the 
                                                            VPN-disabled application is not encapsulated in IPsec.`
                                            },
                                            {
                                                dependencies: [],
                                                objective: `[conditional] If "<xref to="s-vpn-per-appgroup"/>" is selected, the 
                                                            evaluator shall create two applications and the applications shall be placed 
                                                            into different groups. Enable one application group to use the VPN and the 
                                                            other to not use the VPN. The evaluator shall exercise each application 
                                                            (attempting to access network resources; for example, by browsing different 
                                                            websites) individually while capturing packets from the TOE. The evaluator 
                                                            shall verify from the packet capture that the traffic from the application 
                                                            in the VPN-enabled group is encapsulated in IPsec and that the traffic from 
                                                            the application in the VPN-disabled group is not encapsulated in IPsec.`
                                            }
                                        ]
                                    }],
                                },
                                "note": [
                                    `<also ref-id="mf-audioVisual"/><also ref-id="mf-location"/>Functions <_/> must be 
                                    implemented on a device-wide basis but may also be implemented on a per-app basis or 
                                    on a per-group of applications basis in which the configuration includes the list of 
                                    applications or groups of applications to which the enable/disable applies.`,
                                    `Function <_/> addresses enabling and disabling the IPsec VPN only. The configuration 
                                    of the VPN Client itself(with information such as VPN Gateway, certificates, and algorithms) 
                                    is addressed by the <xref to="mod-vpnclient"/>. The administrator options should only 
                                    be listed if the administrator can remotely enable/disable the VPN connection.
                                    <p> 
                                    Function <xref to="mf-vpn"/> optionally allows the VPN to be configured per-app or 
                                    per-groups of apps. If this configuration is selected, it does not void FDP_IFC_EXT.1. 
                                    Instead FDP_IFC_EXT.1 is applied to the application or group of applications the VPN 
                                    is applied to. In other words, all traffic destined for the VPN-enabled application or 
                                    group of applications, must travel through the VPN, but traffic not destined for that 
                                    application or group of applications can travel outside the VPN. When the VPN is 
                                    configured across the device FDP_IFC_EXT.1 applies to all traffic and the VPN must not 
                                    split tunnel.
                                    </p>`
                                ]
                            },
                            {
                                "rowNum": "",
                                "id": "mf-radios",
                                "textArray": [
                                    {
                                        "text": "enable/disable"
                                    },
                                    {
                                        "assignment": "11620fbd-38ac-49c1-b973-4e724cfbf7d3"
                                    }
                                ],
                                "I": "M",
                                "U": "O",
                                "A": "O",
                                "AO": "O",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: `The evaluator shall
                                          verify that the TSS includes a description of each radio and an indication of if
                                          the radio can be enabled/disabled along with what role can do so. In addition the
                                          evaluator shall verify that the frequency ranges at which each radio operates is
                                          included in the TSS. The evaluator shall verify that the TSS includes at what point 
                                          in the boot sequence the radios are powered on and indicates if the radios are used 
                                          as part of the initialization of the device.`,
                                    guidance: `The evaluator shall confirm that the AGD guidance describes how to perform 
                                               the enable/disable function for each radio.<br/><br/>`,
                                    testIntroduction: `The evaluator shall ensure that minimal signal leakage enters the RF shielded 
                                                       enclosure (i.e. Faraday bag, Faraday box, RF shielded room) by performing the 
                                                       following steps:<br/><br/> Step 1: Place the antenna of the spectrum 
                                                       analyzer inside the RF shielded enclosure.<br/><br/> Step 2: Enable "Max 
                                                       Hold" on the spectrum analyzer and perform a spectrum sweep of the frequency range 
                                                       between 300 MHz – 6000 MHz, in I kHz steps (this range should encompass 802.11, 
                                                       802.15, GSM, UMTS, and LTE). This range will not address NFC 13.56.MHz, another 
                                                       test should be set up with similar constraints to address NFC.<br/><br/> 
                                                       If power above -90 dBm is observed, the Faraday box has too great of signal 
                                                       leakage and shall not be used to complete the test for 
                                                       Function <xref to="mf-radios"/>. 
                                                        
                                                       The evaluator shall exercise the TSF configuration as the administrator and, 
                                                       if not restricted to the administrator, the user, to enable and disable the 
                                                       state of each radio (e.g. Wi-Fi, cellular, NFC, Bluetooth). Additionally, 
                                                       the evaluator shall repeat the steps below, booting into any auxiliary boot mode 
                                                       supported by the device. For each radio, the evaluator shall:<br/><br/> 
                                                       Step 1: Place the antenna of the spectrum analyzer inside the RF shielded 
                                                       enclosure. Configure the spectrum analyzer to sweep desired frequency range for 
                                                       the radio to be tested (based on range provided in the TSS)). The ambient noise 
                                                       floor shall be set to -110 dBm. Place the TOE into the RF shielded enclosure to 
                                                       isolate them from all other RF traffic. <br/><br/> Step 2: The evaluator 
                                                       shall create a baseline of the expected behavior of RF signals. The evaluator 
                                                       shall power on the device, ensure the radio in question is enabled, power off 
                                                       the device, enable "Max Hold" on the spectrum analyzer and power on the device. 
                                                       The evaluator shall wait 2 minutes at each Authentication Factor interface prior 
                                                       to entering the necessary password to complete the boot process, waiting 5 
                                                       minutes after the device is fully booted. The evaluator shall observe that RF 
                                                       spikes are present at the expected uplink channel frequency. The evaluator shall 
                                                       clear the "Max Hold" on the spectrum analyzer. <br/><br/> Step 3: The 
                                                       evaluator shall verify the absence of RF activity for the uplink channel when 
                                                       the radio in question is disabled. The evaluator shall complete the following 
                                                       test five times. The evaluator shall power on the device, ensure the radio in 
                                                       question is disabled, power off the device, enable "Max Hold" on the spectrum 
                                                       analyzer and power on the device. The evaluator shall wait 2 minutes at each 
                                                       Authentication Factor interface prior to entering the necessary password to 
                                                       complete the boot process, waiting 5 minutes after the device is fully booted. 
                                                       The evaluator shall clear the "Max Hold" on the spectrum analyzer. If the radios 
                                                       are used for device initialization, then a spike of RF activity for the uplink channel 
                                                       can be observed initially at device boot. However, if a spike of 
                                                       RF activity for the uplink channel of the specific radio frequency band is 
                                                       observed after the device is fully booted or at an Authentication Factor interface 
                                                       it is deemed that the radio is enabled.`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": [
                                    `The assignment in function <_/> 
                                      consists of all radios present on the TSF, such as Wi-Fi, cellular, NFC, 
                                      Bluetooth BR/EDR, and Bluetooth LE, which can be enabled and disabled. 
                                    In the future, 
                                      if both Bluetooth BR/EDR and Bluetooth LE are supported, they will be required to be 
                                      enabled and disabled separately. Disablement of the cellular radio does not imply that 
                                      the radio may not be enabled in order to place emergency phone calls; however, it is 
                                      not expected that a device in "airplane mode", where all radios are disabled, will 
                                      automatically (without authorization) turn on the cellular radio to place emergency 
                                      calls.`
                                ]
                            },
                            {
                                "rowNum": "",
                                "id": "mf-audioVisual",
                                "textArray": [
                                    {
                                        "text": "enable/disable"
                                    },
                                    {
                                        "assignment": "1f49d453-1a2b-4382-8837-4c7663879efa"
                                    },
                                    {
                                        "description": "<ul><li data-list=\"true\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Across device</li></ul>"
                                    },
                                    {
                                        "selections": "group"
                                    }
                                ],
                                "I": "M",
                                "U": "O",
                                "A": "O",
                                "AO": "O",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: `The evaluator shall verify that the TSS includes a description of each collection 
                                          device and an indication of if it can be enabled/disabled along with what role 
                                          can do so. The evaluator shall confirm that the AGD guidance describes how to 
                                          perform the enable/disable function.`,
                                    guidance: "",
                                    testIntroduction: "The evaluator shall perform the following tests:",
                                    testClosing: "",
                                    testList: [{
                                        description: "",
                                        tests: [
                                            {
                                                dependencies: [],
                                                objective: `The evaluator shall exercise the TSF configuration as the 
                                                            administrator and, if not restricted to the administrator, the user, to 
                                                            enable and disable the state of each audio or visual collection devices 
                                                            (e.g. camera, microphone) listed by the ST author. For each collection 
                                                            device, the evaluator shall disable the device and then attempt to use its 
                                                            functionality. The evaluator shall reboot the TOE and verify that disabled 
                                                            collection devices may not be used during or early in the boot process. 
                                                            Additionally, the evaluator shall boot the device into each available 
                                                            auxiliary boot mode and verify that the collection device cannot be used. `
                                            },
                                            {
                                                dependencies: [],
                                                objective: `[conditional] If "<xref to="s-audiovisual-per-app"/>" is selected, the evaluator shall 
                                                            create two applications and enable one to use access the A/V device and the 
                                                            other to not access the A/V device. The evaluator shall exercise each 
                                                            application attempting to access the A/V device individually. The evaluator 
                                                            shall verify that the enabled application is able to access the A/V device 
                                                            and the disabled application is not able to access the A/V device.`
                                            },
                                            {
                                                dependencies: [],
                                                objective: `[conditional] If "<xref to="s-audiovisual-per-appgroup"/>" is selected, the 
                                                            evaluator shall create two applications and the applications shall be placed 
                                                            into different groups. Enable one group to access the A/V device and the 
                                                            other to not access the A/V device. The evaluator shall exercise each 
                                                            application attempting to access the A/V device individually. The evaluator 
                                                            shall verify that the application in the enabled group is able to access the 
                                                            A/V device and the application in the disabled group is not able to access 
                                                            the A/V device.`
                                            }
                                        ]
                                    }],
                                },
                                "note": [
                                    `The assignment in function <_/> 
                                      consists of at least one audio or visual device, such as camera and microphone, 
                                      which can be enabled and disabled by either the user or administrator. Disablement of 
                                      the microphone does not imply that the microphone may not be enabled in order to place 
                                      emergency phone calls. If certain devices are able to be restricted to the enterprise 
                                      (either device-wide, per-app or per-group of applications) and others are able to be 
                                      restricted to users, then this function should be iterated in the table with the 
                                      appropriate table entries. 
                                    <p> 
                                    Regarding functions <xref to="mf-radios"/> and <xref to="mf-audioVisual"/>, 
                                    disablement of a particular 
                                      radio or audio/visual device must be effective as soon as the TOE has power. 
                                      Disablement must also apply when the TOE is booted into auxiliary boot modes, for 
                                      example, associated with updates or backup. If the TOE supports states in which 
                                      security management policy is inaccessible, for example, due to data-at-rest 
                                      protection, it is acceptable to meet this requirement by ensuring that these devices 
                                      are disabled by default while in these states. That these devices are disabled during 
                                      auxiliary boot modes does not imply that the device (particularly the cellular radio) 
                                      may not be enabled in order to perform emergency phone calls. 
                                    </p>`
                                ]
                            },
                            {
                                "rowNum": "",
                                "id": "mf-lockState",
                                "textArray": [
                                    {
                                        "text": "transition to the locked state"
                                    }
                                ],
                                "I": "M",
                                "U": "-",
                                "A": "M",
                                "AO": "-",
                                "evaluationActivity": {
                                    introduction: `The evaluator shall use the test environment to instruct the TSF, both as a 
                                                   user and as the administrator, to command the device to transition to a locked 
                                                   state, and verify that the device transitions to the locked state upon 
                                                   command.`,
                                    tss: "",
                                    guidance: "",
                                    testIntroduction: `The evaluator shall use the test environment to instruct the TSF, 
                                                       both as a user and as the administrator, to command the device to 
                                                       perform a wipe of protected data. The evaluator must ensure that 
                                                       this management setup is used when conducting the Evaluation Activities 
                                                       in FCS_CKM_EXT.5.`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": [
                                    `Wipe  of the TSF (function <xref to="mf-wipe"/>) is performed according to FCS_CKM_EXT.5. 
                                     Protected data is all non-TSF data, including all user or enterprise data. Some or all 
                                     of this data may be considered sensitive data as well.`
                                ]
                            },
                            {
                                "rowNum": "",
                                "id": "mf-wipe",
                                "textArray": [
                                    {
                                        "description": "<p><a href=\"https://commoncriteria.github.io/mobile-device/release-3.3/mobile-device-release.html#abbr_TSF\" rel=\"noopener noreferrer\" target=\"_blank\">TSF</a>&nbsp;wipe of protected data</p>"
                                    }
                                ],
                                "I": "M",
                                "U": "-",
                                "A": "M",
                                "AO": "-",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: "",
                                    guidance: "",
                                    testIntroduction: `The evaluator shall use the test environment to instruct the TSF, 
                                                       both as a user and as the administrator, to command the device to 
                                                       perform a wipe of protected data. The evaluator must ensure that 
                                                       this management setup is used when conducting the Evaluation Activities 
                                                       in FCS_CKM_EXT.5.`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": [
                                    `Wipe  of the TSF (function <xref to="mf-wipe"/>) is performed according to FCS_CKM_EXT.5. 
                                     Protected data is all non-TSF data, including all user or enterprise data. Some or all 
                                     of this data may be considered sensitive data as well.`
                                ]
                            },
                            {
                                "rowNum": "",
                                "id": "mf-appInstallRules",
                                "textArray": [
                                    {
                                        "text": "configure application installation policy by"
                                    },
                                    {
                                        "selections": "group2"
                                    }
                                ],
                                "I": "M",
                                "U": "-",
                                "A": "M",
                                "AO": "M",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: `The evaluator shall verify the TSS describes the allowable application installation policy 
                                          options based on the selection included in the ST. 
                                          If the <xref to="mf-appInstallRules-specify"/> is selected, 
                                          the evaluator shall verify that the TSS includes a description of each 
                                          application characteristic upon which the allowlist may be based.`,
                                    guidance: "",
                                    testIntroduction: `The evaluator shall exercise the TSF configuration as the administrator to 
                                                       restrict particular applications, sources of applications, or application 
                                                       installation according to the AGD guidance. The evaluator shall attempt to 
                                                       install unauthorized applications and ensure that this is not possible. The 
                                                       evaluator shall, in conjunction, perform the following specific tests: `,
                                    testClosing: "",
                                    testList: [
                                        {
                                            description: "",
                                            tests: [
                                                {
                                                    dependencies: [],
                                                    objective: `[conditional] The evaluator shall attempt to connect to an unauthorized repository in order to install applications.`
                                                },
                                                {
                                                    dependencies: [],
                                                    objective: `[conditional] The evaluator shall attempt to install two applications 
                                                                (one allowlisted, and one not) from a known allowed repository and verify 
                                                                that the application not on the allowlist is rejected. The evaluator shall 
                                                                also attempt to side-load executables or installation packages via USB 
                                                                connections to determine that the white list is still adhered to`
                                                }
                                            ]
                                        }
                                    ],
                                },
                                "note": [
                                    `The selection in function <xref to="mf-appInstallRules"/> allows the ST author to 
                                     select which mechanisms are available to the administrator through the MDM Agent to 
                                     restrict the applications which the user may install. The ST author must state if 
                                     application allowlist is applied device-wide or if it can be specified to apply to 
                                     either the Enterprise or Personal applications. <ul> 
                                     <li>If the administrator can restrict the sources from which applications can be 
                                     installed, the ST author selects "<xref to="mf-appInstallRules-restrict"/>". </li> 
                                     <li>If the administrator can specify a allowlist of allowed applications, the ST 
                                     author selects "<xref to="mf-appInstallRules-specify"/>". The ST author should list any application characteristics 
                                     (e.g. name, version, or developer) based on which the allowlist can be 
                                     formed.</li> 
                                     <li>If the administrator can prevent the user from installing additional 
                                     applications, the ST author selects "<xref to="mf-appInstallRules-deny"/>". </li> 
                                     </ul>`
                                ]
                            },
                            {
                                "rowNum": "",
                                "id": "mf-keyStorage",
                                "textArray": [
                                    {
                                        "text": "import keys or secrets into the secure key storage"
                                    }
                                ],
                                "I": "M",
                                "U": "O",
                                "A": "O",
                                "AO": "-",
                                "evaluationActivity": {
                                    introduction: `<also ref-id="mf-keyWipe"/>`,
                                    tss: `The evaluator shall verify that the TSS describes each category of keys or secrets 
                                          that can be imported into the TSF’s secure key storage.`,
                                    guidance: "",
                                    testIntroduction: `The test of these functions is performed in association with FCS_STG_EXT.1.`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": []
                            },
                            {
                                "rowNum": "",
                                "id": "mf-keyWipe",
                                "textArray": [
                                    {
                                        "text": "destroy imported keys or secrets and"
                                    },
                                    {
                                        "selections": "group3"
                                    },
                                    {
                                        "text": "in the secure key storage"
                                    }
                                ],
                                "I": "M",
                                "U": "O",
                                "A": "O",
                                "AO": "-",
                                "evaluationActivity": {
                                    introduction: "",
                                    tss: "",
                                    guidance: `The evaluator shall 
                                               review the AGD guidance to determine that it describes the steps needed to import, 
                                               modify, or remove certificates in the Trust Anchor database, and that the users 
                                               that have authority to import those certificates (e.g., only administrator, or 
                                               both administrators and users) are identified.`,
                                    testIntroduction: `The evaluator shall import certificates according to the AGD guidance as the 
                                                       user or as the administrator, as determined by the administrative guidance. 
                                                       The evaluator shall verify that no errors occur during import. The evaluator 
                                                       should perform an action requiring use of the X.509v3 certificate to provide 
                                                       assurance that installation was completed properly.`,
                                    testClosing: "",
                                    testList: [],
                                },
                                "note": []
                            }
                        ],
                        "columns": [
                            {
                                "headerName": "#",
                                "field": "rowNum",
                                "editable": false,
                                "resizable": true,
                                "type": "Index",
                                "flex": 0.5
                            },
                            {
                                "headerName": "ID",
                                "field": "id",
                                "editable": true,
                                "resizable": true,
                                "type": "Editor",
                                "flex": 1
                            },
                            {
                                "headerName": "Management Function",
                                "field": "textArray",
                                "editable": false,
                                "resizable": true,
                                "type": "Button",
                                "flex": 2
                            },
                            {
                                "headerName": "Impl.",
                                "field": "I",
                                "editable": true,
                                "resizable": true,
                                "type": "Editor",
                                "flex": 0.5
                            },
                            {
                                "headerName": "User Only",
                                "field": "U",
                                "editable": true,
                                "resizable": true,
                                "type": "Editor",
                                "flex": 0.5
                            },
                            {
                                "headerName": "Admin",
                                "field": "A",
                                "editable": true,
                                "resizable": true,
                                "type": "Editor",
                                "flex": 0.5
                            },
                            {
                                "headerName": "Admin Only",
                                "field": "AO",
                                "editable": true,
                                "resizable": true,
                                "type": "Editor",
                                "flex": 0.5
                            }
                        ],
                    }
                }
            }
        }
    }
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
                    invisible: component && component.invisible ? component.invisible : false,
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
            if (isTitle && element.hasOwnProperty("tabularize")) {
                elementItems.tabularize = {}

                // Update definition string
                Object.entries(element.tabularize).forEach(([key, value]) => {
                    const { definition } = value
                    value.definitionString = getTabularizeDefinitionString(definition);
                    elementItems.tabularize[key] = value
                });
            }
            if (isManagementFunction && textArray) {
                elementItems.textArray = textArray
            } else if (isManagementFunction && element.hasOwnProperty("managementFunctions") && element.managementFunctions.hasOwnProperty("rows")
                && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].textArray) {
                elementItems.textArray = element.managementFunctions.rows[rowIndex].textArray
            } else {
                elementItems.textArray = []
            }
            if (isManagementFunction && managementNote) {
                elementItems.note = managementNote
            } else if (isManagementFunction && element.hasOwnProperty("managementFunctions") && element.managementFunctions.hasOwnProperty("rows")
                && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].note) {
                elementItems.note = element.managementFunctions.rows[rowIndex].note
            } else {
                elementItems.note = []
            }
            if (isManagementFunction && managementEA) {
                elementItems.evaluationActivity = managementEA
            } else if (isManagementFunction && element.hasOwnProperty("managementFunctions") && element.managementFunctions.hasOwnProperty("rows")
                && element.managementFunctions.rows[rowIndex] && element.managementFunctions.rows[rowIndex].evaluationActivity) {
                elementItems.evaluationActivity = element.managementFunctions.rows[rowIndex].evaluationActivity
            } else {
                elementItems.evaluationActivity = []
            }
            if (isTabularize && tabularizeUUID && tabularizeUUID !== "" && element.hasOwnProperty("tabularize") && element.tabularize.hasOwnProperty(tabularizeUUID)) {
                let tabularize = JSON.parse(JSON.stringify(element.tabularize[tabularizeUUID]))
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
    GET_SFR_ELEMENT_VALUES_FOR_COMPLEX_SELECTABLE,
    GET_SFR_ELEMENT_VALUES_FOR_TITLE,
    GET_SFR_ELEMENT_VALUES_FOR_MANAGEMENT_FUNCTION,
    GET_SFR_ELEMENT_VALUES_FOR_TABULARIZE_TABLE,
    GET_ALL_SFR_OPTIONS_MAP,
    sortObjectivesFromSfrsHelper,
    sortSfrSectionsHelper,
    DELETE_ALL_SFR_SECTION_ELEMENTS,
    RESET_SFR_SECTION_STATE,
    UPDATE_SFR_COMPONENT_TEST_DEPENDENCIES,
} = sfrSectionSlice.actions

export default sfrSectionSlice.reducer