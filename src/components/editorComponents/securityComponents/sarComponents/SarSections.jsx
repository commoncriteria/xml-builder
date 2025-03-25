// Imports
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import { DELETE_SAR_COMPONENT } from "../../../../reducers/sarsSlice.js";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import SarWorksheet from "./SarWorksheet.jsx";
import '../../components.css';
import SecurityComponents from "../../../../utils/securityComponents.jsx";

/**
 * The SarSections component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function SarSections(props) {
    // Prop Validation
    SarSections.propTypes = {
        accordionUUID: PropTypes.string.isRequired,
        sarUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        value: PropTypes.object.isRequired,
        newSarComponent: PropTypes.string,
        handleNewSarComponent: PropTypes.func,
    }

    // Constants
    const { handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch();
    const { primary, icons } = useSelector((state) => state.styling);
    const [openSarWorksheet, setOpenSarWorksheet] = useState(false)

    // Use Effects
    useEffect(() => {
        if (props.newSarComponent && props.newSarComponent !== "" && props.newSarComponent === props.componentUUID) {
            setOpenSarWorksheet(true)
        }
    }, [props]);

    // Methods
    const deleteComponent = async () => {
        dispatch(DELETE_SAR_COMPONENT({sarUUID: props.sarUUID, componentUUID: props.componentUUID}))

        // Update snackbar
        handleSnackBarSuccess("SAR Component Successfully Deleted")
    }
    const handleOpenSarWorksheet = () => {
        if (props.newSarComponent && props.newSarComponent !== "" && props.newSarComponent === props.componentUUID) {
            if (!openSarWorksheet === false) {
                props.handleNewSarComponent("")
            }
            setOpenSarWorksheet(!openSarWorksheet)
        } else {
            setOpenSarWorksheet(!openSarWorksheet)
        }
    }

    // Return Method
    return (
        <div className="p-1 pb-3" key={props.componentUUID + + "SarSection"} >
            <Card className="border-2 border-gray-300"  key={props.componentUUID + "SarSectionCard"} >
                <CardBody key={props.componentUUID + "CardBody"}>
                    <div className="flex mb-[-15px] mt-[-5px]" key={props.componentUUID + "CardBodyDiv"}>
                        <IconButton sx={{marginTop: "-12px"}} onClick={() => {setOpenSarWorksheet(true)}} variant="contained">
                            <Tooltip title={"Edit SAR Worksheet"} id={"editSarWorksheetTooltip" + props.componentUUID}>
                                <AutoFixHighIcon htmlColor={ primary } sx={ icons.xSmall }/>
                            </Tooltip>
                        </IconButton>
                        <h1 className="w-full resize-none font-bold text-[13px] mt-2 ml-1 mb-0 h-[24px] p-0 text-secondary"
                            key={props.componentUUID + "SARComponentAccordionTitle"}>{`${props.value.ccID.toUpperCase()} ${props.value.name} `}
                        </h1>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={deleteComponent} variant="contained">
                            <Tooltip title={"Delete Component"} id={"deleteComponentTooltip" + props.componentUUID}>
                                <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.large }/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                    </div>
                </CardBody>
            </Card>
            {
                openSarWorksheet ?
                    <SarWorksheet sarUUID={props.sarUUID}
                                  componentUUID={props.componentUUID}
                                  value={props.value}
                                  open={openSarWorksheet}
                                  handleOpen={handleOpenSarWorksheet}/>
                    :
                    null
            }
        </div>
    )
}

// Export SarSections.jsx
export default SarSections;