// Imports
import {useState} from "react";
import './components.css';

/**
 * The SecurityObjectivesTable component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the class
 */
function SecurityObjectivesTable(props) {
    // Prop Validation
    SecurityObjectivesTable.propTypes = {
    }

    // Constants
    const defaultTable =
        [{name: "T.NETWORK_ATTACK",
        securityObjectives: [
            {name: "O.PROTECTED_COMMS", rationale: "The threat T.NETWORK_ATTACK is countered by O.PROTECTED_COMMS as this provides for integrity of transmitted data."},
            {name: "O.INTEGRITY", rationale: "The threat T.NETWORK_ATTACK is countered by O.INTEGRITY as this provides for integrity of software that is installed onto the system from the network."},
            {name: "O.MANAGEMENT", rationale: "The threat T.NETWORK_ATTACK is countered by O.MANAGEMENT as this provides for the ability to configure the OS to defend against network attack."},
            {name: "O.ACCOUNTABILITY", rationale: "The threat T.NETWORK_ATTACK is countered by O.ACCOUNTABILITY as this provides a mechanism for the OS to report behavior that may indicate a network attack has occurred."},
        ]}, {name: "T.NETWORK_EAVESDROP",
        securityObjectives: [
            {name: "O.PROTECTED_COMMS", rationale: "The threat T.NETWORK_EAVESDROP is countered by O.PROTECTED_COMMS as this provides for confidentiality of transmitted data."},
            {name: "O.MANAGEMENT", rationale: "The threat T.NETWORK_EAVESDROP is countered by O.MANAGEMENT as this provides for the ability to configure the OS to protect the confidentiality of its transmitted data."},
            {name: "O.INTEGRITY", rationale: "The objective O.INTEGRITY protects against the use of mechanisms that weaken the TOE with regard to attack by other software on the platform."},
            {name: "O.ACCOUNTABILITY", rationale: "The objective O.ACCOUNTABILITY protects against local attacks by providing a mechanism to report behavior that may indicate a local attack is occurring or has occurred."},
    ]}];
    const [table, setTable] = useState(defaultTable);
  // const title = useSelector((state) =>
  //                     props.type === "builder" ? state.contentPane.builderPane.title : state.contentPane.previewPane.title)
  // const content = useSelector((state) =>
  //                     props.type === "builder" ? state.contentPane.builderPane.content : state.contentPane.previewPane.content)

  // Methods
    const addHandler = () => {
        // setTerms([...terms, {term: null, definition: null}])
    }
    const removeHandler = () => {
        // if (terms.length){
        //     setTerms(terms.slice(0,-1));
        // }
    }

    // Return Method
    return (
      <table>
        <caption>
          <span className="ctr" data-myid="" data-counter-type="ct-Table" id="">Table <span className="counter">1</span></span>: Security Objectives Rationale
        </caption>
        <tbody>
          <tr className="header">
            <td>Threat, Assumption, or OSP</td>
            <td>Security Objectives</td>
            <td>Rationale</td>
          </tr>
          <tr className="major-row">
            <td rowSpan="4">
              <a href="#T.NETWORK_ATTACK">T.NETWORK_ATTACK</a><br/>
            </td>
            <td>
              <a href="#O.PROTECTED_COMMS">O.PROTECTED_COMMS</a>
            </td>
            <td>
              The threat <a href="#T.NETWORK_ATTACK">T.NETWORK_ATTACK</a> is countered by <a href="#O.PROTECTED_COMMS">O.PROTECTED_COMMS</a> as this provides for integrity of transmitted data.
            </td>
          </tr>
          <tr>
            <td>
              <a href="#O.INTEGRITY">O.INTEGRITY</a>
            </td>
            <td>
              The threat <a href="#T.NETWORK_ATTACK">T.NETWORK_ATTACK</a> is countered by <a href="#O.INTEGRITY">O.INTEGRITY</a> as this provides for integrity of software that is installed onto the system from the network.
            </td>
          </tr>
          <tr>
            <td>
              <a href="#O.MANAGEMENT">O.MANAGEMENT</a>
            </td>
            <td>
              The threat <a href="#T.NETWORK_ATTACK">T.NETWORK_ATTACK</a> is countered by <a href="#O.MANAGEMENT">O.MANAGEMENT</a> as this provides for the ability to configure the <abbr className="dyn-abbr" title="Operating System"><a href="#abbr_OS">OS</a></abbr> to defend against network attack.
            </td>
          </tr>
          <tr>
            <td>
              <a href="#O.ACCOUNTABILITY">O.ACCOUNTABILITY</a>
            </td>
            <td>
              The threat <a href="#T.NETWORK_ATTACK">T.NETWORK_ATTACK</a> is countered by <a href="#O.ACCOUNTABILITY">O.ACCOUNTABILITY</a> as this provides a mechanism for the <abbr className="dyn-abbr" title="Operating System"><a href="#abbr_OS">OS</a></abbr> to report behavior that may indicate a network attack has occurred.
            </td>
          </tr>
          <tr className="major-row">
            <td rowSpan="2">
              <a href="#T.NETWORK_EAVESDROP">T.NETWORK_EAVESDROP</a><br/>
            </td>
            <td>
              <a href="#O.PROTECTED_COMMS">O.PROTECTED_COMMS</a>
            </td>
            <td>
              The threat <a href="#T.NETWORK_EAVESDROP">T.NETWORK_EAVESDROP</a> is countered by <a href="#O.PROTECTED_COMMS">O.PROTECTED_COMMS</a> as this provides for confidentiality of transmitted data.
            </td>
          </tr>
          <tr>
            <td>
              <a href="#O.MANAGEMENT">O.MANAGEMENT</a>
            </td>
            <td>
              The threat <a href="#T.NETWORK_EAVESDROP">T.NETWORK_EAVESDROP</a> is countered by <a href="#O.MANAGEMENT">O.MANAGEMENT</a> as this provides for the ability to configure the <abbr className="dyn-abbr" title="Operating System"><a href="#abbr_OS">OS</a></abbr> to protect the confidentiality of its transmitted data.
            </td>
          </tr>
          <tr className="major-row">
            <td rowSpan="2">
              <a href="#T.LOCAL_ATTACK">T.LOCAL_ATTACK</a><br/>
            </td>
            <td>
              <a href="#O.INTEGRITY">O.INTEGRITY</a>
            </td>
            <td>
              The objective <a href="#O.INTEGRITY">O.INTEGRITY</a> protects against the use of mechanisms that weaken the <abbr className="dyn-abbr" title="Target of Evaluation"><a href="#abbr_TOE">TOE</a></abbr> with regard to attack by other software on the platform.
            </td>
          </tr>
          <tr>
            <td>
              <a href="#O.ACCOUNTABILITY">O.ACCOUNTABILITY</a>
            </td>
            <td>
              The objective <a href="#O.ACCOUNTABILITY">O.ACCOUNTABILITY</a> protects against local attacks by providing a mechanism to report behavior that may indicate a local attack is occurring or has occurred.
            </td>
          </tr>
          <tr className="major-row">
            <td rowSpan="1">
              <a href="#T.LIMITED_PHYSICAL_ACCESS">T.LIMITED_PHYSICAL_ACCESS</a><br/>
            </td>
            <td>
              <a href="#O.PROTECTED_STORAGE">O.PROTECTED_STORAGE</a>
            </td>
            <td>
              The objective <a href="#O.PROTECTED_STORAGE">O.PROTECTED_STORAGE</a> protects against unauthorized attempts to access physical storage used by the <abbr className="dyn-abbr" title="Target of Evaluation"><a href="#abbr_TOE">TOE</a></abbr>.
            </td>
          </tr>
          <tr className="major-row">
            <td rowSpan="1">
              <a href="#A.PLATFORM">A.PLATFORM</a><br/>
            </td>
            <td>
              <a href="#OE.PLATFORM">OE.PLATFORM</a>
            </td>
            <td>
              The operational environment objective <a href="#OE.PLATFORM">OE.PLATFORM</a> is realized through <a href="#A.PLATFORM">A.PLATFORM</a>.
            </td>
          </tr>
          <tr className="major-row">
            <td rowSpan="1">
              <a href="#A.PROPER_USER">A.PROPER_USER</a><br/>
            </td>
            <td>
              <a href="#OE.PROPER_USER">OE.PROPER_USER</a>
            </td>
            <td>
              The operational environment objective <a href="#OE.PROPER_USER">OE.PROPER_USER</a> is realized through <a href="#A.PROPER_USER">A.PROPER_USER</a>.
            </td>
          </tr>
          <tr className="major-row">
            <td rowSpan="1">
              <a href="#A.PROPER_ADMIN">A.PROPER_ADMIN</a><br/>
            </td>
            <td>
              <a href="#OE.PROPER_ADMIN">OE.PROPER_ADMIN</a>
            </td>
            <td>
              The operational environment objective <a href="#OE.PROPER_ADMIN">OE.PROPER_ADMIN</a> is realized through <a href="#A.PROPER_ADMIN">A.PROPER_ADMIN</a>.
            </td>
          </tr>
        </tbody>
      </table>
      );
    }


// Export SecurityObjectivesTable.jsx
export default SecurityObjectivesTable;