import { v4 as uuidv4 } from "uuid";
import parse from "html-react-parser";
import { deepCopy } from "./deepCopy";
import { dataMap } from "../utils/ppData";
import { COMMON_REGEX, FILE_PARSER_REGEX, createEscapedTagsRegex, createInlineRichTextSpacingRegex, createXmlDeclarationAttributeRegex } from "./regexUtils.js";
import { SELECTION_FORMATTING_FIELDS, hasSelectionFormattingField, stripSelectionFormattingField } from "./selectionFormatting.js";

// Constants
const raw_xml_tags = ["xref", "rule", "figure", "ctr", "snip", "if-opt-app", "also", "_", "no-link", "comment"];

/**
 * Splits trailing closing HTML tags from a content string so they can be stored
 * as a separate { text } sfrContent item instead of being embedded in a { description }
 * item. This prevents TipTap (rich text editor) from silently stripping orphaned
 * closing tags — e.g. "</li></ul>" — when a user edits text that appears alongside
 * them in the same description item.
 *
 * { description } items pass through TipTap, which normalises HTML and drops any
 * closing tag that has no matching opener in that string. { text } items use a plain
 * TextField that preserves the value verbatim.
 *
 * @param {string} content - Trailing content returned by parseRichTextChildren for a
 *   style-tag child, e.g. "and no other algorithms\n</li>\n"
 * @param {string} outerTagName - The outer tag being closed (e.g. "ul"), whose closing
 *   tag is appended to whatever inner closing tags are found.
 * @returns {{ text: string, tags: string }} text = editable content (no closing tags),
 *   tags = all closing tags including the outer one.
 */
function splitTrailingClosingTags(content, outerTagName) {
  // Match a text prefix followed by one or more closing HTML/XML tags at the very end.
  // The lazy quantifier on the first group ensures we only capture the TRAILING tags,
  // not tags that appear mid-string (e.g. </b> embedded in descriptive text).
  const match = content.match(FILE_PARSER_REGEX.trailingClosingTags);
  if (match && match[2].trim()) {
    return { text: match[1], tags: match[2] + `</${outerTagName}>` };
  }
  // No trailing closing tags found in content — the outer tag is the only closing tag.
  return { text: content, tags: `</${outerTagName}>` };
}
export const style_tags = [
  "b",
  "p",
  "s",
  "i",
  "strike",
  "h3",
  "span",
  "u",
  "ol",
  "ul",
  "li",
  "sup",
  "sub",
  "pre",
  "code",
  "table",
  "tbody",
  "tr",
  "th",
  "h4",
  "mark",
  "abbr",
];
const escapedTagsRegex = createEscapedTagsRegex(raw_xml_tags);

/**
 * Escape XML tags, while preserving attributes
 * @param {string} content html string
 * @param {Boolean} isParse flag to determine if result is parsed into a React element or string
 * @returns {string | React.ReactNode}
 */
export const removeTagEqualities = (content, isParse) => {
  try {
    const newContent = content.replace(escapedTagsRegex, (match, closingSlash, tagName, attributes) => {
      return `&lt;${closingSlash}${tagName}${attributes}&gt;`;
    });

    return isParse ? parse(newContent) : newContent;
  } catch (e) {
    console.error(e);
  }
};

/**
 * Traverse the tree of XML nodes starting at root domNode.
 * If the callback returns true, include it in the array of nodes returned
 * @param {Node} domNode
 * @param {function(Node):boolean} callback
 * @returns {Array.<Node>}
 */
const findAllByCallback = (domNode, callback) => {
  const nodes = new Array();
  const rec = (node) => {
    if (callback(node)) {
      nodes.push(node);
    }

    const children = node.childNodes;
    if (children) {
      children.forEach((child) => {
        rec(child);
      });
    }
  };

  rec(domNode);

  return nodes;
};

/**
 * Traverse the tree of XML nodes starting with root domNode. If the localName matches
 * nodeName (case-sensitive), include it in the array of nodes returned
 * @param {string} nodeName
 * @param {Node} domNode
 * @returns {Array.<Node>}
 */
export const findAllByTagName = (nodeName, domNode) => findAllByCallback(domNode, (node) => node.localName === nodeName);

/**
 * Traverse the tree of XML nodes starting with root domNode. If the node is an element
 * and has an attribute named attributeName, and that attribute's value matches
 * attributeValue, include it in the array of nodes returned
 * @param {string} attributeName
 * @param {*} attributeValue
 * @param {Node} domNode
 * @returns {Array.<Node>}
 */
export const findAllByAttribute = (attributeName, attributeValue, domNode) =>
  findAllByCallback(domNode, (node) => node.nodeType === Node.ELEMENT_NODE && node.getAttribute(attributeName) === attributeValue);

export const findAllByAttributes = (attributeKeyPairs, domNode) => {
  let arrayOfNodes = new Array();

  Object.entries(attributeKeyPairs).forEach(([attributeName, attributeValue]) => {
    arrayOfNodes.push(...findAllByAttribute(attributeName, attributeValue, domNode));
  });

  return arrayOfNodes;
};

/**
 * Parse the include-pkg section
 * @param {Node} domNode
 * @returns {Array}
 */
export const getExternalPackages = (domNode) => {
  let packages = findAllByTagName("include-pkg", domNode);

  let packageArr = new Array();

  if (packages.length !== 0) {
    packages.forEach((p) => {
      let pkg = {};
      let dependsArr = [];

      pkg["id"] = p.id ? p.id : "";

      p.childNodes.forEach((c) => {
        if (c.nodeType === Node.ELEMENT_NODE) {
          if (c.nodeName.toLowerCase() === "git") {
            let gitObj = {};

            c.childNodes.forEach((gitChild) => {
              if (gitChild.nodeType === Node.ELEMENT_NODE) {
                if (gitChild.nodeName === "url") {
                  gitObj["url"] = gitChild.textContent;
                } else if (gitChild.nodeName === "branch") {
                  gitObj["branch"] = gitChild.textContent;
                }
              }
            });

            pkg["git"] = gitObj;
          } else if (c.nodeName.toLowerCase() === "url") {
            pkg["url"] = c.textContent;
          } else if (c.nodeName.toLowerCase() === "depends") {
            c.attributes.forEach((attr) => {
              let depends = {};
              depends[attr.name] = attr.value;
              dependsArr.push(depends);
            });
          }
        }
      });

      pkg["depends"] = dependsArr;
      packageArr.push(pkg);
    });
  }

  return packageArr;
};

/**
 * Parse the <pp-preferences> tag which is used to generate selection based audit table in transforms
 * @param {Node} domNode
 * @returns {string}
 */
export const getPPPreference = (domNode) => {
  let preferences = findAllByTagName("pp-preferences", domNode);

  if (preferences.length !== 0) {
    preferences = getNodeContentWithTags(preferences[0]);
  }

  return preferences;
};

/**
 * Parse the modules section
 * @param {Node} domNode
 * @returns {string}
 */
export const getExternalModules = (domNode) => {
  let modules = findAllByTagName("modules", domNode);

  if (modules.length !== 0) {
    modules = getNodeContentWithTags(modules[0]);
  }

  return modules;
};

/**
 * Parse the platforms section
 * @param {Node} domNode
 * @returns {{
 *   platformRawXML: string,
 *   platformObj: {
 *     description: string,
 *     platforms: Array<{ name: string, description: string, id: string }>,
 *     platformMap: Object.<string, string>
 *   }
 * }}
 */
export const getPlatforms = (domNode) => {
  let platformObj = {
    description: "",
    platforms: [],
    platformMap: {},
  };
  let platformMap = {};

  let platformRawXML = "";

  let platform_section = findAllByAttribute("title", "Platforms with Specific EAs", domNode);

  if (platform_section.length === 0) {
    if (findAllByAttribute("id", "sec-platforms", domNode).length !== 0) {
      platform_section = findAllByAttribute("id", "sec-platforms", domNode)[0];
    }
  } else {
    platformRawXML = getNodeContentWithTags(platform_section[0]); // Used for export

    if (platform_section[0].childNodes) {
      platform_section[0].childNodes.forEach((child) => {
        if (child.tagName.toLowerCase() === "choice") {
          platformObj.description = getDirectTextContent(child);
        }
      });

      // if no choice tag, just get all the platforms which are in selectables
      let selectables = findAllByTagName("selectables", platform_section[0]);
      if (selectables.length !== 0) {
        if (selectables[0].childNodes) {
          selectables[0].childNodes.forEach((selectable) => {
            let platformName = "";
            let description = "";

            if (selectable.childNodes) {
              selectable.childNodes.forEach((s) => {
                if (s.nodeType === Node.ELEMENT_NODE) {
                  if (s.localName.toLowerCase() === "b") {
                    platformName = s.textContent;
                    platformMap[selectable.getAttribute("id")] = platformName;
                  } else if (s.localName.toLowerCase() === "i") {
                    description = s.textContent;
                  }
                }
              });
            }
            platformObj.platforms.push({
              name: platformName,
              description: description,
              id: selectable.getAttribute("id"),
            });
          });
        }
      }
    }
    platformObj.platformMap = platformMap;
  }

  return { platformRawXML, platformObj };
};

/**
 * Parse the top level tag's attributes in the XML document
 * @param {Node} domNode
 * @param {string} ppType
 * @returns {{
 *   tagName: string,
 *   attributes: Object.<string, string>
 * }}
 */
export const getPPMetadata = (domNode, ppType) => {
  let section = null;
  let xmlTagMeta = {
    tagName: "",
    attributes: {},
  };

  if (ppType === "Functional Package") {
    section = findAllByTagName("Package", domNode)[0];
    xmlTagMeta.tagName = "Package";
  } else if (ppType === "Protection Profile") {
    section = findAllByTagName("PP", domNode)[0];
    xmlTagMeta.tagName = "PP";
  } else if (ppType === "Module") {
    section = findAllByTagName("Module", domNode)[0];
    xmlTagMeta.tagName = "Module";
  }

  if (section) {
    let attributes = {};
    section.attributes.forEach((attr) => {
      attributes[attr.name] = attr.value;
    });

    xmlTagMeta.attributes = attributes;
  }

  return xmlTagMeta;
};

/**
 * Parse the PPReference section
 * @param {Node} domNode
 * @returns {{
 *   PPTitle: string,
 *   PPVersion: string,
 *   PPAuthor: string,
 *   PPPubDate: string,
 *   Keywords: string,
 *   RevisionHistory: Array<{
 *     version: string,
 *     date: string,
 *     comment: string
 *   }>,
 *   TechnicalDecisionHistory: Array<{
 *     number: string,
 *     date: string,
 *     subject: string,
 *     url: string,
 *     affects: Array<string>
 *   }>
 * }}
 */
export const getPPReference = (domNode) => {
  const ppRef = findAllByTagName("PPReference", domNode);
  let ppObj = {
    PPTitle: "",
    PPVersion: "",
    PPAuthor: "",
    PPPubDate: "",
    Keywords: "",
    RevisionHistory: [],
    TechnicalDecisionHistory: [],
  };

  if (ppRef.length !== 0) {
    ppRef[0].childNodes.forEach((child) => {
      if (child.nodeType == Node.ELEMENT_NODE && child.tagName.toLowerCase() === "referencetable") {
        child.childNodes.forEach((c) => {
          const refTableChildTag = c?.tagName?.toLowerCase();

          if (refTableChildTag === "pptitle") {
            ppObj.PPTitle = c.textContent;
          } else if (refTableChildTag === "ppversion") {
            ppObj.PPVersion = c.textContent;
          } else if (refTableChildTag === "ppauthor") {
            ppObj.PPAuthor = c.textContent;
          } else if (refTableChildTag === "pppubdate") {
            ppObj.PPPubDate = c.textContent;
          } else if (refTableChildTag === "keywords") {
            ppObj.Keywords = c.textContent;
          }
        });
      }
    });
  }

  let revisionHistory = findAllByTagName("RevisionHistory", domNode);
  if (revisionHistory.length !== 0) {
    revisionHistory[0].childNodes.forEach((child) => {
      if (child.nodeType == Node.ELEMENT_NODE && child.tagName.toLowerCase() === "entry") {
        let revisionInstance = {
          version: "",
          date: "",
          comment: "",
        };
        child.childNodes.forEach((c) => {
          if (c.nodeType == Node.ELEMENT_NODE) {
            const revHistoryChildTag = c.tagName.toLowerCase();
            if (revHistoryChildTag === "version") {
              revisionInstance.version = c.textContent;
            } else if (revHistoryChildTag === "date") {
              revisionInstance.date = c.textContent;
            } else if (revHistoryChildTag === "subject") {
              revisionInstance.comment = parseRichTextChildren(c);
            }
          }
        });
        ppObj.RevisionHistory.push(revisionInstance);
      }
    });
  }

  let technicalDecisionHistory = findAllByTagName("TechnicalDecisionHistory", domNode);
  if (technicalDecisionHistory.length !== 0) {
    technicalDecisionHistory[0].childNodes.forEach((child) => {
      if (child.nodeType == Node.ELEMENT_NODE && child.tagName.toLowerCase() === "td") {
        let technicalDecisionInstance = {
          number: "",
          date: "",
          subject: "",
          url: "",
          affects: [],
        };
        child.childNodes.forEach((c) => {
          if (c.nodeType == Node.ELEMENT_NODE) {
            const technicalDecisionChildTag = c.tagName.toLowerCase();
            if (technicalDecisionChildTag === "number") {
              technicalDecisionInstance.number = c.textContent;
            } else if (technicalDecisionChildTag === "date") {
              technicalDecisionInstance.date = c.textContent;
            } else if (technicalDecisionChildTag === "subject") {
              technicalDecisionInstance.subject = parseRichTextChildren(c);
            } else if (technicalDecisionChildTag === "url") {
              technicalDecisionInstance.url = c.textContent;
            } else if (technicalDecisionChildTag === "affects") {
              c.childNodes.forEach((affectsChild) => {
                if (affectsChild.nodeType == Node.ELEMENT_NODE && affectsChild.tagName.toLowerCase() === "ref-id") {
                  technicalDecisionInstance.affects.push(affectsChild.textContent);
                }
              });
            }
          }
        });
        ppObj.TechnicalDecisionHistory.push(technicalDecisionInstance);
      }
    });
  }

  return ppObj;
};

/**
 * Parse the Threats section
 * @param {Node} domNode
 * @returns {{
 *   threat_description: string,
 *   threats: Array<{
 *     name: string,
 *     definition: string,
 *     securityObjectives: Array<{
 *       name: string,
 *       rationale: string,
 *       xmlTagMeta: {
 *         tagName: string,
 *         attributes: Object.<string, string>
 *       }
 *     }>,
 *     sfrs: Array<{
 *       name: string,
 *       rationale: string,
 *       xmlTagMeta: {
 *         tagName: string
 *       }
 *     }>,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>
 * }}
 */
export const getAllThreats = (threat_description_section, ppType) => {
  // Get threat description (if exists)
  const isModule = ppType === "Module";
  let threat_description = parseRichTextChildren(threat_description_section);

  let threat_tags = findAllByTagName("threat", threat_description_section);
  let threats = new Array();

  threat_tags.forEach((threat) => {
    let securityObjectives = new Array();

    if (threat.nodeType === Node.ELEMENT_NODE && threat.tagName === "threat") {
      let name = threat.getAttribute("name") || "";
      let description = "";
      let consistencyRationale = "";
      let sfrs = [];
      let lastSfrName = "";
      let sfrTypes = ["optional", "objective", "selection-based"];
      let basePPs = []; // for modules

      threat.childNodes.forEach((threatChild) => {
        if (threatChild.nodeType === Node.ELEMENT_NODE) {
          if (threatChild.nodeName.toLowerCase() === "description") {
            description = parseRichTextChildren(threatChild);
          } else if (threatChild.nodeName.toLowerCase() === "consistency-rationale") {
            consistencyRationale = parseRichTextChildren(threatChild);
          } else if (threatChild.nodeName.toLowerCase() === "objective-refer") {
            let objective_name = threatChild.getAttribute("ref");
            let rationale = "";

            threatChild.childNodes.forEach((objRefereplaceChild) => {
              if (objRefereplaceChild.nodeType === Node.ELEMENT_NODE && objRefereplaceChild.nodeName.toLowerCase() === "rationale") {
                rationale = parseRichTextChildren(objRefereplaceChild);

                securityObjectives.push({
                  name: objective_name,
                  rationale: rationale.replace(FILE_PARSER_REGEX.newlinesAndTabs, ""),
                  xmlTagMeta: {
                    tagName: "objective-refer",
                    attributes: {
                      ref: objective_name,
                    },
                  },
                });
              }
            });
          } else if (threatChild.nodeName.toLowerCase() === "addressed-by") {
            // for Direct Rationale
            // regex to remove quotes
            const sfrNameArr = !isModule ? parseRichTextChildren(threatChild).replace(COMMON_REGEX.quotes, "").split("(") : parseRichTextChildren(threatChild);
            lastSfrName = !isModule ? sfrNameArr[0].trim() : sfrNameArr;
          } else if (threatChild.nodeName.toLowerCase() === "rationale") {
            // for Direct Rationale
            let sfrType = "";
            if (lastSfrName.split("(").length > 1) {
              // Pull out the type (strip the last character if it is a closed parenthesis)
              sfrType = lastSfrName.split("(")[1].slice(-1) === ")" ? lastSfrName.split("(")[1].slice(0, -1) : lastSfrName.split("(")[1].slice(-1);
            }

            sfrs.push({
              name: lastSfrName.trimEnd(),
              type: sfrTypes.includes(sfrType) ? sfrType : "",
              rationale: parseRichTextChildren(threatChild),
              xmlTagMeta: {
                tagName: "addressed-by",
              },
            });
            lastSfrName = "";
          } else if (threatChild.nodeName.toLowerCase() === "from") {
            basePPs.push(threatChild.getAttribute("base"));
          }
        }
      });

      threats.push({
        name: name,
        definition: description,
        consistencyRationale: consistencyRationale,
        securityObjectives,
        sfrs,
        xmlTagMeta: {
          tagName: threat.tagName,
          attributes: {
            name: name,
          },
        },
        basePPs,
      });
    }
  });
  return { threat_description, threats };
};

/**
 * Parse the assumptions section
 * @param {Node} domNode
 * @returns {Array<{
 *   name: string,
 *   definition: string,
 *   securityObjectives: Array<{
 *     name: string,
 *     rationale: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }>}
 */
export const getAllAssumptions = (assumptions_section) => {
  let assumption_description = parseRichTextChildren(assumptions_section);
  let assumption_tags = findAllByTagName("assumption", assumptions_section);
  let assumptions = new Array();

  assumption_tags.forEach((assumption) => {
    let securityObjectives = new Array();

    if (assumption.nodeType === Node.ELEMENT_NODE && assumption.tagName === "assumption") {
      let description = findAllByTagName("description", assumption);
      description = description.length !== 0 ? parseRichTextChildren(description[0]) : "";
      let name = assumption.getAttribute("name");

      let objectives = findAllByTagName("objective-refer", assumption);
      objectives.forEach((objective) => {
        let objective_name = objective.getAttribute("ref");

        let rationale = findAllByTagName("rationale", objective);
        rationale = rationale.length !== 0 ? parseRichTextChildren(rationale[0]) : "";

        securityObjectives.push({
          name: objective_name,
          rationale: rationale,
          xmlTagMeta: {
            tagName: "objective-refer",
            attributes: {
              ref: objective_name,
            },
          },
        });
      });

      let consistency_rationale = findAllByTagName("consistency-rationale", assumption);
      consistency_rationale = consistency_rationale.length !== 0 ? parseRichTextChildren(consistency_rationale[0]) : "";

      assumptions.push({
        name: name,
        definition: description,
        consistency_rationale,
        securityObjectives: securityObjectives,
        xmlTagMeta: {
          tagName: assumption.tagName,
          attributes: {
            name: name,
          },
        },
      });
    }
  });

  return { assumption_description, assumptions };
};

/**
 * Parse the Organizatinal Security Policies section
 * @param {Node} domNode
 * @returns {Array<{
 *   name: string,
 *   definition: string,
 *   securityObjectives: Array<{
 *     name: string,
 *     rationale: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }>}
 */
export const getAllOSPs = (domNode) => {
  let OSPs = new Array();
  let boilerplate = null;

  let ospSection = findAllByTagName("OSPs", domNode)[0];

  if (ospSection) {
    boilerplate = ospSection.parentElement?.getAttribute("boilerplate");
    if (ospSection.children.length != 0) {
      Array.from(ospSection.children).forEach((osp) => {
        let securityObjectives = new Array();

        if (osp.nodeType === Node.ELEMENT_NODE && osp.tagName === "OSP") {
          if (osp.parentElement?.hasAttribute("boilerplate")) {
            boilerplate = osp.parentElement.getAttribute("boilerplate");
          }

          const description = findAllByTagName("description", osp)[0]?.textContent ?? "";
          const consistencyRationale = findAllByTagName("consistency-rationale", osp)[0]?.textContent ?? "";

          let name = osp.getAttribute("name");

          let objectives = findAllByTagName("objective-refer", osp);
          objectives.forEach((objective) => {
            let objective_name = objective.getAttribute("ref");

            const rationale = findAllByTagName("rationale", objective)[0]?.textContent ?? "";

            securityObjectives.push({
              name: objective_name,
              rationale: rationale,
              xmlTagMeta: {
                tagName: "objective-refer",
                attributes: {
                  ref: objective_name,
                },
              },
            });
          });

          OSPs.push({
            name: name,
            definition: description,
            consistencyRationale,
            securityObjectives: securityObjectives,
            xmlTagMeta: {
              tagName: osp.tagName,
              attributes: {
                name: name,
              },
            },
          });
        }
      });
    }
  }

  return { boilerplate, OSPs };
};

/**
 * Parse Security Objectives for TOE section
 * @param {Node} domNode
 * @returns {Array<{
 *   name: string,
 *   definition: string,
 *   sfrs: Array<{
 *     name: string,
 *     rationale: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }>}
 */
export const getAllSecurityObjectivesTOE = (domNode) => {
  const securityobjective_tags = findAllByTagName("SO", domNode);
  let security_objectives = new Array();

  securityobjective_tags.forEach((security_objective) => {
    if (security_objective.nodeType === Node.ELEMENT_NODE && security_objective.tagName === "SO") {
      let description = findAllByTagName("description", security_objective);
      description = description.length !== 0 ? description[0].textContent : "";
      const name = security_objective.getAttribute("name");

      const sfrsNodes = findAllByTagName("addressed-by", security_objective);
      let sfr_list = sfrsNodes.map((sfr) => {
        const sfr_name = sfr.textContent.replace(COMMON_REGEX.quotes, "").split("(")[0].trim();
        let rationaleNode = sfr.nextSibling; // assuming rationale immediately follows addressed-by, which is currently the case
        while (rationaleNode && rationaleNode.nodeType !== Node.ELEMENT_NODE) {
          rationaleNode = rationaleNode.nextSibling; // skip non-element nodes (eg. text nodes)
        }
        const rationale = rationaleNode && rationaleNode.tagName === "rationale" ? rationaleNode.textContent.trim() : "";
        return {
          name: sfr_name,
          rationale: rationale,
          xmlTagMeta: {
            tagName: "addressed-by",
            attributes: {
              ref: sfr_name,
            },
          },
        };
      });

      security_objectives.push({
        name: name,
        definition: description,
        sfrs: sfr_list,
        xmlTagMeta: {
          tagName: "SO",
          attributes: {
            name: name,
          },
        },
      });
    }
  });

  return security_objectives;
};

/**
 * Parse Security Objectives for OE section (<SOE>)
 * @param {Node} domNode
 * @returns {{
 *   intro: string,
 *   securityObjectives: Array<{
 *     name: string,
 *     definition: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>
 * }}
 */
