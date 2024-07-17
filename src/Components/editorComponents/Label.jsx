// Imports
import PropTypes from "prop-types";
import { useSelector } from 'react-redux'
import { Card, CardBody } from "@material-tailwind/react";
import './components.css';
import React from "react";

/**
 * The Label component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function Label(props) {
    // Prop Validation
    Label.propTypes = {
        uuid: PropTypes.string.isRequired,
        accordionUUID: PropTypes.string.isRequired,
        section: PropTypes.string.isRequired,
    }

    // Constants
    const accordions = useSelector((state) => state.accordionPane.sections);

    // Methods
    const title = () => {
        let title = ""
        let label = ""
        if (accordions.hasOwnProperty(props.accordionUUID)) {
            let section = JSON.parse(JSON.stringify(accordions[props.accordionUUID]))
            let formItems = section.hasOwnProperty("formItems") ? section.formItems : []
            let item = formItems.find((value) => value.uuid === props.uuid)
            if (item.contentType === "label") {
                title = item.hasOwnProperty("title") ? item.title : ""
                label = item.hasOwnProperty("label") ? item.label : ""
            }
        }
        return {title: title, label: label}
    }

    // Return Method
    return (
        <div className="min-w-full mb-2" key={props.uuid + "Div"}>
            <Card className="h-full w-full rounded-lg border-2 border-gray-300">
                <CardBody className="mb-0 rounded-b-none" key={props.uuid + "CardBody"}>
                    <label className="mr-2 resize-none font-bold text-lg text-secondary">
                        {props.section}
                        <span>&nbsp;&nbsp;</span>
                        {title().title}
                        <span>&nbsp;</span>
                        <label className="font-medium text-lg">{`(${title().label})`}</label>
                    </label>
                </CardBody>
            </Card>
        </div>
    )
}

// Export Label.jsx
export default Label;