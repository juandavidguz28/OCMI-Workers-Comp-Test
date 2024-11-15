import { Page } from '@playwright/test';
export class OcmiRegister {
    readonly page: Page;
    private createOne: string;
    private userAssessment: string;
    private passwordAssessment: string;
    private confirmPasswordAssessment: string;
    private createAccountBtn: string;
    private logOut: string;
 
    constructor(page: Page) {
        this.page = page;
        this.createOne = `//a[contains(text(), 'Create one')]`;
        this.userAssessment = '//*[@name="username"]';
        this.passwordAssessment = '//*[@name="password"]';
        this.confirmPasswordAssessment = '//*[@name="confirmPassword"]';
        this.createAccountBtn = "//button[@type='submit' and contains(text(), 'Create account')]";
        this.logOut = "//*[@class='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100']";
    }
 
    async createAccount(userAssessment, passwordAssessment) {
        await this.page.waitForLoadState('load');
        await this.page.locator(this.createOne).click();
        await this.page.locator(this.userAssessment).fill(userAssessment);
        await this.page.locator(this.passwordAssessment).fill(passwordAssessment);
        await this.page.locator(this.confirmPasswordAssessment).fill(passwordAssessment);
        await this.page.locator(this.createAccountBtn).click();
        await this.page.locator(this.logOut).click();
        //await this.page.pause();
    }
 
}
 