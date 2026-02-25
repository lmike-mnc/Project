/**
 * Helper Functions
 */

const Helpers = {
    /**
     * Query selector shortcut
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * Query selector all shortcut
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Format date in Russian
     */
    formatDate(date, format = 'full') {
        const d = new Date(date);
        const day = d.getDate();
        const month = CONFIG.MONTHS[d.getMonth()];
        const year = d.getFullYear();
        const weekday = CONFIG.WEEKDAYS[d.getDay()];

        switch (format) {
            case 'short':
                return `${day} ${month.slice(0, 3)}`;
            case 'full':
                return `${day} ${month} ${year}`;
            case 'weekday':
                return `${weekday}, ${day} ${month}`;
            case 'iso':
                return d.toISOString().split('T')[0];
            default:
                return `${day} ${month}`;
        }
    },

    /**
     * Get today's date string (YYYY-MM-DD)
     */
    getToday() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Check if date is today
     */
    isToday(dateString) {
        return dateString === this.getToday();
    },

    /**
     * Check if date is in current week
     */
    isThisWeek(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return date >= weekStart && date < weekEnd;
    },

    /**
     * Get start of week
     */
    getWeekStart() {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff)).toISOString().split('T')[0];
    },

    /**
     * Calculate days between two dates
     */
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Check if deadline is overdue
     */
    isOverdue(deadline) {
        if (!deadline) return false;
        return new Date(deadline) < new Date(this.getToday());
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '📢'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => toast.remove());

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Get last N days as array
     */
    getLastNDays(n) {
        const days = [];
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Truncate text
     */
    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.slice(0, length) + '...';
    }
};

// Make globally available
window.Helpers = Helpers;
window.$ = Helpers.$.bind(Helpers);
window.$$ = Helpers.$$.bind(Helpers);
