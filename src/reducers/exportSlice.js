// Imports
import { current, createSlice } from "@reduxjs/toolkit";
import validator from 'validator';

const initialState = {
	overallObject: {
		"?1": 'xml-stylesheet type="text/xsl" href="..\transformspp2html.xsl"',
		"?2": 'xml-model href="https://raw.githubusercontent.com/commoncriteria/transforms/master/schemas/CCProtectionProfile.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"',
		PP: {
			PPReference: {
				ReferenceTable: {
					PPTitle: "Protection Profile for QQQQ",
					PPVersion: "#.#",
					PPAuthor: "National Information Assurance Partnership",
					PPPubDate: "YYYY-MM-DD",
					Keywords: "QQQQ; QQQQ",
				},
			},
			RevisionHistory: {
				entry: {
					"!": " Repeatable ",
					version: "v #.#",
					date: "YYYY-MM-DD",
					subject: {
						"#1": "QQQQ\n        ",
						"h:br": {},
						"#2": "QQQQ ",
						"!": " Repeatable ",
					},
				},
			},
			"include-pkg": {},
			modules: {},
			"pp-preferences": {},
			"sec:Introduction": {
				"#": [
					{
						"!": " 1.1 Overview ",
					},
					{
						"sec:Overview": "QQQQ\n    ",
					},
					{
						"!": [
							" 1.2 Terms ",
							" 1.2.1 Common Criteria Terms ",
							" 1.2.2 Technical Terms ",
						],
					},
					{
						"tech-terms": {
							term: {
								"@full": "QQQQ",
								"@abbr": "QQQQ",
								"#": "\n            QQQQ\n        ",
							},
						},
					},
					{
						"!": " 1.3 Compliant Targets of Evaluation ",
					},
					{
						section: {
							"@title": "Compliant Targets of Evaluation",
							"@id": "TOEdescription",
							"#": "\n\n    QQQQ\n\n    ",
							"!": " 1.3.1 TOE Boundary ",
							"sec:TOE_Boundary": {
								"#": "\n\n    QQQQ \n    ",
								figure: {
									"@entity": "images/QQQQ.png",
									"@title": "QQQQ",
									"@id": "QQQQ",
								},
								"!": " Repeatable ",
							},
						},
					},
					{
						"!": [" 1.3 Compliant Targets of Evaluation ", " 1.4 Use Cases "],
					},
					{
						"sec:Use_Cases": {
							"#": "\n    QQQQ\n    ",
							usecases: {
								usecase: {
									"@title": "QQQQ",
									"@id": "QQQQ",
									description: "QQQQ\n        ",
								},
							},
						},
					},
					{
						"!": " 1.5 Supported Platforms ",
					},
					{
						section: {
							"@title": "Platforms with Specific EAs",
							"@id": "sec-platforms",
							choice: {
								"@prefix": "Platforms:",
								"#": "\n        QQQQ",
								"h:p": {},
								selectables: {
									"@linebreak": "yes",
									selectable: {
										"@id": "QQQQ",
										"h:b": {
											snip: "QQQQ",
										},
										"#": ": ",
										"h:i": "QQQQ",
									},
									"!": " Repeatable ",
								},
							},
						},
					},
				],
			},
			"sec:Conformance_Claims": {},
			"!1": " 3.0 Security Problem Definition",
			"sec:Security_Problem_Definition": {
				"#": "\n    The security problem is described in terms\n    of the threats that the TOE is expected to address, assumptions about the\n    operational environment, and any organizational security policies that the TOE\n    is expected to enforce.\n    \n",
				"!1": " 3.1 Threats ",
				"sec:Threats": {
					threats: {
						threat: {
							"@name": "T.QQQQ",
							"!": " Repeatable ",
							description: "QQQQ",
							"objective-refer": {
								"@ref": "O.QQQQ",
								"!": " Repeatable ",
								rationale: "QQQQ",
							},
						},
					},
				},
				"!2": " 3.2 Assumptions ",
				"sec:Assumptions": {
					assumptions: {
						assumption: {
							"@name": "A.QQQQ",
							"!": " Repeatable ",
							description: "QQQQ",
							"objective-refer": {
								"@ref": "OE.QQQQ",
								"!": " Repeatable ",
								rationale: "QQQQ",
							},
						},
					},
				},
				"!3": " 3.3 Organizational Security Policies ",
				"sec:Organizational_Security_Policies": {
					OSPs: {},
					"!": '     <OSP id="P.QQQQ"> \n        <description>QQQQ</description>\n        <objective-refer ref="O.QQQQ">\n            <rationale>QQQQ</rationale>\n        </objective-refer>\n    </OSP>\n    </OSPs> ',
				},
			},
			"!2": " 4.0 Security Objectives ",
			"sec:Security_Objectives": {
				"!1": " 4.1 Security Objectives for the TOE ",
				"sec:Security_Objectives_for_the_TOE": {
					SOs: {
						SO: {
							"@name": "O.QQQQ",
							"!1": " Repeatable ",
							description: "QQQQ",
							"addressed-by": "QQQQ.#/QQQQ",
							rationale: "QQQQ",
							"!2": " Repeatable ",
						},
					},
				},
				"!2": " 4.2 Security Objctives for the Operational Environment ",
				"sec:Security_Objectives_for_the_Operational_Environment": {
					"#": "\n    QQQQ\n    ",
					SOEs: {
						SOE: {
							"@name": "OE.QQQQ",
							"!": " Repeatable ",
							description: "QQQQ",
						},
					},
				},
				"!3": " 4.3 Security Objectives Rationale ",
				"sec:Security_Objectives_Rationale": {},
			},
			"!3": " 5.0 Security Requirements ",
			"sec:req": {
				"@title": "Security Requirements",
				"!1": " 5.1 Security Functional Requirements ",
				"sec:SFRs": {
					"@title": "Security Functional Requirements",
					"sec:Auditable_Events_for_Mandatory_SFRs": {
						"audit-table": [
							{
								"@table": "mandatory",
								"@id": "t-audit-mandatory",
							},
							{
								"@table": "additional",
								"@id": "t-audit-additional",
								"@title": "Additional Audit Events",
							},
						],
					},
					"!1": " 5.1.1 First SFR Family Section - Alphabetical ",
					section: {
						"@title": "QQQ",
						"@id": "qqq",
						"!1": " Repeatable ",
						"!2": " FCS_CKM.1 ",
						"f-component": {
							"@cc-id": "QQQ_QQQ_EXT.1",
							"@id": "qqqq",
							"@iteration": "QQQQ",
							"@name": "QQQQ",
							"@status": "sel-based/optional",
							"!": " Repeatable ",
							depends: {
								"@on": "qqqq",
								"@and": "qqqq",
							},
							"f-element": {
								"@id": "QQQQ",
								"!": " Repeatable ",
								title: {
									assignable: "QQQQ",
									"#1": " QQQQ ",
									selectables: {
										"@linebreak": "yes",
										"!1": " Repeatable ",
										selectable: {
											"@exclusive": "yes",
											"@id": "qqqq",
											assignable: "QQQQ",
											"#": " QQQQ ",
										},
										"!2": " Repeatable ",
									},
									"#2": ".\n\t\t\t\t",
								},
								note: {
									"@role": "application",
									"#": "QQQQ\n\t\t\t\t",
								},
								aactivity: {
									"@level": "element",
									"!": " Repeatable ",
									TSS: "\n\t\t\t\t\t\tQQQQ\n\t\t\t\t\t",
									Guidance: "QQQQ",
									Tests: {
										testlist: {
											test: {
												"h:div": {
													depends: {
														"@ref": "qqqq",
													},
													"#": "\n                                        QQQQ\n                                ",
												},
											},
										},
									},
								},
							},
						},
					},
					"!2": " First SFR Family Section - Alphabetical ",
					"!3": " 5.1.7 TOE Security Functional Requirements Rationale ",
					"!4": " auto generated ",
				},
				"!2": " 5.1 Security Functional Requirements ",
				"!3": " 5.2 Security Assurance Requirements ",
				section: {
					"@title": "Security Assurance Requirements",
					"@id": "SARs",
				},
				"!4": " Security Assurance Requirements ",
			},
			appendix: {},
			bibliography: {
				"cc-entry": {},
				entry: {}
			},
		},
	},
	techTerms: {},
	useCases: {},
	reference: {},
	revisionHistory: {},
	fileType: ""
};

