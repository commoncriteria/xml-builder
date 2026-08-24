import PropTypes from "prop-types";
import Modal from "./Modal.jsx";
import { getDependencyUsageSummary } from "../../utils/evaluationActivityDependencyRemoval.js";

function DependencyDeleteWarning({ itemLabel, open, handleOpen, handleSubmit, usage }) {
  DependencyDeleteWarning.propTypes = {
    itemLabel: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    usage: PropTypes.object,
  };

  const usageSummary = getDependencyUsageSummary(usage);

  return (
    <Modal
      title={"Dependency Delete Warning"}
      content={
        <div className='p-4 text-[14px]'>
          <p className='mb-3'>
            The <span className='font-bold'>{itemLabel}</span> you are deleting is used as a dependency.
          </p>
          {usageSummary.length > 0 && <p className='mb-3'>Affected dependency relationship(s): {usageSummary.join(", ")}.</p>}
          <p>Deleting it will also remove those dependency relationships from Test, Test List, TSS, and Guidance content.</p>
        </div>
      }
      open={open}
      handleOpen={handleOpen}
      handleSubmit={handleSubmit}
    />
  );
}

export default DependencyDeleteWarning;
