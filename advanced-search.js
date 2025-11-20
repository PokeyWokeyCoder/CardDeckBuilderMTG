// State management
let includeColors = [];
let excludeColors = [];
let currentPage = 1;
let hasNextPage = false;
let nextPageUrl = null;

// DOM elements
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('resultsContainer');
const resultsCount = document.getElementById('resultsCount');
const paginationControls = document.getElementById('paginationControls');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// Event listeners
searchBtn.addEventListener('click', performSearch);
clearBtn.addEventListener('click', clearAllFilters);
prevBtn.addEventListener('click', goToPreviousPage);
nextBtn.addEventListener('click', goToNextPage);

// Color filter buttons
document.querySelectorAll('.include-color').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const color = btn.getAttribute('data-color');
        if (includeColors.includes(color)) {
            includeColors = includeColors.filter(c => c !== color);
        } else {
            includeColors.push(color);
        }
    });
});

document.querySelectorAll('.exclude-color').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const color = btn.getAttribute('data-color');
        if (excludeColors.includes(color)) {
            excludeColors = excludeColors.filter(c => c !== color);
        } else {
            excludeColors.push(color);
        }
    });
});

// Allow Enter key to trigger search
document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

function clearAllFilters() {
    // Clear text inputs
    document.getElementById('nameFilter').value = '';
    document.getElementById('oracleFilter').value = '';
    document.getElementById('keywordFilter').value = '';
    document.getElementById('typeLineFilter').value = '';
    document.getElementById('minCmc').value = '';
    document.getElementById('maxCmc').value = '';
    document.getElementById('minPower').value = '';
    document.getElementById('maxPower').value = '';
    document.getElementById('minToughness').value = '';
    document.getElementById('maxToughness').value = '';
    document.getElementById('rarityFilter').value = '';
    document.getElementById('setFilter').value = '';
    document.getElementById('formatFilter').value = '';
    document.getElementById('artistFilter').value = '';
    document.getElementById('flavorFilter').value = '';
    
    // Clear color filters
    includeColors = [];
    excludeColors = [];
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    
    // Clear results
    resultsContainer.innerHTML = `
        <div class="placeholder-message">
            <p>Use the filters on the left to search for cards.</p>
            <p>All filters are optional - you can search by any combination!</p>
        </div>
    `;
    resultsCount.textContent = '';
    paginationControls.style.display = 'none';
}

function buildSearchQuery() {
    const filters = [];
    
    // Name filter (partial match)
    const name = document.getElementById('nameFilter').value.trim();
    if (name) {
        filters.push(`name:${name}`);
    }
    
    // Oracle text filter (abilities/card text)
    const oracle = document.getElementById('oracleFilter').value.trim();
    if (oracle) {
        filters.push(`oracle:"${oracle}"`);
    }
    
    // Keyword filter (exact keywords)
    const keyword = document.getElementById('keywordFilter').value.trim();
    if (keyword) {
        filters.push(`keyword:"${keyword}"`);
    }
    
    // Type line filter
    const typeLine = document.getElementById('typeLineFilter').value.trim();
    if (typeLine) {
        filters.push(`type:${typeLine}`);
    }
    
    // CMC filter
    const minCmc = document.getElementById('minCmc').value;
    const maxCmc = document.getElementById('maxCmc').value;
    if (minCmc) filters.push(`cmc>=${minCmc}`);
    if (maxCmc) filters.push(`cmc<=${maxCmc}`);
    
    // Power filter
    const minPower = document.getElementById('minPower').value.trim();
    const maxPower = document.getElementById('maxPower').value.trim();
    if (minPower) filters.push(`pow>=${minPower}`);
    if (maxPower) filters.push(`pow<=${maxPower}`);
    
    // Toughness filter
    const minToughness = document.getElementById('minToughness').value.trim();
    const maxToughness = document.getElementById('maxToughness').value.trim();
    if (minToughness) filters.push(`tou>=${minToughness}`);
    if (maxToughness) filters.push(`tou<=${maxToughness}`);
    
    // Include colors
    if (includeColors.length > 0) {
        const colorQuery = includeColors.map(c => `c:${c}`).join(' OR ');
        filters.push(`(${colorQuery})`);
    }
    
    // Exclude colors
    if (excludeColors.length > 0) {
        excludeColors.forEach(c => {
            filters.push(`-c:${c}`);
        });
    }
    
    // Rarity filter
    const rarity = document.getElementById('rarityFilter').value;
    if (rarity) filters.push(`rarity:${rarity}`);
    
    // Set filter
    const set = document.getElementById('setFilter').value.trim();
    if (set) filters.push(`set:${set}`);
    
    // Format legal filter
    const format = document.getElementById('formatFilter').value;
    if (format) filters.push(`legal:${format}`);
    
    // Artist filter
    const artist = document.getElementById('artistFilter').value.trim();
    if (artist) filters.push(`artist:"${artist}"`);
    
    // Flavor text filter
    const flavor = document.getElementById('flavorFilter').value.trim();
    if (flavor) filters.push(`flavor:"${flavor}"`);
    
    // If no filters, search for all cards
    if (filters.length === 0) {
        return '*'; // Scryfall wildcard for all cards
    }
    
    return filters.join(' ');
}

