document.addEventListener("DOMContentLoaded", function () {
  // Array of ad images
  const ads = [
    { image: "assets/images/ad1.jpg", url: "https://example.com/ad1" },
    { image: "assets/images/ad1.avif", url: "https://example.com/ad2" },
    { image: "assets/images/ad2.jpg", url: "https://example.com/ad3" },
    { image: "assets/images/ad3.jpg", url: "https://example.com/ad4" },
    { image: "assets/images/ad4.jpg", url: "https://example.com/ad5" },
    { image: "assets/images/ad5.jpeg", url: "https://example.com/ad6" },
    { image: "assets/images/ad6.jpg", url: "https://example.com/ad7" },
  ];

  const randomIndex = Math.floor(Math.random() * ads.length);
  const selectedAd = ads[randomIndex];

  const adImage = document.getElementById("ad-image");
  const adLink = document.getElementById("ad-link");

  if (selectedAd && adImage && adLink) {
    adImage.src = selectedAd.image;
    adImage.alt = "Advertisement";
    adLink.href = selectedAd.url;

    adImage.addEventListener("load", function () {
      this.style.opacity = "1";
    });
    adImage.style.opacity = "0";
    adImage.style.transition = "opacity 0.5s ease";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  initSearchToggle();
  initMobileMenu();
  initStickyNavAndBackToTop(); // FIX: consolidated, single scroll handler
  initStickyAd();
  initLazyLoad();
  initMobileSubmenus();
  updateCurrentDate();
  initLanguageToggle();
  initDropdownHover(); // FIX: now re-checks width instead of running once
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

  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  const mobileSearchBar = document.getElementById("mobileSearchBar");

  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      mobileSearchBar.classList.toggle("d-none");
    });
  }
}

// Mobile Menu — fixed version
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose"); // × button
  const body = document.body;

  if (!mobileMenuBtn || !mobileMenu) return;

  let overlay = document.querySelector(".menu-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    body.appendChild(overlay);
  }

  function closeMenu() {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    body.style.overflow = "";
  }

  function openMenu() {
    mobileMenu.classList.add("active");
    overlay.classList.add("active");
    body.style.overflow = "hidden";
  }

  // FIX: force closed on every load — guards against the menu ever
  // rendering "active" by default (stray class in markup, another
  // script, etc.)
  closeMenu();

  // FIX: browsers can restore a page from bfcache (e.g. hitting Back)
  // with the DOM exactly as it was left — including an open menu and
  // body.overflow:hidden from the previous visit. Force it shut again
  // whenever the page is shown, including from bfcache.
  window.addEventListener("pageshow", function (e) {
    closeMenu();
  });

  mobileMenuBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (mobileMenu.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Explicit × close button
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenu();
    });
  }

  // Click outside (on the overlay behind the menu) closes it
  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  // FIX: close the menu automatically when a real (non-submenu-toggle) link is tapped
  mobileMenu
    .querySelectorAll(".mobile-nav-list > li > a")
    .forEach(function (link) {
      const parentLi = link.closest("li");
      if (!parentLi.classList.contains("has-submenu")) {
        link.addEventListener("click", closeMenu);
      }
    });
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

