// Imports
import PropTypes from "prop-types";
import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { FormControl, IconButton, Input, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { CREATE_EDITOR } from "../../reducers/editorSlice.js";
import { CREATE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import { CREATE_SFR_BASE_PP_SECTION } from "../../reducers/SFRs/sfrBasePPsSlice.js";
import { CREATE_TERM_ITEM, CREATE_TERMS_LIST } from "../../reducers/termsSlice.js";
import { CREATE_THREAT_SECTION } from "../../reducers/threatsSlice.js";
import { CREATE_OBJECTIVE_SECTION } from "../../reducers/objectivesSlice.js";
import { handleSnackBarSuccess } from "../../utils/securityComponents.jsx";
import AccordionItem from "./AccordionItem.jsx";

/**
 * The AccordionSection component
 * @param uuid the uuid of the accordion section
 * @param index the index of the accordion section used for the header
 * @returns {Element}
 * @constructor
 */
function AccordionSection({ uuid, index }) {
  // Prop Validation
  AccordionSection.propTypes = {
    uuid: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const { ppTemplateVersion, ppType } = useSelector((state) => state.accordionPane.metadata);
  const { secondary, icons } = useSelector((state) => state.styling);
  const accordions = useSelector((state) => state.accordionPane.sections);
  let [selectedType, setSelectedType] = React.useState("");
  let [selectedName, setSelectedName] = React.useState("");
  let [disabled, setDisabled] = React.useState(true);

  // UseEffects
  useEffect(() => {
    setDisabled(handlesNewAccordionDisabled(selectedType, selectedName));
  }, [selectedType, selectedName]);

  // Methods
  /**
   * Handles the selected accordion type
   * @param event the event as a DOM handler
   */
  const handleSelectedAccordionType = (event) => {
    setSelectedType(event.target.value);
  };
  /**
   * Handles the selected accordion name
   * @param event the event as a DOM handler
   */
  const handleSelectedAccordionName = (event) => {
    setSelectedName(event.target.value);
  };
  /**
   * Handles the new accordion disabled
   * @param selectedType the selected type
   * @param selectedName the selected name
   * @returns {boolean}
   */
  const handlesNewAccordionDisabled = (selectedType, selectedName) => {
    let type = selectedType.valueOf();
    let name = selectedName.valueOf();

    return (
      (type !== "Assumptions" &&
        type !== "Objectives" &&
        type !== "Text Editor" &&
        type !== "Threats" &&
        type !== "Terms" &&
        type !== "SFRs" &&
        type !== "SARs" &&
        type !== "Base PP") ||
      name === null ||
      name === "" ||
      name === undefined
    );
  };
  /**
   * Handles new accordion section
   */
  const handleNewAccordionSection = () => {
    if (!disabled) {
      let type = selectedType.valueOf();
      let name = selectedName.valueOf();

      switch (type) {
        case "Terms": {
          let termUUID = dispatch(
            CREATE_TERMS_LIST({
              title: name,
            })
          ).payload;

          if (termUUID) {
            dispatch(
              CREATE_TERM_ITEM({
                termUUID: termUUID,
              })
            );
            dispatch(
              CREATE_ACCORDION_FORM_ITEM({
                accordionUUID: uuid,
                uuid: termUUID,
                contentType: "terms",
              })
            );
          }
          break;
        }
        case "Text Editor":
        case "SARs":
        case "SFRs": {
          let editorUUID = dispatch(
            CREATE_EDITOR({
              title: name,
            })
          ).payload;

          if (editorUUID) {
            dispatch(
              CREATE_ACCORDION_FORM_ITEM({
                accordionUUID: uuid,
                uuid: editorUUID,
                contentType: "editor",
              })
            );
          }
          break;
        }
        case "Base PP": {
          let baseSfrUUID = dispatch(
            CREATE_SFR_BASE_PP_SECTION({
              title: name,
            })
          ).payload;

          if (baseSfrUUID) {
            dispatch(
              CREATE_ACCORDION_FORM_ITEM({
                accordionUUID: uuid,
                uuid: baseSfrUUID,
                contentType: "sfrBasePPs",
              })
            );
          }
          break;
        }
        case "Threats":
        case "Assumptions": {
          let threatUUID = dispatch(
            CREATE_THREAT_SECTION({
              title: name,
            })
          ).payload;

          if (threatUUID) {
            dispatch(
              CREATE_ACCORDION_FORM_ITEM({
                accordionUUID: uuid,
                uuid: threatUUID,
                contentType: "threats",
              })
            );
          }
          break;
        }
        case "Objectives": {
          let objectiveUUID = dispatch(
            CREATE_OBJECTIVE_SECTION({
              title: name,
            })
          ).payload;

          if (objectiveUUID) {
            dispatch(
              CREATE_ACCORDION_FORM_ITEM({
                accordionUUID: uuid,
                uuid: objectiveUUID,
                contentType: "objectives",
              })
            );
          }
          break;
        }
        default:
          break;
      }
      // Reset type and name to default
      setSelectedType("");
      setSelectedName("");

      // Update snackbar
      handleSnackBarSuccess(`New ${type} Section Successfully Added`);
    }
  };

  // Components
  /**
   * Gets the select menu options
   * @returns {unknown[]}
   * @constructor
   */
  const getSelectMenuOptions = () => {
    const title = accordions.hasOwnProperty(uuid) && accordions[uuid].hasOwnProperty("title") ? accordions[uuid].title : "";
    let selectMenuOptions = [
      { key: "terms", value: "Terms" },
      { key: "editor", value: "Text Editor" },
    ];

    // Generate select menu options
    switch (title) {
      case "Security Problem Definition": {
        selectMenuOptions.push({ key: "assumptions", value: "Assumptions" });
        selectMenuOptions.push({ key: "threats", value: "Threats" });
        break;
      }
      case "Security Objectives": {
        selectMenuOptions.push({ key: "objectives", value: "Objectives" });
        break;
      }
      case "Security Requirements": {
        if (ppType === "Protection Profile") {
          selectMenuOptions.push({ key: "sars", value: "SARs" });
        }
        if (ppType !== "Module") {
          selectMenuOptions.push({ key: "sfrs", value: "SFRs" });
        }
        if (ppType === "Module") {
          selectMenuOptions.push({ key: "sfrBasePPs", value: "Base PP" });
        }
        break;
      }
      default:
        break;
    }

    // Sort menu options
    selectMenuOptions.sort((a, b) => a.value.localeCompare(b.value, undefined, { sensitivity: "base" }));

    // Return the select menu options
    return selectMenuOptions.map((option) => (
      <MenuItem key={option.key} value={option.value}>
        {option.value}
      </MenuItem>
    ));
  };

  // Helper Methods
  /**
   * Gets is add section (boolean)
   * @returns {boolean}
   */
  const getIsAddSection = () => {
    return (
      !accordions[uuid].title.toString().toLowerCase().includes("appendix") &&
      ppTemplateVersion !== "Version 3.1" &&
      !accordions[uuid].title.toString().toLowerCase().includes("conformance claims")
    );
  };

  // Use Memos
  /**
   * The SelectMenuOptions component
   * @type {*[]}
   */
  const SelectMenuOptions = useMemo(() => {
    return getSelectMenuOptions();
  }, [accordions, uuid, ppType]);

  // Return Method
  return (
    <div className='min-w-full'>
      {Object.entries(accordions[uuid]) && Object.entries(accordions[uuid]).length >= 1 && (
        <div>
          <div className='min-w-full px-4 border-gray-300' key={uuid + "-AccordionItem"}>
            <dl className='min-w-full justify-items-center' key={uuid + "-AccordionItemDL"}>
              {accordions[uuid].formItems &&
                Object.entries(accordions[uuid].formItems).map(([key, value], arrayIndex) => {
                  const { uuid: innerUUID, contentType, formItems } = value;

                  return (
                    <AccordionItem
                      key={uuid + arrayIndex}
                      headerIndex={(index + 1).toString()}
                      index={arrayIndex}
                      uuid={innerUUID}
                      accordionUUID={uuid}
                      type={contentType}
                      formItems={formItems}
                    />
                  );
                })}
            </dl>
          </div>
          {getIsAddSection() && (
            <div className='w-full flex justify-center py-2 rounded-b-lg border-y-2 border-gray-300 bg-white' key={uuid + "-NewFormItem"}>
              <div className='py-4'>
                <FormControl style={{ minWidth: "200px", marginRight: 20 }} required key={uuid + "-NewNameItem"}>
                  <InputLabel id='demo-simple-input-label'>Section Name</InputLabel>
                  <Input
                    style={{ height: "40px" }}
                    label='Accordion Section'
                    placeholder={"Enter Section Name..."}
                    value={selectedName}
                    onChange={handleSelectedAccordionName}>
                    {selectedName}
                  </Input>
                </FormControl>
                <FormControl style={{ minWidth: "200px", marginRight: 4 }} key={uuid + "-NewTypeItem"} required>
                  <InputLabel id='demo-simple-select-label'>Add New Section</InputLabel>
                  <Select value={selectedType} label='Accordion Type' onChange={handleSelectedAccordionType} sx={{ textAlign: "left" }}>
                    {SelectMenuOptions}
                  </Select>
                </FormControl>
                <IconButton variant='contained' onClick={handleNewAccordionSection} disabled={disabled} key={uuid + "-SubmitItem"}>
                  <Tooltip title={"Add New Section"} id={"addNewAccordionSectionTooltip"}>
                    <AddCircleRoundedIcon htmlColor={secondary} sx={{ ...icons.large, marginTop: 1 }} />
                  </Tooltip>
                </IconButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export AccordionSection.jsx
export default AccordionSection;
