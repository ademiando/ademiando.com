document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");

  const scrollReveal = () => {
    const triggerBottom = window.innerHeight - 100;

    sections.forEach(el => {
      const top = el.getBoundingClientRect().top;

      if (top < triggerBottom) {
        Object.assign(el.style, {
          opacity: 1,
          transform: "translateY(0)",
          transition: "all 0.6s ease-out"
        });
      } else {
        Object.assign(el.style, {
          opacity: 0,
          transform: "translateY(40px)"
        });
      }
    });
  };

  window.addEventListener("scroll", scrollReveal);
  scrollReveal(); // jalanin pas pertama kali load
});