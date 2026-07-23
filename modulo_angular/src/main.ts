import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

function hydrateSessionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email');
  const role = params.get('role');
  const started = params.get('started');

  if (token && email) {
    const safeRole = role === 'admin' ? 'admin' : 'cliente';
    localStorage.setItem('token', token);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', safeRole);
    localStorage.setItem('session_start', started || new Date().toISOString());

    localStorage.setItem('mtc_session', JSON.stringify({
      user: email,
      role: safeRole,
      authenticated: true
    }));

    const clean = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, clean);
  }
}

hydrateSessionFromQuery();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
