// Imports
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import ToggleSwitch from "../../../../ToggleSwitch.jsx";
import NoEaConfirmation from "../../../../modalComponents/NoEaConfirmation.jsx";

/**
 * The SfrIntroduction class that displays the no tests toggle logic
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrNoTestToggle(props) {
    // Prop Validation
    SfrNoTestToggle.propTypes = {
        isNoTest: PropTypes.bool.isRequired,
        handleNoTestToggle: PropTypes.func.isRequired,
        isManagementFunction: PropTypes.bool.isRequired,
        uuid: PropTypes.string,
    };

    // Constants
    const { handleSnackBarSuccess, noTestTooltip } = SecurityComponents
    const [open, setOpen] = useState(false);
    const { primaryToggleTypographyLarge, primaryToggleSwitch, secondaryToggleTypographyLarge, secondaryToggleSwitch } = useSelector((state) => state.styling);
    const toggleStyling = {
        largeToggleTypography: props.isManagementFunction ? primaryToggleTypographyLarge : secondaryToggleTypographyLarge,
        secondaryToggleSwitch: props.isManagementFunction ? primaryToggleSwitch : secondaryToggleSwitch,
    }

    // Methods
    const handleOpen = () => {
        setOpen(!open)
    }
    const handleNoTestToggle = () => {
        const isNoTest = !props.isNoTest;
        if (props.isManagementFunction) {
            props.handleNoTestToggle(isNoTest);
        } else {
            props.handleNoTestToggle(isNoTest, props.uuid)
        }

        // Update snackbar
        const message = isNoTest ? "Successfully Created No EAs" : "Successfully Removed No EAs";
        handleSnackBarSuccess(message)
    }

    // Return Method
    return (
        <div>
            <ToggleSwitch
                isToggled={props.isNoTest}
                isSfrWorksheetToggle={false}
                handleUpdateToggle={handleOpen}
                tooltip={noTestTooltip}
                tooltipID={"noTestToggle"}
                title={"No Ea's"}
                styling={toggleStyling}
                addBorder={props.isManagementFunction ? false : true}
            />
            <NoEaConfirmation
                toggleValue={props.isNoTest}
                open={open}
                handleOpen={handleOpen}
                handleSubmit={handleNoTestToggle}
            />
        </div>
    )
}

// Export SfrNoTestToggle.jsx
export default SfrNoTestToggle;