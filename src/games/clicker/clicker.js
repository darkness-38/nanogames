// Shrek Clicker Port
// Exact logic from shrekClicker/game.js, wrapped for NanoGames

export function initClicker(container) {
    // 1. Inject Exact HTML structure
    container.innerHTML = `
    <!-- Shrek Gerçekleri Ticker -->
    <div class="ticker-wrap">
        <div class="ticker">
            <div class="ticker__item" id="fact-text">Shrek aslında Yiddish dilinde "korku" anlamına gelir! 🧅</div>
        </div>
    </div>

    <div class="game-container script-container" style="margin-top: 60px;">
        <!-- Sol Panel: Tıklama ve Puan -->
        <div class="click-section">
            <div class="score-container">
                <h1 id="score">0</h1>
                <p>Soğan</p>
                <p class="cps-display">saniyede: <span id="cps">0</span></p>
            </div>

            <div class="click-area">
                <button id="click-btn" class="shrek-btn">
                    <div class="shrek-face">👹</div>
                </button>
            </div>
        </div>

        <!-- Sağ Panel: Yükseltmeler ve Başarımlar -->
        <div class="right-panel">
            <div class="tabs">
                <button class="tab-btn active shrek-tab" data-tab="upgrades">Yükseltmeler</button>
                <button class="tab-btn shrek-tab" data-tab="click-upgrades">Güçlendirmeler</button>
                <button class="tab-btn shrek-tab" data-tab="achievements">Başarımlar</button>
            </div>

            <div id="upgrades-section" class="panel-content active">
                <div id="upgrades-container" class="upgrades-list">
                    <!-- Pasif Yükseltmeler JS ile buraya eklenecek -->
                </div>
            </div>

            <div id="click-upgrades-section" class="panel-content" style="display: none;">
                <div id="click-upgrades-container" class="upgrades-list">
                    <!-- Tıklama Yükseltmeleri JS ile buraya eklenecek -->
                </div>
            </div>

            <div id="achievements-section" class="panel-content" style="display: none;">
                <div id="achievements-container" class="achievements-list">
                    <!-- Başarımlar JS ile buraya eklenecek -->
                </div>
            </div>
        </div>
    </div>

    <!-- Başarım Bildirimi -->
    <div id="achievement-notification" class="achievement-notification hidden">
        <div class="icon">🏆</div>
        <div class="text">
            <h4>Başarım Kazanıldı!</h4>
            <p id="achievement-text">Örnek Başarım</p>
        </div>
    </div>

    <!-- Ateş Böcekleri Konteyneri -->
    <div id="fireflies-container"></div>

    <!-- Kaydet Butonu -->
    <button id="save-btn" class="save-btn">💾 Kaydet</button>

    <div class="footer">Shrek Clicker v1.0 - Made with ❤️ for Ogre Lovers</div>
  `;

    // 2. Logic (Scoped)
    let score = 0;
    let clickPower = 1;
    let passiveIncome = 0;
    let totalClicks = 0;
    let running = true;
    let gameLoopInterval, uiInterval, tickerInterval, goldenOnionTimeout;

    // DOM Refs (scoped to container if possible, or global document if IDs are unique)
    // Since we use exact IDs from original, we can access them via document.getElementById inside the container
    // BUT we must be careful about cleanup.

    const scoreElement = container.querySelector('#score');
    const cpsElement = container.querySelector('#cps');
    const clickBtn = container.querySelector('#click-btn');
    const upgradesContainer = container.querySelector('#upgrades-container');
    const clickUpgradesContainer = container.querySelector('#click-upgrades-container');
    const achievementsContainer = container.querySelector('#achievements-container');
    const notification = container.querySelector('#achievement-notification');
    const notificationText = container.querySelector('#achievement-text');
    const tickerText = container.querySelector('#fact-text');
    const firefliesContainer = container.querySelector('#fireflies-container');
    const saveBtn = container.querySelector('#save-btn');

    // Data
    const upgrades = [
        { id: 'onion', name: 'Soğan', type: 'cps', baseCost: 25, currentCost: 25, power: 0.2, count: 0, icon: '🧅' },
        { id: 'strong_finger', name: 'Güçlü Parmak', type: 'click', baseCost: 100, currentCost: 100, power: 0.5, count: 0, icon: '👆' },
        { id: 'donkey', name: 'Eşek', type: 'cps', baseCost: 250, currentCost: 250, power: 1.5, count: 0, icon: '🐴' },
        { id: 'ogre_fist', name: 'Ogre Yumruğu', type: 'click', baseCost: 500, currentCost: 500, power: 1.5, count: 0, icon: '👊' },
        { id: 'gingerbread', name: 'Kurabiye Adam', type: 'cps', baseCost: 750, currentCost: 750, power: 4, count: 0, icon: '🍪' },
        { id: 'swamp', name: 'Bataklık', type: 'cps', baseCost: 2500, currentCost: 2500, power: 10, count: 0, icon: '🏞️' },
        { id: 'club', name: 'Dev Sopa', type: 'click', baseCost: 3500, currentCost: 3500, power: 5, count: 0, icon: '🪵' },
        { id: 'dragon', name: 'Ejderha', type: 'cps', baseCost: 10000, currentCost: 10000, power: 30, count: 0, icon: '🐉' },
        { id: 'fiona', name: 'Prenses Fiona', type: 'cps', baseCost: 40000, currentCost: 40000, power: 100, count: 0, icon: '👸' },
        { id: 'castle', name: 'Farquaad\'ın Kalesi', type: 'cps', baseCost: 200000, currentCost: 200000, power: 250, count: 0, icon: '🏰' },
        { id: 'magic_mirror', name: 'Sihirli Ayna', type: 'cps', baseCost: 50000, currentCost: 50000, power: 150, count: 0, icon: '🪞' },
        { id: 'puss_in_boots', name: 'Çizmeli Kedi', type: 'cps', baseCost: 150000, currentCost: 150000, power: 400, count: 0, icon: '😼' },
        { id: 'fairy_godmother', name: 'İyilik Perisi', type: 'cps', baseCost: 500000, currentCost: 500000, power: 1200, count: 0, icon: '🧚‍♀️' },
        { id: 'far_far_away', name: 'Uzaklardaki Krallık', type: 'cps', baseCost: 2000000, currentCost: 2000000, power: 5000, count: 0, icon: '🏰' },
        { id: 'mud_bath', name: 'Çamur Banyosu', type: 'click', baseCost: 7500, currentCost: 7500, power: 20, count: 0, icon: '🛁' },
        { id: 'roar_training', name: 'Kükreme Eğitimi', type: 'click', baseCost: 25000, currentCost: 25000, power: 50, count: 0, icon: '🗣️' },
        { id: 'ogre_strength', name: 'Ogre Gücü', type: 'click', baseCost: 100000, currentCost: 100000, power: 200, count: 0, icon: '💪' },
        { id: 'love_potion', name: 'Aşk İksiri', type: 'click', baseCost: 1000000, currentCost: 1000000, power: 1000, count: 0, icon: '🧪' }
    ];

    const achievements = [
        { id: 'first_click', name: 'İlk Adım', desc: 'İlk soğanını tıkla.', reward: 10, condition: () => totalClicks >= 1, unlocked: false, icon: '👆' },
        { id: 'onion_lover', name: 'Soğan Aşığı', desc: '100 soğan biriktir.', reward: 100, condition: () => score >= 100, unlocked: false, icon: '🧅' },
        { id: 'donkey_friend', name: 'Eşek Dostu', desc: 'Bir Eşek satın al.', reward: 200, condition: () => upgrades.find(u => u.id === 'donkey').count >= 1, unlocked: false, icon: '🐴' },
        { id: 'click_master', name: 'Tıklama Ustası', desc: '1000 kez tıkla.', reward: 500, condition: () => totalClicks >= 1000, unlocked: false, icon: '🖱️' },
        { id: 'rich_ogre', name: 'Zengin Ogre', desc: '10,000 soğan biriktir.', reward: 1000, condition: () => score >= 10000, unlocked: false, icon: '💰' },
        { id: 'swamp_king', name: 'Bataklık Kralı', desc: 'Saniyede 100 soğan kazan.', reward: 2000, condition: () => passiveIncome >= 100, unlocked: false, icon: '👑' },
        { id: 'power_clicker', name: 'Güçlü Tıklayıcı', desc: 'Tıklama gücünü 10 yap.', reward: 1500, condition: () => clickPower >= 10, unlocked: false, icon: '💪' },
        { id: 'safe_keeper', name: 'Güvenli Liman', desc: 'Oyunu ilk kez manuel kaydet.', reward: 5, condition: () => false, unlocked: false, icon: '💾' }
    ];

    const randomFacts = [
        "Bal, bozulmayan tek gıdadır. 🍯",
        "Ahtapotların üç kalbi vardır. 🐙",
        "Çilek aslında bir meyve değil, bir çiçektir. 🍓",
        "Zürafaların ses telleri yoktur. 🦒",
        "Bir gün Venüs'te bir yıldan daha uzundur. 🪐",
        "İnsan DNA'sı %50 oranında muz DNA'sı ile aynıdır. 🍌",
        "Shrek aslında Yiddish dilinde 'korku' anlamına gelir! 🧅",
        "Dünyadaki karıncaların toplam ağırlığı, insanlarınkine eşittir. 🐜",
        "Su aygırları su altında uyuyabilirler. 🦛",
        "Kangurular geri geri yürüyemezler. 🦘",
        "Kutup ayılarının derisi siyahtır. 🐻‍❄️",
        "Bir bulutun ağırlığı 500 tona ulaşabilir. ☁️"
    ];

    const milestones = [
        { score: 1000, reached: false, event: 'onion_rain', message: "1,000 Soğan! Soğan Yağmuru Başlıyor!" },
        { score: 10000, reached: false, event: 'ogre_roar', message: "10,000 Soğan! Ogre Kükremesi!" },
        { score: 50000, reached: false, event: 'swamp_party', message: "50,000 Soğan! Bataklık Partisi!" }
    ];

    // Logic Functions
    function updateUI() {
        if (!running) return;
        if (scoreElement) scoreElement.innerText = Math.floor(score);
        if (cpsElement) cpsElement.innerText = passiveIncome.toFixed(1);

        // Update Title logic? Maybe not needed for embedded game.
        // document.title = `${Math.floor(score)} Soğan - Shrek Clicker`;
    }

    function renderUpgrades() {
        if (!upgradesContainer || !clickUpgradesContainer) return;
        upgradesContainer.innerHTML = '';
        clickUpgradesContainer.innerHTML = '';

        upgrades.forEach((upgrade, index) => {
            const card = document.createElement('div');
            card.className = `upgrade-card disabled ${upgrade.type}-upgrade`;
            card.id = `upgrade-${index}`;
            card.onclick = () => buyUpgrade(index);

            const powerText = upgrade.type === 'cps' ? `+${upgrade.power}/sn` : `+${upgrade.power} Tık`;
            const typeColor = upgrade.type === 'cps' ? '#666' : '#d84315';

            card.innerHTML = `
              <div class="upgrade-icon" style="font-size: 2.5rem; margin-right: 15px;">${upgrade.icon}</div>
              <div class="upgrade-info" style="flex: 1;">
                  <h3>${upgrade.name}</h3>
                  <p class="upgrade-cost">${Math.floor(upgrade.currentCost)} 🧅</p>
                  <p style="font-size: 0.8rem; color: ${typeColor}; font-weight: bold;">${powerText}</p>
              </div>
              <div class="upgrade-count" id="count-${index}">${upgrade.count}</div>
          `;

            if (upgrade.type === 'cps') {
                upgradesContainer.appendChild(card);
            } else {
                clickUpgradesContainer.appendChild(card);
            }
        });
    }

    function renderAchievements() {
        if (!achievementsContainer) return;
        achievementsContainer.innerHTML = '';
        achievements.forEach(ach => {
            const card = document.createElement('div');
            card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
            card.id = `ach-${ach.id}`;

            let progress = ach.unlocked ? 100 : 0;
            if (!ach.unlocked) {
                if (ach.id === 'first_click') progress = (totalClicks / 1) * 100;
                if (ach.id === 'click_master') progress = (totalClicks / 1000) * 100;
                if (ach.id === 'onion_lover') progress = (score / 100) * 100;
                if (ach.id === 'rich_ogre') progress = (score / 10000) * 100;
            }
            progress = Math.min(100, Math.max(0, progress));

            card.innerHTML = `
              <div class="achievement-icon">${ach.icon}</div>
              <div class="achievement-info" style="width: 100%;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                      <h3>${ach.name}</h3>
                      <span style="font-size: 0.7rem; color: #888;">${Math.floor(progress)}%</span>
                  </div>
                  <p class="achievement-desc">${ach.desc}</p>
                  <div class="progress-bar-bg">
                      <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                  </div>
                  <p style="font-size: 0.8rem; color: #ff9800; font-weight: bold; margin-top: 5px;">Ödül: ${ach.reward} 🧅</p>
              </div>
          `;
            achievementsContainer.appendChild(card);
        });
    }

    function buyUpgrade(index) {
        if (!running) return;
        const upgrade = upgrades[index];
        if (score >= upgrade.currentCost) {
            score -= upgrade.currentCost;
            upgrade.count++;

            if (upgrade.type === 'cps') {
                passiveIncome += upgrade.power;
            } else if (upgrade.type === 'click') {
                clickPower += upgrade.power;
            }

            upgrade.currentCost = Math.ceil(upgrade.currentCost * 1.15);

            updateUI();
            renderUpgrades();
            checkAchievements();
        }
    }

    function checkAchievements() {
        if (!running) return;
        let newUnlock = false;
        achievements.forEach(ach => {
            if (!ach.unlocked && ach.condition()) {
                ach.unlocked = true;
                score += ach.reward;
                showNotification(ach.name, ach.reward);
                newUnlock = true;
            }
        });
        if (newUnlock) renderAchievements();
    }

    function showNotification(name, reward) {
        if (!notification || !notificationText) return;
        notificationText.innerHTML = `${name}<br><span style="font-size: 0.8rem; color: #ffd700;">+${reward} Soğan</span>`;
        notification.classList.remove('hidden');
        setTimeout(() => {
            if (notification) notification.classList.add('hidden');
        }, 3000);
    }

    function checkUpgradeAvailability() {
        if (!running) return;
        upgrades.forEach((upgrade, index) => {
            const card = container.querySelector(`#upgrade-${index}`);
            if (card) {
                if (score >= upgrade.currentCost) {
                    card.classList.remove('disabled');
                } else {
                    card.classList.add('disabled');
                }
            }
        });
    }

    function createClickEffect(e) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.innerText = `+${Math.floor(clickPower)}`;

        // Fix positioning relative to viewport vs container
        // Using e.clientX/Y is correct for 'fixed' positioned elements

        const x = e.clientX;
        const y = e.clientY;
        const randomX = (Math.random() - 0.5) * 60;

        effect.style.left = `${x + randomX}px`;
        effect.style.top = `${y - 40}px`;

        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 800);

        createParticleEffect(e);
    }

    function createParticleEffect(e) {
        const particleCount = 5 + Math.floor(Math.random() * 5);
        const icons = ['🧅', '✨', '💚'];
        const x = e.clientX;
        const y = e.clientY;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.innerText = icons[Math.floor(Math.random() * icons.length)];

            const angle = Math.random() * Math.PI * 2;
            const velocity = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    function updateTicker() {
        if (!tickerText) return;
        const randomFact = randomFacts[Math.floor(Math.random() * randomFacts.length)];
        tickerText.innerText = randomFact;
    }

    function createFireflies() {
        if (!firefliesContainer) return;
        const fireflyCount = 20;

        for (let i = 0; i < fireflyCount; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';

            const startY = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = 15 + Math.random() * 10;

            firefly.style.top = `${startY}vh`;
            firefly.style.left = `-${Math.random() * 10}vw`;
            firefly.style.animationDuration = `${duration}s`;
            firefly.style.animationDelay = `${delay}s`;

            firefliesContainer.appendChild(firefly);
        }
    }

    // Golden Onion Logic
    function spawnGoldenOnion() {
        if (!running) return;
        const onion = document.createElement('div');
        onion.className = 'golden-onion';
        onion.innerText = '🧅';

        // Rastgele Konum
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        onion.style.left = `${x}px`;
        onion.style.top = `${y}px`;

        onion.onclick = () => {
            const reward = Math.max(500, passiveIncome * 60);
            score += reward;
            showNotification("Altın Soğan Yakalandı!", Math.floor(reward));
            createParticleEffect({ clientX: x + 20, clientY: y + 20 });
            updateUI();
            onion.remove();
        };

        document.body.appendChild(onion);
        setTimeout(() => { if (document.body.contains(onion)) onion.remove(); }, 10000);
        scheduleNextGoldenOnion();
    }

    function scheduleNextGoldenOnion() {
        if (!running) return;
        const minTime = 30000; // Debug faster: 30s
        const maxTime = 60000;
        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        goldenOnionTimeout = setTimeout(spawnGoldenOnion, randomTime);
    }

    // --- Saves ---
    // Using localStorage for simplicity in this port instead of IndexedDB to avoid complexity/conflicts
    // But mimicing the data structure
    function saveGame() {
        if (!running) return;
        const data = { score, clickPower, passiveIncome, totalClicks, upgrades, achievements };
        localStorage.setItem('shrek_clicker_save', JSON.stringify(data));
        showNotification("Oyun Kaydedildi", 0);
    }

    function loadGame() {
        const raw = localStorage.getItem('shrek_clicker_save');
        if (raw) {
            try {
                const data = JSON.parse(raw);
                score = data.score || 0;
                clickPower = data.clickPower || 1;
                passiveIncome = data.passiveIncome || 0;
                totalClicks = data.totalClicks || 0;
                if (data.upgrades) {
                    data.upgrades.forEach((u, i) => { if (upgrades[i]) { upgrades[i].count = u.count; upgrades[i].currentCost = u.currentCost; } });
                }
                if (data.achievements) {
                    data.achievements.forEach((a) => {
                        const match = achievements.find(local => local.id === a.id);
                        if (match) match.unlocked = a.unlocked;
                    });
                }
            } catch (e) { }
        }
    }

    // --- INIT ---
    loadGame();
    renderUpgrades();
    renderAchievements();
    updateUI();
    updateTicker();
    createFireflies();
    scheduleNextGoldenOnion();

    // Listeners
    clickBtn.onclick = (e) => {
        score += clickPower;
        totalClicks++;
        createClickEffect(e);
        updateUI();
        checkAchievements();
    };

    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tabName = btn.dataset.tab;
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            container.querySelectorAll('.panel-content').forEach(p => p.style.display = 'none');
            if (tabName === 'upgrades') container.querySelector('#upgrades-section').style.display = 'block';
            else if (tabName === 'click-upgrades') container.querySelector('#click-upgrades-section').style.display = 'block';
            else if (tabName === 'achievements') container.querySelector('#achievements-section').style.display = 'block';
        };
    });

    saveBtn.onclick = () => {
        // Manual save achievement logic
        const ach = achievements.find(a => a.id === 'safe_keeper');
        if (ach && !ach.unlocked) {
            ach.unlocked = true;
            score += ach.reward;
            showNotification(ach.name, ach.reward);
            renderAchievements();
            updateUI();
        }
        saveGame();
    };

    // Intervals
    gameLoopInterval = setInterval(() => {
        if (!running) return;
        score += passiveIncome;
        updateUI();
        checkAchievements();
        // Milestones check
        milestones.forEach(ms => {
            if (!ms.reached && score >= ms.score) {
                ms.reached = true;
                showNotification(ms.message, 0);
            }
        });
    }, 1000);

    uiInterval = setInterval(() => {
        if (!running) return;
        checkUpgradeAvailability();
    }, 100);

    tickerInterval = setInterval(updateTicker, 15000);

    // Cleanup
    return () => {
        running = false;
        clearInterval(gameLoopInterval);
        clearInterval(uiInterval);
        clearInterval(tickerInterval);
        clearTimeout(goldenOnionTimeout);
        saveGame();
        // Remove global elements attached to body
        document.querySelectorAll('.click-effect, .particle, .golden-onion, .falling-onion').forEach(e => e.remove());
        container.innerHTML = '';
    };
}
