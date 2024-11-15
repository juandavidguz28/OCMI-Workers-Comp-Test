import { test } from '@playwright/test';
import { OcmiLogin } from '../../PlaywrightAssessment/pages/OcmiLogin.ts';
import { OcmiRegister } from '../../PlaywrightAssessment/pages/OcmiRegister.ts';
import { OcmiDashboard } from '../../PlaywrightAssessment/pages/OcmiDashboard.ts';
import { OcmiProfile } from '../../PlaywrightAssessment/pages/OcmiProfile.ts'
 
/* Variables de usuario*/
let userAssessment = 'userassessment';
let passwordAssessment = 'Sqrh9dh5@';
 
/* Variables de contenido*/
let postWriteTitle = "Playwright is rapidly gaining popularity in the automation field";
let postWriteContent = `Playwright has emerged as a popular choice in the automation field, primarily because it supports cross-browser testing across Chromium, Firefox, and WebKit, all from a single API.
This flexibility allows developers to write tests that run reliably on multiple browsers, ensuring consistent user experiences.
 
Additionally, Playwright's robust testing framework and developer-friendly features, such as built-in debugging tools and support for modern web standards, make it a preferred tool for end-to-end testing.
Its reliability and ease of use are key factors driving its adoption among automation teams.`;
 
let updatePostWriteTitle = "This is an update to the post.";
let updatePostWriteContent = "This is an update to the content.";
 
let bookName = "El tunel";
let author = "by Ernesto Sabato (1948)";
 
test.describe("OCMI Workers Comp - End-to-End User Scenario", () => {
    test(`Complete User Flow: Register, Login, Create and Update Post, Set Favorite Book`, async ({ page }, testInfo) => {
 
        const login = new OcmiLogin(page);
        const register = new OcmiRegister(page);
        const postActions = new OcmiDashboard(page);
        const profile = new OcmiProfile(page);
 
 
        // Flujo de ejecución paso a paso
       await test.step("Create One", async () => {
            await login.go("http://localhost:4200/login");
            await register.createAccount(userAssessment, passwordAssessment);
            await login.page.pause();
        });
 
 
        await test.step("Login", async () => {
            await login.go("http://localhost:4200/login");
            await login.withCredentials(userAssessment, passwordAssessment);
            await login.clickInTheElement("//*[@type='submit']");
            //await login.page.pause();
        });
 
        await test.step("Create Post", async () => {
            await postActions.createPost(postWriteTitle, postWriteContent);
            await postActions.validatePageTitle(postWriteTitle);
 
        });
 
        await test.step("Update Post", async () => {
            await postActions.updatePost(updatePostWriteTitle, updatePostWriteContent);
        });
 
        await test.step("Favorite Book", async () => {
            await profile.favoriteBook(bookName, author);
 
        });
    });
});