// Imports
import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, CardBody } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import { useDispatch, useSelector } from "react-redux";
import {
  COLLAPSE_THREAT_TERM,
  DELETE_OBJECTIVE_FROM_THREAT_USING_UUID,
  DELETE_THREAT_TERM,
  UPDATE_THREAT_TERM_CONSISTENCY_RATIONALE,
  UPDATE_THREAT_TERM_DEFINITION,
  UPDATE_THREAT_TERM_TITLE,
} from "../../../reducers/threatsSlice.js";
import {
  COLLAPSE_OBJECTIVE_TERM,
  DELETE_OBJECTIVE_TERM,
  UPDATE_OBJECTIVE_TERM_CONSISTENCY_RATIONALE,
  UPDATE_OBJECTIVE_TERM_DEFINITION,
  UPDATE_OBJECTIVE_TERM_TITLE,
} from "../../../reducers/objectivesSlice.js";
import { DELETE_OBJECTIVE_FROM_SFR_USING_UUID } from "../../../reducers/SFRs/sfrSectionSlice.js";
import {
  handleSnackBarError,
  handleSnackBarSuccess,
  getObjectiveMaps,
  getSfrMaps,
  getThreatMaps,
  mapObjectivesToSFRs,
} from "../../../utils/securityComponents.jsx";
import CardTemplate from "./CardTemplate.jsx";
import DeleteConfirmation from "../../modalComponents/DeleteConfirmation.jsx";
import FromBasePP from "./FromBasePP.jsx";
import RationaleTable from "./rationaleTable/RationaleTable.jsx";
import SfrRationaleTable from "./rationaleTable/SfrRationaleTable.jsx";
import TipTapEditor from "../TipTapEditor.jsx";
import "../components.css";

// External Components
/**
 * The definition section template used for module definition/consistency rationale
 * @param title the title of the accordion card
 * @param body the body of the accordion card
 * @param collapse the value of the collapse
 * @param handleCollapse the handler for the collapse
 * @param color the color of the collapse icon
 * @returns {JSX.Element}
 * @constructor
 */
const DefinitionSection = ({ title, body, collapse, handleCollapse, color }) => {
  return (
    <CardTemplate
      type={"parent"}
      header={
        <label style={{ color }} className='resize-none font-bold text-[14px] p-0 pr-4'>
          {title}
        </label>
      }
      body={<div className='p-6 pb-2 w-full bg-white'>{body}</div>}
      borderColor={"border-gray-200"}
      tooltip={title}
      collapse={collapse}
      collapseHandler={handleCollapse}
      collapseIconColor={color}
    />
  );
};

/**
 * The Definition component
 * @param accordionTitle the accordion title
 * @param termUUID the term uuid
 * @param index the index
 * @param uuid the uuid
 * @param title the title
 * @param from the from tag used to indicate that a PP-Module inherits a threat from a Base PP
 * @param definition the definition
 * @param consistencyRationale the consistency rationale used for threats/objectives for Modules
 * @param open the open value
 * @param item the item
 * @param contentType the content type
 * @returns {JSX.Element}
 * @constructor
 */
