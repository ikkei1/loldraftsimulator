const championPool = document.getElementById('champion-pool');
const bluePicks = document.getElementById('blue-picks');
const redPicks = document.getElementById('red-picks');
const blueBans = document.getElementById('blue-bans');
const redBans = document.getElementById('red-bans');
const blueProtects = document.getElementById('blue-protects');
const redProtects = document.getElementById('red-protects');
const blueFearlessBans = document.getElementById('blue-fearless-bans');
const redFearlessBans = document.getElementById('red-fearless-bans');
const searchInput = document.getElementById('search');

const banModeBtn = document.getElementById('banModeBtn');
const pickModeBtn = document.getElementById('pickModeBtn');

const teamToggleButton = document.getElementById('teamToggleButton');
const protectContainer = document.getElementById('protectContainer');
const fearlessBanContainer = document.getElementById('fearlessBanContainer');
const advancedSettingsContent = document.getElementById('advancedSettingsContent');

const protectModal = document.getElementById('protectModal');
const protectSlotsInput = document.getElementById('protectSlotsInput');
const fearlessBanModal = document.getElementById('fearlessBanModal');
const fearlessBanSlotsInput = document.getElementById('fearlessBanSlotsInput');


let selectedChampions = new Set();
let bannedChampions = new Set();
let protectedChampions = new Set();
let fearlessBannedChampions = new Set();

let allChampions = [];
let DDRAGON_VERSION = '14.13.1'; // Default version, will be updated dynamically

let currentMode = 'pick';
let currentTeam = 'blue';
let currentRoleFilter = 'All'; // New: Default role filter

let MAX_PICKS = 5;
let MAX_BANS = 5;
let MAX_PROTECTS = 0; // Default to 0, set by modal
let MAX_FEARLESS_BANS = 0; // Default to 0, set by modal

let draggedChampId = null;
let draggedFromSlot = null;

// New: Explicit champion role mapping based on user's provided lists
const championRoleMap = {
  'Top': [
    "Akali", "Amberssa", "Urgot", "Illaoi", "Irelia", "Udyr", "Wukong", "Aatrox", "Olaf", "Aurora", "Ornn",
    "Cassiopeia", "Camille", "KSante", "Garen", "Gangplank", "Quinn", "Kled", "Gwen", "Gragas", "Kayle", "Kennen",
    "Sion", "Sylas", "Zac", "Shen", "Singed", "Jayce", "Jax", "JarvanIV", "Smolder", "Sett", "TahmKench",
    "Darius", "ChoGath", "Teemo", "Trundle", "Tryndamere", "DrMundo", "Nasus", "Gnar", "Heimerdinger", "Pantheon",
    "Fiora", "Vladimir", "Volibear", "Poppy", "Maokai", "Malphite", "Mordekaiser", "Yasuo", "Yone", "Yorick",
    "Ryze", "Rumble", "Riven", "Renekton", "Rengar", "Warwick", "Varus", "Vayne"
  ],
  'Jungle': [
    "Ivern", "Amumu", "Evelynn", "Udyr", "Wukong", "Ekko", "Elise", "Karthus", "Khazix", "Qiyana", "Kindred",
    "Gwen", "Gragas", "Graves", "Kayn", "Zyra", "Zac", "Shaco", "XinZhao", "Jax", "JarvanIV", "Skarner",
    "Sejuani", "Zed", "Taliyah", "Talon", "Diana", "Trundle", "Naafiri", "Nidalee", "Nunu", "Nocturne",
    "Pantheon", "Fiddlesticks", "Briar", "Hecarim", "BelVeth", "Volibear", "Poppy", "MasterYi", "Rammus",
    "Lillia", "LeeSin", "RekSai", "Rengar", "Warwick", "Vi", "Viego"
  ],
  'Mid': [
    "Akali", "Akshan", "Azir", "Anivia", "Annie", "Amberssa", "Ahri", "Irelia", "Ekko", "Orianna", "AurelionSol",
    "Aurora", "Kassadin", "Cassiopeia", "Katarina", "Galio", "Qiyana", "Corki", "Sion", "Sylas", "Syndra",
    "Jayce", "Ziggs", "Swain", "Smolder", "Zed", "Xerath", "Zoe", "Taliyah", "Talon", "Diana", "TwistedFate",
    "Tristana", "Naafiri", "Neeko", "Nunu", "Pantheon", "Viktor", "Fizz", "Hwei", "Vladimir", "Veigar",
    "Malzahar", "Malphite", "Milio", "Yasuo", "Yone", "Ryze", "Lux", "Lissandra", "LeBlanc", "Renekton", "Vex"
  ],
  'Adc': [
    "Ashe", "Aphelios", "Ezreal", "KaiSa", "Cassiopeia", "Kalista", "Caitlyn", "KogMaw", "Corki", "Samira",
    "Xayah", "Sivir", "Ziggs", "Jhin", "Jinx", "Smolder", "Senna", "Zeri", "Twitch", "Tristana", "Draven",
    "Nilah", "MissFortune", "Milio", "Lucian", "Varus", "Vayne", "Yunara"
  ],
  'Support': [
    "Alistar", "Elise", "Karma", "Galio", "Gragas", "Sylas", "Zyra", "Zac", "Shen", "Shaco", "Janna",
    "Zilean", "Swain", "Thresh", "Senna", "Seraphine", "Xerath", "Sona", "Soraka", "Zoe", "TahmKench",
    "Taric", "Nami", "Neeko", "Nautilus", "Bard", "Pyke", "Pantheon", "Fiddlesticks", "Hwei", "Braum",
    "Brand", "Blitzcrank", "Poppy", "Maokai", "Milio", "Morgana", "Yuumi", "Rakan", "Lux", "LeBlanc",
    "Lulu", "Leona", "Renata", "Rell", "Velkoz"
  ]
};

