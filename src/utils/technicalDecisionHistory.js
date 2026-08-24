const ALL_WHITESPACE_REGEX = /\s/g;
const UNDERSCORE_REGEX = /_/g;
const DOT_REGEX = /\./g;
const ELEMENT_XML_ID_NOT_PROVIDED = Symbol("elementXMLID not provided");

const getTrimmedValue = (value) => String(value || "").trim();

const getFormattedXmlId = (xmlId) => {
  return xmlId ? String(xmlId).replace(ALL_WHITESPACE_REGEX, "-").replace(UNDERSCORE_REGEX, "-").replace(DOT_REGEX, "-").toLowerCase() : "";
};

const getComponentXmlIdValues = (component, isRequirementsFormat = false) => {
  const { cc_id, iteration_id } = component || {};
  const ccId = cc_id ? cc_id.valueOf() : "";
  const formattedCcId = ccId ? (isRequirementsFormat ? ccId.toUpperCase() : ccId.toLowerCase()).replace(ALL_WHITESPACE_REGEX, "") : "";
  let formattedIterationId = "";

  if (iteration_id && typeof iteration_id === "string" && iteration_id !== "") {
    formattedIterationId = (isRequirementsFormat ? "/" + iteration_id.toUpperCase() : "-" + iteration_id.toLowerCase()).replace(ALL_WHITESPACE_REGEX, "");
  }

  const componentXmlId = isRequirementsFormat ? formattedCcId + formattedIterationId : getFormattedXmlId(formattedCcId + formattedIterationId);

  return {
    formattedCcId,
    formattedIterationId,
    componentXmlId,
  };
};

const getElementId = (formattedCcId, formattedIterationId, index, isElementXMLID) => {
  const elementId = `${formattedCcId + (isElementXMLID ? "e" : ".") + (index + 1) + formattedIterationId}`;
  return isElementXMLID ? getFormattedXmlId(elementId) : elementId;
};

const getElementDisplayName = (component, index) => {
  const { formattedCcId, formattedIterationId } = getComponentXmlIdValues(component, true);
  return getElementId(formattedCcId, formattedIterationId, index, false);
};

const getEffectiveElementXmlId = (component, element, index) => {
  const elementXmlId = getTrimmedValue(element?.elementXMLID);

  if (elementXmlId) {
    return elementXmlId;
  }

  const { formattedCcId, formattedIterationId } = getComponentXmlIdValues(component, false);
  return getElementId(formattedCcId, formattedIterationId, index, true);
};

const dedupeAffects = (affects) => {
  const refIds = [];
  const seenRefIds = new Set();

  affects.forEach((refId) => {
    if (refId && !seenRefIds.has(refId)) {
      seenRefIds.add(refId);
      refIds.push(refId);
    }
  });

  return refIds;
};

export const normalizeTechnicalDecisionAffects = (affects) => {
  if (Array.isArray(affects)) {
    return affects.map((refId) => String(refId || "").trim()).filter((refId) => refId !== "");
  }

  return String(affects || "")
    .split("\n")
    .map((refId) => refId.trim())
    .filter((refId) => refId !== "");
};

export const normalizeTechnicalDecisionHistory = (technicalDecisionHistory) => {
  return Array.isArray(technicalDecisionHistory)
    ? technicalDecisionHistory.map((technicalDecision) => ({
        ...technicalDecision,
        affects: normalizeTechnicalDecisionAffects(technicalDecision.affects),
      }))
    : [];
};

export const getTechnicalDecisionElementRefId = (component, elementUUID, elementXmlIdOverride = ELEMENT_XML_ID_NOT_PROVIDED) => {
  const elementEntries = Object.entries(component?.elements || {});
  const elementIndex = elementEntries.findIndex(([uuid]) => uuid === elementUUID);

  if (elementIndex === -1) {
    return "";
  }

  const element = elementEntries[elementIndex][1] || {};
  const elementForRef = elementXmlIdOverride === ELEMENT_XML_ID_NOT_PROVIDED ? element : { ...element, elementXMLID: elementXmlIdOverride };

  return getEffectiveElementXmlId(component, elementForRef, elementIndex);
};

