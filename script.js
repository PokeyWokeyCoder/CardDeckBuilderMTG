// Deck storage
let deck = [];
let currentCard = null;
let currentUser = null;
let currentDeckId = null;
let currentFormat = 'commander';
let includeColors = [];
let excludeColors = [];

// Format rules
const formatRules = {
    commander: {
        name: 'Commander (EDH)',
        deckSize: 100,
        maxCopies: 1,
        allowBasicLands: true,
        description: '100 cards singleton format. 1 Commander + 99 cards. Unlimited basic lands.'
    },
    standard: {
        name: 'Standard',
        deckSize: 60,
        maxCopies: 4,
        allowBasicLands: true,
        description: '60 card minimum. Max 4 copies per card (except basic lands).'
    },
    modern: {
        name: 'Modern',
        deckSize: 60,
        maxCopies: 4,
        allowBasicLands: true,
        description: '60 card minimum. Max 4 copies per card (except basic lands).'
    },
    vintage: {
        name: 'Vintage',
        deckSize: 60,
        maxCopies: 4,
        allowBasicLands: true,
        description: '60 card minimum. Max 4 copies per card (except basic lands). Some cards restricted to 1.'
    },
    legacy: {
        name: 'Legacy',
        deckSize: 60,
        maxCopies: 4,
        allowBasicLands: true,
        description: '60 card minimum. Max 4 copies per card (except basic lands).'
    },
    pioneer: {
        name: 'Pioneer',
        deckSize: 60,
        maxCopies: 4,
        allowBasicLands: true,
        description: '60 card minimum. Max 4 copies per card (except basic lands).'
    },
    pauper: {
        name: 'Pauper',
        deckSize: 60,
        maxCopies: 4,
        allowBasicLands: true,
        description: '60 card minimum. Max 4 copies per card (except basic lands). Commons only.'
    }
};

// DOM Elements
const cardSearch = document.getElementById('cardSearch');
const searchBtn = document.getElementById('searchBtn');
const setFilter = document.getElementById('setFilter');
const formatSelect = document.getElementById('formatSelect');
const formatInfo = document.getElementById('formatInfo');
const toggleFiltersBtn = document.getElementById('toggleFilters');
const filtersPanel = document.getElementById('filtersPanel');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const searchResults = document.getElementById('searchResults');
const cardPreview = document.getElementById('cardPreview');
const deckList = document.getElementById('deckList');
const totalCards = document.getElementById('totalCards');
const totalLands = document.getElementById('totalLands');
const totalNonLands = document.getElementById('totalNonLands');
const totalPrice = document.getElementById('totalPrice');
const clearDeck = document.getElementById('clearDeck');
const exportDeck = document.getElementById('exportDeck');
const deckImport = document.getElementById('deckImport');
const importBtn = document.getElementById('importBtn');
const logoutBtn = document.getElementById('logoutBtn');
const saveDeckBtn = document.getElementById('saveDeckBtn');
const deckNameInput = document.getElementById('deckName');
const userInfo = document.getElementById('userInfo');
const loginPrompt = document.getElementById('loginPrompt');
const userName = document.getElementById('userName');
const myDecksSection = document.getElementById('myDecksSection');
const myDecksList = document.getElementById('myDecksList');

// Event Listeners
searchBtn.addEventListener('click', searchCard);
cardSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCard();
});
formatSelect.addEventListener('change', updateFormat);
toggleFiltersBtn.addEventListener('click', toggleFilters);
applyFiltersBtn.addEventListener('click', searchCard);
clearFiltersBtn.addEventListener('click', clearAdvancedFilters);
clearDeck.addEventListener('click', clearDeckList);
exportDeck.addEventListener('click', exportDeckToFile);
importBtn.addEventListener('click', importDeckFromFile);
logoutBtn.addEventListener('click', logout);
saveDeckBtn.addEventListener('click', saveDeckToCloud);

// Deck sort dropdown
const deckSortSelect = document.getElementById('deckSortSelect');
if (deckSortSelect) {
    deckSortSelect.addEventListener('change', updateDeckDisplay);
}

// Initialize color filter buttons for include colors
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

// Initialize color filter buttons for exclude colors
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

// Check if user is logged in
checkLoginStatus();

// Initialize format
updateFormat();

// Load deck from localStorage on startup
loadDeck();

// Check if we need to load a card from advanced search
const viewCardId = localStorage.getItem('viewCardId');
if (viewCardId) {
    localStorage.removeItem('viewCardId');
    loadCardById(viewCardId);
}

// Make loginAsUser available globally for onclick handlers
window.loginAsUser = loginAsUser;
window.loadDeckFromCloud = loadDeckFromCloud;
window.deleteDeckFromCloud = deleteDeckFromCloud;

// ============================================
// FORMAT AND FILTER FUNCTIONS
// ============================================

// Update format and display rules
function updateFormat() {
    currentFormat = formatSelect.value;
    const rules = formatRules[currentFormat];
    
    formatInfo.innerHTML = `
        <strong>${rules.name}</strong><br>
        ${rules.description}<br>
        <span style="color: #4a7c59;">Deck Size: ${rules.deckSize} cards | Max Copies: ${rules.maxCopies === 1 ? '1 (Singleton)' : rules.maxCopies}</span>
    `;
}

// Toggle advanced filters panel
function toggleFilters() {
    if (filtersPanel.style.display === 'none') {
        filtersPanel.style.display = 'block';
        toggleFiltersBtn.textContent = '⚙️ Hide Filters';
    } else {
        filtersPanel.style.display = 'none';
        toggleFiltersBtn.textContent = '⚙️ Advanced Filters';
    }
}

