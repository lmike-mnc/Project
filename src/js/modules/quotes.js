/**
 * Motivational Quotes Module
 */

const Quotes = {
    quoteElement: null,
    authorElement: null,
    refreshButton: null,

    /**
     * Initialize quotes module
     */
    init() {
        this.quoteElement = $('#quoteText');
        this.authorElement = $('#quoteAuthor');
        this.refreshButton = $('#refreshQuote');

        if (!this.quoteElement) return;

        this.loadQuote();
        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => this.loadQuote());
        }
    },

    /**
     * Load quote from API or fallback
     */
    async loadQuote() {
        this.showLoading();

        try {
            const quote = await this.fetchQuote();
            this.displayQuote(quote);
        } catch (error) {
            console.warn('Quote API failed, using fallback:', error);
            this.displayFallbackQuote();
        }
    },

    /**
     * Fetch quote from API
     */
    async fetchQuote() {
        const response = await fetch(CONFIG.QUOTES_API);

        if (!response.ok) {
            throw new Error('Quote API request failed');
        }

        const data = await response.json();

        return {
            text: data.content,
            author: data.author
        };
    },

    /**
     * Display quote
     */
    displayQuote(quote) {
        if (this.quoteElement) {
            this.quoteElement.textContent = `"${quote.text}"`;
            this.quoteElement.classList.add('animate-fade-in');
        }

        if (this.authorElement) {
            this.authorElement.textContent = `— ${quote.author}`;
        }

        // Remove animation class after it completes
        setTimeout(() => {
            if (this.quoteElement) {
                this.quoteElement.classList.remove('animate-fade-in');
            }
        }, 300);
    },

    /**
     * Display fallback quote
     */
    displayFallbackQuote() {
        const quotes = CONFIG.FALLBACK_QUOTES;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        this.displayQuote(randomQuote);
    },

    /**
     * Show loading state
     */
    showLoading() {
        if (this.quoteElement) {
            this.quoteElement.textContent = 'Загрузка...';
        }
        if (this.authorElement) {
            this.authorElement.textContent = '';
        }
    }
};

// Make globally available
window.Quotes = Quotes;
