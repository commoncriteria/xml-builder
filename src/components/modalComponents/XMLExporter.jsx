import Modal from "./Modal";
import PropTypes from "prop-types";
import { Button, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
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
    SET_MODULES
} from "../../reducers/exportSlice";
import { create } from "xmlbuilder2";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import XMLViewer from "react-xml-viewer";

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
    const style = { primary: "#d926a9", secondary: "#1FB2A6", linkText: "#7c3aed" }
    const stateObject = useSelector((state) => state);
    const overallObject = useSelector((state) => state.exports.overallObject);
    const formattedXML = useSelector((state) => state.exports.formattedXML);
    const dispatch = useDispatch();
    const [fileName, setFileName] = useState("download");
    const previousStateObject = usePrevious(stateObject)
    const previousOverallObject = usePrevious(overallObject)
    const TESTING = false;

    // Use Effects
    useEffect(() => {
        if (JSON.stringify(previousOverallObject) !== JSON.stringify(overallObject) && (open || preview)) {
            exportXML();
        }
    }, [overallObject]);
    useEffect(() => {
        if (JSON.stringify(previousStateObject) !== JSON.stringify(stateObject) && preview) {
            generateFormattedJSON()
        }
    }, [stateObject])

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

        // search through object to find the relevant terms lists
        const techTerms = terms.find((group) => group.title == "Technical Terms");
        const useCases = terms.find((group) => group.title == "Use Cases");
        dispatch(SET_TECH_TERMS({ techTerms: techTerms }));
        dispatch(SET_USE_CASES({ useCases: useCases }));
        return useCases
    };

    const getSecurityProblemDefinitionSection = () => {
        const securityProblemDefinition = stateObject.threats.securityProblemDefinition
        const threatsSlice = Object.values(stateObject.threats);
        const objectivesSlice = Object.values(stateObject.objectives)

        // Search through object to find the relevant lists
        const threats = threatsSlice.find((group) => group.title == "Threats");
        const assumptions = threatsSlice.find((group) => group.title == "Assumptions");
        const objectiveTerms = getObjectiveTerms(objectivesSlice);
        dispatch(SET_SECURITY_PROBLEM_DEFINITION_SECTION({
            securityProblemDefinition: securityProblemDefinition,
            threats: threats,
            assumptions: assumptions,
            objectiveTerms: objectiveTerms
        }));
        return objectiveTerms
    };
    const getSecurityObjectives = (objectiveTerms) => {
        const sfrSlice = Object.values(stateObject.sfrSections);
        const objectivesSlice = Object.values(stateObject.objectives)
        const toe = objectivesSlice.find((group) => group.title == "Security Objectives for the TOE");
        const operationalEnvironment = objectivesSlice.find((group) => group.title == "Security Objectives for the Operational Environment");
        const objectivesToSFRs = getObjectivesToSFRs(objectiveTerms, sfrSlice)
        dispatch(SET_SECURITY_OBJECTIVES_SECTION({
            toe: toe,
            operationalEnvironment: operationalEnvironment,
            objectivesToSFRs: objectivesToSFRs
        }))
    };

    const getObjectivesToSFRs = (objectiveTerms, sfrs) => {
        let objectivesToSFRs = {}
        if (sfrs) {
            Object.values(sfrs).forEach((sfr) => {
                Object.values(sfr).forEach((sfrSection) => {
                    const { cc_id, iteration_id, objectives } = sfrSection
                    const sfr_name = `${cc_id}${iteration_id && iteration_id !== "" ? "/" + iteration_id : ""}`
                    const objectivesValid = (objectives && objectives.length > 0)
                    if (objectivesValid) {
                        objectives.forEach((objective) => {
                            const objectiveUUID = objective.uuid
                            const rationale = objective.rationale ? objective.rationale : ""
                            const item = { sfr_name: sfr_name, rationale: rationale }
                            if (objectiveUUID) {
                                if (!objectivesToSFRs.hasOwnProperty(objectiveUUID)) {
                                    objectivesToSFRs[objectiveUUID] = []
                                }
                                if (!objectivesToSFRs[objectiveUUID].includes(item)) {
                                    objectivesToSFRs[objectiveUUID].push(item)
                                }
                            }
                        })
                    }
                })
            })
        }
        return objectivesToSFRs
    }

    const getObjectiveTerms = (objectivesSlice) => {
        let objectives = {}
        if (objectivesSlice && Object.keys(objectivesSlice).length > 0) {
            Object.values(objectivesSlice).map((section) => {
                let terms = section.terms
                if (terms && Object.keys(terms).length > 0) {
                    Object.assign(objectives, terms)
                }
            })
        }
        return objectives
    }

    const getMetaData = () => {
        const metaData = stateObject.accordionPane.metadata;
        dispatch(SET_META_DATA({ metaData: metaData }));
    };

    const getSliceInfo = (uuid, contentType) => {

        // Use the UUID to go into the right slice to fetch our info
        const { editors, threats, objectives } = stateObject

        // TODO: Make the content types more consistent in name
        // const result = stateObject[contentType + "s"][uuid]
        switch (contentType) {
            case "editor":
                return editors[uuid]
            case "threats":
                return threats[uuid]
            case "objectives":
                return objectives[uuid]
            default:
        }
    }

    const getNestedFormItemInfo = (uuid, contentType) => {
        const { terms, sfrs, sfrSections, editors } = stateObject
        switch (contentType) {
            case "terms":
                return terms[uuid]
            case "sfrs": {
                let section = JSON.parse(JSON.stringify(sfrs.sections[uuid]))
                section.components = sfrSections.hasOwnProperty(uuid) ? JSON.parse(JSON.stringify(sfrSections[uuid])) : {}
                return section
            }
            case "editor":
                return editors[uuid]
            default:
                break;
        }
    }

    const parseSections = (useCases) => {
        const sections = Object.values(stateObject.accordionPane.sections)
        // TODO: change platformdata in our state to camelCase for consistency
        const platformData = stateObject.accordionPane.platformdata
        const sars = stateObject.sars
        const formattedSections = {}

        sections.forEach(section => {
            const key = section.xmlTagMeta ? section.xmlTagMeta.tagName : section.title

            formattedSections[key] = {
                title: section.title,
                formItems: section.formItems.map(formItem => {
                    const { uuid, contentType } = formItem

                    // go into the relevant slice and pull the right info
                    const filledFormItem = getSliceInfo(uuid, contentType)

                    // If there is a nested formItems list in this formItem, we need to populate it
                    if (formItem?.formItems) {
                        const nestedFormItems = {
                            formItems: formItem.formItems.map(
                                (formItem) => {
                                    const { uuid, contentType } = formItem
                                    return getNestedFormItemInfo(uuid, contentType)
                                }
                            )
                        }
                        return { ...filledFormItem, nestedFormItems }
                    } else
                        return { ...filledFormItem, ...{ formItems: [] } }
                }),
                tag: key
            }
        })

        // Get sections
        const { ["sec:Introduction"]: introduction, ["sec:Conformance_Claims"]: conformanceClaims } = formattedSections
        let { ["Security Requirements"]: securityRequirements } = formattedSections

        // Add in security requirements definition if it is present to Security Requirements section
        if (securityRequirements && securityRequirements.tag === "Security Requirements") {
            const { sfrDefinition } = stateObject.sfrs
            if (sfrDefinition && sfrDefinition !== "" && sfrDefinition !== "<p><br></p>") {
                securityRequirements.definition = sfrDefinition.valueOf()
            }
        }

        // Export sections
        dispatch(SET_INTRODUCTION({ introduction: introduction, platformData: platformData }))
        dispatch(SET_CONFORMANCE_CLAIMS({ conformanceClaims: conformanceClaims }))
        dispatch(SET_SECURITY_REQUIREMENTS({ securityRequirements: securityRequirements, useCases: useCases, sars: sars.xmlContent, platforms: stateObject.accordionPane.platformdata.platforms }))
        dispatch(SET_APPENDICES({ state: stateObject }))
        dispatch(SET_BIBLIOGRAPHY({ bibliography: stateObject.bibliography }))
        dispatch(SET_PACKAGES({ packages: stateObject.includePackage.packages }))
        dispatch(SET_MODULES({ modules: stateObject.modules }))
    }

    const generateFormattedJSON = () => {
        try {
            getMetaData();
            let useCases = getTerms();
            parseSections(useCases);
            let objectiveTerms = getSecurityProblemDefinitionSection();
            getSecurityObjectives(objectiveTerms);
        } catch (e) {
            console.log(e)
        }
    };

    const exportXML = () => {
        try {
            const doc = create(overallObject)

            // xmlbuilder2 escapes all xml tags that are stored as text, so we need to "unescape" them
            let txt = document.createElement("textarea");
            txt.innerHTML = doc.end({ prettyPrint: true });
            let xmlString = addNamespace(txt.value);
            xmlString = cleanUpXml(xmlString); // TODO: remove once SARS are being contructed in UI
            // console.log(xmlString)

            // Flip this to true at top of file if we don't want file downloads
            if (preview) {
                dispatch(SET_FORMATTED_XML({ xmlString: xmlString }))
            } else if (TESTING) {
                console.log(xmlString)
            } else {
                const blob = new Blob([xmlString], { type: 'text/xml' });
                const href = URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = href;
                link.download = `${fileName ? fileName : "download"}.xml`; // Name of the downloaded file
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (e) {
            console.log(e)
        } finally {
            if (!preview) {
                handleOpen();
            }
        }
    }
    const handleSetFileName = (event) => {
        let fileName = event.target.value
        let trimmed = fileName.replace(/[/\\?%*:|"<>]/g, '-');
        setFileName(trimmed)
    }

    // Utils
    const cleanUpXml = (xmlString) => {
        // Remove default aactivity tags
        return xmlString.replace(/<aactivity level="element"\/>\n/g, "").replace(/<aactivity level="component"\/>\n/g, "").replace(/<aactivity level="element"\/>/g, "").replace(/<aactivity level="component"\/>/g, "");
    }

    function addNamespace(content) {
        const nsTagNames = ["p", "ol", "ul", "sup", "pre", "s", "code", "i", "b", "a", "h3", "li", "strike", "br", "div", "strong", "em"]; // tags which require namespace
        // ([\\/]?: capture group to match opening and closing tags
        // (\\b[>]*): word boundary to match exact tag name
        const regex = new RegExp(`<([\\/]?)(${nsTagNames.join('|')})(\\b[>]*)>`, 'gi');

        // Get namespace
        let namespace = '';
        const namespaceKey = Object.keys(overallObject["PP"]).find(key => overallObject["PP"][key] === "http://www.w3.org/1999/xhtml");
        if (namespaceKey) {
            namespace = namespaceKey.split(":")[1]
        }

        let modifiedXML = content.replace(regex, (match, closingSlash, tagName, attributes) => {
            if (nsTagNames.includes(tagName.toLowerCase())) {
                if (tagName.toLowerCase() == "br") {
                    // break tags will be self-closing
                    return `<${namespace}:${tagName}${attributes}/>`;
                } else if (tagName.toLowerCase() == "strong") {
                    // break tags will be self-closing
                    return `<${namespace}:b${attributes}/>`;
                } else if (tagName.toLowerCase() == "em") {
                    // break tags will be self-closing
                    return `<${namespace}:i${attributes}/>`;
                }
                return `<${closingSlash}${namespace}:${tagName}${attributes}>`;
            }
        });

        // TODO: temp fix to handle self closing <br/> tags
        modifiedXML = modifiedXML.replaceAll("<br/>", `<${namespace}:br/>`);

        // Temp fix to remove empty ns attr
        modifiedXML = modifiedXML.replaceAll('xmlns=""', "");

        modifiedXML = modifiedXML.replace(`id="fpt-w^x-ext-1"`, "");

        // escape ampersand
        modifiedXML = modifiedXML.replace(/&/g, "&amp;");

        // escape less than signs with &lt;
        modifiedXML = modifiedXML.replace(/<=/g, "&lt;=").replace(/ < /g, " &lt; ");

        // replace link tag names (<a href=''>); SAR's a-component and a-element make replacing a tags selectively extremely hard
        if (namespace.length != 0) {
            modifiedXML = modifiedXML.replace(/<a href/g, `<${namespace}:a href`);
        }

        // replace empty p tags with self closing p tags (to match existing PP XML standard), need to append namespace first
        const pRegex1 = namespace.length != 0 ? new RegExp(`<\\/${namespace}:p><${namespace}:p>`, 'g') : null;
        const pRegex2 = namespace.length != 0 ? new RegExp(`<${namespace}:p><\\/${namespace}:p>`, 'g') : null;

        if (pRegex1) {
            modifiedXML = modifiedXML.replace(pRegex1, `<${namespace}:p/>`);
        }

        if (pRegex2) {
            modifiedXML = modifiedXML.replace(pRegex2, `<${namespace}:p/>`);
        }

        return modifiedXML;
    }

    // Return Method
    return (
        <div>
            {!preview ?
                <Modal
                    title={"XML Exporter"}
                    content={
                        <div className="w-screen-md">
                            <Card className="rounded-lg border-2 border-gray-200">
                                <CardBody className="border-b-2 rounded-b-sm border-gray-300 text-secondary">
                                    <div className="w-full" style={{ display: 'inline-block', padding: 1 }}>
                                        <span className="flex justify-stretch min-w-full">
                                            <TextField
                                                fullWidth
                                                required
                                                color={"secondary"}
                                                label={"XML File"}
                                                value={fileName}
                                                inputProps={{
                                                    style: { fontSize: 17 },
                                                }}
                                                InputLabelProps={{
                                                    style: { fontSize: 18 }
                                                }}
                                                onChange={handleSetFileName}
                                            />
                                            <div className="pl-2 text-[17px] mt-8 text-black">.xml</div>
                                        </span>
                                    </div>
                                </CardBody>
                                <CardFooter>
                                    <Button
                                        disabled={TESTING || (fileName && fileName !== "") ? false : true}
                                        component="label"
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<CloudDownloadIcon />}
                                        style={{ color: "white", marginTop: '0px', marginBottom: '5px' }}
                                        onClick={() => { generateFormattedJSON() }}
                                    > Export XML
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    }
                    open={open}
                    handleOpen={() => handleOpen()}
                    hideSubmit={true}
                />
                :
                <div className="xml-viewer text-[15px]">
                    <XMLViewer
                        xml={formattedXML ? formattedXML : ""}
                        indentSize={1}
                        collapsible={true}
                        theme={{
                            "tagColor": style.primary,
                            "attributeKeyColor": style.secondary,
                            "attributeValueColor": style.linkText
                        }}
                    />
                </div>
            }
        </div>
    );
}

export default XMLExporter;