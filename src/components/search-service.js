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
      const [results, parse] = await this.searchAPI(query, this.activeController.signal);
      this.activeController = null;
      return [results, parse];
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
    
    const params = new URLSearchParams();
    params.append("q", query);

    return new Promise((resolve, reject) => {
      fetch(
        "http://localhost:5000/api/v1/catalog/219b2fc6-d2e0-42e9-a670-848124341c0f/search?" + params.toString(),
        {
          method: "get",
          mode: "cors",
          headers: {
            Accept: "application/json",
          },
          signal: this.activeController.signal
        }
      ).then((response) => {
        return response.json()
      }).then((responseJson) => {
        resolve([responseJson.data.results, responseJson.data.parse]);
      })

      signal?.addEventListener('abort', () => {
        reject("New request");
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