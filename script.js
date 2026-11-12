const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentSectionIndicator = document.querySelector("#current-section");
const currentYear = document.querySelector("#current-year");
const contactCopyStatus = document.querySelector("#contact-copy-status");
const projectVideo = document.querySelector("#survival-hunt-video");
const videoPreview = projectVideo?.closest("[data-video-preview]");
const videoPlayback = videoPreview?.querySelector(".video-playback");
const videoStatus = videoPreview?.querySelector(".video-status");
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

if (
  projectVideo instanceof HTMLVideoElement &&
  videoPreview instanceof HTMLElement &&
  videoPlayback instanceof HTMLButtonElement &&
  videoStatus instanceof HTMLElement
) {
  const restoreSilentPreview = (message = "") => {
    projectVideo.muted = true;
    projectVideo.loop = true;
    projectVideo.controls = false;
    videoPreview.classList.remove("is-playing");
    videoPlayback.hidden = false;
    videoStatus.textContent = message;

    const previewPlayback = projectVideo.play();
    if (previewPlayback) {
      previewPlayback.catch((error) => {
        videoStatus.textContent = "The silent video preview could not resume.";
        console.error("Could not resume the Survival Hunt preview.", error);
      });
    }
  };
  let playbackTimeout;

  const playWalkthroughFromStart = () => {
    if (projectVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
      projectVideo.currentTime = 0;
    }

    window.clearTimeout(playbackTimeout);
    playbackTimeout = window.setTimeout(() => {
      if (projectVideo.paused) {
        restoreSilentPreview("The walkthrough is taking too long to load. Please try again.");
      }
    }, 30000);

    const playback = projectVideo.play();
    if (playback) {
      playback
        .then(() => {
          window.clearTimeout(playbackTimeout);
          videoStatus.textContent = "";
        })
        .catch((error) => {
          restoreSilentPreview("The walkthrough could not start. The silent preview has been restored.");
          console.error("Could not start the Survival Hunt walkthrough.", error);
        });
    }
  };

  videoPlayback.addEventListener("click", () => {
    projectVideo.pause();
    projectVideo.muted = false;
    projectVideo.loop = false;
    projectVideo.controls = true;
    videoStatus.textContent = "Starting the walkthrough.";
    playWalkthroughFromStart();
  });
  projectVideo.addEventListener("playing", () => {
    window.clearTimeout(playbackTimeout);
    if (!projectVideo.muted) {
      videoPreview.classList.add("is-playing");
      videoPlayback.hidden = true;
      videoStatus.textContent = "";
    }
  });
  projectVideo.addEventListener("ended", () => {
    projectVideo.currentTime = 0;
    restoreSilentPreview();
  });
  projectVideo.addEventListener("error", () => {
    if (!projectVideo.muted) {
      restoreSilentPreview("The walkthrough could not be loaded. The silent preview has been restored.");
      return;
    }

    videoStatus.textContent = "The silent video preview could not be loaded.";
  });
}
