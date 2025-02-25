import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend Day.js with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: string) => {
  return dayjs
    .utc(date) // Parse the date in UTC
    .tz("Asia/Singapore") // Convert to Singapore timezone
    .format("DD MMM YYYY"); // Format as "21 Jan 2025"
};

export const formatDateString = (date: string) => {
  return formatDate(date).toString().toUpperCase();
};

export const formatTime = (date: string) => {
  return dayjs
    .utc(date) // Parse the date in UTC
    .tz("Asia/Singapore") // Convert to Singapore timezone
    .format("hh:mm A"); // Format as "08:53 PM"
};

export const formatTimeString = (date: string) => {
  return formatTime(date).toString().toUpperCase();
};

export const getDateTimeNowInUTC = () => {
  return dayjs.utc().toISOString();
};

export const getDateForDatePicker = (isoDateTime: string) => {
  return dayjs(isoDateTime).format("YYYY-MM-DD");
};

export const convertToUTCISOString = (date: string) => {
  return dayjs.utc(date, "YYYY-MM-DD").toISOString();
};
