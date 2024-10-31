// Imports
import { useTheme } from '@mui/material/styles';
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Box, Chip, FormControl, InputLabel, ListSubheader, MenuItem, Select} from "@mui/material";

// Style
function getStyles(name, selections, theme) {
    return {
        fontWeight:
            typeof selections !== "string" && selections.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

/**
 * The MultiSelectDropdown class that a generic multiselect dropdown
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function MultiSelectDropdown(props) {
    // Prop Validation
    MultiSelectDropdown.propTypes = {
        title: PropTypes.string.isRequired,
        selectionOptions: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.object.isRequired]),
        selections: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.string.isRequired]),
        handleSelections: PropTypes.func.isRequired,
        elementData: PropTypes.object,
        groupID: PropTypes.string,
        multiple: PropTypes.bool,
        index: PropTypes.number,
        style: PropTypes.string
    };

    // Constants
    const theme = useTheme();
    const headerStyle = {color: props.style === "primary" ? "#d926a9" : "#1FB2A6", fontSize: "13px", fontWeight: 600}
    const [menuStyle, setMenuStyle] = useState({fontSize: "13px", fontWeight: 500})

    // Use Effects
    useEffect(() => {
        if (props.style === "primary") {
            setMenuStyle({
                "&.Mui-selected": {backgroundColor: "#F8D8EF", opacity: "0.9", '&:hover': {backgroundColor:'#FCEFF9', opacity: "0.9"}},
                '&:hover':{backgroundColor:'#FCEFF9', opacity: "0.9"},
                fontSize: "13px",
                fontWeight: 500
            })
        }
    }, [props.style]);

    // Methods
    const handleChange = (event) => {
        const {target: { value }} = event;
        let newSelections = (typeof value === 'string' ? value.split(',') : value)
        if (props.elementData) {
            props.handleSelections({selections: newSelections}, props.elementData.uuid, props.elementData.index, "update")
        } else {
            props.handleSelections(props.title, newSelections, props.index)
        }
    };
    const getSelectionMenu = () => {
        if (props.title === "Selectables" || "Evaluation Activity"  || "Evaluation Activities" || "Dependencies") {
            return (
                Object.entries(props.selectionOptions).map(([key, value]) => {
                    let title = (key === "complexSelectables" || key === "ComplexSelectablesEA") ? "Complex Selectables" : key.charAt(0).toUpperCase() + key.slice(1)
                    if ((title === "Groups" && value.length === 1 && value[0] === props.groupID) || value.length === 0) {
                        return
                    } else if (typeof value !== "string") {
                        return (
                            [
                                <ListSubheader sx={headerStyle}>{title}</ListSubheader>,
                                value?.map((option) => {
                                    if ((key !== "groups" || (key === "groups" && props.groupID !== option)) &&
                                        (key !== "complexSelectables" || (key === "complexSelectables" && props.groupID !== option))) {
                                        return (
                                            <MenuItem style={getStyles(option, props.selections, theme)} sx={menuStyle}
                                                      key={option} value={option}>{option}
                                            </MenuItem>
                                        )
                                    }
                                })
                            ]
                        )
                    } else if (typeof value === "string") {
                        return (
                            <MenuItem style={getStyles(value, props.selections, theme)} sx={menuStyle}
                                      key={value} value={value}>{value}
                            </MenuItem>
                        )
                    } else {
                        return
                    }
                })
            )
        } else {
            return (
                props.selectionOptions.map((option) => {
                    return (
                        <MenuItem style={getStyles(option, props.selections, theme)}
                                  key={option} value={option}>{option}
                        </MenuItem>
                    )
                })
            )
        }
    }

    // Return Method
    return (
        <div key={`${props.id}-multi-select-dropdown`} className="w-full">
            <FormControl fullWidth>
                <InputLabel color={props.style === "primary" ? "secondary" : "primary"}>{props.title}</InputLabel>
                <Select
                    color={props.style === "primary" ? "secondary" : "primary"}
                    key={props.id}
                    label={props.title}
                    multiple={props.multiple !== undefined ? props.multiple : true}
                    value={props.selections}
                    onChange={handleChange}
                    autoWidth
                    sx={{textAlign: "left"}}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            { typeof selected === "object" ?
                                selected?.map((value) => (
                                    (props.multiple !== undefined && props.multiple === false) ? value :
                                        <Chip sx={{ padding: theme.spacing(1), height: '100%', display: 'flex', flexDirection: 'row',
                                            '& .MuiChip-label': { overflowWrap: 'break-word', whiteSpace: 'normal', textOverflow: 'clip', fontSize: '12px' }}}
                                              key={value} label={value}/>
                                ))
                                :
                                selected
                            }
                        </Box>
                    )}
                >
                    {getSelectionMenu()}
                </Select>
            </FormControl>
        </div>
    );
}

// Export MultiSelectDropdown.jsx
export default MultiSelectDropdown;