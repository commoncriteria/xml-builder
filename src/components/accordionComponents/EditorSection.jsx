// Imports
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  CREATE_ACCORDION_SAR_FORM_ITEM,
  CREATE_ACCORDION_SAR_MODULE_FORM_ITEM,
  CREATE_ACCORDION_SFR_FORM_ITEM,
  CREATE_ACCORDION_SFR_MODULE_FORM_ITEM,
  DELETE_ACCORDION_FORM_ITEM,
} from "../../reducers/accordionPaneSlice.js";
import { COLLAPSE_EDITOR, DELETE_EDITOR, UPDATE_EDITOR_TEXT, UPDATE_EDITOR_TITLE } from "../../reducers/editorSlice.js";
import { CREATE_SAR_SECTION } from "../../reducers/sarsSlice.js";
import { CREATE_SFR_SECTION, sfrTypeMap } from "../../reducers/SFRs/sfrSlice.js";
import { CREATE_SFR_SECTION_SLICE } from "../../reducers/SFRs/sfrSectionSlice.js";
import { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } from "../../utils/securityComponents.jsx";
import DeleteSarSectionConfirmation from "../modalComponents/DeleteSarSectionConfirmation.jsx";
import DeleteSfrSectionConfirmation from "../modalComponents/DeleteSfrSectionConfirmation.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";
import ModuleToeSfrs from "../editorComponents/securityComponents/sfrModuleComponents/sfrSections/ModuleToeSfrs.jsx";

/**
 * The EditorSection component
 * @param accordionUUID the parent accordion uuid
 * @param uuid the editor uuid
 * @param section the section number for the header
 * @param tooltip the tooltip for the header
 * @returns {JSX.Element}
 * @constructor
 */
