export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-SG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateString = (date: Date) => {
  return formatDate(date).toString().toUpperCase();
};
