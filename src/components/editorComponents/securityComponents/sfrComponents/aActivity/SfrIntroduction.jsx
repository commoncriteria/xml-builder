// Imports
import PropTypes from "prop-types";
import React from "react";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";

/**
 * The SfrIntroduction class that displays the evaluation activity Introduction
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrIntroduction(props) {
    // Prop Validation
    SfrIntroduction.propTypes = {
        activities: PropTypes.object.isRequired,
        selected: PropTypes.array,
        uuid: PropTypes.string,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        handleTextUpdate: PropTypes.func.isRequired,
    };

    // Methods
    const getIntroduction = () => {
        const { selected, activities, uuid, rowIndex, isManagementFunction } = props
        let introduction = ""
        if (isManagementFunction) {
            introduction = activities.introduction ? deepCopy(activities.introduction) : ""
        } else if (selected && selected.length > 0 && uuid && uuid !== "" && activities && activities[uuid]) {
            introduction = activities[uuid].introduction ? deepCopy(activities[uuid].introduction) : ""
        } else {
            return null;
        }
        return getIntroductionCard(rowIndex, introduction, uuid);
    }

    // Components
    const getIntroductionCard = (rowIndex, introduction, uuid) => {
        return (
            <CardTemplate
                type={"section"}
                header={
                    <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">Introduction</label>
                }
                body={
                    <div>
                        <TipTapEditor
                            className="w-full"
                            contentType={"term"}
                            title={"introduction"}
                            handleTextUpdate={props.handleTextUpdate}
                            index={rowIndex ? rowIndex : null}
                            text={introduction}
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
            {getIntroduction()}
        </div>
    )
}

// Export SfrIntroduction.jsx
export default SfrIntroduction;