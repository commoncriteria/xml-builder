// Imports
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import { TRANSFORM_TABULARIZE_DATA, UPDATE_TABULARIZE_UI_ITEMS } from "../../../../../reducers/SFRs/tabularizeUI.js";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded.js";
import AddIcon from "@mui/icons-material/Add.js";
import RemoveIcon from "@mui/icons-material/Remove.js";
import TabularizeTable from "./TabularizeTable.jsx";
import EditTabularizeDefinitionModal from "../../../../modalComponents/EditTabularizeDefinitionModal.jsx";

/**
 * The TabularizeTableSection class that displays a tabularize table section for the sfr worksheet
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function TabularizeTableSection(props) {
    // Prop Validation
    TabularizeTableSection.propTypes = {
        sfrUUID: PropTypes.string.isRequired,
        componentUUID: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        elementUUID: PropTypes.string.isRequired,
        elementTitle: PropTypes.string.isRequired,
        updateSfrSectionElement: PropTypes.func.isRequired,
        getElementMaps: PropTypes.func.isRequired,
        allSfrOptions: PropTypes.object.isRequired,
        getSelectablesMaps: PropTypes.func.isRequired,
        getElementValuesByType: PropTypes.func.isRequired,
        getSelectionBasedArrayByType: PropTypes.func.isRequired,
    };

    // Constants
    const dispatch = useDispatch();
    const { secondary, icons } = useSelector((state) => state.styling);
    const [collapse, setCollapse] = useState(false)
    const [openNewTabularizeTableModal, setOpenNewTabularizeTableModal] = useState(false)
    const [tabularizeUUIDs, setTabularizeUUIDs] = useState([])

    // Use Effect
    useEffect(() => {
        // Set tabularize UUIDs
        const uuids = props.getElementValuesByType("tabularizeUUIDs")
        if (JSON.stringify(tabularizeUUIDs) !== JSON.stringify(uuids)) {
            setTabularizeUUIDs(uuids)
        }
    }, [props]);

    // Methods
    const handleOpenNewModal = () => {
        if (!openNewTabularizeTableModal) {
            // Set item map and update values
            dispatch(TRANSFORM_TABULARIZE_DATA({
                type: "transform"
            }))
        }

        // Open the modal
        setOpenNewTabularizeTableModal(!openNewTabularizeTableModal);
    }

    // Helper Methods
    const getTabularizeObject = () => {
        let tabularize = JSON.parse(JSON.stringify(props.getElementValuesByType("tabularize")))
        return tabularize ? tabularize : {};
    }
    const updateTabularizeTableUI = (itemMap) => {
        dispatch(UPDATE_TABULARIZE_UI_ITEMS({itemMap: itemMap}))
    }

    // Return Method
    return (
        <div className="p-2 px-4">
            <EditTabularizeDefinitionModal
                open={openNewTabularizeTableModal}
                elementUUID={props.elementUUID}
                componentUUID={props.componentUUID}
                handleOpen={handleOpenNewModal}
                getElementValuesByType={props.getElementValuesByType}
                updateSfrSectionElement={props.updateSfrSectionElement}
                updateTabularizeTableUI={updateTabularizeTableUI}
                getTabularizeObject={getTabularizeObject}
            />
            <Card className="w-full rounded-lg border-2 border-gray-200">
                <CardBody className="w-full m-0 p-0 border-b-2 border-gray-200">
                    <div className="w-full border-b-2 border-b-gray-200 p-4 pb-2">
                        <span className="min-w-full inline-flex items-baseline">
                            <div className="w-[1%]">
                                <IconButton
                                    sx={{marginTop: "-12px"}}
                                    key={"TabularizeButton"}
                                    variant="contained"
                                    onClick={() => {setCollapse(!collapse)}}
                                >
                                    <Tooltip
                                        title={`${(collapse ? "Collapse " : "Expand ") + "Crypto Selection Tables"}`}
                                        id={(collapse ? "collapse" : "expand") + "TabularizeTooltip"}
                                    >
                                        {
                                            !collapse ?
                                                <RemoveIcon htmlColor={ secondary } sx={ icons.large }/>
                                                :
                                                <AddIcon htmlColor={ secondary } sx={ icons.large }/>
                                        }
                                    </Tooltip>
                                </IconButton>
                            </div>
                            <div className="w-[95%] justify-items-center">
                                <label className="resize-none font-bold text-[14px] p-0 text-accent mt-1">Crypto Selection Tables</label>
                            </div>
                        </span>
                    </div>
                    { !collapse ?
                        <div className="py-2 w-full">
                            <div className="m-0 p-0 px-4 w-full max-w-6xl mb-[8px]">
                                {tabularizeUUIDs.map((tabularizeUUID, index) => (
                                    <TabularizeTable
                                        index={index}
                                        key={tabularizeUUID}
                                        sfrUUID={props.sfrUUID}
                                        componentUUID={props.componentUUID}
                                        component={props.component}
                                        elementUUID={props.elementUUID}
                                        elementTitle={props.elementTitle}
                                        tabularizeUUID={tabularizeUUID}
                                        updateSfrSectionElement={props.updateSfrSectionElement}
                                        getTabularizeObject={getTabularizeObject}
                                        getElementMaps={props.getElementMaps}
                                        allSfrOptions={props.allSfrOptions}
                                        getSelectablesMaps={props.getSelectablesMaps}
                                        getElementValuesByType={props.getElementValuesByType}
                                        getSelectionBasedArrayByType={props.getSelectionBasedArrayByType}
                                        updateTabularizeTableUI={updateTabularizeTableUI}
                                    />
                                ))}
                            </div>
                        </div>
                        :
                        null
                    }
                </CardBody>
                { !collapse ?
                    <CardFooter className="w-full m-0 p-0">
                        <div
                            className="w-full flex justify-center p-0 py-1 bg-white"
                            key={"TabularizeTableSectionFooter"}>
                            <IconButton
                                key={"AddNewTabularizeTableButton"}
                                onClick={handleOpenNewModal}
                                variant="contained"
                            >
                                <Tooltip title={"Create New Crypto Selection Table"} id={"createNewTabularizeTbleTooltip"}>
                                    <AddCircleRoundedIcon htmlColor={secondary} sx={icons.medium}/>
                                </Tooltip>
                            </IconButton>
                        </div>
                    </CardFooter>
                    :
                    null
                }
            </Card>
        </div>
    )
}

// Export TabularizeTableSection.jsx
export default TabularizeTableSection;