// Imports
import { useDispatch, useSelector } from "react-redux";
import { Alert, Slide, Snackbar } from "@mui/material";
import { updateSnackBar } from "../reducers/accordionPaneSlice.js";

/**
 * The snackbar component that displays an alert type message
 * @returns {JSX.Element}
 * @constructor
 */
const SnackBar = () => {
    // Constants
    const dispatch = useDispatch();
    const {
        open,
        message,
        severity,
        vertical,
        horizontal,
        autoHideDuration,
    } = useSelector((state) => state.accordionPane.snackbar);

    // Methods
    const handleClose = () => {
        dispatch(updateSnackBar({}))
    }

    // Components
    function SlideTransition(props) {
        return <Slide {...props} direction="up" />;
    }

    // Return Method
    return(
        <Snackbar
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            key={vertical + horizontal}
            TransitionComponent={SlideTransition}
            anchorOrigin={{
                vertical,
                horizontal
            }}
            open={open}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    )
}

// Export SnackBar.jsx
export default SnackBar;