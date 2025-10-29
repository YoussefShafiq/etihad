// Weather Page JavaScript
class WeatherPage {
    constructor() {
        this.apiKey = '1f039acad4d9499b854172033241206'; // Replace with your WeatherAPI key
        this.currentCity = 'Cairo';
        this.weatherData = null;
        this.forecastData = null;

        this.initializeElements();
        this.initializeEventListeners();
        this.loadDefaultWeather();
        this.loadPopularCities();
    }

    initializeElements() {
        // Search elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchWeather');
        this.suggestions = document.getElementById('suggestions');

        // Current weather elements
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.errorText = document.getElementById('errorText');
        this.retryButton = document.getElementById('retryButton');
        this.currentWeatherContent = document.getElementById('currentWeatherContent');
        this.refreshBtn = document.getElementById('refreshWeather');

        // Weather display elements
        this.weatherCity = document.getElementById('weather-city');
        this.weatherDate = document.getElementById('weather-date');
        this.weatherIcon = document.getElementById('weather-icon');
        this.weatherTemp = document.getElementById('weather-temp');
        this.weatherFeels = document.getElementById('weather-feels');
        this.weatherDescription = document.getElementById('weather-description');
        this.weatherHumidity = document.getElementById('weather-humidity');
        this.weatherWind = document.getElementById('weather-wind');
        this.weatherPressure = document.getElementById('weather-pressure');
        this.weatherVisibility = document.getElementById('weather-visibility');
        this.weatherClouds = document.getElementById('weather-clouds');
        this.weatherSunrise = document.getElementById('weather-sunrise');
        this.weatherSunset = document.getElementById('weather-sunset');
        this.weatherUV = document.getElementById('weather-uv');

        // Forecast elements
        this.forecastContent = document.getElementById('forecastContent');
        this.forecastContainer = document.getElementById('forecastContainer');
        this.forecastPeriod = document.getElementById('forecastPeriod');

        // Update time
        this.lastUpdateTime = document.getElementById('last-update-time');
    }

    initializeEventListeners() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Retry functionality
        this.retryButton.addEventListener('click', () => this.handleSearch());

        // Refresh functionality
        this.refreshBtn.addEventListener('click', () => this.refreshWeather());

        // Popular cities click
        document.querySelectorAll('.city-card').forEach(card => {
            card.addEventListener('click', () => {
                const city = card.getAttribute('data-city');
                this.searchWeather(city);
            });
        });

