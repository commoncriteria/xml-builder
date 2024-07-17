// Imports
import React from "react";
import PropTypes from "prop-types";
import {Card, CardBody, CardFooter} from "@material-tailwind/react";
import {IconButton, Tooltip} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

/**
 * The SfrCard class that displays the generic card component for sfrs, differentiated between parent and section
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function SfrCard(props) {
    // Prop Validation
    SfrCard.propTypes = {
        type: PropTypes.string.isRequired,
        header: PropTypes.node,
        body: PropTypes.node,
        footer: PropTypes.node,
        title: PropTypes.string,
        tooltip: PropTypes.string,
        collapse: PropTypes.bool,
        collapseHandler: PropTypes.func,
    };

    // Constants
    const style = {primary: "#d926a9"}

    // Return Method
    return (
        <div>
            {
                props.type === "parent" ?
                    <Card className="w-full rounded-lg border-2 border-gray-300 mb-4">
                        <CardBody className="w-full m-0 p-0">
                            <div className="w-full border-b-2 border-b-gray-300 p-2 pt-4 grid grid-flow-col auto-cols-max gap-4">
                                <div className="w-full justify-items-start">
                                    <IconButton sx={{marginTop: "-8px"}} onClick={props.collapseHandler} key={props.tooltip + "ToolTip"}>
                                        <Tooltip title={`${(props.collapse ? "Collapse " : "Expand ") + props.tooltip}`}>
                                            {
                                                props.collapse ?
                                                    <RemoveIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                                    :
                                                    <AddIcon htmlColor={style.primary} sx={{ width: 32, height: 32 }}/>
                                            }
                                        </Tooltip>
                                    </IconButton>
                                </div>
                                <div className="w-full justify-items-center">
                                    <label className="resize-none font-bold text-[20px] p-0 pr-4 text-secondary">{props.title}</label>
                                </div>
                            </div>
                            {
                                props.collapse ?
                                    <div className="pb-2">
                                        {props.body}
                                    </div>
                                    :
                                    null
                            }
                        </CardBody>
                        {
                            props.collapse && props.footer ?
                                <CardFooter className="w-full m-0 p-0">
                                   {props.footer}
                                </CardFooter>
                                :
                                null
                        }
                    </Card>
                    :
                    <div className="w-full px-4 py-2">
                        <Card className="w-full rounded-lg border-2 border-gray-200">
                            <CardBody className="w-full m-0 p-0 py-4 border-b-2 border-gray-200">
                                {props.header}
                            </CardBody>
                            {
                                props.body !== null ?
                                    <CardFooter className="w-full m-0 p-4 pb-2">
                                        {props.body}
                                    </CardFooter>
                                    :
                                    null
                            }
                        </Card>
                    </div>
            }
        </div>
    );
}

// Export SfrCard.jsx
export default SfrCard;