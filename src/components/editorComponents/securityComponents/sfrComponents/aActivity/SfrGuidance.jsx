// Imports
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "@mui/material";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";

/**
 * The SfrGuidance class that displays the evaluation activity Guidance
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrGuidance(props) {
    // Prop Validation
    SfrGuidance.propTypes = {
        activities: PropTypes.object.isRequired,
        selected: PropTypes.array,
        uuid: PropTypes.string,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        handleTextUpdate: PropTypes.func.isRequired,
    };

    // Methods
    const getGuidance = () => {
        let { selected, activities, uuid, rowIndex, isManagementFunction } = props
        let guidance = ""
        if (isManagementFunction) {
            guidance = activities.guidance ? deepCopy(activities.guidance) : ""
        } else if (selected && selected.length > 0 && uuid && uuid !== "" && activities && activities[uuid]) {
            guidance = activities[uuid].guidance ? deepCopy(activities[uuid].guidance) : ""
        } else {
            return null;
        }
        return getGuidanceCard(rowIndex, guidance, uuid);
    }

    // Components
    const getGuidanceCard = (rowIndex, guidance, uuid) => {
        return (
            <CardTemplate
                type={"section"}
                header={
                    <Tooltip
                        id={"GuidanceTooltip"}
                        title={`Taken directly from the Wiki: The CC:2022 requires at least two types of Guidance documentation: 
                                Operational Guidance and Administrator Guidance. Administrator Guidance contains of instructions 
                                for putting the TOE into the evaluated configuration. The Operational Guidance is documentation 
                                for users of the system. This activity concerns the Operational Guidance, or the Guidance in general. 
                                It is sometimes referred to as "AGD."`}
                        arrow
                    >
                        <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">Guidance</label>
                    </Tooltip>
                }
                body={
                    <div>
                        <TipTapEditor
                            className="w-full"
                            contentType={"term"}
                            title={"guidance"}
                            handleTextUpdate={props.handleTextUpdate}
                            index={rowIndex ? rowIndex : null}
                            text={guidance}
                            uuid={uuid}
                            showTable
                        />
                    </div>
                }
            />
        )
    }

    // Return Method
    return (
        <div>
            {getGuidance()}
        </div>
    )
}

// Export SfrGuidance.jsx
export default SfrGuidance;