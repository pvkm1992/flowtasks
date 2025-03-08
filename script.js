// Replace this placeholder with your Firebase config from Firebase Console
// Go to Firebase Console > Project Settings > Your Apps > Web App > Copy firebaseConfig


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYTvnVzfsfEUgvBMbR0ljXmJX2CRF_v_E",
  authDomain: "flowtasks-5b03c.firebaseapp.com",
  projectId: "flowtasks-5b03c",
  storageBucket: "flowtasks-5b03c.firebasestorage.app",
  messagingSenderId: "440784117679",
  appId: "1:440784117679:web:3b72299f6d1c445407195a",
  measurementId: "G-NMKZ36LCFK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let activeTimer = null;

// Load Energy Zones from Firestore
function loadEnergyZones() {
    const energyList = document.getElementById("energy-list");
    energyList.innerHTML = "";
    db.collection("energy_zones").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement("div");
            div.className = `energy-card ${data.type.toLowerCase()}-energy`;
            div.textContent = `${data.type}: ${data.start} - ${data.end}`;
            energyList.appendChild(div);
        });
    }).catch((error) => {
        console.error("Error loading energy zones:", error);
    });
}

// Load Tasks from Firestore
function loadTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    db.collection("tasks").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement("div");
            div.className = `task-card ${data.priority.toLowerCase()}`;
            div.id = doc.id;
            div.innerHTML = `
                <span>${data.name} (${data.duration} mins) - ${data.priority} - ${data.deadline}</span>
                <button class="start-btn" onclick="startTimer(${data.duration}, '${doc.id}')">Start</button>
            `;
            taskList.appendChild(div);
        });
    }).catch((error) => {
        console.error("Error loading tasks:", error);
    });
}

// Load Calendar with Firestore Data
function loadCalendar() {
    const calendarTimeline = document.getElementById("calendar-timeline");
    calendarTimeline.innerHTML = "";
    const todayEvents = [
        { time: "8:00 AM", type: "energy", text: "High Energy" },
        { time: "10:00 AM", type: "event", text: "Team Meeting (1 hr)" },
        { time: "1:00 PM", type: "energy", text: "Medium Energy" },
        { time: "6:00 PM", type: "energy", text: "Low Energy" }
    ];

    // Fetch Google Calendar events from Firestore
    db.collection("calendar_events").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            todayEvents.push({ time: data.start, type: "event", text: data.title });
        });

        // Fetch tasks
        db.collection("tasks").get().then((taskSnapshot) => {
            taskSnapshot.forEach((doc) => {
                const data = doc.data();
                todayEvents.push({
                    time: data.startTime || "TBD",
                    type: "task",
                    text: `${data.name} (${data.duration} mins)`,
                    class: data.priority.toLowerCase()
                });
            });

            // Sort and display events
            todayEvents.sort((a, b) => a.time.localeCompare(b.time));
            todayEvents.forEach((item) => {
                const div = document.createElement("div");
                div.className = "time-slot";
                div.innerHTML = `${item.time} - <span class="${item.type} ${item.class || ''}">${item.text}</span>`;
                calendarTimeline.appendChild(div);
            });
        });
    }).catch((error) => {
        console.error("Error loading calendar:", error);
    });
}

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

// Edit Energy Zones (Placeholder)
function editEnergy() {
    alert("Edit energy zones (future: form or AI suggestions).");
    // Example to add programmatically: db.collection("energy_zones").doc("high").set({ type: "High", start: "8 AM", end: "12 PM" });
}

// Reprioritize (AI Placeholder)
function reprioritize() {
    alert("Reprioritizing tasks around Google Calendar and energy zones...");
    loadTasks(); // Refresh tasks for now
    // Future: Integrate AI via Firebase Functions
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

// Voice Control
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("Voice command:", command);
    if (command.includes("add task")) {
        const [_, name, duration] = command.match(/add task (.+) (\d+)/) || [];
        if (name && duration) {
            db.collection("tasks").add({
                name,
                duration: parseInt(duration),
                priority: "Medium",
                deadline: "Mar 10, 2025",
                startTime: "TBD"
            }).then(() => loadTasks()).catch((error) => {
                console.error("Error adding task:", error);
            });
        }
    } else if (command.includes("start task call client")) {
        startTimer(30, "task1");
    } else if (command.includes("reprioritize")) {
        reprioritize();
    }
};
document.getElementById("voice-btn").onclick = () => recognition.start();

// Initial Load
loadEnergyZones();
loadTasks();
loadCalendar();