function EditorSection({ accordionUUID, uuid, section, tooltip }) {
  // Prop Validation
  EditorSection.propTypes = {
    accordionUUID: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
  };

  // Constants
  const dispatch = useDispatch();
  const { sections: accordions, metadata } = useSelector((state) => state.accordionPane);
  const { ppType } = metadata;
  const editors = useSelector((state) => state.editors);
  const { grayText, primary, secondary, icons } = useSelector((state) => state.styling);
  const [isEditable, setIsTitleEditable] = useState(true);
  const [sfrSectionId, setSfrSectionId] = useState("");
  const [sfrSectionName, setSfrSectionName] = useState("");
  const [sarSectionName, setSarSectionName] = useState("");
  const [isSfr, setIsSfr] = useState(false);
  const [isSar, setIsSar] = useState(false);
  const [openSfrConfirmationDialog, setOpenSfrConfirmationDialog] = useState(false);
  const [openSarConfirmationDialog, setOpenSarConfirmationDialog] = useState(false);
  const [openDeleteDialog, setDeleteDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSfrModule, setSelectedSfrModule] = useState("");
  const isModule = ppType && ppType === "Module";
  const sfrModuleDropdown = ["Mandatory", "Optional", "Objective", "Selection-based", "Implementation-dependent"];

  // Use Effects
  useEffect(() => {
    const title = getTitle(uuid);

    if (
      accordions.hasOwnProperty(accordionUUID) &&
      accordions[accordionUUID].hasOwnProperty("title") &&
      accordions[accordionUUID].title === "Security Requirements"
    ) {
      if (title === "Security Functional Requirements" || title === "Security Assurance Requirements" || title === "TOE Security Requirements") {
        if (ppType && ppType === "Module") {
          setIsTitleEditable(false);
        }
        if (title === "Security Functional Requirements") {
          setIsSfr(true);
        } else if (title === "Security Assurance Requirements") {
          setIsSar(true);
        }
      }
    }

    // Update is open value
    setIsOpen(getIsOpen(uuid));

    // Update title
    setTitle(title);
  }, [accordionUUID, uuid, section, tooltip, editors]);

  // Methods
  /**
   * Handles the editor text update
   * @param htmlContent
   */
  const handleEditorTextUpdate = (htmlContent) => {
    dispatch(
      UPDATE_EDITOR_TEXT({
        uuid,
        newText: htmlContent,
      })
    );
  };
  /**
   * Handles updating the editor title
   * @param event the event as a DOM handler
   */
  const handleEditorTitle = (event) => {
    const newTitle = event.target.value;

    dispatch(
      UPDATE_EDITOR_TITLE({
        title,
        uuid,
        newTitle,
      })
    );
  };
  /**
   * Handles deleting an editor
   */
  const handleDeleteEditor = () => {
    if (isSfr) {
      handleOpenSfrConfirmationDialog();
    } else if (isSar) {
      handleOpenSarConfirmationDialog();
    } else {
      setDeleteDialog(!openDeleteDialog);
    }
  };
  /**
   * Handles collapse
   */
  const handleCollapse = () => {
    dispatch(
      COLLAPSE_EDITOR({
        uuid,
        title,
      })
    );
  };
  /**
   * Handles deleting a section
   * @returns {Promise<void>}
   */
  const handleDeleteSection = async () => {
    try {
      await dispatch(
        DELETE_ACCORDION_FORM_ITEM({
          accordionUUID,
          uuid,
        })
      );
      await dispatch(
        DELETE_EDITOR({
          title,
          uuid,
        })
      );

      // Update snackbar
      handleSnackBarSuccess("Section Successfully Removed");
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles updating the sfr section id
   * @param event the event a DOM handler
   */
  const handleSfrSectionId = (event) => {
    setSfrSectionId(event.target.value);
  };
  /**
   * Handles updating the sfr section name
   * @param event the event a DOM handler
   */
  const handleSfrSectionName = (event) => {
    setSfrSectionName(event.target.value);
  };
  /**
   * Handles updating the sar section name
   * @param event the event a DOM handler
   */
  const handleSarSectionName = (event) => {
    setSarSectionName(event.target.value);
  };
  /**
   * Handles adding a new sfr section
   * @returns {Promise<void>}
   */
  const handleNewSfrSection = async () => {
    try {
      const validId = sfrSectionId && sfrSectionId !== "";
      const validName = sfrSectionName && sfrSectionName !== "";
      const validSfrModuleType = selectedSfrModule && selectedSfrModule !== "" && sfrModuleDropdown.includes(selectedSfrModule);
      const isSfrValid = !isModule && isSfr && validName && validId;
      const isSfrModuleValid = isModule && isSfr && validName && validId && validSfrModuleType;
      const selectedType = validSfrModuleType && sfrTypeMap.hasOwnProperty(selectedSfrModule) ? sfrTypeMap[selectedSfrModule] : "";

      if (isSfrValid || isSfrModuleValid) {
        // Create SFR UUID
        const sfrUUID = await dispatch(
          CREATE_SFR_SECTION({
            title: sfrSectionName,
            id: sfrSectionId,
            sfrType: selectedType,
          })
        ).payload;

        if (sfrUUID) {
          await dispatch(
            CREATE_SFR_SECTION_SLICE({
              sfrUUID: sfrUUID,
            })
          );

          if (ppType && ppType !== "Module") {
            await dispatch(
              CREATE_ACCORDION_SFR_FORM_ITEM({
                accordionUUID,
                editorUUID: uuid,
                sfrUUID: sfrUUID,
              })
            );
          } else {
            const editorFormUUID = getFormUUID(accordionUUID, uuid);

            // Add sfr module form item
            if (editorFormUUID) {
              await dispatch(
                CREATE_ACCORDION_SFR_MODULE_FORM_ITEM({
                  accordionUUID,
                  formUUID: editorFormUUID,
                  innerFormUUID: uuid,
                  newUUID: sfrUUID,
                  contentType: "sfrs",
                })
              );
            }
          }

          // Update snackbar
          handleSnackBarSuccess("New SFR Section Successfully Added");
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }

    setSelectedSfrModule("");
    setSfrSectionName("");
    setSfrSectionId("");
  };
  /**
   * Handles adding a new sar section
   * @returns {Promise<void>}
   */
  const handleNewSarSection = async () => {
    if (isSar && sarSectionName && sarSectionName !== "") {
      // Create SAR UUID
      let sarUUID = await dispatch(
        CREATE_SAR_SECTION({
          title: sarSectionName,
        })
      ).payload;

      if (sarUUID) {
        if (ppType && ppType !== "Module") {
          await dispatch(
            CREATE_ACCORDION_SAR_FORM_ITEM({
              accordionUUID,
              editorUUID: uuid,
              sarUUID: sarUUID,
            })
          );
        } else {
          const editorFormUUID = getFormUUID(accordionUUID, uuid);

          // Add sfr module form item
          if (editorFormUUID) {
            await dispatch(
              CREATE_ACCORDION_SAR_MODULE_FORM_ITEM({
                accordionUUID,
                formUUID: editorFormUUID,
                innerFormUUID: uuid,
                newUUID: sarUUID,
                contentType: "sars",
              })
            );
          }
        }

        // Update snackbar
        handleSnackBarSuccess("New SAR Section Successfully Added");
      }
      setSarSectionName("");
    }
  };
  /**
   * Handles opening the sfr confirmation dialog
   */
  const handleOpenSfrConfirmationDialog = () => {
    setOpenSfrConfirmationDialog(!openSfrConfirmationDialog);
  };
  /**
   * Handles opening the sar confirmation dialog
   */
  const handleOpenSarConfirmationDialog = () => {
    setOpenSarConfirmationDialog(!openSarConfirmationDialog);
  };
  /**
   * Handles the dropdown to select the sfr module requirement type
   * @param event the event as a domNode
   */
  const handleSfrModuleType = (event) => {
    setSelectedSfrModule(event.target.value);
  };

  // Helper Methods
  /**
   * Gets the parent form uuid
   * @param accordionUUID the accordion uuid
   * @param uuid the uuid
   * @returns {*|null}
   */
  const getFormUUID = (accordionUUID, uuid) => {
    const isAccordionValid = accordions.hasOwnProperty(accordionUUID) && accordions[accordionUUID].hasOwnProperty("formItems");

    if (!isAccordionValid) {
      return null;
    } else {
      const accordion = accordions[accordionUUID];
      const filteredFormItems = accordion.formItems.filter((item) => item.contentType === "editor");

      // Find form items parentUUID
      for (const item of filteredFormItems) {
        const { formItems, uuid: parentUUID } = item;

        if (formItems) {
          const match = formItems.find((subItem) => subItem.uuid === uuid);
          if (match) {
            return parentUUID;
          }
        }
      }
    }

    return null;
  };
  /**
   * Gets the title
   * @param uuid
   * @returns {*|string}
   */
  const getTitle = (uuid) => {
    return editors.hasOwnProperty(uuid) && editors[uuid].hasOwnProperty("title") ? editors[uuid].title : "";
  };
  /**
   * Gets the text
   * @param uuid the uuid
   * @returns {*|string}
   */
  const getText = (uuid) => {
    return editors.hasOwnProperty(uuid) && editors[uuid].hasOwnProperty("text") ? editors[uuid].text : "";
  };
  /**
   * Gets is open
   * @param uuid the uuid
   * @returns {*|boolean}
   */
  const getIsOpen = (uuid) => {
    return editors.hasOwnProperty(uuid) && editors[uuid].hasOwnProperty("open") ? editors[uuid].open : false;
  };
  /**
   * Gets the disabled value of the button for adding a new sfr section
   * @returns {boolean}
   */
  const getNewSfrSectionButtonDisabled = () => {
    let isSectionValid = isSfr && sfrSectionName && sfrSectionId;
    let isModuleValid = true;

    if (isModule) {
      isModuleValid = sfrModuleDropdown?.includes(selectedSfrModule);
    }

    return isSectionValid && isModuleValid ? false : true;
  };
  /**
   * Gets the disabled value of the button for adding a new sar section
   * @returns {boolean}
   */
  const getNewSarSectionButtonDisabled = () => {
    return isSar && sarSectionName && sarSectionName !== "" ? false : true;
  };

  // Use Memos
  /**
   * The TextEditor section
   */
  const TextEditor = useMemo(() => {
    return <TipTapEditor text={getText(uuid)} uuid={uuid} contentType={"editor"} handleTextUpdate={handleEditorTextUpdate} />;
  }, [uuid, editors[uuid]]);

  // Return Method
  return (
    <div className='mb-2'>
      <Card className={"border-2 border-gray-300"}>
        <CardBody className='mb-[-42px]'>
          <div className='flex'>
            <label className='mr-2 resize-none font-bold text-[14px] text-secondary'>{section}</label>
            <span />
            <Tooltip title={tooltip} id={uuid + tooltip + "Tooltip"} disableHoverListener={!(tooltip === "")} arrow>
              <textarea
                key={uuid}
                className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary'
                onBlur={(event) => handleSnackbarTextUpdates(handleEditorTitle, event)}
                defaultValue={title}
                readOnly={isEditable ? false : true}
              />
            </Tooltip>
            <span />
            {isEditable && (
              <IconButton sx={{ marginTop: "-8px" }} onClick={handleDeleteEditor} variant='contained'>
                <Tooltip title={"Delete Section"} id={uuid + "deleteTextEditorSection"}>
                  <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
                </Tooltip>
              </IconButton>
            )}
            <div>
              <span />
              <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapse} variant='contained'>
                <Tooltip
                  id={(isOpen ? "collapse" : "expand") + uuid + (isSfr ? "SfrSection" : isSar ? "SarSection" : "TextEditor")}
                  title={`${isOpen ? "Collapse " : "Expand "} ${isSfr ? "SFR Section" : isSar ? "SAR Section" : "Text Editor"}`}>
                  {isOpen ? <RemoveIcon htmlColor={primary} sx={icons.large} /> : <AddIcon htmlColor={primary} sx={icons.large} />}
                </Tooltip>
              </IconButton>
            </div>
          </div>
        </CardBody>
        <CardFooter className={!isOpen ? "m-2 p-1" : ""}>
          {isOpen ? (
            <div className='m-0 p-0 w-full border-0'>
              <div key={`${accordionUUID}-${uuid}-${section}-TipTapEditor`} className='text-left w-full overflow-x-hidden min-w-full'>
                {TextEditor}
                {isModule && title === "Security Functional Requirements" && <ModuleToeSfrs />}
              </div>
              {isSfr && (
                <div className='min-w-full border-t-2 border-gray-200 mt-6 mx-[-24px]'>
                  <div className='w-full mt-6 pb-1 pl-6 pr-4'>
                    <span className={`min-w-full inline-flex ${isModule ? "justify-center" : "items-baseline"}`}>
                      <div className={!isModule ? "min-w-[48%]" : "min-w-[32%]"}>
                        <FormControl fullWidth>
                          <TextField
                            color='primary'
                            required
                            key={sfrSectionName}
                            onBlur={(event) => handleSnackbarTextUpdates(handleSfrSectionName, event)}
                            defaultValue={sfrSectionName}
                            label='New SFR Section Name'
                          />
                        </FormControl>
                      </div>
                      <div className={`${!isModule ? "min-w-[48%]" : "min-w-[32%]"} pl-4`}>
                        <FormControl fullWidth required>
                          <TextField
                            color='primary'
                            required
                            key={sfrSectionId}
                            onBlur={(event) => handleSnackbarTextUpdates(handleSfrSectionId, event)}
                            defaultValue={sfrSectionId}
                            label='Requirement ID'
                          />
                        </FormControl>
                      </div>
                      {isModule && (
                        <div className='pl-4 min-w-[32%]'>
                          <FormControl fullWidth required>
                            <InputLabel id='demo-simple-select-label'>Type of Requirement</InputLabel>
                            <Select value={selectedSfrModule} label='Type of Requirements' onChange={handleSfrModuleType} sx={{ textAlign: "left" }}>
                              {sfrModuleDropdown.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      )}
                      <div className='pl-1'>
                        <IconButton
                          sx={{ marginBottom: "-32px" }}
                          onClick={handleNewSfrSection}
                          variant='contained'
                          disabled={getNewSfrSectionButtonDisabled()}>
                          <Tooltip title={"Add New SFR Section"} id={"addNewSfrSectionTooltip"}>
                            <AddCircleIcon htmlColor={getNewSfrSectionButtonDisabled() ? grayText : secondary} sx={icons.large} />
                          </Tooltip>
                        </IconButton>
                      </div>
                    </span>
                  </div>
                </div>
              )}
              {isSar && (
                <div className='min-w-full border-t-2 border-gray-200 mt-6 mx-[-24px]'>
                  <div className='w-full mt-6 pb-1 pl-6 pr-4'>
                    <span className='min-w-full inline-flex items-baseline'>
                      <div className='w-[98%]'>
                        <FormControl fullWidth>
                          <TextField
                            color='primary'
                            required
                            key={sarSectionName}
                            onBlur={(event) => handleSnackbarTextUpdates(handleSarSectionName, event)}
                            defaultValue={sarSectionName}
                            label='New SAR Section Name'
                          />
                        </FormControl>
                      </div>
                      <div className='pl-1'>
                        <IconButton
                          sx={{ marginBottom: "-32px" }}
                          onClick={handleNewSarSection}
                          variant='contained'
                          disabled={getNewSarSectionButtonDisabled()}>
                          <Tooltip title={"Add New SAR Section"} id={"addNewSarSectionTooltip"}>
                            <AddCircleIcon htmlColor={getNewSarSectionButtonDisabled() ? grayText : secondary} sx={icons.large} />
                          </Tooltip>
                        </IconButton>
                      </div>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}
        </CardFooter>
        {isSfr && (
          <DeleteSfrSectionConfirmation
            accordionUUID={accordionUUID}
            editorUUID={uuid}
            title={title}
            open={openSfrConfirmationDialog}
            handleOpen={handleOpenSfrConfirmationDialog}
          />
        )}
        {isSar && (
          <DeleteSarSectionConfirmation
            accordionUUID={accordionUUID}
            editorUUID={uuid}
            title={title}
            open={openSarConfirmationDialog}
            handleOpen={handleOpenSarConfirmationDialog}
          />
        )}
        <DeleteConfirmation title={title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={handleDeleteSection} />
      </Card>
    </div>
  );
}

// Export EditorSection.jsx
export default EditorSection;
