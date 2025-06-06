// Imports
import { useSelector } from "react-redux";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { getSelectionBasedArrayByType, getToggleSwitch, updateComponentItems } from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import MultiSelectDropdown from "../../../MultiSelectDropdown.jsx";

/**
 * The UseCaseBased class that displays the component use case based toggle
 * @returns {JSX.Element} the generic content
 * @constructor passes in props to the class
 */
function UseCaseBased() {
  // Constants
  const { componentUUID, component, allSfrOptionsMap } = useSelector((state) => state.sfrWorksheetUI);
  const { useCases, useCaseBased: isToggled, invisible } = component;

  // Methods
  /**
   * Handles updates to the use based toggle
   * @param event the event
   */
  const handleUpdateUseCaseBasedToggle = (event) => {
    if (!invisible) {
      const useCaseBased = event.target.checked;
      let itemMap = {
        useCaseBased: useCaseBased,
      };

      // Set use cases to an empty array if not checked
      if (!useCaseBased) {
        itemMap.useCases = [];
      }

      // Update use case based toggle
      updateComponentItems(itemMap);
    }
  };

  // Helper Methods
  /**
   * Updates the use case based selections
   * @param title the title
   * @param selections the selections
   */
  const updateUseCaseBasedSelections = (title, selections) => {
    const useCaseSelections = getSelectionBasedArrayByType(allSfrOptionsMap, selections, title, "uuid");
    const itemMap = {
      useCases: useCaseSelections,
    };

    // Update use case based selections
    updateComponentItems(itemMap);
  };
  /**
   * Gets the selected use cases
   */
  const getSelectedUseCases = () => {
    let currentUseCases = deepCopy(useCases);
    return getSelectionBasedArrayByType(allSfrOptionsMap, currentUseCases, "Use Cases", "name");
  };

  // Components
  /**
   * The use case based toggle section
   * @returns {JSX.Element}
   */
  const getUseCaseBasedToggle = () => {
    const isToggled = component.useCaseBased;
    const title = "Use Case Based";
    const tooltipID = "useCasedBasedToggleTooltip";
    const tooltip = "Selecting this indicates that this SFR is dependent on a Use Case defined in the Use Case section.";

    return getToggleSwitch(title, isToggled, tooltipID, tooltip, handleUpdateUseCaseBasedToggle);
  };

  // Return Method
  return !isToggled ? (
    <div>{getUseCaseBasedToggle()}</div>
  ) : (
    <div className='mx-[-10px]'>
      <CardTemplate
        type={"section"}
        header={<div className='my-[-6px]'>{getUseCaseBasedToggle()}</div>}
        body={
          <div className='pt-1 pb-3 px-1' key={`${componentUUID}-use-case-based}`}>
            <MultiSelectDropdown
              selectionOptions={allSfrOptionsMap.dropdownOptions.useCases}
              selections={getSelectedUseCases()}
              title={"Use Cases"}
              handleSelections={updateUseCaseBasedSelections}
            />
          </div>
        }
      />
    </div>
  );
}

// Export UseCaseBased.jsx
export default UseCaseBased;
