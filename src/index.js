import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { queryFetch, createMarkup } from './ap_info';

let inputValue = '';
let page = 1;
const simpleLightBox = () => new SimpleLightbox('.gallery a', {});

const formRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');
const options = {
  root: null,
  rootMargin: '900px',
  threshold: 0,
};
const observer = new IntersectionObserver(onPagination, options);

formRef.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  page = 1;

  galleryRef.innerHTML = '';
  inputValue = e.target.elements.searchQuery.value.trim();

  if (!inputValue) {
    Notiflix.Notify.failure('Please, fill the input!');
    return;
  }

  try {
    const result = await queryFetch(inputValue, page);

    if (result.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);
      if (result.hits.length < 40) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        observer.unobserve(guard);
      } else {
        observer.observe(guard);
      }

      galleryRef.insertAdjacentHTML('beforeend', createMarkup(result));

      simpleLightBox();

      e.target.reset();
    }
  } catch (error) {
    console.error(error);
  }
}

function onPagination(entries, observer) {
  entries.forEach(async entry => {
    try {
      if (entry.isIntersecting) {
        page += 1;
        const result = await queryFetch(inputValue, page);

        if (result.hits.length < 40) {
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(guard);
        }

        galleryRef.insertAdjacentHTML('beforeend', createMarkup(result));
        simpleLightBox().refresh();
      }
    } catch (error) {
      console.error(error);
    }
  });
}
