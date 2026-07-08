document.addEventListener("DOMContentLoaded", function () {
  // Array of ad images (add your ad images here)
  const ads = [
    { image: "assets/images/ad1.jpg", url: "https://example.com/ad1" },
    { image: "assets/images/ad1.avif", url: "https://example.com/ad2" },
    { image: "assets/images/ad2.jpg", url: "https://example.com/ad3" },
    { image: "assets/images/ad3.jpg", url: "https://example.com/ad4" },
    { image: "assets/images/ad4.jpg", url: "https://example.com/ad5" },
    { image: "assets/images/ad5.jpeg", url: "https://example.com/ad6" },
    { image: "assets/images/ad6.jpg", url: "https://example.com/ad7" },
  ];

  // Select random ad
  const randomIndex = Math.floor(Math.random() * ads.length);
  const selectedAd = ads[randomIndex];

  // Get elements
  const adImage = document.getElementById("ad-image");
  const adLink = document.getElementById("ad-link");

  // Set ad content
  if (selectedAd && adImage && adLink) {
    adImage.src = selectedAd.image;
    adImage.alt = "Advertisement";
    adLink.href = selectedAd.url;

    // Optional: Add loading state
    adImage.addEventListener("load", function () {
      this.style.opacity = "1";
    });
    adImage.style.opacity = "0";
    adImage.style.transition = "opacity 0.5s ease";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initSearchToggle();
  initMobileMenu();
  initStickyNav();
  initBackToTop();
  initStickyAd();
  initLazyLoad();
  initMobileSubmenus();
  updateCurrentDate();
});

// Search Toggle
function initSearchToggle() {
  const searchToggle = document.getElementById("searchToggle");
  const searchBar = document.getElementById("searchBar");
  const closeSearch = document.getElementById("closeSearch");

  if (searchToggle && searchBar) {
    searchToggle.addEventListener("click", function (e) {
      e.preventDefault();
      searchBar.classList.toggle("d-none");
      searchBar.querySelector("input").focus();
    });

    if (closeSearch) {
      closeSearch.addEventListener("click", function (e) {
        e.preventDefault();
        searchBar.classList.add("d-none");
      });
    }
  }

  // Mobile search
  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  const mobileSearchBar = document.getElementById("mobileSearchBar");

  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      mobileSearchBar.classList.toggle("d-none");
    });
  }
}

// Mobile Menu
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const body = document.body;

  if (mobileMenuBtn && mobileMenu) {
    // Create overlay element
    let overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    body.appendChild(overlay);

    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.classList.add("active");
      overlay.classList.add("active");
      body.style.overflow = "hidden";
    });

    overlay.addEventListener("click", function () {
      mobileMenu.classList.remove("active");
      overlay.classList.remove("active");
      body.style.overflow = "";
    });
  }
}

// Mobile Submenus
function initMobileSubmenus() {
  const submenuParents = document.querySelectorAll(".has-submenu");

  submenuParents.forEach(function (parent) {
    const link = parent.querySelector("a");
    const submenu = parent.querySelector(".mobile-submenu");

    if (link && submenu) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        submenu.classList.toggle("active");

        // Toggle icon rotation
        const icon = link.querySelector("i");
        if (icon) {
          icon.style.transform = submenu.classList.contains("active")
            ? "rotate(180deg)"
            : "rotate(0)";
        }
      });
    }
  });
}

// Sticky Navigation
function initStickyNav() {
  const nav = document.querySelector(".main-nav");
  let lastScrollTop = 0;

  if (nav) {
    window.addEventListener("scroll", function () {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 100) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }

      lastScrollTop = scrollTop;
    });
  }
}

// Back to Top Button
function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  if (backToTopBtn) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}

// Sticky Footer Ad
function initStickyAd() {
  const stickyAd = document.getElementById("stickyAd");
  const closeStickyAd = document.getElementById("closeStickyAd");

  if (stickyAd && closeStickyAd) {
    // Show sticky ad after scrolling down
    let adShown = false;

    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 500 && !adShown) {
        stickyAd.style.display = "block";
        adShown = true;
      }
    });

    closeStickyAd.addEventListener("click", function () {
      stickyAd.style.display = "none";
    });
  }
}

// Lazy Load Images
function initLazyLoad() {
  const images = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const image = entry.target;
            image.src = image.dataset.src;
            image.classList.add("loaded");
            image.removeAttribute("data-src");
            observer.unobserve(image);
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      },
    );

    images.forEach(function (image) {
      imageObserver.observe(image);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(function (image) {
      image.src = image.dataset.src;
      image.classList.add("loaded");
    });
  }
}

// Update Current Date (Bengali)
function updateCurrentDate() {
  const dateElement = document.getElementById("current-date");

  if (dateElement) {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const banglaDate = convertToBanglaDate(now);
    dateElement.textContent = banglaDate;
  }
}

function convertToBanglaDate(date) {
  const days = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ];
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  const day = days[date.getDay()];
  const dateNum = date
    .getDate()
    .toString()
    .split("")
    .map((d) => digits[d])
    .join("");
  const month = months[date.getMonth()];
  const year = date
    .getFullYear()
    .toString()
    .split("")
    .map((d) => digits[d])
    .join("");

  return `${day}, ${dateNum} ${month} ${year}`;
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  });
});

// Add fade-in animation to elements on scroll
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const fadeObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe news items for fade-in effect
document
  .querySelectorAll(
    ".lead-item, .sidebar-lead-item, .top3-item, .category-item, .sports-item",
  )
  .forEach(function (item) {
    item.style.opacity = "0";
    fadeObserver.observe(item);
  });

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized scroll handler
const handleScroll = debounce(function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Handle sticky nav
  const nav = document.querySelector(".main-nav");
  if (nav) {
    if (scrollTop > 100) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  // Handle back to top
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    if (scrollTop > 300) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  }
}, 10);

// Add optimized scroll listener
window.addEventListener("scroll", handleScroll);

// Handle window resize for responsive adjustments
const handleResize = debounce(function () {
  // Close mobile menu on resize to desktop
  if (window.innerWidth >= 992) {
    const mobileMenu = document.getElementById("mobileMenu");
    const overlay = document.querySelector(".menu-overlay");

    if (mobileMenu && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      if (overlay) {
        overlay.classList.remove("active");
      }
      document.body.style.overflow = "";
    }
  }
}, 250);

window.addEventListener("resize", handleResize);

// Initialize tooltips if Bootstrap is available
if (typeof bootstrap !== "undefined") {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]',
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Dropdown hover support for desktop
if (window.innerWidth >= 992) {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(function (dropdown) {
    dropdown.addEventListener("mouseenter", function () {
      const dropdownMenu = this.querySelector(".dropdown-menu");
      if (dropdownMenu) {
        dropdownMenu.classList.add("show");
      }
    });

    dropdown.addEventListener("mouseleave", function () {
      const dropdownMenu = this.querySelector(".dropdown-menu");
      if (dropdownMenu) {
        dropdownMenu.classList.remove("show");
      }
    });
  });
}

// Console message
console.log("Samakal Clone - Responsive Bootstrap Design Loaded Successfully");
