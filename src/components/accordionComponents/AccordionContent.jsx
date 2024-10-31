// Imports
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Accordion, AccordionHeader, AccordionBody, Card, CardBody } from "@material-tailwind/react";
import { Tooltip } from "@mui/material";
import { DELETE_ACCORDION, setIsAccordionOpen } from '../../reducers/accordionPaneSlice.js'
import { sortThreatsTermsListHelper, UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION } from "../../reducers/threatsSlice.js";
import { sortObjectiveTermsListHelper } from "../../reducers/objectivesSlice.js";
import { UPDATE_MAIN_SFR_DEFINITION } from "../../reducers/SFRs/sfrSlice.js";
import { sortSfrSectionsHelper } from "../../reducers/SFRs/sfrSectionSlice.js";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DeleteForeverSharpIcon from "@mui/icons-material/DeleteForeverSharp";
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import AccordionSection from "./AccordionSection.jsx";
import TextEditor from "../editorComponents/TextEditor.jsx";
import AuditEventTable from "../editorComponents/securityComponents/sfrComponents/auditEvents/AuditEventTable.jsx";

/**
 * The Accordion class that displays the accordion
 * @param props             the input props
 * @returns {JSX.Element}   the accordion content
 * @constructor             passes in props to the class
 */
function AccordionContent(props) {
    // Prop Validation
    AccordionContent.propTypes = {
        title: PropTypes.string.isRequired,
        uuid: PropTypes.string,
        index: PropTypes.any,
        open: PropTypes.bool.isRequired,
        metadata: PropTypes.node,
        handleMetaDataCollapse: PropTypes.func,
    };

    // Constants
    const dispatch = useDispatch()
    const sfrDefinition = useSelector((state) => state.sfrs.sfrDefinition);
    const securityProblemDefinition = useSelector(state => state.threats.securityProblemDefinition)
    const { secondary, hoverOpen, hoverClosed, icons } = useSelector((state) => state.styling);

    // Use Effects
    useEffect(() => {
        dispatch(sortSfrSectionsHelper())
        dispatch(sortThreatsTermsListHelper())
        dispatch(sortObjectiveTermsListHelper())
    }, [props]);

    // Methods
    const accordionClickHandler = async (event, type) => {
        // Prevent an additional button click that collapses accordion on click
        event.stopPropagation()
        // Delete section
        if (type === "Delete") {
            {{await dispatch(DELETE_ACCORDION({uuid: props.uuid, title: props.title}))}}
        }
        // Open or close metadata section
        else if (props.title === "Metadata Section") {
            props.handleMetaDataCollapse("open")
        }
        // Open or close section
        else {
            {{ await dispatch(setIsAccordionOpen({title: props.title, uuid: props.uuid}))}}
        }
    }
    const updateSfrAccordionDefinition = async (event) => {
        await dispatch(UPDATE_MAIN_SFR_DEFINITION({newDefinition: event}))
    }
    const updateSecurityProblemDefinition = async (event) => {
        await dispatch(UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION({newDefinition: event}))
    }

    // Return Method
    return (
        <div className="min-w-full mb-2 rounded-lg px-1 pt-2">
            {/* eslint-di sable*/}
            <Accordion
                id={props.title + "_" + props.uuid}
                className={"rounded-lg border-2 border-gray-400 " + (props.open ? "bg-gray-200" : "bg-gray-300")}
                open={props.open}
                icon={
                    <div>
                        {
                            props.title !== "Metadata Section" ?
                                <Tooltip title={`Delete Section`} id={"deleteAccordionSectionTooltip" + props.uuid}>
                                    {
                                        !props.open ?
                                            <DeleteForeverSharpIcon htmlColor={ secondary } sx={{ ...icons.large, marginRight: "10px", "&:hover": hoverClosed }} onClick={(event) => accordionClickHandler(event, "Delete")}/>
                                            :
                                            <DeleteForeverRoundedIcon htmlColor={ secondary } sx={{ ...icons.large, marginRight: "10px", "&:hover": hoverOpen }} onClick={(event) => accordionClickHandler(event, "Delete")}/>
                                    }
                                </Tooltip>
                                : null
                        }
                        <Tooltip title={`${!props.open ? `Open ` : `Close `} Section`} id={(!props.open ? `open` : `close`) + "SectionTooltip" + props.uuid}>
                            {
                                props.open ?
                                    <ExpandCircleDownIcon htmlColor={ secondary } sx={{ ...icons.large, transform: "rotate(180deg)", "&:hover": hoverOpen }} onClick={(event) => accordionClickHandler(event, "Icon")}/>
                                    :
                                    <ExpandCircleDownOutlinedIcon htmlColor={ secondary } sx={{ ...icons.large, "&:hover": hoverClosed }} onClick={(event) => accordionClickHandler(event, "Icon")}/>
                            }
                        </Tooltip>
                    </div>
                }
            >
                <AccordionHeader
                    className={(props.open ? " border-b-2 bg-gray-50 rounded-lg rounded-b-none" : " border-b-0") + " px-6 font-extrabold text-accent border-gray-400"}
                    onClick={(event) => accordionClickHandler(event, "Accordion")}
                >
                    <div className="text-start text-[14px]">
                        <span>{`${props.title.toLowerCase().includes("appendix") || props.title === "Metadata Section" ? "" : (props.index + 1) + ".0 "}${props.title}`}</span>
                    </div>
                </AccordionHeader>
                <AccordionBody className={"bg-gray-100 pb-0 rounded-lg rounded-t-none"}>
                    <div className={"flex flex-col h-fit"}>
                        {
                            props.title === "Security Problem Definition" ?
                                <div className="mx-4 mb-4">
                                    <Card className="rounded-lg border-2 border-gray-300">
                                        <CardBody className="pt-6 pb-4">
                                            <TextEditor text={securityProblemDefinition} contentType={"term"} handleTextUpdate={updateSecurityProblemDefinition}/>
                                        </CardBody>
                                    </Card>
                                </div>
                                :
                                null
                        }
                        {
                            props.title === "Security Requirements" ?
                                <div className="mx-4 mb-4">
                                    <Card className="rounded-lg border-2 border-gray-300">
                                        <CardBody className="pt-6 pb-4">
                                            <TextEditor text={sfrDefinition} contentType={"term"} handleTextUpdate={updateSfrAccordionDefinition}/>
                                            <AuditEventTable/>
                                        </CardBody>
                                    </Card>
                                </div>
                                :
                                null
                        }
                        <slot/>
                        {
                            props.title !== "Metadata Section" ?
                                <AccordionSection uuid={props.uuid} index={props.index}/>
                                :
                                props.metadata
                        }
                        <slot/>
                    </div>
                </AccordionBody>
            </Accordion>
        </div>
    );
}

// Export AccordionContent.jsx
export default AccordionContent;