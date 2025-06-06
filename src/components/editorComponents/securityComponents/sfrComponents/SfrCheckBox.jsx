// Imports
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Box, Checkbox, Tooltip, Typography } from "@mui/material";
import { updateComponentItems, updateManagementFunctionUI, updateSfrSectionElement } from "../../../../utils/securityComponents.jsx";

/**
 * The SfrCheckBox class that displays the checkbox component
 * @param title the title
 * @param isChecked the isChecked (boolean)
 * @param tooltipID the tooltip id
 * @param tooltip the tooltip
 * @param isDisabled the isDisabled (boolean)
 * @returns {JSX.Element} the sfr checkbox content
 * @constructor passes in props to the class
 */
function SfrCheckBox({ title, isChecked, tooltipID, tooltip, isDisabled }) {
  // Prop Validation
  SfrCheckBox.propTypes = {
    title: PropTypes.string.isRequired,
    isChecked: PropTypes.bool.isRequired,
    tooltipID: PropTypes.string.isRequired,
    tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    isDisabled: PropTypes.bool,
  };

  // Constants
  const { textFieldBorder, grayTitle, checkboxPrimaryNoPad, checkboxSecondaryNoPad } = useSelector((state) => state.styling);
  const typographyStyle = { fontSize: 13, paddingLeft: 0.5, paddingTop: 0.1 };
  const checkboxStyle = title === "Management Functions" ? checkboxSecondaryNoPad : checkboxPrimaryNoPad;

  // Use Effects
  useEffect(() => {
    if (isDisabled) {
      typographyStyle.color = textFieldBorder;
    }
  }, [isDisabled]);

  // Methods
  /**
   * Updates the checkbox by type
   * @param event the checked event
   * @param title the checkbox title
   *              Options: Optional, Objective, Invisible, Management Functions
   */
  const updateCheckboxByTitle = (event, title) => {
    const checked = event.target.checked;

    // Updates the Optional, Objective and Invisible checkboxes
    if (title !== "Management Functions") {
      const type = title.toLowerCase();
      let itemMap = {
        [type]: checked,
      };

      // Update itemMap values by type if the checkbox is checked
      if (checked) {
        switch (type) {
          case "optional":
          case "objective": {
            const reversedValue = type === "optional" ? "objective" : "optional";
            itemMap = {
              ...itemMap,
              [reversedValue]: false,
              invisible: false,
            };
            break;
          }
          case "invisible": {
            itemMap = {
              ...itemMap,
              optional: false,
              objective: false,
              selectionBased: false,
              selections: {},
              useCaseBased: false,
              useCases: [],
              implementationDependent: false,
              reasons: [],
            };
            break;
          }
        }
      }

      // Update the checkbox values
      updateComponentItems(itemMap);
    } else {
      // Updates the management function checkbox
      if (!checked) {
        updateManagementFunctionUI({
          openManagementFunctionModal: true,
        });
      } else {
        // Updates the management function checkbox values
        updateSfrSectionElement({
          isManagementFunction: checked,
          managementFunctions: {
            id: "fmt_smf",
            tableName: "Management Functions",
            statusMarkers: "",
            rows: [],
            columns: [],
          },
        });
      }
    }
  };

  // Return Method
  return (
    <div className='max-w-screen-sm md:max-w-screen-sm lg:max-w-screen-lg'>
      <div style={grayTitle}>
        <Box display='flex' alignItems={"center"}>
          <Tooltip id={tooltipID} title={tooltip} arrow>
            <Checkbox
              disabled={isDisabled ? true : false}
              onChange={(event) => {
                updateCheckboxByTitle(event, title);
              }}
              checked={isChecked}
              sx={checkboxStyle}
              size='small'
            />
          </Tooltip>
          <Typography sx={typographyStyle}>{title}</Typography>
        </Box>
      </div>
    </div>
  );
}

// Export Default SfrCheckBox.jsx
export default SfrCheckBox;
