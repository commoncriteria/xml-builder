import PropTypes from "prop-types";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateMetaDataItem } from "../../../../reducers/accordionPaneSlice.js";
import {
  getTechnicalDecisionSelectedIndex,
  normalizeTechnicalDecisionHistory,
  updateTechnicalDecisionAffectsSelection,
} from "../../../../utils/technicalDecisionHistory.js";
import MultiSelectDropdown from "../MultiSelectDropdown.jsx";

const NO_TECHNICAL_DECISION_LABEL = "None";
const REF_ID_REQUIRED_LABEL = "Reference ID required";
const NO_TECHNICAL_DECISIONS_LABEL = "No technical decisions defined";

const getTechnicalDecisionOptionLabels = (technicalDecisionHistory) => {
  const numbers = technicalDecisionHistory.map((technicalDecision, index) => technicalDecision.number || `Technical Decision ${index + 1}`);

  return numbers.map((number, index) => {
    const isDuplicate = numbers.indexOf(number) !== index || numbers.lastIndexOf(number) !== index;
    return isDuplicate ? `${number} (row ${index + 1})` : number;
  });
};

function TechnicalDecisionAffectsDropdown({ refId, selectId, label = "Technical Decision", alternateRefIds = [] }) {
  TechnicalDecisionAffectsDropdown.propTypes = {
    refId: PropTypes.string,
    selectId: PropTypes.string.isRequired,
    label: PropTypes.string,
    alternateRefIds: PropTypes.arrayOf(PropTypes.string),
  };

  const dispatch = useDispatch();
  const technicalDecisionHistory = useSelector((state) => state.accordionPane.metadata.technicalDecisionHistory);
  const normalizedHistory = useMemo(() => normalizeTechnicalDecisionHistory(technicalDecisionHistory), [technicalDecisionHistory]);
  const normalizedAlternateRefIds = useMemo(
    () => alternateRefIds.map((alternateRefId) => String(alternateRefId || "").trim()).filter(Boolean),
    [alternateRefIds]
  );
  const selectedIndex = useMemo(
    () => getTechnicalDecisionSelectedIndex(normalizedHistory, refId, normalizedAlternateRefIds),
    [normalizedHistory, refId, normalizedAlternateRefIds]
  );
  const hasRefId = String(refId || "").trim() !== "";
  const hasTechnicalDecisions = normalizedHistory.length > 0;
  const isDisabled = !hasRefId || !hasTechnicalDecisions;
  const optionLabels = useMemo(() => getTechnicalDecisionOptionLabels(normalizedHistory), [normalizedHistory]);
  const hasSelectedTechnicalDecision = selectedIndex !== "";
  const dropdownSelection = isDisabled
    ? !hasRefId
      ? REF_ID_REQUIRED_LABEL
      : NO_TECHNICAL_DECISIONS_LABEL
    : hasSelectedTechnicalDecision
      ? optionLabels[Number(selectedIndex)]
      : NO_TECHNICAL_DECISION_LABEL;
  const selectionOptions = useMemo(() => {
    if (!hasRefId) {
      return {
        "technical decisions": {
          label: REF_ID_REQUIRED_LABEL,
          disabled: true,
        },
      };
    }

    if (!hasTechnicalDecisions) {
      return {
        "technical decisions": {
          label: NO_TECHNICAL_DECISIONS_LABEL,
          disabled: true,
        },
      };
    }

    return {
      "technical decisions": [NO_TECHNICAL_DECISION_LABEL, ...optionLabels],
    };
  }, [hasTechnicalDecisions, hasRefId, optionLabels]);

  const handleChange = (title, selections) => {
    const selectedLabel = selections[0] || NO_TECHNICAL_DECISION_LABEL;
    const selectedValue = selectedLabel === NO_TECHNICAL_DECISION_LABEL ? "" : String(optionLabels.indexOf(selectedLabel));
    const updatedHistory = updateTechnicalDecisionAffectsSelection(
      normalizedHistory,
      refId,
      selectedValue === "-1" ? "" : selectedValue,
      normalizedAlternateRefIds
    );

    dispatch(
      updateMetaDataItem({
        type: "technicalDecisionHistory",
        item: updatedHistory,
      })
    );
  };

  return (
    <MultiSelectDropdown
      title={label}
      selectId={selectId}
      selectionOptions={selectionOptions}
      selections={dropdownSelection}
      handleSelections={handleChange}
      multiple={false}
      disabled={isDisabled}
    />
  );
}

export default TechnicalDecisionAffectsDropdown;
