/**
 * @author Joao Rodrigues
 * 2018-05-09 - Using cache in autocomplete.
 * 2019-10-28 - Handling XMLHttpRequest (XHR) connection error.
 * 2023-05-01 - Improved cache management and used fetch instead of XHR.
 * 2023-05-08 - Added debounce function to avoid unnecessary requests.
 */
(function (doc) {
  "use strict"

  /**
   * Manage the cache of programming languages fetched from the server.
   * Avoid fetching over and over again for the same languages.
   * @class
   */
  class CacheManagement {
    constructor() {
      this.set = new Set()
    }

    add(fetchedArray) {
      this.set = new Set([...this.set,  ...fetchedArray])
      this.#sort()
    }

    #sort() {
      this.set = new Set([...this.set].sort());
    }

    search(query) {
      let results = []
      this.set.forEach(value => {
        if (value.toLowerCase().startsWith(query.toLowerCase())) {
          results.push(value)
        }
      })
      return results
    }
  } // end of CacheManagement class

  const cache = new CacheManagement()

  const showErrorMessage = (msg) => {
    doc.querySelector(".error-message").textContent = msg || ""
  }

  /**
   * Fetch the programming languages from the server.
   * @param {string} searchString
   */
  const fetchData = async (searchString) => {
    // 2023-04-25 - using a serverless function.
    const URL = "https://jrrio.netlify.app/lang";
    try {
      const response = await fetch(URL, {
        method: "POST",
        body: JSON.stringify({ name: searchString }),
      })
      if (!response.ok) {
        throw new Error(`fetch was blocked due to CORS policy`); // 403
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('fetchData:', error)
      showErrorMessage(`fetchData: The server is down or unreachable`)
      return error
    }
  } // end of fetchData

  /**
   * Uses the text typed in the input to search for programming languages.
   * @param {event} e - e.target === input
   */
  const search = async (e) => {
    const val = e.target.value.trim()
    if (!val) return
    // Search in the cache for values that start with the typed value.
    let names = cache.search(val)
    if (names.length > 0) {
      // If there's a match, Datalist will show its list.
      console.log("Already in cache")
      // console.log(cache.set)
      return
    }
    // Otherwise, search in the server.
    try {
      names = await fetchData(val)
      if (names.length > 0) {
        console.warn("Fetched from server")
        cache.add(names)
        fillOptions()
      }
    } catch (error) {
      console.error(`Search error:`, error)
      showErrorMessage(`Server may be unavailable. Please try again later.`)
    }
  }

  /**
   * Fill in the Datalist Options
   * with the cached / newly-fetched programming languages.
   */
  const fillOptions = () => {
    const namesInCache = cache.set;
    if (namesInCache.size > 0) {
      const frag = doc.createDocumentFragment()
      namesInCache.forEach(item => {
        const option = doc.createElement("option");
        [option.value, option.text] = [item, item];
        frag.appendChild(option)
      })
      if (frag.hasChildNodes()) {
        const sel = doc.getElementById("lang_sel")
        const newSel = sel.cloneNode(false) // clone Select without options.
        newSel.appendChild(frag)
        sel.parentNode.replaceChild(newSel, sel)
      }
    }
  }

  const getSelectedOption = () => {
    const input = doc.getElementById("search")
    const val = input.value.trim()
    if (!val) return
    const sel = doc.getElementById("lang_sel")
    const options = Array.from(sel.options, i => i.text)
    const found = options.find(x => x == val)
    return found
  }

  const enableBtnShowModal = () => {
    const btnShowModal = doc.querySelector(".btn-showmodal")
    const found = getSelectedOption()
    btnShowModal.disabled = (found == undefined)
    doc.querySelector('.selectedOption').innerHTML = found
      ? `Selected option: <b>${found}</b>`
      : "No option selected";
  }

  const showModal = () => {
    doc.querySelector('#myDialog').showModal();
  }

  const closeDialog = () => {
    doc.querySelector('#myDialog').close();
    doc.querySelector('.selectedOption').innerHTML = ""
    doc.querySelector(".btn-showmodal").disabled = true;
  }

  /**
   * Debounce is used to limit the number of times a function is called in a short period of time.
   * @param {Function} func
   * @param {Number} wait - a delay in milliseconds, usually 250 ms.
   * @returns {Function} a new function that will delay the execution of the original function.
   */
  const debounce = (func, wait = 250) => {
    let timeout;
    return function(event) {
      // console.log(`debounced ${func.name} called`)
      clearTimeout(timeout);
      timeout = setTimeout(() => func(event), wait);
    }
  }

  doc.addEventListener("DOMContentLoaded", function () {
    const input = doc.getElementById("search")
    /* Events sequence:
       keydown > keypress (deprecated) > input > keyup
     */
    if (input) {
      input.addEventListener('keyup', debounce(search));
      input.addEventListener("input", debounce(enableBtnShowModal,350)) // because of Firefox
      input.focus()
    }

    const btnShowModal = doc.querySelector(".btn-showmodal")
    if (btnShowModal) {
      btnShowModal.addEventListener("click", showModal)
    }

    const btnCloseDialog = doc.querySelector(".btn-closedialog")
    if (btnCloseDialog) {
      btnCloseDialog.addEventListener("click", closeDialog)

    }
  })
})(document)