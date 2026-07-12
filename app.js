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
});

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
