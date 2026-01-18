let gameState = {
    totalRuns: 0, wickets: 0, ballsInOver: 0, totalOvers: 0, maxOvers: 20,
    striker: { name: "", runs: 0, balls: 0, status: 'active', entryOrder: 1, returnOverLimit: null },
    nonStriker: { name: "", runs: 0, balls: 0, status: 'active', entryOrder: 2, returnOverLimit: null },
    currentBowler: "", retireLimit: 13, ballHistory: [], playerEntryCount: 2, playersPerTeam: 13
};

const retireRules = { 8: 21, 9: 18, 10: 16, 11: 15, 12: 14, 13: 13 };

function startGame() {
    gameState.playersPerTeam = parseInt(document.getElementById('player-count').value);
    gameState.retireLimit = retireRules[gameState.playersPerTeam];
    gameState.maxOvers = parseInt(document.getElementById('match-overs').value);
    gameState.currentBowler = document.getElementById('bowler-name').value.trim();
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('scoring-screen').style.display = 'grid';
    recalculateTotals();
}

function startSecondInnings() {
    if (confirm("Reset for next innings? History is preserved.")) {
        document.getElementById('scoring-screen').style.display = 'none';
        document.getElementById('setup-screen').style.display = 'block';
    }
}

function addBall(runs, type, wicketData = null) {
    const isLastOver = (gameState.totalOvers === gameState.maxOvers - 1);
    let physBalls = 0;
    for (let i = gameState.ballHistory.length - 1; i >= 0; i--) {
        if (gameState.ballHistory[i].overEnd) break;
        if (gameState.ballHistory[i].event === 'ball') physBalls++;
    }
    let isLegal = true;
    if ((type === 'wide' || type === 'noball') && isLastOver && physBalls < 6) isLegal = false;

    gameState.ballHistory.push({
        event: 'ball', runs: runs, type: type,
        batter: gameState.striker.name, bowler: gameState.currentBowler,
        isLegal: isLegal, wicket: wicketData, zone: null, overEnd: false
    });
    
    recalculateTotals();
    
    if (runs > 0) openFieldModal();
    checkRetirementAuto();
}

function checkRetirementAuto() {
    const s = gameState.striker;
    // Check if enough players are left to force a retirement
    const activeOrRetired = Object.values(gameState.allBatters).filter(p => p.status === 'active' || p.status === 'retired').length;
    const inShed = gameState.playersPerTeam - Object.values(gameState.allBatters).length;
    
    if (s.returnOverLimit === null && s.balls >= gameState.retireLimit && (activeOrRetired + inShed > 2)) {
        setTimeout(() => {
            alert(`${s.name} has hit the ${gameState.retireLimit} ball limit.`);
            retireBatter();
        }, 400);
    }
}

function recalculateTotals() {
    gameState.totalRuns = 0; gameState.wickets = 0; gameState.totalOvers = 0; gameState.ballsInOver = 0;
    let batters = {}, bowlers = {}, overEndedOnLastBall = false;
    const b1 = document.getElementById('p1-name').value, b2 = document.getElementById('p2-name').value;
    
    batters[b1] = { name: b1, runs: 0, balls: 0, entryOrder: 1, status: 'active', returnOverLimit: null };
    batters[b2] = { name: b2, runs: 0, balls: 0, entryOrder: 2, status: 'active', returnOverLimit: null };
    
    let curS = b1, curNS = b2, phys = 0;

    gameState.ballHistory.forEach((item, index) => {
        item.overEnd = false;
        if (item.event === 'manual_swap') { [curS, curNS] = [curNS, curS]; return; }
        
        if (item.event === 'new_batter') {
            if (!batters[item.name]) batters[item.name] = { name: item.name, runs: 0, balls: 0, entryOrder: item.entryOrder, status: 'active', returnOverLimit: null };
            else { batters[item.name].status = 'active'; batters[item.name].returnOverLimit = gameState.totalOvers + 4; }
            curS = item.name; return;
        }

        if (item.event === 'retire') { batters[item.batter].status = 'retired'; return; }

        if (item.event === 'ball') {
            gameState.totalRuns += item.runs;
            if (item.type === 'wicket') { 
                gameState.wickets++; batters[item.batter].status = 'out'; 
                if (item.wicket && item.wicket.next) {
                    const n = item.wicket.next;
                    if (!batters[n]) batters[n] = { name: n, runs: 0, balls: 0, entryOrder: 99, status: 'active', returnOverLimit: null };
                    curS = n;
                }
            }
            if (!bowlers[item.bowler]) bowlers[item.bowler] = { name: item.bowler, runs: 0, wickets: 0, balls: 0 };
            bowlers[item.bowler].runs += item.runs;
            if (item.type === 'wicket') bowlers[item.bowler].wickets++;
            
            phys++;
            if (!batters[item.batter]) batters[item.batter] = { name: item.batter, runs: 0, balls: 0, status: 'active', returnOverLimit: null };
            batters[item.batter].balls++;
            if (['normal','wicket','byes','legbyes'].includes(item.type)) batters[item.batter].runs += item.runs;
            if (item.runs % 2 !== 0) [curS, curNS] = [curNS, curS];

            let end = false;
            if (item.isLegal) { gameState.ballsInOver++; bowlers[item.bowler].balls++; if (gameState.ballsInOver === 6) end = true; }
            if (phys >= 8) end = true;

            if (end) {
                item.overEnd = true; gameState.totalOvers++; gameState.ballsInOver = 0; phys = 0; [curS, curNS] = [curNS, curS];
                if (index === gameState.ballHistory.length - 1) overEndedOnLastBall = true;
            }

            // Return Stint Check
            if (batters[curS].returnOverLimit !== null && gameState.totalOvers > batters[curS].returnOverLimit && gameState.ballsInOver === 0) {
                 if (index === gameState.ballHistory.length - 1) setTimeout(() => { alert(curS + " stint over."); retireBatter(); }, 500);
            }
        }
    });

    gameState.striker = batters[curS] || { name: curS, runs: 0, balls: 0 };
    gameState.nonStriker = batters[curNS] || { name: curNS, runs: 0, balls: 0 };
    gameState.allBatters = batters;
    
    updateUI(batters, bowlers);

    if (overEndedOnLastBall && gameState.totalOvers < gameState.maxOvers) {
        setTimeout(triggerOverEndModal, 100);
    }
}

