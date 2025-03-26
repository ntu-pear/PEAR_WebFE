export const convertCamelCaseToLabel = (camelCase: string) => {
  return removeListIDSuffix(camelCase)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
};

const removeListIDSuffix = (text: string) => {
  return text.endsWith("ListID") ? text.slice(0, text.length - 6) : text;
};
