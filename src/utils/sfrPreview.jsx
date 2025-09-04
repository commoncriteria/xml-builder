import { style_tags } from "./fileParser.js";

// Methods
/**
 * Gets the sfr preview text string
 * @param inputs the inputs
 * @returns {string}
 */
export const getSfrPreviewTextString = (inputs) => {
  let textString = "";
  let textArray = [];
  const { selectables, selectableGroups, currentTextArray, tabularize } = inputs;

  try {
    if (currentTextArray && currentTextArray.length > 0) {
      currentTextArray.forEach((section, index) => {
        const key = Object.keys(section)[0];
        let value = Object.values(section)[0];

        switch (key) {
          case "assignment":
          case "selections": {
            if (value) {
              const isBullet = false;
              const notSelectable = false;
              let selectable = getGroupItemsByType(value, selectables, selectableGroups, isBullet, notSelectable);
              if (!textArray.includes(selectable)) {
                textArray.push(selectable);
              }
            }
            break;
          }
          case "description":
          case "text": {
            value = value.replace("<p>", "<div>");
            value = value.replace("</p>", "</div>");
            if (value && !textArray.includes(value)) {
              textArray.push(value);
            }
            break;
          }
          case "tabularize": {
            if (tabularize && tabularize.hasOwnProperty(value)) {
              try {
                const tabularizeObject = tabularize[value];
                const formatted = getTabularizedSection(tabularizeObject, selectables, selectableGroups, index);

                if (!textArray.includes(formatted)) {
                  textArray.push(formatted);
                }
              } catch (e) {
                console.log(e);
              }
            }
            break;
          }
          default:
            break;
        }
      });

      // Create title string and remove excess whitespace where possible
      textString = textArray.reduce((finalArr, currItem) => smartAppend(finalArr, currItem), "");
      textString = cleanUpStringHelper(textString);
    }
  } catch (e) {
    console.log(e);
  }
  return textString;
};
/**
 * Gets the complex selectable text string
 * @param inputs the inputs
 * @returns {string}
 */
export const getComplexSelectableTextString = (inputs) => {
  let selectableString = "";
  let selectable = [];
  const { selectables, selectableGroups, currentSelectable } = inputs;

  try {
    if (currentSelectable && Object.keys(currentSelectable).length > 0) {
      const { description, notSelectable, exclusive } = currentSelectable;

      if (description && description.length > 0) {
        description.forEach((item) => {
          if (item.hasOwnProperty("text") && item.text) {
            if (!selectable.includes(item.text)) {
              selectable.push(item.text);
            }
          } else if (item.hasOwnProperty("groups")) {
            let groups = item.groups;
            if (groups && groups.length > 0) {
              let groupArray = [];
              let isBullet = groups.length <= 1 ? false : true;
              groups?.forEach((selectableItem) => {
                if (selectableGroups.hasOwnProperty(selectableItem)) {
                  let selectableGroup = getGroupItemsByType(selectableItem, selectables, selectableGroups, isBullet, notSelectable);
                  if (selectableGroup && !groupArray.includes(selectableGroup)) {
                    groupArray.push(selectableGroup);
                  }
                } else if (selectables.hasOwnProperty(selectableItem)) {
                  let selectable = getSelectable(selectables[selectableItem], isBullet);
                  if (selectable && !groupArray.includes(selectable)) {
                    groupArray.push(selectable);
                  }
                }
              });

              // Add in extra values to the formatted group
              let formattedGroup = groupArray.join(" ");

              if (isBullet) {
                if (notSelectable) {
                  formattedGroup = `<i><s>${formattedGroup}</i></s>`;
                }
                formattedGroup = `<ul>${formattedGroup}</ul>`;
                formattedGroup = `[<b>selection${exclusive && groupArray.length > 1 ? ", choose one of" : ""}</b>: ${formattedGroup}]`;
              } else {
                if (groups.length === 1 && selectables.hasOwnProperty(groups[0])) {
                  if (notSelectable) {
                    if (formattedGroup.includes("assignment")) {
                      // Add strike through to the inner text of assignment and update if it is not selectable
                      let start = formattedGroup.indexOf(": ") + 2;
                      let end = formattedGroup.indexOf("]", start);
                      let extracted = formattedGroup.substring(start, end);
                      let updated = `<i><s>${extracted}</s></i>`;
                      formattedGroup = formattedGroup.substring(0, start) + updated + formattedGroup.substring(end);
                    } else {
                      formattedGroup = `<i><s>${formattedGroup}</i></s>`;
                    }
                  }
                  if (!formattedGroup.includes("assignment")) {
                    formattedGroup = `[<b>selection</b>: ${formattedGroup}]`;
                  }
                }
              }
              if (!selectable.includes(formattedGroup)) {
                selectable.push(formattedGroup);
              }
            }
          }
        });
      }
      selectableString = selectable.join(" ");
      selectableString = cleanUpStringHelper(selectableString);
    }
  } catch (e) {
    console.log(e);
  }
  return selectableString;
};

