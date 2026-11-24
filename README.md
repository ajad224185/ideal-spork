# Parmar Academy Test Series Web — Phase 1

This starter is intentionally limited to the Parmar Academy test-series flow shown in the supplied APK screenshots.

## What is included
- Parmar Academy home/test-series UI
- Test-series detail page with All / Sectional / Full Mock tabs
- Test screen with timer, question counter, +1/-0.33 display, options, Q-Palette, Previous/Save & Next/Submit controls
- API adapter for the API endpoints discovered in the supplied APK
- Runtime config lookup from the APK-referenced `appx.json`

## Important
The supplied APK revealed an API base URL and endpoint names, but the exact live Parmar institute configuration and JSON response shape were not fully available in this environment. Therefore the adapter uses flexible field detection and must be verified against the live Parmar response before calling this production-ready.

## Run
Upload this folder to GitHub and deploy with Vercel, or serve locally with any static HTTP server.
