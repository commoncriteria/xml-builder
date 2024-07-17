import { v4 as uuidv4 } from 'uuid';
import { select } from 'xpath';
import { hasAttribute } from 'xsd2jsonschema/src/xmlschema/xsdFileXmlDom';

const raw_xml_tags = ["xref", "rule", "figure", "ctr", "table", "snip", "if-opt-app"];
export const escapedTagsRegex = /<\/?(xref|rule|figure|ctr|table|snip|if-opt-app)\b[^>]*>/g;


export const findAllByTagName = (nodeName, domNode) => {

    return select(`.//*[local-name(.)='${nodeName}']`, domNode);

}

export const findAllByAttribute = (attributeName, attributeValue, domNode) => {

    return select(`.//*[@${attributeName}='${attributeValue}']`, domNode);
}

export const findAllByAttributes = (attributeKeyPairs, domNode) => {

    let arrayOfNodes = new Array();

    Object.entries(attributeKeyPairs).forEach(([attributeName, attributeValue]) => {
        arrayOfNodes.push(...findAllByAttribute(attributeName, attributeValue, domNode));
    })

    return arrayOfNodes;
}

export const findAllMultipleTagNames = (nodeNames, domNode) => {
    let arrayOfNodes = new Array();
    for (let nodeName of nodeNames) {
        arrayOfNodes.push(...findAllByTagName(nodeName, domNode));
    }

    return arrayOfNodes;
}

export const getAllComponents = (domNode) => {
    return findAllMultipleTagNames(['f-component', 'a-component'], domNode);
}

/**
 * <include-pkg> related tags
 * @param {*} domNode 
 */
