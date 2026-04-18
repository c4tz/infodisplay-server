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
  start_local: string;
  phq_attendance: number;
  geo: {
    address: {
      postcode: string;
      formatted_address: string;
    };
  };
}

export interface EventsResponse {
  attended_events: FetchedEvent[];
}

export async function fetchEventsData(config: any): Promise<Event[]> {
  if (config.settings.test) {
    const events = getSampleData("events");
    const sorted = events.sort((a, b) => a.date.valueOf() - b.date.valueOf());
    return format(sorted, config, EVENT_FORMAT);
  }

  try {
    const {
      postal_codes: postalCodes,
      attendance_threshold: attendanceThreshold,
      title_replacements: titleReplacements,
    } = config.events;

    const { latitude, longitude } = config.location;
    const baseUrl =
      "https://service-api.phq.io/website-events/predicted-impact-report";

    const locationResponse = await axios.post<{ location_id: string }>(
      `${baseUrl}`,
      {
        origin_geojson: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
        },
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    const locationId = locationResponse.data.location_id;

    // Wait for 2 seconds before the next request,
    // as the server will respond with 404 else
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const url = `${baseUrl}/${locationId}/events`;
    const response = await axios.get<EventsResponse>(url);
    const events = response.data.attended_events;

    const today = dayjs().startOf("day");

    const filteredEvents = events.filter((event) => {
      const eventDate = dayjs(event.start_local);
      const inDateRange = eventDate.isBetween(
        today,
        today.add(config.settings.event_days, "day"),
        "day",
        "[]",
      );
      const inPLZ = postalCodes.some((code: string) =>
        event.geo.address.postcode.includes(code),
      );
      const wholeCity = !event.geo.address.postcode;
      const aboveThreshold = event.phq_attendance >= attendanceThreshold;
      return inDateRange && (inPLZ || wholeCity) && aboveThreshold;
    });

    const unprocessed: Unprocessed[] = filteredEvents.map((entry) => {
      titleReplacements.forEach((r: { search: string; replace: string }) => {
        entry.title = entry.title.replace(r.search, r.replace);
      });
      return {
        title: entry.title,
        date: dayjs(entry.start_local),
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