// Populated normally, and then run XML export serialization
// TODO: look at making the abbr to a dedicated field
// TODO: Refactor terms so that we don't repeat code here
export const exportSlice = createSlice({
	name: "export",
	initialState,
	reducers: {
		SET_TECH_TERMS: (state, action) => {
			const reformatted = Object.entries(action.payload.techTerms).map(([key, value]) => {
				const abbreviation = getAbbreviation(action.payload.techTerms.title)
	
				// Only parse if its a UUID (signifying an actual term)
				if (validator.isUUID(key)) {
					const term = action.payload.techTerms[key]
					return {
						"@full": getTitle(term.title),
						"#": [
							(abbreviation && abbreviation !== "null") ? { "@abbr": abbreviation } : "",
							removeEnclosingPTag(term.definition)
						]
					};
				}
			});
			if (action.payload.hasOwnProperty("techTerms")) {
				const reformatted = Object.entries(action.payload.techTerms).map(
					([key, value]) => {
						const abbreviation = getAbbreviation(action.payload.techTerms.title)

						// Only parse if its a UUID (signifying an actual term)
						if (validator.isUUID(key)) {
							const term = action.payload.techTerms[key]
							return {
								"@full": getTitle(term.title),
								"#": [
									(abbreviation && abbreviation !== "null") ? { "@abbr": abbreviation } : "",
									removeEnclosingPTag(term.definition)
								]
							};
						}
					}
				);

				// Format tech-term by file type
				switch (state.fileType) {
					case "Mobile Device": {
						state.techTerms = {
							"cc:term": reformatted,
						};
						break;
					}
					default: {
						state.techTerms = {
							term: reformatted,
						};
						break;
					}
				}
			}
		},
		SET_USE_CASES: (state, action) => {
			const reformatted = Object.values(action.payload.useCases).map((term) => {

				if (term) {
					const { title, definition, xmlTagMeta } = term;

					// Ignore if not an object (Use Case slice has title and open keys which are string and bool)
					if (term && definition && term.xmlTagMeta) {

						if (title.length != 0) {
							return {
								"@title": title,
								"@id": xmlTagMeta.attributes.id,
								description: removeEnclosingPTag(definition),
							};
						} else {
							return {
								description: removeEnclosingPTag(definition),
							};

						}

					}
				}

			}).filter(notUndefined => notUndefined !== undefined);
			let jsonReformatted = {
				usecase: reformatted,
			};
			state.useCases = jsonReformatted;
		},
		SET_SECURITY_PROBLEM_DEFINITION_SECTION: (state, action) => {
			const {
				securityProblemDefinition,
				threats,
				assumptions,
				objectiveTerms,
			} = action.payload;

			// Set the security problem definition section
			let reformattedThreats = getThreatsAndAssumptionsHelper(
				threats,
				objectiveTerms,
				"Threats"
			);
			let reformattedAssumptions = getThreatsAndAssumptionsHelper(
				assumptions,
				objectiveTerms,
				"Assumptions"
			);
			state.overallObject.PP["sec:Security_Problem_Definition"] = {
				"#": removeEnclosingPTag(securityProblemDefinition),
				"!1": " 3.1 Threats ",
				"sec:Threats": reformattedThreats,
				"!2": " 3.2 Assumptions ",
				"sec:Assumptions": reformattedAssumptions,
				"!3": " 3.3 Organizational Security Policies ",
				"sec:Organizational_Security_Policies": {
					OSPs: {},
					"!": '     <OSP id="P.QQQQ"> \n        <description>QQQQ</description>\n        <objective-refer ref="O.QQQQ">\n            <rationale>QQQQ</rationale>\n        </objective-refer>\n    </OSP>\n    </OSPs> ',
				},
			};
		},
		SET_SECURITY_OBJECTIVES_SECTION: (state, action) => {
			const { toe, operationalEnvironment, objectivesToSFRs } = action.payload;

			// Get Security_Objectives_for_the_TOE
			const reformattedTOE = getSecurityObjectives(toe.terms, objectivesToSFRs);
			state.overallObject.PP["sec:Security_Objectives"][
				"sec:Security_Objectives_for_the_TOE"
			] = {
				"#": toe.definition,
				SOs: {
					SO: reformattedTOE,
				},
			};

			// Get Security_Objectives_for_the_Operational_Environment
			const reformattedOperationalEnvironment = getSecurityObjectives(
				operationalEnvironment.terms,
				objectivesToSFRs
			);
			state.overallObject.PP["sec:Security_Objectives"][
				"sec:Security_Objectives_for_the_Operational_Environment"
			] = {
				"#": operationalEnvironment.definition,
				SOEs: {
					SOE: reformattedOperationalEnvironment,
				},
			};
		},
		SET_META_DATA: (state, action) => {
			// TODO: author, keywords
			const { ppName, releaseDate, version, revisionHistory, xmlTagMeta } = action.payload.metaData;

			// Reformat the revision history
			const fileType = xmlTagMeta.hasOwnProperty("attributes") && xmlTagMeta.attributes.hasOwnProperty("target-product") ? xmlTagMeta.attributes["target-product"] : ""
			state.fileType = fileType
			const isMobileDevice = fileType === "Mobile Device" ? true : false;
			const reformattedRevisionHistory = {
				entry: Object.values(revisionHistory).map((entry) => {
					return {
						version: entry.version,
						date: entry.date,
						subject: {
							"#": String(entry.comment).split("\n").map((item, index, array) => {
								item = item.trim();
								if (index !== array.length - 1) {
									item += isMobileDevice ? "<htm:br/>" : "<h:br/>";
								}
								return item;
							})
						}
					};
				}),
			};

			const reformattedReference = {
				ReferenceTable: {
					PPTitle: ppName,
					PPVersion: version,
					PPAuthor: "NIAP",
					PPPubDate: releaseDate,
					Keywords: "application; software"
				},
			};

			// TODO: Revision history clipping off a number on import
			state.revisionHistory = reformattedRevisionHistory;
			state.reference = reformattedReference;
			state.overallObject.PP.PPReference = reformattedReference;
			state.overallObject.PP.RevisionHistory = reformattedRevisionHistory;

			// Set initial main PP tags
			if (xmlTagMeta.hasOwnProperty("attributes")) {
				const { attributes } = xmlTagMeta;
				if (attributes.hasOwnProperty("boilerplate")) {
					state.overallObject.PP["@boilerplate"] = attributes["boilerplate"]
				}
				if (attributes.hasOwnProperty("target-product")) {
					state.overallObject.PP["@target-product"] = attributes["target-product"]
				}
				if (attributes.hasOwnProperty("target-products")) {
					state.overallObject.PP["@target-products"] = attributes["target-products"]
				}
				if (attributes.hasOwnProperty("xmlns")) {
					state.overallObject.PP["@xmlns"] = attributes["xmlns"]
				}
				if (attributes.hasOwnProperty("xmlns:h")) {
					state.overallObject.PP["@xmlns:h"] = attributes["xmlns:h"]
				}
				if (attributes.hasOwnProperty("xmlns:cc")) {
					state.overallObject.PP["@xmlns:cc"] = attributes["xmlns:cc"]
				}
				if (attributes.hasOwnProperty("xmlns:sec")) {
					state.overallObject.PP["@xmlns:sec"] = attributes["xmlns:sec"]
				}
				if (attributes.hasOwnProperty("xmlns:htm")) {
					state.overallObject.PP["@xmlns:htm"] = attributes["xmlns:htm"]
				}
				if (attributes.hasOwnProperty("short")) {
					state.overallObject.PP["@short"] = attributes["short"]
				}
			}
		},
		SET_PACKAGES: (state, action) => {
			const packages = action.payload.packages;
			let packageArr = [];

			packages.forEach(p => {
				p = p.payload.pkg; // Unwrap from slice
				let dependsArr = [];

				p.depends.forEach(dep => {
					const dependsAttr = Object.keys(dep)[0];
					const dependsValue = dep[dependsAttr];

					dependsArr.push({
						[`@${dependsAttr}`]: dependsValue
					});
				});

				let singlePackage = {
					"@id": p.id,
					git: {
						url: p.git.url,
						branch: p.git.branch
					},
					url: p.url,
					depends: dependsArr
				};


				packageArr.push(singlePackage);
			});

			state.overallObject.PP["include-pkg"] = packageArr;
		},
		SET_MODULES: (state, action) => {
			const modules = action.payload.modules.xml;

			// TODO: Complete, need to parse in modules by field, instead of full xml
			if (typeof (modules) === "object" && modules.length != 0) {
				state.overallObject.PP.modules = modules.payload.modules;
			}
		},
		SET_PP_PREFERENCE: (state, action) => {
			const ppPreference = action.payload.ppPreference

			if (ppPreference.hasOwnProperty("xml") && ppPreference.xml.hasOwnProperty("payload") && ppPreference.xml.payload.hasOwnProperty("preference")) {
				state.overallObject.PP["pp-preferences"] = ppPreference.xml.payload.preference;
			}
		},
		SET_INTRODUCTION: (state, action) => {
			const intro = action.payload.introduction.formItems;
			const { xml: platformXML } = action.payload.platformData;
			const sec_overview_section = intro.find(
				(formItem) => formItem.title == "Objectives of Document"
			).xmlTagMeta.tagName;
			const sec_overview_text = removeEnclosingPTag(intro.find(
				(formItem) => formItem.title == "Objectives of Document"
			).text);
			const createToe = (title, intro, subTitle = "") => {
				let formItem = intro.find((item) => item.title == title);

				if (formItem) {
					let name = ""

					switch (title) {
						case "TOE Overview":
							if (subTitle.length != 0) {
								if (subTitle == "TOE Boundary") {
									name = "sec:TOE_Boundary"
								} else if (subTitle == "TOE Platform") {
									name = "sec:TOE_Platform"

								}

								let toeOverview = intro.find((item) => item.title == "TOE Overview");

								if (toeOverview && toeOverview.hasOwnProperty("nestedFormItems") && toeOverview.nestedFormItems.hasOwnProperty("formItems")) {
									const boundaryText = toeOverview.nestedFormItems.formItems.find((item) => item.title == subTitle) ? toeOverview.nestedFormItems.formItems.find((item) => item.title == subTitle).text : "";

									if (boundaryText.length != 0) {
										return {
											[name]: {
												"#": removeEnclosingPTag(boundaryText)
											}
										}
									}
								}
							} else {
								return {
									"#": removeEnclosingPTag(formItem.text)
								}
							}
							break
						case "TOE Usage":
							return { "#": removeEnclosingPTag(formItem.text) }
					}
				}
			}

			const toe_overview = createToe("TOE Overview", intro);
			const toe_boundary = createToe("TOE Overview", intro, "TOE Boundary");
			const toe_platform = createToe("TOE Overview", intro, "TOE Platform");
			const toe_list = [toe_overview, toe_boundary, toe_platform];

			const toe_usage = createToe("TOE Usage", intro);


			let sections = [];
			// Add TOE Overview
			sections.push({
				"@title": "Compliant Targets of Evaluation",
				"@id": "TOEdescription",
				"#": toe_list,
			})

			// TODO: Phase 2, once platforms are in UI, change to check if platform slice has content
			if (platformXML && platformXML.length != 0) {
				sections.push({
					"@title": "Platforms with Specific EAs",
					"@id": "sec-platforms",
					"#": platformXML
				});
			}

			// Set tech terms according to file type
			let techTerms;
			switch (state.fileType) {
				case "Mobile Device": {
					techTerms = {
						"cc:tech-terms": current(state.techTerms)
					}
					break;
				}
				default: {
					techTerms = {
						"tech-terms": current(state.techTerms)
					}
					break;
				}
			}

			const useCaseState = current(state.useCases);
			const formattedIntroduction = {
				// Refactor this so that we're looping through the loop items and using their embedded tags
				// Search the form items for duplicate tags, and if there are, use an array
				[sec_overview_section]: sec_overview_text,
				"#": techTerms,
				section: sections,
				"sec:Use_Cases": {
					"#": [
						toe_usage,
						useCaseState && useCaseState.hasOwnProperty("usecase") && useCaseState.usecase.length > 0 ? { usecases: useCaseState } : "",
					]
				}
			};

			state.overallObject.PP["sec:Introduction"] = formattedIntroduction;
		},
		SET_CONFORMANCE_CLAIMS: (state, action) => {
			const { formItems } = action.payload.conformanceClaims;
			let formattedConformance = {
				"@boilerplate": "no",
			};

			// Set conformance claims by file type
			switch (state.fileType) {
				case "Mobile Device": {
					formattedConformance["cc:cclaims"] = {
						"cc:cclaim": formItems.map((claim) => {
							const { title, text } = claim;
							return {
								"@name": title,
								"cc:description": removeEnclosingPTag(text),
							};
						})
					}
					break;
				}
				default: {
					formattedConformance["cclaims"] = {
						cclaim: formItems.map((claim) => {
							const { title, text } = claim;
							return {
								"@name": title,
								description: removeEnclosingPTag(text),
							};
						})
					}
					break;
				}
			}
			state.overallObject.PP["sec:Conformance_Claims"] = formattedConformance;
		},
		SET_SECURITY_REQUIREMENTS: (state, action) => {
			const sfrSections = action.payload.securityRequirements
				? JSON.parse(JSON.stringify(action.payload.securityRequirements))
				: {};
			const useCases = action.payload.useCases
				? JSON.parse(JSON.stringify(action.payload.useCases))
				: {};

			const { sars, platforms, auditSection } = action.payload
			const { title, definition, formItems } = sfrSections;
			
			try {
				// Get selectable ids from uuid
				const { selectableUUIDtoID, componentMap} = getSelectableMap(formItems);
				const useCaseMap = getUseCaseMap(useCases);
				let auditTableExists = false;
				
				// Get sfr sections
				let sfrSections = formItems.map((sfr, sfrIndex) => {
					const { nestedFormItems, text, title } = sfr;

					if (nestedFormItems && title) {
						if (title == "Security Functional Requirements") {
							const { formItems } = nestedFormItems;
							let innerSections = [];
							if (formItems && formItems.length > 0) {
								// Filter through to grab cc_ids to see if FAU_GEN.1 exists
								const ccIds = formItems.flatMap((item) =>
									item.components ?
									Object.values(item.components).map((component) => {
											const { cc_id } = component;
											if (cc_id !== undefined) {
												return cc_id.toLowerCase();
											}
										}
									)
									:
									[]
								);
								auditTableExists = ccIds.includes("fau_gen.1")

								// Get section values
								innerSections = formItems.map((section, sfrSectionIndex) => {
									const sectionID = `5.${sfrIndex + 1}.${sfrSectionIndex + 1}`;
									const { title, definition, components } = section;
									let findValues = title.split(/\(([^)]+)\)/);
									const id =
										findValues && findValues.length > 1
											? findValues[1].trim().toLowerCase()
											: "";
									let formattedComponents = getSfrComponents(
										components,
										selectableUUIDtoID,
										componentMap,
										useCaseMap,
										platforms,
										state.fileType,
										auditTableExists
									);
									return [
										{ "!": `${sectionID} ${title ? title : ""}` },
										{
											section: {
												"@id": id,
												"@title": title ? title : "",
												"#": [definition, formattedComponents],
											},
										},
									];
								});
							}

							return {
								"@title": title,
								"#": [text ? text : "", innerSections],
							};
						} else if (title == "Security Assurance Requirements") {
							const { formItems } = nestedFormItems;
							let innerSections = [];
							if (formItems && formItems.length > 0) {
								// Get section values
								innerSections = formItems.map((section, sfrSectionIndex) => {
									const { title, summary, components } = section;

									let formattedComponents = getSARComponents(
										sars.elements,
										components,
									);

									return [
										{
											section: {
												"@title": title ? title : "",
												"#": [summary, formattedComponents],
												...(section.id && { "@id": section.id }) // Conditionallly add id if there is one
											},
										},
									];
								});
							}

							return {
								"@title": title,
								"#": [text ? text : "", innerSections],
							};
						}
					}
				});

				// Format security requirements by file type
				if (state.fileType === "General-Purpose Computing Platforms") {
					delete state.overallObject.PP["sec:req"];
				}

				state.overallObject.PP[state.fileType === "General-Purpose Computing Platforms" ? "sec:Security_Requirements" : "sec:req"] = {
					"@title": title,
					"#": definition ? definition : "",
					"!1": " 5.1 Security Functional Requirements",
					"sec:SFRs": {
						"#": [
							auditTableExists ? auditSection : "",
							sfrSections.find(section => section["@title"] == "Security Functional Requirements")
						]
					},
					"!2": "5.2 Security Assurance Requirements",
					[sars.xmlTagMeta.tagName]: {
						"@title": sars.xmlTagMeta.attributes.hasOwnProperty("title") ? sars.xmlTagMeta.attributes.title : "Security Assurance Requirements",
						"#": [sfrSections.find(section => section["@title"] == "Security Assurance Requirements")],
						// Conditionally add id if there is one (not setting a default as transforms doesn't expect the attribute for all PPs)
						...(sars.xmlTagMeta.attributes.hasOwnProperty("id") && { "@id": sars.xmlTagMeta.attributes.id }),
					}
				};
			} catch (e) {
				console.log(e);
			}
		},
		SET_OVERALL_STATE: (state) => {
			state.overallObject.PP.PPReference = current(state.reference);
			state.overallObject.PP.RevisionHistory = current(state.revisionHistory);
		},
		SET_FORMATTED_XML: (state, action) => {
			try {
				const { xmlString } = action.payload

				// Update formattedXML state if it has not changed
				if (xmlString && (JSON.stringify(xmlString) !== JSON.stringify(state.formattedXML))) {
					state.formattedXML = xmlString
				}
			} catch (e) {
				console.log(e)
			}
		},
		SET_BIBLIOGRAPHY: (state, action) => {
			const bibliography = action.payload.bibliography;

			let entries = [];
			for (const [key, value] of Object.entries(bibliography)) {
				if (key == "entries") {

					value.forEach(e => {
						let singleEntry = {
							entry: {
								"@id": e["id"],
								tag: e["tag"],
								description: e["description"],
							}
						}

						entries.push(singleEntry);
					});
				}
			}

			const formattedBibliography = {
				"cc-entry": "",
				"#": entries
			}

			// Delete bibliography and move to the end of the object for gpcp
			if (state.fileType === "General-Purpose Computing Platforms") {
				delete state.overallObject.PP.bibliography;
				state.overallObject.PP = { ...state.overallObject.PP, ["bibliography"]: formattedBibliography };
			} else {
				state.overallObject.PP.bibliography = formattedBibliography;
			}
		},
		SET_APPENDICES: (state, action) => {
			let appendices = [];

			const valGuideAppendix = action.payload.state.validationGuidelinesAppendix.xmlContent;
			if (valGuideAppendix) {
				const valGuideAppendixFormatted = {
					"@title": action.payload.state.valGuideAppendix.xmlTagMeta.attributes.hasOwnProperty("title") ? action.payload.state.valGuideAppendix.xmlTagMeta.attributes.title : "Validation Guidelines",
					"@id": action.payload.state.valGuideAppendix.xmlTagMeta.attributes.hasOwnProperty("id") ? action.payload.state.valGuideAppendix.xmlTagMeta.attributes.id : "validation_guidelines",
					"#": valGuideAppendix
				}
				appendices.push(valGuideAppendixFormatted);
			}

			const satisfiedReqsAppendix = action.payload.state.satisfiedReqsAppendix.xmlContent;
			if (satisfiedReqsAppendix) {
				const satisfiedReqsAppendixFormatted = {
					"@title": action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.hasOwnProperty("title") ? action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.title : "Implicitly Satisfied Requirements",
					"@id": action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.hasOwnProperty("id") ? action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.id : "satisfiedreqs",
					"#": satisfiedReqsAppendix
				}
				appendices.push(satisfiedReqsAppendixFormatted);
			}

			const entropyAppendix = action.payload.state.entropyAppendix.xmlContent;
			if (entropyAppendix) {
				const entropyAppendixFormatted = {
					"@title": action.payload.state.entropyAppendix.xmlTagMeta.attributes.hasOwnProperty("title") ? action.payload.state.entropyAppendix.xmlTagMeta.attributes.title : "Entropy Documentation and Assessment",
					"@id": action.payload.state.entropyAppendix.xmlTagMeta.attributes.hasOwnProperty("id") ? action.payload.state.entropyAppendix.xmlTagMeta.attributes.id : "entropyappendix",
					"#": entropyAppendix
				}
				appendices.push(entropyAppendixFormatted);
			}

			const equivGuidelinesAppendix = action.payload.state.equivGuidelinesAppendix.xmlContent;
			if (equivGuidelinesAppendix) {
				const equivGuidelinesAppendixFormatted = {
					"@title": action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.hasOwnProperty("title") ? action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.title : "Equivalency Guidelines",
					"@id": action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.hasOwnProperty("id") ? action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.id : "appendix-equiv",
					"#": equivGuidelinesAppendix
				}
				appendices.push(equivGuidelinesAppendixFormatted);
			}

			const vectorAppendix = action.payload.state.vectorAppendix.xmlContent.payload;
			if (vectorAppendix) {
				const vectorAppendixFormatted = {
					"@title": action.payload.state.vectorAppendix.xmlTagMeta.attributes.hasOwnProperty("title") ? action.payload.state.vectorAppendix.xmlTagMeta.attributes.title : "Initialization Vector Requirements for NIST-Approved Cipher Modes",
					"@id": action.payload.state.vectorAppendix.xmlTagMeta.attributes.hasOwnProperty("id") ? action.payload.state.vectorAppendix.xmlTagMeta.attributes.id : "vector",
					"#": vectorAppendix
				}
				appendices.push(vectorAppendixFormatted);
			}

			const acknowledgementsAppendix = action.payload.state.acknowledgementsAppendix.xmlContent;
			if (acknowledgementsAppendix) {
				const acknowledgementsAppendixFormatted = {
					"@title": action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.hasOwnProperty("title") ? action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.title : "Acknowledgements",
					"@id": action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.hasOwnProperty("id") ? action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.id : "ack",
					"#": acknowledgementsAppendix
				}
				appendices.push(acknowledgementsAppendixFormatted);
			}

			const formattedAppendix = appendices.length > 1 ? appendices : appendices[0];

			// Delete appendix and move to the end of the object for gpcp
			if (state.fileType === "General-Purpose Computing Platforms") {
				delete state.overallObject.PP.appendix;
				state.overallObject.PP = { ...state.overallObject.PP, ["appendix"]: formattedAppendix };
			} else {
				state.overallObject.PP.appendix = formattedAppendix;
			}
		},
		RESET_EXPORT: () => initialState
	},
});

