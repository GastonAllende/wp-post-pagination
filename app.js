(function () {
  //"use strict";

  const category = "portfolio_category";
  const wpPostType = "portfolio";
  const pages = 12;
  let catId = 0;

  const categoryElem = document.getElementById("wp-category-list");
  const postElemt = document.getElementById("wp-post-list");
  const paginateElemt = document.getElementById("wp-post-pagination");

  let apiCategoryUrl = `http://www.velourfilm.se/wp/wp-json/wp/v2/${category}`;
  let apiUrl = `http://www.velourfilm.se/wp/wp-json/wp/v2/${wpPostType}/?per_page=${pages}&page=1`;


  function createList(posts) {
    postElemt.innerHTML = '';
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

    postElemt.appendChild(fragment);
  }


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


  function getData(url, cb, pag = false) {
    fetch(url)
      .then(function (response) {

        const contentType = response.headers.get('content-type');
        const totalPages = response.headers.get('x-wp-totalpages');

        // I we want to read the total pages and create pagination list
        if (pag) {
          paginate(totalPages);
        }

        if (contentType && contentType.includes('application/json')) {
          return response.json();
        }
        throw new TypeError('Oops, the format is not JSON.');

      }).then(function (data) {
        cb([...data]); // Call the callback function with the fetched data
      });
  }

  function paginate(pages) {
    paginateElemt.innerHTML = '';
    let fragment = document.createDocumentFragment();

    for (let i = 1; i < +pages + 1; i++) {
      let li = document.createElement("li");
      li.textContent = i;
      li.dataset.pagenr = i;
      fragment.appendChild(li);
    }
    paginateElemt.appendChild(fragment);
  }

  getData(apiCategoryUrl, categoriesList);
  getData(apiUrl, createList, true);

  // Click event for the categories 
  categoryElem.addEventListener("click", function (event) {
    if (event.target.tagName !== "LI") return;
    catId = event.target.dataset.catid;
    if (+catId === 0) {
      getData(apiUrl, createList, true);
    } else {
      let postUrlCat = `http://www.velourfilm.se/wp/wp-json/wp/v2/portfolio/?portfolio_category=${catId}&per_page=12&page=1`;
      getData(postUrlCat, createList, true);
    }

  });

  // Click event for the pagination list 
  paginateElemt.addEventListener("click", function (event) {
    if (event.target.tagName !== "LI") return;
    let page = event.target.dataset.pagenr;
    if (+catId === 0) {
      let apiUrl = `http://www.velourfilm.se/wp/wp-json/wp/v2/${wpPostType}/?per_page=${pages}&page=${page}`;
      getData(apiUrl, createList, true);
    } else {
      let postUrlCat = `http://www.velourfilm.se/wp/wp-json/wp/v2/portfolio/?portfolio_category=${catId}&per_page=12&page=${page}`;
      getData(postUrlCat, createList, true);
    }

    window.scroll(0, 0);

  });



})();
