import dayjs from "dayjs";
import ICAL from "ical.js";
import { createDAVClient } from "tsdav";
import { type Event, format, type Unprocessed } from "./common";
import { getSampleData } from "./mocks";

const CALENDAR_FORMAT = {
  hour: "numeric",
  minute: "numeric",
  day: "numeric",
  month: "numeric",
} as const;

const BIRTHDAY_FORMAT = {
  day: "numeric",
  month: "numeric",
} as const;

async function login(
  auth: any,
  endpoint: string,
  accountType: "caldav" | "carddav" = "caldav",
) {
  return await createDAVClient({
    serverUrl: endpoint,
    credentials: auth.basic
      ? {
          username: auth.basic.username,
          password: auth.basic.password,
        }
      : {
          tokenUrl: auth.oauth.token_url,
          username: auth.oauth.username,
          refreshToken: auth.oauth.refresh_token,
          clientId: auth.oauth.client_id,
          clientSecret: auth.oauth.client_secret,
        },
    authMethod: auth.basic ? "Basic" : "Oauth",
    defaultAccountType: accountType,
  });
}

export async function fetchCalendarEvents(
  config: any,
  type: string,
): Promise<Event[]> {
  if (config.settings.test) {
    const mockData =
      type === "trash" ? getSampleData("trash") : getSampleData("appointments");
    const sorted = mockData.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    return format(sorted, config, CALENDAR_FORMAT);
  }

  const events: Unprocessed[] = [];
  const today = dayjs().startOf("day");
  const daysConfig =
    type === "trash"
      ? config.settings.trash_days
      : config.settings.appointments_days;
  const endDate = today.add(daysConfig, "day");

  for (const account of config.accounts) {
    if (!account.caldav || (type && !account.caldav.mappings?.[type])) continue;

    try {
      const client = await login(account.auth, account.caldav.endpoint);
      const calendars = await client.fetchCalendars();

      for (const cal of calendars) {
        if (account.caldav.mappings[type] !== cal.displayName) continue;
        const calendarObjects = await client.fetchCalendarObjects({
          calendar: cal,
          timeRange: { start: today.toISOString(), end: endDate.toISOString() },
        });

        for (const obj of calendarObjects) {
          if (obj.data) {
            const jcalData = ICAL.parse(obj.data);
            const comp = new ICAL.Component(jcalData);
            const vevent = comp.getFirstSubcomponent("vevent");
            if (vevent) {
              const event = new ICAL.Event(vevent);
              const startDate = dayjs(event.startDate.toJSDate());
              let title = event.summary;
              if (type === "trash" && config.trash?.title_replacements) {
                config.trash.title_replacements.forEach(
                  (r: { search: string; replace: string }) => {
                    title = title.replace(r.search, r.replace);
                  },
                );
              }
              events.push({ title, date: startDate });
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const sorted = events.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  return format(sorted, config, CALENDAR_FORMAT);
}

export async function fetchBirthdays(config: any): Promise<Event[]> {
  if (config.settings.test) {
    const birthdays = getSampleData("birthdays");
    const sorted = birthdays.sort(
      (a, b) => a.date.valueOf() - b.date.valueOf(),
    );
    return format(sorted, config, BIRTHDAY_FORMAT);
  }

  const birthdays: Unprocessed[] = [];
  const today = dayjs().hour(0).minute(0).second(0).millisecond(0);
  const birthdayDays = config.settings?.birthday_days || 7;

  for (const account of config.accounts) {
    if (!account.carddav) continue;

    try {
      const client = await login(
        account.auth,
        account.carddav.endpoint,
        "carddav",
      );
      const addressBooks = await client.fetchAddressBooks();

      for (const addressBook of addressBooks) {
        const vcards = await client.fetchVCards({ addressBook });

        for (const vcard of vcards) {
          if (!vcard.data) continue;

          try {
            const jCardData = ICAL.parse(vcard.data);
            const comp = new ICAL.Component(jCardData);

            const n = comp.getFirstPropertyValue("n") as string[] | null;
            const bday = comp.getFirstPropertyValue("bday");

            if (!(n && bday)) continue;
            const birthday = dayjs((bday as ICAL.VCardTime).toJSDate());
            const thisYear = birthday.year(today.year());
            const nextYear = birthday.year(today.year() + 1);
            const diffThis = thisYear.diff(today, "day");
            const diffNext = nextYear.diff(today, "day");
            if (diffThis >= -3 && diffThis <= birthdayDays) {
              birthdays.push({ title: n[1], date: thisYear });
            } else if (diffNext <= birthdayDays) {
              birthdays.push({ title: n[1], date: nextYear });
            }
          } catch (error) {
            console.error("Error parsing vCard:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching birthdays:", error);
    }
  }

  const sorted = birthdays.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  return format(sorted, config, BIRTHDAY_FORMAT);
}
