// Imports
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {IconButton, Stack, Tooltip, Typography} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SfrCard from "./SfrCard.jsx";
import {UPDATE_SFR_SECTION_ELEMENT} from "../../../../reducers/SFRs/sfrSectionSlice.js";
import {useDispatch} from "react-redux";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import Checkbox from "@mui/material/Checkbox";

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
        id: PropTypes.string.isRequired,
    };

    // Constants
    const style = {
        secondary: "#1FB2A6",
        checkbox: {color: "#9E9E9E", paddingLeft: "4px", '&.Mui-checked': {color: "#1FB2A6"}, "&:hover": {backgroundColor: "transparent"}}
    }
    const dispatch = useDispatch();
    const [selectableOptions, setSelectableOptions] = useState({})
    const [selected, setSelected] = useState([])

    // Use Effects
    useEffect(() => {
        let newOptions = JSON.parse(JSON.stringify(props.getSelectablesMaps().dropdownOptions))
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
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
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
        let selectables = JSON.parse(JSON.stringify(props.element.selectables))
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
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
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
        let title = JSON.parse(JSON.stringify(props.element.title))
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

        // Update selectable groups and title
        let itemMap = { selectableGroups: selectableGroups, title: title }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: props.componentUUID,
            elementUUID: props.elementUUID,
            itemMap: itemMap
        }))
    }

    // Helper Methods
    const getSFRSelectables = () => {
        let selectables = []
        let selected = JSON.parse(JSON.stringify(props.element.selectableGroups[props.id].groups))
        let selectableOptions = JSON.parse(JSON.stringify(props.element.selectables))
        let selectableGroupOptions = Object.keys(JSON.parse(JSON.stringify(props.element.selectableGroups)))
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
            <SfrCard type={"section"}
                     header={
                         <div className="w-full p-0 m-0 my-[-6px]">
                             <span className="flex justify-stretch min-w-full">
                                 <div className="flex justify-center w-full pl-4">
                                     <Tooltip
                                         title={"This section allows a user to group selectables and assignments that have " +
                                                "been constructed above. Groups can be nested by selecting a inserting a " +
                                                "previously defined group ID within a newly created group."} arrow>
                                         <label className="resize-none font-bold text-[16px] p-0 m-0 text-accent pr-1 mt-[8px]">{props.id}</label>
                                     </Tooltip>
                                     <IconButton sx={{marginTop: "-8px", margin: 0, padding: 0}} onClick={handleDeleteSelectableGroup}>
                                         <Tooltip title={"Delete Selectables Group"}>
                                             <DeleteForeverRoundedIcon htmlColor={style.secondary} sx={{ width: 26, height: 26 }}/>
                                         </Tooltip>
                                     </IconButton>
                                 </div>
                                 <div className="flex justify-end w-[0px] pr-1">
                                    <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                                        <Typography noWrap style={{color: style.secondary, fontSize: "14px", fontWeight: 600}}>Only One</Typography>
                                        <Checkbox sx={style.checkbox} size={"small"} onChange={handleOnlyOneCheckbox}
                                                  checked={props.element.selectableGroups[props.id].onlyOne} />
                                    </Stack>
                                 </div>
                             </span>
                         </div>
                     }
                     body={
                         <div key={`${props.id}-multi-select-dropdown`} className="pb-2">
                             <MultiSelectDropdown selectionOptions={selectableOptions}
                                                  selections={selected}
                                                  title={"Selectables"}
                                                  groupID={props.id}
                                                  handleSelections={handleMultiselect}
                             />
                         </div>
                    }
            />
        </div>
   );
}

// Export SfrSelectionGroupCard.jsx
export default SfrSelectionGroupCard;