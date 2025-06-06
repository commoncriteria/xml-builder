// Imports
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { getElementValuesByType, transformTabularizeData, updateTabularizeUI } from "../../../../../../utils/securityComponents.jsx";
import EditTabularizeDefinitionModal from "./EditTabularizeDefinitionModal.jsx";
import TabularizeTable from "./TabularizeTable.jsx";

/**
 * The TabularizeTableSection class that displays a tabularize table section for the sfr worksheet
 * @returns {JSX.Element} the content
 * @constructor passes in props to the class
 */
function TabularizeTableSection() {
  // Constants
  const { element, tabularizeUI } = useSelector((state) => state.sfrWorksheetUI);
  const { tabularizeUUIDs, openDefinitionModal } = tabularizeUI;
  const { secondary, icons } = useSelector((state) => state.styling);
  const [collapse, setCollapse] = useState(false);

  // Use Effect
  useEffect(() => {
    // Set tabularize UUIDs
    const uuids = getElementValuesByType(element, "tabularizeUUIDs");

    if (JSON.stringify(tabularizeUUIDs) !== JSON.stringify(uuids)) {
      // Update tabularize uuids
      updateTabularizeUI({
        tabularizeUUIDs: uuids,
      });
    }
  }, [element, tabularizeUI]);

  // Methods
  /**
   * Handles the open new modal
   */
  const handleOpenNewModal = () => {
    if (!openDefinitionModal) {
      // Set item map and update values
      transformTabularizeData({
        type: "transform",
      });
    }

    // Update edit definition modal
    updateTabularizeUI({
      openDefinitionModal: !openDefinitionModal,
    });
  };

  // Return Method
  return (
    <div className='p-2 px-4'>
      <EditTabularizeDefinitionModal handleOpen={handleOpenNewModal} />
      <Card className='w-full rounded-lg border-2 border-gray-200'>
        <CardBody className='w-full m-0 p-0 border-b-2 border-gray-200'>
          <div className='w-full border-b-2 border-b-gray-200 p-4 pb-2'>
            <span className='min-w-full inline-flex items-baseline'>
              <div className='w-[1%]'>
                <IconButton
                  sx={{ marginTop: "-12px" }}
                  key={"TabularizeButton"}
                  variant='contained'
                  onClick={() => {
                    setCollapse(!collapse);
                  }}>
                  <Tooltip
                    title={`${(collapse ? "Collapse " : "Expand ") + "Crypto Selection Tables"}`}
                    id={(collapse ? "collapse" : "expand") + "TabularizeTooltip"}>
                    {!collapse ? <RemoveIcon htmlColor={secondary} sx={icons.large} /> : <AddIcon htmlColor={secondary} sx={icons.large} />}
                  </Tooltip>
                </IconButton>
              </div>
              <div className='w-[95%] justify-items-center'>
                <label className='resize-none font-bold text-[14px] p-0 text-accent mt-1'>Crypto Selection Tables</label>
              </div>
            </span>
          </div>
          {!collapse && (
            <div className='py-2 w-full'>
              <div className='m-0 p-0 px-4 w-full max-w-6xl mb-[8px]'>
                {tabularizeUUIDs.map((tabularizeUUID, index) => (
                  <TabularizeTable index={index} key={tabularizeUUID} tabularizeUUID={tabularizeUUID} />
                ))}
              </div>
            </div>
          )}
        </CardBody>
        {!collapse && (
          <CardFooter className='w-full m-0 p-0'>
            <div className='w-full flex justify-center p-0 py-1 bg-white' key={"TabularizeTableSectionFooter"}>
              <IconButton key={"AddNewTabularizeTableButton"} onClick={handleOpenNewModal} variant='contained'>
                <Tooltip title={"Create New Crypto Selection Table"} id={"createNewTabularizeTbleTooltip"}>
                  <AddCircleRoundedIcon htmlColor={secondary} sx={icons.medium} />
                </Tooltip>
              </IconButton>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Export TabularizeTableSection.jsx
export default TabularizeTableSection;
