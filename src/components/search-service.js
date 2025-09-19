class SearchService {
  constructor(options = {}) {
    this.options = {
      apiUrl: options.apiUrl || '/api/search',
      timeout: options.timeout || 5000,
      ...options
    };
    
    this.activeController = null;
  }

  async search(query) {
    // Cancel any ongoing request
    if (this.activeController) {
      this.activeController.abort();
    }

    // Create new AbortController for this request
    this.activeController = new AbortController();

    try {
      const results = await this.searchAPI(query, this.activeController.signal);
      this.activeController = null; // Clear after successful completion
      return results;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Search request was cancelled');
        return null; // Return null for cancelled requests
      }
      
      this.activeController = null;
      throw error; // Re-throw non-abort errors
    }
  }

  async searchAPI(query, signal) {
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve([
          { id: 1, title: `Result for "${query}" 1`, description: 'Description 1' },
          { id: 2, title: `Result for "${query}" 2`, description: 'Description 2' },
          { id: 3, title: `Result for "${query}" 3`, description: 'Description 3' }
        ]);
      }, 500);

      // Handle cancellation
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('AbortError'));
      });
    });
  }

  cancel() {
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
  }

  // Method to update search configuration
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
}

export { SearchService };