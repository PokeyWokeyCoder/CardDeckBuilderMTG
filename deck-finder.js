// Deck Finder JavaScript Logic

// State Management
let selections = {
    format: null,
    color: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    showStep(1);
});

// Step Navigation
function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show requested step
    const stepId = stepNumber === 'results' ? 'results' : `step${stepNumber}`;
    const step = document.getElementById(stepId);
    if (step) {
        step.classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToStep(stepNumber) {
    showStep(stepNumber);
}

// Format Selection (Step 1)
function selectFormat(format) {
    // Capitalize the format for database lookup
    selections.format = format.charAt(0).toUpperCase() + format.slice(1);
    
    // Update UI
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.option-card').classList.add('selected');
    
    // Auto-advance after brief delay
    setTimeout(() => {
        showStep(2);
    }, 300);
}

// Color Selection (Step 2)
function selectColor(color) {
    // Capitalize the color for database lookup
    selections.color = color.charAt(0).toUpperCase() + color.slice(1);
    
    // Update UI
    document.querySelectorAll('.color-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.color-option-card').classList.add('selected');
    
    // Generate and display recommendations immediately
    setTimeout(() => {
        generateRecommendations();
    }, 300);
}

// Generate Deck Recommendations
function generateRecommendations() {
    // Update selections summary
    const summaryDiv = document.getElementById('selections-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <h3>Your Preferences</h3>
            <div class="selection-item"><span class="selection-label">Format:</span> ${selections.format}</div>
            <div class="selection-item"><span class="selection-label">Color:</span> ${selections.color}</div>
        `;
    }
    
    // Generate recommendations based on selections - get all decks for the color
    const recommendations = getDeckRecommendations(
        selections.format,
        selections.color
    );
    
    // Show results
    showStep('results');
    
    // Display recommendations
    const recommendationsDiv = document.getElementById('deckRecommendations');
    if (!recommendationsDiv) {
        console.error('Could not find deckRecommendations div');
        return;
    }
    
    recommendationsDiv.innerHTML = recommendations.map(deck => `
        <div class="recommendation-card${deck.isPrecon ? ' precon-deck' : ''}">
            <h3>${deck.name} ${deck.isPrecon ? '⭐' : ''}</h3>
            ${deck.isPrecon ? `<div class="precon-badge">Official Precon ${deck.preconYear}</div>` : ''}
            ${deck.upgradeFrom ? `<div class="upgrade-badge">Upgraded from: ${deck.upgradeFrom}</div>` : ''}
            <div class="recommendation-description">${deck.description}</div>
            <div class="recommendation-details">
                <strong>Strategy:</strong> ${deck.strategy}<br>
                <strong>Budget:</strong> ${deck.budget}<br>
                <strong>Power Level:</strong> ${deck.powerLevel}
            </div>
            <div class="key-cards">
                <h4>Key Cards to Look For:</h4>
                <ul>
                    ${deck.keyCards.map(card => `<li>${card}</li>`).join('')}
                </ul>
            </div>
            ${deck.decklistUrl ? `
                <div class="decklist-link">
                    <a href="${deck.decklistUrl}" target="_blank" rel="noopener noreferrer" class="view-decklist-btn">
                        📋 View Full Decklist
                    </a>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Deck Recommendation Database
function getDeckRecommendations(format, color) {
    const deckDatabase = {
        // Commander Recommendations - Starting with official precons
        Commander: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "Anikthea, Hand of Erebos (Precon 2023)",
                        description: "Official Wizards precon featuring enchantment creatures. Great for learning enchantment synergies.",
                        strategy: "Play enchantment creatures, bring them back from graveyard, and overwhelm with value.",
                        budget: "$40-60 (Precon MSRP)",
                        powerLevel: "Precon (4-5)",
                        keyCards: ["Anikthea, Hand of Erebos", "Doomwake Giant", "Eidolon of Blossoms", "Kruphix's Insight", "Constellation triggers"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/anikthea-hand-of-erebos",
                        isPrecon: true,
                        preconYear: 2023
                    }],
                    Intermediate: [{
                        name: "Lathril, Blade of the Elves (Precon 2021)",
                        description: "Official elf tribal precon that creates tons of tokens and drains opponents.",
                        strategy: "Create elf tokens, tap them for mana or to drain opponents, and overwhelm with tribal synergies.",
                        budget: "$60-80 (Secondary market)",
                        powerLevel: "Upgraded Precon (6-7)",
                        keyCards: ["Lathril, Blade of the Elves", "Elvish Warmaster", "Beast Whisperer", "Immaculate Magistrate", "Rhys the Redeemed"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/lathril-blade-of-the-elves",
                        isPrecon: true,
                        preconYear: 2021
                    }],
                    Advanced: [{
                        name: "Edgar Markov Vampire Tribal (Upgraded Precon)",
                        description: "Originally a 2017 precon, this vampire tribal deck creates overwhelming board presence.",
                        strategy: "Play vampires to create tokens with Edgar's eminence ability, go wide with tokens.",
                        budget: "$300-500 (Fully upgraded)",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Edgar Markov", "Anointed Procession", "Impact Tremors", "Shared Animosity", "Fierce Guardianship"],
                        decklistUrl: "https://edhrec.com/commanders/edgar-markov",
                        isPrecon: false,
                        upgradeFrom: "Vampiric Bloodlust 2017"
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Planar Portal (Precon 2023)",
                        description: "Doctor Who themed precon with suspend and time counter mechanics.",
                        strategy: "Use suspend to cast powerful spells for cheap, control the board with removal.",
                        budget: "$40-60 (Precon MSRP)",
                        powerLevel: "Precon (4-5)",
                        keyCards: ["The Tenth Doctor", "Rose Tyler", "Jhoira of the Ghitu", "Inspiring Refrain", "Sol Ring"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/the-tenth-doctor",
                        isPrecon: true,
                        preconYear: 2023
                    }],
                    Intermediate: [{
                        name: "Heliod, Sun-Crowned (Community Deck)",
                        description: "Popular commander deck focused on lifegain combo with Walking Ballista.",
                        strategy: "Gain life to trigger Heliod, create infinite combo with Walking Ballista for the win.",
                        budget: "$200-350",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Heliod, Sun-Crowned", "Walking Ballista", "Soul Warden", "Soul's Attendant", "Auriok Champion"],
                        decklistUrl: "https://edhrec.com/commanders/heliod-sun-crowned",
                        isPrecon: false
                    }],
                    Advanced: [{
                        name: "Grand Arbiter Augustin IV Stax",
                        description: "Advanced control deck using white's full suite of answers and lock pieces.",
                        strategy: "Deploy taxing effects and removal efficiently while establishing card advantage through recursion.",
                        budget: "$500+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Teferi's Protection", "Land Tax", "Enlightened Tutor", "Smothering Tithe", "Rhystic Study"],
                        decklistUrl: "https://edhrec.com/commanders/grand-arbiter-augustin-iv",
                        isPrecon: false
                    }]
                },
                Ramp: {
                    Beginner: [{
                        name: "Seton, Krosan Protector Druids (Precon-style)",
                        description: "Mono-green druid tribal that ramps into big threats.",
                        strategy: "Play druids, tap them for mana, cast huge creatures and overrun.",
                        budget: "$75-125",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Seton, Krosan Protector", "Llanowar Elves", "Elvish Archdruid", "Beast Whisperer", "Craterhoof Behemoth"],
                        decklistUrl: "https://edhrec.com/commanders/seton-krosan-protector",
                        isPrecon: false
                    }]
                }
            },
            Blue: {
                Control: {
                    Beginner: [{
                        name: "Faceless Menace (Precon 2020)",
                        description: "Official morph-themed precon featuring Kadena, Slinking Sorcerer.",
                        strategy: "Counter threats, draw cards, and win with large creatures like leviathans and krakens.",
                        budget: "$75-125",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Stormtide Leviathan", "Counterspell", "Aesi, Tyrant of Gyre Strait", "Brainstorm", "Deep-Sea Kraken"]
                    }],
                    Intermediate: [{
                        name: "Mono-Blue Control",
                        description: "Classic control strategy with counters, bounces, and powerful finishers.",
                        strategy: "Control the stack and battlefield, establish card advantage, and close with efficient threats.",
                        budget: "$200-300",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Cyclonic Rift", "Rhystic Study", "Mystic Sanctuary", "Consecrated Sphinx", "Pact of Negation"]
                    }],
                    Advanced: [{
                        name: "Competitive Control",
                        description: "Highly tuned control deck with optimal interaction and fast win conditions.",
                        strategy: "Efficiently answer threats while assembling combo or controlling until opponents are locked out.",
                        budget: "$600+",
                        powerLevel: "Optimized (9)",
                        keyCards: ["Force of Will", "Mana Drain", "Timetwister", "Fierce Guardianship", "Thassa's Oracle"]
                    }]
                },
                Combo: {
                    Beginner: [{
                        name: "Infinite Mana Combo",
                        description: "Simple combos that generate infinite mana to win with big spells or card draw.",
                        strategy: "Assemble mana-generating combos, then use the mana to win through card draw or X spells.",
                        budget: "$80-130",
                        powerLevel: "Casual (6)",
                        keyCards: ["Dramatic Reversal", "Isochron Scepter", "Blue Sun's Zenith", "High Tide", "Palinchron"]
                    }],
                    Intermediate: [{
                        name: "Artifact Combo",
                        description: "Use artifact synergies to assemble game-winning combinations.",
                        strategy: "Build artifact engines that generate infinite mana, draw, or win conditions.",
                        budget: "$250-350",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Basalt Monolith", "Rings of Brighthearth", "Sensei's Divining Top", "Mystic Forge", "Aetherflux Reservoir"]
                    }],
                    Advanced: [{
                        name: "cEDH Combo",
                        description: "Competitive combo deck aiming to win as early as turn 2-4.",
                        strategy: "Race to combo kill while protecting your combo and disrupting opponents.",
                        budget: "$800+",
                        powerLevel: "Competitive (10)",
                        keyCards: ["Thassa's Oracle", "Demonic Consultation", "Force of Will", "Mana Crypt", "Mox Diamond"]
                    }]
                }
            },
            Black: {
                Aggro: {
                    Beginner: [{
                        name: "Undead Unleashed (Wilhelt, the Rotcleaver)",
                        description: "Official Zombie tribal precon from Midnight Hunt Commander 2021 featuring Wilhelt, the Rotcleaver.",
                        strategy: "Flood the board with zombie tokens, sacrifice for value, and overwhelm with undead synergies.",
                        budget: "$40-70",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Wilhelt, the Rotcleaver", "Zombie Apocalypse", "Gravecrawler", "Cemetery Reaper", "Rooftop Storm"],
                        isPrecon: true,
                        preconYear: 2021,
                        decklistUrl: "https://www.mtggoldfish.com/deck/4365842#paper"
                    }],
                    Intermediate: [{
                        name: "Shirei, Shizo's Caretaker (Aristocrats)",
                        description: "Popular EDHREC commander that recurs small creatures for massive value through sacrifice effects.",
                        strategy: "Sacrifice 1-power creatures repeatedly each turn, draining life and generating resources.",
                        budget: "$150-220",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Shirei, Shizo's Caretaker", "Blood Artist", "Zulaport Cutthroat", "Viscera Seer", "Skullclamp"],
                        decklistUrl: "https://edhrec.com/commanders/shirei-shizos-caretaker"
                    }],
                    Advanced: [{
                        name: "Yawgmoth, Thran Physician (Combo Aggro)",
                        description: "Competitive mono-black combo deck that chains sacrifice abilities into lethal combos.",
                        strategy: "Build creature engines with undying/persist, sacrifice for card advantage and combo kills.",
                        budget: "$450-650",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Yawgmoth, Thran Physician", "Geralf's Messenger", "Nest of Scarabs", "Phyrexian Altar", "Mikaeus, the Unhallowed"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-yawgmoth-thran-physician#paper"
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Draconic Dissent (Precon 2023)",
                        description: "Official Rakdos dragons precon from Commander Masters 2023 with removal and big fliers.",
                        strategy: "Control the board with removal spells, ramp with treasure, deploy dragon threats.",
                        budget: "$45-80",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Kolaghan, the Storm's Fury", "Crux of Fate", "Murder", "Damnation", "Moonveil Dragon"],
                        isPrecon: true,
                        preconYear: 2023,
                        decklistUrl: "https://www.mtggoldfish.com/deck/5842561#paper"
                    }],
                    Intermediate: [{
                        name: "Sheoldred, the Apocalypse (Life Drain)",
                        description: "Popular mono-black control using Phyrexian Praetor to punish card draw while gaining life.",
                        strategy: "Use removal to control threats, drain life with Sheoldred triggers, win with value.",
                        budget: "$280-380",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Sheoldred, the Apocalypse", "Phyrexian Arena", "Necropotence", "Toxic Deluge", "Crypt Ghast"],
                        decklistUrl: "https://edhrec.com/commanders/sheoldred-the-apocalypse"
                    }],
                    Advanced: [{
                        name: "Competitive Black Control (K'rrik)",
                        description: "Highly tuned mono-black control that uses life as a resource for explosive plays.",
                        strategy: "Pay life instead of mana with K'rrik, chain powerful spells, combo kill or lock out opponents.",
                        budget: "$700+",
                        powerLevel: "Optimized (9)",
                        keyCards: ["K'rrik, Son of Yawgmoth", "Necropotence", "Aetherflux Reservoir", "Bolas's Citadel", "Demonic Tutor"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-k-rrik-son-of-yawgmoth#paper"
                    }]
                },
                Combo: {
                    Beginner: [{
                        name: "Enduring Enchantments (Precon 2023)",
                        description: "Official Abzan enchantress precon from Wilds of Eldraine Commander 2023.",
                        strategy: "Build board state with enchantments, gain value from triggers, and combo with Sanguine Bond effects.",
                        budget: "$40-75",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Sanguine Bond", "Exquisite Blood", "Skybind", "Ethereal Armor", "Heliod's Punishment"],
                        isPrecon: true,
                        preconYear: 2023,
                        decklistUrl: "https://www.mtggoldfish.com/deck/5842565#paper"
                    }],
                    Intermediate: [{
                        name: "Mikaeus + Triskelion Combo",
                        description: "Classic two-card infinite combo deck in mono-black using undying synergies.",
                        strategy: "Tutor for Mikaeus and Triskelion, then loop damage infinitely to kill the table.",
                        budget: "$220-320",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Mikaeus, the Unhallowed", "Triskelion", "Walking Ballista", "Demonic Tutor", "Buried Alive"],
                        decklistUrl: "https://edhrec.com/commanders/mikaeus-the-unhallowed"
                    }],
                    Advanced: [{
                        name: "Ad Nauseam Storm (Competitive)",
                        description: "cEDH storm deck that uses Ad Nauseam to draw the entire deck and combo kill.",
                        strategy: "Resolve Ad Nauseam, draw most of your deck, generate mana, and win with Tendrils or Oracle.",
                        budget: "$850+",
                        powerLevel: "Competitive (9-10)",
                        keyCards: ["Ad Nauseam", "Necropotence", "Dark Ritual", "Cabal Ritual", "Demonic Consultation"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-sidisi-undead-vizier#paper"
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Draconic Rage (Precon 2021)",
                        description: "Official Gruul dragons precon from Adventures in the Forgotten Realms Commander 2021.",
                        strategy: "Ramp hard, cast dragons, attack with overwhelming flying power and burn effects.",
                        budget: "$35-65",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Vrondiss, Rage of Ancients", "Dragon's Rage Channeler", "Dragonborn Champion", "Terror of Mount Velus", "Scourge of Valkas"],
                        isPrecon: true,
                        preconYear: 2021,
                        decklistUrl: "https://www.mtggoldfish.com/deck/4180234#paper"
                    }],
                    Intermediate: [{
                        name: "Krenko, Mob Boss (Goblin Tribal)",
                        description: "Explosive goblin tribal deck that creates exponential token armies and combos off.",
                        strategy: "Use Krenko to double goblins each turn, then win with overwhelming board presence or combos.",
                        budget: "$180-280",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Krenko, Mob Boss", "Goblin Chieftain", "Purphoros, God of the Forge", "Skirk Prospector", "Goblin Matron"],
                        decklistUrl: "https://edhrec.com/commanders/krenko-mob-boss"
                    }],
                    Advanced: [{
                        name: "Purphoros, God of the Forge (Optimized)",
                        description: "Highly tuned mono-red aggro that burns opponents out with token generation triggers.",
                        strategy: "Create massive token armies, trigger Purphoros repeatedly, win through direct damage.",
                        budget: "$550-750",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Purphoros, God of the Forge", "Dockside Extortionist", "Jeska's Will", "Wheel of Fortune", "Goblin Bombardment"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-purphoros-god-of-the-forge#paper"
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Legends' Legacy (Precon 2022)",
                        description: "Official Jund legends-matter precon from Dominaria United Commander 2022.",
                        strategy: "Play legendary creatures and spells, control the board, and win with legendary synergies.",
                        budget: "$40-70",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Reki, the History of Kamigawa", "Arvad the Cursed", "Heroes' Podium", "Day of Destiny", "Urza's Ruinous Blast"],
                        isPrecon: true,
                        preconYear: 2022,
                        decklistUrl: "https://www.mtggoldfish.com/deck/5071683#paper"
                    }],
                    Intermediate: [{
                        name: "Blasphemous Act Tribal (Damage Control)",
                        description: "Red control deck using board wipes and indestructible creatures to maintain advantage.",
                        strategy: "Wipe the board repeatedly while protecting your own creatures, win with attrition.",
                        budget: "$160-260",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Blasphemous Act", "Stuffy Doll", "Boros Reckoner", "Repercussion", "Toralf, God of Fury"],
                        decklistUrl: "https://edhrec.com/commanders/toralf-god-of-fury-toralfs-hammer"
                    }],
                    Advanced: [{
                        name: "Magda, Brazen Outlaw (Combo Control)",
                        description: "Competitive dwarf tribal that tutors artifacts and dragons from the library.",
                        strategy: "Generate treasure tokens, tutor for combo pieces with Magda, protect and win.",
                        budget: "$650-900",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Magda, Brazen Outlaw", "Clock of Omens", "Cloudstone Curio", "Ganax, Astral Hunter", "Goldspan Dragon"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-magda-brazen-outlaw#paper"
                    }]
                },
                Combo: {
                    Beginner: [{
                        name: "Timeless Wisdom (Precon 2020)",
                        description: "Official Jeskai cycling precon from Commander 2020 with spell-based combo potential.",
                        strategy: "Cycle cards for value, build up resources, and combo off with cycling payoffs.",
                        budget: "$35-60",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Gavi, Nest Warden", "Shark Typhoon", "Eternal Dragon", "Decree of Silence", "New Perspectives"],
                        isPrecon: true,
                        preconYear: 2020,
                        decklistUrl: "https://www.mtggoldfish.com/deck/2951842#paper"
                    }],
                    Intermediate: [{
                        name: "Kiki-Jiki, Mirror Breaker (Combo)",
                        description: "Classic red combo deck using Kiki-Jiki to create infinite creature copies.",
                        strategy: "Assemble Kiki-Jiki with untap creatures like Zealous Conscripts, create infinite tokens, and win.",
                        budget: "$240-340",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Kiki-Jiki, Mirror Breaker", "Zealous Conscripts", "Deceiver Exarch", "Combat Celebrant", "Imperial Recruiter"],
                        decklistUrl: "https://edhrec.com/commanders/kiki-jiki-mirror-breaker"
                    }],
                    Advanced: [{
                        name: "Godo, Bandit Warlord (cEDH Combo)",
                        description: "Competitive mono-red combo that tutors Helm of the Host for instant wins.",
                        strategy: "Cast Godo, tutor Helm of the Host, equip and take infinite combat steps for the win.",
                        budget: "$800+",
                        powerLevel: "Competitive (9-10)",
                        keyCards: ["Godo, Bandit Warlord", "Helm of the Host", "Mana Crypt", "Grim Monolith", "Dockside Extortionist"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-godo-bandit-warlord#paper"
                    }]
                }
            },
            Green: {
                Ramp: {
                    Beginner: [{
                        name: "Elven Empire (Precon 2021)",
                        description: "Official elf tribal precon from Kaldheim Commander 2021 featuring Lathril, Blade of the Elves.",
                        strategy: "Generate elf tokens, tap for massive mana, and win with tribal synergies or token swarms.",
                        budget: "$35-65",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Lathril, Blade of the Elves", "Elderfang Venom", "Elvish Warmaster", "Imperious Perfect", "Canopy Tactician"],
                        isPrecon: true,
                        preconYear: 2021,
                        decklistUrl: "https://www.mtggoldfish.com/deck/3713651#paper"
                    }],
                    Intermediate: [{
                        name: "Ezuri, Renegade Leader (Elf Tribal)",
                        description: "Explosive elf tribal deck that generates infinite mana and overruns with pump effects.",
                        strategy: "Play elf mana dorks, use tribal synergies, generate infinite mana, and pump team for lethal.",
                        budget: "$200-300",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Ezuri, Renegade Leader", "Priest of Titania", "Elvish Archdruid", "Craterhoof Behemoth", "Chord of Calling"],
                        decklistUrl: "https://edhrec.com/commanders/ezuri-renegade-leader"
                    }],
                    Advanced: [{
                        name: "Selvala, Heart of the Wilds (Storm Ramp)",
                        description: "Competitive green ramp deck that chains large creatures into massive card draw and mana generation.",
                        strategy: "Cast big creatures, untap Selvala repeatedly, generate infinite mana, and win with outlets.",
                        budget: "$650-850",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Selvala, Heart of the Wilds", "Umbral Mantle", "Staff of Domination", "Temur Sabertooth", "Craterhoof Behemoth"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-selvala-heart-of-the-wilds#paper"
                    }]
                },
                Midrange: {
                    Beginner: [{
                        name: "Nature of the Beast (Precon 2013)",
                        description: "Official beast tribal precon from Commander 2013 with big creatures and ramp.",
                        strategy: "Ramp into beasts, use tribal synergies, and win through superior creature combat.",
                        budget: "$50-90",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Marath, Will of the Wild", "Krosan Warchief", "Ravenous Baloth", "Contested Cliffs", "Spearbreaker Behemoth"],
                        isPrecon: true,
                        preconYear: 2013,
                        decklistUrl: "https://www.mtggoldfish.com/deck/1404203#paper"
                    }],
                    Intermediate: [{
                        name: "Ghired, Conclave Exile (+1/+1 Counters)",
                        description: "Naya populate deck that creates massive token armies and buffs them with counters.",
                        strategy: "Create tokens, populate them, use counter synergies to grow threats and win through combat.",
                        budget: "$170-270",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Ghired, Conclave Exile", "Doubling Season", "Anointed Procession", "Cathars' Crusade", "Hardened Scales"],
                        decklistUrl: "https://edhrec.com/commanders/ghired-conclave-exile"
                    }],
                    Advanced: [{
                        name: "Yisan, the Wanderer Bard (Toolbox)",
                        description: "Competitive mono-green toolbox that chains creature tutors into powerful combos.",
                        strategy: "Use Yisan to tutor creatures in ascending order, build engines, and combo win.",
                        budget: "$600-800",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Yisan, the Wanderer Bard", "Quirion Ranger", "Wirewood Symbiote", "Temur Sabertooth", "Craterhoof Behemoth"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-yisan-the-wanderer-bard#paper"
                    }]
                }
            },
            Multicolor: {
                Aggro: {
                    Beginner: [{
                        name: "Prismari Performance (Precon 2021)",
                        description: "Official Izzet spellslinger precon from Strixhaven Commander 2021.",
                        strategy: "Cast big spells, copy them with magecraft triggers, and win with spell damage or tokens.",
                        budget: "$35-60",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Zaffai, Thunder Conductor", "Young Pyromancer", "Thousand-Year Storm", "Surge to Victory", "Metallurgic Summonings"],
                        isPrecon: true,
                        preconYear: 2021,
                        decklistUrl: "https://www.mtggoldfish.com/deck/3971468#paper"
                    }],
                    Intermediate: [{
                        name: "Winota, Joiner of Forces (Human Tribal)",
                        description: "Boros aggro deck that cheats powerful creatures into play through combat triggers.",
                        strategy: "Attack with non-humans, trigger Winota, cheat humans into play, and overwhelm opponents.",
                        budget: "$220-320",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Winota, Joiner of Forces", "Agent of Treachery", "Blade Historian", "Angrath's Marauders", "Esika's Chariot"],
                        decklistUrl: "https://edhrec.com/commanders/winota-joiner-of-forces"
                    }],
                    Advanced: [{
                        name: "Najeela, the Blade-Blossom (Five-Color Aggro)",
                        description: "Competitive five-color warrior tribal with infinite combat steps combo.",
                        strategy: "Attack with warriors, trigger Najeela, generate infinite combat steps, and win.",
                        budget: "$800+",
                        powerLevel: "Optimized (9-10)",
                        keyCards: ["Najeela, the Blade-Blossom", "Derevi, Empyrial Tactician", "Nature's Will", "Sword of Feast and Famine", "Bloom Tender"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-najeela-the-blade-blossom#paper"
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Mystic Intellect (Precon 2019)",
                        description: "Official Jeskai flashback precon from Commander 2019.",
                        strategy: "Control the board with instants and sorceries, flashback for value, and win with spell-based finishers.",
                        budget: "$40-70",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Sevinne, the Chronoclasm", "Backdraft Hellkite", "Dockside Extortionist", "Increasing Vengeance", "Scroll Rack"],
                        isPrecon: true,
                        preconYear: 2019,
                        decklistUrl: "https://www.mtggoldfish.com/deck/2210896#paper"
                    }],
                    Intermediate: [{
                        name: "Atraxa, Praetors' Voice (Superfriends)",
                        description: "Four-color planeswalker control deck that proliferates loyalty counters.",
                        strategy: "Deploy planeswalkers, proliferate their loyalty, and win with ultimate abilities or value.",
                        budget: "$350-450",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Atraxa, Praetors' Voice", "Doubling Season", "Teferi, Hero of Dominaria", "Oko, Thief of Crowns", "The Chain Veil"],
                        decklistUrl: "https://edhrec.com/commanders/atraxa-praetors-voice"
                    }],
                    Advanced: [{
                        name: "Kenrith, the Returned King (Five-Color Control)",
                        description: "Optimized five-color control deck with multiple win conditions and flexible answers.",
                        strategy: "Control the game with premium interaction, generate value with Kenrith, and combo win.",
                        budget: "$700+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Kenrith, the Returned King", "Thassa's Oracle", "Demonic Consultation", "Smothering Tithe", "Cyclonic Rift"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-kenrith-the-returned-king#paper"
                    }]
                },
                Combo: {
                    Beginner: [{
                        name: "Ruthless Regiment (Precon 2020)",
                        description: "Official Mardu humans precon from Commander 2020 featuring Jirina Kudro.",
                        strategy: "Build a human army, sacrifice for value, and combo with token generators.",
                        budget: "$35-60",
                        powerLevel: "Casual (6)",
                        keyCards: ["Jirina Kudro", "Winota, Joiner of Forces", "Loyal Apprentice", "Fireflux Squad", "Martial Coup"],
                        isPrecon: true,
                        preconYear: 2020,
                        decklistUrl: "https://www.mtggoldfish.com/deck/2951844#paper"
                    }],
                    Intermediate: [{
                        name: "Kinnan, Bonder Prodigy (Mana Doubling Combo)",
                        description: "Simic combo deck that doubles mana from permanents and chains into infinite mana.",
                        strategy: "Generate value with mana doublers, assemble infinite mana combos, and win with outlets.",
                        budget: "$350-500",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Kinnan, Bonder Prodigy", "Basalt Monolith", "Mana Reflection", "Freed from the Real", "Dramatic Reversal"],
                        decklistUrl: "https://edhrec.com/commanders/kinnan-bonder-prodigy"
                    }],
                    Advanced: [{
                        name: "The First Sliver (Five-Color Cascade cEDH)",
                        description: "Competitive five-color food chain combo deck that cascades into victory.",
                        strategy: "Cast The First Sliver, cascade into Food Chain, exile creature for infinite mana, cascade into wins.",
                        budget: "$1200+",
                        powerLevel: "Competitive (9-10)",
                        keyCards: ["The First Sliver", "Food Chain", "Eternal Scourge", "Demonic Consultation", "Thassa's Oracle"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/commander-the-first-sliver#paper"
                    }]
                }
            }
        },
        
        // Standard Recommendations
        Standard: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "Mono-White Weenie (2024 Standard)",
                        description: "Fast aggressive deck with efficient white creatures and anthems from current Standard.",
                        strategy: "Deploy cheap creatures quickly, use anthems to buff them, and overwhelm opponents before they stabilize.",
                        budget: "$80-140",
                        powerLevel: "FNM Ready",
                        keyCards: ["Hopeful Initiate", "Luminarch Aspirant", "Thalia, Guardian of Thraben", "Skrelv, Defector Mite", "Adeline, Resplendent Cathar"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/standard-mono-white-aggro-eld#paper"
                    }]
                }
            },
            Blue: {
                Control: {
                    Beginner: [{
                        name: "Dimir Control (2024 Standard)",
                        description: "Blue-black control deck with counterspells, removal, and powerful finishers from current meta.",
                        strategy: "Counter threats, remove creatures, draw cards with card advantage engines, and win late game.",
                        budget: "$150-220",
                        powerLevel: "FNM Ready",
                        keyCards: ["Make Disappear", "Sheoldred, the Apocalypse", "Go for the Throat", "Memory Deluge", "Hullbreaker Horror"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/standard-dimir-control-eld#paper"
                    }]
                }
            },
            Black: {
                Midrange: {
                    Beginner: [{
                        name: "Mono-Black Midrange (2024 Standard)",
                        description: "Removal-heavy midrange deck that wins through card advantage and efficient threats from current Standard.",
                        strategy: "Remove opponent's threats with premium black removal, grind value with Sheoldred, win with big demons.",
                        budget: "$120-180",
                        powerLevel: "FNM Ready",
                        keyCards: ["Sheoldred, the Apocalypse", "Invoke Despair", "Cut Down", "Tenacious Underdog", "The Cruelty of Gix"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/standard-mono-black-midrange-eld#paper"
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Mono-Red Aggro (2024 Standard)",
                        description: "Classic red aggro with cheap creatures and burn spells from current Standard meta.",
                        strategy: "Deploy efficient threats early, burn face with red spells, and win before opponents stabilize.",
                        budget: "$90-130",
                        powerLevel: "FNM Ready",
                        keyCards: ["Monastery Swiftspear", "Phoenix Chick", "Kumano Faces Kakkazan", "Lightning Strike", "Embercleave"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/standard-mono-red-aggro-eld#paper"
                    }]
                }
            },
            Green: {
                Ramp: {
                    Beginner: [{
                        name: "Selesnya Tokens (2024 Standard)",
                        description: "Green-white deck that creates massive token armies and buffs them for overwhelming combat from current Standard.",
                        strategy: "Create token creatures, use anthems and convoke spells, and win with wide boards.",
                        strategy: "Create token creatures, use anthems and convoke spells, and win with wide boards.",
                        budget: "$110-170",
                        powerLevel: "FNM Ready",
                        keyCards: ["Mondrak, Glory Dominus", "Adeline, Resplendent Cathar", "Intrepid Adversary", "Ossification", "Anointed Peacekeeper"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/standard-selesnya-tokens#paper"
                    }]
                }
            },
            Multicolor: {
                Midrange: {
                    Beginner: [{
                        name: "Golgari Midrange (2024 Standard)",
                        description: "Green-black midrange deck with efficient removal, card advantage, and powerful threats from current meta.",
                        strategy: "Play efficient removal and threats, grind value with graveyard recursion, and win through combat or planeswalkers.",
                        budget: "$160-240",
                        powerLevel: "FNM Ready",
                        keyCards: ["Sheoldred, the Apocalypse", "Liliana of the Veil", "Invoke Despair", "Workshop Warchief", "Glissa Sunslayer"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/standard-golgari-midrange#paper"
                    }]
                }
            }
        },
        
        // Modern Recommendations
        Modern: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "Soul Sisters (Budget Modern)",
                        description: "Lifegain aggro deck that races opponents while gaining life - budget-friendly Modern option.",
                        strategy: "Gain life from creatures entering, build board advantage with life triggers, and win through combat.",
                        budget: "$120-180",
                        powerLevel: "FNM Ready",
                        keyCards: ["Soul Warden", "Soul's Attendant", "Serra Ascendant", "Ajani's Pridemate", "Ranger of Eos"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/modern-soul-sisters#paper"
                    }]
                }
            },
            Blue: {
                Control: {
                    Intermediate: [{
                        name: "Azorius Control (Modern)",
                        description: "Classic Modern control deck with counterspells, wraths, and efficient finishers.",
                        strategy: "Counter threats, wrath the board, draw cards, and win late game with planeswalkers or creatures.",
                        budget: "$450-650",
                        powerLevel: "Competitive",
                        keyCards: ["Supreme Verdict", "Counterspell", "Teferi, Hero of Dominaria", "Shark Typhoon", "Memory Deluge"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/modern-azorius-control#paper"
                    }]
                }
            },
            Black: {
                Midrange: {
                    Intermediate: [{
                        name: "Rakdos Midrange (Modern)",
                        description: "Black-red midrange with excellent removal, card advantage, and efficient threats.",
                        strategy: "Remove opponent's threats efficiently, grind card advantage with synergies, and win through attrition.",
                        budget: "$550-800",
                        powerLevel: "Competitive",
                        keyCards: ["Grief", "Fury", "Dauthi Voidwalker", "Thoughtseize", "Fable of the Mirror-Breaker"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/modern-rakdos-midrange#paper"
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Burn (Modern)",
                        description: "Classic burn deck dealing damage directly to opponent's face with lightning bolts and friends.",
                        strategy: "Cast 7 burn spells directly at opponent's face, ignore creatures, win on turn 4-5.",
                        budget: "$250-350",
                        powerLevel: "Competitive",
                        keyCards: ["Lightning Bolt", "Lava Spike", "Rift Bolt", "Monastery Swiftspear", "Eidolon of the Great Revel"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/modern-burn#paper"
                    }]
                }
            },
            Green: {
                Combo: {
                    Intermediate: [{
                        name: "Amulet Titan (Modern)",
                        description: "Ramp deck that can combo kill with Primeval Titan and bounce lands.",
                        strategy: "Use Amulet of Vigor to untap bounce lands, generate massive mana, and cast Titans to search for combo pieces.",
                        budget: "$650-950",
                        powerLevel: "Competitive",
                        keyCards: ["Amulet of Vigor", "Primeval Titan", "Simic Growth Chamber", "Dryad of the Ilysian Grove", "Vesuva"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/modern-amulet-titan#paper"
                    }]
                }
            },
            Multicolor: {
                Combo: {
                    Advanced: [{
                        name: "Yawgmoth Combo (Modern)",
                        description: "Combo deck using Yawgmoth with undying creatures to create infinite loops.",
                        strategy: "Assemble Yawgmoth with undying creatures, sacrifice for card draw and -1/-1 counters, combo kill with Blood Artist effects.",
                        budget: "$550-800",
                        powerLevel: "Competitive",
                        keyCards: ["Yawgmoth, Thran Physician", "Young Wolf", "Strangleroot Geist", "Chord of Calling", "Blood Artist"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/modern-yawgmoth#paper"
                    }]
                }
            }
        },
        
        // Pauper Recommendations
        Pauper: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "White Weenie (Pauper)",
                        description: "Efficient white creatures with combat tricks at common rarity - budget competitive Pauper deck.",
                        strategy: "Deploy cheap efficient creatures, protect them with tricks, and win through combat damage.",
                        budget: "$30-55",
                        powerLevel: "Pauper Competitive",
                        keyCards: ["Thraben Inspector", "Kor Skyfisher", "Journey to Nowhere", "Battle Screech", "Guardians' Pledge"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/pauper-white-weenie#paper"
                    }]
                }
            },
            Blue: {
                Control: {
                    Beginner: [{
                        name: "Faeries (Pauper)",
                        description: "Tempo deck with evasive threats, counterspells, and card advantage at common rarity.",
                        strategy: "Deploy faerie threats, protect them with counters, and grind card advantage with ninjas.",
                        budget: "$40-70",
                        powerLevel: "Pauper Competitive",
                        keyCards: ["Spellstutter Sprite", "Ninja of the Deep Hours", "Counterspell", "Snuff Out", "Augur of Bolas"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/pauper-faeries#paper"
                    }]
                }
            },
            Black: {
                Control: {
                    Beginner: [{
                        name: "MBC - Mono Black Control (Pauper)",
                        description: "Classic Pauper control deck with excellent removal suite and card advantage engines.",
                        strategy: "Kill all creatures with premium removal, generate card advantage with rats, and win with Gray Merchant drain.",
                        budget: "$45-80",
                        powerLevel: "Pauper Competitive",
                        keyCards: ["Chittering Rats", "Cuombajj Witches", "Sign in Blood", "Snuff Out", "Gray Merchant of Asphodel"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/pauper-mbc#paper"
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Red Deck Wins (Pauper)",
                        description: "Fast red aggro with burn spells and hasty creatures at common rarity.",
                        strategy: "Deal 20 damage as fast as possible with efficient creatures and burn spells to the face.",
                        budget: "$35-60",
                        powerLevel: "Pauper Competitive",
                        keyCards: ["Monastery Swiftspear", "Lightning Bolt", "Chain Lightning", "Fireblast", "Kuldotha Rebirth"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/pauper-red-deck-wins#paper"
                    }]
                }
            },
            Green: {
                Ramp: {
                    Beginner: [{
                        name: "Elves (Pauper)",
                        description: "Elf tribal deck that generates massive amounts of mana and creature advantage.",
                        strategy: "Play elf mana dorks, generate exponential mana, and overwhelm with creature count and pump effects.",
                        budget: "$50-90",
                        powerLevel: "Pauper Competitive",
                        keyCards: ["Llanowar Elves", "Priest of Titania", "Quirion Ranger", "Timberwatch Elf", "Distant Melody"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/pauper-elves#paper"
                    }]
                }
            },
            Multicolor: {
                Midrange: {
                    Beginner: [{
                        name: "Boros Bully (Pauper)",
                        description: "Red-white midrange deck with efficient creatures and removal at common rarity.",
                        strategy: "Play efficient creatures, use pump spells and removal, and win through aggressive combat and reach.",
                        budget: "$55-90",
                        powerLevel: "Pauper Competitive",
                        keyCards: ["Kor Skyfisher", "Galvanic Blast", "Lightning Bolt", "Battle Screech", "Rally the Peasants"],
                        decklistUrl: "https://www.mtggoldfish.com/archetype/pauper-boros-bully#paper"
                    }]
                }
            }
        }
    };
    
    // Navigate through the database and collect all decks for the chosen color
    try {
        console.log('Looking for format:', format, 'color:', color);
        const formatDecks = deckDatabase[format];
        if (!formatDecks) {
            console.error('Format not found:', format);
            return getDefaultRecommendation();
        }
        
        const allDecks = [];
        
        // Collect decks from the selected color
        if (formatDecks[color]) {
            console.log('Found color decks for:', color);
            const colorDecks = formatDecks[color];
            // Iterate through all playstyles in this color
            Object.keys(colorDecks).forEach(playstyle => {
                Object.keys(colorDecks[playstyle]).forEach(difficulty => {
                    if (Array.isArray(colorDecks[playstyle][difficulty])) {
                        console.log('Adding', colorDecks[playstyle][difficulty].length, 'decks from', playstyle, difficulty);
                        allDecks.push(...colorDecks[playstyle][difficulty]);
                    }
                });
            });
        } else {
            console.warn('No decks found for color:', color);
        }
        
        // Also include Multicolor decks if the user selected a specific color
        if (color !== 'Multicolor' && formatDecks.Multicolor) {
            console.log('Adding multicolor decks');
            const multicolorDecks = formatDecks.Multicolor;
            Object.keys(multicolorDecks).forEach(playstyle => {
                Object.keys(multicolorDecks[playstyle]).forEach(difficulty => {
                    if (Array.isArray(multicolorDecks[playstyle][difficulty])) {
                        allDecks.push(...multicolorDecks[playstyle][difficulty]);
                    }
                });
            });
        }
        
        console.log('Total decks found:', allDecks.length);
        return allDecks.length > 0 ? allDecks : getDefaultRecommendation();
    } catch (error) {
        console.error('Error finding recommendations:', error);
        return getDefaultRecommendation();
    }
}

// Fallback recommendation
function getDefaultRecommendation() {
    return [{
        name: "Custom Deck",
        description: "We don't have a specific recommendation for this exact combination, but here's a general approach!",
        strategy: `Build a deck in ${selections.format} format using ${selections.color} colors. Focus on synergy and consistency.`,
        budget: "$100-200",
        powerLevel: "Casual-Focused (6-7)",
        keyCards: ["Consider cards that fit your playstyle", "Look for synergies in your chosen colors", "Include proper mana fixing", "Add interaction and card draw", "Include win conditions"]
    }];
}

// Search for recommended cards
function searchRecommendedCards() {
    // Build search query based on selections
    const params = new URLSearchParams();
    
    // Add color to search
    if (selections.color && selections.color !== 'Multicolor') {
        const colorMap = {
            'White': 'W',
            'Blue': 'U',
            'Black': 'B',
            'Red': 'R',
            'Green': 'G'
        };
        params.set('includeColors', colorMap[selections.color]);
    }
    
    // Add format
    if (selections.format) {
        params.set('format', selections.format.toLowerCase());
    }
    
    // Redirect to advanced search
    window.location.href = `advanced-search.html?${params.toString()}`;
}

// Restart the finder
function restartFinder() {
    selections = {
        format: null,
        color: null
    };
    
    // Reset all selections
    document.querySelectorAll('.option-card, .color-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Go back to step 1
    showStep(1);
}

// Navigate back to main page
function goToMainPage() {
    window.location.href = 'index.html';
}
