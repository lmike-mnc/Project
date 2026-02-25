/**
 * Context7 Module for documentation retrieval
 * Used to enrich AI recommendations with expert context
 */

const Context7 = {
    /**
     * Search for context based on a query
     * @param {string} query - The search query (e.g., "habit building techniques")
     * @param {string} libraryId - Optional library ID (e.g., "productivity/frameworks")
     * @returns {Promise<Array>} - Array of context snippets
     */
    async getContext(query, libraryId = '') {
        if (!CONFIG.CONTEXT7_API_KEY) {
            console.warn('Context7 API key not found');
            return [];
        }

        try {
            let url = `${CONFIG.CONTEXT7_API_URL}/context?query=${encodeURIComponent(query)}`;
            if (libraryId) {
                url += `&libraryId=${encodeURIComponent(libraryId)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.CONTEXT7_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Context7 API error: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Context7 Error:', error);
            return [];
        }
    },

    /**
     * Search for libraries/documentation sources
     * @param {string} query - Search query
     * @returns {Promise<Array>} - List of libraries
     */
    async searchLibraries(query) {
        try {
            const response = await fetch(`${CONFIG.CONTEXT7_API_URL}/libs/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.CONTEXT7_API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`Context7 Search error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Context7 Search Error:', error);
            return [];
        }
    }
};

// Make globally available
window.Context7 = Context7;
