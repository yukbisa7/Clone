document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- New search functionality ---
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const searchPopup = document.getElementById('search-popup');
    const searchContainer = document.getElementById('search-container');

    if (searchBtn && searchInput && searchPopup && searchContainer) {
        searchBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            searchPopup.classList.toggle('hidden');
            if (!searchPopup.classList.contains('hidden')) {
                searchInput.focus();
            }
        });

        // Close the search popup when clicking anywhere else on the document
        document.addEventListener('click', (event) => {
            if (!searchContainer.contains(event.target) && !searchPopup.classList.contains('hidden')) {
                searchPopup.classList.add('hidden');
            }
        });
    }
});