// Clear advanced filters
function clearAdvancedFilters() {
    document.getElementById('minCmc').value = '';
    document.getElementById('maxCmc').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('rarityFilter').value = '';
    document.getElementById('powerFilter').value = '';
    document.getElementById('toughnessFilter').value = '';
    document.getElementById('cardTextFilter').value = '';
    includeColors = [];
    excludeColors = [];
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
}

// Build search query with filters
function buildSearchQuery() {
    let query = cardSearch.value.trim();
    if (!query) return null;
    
    const filters = [];
    
    // Set filter
    const setCode = setFilter.value.trim();
    if (setCode) {
        filters.push(`set:${setCode}`);
    }
    
    // Format legality
    filters.push(`legal:${currentFormat}`);
    
    // CMC filter
    const minCmc = document.getElementById('minCmc').value;
    const maxCmc = document.getElementById('maxCmc').value;
    if (minCmc) filters.push(`cmc>=${minCmc}`);
    if (maxCmc) filters.push(`cmc<=${maxCmc}`);
    
    // Include colors filter
    if (includeColors.length > 0) {
        const colorQuery = includeColors.map(c => `c:${c}`).join(' OR ');
        filters.push(`(${colorQuery})`);
    }
    
    // Exclude colors filter
    if (excludeColors.length > 0) {
        excludeColors.forEach(c => {
            filters.push(`-c:${c}`);
        });
    }
    
    // Card text/abilities filter
    const cardText = document.getElementById('cardTextFilter').value.trim();
    if (cardText) {
        filters.push(`o:"${cardText}"`);
    }
    
    // Type filter
    const type = document.getElementById('typeFilter').value;
    if (type) filters.push(`t:${type}`);
    
    // Rarity filter
    const rarity = document.getElementById('rarityFilter').value;
    if (rarity) filters.push(`r:${rarity}`);
    
    // Power/Toughness filter
    const power = document.getElementById('powerFilter').value;
    const toughness = document.getElementById('toughnessFilter').value;
    if (power) filters.push(`pow=${power}`);
    if (toughness) filters.push(`tou=${toughness}`);
    
    // Combine query with filters
    if (filters.length > 0) {
        query = `${query} ${filters.join(' ')}`;
    }
    
    return query;
}

// Search for cards using Scryfall API
async function searchCard() {
    const query = buildSearchQuery();
    if (!query) return;

    searchResults.innerHTML = '<p class="loading">Searching...</p>';

    try {
        const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.object === 'error') {
            searchResults.innerHTML = '<p class="error">No cards found. Try different filters or search terms.</p>';
            return;
        }

        displaySearchResults(data.data);
    } catch (error) {
        searchResults.innerHTML = '<p class="error">Error searching cards. Please try again.</p>';
        console.error('Search error:', error);
    }
}

// Display search results
function displaySearchResults(cards) {
    if (cards.length === 0) {
        searchResults.innerHTML = '<p class="placeholder">No cards found.</p>';
        return;
    }

    searchResults.innerHTML = cards.slice(0, 20).map(card => {
        const legality = card.legalities[currentFormat];
        const legalityBadge = legality === 'legal' ? 
            '<span style="color: #4a7c59;">✓ Legal</span>' : 
            legality === 'banned' ?
            '<span style="color: #d97c6a;">✗ Banned</span>' :
            legality === 'restricted' ?
            '<span style="color: #ff9f43;">⚠ Restricted</span>' :
            '<span style="color: #9b8365;">Not Legal</span>';
        
        return `
            <div class="search-result-item" onclick="selectCard('${card.id}')">
                <div>
                    <span>${card.name}</span>
                    <div style="font-size: 12px; color: #9b8365;">${card.set_name} (${card.set.toUpperCase()}) ${legalityBadge}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Select a card to display details
async function selectCard(cardId) {
    try {
        const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
        const card = await response.json();
        currentCard = card;
        
        // Fetch all printings for this card
        await fetchCardPrintings(card);
        
        displayCardDetails(card);
    } catch (error) {
        console.error('Error fetching card details:', error);
        cardPreview.innerHTML = '<p class="error">Error loading card details.</p>';
    }
}

// Fetch all printings/versions of a card
async function fetchCardPrintings(card) {
    try {
        // Get the prints_search_uri from the card
        const printsUri = card.prints_search_uri;
        if (!printsUri) return;
        
        const response = await fetch(printsUri);
        const data = await response.json();
        
        // Store all printings globally so we can switch between them
        window.cardPrintings = data.data || [];
        
        console.log(`Found ${window.cardPrintings.length} printings for ${card.name}`);
    } catch (error) {
        console.error('Error fetching card printings:', error);
        window.cardPrintings = [];
    }
}

// Load card by ID (for advanced search integration)
async function loadCardById(cardId) {
    try {
        const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
        const card = await response.json();
        currentCard = card;
        displayCardDetails(card);
    } catch (error) {
        console.error('Error loading card:', error);
    }
}

// Display card details
function displayCardDetails(card) {
    const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
    const manaCost = card.mana_cost || (card.card_faces ? card.card_faces[0].mana_cost : 'N/A');
    const oracleText = card.oracle_text || (card.card_faces ? 
        card.card_faces.map(face => `${face.name}: ${face.oracle_text}`).join('\n\n') : 'N/A');
    const typeLine = card.type_line || 'N/A';
    
    // Get TCGPlayer price
    const price = card.prices?.usd || card.prices?.usd_foil || '0.00';
    const priceDisplay = price !== null ? `$${price}` : 'Price not available';
    
    // Build version selector if we have multiple printings
    let versionSelector = '';
    if (window.cardPrintings && window.cardPrintings.length > 1) {
        versionSelector = `
            <div class="version-selector">
                <label for="versionSelect"><strong>Select Version/Printing:</strong></label>
                <select id="versionSelect" onchange="switchCardVersion(this.value)">
                    ${window.cardPrintings.map(printing => {
                        const printPrice = printing.prices?.usd || printing.prices?.usd_foil || 'N/A';
                        const priceText = printPrice !== 'N/A' ? ` - $${printPrice}` : ' - Price N/A';
                        const selected = printing.id === card.id ? ' selected' : '';
                        return `<option value="${printing.id}"${selected}>${printing.set_name} (${printing.set.toUpperCase()})${priceText}</option>`;
                    }).join('')}
                </select>
                <div class="version-count">${window.cardPrintings.length} versions available</div>
            </div>
        `;
    }

    cardPreview.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${card.name}">` : ''}
        <div class="card-info">
            <h3>${card.name}</h3>
            <div class="mana-cost">Mana Cost: ${manaCost}</div>
            <p><strong>Type:</strong> ${typeLine}</p>
            <p><strong>Set:</strong> ${card.set_name} (${card.set.toUpperCase()})</p>
            ${versionSelector}
            <div class="card-text">
                <strong>Card Text:</strong><br>
                ${oracleText.replace(/\n/g, '<br>')}
            </div>
            ${card.power && card.toughness ? `<p><strong>Power/Toughness:</strong> ${card.power}/${card.toughness}</p>` : ''}
            <div class="price-info">
                TCGPlayer Price: ${priceDisplay}
            </div>
            <div class="add-card-section">
                <label>Quantity:</label>
                <input type="number" id="quantityInput" min="1" max="4" value="1">
                <button onclick="addCardToDeck()">Add to Deck</button>
            </div>
        </div>
    `;
}

// Switch to a different version/printing of the card
async function switchCardVersion(printingId) {
    try {
        const response = await fetch(`https://api.scryfall.com/cards/${printingId}`);
        const card = await response.json();
        currentCard = card;
        displayCardDetails(card);
    } catch (error) {
        console.error('Error switching card version:', error);
    }
}

