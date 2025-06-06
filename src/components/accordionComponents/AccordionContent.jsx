// Imports
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionHeader, AccordionBody, Card, CardBody } from "@material-tailwind/react";
import { Tooltip } from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DeleteForeverSharpIcon from "@mui/icons-material/DeleteForeverSharp";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import { DELETE_ACCORDION, setIsAccordionOpen } from "../../reducers/accordionPaneSlice.js";
import { SORT_THREATS_TERMS_LIST_HELPER, UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION } from "../../reducers/threatsSlice.js";
import { SORT_OBJECTIVE_TERMS_LIST_HELPER } from "../../reducers/objectivesSlice.js";
import { UPDATE_MAIN_SFR_DEFINITION } from "../../reducers/SFRs/sfrSlice.js";
import { SET_SATISFIED_REQS_XML } from "../../reducers/satisfiedReqsAppendix.js";
import { SET_ENTROPY_XML } from "../../reducers/entropyAppendixSlice.js";
import { SET_ACKNOWLEDGEMENTS_XML } from "../../reducers/acknowledgementsAppendix.js";
import { SORT_SFR_SECTIONS_HELPER } from "../../reducers/SFRs/sfrSectionSlice.js";
import { UPDATE_DISTRIBUTED_TOE_INTRO } from "../../reducers/distributedToeSlice.js";
import { UPDATE_MAIN_SFR_BASE_PP_DEFINITION } from "../../reducers/SFRs/sfrBasePPsSlice.js";
import { handleSnackBarSuccess, handleSnackBarError } from "../../utils/securityComponents.jsx";
import AccordionSection from "./AccordionSection.jsx";
import AuditEventTable from "../editorComponents/securityComponents/sfrComponents/AuditEventTable.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";

/**
 * The Accordion class that displays the accordion
 * @param title the title of the accordion
 * @param uuid the uuid of the accordion
 * @param index the current index of the accordion
 * @param open the collapse value of the accordion
 * @param metadata the metadata object if the accordion is metadata
 * @param handleMetaDataCollapse handles the metadata collapse if the accordion is metadata
 * @returns {JSX.Element}
 * @constructor
 */
