
import { LightningElement, api } from 'lwc';

export default class SdoScomOrderGridProductQuantity extends LightningElement {
    @api productId;
    @api quantityFirst;

    @api
    get cartItems() {
        return this._cartItems;
    }

    set cartItems(value) {
        this._cartItems = value;

        let productFound = false;
        if (this._cartItems) {
            for (let i = 0; i < this._cartItems.length; i++) {
                const cartItem = this._cartItems[i];
                if (cartItem.productId === this.productId) {
                    this._cartQuantity = cartItem.quantity;
                    productFound = true;
                    break;
                }
            }
        }

        if (!productFound) {
            this._cartQuantity = 0;
        }
    }

    _cartItems;

    _quantity;
    _cartQuantity;

    //Centers the number in the lightning input text since it can't be done directly in the HTML markup
    renderedCallback() {
        const style = document.createElement('style');
        style.innerText = `c-sdo_scom_order-grid-product-quantity .slds-input {
            text-align: center;
        }`;
        this.template.querySelector('lightning-input').appendChild(style);
    }

    //Updates the local quantity variable and sends it to orderGridTable via an event.
    changeQuantity(event) {
        if (event.target.value >= 0) {
            this.quantityFirst = parseInt(event.target.value, 10);
        }
        else {
            return;
        }

        const detail = {
            productId: this.productId,
            quantity: this.quantityFirst
        };

        const changeProductQuantityEvent = new CustomEvent('changeproductquantityevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(changeProductQuantityEvent);
    }
}