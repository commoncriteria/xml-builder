// Imports
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { COLLAPSE_SFR_BASE_PP_INNER_SECTION } from "../../../../reducers/SFRs/sfrBasePPsSlice.js";
import { deepCopy } from "../../../../utils/deepCopy.js";
import { getCardTemplate } from "../../../../utils/securityComponents.jsx";
import ConsistencyRationale from "./ConsistencyRationale.jsx";
import DeclarationAndReference from "./DeclarationAndReference.jsx";
import ModuleSfrSections from "./sfrSections/ModuleSfrSections.jsx";

/**
 * The SfrBasePP content
 * @param uuid the base pp uuid
 * @returns {JSX.Element}
 * @constructor
 */
function SfrBasePP({ uuid }) {
  // Prop Validation
  SfrBasePP.propTypes = {
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  const { secondary } = useSelector((state) => state.styling);
  const headerTextColor = "text-accent";
  const collapseIconColor = secondary;

  // Methods
  /**
   * Handles section collapse
   * @param open the current value of open
   * @param header the header
   */
  const handleSectionCollapse = (open, header) => {
    const key = getKey(header);

    if (key) {
      dispatch(
        COLLAPSE_SFR_BASE_PP_INNER_SECTION({
          uuid,
          key,
          open: !open,
        })
      );
    }
  };

  // Helper Methods
  /**
   * Gets the key
   * @param header the header
   * @returns {*|null}
   */
  const getKey = (header) => {
    const headerToKeyMap = {
      "Declaration and Reference": "declarationAndRef",
      "Modified Sfrs": "modifiedSfrs",
      "Additional Sfrs": "additionalSfrs",
      "Consistency Rationale": "consistencyRationale",
    };

    return headerToKeyMap.hasOwnProperty(header) ? headerToKeyMap[header] : null;
  };
  /**
   * Gets the value for open
   * @param header the header
   * @returns {*|boolean|boolean}
   */
  const getIsOpen = (header) => {
    const key = getKey(header);

    // Get value of open
    if (key) {
      const currentBasePP = sfrBasePPs.hasOwnProperty(uuid) ? deepCopy(sfrBasePPs[uuid]) : null;
      const isValidKey = currentBasePP && currentBasePP.hasOwnProperty(key) && currentBasePP[key].hasOwnProperty("open");

      return isValidKey ? currentBasePP[key].open : false;
    }

    return false;
  };

  // Components
  /**
   * The BasePPSection
   * @param props the props
   * @returns {JSX.Element}
   * @constructor
   */
  function BasePPSection(props) {
    const { header, body, tooltip = "" } = props;
    const collapse = getIsOpen(header);
    const formattedBody = <div className='min-w-full p-4 pb-0'>{body}</div>;

    // Get card template
    return getCardTemplate(header, formattedBody, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor);
  }

  // Return Method
  return (
    <div className='min-w-full'>
      <BasePPSection
        header={"Declaration and Reference"}
        body={<DeclarationAndReference uuid={uuid} />}
        tooltip={"Base PPs are declared using the <base-pp> element. The published documents are referenced using the <url> and <branch> tags"}
      />
      <BasePPSection
        header={"Modified Sfrs"}
        body={<ModuleSfrSections uuid={uuid} isAdditionalSfr={false} />}
        tooltip={`The Modified SFRs section contains SFRs that appear in the Base PP, but are modified when the Base 
                     PP is in a configuration with the PP-Module.`}
      />
      <BasePPSection
        header={"Additional Sfrs"}
        body={<ModuleSfrSections uuid={uuid} isAdditionalSfr={true} />}
        tooltip={
          <div>
            An SFR should be classified as "additional" if the requirement applies when the Base PP is in a configuration with the PP-Module, yet that exact
            requirement does not apply all Base PPs that the PP-Module may be in a configuration with. If the same requirement applies to all Base PPs, then it
            should be in the TOE Requirements section.
            <br />
            <br />
            By default, all SFRs in the "Additional SFRs" section are considered mandatory. But if a requirement should be "optional" or something else, simply
            set the status attribute of the &lt;f-component&gt; to the appropriate value. In the published document, the SFR will still appear in the Additional
            SFRs section, but it will have a heading indicating that it is optional, selection-based, etc.
          </div>
        }
      />
      <BasePPSection
        header={"Consistency Rationale"}
        body={<ConsistencyRationale uuid={uuid} />}
        tooltip={
          <div>
            CC:2022 Part 1 C.2.2.3 describes a Consistency Rationale that is required for each Base PP supported by the PP-Module.
            <br />
            <br />
            In NIAP PP-Modules, the Consistency Rationale is a separate section that appears after all the SFRs and SARs. It is auto-generated from information
            provided in the &lt;base-pp&gt; element.
          </div>
        }
      />
    </div>
  );
}

// Export SfrBasePP.jsx
export default SfrBasePP;
