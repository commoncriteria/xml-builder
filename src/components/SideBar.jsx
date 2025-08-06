// Imports
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionBody, AccordionHeader, Card, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import { Tooltip } from "@mui/material";
import QueueIcon from "@mui/icons-material/Queue";
import RestoreIcon from "@mui/icons-material/Restore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SettingsSharpIcon from "@mui/icons-material/SettingsSharp";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import FolderIcon from "@mui/icons-material/Folder";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LayersIcon from "@mui/icons-material/Layers";
import WebIcon from "@mui/icons-material/Web";
import { collapseAllAccordions, expandAllAccordions } from "../reducers/accordionPaneSlice.js";
import { COLLAPSE_TERMS_LIST } from "../reducers/termsSlice.js";
import { COLLAPSE_EDITOR } from "../reducers/editorSlice.js";
import { setIsPreviewToggled } from "../reducers/navBarSlice.js";
import { RESET_EXPORT } from "../reducers/exportSlice.js";
import { handleSnackBarSuccess, handleSubmitResetDataMenu } from "../utils/securityComponents.jsx";
import NewAccordion from "./modalComponents/NewAccordion.jsx";
import ResetDataConfirmation from "./modalComponents/ResetDataConfirmation.jsx";
import FileLoader from "./modalComponents/FileLoader.jsx";
import XMLExporter from "./modalComponents/XMLExporter.jsx";

/**
 * The Sidebar class that displays the sidebar menu
 * @returns {JSX.Element}   the sidebar content
 * @constructor             passes in props to the class
 */
