import { SearchInput } from './components/search-input';
import { SearchResults } from './components/search-results';
import { SearchService } from './components/search-service';
import './style.scss';


class SearchWidget {
  constructor(element, options) {
    
    this.element = element;
    this.options = options;
    this.state = {
      results: [],
    };
    this.searchService = new SearchService({apiUrl: this.options.apiUrl});
    this.init();

  }

  init() {
    this.render();
    this.initializeComponents();
  }

  initializeComponents() {

    // Initialize results component
    const resultsContainer = this.element.querySelector('#tommy-results-container');
    this.resultsComponent = new SearchResults(resultsContainer, "/api/v1");
    this.resultsComponent.render();

    // Initialize search input component
    const searchContainer = this.element.querySelector('#tommy-search-container');
    this.searchInput = new SearchInput(searchContainer, {
      placeholder: this.options.placeholder || 'Search...',
      minQueryLength: this.options.minQueryLength || 3,
      debounceDelay: 750,
      onSearch: async (query, parse) => await this.handleSearch(query, parse),
      onFocus: () => this.resultsComponent.show(),
    });

    document.addEventListener("click", (e) => {
      const widget = document.getElementById("tommy-search-widget")
      if (!widget.contains(e.target)) {
        this.resultsComponent.hide();
        this.searchInput.blur();
      }
    });

  }

  template() {
    return `
      <div id="tommy-search-widget">
        <div id="tommy-search-container"></div>
        <div id="tommy-results-container" class="no-results"></div>
      </div>
    `;
  }

  render() {
    this.element.innerHTML = this.template();
    document.getElementById("tommy-zb").innerHTML = this.element.innerHTML;
  }

  async handleSearch(query, parse) {
   
    this.resultsComponent.clearError();

    if (!query || query.length < 4) {
      this.state.results = [];
      this.resultsComponent.setLoading(false);
      this.resultsComponent.updateResults([], {});
      return;
    }

    this.resultsComponent.setLoading(true);

    try {
      const [results, newParse] = await this.searchService.search(query, parse);
      
      this.state.results = results || [];
      this.resultsComponent.updateResults(results, newParse);
      this.searchInput.updateParse(newParse);
      
    } catch (error) {
      if (error.status === 400) {
        this.resultsComponent.setError("BAD_REQUEST");
      }
      this.resultsComponent.updateResults([], null);
    } finally {
      this.resultsComponent.setLoading(false);
    }

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

function initWidget() {
  const widgetContainerElement = document.getElementById("tommy-zb");
  
  if (!widgetContainerElement) {
    console.error('Tommy Widget: Container element #tommy-zb not found');
    return;
  }
  
  new SearchWidget(widgetContainerElement, {
    apiUrl: `/api/v1`,
    placeholder: "Typ hier...",
    minQueryLength: 3,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}