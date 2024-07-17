// Imports
import {useState} from "react";
import PropTypes from "prop-types";
import {Card, CardBody} from "@material-tailwind/react";
import {FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import SfrCard from "./SfrCard.jsx";
import { v4 as uuidv4 } from 'uuid';
import {UPDATE_SFR_SECTION_ELEMENT} from "../../../../reducers/SFRs/sfrSectionSlice.js";
import {useDispatch} from "react-redux";
import SfrSelectionGroupCard from "./SfrSelectionGroupCard.jsx";
import Checkbox from "@mui/material/Checkbox";
import SfrComplexSelectableCard from "./SfrComplexSelectableCard.jsx";
import { escapedTagsRegex } from "../../../../utils/fileParser.js"


/**
 * The SfrSelectionGroups class that displays the selection groups per f-element
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrSelectionGroups(props) {
    // Prop Validation
    SfrSelectionGroups.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        elementUUID: PropTypes.string.isRequired,
        element: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired
    };

    // Constants
    const dispatch = useDispatch();
    const style = {
        primary: "#d926a9",
        secondary: "#1FB2A6",
        checkbox: {color: "#9E9E9E", '&.Mui-checked': {color: "#d926a9"}, "&:hover": {backgroundColor: "transparent"}},
        menu: {
            "&.Mui-selected": {backgroundColor: "#F8D8EF", opacity: "0.9", '&:hover':{backgroundColor:'#FCEFF9', opacity: "0.9"}},
            '&:hover':{backgroundColor:'#FCEFF9', opacity: "0.9"}
        }
    }
    const [collapse, setCollapse] = useState(false)
    const [selectableType, setSelectableType] = useState("Selectable")
    const [selectableID, setSelectableID] = useState("")
    const [assignmentDescription, setAssignmentDescription] = useState("")
    const [selectableDescription, setSelectableDescription] = useState("")
    const [selectableDisabled, setSelectableDisabled] = useState(true)
    const [selectableGroupType, setSelectableGroupType] = useState("Selectable Group")
    const [selectableGroupID, setSelectableGroupID] = useState("")
    const [complexSelectableID, setComplexSelectableID] = useState("")
    const [selectableGroupDisabled, setSelectableGroupDisabled] = useState(true)

    // Methods
    const handleSelectableID = (event) => {
        let trimmed = event.target.value.trim()
        setSelectableID(trimmed)
    }
    const handleAssignmentDescription = (event) => {
        let description = event.target.value
        setAssignmentDescription(description)
        setSelectableDisabled(description !== "" ? false : true)
    }
    const handleSelectableDescription = (event) => {
        let description = event.target.value
        setSelectableDescription(description)
        setSelectableDisabled(description !== "" ? false : true)
    }
    const handleDeleteSelectable = (uuid) => {
        // Delete selectable from selectables that contain the uuid key
        let selectables = JSON.parse(JSON.stringify(props.element.selectables))
        delete selectables[uuid]

        // Delete selection groups index that contain the selection uuid key
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
        Object.values(selectableGroups).map((group) => {
            let groups = group.groups
            if (groups && groups.includes(uuid)) {
                let index = groups.findIndex((value) => uuid === value)
                if (index !== -1) {
                    groups.splice(index, 1)
                }
            }
        })

        // Delete title assignment sections that contain the selection uuid key
        let title = JSON.parse(JSON.stringify(props.element.title))
        title.map((section, index) => {
            if (section.hasOwnProperty("assignment") && section.assignment === uuid) {
                title.splice(index, 1)
            }
        })

        // Update the objects
        let itemMap = { selectables: selectables, selectableGroups: selectableGroups, title: title }
        dispatch(UPDATE_SFR_SECTION_ELEMENT({
            sfrUUID: props.sfrUUID,
            sectionUUID: props.componentUUID,
            elementUUID: props.elementUUID,
            itemMap: itemMap
        }))
    }
    const handleSelectableCheckboxSelection = (event, type, key) => {
        let selectables = JSON.parse(JSON.stringify(props.element.selectables))
        if (selectables[key] && (type === "exclusive" || type === "notSelectable")) {
            selectables[key][type] = event.target.checked
            // Update the objects
            let itemMap = { selectables: selectables }
            dispatch(UPDATE_SFR_SECTION_ELEMENT({
                sfrUUID: props.sfrUUID,
                sectionUUID: props.componentUUID,
                elementUUID: props.elementUUID,
                itemMap: itemMap
            }))
        }
    }
    const handleNewSelectableSubmit = async () => {
        if (selectableType === "Assignment" || selectableType === "Selectable") {
            let selectables = JSON.parse(JSON.stringify(props.element.selectables))
            let idExists = false
            let descriptionExists = false
            Object.values(selectables).map((value) => {
                let id = value.id
                let description = value.description
                if (selectableID !== "" && selectableID === id) {
                    idExists = true
                }
                if (selectableType === "Selectable" && selectableDescription !== "" && selectableDescription === description) {
                    descriptionExists = true
                }
                if (selectableType === "Assignment" && assignmentDescription !== "" && assignmentDescription === description) {
                    descriptionExists = true
                }
            })
            if (!idExists && !descriptionExists) {
                let uuid = uuidv4()
                if (selectableType === "Selectable") {
                    selectables[uuid] = { id: selectableID, description: selectableDescription, assignment: false }
                } else if (selectableType === "Assignment") {
                    selectables[uuid] = { id: selectableID, description: assignmentDescription, assignment: true }
                }

                // Set Item Map
                let itemMap = { selectables: selectables }
                await dispatch(UPDATE_SFR_SECTION_ELEMENT({
                    sfrUUID: props.sfrUUID,
                    sectionUUID: props.componentUUID,
                    elementUUID: props.elementUUID,
                    itemMap: itemMap
                }))

                // Reset Item Values
                setSelectableID("")
                setAssignmentDescription("")
                setSelectableDescription("")
                setSelectableType("Selectable")
                setSelectableDisabled(true)
            } else {
                if (idExists) {
                    setSelectableID("")
                }
                if (descriptionExists) {
                    setSelectableDescription("")
                    setAssignmentDescription("")
                }
            }
        }
    }
    const handleSetSelectableGroupType = (event) => {
        setSelectableGroupType(event.target.value)
    }
    const handleComplexSelectableID = (event) => {
        let trimmed = event.target.value.trim()
        setComplexSelectableID(trimmed)
        setSelectableGroupDisabled((selectableGroupType === "Complex Selectable" && trimmed !== "") ? false : true)
    }
    const handleSelectableGroupID = (event) => {
        let trimmed = event.target.value.trim()
        setSelectableGroupID(trimmed)
        setSelectableGroupDisabled((selectableGroupType === "Selectable Group" && trimmed !== "") ? false : true)
    }
    const handleNewSelectableGroupSubmit = () => {
        let selectableGroups = JSON.parse(JSON.stringify(props.element.selectableGroups))
        let idExists = false
        if (selectableGroupType && selectableGroupType === "Selectable Group") {
            if (selectableGroups.hasOwnProperty(selectableGroupID)) {
                idExists = true
            }
            if (!idExists) {
                selectableGroups[selectableGroupID] = {
                    onlyOne: false,
                    groups: []
                }
                let itemMap = { selectableGroups: selectableGroups }
                dispatch(UPDATE_SFR_SECTION_ELEMENT({
                    sfrUUID: props.sfrUUID,
                    sectionUUID: props.componentUUID,
                    elementUUID: props.elementUUID,
                    itemMap: itemMap
                }))
                setSelectableGroupDisabled(true)
            }
        } else if (selectableGroupType && selectableGroupType === "Complex Selectable") {
            if (selectableGroups.hasOwnProperty(complexSelectableID)) {
                idExists = true
            }
            if (!idExists) {
                selectableGroups[complexSelectableID] = {
                    exclusive: false,
                    notSelectable: false,
                    description: []
                }
                let itemMap = { selectableGroups: selectableGroups }
                dispatch(UPDATE_SFR_SECTION_ELEMENT({
                    sfrUUID: props.sfrUUID,
                    sectionUUID: props.componentUUID,
                    elementUUID: props.elementUUID,
                    itemMap: itemMap
                }))
                setSelectableGroupDisabled(true)
            }
        }
        setSelectableGroupID("")
        setComplexSelectableID("")
    }
    const handleSetSelectableType = (event) => {
        setSelectableType(event.target.value)
    }
    const handleIdTextUpdate = (event, uuid) => {
        let selectables = JSON.parse(JSON.stringify(props.element.selectables))
        if (selectables.hasOwnProperty(uuid)) {
            selectables[uuid].id = event.target.value

            // Update selectables for the selected element
            let itemMap = {selectables: selectables}
            dispatch(UPDATE_SFR_SECTION_ELEMENT({
                sfrUUID: props.sfrUUID,
                sectionUUID: props.componentUUID,
                elementUUID: props.elementUUID,
                itemMap: itemMap
            }))
        }
    }

    const getTableText = (value) => {
        const escapedContent = value.description.replace(escapedTagsRegex, (match, tagContent) => `&lt;${tagContent}&gt;`);

        try {
            if (value.assignment && value.assignment === true) {
                // const assignmentText = `<strong>assignment</strong>: ${value.description}`
                const assignmentText = `<strong>assignment</strong>: ${escapedContent}`
                return (
                    <div dangerouslySetInnerHTML={{ __html: assignmentText }} />
                )
            } else {
                return (
                    // <div dangerouslySetInnerHTML={{ __html: value.description }} />
                    <div dangerouslySetInnerHTML={{ __html: escapedContent }} />
                )
            }
        } catch (e) {
            console.log(e)
        }
    }

    // Return Method
    return (
        <div className="p-2 px-4">
            <Card className="w-full rounded-lg border-2 border-gray-200">
                <CardBody className="w-full m-0 p-0 border-b-2 border-gray-200">
                    <div className="w-full border-b-2 border-b-gray-200 p-4 pb-2">
                        <span className="min-w-full inline-flex items-baseline">
                            <div className="w-[1%]">
                                <IconButton sx={{marginTop: "-12px"}} onClick={() => {setCollapse(!collapse)}} key={"SelectionGroupsToolTip"}>
                                    <Tooltip title={`${(collapse ? "Collapse " : "Expand ") + "Selection Groups"}`}>
                                        {
                                            !collapse ?
                                                <RemoveIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }}/>
                                                :
                                                <AddIcon htmlColor={style.secondary} sx={{ width: 30, height: 30 }}/>
                                        }
                                    </Tooltip>
                                </IconButton>
                            </div>
                            <div className="w-[95%] justify-items-center">
                                <label className="resize-none font-bold text-[18px] p-0 text-accent">Selection Groups</label>
                            </div>
                        </span>
                    </div>
                    {
                        !collapse ?
                            <div className="py-2 w-full">
                                <SfrCard type={"section"}
                                         header={
                                             <Tooltip title={"This section houses all pre-defined selections and assignments " +
                                                             "to be used in the Selectables section below."} arrow>
                                                 <label className="resize-none font-bold text-[16px] p-0 pr-4 text-secondary">
                                                     Item List
                                                 </label>
                                             </Tooltip>
                                         }
                                         body={
                                             <div className="m-0 p-0 mt-[-8px] w-full">
                                                 <div className="max-w-5xl mb-4 mt-2 rounded-md border-2 border-gray-200">
                                                     <table className="w-full border-0 p-0 m-0" key={`${props.elementUUID}-selectables-table`}>
                                                         <thead className="border-b-2 border-gray-200">
                                                             <tr>
                                                                 <th className="text-secondary border-r-2 border-gray-200 text-center align-middle p-2 break-all">
                                                                     <Tooltip title={"The ID of the selectable or assignment. " +
                                                                                     "Selectables or assignments without IDs " +
                                                                                     "have one autogenerated upon export."}
                                                                              arrow>
                                                                         <div>ID</div>
                                                                     </Tooltip>
                                                                 </th>
                                                                 <th className="text-secondary border-r-2 border-gray-200 text-center align-middle p-2 break-all">
                                                                     <Tooltip title={"The value of the selectable or assignment."} arrow>
                                                                        <div>Text</div>
                                                                     </Tooltip>
                                                                 </th>
                                                                 <th className="text-secondary border-r-2 border-gray-200 text-center align-middle p-2 w-[90px]">
                                                                     <Tooltip title={"Selections that must be viewable, but not selectable."} arrow>
                                                                         <div>Not Selectable</div>
                                                                     </Tooltip>
                                                                 </th>
                                                                 <th className="text-secondary border-r-2 border-gray-200 text-center align-middle p-2 w-[90px]">
                                                                     <Tooltip title={"Selections that when selected, exclude all other selections."} arrow>
                                                                         <div>Exclusive</div>
                                                                     </Tooltip>
                                                                 </th>
                                                                 <th className="text-secondary text-center align-middle p-22 w-[90px]">
                                                                     <div>Remove</div>
                                                                 </th>
                                                             </tr>
                                                         </thead>
                                                         <tbody>
                                                         {
                                                             props.element && props.element.selectables && Object.entries(props.element.selectables).length > 0 ?
                                                                 Object.entries(props.element.selectables).map(([key, value])=> {
                                                                     return (
                                                                         <tr key={key}>
                                                                             <td className="border-r-2 border-gray-200 font-medium text-center align-middle py-0 break-all w-[80px]">
                                                                                 <input type="text" contentEditable="true" value={value.id ? value.id : ""}
                                                                                        className="border-none bg-transparent text-center w-full"
                                                                                        onChange={(event) => {handleIdTextUpdate(event, key)}}/>
                                                                             </td>
                                                                             <td className="border-r-2 border-gray-200 font-medium text-center align-middle py-0 break-all">{getTableText(value)}</td>
                                                                             <td className="border-r-2 border-gray-200 font-medium text-center align-middle">
                                                                                 <Checkbox checked={value.notSelectable || false} size={"small"} sx={style.checkbox}
                                                                                           onChange={(event) => {
                                                                                               handleSelectableCheckboxSelection(event, "notSelectable", key)
                                                                                           }}
                                                                                 />
                                                                             </td>
                                                                             <td className="border-r-2 border-gray-200 font-medium text-center align-middle">
                                                                                 <Checkbox checked={value.exclusive || false} size={"small"} sx={style.checkbox}
                                                                                           onChange={(event) => {
                                                                                               handleSelectableCheckboxSelection(event, "exclusive", key)
                                                                                           }}
                                                                                 />
                                                                             </td>
                                                                             <td className="text-center align-middle py-0">
                                                                                 <IconButton onClick={() => {handleDeleteSelectable(key)}}>
                                                                                     <Tooltip title={"Delete Selectable"}>
                                                                                         <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 26, height: 26 }}/>
                                                                                     </Tooltip>
                                                                                 </IconButton>
                                                                             </td>
                                                                         </tr>
                                                                     )
                                                                 })
                                                             : null
                                                         }
                                                         </tbody>
                                                     </table>
                                                 </div>
                                                 <div className="border-t-2 border-gray-200 m-0 p-0 pt-2 mx-[-16px]">
                                                     <div className="p-2 px-4">
                                                         <span className="min-w-full inline-flex items-baseline">
                                                             <div className="w-[17%]">
                                                                 <FormControl fullWidth color={"secondary"}>
                                                                     <InputLabel key="element-select-label">Selectable Type</InputLabel>
                                                                     <Select value={selectableType}
                                                                             label="Selectable Type"
                                                                             autoWidth
                                                                             onChange={handleSetSelectableType}
                                                                             sx = {{textAlign: "left"}}
                                                                     >
                                                                         <MenuItem sx={style.menu} key={"Assignment"} value={"Assignment"}>Assignment</MenuItem>
                                                                         <MenuItem sx={style.menu} key={"Selectable"} value={"Selectable"}>Selectable</MenuItem>
                                                                     </Select>
                                                                 </FormControl>
                                                             </div>
                                                             <div className="w-[16%] pl-2">
                                                                      <FormControl fullWidth>
                                                                         <TextField key={selectableID} label="ID"
                                                                                    color="secondary" defaultValue={selectableID}
                                                                                    onBlur={handleSelectableID}/>
                                                                     </FormControl>
                                                                 </div>
                                                             { selectableType === "Assignment" ?
                                                                 <div className="w-[61%] pl-2">
                                                                     <FormControl fullWidth>
                                                                         <TextField required key={assignmentDescription} label="Assignment"
                                                                                    defaultValue={assignmentDescription} color="secondary"
                                                                                    onBlur={handleAssignmentDescription}/>
                                                                     </FormControl>
                                                                 </div>
                                                                 :
                                                                 <div className="w-[61%] pl-2">
                                                                      <FormControl fullWidth>
                                                                         <TextField required key={selectableDescription} label="Description"
                                                                                    defaultValue={selectableDescription} color="secondary"
                                                                                    onBlur={handleSelectableDescription}/>
                                                                     </FormControl>
                                                                 </div>
                                                             }
                                                             <div className="w-[6%]">
                                                                 <IconButton sx={{marginBottom: "-26px"}} disabled={selectableDisabled} onClick={handleNewSelectableSubmit}>
                                                                     <Tooltip title={"Add Selectable"}>
                                                                         <AddCircleIcon htmlColor={style.primary} sx={{ width: 30, height: 30 }}/>
                                                                     </Tooltip>
                                                                 </IconButton>
                                                             </div>
                                                         </span>
                                                     </div>
                                                 </div>
                                             </div>
                                         }
                                />
                                <SfrCard type={"section"}
                                         header={
                                             <Tooltip
                                                 title={"This section allows a user to either create groups or complex " +
                                                        "selectables based on the selectables and assignments that have " +
                                                        "been constructed above."} arrow>
                                                <label className="resize-none font-bold text-[18px] p-0 pr-4 text-secondary">Selectables</label>
                                             </Tooltip>
                                         }
                                         body={
                                             <div className="m-0 p-0 mt-[-8px]">
                                                 <div className="w-full">
                                                     {props.element && props.element.selectableGroups && Object.keys(props.element.selectableGroups).length > 0 ?
                                                         Object.entries(props.element.selectableGroups).map(([key, value]) => {
                                                             return (
                                                                 <div key={`${key}-selectables-card`} className="mb-2 mx-[-16px]">
                                                                     { value.hasOwnProperty("groups") ?
                                                                         <SfrSelectionGroupCard sfrUUID={props.sfrUUID}
                                                                                                componentUUID={props.componentUUID}
                                                                                                elementUUID={props.elementUUID}
                                                                                                element={props.element}
                                                                                                getSelectablesMaps={props.getSelectablesMaps}
                                                                                                id={key}
                                                                         />
                                                                         :
                                                                         <div>
                                                                             { value.hasOwnProperty("description") ?
                                                                                 <SfrComplexSelectableCard id={key}
                                                                                                           sfrUUID={props.sfrUUID}
                                                                                                           componentUUID={props.componentUUID}
                                                                                                           elementUUID={props.elementUUID}
                                                                                                           element={props.element}
                                                                                                           getSelectablesMaps={props.getSelectablesMaps}
                                                                                 />
                                                                                 :
                                                                                 null
                                                                             }
                                                                         </div>
                                                                     }
                                                                 </div>
                                                             )
                                                         })
                                                         : null
                                                     }
                                                 </div>
                                                 <div className="border-t-2 border-gray-200 m-0 p-0 pt-4 mx-[-16px]">
                                                     <div className="px-4 pt-0 pb-2">
                                                         <span className="min-w-full inline-flex items-baseline">
                                                             <div className="w-[26%]">
                                                                 <FormControl fullWidth color={"secondary"}>
                                                                     <InputLabel key="element-select-label">Selectable Type</InputLabel>
                                                                     <Select value={selectableGroupType}
                                                                             label="Selectable Type"
                                                                             autoWidth
                                                                             onChange={handleSetSelectableGroupType}
                                                                             sx = {{textAlign: "left"}}
                                                                     >
                                                                         <MenuItem sx={style.menu} key={"Complex Selectable"} value={"Complex Selectable"}>Complex Selectable</MenuItem>
                                                                         <MenuItem sx={style.menu} key={"Selectable Group"} value={"Selectable Group"}>Selectable Group</MenuItem>
                                                                     </Select>
                                                                 </FormControl>
                                                             </div>
                                                             <div className="w-[68%] pl-2">
                                                                 { selectableGroupType === "Complex Selectable" ?
                                                                     <div>
                                                                         <FormControl fullWidth>
                                                                             <Tooltip title={"User-defined ID for the new complex selectable."} arrow>
                                                                                 <TextField color="secondary" required
                                                                                            key={complexSelectableID}
                                                                                            label="Complex Selectable ID"
                                                                                            defaultValue={complexSelectableID}
                                                                                            onBlur={handleComplexSelectableID}/>
                                                                             </Tooltip>
                                                                         </FormControl>
                                                                     </div>
                                                                     :
                                                                     <div>
                                                                         <FormControl fullWidth>
                                                                             <Tooltip title={"User-defined ID for the new group."} arrow>
                                                                                 <TextField color="secondary" required
                                                                                            key={selectableGroupID}
                                                                                            label="SFR Group ID"
                                                                                            defaultValue={selectableGroupID}
                                                                                            onBlur={handleSelectableGroupID}
                                                                                 />
                                                                             </Tooltip>
                                                                         </FormControl>
                                                                     </div>
                                                                 }
                                                             </div>
                                                             <div className="w-[6%]">
                                                                <IconButton sx={{marginBottom: "-26px"}} disabled={selectableGroupDisabled} onClick={handleNewSelectableGroupSubmit}>
                                                                     <Tooltip title={"Add Selectable Group"}>
                                                                         <AddCircleIcon htmlColor={style.primary} sx={{ width: 30, height: 30 }}/>
                                                                     </Tooltip>
                                                                 </IconButton>
                                                             </div>
                                                         </span>
                                                     </div>
                                                 </div>
                                             </div>
                                         }
                                />
                            </div>
                            :
                            null
                    }
                </CardBody>
            </Card>
        </div>
    );
}

// Export SfrSelectionGroups.jsx
export default SfrSelectionGroups;