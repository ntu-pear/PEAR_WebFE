import dayjs, { type Dayjs } from "dayjs";
import type { CentreActivityExclusion } from "@/api/activity/activityExclusion";

export const getExcludedCentreActivityIds = (
  exclusions: CentreActivityExclusion[],
  rangeStart: Dayjs,
  rangeEnd: Dayjs
): Set<number> =>
  new Set(
    exclusions
      .filter(
        (exclusion) =>
          !exclusion.is_deleted &&
          !dayjs(exclusion.start_date).isAfter(rangeEnd, "day") &&
          (!exclusion.end_date || !dayjs(exclusion.end_date).isBefore(rangeStart, "day"))
      )
      .map((exclusion) => exclusion.centre_activity_id)
  );
