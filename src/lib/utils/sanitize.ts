import sanitizeHtml from "sanitize-html";

const sanitizeInput = (dirty: string) => {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export const sanitizedText = (text: string): string => {
  return sanitizeInput(text);
};