export const getTechnicalDecisionComponentRefIds = (component) => {
  const componentCcId = getTrimmedValue(component?.cc_id);
  const refIds = componentCcId ? [componentCcId] : [];

  Object.keys(component?.elements || {}).forEach((elementUUID, index) => {
    const elementRefId = getTechnicalDecisionElementRefId(component, elementUUID);
    const elementDisplayName = getElementDisplayName(component, index);

    if (elementRefId) {
      refIds.push(elementRefId);
    }

    if (elementDisplayName) {
      refIds.push(elementDisplayName);
    }
  });

  return dedupeAffects(refIds);
};

export const getTechnicalDecisionRefMaps = (sfrSections) => {
  const maps = {
    validRefIds: new Set(),
    componentCcIds: new Set(),
    elementXmlIdToElementName: new Map(),
    elementRefIdToElementXmlId: new Map(),
  };

  Object.values(sfrSections || {}).forEach((sfrSection) => {
    Object.values(sfrSection || {}).forEach((component) => {
      const componentCcId = getTrimmedValue(component?.cc_id);

      if (componentCcId) {
        maps.validRefIds.add(componentCcId);
        maps.componentCcIds.add(componentCcId);
      }

      Object.values(component?.elements || {}).forEach((element, index) => {
        const elementXmlId = getEffectiveElementXmlId(component, element, index);
        const elementDisplayName = getElementDisplayName(component, index);
        if (elementXmlId) {
          maps.validRefIds.add(elementXmlId);
          maps.elementXmlIdToElementName.set(elementXmlId, elementDisplayName);
          maps.elementRefIdToElementXmlId.set(elementXmlId, elementXmlId);
        }

        if (elementDisplayName && elementXmlId) {
          maps.elementXmlIdToElementName.set(elementDisplayName, elementDisplayName);
          maps.elementRefIdToElementXmlId.set(elementDisplayName, elementXmlId);
        }
      });
    });
  });

  return maps;
};

export const getValidTechnicalDecisionRefIds = (sfrSections) => {
  return getTechnicalDecisionRefMaps(sfrSections).validRefIds;
};

export const sanitizeImportedTechnicalDecisionHistory = (technicalDecisionHistory, sfrSections) => {
  const validRefIds = getValidTechnicalDecisionRefIds(sfrSections);

  return normalizeTechnicalDecisionHistory(technicalDecisionHistory).map((technicalDecision) => ({
    ...technicalDecision,
    affects: technicalDecision.affects.filter((refId) => validRefIds.has(refId)),
  }));
};

export const mapTechnicalDecisionAffectsForDisplay = (affects, sfrSections) => {
  const { componentCcIds, elementXmlIdToElementName } = getTechnicalDecisionRefMaps(sfrSections);

  return normalizeTechnicalDecisionAffects(affects).map((refId) => {
    if (componentCcIds.has(refId)) {
      return refId;
    }

    return elementXmlIdToElementName.get(refId) || refId;
  });
};

export const mapTechnicalDecisionAffectsForExport = (affects, sfrSections) => {
  const { componentCcIds, elementRefIdToElementXmlId } = getTechnicalDecisionRefMaps(sfrSections);
  const exportedAffects = normalizeTechnicalDecisionAffects(affects).map((refId) => {
    if (componentCcIds.has(refId)) {
      return refId;
    }

    return elementRefIdToElementXmlId.get(refId) || refId;
  });

  return dedupeAffects(exportedAffects);
};

export const getTechnicalDecisionSelectedIndex = (technicalDecisionHistory, xmlId, alternateXmlIds = []) => {
  const refId = String(xmlId || "").trim();
  const refIds = new Set(normalizeTechnicalDecisionAffects([refId, ...alternateXmlIds]));

  if (refIds.size === 0) {
    return "";
  }

  const selectedIndex = normalizeTechnicalDecisionHistory(technicalDecisionHistory).findIndex((technicalDecision) =>
    technicalDecision.affects.some((affectedRefId) => refIds.has(affectedRefId))
  );

  return selectedIndex === -1 ? "" : String(selectedIndex);
};