function SideBar() {
  // Constants
  const dispatch = useDispatch();
  const isNavOpen = useSelector((state) => state.navBar.isNavOpen);
  const accordions = useSelector((state) => state.accordionPane.sections);
  const terms = useSelector((state) => state.terms);
  const editors = useSelector((state) => state.editors);
  const isPreviewToggled = useSelector((state) => state.navBar.isPreviewToggled);
  const { primary, icons } = useSelector((state) => state.styling);
  const [openMenuItems, setOpenMenuItems] = React.useState(0);
  const [openFileLoaderMenu, setOpenFileLoaderMenu] = React.useState(false);
  const [openAccordionMenu, setOpenAccordionMenu] = React.useState(false);
  const [openResetDataMenu, setOpenResetDataMenu] = React.useState(false);
  const [openXMLExporterMenu, setOpenXMLExporterMenu] = React.useState(false);

  // Use Effects
  useEffect(() => {
    // This runs when the file loader menu is closed prematurely
    if (sessionStorage.getItem("fileMenuClosed") === "true") {
      // Update snackbar
      handleSnackBarSuccess(`Loaded in Default XML Template`);

      // Perform actions after reload
      sessionStorage.removeItem("fileMenuClosed");
    }
  }, []);

  // Methods
  /**
   * Handles opening and closing the accordions in the side bar menu
   * @param value the value of the accordion to open or close
   */
  const handleOpenMenuItems = (value) => {
    setOpenMenuItems(openMenuItems === value ? 0 : value);
  };
  /**
   * Handles opening the file loader dialog
   * @returns {Promise<void>}
   */
  const handleOpenFileLoader = async () => {
    if (!openFileLoaderMenu) {
      if (isPreviewToggled) {
        await dispatch(setIsPreviewToggled());
      }
      await dispatch(RESET_EXPORT());
    }
    setOpenFileLoaderMenu(!openFileLoaderMenu);
  };
  /**
   * Handles opening the xml exporter dialog
   * @returns {Promise<void>}
   */
  const handleOpenXMLExporter = async () => {
    if (!openXMLExporterMenu) {
      if (isPreviewToggled) {
        await dispatch(setIsPreviewToggled());
      }
      await dispatch(RESET_EXPORT());
    }
    setOpenXMLExporterMenu(!openXMLExporterMenu);
  };
  /**
   * Handles opening the new accordion dialog
   */
  const handleOpenAccordionMenu = () => {
    setOpenAccordionMenu(!openAccordionMenu);
  };
  /**
   * Handles opening the reset data dialog
   */
  const handleOpenResetDataMenu = () => {
    setOpenResetDataMenu(!openResetDataMenu);
  };
  /**
   * Handles expanding all parent accordions
   * @returns {Promise<void>}
   */
  const handleExpandAllAccordions = async () => {
    await dispatch(expandAllAccordions());
    await collapseSectionsHelper(true);

    // Scroll back to the top of the page
    window.scrollTo(0, 0);

    // Update snackbar
    handleSnackBarSuccess("All Accordions Successfully Expanded");
  };
  /**
   * Handles collapsing all parent accordions
   * @returns {Promise<void>}
   */
  const handleCollapseAllAccordions = async () => {
    await dispatch(collapseAllAccordions());
    await collapseSectionsHelper(false);

    // Scroll back to the top of the page
    window.scrollTo(0, 0);

    // Update snackbar
    handleSnackBarSuccess("All Accordions Successfully Collapsed");
  };

  // Helper Methods
  /**
   * Collapses or expands the parent accordions
   * @param open the value of collapse or expand (boolean)
   * @returns {Promise<void>}
   */
  const collapseSectionsHelper = async (open) => {
    // Collapse all terms
    Object.keys(terms).map(async (uuid) => {
      let title = terms[uuid].title;
      await dispatch(COLLAPSE_TERMS_LIST({ uuid: uuid, title: title, open: open }));
    });

    // Collapse all editors
    Object.keys(editors).map(async (uuid) => {
      let title = editors[uuid].title;
      await dispatch(COLLAPSE_EDITOR({ uuid: uuid, title: title, open: open }));
    });
  };

  // Components
  /**
   * The section list component
   * @param item the item object used for getting the section details
   * @param key the accordion uuid key (optional)
   * @returns {Element}
   */
  const getCurrentSectionsLists = (item, key) => {
    return (
      <div className='py-0' key={item.title + (key ? key : "") + "SectionMenuItem"}>
        <Tooltip title={`Go to ${item.title}`} placement={"top"} id={"goToItemTooltip" + key}>
          <ListItem
            disabled={isPreviewToggled}
            onClick={() => {
              if (item.title === "Metadata Section") {
                window.scrollTo(0, 0);
              } else {
                const id = item.title + (key ? key : "") + "Accordion";
                const element = document.getElementById(id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
                setTimeout(() => {
                  window.scrollBy(0, -95);
                }, 700);
              }
            }}>
            <ListItemPrefix>
              <ArrowRightIcon sx={icons.small} />
            </ListItemPrefix>
            <ListItemPrefix>
              <WebIcon htmlColor={primary} sx={icons.small} />
            </ListItemPrefix>
            <Typography className='text-[14px] pt-[8px]'>{item.title}</Typography>
          </ListItem>
        </Tooltip>
      </div>
    );
  };

  // Return Method
  return (
    <div>
      {isNavOpen ? (
        <div
          className={`top-0 left-0 text-white fixed h-full z-40 ease-in-out duration-300 
                                 min-w-[300px] max-w-[300px] mt-4 ml-1 mr-2 pb-6 rounded-md grid justify-items-center ... 
                                 ${isNavOpen ? "translate-x-0 " : "translate-x-full"}`}>
          <Card className='w-full h-full bg-neutral border-2 border-gray-500 pt-5 overflow-y-auto'>
            <div className='h-full w-full'>
              <div className='flex items-center justify-center pb-2 border-b-[3px] rounded-b-sm border-gray-500'>
                <Typography className='text-2xl font-semibold text-secondary'>Menu</Typography>
              </div>
              <div className='flex items-start justify-start w-full text-white'>
                <List className='w-full mt-2'>
                  <Accordion
                    className='pb-2 text-white'
                    open={openMenuItems === 1}
                    icon={
                      <div className='flex mx-auto'>
                        <ArrowDropDownIcon
                          sx={{
                            width: 25,
                            height: 25,
                            marginBottom: "2px",
                            transform: openMenuItems === 1 ? "rotate(180deg)" : "",
                          }}
                        />
                      </div>
                    }>
                    <ListItem className='p-0' selected={openMenuItems === 1}>
                      <AccordionHeader onClick={() => handleOpenMenuItems(1)} className='border-b-0 px-3 py-2'>
                        <ListItemPrefix>
                          <LayersIcon htmlColor={primary} sx={icons.extraLarge} />
                        </ListItemPrefix>
                        <Typography className='text-[16px] mr-auto pt-[8px]'>Current Sections</Typography>
                      </AccordionHeader>
                    </ListItem>
                    <AccordionBody className='pl-0 pt-1 pb-0 text-white'>
                      <List className='p-0'>
                        {/* Get the Metadata Section Accordion */}
                        {getCurrentSectionsLists({ title: "Metadata Section" })}
                        {/* Get the rest of the current accordions */}
                        {Object.keys(accordions).map((key) => {
                          let item = accordions[key];
                          return getCurrentSectionsLists(item, key);
                        })}
                      </List>
                    </AccordionBody>
                  </Accordion>
                  <Accordion
                    className='pb-2 text-white'
                    open={openMenuItems === 2}
                    icon={
                      <div className='flex mx-auto'>
                        <ArrowDropDownIcon
                          sx={{
                            ...icons.large,
                            marginBottom: "2px",
                            transform: openMenuItems === 2 ? "rotate(180deg)" : "",
                          }}
                        />
                      </div>
                    }>
                    <ListItem className='p-0' selected={openMenuItems === 2}>
                      <AccordionHeader onClick={() => handleOpenMenuItems(2)} className='border-b-0 px-3 py-2'>
                        <ListItemPrefix>
                          <FolderIcon htmlColor={primary} sx={icons.large} />
                        </ListItemPrefix>
                        <Typography className='text-[16px] mr-auto pt-[8px]'>File Options</Typography>
                      </AccordionHeader>
                    </ListItem>
                    <AccordionBody className='pl-0 pt-1 pb-0 text-white'>
                      <List className='p-0'>
                        <Tooltip title={"Configures the XML File Settings"} placement={"top"} id={"importXMLTooltip"}>
                          <ListItem onClick={handleOpenFileLoader}>
                            <ListItemPrefix>
                              <ArrowRightIcon sx={icons.small} />
                            </ListItemPrefix>
                            <ListItemPrefix>
                              <UploadFileIcon htmlColor={primary} sx={icons.small} />
                            </ListItemPrefix>
                            <Typography className='text-[14px] pt-[8px]'>Configure XML Settings</Typography>
                          </ListItem>
                        </Tooltip>
                        <Tooltip title={"Exports the XML File Content"} placement={"top"} id={"exportXMLTooltip"}>
                          <ListItem id={"side-bar-export-button"} onClick={handleOpenXMLExporter}>
                            <ListItemPrefix>
                              <ArrowRightIcon sx={icons.small} />
                            </ListItemPrefix>
                            <ListItemPrefix>
                              <FileDownloadIcon htmlColor={primary} sx={icons.small} />
                            </ListItemPrefix>
                            <Typography className='text-[14px] pt-[8px]'>Export XML</Typography>
                          </ListItem>
                        </Tooltip>
                      </List>
                    </AccordionBody>
                  </Accordion>
                  <Accordion
                    className='pb-5 text-white'
                    open={openMenuItems === 3}
                    icon={
                      <div className='flex mx-auto'>
                        <ArrowDropDownIcon
                          sx={{
                            ...icons.large,
                            marginBottom: "2px",
                            transform: openMenuItems === 3 ? "rotate(180deg)" : "",
                          }}
                        />
                      </div>
                    }>
                    <ListItem className='p-0' selected={openMenuItems === 3}>
                      <AccordionHeader onClick={() => handleOpenMenuItems(3)} className='border-b-0 px-3 py-2'>
                        <ListItemPrefix>
                          <SettingsSharpIcon htmlColor={primary} sx={icons.large} />
                        </ListItemPrefix>
                        <Typography className='text-[16px] mr-auto pt-[8px]'>Settings</Typography>
                      </AccordionHeader>
                    </ListItem>
                    <AccordionBody className='pl-0 pt-1 pb-0 text-white'>
                      <List className='p-0'>
                        <Tooltip title={"Add in a New Section to the Template"} placement={"top"} id={"newSectionTemplateTooltip"}>
                          <ListItem onClick={handleOpenAccordionMenu}>
                            <ListItemPrefix>
                              <ArrowRightIcon sx={icons.small} />
                            </ListItemPrefix>
                            <ListItemPrefix>
                              <QueueIcon htmlColor={primary} sx={icons.small} />
                            </ListItemPrefix>
                            <Typography className='text-[14px] pt-[8px]'>Create a New Section</Typography>
                          </ListItem>
                        </Tooltip>
                        <ListItem onClick={handleExpandAllAccordions}>
                          <ListItemPrefix>
                            <ArrowRightIcon sx={icons.small} />
                          </ListItemPrefix>
                          <ListItemPrefix>
                            <AddCircleIcon htmlColor={primary} sx={icons.small} />
                          </ListItemPrefix>
                          <Typography className='text-[14px] pt-[8px]'>Expand All Sections</Typography>
                        </ListItem>
                        <ListItem onClick={handleCollapseAllAccordions}>
                          <ListItemPrefix>
                            <ArrowRightIcon sx={icons.small} />
                          </ListItemPrefix>
                          <ListItemPrefix>
                            <RemoveCircleIcon htmlColor={primary} sx={icons.small} />
                          </ListItemPrefix>
                          <Typography className='text-[14px] pt-[8px]'>Collapse All Sections</Typography>
                        </ListItem>
                        <Tooltip title={"Clears Out All Data"} placement={"top"} id={"clearOutDataTooltip"}>
                          <ListItem onClick={handleOpenResetDataMenu}>
                            <ListItemPrefix>
                              <ArrowRightIcon sx={icons.small} />
                            </ListItemPrefix>
                            <ListItemPrefix>
                              <RestoreIcon htmlColor={primary} sx={icons.small} />
                            </ListItemPrefix>
                            <Typography className='text-[14px] pt-[8px]'>Reset Template Data</Typography>
                          </ListItem>
                        </Tooltip>
                      </List>
                    </AccordionBody>
                  </Accordion>
                </List>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
      <FileLoader open={openFileLoaderMenu} handleOpen={handleOpenFileLoader} />
      <XMLExporter open={openXMLExporterMenu} handleOpen={handleOpenXMLExporter} preview={false} />
      <NewAccordion open={openAccordionMenu} handleOpen={handleOpenAccordionMenu} />
      <ResetDataConfirmation
        title={"Reset Data Confirmation"}
        text={"Are you sure you want to reset all data to its initial state?"}
        open={openResetDataMenu}
        handleOpen={handleOpenResetDataMenu}
        handleSubmit={() => handleSubmitResetDataMenu(handleOpenResetDataMenu)}
      />
    </div>
  );
}

// Export SideBar.jsx
export default SideBar;
