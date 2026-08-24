export const COMMON_REGEX = {
  allWhitespace: /\s+/g,
  singleWhitespaceRun: /\s+/,
  whitespaceCharacter: /\s/g,
  quotes: /["']/g,
  underscore: /_/g,
  dot: /\./g,
  parentheticalContent: /\(([^)]+)\)/,
  classTitleAcronym: /\bClass\s+([A-Za-z]{3})\b/,
};

export const EXPORT_REGEX = {
  secPrefix: /^sec:/,
  managementFunctionTrailingPeriod: /\]\.$/,
  caretWhitespace: /\^\s+/g,
  closingTagsBeforeSelectionBracket: /(<\/[a-zA-Z0-9]+>)\s*(<\/[a-zA-Z0-9]+>\])/g,
};

export const FILE_LOADER_REGEX = {
  externalSfrName: /^(.+?)\s+\((?:modified from|optional for|additional to) .+\)$/,
};

export const FILE_PARSER_REGEX = {
  trailingClosingTags: /^([\s\S]*?)((?:\s*<\/[\w:]+>)+\s*)$/,
  newlinesAndTabs: /[\n\t]/g,
  xmlDeclaration: /^<\?xml\s+[^?]+\?>/i,
  xmlDeclarationOpen: /^<\?xml\s+/i,
  xmlDeclarationClose: /\?>$/,
  auditTableTag: /<audit-table\b[^>]*\/>|<audit-table\b[^>]*>[\s\S]*?<\/audit-table>/g,
  xrefSelfClosingWithoutTrailingSpace: /(<xref\b[^>]*\/>)(?! )/g,
  dottedNumber: /\.\d+/,
  ccXpathTag: /cc:([^/\[\]@]+)/g,
  xpathIdAttribute: /@id=['"]([^'"]+)['"]/,
  escapedGreaterThanBeforePeriod: /&gt;\s\./g,
  escapedGreaterThanBeforeComma: /&gt;\s,/g,
  escapedClosingSelectableOrAssignable: /\s+(?=&lt;\/(?:selectable|assignable)&gt;)/g,
  trailingWhitespace: /\s$/,
  brOpenClose: /<br><\/br>/g,
  normalizedBrTag: /<br\s*(?:\/>|>\s*<\/br\s*>)/gi,
  xmlTag: /<([^>]+)>/g,
  lessThanOrEqual: /<=/g,
  lessThan: /</g,
  refIdAttribute: /ref-id="([^"]+)"/g,
  quotedAttributeValue: /"([^"]+)"/,
  escapedAlsoTag: /&lt;also\b[^&]*?(\/&gt;|&gt;&lt;\/also&gt;)/g,
};

export const XML_EXPORT_REGEX = {
  preBlock: /<(h:)?pre\b[^>]*>[\s\S]*?<\/(h:)?pre>/gi,
  unescapedAmpersand: /&(?!amp;|lt;|gt;|quot;|apos;|#)/,
  invalidLessThanStart: /<[^!?/a-zA-Z]/,
  dependsTypeWrapper: /<depends>\s*(<(?:optional|objective)\s*\/>)\s*<\/depends>/g,
  dependsCommentLineBreak: /(<depends\b[^>]*\/>|<\/depends>)\s*\n\s*(<!--.*?-->)/g,
  quoteBeforeTagLineBreak: /"\s*\n\s*</g,
  tagBeforeQuoteLineBreak: />\s*\n\s*"/g,
  whitespaceBeforePunctuation: /\s+([:;,.])/g,
  newlineAfterOpeningBracket: /([\[\(])\s*\n\s*/g,
  newlineBeforeClosingBracket: /\s*\n\s*([\]\)])/g,
  caretBeforeAssignable: /\^\s+(<assignable)/g,
  assignableBeforeSelectable: /(<\/assignable>)\s*(<\/selectable>)/g,
  blankSelectables: /<selectables\b[^>]*>\s*<\/selectables>|<selectables\b[^>]*\/>/g,
  selectablesBeforeDash: /(<\/selectables>)\s*-\s*/g,
  bracketedBlock: /\[(?:[\s\S]*?)\]/g,
  unsafeFileNameCharacter: /[/\\?%*:|"<>]/g,
  tableColgroup: /<(?:[A-Za-z]+:)?colgroup\b[^>]*>[\s\S]*?<\/(?:[A-Za-z]+:)?colgroup>/gi,
  hangingTagWhitespace: /<(\w+)\s+>/g,
  ampersand: /&/g,
  zeroWidthLessThanOrEqual: /\u200C<=/g,
  zeroWidthLessThan: /\u200C</g,
  anchorHrefOpen: /<a href/g,
  orderedListAny: /<(\/?)(?:([A-Za-z]+):)?ol\b([^>]*)>/gi,
  orderedListTypeAttribute: /\stype\s*=\s*["'][^"']*["']/i,
  letteredOrderedListStyle: /\b(?:list-style-type|list-style)\s*:\s*lower-alpha\b/i,
  letteredOrderedListStyle: /\b(?:list-style-type|list-style)\s*:\s*lower-alpha\b/i,
};

export const UI_REGEX = {
  groupNumber: /group-(\d+)/,
  leadingSlashOrWhitespace: /^[/\s+]/g,
  closingTagBeforeSelectionBracket: /\]\s*(<\/[a-zA-Z0-9]+>\])/g,
  trailingHtmlTag: /<\s*(\/?)([a-zA-Z0-9:_-]+)[^>]*>\s*$/,
  nonLetter: /[^a-zA-Z]/g,
  shortNameSeparator: /[\s/]+/g,
  assignmentStrongPrefix: /^<strong>assignment<\/strong>:\s*/,
  acronymWithExpansion: /(.*)\s\((.*)\)/,
};

