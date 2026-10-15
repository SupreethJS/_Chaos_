/**
 * Jarvis the Time Traveller - Login & Sign-in Page Module
 *
 * This file provides the interactive Login Page component for Jarvis the Time Traveller.
 *
 * - When used in React / Vite:
 *     import { LoginPage } from './login page.js';
 *
 * - When run in browser:
 *     import { mountLoginPage } from './login page.js';
 *     mountLoginPage(document.getElementById('root'));
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './src/LoginPage';

export { LoginPage };

/**
 * Mounts the Login Page directly to a DOM container element
 * @param {HTMLElement} container - DOM container element (defaults to #root or document.body)
 * @param {Function} onAuthSuccess - Callback called on successful sign in
 */
export function mountLoginPage(container = document.getElementById('root') || document.body, onAuthSuccess) {
  if (!container) return;
  const root = createRoot(container);
  root.render(
    React.createElement(LoginPage, {
      onSuccess: (user) => {
        if (onAuthSuccess) {
          onAuthSuccess(user);
        } else {
          window.location.reload();
        }
      }
    })
  );
}

export default LoginPage;