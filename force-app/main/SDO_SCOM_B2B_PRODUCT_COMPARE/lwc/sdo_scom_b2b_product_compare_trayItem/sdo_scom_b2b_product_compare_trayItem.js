import { LightningElement, api } from 'lwc';

export default class Sdo_scom_b2b_product_compare_trayItem extends LightningElement {
    labels = {
		component: {
            removeLink: 'Remove'
		}
	};

    @api product;
    @api skuColorStyle;

    get productSku() {
        let temp = '';
        const fields = this.product.fields;

        for(let i = 0; i < fields.length; i++) {
            if(fields[i].name === 'StockKeepingUnit') {
                temp = fields[i].value;
                break;
            }
        }
        return temp;
    }

    get productDescription() {
        let temp = '';
        const fields = this.product.fields;

        for(let i = 0; i < fields.length; i++) {
            if(fields[i].name === 'Description') {
                temp = fields[i].value;
                break;
            }
        }
        return temp;
    }

    get productName() {
        let temp = '';
        const fields = this.product.fields;

        for(let i = 0; i < fields.length; i++) {
            if(fields[i].name === 'Name') {
                temp = fields[i].value;
                break;
            }
        }
        return temp;
    }

    get listPrice() {
        let temp = '';
        const prices = this.product.prices;

        for(let i = 0; i < prices.length; i++) {
            if(prices[i].name === 'listingPrice') {
                temp = prices[i].value;
                break;
            }
        }
        return temp;
    }

    get calculatedPrice() {
        let temp = '';
        const prices = this.product.prices;

        for(let i = 0; i < prices.length; i++) {
            if(prices[i].name === 'negotiatedPrice') {
                temp = prices[i].value;
                break;
            }
        }
        return temp;
    }

    get currencyCode() {
        let temp = '';

        const prices = this.product.prices;

        for(let i = 0; i < prices.length; i++) {
            if(prices[i].name === 'currencyIsoCode') {
                temp = prices[i].value;
                break;
            }
        }

        return temp;
    }

    get productLink() {
        return "product/" + this.product.id;
    }

    handleRemoveProduct(event) {
        const productId = event.detail;
    }

    handleRemoveItem(event) {
        let productId = event.target.dataset.productid;
        const customEvent = new CustomEvent('removeitem', { detail: productId, bubbles : true, composed: true });
        this.dispatchEvent(customEvent);
    }
}