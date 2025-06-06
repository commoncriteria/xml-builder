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
} from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import DeleteConfirmation from "../../../../modalComponents/DeleteConfirmation.jsx";
import ExtendedComponent from "../../sfrComponents/ExtendedComponent.jsx";
import SfrSections from "../../sfrComponents/SfrSections.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";

/**
 * The AdditionalSfr component
 * @param sfrUUID the sfr uuid
 * @param uuid the uuid
 * @returns {JSX.Element}
 * @constructor
 */
function AdditionalSfr({ sfrUUID, uuid }) {
  // Prop Validation
  AdditionalSfr.propTypes = {
    sfrUUID: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const sfrs = useSelector((state) => state.sfrSections);
  const sfrList = sfrs?.[uuid] || {};
  let additionalSfrs = sfrBasePPs[sfrUUID]?.additionalSfrs || {};
  const { sfrSections = {} } = additionalSfrs;
  const sfrSection = sfrSections?.[uuid] || {};
  const { title = "", definition = "", extendedComponentOpen = false, extendedComponentDefinition = [], open = true } = sfrSection;
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const [openDeleteDialog, setDeleteDialog] = useState(false);

  // Methods
  /**
   * Handles the title update
   * @param event
   */
  const handleTitleUpdate = (event) => {
    const title = event.target.value;

    // Update the additional sfr
    updateAdditionalSfrByKey("title", title, "Text Successfully Updated");
  };
  /**
   * Handles the collapse
   */
  const handleCollapse = () => {
    // Update the additional sfr
    updateAdditionalSfrByKey("open", !open);
  };
  /**
   * Handles the definition update
   * @param event the event
   */
  const handleDefinitionUpdate = (event) => {
    // Update the additional sfr
    updateAdditionalSfrByKey("definition", event);
  };
  /**
   * Handles the extended component definition
   * @param props the props
   */
  function handleExtendedComponentDefinition(props) {
    const { type, sfrUUID, uuid, index, key, value } = props;

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
  }
  /**
   * Handles adding a new component
   * @returns {Promise<void>}
   */
  const handleNewComponent = async () => {
    // Add a new component
    await addNewSfrComponent(uuid, true);
  };
  /**
   * Handles deleting the section
   * @returns {Promise<void>}
   */
  const handleDeleteSection = async () => {
    await deleteSfrSectionByType({
      type: "additional",
      sfrUUID,
      uuid,
      sfrList,
      message: "Additional SFR",
    });
  };

  // Helper Methods
  /**
   * Updates the additional sfr by key
   * @param key the key
   * @param value the value
   * @param message the message
   */
  const updateAdditionalSfrByKey = (key, value, message = null) => {
    try {
      if (sfrSections?.hasOwnProperty(uuid)) {
        let updatedSfrSections = deepCopy(sfrSections);
        updatedSfrSections[uuid][key] = value;

        // Update the additional sfr sections
        updateAdditionalSfr(sfrUUID, "sfrSections", updatedSfrSections);

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
    return (
      <TipTapEditor
        className='w-full'
        uuid={uuid}
        text={definition ? definition : ""}
        contentType={"term"}
        handleTextUpdate={handleDefinitionUpdate}
      />
    );
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
            <IconButton
              sx={{ marginTop: "-8px", marginRight: "8px" }}
              onClick={() => setDeleteDialog(!openDeleteDialog)}
              variant='contained'>
              <Tooltip title={"Delete Section"} id={"deleteSectionTooltip" + uuid}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
          </div>
        }
        body={
          <div className='m-4 mb-0 bg-gray-40' key={uuid + "Div"}>
            <div className='p-1'>{DefinitionEditor}</div>
            <div className='p-1 mb-[-8px]'>{ExtendedComponentDefinition}</div>
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
              <IconButton onClick={handleNewComponent} variant='contained'>
                <Tooltip title={"Add Item"} id={"addSecurityContentItem"}>
                  <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
                </Tooltip>
              </IconButton>
            </div>
          </div>
        }
      />
      <DeleteConfirmation
        title={title}
        open={openDeleteDialog}
        handleOpen={() => setDeleteDialog(!openDeleteDialog)}
        handleSubmit={handleDeleteSection}
      />
    </div>
  );
}

// Export AdditionalSfr.jsx
export default AdditionalSfr;
