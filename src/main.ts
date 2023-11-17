import page from 'page';

const app = document.querySelector('#app');
const router = app?.querySelector('#router');

function displayPage(pageName: string): Element {
  const page = router?.querySelector(`[data-page="${pageName}"]`);
  if (!page) throw new Error(`Page ${page} not found`);

  page.classList.remove('hidden');

  return page;
}

page('*', (ctx, next) => {
  const pages = router?.querySelectorAll('[data-page]');
  pages?.forEach(page => {
    page.classList.add('hidden');
  });

  next();
});

page('/', (ctx) => {
  displayPage('home');
});

page('/login', (ctx) => {
  displayPage('login');
});

page();