const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentSectionIndicator = document.querySelector("#current-section");
const currentYear = document.querySelector("#current-year");
const contactCopyStatus = document.querySelector("#contact-copy-status");
const sectionNavigation = document.querySelectorAll('.navigation a[href^="#"]');
const navigableSections = Array.from(sectionNavigation)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((section) => section instanceof HTMLElement);

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (contactCopyStatus instanceof HTMLElement) {
  document.querySelectorAll("button[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy");
      const label = button.getAttribute("data-copy-label") || "Contact detail";

      if (!value) {
        contactCopyStatus.textContent = "There is no contact detail to copy.";
        return;
      }

      if (!navigator.clipboard?.writeText) {
        contactCopyStatus.textContent = "Copying is not available in this browser. Please select and copy the text.";
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        contactCopyStatus.textContent = `${label} copied to clipboard.`;
      } catch (error) {
        contactCopyStatus.textContent = `Could not copy the ${label.toLowerCase()}. Please select and copy the text.`;
        console.error(`Could not copy the ${label.toLowerCase()}.`, error);
      }
    });
  });
}

if (menuToggle && navigation) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (sectionNavigation.length && navigableSections.length) {
  const linksBySection = new Map(
    Array.from(sectionNavigation, (link) => [link.getAttribute("href").slice(1), link])
  );
  const header = document.querySelector(".site-header");
  let scrollUpdateScheduled = false;

  const updateActiveSection = () => {
    const marker = window.scrollY + (header instanceof HTMLElement ? header.offsetHeight : 0) + 24;
    const currentSection = navigableSections
      .filter((section) => section.getBoundingClientRect().top + window.scrollY <= marker)
      .at(-1);

    sectionNavigation.forEach((link) => link.removeAttribute("aria-current"));
    const activeLink = linksBySection.get(currentSection?.id);
    activeLink?.setAttribute("aria-current", "location");
    if (currentSectionIndicator instanceof HTMLElement) {
      currentSectionIndicator.textContent = activeLink?.textContent.trim() || "Home";
    }
  };

  const scheduleActiveSectionUpdate = () => {
    if (scrollUpdateScheduled) {
      return;
    }

    scrollUpdateScheduled = true;
    window.requestAnimationFrame(() => {
      updateActiveSection();
      scrollUpdateScheduled = false;
    });
  };

  window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveSectionUpdate);
  window.addEventListener("hashchange", scheduleActiveSectionUpdate);
  updateActiveSection();
}
