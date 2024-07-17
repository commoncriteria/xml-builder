// Imports
import React from "react";
import {FormControl, IconButton, TextField, Tooltip} from "@mui/material";
import AccordionContent from "./AccordionContent.jsx";
import {useDispatch, useSelector} from "react-redux";
import {updateMetaDataItem} from "../../reducers/accordionPaneSlice.js";
import SfrCard from "../editorComponents/securityComponents/sfrComponents/SfrCard.jsx";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

/**
 * The MetadataSection class that the metadata section of the content pane
 * @returns {JSX.Element}   the generic modal content
 * @constructor             passes in props to the class
 */
function MetadataSection() {
    // Constants
    const style = {primary: "#d926a9"}
    const dispatch = useDispatch()
    const metadataSection = useSelector((state) => state.accordionPane.metadata);

    // Methods
    const handleUpdates = (type, event) => {
        let item;
        switch (type) {
            case "ppName": {
                item = event.target.value
                break;
            } case "version": {
                item = event.target.value
                break;
            } case "releaseDate": {
                item = event.target.value
                break;
            } case "revisionHistory": {
                if (event === "new") {
                    item = metadataSection.revisionHistory ? JSON.parse(JSON.stringify(metadataSection.revisionHistory)) : []
                    item.push({version: "", date: "", comment: ""})
                } else if (event.hasOwnProperty("updateType") && event.updateType === "delete" && event.hasOwnProperty("index")) {
                    item = metadataSection.revisionHistory ? JSON.parse(JSON.stringify(metadataSection.revisionHistory)) : []
                    if (item[event.index]) {
                        item.splice(event.index, 1)
                    }
                } else if (event.hasOwnProperty("type") && event.hasOwnProperty("item") && event.hasOwnProperty("index")) {
                    item = metadataSection.revisionHistory ? JSON.parse(JSON.stringify(metadataSection.revisionHistory)) : []
                    item[event.index][event.type] = event.item
                }
                break;
            } case "open": {
                item = !metadataSection.open.valueOf()
                break;
            }
            default: break;
        }

        // Update metadata
        dispatch(updateMetaDataItem({type: type, item: item}))
    }

    // Return Method
    return (
        <AccordionContent
            title={"Metadata Section"}
            open={metadataSection.open}
            metadata={
                <div className="min-w-full">
                    <div className="min-w-full px-4 pb-2 border-gray-300">
                        <div className="mx-[-16px] mt-[-8px]">
                            <SfrCard
                                type={"section"}
                                header={<label className="resize-none justify-center flex font-bold text-[18px] p-0 pr-4 text-secondary">Current Revision</label>}
                                body={
                                    <span className="flex justify-stretch min-w-full pb-2">
                                        <FormControl fullWidth>
                                            <TextField required color={"secondary"} label={"PP Name"}
                                                       key={metadataSection.ppName} defaultValue={metadataSection.ppName}
                                                       inputProps={{style: {fontSize: 17}}} InputLabelProps={{style: {fontSize: 18}}}
                                                       onBlur={(event) => {handleUpdates("ppName", event)}}/>
                                        </FormControl>
                                        <FormControl fullWidth sx={{paddingLeft: 2}}>
                                            <TextField required color={"secondary"} label={"Version"} type={"number"}
                                                       key={metadataSection.version} defaultValue={metadataSection.version}
                                                       inputProps={{style: {fontSize: 17}}} InputLabelProps={{style: {fontSize: 18}}}
                                                       onBlur={(event) => {handleUpdates("version", event)}}/>
                                        </FormControl>
                                        <FormControl fullWidth sx={{paddingLeft: 2}}>
                                            <TextField required color={"secondary"} label={"Release Date"} type={'date'}
                                                       key={metadataSection.releaseDate} defaultValue={metadataSection.releaseDate}
                                                       inputProps={{style: {fontSize: 17}}} InputLabelProps={{style: {fontSize: 18}, shrink: true }}
                                                       onBlur={(event) => {handleUpdates("releaseDate", event)}}/>
                                        </FormControl>
                                    </span>
                                }
                            />
                        </div>
                        <div className="mx-[-16px]">
                            <SfrCard
                                type={"section"}
                                header={<label className="resize-none justify-center flex font-bold text-[18px] p-0 pr-4 text-secondary">Revision History</label>}
                                body={
                                    <div className="w-full">
                                        <div className="w-full overflow-y-auto mb-4 rounded-md border-2 border-gray-300">
                                            <table className="w-full border-0 p-0 m-0">
                                                <thead className="w-full border-b-2 border-gray-300">
                                                <tr>
                                                    <th className="text-secondary text-[17px] text-center border-r-2 border-gray-300 align-middle p-2 break-all w-[31%]">Version</th>
                                                    <th className="text-secondary text-[17px] text-center border-r-2 border-gray-300 align-middle p-2 break-all w-[31%]">Date</th>
                                                    <th className="text-secondary text-[17px] text-center border-r-2 border-gray-300 align-middle p-2 break-all w-[31%]">Comment</th>
                                                    <th className="text-secondary text-[17px] text-center align-middle p-2 break-all w-[6%]">Remove</th>
                                                </tr>
                                                </thead>
                                                <tbody className="w-full">
                                                    {metadataSection.revisionHistory?.map((value, index) => {
                                                        return (
                                                            <tr className="text-[16px] font-medium break-all" key={"MetadataRevisionHistory-" + index}>
                                                                <td className="border-r-2 border-gray-300 align-middle text-center">
                                                                    <input type="text" contentEditable="true" value={value.version ? value.version : ""}
                                                                           className="border-none bg-transparent text-center"
                                                                           onChange={(event) => {
                                                                               handleUpdates("revisionHistory", {type: "version", item: event.target.value, index: index})
                                                                           }}/>
                                                                </td>
                                                                <td className="border-r-2 border-gray-300 align-middle text-center">
                                                                    <input type="date" contentEditable="true" value={value.date ? value.date : ""}
                                                                           className="border-none bg-transparent text-center p-1"
                                                                           onChange={(event) => {
                                                                               handleUpdates("revisionHistory", {type: "date", item: event.target.value, index: index})
                                                                           }}/>
                                                                </td>
                                                                <td className="border-r-2 border-gray-300 align-middle text-center">
                                                                    <input type="text" contentEditable="true" value={value.comment ? value.comment : ""}
                                                                           className="border-none bg-transparent text-center"
                                                                           onChange={(event) => {
                                                                               handleUpdates("revisionHistory", {type: "comment", item: event.target.value, index: index})
                                                                           }}/>
                                                                </td>
                                                                <td>
                                                                    <div className="text-center align-middle w-full">
                                                                        <IconButton onClick={() => {handleUpdates("revisionHistory", {updateType: "delete", index: index})}}>
                                                                            <Tooltip title={"Delete Revision"}>
                                                                                <DeleteForeverRoundedIcon htmlColor={style.primary} sx={{ width: 26, height: 26 }}/>
                                                                            </Tooltip>
                                                                        </IconButton>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="border-t-2 border-gray-200 m-0 p-0 pt-4 pb-1 mx-[-16px]">
                                            <div className="w-full p-0 m-0 mb-1 h-[20px] justify-center flex">
                                                <IconButton sx={{marginY: "-10px"}} onClick={() => {handleUpdates("revisionHistory", "new")}}>
                                                     <Tooltip title={"Add to Revision History"}>
                                                         <AddCircleIcon htmlColor={style.primary} sx={{ width: 30, height: 30 }}/>
                                                     </Tooltip>
                                                 </IconButton>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            }
            handleMetaDataCollapse={handleUpdates}
        />
    );
}

// Export MetadataSection.jsx
export default MetadataSection;