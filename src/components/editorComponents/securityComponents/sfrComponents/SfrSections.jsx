// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import { DELETE_SFR_COMPONENT, GET_ALL_SFR_OPTIONS_MAP, UPDATE_SFR_COMPONENT_ITEMS } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { RESET_EVALUATION_ACTIVITY_UI } from "../../../../reducers/SFRs/evaluationActivitiesUI.js";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import SfrWorksheet from "./SfrWorksheet.jsx";
import RationaleTable from "../RationaleTable.jsx";
import '../../components.css';

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
    const { primary, icons } = useSelector((state) => state.styling);
    const [openSfrWorksheet, setOpenSfrWorksheet] = useState(false)
    const [allSfrOptionsMaps, setAllSfrOptionsMaps] = useState({
        dropdownOptions: {components: [], elements: [], selections: [], useCases: []},
        nameMap: {components: {}, elements: {}, selections: {}, useCases: {}},
        uuidMap: {components: {}, elements: {}, selections: {}, useCases: {}},
        useCaseUUID: null,
        elementSelections: {}
    });

    // Use Effects
    useEffect(() => {
        if (props.newSfrComponent && props.newSfrComponent !== "" && props.newSfrComponent === props.uuid) {
            setOpenSfrWorksheet(true)
        }
    }, [props]);
    useEffect(() => {
        clearEvaluationActivityStorage()
    }, [openSfrWorksheet])
    useEffect(() => {
        const newOptions = dispatch(GET_ALL_SFR_OPTIONS_MAP({ sfrSections: sfrSections, terms: terms })).payload
        if (JSON.stringify(newOptions) !== JSON.stringify(allSfrOptionsMaps)) {
            setAllSfrOptionsMaps(newOptions)
        }
    }, [sfrSections, terms]);

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

    // Return Method
    return (
        <div className="p-1 pb-3" key={props.uuid + + "SfrSection"} >
            <Card className="border-2 border-gray-300"  key={props.uuid + "SfrSectionCard"} >
                <CardBody key={props.uuid + "CardBody"}>
                    <div className="flex mb-[-15px] mt-[-5px]" key={props.uuid + "CardBodyDiv"}>
                        <IconButton sx={{marginTop: "-12px"}} onClick={() => {setOpenSfrWorksheet(true)}} variant="contained">
                            <Tooltip title={"Edit SFR Worksheet"} id={"editSfrWorksheetTooltip" + props.uuid}>
                                <AutoFixHighIcon htmlColor={ primary } sx={ icons.xSmall }/>
                            </Tooltip>
                        </IconButton>
                        <h1 className="w-full resize-none font-bold text-[13px] mt-2 ml-1 mb-0 h-[24px] p-0 text-secondary"
                            key={props.uuid + "SFRComponentAccordionTitle"}>{`${props.value.cc_id + (props.value.iteration_id && props.value.iteration_id.length > 0 ? 
                                                        "/" + props.value.iteration_id + " " : " ") + props.value.title}`}
                        </h1>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={deleteComponent} variant="contained">
                            <Tooltip title={"Delete Component"} id={"deleteComponentTooltip" + props.uuid}>
                                <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.large }/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseComponent} variant="contained">
                            <Tooltip title={`${props.value.open ? "Collapse " : "Expand "} Component`} id={(props.value.open ? "collapse" : "expand") + props.uuid + "ComponentTooltip"}>
                                {
                                    props.value.open ?
                                        <RemoveIcon htmlColor={ primary } sx={ icons.large }/>
                                        :
                                        <AddIcon htmlColor={ primary } sx={ icons.large }/>
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
                                  allSfrOptions={openSfrWorksheet ? allSfrOptionsMaps : {}} handleOpen={handleOpenSfrWorksheet}/>
                    :
                    null
            }
        </div>
    )
}

// Export SfrSections.jsx
export default SfrSections;