export const getAllSecurityObjectivesOE = (domNode) => {
  let securityObjectives = new Array();

  let securityObjectiveSection =
    findAllByTagName("Security_Objectives_for_the_Operational_Environment", domNode)[0] ||
    findAllByAttribute("title", "Security Objectives for the Operational Environment", domNode)[0];

  if (!securityObjectiveSection) return null;

  const intro = parseRichTextChildren(securityObjectiveSection);

  const xmlTagMeta = {
    tagName: securityObjectiveSection.tagName,
    attributes: {},
  };

  securityObjectiveSection.attributes.forEach((attr) => {
    xmlTagMeta.attributes[attr.name] = attr.value;
  });

  if (securityObjectiveSection) {
    securityObjectiveSection.childNodes.forEach((subsection) => {
      if (subsection.nodeType === Node.ELEMENT_NODE && subsection.tagName === "SOEs") {
        subsection.childNodes.forEach((soeSection) => {
          if (soeSection.nodeType === Node.ELEMENT_NODE) {
            let name = soeSection.getAttribute("name");

            let description = findAllByTagName("description", soeSection);
            description = description.length !== 0 ? parseRichTextChildren(description[0]) : "";

            let rationale = findAllByTagName("consistency-rationale", soeSection);
            rationale = rationale.length !== 0 ? parseRichTextChildren(rationale[0]) : "";

            securityObjectives.push({
              name: name,
              definition: description,
              rationale,
              xmlTagMeta: {
                tagName: "SOE",
                attributes: {
                  name: name,
                },
              },
            });
          }
        });
      }
    });
  }

  return { intro, securityObjectives, xmlTagMeta };
};

/**
 * Parse the technical terms section
 * @param {Node} domNode
 * @returns {{
 *   termsArray: Array<{
 *     name: string,
 *     definition: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>,
 *   acronymsArray: Array<{
 *     name: string,
 *     definition: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>,
 *   suppressedTermsArray: Array<{
 *     name: string,
 *     definition: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }>
 * }}
 */
export const getAllTechTerms = (domNode) => {
  let techTerms = findAllByTagName("tech-terms", domNode);
  let termsArray = new Array();
  let acronymsArray = new Array();
  let suppressedTermsArray = new Array();

  if (techTerms.length !== 0) {
    techTerms = techTerms[0];

    for (let term of techTerms.childNodes) {
      if (term.nodeType === Node.ELEMENT_NODE) {
        if (term.tagName === "term") {
          // Check if abbr attribute exists and is not empty
          const abbr = term.getAttribute("abbr");
          const name = term.getAttribute("full");

          if (term.textContent?.length !== 0) {
            termsArray.push({
              name: name,
              abbr: abbr,
              definition: parseRichTextChildren(term),
              xmlTagMeta: {
                tagName: term.tagName,
                attributes: {
                  abbr: term.getAttribute("abbr") ? term.getAttribute("abbr") : "",
                  full: term.getAttribute("full") ? term.getAttribute("full") : "",
                },
              },
            });
          } else {
            // AKA if it is an acronym
            acronymsArray.push({
              name: name,
              abbr: term.getAttribute("abbr"),
              definition: "",
              xmlTagMeta: {
                tagName: term.tagName,
                attributes: {
                  abbr: term.getAttribute("abbr") ? term.getAttribute("abbr") : "",
                  full: term.getAttribute("full") ? term.getAttribute("full") : "",
                },
              },
            });
          }
        } else if (term.tagName === "suppress") {
          suppressedTermsArray.push({
            name: removeWhitespace(term.textContent),
            definition: "",
            xmlTagMeta: {
              tagName: term.tagName,
              attributes: {},
            },
          });
        }
      }
    }
    return { termsArray, acronymsArray, suppressedTermsArray };
  }
};

/**
 * Parse the Overview section
 * @param {Node} domNode
 * @returns {{
 *   doc_objectives: string,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getDocumentObjectives = (domNode) => {
  let doc_objectives = "";

  let xmlTagMeta = {
    tagName: "",
    attributes: {},
  };

  doc_objectives = parseRichTextChildren(domNode);

  // Set the attributes
  domNode.attributes.forEach((attr) => {
    xmlTagMeta.attributes[attr.name] = attr.value;
  });

  xmlTagMeta.tagName = domNode.tagName;

  return { doc_objectives, xmlTagMeta };
};

/**
 *
 * @param {*} domNode
 */
export const getCustomIntroSection = (introSection) => {
  let xmlTagMeta = {
    tagName: "section",
    attributes: {},
  };

  // Set the attributes
  introSection.attributes.forEach((attr) => {
    xmlTagMeta.attributes[attr.name] = attr.value;
  });

  const title = introSection.getAttribute("title") || introSection.localName;
  const text = escapeXmlTags(getNodeContentWithTags(introSection));

  return { title, text, xmlTagMeta, node: introSection };
};

/**
 * This function gets the XML prolog tags (processing instructions prefixed with ?)
 * and the XML declaration (from raw XML text).
 *
 * @param {Node} domNode
 * @param {string} xmlString
 * @returns {{
 *   xmlDeclaration: Object|null,
 *   prologNodes: Array<
 *     | { kind: "pi", target: string, data: string }
 *     | { kind: "comment", data: string }
 *   >
 * }}
 */
export const getPrologTags = (domNode, xmlString) => {
  const prologNodes = [];
  for (const node of Array.from(domNode.childNodes)) {
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      // In the browser DOM, PI has `target` and `data`
      prologNodes.push({
        kind: "pi",
        target: node.target,
        data: node.data ?? "",
      });
    } else if (node.nodeType === Node.COMMENT_NODE) {
      // Keep comments too (including those that contain a commented-out PI)
      prologNodes.push({
        kind: "comment",
        data: node.data ?? "",
      });
    }
  }

  return {
    xmlDeclaration: getXmlDeclaration(xmlString),
    prologNodes,
  };
};

/**
 * Get XML declaration attributes from an XML string.
 * NOTE: XML declaration is not part of the DOM and must be extracted from raw XML text.
 *
 * @param {string} xmlString
 * @returns {Object|null} e.g. { version: "1.0", encoding: "utf-8" }
 */
export const getXmlDeclaration = (xmlString) => {
  if (!xmlString) return null;

  // Match the full XML declaration
  const match = xmlString.match(FILE_PARSER_REGEX.xmlDeclaration);
  if (!match) return null;

  const xmlDecl = match[0];

  // Strip '<?xml' and '?>'
  const inner = xmlDecl.replace(FILE_PARSER_REGEX.xmlDeclarationOpen, "").replace(FILE_PARSER_REGEX.xmlDeclarationClose, "");

  const attrs = {};
  const attrRegex = createXmlDeclarationAttributeRegex();

  let m;
  while ((m = attrRegex.exec(inner)) !== null) {
    const [, key, value] = m;
    attrs[key] = value;
  }

  return attrs;
};

/**
 * This function calls the parsing functions for all the sections and considers any extra sections as custom
 * @param {Node} domNode
 * @param {String} ppType Protection Profile, Functional Package, Module
 * @param {String} ppVersion
 * @returns
 */
export const getXmlData = (domNode, ppType, ppVersion) => {
  const mainTagName = ppType === "Protection Profile" ? "PP" : ppType === "Functional Package" ? "Package" : ppType;
  const mainNode = findAllByTagName(mainTagName, domNode)[0];
  let masterObject = {
    intro: [],
    customIntro: [],
    cClaims: {},
    spd: {},
    securityObjectives: {},
    sfr: {},
    appendices: [],
    custom: [],
    distributedToe: {},
  };
  let platformObject;
  const otherTopSections = [
    "PPReference",
    "RevisionHistory",
    "TechnicalDecisionHistory",
    "include-pkg",
    "pp-preferences",
    "extra-css",
    "modules",
    "implements",
  ];

  const parseErrors = [];

  // Error handling - allows everything to run even if certain sections fail
  const safeParseSection = (sectionName, fn) => {
    try {
      fn();
    } catch (e) {
      console.error(`[getXmlData] Error parsing section: "${sectionName}"`, e);
      parseErrors.push(sectionName);
    }
  };

  Array.from(mainNode.childNodes)
    .filter((sec) => sec.nodeType === Node.ELEMENT_NODE)
    .forEach((sec) => {
      // 1.0 Introduction
      if (sec.localName === "Introduction" || hasAttribute(sec, "title", "Introduction")) {
        Array.from(sec.childNodes)
          .filter((sec) => sec.nodeType === Node.ELEMENT_NODE)
          .forEach((introSection) => {
            if (
              introSection.localName === "Overview" ||
              introSection.localName === "Objectives_of_Document" ||
              hasAttribute(introSection, "title", "Overview")
            ) {
              safeParseSection("Introduction > Overview", () => {
                masterObject.intro.push({
                  overview: getDocumentObjectives(introSection),
                });
              });
            } else if (introSection.localName === "tech-terms") {
              safeParseSection("Introduction > tech-terms", () => {
                masterObject.intro.push({
                  techTerms: getAllTechTerms(introSection),
                });
              });
            } else if (
              introSection.localName === "Compliant_Targets_of_Evaluation" ||
              introSection.localName === "TOE_Overview" ||
              hasAttribute(introSection, "id", "TOEdescription") ||
              hasAttribute(introSection, "id", "toeov") ||
              hasAttribute(introSection, "id", "s-complianttargets") ||
              hasAttribute(introSection, "title", "TOE Overview") ||
              hasAttribute(introSection, "title", "Compliant Targets of Evaluation")
            ) {
              safeParseSection("Introduction > Compliant Targets of Evaluation", () => {
                let xmlTagMeta = {
                  tagName: introSection.tagName,
                  attributes: {},
                };

                for (let attr of introSection.attributes) {
                  xmlTagMeta.attributes[attr.name] = attr.value;
                }

                masterObject.intro.push({
                  compliantTOE: { ...getCompliantTOE(introSection, ppType), xmlTagMeta },
                });
              });
            } else if (introSection.localName === "Use_Cases" || introSection.localName === "Use-Cases" || hasAttribute(introSection, "title", "Use Cases")) {
              safeParseSection("Introduction > Use Cases", () => {
                masterObject.intro.push({
                  useCaseDescription: getUseCaseDescription(introSection),
                });
                Array.from(introSection.childNodes)
                  .filter((introSection) => introSection.nodeType === Node.ELEMENT_NODE)
                  .forEach((useCaseSection) => {
                    if (useCaseSection.localName === "usecases") {
                      masterObject.intro.push({
                        useCases: getUseCases(useCaseSection),
                      });
                    }
                  });
              });
            } else if (hasAttribute(introSection, "title", "Platforms with Specific EAs") || hasAttribute(introSection, "id", "sec-platforms")) {
              safeParseSection("Introduction > Platforms", () => {
                platformObject = getPlatforms(mainNode);
                masterObject.intro.push({
                  platforms: platformObject,
                });
              });
            } else if (isImplementationFeatureSection(introSection)) {
              safeParseSection("Introduction > Implementation-dependent Requirements", () => {
                masterObject.intro.push({
                  implementations: getImplementations(introSection),
                });
              });
            } else if (hasAttribute(introSection, "title", "Scope of Document")) {
              safeParseSection("Introduction > Scope of Document", () => {
                masterObject.intro.push({
                  scope: parseRichTextChildren(introSection),
                });
              });
            } else if (hasAttribute(introSection, "title", "Intended Readership")) {
              safeParseSection("Introduction > Intended Readership", () => {
                masterObject.intro.push({
                  intended: parseRichTextChildren(introSection),
                });
              });
            } else {
              // handle custom intro subsections
              safeParseSection(`Introduction > Custom Section (${introSection.localName})`, () => {
                masterObject.customIntro.push(getCustomIntroSection(introSection));
              });
            }
          });
      } else if (sec.localName === "Conformance_Claims" || hasAttribute(sec, "title", "Conformance Claims")) {
        // 2.0 Conformance Claims
        safeParseSection("Conformance Claims", () => {
          masterObject.cClaims = {
            cClaims: getCClaims(sec, ppVersion),
            cClaimsAttributes: getCClaimsAttributes(sec),
          };
        });
      } else if (hasAttribute(sec, "title", "Introduction to Distributed TOEs")) {
        // 3.0 (for MDM) Distributed TOE
        safeParseSection("Distributed TOEs", () => {
          masterObject.distributedToe = getDistributedTOE(sec);
        });
      } else if (
        sec.localName === "Security_Problem_Definition" ||
        sec.localName === "Security_Problem_Description" ||
        sec.localName === "spd" ||
        hasAttribute(sec, "title", "Security Problem Definition")
      ) {
        // 3.0 Security Problem Definition
        safeParseSection("Security Problem Definition", () => {
          let xmlTagMeta = {
            tagName: sec.tagName,
            attributes: {},
          };

          for (let attr of sec.attributes) {
            xmlTagMeta.attributes[attr.name] = attr.value;
          }

          masterObject.spd.xmlTagMeta = xmlTagMeta;
          masterObject.spd.definition = parseRichTextChildren(sec);

          Array.from(sec.childNodes)
            .filter((sec) => sec.nodeType === Node.ELEMENT_NODE)
            .forEach((spdSection) => {
              if (spdSection.localName === "Threats" || (spdSection.localName === "section" && spdSection.getAttribute("title") === "Threats")) {
                safeParseSection("Security Problem Definition > Threats", () => {
                  masterObject.spd.threats = getAllThreats(spdSection, ppType);
                });
              } else if (spdSection.localName === "Assumptions" || hasAttribute(spdSection, "title", "Assumptions")) {
                safeParseSection("Security Problem Definition > Assumptions", () => {
                  masterObject.spd.assumptions = getAllAssumptions(spdSection);
                });
              } else if (spdSection.localName === "Organizational_Security_Policies" || hasAttribute(spdSection, "title", "Organizational Security Policies")) {
                safeParseSection("Security Problem Definition > OSPs", () => {
                  masterObject.spd.osp = getAllOSPs(spdSection);
                });
              }
            });
        });
      } else if (sec.localName === "Security_Objectives" || hasAttribute(sec, "title", "Security Objectives")) {
        // 4.0 Security Objectives
        safeParseSection("Security Objectives", () => {
          masterObject.securityObjectives = {
            objectivesDefinition: parseRichTextChildren(sec),
            toeObjectives: getAllSecurityObjectivesTOE(sec),
            oeObjectives: getAllSecurityObjectivesOE(sec),
          };
        });
      } else if (
        sec.localName === "Security_Requirements" ||
        sec.localName === "Security_Functional_Requirements" || // this is used for FPs (which usually don't have SARs)
        hasAttribute(sec, "title", "Security Requirements")
      ) {
        // 5.0 Security Requirements
        safeParseSection("Security Requirements / SFRs", () => {
          const extCompDefMap = getSectionExtendedComponentDefinitionMap(sec, ppType);
          masterObject.sfr.sfrs = getSFRs(sec, extCompDefMap, platformObject, ppType);
          masterObject.sfr.auditSection = getAuditSection(sec);
          masterObject.sfr.xmlTagMeta = getSfrXmlTagMeta(sec);
        });
      } else if (hasAttribute(sec, "title", "Validation Guidelines")) {
        // Appendix D - Validation Guidelines
        safeParseSection("Appendix - Validation Guidelines", () => {
          masterObject.appendices.push({
            validation: getValidationGuidelinesAppendix(sec),
          });
        });
      } else if (hasAttribute(sec, "title", "Implicitly Satisfied Requirements")) {
        // Appendix E - Implicitly Satisfied Requirements
        safeParseSection("Appendix - Implicitly Satisfied Requirements", () => {
          masterObject.appendices.push({
            satisfied: getSatisfiedReqsAppendix(sec),
          });
        });
      } else if (hasAttribute(sec, "title", "Entropy Documentation and Assessment")) {
        // Appendix F - Entropy Appendix
        safeParseSection("Appendix - Entropy", () => {
          masterObject.appendices.push({
            entropy: getEntropyAppendix(sec),
          });
        });
      } else if (sec.localName === "bibliography") {
        safeParseSection("Appendix - Bibliography", () => {
          // Appendix J - Bibliography
          masterObject.appendices.push({
            bibliography: getBibliography(sec),
          });
        });
      } else if (hasAttribute(sec, "title", "Acknowledgments")) {
        // Appendix K - Acknowledgements
        safeParseSection("Appendix - Acknowledgements", () => {
          masterObject.appendices.push({
            acknowledgements: getAcknowledgementsAppendix(sec),
          });
        });
      } else if (hasAttribute(sec, "title", "Equivalency Guidelines") || hasAttribute(sec, "title", "Application Software Equivalency Guidelines")) {
        // Appendix ? - Equivalency Guidelines
        safeParseSection("Appendix - Equivalency Guidelines", () => {
          masterObject.appendices.push({
            equivalency: getEquivGuidelinesAppendix(sec),
          });
        });
      } else if (hasAttribute(sec, "title", "Initialization Vector Requirements for NIST-Approved Cipher Modes")) {
        // Appendix ? - Vector
        safeParseSection("Appendix - Initialization Vector Requirements", () => {
          masterObject.appendices.push({
            vector: getVectorAppendix(sec),
          });
        });
      } else if (
        otherTopSections.includes(sec.localName) ||
        hasAttribute(sec, "title", "Optional Requirements") ||
        hasAttribute(sec, "title", "Selection-Based Requirements")
      ) {
        // skip these sections
      } else {
        // handle top level custom sections
        safeParseSection(`Custom Section (${sec.localName})`, () => {
          masterObject.custom.push(getCustomSection(sec));
        });
      }
    });

  masterObject.parseErrors = parseErrors;

  return masterObject;
};

/**
 *
 * @param {*} domNode
 */
export const getCustomSection = (customSection) => {
  let xmlTagMeta = {
    tagName: customSection.localName,
    attributes: {},
  };

  // Set the attributes
  customSection.attributes.forEach((attr) => {
    xmlTagMeta.attributes[attr.name] = attr.value;
  });

  const definition = getNodeContentWithTags(customSection);

  return { definition: definition, xmlTagMeta };
};

/**
 * Checks if xml section's attribute array contains obj with a name/value pair. Does not recurse.
 * @param {*} domNode
 * @param {String} name
 * @param {String} value
 * @returns {Boolean}
 */
const hasAttribute = (section, name, value) => {
  return section?.attributes?.some((attr) => attr.name?.toLowerCase() === name?.toLowerCase() && attr.value?.toLowerCase() === value?.toLowerCase());
};

/**
 * @param {*} domNode
 * Parse the Distributed TOE section
 * @param {Node} domNode
 * @returns {null | {
 *   intro: {
 *     node: Element,
 *     xml: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   },
 *   registration: {
 *     node: Element,
 *     xml: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   },
 *   allocation: {
 *     node: Element,
 *     xml: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   },
 *   security: {
 *     node: Element,
 *     xml: string,
 *     xmlTagMeta: {
 *       tagName: string,
 *       attributes: Object.<string, string>
 *     }
 *   }
 * }}
 */
export const getDistributedTOE = (domNode) => {
  const sectionTitles = [
    "Introduction to Distributed TOEs",
    "Registration of Distributed TOE Components",
    "Allocation of Requirements in Distributed TOEs",
    "Security Audit for Distributed TOEs",
  ];

  const result = {};

  sectionTitles.forEach((title) => {
    const node = findAllByAttribute("title", title, domNode)[0] || null;
    if (!node) {
      console.log(`${title} is missing in Distributed TOE`);
      return;
    }

    const section = {
      node,
      xml: parseRichTextChildren(node),
    };

    const xmlTagMeta = {
      tagName: "section",
      attributes: {},
    };

    node.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    section.xmlTagMeta = xmlTagMeta;

    // Map title to key name
    if (title.includes("Introduction")) {
      result.intro = section;
    } else if (title.includes("Registration")) {
      result.registration = section;
    } else if (title.includes("Allocation")) {
      result.allocation = section;
    } else if (title.includes("Security Audit")) {
      result.security = section;
    }
  });

  return result;
};

/**
 * Parse the TOE section
 * @param {Node} domNode
 * @param {string} ppType
 * @returns {{
 *   toe_overview: string,
 *   toe_boundary: string,
 *   toe_platform: string,
 *   components: Array<{
 *     compID: string,
 *     notes: string
 *   }>,
 *   additionalText: string
 * }}
 */
export const getCompliantTOE = (toeSection, ppType) => {
  // tag structure varies from xml to xml...
  let toe_overview = "";
  let toe_boundary = "";
  let toe_platform = "";
  let toe_oe = {
    content: "",
    tagName: "section",
    attributes: {},
  };
  let components = [];
  let additionalText = "";
  let subsections = [];

  if (toeSection) {
    if (ppType === "Functional Package") {
      let finishedComponents = false;
      toeSection.childNodes.forEach((toeChild) => {
        if (toeChild.nodeType === Node.ELEMENT_NODE) {
          const tagName = toeChild.localName.toLowerCase();

          if (tagName === "componentsneeded") {
            toeChild.childNodes.forEach((component) => {
              if (component.nodeType === Node.ELEMENT_NODE && component.localName.toLowerCase() === "componentneeded") {
                let comp = {};

                component.childNodes.forEach((componentChild) => {
                  if (componentChild.nodeType === Node.ELEMENT_NODE) {
                    const childTag = componentChild.localName.toLowerCase();

                    if (childTag === "componentid") {
                      comp["compID"] = componentChild.textContent;
                    } else if (childTag === "notes") {
                      comp["notes"] = removeWhitespace(componentChild.textContent);
                    }
                  }
                });
                components.push(comp);
              }
            });
            finishedComponents = true;
          } else if (tagName === "br") {
            if (!finishedComponents) {
              toe_overview += "<br/>";
            } else additionalText += "<br/>";
          } else if (raw_xml_tags.includes(tagName)) {
            const content = escapeXmlTags(getNodeContent(toeChild));
            if (!finishedComponents) {
              toe_overview += content;
            } else {
              additionalText += content;
            }
          } else if (style_tags.includes(tagName)) {
            const content = parseRichTextChildren(toeChild);

            if (!finishedComponents) {
              toe_overview += content + "<br/><br/>";
            } else {
              additionalText += content;
            }
          } else if (tagName === "div") {
            toe_overview += getNodeContent(toeChild);
          }
        } else if (toeChild.nodeType === Node.TEXT_NODE) {
          const text = removeWhitespace(escapeLTSign(toeChild.textContent));

          if (!finishedComponents) {
            toe_overview += text;
          } else {
            additionalText += text;
          }
        }
      });
    } else {
      toe_overview = parseRichTextChildren(toeSection);

      toeSection.childNodes.forEach((subsection) => {
        if (subsection.nodeType === Node.ELEMENT_NODE) {
          const subsectionName = subsection.localName.toLowerCase();
          const subsectionTitle = getToeSubsectionTitle(subsection);

          if (isToeSubsection(subsection)) {
            const content = parseRichTextChildren(subsection);
            const xmlTagMeta = getXmlTagMeta(subsection);

            subsections.push({
              title: subsectionTitle,
              content,
              xmlTagMeta,
            });

            if (subsectionTitle === "TOE Boundary" || subsectionName === "toe_boundary") {
              toe_boundary = content;
            } else if (subsectionTitle === "TOE Platform" || subsection.getAttribute("id") === "TOEplatform" || subsectionName === "toe_platform") {
              toe_platform = content;
            } else if (subsectionTitle === "TOE Operational Environment" || subsectionName === "toe_operational_environment") {
              toe_oe.content = content;
              toe_oe.tagName = subsection.tagName;
              toe_oe.attributes = xmlTagMeta.attributes;
            }
          }
        }
      });
    }
  }

  return { toe_overview, toe_boundary, toe_platform, toe_oe, components, additionalText, subsections };
};

