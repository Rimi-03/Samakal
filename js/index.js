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

  // 1. Get or initialize the list of available ad indexes
  let availableIndexes = JSON.parse(localStorage.getItem("availableAdIndexes"));

  if (!availableIndexes || availableIndexes.length === 0) {
    // Fill the array with indexes [0, 1, 2, 3, 4, 5, 6]
    availableIndexes = Array.from({ length: ads.length }, (_, i) => i);
  }

  // 2. Pick a random item out of the REMAINING available options
  const poolIndex = Math.floor(Math.random() * availableIndexes.length);
  const adIndex = availableIndexes[poolIndex];

  // 3. Remove the chosen index from the pool so it won't repeat
  availableIndexes.splice(poolIndex, 1);
  localStorage.setItem("availableAdIndexes", JSON.stringify(availableIndexes));

  // 4. Display the selected ad
  const selectedAd = ads[adIndex];
  const adImage = document.getElementById("ad-image");
  const adLink = document.getElementById("ad-link");

  if (selectedAd && adImage && adLink) {
    adLink.href = selectedAd.url;
    adImage.alt = "Advertisement";

    adImage.style.opacity = "0";
    adImage.style.transition = "opacity 0.5s ease";

    adImage.addEventListener("load", function () {
      this.style.opacity = "1";
    });

    adImage.src = selectedAd.image;

    if (adImage.complete) {
      adImage.style.opacity = "1";
    }
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

// Category Page Load More Functionality
document.addEventListener("DOMContentLoaded", function () {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const autoLoadSpinner = document.querySelector(".auto-load");
  const allNewsItems = document.querySelectorAll(".CatListNews");
  let isLoading = false;

  // --- 1. INITIAL SETUP ---
  // Hide all news items immediately on page refresh
  allNewsItems.forEach((item) => (item.style.display = "none"));

  // Keep the spinner visible to signal loading
  if (autoLoadSpinner) autoLoadSpinner.style.display = "block";
  if (loadMoreBtn) loadMoreBtn.style.display = "inline-flex";
  // Manual Load More button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      loadMoreNews();
    });
  }

  // Reveal first 4 items after 1 second
  setTimeout(function () {
    let initialCount = 0;
    allNewsItems.forEach(function (item) {
      if (!item.classList.contains("extra-news") && initialCount < 4) {
        item.style.display = "block";
        initialCount++;
      }
    });

    // Start looking for the spinner to auto-load the rest
    initAutoScrollLoad();
  }, 1000);

  // --- 2. CONTINUOUS AUTO-RELOAD LOGIC ---
  function loadMoreNews() {
    if (isLoading) return;
    isLoading = true;

    // Show the spinner while injecting the next batch
    if (autoLoadSpinner) autoLoadSpinner.style.display = "block";

    setTimeout(function () {
      const hiddenNews = Array.from(
        document.querySelectorAll(".extra-news"),
      ).filter((item) => item.style.display === "none");

      // Reveal next 2 items
      let loadedCount = 0;
      hiddenNews.forEach(function (item) {
        if (loadedCount < 2) {
          item.style.display = "block";
          loadedCount++;
        }
      });

      // Check if any hidden items remain
      const remainingHidden = Array.from(
        document.querySelectorAll(".extra-news"),
      ).filter((item) => item.style.display === "none");

      if (remainingHidden.length === 0) {
        // Stop spinning and completely clear the loader elements if everything is fetched
        if (autoLoadSpinner) autoLoadSpinner.remove();
        if (loadMoreBtn) loadMoreBtn.closest(".read-more-btn").remove();
      } else {
        // Briefly hide the spinner to allow it to trigger again on the next scroll boundary
        if (autoLoadSpinner) autoLoadSpinner.style.display = "none";
      }

      isLoading = false;
    }, 1000); // 1-second delay per batch
  }

  // --- 3. SCROLL DETECTOR ---
  function initAutoScrollLoad() {
    if (!autoLoadSpinner) return;

    const observer = new IntersectionObserver(
      function (entries) {
        // If the spinner rolls into the viewport and we aren't already loading, fetch next batch
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreNews();
        }
      },
      {
        rootMargin: "0px 0px 100px 0px", // Triggers 100px before the spinner hits the screen edge for smoother UX
      },
    );

    observer.observe(autoLoadSpinner);
  }
});

//mobile menu
// Universal Mobile Menu Toggle Function
function myMenuBtnChng() {
  // 1. Try to find either of your menu containers
  const nav =
    document.getElementById("mobile-nav") ||
    document.getElementById("mobileMenu");
  // 2. Try to find your hamburger button wrapper or icon
  const icon =
    document.querySelector("#menu-button i") ||
    document.querySelector("#mobileMenuBtn i");

  if (!nav) {
    console.error("Mobile Menu Element not found on this page.");
    return;
  }

  // Toggle BOTH potential CSS visibility classes so your CSS always matches
  nav.classList.toggle("show");
  nav.classList.toggle("active");

  const isOpen =
    nav.classList.contains("show") || nav.classList.contains("active");

  if (isOpen) {
    document.body.style.overflow = "hidden";
    // Safely change icon to cross if icon element exists
    if (icon) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    }
  } else {
    document.body.style.overflow = "";
    // Safely change icon to hamburger if icon element exists
    if (icon) {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  }
}

function toggleSearch(e) {
  e.preventDefault();
  const block = document.getElementById("searchBlock");
  const isHidden = block.style.display === "none" || block.style.display === "";
  block.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    setTimeout(() => document.getElementById("search").focus(), 50);
  }
}

function toggleSub(icon) {
  const parentLi = icon.closest(".parent");
  const subMenu = parentLi.querySelector(".SubMenuM");
  const isOpen = subMenu.style.display === "block";

  // Close every submenu
  document.querySelectorAll(".SubMenuM").forEach((menu) => {
    menu.style.display = "none";
  });

  document.querySelectorAll(".open-menu").forEach((btn) => {
    btn.innerHTML = "+";
    btn.classList.remove("active");
  });

  if (!isOpen) {
    subMenu.style.display = "block";

    icon.innerHTML = "−"; // minus

    icon.classList.add("active");
  }
}

console.log("Samakal Clone - Responsive Bootstrap Design Loaded Successfully");
