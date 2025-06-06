// Imports
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import { useSelector } from "react-redux";
import { getSelectionBasedArrayByType, getToggleSwitch, updateComponentItems } from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import MultiSelectDropdown from "../../../MultiSelectDropdown.jsx";

/**
 * The SelectionBased class that displays the component selection toggle
 * @returns {JSX.Element} the generic content
 * @constructor passes in props to the class
 */
function SelectionBased() {
  // Constants
  const { component, allSfrOptionsMap } = useSelector((state) => state.sfrWorksheetUI);
  const { selectionBased: isToggled, selections, invisible } = component;

  // Methods
  /**
   * Handles the update selection based toggle
   * @param event
   */
  const handleUpdateSelectionBasedToggle = (event) => {
    if (!invisible) {
      const selectionBased = event.target.checked;
      let itemMap = {
        selectionBased: selectionBased,
      };

      if (!selectionBased) {
        itemMap.selections = {
          elements: [],
          components: [],
          selections: [],
        };
      }

      // Update selection based toggle
      updateComponentItems(itemMap);
    }
  };

  // Helper Methods
  /**
   * Updates the selection based selections
   * @param title the title
   * @param selections the selections
   */
  const updateSelectionBasedSelections = (title, selections) => {
    let itemMap = {
      selections: deepCopy(component.selections),
    };
    if (!itemMap.selections.hasOwnProperty("components")) {
      itemMap.selections.components = [];
    }
    if (!itemMap.selections.hasOwnProperty("elements")) {
      itemMap.selections.elements = [];
    }
    if (!itemMap.selections.hasOwnProperty("selections")) {
      itemMap.selections.selections = [];
    }

    // Get selections by type
    if (title.toLowerCase() === "components") {
      itemMap.selections.components = getSelectedComponentsWithUUID(selections);
    } else if (title.toLowerCase() === "elements") {
      itemMap.selections.elements = getSelectedElementsWithUUID(selections);

      // Clear out selections if elements is empty
      if (itemMap.selections.elements.length === 0 && itemMap.selections.selections.length > 0) {
        itemMap.selections.selections = [];
      }
      // Update selections to remove if the associated element(s) is no longer selected
      else if (itemMap.selections.elements.length > 0 && itemMap.selections.selections.length > 0) {
        let elementSelections = allSfrOptionsMap.elementSelections;
        let includedSelectables = [];
        let currentSelections = deepCopy(itemMap.selections.selections);
        itemMap.selections.elements.map((uuid) => {
          if (elementSelections.hasOwnProperty(uuid)) {
            let selectables = elementSelections[uuid];
            if (selectables.length > 0 && currentSelections.length > 0) {
              currentSelections.map((selection) => {
                if (selectables.includes(selection) && !includedSelectables.includes(selection)) {
                  includedSelectables.push(selection);
                }
              });
            }
          }
        });
        itemMap.selections.selections = includedSelectables;
      }
    } else if (title.toLowerCase() === "selections") {
      itemMap.selections.selections = getSelectedSelectionsByUUID(selections);
    }

    // Update selection based selections
    updateComponentItems(itemMap);
  };
  /**
   * Gets the component options
   * @returns {*}
   */
  const getComponentOptions = () => {
    let componentOptions = deepCopy(allSfrOptionsMap.dropdownOptions.components);
    let currentComponentName = component.cc_id;
    let index = componentOptions.indexOf(currentComponentName);

    if (index !== -1) {
      componentOptions.splice(index, 1);
    }

    return componentOptions;
  };
  /**
   * Gets the selected components
   * @returns {*[]}
   */
  const getSelectedComponents = () => {
    let currentlySelected = deepCopy(selections);
    return getSelectionBasedArrayByType(allSfrOptionsMap, currentlySelected.components, "components", "name");
  };
  /**
   * Gets elected components with uuid
   * @param selectedComponents the selected components
   * @returns {*[]}
   */
  const getSelectedComponentsWithUUID = (selectedComponents) => {
    return getSelectionBasedArrayByType(allSfrOptionsMap, selectedComponents, "components", "uuid");
  };
  /**
   * Gets the selected elements
   * @returns {*[]}
   */
  const getSelectedElements = () => {
    let currentlySelected = deepCopy(selections);
    return getSelectionBasedArrayByType(allSfrOptionsMap, currentlySelected.elements, "elements", "name");
  };
  /**
   * Gets the selected elements with uuid
   * @param selectedElements the selected elements
   * @returns {*[]}
   */
  const getSelectedElementsWithUUID = (selectedElements) => {
    return getSelectionBasedArrayByType(allSfrOptionsMap, selectedElements, "elements", "uuid");
  };
  /**
   * Gets the currently selected selections
   * @param options the options (optional)
   * @returns {*[]}
   */
  const getSelectedSelections = (options = null) => {
    let currentlySelected = options ? options : deepCopy(selections).selections;
    return getSelectionBasedArrayByType(allSfrOptionsMap, currentlySelected, "selections", "name");
  };
  /**
   * Gets the selected selections by uuid
   * @param selectedSelections the selected selections
   * @returns {*[]}
   */
  const getSelectedSelectionsByUUID = (selectedSelections) => {
    return getSelectionBasedArrayByType(allSfrOptionsMap, selectedSelections, "selections", "uuid");
  };
  /**
   * Gets the selection options
   * @returns {*[]}
   */
  const getSelectionOptions = () => {
    let selectionOptions = [];
    let selectedElements = getSelectedElements();
    const selectedElementsWithUUID = getSelectedElementsWithUUID(selectedElements);

    if (selectedElementsWithUUID.length > 0) {
      selectedElementsWithUUID.map((uuid) => {
        let options = allSfrOptionsMap.elementSelections[uuid];
        if (options && options.length > 0) {
          let values = getSelectedSelections(options);
          if (values && values.length > 0) {
            values.map((value) => {
              if (!selectionOptions.includes(value)) {
                selectionOptions.push(value);
              }
            });
          }
        }
      });
    }

    return selectionOptions;
  };

  // Components
  /**
   * The selection based toggle section
   * @returns {JSX.Element}
   */
  const getSelectionBasedToggle = () => {
    const title = "Selection Based";
    const tooltipID = "selectionBasedToggleTooltip";
    const tooltip = "Selecting this indicates that this SFR is dependent on a selection elsewhere in the document.";

    return getToggleSwitch(title, isToggled, tooltipID, tooltip, handleUpdateSelectionBasedToggle);
  };

  // Return Method
  return !isToggled ? (
    <div>{getSelectionBasedToggle()}</div>
  ) : (
    <div className='mx-[-10px]'>
      <CardTemplate
        type={"section"}
        header={<div className='my-[-6px]'>{getSelectionBasedToggle()}</div>}
        body={
          <div className='pt-1 px-1'>
            <div className='pb-4'>
              <MultiSelectDropdown
                selectionOptions={getComponentOptions()}
                selections={getSelectedComponents()}
                title={"Components"}
                handleSelections={updateSelectionBasedSelections}
              />
            </div>
            <div className='pb-4'>
              <MultiSelectDropdown
                selectionOptions={allSfrOptionsMap.dropdownOptions.elements}
                selections={getSelectedElements()}
                title={"Elements"}
                handleSelections={updateSelectionBasedSelections}
              />
            </div>
            <div className='pb-3'>
              <MultiSelectDropdown
                selectionOptions={getSelectionOptions()}
                selections={getSelectedSelections()}
                title={"Selections"}
                handleSelections={updateSelectionBasedSelections}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}

// Export SelectionBased.jsx
export default SelectionBased;
