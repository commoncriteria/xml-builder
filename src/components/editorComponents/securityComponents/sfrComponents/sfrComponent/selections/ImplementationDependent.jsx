// Imports
import { useDispatch, useSelector } from "react-redux";
import { FormControl, IconButton, TextField, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { UPDATE_SFR_COMPONENT_ITEMS } from "../../../../../../reducers/SFRs/sfrSectionSlice.js";
import { deepCopy } from "../../../../../../utils/deepCopy.js";
import {
  getToggleSwitch,
  handleSnackBarError,
  handleSnackBarSuccess,
  handleSnackbarTextUpdates,
  updateComponentItems,
} from "../../../../../../utils/securityComponents.jsx";
import CardTemplate from "../../../CardTemplate.jsx";

/**
 * The ImplementationDependent class that displays the implementation dependent reasons
 * @returns {JSX.Element}   the generic content
 * @constructor             passes in props to the class
 */
function ImplementationDependent() {
  // Constants
  const dispatch = useDispatch();
  const { primary, secondary, icons } = useSelector((state) => state.styling);
  const { sfrUUID, componentUUID, component } = useSelector((state) => state.sfrWorksheetUI);
  const { reasons, implementationDependent: isToggled, invisible } = component;

  // Methods
  /**
   * Handles adding a reason
   */
  const handleAddReason = () => {
    let updatedReasons = deepCopy(reasons);

    // Add new reason
    updatedReasons.push({
      id: "",
      title: "New Reason Title",
      description: "",
    });
    updateImplementationDependent(updatedReasons);

    // Update snackbar
    handleSnackBarSuccess("New Reason Successfully Added");
  };
  /**
   * Handles deleting a reason
   * @param reasons the reasons
   * @param index the index
   */
  const handleDeleteReason = (reasons, index) => {
    if (reasons[index]) {
      reasons.splice(index, 1);
      updateImplementationDependent(reasons);

      // Update snackbar
      handleSnackBarSuccess("Reason Successfully Removed");
    }
  };
  /**
   * Handles updating a reason
   * @param event the event
   * @param type the type
   * @param index the index
   * @param reasons the reasons
   */
  const handleUpdateReason = (event, type, index, reasons) => {
    if (reasons[index]) {
      reasons[index][type] = event.target.value;
      updateImplementationDependent(reasons);
    }
  };
  /**
   * Handles updates to the implementation dependent toggle
   * @param event the event
   */
  const handleUpdateImplementationDependentToggle = (event) => {
    if (!invisible) {
      const implementationDependent = event.target.checked;
      let itemMap = {
        implementationDependent: implementationDependent,
      };
      if (!implementationDependent) {
        itemMap.reasons = [];
      }

      // Update implementation dependent toggle
      updateComponentItems(itemMap);
    }
  };

  // Helper Methods
  /**
   * Updates the implementation dependent slice
   * @param reasons the reasons
   */
  const updateImplementationDependent = (reasons) => {
    const itemMap = {
      reasons: reasons,
    };
    dispatch(UPDATE_SFR_COMPONENT_ITEMS({ sfrUUID: sfrUUID, uuid: componentUUID, itemMap: itemMap }));
  };

  // Components
  /**
   * The implementation dependent toggle section
   * @returns {JSX.Element}
   */
  const getImplementationDependentToggle = () => {
    const title = "Implementation Dependent";
    const tooltipID = "implementationDependentToggleTooltip";
    const tooltip = "Selecting this indicates that this SFR is dependent on a feature defined elsewhere in the document.";

    return getToggleSwitch(title, isToggled, tooltipID, tooltip, handleUpdateImplementationDependentToggle);
  };
  /**
   * The reasons section
   * @returns {*}
   */
  const getReasons = () => {
    try {
      let newReasons = deepCopy(reasons);

      if (newReasons && newReasons.length > 0) {
        return newReasons.map((reason, index) => {
          const { title, id, description } = reason;

          return (
            <div className='p-0 m-0 mx-[-12px] pb-2' key={"reason-" + index}>
              <CardTemplate
                type={"section"}
                header={
                  <span className='flex justify-center min-w-full'>
                    <div className='w-[94%] ml-4'>
                      <Tooltip title={"Enter Implementation Dependent Title"} id={componentUUID + "reasonTitle" + index}>
                        <textarea
                          className='w-full text-center resize-none font-bold text-[13px] mb-[-8px] h-[24px] p-0 text-accent'
                          onBlur={(event) => {
                            handleSnackbarTextUpdates(handleUpdateReason, event, "title", index, newReasons);
                          }}
                          defaultValue={title ? title : ""}
                        />
                      </Tooltip>
                    </div>
                    <div className='w-[6%] mr-1'>
                      <IconButton
                        variant='contained'
                        sx={{ marginTop: "-8px", margin: 0, padding: 0 }}
                        onClick={() => {
                          handleDeleteReason(newReasons, index);
                        }}>
                        <Tooltip title={`Delete Implementation Dependent`} id={componentUUID + "deleteReasonTooltip" + index}>
                          <DeleteForeverRoundedIcon htmlColor={secondary} sx={icons.small} />
                        </Tooltip>
                      </IconButton>
                    </div>
                  </span>
                }
                body={
                  <div className='min-w-full mt-1 mb-2 justify-items-left grid grid-flow-row auto-rows-max'>
                    <FormControl fullWidth>
                      <TextField
                        color={"secondary"}
                        className='w-full'
                        key={"reasonID"}
                        label='ID'
                        defaultValue={id}
                        onBlur={(event) => {
                          handleSnackbarTextUpdates(handleUpdateReason, event, "id", index, newReasons);
                        }}
                      />
                    </FormControl>
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                      <TextField
                        color={"secondary"}
                        className='w-full'
                        key={"reasonDescription"}
                        label='Description'
                        defaultValue={description}
                        onBlur={(event) => {
                          handleSnackbarTextUpdates(handleUpdateReason, event, "description", index, newReasons);
                        }}
                      />
                    </FormControl>
                  </div>
                }
              />
            </div>
          );
        });
      }
    } catch (e) {
      console.log(e);
      handleSnackBarError(e);
    }
  };

  // Return Method
  return !isToggled ? (
    <div>{getImplementationDependentToggle()}</div>
  ) : (
    <div className='mx-[-10px]'>
      <CardTemplate
        type={"section"}
        header={getImplementationDependentToggle()}
        body={
          <div className='min-w-full'>
            <div className='min-w-full mt-[-8px]'>{getReasons()}</div>
            <div className='border-t-2 border-gray-200 mx-[-16px]'>
              <div className='w-full p-1 justify-items-center'>
                <IconButton sx={{ marginBottom: "-8px" }} key={"NewAuditEventsButton"} onClick={handleAddReason} variant='contained'>
                  <Tooltip title={"Add New Implementation Dependent"} id={componentUUID + "addNewImplementationDependentTooltip"}>
                    <AddCircleRoundedIcon htmlColor={primary} sx={icons.medium} />
                  </Tooltip>
                </IconButton>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

// Export ImplementationDependent.jsx
export default ImplementationDependent;
