// Imports
import PropTypes from "prop-types";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { CREATE_ECD_ITEM } from "../../../../reducers/SFRs/sfrSlice.js";
import { deepCopy } from "../../../../utils/deepCopy.js";
import { handleSnackBarError, handleSnackBarSuccess } from "../../../../utils/securityComponents.jsx";
import CardTemplate from "../CardTemplate.jsx";
import ExtendedComponentItem from "./ExtendedComponentItem.jsx";

/**
 * The extended component definition content
 * @param uuid the uuid
 * @param sfrUUID the sfr uuid
 * @param isAdditionalSfr if the input is an additional sfr
 * @param additionalSfrOpen the open value for the extended component for the additional sfr
 * @param additionalSfrDefinition the additional sfr extended component definition
 * @param handleUpdateAdditionalSfr the handle update additional sfr function
 * @returns {JSX.Element}
 * @constructor
 */
function ExtendedComponent({ uuid, sfrUUID, isAdditionalSfr, additionalSfrOpen, additionalSfrDefinition, handleUpdateAdditionalSfr }) {
  // Prop Validation
  ExtendedComponent.propTypes = {
    uuid: PropTypes.string.isRequired,
    sfrUUID: PropTypes.string,
    isAdditionalSfr: PropTypes.bool,
    additionalSfrOpen: PropTypes.bool,
    additionalSfrDefinition: PropTypes.array,
    handleUpdateAdditionalSfr: PropTypes.func,
  };

  // Constants
  const dispatch = useDispatch();
  const [open, setOpen] = useState(additionalSfrOpen !== undefined ? additionalSfrOpen : false);
  const { primary, icons } = useSelector((state) => state.styling);
  const sections = useSelector((state) => state.sfrs.sections);
  const extendedComponentDefinition = isAdditionalSfr ? deepCopy(additionalSfrDefinition) : deepCopy(sections[uuid].extendedComponentDefinition);

  // Methods
  /**
   * Handles the collapse
   */
  const handleCollapse = () => {
    if (isAdditionalSfr) {
      handleUpdateAdditionalSfr({
        type: "open",
        sfrUUID,
        uuid,
      });
    } else {
      setOpen(!open);
    }
  };
  /**
   * Handles adding a new extended component
   */
  const handleNewExtendedComponent = () => {
    try {
      if (isAdditionalSfr) {
        handleUpdateAdditionalSfr({
          type: "new",
          sfrUUID,
          uuid,
        });
      } else {
        dispatch(
          CREATE_ECD_ITEM({
            uuid: uuid,
          })
        );
      }

      // Update snackbar
      handleSnackBarSuccess("Extended Component Definition Successfully Added");
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Return Method
  return (
    <div>
      <CardTemplate
        type={"parent"}
        title={"Extended Component Definition"}
        tooltip={"Extended Component Definition"}
        collapse={open}
        collapseHandler={handleCollapse}
        body={
          <div className='mt-2 w-full'>
            {(isAdditionalSfr ? additionalSfrDefinition : extendedComponentDefinition)?.map((def, index) => {
              const { title, famId, famBehavior } = def;

              return (
                <ExtendedComponentItem
                  key={index}
                  title={title}
                  famId={famId}
                  famBehavior={famBehavior}
                  uuid={uuid}
                  index={index}
                  sfrUUID={sfrUUID}
                  isAdditionalSfr={isAdditionalSfr}
                  handleUpdateAdditionalSfr={handleUpdateAdditionalSfr}
                />
              );
            })}
          </div>
        }
        footer={
          <div
            className='min-w-full flex justify-center p-3 px-2 rounded-b-lg border-t-2 border-gray-200 bg-white'
            key={"ExtendedComponentFooter"}>
            <IconButton
              sx={{ marginBottom: "-4px" }}
              key={"NewExtendedComponentButton"}
              onClick={handleNewExtendedComponent}
              variant='contained'>
              <Tooltip title={"Add New Extended Component Definition"} id={"addNewExtendedComponentTooltip"}>
                <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
              </Tooltip>
            </IconButton>
          </div>
        }
      />
    </div>
  );
}

// Export ExtendedComponent.jsx
export default ExtendedComponent;
