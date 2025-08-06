// Imports
import PropTypes from "prop-types";
import { FormControl, TextField, Tooltip } from "@mui/material";

/**
 * The FormTextField component
 * @param value the value
 * @param label the label
 * @param tag the tag
 * @param tooltip the tooltip
 * @param handleTextUpdate the handle text update function
 * @param color the color of the text field (secondary by default)
 * @returns {JSX.Element}
 * @constructor
 */
export default function FormTextField({ value = "", label = "", tag = "", tooltip = "", handleTextUpdate, color }) {
  // Prop Validation
  FormTextField.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    tag: PropTypes.string,
    tooltip: PropTypes.string,
    handleTextUpdate: PropTypes.func.isRequired,
    color: PropTypes.string,
  };

  // Constants
  const title = label.toLowerCase();

  // Return Method
  return (
    <FormControl fullWidth>
      <Tooltip arrow title={tooltip}>
        <TextField color={color || "secondary"} key={value} label={label} defaultValue={value} onBlur={(event) => handleTextUpdate(event, title, tag)} />
      </Tooltip>
    </FormControl>
  );
}