export const XML_NAMESPACE_TAGS = [
  "p",
  "ol",
  "ul",
  "sup",
  "pre",
  "s",
  "code",
  "i",
  "b",
  "a",
  "h3",
  "li",
  "strike",
  "br",
  "div",
  "strong",
  "em",
  "tr",
  "table",
  "tbody",
  "td",
  "th",
  "span",
  "u",
  "sub",
  "h4",
  "mark",
  "abbr",
];

const OPTIONAL_NAMESPACE_PREFIX = "(?:[A-Za-z]+:)?";

export const createEscapedTagsRegex = (tagNames) => new RegExp(`<(\\/?)(${tagNames.join("|")})\\b([^>]*)>`, "g");

export const createXmlDeclarationAttributeRegex = () => /([a-zA-Z_:][\w:.-]*)\s*=\s*"([^"]*)"/g;

export const createInlineRichTextSpacingRegex = (inlineTags) => {
  const inlineTagPattern = `${OPTIONAL_NAMESPACE_PREFIX}(?:${inlineTags.join("|")})`;
  return new RegExp(`(</${inlineTagPattern}>)(?=<${inlineTagPattern}(?:\\s|>))`, "g");
};

export const createStyleTagRegexes = (styleTags) => {
  const styleTagPattern = `${OPTIONAL_NAMESPACE_PREFIX}(?:${styleTags.join("|")})`;

  return {
    closeSelectablesToStyle: new RegExp(`(</selectables>)\\s*(</${styleTagPattern}>)`, "g"),
    openingBracketStyleWhitespace: new RegExp(`([\\[({]<${styleTagPattern}(?:\\s[^>]*)?>)\\s+`, "g"),
    closeStyleToSelectable: new RegExp(`(</${OPTIONAL_NAMESPACE_PREFIX}(?:${styleTags.join("|")})\\s*>)\\s+(</selectable\\s*>)`, "gi"),
    closeStyleToSelectables: new RegExp(`(</${styleTagPattern}\\s*>)(<selectables\\b)`, "gi"),
    styleToSelectables: new RegExp(`(<${styleTagPattern}\\b[^>]*>)(<selectables\\b)`, "g"),
    closeSelectableToStyle: new RegExp(`(</selectables\\s*>)\\s+(</${OPTIONAL_NAMESPACE_PREFIX}(?:${styleTags.join("|")})\\s*>)`, "gi"),
    closeAssignableToStyle: new RegExp(`(</assignable>)\\s+(</${OPTIONAL_NAMESPACE_PREFIX}(?:${styleTags.join("|")})\\s*>)`, "gi"),
    closeXrefToStyle: new RegExp(`(<xref\\b[^>]*\\/>)\\s+(</${styleTagPattern}>)`, "gi"),
  };
};

export const createXmlCleanupRegexes = (styleTags) => {
  const tagPattern = styleTags.join("|");

  return {
    openStyleBeforeSelectable: new RegExp(`(<(?:${tagPattern})\\b[^>]*>)\\s+(?=<(?:selectables|selectable|assignable)\\b)`, "gi"),
    closeStyleBeforeSelectable: new RegExp(`(</(?:${tagPattern})\\s*>)\\s+(?=</(?:selectables|selectable|assignable)\\b)`, "gi"),
    adjacentSelectableClosingTags: new RegExp(`(</(?:assignable|selectable)>)\\s+(?=</(?:assignable|selectable)>)`, "gi"),
  };
};

export const createNamespaceTagRegex = (tagNames) => new RegExp(`<([\\/]?)(${tagNames.join("|")})(\\s[^>]*)?(\\/)?>`, "gi");

export const createEmptyParagraphRegexes = (namespace) => ({
  closeThenOpen: new RegExp(`<\\/${namespace}:p><${namespace}:p>`, "g"),
  emptyOpenClose: new RegExp(`<${namespace}:p><\\/${namespace}:p>`, "g"),
});

export const createPpPreferenceRegex = (namespace) => new RegExp(`<audit-events-in-sfrs><\\/${namespace}:audit-events-in-sfrs>`, "g");
