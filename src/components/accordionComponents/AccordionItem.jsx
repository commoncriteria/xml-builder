// Imports
import PropTypes from "prop-types";
import AccordionItemByType from "./AccordionItemByType.jsx";

/**
 * The AccordionItem component
 * @param headerIndex the header index used for the header
 * @param index the index the index of the accordion item
 * @param uuid the uuid the uuid of the accordion item
 * @param accordionUUID the accordion parent uuid
 * @param type the accordion type
 *        values: appendixI, compliantTargetsOfEvaluation, conformanceClaims, editor, terms, threats, objectives, sfrs, sars, sfrBasePPs
 * @param formItems the form items array of the parent accordion
 * @returns {JSX.Element}
 * @constructor
 */
function AccordionItem({ headerIndex, index, uuid, accordionUUID, type, formItems }) {
  // Prop Validation
  AccordionItem.propTypes = {
    headerIndex: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    uuid: PropTypes.string.isRequired,
    accordionUUID: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    formItems: PropTypes.array,
  };

  // Constants
  const sectionNumber = `${headerIndex}.${index + 1}`;

  // Return Method
  return (
    <div className='min-w-full' key={uuid + "-AccordionItemDiv"}>
      <div className='min-w-full' key={uuid + "-AccordionItemInnerDiv"}>
        <dl className='min-w-full border-0 justify-items-center'>
          <div className='min-w-full' key={uuid + "-AccordionItem"}>
            <div className='min-w-full pb-1' key={uuid + "-AccordionInnerItem"}>
              <AccordionItemByType type={type} uuid={uuid} section={sectionNumber} accordionUUID={accordionUUID} />
            </div>
            {formItems &&
              Array.isArray(formItems) &&
              formItems.length > 0 &&
              formItems.map((value, index) => {
                const { uuid: currentUUID, contentType, formItems: innerFormItems } = value;

                return (
                  <div className='min-w-full' key={currentUUID + "-AccordionFormItem"}>
                    <AccordionItem
                      headerIndex={sectionNumber}
                      index={index}
                      key={currentUUID}
                      uuid={currentUUID}
                      accordionUUID={accordionUUID}
                      type={contentType}
                      formItems={innerFormItems}
                    />
                  </div>
                );
              })}
          </div>
        </dl>
      </div>
    </div>
  );
}

// Export AccordionItem.jsx
export default AccordionItem;
