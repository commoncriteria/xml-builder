// Imports
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_DECLARATION_AND_REFERENCE } from "../../../../reducers/SFRs/sfrBasePPsSlice.js";
import { deepCopy } from "../../../../utils/deepCopy.js";
import { getCardTemplate, handleSnackBarError, handleSnackbarTextUpdates } from "../../../../utils/securityComponents.jsx";
import TipTapEditor from "../../TipTapEditor.jsx";
import FormTextField from "./FormTextField.jsx";

/**
 * The DeclarationAndReference component
 * @param uuid the base pp uuid
 * @constructor
 */
function DeclarationAndReference({ uuid }) {
  // Prop Validation
  DeclarationAndReference.propTypes = {
    uuid: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const sfrBasePPs = useSelector((state) => state.sfrBasePPs);
  let declarationAndRef = sfrBasePPs[uuid]?.declarationAndRef || {};
  const {
    id = "",
    short = "",
    product = "",
    version = "",
    url = "",
    git = {
      url: "",
      branch: "",
      open: true,
    },
    secFuncReqDir = {
      text: "",
      open: true,
    },
  } = declarationAndRef;
  const { primary } = useSelector((state) => state.styling);
  const headerTextColor = "text-secondary";
  const collapseIconColor = primary;

  // Methods
  /**
   * Handles the section collapse
   * @param open the open value
   * @param header the header
   */
  const handleSectionCollapse = (open, header) => {
    if (header === "GitHub Repository") {
      // Update git
      updateGit("open", !open);
    } else if (header === "Security Functional Requirements Direction") {
      // Update security functional requirements direction
      updateSecFuncReqDir("open", !open);
    }
  };
  /**
   * Handle text update
   * @param event the event
   * @param title the title
   */
  const handleTextUpdate = (event, title) => {
    try {
      // Update text by title
      if (title === "Security Functional Requirements Direction") {
        updateSecFuncReqDir("text", event);
      } else {
        const text = event.target.value;

        if (title === "url" || title === "branch") {
          if (JSON.stringify(git[title]) !== JSON.stringify(text)) {
            handleSnackbarTextUpdates(updateGit, title, text);
          }
        } else {
          const key = title === "url of base pp" ? "url" : title;

          if (JSON.stringify(declarationAndRef[key]) !== JSON.stringify(text)) {
            handleSnackbarTextUpdates(updateDeclarationAndReference, key, text);
          }
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Helper Methods
  /**
   * Updates the values for git
   * @param key the key
   * @param value the value
   */
  const updateGit = (key, value) => {
    let update = deepCopy(git);
    update[key] = value;

    // Update declaration and reference
    updateDeclarationAndReference("git", update);
  };
  /**
   * Updates the values for the security function requirements direction
   * @param key the key
   * @param value the value
   */
  const updateSecFuncReqDir = (key, value) => {
    let update = deepCopy(secFuncReqDir);
    update[key] = value;

    // Update declaration and reference
    updateDeclarationAndReference("secFuncReqDir", update);
  };
  /**
   * Updates the declaration and reference section
   * @param key key
   * @param value value
   */
  const updateDeclarationAndReference = (key, value) => {
    dispatch(
      UPDATE_DECLARATION_AND_REFERENCE({
        uuid,
        key,
        value,
      })
    );
  };

  // Components
  /**
   * The GitHubRepositorySection
   * @constructor
   */
  function GitHubRepositorySection() {
    const { url, branch, open: collapse } = git;
    const header = "GitHub Repository";
    const body = (
      <div className='min-w-full p-4 pb-0'>
        <span className='flex justify-stretch min-w-full gap-2'>
          <FormTextField value={url} label={"URL"} tooltip={"URL of Base PP GitHub repository"} handleTextUpdate={handleTextUpdate} />
          <FormTextField value={branch} label={"Branch"} tooltip={"GitHub branch of release version"} handleTextUpdate={handleTextUpdate} />
        </span>
      </div>
    );
    const tooltip = `Reference to GitHub repo of Base PP. If there is none, then this is omitted.`;

    // Get card template
    return getCardTemplate(header, body, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor);
  }

  // Use Memos
  /**
   * The SecurityFunctionRequirementsDirectionSection
   * @constructor
   */
  const SecurityFunctionRequirementsDirectionSection = useMemo(() => {
    const { text, open: collapse } = secFuncReqDir;
    const header = "Security Functional Requirements Direction";
    const body = (
      <div className='min-w-full p-4 pb-0 mb-[-8px]'>
        <TipTapEditor title={header} text={text} contentType={"term"} handleTextUpdate={handleTextUpdate} />
      </div>
    );
    const tooltip = 'The contents of the <sec-func-req-dir> tag appears under the "Direction" heading for the Base PP.';

    // Get card template
    return getCardTemplate(header, body, tooltip, collapse, handleSectionCollapse, headerTextColor, collapseIconColor);
  }, []);

  // Return Method
  return (
    <div className='min-w-full'>
      <span className='flex justify-stretch min-w-full pb-4 gap-2'>
        <FormTextField value={id} label={"ID"} tooltip={"Unique ID within this document"} handleTextUpdate={handleTextUpdate} />
        <FormTextField value={short} label={"Short"} tooltip={"Short name of Base PP"} handleTextUpdate={handleTextUpdate} />
        <FormTextField value={product} label={"Product"} tooltip={"Base PP Product"} handleTextUpdate={handleTextUpdate} />
        <FormTextField value={version} label={"Version"} tooltip={"Base PP Version"} handleTextUpdate={handleTextUpdate} />
      </span>
      <span className='flex justify-stretch min-w-full pb-4 gap-2'>
        <FormTextField
          value={url}
          label={"URL of Base PP"}
          tooltip={"URL of Base PP on the NIAP website"}
          handleTextUpdate={handleTextUpdate}
        />
      </span>
      {GitHubRepositorySection()}
      {SecurityFunctionRequirementsDirectionSection}
    </div>
  );
}

// Export DeclarationAndReference.jsx
export default DeclarationAndReference;