const getXmlTagMeta = (node) => {
  let xmlTagMeta = {
    tagName: node.tagName,
    attributes: {},
  };

  node.attributes.forEach((attr) => {
    xmlTagMeta.attributes[attr.name] = attr.value;
  });

  return xmlTagMeta;
};

const getDirectElementChild = (node, localName) =>
  Array.from(node?.childNodes || []).find((child) => child.nodeType === Node.ELEMENT_NODE && child.localName === localName) || null;

const isImplementationFeatureSection = (node) => {
  const title = node?.getAttribute?.("title") || "";
  const id = node?.getAttribute?.("id") || "";

  return (
    getDirectElementChild(node, "implements") &&
    (id === "sec-features" ||
      title === "Product Features Mapped to Implementation-dependent Requirements" ||
      title.toLowerCase().includes("implementation-dependent"))
  );
};

const getToeSubsectionTitle = (node) => {
  const explicitTitle = node.getAttribute("title");
  const localName = node.localName.toLowerCase();

  if (explicitTitle) {
    return explicitTitle;
  }

  if (localName === "toe_boundary") {
    return "TOE Boundary";
  }

  if (localName === "toe_platform") {
    return "TOE Platform";
  }

  if (localName === "toe_operational_environment") {
    return "TOE Operational Environment";
  }

  return node.localName.replace(COMMON_REGEX.underscore, " ");
};

const isToeSubsection = (node) => {
  const localName = node.localName.toLowerCase();
  return localName === "section" || localName === "toe_boundary" || localName === "toe_platform" || localName === "toe_operational_environment";
};

/**
 * Parse the Use Cases section intro (this is called TOE Usage in the tool)
 * @param {Node} domNode
 * @returns {string}
 */
export const getUseCaseDescription = (use_case_section) => {
  let use_case_description = "";

  if (use_case_section) {
    use_case_description = parseRichTextChildren(use_case_section);
  }

  return use_case_description;
};

/**
 * Parse the Use Cases section
 * @param {Node} domNode
 * @returns {Array<{
 *   name: string,
 *   description: string,
 *   id: string,
 *   useCaseConfig: Array<string>, // array of ref-id values
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }>}
 */
export const getUseCases = (domNode) => {
  let useCases = null;
  let useCaseArray = new Array();

  if (findAllByTagName("usecases", domNode).length !== 0) {
    useCases = findAllByTagName("usecases", domNode)[0];
  }

  if (useCases) {
    for (let useCase of useCases.childNodes) {
      if (useCase.nodeType === Node.ELEMENT_NODE && useCase.tagName.toLowerCase() === "usecase") {
        let description = parseRichTextChildren(findAllByTagName("description", useCase)[0]);
        let name = useCase.getAttribute("title") ? useCase.getAttribute("title") : "";
        let id = useCase.getAttribute("id") ? useCase.getAttribute("id") : "";
        let config = findAllByTagName("config", useCase);
        let useCaseConfig = [];

        // Extract all <ref-id> text values into an array
        if (config.length !== 0) {
          const refIds = findAllByTagName("ref-id", config[0]);
          if (refIds && refIds.length > 0) {
            refIds.forEach((ref) => {
              if (ref?.textContent) {
                const value = ref.textContent.trim();
                if (value.length > 0) useCaseConfig.push(value);
              }
            });
          }
        }

        useCaseArray.push({
          name: name,
          description: description,
          id: id,
          useCaseConfig,
          xmlTagMeta: {
            tagName: "usecase",
            attributes: {
              title: name,
              id: useCase.getAttribute("id") ? useCase.getAttribute("id") : "",
            },
          },
        });
      }
    }

    return useCaseArray;
  }
};

/**
 * Gets the pp template version
 * Types: Version 3.1, CC2022 Direct Rationale, CC2022 Standard
 * @param {Node} domNode
 * @returns {string}
 */
export const getPpTemplateVersion = (domNode) => {
  let cclaims = findAllByTagName("CClaimsInfo", domNode) || [];
  let version = "Version 3.1";

  if (cclaims.length !== 0) {
    cclaims = cclaims[0];
    const cc_version = cclaims.getAttribute("cc-version");
    const cc_approach = cclaims.getAttribute("cc-approach");

    if (cc_version === "cc-2022r1") {
      version = cc_approach === "standard" ? "CC2022 Standard" : "CC2022 Direct Rationale";
    }
  }

  return version;
};

/**
 * Gets the pp type
 * Types: PP, Functional Package, Assurance Package, Module
 * @param {Node} domNode
 * @returns {string}
 */
export const getPpType = (domNode) => {
  const isFP = findAllByTagName("Package", domNode) || [];
  const isModule = findAllByTagName("Module", domNode) || [];
  let ppType = "Protection Profile"; // Default to PP

  if (isFP.length !== 0) {
    ppType = "Functional Package";
  }

  if (isModule.length !== 0) {
    ppType = "Module";
  }

  return ppType;
};

/**
 * Gets the attributes from the CClaimsInfo tag
 * @param {Node} domNode
 * @returns {{
 *   "cc-version": string,
 *   "cc-approach": string,
 *   "cc-errata": string
 * } | null}
 */
export const getCClaimsAttributes = (domNode) => {
  let cclaims = findAllByTagName("CClaimsInfo", domNode) || [];
  if (cclaims.length === 0) {
    return null;
  }
  cclaims = cclaims[0];

  let cClaimsInfo = {};
  cClaimsInfo["cc-version"] = cclaims.getAttribute("cc-version") || "";
  cClaimsInfo["cc-approach"] = cclaims.getAttribute("cc-approach") || "";

  // The only allowable values for cc-errata are v1.0 and v1.1. N/A will remove the attribute upon export
  const ccErrataAttr = cclaims.getAttribute("cc-errata");
  cClaimsInfo["cc-errata"] = ccErrataAttr === "v1.0" || ccErrataAttr === "v1.1" ? ccErrataAttr : "N/A";

  return cClaimsInfo;
};

/**
 * Parse the Conformance Claims section (for both Version 3.1 and CC2022)
 * @param {Node} domNode
 * @param {string} ppVersion
 * @returns {Array<
 *    {
 *       name: string,
 *       description: string,
 *       xmlTagMeta: {
 *         tagName: string,
 *         attributes: Object.<string, string>
 *       }
 *     }
 *   | {
 *       name: "PP Claim CC2022",
 *       ppClaim: Array<{
 *         name: string,
 *         description: string
 *       }>,
 *       configurations: {
 *         pp: Array<{
 *           name: string,
 *           description: string
 *         }>,
 *         modules: Array<{
 *           name: string,
 *           description: string
 *         }>
 *       }
 *     }
 *   | {
 *       name: "Conformance CC2022",
 *       description: string,
 *       tagName: string
 *     }
 *   | {
 *       name: "Package Claim CC2022",
 *       configurations: {
 *         functionalPackages: Array<{
 *           name: string,
 *           description: string,
 *           conf: string
 *         }>,
 *         assurancePackages: Array<{
 *           name: string,
 *           description: string,
 *           conf: string
 *         }>
 *       }
 *     }
 *   | {
 *       name: "Evaluation Methods CC2022",
 *       methods: Array<{
 *         description: string
 *       }>
 *     }
 *   | {
 *       name: "CClaim Additional Info CC2022",
 *       description: string
 *     }
 * >,
 *   sectionXMLTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string,string>
 *   },
 *   cClaimsXMLTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string,string>
 *   }
 * }
 */
export const getCClaims = (domNode, ppVersion) => {
  let cclaims = null;
  let cclaimArray = new Array();
  let sectionXMLTagMeta = {
    tagName: "",
    attributes: {},
  };
  let cClaimsXMLTagMeta = {
    tagName: "CClaimsInfo",
    attributes: {},
  };

  sectionXMLTagMeta.tagName = domNode.tagName;

  // Set attributes (if any)
  for (let attr of domNode.attributes) {
    sectionXMLTagMeta.attributes[attr.name] = attr.value;
  }

  if (ppVersion === "Version 3.1") {
    cclaims = findAllByTagName("cclaims", domNode) || [];

    if (cclaims.length !== 0) {
      cclaims = cclaims[0];

      for (let cclaim of cclaims.childNodes) {
        if (cclaim.nodeType === Node.ELEMENT_NODE && cclaim.tagName.toLowerCase() === "cclaim") {
          let description = parseRichTextChildren(findAllByTagName("description", cclaim)[0]);

          cclaimArray.push({
            name: cclaim.getAttribute("name") ? cclaim.getAttribute("name") : "",
            description: description,
            xmlTagMeta: {
              tagName: "cclaim",
              attributes: {
                name: cclaim.getAttribute("name") ? cclaim.getAttribute("name") : "",
              },
            },
          });
        }
      }
    }
  } else {
    cclaims = findAllByTagName("CClaimsInfo", domNode) || [];

    if (cclaims.length !== 0) {
      cclaims = cclaims[0];

      // Set attributes (if any)
      for (let attr of cclaims.attributes) {
        cClaimsXMLTagMeta.attributes[attr.name] = attr.value;
      }

      let conformanceTypes = ["cc-st-conf", "cc-pt2-conf", "cc-pt3-conf"];
      cclaimArray.push({
        name: "PP Claim CC2022",
        ppClaim: [],
        configurations: [],
      });

      for (let cclaim of cclaims.childNodes) {
        if (cclaim.nodeType === Node.ELEMENT_NODE) {
          if (conformanceTypes.includes(cclaim.tagName.toLowerCase())) {
            cclaimArray.push({
              name: "Conformance CC2022",
              description: cclaim.textContent,
              tagName: cclaim.tagName.toLowerCase(),
            });
          } else if (cclaim.tagName.toLowerCase() === "cc-pp-conf" || cclaim.tagName.toLowerCase() === "cc-pp-config-with") {
            let ppClaimArr = cclaimArray.filter((entry) => entry.name === "PP Claim CC2022")[0];
            let ppConformanceClaims = [];
            let ppConfig = {
              pp: [],
              modules: [],
            };

            if (cclaim.tagName.toLowerCase() === "cc-pp-conf") {
              cclaim.childNodes.forEach((ppClaimChild) => {
                if (ppClaimChild.nodeType === Node.ELEMENT_NODE) {
                  if (ppClaimChild.tagName.toLowerCase() === "pp-cc-ref") {
                    ppConformanceClaims.push({
                      name: "PP Conformance",
                      description: ppClaimChild.textContent,
                    });
                  }
                }
              });

              ppClaimArr.ppClaim = ppConformanceClaims;
            } else if (cclaim.tagName.toLowerCase() === "cc-pp-config-with") {
              cclaim.childNodes.forEach((ppClaimChild) => {
                if (ppClaimChild.nodeType === Node.ELEMENT_NODE) {
                  if (ppClaimChild.tagName.toLowerCase() === "pp-cc-ref") {
                    ppConfig.pp.push({
                      name: "PP Configuration",
                      description: ppClaimChild.textContent,
                    });
                  } else if (ppClaimChild.tagName.toLowerCase() === "mod-cc-ref") {
                    ppConfig.modules.push({
                      name: "Module Configuration",
                      description: ppClaimChild.textContent,
                    });
                  }
                }
              });
              ppClaimArr.configurations = ppConfig;
            }
          } else if (cclaim.tagName.toLowerCase() === "cc-pkg-claim") {
            let packageClaim = {
              functionalPackages: [],
              assurancePackages: [],
            };

            cclaim.childNodes.forEach((packageClaimChild) => {
              if (packageClaimChild.nodeType === Node.ELEMENT_NODE) {
                if (packageClaimChild.tagName.toLowerCase() === "fp-cc-ref") {
                  packageClaim.functionalPackages.push({
                    name: "Functional Package",
                    description: packageClaimChild.textContent,
                    conf: packageClaimChild.getAttribute("conf") ? packageClaimChild.getAttribute("conf") : "",
                  });
                } else if (packageClaimChild.tagName.toLowerCase() === "ap-cc-ref") {
                  packageClaim.assurancePackages.push({
                    name: "Assurance Package",
                    description: packageClaimChild.textContent,
                    conf: packageClaimChild.getAttribute("conf") ? packageClaimChild.getAttribute("conf") : "",
                  });
                }
              }
            });
            cclaimArray.push({
              name: "Package Claim CC2022",
              configurations: packageClaim,
            });
          } else if (cclaim.tagName.toLowerCase() === "cc-eval-methods") {
            let evalMethods = [];

            cclaim.childNodes.forEach((evalMethodChild) => {
              if (evalMethodChild.nodeType === Node.ELEMENT_NODE) {
                if (evalMethodChild.tagName.toLowerCase() === "em-cc-ref") {
                  evalMethods.push({ description: evalMethodChild.textContent });
                }
              }
            });

            cclaimArray.push({
              name: "Evaluation Methods CC2022",
              methods: evalMethods,
            });
          } else if (cclaim.tagName.toLowerCase() === "cc-claims-addnl-info") {
            cclaimArray.push({
              name: "CClaim Additional Info CC2022",
              description: cclaim.textContent,
            });
          }
        }
      }
    }
  }

  return { cclaimArray, sectionXMLTagMeta, cClaimsXMLTagMeta };
};

/**
 * Constructs HTML by recursively calling getNodeContent
 * @param {Node} node
 * @param {boolean} retainNamespace
 * @returns {string}
 */
const getNodeContentWithTags = (node, retainNamespace = false) => {
  let content = "";
  for (let childNode of node.childNodes) {
    content += getNodeContent(childNode, retainNamespace);
  }
  return content;
};

function getDirectChildByTagName(node, tagName) {
  return Array.from(node?.childNodes || []).find((child) => child.nodeType === Node.ELEMENT_NODE && child.localName === tagName) || null;
}

function parseExtendedComponentDefinitionNode(def) {
  const modDefElement = getDirectChildByTagName(def, "mod-def");
  const famBehaviorElement = getDirectChildByTagName(def, "fam-behavior");

  return {
    definitionType: modDefElement && !famBehaviorElement ? "mod-def" : "fam-behavior",
    famBehavior: famBehaviorElement ? parseRichTextChildren(famBehaviorElement) : "",
    modDef: modDefElement ? parseRichTextChildren(modDefElement) : "",
  };
}

function getLinkContent(node) {
  const href = node.getAttribute("href");
  const content = parseRichTextChildren(node).trim();
  return href ? `<a href="${href}">${content}</a>` : `<a>${content}</a>`;
}

/**
 * Recursively traverses and constructs HTML content for each node
 * @param {Node} node
 * @param {boolean} retainNamespace
 * @returns {string}
 */
const getNodeContent = (node, retainNamespace = false) => {
  if (node.nodeType === Node.TEXT_NODE) {
    // If text node, return text content
    return escapeLTSign(node.textContent);
  } else if (node.nodeType === Node.COMMENT_NODE) {
    return `<!--  ${node.textContent}  -->`;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Constructs opening tag with attributes, recursively get content for child nodes
    let nodeName = retainNamespace ? node.tagName : node.localName;
    let attrs = "";
    let content = "";

    // Set attributes (if any)
    for (let attr of node.attributes) {
      attrs += ` ${attr.name}="${attr.value}"`;
    }

    // Check for empty text (or new line/indentation) - determines if should be self closing tag
    const isEmpty =
      node.childNodes.length === 0 ||
      (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE && node.firstChild.textContent.trim() === "");

    if (isEmpty) {
      content += `<${nodeName}${attrs}/>`;
    } else {
      content = `<${nodeName}${attrs}>`;
      for (let childNode of node.childNodes) {
        content += getNodeContent(childNode, retainNamespace);
      }
      content += `</${nodeName}>`;
    }

    return content;
  } else {
    return "";
  }
};

/**
 * Gets the first XML comment immediately following a <depends> node, ignoring whitespace text nodes.
 * @param {Node} dependNode the <depends> node whose following sibling may be a comment
 * @returns {string} trimmed comment text, or an empty string if no trailing comment exists
 */
const getTrailingDependsComment = (dependNode) => {
  let sibling = dependNode?.nextSibling;

  while (sibling) {
    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent.trim() === "") {
      sibling = sibling.nextSibling;
      continue;
    }

    if (sibling.nodeType === Node.COMMENT_NODE) {
      return sibling.textContent.trim();
    }

    break;
  }

  return "";
};

const getExternalDocRef = (dependNode) => {
  for (const child of dependNode.childNodes) {
    if (child.tagName === "external-doc") {
      return child.getAttribute("ref");
    }
  }
  return null;
};

/**
 * Creates the default structured evaluation activity object used by SFR, SAR, and management function parsing.
 * @param {Object<string, string>|null} platformMap optional map from platform XML ref IDs to platform display names
 * @returns {{
 *   hasLevelSet: (string|boolean),
 *   tss: string,
 *   tssDependencies: string[],
 *   tssDependencySections: Array<{dependencies: string[], text: string}>,
 *   introduction: string,
 *   guidance: string,
 *   guidanceDependencies: string[],
 *   guidanceDependencySections: Array<{dependencies: string[], text: string}>,
 *   testIntroduction: string,
 *   testClosing: string,
 *   testLists: Object,
 *   tests: Object,
 *   platformMap: (Object<string, string>|null),
 *   isNoTest: boolean,
 *   noTest: string
 * }}
 */
const getEvaluationActivityDefault = (platformMap = null) => ({
  hasLevelSet: false,
  tss: "",
  tssDependencies: [],
  tssDependencySections: [],
  introduction: "",
  guidance: "",
  guidanceDependencies: [],
  guidanceDependencySections: [],
  testIntroduction: "",
  testClosing: "",
  testLists: {},
  tests: {},
  platformMap,
  isNoTest: false,
  noTest: "",
});

const getDependsValue = (dependsNode, platformMap) => {
  if (platformMap && dependsNode.getAttribute("ref")) {
    return platformMap?.[dependsNode.getAttribute("ref")] || dependsNode.getAttribute("ref");
  }

  return (
    dependsNode.getAttribute("on") ||
    dependsNode.getAttribute("on-sel") ||
    dependsNode.getAttribute("ref") ||
    dependsNode.getAttribute("on-fcomp") ||
    dependsNode.getAttribute("on-incl") ||
    ""
  );
};

const getDependsAttributes = (dependsNode) => {
  const dependsAttributes = {};
  dependsNode?.attributes?.forEach((attr) => {
    dependsAttributes[`@${attr.name}`] = attr.value;
  });
  return dependsAttributes;
};

const getDirectDependsChildren = (node) =>
  Array.from(node.childNodes || []).filter((child) => child.nodeType === Node.ELEMENT_NODE && child.localName?.toLowerCase() === "depends");

const appendUniqueDependency = (dependencies, dependency) => {
  if (dependency && !dependencies.includes(dependency)) {
    dependencies.push(dependency);
  }
};

/**
 * Serializes an evaluation activity child node into editor-safe rich text.
 * @param {Node} node text or element node from inside an <aactivity> child section
 * @returns {string} escaped text, preserved raw XML, or rich text markup for the node
 */
const serializeEvaluationActivityChild = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeLTSign(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  if (raw_xml_tags.includes(node.localName)) {
    return ` ${escapeXmlTags(getNodeContent(node))} `;
  }

  if (node.localName.toLowerCase() === "br") {
    return "<br/>";
  }

  return ` <${node.localName}${getNodeAttributes(node)}>${parseRichTextChildren(node)}</${node.localName}> `;
};

/**
 * Recursively parses TSS/Guidance section children, collecting standalone dependency blocks separately.
 * @param {Node} parentNode current TSS/Guidance descendant being parsed
 * @param {Object} eA evaluation activity object; its platformMap is used to resolve platform refs
 * @param {string[]} dependencies accumulator for legacy section-level dependency values
 * @param {Array<{dependencies: string[], text: string}>} dependencySections accumulator for dependent text blocks
 * @param {boolean} extractDependencySections true when child elements with direct <depends> nodes should become separate sections
 * @returns {string} section content with dependency blocks removed but surrounding rich text preserved
 */
const parseEvaluationActivitySectionChildren = (parentNode, eA, dependencies, dependencySections = [], extractDependencySections = true) => {
  let content = "";

  parentNode.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      content += escapeLTSign(child.textContent);
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const childTag = child.localName?.toLowerCase();

    if (childTag === "depends") {
      const dependency = getDependsValue(child, eA.platformMap);
      appendUniqueDependency(dependencies, dependency);
      return;
    }

    const directDependsChildren = getDirectDependsChildren(child);
    if (extractDependencySections && directDependsChildren.length > 0) {
      const blockDependencies = [];
      const blockContent = parseEvaluationActivitySectionChildren(child, eA, blockDependencies, [], false).trim();

      if (blockDependencies.length > 0 || blockContent) {
        dependencySections.push({
          dependencies: blockDependencies,
          text: blockContent,
        });
      }
      return;
    }

    if (raw_xml_tags.includes(child.localName)) {
      content += ` ${escapeXmlTags(getNodeContent(child))} `;
      return;
    }

    if (childTag === "br") {
      content += "<br/>";
      return;
    }

    const innerContent = parseEvaluationActivitySectionChildren(child, eA, dependencies, dependencySections, extractDependencySections);
    content += ` <${child.localName}${getNodeAttributes(child)}>${innerContent}</${child.localName}> `;
  });

  return content;
};

/**
 * Parses a TSS or Guidance section into the structured evaluation activity object.
 * @param {Node} sectionNode the <TSS> or <Guidance> node to parse
 * @param {Object} eA evaluation activity object to mutate with section text and dependency data
 * @param {"tss"|"guidance"} sectionType target evaluation activity section field
 * @returns {void}
 */
const parseEvaluationActivitySection = (sectionNode, eA, sectionType) => {
  const dependencyField = `${sectionType}Dependencies`;
  const dependencySectionsField = `${sectionType}DependencySections`;
  let dependencies = [];
  let dependencySections = [];
  const content = parseEvaluationActivitySectionChildren(sectionNode, eA, dependencies, dependencySections);

  eA[sectionType] = sectionType === "tss" ? content.trim() : content;
  eA[dependencyField] = dependencies;
  eA[dependencySectionsField] = dependencySections;
};

/**
 * Parses an <aactivity> node into the structured evaluation activity state shape.
 * @param {Node} activity the <aactivity> node to parse
 * @param {Object<string, string>|null} platformMap optional map from platform XML ref IDs to platform display names
 * @returns {Object} structured evaluation activity data including TSS/Guidance dependencies, tests, no-test, and custom EA data
 */
const parseEvaluationActivityNode = (activity, platformMap = null) => {
  const eA = getEvaluationActivityDefault(platformMap);
  eA.hasLevelSet = activity.getAttribute("level") || false;

  activity.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      eA.introduction += escapeLTSign(child.textContent);
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const childTag = child.tagName.toLowerCase();
    if (childTag === "tss") {
      parseEvaluationActivitySection(child, eA, "tss");
    } else if (childTag === "guidance") {
      parseEvaluationActivitySection(child, eA, "guidance");
    } else if (childTag === "customea") {
      eA.customea = {
        text: parseRichTextChildren(child),
        nameAttribute: child.getAttribute("name"),
      };
    } else if (childTag === "tests") {
      parseTests(child, eA);
    } else if (childTag === "no-tests") {
      eA.noTest = parseRichTextChildren(child);
      eA.isNoTest = true;
    } else {
      eA.introduction += serializeEvaluationActivityChild(child);
    }
  });

  eA.introduction = eA.introduction.trim();
  return eA;
};

/**
 * Parse the Security Assurance Requirements section
 * @param {Node} domNode
 * @returns {Object} Object containing metadata for all the SAR data
 */
