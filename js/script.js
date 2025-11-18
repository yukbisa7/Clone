// =================================================================================
// DONGHUAFAST SCRIPT - GABUNGAN FINAL (FIXED FOR GITHUB PAGES SUBDIRECTORY)
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI ---
    // Ubah ini agar sesuai dengan nama repositori Anda di GitHub Pages.
    // Jika URL Anda adalah 'username.github.io/MyWebsite/', maka basePath adalah '/MyWebsite'.
    const basePath = '/Clone'; 
    let dbData = {};

    // --- Search functionality ---
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const searchPopup = document.getElementById('search-popup');
    const searchContainer = document.getElementById('search-container');
    const searchResultsContainer = document.getElementById('search-results');

    const handleSearch = () => {
        if (!dbData.allDonghua) return;
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm.length < 2) {
            searchResultsContainer.innerHTML = ''; return;
        }
        const results = dbData.allDonghua.filter(item => item.title.toLowerCase().includes(searchTerm));
        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p class="text-gray-400 p-2 text-center">No results found.</p>'; return;
        }
        searchResultsContainer.innerHTML = results.map(item => `
            <a href="/${item.slug}" class="nav-link search-result-item flex items-center space-x-3 p-2 hover:bg-gray-700 rounded transition-colors duration-200 w-full">
                <img src="${item.poster}" alt="${item.title}" class="w-10 h-14 object-cover rounded">
                <div><p class="font-semibold text-sm line-clamp-2">${item.title}</p><p class="text-xs text-gray-400">${item.type}</p></div>
            </a>`).join('');
    };

    if (searchBtn && searchInput && searchPopup) {
        searchBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            searchPopup.classList.toggle('hidden');
            if (!searchPopup.classList.contains('hidden')) searchInput.focus();
            else { searchInput.value = ''; searchResultsContainer.innerHTML = ''; }
        });
        document.addEventListener('click', (event) => {
            if (searchContainer && !searchContainer.contains(event.target) && !searchPopup.classList.contains('hidden')) {
                searchPopup.classList.add('hidden'); searchInput.value = ''; searchResultsContainer.innerHTML = '';
            }
        });
        searchPopup.addEventListener('click', (event) => {
            if (event.target.closest('.search-result-item')) {
                searchPopup.classList.add('hidden'); searchInput.value = ''; searchResultsContainer.innerHTML = '';
            }
        });
        searchInput.addEventListener('input', handleSearch);
    }
    
    // --- Router & Navigasi ---
    const pages = document.querySelectorAll('.page-content');
    function showPage(pageId) {
        pages.forEach(page => page.classList.add('hidden'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    const router = () => {
        // MODIFIKASI: Dapatkan path dan hapus basePath dari awal string
        let path = window.location.pathname;
        if (path.startsWith(basePath)) {
            path = path.substring(basePath.length);
        }
        // Jika path kosong setelah menghapus basePath, anggap itu root ('/')
        if (path === '') {
            path = '/';
        }

        const segments = path.split('/').filter(Boolean);

        // Static routes
        if (path === '/') {
            showPage('home-page');
            return;
        }
        if (path === '/donghua') {
            showPage('donghua-page');
            return;
        }
        if (path === '/movie') {
            showPage('movie-page');
            return;
        }
        if (path === '/schedule') {
            showPage('schedule-page');
            return;
        }

        // Genre route (has a prefix)
        if (segments[0] === 'genre') {
            if (segments.length > 1) { // /genre/action
                const genreName = decodeURIComponent(segments[1]);
                renderGenrePage(genreName);
            } else { // /genre
                renderAllGenresPage();
            }
            return;
        }

        // Dynamic routes (must have dbData loaded)
        if (!dbData.allDonghua) return;

        // Player page: /:donghuaSlug/:episodeSlug
        if (segments.length === 2) {
            const [donghuaSlug, episodeSlug] = segments;
            const item = dbData.allDonghua.find(d => d.slug === donghuaSlug);
            if (item && item.episodes) {
                const episode = item.episodes.find(ep => ep.slug === episodeSlug);
                if (episode) {
                    renderPlayerPage(item, episode);
                    return;
                }
            }
        }
        
        // Detail page: /:donghuaSlug
        if (segments.length === 1) {
            const [donghuaSlug] = segments;
            const item = dbData.allDonghua.find(d => d.slug === donghuaSlug);
            if (item) {
                renderDetailPage(item);
                return;
            }
        }

        // Fallback for unmatched routes
        showPage('home-page');
    };

    // --- Memuat Konten ---
    const loadContent = async () => {
        try {
            // MODIFIKASI: Pastikan path ke db.json benar relatif terhadap index.html
            // Jika db.json berada di folder yang sama dengan index.html, './db.json' sudah benar.
            const response = await fetch('./db.json');
            if (!response.ok) throw new Error('Network response was not ok');
            dbData = await response.json();
            dbData.allDonghua.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            populateAllContent();
        } catch (error) { console.error('Failed to load content:', error); }
    };
    
    const populateAllContent = () => {
        populatePopularSlider(dbData.allDonghua.filter(item => item.isPopular));
        populateLatestEpisodes(dbData.allDonghua);
        populatePopularDonghua(dbData.allDonghua.filter(item => item.isPopular));
        populateSidebarPopular(dbData.allDonghua);
        populateGenres(dbData.genres);
        populateSchedulePage(dbData.schedule, dbData.allDonghua);
        populateDonghuaPage(dbData.allDonghua.filter(item => item.type === 'TV Series'));
        populateMoviePage(dbData.allDonghua.filter(item => item.type === 'Movie'));
    };
    
    // --- Semua Fungsi 'populate' dan 'render' LENGKAP (TIDAK ADA PERUBAHAN DI SINI) ---
    // Catatan: Semua href di dalam fungsi-fungsi ini HARUS tetap dimulai dengan '/'
    // contoh: <a href="/${item.slug}" ...>
    const createDonghuaCard = (item) => {
        let typeTagHtml = '';
        if (item.type === 'TV Series' && item.episodes && item.episodes.length > 0) {
            const latestEp = Math.max(...item.episodes.map(ep => ep.number));
            typeTagHtml = `<div class="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md">${latestEp}</div>`;
        } else if (item.type === 'Movie') {
            typeTagHtml = `<div class="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">Movie</div>`;
        }
        return `<a href="/${item.slug}" class="nav-link block relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition duration-300">
                <img src="${item.poster}" alt="${item.title}" class="w-full h-36 md:h-48 object-cover">
                ${typeTagHtml}
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <h3 class="font-bold text-xs text-white line-clamp-2">${item.title}</h3>
                </div>
            </a>`;
    };
    const populateLatestEpisodes = (items) => {
        const container = document.getElementById('latest-episodes-grid');
        if (container) container.innerHTML = items.slice(0, 8).map(item => createDonghuaCard(item)).join('');
    };
    const populatePopularDonghua = (items) => {
        const container = document.getElementById('popular-donghua-grid');
        if (container) container.innerHTML = items.slice(0, 8).map(item => createDonghuaCard(item)).join('');
    };
    const populateSidebarPopular = (items) => {
        const container = document.getElementById('sidebar-popular-list');
        if (!container) return;
        const topRatedItems = items.filter(item => item.isTopRated);
        container.innerHTML = topRatedItems.slice(0, 5).map(item => `
            <li class="flex items-center space-x-4 hover:bg-gray-700 p-2 rounded">
                <img src="${item.poster}" alt="${item.title}" class="w-12 h-16 object-cover rounded">
                <div>
                    <a href="/${item.slug}" class="nav-link font-semibold text-sm hover:text-yellow-400">${item.title}</a>
                    <p class="text-xs text-gray-400">${item.type} <span class="text-yellow-400"><i class="fa fa-star fa-xs"></i> ${item.rating || 'N/A'}</span></p>
                </div>
            </li>`).join('');
    };
    const populateGenres = (items) => {
        const container = document.getElementById('genres-list');
        if (container) container.innerHTML = items.map(item => `<a href="/genre/${encodeURIComponent(item.name.toLowerCase())}" class="nav-link bg-gray-700 text-xs py-1 px-3 rounded-full hover:bg-yellow-400 hover:text-gray-900">${item.name}</a>`).join('');
    };
    const populateDonghuaPage = (items) => {
        const container = document.getElementById('donghua-grid');
        if (container) container.innerHTML = items.map(item => createDonghuaCard(item)).join('');
    };
    const populateMoviePage = (items) => {
        const container = document.getElementById('movie-grid');
        if (container) container.innerHTML = items.map(item => createDonghuaCard(item)).join('');
    };
    const populatePopularSlider = (items) => {
        const slider = document.getElementById('popular-slider');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');
        if (!slider || !prevBtn || !nextBtn || items.length === 0) return;
        slider.innerHTML = items.map((item, index) => `<div class="slider-item absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}">
                <img src="${item.poster}" class="w-full h-full object-cover" alt="${item.title}">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-4 md:p-8">
                    <h2 class="text-2xl md:text-4xl font-bold mb-2">${item.title}</h2>
                    <p class="text-gray-300 md:text-lg hidden md:block max-w-2xl line-clamp-2">${item.synopsis}</p>
                    <a href="${(item.episodes && item.episodes.length > 0) ? `/${item.slug}/${item.episodes[0].slug}` : `/${item.slug}`}" class="nav-link mt-4 inline-block bg-yellow-400 text-gray-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-500">Watch Now</a>
                </div>
            </div>`).join('');
        let currentIndex = 0;
        const slides = slider.querySelectorAll('.slider-item');
        const slideCount = slides.length;
        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('opacity-100', i === index);
                slide.classList.toggle('opacity-0', i !== index);
            });
        };
        const next = () => { currentIndex = (currentIndex + 1) % slideCount; showSlide(currentIndex); };
        const prev = () => { currentIndex = (currentIndex - 1 + slideCount) % slideCount; showSlide(currentIndex); };
        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);
        setInterval(next, 5000);
    };
    const populateSchedulePage = (schedule, allDonghua) => {
        const container = document.getElementById('schedule-container');
        if (!container || !schedule) return;
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const groupedByDay = daysOfWeek.reduce((acc, day) => { acc[day] = schedule.filter(item => item.day === day); return acc; }, {});
        let html = '';
        for (const day of daysOfWeek) {
            const items = groupedByDay[day];
            if (items.length > 0) {
                html += `<h3 class="text-2xl font-bold text-yellow-400 mt-8 mb-4">${day}</h3><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
                html += items.map(item => {
                    const donghua = allDonghua.find(d => d.id === item.donghuaId);
                    if (!donghua) return '';
                    return `<a href="/${donghua.slug}" class="nav-link flex items-center bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
                            <img src="${donghua.poster}" alt="${donghua.title}" class="w-16 h-24 object-cover rounded-md mr-4">
                            <div class="flex-grow"><h4 class="font-bold text-lg">${donghua.title}</h4><p class="text-yellow-400 font-semibold">${item.time}</p></div>
                        </a>`;
                }).join('');
                html += '</div>';
            }
        }
        container.innerHTML = html || '<p class="text-gray-400 text-lg text-center py-20">The schedule is currently empty.</p>';
    };
    const createEpisodeSelector = (item, currentEpisodeSlug) => {
        if (!item.episodes || item.episodes.length === 0) return '';
        const sortedEpisodes = [...item.episodes].sort((a, b) => a.number - b.number);
        const lastEp = sortedEpisodes[sortedEpisodes.length - 1].number;
        const episodesPerPage = 20;
        let currentEpisodeNumber = sortedEpisodes.find(ep => ep.slug === currentEpisodeSlug)?.number || lastEp;
        let activeRangeStart = Math.floor((currentEpisodeNumber - 1) / episodesPerPage) * episodesPerPage + 1;
        let rangeTabsHtml = '', episodeGridsHtml = '';
        for (let i = 0; i < lastEp; i += episodesPerPage) {
            const start = i + 1, end = i + episodesPerPage;
            const episodesInRange = sortedEpisodes.filter(ep => ep.number >= start && ep.number <= end);
            if (episodesInRange.length > 0) {
                const isActive = start === activeRangeStart;
                rangeTabsHtml += `<button data-range-start="${start}" class="episode-range-tab px-3 py-2 text-sm font-semibold whitespace-nowrap ${isActive ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-yellow-300'}">${start}-${end}</button>`;
                const gridItems = episodesInRange.map(ep => `<a href="/${item.slug}/${ep.slug}" class="nav-link flex items-center justify-center p-2 h-10 rounded-md transition duration-200 text-center text-sm ${ep.slug === currentEpisodeSlug ? 'bg-yellow-400 text-gray-900 font-bold' : 'bg-gray-700 hover:bg-yellow-500 hover:text-gray-900'}">${ep.number}</a>`).join('');
                episodeGridsHtml += `<div data-grid-range-start="${start}" class="episode-grid grid grid-cols-4 sm:grid-cols-5 gap-2 ${isActive ? '' : 'hidden'}">${gridItems}</div>`;
            }
        }
        return `<div class="episode-selector-container mt-6"><div class="flex items-center mb-4"><h3 class="text-xl font-bold border-l-4 border-yellow-400 pl-4">Episodes (${sortedEpisodes.length})</h3></div><div class="flex overflow-x-auto scrolling-touch border-b border-gray-700 mb-4">${rangeTabsHtml}</div><div class="episode-grids-container">${episodeGridsHtml}</div></div>`;
    };
    const renderDetailPage = (item) => {
        const container = document.getElementById('detail-page-content');
        if (!container) return;
        container.innerHTML = `<div class="flex flex-col md:flex-row gap-8"><div class="md:w-1/3 flex-shrink-0"><img src="${item.poster}" alt="${item.title}" class="w-2/3 mx-auto md:w-full md:mx-0 aspect-[2/3] object-cover rounded-lg shadow-lg"></div><div class="md:w-2/3"><h2 class="text-4xl font-bold text-yellow-400 mb-2">${item.title}</h2><p class="text-lg text-yellow-400 mb-4"><i class="fa fa-star"></i> ${item.rating || 'N/A'}</p><div class="flex flex-wrap gap-2 mb-4">${item.genres.map(g => `<span class="bg-gray-700 text-xs py-1 px-3 rounded-full">${g}</span>`).join('')}</div><p class="text-gray-300 mb-6">${item.synopsis}</p>${createEpisodeSelector(item)}</div></div>`;
        showPage('detail-page');
    };
    const renderPlayerPage = (item, episode) => {
        const container = document.getElementById('player-page-content');
        if (!container) return;
        const highestEpisode = item.episodes.reduce((max, ep) => ep.number > max ? ep.number : max, 0);
        container.innerHTML = `<div class="flex flex-col lg:flex-row gap-8"><div class="w-full lg:w-2/3"><div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg"><div class="aspect-video bg-black"><iframe src="${episode.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe></div><div class="p-4"><h2 class="text-2xl font-bold">${item.title}</h2><h3 class="text-lg text-yellow-400 mt-1">EP ${episode.number}/${highestEpisode} - ${episode.title}</h3></div></div></div><div class="w-full lg:w-1/3 bg-gray-800 p-4 rounded-lg">${createEpisodeSelector(item, episode.slug)}</div></div>`;
        showPage('player-page');
    };
    const renderAllGenresPage = () => {
        const container = document.getElementById('genre-page-content');
        if (!container) return;
        container.innerHTML = `<section><h2 class="text-2xl font-bold border-l-4 border-yellow-400 pl-4 mb-6">All Genres</h2><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">${dbData.genres.map(item => `<a href="/genre/${encodeURIComponent(item.name.toLowerCase())}" class="nav-link block text-center bg-gray-800 p-4 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition duration-300"><h3 class="font-bold text-lg">${item.name}</h3></a>`).join('')}</div></section>`;
        showPage('genre-page');
    };
    const renderGenrePage = (genreName) => {
        const container = document.getElementById('genre-page-content');
        if (!container) return;
        const filteredItems = dbData.allDonghua.filter(item => item.genres.map(g => g.toLowerCase()).includes(genreName.toLowerCase()));
        const itemsGridHtml = filteredItems.length > 0 ? filteredItems.map(item => createDonghuaCard(item)).join('') : `<p class="col-span-full text-center text-gray-400 py-10">No items found for the genre "${genreName}".</p>`;
        container.innerHTML = `<section><div class="flex items-center justify-between flex-wrap gap-4 mb-6"><h2 class="text-2xl font-bold border-l-4 border-yellow-400 pl-4">Genre: ${genreName}</h2><a href="/genre" class="nav-link bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"><i class="fa fa-arrow-left mr-2"></i>All Genres</a></div><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${itemsGridHtml}</div></section>`;
        showPage('genre-page');
    };

    // --- Event Listeners ---
    document.body.addEventListener('click', (e) => {
        const episodeTab = e.target.closest('.episode-range-tab');
        if (episodeTab) {
            e.preventDefault();
            const container = episodeTab.closest('.episode-selector-container');
            if (!container) return;
            container.querySelectorAll('.episode-range-tab').forEach(t => t.classList.remove('text-yellow-400', 'border-b-2', 'border-yellow-400'));
            container.querySelectorAll('.episode-grid').forEach(g => g.classList.add('hidden'));
            episodeTab.classList.add('text-yellow-400', 'border-b-2', 'border-yellow-400');
            const start = episodeTab.dataset.rangeStart;
            const gridToShow = container.querySelector(`.episode-grid[data-grid-range-start="${start}"]`);
            if (gridToShow) gridToShow.classList.remove('hidden');
        }
    });
    
    // MODIFIKASI: Intercept clicks on nav-links untuk menggunakan history.pushState dengan basePath
    document.body.addEventListener('click', e => {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            const href = navLink.getAttribute('href');
            // Pastikan ini adalah tautan internal (dimulai dengan /) dan bukan tautan eksternal
            if (href && href.startsWith('/')) { 
                e.preventDefault();
                const fullPath = basePath + href;
                // Hanya push state jika path-nya berbeda untuk menghindari entri duplikat
                if (window.location.pathname !== fullPath) {
                    history.pushState({}, '', fullPath);
                    router();
                }
            }
        }
    });

    window.addEventListener('popstate', router);
    
    // --- Inisialisasi ---
    loadContent().then(() => {
        router(); // Panggil router setelah konten dimuat
    });
});