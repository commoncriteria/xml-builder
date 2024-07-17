// Imports
import {useEffect, useState} from "react";
import '../../components.css';
import PropTypes from "prop-types";
import {Card, CardBody, CardFooter} from "@material-tailwind/react";
import {IconButton, Tooltip} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import {useDispatch, useSelector} from "react-redux";
import {DELETE_SFR_COMPONENT, UPDATE_SFR_COMPONENT_ITEMS} from "../../../../reducers/SFRs/sfrSectionSlice.js";
import SfrWorksheet from "./SfrWorksheet.jsx";
import RationaleTable from "../RationaleTable.jsx";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {RESET_EVALUATION_ACTIVITY_UI} from "../../../../reducers/SFRs/evaluationActivitiesUI.js";

/**
 * The SfrSections component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function SfrSections(props) {
    // Prop Validation
    SfrSections.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        sfrUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        value: PropTypes.object.isRequired,
        newSfrComponent: PropTypes.string,
        handleNewSfrComponent: PropTypes.func,
    }

    // Constants
    const dispatch = useDispatch();
    const objectives = useSelector((state) => state.objectives);
    const sfrSections = useSelector((state) => state.sfrSections);
    const terms = useSelector((state) => state.terms);
    const style = {primary: "#d926a9", secondary: "#1FB2A6", borderColor: "#9CA3AF"}
    const [openSfrWorksheet, setOpenSfrWorksheet] = useState(false)

    // Use Effects
    useEffect(() => {
        if (props.newSfrComponent && props.newSfrComponent !== "" && props.newSfrComponent === props.uuid) {
            setOpenSfrWorksheet(true)
        }
    }, [props]);
    useEffect(() => {
        clearEvaluationActivityStorage()
    }, [openSfrWorksheet])

    // Methods
    const deleteComponent = async () => {
        dispatch(DELETE_SFR_COMPONENT({sfrUUID: props.sfrUUID, uuid: props.uuid}))
    }
    const collapseComponent = () => {
        let itemMap = {open: !props.value.open}
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }
    const handleOpenSfrWorksheet = () => {
        if (props.newSfrComponent && props.newSfrComponent !== "" && props.newSfrComponent === props.uuid) {
            if (!openSfrWorksheet === false) {
                props.handleNewSfrComponent("")
            }
            setOpenSfrWorksheet(!openSfrWorksheet)
        } else {
            setOpenSfrWorksheet(!openSfrWorksheet)
        }
    }

    // Helper Methods
    const clearEvaluationActivityStorage = () => {
        dispatch(RESET_EVALUATION_ACTIVITY_UI())
    }
    const getObjectiveMaps = () => {
        let objectiveMap = {
            objectiveNames: [],
            objectiveNameMap: {},
            objectiveUUIDMap: {}
        }
        Object.values(objectives).map((value) => {
            let terms = value.terms
            Object.entries(terms).map(([key, value]) => {
                let title = value.title
                if (!objectiveMap.objectiveNames.includes(title)) {
                    objectiveMap.objectiveNames.push(title)
                    objectiveMap.objectiveNameMap[title] = key
                    objectiveMap.objectiveUUIDMap[key] = title
                }
            })
        })
        objectiveMap.objectiveNames.sort()
        return objectiveMap
    }
    const getAllSfrOptionsMaps = () => {
        let sfrOptionsMap = {
            dropdownOptions: {components: [], elements: [], selections: [], useCases: []},
            nameMap: {components: {}, elements: {}, selections: {}, useCases: {}},
            uuidMap: {components: {}, elements: {}, selections: {}, useCases: {}},
            useCaseUUID: null,
            elementSelections: {}
        }
        try {
            // Get component and element data
            Object.values(sfrSections).map((sfrClass) => {
                Object.entries(sfrClass).map(([componentUUID, sfrComponent]) => {
                    // Get component data
                    let componentName = sfrComponent.cc_id
                    let iterationID = sfrComponent.iteration_id
                    let iterationTitle =  (iterationID && typeof iterationID === "string" && iterationID !== "") ? ("/" + iterationID) : ""
                    let componentTitle = componentName + iterationTitle
                    if (!sfrOptionsMap.dropdownOptions.components.includes(componentTitle)) {
                        sfrOptionsMap.dropdownOptions.components.push(componentTitle)
                        sfrOptionsMap.nameMap.components[componentTitle] = componentUUID
                        sfrOptionsMap.uuidMap.components[componentUUID] = componentTitle
                    }
                    // Get element data
                    Object.entries(sfrComponent.elements).map(([elementUUID, sfrElement], index) => {
                        let elementName = `${componentName}.${(index + 1)}${iterationTitle}`
                        if (!sfrOptionsMap.dropdownOptions.elements.includes(elementName)) {
                            sfrOptionsMap.dropdownOptions.elements.push(elementName)
                            sfrOptionsMap.nameMap.elements[elementName] = elementUUID
                            sfrOptionsMap.uuidMap.elements[elementUUID] = elementName
                            // Get selections data
                            if (sfrElement.selectables && Object.keys(sfrElement.selectables).length > 0) {
                                sfrOptionsMap.elementSelections[elementUUID] = []
                                let elementSelections = sfrOptionsMap.elementSelections[elementUUID]
                                Object.entries(sfrElement.selectables).map(([selectionUUID, selection]) => {
                                    // Get component data
                                    let id = selection.id
                                    let assignment = selection.assignment
                                    let description = selection.description
                                    let selectable = id ? (`${description} (${id})`) : description
                                    if (!sfrOptionsMap.dropdownOptions.selections.includes(selectable) && !assignment) {
                                        sfrOptionsMap.dropdownOptions.selections.push(selectable)
                                        sfrOptionsMap.nameMap.selections[selectable] = selectionUUID
                                        sfrOptionsMap.uuidMap.selections[selectionUUID] = selectable
                                        if (!elementSelections.includes(selectionUUID)) {
                                            elementSelections.push(selectionUUID)
                                        }
                                    }
                                })
                            }
                        }
                    })
                })
            })

            // Get use case data
            Object.entries(terms).map(([sectionUUID, termSection]) => {
                let title = termSection.title
                if (title === "Use Cases") {
                    sfrOptionsMap.useCaseUUID = sectionUUID
                    Object.entries(termSection).map(([termUUID, term]) => {
                        // Get use case term data
                        let termTitle = term.title
                        if (termUUID !== "title" && termUUID !== "open" && termTitle &&
                            !sfrOptionsMap.dropdownOptions.useCases.includes(termTitle)) {
                            sfrOptionsMap.dropdownOptions.useCases.push(termTitle)
                            sfrOptionsMap.nameMap.useCases[termTitle] = termUUID
                            sfrOptionsMap.uuidMap.useCases[termUUID] = termTitle
                        }
                    })
                } else {
                    sfrOptionsMap.useCaseUUID = null
                }
            })

            // If use cases do not exist set items to default
            if (sfrOptionsMap.useCaseUUID === null) {
                sfrOptionsMap.dropdownOptions.useCases = []
                sfrOptionsMap.nameMap.useCases = {}
                sfrOptionsMap.uuidMap.useCases = {}
            }

            // Sort drop down menu options
            sfrOptionsMap.dropdownOptions.components.sort()
            sfrOptionsMap.dropdownOptions.elements.sort()
            sfrOptionsMap.dropdownOptions.selections.sort()
            sfrOptionsMap.dropdownOptions.useCases.sort()
        } catch (e) {
            console.log(e)
        }
        return sfrOptionsMap
    }

    // Return Method
    return (
        <div className="p-1 pb-3" key={props.uuid + + "SfrSection"} >
            <Card className="border-2 border-gray-300"  key={props.uuid + "SfrSectionCard"} >
                <CardBody key={props.uuid + "CardBody"}>
                    <div className="flex mb-[-15px] mt-[-5px]" key={props.uuid + "CardBodyDiv"}>
                        <IconButton sx={{marginTop: "-12px"}} onClick={() => {setOpenSfrWorksheet(true)}}>
                            <Tooltip title={"Edit SFR Worksheet"}>
                                <AutoFixHighIcon htmlColor={style.primary} sx={{ width: 26, height: 26}}/>
                            </Tooltip>
                        </IconButton>
                        <h1 className="w-full resize-none font-bold text-[16px] mt-2 ml-1 mb-0 h-[24px] p-0 text-secondary"
                            key={props.uuid + "SFRComponentAccordionTitle"}>{`${props.value.cc_id + (props.value.iteration_id && props.value.iteration_id.length > 0 ? 
                                                        "/" + props.value.iteration_id + " " : " ") + props.value.title}`}
                        </h1>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={deleteComponent}>
                            <Tooltip title={"Delete Component"}>
                                <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseComponent}>
                            <Tooltip title={`${props.open ? "Collapse " : "Expand "} Component`}>
                                {
                                    props.value.open ?
                                        <RemoveIcon htmlColor={style.primary} sx={{ width: 30, height: 30, stroke: style.primary, strokeWidth: 1 }}/>
                                        :
                                        <AddIcon htmlColor={style.primary} sx={{ width: 30, height: 30, stroke: style.primary, strokeWidth: 1 }}/>
                                }
                            </Tooltip>
                        </IconButton>
                    </div>
                </CardBody>
                {
                    props.value.open ?
                        <CardFooter className="w-full m-0 p-0">
                            <div className="pt-2 p-6" key={props.uuid + "RationaleTableDiv"}>
                                <RationaleTable key={props.uuid + "RationaleTable"} accordionUUID={props.accordionUUID}
                                                termUUID={props.sfrUUID} index={props.index} uuid={props.uuid}
                                                title={props.value.title} objectives={props.value.objectives}
                                                open={props.value.tableOpen} contentType={"sfrs"}
                                                objectiveMaps={getObjectiveMaps()}/>
                            </div>
                        </CardFooter>
                        :
                        null
                }
            </Card>
            {
                openSfrWorksheet ?
                    <SfrWorksheet sfrUUID={props.sfrUUID} uuid={props.uuid} value={props.value} open={openSfrWorksheet}
                                  allSfrOptions={openSfrWorksheet ? getAllSfrOptionsMaps() : {}} handleOpen={handleOpenSfrWorksheet}/>
                    :
                    null
            }
        </div>
    )
}

// Export SfrSections.jsx
export default SfrSections;