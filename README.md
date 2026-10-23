# Pub Scout UK

## Deployment
1. Create a free Netlify account at https://app.netlify.com.
2. Deploy this project folder through Netlify Drop (drag the unzipped folder) or use a Git repository for automatic redeploys. Keep the `netlify/functions/pubs.js` folder structure intact.
3. Open the HTTPS address. Enter a postcode or allow GPS.
4. Optional Google ratings: In Google Cloud Console create a project, attach a billing account, enable **Places API (New)**, create an API key, restrict the key to the Places API. In Netlify Site configuration > Environment variables, add `GOOGLE_PLACES_API_KEY` with the key value. Redeploy. Do not paste the key into HTML or Git.
5. Set API quotas and billing alerts. Google ratings are optional and will not be shown if the key is absent.

## Limitations
OpenStreetMap Overpass public servers are rate-limited and not guaranteed available. Netlify function execution limits can affect large-radius searches. Google Nearby Search returns at most 20 places per request and matching is approximate, so not all pubs will have Google ratings. Google priceLevel is a rough venue tier, not the cost of a pint. The Google Places API has pay-as-you-go billing; review current prices and terms before enabling it. Review Google Maps Platform display, caching and attribution terms before public distribution. Filters are based on mapped evidence, not independently verified facts. Google Places results cannot be assumed complete and Google data must be used per applicable licensing terms.
