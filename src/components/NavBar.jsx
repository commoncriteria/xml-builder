// Imports
import Hamburger from 'hamburger-react'
import { useSelector, useDispatch } from 'react-redux'
import { setIsNavBarOpen, setIsPreviewToggled } from '../reducers/navBarSlice.js'
import {alpha, Stack, styled, Switch, Tooltip, Typography} from "@mui/material";
import {RESET_EXPORT} from "../reducers/exportSlice.js";

// Styling
const AccentSwitch = styled(Switch)(({ theme }) => {
    return ({
        '& .MuiSwitch-switchBase.Mui-checked': {
            color: "#D926A9",
            '&:hover': {
                backgroundColor: alpha("#D926A9", theme.palette.action.hoverOpacity),
            },
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: "#D926A9",
        },
        '& .MuiSwitch-track': {
            backgroundColor: "white",
        }
    });
});

/**
 * The NavBar class that displays the navigation bar and search capability
 * @returns {JSX.Element}   the navigation bar content
 * @constructor             passes in props to the class
 */
function NavBar() {
    // Constants
    const isNavOpen = useSelector((state) => state.navBar.isNavOpen)
    const isPreviewToggled = useSelector((state) => state.navBar.isPreviewToggled)
    const dispatch = useDispatch()

    // Return Function
    return (
        <nav className="navbar flex text-neutral-content min-w-full bg-base-300 border-2 border-t-3 border-l-3 rounded-lg border-gray-500 mt-1">
            <Hamburger toggled={isNavOpen}  onToggle={() => {dispatch(setIsNavBarOpen())}}/>
            <div className="navbar-start font-title flex font-bold lg:text-5xl md:text-4xl sm:text-2xl xs:text-2xl text-teal-400 pl-5 lg:py-2">XML Builder</div>
            <div className="navbar-end mr-4">
                <Stack direction="row" component="label" alignItems="center" justifyContent="center">
                    <Typography style={{color:"white"}}>Preview</Typography>
                    <Tooltip arrow  placement="bottom"
                        title={
                            !isPreviewToggled ?
                                <h1 style={{fontSize: "16px"}}>Enabling this feature may reduce tool performance during updates</h1>
                            : ""
                        }
                    >
                        <AccentSwitch
                            checked={isPreviewToggled} inputProps={{ 'aria-label': 'controlled' }} size="medium"
                            onChange={async () => {
                                await dispatch(RESET_EXPORT())
                                await dispatch(setIsPreviewToggled())
                            }} />
                    </Tooltip>
                </Stack>
            </div>
        </nav>
    )
}

// Export Class
export default NavBar;