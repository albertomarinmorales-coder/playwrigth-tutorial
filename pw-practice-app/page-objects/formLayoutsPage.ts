import {Page} from "@playwright/test";
import { HelperBase } from "./helperBase";

export class FormLayoutsPage extends HelperBase {

    constructor(page: Page) {
        super(page);
    }

    /**
     * This method fills out and submits the "Using the Grid" form with the provided email, password, and selected option.
     * @param email - The email to be filled in the form.
     * @param password - The password to be filled in the form.
     * @param optionText - The text of the option to be selected (radio button).
     */

    async submitUsingTheGridFromWithCredentialsAndSelectOption(email: string, password: string, optionText: string) {
        const usingTheGridForm = this.page.locator('nb-card:has-text("Using the Grid")');
        await usingTheGridForm.getByRole('textbox', { name: 'Email' }).fill(email);
        await usingTheGridForm.getByRole('textbox', { name: 'Password' }).fill(password);
        await usingTheGridForm.getByRole('radio', { name: optionText }).check({force: true});
        await usingTheGridForm.getByRole('button').click();
    }


    /**
     * This method fills out and submits the inline form with the provided name, email, and checkbox state.
     * @param name  - The name to be filled in the form.
     * @param email - The email to be filled in the form.
     * @param rememberMe  - A boolean indicating whether to check the "Remember me" checkbox.
     */
    async submitInlineFormWithNameEmailAndCheckbox(name: string, email: string, rememberMe: boolean) {
        const inlineForm = this.page.locator('nb-card', {hasText: "Inline form"});
        await inlineForm.getByRole('textbox', { name: 'Jane Doe' }).fill(name);
        await inlineForm.getByRole('textbox', { name: 'Email' }).fill(email);
        if (rememberMe) {
            await inlineForm.getByLabel('Remember me').check({force: true});
        } else {
            await inlineForm.getByLabel('Remember me').uncheck({force: true});
        }
        await inlineForm.getByRole('button').click();
    }
}