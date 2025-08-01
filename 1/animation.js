// animation.js

gsap.registerPlugin(ScrollTrigger);

// Apply animation to each section
gsap.utils.toArray(".stage").forEach((section) => {
  const media = section.querySelector("video, img");

  gsap.fromTo(media,
    {
      scale: 2.5,
      opacity: 0,
      filter: "blur(20px)"
    },
    {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "bottom center",
        scrub: true,
        pin: true,
        anticipatePin: 1
      }
    }
  );
});