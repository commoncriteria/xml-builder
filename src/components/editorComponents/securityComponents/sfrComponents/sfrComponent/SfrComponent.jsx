// Imports
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Checkbox, FormControl, TextField, Tooltip, Typography } from "@mui/material";
import { updateMetaDataItem } from "../../../../../reducers/accordionPaneSlice.js";
import {
  getComponentXmlID,
  handleSnackBarError,
  handleSnackbarTextUpdates,
  setSfrWorksheetUIItems,
  updateComponentItems,
} from "../../../../../utils/securityComponents.jsx";
import { areTechnicalDecisionHistoriesEqual, moveTechnicalDecisionComponentReferences } from "../../../../../utils/technicalDecisionHistory.js";
import CardTemplate from "../../CardTemplate.jsx";
import ExtendedComponentDefinition from "./selections/ExtendedComponentDefinition.jsx";
import FromPackage from "../../sfrModuleComponents/sfrSections/FromPackage.jsx";
import ImplementationDependent from "./selections/ImplementationDependent.jsx";
import SelectionBased from "./selections/SelectionBased.jsx";
import SfrAuditEvents from "./SfrAuditEvents.jsx";
import SfrCheckBox from "../SfrCheckBox.jsx";
import TechnicalDecisionAffectsDropdown from "../TechnicalDecisionAffectsDropdown.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import UseCaseBased from "./selections/UseCaseBased.jsx";

// type directive can be replace, no-change, insert-before/after
// subType is what the directive applies to (f-element, note, etc)
const getNoChangeXPathDetail = () => ({
  type: "no-change",
  subType: "no-change",
  isComponentReplacement: false,
  replacementElements: null,
  f_element_id: null,
});

const getXPathDetailsArray = (xPathDetails) => {
  if (Array.isArray(xPathDetails)) {
    return xPathDetails;
  }

  if (xPathDetails && Object.keys(xPathDetails).length > 0) {
    return Object.entries(xPathDetails).map(([type, detail]) => ({ type, ...(detail || {}) }));
  }

  return [];
};

const hasNoChangeXPathDetail = (xPathDetails) => {
  return getXPathDetailsArray(xPathDetails).some((detail) => detail.type === "no-change");
};

const updateNoChangeXPathDetails = (xPathDetails, checked) => {
  const details = getXPathDetailsArray(xPathDetails).filter((detail) => detail.type !== "no-change");
  return checked ? [...details, getNoChangeXPathDetail()] : details;
};

const normalizeCcId = (ccID) => ccID?.trim().toLowerCase() || "";

const getBasePPSfrSectionIds = (basePP) => {
  if (!basePP || typeof basePP !== "object") {
    return [];
  }

  return [...Object.keys(basePP.modifiedSfrs?.sfrSections || {}), ...Object.keys(basePP.additionalSfrs?.sfrSections || {})];
};

/**
 * The SfrComponent class that displays the data for the sfr component
 * @returns {JSX.Element}   the sfr component card content
 */
