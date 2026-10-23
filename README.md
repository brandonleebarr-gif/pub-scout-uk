# Pub Scout — expanded discovery (v2)

Replace your GitHub repo files with the contents of this ZIP and commit. Netlify will redeploy. Keep your existing GOOGLE_PLACES_API_KEY in Netlify.

New: for searches greater than 1/2 mile, five overlapping Google Places Nearby Search (New) calls run in parallel, deduplicated by Google Place ID and filtered to the selected radius. This can find more than 20 pubs, but is not guaranteed exhaustive and uses up to 5 billable API requests per search. Configure API quotas/budget alerts.

CAMRA: links to WhatPub searches are provided, but CAMRA records are NOT imported. Obtain permission/license or an authorised feed before importing data.

Sports: Google goodForWatchingSports is supported; FANZO link is provided for fixture-level checks. Sports provider data is NOT imported. Contact providers about an API/feed and redistribution terms.

Caution: Google bar search can include non-pubs. Test and monitor Netlify function logs and Google billing.
