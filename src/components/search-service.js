class SearchService {
  constructor(options = {}) {
    this.options = {
      apiUrl: options.apiUrl,
      timeout: options.timeout || 5000,
      ...options
    };
    
    this.activeController = null;
  }

  async search(query, parse) {
    // Cancel any ongoing request
    if (this.activeController) {
      this.activeController.abort();
    }

    // Create new AbortController for this request
    this.activeController = new AbortController();

    try {
      const [results, newParse] = await this.searchAPI(query, parse, this.activeController.signal);
      this.activeController = null;
      return [results, newParse];
    } catch (error) {
      this.activeController = null;
      
      if (error.name === 'AbortError') {
        return [null, null];
      }      
      // Re-throw with error details intact
      throw error;
    }
  }

  async searchAPI(query, parse, signal) {
    const params = new URLSearchParams();
    params.append("q", query);
    
    if (parse) {
      params.append("parse", parse);
    }

    try {
      const response = await fetch(
        `${this.options.apiUrl}/catalog/219b2fc6-d2e0-42e9-a670-848124341c0f/search?` + params.toString(),
        {
          method: "get",
          mode: "cors",
          headers: {
            Accept: "application/json",
          },
          signal: signal
        }
      );

      // Check if response is ok before parsing
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const responseJson = await response.json();
      return [responseJson.data.results, responseJson.data.parse];
      
    } catch (error) {

      throw error;

    }
  }

  cancel() {
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
  }

  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
}

export { SearchService };