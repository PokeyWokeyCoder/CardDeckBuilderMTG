// Update last checked time
function updateLastChecked() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    const formattedDate = now.toLocaleDateString('en-US', options);
    
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = formattedDate;
    }
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Add animation on scroll
function handleScrollAnimations() {
    const patchCards = document.querySelectorAll('.patch-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    patchCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLastChecked();
    handleScrollAnimations();
    console.log('Deadlock Patch Notes loaded');
});

// Refresh last checked time every minute
setInterval(updateLastChecked, 60000);
