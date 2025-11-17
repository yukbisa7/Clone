document.addEventListener('DOMContentLoaded', () => {
    // --- Search functionality ---
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

        document.addEventListener('click', (event) => {
            if (!searchContainer.contains(event.target) && !searchPopup.classList.contains('hidden')) {
                searchPopup.classList.add('hidden');
            }
        });
    }

    // --- SPA navigation functionality ---
    const pageLinks = document.querySelectorAll('[data-page]');
    const pages = document.querySelectorAll('.page-content');
    const mobileNavLinks = document.querySelectorAll('nav.lg\\:hidden a[data-page]');

    function showPage(pageId) {
        // Hide all pages
        pages.forEach(page => {
            if (!page.classList.contains('hidden')) {
                page.classList.add('hidden');
            }
        });

        // Show the target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }

        // Update active state for mobile nav
        mobileNavLinks.forEach(link => {
            link.classList.remove('text-yellow-400');
            link.classList.add('text-gray-400');
            if (link.dataset.page === pageId) {
                link.classList.remove('text-gray-400');
                link.classList.add('text-yellow-400');
            }
        });
    }

    pageLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = link.dataset.page;
            showPage(pageId);
        });
    });
});