// Add card to deck
function addCardToDeck() {
    if (!currentCard) return;

    const quantityInput = document.getElementById('quantityInput');
    const quantity = parseInt(quantityInput.value) || 1;
    
    const rules = formatRules[currentFormat];
    const maxCopies = isBasicLand(currentCard) && rules.allowBasicLands ? 999 : rules.maxCopies;

    // Validate quantity
    if (quantity < 1 || quantity > maxCopies) {
        alert(`Quantity must be between 1 and ${maxCopies}`);
        return;
    }
    
    // Check format legality
    const legality = currentCard.legalities[currentFormat];
    if (legality === 'banned') {
        alert(`${currentCard.name} is BANNED in ${formatRules[currentFormat].name}!`);
        return;
    }
    
    if (legality === 'not_legal') {
        if (!confirm(`${currentCard.name} is NOT LEGAL in ${formatRules[currentFormat].name}. Add anyway?`)) {
            return;
        }
    }

    // Check if card already exists in deck
    const existingCard = deck.find(c => c.id === currentCard.id);
    
    if (existingCard) {
        const newQuantity = existingCard.quantity + quantity;
        if (newQuantity > maxCopies) {
            alert(`Cannot add more. Maximum ${maxCopies} copies per card. Currently have ${existingCard.quantity}.`);
            return;
        }
        existingCard.quantity = newQuantity;
    } else {
        const price = parseFloat(currentCard.prices?.usd || currentCard.prices?.usd_foil || 0);
        deck.push({
            id: currentCard.id,
            name: currentCard.name,
            quantity: quantity,
            price: price,
            imageUrl: currentCard.image_uris?.small || currentCard.card_faces?.[0]?.image_uris?.small || '',
            setCode: currentCard.set.toUpperCase(),
            setName: currentCard.set_name,
            collectorNumber: currentCard.collector_number,
            legality: legality,
            typeLine: currentCard.type_line,
            isLand: currentCard.type_line.toLowerCase().includes('land')
        });
    }

    saveDeck();
    updateDeckDisplay();
    quantityInput.value = 1;
}

// Check if card is a basic land
function isBasicLand(card) {
    const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];
    return basicLands.includes(card.name) && card.type_line.includes('Basic');
}

