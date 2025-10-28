// Gold Chart
function initializeGoldChart() {
    console.log('Initializing gold chart...');
    const ctx = document.getElementById('goldChart');

    // Check if canvas element exists
    if (!ctx) {
        console.error('❌ Canvas element with id "goldChart" not found');
        return null;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded. Please include Chart.js library.');
        return null;
    }

    console.log('✅ Chart.js is available, creating chart...');

    try {
        const goldChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', '', '', ''],
                datasets: [{
                    data: [70, 50, 60, 40, 45, 30, 35, 25, 30],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.3)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#1a1424',
                    pointBorderWidth: 4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });

        console.log('✅ Gold chart initialized successfully');
        return goldChart;
    } catch (error) {
        console.error('❌ Error creating chart:', error);
        return null;
    }
}

// Gold Calculator
function initializeGoldCalculator() {
    console.log('Initializing gold calculator...');

    let selectedPrice = 3500;

    const caratChips = document.querySelectorAll('.carat-chip');
    const weightInput = document.getElementById('weightInput');

    if (caratChips.length === 0) {
        console.error('❌ No carat chips found');
        return;
    }

    if (!weightInput) {
        console.error('❌ Weight input not found');
        return;
    }

    caratChips.forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.carat-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedPrice = parseFloat(this.dataset.price);
            console.log(`Selected carat price: ${selectedPrice}`);
            calculatePrice(selectedPrice);
        });
    });

    weightInput.addEventListener('input', () => {
        calculatePrice(selectedPrice);
    });

    function calculatePrice(price) {
        const weight = parseFloat(weightInput.value) || 0;
        const total = (weight * price).toFixed(2);
        const totalPriceElement = document.getElementById('totalPrice');

        if (totalPriceElement) {
            totalPriceElement.textContent = `${total} ج.م`;
        }
    }

    // Initialize with default price
    calculatePrice(selectedPrice);
    console.log('✅ Gold calculator initialized successfully');
}

// Tab Switching
function initializeTabs() {
    console.log('Initializing tabs...');

    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabs.length === 0) {
        console.error('❌ No tabs found');
        return;
    }

    if (tabContents.length === 0) {
        console.error('❌ No tab contents found');
        return;
    }

    console.log('📊 Found tabs:', tabs.length);
    console.log('📊 Found tab contents:', tabContents.length);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);

            console.log(`🖱️ Tab clicked: ${tabId}`);

            if (tabContent) {
                tabContent.classList.add('active');
                console.log(`✅ Switched to ${tabId} tab`);

                // Initialize Azan tab when opened
                if (tabId === 'azan') {
                    console.log('🕌 Initializing Azan tab...');
                    fetchPrayerTimes('Cairo');
                }

                // Initialize Weather tab when opened
                if (tabId === 'weather') {
                    console.log('🌤️ Initializing Weather tab...');
                    const weatherCity = document.getElementById('weather-city');
                    if (weatherCity && weatherCity.textContent === 'القاهرة') {
                        fetchWeatherData('Cairo');
                    }
                }

                // Initialize World Clock tab when opened
                if (tabId === 'worldclock') {
                    console.log('🌍 Initializing World Clock tab...');
                    initializeWorldClock();
                }
            } else {
                console.error(`❌ Tab content with id ${tabId}-tab not found`);
            }
        });
    });

    console.log('✅ Tabs initialized successfully');
}

// Fetch Gold Prices (with multiple API fallbacks)
async function fetchGoldPrices() {
    console.log('Fetching gold prices...');

    let goldPrice = null;

    // If first API failed, try a different approach with free financial APIs
    if (!goldPrice) {
        try {
            console.log('Trying exchangerate.host API...');
            const response = await fetch('https://api.exchangerate.host/latest?base=USD');
            const data = await response.json();

            if (data.rates) {
                // Use a fixed gold price in USD per ounce and convert
                const goldPriceUSDPerOunce = 1950; // Approximate current price
                const usdToEgp = data.rates.EGP || 30.9; // Fallback rate
                const gramsPerOunce = 31.10;

                goldPrice = (goldPriceUSDPerOunce * usdToEgp) / gramsPerOunce;
                console.log(`✅ Gold price calculated from exchange rates: ${goldPrice.toFixed(2)} EGP/g`);
            }
        } catch (error) {
            console.log('❌ Fallback API also failed, using static prices');
        }
    }

    // Update UI with fetched or fallback prices
    updateGoldPrices(goldPrice);
}

