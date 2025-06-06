// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { handleCryptoUpdate, handleSnackbarTextUpdates, updateTabularizeUI } from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";
import SfrSelectionGroups from "./SfrSelectionGroups.jsx";
import SfrRequirementCard from "./SfrRequirementCard.jsx";
import TabularizeTableSection from "../tabularizeTable/TabularizeTableSection.jsx";

/**
 * The SfrRequirements class that displays the requirements per sfr element
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function SfrRequirements(props) {
  // Prop Validation
  SfrRequirements.propTypes = {
    requirementType: PropTypes.string.isRequired,
  };

  // Constants
  const { selectedSfrElement, tabularizeUI } = useSelector((state) => state.sfrWorksheetUI);
  const { row, rowDefinitions, dropdownOptions, selectedColumn } = tabularizeUI;
  const { requirementsStyling } = useSelector((state) => state.styling);
  const [styling, setStyling] = useState(requirementsStyling.title);
  const style = { fontSize: 13 };

  // Use Effect
  useEffect(() => {
    const newStyling = getStyling(false);

    // Update styling
    if (JSON.stringify(newStyling) !== JSON.stringify(styling)) {
      setStyling(newStyling);
    }
  }, [props.requirementType]);

  // Methods
  /**
   * Handles the column selection
   * @param event the event
   */
  const handleColumnSelection = (event) => {
    // Update selected column
    updateTabularizeUI({
      selectedColumn: event.target.value,
    });
  };

  // Helper Methods
  /**
   * Generates the styling
   * @param innerStyling the inner styling
   * @returns {*}
   */
  const getStyling = (innerStyling) => {
    const { requirementType } = props;

    if (innerStyling) {
      return requirementType === "title" || requirementType === "crypto" ? requirementsStyling.title : requirementsStyling.other;
    } else {
      return requirementType === "title" ? requirementsStyling.title : requirementsStyling.other;
    }
  };

  // Components
  /**
   * The requirements section
   * @returns {*}
   */
  const getRequirements = () => {
    const { requirementType } = props;
    if (requirementType === "title") {
      return getRequirementsCard();
    } else if (requirementType === "managementFunctions") {
      return getRequirementsCard();
    } else if (requirementType === "crypto") {
      return getCryptoSection();
    }
  };
  /**
   * The requirements card section
   * @param cryptoColumnName the crypto to column name
   * @returns {JSX.Element}
   */
  const getRequirementsCard = (cryptoColumnName = "") => {
    const innerStyling = getStyling(true);

    return <SfrRequirementCard requirementType={props.requirementType} cryptoColumnName={cryptoColumnName} styling={innerStyling} />;
  };
  /**
   * The crypto section
   * @returns {JSX.Element}
   */
  const getCryptoSection = () => {
    return (
      <CardTemplate
        type={"section"}
        header={
          <div className='w-[95%] justify-items-center'>
            <label className='resize-none font-bold text-[14px] p-0 text-secondary mt-1'>Update Crypto Selection Column</label>
          </div>
        }
        body={
          <div className='w-full'>
            {getCryptoDropdown()}
            {getCryptoItem(selectedColumn)}
          </div>
        }
      />
    );
  };
  /**
   * The crypto item section
   * @param selectedColumn the selected column
   * @returns {*|JSX.Element}
   */
  const getCryptoItem = (selectedColumn) => {
    const isValid = selectedColumn && selectedColumn !== "" && row.hasOwnProperty(selectedColumn) && rowDefinitions.hasOwnProperty(selectedColumn);

    if (isValid) {
      const type = rowDefinitions[selectedColumn];

      // Get requirements card, if it is of the selectables type
      if (type === "selectcol") {
        return <div className='mx-[-16px]'>{getRequirementsCard(selectedColumn)}</div>;
      }
      // Get the text field, if it is of the text type
      else if (type === "textcol") {
        return getCryptoText(selectedColumn, type);
      }
    }
  };
  /**
   * The crypto text section
   * @param selectedColumn the selected column
   * @param definitionType the definition type
   * @returns {JSX.Element}
   */
  const getCryptoText = (selectedColumn, definitionType) => {
    const label = findValueByKey(selectedColumn);
    let value = row[selectedColumn];

    return (
      <div className='py-2 w-full'>
        <FormControl fullWidth>
          <TextField
            label={label}
            defaultValue={value}
            color={styling.secondaryTextField}
            onBlur={(event) => {
              const updateParams = {
                updateType: "update",
                key: selectedColumn,
                value: event.target.value,
                definitionType: definitionType,
              };
              handleSnackbarTextUpdates(handleCryptoUpdate, updateParams);
            }}
            key={selectedColumn}
            inputProps={{ style }}
            InputLabelProps={{ style }}
          />
        </FormControl>
      </div>
    );

    // Find the value by key
    function findValueByKey(key) {
      const option = dropdownOptions.find((option) => option.key === key);
      return option ? option.value : null;
    }
  };
  /**
   * The crypto dropdown section
   * @returns {JSX.Element}
   */
  const getCryptoDropdown = () => {
    return (
      <div className='pb-2' key={`cryptoDropdown`}>
        <FormControl fullWidth>
          <InputLabel key='selectables-requirement-label'>Select Column Value</InputLabel>
          <Select value={selectedColumn} label='Select Column Value' autoWidth onChange={handleColumnSelection} sx={{ textAlign: "left" }}>
            {dropdownOptions.map((item) => {
              const { key, value } = item;

              return (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    );
  };

  // Return Method
  return (
    <div className='min-w-full'>
      <span className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
        <SfrSelectionGroups key={`f-element-selection-group`} requirementType={props.requirementType} styling={styling} />
        {props.requirementType === "title" && selectedSfrElement.toLowerCase().includes("fcs") && <TabularizeTableSection />}
        {getRequirements()}
      </span>
    </div>
  );
}

// Export SfrRequirements.jsx
export default SfrRequirements;
