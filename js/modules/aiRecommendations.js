/**
 * AI Recommendations Module using OpenAI API
 */

const AIRecommendations = {
    container: null,
    button: null,
    lastUpdate: null,

    /**
     * Initialize AI module
     */
    init() {
        this.container = $('#aiRecommendations');
        this.button = $('#generateRecommendations');
        this.greetingButton = $('#getAiAdvice');

        this.bindEvents();
        this.loadCachedRecommendations();
    },

    /**
     * Bind events
     */
    bindEvents() {
        if (this.button) {
            this.button.addEventListener('click', () => this.generateRecommendations());
        }

        if (this.greetingButton) {
            this.greetingButton.addEventListener('click', () => this.generateRecommendations());
        }
    },

    /**
     * Load cached recommendations
     */
    loadCachedRecommendations() {
        const cached = Storage.load(CONFIG.STORAGE_KEYS.AI_CACHE);

        if (cached && cached.recommendations) {
            const cacheAge = Date.now() - cached.timestamp;
            const oneHour = 60 * 60 * 1000;

            // Show cached if less than 1 hour old
            if (cacheAge < oneHour) {
                this.displayRecommendations(cached.recommendations);
                this.lastUpdate = cached.timestamp;
            }
        }
    },

    /**
     * Generate AI recommendations
     */
    async generateRecommendations() {
        if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your_openai_api_key_here') {
            this.showError('OpenAI API ключ не настроен. Добавьте ключ в config.js');
            return;
        }

        this.showLoading();

        try {
            const context = this.buildContext();

            // Get expert context from Context7
            const searchQuery = this.getSearchQueryForContext(context);
            const expertContext = await Context7.getContext(searchQuery);

            const recommendations = await this.callOpenAI(context, expertContext);

            this.displayRecommendations(recommendations);
            this.cacheRecommendations(recommendations);

        } catch (error) {
            console.error('AI Error:', error);
            this.showError('Не удалось получить рекомендации. Попробуйте позже.');
        }
    },

    /**
     * Build context for AI
     */
    buildContext() {
        const habits = window.Habits?.habits || [];
        const tasks = window.Tasks?.tasks || [];
        const stats = window.Tasks?.getStats() || {};
        const streak = window.Habits?.calculateStreak() || 0;

        const today = Helpers.getToday();
        const weekStart = Helpers.getWeekStart();

        // Calculate habit completion rate
        const dailyHabits = habits.filter(h => h.type === 'daily');
        const completedToday = dailyHabits.filter(h =>
            h.completedDates?.includes(today)
        ).length;

        const completionRate = dailyHabits.length > 0
            ? Math.round((completedToday / dailyHabits.length) * 100)
            : 0;

        return {
            date: Helpers.formatDate(today, 'full'),
            habits: {
                total: habits.length,
                daily: dailyHabits.length,
                weekly: habits.filter(h => h.type === 'weekly').length,
                completedToday,
                completionRate,
                streak,
                categories: habits.reduce((acc, h) => {
                    acc[h.category] = (acc[h.category] || 0) + 1;
                    return acc;
                }, {})
            },
            tasks: {
                total: stats.total || 0,
                completed: stats.completed || 0,
                pending: stats.pending || 0,
                highPriority: stats.highPriority || 0,
                overdue: stats.overdue || 0,
                pendingTasks: tasks
                    .filter(t => !t.completed)
                    .slice(0, 5)
                    .map(t => ({
                        title: t.title,
                        priority: t.priority,
                        deadline: t.deadline
                    }))
            }
        };
    },

    /**
     * Call OpenAI API
     * @param {Object} context - User data context
     * @param {Array} expertContext - Documentation snippets from Context7
     */
    async callOpenAI(context, expertContext = []) {
        const prompt = this.buildPrompt(context, expertContext);

        const response = await fetch(CONFIG.OPENAI_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `Ты — персональный AI-ассистент по продуктивности. 
                        Анализируй данные пользователя и давай конкретные, actionable рекомендации на русском языке.
                        Будь кратким, позитивным и мотивирующим.
                        Отвечай в формате списка из 3-4 коротких рекомендаций.
                        Каждая рекомендация должна начинаться с эмодзи.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    /**
     * Build prompt for AI
     */
    buildPrompt(context, expertContext = []) {
        let expertDocs = '';
        if (expertContext.length > 0) {
            expertDocs = `
ЭКСПЕРТНЫЕ СОВЕТЫ И ПРИНЦИПЫ ПРОДУКТИВНОСТИ:
${expertContext.slice(0, 3).map(item => `- ${item.content || item.text || ''}`).join('\n')}
`;
        }

        return `
Сегодня: ${context.date}

ПРИВЫЧКИ:
- Всего привычек: ${context.habits.total}
- Ежедневных: ${context.habits.daily}, еженедельных: ${context.habits.weekly}
- Выполнено сегодня: ${context.habits.completedToday} из ${context.habits.daily} (${context.habits.completionRate}%)
- Текущая серия: ${context.habits.streak} дней

ЗАДАЧИ:
- Всего: ${context.tasks.total}
- Выполнено: ${context.tasks.completed}
- Ожидают: ${context.tasks.pending}
- Высокий приоритет: ${context.tasks.highPriority}
- Просроченные: ${context.tasks.overdue}

${context.tasks.pendingTasks.length > 0 ? `
Ближайшие задачи:
${context.tasks.pendingTasks.map(t =>
            `- ${t.title} (${t.priority === 'high' ? 'важно' : 'обычно'}${t.deadline ? ', до ' + t.deadline : ''})`
        ).join('\n')}
` : ''}

${expertDocs}

На основе этих данных и экспертных принципов дай 3-4 персональные рекомендации для повышения продуктивности.
Используй современные методики (GTD, Помодоро, Атомные привычки и др.), если они актуальны.
`;
    },

    /**
     * Determine what to search for in Context7 based on user stats
     */
    getSearchQueryForContext(context) {
        if (context.tasks.overdue > 0) return 'managing overdue tasks and prioritization';
        if (context.habits.completionRate < 30) return 'habit building for beginners consistency';
        if (context.habits.streak > 7) return 'advanced productivity habits and flow state';
        if (context.tasks.highPriority > 3) return 'eisenhower matrix and high pressure productivity';
        return 'general productivity best practices and habit building';
    },

    /**
     * Display recommendations
     */
    displayRecommendations(text) {
        if (!this.container) return;

        // Parse recommendations (split by lines starting with emoji)
        const lines = text.split('\n').filter(line => line.trim());

        this.container.innerHTML = `
            <div class="ai-source-badge">⚡ Улучшено экспертными знаниями Context7</div>
            ${lines.map(line =>
            `<div class="ai-recommendation-item animate-fade-in">${line}</div>`
        ).join('')}`;
    },

    /**
     * Cache recommendations
     */
    cacheRecommendations(recommendations) {
        Storage.save(CONFIG.STORAGE_KEYS.AI_CACHE, {
            recommendations,
            timestamp: Date.now()
        });
        this.lastUpdate = Date.now();
    },

    /**
     * Show loading state
     */
    showLoading() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="ai-loading">
                <div class="spinner"></div>
                <span>Анализирую ваши данные...</span>
            </div>
        `;
    },

    /**
     * Show error
     */
    showError(message) {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="ai-placeholder" style="color: var(--color-danger);">
                <p>❌ ${message}</p>
            </div>
        `;
    }
};

// Make globally available
window.AIRecommendations = AIRecommendations;
