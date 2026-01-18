let gameState = {
    totalRuns: 0, wickets: 0, ballsInOver: 0, totalOvers: 0, maxOvers: 20,
    striker: { name: "", runs: 0, balls: 0, sr: 0 },
    nonStriker: { name: "", runs: 0, balls: 0, sr: 0 },
    currentBowler: "",
    ballHistory: [] 
};

function startGame() {
    gameState.maxOvers = parseInt(document.getElementById('match-overs').value) || 20;
    gameState.currentBowler = document.getElementById('bowler-name').value || "Bowler 1";
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('scoring-screen').style.display = 'grid';
    recalculateTotals();
}

function addBall(runs, type, isLegal = true, wicketData = null) {
    const ballEntry = {
        event: 'ball',
        runs: runs, type: type,
        batter: gameState.striker.name,
        bowler: gameState.currentBowler,
        isLegal: isLegal, wicket: wicketData
    };
    gameState.ballHistory.push(ballEntry);
    recalculateTotals();
    checkOverTransition();
}

function manualSwapStrike() {
    gameState.ballHistory.push({ event: 'manual_swap' });
    recalculateTotals();
}

function addExtra(type) {
    let runs = parseInt(prompt(`Total runs for ${type}?`, "1"));
    if (isNaN(runs)) return;
    addBall(runs, type, (type === 'byes' || type === 'legbyes'));
}

function addWicket() { document.getElementById('wicket-modal').style.display = 'flex'; }

function confirmWicket() {
    const wType = document.getElementById('wicket-type').value;
    const fielder = document.getElementById('fielder-name').value;
    const nextBatter = document.getElementById('next-batsman-name').value || "New Batter";
    addBall(0, 'wicket', true, { type: wType, fielder: fielder, nextBatter: nextBatter });
    document.getElementById('wicket-modal').style.display = 'none';
    document.getElementById('fielder-name').value = "";
    document.getElementById('next-batsman-name').value = "";
}

function checkOverTransition() {
    if (gameState.ballsInOver === 0 && gameState.ballHistory.length > 0) {
        const last = gameState.ballHistory[gameState.ballHistory.length - 1];
        if (last.event === 'ball' && last.isLegal) {
            document.getElementById('bowler-modal').style.display = 'flex';
        }
    }
}

function confirmNewBowler() {
    const val = document.getElementById('new-bowler-input').value;
    if (val) gameState.currentBowler = val;
    document.getElementById('bowler-modal').style.display = 'none';
    document.getElementById('new-bowler-input').value = "";
    updateUI();
}

/**
 * CORE ENGINE: Recalculates runs, RR, SR, and Economy
 */
function recalculateTotals() {
    gameState.totalRuns = 0; gameState.wickets = 0; gameState.totalOvers = 0; gameState.ballsInOver = 0;
    let batters = {}; let bowlers = {};
    
    const b1Init = document.getElementById('p1-name').value || "Batter 1";
    const b2Init = document.getElementById('p2-name').value || "Batter 2";
    batters[b1Init] = { runs: 0, balls: 0 };
    batters[b2Init] = { runs: 0, balls: 0 };
    
    let curS = b1Init; let curNS = b2Init;

    gameState.ballHistory.forEach(item => {
        if (item.event === 'manual_swap') { [curS, curNS] = [curNS, curS]; return; }

        const ball = item;
        gameState.totalRuns += ball.runs;
        if (ball.type === 'wicket') gameState.wickets++;

        if (!bowlers[ball.bowler]) bowlers[ball.bowler] = { runs: 0, wickets: 0, balls: 0 };
        bowlers[ball.bowler].runs += ball.runs;
        if (ball.type === 'wicket') bowlers[ball.bowler].wickets++;
        if (ball.isLegal) bowlers[ball.bowler].balls++;

        if (!batters[ball.batter]) batters[ball.batter] = { runs: 0, balls: 0 };

        if (ball.isLegal) {
            gameState.ballsInOver++;
            batters[ball.batter].balls++;
            if (ball.type === 'normal' || ball.type === 'wicket') batters[ball.batter].runs += ball.runs;
            if (ball.runs % 2 !== 0) [curS, curNS] = [curNS, curS];
            if (gameState.ballsInOver === 6) { gameState.totalOvers++; gameState.ballsInOver = 0; [curS, curNS] = [curNS, curS]; }
        } else {
            if (ball.runs % 2 !== 0) [curS, curNS] = [curNS, curS];
        }

        if (ball.type === 'wicket' && ball.wicket.nextBatter) {
            let next = ball.wicket.nextBatter;
            batters[next] = { runs: 0, balls: 0 };
            curS = next;
        }
    });

    gameState.striker = { name: curS, ...batters[curS] };
    gameState.nonStriker = { name: curNS, ...batters[curNS] };
    updateUI(batters, bowlers);
}

