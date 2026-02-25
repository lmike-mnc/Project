/**
 * Application Configuration
 */

const CONFIG = {
    APP_NAME: 'Трекер Привычек',
    LANGUAGE: 'ru',

    // API Endpoints
    QUOTES_API: 'https://api.quotable.io/random',
    OPENAI_API: 'https://api.openai.com/v1/chat/completions',

    // OpenAI Settings
    OPENAI_MODEL: 'gpt-4o-mini',
    OPENAI_API_KEY: '', // REMOVED FOR SECURITY - USE ENVIRONMENT VARIABLES

    // Context7 Settings
    CONTEXT7_API_URL: 'https://context7.com/api/v2',
    CONTEXT7_API_KEY: '', // REMOVED FOR SECURITY - USE ENVIRONMENT VARIABLES

    // LocalStorage Keys
    STORAGE_PREFIX: 'habitTracker_',
    STORAGE_KEYS: {
        HABITS: 'habitTracker_habits',
        TASKS: 'habitTracker_tasks',
        SETTINGS: 'habitTracker_settings',
        AI_CACHE: 'habitTracker_aiCache'
    },

    // Categories
    HABIT_CATEGORIES: [
        { id: 'health', name: 'Здоровье', icon: '💪', color: '#22c55e' },
        { id: 'work', name: 'Работа', icon: '💼', color: '#3b82f6' },
        { id: 'study', name: 'Учёба', icon: '📚', color: '#f59e0b' },
        { id: 'personal', name: 'Личное', icon: '🌟', color: '#a855f7' }
    ],

    // Priority Levels
    TASK_PRIORITIES: [
        { id: 'high', name: 'Высокий', color: '#ef4444' },
        { id: 'low', name: 'Низкий', color: '#22c55e' }
    ],

    // Chart Colors
    CHART_COLORS: {
        primary: '#e55b3c',
        secondary: '#6366f1',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        categories: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7']
    },

    // Weekdays in Russian
    WEEKDAYS: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    WEEKDAYS_SHORT: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],

    // Months in Russian
    MONTHS: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],

    // Fallback Quotes (Russian)
    FALLBACK_QUOTES: [
        { text: 'Успех — это сумма небольших усилий, повторяемых изо дня в день.', author: 'Роберт Кольер' },
        { text: 'Единственный способ делать великую работу — любить то, что вы делаете.', author: 'Стив Джобс' },
        { text: 'Будущее принадлежит тем, кто верит в красоту своей мечты.', author: 'Элеонора Рузвельт' },
        { text: 'Начните делать то, что необходимо, затем то, что возможно, и вдруг вы уже делаете невозможное.', author: 'Франциск Ассизский' },
        { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
        { text: 'Не важно, как медленно ты идёшь, главное — не останавливайся.', author: 'Конфуций' },
        { text: 'Каждый день — это шанс стать лучше.', author: 'Неизвестный автор' },
        { text: 'Привычки — это невидимая архитектура повседневной жизни.', author: 'Гретхен Рубин' }
    ]
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.HABIT_CATEGORIES);
Object.freeze(CONFIG.TASK_PRIORITIES);
Object.freeze(CONFIG.CHART_COLORS);
