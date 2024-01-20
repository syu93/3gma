import page, { Context } from 'page';
import { auth, loginWithGoogle } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { initEditor } from './editor';

const app = document.querySelector('#app');
const router = app?.querySelector('#router');

enum ROUTES {
  HOME = '/',
  EDITOR = '/editor/:projectId',
  LOGIN = '/login'
};

function hideAllPages() {
  router?.classList.remove('hidden');
  const pages = router?.querySelectorAll('[data-page]');
  pages?.forEach(page => {
    page.classList.add('hidden');
  });
}

function displayPage(pageName: string): Element {
  const page = router?.querySelector(`[data-page="${pageName}"]`);
  if (!page) throw new Error(`Page ${page} not found`);

  page.classList.remove('hidden');

  return page;
}

function setLoadingState(state: boolean) {
  const loader = app?.querySelector('#loader');
  const methodName = state ? 'remove' : 'add';
  loader?.classList[methodName]('hidden');
}

page('*', async (ctx: Context, next) => {
  setLoadingState(true);
  hideAllPages();
  onAuthStateChanged(auth, next);
}, (ctx, next) => {
  setLoadingState(false);
  const user = auth.currentUser;

  if (!user && ctx.path !== ROUTES.LOGIN) {
    page(ROUTES.LOGIN);
  }
  // TODO redirect if on login page with a user
  next();
});

page(ROUTES.HOME, (ctx) => {
  displayPage('home');
});

page(ROUTES.EDITOR, (ctx) => {
  const page = displayPage('editor');
  initEditor(page);
});

page(ROUTES.LOGIN, (ctx) => {
  const page = displayPage('login');
  const loginButton = page.querySelector('form button');
  loginButton?.addEventListener('click', loginWithGoogle);
});

page();