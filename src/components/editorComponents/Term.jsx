// Imports
import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  COLLAPSE_TERM_ITEM,
  DELETE_TERM_ITEM,
  UPDATE_TERM_DEFINITION,
  UPDATE_TERM_TITLE,
  UPDATE_TERM_ABBR,
  UPDATE_USE_CASE_CONFIG,
} from "../../reducers/termsSlice.js";
import { GET_ALL_XML_IDS } from "../../reducers/SFRs/sfrSectionSlice.js";
import { IconButton, Tooltip, TextField, Autocomplete } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import { handleSnackBarSuccess } from "../../utils/securityComponents.jsx";
import TipTapEditor from "./TipTapEditor.jsx";
import DeleteConfirmation from "../modalComponents/DeleteConfirmation.jsx";
import "./components.css";

/**
 * The Term component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function Term(props) {
  // Prop Validation
  Term.propTypes = {
    accordionUUID: PropTypes.string.isRequired,
    termUUID: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    abbr: PropTypes.string.isRequired,
    definition: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    hideAbbreviation: PropTypes.bool,
    showSfrDropdown: PropTypes.bool,
    useCaseConfigIds: PropTypes.array,
  };

  // Constants
  const dispatch = useDispatch();
  const { secondary, icons } = useSelector((state) => state.styling);
  const sfrSections = useSelector((state) => state.sfrSections);
  const [openDeleteDialog, setDeleteDialog] = useState(false);

  const [titleDraft, setTitleDraft] = useState(props.title);
  useEffect(() => setTitleDraft(props.title), [props.title]);

  const [abbrDraft, setAbbrDraft] = useState(props.abbr);
  useEffect(() => setAbbrDraft(props.abbr), [props.abbr]);

  const [xmlIdOptions, setXmlIdOptions] = useState([]);

  // load xml_id's for the autocomplete
  useEffect(() => {
    const { payload } = dispatch(GET_ALL_XML_IDS());
    setXmlIdOptions(Array.isArray(payload) ? payload : []);
  }, [sfrSections]);

  // Methods
  const updateTermDefinition = (event) => {
    dispatch(UPDATE_TERM_DEFINITION({ title: props.title, termUUID: props.termUUID, uuid: props.uuid, newDefinition: event }));
  };
  const updateUseCaseConfig = (event) => {
    dispatch(UPDATE_USE_CASE_CONFIG({ termUUID: props.termUUID, uuid: props.uuid, newUseCaseConfig: event }));
  };
  const deleteTerm = () => {
    {
      dispatch(DELETE_TERM_ITEM({ title: props.title, termUUID: props.termUUID, uuid: props.uuid }));
    }

    // Update snackbar
    handleSnackBarSuccess("Term Successfully Deleted");
  };
  const collapseHandler = () => {
    {
      dispatch(COLLAPSE_TERM_ITEM({ termUUID: props.termUUID, uuid: props.uuid, title: props.title }));
    }
  };

  // Use Memos
  /**
   * The definition editor section
   * @type {Element}
   */
  const DefinitionEditor = useMemo(() => {
    return (
      <TipTapEditor
        className='w-full'
        uuid={props.uuid}
        text={props.definition ? props.definition : ""}
        contentType={"term"}
        handleTextUpdate={updateTermDefinition}
      />
    );
  }, [props.definition, props.uuid]);

  // Return Method
  return (
    <div className='mx-5 mt-0 mb-3 border-2 rounded-lg border-gray-300 bg-gray-40' key={props.uuid + "Div"}>
      <table className='w-full border-0'>
        <tbody>
          <tr>
            <th scope='row' className={`py-2 whitespace-normal justify-left ${props.open ? "w-[30%]" : "w-[85%]"}`}>
              <div id={props.uuid} className='ml-1'>
                <TextField
                  fullWidth
                  rows={!props.open ? 1 : undefined}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={() =>
                    dispatch(
                      UPDATE_TERM_TITLE({
                        title: props.title, // (see note below)
                        termUUID: props.termUUID,
                        uuid: props.uuid,
                        newTitle: titleDraft,
                      })
                    )
                  }
                  variant='outlined'
                  label='Full Name'
                  sx={{ mb: 2 }}
                />
                {props.showSfrDropdown && (
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    id='tags-standard'
                    options={xmlIdOptions}
                    value={props.useCaseConfigIds}
                    onChange={(e, newValue) => updateUseCaseConfig(newValue)}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => <TextField {...params} label='SFRs related to this Use Case' />}
                    ListboxProps={{
                      sx: {
                        "& .MuiAutocomplete-option[aria-selected='true']": {
                          backgroundColor: "rgba(17, 27, 227, 0.25)",
                        },
                      },
                    }}
                  />
                )}
                {!props.hideAbbreviation && (
                  <TextField
                    fullWidth
                    value={abbrDraft}
                    onChange={(e) => setAbbrDraft(e.target.value)}
                    onBlur={() =>
                      dispatch(
                        UPDATE_TERM_ABBR({
                          title: props.title,
                          termUUID: props.termUUID,
                          uuid: props.uuid,
                          newAbbr: abbrDraft,
                        })
                      )
                    }
                    variant='outlined'
                    label='Abbreviation'
                  />
                )}
              </div>
            </th>
            {props.open && <td className='py-2 px-2 justify-center align-middle w-[55%]'>{DefinitionEditor}</td>}
            <td className='pr-6 px-0 text-end align-middle w-[15%]'>
              <div className='mb-2'>
                <IconButton onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
                  <Tooltip title={"Delete Term"} id={props.uuid + "deleteTermTooltip"}>
                    <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.large} />
                  </Tooltip>
                </IconButton>
                <span />
                <IconButton onClick={collapseHandler} variant='contained'>
                  <Tooltip
                    key={props.open ? "open" : "closed"}
                    title={`${props.open ? "Collapse " : "Expand "} Term`}
                    id={(props.open ? "collapse" : "expand") + props.uuid + "TermTooltip"}>
                    {props.open ? <RemoveIcon htmlColor={secondary} sx={icons.large} /> : <AddIcon htmlColor={secondary} sx={icons.large} />}
                  </Tooltip>
                </IconButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <DeleteConfirmation title={props.title} open={openDeleteDialog} handleOpen={() => setDeleteDialog(!openDeleteDialog)} handleSubmit={deleteTerm} />
    </div>
  );
}

// Export Term.jsx
export default Term;
