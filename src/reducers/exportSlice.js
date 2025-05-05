// Imports
import { current, createSlice } from "@reduxjs/toolkit";
import validator from 'validator';
import { deepCopy } from "../utils/deepCopy";
import basePPExport from '../../public/data/base_data/base_export_pp_fp.json'
import SecurityComponents from "../utils/securityComponents";

const initialPPState = basePPExport

// Populated normally, and then run XML export serialization
// TODO: look at making the abbr to a dedicated field
// TODO: Refactor terms so that we don't repeat code here
export const exportSlice = createSlice({
	name: "export",
	initialState: initialPPState,
	reducers: {
		SET_PP_TYPE_TO_PACKAGE: (state, action) => {
			if (state.overallObject["PP"]) {
				state.overallObject["Package"] = state.overallObject.PP;
				delete state.overallObject.PP;
			}
		},
		SET_PP_TYPE_TO_PP: (state, action) => {
			if (state.overallObject["Package"]) {
				state.overallObject.PP = state.overallObject["Package"]
				delete state.overallObject["Package"];
			}
		},
		SET_TECH_TERMS: (state, action) => {
			const suppressArray = [];

			if (action.payload.hasOwnProperty("techTerms")) {
				const reformatted = Object.entries(action.payload.techTerms).map(
					([key, value]) => {
						// Only parse if its a UUID (signifying an actual term)
						if (validator.isUUID(key)) {
							const term = action.payload.techTerms[key]
							return {
								"@full": getTitle(term.title),
                                ...(term.xmlTagMeta.attributes.abbr && { "@abbr": term.xmlTagMeta.attributes.abbr }),
								"#": removeEnclosingPTag(term.definition)
							};
						}
					}
				).filter(Boolean); // Remove undefined values

				// Add suppressed terms (if any)
				if (action.payload.hasOwnProperty("suppressedTerms")) {
					Object.entries(action.payload.suppressedTerms).forEach(([key, value]) => {
						if (validator.isUUID(key)) {
							suppressArray.push(getTitle(value.title));
						}
					});
				}

				// Format tech-term by file type
				switch (state.fileType) {
					case "Mobile Device": {
						state.techTerms = {
							"cc:term": reformatted,
							"cc:suppress": suppressArray,
						};
						break;
					}
					default: {
						state.techTerms = {
							term: reformatted,
							suppress: suppressArray,
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

			if (reformatted.length != 0) {
				state.useCases = {
					usecase: reformatted,
				};
			}
			
		},
		SET_SECURITY_PROBLEM_DEFINITION_SECTION: (state, action) => {
			const {
				securityProblemDefinition,
				threats,
				assumptions,
				objectiveTerms,
				OSPs,
				ppTemplateVersion,
			} = action.payload;

			const docType = state.overallObject["PP"] ? "PP" : "Package"

			// Set the security problem definition section
			let reformattedThreats
			if (ppTemplateVersion === 'CC2022 Direct Rationale' && threats) {
				reformattedThreats = constructDirectRationaleThreats(threats)
			} else {
				reformattedThreats = getThreatsAndAssumptionsHelper(
					threats,
					objectiveTerms,
					"Threats"
				);
			}

			let reformattedAssumptions = getThreatsAndAssumptionsHelper(
				assumptions,
				objectiveTerms,
				"Assumptions"
			);
			let reformattedOSPs = getThreatsAndAssumptionsHelper(
				OSPs,
				objectiveTerms,
				"OSPs"
			);

			// If all the sections are empty, remove the Security Problem Definition Section
			if (Object.keys(reformattedThreats).length === 0 && Object.keys(reformattedAssumptions).length === 0 && Object.keys(reformattedOSPs).length === 0) {
				delete state.overallObject[docType]["sec:Security_Problem_Definition"];
			} else {
				// Organizational Security Policies section is needed for PPs
				if (docType == "PP") {
					reformattedOSPs = {
						OSPs: {}
					}
				}
				
				state.overallObject[docType]["sec:Security_Problem_Definition"] = {
					"#": removeEnclosingPTag(securityProblemDefinition),
					"!1": " 3.1 Threats ",
					"sec:Threats": reformattedThreats,
					"!2": " 3.2 Assumptions ",
					"sec:Assumptions": reformattedAssumptions,
					"!3": " 3.3 Organizational Security Policies ",
					"sec:Organizational_Security_Policies": reformattedOSPs,
				};
			}
		},
		SET_SECURITY_OBJECTIVES_SECTION: (state, action) => {
			const { toe, operationalEnvironment, objectivesToSFRs } = action.payload;
			const docType = state.overallObject["PP"] ? "PP" : "Package"

			// Remove section if there is no content
			if (!(toe || operationalEnvironment) && Object.keys(objectivesToSFRs).length === 0) {
				delete state.overallObject[docType]["sec:Security_Objectives"];
				return
			}

			// Get Security_Objectives_for_the_TOE
			if (toe) {
				const reformattedTOE = getSecurityObjectives(toe.terms, objectivesToSFRs);
				state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_for_the_TOE"] = {
					"#": toe.definition,
					SOs: {
						SO: reformattedTOE,
					},
				};
			} else {
				delete state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_for_the_TOE"];
			}

			// Get Security_Objectives_for_the_Operational_Environment
			if (operationalEnvironment) {
				const reformattedOperationalEnvironment = getSecurityObjectives(
					operationalEnvironment.terms,
					objectivesToSFRs
				);
				state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_for_the_Operational_Environment"] = {
					"#": operationalEnvironment.definition,
					SOEs: {
						SOE: reformattedOperationalEnvironment,
					},
				};
			} else {
				delete(state.overallObject[docType][["sec:Security_Objectives"]["sec:Security_Objectives_for_the_Operational_Environment"]])
			}
		},
		SET_META_DATA: (state, action) => {
			const { ppName, author, keywords, releaseDate, version, revisionHistory, xmlTagMeta } = action.payload.metaData;
			const ppType = action.payload.ppType

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
					PPAuthor: author,
					PPPubDate: releaseDate,
					Keywords: keywords
				},
			};

			const docType = ppType == "Protection Profile" ? "PP" : "Package"

			// TODO: Revision history clipping off a number on import
			state.overallObject[docType].PPReference = reformattedReference;
			state.overallObject[docType].RevisionHistory = reformattedRevisionHistory;

			// Set initial main PP or Functional Package tags
			if (xmlTagMeta.hasOwnProperty("attributes")) {
				const { attributes } = xmlTagMeta;
				if (attributes.hasOwnProperty("name")) {
					state.overallObject[docType]["@name"] = attributes["name"]
				}
				if (attributes.hasOwnProperty("boilerplate")) {
					state.overallObject[docType]["@boilerplate"] = attributes["boilerplate"]
				}
				if (attributes.hasOwnProperty("target-product")) {
					state.overallObject[docType]["@target-product"] = attributes["target-product"]
				}
				if (attributes.hasOwnProperty("target-products")) {
					state.overallObject[docType]["@target-products"] = attributes["target-products"]
				}
				if (attributes.hasOwnProperty("xmlns")) {
					state.overallObject[docType]["@xmlns"] = attributes["xmlns"]
				}
				if (attributes.hasOwnProperty("xmlns:h")) {
					state.overallObject[docType]["@xmlns:h"] = attributes["xmlns:h"]
				}
				if (attributes.hasOwnProperty("xmlns:cc")) {
					state.overallObject[docType]["@xmlns:cc"] = attributes["xmlns:cc"]
				}
				if (attributes.hasOwnProperty("xmlns:sec")) {
					state.overallObject[docType]["@xmlns:sec"] = attributes["xmlns:sec"]
				}
				if (attributes.hasOwnProperty("xmlns:htm")) {
					state.overallObject[docType]["@xmlns:htm"] = attributes["xmlns:htm"]
				}
				if (attributes.hasOwnProperty("short")) {
					state.overallObject[docType]["@short"] = attributes["short"]
				}

			}
		},
		SET_PACKAGES: (state, action) => {
			const packages = action.payload.packages;
			let packageArr = [];
			const docType = state.overallObject["PP"] ? "PP" : "Package"

			if (packages.length == 0) {
				delete state.overallObject[docType]["include-pkg"];
				return
			}

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

			state.overallObject[docType]["include-pkg"] = packageArr;
		},
		SET_MODULES: (state, action) => {
			const modules = action.payload.modules.xml;

			// TODO: Complete, need to parse in modules by field, instead of full xml
			if (typeof (modules) === "object" && modules.length != 0) {
				const docType = state.overallObject["PP"] ? "PP" : "Package"
				state.overallObject[docType]["modules"] = modules.payload.modules;
			}
		},
		SET_PP_PREFERENCE: (state, action) => {
			const ppPreference = action.payload.ppPreference

			if (ppPreference.hasOwnProperty("xml") && ppPreference.xml.hasOwnProperty("payload") && ppPreference.xml.payload.hasOwnProperty("preference")) {
				const docType = state.overallObject["PP"] ? "PP" : "Package"

				state.overallObject[docType]["pp-preferences"] = ppPreference.xml.payload.preference;
			}
		},
		SET_INTRODUCTION: (state, action) => {
			const intro = action.payload.introduction.formItems;
			const ctoeData = action.payload.compliantTargets
			const { xml: platformXML } = action.payload.platformData;
			const sec_overview_section = intro.find(
				(formItem) => formItem.title == "Objectives of Document"
			).xmlTagMeta.tagName;
			const sec_overview_text = removeEnclosingPTag(intro.find(
				(formItem) => formItem.title == "Objectives of Document"
			).text);
			const ppType = action.payload.ppType;
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

			let sections = [];
			let CTOE = {};
			const toe_usage = createToe("TOE Usage", intro);
			
			if (ppType == "Protection Profile") {
				const toe_overview = createToe("TOE Overview", intro);
				const toe_boundary = createToe("TOE Overview", intro, "TOE Boundary");
				const toe_platform = createToe("TOE Overview", intro, "TOE Platform");
				const toe_list = [toe_overview, toe_boundary, toe_platform];
			
				// Add TOE Overview
				sections.push({
					"@title": "Compliant Targets of Evaluation",
					"@id": "TOEdescription",
					"#": toe_list,
				})
			} else {
				CTOE = {
					"componentsneeded": {
						"componentneeded": ctoeData.rowData.map(row => {
							const {componentID, notes} = row;
							return { componentid: componentID, notes: notes} }
							
						)
					}
				}
			}

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
				// Conditionally add CTOE section
				...(ppType === "Functional Package" && {
					"sec:Compliant_Targets_of_Evaluation": {
						"#": [ctoeData.introText, CTOE, ctoeData.additionalText]
					}
				}),
				section: sections,
				"sec:Use_Cases": {
					"#": [
						toe_usage,
						useCaseState && useCaseState.hasOwnProperty("usecase") && useCaseState.usecase.length > 0 ? { usecases: useCaseState } : "",
					]
				}
			};

			// Delete use case section if it is an empty object
			if (Object.keys(useCaseState).length === 0) {
				delete formattedIntroduction["sec:Use_Cases"];
			}

			state.overallObject[state.overallObject.PP ? "PP" : "Package"]["sec:Introduction"] = formattedIntroduction
		},
		SET_CONFORMANCE_CLAIMS: (state, action) => {
			const { conformanceClaims } = action.payload;
			const docType = state.overallObject["PP"] ? "PP" : "Package"


			if (action.payload.ppTemplateVersion == "Version 3.1") {
				const emptyConformanceSection = Object.values(conformanceClaims).every(editor => editor.text.trim() === "");

				if (emptyConformanceSection) {
					state.overallObject[docType]["sec:Conformance_Claims"] = {};
				} else {
					state.overallObject[docType]["sec:Conformance_Claims"] = setConformanceClaimsTo3_1(state.fileType, conformanceClaims);
				}
			} else {
				state.overallObject[docType]["sec:Conformance_Claims"] = setConformanceClaimsToCC2022(action.payload.conformanceClaims, action.payload.ppTemplateVersion);
			}
		},
		SET_SECURITY_REQUIREMENTS: (state, action) => {
			const sfrSections = action.payload.securityRequirements
				? deepCopy(action.payload.securityRequirements)
				: {};
			const useCases = action.payload.useCases
				? deepCopy(action.payload.useCases)
				: {};

			const { sars, platforms, auditSection } = action.payload
			const { title, definition, formItems } = sfrSections;
			const docType = state.overallObject["PP"] ? "PP" : "Package"


			try {
				// Get selectable ids from uuid
				const { selectableUUIDtoID, componentMap } = getSelectableMap(formItems);
				const useCaseMap = getUseCaseMap(useCases);
				let auditTableExists = false;

				// Get sfr sections
				let sfrSections = formItems.map((sfr, sfrIndex) => {
					const { nestedFormItems, text, title } = sfr;

					if (nestedFormItems && title) {
						if (title == "Security Functional Requirements") {
							const { formItems } = nestedFormItems;
							let innerSections = [];
							let implementSet = new Set([])

							if (formItems && formItems.length > 0) {
								// Filter through to grab cc_ids to see if FAU_GEN.1 exists
								const ccIds = formItems.flatMap((item) =>
									item.components ?
										Object.values(item.components).map((component) => {
											const { cc_id } = component;
											if (cc_id !== undefined) {
												return cc_id.toLowerCase();
											}
										}) : []
								);
								auditTableExists = ccIds.includes("fau_gen.1") || docType == "Package";

								// Get section values
								innerSections = formItems.map((section, sfrSectionIndex) => {
									const sectionID = `5.${sfrIndex + 1}.${sfrSectionIndex + 1}`;
									const { title, definition, extendedComponentDefinition, components } = section;
									let findValues = title.split(/\(([^)]+)\)/);
									const id =
										findValues && findValues.length > 1
											? findValues[1].trim().toLowerCase()
											: "";
									const formattedExtendedComponentDefinition = getFamilyExtendedComponentDefinition(
										extendedComponentDefinition
									);
									let { formattedComponents, implementSection } = getSfrComponents(
										components,
										selectableUUIDtoID,
										componentMap,
										useCaseMap,
										platforms,
										state.fileType,
										auditTableExists
									);

									// Add to implement set and compute at the last sfr section to account for all implement items
									implementSet = new Set([...implementSet, ...implementSection])
									let formattedImplementSection = []

									if (sfrSectionIndex === Object.keys(formItems).length - 1) {
										const implementArray = Array.from(implementSet)
										formattedImplementSection = formatImplementSection(state, implementArray)
									}

									return [
										{ "!": `${sectionID} ${title ? title : ""}` },
										{
											section: {
												"@id": id,
												"@title": title ? title : "",
												"#": [
													definition,
													formattedExtendedComponentDefinition,
													formattedComponents,
													formattedImplementSection
												],
											},
										},
									];
								});
							}

							return {
								"@title": title,
								"#": [
									text ? text : "",
									innerSections
								],
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
					delete state.overallObject[docType]["sec:req"];
				}

				if (sfrSections.find(section => section["@title"] == "Security Assurance Requirements")) {
					state.overallObject[docType][state.fileType === "General-Purpose Computing Platforms" ? "sec:Security_Requirements" : "sec:req"] = {
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
				} else { // Packages normally won't have SARs, and will not have a parent <sec:req>, but solely the <sec:Security_Functional_Requirements>
					// Creating a new object to replace overallObject with, since we need to preserve order and replace the sec:req key with sec:Security_Functional_Requirements
					const originalPackage = state.overallObject[docType];
					const newPackage = {};

					Object.keys(originalPackage).forEach(key => {
						if (key === "sec:req") {
							const sfrSection = sfrSections.find(section => section["@title"] === "Security Functional Requirements");
							const { ["@title"]: _, ...cleanedSfrSection } = sfrSection; // Remove @title
							
							newPackage["sec:Security_Functional_Requirements"] = {
								"#": [
									auditTableExists ? auditSection : "",
									cleanedSfrSection
								]
							}
						} else {
							newPackage[key] = originalPackage[key];
						}
					});

					state.overallObject[docType] = newPackage;
				}
			} catch (e) {
				console.log(e);
			}
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
			const docType = state.overallObject["PP"] ? "PP" : "Package"

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
				delete state.overallObject[docType].bibliography;
				state.overallObject[docType] = { ...state.overallObject[docType], ["bibliography"]: formattedBibliography };
			} else {
				state.overallObject[docType].bibliography = formattedBibliography;
			}
		},
		SET_DISTRIBUTED_TOE: (state, action) => {
			if (action.payload.state.intro.length === 0) {
                delete state.overallObject.PP.section
                return
			}
			
			const attributes = action.payload.state.xmlTagMeta.attributes
			const subSections = action.payload.subSections
			let formattedSubsections = []
			const docType = state.overallObject["PP"] ? "PP" : "Package"

			if (subSections) {
				subSections.forEach((section) => {
					let formattedSection = {
						"@title": section.title,
						...(section.xmlTagMeta.attributes.hasOwnProperty("id") && section.xmlTagMeta.attributes.id ? { "@id": section.xmlTagMeta.attributes.id } : {}),
						"#": section.text
					}
					formattedSubsections.push(formattedSection)
				})
			}

			const introFormatted = {
				"@title": attributes.hasOwnProperty("title") ? attributes.title : 'Introduction to Distributed TOEs',
				...(attributes.hasOwnProperty("id") && attributes.id ? { "@id": attributes.id } : {}),
				"#": action.payload.state.intro
			};

			state.overallObject[docType].section = {
				"#": introFormatted,
				"section": [...formattedSubsections]
			};
		},
		SET_APPENDICES: (state, action) => {
			let appendices = [];
			const docType = state.overallObject["PP"] ? "PP" : "Package"
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
				delete state.overallObject[docType].appendix;
				state.overallObject[docType] = { ...state.overallObject[docType], ["appendix"]: formattedAppendix };
			} else {
				state.overallObject[docType].appendix = formattedAppendix;
			}
		},
		RESET_EXPORT: () => initialPPState
	},
});

// Local Methods
const formatImplementSection = (state, implementSection) => {
	let features = new Set([])

	try {
		// Get features
		if (implementSection && implementSection.length > 0) {
			implementSection.forEach((feature) => {
				const { id, title, description } = feature
				features.add({
					"@id": id,
					"@title": title,
					"description": description
				})
			})

			// Add to state
			const formattedFeatures = Array.from(features)
			return {
				implements: {
					feature: formattedFeatures
				}
			}
		}
	} catch (e) {
		console.log(e)
	}
	return {}
}

const constructDirectRationaleThreats = (threats) => {
	// if PP is CC2022 Direct Rationale, use new format for threats
	let output = ''
	if (!Object.hasOwn(threats, 'terms')) {
		return output
	}
	let terms = threats.terms
	// iterate through terms
	Object.keys(terms).forEach(key => {
		output += `<threat name="${terms[key].title}">`
		output += `<description>${terms[key].definition}</description>`
		if (!Object.hasOwn(terms[key], 'sfrs') || terms[key].sfrs.length === 0) return
		output += `<!-- New mapping to build updated threat mapping table. -->`
		// iterate through each term's sfrs
		terms[key].sfrs.forEach((sfr) => {
			output += sfr.type != "" ? `<addressed-by>${sfr.name} (${sfr.type}</addressed-by>` : `<addressed-by>${sfr.name}</addressed-by>`
			output += `<rationale>${sfr.rationale}</rationale>`
		})
		output += `</threat>`
	})
	output = '<threats>' + output
	output += '</threats>'
	return output
}

const getThreatsAndAssumptionsHelper = (input, objectiveTerms, type) => {
	try {
		if (input) {
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
			} else if (type === "OSPs") {
				finalSectionJson = {
					"#": definition && definition !== "" ? definition : "",
					OSPs: {
						OSP: reformatted,
					},
				};
			}
			return finalSectionJson;
		} else {
			return {}
		}
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

const getFamilyExtendedComponentDefinition = (extendedComponentDefinition) => {
	let formattedExtendedComponentDefinition = [];

	try {
		if (extendedComponentDefinition && extendedComponentDefinition.length > 0) {
			formattedExtendedComponentDefinition = extendedComponentDefinition.map((def) => {
				const { title, famId, famBehavior } = def
				return {
					"ext-comp-def": {
						"@title": title ? title : "",
						"@fam-id": famId ? famId : "",
						"fam-behavior": famBehavior ? famBehavior : "",
					}
				}
			})
		}
	} catch (e) {
		console.log(e)
	}

	return formattedExtendedComponentDefinition
}

const getSfrComponents = (
	initialComponents,
	selectableUUIDtoID,
	componentMap,
	useCaseMap,
	platforms,
	fileType,
	auditTableExists
) => {
	let formattedComponents = new Set([]);
	let implementSection = new Set([]);
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
					let { formattedCcId, formattedIterationId, componentXmlId } = SecurityComponents.getComponentXmlID(cc_id, iteration_id, false, true)
					let component = [
						{ "!": componentName },
						{
							"f-component": {
								"@cc-id": cc_id ? cc_id.toLowerCase() : "",
								"@id": xml_id ? xml_id : componentXmlId,
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
										formattedCcId,
										formattedIterationId,
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
					formattedComponents = new Set([...formattedComponents, ...component])

					// Add to implement section
					if (reasons && reasons.length > 0) {
						const implementSet = new Set(reasons)
						implementSection = new Set([...implementSection, ...implementSet]);
					}
				}
			);
		}
	} catch (e) {
		console.log(e);
	}

	return {
		formattedComponents: Array.from(formattedComponents),
		implementSection: Array.from(implementSection)
	};
};

const getSfrElements = (
	initialElements,
	selectableUUIDtoID,
	componentUUID,
	formattedCcId,
	formattedIterationId,
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
							? deepCopy(evaluationActivities[componentUUID])
							: null;
					let elementEvaluationActivity =
						evaluationActivities &&
							evaluationActivities.hasOwnProperty(elementUUID)
							? deepCopy(evaluationActivities[elementUUID])
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
					let { elementXMLID, note } =
						element;

					try {
						// Generate the elementXMLID if one does not already exist
						if (!elementXMLID || elementXMLID === "") {
							elementXMLID = SecurityComponents.getElementId(formattedCcId, formattedIterationId, index, true)
						}

						// Return elements here
						let formattedElement = {
							"f-element": {
								"@id": elementXMLID,
								"#": [
									{
										title: parseElement(element),
									},
                                    element.extCompDefTitle
                                    ? {
                                        "ext-comp-def-title": element.extCompDefTitle,
                                      }
                                    : null,
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
                if (item.text === "." && result.endsWith(" ")) {
                    // if last thing in result is a space, remove it before adding period
                    result = result.trimEnd()
                }
				result += item.text;
			} else if (item.description) {
				result += item.description;
			} else if (item.assignment) {
				result += ` <assignable>${selectables[item.assignment].description}</assignable> `;
			} else if (item.selections) {
				const group = selectableGroups[item.selections]
				const onlyone = group.onlyOne ? ` onlyone="yes"` : "";
				const linebreak = group.linebreak ? ` linebreak="yes"` : "";

				const formattedSelectables = ` <selectables${onlyone}${linebreak}>${parseSelections(item.selections)} </selectables> `
				result += formattedSelectables;
			} else if (assignmentEdgeCase) {
				const validKey = item.groups[0]
				if (!selectables[validKey])
					return

				const { description } = selectables[validKey]

				result += ` <assignable>${description}</assignable> `

			} else if (item.tabularize) {
				result += parseTabularize(tabularize)
			}
			else {
                const group = selectableGroups[item.groups]
                const onlyone = group?.onlyOne ? ` onlyone="yes"` : "";
				const linebreak = group?.linebreak ? ` linebreak="yes"` : "";
				result += ` <selectables${onlyone}${linebreak}>`
				item.groups.forEach(groupKey => {
					result += parseSelections(groupKey)
				})
				result += "</selectables> "
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
			definition.forEach(({ value, type }) => {
				if (value !== "Selectable ID")
					formattedTabularize += `<${type}>${value}</${type}>`
			})

			formattedTabularize += `</tabularize>`

			formattedTabularizeTablesList += formattedTabularize;

			rows.forEach(row => {
				const { selectableId, identifier } = row;

				// Pack the contents of this table into an array for easier parsing
				const selections = Object.values(row)
				formattedTabularizeTablesList += `<selectable id="${selectableId}">`
				if (identifier)
					formattedTabularizeTablesList += `<col>${identifier}</col>`
				selections.forEach(selection => {
					if (Array.isArray(selection))
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

		try {
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
		} catch (e) {
			console.log(e)
		}

		return result;
	}


	function createAActivityAndNote(evaluationActivity, notes) {
		const { tss, guidance, testIntroduction, testClosing, testList, isNoTest, noTest, refIds } = evaluationActivity;
		let result = "";

		// Create application notes
		if (notes) {
			notes.forEach((appNote) => {
				const { note, refIds: ids } = appNote;

				// Add initial starting tag
				result += `<app-note>`;

				// Add in refIds if they exist
				result += createRefIdTags(ids);

				// Add ending tag
				result += `${note ? note : ""}</app-note>`;
			});
		}

		// Add in no test if present
		if (isNoTest) {
			result += `<no-tests>${noTest}</no-tests>`;
		}
		// Add in evaluation activity
		else {
			// Create formatted test list
			let formattedTestList = ''
			testList.forEach((element) => {
				const { description, tests } = element
				formattedTestList += description
				formattedTestList += `<testlist>`
				tests.forEach(test => formattedTestList += `<test>${test.objective}</test>`)
				formattedTestList += `</testlist>`

			})
			formattedTestList += testClosing

			// Create formatted ref-id section
			const formattedRefIds = createRefIdTags(refIds)

			result += `
				<aactivity>
					${formattedRefIds}
					<TSS>${tss}</TSS>
					<Guidance>${guidance}</Guidance>
					<Tests>${testIntroduction}${formattedTestList}</Tests>
				</aactivity>
			`
		}
		return result;
	}
	
	// Creates the ref-id tags
	function createRefIdTags(refIds) {
		let refIdTags = '';
		if (refIds && refIds.length > 0) {
			refIds.forEach((refId) => {
				if (refId) {
					refIdTags += `<also ref-id="${refId}"/>`;
				}
			});
		}
		return refIdTags;
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
				const { id } = reason
				let formattedReason = {
					"@on": id
				};

				// Add formatted reason
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
								const formattedID = { "@on-incl": id };
								if (!fComponent["depends"].includes(formattedID)) {
									fComponent["depends"].push(formattedID);
								}
							}
						});
					}

					// Get selections
					selections.selections.forEach((selection) => {
						// if the dependency ID doesn't map back to a selectable, it could be a complex selectable, so
						// just retain the name
						const id = selectableUUIDtoID[selection] ? selectableUUIDtoID[selection] : selection;

						const formattedID = { "@on-sel": id };
						if (!fComponent["depends"].includes(formattedID)) {
							fComponent["depends"].push(formattedID);
						}
					});
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
			const { introduction, tss, guidance, testIntroduction, testClosing, testList, isNoTest, noTest } = evaluationActivity;

			if (isNoTest) {
				formattedEvaluationActivity.aactivity["no-tests"] = noTest;
			} else {
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

					// Get TSS (Ensuring empty tag is present if there is no TSS)
					formattedEvaluationActivity.aactivity.TSS = tss && tss !== "" ? tss : "";

					// Get Guidance (Ensuring empty tag is present if no Guidance)
					formattedEvaluationActivity.aactivity.Guidance = guidance && guidance !== "" ? guidance : "";

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
												const { id, dependencies, objective, nestedTests } = test;
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

													const formatTest = (test) => {
														return {
															...(test.id && { "@id": test.id }),
															"#": [
																test.dependencies || [],
																test.objective || "",
																...(Array.isArray(test.nestedTests) && test.nestedTests.length > 0
																	? [{ testlist: { test: test.nestedTests.map(formatTest) } }]
																	: []
																)
															]
														};
													}

													const formattedTest = {
														test: formatTest({ id, dependencies: formattedDependencies, objective, nestedTests })
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
								"#": [intro, formattedTestLists, testClosing],
							};
						}
					} else {
						// Ensure an empty <Tests/> tag is added when missing
						formattedEvaluationActivity.aactivity.Tests = "";
					}
				} else {
					// Ensure empty tags if no evaluation activities exists
					formattedEvaluationActivity.aactivity.TSS = "";
					formattedEvaluationActivity.aactivity.Guidance = "";
					formattedEvaluationActivity.aactivity.Tests = "";
				}
			}

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
								componentMap[componentUUID] = xml_id ? xml_id : SecurityComponents.getComponentXmlID(cc_id, iteration_id, false, false)
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
						elementIDs,
						optional
					} = initialComponent;

					const elements = elementIDs.map(elementUUID => allSARElements[elementUUID]);
					let component = [
						{
							"a-component": {
								"@cc-id": ccID ? ccID.toLowerCase() : "",
								"@name": name ? name : "",
								...(optional && { "@status": "optional" }), // Dynamically add status attribute if optional is true
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

const setConformanceClaimsTo3_1 = (fileType, formItems) => {
	let formattedConformance = {
		"@boilerplate": "no",
	};

	// Set conformance claims by file type
	switch (fileType) {
		case "Mobile Device": {
			formattedConformance["cc:cclaims"] = {
				"cc:cclaim": Object.values(formItems).map((claim) => {
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
				cclaim: Object.values(formItems).map((claim) => {
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
	return formattedConformance
}
const setConformanceClaimsToCC2022 = (conformanceClaims, ppTemplateVersion) => {
	let formattedConformance = {
		"@boilerplate": "no",
	};

    const cclaimInfo = (conformanceClaims)
    const {
        stConformance,
        part2Conformance,
        part3Conformance,
        cc_errata,
        ppClaims,
        packageClaims,
        evaluationMethods,
        additionalInformation
    } = cclaimInfo;

    // Generate package claim
    let ppConformance = []
    let ppConfiguration = []
    ppClaims.forEach(claim => {
        const { pp, text, status } = claim

        // Generate ppClaim
        if (text && status) {
            const formattedPpClaim = { [pp ? "PP-cc-ref" : "Mod-cc-ref"]: text }

            if (status.includes("Conformance") && !ppConformance.includes(formattedPpClaim)) {
                ppConformance.push(formattedPpClaim)
            }
            if ((status.includes("Configuration") || status.length < 1) && !ppConfiguration.includes(formattedPpClaim)) {
                ppConfiguration.push(formattedPpClaim)
            }
        }
    })

    // Format conformance
    formattedConformance["CClaimsInfo"] = {
        "@cc-version": "cc-2022r1",
        "@cc-approach": ppTemplateVersion === "CC2022 Standard" ? "standard" : "direct-rationale",
        ...(cc_errata !== "N/A" && { "@cc-errata": cc_errata }),
        "cc-st-conf": stConformance,
        "cc-pt2-conf": part2Conformance,
        "cc-pt3-conf": part3Conformance,
        "cc-pp-conf": {
            "#": ppConformance
        },
        "cc-pp-config-with": {
            "#": ppConfiguration
        },
        "cc-pkg-claim": {
            "#": packageClaims.map(claim => {
                const { functionalPackage, conf, text } = claim

                return {
                    [functionalPackage ? "FP-cc-ref" : "AP-cc-ref"]: {
                        "@conf": conf,
                        "#": text
                    }
                }
            })
        },
    }
    if (evaluationMethods.length > 0) {
        formattedConformance["CClaimsInfo"]["cc-eval-methods"] = {
            "EM-cc-ref": evaluationMethods
        };
    }
    if (additionalInformation) {
        formattedConformance["CClaimsInfo"]["cc-claims-addnl-info"] = removeEnclosingPTag(additionalInformation)
    }

	return formattedConformance
}

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
							note ? { note: getNote(note) } : "",
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
	SET_PP_TYPE_TO_PACKAGE,
	SET_PP_TYPE_TO_PP,
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
	RESET_EXPORT,
	SET_DISTRIBUTED_TOE
} = exportSlice.actions;

export default exportSlice.reducer;
