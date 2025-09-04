// Imports
import { current, createSlice, original } from "@reduxjs/toolkit";
import validator from "validator";
import { defaultAudit } from "./SFRs/sfrBasePPsSlice.js";
import { deepCopy } from "../utils/deepCopy";
import { getComponentXmlID, getElementId } from "../utils/securityComponents.jsx";
import basePPExport from "../../public/data/base_data/base_export_pp_fp.json";
import app from "../../public/data/sfr_components/app_cc2022.json";
import mdm from "../../public/data/sfr_components/mdm.json";
import gpcp from "../../public/data/sfr_components/gpcp_cc2022.json";
import gpos from "../../public/data/sfr_components/gpos_cc2022.json";
import mdf from "../../public/data/sfr_components/mdf.json";
import tls from "../../public/data/sfr_components/tls_cc2022.json";
import virtualization from "../../public/data/sfr_components/virtualization_cc2022.json";
import sfrSections from "../components/editorComponents/securityComponents/sfrComponents/SfrSections.jsx";
import { data } from "autoprefixer";

const initialPPState = basePPExport;

const sfrTypeMap = {
  implementationDependent: "Implementation-based",
  objective: "Objective",
  optional: "Optional",
  selectionBased: "Selection-based",
  useCaseBased: "Implementation-based", // *Believe use case is subset of implementation - Justin F.
};

const sfrPriority = {
  mandatory: 0,
  optional: 1,
  objective: 2,
  implementationDependent: 3,
  selectionBased: 4,
};

const moduleSfrPriority = {
  modified: 0,
  additional: 1,
  mandatory: 2,
  optional: 3,
  objective: 4,
  "implementation-dependent": 5,
  "selection-based": 6,
};

