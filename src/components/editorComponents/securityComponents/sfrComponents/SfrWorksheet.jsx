// Imports
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getComponentXmlID,
  handleSnackBarSuccess,
  updateComponentItems,
  updateManagementFunctionUI,
  updateSfrSectionElement,
} from "../../../../utils/securityComponents.jsx";
import Modal from "../../../modalComponents/Modal.jsx";
import ResetDataConfirmation from "../../../modalComponents/ResetDataConfirmation.jsx";
import SfrComponent from "./sfrComponent/SfrComponent.jsx";
import SfrElement from "./sfrElement/SfrElement.jsx";
import SfrEvaluationActivity from "./aActivity/SfrEvaluationActivity.jsx";

/**
 * The SfrWorksheet class that displays the data for the sfr worksheet as a modal
 * @returns {JSX.Element} the sfr worksheet modal content
 * @constructor passes in props to the class
 */
function SfrWorksheet(props) {
  // Prop Validation
  SfrWorksheet.propTypes = {
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  const { sfrWorksheetUI } = useSelector((state) => state);
  const { isSfrWorksheetValid, openSfrWorksheet, component, managementFunctionUI } = sfrWorksheetUI;
  const { openManagementFunctionModal } = managementFunctionUI;

  // Use Effects
  useEffect(() => {
    const { cc_id, iteration_id, xml_id: xmlID } = component;

    // Update xml ID
    if (xmlID === "" && cc_id !== "" && iteration_id !== "") {
      let updatedXmlID = getComponentXmlID(cc_id, iteration_id, false, false);
      updateXmlID(updatedXmlID);
    }
  }, [props, sfrWorksheetUI, component]);

  // Methods
  /**
   * Handles the open management function confirmation menu
   */
  const handleOpenManagementFunctionConfirmationMenu = () => {
    // Update the management function ui
    updateManagementFunctionUI({
      openManagementFunctionModal: !openManagementFunctionModal,
    });
  };
  /**
   * Handles the submit management function confirmation menu
   */
  const handleSubmitManagementFunctionConfirmationMenu = () => {
    let itemMap = {
      isManagementFunction: false,
      managementFunctions: {},
    };

    // Set default management function values
    updateSfrSectionElement(itemMap);

    // Close the Modal
    handleOpenManagementFunctionConfirmationMenu();

    // Update snackbar
    handleSnackBarSuccess("Management Function Data Successfully Reset to Default Values");
  };

  // Helper Methods
  /**
   * Updates the xml id
   * @param xmlID the xml id
   */
  const updateXmlID = (xmlID) => {
    const itemMap = {
      xml_id: xmlID,
    };

    // Update xmlID
    updateComponentItems(itemMap);
  };

  // Return Method
  return (
    <div className='w-full'>
      <Modal
        title={"SFR Worksheet"}
        content={
          <div className='w-screen sm:max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
            <SfrComponent />
            <SfrElement />
            <SfrEvaluationActivity isManagementFunction={false} />
          </div>
        }
        open={openSfrWorksheet && isSfrWorksheetValid}
        handleOpen={props.handleOpen}
        hideSubmit={true}
        closeButtonId={"sfr-worksheet-close-button"}
      />
      <ResetDataConfirmation
        title={"Reset Management Functions Data Confirmation"}
        text={"Are you sure you want to reset all Management Functions data to its initial state?"}
        open={openManagementFunctionModal}
        handleOpen={handleOpenManagementFunctionConfirmationMenu}
        handleSubmit={handleSubmitManagementFunctionConfirmationMenu}
      />
    </div>
  );
}

// Export SfrWorksheet.jsx
export default SfrWorksheet;