const getThreatsAndAssumptionsHelper = (input, objectiveTerms, type) => {
	try {
		let definition = input.definition;
		const reformatted = Object.values(input.terms).map((term) => {
			const { title, definition, objectives } = term;
			const reformattedObjectives = objectives.map((objective) => {
				const { uuid, rationale } = objective;
				if (objectiveTerms.hasOwnProperty(uuid)) {
					return {
						"@ref": objectiveTerms[uuid].title,
						rationale: rationale,
					};
				}
			});
			return {
				"@name": title,
				description: removeEnclosingPTag(definition),
				"objective-refer": reformattedObjectives,
			};
		});

		// Format final section data
		let finalSectionJson = {};
		if (type === "Threats") {
			finalSectionJson = {
				"#": definition && definition !== "" ? definition : "",
				threats: {
					threat: reformatted,
				},
			};
		} else if (type === "Assumptions") {
			finalSectionJson = {
				"#": definition && definition !== "" ? definition : "",
				assumptions: {
					assumption: reformatted,
				},
			};
		}
		return finalSectionJson;
	} catch (e) {
		console.log(e);
	}
};

const getSecurityObjectives = (terms, objectivesToSFRs) => {
	try {
		const reformattedJSON = Object.entries(terms).map(([uuid, value]) => {
			const { title, definition } = value;
			let outputs = [];
			let sfrs = objectivesToSFRs.hasOwnProperty(uuid)
				? objectivesToSFRs[uuid]
				: [];
			if (sfrs && sfrs.length > 0) {
				sfrs.map((sfr) => {
					const { sfr_name, rationale } = sfr;
					outputs.push({ "addressed-by": sfr_name });
					outputs.push({ rationale: rationale });
				});
			}
			return {
				"@name": title,
				description: removeEnclosingPTag(definition),
				"#": outputs,
			};
		});
		return reformattedJSON;
	} catch (e) {
		console.log(e);
	}
	return [];
};

