import { expect, Page } from '@playwright/test';
 
export class OcmiLogin {
    readonly page: Page;
    private userInput;
    private passwordInput;
 
 
    constructor(page: Page) {
        this.page = page;
        this.userInput = '//*[@name="username"]';
        this.passwordInput = '//*[@name="password"]';
    }
 
    async go(url) {
        await this.page.goto(url, { waitUntil: 'load' });
    }
 
    async withCredentials(userName, password) {
        await this.page.locator(this.userInput).fill(userName);
 
        await this.page.locator(this.passwordInput).fill(password);
 
    }
 
    async clickInTheElement(element) {
        await this.page.locator(element).click();
        await this.page.pause();
    }
 
    async waitLoadPage(url) {
        await expect(this.page).toHaveURL(url);
    }
}
 