// Helper Methods
/**
 * Gets the selectable
 * @param currentSelectable the current selectable
 * @param isBullet the is bullet (boolean)
 * @returns {string}
 */
const getSelectable = (currentSelectable, isBullet) => {
  let formattedSelectable = "";
  try {
    if (currentSelectable && Object.keys(currentSelectable).length > 0 && currentSelectable.hasOwnProperty("description")) {
      formattedSelectable = currentSelectable.description;
      if (currentSelectable.notSelectable) {
        formattedSelectable = `<i><s>${formattedSelectable}</i></s>`;
      }
      if (currentSelectable.assignment) {
        formattedSelectable = `[<b>assignment</b>: ${formattedSelectable}]`;
      }
      if (isBullet) {
        formattedSelectable = `<li><i>${formattedSelectable}</i></li>`;
      }
      formattedSelectable = cleanUpStringHelper(formattedSelectable);
    }
  } catch (e) {
    console.log(e);
  }
  return formattedSelectable;
};
/**
 * Gets the group items by type
 * @param currentID the current id
 * @param selectables the selectables
 * @param selectableGroups the selectable groups
 * @param isBullet the is bullet (boolean)
 * @param notSelectable the not selectable (boolean)
 * @returns {string}
 */
const getGroupItemsByType = (currentID, selectables, selectableGroups, isBullet, notSelectable = false) => {
  let selectableGroupArray = [];
  let selectableGroupString = "";
  try {
    // Check if item is a selectable
    if (selectables.hasOwnProperty(currentID)) {
      let selectable = getSelectable(selectables[currentID], false);
      if (!selectableGroupArray.includes(selectable)) {
        selectableGroupArray.push(selectable);
      }
    }
    // Check if item is a group or complex selectable
    else if (selectableGroups.hasOwnProperty(currentID)) {
      const selectableGroup = selectableGroups[currentID];
      // Check if the current item is a complex selectable
      if (selectableGroup.hasOwnProperty("description")) {
        let complexSelectable = getComplexSelectableTextString({
          selectables,
          selectableGroups,
          currentSelectable: selectableGroup,
        });
        if (!selectableGroupArray.includes(complexSelectable)) {
          selectableGroupArray.push(complexSelectable);
        }
      }
      // Check if the current item is a group
      else if (selectableGroup.hasOwnProperty("groups")) {
        let group = getSelectablesGroup(selectables, selectableGroups, selectableGroup, notSelectable);
        if (!selectableGroupArray.includes(group)) {
          selectableGroupArray.push(group);
        }
      }
    }

    // Format string
    selectableGroupString = selectableGroupArray.join(" ");

    // Add bullet if it is a bullet and return
    if (isBullet) {
      selectableGroupString = `<li><i>${selectableGroupString}</i></li>`;
    }

    // Clean up string
    selectableGroupString = cleanUpStringHelper(selectableGroupString);
  } catch (e) {
    console.log(e);
  }
  return selectableGroupString;
};
/**
 * Gets the selectables group
 * @param selectables the selectables
 * @param selectableGroups the selectable groups
 * @param currentGroup the current group
 * @param notSelectable the is not selectable (boolean)
 * @returns {string}
 */
const getSelectablesGroup = (selectables, selectableGroups, currentGroup, notSelectable) => {
  let selectableGroupArray = [];
  let selectableGroupString = "";
  try {
    const { onlyOne, groups } = currentGroup;
    let isBullet = groups.length <= 1 ? false : true;
    if (groups && groups.length > 0) {
      groups.forEach((item) => {
        let itemString = getGroupItemsByType(item, selectables, selectableGroups, isBullet);
        if (!selectableGroupArray.includes(itemString)) {
          selectableGroupArray.push(itemString);
        }
      });
    }

    // Format string
    selectableGroupString = selectableGroupArray.join(" ");

    // Add not selectable
    if (notSelectable) {
      selectableGroupString = `<i><s>${selectableGroupString}</i></s>`;
    }

    // Add bullets
    if (isBullet) {
      selectableGroupString = `<ul>${selectableGroupString}</ul>`;
    }

    // Add selection
    selectableGroupString = `[<b>selection${onlyOne && groups.length > 1 ? ", choose one of" : ""}</b>: ${selectableGroupString}]`;
    selectableGroupString = cleanUpStringHelper(selectableGroupString);
  } catch (e) {
    console.log(e);
  }
  return selectableGroupString;
};
/**
 * Gets the tabularize section
 * @param tabularize the tabularize
 * @param selectables the selectables
 * @param selectableGroups the selectables groups
 * @param index the index
 * @returns {string}
 */
