document.addEventListener("DOMContentLoaded", () => {
    // SOUNDS
    const cashSound = new Audio("https://www.soundjay.com/misc/sounds/cash-register-05.mp3");
    const gymSound = new Audio("https://www.myinstants.com/media/sounds/yea-buddy.mp3");
    const failSound = new Audio("https://www.myinstants.com/media/sounds/oh-no-no-no-tik-tok-song-sound-effect.mp3"); 

    // MOTIVATIONSSPRÜCHE (Brasilien Edition)
    const quotes = [
        "Disziplin schlägt Motivation. Jeden Tag.",
        "Rio wartet. Bremen ist nur eine Zwischenstation.",
        "Stärke entsteht, wenn Ausreden sterben.",
        "Wer heute durchzieht, lebt morgen freier.",
        "Heute investieren. Später Copacabana.",
        "Bleib nüchtern. Bleib klar. Bleib dran, du Löwe.",
        "Erfolg ist leise – Zweifel sind laut."
    ];

    // QUOTE LOGIK
    let qIndex = parseInt(localStorage.getItem("lastQ")) || 0;
    const quoteEl = document.getElementById("quote");
    if(quoteEl) {
        quoteEl.textContent = quotes[qIndex % quotes.length];
        localStorage.setItem("lastQ", (qIndex + 1));
    }

    // DATA LOADING
    let gymCount = parseInt(localStorage.getItem("gymCount")) || 0;
    let cleanDays = parseInt(localStorage.getItem("manualCleanDays")) || 0;
    let totalPenalty = parseInt(localStorage.getItem("totalPenalty")) || 0;
    let lastEuro = 0; // Speicher für Animation
    
    const gymDisplay = document.getElementById("gymCountDisplay");
    const cleanDisplay = document.getElementById("cleanDaysDisplay");

    // ANIMATION FUNKTION (Counter-Up)
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            obj.innerHTML = current.toLocaleString("de-DE");
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // GYM LOGIK
    if(gymDisplay) gymDisplay.textContent = gymCount;
    document.getElementById("gymBtn").addEventListener("click", function() {
        try { gymSound.play(); } catch(e) {}
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

    // FINANZ LOGIK (MIT ANIMATION)
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
        
        const totalEuro = Math.round(startVal + (workDays * earnVal) - totalPenalty);
        const totalReal = Math.round(totalEuro * 6); // Kurs 1:6 für BRL

        if (totalEuro !== lastEuro) {
            animateValue("totalEuro", lastEuro, totalEuro, 1000);
            animateValue("totalReal", Math.round(lastEuro * 6), totalReal, 1000);
            lastEuro = totalEuro;
        }

        localStorage.setItem("startBudget", startVal);
        localStorage.setItem("dailyEarn", earnVal);
    }

    startBudgetInput.addEventListener("input", updateFinance);
    dailyEarnInput.addEventListener("input", updateFinance);

    // COUNTDOWN LOGIK (SEKUNDENGENAU)
    const dateInput = document.getElementById("dateInput");
    if(dateInput) {
        dateInput.value = localStorage.getItem("targetDate") || "";
        dateInput.addEventListener("change", () => {
            localStorage.setItem("targetDate", dateInput.value);
        });
    }

    function startTimer() {
        const timerEl = document.getElementById("timer");
        setInterval(() => {
            if (!dateInput || !dateInput.value) return;
            const target = new Date(dateInput.value).getTime();
            const now = new Date().getTime();
            const distance = target - now;

            if (distance < 0) {
                timerEl.innerHTML = "SAMBA! 💃";
                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            timerEl.innerHTML = `${d}d <span style="font-size: 1.2rem; opacity: 0.6;">${h}h ${m}m</span>`;
        }, 1000);
    }

    // WETTER LOGIK (RIO DE JANEIRO)
    async function getWeather() {
        try {
            const resBr = await fetch("https://api.open-meteo.com/v1/forecast?latitude=53.07&longitude=8.80&current_weather=true").then(r => r.json());
            const resRio = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-22.90&longitude=-43.17&current_weather=true").then(r => r.json());
            
            const tBr = Math.round(resBr.current_weather.temperature);
            const tRio = Math.round(resRio.current_weather.temperature);
            
            document.getElementById("temp-bremen").textContent = tBr;
            document.getElementById("temp-rio").textContent = tRio;
            
            const diff = tRio - tBr;
            const diffEl = document.getElementById("temp-diff");
            if(diffEl) diffEl.textContent = `${diff > 0 ? '+' : ''}${diff}° WÄRMER`;
        } catch (e) { console.log("Wetter Fehler"); }
    }

    // INIT
    updateCleanAndFinance();
    startTimer();
    getWeather();
});

