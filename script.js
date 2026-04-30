// LOGIKA JAM INDONESIA (WIB)
function updateClock() {
    const now = new Date();
    const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeString = now.toLocaleTimeString('id-ID', options);
    document.getElementById('realTimeClock').innerText = timeString + ' WIB';
}
setInterval(updateClock, 1000);
updateClock();

// LOGIKA BATERAI (BATTERY STATUS API)
async function initBattery() {
    const batteryLevelText = document.getElementById('batteryLevel');
    const batteryIcon = document.getElementById('batteryIcon');
    const batteryWidget = document.getElementById('batteryWidget');

    // Fungsi untuk update UI Baterai
    function updateBatteryUI(battery) {
        const level = Math.round(battery.level * 100);
        batteryLevelText.innerText = `${level}%`;

        // Reset kelas icon
        batteryIcon.className = 'fa-solid';

        // Tentukan warna dan ikon berdasarkan kondisi charge/level
        if (battery.charging) {
            batteryIcon.classList.add('fa-bolt', 'battery-charging');
        } else {
            if (level > 80) {
                batteryIcon.classList.add('fa-battery-full', 'battery-full');
            } else if (level > 50) {
                batteryIcon.classList.add('fa-battery-three-quarters', 'battery-full');
            } else if (level > 25) {
                batteryIcon.classList.add('fa-battery-half', 'battery-mid');
            } else if (level > 10) {
                batteryIcon.classList.add('fa-battery-quarter', 'battery-low');
            } else {
                batteryIcon.classList.add('fa-battery-empty', 'battery-low');
            }
        }
    }

    // Cek apakah browser mendukung Battery API
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            
            // Update saat pertama diload
            updateBatteryUI(battery);

            // Event listener kalau ada perubahan real-time (dicolok charger/level turun)
            battery.addEventListener('chargingchange', () => updateBatteryUI(battery));
            battery.addEventListener('levelchange', () => updateBatteryUI(battery));

        } catch (error) {
            console.log("Gagal memuat info baterai:", error);
            batteryWidget.style.display = 'none'; // Sembunyikan widget kalau error
        }
    } else {
        // Sembunyikan widget kalau browser (misal Safari iOS lama) tidak mendukung API ini
        batteryWidget.style.display = 'none';
    }
}
// Jalankan fungsi baterai
initBattery();

//  LOGIKA TOGGLE TEMA 
const wrapper = document.getElementById('themeToggleWrapper');
const tabDark = document.getElementById('tabDark');
const tabLight = document.getElementById('tabLight');
const prefersLight = window.matchMedia("(prefers-color-scheme: light)");

function updateTabUI() {
    const isLight = document.body.classList.contains('light-mode') || (prefersLight.matches && !document.body.classList.contains('dark-mode'));
    if (isLight) {
        wrapper.classList.add('slide-right'); tabLight.classList.add('active'); tabDark.classList.remove('active');
    } else {
        wrapper.classList.remove('slide-right'); tabDark.classList.add('active'); tabLight.classList.remove('active');
    }
}
updateTabUI();

wrapper.addEventListener('click', () => {
    if (prefersLight.matches) document.body.classList.toggle('dark-mode');
    else document.body.classList.toggle('light-mode');
    updateTabUI();
});

prefersLight.addEventListener('change', () => {
    document.body.classList.remove('light-mode', 'dark-mode'); updateTabUI();
});

//  LOGIKA VIDEO PROFIL 
const videoElement = document.getElementById('avatarVideo');
const fallbackElement = document.getElementById('avatarFallback');
const videoSource = document.getElementById('videoSource');

videoSource.addEventListener('error', () => { videoElement.style.display = 'none'; fallbackElement.style.display = 'block'; });
videoElement.addEventListener('canplay', () => { fallbackElement.style.display = 'none'; videoElement.style.display = 'block'; });

//  LOGIKA MUSIC PLAYER 
const audio = document.getElementById('bgMusic');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const musicCard = document.getElementById('musicCard'); 
const progressBg = document.getElementById('progressBg');
const progressFill = document.getElementById('progressFill');
const currTimeText = document.getElementById('currTime');
const totTimeText = document.getElementById('totTime');

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

audio.addEventListener('loadedmetadata', () => {
    totTimeText.innerText = formatTime(audio.duration);
});

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playIcon.className = 'fa-solid fa-pause';
        playBtn.classList.add('playing-state');
        musicCard.classList.add('playing'); 
    } else {
        audio.pause();
        playIcon.className = 'fa-solid fa-play';
        playBtn.classList.remove('playing-state');
        musicCard.classList.remove('playing'); 
    }
});

audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = progressPercent + '%';
    currTimeText.innerText = formatTime(audio.currentTime);
    if(totTimeText.innerText === '0:00') totTimeText.innerText = formatTime(audio.duration);
});

progressBg.addEventListener('click', (e) => {
    const rect = progressBg.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickPosition / rect.width));
    if (audio.duration) audio.currentTime = clickPercent * audio.duration;
});

audio.addEventListener('ended', () => {
    playIcon.className = 'fa-solid fa-play';
    playBtn.classList.remove('playing-state');
    musicCard.classList.remove('playing');
    progressFill.style.width = '0%';
    currTimeText.innerText = '0:00';
});