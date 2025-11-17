document.addEventListener('DOMContentLoaded', () => {
    let dbData = {};

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

    const pages = document.querySelectorAll('.page-content');
    const mobileNavLinks = document.querySelectorAll('nav.lg\\:hidden a[data-page]');

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.add('hidden');
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            window.scrollTo(0, 0);
        }

        mobileNavLinks.forEach(link => {
            link.classList.remove('text-yellow-400', 'font-bold');
            link.classList.add('text-gray-400');
            if (link.dataset.page === pageId) {
                link.classList.add('text-yellow-400', 'font-bold');
            }
        });
    }

    const loadContent = async () => {
        try {
            const response = await fetch('./db.json');
            if (!response.ok) throw new Error('Network response was not ok');
            dbData = await response.json();
            
            // Sort all donghua by last updated date
            dbData.allDonghua.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            populateLatestEpisodes(dbData.allDonghua);
            populatePopularDonghua(dbData.allDonghua.filter(item => item.isPopular));
            populateSidebarPopular(dbData.allDonghua);
            populateGenres(dbData.genres);

            // Populate main content pages
            populateDonghuaPage(dbData.allDonghua.filter(item => item.type === 'TV Series'));
            populateMoviePage(dbData.allDonghua.filter(item => item.type === 'Movie'));

        } catch (error) {
            console.error('Failed to load content:', error);
        }
    };

    const createDonghuaCard = (item, isLatest = false) => {
        let episodeText = '';
        if (isLatest && item.episodes && item.episodes.length > 0) {
            // Find the highest episode number
            const latestEp = Math.max(...item.episodes.map(ep => ep.number));
            episodeText = `<p class="text-xs text-gray-400">Episode ${latestEp}</p>`;
        } else if (item.type === 'Movie') {
             episodeText = `<p class="text-xs text-gray-400">Movie</p>`;
        } else {
             episodeText = `<p class="text-xs text-gray-400">${item.episodes?.length || 0} Episodes</p>`;
        }

        return `
        <a href="#" data-page="detail-page" data-id="${item.id}" class="block relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition duration-300">
            <img src="${item.poster}" alt="${item.title}" class="w-full h-56 md:h-60 object-cover">
            <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                <h3 class="font-bold text-sm truncate text-white">${item.title}</h3>
                ${episodeText}
            </div>
        </a>
    `};

    const populateLatestEpisodes = (items) => {
        const container = document.getElementById('latest-episodes-grid');
        if (!container) return;
        // Display the top 10 most recently updated items
        container.innerHTML = items.slice(0, 10).map(item => createDonghuaCard(item, true)).join('');
    };

    const populatePopularDonghua = (items) => {
        const container = document.getElementById('popular-donghua-grid');
        if (!container) return;
        container.innerHTML = items.map(item => createDonghuaCard(item)).join('');
    };

    const populateSidebarPopular = (items) => {
        const container = document.getElementById('sidebar-popular-list');
        if (!container) return;
        // Sort by rating for sidebar
        const sortedByRating = [...items].sort((a,b) => (b.rating || 0) - (a.rating || 0));
        container.innerHTML = sortedByRating.slice(0, 5).map(item => `
            <li class="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded">
                <img src="${item.poster}" alt="${item.title}" class="w-12 h-16 object-cover rounded">
                <div>
                    <a href="#" data-page="detail-page" data-id="${item.id}" class="font-semibold text-sm hover:text-yellow-400">${item.title}</a>
                    <p class="text-xs text-gray-400">${item.type} <span class="text-yellow-400"><i class="fa fa-star fa-xs"></i> ${item.rating || 'N/A'}</span></p>
                </div>
            </li>
        `).join('');
    };

    const populateGenres = (items) => {
        const container = document.getElementById('genres-list');
        if (!container) return;
        container.innerHTML = items.map(item => `
            <a href="#" data-page="genre-page" class="bg-gray-700 text-xs py-1 px-3 rounded-full hover:bg-yellow-400 hover:text-gray-900">${item.name}</a>
        `).join('');
    };

    const populateDonghuaPage = (items) => {
        const container = document.getElementById('donghua-grid');
        if (!container) return;
        container.innerHTML = items.map(item => createDonghuaCard(item)).join('');
    };

    const populateMoviePage = (items) => {
        const container = document.getElementById('movie-grid');
        if (!container) return;
        container.innerHTML = items.map(item => createDonghuaCard(item)).join('');
    };

    const renderDetailPage = (id) => {
        const item = dbData.allDonghua.find(d => d.id === id);
        if (!item) return;
        const container = document.getElementById('detail-page-content');
        
        // Sort episodes by number, highest first
        const sortedEpisodes = item.episodes ? [...item.episodes].sort((a, b) => b.number - a.number) : [];

        const episodeListHtml = sortedEpisodes.map(ep => `
            <a href="#" data-page="player-page" data-id="${item.id}" data-episode="${ep.number}" class="block p-3 bg-gray-700 hover:bg-yellow-500 hover:text-gray-900 rounded transition duration-200">
                Episode ${ep.number} - ${ep.title}
            </a>`).join('');

        container.innerHTML = `
            <div class="mb-4">
                <button data-page="home-page" class="bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-500"><i class="fa fa-arrow-left mr-2"></i>Back</button>
            </div>
            <div class="flex flex-col md:flex-row gap-8">
                <div class="md:w-1/3">
                    <img src="${item.poster}" alt="${item.title}" class="w-full rounded-lg shadow-lg">
                </div>
                <div class="md:w-2/3">
                    <h2 class="text-4xl font-bold text-yellow-400 mb-2">${item.title}</h2>
                     <p class="text-lg text-yellow-400 mb-4"><i class="fa fa-star"></i> ${item.rating || 'N/A'}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${item.genres.map(g => `<span class="bg-gray-700 text-xs py-1 px-3 rounded-full">${g}</span>`).join('')}
                    </div>
                    <p class="text-gray-300 mb-6">${item.synopsis}</p>
                    <h3 class="text-2xl font-bold border-l-4 border-yellow-400 pl-4 mb-4">Episodes</h3>
                    <div class="max-h-96 overflow-y-auto space-y-2 pr-2">${episodeListHtml || '<p class=\"text-gray-400\">No episodes available yet.</p>'}</div>
                </div>
            </div>
        `;
        showPage('detail-page');
    };

    const renderPlayerPage = (id, episodeNumber) => {
        const item = dbData.allDonghua.find(d => d.id === id);
        if (!item) return;
        const episode = item.episodes.find(ep => ep.number === episodeNumber);
        if (!episode) return;
        const container = document.getElementById('player-page-content');

        container.innerHTML = `
            <div class="mb-4">
                 <button data-page="detail-page" data-id="${id}" class="bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-500"><i class="fa fa-arrow-left mr-2"></i>Back to Episodes</button>
            </div>
            <div class="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-lg">
                 <iframe src="${episode.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>
            </div>
            <div class="mt-6">
                <h2 class="text-3xl font-bold">${item.title}</h2>
                <h3 class="text-xl text-yellow-400">Episode ${episode.number}: ${episode.title}</h3>
            </div>
        `;
        showPage('player-page');
    }

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-page], button[data-page]');
        if (!link) return;
        
        e.preventDefault();
        const pageId = link.dataset.page;
        const donghuaId = link.dataset.id ? parseInt(link.dataset.id) : null;
        const episodeNumber = link.dataset.episode ? parseInt(link.dataset.episode) : null;

        if (pageId === 'detail-page' && donghuaId !== null) {
            renderDetailPage(donghuaId);
        } else if (pageId === 'player-page' && donghuaId !== null && episodeNumber !== null) {
            renderPlayerPage(donghuaId, episodeNumber);
        } else {
            showPage(pageId);
        }
    });

    // Initial Load
    loadContent();
    showPage('home-page');
});