export const getSARs = (domNode) => {
  let sars = null;
  let xmlTagMeta = {
    tagName: "",
    attributes: {},
  };
  let sarsDescription = "";

  // SAR Families
  let sections = [];

  if (findAllByAttribute("title", "Security Assurance Requirements", domNode).length !== 0) {
    sars = findAllByAttribute("title", "Security Assurance Requirements", domNode)[0];
  }

  if (findAllByTagName("Security_Assurance_Requirements", domNode).length !== 0) {
    sars = findAllByTagName("Security_Assurance_Requirements", domNode)[0];
  }

  function parseSectionChildren(parent, section) {
    // Iterate through children of <section>
    parent.childNodes.forEach((sectionChild) => {
      if (sectionChild.nodeType === Node.ELEMENT_NODE) {
        if (sectionChild.tagName.toLowerCase() === "a-component") {
          let component = {
            summary: parseRichTextChildren(sectionChild),
            elements: [],
            xmlTagMeta: {
              tagName: sectionChild.tagName.toLowerCase(),
              attributes: {},
            },
          };

          // Set the attributes if any
          sectionChild.attributes.forEach((attr) => {
            component.xmlTagMeta.attributes[attr.name] = attr.value;
          });

          // Iterate through children of <a-component>
          sectionChild.childNodes.forEach((componentChild) => {
            if (componentChild.nodeType === Node.ELEMENT_NODE) {
              if (componentChild.tagName.toLowerCase() === "a-element") {
                let element = {
                  aactivity: "",
                  title: "",
                  note: "",
                  noteRole: "application",
                  xmlTagMeta: {
                    tagName: componentChild.tagName.toLowerCase(),
                    attributes: {},
                  },
                };

                // Set the attributes if any
                componentChild.attributes.forEach((attr) => {
                  element.xmlTagMeta.attributes[attr.name] = attr.value;
                });

                componentChild.childNodes.forEach((elementChild) => {
                  if (elementChild.nodeType === Node.ELEMENT_NODE) {
                    const tagName = elementChild.tagName.toLowerCase();
                    if (tagName === "note" || tagName === "app-note") {
                      element.note = parseRichTextChildren(elementChild);
                      element.noteRole = elementChild.getAttribute("role") || "application";
                    } else if (tagName === "aactivity") {
                      const structuredAActivity = parseEvaluationActivityNode(elementChild);
                      const hasStructuredContent =
                        structuredAActivity.isNoTest ||
                        structuredAActivity.tss ||
                        structuredAActivity.tssDependencies?.length > 0 ||
                        structuredAActivity.tssDependencySections?.length > 0 ||
                        structuredAActivity.guidance ||
                        structuredAActivity.guidanceDependencies?.length > 0 ||
                        structuredAActivity.guidanceDependencySections?.length > 0 ||
                        structuredAActivity.testIntroduction ||
                        structuredAActivity.testClosing ||
                        Object.keys(structuredAActivity.testLists || {}).length > 0 ||
                        structuredAActivity.customea;

                      element.aactivity = hasStructuredContent ? structuredAActivity : parseRichTextChildren(elementChild);
                    } else {
                      element[tagName] = parseRichTextChildren(elementChild);
                    }
                  }
                });

                component.elements.push(element);
              } else if (componentChild.tagName.toLowerCase() === "summary") {
                // Content of the component
                component.summary = parseRichTextChildren(componentChild);
              }
            }
          });
          section.components.push(component);
        }
      }
    });

    return section;
  }

  if (sars) {
    // Set tag name for the SARs section
    xmlTagMeta.tagName = sars.nodeName;
    // Set the attributes if any
    sars.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    sars.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.nodeName.toLowerCase() === "section" || (child.prefix && child.prefix.toLowerCase() === "sec")) {
          let section = {
            summary: "",
            open: false,
            components: [],
            xmlTagMeta: {
              tagName: child.nodeName.toLowerCase(),
              attributes: {},
            },
          };

          // Set the attributes if any
          child.attributes.forEach((attr) => {
            section.xmlTagMeta.attributes[attr.name] = attr.value;
          });

          // Set the id from the tag
          if (child.prefix && child.prefix.toLowerCase() === "sec") {
            section.xmlTagMeta.attributes["id"] = child.nodeName.toLowerCase().split(":")[1];
          }

          // Set the Family text
          section.summary += parseRichTextChildren(child);

          // Parse children of the section (Family) tag
          section = parseSectionChildren(child, section);

          sections.push(section);
        }
      }
    });

    // Set the Intro text for SARs
    if (sarsDescription.length === 0) {
      sarsDescription = parseRichTextChildren(sars);
    } else {
      sarsDescription += parseRichTextChildren(sars);
    }
  }

  return { sarsDescription, sections, xmlTagMeta };
};

/**
 * Parse the implementations section
 * @param {Node} domNode section node that contains an <implements> child, or an <implements> node
 * @returns {{
 *   title: string,
 *   text: string,
 *   featureList: Array<{
 *     id: string,
 *     title: string,
 *     description: string
 *   }>,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getImplementations = (domNode) => {
  const implementationsNode = domNode?.localName === "implements" ? domNode : getDirectElementChild(domNode, "implements");
  const sectionNode = domNode?.localName === "implements" ? domNode.parentNode : domNode;
  const sectionWithoutImplementations = sectionNode?.cloneNode(true);
  const clonedImplementationsNode = getDirectElementChild(sectionWithoutImplementations, "implements");
  let featureList = [];

  if (clonedImplementationsNode) {
    sectionWithoutImplementations.removeChild(clonedImplementationsNode);
  }

  if (implementationsNode) {
    const featureElements = Array.from(implementationsNode.childNodes).filter((child) => child.nodeType === Node.ELEMENT_NODE && child.localName === "feature");

    featureElements.forEach((featureElement) => {
      const descriptionElement = getDirectElementChild(featureElement, "description");

      featureList.push({
        id: featureElement.getAttribute("id") || "",
        title: featureElement.getAttribute("title") || "",
        description: descriptionElement ? parseRichTextChildren(descriptionElement) : "",
      });
    });
  }

  return {
    title: sectionNode?.getAttribute?.("title") || "Product Features Mapped to Implementation-dependent Requirements",
    text: sectionWithoutImplementations ? parseRichTextChildren(sectionWithoutImplementations) : "",
    featureList,
    xmlTagMeta: sectionNode ? getXmlTagMeta(sectionNode) : { tagName: "section", attributes: {} },
  };
};

/**
 * This is the placeholder section where the audit table will get placed
 * @param {Node} domNode
 * @returns {string}
 */
export const getAuditSection = (domNode) => {
  let section = "";

  let auditTables = findAllByTagName("audit-table", domNode);
  if (auditTables.length !== 0) {
    section = getNodeContent(auditTables[0].parentNode, true); // only care about first one since we are getting everything from the parent node
  }

  return section;
};

/**
 * Get xmlTagMeta of the Security Requirements section.
 * @param {Node} domNode
 * @returns {Object}
 */
export const getSfrXmlTagMeta = (domNode) => {
  const section = Array.from(domNode.childNodes).find((node) => node.attributes && node.getAttribute?.("title") === "Security Functional Requirements");
  const attributes = Object.fromEntries(Array.from(domNode.attributes || []).map((attr) => [attr.name, attr.value]));
  const sfrAttributes = section ? Object.fromEntries(Array.from(section.attributes).map((attr) => [attr.name, attr.value])) : {};

  return {
    tagName: domNode.localName,
    attributes,
    sfrTagName: section?.localName,
    sfrAttributes,
  };
};

/**
 * This loads the top level content of Security Requirements
 * @param {Node} domNode
 * @returns {string}
 */
export const getSecurityRequirement = (domNode) => {
  let securityRequirement = "";
  const securityNode = findAllByAttribute("title", "Security Requirements", domNode);

  if (securityNode.length !== 0) {
    securityRequirement = parseRichTextChildren(securityNode[0]);
  }

  return securityRequirement;
};

/**
 * get audit table sections for modules
 * @param {Node} domNode
 */
export const getSfrAuditTables = (domNode) => {
  const mandatory = findAllByTagName("man-sfrs", domNode)[0];
  const optional = findAllByTagName("opt-sfrs", domNode)[0];
  const selectionBased = findAllByTagName("sel-sfrs", domNode)[0];
  const objective = findAllByTagName("obj-sfrs", domNode)[0];
  const implementationDependent = findAllByTagName("impl-dep-sfrs", domNode)[0];
  const sars = findAllByTagName("mod-sars", domNode)[0]; // Not sure if there will be an audit table here; adding parsing for transforms boilerplate text generation

  const sections = {
    ...(mandatory && { mandatory }),
    ...(optional && { optional }),
    ...(selectionBased && { selectionBased }),
    ...(objective && { objective }),
    ...(implementationDependent && { implementationDependent }),
    ...(sars && { sars }),
  };

  const result = {};

  // for each section, populate the defaultAudit format in sfrBasePPsSlice
  Object.entries(sections).forEach(([key, section]) => {
    // SARs don't have audit tables
    if (key === "sars") return;

    const firstSection = findAllByTagName("section", section)[0];
    const tableSection = findAllByTagName("audit-table", section)[0];
    let description = "";
    if (firstSection) {
      description = (getNodeContentWithTags(firstSection, true) || "").replace(FILE_PARSER_REGEX.auditTableTag, "");

      // Add a space after every <xref .../> if not already present
      description = description.replace(FILE_PARSER_REGEX.xrefSelfClosingWithoutTrailingSpace, "$1 ").trim();
    }

    result[key] = {
      isAudit: true,
      section: {
        id: firstSection?.getAttribute("id") || "",
        title: firstSection?.getAttribute("title") || "",
        description: description,
        open: false,
      },
      auditTable: {
        id: tableSection?.getAttribute("id") || "",
        table: tableSection?.getAttribute("table") || "",
        title: tableSection?.getAttribute("title") || "",
        open: false,
      },
      eventsTableOpen: false,
      open: true,
    };
  });

  return result;
};

/**
 * Parse through the <base-pp> tags (for Modules)
 * @param {Node} domNode
 */
export const getBasePPs = (domNode) => {
  const basePPs = findAllByTagName("base-pp", domNode);

  /**
   * Get text from the first tag that matches the tagName
   * @param {string} tagName
   * @param {Node} node
   * @returns {}
   */
  const getFirstTagText = (tagName, node) => {
    const matches = findAllByTagName(tagName, node);
    return matches.length ? matches[0].textContent.trim() : "";
  };

  return basePPs.map((basePP) => {
    const gitNode = findAllByTagName("git", basePP)[0] || null;
    const gitUrl = gitNode ? getFirstTagText("url", gitNode) : "";
    const gitBranch = gitNode ? getFirstTagText("branch", gitNode) : "";
    const shortName = basePP.getAttribute("short") || "";

    const secFuncReqDir = findAllByTagName("sec-func-req-dir", basePP)[0];

    const cPP = Boolean(findAllByTagName("cPP", basePP)[0]);

    // Get additional-sfrs if it exists
    const additionalSfrsNode = findAllByTagName("additional-sfrs", basePP)[0];
    const hasAdditionalSfrs = additionalSfrsNode && additionalSfrsNode.childNodes.length > 0; // Only care about non-empty tags

    let audit = {};
    let additionalSFRComponents = [];
    let modifiedSFRElements = []; // For new mod reform structure
    let modifiedSFRComponents = []; // For old mod sfr structure
    let oldModifiedComponents = []; // The mapped SFRs from the base PP for the SFR components modified from the Module
    let introTextAdditionalSFRs = "";
    const additionalSfrSections = {};

    if (hasAdditionalSfrs) {
      introTextAdditionalSFRs = parseRichTextChildren(additionalSfrsNode);

      // Build SFR Family Metadata
      const familyUUIDMap = new Map(); // famId -> UUID
      const sectionNodes = findAllByTagName("section", additionalSfrsNode);
      for (const section of sectionNodes) {
        // Parse SFR Components
        const fComponents = findAllByTagName("f-component", section);
        if (fComponents.length != 0) {
          const familyUUID = uuidv4();
          const title = section.getAttribute("title") || "";
          const sectionID = section.getAttribute("id");
          const extCompDefs = findAllByTagName("ext-comp-def", section).map((ecd) => ({
            famId: ecd.getAttribute("fam-id") || "",
            title: ecd.getAttribute("title") || "",
            ...parseExtendedComponentDefinitionNode(ecd),
          }));

          if (sectionID) {
            familyUUIDMap.set(sectionID.toUpperCase(), familyUUID);
          }

          additionalSfrSections[familyUUID] = {
            title,
            id: sectionID,
            definition: parseRichTextChildren(section),
            extendedComponentDefinition: extCompDefs,
            open: false,
          };
        }

        // Parse audit table
        const hasAuditTableNode = findAllByTagName("audit-table", section);
        if (hasAuditTableNode.length != 0) {
          const auditTableNode = hasAuditTableNode[0];
          const auditSectionNode = auditTableNode.parentNode;
          audit = {
            isAudit: true,
            section: auditSectionNode
              ? {
                  id: auditSectionNode.getAttribute("id") || "",
                  title: auditSectionNode.getAttribute("title") || "",
                  open: false,
                }
              : {},
            auditTable: auditTableNode
              ? {
                  id: auditTableNode.getAttribute("id") || "",
                  table: auditTableNode.getAttribute("table") || "",
                  title: auditTableNode.getAttribute("title") || "",
                  open: false,
                }
              : {},
            open: false,
          };
        }
      }

      // Parse f-components and add additionalSfr flag
      additionalSFRComponents = getSFRs(additionalSfrsNode, new Map()).map((comp) => ({
        ...comp,
        additionalSfr: true,
        familyUUID: familyUUIDMap.get((comp.family_id || "").toUpperCase()) || comp.familyUUID,
      }));
    }

    // Get modified-sfrs if it exists
    const modifiedSfrsNode = findAllByTagName("modified-sfrs", basePP)[0];
    const hasModifiedSfrs = modifiedSfrsNode && modifiedSfrsNode.childNodes.length > 0;

    let introTextModifiedSFRs = "";
    let modifiedSfrSections = {};

    if (hasModifiedSfrs) {
      introTextModifiedSFRs = parseRichTextChildren(modifiedSfrsNode);

      // Get mod-reform structured modified SFRs
      modifiedSFRElements = getBaseSFRSpecs(modifiedSfrsNode, shortName, dataMap);

      if (modifiedSFRElements.length != 0) {
        for (const mod of modifiedSFRElements) {
          modifiedSfrSections[mod.familyUUIDMap.get(mod.sectionID)] = {
            id: mod.sectionID || "",
            title: mod.sectionTitle || "",
            definition: mod.description || "",
            open: false,
          };
        }
      } else {
        // Likely the old format, and not the modified reform format
        modifiedSFRComponents = getSFRs(modifiedSfrsNode, new Map());
        if (modifiedSFRComponents && modifiedSFRComponents.length != 0) {
          for (const mod of modifiedSFRComponents) {
            // Set the Family Data
            modifiedSfrSections[mod.familyUUID] = {
              title: mod.family_name || "",
              open: false,
            };

            // Find the pre-existing component from the base PP
            let matchedComponent = null;
            if (shortName && mod.cc_id) {
              const sfrData = dataMap?.[shortName.toLowerCase()];
              if (sfrData) {
                // Match SFR component to exact couterpart in the base PP
                const matchKey = Object.keys(sfrData).find((k) => {
                  const normalizedKey = k.toLowerCase();
                  const normalizedCcId = mod.cc_id.toLowerCase();

                  if (normalizedCcId.match(FILE_PARSER_REGEX.dottedNumber)) {
                    return normalizedKey === normalizedCcId;
                  }
                });

                if (matchKey && sfrData[matchKey]) {
                  matchedComponent = deepCopy(sfrData[matchKey]);
                  matchedComponent.modifiedSfr = true;
                  matchedComponent.xml_id = mod.xml_id;
                  matchedComponent.consistencyRationale = mod.rationale;
                  matchedComponent.elements = mod.elements;
                  matchedComponent.evaluationActivities = mod.evaluationActivities;
                  matchedComponent.familyUUID = mod.familyUUID;

                  oldModifiedComponents.push(matchedComponent);
                }
              }
            }
          }
        }
      }
    }

    const getTextByTag = (tagName) => {
      const tagNode = findAllByTagName(tagName, basePP)[0];
      return tagNode ? parseRichTextChildren(tagNode) : "";
    };

    const conModNodes = findAllByTagName("con-mod", basePP);
    const conModRows = conModNodes.map((node) => ({
      id: uuidv4(),
      ref: node.getAttribute("ref") || "",
      text: node.textContent.trim(),
    }));

    return {
      declarationAndRef: {
        id: basePP.getAttribute("id") || "",
        name: basePP.getAttribute("name") || "",
        product: basePP.getAttribute("product") || "",
        short: basePP.getAttribute("short") || "",
        version: basePP.getAttribute("version") || "",
        plural: basePP.getAttribute("plural") || "",
        url: getFirstTagText("url", basePP),
        cPP,
        git: {
          url: gitUrl,
          branch: gitBranch,
          open: true,
        },
        secFuncReqDir: {
          text: secFuncReqDir ? parseRichTextChildren(secFuncReqDir) : "",
          open: true,
        },
        open: false,
      },
      modifiedSfrs: {
        introduction: introTextModifiedSFRs,
        sfrSections: modifiedSfrSections,
        open: false,
      },
      additionalSfrs: {
        introduction: introTextAdditionalSFRs,
        sfrSections: additionalSfrSections,
        audit,
        open: false,
      },
      consistencyRationale: {
        conToe: {
          text: getTextByTag("con-toe"),
          open: true,
        },
        conSecProb: {
          text: getTextByTag("con-sec-prob"),
          open: true,
        },
        conObj: {
          text: getTextByTag("con-obj"),
          open: true,
        },
        conOpEn: {
          text: getTextByTag("con-op-en"),
          open: true,
        },
        conMod: {
          rows: conModRows,
          open: true,
        },
        open: false,
      },
      additionalSFRComponents,
      modifiedSFRElements,
      oldModifiedComponents,
      open: false,
    };
  });
};

const getBaseSFRSpecs = (domNode, shortName, dataMap) => {
  function getCcTags(xpath) {
    const matches = [...xpath.matchAll(FILE_PARSER_REGEX.ccXpathTag)];
    return matches.map((match) => match[1]);
  }

  function getXpathID(xpath) {
    const match = xpath.match(FILE_PARSER_REGEX.xpathIdAttribute);
    return match ? match[1] : null;
  }

  const baseSpecs = findAllByTagName("base-sfr-spec", domNode);
  const results = [];
  let selectableGroupCounter = 0;
  const familyUUIDMap = new Map();

  for (const spec of baseSpecs) {
    let cc_id = spec.getAttribute("cc-id")?.toUpperCase() || "";
    const title = spec.getAttribute("title") || "";
    const xml_id = spec.getAttribute("id") || "";
    const iteration_id = spec.getAttribute("iteration") || "";
    if (iteration_id.length != 0) {
      cc_id += `/${iteration_id}`;
    }

    // Get section info
    let sectionTitle = "";
    let sectionID = "";
    let sectionDescription = "";

    let parent = spec.parentNode;
    while (parent) {
      if (parent.tagName?.toLowerCase() === "section") {
        sectionTitle = parent.getAttribute("title") || "";
        sectionID = parent.getAttribute("id") || "";
        // Build Map of id -> UUID
        if (!familyUUIDMap.has(sectionID)) {
          familyUUIDMap.set(sectionID, uuidv4());
        }
        sectionDescription = parseRichTextChildren(parent);
        break;
      }
      parent = parent.parentNode;
    }

    let status = null;
    let rationale = "";
    let description = "";
    let selectable_id = 0;

    // Array to support multiple directive tags (eg. multiple replace's)
    let xPathDetails = [];

    for (const child of spec.childNodes) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const tag = child.tagName?.toLowerCase();

      if (tag === "set-status") {
        status = child.getAttribute("status") || null;
        xPathDetails.push({
          type: "set-status",
          subType: "set-status",
          isComponentReplacement: false,
          replacementElements: null,
          f_element_id: null,
          status,
        });
      } else if (tag === "consistency-rationale") {
        rationale = parseRichTextChildren(child);
      } else if (tag === "description") {
        description = parseRichTextChildren(child);
      } else if (tag === "replace") {
        for (const replaceChild of child.childNodes) {
          if (replaceChild.nodeType !== Node.ELEMENT_NODE) continue;
          if (replaceChild.tagName?.toLowerCase() !== "xpath-specified") continue;

          const xpath = replaceChild.getAttribute("xpath") || "";
          const xPathTargetTags = getCcTags(xpath);
          const f_element_id = getXpathID(xpath);

          // Handle full f-component replacement
          if (xPathTargetTags.includes("f-component")) {
            const replacementElements = {};

            // Find all f-elements inside the f-component
            const fComponentNode = findAllByTagName("f-component", replaceChild)[0];
            if (fComponentNode) {
              const fElementNodes = findAllByTagName("f-element", fComponentNode);

              fElementNodes.forEach((fElementNode) => {
                const result = parseFElement(
                  fElementNode,
                  spec, // base-sfr-spec
                  cc_id,
                  selectable_id, // carry over counter
                  selectableGroupCounter, // carry over counter
                  {}, // evaluationActivities
                  null // sfrCompUUID
                );

                // Update counters so subsequent elements don't collide
                selectable_id = result.selectable_id;
                selectableGroupCounter = result.selectableGroupCounter;

                replacementElements[result.sfrElemUUID] = result.sfrElementMeta;
              });
            }

            xPathDetails.push({
              type: "replace",
              subType: "f-component",
              xpath,
              isComponentReplacement: true,
              replacementElements: Object.keys(replacementElements).length > 0 ? replacementElements : null,
              f_element_id: null,
            });
            break;
          }

          // Handle f-element title replacement
          if (xPathTargetTags.includes("f-element")) {
            let titleNode = null;
            for (const xpathChild of replaceChild.childNodes) {
              if (xpathChild.nodeType === Node.ELEMENT_NODE && xpathChild.tagName?.toLowerCase() === "title") {
                titleNode = xpathChild;
                break;
              }

              if (xpathChild.nodeType === Node.ELEMENT_NODE && xpathChild.tagName?.toLowerCase() === "f-element") {
                for (const feChild of xpathChild.childNodes) {
                  if (feChild.nodeType === Node.ELEMENT_NODE && feChild.tagName?.toLowerCase() === "title") {
                    titleNode = feChild;
                    break;
                  }
                }
              }
              if (titleNode) break;
            }

            if (titleNode) {
              // Wrap titleNode in a fake f-element for parseFElement
              const fakeElement = titleNode.ownerDocument.createElement("f-element");
              fakeElement.setAttribute("id", f_element_id || "");
              fakeElement.appendChild(titleNode.cloneNode(true));

              const result = parseFElement(fakeElement, spec, cc_id, selectable_id, selectableGroupCounter, {}, null, null);
              selectable_id = result.selectable_id;
              selectableGroupCounter = result.selectableGroupCounter;

              xPathDetails.push({
                type: "replace",
                subType: "f-element",
                xpath,
                xPathContent: "",
                isComponentReplacement: false,
                replacementElements: null,
                f_element_id,
                sfrContent: result.sfrElementMeta.title,
                allSelectables: result.sfrElementMeta.selectables,
                selectableGroups: result.sfrElementMeta.selectableGroups,
              });
            }
          }

          // App note replacements
          if (xPathTargetTags.includes("note")) {
            const noteNode = Array.from(replaceChild.childNodes).find((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName?.toLowerCase() === "note");

            xPathDetails.push({
              type: "replace",
              subType: "note",
              xpath,
              isComponentReplacement: false,
              replacementElements: null,
              f_element_id,
              noteContent: noteNode ? parseRichTextChildren(noteNode) : "",
            });
            break;
          }
        }
      } else if (tag === "insert-after" || tag === "insert-before") {
        // TODO: Modify/test once PPs are released with these tags
        // Currently only VPNC uses it to modify a management function
        const xpathNode = Array.from(child.childNodes).find((c) => c.nodeType === Node.ELEMENT_NODE && c.tagName?.toLowerCase() === "xpath-specified");

        if (xpathNode) {
          const xpath = xpathNode.getAttribute("xpath") || "";
          const f_element_id = getXpathID(xpath);
          const xPathTargetTags = getCcTags(xpath);

          let xPathContent = "";
          if (xPathTargetTags.includes("management-function") && xPathTargetTags.includes("text")) {
            xPathContent = getNodeContentWithTags(xpathNode);
          }

          xPathDetails.push({
            type: tag,
            subType: "management-function",
            xpath,
            xPathContent,
            isComponentReplacement: false,
            replacementElements: null,
            f_element_id,
          });
        }
      } else if (tag === "no-change") {
        xPathDetails.push({
          type: "no-change",
          subType: "no-change",
          isComponentReplacement: false,
          replacementElements: null,
          f_element_id: null,
        });
      }
    }

    // Find the pre-existing component from the base PP
    let matchedComponent = null;

    if (shortName && cc_id) {
      const sfrData = dataMap?.[shortName.toLowerCase()];
      if (sfrData) {
        const matchKey = Object.keys(sfrData).find((k) => k.toLowerCase().includes(cc_id.toLowerCase()));

        if (matchKey && sfrData[matchKey]) {
          matchedComponent = deepCopy(sfrData[matchKey]);
          matchedComponent.modifiedSfr = true;
          matchedComponent.definition = description;
          matchedComponent.xml_id = xml_id;
          matchedComponent.consistencyRationale = rationale;
          matchedComponent.xPathDetails = xPathDetails;
          matchedComponent.title = title; // setting title here as it has been seen that original base PP title has differed from the one in the module
        }

        if (matchedComponent) {
          // For no-change modifications, don't need to do anything else (only part that is updated atm is the
          // description - which is stored under the definition key of the component)
          const hasNoChange = xPathDetails.some((x) => x.type === "no-change");
          matchedComponent.noChange = hasNoChange;
          if (hasNoChange) {
            results.push({
              familyUUIDMap,
              title,
              status,
              description: sectionDescription,
              matchedComponent,
              sectionTitle,
              sectionID,
            });
            continue;
          }

          // Apply each xPathDetail in order
          for (const xPathDetail of xPathDetails) {
            const {
              type,
              subType,
              isComponentReplacement,
              replacementElements,
              f_element_id,
              sfrContent: elemSfrContent,
              allSelectables: elemAllSelectables,
              selectableGroups: elemSelectableGroups,
              xPathContent,
            } = xPathDetail;

            if (isComponentReplacement && replacementElements) {
              Object.entries(replacementElements).forEach(([_, el]) => {
                if (!el.title || el.title.length === 0) {
                  const originalEl = Object.values(matchedComponent.elements).find((orig) => orig.elementXMLID === el.elementXMLID);

                  if (originalEl?.title?.length > 0) {
                    // Find the top-level group in the replacement's selectableGroups
                    // (the one not referenced by any other group — it's the root)
                    const allReferencedGroups = new Set(Object.values(el.selectableGroups).flatMap((g) => g.groups || []));
                    const topLevelGroup = Object.keys(el.selectableGroups).find((key) => !allReferencedGroups.has(key));

                    if (topLevelGroup) {
                      // Use original surrounding text but point at replacement's root group
                      el.title = originalEl.title.map((item) => (item.selections ? { selections: topLevelGroup } : item));
                    }
                  }
                }
              });

              matchedComponent.elements = replacementElements;
              continue;
            }

            if (type === "replace" && subType === "f-element" && f_element_id) {
              const matchingElementUUID = Object.keys(matchedComponent.elements).find((uuid) => matchedComponent.elements[uuid].elementXMLID === f_element_id);

              if (matchingElementUUID) {
                const originalElement = matchedComponent.elements[matchingElementUUID];
                matchedComponent.elements[matchingElementUUID] = {
                  ...originalElement,
                  title: elemSfrContent,
                  elementXMLID: f_element_id,
                  open: true,
                  selectables: { ...originalElement.selectables, ...elemAllSelectables },
                  selectableGroups: { ...originalElement.selectableGroups, ...elemSelectableGroups },
                };
              }
              continue;
            }

            if (type === "replace" && subType === "note" && f_element_id) {
              const matchingElementUUID = Object.keys(matchedComponent.elements).find((uuid) => matchedComponent.elements[uuid].elementXMLID === f_element_id);

              if (matchingElementUUID) {
                matchedComponent.elements[matchingElementUUID].note = xPathDetail.noteContent;
              }
              continue;
            }

            if ((type === "insert-after" || type === "insert-before") && f_element_id) {
              function findManagementFunctionByID(component, targetId) {
                const elements = component?.elements || {};
                for (const elementUUID in elements) {
                  const element = elements[elementUUID];
                  const rows = element?.managementFunctions?.rows || [];
                  const matchedRow = rows.find((row) => row.id === targetId);
                  if (matchedRow) return matchedRow;
                }
                return null;
              }

              const managementFunction = findManagementFunctionByID(matchedComponent, getXpathID(xPathDetail.xpath));

              if (managementFunction && xPathContent) {
                const rawXML = `<root>${xPathContent}</root>`;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(rawXML, "application/xml");
                const newNodes = Array.from(xmlDoc.documentElement.childNodes);

                newNodes
                  .filter((n) => n.nodeType === Node.ELEMENT_NODE)
                  .forEach((el) => {
                    const newStatus = el.tagName;
                    const refKey = el.getAttribute("ref");
                    if (["I", "U", "A", "AO"].includes(refKey)) {
                      if (managementFunction.hasOwnProperty(refKey)) {
                        managementFunction[refKey] = newStatus;
                      }
                    }
                  });
              }
              continue;
            }
          }
        }
      }
    }

    results.push({
      familyUUIDMap,
      title,
      status,
      description: sectionDescription,
      matchedComponent,
      sectionTitle,
      sectionID,
    });
  }

  return results;
};

