import { LightningElement, api } from 'lwc';

export default class Sdo_scom_product_reviews_pagination extends LightningElement {
    @api currentPage;
    @api totalPages;

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    previousPage() {
        this.dispatchEvent(new CustomEvent('previouspage'));
    }

    nextPage() {
        this.dispatchEvent(new CustomEvent('nextpage'));
    }
}