// Imports
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CREATE_NEW_EVALUATION_METHOD,
    CREATE_NEW_PACKAGE_CLAIM,
    CREATE_NEW_PP_CLAIM,
    DELETE_MULTIPLE_EVALUATION_METHODS,
    DELETE_MULTIPLE_PACKAGE_CLAIMS,
    DELETE_MULTIPLE_PP_CLAIMS,
    UPDATE_ADDITIONAL_INFORMATION_TEXT,
    UPDATE_COLLAPSE_ADDITIONAL_INFORMATION_SECTION,
    UPDATE_COLLAPSE_CONFORMATION_SECTION,
    UPDATE_EVALUATION_METHODS_BY_INDEX,
    UPDATE_PACKAGE_CLAIMS_INDEX_BY_KEY,
    UPDATE_PART_2_CONFORMANCE_DROPDOWN,
    UPDATE_PART_3_CONFORMANCE_DROPDOWN,
    UPDATE_PP_CLAIMS_INDEX_BY_KEY,
    UPDATE_ST_CONFORMANCE_DROPDOWN
} from "../../reducers/conformanceClaimsSlice.js";
import { FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import './components.css';
import { deepCopy } from "../../utils/deepCopy.js";
import EditableTable from "./EditableTable.jsx";
import TipTapEditor from "./TipTapEditor.jsx";
import SecurityComponents from "../../utils/securityComponents.jsx";

/**
 * The ConformanceClaims component
 * @returns {JSX.Element}
 * @constructor
 */
function ConformanceClaims() {
    // Constants
    const { getCardTemplate } = SecurityComponents
    const dispatch = useDispatch();
    const { requirementsStyling, secondaryColor } = useSelector((state) => state.styling);
    const {
        stConformance,
        part2Conformance,
        part3Conformance,
        ppClaims,
        packageClaims,
        evaluationMethods,
        additionalInformation,
        collapseConformanceSection,
        collapseAdditionalInfoSection
    } = useSelector((state) => state.conformanceClaims);
    const stConformanceOptions = ["demonstrable", "exact", "strict"]
    const conformanceOptions = ["conformant", "extended"]
    const packageClaimOptions = ["augmented", "conformant", "tailored"]
    const statusOptions = ["Configuration", "Conformance"]

    // Methods
    /**
     * Handles adding a new row to the ppClaims table
     */
    const handleNewPpClaimRow = () => {
        dispatch(CREATE_NEW_PP_CLAIM({
            isPP: false,
            description: "",
            status: ["Configuration"]
        }))
    }
    /**
     * Handles adding a new row to the packageClaims table
     */
    const handleNewPackageClaimRow = () => {
        dispatch(CREATE_NEW_PACKAGE_CLAIM({
            isFunctional: false,
            conf: "conformant",
            text: ""
        }))
    }
    /**
     * Handles adding a new row to the evaluation methods table
     */
    const handleNewEvaluationMethodRow = () => {
        dispatch(CREATE_NEW_EVALUATION_METHOD({
            method: ""
        }))
    }
    /**
     * Handles the deletion of indices from the ppClaims table
     * @param newData the newData after deletion
     * @param selectedData the data selected for removal
     */
    const handleDeletePpClaimRows = (newData, selectedData) => {
        deleteMultipleRows(selectedData, "pp")
    }
    /**
     * Handles the deletion of indices from the packageClaims table
     * @param newData the newData after deletion
     * @param selectedData the data selected for removal
     */
    const handleDeletePackageClaimRows = (newData, selectedData) => {
        deleteMultipleRows(selectedData, "package")
    }
    /**
     * Handles the deletion of indices from the evaluation methods table
     * @param newData the newData after deletion
     * @param selectedData the data selected for removal
     */
    const handleDeleteEvaluationMethodsRows = (newData, selectedData) => {
        deleteMultipleRows(selectedData, "evaluation")
    }
    /**
     * Handles the claim table text update
     * @param event the text update value
     */
    const handleClaimTableTextUpdate = (event) => {
        const { data, value } = event
        const { uuid: index, pp } = data
        const isPpClaim = pp !== undefined

        if (isPpClaim) {
            updatePpClaim(index, value, "text")
        } else {
            updatePackageClaim(index, value, "text")
        }
    }
    /**
     * Handles the evaluation methods table text update
     * @param event the text update value
     */
    const handleEvaluationMethodsTextUpdate = (event) => {
        const { data, value } = event
        const { uuid: index } = data

        try {
            dispatch(UPDATE_EVALUATION_METHODS_BY_INDEX({
                index: index,
                value: value
            }))
        } catch (e) {
            console.log(e)
        }
    }
    /**
     * Handles the additional information text update
     * @param event the text update value
     */
    const handleAdditionalInformationTextUpdate = (event) => {
        try {
            dispatch(UPDATE_ADDITIONAL_INFORMATION_TEXT({
                value: event
            }))
        } catch (e) {
            console.log(e)
        }
    }
    /**
     * Handles the section collapse by section type
     */
    const handleSectionCollapse = (sectionType) => {
        try {
            if (sectionType === "conformation") {
                dispatch(UPDATE_COLLAPSE_CONFORMATION_SECTION())
            } else if (sectionType === "additionalInfo") {
                dispatch(UPDATE_COLLAPSE_ADDITIONAL_INFORMATION_SECTION())
            }
        } catch (e) {
            console.log(e)
        }
    }
    /**
     * Handles the checkboxes for the claim table
     * @param event the checkbox value
     * @param type the checkbox type
     * @param index the index of the row being updated
     * @param isPpClaim the boolean for pp claim
     */
    const handleClaimTableCheckboxSelection = (event, type, index, isPpClaim) => {
        const checked = event.target.checked
        let value = false

        // Get checked value
        if (isPpClaim) {
            if (type === "pp" && checked) {
                value = true;
            } else if (type === "ppModule" && !checked) {
                value = true;
            }
            // Update PP Claim checkbox for pp and ppModule types
            updatePpClaim(index, value, "pp")

            // Update status
            const status = ["Configuration"]
            updatePpClaim(index, status, "status")
        } else {
            if (type === "functional" && checked) {
                value = true;
            } else if (type === "assurance" && !checked) {
                value = true;
            }
            // Update Package Claim checkbox for functionalPackage and assurancePackage types
            updatePackageClaim(index, value, "functionalPackage")
        }
    }
    /**
     * Handles the dropdowns throughout the conformance claims section
     * @param event the value of the selected dropdown
     * @param type the type of the selected dropdown
     * @param index the index of the selected dropdown, if applicable
     */
    const handleDropdowns = (event, type, index) => {
        const value = event.target.value;

        switch (type) {
            case "stConformance": {
                dispatch(UPDATE_ST_CONFORMANCE_DROPDOWN({ stConformance: value}))
                break;
            } case "part2Conformance": {
                dispatch(UPDATE_PART_2_CONFORMANCE_DROPDOWN({ part2Conformance: value}))
                break;
            } case "part3Conformance": {
                dispatch(UPDATE_PART_3_CONFORMANCE_DROPDOWN({ part3Conformance: value}))
                break;
            } case "conf": {
                updatePackageClaim(index, value, type)
                break;
            } default: {
                break;
            }
        }
    }
    /**
     * Handles the multiselect dropdown
     * @param title the title
     * @param newSelections the new dropdown selections
     * @param index the current index
     */
    const handleMultiSelectDropdown = (title, newSelections, index) => {
        // Update the pp claim status
        updatePpClaim(index, newSelections, "status");
    }

    // Helper Methods
    /**
     * The helper method that generates the row data used for the pp claim table
     * @param ppClaims the current ppClaims
     * @returns {*}
     */
    const generatePpClaimRowData = (ppClaims) => {
        let claims = deepCopy(ppClaims)

        return (
            claims.map((claim, index) => {
                const { pp, text, status } = claim

                return {
                    pp: pp,
                    ppModule: pp === false ? true : false,
                    text: text,
                    status: status !== undefined ? status : ["Configuration"],
                    uuid: index,
                    disabled: pp === true ? false : true
                }
            })
        )
    }
    /**
     * The helper method that generates the row data used for the package claim table
     * @param packageClaims the current packageClaims
     * @returns {*}
     */
    const generatePackageClaimRowData = (packageClaims) => {
        let claims = deepCopy(packageClaims)

        return (
            claims.map((claim, index) => {
                const { functionalPackage, conf, text } = claim
                return {
                    functional: functionalPackage,
                    assurance: functionalPackage === false ? true : false,
                    conf: conf,
                    text: text,
                    uuid: index
                }
            })
        )
    }
    const generateEvaluationMethodsRowData = (evaluationMethods) => {
        let methods = deepCopy(evaluationMethods)

        return (
            methods.map((method, index) => {
                return {
                    title: method,
                    uuid: index
                }
            })
        )
    }
    /**
     * The helper method that updates the pp claim
     * @param index the index of the pp claim
     * @param value the value to update
     * @param key the key to update
     */
    const updatePpClaim = (index, value, key) => {
        try {
            dispatch(UPDATE_PP_CLAIMS_INDEX_BY_KEY({
                index: index,
                value: value,
                key: key
            }))
        } catch (e) {
            console.log(e)
        }
    }
    /**
     * The helper method that updates the package claim
     * @param index the index of the pp claim
     * @param value the value to update
     * @param key the key to update
     */
    const updatePackageClaim = (index, value, key) => {
        try {
            dispatch(UPDATE_PACKAGE_CLAIMS_INDEX_BY_KEY({
                index: index,
                value: value,
                key: key
            }))
        } catch (e) {
            console.log(e)
        }
    }
    /**
     * Helper to delete multiple rows in various tables by type
     * @param selectedData the selected data
     * @param tableType the table type
     */
    const deleteMultipleRows = (selectedData, tableType) => {
        const indicesToRemove = selectedData.map(item => item.uuid).sort();
        const indices = {
            indicesToRemove: indicesToRemove
        }

        switch (tableType) {
            case "pp": {
                dispatch(DELETE_MULTIPLE_PP_CLAIMS(indices))
                break;
            } case "package": {
                dispatch(DELETE_MULTIPLE_PACKAGE_CLAIMS(indices))
                break;
            } case "evaluation": {
                dispatch(DELETE_MULTIPLE_EVALUATION_METHODS(indices))
                break;
            } default: {
                break;
            }
        }
    }

    // Components
    /**
     * Gets the conformance section
     * @returns {*}
     */
    const getConformanceSection = () => {
        const header = "Conformance Claims"
        const body = (
            <span className="flex justify-stretch min-w-full p-4 pr-1 pb-0">
                {getDropdownByType(stConformance, "Select ST Conformance", "stConformance", stConformanceOptions, true)}
                {getDropdownByType(part2Conformance, "Select Part 2 Conformance", "part2Conformance", conformanceOptions, false)}
                {getDropdownByType(part3Conformance, "Select Part 3 Conformance", "part3Conformance", conformanceOptions, false)}
            </span>
        );
        const tooltip = `The Conformance Claim is mainly boilerplate. The two sub-elements are used to specify the 
        Part 2 and 3 conformance for the document. If the current document is a Functional Package, the Part 3 claim is 
        not displayed, although you probably still have to specify it.`

        return (
            getCardTemplate(
                header,
                body,
                tooltip,
                collapseConformanceSection,
                () => handleSectionCollapse("conformation")
            )
        )
    }
    /**
     * Gets the additional information section rte
     * @returns {Element}
     */
    const getAdditionalInformationSection = () => {
        const header = "Additional Information"
        const body = (
            <div className="w-full p-4 pb-0 mb-[-8px]">
                <TipTapEditor
                    text={additionalInformation}
                    contentType={"term"}
                    handleTextUpdate={handleAdditionalInformationTextUpdate}
                />
            </div>
        );
        const tooltip = `The final optional section allows for document-specific information to be added to the end of the Conformance Claims section.`

        return (
            getCardTemplate(
                header,
                body,
                tooltip,
                collapseAdditionalInfoSection,
                () => handleSectionCollapse("additionalInfo")
            )
        )
    }
    /**
     * The editable table component
     * @param title the title
     * @param columnData the column data
     * @param rowData the row data
     * @param handleNewTableRow the handler for the new table row
     * @param handleUpdateTableRow the handler for the update table row
     * @param handleDeleteTableRows the handler for the delete table rows
     * @param tableInstructions the table instructions
     * @param isPpClaim is this a pp claim
     * @param isClaimsTable is this a claims table
     * @returns {Element}
     */
    const getEditableTable = ({
          title,
          columnData,
          rowData,
          handleNewTableRow,
          handleUpdateTableRow,
          handleDeleteTableRows,
          tableInstructions,
          isPpClaim,
          isClaimsTable = false
      }) => {
        const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true };

        const handlePpClaimsCheckbox = (event, type, index) => {
            handleClaimTableCheckboxSelection(event, type, index, true);
        };
        const handlePackageClaimsCheckbox = (event, type, index) => {
            handleClaimTableCheckboxSelection(event, type, index, false);
        };

        return (
            <div className="w-full">
                <div className="relative">
                    <EditableTable
                        title={
                            <Tooltip
                                arrow
                                id={isClaimsTable ? (isPpClaim ? "ppClaimTooltip" : "packageClaimTooltip") : "evaluationMethodsTooltip"}>
                                <label style={{ color: secondaryColor }}>
                                    {title}
                                </label>
                            </Tooltip>
                        }
                        editable={editable}
                        columnData={columnData}
                        rowData={rowData}
                        handleNewTableRow={handleNewTableRow}
                        handleUpdateTableRow={handleUpdateTableRow}
                        handleDeleteTableRows={handleDeleteTableRows}
                        handleCheckboxClick={isClaimsTable ? (isPpClaim ? handlePpClaimsCheckbox : handlePackageClaimsCheckbox) : undefined}
                        handleDropdownMenuSelect={isClaimsTable ? handleDropdowns : undefined}
                        handleMultiSelectDropdown={isClaimsTable ? handleMultiSelectDropdown : undefined}
                        styling={requirementsStyling.title}
                        tableInstructions={tableInstructions}
                        dropdownMenuOptions={isClaimsTable ? packageClaimOptions : undefined}
                        multiSelectMenuOptions={isClaimsTable ? statusOptions : undefined}
                    />
                </div>
            </div>
        );
    };
    /**
     * Gets the select dropdown by type
     * @param value the selected value
     * @param label the dropdown label
     * @param type the dropdown type
     * @param options the dropdown menu options
     * @param disabled if the dropdown is disabled
     * @returns {Element}
     */
    const getDropdownByType = (value, label, type, options, disabled) => {
        return (
            <FormControl fullWidth sx={{marginRight: "10px", textAlign: "left"}}>
                <InputLabel>{label}</InputLabel>
                <Select
                    value={value}
                    onChange={(event) => {
                        handleDropdowns(event, type)
                    }}
                    label={label}
                    disabled={disabled}
                >
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        )
    }

    // Use Memos
    /**
     * Gets the pp claims section table
     * @returns {Element}
     */
    const getPpClaimSectionTable =  useMemo(() => {
        const title = "PP Claims"
        let rowData = generatePpClaimRowData(ppClaims)
        const columnData = [
            { headerName: 'Title', field: 'text', editable: true, resizable: true, type: "Editor", flex: 2.5, headerTooltip: "The document title with an element that indicates the type of document listed" },
            { headerName: 'Status', field: 'status', editable: true, resizable: true, type: "Multiselect", flex: 0.75, headerTooltip: "This section lists the PP that the current document is conformant to, and the PPs and PP-Modules and that the document can be in a PP-Configuration with."},
            { headerName: 'PP', field: 'pp', editable: true, resizable: true, type: "Checkbox", flex: 0.75, headerTooltip: ""},
            { headerName: 'PP-Module', field: 'ppModule', editable: true, resizable: true, type: "Checkbox", flex: 0.75, headerTooltip: ""}
        ]
        const tableInstructions = `This section lists the PP that the current document is conformant to, and the PPs and
        PP-Modules and that the document can be in a PP-Configuration with. If there are none, the sub-element must
        be left empty. Otherwise, each section contains a list of document titles with an element that indicates the
        type of document listed.`

        return (
            getEditableTable({
                title,
                columnData,
                rowData,
                handleNewTableRow: handleNewPpClaimRow,
                handleUpdateTableRow: handleClaimTableTextUpdate,
                handleDeleteTableRows: handleDeletePpClaimRows,
                tableInstructions,
                isPpClaim: true,
                isClaimsTable: true
            })
        )
    }, [ppClaims])
    /**
     * Gets the pp claims section table
     * @returns {Element}
     */
    const getPackageClaimSectionTable = useMemo(() => {
        const title = "Package Claims"
        let rowData = generatePackageClaimRowData(packageClaims)
        const columnData = [
            { headerName: 'Title', field: 'text', editable: true, resizable: true, type: "Editor", flex: 2.5, headerTooltip: "The document title with an element that indicates the type of document listed" },
            { headerName: 'Package Conformance', field: 'conf', editable: true, resizable: true, type: "Select", flex: 1.0, headerTooltip: `Used to specify that the type of Package conformance: "augmented", "conformant", or "tailored."`},
            { headerName: 'Functional Package', field: 'functional', editable: true, resizable: true, type: "Checkbox", flex: 0.75, headerTooltip: ""},
            { headerName: 'Assurance Package', field: 'assurance', editable: true, resizable: true, type: "Checkbox", flex: 0.75, headerTooltip: ""}
        ];
        const tableInstructions = `This section lists the Functional and Assurance Packages that the document may
        conform to. Specify that the type of Package conformance: "augmented", "conformant", or "tailored."`

        return (
            getEditableTable({
                title,
                columnData,
                rowData,
                handleNewTableRow: handleNewPackageClaimRow,
                handleUpdateTableRow: handleClaimTableTextUpdate,
                handleDeleteTableRows: handleDeletePackageClaimRows,
                tableInstructions,
                isPpClaim: false,
                isClaimsTable: true
            })
        )
    }, [packageClaims])
    /**
     * The evaluation methods table section
     * @returns {Element}
     */
    const getEvaluationMethodsTableSection = useMemo(() => {
        const title = "Evaluation Methods"
        let rowData = generateEvaluationMethodsRowData(evaluationMethods)
        const columnData = [
            { headerName: 'Requirement Document', field: 'title', editable: true, resizable: true, type: "Editor", flex: 2.5, headerTooltip: "This is an optional section to be used if the requirement document uses a published Evaluation Methods document for some or all of its evaluation activities." },
        ]
        const tableInstructions = `This is an optional section to be used if the requirement document uses a published 
        Evaluation Methods document for some or all of its evaluation activities. Eventually this element will be expanded 
        to allow the complete specification of the Evaluation Methods document rather than just the textual name.`

        return (
            getEditableTable({
                title,
                columnData,
                rowData,
                handleNewTableRow: handleNewEvaluationMethodRow,
                handleUpdateTableRow: handleEvaluationMethodsTextUpdate,
                handleDeleteTableRows: handleDeleteEvaluationMethodsRows,
                tableInstructions,
                isPpClaim: false,
                isClaimsTable: false
            })
        )
    }, [evaluationMethods])

    // Return Method
    return (
        <div className="min-w-full border-gray-300 mb-[-4px]" key={"ConformanceClaimsDiv"}>
            {getConformanceSection()}
            {getPpClaimSectionTable}
            {getPackageClaimSectionTable}
            {getEvaluationMethodsTableSection}
            {getAdditionalInformationSection()}
        </div>
    )
}

// Export ConformanceClaims.jsx
export default ConformanceClaims;