async function getLatestDDragonVersion() {
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    DDRAGON_VERSION = versions[0]; // Get the latest version
    console.log('Latest DDragon version:', DDRAGON_VERSION);
  } catch (error) {
    console.error('Failed to fetch DDragon versions:', error);
    // Fallback to a known stable version if fetching fails
    DDRAGON_VERSION = '14.13.1'; 
  }
}

async function fetchChampions() {
  await getLatestDDragonVersion();
  try {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/ja_JP/champion.json`);
    const data = await response.json();
    allChampions = Object.values(data.data);
    initializeAllSlots();
    renderChampionPool();
  } catch (error) {
    console.error('Failed to fetch champion data:', error);
  }
}

function initializeAllSlots() {
  initializePickSlots();
  initializeBanSlots();
  initializeProtectSlots(MAX_PROTECTS);
  initializeFearlessBanSlots(MAX_FEARLESS_BANS);
  setMode(currentMode);
  updateTeamToggleButtonState();
}

function initializePickSlots() {
  bluePicks.innerHTML = '';
  redPicks.innerHTML = '';
  for (let i = 0; i < MAX_PICKS; i++) {
    bluePicks.appendChild(createPickDisplay('blue'));
    redPicks.appendChild(createPickDisplay('red'));
  }
  setupPickSlotsReordering();
}

function initializeBanSlots() {
  blueBans.innerHTML = '';
  redBans.innerHTML = '';
  for (let i = 0; i < MAX_BANS; i++) {
    blueBans.appendChild(createEmptyBanSlot('blue'));
    redBans.appendChild(createEmptyBanSlot('red'));
  }
}

function initializeProtectSlots(count) {
  blueProtects.innerHTML = '';
  redProtects.innerHTML = '';
  for (let i = 0; i < count; i++) {
    blueProtects.appendChild(createEmptyProtectSlot('blue'));
    redProtects.appendChild(createEmptyProtectSlot('red'));
  }
  protectContainer.style.display = count > 0 ? 'flex' : 'none';
}

function initializeFearlessBanSlots(count) {
  blueFearlessBans.innerHTML = '';
  redFearlessBans.innerHTML = '';
  for (let i = 0; i < count; i++) {
    blueFearlessBans.appendChild(createEmptyFearlessBanSlot('blue'));
    redFearlessBans.appendChild(createEmptyFearlessBanSlot('red'));
  }
  fearlessBanContainer.style.display = count > 0 ? 'flex' : 'none';
}

function createPickDisplay(team) {
  const pickDisplay = document.createElement('div');
  pickDisplay.classList.add('pick-display');
  pickDisplay.draggable = false; // Disable dragging on pickDisplay itself
  pickDisplay.dataset.team = team;

  const slot = createEmptySlot('pick', team);
  pickDisplay.appendChild(slot);

  const splashArt = document.createElement('img');
  splashArt.classList.add('splash-art');
  splashArt.onerror = () => { splashArt.style.display = 'none'; };
  pickDisplay.appendChild(splashArt);

  return pickDisplay;
}

function createEmptySlot(type, team = null) {
  const slot = document.createElement('div');
  slot.classList.add('slot');
  slot.dataset.type = type;
  if (team) {
      slot.dataset.team = team;
  }

  // Enable dragging from slots
  slot.addEventListener('dragstart', (e) => {
    const img = slot.querySelector('img');
    if (img && e.target === img) {
      draggedChampId = img.dataset.id;
      draggedFromSlot = slot;
      e.dataTransfer.effectAllowed = 'move';
      slot.classList.add('dragging');
      e.stopPropagation(); // Prevent parent from also initiating drag
    }
  });

  slot.addEventListener('dragend', (e) => {
    if (e.target.tagName === 'IMG') {
      slot.classList.remove('dragging');
      draggedChampId = null;
      draggedFromSlot = null;
    }
  });

  slot.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log('Drop event triggered', draggedChampId, draggedFromSlot);
    if (!draggedChampId) return;

    const champ = allChampions.find(c => c.id === draggedChampId);
    if (!champ) return;

    // If dragging from another slot, first remove from original slot
    if (draggedFromSlot) {
      const fromType = draggedFromSlot.dataset.type;
      if (fromType === 'pick') {
        unpickChampion(draggedChampId);
      } else if (fromType === 'ban') {
        unbanChampion(draggedChampId);
      } else if (fromType === 'protect') {
        unprotectChampion(draggedChampId);
      } else if (fromType === 'fearless-ban') {
        unbanFearlessChampion(draggedChampId);
      }
    }

    let success = false;
    if (slot.dataset.type === 'pick') {
        success = pickChampion(champ.id, champ.name, slot);
    } else if (slot.dataset.type === 'ban') {
        success = banChampion(champ.id, champ.name, slot);
    } else if (slot.dataset.type === 'protect') {
        success = protectChampion(champ.id, champ.name, slot);
    } else if (slot.dataset.type === 'fearless-ban') {
        success = banFearlessChampion(champ.id, champ.name, slot);
    }
    
    if (success) {
      // No automatic switching
    }
    draggedChampId = null;
    draggedFromSlot = null;
  });

  slot.addEventListener('click', (event) => {
    if (event.target.tagName === 'IMG') {
      const champId = event.target.dataset.id;
      const slotType = event.currentTarget.dataset.type;

      if (slotType === 'pick') {
        unpickChampion(champId);
      } else if (slotType === 'ban') {
        unbanChampion(champId);
      } else if (slotType === 'protect') {
        unprotectChampion(champId);
      } else if (slotType === 'fearless-ban') {
        unbanFearlessChampion(champId);
      }
    }
  });

  return slot;
}

function createEmptyBanSlot(team) {
  const slot = createEmptySlot('ban', team);
  return slot;
}

function createEmptyProtectSlot(team) {
  const slot = createEmptySlot('protect', team);
  return slot;
}

function createEmptyFearlessBanSlot(team) {
  const slot = createEmptySlot('fearless-ban', team);
  return slot;
}

// Initial fetch for champions
fetchChampions();

function renderChampionPool(filter = '') {
  championPool.innerHTML = '';
  const lowerFilter = filter.toLowerCase();

  allChampions
    .filter(champ => {
      const matchesSearch = (champ.name.includes(filter) || champ.id.toLowerCase().includes(lowerFilter));
      
      if (currentRoleFilter === 'All') {
        return matchesSearch;
      } else {
        const requiredChampions = championRoleMap[currentRoleFilter];
        if (!requiredChampions) {
          return false; // Role filter not yet defined/provided
        }
        // Check if the champion's ID is in the list for the selected role
        return matchesSearch && requiredChampions.includes(champ.id);
      }
    })
    .forEach(champ => {
      const div = document.createElement('div');
      div.classList.add('champion');
      div.title = champ.name;
      div.dataset.id = champ.id;
      
      // Add status classes based on champion state
      if (selectedChampions.has(champ.id)) {
        // Check which team picked this champion
        const bluePickElements = bluePicks.querySelectorAll('.slot img[data-id="' + champ.id + '"]');
        const redPickElements = redPicks.querySelectorAll('.slot img[data-id="' + champ.id + '"]');
        
        if (bluePickElements.length > 0) {
          div.classList.add('blue-picked');
        } else if (redPickElements.length > 0) {
          div.classList.add('red-picked');
        }
      }
      
      if (bannedChampions.has(champ.id)) {
        div.classList.add('banned');
      }
      
      if (protectedChampions.has(champ.id)) {
        // Check which team protected this champion
        const blueProtectElements = blueProtects.querySelectorAll('img[data-id="' + champ.id + '"]');
        const redProtectElements = redProtects.querySelectorAll('img[data-id="' + champ.id + '"]');
        
        if (blueProtectElements.length > 0) {
          div.classList.add('blue-protected');
        } else if (redProtectElements.length > 0) {
          div.classList.add('red-protected');
        }
      }
      
      if (fearlessBannedChampions.has(champ.id)) {
        div.classList.add('fearless-banned');
      }
      div.draggable = true;

      div.addEventListener('dragstart', (e) => {
        // Prevent dragging already selected/banned champions (but allow protected champions)
        if (selectedChampions.has(champ.id) || bannedChampions.has(champ.id) || 
            fearlessBannedChampions.has(champ.id)) {
          e.preventDefault();
          return;
        }
        draggedChampId = champ.id;
        e.dataTransfer.setData('text/plain', champ.id);
      });

      div.addEventListener('click', () => {
        // Prevent clicking on already selected/banned champions (but allow protected champions)
        if (selectedChampions.has(champ.id) || bannedChampions.has(champ.id) || 
            fearlessBannedChampions.has(champ.id)) {
          return;
        }
        
        let success = false;
        if (currentMode === 'ban') {
          let targetSlot = null;
          const targetBanSlots = currentTeam === 'blue' ? blueBans : redBans;
          let emptySlots = [...targetBanSlots.children].filter(slot => slot.childElementCount === 0);

          if (emptySlots.length > 0) {
              targetSlot = emptySlots[0];
              success = banChampion(champ.id, champ.name, targetSlot);
          } else { // If normal bans are full, try fearless bans if available
            const targetFearlessBanSlots = currentTeam === 'blue' ? blueFearlessBans : redFearlessBans;
            emptySlots = [...targetFearlessBanSlots.children].filter(slot => slot.childElementCount === 0);
            if (emptySlots.length > 0) {
              targetSlot = emptySlots[0];
              success = banFearlessChampion(champ.id, champ.name, targetSlot);
            }
          }
        } else if (currentMode === 'pick') {
          success = pickChampion(champ.id, champ.name);
        } else if (currentMode === 'protect') {
          let targetSlot = null;
          const targetProtectSlots = currentTeam === 'blue' ? blueProtects : redProtects;
          const emptySlots = [...targetProtectSlots.children].filter(slot => slot.childElementCount === 0);

          if (emptySlots.length > 0) {
              targetSlot = emptySlots[0];
          }

          if (!targetSlot) {
              return;
          }
          success = protectChampion(champ.id, champ.name, targetSlot);
        }

        if (success) {
          // No automatic switching
        }
      });

      div.innerHTML = `
        <img src="https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${champ.id}.png" />
        <div class="champion-name">${champ.name}</div>
        <div class="champion-eng-name">${champ.id}</div>
      `;

      championPool.appendChild(div);
    });
}

// New function: Filter by role
function filterByRole(role) {
  currentRoleFilter = role;
  // Update active state of role buttons
  document.querySelectorAll('.role-button').forEach(button => {
    if (button.dataset.role === role) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  renderChampionPool(searchInput.value);
}

function pickChampion(id, name, targetSlot = null) {
  let slotToUse = targetSlot;

  if (!slotToUse) {
    const targetPicks = currentTeam === 'blue' ? bluePicks : redPicks;
    const emptyPickDisplays = [...targetPicks.children].filter(pd => pd.querySelector('.slot').childElementCount === 0);

    if (emptyPickDisplays.length > 0) {
      slotToUse = emptyPickDisplays[0].querySelector('.slot');
    } else {
        return false;
    }
  }

  if (slotToUse.childElementCount > 0) {
      return false;
  }

  selectedChampions.add(id);

  const champImg = document.createElement('img');
  champImg.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
  champImg.title = name;
  champImg.width = 64;
  champImg.height = 64;
  champImg.dataset.id = id;
  champImg.draggable = true;
  // Reset any inline styles that might have been applied
  champImg.style.filter = '';
  champImg.style.opacity = '';

  slotToUse.appendChild(champImg);

  let pickDisplayParent = slotToUse.closest('.pick-display');
  if (pickDisplayParent) {
    const splashArt = pickDisplayParent.querySelector('.splash-art');
    splashArt.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_0.jpg`;
    splashArt.style.display = 'block';
  }
  renderChampionPool(searchInput.value);
  return true;
}

