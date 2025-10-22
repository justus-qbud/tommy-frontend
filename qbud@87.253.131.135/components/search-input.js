class SearchInput {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      placeholder: options.placeholder || 'Zoeken...',
      minQueryLength: options.minQueryLength || 3,
      onSearch: options.onSearch || (() => {}),
      onClear: options.onClear || (() => {}),
      onQueryChange: options.onQueryChange || (() => {}),
      onFocus: options.onFocus || (() => {}),
      onBlur: options.onBlur || (() => {}),
    };
    
    this.state = {
      query: '',
      lastQuery: '',
      parse: null
    };
    
    this.element = null; // Cache DOM elements
    this.searchIcon = null; // Cache search icon
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
          maxlength="100"
          autocomplete="off"
        />
        <span id="tommy-search-placeholder">Boek hier uw vakantie</span>
        <svg id="tommy-search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="cursor: pointer;"><path d="M9.145 18.29c-5.042 0-9.145-4.102-9.145-9.145s4.103-9.145 9.145-9.145 9.145 4.103 9.145 9.145-4.102 9.145-9.145 9.145zm0-15.167c-3.321 0-6.022 2.702-6.022 6.022s2.702 6.022 6.022 6.022 6.023-2.702 6.023-6.022-2.702-6.022-6.023-6.022zm9.263 12.443c-.817 1.176-1.852 2.188-3.046 2.981l5.452 5.453 3.014-3.013-5.42-5.421z"/></svg>
        <span class="loader"></span>
      </div>
      <span id="tommy-search-bar-message">Druk op Enter om te zoeken</span>
    `;
  }

  render() {
    this.container.innerHTML = this.template();
  }

  cacheElements() {
    this.element = this.container.querySelector('#tommy-search-input');
    this.searchIcon = this.container.querySelector('#tommy-search-icon');
  }

  bindEvents() {
    this.element.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });
    
    this.element.addEventListener('focus', () => {
      this.options.onFocus();
    });

    // Add Enter key listener
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission if inside a form
        this.triggerSearch();
      }
    });

    // Add search icon click listener (mobile-compatible)
    this.searchIcon.addEventListener('click', () => {
      this.triggerSearch();
    });

    // Optional: Add touch support for better mobile experience
    this.searchIcon.addEventListener('touchend', (e) => {
      e.preventDefault(); // Prevent double-firing with click event
      this.triggerSearch();
    });
  }

  handleInput(value) {
    const trimmedValue = value.trim();
    this.state.query = value;

    // Notify about query change immediately
    this.options.onQueryChange(trimmedValue);

    if (trimmedValue.length) {
      this.element.classList.add("not-empty");
      if (trimmedValue.length >= 4) {
        this.element.parentElement.parentElement.classList.add("ready");
      } else {
        this.element.parentElement.parentElement.classList.remove("ready");
      }
    } else {
      this.options.onClear();
      this.element.classList.remove("not-empty");
      this.element.parentElement.parentElement.classList.remove("ready");
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
      this.element.disabled = true;
      this.element.classList.add("disabled");
      this.element.parentElement.parentElement.classList.remove("ready");
      this.setLoading(true);
      try {
        await this.options.onSearch(query, this.state.parse);
        this.element.classList.remove("not-empty");
        this.element.value = "";
        this.state.query = "";
      } catch {
        this.element.parentElement.parentElement.classList.add("ready");
      } finally {
        this.element.disabled = false;
        this.element.classList.remove("disabled");
        this.setLoading(false);
      }
    } else {
      await this.options.onSearch("");
    }
  }

  updateParse(parse) {
    if (Object.keys(parse).includes("error")) {
      delete parse["error"];
    }

    if (this.state.parse) {
      let newParse = JSON.parse(this.state.parse);
      newParse = {...newParse, ...parse};
      this.state.parse = JSON.stringify(newParse);
    } else {
      this.state.parse = JSON.stringify(parse);
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

  blur() {
    this.element?.blur();
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export { SearchInput };