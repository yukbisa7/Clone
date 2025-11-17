document.addEventListener('DOMContentLoaded', () => {
    let dbData = {};

    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    const addAnimeForm = document.getElementById('add-anime-form');
    const addEpisodeForm = document.getElementById('add-episode-form');
    const editAnimeSelect = document.getElementById('edit-anime-select');
    const editAnimeForm = document.getElementById('edit-anime-form');
    const editEpisodeSelectDonghua = document.getElementById('edit-episode-select-donghua');
    const editEpisodeSelectEpisode = document.getElementById('edit-episode-select-episode');
    const editEpisodeForm = document.getElementById('edit-episode-form');

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;

            tabs.forEach(t => {
                t.classList.remove('text-purple-400', 'border-purple-400');
                t.classList.add('text-gray-400', 'border-transparent');
            });
            tab.classList.add('text-purple-400', 'border-purple-400');
            tab.classList.remove('text-gray-400', 'border-transparent');

            contents.forEach(content => {
                if (content.id === target) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });

    const loadData = async () => {
        try {
            const response = await fetch('../db.json');
            if (!response.ok) throw new Error('Failed to load database.');
            dbData = await response.json();
            populateSelects();
        } catch (error) {
            console.error(error);
            alert('Could not load data.');
        }
    };

    const populateSelects = () => {
        const animeOptions = dbData.allDonghua
            .map(d => `<option value="${d.id}">${d.title}</option>`).join('');
        
        addEpisodeForm.querySelector('select').innerHTML = `<option value="">-- Select Anime --</option>${animeOptions}`;
        editAnimeSelect.innerHTML = `<option value="">-- Select Anime to Edit --</option>${animeOptions}`;
        editEpisodeSelectDonghua.innerHTML = `<option value="">-- Select Anime --</option>${animeOptions}`;
        editEpisodeSelectEpisode.innerHTML = '<option value="">-- Select Episode --</option>';
        editAnimeForm.classList.add('hidden');
        editEpisodeForm.classList.add('hidden');
    };

    // ADD ANIME
    addAnimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAnime = {
            id: Date.now(),
            title: e.target.title.value,
            poster: e.target.poster.value || `https://picsum.photos/200/300?random=${Date.now()}`,
            synopsis: e.target.synopsis.value,
            genres: e.target.genres.value.split(',').map(g => g.trim()),
            type: e.target.type.value,
            rating: parseFloat(e.target.rating.value) || 0,
            isPopular: e.target.isPopular.checked,
            updatedAt: new Date().toISOString(),
            episodes: []
        };
        dbData.allDonghua.unshift(newAnime);
        alert(`'${newAnime.title}' added successfully!`);
        addAnimeForm.reset();
        populateSelects();
    });

    // ADD EPISODE
    addEpisodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const donghuaId = parseInt(e.target.donghua.value);
        if (!donghuaId) return alert('Please select an anime.');
        
        const newEpisode = {
            number: parseInt(e.target.number.value),
            title: e.target.title.value,
            url: e.target.url.value
        };

        const donghuaIndex = dbData.allDonghua.findIndex(d => d.id === donghuaId);
        if (donghuaIndex === -1) return alert('Anime not found.');

        const donghua = dbData.allDonghua[donghuaIndex];
        donghua.episodes.unshift(newEpisode);
        donghua.episodes.sort((a,b) => b.number - a.number); // Keep sorted desc
        donghua.updatedAt = new Date().toISOString();

        // Move donghua to top of the list
        dbData.allDonghua.splice(donghuaIndex, 1);
        dbData.allDonghua.unshift(donghua);

        alert(`Episode ${newEpisode.number} added to ${donghua.title}.`);
        addEpisodeForm.reset();
        populateSelects();
    });

    // EDIT ANIME - Selection
    editAnimeSelect.addEventListener('change', () => {
        const donghuaId = parseInt(editAnimeSelect.value);
        if (!donghuaId) {
            editAnimeForm.classList.add('hidden');
            return;
        }
        const donghua = dbData.allDonghua.find(d => d.id === donghuaId);
        if (!donghua) return;

        editAnimeForm.id.value = donghua.id;
        editAnimeForm.title.value = donghua.title;
        editAnimeForm.poster.value = donghua.poster;
        editAnimeForm.synopsis.value = donghua.synopsis;
        editAnimeForm.genres.value = donghua.genres.join(', ');
        editAnimeForm.type.value = donghua.type;
        editAnimeForm.rating.value = donghua.rating;
        editAnimeForm.isPopular.checked = donghua.isPopular;
        editAnimeForm.classList.remove('hidden');
    });

    // EDIT ANIME - Submission
    editAnimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const donghuaId = parseInt(e.target.id.value);
        const donghuaIndex = dbData.allDonghua.findIndex(d => d.id === donghuaId);
        if (donghuaIndex === -1) return alert('Anime not found.');

        const donghua = dbData.allDonghua[donghuaIndex];
        const updatedDonghua = {
            ...donghua, // preserve episodes and original ID
            title: e.target.title.value,
            poster: e.target.poster.value,
            synopsis: e.target.synopsis.value,
            genres: e.target.genres.value.split(',').map(g => g.trim()),
            type: e.target.type.value,
            rating: parseFloat(e.target.rating.value),
            isPopular: e.target.isPopular.checked,
            updatedAt: new Date().toISOString(),
        };
        
        dbData.allDonghua[donghuaIndex] = updatedDonghua;
        // Move to top
        dbData.allDonghua.splice(donghuaIndex, 1);
        dbData.allDonghua.unshift(updatedDonghua);

        alert(`'${updatedDonghua.title}' updated successfully.`);
        editAnimeForm.reset();
        editAnimeForm.classList.add('hidden');
        populateSelects();
        editAnimeSelect.value = '';
    });

    // EDIT EPISODE - Donghua Selection
    editEpisodeSelectDonghua.addEventListener('change', () => {
        const donghuaId = parseInt(editEpisodeSelectDonghua.value);
        editEpisodeForm.classList.add('hidden');
        if (!donghuaId) {
            editEpisodeSelectEpisode.innerHTML = '<option value="">-- Select Episode --</option>';
            return;
        }
        const donghua = dbData.allDonghua.find(d => d.id === donghuaId);
        if (!donghua || !donghua.episodes || donghua.episodes.length === 0) {
            editEpisodeSelectEpisode.innerHTML = '<option value="">-- No Episodes Found --</option>';
            return;
        }
        const episodeOptions = donghua.episodes.map(ep => `<option value="${ep.number}">Ep ${ep.number}: ${ep.title}</option>`).join('');
        editEpisodeSelectEpisode.innerHTML = `<option value="">-- Select Episode --</option>${episodeOptions}`;
    });

    // EDIT EPISODE - Episode Selection
    editEpisodeSelectEpisode.addEventListener('change', () => {
        const donghuaId = parseInt(editEpisodeSelectDonghua.value);
        const episodeNumber = parseInt(editEpisodeSelectEpisode.value);
        if (!donghuaId || !episodeNumber) {
            editEpisodeForm.classList.add('hidden');
            return;
        }
        const donghua = dbData.allDonghua.find(d => d.id === donghuaId);
        const episode = donghua.episodes.find(ep => ep.number === episodeNumber);
        if (!episode) return;
        
        editEpisodeForm.donghuaId.value = donghuaId;
        editEpisodeForm.originalNumber.value = episode.number;
        editEpisodeForm.number.value = episode.number;
        editEpisodeForm.title.value = episode.title;
        editEpisodeForm.url.value = episode.url;
        editEpisodeForm.classList.remove('hidden');
    });

    // EDIT EPISODE - Submission
    editEpisodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const donghuaId = parseInt(e.target.donghuaId.value);
        const originalNumber = parseInt(e.target.originalNumber.value);
        
        const donghuaIndex = dbData.allDonghua.findIndex(d => d.id === donghuaId);
        if (donghuaIndex === -1) return alert('Anime not found.');
        
        const donghua = dbData.allDonghua[donghuaIndex];
        const episodeIndex = donghua.episodes.findIndex(ep => ep.number === originalNumber);
        if(episodeIndex === -1) return alert('Episode not found.');

        const updatedEpisode = {
            number: parseInt(e.target.number.value),
            title: e.target.title.value,
            url: e.target.url.value
        };

        donghua.episodes[episodeIndex] = updatedEpisode;
        donghua.episodes.sort((a,b) => b.number - a.number); // re-sort
        donghua.updatedAt = new Date().toISOString();

        // Move donghua to top of the list
        dbData.allDonghua.splice(donghuaIndex, 1);
        dbData.allDonghua.unshift(donghua);

        alert(`Episode ${updatedEpisode.number} of ${donghua.title} updated.`);
        editEpisodeForm.reset();
        editEpisodeForm.classList.add('hidden');
        populateSelects();
        editEpisodeSelectDonghua.value = '';
        editEpisodeSelectEpisode.innerHTML = '<option value="">-- Select Episode --</option>';
    });

    // Initial Load
    loadData();
});
