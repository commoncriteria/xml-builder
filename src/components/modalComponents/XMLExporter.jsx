import PropTypes from "prop-types";
import { useEffect, useRef, useState, useMemo } from "react";
import XMLViewer from "react-xml-viewer";
import { useDispatch, useSelector } from "react-redux";
import { create } from "xmlbuilder2";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { Button, TextField } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import {
  SET_INTRODUCTION,
  SET_CONFORMANCE_CLAIMS,
  SET_META_DATA,
  SET_TECH_TERMS,
  SET_SECURITY_PROBLEM_DEFINITION_SECTION,
  SET_USE_CASES,
  SET_SECURITY_OBJECTIVES_SECTION,
  SET_SECURITY_REQUIREMENTS,
  SET_FORMATTED_XML,
  SET_BIBLIOGRAPHY,
  SET_APPENDICES,
  SET_PACKAGES,
  SET_MODULES,
  SET_PP_PREFERENCE,
  SET_DISTRIBUTED_TOE,
  SET_PP_TYPE_TO_PACKAGE,
  SET_PP_TYPE_TO_PP,
  SET_PP_TYPE_TO_MODULE,
  SET_MODULE_SECURITY_REQUIREMENTS,
  SET_CUSTOM_SECTIONS,
} from "../../reducers/exportSlice";
import { deepCopy } from "../../utils/deepCopy";
import { handleSnackBarSuccess, handleSnackBarError, getSfrMaps } from "../../utils/securityComponents.jsx";
import Modal from "./Modal";
import format from "xml-formatter";
import { style_tags } from "../../utils/fileParser.js";

/**
 * The XML Exporter class that packages the form into an XML export file
 * @returns {JSX.Element}   the XML exporter modal content
 * @constructor             passes in props to the class
 */
