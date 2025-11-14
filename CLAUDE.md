# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/TypeScript web application designed for always-on screens (like smart displays or tablets). It displays current time, date, weather forecast, calendar events, birthdays, and local events in a clean, readable layout using server-side rendering with Pug templates. The application serves as an information display that retrieves calendar events from sources like Apple iCloud using CalDAV and presents them in a unified interface.

## Architecture

The application is built with:
- **Backend**: Node.js/TypeScript Express server with Pug templating
- **Frontend**: HTML with HTMX for dynamic updates and custom JavaScript for time handling
- **Data Sources**: CalDAV/CardDAV for calendar/contacts, Open-Meteo for weather, PHQ.io for events
- **Configuration**: YAML-based config file with account credentials and settings
- **Internationalization**: YAML translation files supporting multiple locales

## Key Components

### Backend (TypeScript)
- `src/app.ts`: Express server with routes for calendar, weather, events, and birthdays
- `src/calendar.ts`: CalDAV/CardDAV client for fetching calendar events and birthdays
- `src/weather.ts`: Open-Meteo API integration for weather data
- `src/events.ts`: PHQ.io API integration for local events
- `src/common.ts`: Shared utilities, types, and formatting functions
- `src/mappings.ts`: Default weather code icon mappings for Open-Meteo
- `config.yml`: Configuration file with account credentials, settings, and mappings
- `config.example.yml`: Example configuration template
- `translations/*.yml`: Localization files (de.yml, en.yml)

### Frontend
- `templates/index.pug`: Main Pug template with HTMX integration
- `templates/list.pug`: Reusable list component template
- `templates/weather.pug`: Weather display template
- `templates/error.pug`: Error display template
- `assets/css/main.css`: Main layout and styling
- `assets/css/fonts.css`: Font imports (Noto Sans)
- `assets/css/weather-icons.min.css`: Weather icon font styles
- `assets/js/date.js`: JavaScript for client-side time display updates
- `assets/js/htmx.min.js`: HTMX library for dynamic content updates
- `assets/font/`: Weather icon fonts and Noto Sans font files

## Data Sources and APIs

- **Weather**: Open-Meteo API (current weather + hourly/daily forecasts)
- **Calendar Events**: CalDAV (iCloud, Google Calendar) with configurable calendar mappings
  - Supports both Basic auth (iCloud) and OAuth (Google)
  - Multiple calendar types via mappings (appointments, trash, etc.)
- **Birthdays**: CardDAV (iCloud, Google Contacts) with automatic birthday extraction
- **Local Events**: PHQ.io events API with country/city/postal code filtering
- **Time/Date**: Server-side with dayjs and configurable timezone
- **Internationalization**: YAML-based translation files with locale support

## Configuration

The `config.yml` file contains:
- **accounts**: Array of CalDAV/CardDAV accounts with:
  - `caldav.endpoint`: CalDAV server URL
  - `caldav.mappings`: Maps calendar types to calendar display names
  - `carddav.endpoint`: CardDAV server URL
  - `auth`: Authentication (basic or oauth)
- **settings**:
  - `timezone`: Timezone for date/time display (e.g., "Europe/Berlin")
  - `locale`: Language code for translations (e.g., "de", "en")
  - `appointments_days`: Number of future days to show appointments
  - `trash_days`: Number of future days to show trash collection
  - `birthday_days`: Number of future days to show birthdays
  - `event_days`: Number of future days to show local events
- **events**: Local events configuration
  - `country`: Country code for events API
  - `city`: City name for events filtering
  - `postal_codes`: Array of postal codes to filter events
  - `title_replacements`: Array of search/replace patterns for event titles
- **trash**: Trash collection configuration
  - `title_replacements`: Array of search/replace patterns for trash event titles
- **weather**: Weather location
  - `latitude`: Latitude coordinate
  - `longitude`: Longitude coordinate

## Display Logic

The application automatically:
- Updates time display using JavaScript on page load and locale-aware formatting
- Refreshes calendar, birthdays, and events via HTMX every 12 hours (43200s)
- Refreshes weather via HTMX every 15 minutes (900s)
- Shows events/birthdays only when occurring within configured day ranges
- Filters events by configured country/city/postal codes
- Applies title transformations via configurable search/replace patterns
- Uses internationalization with locale-based translation files
- Handles errors with dedicated error template
- Sets Cache-Control: no-store headers to prevent stale data

## Build and Development

- **Build**: `npm run build` (TypeScript compilation to dist/)
- **Development**: `npm run dev` (ts-node for direct TypeScript execution)
- **Start**: `npm start` (runs compiled JavaScript from dist/)
- **Formatting**: Uses Biome for code formatting (biome.json configuration)

### Dependencies
- **Production**: express, pug, dayjs, tsdav, ical.js, axios, yaml
- **Development**: typescript, ts-node, @types/express, @types/node

## Deployment

The application includes Docker support:
- `Dockerfile`: Node.js 24-alpine based container with timezone support
  - Runs as non-root node user
  - Copies all necessary files (src, templates, translations, assets, config.yml)
  - Builds TypeScript during image build
- `compose.yml`: Docker Compose setup for easy deployment
- Static assets served directly by Express for self-contained deployment
