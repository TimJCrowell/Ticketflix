import { NavBar } from '../components/NavBar.js';

export abstract class BasePage {
  protected readonly root: HTMLElement;
  protected readonly navBar: NavBar;

  constructor(rootId = 'app') {
    const el = document.getElementById(rootId);
    if (!el) throw new Error(`Root element #${rootId} not found.`);
    this.root   = el;
    this.navBar = new NavBar();
  }

  abstract render(): void;

  /** Clears root, appends a wrapper div, mounts the nav into it, returns the wrapper */
  protected scaffold(pageClass: string): HTMLElement {
    this.root.innerHTML = '';
    const page = document.createElement('div');
    page.className = pageClass;
    this.root.appendChild(page);
    this.navBar.render(page);
    return page;
  }
}