/**
 * Parse f-element node
 * @param {Node} element - the f-element DOM node
 * @param {Node} component - the parent f-component DOM node (used for selectable context)
 * @param {string} elementName - the element name/id string (e.g. "fcs_ckm.1.1")
 * @param {number} selectable_id - current selectable counter
 * @param {number} selectableGroupCounter - current group counter
 * @param {Object} evaluationActivities - EA map
 * @param {string} sfrCompUUID - parent component UUID
 * @param {Object} platformMap - platform map
 * @returns {{ sfrElementMeta, selectable_id, selectableGroupCounter, evaluationActivities }}
 */
export const parseFElement = (
  element,
  component,
  elementName,
  selectable_id,
  selectableGroupCounter,
  evaluationActivities,
  sfrCompUUID,
  platformMap = null
) => {
  let sfrContent = [];
  let sfrElemUUID = uuidv4();
  let isManagementFunction = false;
  let hasStatusMarkers = false;
  let allSelectables = {};
  let selectableGroups = {};

  // Management function status marker definiion
  const statusMarkers = {
    M: "Indicates that this function is mandatory for this role.",
    O: "Indicates that this function is optional for this role",
    NA: "Indicates that this function is not applicable for this role",
    X: "Indicates that this function is not permitted for this role",
  };

  let managementFunctions = {
    tableName: "Management Functions",
    statusMarkers: "",
    rows: [],
    columns: [
      {
        headerName: "#",
        field: "rowNum",
        editable: false,
        resizable: true,
        type: "Index",
        flex: 0.5,
      },
      {
        headerName: "ID",
        field: "id",
        editable: true,
        resizable: true,
        type: "Editor",
        flex: 1,
      },
      {
        headerName: "Management Function",
        field: "textArray",
        editable: false,
        resizable: true,
        type: "Button",
        flex: 2,
      },
    ],
  };

  let sfrElementMeta = {};
  sfrElementMeta["elementXMLID"] = element.getAttribute("id") ? element.getAttribute("id") : elementName.replaceAll(".", "-");
  sfrElementMeta["selectableGroups"] = {};

  const extCompDefTitleTag = findAllByTagName("ext-comp-def-title", element)[0];
  if (extCompDefTitleTag) {
    let extCompDefTitleTagTitle = findAllByTagName("title", extCompDefTitleTag)[0];
    extCompDefTitleTagTitle = removeSpaceBeforeClosingSelectablesAndAssignments(escapeXmlTags(getNodeContent(extCompDefTitleTagTitle)));
    sfrElementMeta["extCompDefTitle"] = extCompDefTitleTagTitle
      .replace(FILE_PARSER_REGEX.escapedGreaterThanBeforePeriod, "&gt;.")
      .replace(FILE_PARSER_REGEX.escapedGreaterThanBeforeComma, "&gt;,");
  }

  // Parse title tag
  const titleTag = findAllByTagName("title", element)[0];
  // const titleTag = findDirectChildrenByTagName("title", element)[0];

  for (const child of titleTag.childNodes) {
    if (child.nodeType === Node.COMMENT_NODE) continue;

    switch (child.nodeType) {
      case Node.ELEMENT_NODE: {
        const titleChildTag = child.localName.toLowerCase();

        if (titleChildTag === "br") {
          sfrContent.push({ text: "<br/>" });
        } else if (titleChildTag === "selectables") {
          const tabularizeNode = findDirectChildrenByTagName("tabularize", child);
          if (tabularizeNode.length !== 0) {
            const result = parseTabularize(child, selectable_id, selectableGroupCounter, component, elementName);
            selectable_id = result.selectable_id;
            selectableGroupCounter = result.selectableGroupCounter;
            Object.assign(allSelectables, result.allSelectables);
            selectableGroups = {
              ...selectableGroups,
              ...result.selectableGroups,
            };
            sfrContent.push({ tabularize: result.tabularizeEntry.uuid });
            sfrElementMeta["tabularize"] = {
              [result.tabularizeEntry.uuid]: result.tabularizeEntry,
            };
          } else {
            const result = processSelectables(child, selectable_id, selectableGroupCounter, component, elementName);
            selectable_id = result.selectable_id;
            selectableGroupCounter = result.lastGroupCounter;
            Object.assign(allSelectables, result.allSelectables);
            selectableGroups = checkNestedGroups(result.group, selectableGroups, 0, result.allSelectables);
            sfrContent.push({ selections: result.group.id });
          }
        } else if (titleChildTag === "assignable") {
          const text = sfrContent.slice(-1)[0];
          const uuid = uuidv4();
          if (text && (text.hasOwnProperty("text") || text.hasOwnProperty("description") || text.hasOwnProperty("selections"))) {
            let id = child.getAttribute("id") || `${elementName}_${++selectable_id}`;
            allSelectables[uuid] = {
              id,
              leadingText: "",
              description: removeWhitespace(child.textContent),
              trailingText: "",
              assignment: true,
              exclusive: false,
              notSelectable: false,
            };
            sfrContent.push({ assignment: uuid });
          }
        } else if (style_tags.includes(child.localName) || ["refinement", "b"].includes(child.localName)) {
          let tagName = child.localName === "refinement" ? "b" : child.localName;
          let selectableMeta = {
            selectable_id,
            selectableGroupCounter,
            allSelectables,
            selectableGroups,
            component,
            elementName,
            is_content_pushed: false,
          };
          const content = parseRichTextChildren(child, `<${tagName} ${getNodeAttributes(child)}>`, sfrContent, selectableMeta);
          selectable_id = selectableMeta.selectable_id;
          selectableGroupCounter = selectableMeta.selectableGroupCounter;
          allSelectables = selectableMeta.allSelectables;
          selectableGroups = selectableMeta.selectableGroups;

          if (selectableMeta.is_content_pushed) {
            // Selectables were pushed to sfrContent from inside this style tag. We must
            // NOT embed the closing tag(s) inside a { description } item because TipTap
            // strips orphaned closing tags when a user edits that item, permanently
            // removing the structural close and causing all subsequent content (outer
            // selectables, ext-comp-def-title, note, …) to collapse inside the unclosed
            // element on the next export.
            //
            // Instead, push closing tags as a { text } item. That item renders as a
            // plain TextField in the editor, which preserves its value and is
            // not touched by TipTap's HTML normaliser.
            if (content.length !== 0) {
              const { text: trailingText, tags: closingTags } = splitTrailingClosingTags(content, tagName);
              if (trailingText) {
                sfrContent.push({ description: trailingText });
              }
              sfrContent.push({ text: closingTags });
            } else {
              sfrContent.push({ text: `</${tagName}>` });
            }
          } else {
            const lastElement = sfrContent.slice(-1)[0];
            if (lastElement && (lastElement.hasOwnProperty("text") || lastElement.hasOwnProperty("description"))) {
              const previousText = lastElement.text ?? lastElement.description;
              sfrContent.pop();
              sfrContent.push({
                description: `${previousText}${content}</${tagName}>`,
              });
            } else {
              sfrContent.push({ description: `${content}</${tagName}>` });
            }
          }
        } else if (raw_xml_tags.includes(child.localName)) {
          sfrContent.push({
            description: ` ${escapeXmlTags(getNodeContent(child))}`,
          });
        } else if (titleChildTag === "management-function-set") {
          isManagementFunction = true;
          let managerRefs = [];
          let foundMarkers = new Set();
          let mfID = 0;
          let defaultVal = "";
          let mfsAttributes = {};
          child.attributes.forEach((attr) => {
            mfsAttributes[attr.name] = attr.value;
          });
          if (mfsAttributes.hasOwnProperty("default")) {
            defaultVal = mfsAttributes["default"];
          }
          managementFunctions.attributes = mfsAttributes;

          for (const c of child.childNodes) {
            if (c.nodeType !== Node.ELEMENT_NODE || !c.tagName) continue;

            if (c.tagName.toLowerCase() === "manager") {
              let managerAttributes = {};
              c.attributes.forEach((attr) => {
                managerAttributes[attr.name] = attr.value;
              });
              let columDef = {
                headerName: c.textContent,
                editable: true,
                resizable: true,
                type: "Editor",
                flex: 0.5,
                default: defaultVal,
              };
              if (managerAttributes.hasOwnProperty("cid")) {
                columDef["field"] = managerAttributes["cid"].toUpperCase();
                managerRefs.push(managerAttributes["cid"]);
              }
              managementFunctions.columns.push(columDef);
            } else if (c.tagName.toLowerCase() === "management-function") {
              let rowDef = {
                rowNum: "",
                id: c.id ? c.id : `mf-${++mfID}`,
                note: [],
                evaluationActivity: {
                  guidance: "",
                  guidanceDependencies: [],
                  guidanceDependencySections: [],
                  introduction: "",
                  isNoTest: false,
                  noTest: "",
                  testIntroduction: "",
                  testClosing: "",
                  testLists: {},
                  tests: {},
                  tss: "",
                  tssDependencies: [],
                  tssDependencySections: [],
                  refIds: [],
                },
                textArray: [],
              };

              c.childNodes.forEach((mfChild) => {
                if (mfChild.nodeType !== Node.ELEMENT_NODE) return;
                const nodeName = mfChild.nodeName;

                if (nodeName.toLowerCase() === "text") {
                  let selectableMeta = {
                    selectable_id,
                    selectableGroupCounter,
                    allSelectables,
                    selectableGroups,
                    component,
                    elementName,
                    is_content_pushed: false,
                  };
                  parseManagementFunction(mfChild, selectableMeta, "", rowDef);
                  selectable_id = selectableMeta.selectable_id;
                  selectableGroupCounter = selectableMeta.selectableGroupCounter;
                  allSelectables = selectableMeta.allSelectables;
                  selectableGroups = selectableMeta.selectableGroups;
                  Object.assign(sfrElementMeta["selectableGroups"], selectableGroups);
                  selectableGroups = {};
                } else if (nodeName.toLowerCase() === "app-note" || nodeName.toLowerCase() === "note") {
                  let note = parseRichTextChildren(mfChild);
                  const refIds = getRefIds(note);
                  const cleanedNote = removeAlsoTags(note);
                  rowDef.note.push({ note: cleanedNote, refIds });
                } else if (nodeName.toLowerCase() === "aactivity") {
                  mfChild.childNodes.forEach((aactivityChild) => {
                    const aactivityChildName = aactivityChild.nodeName.toLowerCase();
                    if (aactivityChildName === "tss") {
                      parseEvaluationActivitySection(aactivityChild, rowDef.evaluationActivity, "tss");
                    } else if (aactivityChildName === "guidance") {
                      parseEvaluationActivitySection(aactivityChild, rowDef.evaluationActivity, "guidance");
                    } else if (aactivityChildName === "no-tests") {
                      rowDef.evaluationActivity.noTest = parseRichTextChildren(aactivityChild).trim();
                      rowDef.evaluationActivity.isNoTest = true;
                    } else if (aactivityChildName === "tests" && aactivityChild.childNodes) {
                      parseTests(aactivityChild, rowDef.evaluationActivity);
                    } else if (aactivityChildName === "also") {
                      const refId = aactivityChild.getAttribute("ref-id");
                      if (refId && !rowDef.evaluationActivity.refIds.includes(refId)) {
                        rowDef.evaluationActivity.refIds.push(refId);
                      }
                    } else if (raw_xml_tags.includes(aactivityChildName)) {
                      rowDef.evaluationActivity.introduction = escapeXmlTags(getNodeContent(aactivityChild));
                    } else {
                      let additionalText = parseRichTextChildren(mfChild);
                      rowDef.evaluationActivity.refIds = getRefIds(additionalText);
                    }
                  });
                } else {
                  const ref = Array.from(mfChild.attributes).find(({ name }) => name === "ref");
                  if (Object.keys(statusMarkers).includes(nodeName.toUpperCase())) {
                    foundMarkers.add(nodeName.toUpperCase());
                  }
                  if (ref) {
                    const refValue = ref.value.toUpperCase();
                    const filteredValues = managerRefs.filter((r) => r.toUpperCase() === refValue);
                    if (filteredValues.length > 0) {
                      rowDef[ref.value.toUpperCase()] = nodeName === "NA" ? "-" : nodeName;
                    }
                  }
                }
              });

              managerRefs.forEach((ref) => {
                const newRef = ref.toUpperCase();
                if (!rowDef.hasOwnProperty(newRef) || rowDef[newRef] === "") {
                  rowDef[newRef] = defaultVal;
                }
              });

              managementFunctions.rows.push(rowDef);
            }
          }

          if (!hasStatusMarkers) {
            managementFunctions.statusMarkers += `${defaultVal} - ${statusMarkers[defaultVal]}<br/>`;
            foundMarkers.forEach((marker) => {
              if (marker !== defaultVal) {
                managementFunctions.statusMarkers += `${marker} - ${statusMarkers[marker]}<br/>`;
              }
            });
          }
        }
        break;
      }
      case Node.TEXT_NODE: {
        const lastElement = sfrContent.slice(-1)[0];
        const text = escapeLTSign(child.textContent);
        if (text.includes("Status Markers")) {
          hasStatusMarkers = true;
        }
        if (isManagementFunction && text.trim() === "]") break;
        if (lastElement && lastElement.hasOwnProperty("description")) {
          const previousText = lastElement["description"];
          sfrContent.pop();
          sfrContent.push({ description: `${previousText}${text}` });
        } else {
          sfrContent.push({ text });
        }
        break;
      }
      default:
        break;
    }
  }

  sfrElementMeta["title"] = sfrContent;
  sfrElementMeta["selectables"] = allSelectables;
  Object.assign(sfrElementMeta["selectableGroups"], selectableGroups);
  sfrElementMeta["isManagementFunction"] = isManagementFunction;
  sfrElementMeta["managementFunctions"] = managementFunctions;

  // App note
  const app_note = findAllByTagName("note", element);
  let note = "";
  if (app_note.length !== 0 && app_note[0].getAttribute("role")?.toLowerCase() === "application") {
    if (app_note[0].childNodes) {
      note = parseRichTextChildren(app_note[0]);
    }
  }
  sfrElementMeta["note"] = note;

  // Parse EAs
  const eActivity = findAllByTagName("aactivity", element);
  if (eActivity.length !== 0) {
    eActivity.forEach((activity) => {
      let eActivityLevel = "";
      let eA = parseEvaluationActivityNode(activity, platformMap);
      eActivityLevel = activity.getAttribute("level") ? activity.getAttribute("level").toLowerCase() : "";

      if (eActivityLevel === "element" || eActivityLevel === "") {
        evaluationActivities[sfrElemUUID] = eA;
      } else if (eActivityLevel === "component") {
        evaluationActivities[sfrCompUUID] = eA;
      }
    });
  }

  return {
    sfrElemUUID,
    sfrElementMeta,
    selectable_id,
    selectableGroupCounter,
    evaluationActivities,
  };
};

/**
 * Gets SFR family metadata from either the legacy namespaced family tag
 * (e.g. <sec:cryptsup>) or the generic section form
 * (e.g. <section id="cryptsup">).
 * @param {Node} familyNode
 * @param {Node} componentNode
 * @returns {{familyName: string, familyId: string}}
 */
function getSfrFamilyMetadata(familyNode, componentNode = null) {
  const familyName = familyNode?.getAttribute?.("title") || "";
  const localName = familyNode?.localName || "";
  const tagName = familyNode?.tagName || "";
  let familyId = "";

  if (localName === "section" || tagName === "section") {
    familyId = familyNode?.getAttribute?.("id") || "";
  } else if (tagName.includes(":")) {
    familyId = tagName.split(":").pop() || "";
  } else if (familyNode?.prefix === "sec") {
    familyId = localName;
  }

  if (!familyId) {
    const titleAcronym = familyName.match(COMMON_REGEX.parentheticalContent)?.[1] || familyName.match(COMMON_REGEX.classTitleAcronym)?.[1];
    familyId = titleAcronym || componentNode?.getAttribute?.("cc-id")?.split("_")?.[0] || "";
  }

  return {
    familyName,
    familyId,
  };
}

/**
 * Parse the Security Functional Requirements section
 * @param {Node} domNode
 * @returns {Array<Object>} Array of SFR Components
 */
