// Imports
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import { DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import {
  ADD_NEW_TABLE_ROW,
  RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE,
  UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY,
  UPDATE_DROPDOWN_MENU_OPTIONS,
  UPDATE_ROW_DATA_COMPONENT_ID_BY_INDEX,
  UPDATE_ROW_DATA_NOTES_BY_INDEX,
} from "../../reducers/compliantTargetsOfEvaluationSlice.js";
import { DELETE_EDITOR } from "../../reducers/editorSlice.js";
import { deepCopy } from "../../utils/deepCopy.js";
import { getCardTemplate, handleSnackBarError, handleSnackBarSuccess } from "../../utils/securityComponents.jsx";
import sfrComponents from "../../../public/data/sfr_components/sfr_components.json";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";
import EditableTable from "../editorComponents/EditableTable.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";
import "../editorComponents/components.css";

/**
 * The CompliantTargetsOfEvaluation component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function CompliantTargetsOfEvaluation(props) {
  // Prop Validation
  CompliantTargetsOfEvaluation.propTypes = {
    section: PropTypes.string.isRequired,
    accordionUUID: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    sfrMaps: PropTypes.object.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const { sections } = useSelector((state) => state.accordionPane);
  const { title, introText, columnData, rowData, dropdownMenuOptions, additionalText, open } = useSelector((state) => state.compliantTargetsOfEvaluation);
  const editors = useSelector((state) => state.editors);
  const { icons, primary, secondary, requirementsStyling } = useSelector((state) => state.styling);
  const [openDeleteDialog, setDeleteDialog] = useState(false);
  const [collapseIntroTextEditor, setCollapseIntroTextEditor] = useState(false);
  const [collapseAdditionalTextEditor, setCollapseAdditionalTextEditor] = useState(false);
  const headerTextColor = "text-accent";
  const collapseIconColor = secondary;

  // Use Effects
  useEffect(() => {
    dispatch(UPDATE_DROPDOWN_MENU_OPTIONS({ sfrComponents }));
  }, [props.sfrMaps, rowData]);

  // Methods
  /**
   * Handles the update for the introduction text
   * @param text the introduction text
   */
  const handleIntroductionTextUpdate = (text) => {
    const itemMap = { introText: text };

    // Update Compliant Targets Of Evaluation
    updateCompliantTargetsOfEvaluation(itemMap);
  };
  /**
   * Handles adding a new table row
   */
  const handleNewTableRow = () => {
    dispatch(ADD_NEW_TABLE_ROW());
  };
  /**
   * Handles updating the row notes by index
   * @param event the update event
   */
  const handleUpdateTableRowNotes = (event) => {
    const { rowIndex, value } = event;

    try {
      dispatch(
        UPDATE_ROW_DATA_NOTES_BY_INDEX({
          index: rowIndex,
          value: value,
        })
      );
    } catch (e) {
      console.log(e);
    }
  };
  /**
   * Handles deleting table rows
   * @param newData the new table row data
   */
  const handleDeleteTableRows = (newData) => {
    const itemMap = { rowData: newData };

    // Update Compliant Targets Of Evaluation
    updateCompliantTargetsOfEvaluation(itemMap);
  };
  /**
   * Handles the dropdown menu select
   * @param event the event
   */
  const handleDropdownMenuSelect = (event) => {
    const { rowIndex, target } = event;
    const { value } = target;

    dispatch(UPDATE_DROPDOWN_MENU_OPTIONS({ sfrComponents }));

    dispatch(
      UPDATE_ROW_DATA_COMPONENT_ID_BY_INDEX({
        index: rowIndex,
        value,
        dropdownMenuOptions,
      })
    );
  };
  /**
   * Handles the update for the additional text
   * @param text the additional text
   */
  const handleAdditionalTextUpdate = (text) => {
    const itemMap = { additionalText: text };

    // Update Compliant Targets Of Evaluation
    updateCompliantTargetsOfEvaluation(itemMap);
  };
  /**
   * Handles the section collapse
   */
  const handleCollapse = () => {
    const collapse = !open;
    const itemMap = { open: collapse };

    // Update Compliant Targets Of Evaluation
    updateCompliantTargetsOfEvaluation(itemMap);
  };
  /**
   * Deletes the TOE Overview in the slices
   */
  const deleteTOEOverview = () => {
    try {
      const { accordionUUID, uuid } = props;

      if (accordionUUID && uuid) {
        // Clear out compliant targets of evaluation
        dispatch(RESET_COMPLIANT_TARGETS_OF_EVALUATION_STATE());

        // Get editor uuids
        const editorUUIDs = getEditors(accordionUUID, uuid);

        // Delete accordion section
        dispatch(
          DELETE_ACCORDION_FORM_ITEM({
            accordionUUID: accordionUUID,
            uuid: uuid,
          })
        );

        // Delete editors
        deleteEditors(editorUUIDs);
      }

      // Update snackbar
      handleSnackBarSuccess(`${title} Section Successfully Deleted`);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Helper Methods
  /**
   * Updates the compliant targets of evaluation in the slices
   * @param itemMap the item map with the updated information
   */
  const updateCompliantTargetsOfEvaluation = (itemMap) => {
    dispatch(UPDATE_COMPLIANT_TARGETS_OF_EVALUATION_BY_KEY({ itemMap }));
  };
  /**
   * Gets the editors from the accordion pane slice with specified UUIDs
   * @param accordionUUID the accordion UUID
   * @param uuid the form UUID
   * @returns {any[]}
   */
  const getEditors = (accordionUUID, uuid) => {
    const isSectionValid = accordionUUID && uuid && sections.hasOwnProperty(accordionUUID) && sections[accordionUUID].hasOwnProperty("formItems");

    // Get editor uuids
    if (isSectionValid) {
      const formItems = sections[accordionUUID].formItems;
      const targetFormItem = formItems.find((item) => item.uuid === uuid);

      if (targetFormItem && targetFormItem.hasOwnProperty("formItems")) {
        return targetFormItem.formItems.map((item) => item.uuid);
      }
    }
  };
  /**
   * Deletes the editors in the slices with the specified uuids
   * @param editorUUIDs the editor UUIDs
   */
  const deleteEditors = (editorUUIDs) => {
    editorUUIDs?.forEach((uuid) => {
      if (editors.hasOwnProperty(uuid)) {
        const { title } = editors[uuid];
        dispatch(
          DELETE_EDITOR({
            title: title,
            uuid: uuid,
          })
        );
      }
    });
  };

  // Components
  /**
   * Creates a text editor card
   * @param header The header text for the card
   * @param text The text content for the editor
   * @param handleTextUpdate The function to handle text updates
   * @param tooltip The tooltip text for the card
   * @param collapseState The current collapse state
   * @param setCollapseState The function to toggle collapse state
   * @returns {Element}
   */
  const createTextEditorCard = (header, text, handleTextUpdate, tooltip, collapseState, setCollapseState) => {
    const body = (
      <div className='w-full p-4 pb-0 mb-[-8px]'>
        <TipTapEditor className='w-full' text={text} contentType={"term"} handleTextUpdate={handleTextUpdate} />
      </div>
    );

    return getCardTemplate(header, body, tooltip, collapseState, () => setCollapseState(!collapseState), headerTextColor, collapseIconColor);
  };
  /**
   * Usage for Introduction Text Editor
   * @returns {Element}
   */
  const introductionTextEditor = () => {
    return createTextEditorCard(
      "Introduction Text",
      introText,
      handleIntroductionTextUpdate,
      "Input the text that will be displayed prior to the Components Needed Table.",
      collapseIntroTextEditor,
      setCollapseIntroTextEditor
    );
  };
  /**
   * The Components Needed Table component
   * @returns {Element}
   */
  const getComponentsNeededTable = () => {
    const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true };

    return (
      <div className='mt-2 mb-[-8px]'>
        <EditableTable
          title={"Components Needed"}
          editable={editable}
          columnData={deepCopy(columnData)}
          rowData={deepCopy(rowData)}
          handleNewTableRow={handleNewTableRow}
          handleUpdateTableRow={handleUpdateTableRowNotes}
          handleDeleteTableRows={handleDeleteTableRows}
          handleDropdownMenuSelect={handleDropdownMenuSelect}
          tableInstructions={`To edit a cell, double-click on it. The data will automatically sort once each "Component" value is selected.`}
          styling={requirementsStyling.other}
          dropdownMenuOptions={deepCopy(dropdownMenuOptions)}
        />
      </div>
    );
  };
  /**
   * Usage for Additional Text Editor
   * @returns {Element}
   */
  const additionalTextEditor = () => {
    return createTextEditorCard(
      "Additional Text",
      additionalText,
      handleAdditionalTextUpdate,
      "Input the text that will be displayed following the Components Needed Table.",
      collapseAdditionalTextEditor,
      setCollapseAdditionalTextEditor
    );
  };

  // Use Memo
  /**
   * The additional editor component
   */
  const IntroductionEditor = useMemo(() => {
    return introductionTextEditor();
  }, [introText, collapseIntroTextEditor]);
  /**
   * The additional editor component
   */
  const AdditionalEditor = useMemo(() => {
    return additionalTextEditor();
  }, [additionalText, collapseAdditionalTextEditor]);

  // Return Method
  return (
    <div className='min-w-full mb-2' key={"compliantTargetsOfEvaluationDiv"}>
      <Card className='h-full w-full rounded-lg border-2 border-gray-300'>
        <CardBody className='mb-0 rounded-b-none' key={"TOECardBody"}>
          <div className='flex'>
            <label className='mr-2 resize-none font-bold text-[14px] text-secondary'>{props.section}</label>
            <span />
            <Tooltip
              title={`This is a section that commonly appears in the Introduction of a Functional Package. It often 
                            includes information about how to include the Package with PP and Modules. Most importantly, 
                            it specifies the dependencies that the Package has on the PP or Module that includes it.`}
              id={"compliantTargetsOfEvaluationTooltip"}
              arrow>
              <textarea className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary' value={title} readOnly>
                {title}
              </textarea>
            </Tooltip>
            <span />
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
              <Tooltip title={"Delete Section"} id={"deleteTOEOverviewSectionButton"}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapse} variant='contained'>
              <Tooltip title={`${open ? "Collapse " : "Expand "} TOE Overview`} id={(open ? "collapse" : "expand") + "TOEOverviewTooltip"}>
                {open ? <RemoveIcon htmlColor={primary} sx={icons.large} /> : <AddIcon htmlColor={primary} sx={icons.large} />}
              </Tooltip>
            </IconButton>
          </div>
        </CardBody>
        {open ? (
          <div>
            <div className='px-1'>
              <CardFooter className='min-w-full m-0 p-0 rounded-b-none border-b-2 border-gray-200 mt-[-18px]'>
                <div className='mx-5 mt-0 mb-6 bg-gray-40' key={"toeFooterDiv"}>
                  {IntroductionEditor}
                  <div className='mt-[-4px]' />
                  {getComponentsNeededTable()}
                  <div className='mb-5' />
                  {AdditionalEditor}
                </div>
              </CardFooter>
            </div>
          </div>
        ) : (
          <div className='m-0 p-0 mt-[-15px]' />
        )}
      </Card>
      <DeleteConfirmation title={title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={deleteTOEOverview} />
    </div>
  );
}

// Export CompliantTargetsOfEvaluation.jsx
export default CompliantTargetsOfEvaluation;
