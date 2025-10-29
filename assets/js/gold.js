// Gold Prices Data and Management
class GoldPricesManager {
    constructor() {
        this.goldData = [];
        this.filteredData = [];
        this.filters = {
            country: 'all',
            carat: 'all',
            currency: 'all',
            sort: 'price-low'
        };
        this.currencySymbols = {
            'EGP': 'ج.م',
            'SAR': 'ر.س',
            'AED': 'د.إ',
            'KWD': 'د.ك',
            'USD': '$',
            'EUR': '€'
        };

        this.init();
    }

    init() {
        console.log('🚀 Initializing Gold Prices Manager...');
        this.loadGoldData();
        this.setupEventListeners();
        this.setupCalculator();
    }

    // Load initial gold data (simulated API call)
    async loadGoldData() {
        console.log('📊 Loading gold data...');
        this.showLoading(true);

        try {

            // Sample data - in real app, this would come from API
            this.goldData = [
                {
                    id: 1,
                    country: 'egypt',
                    countryName: 'مصر',
                    flag: '🇪🇬',
                    currency: 'EGP',
                    prices: {
                        '24': 3500,
                        '21': 3062,
                        '18': 2625,
                        '14': 2038
                    },
                    change: 1.2,
                    lastUpdated: new Date()
                },
                {
                    id: 2,
                    country: 'saudi',
                    countryName: 'السعودية',
                    flag: '🇸🇦',
                    currency: 'SAR',
                    prices: {
                        '24': 285,
                        '21': 249,
                        '18': 214,
                        '14': 166
                    },
                    change: -0.5,
                    lastUpdated: new Date()
                },
                {
                    id: 3,
                    country: 'uae',
                    countryName: 'الإمارات',
                    flag: '🇦🇪',
                    currency: 'AED',
                    prices: {
                        '24': 280,
                        '21': 245,
                        '18': 210,
                        '14': 163
                    },
                    change: 0.8,
                    lastUpdated: new Date()
                },
                {
                    id: 4,
                    country: 'kuwait',
                    countryName: 'الكويت',
                    flag: '🇰🇼',
                    currency: 'KWD',
                    prices: {
                        '24': 22.5,
                        '21': 19.7,
                        '18': 16.9,
                        '14': 13.1
                    },
                    change: 1.5,
                    lastUpdated: new Date()
                },
                {
                    id: 5,
                    country: 'usa',
                    countryName: 'الولايات المتحدة',
                    flag: '🇺🇸',
                    currency: 'USD',
                    prices: {
                        '24': 76.2,
                        '21': 66.7,
                        '18': 57.2,
                        '14': 44.4
                    },
                    change: -0.3,
                    lastUpdated: new Date()
                },
                {
                    id: 6,
                    country: 'uk',
                    countryName: 'المملكة المتحدة',
                    flag: '🇬🇧',
                    currency: 'GBP',
                    prices: {
                        '24': 60.1,
                        '21': 52.6,
                        '18': 45.1,
                        '14': 35.0
                    },
                    change: 0.7,
                    lastUpdated: new Date()
                }
            ];

            this.applyFilters();
            this.updateLastUpdateTime();

        } catch (error) {
            console.error('❌ Error loading gold data:', error);
            this.showError('حدث خطأ في تحميل بيانات الذهب');
        } finally {
            this.showLoading(false);
        }
    }

    // Setup event listeners for filters
    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');

        // Country filter
        const countryFilter = document.getElementById('countryFilter');
        if (countryFilter) {
            countryFilter.addEventListener('change', (e) => {
                this.filters.country = e.target.value;
                this.applyFilters();
            });
        }

        // Carat filter
        const caratFilter = document.getElementById('caratFilter');
        if (caratFilter) {
            caratFilter.addEventListener('change', (e) => {
                this.filters.carat = e.target.value;
                this.applyFilters();
            });
        }

        // Currency filter
        const currencyFilter = document.getElementById('currencyFilter');
        if (currencyFilter) {
            currencyFilter.addEventListener('change', (e) => {
                this.filters.currency = e.target.value;
                this.applyFilters();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sort = e.target.value;
                this.applyFilters();
            });
        }

        // Reset filters
        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    // Apply all active filters
    applyFilters() {
        console.log('🔍 Applying filters...', this.filters);

        let filtered = [...this.goldData];

        // Apply country filter
        if (this.filters.country !== 'all') {
            filtered = filtered.filter(item => item.country === this.filters.country);
        }

        // Apply currency filter
        if (this.filters.currency !== 'all') {
            filtered = filtered.filter(item => item.currency === this.filters.currency);
        }

        // Apply sorting
        filtered = this.sortData(filtered);

        this.filteredData = filtered;
        this.renderGoldPrices();
        this.updateResultsCount();
    }

    // Sort data based on selected criteria
    sortData(data) {
        const sortBy = this.filters.sort;

        return data.sort((a, b) => {
            switch (sortBy) {
                case 'price-high':
                    return this.getPrice(b) - this.getPrice(a);
                case 'price-low':
                    return this.getPrice(a) - this.getPrice(b);
                case 'country':
                    return a.countryName.localeCompare(b.countryName);
                case 'change':
                    return b.change - a.change;
                default:
                    return 0;
            }
        });
    }

    // Get price for sorting (uses 24k price)
    getPrice(item) {
        return item.prices['24'] || 0;
    }

