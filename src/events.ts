import axios from "axios";
import dayjs from "dayjs";
import { type Event, format, type Unprocessed } from "./common";
import { getSampleData } from "./mocks";

const EVENT_FORMAT = {
  hour: "numeric",
  minute: "numeric",
  day: "numeric",
  month: "numeric",
} as const;

export interface FetchedEvent {
  title: string;
  start: string;
  formatted_address: string;
  entity_name?: string;
}

export interface EventsResponse {
  scheduled_events: FetchedEvent[];
}

export async function fetchEventsData(config: any): Promise<Event[]> {
  if (config.settings.test) {
    const events = getSampleData("events");
    const sorted = events.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    return format(sorted, config, EVENT_FORMAT);
  }

  try {
    const {
      country,
      city,
      postal_codes: postalCodes,
      title_replacements: titleReplacements,
    } = config.events;

    const url = `https://service-api.phq.io/website-events/cities/${country}/${city}`;
    const response = await axios.get<EventsResponse>(url);
    const events = response.data.scheduled_events;

    const today = dayjs().startOf("day");

    const filteredEvents = events.filter((event) => {
      const eventDate = dayjs(event.start);
      const inDateRange = eventDate.isBetween(
        today,
        today.add(config.settings.event_days, "day"),
        "day",
        "[]",
      );
      const inPLZ = postalCodes.some((code: string) =>
        event.formatted_address.includes(code),
      );
      const wholeCity = !event.entity_name;
      return inDateRange && (inPLZ || wholeCity);
    });

    const unprocessed: Unprocessed[] = filteredEvents.map((entry) => {
      titleReplacements.forEach((r: { search: string; replace: string }) => {
        entry.title = entry.title.replace(r.search, r.replace);
      });
      return {
        title: entry.title,
        date: dayjs(entry.start),
      };
    });

    const sorted = unprocessed.sort(
      (a, b) => a.date.valueOf() - b.date.valueOf(),
    );

    return format(sorted, config, EVENT_FORMAT);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
