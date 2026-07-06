const GOOGLE_PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places";
const GOOGLE_FIELD_MASK = "displayName,rating,userRatingCount,reviews";
const SUCCESS_CACHE_HEADERS = {
    browser: "public, max-age=0, must-revalidate",
    cdn: "max-age=86400"
};

function sendJson(response, statusCode, payload, cacheHeaders) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", cacheHeaders?.browser || "no-store");

    if (cacheHeaders?.cdn) {
        response.setHeader("CDN-Cache-Control", cacheHeaders.cdn);
        response.setHeader("Vercel-CDN-Cache-Control", cacheHeaders.cdn);
    }

    response.end(JSON.stringify(payload));
}

function getReviewText(review) {
    if (review.text && typeof review.text === "object") {
        return review.text.text || "";
    }

    if (review.originalText && typeof review.originalText === "object") {
        return review.originalText.text || "";
    }

    return review.text || "";
}

function normalizeReview(review) {
    const author = review.authorAttribution || {};

    return {
        authorName: author.displayName || review.authorName || "Χρήστης Google",
        authorProfileUrl: author.uri || review.authorProfileUrl || "",
        rating: Number(review.rating || 0),
        text: getReviewText(review),
        relativeTime: review.relativePublishTimeDescription || review.relativeTime || "",
        date: review.publishTime || review.date || ""
    };
}

function normalizePlaceId(placeId) {
    return placeId.trim().replace(/^places\//, "");
}

module.exports = async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        return sendJson(response, 405, { error: "Method not allowed" });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
        return sendJson(response, 503, {
            error: "Google Places configuration is missing."
        });
    }

    try {
        const normalizedPlaceId = normalizePlaceId(placeId);
        const googleResponse = await fetch(`${GOOGLE_PLACE_DETAILS_URL}/${encodeURIComponent(normalizedPlaceId)}?languageCode=el`, {
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": GOOGLE_FIELD_MASK
            }
        });

        const data = await googleResponse.json();

        if (!googleResponse.ok) {
            return sendJson(response, googleResponse.status, {
                error: "Google Places request failed.",
                status: data.error?.status || "",
                message: data.error?.message || ""
            });
        }

        const reviews = Array.isArray(data.reviews)
            ? data.reviews.map(normalizeReview).filter(review => review.rating || review.text)
            : [];

        return sendJson(response, 200, {
            businessName: data.displayName?.text || "",
            overallRating: Number(data.rating || 0),
            totalReviews: Number(data.userRatingCount || 0),
            reviews
        }, SUCCESS_CACHE_HEADERS);
    } catch (error) {
        return sendJson(response, 500, {
            error: "Unable to load Google reviews."
        });
    }
};
