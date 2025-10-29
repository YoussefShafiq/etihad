// Prayer Times Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Prayer Times Page Initialized ===');

    // Global variables
    let prayerTimesData = null;
    let countdownInterval = null;
    let currentCity = 'Cairo';

    // DOM Elements
    const citySelect = document.getElementById('citySelect');
    const refreshButton = document.getElementById('refreshPrayerTimes');
    const nextPrayerName = document.getElementById('nextPrayerName');
    const nextPrayerTime = document.getElementById('nextPrayerTime');
    const timeRemaining = document.getElementById('timeRemaining');
    const hijriDate = document.getElementById('hijriDate');
    const gregorianDate = document.getElementById('gregorianDate');
    const currentCityName = document.getElementById('currentCityName');
    const prayerTimesGrid = document.getElementById('prayerTimesGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const retryButton = document.getElementById('retryButton');
    const lastUpdateTime = document.getElementById('last-update-time');

    // Prayer names and icons
    const prayerNames = {
        fajr: { name: 'الفجر', icon: '🌅', description: 'صلاة الفجر' },
        sunrise: { name: 'الشروق', icon: '🌄', description: 'وقت الشروق' },
        dhuhr: { name: 'الظهر', icon: '☀️', description: 'صلاة الظهر' },
        asr: { name: 'العصر', icon: '🌤️', description: 'صلاة العصر' },
        maghrib: { name: 'المغرب', icon: '🌆', description: 'صلاة المغرب' },
        isha: { name: 'العشاء', icon: '🌙', description: 'صلاة العشاء' }
    };

    // Initialize the page
    function initializePage() {
        console.log('Initializing prayer times page...');

        // Load saved city preference
        const savedCity = localStorage.getItem('prayerTimesCity');
        if (savedCity) {
            currentCity = savedCity;
            citySelect.value = currentCity;
        }

        // Set up event listeners
        setupEventListeners();

        // Fetch initial prayer times
        fetchPrayerTimes(currentCity);

        console.log('✅ Prayer times page initialized successfully');
    }

    // Set up event listeners
    function setupEventListeners() {
        // City selection change
        citySelect.addEventListener('change', function () {
            currentCity = this.value;
            localStorage.setItem('prayerTimesCity', currentCity);
            fetchPrayerTimes(currentCity);
        });

        // Refresh button
        refreshButton.addEventListener('click', function () {
            fetchPrayerTimes(currentCity);
        });

        // Retry button
        retryButton.addEventListener('click', function () {
            fetchPrayerTimes(currentCity);
        });
    }

    // Fetch prayer times from API
    async function fetchPrayerTimes(city) {
        console.log(`Fetching prayer times for: ${city}`);

        showLoading(true);
        hideError();

        try {
            // Get current date
            const now = new Date();
            const day = now.getDate();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            // Using Aladhan API for prayer times
            const response = await fetch(
                `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=${encodeURIComponent(city)}&country=Egypt&method=5`
            );

            if (!response.ok) {
                throw new Error('Unable to fetch prayer times');
            }

            const data = await response.json();

            if (data.code !== 200) {
                throw new Error('Invalid response from API');
            }

            console.log('✅ Prayer times fetched successfully:', data);

            prayerTimesData = data.data;
            updatePrayerTimesDisplay(data.data);
            startCountdown();
            showLoading(false);

            // Update last update time
            updateLastUpdateTime();

        } catch (error) {
            console.error('❌ Error fetching prayer times:', error);
            showLoading(false);
            showError('لم نتمكن من جلب مواقيت الصلاة. يرجى المحاولة مرة أخرى.');
        }
    }

    // Update prayer times display
    function updatePrayerTimesDisplay(data) {
        console.log('Updating prayer times display...');

        const timings = data.timings;
        const date = data.date;

        // Update city name
        currentCityName.textContent = citySelect.options[citySelect.selectedIndex].text;

        // Update dates
        updateElementText('hijriDate', `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year}`);
        updateElementText('gregorianDate', date.readable);

        // Update prayer times grid
        updatePrayerTimesGrid(timings);

        // Update next prayer info
        updateNextPrayer(timings);

        console.log('✅ Prayer times display updated successfully');
    }

    // Update prayer times grid
    function updatePrayerTimesGrid(timings) {
        console.log('Updating prayer times grid...');

        prayerTimesGrid.innerHTML = '';

        Object.keys(prayerNames).forEach(prayerKey => {
            const prayer = prayerNames[prayerKey];
            const prayerTime = timings[prayerKey.charAt(0).toUpperCase() + prayerKey.slice(1)];

            const prayerCard = document.createElement('div');
            prayerCard.className = 'prayer-card';
            prayerCard.setAttribute('data-prayer', prayerKey);

            prayerCard.innerHTML = `
                <div class="prayer-header">
                    <div class="prayer-icon">${prayer.icon}</div>
                    <div class="prayer-name">${prayer.name}</div>
                    <div class="prayer-status"></div>
                </div>
                <div class="prayer-time">${formatTime(prayerTime)}</div>
                <div class="prayer-description">${prayer.description}</div>
            `;

            prayerTimesGrid.appendChild(prayerCard);
        });

        // Update prayer states
        updatePrayerItemStates(timings);
    }

    // Update next prayer information
    function updateNextPrayer(timings) {
        const now = new Date();
        const prayers = [
            { key: 'fajr', name: 'الفجر', time: parseTime(timings.Fajr) },
            { key: 'sunrise', name: 'الشروق', time: parseTime(timings.Sunrise) },
            { key: 'dhuhr', name: 'الظهر', time: parseTime(timings.Dhuhr) },
            { key: 'asr', name: 'العصر', time: parseTime(timings.Asr) },
            { key: 'maghrib', name: 'المغرب', time: parseTime(timings.Maghrib) },
            { key: 'isha', name: 'العشاء', time: parseTime(timings.Isha) }
        ];

        let nextPrayer = null;

        // Find next prayer
        for (const prayer of prayers) {
            if (now < prayer.time) {
                nextPrayer = prayer;
                break;
            }
        }

        // If no prayer found today, use Fajr of tomorrow
        if (!nextPrayer) {
            nextPrayer = {
                key: 'fajr',
                name: 'الفجر',
                time: parseTime(timings.Fajr)
            };
            nextPrayer.time.setDate(nextPrayer.time.getDate() + 1);
        }

        // Update next prayer display
        if (nextPrayer) {
            updateElementText('nextPrayerName', nextPrayer.name);
            updateElementText('nextPrayerTime', formatTime(timings[nextPrayer.key.charAt(0).toUpperCase() + nextPrayer.key.slice(1)]));
        }

        // Update prayer item states
        updatePrayerItemStates(timings);
    }

    // Update prayer item states
    function updatePrayerItemStates(timings) {
        const now = new Date();
        const prayers = [
            { key: 'fajr', time: parseTime(timings.Fajr) },
            { key: 'sunrise', time: parseTime(timings.Sunrise) },
            { key: 'dhuhr', time: parseTime(timings.Dhuhr) },
            { key: 'asr', time: parseTime(timings.Asr) },
            { key: 'maghrib', time: parseTime(timings.Maghrib) },
            { key: 'isha', time: parseTime(timings.Isha) }
        ];

        prayers.forEach((prayer, index) => {
            const prayerCard = document.querySelector(`.prayer-card[data-prayer="${prayer.key}"]`);
            if (!prayerCard) return;

            // Remove all state classes
            prayerCard.classList.remove('active', 'passed');

            // Check if prayer time has passed
            if (now > prayer.time) {
                prayerCard.classList.add('passed');
            }

            // Check if this is the next prayer
            const nextPrayer = prayers.find(p => now < p.time);
            if (nextPrayer && prayer.key === nextPrayer.key) {
                prayerCard.classList.add('active');
            }

            // Update status indicator
            const statusElement = prayerCard.querySelector('.prayer-status');
            if (now > prayer.time) {
                statusElement.classList.add('passed');
                statusElement.classList.remove('active');
            } else if (nextPrayer && prayer.key === nextPrayer.key) {
                statusElement.classList.add('active');
                statusElement.classList.remove('passed');
            } else {
                statusElement.classList.remove('active', 'passed');
            }
        });
    }

    // Start countdown timer
    function startCountdown() {
        // Clear existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        // Update countdown every second
        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial update
    }

    // Update countdown timer
    function updateCountdown() {
        if (!prayerTimesData) return;

        const now = new Date();
        const timings = prayerTimesData.timings;

        const prayers = [
            { key: 'fajr', time: parseTime(timings.Fajr) },
            { key: 'sunrise', time: parseTime(timings.Sunrise) },
            { key: 'dhuhr', time: parseTime(timings.Dhuhr) },
            { key: 'asr', time: parseTime(timings.Asr) },
            { key: 'maghrib', time: parseTime(timings.Maghrib) },
            { key: 'isha', time: parseTime(timings.Isha) }
        ];

        // Find next prayer
        let nextPrayerTime = null;
        for (const prayer of prayers) {
            if (now < prayer.time) {
                nextPrayerTime = prayer.time;
                break;
            }
        }

        // If no prayer found today, use Fajr of tomorrow
        if (!nextPrayerTime) {
            nextPrayerTime = parseTime(timings.Fajr);
            nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
        }

        // Calculate time difference
        const diff = nextPrayerTime - now;

        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            const remainingElement = document.querySelector('.time-remaining .remaining-value');
            if (remainingElement) {
                remainingElement.textContent = timeString;
            }
        } else {
            // If countdown reached zero, refresh prayer times
            fetchPrayerTimes(currentCity);
        }
    }

    // Utility functions
    function formatTime(time24) {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours);
        const period = hour >= 12 ? 'م' : 'ص';

        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minutes} ${period}`;
    }

    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    function updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-EG');
        updateElementText('last-update-time', timeString);
    }

    function showLoading(show) {
        if (loadingState) {
            loadingState.style.display = show ? 'flex' : 'none';
        }
        if (prayerTimesGrid) {
            prayerTimesGrid.style.display = show ? 'none' : 'grid';
        }
    }

    function showError(message) {
        if (errorState) {
            errorState.style.display = 'block';
            errorState.querySelector('p').textContent = message;
        }
        if (prayerTimesGrid) {
            prayerTimesGrid.style.display = 'none';
        }
    }

    function hideError() {
        if (errorState) {
            errorState.style.display = 'none';
        }
    }

    // Initialize the page when DOM is loaded
    initializePage();
});