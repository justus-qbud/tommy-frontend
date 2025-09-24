class SearchInput {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      placeholder: options.placeholder || 'Zoeken...',
      minQueryLength: options.minQueryLength || 3,
      debounceDelay: options.debounceDelay || 300,
      onSearch: options.onSearch || (() => {}),
      onClear: options.onClear || (() => {}),
      onQueryChange: options.onQueryChange || (() => {}),
      onFocus: options.onFocus || (() => {}),
      onBlur: options.onBlur || (() => {}),
    };
    
    this.state = {
      query: '',
      lastQuery: ''
    };
    
    this.debounceTimer = null;
    this.element = null // Cache DOM elements
    this.init();
  }

  init() {
    this.render();
    this.element = this.container.querySelector('#tommy-search-input');
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
          maxlength="100"
          autocomplete="off"
        />
        <span id="tommy-search-placeholder">Accommodatie zoeken</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9.145 18.29c-5.042 0-9.145-4.102-9.145-9.145s4.103-9.145 9.145-9.145 9.145 4.103 9.145 9.145-4.102 9.145-9.145 9.145zm0-15.167c-3.321 0-6.022 2.702-6.022 6.022s2.702 6.022 6.022 6.022 6.023-2.702 6.023-6.022-2.702-6.022-6.023-6.022zm9.263 12.443c-.817 1.176-1.852 2.188-3.046 2.981l5.452 5.453 3.014-3.013-5.42-5.421z"/></svg>
        <span class="loader"></span>
      </div>
    `;
  }

  render() {
    this.container.innerHTML = this.template();
  }

  cacheElements() {
    this.element = this.container.querySelector('#tommy-search-input');
  }

  bindEvents() {
    this.element.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });
    
    this.element.addEventListener('focus', () => {
      this.options.onFocus();
    });
    
    this.element.addEventListener('blur', () => {
      setTimeout(() => {
        this.options.onBlur();
      }, 150);
    });
  }

  handleInput(value) {
    const trimmedValue = value.trim();
    this.state.query = value;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Notify about query change immediately
    this.options.onQueryChange(trimmedValue);

    this.debounceTimer = setTimeout(() => this.triggerSearch(), this.options.debounceDelay);
    if (trimmedValue.length) {
      this.element.classList.add("not-empty");
    } else {
      this.options.onClear();
      this.element.classList.remove("not-empty");
    }
  }

  async triggerSearch() {
    const query = this.state.query.trim();
    const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      
    if (normalizedQuery === this.state.lastQuery) {
      return;
    }
      
    this.state.lastQuery = normalizedQuery;

    if (query.length >= this.options.minQueryLength) {
      this.setLoading(true);
      try {
        await this.options.onSearch(query);
      } finally {
        this.setLoading(false);
      }
    } else {
      await this.options.onSearch("");
    }
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.container.classList.add("loading");
    } else {
      this.container.classList.remove("loading");
    }
  }

  getQuery() {
    return this.state.query.trim();
  }

  setQuery(query) {
    this.state.query = query;
  }

  focus() {
    this.element?.focus();
  }

  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.container.innerHTML = '';
  }
}

export { SearchInput };