export const getSFRs = (domNode, extCompDefMap, platformObject, ppType) => {
  const sfrComponents = findAllByTagName("f-component", domNode);
  let selectableGroupCounter = 0;

  // Platforms (if exists)
  const platformMap = platformObject?.platformObj?.platformMap;

  if (sfrComponents.length !== 0) {
    let sfrCompArr = new Array();
    let prevFamilyID = "";
    let familyUUID = uuidv4();

    for (let component of sfrComponents) {
      const xml_id = component.getAttribute("id") ? component.getAttribute("id") : "";

      const validSfrTypes = {
        "man-sfrs": "mandatory",
        "opt-sfrs": "optional",
        "sel-sfrs": "selectionBased",
        "obj-sfrs": "objective",
        "impl-dep-sfrs": "implementationDependent",
      };
      const sfrType = Object.keys(validSfrTypes).includes(component?.parentNode?.parentNode?.localName)
        ? validSfrTypes[component.parentNode.parentNode.localName]
        : null;

      // need to genereate UUID here as opposed to at time of component creation in sfrSection slice since component level EA needs reference
      // to UUID in order to reference it in the state
      let sfrCompUUID = uuidv4();
      let family_name = "";
      let family_id = "";
      let family_description = "";
      let familyExtCompDef = [];
      let evaluationActivities = {};
      let classDescription = "";
      // Selection dependency related
      let isSelBased = component.getAttribute("status") === "sel-based";
      if (sfrType && sfrType === "selectionBased") {
        isSelBased = true;
      }
      let selections = {
        components: [],
        elements: [],
        selections: [],
      };

      let useCaseBased = false;
      let use_cases = [];
      let dependsComments = {};
      let dependsExternalDocs = {};

      let isOptional = component.getAttribute("status") === "optional";
      if (sfrType && sfrType === "optional") {
        isOptional = true;
      }

      let isObjective = component.getAttribute("status") === "objective";
      if (sfrType && sfrType === "objective") {
        isObjective = true;
      }

      let extendedComponentDefinition = {
        audit: null,
        componentLeveling: null,
        dependencies: null,
        managementFunction: null,
        toggle: false,
      };

      const isInvisible = component.getAttribute("status") === "invisible";

      let implementationDependent = component.getAttribute("status") === "feat-based";
      if (sfrType && sfrType === "implementationDependent") {
        implementationDependent = true;
      }
      const reasons = [];

      // SFR Class description may just be text in between section header and <f-component> definition
      family_description = parseRichTextChildren(component.parentElement);

      if (family_description.length === 0) {
        // check <class-description>
        const class_description_section = findAllByTagName("class-description", component.parentElement);
        if (class_description_section.length !== 0) {
          classDescription = parseRichTextChildren(class_description_section[0]);
        }
      }

      if (component.nodeType === Node.ELEMENT_NODE && component.tagName === "f-component") {
        // Description is in template, not necessarily exists in other PPs
        let sfrDescription = findAllByTagName("description", component);
        if (sfrDescription.length !== 0) {
          sfrDescription = sfrDescription[0].textContent;
        } else {
          sfrDescription = "";
        }

        let consistencyRationale = null;
        const consistency_rationale_section = findAllByTagName("consistency-rationale", component);
        if (consistency_rationale_section.length !== 0) {
          consistencyRationale = parseRichTextChildren(consistency_rationale_section[0]);
        }

        // Extended Component Definition
        const ecd_comp_lev_section = findAllByTagName("comp-lev", component);
        if (ecd_comp_lev_section.length !== 0) {
          extendedComponentDefinition.componentLeveling = parseRichTextChildren(ecd_comp_lev_section[0]);
          extendedComponentDefinition.toggle = true;
        }
        const ecd_management_section = findAllByTagName("management", component);
        if (ecd_management_section.length !== 0) {
          extendedComponentDefinition.managementFunction = parseRichTextChildren(ecd_management_section[0]);
          extendedComponentDefinition.toggle = true;
        }
        const ecd_audit = findAllByTagName("audit", component);
        if (ecd_audit.length !== 0) {
          extendedComponentDefinition.audit = getNodeContentWithTags(ecd_audit[0]);
          extendedComponentDefinition.toggle = true;
        }
        const ecd_dependencies = findAllByTagName("dependencies", component);
        if (ecd_dependencies.length !== 0) {
          extendedComponentDefinition.dependencies = parseRichTextChildren(ecd_dependencies[0]);
          extendedComponentDefinition.toggle = true;
        }

        // Get selection enabling id
        if (isSelBased || implementationDependent) {
          // Find all dependencies (attributes in xml are totally inconsistent)
          const dependsAttributes = [
            "on",
            "and",
            "on-se1",
            "on1",
            "on2",
            "on3",
            "on4",
            "on5",
            "on-sel",
            "also",
            "on-incl",
            "on-use",
            "on-uc",
            "on-fcomp",
            "req",
            "ids",
            "or",
          ];
          let depends = findAllByTagName("depends", component);

          if (depends.length !== 0) {
            depends.forEach((depend) => {
              const trailingComment = getTrailingDependsComment(depend);
              const externalDoc = getExternalDocRef(depend);

              dependsAttributes.forEach((attributeName) => {
                if (depend.getAttribute(attributeName) !== null) {
                  if (isSelBased) {
                    if (["on-use", "on-uc"].includes(attributeName.toLowerCase())) {
                      // Check if use case dependent
                      const useCaseId = depend.getAttribute(attributeName);
                      useCaseBased = true;
                      use_cases.push(useCaseId);
                      if (trailingComment.length > 0) {
                        dependsComments[`useCase:${useCaseId}`] = trailingComment;
                      }
                      if (externalDoc) {
                        dependsExternalDocs[`useCase:${useCaseId}`] = externalDoc;
                      }
                    } else if (attributeName.toLowerCase().includes("on-incl") || attributeName.toLowerCase().includes("on-fcomp")) {
                      // Check if component dependent
                      const componentId = depend.getAttribute(attributeName);
                      selections.components.push(componentId);
                      if (trailingComment.length > 0) {
                        dependsComments[`component:${componentId}`] = trailingComment;
                      }
                      if (externalDoc) {
                        dependsExternalDocs[`component:${componentId}`] = externalDoc;
                      }
                    } else {
                      const id = depend.getAttribute(attributeName);
                      selections.selections.push(id);
                      if (trailingComment.length > 0) {
                        dependsComments[`selection:${id}`] = trailingComment;
                      }
                      if (externalDoc) {
                        dependsExternalDocs[`selection:${id}`] = externalDoc;
                      }

                      // Get element ID from parent node
                      let parent = getSelDepParents(domNode, id);
                      selections.elements.push(parent.fElementId);
                    }
                  } else if (implementationDependent) {
                    const id = depend.getAttribute(attributeName);
                    reasons.push(id);
                    if (trailingComment.length > 0) {
                      dependsComments[`reason:${id}`] = trailingComment;
                    }
                    if (externalDoc) {
                      dependsExternalDocs[`reason:${id}`] = externalDoc;
                    }
                  }
                }
              });

              // Check if depends has additional component type
              if (depend.childNodes) {
                depend.childNodes.forEach((child) => {
                  if (child.nodeType !== Node.ELEMENT_NODE) {
                    return;
                  }

                  if (child.tagName.toLowerCase() === "optional") {
                    isOptional = true;
                    if (trailingComment.length > 0) {
                      dependsComments["child:optional"] = trailingComment;
                    }
                  }
                  if (child.tagName.toLowerCase() === "objective") {
                    isObjective = true;
                    if (trailingComment.length > 0) {
                      dependsComments["child:objective"] = trailingComment;
                    }
                  }
                });
              }
            });
          }
        }

        // Get family information (normally parent to the f-component).
        ({ familyName: family_name, familyId: family_id } = getSfrFamilyMetadata(component.parentElement, component));

        // Add family extended component definition if the family id exists
        if (family_id) {
          if (ppType === "Module") {
            familyExtCompDef = extCompDefMap.has(`${family_id}-${sfrType}`) ? extCompDefMap.get(`${family_id}-${sfrType}`) : [];
          } else {
            familyExtCompDef = extCompDefMap.has(family_id) ? extCompDefMap.get(family_id) : [];
          }
        }

        if (family_id != prevFamilyID) {
          familyUUID = uuidv4();
        }

        prevFamilyID = family_id;

        const sfrElements = findAllByTagName("f-element", component);
        let allSFRElements = {}; // contains multiple sfrElement's

        // Get Iteration data
        let iteration_id = component.getAttribute("iteration");
        if (iteration_id) {
          iteration_id = `_${component.getAttribute("iteration")}`;
        } else {
          iteration_id = "";
        }

        let elem_counter = 0;
        for (const element of sfrElements) {
          const elementName = `${component.getAttribute("cc-id")}.${++elem_counter}${iteration_id}`;

          const result = parseFElement(
            element,
            component,
            elementName,
            0, // selectable_id resets per element
            selectableGroupCounter,
            evaluationActivities,
            sfrCompUUID,
            platformMap
          );

          selectableGroupCounter = result.selectableGroupCounter;
          evaluationActivities = result.evaluationActivities;
          allSFRElements[result.sfrElemUUID] = result.sfrElementMeta;
        }

        // Get Audit events (if applicable)
        let audit = {};
        const auditSections = findAllByTagName("audit-event", component);

        if (auditSections.length !== 0) {
          for (const auditSection of auditSections) {
            const auditUUID = uuidv4();
            let auditMeta = {};
            let auditOptional = false;
            let audit_items = [];

            if (
              auditSection.getAttribute("type") &&
              (auditSection.getAttribute("type").toLowerCase() === "optional" || auditSection.getAttribute("table").toLowerCase() === "optional")
            ) {
              auditOptional = true;
            }

            // Audit description
            let audit_description = findAllByTagName("audit-event-descr", auditSection);
            if (audit_description.length !== 0) {
              let base_description = ""; // audit must have at least 1 description

              audit_description.forEach((description) => {
                const hasSelectableDescription = Array.from(description.childNodes).some(
                  (child) => child.nodeType === Node.ELEMENT_NODE && child.localName.toLowerCase() === "selectables"
                );

                if (!hasSelectableDescription) {
                  const descriptionContent = parseRichTextChildren(description).trim();
                  if (descriptionContent !== "") {
                    auditMeta["description"] = descriptionContent;
                  }
                  return;
                }

                description.childNodes.forEach((child) => {
                  // If audit event description is a selection
                  if (child.tagName === "selectables") {
                    // Optional = selection
                    auditOptional = true;

                    if (base_description.length !== 0) {
                      audit_items.push({ description: child.textContent });
                    } else {
                      // Want direct child, as textContent will concatenate other selectable if it exists (None/No other)
                      base_description = getDirectTextContent(child.childNodes[0]);
                      auditMeta["description"] = base_description;
                    }
                  }

                  // If audit event description is text
                  if (child.nodeType === Node.TEXT_NODE) {
                    const text = removeWhitespace(escapeLTSign(child.textContent));
                    if (base_description.length !== 0) {
                      audit_items.push({ description: text });
                    } else {
                      auditMeta["description"] = text;
                    }
                  }
                });
              });
            }

            // Audit information
            const audit_info = findAllByTagName("audit-event-info", auditSection);
            if (audit_info.length !== 0) {
              audit_info.forEach((info) => {
                const childNodes = Array.from(info.childNodes);
                const elementChildren = childNodes.filter((child) => child.nodeType === Node.ELEMENT_NODE);
                const nonWhitespaceTextChildren = childNodes.filter((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== "");
                const selectableChildren = elementChildren.filter((child) => child.localName?.toLowerCase() === "selectables");
                const isSimpleSelectableInfo = selectableChildren.length === 1 && elementChildren.length === 1 && nonWhitespaceTextChildren.length === 0;

                if (isSimpleSelectableInfo) {
                  const firstSelectable = Array.from(selectableChildren[0].childNodes).find(
                    (child) => child.nodeType === Node.ELEMENT_NODE && child.localName?.toLowerCase() === "selectable"
                  );

                  if (!firstSelectable) {
                    return;
                  }

                  audit_items.push({
                    info: getDirectTextContent(firstSelectable),
                    optional: true,
                  });
                } else {
                  const infoContent = parseRichTextChildren(info).trim();

                  if (infoContent !== "") {
                    audit_items.push({
                      info: infoContent,
                      optional: info.getAttribute("type")?.toLowerCase() === "optional",
                    });
                  }
                }
              });
            }

            auditMeta["items"] = audit_items;
            auditMeta["optional"] = auditOptional;
            audit[auditUUID] = auditMeta;
          }
        } // End of audit sections parsing

        sfrCompArr.push({
          sfrCompUUID: sfrCompUUID,
          title: component.getAttribute("name"),
          cc_id: component.getAttribute("cc-id").toUpperCase(),
          iteration_id: component.getAttribute("iteration"),
          xml_id: xml_id, // this is id in the f-component
          definition: sfrDescription,
          familyDescription: family_description,
          familyExtCompDef: familyExtCompDef,
          optional: isOptional,
          objective: isObjective,
          dependsComments,
          dependsExternalDocs,
          selectionBased: isSelBased,
          family_name: family_name ? family_name : "",
          family_id: family_id ? family_id : "",
          familyUUID,
          elements: allSFRElements,
          evaluationActivities: evaluationActivities,
          auditEvents: audit,
          selections: selections,
          extendedComponentDefinition: extendedComponentDefinition,
          consistencyRationale,
          tableOpen: false,
          implementationDependent: implementationDependent,
          useCaseBased: useCaseBased,
          useCases: use_cases,
          invisible: isInvisible,
          reasons: reasons,
          sfrType: sfrType,
          notNew: component.getAttribute("notnew"),
          classDescription,
        });
      }
    }
    return sfrCompArr;
  }
};

/**
 * Removes space before closing selectable or assignable tag
 * @param htmlEscapedString
 * @returns {string}
 */
function removeSpaceBeforeClosingSelectablesAndAssignments(htmlEscapedString) {
  if (typeof htmlEscapedString !== "string") return htmlEscapedString;
  return htmlEscapedString.replace(FILE_PARSER_REGEX.escapedClosingSelectableOrAssignable, "");
}

/**
 * Gets the section extended component definition map
 * @param domNode
 * @param ppType
 * @returns {Map<any, any>}
 */
export const getSectionExtendedComponentDefinitionMap = (domNode, ppType) => {
  const extCompDef = findAllByTagName("ext-comp-def", domNode);
  let extCompDefMap = new Map();
  let sfrType = "";

  const validSfrTypes = {
    "man-sfrs": "mandatory",
    "opt-sfrs": "optional",
    "sel-sfrs": "selectionBased",
    "obj-sfrs": "objective",
    "impl-dep-sfrs": "implementationDependent",
  };

  try {
    // Create the extended component definition map
    if (extCompDef.length !== 0) {
      extCompDef.forEach((def) => {
        // Find family_id
        const { familyId: family_id } = getSfrFamilyMetadata(def.parentElement);

        // Get extended component definition
        if (family_id) {
          const title = def.getAttribute("title") ? def.getAttribute("title") : "";
          const fam_id = def.getAttribute("fam-id") ? def.getAttribute("fam-id") : "";

          if (ppType === "Module") {
            const parentSectionName = def.parentElement.parentElement?.localName || def.parentElement.parentElement?.tagName;
            sfrType = validSfrTypes[parentSectionName];
          }

          const familyKey = ppType === "Module" ? `${family_id}-${sfrType}` : family_id;

          // Create extended component definition object
          const extCompDef = {
            famId: fam_id,
            title: title,
            ...parseExtendedComponentDefinitionNode(def),
          };

          // Create new key value pair
          if (!extCompDefMap.has(familyKey)) {
            extCompDefMap.set(familyKey, []);
          }

          // Add extended component definition to key
          if (!extCompDefMap.get(familyKey).includes(extCompDef)) {
            extCompDefMap.get(familyKey).push(extCompDef);
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
  }

  // Return the map
  return extCompDefMap;
};

/**
 * Recursively parses the content of a `<management-function>` node,
 * converting text, inline styles, and special tags (e.g. `<selectables>`, `<assignable>`)
 * into a structured `textArray` entry for a  given `rowDef` object.
 * @param {Node} parent
 * @param {{
 *   selectable_id: number,
 *   selectableGroupCounter: number,
 *   allSelectables: Map<string, any>,
 *   selectableGroups: Map<string, any>,
 *   component: Node,
 *   elementName: string,
 *   is_content_pushed?: boolean
 * }} selectableMeta - Metadata object to track selectables and their groups across recursion
 * @param {string} [contents=""] - String builder for accumulating content during recursion
 * @param {Object} rowDef - The current row object in the management function table
 * @returns {string}
 */
function parseManagementFunction(parent, selectableMeta, contents = "", rowDef = {}) {
  parent.childNodes.forEach((c) => {
    if (c.nodeType === Node.TEXT_NODE) {
      contents += removeWhitespace(escapeLTSign(c.textContent));
    } else if (c.nodeType === Node.ELEMENT_NODE) {
      if (c.localName.toLowerCase() === "refinement") {
        // TODO: Need to figure out how to convert these tags back to refinement on export
        const innerContent = parseManagementFunction(c, selectableMeta, `${contents}<b${getNodeAttributes(c)}>`, rowDef);
        let fullTagContent = `${innerContent}</b>`;

        contents = fullTagContent;
      } else if (c.localName.toLowerCase() === "a") {
        contents += getLinkContent(c);
      } else if (raw_xml_tags.includes(c.localName.toLowerCase())) {
        // previously we were omitting the snip tag, but now we will pull in raw xml
        contents += escapeXmlTags(getNodeContent(c));
      } else if (c.localName.toLowerCase() === "br") {
        contents += "<br/>";
      } else if (style_tags.includes(c.localName.toLowerCase())) {
        // Hacky way to preseve rich text nodes that have selectables/assignables as children
        const innerContent = parseManagementFunction(c, selectableMeta, `${contents}<${c.localName}${getNodeAttributes(c)}>`, rowDef);
        let fullTagContent = `${innerContent}</${c.localName}>`;

        // Include a space if the last character isn't whitespace and next node is inline;
        // this is for sibling tags that are both rich text
        const nextElement = c.nextSibling;
        const needsTrailingSpace =
          fullTagContent &&
          !FILE_PARSER_REGEX.trailingWhitespace.test(fullTagContent) && // checks whether the string does not end in whitespace
          nextElement &&
          nextElement.nodeType === Node.ELEMENT_NODE &&
          style_tags.concat(raw_xml_tags).includes(nextElement.localName?.toLowerCase());

        if (needsTrailingSpace) {
          fullTagContent += " ";
        }

        contents = fullTagContent;
      } else if (c.tagName === "selectables") {
        const result = processSelectables(
          c,
          selectableMeta.selectable_id,
          selectableMeta.selectableGroupCounter,
          selectableMeta.component,
          selectableMeta.elementName
        );
        selectableMeta.selectable_id = result.selectable_id;
        selectableMeta.selectableGroupCounter = result.lastGroupCounter;

        // Add all the selectables to masterlist; using Object.assign to prevent/preserve existing data
        Object.assign(selectableMeta.allSelectables, result.allSelectables);

        // Create the groups
        selectableMeta.selectableGroups = checkNestedGroups(result.group, selectableMeta.selectableGroups, 0, result.allSelectables);

        rowDef.textArray.push({ selections: result.group.id });
      } else if (c.tagName === "assignable") {
        // standalone assignables
        const uuid = uuidv4();

        let id = c.getAttribute("id");
        if (id === null) {
          id = `${selectableMeta.elementName}_${++selectableMeta.selectable_id}`;
        }

        selectableMeta.allSelectables[uuid] = {
          id: id,
          leadingText: "",
          description: removeWhitespace(c.textContent),
          trailingText: "",
          assignment: true,
          exclusive: false,
          notSelectable: false,
        };
        rowDef.textArray.push({ assignment: uuid });
      } else if (c.localName.toLowerCase() === "div") {
        contents = parseManagementFunction(c, selectableMeta, contents, rowDef);
      }
    }

    // Add the text (in case there are selectables that come after)
    if (contents.length !== 0) {
      // Check if previous entry in the row is also a description, if so, append. Also for selectables, if there is text, it needs to be pushed before the selectables
      const lastElement = rowDef.textArray.slice(-1)[0];
      if (lastElement && lastElement.hasOwnProperty("description")) {
        // Remove previous entry and concat with current text
        rowDef.textArray.pop();
        rowDef.textArray.push({ description: `${lastElement["description"]}  ${contents}` });
      } else {
        rowDef.textArray.push({ description: contents });
      }

      contents = ""; // clear the buffer
    }
  });

  return contents;
}

/**
 * Retain styling for child elements of a node (non-selectable node -> selectable nodes have their own processing in processSelectables)
 * @param {*} parent XML node we are interested in flattening out
 * @param {*} contents String builder for accumulating content during recursion
 * @param {*} sfrContent Array of the elements that the SFR requirement consists of
 * @param {*} selectableMeta Metadata object to track selectables and their groups across recursion
 * @returns {string}
 */
function parseRichTextChildren(parent, contents = "", sfrContent = [], selectableMeta = {}) {
  // Reset flag so that when function is returned, text content can be pushed if it comes at the end of a selctable (which triggers is_content_pushed=true)
  selectableMeta.is_content_pushed = false;

  parent.childNodes.forEach((c) => {
    if (c.nodeType === Node.TEXT_NODE) {
      // Escape '<' signs, and pad with surrounding whitespace so that it is not converted to < on export, as transforms will complain since it appears like an unclosed tag
      contents += escapeLTSign(c.textContent);
    } else if (c.nodeType === Node.ELEMENT_NODE) {
      if (c.localName.toLowerCase() === "refinement") {
        // TODO: Need to figure out how to convert these tags back to refinement on export
        const innerContent = parseRichTextChildren(c, `${contents}<b${getNodeAttributes(c)}>`, sfrContent, selectableMeta);
        let fullTagContent = `${innerContent}</b>`;

        contents = fullTagContent;
      } else if (c.localName.toLowerCase() === "a") {
        contents += getLinkContent(c);
      } else if (raw_xml_tags.includes(c.localName.toLowerCase())) {
        // previously we were omitting the snip tag, but now we will pull in raw xml
        contents += escapeXmlTags(getNodeContent(c));
      } else if (c.localName.toLowerCase() === "br") {
        contents += "<br/>";
      } else if (style_tags.includes(c.localName.toLowerCase()) || c.localName.toLowerCase() === "tr" || c.localName.toLowerCase() === "td") {
        // Hacky way to preseve rich text nodes that have selectables/assignables as children
        const innerContent = parseRichTextChildren(c, `${contents}<${c.localName}${getNodeAttributes(c)}>`, sfrContent, selectableMeta);
        let fullTagContent = `${innerContent}</${c.localName}>`;

        // Include a space if the last character isn't whitespace and next node is inline;
        // this is for sibling tags that are both rich text
        const nextElement = c.nextSibling;
        const needsTrailingSpace =
          fullTagContent &&
          !FILE_PARSER_REGEX.trailingWhitespace.test(fullTagContent) && // checks whether the string does not end in whitespace
          nextElement &&
          nextElement.nodeType === Node.ELEMENT_NODE &&
          style_tags.concat(raw_xml_tags).includes(nextElement.localName?.toLowerCase());

        if (needsTrailingSpace) {
          fullTagContent += " ";
        }

        contents = fullTagContent;
      } else if (c.localName.toLowerCase() === "div") {
        if (!hasAncestorTag(c, "tests")) {
          // pull in raw xml for div taqg (normally has been seen to be platform dependencies in other sections - outside of Tests)
          contents += ` ${escapeXmlTags(getNodeContent(c))} `;
        } else {
          // platform tests are handled in the parseTests
          // treat this as normal text
          if (!hasDescendantTag(c, "depends")) {
            contents += `<div${getNodeAttributes(c)}>`;
            contents = parseRichTextChildren(c, contents, sfrContent, selectableMeta);
            contents += "</div>";
          }
        }
      } else if (c.tagName.toLowerCase() === "selectables") {
        // these are nested selectables
        const lastElement = sfrContent.slice(-1)[0];

        // Check if previous content is text, append if so (for selectables, text needs to be pushed before the selectables)
        if (lastElement && (lastElement.hasOwnProperty("text") || lastElement.hasOwnProperty("description"))) {
          let previousText = "";

          if (lastElement.hasOwnProperty("text")) {
            previousText = lastElement["text"];
          } else if (lastElement.hasOwnProperty("description")) {
            previousText = lastElement["description"];
          }

          sfrContent.pop(); // remove entry
          sfrContent.push({ description: `${previousText}${contents}` });
        } else {
          sfrContent.push({ description: contents });
        }

        // Reset the contents buffer so that text doesn't repeat on next iteration
        contents = "";

        const result = processSelectables(
          c,
          selectableMeta.selectable_id,
          selectableMeta.selectableGroupCounter,
          selectableMeta.component,
          selectableMeta.elementName
        );
        selectableMeta.selectable_id = result.selectable_id;
        selectableMeta.selectableGroupCounter = result.lastGroupCounter;

        // Add all the selectables to masterlist; using Object.assign to prevent/preserve existing data
        Object.assign(selectableMeta.allSelectables, result.allSelectables);

        // Create the groups
        selectableMeta.selectableGroups = checkNestedGroups(result.group, selectableMeta.selectableGroups, 0, result.allSelectables);

        sfrContent.push({ selections: result.group.id });

        selectableMeta.is_content_pushed = true;
      } else if (c.tagName.toLowerCase() === "assignable") {
        const lastElement = sfrContent.slice(-1)[0];
        const uuid = uuidv4();

        let id = c.getAttribute("id");
        if (id === null) {
          id = `${selectableMeta.elementName}_${++selectableMeta.selectable_id}`;
        }

        selectableMeta.allSelectables[uuid] = {
          id: id,
          leadingText: "",
          description: removeWhitespace(c.textContent),
          trailingText: "",
          assignment: true,
          exclusive: false,
          notSelectable: false,
        };

        // Append any previous text before adding the assignment
        if (lastElement && (lastElement.hasOwnProperty("text") || lastElement.hasOwnProperty("description"))) {
          let previousText = "";

          if (lastElement.hasOwnProperty("text")) {
            previousText = lastElement["text"];
          } else if (lastElement.hasOwnProperty("description")) {
            previousText = lastElement["description"];
          }

          sfrContent.pop(); // remove entry

          let descriptionString = previousText;

          if (contents) {
            descriptionString += `${(previousText.trim().endsWith("[") ? "" : " ") + removeWhitespace(contents)}`;
          }

          sfrContent.push({ description: descriptionString });
        } else {
          sfrContent.push({ description: removeWhitespace(contents) });
        }

        // Reset the contents buffer so that text doesn't repeat on next iteration
        contents = "";

        // Add the assignment
        sfrContent.push({ assignment: uuid });
      } else if (c.localName.toLowerCase() === "center") {
        contents += `<${c.tagName}${getNodeAttributes(c)}>`;
        contents = parseRichTextChildren(c, contents, sfrContent, selectableMeta);
        contents += `</${c.tagName}>`;
      }
    }
  });

  return contents;
}

/**
 * Checks for tagname as a child (even nested)
 * @param {Node} node
 * @param {string} tagName
 * @returns {boolean}
 */
function hasDescendantTag(node, tagName) {
  tagName = tagName.toLowerCase();

  for (let child of node.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (child.localName.toLowerCase() === tagName) return true;

      // check the child's children
      if (hasDescendantTag(child, tagName)) return true;
    }
  }
  return false;
}

/**
 * Checks for certain tagname upwards in the parent hierarchy
 * @param {Node} node
 * @param {string} tagName
 * @returns {boolean}
 */
function hasAncestorTag(node, tagName) {
  let current = node.parentNode;
  tagName = tagName.toLowerCase();

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() === tagName) return true;
    current = current.parentNode;
  }
  return false;
}

/**
 * Parses <Tests> section and populates testLists and tests
 * @param {Node} testsNode
 * @param {{
 *   testLists: Object.<string, { parentTestUUID: string | null, description: string, testUUIDs: string[] }>,
 *   tests: Object.<string, { testListUUID: string, objective: string, dependencies: string[] }>,
 *   platformMap: Object.<string, string>,
 *   testIntroduction: string,
 *   testClosing: string
 * }} eA
 * @returns {void}
 */
function parseTests(testsNode, eA) {
  const testIntro = [];
  const testClosing = [];
  let blockState = "intro"; // "intro" | "list" | "closing"

  const rawChildren = Array.from(testsNode.childNodes);
  // if <Tests> contains a wrapping p tag, remove it and work with it's children only
  const testSectionChildren = rawChildren.flatMap((n) => {
    if (n.nodeType === Node.ELEMENT_NODE && n.localName?.toLowerCase() === "p") {
      return Array.from(n.childNodes);
    }
    return [n];
  });
  const hasMoreTestContent = (startIndex) => {
    for (let i = startIndex + 1; i < testSectionChildren.length; i++) {
      const node = testSectionChildren[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.localName.toLowerCase();
        if (tag === "testlist" || tag === "div") return true;
      }
    }
    return false;
  };

  for (let i = 0; i < testSectionChildren.length; i++) {
    const node = testSectionChildren[i];
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.localName.toLowerCase();

      if (tag === "testlist") {
        blockState = "list";
        parseTestList(eA, node);
      } else if (tag === "div") {
        blockState = "list";
        const divDependencies = [];
        const divDepends = [];
        const divTestListUUIDs = [];
        let divDescription = "";
        let hasNestedTestList = false;

        node.childNodes.forEach((divChild) => {
          if (divChild.nodeType === Node.ELEMENT_NODE) {
            const divChildTag = divChild.tagName.toLowerCase();

            if (divChildTag === "depends") {
              const dependsAttributes = getDependsAttributes(divChild);
              if (Object.keys(dependsAttributes).length > 0) {
                divDepends.push(dependsAttributes);
              }
              appendUniqueDependency(divDependencies, getDependsValue(divChild, eA.platformMap));
            } else if (divChildTag === "testlist") {
              hasNestedTestList = true;
              const testListUUID = parseTestList(eA, divChild);
              divTestListUUIDs.push(testListUUID);
            } else {
              divDescription += raw_xml_tags.includes(divChild.localName)
                ? ` ${escapeXmlTags(getNodeContent(divChild))} `
                : ` <${divChild.localName}${getNodeAttributes(divChild)}>${parseRichTextChildren(divChild)}</${divChild.localName}> `;
            }
          } else if (divChild.nodeType === Node.TEXT_NODE) {
            divDescription += escapeLTSign(divChild.textContent);
          }
        });

        divTestListUUIDs.forEach((testListUUID) => {
          const testList = eA.testLists[testListUUID];
          testList.wrapperTag = node.tagName.toLowerCase();
          testList.depends = divDepends;
          testList.dependencies = divDependencies;
          testList.description = `${divDescription}${testList.description || ""}`;
        });

        if (!hasNestedTestList) {
          const divTestListUUID = uuidv4();
          eA.testLists[divTestListUUID] = {
            parentTestUUID: null,
            description: "",
            dependencies: [],
            testUUIDs: [],
          };

          const testUUID = uuidv4();
          const test = {
            testListUUID: divTestListUUID,
            objective: parseRichTextChildren(node),
            dependencies: divDependencies,
            conclusion: "",
          };

          eA.tests[testUUID] = test;
          eA.testLists[divTestListUUID].testUUIDs.push(testUUID);
        }
      } else {
        let textContent = ` <${node.localName}${getNodeAttributes(node)}>${parseRichTextChildren(node)}</${node.localName}>`;

        if (raw_xml_tags.includes(node.localName)) {
          textContent = ` ${escapeXmlTags(getNodeContent(node))} `; // pull in raw xml
        }

        if (blockState === "intro") {
          testIntro.push(textContent);
        } else if (blockState === "list") {
          if (hasMoreTestContent(i)) {
            testIntro.push(textContent);
          } else {
            blockState = "closing";
            testClosing.push(textContent);
          }
        } else if (blockState === "closing") {
          testClosing.push(textContent);
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      // not calling removeWhitespace on here b/c it messes up co-mingled styled + normal text
      // eg. in MDM, FCS_CKM.1/AKG, has <h:i>p</h:i> and <h:i>q</h:i>, but removing whitespace
      // puts no space before the and: <h:i>p</h:i>and <h:i>q</h:i>
      const text = escapeLTSign(node.textContent);

      if (text) {
        if (blockState === "intro") {
          testIntro.push(text);
        } else if (blockState === "list") {
          if (hasMoreTestContent(i)) {
            testIntro.push(text);
          } else {
            blockState = "closing";
            testClosing.push(text);
          }
        } else if (blockState === "closing") {
          testClosing.push(text);
        }
      }
    }
  }

  eA.testIntroduction = testIntro.join("").replace(FILE_PARSER_REGEX.brOpenClose, "<br/>");
  eA.testClosing = testClosing.join("").replace(FILE_PARSER_REGEX.brOpenClose, "<br/>");
}

/**
 * Recursive function to parse through a <testlist>
 * @param {{
 *   testLists: Object.<string, { parentTestUUID: string | null, description: string, testUUIDs: string[] }>,
 *   tests: Object.<string, { testListUUID: string, objective: string, dependencies: string[] }>,
 *   platformMap: Object.<string, string>,
 *   testIntroduction: string,
 *   testClosing: string
 * }} eA
 * @param {Node} testListFromNode
 * @param {string|null} [parentTestUUID]
 * @returns {string}
 */
function parseTestList(eA, testListFromNode, parentTestUUID = null) {
  const testListUUID = uuidv4();

  const testListForState = {
    parentTestUUID: parentTestUUID ? parentTestUUID : null,
    description: "",
    dependencies: [],
    depends: [],
    testUUIDs: [],
    conclusion: "",
  };

  eA.testLists[testListUUID] = testListForState;

  const children = Array.from(testListFromNode.childNodes);
  let testListState = "main"; // "main" | "closing"

  children.forEach((child, idx) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();

      // disregard <br/> (including namespaced <h:br/>) that immediately follows a closing </test>, these will be added on export
      if (tag === "br" || tag === "h:br") {
        let prevElem = null;
        for (let j = idx - 1; j >= 0; j--) {
          const prevNode = children[j];
          if (prevNode && prevNode.nodeType === Node.ELEMENT_NODE) {
            prevElem = prevNode;
            break;
          }
        }
        if (prevElem && prevElem.tagName && prevElem.tagName.toLowerCase() === "test") {
          return; // skip line breaks that immediately follow a test element
        }
      }
      if (tag === "test") {
        testListState = "main";

        const testUUID = uuidv4();
        const test = {
          testListUUID: testListUUID,
          id: child.getAttribute("id") || "",
          objective: "",
          dependencies: [],
          nestedTestListUUIDs: [],
          conclusion: "",
        };

        const testChildren = Array.from(child.childNodes);

        // Find the last "control" node (testlist/depends) to use as the split point
        const lastControlIdxCandidates = testChildren
          .map((n, i) => (n.nodeType === Node.ELEMENT_NODE && ["testlist", "depends"].includes(n.tagName.toLowerCase()) ? i : -1))
          .filter((i) => i !== -1);

        // If none found, keep marker as -1 (all text will be intro/there is no conclusion text)
        const lastControlIdx = lastControlIdxCandidates.length > 0 ? Math.max(...lastControlIdxCandidates) : -1;

        testChildren.forEach((grandchild, grandchildIdx) => {
          if (grandchild.nodeType === Node.ELEMENT_NODE) {
            const gTag = grandchild.tagName.toLowerCase();

            // disregard a trailing break that appears immediately before </test>, the transform doesnt add a line break for these
            if (gTag === "br" || gTag === "h:br" || (grandchild.localName && grandchild.localName.toLowerCase() === "br")) {
              const trailingOnlyWhitespace = testChildren.slice(grandchildIdx + 1).every((n) => {
                if (n.nodeType === Node.ELEMENT_NODE) return false; // some element follows → not trailing
                if (n.nodeType === Node.TEXT_NODE) {
                  return removeWhitespace(escapeLTSign(n.textContent)) === ""; // allow whitespace-only text
                }
                return true; // comments and others are fine
              });

              if (trailingOnlyWhitespace) {
                return; // skip trailing <br/> inside <test>…</test>
              }
            }
            if (gTag === "testlist") {
              const nestedUUID = parseTestList(eA, grandchild, testUUID);
              test.nestedTestListUUIDs = nestedUUID ? [nestedUUID] : [];
            } else if (gTag === "depends") {
              appendUniqueDependency(test.dependencies, getDependsValue(grandchild, eA.platformMap));
            } else if (gTag === "steplist") {
              test.objective += ` ${escapeXmlTags(getNodeContent(grandchild))} `;
            } else {
              const richText = raw_xml_tags.includes(grandchild.localName)
                ? ` ${escapeXmlTags(getNodeContent(grandchild))} `
                : ` <${grandchild.localName}${getNodeAttributes(grandchild)}>${parseRichTextChildren(grandchild)}</${grandchild.localName}> `;

              // Rich text content: decide whether it goes to objective or conclusion
              // If we've haven't passed the last control node, it is not conclusion text
              if (lastControlIdx === -1 || grandchildIdx <= lastControlIdx) {
                test.objective += richText;
              } else {
                test.conclusion += richText;
              }
            }
          } else if (grandchild.nodeType === Node.TEXT_NODE) {
            const text = removeWhitespace(escapeLTSign(grandchild.textContent));
            if (lastControlIdx === -1 || grandchildIdx <= lastControlIdx) {
              test.objective += text;
            } else {
              test.conclusion += text;
            }
          }
        });

        // Replace any open and close br tag variations with <br/>
        test.objective = test.objective.replace(FILE_PARSER_REGEX.normalizedBrTag, "<br/>");

        eA.tests[testUUID] = test;
        testListForState.testUUIDs.push(testUUID);
      } else if (tag === "depends") {
        const dependsAttributes = getDependsAttributes(child);
        if (Object.keys(dependsAttributes).length > 0) {
          testListForState.depends.push(dependsAttributes);
        }
        appendUniqueDependency(testListForState.dependencies, getDependsValue(child, eA.platformMap));
      } else {
        const richText = raw_xml_tags.includes(child.localName)
          ? ` ${escapeXmlTags(getNodeContent(child))} `
          : ` <${child.localName}${getNodeAttributes(child)}>${parseRichTextChildren(child)}</${child.localName}> `;

        const hasRemainingTests = children.slice(idx + 1).some((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName.toLowerCase() === "test");

        if (testListState === "main" && !hasRemainingTests) {
          testListState = "closing";
        }

        if (testListState === "main") {
          testListForState.description += richText;
        } else {
          testListForState.conclusion += richText;
        }
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = removeWhitespace(escapeLTSign(child.textContent));

      const hasRemainingTests = children.slice(idx + 1).some((n) => n.nodeType === Node.ELEMENT_NODE && n.tagName.toLowerCase() === "test");

      if (testListState === "main" && !hasRemainingTests) {
        testListState = "closing";
      }

      if (testListState === "main" && idx === 0) {
        testListForState.description += text;
      } else if (testListState === "closing") {
        testListForState.conclusion += text;
      } else {
        testListForState.description += text;
      }
    }
  });

  return testListUUID;
}

const stripFormattingFromDescriptionItems = (descriptionItems, selectableGroups, selectables, field, shouldStrip = false) => {
  if (!Array.isArray(descriptionItems) || descriptionItems.length === 0) return false;

  return descriptionItems.every((item) => {
    if (item.text || item.description) {
      const key = item.text ? "text" : "description";
      const content = item[key];

      if (!hasSelectionFormattingField(content, field)) return false;

      if (shouldStrip) {
        item[key] = stripSelectionFormattingField(content, field).content;
      }

      return true;
    }

    if (Array.isArray(item.groups) && item.groups.length > 0) {
      const hasFormattedGroups = item.groups.every((groupKey) => hasFormattingForSelectionReference(groupKey, selectableGroups, selectables, field));

      if (hasFormattedGroups && shouldStrip) {
        item.groups.forEach((groupKey) => stripFormattingFromSelectionReference(groupKey, selectableGroups, selectables, field));
      }

      return hasFormattedGroups;
    }

    return false;
  });
};

const hasFormattingForSelectionReference = (selectionKey, selectableGroups, selectables, field) => {
  if (selectables[selectionKey]) {
    return hasSelectionFormattingField(selectables[selectionKey].description, field);
  }

  const group = selectableGroups[selectionKey];
  if (!group) return false;

  if (group[field]) return true;

  if (Array.isArray(group.description)) {
    return stripFormattingFromDescriptionItems(group.description, selectableGroups, selectables, field);
  }

  return false;
};

const stripFormattingFromSelectionReference = (selectionKey, selectableGroups, selectables, field) => {
  if (selectables[selectionKey]) {
    selectables[selectionKey].description = stripSelectionFormattingField(selectables[selectionKey].description, field).content;
    return;
  }

  const group = selectableGroups[selectionKey];
  if (!group) return;

  if (group[field]) {
    group[field] = false;
    return;
  }

  if (Array.isArray(group.description)) {
    stripFormattingFromDescriptionItems(group.description, selectableGroups, selectables, field, true);
  }
};

const normalizeSelectableGroupFormatting = (groupKey, selectableGroups, selectables) => {
  const group = selectableGroups[groupKey];
  if (!group) return;

  if (Array.isArray(group.groups) && group.groups.length > 0) {
    group.groups.forEach((selectionKey) => {
      if (selectableGroups[selectionKey]) {
        normalizeSelectableGroupFormatting(selectionKey, selectableGroups, selectables);
      }
    });

    SELECTION_FORMATTING_FIELDS.forEach(({ field }) => {
      if (group[field]) return;

      const hasFormattedChildren = group.groups.every((selectionKey) => hasFormattingForSelectionReference(selectionKey, selectableGroups, selectables, field));

      if (!hasFormattedChildren) return;

      group[field] = true;
      group.groups.forEach((selectionKey) => stripFormattingFromSelectionReference(selectionKey, selectableGroups, selectables, field));
    });
  } else if (Array.isArray(group.description) && group.description.length > 0) {
    group.description.forEach((item) => {
      (item.groups || []).forEach((selectionKey) => {
        if (selectableGroups[selectionKey]) {
          normalizeSelectableGroupFormatting(selectionKey, selectableGroups, selectables);
        }
      });
    });

    SELECTION_FORMATTING_FIELDS.forEach(({ field }) => {
      if (group[field]) return;

      if (!stripFormattingFromDescriptionItems(group.description, selectableGroups, selectables, field)) return;

      group[field] = true;
      stripFormattingFromDescriptionItems(group.description, selectableGroups, selectables, field, true);
    });
  }
};

/**
 * Create groups for complex selecatable
 * @param {{
 *   id: string,
 *   type: "selectable" | "selectables",
 *   onlyOne: boolean,
 *   linebreak: boolean,
 *   selectables: Array<{
 *     id: string,
 *     uuid: string,
 *     description: string,
 *     exclusive: boolean,
 *     notSelectable: boolean,
 *     nestedGroups: Array<{
 *       type: "assignable" | "text" | "selectables",
 *       uuid: string,
 *       id: string,
 *       onlyOne: boolean,
 *       linebreak: boolean,
 *       content: string,
 *       selectables?: any[]
 *     }>
 *   }>
 * }} currentGroup
 *
 * @param {Object.<string, {
 *   onlyOne: boolean,
 *   linebreak: boolean,
 *   exclusive: boolean,
 *   notSelectable: boolean,
 *   description: Array<{ text?: string, groups: string[] }>,
 *   groups: string[]
 * }>} selectableGroups
 * @param {number} subgroup
 * @returns {Object}
 */
function checkNestedGroups(currentGroup, selectableGroups, subgroup = 0, allSelectables = {}) {
  // Initialize the structure for the current group if it doesn't exist
  if (!selectableGroups[currentGroup.id]) {
    selectableGroups[currentGroup.id] = {
      onlyOne: currentGroup.onlyOne,
      linebreak: currentGroup.linebreak,
      groups: [], // in UI will store UUID of selectable or name of selectables group
    };
  }

  // Process each selectable in the current group
  // Only iterate if type is selectable(s)
  if (currentGroup.type === "selectable" || currentGroup.type === "selectables") {
    currentGroup.selectables.forEach((selectable) => {
      // Don't want to add selectable to the group if it has children (complex selectable)
      if (selectable.nestedGroups.length === 0) {
        // Add the selectable's uuid to the groups list of the current group
        selectableGroups[currentGroup.id].groups.push(selectable.uuid);
      } else {
        // If this selectable has nested groups, process them
        var subgroupName = selectable.id ? selectable.id : `${currentGroup.id}_${++subgroup}`;

        // initialization
        if (!selectableGroups[subgroupName]) {
          selectableGroups[subgroupName] = {
            description: [],
            ...(selectable.readable ? { readable: selectable.readable } : {}),
            exclusive: selectable.exclusive,
            notSelectable: false,
          };
        }

        // Add beginning text part of selectable (only if there is something, eg. selectable with just an assignable wil have no description text)
        if (selectable.description.length !== 0) {
          selectableGroups[subgroupName].description.push({ text: removeWhitespace(selectable.description) });
        }

        selectable.nestedGroups.forEach((group) => {
          /*
            Nested group structure
            nested-group-name: {
            description: [{text: "blah"}, {groups: [assignable_uuid/selectableuuid]}];
            exclusive:
            notSectable:
            }
          */

          if (group.type === "assignable") {
            if (selectable.description.length !== 0 || selectable.nestedGroups.length != 1) {
              // Create a complex selectable only if there is more than just an assignment as part of the selectable
              selectableGroups[subgroupName].description.push({ groups: [group.uuid] });
            } else {
              // Add the assignment as a regular child to the selectables group
              selectableGroups[currentGroup.id].groups.push(group.uuid);
            }
          } else if (group.type === "text") {
            // Append to previous text if exists
            const lastElement = selectableGroups[subgroupName].description.slice(-1)[0];
            const text = removeWhitespace(group.content);

            if (lastElement && lastElement.hasOwnProperty("text")) {
              let previousText = "";

              previousText = lastElement["text"];

              selectableGroups[subgroupName].description.pop(); // remove entry
              selectableGroups[subgroupName].description.push({ text: `${previousText} ${text}` });
            } else {
              selectableGroups[subgroupName].description.push({ text: text });
            }
          } else if (group.type === "selectables") {
            // Add group as child to parent group
            selectableGroups[subgroupName].description.push({ groups: [group.id] });

            // Initialize the structure for the current group if it doesn't exist
            if (!selectableGroups[group.id]) {
              selectableGroups[group.id] = {
                onlyOne: group.onlyOne,
                linebreak: group.linebreak,
                groups: [], // in UI will store UUID of selectable or name of selectables group
              };
            }

            // Recursively go through selectables
            checkNestedGroups(group, selectableGroups, subgroup, allSelectables);

            const childGroupIDs = [];

            group.selectables.forEach((sel) => {
              const subgroupName = sel.id || `${group.id}_${++subgroup}`;

              // Check if a complex selectable was created and stored
              const hasComplexEntry = selectableGroups[subgroupName] && selectableGroups[subgroupName].description?.length > 0;

              if (hasComplexEntry) {
                childGroupIDs.push(subgroupName);
              } else if (sel.nestedGroups.length === 1 && sel.nestedGroups[0].type === "assignable") {
                childGroupIDs.push(sel.nestedGroups[0].uuid);
              } else {
                childGroupIDs.push(sel.uuid);
              }
            });

            selectableGroups[group.id].groups = childGroupIDs;
          }
        });

        // Only care about the group if it has entries in the description array (eg. selectable with one assignable will
        // be treated as just a selectable not a complex one)
        if (selectableGroups[subgroupName].description.length !== 0) {
          selectableGroups[currentGroup.id].groups.push(subgroupName);
        } else {
          delete selectableGroups[subgroupName];
        }
      }
    });
  }

  normalizeSelectableGroupFormatting(currentGroup.id, selectableGroups, allSelectables);

  return selectableGroups;
}

/**
 * Parse through <selectables> tag
 * @param {Node} node
 * @param {number} selectable_id
 * @param {number} selectableGroupCounter
 * @param {Node} component
 * @param {string} elementName
 * @returns {{
 *   group: {
 *     id: string,
 *     exclusive: boolean,
 *     onlyOne: boolean,
 *     linebreak: boolean,
 *     selectables: Array<{
 *       type: "selectable",
 *       uuid: string,
 *       id: string,
 *       description: string,
 *       exclusive: boolean,
 *       nestedGroups: Array<{
 *         type: "selectables" | "assignable" | "text",
 *         [key: string]: any
 *       }>
 *     }>,
 *     type: "selectables"
 *   },
 *   allSelectables: { [uuid: string]: any },
 *   selectable_id: number,
 *   lastGroupCounter: number
 * }}
 */
function processSelectables(node, selectable_id, selectableGroupCounter, component, elementName) {
  let topLevelGroup = {
    id: `group-${++selectableGroupCounter}`,
    exclusive: node.getAttribute("exclusive") === "yes",
    onlyOne: node.getAttribute("onlyone") === "yes" || node.getAttribute("choose-one-of") === "yes", // onlyOne attr will be deprecated
    linebreak: node.getAttribute("linebreak") === "yes",
    selectables: [],
    type: "selectables",
  };

  let allSelectables = {};

  /**
   * Recursively parse a <selectable> node's children and updates the context object
   * with description text, nested groups, and assignables
   * @param {Node} selectable_node node to parse
   * @param {{
   *   description: string,
   *   nestedGroups: Array<Object>,
   *   descriptionSet: boolean,
   *   contents: string
   * }} context values to be persisted through recursion
   * @returns {void}
   */
  function parseChildren(selectable_node, context) {
    selectable_node.childNodes.forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        context.contents += escapeLTSign(childNode.textContent);
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        if (childNode.tagName.toLowerCase() === "selectables") {
          // Handle initial text for description or subsequent text as a separate group
          if (!context.descriptionSet) {
            context.description = context.contents; // Populate description with the initial text
            context.descriptionSet = true;
          } else {
            // Subsequent text is treated as a separate entity in nestedGroups
            context.nestedGroups.push({ type: "text", content: context.contents });
          }
          context.contents = ""; // Reset the contents buffer

          selectableGroupCounter++;
          let nestedGroupResult = processSelectables(childNode, selectable_id, selectableGroupCounter, component, elementName);
          selectable_id = nestedGroupResult.selectable_id;
          selectableGroupCounter = nestedGroupResult.lastGroupCounter;
          context.nestedGroups.push(nestedGroupResult.group);
        } else if (childNode.tagName.toLowerCase() === "readable") {
          context.readable = removeWhitespace(escapeLTSign(childNode.textContent));
        } else if (childNode.tagName.toLowerCase() === "assignable") {
          // Handle initial text for description or subsequent text as a separate group
          if (!context.descriptionSet) {
            context.description = context.contents; // Populate description with the initial text
            context.descriptionSet = true;
          } else {
            // Subsequent text is treated as a separate entity in nestedGroups
            context.nestedGroups.push({ type: "text", content: context.contents });
          }
          context.contents = ""; // Reset the contents buffer

          const assignableContent = getDirectTextContent(childNode);
          context.nestedGroups.push({
            type: "assignable",
            uuid: uuidv4(),
            content: assignableContent,
            id: `${elementName}_${++selectable_id}`,
          });
        } else {
          if (childNode.localName.toLowerCase() === "refinement") {
            context.contents += "<b>";
            parseChildren(childNode, context);
            context.contents += "</b>";
          } else if (style_tags.includes(childNode.localName.toLowerCase())) {
            context.contents += `<${childNode.localName}${getNodeAttributes(childNode)}>`;
            parseChildren(childNode, context);
            context.contents += `</${childNode.localName}>`;
          } else if (raw_xml_tags.includes(childNode.localName.toLowerCase())) {
            // previously we were omitting the snip tag, but now we will pull in raw xml
            context.contents += ` ${escapeXmlTags(getNodeContent(childNode))}`;
          } else if (childNode.localName.toLowerCase() === "a") {
            context.contents += `${context.contents && !/\s$/.test(context.contents) ? " " : ""}${getLinkContent(childNode)}`;
          } else if (childNode.localName.toLowerCase() === "br") {
            context.contents += `</${childNode.localName}>`;
          }
        }
      }
    });
  }

  node.childNodes.forEach((selectableNode) => {
    const uuid = uuidv4();

    if (selectableNode.nodeName.toLowerCase() === "selectable") {
      const id = selectableNode.getAttribute("id") || `${elementName}_${++selectable_id}`;
      let exclusive = selectableNode.getAttribute("exclusive") === "yes";
      let context = {
        description: "", // For the initial direct child text
        readable: "",
        nestedGroups: [],
        descriptionSet: false, // Flag to track if the description is already populated
        contents: "",
      };

      parseChildren(selectableNode, context);

      if (context.contents.length !== 0) {
        // Handle initial text for description or subsequent text as a separate group
        if (!context.descriptionSet) {
          context.description = context.contents; // Populate description with the initial text
          context.descriptionSet = true;
        } else {
          // Subsequent text is treated as a separate entity in nestedGroups
          context.nestedGroups.push({ type: "text", content: context.contents });
        }
      }

      // Prepare the selectable entry with its description and nested groups
      let selectableEntry = {
        type: "selectable",
        uuid,
        id,
        description: removeWhitespace(context.description),
        ...(context.readable ? { readable: context.readable } : {}),
        exclusive,
        nestedGroups: context.nestedGroups,
      };

      topLevelGroup.selectables.push(selectableEntry);

      // Check if there are any nested selectables or assignable - if there are not, then it is just
      // styling tags so it doesn't need to be a complex selectable
      const hasNestedChild = selectableEntry.nestedGroups.some((e) => e.type === "selectables" || e.type === "assignable");
      if (selectableEntry.nestedGroups.length !== 0 && !hasNestedChild) {
        selectableEntry.nestedGroups.forEach((entry) => {
          selectableEntry.description = selectableEntry.description + entry.content;
        });

        selectableEntry.nestedGroups = []; // Clear it out since all data has been added to the description field
      }

      // Only want to add 'simple' selectable + assignments which don't have complex nested children
      if (selectableEntry.nestedGroups.length === 0) {
        allSelectables[uuid] = selectableEntry;
      } else {
        // Pick out lowest level children (assignable + selectable) if it is a complex selectable
        // The parent selectable itself will be constructed in the post-processing checkNestedGroups
        const result = flattenSelectable(selectableEntry, allSelectables, id);
        allSelectables = result.allSelectables;
      }
    }
  });

  return {
    group: topLevelGroup,
    allSelectables,
    selectable_id,
    lastGroupCounter: selectableGroupCounter,
  };
}

/**
 * Parse the <tabularize> tag
 * @param {Node} selectablesNode
 * @param {number} selectable_id
 * @param {number} selectableGroupCounter
 * @param {string} component
 * @param {string} elementName
 * @returns {{
 *   tabularizeEntry: {
 *     type: "tabularize",
 *     uuid: string,
 *     id: string,
 *     title: string,
 *     definition: Array<{ value: string, type: "selectcol" | "textcol" | "reqtext" }>,
 *     columns: Array<{
 *       headerName: string,
 *       field: string,
 *       editable: boolean,
 *       resizable: boolean,
 *       type: "Editor" | "Button",
 *       flex: number
 *     }>,
 *     rows: Array<Object>
 *   },
 *   selectable_id: number,
 *   allSelectables: Object.<string, {
 *     id: string,
 *     leadingText: string,
 *     description: string,
 *     trailingText: string,
 *     assignment: boolean,
 *     exclusive: boolean,
 *     notSelectable: boolean
 *   }>,
 *   selectableGroups: Object.<string, Object>
 *   selectableGroupCounter: number
 * }}
 */
function parseTabularize(selectablesNode, selectable_id, selectableGroupCounter, component, elementName) {
  const uuid = uuidv4();
  let tabularizeEntry = {};
  let allSelectables = {};
  let selectableGroups = {};

  selectablesNode.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      // doing check for type as there may be comments
      if (child.localName.toLowerCase() === "tabularize") {
        tabularizeEntry = {
          type: "tabularize",
          uuid,
          id: child.getAttribute("id") || `${elementName}_${++selectable_id}`,
          title: child.getAttribute("title") || "",
          definition: [
            {
              value: "Selectable ID",
              type: "textcol",
            },
          ],
          columns: [
            {
              headerName: "Selectable ID",
              field: "selectableId",
              editable: false,
              resizable: true,
              type: "Editor",
              flex: 3,
            },
          ],
          rows: [],
        };

        child.childNodes.forEach((tabularizeChild) => {
          if (["selectcol", "reqtext", "textcol"].includes(tabularizeChild.localName.toLowerCase())) {
            const value = parseRichTextChildren(tabularizeChild);
            const type = tabularizeChild.localName.toLowerCase().replace(" ", "_");

            tabularizeEntry.definition.push({
              value: value,
              type: type,
            });
          }

          if (["selectcol", "textcol"].includes(tabularizeChild.localName.toLowerCase())) {
            const headerName = tabularizeChild.textContent;
            const field = toCamelCase(tabularizeChild.textContent);
            const editable = false;
            const resizeable = true;
            const type = tabularizeChild.localName.toLowerCase() === "selectcol" ? "Button" : "Editor";
            const flex = tabularizeChild.localName.toLowerCase() === "selectcol" ? 5 : 3;

            // Add as column header
            tabularizeEntry.columns.push({
              headerName: headerName,
              field: field,
              editable: editable,
              resizable: resizeable,
              type: type,
              flex: flex,
            });
          }
        });
      } else if (child.tagName.toLowerCase() === "selectable") {
        let tabularizeSelectable = {
          selectableId: child.getAttribute("id") || "",
        };

        // Get the columns in existence (don't want the selectable ID since that has already been set)
        const columns = tabularizeEntry.definition.filter((item) => (item.type === "selectcol" || item.type === "textcol") && item.value !== "Selectable ID");

        // need a counter to track what position the col is in the selectable - since there may be comments which throw off the index
        let childCtr = 0;

        child.childNodes.forEach((selectableChild) => {
          if (selectableChild.nodeType === Node.ELEMENT_NODE) {
            if (selectableChild.localName.toLowerCase() === "col" && columns[childCtr] && columns[childCtr].hasOwnProperty("type")) {
              const columnType = columns[childCtr].type;

              if (columnType === "textcol") {
                // column with plain text
                tabularizeSelectable[toCamelCase(columns[childCtr].value)] = parseRichTextChildren(selectableChild);
              } else if (columnType === "selectcol") {
                // column with selectables
                tabularizeSelectable[toCamelCase(columns[childCtr].value)] = [];

                // Iterate through <col> children
                selectableChild.childNodes.forEach((colChild, idx) => {
                  if (colChild.nodeType === Node.ELEMENT_NODE) {
                    if (colChild.localName.toLowerCase() === "selectables") {
                      const result = processSelectables(colChild, selectable_id, selectableGroupCounter, component, elementName);
                      selectable_id = result.selectable_id;
                      selectableGroupCounter = result.lastGroupCounter;

                      // Add all the selectables to masterlist; using Object.assign to prevent/preserve existing data
                      Object.assign(allSelectables, result.allSelectables);

                      // Create the groups
                      selectableGroups = checkNestedGroups(result.group, selectableGroups, 0, result.allSelectables);

                      // Selectables are prefaced with text, add this group to the selections which comes after opening text
                      tabularizeSelectable[toCamelCase(columns[childCtr].value)].push({ selections: result.group.id });
                    } else if (colChild.localName.toLowerCase() === "assignable") {
                      let id = child.getAttribute("id");
                      if (!id) {
                        id = `${elementName}_${++selectable_id}`;
                      }

                      allSelectables[uuid] = {
                        id: id,
                        leadingText: "",
                        description: removeWhitespace(escapeLTSign(colChild.textContent)),
                        trailingText: "",
                        assignment: true,
                        exclusive: false,
                        notSelectable: false,
                      };
                      tabularizeSelectable[toCamelCase(columns[childCtr].value)].push({ assignment: uuid });
                    } else if (style_tags.includes(colChild.localName.toLowerCase())) {
                      tabularizeSelectable[toCamelCase(columns[childCtr].value)].push({
                        text: `<${colChild.localName}>${parseRichTextChildren(colChild)}</${colChild.localName}>`,
                      });
                    }
                  } else if (colChild.nodeType === Node.TEXT_NODE) {
                    tabularizeSelectable[toCamelCase(columns[childCtr].value)].push({ text: removeWhitespace(escapeLTSign(colChild.textContent)) });
                  }
                });
              }
              childCtr++;
            }
          }
        });
        tabularizeEntry.rows.push(tabularizeSelectable);
      }
    }
  });

  return {
    tabularizeEntry,
    selectable_id,
    allSelectables,
    selectableGroups,
    selectableGroupCounter,
  };
}

