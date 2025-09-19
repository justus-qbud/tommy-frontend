export class SearchResults {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.results = [];
    this.loading = false;
  }

  templates = {
    container: () => `
      <div class="results-container">
        ${this.loading ? this.templates.loading() : this.templates.resultsList()}
      </div>
    `,
    
    loading: () => `<div class="loading">Searching...</div>`,
    
    resultsList: () => {
      if (this.results.length === 0) {
        return '<div class="no-results">No results found</div>';
      }
      return this.results.map(result => this.templates.resultItem(result)).join('');
    },
    
    resultItem: (result) => `
      <div class="result-item" data-id="${result.id}">
        <h3>${result.title}</h3>
        <p>${result.description}</p>
        <small>${result.url}</small>
      </div>
    `
  };

  render() {
    this.container.innerHTML = this.templates.container();
    this.bindEvents();
  }

  updateResults(newResults) {
    this.results = newResults;
    this.loading = false;
    this.render();
  }

  setLoading(loading) {
    this.loading = loading;
    this.render();
  }

  bindEvents() {
    
  }

}