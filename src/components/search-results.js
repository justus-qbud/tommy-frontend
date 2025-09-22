export class SearchResults {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.results = [];
    this.tags = {
      dates: false,
      age_categories: false,
      accommodation_groups: false,
    }
    this.loading = false;
  }

  templates = {
    container: () => `
      <div id="tommy-results">
        ${this.templates.resultsTags()}
        ${this.templates.resultsList()}
      </div>
    `,
      
    resultsList: () => {
      if (this.results.length === 0) {
        let message;
        if (!this.tags.dates) {
          message = "Voer je gewenste <span>verblijfsdata</span> in.";
        } else if (!this.tags.accommodation_groups) {
          message = "Voeg toe: wil je <span>kamperen of huren</span>?";
        } else if (!this.tags.age_categories) {
          message = "Wat is de <span>samenstelling van je reisgezelschap</span>?"
        } else {
          message = "Geen resultaten.";
        }
        return `<p id="tommy-results-none" class="hide">${message}</p>`;
      }
      const resultsList = this.results.map(result => this.templates.resultItem(result)).join('');
      return `
        <ul id="tommy-results-list" class="hide">
          ${resultsList}
        </ul>
      `
    },
    
    resultItem: (result) => `
      <li>
        <a class="result-item" data-id="${result.id}" href="${result.url}">
          <img src="${result.image_url}">
          <div classname="result-text">
            <h3>${result.name}</h3>
            <div class="result-item-date-and-price">
              <span>${result["date-from"]} - ${result["date-till"]}</span>
              <span>${result.totalPrice}</span>
            </div>
          </div>
        </a>
      </li>
    `,

    resultsTags: () => `
      <div id="tommy-results-tags">
        <span id="tommy-results-tags-dates">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17 3v-2c0-.552.447-1 1-1s1 .448 1 1v2c0 .552-.447 1-1 1s-1-.448-1-1zm-12 1c.553 0 1-.448 1-1v-2c0-.552-.447-1-1-1-.553 0-1 .448-1 1v2c0 .552.447 1 1 1zm13 13v-3h-1v4h3v-1h-2zm-5 .5c0 2.481 2.019 4.5 4.5 4.5s4.5-2.019 4.5-4.5-2.019-4.5-4.5-4.5-4.5 2.019-4.5 4.5zm11 0c0 3.59-2.91 6.5-6.5 6.5s-6.5-2.91-6.5-6.5 2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5zm-14.237 3.5h-7.763v-13h19v1.763c.727.33 1.399.757 2 1.268v-9.031h-3v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-9v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-3v21h11.031c-.511-.601-.938-1.273-1.268-2z"/></svg>
          Datums
        </span>
        <span id="tommy-results-tags-age_categories">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z"/></svg>
          Samenstelling
        </span>
        <span id="tommy-results-tags-accommodation_groups">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 23h-10l-.002-10.016 8.974-7.989 9.011 7.989.017 10.016h-3v-7h-5v7zm-6-7h-2v3h2v-3zm4 0h-2v3h2v-3zm1-15l11.981 10.632-1.328 1.493-10.672-9.481-10.672 9.481-1.328-1.493 12.019-10.632z"/></svg>
          Accommodatietype
        </span>
      </div>
    `

  };

  render() {
    this.container.innerHTML = this.templates.container();
    setTimeout(() => {
      let newResultsList = document.getElementById("tommy-results-list") || document.getElementById("tommy-results-none");
      newResultsList.classList.remove("hide");
    }, 100);
  }

  updateResults(newResults, newParse) {

    newParse = newParse || {};
    for (const key of ["dates", "age_categories", "accommodation_groups"]) {
      if (Object.keys(newParse).includes(key)) {
        document.getElementById(`tommy-results-tags-${key}`).classList.add("active");
      } else {
        document.getElementById(`tommy-results-tags-${key}`).classList.remove("active");
      }
      this.tags[key] = Object.keys(newParse).includes(key);
    }

    const results = [], alternatives = [];
    for (const result of newResults) {
      if (!result.periods) continue;
      for (const period of result.periods) {
        const {periods, ...resultWithoutPeriods} = result;
        console.log(period["date-from"] === newParse.dates.start && period["date-till"] === newParse.dates.end);
        if (period["date-from"] === newParse.dates.start && period["date-till"] === newParse.dates.end) {
          results.push({...resultWithoutPeriods, ...period});
        } else {
          alternatives.push({...resultWithoutPeriods, ...period, alternative: true});
        }
      }
    }
    this.results = [...results, ...alternatives];

    const resultsList = document.getElementById("tommy-results-list") || document.getElementById("tommy-results-none");
    if (resultsList) {
      resultsList.classList.add("hide");
      setTimeout(() => {
        resultsList.outerHTML = this.templates.resultsList();
        setTimeout(() => {
          let newResultsList = document.getElementById("tommy-results-list") || document.getElementById("tommy-results-none");
          newResultsList.classList.remove("hide");
        }, 100);
      }, 250);
    }

    this.loading = false;
  }

  show() {
    this.container.classList.add("show");
  }

  hide() {
    // this.container.classList.remove("show");
  }

}