function updateUI(batters = {}, bowlers = {}) {
    // Total & Run Rate
    const totalBalls = (gameState.totalOvers * 6) + gameState.ballsInOver;
    const runRate = totalBalls > 0 ? (gameState.totalRuns / (totalBalls / 6)).toFixed(2) : "0.00";
    
    document.getElementById('total-display').innerText = `${gameState.totalRuns} / ${gameState.wickets}`;
    document.getElementById('overs-display').innerText = `${gameState.totalOvers}.${gameState.ballsInOver}`;
    document.getElementById('max-overs-val').innerText = gameState.maxOvers;
    document.getElementById('rr-display').innerText = runRate;
    document.getElementById('cur-bowler-display').innerText = gameState.currentBowler;
    
    // Striker UI
    const sSR = gameState.striker.balls > 0 ? ((gameState.striker.runs / gameState.striker.balls) * 100).toFixed(1) : "0.0";
    document.getElementById('striker-name').innerText = gameState.striker.name;
    document.getElementById('striker-runs').innerText = gameState.striker.runs;
    document.getElementById('striker-balls').innerText = gameState.striker.balls;
    document.getElementById('striker-sr').innerText = sSR;

    // Non-Striker UI
    const nsSR = gameState.nonStriker.balls > 0 ? ((gameState.nonStriker.runs / gameState.nonStriker.balls) * 100).toFixed(1) : "0.0";
    document.getElementById('non-striker-name').innerText = gameState.nonStriker.name;
    document.getElementById('non-striker-runs').innerText = gameState.nonStriker.runs;
    document.getElementById('non-striker-balls').innerText = gameState.nonStriker.balls;
    document.getElementById('non-striker-sr').innerText = nsSR;

    // History
    const list = document.getElementById('ball-thread-list');
    list.innerHTML = gameState.ballHistory.slice().reverse().map((item, i) => {
        let idx = gameState.ballHistory.length - 1 - i;
        if (item.event === 'manual_swap') return `<div class="history-item swap">Strike Swapped</div>`;
        return `<div class="history-item" onclick="editBall(${idx})">Ball ${idx+1}: ${item.runs} [${item.type}] - ${item.batter} (${item.bowler})</div>`;
    }).join('');

    // Tables
    document.querySelector('#batter-table tbody').innerHTML = Object.entries(batters).map(([name, s]) => {
        let sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : "0.0";
        return `<tr><td>${name}</td><td>${s.runs}</td><td>${s.balls}</td><td>${sr}</td></tr>`;
    }).join('');

    document.querySelector('#bowler-table tbody').innerHTML = Object.entries(bowlers).map(([name, s]) => {
        let overs = `${Math.floor(s.balls/6)}.${s.balls%6}`;
        let econ = s.balls > 0 ? (s.runs / (s.balls/6)).toFixed(2) : "0.00";
        return `<tr><td>${name}</td><td>${overs}</td><td>${s.runs}</td><td>${s.wickets}</td><td>${econ}</td></tr>`;
    }).join('');
    
    localStorage.setItem('pumas_history', JSON.stringify(gameState.ballHistory));
}

function editBall(idx) {
    const ball = gameState.ballHistory[idx];
    if (ball.event === 'manual_swap') return;

    let newRuns = prompt("Edit Runs:", ball.runs);
    let newBatter = prompt("Edit Batter Name:", ball.batter);
    let newBowler = prompt("Edit Bowler Name:", ball.bowler);

    if (newRuns !== null) ball.runs = parseInt(newRuns);
    if (newBatter) ball.batter = newBatter;
    if (newBowler) ball.bowler = newBowler;

    recalculateTotals();
}

function undo() { gameState.ballHistory.pop(); recalculateTotals(); }

function init() {
    const savedData = localStorage.getItem('pumas_history');
    if (savedData) {
        const history = JSON.parse(savedData);
        if (history.length > 0) {
            if (confirm("Found an unfinished match. Would you like to resume?")) {
                gameState.ballHistory = history;
                
                // Hide setup and show scoring
                document.getElementById('setup-screen').style.display = 'none';
                document.getElementById('scoring-screen').style.display = 'grid';
                
                // Set match settings based on last ball to prevent errors
                const lastBall = history[history.length - 1];
                if(lastBall.event === 'ball') gameState.currentBowler = lastBall.bowler;
                
                recalculateTotals();
            } else {
                localStorage.removeItem('pumas_history');
            }
        }
    }
}

// Call init when the script loads
init();

window.addEventListener('keydown', (e) => {
    const isModalOpen = !!document.querySelector('.modal[style*="flex"]');
    const isInputActive = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (isModalOpen || isInputActive) return;
    if (document.getElementById('scoring-screen').style.display === 'none') return;
    
    const key = e.key.toLowerCase();
    if (['0','1','2','3','4','6'].includes(key)) addBall(parseInt(key), 'normal');
    if (key === 'w') addExtra('wide');
    if (key === 'n') addExtra('noball');
    if (key === 'b') addExtra('byes');
    if (key === 'l') addExtra('legbyes');
    if (key === 'u') undo();
    if (key === 's') manualSwapStrike();
});