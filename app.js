document.addEventListener("DOMContentLoaded", () => {

    const cashSound = new Audio("https://www.soundjay.com/misc/sounds/cash-register-05.mp3");
    const gymSound = new Audio("https://www.myinstants.com/media/sounds/yea-buddy.mp3");
    const failSound = new Audio("https://www.myinstants.com/media/sounds/oh-no-no-no-tik-tok-song-sound-effect.mp3"); 

    const quotes = [
        "Disziplin schlägt Motivation. Jeden Tag.",
        "Wer heute durchzieht, lebt morgen freier.",
        "Stärke entsteht, wenn Ausreden sterben.",
        "Hör Luciano – Ans Meer.",
        "In Bangkok ist es gerade wärmer als in Bremen. Zieh durch!",
        "Disziplin schlägt Motivation. Jeden. Einzelnen. Tag.",
        "Wer heute durchzieht, lebt morgen freier – außer er ist in Bremen.",
        "Konsequenz ist, weiterzumachen wie Okan.",
        "Heute investieren. Später ernten. Danach ficken.",
        "Stärke entsteht, wenn Ausreden sterben. Zitat: Jensen gerade.",
        "Es fühlt sich schwer an, weil es wirkt. Wie bei Gras oder Alex mischen.",
        "Der Weg formt dich, nicht das Ziel. Strand wird dich formen, yallah.",
        "Erfolg ist leise – Zweifel sind laut. Carla ist lauter.",
        "Wachstum ist unbequem. Gewöhn dich daran zu leiden, um bald frei zu sein.",
        "Wenn Jana, die Bitch, das schafft, dann du erst recht!",
        "Du hast schon schwerere Tage überstanden. Denk an Pia.",
        "Und unter Palm Trees dripp' ich in Margiela, Flex Loco.",
        "Fokus. Ruhe. Weitermachen. Nicht mehr lange, Bruder.",
        "Erfolg beginnt im Kopf, bleibt durch Taten – und Kokosnusswasser.",
        "Du wächst gerade über alte Versionen hinaus – und Drecks-Bremen.",
        "Bleib nüchtern. Bleib klar. Bleib dran, du Haywan."
    ];

    let qIndex = parseInt(localStorage.getItem("lastQ")) || 0;
    let bIndex = parseInt(localStorage.getItem("lastB")) || 1;
    
    // Falls qIndex durch das Hinzufügen neuer Sprüche außerhalb des Bereichs ist
    if (qIndex >= quotes.length) qIndex = 0;

    document.getElementById("quote").textContent = quotes[qIndex];
    document.body.style.backgroundImage = `url("img/bg${bIndex}.jpg")`;
    
    localStorage.setItem("lastQ", (qIndex + 1) % quotes.length);
    localStorage.setItem("lastB", (bIndex % 15) + 1); 

    // GYM-LOGIK
    let gymCount = parseInt(localStorage.getItem("gymCount")) || 0;
    const gymDisplay = document.getElementById("gymCountDisplay");
    if(gymDisplay) gymDisplay.textContent = gymCount;

    document.getElementById("gymBtn").addEventListener("click", () => {
        gymSound.play();
        gymCount++;
        localStorage.setItem("gymCount", gymCount);
        gymDisplay.textContent = gymCount;
    });

    document.getElementById("resetGym").addEventListener("click", () => {
        if(confirm("Training wirklich auf 0 setzen?")) {
            gymCount = 0;
            localStorage.setItem("gymCount", 0);
            gymDisplay.textContent = 0;
        }
    });

    // CLEAN-LOGIK & STRAFE
    let cleanDays = parseInt(localStorage.getItem("manualCleanDays")) || 0;
    let totalPenalty = parseInt(localStorage.getItem("totalPenalty")) || 0;
    const cleanDisplay = document.getElementById("cleanDaysDisplay");
    
    function updateCleanAndFinance() {
        if(cleanDisplay) cleanDisplay.textContent = cleanDays;
        const penaltyEl = document.getElementById("penaltyInfo");
        if(penaltyEl) penaltyEl.textContent = totalPenalty > 0 ? `Abzug durch Saufen: -${totalPenalty}€` : "";
        updateFinance();
    }

    document.getElementById("cleanStayBtn").addEventListener("click", () => {
        cashSound.play();
        cleanDays++;
        localStorage.setItem("manualCleanDays", cleanDays);
        updateCleanAndFinance();
    });

    document.getElementById("resetClean").addEventListener("click", () => {
        if(confirm("Echt jetzt? Rückfall kostet 10€ Strafe!")) {
            failSound.play();
            cleanDays = 0; 
            totalPenalty += 10; 
            localStorage.setItem("manualCleanDays", 0);
            localStorage.setItem("totalPenalty", totalPenalty);
            updateCleanAndFinance();
        }
    });

    // FINANZEN
    const startBudgetInput = document.getElementById("startBudget");
    const dailyEarnInput = document.getElementById("dailyEarn");
    if(startBudgetInput) startBudgetInput.value = localStorage.getItem("startBudget") || 0;
    if(dailyEarnInput) dailyEarnInput.value = localStorage.getItem("dailyEarn") || 50;

    if (!localStorage.getItem("globalStart")) localStorage.setItem("globalStart", new Date().toISOString());

    function updateFinance() {
        const now = new Date();
        const globalStart = new Date(localStorage.getItem("globalStart"));
        const workDays = Math.floor((now - globalStart) / 86400000);
        
        const startVal = parseFloat(startBudgetInput.value) || 0;
        const earnVal = parseFloat(dailyEarnInput.value) || 0;
        
        const totalEuro = startVal + (workDays * earnVal) - totalPenalty;

        document.getElementById("totalEuro").textContent = Math.round(totalEuro).toLocaleString("de-DE");
        document.getElementById("totalBaht").textContent = Math.round(totalEuro * 38).toLocaleString("de-DE");

        localStorage.setItem("startBudget", startBudgetInput.value);
        localStorage.setItem("dailyEarn", dailyEarnInput.value);
    }

    if(startBudgetInput) startBudgetInput.addEventListener("input", updateFinance);
    if(dailyEarnInput) dailyEarnInput.addEventListener("input", updateFinance);

    // COUNTDOWN & WETTER
    const dateInput = document.getElementById("dateInput");
    if(dateInput) {
        dateInput.value = localStorage.getItem("targetDate") || "";
        dateInput.addEventListener("change", () => {
            localStorage.setItem("targetDate", dateInput.value);
            updateTimer();
        });
    }

    function updateTimer() {
        if (!dateInput || !dateInput.value) return;
        const diff = new Date(dateInput.value) - new Date();
        const d = Math.ceil(diff / 86400000);
        document.getElementById("timer").textContent = d > 0 ? `${d} Tage bis Thailand` : "ABFLUG! ✈️";
    }

    async function getWeather() {
        try {
            const resBr = await fetch("https://api.open-meteo.com/v1/forecast?latitude=53.07&longitude=8.80&current_weather=true").then(r => r.json());
            const resBk = await fetch("https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.51&current_weather=true").then(r => r.json());
            document.getElementById("temp-bremen").textContent = Math.round(resBr.current_weather.temperature);
            document.getElementById("temp-bangkok").textContent = Math.round(resBk.current_weather.temperature);
        } catch (e) { console.log("Wetter Fehler"); }
    }

    updateCleanAndFinance();
    updateTimer();
    getWeather();
});
