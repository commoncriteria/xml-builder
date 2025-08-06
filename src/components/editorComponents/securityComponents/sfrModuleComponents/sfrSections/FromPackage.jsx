// Imports
import { useState } from "react";
import { useSelector } from "react-redux";
import { Card } from "@material-tailwind/react";
import { deepCopy } from "../../../../../utils/deepCopy.js";
import { defaultModifiedSfrComponent } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import { handleSnackBarError, handleSnackBarSuccess, updateComponentItems } from "../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import FormTextField from "../FormTextField.jsx";
import GitHubRepositorySection from "../../../GitHubRepositorySection.jsx";
import ResetDataConfirmation from "../../../../modalComponents/ResetDataConfirmation.jsx";
import ToggleSwitch from "../../../../ToggleSwitch.jsx";

/**
 * The FromPackage class for the modified sfr component
 * @constructor
 */
function FromPackage() {
  // Constants
  const modifiedSfrComponent = deepCopy(defaultModifiedSfrComponent);
  const { primary, secondary, primaryToggleTypographyLarge, primaryToggleSwitch } = useSelector((state) => state.styling);
  const toggleStyling = {
    largeToggleTypography: {
      ...primaryToggleTypographyLarge,
      fontSize: "14px",
    },
    secondaryToggleSwitch: primaryToggleSwitch,
  };
  const { sfrWorksheetUI } = useSelector((state) => state);
  const { component } = sfrWorksheetUI;
  const { fromPkgData } = component || modifiedSfrComponent;
  const {
    name = "",
    short = "",
    version = "",
    git = {
      url: "",
      branch: "",
      open: true,
    },
    toggle = false,
    open = false,
  } = fromPkgData || {};
  const [openResetData, setOpenResetData] = useState(false);

  // Methods
  /**
   * Handles the text update
   * @param event the event as a dom handler
   * @param key the key of the object that needs to be updated
   */
  const handleTextUpdate = (event, key) => {
    try {
      const text = event.target.value;

      // Update the component
      if (key) {
        const isGit = key === "url" || key === "branch";

        // Update from package
        updatePackageValues(key, text, isGit);

        // Update snackbar success message
        handleSnackBarSuccess("Text Successfully Updated");
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the section collapse value for the git section
   */
  const handleGitSectionCollapse = () => {
    updatePackageValues("open", !git.open, true);
  };
  /**
   * Handles the from package toggle
   * @param toggle the toggle
   */
  const handleFromPackageToggle = (toggle) => {
    try {
      const updatedFromPkgData = toggle ? deepCopy(fromPkgData) : deepCopy(modifiedSfrComponent.fromPkgData);
      updatedFromPkgData.toggle = toggle;

      // Update toggle
      if (toggle) {
        updatedFromPkgData.open = true;
      }

      // Update the component
      updateFromPackage(updatedFromPkgData);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles the section collapse
   */
  const handleSectionCollapse = () => {
    // Update the collapse value
    updatePackageValues("open", !open);
  };
  /**
   * Handles opening the reset data confirmation
   */
  const handleOpenResetDataConfirmation = (event) => {
    try {
      const toggle = event.target.checked;

      // Set a confirmation if turning the toggle off otherwise turn the toggle on
      if (toggle) {
        handleFromPackageToggle(toggle);
      } else {
        setOpenResetData(true);
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Handles submitting the reset data confirmation
   */
  const handleSubmitResetDataConfirmation = () => {
    // Set the toggle
    handleFromPackageToggle(false);

    // Close the reset data confirmation dialog
    setOpenResetData(false);
  };

  // Helper Methods
  /**
   * Updates the package values
   * @param key the key of the object
   * @param value the value associated with the key that needs to be updated
   * @param isGit (optional) if the value is a git value that needs to be updated
   */
  const updatePackageValues = (key, value, isGit = false) => {
    try {
      let updatedFromPkgData = deepCopy(fromPkgData);

      // Update the key value pairs
      if (isGit) {
        updatedFromPkgData.git[key] = value;
      } else {
        updatedFromPkgData[key] = value;
      }

      // Update from package
      updateFromPackage(updatedFromPkgData);
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };
  /**
   * Updates from package for the modified sfr component
   * @param fromPkgData the updated from package data value
   */
  const updateFromPackage = (fromPkgData) => {
    // Update the component
    updateComponentItems({
      fromPkgData,
    });
  };

  // Components
  /**
   * Gets the from package toggle section
   * @returns {JSX.Element}
   */
  const getFromPackageToggle = () => {
    const title = "From Package";

    return (
      <ToggleSwitch title={title} isToggled={toggle} isSfrWorksheetToggle={true} handleUpdateToggle={handleOpenResetDataConfirmation} styling={toggleStyling} />
    );
  };

  // Return Method
  return (
    <div>
      {!toggle ? (
        <Card className='mb-4 pb-[-8px]'>
          <div className='w-full border-2 border-gray-200 rounded-md p-2 pb-[6px] m-0'>
            <div className={"mt-[6px]"}>{getFromPackageToggle()}</div>
          </div>
        </Card>
      ) : (
        <CardTemplate
          type={"parent"}
          header={<div className='w-full flex justify-center text-center p-0 m-0 my-[-3px] ml-[-8px]'>{getFromPackageToggle()}</div>}
          body={
            <div className='min-w-full'>
              <span className='flex justify-stretch min-w-full p-4 pb-4 gap-2'>
                <FormTextField label={"Name"} value={name} handleTextUpdate={handleTextUpdate} color={"primary"} />
                <FormTextField label={"Short"} value={short} handleTextUpdate={handleTextUpdate} color={"primary"} />
                <FormTextField label={"Version"} value={version} handleTextUpdate={handleTextUpdate} color={"primary"} />
              </span>
              <div className='min-w-full m-0 p-0 px-4 mb-[-2px]'>
                <GitHubRepositorySection
                  git={git}
                  tooltip={`refers to the github repo for the Package. Modifications to SFRs in Packages that are not in NIAP github cannot be automated.`}
                  styling={{ headerTextColor: "text-accent", collapseIconColor: secondary, textFieldColor: "secondary" }}
                  handleTextUpdate={handleTextUpdate}
                  handleSectionCollapse={handleGitSectionCollapse}
                />
              </div>
            </div>
          }
          collapse={open}
          collapseHandler={handleSectionCollapse}
          tooltip={"The package specification allows the PP Module to modify Functional Packages that are used by the base PP."}
          collapseIconColor={primary}
          borderColor={"border-gray-200"}
        />
      )}
      <ResetDataConfirmation
        title={"Reset From Package"}
        text={"Are you sure you want to reset all From Package data to its initial state?"}
        open={openResetData}
        handleOpen={() => setOpenResetData(false)}
        handleSubmit={handleSubmitResetDataConfirmation}
      />
    </div>
  );
}

// Export FromPackage.jsx
export default FromPackage;
