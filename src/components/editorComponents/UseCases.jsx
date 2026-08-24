// Imports
import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import { COLLAPSE_TERMS_LIST, CREATE_TERM_ITEM, DELETE_TERMS_LIST, UPDATE_USE_CASE_INTRO } from "../../reducers/termsSlice.js";
import { DELETE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import { handleSnackBarSuccess } from "../../utils/securityComponents.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";
import Term from "./Term.jsx";
import TipTapEditor from "./TipTapEditor.jsx";
import "./components.css";

/**
 * The Terms component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function UseCases(props) {
  // Prop Validation
  UseCases.propTypes = {
    uuid: PropTypes.string.isRequired,
    accordionUUID: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const termSections = useSelector((state) => state.terms);
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const [openDeleteDialog, setDeleteDialog] = useState(false);

  const useCaseData = termSections[props.uuid];
  const { title, useCaseIntro = "", open } = useCaseData;

  // Methods
  const handleDefinitionUpdate = (value) => {
    dispatch(UPDATE_USE_CASE_INTRO({ uuid: props.uuid, newIntro: value }));
  };

  const handleAdd = () => {
    dispatch(CREATE_TERM_ITEM({ termUUID: props.uuid }));
    handleSnackBarSuccess("Use Case Successfully Added");
  };

  const handleDelete = async () => {
    await dispatch(DELETE_ACCORDION_FORM_ITEM({ accordionUUID: props.accordionUUID, uuid: props.uuid }));
    await dispatch(DELETE_TERMS_LIST({ title, uuid: props.uuid }));
    handleSnackBarSuccess("Use Cases Section Successfully Deleted");
  };

  const handleCollapse = () => {
    dispatch(COLLAPSE_TERMS_LIST({ uuid: props.uuid, title }));
  };

  const termEntries = Object.entries(useCaseData).filter(
    ([key]) => key !== "title" && key !== "open" && key !== "useCaseIntro" && key !== "xmlTagMeta" && key !== "custom"
  );

  // Return Method
  return (
    <div className='min-w-full mb-2' key={props.uuid + "Div"}>
      <Card className='h-full w-full rounded-lg border-2 border-gray-300'>
        <CardBody className='mb-0 rounded-b-none' key={props.uuid + "CardBody"}>
          <div className='flex'>
            <label className='mr-2 resize-none font-bold text-[14px] text-secondary'>{props.section}</label>
            <span />
            <textarea className='w-full resize-none font-bold text-[14px] mb-0 h-[30px] p-0 text-secondary' value={title} readOnly />
            <span />
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
              <Tooltip title={"Delete Section"} id={props.uuid + "deleteSectionButton"}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapse} variant='contained'>
              <Tooltip
                key={open ? "open" : "closed"}
                title={`${open ? "Collapse" : "Expand"} Use Cases`}
                id={(open ? "collapse" : "expand") + props.uuid + "UseCasesTooltip"}>
                {open ? <RemoveIcon htmlColor={primary} sx={icons.large} /> : <AddIcon htmlColor={primary} sx={icons.large} />}
              </Tooltip>
            </IconButton>
          </div>
        </CardBody>
        {open ? (
          <CardFooter className='min-w-full m-0 p-0 rounded-b-none border-b-2 border-gray-200 mt-[-20px] rounded-lg'>
            {/* RTE intro */}
            <div className='mx-5 mt-2 mb-3 p-1'>
              <TipTapEditor className='w-full' uuid={props.uuid} text={useCaseIntro} contentType={"term"} handleTextUpdate={handleDefinitionUpdate} />
            </div>
            {/* Term cards */}
            {termEntries.length > 0 && (
              <div className='min-w-full m-0 p-0'>
                {termEntries.map(([key, value], index) => (
                  <Term
                    key={props.uuid + "-" + key}
                    index={index}
                    accordionUUID={props.accordionUUID}
                    termUUID={props.uuid}
                    uuid={key}
                    title={value.title}
                    abbr={value.abbr}
                    open={value.open}
                    definition={value.definition}
                    hideAbbreviation={true}
                    showSfrDropdown={true}
                    useCaseConfigIds={value.useCaseConfig}
                  />
                ))}
              </div>
            )}
            {/* Add button */}
            <div className='flex flex-col items-center h-18 mt-2 mb-3 border-t-2 border-gray-300 pt-2'>
              <IconButton onClick={handleAdd} variant='contained'>
                <Tooltip title={"Add Use Case"} id={props.uuid + "addUseCaseTooltip"}>
                  <AddCircleRoundedIcon htmlColor={secondary} sx={icons.large} />
                </Tooltip>
              </IconButton>
            </div>
          </CardFooter>
        ) : (
          <div className='m-0 p-0 mt-[-15px]' />
        )}
      </Card>
      <DeleteConfirmation title={title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={handleDelete} />
    </div>
  );
}

// Export UseCases.jsx
export default UseCases;
