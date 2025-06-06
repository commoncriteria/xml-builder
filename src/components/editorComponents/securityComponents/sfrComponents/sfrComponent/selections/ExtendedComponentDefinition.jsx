// Imports
import { useSelector } from "react-redux";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { getToggleSwitch, updateComponentItems } from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import TipTapEditor from "../../../../TipTapEditor.jsx";

/**
 * The ExtendedComponentDefinition class that displays the component extended component definition toggle
 * @returns {JSX.Element} the generic content
 * @constructor passes in props to the class
 */
function ExtendedComponentDefinition() {
  // Constants
  const { componentUUID, component } = useSelector((state) => state.sfrWorksheetUI);
  const { extendedComponentDefinition } = component;
  const { componentLeveling, managementFunction, audit, dependencies, toggle: isToggled } = extendedComponentDefinition;
  const defaultValues = {
    toggle: false,
    audit: "",
    managementFunction: "",
    componentLeveling: "",
    dependencies: "",
  };

  // Methods
  /**
   * Handles text updates by type
   * @param event the text event
   * @param type the current type
   *             Options: audit, managementFunction, componentLeveling, dependencies
   */
  const handleTextUpdateByType = (event, type) => {
    let updatedExtendedComponentDefinition = extendedComponentDefinition
      ? deepCopy(extendedComponentDefinition)
      : deepCopy({
          ...defaultValues,
          toggle: true,
        });

    // Check if the type exists and is different
    if (!updatedExtendedComponentDefinition.hasOwnProperty(type) || JSON.stringify(updatedExtendedComponentDefinition[type]) !== JSON.stringify(event)) {
      updatedExtendedComponentDefinition[type] = event;

      // Update extended component definition
      updateExtendedComponentDefinition(updatedExtendedComponentDefinition);
    }
  };

  /**
   * Updates the extended definition toggle
   * @param event the event
   * @param extendedComponentDefinition the extended definition
   */
  const updateExtendedDefinitionToggle = (event, extendedComponentDefinition) => {
    const toggle = event.target.checked;

    // Clear out audit and managementFunction if toggle was set to false
    if (!toggle) {
      extendedComponentDefinition = {
        ...defaultValues,
        toggle: toggle,
      };
    } else {
      extendedComponentDefinition.toggle = toggle;
    }

    // Update extended component definition
    updateExtendedComponentDefinition(extendedComponentDefinition);
  };
  /**
   * Updates the extended component definition in the slice
   * @param updatedExtendedComponentDefinition the updated extended component definition
   */
  const updateExtendedComponentDefinition = (updatedExtendedComponentDefinition) => {
    // Update extended component definition
    const itemMap = {
      extendedComponentDefinition: updatedExtendedComponentDefinition,
    };
    updateComponentItems(itemMap);
  };

  // Components
  /**
   * Gets the extended component definition toggle section
   * @returns {JSX.Element}
   */
  const getExtendedComponentDefinitionToggle = () => {
    const title = "Extended Component Definition";
    const tooltipID = "extendedComponentDefinitionToggleTooltip";
    const tooltip = `Selecting this indicates that this SFR is an extension of an SFR defined in the Common Criteria, and may 
             therefore implement Component Leveling, SFR-specific Management Functions, Audit events, and Dependencies.`;

    return getToggleSwitch(title, isToggled, tooltipID, tooltip, updateExtendedDefinitionToggle, deepCopy(extendedComponentDefinition));
  };
  /**
   * Gets the extended component editor by type
   * @param value the value
   * @param type the type
   * @param title the title
   * @returns {JSX.Element}
   */
  const getExtendedComponentEditorByType = (value, type, title) => {
    return (
      <CardTemplate
        className='border-gray-300'
        type={"section"}
        header={<label className='resize-none font-bold text-[12px] p-0 pr-4 text-accent'>{`${title} Extended Component Description`}</label>}
        body={<TipTapEditor className='w-full' title={type} contentType={"term"} handleTextUpdate={handleTextUpdateByType} text={value ? value : ""} />}
      />
    );
  };

  // Return Method
  return !isToggled ? (
    <div>{getExtendedComponentDefinitionToggle()}</div>
  ) : (
    <div>
      <div className='mx-[-10px]'>
        <CardTemplate
          type={"section"}
          header={<div className='my-[-6px]'>{getExtendedComponentDefinitionToggle()}</div>}
          body={
            <div className='p-0 m-0 py-[6px] w-full' key={`${componentUUID}-extended-component-definition}`}>
              <div className='mt-[-8px] mx-[-10px] pb-[6px]'>
                {getExtendedComponentEditorByType(componentLeveling, "componentLeveling", "Component Leveling")}
              </div>
              <div className='mx-[-10px]'>{getExtendedComponentEditorByType(managementFunction, "managementFunction", "Management Function")}</div>
              <div className='mx-[-10px]'>{getExtendedComponentEditorByType(audit, "audit", "Audit")}</div>
              <div className='mx-[-10px]'>{getExtendedComponentEditorByType(dependencies, "dependencies", "Dependencies")}</div>
            </div>
          }
        />
      </div>
    </div>
  );
}

// Export ExtendedComponentDefinition.jsx
export default ExtendedComponentDefinition;
