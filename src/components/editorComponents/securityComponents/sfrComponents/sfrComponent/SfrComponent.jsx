// Imports
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { FormControl, TextField, Tooltip } from "@mui/material";
import { getComponentXmlID, handleSnackbarTextUpdates, setSfrWorksheetUIItems, updateComponentItems } from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import ExtendedComponentDefinition from "./selections/ExtendedComponentDefinition.jsx";
import FromPackage from "../../sfrModuleComponents/sfrSections/FromPackage.jsx";
import ImplementationDependent from "./selections/ImplementationDependent.jsx";
import SelectionBased from "./selections/SelectionBased.jsx";
import SfrAuditEvents from "./SfrAuditEvents.jsx";
import SfrCheckBox from "../SfrCheckBox.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import UseCaseBased from "./selections/UseCaseBased.jsx";

/**
 * The SfrComponent class that displays the data for the sfr component
 * @returns {JSX.Element}   the sfr component card content
 */
function SfrComponent() {
  // Constants
  const { secondary } = useSelector((state) => state.styling);
  const { sfrWorksheetUI } = useSelector((state) => state);
  const { component, openSfrComponent } = sfrWorksheetUI;
  const { extendedComponentDefinition } = component;

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
    const value = type === "title" ? event.target.value : event;
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

    // Update id by type
    updateComponentItems(itemMap);
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
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4'>
            <FormControl fullWidth>
              <Tooltip
                arrow
                id={"ccIDTooltip"}
                title={`Full ID of the SFR Component. Should follow the following format: 
                                     (3 letter Family)_(3 Letter Class)_(Optional EXT).(Number representing 
                                     the component)`}>
                <TextField
                  key={component.cc_id}
                  label='CC-ID'
                  onBlur={(event) => handleSnackbarTextUpdates(updateComponentIdByType, event, "cc_id")}
                  defaultValue={component.cc_id}
                />
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
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg grid grid-flow-col columns-2 gap-4 p-2 px-4'>
            <FormControl fullWidth>
              <Tooltip arrow title={"Optional iteration abbreviation (Used in ID creation)."} id={"iterationIDTooltip"}>
                <TextField
                  key={component.iteration_id}
                  label='Iteration ID'
                  onBlur={(event) => handleSnackbarTextUpdates(updateComponentIdByType, event, "iteration_id")}
                  defaultValue={component.iteration_id}
                />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <Tooltip arrow title={"ID that will be used when the document is translated to XML."} id={"xmlIDTooltip"}>
                <TextField key={component.xml_id} label='XML ID' defaultValue={component.xml_id} />
              </Tooltip>
            </FormControl>
          </div>
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
            {(component.additionalSfr || component.modifiedSfr) && <div>{EditorCard("consistencyRationale")}</div>}
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
