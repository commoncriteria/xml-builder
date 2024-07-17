// Imports
import PropTypes from "prop-types";
import { useSelector } from 'react-redux'
import AccordionContent from "./accordionComponents/AccordionContent.jsx";
import React, {useEffect, useRef, useState} from "react";
import MetadataSection from "./accordionComponents/MetadataSection.jsx";
import PreviewPane from "./PreviewPane.jsx";
import {IconButton, Tooltip} from "@mui/material";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";

/**
 * The Content pane class that displays the content of the builder
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the class
 */
function ContentPane(props) {
    // Prop Validation
    ContentPane.propTypes = {
        type: PropTypes.string.isRequired,
    }

    // Constants
    const style = {primary: "#d926a9", secondary: "#1FB2A6", linkText: "#7c3aed"}
    const title = props.type === "builder" ? "Builder" : "Preview"
    const isPreviewToggled = useSelector((state) => state.navBar.isPreviewToggled)
    const builderSections = useSelector((state) => state.accordionPane.sections)
    const [openPreview, setOpenPreview] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollContainerRef = useRef(null);

    // Use Effects
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;
        const handleScroll = (event) => {
            if (event.target.scrollTop > 0) {
                setIsScrolling(true);
            } else {
                setIsScrolling(false);
            }
        };
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    // Methods
    const handleOpenPreview = () => {
        setOpenPreview(!openPreview)
    }

    // Return Method
    return (
        <div className="h-full min-w-full" key={props.type + "ContentPane"}>
            <div className="rounded-lg min-h-full parent flex flex-col">
                <div className="border-2 border-gray-400 rounded-xl p-3 bg-base-200 h-20">
                    <div className={`text-3xl font-bold text-secondary flex justify-center items-center 
                                    ${title === "Preview" ? "ml-3 pt-1" : "pt-2"}`}
                    >{title}
                        { title === "Preview" ?
                            <IconButton sx={{ marginLeft: 0.75 }} onClick={handleOpenPreview}>
                                <Tooltip title={"Expand XML Preview"}>
                                    <LaunchRoundedIcon htmlColor={style.primary} sx={{ width: 30, height: 30 }}/>
                                </Tooltip>
                            </IconButton>
                            :
                            null
                        }
                    </div>
                </div>
                <div className="mt-4 mb-0 border-2 border-gray-300 rounded-lg p-3 bg-gray-300 text-black flex justify-center child flex-1 text-lg min-h-screen min-w-full">
                    <div className={isPreviewToggled ? "min-w-full h-screen overflow-y-scroll scrollbar scrollbar-thumb-gray-100 scrollbar-track-gray" : "min-w-full "} ref={scrollContainerRef}>
                        {
                            props.type === "builder" ?
                                <div className="min-w-full">
                                    <div className="min-w-full"  key={"Metadata Section Accordion"} id={"Metadata Section Accordion"}>
                                        <MetadataSection/>
                                    </div>
                                    {Object.keys(builderSections).map((key, index) => {
                                        let item = builderSections[key]
                                        return (
                                            <div className="min-w-full" key={item.title + key + "Accordion"} id={item.title + key + "Accordion"}>
                                                <AccordionContent title={item.title} uuid={key} index={index} open={item.open}/>
                                            </div>
                                        )
                                    })}
                                </div>
                                :
                                <div className="min-w-full">
                                    <PreviewPane
                                        openPreview={openPreview}
                                        handleOpenPreview={handleOpenPreview}
                                        style={style}
                                        isScrolling={isScrolling}
                                    />
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export ContentPane.jsx
export default ContentPane;