function AccordionContent({ title, uuid, index, open, metadata, handleMetaDataCollapse }) {
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
  const dispatch = useDispatch();
  const sfrDefinition = useSelector((state) => state.sfrs.sfrDefinition);
  const { sfrBasePPDefinition } = useSelector((state) => state.sfrBasePPs);
  const satifisiedReqs = useSelector((state) => state.satisfiedReqsAppendix.xmlContent);
  const entropy = useSelector((state) => state.entropyAppendix.xmlContent);
  const acknowledgements = useSelector((state) => state.acknowledgementsAppendix.xmlContent);
  const securityProblemDefinition = useSelector((state) => state.threats.securityProblemDefinition);
  const distributedTOEIntro = useSelector((state) => state.distributedTOE.intro);
  const { ppType } = useSelector((state) => state.accordionPane.metadata);
  const { secondary, hoverOpen, hoverClosed, icons } = useSelector((state) => state.styling);
  const [openDeleteDialog, setDeleteDialog] = useState(false);

  // Use Effects
  useEffect(() => {
    dispatch(SORT_SFR_SECTIONS_HELPER());
    dispatch(SORT_THREATS_TERMS_LIST_HELPER());
    dispatch(SORT_OBJECTIVE_TERMS_LIST_HELPER());
  }, [title, uuid, index, open, metadata]);

  // Methods
  /**
   * Handles the accordion click
   * @param event the event as a DOM handler
   */
  const handleAccordionClick = (event) => {
    // Prevent an additional button click that collapses accordion on click
    event.stopPropagation();
    // Open or close metadata section
    if (title === "Metadata Section") {
      handleMetaDataCollapse("open");
    }
    // Open or close section
    else {
      dispatch(
        setIsAccordionOpen({
          title,
          uuid,
        })
      );
    }
  };
  /**
   * Handles updating the sfr definition
   * @param event the event as a text string
   */
  const handleUpdateSfrDefinition = (event) => {
    dispatch(
      UPDATE_MAIN_SFR_DEFINITION({
        newDefinition: event,
      })
    );
  };
  /**
   * Handles updating the sfr base pp definition
   * @param event the event as a text string
   */
  const handleUpdateSfrBasePPDefinition = async (event) => {
    dispatch(
      UPDATE_MAIN_SFR_BASE_PP_DEFINITION({
        newDefinition: event,
      })
    );
  };
  /**
   * Handles updating the security problem definition
   * @param event the event as a text string
   */
  const handleUpdateSecurityProblemDefinition = (event) => {
    dispatch(
      UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION({
        newDefinition: event,
      })
    );
  };
  /**
   * Handles updating the distributed toe intro
   * @param event the event as a text string
   */
  const handleUpdateDistributedToeIntro = async (event) => {
    dispatch(
      UPDATE_DISTRIBUTED_TOE_INTRO({
        newIntro: event,
      })
    );
  };
  /**
   * Handles updating the satisfied requirements
   * @param event the event as a text string
   */
  const updateSatisfiedRequirements = (event) => {
    dispatch(
      SET_SATISFIED_REQS_XML({
        xml: event,
      })
    );
  };
  /**
   * Handles updating the entropy
   * @param event the event as a text string
   */
  const handleUpdateEntropy = (event) => {
    dispatch(
      SET_ENTROPY_XML({
        xml: event,
      })
    );
  };
  /**
   * Handles updating the acknowledgement
   * @param event the event as a text string
   */
  const handleUpdateAcknowledgement = (event) => {
    dispatch(
      SET_ACKNOWLEDGEMENTS_XML({
        xml: event,
      })
    );
  };
  /**
   * Handles deleting an accordion section
   */
  const handleDeleteAccordionSection = async () => {
    try {
      dispatch(
        DELETE_ACCORDION({
          uuid,
          title,
        })
      );

      // Update snackbar
      handleSnackBarSuccess(`${title} Section Successfully Deleted`);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Use Memos
  /**
   * The DistributedToeSection
   */
  const DistributedToeSection = useMemo(() => {
    return (
      <div className='mx-4 mb-2'>
        <TipTapEditor text={distributedTOEIntro} contentType={"term"} handleTextUpdate={handleUpdateDistributedToeIntro} />
      </div>
    );
  }, [distributedTOEIntro]);
  /**
   * The SecurityProblemDefinitionSection
   */
  const SecurityProblemDefinitionSection = useMemo(() => {
    return (
      <div className='mx-4 mb-2'>
        <TipTapEditor text={securityProblemDefinition} contentType={"term"} handleTextUpdate={handleUpdateSecurityProblemDefinition} />
      </div>
    );
  }, [securityProblemDefinition]);
  /**
   * The SecurityRequirementsSection component
   */
  const SecurityRequirementsSection = useMemo(() => {
    const isModule = ppType === "Module";

    return (
      <div className='mx-4 mb-4'>
        <Card className='rounded-lg border-2 border-gray-300'>
          <CardBody className='pt-6 pb-4'>
            <TipTapEditor
              text={isModule ? sfrBasePPDefinition : sfrDefinition}
              contentType={"term"}
              handleTextUpdate={isModule ? handleUpdateSfrBasePPDefinition : handleUpdateSfrDefinition}
            />
            {!isModule && <AuditEventTable />}
          </CardBody>
        </Card>
      </div>
    );
  }, [ppType]);
  /**
   * The AppendixESection
   */
  const AppendixESection = useMemo(() => {
    return (
      <div className='mx-4 mb-2'>
        <TipTapEditor text={satifisiedReqs} contentType={"term"} handleTextUpdate={updateSatisfiedRequirements} />
      </div>
    );
  }, [satifisiedReqs]);
  /**
   * The AppendixFSection
   */
  const AppendixFSection = useMemo(() => {
    return (
      <div className='mx-4 mb-2'>
        <TipTapEditor text={entropy} contentType={"term"} handleTextUpdate={handleUpdateEntropy} />
      </div>
    );
  }, [entropy]);
  /**
   * The AppendixKSection
   */
  const AppendixKSection = useMemo(() => {
    return (
      <div className='mx-4 mb-2'>
        <TipTapEditor text={acknowledgements} contentType={"term"} handleTextUpdate={handleUpdateAcknowledgement} />
      </div>
    );
  }, [acknowledgements]);

  // Return Method
  return (
    <div className='min-w-full mb-2 rounded-lg px-1 pt-2'>
      {/* eslint-di sable*/}
      <Accordion
        id={title + "_" + uuid}
        className={"rounded-lg border-2 border-gray-400 " + (open ? "bg-gray-200" : "bg-gray-300")}
        open={open}
        icon={
          <div>
            {title !== "Metadata Section" && (
              <Tooltip title={`Delete Section`} id={"deleteAccordionSectionTooltip" + uuid}>
                {!open ? (
                  <DeleteForeverSharpIcon
                    htmlColor={secondary}
                    sx={{ ...icons.large, marginRight: "10px", "&:hover": hoverClosed }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteDialog(!openDeleteDialog);
                    }}
                  />
                ) : (
                  <DeleteForeverRoundedIcon
                    htmlColor={secondary}
                    sx={{ ...icons.large, marginRight: "10px", "&:hover": hoverOpen }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteDialog(!openDeleteDialog);
                    }}
                  />
                )}
              </Tooltip>
            )}
            <Tooltip title={`${!open ? `Open ` : `Close `} Section`} id={(!open ? `open` : `close`) + "SectionTooltip" + uuid}>
              {open ? (
                <ExpandCircleDownIcon
                  htmlColor={secondary}
                  sx={{ ...icons.large, transform: "rotate(180deg)", "&:hover": hoverOpen }}
                  onClick={(event) => handleAccordionClick(event, "Icon")}
                />
              ) : (
                <ExpandCircleDownOutlinedIcon
                  htmlColor={secondary}
                  sx={{ ...icons.large, "&:hover": hoverClosed }}
                  onClick={(event) => handleAccordionClick(event, "Icon")}
                />
              )}
            </Tooltip>
          </div>
        }>
        <AccordionHeader
          className={(open ? " border-b-2 bg-gray-50 rounded-lg rounded-b-none" : " border-b-0") + " px-6 font-extrabold text-accent border-gray-400"}
          onClick={(event) => handleAccordionClick(event, "Accordion")}>
          <div className='text-start text-[14px]'>
            <span>{`${title.toLowerCase().includes("appendix") || title === "Metadata Section" ? "" : index + 1 + ".0 "}${title}`}</span>
          </div>
        </AccordionHeader>
        <AccordionBody className={"bg-gray-100 pb-0 rounded-lg rounded-t-none"}>
          <div className={"flex flex-col h-fit"}>
            {title === "Distributed TOE" && DistributedToeSection}
            {title === "Security Problem Definition" && SecurityProblemDefinitionSection}
            {title === "Security Requirements" && SecurityRequirementsSection}
            <slot />
            {title === "Appendix E - Implicitly Satisfied Requirements" && AppendixESection}
            {title === "Appendix F - Entropy Documentation And Assessment" && AppendixFSection}
            {title === "Appendix K - Acknowledgments" && AppendixKSection}
            {title !== "Metadata Section" ? <AccordionSection uuid={uuid} index={index} /> : metadata}
            <slot />
          </div>
        </AccordionBody>
      </Accordion>
      <DeleteConfirmation
        title={title}
        open={openDeleteDialog}
        handleOpen={() => setDeleteDialog(!openDeleteDialog)}
        handleSubmit={handleDeleteAccordionSection}
      />
    </div>
  );
}

// Export AccordionContent.jsx
export default AccordionContent;
