// Imports
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getCardTemplate } from "../../utils/securityComponents.jsx";
import FormTextField from "./securityComponents/sfrModuleComponents/FormTextField.jsx";

/**
 * The GitHubRepositorySection component
 * @constructor
 */
/**
 * The GitHubRepositorySection component
 * @param git the git values of url, branch and open
 * @param tooltip the optional tooltip for the section
 * @param styling the optional styling of the section
 * @param handleTextUpdate this handles the text update based on the title
 * @param handleSectionCollapse this handles updating the collapse of the section
 * @returns {JSX.Element}
 * @constructor
 */
function GitHubRepositorySection({ git, tooltip, styling, handleTextUpdate, handleSectionCollapse }) {
  // Prop Validation
  GitHubRepositorySection.propTypes = {
    git: PropTypes.object.isRequired,
    tooltip: PropTypes.string,
    styling: PropTypes.object,
    handleTextUpdate: PropTypes.func.isRequired,
    handleSectionCollapse: PropTypes.func.isRequired,
  };

  // Constants
  const { primary } = useSelector((state) => state.styling);
  const { url = "", branch = "", open = "" } = git;
  const { headerTextColor = "text-secondary", collapseIconColor = primary, textFieldColor = "primary" } = styling || {};
  const header = "GitHub Repository";
  const body = (
    <div className='min-w-full p-4 pb-0'>
      <span className='flex justify-stretch min-w-full gap-2'>
        <FormTextField value={url} label={"URL"} tooltip={"URL of Base PP GitHub repository"} handleTextUpdate={handleTextUpdate} color={textFieldColor} />
        <FormTextField
          value={branch}
          label={"Branch"}
          tooltip={"GitHub branch of release version"}
          handleTextUpdate={handleTextUpdate}
          color={textFieldColor}
        />
      </span>
    </div>
  );

  // Return Method
  return getCardTemplate(header, body, tooltip, open, handleSectionCollapse, headerTextColor, collapseIconColor);
}

// Export GitHubRepositorySection.jsx
export default GitHubRepositorySection;
