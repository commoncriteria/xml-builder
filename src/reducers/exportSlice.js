// Imports
import { current, createSlice, original } from "@reduxjs/toolkit";
import validator from "validator";
import { defaultAudit } from "./SFRs/sfrBasePPsSlice.js";
import { deepCopy } from "../utils/deepCopy";
import { getComponentXmlID, getElementId, handleSnackBarError } from "../utils/securityComponents.jsx";
import basePPExport from "../../public/data/base_data/base_export_pp_fp.json";
import { dataMap } from "../utils/ppData.js";
import { formatEvaluationActivityDependencies, getEvaluationActivitySectionContent } from "../utils/evaluationActivityDependencies.js";
import { COMMON_REGEX, EXPORT_REGEX } from "../utils/regexUtils.js";
import { mapTechnicalDecisionAffectsForExport } from "../utils/technicalDecisionHistory.js";
import { applySelectionFormatting, mergeSelectionFormatting } from "../utils/selectionFormatting.js";

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

const defaultMandatoryAuditSection = {
  section: {
    "@id": "ss-audit-table",
    "@title": "Auditable Events for Mandatory SFRs",
    "audit-table": {
      "@id": "t-audit-mandatory",
      "@table": "mandatory",
    },
  },
};

const hasAuditSection = (auditSection) => {
  if (!auditSection) return false;
  if (typeof auditSection === "string") return auditSection.trim() !== "";
  if (Array.isArray(auditSection)) return auditSection.length > 0;
  return typeof auditSection === "object" && Object.keys(auditSection).length > 0;
};

const getAuditSectionForExport = (auditSection) => {
  return hasAuditSection(auditSection) ? auditSection : deepCopy(defaultMandatoryAuditSection);
};

const getNoChangeXPathDetail = () => ({
  type: "no-change",
  subType: "no-change",
  isComponentReplacement: false,
  replacementElements: null,
  f_element_id: null,
});

