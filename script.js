let activeTimer = null;

// Timer Function
function startTimer(minutes, taskId) {
    if (activeTimer) clearInterval(activeTimer);
    let time = minutes * 60;
    const timerDisplay = document.getElementById("timer-display");
    activeTimer = setInterval(() => {
        let mins = Math.floor(time / 60);
        let secs = time % 60;
        timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        time--;
        if (time < 0) {
            clearInterval(activeTimer);
            timerDisplay.textContent = "Done!";
            document.getElementById(taskId).style.opacity = "0.5";
        }
    }, 1000);
}

// Edit Energy Zones
function editEnergy() {
    alert("Edit energy zones (future: AI suggestions or sliders).");
}

// Reprioritize (Placeholder for AI/Backend)
function reprioritize() {
    alert("Reprioritizing tasks around Google Calendar and energy zones...");
    // Future: AI logic to reorder tasks
}

// Break Function
function addBreak() {
    if (activeTimer) clearInterval(activeTimer);
    document.getElementById("timer-display").textContent = "15:00";
    startTimer(15);
}

// AFK Toggle
let isAFK = false;
function toggleAFK() {
    isAFK = !isAFK;
    document.body.style.opacity = isAFK ? "0.7" : "1";
    if (isAFK && activeTimer) clearInterval(activeTimer);
    document.getElementById("timer-display").textContent = isAFK ? "AFK" : "00:00";
}

// Voice Control (AI-Friendly)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log(command);
    if (command.includes("add task")) {
        alert("Task added: " + command); // Future: AI parse to task object
    } else if (command.includes("start task call client")) {
        startTimer(30, "task1");
    } else if (command.includes("start task write report")) {
        startTimer(60, "task2");
    } else if (command.includes("break")) {
        addBreak();
    } else if (command.includes("afk")) {
        toggleAFK();
    } else if (command.includes("reprioritize")) {
        reprioritize();
    }
};
document.getElementById("voice-btn").onclick = () => recognition.start();
