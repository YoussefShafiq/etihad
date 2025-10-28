// World Clock Page JavaScript
class WorldClock {
    constructor() {
        this.cities = [
            {
                name: "القاهرة",
                country: "مصر",
                timezone: "Africa/Cairo",
                flag: "🇪🇬",
                offset: "+2",
                region: "middle-east"
            },
            {
                name: "دبي",
                country: "الإمارات",
                timezone: "Asia/Dubai",
                flag: "🇦🇪",
                offset: "+4",
                region: "middle-east"
            },
            {
                name: "الرياض",
                country: "السعودية",
                timezone: "Asia/Riyadh",
                flag: "🇸🇦",
                offset: "+3",
                region: "middle-east"
            },
            {
                name: "لندن",
                country: "المملكة المتحدة",
                timezone: "Europe/London",
                flag: "🇬🇧",
                offset: "+0",
                region: "europe"
            },
            {
                name: "باريس",
                country: "فرنسا",
                timezone: "Europe/Paris",
                flag: "🇫🇷",
                offset: "+1",
                region: "europe"
            },
            {
                name: "نيويورك",
                country: "الولايات المتحدة",
                timezone: "America/New_York",
                flag: "🇺🇸",
                offset: "-4",
                region: "america"
            },
            {
                name: "لوس أنجلوس",
                country: "الولايات المتحدة",
                timezone: "America/Los_Angeles",
                flag: "🇺🇸",
                offset: "-7",
                region: "america"
            },
            {
                name: "طوكيو",
                country: "اليابان",
                timezone: "Asia/Tokyo",
                flag: "🇯🇵",
                offset: "+9",
                region: "asia"
            },
            {
                name: "بكين",
                country: "الصين",
                timezone: "Asia/Shanghai",
                flag: "🇨🇳",
                offset: "+8",
                region: "asia"
            },
            {
                name: "سيدني",
                country: "أستراليا",
                timezone: "Australia/Sydney",
                flag: "🇦🇺",
                offset: "+10",
                region: "asia"
            },
            {
                name: "جوهانسبرغ",
                country: "جنوب أفريقيا",
                timezone: "Africa/Johannesburg",
                flag: "🇿🇦",
                offset: "+2",
                region: "africa"
            },
            {
                name: "ريو دي جانيرو",
                country: "البرازيل",
                timezone: "America/Sao_Paulo",
                flag: "🇧🇷",
                offset: "-3",
                region: "america"
            }
        ];

        this.filteredCities = [...this.cities];
        this.updateInterval = null;

        this.init();
    }

    init() {
        console.log('🌍 Initializing World Clock...');

        // Initialize event listeners
        this.initEventListeners();

        // Start updating clocks
        this.startClockUpdates();

        // Initial render
        this.renderCities();

        console.log('✅ World Clock initialized successfully');
    }

    initEventListeners() {
        // Search functionality
        const citySearch = document.getElementById('citySearch');
        const regionFilter = document.getElementById('regionFilter');
        const sortBy = document.getElementById('sortBy');
        const refreshButton = document.getElementById('refreshClocks');
        const retryButton = document.getElementById('retryButton');

        // Add event listeners
        citySearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        regionFilter.addEventListener('change', (e) => this.handleFilter(e.target.value));
        sortBy.addEventListener('change', (e) => this.handleSort(e.target.value));
        refreshButton.addEventListener('click', () => this.refreshClocks());
        retryButton.addEventListener('click', () => this.refreshClocks());

        console.log('✅ Event listeners initialized');
    }

    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();

        this.filteredCities = this.cities.filter(city =>
            city.name.toLowerCase().includes(term) ||
            city.country.toLowerCase().includes(term)
        );