// Update deck display
function updateDeckDisplay() {
    if (deck.length === 0) {
        deckList.innerHTML = '<p class="placeholder">Your deck is empty. Add cards to get started!</p>';
        totalCards.textContent = '0';
        totalPrice.textContent = '0.00';
        return;
    }

    // Get selected sort option
    const sortBy = document.getElementById('deckSortSelect')?.value || 'default';
    
    console.log('Sorting by:', sortBy);
    
    // Sort deck based on selected option (only if not default)
    if (sortBy !== 'default') {
        deck.sort((a, b) => {
            switch(sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'cmc-asc':
                    return (a.cmc || 0) - (b.cmc || 0);
                case 'cmc-desc':
                    return (b.cmc || 0) - (a.cmc || 0);
                case 'type-asc':
                    return (a.type_line || '').localeCompare(b.type_line || '');
                case 'type-desc':
                    return (b.type_line || '').localeCompare(a.type_line || '');
                case 'quantity-asc':
                    return a.quantity - b.quantity;
                case 'quantity-desc':
                    return b.quantity - a.quantity;
                case 'price-asc':
                    // Push N/A prices to the end when sorting ascending
                    if (!a.price || a.price === 0) return 1;
                    if (!b.price || b.price === 0) return -1;
                    return a.price - b.price;
                case 'price-desc':
                    // Push N/A prices to the end when sorting descending
                    const priceA = a.price || 0;
                    const priceB = b.price || 0;
                    console.log('Comparing prices:', a.name, priceA, 'vs', b.name, priceB);
                    if (priceA === 0) return 1;
                    if (priceB === 0) return -1;
                    return priceB - priceA;
                default:
                    return 0; // Keep original order
            }
        });
    }

    deckList.innerHTML = deck.map(card => {
        const legalityWarning = card.legality === 'banned' ? 
            ' <span style="color: #d97c6a; font-size: 12px;">⚠ BANNED</span>' :
            card.legality === 'restricted' ?
            ' <span style="color: #ff9f43; font-size: 12px;">⚠ RESTRICTED</span>' : '';
        
        return `
            <div class="deck-item">
                <div class="deck-item-info" onclick="viewDeckCard('${card.id}')">
                    <div class="deck-item-name">${card.name} ${card.setCode ? `(${card.setCode})` : ''}${legalityWarning}</div>
                    <div class="deck-item-price">$${card.price.toFixed(2)} each | $${(card.price * card.quantity).toFixed(2)} total</div>
                </div>
                <div class="deck-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="event.stopPropagation(); decreaseQuantity('${card.id}')">-</button>
                        <span class="quantity-display">${card.quantity}</span>
                        <button class="quantity-btn" onclick="event.stopPropagation(); increaseQuantity('${card.id}')">+</button>
                    </div>
                    <button class="remove-btn" onclick="event.stopPropagation(); removeCard('${card.id}')">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    updateDeckStats();
}

// Increase card quantity
function increaseQuantity(cardId) {
    const card = deck.find(c => c.id === cardId);
    if (!card) return;
    
    // Get max copies based on format rules
    const rules = formatRules[currentFormat];
    const maxCopies = card.name.match(/^(Plains|Island|Swamp|Mountain|Forest|Wastes)$/) && rules.allowBasicLands ? 999 : rules.maxCopies;
    
    if (card.quantity < maxCopies) {
        card.quantity++;
        saveDeck();
        updateDeckDisplay();
    } else {
        alert(`Maximum ${maxCopies} copies per card in ${rules.name}!`);
    }
}

// Decrease card quantity
function decreaseQuantity(cardId) {
    const card = deck.find(c => c.id === cardId);
    if (card) {
        if (card.quantity > 1) {
            card.quantity--;
            saveDeck();
            updateDeckDisplay();
        } else {
            removeCard(cardId);
        }
    }
}

// Remove card from deck
function removeCard(cardId) {
    deck = deck.filter(c => c.id !== cardId);
    saveDeck();
    updateDeckDisplay();
}

// View a card from the deck
async function viewDeckCard(cardId) {
    try {
        const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
        const card = await response.json();
        currentCard = card;
        displayCardDetails(card);
        
        // Scroll to card preview on mobile
        cardPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error fetching card details:', error);
        alert('Error loading card details. Please try again.');
    }
}

// Update deck statistics
function updateDeckStats() {
    const total = deck.reduce((sum, card) => sum + card.quantity, 0);
    const price = deck.reduce((sum, card) => sum + (card.price * card.quantity), 0);
    const lands = deck.reduce((sum, card) => {
        // Check if card is marked as land or has 'land' in type line
        const isLand = card.isLand || (card.typeLine && card.typeLine.toLowerCase().includes('land'));
        return sum + (isLand ? card.quantity : 0);
    }, 0);
    const nonLands = total - lands;
    
    totalCards.textContent = total;
    totalLands.textContent = lands;
    totalNonLands.textContent = nonLands;
    totalPrice.textContent = price.toFixed(2);
}

// Clear entire deck
function clearDeckList() {
    if (deck.length === 0) return;
    
    if (confirm('Are you sure you want to clear your entire deck?')) {
        deck = [];
        saveDeck();
        updateDeckDisplay();
    }
}

// Save deck to localStorage
function saveDeck() {
    localStorage.setItem('mtgDeck', JSON.stringify(deck));
}

// Load deck from localStorage
function loadDeck() {
    const savedDeck = localStorage.getItem('mtgDeck');
    if (savedDeck) {
        deck = JSON.parse(savedDeck);
        updateDeckDisplay();
    }
}

// Export deck to text file
function exportDeckToFile() {
    if (deck.length === 0) {
        alert('Your deck is empty. Add cards before exporting.');
        return;
    }

    // Create deck list in standard format (quantity cardname)
    let deckText = 'MTG Deck List\n';
    deckText += '='.repeat(50) + '\n\n';
    
    // Add deck statistics
    const totalCardCount = deck.reduce((sum, card) => sum + card.quantity, 0);
    const totalDeckPrice = deck.reduce((sum, card) => sum + (card.price * card.quantity), 0);
    
    deckText += `Total Cards: ${totalCardCount}\n`;
    deckText += `Total Price: $${totalDeckPrice.toFixed(2)}\n\n`;
    deckText += '='.repeat(50) + '\n\n';
    
    // Add cards in standard format
    deck.forEach(card => {
        deckText += `${card.quantity} ${card.name}\n`;
    });
    
    deckText += '\n' + '='.repeat(50) + '\n\n';
    deckText += 'Detailed Price Breakdown:\n';
    deckText += '-'.repeat(50) + '\n';
    
    // Add detailed pricing
    deck.forEach(card => {
        const cardTotal = (card.price * card.quantity).toFixed(2);
        deckText += `${card.quantity}x ${card.name} - $${card.price.toFixed(2)} each = $${cardTotal}\n`;
    });
    
    deckText += '\n' + '='.repeat(50) + '\n';
    deckText += `\nExported from MTG Deck Builder on ${new Date().toLocaleDateString()}\n`;

    // Create blob and download
    const blob = new Blob([deckText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mtg-deck-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import deck from text file
async function importDeckFromFile() {
    const file = deckImport.files[0];
    
    if (!file) {
        alert('Please select a file to import.');
        return;
    }

    try {
        const text = await file.text();
        await parseDeckList(text);
    } catch (error) {
        console.error('Import error:', error);
        alert('Error importing deck. Please check the file format.');
    }
}

// Parse deck list from text
async function parseDeckList(text) {
    const lines = text.split('\n');
    const cardsToImport = [];
    
    // Parse each line looking for pattern: quantity cardname
    // Supports formats like:
    // 4 Lightning Bolt
    // 4x Lightning Bolt
    // 2 Lightning Bolt (Set) [Collector Number]
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines, comments, headers, and separator lines
        if (!trimmedLine || 
            trimmedLine.startsWith('//') || 
            trimmedLine.startsWith('#') ||
            trimmedLine.startsWith('=') ||
            trimmedLine.startsWith('-') ||
            trimmedLine.toLowerCase().includes('deck list') ||
            trimmedLine.toLowerCase().includes('commander:') ||
            trimmedLine.toLowerCase().includes('companion:') ||
            trimmedLine.toLowerCase().startsWith('total') ||
            trimmedLine.toLowerCase().startsWith('main') ||
            trimmedLine.toLowerCase().startsWith('sideboard')) {
            continue;
        }
        
        // Match patterns like "4 Card Name" or "4x Card Name"
        const match = trimmedLine.match(/^(\d+)x?\s+(.+?)(?:\s+\([^)]+\))?(?:\s+\[[^\]]+\])?$/i);
        
        if (match) {
            const quantity = parseInt(match[1]);
            let cardName = match[2].trim();
            
            // Remove any set codes or collector numbers in parentheses/brackets
            cardName = cardName.replace(/\s*\([^)]*\)\s*/g, '').replace(/\s*\[[^\]]*\]\s*/g, '').trim();
            
            if (quantity > 0 && quantity <= 4 && cardName) {
                cardsToImport.push({ name: cardName, quantity });
            }
        }
    }
    
    if (cardsToImport.length === 0) {
        alert('No valid cards found in the file. Please use format:\n4 Card Name\nor\n4x Card Name');
        return;
    }
    
    // Show loading message
    searchResults.innerHTML = '<p class="loading">Importing deck... This may take a moment.</p>';
    
    let successCount = 0;
    let failedCards = [];
    
    // Import each card
    for (const cardInfo of cardsToImport) {
        try {
            // Search for the card
            const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardInfo.name)}`);
            
            if (response.ok) {
                const card = await response.json();
                
                // Check if card already exists in deck
                const existingCard = deck.find(c => c.id === card.id);
                
                if (existingCard) {
                    const newQuantity = Math.min(existingCard.quantity + cardInfo.quantity, 4);
                    existingCard.quantity = newQuantity;
                } else {
                    const price = parseFloat(card.prices?.usd || card.prices?.usd_foil || 0);
                    deck.push({
                        id: card.id,
                        name: card.name,
                        quantity: Math.min(cardInfo.quantity, 4),
                        price: price,
                        imageUrl: card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || '',
                        setCode: card.set.toUpperCase(),
                        setName: card.set_name,
                        legality: card.legalities[currentFormat],
                        typeLine: card.type_line,
                        isLand: card.type_line.toLowerCase().includes('land')
                    });
                }
                successCount++;
            } else {
                failedCards.push(cardInfo.name);
            }
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.error(`Error importing ${cardInfo.name}:`, error);
            failedCards.push(cardInfo.name);
        }
    }
    
    saveDeck();
    updateDeckDisplay();
    searchResults.innerHTML = '';
    
    // Show results
    let message = `Successfully imported ${successCount} card(s)!`;
    if (failedCards.length > 0) {
        message += `\n\nFailed to import:\n${failedCards.join('\n')}`;
    }
    alert(message);
    
    // Clear file input
    deckImport.value = '';
}

