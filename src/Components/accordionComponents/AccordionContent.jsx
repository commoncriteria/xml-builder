// Imports
import {Accordion, AccordionHeader, AccordionBody, Card, CardBody} from "@material-tailwind/react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from 'react-redux'
import { DELETE_ACCORDION, setIsAccordionOpen } from '../../reducers/accordionPaneSlice.js'
import { Tooltip } from "@mui/material";
import DeleteForeverSharpIcon from "@mui/icons-material/DeleteForeverSharp";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import React, {useEffect} from "react";
import AccordionSection from "./AccordionSection.jsx";
import {sortThreatsTermsListHelper, UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION} from "../../reducers/threatsSlice.js";
import {sortObjectiveTermsListHelper} from "../../reducers/objectivesSlice.js";
import TextEditor from "../editorComponents/TextEditor.jsx";
import {UPDATE_MAIN_SFR_DEFINITION} from "../../reducers/SFRs/sfrSlice.js";
import {sortSfrSectionsHelper} from "../../reducers/SFRs/sfrSectionSlice.js";

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
    const styling = {
        hoverOpen: { backgroundColor: "#E8E8E8", outline: "6px solid #E8E8E8", borderRadius: "37%" },
        hoverClosed: { backgroundColor: "#C8C8C8", outline: "6px solid #C8C8C8", borderRadius: "37%" }
    }

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
                                <Tooltip title={`Delete Section`}>
                                    {
                                        !props.open ?
                                            <DeleteForeverSharpIcon htmlColor={"#1FB2A6"} sx={{ width: 32, height: 32, marginRight: "10px", "&:hover": styling.hoverClosed }} onClick={(event) => accordionClickHandler(event, "Delete")} />
                                            :
                                            <DeleteForeverRoundedIcon htmlColor={"#1FB2A6"} sx={{ width: 32, height: 32, marginRight: "10px", "&:hover": styling.hoverOpen }} onClick={(event) => accordionClickHandler(event, "Delete")}/>
                                    }
                                </Tooltip>
                                : null
                        }
                        <Tooltip title={`${!props.open ? `Open ` : `Close `} Section`}>
                            {
                                props.open ?
                                    <ExpandCircleDownIcon htmlColor={"#1FB2A6"} sx={{ width: 28, height: 28, transform: "rotate(180deg)", "&:hover": styling.hoverOpen }} onClick={(event) => accordionClickHandler(event, "Icon")}/>
                                    :
                                    <ExpandCircleDownOutlinedIcon htmlColor={"#1FB2A6"} sx={{ width: 28, height: 28, "&:hover": styling.hoverClosed }} onClick={(event) => accordionClickHandler(event, "Icon")}/>
                            }
                        </Tooltip>
                    </div>
                }
            >
                <AccordionHeader
                    className={(props.open ? " border-b-2 bg-gray-50 rounded-lg rounded-b-none" : " border-b-0") + " px-6 text-sm xs:max-lg:text-sm sm:max:lg:text-sm max-md:text-[0.5rem] md:max-lg:text-sm lg:max-2xl:text-md 2xl:text-lg font-extrabold text-accent border-gray-400"}
                    onClick={(event) => accordionClickHandler(event, "Accordion")}
                >
                    <div className="text-start">
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