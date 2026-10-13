
class ImageSlider {
  constructor(root) {
    this.root = root;
    this.viewport = root.querySelector(".slider-viewport");
    this.track = root.querySelector(".slider-track");
    this.previousButton = root.querySelector(".previous");
    this.nextButton = root.querySelector(".next");
    this.dotsContainer = root.querySelector(".slider-dots");
    this.counter = root.querySelector(".slide-counter");

    // Keep the original slides separate from the loop clones.
    this.slides = [...this.track.querySelectorAll(".slide")];
    this.total = this.slides.length;
    this.currentIndex = 1;
    this.isAnimating = false;
    this.duration = 450;

    if (this.total === 0) return;

    this.setupInfiniteLoop();
    this.createDots();
    this.updateSlider(false);
    this.bindEvents();
  }

  setupInfiniteLoop() {
    // Clone the last slide before the first.
    const lastClone = this.slides[this.total - 1].cloneNode(true);

    // Clone the first slide after the last.
    const firstClone = this.slides[0].cloneNode(true);

    lastClone.setAttribute("aria-hidden", "true");
    firstClone.setAttribute("aria-hidden", "true");

    this.track.prepend(lastClone);
    this.track.append(firstClone);

    // Track indexes now run from 0 to total + 1.
    // Index 0 is the last-slide clone.
    // Index total + 1 is the first-slide clone.
  }

  createDots() {
    this.dotsContainer.innerHTML = "";

    this.slides.forEach((slide, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);

      dot.addEventListener("click", () => {
        this.goTo(index + 1);
      });

      this.dotsContainer.appendChild(dot);
    });

    this.dots = [...this.dotsContainer.children];
  }

  bindEvents() {
    this.nextButton.addEventListener("click", () => {
      this.goTo(this.currentIndex + 1);
    });

    this.previousButton.addEventListener("click", () => {
      this.goTo(this.currentIndex - 1);
    });

    this.track.addEventListener("transitionend", (event) => {
      if (
        event.target !== this.track ||
        event.propertyName !== "transform"
      ) {
        return;
      }

      // If we reached the first-slide clone,
      // jump invisibly to the real first slide.
      if (this.currentIndex === this.total + 1) {
        this.currentIndex = 1;
        this.updateSlider(false);
      }

      // If we reached the last-slide clone,
      // jump invisibly to the real last slide.
      if (this.currentIndex === 0) {
        this.currentIndex = this.total;
        this.updateSlider(false);
      }

      this.isAnimating = false;
    });

    // Recalculate the position when the viewport changes size.
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSlider(false);
    });

    this.resizeObserver.observe(this.viewport);

    this.root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        this.goTo(this.currentIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        this.goTo(this.currentIndex - 1);
      }
    });
  }

  goTo(index) {
    if (this.isAnimating || this.total < 2) return;

    if (index === this.currentIndex) return;

    this.currentIndex = index;
    this.isAnimating = true;
    this.updateSlider(true);
  }

  updateSlider(animate = true) {
    const width = this.viewport.clientWidth;

    this.track.style.transition = animate
      ? `transform ${this.duration}ms ease-in-out`
      : "none";

    this.track.style.transform =
      `translateX(-${this.currentIndex * width}px)`;

    // Map clone indexes back to their real slide indexes.
    const realIndex =
      ((this.currentIndex - 1) % this.total + this.total) %
      this.total;

    this.dots?.forEach((dot, index) => {
      const active = index === realIndex;

      dot.classList.toggle("active", active);

      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (this.counter) {
      this.counter.textContent =
        `${realIndex + 1} / ${this.total}`;
    }
  }
}

document.querySelectorAll(".slider").forEach((slider) => {
  new ImageSlider(slider);
});