    // Reset all filters to default
    resetFilters() {
        console.log('🔄 Resetting filters...');

        this.filters = {
            country: 'all',
            carat: 'all',
            currency: 'all',
            sort: 'price-low'
        };

        // Update UI elements
        document.getElementById('countryFilter').value = 'all';
        document.getElementById('caratFilter').value = 'all';
        document.getElementById('currencyFilter').value = 'all';
        document.getElementById('sortFilter').value = 'price-low';

        this.applyFilters();
    }

    // Render gold prices grid
    renderGoldPrices() {
        const grid = document.getElementById('goldPricesGrid');
        if (!grid) return;

        if (this.filteredData.length === 0) {
            this.showEmptyState();
            return;
        }

        const html = this.filteredData.map(item => this.createGoldCard(item)).join('');
        grid.innerHTML = html;

        this.hideEmptyState();
    }

    // Create HTML for a single gold card
    createGoldCard(item) {
        const mainPrice = this.filters.carat === 'all' ? item.prices['24'] : item.prices[this.filters.carat];
        const currencySymbol = this.currencySymbols[item.currency] || item.currency;

        return `
            <div class="gold-card" data-country="${item.country}">
                <div class="gold-card-header">
                    <div class="country-info">
                        <div class="country-flag">${item.flag}</div>
                        <div class="country-details">
                            <h3>${item.countryName}</h3>
                            <div class="country-name">${this.getCurrencyName(item.currency)}</div>
                        </div>
                    </div>
                    <div class="gold-price">
                        <div class="price">${this.formatPrice(mainPrice)}</div>
                        <div class="currency">${currencySymbol}</div>
                    </div>
                </div>
                
                <div class="gold-card-body">
                    <div class="carats-grid">
                        ${Object.entries(item.prices).map(([carat, price]) => `
                            <div class="carat-item">
                                <span class="carat-label">عيار ${carat}</span>
                                <span class="carat-value">${this.formatPrice(price)} ${currencySymbol}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="gold-card-footer">
                    <div class="price-change ${item.change >= 0 ? 'positive' : 'negative'}">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="${item.change >= 0 ? 'M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z' : 'M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'}"/>
                        </svg>
                        ${Math.abs(item.change).toFixed(1)}%
                    </div>
                    <div class="last-updated">
                        ${this.formatTime(item.lastUpdated)}
                    </div>
                </div>
            </div>
        `;
    }

    // Setup gold calculator
    setupCalculator() {
        console.log('🧮 Setting up gold calculator...');

        const weightInput = document.getElementById('calcWeight');
        const caratSelect = document.getElementById('calcCarat');
        const currencySelect = document.getElementById('calcCurrency');

        if (weightInput && caratSelect && currencySelect) {
            const updateCalculator = () => {
                this.calculateGoldPrice();
            };

            weightInput.addEventListener('input', updateCalculator);
            caratSelect.addEventListener('change', updateCalculator);
            currencySelect.addEventListener('change', updateCalculator);

            // Initial calculation
            this.calculateGoldPrice();
        }
    }

    // Calculate gold price based on inputs
    calculateGoldPrice() {
        const weight = parseFloat(document.getElementById('calcWeight').value) || 0;
        const carat = document.getElementById('calcCarat').value;
        const currency = document.getElementById('calcCurrency').value;

        // Find base price for selected currency (using Egypt as base)
        const baseItem = this.goldData.find(item => item.currency === currency) || this.goldData[0];
        const basePrice = baseItem.prices[carat] || baseItem.prices['24'];

        const totalPrice = (weight * basePrice).toFixed(2);
        const currencySymbol = this.currencySymbols[currency] || currency;

        document.getElementById('calcResult').textContent = this.formatPrice(totalPrice);
        document.getElementById('calcCurrencySymbol').textContent = currencySymbol;
    }

    // Utility functions
    formatPrice(price) {
        return new Intl.NumberFormat('ar-EG').format(price);
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    getCurrencyName(currency) {
        const names = {
            'EGP': 'جنيه مصري',
            'SAR': 'ريال سعودي',
            'AED': 'درهم إماراتي',
            'KWD': 'دينار كويتي',
            'USD': 'دولار أمريكي',
            'EUR': 'يورو',
            'GBP': 'جنيه إسترليني'
        };
        return names[currency] || currency;
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = this.filteredData.length;
        }
    }

    updateLastUpdateTime() {
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString('ar-EG');
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loadingState');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }

    showEmptyState() {
        const emptyElement = document.getElementById('emptyState');
        const gridElement = document.getElementById('goldPricesGrid');

        if (emptyElement && gridElement) {
            emptyElement.style.display = 'block';
            gridElement.style.display = 'none';
        }
    }

    hideEmptyState() {
        const emptyElement = document.getElementById('emptyState');
        const gridElement = document.getElementById('goldPricesGrid');

        if (emptyElement && gridElement) {
            emptyElement.style.display = 'none';
            gridElement.style.display = 'grid';
        }
    }

    showError(message) {
        // You can implement a toast or alert system here
        console.error('Error:', message);
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('=== Gold Page Initialization ===');
    window.goldManager = new GoldPricesManager();
});

// Auto-refresh data every 10 minutes
setInterval(() => {
    if (window.goldManager) {
        console.log('🔄 Auto-refreshing gold data...');
        window.goldManager.loadGoldData();
    }
}, 10 * 60 * 1000);