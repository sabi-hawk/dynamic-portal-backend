export interface WeekRange {
  start: Date;
  end: Date;
}

/**
 * Given any date, returns the start (Monday) and end (Sunday) of the ISO week
 * that contains that date.  Time components are cleared so comparison works
 * properly when using UTC dates.
 */
export const getIsoWeekRange = (date: Date = new Date()): WeekRange => {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  // 0 = Sunday, 1 = Monday
  const day = d.getUTCDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day; // if Sunday, go back 6 days; else diff to Monday

  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
};

export const isDateWithinRange = (date: Date, range: WeekRange): boolean => {
  return date >= range.start && date <= range.end;
};
