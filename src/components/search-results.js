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
    this.vertical = true;
  }

  templates = {
    container: () => `
      <div id="tommy-results">
        <div id="tommy-results-tags-buttons">
          ${this.templates.resultsTags()}
          ${this.templates.resultsButtons()}
        </div>
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
        <ul id="tommy-results-list" class="hide scroll ${!this.vertical ? 'class="horizontal"' : ''}">
          ${resultsList}
        </ul>
      `
    },
    
    resultItem: (result) => `
      <li>
        <a class="result-item" data-id="${result.id}" href="${result.url}" target="_blank">
          <img src="${result.image_url}">
          <div classname="result-text">
            <div classname="result-text-title-desc">
              <h3>${result.name}</h3>
              <p>${removeAttributes(result.description)}</p>
            </div>
            <div class="result-item-date-price">
              <span class="result-item-date">
                ${new Date(result["date-from"]).toLocaleDateString(navigator.language, {dateStyle: "medium"})} 
                 - 
                ${new Date(result["date-till"]).toLocaleDateString(navigator.language, {dateStyle: "medium"})} 
              </span>
              <span class="result-item-price">
                <span>
                ${result.price.total ? `&euro;${Math.round(result.price.total)},-` : "Geen prijs"}
                </span>
                <span>
                  Boek nu
                </span>
              </span>
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
    `,

    resultsButtons: () => `
      <div id="tommy-results-buttons">
        <div id="tommy-results-sort">
          <svg id="tommy-results-sort-show" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 3.202l3.839 4.798h-7.678l3.839-4.798zm0-3.202l-8 10h16l-8-10zm3.839 16l-3.839 4.798-3.839-4.798h7.678zm4.161-2h-16l8 10 8-10z"/></svg>
          <ul>
            <li>Standaard</li>
            <li>Prijs oplopend</li>
            <li>Prijs aflopend</li>
          </ul>
        </div>
        <div id="tommy-results-view" ${!this.vertical ? 'class="horizontal"' : ''}>
          <svg id="tommy-results-view-ver" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m20.5 7.583v8.334l.216-.221c.147-.149.341-.223.534-.223.528 0 .75.459.75.75 0 .19-.071.38-.216.526l-1.496 1.528c-.14.142-.332.223-.531.223-.2 0-.392-.079-.533-.22l-1.528-1.527c-.146-.147-.219-.339-.219-.531 0-.495.435-.782.82-.746.168.015.331.087.46.216l.243.243v-8.37l-.243.243c-.129.129-.292.201-.46.216-.385.036-.82-.251-.82-.746 0-.192.073-.384.219-.531l1.528-1.527c.141-.141.333-.22.533-.22.199 0 .391.081.531.223l1.496 1.528c.145.146.216.336.216.526 0 .291-.222.75-.75.75-.193 0-.387-.074-.534-.223zm-4.5 10.167c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-12.5c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75z"/></svg>
          <svg id="tommy-results-view-hor" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m2 17.75c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75zm5.526-8.828s.501.505 2.254 2.259c.147.147.22.339.22.53 0 .192-.073.384-.22.531-1.752 1.753-2.254 2.258-2.254 2.258-.145.145-.335.217-.526.217-.192-.001-.384-.074-.53-.221-.293-.293-.295-.766-.004-1.057l.977-.978h-4.693c-.414 0-.75-.336-.75-.75 0-.413.336-.75.75-.75h4.693l-.978-.978c-.289-.289-.287-.762.006-1.055.147-.146.339-.22.53-.221s.38.071.525.215zm3.474 4.828c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm0-4c0-.414.336-.75.75-.75h9.5c.414 0 .75.336.75.75s-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75zm-9-4c0-.414.336-.75.75-.75h18.5c.414 0 .75.336.75.75s-.336.75-.75.75h-18.5c-.414 0-.75-.336-.75-.75z"/></svg>
        </div>
      </div>
    `

  };

  render() {
    this.container.innerHTML = this.templates.container();
    setTimeout(() => {
      let newResultsList = document.getElementById("tommy-results-list") || document.getElementById("tommy-results-none");
      newResultsList.classList.remove("hide");
    }, 100);
    this.bindEvents();
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

  bindEvents() {

    document.getElementById("tommy-results-view-hor").addEventListener("click", () => {
      this.vertical = false;
      document.getElementById("tommy-results-list")?.classList.add("horizontal");
      document.getElementById("tommy-results-view").classList.add("horizontal");
    });

    document.getElementById("tommy-results-view-ver").addEventListener("click", () => {
      this.vertical = true;
      document.getElementById("tommy-results-list")?.classList.remove("horizontal");
      document.getElementById("tommy-results-view").classList.remove("horizontal");
    });

    document.getElementById("tommy-results-sort-show").addEventListener("click", () => {
      document.getElementById("tommy-results-sort").classList.toggle("show");
    })

  }

  setLoading(loading) {

    if (loading) {
      const loadingText = document.getElementById("tommy-results-none");
      if (loadingText) {
        loadingText.classList.add("hide");
        setTimeout(() => {
          loadingText.textContent = "Aan het laden..."; 
          loadingText.classList.remove("hide");  
        }, 250);
      }
    }

  }

}

function removeAttributes(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("*").forEach(el => [...el.attributes].forEach(attr => el.removeAttribute(attr.name)));
  return div.innerHTML;
}