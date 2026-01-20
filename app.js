<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pumas Scorer Pro v3.4 (Stable)</title>
    <style>
        :root {
            --primary: #1a73e8; --secondary: #fbbc04; --wicket: #d93025;
            --boundary: #1e8e3e; --field: #673ab7; --bg: #f1f3f4;
        }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); margin: 0; padding: 0; }
        .main-container { max-width: 1200px; margin: 0 auto; padding: 10px; }
        .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 15px; }
        
        /* Setup Screen */
        .setup-layout { max-width: 800px; margin: 20px auto; }
        .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        textarea { width: 100%; height: 200px; padding: 12px; border-radius: 8px; border: 1px solid #ccc; resize: none; font-family: inherit; font-size: 0.9rem; }
        .config-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .innings-summary { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #90caf9; display: none; color: #0d47a1; }

        /* Scoring Layout */
        .scoring-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .scorecard-header h1 { font-size: 3.5rem; color: var(--primary); text-align: center; margin: 0; }
        .innings-tag { text-align: center; font-weight: bold; color: #666; letter-spacing: 1px; text-transform: uppercase; font-size: 0.9rem; }
        .header-details { display: flex; justify-content: space-around; background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 10px; font-weight: bold; }
        .target-ui { background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; padding: 5px 10px; border-radius: 4px; }
        .editable { cursor: pointer; border-bottom: 1px dashed #999; }
        .editable:hover { color: var(--primary); border-bottom: 1px solid var(--primary); }

        /* Batter Cards */
        .batter-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
        .player-card { background: white; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; border: 2px solid #eee; }
        .player-card.active { border-color: var(--primary); background: #e8f0fe; }
        .balls-left-badge { font-size: 0.75rem; background: #eee; padding: 3px 6px; border-radius: 4px; margin-top: 5px; display: inline-block; font-weight: bold; }
        .balls-left-badge.alert { background: var(--wicket); color: white; animation: pulse 1.5s infinite; }

        /* Controls */
        .grid-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
        button { padding: 14px; border-radius: 10px; border: 1px solid #ddd; font-weight: bold; cursor: pointer; font-size: 1.1rem; transition: 0.1s; }
        button:active { transform: scale(0.98); }
        .btn-primary { background: var(--primary); color: white; border: none; }
        .btn-secondary { background: var(--secondary); border: none; }
        .btn-danger { background: var(--wicket); color: white; border: none; }
        .btn-field { background: var(--field); color: white; border: none; }
        .undo { background: #5f6368; color: white; border: none; }

        /* Modals */
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 5000; }
        .modal-content { background: white; padding: 30px; border-radius: 20px; width: 400px; text-align: center; max-height: 95vh; overflow-y: auto; }
        .large-modal { width: 90%; max-width: 700px; text-align: left; }
        .modal select, .modal input { width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; }

        /* Field Map */
        .field-container { width: 300px; height: 300px; margin: 0 auto; position: relative; }
        .cricket-field { width: 100%; height: 100%; background: #4CAF50; border-radius: 50%; border: 4px solid white; position: relative; }
        .pitch { position: absolute; width: 22px; height: 65px; background: #f0e68c; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .zone { position: absolute; width: 38px; height: 38px; background: rgba(255,255,255,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; cursor: pointer; border: 1px solid #333; z-index: 100; }

        /* Tables & Sidebar */
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem; }
        th { background: #f8f9fa; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .history-sidebar { height: 85vh; overflow-y: auto; }
        .history-item { padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; font-size: 0.85rem; }
        .history-item:hover { background: #f0f7ff; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        @media print { .controls, .footer-actions, .history-sidebar, button, .modal { display: none !important; } .card { box-shadow: none; border: 1px solid #ddd; } }
    </style>
</head>
<body>
    <div id="app" class="main-container">
        
        <div id="setup-screen" class="card setup-layout">
            <h2 id="setup-title" style="color:var(--primary); text-align:center;">Match Registration</h2>
            <div id="prev-innings-summary" class="innings-summary"></div>
            
            <div class="team-grid">
                <div>
                    <label><strong>Team 1 (Batting First)</strong></label>
                    <textarea id="bat-list" placeholder="Paste names here (One per line)"></textarea>
                    <label style="display:block; margin-top:10px;">Player Count:</label>
                    <select id="player-count-1" style="width:100%; padding:8px;">
                        <option value="8">8 (21 balls)</option><option value="9">9 (18 balls)</option>
                        <option value="10">10 (16 balls)</option><option value="11">11 (15 balls)</option>
                        <option value="12">12 (14 balls)</option><option value="13" selected>13 (13 balls)</option>
                    </select>
                </div>
                <div>
                    <label><strong>Team 2 (Bowling First)</strong></label>
                    <textarea id="bowl-list" placeholder="Paste names here (One per line)"></textarea>
                    <label style="display:block; margin-top:10px;">Player Count:</label>
                    <select id="player-count-2" style="width:100%; padding:8px;">
                        <option value="8">8 (21 balls)</option><option value="9">9 (18 balls)</option>
                        <option value="10">10 (16 balls)</option><option value="11">11 (15 balls)</option>
                        <option value="12">12 (14 balls)</option><option value="13" selected>13 (13 balls)</option>
                    </select>
                </div>
            </div>

            <div class="config-row">
                <div>
                    <label><strong>Max Overs</strong></label>
                    <input type="number" id="match-overs" value="28" style="width:100%; padding:8px;">
                </div>
                <div>
                    <label><strong>Current Stage</strong></label>
                    <input type="text" id="innings-display" value="1st Innings" readonly style="width:100%; padding:8px; background:#eee; border:none; font-weight:bold; text-align:center;">
                </div>
            </div>
            
            <button class="btn-primary" onclick="startGame()" style="width:100%">Start Innings</button>
            <div style="margin-top:15px; display:flex; gap:10px;">
                <button onclick="document.getElementById('import-file').click()" class="btn-secondary" style="flex:1">📂 Import Game State</button>
                <input type="file" id="import-file" style="display:none" onchange="importState(event)">
            </div>
        </div>

        <div id="scoring-screen" class="scoring-grid" style="display:none;">
            <div class="left-col">
                <header class="scorecard-header card">
                    <div class="innings-tag" id="live-innings-tag">1st Innings</div>
                    <h1 id="total-display">0 / 0</h1>
                    <div class="header-details">
                        <p>Ov: <span id="overs-display">0.0</span></p>
                        <p>Bowl: <strong id="cur-bowler-display" class="editable" onclick="manualChangePlayer('bowler')">--</strong></p>
                        <p id="target-box" style="display:none" class="target-ui">Target: <span id="target-val">--</span></p>
                        <p>Proj: <strong id="projected-display">--</strong></p>
                    </div>
                </header>

                <div class="batter-stats">
                    <div id="striker-box" class="player-card active">
                        <div><strong id="striker-name" class="editable" onclick="manualChangePlayer('striker')">--</strong>*<br><div id="striker-badge" class="balls-left-badge">--</div></div>
                        <div style="font-size:2rem"><span id="striker-runs">0</span>(<span id="striker-balls">0</span>)</div>
                    </div>
                    <div id="ns-box" class="player-card">
                        <div><span id="ns-name" class="editable" onclick="manualChangePlayer('ns')">--</span><br><div id="ns-badge" class="balls-left-badge">--</div></div>
                        <div style="font-size:2rem"><span id="ns-runs">0</span>(<span id="ns-balls">0</span>)</div>
                    </div>
                </div>

                <div class="grid-row">
                    <button class="btn-secondary" style="grid-column: span 3" onclick="manualSwapStrike()">⇄ Swap Strike</button>
                    <button class="undo" style="background:#607d8b" onclick="retireBatter()">🏃 Retire</button>
                </div>

                <div class="controls card">
                    <div class="grid-row">
                        <button onclick="handleBall(0, 'normal')">0</button>
                        <button onclick="handleBall(1, 'normal')">1</button>
                        <button onclick="handleBall(2, 'normal')">2</button>
                        <button onclick="handleBall(3, 'normal')">3</button>
                    </div>
                    <div class="grid-row">
                        <button onclick="handleBall(4, 'normal')" style="background:var(--boundary); color:white">4</button>
                        <button onclick="handleBall(6, 'normal')" style="background:var(--boundary); color:white">6</button>
                        <button onclick="openWicketModal()" style="background:var(--wicket); color:white">WKT</button>
                        <button onclick="undo()">Undo</button>
                    </div>
                    <div class="grid-row extras">
                        <button onclick="addExtra('wide')">WD</button>
                        <button onclick="addExtra('noball')">NB</button>
                        <button onclick="addExtra('byes')">BYE</button>
                        <button onclick="openFieldModal()" class="btn-field">Map</button>
                    </div>
                </div>

                <div class="stats-summary card">
                    <h3>Batting</h3>
                    <table id="batter-table"><thead><tr><th>Name</th><th>R</th><th>B</th><th>4s</th><th>Status</th></tr></thead><tbody></tbody></table>
                    <h3 style="margin-top:20px">Bowling</h3>
                    <table id="bowler-table"><thead><tr><th>Name</th><th>O</th><th>R</th><th>W</th><th>Econ</th></tr></thead><tbody></tbody></table>
                </div>

                <div class="footer-actions card" style="display:flex; gap:10px;">
                    <button onclick="swapInnings()" class="btn-secondary" style="flex:1">Swap Innings</button>
                    <button onclick="generateReport()" class="btn-primary" style="flex:1">Report</button>
                    <button onclick="exportState()" style="flex:1">Export</button>
                    <button onclick="resetMatch()" class="btn-danger" style="flex:1">Reset</button>
                </div>
            </div>

            <div class="history-sidebar card">
                <h3>Ball History</h3>
                <div id="ball-thread-list"></div>
            </div>
        </div>

        <div id="field-modal" class="modal"><div class="modal-content">
            <h3>Hit Zone</h3>
            <div class="field-container"><div class="cricket-field">
                <div class="zone" onclick="selectZone('Third Man')" style="top:10%; left:20%;">TM</div>
                <div class="zone" onclick="selectZone('Fine Leg')" style="top:10%; left:65%;">FL</div>
                <div class="zone" onclick="selectZone('Point')" style="top:40%; left:5%;">P</div>
                <div class="zone" onclick="selectZone('Cover')" style="top:65%; left:15%;">C</div>
                <div class="zone" onclick="selectZone('Mid Off')" style="top:85%; left:35%;">MO</div>
                <div class="zone" onclick="selectZone('Mid On')" style="top:85%; left:60%;">MN</div>
                <div class="zone" onclick="selectZone('Mid Wicket')" style="top:65%; left:80%;">MW</div>
                <div class="zone" onclick="selectZone('Square Leg')" style="top:40%; left:88%;">SL</div>
                <div class="pitch"></div>
            </div></div>
            <button onclick="closeModals()" style="width:100%; margin-top:15px;">Skip</button>
        </div></div>

        <div id="bowler-modal" class="modal"><div class="modal-content">
            <h3>Select Bowler</h3>
            <select id="new-bowler-select"></select>
            <button class="btn-primary" onclick="confirmNewBowler()" style="width:100%">Confirm</button>
        </div></div>
        
        <div id="manual-swap-modal" class="modal"><div class="modal-content">
            <h3>Change Player</h3>
            <p>Select Replacement:</p>
            <select id="manual-swap-select"></select>
            <input type="hidden" id="manual-swap-role">
            <button class="btn-primary" onclick="confirmManualSwap()" style="width:100%">Update</button>
        </div></div>

        <div id="wicket-modal" class="modal"><div class="modal-content">
            <h3>Wicket!</h3>
            <select id="wicket-type">
                <option value="Bowled">Bowled</option><option value="Caught">Caught</option>
                <option value="LBW">LBW</option><option value="Run Out">Run Out</option><option value="Stumped">Stumped</option>
            </select>
            <input type="text" id="fielder-name" placeholder="Fielder Name">
            <p style="text-align:left; margin-bottom:5px;"><strong>Incoming Batter:</strong></p>
            <select id="next-batter-select"></select>
            <button class="btn-primary" onclick="confirmWicket()" style="width:100%">Confirm</button>
        </div></div>

        <div id="report-modal" class="modal"><div class="modal-content large-modal">
            <div id="report-content"></div>
            <button class="btn-primary" onclick="closeModals()" style="width:100%; margin-top:20px;">Close</button>
        </div></div>
    </div>

    <script>
        // --- DATA STRUCTURES ---
        let match = {
            innings: 1, target: null, firstInningsScore: "", 
            batTeam1: [], bowlTeam1: [], batTeam2: [], bowlTeam2: [],
            team1Count: 13, team2Count: 13
        };

        let live = {
            totalRuns: 0, wickets: 0, ballsInOver: 0, totalOvers: 0, maxOvers: 28,
            striker: "", ns: "", bowler: "",
            history: [], retireLimit: 13,
            batters: {}, bowlers: {}
        };

        const rLimits = { 8: 21, 9: 18, 10: 16, 11: 15, 12: 14, 13: 13 };

        // --- SETUP FLOW ---
        function startGame() {
            const batInput = document.getElementById('bat-list').value;
            const bowlInput = document.getElementById('bowl-list').value;
            const bList = batInput.split('\n').map(n=>n.trim()).filter(n=>n);
            const boList = bowlInput.split('\n').map(n=>n.trim()).filter(n=>n);
            
            if (bList.length < 2) { alert("Error: Need 2+ batters."); return; }
            if (boList.length < 1) { alert("Error: Need 1+ bowlers."); return; }

            match.team1Count = parseInt(document.getElementById('player-count-1').value);
            match.team2Count = parseInt(document.getElementById('player-count-2').value);

            if (match.innings === 1) { match.batTeam1 = bList; match.bowlTeam1 = boList; }
            else { match.batTeam2 = bList; match.bowlTeam2 = boList; }

            // Init Live State
            live.totalRuns = 0; live.wickets = 0; live.ballsInOver = 0; live.totalOvers = 0;
            live.history = [];
            live.maxOvers = parseInt(document.getElementById('match-overs').value);
            
            // Logic for Retirement Limit
            const currentBattingCount = (match.innings === 1) ? match.team1Count : match.team2Count;
            live.retireLimit = rLimits[currentBattingCount];
            live.playersPerTeam = currentBattingCount;

            // Batters Init
            live.batters = {};
            bList.forEach((n, i) => {
                live.batters[n] = { 
                    name: n, runs: 0, balls: 0, 4:0, 6:0, 
                    status: 'Yet to bat', stint: 1, returnLimit: null, order: i 
                };
            });
            live.striker = bList[0]; live.ns = bList[1];
            live.batters[live.striker].status = 'Active';
            live.batters[live.ns].status = 'Active';

            // Bowlers Init
            live.bowlers = {};
            boList.forEach(n => live.bowlers[n] = { name: n, runs: 0, wickets: 0, balls: 0 });
            live.bowler = boList[0]; // Default

            // Switch Screen
            document.getElementById('setup-screen').style.display = 'none';
            document.getElementById('scoring-screen').style.display = 'grid';
            
            if (match.innings === 2) {
                document.getElementById('target-box').style.display = 'block';
                document.getElementById('target-val').innerText = match.target;
                document.getElementById('live-innings-tag').innerText = "2nd Innings";
            } else {
                document.getElementById('target-box').style.display = 'none';
                document.getElementById('live-innings-tag').innerText = "1st Innings";
            }
            
            // Trigger Opening Bowler Selection immediately
            openBowlerModal();
            recalc();
        }

        // --- CORE SCORING ---
        function handleBall(runs, type, wicketData = null) {
            live.history.push({
                event: 'ball', runs, type, 
                batter: live.striker, bowler: live.bowler,
                legal: ['normal','wicket','byes'].includes(type),
                wicket: wicketData, zone: null, overEnd: false
            });
            recalc();
            if (runs > 0 && ['normal','wicket'].includes(type)) openFieldModal();
        }

        function recalc() {
            live.totalRuns = 0; live.wickets = 0; live.totalOvers = 0; live.ballsInOver = 0;
            let phys = 0, lastBallEndedOver = false, lastBowler = "";

            Object.values(live.batters).forEach(b => { b.runs=0; b.balls=0; b[4]=0; b[6]=0; });
            Object.values(live.bowlers).forEach(b => { b.runs=0; b.wickets=0; b.balls=0; });

            live.history.forEach((h, i) => {
                live.totalRuns += h.runs;
                if (h.wicket) live.wickets++;
                
                if (live.batters[h.batter]) {
                    live.batters[h.batter].balls++;
                    if (['normal','wicket'].includes(h.type)) live.batters[h.batter].runs += h.runs;
                    if (h.runs === 4) live.batters[h.batter][4]++;
                }

                if (!live.bowlers[h.bowler]) live.bowlers[h.bowler] = {name: h.bowler, runs:0, wickets:0, balls:0};
                live.bowlers[h.bowler].runs += h.runs;
                if (h.wicket) live.bowlers[h.bowler].wickets++;
                if (h.legal) live.bowlers[h.bowler].balls++;

                phys++;
                let end = false;
                if (h.legal) { live.ballsInOver++; if (live.ballsInOver === 6) end = true; }
                if (phys >= 8) end = true; 

                if (end) {
                    h.overEnd = true;
                    lastBowler = h.bowler;
                    live.totalOvers++; live.ballsInOver = 0; phys = 0;
                    if (i === live.history.length - 1) lastBallEndedOver = true;
                }
            });

            updateUI();

            // BUG FIX: Only loop modal if LAST BALL ended over AND we haven't changed bowler yet
            if (lastBallEndedOver && live.totalOvers < live.maxOvers && live.bowler === lastBowler) {
                setTimeout(openBowlerModal, 200);
            }
            
            checkRetirement(live.batters[live.striker]);
        }

        function checkRetirement(b) {
            if (!b) return;
            const active = Object.values(live.batters).filter(p => p.status === 'Active' || p.status === 'Yet to bat').length;
            if (active <= 2) return; 

            if (b.stint === 1 && b.balls >= live.retireLimit) {
                setTimeout(() => { alert(`${b.name} limit reached.`); retireBatter(); }, 500);
            }
            if (b.stint === 2 && b.returnLimit !== null && live.totalOvers >= b.returnLimit && live.ballsInOver === 0) {
                setTimeout(() => { alert(`${b.name} return stint done.`); retireBatter(); }, 500);
            }
        }

        function retireBatter() {
            const name = live.striker;
            live.batters[name].status = 'Retired';
            
            const available = Object.values(live.batters)
                .filter(p => p.status === 'Yet to bat' || p.status === 'Retired')
                .sort((a,b) => {
                    if (a.status === 'Retired' && b.status === 'Yet to bat') return -1;
                    if (b.status === 'Retired' && a.status === 'Yet to bat') return 1;
                    if (a.status === 'Retired' && b.status === 'Retired') return b.runs - a.runs;
                    return a.order - b.order;
                });

            if (available.length === 0) return alert("Innings Complete!");

            const next = available[0].name;
            const isReturn = live.batters[next].status === 'Retired';
            
            if (isReturn) {
                live.batters[next].stint++;
                if (live.batters[next].stint === 2) live.batters[next].returnLimit = live.totalOvers + 4;
                if (live.batters[next].stint >= 3) live.batters[next].returnLimit = null;
            }
            
            live.striker = next;
            live.batters[next].status = 'Active';
            live.history.push({ event: 'new_batter', name: next }); 
            recalc();
        }

        // --- MANUAL EDITS ---
        function manualChangePlayer(role) {
            const sel = document.getElementById('manual-swap-select');
            let pool = [];
            
            if (role === 'bowler') {
                const bowlTeam = match.innings === 1 ? match.bowlTeam1 : match.bowlTeam2;
                pool = bowlTeam;
            } else {
                const batTeam = match.innings === 1 ? match.batTeam1 : match.batTeam2;
                pool = batTeam;
            }

            sel.innerHTML = pool.map(n => `<option value="${n}">${n}</option>`).join('');
            document.getElementById('manual-swap-role').value = role;
            document.getElementById('manual-swap-modal').style.display = 'flex';
        }

        function confirmManualSwap() {
            const role = document.getElementById('manual-swap-role').value;
            const name = document.getElementById('manual-swap-select').value;
            
            if (role === 'bowler') live.bowler = name;
            else if (role === 'striker') {
                if (name === live.ns) live.ns = live.striker;
                live.striker = name;
                if(live.batters[name]) live.batters[name].status = 'Active';
            } else if (role === 'ns') {
                 if (name === live.striker) live.striker = live.ns;
                 live.ns = name;
                 if(live.batters[name]) live.batters[name].status = 'Active';
            }
            
            closeModals();
            recalc();
        }

        // --- STANDARD MODALS ---
        function openBowlerModal() {
            const sel = document.getElementById('new-bowler-select');
            const bowlTeam = match.innings === 1 ? match.bowlTeam1 : match.bowlTeam2;
            sel.innerHTML = bowlTeam.map(n => `<option value="${n}" ${n === live.bowler ? 'selected' : ''}>${n}</option>`).join('');
            document.getElementById('bowler-modal').style.display = 'flex';
        }

        function confirmNewBowler() {
            const val = document.getElementById('new-bowler-select').value;
            if (val) {
                live.bowler = val;
                // Force UI update immediately so user sees change
                document.getElementById('cur-bowler-display').innerText = val;
            }
            closeModals(); 
            // Do NOT call recalc here if it triggers loop, but we need to update stats. 
            // The loop fix is in recalc() (checking lastBowler vs live.bowler)
            recalc();
        }

        function swapInnings() {
            if (!confirm("Start Innings 2?")) return;
            match.target = live.totalRuns + 1;
            match.firstInningsScore = `${live.totalRuns}/${live.wickets} (${live.totalOvers}.${live.ballsInOver})`;
            match.innings = 2;

            document.getElementById('innings-display').value = "2nd Innings";
            document.getElementById('setup-title').innerText = "2nd Innings Registration";
            document.getElementById('prev-innings-summary').style.display = 'block';
            document.getElementById('prev-innings-summary').innerHTML = `<strong>Target: ${match.target}</strong><br>1st Innings: ${match.firstInningsScore}`;

            const oldBowl = document.getElementById('bowl-list').value;
            const oldBat = document.getElementById('bat-list').value;
            document.getElementById('bat-list').value = oldBowl; 
            document.getElementById('bowl-list').value = oldBat;

            document.getElementById('scoring-screen').style.display = 'none';
            document.getElementById('setup-screen').style.display = 'block';
        }

        function updateUI() {
            const tRuns = isNaN(live.totalRuns) ? 0 : live.totalRuns;
            document.getElementById('total-display').innerText = `${tRuns} / ${live.wickets}`;
            document.getElementById('overs-display').innerText = `${live.totalOvers}.${live.ballsInOver}`;
            document.getElementById('cur-bowler-display').innerText = live.bowler;

            const ballsGone = (live.totalOvers * 6) + live.ballsInOver;
            const ballsLeft = (live.maxOvers * 6) - ballsGone;
            const rr = ballsGone > 0 ? (tRuns / (ballsGone/6)) : 0;
            
            let projText = "--";
            if (match.innings === 1) {
                const p = Math.round(tRuns + (rr * (ballsLeft/6)));
                projText = isNaN(p) ? "--" : p;
            } else {
                const runsNeeded = match.target - tRuns;
                if (runsNeeded <= 0) projText = "WIN!";
                else {
                    const rrr = ballsLeft > 0 ? (runsNeeded / (ballsLeft/6)).toFixed(2) : "Done";
                    projText = isNaN(rrr) ? "--" : `Need ${runsNeeded} (${rrr} RPO)`;
                }
            }
            document.getElementById('projected-display').innerText = projText;

            updatePlayerCard('striker', live.batters[live.striker]);
            updatePlayerCard('ns', live.batters[live.ns]);

            const batRows = Object.values(live.batters).map(p => 
                `<tr><td>${p.name}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p[4]}</td><td>${p.status}</td></tr>`
            ).join('');
            document.querySelector('#batter-table tbody').innerHTML = batRows;

            const bowlRows = Object.values(live.bowlers).map(b => {
                const o = Math.floor(b.balls/6) + "." + (b.balls%6);
                const ec = b.balls>0 ? (b.runs/(b.balls/6)).toFixed(2) : 0;
                return `<tr><td>${b.name}</td><td>${o}</td><td>${b.runs}</td><td>${b.wickets}</td><td>${ec}</td></tr>`;
            }).join('');
            document.querySelector('#bowler-table tbody').innerHTML = bowlRows;

            const histHtml = live.history.slice().reverse().map((h, i) => {
                let idx = live.history.length - 1 - i;
                if (h.event === 'manual_swap') return `<div class="history-item">Strike Swap</div>`;
                if (h.event === 'retire') return `<div class="history-item" style="color:orange">Retired: ${h.name}</div>`;
                if (h.event === 'new_batter') return `<div class="history-item" style="color:blue">In: ${h.name}</div>`;
                const z = h.zone ? ` [${h.zone}]` : '';
                return `<div class="history-item" onclick="editBall(${idx})">Ball ${idx+1}: ${h.runs} (${h.type})${z}</div>`;
            }).join('');
            document.getElementById('ball-thread-list').innerHTML = histHtml;
        }

        function updatePlayerCard(prefix, p) {
            if (!p) return;
            document.getElementById(`${prefix}-name`).innerText = p.name;
            document.getElementById(`${prefix}-runs`).innerText = p.runs;
            document.getElementById(`${prefix}-balls`).innerText = p.balls;
            
            const badge = document.getElementById(`${prefix}-badge`);
            if (p.stint === 2) {
                const left = p.returnLimit - live.totalOvers;
                badge.innerText = `Return: ${left}ov left`;
                badge.className = left <= 0 ? "balls-left-badge alert" : "balls-left-badge";
            } else if (p.stint >= 3) {
                badge.innerText = "Final Stint"; badge.className = "balls-left-badge";
            } else {
                const left = live.retireLimit - p.balls;
                badge.innerText = `Balls: ${left}`;
                badge.className = left <= 0 ? "balls-left-badge alert" : "balls-left-badge";
            }
        }

        function manualSwapStrike() { 
            [live.striker, live.ns] = [live.ns, live.striker];
            live.history.push({ event: 'manual_swap' }); 
            recalc(); 
        }
        function addExtra(t) { 
            let r = prompt("Runs?", "1"); 
            if(r !== null && r !== "") handleBall(parseInt(r), t); 
        }
        function undo() { live.history.pop(); recalc(); }
        
        function openWicketModal() {
            const sel = document.getElementById('next-batter-select');
            const available = Object.values(live.batters).filter(p => p.status === 'Yet to bat' || p.status === 'Retired');
            sel.innerHTML = available.map(p => `<option value="${p.name}">${p.name} (${p.status})</option>`).join('');
            document.getElementById('wicket-modal').style.display = 'flex';
        }

        function confirmWicket() {
            const next = document.getElementById('next-batter-select').value;
            const wkt = { type: document.getElementById('wicket-type').value, fielder: document.getElementById('fielder-name').value, next };
            
            live.batters[live.striker].status = 'Out';
            handleBall(0, 'wicket', wkt);
            
            live.striker = next;
            live.batters[next].status = 'Active';
            if (live.batters[next].status === 'Retired') {
                live.batters[next].stint++;
                if (live.batters[next].stint === 2) live.batters[next].returnLimit = live.totalOvers + 4;
            }
            closeModals(); recalc();
        }

        function selectZone(z) {
            for(let i=live.history.length-1; i>=0; i--) { if(live.history[i].event === 'ball') { live.history[i].zone = z; break; } }
            closeModals(); recalc();
        }

        function editBall(idx) {
            const h = live.history[idx]; if (h.event !== 'ball') return;
            const r = prompt("Runs:", h.runs); if (r !== null) h.runs = parseInt(r); recalc();
        }

        function generateReport() {
            let zCount = {}; live.history.forEach(item => { if (item.zone) zCount[item.zone] = (zCount[item.zone] || 0) + item.runs; });
            let html = `<h2>${match.innings === 1 ? '1st' : '2nd'} Innings Report</h2><p>Score: ${live.totalRuns}/${live.wickets}</p><p>Overs: ${live.totalOvers}.${live.ballsInOver}</p><h3>Wagon Wheel</h3><ul>${Object.entries(zCount).map(([z,r]) => `<li>${z}: ${r} runs</li>`).join('') || '<li>No shots</li>'}</ul>`;
            document.getElementById('report-content').innerHTML = html; document.getElementById('report-modal').style.display = 'flex';
        }

        function exportState() {
            const s = JSON.stringify({ match, live });
            const blob = new Blob([s], {type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `pumas_match.json`; a.click();
        }

        function importState(e) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const data = JSON.parse(evt.target.result);
                match = data.match; live = data.live;
                document.getElementById('setup-screen').style.display = 'none'; document.getElementById('scoring-screen').style.display = 'grid'; recalc();
            };
            reader.readAsText(e.target.files[0]);
        }

        function closeModals() { document.querySelectorAll('.modal').forEach(m => m.style.display='none'); }
        function openFieldModal() { document.getElementById('field-modal').style.display='flex'; }
        function resetMatch() { if(confirm("Wipe match data?")) { location.reload(); } }

        window.addEventListener('keydown', (e) => {
            if (document.querySelector('.modal[style*="flex"]') || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
            const k = e.key.toLowerCase();
            if (['0','1','2','3','4','6'].includes(k)) handleBall(parseInt(k), 'normal');
            if (k === 'w') addExtra('wide'); if (k === 's') manualSwapStrike();
        });
    </script>
</body>
</html>