# Pub Scout UK — Google Places version

1. Upload the CONTENTS of this folder to the root of your GitHub repository.
2. Netlify automatically deploys the commit.
3. Netlify dashboard > Project configuration > Environment variables > Add a variable.
   Key: GOOGLE_PLACES_API_KEY
   Value: your Google Cloud Places API (New) key.
   Scope: Functions / all scopes; make sure the variable is available to serverless functions.
4. Trigger a fresh Netlify deploy after adding the variable.
5. Test SW1A 1AA with a ¼-mile radius.

Google Cloud: enable Places API (New), attach a billing account, restrict the key to Places API (New), configure quotas and budget alerts.
Do not put the key in index.html, GitHub, or messages.
Nearby Search returns a maximum of 20 results per request. The bar type may include non-pub venues.
Google ratings, review counts, and price levels are API data; actual pint prices, sports, and tap lists are not provided.
