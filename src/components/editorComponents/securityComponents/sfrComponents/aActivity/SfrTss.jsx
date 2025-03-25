// Imports
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "@mui/material";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";

/**
 * The SfrTss class that displays the evaluation activity TSS
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrTss(props) {
    // Prop Validation
    SfrTss.propTypes = {
        activities: PropTypes.object.isRequired,
        selected: PropTypes.array,
        uuid: PropTypes.string,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        handleTextUpdate: PropTypes.func.isRequired,
    };

    // Methods
    const getTss = () => {
        let { selected, activities, uuid, rowIndex, isManagementFunction } = props
        let tss = ""
        if (isManagementFunction) {
            tss = activities.tss ? deepCopy(activities.tss) : ""
        } else if (selected && selected.length > 0 && uuid && uuid !== "" && activities && activities[uuid]) {
            tss = activities[uuid].tss ? deepCopy(activities[uuid].tss) : ""
        } else {
            return null;
        }
        return getTssCard(rowIndex, tss, uuid);
    }

    // Components
    const getTssCard = (rowIndex, tss, uuid) => {
        return (
            <CardTemplate
                type={"section"}
                header={
                    <Tooltip
                        id={"TssTooltip"}
                        title={`Taken directly from the WIki: ASE_TSS.1 requires that the developer provide a TOE Summary 
                                Specification (TSS) that describes how the TOE meets each SFR. Other SARs require that the 
                                TSS describe how the TOE protects itself against interference, logical tampering, and 
                                bypass. Since the SARs already require that the TSS describe how the TOE meets all the 
                                requirements, this activity should be used only to point out specific aspects of the 
                                requirement that must be documented in the the TSS.`}
                        arrow
                    >
                        <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">TSS</label>
                    </Tooltip>
                }
                body={
                    <div>
                        <TipTapEditor
                            className="w-full"
                            contentType={"term"}
                            title={"tss"}
                            handleTextUpdate={props.handleTextUpdate}
                            index={rowIndex ? rowIndex : null}
                            text={tss}
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
            {getTss()}
        </div>
    )
}

// Export SfrTss.jsx
export default SfrTss;