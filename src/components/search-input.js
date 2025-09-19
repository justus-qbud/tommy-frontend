class SearchInput {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      placeholder: options.placeholder || 'Search...',
      minQueryLength: options.minQueryLength || 3,
      debounceDelay: options.debounceDelay || 300,
      onSearch: options.onSearch || (() => {}),
      onClear: options.onClear || (() => {}),
      onQueryChange: options.onQueryChange || (() => {})
    };
    
    this.state = {
      query: '',
      isLoading: false
    };
    
    this.debounceTimer = null;
    this.elements = {}; // Cache DOM elements
    this.init();
  }

  init() {
    this.render();
    this.cacheElements();
    this.bindEvents();
  }

  template() {
    return `
      <div id="tommy-search-bar">
        <input 
          type="text" 
          placeholder="${this.options.placeholder}"
          value="${this.state.query}"
          id="tommy-search-input"
        />
      </div>
    `;
  }

  render() {
    this.container.innerHTML = this.template();
  }

  cacheElements() {
    this.elements = {
      input: this.container.querySelector('#tommy-search-input'),
    };
  }

  updateUI() {
    // Update input value only if it differs (prevents cursor jumping)
    if (this.elements.input.value !== this.state.query) {
      this.elements.input.value = this.state.query;
    }
  }

  bindEvents() {
    // Input event with debouncing
    this.elements.input.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });
  }

  handleInput(value) {
    const trimmedValue = value.trim();
    this.state.query = value; // Keep original value for input display
    
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Notify about query change immediately
    this.options.onQueryChange(trimmedValue);

    // Update UI without full re-render
    this.updateUI();

    if (trimmedValue.length >= this.options.minQueryLength) {
      // Debounce the search
      this.debounceTimer = setTimeout(() => {
        this.triggerSearch();
      }, this.options.debounceDelay);
    } else if (trimmedValue.length === 0) {
      // Clear results immediately when input is empty
      this.options.onClear();
    }
  }

  triggerSearch() {
    const query = this.state.query.trim();
    if (query.length >= this.options.minQueryLength) {
      this.setLoading(true);
      this.options.onSearch(query);
    }
  }

  setLoading(isLoading) {
    this.state.isLoading = isLoading;
    this.updateUI();
  }

  getQuery() {
    return this.state.query.trim();
  }

  setQuery(query) {
    this.state.query = query;
    this.updateUI();
  }

  focus() {
    this.elements.input?.focus();
  }

  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.container.innerHTML = '';
  }
}

export { SearchInput };