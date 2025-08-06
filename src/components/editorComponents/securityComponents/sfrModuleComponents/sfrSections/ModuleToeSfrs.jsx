// Imports
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { defaultAudit } from "../../../../../reducers/SFRs/sfrBasePPsSlice.js";
import { sfrTypeMap } from "../../../../../reducers/SFRs/sfrSlice.js";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { getCardTemplate, updateToeSfr } from "../../../../../utils/securityComponents.jsx";
import AuditableEvents from "./AuditableEvents.jsx";

/**
 * The ModuleToeSfrs section used to show the various types of module security requirements (mandatory, optional, etc.)
 * @returns {Element}
 * @constructor
 */
function ModuleToeSfrs() {
  // Constants
  const { toeSfrs } = useSelector((state) => state.sfrs);
  const { mandatory, optional, objective, selectionBased, implementationDependent } = toeSfrs || {};
  const { secondary } = useSelector((state) => state.styling);
  const headerTextColor = "text-accent";
  const collapseIconColor = secondary;

  // Methods
  /**
   * The handler for collapsing/expanding the section
   * @param open the value of open
   * @param header the header value
   */
  const handleSectionCollapse = (open, header) => {
    const sfrType = sfrTypeMap[header];

    // Update the section collapse by sfr type
    updateToeSfr(sfrType, "open", !open);
  };

  // Helper Methods

  // Components
  /**
   * The ToeSfrSection component
   * @param header the header used for the accordion
   * @param collapse the value of the expand/collapse
   * @param tooltip the optional tooltip for the section header
   * @param toeAudit the toe audit used for the auditable events section
   * @returns {JSX.Element}
   * @constructor
   */
  const ToeSfrSection = ({ header, collapse, tooltip = "", toeAudit }) => {
    const sfrType = sfrTypeMap[header];
    const formattedBody = (
      <div className='m-0 w-full border-0 p-4 pb-0 pt-2'>
        <div className='min-w-full m-0 p-0 mt-2 mb-[-16px]'>{<AuditableEvents sfrType={sfrType} toeAudit={toeAudit} dialogTitle={header} />}</div>
      </div>
    );

    // Get card template
    return (
      <div key={`${sfrType}ToeSfrSection`} className='w-full'>
        {getCardTemplate(header, formattedBody, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor)}
      </div>
    );
  };

  // Use Memos
  /**
   * The MandatorySection component
   */
  const MandatorySection = useMemo(() => {
    let open = mandatory?.open || false;
    let toeAudit = deepCopy(mandatory?.audit || defaultAudit);
    return <ToeSfrSection header={"Mandatory"} collapse={open} toeAudit={toeAudit} />;
  }, [mandatory]);
  /**
   * The OptionalSection component
   */
  const OptionalSection = useMemo(() => {
    let open = optional?.open || false;
    let toeAudit = deepCopy(optional?.audit || defaultAudit);
    return <ToeSfrSection header={"Optional"} collapse={open} toeAudit={toeAudit} />;
  }, [optional]);
  /**
   * The ObjectiveSection component
   */
  const ObjectiveSection = useMemo(() => {
    let open = objective?.open || false;
    let toeAudit = deepCopy(objective?.audit || defaultAudit);
    return <ToeSfrSection header={"Objective"} collapse={open} toeAudit={toeAudit} />;
  }, [objective]);
  /**
   * The SelectionBasedSection component
   */
  const SelectionBasedSection = useMemo(() => {
    let open = selectionBased?.open || false;
    let toeAudit = deepCopy(selectionBased?.audit || defaultAudit);
    return <ToeSfrSection header={"Selection-based"} collapse={open} toeAudit={toeAudit} />;
  }, [selectionBased]);
  /**
   * The ImplementationDependentSection component
   */
  const ImplementationDependentSection = useMemo(() => {
    let open = implementationDependent?.open || false;
    let toeAudit = deepCopy(implementationDependent?.audit || defaultAudit);
    return <ToeSfrSection header={"Implementation-dependent"} collapse={open} toeAudit={toeAudit} />;
  }, [implementationDependent]);

  // Return
  return (
    <div className='pt-2 mb-[-16px]'>
      {MandatorySection}
      {OptionalSection}
      {ObjectiveSection}
      {SelectionBasedSection}
      {ImplementationDependentSection}
    </div>
  );
}

// Export ModuleToeSfrs.jsx
export default ModuleToeSfrs;
