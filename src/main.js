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

    // Initialize results component
    const resultsContainer = this.element.querySelector('#tommy-results-container');
    this.resultsComponent = new SearchResults(resultsContainer);
    this.resultsComponent.render();

    // Initialize search input component
    const searchContainer = this.element.querySelector('#tommy-search-container');
    this.searchInput = new SearchInput(searchContainer, {
      placeholder: this.options.placeholder || 'Search...',
      minQueryLength: this.options.minQueryLength || 3,
      debounceDelay: 500,
      onSearch: async (query) => await this.handleSearch(query),
      onClear: () => this.handleClearSearch(),
      onFocus: () => this.resultsComponent.show(),
      onBlur: () => this.resultsComponent.hide(),
    });
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
    document.getElementById("tommy-widget-container").innerHTML = this.element.innerHTML;
  }

  async handleSearch(query) {
    // Remove this line: this.searchInput.setLoading(true);
    
    if (!query) {
      this.resultsComponent.updateResults([]);
      return;
    }

    try {
      const [results, parse] = await this.searchService.search(query);
      
      this.state.results = results || [];
      this.resultsComponent.updateResults(results, parse);
      
    } catch (error) {
      console.error('Search failed:', error);
      this.resultsComponent.updateResults([]);
      
      if (this.options.onSearchError) {
        this.options.onSearchError(error);
      }
    } finally {
      // Remove this line: this.searchInput.setLoading(false);
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
  const widgetContainerElement = document.getElementById("tommy-widget-container");
  new SearchWidget(widgetContainerElement, {
    placeholder: "Zoeken...",
    minQueryLength: 3,
    searchConfig: {
      apiUrl: "localhost:5000/api/v1/widget/219b2fc6-d2e0-42e9-a670-848124341c0f/search" ,
      timeout: 5000
    },
  });
});