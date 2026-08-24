// Imports
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_SFR_COMPONENT_ITEMS } from "../../../../../../reducers/SFRs/sfrSectionSlice.js";
import { getToggleSwitch, updateComponentItems } from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import MultiSelectDropdown from "../../../MultiSelectDropdown.jsx";

/**
 * The ImplementationDependent class that displays the implementation dependent reasons
 * @returns {JSX.Element}   the generic content
 * @constructor             passes in props to the class
 */
function ImplementationDependent() {
  // Constants
  const dispatch = useDispatch();
  const { sfrUUID, componentUUID, component } = useSelector((state) => state.sfrWorksheetUI);
  const implementationFeatures = useSelector((state) => state.features?.featureList || []);
  const { reasons, implementationDependent: isToggled, invisible } = component;

  // Methods
  /**
   * Handles updates to the implementation dependent toggle
   * @param event the event
   */
  const handleUpdateImplementationDependentToggle = (event) => {
    if (!invisible) {
      const implementationDependent = event.target.checked;
      let itemMap = {
        implementationDependent: implementationDependent,
      };
      if (!implementationDependent) {
        itemMap.reasons = [];
      }

      // Update implementation dependent toggle
      updateComponentItems(itemMap);
    }
  };

  // Helper Methods
  /**
   * Updates the implementation dependent slice
   * @param reasons the reasons
   */
  const updateImplementationDependent = (reasons) => {
    const itemMap = {
      reasons: reasons,
    };
    dispatch(UPDATE_SFR_COMPONENT_ITEMS({ sfrUUID: sfrUUID, uuid: componentUUID, itemMap: itemMap }));
  };
  /**
   * Handles selected implementation feature dependencies.
   * @param {string} _title dropdown title
   * @param {Array<string>} selectedFeatures selected feature IDs
   */
  const handleFeatureSelections = (_title, selectedFeatures) => {
    updateImplementationDependent(selectedFeatures);
  };
  /**
   * Normalizes imported or legacy reason values to feature IDs.
   * @param {string|Object} reason reason value
   * @returns {string}
   */
  const getReasonId = (reason) => {
    if (typeof reason === "string") {
      return reason;
    }

    return reason?.id || "";
  };
  /**
   * Gets the display text for an implementation feature.
   * @param {Object} feature implementation feature
   * @returns {string}
   */
  const getFeatureLabel = (feature) => {
    const id = feature?.id || "";
    const title = feature?.title || "";

    if (title && id) {
      return `${title} (${id})`;
    }

    return title || id;
  };

  // Components
  /**
   * The implementation dependent toggle section
   * @returns {JSX.Element}
   */
  const getImplementationDependentToggle = () => {
    const title = "Implementation Dependent";
    const tooltipID = "implementationDependentToggleTooltip";
    const tooltip = "Selecting this indicates that this SFR is dependent on a feature defined elsewhere in the document.";

    return getToggleSwitch(title, isToggled, tooltipID, tooltip, handleUpdateImplementationDependentToggle);
  };
  /**
   * The implementation feature dependency dropdown.
   * @returns {JSX.Element}
   */
  const getFeatureDependencies = () => {
    const selectedReasons = Array.isArray(reasons) ? reasons.map((reason) => getReasonId(reason)).filter((id) => id && id !== "") : [];
    const featureById = implementationFeatures.reduce((features, feature) => {
      if (feature?.id) {
        features[feature.id] = feature;
      }
      return features;
    }, {});
    const selectedReasonsWithoutFeatures = selectedReasons.filter((reason) => !featureById[reason]);
    const featureLabels = Array.from(
      new Set([...implementationFeatures.map((feature) => getFeatureLabel(feature)).filter(Boolean), ...selectedReasonsWithoutFeatures])
    );
    const labelToId = featureLabels.reduce((labels, label) => {
      const feature = implementationFeatures.find((item) => getFeatureLabel(item) === label);
      labels[label] = feature?.id || label;
      return labels;
    }, {});
    const selectedLabels = selectedReasons.map((reason) => getFeatureLabel(featureById[reason]) || reason);
    const selectionOptions =
      featureLabels.length > 0
        ? { features: featureLabels }
        : {
            features: {
              label: "No implementation features defined",
              disabled: true,
            },
          };

    return (
      <div className='min-w-full mt-1 mb-2'>
        <MultiSelectDropdown
          title={"Depends On Implementation Features"}
          selectId={`${componentUUID}-implementation-features`}
          selectionOptions={selectionOptions}
          selections={selectedLabels}
          handleSelections={(_title, selectedFeatures) =>
            handleFeatureSelections(
              _title,
              selectedFeatures.map((feature) => labelToId[feature] || feature)
            )
          }
          style={"primary"}
        />
      </div>
    );
  };

  // Return Method
  return !isToggled ? (
    <div>{getImplementationDependentToggle()}</div>
  ) : (
    <div className='mx-[-10px]'>
      <CardTemplate
        type={"section"}
        header={getImplementationDependentToggle()}
        body={
          <div className='min-w-full'>
            <div className='min-w-full mt-[-8px]'>{getFeatureDependencies()}</div>
          </div>
        }
      />
    </div>
  );
}

// Export ImplementationDependent.jsx
export default ImplementationDependent;
