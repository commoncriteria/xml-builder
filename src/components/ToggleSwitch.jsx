// Imports
import React from "react";
import PropTypes from "prop-types";
import { useSelector} from "react-redux";
import { Box, Stack, Switch, Tooltip, Typography } from "@mui/material";

/**
 * The ToggleSwitch component that shows the toggle switch button and components
 * @returns {JSX.Element}
 * @constructor
 */
const ToggleSwitch = (props) => {
    // Prop Validation
    ToggleSwitch.propTypes = {
        isToggled: PropTypes.bool.isRequired,
        isSfrWorksheetToggle: PropTypes.bool.isRequired,
        handleUpdateToggle: PropTypes.func.isRequired,
        extendedComponentDefinition: PropTypes.object,
        tooltip: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node,
        ]),
        tooltipID: PropTypes.string,
        title: PropTypes.string,
        styling: PropTypes.object,
        addBorder: PropTypes.bool,
    }

    // Constants
    const { primary, primaryToggleSwitch } = useSelector((state) => state.styling);

    // Components
    const getSfrWorksheetComponentToggle = () => {
        const { isToggled, handleUpdateToggle, title, tooltip, tooltipID } = props
        const { titleStyle, toggleStyle } = getSfrWorksheetToggleStyle(props)

        // Get the sfr worksheet component toggle
        return (
            <div style={toggleStyle}>
                <Box display="flex" alignItems="center">
                    <Tooltip id={tooltipID} title={tooltip} arrow>
                        <Switch
                            onChange={
                                props.extendedComponentDefinition ?
                                (event) => (handleUpdateToggle(event, props.extendedComponentDefinition)) :
                                handleUpdateToggle
                            }
                            checked={isToggled}
                            sx={isToggled ? primaryToggleSwitch : {}}
                            size="small"
                        />
                    </Tooltip>
                    <Typography sx={titleStyle}>{title}</Typography>
                </Box>
            </div>
        )
    }

    const getToggleSwitch = () => {
        const { isToggled, title, tooltip, tooltipID, styling, handleUpdateToggle } = props
        const { largeToggleTypography, secondaryToggleSwitch } = styling
        const toggleStyle = props.addBorder ?
            "ml-4 pl-4 pr-1 pt-2 pb-1 border-[1px] border-[#bdbdbd] rounded-[4px]" :
            "flex w-[0px] justify-end pr-1"

        return (
            <div className={toggleStyle}>
                <Stack
                    direction="row"
                    component="label"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography
                        noWrap
                        style={largeToggleTypography}
                    >
                        {title}
                    </Typography>
                    <Tooltip
                        arrow placement={"top"}
                        id={tooltipID}
                        title={tooltip}
                    >
                        <Switch
                            sx={secondaryToggleSwitch}
                            checked={isToggled}
                            onChange={handleUpdateToggle}
                        />
                    </Tooltip>
                </Stack>
            </div>
        )
    }

    // Helper Methods
    const getSfrWorksheetToggleStyle = (props) => {
        const { isToggled, title } = props
        let titleStyle = {}
        let toggleStyle = {}

        // Get the title style
        if (title) {
            if (!isToggled) {
                titleStyle = {
                    fontSize: 13,
                    fontWeight: "medium",
                    paddingLeft: 0.5,
                }
            } else {
                titleStyle = {
                    fontSize: 13,
                    fontWeight: "bold",
                    color: primary,
                    paddingLeft: 0.5
                }
            }
        }

        // Get the toggle style
        toggleStyle = {
            paddingX: 1,
            paddingBottom: "12px",
            paddingTop: "2px",
            display: "flex",
            justifyContent: !isToggled ? "left" : "center",
        }

        if (isToggled) {
            toggleStyle.marginBottom = "-16px"
        }

        return {titleStyle, toggleStyle}
    }

    // Return Method
    return (
        props.isSfrWorksheetToggle ?
            getSfrWorksheetComponentToggle()
            :
            getToggleSwitch()
    )
}

// Export ToggleSwitch.jsx
export default ToggleSwitch;