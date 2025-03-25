// Imports
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import { COLLAPSE_TERMS_LIST, CREATE_TERM_ITEM, DELETE_TERMS_LIST, UPDATE_TERMS_LIST_TITLE } from '../../reducers/termsSlice.js'
import { DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import Term from './Term';
import './components.css';
import SecurityComponents from "../../utils/securityComponents.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";

/**
 * The Terms component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function Terms(props) {
    // Prop Validation
    Terms.propTypes = {
        uuid: PropTypes.string.isRequired,
        accordionUUID: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        section: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        titleTooltip: PropTypes.string
    }

    // Constants
    const { handleSnackBarSuccess } = SecurityComponents
    const dispatch = useDispatch()
    const termSections = useSelector((state) => state.terms);
    const { primary, secondary, icons } = useSelector((state) => state.styling);
    const [openDeleteDialog, setDeleteDialog] = useState(false);

    // Methods
    const updateTermsListTitle = async (event) => {
        {dispatch(UPDATE_TERMS_LIST_TITLE({title: props.title, uuid: props.uuid, newTitle: event.target.value}))}
    }
    const addHandler = async () => {
        {dispatch(CREATE_TERM_ITEM({termUUID: props.uuid}))}

        // Update snackbar
        handleSnackBarSuccess("New Term Successfully Added")
    }
    const deleteTermsList = async() => {
        await dispatch(DELETE_ACCORDION_FORM_ITEM({accordionUUID: props.accordionUUID, uuid: props.uuid}))
        await dispatch(DELETE_TERMS_LIST({title: props.title, uuid: props.uuid}))

        // Update snackbar
        handleSnackBarSuccess("Terms List Section Successfully Deleted")
    }
    const collapseHandler = () => {
        dispatch(COLLAPSE_TERMS_LIST({uuid: props.uuid, title: props.title}))
    }

    // Return Method
    return (
        <div className="min-w-full mb-2" key={props.uuid + "Div"}>
            <Card className="h-full w-full rounded-lg border-2 border-gray-300">
                <CardBody className="mb-0 rounded-b-none" key={props.uuid + "CardBody"}>
                    <div className="flex">
                        <label className="mr-2 resize-none font-bold text-[14px] text-secondary">{props.section}</label>
                        <span/>
                        <Tooltip title={props.titleTooltip ? props.titleTooltip : ""} id={props.uuid + props.titleTooltip} arrow
                                 disableHoverListener={!props.titleTooltip}>
                            <textarea className="w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary"
                                      onChange={updateTermsListTitle} value={props.title}>{props.title}</textarea>
                        </Tooltip>
                        <span/>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={() => setDeleteDialog(!openDeleteDialog)} variant="contained">
                            <Tooltip title={"Delete Section"} id={props.uuid + "deleteSectionButton"}>
                                <DeleteForeverRoundedIcon htmlColor={ primary } sx={ icons.large }/>
                            </Tooltip>
                        </IconButton>
                        <span/>
                        <IconButton sx={{marginTop: "-8px"}} onClick={collapseHandler} variant="contained">
                            <Tooltip title={`${props.open ? "Collapse " : "Expand "} Terms List`} id={(props.open ? "collapse" : "expand") + props.uuid + "TermsListTooltip"}>
                                {
                                    props.open ?
                                        <RemoveIcon htmlColor={ primary } sx={ icons.large }/>
                                        :
                                        <AddIcon htmlColor={ primary } sx={ icons.large }/>
                                }
                            </Tooltip>
                        </IconButton>
                    </div>
                </CardBody>
                   {
                       props.open ?
                           <div>
                               <div className="px-1">
                                   {
                                       (Object.entries(termSections[props.uuid]) && Object.entries(termSections[props.uuid]).length >= 1) ?
                                           <CardFooter className="min-w-full m-0 p-0 rounded-b-none border-b-2 border-gray-200 mt-[-18px]">
                                               {Object.entries(termSections[props.uuid]).map(([key, value], index) => {
                                                   if (key !== "title" && key !== "open"  && key !== "xmlTagMeta") {
                                                       return (<Term key={props.uuid + "-" + key} index={index} accordionUUID={props.accordionUUID}
                                                                     termUUID={props.uuid} uuid={key} title={value.title} open={value.open}
                                                                     definition={value.definition}/>)
                                                   } else {
                                                       return null
                                                   }
                                               })}
                                           </CardFooter>
                                           :
                                           null
                                   }
                               </div>
                               <div className="flex flex-col items-center h-18 mt-2 mb-3">
                                   <IconButton onClick={addHandler} variant="contained">
                                       <Tooltip title={"Add Term"}  id={props.uuid + "addTermToolTip"}>
                                           <AddCircleRoundedIcon htmlColor={ secondary } sx={ icons.large }/>
                                       </Tooltip>
                                   </IconButton>
                               </div>
                           </div>
                           :
                           <div className="m-0 p-0 mt-[-15px]"/>
                   }
            </Card>
            <DeleteConfirmation
                title={props.title}
                open={openDeleteDialog}
                handleOpen={() => setDeleteDialog(!openDeleteDialog)}
                handleSubmit={deleteTermsList}
            />
        </div>
    )
}

// Export Terms.jsx
export default Terms;