const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const cardImg = document.querySelectorAll('.card-img-top');
const cardGallery = document.querySelector('.gallery-cards');
const observeBtn = document.querySelector('.observe-btn');
const formSelect = document.querySelector('.form-select');
const html = document.querySelector('html');

html.dataset.bsTheme = JSON.parse(localStorage.getItem('theme'));
formSelect.value = JSON.parse(localStorage.getItem('theme')) || 'light';
const changeTheme = (e) => {
  const { target } = e;
  localStorage.setItem('theme', JSON.stringify(target.value));
  console.log(localStorage.getItem('theme'));
  html.dataset.bsTheme = JSON.parse(localStorage.getItem('theme'));
};

formSelect.addEventListener('change', changeTheme);

const errMarkup = () => {
  return `
  <p class="text-center fs-1">Error</p>
  `;
};
const makeMarkup = (data) => {
  return data.map((el) => {
    return `<div class="col-sm-6">
                  <div class="card">
                    <img
                      class="card-img-top"
                      src="${el.previewURL}"
                      alt="thumbnail"
                      height="200"
                    />
                    <div class="card-body border-secondary-subtle">
                      <h5 class="card-title fs-3 fw-bold">Card title</h5>
                      <p class="card-text fs-6 text-secondary">
                        Here goes some sample, example text that is relatively
                        short.
                      </p>
                      <button class="btn more-btn bg-body text-start p-0">Show more...</button>
                    </div>
                    <div class="p-3 border-top border-secondary-subtle">
                      <btn
                        class="btn btn-warning text-white fw-bold save-btn mb-1 mb-md-0"
                        href="#"
                        >Save to collection</btn
                      >
                      <btn
                        class="btn border fw-bold text-dark border-2 border-secondary-subtle"
                        href="#"
                        >Share</btn
                      >
                    </div>
                  </div>
                </div>`;
  });
};
class PixabyApi {
  #API_KEY = '34152906-82ee5ecd7f8cc2c72302ae1f5';
  #URL = 'https://pixabay.com/api/';
  constructor() {
    this.page = 1;
    this.query = '';
    this.per_page = 10;
  }
  fetchPhotoByQuery() {
    const searchParams = {
      q: this.query,
      image_type: 'photo',
      orientation: 'horisontal',
      safesearch: true,
      page: this.page,
      per_page: this.per_page,
      key: this.#API_KEY,
    };
    return axios.get(`${this.#URL}`, { params: searchParams });
  }
}

const pixabyApi = new PixabyApi();

const observerOptions = {
  root: null,
  rootMargin: '0px',
  treshHold: 0.5,
};
const observer = new IntersectionObserver(async (entries, observer) => {
  if (entries[0].isIntersecting) {
    pixabyApi.page += 1;
    try {
      const { data } = await pixabyApi.fetchPhotoByQuery();
      if (data.totalHits / pixabyApi.per_page > pixabyApi.page) {
        cardGallery.insertAdjacentHTML(
          'beforeend',
          makeMarkup(data.hits).join('')
        );
      } else {
        cardGallery.insertAdjacentHTML(
          'beforeend',
          makeMarkup(data.hits).join('')
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
}, observerOptions);

const startLoad = async (e) => {
  pixabyApi.query = 'space';
  pixabyApi.page = 1;
  try {
    const { data } = await pixabyApi.fetchPhotoByQuery();
    cardGallery.innerHTML = makeMarkup(data.hits).join('');
  } catch (err) {
    console.log(err);
  }
};

startLoad();

const fetchPhotosBySubmit = async (e) => {
  e.preventDefault();
  pixabyApi.query = e.currentTarget.elements[1].value;
  pixabyApi.page = 1;
  try {
    const { data } = await pixabyApi.fetchPhotoByQuery();
    cardGallery.innerHTML = makeMarkup(data.hits).join('');
    observer.observe(observeBtn);

    if (data.totalHits === 0) {
      cardGallery.innerHTML = errMarkup();

      return;
    }
    if (data.totalHits / pixabyApi.per_page <= 1) {
      cardGallery.innerHTML = makeMarkup(data.hits).join('');
      return;
    }
  } catch (err) {
    console.log(err);
  }
};

searchForm.addEventListener('submit', fetchPhotosBySubmit);
