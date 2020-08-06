import { NextApiRequest } from "next";

declare namespace Cypress {
  interface LoginCredentials {
    username: string;
    password: string;
  }

  interface LoginOptions {
    getState: (request: NextApiRequest) => Record<string | number, unknown>;
    password: string;
  }

  interface Chainable<Subject = any> {
    login(
      credentials?: LoginCredentials,
      options: LoginOptions
    ): Chainable<Element>;
    logout(): Chainable<Element>;
  }
}
