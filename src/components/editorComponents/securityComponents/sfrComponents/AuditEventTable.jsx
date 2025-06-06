// Imports
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "@mui/material";
import { RESET_SFR_WORKSHEET_UI } from "../../../../reducers/SFRs/sfrWorksheetUI.js";
import { deepCopy } from "../../../../utils/deepCopy.js";
import { getComponentXmlID, setSfrWorksheetUIItems, updateSfrWorksheetComponent } from "../../../../utils/securityComponents.jsx";
import EditableTable from "../../EditableTable.jsx";
import SfrWorksheet from "./SfrWorksheet.jsx";

/**
 * The AuditEventTable component
 * @param baseSfrUUID the baseSfrUUID
 * @param sfrType the sfr type
 * @returns {JSX.Element}
 * @constructor
 */
function AuditEventTable({ baseSfrUUID, sfrType }) {
  // Prop Validation
  AuditEventTable.propTypes = {
    baseSfrUUID: PropTypes.string,
    sfrType: PropTypes.string,
  };

  // Constants
  const dispatch = useDispatch();
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const sfrSections = useSelector((state) => state.sfrSections);
  const terms = useSelector((state) => state.terms);
  const { primary, secondary, requirementsStyling } = useSelector((state) => state.styling);
  const isBasePP = baseSfrUUID !== undefined && sfrType !== undefined;
  const textColor = isBasePP ? "text-accent" : "text-secondary";

  // Table Constants
  const [rowData, setRowData] = useState([]);
  const editable = { addColumn: false, addRow: false, removeColumn: false, removeRow: false };
  const columnData = [
    { headerName: "Requirement", field: "requirement", editable: false, resizable: false, type: "Button", flex: 1 },
    { headerName: "Tables", field: "tables", editable: false, resizable: false, type: "Chips", flex: 1 },
    { headerName: "Audit Event Details", field: "details", editable: false, resizable: true, type: "Inner Table", flex: 3 },
  ];
  const innerColumnData = [
    { headerName: "Auditable Events", field: "events", editable: false, resizable: true, type: "Multiline" },
    { headerName: "Additional Audit Record Contents", field: "contents", editable: false, resizable: true, type: "Multiline" },
  ];

  // Sfr Worksheet Constants
  const { isSfrWorksheetValid, openSfrWorksheet } = useSelector((state) => state.sfrWorksheetUI);

  // Use Effects
  useEffect(() => {
    // Populate the audit events table
    populateAuditEventTable(sfrSections, sfrBasePPs);

    // Update component values in the sfr worksheet
    updateSfrWorksheetComponent(sfrSections, terms);
  }, [sfrSections, sfrBasePPs, terms]);
  useEffect(() => {
    // If the sfr worksheet has been closed, reset associated values
    if (!openSfrWorksheet) {
      dispatch(RESET_SFR_WORKSHEET_UI());
    }

    // Update component values
    if (openSfrWorksheet) {
      // Update sfr worksheet component values
      updateSfrWorksheetComponent(sfrSections, terms);
    }
  }, [openSfrWorksheet]);

  // Methods
  /**
   * Handles opening the sfr worksheet
   */
  const handleOpenSfrWorksheet = () => {
    // Update sfr worksheet ui
    setSfrWorksheetUIItems({
      openSfrWorksheet: !openSfrWorksheet,
      sfrSections: deepCopy(sfrSections),
    });
  };
  /**
   * Handles the component button click
   * @param event
   */
  const handleComponentButtonClick = (event) => {
    // Set the sfr worksheet values with the selected component
    const { sectionUUID, componentUUID } = event;
    const isSectionUUID = sectionUUID && sectionUUID !== "";
    const isComponentUUID = componentUUID && componentUUID !== "";

    // Update and open sfr worksheet ui
    if (isSectionUUID && isComponentUUID) {
      setSfrWorksheetUIItems({
        openSfrWorksheet: true,
        sfrUUID: sectionUUID,
        componentUUID: componentUUID,
        sfrSections: deepCopy(sfrSections),
      });
    }
  };

  // Helper Methods
  /**
   * Populates the audit event table
   * @param sfrSections the sfr sections
   * @param sfrBasePPs the sfr base pps
   */
  const populateAuditEventTable = (sfrSections, sfrBasePPs) => {
    let updatedRows = [];
    const isTypeValid = sfrType && (sfrType === "modifiedSfrs" || sfrType === "additionalSfrs");
    const isBaseSfrUUIDValid = baseSfrUUID && sfrBasePPs?.hasOwnProperty(baseSfrUUID);
    const isBasePP = isTypeValid && isBaseSfrUUIDValid && sfrBasePPs[baseSfrUUID].hasOwnProperty(sfrType);
    let basePPSections = {};

    // Get basePP
    if (isBasePP) {
      let basePP = deepCopy(sfrBasePPs[baseSfrUUID][sfrType]);
      basePPSections = basePP.hasOwnProperty("sfrSections") ? basePP.sfrSections : {};
    }

    // Populate the audit events table
    Object.entries(sfrSections).forEach(([sectionUUID, component]) => {
      // Check for valid components
      if (!isBasePP || (isBasePP && basePPSections.hasOwnProperty(sectionUUID))) {
        Object.entries(component).forEach(([componentUUID, value]) => {
          const ccID = value.cc_id ? value.cc_id : "";
          const iterationID = value.iteration_id ? value.iteration_id : "";
          const {
            optional,
            objective,
            invisible,
            selectionBased,
            useCaseBased,
            implementationDependent,
            auditEvents,
            modifiedSfr,
            additionalSfr,
          } = value;
          const isSfr = !isBasePP && !additionalSfr && !modifiedSfr;
          const isModifiedSfr = sfrType === "modifiedSfrs" && modifiedSfr;
          const isAdditionalSfr = sfrType === "additionalSfrs" && additionalSfr;
          const isValidBasePP = isBasePP && (isModifiedSfr || isAdditionalSfr);

          // Get valid sfrs based on the parent type
          if (isSfr || isValidBasePP) {
            // Get the requirement name
            const requirement = getComponentXmlID(ccID, iterationID, true, false);

            // Get table tags
            const tables = [];
            const isMandatoryFlag = !optional && !objective && !invisible && !selectionBased && !useCaseBased && !implementationDependent;
            const conditions = [
              { flag: isMandatoryFlag, table: "Mandatory" },
              { flag: invisible, table: "Invisible" },
              { flag: optional, table: "Optional" },
              { flag: objective, table: "Objective" },
              { flag: selectionBased, table: "Selection-based" },
              { flag: useCaseBased, table: "Use-case" },
              { flag: implementationDependent, table: "Implementation Dependent" },
            ];
            conditions.forEach((condition) => {
              if (condition.flag) {
                tables.push(condition.table);
              }
            });

            // Get events and contents
            const formattedEvents = formatAuditEvents(auditEvents ? Object.values(auditEvents) : []);

            // Generate row data
            updatedRows.push({
              requirement: requirement,
              sectionUUID: sectionUUID,
              componentUUID: componentUUID,
              tables: tables,
              details: formattedEvents,
            });
          }
        });
      }
    });

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
      setRowData(updatedRows);
    }
  };
  /**
   * Formats the audit events
   * @param auditEvents the audit events
   * @returns {*[]} the formatted audit events
   */
  const formatAuditEvents = (auditEvents) => {
    let formatted = [];

    // Format the audit events based on the information loaded in
    if (auditEvents && auditEvents.length > 0) {
      auditEvents.forEach((auditEvent) => {
        const { optional, description, items } = auditEvent;
        let formattedDescription = "No events specified";

        // Add event
        if (description && description !== "") {
          // If the event is optional, format it as a selectable
          if (optional) {
            formattedDescription = formatSelection(description);
          } else {
            formattedDescription = description;
          }
        }

        // Add content
        if (items && items.length > 0) {
          let itemString = "";

          // If the items list is greater than one, create a bulleted list of items
          if (items.length > 1) {
            items.forEach((item) => {
              const { optional, info } = item;

              // If the item is optional, format it as a selectable
              let formattedInfo = optional ? formatSelection(info) : info;
              itemString += `<li>${formattedInfo}</li>`;
            });
          } else {
            const { optional, info } = items[0];

            // If the item is optional, format it as a selectable
            itemString = optional ? formatSelection(info) : info;
          }
          formatted.push({ events: formattedDescription, contents: itemString });
        } else {
          // If the items list is empty, add item according to the formatted description value
          if (formattedDescription === "No events specified") {
            formatted.push({ events: "No events specified", contents: "N/A" });
          } else {
            formatted.push({ events: formattedDescription, contents: "No additional information" });
          }
        }
      });
    } else {
      // If there are no audit events, set the events/contents to their defaults
      formatted.push({ events: "No events specified", contents: "N/A" });
    }
    return formatted;
  };
  /**
   * Formats the selection
   * @param value the selection to format
   * @returns {`[<b>selection, choose one of</b>: <i>${*}, none</i>]`} the selection as a string
   */
  const formatSelection = (value) => {
    // Format the selection as a selectable
    return `[<b>selection, choose one of</b>: <i>${value.trim()}, none</i>]`;
  };

  // Use Memos
  /**
   * Gets the sfr worksheet component
   */
  const getSfrWorksheet = useMemo(() => {
    // Open the sfr worksheet
    if (sfrSections && isSfrWorksheetValid) {
      return <SfrWorksheet handleOpen={handleOpenSfrWorksheet} />;
    } else {
      return null;
    }
  }, [isSfrWorksheetValid, openSfrWorksheet]);

  // Return Method
  return (
    <div className='mt-5 mb-[-8px]'>
      <EditableTable
        title={
          <div style={{ color: isBasePP ? secondary : primary }} className={`font-bold text-[14px] p-0 pr-4 ${textColor}`}>
            <Tooltip title={"Note: This table can also be used for SFR Navigation"}>
              <label>{`Audit Events Table `}</label>
            </Tooltip>
            {!baseSfrUUID && !sfrType && <label className='font-normal'>(Only used/exported when FAU_GEN.1 is included)</label>}
          </div>
        }
        editable={editable}
        columnData={columnData}
        rowData={rowData}
        innerColumnData={innerColumnData}
        buttonTooltip={"Edit SFR Worksheet"}
        handleCellButtonClick={handleComponentButtonClick}
        tableInstructions={`To view or edit a specific SFR Worksheet, single-click on the desired 'Requirement'.`}
        isBasePP={isBasePP}
        styling={isBasePP ? requirementsStyling.other : undefined}
      />
      {getSfrWorksheet}
    </div>
  );
}

// Export AuditEventTable.jsx
export default AuditEventTable;