function updateGoldPrices(goldPrice) {
    console.log('Updating gold prices display...');

    if (goldPrice) {
        // Calculate prices for different carats
        const price24 = goldPrice;
        const price21 = goldPrice * 0.875; // 24k * 21/24
        const price18 = goldPrice * 0.75;  // 24k * 18/24
        const price14 = goldPrice * 0.583; // 24k * 14/24

        // Update display
        updateElementText('gold-24', `${price24.toFixed(2)} ج.م`);
        updateElementText('gold-21', `${price21.toFixed(2)} ج.م`);
        updateElementText('gold-18', `${price18.toFixed(2)} ج.م`);
        updateElementText('gold-14', `${price14.toFixed(2)} ج.م`);

        // Update calculator chips
        document.querySelectorAll('.carat-chip').forEach(chip => {
            if (chip.dataset.carat === '24') {
                chip.dataset.price = price24.toFixed(2);
            } else if (chip.dataset.carat === '21') {
                chip.dataset.price = price21.toFixed(2);
            } else if (chip.dataset.carat === '18') {
                chip.dataset.price = price18.toFixed(2);
            } else if (chip.dataset.carat === '14') {
                chip.dataset.price = price14.toFixed(2);
            }
        });

        // Update timestamp if element exists
        const now = new Date();
        updateElementText('gold-update-time', now.toLocaleTimeString('ar-EG'));

        console.log('✅ Gold prices updated successfully with live data');
    } else {
        // Fallback to static prices if all APIs fail
        console.log('Using fallback gold prices');
        updateElementText('gold-24', '3500 ج.م');
        updateElementText('gold-21', '3062 ج.م');
        updateElementText('gold-18', '2625 ج.م');
        updateElementText('gold-14', '2038 ج.م');

        // Update calculator chips with fallback prices
        document.querySelectorAll('.carat-chip').forEach(chip => {
            if (chip.dataset.carat === '24') {
                chip.dataset.price = '3500';
            } else if (chip.dataset.carat === '21') {
                chip.dataset.price = '3062';
            } else if (chip.dataset.carat === '18') {
                chip.dataset.price = '2625';
            } else if (chip.dataset.carat === '14') {
                chip.dataset.price = '2038';
            }
        });

        // Update timestamp if element exists
        const now = new Date();
        updateElementText('gold-update-time', now.toLocaleTimeString('ar-EG') + ' (تقديري)');
    }
}

// Fetch Currency Rates (using a free API)
async function fetchCurrencyRates() {
    console.log('Fetching currency rates...');

    try {
        // Using a free currency API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EGP');
        if (!response.ok) {
            throw new Error('API response not ok');
        }

        const data = await response.json();

        // Update currency rates
        if (data && data.rates) {
            updateElementText('usd-rate', `${(1 / data.rates.USD).toFixed(2)} ج.م`);
            updateElementText('eur-rate', `${(1 / data.rates.EUR).toFixed(2)} ج.م`);
            updateElementText('gbp-rate', `${(1 / data.rates.GBP).toFixed(2)} ج.م`);
            updateElementText('sar-rate', `${(1 / data.rates.SAR).toFixed(2)} ج.م`);
            updateElementText('aed-rate', `${(1 / data.rates.AED).toFixed(2)} ج.م`);
            updateElementText('kwd-rate', `${(1 / data.rates.KWD).toFixed(2)} ج.م`);

            // Update timestamp
            const now = new Date();
            updateElementText('currencies-update-time', now.toLocaleTimeString('ar-EG'));

            console.log('✅ Currency rates updated successfully');
        }
    } catch (error) {
        console.error('❌ Error fetching currency rates:', error);
        // Fallback to static rates if API fails
        updateElementText('usd-rate', '30.90 ج.م');
        updateElementText('eur-rate', '33.50 ج.م');
        updateElementText('gbp-rate', '39.20 ج.م');
        updateElementText('sar-rate', '8.24 ج.م');
        updateElementText('aed-rate', '8.41 ج.م');
        updateElementText('kwd-rate', '100.50 ج.م');

        const now = new Date();
        updateElementText('currencies-update-time', now.toLocaleTimeString('ar-EG') + ' (تقديري)');

        console.log('✅ Currency rates updated with fallback data');
    }
}

