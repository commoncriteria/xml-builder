// Imports
import PropTypes from "prop-types";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import { DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import { ADD_FEATURE, RESET_FEATURES_STATE, UPDATE_FEATURES } from "../../reducers/featuresSlice.js";
import { deepCopy } from "../../utils/deepCopy.js";
import { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } from "../../utils/securityComponents.jsx";
import {
  getSfrSectionsEvaluationActivityDependencyUsage,
  removeEvaluationActivityDependenciesFromSfrSections,
} from "../../utils/evaluationActivityDependencyRemoval.js";
import EditableTable from "../editorComponents/EditableTable.jsx";
import TipTapEditor from "../editorComponents/TipTapEditor.jsx";
import DependencyDeleteWarning from "../modalComponents/DependencyDeleteWarning.jsx";

const implementationColumns = [
  { headerName: "ID", field: "id", editable: true, resizable: true, type: "Editor", flex: 1 },
  { headerName: "Title", field: "title", editable: true, resizable: true, type: "Editor", flex: 1 },
  { headerName: "Description", field: "description", editable: true, resizable: true, type: "Large Editor", flex: 3, maxLength: 5000 },
];

const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true };

/**
 * Displays the Introduction subsection that defines implementation-dependent product features.
 * @param {string} section section number shown in the accordion header
 * @param {string} accordionUUID parent accordion UUID
 * @param {string} uuid form item UUID
 * @returns {JSX.Element}
 */
