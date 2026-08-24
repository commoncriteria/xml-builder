// Imports
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Chip, FormControl, InputLabel, ListSubheader, MenuItem, Select, Tooltip } from "@mui/material";

// Style
function getStyles(name, selections, theme) {
  return {
    fontWeight: typeof selections !== "string" && selections.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const getMenuStyle = (style) => {
  const selectedBackground = style === "primary" ? "#F8D8EF" : "#E0F2F1";
  const selectedHoverBackground = style === "primary" ? "#FCEFF9" : "#F1FAF9";

  return {
    "&.Mui-selected": {
      backgroundColor: selectedBackground,
      opacity: "0.9",
      "&:hover": { backgroundColor: selectedHoverBackground, opacity: "0.9" },
    },
    ...(style === "primary" && { "&:hover": { backgroundColor: "#FCEFF9", opacity: "0.9" } }),
    fontSize: "13px",
    fontWeight: 500,
  };
};

const isOptionSelected = (option, selections, isMultiple) => {
  if (isMultiple) {
    return Array.isArray(selections) && selections.includes(option);
  }

  return selections === option || (Array.isArray(selections) && selections[0] === option);
};

/**
 * The MultiSelectDropdown class that a generic multiselect dropdown
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function MultiSelectDropdown(props) {
  // Prop Validation
  MultiSelectDropdown.propTypes = {
    title: PropTypes.string.isRequired,
    selectId: PropTypes.string,
    selectionOptions: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.object.isRequired]),
    selections: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.string.isRequired]),
    handleSelections: PropTypes.func.isRequired,
    elementData: PropTypes.object,
    groupID: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    index: PropTypes.number,
    style: PropTypes.string,
    required: PropTypes.bool,
    tooltip: PropTypes.node,
    allowEmptySelection: PropTypes.bool,
    emptySelectionLabel: PropTypes.string,
    handleOpenModal: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  };

  // Constants
  const theme = useTheme();
  const headerStyle = { color: props.style === "primary" ? "#d926a9" : "#1FB2A6", fontSize: "13px", fontWeight: 600 };
  const [menuStyle, setMenuStyle] = useState(getMenuStyle(props.style));
  const isMultiple = props.multiple !== undefined ? props.multiple : true;
  const selectValue = isMultiple ? props.selections || [] : Array.isArray(props.selections) ? props.selections[0] || "" : props.selections || "";

  const msdId = useMemo(() => (props.id || props.selectId ? [props.selectId, props.id].filter((v) => v).join("_") : undefined), [props.selectId, props.id]);
  const msdLabelId = useMemo(() => (msdId ? `${msdId}_label` : undefined), [msdId]);

  // Use Effects
  useEffect(() => {
    setMenuStyle(getMenuStyle(props.style));
  }, [props.style]);

  // Methods
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    let newSelections = isMultiple ? (typeof value === "string" ? value.split(",") : value) : [value];

    if (props.elementData) {
      props.handleSelections({ selections: newSelections }, props.elementData.uuid, props.elementData.index, "update");
    } else {
      props.handleSelections(props.title, newSelections, props.index);
    }
  };
  const getSelectionMenu = () => {
    const handleMenuItemClick = (option) => {
      if (!isMultiple && props.allowEmptySelection && option === selectValue) {
        props.handleSelections(props.title, [], props.index);
      }
    };

    return Object.entries(props.selectionOptions).map(([key, value]) => {
      let title = key === "complexSelectables" || key === "ComplexSelectablesEA" ? "Complex Selectables" : key.charAt(0).toUpperCase() + key.slice(1);
      const includesDisabled = typeof value !== "string" && hasOwn(value, "disabled") && hasOwn(value, "label");
      const noMenuItems = (title === "Groups" && value.length === 1 && value[0] === props.groupID) || value.length === 0;

      if (noMenuItems) {
        return;
      } else if (typeof value !== "string" && !hasOwn(value, "disabled")) {
        return [
          <ListSubheader sx={headerStyle}>{title}</ListSubheader>,
          value?.map((option) => {
            if (
              (key !== "groups" || (key === "groups" && props.groupID !== option)) &&
              (key !== "complexSelectables" || (key === "complexSelectables" && props.groupID !== option))
            ) {
              return (
                <MenuItem
                  style={getStyles(option, props.selections, theme)}
                  sx={menuStyle}
                  key={option}
                  value={option}
                  onClick={() => handleMenuItemClick(option)}>
                  {option}
                </MenuItem>
              );
            }
          }),
        ];
      } else if (includesDisabled) {
        const { label, disabled } = value;

        return (
          <MenuItem
            style={getStyles(label, props.selections, theme)}
            sx={menuStyle}
            key={label}
            value={label}
            disabled={disabled}
            selected={isOptionSelected(label, selectValue, isMultiple)}>
            {label}
          </MenuItem>
        );
      } else if (typeof value === "string") {
        return (
          <MenuItem style={getStyles(value, props.selections, theme)} sx={menuStyle} key={value} value={value} onClick={() => handleMenuItemClick(value)}>
            {value}
          </MenuItem>
        );
      }
    });
  };

  const DropdownLabel = (
    <InputLabel id={msdLabelId} required={props.required !== undefined ? props.required : false} color={props.style === "primary" ? "secondary" : "primary"}>
      {props.title}
    </InputLabel>
  );

  const dropdownControl = (
    <FormControl fullWidth>
      {DropdownLabel}
      <Select
        defaultValue={props.defaultValue !== undefined ? props.defaultValue : null}
        color={props.style === "primary" ? "secondary" : "primary"}
        key={props.id}
        id={msdId}
        labelId={msdLabelId}
        MenuProps={msdId ? { "data-testid": `${msdId}_menu` } : undefined}
        label={props.title}
        multiple={isMultiple}
        disabled={props.disabled !== undefined ? props.disabled : false}
        value={selectValue}
        onChange={handleChange}
        autoWidth
        sx={{ textAlign: "left" }}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {typeof selected === "object"
              ? selected?.map((value) =>
                  !isMultiple ? (
                    value
                  ) : (
                    <Chip
                      sx={{
                        padding: theme.spacing(1),
                        height: "100%",
                        display: "flex",
                        flexDirection: "row",
                        "& .MuiChip-label": { overflowWrap: "break-word", whiteSpace: "normal", textOverflow: "clip", fontSize: "12px" },
                      }}
                      key={value}
                      label={value}
                    />
                  )
                )
              : selected}
          </Box>
        )}>
        {getSelectionMenu()}
      </Select>
    </FormControl>
  );

  // Return Method
  return (
    <div key={`${props.id}-multi-select-dropdown`} className='w-full'>
      {props.tooltip ? (
        <Tooltip title={props.tooltip} arrow>
          <div>{dropdownControl}</div>
        </Tooltip>
      ) : (
        dropdownControl
      )}
    </div>
  );
}

// Export MultiSelectDropdown.jsx
export default MultiSelectDropdown;
