/**
 * LocalStorage Utility Module
 */

const Storage = {
    /**
     * Save data to localStorage
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },

    /**
     * Load data from localStorage
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    /**
     * Clear all app data
     */
    clearAll() {
        try {
            Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },

    /**
     * Export all data
     */
    exportAll() {
        const data = {};
        Object.entries(CONFIG.STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = this.load(key);
        });
        return data;
    },

    /**
     * Import data
     */
    importAll(data) {
        try {
            Object.entries(data).forEach(([name, value]) => {
                const key = CONFIG.STORAGE_KEYS[name];
                if (key && value) {
                    this.save(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage import error:', error);
            return false;
        }
    },

    /**
     * Check if storage is available
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Make globally available
window.Storage = Storage;