function XMLExporter({ open, handleOpen, preview }) {
  XMLExporter.propTypes = {
    open: PropTypes.bool,
    handleOpen: PropTypes.func,
    preview: PropTypes.bool.isRequired,
  };

  // Constants
  const { primary, secondary, linkText } = useSelector((state) => state.styling);
  const stateObject = useSelector((state) => state);
  const ppTemplateVersion = useSelector((state) => state.accordionPane.metadata.ppTemplateVersion);
  const ppType = useSelector((state) => state.accordionPane.metadata.ppType); // Ensure ppType is fetched from the Redux store
  const overallObject = useSelector((state) => state.exports.overallObject);
  const formattedXML = useSelector((state) => state.exports.formattedXML);
  const dispatch = useDispatch();
  const [fileName, setFileName] = useState("download");
  const previousStateObject = usePrevious(stateObject);
  const previousOverallObject = usePrevious(overallObject);
  const TESTING = false;
  const editors = useSelector((state) => state.editors);
  const allSections = useSelector((state) => state.accordionPane.sections);
  const customSections = useMemo(() => {
    return Object.values(allSections).filter((section) => section.custom !== undefined && !section.selectedSection?.toLowerCase().startsWith("appendix"));
  }, [allSections]);

  // Use Effects
  useEffect(() => {
    if (JSON.stringify(previousOverallObject) !== JSON.stringify(overallObject) && (open || preview)) {
      exportXML();
    }
  }, [overallObject]);
  useEffect(() => {
    if (JSON.stringify(previousStateObject) !== JSON.stringify(stateObject) && preview) {
      generateFormattedJSON();
    }
  }, [stateObject]);

  // Methods
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  const getTerms = () => {
    const terms = Object.values(stateObject.terms);

    if (!terms || terms.length == 0) return;

    // search through object to find the relevant terms lists
    const techTerms = terms.find((group) => group.title == "Technical Terms");
    const suppressedTerms = terms.find((group) => group.title == "Suppressed Terms");
    const acronyms = terms.find((group) => group.title == "Acronyms");
    // acronyms are just tech terms without without a definition, combine upon export them here
    dispatch(SET_TECH_TERMS({ techTerms: { ...techTerms, ...acronyms }, suppressedTerms }));

    const useCases = terms.find((group) => group.title == "Use Cases");
    dispatch(SET_USE_CASES({ useCases: useCases }));
    return useCases;
  };

  const getSecurityProblemDefinitionSection = () => {
    const securityProblemDefinition = stateObject.threats.securityProblemDefinition;
    const threatsSlice = Object.values(stateObject.threats);
    const objectivesSlice = Object.values(stateObject.objectives);

    const threats = threatsSlice.find((group) => group.title == "Threats");
    const assumptions = threatsSlice.find((group) => group.title == "Assumptions");
    const OSPs = threatsSlice.find((group) => group.title == "Organizational Security Policies");
    const objectiveTerms = getObjectiveTerms(objectivesSlice);

    dispatch(
      SET_SECURITY_PROBLEM_DEFINITION_SECTION({
        sfrSections: stateObject.sfrSections,
        securityProblemDefinition: securityProblemDefinition,
        threats: threats,
        assumptions: assumptions,
        objectiveTerms: objectiveTerms,
        OSPs: OSPs,
        ppTemplateVersion: stateObject.accordionPane.metadata.ppTemplateVersion,
        ppType: ppType,
        sfrMaps: getSfrMaps(),
      })
    );
  };

  const getSecurityObjectives = () => {
    const sfrSlice = Object.values(stateObject.sfrSections);
    const objectivesSlice = Object.values(stateObject.objectives);
    const toe = objectivesSlice.find((group) => group.title == "Security Objectives for the TOE");
    const operationalEnvironment = objectivesSlice.find((group) => group.title == "Security Objectives for the Operational Environment");
    const objectivesToSFRs = getObjectivesToSFRs(sfrSlice);

    dispatch(
      SET_SECURITY_OBJECTIVES_SECTION({
        objectivesDefinition: stateObject.objectives.objectivesDefinition || "",
        sfrSections: stateObject.sfrSections,
        toe: toe,
        operationalEnvironment: operationalEnvironment,
        objectivesToSFRs: objectivesToSFRs,
        ppType: ppType, // Pass ppType as part of the payload
      })
    );
  };

  const getObjectivesToSFRs = (sfrs) => {
    let objectivesToSFRs = {};
    if (sfrs) {
      Object.values(sfrs).forEach((sfr) => {
        Object.values(sfr).forEach((sfrSection) => {
          const { cc_id, iteration_id, objectives } = sfrSection;
          const sfr_name = `${cc_id}${iteration_id && iteration_id !== "" ? "/" + iteration_id : ""}`;
          const objectivesValid = objectives && objectives.length > 0;
          if (objectivesValid) {
            objectives.forEach((objective) => {
              const objectiveUUID = objective.uuid;
              const rationale = objective.rationale ? objective.rationale : "";
              const item = { sfr_name: sfr_name, rationale: rationale };
              if (objectiveUUID) {
                if (!objectivesToSFRs.hasOwnProperty(objectiveUUID)) {
                  objectivesToSFRs[objectiveUUID] = [];
                }
                if (!objectivesToSFRs[objectiveUUID].includes(item)) {
                  objectivesToSFRs[objectiveUUID].push(item);
                }
              }
            });
          }
        });
      });
    }
    return objectivesToSFRs;
  };

  const getObjectiveTerms = (objectivesSlice) => {
    let objectives = {};
    if (objectivesSlice && Object.keys(objectivesSlice).length > 0) {
      Object.values(objectivesSlice).map((section) => {
        let terms = section.terms;
        if (terms && Object.keys(terms).length > 0) {
          Object.assign(objectives, terms);
        }
      });
    }
    return objectives;
  };

  const getMetaData = () => {
    const metaData = stateObject.accordionPane.metadata;
    dispatch(SET_META_DATA({ metaData: metaData, ppType: ppType }));
  };

  const getSliceInfo = (uuid, contentType) => {
    // Use the UUID to go into the right slice to fetch our info
    const { editors, threats, objectives, terms, sfrBasePPs } = stateObject;

    // TODO: Make the content types more consistent in name
    // const result = stateObject[contentType + "s"][uuid]
    switch (contentType) {
      case "editor":
        return editors[uuid];
      case "threats":
        return threats[uuid];
      case "objectives":
        return objectives[uuid];
      case "sfrBasePPs":
        return sfrBasePPs[uuid];
      case "terms":
        return terms[uuid];
      default:
    }
  };

  const getNestedFormItemInfo = (uuid, contentType, formItems) => {
    const { terms, sfrs, sars, sfrSections, editors } = stateObject;
    let filledFormItem;

    switch (contentType) {
      case "terms":
        filledFormItem = terms[uuid];
        break;
      case "sfrs": {
        let section = deepCopy(sfrs.sections[uuid]);
        section.components = sfrSections.hasOwnProperty(uuid) ? deepCopy(sfrSections[uuid]) : {};
        filledFormItem = section;
        break;
      }
      case "sars": {
        // Get the SAR family
        let section = deepCopy(sars.sections[uuid]);

        // Get associated components of the SAR family
        const components = section.componentIDs.map((compUUID) => sars.components[compUUID]);
        section.components = section.componentIDs.length !== 0 ? components : [];
        filledFormItem = section;
        break;
      }
      case "editor":
        filledFormItem = editors[uuid];
        break;
      default:
        return null;
    }

    // If this item has nested formItems, process them recursively
    if (formItems && Array.isArray(formItems)) {
      return {
        ...filledFormItem,
        nestedFormItems: {
          formItems: formItems.map((child) => getNestedFormItemInfo(child.uuid, child.contentType, child.formItems)),
        },
      };
    } else {
      // Ensure formItems is always an array for consistency
      return {
        ...filledFormItem,
        formItems: [],
      };
    }
  };

  const parseSections = (useCases) => {
    const sections = Object.values(stateObject.accordionPane.sections);
    const platformData = stateObject.accordionPane.platformData;
    const sars = stateObject.sars;
    const formattedSections = {};
    const ppPreference = stateObject.ppPreference;
    const ctoes = stateObject.compliantTargetsOfEvaluation;

    sections.forEach((section) => {
      const key = section.xmlTagMeta ? section.xmlTagMeta.tagName : section.title;

      formattedSections[key] = {
        title: section.title,
        ...(section.selected_section && section.selected_section.length !== 0 ? { selected_section: section.selected_section } : {}),
        formItems: section.formItems.map((formItem) => {
          const { uuid, contentType } = formItem;

          // go into the relevant slice and pull the right info
          const filledFormItem = getSliceInfo(uuid, contentType);

          // If there is a nested formItems list in this formItem, we need to populate it
          if (formItem?.formItems) {
            const nestedFormItems = {
              formItems: formItem.formItems.map((formItem) => {
                const { uuid, contentType, formItems } = formItem;
                return getNestedFormItemInfo(uuid, contentType, formItems);
              }),
            };
            return { ...filledFormItem, nestedFormItems };
          } else return { ...filledFormItem, ...{ formItems: [] } };
        }),
        tag: key,
      };
    });

    // Get sections
    const { ["sec:Introduction"]: introduction, ["Distributed TOE"]: distributedTOE } = formattedSections;
    const cc2022conformanceClaims = stateObject.conformanceClaims;
    const version3_1conformanceClaimsObject = Object.values(stateObject.accordionPane.sections).find((section) => section.title === "Conformance Claims");
    const version3_1_conformanceEditorUUIDs = version3_1conformanceClaimsObject ? version3_1conformanceClaimsObject.formItems.map((editor) => editor.uuid) : [];
    const version3_1_conformanceClaimsObject = Object.fromEntries(
      Object.entries(stateObject.editors).filter(([key]) => version3_1_conformanceEditorUUIDs.includes(key))
    );
    let { ["Security Requirements"]: securityRequirements } = formattedSections;

    // Add in security requirements definition if it is present to Security Requirements section
    if (securityRequirements && securityRequirements.tag === "Security Requirements") {
      const { sfrDefinition } = stateObject.sfrs;
      const { sfrBasePPDefinition } = stateObject.sfrBasePPs;
      const definition = ppType === "Module" ? sfrBasePPDefinition : sfrDefinition;

      if (definition && definition !== "" && definition !== "<p><br></p>") {
        securityRequirements.definition = definition.valueOf();
      }
    }

    // Export sections
    dispatch(
      SET_INTRODUCTION({
        introduction: introduction,
        platformData: platformData,
        compliantTargets: ctoes,
        ppType: ppType,
      })
    );
    if (ppPreference !== "") dispatch(SET_PP_PREFERENCE({ ppPreference: ppPreference, ppType: ppType }));

    if (stateObject.accordionPane.metadata.ppTemplateVersion == "Version 3.1") {
      dispatch(
        SET_CONFORMANCE_CLAIMS({
          conformanceClaims: version3_1_conformanceClaimsObject,
          ppTemplateVersion: ppTemplateVersion,
          ppType: ppType,
        })
      );
    } else {
      // CC2022 Conformance
      dispatch(
        SET_CONFORMANCE_CLAIMS({
          conformanceClaims: cc2022conformanceClaims,
          ppTemplateVersion: ppTemplateVersion,
          ppType: ppType,
        })
      );
    }

    // Set security requirements based on pp type
    if (ppType === "Module") {
      const { toeSfrs: toeAuditData = {} } = stateObject.sfrs || {};
      dispatch(
        SET_MODULE_SECURITY_REQUIREMENTS({
          securityRequirements,
          useCases,
          sars,
          toeAuditData,
          sfrSections: deepCopy(stateObject.sfrSections),
          platforms: stateObject.accordionPane.platformData.platforms,
        })
      );
    } else {
      dispatch(
        SET_SECURITY_REQUIREMENTS({
          securityRequirements,
          useCases,
          sars,
          platforms: stateObject.accordionPane.platformData.platforms,
          auditSection: stateObject.sfrs.auditSection,
          ppType,
        })
      );
    }
    dispatch(SET_APPENDICES({ state: stateObject, ppType: ppType }));
    dispatch(SET_BIBLIOGRAPHY({ bibliography: stateObject.bibliography, ppType: ppType }));
    dispatch(SET_PACKAGES({ packages: stateObject.includePackage.packages, ppType: ppType }));
    dispatch(SET_MODULES({ modules: stateObject.modules, ppType: ppType }));
    if (distributedTOE && stateObject.distributedTOE && stateObject.distributedTOE.intro.length > 0) {
      dispatch(
        SET_DISTRIBUTED_TOE({
          state: stateObject.distributedTOE,
          distributedTOE,
          ppType: ppType,
        })
      ); // Pass ppType
    }
    customSections.forEach((section) => {
      dispatch(
        SET_CUSTOM_SECTIONS({
          text: editors[section.custom].text,
          title: section.title,
          selectedSection: section.selectedSection,
          ppType,
        })
      );
    });
  };

  const generateFormattedJSON = () => {
    try {
      switch (ppType) {
        case "Protection Profile":
          dispatch(SET_PP_TYPE_TO_PP());
          break;
        case "Module":
          dispatch(SET_PP_TYPE_TO_MODULE());
          break;
        case "Functional Package":
          dispatch(SET_PP_TYPE_TO_PACKAGE());
          break;
      }

      getMetaData();
      let terms = getTerms();
      parseSections(terms);
      getSecurityProblemDefinitionSection();
      getSecurityObjectives();
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  const exportXML = () => {
    try {
      const doc = create(overallObject);

      // xmlbuilder2 escapes all xml tags that are stored as text, so we need to "unescape" them
      let txt = document.createElement("textarea");
      txt.innerHTML = doc.end({ prettyPrint: true });
      let xmlString = txt.value;
      xmlString = cleanUpXml(xmlString);
      xmlString = addNamespace(xmlString);

      // xmlString = format(xmlString, {
      //   indentation: "  ", // 2-space indent
      //   collapseContent: true, // true for keeping text on same line
      //   lineSeparator: "\n", // newline separator
      //   stripComments: false, // keep comments if any (currently we are not importing any comments)
      // });

      // Fix new line issues - Formatter separates node types on new lines
      // (eg. If there are quotes followed by inline rich text, then the quote is on one line
      // and the rich text is on the next line, then extra whitespace gets introduced between
      // quote and text when it comes to rendering the HTML)
      xmlString = xmlString.replace(/"\s*\n\s*</g, '"<');
      xmlString = xmlString.replace(/>\s*\n\s*"/g, '>"');

      // Flip this to true at top of file if we don't want file downloads
      if (preview) {
        dispatch(SET_FORMATTED_XML({ xmlString: xmlString }));
      } else if (TESTING) {
        console.log(xmlString);
      } else {
        const blob = new Blob([xmlString], { type: "text/xml" });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = href;
        link.download = `${fileName ? fileName : "download"}.xml`; // Name of the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleSnackBarSuccess("Exported XML Successfully");
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (!preview) {
        handleOpen();
      }
    }
  };

  const handleSetFileName = (event) => {
    let fileName = event.target.value;
    let trimmed = fileName.replace(/[/\\?%*:|"<>]/g, "-");
    setFileName(trimmed);
  };

  // Utils
  const cleanUpXml = (xmlString) => {
    // Fixes tags that have a hanging space at the end
    const removeWhiteSpaceRegex = /<(\w+)\s+>/g;

    let cleanedXmlString = xmlString.replace(removeWhiteSpaceRegex, "<$1>");

    // Build regex to match any style tag
    const tagPattern = style_tags.join("|");

    // Remove space after any opening style tag and before an opening selectable-like tag
    // eg. <i> <selectables> -> <i><selectables>
    const openSpace = new RegExp(`(</?(?:${tagPattern})\\b[^>]*>)\\s+(?=<(?:selectables|selectable|assignable)\\b)`, "gi");

    // Remove space after any closing style tag and before a closing selectable-like tag
    // eg. </i> </selectables> -> </i></selectables>
    const closeSpace = new RegExp(`(</(?:${tagPattern})\\s*>)\\s+(?=</(?:selectables|selectable|assignable)\\b)`, "gi");

    cleanedXmlString = cleanedXmlString.replace(openSpace, "$1").replace(closeSpace, "$1");

    return cleanedXmlString;
  };

  function addNamespace(content) {
    const nsTagNames = [
      "p",
      "ol",
      "ul",
      "sup",
      "pre",
      "s",
      "code",
      "i",
      "b",
      "a",
      "h3",
      "li",
      "strike",
      "br",
      "div",
      "strong",
      "em",
      "tr",
      "table",
      "td",
      "span",
      "u",
      "sub",
      "h4",
      "mark",
    ]; // tags which require namespace
    // ([\\/]?): capture group to match opening and closing tags

    // (\\s[^>]*): word boundary to match exact tag name and capture attributes
    // Also include self closing tags
    const regex = new RegExp(`<([\\/]?)(${nsTagNames.join("|")})(\\s[^>]*)?(\\/)?>`, "gi");

    // Get namespace
    let namespace = "";
    const ppTypeKey = ppType == "Protection Profile" ? "PP" : ppType === "Module" ? "Module" : "Package";
    const namespaceKey = Object.keys(overallObject[ppTypeKey]).find((key) => overallObject[ppTypeKey][key] === "http://www.w3.org/1999/xhtml");

    // XML Cleanup
    // Temp fix to remove empty ns attr,
    // remove snip tags
    // escape ampersand,
    // escape less than signs with &lt;,
    content = content
      .replaceAll('xmlns=""', "")
      .replaceAll("<snip>", "")
      .replaceAll("</snip>", "")
      .replace(/&/g, "&amp;")
      .replace(/\u200C<=/g, "&lt;=")
      .replace(/\u200C</g, "&lt;");

    if (namespaceKey) {
      namespace = namespaceKey.split(":")[1];

      let modifiedXML = content.replace(regex, (match, closingSlash, tagName, attributes = "", selfClosingSlash) => {
        // Some tags should be self closing
        const tag = tagName.toLowerCase();

        if (nsTagNames.includes(tag)) {
          if (tag === "br") {
            return `<${namespace}:${tagName}${attributes}/>`;
          } else if (tag === "strong") {
            return `<${closingSlash}${namespace}:b${attributes}${selfClosingSlash ? "/" : ""}>`;
          } else if (tag === "em") {
            return `<${closingSlash}${namespace}:i${attributes}${selfClosingSlash ? "/" : ""}>`;
          }
          return `<${closingSlash}${namespace}:${tagName}${attributes}${selfClosingSlash ? "/" : ""}>`;
        }

        return match;
      });

      modifiedXML = modifiedXML.replaceAll("<br/>", `<${namespace}:br/>`);

      // replace link tag names (<a href=''>); SAR's a-component and a-element make replacing a tags selectively extremely hard
      if (namespace.length != 0) {
        modifiedXML = modifiedXML.replace(/<a href/g, `<${namespace}:a href`);
      }

      // replace empty p tags with self closing p tags (to match existing PP XML standard), need to append namespace first
      const pRegex1 = namespace.length != 0 ? new RegExp(`<\\/${namespace}:p><${namespace}:p>`, "g") : null;
      const pRegex2 = namespace.length != 0 ? new RegExp(`<${namespace}:p><\\/${namespace}:p>`, "g") : null;

      if (pRegex1) {
        modifiedXML = modifiedXML.replace(pRegex1, `<${namespace}:p/>`);
      }
      if (pRegex2) {
        modifiedXML = modifiedXML.replace(pRegex2, `<${namespace}:p/>`);
      }

      const ppPreferenceRegex = new RegExp(`<audit-events-in-sfrs><\\/${namespace}:audit-events-in-sfrs>`, "g");

      if (ppPreferenceRegex) {
        modifiedXML = modifiedXML.replace(ppPreferenceRegex, `<${namespace}:audit-events-in-sfrs/>`);
      }

      return modifiedXML;
    } else {
      return content;
    }
  }

  // Return Method
  return (
    <div>
      {!preview ? (
        <Modal
          title={"XML Exporter"}
          content={
            <div className='w-screen-md'>
              <Card className='rounded-lg border-2 border-gray-200'>
                <CardBody className='border-b-2 rounded-b-sm border-gray-300 text-secondary'>
                  <div className='w-full' style={{ display: "inline-block", padding: 1 }}>
                    <span className='flex justify-stretch min-w-full'>
                      <TextField fullWidth required color={"secondary"} label={"XML File"} value={fileName} onChange={handleSetFileName} />
                      <div className='pl-2 text-[14px] mt-8 text-black'>.xml</div>
                    </span>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button
                    id={"final-export-xml-button"}
                    sx={{ fontSize: "12px" }}
                    disabled={TESTING || (fileName && fileName !== "") ? false : true}
                    component='label'
                    variant='contained'
                    color='secondary'
                    startIcon={<CloudDownloadIcon />}
                    style={{ color: "white", marginTop: "0px", marginBottom: "5px" }}
                    onClick={() => {
                      generateFormattedJSON();
                    }}>
                    {" "}
                    Export XML
                  </Button>
                </CardFooter>
              </Card>
            </div>
          }
          open={open}
          handleOpen={() => handleOpen()}
          hideSubmit={true}
        />
      ) : (
        <div className='xml-viewer text-[13px]'>
          <XMLViewer
            xml={formattedXML ? formattedXML : ""}
            indentSize={1}
            collapsible={true}
            theme={{
              tagColor: primary,
              attributeKeyColor: secondary,
              attributeValueColor: linkText,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default XMLExporter;
