// Imports
import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide } from "@mui/material";

/**
 * The dialog slide transition
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{}> & React.RefAttributes<unknown>>}
 */
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props}/>;
});

/**
 * The Modal class that displays the generic modal
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function Modal(props) {
    // Prop Validation
    Modal.propTypes = {
        title: PropTypes.string.isRequired,
        content: PropTypes.node.isRequired,
        open: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        hideSubmit: PropTypes.bool,
        fullscreen: PropTypes.bool,
        handleOpen: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func,
        handleIsScrolling: PropTypes.func
    };

    // Constants
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
    useEffect(() => {
        if (props.hasOwnProperty("handleIsScrolling")) {
            props.handleIsScrolling(isScrolling)
        }
    }, [isScrolling])

    // Return Method
    return (
        <div>
            <Dialog
                open={props.open}
                TransitionComponent={Transition}
                fullScreen={props.fullscreen && props.fullscreen === true ? true : false}
                keepMounted
                onClose={props.handleOpen}
                aria-describedby="alert-dialog-slide-description"
                style={{ borderRadius: "100px" }}
                maxWidth={"lg"}
            >
                <DialogTitle
                    color="secondary"
                    sx={{
                        margin: 0,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "22px",
                        lineHeight: "1.6",
                        letterSpacing: "0.0075em",
                        padding: "16px 24px",
                        flex: "auto",
                        backgroundColor: "#F3F4F6"
                    }}
                >{props.title}
                </DialogTitle>
                <DialogContent
                    ref={scrollContainerRef}
                    sx={{
                        margin: 0,
                        textAlign: "center",
                        color: "black",
                        fontWeight: "normal",
                        fontSize: "14px",
                        flex: "auto",
                        marginTop: "20px",
                    }}
                >{props.content}
                </DialogContent>
                <DialogActions
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "8px"
                    }}
                >
                    <Button onClick={props.handleOpen} variant={`${(props.hideSubmit ? "contained" : "outlined")}`} color={"primary"} sx={{fontSize: "14px", color: (props.hideSubmit ? "white" : "primary")}}>
                        <span>Close</span>
                    </Button>
                    {
                        props.hideSubmit ?
                            null
                            :
                            <Button variant="contained" color={"primary"} onClick={props.handleSubmit} disabled={props.disabled}
                                    sx={{fontSize: "14px", color: "white"}}>
                                <span>Confirm</span>
                            </Button>
                    }
                </DialogActions>
            </Dialog>
        </div>
    );
}

// Export Modal.jsx
export default Modal;