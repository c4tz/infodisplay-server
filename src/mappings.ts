// Default weather icon mappings for Open-Meteo weather codes
export const WEATHER_CODE_ICON_MAPPINGS: {
  [key: number]: { icon: string; alt?: string };
} = {
  0: {
    icon: "day-sunny",
    alt: "night-clear",
  },
  1: {
    icon: "day-sunny-overcast",
    alt: "night-alt-partly-cloudy",
  },
  2: {
    icon: "day-cloudy",
    alt: "night-alt-cloudy",
  },
  3: {
    icon: "cloudy",
  },
  45: {
    icon: "fog",
  },
  48: {
    icon: "day-haze",
  },
  51: {
    icon: "snow-wind",
  },
  53: {
    icon: "showers",
  },
  55: {
    icon: "rain",
  },
  56: {
    icon: "rain-mix",
  },
  57: {
    icon: "rain-mix",
  },
  61: {
    icon: "snow-wind",
  },
  63: {
    icon: "showers",
  },
  65: {
    icon: "rain",
  },
  66: {
    icon: "rain-mix",
  },
  67: {
    icon: "hail",
  },
  71: {
    icon: "snowflake-cold",
  },
  73: {
    icon: "snowflake-cold",
  },
  75: {
    icon: "snowflake-cold",
  },
  77: {
    icon: "sleet",
  },
  80: {
    icon: "day-snow-wind",
    alt: "night-alt-snow-wind",
  },
  81: {
    icon: "day-showers",
    alt: "night-alt-showers",
  },
  82: {
    icon: "day-rain",
    alt: "night-alt-rain",
  },
  85: {
    icon: "snowflake-cold",
  },
  86: {
    icon: "snowflake-cold",
  },
  95: {
    icon: "thunderstorm",
  },
  96: {
    icon: "storm-showers",
  },
  99: {
    icon: "lightning",
  },
  99999: {
    icon: "alien",
  },
};
