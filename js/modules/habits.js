/**
 * Habit Tracker Module
 */

const Habits = {
    habits: [],
    listElement: null,
    filterElement: null,
    modal: null,
    form: null,

    /**
     * Initialize habits module
     */
    init() {
        this.listElement = $('#habitsList');
        this.filterElement = $('#habitFilter');
        this.modal = $('#habitModal');
        this.form = $('#habitForm');

        this.loadHabits();
        this.render();
        this.bindEvents();
        this.updateStats();
    },

    /**
     * Load habits from storage
     */
    loadHabits() {
        this.habits = Storage.load(CONFIG.STORAGE_KEYS.HABITS, []);
    },

    /**
     * Save habits to storage
     */
    saveHabits() {
        Storage.save(CONFIG.STORAGE_KEYS.HABITS, this.habits);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add button
        const addBtn = $('#addHabitBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Filter
        if (this.filterElement) {
            this.filterElement.addEventListener('change', () => this.render());
        }

        // Modal close
        const closeBtn = $('#closeHabitModal');
        const cancelBtn = $('#cancelHabit');
        const overlay = this.modal?.querySelector('.modal-overlay');

        [closeBtn, cancelBtn, overlay].forEach(el => {
            if (el) el.addEventListener('click', () => this.closeModal());
        });

        // Form submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    /**
     * Render habits list
     */
    render() {
        if (!this.listElement) return;

        const filter = this.filterElement?.value || 'all';
        const today = Helpers.getToday();
        const weekStart = Helpers.getWeekStart();

        let filteredHabits = this.habits;

        if (filter !== 'all') {
            filteredHabits = this.habits.filter(h => h.type === filter);
        }

        if (filteredHabits.length === 0) {
            this.listElement.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <p class="empty-state-text">Добавьте первую привычку</p>
                </div>
            `;
            return;
        }

        this.listElement.innerHTML = filteredHabits.map(habit => {
            const isCompleted = this.isHabitCompleted(habit, today, weekStart);
            const category = CONFIG.HABIT_CATEGORIES.find(c => c.id === habit.category);

            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}" data-id="${habit.id}">
                    <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" 
                         data-action="toggle" data-id="${habit.id}"></div>
                    <div class="habit-info">
                        <span class="habit-name">${Helpers.escapeHtml(habit.name)}</span>
                        <span class="habit-category">
                            ${category?.icon || ''} ${category?.name || ''} • 
                            ${habit.type === 'daily' ? 'Ежедневно' : 'Еженедельно'}
                        </span>
                    </div>
                    <div class="habit-actions">
                        <button class="habit-action-btn" data-action="edit" data-id="${habit.id}">✏️</button>
                        <button class="habit-action-btn delete" data-action="delete" data-id="${habit.id}">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind action events
        this.listElement.querySelectorAll('[data-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;

                switch (action) {
                    case 'toggle':
                        this.toggleHabit(id);
                        break;
                    case 'edit':
                        this.editHabit(id);
                        break;
                    case 'delete':
                        this.deleteHabit(id);
                        break;
                }
            });
        });
    },

    /**
     * Check if habit is completed for current period
     */
    isHabitCompleted(habit, today, weekStart) {
        if (habit.type === 'daily') {
            return habit.completedDates?.includes(today);
        } else {
            // Weekly: check if completed any day this week
            return habit.completedDates?.some(date => date >= weekStart);
        }
    },

    /**
     * Toggle habit completion
     */
    toggleHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = Helpers.getToday();
        const weekStart = Helpers.getWeekStart();

        if (!habit.completedDates) {
            habit.completedDates = [];
        }

        if (habit.type === 'daily') {
            const index = habit.completedDates.indexOf(today);
            if (index > -1) {
                habit.completedDates.splice(index, 1);
            } else {
                habit.completedDates.push(today);
            }
        } else {
            // Weekly toggle
            const weekDates = habit.completedDates.filter(d => d >= weekStart);
            if (weekDates.length > 0) {
                // Remove all dates from this week
                habit.completedDates = habit.completedDates.filter(d => d < weekStart);
            } else {
                habit.completedDates.push(today);
            }
        }

        this.saveHabits();
        this.render();
        this.updateStats();

        // Trigger charts update
        if (window.Charts) {
            Charts.updateAll();
        }
    },

    /**
     * Open modal for adding/editing
     */
    openModal(habit = null) {
        if (!this.modal) return;

        const title = $('#habitModalTitle');
        const nameInput = $('#habitName');
        const categoryInput = $('#habitCategory');
        const typeInput = $('#habitType');
        const idInput = $('#habitId');

        if (habit) {
            title.textContent = 'Редактировать привычку';
            idInput.value = habit.id;
            nameInput.value = habit.name;
            categoryInput.value = habit.category;
            typeInput.value = habit.type;
        } else {
            title.textContent = 'Добавить привычку';
            this.form.reset();
            idInput.value = '';
        }

        this.modal.classList.add('active');
    },

    /**
     * Close modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
    },

    /**
     * Handle form submit
     */
    handleSubmit(e) {
        e.preventDefault();

        const id = $('#habitId').value;
        const name = $('#habitName').value.trim();
        const category = $('#habitCategory').value;
        const type = $('#habitType').value;

        if (!name) {
            Helpers.showToast('Введите название привычки', 'error');
            return;
        }

        if (id) {
            // Edit existing
            const habit = this.habits.find(h => h.id === id);
            if (habit) {
                habit.name = name;
                habit.category = category;
                habit.type = type;
            }
            Helpers.showToast('Привычка обновлена', 'success');
        } else {
            // Add new
            this.habits.push({
                id: Helpers.generateId(),
                name,
                category,
                type,
                completedDates: [],
                createdAt: new Date().toISOString()
            });
            Helpers.showToast('Привычка добавлена', 'success');
        }

        this.saveHabits();
        this.closeModal();
        this.render();
        this.updateStats();

        if (window.Charts) {
            Charts.updateAll();
        }
    },

    /**
     * Edit habit
     */
    editHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (habit) {
            this.openModal(habit);
        }
    },

    /**
     * Delete habit
     */
    deleteHabit(id) {
        if (confirm('Удалить эту привычку?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.render();
            this.updateStats();
            Helpers.showToast('Привычка удалена', 'success');

            if (window.Charts) {
                Charts.updateAll();
            }
        }
    },

    /**
     * Update statistics display
     */
    updateStats() {
        const today = Helpers.getToday();
        const weekStart = Helpers.getWeekStart();

        const completed = this.habits.filter(h => this.isHabitCompleted(h, today, weekStart)).length;
        const total = this.habits.length;

        const completedEl = $('#habitsCompleted');
        const totalEl = $('#habitsTotal');

        if (completedEl) completedEl.textContent = completed;
        if (totalEl) totalEl.textContent = total;

        // Update progress circle
        this.updateProgress(completed, total);
    },

    /**
     * Update progress circle
     */
    updateProgress(completed, total) {
        const progressBar = $('#progressBar');
        const progressValue = $('#progressValue');

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        if (progressValue) {
            progressValue.textContent = `${percentage}%`;
        }

        if (progressBar) {
            // Circle circumference = 2 * PI * radius (45)
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (percentage / 100) * circumference;
            progressBar.style.strokeDashoffset = offset;
        }
    },

    /**
     * Get completion data for charts
     */
    getCompletionData(days = 30) {
        const dates = Helpers.getLastNDays(days);

        return dates.map(date => {
            const dailyHabits = this.habits.filter(h => h.type === 'daily');
            if (dailyHabits.length === 0) return 0;

            const completed = dailyHabits.filter(h =>
                h.completedDates?.includes(date)
            ).length;

            return Math.round((completed / dailyHabits.length) * 100);
        });
    },

    /**
     * Get category distribution
     */
    getCategoryData() {
        const categories = {};

        CONFIG.HABIT_CATEGORIES.forEach(cat => {
            categories[cat.id] = 0;
        });

        this.habits.forEach(habit => {
            if (categories[habit.category] !== undefined) {
                categories[habit.category]++;
            }
        });

        return {
            labels: CONFIG.HABIT_CATEGORIES.map(c => c.name),
            data: CONFIG.HABIT_CATEGORIES.map(c => categories[c.id]),
            colors: CONFIG.HABIT_CATEGORIES.map(c => c.color)
        };
    },

    /**
     * Calculate current streak
     */
    calculateStreak() {
        const dailyHabits = this.habits.filter(h => h.type === 'daily');
        if (dailyHabits.length === 0) return 0;

        let streak = 0;
        let date = new Date();

        while (true) {
            const dateStr = date.toISOString().split('T')[0];
            const allCompleted = dailyHabits.every(h =>
                h.completedDates?.includes(dateStr)
            );

            if (!allCompleted) break;

            streak++;
            date.setDate(date.getDate() - 1);

            // Safety limit
            if (streak > 365) break;
        }

        return streak;
    }
};

// Make globally available
window.Habits = Habits;
