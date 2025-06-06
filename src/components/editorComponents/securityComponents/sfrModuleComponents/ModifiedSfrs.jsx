// Imports
import PropTypes from "prop-types";

/**
 * The ModifiedSfrs component
 * @param uuid the base pp uuid
 * @constructor
 */
function ModifiedSfrs({ uuid }) {
  // Prop Validation
  ModifiedSfrs.propTypes = {
    uuid: PropTypes.string.isRequired,
  };

  // Return Method
  return <div>Modified Sfrs</div>;
}

// Export ModifiedSfrs.jsx
export default ModifiedSfrs;
