const output = document.getElementById("output");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const clearBtn = document.getElementById("clear");
const downloadBtn = document.getElementById("download");
const languageSelect = document.getElementById("language");
const indicator = document.getElementById("indicator");
const statusText = document.getElementById("statusText");
const themeToggle = document.getElementById("themeToggle");
const waveform = document.getElementById("waveform");

const micPermissionBtn = document.getElementById("micPermissionBtn");
const micStatus = document.getElementById("micStatus");

let recognition;
let silenceTimer;
let micAllowed = false;

/* Browser support check */
if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
  alert("Speech Recognition not supported. Use Google Chrome.");
}

/* Auto language detect */
const browserLang = navigator.language;
[...languageSelect.options].forEach(opt => {
  if (opt.value === browserLang) languageSelect.value = browserLang;
});

/* Request mic permission */
async function requestMicPermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    micAllowed = true;
    micStatus.textContent = "Microphone access granted ✅";
    micPermissionBtn.textContent = "✔ Microphone Ready";
    micPermissionBtn.disabled = true;
  } catch {
    micStatus.textContent = "Microphone permission denied ❌";
    alert("Please allow microphone permission.");
  }
}

/* Start recording */
function startRecording() {
  if (!micAllowed) {
    alert("Please allow microphone permission first.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    indicator.classList.add("active");
    waveform.classList.add("active");
    statusText.textContent = "Recording...";
  };

  recognition.onresult = (event) => {
    clearTimeout(silenceTimer);
    let transcript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    output.value = transcript;

    silenceTimer = setTimeout(() => {
      stopRecording(true);
    }, 2500);
  };

  recognition.onerror = (e) => {
    statusText.textContent = "Error: " + e.error;
    stopRecording(false);
  };

  recognition.onend = () => {
    indicator.classList.remove("active");
    waveform.classList.remove("active");
  };

  recognition.start();
}

/* Stop recording */
function stopRecording(auto = false) {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  indicator.classList.remove("active");
  waveform.classList.remove("active");
  statusText.textContent = auto ? "Stopped (Auto)" : "Stopped";
}

/* Button events */
micPermissionBtn.onclick = requestMicPermission;
startBtn.onclick = startRecording;
stopBtn.onclick = () => stopRecording(false);
clearBtn.onclick = () => output.value = "";

/* Download text */
downloadBtn.onclick = () => {
  if (!output.value.trim()) return alert("No text to download");
  const blob = new Blob([output.value], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "voice-to-text.txt";
  link.click();
};

/* Dark mode */
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
};
