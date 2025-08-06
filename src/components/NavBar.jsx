// Imports
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Hamburger from "hamburger-react";
import { setIsNavBarOpen, setIsPreviewToggled } from "../reducers/navBarSlice.js";
import { RESET_EXPORT } from "../reducers/exportSlice.js";
import ToggleSwitch from "./ToggleSwitch.jsx";
import { alpha } from "@mui/material";

/**
 * The NavBar class that displays the navigation bar and search capability
 * @returns {JSX.Element}   the navigation bar content
 * @constructor             passes in props to the class
 */
function NavBar() {
  // Constants
  const isNavOpen = useSelector((state) => state.navBar.isNavOpen);
  const isPreviewToggled = useSelector((state) => state.navBar.isPreviewToggled);
  const dispatch = useDispatch();
  const { primary } = useSelector((state) => state.styling);
  const { ppTemplateVersion, ppType } = useSelector((state) => state.accordionPane.metadata);
  const [shortenedPP, setShortenedPP] = useState("PP");
  const styling = {
    largeToggleTypography: {
      color: "white",
    },
    secondaryToggleSwitch: {
      "& .MuiSwitch-switchBase.Mui-checked": {
        color: primary,
        "&:hover": {
          backgroundColor: alpha(primary, 0.04),
        },
      },
      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: primary,
      },
      "& .MuiSwitch-track": {
        backgroundColor: "white",
      },
    },
  };

  // Use Effects
  useEffect(() => {
    getShortenedPPType(ppType);
  }, [ppType]);

  // Methods
  const handlePreviewToggle = async () => {
    await dispatch(RESET_EXPORT());
    await dispatch(setIsPreviewToggled());
  };
  const getShortenedPPType = (ppType) => {
    switch (ppType) {
      case "Functional Package":
        setShortenedPP("FP");
        break;
      case "Protection Profile":
        setShortenedPP("PP");
        break;
      case "Module":
        setShortenedPP("Mod");
        break;
      default:
        setShortenedPP("");
        break;
    }
  };

  // Return Function
  return (
    <nav className='navbar flex text-neutral-content min-w-full bg-base-300 border-2 border-t-3 border-l-3 rounded-lg border-gray-500 mt-1'>
      <Hamburger
        toggled={isNavOpen}
        onToggle={() => {
          dispatch(setIsNavBarOpen());
        }}
      />
      <div className='navbar-start font-title flex font-bold lg:text-3xl md:text-2xl sm:text-xl xs:text-xl text-teal-400 pl-5 lg:py-2'>
        XML Builder&nbsp;
        <div className='text-teal-600' data-testid='pp_version'>{`(${ppTemplateVersion} ${shortenedPP})`}</div>
      </div>
      <div className='navbar-end mr-4'>
        <ToggleSwitch
          title={"Preview"}
          isToggled={isPreviewToggled}
          isSfrWorksheetToggle={false}
          handleUpdateToggle={handlePreviewToggle}
          styling={styling}
          tooltip={!isPreviewToggled ? <h1 style={{ fontSize: "14px" }}>Enabling this feature may reduce tool performance during updates</h1> : ""}
          tooltipId={"previewToggleButton"}
        />
      </div>
    </nav>
  );
}

// Export Class
export default NavBar;
