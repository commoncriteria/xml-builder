// Imports
import React from "react";
import { FormControl, TextField } from "@mui/material";
import AccordionContent from "./AccordionContent.jsx";
import { useDispatch, useSelector } from "react-redux";
import { updateMetaDataItem } from "../../reducers/accordionPaneSlice.js";
import CardTemplate from "../editorComponents/securityComponents/CardTemplate.jsx";
import EditableTable from "../editorComponents/EditableTable.jsx";

/**
 * The MetadataSection class that the metadata section of the content pane
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function MetadataSection() {
    // Constants
    const dispatch = useDispatch()
    const metadataSection = useSelector((state) => state.accordionPane.metadata);
    const columnData = [
        { headerName: "Version", field: "version", editable: true, resizable: true, type: "Number", flex: 1 },
        { headerName: "Date", field: "date", editable: true, resizable: true, type: "Date", flex: 1 },
        { headerName: "Comments", field: "comment", editable: true, resizable: true, type: "Large Editor", flex: 3 },
    ];
    const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true }

    // Methods
    const handleUpdates = (type, event) => {
        let item;
        switch (type) {
            case "ppName": {
                item = event.target.value
                break;
            } case "version": {
                item = event.target.value
                break;
            } case "releaseDate": {
                item = event.target.value
                break;
            } case "open": {
                item = !metadataSection.open.valueOf()
                break;
            }
            default: break;
        }

        // Update metadata
        dispatch(updateMetaDataItem({type: type, item: item}))
    }
    const handleNewTableRow = () => {
        const type = "revisionHistory"
        let revisionHistory = metadataSection.revisionHistory ? JSON.parse(JSON.stringify(metadataSection.revisionHistory)) : []
        revisionHistory.push({ version: "", date: "", comment: "" })
        dispatch(updateMetaDataItem({ type: type, item: revisionHistory }))
    }
    const handleUpdateTableRow = (updatedRow) => {
        const type = "revisionHistory"
        const { version, date, comment, index } = updatedRow.data
        let revisionHistory = metadataSection.revisionHistory ? JSON.parse(JSON.stringify(metadataSection.revisionHistory)) : []
        if (revisionHistory[index]) {
            revisionHistory[index] = { version: version, date: date && date !== "" ? new Date(date).toLocaleDateString() : "", comment: comment }
            dispatch(updateMetaDataItem({ type: type, item: revisionHistory }))
        }
    }
    const handleDeleteTableRows = (updatedRows) => {
        if (updatedRows) {
            const type = "revisionHistory"
            dispatch(updateMetaDataItem({ type: type, item: updatedRows }))
        }
    }
    const generateMetaDataTableValues = () => {
        return metadataSection.revisionHistory?.map((revision, index) => {
            const { version, date, comment } = revision
            return { version: version, date: date, comment: comment, index: index }
        })
    }

    // Return Method
    return (
        <AccordionContent
            title={"Metadata Section"}
            open={metadataSection.open}
            metadata={
                <div className="min-w-full">
                    <div className="min-w-full px-4 pb-2 border-gray-300">
                        <div className="mx-[-16px] mt-[-8px]">
                            <CardTemplate
                                type={"section"}
                                header={<label className="resize-none justify-center flex font-bold text-[14px] p-0 pr-4 text-secondary">Current Revision</label>}
                                body={
                                    <span className="flex justify-stretch min-w-full pb-2">
                                        <FormControl fullWidth>
                                            <TextField required color={"secondary"} label={"PP Name"}
                                                       key={metadataSection.ppName} defaultValue={metadataSection.ppName}
                                                       inputProps={{style: {fontSize: 13}}} InputLabelProps={{style: {fontSize: 13}}}
                                                       onBlur={(event) => {handleUpdates("ppName", event)}}/>
                                        </FormControl>
                                        <FormControl fullWidth sx={{paddingLeft: 2}}>
                                            <TextField required color={"secondary"} label={"Version"} type={"number"}
                                                       key={metadataSection.version} defaultValue={metadataSection.version}
                                                       inputProps={{style: {fontSize: 13}}} InputLabelProps={{style: {fontSize: 13}}}
                                                       onBlur={(event) => {handleUpdates("version", event)}}/>
                                        </FormControl>
                                        <FormControl fullWidth sx={{paddingLeft: 2}}>
                                            <TextField required color={"secondary"} label={"Release Date"} type={'date'}
                                                       key={metadataSection.releaseDate} defaultValue={metadataSection.releaseDate}
                                                       inputProps={{style: {fontSize: 13}}} InputLabelProps={{style: {fontSize: 13}, shrink: true }}
                                                       onBlur={(event) => {handleUpdates("releaseDate", event)}}/>
                                        </FormControl>
                                    </span>
                                }
                            />
                        </div>
                        <div className="mt-2 mb-[-8px]">
                            <EditableTable
                                title={"Revision History"}
                                editable={editable}
                                columnData={columnData}
                                rowData={generateMetaDataTableValues()}
                                handleNewTableRow={handleNewTableRow}
                                handleUpdateTableRow={handleUpdateTableRow}
                                handleDeleteTableRows={handleDeleteTableRows}
                                tableInstructions={`To edit a cell, double-click on it.`}
                            />
                        </div>
                    </div>
                </div>
            }
            handleMetaDataCollapse={handleUpdates}
        />
    );
}

// Export MetadataSection.jsx
export default MetadataSection;