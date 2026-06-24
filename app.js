// This is the Intersection Observer. It watches the screen for elements.
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        // If the element enters the screen
        if (entry.isIntersecting) {
            entry.target.classList.add('active'); // Trigger the CSS animation
            
            // Optional: Un-observe it after it animates so it only happens once
            observer.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.1 // Triggers when 10% of the element is visible
});

// Find every element with the class 'reveal' and watch it
const hiddenElements = document.querySelectorAll('.reveal');
hiddenElements.forEach((el) => observer.observe(el));