// Imports
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import { DELETE_SFR_COMPONENT, UPDATE_SFR_COMPONENT_ITEMS } from "../../../../reducers/SFRs/sfrSectionSlice.js";
import { DELETE_SFR_FROM_THREAT_USING_UUID } from "../../../../reducers/threatsSlice.js";
import { deepCopy } from "../../../../utils/deepCopy.js";
import {
  getObjectiveMaps,
  getSfrMaps,
  getThreatMaps,
  handleSnackBarSuccess,
  setSfrWorksheetUIItems,
} from "../../../../utils/securityComponents.jsx";
import DeleteConfirmation from "../../../modalComponents/DeleteConfirmation.jsx";
import RationaleTable from "../rationaleTable/RationaleTable.jsx";
import "../../components.css";

/**
 * The SfrSections component
 * @param sfrUUID the sfr uuid
 * @param uuid the uuid
 * @param index the index
 * @param value the value
 * @returns {JSX.Element}
 * @constructor
 */
function SfrSections({ sfrUUID, uuid, index, value }) {
  // Prop Validation
  SfrSections.propTypes = {
    sfrUUID: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    value: PropTypes.object.isRequired,
  };

  // Constants
  const dispatch = useDispatch();
  const sfrSections = useSelector((state) => state.sfrSections);
  const objectives = useSelector((state) => state.objectives);
  const threats = useSelector((state) => state.threats);
  const { primary, icons } = useSelector((state) => state.styling);
  const metadataSection = useSelector((state) => state.accordionPane.metadata);
  const { ppTemplateVersion } = metadataSection;
  const { openSfrWorksheet } = useSelector((state) => state.sfrWorksheetUI);
  const [openDeleteDialog, setDeleteDialog] = useState(false);

  // Methods
  /**
   * Handles deleting the component
   * @returns {Promise<void>}
   */
  const handleDeleteComponent = async () => {
    dispatch(
      DELETE_SFR_FROM_THREAT_USING_UUID({
        sfrUUID: uuid,
      })
    );
    dispatch(
      DELETE_SFR_COMPONENT({
        sfrUUID,
        uuid,
      })
    );

    // Update snackbar
    handleSnackBarSuccess("SFR Component Successfully Removed. Reloading page...");

    // Reload page
    setTimeout(() => {
      location.reload();
    }, 3000);
  };
  /**
   * Handles collapsing the component
   */
  const handleCollapseComponent = () => {
    const itemMap = { open: !value.open };

    // Update the sfr collapse
    dispatch(
      UPDATE_SFR_COMPONENT_ITEMS({
        sfrUUID,
        uuid,
        itemMap,
      })
    );
  };
  /**
   * Handles opening the sfr worksheet
   */
  const handleOpenSfrWorksheet = () => {
    // Update and open sfr worksheet ui
    setSfrWorksheetUIItems({
      openSfrWorksheet: !openSfrWorksheet,
      sfrUUID,
      componentUUID: uuid,
      sfrSections: deepCopy(sfrSections),
    });
  };

  // Use Memos
  /**
   * The Rationale Table Section
   */
  const RationaleTableSection = useMemo(() => {
    return (
      <RationaleTable
        key={uuid + "RationaleTable"}
        termUUID={sfrUUID}
        index={index}
        uuid={uuid}
        title={value.title}
        objectives={value.objectives}
        open={value.tableOpen}
        contentType={"sfrs"}
        objectiveMaps={getObjectiveMaps()}
        threatMaps={getThreatMaps()}
        sfrMaps={getSfrMaps()}
      />
    );
  }, [sfrSections, objectives, threats, sfrUUID, uuid, index, value]);

  // Return Method
  return (
    <div className='p-1 pb-3' key={uuid + +"SfrSection"}>
      <Card className='border-2 border-gray-300' key={uuid + "SfrSectionCard"}>
        <CardBody key={uuid + "CardBody"}>
          <div className='flex mb-[-15px] mt-[-5px]' key={uuid + "CardBodyDiv"}>
            <IconButton
              sx={{ marginTop: "-12px" }}
              onClick={() => {
                handleOpenSfrWorksheet();
              }}
              variant='contained'>
              <Tooltip title={"Edit SFR Worksheet"} id={"editSfrWorksheetTooltip" + uuid}>
                <AutoFixHighIcon htmlColor={primary} sx={icons.xSmall} />
              </Tooltip>
            </IconButton>
            <h1 className='w-full resize-none font-bold text-[13px] mt-2 ml-1 mb-0 h-[24px] p-0 text-secondary' key={uuid + "SFRComponentAccordionTitle"}>
              {`${value.cc_id + (value.iteration_id && value.iteration_id.length > 0 ? "/" + value.iteration_id + " " : " ") + value.title}`}
            </h1>
            <span />
            <IconButton sx={{ marginTop: "-8px" }} onClick={() => setDeleteDialog(!openDeleteDialog)} variant='contained'>
              <Tooltip title={"Delete Component"} id={"deleteComponentTooltip" + uuid}>
                <DeleteForeverRoundedIcon htmlColor={primary} sx={icons.large} />
              </Tooltip>
            </IconButton>
            <span />
            {ppTemplateVersion !== "CC2022 Direct Rationale" && (
              <IconButton sx={{ marginTop: "-8px" }} onClick={handleCollapseComponent} variant='contained'>
                <Tooltip title={`${value.open ? "Collapse " : "Expand "} Component`} id={(value.open ? "collapse" : "expand") + uuid + "ComponentTooltip"}>
                  {value.open ? <RemoveIcon htmlColor={primary} sx={icons.large} /> : <AddIcon htmlColor={primary} sx={icons.large} />}
                </Tooltip>
              </IconButton>
            )}
          </div>
        </CardBody>
        {value.open && ppTemplateVersion !== "CC2022 Direct Rationale" && (
          <CardFooter className='w-full m-0 p-0'>
            <div className='pt-2 p-6' key={uuid + "RationaleTableDiv"}>
              {RationaleTableSection}
            </div>
          </CardFooter>
        )}
      </Card>
      <DeleteConfirmation
        title={value.title}
        open={openDeleteDialog}
        handleOpen={() => setDeleteDialog(!openDeleteDialog)}
        handleSubmit={handleDeleteComponent}
      />
    </div>
  );
}

// Export SfrSections.jsx
export default SfrSections;
