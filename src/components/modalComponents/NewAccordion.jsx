// Imports
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { CREATE_ACCORDION, CREATE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import { handleSnackBarError, handleSnackBarSuccess, handleSnackbarTextUpdates } from "../../utils/securityComponents.jsx";
import Modal from "./Modal.jsx";
import { CREATE_EDITOR } from "../../reducers/editorSlice.js";

/**
 * The NewAccordion class that displays the option to add a new accordion using a modal
 * @returns {JSX.Element}   the new accordion modal content
 * @constructor             passes in props to the class
 */
function NewAccordion(props) {
  // Prop Validation
  NewAccordion.propTypes = {
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
  };

  // Constants
  let [disabled, setDisabled] = React.useState(true);
  let [sectionName, setSectionName] = React.useState("");
  let [selectedSection, setSelectedSection] = React.useState("");
  let [sections, setSections] = React.useState([]);
  const dispatch = useDispatch();
  const accordions = useSelector((state) => state.accordionPane.sections);
  const previousAccordions = usePrevious(accordions);
  const accordionArray = Object.entries(accordions).map(([id, data]) => ({
    id,
    title: data.title,
  }));
  const conformanceIndex = accordionArray.findIndex(({ title }) => title.toLowerCase() === "conformance claims");
  const appendixCIndex = accordionArray.findIndex(({ title }) => title.toLowerCase().includes("appendix c"));

  // Use Effects
  useEffect(() => {
    setSections(getAccordionTitles);
    setDisabled(isSubmitDisabled);
  }, [props]);

  useEffect(() => {
    setDisabled(isSubmitDisabled);
  }, [sectionName, selectedSection]);

  useEffect(() => {
    try {
      // Scrolls to the new section if a new one was created
      if (typeof previousAccordions === "object" && typeof accordions === "object") {
        if (Object.keys(previousAccordions).length === Object.keys(accordions).length - 1) {
          if (Object.keys(previousAccordions).length === Object.keys(accordions).length - 1) {
            let difference = Object.keys(accordions).filter((x) => !previousAccordions[x]);
            let item = difference[0];
            let key = Object.keys(accordions).findIndex((value) => value === item);
            if (key !== -1) {
              let value = accordions[item];
              let id = value.title + item + "Accordion";
              const scrollTo = document.getElementById(id).getBoundingClientRect().top + window.scrollY - 110;
              window.scrollTo(0, scrollTo);
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  }, [accordions]);

  // Methods
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }
  const handleSubmit = async () => {
    // Add accordion according to type
    if (!disabled) {
      // Create the accordion
      const insertIndex = accordionArray.findIndex(({ title }) => title === selectedSection) + 1;
      const isAppendix = insertIndex > appendixCIndex;
      {
        {
          const editorUUID = await dispatch(CREATE_EDITOR({ title: sectionName })).payload;
          await dispatch(CREATE_ACCORDION({ title: sectionName, selected_section: selectedSection, custom: editorUUID, isAppendix: isAppendix })).payload.uuid;
        }
      }
      // Reset the state to default values
      resetState();
      // Close the dialog
      props.handleOpen();

      // Update snackbar
      handleSnackBarSuccess("New Section Successfully Added");
    }
  };
  const handleSectionName = (event) => {
    setSectionName(event.target.value);
  };
  const handleSelectedSection = (event) => {
    setSelectedSection(event.target.value);
  };
  const getAccordionTitles = () => accordionArray.map(({ title }) => title);
  const resetState = () => {
    setDisabled(true);
    setSectionName("");
    setSelectedSection("");
  };
  const isSubmitDisabled = () => {
    return (
      selectedSection === null ||
      selectedSection === undefined ||
      selectedSection === "" ||
      sectionName === null ||
      sectionName === undefined ||
      sectionName === "" ||
      !sections.includes(selectedSection) ||
      sections.includes(sectionName)
    );
  };

  // Return Method
  return (
    <div>
      <Modal
        title={"Create New Section"}
        content={
          <div className='w-[350px] px-1'>
            <div className='pt-4'>
              <FormControl fullWidth>
                <TextField
                  required
                  id='outlined-required'
                  label='Section Name'
                  key={sectionName}
                  defaultValue={sectionName}
                  onBlur={(event) => handleSnackbarTextUpdates(handleSectionName, event)}
                  inputProps={{ style: { fontSize: 14 } }}
                  InputLabelProps={{ style: { fontSize: 14 } }}
                />
              </FormControl>
            </div>
            <div className='pt-6'>
              <FormControl fullWidth required>
                <InputLabel sx={{ fontSize: "14px" }} id='demo-simple-select-label'>
                  Place Section After
                </InputLabel>
                <Select value={selectedSection} label='Place Section After' onChange={handleSelectedSection} sx={{ textAlign: "left", fontSize: 14 }}>
                  {accordionArray.map(({ id, title }, index) => {
                    // custom sections only allowed before Conformance Claims or after Appendix C
                    const isValidInsertPosition = (conformanceIndex !== -1 && index < conformanceIndex) || (appendixCIndex !== -1 && index >= appendixCIndex);
                    return isValidInsertPosition ? (
                      <MenuItem key={id} value={title}>
                        {title}
                      </MenuItem>
                    ) : null;
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
        }
        open={props.open}
        handleOpen={() => {
          props.handleOpen();
          resetState();
        }}
        handleSubmit={handleSubmit}
        disabled={disabled}
      />
    </div>
  );
}

// Export NewAccordion.jsx
export default NewAccordion;
