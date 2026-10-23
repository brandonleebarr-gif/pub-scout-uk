# Pub Scout — Google review-based filters

Upload all project files to GitHub, preserving `netlify/functions/review-tags.js` and `netlify/functions/pubs.js`.
Netlify environment variable `GOOGLE_PLACES_API_KEY` must already be configured.
Review-based tags load after the normal search results appear.
Google Place Details requests for the displayed pubs may incur extra API costs (up to 20 additional requests per search).
Google Places generally returns only a limited sample of reviews per venue, not all reviews.
Filters are keyword-based estimates, including positive mentions even when reviews contain negation.
Results that were not in the displayed top 20 are not examined for review tags.
No CAMRA or FANZO data is scraped.
