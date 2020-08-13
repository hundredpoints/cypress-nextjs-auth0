let cachedUsername;

Cypress.Commands.add("login", (credentials = {}, options = {}) => {
  const { username, password } = credentials;

  const {
    login: { getState = () => ({}) } = {},
    callback: {
      onUserLoaded = function (request, response, session, state) {
        return cy.wrap(Promise.resolve(session));
      },
    } = {},
  } = options;

  const cachedUserIsCurrentUser = cachedUsername && cachedUsername === username;
  const _credentials = {
    username: username || Cypress.env("auth0Username"),
    password: password || Cypress.env("auth0Password"),
  };

  const sessionCookieName = Cypress.env("auth0SessionCookieName");
  const stateCookieName = Cypress.env("auth0StateCookieName");

  /* https://github.com/auth0/nextjs-auth0/blob/master/src/handlers/login.ts#L70 */

  try {
    cy.getCookie(sessionCookieName).then((cookieValue) => {
      /* Skip logging in again if session already exists */

      if (cookieValue && cachedUserIsCurrentUser) {
        return true;
      } else {
        cy.clearCookies();

        const state = JSON.stringify({
          ...getState(),
          state: "some-random-state",
        });

        cy.setCookie(stateCookieName, state);

        cy.getUserTokens(_credentials).then((response) => {
          const { accessToken, expiresIn, idToken, scope } = response;

          cy.getUserInfo(accessToken).then((user) => {
            /* https://github.com/auth0/nextjs-auth0/blob/master/src/handlers/callback.ts#L44 */
            /* https://github.com/auth0/nextjs-auth0/blob/master/src/handlers/callback.ts#L47 */
            /* https://github.com/auth0/nextjs-auth0/blob/master/src/session/cookie-store/index.ts#L57 */

            const persistedSession = {
              user,
              idToken,
              accessToken,
              accessTokenScope: scope,
              accessTokenExpiresAt: Date.now() + expiresIn,
              createdAt: Date.now(),
            };

            onUserLoaded(null, response, persistedSession, state).then(
              (session) => {
                /* https://github.com/auth0/nextjs-auth0/blob/master/src/session/cookie-store/index.ts#L73 */
                cy.seal(session).then((encryptedSession) => {
                  cy.setCookie(sessionCookieName, encryptedSession);
                });
              }
            );
          });
        });
      }
    });
  } catch (error) {
    // throw new Error(error);
  }
});
