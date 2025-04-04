// Imports
import React, { useState } from "react";
import '../components.css';
import PropTypes from "prop-types";
import { Card, CardBody } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { COLLAPSE_THREAT_TERM, DELETE_OBJECTIVE_FROM_THREAT_USING_UUID, DELETE_THREAT_TERM, UPDATE_THREAT_TERM_DEFINITION, UPDATE_THREAT_TERM_TITLE } from "../../../reducers/threatsSlice.js";
import { COLLAPSE_OBJECTIVE_TERM, DELETE_OBJECTIVE_TERM, UPDATE_OBJECTIVE_TERM_DEFINITION, UPDATE_OBJECTIVE_TERM_TITLE } from "../../../reducers/objectivesSlice.js";
import { DELETE_OBJECTIVE_FROM_SFR_USING_UUID } from "../../../reducers/SFRs/sfrSectionSlice.js";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import SecurityComponents from "../../../utils/securityComponents.jsx";
import RationaleTable from "./tableComponents/RationaleTable.jsx";
import TipTapEditor from "../TipTapEditor.jsx";
import SfrRationaleTable from "./tableComponents/SfrRationaleTable.jsx";
import DeleteConfirmation from "../../modalComponents/DeleteConfirmation.jsx";

/**
 * The Definition component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function Definition(props) {
    // Prop Validation
    Definition.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        accordionTitle: PropTypes.string.isRequired,
        termUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        definition: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        item: PropTypes.object.isRequired,
        contentType: PropTypes.string.isRequired,
    }

    // Constants
    const {
        handleSnackBarError,
        handleSnackBarSuccess,
        getObjectiveMaps,
        getSfrMaps,
        getThreatMaps
    } = SecurityComponents
    const dispatch = useDispatch()
    const objectives = useSelector((state) => state.objectives);
    const threats = useSelector((state) => state.threats);
    const sfrSections = useSelector((state) => state.sfrSections);
    const metadataSection = useSelector((state) => state.accordionPane.metadata);
    const { ppTemplateVersion } = metadataSection;
    const { secondary, icons } = useSelector((state) => state.styling);
    const [openDeleteDialog, setDeleteDialog] = useState(false);

    // Methods
    const updateTitle = (event) => {
        switch (props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_TERM_TITLE({ threatUUID: props.termUUID, uuid: props.uuid, title: props.title, newTitle: event.target.value }))
                break;
            }
            case "objectives": {
                dispatch(UPDATE_OBJECTIVE_TERM_TITLE({ objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title, newTitle: event.target.value }))
                break;
            }
            default:
                break;
        }
    }
    const updateDefinition = (event) => {
        switch (props.contentType) {
            case "threats": {
                dispatch(UPDATE_THREAT_TERM_DEFINITION({ threatUUID: props.termUUID, uuid: props.uuid, title: props.title, newDefinition: event }))
                break;
            }
            case "objectives": {
                dispatch(UPDATE_OBJECTIVE_TERM_DEFINITION({ objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title, newDefinition: event }))
                break;
            }
            default:
                break;
        }
    }
    const deleteSection = async () => {
        try {
            switch (props.contentType) {
                case "threats": {
                    await dispatch(DELETE_THREAT_TERM({
                        threatUUID: props.termUUID,
                        uuid: props.uuid,
                        title: props.title
                    }))
                    handleSnackBarSuccess("Term Successfully Removed")
                    break;
                }
                case "objectives": {
                    await dispatch(DELETE_OBJECTIVE_FROM_SFR_USING_UUID({ objectiveUUID: props.uuid }))
                    await dispatch(DELETE_OBJECTIVE_FROM_THREAT_USING_UUID({ objectiveUUID: props.uuid }))
                    await dispatch(DELETE_OBJECTIVE_TERM({
                        objectiveUUID: props.termUUID,
                        uuid: props.uuid,
                        title: props.title
                    }))
                    handleSnackBarSuccess("Objective Term Successfully Removed. Reloading page...")

                    // Reload page
                    setTimeout(() => {
                        location.reload();
                    }, 3000)
                    break;
                }
                default:
                    handleSnackBarError("Error - Term type invalid. No term removed.")
                    break;
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const collapseSection = () => {
        switch (props.contentType) {
            case "threats": {
                dispatch(COLLAPSE_THREAT_TERM({ threatUUID: props.termUUID, uuid: props.uuid, title: props.title }))
                break;
            }
            case "objectives": {
                dispatch(COLLAPSE_OBJECTIVE_TERM({ objectiveUUID: props.termUUID, uuid: props.uuid, title: props.title }))
                break;
            }
            default:
                break;
        }
    }
    const isObjectiveTable = () => {
        const title = props.accordionTitle ? props.accordionTitle.toLowerCase() : ""
        const isStandardThreat = title.toLowerCase().includes("threat") && ppTemplateVersion !== "CC2022 Direct Rationale"
        const isAssumption = title.toLowerCase().includes("assumption")

        return (props.contentType === "threats" && (isStandardThreat || isAssumption))
    }
    const mapObjectivesToSFRs = () => {
        let objectiveToSFRsMap = {};

        if (sfrSections) {
            Object.values(sfrSections).map((sfrContent) => {
                Object.entries(sfrContent).map(([sfrUUID, sfr]) => {
                    sfr.objectives.forEach(objective => {
                        const objectiveUUID = objective.uuid;

                        // Initialize array
                        if (!objectiveToSFRsMap[objectiveUUID]) {
                            objectiveToSFRsMap[objectiveUUID] = [];
                        }

                        if (!Object.values(objectiveToSFRsMap[objectiveUUID]).includes(sfrUUID)) {
                            objectiveToSFRsMap[objectiveUUID].push({sfrUUID, rationale: objective.rationale});
                        }
                    });
                })
            })
        }

        return objectiveToSFRsMap;
    };


    // Return Method
    return (
        <div className="p-1 pb-3" key={props.uuid + + "DefinitionBody"} >
            <Card className="border-2 border-gray-300" key={props.uuid + "DefinitionCard"} >
                <CardBody key={props.uuid + "CardBody"}>
                    <div className="flex" key={props.uuid + "CardBodyDiv"}>
                        <textarea className="w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-accent"
                                  onChange={updateTitle} id={props.uuid + "Title"}
                                  value={props.title}>{props.title}</textarea>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={() => setDeleteDialog(!openDeleteDialog)} variant="contained">
                            <Tooltip title={"Delete Section"} id={props.termUUID + "deleteDefinitionSectionToolTip"}>
                                <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                            </Tooltip>
                        </IconButton>
                        <span />
                        <IconButton sx={{ marginTop: "-8px" }} onClick={collapseSection} variant="contained">
                            <Tooltip id={(props.open ? "collapse" : "expand") + props.termUUID + "ItemTooltip"}
                                title={`${props.open ? "Collapse " : "Expand "} Item`}>
                                {
                                    props.open ?
                                        <RemoveIcon htmlColor={secondary} sx={icons.large} />
                                        :
                                        <AddIcon htmlColor={secondary} sx={icons.large} />
                                }
                            </Tooltip>
                        </IconButton>
                    </div>
                    {
                        props.open ?
                            <div>
                                <div className="m-0 p-0 pt-2" key={props.uuid + "TextEditorDiv"}>
                                    <TipTapEditor
                                        uuid={props.uuid}
                                        text={props.definition}
                                        contentType={"term"}
                                        handleTextUpdate={updateDefinition}
                                    />
                                </div>
                                {isObjectiveTable() ?
                                    <div className="pt-2" key={props.uuid + "RationaleTableDiv"}>
                                        <RationaleTable
                                            key={props.uuid + "RationaleTable"}
                                            accordionUUID={props.accordionUUID}
                                            termUUID={props.termUUID}
                                            index={props.index}
                                            uuid={props.uuid}
                                            title={props.title}
                                            objectives={props.item.objectives}
                                            open={props.item.tableOpen}
                                            contentType={props.contentType}
                                            objectiveMaps={getObjectiveMaps(objectives)}
                                            objectiveSFRsMap={mapObjectivesToSFRs()}
                                            threatMaps={getThreatMaps(threats)}
                                            sfrMaps={getSfrMaps(sfrSections)}
                                        />
                                    </div>
                                    :
                                    props.contentType === "threats" &&
                                    <div className="pt-2" key={props.uuid + "SfrRationaleTableDiv"}>
                                        <SfrRationaleTable
                                            key={props.uuid + "RationaleTable"}
                                            accordionUUID={props.accordionUUID}
                                            termUUID={props.termUUID}
                                            index={props.index}
                                            uuid={props.uuid}
                                            title={props.title}
                                            sfrs={props.item.sfrs ? props.item.sfrs : []}
                                            open={props.item.tableOpen}
                                            sfrMaps={getSfrMaps(sfrSections)}
                                        />
                                    </div>
                                }
                            </div>
                            :
                            <div className="m-0 p-0 mt-[-15px]" />
                    }
                </CardBody>
            </Card>
            <DeleteConfirmation
                title={props.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteSection}
            />
        </div>
    )
}

// Export Definition.jsx
export default Definition;