const getTabularizedSection = (tabularize, selectables, selectableGroups, index) => {
  const { title = "", definitionString = "", columns = [], rows = [] } = tabularize;
  const padding = index > 0 ? `<div class="pt-5"/>` : "";

  const tableString = `
        ${padding}
        ${definitionString}
        <br/><br/>
        <div class="text-center font-bold">Table: ${title}</div>
        <br/>
        <div className="w-full">
            <div className="border-t-2 border-gray-300 rounded-md overflow-x-auto">
                <table className="min-w-full border-0 border-collapse mt-[-4px] overflow-hidden">
                    ${getTabularizedColumns(columns)}
                    ${getTabularizedRows(columns, rows, selectables, selectableGroups)}
                </table>
            </div>
        </div>
    `;

  return tableString;
};
/**
 * Gets the tabularized columns
 * @param columns the columns
 * @returns {string}
 */
const getTabularizedColumns = (columns) => {
  const tableColumns = `
        <thead>
            <tr>
                ${columns
                  .filter((column) => column.field !== "selectableId")
                  .map(({ headerName }) => `<th key={column.field} className="min-w-[125px] border-2 border-gray-300 px-4 py-2">${headerName}</th>`)
                  .join("")}
            </tr>
        </thead>
    `;

  return tableColumns;
};
/**
 * Gets the tabularized rows
 * @param columns the columns
 * @param rows the rows
 * @param selectables the selectables
 * @param selectableGroups the selectable groups
 * @returns {string}
 */
const getTabularizedRows = (columns, rows, selectables, selectableGroups) => {
  const tableRows = `
        <tbody>
            ${rows
              .map(
                (row) => `
                <tr>
                    ${columns
                      .map((column) => {
                        const field = column.field;
                        const cellData = row[field];

                        if (field !== "selectableId") {
                          const textString = Array.isArray(cellData)
                            ? getSfrPreviewTextString({
                                selectables,
                                selectableGroups,
                                currentTextArray: cellData,
                              })
                            : cellData || "";
                          return `<td classname="border-2 border-gray-300 px-4 py-2">${textString}</td>`;
                        }
                      })
                      .join("")}
                </tr>
            `
              )
              .join("")}
        </tbody>
    `;
  return tableRows;
};
/**
 * The clean-up string helper
 * @param originalString the original string
 * @returns {*}
 */
const cleanUpStringHelper = (originalString) => {
  originalString = originalString.trim();
  return originalString
    .replace(/^[/\s+]/g, " ")
    .replace(/\^\s+/g, "^")
    .replace(/\]\s*(<\/[a-zA-Z0-9]+>\])/g, "]$1");
};
/**
 * Checks if text is a rich text element
 * @param {*} htmlEnd
 * @returns
 */
const precededByRichText = (htmlEnd) => {
  if (!htmlEnd) return false;
  const tail = htmlEnd.trimEnd();

  // capture the last HTML tag at the end of the string
  const m = tail.match(/<\s*(\/?)([a-zA-Z0-9:_-]+)[^>]*>\s*$/);
  if (!m) return false;

  const isClosing = m[1] === "/";
  if (isClosing) return false;

  const tag = (m[2] || "").toLowerCase();
  const base = tag.includes(":") ? tag.split(":")[1] : tag; // normalize namespace

  return style_tags.includes(base);
};
/**
 * Checks if element is a selectable(s)/assignable
 * @param {*} s
 * @returns
 */
const startsWithSelectables = (s) => {
  if (!s) return false;
  const t = s.trimStart();

  return (
    /^<\s*selectables\b/i.test(t) || /^<\s*selectable\b/i.test(t) || /^<\s*assignable\b/i.test(t) || /^\[\s*<\s*b\s*>selection/i.test(t) || /^<\s*ul\b/i.test(t)
  );
};
/**
 * Don't add trailing space if previous element is opening of a rich text tag and next element is
 * selectable(s)/assignable
 * @param {*} acc
 * @param {*} next
 * @returns
 */
const smartAppend = (acc, next) => {
  if (!acc) return next;
  if (precededByRichText(acc) && startsWithSelectables(next)) {
    return acc + next;
  }
  return acc + " " + next;
};
