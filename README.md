# Get to a Boozer — up to 100 search results

Replace all repository files with this folder's contents, preserving the netlify/functions directory.

Changes:
- Backend returns up to 100 venues from the geographic tile searches (previously discarded all but 20).
- Frontend shows all returned venues and filters/sorts them.
- Google review keyword enrichment now works in batches of 10 instead of sending >20 IDs to the function, which would fail validation.
- The existing GPS, postcode, Google Places API key, and geographic search strategy remain unchanged.

Limitations:
- This is up to 100 **discovered** venues, not an exhaustive census. Google Nearby Search caps each tile at 20 results.
- A large search can make up to 25 Google Nearby Search calls and up to 100 Google Place Details calls, with potential charges.
- Review-based tags are populated progressively and can take time for 100 venues. Missing reviews do not imply missing amenities.
- JavaScript syntax validated; live Google API and deployment not tested.