// ============================================
// FIREBASE AUTHENTICATION & DATABASE
// ============================================

// Simple username-based login
function loginAsUser(username) {
    currentUser = {
        uid: username.toLowerCase(),
        displayName: username,
        email: `${username.toLowerCase()}@mtgdeckbuilder.local`
    };
    
    // Save to localStorage
    localStorage.setItem('mtgUser', JSON.stringify(currentUser));
    
    // Update UI
    userName.textContent = username;
    userInfo.style.display = 'flex';
    loginPrompt.style.display = 'none';
    saveDeckBtn.disabled = false;
    myDecksSection.style.display = 'block';
    
    // Load user's decks
    loadUserDecks();
}

// Check login status on page load
function checkLoginStatus() {
    const savedUser = localStorage.getItem('mtgUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userName.textContent = currentUser.displayName;
        userInfo.style.display = 'flex';
        loginPrompt.style.display = 'none';
        saveDeckBtn.disabled = false;
        myDecksSection.style.display = 'block';
        loadUserDecks();
    } else {
        // Auto-login as default user if no one is logged in
        loginAsUser('Poke');
    }
}

// Initialize Firebase Authentication
function initializeAuth() {
    const { onAuthStateChanged } = window.firebaseModules;
    
    onAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            currentUser = user;
            userName.textContent = user.displayName || user.email;
            userInfo.style.display = 'flex';
            loginPrompt.style.display = 'none';
            saveDeckBtn.disabled = false;
            loadUserDecks();
            myDecksSection.style.display = 'block';
        } else {
            currentUser = null;
            userInfo.style.display = 'none';
            loginPrompt.style.display = 'block';
            saveDeckBtn.disabled = true;
            myDecksSection.style.display = 'none';
        }
    });
}

// Login with Google
async function loginWithGoogle() {
    const { GoogleAuthProvider, signInWithPopup } = window.firebaseModules;
    const provider = new GoogleAuthProvider();
    
    try {
        await signInWithPopup(window.firebaseAuth, provider);
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to sign in. Please try again.');
    }
}

