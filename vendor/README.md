# Astronomy Engine

Bundled version: **2.1.19**, MIT license, Don Cross.

Source: https://github.com/cosinekitty/astronomy/releases/tag/v2.1.19
Browser file: https://raw.githubusercontent.com/cosinekitty/astronomy/v2.1.19/source/js/astronomy.browser.min.js

The original browser bundle is included unchanged. See `astronomy.LICENSE` for the full license. No CDN or astronomy API is contacted by the game.

`environment.js` uses MoonPhase, Illumination, Seasons and SunPosition. Moon labels use eight conventional phase categories, with a narrow interval around new/full/quarter phases. Illumination is calculated for the actual instant. Seasons switch at the calculated UTC equinox or solstice, inverted for the Southern Hemisphere.

Regression reference for the October 2026 lunar events: https://aa.usno.navy.mil/calculated/moon/phases?date=2026-09-01&nump=8

Day/night lighting is an artistic approximation driven by the device's local civil clock and seasonal day length at a representative tropical latitude. It does not request location or claim exact local sunrise/weather information.