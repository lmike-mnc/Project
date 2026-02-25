/**
 * Main Application Entry Point
 * Habit Tracker & Productivity Dashboard
 */

const App = {
    /**
     * Initialize application
     */
    init() {
        console.log('🚀 Initializing Habit Tracker Dashboard...');

        // Check browser support
        if (!this.checkBrowserSupport()) {
            this.showBrowserWarning();
            return;
        }

        // Initialize all modules
        this.initModules();

        // Setup global event listeners
        this.setupGlobalEvents();

        console.log('✅ Dashboard ready!');
    },

    /**
     * Check browser support
     */
    checkBrowserSupport() {
        return (
            typeof Storage !== 'undefined' &&
            typeof fetch !== 'undefined' &&
            typeof Promise !== 'undefined'
        );
    },

    /**
     * Show browser warning
     */
    showBrowserWarning() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; 
                        min-height: 100vh; padding: 20px; text-align: center;">
                <div>
                    <h1>⚠️ Браузер не поддерживается</h1>
                    <p>Пожалуйста, используйте современный браузер (Chrome, Firefox, Safari, Edge)</p>
                </div>
            </div>
        `;
    },

    /**
     * Initialize all modules
     */
    initModules() {
        // Core utilities are already loaded

        // Time widget
        if (window.TimeWidget) {
            TimeWidget.init();
        }

        // Quotes
        if (window.Quotes) {
            Quotes.init();
        }

        // Habits
        if (window.Habits) {
            Habits.init();
        }

        // Tasks
        if (window.Tasks) {
            Tasks.init();
        }

        // Charts (after habits and tasks are loaded)
        if (window.Charts) {
            Charts.init();
        }

        // AI Recommendations
        if (window.AIRecommendations) {
            AIRecommendations.init();
        }
    },

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle visibility change (refresh data when tab becomes visible)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });

        // Menu button (placeholder for future sidebar)
        const menuBtn = $('#menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                Helpers.showToast('Меню в разработке', 'warning');
            });
        }

        // Search box (placeholder)
        const searchBox = $('.search-box');
        if (searchBox) {
            searchBox.addEventListener('click', () => {
                Helpers.showToast('Поиск в разработке', 'warning');
            });
        }
    },

    /**
     * Close all modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => modal.classList.remove('active'));
    },

    /**
     * Refresh data (called when tab becomes visible)
     */
    refreshData() {
        // Update time
        if (window.TimeWidget) {
            TimeWidget.update();
        }

        // Re-render habits (in case date changed)
        if (window.Habits) {
            Habits.render();
            Habits.updateStats();
        }

        // Re-render tasks
        if (window.Tasks) {
            Tasks.render();
        }

        // Update charts
        if (window.Charts) {
            Charts.updateAll();
        }
    },

    /**
     * Export all data
     */
    exportData() {
        const data = Storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `habit-tracker-backup-${Helpers.getToday()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        Helpers.showToast('Данные экспортированы', 'success');
    },

    /**
     * Import data
     */
    importData(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Storage.importAll(data);

                // Reload page to apply changes
                Helpers.showToast('Данные импортированы. Перезагрузка...', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                Helpers.showToast('Ошибка импорта данных', 'error');
            }
        };

        reader.readAsText(file);
    },

    /**
     * Clear all data
     */
    clearAllData() {
        if (confirm('Вы уверены? Все данные будут удалены!')) {
            Storage.clearAll();
            Helpers.showToast('Все данные удалены. Перезагрузка...', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make globally available
window.App = App;
