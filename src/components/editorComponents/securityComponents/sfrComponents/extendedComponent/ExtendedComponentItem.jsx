// Imports
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import { DELETE_ECD_ITEM, UPDATE_ECD_ITEM } from "../../../../../reducers/SFRs/sfrSlice.js";
import CardTemplate from "../../CardTemplate.jsx";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded.js";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";

/**
 * The extended component definition item
 * @returns {Element}
 * @constructor
 */
function ExtendedComponentItem({famId, title, famBehavior, uuid, index}) {
    // Prop Validation
    ExtendedComponentItem.propTypes = {
        famId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        famBehavior: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired
    };

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } = SecurityComponents
    const dispatch = useDispatch();
    const { primary, secondary, icons } = useSelector((state) => state.styling);

    // Methods
    const handleDeleteExtendedComponentItem = () => {
        try {
            dispatch(DELETE_ECD_ITEM({
                uuid: uuid,
                index: index
            }))

            // Update snackbar
            handleSnackBarSuccess("Extended Component Item Successfully Removed")
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }
    const handleUpdateTitle = (event) => {
        updateEcdItem("title", event.target.value)
    }
    const handleUpdateFamilyId = (event) => {
        updateEcdItem("famId", event.target.value)
    }
    const handleUpdateFamilyBehavior = (event) => {
        updateEcdItem("famBehavior", event.target.value)
    }

    // Helper Methods
    const updateEcdItem = (type, value) => {
        try {
            dispatch(UPDATE_ECD_ITEM({
                uuid: uuid,
                index: index,
                type: type,
                value: value
            }))
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }

    // Return Method
    return (
        <div className="p-0" key={"ExtendedComponentItem" + index}>
            <CardTemplate
                type={"section"}
                header={
                    <div className="w-full">
                        <span className="flex justify-stretch min-w-full">
                            <div className="flex justify-start w-full pl-4">
                                <textarea
                                    style={{color: secondary}}
                                    className="w-full resize-none font-bold text-[14px] mb-0 h-[25px] p-0"
                                    onBlur={(event) => handleSnackbarTextUpdates(handleUpdateTitle, event)}
                                    defaultValue={title}
                                />
                            </div>
                            <div className="flex justify-end pr-4 w-[4%]">
                                <IconButton variant="contained"
                                            sx={{marginTop: "-8px", margin: 0, padding: 0}}
                                            onClick={handleDeleteExtendedComponentItem}>
                                    <Tooltip title={`Delete Extended Component Definition Item`}
                                             id={"deleteExtendedDefinitionItemTooltip" + index}>
                                        <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.medium}/>
                                    </Tooltip>
                                </IconButton>
                            </div>
                        </span>
                    </div>
                }
                body={
                    <div className="min-w-full mb-2 justify-items-left grid grid-flow-row auto-rows-max">
                        <FormControl fullWidth color={primary}>
                            <Tooltip arrow id={"familyIdTooltip" + index}
                                     title={"The family id for the extended component definition."}
                            >
                                <TextField
                                    color="secondary"
                                    key={"familyId" + index}
                                    label="Family ID"
                                    onBlur={(event) => handleSnackbarTextUpdates(handleUpdateFamilyId, event)}
                                    defaultValue={famId}
                                    required={true}
                                />
                            </Tooltip>
                        </FormControl>
                        <FormControl fullWidth sx={{marginTop: 2}}>
                            <Tooltip arrow  id={"familyBehaviorTooltip" + index}
                                     title={"The family behavior for the extended component definition."}
                            >
                                <TextField
                                    color="secondary"
                                    key={"familyBehavior" + index}
                                    label="Family Behavior"
                                    onBlur={(event) => handleSnackbarTextUpdates(handleUpdateFamilyBehavior, event)}
                                    defaultValue={famBehavior}
                                    required={true}
                                />
                            </Tooltip>
                        </FormControl>
                    </div>
                }
            />
        </div>
    )
}

// Export ExtendedComponentItem.jsx
export default ExtendedComponentItem;