function unpickChampion(id) {
  selectedChampions.delete(id);

  const allPickDisplays = [...bluePicks.children, ...redPicks.children];
  allPickDisplays.forEach(pickDisplay => {
    const slot = pickDisplay.querySelector('.slot');
    const champImg = slot.querySelector(`img[data-id="${id}"]`);
    if (champImg) {
      slot.removeChild(champImg);
      const splashArt = pickDisplay.querySelector('.splash-art');
      splashArt.src = '';
      splashArt.style.display = 'none';
    }
  });

  renderChampionPool(searchInput.value);
}

function banChampion(id, name, targetSlot = null) {
  let slotToUse = targetSlot;
  let targetContainer;
  targetContainer = currentTeam === 'blue' ? blueBans : redBans;

  if (!slotToUse) {
    const emptySlots = [...targetContainer.children].filter(slot => slot.childElementCount === 0);
    if (emptySlots.length > 0) {
      slotToUse = emptySlots[0];
    } else {
        return false;
    }
  }

  if (slotToUse.childElementCount > 0) {
      return false;
  }

  bannedChampions.add(id);

  const champImg = document.createElement('img');
  champImg.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
  champImg.title = name;
  champImg.width = 50;
  champImg.height = 50;
  champImg.dataset.id = id;
  champImg.draggable = true;

  slotToUse.appendChild(champImg);

  slotToUse.classList.add('normal-banned');
  renderChampionPool(searchInput.value);
  return true;
}