const getSfrComponents = (
	initialComponents,
	selectableUUIDtoID,
	componentMap,
	useCaseMap,
	platforms,
	fileType,
	auditTableExists
) => {
	let components = [];
	try {
		if (initialComponents && Object.keys(initialComponents).length > 0) {
			Object.entries(initialComponents).forEach(
				([componentUUID, initialComponent]) => {
					const {
						title,
						cc_id,
						iteration_id,
						xml_id,
						definition,
						optional,
						objective,
						invisible,
						selectionBased,
						selections,
						useCaseBased,
						useCases,
						implementationDependent,
						reasons,
						extendedComponentDefinition,
						auditEvents,
						elements,
						evaluationActivities,
					} = initialComponent;
					let componentName = `${cc_id +
						(iteration_id && iteration_id.length > 0
							? "/" + iteration_id + " "
							: " ") +
						title
						}`;
					let formattedExtendedComponentDefinition = extendedComponentDefinition ? getExtendedComponentDefinition(extendedComponentDefinition) : []
					let component = [
						{ "!": componentName },
						{
							"f-component": {
								"@cc-id": cc_id ? cc_id.toLowerCase() : "",
								"@id": xml_id ? xml_id : getXmlID(cc_id, iteration_id),
								"@name": title ? title : "",
								depends: [],
								"#": [
									iteration_id && iteration_id !== ""
										? { "@iteration": iteration_id }
										: "",
									(fileType === "Virtualization System" && formattedExtendedComponentDefinition.length > 0) ?
										{ "consistency-rationale": "" } : "",
									formattedExtendedComponentDefinition,
									definition && definition !== "" ? { description: definition } : "",
									getSfrElements(
										elements ? elements : {},
										selectableUUIDtoID,
										componentUUID,
										evaluationActivities,
										platforms
									),
									auditTableExists ? getAuditEvents(auditEvents) : [],
								],
							},
						},
					];

					// Get component selections
					getComponentSelections(
						component,
						implementationDependent,
						reasons,
						selectionBased,
						selections,
						selectableUUIDtoID,
						componentMap,
						useCaseBased,
						useCases,
						useCaseMap,
						optional,
						objective,
						invisible,
						extendedComponentDefinition
					);

					// Set component
					if (!components.includes(component)) {
						components.push(component);
					}
				}
			);
		}
	} catch (e) {
		console.log(e);
	}
	return components;
};