        this.renderCities();
    }

    handleFilter(region) {
        if (region === 'all') {
            this.filteredCities = [...this.cities];
        } else {
            this.filteredCities = this.cities.filter(city => city.region === region);
        }

        this.renderCities();
    }

    handleSort(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredCities.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'time':
                // Sort by current time (simplified - would need actual time comparison)
                this.filteredCities.sort((a, b) => a.offset.localeCompare(b.offset));
                break;
            case 'offset':
                this.filteredCities.sort((a, b) => {
                    const offsetA = parseInt(a.offset);
                    const offsetB = parseInt(b.offset);
                    return offsetA - offsetB;
                });
                break;
        }

        this.renderCities();
    }

    startClockUpdates() {
        // Update immediately
        this.updateAllClocks();

        // Update every second
        this.updateInterval = setInterval(() => {
            this.updateAllClocks();
        }, 1000);

        console.log('🕐 Clock updates started');
    }

    updateAllClocks() {
        const now = new Date();

        // Update current time display
        this.updateCurrentTime(now);

        // Update GMT display
        this.updateGMTTime(now);

        // Update all city clocks
        this.updateCityClocks(now);

        // Update time difference
        this.updateTimeDifference(now);
    }

    updateCurrentTime(now) {
        const timeElement = document.getElementById('currentTime');
        const dateElement = document.getElementById('currentDate');

        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('ar-EG');
        }

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    updateGMTTime(now) {
        const gmtTimeElement = document.getElementById('gmt-time');
        const gmtDateElement = document.getElementById('gmt-date');

        // GMT time in Arabic numbers (using the original method)
        const gmtTime = now.toUTCString().split(' ')[4];

        const gmtDate = now.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });

        if (gmtTimeElement) gmtTimeElement.textContent = gmtTime;
        if (gmtDateElement) gmtDateElement.textContent = gmtDate;
    }

    updateCityClocks(now) {
        this.filteredCities.forEach(city => {
            this.updateCityClock(city, now);
        });
    }

    updateCityClock(city, baseTime) {
        try {
            // Create time for specific timezone
            const cityTime = new Date(baseTime.toLocaleString("en-US", { timeZone: city.timezone }));

            // Format time
            const timeString = cityTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Format date
            const dateString = cityTime.toLocaleDateString('ar-EG', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Get hours for day/night indicator
            const hours = cityTime.getHours();
            const isDayTime = hours >= 6 && hours < 18;

            // Update DOM elements
            const timeElement = document.getElementById(`time-${city.name.replace(/\s+/g, '-')}`);
            const dateElement = document.getElementById(`date-${city.name.replace(/\s+/g, '-')}`);
            const iconElement = document.getElementById(`icon-${city.name.replace(/\s+/g, '-')}`);
            const periodElement = document.getElementById(`period-${city.name.replace(/\s+/g, '-')}`);
            const cardElement = document.querySelector(`.city-card[data-city="${city.name}"]`);

            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;

            // Update day/night indicator
            this.updateDayNightIndicator(hours, iconElement, periodElement, cardElement);

        } catch (error) {
            console.error(`❌ Error updating time for ${city.name}:`, error);
        }
    }

    updateDayNightIndicator(hours, iconElement, periodElement, cardElement) {
        let icon = '🌞';
        let period = 'نهار';
        let isDayTime = hours >= 6 && hours < 18;

        if (hours >= 18 || hours < 6) {
            icon = '🌙';
            period = 'ليل';
            isDayTime = false;
        } else if (hours >= 6 && hours < 12) {
            icon = '🌅';
            period = 'صباح';
        } else if (hours >= 12 && hours < 18) {
            icon = '🌇';
            period = 'مساء';
        }

        if (iconElement) iconElement.textContent = icon;
        if (periodElement) periodElement.textContent = period;

        // Update card class for styling
        if (cardElement) {
            cardElement.classList.remove('daytime', 'nighttime');
            cardElement.classList.add(isDayTime ? 'daytime' : 'nighttime');
        }
    }

    updateTimeDifference(now) {
        const localOffset = -now.getTimezoneOffset() / 60;
        const gmtOffset = 0;
        const difference = localOffset - gmtOffset;

        const differenceElement = document.getElementById('timeDifference');
        if (differenceElement) {
            const sign = difference >= 0 ? '+' : '';
            differenceElement.textContent = `${sign}${difference} ساعة`;
        }
    }

    renderCities() {
        const citiesGrid = document.getElementById('citiesGrid');
        if (!citiesGrid) return;

        // Clear existing cities
        citiesGrid.innerHTML = '';

        if (this.filteredCities.length === 0) {
            citiesGrid.innerHTML = `
                <div class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                    <h3>لا توجد نتائج</h3>
                    <p>لم نتمكن من العثور على مدن تطابق بحثك.</p>
                </div>
            `;
            return;
        }

        // Create city cards
        this.filteredCities.forEach(city => {
            const cityCard = document.createElement('div');
            cityCard.className = 'city-card';
            cityCard.setAttribute('data-city', city.name);

            // Initial day/night class
            const now = new Date();
            const cityTime = new Date(now.toLocaleString("en-US", { timeZone: city.timezone }));
            const hours = cityTime.getHours();
            const isDayTime = hours >= 6 && hours < 18;
            cityCard.classList.add(isDayTime ? 'daytime' : 'nighttime');

            cityCard.innerHTML = `
                <div class="city-header">
                    <div class="city-info">
                        <div class="city-flag">${city.flag}</div>
                        <div class="city-details">
                            <h3>${city.name}</h3>
                            <div class="city-country">${city.country}</div>
                        </div>
                    </div>
                    <div class="timezone">UTC${city.offset}</div>
                </div>
                <div class="clock-display">
                    <div class="city-time" id="time-${city.name.replace(/\s+/g, '-')}">--:--:--</div>
                    <div class="city-date" id="date-${city.name.replace(/\s+/g, '-')}">-- -- ----</div>
                </div>
                <div class="day-night">
                    <div class="day-night-icon" id="icon-${city.name.replace(/\s+/g, '-')}">🌞</div>
                    <div class="day-night-text" id="period-${city.name.replace(/\s+/g, '-')}">--</div>
                </div>
            `;

            citiesGrid.appendChild(cityCard);
        });

        // Update times immediately
        this.updateCityClocks(new Date());

        console.log(`✅ Rendered ${this.filteredCities.length} cities`);
    }

    refreshClocks() {
        console.log('🔄 Refreshing clocks...');
        this.updateAllClocks();
        this.updateLastUpdateTime();
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-EG');

        const lastUpdateElement = document.getElementById('lastUpdateTime');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = timeString;
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const citiesGrid = document.getElementById('citiesGrid');
        const errorState = document.getElementById('errorState');

        if (loadingState) loadingState.style.display = show ? 'flex' : 'none';
        if (citiesGrid) citiesGrid.style.display = show ? 'none' : 'grid';
        if (errorState) errorState.style.display = 'none';
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const citiesGrid = document.getElementById('citiesGrid');
        const loadingState = document.getElementById('loadingState');

        if (errorState) errorState.style.display = 'block';
        if (citiesGrid) citiesGrid.style.display = 'none';
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== World Clock Initializing ===');

    // Initialize world clock
    const worldClock = new WorldClock();

    // Make it globally available for debugging
    window.worldClock = worldClock;

    console.log('=== World Clock Ready ===');
});

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});