// Imports
import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import { UPDATE_SFR_COMPONENT_ITEMS } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import CardTemplate from "../CardTemplate.jsx";
import SecurityComponents from "../../../../utils/securityComponents.jsx";
import { deepCopy } from "../../../../utils/deepCopy.js";

/**
 * The ImplementationDependent class that displays the sfr audit events section
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function ImplementationDependent(props) {
    // Prop Validation
    ImplementationDependent.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        reasons: PropTypes.array.isRequired,
        toggle: PropTypes.node.isRequired
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } = SecurityComponents
    const dispatch = useDispatch();
    const { primary, secondary, icons } = useSelector((state) => state.styling);

    // Methods
    const handleAddReason = () => {
        let reasons = deepCopy(props.reasons);

        // Add new reason
        reasons.push({
            id: "",
            title: "New Reason Title",
            description: ""
        })
        updateImplementationDependent(reasons)

        // Update snackbar
        handleSnackBarSuccess("New Reason Successfully Added")
    }
    const handleDeleteReason = (reasons, index) => {
        if (reasons[index]) {
            reasons.splice(index, 1);
            updateImplementationDependent(reasons)

            // Update snackbar
            handleSnackBarSuccess("Reason Successfully Removed")
        }
    }
    const handleUpdateReason = (event, type, index, reasons) => {
        if (reasons[index]) {
            reasons[index][type] = event.target.value
            updateImplementationDependent(reasons)
        }
    }

    // Helper Methods
    const updateImplementationDependent = (reasons) => {
        const itemMap = {
            reasons: reasons
        }
        dispatch(UPDATE_SFR_COMPONENT_ITEMS({sfrUUID: props.sfrUUID, uuid: props.uuid, itemMap: itemMap}))
    }

    // Components
    const getReasons = () => {
        try {
            let reasons = deepCopy(props.reasons);
            if (reasons && reasons.length > 0) {
                return (
                    reasons.map((reason, index) => {
                        const {title, id, description} = reason
                        return (
                            <div className="p-0 m-0 mx-[-12px] pb-2" key={"reason-" + index}>
                                <CardTemplate
                                    type={"section"}
                                    header={
                                        <span className="flex justify-center min-w-full">
                                    <div className="w-[94%] ml-4">
                                        <Tooltip
                                            title={"Enter Implementation Dependent Title"}
                                            id={props.uuid + "reasonTitle" + index}
                                        >
                                            <textarea
                                                className="w-full text-center resize-none font-bold text-[13px] mb-[-8px] h-[24px] p-0 text-accent"
                                                onChange={(event) => {
                                                    handleUpdateReason(event, "title", index, reasons)
                                                }}
                                                value={title}>
                                                {title}
                                            </textarea>
                                        </Tooltip>
                                    </div>
                                    <div className="w-[6%] mr-1">
                                        <IconButton
                                            variant="contained" sx={{marginTop: "-8px", margin: 0, padding: 0}}
                                            onClick={() => {
                                                handleDeleteReason(reasons, index)
                                            }}>
                                            <Tooltip
                                                title={`Delete Implementation Dependent`}
                                                id={props.uuid + "deleteReasonTooltip" + index}
                                            >
                                                <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.small}/>
                                            </Tooltip>
                                        </IconButton>
                                    </div>
                                </span>
                                    }
                                    body={
                                        <div
                                            className="min-w-full mt-1 mb-2 justify-items-left grid grid-flow-row auto-rows-max">
                                            <FormControl fullWidth>
                                                <TextField
                                                    color={"secondary"}
                                                    className="w-full"
                                                    key={"reasonID"}
                                                    label="ID"
                                                    defaultValue={id}
                                                    onBlur={(event) => {
                                                        handleSnackbarTextUpdates(handleUpdateReason, event, "id", index, reasons)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl fullWidth sx={{marginTop: 2}}>
                                                <TextField
                                                    color={"secondary"}
                                                    className="w-full"
                                                    key={"reasonDescription"}
                                                    label="Description"
                                                    defaultValue={description}
                                                    onBlur={(event) => {
                                                        handleSnackbarTextUpdates(handleUpdateReason, event, "description", index, reasons)
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                    }
                                />
                            </div>
                        )
                    })
                )
            }
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }

    // Return Method
    return (
        <div className="mx-[-10px]">
            <CardTemplate
                type={"section"}
                header={props.toggle}
                body={
                    <div className="min-w-full">
                        <div className="min-w-full mt-[-8px]">
                            {getReasons()}
                        </div>
                        <div className="border-t-2 border-gray-200 mx-[-16px]">
                            <div className="w-full p-1 justify-items-center">
                                <IconButton sx={{marginBottom: "-8px"}} key={"NewAuditEventsButton"} onClick={handleAddReason} variant="contained">
                                    <Tooltip title={"Add New Implementation Dependent"} id={props.uuid + "addNewImplementationDependentTooltip"}>
                                        <AddCircleRoundedIcon htmlColor={ primary } sx={ icons.medium }/>
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
}

// Export ImplementationDependent.jsx
export default ImplementationDependent;