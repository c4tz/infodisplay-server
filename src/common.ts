import dayjs, { type Dayjs } from "dayjs";

export type Unprocessed = { title: string; date: Dayjs };
export type Event = { title: string; date: string; today: boolean };

export async function format(
  list: Unprocessed[],
  config: any,
  format: any,
): Promise<Event[]> {
  return list.map((entry) => {
    const today = entry.date.isSame(dayjs().startOf("day"), "day");

    let date = config.translations.today;
    let time = "";

    if (
      "hour" in format &&
      "minute" in format &&
      (entry.date.hour() !== 0 || entry.date.minute() !== 0)
    ) {
      time = new Intl.DateTimeFormat(config.settings.locale, {
        hour: format.hour,
        minute: format.minute,
      }).format(entry.date.toDate());
      time = `, ${time}`;
    }

    if (!today) {
      date = new Intl.DateTimeFormat(config.settings.locale, {
        day: format.day,
        month: format.month,
      }).format(entry.date.toDate());
    }

    return {
      title: entry.title,
      date: `${date}${time}`,
      today,
    };
  });
}
