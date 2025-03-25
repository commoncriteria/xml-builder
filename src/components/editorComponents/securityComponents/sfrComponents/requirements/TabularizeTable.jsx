// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GET_SFR_ELEMENT_VALUES_FOR_TABULARIZE_TABLE } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { GET_TABULARIZE_TABLE_TEXT_PREVIEW } from "../../../../../reducers/SFRs/sfrPreview.js";
import { INITIALIZE_EDIT_ROW_DATA, RESET_TABULARIZE_UI, TRANSFORM_TABULARIZE_DATA } from "../../../../../reducers/SFRs/tabularizeUI.js";
import { IconButton, Tooltip } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { removeTagEqualities } from "../../../../../utils/fileParser.js";
import CardTemplate from "../../CardTemplate.jsx";
import EditableTable from "../../../EditableTable.jsx";
import ResetDataConfirmation from "../../../../modalComponents/ResetDataConfirmation.jsx";
import EditTabularizeDefinitionModal from "../../../../modalComponents/EditTabularizeDefinitionModal.jsx";
import EditTabularizeRowModal from "../../../../modalComponents/EditTabularizeRowModal.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";

/**
 * The TabularizeTable class that displays a tabularized table for the sfr worksheet
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function TabularizeTable(props) {
    // Prop Validation
    TabularizeTable.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        tabularizeUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
        getTabularizeObject: PropTypes.func.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
        updateTabularizeTableUI: PropTypes.func.isRequired,
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();
    const { primary, icons } = useSelector((state) => state.styling);
    const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true }
    const [editRowModal, setEditRowModal] = useState({
        open: false,
        rowIndex: -1
    });
    const [deleteRowsModal, setDeleteRowsModal] = useState({
        open: false,
        newData: [],
    })
    const [deleteTableModal, setDeleteTableModal] = useState(false);
    const [editDefinitionModal, setEditDefinitionModal] = useState(false);
    const [tabularize, setTabularize] = useState({});
    const [definitionString, setDefinitionString] = useState("")

    // Use Effect
    useEffect(() => {
        handleProps(props)
    }, [props]);

    // Methods
    const handleProps = (props) => {
        let element = getTabularizeValue(props)

        // Set tabularize
        let crypto = element.hasOwnProperty("tabularize") ? element.tabularize : {}
        if (JSON.stringify(tabularize) !== JSON.stringify(crypto)) {
            setTabularize(crypto)
        }

        // Set definition string
        let definition = element.hasOwnProperty("definitionString") ? element.definitionString : ""
        if (JSON.stringify(definitionString) !== JSON.stringify(definition)) {
            setDefinitionString(definition)
        }
    }
    const handleOpenEditRowModal = (rowIndex, newRow) => {
        const { open } = editRowModal

        // Initialize row data on open
        if (!open) {
            const { tabularizeUUID } = props;
            if (tabularizeUUID && tabularizeUUID !== "") {
                let tabularize = deepCopy(props.getElementValuesByType("tabularize", tabularizeUUID));
                if (tabularize && Object.keys(tabularize).length > 0) {
                    const isNewRow = typeof newRow === "boolean" && newRow === true ? newRow : false;
                    const { rows } = tabularize

                    // Update row index if it is a new row
                    if (isNewRow && rowIndex === -1) {
                        rowIndex = rows.length
                    }

                    // Set item map and update values
                    let itemMap = {
                        newRow: isNewRow,
                        row: tabularize.rows && tabularize.rows[rowIndex] ? tabularize.rows[rowIndex] : {},
                        definition: tabularize.definition ? tabularize.definition : [],
                        originalRows: rows
                    }
                    dispatch(INITIALIZE_EDIT_ROW_DATA(itemMap))
                }
            }
        }

        // Reset tabularize ui on close
        else {
            dispatch(RESET_TABULARIZE_UI())
        }

        // Update edit row modal values
        setEditRowModal({
            open: !open,
            rowIndex: rowIndex || rowIndex === 0 ? rowIndex : -1
        });
    }
    const handleDeleteTableModalOpen = () => {
        setDeleteTableModal(!deleteTableModal);
    }
    const handleDeleteTableModalSubmit = () => {
        // Delete Table
        const { elementUUID, componentUUID, tabularizeUUID } = props
        let tabularize = props.getTabularizeObject()
        if (tabularize && tabularizeUUID && tabularize.hasOwnProperty(tabularizeUUID)) {
            delete tabularize[tabularizeUUID];
        }

        // Delete from requirements title if it exists
        const title = props.getElementValuesByType("title");
        const updatedTitle = title.filter(obj => obj.tabularize !== tabularizeUUID);

        // Update tabularize
        let itemMap = {
            tabularize: tabularize,
            title: updatedTitle
        }
        props.updateSfrSectionElement(elementUUID, componentUUID, itemMap)

        // Close modal
        handleDeleteTableModalOpen()

        // Update snackbar
        handleSnackBarSuccess("Crypto Selection Table Successfully Removed")
    }
    const handleOpenEditDefinitionModal = () => {
        if (!editDefinitionModal) {
            const { tabularizeUUID } = props;
            if (tabularizeUUID && tabularizeUUID !== "") {
                let tabularize = deepCopy(props.getElementValuesByType("tabularize", tabularizeUUID));
                if (tabularize && Object.keys(tabularize).length > 0) {
                    // Set item map and update values
                    const itemMap = {
                        title: tabularize.title ? tabularize.title : "",
                        id: tabularize.id ? tabularize.id : "",
                        definition: tabularize.definition ? tabularize.definition : [],
                        rows: tabularize.rows ? tabularize.rows : [],
                        columns: tabularize.columns ? tabularize.columns : [],
                        type: "transform"
                    }
                    dispatch(TRANSFORM_TABULARIZE_DATA(itemMap))
                }
            }
        }

        // Update edit definition modal
        setEditDefinitionModal(!editDefinitionModal);
    }
    const handleDeleteRowsModalOpen = (newData) => {
        const { open } = deleteRowsModal

        // Update delete rows modal values
        setDeleteRowsModal({
            open: !open,
            newData: !open && newData ? newData : []
        })
    }
    const handleDeleteRowsModalSubmit = () => {
        const { newData } = deleteRowsModal

        // Update tabularize object to remove selected rows
        const updateMap = {
            rows: newData ? deepCopy(newData) : []
        }
       updateTabularizeObject(updateMap)

        // Close the dialog
        handleDeleteRowsModalOpen();

        // Update snackbar
        handleSnackBarSuccess("Selected Row(s) Successfully Removed")
    }
    const handleNewTableRow = () => {
        const rowIndex = -1
        const newRow = true;

        // Open edit row modal
        handleOpenEditRowModal(rowIndex, newRow)
    }

    // Helper Methods
    const updateTabularizeObject = (updateMap) => {
        const { elementUUID, componentUUID, tabularizeUUID } = props
        let updatedTabularize = deepCopy(props.getElementValuesByType("tabularize"));
        const isUpdateMapValid = updateMap && Object.keys(updateMap).length > 0
        const isTabularizeValid = updatedTabularize && Object.keys(updatedTabularize).length > 0 && updatedTabularize.hasOwnProperty(tabularizeUUID)

        // Update tabularize
        if (isUpdateMapValid && isTabularizeValid) {
            // Update the current tabularize item
            let currentItem = updatedTabularize[tabularizeUUID]
            Object.entries(updateMap).forEach(([key, value]) => {
                currentItem[key] = value
            })

            // Update tabularize object in the slice
            const itemMap = {
                tabularize: updatedTabularize
            }
            props.updateSfrSectionElement(elementUUID, componentUUID, itemMap)
        }
    }
    const getTabularizeValue = (props) => {
        let { sfrUUID, componentUUID, elementUUID, tabularizeUUID } = props;
        let tabularizeValues = {
            sfrUUID: sfrUUID,
            componentUUID: componentUUID,
            elementUUID: elementUUID,
            tabularizeUUID: tabularizeUUID,
        }
        return dispatch(GET_SFR_ELEMENT_VALUES_FOR_TABULARIZE_TABLE(tabularizeValues)).payload.element
    }

    // Components
    const showTabularizeTablePreview = (previewToggle, textArray, rowIndex) => {
        let section = ""
        try {
            if (previewToggle) {
                // Get the element selectables, selectableGroups and management function array
                let initialElementValues = dispatch(GET_SFR_ELEMENT_VALUES_FOR_TABULARIZE_TABLE({
                    sfrUUID: props.sfrUUID,
                    componentUUID: props.componentUUID,
                    elementUUID: props.elementUUID,
                    rowIndex: rowIndex
                }))
                if (initialElementValues.payload.element) {
                    const { selectables, selectableGroups } = initialElementValues.payload.element
                    let selectable = dispatch(GET_TABULARIZE_TABLE_TEXT_PREVIEW({
                        selectables: selectables ? selectables : {},
                        selectableGroups: selectableGroups ? selectableGroups : {},
                        textArray: textArray ? textArray : [],
                    }))
                    if (selectable.payload.tabularizeTableText) {
                        section = selectable.payload.tabularizeTableText
                    }
                }
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }

        // Regular expression to escape specific tags (we want them to be represented as xml tags, which otherwise
        // would be omitted by the quill editor due to not knowing how to interpret them)
        return (
            <div className="preview" style={{whiteSpace: 'normal', lineHeight: "1.5", margin: 0, padding: 4, paddingBottom: 10}}>
                {removeTagEqualities(section, true)}
            </div>
        )
    }
    const getDefinitionPreview = () => {
        let currentString = definitionString ? definitionString : ""
        return (
            <div className="preview">
                {removeTagEqualities(currentString, true)}
            </div>
        )
    }

    // Return Method
    return (
        <div className="pt-2 my-[-8px] mx-[-16px]">
            <ResetDataConfirmation
                title={"Delete Crypto Selection Table Row(s)"}
                text={`Are you sure that you want to delete the selected row(s) from the table?`}
                open={deleteRowsModal.open}
                handleOpen={handleDeleteRowsModalOpen}
                handleSubmit={handleDeleteRowsModalSubmit}
            />
            <ResetDataConfirmation
                title={"Delete Crypto Selection Table"}
                text={`Are you sure that you want to delete the "${tabularize.title ? tabularize.title : ""}" table?`}
                open={deleteTableModal}
                handleOpen={handleDeleteTableModalOpen}
                handleSubmit={handleDeleteTableModalSubmit}
            />
            <EditTabularizeDefinitionModal
                open={editDefinitionModal}
                elementUUID={props.elementUUID}
                componentUUID={props.componentUUID}
                tabularizeUUID={props.tabularizeUUID}
                handleOpen={handleOpenEditDefinitionModal}
                getElementValuesByType={props.getElementValuesByType}
                updateSfrSectionElement={props.updateSfrSectionElement}
                updateTabularizeTableUI={props.updateTabularizeTableUI}
                getTabularizeObject={props.getTabularizeObject}
            />
            <CardTemplate
                type={"section"}
                header={
                    <div className="w-full p-0 m-0 my-[-6px]">
                         <span className="flex justify-stretch min-w-full">
                             <div className="flex justify-center w-full pl-4">
                                 <label className="resize-none font-bold text-[13px] p-0 m-0 text-secondary break-words pr-1 mt-[2px]">
                                     {tabularize.hasOwnProperty("title") ? tabularize.title : ""}
                                 </label>
                                 <IconButton
                                     variant="contained"
                                     sx={{marginTop: "-8px", margin: 0, padding: 0, marginRight: 2}}
                                     onClick={() => {
                                         setDeleteTableModal(true)
                                     }}
                                 >
                                     <Tooltip
                                         title={"Delete Crypto Selectable Table"}
                                         id={`deleteCryptoSelectableTooltip`}
                                     >
                                         <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.small}/>
                                     </Tooltip>
                                 </IconButton>
                            </div>
                        </span>
                    </div>
                }
                body={
                    <div>
                        <span className="flex justify-stretch min-w-full mb-4">
                            <div className="w-[96%] border-2 border-gray-200 rounded-md flex items-center">
                                {getDefinitionPreview()}
                            </div>
                             <div className="w-[4%] ml-1 flex items-center justify-center">
                                 <IconButton
                                     variant="contained"
                                     onClick={() => {
                                         handleOpenEditDefinitionModal()
                                     }}
                                 >
                                     <Tooltip
                                         title={"Modify Crypto Selectable Table Definitions"}
                                         id={`modifyCryptoSelectableTooltip`}
                                     >
                                         <AutoFixHighIcon htmlColor={primary} sx={icons.medium}/>
                                     </Tooltip>
                                 </IconButton>
                             </div>
                        </span>
                        <EditableTable
                            title={"Selection Table"}
                            editable={editable}
                            columnData={tabularize && tabularize.hasOwnProperty("columns") ? deepCopy(tabularize.columns) : []}
                            rowData={tabularize && tabularize.hasOwnProperty("rows") ? deepCopy(tabularize.rows) : []}
                            isTitleEditable={false}
                            isTabularizeTable={true}
                            editFullRow={true}
                            handleEditFullRow={handleOpenEditRowModal}
                            handleNewTableRow={handleNewTableRow}
                            handleDeleteTableRows={handleDeleteRowsModalOpen}
                            showPreview={showTabularizeTablePreview}
                            tableInstructions={`To edit a row, double-click on it and select the required column from the dropdown to edit further.`}
                        />
                        <EditTabularizeRowModal
                            open={editRowModal.open}
                            sfrUUID={props.sfrUUID}
                            componentUUID={props.componentUUID}
                            component={props.component}
                            elementUUID={props.elementUUID}
                            tabularizeUUID={props.tabularizeUUID}
                            elementTitle={props.elementTitle}
                            requirementType={"crypto"}
                            rowIndex={editRowModal.rowIndex}
                            getSelectablesMaps={props.getSelectablesMaps}
                            getElementValuesByType={props.getElementValuesByType}
                            getSelectionBasedArrayByType={props.getSelectionBasedArrayByType}
                            updateSfrSectionElement={props.updateSfrSectionElement}
                            handleOpen={handleOpenEditRowModal}
                            showTabularizeTablePreview={showTabularizeTablePreview}
                            updateTabularizeObject={updateTabularizeObject}
                        />
                    </div>
                }
            />
        </div>
    )
}

// Export TabularizeTable.jsx
export default TabularizeTable;