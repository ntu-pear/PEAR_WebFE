export const convertToYesNo = (keyValue: string | null | undefined): string => {
  if (keyValue === '1') {
    return 'YES';
  } else if (keyValue === '0') {
    return 'NO';
  } else {
    return '';
  }
};