function unbanChampion(id) {
  bannedChampions.delete(id);

  const allBanContainers = [blueBans, redBans];

  for (const container of allBanContainers) {
    const slots = container.children;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const champImg = slot.querySelector(`img[data-id="${id}"]`);
      if (champImg) {
        slot.removeChild(champImg);
        slot.classList.remove('normal-banned');
        renderChampionPool(searchInput.value);
        return;
      }
    }
  }
}

function protectChampion(id, name, targetSlot = null) {
  let slotToUse = targetSlot;
  let targetContainer;
  targetContainer = currentTeam === 'blue' ? blueProtects : redProtects;

  if (!slotToUse) {
    const emptySlots = [...targetContainer.children].filter(slot => slot.childElementCount === 0);
    if (emptySlots.length > 0) {
      slotToUse = emptySlots[0];
    } else {
        return false;
    }
  }

  if (slotToUse.childElementCount > 0) {
      return false;
  }

  protectedChampions.add(id);

  const champImg = document.createElement('img');
  champImg.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
  champImg.title = name;
  champImg.width = 64;
  champImg.height = 64;
  champImg.dataset.id = id;
  champImg.draggable = true;
  // Reset any inline styles that might have been applied
  champImg.style.filter = '';
  champImg.style.opacity = '';

  slotToUse.appendChild(champImg);
  renderChampionPool(searchInput.value);
  return true;
}