const getSfrElements = (
	initialElements,
	selectableUUIDtoID,
	componentUUID,
	evaluationActivities,
	platforms
) => {
	let elements = [];
	try {
		if (initialElements && Object.keys(initialElements).length > 0) {
			Object.entries(initialElements).forEach(
				([elementUUID, element], index) => {
					// Get evaluation activities
					let componentEvaluationActivity =
						index === 0 &&
							evaluationActivities &&
							evaluationActivities.hasOwnProperty(componentUUID)
							? JSON.parse(JSON.stringify(evaluationActivities[componentUUID]))
							: null;
					let elementEvaluationActivity =
						evaluationActivities &&
							evaluationActivities.hasOwnProperty(elementUUID)
							? JSON.parse(JSON.stringify(evaluationActivities[elementUUID]))
							: null;
					let formattedEvaluationActivities = [];

					// Get component evaluation activity
					if (componentEvaluationActivity) {
						getSfrEvaluationActivities(
							componentEvaluationActivity,
							formattedEvaluationActivities,
							selectableUUIDtoID,
							true,
							platforms
						);
					}

					if (elementEvaluationActivity) {
						// Get element evaluation activity
						getSfrEvaluationActivities(
							elementEvaluationActivity,
							formattedEvaluationActivities,
							selectableUUIDtoID,
							false,
							platforms
						);
					}

					// Get SFR element
					const { elementXMLID, note } =
						element;
					try {
						// Return elements here
						let formattedElement = {
							"f-element": {
								"@id": elementXMLID,
								"#": [
									{
										title: parseElement(element),
									},
									note ? { note: getNote(note) } : "",
									formattedEvaluationActivities,
								],
							},
						};

						if (!elements.includes(formattedElement)) {
							elements.push(formattedElement);
						}
					} catch (e) {
						console.log(e);
					}
				}
			);
		}
	} catch (e) {
		console.log(e);
	}
	return elements;
};

