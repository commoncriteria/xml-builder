// Imports
import PropTypes from "prop-types";
import { useSelector } from 'react-redux';
import React from "react";
import Terms from "../editorComponents/Terms.jsx";
import SecurityContent from "../editorComponents/securityComponents/SecurityContent.jsx";
import AcronymTable from "../appendicesComponents/AcronymTable.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";
import ConformanceClaims from "../editorComponents/ConformanceClaims.jsx";
import CompliantTargetsOfEvaluation from "../editorComponents/CompliantTargetsOfEvaluation.jsx";
import SecurityComponents from "../../utils/securityComponents.jsx";

/**
 * The AccordionItem component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function AccordionItem(props) {
    // Prop Validation
    AccordionItem.propTypes = {
        headerIndex: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        accordionUUID: PropTypes.string.isRequired,
        contentType: PropTypes.string.isRequired,
        formItems: PropTypes.array
    }

    // Constants
    const editors = useSelector((state) => state.editors)
    const terms = useSelector((state) => state.terms);
    const threats = useSelector((state) => state.threats);
    const objectives = useSelector((state) => state.objectives);
    const sfrs = useSelector((state) => state.sfrs.sections);
    const sars = useSelector((state) => state.sars.sections);
    const sfrSections = useSelector((state) => state.sfrSections);
    const { getSfrMaps } = SecurityComponents

    // Methods
    const showAccordionItem = () => {
        let sectionNumber = `${(props.headerIndex)}.${props.index + 1}`
        let type = props.contentType;
        let uuid = props.uuid;
        let accordionUUID = props.accordionUUID;
        let formItems = props.formItems;
        return (
            <div className="min-w-full" key={props.uuid + "-AccordionItem"}>
                <div className="min-w-full pb-1" key={props.uuid + "-AccordionInnerItem"}>
                    {itemByType(type, uuid, sectionNumber, accordionUUID)}
                </div>
                {
                    (formItems && Array.isArray(formItems) && formItems.length > 0) ?
                        formItems.map((value, index) => {
                            return (
                                <div className="min-w-full" key={value.uuid + "-AccordionFormItem"}>
                                    <AccordionItem headerIndex={sectionNumber} index={index} key={value.uuid}
                                                   uuid={value.uuid} accordionUUID={props.accordionUUID}
                                                   contentType={value.contentType}/>
                                </div>
                            )
                        })
                        :
                        null
                }
            </div>
        )
    }
    const itemByType = (type, uuid, section, accordionUUID) => {
        switch (type) {
            case "appendixI": {
                return (<AcronymTable/>)
            }
            case "compliantTargetsOfEvaluation": {
                return (
                   <CompliantTargetsOfEvaluation
                       section={section}
                       accordionUUID={accordionUUID}
                       uuid={uuid}
                       sfrMaps={getSfrMaps(sfrSections)}
                   />
                )
            }
            case "conformanceClaims": {
                return (
                    <ConformanceClaims/>
                )
            }
            case "editor": {
                let editor = editors[uuid]
                let tooltip = getTitleToolTip(editor.title)

                return (
                    <TipTapEditor
                        title={editor.title}
                        section={section}
                        uuid={uuid}
                        text={editor.text}
                        accordionUUID={accordionUUID}
                        contentType={"editor"}
                        open={editor.open}
                        titleTooltip={tooltip}
                    />
                )
            }
            case "terms": {
                let termList = terms[uuid]
                let tooltip = getTitleToolTip(termList.title)
                return (<Terms uuid={uuid} accordionUUID={accordionUUID} title={termList.title} section={section}
                               open={termList.open} titleTooltip={tooltip}/>)
            }
            case "threats": {
                let threatList = threats[uuid]
                let definition = threatList.definition ? threatList.definition : ""
                return (<SecurityContent uuid={uuid} accordionUUID={accordionUUID} title={threatList.title} contentType={type}
                                         definition={definition} item={threatList} section={section} open={threatList.open}/>)
            }
            case "objectives": {
                let objectivesList = objectives[uuid]
                let definition = objectivesList.definition ? objectivesList.definition : ""
                return (<SecurityContent uuid={uuid} accordionUUID={accordionUUID} title={objectivesList.title} contentType={type}
                                         definition={definition} item={objectivesList} section={section} open={objectivesList.open}/>)
            }
            case "sfrs": {
                let sfr = sfrs[uuid]
                let definition = sfr.definition ? sfr.definition : ""
                let sfrList = sfrSections[uuid]
                return (<SecurityContent uuid={uuid} accordionUUID={accordionUUID} title={sfr.title} contentType={type}
                                         definition={definition} sfrList={sfrList} section={section} open={sfr.open}/>)
            }
            case "sars": {
                let sar = sars[uuid]
                let definition = sar.summary ? sar.summary : ""
                let sarComponents = sar.componentIDs ? sar.componentIDs : []
                return (<SecurityContent uuid={uuid} accordionUUID={accordionUUID} title={sar.title} contentType={type}
                                         definition={definition} sarComponents={sarComponents} section={section} open={sar.open}/>)
            }
            default:
                return null
        }
    }

    // Helper Methods
    const getTitleToolTip = (title)=> {
        switch(title) {
            case "Common Criteria Terms":
                return "Terms that come directly from the Common Criteria. A selection of boilerplate terms will be pre-populated, but can be edited."
            case "Technical Terms":
                return "Terms that are used in this document that do not appear in the Common Criteria Terms section."
            case "TOE Overview":
                return "Description of the TOE (Target of Evaluation)."
            default:
                return
        }
    }

    // Return Method
    return (
        <div className="min-w-full" key={props.uuid + "-AccordionItemDiv"}>
            <div className="min-w-full" key={props.uuid + "-AccordionItemInnerDiv"}>
                <dl className="min-w-full border-0 justify-items-center">
                    {showAccordionItem()}
                </dl>
            </div>
        </div>
    );
}

// Export AccordionItem.jsx
export default AccordionItem