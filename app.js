// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Find all elements with the gs-reveal class and animate them
gsap.utils.toArray('.gs-reveal').forEach(function(elem) {
    gsap.fromTo(elem, 
        { y: 50, opacity: 0 }, // Starting position (hidden and pushed down 50px)
        {
            y: 0, 
            opacity: 1, // Ending position (visible and at natural placement)
            duration: 1.2, 
            ease: "power3.out", // Creates a smooth, decelerating "physics" feel
            scrollTrigger: {
                trigger: elem,
                start: "top 85%", // Triggers when the element is 85% down the screen
                toggleActions: "play none none none" // Plays once and stays visible
            }
        }
    );
});