function unprotectChampion(id) {
  protectedChampions.delete(id);

  const allProtectContainers = [blueProtects, redProtects];

  for (const container of allProtectContainers) {
    const slots = container.children;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const champImg = slot.querySelector(`img[data-id="${id}"]`);
      if (champImg) {
        slot.removeChild(champImg);
        renderChampionPool(searchInput.value);
        return;
      }
    }
  }
}

function banFearlessChampion(id, name, targetSlot = null) {
  let slotToUse = targetSlot;
  let targetContainer;
  targetContainer = currentTeam === 'blue' ? blueFearlessBans : redFearlessBans;

  if (!slotToUse) {
    const emptySlots = [...targetContainer.children].filter(slot => slot.childElementCount === 0);
    if (emptySlots.length > 0) {
      slotToUse = emptySlots[0];
    } else {
        return false;
    }
  }

  if (slotToUse.childElementCount > 0) {
      return false;
  }

  fearlessBannedChampions.add(id);

  const champImg = document.createElement('img');
  champImg.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
  champImg.title = name;
  champImg.width = 64;
  champImg.height = 64;
  champImg.dataset.id = id;
  champImg.draggable = true;

  slotToUse.appendChild(champImg);
  renderChampionPool(searchInput.value);
  return true;
}

function unbanFearlessChampion(id) {
  fearlessBannedChampions.delete(id);

  const allFearlessBanContainers = [blueFearlessBans, redFearlessBans];

  for (const container of allFearlessBanContainers) {
    const slots = container.children;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const champImg = slot.querySelector(`img[data-id="${id}"]`);
      if (champImg) {
        slot.removeChild(champImg);
        renderChampionPool(searchInput.value);
        return;
      }
    }
  }
}

