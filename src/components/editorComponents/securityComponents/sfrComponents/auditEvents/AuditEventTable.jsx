// Imports
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from "@mui/material";
import { GET_ALL_SFR_OPTIONS_MAP } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { RESET_EVALUATION_ACTIVITY_UI } from "../../../../../reducers/SFRs/evaluationActivitiesUI.js";
import EditableTable from "../../../EditableTable.jsx";
import SfrWorksheet from "../SfrWorksheet.jsx";

/**
 * The AuditEventTable component
 * @returns {JSX.Element}
 * @constructor             passes in props to the className
 */
function AuditEventTable() {
    // Constants
    const dispatch = useDispatch();
    const { primary } = useSelector((state) => state.styling);
    const sfrSections = useSelector((state) => state.sfrSections);
    const terms = useSelector((state) => state.terms);

    // Table Constants
    const [rowData, setRowData] = useState([])
    const editable = { addColumn: false, addRow: false, removeColumn: false, removeRow: false }
    const columnData = [
        { headerName: "Requirement", field: "requirement", editable: false, resizable: false, type: "Button", flex: 1 },
        { headerName: "Tables", field: "tables", editable: false, resizable: false, type: "Chips", flex: 1 },
        { headerName: "Audit Event Details", field: "details", editable: false, resizable: true, type: "Inner Table", flex: 3 },
    ];
    const innerColumnData = [
        { headerName: "Auditable Events", field: "events", editable: false, resizable: true, type: "Multiline" },
        { headerName: "Additional Audit Record Contents", field: "contents", editable: false, resizable: true, type: "Multiline" },
    ]

    // Sfr Worksheet Constants
    const [openSfrWorksheet, setOpenSfrWorksheet] = useState(false);
    const [sfrUUID, setSfrUUID] = useState(null);
    const [componentUUID, setComponentUUID] = useState(null);
    const [allSfrOptionsMaps, setAllSfrOptionsMaps] = useState({
        dropdownOptions: {components: [], elements: [], selections: [], useCases: []},
        nameMap: {components: {}, elements: {}, selections: {}, useCases: {}},
        uuidMap: {components: {}, elements: {}, selections: {}, useCases: {}},
        useCaseUUID: null,
        elementSelections: {}
    });

    // Use Effects
    useEffect(() => {
        // Populate the audit events table
        populateAuditEventTable(sfrSections)

        // Generate the sfr options map for the sfr worksheet
        const newOptions = dispatch(GET_ALL_SFR_OPTIONS_MAP({ sfrSections: sfrSections, terms: terms })).payload
        if (JSON.stringify(newOptions) !== JSON.stringify(allSfrOptionsMaps)) {
            setAllSfrOptionsMaps(newOptions)
        }
    }, [sfrSections, terms]);
    useEffect(() => {
        // If the sfr worksheet has been closed, reset associated values
        if (!openSfrWorksheet) {
            setSfrUUID(null)
            setComponentUUID(null)
        }
        clearEvaluationActivityStorage()
    }, [openSfrWorksheet])

    // Methods
    const handleOpenSfrWorksheet = () => {
        setOpenSfrWorksheet(!openSfrWorksheet)
    }
    const handleComponentButtonClick = (event) => {
        // Set the sfr worksheet values with the selected component
        const { sectionUUID, componentUUID } = event
        if (sectionUUID && componentUUID && sfrSections.hasOwnProperty(sectionUUID) &&
            sfrSections[sectionUUID].hasOwnProperty(componentUUID)) {
            setSfrUUID(sectionUUID)
            setComponentUUID(componentUUID)
            setOpenSfrWorksheet(true)
        }
    }
    const populateAuditEventTable = (sfrSections) => {
        let updatedRows = []

        // Populate the audit events table
        Object.entries(sfrSections).forEach(([sectionUUID, component]) => {
            Object.entries(component).forEach(([componentUUID, value]) => {
                const ccID = value.cc_id ? value.cc_id : ""
                const iterationID = value.iteration_id ? value.iteration_id : ""
                const { optional, objective, invisible, selectionBased, useCaseBased, implementationDependent, auditEvents } = value

                // Get the requirement name
                const requirement = getXmlID(ccID, iterationID)

                // Get table tags
                const tables = []
                const conditions = [
                    { flag: !optional && !objective && !invisible && !selectionBased && !useCaseBased &&
                            !implementationDependent, table: "Mandatory" },
                    { flag: invisible, table: "Invisible" },
                    { flag: optional, table: "Optional" },
                    { flag: objective, table: "Objective" },
                    { flag: selectionBased, table: "Selection-based" },
                    { flag: useCaseBased, table: "Use-case" },
                    { flag: implementationDependent, table: "Implementation Dependent" }
                ];
                conditions.forEach(condition => {
                    if (condition.flag) {
                        tables.push(condition.table);
                    }
                });

                // Get events and contents
                const formattedEvents = formatAuditEvents(auditEvents ? Object.values(auditEvents) : [])

                // Generate row data
                updatedRows.push({
                    requirement: requirement,
                    sectionUUID: sectionUUID,
                    componentUUID: componentUUID,
                    tables: tables,
                    details: formattedEvents,
                })
            })
        })

        // Sort audit event rows by requirement
        if (updatedRows.length > 0) {
            updatedRows.sort((a, b) => {
                if (a.requirement < b.requirement) return -1;
                if (a.requirement > b.requirement) return 1;
                return 0;
            });
        }

        // Set the row data
        if (JSON.stringify(updatedRows) !== JSON.stringify(rowData)) {
            setRowData(updatedRows)
        }
    }

    // Helper Methods
    const clearEvaluationActivityStorage = () => {
        dispatch(RESET_EVALUATION_ACTIVITY_UI())
    }
    const formatAuditEvents = (auditEvents) => {
        let formatted = []

        // Format the audit events based on the information loaded in
        if (auditEvents && auditEvents.length > 0) {
            auditEvents.forEach((auditEvent) => {
                const { optional, description, items } = auditEvent
                let formattedDescription = "No events specified"

                // Add event
                if (description && description !== "") {
                    // If the event is optional, format it as a selectable
                    if (optional) {
                        formattedDescription = formatSelection(description)
                    } else {
                        formattedDescription = description
                    }
                }

                // Add content
                if (items && items.length > 0) {
                    let itemString = ""

                    // If the items list is greater than one, create a bulleted list of items
                    if (items.length > 1) {
                        items.forEach((item) => {
                            const { optional, info } = item

                            // If the item is optional, format it as a selectable
                            let formattedInfo = optional ? formatSelection(info) : info;
                            itemString += `<li>${formattedInfo}</li>`
                        })
                    } else {
                        const { optional, info } = items[0]

                        // If the item is optional, format it as a selectable
                        itemString = optional ? formatSelection(info) : info;
                    }
                    formatted.push({ events: formattedDescription, contents: itemString})
                } else {
                    // If the items list is empty, add item according to the formatted description value
                    if (formattedDescription === "No events specified") {
                        formatted.push({ events: "No events specified", contents: "N/A"})
                    } else {
                        formatted.push({ events: formattedDescription, contents: "No additional information"})
                    }
                }
            })
        } else {
            // If there are no audit events, set the events/contents to their defaults
            formatted.push({ events: "No events specified", contents: "N/A"})
        }
        return formatted;
    }
    const formatSelection = (value) => {
        // Format the selection as a selectable
        return `[<b>selection, choose one of</b>: <i>${value.trim()}, none</i>]`
    }
    const getXmlID = (ccID, iterationID) => {
        // Get the requirement title value for the table
        let requirement = ccID.valueOf().toUpperCase()
        if (iterationID && iterationID.length > 0) {
            iterationID = "/" + iterationID.toUpperCase()
            requirement += iterationID
        }
        return requirement
    }
    const isSfrWorksheetOpen = () => {
        return openSfrWorksheet && sfrUUID && componentUUID && sfrSections.hasOwnProperty(sfrUUID) && sfrSections[sfrUUID].hasOwnProperty(componentUUID)
    }

    // Return Method
    return (
        <div className="mt-5 mb-[-8px]">
            <EditableTable
                title={
                    <div
                        style={{color: primary}}
                        className="font-bold text-[14px] p-0 pr-4 text-secondary"
                    >
                        <Tooltip title={"Note: This table can also be used for SFR Navigation"}>
                            <label>{`Audit Events Table `}</label>
                        </Tooltip>
                        <label className="font-normal">(Only used/exported when FAU_GEN.1 is included)</label>
                    </div>
                }
                editable={editable}
                columnData={columnData}
                rowData={rowData}
                innerColumnData={innerColumnData}
                buttonTooltip={"Edit SFR Worksheet"}
                handleCellButtonClick={handleComponentButtonClick}
                tableInstructions={`To view or edit a specific SFR Worksheet, single-click on the desired 'Requirement'.`}
            />
            {
                isSfrWorksheetOpen() ?
                    <SfrWorksheet
                        sfrUUID={sfrUUID}
                        uuid={componentUUID}
                        value={sfrSections[sfrUUID][componentUUID]}
                        open={openSfrWorksheet}
                        allSfrOptions={openSfrWorksheet ? allSfrOptionsMaps : {}}
                        handleOpen={handleOpenSfrWorksheet}
                    />
                    :
                    null
            }
        </div>
    )
}

// Export AuditEventTable.jsx
export default AuditEventTable;