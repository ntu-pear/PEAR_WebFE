import dayjs from "dayjs"; 
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: string) => {
  return dayjs
    .utc(date) // Parse the date in UTC
    .tz("Asia/Singapore") // Convert to Singapore timezone
    .format("DD-MMM-YYYY"); // Format as "21 Jan 2025"
};

export const formatDateString = (date: string) => {
  return formatDate(date).toString().toUpperCase();
};

export const formatDateWithWeekday = (date: string | null) => {
  if (!date) return "-";
  return dayjs.utc(date)
    .tz("Asia/Singapore")
    .format("ddd, DD-MM-YYYY"); // "ddd" gives short weekday, e.g., "Mon", "Tue"
};

export const formatTime = (date: string) => {
  return dayjs
    .utc(date) // Parse the date in UTC
    .tz("Asia/Singapore") // Convert to Singapore timezone
    .format("h:mm A"); // Format as "08:53 PM"
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

// get time diff using the server as reference point
export const getTimeDiffFromServer = (serverDateTime: string) => {
  const serverInUTC = dayjs.utc(serverDateTime);
  const clientInUTC = dayjs.utc();
  return serverInUTC.diff(clientInUTC);
};

// Format datetime to "dd/mmm/yyyy time" format eg "21/Jan/2025 08:53 AM" without UTC conversion
export const formatDateTime = (date: string | null) => {
  if (!date) return "-";
  return dayjs(date)
    .format("DD-MMM-YYYY h:mm A");
};

export const formatDateTimeNoYear = (date: string | null) => {
  if (!date) return "-";
  return dayjs(date)
    .format("DD-MMM h:mm A");
};

export const formatTimeForInput12h = () => {
  return dayjs()
    .tz("Asia/Singapore") // use Singapore time
    .format("hh:mm A");   // 12-hour format with correct AM/PM
};

export const formatTimeFromHHMMSS = (time: string) => {
  const today = dayjs().format("YYYY-MM-DD");
  return dayjs.tz(`${today}T${time}`, "Asia/Singapore").format("h:mm A");
};


export const to12HourParts = (time: string) => {
  const d = dayjs(time, "HH:mm");
  return {
    hour: d.format("h"),      // "9"
    minute: d.format("mm"),   // "00"
    period: d.format("A"),    // "AM"
  };
};

export const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
  return dayjs(`${hour}:${minute} ${period}`, "h:mm A").format("HH:mm");
};
``
