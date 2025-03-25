// Imports
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import { CREATE_ECD_ITEM } from "../../../../../reducers/SFRs/sfrSlice.js";
import CardTemplate from "../../CardTemplate.jsx";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded.js";
import ExtendedComponentItem from "./ExtendedComponentItem.jsx";
import SecurityComponents from "../../../../../utils/securityComponents.jsx";

/**
 * The extended component definition content
 * @returns {Element}
 * @constructor
 */
function ExtendedComponent({uuid}) {
    // Prop Validation
    ExtendedComponent.propTypes = {
        uuid: PropTypes.string.isRequired
    }

    // Constants
    const { handleSnackBarError, handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const { primary, icons } = useSelector((state) => state.styling);
    const currentSfr = useSelector((state) => state.sfrs.sections[uuid]);
    const { extendedComponentDefinition } = currentSfr

    // Methods
    const handleOpen = () => {
        setOpen(!open);
    }
    const addNewExtendedComponent = () => {
        try {
            dispatch(CREATE_ECD_ITEM({
                uuid: uuid
            }))

            // Update snackbar
            handleSnackBarSuccess("Extended Component Definition Successfully Added")
        } catch (e) {
            console.log(e)
            handleSnackBarError(e)
        }
    }

    // Return Method
    return (
        <div>
            <CardTemplate
                type={"parent"}
                title={"Extended Component Definition"}
                tooltip={"Extended Component Definition"}
                collapse={open}
                collapseHandler={handleOpen}
                body={
                    <div className="mt-2 w-full">
                        {extendedComponentDefinition?.map((def, index) => {
                            const { title, famId, famBehavior } = def
                            return (
                                <ExtendedComponentItem
                                    key={index}
                                    title={title}
                                    famId={famId}
                                    famBehavior={famBehavior}
                                    uuid={uuid}
                                    index={index}
                                />
                            )
                        })}
                    </div>
                }
                footer={
                    <div className="min-w-full flex justify-center p-3 px-2 rounded-b-lg border-t-2 border-gray-200 bg-white"
                         key={"ExtendedComponentFooter"}
                    >
                        <IconButton
                            sx={{marginBottom: "-4px"}}
                            key={"NewExtendedComponentButton"}
                            onClick={addNewExtendedComponent}
                            variant="contained"
                        >
                            <Tooltip
                                title={"Add New Extended Component Definition"}
                                id={"addNewExtendedComponentTooltip"}
                            >
                                <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium}/>
                            </Tooltip>
                        </IconButton>
                    </div>
                }
            />
        </div>
    )
}

// Export ExtendedComponent.jsx
export default ExtendedComponent;