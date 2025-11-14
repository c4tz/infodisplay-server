import dayjs from "dayjs";
import type { Unprocessed } from "./common";
import type { ProcessedWeatherData } from "./weather";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSlice<T>(arr: T[]): T[] {
  const count = randomInt(2, 6);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const ALL_APPOINTMENTS: Unprocessed[] = [
  {
    title: "Doctor appointment",
    date: dayjs().hour(10).minute(30),
  },
  { title: "Team meeting", date: dayjs().add(2, "day").hour(14).minute(0) },
  {
    title: "Lunch with Sarah",
    date: dayjs().add(3, "day").hour(12).minute(30),
  },
  { title: "Dentist checkup", date: dayjs().add(5, "day").hour(9).minute(0) },
  { title: "Gym session", date: dayjs().add(6, "day").hour(18).minute(0) },
  {
    title: "Coffee with Alex",
    date: dayjs().add(7, "day").hour(15).minute(30),
  },
  { title: "Project review", date: dayjs().add(8, "day").hour(11).minute(0) },
  { title: "Piano lesson", date: dayjs().add(9, "day").hour(16).minute(0) },
  {
    title: "Dinner reservation",
    date: dayjs().add(4, "day").hour(19).minute(30),
  },
  { title: "Conference call", date: dayjs().add(1, "day").hour(15).minute(0) },
];

const ALL_TRASH: Unprocessed[] = [
  { title: "General waste", date: dayjs().add(2, "day").hour(7).minute(0) },
  { title: "Recycling", date: dayjs().hour(7).minute(0) },
  { title: "Paper & cardboard", date: dayjs().add(6, "day").hour(7).minute(0) },
  { title: "Organic waste", date: dayjs().add(8, "day").hour(7).minute(0) },
  { title: "Glass & bottles", date: dayjs().add(3, "day").hour(7).minute(0) },
  { title: "Plastic & metal", date: dayjs().add(7, "day").hour(7).minute(0) },
  { title: "Garden waste", date: dayjs().add(9, "day").hour(7).minute(0) },
  { title: "Bulky items", date: dayjs().add(10, "day").hour(7).minute(0) },
];

const ALL_BIRTHDAYS: Unprocessed[] = [
  { title: "John", date: dayjs().add(1, "day").startOf("day") },
  { title: "Emma", date: dayjs().startOf("day") },
  { title: "Michael", date: dayjs().add(5, "day").startOf("day") },
  { title: "Sophia", date: dayjs().add(7, "day").startOf("day") },
  { title: "William", date: dayjs().add(9, "day").startOf("day") },
  { title: "Olivia", date: dayjs().add(2, "day").startOf("day") },
  { title: "James", date: dayjs().add(4, "day").startOf("day") },
  { title: "Ava", date: dayjs().add(6, "day").startOf("day") },
  { title: "Robert", date: dayjs().add(8, "day").startOf("day") },
  { title: "Isabella", date: dayjs().add(10, "day").startOf("day") },
];

const ALL_EVENTS: Unprocessed[] = [
  {
    title: "Summer Music Festival",
    date: dayjs().add(1, "day").hour(19).minute(0),
  },
  {
    title: "Art Gallery Opening",
    date: dayjs().add(2, "day").hour(18).minute(30),
  },
  { title: "Food Truck Rally", date: dayjs().add(4, "day").hour(12).minute(0) },
  { title: "Farmers Market", date: dayjs().add(5, "day").hour(8).minute(0) },
  { title: "Jazz Night", date: dayjs().hour(20).minute(0) },
  { title: "Film Screening", date: dayjs().add(7, "day").hour(19).minute(30) },
  {
    title: "Theater Performance",
    date: dayjs().add(9, "day").hour(19).minute(0),
  },
  { title: "Street Fair", date: dayjs().add(3, "day").hour(10).minute(0) },
  { title: "Book Reading", date: dayjs().add(8, "day").hour(17).minute(0) },
  {
    title: "Community Concert",
    date: dayjs().add(10, "day").hour(20).minute(30),
  },
];

export function getSampleData(
  type: "appointments" | "trash" | "birthdays" | "events",
): Unprocessed[] {
  switch (type) {
    case "appointments":
      return randomSlice(ALL_APPOINTMENTS);
    case "trash":
      return randomSlice(ALL_TRASH);
    case "birthdays":
      return randomSlice(ALL_BIRTHDAYS);
    case "events":
      return randomSlice(ALL_EVENTS);
  }
}

export function generateSampleWeather(
  weatherTranslations: any,
  iconMappings: any,
  locale: string,
): ProcessedWeatherData {
  const currentTemp = randomInt(10, 30);

  // Available weather codes from mappings
  const weatherCodes = Object.keys(iconMappings)
    .map(Number)
    .filter((code) => code !== 99999);

  const getRandomCode = () =>
    weatherCodes[randomInt(0, weatherCodes.length - 1)];

  const mapIcon = (code: number, isDay: number) => {
    const weatherInfo = iconMappings[code];
    if (!isDay && weatherInfo.alt) {
      return weatherInfo.alt;
    }
    return weatherInfo.icon;
  };

  const currentCode = getRandomCode();
  const currentIsDay = randomInt(0, 1);

  const hourly1Code = getRandomCode();
  const hourly1IsDay = randomInt(0, 1);
  const hourly2Code = getRandomCode();
  const hourly2IsDay = randomInt(0, 1);
  const hourly3Code = getRandomCode();
  const hourly3IsDay = randomInt(0, 1);

  const daily1Code = getRandomCode();
  const daily2Code = getRandomCode();
  const daily3Code = getRandomCode();

  return {
    current: {
      temperature: currentTemp,
      weather: weatherTranslations.codes[currentCode],
      icon: mapIcon(currentCode, currentIsDay),
      uv: randomInt(0, 11),
    },
    hourly: [
      {
        time: new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(
          dayjs().add(3, "hour").toDate(),
        ),
        temperature: randomInt(currentTemp - 3, currentTemp + 3),
        weather: weatherTranslations.codes[hourly1Code],
        icon: mapIcon(hourly1Code, hourly1IsDay),
        uv: randomInt(0, 11),
        precipitation: `${weatherTranslations.precipitation}: ${randomInt(0, 100)}%`,
      },
      {
        time: new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(
          dayjs().add(6, "hour").toDate(),
        ),
        temperature: randomInt(currentTemp - 3, currentTemp + 3),
        weather: weatherTranslations.codes[hourly2Code],
        icon: mapIcon(hourly2Code, hourly2IsDay),
        uv: randomInt(0, 11),
        precipitation: `${weatherTranslations.precipitation}: ${randomInt(0, 100)}%`,
      },
      {
        time: new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(
          dayjs().add(9, "hour").toDate(),
        ),
        temperature: randomInt(currentTemp - 3, currentTemp + 3),
        weather: weatherTranslations.codes[hourly3Code],
        icon: mapIcon(hourly3Code, hourly3IsDay),
        uv: randomInt(0, 11),
        precipitation: `${weatherTranslations.precipitation}: ${randomInt(0, 100)}%`,
      },
    ],
    daily: [
      {
        day: "Tomorrow",
        tempMin: randomInt(5, 20),
        tempMax: randomInt(21, 30),
        weather: weatherTranslations.codes[daily1Code],
        icon: mapIcon(daily1Code, 1),
      },
      {
        day: dayjs().add(2, "day").format("dddd"),
        tempMin: randomInt(5, 20),
        tempMax: randomInt(21, 30),
        weather: weatherTranslations.codes[daily2Code],
        icon: mapIcon(daily2Code, 1),
      },
      {
        day: dayjs().add(3, "day").format("dddd"),
        tempMin: randomInt(5, 20),
        tempMax: randomInt(21, 30),
        weather: weatherTranslations.codes[daily3Code],
        icon: mapIcon(daily3Code, 1),
      },
    ],
  };
}
