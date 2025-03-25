// Imports
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { UPDATE_SFR_SECTION_ELEMENT } from "../../../../../reducers/SFRs/sfrSectionSlice.js";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import MultiSelectDropdown from "../../MultiSelectDropdown.jsx";
import CardTemplate from "../../CardTemplate.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";

/**
 * The SfrSelectionGroupCard class that displays the selection group card for teh sfr selection group
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrSelectionGroupCard(props) {
    // Prop Validation
    SfrSelectionGroupCard.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        elementUUID: PropTypes.string.isRequired,
        element: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        styling: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
    };

    // Constants
    const { handleSnackBarSuccess } = SecurityComponents
    const { icons } = useSelector((state) => state.styling);
    const dispatch = useDispatch();
    const [selectableOptions, setSelectableOptions] = useState({})
    const [selected, setSelected] = useState([])
    const { styling } = props

    // Use Effects
    useEffect(() => {
        let newOptions = deepCopy(props.getSelectablesMaps().dropdownOptions)
        if (JSON.stringify(newOptions) !== JSON.stringify(selectableOptions)) {
            setSelectableOptions(newOptions)
        }
        let newSelectables = getSFRSelectables()
        if (JSON.stringify(newSelectables) !== JSON.stringify(selected)) {
            setSelected(newSelectables)
        }
    }, [props])

    // Methods
    const handleOnlyOneCheckbox = (event) => {
        let selectableGroups = deepCopy(props.element.selectableGroups)
        selectableGroups[props.id].onlyOne = event.target.checked
        let itemMap = { selectableGroups: selectableGroups }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: props.componentUUID,
            elementUUID: props.elementUUID,
            itemMap: itemMap
        }))
    }
    const handleMultiselect = (title, selections) => {
        let newSelections = []
        let selectables = deepCopy(props.element.selectables)
        let selectableGroups = deepCopy(props.element.selectableGroups)
        Object.entries(selectables).map(([key, value]) => {
            let name = value.id ? (`${value.description} (${value.id})`) : value.description
            selections?.map((selection, index) => {
                if (name === selection && selection && (typeof selection === "string") && !newSelections.includes(key)) {
                    newSelections[index] = key
                } else if (selectableGroups.hasOwnProperty(selection)) {
                    newSelections[index] = selection
                }
            })
        })

        // Update selectable group
        selectableGroups[props.id].groups = newSelections
        let itemMap = { selectableGroups: selectableGroups }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: props.componentUUID,
            elementUUID: props.elementUUID,
            itemMap: itemMap
        }))
    }
    const handleDeleteSelectableGroup = () => {
        let selectableGroups = deepCopy(props.element.selectableGroups)
        let title = deepCopy(props.element.title)
        delete selectableGroups[props.id]
        Object.values(selectableGroups).map((group) => {
            let groups = group.groups
            if (groups && groups.length > 0 && groups.includes(props.id)) {
                let index = groups.findIndex((value) => props.id === value)
                if (index !== -1) {
                    groups.splice(index, 1)
                }
            }
        })

        // Delete title selections sections that contain the selection uuid key
        title.map((section, index) => {
            if (section.hasOwnProperty("selections") && section.selections === props.id) {
                title.splice(index, 1)
            }
        })
        let itemMap = {
            selectableGroups: selectableGroups,
            title: title
        }

        // Delete management function sections that contain the selection uuid key
        if (props.element.hasOwnProperty("isManagementFunction") && props.element.isManagementFunction
            && props.element.hasOwnProperty("managementFunctions") && props.element.managementFunctions.hasOwnProperty("rows")) {
            let managementFunctions = props.element.managementFunctions
            managementFunctions.rows.map((row) => {
                let { textArray } = row
                textArray.map((section, index) => {
                    if (section.hasOwnProperty("selections") && section.selections === props.id) {
                        textArray.splice(index, 1)
                    }
                })
            })
            itemMap.managementFunctions = managementFunctions
        }

        // Update selectable groups and title
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: props.componentUUID,
            elementUUID: props.elementUUID,
            itemMap: itemMap
        }))

        // Update snackbar
        handleSnackBarSuccess("Selectable Group Successfully Removed")
    }

    // Helper Methods
    const getSFRSelectables = () => {
        let selectables = []
        let selected = deepCopy(props.element.selectableGroups[props.id].groups)
        let selectableOptions = deepCopy(props.element.selectables)
        let selectableGroupOptions = Object.keys(deepCopy(props.element.selectableGroups))
        selected?.map((value, index) => {
            if (selectableOptions.hasOwnProperty(value) && value !== undefined) {
                let selection = selectableOptions[value]
                let name = selection.id ? (`${selection.description} (${selection.id})`) : selection.description
                if (!selectables.includes(name)) {
                    selectables[index] = name
                }
            } else if (selectableGroupOptions.includes(value) && value !== undefined) {
                if (!selectables.includes(value)) {
                    selectables[index] = value
                }
            }
        })
        return selectables
    }

    // Return Method
    return (
        <div key={`${props.id}-group-card`}>
            <CardTemplate type={"section"}
                     header={
                         <div className="w-full p-0 m-0 my-[-6px]">
                             <span className="flex justify-stretch min-w-full">
                                 <div className="flex justify-center w-full pl-4">
                                     <Tooltip
                                         id={props.id + "groupDescriptionTooltip"}
                                         title={"This section allows a user to group selectables and assignments that have " +
                                                "been constructed above. Groups can be nested by selecting a inserting a " +
                                                "previously defined group ID within a newly created group."} arrow>
                                         <label
                                             style={{color: styling.primaryColor}}
                                             className="resize-none font-bold text-[13px] p-0 m-0 pr-1 mt-[10px]">
                                             {props.id}
                                         </label>
                                     </Tooltip>
                                     <IconButton
                                         sx={{marginTop: "-16px", margin: 0, padding: 0}}
                                         onClick={handleDeleteSelectableGroup}
                                         variant="contained"
                                     >
                                         <Tooltip
                                             title={"Delete Selectables Group"}
                                             id={"deleteSelectablesGroupTooltip" + props.id}
                                         >
                                             <DeleteForeverRoundedIcon htmlColor={ styling.primaryColor } sx={ icons.small }/>
                                         </Tooltip>
                                     </IconButton>
                                 </div>
                                 <div className="flex justify-end w-[0px] pr-1">
                                    <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                                        <Typography
                                            noWrap
                                            style={styling.primaryToggleTypography}
                                        >
                                            Only One
                                        </Typography>
                                        <Checkbox
                                            sx={styling.primaryCheckboxNoPad}
                                            size={"small"}
                                            onChange={handleOnlyOneCheckbox}
                                            checked={props.element.selectableGroups[props.id].onlyOne} />
                                    </Stack>
                                 </div>
                             </span>
                         </div>
                     }
                     body={
                         <div key={`${props.id}-multi-select-dropdown`} className="pb-2">
                             <MultiSelectDropdown
                                 selectionOptions={selectableOptions}
                                 selections={selected}
                                 title={"Selectables"}
                                 groupID={props.id}
                                 handleSelections={handleMultiselect}
                                 style={styling.secondaryTextField}
                             />
                         </div>
                    }
            />
        </div>
   );
}

// Export SfrSelectionGroupCard.jsx
export default SfrSelectionGroupCard;