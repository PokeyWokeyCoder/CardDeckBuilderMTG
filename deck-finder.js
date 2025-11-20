// Deck Finder JavaScript Logic

// State Management
let selections = {
    format: null,
    color: null,
    playstyle: null,
    difficulty: null
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
    selections.format = format;
    
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
    selections.color = color;
    
    // Update UI
    document.querySelectorAll('.color-option-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.color-option-card').classList.add('selected');
    
    // Auto-advance after brief delay
    setTimeout(() => {
        showStep(3);
    }, 300);
}

// Playstyle Selection (Step 3)
function selectPlaystyle(playstyle) {
    selections.playstyle = playstyle;
    
    // Update UI
    document.querySelectorAll('.playstyle-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.playstyle-card').classList.add('selected');
    
    // Auto-advance after brief delay
    setTimeout(() => {
        showStep(4);
    }, 300);
}

// Difficulty Selection (Step 4)
function selectDifficulty(difficulty) {
    selections.difficulty = difficulty;
    
    // Update UI
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.difficulty-card').classList.add('selected');
    
    // Generate recommendations after brief delay
    setTimeout(() => {
        generateRecommendations();
        showStep('results');
    }, 500);
}

// Generate Deck Recommendations
function generateRecommendations() {
    // Update selections summary
    const summaryDiv = document.querySelector('.selections-summary');
    summaryDiv.innerHTML = `
        <h3>Your Preferences</h3>
        <div class="selection-item"><span class="selection-label">Format:</span> ${selections.format}</div>
        <div class="selection-item"><span class="selection-label">Color:</span> ${selections.color}</div>
        <div class="selection-item"><span class="selection-label">Playstyle:</span> ${selections.playstyle}</div>
        <div class="selection-item"><span class="selection-label">Experience Level:</span> ${selections.difficulty}</div>
    `;
    
    // Generate recommendations based on selections
    const recommendations = getDeckRecommendations(
        selections.format,
        selections.color,
        selections.playstyle,
        selections.difficulty
    );
    
    // Display recommendations
    const recommendationsDiv = document.getElementById('deckRecommendations');
    recommendationsDiv.innerHTML = recommendations.map(deck => `
        <div class="recommendation-card">
            <h3>${deck.name}</h3>
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
        </div>
    `).join('');
}

