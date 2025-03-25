// Imports
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { FormControl, IconButton, Input, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import React, { useEffect } from "react";
import AccordionItem from "./AccordionItem.jsx";
import { CREATE_EDITOR } from "../../reducers/editorSlice.js";
import { CREATE_ACCORDION_FORM_ITEM } from "../../reducers/accordionPaneSlice.js";
import { CREATE_TERM_ITEM, CREATE_TERMS_LIST } from "../../reducers/termsSlice.js";
import { CREATE_THREAT_SECTION } from "../../reducers/threatsSlice.js";
import { CREATE_OBJECTIVE_SECTION } from "../../reducers/objectivesSlice.js";
import SecurityComponents from "../../utils/securityComponents.jsx";

/**
 * The AccordionSection component
 * @param props             the import props
 * @returns {JSX.Element}   the tabs element
 * @constructor             passes in props to the className
 */
function AccordionSection(props) {
	// Prop Validation
	AccordionSection.propTypes = {
		uuid: PropTypes.string.isRequired,
		index: PropTypes.number.isRequired,
	};

	// Constants
	const dispatch = useDispatch();
	const { handleSnackBarSuccess } = SecurityComponents
	const { ppTemplateVersion, ppType } = useSelector((state) => state.accordionPane.metadata);
	const { secondary, icons } = useSelector((state) => state.styling);
	const accordions = useSelector((state) => state.accordionPane.sections);
	let [selectedType, setSelectedType] = React.useState("");
	let [selectedName, setSelectedName] = React.useState("");
	let [disabled, setDisabled] = React.useState(true);

	// UseEffects
	useEffect(() => {
		setDisabled(newAccordionDisabled(selectedType, selectedName));
	}, [selectedType, selectedName]);

	// Methods
	const handleSelectedAccordionType = (event) => {
		setSelectedType(event.target.value);
	};
	const handleSelectedAccordionName = (event) => {
		setSelectedName(event.target.value);
	};
	const newAccordionDisabled = (selectedType, selectedName) => {
		let type = selectedType.valueOf();
		let name = selectedName.valueOf();
		return (
			(type !== "Assumptions" &&
				type !== "Objectives" &&
				type !== "Text Editor" &&
				type !== "Threats" &&
				type !== "Terms" &&
				type !== "SFRs" &&
				type !== "SARs") ||
			name === null ||
			name === "" ||
			name === undefined
		);
	};
	const handleNewAccordionSection = async () => {
		if (!disabled) {
			let type = selectedType.valueOf();
			let name = selectedName.valueOf();
			switch (type) {
				case "Terms": {
					let termUUID = await dispatch(CREATE_TERMS_LIST({ title: name }))
						.payload;
					if (termUUID) {
						await dispatch(CREATE_TERM_ITEM({ termUUID: termUUID }));
						await dispatch(
							CREATE_ACCORDION_FORM_ITEM({
								accordionUUID: props.uuid,
								uuid: termUUID,
								contentType: "terms",
							})
						);
					}
					break;
				}
				case "Text Editor":
				case "SARs":
				case "SFRs": {
					let editorUUID = await dispatch(CREATE_EDITOR({ title: name }))
						.payload;
					if (editorUUID) {
						await dispatch(
							CREATE_ACCORDION_FORM_ITEM({
								accordionUUID: props.uuid,
								uuid: editorUUID,
								contentType: "editor",
							})
						);
					}
					break;
				}
				case "Threats":
				case "Assumptions": {
					let threatUUID = await dispatch(
						CREATE_THREAT_SECTION({ title: name })
					).payload;
					if (threatUUID) {
						await dispatch(
							CREATE_ACCORDION_FORM_ITEM({
								accordionUUID: props.uuid,
								uuid: threatUUID,
								contentType: "threats",
							})
						);
					}
					break;
				}
				case "Objectives": {
					let objectiveUUID = await dispatch(
						CREATE_OBJECTIVE_SECTION({ title: name })
					).payload;
					if (objectiveUUID) {
						await dispatch(
							CREATE_ACCORDION_FORM_ITEM({
								accordionUUID: props.uuid,
								uuid: objectiveUUID,
								contentType: "objectives",
							})
						);
					}
					break;
				}
				default:
					break;
			}
			// Reset type and name to default
			setSelectedType("");
			setSelectedName("");

			// Update snackbar
			handleSnackBarSuccess(`New ${type} Section Successfully Added`)
		}
	};

	// Return Method
	return (
		<div className="min-w-full">
			{Object.entries(accordions[props.uuid]) &&
			Object.entries(accordions[props.uuid]).length >= 1 ? (
				<div>
					<div
						className="min-w-full px-4 border-gray-300"
						key={props.uuid + "-AccordionItem"}
					>
						<dl
							className="min-w-full justify-items-center"
							key={props.uuid + "-AccordionItemDL"}
						>
							{accordions[props.uuid].formItems
								?
								Object.entries(accordions[props.uuid].formItems).map(
									([key, value], index) => {
										return (
											<AccordionItem
												key={props.uuid + index}
												headerIndex={(props.index + 1).toString()}
												index={index}
												uuid={value.uuid}
												accordionUUID={props.uuid}
												contentType={value.contentType}
												formItems={value.formItems}
											/>
										);
									})
								: null}
						</dl>
					</div>
					{!accordions[props.uuid].title.toString().toLowerCase().includes("appendix") &&
					(ppTemplateVersion !== "Version 3.1" && !accordions[props.uuid].title.toString().toLowerCase().includes("conformance claims"))
						?
						(<div
							className="w-full flex justify-center py-2 rounded-b-lg border-y-2 border-gray-300 bg-white"
							key={props.uuid + "-NewFormItem"}
						>
							<div className="py-4">
								<FormControl
									style={{ minWidth: "200px", marginRight: 20 }}
									required
									key={props.uuid + "-NewNameItem"}
								>
									<InputLabel id="demo-simple-input-label">
										Section Name
									</InputLabel>
									<Input
										style={{ height: "40px" }}
										label="Accordion Section"
										placeholder={"Enter Section Name..."}
										value={selectedName}
										onChange={handleSelectedAccordionName}
									>
										{selectedName}
									</Input>
								</FormControl>
								<FormControl
									style={{ minWidth: "200px", marginRight: 4 }}
									required
									key={props.uuid + "-NewTypeItem"}
								>
									<InputLabel id="demo-simple-select-label">
										Add New Section
									</InputLabel>
									<Select
										value={selectedType}
										label="Accordion Type"
										onChange={handleSelectedAccordionType}
										sx={{ textAlign: "left" }}
									>
										{accordions[props.uuid].title ===
										"Security Problem Definition" ? (
											<MenuItem key={"assumptions"} value={"Assumptions"}>
												Assumptions
											</MenuItem>
										) : null}
										{accordions[props.uuid].title === "Security Objectives" ? (
											<MenuItem key={"objectives"} value={"Objectives"}>
												Objectives
											</MenuItem>
										) : null}
										{accordions[props.uuid].title ===
										"Security Requirements" ? ([
											ppType === "Protection Profile" && (
												<MenuItem key={"sars"} value={"SARs"}>
													SARs
												</MenuItem>
											),
											<MenuItem key={"sfrs"} value={"SFRs"}>
												SFRs
											</MenuItem>
										]) : null}
										<MenuItem key={"terms"} value={"Terms"}>
											Terms
										</MenuItem>
										<MenuItem key={"editor"} value={"Text Editor"}>
											Text Editor
										</MenuItem>
										{accordions[props.uuid].title ===
										"Security Problem Definition" ? (
											<MenuItem key={"threats"} value={"Threats"}>
												Threats
											</MenuItem>
										) : null}
									</Select>
								</FormControl>
								<IconButton
									variant="contained"
									onClick={handleNewAccordionSection}
									disabled={disabled}
									key={props.uuid + "-SubmitItem"}
								>
									<Tooltip title={"Add New Section"} id={"addNewAccordionSectionTooltip"}>
										<AddCircleRoundedIcon htmlColor={ secondary } sx={{ ...icons.large, marginTop: 1 }}/>
									</Tooltip>
								</IconButton>
							</div>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

// Export AccordionSection.jsx
export default AccordionSection;
