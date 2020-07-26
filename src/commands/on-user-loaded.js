Cypress.Commands.add("onUserLoaded", (request, response, session, state) => {
  return new Cypress.Promise((resolve, reject) => {
    resolve(session);
  });
});
