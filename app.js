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


// Image Modal Logic
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("expandedImg");
const captionText = document.getElementById("modalCaption");
const closeBtn = document.querySelector(".modal-close");

// Attach click event to all gallery images
document.querySelectorAll(".modal-trigger").forEach(img => {
    img.addEventListener("click", function() {
        modal.style.display = "flex";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
});

// Close modal on 'X' click
closeBtn.addEventListener("click", function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore background scrolling
});

// Close modal if user clicks anywhere outside the image
modal.addEventListener("click", function(e) {
    if (e.target !== modalImg) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

document.querySelectorAll(".modal-trigger").forEach(img => {
    img.addEventListener("click", function(e) {
        e.stopPropagation(); 
        modal.style.display = "flex";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
        document.body.style.overflow = "hidden"; 
    });
});

// Back to Top Button Logic
const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}