import axios from "axios";
import dayjs from "dayjs";
import { WEATHER_CODE_ICON_MAPPINGS } from "./mappings";
import { generateSampleWeather } from "./mocks";

export interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    uv_index: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
  };
}

export interface WeatherIconData {
  text: string;
  icon: string;
  alt?: string;
}

export interface ProcessedWeatherData {
  current: {
    temperature: number;
    weather: string;
    icon: string;
    uv: number;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    weather: string;
    icon: string;
    uv: number;
    precipitation: string;
  }>;
  daily: Array<{
    day: string;
    tempMin: number;
    tempMax: number;
    weather: string;
    icon: string;
  }>;
}

function mapIcon(code: number, isDay: number, iconMappings: any): string {
  const weatherInfo = iconMappings[code];
  if (!isDay && weatherInfo.alt) {
    return weatherInfo.alt;
  }
  return weatherInfo.icon;
}

export async function fetchWeatherData(
  config: any,
): Promise<ProcessedWeatherData> {
  const weatherConfig = config.weather;
  // Merge default mappings with config overrides
  const mappings = {
    ...WEATHER_CODE_ICON_MAPPINGS,
    ...(weatherConfig.code_icon_mapping_overrides || {}),
  };
  const translations = config.translations.weather;
  const locale = config.settings.locale;

  if (config.settings.test) {
    return generateSampleWeather(translations, mappings, locale);
  }
  const timezone = config.settings.timezone;

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${weatherConfig.latitude}` +
    `&longitude=${weatherConfig.longitude}` +
    `&daily=weather_code,temperature_2m_min,temperature_2m_max,uv_index_max` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,uv_index,is_day` +
    `&current=temperature_2m,weather_code,is_day,uv_index` +
    `&timezone=${encodeURIComponent(timezone)}` +
    `&forecast_days=4&forecast_hours=12&temporal_resolution=hourly_3`;

  try {
    const response = await axios.get(weatherUrl);
    const data: WeatherData = response.data;

    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    const processedData: ProcessedWeatherData = {
      current: {
        temperature: Math.round(current.temperature_2m),
        weather: translations.codes[current.weather_code],
        icon: mapIcon(current.weather_code, current.is_day, mappings),
        uv: Math.round(current.uv_index),
      },
      hourly: [],
      daily: [],
    };

    for (let i = 1; i < 4; i++) {
      if (i < hourly.weather_code.length) {
        const code = hourly.weather_code[i];
        const isDay = hourly.is_day[i];
        processedData.hourly.push({
          time: new Intl.DateTimeFormat(config.settings.locale, {
            hour: "numeric",
          }).format(dayjs(hourly.time[i]).toDate()),
          temperature: Math.round(hourly.temperature_2m[i]),
          weather: translations.codes[code],
          icon: mapIcon(code, isDay, mappings),
          uv: Math.round(hourly.uv_index[i]),
          precipitation:
            translations.precipitation +
            ": " +
            Math.round(hourly.precipitation_probability[i]) +
            "%",
        });
      }
    }

    for (let i = 1; i < 4; i++) {
      if (i < daily.weather_code.length) {
        const code = daily.weather_code[i];
        processedData.daily.push({
          day: dayjs(daily.time[i]).format("dddd"),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          tempMax: Math.round(daily.temperature_2m_max[i]),
          weather: translations.codes[code],
          icon: mapIcon(code, 1, mappings),
        });
      }
    }

    return processedData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}
