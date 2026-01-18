🏏 Walkerville Pumas Cricket Scorer (U14 Edition)
A professional, web-based cricket scoring application specifically tailored for Junior U14 rules. Built for speed, accuracy, and detailed match reporting.

🚀 How to Setup for Testing
1. File Installation
Create a folder named PumasScorer.

Save index.html, style.css, and app.js inside.

Zorin OS Note: Ensure filenames are lowercase and run chmod 644 * in the terminal to prevent 404 access errors.

2. Launching in Chrome/Brave
The Best Way: Open terminal in your folder and run python3 -m http.server 8080.

Access: Open Chrome/Brave and go to http://localhost:3000.

Force Refresh: If things look "wonky", press Ctrl + Shift + R.

✨ Key Features
U14 Retirement: Limits balls based on team size (8-13 players).

8-Ball Cap: Overs automatically end at 8 balls including extras.

Return Sequence: Suggests retired batters based on Most Runs -> Earliest Entry.

Return Stint: Automatically limits returning batters to a 4-over stay.

Wagon Wheel: Click-to-map hit zones for every run scored.

Editing: Click any ball in history to correct mistakes instantly.

⚠️ Known Issues & Feedback
Known Issues
Bowler Scorecard: 🏏 Fixed in v2.5 - Bowlers now correctly appear in the table as soon as they bowl their first ball.

Browser Cache: On Zorin OS, Brave may remember a 404 error even after the file is fixed. Always use Ctrl + Shift + R after updating code.

Keyboard Shortcuts: Typing names in modals may occasionally trigger scoring shortcuts (0-6) if the input box isn't properly focused.