// Imports
import { Card, CardBody } from "@material-tailwind/react";
import XMLExporter from "./modalComponents/XMLExporter.jsx";
import XMLPreview from "./modalComponents/XMLPreview.jsx";
import PropTypes from "prop-types";
import { Box, IconButton, Tooltip } from "@mui/material";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import React, { useState } from "react";
import { useSelector } from "react-redux";

/**
 * The Preview pane class that displays the xml content of the builder
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the class
 */
function PreviewPane({ openPreview, handleOpenPreview, isScrolling }) {
  // Prop Validation
  PreviewPane.propTypes = {
    openPreview: PropTypes.bool.isRequired,
    handleOpenPreview: PropTypes.func.isRequired,
    isScrolling: PropTypes.bool.isRequired,
  };

  // Constants
  const { primary, icons } = useSelector((state) => state.styling);
  const formattedXML = useSelector((state) => state.exports.formattedXML);
  const [confirmationTooltip, setConfirmationTooltip] = useState(false);

  // Return Method
  return (
    <div className='h-full min-w-full'>
      <XMLPreview open={openPreview} handleOpen={handleOpenPreview} />
      <Card className='h-full min-w-full rounded-lg border-2 border-gray-300 p-5 mb-4'>
        <CardBody className='h-full min-w-full m-0 p-0 justify-items-start'>
          <Box position='sticky' top={0} zIndex={1}>
            <Box position='absolute' right={0} marginRight={-1}>
              <IconButton
                variant='contained'
                sx={{ marginTop: -1, marginRight: -1, paddingTop: isScrolling ? "25px" : "5px" }}
                onClick={async () => {
                  await navigator.clipboard.writeText(formattedXML ? formattedXML : "").then(() => {
                    setConfirmationTooltip(true);
                    setTimeout(() => {
                      setConfirmationTooltip(false);
                    }, 3000);
                  });
                }}>
                <Tooltip
                  id={"copyToClipboardTooltip"}
                  arrow
                  title={confirmationTooltip ? "Copied!" : "Copy To Clipboard"}
                  placement='bottom'
                  leaveDelay={confirmationTooltip ? 2000 : 0}>
                  <CopyAllIcon htmlColor={primary} sx={icons.large} />
                </Tooltip>
              </IconButton>
            </Box>
          </Box>
          <div className='pr-4'>
            <XMLExporter preview={true} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default PreviewPane;
