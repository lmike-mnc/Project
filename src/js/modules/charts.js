/**
 * Charts Module using Chart.js
 */

const Charts = {
    progressChart: null,
    categoriesChart: null,

    /**
     * Initialize charts
     */
    init() {
        this.initProgressChart();
        this.initCategoriesChart();
        this.updateStreak();
        this.bindEvents();
    },

    /**
     * Bind events
     */
    bindEvents() {
        const periodSelect = $('#chartPeriod');
        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                this.updateProgressChart();
            });
        }
    },

    /**
     * Initialize progress line chart
     */
    initProgressChart() {
        const canvas = $('#progressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Выполнение привычек (%)',
                    data: [],
                    borderColor: CONFIG.CHART_COLORS.primary,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.parsed.y}% выполнено`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: '#e5e7eb'
                        },
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        this.updateProgressChart();
    },

    /**
     * Update progress chart data
     */
    updateProgressChart() {
        if (!this.progressChart || !window.Habits) return;

        const periodSelect = $('#chartPeriod');
        const days = parseInt(periodSelect?.value || '30');

        const dates = Helpers.getLastNDays(days);
        const data = Habits.getCompletionData(days);

        // Format labels
        const labels = dates.map(date => {
            const d = new Date(date);
            return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
        });

        this.progressChart.data.labels = labels;
        this.progressChart.data.datasets[0].data = data;
        this.progressChart.update('none');
    },

    /**
     * Initialize categories doughnut chart
     */
    initCategoriesChart() {
        const canvas = $('#categoriesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        this.categoriesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: CONFIG.CHART_COLORS.categories,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8
                    }
                }
            }
        });

        this.updateCategoriesChart();
    },

    /**
     * Update categories chart
     */
    updateCategoriesChart() {
        if (!this.categoriesChart || !window.Habits) return;

        const categoryData = Habits.getCategoryData();

        this.categoriesChart.data.labels = categoryData.labels;
        this.categoriesChart.data.datasets[0].data = categoryData.data;
        this.categoriesChart.data.datasets[0].backgroundColor = categoryData.colors;
        this.categoriesChart.update('none');

        // Update legend
        this.updateCategoriesLegend(categoryData);
    },

    /**
     * Update categories legend
     */
    updateCategoriesLegend(data) {
        const legendEl = $('#categoriesLegend');
        if (!legendEl) return;

        const total = data.data.reduce((a, b) => a + b, 0);

        if (total === 0) {
            legendEl.innerHTML = '<span class="empty-state-text">Нет привычек</span>';
            return;
        }

        legendEl.innerHTML = data.labels.map((label, i) => {
            const count = data.data[i];
            if (count === 0) return '';

            return `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${data.colors[i]}"></span>
                    <span>${label}: ${count}</span>
                </div>
            `;
        }).join('');
    },

    /**
     * Update streak display
     */
    updateStreak() {
        if (!window.Habits) return;

        const streak = Habits.calculateStreak();
        const streakEl = $('#streakDays');

        if (streakEl) {
            streakEl.textContent = `${streak} ${this.getDaysWord(streak)}`;
        }
    },

    /**
     * Get correct Russian word for days
     */
    getDaysWord(n) {
        const lastTwo = n % 100;
        const lastOne = n % 10;

        if (lastTwo >= 11 && lastTwo <= 14) {
            return 'Дней';
        }

        if (lastOne === 1) {
            return 'День';
        }

        if (lastOne >= 2 && lastOne <= 4) {
            return 'Дня';
        }

        return 'Дней';
    },

    /**
     * Update all charts
     */
    updateAll() {
        this.updateProgressChart();
        this.updateCategoriesChart();
        this.updateStreak();
    }
};

// Make globally available
window.Charts = Charts;
