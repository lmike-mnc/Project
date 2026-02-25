/**
 * Time Widget Module
 */

const TimeWidget = {
    timeElement: null,
    secondsElement: null,
    dayElement: null,
    weekdayElement: null,
    monthElement: null,
    intervalId: null,

    /**
     * Initialize time widget
     */
    init() {
        this.timeElement = $('#currentTime');
        this.secondsElement = $('#currentSeconds');
        this.dayElement = $('#currentDay');
        this.weekdayElement = $('#currentWeekday');
        this.monthElement = $('#currentMonth');

        if (!this.timeElement) return;

        this.update();
        this.startTimer();
    },

    /**
     * Update time display
     */
    update() {
        const now = new Date();

        // Time
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        if (this.timeElement) {
            this.timeElement.textContent = `${hours}:${minutes}`;
        }

        if (this.secondsElement) {
            this.secondsElement.textContent = `:${seconds}`;
        }

        // Date
        if (this.dayElement) {
            this.dayElement.textContent = now.getDate();
        }

        if (this.weekdayElement) {
            this.weekdayElement.textContent = CONFIG.WEEKDAYS_SHORT[now.getDay()] + ',';
        }

        if (this.monthElement) {
            this.monthElement.textContent = CONFIG.MONTHS[now.getMonth()];
        }
    },

    /**
     * Start timer
     */
    startTimer() {
        this.intervalId = setInterval(() => this.update(), 1000);
    },

    /**
     * Stop timer
     */
    stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

// Make globally available
window.TimeWidget = TimeWidget;