const getNote = (note) => {
	return {
		"@role": "application",
		"#": `${note}`,
	};
};

const parseElement = (element) => {
	let finalResult = "";
	const { title, selectables, selectableGroups, isManagementFunction, managementFunctions, tabularize } = element

	
	function parseTitleOrDescriptionArray(titleOrDescription) {
		if (!titleOrDescription)
			return

		let result = "";

		titleOrDescription.forEach((item) => {

			const assignmentEdgeCase = item.groups && item.groups.length == 1 && selectables[item.groups[0]] && selectables[item.groups[0]].assignment

			if (item.text) {
				result += item.text;
			} else if (item.description) {
				result += item.description;
			} else if (item.assignment) {
				result += `<assignable>${selectables[item.assignment].description}</assignable>`;
			} else if (item.selections) {
				const group = selectableGroups[item.selections]
				const onlyone = group.onlyOne ? `onlyone="yes"` : "";
				const linebreak = group.linebreak ? `linebreak="yes"` : "";

				const formattedSelectables = `<selectables ${onlyone} ${linebreak}>${parseSelections(item.selections)} </selectables>`
				result += formattedSelectables;
			} else if (assignmentEdgeCase) {
				const validKey = item.groups[0]
				if (!selectables[validKey])
					return
				
				const { description } = selectables[validKey]
				
				result += `<assignable>${description}</assignable>`
				
			} else if (item.tabularize) {
				result += parseTabularize(tabularize)
			}
			else {
				result += "<selectables>"
				item.groups.forEach(groupKey => {
					result += parseSelections(groupKey)
				})
				result += "</selectables>"
			}
		})
		return result;
	}

	// Within the 'selections' field of a title array, one or two things can happen
	// 1. We have a singular selectable
	// 2. We have a group
	function parseSelections(selectionKey) {
		let nestedResults = "";
		const group = selectableGroups[selectionKey];

		if (group == undefined) {
			const { description, exclusive, id, assignment } = selectables[selectionKey]
			const isExclusive = exclusive == true ? 'exclusive="yes"' : ""
			const attributes = `id="${id}" ${isExclusive}`
			const assignableOpeningTag = assignment ? "<assignable>" : ""
			const assignableClosingTag = assignment ? "</assignable>" : ""

			nestedResults += `<selectable ${attributes}>${assignableOpeningTag}${description}${assignableClosingTag}</selectable>`;
		} else {
			group.groups.forEach(validKey => {
				if (selectables[validKey]) {
					const { description, exclusive, id, assignment } = selectables[validKey]
					const isExclusive = exclusive == true ? 'exclusive="yes"' : ""
					const attributes = `id="${id}" ${isExclusive}`
					const assignableOpeningTag = assignment ? "<assignable>" : ""
					const assignableClosingTag = assignment ? "</assignable>" : ""

					nestedResults += `<selectable ${attributes}>${assignableOpeningTag}${description}${assignableClosingTag}</selectable>`;
				} else if (selectableGroups[validKey]) {
					nestedResults += `<selectable id="${validKey}">`
					nestedResults += parseGroup(validKey);
					nestedResults += `</selectable>`
				}
			})
		}

		return nestedResults;
	}

	// Complex selectable
	function parseGroup(groupKey) {
		let nestedResults = "";
		const group = selectableGroups[groupKey];
		if (group.description) {
			nestedResults += parseTitleOrDescriptionArray(group.description);
		} else {
			nestedResults += parseSelections(groupKey)
		}

		return nestedResults;
	}

	function parseTabularize(tabularize) {
		const tabularizeTablesList = Object.values(tabularize)

		let formattedTabularizeTablesList = ''

		tabularizeTablesList.forEach(tabularizeTable => {
			const { id, title, definition, rows, columns } = tabularizeTable
			let formattedTabularize = "" 
	
			// TODO: Refactor this segment to not be multi-line with += statements, start w/ this for readability
			formattedTabularize += '<selectables>'
			formattedTabularize += `<tabularize id="${id}" title="${title}">`
			definition.forEach(({value, type}) => {
				if (value !== "Selectable ID")
					formattedTabularize += `<${type}>${value}</${type}>`
			})

			formattedTabularize += `</tabularize>`

			formattedTabularizeTablesList += formattedTabularize;
	
			rows.forEach(row => {
				const { selectableId, identifier, inputParameters, keyDerivationAlgorithm, cryptographicKeySizes, listOfStandards } = row;
	
				// Pack the contents of this table into an array for easier parsing
				const selections = [inputParameters, keyDerivationAlgorithm, cryptographicKeySizes, listOfStandards];
	
				formattedTabularizeTablesList += `<selectable id="${selectableId}"><col>${identifier}</col>`
				selections.forEach(selection => {
					formattedTabularizeTablesList += `<col>${parseTitleOrDescriptionArray(selection)}</col>`
				})
				formattedTabularizeTablesList += `</selectable>`
	
			})
			// Start parsing the tabularized selectables

			formattedTabularizeTablesList += "</selectables>"
		})	
		return formattedTabularizeTablesList

	}
	
	// Management Functions Table
	function parseManagementFunctionsTable(managementFunctions) {
		const { id, tableName, statusMarkers, rows, columns } = managementFunctions;
		
		const tableId = id !== "" ? id : "fmt_smf";
		const tableTitle = tableName !== "" ? tableName : "Management Functions";
		
		// Construct the id and table name and status markers
		let result = `
			<br/><br/>
			<b><ctr id="${tableId}" ctr-type="Table">: ${tableTitle}</ctr></b>
			<br/><br/>
			Status Markers:<br/> ${statusMarkers}<br/>
		`;

		// Construct the management function set
		const { columnResult, fields } = parseManagementFunctionColumns(columns);
		const rowResult = parseManagementFunctionRows(rows, fields);
		
		result += `<management-function-set default="O">${columnResult}${rowResult}</management-function-set>`;
		
		return result;
	}
	

	// Management Function Columns
	function parseManagementFunctionColumns(columns) {
		let result = ""
		let fields = []

		columns.forEach(({ field, headerName }) => {
			if (!["rowNum", "id", "textArray"].includes(field)) {
				result += `<manager cid="${field}">${headerName}</manager>`
				if (!fields.includes(field)) {
					fields.push(field)
				}
			}
		})

		return { columnResult: result, fields };
	}

	// Management Function Rows
	function parseManagementFunctionRows(rows, fields) {
		let result = ""

		rows.forEach(row => {
			const { id, textArray, evaluationActivity, note } = row;
			const rowText = parseTitleOrDescriptionArray(textArray);
			const idAttribute = (id && id !== "") ? ` id="${id}"` : "";
			const activityAndNote = evaluationActivity ? createAActivityAndNote(evaluationActivity, note) : "";

			result += `
				<management-function${idAttribute}>
					<text>${rowText}</text>
					${parseRowFields(row, fields)}
					${activityAndNote}
				</management-function>
			`;
		});

		return result;
	}


	function createAActivityAndNote(evaluationActivity, note) {
		const { tss, guidance,testIntroduction, testClosing, testList } = evaluationActivity;
		let result = "";

		if (note) 
			note.forEach(appNote => result += `<app-note>${appNote}</app-note>`)

		let formattedTestList = ''
		testList.forEach((element) => {
			const { description, tests } = element
			formattedTestList += description
			formattedTestList += `<testlist>`
			tests.forEach(test => formattedTestList += `<test>${test.objective}</test>`)
			formattedTestList += `</testlist>`

		})
		formattedTestList += testClosing

			result += `
				<aactivity>
					<TSS>${tss}</TSS>
					<Guidance>${guidance}</Guidance>
					<Tests>${testIntroduction}${formattedTestList}</Tests>
				</aactivity>
			`
		return result;
	}

	// Get Management Function Row Fields
	function parseRowFields(row, fields) {
		let result = ""
		fields.forEach((field) => {
			if (field && row.hasOwnProperty(field)) {
				const marker = row[field] === "-" ? "NA" : row[field];
				result += `<${marker} ref="${field}"/>`
			}
		})
		return result;
	}

	// Get initial title
	finalResult += parseTitleOrDescriptionArray(title);

	// Get management function table if it exists and return
	if (isManagementFunction && managementFunctions && Object.keys(managementFunctions).length > 0) {
		const managementResult = parseManagementFunctionsTable(managementFunctions)
		finalResult += managementResult
	}
	return finalResult;
}
const getExtendedComponentDefinition = (extendedComponentDefinition) => {
	const { toggle, audit, managementFunction, componentLeveling, dependencies } =
		extendedComponentDefinition || {};
	let formattedExtendedComponentDefinition = [];

	if (extendedComponentDefinition == undefined)
		return formattedExtendedComponentDefinition

	// Helper function to collapse multiple if statements
	function addFormattedDefinition(key, value) {
		if (value && value !== "") {
			let formattedValue = { [key]: value };
			if (!formattedExtendedComponentDefinition.includes(formattedValue))
				formattedExtendedComponentDefinition.push(formattedValue);
		}
	}

	if (toggle) {
		addFormattedDefinition("comp-lev", componentLeveling);
		addFormattedDefinition("management", managementFunction);
		addFormattedDefinition("audit", audit);
		addFormattedDefinition("dependencies", dependencies);
	}

	return formattedExtendedComponentDefinition;
};

