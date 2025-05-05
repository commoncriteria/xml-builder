// Imports
import PropTypes from "prop-types";
import React from 'react';
import { useSelector } from "react-redux";
import {Box, LinearProgress, Typography} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// External Components
/**
 * The linear progress bar with a label of the current percentage
 * @param props
 * @returns {Element}
 * @constructor
 */
function LinearProgressWithLabel(props) {
    // Prop Types
    LinearProgressWithLabel.propTypes = {
        /**
         * The value of the progress indicator for the determinate and buffer variants.
         * Value between 0 and 100.
         */
        value: PropTypes.number.isRequired,
    }

    // Return Method
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress color="secondary" variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}

/**
 * The progress bar class
 * @param isLoading variable if the progress bar is loading
 * @returns {Element}
 * @constructor
 */
const ProgressBar = ({ isLoading }) => {
    // Prop Types
    ProgressBar.propTypes = {
        isLoading: PropTypes.bool.isRequired,
    };

    // Constants
    const { progress, steps } = useSelector((state) => state.progressBar);
    const { primary, icons } = useSelector((state) => state.styling);

    // Components
    const ProgressStatusIcon = (key, value) => {
        return (
            <Box display="flex" alignItems="center">
                { value ?
                    <CheckCircleIcon htmlColor={ primary } sx={ icons.small }/>
                    :
                    <RadioButtonUncheckedIcon htmlColor={ primary } sx={ icons.small }/>
                }

                <Typography sx={{textAlign: "start"}} variant="h8" component="span" marginLeft={1}>
                    {key}
                </Typography>
            </Box>
        )
    }
    const getColumn = (start, end) => {

        return (
            <Box>
                { Object.entries(steps).slice(start, end)
                    .map(([key, value], index) => (
                        <Box key={`col-${index}`}>
                            {ProgressStatusIcon(key, value)}
                        </Box>
                ))}
            </Box>
        )
    }

    // Return Method
    return (
        <div>
            {isLoading ?
                <div className="mt-2 w-full">
                    <Box sx={{width: '100%'}}>
                        <label>
                            * Warning: If the dialog is closed prematurely, all data will reset to its default state
                        </label>
                        <Box>
                            <LinearProgressWithLabel value={progress}/>
                            {steps && Object.entries(steps).length > 0 ?
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: 1,
                                        paddingY: 1
                                    }}
                                >
                                    {/* Get the first column */}
                                    {getColumn(0, 5)}
                                    {/* Get the second column */}
                                    {getColumn(5, 10)}
                                    {/* Get the third column */}
                                    {getColumn(10, 15)}
                                    {/* Get the fourth column */}
                                    {getColumn(15, undefined)}
                                </Box>
                                :
                                null
                            }
                        </Box>
                    </Box>
                </div>
                :
                null
            }
        </div>
    )
};

// Export ProgressBar.jsx
export default ProgressBar;