// Populated normally, and then run XML export serialization
export const exportSlice = createSlice({
  name: "export",
  initialState: initialPPState,
  reducers: {
    SET_PP_TYPE_TO_PACKAGE: (state) => {
      updateOverallObject(state, ["PP", "Module"], "Package");
    },
    SET_PP_TYPE_TO_PP: (state) => {
      updateOverallObject(state, ["Package", "Module"], "PP");
    },
    SET_PP_TYPE_TO_MODULE: (state) => {
      updateOverallObject(state, ["PP", "Package"], "Module");
    },
    SET_TECH_TERMS: (state, action) => {
      const suppressArray = [];

      if (action.payload.hasOwnProperty("techTerms")) {
        const reformatted = Object.entries(action.payload.techTerms)
          .map(([key, value]) => {
            // Only parse if its a UUID (signifying an actual term)
            if (validator.isUUID(key)) {
              const term = action.payload.techTerms[key];
              return {
                "@full": getTitle(term.title),
                ...(term?.xmlTagMeta?.attributes.abbr && { "@abbr": term.xmlTagMeta.attributes.abbr }),
                "#": term.definition,
              };
            }
          })
          .filter(Boolean); // Remove undefined values

        // Add suppressed terms (if any)
        if (action.payload.hasOwnProperty("suppressedTerms")) {
          Object.entries(action.payload.suppressedTerms).forEach(([key, value]) => {
            if (validator.isUUID(key)) {
              suppressArray.push(getTitle(value.title));
            }
          });
        }

        state.techTerms = {
          suppress: suppressArray,
          term: reformatted,
        };
      }
    },
    SET_USE_CASES: (state, action) => {
      const reformatted = Object.values(action.payload.useCases)
        .map((term) => {
          if (term) {
            const { title, definition, xmlTagMeta } = term;

            // Ignore if not an object (Use Case slice has title and open keys which are string and bool)
            if (term && definition && term.xmlTagMeta) {
              if (title.length != 0) {
                return {
                  "@title": title,
                  "@id": xmlTagMeta.attributes.id,
                  description: definition,
                };
              } else {
                return {
                  description: definition,
                };
              }
            }
          }
        })
        .filter((notUndefined) => notUndefined !== undefined);

      if (reformatted.length != 0) {
        state.useCases = {
          usecase: reformatted,
        };
      }
    },
    SET_SECURITY_PROBLEM_DEFINITION_SECTION: (state, action) => {
      const { sfrSections, securityProblemDefinition, threats, assumptions, objectiveTerms, OSPs, ppTemplateVersion, ppType, sfrMaps } = action.payload;

      const docType = getDocType(ppType);

      // Set the security problem definition section
      let reformattedThreats;
      if (ppTemplateVersion === "CC2022 Direct Rationale" && threats) {
        reformattedThreats = constructDirectRationaleThreats(threats, sfrSections, ppType, sfrMaps);
      } else {
        reformattedThreats = getThreatsAndAssumptionsHelper(threats, objectiveTerms, "Threats");
      }

      let reformattedAssumptions = getThreatsAndAssumptionsHelper(assumptions, objectiveTerms, "Assumptions");
      let reformattedOSPs = getThreatsAndAssumptionsHelper(OSPs, objectiveTerms, "OSPs");

      // If all the sections are empty, remove the Security Problem Definition Section
      if (Object.keys(reformattedThreats).length === 0 && Object.keys(reformattedAssumptions).length === 0 && Object.keys(reformattedOSPs).length === 0) {
        delete state.overallObject[docType]["sec:Security_Problem_Definition"];
      } else {
        // Organizational Security Policies section is needed for PPs/Modules
        if (docType == "PP" || docType == "Module") {
          reformattedOSPs = {
            OSPs: {},
          };
        }

        state.overallObject[docType]["sec:Security_Problem_Definition"] = {
          "#": securityProblemDefinition,
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
      try {
        const { toe, operationalEnvironment, objectivesToSFRs, objectivesDefinition } = action.payload;
        const ppType = action.payload.ppType;
        const docType = getDocType(ppType);

        // Remove section if there is no content
        if (!(toe || operationalEnvironment) && Object.keys(objectivesToSFRs).length === 0) {
          delete state.overallObject[docType]["sec:Security_Objectives"];
          return;
        }

        // Get Security_Objectives_for_the_TOE
        const hasSecurityObjectives = state.overallObject[docType]?.hasOwnProperty("sec:Security_Objectives");
        // Generate objective section if it does not exist
        if (!hasSecurityObjectives) {
          state.overallObject[docType]["sec:Security_Objectives"] = {};
        }

        // Add intro text if it exists
        if (objectivesDefinition.length !== 0) {
          state.overallObject[docType]["sec:Security_Objectives"] = {
            "#": objectivesDefinition,
            ...state.overallObject[docType]["sec:Security_Objectives"],
          };
        }

        // Get Security_Objectives_for_the_TOE
        if (toe) {
          const reformattedTOE = getSecurityObjectives(toe.terms, objectivesToSFRs, sfrSections);
          state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_for_the_TOE"] = {
            "#": toe.definition,
            SOs: {
              SO: reformattedTOE,
            },
          };
        } else if (state.overallObject[docType]["sec:Security_Objectives"].hasOwnProperty("sec:Security_Objectives_for_the_TOE")) {
          delete state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_for_the_TOE"];
        }

        // Get Security_Objectives_for_the_Operational_Environment
        if (operationalEnvironment) {
          const reformattedOperationalEnvironment = getSecurityObjectives(operationalEnvironment.terms, objectivesToSFRs);

          const { tagName, attributes } = operationalEnvironment.xmlTagMeta;
          const sectionTagName = tagName && attributes ? tagName : "sec:Security_Objectives_for_the_Operational_Environment";

          const sectionObject = {
            "#": operationalEnvironment.definition,
            ...(reformattedOperationalEnvironment.length > 0 && {
              SOEs: {
                SOE: reformattedOperationalEnvironment,
              },
            }),
          };

          // If import has different tag name, use that
          if (tagName != "" || Object.keys(attributes).length !== 0) {
            for (const [key, value] of Object.entries(attributes)) {
              sectionObject[`@${key}`] = value;
            }

            const secObjectives = state.overallObject[docType]["sec:Security_Objectives"];
            const newSecObjectives = {};

            for (const [key, value] of Object.entries(secObjectives)) {
              if (key === "sec:Security_Objectives_for_the_Operational_Environment") {
                // Replace the old key with the new one and new content
                newSecObjectives[sectionTagName] = sectionObject;
              } else {
                // Keep existing keys as is
                newSecObjectives[key] = value;
              }
            }

            // Replace the placeholder with the newly updated section
            state.overallObject[docType]["sec:Security_Objectives"] = newSecObjectives;
          } else {
            state.overallObject[docType]["sec:Security_Objectives"][sectionTagName] = sectionObject;
          }
        } else {
          delete state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_for_the_Operational_Environment"];
        }
      } catch (e) {
        console.log(e);
      }
    },
    SET_META_DATA: (state, action) => {
      const { ppName, author, keywords, releaseDate, version, revisionHistory, xmlTagMeta, customCSS } = action.payload.metaData;
      const ppType = action.payload.ppType;

      const docType = getDocType(ppType);

      // Reformat the revision history
      const fileType =
        xmlTagMeta.hasOwnProperty("attributes") && xmlTagMeta.attributes.hasOwnProperty("target-product") ? xmlTagMeta.attributes["target-product"] : "";
      state.fileType = fileType;
      const reformattedRevisionHistory = {
        entry: Object.values(revisionHistory).map((entry) => {
          return {
            version: entry.version,
            date: entry.date,
            subject: {
              "#": String(entry.comment)
                .split("\n")
                .map((item, index, array) => {
                  item = item.trim();
                  if (index !== array.length - 1) {
                    item += " ";
                  }
                  return item;
                }),
            },
          };
        }),
      };

      const reformattedReference = {
        ReferenceTable: {
          ...(ppName && { PPTitle: ppName }),
          ...(version && { PPVersion: version }),
          ...(author && { PPAuthor: author }),
          ...(releaseDate && { PPPubDate: releaseDate }),
          ...(keywords && { Keywords: keywords }),
        },
      };

      // TODO: Revision history clipping off a number on import
      state.overallObject[docType].PPReference = reformattedReference;
      state.overallObject[docType].RevisionHistory = reformattedRevisionHistory;

      // Set initial main PP or Functional Package tags
      if (xmlTagMeta.hasOwnProperty("attributes")) {
        const { attributes } = xmlTagMeta;
        if (attributes.hasOwnProperty("name")) {
          state.overallObject[docType]["@name"] = attributes["name"];
        }
        if (attributes.hasOwnProperty("boilerplate")) {
          state.overallObject[docType]["@boilerplate"] = attributes["boilerplate"];
        }
        if (attributes.hasOwnProperty("target-product")) {
          state.overallObject[docType]["@target-product"] = attributes["target-product"];
        }
        if (attributes.hasOwnProperty("target-products")) {
          state.overallObject[docType]["@target-products"] = attributes["target-products"];
        }
        if (attributes.hasOwnProperty("xmlns")) {
          state.overallObject[docType]["@xmlns"] = attributes["xmlns"];
        }
        if (attributes.hasOwnProperty("xmlns:h")) {
          state.overallObject[docType]["@xmlns:h"] = attributes["xmlns:h"];
        }
        if (attributes.hasOwnProperty("xmlns:cc")) {
          state.overallObject[docType]["@xmlns:cc"] = attributes["xmlns:cc"];
        }
        if (attributes.hasOwnProperty("xmlns:sec")) {
          state.overallObject[docType]["@xmlns:sec"] = attributes["xmlns:sec"];
        }
        if (attributes.hasOwnProperty("xmlns:htm")) {
          state.overallObject[docType]["@xmlns:htm"] = attributes["xmlns:htm"];
        }
        if (attributes.hasOwnProperty("short")) {
          state.overallObject[docType]["@short"] = attributes["short"];
        }
      }

      if (customCSS?.length != 0) {
        state.overallObject[docType]["extra-css"] = customCSS;
      } else {
        delete state.overallObject[docType]["extra-css"];
      }
    },
    SET_PACKAGES: (state, action) => {
      const packages = action.payload.packages;
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);

      let packageArr = [];
      if (packages.length == 0) {
        delete state.overallObject[docType]["include-pkg"];
        return;
      }

      packages.forEach((p) => {
        p = p.payload.pkg; // Unwrap from slice
        let dependsArr = [];

        p.depends.forEach((dep) => {
          const dependsAttr = Object.keys(dep)[0];
          const dependsValue = dep[dependsAttr];

          dependsArr.push({
            [`@${dependsAttr}`]: dependsValue,
          });
        });

        let singlePackage = {
          "@id": p.id,
          git: {
            url: p.git.url,
            branch: p.git.branch,
          },
          url: p.url,
          depends: dependsArr,
        };

        packageArr.push(singlePackage);
      });

      state.overallObject[docType]["include-pkg"] = packageArr;
    },
    SET_MODULES: (state, action) => {
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);
      const modules = action.payload.modules.xml;

      if (modules.length == 0) {
        delete state.overallObject[docType]["modules"];
        return;
      }

      // TODO: Complete, need to parse in modules by field, instead of full xml
      if (typeof modules === "object" && modules.length != 0) {
        state.overallObject[docType]["modules"] = modules.payload.modules;
      }
    },
    SET_PP_PREFERENCE: (state, action) => {
      const { ppPreference, ppType } = action.payload;

      if (ppPreference.hasOwnProperty("xml") && ppPreference.xml.hasOwnProperty("payload") && ppPreference.xml.payload.hasOwnProperty("preference")) {
        const docType = getDocType(ppType);

        state.overallObject[docType]["pp-preferences"] = ppPreference.xml.payload.preference;
      }
    },
    SET_CUSTOM_SECTIONS: (state, action) => {
      const { text, title, selectedSection, ppType } = action.payload;
      const docType = getDocType(ppType);
      const oldObject = state.overallObject[docType];
      let newObject = {};

      for (const [key, value] of Object.entries(oldObject)) {
        newObject[key] = value;
        if (key.startsWith("sec:") && key.slice(4).replace(/_/g, " ") === selectedSection) {
          newObject[`sec:${title.replace(/\s+/g, "_")}`] = {
            "#": text,
            "@previous_section": selectedSection,
          };
        }
      }
      state.overallObject[docType] = newObject;
    },
    SET_INTRODUCTION: (state, action) => {
      const intro = action.payload.introduction.formItems;
      const ctoeData = action.payload.compliantTargets;
      const { xml: platformXML } = action.payload.platformData;
      const sec_overview_section = intro.find((formItem) => formItem.title == "Objectives of Document").xmlTagMeta.tagName || "section";
      const sec_overview_id = intro.find((formItem) => formItem.title == "Objectives of Document").xmlTagMeta.attributes?.id || "intro-overview";
      const sec_overview_title = intro.find((formItem) => formItem.title == "Objectives of Document").xmlTagMeta.attributes?.title || "Overview";
      const sec_overview_text = intro.find((formItem) => formItem.title == "Objectives of Document").text;
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);
      const createToe = (title, intro, subTitle = "") => {
        let formItem = intro.find((item) => item.title == title);

        if (formItem) {
          let name = "";

          switch (title) {
            case "TOE Overview":
              if (subTitle.length != 0) {
                if (subTitle == "TOE Boundary") {
                  name = "sec:TOE_Boundary";
                } else if (subTitle == "TOE Platform") {
                  name = "sec:TOE_Platform";
                }

                let toeOverview = intro.find((item) => item.title == "TOE Overview");

                if (toeOverview && toeOverview.hasOwnProperty("nestedFormItems") && toeOverview.nestedFormItems.hasOwnProperty("formItems")) {
                  const boundaryText = toeOverview.nestedFormItems.formItems.find((item) => item.title == subTitle)
                    ? toeOverview.nestedFormItems.formItems.find((item) => item.title == subTitle).text
                    : "";

                  if (boundaryText.length != 0) {
                    return {
                      [name]: {
                        "#": boundaryText,
                      },
                    };
                  }
                }
              } else {
                return {
                  "#": formItem.text,
                };
              }
              break;
            case "TOE Usage":
              return { "#": formItem.text };
          }
        }
      };

      const toe_usage = createToe("TOE Usage", intro);
      const useCaseState = current(state.useCases);

      // Refactor this so that we're looping through the loop items and using their embedded tags
      // Search the form items for duplicate tags, and if there are, use an array
      let formattedIntroduction = {
        [sec_overview_section]: {
          "#": sec_overview_text,
          ...(sec_overview_section === "section" ? { "@id": sec_overview_id } : {}), // id attr is only allowed with section tag
          "@title": sec_overview_title,
        },
        "#": [],
      };

      // Add tech terms
      formattedIntroduction["#"].push({
        "tech-terms": current(state.techTerms),
      });

      if (ppType === "Protection Profile" || ppType === "Module") {
        const toe_overview = createToe("TOE Overview", intro);
        const toe_boundary = createToe("TOE Overview", intro, "TOE Boundary");
        const toe_platform = createToe("TOE Overview", intro, "TOE Platform");

        formattedIntroduction["#"].push({
          section: {
            "@title": "Compliant Targets of Evaluation",
            "@id": "TOEdescription",
            "#": [toe_overview, toe_boundary, toe_platform],
          },
        });
      }

      // Conditionally add CTOE section
      if (ppType === "Functional Package") {
        const CTOE = {
          componentsneeded: {
            componentneeded: ctoeData.rowData.map((row) => {
              const { componentID, notes } = row;
              return { componentid: componentID, notes: notes };
            }),
          },
        };

        formattedIntroduction["#"].push({
          "sec:Compliant_Targets_of_Evaluation": {
            "#": [ctoeData.introText, CTOE, ctoeData.additionalText],
          },
        });
      }

      // Add Use Cases
      if (Object.keys(useCaseState).length > 0) {
        formattedIntroduction["#"].push({
          "sec:Use_Cases": {
            "#": [toe_usage, useCaseState.usecase?.length > 0 ? { usecases: useCaseState } : ""],
          },
        });
      } else {
        delete formattedIntroduction["sec:Use_Cases"];
      }

      // Add Platforms after Use Cases
      // TODO: Phase 2, once platforms are in UI, change to check if platform slice has content
      if (platformXML?.length !== 0) {
        formattedIntroduction["#"].push({
          section: {
            "@title": "Platforms with Specific EAs",
            "@id": "sec-platforms",
            "#": platformXML,
          },
        });
      }

      // insert custom intro sections
      const introCustomSections = intro.filter((sec) => sec.custom);
      introCustomSections.forEach((sec) => {
        const attributes = sec?.xmlTagMeta?.attributes || {};
        if (sec.text) {
          // if section is a textEditor
          formattedIntroduction[`#`].push({
            section: {
              "#": sec.text,
              "@title": sec.title,
              ...(attributes.hasOwnProperty("id") && attributes.id ? { "@id": attributes.id } : {}),
            },
          });
        } else if (Object.keys(sec).some((key) => validator.isUUID(key))) {
          // if section is a terms list
          let customTerms = [];
          Object.entries(sec).forEach(([key, value]) => {
            if (validator.isUUID(key)) {
              customTerms.push({
                "#": value.definition,
                "@full": value.title,
              });
            }
          });
          formattedIntroduction["#"].push({
            terms: {
              term: customTerms,
              "@title": sec.title,
              ...(attributes.hasOwnProperty("id") && attributes.id ? { "@id": attributes.id } : {}),
            },
          });
        }
      });

      state.overallObject[docType]["sec:Introduction"] = formattedIntroduction;
    },
    SET_CONFORMANCE_CLAIMS: (state, action) => {
      const { conformanceClaims, ppType } = action.payload;
      const docType = getDocType(ppType);

      if (action.payload.ppTemplateVersion == "Version 3.1") {
        const emptyConformanceSection = Object.values(conformanceClaims).every((editor) => editor.text.trim() === "");

        if (emptyConformanceSection) {
          state.overallObject[docType]["sec:Conformance_Claims"] = {};
        } else {
          state.overallObject[docType]["sec:Conformance_Claims"] = setConformanceClaimsTo3_1(state.fileType, conformanceClaims);
        }
      } else {
        state.overallObject[docType]["sec:Conformance_Claims"] = setConformanceClaimsToCC2022(
          action.payload.conformanceClaims,
          action.payload.ppTemplateVersion
        );
      }
    },
    SET_SECURITY_REQUIREMENTS: (state, action) => {
      const sfrSections = action.payload.securityRequirements ? deepCopy(action.payload.securityRequirements) : {};
      const useCases = action.payload.useCases ? deepCopy(action.payload.useCases) : {};
      const { sars, platforms, auditSection, ppType } = action.payload;
      const { title, definition, formItems } = sfrSections;

      const docType = getDocType(ppType);

      try {
        // Get selectable ids from uuid
        const { selectableUUIDtoID, componentMap } = getSelectableMapFromFormItems(formItems);
        const useCaseMap = getUseCaseMap(useCases);
        let auditTableExists = false;

        // Get sfr sections
        let sfrSections = formItems.map((sfr, sfrIndex) => {
          const { nestedFormItems, text, title } = sfr;

          if (nestedFormItems && title) {
            if (title == "Security Functional Requirements") {
              const { formItems } = nestedFormItems;
              let innerSections = [];
              let implementSet = new Set([]);

              if (formItems && formItems.length > 0) {
                // Filter through to grab cc_ids to see if FAU_GEN.1 exists
                const ccIds = formItems.flatMap((item) =>
                  item.components
                    ? Object.values(item.components).map((component) => {
                        const { cc_id } = component;
                        if (cc_id !== undefined) {
                          return cc_id.toLowerCase();
                        }
                      })
                    : []
                );
                auditTableExists = ccIds.includes("fau_gen.1") || docType == "Package";

                // Get section values
                innerSections = formItems.map((section, sfrSectionIndex) => {
                  const sectionID = `5.${sfrIndex + 1}.${sfrSectionIndex + 1}`;
                  const { title, definition, extendedComponentDefinition, components } = section;
                  let findValues = title.split(/\(([^)]+)\)/);
                  const id = findValues && findValues.length > 1 ? findValues[1].trim().toLowerCase() : "";
                  const formattedExtendedComponentDefinition = getFamilyExtendedComponentDefinition(extendedComponentDefinition);
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
                  implementSet = new Set([...implementSet, ...implementSection]);
                  let formattedImplementSection = [];

                  if (sfrSectionIndex === Object.keys(formItems).length - 1) {
                    const implementArray = Array.from(implementSet);
                    formattedImplementSection = formatImplementSection(state, implementArray);
                  }

                  return [
                    { "!": ` ${sectionID} ${title ? title : ""} ` },
                    {
                      section: {
                        "@id": id,
                        "@title": title ? title : "",
                        "#": [definition, formattedExtendedComponentDefinition, formattedComponents, formattedImplementSection],
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
                innerSections = formItems.map((section, _sfrSectionIndex) => {
                  const { title, summary, components } = section;

                  let formattedComponents = getSARComponents(sars.elements, components);

                  return [
                    {
                      section: {
                        "@title": title ? title : "",
                        "#": [summary, formattedComponents],
                        ...(section.id && { "@id": section.id }), // Conditionallly add id if there is one
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

        if (sfrSections.find((section) => section && section["@title"] == "Security Assurance Requirements")) {
          state.overallObject[docType][state.fileType === "General-Purpose Computing Platforms" ? "sec:Security_Requirements" : "sec:req"] = {
            "@title": title,
            "#": definition ? definition : "",
            "!1": " 5.1 Security Functional Requirements",
            "sec:SFRs": {
              "#": [auditTableExists ? auditSection : "", sfrSections.find((section) => section["@title"] == "Security Functional Requirements")],
            },
            "!2": " 5.2 Security Assurance Requirements ",
            [sars.xmlTagMeta.tagName]: {
              "@title": sars.xmlTagMeta.attributes.hasOwnProperty("title") ? sars.xmlTagMeta.attributes.title : "Security Assurance Requirements",
              "#": [sfrSections.find((section) => section["@title"] == "Security Assurance Requirements")],
              // Conditionally add id if there is one (not setting a default as transforms doesn't expect the attribute for all PPs)
              ...(sars.xmlTagMeta.attributes.hasOwnProperty("id") && { "@id": sars.xmlTagMeta.attributes.id }),
            },
          };
        } else {
          // Packages normally won't have SARs, and will not have a parent <sec:req>, but solely the <sec:Security_Functional_Requirements>
          // Creating a new object to replace overallObject with, since we need to preserve order and replace the sec:req key with sec:Security_Functional_Requirements
          const originalPackage = state.overallObject[docType];
          const newPackage = {};

          Object.keys(originalPackage).forEach((key) => {
            if (key === "sec:req") {
              const sfrSection = sfrSections.find((section) => section && section["@title"] === "Security Functional Requirements");

              if (sfrSection) {
                const { ["@title"]: _, ...cleanedSfrSection } = sfrSection; // Remove @title

                newPackage["sec:Security_Functional_Requirements"] = {
                  "#": [auditTableExists ? auditSection : "", cleanedSfrSection],
                };
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
    SET_MODULE_SECURITY_REQUIREMENTS: (state, action) => {
      try {
        // TODO: eventually add in the rest of the security requirements section
        const docType = "Module";
        const { securityRequirements = {}, useCases = {}, sars = {}, sfrSections = {}, toeAuditData = {}, platforms = [] } = action.payload;
        const { definition = "", title = "", formItems = [] } = securityRequirements;

        // Format the sfr base pps
        if (title === "Security Requirements") {
          const useCaseMap = getUseCaseMap(useCases);
          const basePPs = formItems?.filter((obj) => obj.hasOwnProperty("declarationAndRef"));
          const { toeSfrs, toeSars } = getToeSecurityRequirements(formItems);

          let formattedSfrBasePPs = getSFRBasePPs(basePPs, sfrSections, useCaseMap, platforms, state.fileType);
          let formattedSfrSections = getToeSfrs(state, toeSfrs, toeAuditData, useCaseMap, platforms, state.fileType, formattedSfrBasePPs.length);
          let formattedSarSections = [];

          // Remove sec:req and add sec:Security_Requirements
          delete state.overallObject[docType]["sec:req"];
          state.overallObject[docType]["sec:Security_Requirements"] = {
            "@title": title,
            "#": [definition, formattedSfrBasePPs, formattedSfrSections, formattedSarSections],
          };
        }
      } catch (e) {
        console.log(e);
      }
    },
    SET_FORMATTED_XML: (state, action) => {
      try {
        const { xmlString } = action.payload;

        // Update formattedXML state if it has not changed
        if (xmlString && JSON.stringify(xmlString) !== JSON.stringify(state.formattedXML)) {
          state.formattedXML = xmlString;
        }
      } catch (e) {
        console.log(e);
      }
    },
    SET_BIBLIOGRAPHY: (state, action) => {
      const bibliography = action.payload.bibliography;
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);

      let entries = [];
      for (const [key, value] of Object.entries(bibliography)) {
        if (key == "entries") {
          value.forEach((e) => {
            let singleEntry = {
              entry: {
                "@id": e["id"],
                tag: e["tag"],
                description: e["description"],
              },
            };

            entries.push(singleEntry);
          });
        }
      }

      const formattedBibliography = {
        "cc-entry": "",
        "#": entries,
      };

      // Delete bibliography and move to the end of the object for gpcp
      if (state.fileType === "General-Purpose Computing Platforms" || ppType === "Module") {
        delete state.overallObject[docType].bibliography;
        state.overallObject[docType] = { ...state.overallObject[docType], ["bibliography"]: formattedBibliography };
      } else {
        state.overallObject[docType].bibliography = formattedBibliography;
      }
    },
    SET_DISTRIBUTED_TOE: (state, action) => {
      const { formItems, selected_section } = action.payload.distributedTOE;
      const attributes = action.payload.state.xmlTagMeta.attributes;
      const subSections = formItems;
      let formattedSubsections = [];
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);

      if (subSections) {
        subSections.forEach((section) => {
          let formattedSection = {
            "@title": section.title,
            ...(section.xmlTagMeta.attributes.hasOwnProperty("id") && section.xmlTagMeta.attributes.id ? { "@id": section.xmlTagMeta.attributes.id } : {}),
            "#": section.text,
          };
          formattedSubsections.push(formattedSection);
        });
      }

      const introFormatted = {
        "@title": attributes.hasOwnProperty("title") ? attributes.title : "Introduction to Distributed TOEs",
        ...(attributes.hasOwnProperty("id") && attributes.id ? { "@id": attributes.id } : {}),
        "#": action.payload.state.intro,
      };

      const distributedToeBlock = {
        "#": introFormatted,
        section: [...formattedSubsections],
      };

      const sectionName = (action.payload.state.xmlTagMeta && action.payload.state.xmlTagMeta.tagName) || "section";

      // Logic to find the target section for which this one goes after
      const targetSectionTitle = selected_section; // e.g. "Conformance Claims"
      const targetSectionKey = `sec:${targetSectionTitle.replaceAll(" ", "_")}`; // e.g. "sec:Conformance_Claims"

      const targetSection = ([k, v]) =>
        k === targetSectionKey ||
        (k === "section" &&
          v &&
          ((Array.isArray(v) && v.some((o) => o && o["@title"] === targetSectionTitle)) || (typeof v === "object" && v["@title"] === targetSectionTitle)));

      // Remove any previous section with the same name
      const filtered = Object.entries(state.overallObject[docType]).filter(([k]) => k !== sectionName);

      const idx = filtered.findIndex(targetSection);

      // Insert after the target section if found, otherwise append
      if (idx !== -1) {
        filtered.splice(idx + 1, 0, [sectionName, distributedToeBlock]);
      } else {
        filtered.push([sectionName, distributedToeBlock]);
      }

      state.overallObject[docType] = Object.fromEntries(filtered);
    },
    SET_APPENDICES: (state, action) => {
      let appendices = [];
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);
      const valGuideAppendix = action.payload.state.validationGuidelinesAppendix.xmlContent;
      if (valGuideAppendix) {
        const valGuideAppendixFormatted = {
          "@title": action.payload.state.valGuideAppendix.xmlTagMeta.attributes.hasOwnProperty("title")
            ? action.payload.state.valGuideAppendix.xmlTagMeta.attributes.title
            : "Validation Guidelines",
          "@id": action.payload.state.valGuideAppendix.xmlTagMeta.attributes.hasOwnProperty("id")
            ? action.payload.state.valGuideAppendix.xmlTagMeta.attributes.id
            : "validation_guidelines",
          "#": valGuideAppendix,
        };
        appendices.push(valGuideAppendixFormatted);
      }

      const satisfiedReqsAppendix = action.payload.state.satisfiedReqsAppendix.xmlContent;
      if (satisfiedReqsAppendix) {
        const satisfiedReqsAppendixFormatted = {
          "@title": action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.hasOwnProperty("title")
            ? action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.title
            : "Implicitly Satisfied Requirements",
          "@id": action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.hasOwnProperty("id")
            ? action.payload.state.satisfiedReqsAppendix.xmlTagMeta.attributes.id
            : "satisfiedreqs",
          "#": satisfiedReqsAppendix,
        };
        appendices.push(satisfiedReqsAppendixFormatted);
      }

      const entropyAppendix = action.payload.state.entropyAppendix.xmlContent;
      if (entropyAppendix) {
        const entropyAppendixFormatted = {
          "@title": action.payload.state.entropyAppendix.xmlTagMeta.attributes.hasOwnProperty("title")
            ? action.payload.state.entropyAppendix.xmlTagMeta.attributes.title
            : "Entropy Documentation and Assessment",
          "@id": action.payload.state.entropyAppendix.xmlTagMeta.attributes.hasOwnProperty("id")
            ? action.payload.state.entropyAppendix.xmlTagMeta.attributes.id
            : "entropyappendix",
          "#": entropyAppendix,
        };
        appendices.push(entropyAppendixFormatted);
      }

      const equivGuidelinesAppendix = action.payload.state.equivGuidelinesAppendix.xmlContent;
      if (equivGuidelinesAppendix) {
        const equivGuidelinesAppendixFormatted = {
          "@title": action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.hasOwnProperty("title")
            ? action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.title
            : "Equivalency Guidelines",
          "@id": action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.hasOwnProperty("id")
            ? action.payload.state.equivGuidelinesAppendix.xmlTagMeta.attributes.id
            : "appendix-equiv",
          "#": equivGuidelinesAppendix,
        };
        appendices.push(equivGuidelinesAppendixFormatted);
      }

      const vectorAppendix = action.payload.state.vectorAppendix.xmlContent.payload;
      if (vectorAppendix) {
        const vectorAppendixFormatted = {
          "@title": action.payload.state.vectorAppendix.xmlTagMeta.attributes.hasOwnProperty("title")
            ? action.payload.state.vectorAppendix.xmlTagMeta.attributes.title
            : "Initialization Vector Requirements for NIST-Approved Cipher Modes",
          "@id": action.payload.state.vectorAppendix.xmlTagMeta.attributes.hasOwnProperty("id")
            ? action.payload.state.vectorAppendix.xmlTagMeta.attributes.id
            : "vector",
          "#": vectorAppendix,
        };
        appendices.push(vectorAppendixFormatted);
      }

      const acknowledgementsAppendix = action.payload.state.acknowledgementsAppendix.xmlContent;
      if (acknowledgementsAppendix) {
        const acknowledgementsAppendixFormatted = {
          "@title": action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.hasOwnProperty("title")
            ? action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.title
            : "Acknowledgements",
          "@id": action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.hasOwnProperty("id")
            ? action.payload.state.acknowledgementsAppendix.xmlTagMeta.attributes.id
            : "ack",
          "#": acknowledgementsAppendix,
        };
        appendices.push(acknowledgementsAppendixFormatted);
      }

      let formattedAppendix;
      if (appendices.length === 0) {
        formattedAppendix = [];
      } else if (appendices.length >= 1) {
        formattedAppendix = appendices;
      }

      const customAppendices = Object.values(action.payload.state.accordionPane.sections).filter((sec) => sec.isAppendix === true);

      customAppendices.forEach((app) => {
        const xml = {
          "@title": app.title,
          "#": action.payload.state.editors[app.custom].text,
        };

        // Add attributes
        if (app.xmlTagMeta?.attributes) {
          for (const [attrName, attrValue] of Object.entries(app.xmlTagMeta.attributes)) {
            if (attrName.toLowerCase() !== "title") {
              xml[`@${attrName}`] = attrValue;
            }
          }
        }

        formattedAppendix.push(xml);
      });

      // Delete appendix and move to the end of the object for gpcp
      if (state.fileType === "General-Purpose Computing Platforms" || ppType === "Module") {
        delete state.overallObject[docType].appendix;
        state.overallObject[docType] = { ...state.overallObject[docType], ["appendix"]: formattedAppendix };
      } else {
        state.overallObject[docType].appendix = formattedAppendix;
      }
    },
    RESET_EXPORT: () => initialPPState,
  },
});

// Local Methods
const formatImplementSection = (_state, implementSection) => {
  let features = new Set([]);

  try {
    // Get features
    if (implementSection && implementSection.length > 0) {
      implementSection.forEach((feature) => {
        const { id, title, description } = feature;
        features.add({
          "@id": id,
          "@title": title,
          description: description,
        });
      });

      // Add to state
      const formattedFeatures = Array.from(features);
      return {
        implements: {
          feature: formattedFeatures,
        },
      };
    }
  } catch (e) {
    console.log(e);
  }
  return {};
};

const constructDirectRationaleThreats = (threats, sfrSections, ppType, sfrMaps) => {
  // if PP is CC2022 Direct Rationale, use new format for threats
  let output = "";
  const isModule = ppType === "Module";

  if (!Object.hasOwn(threats, "terms")) {
    return output;
  }

  const threatDefinition = threats.definition.length !== 0 ? threats.definition : "";

  let terms = threats.terms;
  // iterate through threat terms
  Object.keys(terms).forEach((key) => {
    const title = terms[key].title;
    output += `<threat name="${title}">`;
    terms[key].from.forEach((PP) => (output += `<from base="${PP}"/>`));
    if (terms[key].definition && terms[key].definition.length > 0) {
      output += `<description>${terms[key].definition}</description>`;
    }

    if (!Object.hasOwn(terms[key], "sfrs")) return;
    output += `<!-- New mapping to build updated threat mapping table. -->`;

    // Add sfr type
    const updatedSFRs = terms[key].sfrs
      .map((sfr) => {
        if (!isModule) {
          const stateSFR = findSFRByCcId(sfrSections, sfr.name);
          const sfrType = stateSFR ? getSfrType(stateSFR) : null;

          // Skip this `sfr` if either `stateSFR` or `sfrType` is null
          if (!stateSFR || !sfrType) {
            return null;
          }

          return { ...sfr, sfrType, stateSFR };
        } else {
          const sfrMap = sfrMaps.sfrNames;
          const stateSFR = sfrMap.includes(sfr.name);
          const sfrType = stateSFR ? getModuleSfrType(sfr.name) : null;

          // Skip this `sfr` if either `stateSFR` or `sfrType` is null
          if (!stateSFR || !sfrType) {
            return null;
          }

          return { ...sfr, sfrType, stateSFR };
        }
      })
      .filter((sfr) => sfr !== null)
      .sort((a, b) => {
        const priorityA = [isModule ? moduleSfrPriority : sfrPriority][a.sfrType];
        const priorityB = [isModule ? moduleSfrPriority : sfrPriority][b.sfrType];

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return a.name.localeCompare(b.name);
      });

    updatedSFRs.forEach(({ name, rationale, sfrType }) => {
      if (!isModule) {
        output += sfrType && sfrType !== "mandatory" ? `<addressed-by>${name} (${sfrTypeMap[sfrType]})</addressed-by>` : `<addressed-by>${name}</addressed-by>`;
      } else {
        output += `<addressed-by>${name}</addressed-by>`;
      }
      output += `<rationale>${rationale}</rationale>`;
    });

    output += `</threat>`;
  });

  return `${threatDefinition}<threats>${output}</threats>`;
};

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
          description: definition,
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
      return {};
    }
  } catch (e) {
    console.log(e);
  }
};

const getSecurityObjectives = (terms, objectivesToSFRs, sfrSections) => {
  try {
    let reformattedJSON = {};

    if (sfrSections) {
      // For Objectives for the TOE
      reformattedJSON = Object.entries(terms).map(([uuid, value]) => {
        const { title, definition } = value;
        let outputs = [];
        let sfrs = objectivesToSFRs.hasOwnProperty(uuid) ? objectivesToSFRs[uuid] : [];

        const updatedSFRs = sfrs
          .map((sfr) => {
            const stateSFR = findSFRByCcId(sfrSections, sfr.sfr_name);
            const sfrType = getSfrType(stateSFR);
            const priority = sfrPriority[sfrType];
            const sfrLabel = sfrType !== "mandatory" && sfrTypeMap[sfrType] ? `${sfr.sfr_name} (${sfrTypeMap[sfrType]})` : sfr.sfr_name;

            return { ...sfr, sfrType, sfrLabel, priority };
          })
          .sort((a, b) => {
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }

            return a.sfrLabel.localeCompare(b.sfrLabel);
          });

        updatedSFRs.forEach(({ sfrLabel, rationale }) => {
          outputs.push({ "addressed-by": sfrLabel });
          outputs.push({ rationale });
        });

        return {
          "@name": title,
          description: definition,
          "#": outputs,
        };
      });
    } else {
      // For Objectives for the OE
      reformattedJSON = Object.entries(terms).map(([uuid, value]) => {
        const { title, definition, consistencyRationale } = value;
        let outputs = [];
        let sfrs = objectivesToSFRs.hasOwnProperty(uuid) ? objectivesToSFRs[uuid] : [];
        if (sfrs && sfrs.length > 0) {
          sfrs.map((sfr) => {
            const { sfr_name, rationale } = sfr;
            outputs.push({ "addressed-by": sfr_name });
            outputs.push({ rationale: rationale });
          });
        }
        return {
          "@name": title,
          description: definition,
          ...(consistencyRationale && consistencyRationale.length > 0 ? { "consistency-rationale": consistencyRationale } : {}),
          "#": outputs,
        };
      });
    }

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
        const { title, famId, famBehavior } = def;
        return {
          "ext-comp-def": {
            "@title": title ? title : "",
            "@fam-id": famId ? famId : "",
            "fam-behavior": famBehavior ? famBehavior : "",
          },
        };
      });
    }
  } catch (e) {
    console.log(e);
  }

  return formattedExtendedComponentDefinition;
};

const getSfrComponents = (initialComponents, selectableUUIDtoID, componentMap, useCaseMap, platforms, fileType, auditTableExists, isModule = false) => {
  let formattedComponents = new Set([]);
  let implementSection = new Set([]);
  try {
    if (initialComponents && Object.keys(initialComponents).length > 0) {
      Object.entries(initialComponents).forEach(([componentUUID, initialComponent]) => {
        const {
          title,
          cc_id,
          iteration_id,
          xml_id,
          definition,
          consistencyRationale = {},
          fromPkgData = {},
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
          modifiedSfr = false,
          additionalSfr = false,
          notNew,
          xPathDetails,
        } = initialComponent;
        let componentName = ` ${cc_id + (iteration_id && iteration_id.length > 0 ? "/" + iteration_id + " " : " ") + title} `;
        let formattedExtendedComponentDefinition =
          extendedComponentDefinition && !modifiedSfr ? getExtendedComponentDefinition(extendedComponentDefinition) : [];
        let { formattedCcId, formattedIterationId, componentXmlId } = getComponentXmlID(cc_id, iteration_id, false, true);
        let formattedConsistencyRationale = modifiedSfr || additionalSfr || isModule ? { "consistency-rationale": consistencyRationale } : "";
        let formattedFromPackage = modifiedSfr && Object.keys(fromPkgData).length > 0 ? getFromPackage(fromPkgData) : "";
        let titleTag = modifiedSfr ? "base-sfr-spec" : "f-component";
        const includeAuditTable = auditTableExists && !invisible;
        let component = [
          { "!": componentName },
          {
            [titleTag]: {
              "@cc-id": cc_id ? cc_id.toLowerCase() : "",
              "@id": xml_id ? xml_id : componentXmlId,
              ...(modifiedSfr ? { "@title": title || "" } : { "@name": title || "" }),
              ...(notNew ? { "@notnew": notNew } : {}),
              depends: [],
              "#": [
                iteration_id && iteration_id !== "" ? { "@iteration": iteration_id } : "",
                fileType === "Virtualization System" && formattedExtendedComponentDefinition.length > 0 ? { "consistency-rationale": "" } : "",
                formattedConsistencyRationale,
                formattedExtendedComponentDefinition,
                definition && definition !== "" ? { description: definition } : "",
                formattedFromPackage,
                getSfrElements(
                  elements ? elements : {},
                  selectableUUIDtoID,
                  componentUUID,
                  formattedCcId,
                  formattedIterationId,
                  evaluationActivities,
                  platforms,
                  modifiedSfr,
                  xPathDetails
                ),
                includeAuditTable ? getAuditEvents(auditEvents, auditTableExists) : [],
              ],
            },
          },
        ];

        // Get component selections
        if (!modifiedSfr) {
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
            extendedComponentDefinition,
            isModule
          );
        }

        // Set component
        formattedComponents = new Set([...formattedComponents, ...component]);

        // Add to implement section
        if (reasons && reasons.length > 0) {
          const implementSet = new Set(reasons);
          implementSection = new Set([...implementSection, ...implementSet]);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }

  return {
    formattedComponents: Array.from(formattedComponents),
    implementSection: Array.from(implementSection),
  };
};

const getFromPackage = (fromPackage) => {
  const { name = "", short = "", version = "", git = {}, toggle = false } = fromPackage || {};
  const { url = "", branch = "" } = git;

  // If from package is valid return the structure
  if (toggle) {
    return {
      optional: {
        "from-pkg": {
          "@name": name,
          "@short": short,
          "@version": version,
          git: {
            url: url,
            branch: branch,
          },
        },
      },
    };
  } else {
    return "";
  }
};

const getSfrElements = (
  initialElements,
  selectableUUIDtoID,
  componentUUID,
  formattedCcId,
  formattedIterationId,
  evaluationActivities,
  platforms,
  modifiedSfr = false,
  xPathDetails
) => {
  let elements = [];
  try {
    if (initialElements) {
      if (Object.keys(initialElements).length > 0) {
        Object.entries(initialElements).forEach(([elementUUID, element], index) => {
          // Get evaluation activities
          let componentEvaluationActivity =
            index === 0 && evaluationActivities && evaluationActivities.hasOwnProperty(componentUUID) ? deepCopy(evaluationActivities[componentUUID]) : null;
          let elementEvaluationActivity =
            evaluationActivities && evaluationActivities.hasOwnProperty(elementUUID) ? deepCopy(evaluationActivities[elementUUID]) : null;
          let formattedEvaluationActivities = [];

          // Get component evaluation activity
          if (componentEvaluationActivity) {
            getSfrEvaluationActivities(componentEvaluationActivity, formattedEvaluationActivities, selectableUUIDtoID, true, platforms);
          }

          if (elementEvaluationActivity) {
            // Get element evaluation activity
            getSfrEvaluationActivities(elementEvaluationActivity, formattedEvaluationActivities, selectableUUIDtoID, false, platforms);
          }

          // Get SFR element
          let { elementXMLID, note } = element;

          try {
            // Generate the elementXMLID if one does not already exist
            if (!elementXMLID || elementXMLID === "") {
              elementXMLID = getElementId(formattedCcId, formattedIterationId, index, true);
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

            // Add in additional fields for the modified sfr element
            if (modifiedSfr) {
              let formattedModifiedElement = {
                replace: {
                  "xpath-specified": {
                    "@xpath": `*//cc:f-element[@id='${elementXMLID}']`,
                    "#": formattedElement,
                  },
                },
              };

              // Add formatted modified sfr element to the elements
              if (!elements.includes(formattedModifiedElement)) {
                elements.push(formattedModifiedElement);
              }
            } else {
              // Add formatted element to the elements
              if (!elements.includes(formattedElement)) {
                elements.push(formattedElement);
              }
            }
          } catch (e) {
            console.log(e);
          }
        });
      } else {
        // TODO: eventually remove this condition, once all possibilities are covered on import (currently only management function
        // status marker updates exist)
        // likely an insert-before/insert-after which has no f-element
        const modifiedType = Object.keys(xPathDetails)[0]; // "insert-after", "insert-before"

        let formattedModifiedElement = {
          [Object.keys(xPathDetails)[0]]: {
            "xpath-specified": {
              "@xpath": xPathDetails[modifiedType].xpath,
              "#": xPathDetails[modifiedType].xPathContent,
            },
          },
        };

        elements.push(formattedModifiedElement);
      }
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
  const { title, selectables, selectableGroups, isManagementFunction, managementFunctions, tabularize } = element;

  function parseTitleOrDescriptionArray(titleOrDescription) {
    if (!titleOrDescription) return;

    let result = "";

    const startsWithPunctuation = (text) => {
      if (!text) return false;
      const firstChar = text.trimStart().charAt(0);
      return [".", ",", ")", "]"].includes(firstChar);
    };

    // Removes the preceding space when incoming starts with punctuation
    const removeSpace = (finalText, incomingText) => {
      if (!incomingText) return finalText;
      if (startsWithPunctuation(incomingText) && finalText.endsWith(" ")) {
        return finalText.trimEnd() + incomingText.trimStart();
      }
      return finalText + incomingText;
    };

    titleOrDescription.forEach((item) => {
      const assignmentEdgeCase = item.groups && item.groups.length == 1 && selectables[item.groups[0]] && selectables[item.groups[0]].assignment;

      if (item.text) {
        result = removeSpace(result, item.text);
      } else if (item.description) {
        result = removeSpace(result, item.description);
      } else if (item.assignment) {
        result += ` <assignable>${selectables[item.assignment].description}</assignable> `;
      } else if (item.selections) {
        const group = selectableGroups[item.selections];
        const onlyone = group.onlyOne ? ` onlyone="yes"` : "";
        const linebreak = group.linebreak ? ` linebreak="yes"` : "";

        const formattedSelectables = ` <selectables${onlyone}${linebreak}>${parseSelections(item.selections)}</selectables> `;
        result += formattedSelectables;
      } else if (assignmentEdgeCase) {
        const validKey = item.groups[0];
        if (!selectables[validKey]) return;

        const { description } = selectables[validKey];

        result += ` <assignable>${description}</assignable> `;
      } else if (item.tabularize) {
        result += parseTabularize(tabularize);
      } else {
        if (item.groups) {
          const group = selectableGroups[item.groups];
          const onlyone = group?.onlyOne ? ` onlyone="yes"` : "";
          const linebreak = group?.linebreak ? ` linebreak="yes"` : "";
          result += ` <selectables${onlyone}${linebreak}>`;
          item.groups.forEach((groupKey) => {
            result += parseSelections(groupKey);
          });
          result += "</selectables> ";
        }
      }
    });
    return result
      .replace(/\^\s+/g, "^")
      .replace(/(<\/[a-zA-Z0-9]+>)\s*(<\/[a-zA-Z0-9]+>\])/g, "$1$2")
      .replace(/\]\.$/, "");
  }

  // Within the 'selections' field of a title array, one or two things can happen
  // 1. We have a singular selectable
  // 2. We have a group
  function parseSelections(selectionKey) {
    let nestedResults = "";
    const group = selectableGroups[selectionKey];

    if (group == undefined) {
      const { description, exclusive, id, assignment } = selectables[selectionKey];
      const isExclusive = exclusive == true ? 'exclusive="yes"' : "";
      const attributes = `id="${id}" ${isExclusive}`;
      const assignableOpeningTag = assignment ? "<assignable>" : "";
      const assignableClosingTag = assignment ? "</assignable>" : "";

      nestedResults += `<selectable ${attributes}>${assignableOpeningTag}${description}${assignableClosingTag}</selectable>`;
    } else {
      group.groups.forEach((validKey) => {
        if (selectables[validKey]) {
          const { description, exclusive, id, assignment } = selectables[validKey];
          const isExclusive = exclusive == true ? 'exclusive="yes"' : "";
          const attributes = `id="${id}" ${isExclusive}`;
          const assignableOpeningTag = assignment ? "<assignable>" : "";
          const assignableClosingTag = assignment ? "</assignable>" : "";

          nestedResults += `<selectable ${attributes}>${assignableOpeningTag}${description}${assignableClosingTag}</selectable>`;
        } else if (selectableGroups[validKey]) {
          nestedResults += `<selectable id="${validKey}">`;
          nestedResults += parseGroup(validKey);
          nestedResults += `</selectable>`;
        }
      });
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
      nestedResults += parseSelections(groupKey);
    }

    return nestedResults;
  }

  function parseTabularize(tabularize) {
    const tabularizeTablesList = Object.values(tabularize);

    let formattedTabularizeTablesList = "";

    tabularizeTablesList.forEach((tabularizeTable) => {
      const { id, title, definition, rows, columns } = tabularizeTable;
      let formattedTabularize = "";

      // TODO: Refactor this segment to not be multi-line with += statements, start w/ this for readability
      formattedTabularize += "<selectables>";
      formattedTabularize += `<tabularize id="${id}" title="${title}">`;
      definition.forEach(({ value, type }) => {
        if (value !== "Selectable ID") formattedTabularize += `<${type}>${value}</${type}>`;
      });

      formattedTabularize += `</tabularize>`;

      formattedTabularizeTablesList += formattedTabularize;

      rows.forEach((row) => {
        const { selectableId, identifier } = row;

        // Pack the contents of this table into an array for easier parsing
        const selections = Object.values(row);
        formattedTabularizeTablesList += `<selectable id="${selectableId}">`;
        if (identifier) formattedTabularizeTablesList += `<col>${identifier}</col>`;
        selections.forEach((selection) => {
          if (Array.isArray(selection)) formattedTabularizeTablesList += `<col>${parseTitleOrDescriptionArray(selection)}</col>`;
        });
        formattedTabularizeTablesList += `</selectable>`;
      });
      // Start parsing the tabularized selectables

      formattedTabularizeTablesList += "</selectables>";
    });
    return formattedTabularizeTablesList;
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
    let result = "";
    let fields = [];

    columns.forEach(({ field, headerName }) => {
      if (!["rowNum", "id", "textArray"].includes(field)) {
        result += `<manager cid="${field}">${headerName}</manager>`;
        if (!fields.includes(field)) {
          fields.push(field);
        }
      }
    });

    return { columnResult: result, fields };
  }

  // Management Function Rows
  function parseManagementFunctionRows(rows, fields) {
    let result = "";

    try {
      rows.forEach((row) => {
        const { id, textArray, evaluationActivity, note } = row;
        const rowText = parseTitleOrDescriptionArray(textArray);
        const idAttribute = id && id !== "" ? ` id="${id}"` : "";
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
      console.log(e);
    }

    return result;
  }

  function createAActivityAndNote(evaluationActivity, notes) {
    const { tss, guidance, testIntroduction, testClosing, testLists, tests, isNoTest, noTest, refIds } = evaluationActivity;
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
    } else {
      // Add in evaluation activity
      // Create formatted test list
      let formattedTestList = "";

      const createTestList = (testListUUID) => {
        const testList = testLists[testListUUID];
        if (!testList) return "";

        let xml = testList.description || "";
        xml += "<testlist>";

        testList.testUUIDs?.forEach((testUUID) => {
          const test = tests[testUUID];
          if (!test) return;

          xml += `<test>${test.objective || ""}</test>`;

          // Render nested test lists recursively
          if (test.nestedTestListUUIDs?.length > 0) {
            test.nestedTestListUUIDs.forEach((nestedUUID) => {
              xml += createTestList(nestedUUID);
            });
          }
        });

        xml += "</testlist>";
        return xml;
      };

      // Find top-level test lists (not nested)
      Object.entries(testLists).forEach(([uuid, list]) => {
        if (list.parentTestUUID === null || list.parentTestUUID === undefined) {
          formattedTestList += createTestList(uuid);
        }
      });

      const formattedRefIds = createRefIdTags(refIds);

      result += `
				<aactivity>
					${formattedRefIds}
					<TSS>${tss}</TSS>
					<Guidance>${guidance}</Guidance>
					<Tests>${testIntroduction}${formattedTestList}</Tests>
				</aactivity>
			`;
    }
    return result;
  }

  // Creates the ref-id tags
  function createRefIdTags(refIds) {
    let refIdTags = "";
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
    let result = "";
    fields.forEach((field) => {
      if (field && row.hasOwnProperty(field)) {
        const marker = row[field] === "-" ? "NA" : row[field];
        result += `<${marker} ref="${field}"/>`;
      }
    });
    return result;
  }

  // Get initial title
  finalResult += parseTitleOrDescriptionArray(title);

  // Get management function table if it exists and return
  if (isManagementFunction && managementFunctions && Object.keys(managementFunctions).length > 0) {
    const managementResult = parseManagementFunctionsTable(managementFunctions);
    finalResult += managementResult;
    finalResult += "].";
  }
  return finalResult;
};
const getExtendedComponentDefinition = (extendedComponentDefinition) => {
  const { toggle, audit, managementFunction, componentLeveling, dependencies } = extendedComponentDefinition || {};
  let formattedExtendedComponentDefinition = [];

  if (extendedComponentDefinition == undefined) return formattedExtendedComponentDefinition;

  // Helper function to collapse multiple if statements
  function addFormattedDefinition(key, value) {
    if (value && value !== "") {
      let formattedValue = { [key]: value };
      if (!formattedExtendedComponentDefinition.includes(formattedValue)) formattedExtendedComponentDefinition.push(formattedValue);
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
  invisible,
  extendedComponentDefinition,
  isModule
) => {
  if (component && component[1]) {
    let fComponent = component[1]["f-component"];

    // Add implementation dependent
    if (implementationDependent && reasons && reasons.length > 0) {
      if (!isModule) {
        fComponent["@status"] = "feat-based";
      }
      reasons.forEach((reason) => {
        const { id } = reason;
        let formattedReason = {
          "@on": id,
        };

        // Add formatted reason
        if (!fComponent["depends"].includes(formattedReason)) {
          fComponent["depends"].push(formattedReason);
        }
      });
    }

    // Add selection based
    if (selectionBased) {
      if (!isModule) {
        fComponent["@status"] = "sel-based";
      }
      if (selections && Object.keys(selections).length > 0) {
        if (selections.hasOwnProperty("selections")) {
          // Get components
          if (selections.components.length > 0) {
            selections.components.forEach((component) => {
              const id = componentMap[component];

              if (id) {
                const formattedID = { [!isModule ? "@on-incl" : "@on-fcomp"]: id };
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
    if (!isModule && useCaseBased && useCases && useCases.length > 0) {
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
      fComponent["@status"] = "invisible";
    }

    // Add optional
    if (optional) {
      let formatted = { optional: {} };
      if (
        fComponent.hasOwnProperty("@status") &&
        (fComponent["@status"] === "sel-based" || fComponent["@status"] === "feat-based") &&
        !fComponent["depends"].includes(formatted)
      ) {
        fComponent["depends"].push(formatted);
      } else if (!isModule) {
        fComponent["@status"] = "optional";
      } else if (isModule) {
        fComponent["depends"].push(formatted);
      }
    }

    // Add objective
    else if (objective) {
      let formatted = { objective: {} };
      if (
        fComponent.hasOwnProperty("@status") &&
        (fComponent["@status"] === "sel-based" || fComponent["@status"] === "feat-based") &&
        !fComponent["depends"].includes(formatted)
      ) {
        fComponent["depends"].push(formatted);
      } else if (!isModule) {
        fComponent["@status"] = "objective";
      } else if (isModule) {
        fComponent["depends"].push(formatted);
      }
    }
  }
};

const getAuditEvents = (auditEvents, auditData) => {
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
                      selectable: [info ? info : "", "None"],
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
        let formattedAuditEvent = {
          "audit-event": {
            "#": [auditData && typeof auditData === "object" ? auditData : "", auditEvent],
          },
        };
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

const getSfrEvaluationActivities = (evaluationActivity, formattedEvaluationActivities, selectableUUIDtoID, isComponent, platforms) => {
  try {
    let formattedEvaluationActivity = {
      // aactivity: {
      //   "@level": isComponent ? "component" : "element",
      // },
      aactivity: {
        "@level": evaluationActivity.level,
      },
    };
    if (evaluationActivity) {
      const {
        introduction = "",
        tss = "",
        guidance = "",
        testIntroduction = "",
        testClosing = "",
        testLists = {},
        tests = {},
        isNoTest,
        noTest,
      } = evaluationActivity;

      if (isNoTest) {
        formattedEvaluationActivity.aactivity["no-tests"] = noTest;
      } else {
        let isAactivity =
          evaluationActivity && Object.keys(evaluationActivity).length > 0 && (introduction || tss || guidance || testIntroduction || testLists || tests);

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
          if (testIntroduction || (testLists && Object.keys(testLists).length > 0)) {
            const intro = testIntroduction ? testIntroduction : "";
            let formattedTestLists = [];

            // Track nested test lists so they are not exported again as top level ones
            const nestedTestListsUsed = new Set();
            Object.values(tests).forEach((test) => {
              test.nestedTestListUUIDs?.forEach((uuid) => nestedTestListsUsed.add(uuid));
            });

            for (const [testListUUID, testList] of Object.entries(testLists)) {
              if (nestedTestListsUsed.has(testListUUID)) continue;
              const { description, testUUIDs, conclusion } = testList;

              if ((description && description !== "") || testUUIDs?.length > 0 || (conclusion && conclusion !== "")) {
                let formattedTests = [];

                if (testUUIDs?.length > 0) {
                  testUUIDs.forEach((uuid) => {
                    const test = tests[uuid];
                    if (!test) return;

                    const { id, dependencies, objective, conclusion: testConclusion, nestedTestListUUIDs } = test;

                    let formattedDependencies = [];
                    if (dependencies?.length > 0) {
                      dependencies.forEach((dependency) => {
                        if (dependency) {
                          let formattedDependency = {};

                          if (selectableUUIDtoID.hasOwnProperty(dependency)) {
                            formattedDependency = {
                              depends: {
                                "@on": selectableUUIDtoID[dependency],
                              },
                            };
                          } else {
                            const platformObject = platforms.find((p) => p.name === dependency);
                            formattedDependency = {
                              depends: {
                                "@ref": platformObject ? platformObject.id : dependency,
                              },
                            };
                          }

                          formattedDependencies.push(formattedDependency);
                        }
                      });
                    }

                    const formatTest = (test) => {
                      let nested = [];

                      if (Array.isArray(test.nestedTestListUUIDs) && test.nestedTestListUUIDs.length > 0) {
                        test.nestedTestListUUIDs.forEach((nestedListUUID) => {
                          const nestedList = testLists[nestedListUUID];
                          const nestedListConclusion = nestedList["conclusion"];
                          if (!nestedList) return;

                          const nestedTests = nestedList.testUUIDs.map((nestedUUID) => formatTest(tests[nestedUUID]));

                          nested.push({ testlist: { test: nestedTests, "#": nestedListConclusion } });
                        });
                      }

                      return {
                        ...(test.id && { "@id": test.id }),
                        "#": [test.dependencies, test.objective, ...nested, test.testConclusion],
                      };
                    };

                    const formattedTest = {
                      test: formatTest({ id, dependencies: formattedDependencies, objective, nestedTestListUUIDs, testConclusion }),
                    };

                    formattedTests.push(formattedTest);
                  });
                }

                formattedTestLists.push({
                  testlist: {
                    "#": [description, formattedTests, conclusion],
                  },
                });
              }
            }

            formattedEvaluationActivity.aactivity.Tests = {
              "#": [intro, formattedTestLists, testClosing],
            };
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

const getDocType = (ppType) => {
  switch (ppType) {
    case "Protection Profile":
      return "PP";
    case "Functional Package":
      return "Package";
    case "Module":
      return "Module";
  }
};

const getSelectableMapFromFormItems = (formItems) => {
  let selectableUUIDtoID = {};
  let componentMap = {};

  try {
    formItems.forEach((sfr) => {
      const { nestedFormItems } = sfr;
      if (nestedFormItems) {
        const { formItems } = nestedFormItems;

        if (formItems && formItems.length > 0) {
          formItems.forEach((section) => {
            const { components } = section;

            getSelectableUUIDMapFromComponents(components, selectableUUIDtoID, componentMap);
          });
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
  return { selectableUUIDtoID, componentMap };
};

const getSelectableUUIDMapFromComponents = (components, selectableUUIDtoID, componentMap) => {
  try {
    if (components && Object.keys(components).length > 0) {
      Object.entries(components).forEach(([componentUUID, component]) => {
        const { elements, xml_id, cc_id, iteration_id } = component;

        // Get selectables
        if (elements && Object.keys(elements).length > 0) {
          Object.values(elements).forEach((element) => {
            const { selectables } = element;

            if (selectables && Object.values(selectables).length > 0) {
              Object.entries(selectables).forEach(([uuid, selectable]) => {
                const { id } = selectable;

                if (id && !selectableUUIDtoID.hasOwnProperty(uuid)) {
                  selectableUUIDtoID[uuid] = id;
                }
              });
            }
          });
        }

        // Add component to component map
        componentMap[componentUUID] = xml_id ? xml_id : getComponentXmlID(cc_id, iteration_id, false, false);
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const getUseCaseMap = (useCases) => {
  let useCaseMap = {};
  try {
    if (useCases && Object.keys(useCases).length > 0) {
      Object.entries(useCases).forEach(([uuid, useCase]) => {
        const { xmlTagMeta } = useCase;
        if (xmlTagMeta && xmlTagMeta.hasOwnProperty("attributes") && xmlTagMeta.attributes.hasOwnProperty("id")) {
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

const getSARComponents = (allSARElements, initialComponents) => {
  let components = [];
  try {
    if (initialComponents && Object.keys(initialComponents).length > 0) {
      Object.entries(initialComponents).forEach(([componentUUID, initialComponent]) => {
        const { name, ccID, summary, elementIDs, optional } = initialComponent;

        const elements = elementIDs.map((elementUUID) => allSARElements[elementUUID]);
        let component = [
          {
            "a-component": {
              "@cc-id": ccID ? ccID.toLowerCase() : "",
              "@name": name ? name : "",
              ...(optional && { "@status": "optional" }), // Dynamically add status attribute if optional is true
              "#": [summary, getSARElements(elements)],
            },
          },
        ];

        // Set component
        if (!components.includes(component)) {
          components.push(component);
        }
      });
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
            "cc:description": text,
          };
        }),
      };
      break;
    }
    default: {
      formattedConformance["cclaims"] = {
        cclaim: Object.values(formItems).map((claim) => {
          const { title, text } = claim;
          return {
            "@name": title,
            description: text,
          };
        }),
      };
      break;
    }
  }
  return formattedConformance;
};

const updateOverallObject = (state, sourceKeys, targetKey) => {
  sourceKeys.forEach((sourceKey) => {
    if (state.overallObject[sourceKey]) {
      state.overallObject[targetKey] = state.overallObject[sourceKey];
      delete state.overallObject[sourceKey];
    }
  });
};

const setConformanceClaimsToCC2022 = (conformanceClaims, ppTemplateVersion) => {
  let formattedConformance = {
    "@boilerplate": "no",
  };

  const cclaimInfo = conformanceClaims;
  const { stConformance, part2Conformance, part3Conformance, cc_errata, ppClaims, packageClaims, evaluationMethods, additionalInformation } = cclaimInfo;

  // Generate package claim
  let ppConformance = [];
  let ppConfiguration = [];
  ppClaims.forEach((claim) => {
    const { pp, text, status } = claim;

    // Generate ppClaim
    if (text && status) {
      const formattedPpClaim = { [pp ? "PP-cc-ref" : "Mod-cc-ref"]: text };

      if (status.includes("Conformance") && !ppConformance.includes(formattedPpClaim)) {
        ppConformance.push(formattedPpClaim);
      }
      if ((status.includes("Configuration") || status.length < 1) && !ppConfiguration.includes(formattedPpClaim)) {
        ppConfiguration.push(formattedPpClaim);
      }
    }
  });

  // Format conformance
  formattedConformance["CClaimsInfo"] = {
    "@cc-version": "cc-2022r1",
    "@cc-approach": ppTemplateVersion === "CC2022 Standard" ? "standard" : "direct-rationale",
    ...(cc_errata !== "N/A" && { "@cc-errata": cc_errata }),
    "cc-st-conf": stConformance,
    "cc-pt2-conf": part2Conformance,
    "cc-pt3-conf": part3Conformance,
    "cc-pp-conf": {
      "#": ppConformance,
    },
    "cc-pp-config-with": {
      "#": ppConfiguration,
    },
    "cc-pkg-claim": {
      "#": packageClaims.map((claim) => {
        const { functionalPackage, conf, text } = claim;

        return {
          [functionalPackage ? "FP-cc-ref" : "AP-cc-ref"]: {
            "@conf": conf,
            "#": text,
          },
        };
      }),
    },
  };
  if (evaluationMethods.length > 0) {
    formattedConformance["CClaimsInfo"]["cc-eval-methods"] = {
      "EM-cc-ref": evaluationMethods,
    };
  }
  if (additionalInformation) {
    formattedConformance["CClaimsInfo"]["cc-claims-addnl-info"] = additionalInformation;
  }

  return formattedConformance;
};

const getSARElements = (initialElements) => {
  let elements = [];
  try {
    initialElements.forEach((element) => {
      // Get SAR element
      const { aactivity, note, title, type } = element;
      try {
        // Return elements here
        let formattedElement = {
          "a-element": {
            "@type": type,
            "#": [{ title: title }, note ? { note: getNote(note) } : "", { aactivity: aactivity }],
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

const createAdditionalSfrs = (additionalSfrs, sfrSections, useCaseMap, platforms, fileType, sectionIndex) => {
  // If there is nothing, then include an empty <additional-sfrs/> tag
  if (Object.keys(additionalSfrs.sfrSections).length === 0) {
    return {
      "!1": ` 5.${sectionIndex}.2 Additional SFRs `,
      "additional-sfrs": {},
    };
  }

  // Destructure input for clarity
  const { introduction: addIntro, audit: addAudit, sfrSections: addSfrSections } = additionalSfrs;
  const {
    section: { id: sectionId, title: sectionTitle },
    auditTable: { id: auditTableId, table: auditTable, title: auditTableTitle },
  } = addAudit;

  const formattedAuditTable = {
    section: {
      "@id": sectionId,
      "@title": sectionTitle,
      "audit-table": {
        "@id": auditTableId,
        "@table": auditTable,
        "@title": auditTableTitle,
        "#": " ",
      },
    },
  };

  let exportedAdditionalSfrs = [];

  try {
    const selectableUUIDtoID = {};
    const componentMap = {};

    // Populate the maps without formItems
    Object.keys(addSfrSections).forEach((uuid) => {
      const fullSfrSection = deepCopy(sfrSections[uuid]);
      getSelectableUUIDMapFromComponents(fullSfrSection, selectableUUIDtoID, componentMap);
    });

    Object.entries(addSfrSections).forEach(([uuid, sfrSectionSimplified]) => {
      const fullSfrSection = deepCopy(sfrSections[uuid]);
      const { id, title, definition } = sfrSectionSimplified;

      // Get formatted components for this sections
      const auditTableExits = auditTable ? { "@table": auditTable } : false;
      const { formattedComponents } = getSfrComponents(fullSfrSection, selectableUUIDtoID, componentMap, useCaseMap, platforms, fileType, auditTableExits);

      if (exportedAdditionalSfrs.length === 0) {
        // First push the audit section by itself
        exportedAdditionalSfrs.push(formattedAuditTable);
      }

      const extCompDefBlocks = (sfrSectionSimplified.extendedComponentDefinition || []).map((def) => ({
        "ext-comp-def": {
          "@title": def.title,
          "@fam-id": def.famId,
          "fam-behavior": def.famBehavior,
        },
      }));

      exportedAdditionalSfrs.push({
        section: {
          "@title": title,
          "@id": id,
          "#": [...extCompDefBlocks, definition, formattedComponents],
        },
      });
    });
  } catch (error) {
    console.error(error);
  }

  // Prepare the final formatted object
  const formattedAdditionalSfrs = {
    "!1": ` 5.${sectionIndex}.2 Additional SFRs `,
    "additional-sfrs":
      exportedAdditionalSfrs.length > 0
        ? {
            "#": [addIntro, exportedAdditionalSfrs],
          }
        : "",
  };

  return formattedAdditionalSfrs;
};

const createModifiedSfrs = (modifiedSfrs, sfrSections, short, useCaseMap, platforms, fileType, sectionIndex) => {
  const { introduction = "", sfrSections: modifiedSfrSections = {} } = modifiedSfrs || {};
  let formattedSfrSections = [];

  try {
    // Generate modified sfr sections
    if (modifiedSfrSections && Object.keys(modifiedSfrSections)?.length > 0) {
      let filteredSections = {};
      let selectableUUIDtoID = {};
      let componentMap = {};

      Object.entries(modifiedSfrSections).forEach(([sfrSectionUUID, sfrSection]) => {
        getModifiedSfrFilteredSections(filteredSections, selectableUUIDtoID, componentMap, sfrSections, sfrSection, sfrSectionUUID, short);
      });

      // If changes have been made generate modified sfrs
      if (filteredSections && Object.keys(filteredSections).length > 0) {
        Object.values(filteredSections).forEach((sfrSection) => {
          const { title = "", id = "", definition = "", components = {} } = sfrSection || {};

          if (filteredSections && Object.keys(filteredSections).length > 0) {
            let { formattedComponents } = getSfrComponents(components, selectableUUIDtoID, componentMap, useCaseMap, platforms, fileType, false);

            // Add to modified sfrs if components exist for the section to the modified sfr
            if (formattedComponents && Object.keys(formattedComponents).length > 0) {
              const formattedSfrSection = {
                section: {
                  "@title": title,
                  "@id": id,
                  "#": [definition, formattedComponents],
                },
              };

              // Add the formatted sfr section
              if (!formattedSfrSections.includes(formattedSfrSection)) {
                formattedSfrSections.push(formattedSfrSection);
              }
            }
          }
        });
      }
    }
  } catch (e) {
    console.log(e);
  }

  // Return the formatted modified sfrs
  const formattedModifiedSfrs = {
    "!1": ` 5.${sectionIndex}.1 Modified SFRs `,
    "modified-sfrs":
      formattedSfrSections && Object.keys(formattedSfrSections).length > 0
        ? {
            "#": [introduction, formattedSfrSections],
          }
        : "",
  };
  return formattedModifiedSfrs;
};

// Comment: Confusing use of sfrSection
const getModifiedSfrFilteredSections = (filteredSections, selectableUUIDtoID, componentMap, sfrSections, sfrSection, sfrSectionUUID, short = "") => {
  // Get the modified sfr data
  if (sfrSections.hasOwnProperty(sfrSectionUUID)) {
    const { title = "", id = "", definition = "" } = sfrSection || {};
    const currentSfrSection = deepCopy(sfrSections[sfrSectionUUID]);

    // Generate the components and elements if elements have been updated
    const filteredComponents = filterComponents(currentSfrSection);

    if (filteredComponents && Object.keys(filteredComponents).length > 0) {
      // Add filtered section
      filteredSections[sfrSectionUUID] = {
        title,
        id,
        definition,
        components: filteredComponents,
      };

      // Generate the uuid maps
      getSelectableUUIDMapFromComponents(filteredComponents, selectableUUIDtoID, componentMap);
    }
  }

  function filterComponents(currentSfrSection) {
    let filteredComponents = {};

    if (currentSfrSection && Object.keys(currentSfrSection)?.length > 0) {
      Object.entries(currentSfrSection).forEach(([componentUUID, component]) => {
        const { elements = {}, cc_id = "", iteration_id = "", xPathDetails = {} } = component || {};
        const originalComponent = getOriginalComponent(cc_id.toUpperCase(), iteration_id, short.toLowerCase());
        const elementsValid = elements && Object.keys(elements).length > 0;

        // Create a new component
        let newComponent = deepCopy(component);
        newComponent.elements = {};

        let hasModifiedElements = false;
        let hasInsertionDirectives = false;

        // Filter components down based on changed elements
        if (originalComponent && elementsValid) {
          const { elements: originalElements = {} } = originalComponent || {};

          // Run through each element to check for any updates from the original element
          Object.entries(elements).forEach(([elementUUID, element]) => {
            const isElementUpdated = originalElements.hasOwnProperty(elementUUID) && JSON.stringify(element) !== JSON.stringify(originalElements[elementUUID]);

            if (isElementUpdated) {
              newComponent.elements[elementUUID] = deepCopy(element);
              hasModifiedElements = true;
            }
          });
        }

        // Check for <insert-after> or <insert-before>
        if (xPathDetails && typeof xPathDetails === "object") {
          const directiveKeys = Object.keys(xPathDetails);
          hasInsertionDirectives = directiveKeys.some((key) => key === "insert-after" || key === "insert-before");
        }

        // Include the component if anything has changed
        if (hasModifiedElements || hasInsertionDirectives) {
          filteredComponents[componentUUID] = deepCopy(newComponent);
        }
      });
    }

    return filteredComponents;
  }

  function getOriginalComponent(cc_id, iteration_id, short) {
    const dataMap = { app, gpcp, gpos, mdf, mdm, tls, virtualization };
    if (iteration_id.length !== 0) {
      cc_id += `/${iteration_id}`;
    }
    const isComponent = cc_id && short && dataMap.hasOwnProperty(short) && dataMap[short].hasOwnProperty(cc_id);

    // Return the data map values
    return isComponent ? dataMap[short][cc_id] : {};
  }
};

const createConsistencyRationale = (consistencyRationale) => {
  const { conToe = "", conSecProb = "", conObj = "", conOpEn = "", conMod = [] } = consistencyRationale;

  const exportedPayload = {
    "con-toe": conToe.text,
    "con-sec-prob": conSecProb.text,
    "con-obj": conObj.text,
    "con-op-en": conOpEn.text,
    "con-mod": conMod.rows.map((row) => {
      return { "@ref": row.ref, "#": row.text };
    }),
  };
  return exportedPayload;
};

const getSFRBasePPs = (basePPs, sfrSections, useCaseMap, platforms, fileType) => {
  let formattedBasePPs = [];

  try {
    if (basePPs && Object.keys(basePPs).length > 0) {
      basePPs?.forEach((basePP, index) => {
        const { modifiedSfrs = {}, additionalSfrs = {}, consistencyRationale = {}, declarationAndRef = {} } = basePP || {};

        if (!declarationAndRef && Object.keys(declarationAndRef).length === 0) {
          return;
        }

        const {
          id = "",
          name = "",
          product = "",
          short = "",
          version = "",
          url = "",
          git = {
            url: "",
            branch: "",
          },
          secFuncReqDir = { text: "" },
        } = declarationAndRef || {};
        const sectionIndex = index + 1;
        const formattedModifiedSfrs = createModifiedSfrs(modifiedSfrs, sfrSections, short, useCaseMap, platforms, fileType, sectionIndex);
        const formattedAdditionalSfrs = createAdditionalSfrs(additionalSfrs, sfrSections, useCaseMap, platforms, fileType, sectionIndex);
        const formattedConsistencyRationale = createConsistencyRationale(consistencyRationale);
        const sanitizedGit = removeUIOnlyKeys(git, ["open"]); // Strip out any keys which are only for UI triggers
        const formattedBasePP = {
          [`!${sectionIndex}`]: ` 5.${sectionIndex} ${short} PP Security Functional Requirements Direction `,
          "base-pp": {
            "@id": id,
            "@name": name,
            "@product": product,
            "@short": short,
            "@version": version,
            git: sanitizedGit,
            url,
            "sec-func-req-dir": secFuncReqDir.text,
            "#": [formattedModifiedSfrs, formattedAdditionalSfrs, formattedConsistencyRationale],
          },
        };

        // Add base pp to formatted base pps
        if (!formattedBasePPs.includes(formattedBasePP)) {
          formattedBasePPs.push(formattedBasePP);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }

  return formattedBasePPs;
};

const getToeSfrs = (state, toeSfrs, toeAuditTables, useCaseMap, platforms, fileType, parentSectionIndex) => {
  let formattedToeSfrs = [];

  try {
    const { selectableUUIDtoID, componentMap } = getSelectableMapFromFormItems(toeSfrs);
    let formattedMandatory = [];
    let formattedOptional = [];
    let formattedObjective = [];
    let formattedSelectionBased = [];
    let formattedImplementationDependent = [];
    const auditEventMap = generateAuditEventMap(toeAuditTables);

    // Get sfr sections
    toeSfrs?.forEach((sfr) => {
      const { nestedFormItems, title } = sfr;
      const sfrSectionID = `5.${parentSectionIndex + 1}`;

      if (nestedFormItems && title) {
        if (title === "Security Functional Requirements") {
          const { formItems } = nestedFormItems;
          let implementSet = new Set([]);

          if (formItems && formItems.length > 0) {
            // Get section values
            formItems.map((section, sfrSectionIndex) => {
              const isModule = true;
              const innerSectionID = `${sfrSectionID}.${sfrSectionIndex + 1}`;
              const { title, definition, classDescription, extendedComponentDefinition, components, sfrType = "mandatory" } = section;
              const formattedClassDescription =
                classDescription.length !== 0
                  ? {
                      "class-description": {
                        "#": classDescription,
                      },
                    }
                  : {};
              let auditTableExists = auditEventMap.hasOwnProperty(sfrType) ? auditEventMap[sfrType] : null;
              let findValues = title.split(/\(([^)]+)\)/);
              const id = findValues && findValues.length > 1 ? `${findValues[1].trim().toLowerCase()}-${sfrType}` : "";
              const formattedExtendedComponentDefinition = getFamilyExtendedComponentDefinition(extendedComponentDefinition);
              let { formattedComponents, implementSection } = getSfrComponents(
                components,
                selectableUUIDtoID,
                componentMap,
                useCaseMap,
                platforms,
                fileType,
                auditTableExists,
                isModule
              );

              // Add to implement set and compute at the last sfr section to account for all implement items
              implementSet = new Set([...implementSet, ...implementSection]);
              let formattedImplementSection = [];

              if (sfrSectionIndex === Object.keys(formItems).length - 1) {
                const implementArray = Array.from(implementSet);
                formattedImplementSection = formatImplementSection(state, implementArray);
              }

              const formattedSection = [
                { "!": ` ${innerSectionID} ${title ? title : ""} ` },
                {
                  section: {
                    "@title": title ? title : "",
                    ...(id && id.length > 0 ? { "@id": id } : {}),
                    "#": [formattedClassDescription, definition, formattedExtendedComponentDefinition, formattedComponents, formattedImplementSection],
                  },
                },
              ];

              // Add the toe sfr section to the appropriate array by sfr type
              addToeSfrToSection(
                sfrType,
                formattedSection,
                formattedMandatory,
                formattedOptional,
                formattedObjective,
                formattedImplementationDependent,
                formattedSelectionBased
              );
            });
          }

          // Generate formatted toe sfrs
          formattedToeSfrs = generateFormattedToeSfrs(
            sfrSectionID,
            toeAuditTables,
            formattedMandatory,
            formattedOptional,
            formattedObjective,
            formattedImplementationDependent,
            formattedSelectionBased
          );
        }
      }
    });
  } catch (e) {
    console.log(e);
  }

  function generateAuditEventMap(toeAuditTables) {
    let auditEventMap = {};

    try {
      if (toeAuditTables && Object.keys(toeAuditTables).length > 0) {
        Object.entries(toeAuditTables)?.forEach(([type, auditEvent]) => {
          const { isAudit = false, auditTable = defaultAudit.auditTable } = auditEvent.audit || {};
          const isTableValid = auditTable.hasOwnProperty("table") && auditTable.table !== "";

          if (isAudit && isTableValid) {
            auditEventMap[type] = { "@table": auditTable.table };
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    return auditEventMap;
  }

  function addToeSfrToSection(
    sfrType,
    formattedSection,
    formattedMandatory,
    formattedOptional,
    formattedObjective,
    formattedImplementationDependent,
    formattedSelectionBased
  ) {
    switch (sfrType) {
      case "mandatory": {
        if (!formattedMandatory.includes(formattedSection)) {
          formattedMandatory.push(formattedSection);
        }
        break;
      }
      case "optional": {
        if (!formattedOptional.includes(formattedSection)) {
          formattedOptional.push(formattedSection);
        }
        break;
      }
      case "objective": {
        if (!formattedObjective.includes(formattedSection)) {
          formattedObjective.push(formattedSection);
        }
        break;
      }
      case "implementationDependent": {
        if (!formattedImplementationDependent.includes(formattedSection)) {
          formattedImplementationDependent.push(formattedSection);
        }
        break;
      }
      case "selectionBased": {
        if (!formattedSelectionBased.includes(formattedSection)) {
          formattedSelectionBased.push(formattedSection);
        }
        break;
      }
      default: {
        console.log(`Error - ${sfrType} not available`);
        break;
      }
    }
  }

  return formattedToeSfrs;
};

const generateFormattedToeSfrs = (
  sfrSectionID,
  toeAuditTables,
  formattedMandatory,
  formattedOptional,
  formattedObjective,
  formattedImplementationDependent,
  formattedSelectionBased
) => {
  let formattedSfrSections = [];
  const formattedComment = { "!1": ` ${sfrSectionID} TOE Security Functional Requirements ` };

  try {
    formattedSfrSections = [
      formattedComment,
      generateSectionByType("man-sfrs", toeAuditTables.mandatory || {}, formattedMandatory),
      generateSectionByType("opt-sfrs", toeAuditTables.optional || {}, formattedOptional),
      generateSectionByType("sel-sfrs", toeAuditTables.selectionBased || {}, formattedSelectionBased),
      generateSectionByType("obj-sfrs", toeAuditTables.objective || {}, formattedObjective),
      generateSectionByType("impl-dep-sfrs", toeAuditTables.implementationDependent || {}, formattedImplementationDependent),
    ];
  } catch (e) {
    console.log(e);
  }

  function generateSectionByType(tag, auditTable, formattedSection) {
    return {
      [tag]:
        formattedSection && formattedSection.length > 0
          ? {
              "#": [generateAuditTableSection(auditTable), formattedSection],
            }
          : "",
    };
  }

  function generateAuditTableSection(auditData) {
    const { isAudit = false, section = defaultAudit.section, auditTable = defaultAudit.auditTable } = auditData.audit || {};
    const isSectionValid = section.id !== "" && section.id !== "";
    const isAuditTableValid = auditTable.id !== "" && auditTable.table !== "" && auditTable.title !== "";

    if (isAudit && isSectionValid && isAuditTableValid) {
      return {
        section: {
          "@id": section.id,
          "@title": section.title,
          "#": [
            section.description || "",
            {
              "audit-table": {
                "@id": auditTable.id,
                "@table": auditTable.table,
                "@title": auditTable.title,
              },
            },
          ],
        },
      };
    }
  }

  return formattedSfrSections;
};

const getToeSecurityRequirements = (formItems) => {
  let toeSfrs = [];
  let toeSars = [];
  let sections = formItems?.filter((obj) => !obj.hasOwnProperty("declarationAndRef"));

  sections.forEach((section) => {
    const { title = "", nestedFormItems = {} } = section;
    const { formItems = [] } = nestedFormItems;

    // Generate toe sfrs and sars for the toe security requirements section
    if (title === "TOE Security Requirements") {
      if (formItems && formItems.length > 0) {
        formItems.forEach((formItem) => {
          const { title = "" } = formItem;

          // Get the toe sfrs
          if (title === "Security Functional Requirements") {
            toeSfrs.push(deepCopy(formItem));
          }
          // Get the toe sars
          else if (title === "Security Assurance Requirements") {
            toeSars.push(deepCopy(formItem));
          }
        });
      }
    }
  });
  return { toeSfrs, toeSars };
};

/**
 * Returns the type of the SFR that is passed in
 * @param {*} sfrObject SFR Object from the sfrSections slice
 * @returns
 */
function getSfrType(sfrObject) {
  const sfrTypes = ["implementationDependent", "objective", "optional", "selectionBased", "useCaseBased"];

  for (const type of sfrTypes) {
    if (sfrObject[type]) return type;
  }

  return "mandatory";
}

/**
 * Returns the type of the SFR that is passed in for modules
 * @param {*} sfrName SFR name
 * @returns
 */
function getModuleSfrType(sfrName) {
  const sfrTypes = ["modified", "additional", "implementation-dependent", "objective", "optional", "selection-based"];

  for (const type of sfrTypes) {
    if (sfrName.includes(type)) return type;
  }

  return "mandatory";
}

/**
 *
 * @param {*} sfrMap sfrSections slice
 * @param {*} cc_id SFR Name (eg. FCS_CKM.1)
 * @returns
 */
function findSFRByCcId(sfrMap, cc_id) {
  for (const familyUUID in sfrMap) {
    const family = sfrMap[familyUUID];

    for (const sfrUUID in family) {
      const sfr = family[sfrUUID];
      const combinedID = sfr.iteration_id && sfr.iteration_id !== "" ? `${sfr.cc_id}/${sfr.iteration_id}` : sfr.cc_id;

      if (combinedID?.toLowerCase() === cc_id.toLowerCase()) {
        return sfr;
      }
    }
  }

  return null;
}

/**
 * Remove Object keys that are only used for UI triggers
 * @param {Object} obj source Object
 * @param {Array} keysToRemove keys in the Object that we don't want exported
 * @returns Object without specified keys
 */
function removeUIOnlyKeys(obj, keysToRemove) {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUIOnlyKeys(item, keysToRemove));
  } else if (obj && typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      if (!keysToRemove.includes(key)) {
        result[key] = removeUIOnlyKeys(obj[key], keysToRemove);
      }
    }
    return result;
  }
  return obj;
}

export const {
  SET_PP_TYPE_TO_PACKAGE,
  SET_PP_TYPE_TO_PP,
  SET_PP_TYPE_TO_MODULE,
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
  SET_MODULE_SECURITY_REQUIREMENTS,
  SET_OVERALL_STATE,
  SET_PP_PREFERENCE,
  SET_FORMATTED_XML,
  SET_BIBLIOGRAPHY,
  SET_APPENDICES,
  RESET_EXPORT,
  SET_DISTRIBUTED_TOE,
  SET_CUSTOM_SECTIONS,
} = exportSlice.actions;

export default exportSlice.reducer;
