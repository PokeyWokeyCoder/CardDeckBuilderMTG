// Deck storage
let deck = [];
let currentCard = null;
let currentUser = null;
let currentDeckId = null;

// DOM Elements
const cardSearch = document.getElementById('cardSearch');
const searchBtn = document.getElementById('searchBtn');
const setFilter = document.getElementById('setFilter');
const searchResults = document.getElementById('searchResults');
const cardPreview = document.getElementById('cardPreview');
const deckList = document.getElementById('deckList');
const totalCards = document.getElementById('totalCards');
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
clearDeck.addEventListener('click', clearDeckList);
exportDeck.addEventListener('click', exportDeckToFile);
importBtn.addEventListener('click', importDeckFromFile);
logoutBtn.addEventListener('click', logout);
saveDeckBtn.addEventListener('click', saveDeckToCloud);

// Check if user is logged in
checkLoginStatus();

// Load deck from localStorage on startup
loadDeck();

// Make loginAsUser available globally for onclick handlers
window.loginAsUser = loginAsUser;
window.loadDeckFromCloud = loadDeckFromCloud;
window.deleteDeckFromCloud = deleteDeckFromCloud;

// Search for cards using Scryfall API
async function searchCard() {
    const query = cardSearch.value.trim();
    if (!query) return;

    searchResults.innerHTML = '<p class="loading">Searching...</p>';

    try {
        // Build search query with optional set filter
        let searchQuery = query;
        const setCode = setFilter.value.trim();
        
        if (setCode) {
            // Add set filter to search query
            searchQuery = `${query} set:${setCode}`;
        }

        const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.object === 'error') {
            searchResults.innerHTML = '<p class="error">No cards found. Try a different search or check the set code.</p>';
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

    searchResults.innerHTML = cards.slice(0, 20).map(card => `
        <div class="search-result-item" onclick="selectCard('${card.id}')">
            <span>${card.name}</span>
            <span style="color: #999; font-size: 14px;">${card.set_name} (${card.set.toUpperCase()})</span>
        </div>
    `).join('');
}

// Select a card to display details
async function selectCard(cardId) {
    try {
        const response = await fetch(`https://api.scryfall.com/cards/${cardId}`);
        const card = await response.json();
        currentCard = card;
        displayCardDetails(card);
    } catch (error) {
        console.error('Error fetching card details:', error);
        cardPreview.innerHTML = '<p class="error">Error loading card details.</p>';
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

    cardPreview.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${card.name}">` : ''}
        <div class="card-info">
            <h3>${card.name}</h3>
            <div class="mana-cost">Mana Cost: ${manaCost}</div>
            <p><strong>Type:</strong> ${typeLine}</p>
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

// Add card to deck
function addCardToDeck() {
    if (!currentCard) return;

    const quantityInput = document.getElementById('quantityInput');
    const quantity = parseInt(quantityInput.value) || 1;

    // Validate quantity (max 4 per card)
    if (quantity < 1 || quantity > 4) {
        alert('Quantity must be between 1 and 4');
        return;
    }

    // Check if card already exists in deck
    const existingCard = deck.find(c => c.id === currentCard.id);
    
    if (existingCard) {
        const newQuantity = existingCard.quantity + quantity;
        if (newQuantity > 4) {
            alert(`Cannot add more. Maximum 4 copies per card. Currently have ${existingCard.quantity}.`);
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
            setName: currentCard.set_name
        });
    }

    saveDeck();
    updateDeckDisplay();
    quantityInput.value = 1;
}

// Update deck display
function updateDeckDisplay() {
    if (deck.length === 0) {
        deckList.innerHTML = '<p class="placeholder">Your deck is empty. Add cards to get started!</p>';
        totalCards.textContent = '0';
        totalPrice.textContent = '0.00';
        return;
    }

    // Sort deck by card name
    deck.sort((a, b) => a.name.localeCompare(b.name));

    deckList.innerHTML = deck.map(card => `
        <div class="deck-item">
            <div class="deck-item-info" onclick="viewDeckCard('${card.id}')">
                <div class="deck-item-name">${card.name} ${card.setCode ? `(${card.setCode})` : ''}</div>
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
    `).join('');

    updateDeckStats();
}

// Increase card quantity
function increaseQuantity(cardId) {
    const card = deck.find(c => c.id === cardId);
    if (card && card.quantity < 4) {
        card.quantity++;
        saveDeck();
        updateDeckDisplay();
    } else {
        alert('Maximum 4 copies per card!');
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
    
    totalCards.textContent = total;
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
                        setName: card.set_name
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
            userId: currentUser.uid,
            userEmail: currentUser.email,
            totalCards: deck.reduce((sum, card) => sum + card.quantity, 0),
            totalPrice: deck.reduce((sum, card) => sum + (card.price * card.quantity), 0),
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