function resetDraft() {
  selectedChampions.clear();
  bannedChampions.clear();
  protectedChampions.clear();
  fearlessBannedChampions.clear();

  // Reset MAX_PROTECTS and MAX_FEARLESS_BANS to 0 before re-initializing
  MAX_PROTECTS = 0;
  MAX_FEARLESS_BANS = 0;

  initializeAllSlots(); // This will re-render with 0 protect/fearless ban slots
  setMode('pick');
  currentTeam = 'blue';
  teamToggleButton.checked = false;
  updateTeamToggleButtonState();
  filterByRole('All'); // Reset role filter on reset
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.controls button').forEach(button => {
    button.classList.remove('active');
  });

  if (mode === 'pick') {
    pickModeBtn.classList.add('active');
  } else if (mode === 'ban') {
    banModeBtn.classList.add('active');
  }
  
  renderChampionPool(searchInput.value);
}

function updateTeamToggleButtonState() {
  currentTeam = teamToggleButton.checked ? 'red' : 'blue';
  renderChampionPool(searchInput.value);
}

function toggleAdvancedSettings() {
  advancedSettingsContent.classList.toggle('show');
}

// Modal Functions
function openProtectModal() {
  protectSlotsInput.value = MAX_PROTECTS;
  protectModal.showModal();
}

function setProtectSlots() {
  const count = parseInt(protectSlotsInput.value);
  if (isNaN(count) || count < 0) {
    alert('有効な数字を入力してください。');
    return;
  }
  MAX_PROTECTS = count;
  initializeProtectSlots(MAX_PROTECTS);
  protectModal.close();
  renderChampionPool(searchInput.value);
}

function openFearlessBanModal() {
  fearlessBanSlotsInput.value = MAX_FEARLESS_BANS;
  fearlessBanModal.showModal();
}

function setFearlessBanSlots() {
  const count = parseInt(fearlessBanSlotsInput.value);
  if (isNaN(count) || count < 0) {
    alert('有効な数字を入力してください。');
    return;
  }
  MAX_FEARLESS_BANS = count;
  initializeFearlessBanSlots(MAX_FEARLESS_BANS);
  fearlessBanModal.close();
  renderChampionPool(searchInput.value);
}


searchInput.addEventListener('input', () => {
  renderChampionPool(searchInput.value);
});

teamToggleButton.addEventListener('change', updateTeamToggleButtonState);

let draggedPickDisplay = null;

function setupPickSlotsReordering() {
  const setupDragAndDrop = (picksContainer) => {
    const pickDisplays = picksContainer.children;
    
    for (let i = 0; i < pickDisplays.length; i++) {
      const pickDisplay = pickDisplays[i];
      pickDisplay.draggable = true; // Enable dragging for reordering
      
      pickDisplay.addEventListener('dragstart', (e) => {
        const slot = pickDisplay.querySelector('.slot');
        const img = slot ? slot.querySelector('img') : null;
        // Only handle reordering if dragging starts on the pickDisplay itself (not on the image)
        if (e.target === pickDisplay && slot && slot.childElementCount > 0) {
          draggedPickDisplay = pickDisplay;
          e.dataTransfer.effectAllowed = 'move';
          pickDisplay.classList.add('dragging');
        } else if (e.target !== img) {
          e.preventDefault();
        }
      });
      
      pickDisplay.addEventListener('dragend', () => {
        pickDisplay.classList.remove('dragging');
        draggedPickDisplay = null;
      });
      
      pickDisplay.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedPickDisplay || draggedPickDisplay === pickDisplay) return;
        
        const afterElement = getDragAfterElement(picksContainer, e.clientY);
        if (afterElement === null) {
          picksContainer.appendChild(draggedPickDisplay);
        } else {
          picksContainer.insertBefore(draggedPickDisplay, afterElement);
        }
      });
    }
  };
  
  setupDragAndDrop(bluePicks);
  setupDragAndDrop(redPicks);
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.pick-display:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener('DOMContentLoaded', () => {
  updateTeamToggleButtonState();
  filterByRole('All'); // Set initial active state for "All" button
});