export const updateTechnicalDecisionAffectsSelection = (technicalDecisionHistory, xmlId, selectedIndex, alternateXmlIds = []) => {
  const refId = String(xmlId || "").trim();
  const refIdsToRemove = new Set(normalizeTechnicalDecisionAffects([refId, ...alternateXmlIds]));
  const normalizedHistory = normalizeTechnicalDecisionHistory(technicalDecisionHistory);
  const selectedTechnicalDecisionIndex = selectedIndex === "" || selectedIndex === null || selectedIndex === undefined ? -1 : Number(selectedIndex);

  if (!refId) {
    return normalizedHistory;
  }

  return normalizedHistory.map((technicalDecision, index) => {
    const affects = technicalDecision.affects.filter((affectedRefId) => !refIdsToRemove.has(affectedRefId));

    if (index === selectedTechnicalDecisionIndex && !affects.includes(refId)) {
      affects.push(refId);
    }

    return {
      ...technicalDecision,
      affects,
    };
  });
};

export const moveTechnicalDecisionAffectsReference = (technicalDecisionHistory, oldXmlId, newXmlId, alternateOldXmlIds = []) => {
  const oldRefId = String(oldXmlId || "").trim();
  const newRefId = String(newXmlId || "").trim();
  const oldRefIds = new Set(normalizeTechnicalDecisionAffects([oldRefId, ...alternateOldXmlIds]));
  const normalizedHistory = normalizeTechnicalDecisionHistory(technicalDecisionHistory);

  if (oldRefIds.size === 0 || (oldRefIds.size === 1 && oldRefIds.has(newRefId))) {
    return normalizedHistory;
  }

  const selectedIndex = getTechnicalDecisionSelectedIndex(normalizedHistory, oldRefId, alternateOldXmlIds);

  if (selectedIndex === "") {
    return normalizedHistory;
  }

  const selectedTechnicalDecisionIndex = Number(selectedIndex);

  return normalizedHistory.map((technicalDecision, index) => {
    const affects = technicalDecision.affects.filter((affectedRefId) => !oldRefIds.has(affectedRefId) && affectedRefId !== newRefId);

    if (newRefId && index === selectedTechnicalDecisionIndex) {
      affects.push(newRefId);
    }

    return {
      ...technicalDecision,
      affects,
    };
  });
};

export const moveTechnicalDecisionComponentReferences = (technicalDecisionHistory, oldComponent, newComponent) => {
  let updatedHistory = moveTechnicalDecisionAffectsReference(technicalDecisionHistory, oldComponent?.cc_id, newComponent?.cc_id);

  Object.keys(oldComponent?.elements || {}).forEach((elementUUID, index) => {
    updatedHistory = moveTechnicalDecisionAffectsReference(
      updatedHistory,
      getTechnicalDecisionElementRefId(oldComponent, elementUUID),
      getTechnicalDecisionElementRefId(newComponent, elementUUID),
      [getElementDisplayName(oldComponent, index)]
    );
  });

  return updatedHistory;
};

export const removeTechnicalDecisionAffectsReferences = (technicalDecisionHistory, refIds) => {
  const refsToRemove = new Set(normalizeTechnicalDecisionAffects(refIds));
  const normalizedHistory = normalizeTechnicalDecisionHistory(technicalDecisionHistory);

  if (refsToRemove.size === 0) {
    return normalizedHistory;
  }

  return normalizedHistory.map((technicalDecision) => ({
    ...technicalDecision,
    affects: technicalDecision.affects.filter((affectedRefId) => !refsToRemove.has(affectedRefId)),
  }));
};

export const areTechnicalDecisionHistoriesEqual = (currentHistory, updatedHistory) => {
  return JSON.stringify(normalizeTechnicalDecisionHistory(currentHistory)) === JSON.stringify(normalizeTechnicalDecisionHistory(updatedHistory));
};