const getComponentSelections = (
	component,
	implementationDependent,
	reasons,
	selectionBased,
	selections,
	selectableUUIDtoID,
	componentMap,
	useCaseBased,
	useCases,
	useCaseMap,
	optional,
	objective,
	invisible
) => {
	if (component && component[1]) {
		let fComponent = component[1]["f-component"];

		// Add implementation dependent
		if (implementationDependent && reasons && reasons.length > 0) {
			fComponent["@status"] = "feat-based";
			reasons.forEach((reason) => {
				let formattedReason = { "@on": reason };
				if (!fComponent["depends"].includes(formattedReason)) {
					fComponent["depends"].push(formattedReason);
				}
			});
		}

		// Add selection based
		if (selectionBased) {
			if (selections && Object.keys(selections).length > 0) {
				if (selections.hasOwnProperty("selections")) {
					fComponent["@status"] = "sel-based";

					// Get components
					if (selections.components.length > 0) {
						selections.components.forEach((component) => {
							const id = componentMap[component]

							if (id) {
								const formattedID = {"@on-incl": id};
								if (!fComponent["depends"].includes(formattedID)) {
									fComponent["depends"].push(formattedID);
								}
							}
						});
					}

					// Get selections
					if (Object.keys(selections.selections).length > 0) {
						Object.values(selections.selections).forEach((selection) => {
							if (selectableUUIDtoID.hasOwnProperty(selection)) {
								const formattedID = { "@on-sel": selectableUUIDtoID[selection] };
								if (!fComponent["depends"].includes(formattedID)) {
									fComponent["depends"].push(formattedID);
								}
							}
						});
					}
				}
			}
		}

		// Add use case based
		if (useCaseBased && useCases && useCases.length > 0) {
			fComponent["@status"] = "sel-based";
			useCases.forEach((useCase) => {
				if (useCaseMap.hasOwnProperty(useCase)) {
					let formattedUseCase = { "@on-use": useCaseMap[useCase] };
					if (!fComponent["depends"].includes(formattedUseCase)) {
						fComponent["depends"].push(formattedUseCase);
					}
				}
			});
		}

		// Add invisible
		if (invisible) {
			fComponent["@status"] = "invisible"
		}

		// Add optional
		if (optional) {
			let formatted = { optional: {} };
			if (
				fComponent.hasOwnProperty("@status") &&
				(fComponent["@status"] === "sel-based" ||
					fComponent["@status"] === "feat-based") &&
				!fComponent["depends"].includes(formatted)
			) {
				fComponent["depends"].push(formatted);
			} else {
				fComponent["@status"] = "optional";
			}
		}

		// Add objective
		else if (objective) {
			let formatted = { objective: {} };
			if (
				fComponent.hasOwnProperty("@status") &&
				(fComponent["@status"] === "sel-based" ||
					fComponent["@status"] === "feat-based") &&
				!fComponent["depends"].includes(formatted)
			) {
				fComponent["depends"].push(formatted);
			} else {
				fComponent["@status"] = "objective";
			}
		}
	}
};

const getAuditEvents = (auditEvents) => {
	let formattedAuditEvents = [];
	try {
		// Set audit events
		if (auditEvents && Object.keys(auditEvents).length > 0) {
			Object.values(auditEvents).forEach((event) => {
				const { optional, description, items } = event;
				let auditEvent = {};
				if (description && description !== "") {
					if (optional) {
						auditEvent["audit-event-descr"] = {
							selectables: {
								"@onlyone": "yes",
								selectable: [description ? description : "", "none"],
							},
						};
					} else {
						auditEvent["audit-event-descr"] = description ? description : "";
					}
				}
				if (items && items.length > 0) {
					items.forEach((item) => {
						const { optional, info } = item;
						if (info && info !== "") {
							if (!auditEvent.hasOwnProperty("#")) {
								auditEvent["#"] = [];
							}
							if (optional) {
								auditEvent["#"].push({
									"audit-event-info": {
										selectables: {
											"@onlyone": "yes",
											selectable: [
												info ? info : "",
												"No additional information",
											],
										},
									},
								});
							} else {
								auditEvent["#"].push({ "audit-event-info": info ? info : "" });
							}
						}
					});
				}

				// Add to audit events
				let formattedAuditEvent = { "audit-event": auditEvent };
				if (!formattedAuditEvents.includes(formattedAuditEvent)) {
					formattedAuditEvents.push(formattedAuditEvent);
				}
			});
		}
	} catch (e) {
		console.log(e);
	}
	return formattedAuditEvents;
};