function Definition({ accordionTitle, termUUID, index, uuid, title, from = [], definition, consistencyRationale = "", open, item, contentType }) {
  // Prop Validation
  Definition.propTypes = {
    accordionTitle: PropTypes.string.isRequired,
    termUUID: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    from: PropTypes.array,
    definition: PropTypes.string.isRequired,
    consistencyRationale: PropTypes.string,
    open: PropTypes.bool.isRequired,
    item: PropTypes.object.isRequired,
    contentType: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const metadataSection = useSelector((state) => state.accordionPane.metadata);
  const { ppTemplateVersion, ppType } = metadataSection;
  const isModule = ppType && ppType === "Module";
  const isModuleThreat = isModule && contentType === "threats";
  const isModuleObjective = isModule && contentType === "objectives" && accordionTitle === "Security Objectives for the Operational Environment";
  const { secondary, icons } = useSelector((state) => state.styling);
  const [openDeleteDialog, setDeleteDialog] = useState(false);
  const [consistencyRationaleCollapse, setConsistencyRationaleCollapse] = useState(true);
  const [descriptionCollapse, setDescriptionCollapse] = useState(true);

  // Methods
  /**
   * Handles the title update
   * @param event the event
   */
  const handleTitleUpdate = (event) => {
    try {
      const titleUpdate = {
        uuid,
        title,
        newTitle: event.target.value,
      };

      // Update the title by type
      switch (contentType) {
        case "threats": {
          dispatch(
            UPDATE_THREAT_TERM_TITLE({
              ...titleUpdate,
              threatUUID: termUUID,
            })
          );
          break;
        }
        case "objectives": {
          dispatch(
            UPDATE_OBJECTIVE_TERM_TITLE({
              ...titleUpdate,
              objectiveUUID: termUUID,
            })
          );
          break;
        }
        default:
          break;
      }

      // Update success message
      handleSnackBarSuccess("Title Successfully Updated");
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the definition update
   * @param event the event
   */
  const handleDefinitionUpdate = (event) => {
    const definitionUpdate = {
      uuid,
      title,
      newDefinition: event,
    };

    // Update the definition by type
    switch (contentType) {
      case "threats": {
        dispatch(
          UPDATE_THREAT_TERM_DEFINITION({
            ...definitionUpdate,
            threatUUID: termUUID,
          })
        );
        break;
      }
      case "objectives": {
        dispatch(
          UPDATE_OBJECTIVE_TERM_DEFINITION({
            ...definitionUpdate,
            objectiveUUID: termUUID,
          })
        );
        break;
      }
      default:
        break;
    }
  };
  /**
   * Handles deleting the section
   * @returns {Promise<void>}
   */
  const handleDeleteSection = async () => {
    try {
      const deleteUpdate = {
        uuid,
        title,
      };

      // Delete section by type
      switch (contentType) {
        case "threats": {
          await dispatch(
            DELETE_THREAT_TERM({
              ...deleteUpdate,
              threatUUID: termUUID,
            })
          );
          handleSnackBarSuccess("Term Successfully Removed");
          break;
        }
        case "objectives": {
          const objectiveUpdate = {
            objectiveUUID: uuid,
          };
          await dispatch(DELETE_OBJECTIVE_FROM_SFR_USING_UUID(objectiveUpdate));
          await dispatch(DELETE_OBJECTIVE_FROM_THREAT_USING_UUID(objectiveUpdate));
          await dispatch(
            DELETE_OBJECTIVE_TERM({
              ...deleteUpdate,
              objectiveUUID: termUUID,
            })
          );
          handleSnackBarSuccess("Objective Term Successfully Removed.");
          break;
        }
        default:
          handleSnackBarError("Error - Term type invalid. No term removed.");
          break;
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    } finally {
      getObjectiveMaps();
      mapObjectivesToSFRs();
      getThreatMaps();
      getSfrMaps();
    }
  };
  /**
   * Handles collapsing the section
   */
  const handleCollapseSection = () => {
    const collapseUpdate = {
      uuid,
      title,
    };

    // Update the collapse value by type
    switch (contentType) {
      case "threats": {
        dispatch(
          COLLAPSE_THREAT_TERM({
            ...collapseUpdate,
            threatUUID: termUUID,
          })
        );
        break;
      }
      case "objectives": {
        dispatch(
          COLLAPSE_OBJECTIVE_TERM({
            ...collapseUpdate,
            objectiveUUID: termUUID,
          })
        );
        break;
      }
      default:
        break;
    }
  };
  /**
   * Updates the collapse value for the description section
   */
  const handleDescriptionCollapse = () => {
    setDescriptionCollapse(!descriptionCollapse);
  };
  /**
   * Handles updating the consistency rationale by type (objective or threat)
   * @param event the event as a string
   */
  const handleConsistencyRationaleUpdate = (event) => {
    const updateMap = {
      [isModuleThreat ? "threatUUID" : "objectiveUUID"]: termUUID,
      uuid,
      consistencyRationale: event,
    };

    // Update the consistency rationale by type
    if (isModuleThreat) {
      dispatch(UPDATE_THREAT_TERM_CONSISTENCY_RATIONALE(updateMap));
    } else if (isModuleObjective) {
      dispatch(UPDATE_OBJECTIVE_TERM_CONSISTENCY_RATIONALE(updateMap));
    }
  };
  /**
   * Updates the collapse value for the consistency rationale section
   */
  const handleConsistencyRationaleCollapse = () => {
    setConsistencyRationaleCollapse(!consistencyRationaleCollapse);
  };

  // Helper Methods
  /**
   * Gets is objective table
   * @returns {false|boolean|boolean}
   */
  const isObjectiveTable = () => {
    const title = accordionTitle ? accordionTitle.toLowerCase() : "";
    const isStandardThreat = title.toLowerCase().includes("threat") && ppTemplateVersion !== "CC2022 Direct Rationale";
    const isAssumption = title.toLowerCase().includes("assumption");

    return contentType === "threats" && (isStandardThreat || isAssumption);
  };

  // Use Memos
  /**
   * The definition editor section
   * @type {Element}
   */
  const DefinitionEditor = useMemo(() => {
    const body = <TipTapEditor uuid={uuid} text={definition || ""} contentType={"term"} handleTextUpdate={handleDefinitionUpdate} />;

    if (isModuleThreat || isModuleObjective) {
      return (
        <DefinitionSection
          title={"Description"}
          body={body}
          collapse={descriptionCollapse}
          handleCollapse={() => handleDescriptionCollapse()}
          color={secondary}
        />
      );
    } else {
      return body;
    }
  }, [definition, uuid, descriptionCollapse]);
  /**
   * The ConsistencyRationale section
   */
  const ConsistencyRationale = useMemo(() => {
    return (
      <div className={`m-0 p-0 pt-2 ${isModuleThreat ? "" : "mb-[-12px]"}`} key={uuid + "consistencyRationaleDiv"}>
        <DefinitionSection
          title={"Consistency Rationale"}
          body={
            <TipTapEditor
              text={consistencyRationale || ""}
              title={"consistencyRationale"}
              contentType={"term"}
              handleTextUpdate={handleConsistencyRationaleUpdate}
            />
          }
          collapse={consistencyRationaleCollapse}
          handleCollapse={() => handleConsistencyRationaleCollapse()}
          color={secondary}
        />
      </div>
    );
  }, [consistencyRationale, consistencyRationaleCollapse]);

  // Return Method
  return (
    <div className='p-1 pb-3' key={uuid + +"DefinitionBody"}>
      <Card className='border-2 border-gray-300' key={uuid + "DefinitionCard"}>
        <CardBody key={uuid + "CardBody"}>
          <div className='flex' key={uuid + "CardBodyDiv"}>
            <textarea
              key={title}
              className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-accent'
              onBlur={(event) => handleTitleUpdate(event)}
              id={uuid + "Title"}
              defaultValue={title}
            />
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
              <Tooltip title={"Delete Section"} id={termUUID + "deleteDefinitionSectionToolTip"}>
                <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
              </Tooltip>
            </IconButton>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapseSection} variant='contained'>
              <Tooltip id={(open ? "collapse" : "expand") + termUUID + "ItemTooltip"} title={`${open ? "Collapse " : "Expand "} Item`}>
                {open ? <RemoveIcon htmlColor={secondary} sx={icons.large} /> : <AddIcon htmlColor={secondary} sx={icons.large} />}
              </Tooltip>
            </IconButton>
          </div>
          {open ? (
            <div>
              {isModuleThreat && accordionTitle === "Threats" && (
                <div className='m-0 p-0 pt-2 mb-[-8px]' key={uuid + "FromTagDiv"}>
                  <FromBasePP threatUUID={termUUID} termUUID={uuid} from={from} />
                </div>
              )}
              <div className='m-0 p-0 pt-2' key={uuid + "TextEditorDiv"}>
                {DefinitionEditor}
              </div>
              {(isModuleThreat || isModuleObjective) && ConsistencyRationale}
              {isObjectiveTable() ? (
                <div className='pt-2' key={uuid + "RationaleTableDiv"}>
                  <RationaleTable
                    key={uuid + "RationaleTable"}
                    termUUID={termUUID}
                    index={index}
                    uuid={uuid}
                    title={title}
                    objectives={item.objectives}
                    open={item.tableOpen}
                    contentType={contentType}
                    objectiveMaps={getObjectiveMaps()}
                    objectiveSFRsMap={mapObjectivesToSFRs()}
                    threatMaps={getThreatMaps()}
                    sfrMaps={getSfrMaps()}
                  />
                </div>
              ) : (
                contentType === "threats" && (
                  <div className='pt-2' key={uuid + "SfrRationaleTableDiv"}>
                    <SfrRationaleTable
                      key={uuid + "RationaleTable"}
                      termUUID={termUUID}
                      index={index}
                      uuid={uuid}
                      title={title}
                      sfrs={item.sfrs ? item.sfrs : []}
                      open={item.tableOpen}
                      sfrMaps={getSfrMaps()}
                    />
                  </div>
                )
              )}
            </div>
          ) : (
            <div className='m-0 p-0 mt-[-15px]' />
          )}
        </CardBody>
      </Card>
      <DeleteConfirmation title={title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={handleDeleteSection} />
    </div>
  );
}

// Export Definition.jsx
export default Definition;
