export const SELECTION_FORMATTING_FIELDS = [
  {
    field: "bold",
    label: "Bold",
    tag: "b",
    aliases: ["b", "strong"],
  },
  {
    field: "underline",
    label: "Underline",
    tag: "u",
    aliases: ["u"],
  },
  {
    field: "strikethrough",
    label: "Strikethrough",
    tag: "s",
    aliases: ["s", "strike"],
  },
];

export const getSelectionFormatting = (source = {}) =>
  SELECTION_FORMATTING_FIELDS.reduce((formatting, { field }) => {
    formatting[field] = Boolean(source?.[field]);
    return formatting;
  }, {});

export const mergeSelectionFormatting = (...sources) =>
  SELECTION_FORMATTING_FIELDS.reduce((formatting, { field }) => {
    formatting[field] = sources.some((source) => Boolean(source?.[field]));
    return formatting;
  }, {});

export const applySelectionFormatting = (content = "", formatting = {}) => {
  const text = content === undefined || content === null ? "" : String(content);

  return SELECTION_FORMATTING_FIELDS.reduceRight((formattedContent, { field, tag }) => {
    return formatting?.[field] ? `<${tag}>${formattedContent}</${tag}>` : formattedContent;
  }, text);
};

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const unwrapSelectionFormatting = (content = "") => {
  let currentContent = content === undefined || content === null ? "" : String(content).trim();
  const wrappers = [];
  let foundWrapper = true;

  while (foundWrapper) {
    foundWrapper = false;

    for (const { field, aliases } of SELECTION_FORMATTING_FIELDS) {
      const tagPattern = aliases.map(escapeRegExp).join("|");
      const wrapperRegex = new RegExp(`^(<(${tagPattern})(?:\\s[^>]*)?>)([\\s\\S]*)<\\/\\2>$`, "i");
      const match = currentContent.match(wrapperRegex);

      if (match) {
        wrappers.push({
          field,
          openingTag: match[1],
          closingTag: `</${match[2]}>`,
        });
        currentContent = match[3].trim();
        foundWrapper = true;
        break;
      }
    }
  }

  return { content: currentContent, wrappers };
};

export const hasSelectionFormattingField = (content = "", field) => unwrapSelectionFormatting(content).wrappers.some((wrapper) => wrapper.field === field);

export const stripSelectionFormattingField = (content = "", field) => {
  const { content: unwrappedContent, wrappers } = unwrapSelectionFormatting(content);

  if (!wrappers.some((wrapper) => wrapper.field === field)) {
    return {
      content: content === undefined || content === null ? "" : String(content),
      stripped: false,
    };
  }

  const strippedContent = wrappers.reduceRight((formattedContent, wrapper) => {
    return wrapper.field === field ? formattedContent : `${wrapper.openingTag}${formattedContent}${wrapper.closingTag}`;
  }, unwrappedContent);

  return {
    content: strippedContent,
    stripped: true,
  };
};