function SfrComponent() {
  // Constants
  const dispatch = useDispatch();
  const { secondary, grayTitle, checkboxPrimaryNoPad } = useSelector((state) => state.styling);
  const technicalDecisionHistory = useSelector((state) => state.accordionPane.metadata.technicalDecisionHistory);
  const sfrWorksheetUI = useSelector((state) => state.sfrWorksheetUI);
  const sfrSections = useSelector((state) => state.sfrSections);
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const moduleSfrSections = useSelector((state) => state.sfrs.sections);
  const { ppType } = useSelector((state) => state.accordionPane.metadata);
  const { component, componentUUID, openSfrComponent, sfrUUID } = sfrWorksheetUI;
  const { extendedComponentDefinition } = component;
  const noChangeChecked = component.noChange ?? hasNoChangeXPathDetail(component.xPathDetails);
  const showNoChangeExportNotice = component.modifiedSfr && !noChangeChecked;

  // Methods
  /**
   * Handles the open sfr component collapse/expand
   */
  const handleSetOpenSfrComponent = () => {
    const itemMap = {
      openSfrComponent: !openSfrComponent,
    };
    setSfrWorksheetUIItems(itemMap);
  };
  /**
   * Updates the component text by type
   * @param event the event as a dom handler for title and as text content otherwise
   * @param type the text type
   *             Options: title, definition
   */
  const updateComponentTextByType = (event, type) => {
    const value = event?.target ? event.target.value : event;
    const itemMap = {
      [type]: value,
    };

    // Update the text value by type
    updateComponentItems(itemMap);
  };
  /**
   * Updates the component id by type
   * @param event the updated value
   * @param type the component id by type
   *             Options: cc_id, iteration_id
   */
  const updateComponentIdByType = (event, type) => {
    const updatedValue = event.target.value;
    const ccID = type === "cc_id" ? updatedValue : component.cc_id;
    const iterationID = type === "cc_id" ? component.iteration_id : updatedValue;
    const xmlID = getComponentXmlID(ccID, iterationID, false, false);
    const itemMap = {
      [type]: type === "cc_id" ? ccID : iterationID,
      xml_id: xmlID,
    };
    const updatedComponent = {
      ...component,
      ...itemMap,
    };

    moveTechnicalDecisionReferences(component, updatedComponent);

    // Update id by type
    updateComponentItems(itemMap);
  };
  const getCurrentBasePPSfrSectionIds = () => {
    for (const basePP of Object.values(sfrBasePPs || {})) {
      const sectionIds = getBasePPSfrSectionIds(basePP);

      if (sectionIds.includes(sfrUUID)) {
        return sectionIds;
      }
    }

    return [];
  };

  const hasDuplicateCcIdInSections = (sectionIds, normalizedCcId) => {
    const uniqueSectionIds = [...new Set(sectionIds.filter(Boolean))];

    return uniqueSectionIds.some((sectionId) =>
      Object.entries(sfrSections?.[sectionId] || {}).some(
        ([uuid, sfrComponent]) => uuid !== componentUUID && normalizeCcId(sfrComponent?.cc_id) === normalizedCcId
      )
    );
  };

  const hasDuplicateCcIdInModule = (normalizedCcId) => {
    const moduleSfrSectionIds = Object.keys(moduleSfrSections || {});

    if (moduleSfrSectionIds.includes(sfrUUID)) {
      return hasDuplicateCcIdInSections(moduleSfrSectionIds, normalizedCcId);
    }

    const basePPSfrSectionIds = getCurrentBasePPSfrSectionIds();

    if (basePPSfrSectionIds.length > 0) {
      return hasDuplicateCcIdInSections(basePPSfrSectionIds, normalizedCcId);
    }

    return hasDuplicateCcIdInSections(Object.keys(sfrSections || {}), normalizedCcId);
  };

  /**
   * Checks whether another component already uses the supplied CC-ID.
   * @param {string} ccID candidate CC-ID
   * @returns {boolean}
   */
  const hasDuplicateCcId = (ccID) => {
    const normalizedCcId = normalizeCcId(ccID);

    if (!normalizedCcId) {
      return false;
    }

    if (ppType === "Module") {
      return hasDuplicateCcIdInModule(normalizedCcId);
    }

    return hasDuplicateCcIdInSections(Object.keys(sfrSections || {}), normalizedCcId);
  };

  /**
   * Handles component ID blur with CC-ID uniqueness validation.
   * @param event the updated value
   * @param type the component id by type
   */
  const handleComponentIdBlur = (event, type) => {
    const updatedValue = event.target.value;

    if (type === "cc_id" && hasDuplicateCcId(updatedValue)) {
      handleSnackBarError(`CC-ID "${updatedValue}" already exists. CC-IDs must be unique.`);
      event.target.value = component.cc_id || "";
      return;
    }

    handleSnackbarTextUpdates(updateComponentIdByType, event, type);
  };
  /**
   * Updates the xml_id directly from user input
   * @param event the dom event
   */
  const updateXmlId = (event) => {
    const updatedXmlId = event.target.value;

    updateComponentItems({ xml_id: updatedXmlId });
  };
  /**
   * Updates whether a modified SFR should export as no-change.
   * @param event the checkbox change event
   */
  const updateNoChange = (event) => {
    const checked = event.target.checked;

    updateComponentItems({
      noChange: checked,
      xPathDetails: updateNoChangeXPathDetails(component.xPathDetails, checked),
    });
  };
  /**
   * Moves the component and generated element references in technical decision affects metadata.
   * @param oldComponent the previous component
   * @param newComponent the updated component
   */
  const moveTechnicalDecisionReferences = (oldComponent, newComponent) => {
    const updatedHistory = moveTechnicalDecisionComponentReferences(technicalDecisionHistory, oldComponent, newComponent);

    if (!areTechnicalDecisionHistoriesEqual(technicalDecisionHistory, updatedHistory)) {
      dispatch(
        updateMetaDataItem({
          type: "technicalDecisionHistory",
          item: updatedHistory,
        })
      );
    }
  };

  // Components
  /**
   * The EditorCard section by type
   * @param type the type of the editor card (definition or consistency rationale)
   * @returns {JSX.Element}
   */
  const EditorCard = (type) => {
    const isDefinition = type === "definition";
    const title = isDefinition ? "Description" : "Consistency Rationale";
    const definitionTooltip = `The <description> element can contain anything, but it must be HTML or text, not XML. The contents of the <description> is what will appear in the text of the PP Module under the header for the modified SFR.`;
    const consistencyRationaleTooltip = `Consistency rationales are required only for SFRs within the Modified SFRs and Additional SFRs sections of a PP-Module.`;

    return (
      <CardTemplate
        type={"section"}
        header={
          <Tooltip arrow id={type + "Tooltip"} title={isDefinition ? definitionTooltip : consistencyRationaleTooltip}>
            <label style={{ color: secondary }} className='resize-none font-bold text-[14px] p-0 pr-4'>
              {title}
            </label>
          </Tooltip>
        }
        body={<div className='p-0 w-full bg-white'>{isDefinition ? DefinitionEditor : ConsistencyRationaleEditor}</div>}
        borderColor={"border-gray-200"}
      />
    );
  };

  // Use Memos
  /**
   * The extended component section
   */
  const ExtendedComponentSection = useMemo(() => {
    return <ExtendedComponentDefinition />;
  }, [extendedComponentDefinition]);
  /**
   * The DefinitionEditor section
   */
  const DefinitionEditor = useMemo(() => {
    return <TipTapEditor text={component.definition || ""} title={"definition"} contentType={"term"} handleTextUpdate={updateComponentTextByType} />;
  }, [component]);
  /**
   * The ConsistencyRationaleEditor section
   */
  const ConsistencyRationaleEditor = useMemo(() => {
    return (
      <TipTapEditor
        text={component.consistencyRationale || ""}
        title={"consistencyRationale"}
        contentType={"term"}
        handleTextUpdate={updateComponentTextByType}
      />
    );
  }, [component]);

  // Return Method
  return (
    <CardTemplate
      type={"parent"}
      title={"SFR Component"}
      tooltip={"SFR Component"}
      collapse={openSfrComponent}
      collapseHandler={handleSetOpenSfrComponent}
      body={
        <div className='min-w-full mt-4 justify-items-left grid grid-flow-row auto-rows-max'>
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-cols-2 gap-4 p-2 px-4'>
            <FormControl fullWidth>
              <Tooltip
                arrow
                id={"ccIDTooltip"}
                title={`Full ID of the SFR Component. Should follow the following format: 
                                     (Class Name)_(Family Name)_(Optional EXT).(Component Number)`}>
                <TextField key={component.cc_id} label='CC-ID' onBlur={(event) => handleComponentIdBlur(event, "cc_id")} defaultValue={component.cc_id} />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <Tooltip arrow title={"Full name of the component."} id={"nameTooltip"}>
                <TextField
                  key={component.title}
                  label='Name'
                  onBlur={(event) => handleSnackbarTextUpdates(updateComponentTextByType, event, "title")}
                  defaultValue={component.title}
                />
              </Tooltip>
            </FormControl>
          </div>
          <div
            className={`w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid ${
              component.modifiedSfr ? "grid-cols-3" : "grid-cols-2"
            } gap-4 p-2 px-4`}>
            <FormControl fullWidth>
              <Tooltip arrow title={"Optional iteration abbreviation (Used in ID creation)."} id={"iterationIDTooltip"}>
                <TextField
                  key={component.iteration_id}
                  label='Iteration ID'
                  onBlur={(event) => handleComponentIdBlur(event, "iteration_id")}
                  defaultValue={component.iteration_id}
                />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <Tooltip arrow title={"ID that will be used when the document is translated to XML."} id={"xmlIDTooltip"}>
                <TextField
                  key={component.xml_id}
                  label='XML ID'
                  onBlur={(event) => handleSnackbarTextUpdates(updateXmlId, event)}
                  defaultValue={component.xml_id}
                />
              </Tooltip>
            </FormControl>
            {component.modifiedSfr && (
              <div className='w-full min-h-[46px] px-2 border-[1px] border-[#bdbdbd] rounded-[4px] flex items-center'>
                <div style={grayTitle}>
                  <Box display='flex' alignItems={"center"}>
                    <Tooltip title={"Export this modified SFR with a <no-change/> directive."} id={"modifiedSfrNoChangeTooltip"} arrow>
                      <Checkbox checked={noChangeChecked} onChange={updateNoChange} sx={checkboxPrimaryNoPad} size='small' />
                    </Tooltip>
                    <Typography sx={{ fontSize: 13, paddingLeft: 0.5, paddingTop: 0.1 }}>No Change</Typography>
                  </Box>
                </div>
              </div>
            )}
          </div>
          {showNoChangeExportNotice && (
            <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg px-4 pb-2'>
              <Alert severity='warning' sx={{ py: 0, alignItems: "center", fontSize: 13 }}>
                If export detects no modified SFR changes, this SFR will be omitted. Check No Change to export a no-change declaration.
              </Alert>
            </div>
          )}
          {component.modifiedSfr && (
            <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg p-2 px-4 mb-[-16px]'>
              <FromPackage />
            </div>
          )}
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
            {component.modifiedSfr ? (
              EditorCard("definition")
            ) : (
              <FormControl fullWidth sx={{ padding: 1, paddingX: 2 }}>
                <TextField
                  key={component.definition}
                  label='Description'
                  onBlur={(event) => handleSnackbarTextUpdates(updateComponentTextByType, event, "definition")}
                  defaultValue={component.definition}
                />
              </FormControl>
            )}
            <div className='p-2 px-4'>
              <TechnicalDecisionAffectsDropdown refId={component.cc_id} selectId={`${componentUUID || "sfr-component"}-technical-decision`} />
            </div>
            {EditorCard("consistencyRationale")}
          </div>
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
            <CardTemplate
              type={"section"}
              header={<label className='resize-none font-bold text-[14px] p-0 pr-4 text-accent'>Component Selections</label>}
              body={
                <div className='max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
                  <SfrCheckBox
                    title={"Optional"}
                    isChecked={component.optional}
                    tooltipID={"mainOptionalCheckboxTooltip"}
                    tooltip={`Selecting this indicates that this is an optional SFR, and may be claimed 
                                             in the ST at the discretion of the ST author.`}
                  />
                  <SfrCheckBox
                    title={"Objective"}
                    isChecked={component.objective}
                    tooltipID={"mainObjectiveCheckboxTooltip"}
                    tooltip={`Selecting this requirement indicates that this SFR is not recognized by the
                                             common criteria, but NIAP expects it to become a mandatory requirement in 
                                             the future.`}
                  />
                  <SfrCheckBox
                    title={"Invisible"}
                    isChecked={component.invisible !== undefined ? component.invisible : false}
                    tooltipID={"mainInvisibleCheckboxTooltip"}
                    tooltip={
                      <span>
                        {`The "invisible" status is rarely used. It's purpose is to allow 
                                                 for the declaration of SFRs that should not appear in the PP. 
                                                 See the wiki for more examples: `}
                        <a
                          href='https://github.com/commoncriteria/pp-template/wiki/Components#component-declaration'
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{ textDecoration: "underline" }}>
                          Component Declaration Wiki
                        </a>
                        .
                        <br />
                        <br />* Note: This box can only be selected with Extended Component Definition.
                      </span>
                    }
                  />
                  <SelectionBased />
                  <UseCaseBased />
                  <ImplementationDependent />
                  {!component.modifiedSfr && ExtendedComponentSection}
                </div>
              }
            />
            <div className='max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
              <SfrAuditEvents />
            </div>
          </div>
        </div>
      }
    />
  );
}

// Export SfrComponent.jsx
export default SfrComponent;
