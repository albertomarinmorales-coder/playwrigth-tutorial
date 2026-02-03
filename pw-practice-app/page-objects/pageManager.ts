import {Page, expect} from "@playwright/test";
import {NavigationPage} from './navigationsPage';
import {FormLayoutsPage} from './formLayoutsPage';
import {DatePickerPage} from './datePickerPage';

export class PageManager{

    private readonly page: Page;
    private readonly navigationPage: NavigationPage;
    private readonly formLayoutsPage: FormLayoutsPage;
    private readonly datePickerPage: DatePickerPage;

    constructor(page:Page){
        this.page = page;
        this.navigationPage = new NavigationPage(this.page);
        this.formLayoutsPage = new FormLayoutsPage(this.page);
        this.datePickerPage = new DatePickerPage(this.page);
    }

    navigateTo(){
        return this.navigationPage;
    }
    formLayouts(){
        return this.formLayoutsPage;
    }
    datePicker(){
        return this.datePickerPage;
    }
}