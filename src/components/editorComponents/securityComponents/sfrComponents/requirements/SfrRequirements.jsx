// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import SecurityComponents from "../../../../../utils/securityComponents.js";
import SfrSelectionGroups from "./SfrSelectionGroups.jsx";
import TabularizeTableSection from "./TabularizeTableSection.jsx";
import SfrRequirementCard from "./SfrRequirementCard.jsx";
import CardTemplate from "../../CardTemplate.jsx";

/**
 * The SfrRequirements class that displays the requirements per sfr element
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrRequirements(props) {
    // Prop Validation
    SfrRequirements.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        requirementType: PropTypes.string.isRequired,
        allSfrOptions: PropTypes.object.isRequired,
        rowIndex: PropTypes.number,
        getElementMaps: PropTypes.func.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
        updateManagementFunctions: PropTypes.func,
        showManagementFunctionPreview: PropTypes.func,
        initializeManagementFunctions: PropTypes.func,
        getCurrentManagementFunction: PropTypes.func,
        showTabularizeTablePreview: PropTypes.func,
    };

    // Constants
    const { row, rowDefinitions, dropdownOptions, selectedColumn } = useSelector((state) => state.tabularize);
    const { requirementsStyling } = useSelector((state) => state.styling);
    const [styling, setStyling] = useState(requirementsStyling.title)

    // Use Effect
    useEffect(() => {
        const newStyling = getStyling(false);

        // Update styling
        if (JSON.stringify(newStyling) !== JSON.stringify(styling)) {
            setStyling(newStyling)
        }
    }, [props.requirementType]);

    // Methods
    const handleColumnSelection = (event) => {
        // Update selected column
        SecurityComponents.updateTabularizeUI({
            selectedColumn: event.target.value
        })
    }

    // Helper Methods
    const getStyling = (innerStyling) => {
        const { requirementType } = props

        if (innerStyling) {
            return (requirementType === "title" || requirementType === "crypto") ? requirementsStyling.title : requirementsStyling.other
        } else {
            return (requirementType === "title") ? requirementsStyling.title : requirementsStyling.other
        }
    }

    // Components
    const getRequirements = () => {
        const { requirementType, rowIndex } = props
        if (requirementType === "title") {
            return getRequirementsCard()
        } else if (requirementType === "managementFunctions") {
            return getRequirementsCard(rowIndex)
        } else if (requirementType === "crypto") {
            return getCryptoSection(rowIndex)
        }
    }
    const getRequirementsCard = (rowIndex, cryptoColumnName) => {
        const innerStyling = getStyling(true)

        return (
            <SfrRequirementCard
                sfrUUID={props.sfrUUID}
                componentUUID={props.componentUUID}
                component={props.component}
                elementUUID={props.elementUUID}
                elementTitle={props.elementTitle}
                requirementType={props.requirementType}
                allSfrOptions={props.allSfrOptions}
                cryptoColumnName={cryptoColumnName}
                rowIndex={rowIndex}
                updateSfrSectionElement={props.updateSfrSectionElement}
                getSelectablesMaps={props.getSelectablesMaps}
                getElementMaps={props.getElementMaps}
                getElementValuesByType={props.getElementValuesByType}
                updateManagementFunctions={props.updateManagementFunctions}
                initializeManagementFunctions={props.initializeManagementFunctions}
                getCurrentManagementFunction={props.getCurrentManagementFunction}
                showManagementFunctionPreview={props.showManagementFunctionPreview}
                showTabularizeTablePreview={props.showTabularizeTablePreview}
                styling={innerStyling}
            />
        )
    }
    const getCryptoSection = (rowIndex) => {
        return (
            <CardTemplate
                type={"section"}
                header={
                    <div className="w-[95%] justify-items-center">
                        <label className="resize-none font-bold text-[14px] p-0 text-secondary mt-1">
                            Update Crypto Selection Column
                        </label>
                    </div>
                }
                body={
                    <div className="w-full">
                        {getCryptoDropdown()}
                        {getCryptoItem(rowIndex, selectedColumn)}
                    </div>
                }
            />
        )
    }
    const getCryptoItem = (rowIndex, selectedColumn) => {
        const isValid = selectedColumn && selectedColumn !== "" && row.hasOwnProperty(selectedColumn) && rowDefinitions.hasOwnProperty(selectedColumn)

        if (isValid) {
            const type = rowDefinitions[selectedColumn]

            // Get requirements card, if it is of the selectables type
            if (type === "selectcol") {
                return (
                    <div className="mx-[-16px]">
                        { getRequirementsCard(rowIndex, selectedColumn)}
                    </div>
                )
            }
            // Get the text field, if it is of the text type
            else if (type === "textcol") {
                return (getCryptoText(selectedColumn, type))
            }
        }
    }
    const getCryptoText = (selectedColumn, definitionType) => {
        const label = findValueByKey(selectedColumn)
        let value = row[selectedColumn]

        return (
            <div className="py-2 w-full">
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
                                definitionType:definitionType
                            }
                            SecurityComponents.handleCryptoUpdate(updateParams)
                        }}
                        key={selectedColumn}
                        inputProps={{style: {fontSize: 13}}}
                        InputLabelProps={{style: {fontSize: 13}}}
                    />
                </FormControl>
            </div>
        )

        // Find the value by key
        function findValueByKey(key) {
            const option = dropdownOptions.find(option => option.key === key);
            return option ? option.value : null;
        }
    }
    const getCryptoDropdown = () => {
        return (
            <div className="pb-2" key={`cryptoDropdown`}>
                <FormControl fullWidth>
                    <InputLabel key="selectables-requirement-label">Select Column Value</InputLabel>
                    <Select
                        value={selectedColumn}
                        label="Select Column Value"
                        autoWidth
                        onChange={handleColumnSelection}
                        sx={{textAlign: "left"}}
                    >
                        {dropdownOptions.map((item) => {
                            const { key, value } = item
                            return (
                                <MenuItem key={key} value={key}>{value}</MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
            </div>
        )
    }

    // Return Method
    return (
        <div className="min-w-full">
            <span className="w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg">
                <SfrSelectionGroups
                    key={`f-element-selection-group`}
                    sfrUUID={props.sfrUUID}
                    componentUUID={props.componentUUID}
                    elementUUID={props.getElementValuesByType("uuid")}
                    getElementValuesByType={props.getElementValuesByType}
                    getSelectablesMaps={props.getSelectablesMaps}
                    updateSfrSectionElement={props.updateSfrSectionElement}
                    requirementType={props.requirementType}
                    styling={styling}
                />
                {props.requirementType === "title" && props.elementTitle.toLowerCase().includes("fcs") ?
                    <TabularizeTableSection
                        sfrUUID={props.sfrUUID}
                        componentUUID={props.componentUUID}
                        component={props.component}
                        elementUUID={props.elementUUID}
                        elementTitle={props.elementTitle}
                        updateSfrSectionElement={props.updateSfrSectionElement}
                        getElementMaps={props.getElementMaps}
                        allSfrOptions={props.allSfrOptions}
                        getSelectablesMaps={props.getSelectablesMaps}
                        getElementValuesByType={props.getElementValuesByType}
                        getSelectionBasedArrayByType={props.getSelectionBasedArrayByType}
                    />
                    :
                    null
                }
                {getRequirements()}
            </span>
        </div>
    );
}

// Export SfrRequirements.jsx
export default SfrRequirements;