        // Auto-suggestions (optional enhancement)
        this.cityInput.addEventListener('input', () => this.handleInput());
    }

    async loadDefaultWeather() {
        await this.searchWeather(this.currentCity);
    }

    async loadPopularCities() {
        const popularCities = ['Cairo', 'Riyadh', 'Dubai', 'Amman', 'Beirut', 'Doha'];

        for (const city of popularCities) {
            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&lang=ar`
                );

                if (response.ok) {
                    const data = await response.json();
                    const temp = Math.round(data.current.temp_c);
                    document.getElementById(`${city.toLowerCase()}-weather`).textContent = `${temp}°`;
                }
            } catch (error) {
                console.error(`Error loading weather for ${city}:`, error);
            }
        }
    }

    async searchWeather(city) {
        this.showLoading();
        this.hideError();
        this.hideCurrentWeather();
        this.hideForecast();

        try {
            // Fetch current weather
            const currentResponse = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&lang=ar`
            );

            // Fetch forecast
            const forecastResponse = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&days=5&lang=ar`
            );

            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found or API error');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();

            this.weatherData = currentData;
            this.forecastData = forecastData;
            this.currentCity = city;

            this.updateCurrentWeather(currentData);
            this.updateForecast(forecastData);
            this.updateLastUpdateTime();

            this.hideLoading();
            this.showCurrentWeather();
            this.showForecast();

        } catch (error) {
            console.error('Error fetching weather data:', error);
            this.showError('لم نتمكن من العثور على هذه المدينة. يرجى التأكد من اسم المدينة والمحاولة مرة أخرى.');
            this.hideLoading();
        }
    }

    updateCurrentWeather(data) {
        const current = data.current;
        const location = data.location;

        // Update location and date
        this.weatherCity.textContent = location.name;
        this.weatherDate.textContent = this.formatDate(new Date());

        // Update main weather info
        this.weatherTemp.textContent = `${Math.round(current.temp_c)}°`;
        this.weatherFeels.textContent = `يشعر بـ ${Math.round(current.feelslike_c)}°`;
        this.weatherDescription.textContent = current.condition.text;

        // Update weather icon
        this.weatherIcon.src = `https:${current.condition.icon}`;
        this.weatherIcon.alt = current.condition.text;

        // Update weather details
        this.weatherHumidity.textContent = `${current.humidity}%`;
        this.weatherWind.textContent = `${Math.round(current.wind_kph)} كم/س`;
        this.weatherPressure.textContent = `${current.pressure_mb} hPa`;
        this.weatherVisibility.textContent = `${current.vis_km} كم`;
        this.weatherClouds.textContent = `${current.cloud}%`;
        this.weatherUV.textContent = current.uv;

        // Update sunrise and sunset (these might not be available in current API)
        // You might need to calculate these or get from forecast
        if (data.forecast) {
            const astro = data.forecast.forecastday[0].astro;
            this.weatherSunrise.textContent = astro.sunrise;
            this.weatherSunset.textContent = astro.sunset;
        }
    }

    updateForecast(data) {
        const forecast = data.forecast;
        this.forecastContainer.innerHTML = '';

        forecast.forecastday.forEach(day => {
            const date = new Date(day.date);
            const dayName = this.getDayName(date);
            const dateString = `${date.getDate()}/${date.getMonth() + 1}`;

            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-date">${dateString}</div>
                <div class="forecast-icon">
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                </div>
                <div class="forecast-temp">
                    <span class="temp-max">${Math.round(day.day.maxtemp_c)}°</span>
                    <span class="temp-min">${Math.round(day.day.mintemp_c)}°</span>
                </div>
                <div class="forecast-desc">${day.day.condition.text}</div>
                <div class="forecast-details">
                    <div class="detail">
                        <div class="label">الرطوبة</div>
                        <div class="value">${day.day.avghumidity}%</div>
                    </div>
                    <div class="detail">
                        <div class="label">الرياح</div>
                        <div class="value">${Math.round(day.day.maxwind_kph)} كم/س</div>
                    </div>
                </div>
            `;

            this.forecastContainer.appendChild(forecastItem);
        });
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-EG');
        this.lastUpdateTime.textContent = timeString;
    }

    formatDate(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('ar-EG', options);
    }

    getDayName(date) {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[date.getDay()];
    }

    handleSearch() {
        const city = this.cityInput.value.trim();
        if (city) {
            this.searchWeather(city);
        } else {
            this.showError('يرجى إدخال اسم المدينة');
        }
    }

    refreshWeather() {
        if (this.currentCity) {
            this.searchWeather(this.currentCity);
        }
    }

    handleInput() {
        // Optional: Implement auto-suggestions here
        // You can use the WeatherAPI autocomplete endpoint
    }

    // UI State Management
    showLoading() {
        this.loadingState.style.display = 'flex';
    }

    hideLoading() {
        this.loadingState.style.display = 'none';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorState.style.display = 'block';
    }

    hideError() {
        this.errorState.style.display = 'none';
    }

    showCurrentWeather() {
        this.currentWeatherContent.style.display = 'block';
    }

    hideCurrentWeather() {
        this.currentWeatherContent.style.display = 'none';
    }

    showForecast() {
        this.forecastContent.style.display = 'block';
    }

    hideForecast() {
        this.forecastContent.style.display = 'none';
    }
}

// Initialize the weather page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    new WeatherPage();
});

// Auto-refresh every 10 minutes
setInterval(() => {
    const weatherPage = document.weatherPage;
    if (weatherPage && weatherPage.currentCity) {
        weatherPage.refreshWeather();
    }
}, 10 * 60 * 1000);