// Logout
function logout() {
    currentUser = null;
    currentDeckId = null;
    deckNameInput.value = '';
    
    // Clear localStorage
    localStorage.removeItem('mtgUser');
    
    // Update UI
    userInfo.style.display = 'none';
    loginPrompt.style.display = 'block';
    saveDeckBtn.disabled = true;
    myDecksSection.style.display = 'none';
    
    // Clear current deck
    deck = [];
    updateDeckDisplay();
}

// Save deck to Firebase
async function saveDeckToCloud() {
    if (!currentUser) {
        alert('Please sign in to save decks.');
        return;
    }
    
    if (deck.length === 0) {
        alert('Your deck is empty. Add cards before saving.');
        return;
    }
    
    const deckName = deckNameInput.value.trim() || 'Untitled Deck';
    const { doc, setDoc, serverTimestamp } = window.firebaseModules;
    
    try {
        // Generate deck ID if new deck
        if (!currentDeckId) {
            currentDeckId = `deck_${Date.now()}`;
        }
        
        const deckData = {
            name: deckName,
            cards: deck,
            owner: currentUser.displayName,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            format: currentFormat,
            totalCards: deck.reduce((sum, card) => sum + card.quantity, 0),
            totalPrice: deck.reduce((sum, card) => sum + (card.price * card.quantity), 0),
            timestamp: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdAt: currentDeckId.startsWith('deck_') ? serverTimestamp() : undefined
        };
        
        const deckRef = doc(window.firebaseDb, 'decks', currentDeckId);
        await setDoc(deckRef, deckData, { merge: true });
        
        alert('Deck saved successfully!');
        loadUserDecks();
    } catch (error) {
        console.error('Error saving deck:', error);
        alert('Failed to save deck. Please try again.');
    }
}

