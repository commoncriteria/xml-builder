// Imports
import PropTypes from "prop-types";
import React from "react";
import CardTemplate from "../../CardTemplate.jsx";
import TipTapEditor from "../../../TipTapEditor.jsx";
import { deepCopy } from "../../../../../utils/deepCopy.js";

/**
 * The SfrNoTest class that displays the no test section
 * @returns {JSX.Element}
 * @constructor             passes in props to the class
 */
function SfrNoTest(props) {
    // Prop Validation
    SfrNoTest.propTypes = {
        activities: PropTypes.object.isRequired,
        selected: PropTypes.array,
        uuid: PropTypes.string,
        isManagementFunction: PropTypes.bool,
        rowIndex: PropTypes.number,
        handleTextUpdate: PropTypes.func.isRequired,
    };

    // Methods
    const getNoTestSection = () => {
        const { selected, activities, uuid, rowIndex, isManagementFunction } = props
        let noTest = ""
        if (isManagementFunction) {
            noTest = activities.noTest ? deepCopy(activities.noTest) : ""
        } else if (selected && selected.length > 0 && uuid && uuid !== "" && activities && activities[uuid]) {
            noTest = activities[uuid].noTest ? deepCopy(activities[uuid].noTest) : ""
        } else {
            return null;
        }
        return getNoTestCard(rowIndex, noTest, uuid);
    }

    // Components
    const getNoTestCard = (rowIndex, noTest, uuid) => {
        return (
            <CardTemplate
                type={"section"}
                header={
                    <label className="resize-none font-bold text-[14px] p-0 pr-4 text-accent">No Evaluation Activity Explanation</label>
                }
                body={
                    <div>
                        <TipTapEditor
                            className="w-full"
                            contentType={"term"}
                            title={"noTest"}
                            handleTextUpdate={props.handleTextUpdate}
                            index={rowIndex ? rowIndex : null}
                            text={noTest}
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
            {getNoTestSection()}
        </div>
    )
}

// Export SfrNoTest.jsx
export default SfrNoTest;