// Imports
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import { Tooltip } from "@mui/material";
import { defaultTipTapValues, UPDATE_CONSISTENCY_RATIONALE } from "../../../../reducers/SFRs/sfrBasePPsSlice.js";
import { deepCopy } from "../../../../utils/deepCopy.js";
import { getCardTemplate } from "../../../../utils/securityComponents.jsx";
import TipTapEditor from "../../TipTapEditor.jsx";
import EditableTable from "../../EditableTable.jsx";

/**
 * The ConsistencyRationale component
 * @param uuid the base pp uuid
 * @constructor
 */
function ConsistencyRationale({ uuid }) {
  // Prop Validation
  ConsistencyRationale.propTypes = {
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  let consistencyRationale = sfrBasePPs[uuid]?.consistencyRationale || {};
  const {
    conToe = deepCopy(defaultTipTapValues),
    conSecProb = deepCopy(defaultTipTapValues),
    conObj = deepCopy(defaultTipTapValues),
    conOpEn = deepCopy(defaultTipTapValues),
    conMod = { rows: [], open: true },
  } = consistencyRationale;
  const { primary, secondaryColor } = useSelector((state) => state.styling);
  const headerTextColor = "text-secondary";
  const collapseIconColor = primary;
  const keyToValue = {
    conToe: {
      value: conToe,
      header: "Consistency of TOE Type",
    },
    conSecProb: {
      value: conSecProb,
      header: "Consistency of Security Problem Definition",
    },
    conObj: {
      value: conObj,
      header: "Consistency of Objectives",
    },
    conOpEn: {
      value: conOpEn,
      header: "Consistency of Operational Environment Objectives",
    },
    conMod: {
      value: conMod,
      header: "Consistency Rationale Table",
    },
  };

  // Methods
  /**
   * Handles the section collapse
   * @param open the open value
   * @param header the header
   */
  const handleSectionCollapse = (open, header) => {
    // Update the collapse for the text editor section
    updateTextEditorSection(header, "open", !open);
  };
  /**
   * Handles the table collapse
   * @param open the open value
   */
  const handleTableCollapse = (open) => {
    // Update the collapse for the rationale table section
    updateRationaleTable("open", !open);
  };
  const handleTextUpdate = (text, title) => {
    // Update the text for the text editor section
    updateTextEditorSection(title, "text", text);
  };
  /**
   * Handles adding a new table row
   */
  const handleNewTableRow = () => {
    let { rows } = deepCopy(conMod);

    // Add new row
    rows.push({
      ref: "",
      text: "",
    });

    // Update consistency rationale
    updateRationaleTable("rows", rows);
  };
  /**
   * Handles updating the table row(s)
   * @param event the event
   */
  const handleUpdateTableRow = (event) => {
    const { rowIndex, data } = event;
    let { rows } = deepCopy(conMod);

    // Update the row by index
    rows[rowIndex] = data;

    // Update consistency rationale
    updateRationaleTable("rows", rows);
  };
  /**
   * Handles deleting the table row(s)
   * @param newData the new data
   */
  const handleDeleteTableRows = (newData) => {
    // Update consistency rationale
    updateRationaleTable("rows", newData);
  };

  // Helper Methods
  /**
   * Updates the text editor section
   * @param header the header
   * @param tagKey the tag key
   * @param value the value
   */
  const updateTextEditorSection = (header, tagKey, value) => {
    const key = getHeaderToKey(header);

    // Update collapse value for variable
    if (key && keyToValue.hasOwnProperty(key)) {
      let update = deepCopy(keyToValue[key].value);
      update[tagKey] = value;

      // Update consistency rationale
      updateConsistencyRationale(key, update);
    }
  };
  /**
   * Updates the rationale table
   * @param key the key
   * @param value the value
   */
  const updateRationaleTable = (key, value) => {
    let rationaleTable = deepCopy(conMod);
    rationaleTable[key] = value;

    // Update consistency rationale
    updateConsistencyRationale("conMod", rationaleTable);
  };
  /**
   * Updates the consistency rationale section
   * @param key key
   * @param value value
   */
  const updateConsistencyRationale = (key, value) => {
    dispatch(
      UPDATE_CONSISTENCY_RATIONALE({
        uuid,
        key,
        value,
      })
    );
  };
  /**
   * Gets the header to key
   * @param header the header
   * @returns {string|null}
   */
  const getHeaderToKey = (header) => {
    return Object.keys(keyToValue).find((key) => keyToValue[key].header === header) || null;
  };

  // Components
  /**
   * The TextEditor section
   * @param tag the tag
   * @param tooltip the tooltip
   * @returns {JSX.Element}
   */
  const TextEditor = ({ tag = "", tooltip = "" }) => {
    let consistencyValue = consistencyRationale[tag] || {};
    const { text = "", open: collapse = true } = consistencyValue;
    const header = keyToValue.hasOwnProperty(tag) ? keyToValue[tag].header : "";
    const body = (
      <div className='min-w-full p-4 pb-0 mb-[-8px]'>
        <TipTapEditor title={header} text={text} contentType={"term"} handleTextUpdate={handleTextUpdate} />
      </div>
    );

    // Get card template
    return getCardTemplate(header, body, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor);
  };
  /**
   * Gets the rationale table instructions
   * @returns {JSX.Element}
   */
  function getTableInstructions() {
    return (
      <div>
        The &lt;con-mod&gt; tag references the id of a Threat, Assumption, OE Assumption, Objective, OE Objective, or SFR; and associates
        text with the _id. This information is presented in auto-generated tables in the Consistency Rationale section for each Base PP of
        the PP-module.
        <br />
        <div className='preview'>
          <ul>
            <li>Threats and Assumptions are presented in the "Consistency of Security Problem Definition" table.</li>
            <li>Security Objectives are presented in the "Consistency of Objectives" table. Except Direct Rationale PPs and PP-Modules.</li>
            <li>Operational Environment Objectives are presented in the "Consistency of OE Objectives" table.</li>
            <li>SFRs are presented in the "Consistency of Requirements" table.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Use Memos
  /**
   * The ToeTypeSection
   * @constructor
   */
  const ToeTypeSection = useMemo(() => {
    return <TextEditor tag={"conToe"} tooltip={`The contents of this tag appear in the "Consistency of TOE Type" section`} />;
  }, [conToe]);
  /**
   * The SecurityProblemDefinitionSection
   * @constructor
   */
  const SecurityProblemDefinitionSection = useMemo(() => {
    return (
      <TextEditor
        tag={"conSecProb"}
        tooltip={`The contents of this tag appear at the introduction to "Consistency of Security Problem Definition" 
                     table for the Base PP. The table is auto-generated from information pertaining to Threats, Assumptions, 
                     and Operational Security Policies in the <con-mod> tags`}
      />
    );
  }, [conSecProb]);
  /**
   * The ObjectivesSection
   * @constructor
   */
  const ObjectivesSection = useMemo(() => {
    return (
      <TextEditor
        tag={"conObj"}
        tooltip={`The contents of this tag serve to introduce the "Consistency of Objectives" table for this Base PP. 
                     The Table is auto-generated from the Objectives in the <con-mod> tags.This section may be omitted 
                     for Direct Rationale documents. If it is not omitted, it is ignored.`}
      />
    );
  }, [conObj]);
  /**
   * The OperationalEnvironmentObjectivesSection
   * @constructor
   */
  const OperationalEnvironmentObjectivesSection = useMemo(() => {
    return (
      <TextEditor
        tag={"conOpEn"}
        tooltip={`The contents of this tag serve to introduce the "Consistency of OE Objectives" table for this Base 
                     PP. The Table is auto-generated from the Operational Objectives in the <con-mod> tags. This table 
                     appears in the same subsection as the above "Consistency of Objectives," so it is not necessary to
                     provide introductory text and the tag can be left empty.`}
      />
    );
  }, [conOpEn]);
  /**
   * The RationaleTableSection component
   * @returns {JSX.Element}
   * @constructor
   */
  const RationaleTableSection = useMemo(() => {
    const { rows = [], open: collapse = true } = conMod;
    const title = keyToValue.conMod.header;
    const editable = { addColumn: false, addRow: true, removeColumn: false, removeRow: true };
    const columnData = [
      { headerName: "PP-Module", field: "ref", editable: true, resizable: true, type: "Editor", flex: 0.75, headerTooltip: "" },
      {
        headerName: "Consistency Rationale",
        field: "text",
        editable: true,
        resizable: true,
        type: "Large Editor",
        flex: 2,
        headerTooltip: "",
      },
    ];
    const rowData = deepCopy(rows);

    return (
      <EditableTable
        title={
          <Tooltip arrow id={"consistencyRationaleTableTooltip"}>
            <label style={{ color: secondaryColor }}>{title}</label>
          </Tooltip>
        }
        isTitleEditable={false}
        editable={editable}
        columnData={columnData}
        rowData={rowData}
        tableInstructions={getTableInstructions()}
        collapse={collapse}
        handleNewTableRow={handleNewTableRow}
        handleCollapse={handleTableCollapse}
        handleUpdateTableRow={handleUpdateTableRow}
        handleDeleteTableRows={handleDeleteTableRows}
      />
    );
  }, [conMod]);

  // Return Method
  return (
    <div className='mb-[-16px]'>
      {ToeTypeSection}
      {SecurityProblemDefinitionSection}
      {ObjectivesSection}
      {OperationalEnvironmentObjectivesSection}
      {RationaleTableSection}
    </div>
  );
}

// Export ConsistencyRationale.jsx
export default ConsistencyRationale;
