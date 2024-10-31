// Imports
import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal.jsx";
import { useSelector } from "react-redux";
import XMLViewer from "react-xml-viewer";
import { Box, IconButton, Tooltip } from "@mui/material";
import CopyAllIcon from "@mui/icons-material/CopyAll";

/**
 * The XMLPreview class that displays the XML preview in full screen mode
 * @returns {JSX.Element}   the xml data modal content
 * @constructor             passes in props to the class
 */
function XMLPreview({ open, handleOpen }) {
    // Prop Validation
    XMLPreview.propTypes = {
        open: PropTypes.bool.isRequired,
        handleOpen: PropTypes.func.isRequired,
    };

    // Constants
    const formattedXML = useSelector((state) => state.exports.formattedXML);
    const { primary, secondary, linkText, icons } = useSelector((state) => state.styling);
    const [confirmationTooltip, setConfirmationTooltip] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    // Methods
    const handleIsScrolling = (scrolling) => {
        setIsScrolling(scrolling)
    }

    // Return Method
    return (
        <div className="rounded-lg">
            <Modal
                title={"XML Preview"}
                content={(
                    <div>
                        <div className="xml-viewer text-left bg-gray-50 p-4 rounded-md">
                            <Box position="sticky" top={0} zIndex={1}>
                                <Box position="absolute" right={0}>
                                    <IconButton
                                        sx={{ marginTop: -0.25, marginRight: -1, paddingTop: isScrolling ? '18px' : '1px' }}
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(formattedXML ? formattedXML : "").then(() => {
                                                setConfirmationTooltip(true)
                                                setTimeout(() => {
                                                    setConfirmationTooltip(false)
                                                }, 3000)
                                            })
                                        }}
                                    >
                                        <Tooltip id={"copyToClipboardExpandedPreviewTooltip"}
                                            arrow
                                            title={confirmationTooltip ? "Copied!" : "Copy To Clipboard"}
                                            placement="bottom"
                                            leaveDelay={confirmationTooltip ? 2000: 0}
                                        >
                                            <CopyAllIcon htmlColor={ primary } sx={ icons.large }/>
                                        </Tooltip>
                                    </IconButton>
                                </Box>
                            </Box>
                            <div className="text-[14px] pr-6" >
                                <XMLViewer
                                    xml={formattedXML ? formattedXML : ""}
                                    indentSize={4}
                                    collapsible={true}
                                    theme = {{
                                        "tagColor": primary,
                                        "attributeKeyColor": secondary,
                                        "attributeValueColor": linkText
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                open={open}
                handleOpen={handleOpen}
                hideSubmit={true}
                fullscreen={true}
                handleIsScrolling={handleIsScrolling}
            />
        </div>
    );
}

// Export XMLPreview.jsx
export default XMLPreview;