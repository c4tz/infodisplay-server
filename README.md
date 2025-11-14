# Infodisplay Server

The backend for my [infodisplay](https://jaroz.ink/posts/infodisplay-v2/), built with [NodeJS](https://github.com/nodejs/node "NodeJS"), [pug](https://github.com/pugjs/pug "pug") and [htmx](https://github.com/bigskysoftware/htmx "htmx"). It serves a website which displays:

- **Calendar events** from CalDAV sources (using Basic Auth or OAuth)
- **Birthdays** from CardDAV contacts
- **Weather** (including forecast) from [Open-Meteo](https://open-meteo.com/)
- **Local events** from [PredictHQ](https://www.predicthq.com/)

Also, it has:
- **Auto-refresh**: updates without page reload
- **Internationalization**: Multi-language support via simple YAML translation files (currently only English and German)

## Screenshots

![Screenshot EN](/img/screenshot_en.png)
![Screenshot DE](/img/screenshot_de.png)

## Setup

1. Copy the example configuration from `config.example.yml` to `config.yml`

2. Edit `config.yml` with your settings (accounts, location, preferences)

3. Run it

    -  With Docker Compose (recommended):
        ```shell
        docker compose up -d
        ```
    - With `npm`:
        ```shell
        npm install
        npm run build
        npm start # or: npm run dev
        ```

4. Access the application at http://localhost:3000 :tada:

## CalDAV/CardDAV with OAuth

While Basic Auth should be pretty straightforward*, I feel like I should (at least briefly) describe how to get the OAuth credentials needed for a Google Account here:

1. Follow [this guide](https://developers.google.com/workspace/calendar/caldav/v2/guide#creating_your_client_id), but also add the "Google Contacts CardDAV API" to the project
2. You should now have a OAuth client ID and secret
3. Go back to your project's [credentials](https://console.cloud.google.com/apis/credentials), click on the client ID link and add `https://developers.google.com/oauthplayground`
4. Publish the project (this is needed so you won't need to re-generate the tokens regularly)
5. Go to the aforementioned [playground](https://developers.google.com/oauthplayground) and add the client ID and secret to the settings (top right) after checking "Use your own OAuth credentials"
6. In the "Input your own scopes" below the list on the left, put: `https://www.googleapis.com/auth/carddav, https://www.googleapis.com/auth/calendar`
   (sadly, the CardDAV part is neither chooseable in the list [nor documented](https://stackoverflow.com/a/45039713))
7. Give the needed consents (only seems to work in Chromium-based browsers for me)
8. On the following page (back in the playground), click the "Exchange authorization code for tokens"-button. You should now see the refresh token both in a field on the left and in the HTTP response on the right. :warning: Make sure that there is no expiration time set for it
9. Write your username, client ID + secret and the refresh token into the `config.yml`
10. Done! :white_check_mark:

*For Apple, you must [log in](https://account.apple.com/sign-in) to your account and create an app password

## Testing

You can also test the layout without making real API-calls each time. This is especially needed if you want to modify the (poorly written) CSS, which was "optimized" for a 1872×1404 resolution (matching the 10.3" eInk/ePaper display, as described in the blog post linked above).

To do so, just set `settings.test` to `true` in your config and (re)start the server.

## Disclaimer

I wrote this in TypeScript and htmx because I had never used them before and always try to learn something new while working on personal projects, so please don't expect a perfectly structured Node-Repository. Also, [tsdav](https://github.com/natelindev/tsdav "tsdav") seemed to do exactly what I wanted, whereas there was no CalDAV/CardDAV pkg in Go fulfilling my needs ;)

[Claude Code](https://github.com/anthropics/claude-code) was used in several occasions, e.g. initially bootstrapping the project, creating the mock/test-data, config and everything else I was too lazy for.

I will not implement any feature or change requests that do not create additional value (for me), because this currently works as intended in my view. I will happily accept PRs, though!
