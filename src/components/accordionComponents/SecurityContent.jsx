// Imports
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  COLLAPSE_THREAT_SECTION,
  CREATE_THREAT_TERM,
  DELETE_OBJECTIVE_FROM_THREAT_USING_UUID,
  DELETE_THREAT_SECTION,
  UPDATE_THREAT_SECTION_DEFINITION,
  UPDATE_THREAT_SECTION_TITLE,
} from "../../reducers/threatsSlice.js";
import { DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import {
  COLLAPSE_OBJECTIVE_SECTION,
  CREATE_OBJECTIVE_TERM,
  DELETE_OBJECTIVE_SECTION,
  UPDATE_OBJECTIVE_SECTION_DEFINITION,
  UPDATE_OBJECTIVE_SECTION_TITLE,
} from "../../reducers/objectivesSlice.js";
import {
  COLLAPSE_SAR_SECTION,
  CREATE_SAR_COMPONENT,
  DELETE_SAR,
  UPDATE_SAR_SECTION_SUMMARY,
  UPDATE_SAR_SECTION_TITLE,
} from "../../reducers/sarsSlice.js";
import { COLLAPSE_SFR_SECTION, UPDATE_SFR_SECTION_DEFINITION, UPDATE_SFR_SECTION_TITLE } from "../../reducers/SFRs/sfrSlice.js";
import { COLLAPSE_SFR_BASE_PP_SECTION, UPDATE_SFR_BASE_PP_SECTION_NAME } from "../../reducers/SFRs/sfrBasePPsSlice.js";
import {
  addNewSfrComponent,
  deleteSfrSectionByType,
  getAdditionalAndModifiedSfrList,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
} from "../../utils/securityComponents.jsx";
import Definition from "../editorComponents/securityComponents/Definition.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";
import ExtendedComponent from "../editorComponents/securityComponents/sfrComponents/ExtendedComponent.jsx";
import SarSections from "../editorComponents/securityComponents/sarComponents/SarSections.jsx";
import SfrBasePP from "../editorComponents/securityComponents/sfrModuleComponents/SfrBasePP.jsx";
import SfrSections from "../editorComponents/securityComponents/sfrComponents/SfrSections.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";
import "../editorComponents/components.css";

/**
 * The SecurityContent component
 * @param uuid the uuid of the security content
 * @param accordionUUID the parent accordion uuid
 * @param title the title of the security content
 * @param definition the definition of the security content
 * @param sfrList the sfr list of the security content if it is of content type sfrs
 * @param sarList the sar list of the security content if it is of content type sars
 * @param item the item list of the security content if it is of content type objectives or threats
 * @param section the section number used for the header
 * @param open the collapse value of the accordion
 * @param contentType the content type of the security content
 *        values: threats, objectives, sfrs, sars, sfrBasePPs
 * @returns {JSX.Element}
 * @constructor
 */
function SecurityContent({ uuid, accordionUUID, title, definition, sfrList, sarList, item, section, open, contentType }) {
  // Prop Validation
  SecurityContent.propTypes = {
    uuid: PropTypes.string.isRequired,
    accordionUUID: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    definition: PropTypes.string,
    sfrList: PropTypes.object,
    sarList: PropTypes.array,
    item: PropTypes.object,
    section: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    contentType: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const sarComponents = useSelector((state) => state.sars.components);
  const [newSarComponent, setNewSarComponent] = useState("");
  const [openDeleteDialog, setDeleteDialog] = useState(false);

  // Methods
  /**
   * Handles a new sar component
   * @param componentUUID the component uuid
   */
  const handleNewSarComponent = (componentUUID) => {
    setNewSarComponent(componentUUID);
  };
  /**
   * Handles updating the item title
   * @param event the event as a DOM handler
   */
  const handleItemTitleUpdate = (event) => {
    const updateMap = {
      uuid,
      title,
      newTitle: event.target.value,
    };

    // Update based on type
    switch (contentType) {
      case "threats": {
        dispatch(UPDATE_THREAT_SECTION_TITLE(updateMap));
        break;
      }
      case "objectives": {
        dispatch(UPDATE_OBJECTIVE_SECTION_TITLE(updateMap));
        break;
      }
      case "sfrs": {
        dispatch(UPDATE_SFR_SECTION_TITLE(updateMap));
        break;
      }
      case "sars": {
        dispatch(UPDATE_SAR_SECTION_TITLE(updateMap));
        break;
      }
      case "sfrBasePPs": {
        dispatch(UPDATE_SFR_BASE_PP_SECTION_NAME(updateMap));
        break;
      }
      default:
        break;
    }
  };
  /**
   * Handles updating the item definition
   * @param event the event as a text string
   */
  const handleItemDefinitionUpdate = (event) => {
    const newDefinition = event;
    const updateMap = {
      uuid,
      title,
      newDefinition,
    };

    // Update definition by type
    switch (contentType) {
      case "threats": {
        dispatch(UPDATE_THREAT_SECTION_DEFINITION(updateMap));
        break;
      }
      case "objectives": {
        dispatch(UPDATE_OBJECTIVE_SECTION_DEFINITION(updateMap));
        break;
      }
      case "sfrs": {
        dispatch(UPDATE_SFR_SECTION_DEFINITION(updateMap));
        break;
      }
      case "sars": {
        dispatch(
          UPDATE_SAR_SECTION_SUMMARY({
            uuid,
            newSummary: newDefinition,
          })
        );
        break;
      }
      default:
        break;
    }
  };
  /**
   * Handles deleting the items list
   * @returns {Promise<void>}
   */
  const handleDeleteItemsList = async () => {
    const deleteFormItem = {
      accordionUUID,
      uuid,
    };
    const deleteSection = {
      title,
      uuid,
    };

    try {
      switch (contentType) {
        case "threats": {
          await dispatch(DELETE_ACCORDION_FORM_ITEM(deleteFormItem));
          await dispatch(DELETE_THREAT_SECTION(deleteSection));
          handleSnackBarSuccess("Section Successfully Removed");
          break;
        }
        case "objectives": {
          await dispatch(DELETE_ACCORDION_FORM_ITEM(deleteFormItem));

          Object.keys(item.terms).map(async (key) => {
            await dispatch(
              DELETE_OBJECTIVE_FROM_THREAT_USING_UUID({
                objectiveUUID: key,
              })
            );
          });

          await dispatch(DELETE_OBJECTIVE_SECTION(deleteSection));
          handleSnackBarSuccess("Objective Section Successfully Removed");
          break;
        }
        case "sfrs": {
          await deleteSfrSectionByType({
            type: "sfr",
            uuid,
            sfrList,
            deleteSection,
            deleteFormItem,
            message: "SFR",
          });
          break;
        }
        case "sars": {
          await dispatch(DELETE_ACCORDION_FORM_ITEM(deleteFormItem));
          await dispatch(
            DELETE_SAR({
              sarUUID: uuid,
            })
          );
          handleSnackBarSuccess("SAR Section Successfully Removed");
          break;
        }
        case "sfrBasePPs": {
          // Gets the list of additional/modified sfrs
          let sfrList = getAdditionalAndModifiedSfrList(uuid);

          // Deletes the sfr section for a base pp
          await deleteSfrSectionByType({
            type: "sfrBasePP",
            uuid,
            sfrList,
            deleteFormItem,
            message: "SFR Base PP",
          });
          break;
        }
        default:
          handleSnackBarError("Error - Section type is not valid, nothing was removed");
          break;
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles adding a new subcomponent
   * @returns {Promise<void>}
   */
  const handleAddSubcomponent = async () => {
    try {
      switch (contentType) {
        case "threats": {
          await dispatch(
            CREATE_THREAT_TERM({
              threatUUID: uuid,
            })
          );
          handleSnackBarSuccess("Term Successfully Added");
          break;
        }
        case "objectives": {
          await dispatch(
            CREATE_OBJECTIVE_TERM({
              objectiveUUID: uuid,
            })
          );
          handleSnackBarSuccess("Objective Term Successfully Added");
          break;
        }
        case "sfrs": {
          await addNewSfrComponent(uuid);
          break;
        }
        case "sars": {
          let sarUUID = await dispatch(
            CREATE_SAR_COMPONENT({
              sarUUID: uuid,
            })
          ).payload;

          if (sarUUID) {
            handleNewSarComponent(sarUUID);
          }
          handleSnackBarSuccess("SAR Component Successfully Added");
          break;
        }
        default:
          handleSnackBarError("Error - Term type does not exist. No term added.");
          break;
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the section collapse
   */
  const handleSectionCollapse = () => {
    const updateMap = {
      uuid,
      title,
    };

    // Collapse section by type
    switch (contentType) {
      case "threats": {
        dispatch(COLLAPSE_THREAT_SECTION(updateMap));
        break;
      }
      case "objectives": {
        dispatch(COLLAPSE_OBJECTIVE_SECTION(updateMap));
        break;
      }
      case "sfrs": {
        dispatch(COLLAPSE_SFR_SECTION(updateMap));
        break;
      }
      case "sars": {
        dispatch(COLLAPSE_SAR_SECTION(updateMap));
        break;
      }
      case "sfrBasePPs": {
        dispatch(COLLAPSE_SFR_BASE_PP_SECTION(updateMap));
        break;
      }
      default:
        break;
    }
  };

  // Use Memos
  /**
   * The definition editor section
   * @type {Element}
   */
  const DefinitionEditor = useMemo(() => {
    return (
      <TipTapEditor className='w-full' uuid={uuid} text={definition ? definition : ""} contentType={"term"} handleTextUpdate={handleItemDefinitionUpdate} />
    );
  }, [definition, uuid]);

  // Return Method
  return (
    <div className='min-w-full mb-2' key={uuid + "Div"}>
      <Card className='h-full w-full rounded-lg border-2 border-gray-300' key={uuid + "Card"}>
        <CardBody className='mb-0 rounded-b-none' key={uuid + "CardBody"}>
          <div className='flex' key={uuid + "CardBodyDiv"}>
            <label className='mr-2 resize-none font-bold text-[14px] text-secondary' key={uuid + "Section"}>
              {section}
            </label>
            <span />
            <textarea
              key={title}
              className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary'
              defaultValue={title}
              onBlur={(event) => handleSnackbarTextUpdates(handleItemTitleUpdate, event)}
            />
            <span />
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
              <Tooltip title={"Delete Section"} id={uuid + "deleteSectionSecurityContentTooltip"}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={handleSectionCollapse} variant='contained'>
              <Tooltip id={(open ? "collapse" : "expand") + uuid + "SecurityContentTooltip"} title={`${open ? "Collapse " : "Expand "} Section`}>
                {open ? <RemoveIcon htmlColor={primary} sx={icons.large} /> : <AddIcon htmlColor={primary} sx={icons.large} />}
              </Tooltip>
            </IconButton>
          </div>
        </CardBody>
        {open ? (
          <CardFooter className='min-w-full m-0 p-0 rounded-b-none border-b-2 border-gray-200 mt-[-20px] rounded-lg'>
            <div className='mx-5 mt-0 mb-3 bg-gray-40' key={uuid + "Div"}>
              {contentType !== "sfrBasePPs" ? (
                <div className='p-1'>{DefinitionEditor}</div>
              ) : (
                <div className='w-full m-0 p-0'>
                  <SfrBasePP uuid={uuid} />
                </div>
              )}
              {contentType === "sfrs" && (
                <div className='p-1 mb-[-8px]'>
                  <ExtendedComponent uuid={uuid} />
                </div>
              )}
              {contentType !== "sfrs" && contentType !== "sars" && contentType !== "sfrBasePPs" ? (
                <div className='p-0'>
                  {Object.entries(item.terms) && Object.entries(item.terms).length >= 1 && (
                    <div className='min-w-full m-0 p-0 '>
                      {Object.entries(item.terms).map(([key, value], index) => {
                        return (
                          <Definition
                            key={uuid + "Definition-" + key}
                            index={index}
                            accordionTitle={title}
                            termUUID={uuid}
                            uuid={key}
                            title={value.title}
                            open={value.open}
                            definition={value.definition}
                            item={value}
                            contentType={contentType}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className='p-0'>
                  {sfrList && Object.entries(sfrList) && Object.entries(sfrList).length >= 1 && (
                    <div className='min-w-full m-0 p-0 '>
                      {Object.keys(sfrList).map((key, index) => {
                        let value = sfrList[key];

                        return <SfrSections sfrUUID={uuid} uuid={key} index={index} value={value} key={key + "-SfrSection"} />;
                      })}
                    </div>
                  )}
                  {sarList && sarList.length >= 1 && (
                    <div className='min-w-full m-0 p-0 '>
                      {sarList.map((key, index) => {
                        let value = sarComponents[key];

                        return (
                          <SarSections
                            accordionUUID={accordionUUID}
                            sarUUID={uuid}
                            componentUUID={key}
                            index={index}
                            value={value}
                            key={key + "-SfrSection"}
                            newSarComponent={newSarComponent}
                            handleNewSarComponent={handleNewSarComponent}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {contentType !== "sfrBasePPs" && (
              <div className='flex flex-col items-center h-18 mt-2 mb-3 border-t-2 border-gray-300 pt-2'>
                <IconButton onClick={handleAddSubcomponent} variant='contained'>
                  <Tooltip title={"Add Item"} id={"addSecurityContentItem"}>
                    <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
                  </Tooltip>
                </IconButton>
              </div>
            )}
          </CardFooter>
        ) : (
          <div className='m-0 p-0 mt-[-15px]' />
        )}
      </Card>
      <DeleteConfirmation title={title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={handleDeleteItemsList} />
    </div>
  );
}

// Export SecurityContent.jsx
export default SecurityContent;
