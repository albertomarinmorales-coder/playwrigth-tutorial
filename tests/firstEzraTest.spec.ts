import { test, expect } from '@playwright/test'; //Importamos la funcionalidad de tests de playwright

test.beforeEach(async ({ page }) => {
    await page.goto('https://deals.ezra.fi/signin')
})

test('User login', async ({page}) =>{
    await page.getByRole('textbox', {name: 'Your email address'}).fill('alberto.marin@strivelabs.io')
    await page.getByRole('button',{name: 'Continue with email'}).click()
    await page.getByRole('textbox', {name: 'Your password'}).fill('Ezra1234.')
    await page.getByRole('button',{name: 'Continue with email'}).click()
    
    await expect(page).toHaveURL('https://deals.ezra.fi/')
})