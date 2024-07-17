// Imports
import NavBar from "./components/NavBar.jsx";
import ContentPane from "./components/ContentPane.jsx";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import "../index.css"
import {Box, createTheme, ThemeProvider} from "@mui/material";
import SideBar from "./components/SideBar.jsx";
import {useSelector} from "react-redux";

/**
 * The theme of the mui controls
 * @type {Theme}
 */
const theme = createTheme({
    palette: {
        primary: {
            main: "#1FB2A6"
        },
        secondary: {
            main: "#d926a9"
        }
    },
});

/**
 * The App class that runs the XML Builder project
 * @returns {JSX.Element}   the app element
 * @constructor             the App constructor
 */
function App() {
    // Constants
    const isPreviewToggled = useSelector((state) => state.navBar.isPreviewToggled)
    const isNavOpen = useSelector((state) => state.navBar.isNavOpen)

    // Return Function
    return (
        <div className={"min-w-full min-h-screen bg-base-300" + (isNavOpen ? " grid grid-cols-[max-content_1fr]" : "")}>
            <ThemeProvider theme={theme}>
                <div className={(isNavOpen ? "min-w-[300px] max-w-[300px]" : "")}>
                    <SideBar/>
                </div>
                <div className="min-w-full min-h-screen p-1">
                    {/* The Navigation Bar */}
                    <div className="bg-base-300 min-w-full p-2 sticky top-0 z-30 rounded-sm min-w-[853px]">
                        <NavBar/>
                    </div>
                    {/* The SideBar Menu */}
                    <div className={"w-full rounded-xl min-h-screen p-1" + (isPreviewToggled ? " grid grid-cols-2" : "")}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                m: "5px",
                                bgColor: 'bg-base-200',
                            }}
                        >
                            {/* The Content Pane */}
                            <div className={"bg-neutral border-2 border-gray-500 rounded-lg p-4 w-full overflow-x-hidden min-h-screen min-w-full"}>
                                <ContentPane type={"builder"}/>
                            </div>
                            {/* The Preview Pane */}
                            { isPreviewToggled ?
                                <div className={"bg-neutral border-2 border-gray-500 rounded-lg p-4 ml-2 w-full overflow-x-hidden min-h-screen min-w-full"}>
                                    <ContentPane type={"preview"}/>
                                </div>
                                : null
                            }
                        </Box>
                    </div>
                </div>
            </ThemeProvider>
        </div>
    )
}

// Export Class
export default App