export class Router {
  private static instance: Router;

  private constructor() {}

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  static navigateTo(path: string): void {
    window.location.href = path;
  }

  static getParam(key: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }
}