// Load user's saved decks
async function loadUserDecks() {
    if (!currentUser) return;
    
    const { collection, query, where, getDocs } = window.firebaseModules;
    
    try {
        const decksQuery = query(
            collection(window.firebaseDb, 'decks'),
            where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(decksQuery);
        const decks = [];
        
        querySnapshot.forEach((doc) => {
            decks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by updatedAt (most recent first)
        decks.sort((a, b) => {
            const aTime = a.updatedAt?.seconds || 0;
            const bTime = b.updatedAt?.seconds || 0;
            return bTime - aTime;
        });
        
        displayUserDecks(decks);
    } catch (error) {
        console.error('Error loading decks:', error);
        myDecksList.innerHTML = '<p class="error">Failed to load decks.</p>';
    }
}

// Display user's saved decks
function displayUserDecks(decks) {
    if (decks.length === 0) {
        myDecksList.innerHTML = '<p class="placeholder">No saved decks yet.</p>';
        return;
    }
    
    myDecksList.innerHTML = decks.map(deck => {
        const date = deck.updatedAt ? new Date(deck.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A';
        return `
            <div class="saved-deck-item">
                <div class="saved-deck-info">
                    <div class="saved-deck-name">${deck.name}</div>
                    <div class="saved-deck-meta">
                        ${deck.totalCards} cards | $${deck.totalPrice.toFixed(2)} | Updated: ${date}
                    </div>
                </div>
                <div class="saved-deck-actions">
                    <button class="load-deck-btn" onclick="loadDeckFromCloud('${deck.id}')">Load</button>
                    <button class="delete-deck-btn" onclick="deleteDeckFromCloud('${deck.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load a specific deck from Firebase
async function loadDeckFromCloud(deckId) {
    if (!currentUser) return;
    
    const { doc, getDoc } = window.firebaseModules;
    
    try {
        const deckRef = doc(window.firebaseDb, 'decks', deckId);
        const deckSnap = await getDoc(deckRef);
        
        if (deckSnap.exists()) {
            const deckData = deckSnap.data();
            deck = deckData.cards || [];
            currentDeckId = deckId;
            deckNameInput.value = deckData.name;
            updateDeckDisplay();
            alert('Deck loaded successfully!');
        } else {
            alert('Deck not found.');
        }
    } catch (error) {
        console.error('Error loading deck:', error);
        alert('Failed to load deck. Please try again.');
    }
}

// Delete a deck from Firebase
async function deleteDeckFromCloud(deckId) {
    if (!currentUser) return;
    
    if (!confirm('Are you sure you want to delete this deck?')) {
        return;
    }
    
    const { doc, deleteDoc } = window.firebaseModules;
    
    try {
        const deckRef = doc(window.firebaseDb, 'decks', deckId);
        await deleteDoc(deckRef);
        
        // Clear current deck if it's the one being deleted
        if (currentDeckId === deckId) {
            deck = [];
            currentDeckId = null;
            deckNameInput.value = '';
            updateDeckDisplay();
        }
        
        alert('Deck deleted successfully!');
        loadUserDecks();
    } catch (error) {
        console.error('Error deleting deck:', error);
        alert('Failed to delete deck. Please try again.');
    }
}

// ===== COMMUNITY DECK BROWSING =====
let currentViewedDeck = null;
let currentViewedDeckId = null;

// Event listeners for browse section
document.getElementById('refreshBrowseBtn')?.addEventListener('click', loadCommunityDecks);
document.getElementById('browseFormatFilter')?.addEventListener('change', loadCommunityDecks);
document.getElementById('browseUserFilter')?.addEventListener('input', loadCommunityDecks);
document.getElementById('communitySortSelect')?.addEventListener('change', loadCommunityDecks);

// Modal controls
const deckViewerModal = document.getElementById('deckViewerModal');
const closeModalBtn = document.querySelector('.close-modal');
closeModalBtn?.addEventListener('click', closeViewerModal);
window.addEventListener('click', (e) => {
    if (e.target === deckViewerModal) {
        closeViewerModal();
    }
});

// Comment and proposed change buttons
document.getElementById('postCommentBtn')?.addEventListener('click', postComment);
document.getElementById('proposeChangeBtn')?.addEventListener('click', proposeChange);

// Load community decks on page load
setTimeout(() => {
    if (window.firebaseDb) {
        loadCommunityDecks();
    }
}, 1000);

async function loadCommunityDecks() {
    const { collection, getDocs, query, where, orderBy } = window.firebaseModules;
    const communityDecksList = document.getElementById('communityDecksList');
    
    if (!communityDecksList) return;
    
    communityDecksList.innerHTML = '<p style="color: #9b8365;">Loading decks...</p>';
    
    try {
        const formatFilter = document.getElementById('browseFormatFilter').value;
        const userFilter = document.getElementById('browseUserFilter').value.toLowerCase();
        const sortBy = document.getElementById('communitySortSelect')?.value || 'time-desc';
        
        // Simple query without orderBy to avoid index requirement
        const querySnapshot = await getDocs(collection(window.firebaseDb, 'decks'));
        const decks = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Apply filters
            const matchesFormat = !formatFilter || data.format === formatFilter;
            const matchesUser = !userFilter || (data.owner && data.owner.toLowerCase().includes(userFilter));
            
            if (matchesFormat && matchesUser) {
                const totalCards = data.cards.reduce((sum, card) => sum + card.quantity, 0);
                decks.push({
                    id: doc.id,
                    totalCards: totalCards,
                    commentsCount: data.comments ? data.comments.length : 0,
                    ...data
                });
            }
        });
        
        // Sort based on selection
        decks.sort((a, b) => {
            switch(sortBy) {
                case 'time-desc':
                    const timeA = a.timestamp ? a.timestamp.seconds : 0;
                    const timeB = b.timestamp ? b.timestamp.seconds : 0;
                    return timeB - timeA;
                case 'time-asc':
                    const timeA2 = a.timestamp ? a.timestamp.seconds : 0;
                    const timeB2 = b.timestamp ? b.timestamp.seconds : 0;
                    return timeA2 - timeB2;
                case 'cards-desc':
                    return b.totalCards - a.totalCards;
                case 'cards-asc':
                    return a.totalCards - b.totalCards;
                case 'comments':
                    return b.commentsCount - a.commentsCount;
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                default:
                    const timeA3 = a.timestamp ? a.timestamp.seconds : 0;
                    const timeB3 = b.timestamp ? b.timestamp.seconds : 0;
                    return timeB3 - timeA3;
            }
        });
        
        if (decks.length === 0) {
            communityDecksList.innerHTML = '<p style="color: #9b8365;">No decks found matching your filters.</p>';
            return;
        }
        
        communityDecksList.innerHTML = decks.map(deck => {
            const totalPrice = deck.cards.reduce((sum, card) => sum + (card.price * card.quantity), 0);
            const date = deck.timestamp ? new Date(deck.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown';
            
            return `
                <div class="community-deck-card" onclick="viewDeck('${deck.id}')">
                    <h4>${deck.name || 'Untitled Deck'}</h4>
                    <div class="deck-meta">
                        <span>👤 ${deck.owner}</span> • 
                        <span>📅 ${date}</span>
                    </div>
                    <div class="deck-summary">
                        <span>🎴 ${deck.totalCards} cards</span> • 
                        <span>🎯 ${deck.format || 'Unknown'}</span> • 
                        <span>💰 $${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading community decks:', error);
        communityDecksList.innerHTML = '<p style="color: #d97c6a;">Error loading decks. Please try again.</p>';
    }
}

async function viewDeck(deckId) {
    const { doc, getDoc } = window.firebaseModules;
    
    try {
        const deckRef = doc(window.firebaseDb, 'decks', deckId);
        const deckSnap = await getDoc(deckRef);
        
        if (!deckSnap.exists()) {
            alert('Deck not found!');
            return;
        }
        
        currentViewedDeck = deckSnap.data();
        currentViewedDeckId = deckId;
        
        // Populate modal
        document.getElementById('viewedDeckName').textContent = currentViewedDeck.name || 'Untitled Deck';
        document.getElementById('viewedDeckOwner').textContent = `👤 ${currentViewedDeck.owner}`;
        document.getElementById('viewedDeckFormat').textContent = `🎯 ${currentViewedDeck.format || 'Unknown'}`;
        
        const totalCards = currentViewedDeck.cards.reduce((sum, card) => sum + card.quantity, 0);
        const totalPrice = currentViewedDeck.cards.reduce((sum, card) => sum + (card.price * card.quantity), 0);
        const lands = currentViewedDeck.cards.filter(card => card.isLand).reduce((sum, card) => sum + card.quantity, 0);
        document.getElementById('viewedDeckStats').textContent = `🎴 ${totalCards} cards • 🏔️ ${lands} lands • 💰 $${totalPrice.toFixed(2)}`;
        
        // Display deck list
        const viewedDeckList = document.getElementById('viewedDeckList');
        viewedDeckList.innerHTML = currentViewedDeck.cards.map(card => `
            <div class="viewed-card-item">
                <div>
                    <span class="card-name">${card.quantity}x ${card.name}</span>
                    ${card.legality ? `<span class="legality-badge ${card.legality.toLowerCase()}">${card.legality}</span>` : ''}
                </div>
                <div class="card-info">
                    ${card.manaCost || ''} • $${(card.price * card.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
        
        // Load comments and proposed changes
        await loadComments(deckId);
        await loadProposedChanges(deckId);
        
        // Show modal
        deckViewerModal.style.display = 'block';
        
    } catch (error) {
        console.error('Error viewing deck:', error);
        alert('Failed to load deck. Please try again.');
    }
}

function closeViewerModal() {
    deckViewerModal.style.display = 'none';
    currentViewedDeck = null;
    currentViewedDeckId = null;
}

// ===== COMMENTS SYSTEM =====
async function loadComments(deckId) {
    const { collection, query, where, getDocs } = window.firebaseModules;
    const commentsList = document.getElementById('commentsList');
    
    try {
        const q = query(
            collection(window.firebaseDb, 'comments'),
            where('deckId', '==', deckId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            commentsList.innerHTML = '<p style="color: #9b8365; font-size: 0.9em;">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        // Sort comments by timestamp client-side
        const comments = [];
        querySnapshot.forEach(doc => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        comments.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.seconds : 0;
            const timeB = b.timestamp ? b.timestamp.seconds : 0;
            return timeB - timeA;
        });
        
        commentsList.innerHTML = comments.map(comment => {
            const date = comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleString() : 'Just now';
            
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-time">${date}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<p style="color: #d97c6a;">Error loading comments.</p>';
    }
}

async function postComment() {
    if (!currentUser) {
        alert('Please log in to post a comment.');
        return;
    }
    
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please enter a comment.');
        return;
    }
    
    const { collection, addDoc, serverTimestamp } = window.firebaseModules;
    
    try {
        await addDoc(collection(window.firebaseDb, 'comments'), {
            deckId: currentViewedDeckId,
            author: currentUser.displayName,
            text: commentText,
            timestamp: serverTimestamp()
        });
        
        commentInput.value = '';
        await loadComments(currentViewedDeckId);
        
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment. Please try again.');
    }
}

// ===== PROPOSED CHANGES SYSTEM =====
async function loadProposedChanges(deckId) {
    const { collection, query, where, getDocs } = window.firebaseModules;
    const proposedChangesList = document.getElementById('proposedChangesList');
    
    try {
        const q = query(
            collection(window.firebaseDb, 'proposedChanges'),
            where('deckId', '==', deckId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            proposedChangesList.innerHTML = '<p style="color: #9b8365; font-size: 0.9em;">No proposed changes yet.</p>';
            return;
        }
        
        // Sort by timestamp client-side
        const changes = [];
        querySnapshot.forEach(doc => {
            changes.push({ id: doc.id, ...doc.data() });
        });
        changes.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.seconds : 0;
            const timeB = b.timestamp ? b.timestamp.seconds : 0;
            return timeB - timeA;
        });
        
        const isOwner = currentUser && currentUser.displayName === currentViewedDeck.owner;
        
        proposedChangesList.innerHTML = changes.map(change => {
            const date = change.timestamp ? new Date(change.timestamp.seconds * 1000).toLocaleString() : 'Just now';
            const actionClass = change.action === 'add' ? 'add' : 'remove';
            
            return `
                <div class="proposed-change-item">
                    <div class="change-header">
                        <span class="change-author">${change.author}</span>
                        <span class="change-time">${date}</span>
                    </div>
                    <div class="change-details">
                        <span class="change-action-badge ${actionClass}">${change.action.toUpperCase()}</span>
                        ${change.quantity}x ${change.cardName}
                    </div>
                    ${change.reason ? `<div class="change-reason">Reason: ${change.reason}</div>` : ''}
                    ${isOwner && change.status === 'pending' ? `
                        <div class="owner-actions">
                            <button class="owner-action-btn accept" onclick="respondToChange('${change.id}', 'accepted')">✓ Accept</button>
                            <button class="owner-action-btn reject" onclick="respondToChange('${change.id}', 'rejected')">✗ Reject</button>
                        </div>
                    ` : ''}
                    ${change.status !== 'pending' ? `<div style="color: ${change.status === 'accepted' ? '#90ee90' : '#ff6b6b'}; font-size: 0.85em; margin-top: 5px;">${change.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}</div>` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading proposed changes:', error);
        proposedChangesList.innerHTML = '<p style="color: #d97c6a;">Error loading proposed changes.</p>';
    }
}

async function proposeChange() {
    if (!currentUser) {
        alert('Please log in to propose a change.');
        return;
    }
    
    if (currentUser.displayName === currentViewedDeck.owner) {
        alert('You cannot propose changes to your own deck. Edit it directly!');
        return;
    }
    
    const action = document.getElementById('changeAction').value;
    const cardName = document.getElementById('changeCardName').value.trim();
    const quantity = parseInt(document.getElementById('changeQuantity').value) || 1;
    const reason = document.getElementById('changeReason').value.trim();
    
    if (!cardName) {
        alert('Please enter a card name.');
        return;
    }
    
    const { collection, addDoc, serverTimestamp } = window.firebaseModules;
    
    try {
        await addDoc(collection(window.firebaseDb, 'proposedChanges'), {
            deckId: currentViewedDeckId,
            author: currentUser.displayName,
            action: action,
            cardName: cardName,
            quantity: quantity,
            reason: reason,
            status: 'pending',
            timestamp: serverTimestamp()
        });
        
        // Clear inputs
        document.getElementById('changeCardName').value = '';
        document.getElementById('changeQuantity').value = '1';
        document.getElementById('changeReason').value = '';
        
        await loadProposedChanges(currentViewedDeckId);
        alert('Change proposed successfully!');
        
    } catch (error) {
        console.error('Error proposing change:', error);
        alert('Failed to propose change. Please try again.');
    }
}

async function respondToChange(changeId, response) {
    const { doc, updateDoc } = window.firebaseModules;
    
    try {
        const changeRef = doc(window.firebaseDb, 'proposedChanges', changeId);
        await updateDoc(changeRef, {
            status: response
        });
        
        await loadProposedChanges(currentViewedDeckId);
        alert(`Change ${response}!`);
        
    } catch (error) {
        console.error('Error responding to change:', error);
        alert('Failed to respond to change. Please try again.');
    }
}

// Make functions globally accessible
window.viewDeck = viewDeck;
window.respondToChange = respondToChange;

