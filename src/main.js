import { SearchInput } from './components/search-input';
import { SearchResults } from './components/search-results';
import { SearchService } from './components/search-service';
import './style.scss';


class SearchWidget {
  constructor(element, options) {
    
    this.element = element;
    this.options = options;
    this.state = {
      results: []
    };
    this.searchService = new SearchService(options.searchConfig || {});
    this.init();

  }

  init() {
    this.render();
    this.initializeComponents();
  }

  initializeComponents() {
    // Initialize search input component
    const searchContainer = this.element.querySelector('#tommy-search-container');
    this.searchInput = new SearchInput(searchContainer, {
      placeholder: this.options.placeholder || 'Search...',
      minQueryLength: this.options.minQueryLength || 3,
      debounceDelay: 300,
      onSearch: (query) => this.handleSearch(query),
      onClear: () => this.handleClearSearch(),
    });

    // Initialize results component
    const resultsContainer = this.element.querySelector('#tommy-results-container');
    this.resultsComponent = new SearchResults(resultsContainer, {
      onResultClick: (id) => this.handleResultClick(id)
    });
    this.resultsComponent.render();
  }

  template() {
    return `
      <div id="tommy-search-widget">
        <div id="tommy-search-container"></div>
        <div id="tommy-results-container"></div>
      </div>
    `;
  }

  render() {
    this.element.innerHTML = this.template();
    document.getElementById("app").innerHTML = this.element.innerHTML;
  }

  async handleSearch(query) {
    this.resultsComponent.setLoading(true);
    this.searchInput.setLoading(true);
    
    try {
      const results = await this.searchService.search(query);
      
      // Handle cancelled requests
      if (results === null) {
        return; // Request was cancelled, don't update UI
      }
      
      this.state.results = results;
      this.resultsComponent.updateResults(results);
      
    } catch (error) {
      console.error('Search failed:', error);
      this.resultsComponent.updateResults([]);
      
      // Optionally show error state
      if (this.options.onSearchError) {
        this.options.onSearchError(error);
      }
    } finally {
      // Always clear loading states
      this.resultsComponent.setLoading(false);
      this.searchInput.setLoading(false);
    }
  }

  handleClearSearch() {
    this.state.results = [];
    this.resultsComponent.updateResults([]);
    
    // Cancel any ongoing search
    this.searchService.cancel();
  }


  async performSearch(query) {
    await this.handleSearch(query);
  }

  // Public API methods
  getQuery() {
    return this.searchInput.getQuery();
  }

  async setQuery(query) {
    this.searchInput.setQuery(query);
    await this.handleSearch(query);
  }

  clearSearch() {
    this.searchInput.clearSearch();
  }

  focus() {
    this.searchInput.focus();
  }

  destroy() {
    // Cancel any ongoing searches
    this.searchService.cancel();
    
    if (this.searchInput) {
      this.searchInput.destroy();
    }
    if (this.resultsComponent) {
      this.resultsComponent.destroy();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById("app");
  const searchWidget = new SearchWidget(appElement, {
    placeholder: "Search...",
    minQueryLength: 3,
    searchConfig: {
      apiUrl: "localhost:5000/api/v1/widget/219b2fc6-d2e0-42e9-a670-848124341c0f/search" ,
      timeout: 5000
    },
    onResultSelect: (resultId, results) => {
      console.log('Selected result:', resultId, results);
    },
    onSearchError: (error) => {
      console.error('Search error:', error);
    
    }
  });
});