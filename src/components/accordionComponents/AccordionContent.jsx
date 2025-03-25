// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Accordion, AccordionHeader, AccordionBody, Card, CardBody } from "@material-tailwind/react";
import { Tooltip } from "@mui/material";
import { DELETE_ACCORDION, setIsAccordionOpen } from '../../reducers/accordionPaneSlice.js'
import { SORT_THREATS_TERMS_LIST_HELPER, UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION } from "../../reducers/threatsSlice.js";
import { SORT_OBJECTIVE_TERMS_LIST_HELPER } from "../../reducers/objectivesSlice.js";
import { UPDATE_MAIN_SFR_DEFINITION } from "../../reducers/SFRs/sfrSlice.js";
import { SET_SATISFIED_REQS_XML } from "../../reducers/satisfiedReqsAppendix.js";
import { SET_ENTROPY_XML } from "../../reducers/entropyAppendixSlice.js";
import { SET_ACKNOWLEDGEMENTS_XML } from "../../reducers/acknowledgementsAppendix.js";
import { SORT_SFR_SECTIONS_HELPER } from "../../reducers/SFRs/sfrSectionSlice.js";
import { UPDATE_DISTRIBUTED_TOE_INTRO } from "../../reducers/distributedToeSlice.js";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DeleteForeverSharpIcon from "@mui/icons-material/DeleteForeverSharp";
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import AccordionSection from "./AccordionSection.jsx";
import AuditEventTable from "../editorComponents/securityComponents/sfrComponents/auditEvents/AuditEventTable.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";
import SecurityComponents from "../../utils/securityComponents.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";

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
    const { handleSnackBarSuccess, handleSnackBarError } = SecurityComponents
    const dispatch = useDispatch()
    const sfrDefinition = useSelector((state) => state.sfrs.sfrDefinition);
    const satifisiedReqs = useSelector((state) => state.satisfiedReqsAppendix.xmlContent);
    const entropy = useSelector((state) => state.entropyAppendix.xmlContent);
    const acknowledgements = useSelector((state) => state.acknowledgementsAppendix.xmlContent);
    const securityProblemDefinition = useSelector(state => state.threats.securityProblemDefinition);
    const distributedTOEIntro = useSelector((state) => state.distributedTOE.intro);
    const { secondary, hoverOpen, hoverClosed, icons } = useSelector((state) => state.styling);
    const [openDeleteDialog, setDeleteDialog] = useState(false);

    // Use Effects
    useEffect(() => {
        dispatch(SORT_SFR_SECTIONS_HELPER())
        dispatch(SORT_THREATS_TERMS_LIST_HELPER())
        dispatch(SORT_OBJECTIVE_TERMS_LIST_HELPER())
    }, [props]);

    // Methods
    const accordionClickHandler = async (event) => {
        // Prevent an additional button click that collapses accordion on click
        event.stopPropagation()
        // Open or close metadata section
        if (props.title === "Metadata Section") {
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
    const updatedDistributedToeIntro = async (event) => {
        await dispatch(UPDATE_DISTRIBUTED_TOE_INTRO({newIntro: event}))
    }
    const updateSatisfiedRequirements = async (event) => {
      await dispatch(SET_SATISFIED_REQS_XML({xml: event}))
    }
    const updateEntropy = async (event) => {
      await dispatch(SET_ENTROPY_XML({xml: event}))
    }
    const updateAcknowledgement = async (event) => {
      await dispatch(SET_ACKNOWLEDGEMENTS_XML({xml: event}))
    }
    const deleteSection = async () => {
        try {
            {{await dispatch(DELETE_ACCORDION({uuid: props.uuid, title: props.title}))}}

            // Update snackbar
            handleSnackBarSuccess(`${props.title} Section Successfully Deleted`)
        } catch(err) {
            handleSnackBarError(err)
        }
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
                                        <DeleteForeverSharpIcon 
                                            htmlColor={ secondary } 
                                            sx={{ ...icons.large, marginRight: "10px", "&:hover": hoverClosed }} 
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setDeleteDialog(!openDeleteDialog);
                                            }}
                                        />
                                            :
                                        <DeleteForeverRoundedIcon 
                                            htmlColor={ secondary } 
                                            sx={{ ...icons.large, marginRight: "10px", "&:hover": hoverOpen }} 
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setDeleteDialog(!openDeleteDialog);
                                            }}/>
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
                            props.title === "Distributed TOE" ?
                                <div className="mx-4 mb-2">
                                    <TipTapEditor
                                        text={distributedTOEIntro}
                                        contentType={"term"}
                                        handleTextUpdate={updatedDistributedToeIntro}
                                    />
                                </div>
                                :
                                null
                        }
                        {
                            props.title === "Security Problem Definition" ?
                                <div className="mx-4 mb-2">
                                    <TipTapEditor
                                        text={securityProblemDefinition}
                                        contentType={"term"}
                                        handleTextUpdate={updateSecurityProblemDefinition}
                                    />
                                </div>
                                :
                                null
                        }
                        {
                            props.title === "Security Requirements" ?
                                <div className="mx-4 mb-4">
                                    <Card className="rounded-lg border-2 border-gray-300">
                                        <CardBody className="pt-6 pb-4">
                                            <TipTapEditor
                                                text={sfrDefinition}
                                                contentType={"term"}
                                                handleTextUpdate={updateSfrAccordionDefinition}
                                            />
                                            <AuditEventTable/>
                                        </CardBody>
                                    </Card>
                                </div>
                                :
                                null
                        }
                        <slot/>
                        {
                            props.title === 'Appendix E - Implicitly Satisfied Requirements' ?
                            <div className="mx-4 mb-2">
                              <TipTapEditor
                                text={satifisiedReqs}
                                contentType={"term"}
                                handleTextUpdate={updateSatisfiedRequirements}
                              />
                            </div>
                            :
                            null
                        }
                        {
                            props.title === 'Appendix F - Entropy Documentation And Assessment' ?
                            <div className="mx-4 mb-2">
                              <TipTapEditor
                                text={entropy}
                                contentType={"term"}
                                handleTextUpdate={updateEntropy}
                              />
                            </div>
                            :
                            null
                        }
                        {
                            props.title === 'Appendix K - Acknowledgments' ?
                            <div className="mx-4 mb-2">
                              <TipTapEditor
                                text={acknowledgements}
                                contentType={"term"}
                                handleTextUpdate={updateAcknowledgement}
                              />
                            </div>
                            :
                            null
                        }
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
            <DeleteConfirmation
                title={props.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteSection}
            />
        </div>
    );
}

// Export AccordionContent.jsx
export default AccordionContent;