import { test, expect } from '@playwright/test'; //Importamos la funcionalidad de tests de playwright

test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('http://uitestingplayground.com/ajax')
    await page.getByText('Button Triggering AJAX Request').click()
    testInfo.setTimeout(testInfo.timeout + 2000)
})

test('auto waiting',async ({ page }) => {
    const successButton = page.locator('.bg-success')

    await successButton.click()

    // const text = await successButton.textContent()
    await successButton.waitFor({state:"attached"})
    const text = await successButton.allTextContents()

    // expect(text).toContain('Data loaded with AJAX get request.')

    await expect(successButton).toHaveText('Data loaded with AJAX get request.', {timeout:16000})
})

test('alternative waits', async ({page})=>{
    const successButton = page.locator('.bg-success')

    //__ wait for elements
    await page.waitForSelector('.bg-success')

    //__wait for particular response
    await page.waitForResponse('http://uitestingplayground.com/ajaxdata')

    //__wait fot network calls to be completed ('NOT RECOMENDED')
    await page.waitForLoadState('networkidle')


    const text = await successButton.allTextContents()
    expect(text).toContain('Data loaded with AJAX get request.')

})

test('timeouts', async ({page})=>{
    // test.setTimeout(10000)
    test.slow()
    const successButton = page.locator('.bg-success')
    await successButton.click()
})