export const getExternalPackages = (domNode) => {
    let packages = findAllByTagName("include-pkg", domNode);

    let packageArr = new Array();

    if (packages.length != 0) {
        packages.forEach(p => {
            let pkg = {};
            let dependsArr = [];

            pkg["id"] = p.id ? p.id : "";

            p.childNodes.forEach(c =>{
                if (c.nodeType == Node.ELEMENT_NODE) {
                    if (c.nodeName.toLowerCase() == "git") {
                        let gitObj = {};

                        c.childNodes.forEach(gitChild => {
                            if (gitChild.nodeType == Node.ELEMENT_NODE) {
                                if (gitChild.nodeName == "url") {
                                    gitObj["url"] = gitChild.textContent
                                } else if (gitChild.nodeName == "branch") {
                                    gitObj["branch"] = gitChild.textContent
                                }
                            }
                        });

                        pkg["git"] = gitObj;
                    } else if (c.nodeName.toLowerCase() == "url") {
                        pkg["url"] = c.textContent;
                    } else if (c.nodeName.toLowerCase() == "depends") {
                        c.attributes.forEach(attr => {
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
}

/**
 * <modules> related tags
 * @param {*} domNode 
 */
export const getExternalModules = (domNode) => {
    let modules = findAllByTagName("modules", domNode);

    if (modules.length != 0) {
        modules = getNodeContentWithTags(modules[0]);
    }
    
    return modules;
}

export const getPlatforms = (domNode) => {
    let platformObj = {
        description: "",
        platforms: [],
        platformMap: {},
    }
    let platformMap = {};

    let platformRawXML = '';


    let platform_section = findAllByAttribute("title", "Platforms with Specific EAs", domNode);

    if (platform_section.length == 0) {
        if (findAllByAttribute("id", "sec-platforms", domNode).length != 0) {
            platform_section = findAllByAttribute("id", "sec-platforms", domNode)[0]
        }
    }

    if (platform_section.length != 0) {

        platformRawXML = getNodeContentWithTags(platform_section[0]); // Used for export

        if (platform_section[0].childNodes) {
            platform_section[0].childNodes.forEach(child => {
                if (child.tagName.toLowerCase() == "choice") {
                    platformObj.description = getDirectTextContent(child);
                }
            });

            // if no choice tag, just get all the platforms which are in selectables
            let selectables = findAllByTagName("selectables", platform_section[0]);
            if (selectables.length != 0) {
                if (selectables[0].childNodes) {
                    selectables[0].childNodes.forEach(selectable => {
                        let platformName = "";
                        let description = "";


                        if (selectable.childNodes) {
                            selectable.childNodes.forEach(s => {
                                if (s.nodeType == Node.ELEMENT_NODE) {
                                    if (s.localName.toLowerCase() == "b") {
                                        platformName = s.textContent;
                                        platformMap[selectable.getAttribute("id")] = platformName;
                                    } else if (s.localName.toLowerCase() == "i") {
                                        description = s.textContent;
                                    }
                                }
                            });
                        }
                        platformObj.platforms.push({ name: platformName, description: description, id: selectable.getAttribute("id")})
                    });
                }
            }
        }
        platformObj.platformMap = platformMap
    }

    return { platformRawXML, platformObj };
}

export const getPPMetadata = (domNode) => {
    let pp = findAllByTagName('PP', domNode);
    let xmlTagMeta = {
        tagName: "PP",
        attributes: {}
    };

    if (pp.length != 0) {
        pp = pp[0];
        let attributes = {};

        pp.attributes.forEach(attr => {
            attributes[attr.name] = attr.value
        });

        xmlTagMeta.attributes = attributes;
    }

    return xmlTagMeta;
}


export const getPPReference = (domNode) => {
    const ppRef = findAllByTagName('PPReference', domNode);
    let ppObj = {
        PPTitle: '',
        PPVersion: '',
        PPAuthor: '',
        PPPubDate: '',
        Keywords: '',
        RevisionHistory: [],
    }

    if (ppRef.length != 0) {
        ppRef[0].childNodes.forEach((child) => {
            if (child.tagName.toLowerCase() == 'referencetable') {
                child.childNodes.forEach((c) => {
                    if (c.tagName.toLowerCase() == 'pptitle') {
                        ppObj.PPTitle = c.textContent
                    } else if (c.tagName.toLowerCase() == 'ppversion') {
                        ppObj.PPVersion = c.textContent
                    } else if (c.tagName.toLowerCase() == 'ppauthor') {
                        ppObj.PPAuthor = c.textContent
                    } else if (c.tagName.toLowerCase() == 'pppubdate') {
                        ppObj.PPPubDate = c.textContent
                    } else if (c.tagName.toLowerCase() == 'keywords') {
                        ppObj.Keywords = c.textContent
                    }
                });
            }
        });
    }

    let revisionHistory = findAllByTagName('RevisionHistory', domNode);
    if (revisionHistory.length != 0) {
        revisionHistory[0].childNodes.forEach((child) => {
            if (child.tagName.toLowerCase() == 'entry') {
                let revisionInstance = {
                    'version': "",
                    'date': "",
                    'comment': ""
                }
                child.childNodes.forEach((c) => {
                    if (c.tagName.toLowerCase() == 'version') {
                        revisionInstance.version = c.textContent
                    } else if (c.tagName.toLowerCase() == 'date') {
                        revisionInstance.date = c.textContent
                    } else if (c.tagName.toLowerCase() == 'subject') {
                        revisionInstance.comment = c.textContent
                    }
                });
                ppObj.RevisionHistory.push(revisionInstance);
            }
        });
    }

    return ppObj;
}


export const getSecurityProblemDefinition = (domNode) => {
    const spd_section = findAllByTagName('Security_Problem_Description', domNode);
    let spd = '';

    if (spd_section.length != 0) {
        spd = parseRichTextChildren(spd_section[0]);
    }

    return spd;
}


export const getAllThreats = (domNode) => {
    // Get threat description (if exists)
    const threat_description_section = findAllByAttribute('title', 'Threats', domNode);
    let threat_description = "";

    if (threat_description_section.length != 0) {
        if (threat_description_section[0].tagName.toLowerCase() == "section") {
            threat_description = getDirectTextContent(threat_description_section[0]);
        }
    }

    let threat_tags = findAllByTagName('threat', domNode);
    let threats = new Array();

    threat_tags.forEach((threat) => {
        let securityObjectives = new Array();

        if (threat.nodeType == Node.ELEMENT_NODE && threat.tagName == "threat") {
            let description = findAllByTagName('description', threat);
            description = description.length != 0 ? description[0].textContent : "";
            let name = threat.getAttribute("name");

            let objectives = findAllByTagName('objective-refer', threat);
            objectives.forEach(objective => {
                let objective_name = objective.getAttribute("ref");

                let rationale = findAllByTagName('rationale', objective);
                rationale = rationale.length != 0 ? rationale[0].textContent : "";

                securityObjectives.push({
                    name: objective_name,
                    rationale: rationale.replace(/[\n\t]/g, ""),
                    xmlTagMeta: {
                        tagName: "objective-refer",
                        attributes: {
                            ref: objective_name
                        }
                    }
                });
            });

            threats.push({
                name: name,
                definition: description.replace(/[\n\t]/g, ""),
                securityObjectives: securityObjectives,
                xmlTagMeta: {
                    tagName: threat.tagName,
                    attributes: {
                        name: name
                    }
                }
            });
        }
    });

    return { threat_description, threats };
}

export const getAllAssumptions = (domNode) => {
    let assumption_tags = findAllByTagName('assumption', domNode);
    let assumptions = new Array();

    assumption_tags.forEach((assumption) => {
        let securityObjectives = new Array();

        if (assumption.nodeType == Node.ELEMENT_NODE && assumption.tagName == "assumption") {
            let description = findAllByTagName('description', assumption);
            description = description.length != 0 ? description[0].textContent : "";
            let name = assumption.getAttribute("name");

            let objectives = findAllByTagName('objective-refer', assumption);
            objectives.forEach(objective => {
                let objective_name = objective.getAttribute("ref");

                let rationale = findAllByTagName('rationale', objective);
                rationale = rationale.length != 0 ? rationale[0].textContent : "";

                securityObjectives.push({
                    name: objective_name,
                    rationale: rationale,
                    xmlTagMeta: {
                        tagName: "objective-refer",
                        attributes: {
                            ref: objective_name
                        }
                    }
                });
            });

            assumptions.push({
                name: name,
                definition: description,
                securityObjectives: securityObjectives,
                xmlTagMeta: {
                    tagName: assumption.tagName,
                    attributes: {
                        name: name
                    }
                }
            });
        }
    });

    return assumptions;
}



export const getAllSecurityObjectivesTOE = (domNode) => {
    const securityobjective_tags = findAllByTagName('SO', domNode);
    let security_objectives = new Array();

    securityobjective_tags.forEach((security_objective) => {
        if (security_objective.nodeType == Node.ELEMENT_NODE && security_objective.tagName == "SO") {
            let description = findAllByTagName('description', security_objective);
            description = description.length != 0 ? description[0].textContent : "";
            const name = security_objective.getAttribute("name");

            const sfrsNodes = findAllByTagName('addressed-by', security_objective);
            let sfr_list = sfrsNodes.map(sfr => {
                const sfr_name = sfr.textContent.replace(/["']/g,'').split("(")[0].trim();
                let rationaleNode = sfr.nextSibling; // assuming rationale immediately follows addressed-by, which is currently the case
                while (rationaleNode && rationaleNode.nodeType !== Node.ELEMENT_NODE) {
                    rationaleNode = rationaleNode.nextSibling; // skip non-element nodes (eg. text nodes)
                }
                const rationale = rationaleNode && rationaleNode.tagName == 'rationale' ? rationaleNode.textContent.trim() : '';
                return {
                    sfrDetails: {
                        sfr_name: sfr_name,
                        xmlTagMeta: {
                            tagName: "addressed-by",
                        }
                    },
                    rationale: {
                        description: rationale,
                        xmlTagMeta: {
                            tagName: "rationale",
                        }
                    }

                };
            });

            security_objectives.push({
                name: name,
                definition: description,
                sfrs: sfr_list,
                xmlTagMeta: {
                    tagName: "SO",
                    attributes: {
                        name: name
                    }
                },
            });
        }
    });

    return security_objectives;
}

export const getAllSecurityObjectivesOE = (domNode) => {
    let securityobjective_tags = findAllByTagName('SOE', domNode);
    let security_objectives = new Array();

    securityobjective_tags.forEach((security_objective) => {
        if (security_objective.nodeType == Node.ELEMENT_NODE && security_objective.tagName == "SOE") {
            let description = findAllByTagName('description', security_objective);
            description = description.length != 0 ? description[0].textContent : "";
            let name = security_objective.getAttribute("name");
            security_objectives.push({
                name: name,
                definition: description,
                xmlTagMeta: {
                    tagName: "SOE",
                    attributes: {
                        name: name
                    }
                },
            });
        }
    });

    return security_objectives;
}

/**
 * 
 * @param {*} domNode 
 */
export const getAllTechTerms = (domNode) => {
    let techTerms = findAllMultipleTagNames(['tech-terms'], domNode);
    let termsArray = new Array();
    let acronymsArray = new Array();

    if (techTerms.length != 0) {
        techTerms = techTerms[0];

        for (let term of techTerms.childNodes) {
            if (term.nodeType == Node.ELEMENT_NODE && term.tagName == "term") {
                // Check if abbr attribute exists and is not empty
                const abbr = term.getAttribute("abbr");
                const name = abbr ? term.getAttribute("full").concat(' (', abbr, ')') : term.getAttribute("full");

                if (term.textContent != null && term.textContent.length != 0) {
                    termsArray.push({
                        name: name,
                        definition: term.textContent,
                        xmlTagMeta: {
                            tagName: term.tagName,
                            attributes: {
                                abbr: term.getAttribute("abbr") ? term.getAttribute("abbr") : "",
                                full: term.getAttribute("full") ? term.getAttribute("full") : ""
                            }
                        }
                    });
                } else { // AKA if it is an acronym
                    acronymsArray.push({
                        name: name,
                        definition: "",
                        xmlTagMeta: {
                            tagName: term.tagName,
                            attributes: {
                                abbr: term.getAttribute("abbr") ? term.getAttribute("abbr") : "",
                                full: term.getAttribute("full") ? term.getAttribute("full") : ""
                            }
                        }
                    });
                }
            }
        }

        return { termsArray, acronymsArray };
    }
}

/**
 * 
 * @param {*} domNode
 */
export const getDocumentObjectives = (domNode) => {
    // tag structure varies from xml to xml...
    let docObjectiveSection = null;
    let doc_objectives = '';
    let tagName = "";
    let xmlTagMeta = {
        tagName: "",
        attributes: {}
    };

    if (findAllByAttribute("title", "Overview", domNode).length != 0) {
        doc_objectives = findAllByAttribute("title", "Overview", domNode)[0].textContent;
        tagName = findAllByAttribute("title", "Overview", domNode)[0].tagName;
    }

    if (findAllByTagName("Overview", domNode).length != 0) {
        findAllByTagName("Overview", domNode)[0].childNodes.forEach(child => {
            if (child.nodeType == Node.TEXT_NODE) {
                doc_objectives += child.textContent;
            } else if (child.nodeType == Node.ELEMENT_NODE) {
                if (child.tagName.toLowerCase() == "xref") {
                    doc_objectives += ` ${escapeXmlTags(getNodeContent(child))}`;
                }
            }
        });

        tagName = findAllByTagName("Overview", domNode)[0].tagName;
    }

    if (findAllByTagName("Objectives_of_Document", domNode).length != 0) {
        doc_objectives = findAllByTagName("Objectives_of_Document", domNode)[0].textContent;
        tagName = findAllByTagName("Objectives_of_Document", domNode)[0].tagName;
    }

    if (docObjectiveSection != null) {
        doc_objectives = parseRichTextChildren(docObjectiveSection);
    }


    xmlTagMeta.tagName = tagName;

    return { doc_objectives, xmlTagMeta };
}


/**
 * @param {*} domNode
 */
export const getCompliantTOE = (domNode) => {
    // tag structure varies from xml to xml...
    let toeSection = null;
    let toe_overview = '';
    let toe_boundary = '';
    let toe_platform = '';

    // All variations of TOE overview tags
    if (findAllByAttribute("id", "TOEdescription", domNode).length != 0) {
        toeSection = findAllByAttribute("id", "TOEdescription", domNode)[0];
    }

    if (findAllByAttribute("id", "toeov", domNode).length != 0) {
        toeSection = findAllByAttribute("id", "toeov", domNode)[0];
    }


    if (findAllByAttribute("title", "TOE Overview", domNode).length != 0) {
        toeSection = findAllByAttribute("title", "TOE Overview", domNode)[0];
    }

    if (findAllByTagName("Compliant_Targets_of_Evaluation", domNode).length != 0) {
        toeSection = findAllByTagName("Compliant_Targets_of_Evaluation", domNode)[0];
    }

    if (toeSection != null) {
        toe_overview = parseRichTextChildren(toeSection);

        toeSection.childNodes.forEach(subsection => {
            if (subsection.nodeType == Node.ELEMENT_NODE) {
                if (subsection.tagName.toLowerCase() == "sec:toe_boundary") {
                    toe_boundary = parseRichTextChildren(subsection);
                } else if (subsection.tagName.toLowerCase() == "sec:toe_platform") {
                    toe_platform = parseRichTextChildren(subsection);
                }
            }
        });
    }

    return { toe_overview, toe_boundary, toe_platform };
}


/**
 * 
 * @param {*} domNode
 * Calling this TOE Usage
 */
export const getUseCaseDescription = (domNode) => {
    let use_case_description = '';

    if (findAllByTagName("Use_Cases", domNode).length != 0) {
        use_case_description = parseRichTextChildren(findAllByTagName("Use_Cases", domNode)[0]);
    }

    if (findAllByTagName("TOE_Usage", domNode).length != 0) {
        use_case_description = parseRichTextChildren(findAllByTagName("TOE_Usage", domNode)[0]);
    }

    if (findAllByAttribute("title", "Use Cases", domNode).length != 0) {
        use_case_description = parseRichTextChildren(findAllByAttribute("title", "Use Cases", domNode)[0]);
    }

    return use_case_description;
}


/**
 * 
 * @param {*} domNode 
 */
export const getUseCases = (domNode) => {
    let useCases = null;

    if (findAllByTagName('usecases', domNode).length != 0) {
        useCases = findAllByTagName('usecases', domNode)[0];
    }

    if (useCases) {
        let useCaseArray = new Array();

        for (let useCase of useCases.childNodes) {
            if (useCase.nodeType == Node.ELEMENT_NODE && useCase.tagName.toLowerCase() == "usecase") {
                let description = findAllByTagName('description', useCase)[0].textContent;
                let name = useCase.getAttribute("title") ? useCase.getAttribute("title") : "";
                let id = useCase.getAttribute("id") ? useCase.getAttribute("id") : "";
                let config = findAllByTagName('config', useCase);
                let configXML = '';

                if (config.length != 0) {
                    configXML = `<config>${getNodeContentWithTags(config[0])}</config>`;
                }

                useCaseArray.push({
                    name: name,
                    description: description,
                    id: id,
                    metaData: { configXML },
                    xmlTagMeta: {
                        tagName: "usecase",
                        attributes: {
                            title: name,
                            id: useCase.getAttribute("id") ? useCase.getAttribute("id") : ""
                        }
                    },
                });
            }
        }

        return useCaseArray;
    }
}


/**
 * 
 * @param {*} domNode
 * This section doesn't exist in all PP's (noticed in MDF)
 */
export const getDocumentScope = (domNode) => {
    let scope_of_doc = '';

    if (findAllByAttribute("title", "Scope of Document", domNode).length != 0) {
        scope_of_doc = parseRichTextChildren(findAllByAttribute("title", "Scope of Document", domNode)[0]);
    }

    return scope_of_doc;
}


/**
 * 
 * @param {*} domNode
 * This section doesn't exist in all PP's (noticed in MDF)
 */
export const getIndendedReadership = (domNode) => {
    let indended_readership = '';

    if (findAllByAttribute("title", "Intended Readership", domNode).length != 0) {
        indended_readership = parseRichTextChildren(findAllByAttribute("title", "Intended Readership", domNode)[0]);
    }

    return indended_readership;
}


/**
 * 
 * @param {*} domNode 
 */
export const getCClaims = (domNode) => {
    let cclaims = findAllByTagName('cclaims', domNode) || [];

    if (cclaims.length != 0) {
        cclaims = cclaims[0];

        let cclaimArray = new Array();

        for (let cclaim of cclaims.childNodes) {
            if (cclaim.nodeType == Node.ELEMENT_NODE && cclaim.tagName == "cclaim") {
                let description = parseRichTextChildren(findAllByTagName('description', cclaim)[0]);

                cclaimArray.push({
                    name: cclaim.getAttribute("name") ? cclaim.getAttribute("name") : "",
                    description: description,
                    xmlTagMeta: {
                        tagName: "cclaim",
                        attributes: {
                            name: cclaim.getAttribute("name") ? cclaim.getAttribute("name") : ""
                        },

                    },
                });
            }
        }

        return cclaimArray;
    }
    return cclaims;
}



// Constructs HTML by recursively calling getNodeContent
const getNodeContentWithTags = (node) => {
    let content = "";
    for (let childNode of node.childNodes) {
        content += getNodeContent(childNode);
    }
    return content;
}

// Recursively traverses and constructs HTML content for each node
const getNodeContent = (node) => {
    if (node.nodeType == Node.TEXT_NODE) {
        // If text node, return text content
        return node.textContent;
    } else if (node.nodeType == Node.ELEMENT_NODE) {
        // Constructs opening tag with attributes, recursively get content for child nodes
        let content = `<${node.tagName}`;
        for (let attr of node.attributes) {
            content += ` ${attr.name}="${attr.value}"`;
        }
        content += ">";
        for (let childNode of node.childNodes) {
            content += getNodeContent(childNode);
        }
        content += `</${node.tagName}>`;
        return content;
    } else {
        return "";
    }
}





/**
 * 
 * @param {*} domNode 
 */
export const getAppendices = (domNode) => {
    // let sections = findAllMultipleTagNames(['appendix'], domNode);

    let inherent_requirements = findAllByAttribute("id", "satisfiedreqs", domNode)[0].textContent;
    return inherent_requirements;
}


/**
 * 
 * @param {*} domNode 
 */
export const getSARs = (domNode) => {
    let sars = null;

    if (findAllByAttribute("title", "Security Assurance Requirements", domNode).length != 0) {
        sars = getNodeContentWithTags(findAllByAttribute("title", "Security Assurance Requirements", domNode)[0]);
    }

    if (findAllByTagName("Security_Assurance_Requirements", domNode).length != 0) {
        sars = getNodeContentWithTags(findAllByTagName("Security_Assurance_Requirements", domNode)[0]);
    }

    return sars;
}


/**
 * 
 * @param {*} domNode 
 */
export const getImplementations = (domNode) => {
    const implementation_section = findAllByTagName('implements', domNode);
    let implementsXML = null;

    if (implementation_section.length != 0) {
        implementsXML = getNodeContentWithTags(implementation_section[0]);
    }

    return implementsXML;
}



/**
 * 
 * @param {*} domNode 
 */
export const getSFRs = (domNode) => {
    const sfrComponents = findAllByTagName('f-component', domNode);
    let selectableGroupCounter = 0;

    // Platforms (if exists)
    const platformObject = getPlatforms(domNode).platformObj;
    const platformMap = platformObject.platformMap;


    const ppReference = getPPReference(domNode);
    const ppName = ppReference.PPTitle;

    if (sfrComponents.length != 0) {
        let sfrCompArr = new Array();

        for (let component of sfrComponents) {
            const xml_id = component.getAttribute("id") ? component.getAttribute("id") : "";

            let family_name = "";
            let family_id = "";
            let family_description = "";
            let evaluationActivities = {};
            // Selection dependency related
            let isSelBased = component.getAttribute("status") ? component.getAttribute("status") == "sel-based" ? true : false : false;
            let selections = {
                components: [],
                elements: [],
                selections: [],
            }

            let useCaseBased = false;
            let use_cases = [];

            let isOptional = component.getAttribute("status") ? component.getAttribute("status") == "optional" ? true : false : false;

            let extendedComponentDefinition = {
                audit: "",
                componentLeveling: "",
                dependencies: "",
                managementFunction: "",
                toggle: false
            }


            // SFR Class description may just be text in between section header and <f-component> definition
            family_description = parseRichTextChildren(component.parentElement);

            if (component.nodeType == Node.ELEMENT_NODE && component.tagName == "f-component") {
                // Description is in template, not necessarily exists in other PPs
                let sfrDescription = findAllByTagName('description', component);
                if (sfrDescription.length != 0) {
                    sfrDescription = sfrDescription[0].textContent;
                } else {
                    sfrDescription = "";
                }

                // Extended Component Definition
                const ecd_comp_lev_section = findAllByTagName('comp-lev', component);
                if (ecd_comp_lev_section.length != 0) {
                    extendedComponentDefinition.componentLeveling += ecd_comp_lev_section[0].textContent;
                    extendedComponentDefinition.toggle = true;
                }
                const ecd_management_section = findAllByTagName('management', component);
                if (ecd_management_section.length != 0) {
                    extendedComponentDefinition.managementFunction += ecd_management_section[0].textContent;
                    extendedComponentDefinition.toggle = true;
                }
                const ecd_audit = findAllByTagName('audit', component);
                if (ecd_audit.length != 0) {
                    extendedComponentDefinition.audit += ecd_audit[0].textContent;
                    extendedComponentDefinition.toggle = true;
                }
                const ecd_dependencies = findAllByTagName('dependencies', component);
                if (ecd_dependencies.length != 0) {
                    extendedComponentDefinition.dependencies += ecd_dependencies[0].textContent;
                    extendedComponentDefinition.toggle = true;
                }

                // Get selection enabling id
                if (isSelBased) {
                    // Find all dependencies (attributes in xml are totally inconsistent)
                    const dependsAttributes = ['on', 'and', 'on-se1', 'on1', 'on2', 'on3', 'on4', 'on5', 'on-sel', 'also', 'on-incl', 'on-use'];
                    let depends = findAllByTagName("depends", component);

                    if (depends.length != 0) {
                        depends.forEach(depend => {
                            dependsAttributes.forEach(attributeName => {
                                if (depend.getAttribute(attributeName) != null) {
                                    if (attributeName.toLowerCase().includes("on-use")) { // Check if use case dependent
                                        useCaseBased = true;
                                        use_cases.push(depend.getAttribute(attributeName));
                                    } else if (attributeName.toLowerCase().includes("on-incl")) { // Check if component dependent
                                        selections.components.push(depend.getAttribute(attributeName));
                                    } else {
                                        selections.selections.push(depend.getAttribute(attributeName));

                                        // Get element ID from parent node
                                        let parent = getSelDepParents(domNode, depend.getAttribute(attributeName));
                                        selections.elements.push(parent.fElementId);
                                    }
                                }
                            });

                            // Check if depends has additional component type
                            if (depend.childNodes) {
                                depend.childNodes.forEach(child => {
                                    if (child.tagName.toLowerCase() == "optional") {
                                        isOptional = true;
                                    }
                                });
                            }
                        });
                    }
                }


                // Get family information (normally parent to the f-component)
                // TODO: add some validation checking for parent element (not all PP's have section tag)
                if (component.parentElement.tagName == "section") {
                    family_name = component.parentElement.getAttribute("title");
                    family_id = component.parentElement.getAttribute("id").toUpperCase();
                } else if (component.parentElement.tagName.includes("sec:")) {
                    family_name = component.parentElement.getAttribute("title");
                    family_id = component.parentElement.tagName.split(":")[1];
                }


                const sfrElements = findAllByTagName('f-element', component);
                let allSFRElements = {}; // contains multiple sfrElement's

                // Get Iteration data
                let iteration_id = component.getAttribute("iteration");
                if (iteration_id) {
                    iteration_id = `_${component.getAttribute("iteration")}`;
                } else {
                    iteration_id = '';
                }

                let elem_counter = 0; // used to build element name
                for (const element of sfrElements) {
                    let selectable_id = 0; // counter for assigning id's to selectable which has no id
                    let sfrContent = []; // text content in SFR
                    let sfrElemUUID = uuidv4();

                    // Dynamincally create element name (XML has random id's)
                    let elementName = `${component.getAttribute("cc-id")}.${++elem_counter}${iteration_id}`; // eg. fcs_ckm.1.1
                    // XMLID is used for looking up UUID
                    let elementXMLID = element.getAttribute("id") ? element.getAttribute("id") : "";

                    // selectables, title, content etc.
                    let sfrElementMeta = {};
                    sfrElementMeta["elementXMLID"] = elementXMLID;
                    let allSelectables = {};
                    let selectableGroups = {};

                    // Parse through title tag
                    const titleTag = findAllByTagName('title', element)[0];

                    // TEMP logic for management function tables
                    // mdf -> cc - id="fmt_smf.1"
                    // gpos -> cc - id="fmt_smf_ext.1"
                    // gpcp -> cc - id="fmt_smf.1"
                    if (((ppName.toLowerCase() == "mobile device fundamentals" ||
                        ppName.toLowerCase() == "protection profile for general-purpose computing platforms") &&
                        component.getAttribute("cc-id").toLowerCase() == "fmt_smf.1") || (ppName.toLowerCase() == "protection profile for general purpose operating systems" && component.getAttribute("cc-id").toLowerCase() == "fmt_smf_ext.1")) {

                        sfrContent = [];
                        sfrContent.push({
                            'description': `${escapeXmlTags('<!-- NOTE: There is currently no support for Management Function tables, so the following raw XML will be used in the XML Export -->')} <br/>
                        ${escapeXmlTags(getNodeContentWithTags(titleTag))}`});

                        sfrElementMeta["title"] = sfrContent;
                        // Store all meta for the SFR element
                        allSFRElements[sfrElemUUID] = sfrElementMeta;

                        // continue; // move onto next element
                    }

                    // Parse title tag
                    const style_tags = ["ol", "ul", "li", "refinement", "b", "i", "s", "snip", "strike", "p", "sup", "pre", "code", "h3"];
                    for (const child of titleTag.childNodes) {
                        // Skip comments
                        if (child.nodeType == Node.COMMENT_NODE) {
                            continue
                        }

                        switch (child.nodeType) {
                            case Node.ELEMENT_NODE:
                                if (child.tagName == "selectables") {
                                    const result = processSelectables(child, selectable_id, selectableGroupCounter, component, elementName);
                                    selectable_id = result.lastSelectableId;
                                    selectableGroupCounter = result.lastGroupCounter;

                                    // Add all the selectables to masterlist; using Object.assign to prevent/preserve existing data
                                    Object.assign(allSelectables, result.allSelectables)

                                    // Create the groups
                                    selectableGroups = checkNestedGroups(result.group, selectableGroups)

                                    // Selectables are prefaced with text, add this group to the selections which comes after opening text
                                    sfrContent.push({ 'selections': result.group.id })
                                } else if (child.tagName == "assignable") { // standalone assignables
                                    const text = sfrContent.slice(-1)[0];
                                    const uuid = uuidv4();

                                    if ((typeof text == 'object') && (text !== undefined) && (text.hasOwnProperty('text') || text.hasOwnProperty('description'))) {
                                        let id = child.getAttribute("id");
                                        if (id === null) {
                                            id = `${elementName}_${++selectable_id}`;
                                        }

                                        allSelectables[uuid] = {
                                            id: id,
                                            leadingText: "",
                                            description: child.textContent.replace(/[\n\t]/g, ""), // remove tab and new line characters
                                            trailingText: "",
                                            assignment: true,
                                            exclusive: false,
                                            notSelectable: false,
                                        }
                                        sfrContent.push({ 'assignment': uuid });
                                    }
                                } else if (style_tags.includes(child.localName)) {
                                    let tagName = child.localName;

                                    if (tagName == "refinement") {
                                        tagName = "b";
                                    }

                                    let selectableMeta = {
                                        selectable_id,
                                        selectableGroupCounter,
                                        allSelectables,
                                        selectableGroups,
                                        component,
                                        elementName,
                                        is_content_pushed: false,
                                    }

                                    const content = parseRichTextChildren(child, `<${tagName}>`, sfrContent, selectableMeta);

                                    selectable_id = selectableMeta.selectable_id;
                                    selectableGroupCounter = selectableMeta.selectableGroupCounter;
                                    allSelectables = selectableMeta.allSelectables;
                                    selectableGroups = selectableMeta.selectableGroups;

                                    // Aka if there were no selectables
                                    if (!selectableMeta.is_content_pushed || content.length != 0) {
                                        // Check if previous entry is a text entry, so you can concatenate
                                        // else add as a new text section
                                        const lastElement = sfrContent.slice(-1)[0];

                                        if (lastElement && (lastElement.hasOwnProperty("text") || lastElement.hasOwnProperty("description"))) {
                                            let previousText = '';

                                            if (lastElement.hasOwnProperty("text")) {
                                                previousText = lastElement["text"];
                                            } else if (lastElement.hasOwnProperty("description")) {
                                                previousText = lastElement["description"];
                                            }

                                            sfrContent.pop(); // remove entry
                                            sfrContent.push({ 'description': `${previousText} ${content}</${tagName}>` });
                                        } else {
                                            sfrContent.push({ 'description': `${content}</${tagName}>` });
                                        }
                                    } else {
                                        if (["ol", "ul", "li", "refinement", "b", "i", "s", "p",].includes(tagName)) {
                                            sfrContent.push({ 'description': `</${tagName}>` });
                                        }
                                    }

                                    

                                } else if (child.tagName.toLowerCase() == "snip" || child.tagName.toLowerCase() == "xref") {
                                    sfrContent.push({ 'description': `${escapeXmlTags(getNodeContent(child))}` });
                                }

                                break
                            case Node.TEXT_NODE: {
                                // Check if previous entry is a rich text entry, so you can concatenate
                                const lastElement = sfrContent.slice(-1)[0];

                                if (lastElement && lastElement.hasOwnProperty("description")) {
                                    let previousText = lastElement["description"];
                                    sfrContent.pop(); // remove entry
                                    // append as an RTE
                                    sfrContent.push({ 'description': `${previousText}  ${child.textContent.trim().replace(/\s+/g, ' ')}` });
                                } else {
                                    sfrContent.push({ 'text': child.textContent.trim().replace(/\s+/g, ' ') }); // simple text, remove whitespace
                                }

                                break
                            }

                            default:
                                break
                        }
                    }
                    // Beginning of SFR content
                    sfrElementMeta["title"] = sfrContent;

                    // Selectables and group data
                    sfrElementMeta["selectables"] = allSelectables
                    sfrElementMeta["selectableGroups"] = selectableGroups

                    // App note
                    const app_note = findAllByTagName('note', element);
                    let note = ""
                    if (app_note.length != 0 && app_note[0].getAttribute("role").toLowerCase() == "application") {
                        // Handle rich text styling
                        if (app_note[0].childNodes) {
                            note = parseRichTextChildren(app_note[0]);
                        }
                    }
                    sfrElementMeta["note"] = note;


                    // Parse EA if it exists
                    const eActivity = findAllByTagName('aactivity', element);

                    if (eActivity.length != 0) {
                        let eA = {
                            "tss": "",
                            "guidance": "",
                            "testIntroduction": "",
                            "testList": [],
                            "level": "element",
                            "platformMap": platformMap,
                        }

                        // Handle rich text styling
                        if (eActivity[0].childNodes) {
                            eActivity[0].childNodes.forEach(c => {
                                if (c.nodeType == Node.TEXT_NODE) {
                                    eA.introduction = parseRichTextChildren(eActivity[0]);
                                } else if (c.nodeType == Node.ELEMENT_NODE) {
                                    if (c.tagName.toLowerCase() == "tss") {
                                        if (c.childNodes) {
                                            eA.tss = parseRichTextChildren(c).trim();
                                        }
                                    } else if (c.tagName.toLowerCase() == "guidance") {
                                        if (c.childNodes) {
                                            eA.guidance = parseRichTextChildren(c);
                                        }
                                    }
                                    else if (c.tagName.toLowerCase() == "tests" && c.childNodes) {
                                        let contents = parseRichTextChildren(c, "", [], {}, eA);

                                        // For instances without testlist, just add it
                                        let lastElement = eA.testList.slice(-1)[0];
                                        if (lastElement && lastElement.hasOwnProperty("objective") && lastElement["objective"].length == 0) {
                                            eA.testList.push({ description: "", dependencies: [], objective: contents });
                                        }

                                        if (eA.testList.length == 0) {
                                            eA.testIntroduction = contents;
                                        }
                                    }
                                }
                            });
                        }
                        evaluationActivities[sfrElemUUID] = eA
                    }

                    // Store all meta for the SFR element
                    allSFRElements[sfrElemUUID] = sfrElementMeta;
                }

                // Get Audit events (if applicable)
                let audit = {};
                const auditSections = findAllByTagName('audit-event', component);

                if (auditSections.length != 0) {
                    auditSections.forEach(auditSection => {
                        const auditUUID = uuidv4();
                        let auditMeta = {};
                        let auditOptional = false;
                        let audit_items = []

                        if (auditSection.getAttribute("type") && auditSection.getAttribute("type").toLowerCase() == "optional") {
                            auditOptional = true;
                        }

                        // Audit description
                        let audit_description = findAllByTagName('audit-event-descr', auditSection);
                        if (audit_description.length != 0) {
                            let base_description = ''; // audit must have at least 1 description

                            audit_description.forEach(description => {
                                description.childNodes.forEach(child => {
                                    // If audit event description is a selection
                                    if (child.tagName == "selectables") {
                                        // Optional = selection
                                        auditOptional = true;

                                        if (base_description.length != 0) {
                                            audit_items.push({ description: child.textContent });
                                        } else {
                                            // Want direct child, as textContent will concatenate other selectable if it exists (None/No other)
                                            base_description = getDirectTextContent(child.childNodes[0]);
                                            auditMeta["description"] = base_description;
                                        }
                                    }

                                    // If audit event description is text
                                    if (child.nodeType == Node.TEXT_NODE) {
                                        if (base_description.length != 0) {
                                            audit_items.push({ description: child.textContent.replace(/[\n\t]/g, "").replace(/\s+/g, ' ') });
                                        } else {
                                            auditMeta["description"] = child.textContent.replace(/[\n\t]/g, "").replace(/\s+/g, ' ');
                                        }
                                    }
                                });
                            });
                        }

                        // Audit information
                        const audit_info = findAllByTagName('audit-event-info', auditSection);
                        if (audit_info.length != 0) {
                            audit_info.forEach(info => {
                                info.childNodes.forEach(child => {
                                    // If audit event info is a selection
                                    if (child.tagName == "selectables") {
                                        // Optional = selection
                                        audit_items.push({ info: getDirectTextContent(child.childNodes[0]), optional: true });

                                    }

                                    // If audit event info is text
                                    if (child.nodeType == Node.TEXT_NODE) {
                                        audit_items.push({ info: info.textContent, optional: false });
                                    }
                                });
                            })
                        }

                        auditMeta["items"] = audit_items;
                        auditMeta["optional"] = auditOptional;
                        audit[auditUUID] = auditMeta;
                    });
                } // End of audit sections parsing


                sfrCompArr.push({
                    title: component.getAttribute("name"),
                    cc_id: component.getAttribute("cc-id").toUpperCase(),
                    iteration_id: component.getAttribute("iteration"),
                    xml_id: xml_id,
                    definition: sfrDescription,
                    familyDescription: family_description,
                    optional: isOptional,
                    objective: component.getAttribute("status") ? component.getAttribute("status") == "objective" ? true : false : false,
                    selectionBased: isSelBased,
                    family_name: family_name ? family_name : "",
                    family_id: family_id ? family_id : "",
                    elements: allSFRElements,
                    evaluationActivities: evaluationActivities,
                    auditEvents: audit,
                    selections: selections,
                    extendedComponentDefinition: extendedComponentDefinition,
                    tableOpen: true,
                    implementationDependent: component.getAttribute("status") ? component.getAttribute("status") == "feat-based" ? true : false : false,
                    useCaseBased: useCaseBased,
                    useCases: use_cases,
                    // TODO: have not populated following
                    reasons: [],
                });
            }
        }
        return sfrCompArr;
    }
}

/**
 * Retain styling for child elements of a node (non-selectable node -> selectable nodes have their own processing in processSelectables)
 */
function parseRichTextChildren(parent, contents = "", sfrContent = [], selectableMeta = {}, eA = {}) {
    // let prevTextNodeContent = '';

    // Reset flag so that when function is returned, text content can be pushed if it comes at the end of a selctable (which triggers is_content_pushed=true)
    selectableMeta.is_content_pushed = false;

    parent.childNodes.forEach(c => {
        if (c.nodeType == Node.TEXT_NODE) {
            // Escape '<' signs, and pad with surrounding whitespace so that it is not converted to < on export, as transforms will complain since it appears like an unclosed tag
            const pattern = /(?<=\S)\s*<\s*(?=\S)|(?<=\S)<(?=\s)|(?<=\s)<(?=\S)/g;
            // prevTextNodeContent = c.textContent;
            contents += c.textContent.replace(pattern, ' &lt; ');
        } else if (c.nodeType == Node.ELEMENT_NODE) {
            if (c.localName.toLowerCase() == "b" || c.localName.toLowerCase() == "refinement") {
                // TODO: separate refinement tag into own condition after creating blot in quill
                contents += "<b>";
                contents = parseRichTextChildren(c, contents, sfrContent, selectableMeta);
                contents += "</b>";
            } else if (c.localName.toLowerCase() == "a") {
                const href = c.getAttribute("href");
                contents += href ? ` <a href="${href}">${c.textContent}</a>` : ` <a>${c.textContent}</a>`;
            } else if (raw_xml_tags.includes(c.localName.toLowerCase())) {
                // pull in raw xml
                contents += ` ${escapeXmlTags(getNodeContent(c))}`;
            } else if (c.localName.toLowerCase() == 'br') {
                contents += '<br/>'
            } else if (["p", "ol", "ul", "sup", "pre", "s", "code", "i", "h3", "li", "strike"].includes(c.localName.toLowerCase())) {
                contents += `<${c.localName}>`;
                contents = parseRichTextChildren(c, contents, sfrContent, selectableMeta);
                contents += `</${c.localName}>`;
            } else if (c.localName.toLowerCase() == "div") {
                if (parent.tagName.toLowerCase() == "tests") { // platforms or selections (selectable)
                    // Set the Tests description
                    eA.testIntroduction = contents;

                    const depends = findAllByTagName("depends", c);
                    let dependency = '';

                    if (depends.length != 0) {
                        if (depends[0].hasAttribute("ref")) { // if its a platform
                            dependency = eA.platformMap[depends[0].getAttribute("ref")];
                            eA.testList.push({ description: "", tests: [{ dependencies: [dependency], objective: parseRichTextChildren(c) }] });

                        } else { // should be a selection
                            dependency = depends[0].getAttribute("on") ? depends[0].getAttribute("on") : "";

                            eA.testList.push({ description: "", tests: [{ dependencies: [dependency], objective: parseRichTextChildren(c) }] });
                        }
                    }
                } else {
                    contents += "<div>";
                    contents = parseRichTextChildren(c, contents, sfrContent, selectableMeta);
                    contents += "</div>";
                }
            } else if (c.tagName.toLowerCase() == "selectables") { // these are nested selectables
                const lastElement = sfrContent.slice(-1)[0];

                // Check if previous content is text, append if so (for selectables, text needs to be pushed before the selectables)
                if (lastElement && (lastElement.hasOwnProperty("text") || lastElement.hasOwnProperty("description"))) {
                    let previousText = '';

                    if (lastElement.hasOwnProperty("text")) {
                        previousText = lastElement["text"];
                    } else if (lastElement.hasOwnProperty("description")) {
                        previousText = lastElement["description"];
                    }

                    sfrContent.pop(); // remove entry
                    sfrContent.push({ 'description': `${previousText}  ${contents}` });
                } else {
                    sfrContent.push({ 'description': contents });
                }

                // Reset the contents buffer so that text doesn't repeat on next iteration
                contents = '';

                const result = processSelectables(c, selectableMeta.selectable_id, selectableMeta.selectableGroupCounter, selectableMeta.component, selectableMeta.elementName);
                selectableMeta.selectable_id = result.lastSelectableId;
                selectableMeta.selectableGroupCounter = result.lastGroupCounter;

                // Add all the selectables to masterlist; using Object.assign to prevent/preserve existing data
                Object.assign(selectableMeta.allSelectables, result.allSelectables);

                // Create the groups
                selectableMeta.selectableGroups = checkNestedGroups(result.group, selectableMeta.selectableGroups);

                sfrContent.push({ 'selections': result.group.id });

                selectableMeta.is_content_pushed = true;
            } else if (c.tagName.toLowerCase() == 'assignable') {
                const lastElement = sfrContent.slice(-1)[0];
                const uuid = uuidv4();

                let id = c.getAttribute("id");
                if (id === null) {
                    id = `${selectableMeta.elementName}_${++selectableMeta.selectable_id}`;
                }

                selectableMeta.allSelectables[uuid] = {
                    id: id,
                    leadingText: "",
                    description: c.textContent.replace(/[\n\t]/g, ""), // remove tab and new line characters
                    trailingText: "",
                    assignment: true,
                    exclusive: false,
                    notSelectable: false,
                }

                // Append any previous text before adding the assignment
                if (lastElement && (lastElement.hasOwnProperty("text") || lastElement.hasOwnProperty("description"))) {
                    let previousText = '';

                    if (lastElement.hasOwnProperty("text")) {
                        previousText = lastElement["text"];
                    } else if (lastElement.hasOwnProperty("description")) {
                        previousText = lastElement["description"];
                    }

                    sfrContent.pop(); // remove entry
                    sfrContent.push({ 'description': `${previousText}  ${contents}` });
                } else {
                    sfrContent.push({ 'description': contents });
                }

                // Reset the contents buffer so that text doesn't repeat on next iteration
                contents = '';

                // Add the assignment
                sfrContent.push({ 'assignment': uuid });
            } else if (c.tagName.toLowerCase() == "testlist") {
                // TODO: In phase 2, need to nail down tests, as source XML is extremely unorganized
                if (c.parentNode.localName.toLowerCase() == "p" || c.parentNode.localName.toLowerCase() == "div") { // Nested testlist - just throw in xml for now
                    contents += `<br/> ${escapeXmlTags(getNodeContent(c))}`;
                } else { // Normal testlist, not nested
                    // Set the Tests description only if it hasn't been set (don't want to overwrite with additional text that may exist
                    // in later nodes - in the case of multiple testlist)
                    if (eA.testIntroduction != null && eA.testIntroduction.length == 0) {
                        // Hacky way of doing this right now since there is no tag around test list titles, so the title of the testlist
                        // gets appended with this recursive function, so we want to essentially remove it before setting the intro test text
                        // TODO: revisit later, can't rely on last text preceding the testlist (eg. FCS_CKM_EXT.4 in MDF)
                        // eA.testIntroduction = contents.replace(prevTextNodeContent, "");
                        // eA.testIntroduction = contents;
                        // contents = ""; // Reset buffer
                    }

                    if (eA.testList == undefined) {
                        eA.testList = [];
                    }

                    // Check if the preceding element is a text node, set it as the description(title) of the Testlist
                    let precedingText = '';

                    const children = c.parentElement.childNodes;
                    for (let i = 0; i < children.length; i++) {
                        if (children[i] == c && i > 0) {
                            if (children[i - 1].nodeType == Node.TEXT_NODE) {
                                precedingText = children[i - 1].textContent;
                                break;
                            }
                        }
                    }

                    let tests = [];
                    c.childNodes.forEach(test => {
                        if (test.nodeType == Node.ELEMENT_NODE && test.tagName == "test") {
                            let testContent = parseRichTextChildren(test, "", sfrContent, selectableMeta);
                            tests.push({ dependencies: [], objective: testContent });
                        }
                    });
                    eA.testList.push({ description: precedingText, tests: tests });
                }



            }
        }
    });

    return contents;
}

// Create groups for complex selecatable
function checkNestedGroups(currentGroup, selectableGroups, subgroup = 0) {
    // Initialize the structure for the current group if it doesn't exist
    if (!selectableGroups[currentGroup.id]) {
        selectableGroups[currentGroup.id] = {
            onlyOne: currentGroup.onlyOne,
            groups: [], // in UI will store UUID of selectable or name of selectables group
        };
    }

    // Process each selectable in the current group
    // console.log(currentGroup.selectables);
    // console.log(currentGroup);
    // console.log(selectableGroups);
    // Only iterate if type is selectable(s)
    if (currentGroup.type == "selectable" || currentGroup.type == "selectables") {

        currentGroup.selectables.forEach(selectable => {
            // Don't want to add selectable to the group if it has children (complex selectable)
            if (selectable.nestedGroups.length == 0) {
                // Add the selectable's uuid to the groups list of the current group
                selectableGroups[currentGroup.id].groups.push(selectable.uuid);
            } else {
                // If this selectable has nested groups, process them
                var subgroupName = selectable.id ? selectable.id : `${currentGroup.id}_${++subgroup}`;

                // initialization
                if (!selectableGroups[subgroupName]) {
                    selectableGroups[subgroupName] = {
                        description: [],
                        exclusive: selectable.exclusive,
                        notSelectable: false,
                    }
                }

                // Add beginning text part of selectable (only if there is something, eg. selectable with just an assignable wil have no description text)
                if (selectable.description.length != 0) {
                    selectableGroups[subgroupName].description.push({ 'text': selectable.description.replace(/\s+/g, ' ') })
                }

                selectable.nestedGroups.forEach(group => {
                    /*
                    Nested group structure
                    nested-group-name: {
                        description: [{text: "blah"}, {groups: [assignable_uuid/selectableuuid]}];
                        exclusive:
                        notSectable:
                    }
                    */

                    if (group.type == "assignable") {
                        if (selectable.description.length != 0) {
                            // Create a complex selectable only if there is more than just an assignment as part of the selectable
                            selectableGroups[subgroupName].description.push({ 'groups': [group.uuid] });
                        } else {
                            // Add the assignment as a regular child to the selectables group
                            selectableGroups[currentGroup.id].groups.push(group.uuid);
                        }
                    } else if (group.type == "text") {
                        // Append to previous text if exists
                        const lastElement = selectableGroups[subgroupName].description.slice(-1)[0];
                        const text = group.content.replace(/\s+/g, ' ');

                        if (lastElement && lastElement.hasOwnProperty("text")) {
                            let previousText = '';

                            previousText = lastElement["text"];


                            selectableGroups[subgroupName].description.pop(); // remove entry
                            selectableGroups[subgroupName].description.push({ 'text': `${previousText} ${text}` });
                        } else {
                            selectableGroups[subgroupName].description.push({ 'text': text });
                        }
                    } else if (group.type == "selectables") {
                        // Add group as child to parent group
                        selectableGroups[subgroupName].description.push({ 'groups': [group.id] });

                        // Initialize the structure for the current group if it doesn't exist
                        if (!selectableGroups[group.id]) {
                            selectableGroups[group.id] = {
                                onlyOne: currentGroup.onlyOne,
                                groups: [], // in UI will store UUID of selectable or name of selectables group
                            };
                        }

                        // Recursively go through selectables
                        checkNestedGroups(group, selectableGroups, subgroup);

                        // If selectable is complex, store the id, else store the uuid
                        selectableGroups[group.id].groups = group.selectables.map(sel => {
                            return sel.nestedGroups.length > 0 ? sel.id : sel.uuid;
                        });
                    }
                });

                // Only care about the group if it has entries in the description array (eg. selectable with one assignable will
                // be treated as just a selectable not a complex one)
                if (selectableGroups[subgroupName].description.length != 0) {
                    selectableGroups[currentGroup.id].groups.push(subgroupName);
                } else {
                    delete selectableGroups[subgroupName];
                }
            }
        });
    }

    return selectableGroups;
}



/**
 * Parse through <selectables> tag
 * @param {*} node 
 * @param {*} selectable_id 
 * @param {*} selectableGroupCounter 
 * @param {*} component 
 * @param {*} elementName 
 * @returns 
 */
function processSelectables(node, selectable_id, selectableGroupCounter, component, elementName) {
    let topLevelGroup = {
        id: `group-${++selectableGroupCounter}`,
        exclusive: node.getAttribute("exclusive") == "yes",
        onlyOne: node.getAttribute("onlyone") == "yes",
        selectables: [],
        type: "selectables",
    };

    let allSelectables = {};
    let lastSelectableId = selectable_id;

    /**
     * 
     * @param {*} selectable_node : node to parse
     * @param {*} context : values to be persisted through recursion
     * @returns 
     */
    function parseChildren(selectable_node, context) {
        selectable_node.childNodes.forEach((c) => {
            if (c.nodeType == Node.TEXT_NODE) {
                context.contents += c.textContent;
            } else if (c.nodeType == Node.ELEMENT_NODE) {
                if (c.tagName.toLowerCase() == 'selectables') {
                    // Handle initial text for description or subsequent text as a separate group
                    if (!context.descriptionSet) {
                        context.description = context.contents; // Populate description with the initial text
                        context.descriptionSet = true;
                    } else {
                        // Subsequent text is treated as a separate entity in nestedGroups
                        context.nestedGroups.push({ type: 'text', content: context.contents });
                    }
                    context.contents = ''; // Reset the contents buffer

                    selectableGroupCounter++;
                    let nestedGroupResult = processSelectables(c, lastSelectableId, selectableGroupCounter, component, elementName);
                    lastSelectableId = nestedGroupResult.lastSelectableId;
                    selectableGroupCounter = nestedGroupResult.lastGroupCounter;
                    context.nestedGroups.push(nestedGroupResult.group);
                } else if (c.tagName.toLowerCase() == 'assignable') {
                    // Handle initial text for description or subsequent text as a separate group
                    if (!context.descriptionSet) {
                        context.description = context.contents; // Populate description with the initial text
                        context.descriptionSet = true;
                    } else {
                        // Subsequent text is treated as a separate entity in nestedGroups
                        context.nestedGroups.push({ type: 'text', content: context.contents });
                    }
                    context.contents = ''; // Reset the contents buffer

                    let assignableContent = getDirectTextContent(c).replace(/[\n\t]/g, "");
                    context.nestedGroups.push({ type: 'assignable', uuid: uuidv4(), content: assignableContent, id: `${elementName}_${++lastSelectableId}` });
                } else {
                    if (["b", "refinement"].includes(c.localName.toLowerCase())) {
                        context.contents += '<b>';
                        parseChildren(c, context);
                        context.contents += '</b>';
                    } else if (["ul", "i", "li"].includes(c.localName.toLowerCase())) {
                        context.contents += `<${c.localName}>`;
                        parseChildren(c, context);
                        context.contents += `</${c.localName}>`;
                    } else if (raw_xml_tags.includes(c.localName.toLowerCase())) {
                        // pull in raw xml
                        context.contents += ` ${getNodeContent(c)}`;
                    } else if (c.localName.toLowerCase() == "a") {
                        const href = c.getAttribute("href");
                        context.contents += href ? ` <a href="${href}">${c.textContent}</a>` : ` <a>${c.textContent}</a>`;
                    }
                }
            }
        });
    }

    // Process each <selectable> node
    findDirectChildrenByTagName('selectable', node).forEach((selectableNode) => {
        const uuid = uuidv4();
        let id = selectableNode.getAttribute("id") || `${elementName}_${++lastSelectableId}`;
        let exclusive = selectableNode.getAttribute("exclusive") == "yes";
        let context = {
            description: "", // For the initial direct child text
            nestedGroups: [],
            descriptionSet: false, // Flag to track if the description is already populated
            contents: ""
        };

        parseChildren(selectableNode, context);

        if (context.contents.length != 0) {
            // Handle initial text for description or subsequent text as a separate group
            if (!context.descriptionSet) {
                context.description = context.contents; // Populate description with the initial text
                context.descriptionSet = true;
            } else {
                // Subsequent text is treated as a separate entity in nestedGroups
                context.nestedGroups.push({ type: 'text', content: context.contents });
            }
        }


        // Prepare the selectable entry with its description and nested groups
        let selectableEntry = {
            type: "selectable",
            uuid,
            id,
            description: context.description,
            exclusive,
            nestedGroups: context.nestedGroups,
        };

        topLevelGroup.selectables.push(selectableEntry);

        // Check if there are any nested selectables or assignable - if there are not, then it is just
        // styling tags so it doesn't need to be a complex selectable
        if (selectableEntry.nestedGroups.length != 0 && !selectableEntry.nestedGroups.some(e => e.type == 'selectables' || e.type == 'assignable')) {
            selectableEntry.nestedGroups.forEach(entry => {
                selectableEntry.description = selectableEntry.description + entry.content;
            });

            selectableEntry.nestedGroups = []; // Clear it out since all data has been added to the description field
        }

        // Only want to add 'simple' selectable + assignments which don't have complex nested children
        if (selectableEntry.nestedGroups.length == 0) {
            allSelectables[uuid] = selectableEntry;
        } else { // Pick out lowest level children (assignable + selectable) if it is a complex selectable
            // The parent selectable itself will be constructed in the post-processing checkNestedGroups
            const result = traverseSelectable(selectableEntry, allSelectables, id);
            allSelectables = result.allSelectables;
        }
    });

    return {
        group: topLevelGroup,
        allSelectables,
        lastSelectableId,
        lastGroupCounter: selectableGroupCounter,
    };
}


// Parse through selectable to get lowest layer child
function traverseSelectable(selectable, allSelectables, id) {
    let lastSelectableId = id;

    if (selectable.nestedGroups.length > 0) {
        selectable.nestedGroups.forEach(item => {
            if (item.type == "assignable") {
                allSelectables[item.uuid] = item;

                allSelectables[item.uuid] = {
                    id: item.id,
                    description: item.content,
                    assignment: true,
                    exclusive: false,
                    notSelectable: false,
                }
            } else if (item.type == "selectables") {
                item.selectables.forEach(selectable_child => {
                    traverseSelectable(selectable_child, allSelectables, lastSelectableId)
                })
            }
        })
    } else {
        allSelectables[selectable.uuid] = selectable;
    }

    return {
        allSelectables,
        lastSelectableId,
    };
}


function findDirectChildrenByTagName(tagName, parentNode) {
    let result = [];
    parentNode.childNodes.forEach((child) => {
        if (child.nodeType == Node.ELEMENT_NODE && child.tagName.toLowerCase() == tagName) {
            result.push(child);
        }
    });
    return result;
}


// Get first positional piece of text content of a node
function getDirectTextContent(node) {
    let textContent = "";

    node.childNodes.forEach((child) => {
        if (child.nodeType == Node.TEXT_NODE) {
            textContent += child.textContent + " ";
        }
    });
    return textContent;
}


// Get component and element IDs for a given selectable ID (used for selection dependent components)
function getSelDepParents(xmlComp, selectableId) {
    // Find the selectable with the given ID
    let selectables = findAllByAttribute('id', selectableId, xmlComp);

    let fElementId = null;
    let fComponentId = null;

    if (selectables.length > 0) {
        let selectable = selectables[0];

        // Traverse up to find the closest f-element and f-component
        let current = selectable;

        while (current) {
            if (current.nodeName == 'f-element' && !fElementId) {
                fElementId = current.getAttribute('id');
            }
            if (current.nodeName == 'f-component') {
                fComponentId = current.getAttribute('cc-id') || current.getAttribute('id');
                break;
            }
            current = current.parentNode; // Move up in the DOM tree
        }

        return { fComponentId, fElementId };
    }

    return { fComponentId, fElementId };
}



// Get UUID of a selectable (for selection dependent SFRs)
export function getUUID(slice, id, type) {
    // Iterate through families
    for (const familyUUID in slice) {
        const family = slice[familyUUID];

        // Iterate through all components in the parent
        for (const componentUUID in family) {
            const component = family[componentUUID];

            if (type == "component" && component.xml_id == id) {
                return componentUUID;
            }

            // Check if component has elements
            if (component.elements) {
                for (const elementUUID in component.elements) {
                    const element = component.elements[elementUUID];

                    if (element.elementXMLID == id && type == "element") {
                        return elementUUID;
                    }

                    // Check if element has selectables
                    if (element.selectables) {
                        for (const selectableUUID in element.selectables) {
                            const selectable = element.selectables[selectableUUID];

                            if (selectable.id == id && type == "selectable") {
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
 * 
 * @param {*} content: Xml string to escape 
 * @returns 
 */
function escapeXmlTags(content) {
    // escape all XML tags so that they can be represented as strings in the Quill editor
    return content.replace(/<([^>]+)>/g, (match, tagContent) => `&lt;${tagContent}&gt;`);
}


/**
 * 
 * @param {*} domNode 
 */
export const getBibliography = (domNode) => {
    let bibObj = {
        "entries": [],
    };

    if (findAllByTagName("bibliography", domNode).length != 0) {
        // Iterate through children
        findAllByTagName("bibliography", domNode)[0].childNodes.forEach(child => {
            if (child.nodeType == Node.ELEMENT_NODE)  {
                if (child.nodeName.toLowerCase() == "cc-entry") {
                    // TODO: not sure what cc-entry tag structure is at the moment
                } else if (child.nodeName.toLowerCase() == "entry") {
                    let entry = {};
                    entry["id"] = child.id;

                    // Iterate through entry
                    child.childNodes.forEach(entryChild => {
                        if (entryChild.nodeType == Node.ELEMENT_NODE) {
                            if (entryChild.nodeName == "tag") {
                                entry["tag"] = entryChild.textContent;
                            } else if (entryChild.nodeName == "description") {
                                entry["description"] = parseRichTextChildren(entryChild);
                            }
                        }
                    });

                    bibObj.entries.push(entry)
                }
            }
        });
    }

    return bibObj;
}


/**
 * 
 * @param {*} domNode 
 */
export const getEntropyAppendix = (domNode) => {
    let entropyAppendix = null;
    let xmlTagMeta = {
        tagName: "appendix",
        attributes: {}
    };

    if (findAllByAttribute("title", "Entropy Documentation and Assessment", domNode).length !== 0) {
        entropyAppendix = findAllByAttribute("title", "Entropy Documentation and Assessment", domNode)[0];
    }

    if (findAllByAttribute("id", "entropy", domNode).length !== 0) {
        entropyAppendix = findAllByAttribute("id", "entropy", domNode)[0];
    }

    // Set the attributes
    if (entropyAppendix) {
        entropyAppendix.attributes.forEach(attr => {
            xmlTagMeta.attributes[attr.name] = attr.value;
        });

        entropyAppendix = getNodeContentWithTags(entropyAppendix);
    }

    return {entropyAppendix, xmlTagMeta};
}

/**
 * 
 * @param {*} domNode 
 */
export const getEquivGuidelinesAppendix = (domNode) => {
    let guidelinesAppendix = null;
    let xmlTagMeta = {
        tagName: "appendix",
        attributes: {}
    };

    if (findAllByAttribute("title", "Equivalency Guidelines", domNode).length !== 0) {
        guidelinesAppendix = findAllByAttribute("title", "Equivalency Guidelines", domNode)[0];
    }

    if (findAllByAttribute("title", "Application Software Equivalency Guidelines", domNode).length !== 0) {
        guidelinesAppendix = findAllByAttribute("title", "Application Software Equivalency Guidelines", domNode)[0];
    }

    if (findAllByAttribute("id", "equiv", domNode).length !== 0) {
        guidelinesAppendix = findAllByAttribute("id", "equiv", domNode)[0];
    }

    // Set the attributes
    if (guidelinesAppendix) {
        guidelinesAppendix.attributes.forEach(attr => {
            xmlTagMeta.attributes[attr.name] = attr.value;
        });

        guidelinesAppendix = getNodeContentWithTags(guidelinesAppendix);
    }
    
    return {guidelinesAppendix, xmlTagMeta};
}

/**
 *
 * @param {*} domNode
 */
export const getSatisfiedReqsAppendix = (domNode) => {
    let satisfiedReqsAppendix = null;
    let xmlTagMeta = {
        tagName: "appendix",
        attributes: {}
    };

    if (findAllByAttribute("title", "Implicitly Satisfied Requirements", domNode).length !== 0) {
        satisfiedReqsAppendix = findAllByAttribute("title", "Implicitly Satisfied Requirements", domNode)[0];
    }

    if (findAllByAttribute("id", "satisfiedreqs", domNode).length !== 0) {
        satisfiedReqsAppendix = findAllByAttribute("id", "satisfiedreqs", domNode)[0];
    }

    // Set the attributes
    if (satisfiedReqsAppendix) {
        satisfiedReqsAppendix.attributes.forEach(attr => {
            xmlTagMeta.attributes[attr.name] = attr.value;
        });

        satisfiedReqsAppendix = getNodeContentWithTags(satisfiedReqsAppendix);
    }

    return {satisfiedReqsAppendix, xmlTagMeta};
}

/**
 *
 * @param {*} domNode
 */
export const getValidationGuidelinesAppendix = (domNode) => {
    let valGuideAppendix = null;
    let xmlTagMeta = {
        tagName: "appendix",
        attributes: {}
    };

    if (findAllByAttribute("title", "Validation Guidelines", domNode).length !== 0) {
        valGuideAppendix = findAllByAttribute("title", "Validation Guidelines", domNode)[0];
    }

    // Set the attributes
    if (valGuideAppendix) {
        valGuideAppendix.attributes.forEach(attr => {
            xmlTagMeta.attributes[attr.name] = attr.value;
        });

        valGuideAppendix = getNodeContentWithTags(valGuideAppendix);
    }

    return {valGuideAppendix, xmlTagMeta};
}


/**
 *
 * @param {*} domNode
 */
export const getVectorAppendix = (domNode) => {
    let vectorReqsAppendix = null;
    let xmlTagMeta = {
        tagName: "appendix",
        attributes: {}
    };

    if (findAllByAttribute("title", "Initialization Vector Requirements for NIST-Approved Cipher Modes", domNode).length !== 0) {
        vectorReqsAppendix = findAllByAttribute("title", "Initialization Vector Requirements for NIST-Approved Cipher Modes", domNode)[0];
    }

    // Set the attributes
    if (vectorReqsAppendix) {
        vectorReqsAppendix.attributes.forEach(attr => {
            xmlTagMeta.attributes[attr.name] = attr.value;
        });

        vectorReqsAppendix = getNodeContentWithTags(vectorReqsAppendix);
    }

    return {vectorReqsAppendix, xmlTagMeta};
}

/**
 *
 * @param {*} domNode
 */
export const getAcknowledgementsAppendix = (domNode) => {
    let acknowledgementsReqsAppendix = null;
    let xmlTagMeta = {
        tagName: "appendix",
        attributes: {}
    };

    if (findAllByAttribute("title", "Acknowledgments", domNode).length !== 0) {
        acknowledgementsReqsAppendix = findAllByAttribute("title", "Acknowledgments", domNode)[0];
    }

    // Set the attributes
    if (acknowledgementsReqsAppendix) {
        acknowledgementsReqsAppendix.attributes.forEach(attr => {
            xmlTagMeta.attributes[attr.name] = attr.value;
        });

        acknowledgementsReqsAppendix = getNodeContentWithTags(acknowledgementsReqsAppendix);
    }

    return {acknowledgementsReqsAppendix, xmlTagMeta};
}