function triggerOverEndModal() {
    setupQuickBowlers();
    document.getElementById('bowler-modal').style.display = 'flex';
    document.getElementById('new-bowler-input').focus();
}

function confirmNewBowler() {
    const v = document.getElementById('new-bowler-input').value.trim();
    if (!v) { alert("Please name the next bowler."); return; }
    gameState.currentBowler = v;
    document.getElementById('bowler-modal').style.display = 'none';
    document.getElementById('new-bowler-input').value = "";
    updateUI(); 
}

function editBall(idx) {
    const b = gameState.ballHistory[idx];
    if (b.event !== 'ball') return;
    const r = prompt("Edit Runs:", b.runs);
    const t = prompt("Edit Type (normal, wide, noball, byes, legbyes):", b.type);
    if (r !== null) b.runs = parseInt(r);
    if (t) b.type = t;
    recalculateTotals();
}

function retireBatter() {
    const name = gameState.striker.name;
    gameState.ballHistory.push({ event: 'retire', batter: name });
    recalculateTotals();

    const retired = Object.values(gameState.allBatters).filter(p => p.status === 'retired').sort((a, b) => b.runs - a.runs || a.entryOrder - b.entryOrder);
    const orderText = retired.length > 0 ? `Return sequence: ${retired.map(p => p.name).join(', ')}` : "None";
    const next = prompt(`${orderText}\nEnter Incoming Batter:`, retired.length > 0 ? retired[0].name : "");
    if (next) {
        gameState.playerEntryCount++;
        gameState.ballHistory.push({ event: 'new_batter', name: next, entryOrder: gameState.playerEntryCount });
        recalculateTotals();
    }
}

function generateMatchReport() {
    let zones = {};
    gameState.ballHistory.forEach(item => { if (item.zone) zones[item.zone] = (zones[item.zone] || 0) + item.runs; });
    let wagonHtml = Object.entries(zones).map(([z, r]) => `<li>${z}: ${r} runs</li>`).join('') || "No zones recorded";
    document.getElementById('report-body').innerHTML = `<h2>Pumas Scorecard</h2><p>Score: ${gameState.totalRuns}/${gameState.wickets}</p><p>Overs: ${gameState.totalOvers}.${gameState.ballsInOver}</p><h3>Wagon Wheel</h3><ul>${wagonHtml}</ul>`;
    document.getElementById('report-modal').style.display = 'flex';
}