/**
 * Parse the bibliography
 * @param {Node} domNode
 * @returns {{
 *   entries: Array<{
 *     id: string,
 *     tag: string,
 *     description: string
 *   }>
 * }}
 */
export const getBibliography = (bibliographySection) => {
  let bibObj = {
    entries: [],
  };

  bibliographySection.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (child.nodeName.toLowerCase() === "entry") {
        let entry = {};
        entry["id"] = child.id;

        // Iterate through entry
        child.childNodes.forEach((entryChild) => {
          if (entryChild.nodeType === Node.ELEMENT_NODE) {
            if (entryChild.nodeName === "tag") {
              entry["tag"] = entryChild.textContent;
            } else if (entryChild.nodeName === "description") {
              entry["description"] = parseRichTextChildren(entryChild);
            }
          }
        });

        bibObj.entries.push(entry);
      }
    }
  });

  return bibObj;
};

/**
 * Parse the entropy appendix
 * @param {Node} domNode
 * @returns {{
 *   entropyAppendix: string | null,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getEntropyAppendix = (entropyAppendix) => {
  let xmlTagMeta = {
    tagName: "appendix",
    attributes: {},
  };

  // Set the attributes
  if (entropyAppendix) {
    entropyAppendix.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    entropyAppendix = getNodeContentWithTags(entropyAppendix);
  }

  return { entropyAppendix, xmlTagMeta };
};

/**
 * Parse the equivalency guidelines appendix
 * @param {Node} domNode
 * @returns {{
 *   guidelinesAppendix: string | null,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getEquivGuidelinesAppendix = (guidelinesAppendix) => {
  let xmlTagMeta = {
    tagName: "appendix",
    attributes: {},
  };

  // Set the attributes
  if (guidelinesAppendix) {
    guidelinesAppendix.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    guidelinesAppendix = getNodeContentWithTags(guidelinesAppendix);
  }

  return { guidelinesAppendix, xmlTagMeta };
};

/**
 * Parse the implicitly satisfied requirements appendix
 * @param {Node} domNode
 * @returns {{
 *   satisfiedReqsAppendix: string | null,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getSatisfiedReqsAppendix = (satisfiedReqsAppendix) => {
  let xmlTagMeta = {
    tagName: "appendix",
    attributes: {},
  };

  // Set the attributes
  if (satisfiedReqsAppendix) {
    satisfiedReqsAppendix.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    satisfiedReqsAppendix = getNodeContentWithTags(satisfiedReqsAppendix, true);
  }

  return { satisfiedReqsAppendix, xmlTagMeta };
};

/**
 * Parse the validation guidelines appendix
 * @param {Node} domNode
 * @returns {{
 *   valGuideAppendix: string | null,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getValidationGuidelinesAppendix = (valGuideAppendix) => {
  let xmlTagMeta = {
    tagName: "appendix",
    attributes: {},
  };

  // Set the attributes
  if (valGuideAppendix) {
    valGuideAppendix.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    valGuideAppendix = getNodeContentWithTags(valGuideAppendix);
  }

  return { valGuideAppendix, xmlTagMeta };
};

/**
 * Parse the vector appendix
 * @param {Node} domNode
 * @returns {{
 *   vectorReqsAppendix: string | null,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getVectorAppendix = (vectorReqsAppendix) => {
  let xmlTagMeta = {
    tagName: "appendix",
    attributes: {},
  };

  // Set the attributes
  if (vectorReqsAppendix) {
    vectorReqsAppendix.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    vectorReqsAppendix = getNodeContentWithTags(vectorReqsAppendix);
  }

  return { vectorReqsAppendix, xmlTagMeta };
};

/**
 * Parse the acknowledgements appendix
 * @param {Node} domNode
 * @returns {{
 *   acknowledgementsReqsAppendix: string | null,
 *   xmlTagMeta: {
 *     tagName: string,
 *     attributes: Object.<string, string>
 *   }
 * }}
 */
