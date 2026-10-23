# Pub Scout — verified filter data update

Upload all files into your GitHub repository, preserving `netlify/functions/pubs.js`. Commit and wait for Netlify deployment. Refresh on your phone.

New Google Places (New) fields: goodForWatchingSports, outdoorSeating, servesLunch, servesDinner, priceRange. Google fields may be absent, so only explicit true attributes are matched. Outdoor seating is NOT necessarily a beer garden. The craft, real ale, dive, and quiet filters remain unsupported until independent sources are added.

IMPORTANT: These fields activate the Nearby Search Enterprise + Atmosphere pricing tier. Review your Google Cloud billing, quota and trial-credit limits before deploying. The £226 trial credit expires 22 Jan 2027. Google Places Nearby Search returns at most 20 venues, and current discovery includes bars (including some non-pubs).

No Google API key needs to be added to GitHub; the existing Netlify environment variable is used.
