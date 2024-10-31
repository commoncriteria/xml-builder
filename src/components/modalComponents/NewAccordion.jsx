// Imports
import React, {useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {CREATE_ACCORDION} from "../../reducers/accordionPaneSlice.js";
import Modal from "./Modal.jsx";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";

/**
 * The NewAccordion class that displays the option to add a new accordion using a modal
 * @returns {JSX.Element}   the new accordion modal content
 * @constructor             passes in props to the class
 */
function NewAccordion(props) {
    // Prop Validation
    NewAccordion.propTypes = {
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired
    };

    // Constants
    let [disabled, setDisabled] = React.useState(true)
    let [sectionName, setSectionName] = React.useState('')
    let [selectedSection, setSelectedSection] = React.useState('')
    let [sections, setSections] = React.useState([])
    const dispatch = useDispatch();
    const accordions = useSelector((state) => state.accordionPane.sections);
    const previousAccordions = usePrevious(accordions)

    // Use Effects
    useEffect(() => {
        setSections(getAccordionTitles)
        setDisabled(isSubmitDisabled)
    }, [props]);

    useEffect(() => {
        setDisabled(isSubmitDisabled)
    }, [sectionName, selectedSection])

    useEffect(() => {
        try {
            // Scrolls to the new section if a new one was created
            if (typeof previousAccordions === 'object' && typeof accordions === 'object') {
                if (Object.keys(previousAccordions).length === (Object.keys(accordions).length - 1)) {
                    if (Object.keys(previousAccordions).length === (Object.keys(accordions).length - 1)) {
                        let difference = Object.keys(accordions).filter(x => !previousAccordions[x]);
                        let item = difference[0]
                        let key = Object.keys(accordions).findIndex((value) => value === item)
                        if (key !== -1) {
                            let value = accordions[item]
                            let id = value.title + item + "Accordion"
                            const scrollTo = document.getElementById(id).getBoundingClientRect().top + window.scrollY - 110
                            window.scrollTo(0, scrollTo);
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
    }, [accordions]);

    // Methods
    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        },[value]);
        return ref.current;
    }
    const handleSubmit = async () => {
        // Add accordion according to type
        if (!disabled) {
            // Create the accordion
            {{await dispatch(CREATE_ACCORDION({title: sectionName, selected_section: selectedSection}))}}
            // Reset the state to default values
            resetState()
            // Close the dialog
            props.handleOpen()
        }
    }
    const handleSectionName = (event) => {
        setSectionName(event.target.value)
    }
    const handleSelectedSection = (event) => {
        setSelectedSection(event.target.value)
    }
    const getAccordionTitles = () => {
        let titles = []
        Object.values(accordions).map((value) => {
            if (!value.title.toLowerCase().includes("appendix")) {
                titles.push(value.title)
            }
        })
        return titles
    }
    const resetState = () => {
        setDisabled(true)
        setSectionName("")
        setSelectedSection("")
    }
    const isSubmitDisabled = () => {
        return (
            selectedSection === null || selectedSection === undefined || selectedSection === "" ||
            sectionName === null || sectionName === undefined || sectionName === "" ||
            !sections.includes(selectedSection) || sections.includes(sectionName)
        )
    }

    // Return Method
    return (
        <div>
            <Modal title={"Create New Section"}
                   content={(
                       <div className="w-[350px] px-1">
                           <div className="pt-4">
                               <FormControl fullWidth >
                                   <TextField required
                                              id="outlined-required"
                                              label="Section Name"
                                              key={sectionName}
                                              defaultValue={sectionName}
                                              onBlur={handleSectionName}
                                              inputProps={{style: {fontSize: 14}}}
                                              InputLabelProps={{style: {fontSize: 14}}}
                                   />
                               </FormControl>
                           </div>
                           <div className="pt-6">
                               <FormControl fullWidth required>
                                   <InputLabel sx={{ fontSize: '14px' }} id="demo-simple-select-label">Place Section After</InputLabel>
                                   <Select
                                       value={selectedSection}
                                       label="Place Section After"
                                       onChange={handleSelectedSection}
                                       sx = {{textAlign: "left", fontSize: 14}}
                                   >
                                       {
                                           Object.keys(accordions).map((key) => {
                                               let title = accordions[key].title
                                               if (!title.toLowerCase().includes("appendix")) {
                                                   return (
                                                       <MenuItem key={key} value={title}>{title}</MenuItem>
                                                   )
                                               }
                                            })
                                       }
                                   </Select>
                               </FormControl>
                           </div>
                       </div>
                   )}
                   open={props.open}
                   handleOpen={() => {
                       props.handleOpen()
                       resetState()
                   }}
                   handleSubmit={handleSubmit}
                   disabled={disabled}
            />
        </div>
    );
}

// Export NewAccordion.jsx
export default NewAccordion;