export const getAcknowledgementsAppendix = (acknowledgementsReqsAppendix) => {
  let xmlTagMeta = {
    tagName: "appendix",
    attributes: {},
  };

  // Set the attributes
  if (acknowledgementsReqsAppendix) {
    acknowledgementsReqsAppendix.attributes.forEach((attr) => {
      xmlTagMeta.attributes[attr.name] = attr.value;
    });

    acknowledgementsReqsAppendix = getNodeContentWithTags(acknowledgementsReqsAppendix);
  }

  return { acknowledgementsReqsAppendix, xmlTagMeta };
};

/**
 * Parse the extra-css tag
 * @param {Node} domNode
 * @returns {string}
 */
export const getCustomCSS = (domNode) => {
  let css = null;

  if (findAllByTagName("extra-css", domNode).length !== 0) {
    css = findAllByTagName("extra-css", domNode)[0].textContent;
  }

  return css;
};

/**
 *  HELPER FUNCTIONS
 */

/**
 * Escape <, > signs that need to be retained
 * @param {string} content: Xml string to escape
 * @returns {string}
 */
function escapeXmlTags(content) {
  // escape all XML tags so that they can be represented as strings in the TipTap editor
  return content.replace(FILE_PARSER_REGEX.xmlTag, (match, tagContent) => `&lt;${tagContent}&gt;`);
}

/**
 * Convert string to camelCase
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index === 0) {
        // Keep the first letter lowercase
        return word;
      }
      // Capitalize the first letter of the other words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

/**
 * Remove whitespace (extra spaces, newline, tab, etc))
 * @param {string} content
 * @returns {string}
 */
function removeWhitespace(content) {
  return content.replace(COMMON_REGEX.allWhitespace, " ").trim();
}

/**
 * Prepend '<' with an invisible zero width unicode character in order to identify these as mathematical operations as opposed
 * to tag openings. This allows export to identify them and escape them as transforms will complain since it appears like an unclosed tag
 * @param {string} content xml string
 * @returns {string}
 */
function escapeLTSign(content) {
  return content.replace(FILE_PARSER_REGEX.lessThanOrEqual, "\u200C<=").replace(FILE_PARSER_REGEX.lessThan, "\u200C<");
}

/**
 * Parse through selectable to get lowest layer child
 * @param {Object} selectable
 * @param {Object.<string, Object>} allSelectables
 * @param {string} id
 * @returns {{
 *   allSelectables: Object.<string, Object>,
 *   lastSelectableId: string
 * }}
 */
function flattenSelectable(selectable, allSelectables, id) {
  let lastSelectableId = id;

  if (selectable.nestedGroups.length > 0) {
    selectable.nestedGroups.forEach((item) => {
      if (item.type === "assignable") {
        allSelectables[item.uuid] = item;

        // If this selectable is a pure assignable wrapper (only child is this assignable, no leading text),
        // use the parent selectable's original ID so the exporter preserves the id correctly.
        const effectiveId = selectable.nestedGroups.length === 1 && !selectable.description ? selectable.id : item.id;
        allSelectables[item.uuid] = {
          id: effectiveId,
          description: item.content,
          ...(selectable.readable ? { readable: selectable.readable } : {}),
          assignment: true,
          exclusive: false,
          notSelectable: false,
        };
      } else if (item.type === "selectables") {
        item.selectables.forEach((selectable_child) => {
          flattenSelectable(selectable_child, allSelectables, lastSelectableId);
        });
      }
    });
  } else {
    allSelectables[selectable.uuid] = selectable;
  }

  return {
    allSelectables,
    lastSelectableId,
  };
}

/**
 * Find node by tag name, and return first one found
 * @param {string} tagName - The tag name to match (case-insensitive).
 * @param {Node} parentNode - The parent DOM node whose children will be searched.
 * @returns {Node[]}
 */
function findDirectChildrenByTagName(tagName, parentNode) {
  let result = [];
  parentNode.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === tagName) {
      result.push(child);
    }
  });
  return result;
}

/**
 * Return only text from a given node
 * @param {Node} node
 * @returns {string}
 */
function getDirectTextContent(node) {
  let textContent = "";

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      textContent += `${removeWhitespace(escapeLTSign(child.textContent))} `;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      textContent += `<${child.localName}>${getDirectTextContent(child)}</${child.localName}>`;
    }
  });
  return textContent.trim();
}

/**
 * Get component and element IDs for a given selectable ID (used for selection dependent components)
 * @param {Node} xmlComp
 * @param {string} selectableId
 * @returns {{ fComponentId: (string|null), fElementId: (string|null) }}
 */
function getSelDepParents(xmlComp, selectableId) {
  // Find the selectable with the given ID
  let selectables = findAllByAttribute("id", selectableId, xmlComp);

  let fElementId = null;
  let fComponentId = null;

  if (selectables.length > 0) {
    let selectable = selectables[0];

    // Traverse up to find the closest f-element and f-component
    let current = selectable;

    while (current) {
      if (current.nodeName === "f-element" && !fElementId) {
        fElementId = current.getAttribute("id");
      }
      if (current.nodeName === "f-component") {
        fComponentId = current.getAttribute("cc-id") || current.getAttribute("id");
        break;
      }
      current = current.parentNode; // Move up in the DOM tree
    }

    return { fComponentId, fElementId };
  }

  return { fComponentId, fElementId };
}

/**
 * Get UUID of a selectable (for selection dependent SFRs)
 * @param {Object.<string, Object>} slice
 * @param {string} id
 * @param {"component" | "element" | "selectable"} type
 * @returns {string|null}
 */
export function getUUID(slice, id, type) {
  // Iterate through families
  for (const familyUUID in slice) {
    const family = slice[familyUUID];

    // Iterate through all components in the parent
    for (const componentUUID in family) {
      const component = family[componentUUID];

      if (type === "component" && component.xml_id === id) {
        return componentUUID;
      }

      // Check if component has elements
      if (component.elements) {
        for (const elementUUID in component.elements) {
          const element = component.elements[elementUUID];

          if (element.elementXMLID === id && type === "element") {
            return elementUUID;
          }

          // Check if element has selectables
          if (element.selectables) {
            for (const selectableUUID in element.selectables) {
              const selectable = element.selectables[selectableUUID];

              if (selectable.id === id && type === "selectable") {
                return selectableUUID;
              }
            }
          }
        }
      }
    }
  }
  return null;
}

/**
 * Gets the XML ID for a stored UUID
 * @param slice the sfr section slice
 * @param uuid the UUID
 * @param type the item type
 * @returns {string|null}
 */
export function getID(slice, uuid, type) {
  // Iterate through families
  for (const familyUUID in slice) {
    const family = slice[familyUUID];

    // Iterate through all components in the parent
    for (const componentUUID in family) {
      const component = family[componentUUID];

      if (type === "component" && componentUUID === uuid) {
        return component.xml_id;
      }

      // Check if component has elements
      if (component.elements) {
        for (const elementUUID in component.elements) {
          const element = component.elements[elementUUID];

          if (elementUUID === uuid && type === "element") {
            return element.elementXMLID;
          }

          // Check if element has selectables
          if (element.selectables) {
            for (const selectableUUID in element.selectables) {
              const selectable = element.selectables[selectableUUID];

              if (selectableUUID === uuid && type === "selectable") {
                return selectable.id;
              }
            }
          }
        }
      }
    }
  }
  return null;
}

/**
 * Get the ref-id values from a string as an array
 * @param {string} inputString
 * @returns {string[]}
 */
const getRefIds = (inputString) => {
  let refIds = [];

  try {
    const matchArray = inputString.match(FILE_PARSER_REGEX.refIdAttribute);
    refIds = matchArray ? matchArray.map((match) => match.match(FILE_PARSER_REGEX.quotedAttributeValue)[1]) : [];
  } catch (e) {
    console.log(e);
  }

  return refIds;
};

/**
 * Removes escaped <also> tags from a string, handles both self closing and open/close
 * - Self-closing: &lt;also ... /&gt;
 * - Open/close:   &lt;also ...&gt;&lt;/also&gt;
 * @param {string} inputString
 * @returns {string}
 */
function removeAlsoTags(inputString) {
  return inputString.replace(FILE_PARSER_REGEX.escapedAlsoTag, "");
}

/**
 * Get the attributes (if any) that a node has
 * @param {Node} node
 * @returns {string}
 */
function getNodeAttributes(node) {
  let attributes = "";

  if (node.attributes && node.attributes.length > 0) {
    Array.from(node.attributes).forEach((attr) => {
      attributes += ` ${attr.name}="${attr.value}"`;
    });
  }

  return attributes;
}
