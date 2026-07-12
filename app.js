/**
 * Κρεαταγορά Δίπλας - Frontend Application Logic
 * Nicolaos Elias Diplas | Papakosta 20, Agrinio
 */

document.addEventListener("DOMContentLoaded", () => {
    initHeaderScroll();
    initMobileNavigation();
    initActiveNavOnScroll();
    initScrollRevealAnimations();
    initCurrentYear();
    initGoogleReviews();
});

const GOOGLE_MAPS_REVIEWS_URL = "https://maps.app.goo.gl/VChRGwDJWQ6TteyG8";

// ==========================================================================
// HEADER SCROLL ACTION
// ==========================================================================
function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };
    
    window.addEventListener("scroll", handleScroll);
    // Trigger once on load in case page is already scrolled
    handleScroll();
}

// ==========================================================================
// MOBILE NAVIGATION MENU
// ==========================================================================
function initMobileNavigation() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = navMenu.querySelectorAll("a");
    
    const toggleMenu = () => {
        navToggle.classList.toggle("active");
        navMenu.classList.toggle("open");
        document.body.classList.toggle("menu-open"); // Prevent body scroll when menu is open
    };
    
    const closeMenu = () => {
        navToggle.classList.remove("active");
        navMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
    };
    
    navToggle.addEventListener("click", toggleMenu);
    
    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });
    
    // Close menu when clicking outside of nav menu
    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains("open")) {
            closeMenu();
        }
    });
}

// ==========================================================================
// ACTIVE NAVIGATION LINK HIGHLIGHT ON SCROLL
// ==========================================================================
function initActiveNavOnScroll() {
    const navLinks = Array.from(document.querySelectorAll(".nav-menu a"));
    const sectionMap = navLinks
        .map(link => {
            const id = link.getAttribute("href").replace("#", "");
            const section = document.getElementById(id);
            return section ? { id, link, section } : null;
        })
        .filter(Boolean);

    if (!sectionMap.length) {
        return;
    }

    const setActiveLink = () => {
        const headerOffset = document.querySelector(".site-header")?.offsetHeight || 0;
        const currentPoint = window.scrollY + headerOffset + 120;
        const sectionsByPosition = [...sectionMap].sort((a, b) => a.section.offsetTop - b.section.offsetTop);
        let activeItem = sectionsByPosition[0];
        const isAtPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

        if (isAtPageEnd) {
            activeItem = sectionsByPosition[sectionsByPosition.length - 1];
        }

        if (!isAtPageEnd) {
            sectionsByPosition.forEach(item => {
                if (item.section.offsetTop <= currentPoint) {
                    activeItem = item;
                }
            });
        }

        navLinks.forEach(link => link.classList.remove("active"));
        activeItem.link.classList.add("active");
    };

    window.addEventListener("scroll", setActiveLink, { passive: true });
    window.addEventListener("resize", setActiveLink);
    window.addEventListener("hashchange", () => window.setTimeout(setActiveLink, 80));
    window.addEventListener("load", setActiveLink);
    setActiveLink();
    window.setTimeout(setActiveLink, 120);
}

// ==========================================================================
// SCROLL REVEAL ANIMATIONS
// ==========================================================================
function initScrollRevealAnimations() {
    // Add ".reveal" class to elements we want to animate on scroll
    const elementsToAnimate = [
        ...document.querySelectorAll(".section-header"),
        ...document.querySelectorAll(".timeline-item"),
        ...document.querySelectorAll(".product-card"),
        ...document.querySelectorAll(".gallery-item"),
        ...document.querySelectorAll(".info-card"),
        ...document.querySelectorAll(".contact-map-panel"),
        document.querySelector(".sausages-image"),
        document.querySelector(".sausages-content"),
        ...document.querySelectorAll(".generation-card"),
        document.querySelector(".hero-content"),
        document.querySelector(".hero-image-container"),
        document.querySelector(".history-content")
    ];
    
    elementsToAnimate.forEach(el => {
        if (el) el.classList.add("reveal");
    });
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Once animated, we don't need to observe it anymore
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.12, // Trigger when 12% of the element is visible
        rootMargin: "0px 0px -40px 0px"
    });
    
    elementsToAnimate.forEach(el => {
        if (el) revealObserver.observe(el);
    });
}

