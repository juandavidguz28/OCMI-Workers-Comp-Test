import { Page } from '@playwright/test';
 
 
 
export class OcmiProfile {
    readonly page: Page;
    private profileBtn;
    private profileEditBtn;
    private inputFavoriteBook;
 
 
    constructor(page: Page) {
        this.page = page;
        this.profileBtn = "//a[@class='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700']";
        this.profileEditBtn = "//button[@class='inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3']";
        this.inputFavoriteBook = "//input[@class='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-4']";
 
    }
 
    async favoriteBook(bookName: string, author: string) {
        // Hacer clic en los botones necesarios para llegar al campo del libro favorito
        await this.page.locator(this.profileBtn).click();
        await this.page.locator(this.profileEditBtn).click();
   
        // Llenar el campo con el título del libro
        await this.page.locator(this.inputFavoriteBook).click();
        await this.page.locator(this.inputFavoriteBook).fill(bookName);
   
        // Construimos dinámicamente el selector XPath con el autor
        const authorXPath = `//span[contains(@class, 'text-sm') and contains(@class, 'text-gray-500') and contains(., "${author}")]`;
   
        // Esperar hasta que el elemento esté disponible y visible en la pantalla
        await this.page.waitForTimeout(5000);
        await this.page.waitForSelector(authorXPath);
 
        // Obtenemos el texto completo del elemento combinando todos los nodos de texto
        const actualAuthorText = await this.page.evaluate((selector) => {
            const element = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element ? Array.from(element.childNodes).map(node => node.textContent).join('').trim() : null;
        }, authorXPath);
   
        if (actualAuthorText === author) {
            console.log(`El texto del autor coincide: "${actualAuthorText}"`);
   
            // Hacer clic en el elemento
            await this.page.locator(authorXPath).click();
            console.log('Se hizo clic en el autor.');
        } else {
            throw new Error(
                `El texto del autor no coincide. Esperado: "${author}", Actual: "${actualAuthorText}"`
            );
        }
    }
   
 
}