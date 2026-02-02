import { test, expect } from '@playwright/test'; //Importamos la funcionalidad de tests de playwright

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/')
    await page.getByText('Forms').click()
    await page.getByText('Form Layouts').click()
})

test('Locator syntax rules', async ({ page }) => {
    // by Tag Name
    await page.locator('input').first().click()
    
    // by id
    page.locator('#inputEmail')

    // by class Value
    page.locator('.shape-rectangle')

    // by attribute
    page.locator('[placeholder=Email]')

    // by Class vaule (full)
    page.locator('[input-full-width size-medium status-basic shape-rectangle nb-transition]')

    // combine different selectors
    page.locator('input[placeholder="Email"].shape-rectangle [nbinput]')

    // by XPath (NOT RECOMMMENDED)
    page.locator('//*[id="inputEmail"]')

    // by partial text match
    page.locator(':text("Using")')

    // by exact text match
    page.locator(':text-is("Using the Grid")')
})

// User-Facing Locators (Selectores orientados al usuario) - Forma recomendada por Playwright
test('User facing locators', async ({ page }) => {
    await page.getByRole('textbox', { name: "Email" }).first().click()
    await page.getByRole('button', { name: "Sign in" }).first().click()
    await page.getByLabel('Email').first().click()
    await page.getByPlaceholder('Jane Doe').click()
    await page.getByText('Using the Grid').click()
    // await page.getByTestId('TestId').click() --> Hay que poner un dataid
    await page.getByTitle('IoT Dashboard').click()
})

test('location child elements', async ({ page }) => {
    await page.locator('nb-card nb-radio :text-is("Option 1")').click()
    await page.locator('nb-card').locator('nb-radio').locator(':text-is("Option 2")').click()

    // Como consejo, si necesito buscar un "boton" que está dentro de un contenedor, señalamos al conteneod y usarmos "useByRole" para buscar el boton por texto
    await page.locator('nb-card').getByRole('button', { name: 'Sign in' }).first().click()

    await page.locator('nb-card').nth(2).getByRole('button').click()
})

test('locating parent elements', async ({ page }) => {
    await page.locator('nb-card').locator(':text-is("Using the Grid")').click() // text-is es para buscar DONDE esta el texto de forma muy precisa
    await page.locator('nb-card', { hasText: "Using the Grid" }).click() // hasText busca el NODO done está el texto
    await page.locator('nb-card', { hasText: "Using the Grid" }).getByRole('textbox', { name: "Email" }).click()
    await page.locator('nb-card', { has: page.locator('#inputEmail1') }).getByRole('textbox', { name: "Email" }).click()
    await page.locator('nb-card').filter({ hasText: "Basic Form" }).getByRole('textbox', { name: "Email" }).click()
    await page.locator('nb-card').filter({ has: page.locator('.status-danger') }).getByRole('textbox', { name: 'Password' }).click()
    await page.locator('nb-card', { hasText: "Basic Form" }).getByRole('button', { name: 'Submit' }).click()
    await page.locator('nb-card', { hasText: "Horizontal Form" }).getByRole('textbox', { name: 'Email' }).click()
    await page.locator('nb-card').filter({ has: page.locator('nb-checkbox') }).filter({ hasText: "Sign in" }).getByRole('textbox', { name: 'Email' }).click()
})

test('Reusing locators', async ({page})=>{
    const basicForm = page.locator('nb-card').filter({ hasText: "Basic Form" })
    const emailField = basicForm.getByRole('textbox', {name:'Email'})

    await emailField.fill('test@test.com')
    await basicForm.getByRole('textbox', { name: "Password" }).fill('123456')
    await basicForm.getByRole('button').click()
})

test('extraction values', async ({page})=>{
    //singles test value
    const basicForm = page.locator('nb-card').filter({ hasText: "Basic Form" })
    const buttonText = await basicForm.locator('button').textContent() 

    expect(buttonText).toEqual(('Submit'))

    //all text value
    const allRadioButtonsLabels = await page.locator('nb-radio').allTextContents()
    expect(allRadioButtonsLabels).toContain("Disabled Option")

    //input value
    const emailField = basicForm.getByRole('textbox', {name:'Email'})
    await emailField.fill('test@test.com')
    const emailValue = await emailField.inputValue()
    expect(emailValue).toEqual('test@test.com')

    //get the value from the attribute
    const placeholderValue = await emailField.getAttribute('placeholder')
    expect(placeholderValue).toEqual('Email')
})

test('Assertions', async ({page})=>{
    const basicFormButton = page.locator('nb-card').filter({ hasText: "Basic Form" }).locator('button')
    //General assertions
    const value = 5
    expect(value).toEqual(5)
    const text = await basicFormButton.textContent()
    expect(text).toEqual('Submit')

    //Locator assertion
    await expect(basicFormButton).toHaveText('Submit')

    //Soft Assertion
    await expect.soft(basicFormButton).toHaveText('Submit5')
    await basicFormButton.click()
})
