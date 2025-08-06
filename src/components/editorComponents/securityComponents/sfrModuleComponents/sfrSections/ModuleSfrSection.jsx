// Imports
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  addNewSfrComponent,
  deleteSfrSectionByType,
  handleSnackBarError,
  handleSnackBarSuccess,
  updateAdditionalSfr,
  updateModifiedSfr,
} from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import ComponentDialog from "./ComponentDialog.jsx";
import DeleteConfirmation from "../../../../modalComponents/DeleteConfirmation.jsx";
import ExtendedComponent from "../../sfrComponents/ExtendedComponent.jsx";
import FormTextField from "../FormTextField.jsx";
import SfrSections from "../../sfrComponents/SfrSections.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The ModuleSfrSection component
 * @param sfrUUID the sfr uuid
 * @param uuid the uuid
 * @param isAdditionalSfr the boolean value that represents if the sections are of type additionalSfrs
 * @returns {JSX.Element}
 * @constructor
 */
function ModuleSfrSection({ sfrUUID, uuid, isAdditionalSfr }) {
  // Prop Validation
  ModuleSfrSection.propTypes = {
    sfrUUID: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    isAdditionalSfr: PropTypes.bool.isRequired,
  };

  // Constants
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const sfrs = useSelector((state) => state.sfrSections);
  const sfrList = sfrs?.[uuid] || {};
  let currentSfrSection = (isAdditionalSfr ? sfrBasePPs[sfrUUID]?.additionalSfrs : sfrBasePPs[sfrUUID]?.modifiedSfrs) || {};
  const { sfrSections = {} } = currentSfrSection;
  const sfrSection = sfrSections?.[uuid] || {};
  const { title = "", definition = "", id = "", extendedComponentOpen = false, extendedComponentDefinition = [], open = true } = sfrSection;
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const [openDeleteDialog, setDeleteDialog] = useState(false);
  const [openComponentDialog, setOpenComponetDialog] = useState(false);

  // Methods
  /**
   * Handles the title update
   * @param event
   */
  const handleTitleUpdate = (event) => {
    const title = event.target.value;

    // Update the sfr
    updateSfrByKey("title", title, "Text Successfully Updated");
  };
  /**
   * Handles the id update
   * @param event the event as a DOM handler
   */
  const handleIdUpdate = (event) => {
    const id = event.target.value;

    // Update the modified sfr
    updateSfrByKey("id", id, "Text Successfully Updated");
  };
  /**
   * Handles the collapse
   */
  const handleCollapse = () => {
    // Update the sfr
    updateSfrByKey("open", !open);
  };
  /**
   * Handles the definition update
   * @param event the event
   */
  const handleDefinitionUpdate = (event) => {
    // Update the sfr
    updateSfrByKey("definition", event);
  };
  /**
   * Handles the extended component definition
   * @param type the handler type: new, delete, update, open
   * @param sfrUUID the sfr uuid
   * @param uuid the uuid
   * @param index the index of the value to update
   * @param key the key of the item to update
   * @param value the value of the item to update
   */
  const handleExtendedComponentDefinition = ({ type, sfrUUID, uuid, index, key, value }) => {
    // Update extended component definition
    if (sfrSections?.hasOwnProperty(uuid)) {
      let updatedSfrSections = deepCopy(sfrSections);
      let { extendedComponentOpen, extendedComponentDefinition } = updatedSfrSections[uuid];

      // Update by type
      switch (type) {
        case "new": {
          extendedComponentDefinition.push({
            famId: "",
            title: "New ECD Title",
            famBehavior: "",
          });
          break;
        }
        case "delete": {
          if (extendedComponentDefinition[index]) {
            extendedComponentDefinition.splice(index, 1);
          }
          break;
        }
        case "update": {
          if (extendedComponentDefinition[index]) {
            let currentEcdItem = extendedComponentDefinition[index];

            if (currentEcdItem.hasOwnProperty(key)) {
              currentEcdItem[key] = value;
            }
          }
          break;
        }
        case "open": {
          updatedSfrSections[uuid].extendedComponentOpen = extendedComponentOpen !== undefined ? !extendedComponentOpen : false;
          break;
        }
        default:
          break;
      }

      // Update the additional sfr sections
      updateAdditionalSfr(sfrUUID, "sfrSections", updatedSfrSections);
    }
  };
  /**
   * Handles adding a new component
   * @param sfrComponent the sfr component data used to create a new sfr component
   * @returns {Promise<void>}
   */
  const handleNewComponent = async (sfrComponent = {}) => {
    const sfrType = isAdditionalSfr ? { additionalSfr: true } : { modifiedSfr: true };
    const itemMap = {
      ...sfrComponent,
      ...sfrType,
    };

    // Add a new component
    await addNewSfrComponent(uuid, itemMap);
  };
  /**
   * Handles deleting the section
   * @returns {Promise<void>}
   */
  const handleDeleteSection = async () => {
    const type = isAdditionalSfr ? "additional" : "modified";
    const message = `${isAdditionalSfr ? "Additional" : "Modified"} SFR`;

    // Delete the sfr section
    await deleteSfrSectionByType({
      type,
      sfrUUID,
      uuid,
      sfrList,
      message,
    });
  };
  /**
   * Handles opening the sfr component selection dialog
   */
  const handleOpenComponentDialog = () => {
    setOpenComponetDialog(!openComponentDialog);
  };

  // Helper Methods
  /**
   * Updates the sfr by key
   * @param key the key
   * @param value the value
   * @param message the message
   */
  const updateSfrByKey = (key, value, message = null) => {
    try {
      if (sfrSections?.hasOwnProperty(uuid)) {
        let updatedSfrSections = deepCopy(sfrSections);
        updatedSfrSections[uuid][key] = value;

        if (isAdditionalSfr) {
          // Update the additional sfr sections
          updateAdditionalSfr(sfrUUID, "sfrSections", updatedSfrSections);
        } else {
          // Update the modified sfr sections
          updateModifiedSfr(sfrUUID, "sfrSections", updatedSfrSections);
        }

        // Update snackbar message
        if (message) {
          handleSnackBarSuccess(message);
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Use Memos
  /**
   * The DefinitionEditor section
   * @type {Element}
   */
  const DefinitionEditor = useMemo(() => {
    return <TipTapEditor className='w-full' uuid={uuid} text={definition ? definition : ""} contentType={"term"} handleTextUpdate={handleDefinitionUpdate} />;
  }, [definition, uuid]);
  /**
   * The ExtendedComponentDefinition section
   */
  const ExtendedComponentDefinition = useMemo(() => {
    return (
      <ExtendedComponent
        uuid={uuid}
        sfrUUID={sfrUUID}
        isAdditionalSfr={true}
        additionalSfrOpen={extendedComponentOpen}
        handleUpdateAdditionalSfr={handleExtendedComponentDefinition}
        additionalSfrDefinition={extendedComponentDefinition}
      />
    );
  }, [extendedComponentOpen, extendedComponentDefinition, uuid, sfrUUID]);

  // Return Method
  return (
    <div className='w-full'>
      <CardTemplate
        type={"parent"}
        tooltip={"Section"}
        collapse={open}
        collapseHandler={handleCollapse}
        header={
          <div className='w-full justify-stretch flex'>
            <textarea
              key={title}
              className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary'
              defaultValue={title}
              onBlur={(event) => handleTitleUpdate(event)}
            />
            <span />
            <IconButton sx={{ marginTop: "-8px", marginRight: "8px" }} onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
              <Tooltip title={"Delete Section"} id={"deleteSectionTooltip" + uuid}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
          </div>
        }
        body={
          <div className='m-4 mb-0 bg-gray-40' key={uuid + "Div"}>
            {!isAdditionalSfr && (
              <div className='w-full px-1 pb-2'>
                <FormTextField
                  value={id}
                  label={"ID"}
                  handleTextUpdate={handleIdUpdate}
                  tooltip={`It's particularly important to make sure the id attributes for these sections and SFRs are unique 
                   in the document, since there is likely to be more than one instance of each Family in the document.`}
                />
              </div>
            )}
            <div className='p-1'>{DefinitionEditor}</div>
            {isAdditionalSfr && <div className='p-1 mb-[-8px]'>{ExtendedComponentDefinition}</div>}
            <div className='p-0'>
              {sfrList && Object.entries(sfrList) && Object.entries(sfrList).length >= 1 && (
                <div className='min-w-full m-0 p-0 '>
                  {Object.keys(sfrList).map((key, index) => {
                    let value = sfrList[key];

                    return <SfrSections sfrUUID={uuid} uuid={key} index={index} value={value} key={key + "-SfrSection"} />;
                  })}
                </div>
              )}
            </div>
            <div className='flex flex-col items-center h-18 mt-2 mb-0 border-t-2 border-gray-300 pt-2 mx-[-16px]'>
              <IconButton
                onClick={async () => {
                  isAdditionalSfr ? await handleNewComponent() : handleOpenComponentDialog();
                }}
                variant='contained'>
                <Tooltip title={"Add Item"} id={"addSecurityContentItem"}>
                  <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
                </Tooltip>
              </IconButton>
            </div>
          </div>
        }
      />
      <ComponentDialog sfrUUID={sfrUUID} title={title} open={openComponentDialog} handleSubmit={handleNewComponent} handleOpen={handleOpenComponentDialog} />
      <DeleteConfirmation title={title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={handleDeleteSection} />
    </div>
  );
}

// Export ModuleSfrSection.jsx
export default ModuleSfrSection;