async function performSearch(pageUrl = null) {
    const query = buildSearchQuery();
    
    resultsContainer.innerHTML = '<div class="loading-message">🔍 Searching...</div>';
    resultsCount.textContent = '';
    paginationControls.style.display = 'none';
    
    try {
        let url;
        if (pageUrl) {
            // Use the provided pagination URL
            url = pageUrl;
        } else {
            // Build new search URL
            url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name`;
            currentPage = 1;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('No cards found matching your search criteria.');
            }
            throw new Error('Search failed. Please try again.');
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            resultsContainer.innerHTML = '<div class="error-message">No cards found matching your search criteria.</div>';
            return;
        }
        
        displayResults(data);
        updatePagination(data);
        
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

function displayResults(data) {
    const cards = data.data;
    
    resultsCount.textContent = `Found ${data.total_cards} card${data.total_cards !== 1 ? 's' : ''} • Showing ${cards.length} per page`;
    
    resultsContainer.innerHTML = cards.map(card => {
        // Get the best image
        const imageUrl = card.image_uris?.normal || card.image_uris?.small || 
                        (card.card_faces && card.card_faces[0].image_uris?.normal) || '';
        
        // Get card text (handle double-faced cards)
        const oracleText = card.oracle_text || 
                          (card.card_faces ? card.card_faces.map(face => face.oracle_text).join(' // ') : '');
        
        // Get mana cost
        const manaCost = card.mana_cost || 
                        (card.card_faces ? card.card_faces.map(face => face.mana_cost).join(' // ') : '');
        
        // Get power/toughness
        const pt = card.power && card.toughness ? `${card.power}/${card.toughness}` : '';
        
        // Get price
        const price = card.prices?.usd || card.prices?.usd_foil || 'N/A';
        const priceDisplay = price !== 'N/A' ? `$${price}` : price;
        
        return `
            <div class="card-result" onclick="viewCardDetails('${card.id}')">
                <div class="card-result-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${card.name}" loading="lazy">` : '<div style="color: #666;">No image</div>'}
                </div>
                <div class="card-result-name">${card.name}</div>
                <div class="card-result-type">${card.type_line}</div>
                ${manaCost ? `<div class="card-result-mana">${formatManaCost(manaCost)}</div>` : ''}
                ${oracleText ? `<div class="card-result-text">${oracleText}</div>` : ''}
                <div class="card-result-stats">
                    ${pt ? `<span class="card-result-pt">${pt}</span>` : '<span></span>'}
                    <span class="card-result-rarity rarity-${card.rarity}">${card.rarity}</span>
                </div>
                <div class="card-result-stats">
                    <span style="color: #9b8365; font-size: 0.85em;">${card.set_name}</span>
                    <span class="card-result-price">${priceDisplay}</span>
                </div>
            </div>
        `;
    }).join('');
}

function formatManaCost(manaCost) {
    // Simple mana cost formatting (replace symbols with emojis or text)
    return manaCost
        .replace(/{W}/g, '⚪')
        .replace(/{U}/g, '🔵')
        .replace(/{B}/g, '⚫')
        .replace(/{R}/g, '🔴')
        .replace(/{G}/g, '🟢')
        .replace(/{C}/g, '◇')
        .replace(/{([0-9]+)}/g, '$1')
        .replace(/{X}/g, 'X')
        .replace(/{T}/g, '⤵')
        .replace(/[{}]/g, '');
}

function updatePagination(data) {
    hasNextPage = data.has_more;
    nextPageUrl = data.next_page;
    
    if (data.total_cards > data.data.length || currentPage > 1) {
        paginationControls.style.display = 'flex';
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = !hasNextPage;
        
        const startCard = ((currentPage - 1) * data.data.length) + 1;
        const endCard = startCard + data.data.length - 1;
        pageInfo.textContent = `Page ${currentPage} • Cards ${startCard}-${endCard} of ${data.total_cards}`;
    } else {
        paginationControls.style.display = 'none';
    }
}

function goToNextPage() {
    if (hasNextPage && nextPageUrl) {
        currentPage++;
        performSearch(nextPageUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        // Rebuild the search with the new page number
        const query = buildSearchQuery();
        const page = currentPage;
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name&page=${page}`;
        performSearch(url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function viewCardDetails(cardId) {
    // Store card ID and return to main page to view it
    localStorage.setItem('viewCardId', cardId);
    window.location.href = 'index.html';
}