const getSfrEvaluationActivities = (
	evaluationActivity,
	formattedEvaluationActivities,
	selectableUUIDtoID,
	isComponent,
	platforms
) => {
	try {
		let formattedEvaluationActivity = {
			aactivity: {
				"@level": isComponent ? "component" : "element",
			},
		};
		if (evaluationActivity) {
			const { introduction, tss, guidance, testIntroduction, testList } =
				evaluationActivity;

			let isAactivity =
				evaluationActivity &&
				Object.keys(evaluationActivity).length > 0 &&
				(introduction || tss || guidance || testIntroduction || testList);

			// Get evaluation activity values
			if (isAactivity) {
				// Get introduction
				if (introduction && introduction !== "") {
					formattedEvaluationActivity.aactivity["#"] = introduction;
				}

				// Get TSS
				if (tss && tss !== "") {
					formattedEvaluationActivity.aactivity.TSS = tss;
				}

				// Get Guidance
				if (guidance && guidance !== "") {
					formattedEvaluationActivity.aactivity.Guidance = guidance;
				}

				// Get Tests
				if (testIntroduction || (testList && testList.length > 0)) {
					let intro = testIntroduction ? testIntroduction : "";
					let formattedTestLists = [];
					if ((intro && intro !== "") || (testList && testList.length > 0)) {
						if (testList && testList.length > 0) {
							testList.forEach((list) => {
								const { description, tests } = list;
								if (
									(description && description !== "") ||
									(tests && tests.length > 0)
								) {
									let formattedTests = [];
									if (tests && tests.length) {
										tests.forEach((test) => {
											const { dependencies, objective } = test;
											if (
												(objective && objective !== "") ||
												(dependencies && dependencies.length > 0)
											) {
												let formattedDependencies = [];
												if (dependencies && dependencies.length > 0) {
													dependencies.forEach((dependency) => {
														if (dependency && dependency !== "") {
															let formattedDependency = {};

															if (selectableUUIDtoID.hasOwnProperty(dependency)) { // if its a selectable
																formattedDependency = {
																	depends: {
																		"@on": selectableUUIDtoID[dependency],
																	},
																};
															} else { // it is a platform
																const platformObject = platforms.find(platform => platform.name === dependency);

																formattedDependency = {
																	depends: {
																		"@ref": platformObject ? platformObject.id : dependency,
																	},
																};
															}

															if (!formattedDependencies.includes(formattedDependency)) {
																formattedDependencies.push(formattedDependency);
															}
														}
													});
												}
												let formattedTest = {
													test: {
														"#": [
															formattedDependencies,
															objective ? objective : "",
														],
													},
												};
												if (!formattedTests.includes(formattedTest)) {
													formattedTests.push(formattedTest);
												}
											}
										});
									}
									let formattedTestList = {
										testlist: {
											"#": [description ? description : "", formattedTests],
										},
									};
									if (!formattedTestLists.includes(formattedTestList)) {
										formattedTestLists.push(formattedTestList);
									}
								}
							});
						}
						formattedEvaluationActivity.aactivity.Tests = {
							"#": [intro, formattedTestLists],
						};
					}
				}
			} else {
				formattedEvaluationActivity.aactivity["no-tests"] = [];
			}
			// Add formatted evaluation activity
			if (!formattedEvaluationActivities.includes(formattedEvaluationActivity)) {
				formattedEvaluationActivities.push(formattedEvaluationActivity);
			}
		}
	} catch (e) {
		console.log(e);
	}
};

const getSelectableMap = (formItems) => {
	let selectableUUIDtoID = {};
	let componentMap = {}

	try {
		formItems.forEach((sfr) => {
			// if (sfr.title = "Security Functional Requirements") { // Only want to do this for the SFRs, not SARs
			const { nestedFormItems } = sfr;
			if (nestedFormItems) {
				const { formItems } = nestedFormItems;

				if (formItems && formItems.length > 0) {
					formItems.forEach((section) => {
						const { components } = section;

						if (components && Object.keys(components).length > 0) {
							Object.entries(components).forEach(([componentUUID, component]) => {
								const { elements, xml_id, cc_id, iteration_id } = component;

								// Get selectables
								if (elements && Object.keys(elements).length > 0) {
									Object.values(elements).forEach((element) => {
										const { selectables } = element;

										if (selectables && Object.values(selectables).length > 0) {
											Object.entries(selectables).forEach(
												([uuid, selectable]) => {
													const { id } = selectable;

													if (id && !selectableUUIDtoID.hasOwnProperty(uuid)) {
														selectableUUIDtoID[uuid] = id;
													}
												}
											);
										}
									});
								}

								// Add component to component map
								componentMap[componentUUID] = xml_id ? xml_id : getXmlID(cc_id, iteration_id)
							});
						}
					});
				}
			}
		});
	} catch (e) {
		console.log(e);
	}

	return { selectableUUIDtoID, componentMap };
};

const getUseCaseMap = (useCases) => {
	let useCaseMap = {};
	try {
		if (useCases && Object.keys(useCases).length > 0) {
			Object.entries(useCases).forEach(([uuid, useCase]) => {
				const { xmlTagMeta } = useCase;
				if (
					xmlTagMeta &&
					xmlTagMeta.hasOwnProperty("attributes") &&
					xmlTagMeta.attributes.hasOwnProperty("id")
				) {
					let id = xmlTagMeta.attributes.id;
					if (!useCaseMap.hasOwnProperty(uuid)) {
						useCaseMap[uuid] = id;
					}
				}
			});
		}
	} catch (e) {
		console.log(e);
	}
	return useCaseMap;
};

const getSARComponents = (
	allSARElements,
	initialComponents,
) => {
	let components = [];
	try {
		if (initialComponents && Object.keys(initialComponents).length > 0) {
			Object.entries(initialComponents).forEach(
				([componentUUID, initialComponent]) => {
					const {
						name,
						ccID,
						summary,
						elementIDs
					} = initialComponent;

					const elements = elementIDs.map(elementUUID => allSARElements[elementUUID]);
					let component = [
						{
							"a-component": {
								"@cc-id": ccID ? ccID.toLowerCase() : "",
								"@name": name ? name : "",
								"#": [
									summary,
									getSARElements(elements),
								],
							},
						},
					];

					// Set component
					if (!components.includes(component)) {
						components.push(component);
					}
				}
			);
		}
	} catch (e) {
		console.log(e);
	}
	return components;
};

const getSARElements = (
	initialElements,
) => {
	let elements = [];
	try {
		initialElements.forEach(element => {
			// Get SAR element
			const { aactivity, note, title, type } = element;
			try {
				// Return elements here
				let formattedElement = {
					"a-element": {
						"@type": type,
						"#": [
							{ title: title },
							note ? { note: note } : "",
							{ aactivity: aactivity }
						],
					},
				};

				if (!elements.includes(formattedElement)) {
					elements.push(formattedElement);
				}
			} catch (e) {
				console.log(e);
			}
		});
	} catch (e) {
		console.log(e);
	}
	return elements;
};

const getXmlID = (ccID, iterationID) => {
	if (ccID) {
		let xmlID = ccID
			.valueOf()
			.toLowerCase()
			.replaceAll("_", "-")
			.replaceAll(".", "-");
		if (iterationID && iterationID.length > 0) {
			iterationID = "-" + iterationID.toLowerCase();
			xmlID += iterationID;
		}
		return xmlID;
	}
};

const getAbbreviation = (input) => {
	const regex = /\([^)]*\)/i;
	return String(regex.exec(input)).replace(/[()]/g, "");
};

const getTitle = (input) => {
	return String(input)
		.replace(/\([^)]*\)/, "")
		.trim();
};

/**
 * Quill editor defaults to enclosing text within a paragraph tag when storing in redux slice, want to remove this on export
 * @param {*} text
 * 
 */
const removeEnclosingPTag = (text) => {
	return text.replace(/^<p>(.*?)<\/p>$/s, '$1');
}

export const {
	SET_CONFORMANCE_CLAIMS,
	SET_TECH_TERMS,
	SET_USE_CASES,
	SET_SECURITY_PROBLEM_DEFINITION_SECTION,
	SET_SECURITY_OBJECTIVES_SECTION,
	SET_COMMON_CORE,
	SET_META_DATA,
	SET_PACKAGES,
	SET_MODULES,
	SET_INTRODUCTION,
	SET_SECURITY_REQUIREMENTS,
	SET_OVERALL_STATE,
	SET_PP_PREFERENCE,
	SET_FORMATTED_XML,
	SET_BIBLIOGRAPHY,
	SET_APPENDICES,
	RESET_EXPORT
} = exportSlice.actions;

export default exportSlice.reducer;