// FIX: `position: sticky` only works if EVERY ancestor of .main-nav has
// no overflow, no transform, no filter, no will-change, and correct
// height — a single wrapping div anywhere up the tree can silently break
// it. Rather than hunt through the whole page for that, we make the nav
// stick via JS instead: switch it to position:fixed once you scroll past
// it, and insert a spacer with the same height so the page content
// doesn't jump upward when that happens.
function initStickyNavAndBackToTop() {
  const nav = document.querySelector(".main-nav");
  const mobileHeader = document.querySelector(".mobile-header");
  const spacer = document.getElementById("mainNavSpacer");
  const backToTopBtn = document.getElementById("backToTop");
  const STICKY_THRESHOLD = 1; // fix it basically as soon as it would scroll away
  const BACK_TO_TOP_THRESHOLD = 300;

  let navHeight = 0;

  function measureNav() {
    if (!nav) return;
    // measure while NOT fixed, so we get its natural in-flow height
    const wasFixed = nav.classList.contains("is-fixed");
    if (wasFixed) nav.classList.remove("is-fixed");
    navHeight = nav.offsetHeight;
    if (wasFixed) nav.classList.add("is-fixed");
    if (spacer) {
      spacer.style.height = nav.classList.contains("is-fixed")
        ? navHeight + "px"
        : "0px";
    }
  }

  let ticking = false;

  function update() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (nav) {
      const shouldStick = scrollTop > STICKY_THRESHOLD;
      const isFixed = nav.classList.contains("is-fixed");

      if (shouldStick && !isFixed) {
        nav.classList.add("is-fixed", "scrolled");
        if (spacer) spacer.style.height = navHeight + "px";
      } else if (!shouldStick && isFixed) {
        nav.classList.remove("is-fixed", "scrolled");
        if (spacer) spacer.style.height = "0px";
      }
    }

    if (mobileHeader) {
      mobileHeader.classList.toggle("is-fixed", scrollTop > STICKY_THRESHOLD);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle("show", scrollTop > BACK_TO_TOP_THRESHOLD);
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", debounce(measureNav, 200));

  measureNav();
  update(); // run once on load in case the page loads already scrolled

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// Sticky Footer Ad
// FIX: the CSS has `#stickyAd { display: flex !important; }` and a
// `#stickyAd.hidden { display: none !important; }` rule for hiding it.
// Setting `.style.display` directly (no !important) can never beat that
// stylesheet !important, so the close button silently did nothing.
// Toggling the `.hidden` class is what the CSS actually expects.
function initStickyAd() {
  const stickyAd = document.getElementById("stickyAd");
  const closeStickyAd = document.getElementById("closeStickyAd");

  if (stickyAd && closeStickyAd) {
    let adShown = false;
    stickyAd.classList.add("hidden"); // start hidden until scroll threshold

    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 500 && !adShown) {
        stickyAd.classList.remove("hidden");
        adShown = true;
      }
    });

    closeStickyAd.addEventListener("click", function () {
      stickyAd.classList.add("hidden");
    });
  }
}

// Lazy Load Images — FIX: was calling image.unobserve() which doesn't exist
// on an <img> element and threw an error, potentially breaking script flow.
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
            observer.unobserve(image); // FIX
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
    dateElement.textContent = convertToBanglaDate(now);
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
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

// Fade-in animation on scroll
const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
const fadeObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document
  .querySelectorAll(
    ".lead-item, .sidebar-lead-item, .top3-item, .category-item, .sports-item",
  )
  .forEach(function (item) {
    item.style.opacity = "0";
    fadeObserver.observe(item);
  });

// Handle window resize for responsive adjustments
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

const handleResize = debounce(function () {
  if (window.innerWidth >= 992) {
    const mobileMenu = document.getElementById("mobileMenu");
    const overlay = document.querySelector(".menu-overlay");

    if (mobileMenu && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
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

// FIX: Dropdown hover support for desktop — now checked live per interaction
// instead of once at page load (previously an initial resize from mobile
// to desktop, or vice versa, never re-attached/removed the listeners).
function initDropdownHover() {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(function (dropdown) {
    const dropdownMenu = dropdown.querySelector(".dropdown-menu");
    if (!dropdownMenu) return;

    dropdown.addEventListener("mouseenter", function () {
      if (window.innerWidth >= 992) {
        dropdownMenu.classList.add("show");
      }
    });

    dropdown.addEventListener("mouseleave", function () {
      if (window.innerWidth >= 992) {
        dropdownMenu.classList.remove("show");
      }
    });
  });
}

// --- GOOGLE TRANSLATION ENGINE CONFIGURATION ---
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("lang-toggle-btn");
  if (!btn) return;

  function translate(lang) {
    const interval = setInterval(function () {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
        clearInterval(interval);
      }
    }, 300);
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();

    if (btn.dataset.lang === "en") {
      translate("bn");
      btn.dataset.lang = "bn";
      btn.textContent = "English";
    } else {
      translate("en");
      btn.dataset.lang = "en";
      btn.textContent = "বাংলা";
    }
  });
});

console.log("Samakal Clone - Responsive Bootstrap Design Loaded Successfully");