function updateUI(batters = {}, bowlers = {}) {
    document.getElementById('total-display').innerText = `${gameState.totalRuns} / ${gameState.wickets}`;
    document.getElementById('overs-display').innerText = `${gameState.totalOvers}.${gameState.ballsInOver}`;
    document.getElementById('cur-bowler-display').innerText = gameState.currentBowler;

    const renderBadge = (p, id) => {
        const badge = document.getElementById(id);
        const left = p.returnOverLimit !== null ? (p.returnOverLimit - gameState.totalOvers) : (gameState.retireLimit - p.balls);
        badge.innerText = p.returnOverLimit !== null ? `Return: ${left}ov left` : `Balls Left: ${left}`;
        badge.className = left <= 0 ? "balls-left-badge alert" : "balls-left-badge";
    };
    renderBadge(gameState.striker, 'striker-left'); renderBadge(gameState.nonStriker, 'ns-left');

    document.getElementById('striker-name').innerText = gameState.striker.name;
    document.getElementById('striker-runs').innerText = gameState.striker.runs;
    document.getElementById('striker-balls').innerText = gameState.striker.balls;
    document.getElementById('non-striker-name').innerText = gameState.nonStriker.name;
    document.getElementById('non-striker-runs').innerText = gameState.nonStriker.runs;
    document.getElementById('non-striker-balls').innerText = gameState.nonStriker.balls;

    document.querySelector('#batter-table tbody').innerHTML = Object.values(batters).map(p => `<tr><td>${p.name} <small>(${p.status})</small></td><td>${p.runs}</td><td>${p.balls}</td><td>${p.balls>0?((p.runs/p.balls)*100).toFixed(1):0}</td></tr>`).join('');
    document.querySelector('#bowler-table tbody').innerHTML = Object.values(bowlers).map(b => `<tr><td>${b.name}</td><td>${Math.floor(b.balls/6)}.${b.balls%6}</td><td>${b.runs}</td><td>${b.wickets}</td><td>${b.balls>0?(b.runs/(b.balls/6)).toFixed(2):0}</td></tr>`).join('');

    document.getElementById('ball-thread-list').innerHTML = gameState.ballHistory.slice().reverse().map((item, i) => {
        let idx = gameState.ballHistory.length - 1 - i;
        if (item.event === 'manual_swap') return `<div class="history-item">Strike Swap</div>`;
        if (item.event === 'retire') return `<div class="history-item" style="color:orange">Retire: ${item.batter}</div>`;
        if (item.event === 'new_batter') return `<div class="history-item" style="color:blue">In: ${item.name}</div>`;
        const z = item.zone ? ` [${item.zone}]` : '';
        return `<div class="history-item" onclick="editBall(${idx})">Ball ${idx+1}: ${item.runs} [${item.type}]${z}${item.overEnd ? ' ✓' : ''}</div>`;
    }).join('');

    localStorage.setItem('pumas_history', JSON.stringify(gameState.ballHistory));
}

function setupQuickBowlers() {
    const bowlers = [...new Set(gameState.ballHistory.filter(b => b.bowler).map(b => b.bowler))].reverse();
    document.getElementById('quick-bowler-list').innerHTML = bowlers.slice(0, 3).map(n => `<button type="button" onclick="document.getElementById('new-bowler-input').value='${n}'" style="padding:5px; font-size:0.8rem">${n}</button>`).join('');
}
function selectZone(z) {
    for (let i = gameState.ballHistory.length - 1; i >= 0; i--) { if (gameState.ballHistory[i].event === 'ball') { gameState.ballHistory[i].zone = z; break; } }
    closeModals(); updateUI();
}
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }
function openFieldModal() { document.getElementById('field-modal').style.display = 'flex'; }
function manualSwapStrike() { gameState.ballHistory.push({ event: 'manual_swap' }); recalculateTotals(); }
function addExtra(t) { let r = parseInt(prompt("Runs?", "1")); if (!isNaN(r)) addBall(r, t); }
function addWicket() { document.getElementById('wicket-modal').style.display = 'flex'; }
function confirmWicket() {
    const next = document.getElementById('next-batsman-name').value.trim(); if (!next) return;
    addBall(0, 'wicket', { next }); gameState.playerEntryCount++;
    gameState.ballHistory.push({ event: 'new_batter', name: next, entryOrder: gameState.playerEntryCount });
    closeModals();
}
function undo() { gameState.ballHistory.pop(); recalculateTotals(); }
function resetMatch() { if (confirm("Wipe match?")) { localStorage.removeItem('pumas_history'); location.reload(); } }

window.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal[style*="flex"]') || ['INPUT', 'SELECT'].includes(document.activeElement.tagName)) return;
    const k = e.key.toLowerCase();
    if (['0','1','2','3','4','6'].includes(k)) addBall(parseInt(k), 'normal');
    if (k === 'w') addExtra('wide'); if (k === 'n') addExtra('noball');
    if (k === 's') manualSwapStrike();
});

(function init() {
    const s = localStorage.getItem('pumas_history');
    if (s && confirm("Resume Match?")) {
        gameState.ballHistory = JSON.parse(s);
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('scoring-screen').style.display = 'grid';
        recalculateTotals();
    }
})();