import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import express from "express";
import * as YAML from "yaml";
import { fetchBirthdays, fetchCalendarEvents } from "./calendar";
import { fetchEventsData } from "./events";
import { fetchWeatherData } from "./weather";

const app = express();

// Load config and translations
let config: any;
let locale: string;
try {
  const cPath = path.join(__dirname, "../config.yml");
  config = YAML.parse(fs.readFileSync(cPath, "utf8"));
  locale = config.settings.locale;
  const tPath = path.join(__dirname, `../translations/${locale}.yml`);
  config.translations = YAML.parse(fs.readFileSync(tPath, "utf8"));
} catch (error) {
  console.error("Error loading config.yaml:", error);
  process.exit(1);
}

// Configure dayjs globally
async function loadLocale() {
  await import(`dayjs/locale/${locale}`);
  dayjs.locale(locale);
}
loadLocale();
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.tz.setDefault(config.settings.timezone);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../templates"));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Helper function for error responses
function renderError(res: express.Response, message: string, error: any) {
  console.error(`${message}:`, error);
  res.status(500).render("error", { message, details: String(error) });
}

app.get("/", (_req, res) => res.render("index", { locale }));

app.get("/weather", async (_req, res) => {
  try {
    const weather = await fetchWeatherData(config);
    res.render("weather", { weather });
  } catch (error) {
    renderError(res, "Unable to fetch weather data", error);
  }
});

app.get("/calendar", async (req, res) => {
  try {
    const type = req.query.type as string;
    const entries = await fetchCalendarEvents(config, type);
    res.render("list", { entries, title: config.translations.titles?.[type] });
  } catch (error) {
    renderError(res, "Unable to fetch calendar events", error);
  }
});

app.get("/birthdays", async (_req, res) => {
  try {
    const entries = await fetchBirthdays(config);
    res.render("list", {
      entries,
      title: config.translations.titles.birthdays,
    });
  } catch (error) {
    renderError(res, "Unable to fetch birthdays", error);
  }
});

app.get("/events", async (_req, res) => {
  try {
    const entries = await fetchEventsData(config);
    res.render("list", { entries, title: config.translations.titles.events });
  } catch (error) {
    renderError(res, "Unable to fetch events", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