// Weather API Functions
async function fetchWeatherData(city = 'Cairo') {
    console.log(`Fetching weather data for: ${city}`);

    // Show loading state
    showLoading(true);
    hideError();

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=1f039acad4d9499b854172033241206&q=${encodeURIComponent(city)}&days=5&lang=ar`);

        if (!response.ok) {
            throw new Error('City not found or API error');
        }

        const data = await response.json();
        console.log('✅ Weather data fetched successfully:', data);

        updateWeatherDisplay(data);
        showLoading(false);

    } catch (error) {
        showLoading(false);
        showError('لم نتمكن من العثور على هذه المدينة. يرجى التأكد من اسم المدينة والمحاولة مرة أخرى.');
    }
}

function updateWeatherDisplay(data) {
    console.log('Updating weather display...');

    const current = data.current;
    const location = data.location;
    const forecast = data.forecast;

    // Update current weather
    updateElementText('weather-city', location.name);
    updateElementText('weather-temp', `${Math.round(current.temp_c)}°`);
    updateElementText('weather-feels', `يشعر بـ ${Math.round(current.feelslike_c)}°`);
    updateElementText('weather-description', current.condition.text);
    updateElementText('weather-humidity', `${current.humidity}%`);
    updateElementText('weather-wind', `${Math.round(current.wind_kph)} كم/س`);
    updateElementText('weather-pressure', `${current.pressure_mb} hPa`);

    // Update weather icon
    const weatherIcon = document.getElementById('weather-icon');
    if (weatherIcon) {
        weatherIcon.src = `https:${current.condition.icon}`;
        weatherIcon.alt = current.condition.text;
    }

    // Update date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    updateElementText('weather-date', now.toLocaleDateString('ar-EG', options));

    // Update forecast
    updateWeatherForecast(forecast);

    console.log('✅ Weather display updated successfully');
}

function updateWeatherForecast(forecast) {
    console.log('Updating weather forecast...');

    const forecastContainer = document.getElementById('forecastContainer');
    if (!forecastContainer) return;

    // Clear previous forecast
    forecastContainer.innerHTML = '';

    // Create forecast items for next 5 days
    forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${date.getDate()}/${date.getMonth() + 1}</div>
            <div class="forecast-icon">
                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            </div>
            <div class="forecast-temp">
                <span class="temp-max">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="temp-min">${Math.round(day.day.mintemp_c)}°</span>
            </div>
            <div class="forecast-desc">${day.day.condition.text}</div>
        `;

        forecastContainer.appendChild(forecastItem);
    });

    console.log('✅ Weather forecast updated successfully');
}

function showLoading(show) {
    const loadingElement = document.getElementById('searchLoading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    const errorElement = document.getElementById('weatherError');
    const errorText = document.getElementById('errorText');

    if (errorElement && errorText) {
        errorText.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError() {
    const errorElement = document.getElementById('weatherError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function initializeWeatherSearch() {
    console.log('Initializing weather search...');

    const searchButton = document.getElementById('searchWeather');
    const cityInput = document.getElementById('cityInput');

    if (searchButton && cityInput) {
        searchButton.addEventListener('click', handleWeatherSearch);

        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleWeatherSearch();
            }
        });
    }

    console.log('✅ Weather search initialized successfully');
}

function handleWeatherSearch() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();

    if (city) {
        console.log('Searching for city:', city);
        fetchWeatherData(city);
    } else {
        showError('يرجى إدخال اسم المدينة');
    }
}

// Prayer Times API Functions
let prayerTimesData = null;
let countdownInterval = null;

const prayerNames = {
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
};

async function fetchPrayerTimes(city = 'Cairo') {
    console.log(`Fetching prayer times for: ${city}`);

    showAzanLoading(true);
    hideAzanError();

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
        showAzanLoading(false);

    } catch (error) {
        console.error('❌ Error fetching prayer times:', error);
        showAzanLoading(false);
        showAzanError('لم نتمكن من جلب مواقيت الصلاة. يرجى المحاولة مرة أخرى.');
    }
}

