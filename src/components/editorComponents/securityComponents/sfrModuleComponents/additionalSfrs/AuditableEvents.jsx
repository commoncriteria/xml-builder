// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Card } from "@material-tailwind/react";
import { defaultBasePP } from "../../../../../reducers/SFRs/sfrBasePPsSlice.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import {
  getCardTemplate,
  handleSnackBarError,
  handleSnackbarTextUpdates,
  updateAdditionalSfr,
} from "../../../../../utils/securityComponents.jsx";
import AuditEventTable from "../../sfrComponents/AuditEventTable.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import FormTextField from "../FormTextField.jsx";
import ResetDataConfirmation from "../../../../modalComponents/ResetDataConfirmation.jsx";
import ToggleSwitch from "../../../../ToggleSwitch.jsx";

/**
 * The AuditableEvents section for Additional Sfrs
 * @param uuid
 * @constructor
 */
function AuditableEvents({ uuid }) {
  // Prop Validation
  AuditableEvents.propTypes = {
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  let additionalSfrs = sfrBasePPs[uuid]?.additionalSfrs || {};
  let audit = additionalSfrs?.audit || {};
  let { section: defaultSection, auditTable: defaultAuditTable } = defaultBasePP.additionalSfrs.audit;
  const { isAudit = true, section = deepCopy(defaultSection), auditTable = deepCopy(defaultAuditTable), open = true } = audit;
  const { primary, secondary, primaryToggleTypographyLarge, primaryToggleSwitch } = useSelector((state) => state.styling);
  const toggleStyling = {
    largeToggleTypography: {
      ...primaryToggleTypographyLarge,
      fontSize: "14px",
    },
    secondaryToggleSwitch: primaryToggleSwitch,
  };
  const headerTextColor = "text-accent";
  const collapseIconColor = secondary;
  const [openResetData, setOpenResetData] = useState(false);

  // Methods
  /**
   * Handles the auditable events toggle
   * @param toggle the toggle
   */
  const handleAuditableEventsToggle = (toggle) => {
    // Update audit
    updateAudit("isAudit", toggle);
  };
  /**
   * Handles the text update
   * @param event the event
   * @param title the title
   * @param tag the tag
   */
  const handleTextUpdate = (event, title, tag) => {
    try {
      const text = event.target.value;

      // Update the text based on the type
      handleSnackbarTextUpdates(tag === "section" ? updateSection : updateAuditTableSection, title, text);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the section collapse
   */
  const handleSectionCollapse = () => {
    // Update audit
    updateAudit("open", !open);
  };
  /**
   * Handles the inner section collapse
   * @param open the open value
   * @param header the header
   */
  const handleInnerSectionCollapse = (open, header) => {
    const key = "open";
    const value = !open;

    // Update the collapse value based on the type
    if (header === "Section Definition") {
      updateSection(key, value);
    } else {
      updateAuditTableSection(key, value);
    }
  };
  /**
   * Handles opening the reset data confirmation
   */
  const handleOpenResetDataConfirmation = (event) => {
    const toggle = event.target.checked;

    // Set a confirmation if turning the toggle off otherwise turn the toggle on
    if (toggle) {
      handleAuditableEventsToggle(toggle);
    } else {
      setOpenResetData(true);
    }
  };
  /**
   * Handles submitting the reset data confirmation
   */
  const handleSubmitResetDataConfirmation = () => {
    // Set the toggle
    handleAuditableEventsToggle(false);

    // Close the reset data confirmation dialog
    setOpenResetData(false);
  };

  // Helper Methods
  /**
   * Updates the section
   * @param key the key
   * @param value the value
   */
  const updateSection = (key, value) => {
    let newSection = deepCopy(section);
    newSection[key] = value;

    // Update audit
    updateAudit("section", newSection);
  };
  /**
   * Updates the audit table section
   * @param key the key
   * @param value the value
   */
  const updateAuditTableSection = (key, value) => {
    let newAuditTable = deepCopy(auditTable);
    newAuditTable[key] = value;

    // Update audit
    updateAudit("auditTable", newAuditTable);
  };
  /**
   * Updates the audit
   * @param key the key
   * @param value the value
   */
  const updateAudit = (key, value) => {
    let auditCopy = deepCopy(audit);
    auditCopy[key] = value;

    // Reset values for the audit section if isAudit switched
    if (key === "isAudit" && !value) {
      auditCopy.section = deepCopy(defaultSection);
      auditCopy.auditTable = deepCopy(defaultAuditTable);
    }

    // Update additional sfr
    updateAdditionalSfr(uuid, "audit", auditCopy);
  };

  // Components
  /**
   * Gets the extended component definition toggle section
   * @returns {JSX.Element}
   */
  const getAuditableEventsToggle = () => {
    const title = "Auditable Events";

    return (
      <ToggleSwitch
        title={title}
        isToggled={isAudit}
        isSfrWorksheetToggle={true}
        handleUpdateToggle={handleOpenResetDataConfirmation}
        styling={toggleStyling}
      />
    );
  };
  /**
   * The AuditSection component
   * @constructor
   */
  function AuditSection(type) {
    const tooltip = "";
    const { id: sectionID, title: sectionTitle, open: sectionCollapse } = section;
    const { id: auditTableID, title: auditTitle, table, open: auditCollapse } = auditTable;
    const isSection = type === "section" ? true : false;
    const header = isSection ? "Section Definition" : "Audit Table Definition";
    const id = isSection ? sectionID : auditTableID;
    const title = isSection ? sectionTitle : auditTitle;
    const collapse = isSection ? sectionCollapse : auditCollapse;
    const body = (
      <div className='min-w-full p-4 pb-0'>
        <span className='flex justify-stretch min-w-full gap-2'>
          <FormTextField value={id} label={"ID"} tag={type} handleTextUpdate={handleTextUpdate} />
          {!isSection && <FormTextField value={table} label={"Table"} tag={type} handleTextUpdate={handleTextUpdate} />}
          <FormTextField value={title} label={"Title"} tag={type} handleTextUpdate={handleTextUpdate} />
        </span>
      </div>
    );

    // Get card template
    return getCardTemplate(header, body, tooltip, collapse, handleInnerSectionCollapse, headerTextColor, collapseIconColor);
  }

  // Return Method
  return (
    <div>
      {!isAudit ? (
        <Card className='mb-4 pb-[-8px]'>
          <div className='w-full border-2 border-gray-300 rounded-md p-2 pb-[6px] m-0'>
            <div className={"mt-[6px]"}>{getAuditableEventsToggle()}</div>
          </div>
        </Card>
      ) : (
        <CardTemplate
          type={"parent"}
          header={<div className='w-full flex justify-center text-center p-0 m-0 my-[-3px] ml-[-8px]'>{getAuditableEventsToggle()}</div>}
          body={
            <div className='min-w-full'>
              <div className='min-w-full m-0 p-4 pb-0 mb-[-6px]'>
                {AuditSection("section")}
                {AuditSection("auditTable")}
              </div>
              <div className='min-w-full m-0 p-0 px-4 mb-[-2px]'>
                <AuditEventTable baseSfrUUID={uuid} sfrType={"additionalSfrs"} />
              </div>
            </div>
          }
          collapse={open}
          collapseHandler={handleSectionCollapse}
          tooltip={"Auditable Events"}
          collapseIconColor={primary}
        />
      )}
      <ResetDataConfirmation
        title={"Reset Auditable Events"}
        text={"Are you sure you want to reset all Auditable Events data to its initial state?"}
        open={openResetData}
        handleOpen={() => setOpenResetData(false)}
        handleSubmit={handleSubmitResetDataConfirmation}
      />
    </div>
  );
}

// Export AuditableEvents.jsx
export default AuditableEvents;