// Deck Recommendation Database
function getDeckRecommendations(format, color, playstyle, difficulty) {
    const deckDatabase = {
        // Commander Recommendations
        Commander: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "Mono-White Soldiers",
                        description: "Build an army of soldiers and overwhelm your opponents with superior numbers. Simple but effective strategy focused on creature combat.",
                        strategy: "Play cheap soldier creatures early, use anthem effects to boost them, and attack with overwhelming force.",
                        budget: "$50-100",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Captain of the Watch", "Field Marshal", "Preeminent Captain", "Darien, King of Kjeldor", "Coat of Arms"]
                    }],
                    Intermediate: [{
                        name: "Voltron Equipment",
                        description: "Suit up your commander with powerful equipment and take out opponents with commander damage.",
                        strategy: "Focus on equipment cards and protection spells to make your commander an unstoppable force.",
                        budget: "$150-250",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Sword of Feast and Famine", "Colossus Hammer", "Sigarda's Aid", "Puresteel Paladin", "Stoneforge Mystic"]
                    }],
                    Advanced: [{
                        name: "Stax & Hatebears",
                        description: "Control the battlefield by restricting opponent actions while building your own board advantage.",
                        strategy: "Use taxing effects and creature-based disruption to slow opponents while building toward victory.",
                        budget: "$400+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Grand Abolisher", "Thalia, Guardian of Thraben", "Rule of Law", "Armageddon", "Weathered Wayfarer"]
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Angels & Wraths",
                        description: "Use board wipes to control the game, then close out with powerful angel creatures.",
                        strategy: "Clear the board repeatedly with wraths, play resilient angels, and protect them while attacking.",
                        budget: "$75-125",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Wrath of God", "Akroma, Angel of Wrath", "Avacyn, Angel of Hope", "Archangel of Tithes", "Day of Judgment"]
                    }],
                    Intermediate: [{
                        name: "Enchantress Control",
                        description: "Lock down opponents with enchantments while drawing cards and building toward victory.",
                        strategy: "Use enchantments to control the board and gain value, eventually overwhelming with card advantage.",
                        budget: "$200-300",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Luminarch Ascension", "Sphere of Safety", "Smothering Tithe", "Rest in Peace", "Ghostly Prison"]
                    }],
                    Advanced: [{
                        name: "Mono-White Control",
                        description: "Advanced control deck using white's full suite of answers and lock pieces.",
                        strategy: "Deploy taxing effects and removal efficiently while establishing card advantage through recursion.",
                        budget: "$500+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Teferi's Protection", "Land Tax", "Enlightened Tutor", "Elesh Norn, Grand Cenobite", "Weathered Wayfarer"]
                    }]
                },
                Midrange: {
                    Beginner: [{
                        name: "White Tokens",
                        description: "Create an army of tokens and use them to overwhelm opponents through numbers.",
                        strategy: "Generate lots of creature tokens, boost them with anthems, and attack in waves.",
                        budget: "$60-100",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Elspeth, Sun's Champion", "Intangible Virtue", "Secure the Wastes", "Cathars' Crusade", "Martial Coup"]
                    }],
                    Intermediate: [{
                        name: "Lifegain Value",
                        description: "Gain life to trigger powerful effects and outlast opponents in the long game.",
                        strategy: "Build life total while generating value, eventually winning through combat or combo.",
                        budget: "$150-250",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Aetherflux Reservoir", "Soul Warden", "Soul's Attendant", "Heliod, Sun-Crowned", "Walking Ballista"]
                    }],
                    Advanced: [{
                        name: "Mono-White Midrange",
                        description: "Balanced deck with efficient creatures, removal, and card advantage engines.",
                        strategy: "Deploy threats efficiently while maintaining answers, winning through superior resource management.",
                        budget: "$400+",
                        powerLevel: "Optimized (8)",
                        keyCards: ["Esper Sentinel", "Mangara, the Diplomat", "Smothering Tithe", "Ephemerate", "Land Tax"]
                    }]
                }
            },
            Blue: {
                Control: {
                    Beginner: [{
                        name: "Big Blue Sea Creatures",
                        description: "Control the early game with counterspells, then deploy massive sea creatures to finish.",
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
                        name: "Zombie Tribal",
                        description: "Swarm the board with zombies and overwhelm opponents with undead hordes.",
                        strategy: "Play lots of zombies, use tribal synergies, and attack relentlessly.",
                        budget: "$60-100",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Gravecrawler", "Death Baron", "Cemetery Reaper", "Army of the Damned", "Endless Ranks of the Dead"]
                    }],
                    Intermediate: [{
                        name: "Aristocrats Sacrifice",
                        description: "Sacrifice creatures for value, draining opponents and building advantage.",
                        strategy: "Create sacrifice loops for value, drain life, and recur threats.",
                        budget: "$150-250",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Blood Artist", "Zulaport Cutthroat", "Grave Pact", "Ashnod's Altar", "Pitiless Plunderer"]
                    }],
                    Advanced: [{
                        name: "Fast Black Aggro",
                        description: "Highly efficient black aggro with powerful finishers and disruption.",
                        strategy: "Deploy threats efficiently, disrupt opponents, and close quickly with strong creatures.",
                        budget: "$400+",
                        powerLevel: "Optimized (8)",
                        keyCards: ["Dark Confidant", "Phyrexian Obliterator", "Toxic Deluge", "Bitterblossom", "Sheoldred, the Apocalypse"]
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Mono-Black Removal",
                        description: "Kill everything opponents play, then win with whatever creatures survive.",
                        strategy: "Use black's excellent removal suite to control the board, then deploy threats.",
                        budget: "$70-120",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Murder", "Doom Blade", "Damnation", "Gray Merchant of Asphodel", "Kokusho, the Evening Star"]
                    }],
                    Intermediate: [{
                        name: "Reanimator Control",
                        description: "Fill your graveyard, then bring back powerful creatures at a discount.",
                        strategy: "Self-mill and discard to fill graveyard, reanimate threats, control with removal.",
                        budget: "$200-300",
                        powerLevel: "Focused (7)",
                        keyCards: ["Reanimate", "Animate Dead", "Entomb", "Buried Alive", "Griselbrand"]
                    }],
                    Advanced: [{
                        name: "Competitive Black Control",
                        description: "Optimized control deck with efficient removal and powerful threats.",
                        strategy: "Control resources efficiently, establish card advantage, and close with resilient threats.",
                        budget: "$500+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Necropotence", "Demonic Tutor", "Toxic Deluge", "Bloodchief Ascension", "K'rrik, Son of Yawgmoth"]
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Dragon Tribal",
                        description: "Ramp into powerful dragons and burn opponents down with fire-breathing fury.",
                        strategy: "Use mana ramp to cast dragons early, then attack with flying creatures.",
                        budget: "$75-125",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Dragon Tempest", "Utvara Hellkite", "Lathliss, Dragon Queen", "Scourge of Valkas", "Dragonspeaker Shaman"]
                    }],
                    Intermediate: [{
                        name: "Goblin Swarm",
                        description: "Create an overwhelming army of goblins with powerful tribal synergies.",
                        strategy: "Play lots of goblins, use lords and synergies, and attack with overwhelming numbers.",
                        budget: "$150-250",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Krenko, Mob Boss", "Goblin Chieftain", "Purphoros, God of the Forge", "Skirk Prospector", "Goblin Matron"]
                    }],
                    Advanced: [{
                        name: "Optimized Red Aggro",
                        description: "Fast, efficient red aggro with powerful combos and disruption.",
                        strategy: "Deploy threats quickly, use rituals for explosive turns, and close with damage combos.",
                        budget: "$400+",
                        powerLevel: "Optimized (8)",
                        keyCards: ["Dockside Extortionist", "Grim Monolith", "Wheel of Fortune", "Jeska, Thrice Reborn", "Blood Moon"]
                    }]
                },
                Combo: {
                    Beginner: [{
                        name: "Copy Spell Combo",
                        description: "Copy powerful spells multiple times for overwhelming value or combo kills.",
                        strategy: "Use copy effects to multiply spells, eventually creating infinite loops or massive damage.",
                        budget: "$80-130",
                        powerLevel: "Casual (6)",
                        keyCards: ["Fork", "Reverberate", "Twinflame", "Heat Shimmer", "Dualcaster Mage"]
                    }],
                    Intermediate: [{
                        name: "Storm Combo",
                        description: "Cast many spells in one turn to trigger storm and deal lethal damage.",
                        strategy: "Build mana through rituals, cast many spells, win with storm finishers.",
                        budget: "$250-350",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Grapeshot", "Empty the Warrens", "Ruby Medallion", "Jeska's Will", "Underworld Breach"]
                    }],
                    Advanced: [{
                        name: "cEDH Red Combo",
                        description: "Competitive combo deck with fast mana and efficient win conditions.",
                        strategy: "Generate massive mana quickly and combo kill the table.",
                        budget: "$700+",
                        powerLevel: "Competitive (9-10)",
                        keyCards: ["Dockside Extortionist", "Mana Crypt", "Chrome Mox", "Grim Monolith", "Underworld Breach"]
                    }]
                }
            },
            Green: {
                Ramp: {
                    Beginner: [{
                        name: "Mono-Green Stompy",
                        description: "Ramp into massive creatures and trample over opponents.",
                        strategy: "Play land ramp spells, cast huge creatures, and attack with overwhelming power.",
                        budget: "$60-100",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Rampant Growth", "Kodama's Reach", "Craterhoof Behemoth", "Avenger of Zendikar", "Overwhelming Stampede"]
                    }],
                    Intermediate: [{
                        name: "Elf Tribal Ramp",
                        description: "Use elves to generate massive amounts of mana and overwhelm with creatures.",
                        strategy: "Play elf mana dorks, use tribal synergies to generate more elves, and win with combat or combo.",
                        budget: "$175-275",
                        powerLevel: "Focused (7)",
                        keyCards: ["Priest of Titania", "Elvish Archdruid", "Craterhoof Behemoth", "Ezuri, Renegade Leader", "Chord of Calling"]
                    }],
                    Advanced: [{
                        name: "Competitive Green Ramp",
                        description: "Hyper-efficient ramp deck with fast combos and overwhelming board presence.",
                        strategy: "Ramp explosively, deploy powerful threats, and combo kill or overwhelm with creatures.",
                        budget: "$500+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Gaea's Cradle", "Survival of the Fittest", "Natural Order", "Worldly Tutor", "Finale of Devastation"]
                    }]
                },
                Midrange: {
                    Beginner: [{
                        name: "Beast Tribal",
                        description: "Play powerful beasts and use them to dominate combat.",
                        strategy: "Ramp into beasts, use tribal synergies, and win through superior creatures.",
                        budget: "$70-120",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Garruk's Packleader", "Ravenous Baloth", "Contested Cliffs", "Wirewood Savage", "Krosan Warchief"]
                    }],
                    Intermediate: [{
                        name: "+1/+1 Counter Value",
                        description: "Build creatures with +1/+1 counters and use them for value and combat.",
                        strategy: "Use counter synergies to grow threats, generate value, and win through combat.",
                        budget: "$150-250",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Hardened Scales", "Doubling Season", "Vorinclex, Monstrous Raider", "The Ozolith", "Rishkar, Peema Renegade"]
                    }],
                    Advanced: [{
                        name: "Green Midrange Toolbox",
                        description: "Use tutors to find answers and threats, adapting to any situation.",
                        strategy: "Tutor for the right card at the right time, control through creatures, win through value.",
                        budget: "$450+",
                        powerLevel: "Optimized (8)",
                        keyCards: ["Survival of the Fittest", "Chord of Calling", "Green Sun's Zenith", "Finale of Devastation", "Eternal Witness"]
                    }]
                }
            },
            Multicolor: {
                Aggro: {
                    Beginner: [{
                        name: "Five-Color Ally Tribal",
                        description: "Play allies that trigger powerful effects when more allies enter the battlefield.",
                        strategy: "Chain ally triggers for value, build a board, and attack with buffed creatures.",
                        budget: "$80-130",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Harabaz Druid", "Hada Freeblade", "Ondu Cleric", "General Tazri", "Hagra Diabolist"]
                    }],
                    Intermediate: [{
                        name: "Five-Color Humans",
                        description: "Aggressive human tribal with powerful synergies and lords.",
                        strategy: "Play efficient humans, use tribal synergies, and pressure opponents early.",
                        budget: "$200-300",
                        powerLevel: "Focused (6-7)",
                        keyCards: ["Champion of the Parish", "Thalia's Lieutenant", "Mantis Rider", "General Kudro of Drannith", "Winota, Joiner of Forces"]
                    }],
                    Advanced: [{
                        name: "Five-Color Aggro Combo",
                        description: "Fast aggro deck with combo backup plans and optimal mana base.",
                        strategy: "Apply pressure while building toward combo kills, adapt based on opposition.",
                        budget: "$600+",
                        powerLevel: "Optimized (8-9)",
                        keyCards: ["Najeela, the Blade-Blossom", "Derevi, Empyrial Tactician", "Nature's Will", "Sword of Feast and Famine", "Bloom Tender"]
                    }]
                },
                Control: {
                    Beginner: [{
                        name: "Five-Color Good Stuff",
                        description: "Play the best cards from all colors, controlling the game with premium removal and threats.",
                        strategy: "Use fixing to cast powerful spells of all colors, control the board, and win with bombs.",
                        budget: "$100-150",
                        powerLevel: "Casual (5-6)",
                        keyCards: ["Golos, Tireless Pilgrim", "Chromatic Lantern", "Utter End", "Sphinx's Revelation", "Primevals' Glorious Rebirth"]
                    }],
                    Intermediate: [{
                        name: "Four/Five-Color Control",
                        description: "Classic control strategy with access to the best interaction from all colors.",
                        strategy: "Control all aspects of the game with diverse answers, win with powerful finishers.",
                        budget: "$300-400",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Cyclonic Rift", "Anguished Unmaking", "Assassin's Trophy", "Smothering Tithe", "Esika's Chariot"]
                    }],
                    Advanced: [{
                        name: "Five-Color Superfriends",
                        description: "Use planeswalkers to control the game and generate overwhelming value.",
                        strategy: "Deploy and protect planeswalkers, build loyalty, and win with ultimate abilities.",
                        budget: "$500+",
                        powerLevel: "Optimized (8)",
                        keyCards: ["Doubling Season", "The Chain Veil", "Teferi, Time Raveler", "Narset, Parter of Veils", "Jace, the Mind Sculptor"]
                    }]
                },
                Combo: {
                    Beginner: [{
                        name: "Five-Color Combo Pieces",
                        description: "Simple infinite combos using multicolor cards and fixing.",
                        strategy: "Assemble two or three card combos that win the game instantly.",
                        budget: "$90-140",
                        powerLevel: "Casual (6)",
                        keyCards: ["Niv-Mizzet, Parun", "Curiosity", "Karametra's Acolyte", "Umbral Mantle", "Axebane Guardian"]
                    }],
                    Intermediate: [{
                        name: "Multicolor Combo Value",
                        description: "Use multicolor synergies to build toward powerful combo finishes.",
                        strategy: "Generate value through multicolor payoffs while assembling combo pieces.",
                        budget: "$300-450",
                        powerLevel: "Focused (7-8)",
                        keyCards: ["Sisay, Weatherlight Captain", "Jegantha, the Wellspring", "Kinnan, Bonder Prodigy", "Freed from the Real", "Zacama, Primal Calamity"]
                    }],
                    Advanced: [{
                        name: "cEDH Five-Color Combo",
                        description: "Competitive combo deck with optimal mana base and fast win conditions.",
                        strategy: "Race to combo kill while disrupting opponents with diverse interaction.",
                        budget: "$1000+",
                        powerLevel: "Competitive (9-10)",
                        keyCards: ["Thassa's Oracle", "Demonic Consultation", "Dockside Extortionist", "Force of Will", "Mana Crypt"]
                    }]
                }
            }
        },
        
        // Standard Recommendations (simplified for brevity)
        Standard: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "Mono-White Aggro",
                        description: "Fast aggressive deck with efficient white creatures and combat tricks.",
                        strategy: "Play cheap creatures, protect them, and deal 20 damage quickly.",
                        budget: "$50-80",
                        powerLevel: "FNM Ready",
                        keyCards: ["Thalia, Guardian of Thraben", "Legion's Landing", "Venerated Loxodon", "Benalish Marshal", "History of Benalia"]
                    }]
                }
            },
            Blue: {
                Control: {
                    Beginner: [{
                        name: "Blue-Based Control",
                        description: "Control deck with counterspells and card draw, winning with big finishers.",
                        strategy: "Counter threats, draw cards, and win late game with powerful creatures or planeswalkers.",
                        budget: "$100-150",
                        powerLevel: "FNM Ready",
                        keyCards: ["Counterspell", "Opt", "Consider", "Hullbreaker Horror", "Memory Deluge"]
                    }]
                }
            },
            Black: {
                Midrange: {
                    Beginner: [{
                        name: "Mono-Black Midrange",
                        description: "Removal-heavy deck that wins through card advantage and efficient threats.",
                        strategy: "Remove opponent's threats, generate card advantage, and win with resilient creatures.",
                        budget: "$75-125",
                        powerLevel: "FNM Ready",
                        keyCards: ["Murderous Rider", "Phyrexian Arena", "Gray Merchant of Asphodel", "Lolth, Spider Queen", "Blood on the Snow"]
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Mono-Red Aggro",
                        description: "Classic red aggro with cheap creatures and burn spells.",
                        strategy: "Deploy threats early, burn face, and win before opponent stabilizes.",
                        budget: "$60-100",
                        powerLevel: "FNM Ready",
                        keyCards: ["Monastery Swiftspear", "Lightning Bolt", "Bonecrusher Giant", "Embercleave", "Anax, Hardened in the Forge"]
                    }]
                }
            },
            Green: {
                Ramp: {
                    Beginner: [{
                        name: "Green Ramp",
                        description: "Ramp into big creatures and overwhelm opponents.",
                        strategy: "Play ramp spells, cast huge threats, and win through combat.",
                        budget: "$70-110",
                        powerLevel: "FNM Ready",
                        keyCards: ["Cultivate", "Llanowar Elves", "Elder Gargaroth", "Vorinclex, Monstrous Raider", "Esika's Chariot"]
                    }]
                }
            },
            Multicolor: {
                Midrange: {
                    Beginner: [{
                        name: "Two-Color Midrange",
                        description: "Balanced deck with good creatures, removal, and card advantage.",
                        strategy: "Play efficient threats and answers, win through superior card quality.",
                        budget: "$100-150",
                        powerLevel: "FNM Ready",
                        keyCards: ["Fable of the Mirror-Breaker", "Graveyard Trespasser", "Bloodtithe Harvester", "Corpse Appraiser", "Raffine's Informant"]
                    }]
                }
            }
        },
        
        // Modern Recommendations (simplified)
        Modern: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "Soul Sisters",
                        description: "Lifegain aggro deck that races opponents while gaining life.",
                        strategy: "Gain life from creatures entering, build board advantage, and win through combat.",
                        budget: "$100-150",
                        powerLevel: "FNM Ready",
                        keyCards: ["Soul Warden", "Soul's Attendant", "Serra Ascendant", "Ajani's Pridemate", "Squadron Hawk"]
                    }]
                }
            },
            Blue: {
                Control: {
                    Intermediate: [{
                        name: "UW Control",
                        description: "Classic control deck with counterspells, wraths, and efficient finishers.",
                        strategy: "Control the game with counters and removal, win with card advantage.",
                        budget: "$400-600",
                        powerLevel: "Competitive",
                        keyCards: ["Supreme Verdict", "Cryptic Command", "Snapcaster Mage", "Teferi, Hero of Dominaria", "Counterspell"]
                    }]
                }
            },
            Black: {
                Midrange: {
                    Intermediate: [{
                        name: "Jund Midrange",
                        description: "Three-color midrange with excellent removal and card advantage.",
                        strategy: "Trade resources efficiently, generate card advantage, and win through attrition.",
                        budget: "$800-1200",
                        powerLevel: "Competitive",
                        keyCards: ["Thoughtseize", "Lightning Bolt", "Tarmogoyf", "Liliana of the Veil", "Dark Confidant"]
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Burn",
                        description: "Classic burn deck dealing damage directly to opponent's face.",
                        strategy: "Cast lightning bolts and lava spikes until opponent is dead.",
                        budget: "$200-300",
                        powerLevel: "Competitive",
                        keyCards: ["Lightning Bolt", "Lava Spike", "Rift Bolt", "Monastery Swiftspear", "Eidolon of the Great Revel"]
                    }]
                }
            },
            Green: {
                Combo: {
                    Intermediate: [{
                        name: "Amulet Titan",
                        description: "Ramp deck that can combo kill with Primeval Titan.",
                        strategy: "Use Amulet of Vigor to generate massive mana and cast Titans.",
                        budget: "$600-900",
                        powerLevel: "Competitive",
                        keyCards: ["Amulet of Vigor", "Primeval Titan", "Simic Growth Chamber", "Dryad of the Ilysian Grove", "Vesuva"]
                    }]
                }
            },
            Multicolor: {
                Combo: {
                    Advanced: [{
                        name: "Four-Color Creativity",
                        description: "Combo deck using Indomitable Creativity to cheat big threats into play.",
                        strategy: "Create tokens, sacrifice them with Creativity, and win with huge creatures.",
                        budget: "$700-1000",
                        powerLevel: "Competitive",
                        keyCards: ["Indomitable Creativity", "Hard Evidence", "Archon of Cruelty", "Omnath, Locus of Creation", "Teferi, Time Raveler"]
                    }]
                }
            }
        },
        
        // Pauper Recommendations (simplified)
        Pauper: {
            White: {
                Aggro: {
                    Beginner: [{
                        name: "White Weenie",
                        description: "Efficient white creatures with combat tricks.",
                        strategy: "Play cheap creatures and protect them with combat tricks.",
                        budget: "$20-40",
                        powerLevel: "Competitive",
                        keyCards: ["Thraben Inspector", "Kor Skyfisher", "Journey to Nowhere", "Battle Screech", "Guardians' Pledge"]
                    }]
                }
            },
            Blue: {
                Control: {
                    Beginner: [{
                        name: "Mono-Blue Delver",
                        description: "Tempo deck with cheap threats and counterspells.",
                        strategy: "Deploy Delver, flip it, and protect it while countering threats.",
                        budget: "$25-50",
                        powerLevel: "Competitive",
                        keyCards: ["Delver of Secrets", "Spellstutter Sprite", "Ninja of the Deep Hours", "Counterspell", "Snap"]
                    }]
                }
            },
            Black: {
                Control: {
                    Beginner: [{
                        name: "MBC (Mono-Black Control)",
                        description: "Control deck with excellent removal and card advantage.",
                        strategy: "Kill everything, generate card advantage, and win with creatures or drain.",
                        budget: "$30-60",
                        powerLevel: "Competitive",
                        keyCards: ["Chittering Rats", "Cuombajj Witches", "Sign in Blood", "Victim of Night", "Gray Merchant of Asphodel"]
                    }]
                }
            },
            Red: {
                Aggro: {
                    Beginner: [{
                        name: "Red Deck Wins",
                        description: "Fast red aggro with burn spells and hasty creatures.",
                        strategy: "Deal 20 damage as fast as possible with creatures and burn.",
                        budget: "$20-40",
                        powerLevel: "Competitive",
                        keyCards: ["Monastery Swiftspear", "Lightning Bolt", "Chain Lightning", "Fireblast", "Thermo-Alchemist"]
                    }]
                }
            },
            Green: {
                Ramp: {
                    Beginner: [{
                        name: "Elves",
                        description: "Elf tribal deck that generates lots of mana and creatures.",
                        strategy: "Play elves, make mana, and overwhelm with creatures.",
                        budget: "$35-70",
                        powerLevel: "Competitive",
                        keyCards: ["Llanowar Elves", "Priest of Titania", "Quirion Ranger", "Timberwatch Elf", "Distant Melody"]
                    }]
                }
            },
            Multicolor: {
                Midrange: {
                    Beginner: [{
                        name: "Boros Bully",
                        description: "Two-color midrange with efficient creatures and removal.",
                        strategy: "Play efficient threats and removal, win through combat.",
                        budget: "$40-70",
                        powerLevel: "Competitive",
                        keyCards: ["Kor Skyfisher", "Galvanic Blast", "Lightning Bolt", "Battle Screech", "Rally the Peasants"]
                    }]
                }
            }
        }
    };
    
    // Navigate through the database
    try {
        const formatDecks = deckDatabase[format];
        if (!formatDecks) return getDefaultRecommendation();
        
        const colorDecks = formatDecks[color];
        if (!colorDecks) return getDefaultRecommendation();
        
        const playstyleDecks = colorDecks[playstyle];
        if (!playstyleDecks) return getDefaultRecommendation();
        
        const difficultyDecks = playstyleDecks[difficulty];
        if (!difficultyDecks) return getDefaultRecommendation();
        
        return difficultyDecks;
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
        strategy: `Build a ${selections.playstyle} deck in ${selections.format} format using ${selections.color} colors. Focus on synergy and consistency.`,
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
        color: null,
        playstyle: null,
        difficulty: null
    };
    
    // Reset all selections
    document.querySelectorAll('.option-card, .color-option-card, .playstyle-card, .difficulty-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Go back to step 1
    showStep(1);
}

// Navigate back to main page
function goToMainPage() {
    window.location.href = 'index.html';
}
