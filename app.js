document.addEventListener("DOMContentLoaded", () => {
    // SOUNDS
    const cashSound = new Audio("https://www.soundjay.com/misc/sounds/cash-register-05.mp3");
    const gymSound = new Audio("https://www.myinstants.com/media/sounds/yea-buddy.mp3");
    const failSound = new Audio("https://www.myinstants.com/media/sounds/oh-no-no-no-tik-tok-song-sound-effect.mp3"); 

    const quotes = [
        "Disziplin schlägt Motivation. Jeden Tag.",
        "Bangkok wartet. Bremen ist nur eine Zwischenstation.",
        "Stärke entsteht, wenn Ausreden sterben.",
        "Wer heute durchzieht, lebt morgen freier.",
        "Heute investieren. Später ficken.",
        "Bleib nüchtern. Bleib klar. Bleib dran, du Löwe.",
        "Erfolg ist leise – Zweifel sind laut."
    ];

    // QUOTE LOGIK
    let qIndex = parseInt(localStorage.getItem("lastQ")) || 0;
    document.getElementById("quote").textContent = quotes[qIndex % quotes.length];
    localStorage.setItem("lastQ", (qIndex + 1));

    // DATA LOADING
    let gymCount = parseInt(localStorage.getItem("gymCount")) || 0;
    let cleanDays = parseInt(localStorage.getItem("manualCleanDays")) || 0;
    let totalPenalty = parseInt(localStorage.getItem("totalPenalty")) || 0;
    
    const gymDisplay = document.getElementById("gymCountDisplay");
    const cleanDisplay = document.getElementById("cleanDaysDisplay");
    
    // GYM LOGIK
    if(gymDisplay) gymDisplay.textContent = gymCount;
    document.getElementById("gymBtn").addEventListener("click", function() {
        try { gymSound.play(); } catch(e) {}
        gymCount++;
        localStorage.setItem("gymCount", gymCount);
        gymDisplay.textContent = gymCount;
        this.parentElement.classList.add("just-clicked");
        setTimeout(() => this.parentElement.classList.remove("just-clicked"), 400);
    });

    document.getElementById("resetGym").addEventListener("click", () => {
        if(confirm("Training wirklich auf 0 setzen?")) {
            gymCount = 0;
            localStorage.setItem("gymCount", 0);
            gymDisplay.textContent = 0;
        }
    });

    // CLEAN LOGIK
    function updateCleanAndFinance() {
        if(cleanDisplay) cleanDisplay.textContent = cleanDays;
        const penaltyEl = document.getElementById("penaltyInfo");
        if(penaltyEl) penaltyEl.textContent = totalPenalty > 0 ? `Abzug durch Rückfall: -${totalPenalty}€` : "";
        updateFinance();
    }

    document.getElementById("cleanStayBtn").addEventListener("click", function() {
        try { cashSound.play(); } catch(e) {}
        cleanDays++;
        localStorage.setItem("manualCleanDays", cleanDays);
        updateCleanAndFinance();
        this.parentElement.classList.add("just-clicked");
        setTimeout(() => this.parentElement.classList.remove("just-clicked"), 400);
    });

    document.getElementById("resetClean").addEventListener("click", () => {
        if(confirm("Echt jetzt? Rückfall kostet 10€ Strafe!")) {
            try { failSound.play(); } catch(e) {}
            cleanDays = 0; 
            totalPenalty += 10; 
            localStorage.setItem("manualCleanDays", 0);
            localStorage.setItem("totalPenalty", totalPenalty);
            updateCleanAndFinance();
        }
    });

    // FINANZ LOGIK
    const startBudgetInput = document.getElementById("startBudget");
    const dailyEarnInput = document.getElementById("dailyEarn");
    if(startBudgetInput) startBudgetInput.value = localStorage.getItem("startBudget") || 0;
    if(dailyEarnInput) dailyEarnInput.value = localStorage.getItem("dailyEarn") || 50;

    function updateFinance() {
        if (!localStorage.getItem("globalStart")) localStorage.setItem("globalStart", new Date().toISOString());
        const now = new Date();
        const globalStart = new Date(localStorage.getItem("globalStart"));
        const workDays = Math.floor((now - globalStart) / (1000 * 60 * 60 * 24));
        const startVal = parseFloat(startBudgetInput.value) || 0;
        const earnVal = parseFloat(dailyEarnInput.value) || 0;
        
        const totalEuro = startVal + (workDays * earnVal) - totalPenalty;
        document.getElementById("totalEuro").textContent = Math.round(totalEuro).toLocaleString("de-DE");
        document.getElementById("totalBaht").textContent = Math.round(totalEuro * 38).toLocaleString("de-DE");
        
        localStorage.setItem("startBudget", startVal);
        localStorage.setItem("dailyEarn", earnVal);
    }

    startBudgetInput.addEventListener("input", updateFinance);
    dailyEarnInput.addEventListener("input", updateFinance);

    // COUNTDOWN
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
        const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
        document.getElementById("timer").textContent = d > 0 ? `${d} Tage bis Thailand` : "ABFLUG! ✈️";
    }

    // WETTER LOGIK (OHNE POPUPS)
    async function getWeather() {
        try {
            const resBr = await fetch("https://api.open-meteo.com/v1/forecast?latitude=53.07&longitude=8.80&current_weather=true").then(r => r.json());
            const resBk = await fetch("https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.51&current_weather=true").then(r => r.json());
            const tBr = Math.round(resBr.current_weather.temperature);
            const tBk = Math.round(resBk.current_weather.temperature);
            document.getElementById("temp-bremen").textContent = tBr;
            document.getElementById("temp-bangkok").textContent = tBk;
            
            const diff = tBk - tBr;
            const diffEl = document.getElementById("temp-diff");
            if(diffEl) diffEl.textContent = `+${diff}° WÄRMER`;
        } catch (e) { console.log("Wetter Fehler"); }
    }

    updateCleanAndFinance();
    updateTimer();
    getWeather();
});

