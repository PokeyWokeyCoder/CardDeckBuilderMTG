// State management
let includeColors = [];
let excludeColors = [];
let currentPage = 1;
let hasNextPage = false;
let nextPageUrl = null;
let deck = JSON.parse(localStorage.getItem('mtgDeck')) || [];
let currentFormat = localStorage.getItem('mtgCurrentFormat') || 'commander';
let currentResults = []; // Store current search results for sorting

// Format rules (same as main page)
const formatRules = {
    commander: { deckSize: 100, maxCopies: 1, allowBasicLands: true },
    standard: { deckSize: 60, maxCopies: 4, allowBasicLands: true },
    modern: { deckSize: 60, maxCopies: 4, allowBasicLands: true },
    vintage: { deckSize: 60, maxCopies: 4, allowBasicLands: true },
    legacy: { deckSize: 60, maxCopies: 4, allowBasicLands: true },
    pioneer: { deckSize: 60, maxCopies: 4, allowBasicLands: true },
    pauper: { deckSize: 60, maxCopies: 4, allowBasicLands: true }
};

// DOM elements
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('resultsContainer');
const resultsCount = document.getElementById('resultsCount');
const paginationControls = document.getElementById('paginationControls');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const searchSortSelect = document.getElementById('searchSortSelect');
const sortControls = document.querySelector('.sort-controls');

// Event listeners
searchBtn.addEventListener('click', performSearch);
clearBtn.addEventListener('click', clearAllFilters);
prevBtn.addEventListener('click', goToPreviousPage);
nextBtn.addEventListener('click', goToNextPage);
searchSortSelect.addEventListener('change', applySortToResults);

// Update deck count on load
updateDeckCount();

// Perform initial search on page load
document.addEventListener('DOMContentLoaded', () => {
    performSearch();
});

function updateDeckCount() {
    const totalCards = deck.reduce((sum, card) => sum + card.quantity, 0);
    const deckCardCount = document.getElementById('deckCardCount');
    if (deckCardCount) {
        deckCardCount.textContent = `${totalCards} card${totalCards !== 1 ? 's' : ''} in deck`;
    }
}

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
                resultsContainer.innerHTML = '<div class="error-message">No cards found matching your search criteria.</div>';
                return;
            }
            // Get error details from Scryfall
            const errorData = await response.json().catch(() => ({ details: 'Unknown error' }));
            throw new Error(errorData.details || 'Search failed. Please try again.');
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            resultsContainer.innerHTML = '<div class="error-message">No cards found matching your search criteria.</div>';
            return;
        }
        
        displayResults(data);
        updatePagination(data);
        
        // Store last successful query for re-rendering after adding cards
        lastSuccessfulQuery = pageUrl || url;
        
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div class="error-message">
                ${error.message}
                <br><br>
                <small>Try adjusting your search filters or using different criteria.</small>
            </div>
        `;
        // Reset pagination
        paginationControls.style.display = 'none';
        // Clear last successful query on error
        lastSuccessfulQuery = null;
    }
}

function displayResults(data) {
    // Store results for sorting
    currentResults = data.data;
    
    // Show sort controls
    if (sortControls) {
        sortControls.style.display = 'flex';
    }
    
    // Apply current sort
    applySortToResults();
}

function applySortToResults() {
    if (!currentResults || currentResults.length === 0) return;
    
    const sortBy = searchSortSelect?.value || 'name';
    
    // Sort the results
    const sortedResults = [...currentResults].sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'cmc':
                return (a.cmc || 0) - (b.cmc || 0);
            case 'type':
                return (a.type_line || '').localeCompare(b.type_line || '');
            case 'rarity':
                const rarityOrder = { common: 1, uncommon: 2, rare: 3, mythic: 4 };
                return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
            case 'price':
                const priceA = parseFloat(a.prices?.usd || a.prices?.usd_foil || 999999);
                const priceB = parseFloat(b.prices?.usd || b.prices?.usd_foil || 999999);
                return priceB - priceA; // Descending
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    // Update results count
    resultsCount.textContent = `Found ${sortedResults.length} card${sortedResults.length !== 1 ? 's' : ''}`;
    
    // Render sorted results
    resultsContainer.innerHTML = sortedResults.map(card => {
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
        
        // Check if card is in deck
        const inDeck = deck.find(c => c.name === card.name);
        const quantity = inDeck ? inDeck.quantity : 0;
        
        // Serialize card data for adding to deck
        const cardData = JSON.stringify({
            id: card.id,
            name: card.name,
            type_line: card.type_line,
            mana_cost: manaCost,
            oracle_text: oracleText,
            power: card.power,
            toughness: card.toughness,
            image_url: imageUrl,
            price: price !== 'N/A' ? parseFloat(price) : 0,
            rarity: card.rarity,
            set_name: card.set_name,
            legalities: card.legalities
        }).replace(/"/g, '&quot;');
        
        return `
            <div class="card-result">
                <div class="card-result-image" onclick="viewCardDetails('${card.id}')">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${card.name}" loading="lazy">` : '<div style="color: #666;">No image</div>'}
                </div>
                <div onclick="viewCardDetails('${card.id}')">
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
                <div class="card-result-actions">
                    ${quantity > 0 ? `<span class="in-deck-badge">${quantity}x in deck</span>` : ''}
                    <button class="add-to-deck-btn" onclick='addCardToDeck(${cardData})' ${quantity >= formatRules[currentFormat].maxCopies && !isBasicLand(card.type_line) ? 'disabled' : ''}>
                        + Add to Deck
                    </button>
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

