import { createSlice } from '@reduxjs/toolkit'

const initialState = {}

export const sfrPreview = createSlice({
    name: 'sfrPreview',
    initialState,
    reducers: {
        GET_COMPLEX_SELECTABLE_PREVIEW: (state, action) => {
            let complexSelectable = ""
            try {
                const { selectables, selectableGroups, currentSelectable } = action.payload
                complexSelectable = getComplexSelectable(selectables, selectableGroups, currentSelectable)
            } catch (e) {
                console.log(e)
            } finally {
                action.payload.complexSelectable = complexSelectable
            }
        },
        GET_REQUIREMENTS_TITLE_PREVIEW: (state, action) => {
            let titleSection = ""
            try {
                const { selectables, selectableGroups, title } = action.payload
                titleSection = getTitle(selectables, selectableGroups, title)
            } catch (e) {
                console.log(e)
            } finally {
                action.payload.titleSection = titleSection
            }
        },
    },
})

// Helper Methods
const getTitle = (selectables, selectableGroups, currentTitle) => {
    let titleString = ""
    let title = [];
    try {
        if (currentTitle && currentTitle.length > 0) {
            currentTitle.forEach((section) => {
                const key = Object.keys(section)[0]
                let value = Object.values(section)[0]
                switch (key) {
                    case "assignment": case "selections": {
                        if (value) {
                            const isBullet = false;
                            const notSelectable = false;
                            let selectable = getGroupItemsByType(value, selectables, selectableGroups, isBullet, notSelectable)
                            if (!title.includes(selectable)) {
                                title.push(selectable)
                            }
                        }
                        break;
                    }
                    case "description": case "text": {
                        value = value.replace("<p>", "<body>")
                        value = value.replace("</p>", "</body>")
                        if (value && !title.includes(value)) {
                            title.push(value)
                        }
                        break;
                    }
                    default: break;
                }
            })

            // Create title string and remove excess whitespace where possible
            titleString = title.join(" ")
            titleString = cleanUpStringHelper(titleString);
        }
    } catch (e) {
        console.log(e)
    }
    return titleString
}
const getComplexSelectable = (selectables, selectableGroups, currentSelectable) => {
    let selectableString = ""
    let selectable = [];
    try {
        if (currentSelectable && Object.keys(currentSelectable).length > 0) {
            const {description, notSelectable, exclusive} = currentSelectable
            if (description && description.length > 0) {
                description.forEach((item) => {
                    if (item.hasOwnProperty("text") && item.text) {
                        if (!selectable.includes(item.text)) {
                            selectable.push(item.text)
                        }
                    } else if (item.hasOwnProperty("groups")) {
                        let groups = item.groups
                        if (groups && groups.length > 0) {
                            let groupArray = []
                            let isBullet = groups.length <= 1 ? false : true
                            groups?.forEach((selectableItem) => {
                                if (selectableGroups.hasOwnProperty(selectableItem)) {
                                    let selectableGroup = getGroupItemsByType(selectableItem, selectables, selectableGroups, isBullet, notSelectable)
                                    if (selectableGroup && !groupArray.includes(selectableGroup)) {
                                        groupArray.push(selectableGroup)
                                    }
                                } else
                                if (selectables.hasOwnProperty(selectableItem)) {
                                    let selectable = getSelectable(selectables[selectableItem], isBullet)
                                    if (selectable && !groupArray.includes(selectable)) {
                                        groupArray.push(selectable)
                                    }
                                }
                            })

                            // Add in extra values to the formatted group
                            let formattedGroup = groupArray.join(" ")
                            if (isBullet) {
                                if (notSelectable) {
                                    formattedGroup = `<i><s>${formattedGroup}</i></s>`
                                }
                                formattedGroup = `<ul>${formattedGroup}</ul>`
                                formattedGroup = `[<b>selection${(exclusive && groupArray.length > 1 ) ? ", choose one of" : ""}</b>: ${formattedGroup}]`
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
                                            formattedGroup = `<i><s>${formattedGroup}</i></s>`
                                        }
                                    }
                                    if (!formattedGroup.includes("assignment")) {
                                        formattedGroup = `[<b>selection</b>: ${formattedGroup}]`
                                    }
                                }
                            }
                            if (!selectable.includes(formattedGroup)) {
                                selectable.push(formattedGroup)
                            }
                        }
                    }
                })
            }
            selectableString = selectable.join(" ")
            selectableString = cleanUpStringHelper(selectableString);
        }
    } catch (e) {
        console.log(e)
    }
    return selectableString
}
const getSelectable = (currentSelectable, isBullet) => {
    let formattedSelectable = ""
    try {
        if (currentSelectable && Object.keys(currentSelectable).length > 0 && currentSelectable.hasOwnProperty("description")) {
            formattedSelectable = currentSelectable.description
            if (currentSelectable.notSelectable) {
                formattedSelectable = `<i><s>${formattedSelectable}</i></s>`
            }
            if (currentSelectable.assignment) {
                formattedSelectable = `[<b>assignment</b>: ${formattedSelectable}]`
            }
            if (isBullet) {
                formattedSelectable = `<li><i>${formattedSelectable}</i></li>`
            }
            formattedSelectable = cleanUpStringHelper(formattedSelectable);
        }
    } catch (e) {
        console.log(e)
    }
    return formattedSelectable
}
const getGroupItemsByType = (currentID, selectables, selectableGroups, isBullet, notSelectable) => {
    let selectableGroupArray = []
    let selectableGroupString = ""
    try {
        // Check if item is a selectable
        if (selectables.hasOwnProperty(currentID)) {
            let selectable = getSelectable(selectables[currentID], false)
            if (!selectableGroupArray.includes(selectable)) {
                selectableGroupArray.push(selectable)
            }
        }
        // Check if item is a group or complex selectable
        else if (selectableGroups.hasOwnProperty(currentID)) {
            const selectableGroup = selectableGroups[currentID]
            // Check if the current item is a complex selectable
            if (selectableGroup.hasOwnProperty("description")) {
                let complexSelectable = getComplexSelectable(selectables, selectableGroups, selectableGroup)
                if (!selectableGroupArray.includes(complexSelectable)) {
                    selectableGroupArray.push(complexSelectable)
                }
            }
            // Check if the current item is a group
            else if (selectableGroup.hasOwnProperty("groups")) {
                let group = getSelectablesGroup(selectables, selectableGroups, selectableGroup, notSelectable)
                if (!selectableGroupArray.includes(group)) {
                    selectableGroupArray.push(group)
                }
            }
        }

        // Format string
        selectableGroupString = selectableGroupArray.join(" ")

        // Add bullet if it is a bullet and return
        if (isBullet) {
            selectableGroupString = `<li><i>${selectableGroupString}</i></li>`
        }

        // Clean up string
        selectableGroupString = cleanUpStringHelper(selectableGroupString);
    } catch (e) {
        console.log(e)
    }
    return selectableGroupString
}
const getSelectablesGroup = (selectables, selectableGroups, currentGroup, notSelectable) => {
    let selectableGroupArray = []
    let selectableGroupString = ""
    try {
        const { onlyOne, groups } = currentGroup
        let isBullet = groups.length <= 1 ? false : true
        if (groups && groups.length > 0) {
            groups.forEach((item) => {
                let itemString = getGroupItemsByType(item, selectables, selectableGroups, isBullet)
                if (!selectableGroupArray.includes(itemString)) {
                    selectableGroupArray.push(itemString)
                }
            })
        }

        // Format string
        selectableGroupString = selectableGroupArray.join(" ")

        // Add not selectable
        if (notSelectable) {
            selectableGroupString = `<i><s>${selectableGroupString}</i></s>`
        }

        // Add bullets
        if (isBullet) {
            selectableGroupString = `<ul>${selectableGroupString}</ul>`
        }

        // Add selection
        selectableGroupString = `[<b>selection${(onlyOne && groups.length > 1 ) ? ", choose one of" : ""}</b>: ${selectableGroupString}]`
        selectableGroupString = cleanUpStringHelper(selectableGroupString);
    } catch (e) {
        console.log(e)
    }
    return selectableGroupString
}
const cleanUpStringHelper = (originalString) => {
    originalString = originalString.trim();
    return originalString.replace(/^[/\s+]/g, ' ');
}

// Action creators are generated for each case reducer function
export const {
    GET_COMPLEX_SELECTABLE_PREVIEW,
    GET_REQUIREMENTS_TITLE_PREVIEW
} = sfrPreview.actions

export default sfrPreview.reducer