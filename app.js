let gameState = {
    totalRuns: 0, wickets: 0, ballsInOver: 0, totalOvers: 0, maxOvers: 20,
    striker: { name: "", runs: 0, balls: 0, status: 'active', entryOrder: 1, returnLimit: null },
    nonStriker: { name: "", runs: 0, balls: 0, status: 'active', entryOrder: 2, returnLimit: null },
    currentBowler: "",
    retireLimit: 13,
    ballHistory: [],
    playerEntryCount: 2,
    allBatters: {}
};

const retireRules = { 8: 21, 9: 18, 10: 16, 11: 15, 12: 14, 13: 13 };

function startGame() {
    const p1 = document.getElementById('p1-name').value.trim();
    const p2 = document.getElementById('p2-name').value.trim();
    const b = document.getElementById('bowler-name').value.trim();
    
    if (!p1 || !p2 || !b) { alert("Fill in names."); return; }

    gameState.retireLimit = retireRules[document.getElementById('player-count').value];
    gameState.maxOvers = parseInt(document.getElementById('match-overs').value);
    gameState.currentBowler = b;

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('scoring-screen').style.display = 'grid';
    recalculateTotals();
}

function changeTeamRules() {
    document.getElementById('rules-modal').style.display = 'flex';
}

function applyRuleChange() {
    gameState.retireLimit = retireRules[document.getElementById('update-player-count').value];
    document.getElementById('rules-modal').style.display = 'none';
    recalculateTotals();
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
    if (runs >= 4) openFieldModal();
    if (gameState.ballsInOver === 0 && gameState.ballHistory.length > 0) {
        document.getElementById('bowler-modal').style.display = 'flex';
    }
}

function recalculateTotals() {
    gameState.totalRuns = 0; gameState.wickets = 0; gameState.totalOvers = 0; gameState.ballsInOver = 0;
    let batters = {}, bowlers = {};
    
    const b1 = document.getElementById('p1-name').value;
    const b2 = document.getElementById('p2-name').value;
    batters[b1] = { name: b1, runs: 0, balls: 0, entryOrder: 1, status: 'active', returnLimit: null };
    batters[b2] = { name: b2, runs: 0, balls: 0, entryOrder: 2, status: 'active', returnLimit: null };
    
    let curS = b1, curNS = b2;
    let physCount = 0;

    gameState.ballHistory.forEach(item => {
        item.overEnd = false;
        if (item.event === 'manual_swap') { [curS, curNS] = [curNS, curS]; return; }
        if (item.event === 'new_batter') {
            if (!batters[item.name]) batters[item.name] = { name: item.name, runs: 0, balls: 0, entryOrder: item.entryOrder, status: 'active', returnLimit: null };
            else { batters[item.name].status = 'active'; batters[item.name].returnLimit = gameState.totalOvers + 4; }
            curS = item.name; return;
        }
        if (item.event === 'retire') { batters[item.batter].status = 'retired'; return; }

        gameState.totalRuns += item.runs;
        if (item.type === 'wicket') {
            gameState.wickets++;
            batters[item.batter].status = 'out';
        }
        if (!bowlers[item.bowler]) bowlers[item.bowler] = { runs: 0, wickets: 0, balls: 0 };
        bowlers[item.bowler].runs += item.runs;
        if (item.type === 'wicket') bowlers[item.bowler].wickets++;

        physCount++;
        if (!batters[item.batter]) batters[item.batter] = { name: item.batter, runs: 0, balls: 0, entryOrder: 99, status: 'active' };
        batters[item.batter].balls++;
        if (['normal','wicket','byes','legbyes'].includes(item.type)) batters[item.batter].runs += item.runs;
        if (item.runs % 2 !== 0) [curS, curNS] = [curNS, curS];

        let endOver = false;
        if (item.isLegal) { gameState.ballsInOver++; bowlers[item.bowler].balls++; if (gameState.ballsInOver === 6) endOver = true; }
        if (physCount >= 8) endOver = true;
        if (endOver) { item.overEnd = true; gameState.totalOvers++; gameState.ballsInOver = 0; physCount = 0; [curS, curNS] = [curNS, curS]; }

        if (item.type === 'wicket' && item.wicket && item.wicket.nextBatter) {
            curS = item.wicket.nextBatter;
            if (!batters[curS]) batters[curS] = { name: curS, runs: 0, balls: 0, status: 'active' };
        }
    });

    gameState.striker = batters[curS];
    gameState.nonStriker = batters[curNS];
    gameState.allBatters = batters;
    updateUI();
}

function updateUI() {
    document.getElementById('total-display').innerText = `${gameState.totalRuns} / ${gameState.wickets}`;
    document.getElementById('overs-display').innerText = `${gameState.totalOvers}.${gameState.ballsInOver}`;
    document.getElementById('retire-limit-display').innerText = gameState.retireLimit;
    document.getElementById('cur-bowler-display').innerText = gameState.currentBowler;

    const updatePlayer = (p, prefix) => {
        document.getElementById(`${prefix}-name`).innerText = p.name;
        document.getElementById(`${prefix}-runs`).innerText = p.runs;
        document.getElementById(`${prefix}-balls`).innerText = p.balls;
        const badge = document.getElementById(prefix === 'striker' ? 'striker-left' : 'ns-left');
        if (p.returnLimit) {
            badge.innerText = `Retire Over: ${p.returnLimit}`;
            badge.className = (gameState.totalOvers >= p.returnLimit) ? 'balls-left-badge alert' : 'balls-left-badge';
        } else {
            const left = gameState.retireLimit - p.balls;
            badge.innerText = `Balls Left: ${left}`;
            badge.className = (left <= 0) ? 'balls-left-badge alert' : 'balls-left-badge';
        }
    };
    updatePlayer(gameState.striker, 'striker');
    updatePlayer(gameState.nonStriker, 'ns');

    document.getElementById('ball-thread-list').innerHTML = gameState.ballHistory.slice().reverse().map((item, i) => {
        let idx = gameState.ballHistory.length - 1 - i;
        return `<div class="history-item" onclick="editBall(${idx})">${item.event==='manual_swap'?'Swap':`Ball ${idx+1}: ${item.runs} [${item.type}]`}</div>`;
    }).join('');
}

function retireBatter() {
    const name = gameState.striker.name;
    if (!confirm(`Retire ${name}?`)) return;
    gameState.ballHistory.push({ event: 'retire', batter: name });
    recalculateTotals();

    const retired = Object.values(gameState.allBatters)
        .filter(p => p.status === 'retired')
        .sort((a, b) => b.runs - a.runs || a.entryOrder - b.entryOrder);

    const orderText = retired.length > 0 ? `Return order: ${retired.map(p => p.name).join(', ')}` : "None retired";
    const next = prompt(`${orderText}\nEnter new batter name:`, retired.length > 0 ? retired[0].name : "");
    if (next) {
        gameState.playerEntryCount++;
        gameState.ballHistory.push({ event: 'new_batter', name: next, entryOrder: gameState.playerEntryCount });
        recalculateTotals();
    }
}

// ... existing helper functions (undo, export, modals) ...