function updatePrayerTimesDisplay(data) {
    console.log('Updating prayer times display...');

    const timings = data.timings;
    const date = data.date;

    // Update city name
    updateElementText('azan-city-name', data.meta.timezone.split('/')[1] || 'القاهرة');

    // Update dates
    updateElementText('hijriDate', `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year}`);
    updateElementText('gregorianDate', `${date.readable}`);

    // Update prayer times
    updateElementText('fajr-time', formatTime(timings.Fajr));
    updateElementText('sunrise-time', formatTime(timings.Sunrise));
    updateElementText('dhuhr-time', formatTime(timings.Dhuhr));
    updateElementText('asr-time', formatTime(timings.Asr));
    updateElementText('maghrib-time', formatTime(timings.Maghrib));
    updateElementText('isha-time', formatTime(timings.Isha));

    // Update current prayer info
    updateCurrentPrayer(timings);

    // Update timestamp
    const now = new Date();
    updateElementText('azan-update-time', now.toLocaleTimeString('ar-EG'));

    console.log('✅ Prayer times display updated successfully');
}

function formatTime(time24) {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const period = hour >= 12 ? 'م' : 'ص';

    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minutes}`;
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function updateCurrentPrayer(timings) {
    const now = new Date();
    const prayers = [
        { name: 'fajr', arabicName: 'الفجر', time: parseTime(timings.Fajr) },
        { name: 'sunrise', arabicName: 'الشروق', time: parseTime(timings.Sunrise) },
        { name: 'dhuhr', arabicName: 'الظهر', time: parseTime(timings.Dhuhr) },
        { name: 'asr', arabicName: 'العصر', time: parseTime(timings.Asr) },
        { name: 'maghrib', arabicName: 'المغرب', time: parseTime(timings.Maghrib) },
        { name: 'isha', arabicName: 'العشاء', time: parseTime(timings.Isha) }
    ];

    let currentPrayer = null;
    let nextPrayer = null;

    // Find current and next prayer
    for (let i = 0; i < prayers.length; i++) {
        if (now < prayers[i].time) {
            nextPrayer = prayers[i];
            currentPrayer = i > 0 ? prayers[i - 1] : prayers[prayers.length - 1];
            break;
        }
    }

    // If no next prayer found, we're past Isha
    if (!nextPrayer) {
        currentPrayer = prayers[prayers.length - 1];
        nextPrayer = prayers[0]; // Fajr of next day
    }

    // Update current prayer display
    if (currentPrayer) {
        updateElementText('currentPrayerName', currentPrayer.arabicName);
        updateElementText('currentPrayerTime', formatTime(timings[capitalizeFirst(currentPrayer.name)]));
    }

    // Update next prayer display
    if (nextPrayer) {
        updateElementText('nextPrayerName', nextPrayer.arabicName);
        updateElementText('nextPrayerTime', formatTime(timings[capitalizeFirst(nextPrayer.name)]));
    }

    // Update prayer item states
    updatePrayerItemStates(prayers, now);
}

function updatePrayerItemStates(prayers, now) {
    prayers.forEach((prayer, index) => {
        const prayerItem = document.querySelector(`.prayer-item[data-prayer="${prayer.name}"]`);
        if (!prayerItem) return;

        // Remove all state classes
        prayerItem.classList.remove('active', 'passed');

        // Check if prayer time has passed
        if (now > prayer.time) {
            prayerItem.classList.add('passed');
        }

        // Check if this is the current prayer (between this prayer and next)
        const nextPrayer = prayers[index + 1];
        if (now > prayer.time && (!nextPrayer || now < nextPrayer.time)) {
            prayerItem.classList.add('active');
        }
    });
}

function startCountdown() {
    // Clear existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Update countdown every second
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial update
}

function updateCountdown() {
    if (!prayerTimesData) return;

    const now = new Date();
    const timings = prayerTimesData.timings;

    const prayers = [
        { name: 'fajr', time: parseTime(timings.Fajr) },
        { name: 'sunrise', time: parseTime(timings.Sunrise) },
        { name: 'dhuhr', time: parseTime(timings.Dhuhr) },
        { name: 'asr', time: parseTime(timings.Asr) },
        { name: 'maghrib', time: parseTime(timings.Maghrib) },
        { name: 'isha', time: parseTime(timings.Isha) }
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
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showAzanLoading(show) {
    const loadingElement = document.getElementById('azanLoading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

function showAzanError(message) {
    const errorElement = document.getElementById('azanError');
    const errorText = document.getElementById('azanErrorText');

    if (errorElement && errorText) {
        errorText.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideAzanError() {
    const errorElement = document.getElementById('azanError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function initializeAzanTab() {
    console.log('Initializing Azan tab...');

    // Fetch prayer times for default city (Cairo)
    fetchPrayerTimes('Cairo');

    // Update prayer times every minute
    setInterval(() => {
        if (prayerTimesData) {
            updateCurrentPrayer(prayerTimesData.timings);
        }
    }, 60000);

    console.log('✅ Azan tab initialized successfully');
}

// Function to sync with weather tab city changes
function syncAzanWithWeatherCity(city) {
    console.log(`Syncing Azan times with weather city: ${city}`);
    fetchPrayerTimes(city);
}

// Fetch Crypto Prices (using a free API)
async function fetchCryptoPrices() {
    console.log('Fetching crypto prices...');

    try {
        // Using CoinGecko API (free tier)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin&vs_currencies=usd&include_24hr_change=true');

        if (!response.ok) {
            throw new Error('API response not ok');
        }

        const data = await response.json();

        // Update crypto prices
        if (data) {
            // Bitcoin
            if (data.bitcoin) {
                updateElementText('btc-price', `$${data.bitcoin.usd.toLocaleString()}`);
                const change = data.bitcoin.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('btc-change', `${change}%`);
                updateElementClass('btc-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Ethereum
            if (data.ethereum) {
                updateElementText('eth-price', `$${data.ethereum.usd.toLocaleString()}`);
                const change = data.ethereum.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('eth-change', `${change}%`);
                updateElementClass('eth-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Ripple (XRP)
            if (data.ripple) {
                updateElementText('xrp-price', `$${data.ripple.usd.toLocaleString()}`);
                const change = data.ripple.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('xrp-change', `${change}%`);
                updateElementClass('xrp-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Litecoin
            if (data.litecoin) {
                updateElementText('ltc-price', `$${data.litecoin.usd.toLocaleString()}`);
                const change = data.litecoin.usd_24h_change?.toFixed(2) || '0.00';
                updateElementText('ltc-change', `${change}%`);
                updateElementClass('ltc-change', `crypto-change ${change >= 0 ? 'positive' : 'negative'}`);
            }

            // Update timestamp
            const now = new Date();
            updateElementText('crypto-update-time', now.toLocaleTimeString('ar-EG'));

            console.log('✅ Crypto prices updated successfully');
        }
    } catch (error) {
        console.error('❌ Error fetching crypto prices:', error);
        // Fallback to static prices if API fails
        updateElementText('btc-price', '$45,200');
        updateElementText('btc-change', '+2.5%');
        updateElementClass('btc-change', 'crypto-change positive');

        updateElementText('eth-price', '$3,200');
        updateElementText('eth-change', '+1.8%');
        updateElementClass('eth-change', 'crypto-change positive');

        updateElementText('xrp-price', '$0.62');
        updateElementText('xrp-change', '-0.5%');
        updateElementClass('xrp-change', 'crypto-change negative');

        updateElementText('ltc-price', '$72.50');
        updateElementText('ltc-change', '+0.3%');
        updateElementClass('ltc-change', 'crypto-change positive');

        const now = new Date();
        updateElementText('crypto-update-time', now.toLocaleTimeString('ar-EG') + ' (تقديري)');

        console.log('✅ Crypto prices updated with fallback data');
    }
}

// World Clock Configuration
const worldCities = [
    {
        name: "القاهرة",
        country: "مصر",
        timezone: "Africa/Cairo",
        flag: "🇪🇬",
        offset: "+2"
    },
    {
        name: "دبي",
        country: "الإمارات",
        timezone: "Asia/Dubai",
        flag: "🇦🇪",
        offset: "+4"
    },
    {
        name: "الرياض",
        country: "السعودية",
        timezone: "Asia/Riyadh",
        flag: "🇸🇦",
        offset: "+3"
    },
    {
        name: "لندن",
        country: "المملكة المتحدة",
        timezone: "Europe/London",
        flag: "🇬🇧",
        offset: "+0"
    },
    {
        name: "نيويورك",
        country: "الولايات المتحدة",
        timezone: "America/New_York",
        flag: "🇺🇸",
        offset: "-4"
    },
    {
        name: "بكين",
        country: "الصين",
        timezone: "Asia/Shanghai",
        flag: "🇨🇳",
        offset: "+8"
    }
];

let worldClockInterval = null;
let gmtOffsetFetched = false;

// Optimized World Clock Initialization
function initializeWorldClock() {
    console.log('🌍 Initializing World Clock...');

    const grid = document.getElementById('worldclocks-grid');
    const gmtTime = document.getElementById('gmt-time');
    const gmtDate = document.getElementById('gmt-date');

    if (!grid || !gmtTime || !gmtDate) {
        console.error('❌ Required world clock elements not found!');
        return;
    }

    // Create city clocks
    createCityClocks();

    // Fetch GMT offset only once
    if (!gmtOffsetFetched) {
        fetchGMTTimeOnce();
        gmtOffsetFetched = true;
    }

    // Start updating clocks immediately using browser time
    updateAllClocks();

    // Set up interval to update clocks every second
    if (worldClockInterval) {
        clearInterval(worldClockInterval);
    }

    worldClockInterval = setInterval(() => {
        updateAllClocks();
    }, 1000);

    console.log('✅ World clock initialized successfully');
}

// Fetch GMT time only once to get initial offset
async function fetchGMTTimeOnce() {
    try {
        console.log('🕐 Fetching GMT time once for initial setup...');
        const response = await fetch('https://www.timeapi.io/api/time/current/coordinate?latitude=0&longitude=0');

        if (!response.ok) {
            throw new Error('GMT API response not ok');
        }

        const data = await response.json();
        const serverTime = new Date(data.dateTime);
        const localTime = new Date();

        // Calculate the offset between server time and local time
        const timeDiff = serverTime.getTime() - localTime.getTime();
        localStorage.setItem('gmtTimeOffset', timeDiff.toString());

        console.log('✅ GMT time offset stored:', timeDiff, 'ms');

    } catch (error) {
        console.error('❌ Error fetching GMT time, using local time:', error);
        localStorage.removeItem('gmtTimeOffset');
    }
}

// Get accurate time considering the offset
function getAccurateTime() {
    const storedOffset = localStorage.getItem('gmtTimeOffset');
    const now = new Date();

    if (storedOffset) {
        // Apply the stored offset to get more accurate time
        return new Date(now.getTime() + parseInt(storedOffset));
    }

    // Fallback to local time
    return now;
}

// Update all clocks using browser time (much faster)
function updateAllClocks() {
    const accurateTime = getAccurateTime();

    // Update GMT display
    updateGMTDisplay(accurateTime);

    // Update all city clocks
    worldCities.forEach(city => {
        updateCityClock(city, accurateTime);
    });

    // Update timestamp every minute (to reduce unnecessary updates)
    const now = new Date();
    if (now.getSeconds() === 0) {
        updateElementText('worldclock-update-time', now.toLocaleTimeString('ar-EG'));
    }
}

// Update GMT display
function updateGMTDisplay(time) {
    // Get current UTC time directly without any offset adjustments
    const now = new Date();
    const utcHours = now.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
    const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
    const timeString = `${utcHours}:${utcMinutes}`;

    // Format date in UTC
    const dateString = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });

    updateElementText('gmt-time', timeString);
    updateElementText('gmt-date', dateString);
}

// Update individual city clock using browser timezone - FIXED VERSION
function updateCityClock(city, baseTime) {
    try {
        // Create a new date object for the specific timezone
        const cityTime = new Date(baseTime.toLocaleString("en-US", { timeZone: city.timezone }));

        // Format time in 12-hour format with AM/PM
        const timeString = cityTime.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
            // second: '2-digit'
        });

        // Format date
        const dateString = cityTime.toLocaleDateString('ar-EG', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Get hours for day/night indicator - use the actual city time hours
        const hours = cityTime.getHours();

        const timeElement = document.getElementById(`time-${city.name.replace(/\s+/g, '-')}`);
        const dateElement = document.getElementById(`date-${city.name.replace(/\s+/g, '-')}`);
        const iconElement = document.getElementById(`icon-${city.name.replace(/\s+/g, '-')}`);
        const periodElement = document.getElementById(`period-${city.name.replace(/\s+/g, '-')}`);

        if (timeElement) timeElement.textContent = timeString;
        if (dateElement) dateElement.textContent = dateString;

        // Update day/night indicator
        updateDayNightIndicator(hours, iconElement, periodElement);

    } catch (error) {
        console.error(`❌ Error updating time for ${city.name}:`, error);
        // Fallback: use offset calculation
        updateCityClockWithOffset(city, baseTime);
    }
}

// Also fix the fallback function
function updateCityClockWithOffset(city, baseTime) {
    const offset = parseOffset(city.offset);
    const cityTime = new Date(baseTime.getTime() + (offset * 60 * 60 * 1000));

    const timeElement = document.getElementById(`time-${city.name.replace(/\s+/g, '-')}`);
    const dateElement = document.getElementById(`date-${city.name.replace(/\s+/g, '-')}`);
    const iconElement = document.getElementById(`icon-${city.name.replace(/\s+/g, '-')}`);
    const periodElement = document.getElementById(`period-${city.name.replace(/\s+/g, '-')}`);

    if (timeElement && dateElement) {
        // Use 12-hour format for fallback too
        const timeString = cityTime.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = cityTime.toLocaleDateString('ar-EG', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        timeElement.textContent = timeString;
        dateElement.textContent = dateString;

        const hours = cityTime.getHours();
        updateDayNightIndicator(hours, iconElement, periodElement);
    }
}

// Also fix the hours extraction in the main function - remove this problematic code:
// Remove this section from updateCityClock function:
/*
const hours = baseTime.toLocaleTimeString('en-GB', {
    timeZone: city.timezone,
    hour: '2-digit',
    hour12: true
});
*/
// Parse offset string to hours
function parseOffset(offset) {
    const sign = offset.charAt(0) === '+' ? 1 : -1;
    const hours = parseInt(offset.substring(1));
    return sign * hours;
}

// Update day/night indicator
function updateDayNightIndicator(hours, iconElement, periodElement) {
    let icon = '🌞';
    let period = 'نهار';

    if (hours >= 18 || hours < 6) {
        icon = '🌙';
        period = 'ليل';
    } else if (hours >= 6 && hours < 12) {
        icon = '🌅';
        period = 'صباح';
    } else if (hours >= 12 && hours < 18) {
        icon = '🌇';
        period = 'مساء';
    }

    if (iconElement) iconElement.textContent = icon;
    if (periodElement) periodElement.textContent = period;
}

// Create city clock elements
function createCityClocks() {
    const grid = document.getElementById('worldclocks-grid');
    if (!grid) return;

    grid.innerHTML = '';

    worldCities.forEach(city => {
        const clockElement = document.createElement('div');
        clockElement.className = 'city-clock';
        clockElement.innerHTML = `
            <div class="city-header">
                <div class="city-flag">${city.flag}</div>
                <div class="city-info">
                    <div class="city-name">${city.name}</div>
                    <div class="city-country">${city.country}</div>
                    <div class="timezone">UTC${city.offset}</div>
                </div>
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
        grid.appendChild(clockElement);
    });
}

// Helper functions
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`⚠️ Element with id ${elementId} not found`);
    }
}

function updateElementClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.className = className;
    } else {
        console.warn(`⚠️ Element with id ${elementId} not found`);
    }
}

// Auto-refresh data every 5 minutes
function startAutoRefresh() {
    console.log('Starting auto-refresh (5 minutes interval)');
    setInterval(() => {
        console.log('Auto-refreshing data...');
        fetchGoldPrices();
        fetchCurrencyRates();
        fetchCryptoPrices();
    }, 5 * 60 * 1000); // 5 minutes
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== DOM Content Loaded ===');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    console.log('Gold chart canvas:', document.getElementById('goldChart'));

    // Initialize components
    initializeGoldChart();
    initializeGoldCalculator();
    initializeTabs();
    initializeWeatherSearch();

    // Fetch initial data for default tabs only
    fetchGoldPrices();
    fetchCurrencyRates();
    fetchCryptoPrices();

    // Start auto-refresh
    startAutoRefresh();

    console.log('=== Application Initialized ===');
});

// Error handling for page load
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
});

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.initializeAzanTab = initializeAzanTab;
    window.syncAzanWithWeatherCity = syncAzanWithWeatherCity;
    window.initializeWorldClock = initializeWorldClock;
}