# Κρεαταγορά Δίπλας Website

Απλό static website με `index.html`, `style.css`, `app.js` και εικόνες στο `public/images`.

## Τοπική εκτέλεση

Για απλό static preview:

```bash
python3 -m http.server 4173
```

Μετά άνοιξε:

```text
http://localhost:4173
```

Σημείωση: το `python3 -m http.server` δεν τρέχει το Vercel serverless endpoint `/api/reviews`, άρα οι Google κριτικές θα εμφανίζουν το ασφαλές fallback placeholder τοπικά.

Για τοπική δοκιμή και του serverless endpoint, χρησιμοποίησε Vercel CLI:

```bash
vercel dev
```

Σε αυτή την περίπτωση βάλε τα ίδια environment variables σε `.env.local` ή τράβηξέ τα από το Vercel project με `vercel env pull`.

## Google Reviews στο Vercel

Οι Google κριτικές φορτώνονται από το serverless endpoint:

```text
/api/reviews
```

Το endpoint βρίσκεται στο:

```text
api/reviews.js
```

Δεν υπάρχει Google API key σε public/client-side αρχείο. Το frontend (`app.js`) κάνει μόνο `fetch("/api/reviews")`.

## Environment Variables

Στο Vercel Project Settings πρόσθεσε:

```text
GOOGLE_PLACES_API_KEY
GOOGLE_PLACE_ID
```

Το `GOOGLE_PLACES_API_KEY` είναι το Google Places API key.

Το `GOOGLE_PLACE_ID` είναι το Place ID της επιχείρησης.

Μετά την προσθήκη ή αλλαγή environment variables, κάνε νέο deploy στο Vercel.

## Fallback

Αν λείπουν environment variables, αποτύχει το Google Places API ή δεν επιστραφούν πραγματικές κριτικές, το site κρατά το υπάρχον placeholder:

```text
Οι κριτικές Google θα εμφανιστούν εδώ μόλις ολοκληρωθεί η σύνδεση με το Google Places API.
```

Το κουμπί `Δείτε τις κριτικές στο Google` παραμένει πάντα διαθέσιμο.