// Check if card is a basic land
function isBasicLand(typeLine) {
    const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];
    return basicLands.some(land => typeLine.includes(land)) && typeLine.includes('Basic');
}

// Add card to deck
function addCardToDeck(cardData) {
    const card = {
        id: cardData.id,
        name: cardData.name,
        typeLine: cardData.type_line,
        manaCost: cardData.mana_cost,
        oracleText: cardData.oracle_text,
        power: cardData.power,
        toughness: cardData.toughness,
        imageUrl: cardData.image_url,
        price: cardData.price,
        rarity: cardData.rarity,
        isLand: cardData.type_line.toLowerCase().includes('land'),
        legality: cardData.legalities ? cardData.legalities[currentFormat] : 'not_legal'
    };
    
    // Check if card already exists in deck
    const existingCard = deck.find(c => c.name === card.name);
    
    if (existingCard) {
        // Check if we can add more copies
        const maxCopies = formatRules[currentFormat].maxCopies;
        const allowBasicLands = formatRules[currentFormat].allowBasicLands;
        const isBasic = isBasicLand(card.typeLine);
        
        if (!isBasic && existingCard.quantity >= maxCopies) {
            alert(`Cannot add more than ${maxCopies} copies of ${card.name} in ${currentFormat} format.`);
            return;
        }
        
        existingCard.quantity++;
    } else {
        // Add new card to deck
        deck.push({
            ...card,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('mtgDeck', JSON.stringify(deck));
    
    // Update deck count
    updateDeckCount();
    
    // Re-render results to update buttons only if we have a successful query
    if (lastSuccessfulQuery) {
        performSearch(lastSuccessfulQuery);
    }
    
    // Show success message
    showNotification(`Added ${card.name} to deck!`);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4a3626 0%, #6b4e3d 100%);
        color: #ffd700;
        padding: 15px 25px;
        border-radius: 8px;
        border: 2px solid #8b6f47;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        z-index: 10000;
        font-family: 'Garamond', serif;
        font-size: 16px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Store last successful search for re-rendering
let lastSuccessfulQuery = null;

// Make functions globally available
window.addCardToDeck = addCardToDeck;
window.viewCardDetails = viewCardDetails;