// ==========================================================================
// CURRENT YEAR IN FOOTER
// ==========================================================================
function initCurrentYear() {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// ==========================================================================
// GOOGLE REVIEWS
// ==========================================================================
async function initGoogleReviews() {
    const container = document.getElementById("google-reviews-container");
    const placeholder = document.getElementById("reviews-placeholder");

    if (!container || !placeholder) {
        return;
    }

    placeholder.hidden = false;
    setGoogleReviewsButtonHref(placeholder);

    try {
        const response = await fetch("/api/reviews", {
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];

        if (!reviews.length) {
            return;
        }

        renderGoogleReviews(container, data, reviews);
    } catch (error) {
        // Static local servers do not serve /api; keep the safe placeholder.
    }
}

function setGoogleReviewsButtonHref(root) {
    const googleButton = root.querySelector(".reviews-google-btn");

    if (googleButton) {
        googleButton.href = GOOGLE_MAPS_REVIEWS_URL;
    }
}

function renderGoogleReviews(container, data, reviews) {
    container.innerHTML = "";

    const summary = document.createElement("div");
    summary.className = "reviews-summary";

    const title = document.createElement("h3");
    title.textContent = data.businessName || "Κρεαταγορά Δίπλας";

    const meta = document.createElement("p");
    const ratingText = data.overallRating ? `${formatRating(data.overallRating)} / 5` : "Κριτικές Google";
    const totalText = data.totalReviews ? `${data.totalReviews} κριτικές` : "Google Reviews";
    meta.textContent = `${ratingText} · ${totalText}`;

    const stars = createStarsElement(data.overallRating || 0);

    summary.append(title, stars, meta);
    container.appendChild(summary);

    reviews.slice(0, 5).forEach(review => {
        container.appendChild(createReviewCard(review));
    });

    const attribution = document.createElement("div");
    attribution.className = "google-reviews-attribution";

    const attributionText = document.createElement("span");
    attributionText.textContent = "Κριτικές από Google Maps";

    const googleLink = document.createElement("a");
    googleLink.href = GOOGLE_MAPS_REVIEWS_URL;
    googleLink.target = "_blank";
    googleLink.rel = "noopener";
    googleLink.className = "btn btn-secondary reviews-google-btn";
    googleLink.textContent = "Δείτε τις κριτικές στο Google";

    attribution.append(attributionText, googleLink);
    container.appendChild(attribution);
}

function createReviewCard(review) {
    const card = document.createElement("article");
    card.className = "review-card";

    const header = document.createElement("div");
    header.className = "review-card-header";

    const authorWrap = document.createElement("div");

    const author = document.createElement(review.authorProfileUrl ? "a" : "span");
    author.className = "review-author";
    author.textContent = review.authorName || "Χρήστης Google";

    if (review.authorProfileUrl) {
        author.href = review.authorProfileUrl;
        author.target = "_blank";
        author.rel = "noopener";
    }

    const time = document.createElement("p");
    time.className = "review-time";
    time.textContent = review.relativeTime || formatReviewDate(review.date);

    authorWrap.append(author, time);
    header.appendChild(authorWrap);

    const stars = createStarsElement(review.rating || 0);
    stars.classList.add("review-card-stars");

    const text = document.createElement("p");
    text.className = "review-card-text";
    text.textContent = review.text || "";

    card.append(header, stars, text);
    return card;
}

function createStarsElement(rating) {
    const wrapper = document.createElement("div");
    wrapper.className = "review-stars";
    wrapper.setAttribute("aria-label", `Βαθμολογία ${formatRating(rating)} στα 5`);

    const roundedRating = Math.round(Number(rating) || 0);

    for (let i = 1; i <= 5; i += 1) {
        const star = document.createElement("span");
        star.className = i <= roundedRating ? "review-star is-filled" : "review-star";
        star.textContent = "★";
        wrapper.appendChild(star);
    }

    return wrapper;
}

function formatRating(rating) {
    return Number(rating || 0).toFixed(1).replace(".", ",");
}

function formatReviewDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("el-GR", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}
