(function () {
  //"use strict";

  const wpApiUrl = 'http://www.velourfilm.se/wp/wp-json/wp/v2';

  const category = "portfolio_category";
  const wpPostType = "portfolio";
  const pages = 12;
  let catId = 0;
  let page = 1;

  const categoryElem = document.querySelector("#wp-category-list");
  const postElem = document.querySelector("#wp-post-list");
  const paginateElem = document.querySelector("#wp-post-pagination");

  let apiCategoryUrl = `${wpApiUrl}/${category}`;
  let apiUrl = `${wpApiUrl}/${wpPostType}/?per_page=${pages}&page=1`;

  /**
   * create the list with posts
   * @param {array} posts posts from wp api
   */
  function createList(posts) {
    postElem.innerHTML = '';
    var fragment = document.createDocumentFragment();

    posts.forEach(function (post) {

      let image = post.better_featured_image.source_url;
      var li = document.createElement("li");
      li.style.cssText = `background: url(${image}) 50% 0%`;
      li.innerHTML = `
        <div>
          <h3>${post.title.rendered}</h3>
          <a target=”_blank” href=${post.link}>See project</a>
        </div>
      `;

      fragment.appendChild(li);
    });

    postElem.appendChild(fragment);
  }

  /**
  * create the list with categories related to the porfolio post
  * @param {array} categories categories from wp api
  */
  function categoriesList(categories) {

    let fragment = document.createDocumentFragment();

    let li = document.createElement("li");
    li.textContent = 'All';
    li.dataset.catid = 0;
    fragment.appendChild(li);

    categories.forEach(function (category) {
      let li = document.createElement("li");
      li.textContent = category.name;
      li.dataset.catid = category.id;
      fragment.appendChild(li);
    });
    categoryElem.appendChild(fragment);
  }

  /**
  * to fetch data from passed url 
  * @param {string} url a url to fetch data from
  * @param {object} cb callback function we can pass to manipulate the data
  * @param {boolean} pag boolean if true then we generate the pagination list
  */
  function getData(url, cb, pag = false) {
    fetch(url)
      .then(function (response) {

        const contentType = response.headers.get('content-type');
        const totalPages = response.headers.get('x-wp-totalpages');

        // I we want to read the total pages and create pagination list
        if (pag) {
          createPaginateList(totalPages);
        }

        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }
        throw new TypeError('Oops, the format is not JSON.');

      }).then(function (data) {
        cb([...data]); // Call the callback function with the fetched data
      });
  }

  /**
  * create the list with categories related to the porfolio post
  * @param {string} pages a url to fetch data fromst
  */
  function createPaginateList(pages) {
    paginateElem.innerHTML = '';
    let fragment = document.createDocumentFragment();

    for (let i = 1; i < +pages + 1; i++) {
      let li = document.createElement("li");
      li.textContent = i;
      li.dataset.pagenr = i;
      fragment.appendChild(li);
    }
    paginateElem.appendChild(fragment);
  }

  // Click event for the categories 
  categoryElem.addEventListener("click", function (event) {
    if (event.target.tagName !== "LI") return;
    if (event.target.dataset.catid === catId) return; // Prevent to make a request if the same category is trigger

    catId = event.target.dataset.catid;
    page = 1;
    if (+catId === 0) {
      getData(apiUrl, createList, true); // get all the posts
    } else {
      let postUrlCat = `${wpApiUrl}/${wpPostType}/?portfolio_category=${catId}&per_page=12&page=1`;
      getData(postUrlCat, createList, true); // get posts with chosen category
    }
  });

  // Click event for the pagination list 
  paginateElem.addEventListener("click", function (event) {
    if (event.target.tagName !== "LI") return;
    if (event.target.dataset.pagenr === page) return; // Prevent to make a request if is is the same page nr 
    console.log(event.target.dataset.pagenr, page)
    page = event.target.dataset.pagenr;
    if (+catId === 0) {
      let apiUrl = `${wpApiUrl}/${wpPostType}/?per_page=${pages}&page=${page}`;
      getData(apiUrl, createList, true);
    } else {
      let postUrlCat = `${wpApiUrl}/${wpPostType}/?portfolio_category=${catId}&per_page=12&page=${page}`;
      getData(postUrlCat, createList, true);
    }
    window.scroll(0, 0);
  });

  // init page
  getData(apiCategoryUrl, categoriesList);
  getData(apiUrl, createList, true);

})();
