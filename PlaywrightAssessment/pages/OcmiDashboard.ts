import { Page } from '@playwright/test';
 
 
 
export class OcmiDashboard {
    readonly page: Page;
    private postBtn;
    private enterTitle;
    private writeContent;
    private createPostBtn;
    private editBtn;
    private updatePostBtn;
    private title;
 
    constructor(page: Page) {
        this.page = page;
        this.postBtn = "//button[@class='justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex items-center gap-2']";
        this.enterTitle = "//*[@name='title']";
        this.writeContent = "//*[@name='content']";
        this.createPostBtn = '//button[@type="submit" and text()="Create Post"]';
        this.editBtn = "//button[@class='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 edit-button']";
        this.updatePostBtn = '//button[@type="submit" and text()="Update Post"]';
        this.title = "//*[@class='text-2xl font-semibold leading-none tracking-tight']";
    }
 
    async createPost(postWriteTitle, postWriteContent) {
        await this.page.locator(this.postBtn).click();
        await this.page.locator(this.enterTitle).fill(postWriteTitle);
        await this.page.locator(this.writeContent).fill(postWriteContent);
        await this.page.locator(this.writeContent).fill(postWriteContent);
        await this.page.locator(this.createPostBtn).click();
 
        await this.page.pause();
    }
 
    async updatePost(updatePostWriteTitle, updatePostWriteContent) {
        await this.page.locator(this.editBtn).click();
        await this.page.locator(this.enterTitle).fill(updatePostWriteTitle);
        await this.page.locator(this.writeContent).click();
        await this.page.locator(this.writeContent).fill(updatePostWriteContent);
        await this.page.locator(this.updatePostBtn).click();
        //await this.page.pause();
    }
 
    async validatePageTitle(postWriteTitle: string) {
        const actualTitle = await this.page.locator(this.title).textContent();
        if (actualTitle?.trim() === postWriteTitle) {
            console.log("El título de la página coincide:", actualTitle);
        } else {
            throw new Error(`El título de la página no coincide. Esperado: "${postWriteTitle}", Actual: "${actualTitle}"`);
        }
    }
   
 
}