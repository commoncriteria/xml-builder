// Imports
import { useEffect, useState } from "react";
import PropTypes, { any } from "prop-types";
import { Button } from "@mui/material";
import TransformIcon from "@mui/icons-material/Transform";
import { Card, CardBody, CardFooter } from "@material-tailwind/react";
import Modal from "./Modal";

/**
 * The SwitchWarning class that confirms a pp switch for either ppTemplateVersion or ppType
 * @param type the switch type (ppTemplateVersion or ppType)
 * @param open the open boolean
 * @param handleOpen the handler for open
 * @param handleClose the handler for close
 * @param currentPPTemplate the current pp template
 * @param targetPPTemplate the target pp template to switch to
 * @returns {JSX.Element}
 * @constructor
 */
function SwitchWarning({ type, open, handleOpen, handleClose, currentPPTemplate, targetPPTemplate }) {
  // Prop Validation
  SwitchWarning.propTypes = {
    type: PropTypes.string.isRequired,
    open: PropTypes.bool,
    handleOpen: PropTypes.func,
    handleClose: PropTypes.func,
    currentPPTemplate: PropTypes.string,
    targetPPTemplate: PropTypes.string,
    children: any,
  };

  // Constants
  const [message, setMessage] = useState("Template");

  let text = "";
  if (currentPPTemplate === "Version 3.1") {
    text = "Conformance section data will be lost and the SARs section will be augmented and updated to conform to CC2022.  ";
  }
  if (targetPPTemplate === "CC2022 Direct Rationale") {
    text += "If you have added an objective to a threat, but have not mapped the objective to an SFR, that dependency will be lost. ";
  }
  if (type && type === "ppType") {
    text += "The data will be reset to the default data, all former data will be lost. ";
  }

  // Use Effects
  useEffect(() => {
    setMessage(type === "ppTemplateVersion" ? "Template" : "Type");
  }, [type]);

  // Return Method
  return (
    <Modal
      title={`Switch PP ${message}?`}
      open={open}
      handleOpen={handleOpen}
      hideSubmit
      content={
        <div className='w-screen-md'>
          <Card>
            <CardBody>
              <div className='text-[14px] max-w-md'>
                {`Warning: Switching the PP ${message} WILL result in irreversible changes:`} <br />
                <br />
                {text}
              </div>
            </CardBody>
            <CardFooter>
              <Button
                sx={{ fontSize: "12px" }}
                component='label'
                variant='contained'
                color='secondary'
                startIcon={<TransformIcon />}
                style={{ color: "white", marginTop: "0px", marginBottom: "5px" }}
                onClick={handleClose}>
                {`Confirm ${message} Switch`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      }
    />
  );
}

// Export SwitchWarning.jsx
export default SwitchWarning;
