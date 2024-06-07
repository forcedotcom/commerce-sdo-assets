import { LightningElement, api } from 'lwc';

export default class Sdo_scom_b2b_product_compare_results_specItem extends LightningElement {
    @api fieldName;
    @api product;

    get fieldValue() {
        let value = null;

        if(this.fieldName === undefined || this.fieldName === null || this.fieldName === "") {
            return value;
        }

        if(this.fieldName in this.product.productDetail.fields) {
            value = this.product.productDetail.fields[this.fieldName]
        }
        return value;
    }
}