function ImplementationDependentRequirements({ section, accordionUUID, uuid }) {
  // Prop Validation
  ImplementationDependentRequirements.propTypes = {
    section: PropTypes.string.isRequired,
    accordionUUID: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const implementationData = useSelector((state) => state.features);
  const sfrSections = useSelector((state) => state.sfrSections);
  const { icons, primary, requirementsStyling } = useSelector((state) => state.styling);
  const { title, text, featureList, xmlTagMeta, open } = implementationData;
  const [dependencyDeleteWarning, setDependencyDeleteWarning] = useState(null);

  // Methods
  /**
   * Updates the implementation data state.
   * @param {Object} itemMap fields to merge into implementation data
   */
  const updateImplementationData = (itemMap) => {
    dispatch(UPDATE_FEATURES({ itemMap }));
  };
  /**
   * Handles section title updates.
   * @param {Event} event DOM event
   */
  const handleTitleUpdate = (event) => {
    const updatedTitle = event.target.value;

    updateImplementationData({
      title: updatedTitle,
      xmlTagMeta: {
        ...xmlTagMeta,
        attributes: {
          ...(xmlTagMeta?.attributes || {}),
          title: updatedTitle,
        },
      },
    });
  };
  /**
   * Handles rich text updates before the feature table.
   * @param {string} updatedText updated rich text
   */
  const handleTextUpdate = (updatedText) => {
    updateImplementationData({ text: updatedText });
  };
  /**
   * Handles adding a new feature row.
   */
  const handleNewTableRow = () => {
    dispatch(ADD_FEATURE());
  };
  /**
   * Handles feature cell updates.
   * @param {Object} event AG Grid update event
   */
  const handleUpdateTableRow = (event) => {
    const { rowIndex, colDef, value } = event;
    const field = colDef.field;
    const updatedFeatures = deepCopy(featureList);

    if (updatedFeatures[rowIndex] && field) {
      updatedFeatures[rowIndex][field] = value;
      updateImplementationData({ featureList: updatedFeatures });
    }
  };
  /**
   * Handles deleted feature rows.
   * @param {Array} updatedRows remaining table rows
   */
  const handleDeleteTableRows = (updatedRows, selectedRows = []) => {
    const dependencyValues = selectedRows.map((row) => row?.id).filter(Boolean);
    const usage = getSfrSectionsEvaluationActivityDependencyUsage(sfrSections, dependencyValues);

    if (usage.total > 0) {
      setDependencyDeleteWarning({
        updatedRows,
        dependencyValues,
        usage,
        selectedCount: selectedRows.length,
        itemLabel: selectedRows.length > 1 ? `${selectedRows.length} features` : `feature "${selectedRows[0]?.title || selectedRows[0]?.id || ""}"`,
      });
      return false;
    }

    updateImplementationData({ featureList: updatedRows });
  };
  /**
   * Closes the dependency delete warning.
   */
  const handleCloseDependencyDeleteWarning = () => {
    setDependencyDeleteWarning(null);
  };
  /**
   * Deletes pending feature rows and removes any dependent evaluation activity relationships.
   */
  const handleSubmitDependencyDeleteWarning = () => {
    if (!dependencyDeleteWarning) return;

    removeEvaluationActivityDependenciesFromSfrSections(dependencyDeleteWarning.dependencyValues);
    updateImplementationData({ featureList: dependencyDeleteWarning.updatedRows });
    handleSnackBarSuccess(dependencyDeleteWarning.selectedCount > 1 ? "Selected Rows were Successfully Removed" : "Selected Row Successfully Removed");
    handleCloseDependencyDeleteWarning();
  };
  /**
   * Handles section collapse state.
   */
  const handleCollapse = () => {
    updateImplementationData({ open: !open });
  };
  /**
   * Removes the implementation-dependent Introduction subsection.
   */
  const handleDeleteSection = () => {
    try {
      dispatch(RESET_FEATURES_STATE());
      dispatch(
        DELETE_ACCORDION_FORM_ITEM({
          accordionUUID,
          uuid,
        })
      );
      handleSnackBarSuccess("Implementation-dependent Requirements Section Successfully Deleted");
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Return Method
  return (
    <div className='min-w-full mb-2' key={"implementationDependentRequirementsDiv"}>
      <Card className='h-full w-full rounded-lg border-2 border-gray-300'>
        <CardBody className='mb-0 rounded-b-none' key={"implementationDependentRequirementsCardBody"}>
          <div className='flex'>
            <label className='mr-2 resize-none font-bold text-[14px] text-secondary'>{section}</label>
            <span />
            <Tooltip
              title={"Defines product features that implementation-dependent SFRs can reference with depends."}
              id={"implementationDependentRequirementsTooltip"}
              arrow>
              <textarea
                key={title}
                className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary'
                defaultValue={title}
                onBlur={(event) => handleSnackbarTextUpdates(handleTitleUpdate, event)}
              />
            </Tooltip>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={handleDeleteSection} variant='contained'>
              <Tooltip title={"Delete Section"} id={"deleteImplementationDependentRequirementsSectionButton"}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapse} variant='contained'>
              <Tooltip
                key={open ? "open" : "closed"}
                title={`${open ? "Collapse " : "Expand "} Implementation-dependent Requirements`}
                id={(open ? "collapse" : "expand") + "ImplementationDependentRequirementsTooltip"}>
                {open ? <RemoveIcon htmlColor={primary} sx={icons.large} /> : <AddIcon htmlColor={primary} sx={icons.large} />}
              </Tooltip>
            </IconButton>
          </div>
        </CardBody>
        {open ? (
          <div>
            <div className='px-1'>
              <CardFooter className='min-w-full m-0 p-0 rounded-b-none border-b-2 border-gray-200 mt-[-18px]'>
                <div className='mx-5 mt-0 mb-6 bg-gray-40' key={"implementationDependentRequirementsFooterDiv"}>
                  <div className='w-full px-4 pt-4'>
                    <TipTapEditor className='w-full' text={text} contentType={"term"} handleTextUpdate={handleTextUpdate} />
                  </div>
                  <div className='px-4 pt-4 mb-[-8px]'>
                    <EditableTable
                      title={"Product Features"}
                      editable={editable}
                      columnData={deepCopy(implementationColumns)}
                      rowData={deepCopy(featureList)}
                      handleNewTableRow={handleNewTableRow}
                      handleUpdateTableRow={handleUpdateTableRow}
                      handleDeleteTableRows={handleDeleteTableRows}
                      tableInstructions={`To edit a cell, double-click on it.`}
                      styling={requirementsStyling.other}
                    />
                  </div>
                </div>
              </CardFooter>
            </div>
          </div>
        ) : (
          <div className='m-0 p-0 mt-[-15px]' />
        )}
      </Card>
      <DependencyDeleteWarning
        itemLabel={dependencyDeleteWarning?.itemLabel || "feature"}
        open={Boolean(dependencyDeleteWarning)}
        handleOpen={handleCloseDependencyDeleteWarning}
        handleSubmit={handleSubmitDependencyDeleteWarning}
        usage={dependencyDeleteWarning?.usage}
      />
    </div>
  );
}

// Export ImplementationDependentRequirements.jsx
export default ImplementationDependentRequirements;
