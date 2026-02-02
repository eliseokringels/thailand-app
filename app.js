document.addEventListener("DOMContentLoaded", () => {

    // =======================
    // 1. KONFIGURATION & DATEN
    // =======================
    const quotes = [
        "Disziplin schlägt Motivation. Jeden. Einzelnen. Tag.",
        "Wer heute durchzieht, lebt morgen freier – außer er ist in Bremen.",
        "Konsequenz ist, weiterzumachen wie Okan.",
        "Heute investieren. Später ernten. Danach ficken.",
        "Stärke entsteht, wenn Ausreden sterben. Zitat: Jensen gerade.",
        "Es fühlt sich schwer an, weil es wirkt. Wie bei Gras oder Alex mischen.",
        "Der Weg formt dich, nicht das Ziel. Strand wird dich formen, yallah.",
        "Erfolg ist leise – Zweifel sind laut. Carla ist lauter.",
        "Hör Luciano – Ans Meer.",
        "Wachstum ist unbequem. Gewöhn dich daran zu leiden, um bald frei zu sein.",
        "Wenn Jana, die Bitch, das schafft, dann du erst recht!",
        "Du hast schon schwerere Tage überstanden. Denk an Pia.",
        "Und unter Palm Trees dripp' ich in Margiela, Flex Loco.",
        "Fokus. Ruhe. Weitermachen. Nicht mehr lange, Bruder.",
        "Erfolg beginnt im Kopf, bleibt durch Taten – und Kokosnusswasser.",
        "Du wächst gerade über alte Versionen hinaus – und Drecks-Bremen.",
        "Bleib nüchtern. Bleib klar. Bleib dran, du Haywan."
    ];

    const quoteEl = document.getElementById("quote");
    const timerEl = document.getElementById("timer");
    const dateInput = document.getElementById("dateInput");
    const cleanDaysEl = document.getElementById("cleanDays");
    const resetBtn = document.getElementById("resetClean");
    const startBudgetInput = document.getElementById("startBudget");
    const dailyEarnInput = document.getElementById("dailyEarn");

    // =======================
    // 2. BACKGROUND & ZITAT
    // =======================
    const bgIndex = Math.floor(Math.random() * 50) + 1;
    document.body.style.backgroundImage = `url("img/bg${bgIndex}.jpg")`;
    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

    if (new Date().getHours() >= 21 || new Date().getHours() < 6) {
        document.body.classList.add("night-mode");
    }

    // =======================
    // 3. DATUM-SPEICHERUNG (WICHTIG!)
    // =======================
    // Wann hat Gordan angefangen zu sparen/arbeiten (unabhängig vom Alk)?
    if (!localStorage.getItem("globalStartDate")) {
        localStorage.setItem("globalStartDate", new Date().toISOString());
    }
    // Wann war das letzte Mal trocken? (Wird bei Reset auf "jetzt" gesetzt)
    if (!localStorage.getItem("cleanStartDate")) {
        localStorage.setItem("cleanStartDate", new Date().toISOString());
    }

    // =======================
    // 4. FINANZ-LOGIK (GETRENNT)
    // =======================
    startBudgetInput.value = localStorage.getItem("startBudget") || 0;
    dailyEarnInput.value = localStorage.getItem("dailyEarn") || 0;

    function updateFinance() {
        const now = new Date();
        const globalStart = new Date(localStorage.getItem("globalStartDate"));
        const cleanStart = new Date(localStorage.getItem("cleanStartDate"));

        // Tage seit Arbeitsbeginn (Geld bleibt sicher)
        const totalWorkDays = Math.floor((now - globalStart) / 86400000);
        // Tage seit dem letzten Saufen
        const cleanDays = Math.floor((now - cleanStart) / 86400000);
        
        const startVal = parseFloat(startBudgetInput.value) || 0;
        const earnVal = parseFloat(dailyEarnInput.value) || 0;
        const alkSavedPerDay = 15; // 15€ pro Tag gespart

        // BERECHNUNG:
        // Geld = Startbudget + (Alle Tage * Tagesverdienst) + (Trockene Tage * Alk-Ersparnis)
        const earnedMoney = totalWorkDays * earnVal;
        const savedMoneyAlk = cleanDays * alkSavedPerDay;
        const totalEuro = startVal + earnedMoney + savedMoneyAlk;
        
        const totalBaht = totalEuro * 38;

        cleanDaysEl.textContent = cleanDays;
        document.getElementById("totalEuro").textContent = Math.round(totalEuro).toLocaleString("de-DE");
        document.getElementById("totalBaht").textContent = Math.round(totalBaht).toLocaleString("de-DE");

        localStorage.setItem("startBudget", startBudgetInput.value);
        localStorage.setItem("dailyEarn", dailyEarnInput.value);
    }

    startBudgetInput.addEventListener("input", updateFinance);
    dailyEarnInput.addEventListener("input", updateFinance);

    resetBtn.addEventListener("click", () => {
        if(confirm("Echt jetzt, Gordan? Wieder gesoffen? Deine Sauf-Ersparnis geht auf 0, aber dein Lohn bleibt sicher!")) {
            localStorage.setItem("cleanStartDate", new Date().toISOString());
            updateFinance();
        }
    });

    // =======================
    // 5. COUNTDOWN & WETTER (Wie bisher)
    // =======================
    const savedDate = localStorage.getItem("targetDate");
    if (savedDate) dateInput.value = savedDate;
    dateInput.addEventListener("change", () => localStorage.setItem("targetDate", dateInput.value));

    function updateCountdown() {
        if (!dateInput.value) { timerEl.textContent = "Ziel setzen"; return; }
        const diff = new Date(dateInput.value) - new Date();
        if (diff <= 0) { timerEl.textContent = "✈️ Abflug!"; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        timerEl.textContent = `${d} Tage ${h} Std ${m} Min`;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    async function getWeather() {
        try {
            const [resBr, resBk] = await Promise.all([
                fetch("https://api.open-meteo.com/v1/forecast?latitude=53.07&longitude=8.80&current_weather=true").then(r => r.json()),
                fetch("https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.51&current_weather=true").then(r => r.json())
            ]);
            const tBr = Math.round(resBr.current_weather.temperature);
            const tBk = Math.round(resBk.current_weather.temperature);
            document.getElementById("temp-bremen").textContent = tBr;
            document.getElementById("temp-bangkok").textContent = tBk;
            document.getElementById("weather-diff").textContent = `Das sind ${tBk - tBr}°C Unterschied – zieh durch!`;
        } catch (e) { document.getElementById("weather-diff").textContent = "Wetter-Fehler"; }
    }
    getWeather();
    updateFinance();
});