const getXPathDetailsArray = (xPathDetails, noChange = undefined) => {
  let xPathDetailsArray = Array.isArray(xPathDetails)
    ? deepCopy(xPathDetails)
    : xPathDetails && Object.keys(xPathDetails).length > 0
      ? Object.entries(xPathDetails).map(([type, detail]) => ({ type, ...(detail || {}) }))
      : [];

  if (noChange === false) {
    xPathDetailsArray = xPathDetailsArray.filter((detail) => detail.type !== "no-change");
  } else if (noChange === true && !xPathDetailsArray.some((detail) => detail.type === "no-change")) {
    xPathDetailsArray.push(getNoChangeXPathDetail());
  }

  return xPathDetailsArray;
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
                "@full": term.title,
                ...(term?.abbr && { "@abbr": term.abbr }),
                "#": term.definition,
              };
            }
          })
          .filter(Boolean); // Remove undefined values

        // Add suppressed terms (if any)
        if (action.payload.hasOwnProperty("suppressedTerms")) {
          Object.entries(action.payload.suppressedTerms).forEach(([key, value]) => {
            if (validator.isUUID(key)) {
              suppressArray.push(value.title);
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
            // useCaseConfig replaces metaData and is now an array of ref-id strings
            const { title, definition, xmlTagMeta, useCaseConfig } = term;
            // Ignore if not an object (Use Case slice has title and open keys which are string and bool)
            if (term && definition && term.xmlTagMeta) {
              // Build <config><ref-id>...</ref-id></config> when useCaseConfig is provided
              const configBlock = Array.isArray(useCaseConfig) && useCaseConfig.length > 0 ? { config: { "ref-id": useCaseConfig } } : {};

              if (title.length != 0) {
                return {
                  "@title": title,
                  "@id": xmlTagMeta.attributes.id,
                  description: definition,
                  ...configBlock,
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
      const {
        sfrSections,
        securityProblemDefinition,
        boilerplate,
        threats,
        assumptions,
        objectiveTerms,
        OSPs,
        ppTemplateVersion,
        ppType,
        sfrMaps,
        accordionSection,
      } = action.payload;
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
        state.overallObject[docType] = removeTopLevelSections(state.overallObject[docType], isSecurityProblemDefinitionSection);
      } else {
        // Organizational Security Policies section is needed for PPs/Modules, even when empty
        if ((docType === "PP" || docType === "Module") && Object.keys(reformattedOSPs).length === 0) {
          reformattedOSPs = {
            OSPs: {},
          };
        }
        const { tagName, attributes } = accordionSection.xmlTagMeta;

        const hasOSPs = Object.keys(reformattedOSPs).length > 0 && reformattedOSPs.hasOwnProperty("OSPs");

        // Determine OSP section format
        let ospSection;

        if (boilerplate === "no") {
          // boilerplate="no" -> ALWAYS use <section> format
          // https://github.com/commoncriteria/pp-template/wiki/Organizational-Security-Policies-Section
          ospSection = {
            section: {
              "@title": "Organizational Security Policies",
              "@id": "sec-osp",
              "@boilerplate": "no",
              ...(hasOSPs ? { "#": reformattedOSPs } : { OSPs: {} }),
            },
          };
        } else {
          // boilerplate is not "no" -> use sec:Organizational_Security_Policies
          ospSection = {
            "sec:Organizational_Security_Policies": {
              ...(hasOSPs ? { "#": reformattedOSPs } : { OSPs: {} }),
            },
          };
        }

        // Build the section content
        const sectionContent = {
          "#": securityProblemDefinition,
          "!1": " 3.1 Threats ",
          "sec:Threats": reformattedThreats,
          "!2": " 3.2 Assumptions ",
          "sec:Assumptions": reformattedAssumptions,
          "!3": " 3.3 Organizational Security Policies ",
          ...ospSection,
        };

        const isDefaultTag = tagName === "sec:Security_Problem_Definition";
        const newSection = isDefaultTag
          ? sectionContent
          : {
              ...(Object.keys(attributes).length > 0 ? { "@": attributes } : {}),
              ...sectionContent,
            };

        state.overallObject[docType] = setSecurityProblemDefinitionSection(state.overallObject[docType], tagName, newSection);
      }
    },
    SET_SECURITY_OBJECTIVES_SECTION: (state, action) => {
      try {
        const { toe, operationalEnvironment, objectivesToSFRs, objectivesDefinition, sfrSections } = action.payload;
        const ppType = action.payload.ppType;
        const docType = getDocType(ppType);

        // Remove section if there is no content
        if (!(toe || operationalEnvironment) && Object.keys(objectivesToSFRs).length === 0) {
          state.overallObject[docType] = removeTopLevelSections(state.overallObject[docType], isSecurityObjectivesSection);
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
          const reformattedOperationalEnvironment = getSecurityObjectives(operationalEnvironment.terms, objectivesToSFRs, sfrSections);

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

          // if there are no security objectives for the OE (SOE), remove the rationale section from the template
          if (reformattedOperationalEnvironment.length === 0) {
            delete state.overallObject[docType]["sec:Security_Objectives"]["sec:Security_Objectives_Rationale"];
          }

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

        state.overallObject[docType] = orderSecurityObjectivesSection(state.overallObject[docType]);
      } catch (e) {
        console.log(e);
      }
    },
    SET_META_DATA: (state, action) => {
      const {
        ppName,
        author,
        keywords,
        releaseDate,
        version,
        revisionHistory = [],
        technicalDecisionHistory = [],
        xmlTagMeta,
        customCSS,
      } = action.payload.metaData;
      const ppType = action.payload.ppType;
      const sfrSections = action.payload.sfrSections;

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
      const reformattedTechnicalDecisionHistory = {
        TD: Object.values(technicalDecisionHistory).map((td) => {
          const affects = mapTechnicalDecisionAffectsForExport(td.affects, sfrSections);
          return {
            number: td.number || "",
            date: td.date || "",
            subject: {
              "#": String(td.subject || "")
                .split("\n")
                .map((item, index, array) => {
                  item = item.trim();
                  if (index !== array.length - 1) {
                    item += " ";
                  }
                  return item;
                }),
            },
            url: td.url || "",
            ...(affects.length > 0 && {
              affects: {
                "ref-id": affects,
              },
            }),
          };
        }),
      };

      // Version, author, pubdate, and keywords are required in the schema
      const reformattedReference = {
        ReferenceTable: {
          ...(ppName && { PPTitle: ppName }),
          PPVersion: version || "",
          PPAuthor: author || "",
          PPPubDate: releaseDate || "",
          Keywords: keywords || "",
        },
      };

      // TODO: Revision history clipping off a number on import
      state.overallObject[docType].PPReference = reformattedReference;
      state.overallObject[docType].RevisionHistory = reformattedRevisionHistory;
      if (reformattedTechnicalDecisionHistory.TD.length > 0) {
        state.overallObject[docType].TechnicalDecisionHistory = reformattedTechnicalDecisionHistory;
      } else {
        delete state.overallObject[docType].TechnicalDecisionHistory;
      }

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

      state.overallObject[docType] = orderTechnicalDecisionHistorySection(state.overallObject[docType]);
    },
    SET_PACKAGES: (state, action) => {
      const packages = action.payload.packages;
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);

      let packageArr = [];
      if (packages.length === 0) {
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

      if (modules.length === 0) {
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
        if (topLevelSectionMatchesSelectedSection(key, value, selectedSection)) {
          newObject[`sec:${title.replace(COMMON_REGEX.allWhitespace, "_")}`] = {
            "#": text,
            ...(selectedSection ? { "@previous_section": selectedSection } : {}),
          };
        }
      }
      state.overallObject[docType] = newObject;
    },
    SET_INTRODUCTION: (state, action) => {
      const intro = action.payload.introduction.formItems;
      const ctoeData = action.payload.compliantTargets;
      const { xml: platformXML } = action.payload.platformData;
      const implementationData = action.payload.implementationData || {};
      const sec_overview_section = intro.find((formItem) => formItem.title === "Objectives of Document").xmlTagMeta.tagName || "section";
      const sec_overview_id = intro.find((formItem) => formItem.title === "Objectives of Document").xmlTagMeta.attributes?.id || "intro-overview";
      const sec_overview_title = intro.find((formItem) => formItem.title === "Objectives of Document").xmlTagMeta.attributes?.title;
      const sec_overview_text = intro.find((formItem) => formItem.title === "Objectives of Document").text;
      const sec_scope_of_document = intro.find((formItem) => formItem.title === "Scope of Document")?.text;
      const sec_intended_readership = intro.find((formItem) => formItem.title === "Intended Readership")?.text;

      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);
      const createToe = (title, intro) => {
        let formItem = intro.find((item) => item.title === title);

        if (formItem && title === "TOE Overview") {
          return {
            "#": formItem.text,
          };
        }
      };

      const getToeSubsectionTagName = (section) => {
        if (section.xmlTagMeta?.tagName) {
          return section.xmlTagMeta.tagName;
        }

        if (section.title === "TOE Boundary") {
          return "sec:TOE_Boundary";
        }

        if (section.title === "TOE Platform") {
          return "sec:TOE_Platform";
        }

        if (section.title === "TOE Operational Environment") {
          return "sec:TOE_Operational_Environment";
        }

        return "section";
      };

      const getFormattedAttributes = (attributes = {}) => {
        return Object.entries(attributes).reduce((result, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            result[`@${key}`] = value;
          }
          return result;
        }, {});
      };

      const createToeSubsection = (section) => {
        const toeText = section?.text || "";

        if (toeText.length === 0) {
          return null;
        }

        const tagName = getToeSubsectionTagName(section);
        const attributes = {
          ...(tagName === "section" ? { title: section.title } : {}),
          ...(section.xmlTagMeta?.attributes || {}),
        };

        return {
          [tagName]: {
            ...getFormattedAttributes(attributes),
            "#": toeText,
          },
        };
      };

      const createImplementationSection = () => {
        const { text = "", featureList = [], xmlTagMeta = {}, title = "Product Features Mapped to Implementation-dependent Requirements" } = implementationData;
        const hasText = text && text !== "<p><br></p>";
        const hasFeatures = featureList.length > 0;

        if (!hasText && !hasFeatures) {
          return null;
        }

        const formattedFeatures = formatImplementSection(featureList);
        const tagName = xmlTagMeta.tagName || "section";
        const attributes = {
          ...(tagName === "section" ? { title, id: "sec-features" } : {}),
          ...(xmlTagMeta.attributes || {}),
        };

        if (tagName === "section" && !attributes.title) {
          attributes.title = title;
        }

        return {
          [tagName]: {
            ...getFormattedAttributes(attributes),
            "#": [text, formattedFeatures].filter((item) => item !== "" && item !== null && item !== undefined && !(Array.isArray(item) && item.length === 0)),
          },
        };
      };

      const useCaseState = current(state.useCases);

      // Refactor this so that we're looping through the loop items and using their embedded tags
      // Search the form items for duplicate tags, and if there are, use an array
      let formattedIntroduction = {
        [sec_overview_section]: {
          "#": sec_overview_text,
          ...(sec_overview_section === "section" ? { "@id": sec_overview_id } : {}), // id attr is only allowed with section tag
          ...(sec_overview_section === "section" || sec_overview_title !== undefined ? { "@title": sec_overview_title || "Overview" } : {}),
        },
        "#": [],
      };

      // Add tech terms
      formattedIntroduction["#"].push({
        "tech-terms": current(state.techTerms),
      });

      if (sec_scope_of_document) {
        formattedIntroduction["#"].push({
          section: {
            "@title": "Scope of Document",
            "@id": "scope",
            "#": sec_scope_of_document,
          },
        });
      }

      if (sec_intended_readership) {
        formattedIntroduction["#"].push({
          section: {
            "@title": "Intended Readership",
            "@id": "intread",
            "#": sec_intended_readership,
          },
        });
      }

      if (ppType === "Protection Profile" || ppType === "Module") {
        const toeOverview = intro.find((item) => item.title === "TOE Overview");
        const toe_overview = createToe("TOE Overview", intro);
        const toe_subsections =
          toeOverview?.nestedFormItems?.formItems?.map((section) => createToeSubsection(section)).filter((section) => section !== null) || [];
        const toeContent = [toe_overview, ...toe_subsections].filter(Boolean);
        const xmlTagMeta = toeOverview?.xmlTagMeta || {
          tagName: "section",
          attributes: { title: "Compliant Targets of Evaluation" },
        };
        const toeSectionAttributes = {
          ...(xmlTagMeta.attributes || {}),
          ...(xmlTagMeta.tagName === "section" && !xmlTagMeta.attributes?.title ? { title: "Compliant Targets of Evaluation" } : {}),
        };

        const sectionObject =
          xmlTagMeta.tagName === "section"
            ? {
                section: {
                  ...getFormattedAttributes(toeSectionAttributes),
                  "#": toeContent,
                },
              }
            : {
                [xmlTagMeta.tagName]: {
                  ...getFormattedAttributes(xmlTagMeta.attributes),
                  "#": toeContent,
                },
              };

        formattedIntroduction["#"].push(sectionObject);
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
        if (useCaseState.usecase?.length > 0) {
          const useCaseIntro = action.payload.useCaseIntro;
          const useCasesObj = {
            "sec:Use_Cases": {
              "#": useCaseIntro,
              usecases: useCaseState,
            },
          };

          const existingIndex = formattedIntroduction["#"].findIndex((item) => item["sec:Use_Cases"]);

          if (existingIndex !== -1) {
            formattedIntroduction["#"][existingIndex] = useCasesObj;
          } else {
            formattedIntroduction["#"].push(useCasesObj);
          }
        }
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

      const implementationSection = createImplementationSection();
      if (implementationSection) {
        formattedIntroduction["#"].push(implementationSection);
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
      let sectionContent;

      if (action.payload.ppTemplateVersion === "Version 3.1") {
        const emptyConformanceSection = Object.values(conformanceClaims).every((editor) => editor.text.trim() === "");

        if (emptyConformanceSection) {
          sectionContent = {};
        } else {
          sectionContent = setConformanceClaimsTo3_1(state.fileType, conformanceClaims);
        }
      } else {
        sectionContent = setConformanceClaimsToCC2022(action.payload.conformanceClaims, action.payload.ppTemplateVersion);
      }

      // sec:Conformance_Claims only accepts boilerplate attribute
      if (conformanceClaims.xmlTagMeta?.attributes?.boilerplate) {
        sectionContent["@boilerplate"] = conformanceClaims.xmlTagMeta?.attributes?.boilerplate;
      }

      state.overallObject[docType]["sec:Conformance_Claims"] = sectionContent;
    },
    SET_SECURITY_REQUIREMENTS: (state, action) => {
      const sfrSections = action.payload.securityRequirements ? deepCopy(action.payload.securityRequirements) : {};
      const sfrXmlTagMeta = action.payload.securityRequirements.xmlTagMeta;
      const useCases = action.payload.useCases ? deepCopy(action.payload.useCases) : {};
      const { sars, platforms, auditSection, ppType } = action.payload;
      const { title, definition, formItems } = sfrSections;

      const docType = getDocType(ppType);

      try {
        // Get selectable ids from uuid
        const { selectableUUIDtoID, componentMap } = getSelectableMapFromFormItems(formItems);
        const useCaseMap = getUseCaseMap(useCases);
        const importedAuditSectionExists = hasAuditSection(auditSection);
        let auditTableExists = false;

        // Get sfr sections
        let sfrSections = formItems.map((sfr, sfrIndex) => {
          const { nestedFormItems, text, title } = sfr;

          if (nestedFormItems && title) {
            if (title === "Security Functional Requirements") {
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
                auditTableExists = ccIds.includes("fau_gen.1") || ccIds.includes("fau_gen_ext.1") || docType === "Package" || importedAuditSectionExists;

                // Get section values
                innerSections = formItems.map((section, sfrSectionIndex) => {
                  const sectionID = `5.${sfrIndex + 1}.${sfrSectionIndex + 1}`;
                  const { title, definition, extendedComponentDefinition, components } = section;
                  const id = getSfrSectionId(section);
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

                  return [
                    { "!": ` ${sectionID} ${title ? title : ""} ` },
                    {
                      section: {
                        ...(id && { "@id": id }),
                        "@title": title ? title : "",
                        "#": [definition, formattedExtendedComponentDefinition, formattedComponents],
                      },
                    },
                  ];
                });
              }

              return {
                "@title": title,
                "#": [text ? text : "", innerSections],
              };
            } else if (title === "Security Assurance Requirements") {
              const { formItems } = nestedFormItems;
              let innerSections = [];
              if (formItems && formItems.length > 0) {
                // Get section values
                innerSections = formItems.map((section, _sfrSectionIndex) => {
                  const { title, summary, components } = section;

                  let formattedComponents = getSARComponents(sars.elements, components, selectableUUIDtoID, platforms);

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

        const sarSectionCandidate = sfrSections.find((section) => section && section["@title"] === "Security Assurance Requirements");
        const sarHasContent =
          sarSectionCandidate &&
          Array.isArray(sarSectionCandidate["#"]) &&
          sarSectionCandidate["#"].some((item) => (Array.isArray(item) ? item.length > 0 : item && item !== ""));
        const auditSectionForExport = auditTableExists ? getAuditSectionForExport(auditSection) : "";

        if (docType !== "Package" && sarHasContent) {
          const sfrFunctionalSection = sfrSections.find((section) => section && section["@title"] === "Security Functional Requirements");
          const sarSection = sfrSections.find((section) => section && section["@title"] === "Security Assurance Requirements");
          const securityRequirementsAttributes = sfrXmlTagMeta?.attributes || {};
          const useSectionTag = sfrXmlTagMeta?.tagName === "section" && securityRequirementsAttributes.id && securityRequirementsAttributes.title === title;
          const securityRequirementsTagName = useSectionTag ? sfrXmlTagMeta.tagName : "sec:Security_Requirements";
          const sfrSectionAttributes =
            sfrXmlTagMeta?.sfrAttributes || (sfrXmlTagMeta?.attributes?.title === "Security Functional Requirements" ? sfrXmlTagMeta.attributes : {});
          const sfrSectionTagName = sfrXmlTagMeta?.sfrTagName === "section" ? "section" : "sec:SFRs";

          const securityRequirementsSection = {
            "@title": useSectionTag ? securityRequirementsAttributes.title : title,
            ...(useSectionTag ? { "@id": securityRequirementsAttributes.id } : {}),
            "#": [
              definition ? definition : "",
              { "!": " 5.1 Security Functional Requirements" },
              {
                [sfrSectionTagName]: {
                  "@title": sfrSectionAttributes.title || "Security Functional Requirements",
                  ...(sfrSectionAttributes.id ? { "@id": sfrSectionAttributes.id } : {}),
                  "#": [auditSectionForExport, sfrFunctionalSection],
                },
              },
              { "!": " 5.2 Security Assurance Requirements " },
              {
                [sars.xmlTagMeta.tagName]: {
                  "@title": sars.xmlTagMeta.attributes.hasOwnProperty("title") ? sars.xmlTagMeta.attributes.title : "Security Assurance Requirements",
                  "#": [sarSection],
                  // Conditionally add id if there is one (not setting a default as transforms doesn't expect the attribute for all PPs)
                  ...(sars.xmlTagMeta.attributes.hasOwnProperty("id") && { "@id": sars.xmlTagMeta.attributes.id }),
                },
              },
            ],
          };

          state.overallObject[docType] = setSecurityRequirementsSection(state.overallObject[docType], securityRequirementsTagName, securityRequirementsSection);
        } else {
          // Packages normally won't have SARs, and will not have a parent <sec:req>, but solely the <sec:Security_Functional_Requirements>
          // Creating a new object to replace overallObject with, since we need to preserve order and replace the sec:req key with sec:Security_Functional_Requirements
          const originalPackage = state.overallObject[docType];
          const newPackage = {};

          Object.keys(originalPackage).forEach((key) => {
            if (isPackageSecurityRequirementsKey(key)) {
              const sfrSection = sfrSections.find((section) => section && section["@title"] === "Security Functional Requirements");

              if (sfrSection) {
                const { ["@title"]: _, ...cleanedSfrSection } = sfrSection; // Remove @title

                newPackage["sec:Security_Functional_Requirements"] = {
                  "#": [auditSectionForExport, cleanedSfrSection],
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

          // Build shared selectable map from all sources (Module SFRs + SFRs from external base PP's)
          const sharedSelectableUUIDtoID = {};
          const sharedComponentMap = {};

          // TOE SFRs
          const { selectableUUIDtoID: toeMap, componentMap: toeComponentMap } = getSelectableMapFromFormItems(toeSfrs);
          Object.assign(sharedSelectableUUIDtoID, toeMap);
          Object.assign(sharedComponentMap, toeComponentMap);

          // Base PP modified + additional SFR sections
          basePPs?.forEach((basePP) => {
            const { modifiedSfrs = {}, additionalSfrs = {} } = basePP || {};
            const { sfrSections: modSections = {} } = modifiedSfrs;
            const { sfrSections: addSections = {} } = additionalSfrs;

            [...Object.keys(modSections), ...Object.keys(addSections)].forEach((uuid) => {
              const section = sfrSections[uuid];
              if (section) {
                getSelectableUUIDMapFromComponents(section, sharedSelectableUUIDtoID, sharedComponentMap);
              }
            });
          });

          let formattedSfrBasePPs = getSFRBasePPs(basePPs, sfrSections, useCaseMap, platforms, state.fileType, sharedSelectableUUIDtoID, sharedComponentMap);
          let formattedSfrSections = getToeSfrs(
            toeSfrs,
            toeAuditData,
            useCaseMap,
            platforms,
            state.fileType,
            formattedSfrBasePPs.length,
            sharedSelectableUUIDtoID,
            sharedComponentMap
          );
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
        if (key === "entries") {
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
        getTopLevelElementName(k, v) === targetSectionKey || (getTopLevelElementName(k, v) === "section" && topLevelEntryHasTitle(k, v, targetSectionTitle));

      // Remove only previous Distributed TOE sections. Other top-level generic <section> entries are distinct XML nodes.
      const distributedToeTitle = introFormatted["@title"];
      const filtered = Object.entries(state.overallObject[docType]).filter(([k, v]) => !isDistributedToeSection(k, v, distributedToeTitle));
      const distributedToeEntry = createTopLevelElementEntry(sectionName, distributedToeBlock, "distributedToe");

      const idx = filtered.findIndex(targetSection);

      // Insert after the target section if found, otherwise append
      if (idx !== -1) {
        filtered.splice(idx + 1, 0, distributedToeEntry);
      } else {
        filtered.push(distributedToeEntry);
      }

      state.overallObject[docType] = Object.fromEntries(filtered);
    },
    SET_APPENDICES: (state, action) => {
      let appendices = [];
      const ppType = action.payload.ppType;
      const docType = getDocType(ppType);
      const valGuideAppendix = action.payload.state.validationGuidelinesAppendix;
      if (valGuideAppendix.xmlContent != "" || Object.keys(valGuideAppendix.xmlTagMeta).length !== 0) {
        const valGuideAppendixFormatted = {
          "@title": valGuideAppendix.xmlTagMeta?.attributes?.title ?? "Validation Guidelines",
          "@id": valGuideAppendix.xmlTagMeta?.attributes?.id ?? "validation_guidelines",
          "#": valGuideAppendix.xmlContent,
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

      const vectorAppendix = action.payload.state.vectorAppendix;
      if (vectorAppendix.xmlContent != "" || Object.keys(vectorAppendix.xmlTagMeta).length !== 0) {
        const vectorAppendixFormatted = {
          "@title": vectorAppendix.xmlTagMeta?.attributes?.title ?? "Initialization Vector Requirements for NIST-Approved Cipher Modes",
          "@id": vectorAppendix.xmlTagMeta?.attributes?.id ?? "vector",
          "#": vectorAppendix.xmlContent,
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
          "@title": app.title.replace("Appendix - ", ""),
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
const formatImplementSection = (implementSection) => {
  try {
    if (implementSection && implementSection.length > 0) {
      const formattedFeatures = implementSection
        .filter((feature) => feature && (feature.id || feature.title || feature.description))
        .map((feature) => {
          const { id, title, description } = feature;

          return {
            "@id": id,
            "@title": title,
            description: description || "",
          };
        });

      if (formattedFeatures.length > 0) {
        return {
          implements: {
            feature: formattedFeatures,
          },
        };
      }
    }
  } catch (e) {
    console.log(e);
  }
  return "";
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

    if (terms[key].consistencyRationale && terms[key].consistencyRationale.length > 0) {
      output += `<consistency-rationale>${terms[key].consistencyRationale}</consistency-rationale>`;
    }

    if (!Object.hasOwn(terms[key], "sfrs")) return;
    output += `<!-- New mapping to build updated threat mapping table. -->`;

    // Add sfr type
    const updatedSFRs = terms[key].sfrs
      .map((sfr) => {
        // External PP SFRs — pass through directly, no lookup needed
        if (sfr.uuid?.includes("::")) {
          return { ...sfr, sfrType: "external", stateSFR: null };
        }

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

    updatedSFRs.forEach(({ name, rationale, sfrType, uuid }) => {
      const isExternalPP = uuid?.includes("::");

      if (isExternalPP) {
        output += `<addressed-by>${name}</addressed-by>`;
      } else if (!isModule) {
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
        const { title, definition, objectives, consistencyRationale } = term;
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
          ...(consistencyRationale && { "consistency-rationale": consistencyRationale }),
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
        const { title, definition, consistencyRationale } = value;
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
          ...(consistencyRationale && consistencyRationale.length > 0 ? { "consistency-rationale": consistencyRationale } : {}),
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
        const { title, famId } = def;
        return {
          "ext-comp-def": {
            "@title": title ? title : "",
            "@fam-id": famId ? famId : "",
            ...getExtendedComponentDefinitionChild(def),
          },
        };
      });
    }
  } catch (e) {
    console.log(e);
  }

  return formattedExtendedComponentDefinition;
};

const getExtendedComponentDefinitionChild = (def = {}) => {
  const definitionChild = {
    "fam-behavior": def.famBehavior ? def.famBehavior : "",
  };

  if (def.modDef) {
    definitionChild["mod-def"] = def.modDef;
  }

  return definitionChild;
};

function getSfrSectionId(section = {}) {
  if (section.id) {
    return section.id;
  }

  const title = section.title || "";
  const titleAcronym = title.match(COMMON_REGEX.parentheticalContent)?.[1] || title.match(COMMON_REGEX.classTitleAcronym)?.[1];

  return titleAcronym ? titleAcronym.trim().toLowerCase() : "";
}

function isPackageSecurityRequirementsKey(key) {
  return ["sec:req", "sec:Security_Requirements", "sec:Security_Functional_Requirements"].includes(key);
}

function setSecurityProblemDefinitionSection(overallObject, tagName, sectionContent) {
  const entries = removeTopLevelSectionEntries(Object.entries(overallObject), isSecurityProblemDefinitionSection);
  const sectionEntry = createTopLevelElementEntry(tagName, sectionContent, "securityProblemDefinition");
  const insertIndex = entries.findIndex(([key, value]) => isSecurityObjectivesSection(key, value) || isSecurityRequirementsSection(key, value));

  if (insertIndex !== -1) {
    entries.splice(insertIndex, 0, sectionEntry);
  } else {
    insertAfterLast(entries, isConformanceClaimsSection, sectionEntry);
  }

  return Object.fromEntries(entries);
}

function orderTechnicalDecisionHistorySection(overallObject) {
  if (!overallObject?.TechnicalDecisionHistory || !overallObject?.RevisionHistory) {
    return overallObject;
  }

  const technicalDecisionHistory = overallObject.TechnicalDecisionHistory;
  const entries = Object.entries(overallObject).filter(([key]) => key !== "TechnicalDecisionHistory");
  const revisionHistoryIndex = entries.findIndex(([key]) => key === "RevisionHistory");

  if (revisionHistoryIndex === -1) {
    return overallObject;
  }

  entries.splice(revisionHistoryIndex + 1, 0, ["TechnicalDecisionHistory", technicalDecisionHistory]);
  return Object.fromEntries(entries);
}

function orderSecurityObjectivesSection(overallObject) {
  const entries = Object.entries(overallObject);
  const objectiveEntry = entries.find(([key, value]) => isSecurityObjectivesSection(key, value));

  if (!objectiveEntry) {
    return overallObject;
  }

  const withoutObjectives = removeTopLevelSectionEntries(entries, isSecurityObjectivesSection);
  const securityRequirementsIndex = withoutObjectives.findIndex(([key, value]) => isSecurityRequirementsSection(key, value));

  if (securityRequirementsIndex !== -1) {
    withoutObjectives.splice(securityRequirementsIndex, 0, objectiveEntry);
  } else {
    insertAfterLast(withoutObjectives, isSecurityProblemDefinitionSection, objectiveEntry);
  }

  return Object.fromEntries(withoutObjectives);
}

function setSecurityRequirementsSection(overallObject, tagName, sectionContent) {
  const entries = removeTopLevelSectionEntries(Object.entries(overallObject), isSecurityRequirementsSection);
  const sectionEntry = createTopLevelElementEntry(tagName, sectionContent, "securityRequirements");
  const objectivesIndex = findLastIndex(entries, ([key, value]) => isSecurityObjectivesSection(key, value));
  const spdIndex = findLastIndex(entries, ([key, value]) => isSecurityProblemDefinitionSection(key, value));
  const claimsIndex = findLastIndex(entries, ([key, value]) => isConformanceClaimsSection(key, value));
  const insertIndex = Math.max(objectivesIndex, spdIndex, claimsIndex);

  if (insertIndex !== -1) {
    entries.splice(insertIndex + 1, 0, sectionEntry);
  } else {
    entries.push(sectionEntry);
  }

  return Object.fromEntries(entries);
}

function createTopLevelElementEntry(tagName, sectionContent, entryName) {
  if (tagName === "section") {
    return [`#${entryName}`, { [tagName]: sectionContent }];
  }

  return [tagName, sectionContent];
}

function removeTopLevelSections(overallObject, predicate) {
  return Object.fromEntries(removeTopLevelSectionEntries(Object.entries(overallObject), predicate));
}

function removeTopLevelSectionEntries(entries, predicate) {
  return entries.filter(([key, value]) => !predicate(key, value));
}

function insertAfterLast(entries, predicate, entry) {
  const targetIndex = findLastIndex(entries, ([key, value]) => predicate(key, value));

  if (targetIndex !== -1) {
    entries.splice(targetIndex + 1, 0, entry);
  } else {
    entries.push(entry);
  }
}

function findLastIndex(items, predicate) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index], index)) {
      return index;
    }
  }

  return -1;
}

function isSecurityRequirementsSection(key, value) {
  const tagName = getTopLevelElementName(key, value);
  return (
    tagName === "sec:req" || tagName === "sec:Security_Requirements" || (tagName === "section" && topLevelEntryHasTitle(key, value, "Security Requirements"))
  );
}

function isSecurityProblemDefinitionSection(key, value) {
  const tagName = getTopLevelElementName(key, value);
  return (
    tagName === "sec:Security_Problem_Definition" ||
    tagName === "sec:Security_Problem_Description" ||
    tagName === "spd" ||
    tagName === "sec:spd" ||
    (tagName === "section" && topLevelEntryHasTitle(key, value, "Security Problem Definition"))
  );
}

function isSecurityObjectivesSection(key, value) {
  const tagName = getTopLevelElementName(key, value);
  return tagName === "sec:Security_Objectives" || (tagName === "section" && topLevelEntryHasTitle(key, value, "Security Objectives"));
}

function isConformanceClaimsSection(key, value) {
  const tagName = getTopLevelElementName(key, value);
  return tagName === "sec:Conformance_Claims" || (tagName === "section" && topLevelEntryHasTitle(key, value, "Conformance Claims"));
}

function isDistributedToeSection(key, value, distributedToeTitle) {
  return getTopLevelElementName(key, value) === "section" && topLevelEntryHasTitle(key, value, distributedToeTitle);
}

function topLevelSectionMatchesSelectedSection(key, value, selectedSection) {
  if (!selectedSection) {
    return false;
  }

  const tagName = getTopLevelElementName(key, value);
  const content = getTopLevelElementContent(key, value);
  const title = getTopLevelTitle(content);

  return (
    title === selectedSection ||
    tagNameToSectionTitle(tagName) === selectedSection ||
    (selectedSection === "Distributed TOE" && title === "Introduction to Distributed TOEs")
  );
}

function tagNameToSectionTitle(tagName) {
  if (!tagName || tagName === "section") {
    return "";
  }

  return tagName.replace(EXPORT_REGEX.secPrefix, "").replace(COMMON_REGEX.underscore, " ");
}

function topLevelEntryHasTitle(key, value, title) {
  const content = getTopLevelElementContent(key, value);

  if (Array.isArray(content)) {
    return content.some((item) => getTopLevelTitle(item) === title);
  }

  return getTopLevelTitle(content) === title;
}

function getTopLevelElementName(key, value) {
  const wrappedEntry = getWrappedTopLevelElementEntry(key, value);
  return wrappedEntry ? wrappedEntry[0] : key;
}

function getTopLevelElementContent(key, value) {
  const wrappedEntry = getWrappedTopLevelElementEntry(key, value);
  return wrappedEntry ? wrappedEntry[1] : value;
}

function getWrappedTopLevelElementEntry(key, value) {
  if (!key.startsWith("#") || !value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const elementEntries = Object.entries(value).filter(([childKey]) => !childKey.startsWith("@") && !childKey.startsWith("#") && !childKey.startsWith("!"));
  return elementEntries.length === 1 ? elementEntries[0] : null;
}

function getTopLevelTitle(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (value["@title"] || value["@"]?.title) {
    return value["@title"] || value["@"]?.title;
  }

  if (value["#"] && !Array.isArray(value["#"]) && typeof value["#"] === "object") {
    return value["#"]["@title"] || value["#"]["@"]?.title;
  }

  return undefined;
}

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
          dependsComments = {},
          dependsExternalDocs = {},
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
          noChange,
          notNew,
          xPathDetails,
        } = initialComponent;
        let componentName = ` ${cc_id + (iteration_id && iteration_id.length > 0 ? "/" + iteration_id + " " : " ") + title} `;
        let formattedExtendedComponentDefinition =
          extendedComponentDefinition && !modifiedSfr ? getExtendedComponentDefinition(extendedComponentDefinition) : [];
        let { formattedCcId, formattedIterationId, componentXmlId } = getComponentXmlID(cc_id, iteration_id, false, true);
        const hasConsistencyRationale = consistencyRationale !== undefined && consistencyRationale !== null;
        const shouldExportConsistencyRationale = modifiedSfr || additionalSfr || isModule || hasConsistencyRationale;
        let formattedConsistencyRationale = shouldExportConsistencyRationale ? { "consistency-rationale": consistencyRationale || "" } : "";
        let formattedFromPackage = modifiedSfr && Object.keys(fromPkgData).length > 0 ? getFromPackage(fromPkgData) : "";
        // Modified SFRs always export as base-sfr-spec; xPathDetails only determines directive handling.
        const xPathDetailsArray = getXPathDetailsArray(xPathDetails, noChange);

        const hasXPathDetails = modifiedSfr && xPathDetailsArray.length > 0;
        const hasComponentReplacement = xPathDetailsArray.some((x) => x.isComponentReplacement);
        const titleTag = modifiedSfr ? "base-sfr-spec" : "f-component";
        const includeAuditTable = auditTableExists && !invisible;

        let component;

        if (hasXPathDetails && hasComponentReplacement) {
          const compReplacement = xPathDetailsArray.find((x) => x.isComponentReplacement);

          // Bare f-component for inside replace/xpath-specified — just elements
          const replacementFComponent = {
            "@cc-id": cc_id ? cc_id.toLowerCase() : "",
            "@name": title || "",
            "#": [
              getSfrElements(
                elements ? elements : {},
                selectableUUIDtoID,
                componentUUID,
                formattedCcId,
                formattedIterationId,
                evaluationActivities,
                platforms,
                modifiedSfr,
                xPathDetailsArray
              ),
            ],
          };

          component = [
            { "!": componentName },
            {
              "base-sfr-spec": {
                "@cc-id": cc_id ? cc_id.toLowerCase() : "",
                "@id": xml_id ? xml_id : componentXmlId,
                "@title": title || "",
                ...(notNew ? { "@notnew": notNew } : {}),
                depends: [],
                "#": [
                  iteration_id && iteration_id !== "" ? { "@iteration": iteration_id } : "",
                  formattedConsistencyRationale,
                  definition && definition !== "" ? { description: definition } : "",

                  // <replace> wrapper around the f-component
                  {
                    replace: {
                      "xpath-specified": {
                        "@xpath": compReplacement.xpath,
                        "#": {
                          "f-component": replacementFComponent, // bare, no consistency-rationale/description, etc
                        },
                      },
                    },
                  },
                  // Handle app note replacements
                  ...xPathDetailsArray
                    .filter((x) => x.subType === "note")
                    .map((x) => ({
                      replace: {
                        "xpath-specified": {
                          "@xpath": x.xpath,
                          "#": {
                            note: {
                              "@role": "application",
                              "#": x.noteContent || "",
                            },
                          },
                        },
                      },
                    })),
                ],
              },
            },
          ];
        } else {
          // Standard component or f-element level replacements
          const setStatusDetail = xPathDetailsArray.find((x) => x.type === "set-status");
          const formattedVirtualizationConsistencyRationale =
            fileType === "Virtualization System" && formattedExtendedComponentDefinition.length > 0 && !formattedConsistencyRationale
              ? { "consistency-rationale": "" }
              : "";
          component = [
            { "!": componentName },
            {
              [titleTag]: {
                "@cc-id": cc_id ? cc_id.toLowerCase() : "",
                "@id": xml_id ? xml_id : componentXmlId,
                ...(titleTag === "base-sfr-spec" ? { "@title": title || "" } : { "@name": title || "" }),
                ...(notNew ? { "@notnew": notNew } : {}),
                depends: [],
                "#": [
                  iteration_id && iteration_id !== "" ? { "@iteration": iteration_id } : "",
                  formattedVirtualizationConsistencyRationale,
                  formattedConsistencyRationale,
                  formattedExtendedComponentDefinition,
                  definition && definition !== "" ? { description: definition } : "",
                  formattedFromPackage,
                  setStatusDetail ? { "set-status": { "@status": setStatusDetail.status } } : "",
                  setStatusDetail
                    ? []
                    : getSfrElements(
                        elements ? elements : {},
                        selectableUUIDtoID,
                        componentUUID,
                        formattedCcId,
                        formattedIterationId,
                        evaluationActivities,
                        platforms,
                        modifiedSfr,
                        xPathDetailsArray
                      ),
                  includeAuditTable ? getAuditEvents(auditEvents, auditTableExists) : [],
                ],
              },
            },
          ];
        }

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
            dependsComments,
            dependsExternalDocs,
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
      // xPathDetails can have multiple directives (eg. more than one replace)
      const xPathDetailsArray = getXPathDetailsArray(xPathDetails);

      const hasNoChange = xPathDetailsArray.some((x) => x.type === "no-change");
      const hasComponentReplacement = xPathDetailsArray.some((x) => x.isComponentReplacement);

      if (modifiedSfr && hasNoChange) {
        elements.push({ "no-change": {} });
        return elements;
      }

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
                  { title: parseElement(element) },
                  element.extCompDefTitle ? { "ext-comp-def-title": element.extCompDefTitle } : null,
                  note ? { note: getNote(note) } : "",
                  formattedEvaluationActivities,
                ],
              },
            };

            // Add in additional fields for the modified sfr element
            if (modifiedSfr) {
              if (!xPathDetailsArray || xPathDetailsArray.length === 0) {
                // Old modified sfrs format — no xPathDetails
                if (!elements.includes(formattedElement)) {
                  elements.push(formattedElement);
                }
              } else if (hasNoChange) {
                // no-change — skip element serialization, handled below
              } else if (hasComponentReplacement) {
                // Full f-component replacement — replace all elements
                // (the base-sfr-spec wrapper with replace/xpath-specified is handled at component level)
                if (!elements.includes(formattedElement)) {
                  elements.push(formattedElement);
                }
              } else {
                // Mod reform format — find matching xPathDetail for this element
                const matchingDetail = xPathDetailsArray.find((x) => x.subType === "f-element" && x.f_element_id === elementXMLID);

                if (matchingDetail) {
                  let formattedModifiedElement = {
                    replace: {
                      "xpath-specified": {
                        "@xpath": `*//cc:f-element[@id='${elementXMLID}']`,
                        "#": formattedElement,
                      },
                    },
                  };
                  if (!elements.includes(formattedModifiedElement)) {
                    elements.push(formattedModifiedElement);
                  }
                } else {
                  // Element not modified — still serialize as plain f-element
                  if (!elements.includes(formattedElement)) {
                    elements.push(formattedElement);
                  }
                }
              }
            } else {
              // Add formatted element to the elements
              if (!elements.includes(formattedElement)) {
                elements.push(formattedElement);
              }
            }
          } catch (e) {
            handleSnackBarError("SFR Element Generation Error");
            console.log(e);
          }
        });
      } else {
        if (hasNoChange) {
          elements.push({ "no-change": {} });
        } else {
          xPathDetailsArray
            .filter((x) => x.type === "insert-after" || x.type === "insert-before")
            .forEach((x) => {
              elements.push({
                [x.type]: {
                  "xpath-specified": {
                    "@xpath": x.xpath,
                    "#": x.xPathContent,
                  },
                },
              });
            });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  return elements;
};

const getNote = (note, role = "application") => {
  return {
    "@role": role || "application",
    "#": `${note}`,
  };
};

const parseElement = (element) => {
  let finalResult = "";
  const { title, selectables, selectableGroups, isManagementFunction, managementFunctions, tabularize } = element;

  const isWrappedSelectableGroup = (group) =>
    Array.isArray(group?.description) &&
    group.description.every((item) => {
      const keys = Object.keys(item);
      return keys.length === 1 && keys[0] === "groups" && Array.isArray(item.groups);
    });

  function parseTitleOrDescriptionArray(titleOrDescription, inheritedFormatting = {}) {
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
      const assignmentEdgeCase = item.groups && item.groups.length === 1 && selectables[item.groups[0]] && selectables[item.groups[0]].assignment;

      if (item.text) {
        // Structural closing tags (e.g. "</li></ul>") are stored as { text } items so
        // TipTap doesn't strip them. Strip any preceding trailing space so we don't emit
        // " </li></ul>" in the title XML — the space would become a text node inside the
        // element that was just closed.
        const textVal = item.text;
        if (textVal.trimStart().startsWith("</") && result.endsWith(" ")) {
          result = result.trimEnd() + textVal;
        } else {
          result = removeSpace(result, textVal);
        }
      } else if (item.description) {
        result = removeSpace(result, applySelectionFormatting(item.description, inheritedFormatting));
      } else if (item.assignment) {
        const assignable = selectables[item.assignment];
        if (!assignable) return;
        const assignmentFormatting = mergeSelectionFormatting(inheritedFormatting, assignable);
        const formattedDescription = applySelectionFormatting(assignable.description, assignmentFormatting);
        result += ` <assignable>${formattedDescription}</assignable> `;
      } else if (item.selections) {
        const group = selectableGroups[item.selections];
        if (!group) return;
        const onlyone = group.onlyOne || (group.exclusive && isWrappedSelectableGroup(group)) ? ` choose-one-of="yes"` : "";
        const linebreak = group.linebreak ? ` linebreak="yes"` : "";

        const formattedSelectables = ` <selectables${onlyone}${linebreak}>${parseSelections(item.selections)}</selectables> `;
        result += formattedSelectables;
      } else if (assignmentEdgeCase) {
        const validKey = item.groups[0];
        if (!selectables[validKey]) return;

        const selectable = selectables[validKey];
        const { description, readable } = selectable;
        const readableTag = readable ? `<readable>${readable}</readable>` : "";
        const assignmentFormatting = mergeSelectionFormatting(inheritedFormatting, selectable);
        const formattedDescription = applySelectionFormatting(description, assignmentFormatting);

        result += ` ${readableTag}<assignable>${formattedDescription}</assignable> `;
      } else if (item.tabularize) {
        result += parseTabularize(tabularize);
      } else {
        if (item.groups) {
          const group = selectableGroups[item.groups];
          const onlyone = group?.onlyOne ? ` choose-one-of="yes"` : "";
          const linebreak = group?.linebreak ? ` linebreak="yes"` : "";
          result += ` <selectables${onlyone}${linebreak}>`;
          item.groups.forEach((groupKey) => {
            result += parseSelections(groupKey);
          });
          result += "</selectables> ";
        }
      }
    });

    if (isManagementFunction) {
      result.replace(EXPORT_REGEX.managementFunctionTrailingPeriod, "");
    }

    return result.replace(EXPORT_REGEX.caretWhitespace, "^").replace(EXPORT_REGEX.closingTagsBeforeSelectionBracket, "$1$2");
  }

  // Within the 'selections' field of a title array, one or two things can happen
  // 1. We have a singular selectable
  // 2. We have a group
  function parseSelections(selectionKey, inheritedFormatting = {}) {
    let nestedResults = "";
    const group = selectableGroups[selectionKey];

    const parseSelectableKey = (validKey, formatting = inheritedFormatting) => {
      if (selectables[validKey]) {
        const selectable = selectables[validKey];
        const { description, exclusive, id, assignment, readable } = selectable;
        const selectableFormatting = mergeSelectionFormatting(formatting, selectable);
        const isExclusive = exclusive ? 'exclusive="yes"' : "";
        const attributes = `id="${id}" ${isExclusive}`;
        const assignableOpeningTag = assignment ? "<assignable>" : "";
        const assignableClosingTag = assignment ? "</assignable>" : "";
        const readableTag = readable ? `<readable>${readable}</readable>` : "";
        const formattedDescription = applySelectionFormatting(description, selectableFormatting);

        return `<selectable ${attributes}>${readableTag}${assignableOpeningTag}${formattedDescription}${assignableClosingTag}</selectable>`;
      } else if (selectableGroups[validKey]) {
        const readableTag = selectableGroups[validKey].readable ? `<readable>${selectableGroups[validKey].readable}</readable>` : "";
        return `<selectable id="${validKey}">${readableTag}${parseGroup(validKey, mergeSelectionFormatting(formatting, selectableGroups[validKey]))}</selectable>`;
      }

      return "";
    };

    if (group === undefined) {
      nestedResults += parseSelectableKey(selectionKey, inheritedFormatting);
    } else if (Array.isArray(group.groups)) {
      const groupFormatting = mergeSelectionFormatting(inheritedFormatting, group);
      group.groups.forEach((validKey) => {
        nestedResults += parseSelectableKey(validKey, groupFormatting);
      });
    } else if (Array.isArray(group.description)) {
      const groupFormatting = mergeSelectionFormatting(inheritedFormatting, group);
      // If a complex selectable only wraps group references, export it like the selectable group
      // the user likely intended to create.
      if (isWrappedSelectableGroup(group)) {
        group.description.forEach((item) => {
          item.groups.forEach((validKey) => {
            nestedResults += parseSelectableKey(validKey, groupFormatting);
          });
        });
      } else {
        const readableTag = group.readable ? `<readable>${group.readable}</readable>` : "";
        nestedResults += `<selectable id="${selectionKey}">${readableTag}${parseGroup(selectionKey, groupFormatting)}</selectable>`;
      }
    }

    return nestedResults;
  }

  // Complex selectable
  function parseGroup(groupKey, inheritedFormatting = {}) {
    let nestedResults = "";
    const group = selectableGroups[groupKey];
    const groupFormatting = mergeSelectionFormatting(inheritedFormatting, group);
    if (group.description) {
      nestedResults += parseTitleOrDescriptionArray(group.description, groupFormatting);
    } else {
      nestedResults += parseSelections(groupKey, groupFormatting);
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
    const { statusMarkers, rows, columns, attributes } = managementFunctions;
    let result = statusMarkers !== "" ? `Status Markers:<br/> ${statusMarkers}<br/>` : "";

    // Construct the management function set
    const { columnResult, fields } = parseManagementFunctionColumns(columns);
    const rowResult = parseManagementFunctionRows(rows, fields);

    // Convert attributes object → string like: key="value" key2="value2"
    const attributesString =
      attributes && Object.keys(attributes).length
        ? " " +
          Object.entries(attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ")
        : "";

    result += `<management-function-set ${attributesString}>${columnResult}${rowResult}</management-function-set>`;

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
          ${activityAndNote && activityAndNote.length > 0 ? activityAndNote : ""}
          </management-function>
        `;
      });
    } catch (e) {
      console.log(e);
    }

    return result;
  }

  function createAActivityAndNote(evaluationActivity, notes, selectableUUIDtoID = {}, platforms = []) {
    const {
      tss = "",
      guidance = "",
      testIntroduction = "",
      testClosing = "",
      testLists = {},
      tests = {},
      isNoTest = false,
      noTest = "",
      refIds = [],
      tssDependencies = [],
      tssDependencySections = [],
      guidanceDependencies = [],
      guidanceDependencySections = [],
    } = evaluationActivity;
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

    const formattedRefIds = createRefIdTags(refIds);

    // Add in no test if present
    if (isNoTest) {
      result += `<aactivity>${formattedRefIds}<no-tests>${noTest}</no-tests></aactivity>`;
    } else {
      // Add in evaluation activity
      // Create formatted test list
      let formattedTestList = "";

      const createDependsTags = (dependencies = []) => {
        return formatEvaluationActivityDependencies(dependencies, selectableUUIDtoID, platforms)
          .map(({ depends }) => {
            const attr = Object.keys(depends)[0];
            return `<depends ${attr.slice(1)}="${depends[attr]}"/>`;
          })
          .join("");
      };
      const createRawDependsTags = (depends = []) => {
        return depends
          .filter(Boolean)
          .map((depend) => {
            const attributes = Object.entries(depend)
              .map(([key, value]) => `${key.startsWith("@") ? key.slice(1) : key}="${value}"`)
              .join(" ");
            return attributes ? `<depends ${attributes}/>` : "";
          })
          .join("");
      };
      const createTestListDependsTags = (testList = {}) => {
        const rawDepends = Array.isArray(testList.depends) ? testList.depends : [];
        if (rawDepends.length > 0) {
          return createRawDependsTags(rawDepends);
        }

        return createDependsTags(testList.dependencies || []);
      };
      const createTestList = (testListUUID) => {
        const testList = testLists[testListUUID];
        if (!testList) return "";

        let xml = `<testlist>${createTestListDependsTags(testList)}${testList.description || ""}`;

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

      const createActivitySection = (tagName, content = "", dependencies = [], dependencySections = []) => {
        const validDependencySections = Array.isArray(dependencySections) ? dependencySections : [];

        if (validDependencySections.length > 0) {
          const sectionContent = validDependencySections
            .map((dependencySection) => {
              const sectionDependencies = Array.isArray(dependencySection?.dependencies) ? dependencySection.dependencies : [];
              return `<div>${createDependsTags(sectionDependencies)}${dependencySection?.text || ""}</div>`;
            })
            .join("");

          if (dependencies.length > 0) {
            return `<${tagName}><div>${createDependsTags(dependencies)}${content || ""}</div>${sectionContent}</${tagName}>`;
          }

          return `<${tagName}>${content || ""}${sectionContent}</${tagName}>`;
        }

        if (dependencies.length > 0) {
          return `<${tagName}><div>${createDependsTags(dependencies)}${content || ""}</div></${tagName}>`;
        }

        return content && content.length !== 0 ? `<${tagName}>${content}</${tagName}>` : `<${tagName}/>`;
      };
      const tssDependencyList = Array.isArray(tssDependencies) ? tssDependencies : [];
      const guidanceDependencyList = Array.isArray(guidanceDependencies) ? guidanceDependencies : [];
      const tssDependencySectionList = Array.isArray(tssDependencySections) ? tssDependencySections : [];
      const guidanceDependencySectionList = Array.isArray(guidanceDependencySections) ? guidanceDependencySections : [];
      const hasTss = tss.length !== 0 || tssDependencyList.length > 0 || tssDependencySectionList.length > 0;
      const hasGuidance = guidance.length !== 0 || guidanceDependencyList.length > 0 || guidanceDependencySectionList.length > 0;
      const hasTests = testIntroduction.length !== 0 || formattedTestList.length !== 0 || testClosing.length !== 0;
      const hasEvaluationActivity = hasTss || hasGuidance || hasTests;

      if (hasEvaluationActivity) {
        result += `
          <aactivity>
            ${formattedRefIds}
            ${createActivitySection("TSS", tss, tssDependencyList, tssDependencySectionList)}
            ${createActivitySection("Guidance", guidance, guidanceDependencyList, guidanceDependencySectionList)}
            ${hasTests ? `<Tests>${testIntroduction}${formattedTestList}${testClosing}</Tests>` : "<Tests/>"}
          </aactivity>
			  `;
      }
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
  }
  return finalResult;
};

const getExtendedComponentDefinition = (extendedComponentDefinition) => {
  const { toggle, audit, managementFunction, componentLeveling, dependencies } = extendedComponentDefinition || {};
  let formattedExtendedComponentDefinition = [];

  if (extendedComponentDefinition === undefined) return formattedExtendedComponentDefinition;

  // Helper function to collapse multiple if statements
  function addFormattedDefinition(key, value) {
    if (value !== undefined && value !== null) {
      let formattedValue = { [key]: value || "" };
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
  dependsComments,
  dependsExternalDocs,
  invisible,
  extendedComponentDefinition, // TODO: check why this is unused
  isModule
) => {
  if (component && component[1]) {
    let fComponent = component[1]["f-component"];
    let dependsNodes = [];
    const commentMap = dependsComments || {};
    const extneralDocMap = dependsExternalDocs || {};
    const addDependsNode = (dependsValue, key) => {
      const formattedDepends = extneralDocMap[key]
        ? { depends: { ...dependsValue, "external-doc": { "@ref": extneralDocMap[key] } } }
        : { depends: dependsValue };
      const hasMatch = dependsNodes.some((node) => node.depends && JSON.stringify(node.depends) === JSON.stringify(dependsValue));

      if (!hasMatch) {
        dependsNodes.push(formattedDepends);
        if (commentMap[key]) {
          dependsNodes.push({ "!": commentMap[key] });
        }
      }
    };

    const finalizeDependsNodes = () => {
      if (dependsNodes.length > 0) {
        const existingChildren = Array.isArray(fComponent["#"]) ? fComponent["#"] : [fComponent["#"]].filter(Boolean);

        fComponent["#"] = [...dependsNodes, ...existingChildren];
      }

      delete fComponent["depends"];
    };

    // Add implementation dependent
    if (implementationDependent && reasons && reasons.length > 0) {
      if (!isModule) {
        fComponent["@status"] = "feat-based";
      }
      reasons.forEach((reason) => {
        const reasonId = typeof reason === "string" ? reason : reason?.id;

        if (!reasonId) {
          return;
        }

        let formattedReason = {
          "@on": reasonId,
        };

        // Add formatted reason
        addDependsNode(formattedReason, `reason:${reasonId}`);
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
                addDependsNode(formattedID, `component:${id}`);
              }
            });
          }

          // Get selections
          selections.selections.forEach((selection) => {
            // if the dependency ID doesn't map back to a selectable, it could be a complex selectable, so
            // just retain the name
            const id = selectableUUIDtoID[selection] ? selectableUUIDtoID[selection] : selection;
            const formattedID = { "@on-sel": id };
            addDependsNode(formattedID, `selection:${id}`);
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
          addDependsNode(formattedUseCase, `useCase:${useCaseMap[useCase]}`);
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
      if (fComponent.hasOwnProperty("@status") && (fComponent["@status"] === "sel-based" || fComponent["@status"] === "feat-based")) {
        addDependsNode(formatted, "child:optional");
      } else if (!isModule) {
        fComponent["@status"] = "optional";
      } else if (isModule) {
        addDependsNode(formatted, "child:optional");
      }
    }

    // Add objective
    else if (objective) {
      let formatted = { objective: {} };
      if (fComponent.hasOwnProperty("@status") && (fComponent["@status"] === "sel-based" || fComponent["@status"] === "feat-based")) {
        addDependsNode(formatted, "child:objective");
      } else if (!isModule) {
        fComponent["@status"] = "objective";
      } else if (isModule) {
        addDependsNode(formatted, "child:objective");
      }
    }

    finalizeDependsNodes();
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
                selectable: [description ? description : "", "None"],
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
                      selectable: [info ? info : "", "No additional information"],
                    },
                  },
                });
              } else {
                // `info` can include preserved XHTML from imported audit-event-info content
                // such as <h:ul>/<h:li>. Keep it as the node payload for XMLExporter.
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
    let formattedEvaluationActivity = {};
    if (evaluationActivity) {
      const {
        introduction = "",
        hasLevelSet = false,
        tss = "",
        tssDependencies = [],
        tssDependencySections = [],
        guidance = "",
        guidanceDependencies = [],
        guidanceDependencySections = [],
        testIntroduction = "",
        testClosing = "",
        testLists = {},
        tests = {},
        isNoTest,
        noTest,
      } = evaluationActivity;

      const formatDependsAttributes = (depends = []) => {
        return depends.filter(Boolean).map((depend) => ({ depends: depend }));
      };
      const getFormattedTestListDependencies = (testList = {}) => {
        const rawDepends = Array.isArray(testList.depends) ? testList.depends : [];
        if (rawDepends.length > 0) {
          return formatDependsAttributes(rawDepends);
        }

        return formatEvaluationActivityDependencies(testList.dependencies || [], selectableUUIDtoID, platforms);
      };
      const tssDependencyList = Array.isArray(tssDependencies) ? tssDependencies : [];
      const guidanceDependencyList = Array.isArray(guidanceDependencies) ? guidanceDependencies : [];
      const tssDependencySectionList = Array.isArray(tssDependencySections) ? tssDependencySections : [];
      const guidanceDependencySectionList = Array.isArray(guidanceDependencySections) ? guidanceDependencySections : [];

      formattedEvaluationActivity.aactivity = {
        ...(hasLevelSet ? { "@level": isComponent ? "component" : "element" } : {}),
      };

      if (isNoTest) {
        formattedEvaluationActivity.aactivity["no-tests"] = noTest;
      } else {
        let isAactivity =
          evaluationActivity &&
          Object.keys(evaluationActivity).length > 0 &&
          (introduction ||
            tss ||
            guidance ||
            tssDependencyList.length > 0 ||
            tssDependencySectionList.length > 0 ||
            guidanceDependencyList.length > 0 ||
            guidanceDependencySectionList.length > 0 ||
            testIntroduction ||
            testLists ||
            tests);

        // Get evaluation activity values
        if (isAactivity) {
          // Get introduction
          if (introduction && introduction !== "") {
            formattedEvaluationActivity.aactivity["#"] = introduction;
          }

          // Get TSS (Ensuring empty tag is present if there is no TSS)
          formattedEvaluationActivity.aactivity.TSS = getEvaluationActivitySectionContent(
            tss,
            tssDependencyList,
            selectableUUIDtoID,
            platforms,
            tssDependencySectionList
          );

          // Get Guidance (Ensuring empty tag is present if no Guidance)
          formattedEvaluationActivity.aactivity.Guidance = getEvaluationActivitySectionContent(
            guidance,
            guidanceDependencyList,
            selectableUUIDtoID,
            platforms,
            guidanceDependencySectionList
          );

          if ("customea" in evaluationActivity) {
            formattedEvaluationActivity.aactivity.CustomEA = {
              "@name": evaluationActivity.customea.nameAttribute,
              "#": evaluationActivity.customea.text,
            };
          }

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

                    const formattedDependencies = formatEvaluationActivityDependencies(dependencies, selectableUUIDtoID, platforms);

                    const formatTest = (test) => {
                      let nested = [];

                      if (Array.isArray(test.nestedTestListUUIDs) && test.nestedTestListUUIDs.length > 0) {
                        test.nestedTestListUUIDs.forEach((nestedListUUID) => {
                          const nestedList = testLists[nestedListUUID];
                          if (!nestedList) return;

                          const nestedTests = nestedList.testUUIDs
                            .map((nestedUUID) => (tests[nestedUUID] ? formatTest(tests[nestedUUID]) : null))
                            .filter(Boolean);

                          nested.push({
                            testlist: {
                              "#": [getFormattedTestListDependencies(nestedList), nestedList.description || "", nestedTests, nestedList.conclusion || ""],
                            },
                          });
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

                // Insert an <h:br/> after every test except the last
                const formattedTestsWithBreaks =
                  formattedTests && formattedTests.length > 1
                    ? formattedTests.flatMap((t, idx) => (idx < formattedTests.length - 1 ? [t, { "h:br": {} }] : [t]))
                    : formattedTests;

                const formattedTestList = {
                  testlist: {
                    "#": [getFormattedTestListDependencies(testList), description, formattedTestsWithBreaks, conclusion],
                  },
                };

                formattedTestLists.push(formattedTestList);
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

const getSARComponents = (allSARElements, initialComponents, selectableUUIDtoID = {}, platforms = []) => {
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
              ...(summary && summary.length > 0 && { summary: summary }),
              "#": [getSARElements(elements, selectableUUIDtoID, platforms)],
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
  let formattedConformance = {};

  const cclaimInfo = conformanceClaims;
  const { stConformance, part2Conformance, part3Conformance, cc_errata, ppClaims, packageClaims, evaluationMethods, additionalInformation, cClaimsXMLTagMeta } =
    cclaimInfo;

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
  formattedConformance[cClaimsXMLTagMeta.tagName] = {
    "@cc-version": cClaimsXMLTagMeta.attributes?.["cc-version"]?.length != 0 ? cClaimsXMLTagMeta.attributes?.["cc-version"] : "cc-2022r1",
    "@cc-approach":
      cClaimsXMLTagMeta.attributes?.["cc-approach"]?.length != 0
        ? cClaimsXMLTagMeta.attributes?.["cc-approach"]
        : ppTemplateVersion === "CC2022 Standard"
          ? "standard"
          : "direct-rationale",
    ...(cc_errata !== "N/A" && { "@cc-errata": cc_errata }),
    ...(cClaimsXMLTagMeta.attributes?.["display"]?.length != 0 && { "@display": cClaimsXMLTagMeta.attributes?.["display"] }),
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

const getSARElements = (initialElements, selectableUUIDtoID = {}, platforms = []) => {
  let elements = [];
  try {
    initialElements.forEach((element) => {
      // Get SAR element
      const { aactivity, note, noteRole, title, type } = element;
      try {
        let formattedAActivity = aactivity;
        if (aactivity && typeof aactivity === "object") {
          const formattedEvaluationActivities = [];
          getSfrEvaluationActivities(aactivity, formattedEvaluationActivities, selectableUUIDtoID, false, platforms);
          formattedAActivity = formattedEvaluationActivities[0]?.aactivity || "";
        }

        // Return elements here
        let formattedElement = {
          "a-element": {
            "@type": type,
            "#": [{ title: title }, note ? { note: getNote(note, noteRole) } : "", ...(formattedAActivity !== "" ? [{ aactivity: formattedAActivity }] : [])],
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

const createAdditionalSfrs = (
  additionalSfrs,
  sfrSections,
  useCaseMap,
  platforms,
  fileType,
  sectionIndex,
  sharedSelectableUUIDtoID = null,
  sharedComponentMap = null
) => {
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
    const selectableUUIDtoID = sharedSelectableUUIDtoID ? { ...sharedSelectableUUIDtoID } : {};
    const componentMap = sharedComponentMap ? { ...sharedComponentMap } : {};

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
          ...getExtendedComponentDefinitionChild(def),
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

const createModifiedSfrs = (
  modifiedSfrs,
  sfrSections,
  short,
  useCaseMap,
  platforms,
  fileType,
  sectionIndex,
  sharedSelectableUUIDtoID = null,
  sharedComponentMap = null
) => {
  const { introduction = "", sfrSections: modifiedSfrSections = {} } = modifiedSfrs || {};
  let formattedSfrSections = [];

  try {
    // Generate modified sfr sections
    if (modifiedSfrSections && Object.keys(modifiedSfrSections)?.length > 0) {
      let filteredSections = {};
      const selectableUUIDtoID = sharedSelectableUUIDtoID ? { ...sharedSelectableUUIDtoID } : {};
      const componentMap = sharedComponentMap ? { ...sharedComponentMap } : {};

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
                  "@id": id || `mod-${(title.match(COMMON_REGEX.parentheticalContent) || [])[1].toLowerCase()}` || `id-${Math.floor(Math.random() * 100000)}`, // generate random ID
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
        const { elements = {}, cc_id = "", iteration_id = "", noChange, xPathDetails = {} } = component || {};
        const originalComponent = getOriginalComponent(cc_id.toUpperCase(), iteration_id, short.toLowerCase());
        const elementsValid = elements && Object.keys(elements).length > 0;

        // Create a new component
        let newComponent = deepCopy(component);
        newComponent.elements = {};

        let hasModifiedElements = false;
        let hasInsertionDirectives = false;
        const directiveKeys = getXPathDetailsArray(xPathDetails, noChange);
        const hasNoChange = directiveKeys.some((key) => key.type === "no-change");

        // Filter components down based on changed elements
        if (originalComponent && elementsValid) {
          const { elements: originalElements = {} } = originalComponent || {};

          // Create a reverse lookup: map elementXMLID -> elementUUID
          const originalElementsByXMLID = Object.values(originalElements).reduce((acc, el, idx) => {
            if (el.elementXMLID) {
              acc[el.elementXMLID] = el;
            }
            return acc;
          }, {});

          // Run through each element to check for any updates from the original element
          Object.entries(elements).forEach(([elementUUID, element]) => {
            // Check for modified elements based on mod reform structure
            let isElementUpdated = originalElements.hasOwnProperty(elementUUID) && JSON.stringify(element) !== JSON.stringify(originalElements[elementUUID]);

            if (!isElementUpdated) {
              // Check elements for old modified sfr structure (component is new/not integrated with original component from base PP)
              const originalElement = originalElementsByXMLID[element.elementXMLID];
              isElementUpdated = originalElement && JSON.stringify(element) !== JSON.stringify(originalElement);
            }

            if (isElementUpdated) {
              newComponent.elements[elementUUID] = deepCopy(element);
              hasModifiedElements = true;
            }
          });
        }

        // Check for <insert-after>, <insert-before>, <no-change>
        if (directiveKeys.length > 0) {
          if (hasNoChange) {
            newComponent.elements = {};
            hasModifiedElements = false;
          }

          hasInsertionDirectives = directiveKeys.some(
            (key) => key.type === "insert-after" || key.type === "insert-before" || key.type === "no-change" || key.type === "set-status"
          );
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

const getSFRBasePPs = (basePPs, sfrSections, useCaseMap, platforms, fileType, sharedSelectableUUIDtoID = null, sharedComponentMap = null) => {
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
          cPP = false,
          url = "",
          git = {
            url: "",
            branch: "",
          },
          secFuncReqDir = { text: "" },
        } = declarationAndRef || {};
        const sectionIndex = index + 1;
        const formattedModifiedSfrs = createModifiedSfrs(
          modifiedSfrs,
          sfrSections,
          short,
          useCaseMap,
          platforms,
          fileType,
          sectionIndex,
          sharedSelectableUUIDtoID,
          sharedComponentMap
        );
        const formattedAdditionalSfrs = createAdditionalSfrs(
          additionalSfrs,
          sfrSections,
          useCaseMap,
          platforms,
          fileType,
          sectionIndex,
          sharedSelectableUUIDtoID,
          sharedComponentMap
        );
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
            ...(declarationAndRef.plural ? { "@plural": declarationAndRef.plural } : {}),
            ...(sanitizedGit.url && sanitizedGit.branch ? { git: sanitizedGit } : {}),
            url,
            ...(cPP ? { cPP: {} } : {}),
            ...(secFuncReqDir.text ? { "sec-func-req-dir": secFuncReqDir.text } : {}), // only include if it has content, omission of this triggers boilerplate from transforms
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

const getToeSfrs = (
  toeSfrs,
  toeAuditTables,
  useCaseMap,
  platforms,
  fileType,
  parentSectionIndex,
  sharedSelectableUUIDtoID = null,
  sharedComponentMap = null
) => {
  let formattedToeSfrs = [];

  try {
    // Use shared map if provided, otherwise build from formItems
    const { selectableUUIDtoID, componentMap } = sharedSelectableUUIDtoID
      ? { selectableUUIDtoID: sharedSelectableUUIDtoID, componentMap: sharedComponentMap }
      : getSelectableMapFromFormItems(toeSfrs);
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
              const { id: family_id, title, definition, classDescription, extendedComponentDefinition, components, sfrType = "mandatory" } = section;
              const formattedClassDescription =
                classDescription.length !== 0
                  ? {
                      "class-description": {
                        "#": classDescription,
                      },
                    }
                  : {};
              let auditTableExists = auditEventMap.hasOwnProperty(sfrType) ? auditEventMap[sfrType] : null;
              let findValues = title.split(COMMON_REGEX.parentheticalContent);
              const id = family_id ? family_id : findValues && findValues.length > 1 ? `${findValues[1].trim().toLowerCase()}-${sfrType}` : "";
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

              const formattedSection = [
                { "!": ` ${innerSectionID} ${title ? title : ""} ` },
                {
                  section: {
                    "@title": title ? title : "",
                    ...(id && id.length > 0 ? { "@id": id } : {}),
                    "#": [formattedClassDescription, definition, formattedExtendedComponentDefinition, formattedComponents],
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
      { "mod-sars": "" },
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
    const isSectionValid = section.id !== "";
    const isAuditTableValid = (auditTable.id !== "" && auditTable.table !== "") || auditTable.title !== "";

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
                ...(auditTable.title && auditTable.title.trim() !== "" ? { "@title": auditTable.title } : {}),
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
  const sfrTypes = ["selectionBased", "implementationDependent", "objective", "optional", "useCaseBased"];

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
