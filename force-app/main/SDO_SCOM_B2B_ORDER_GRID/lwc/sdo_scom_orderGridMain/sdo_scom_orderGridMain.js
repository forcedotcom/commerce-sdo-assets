
import { LightningElement, wire, api } from 'lwc';
import commId from '@salesforce/community/Id';
import getOrderProducts from '@salesforce/apex/Sdo_Scom_Order_Grid_Controller.getOrderProducts';
import getCartSummary from '@salesforce/apex/Sdo_Scom_Order_Grid_Controller.getCartSummary';
import addToCart from '@salesforce/apex/Sdo_Scom_Order_Grid_Controller.addToCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SdoScomOrderGridMain extends LightningElement {
    //Stores the Id of the account the community user is associated with.
    @api effectiveAccountId;

    @api cartBaseURL;

    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || "";
        let resolved = null;

        if (effectiveAccountId.length > 0 && effectiveAccountId !== "000000000000000") {
            resolved = effectiveAccountId;
        }

        return resolved;
    }

    //Stores the current community Id
    communityId = null;

    showErrorMessage;
    orderProducts = null;
    cartURL;
    cartItems;
    sortObject;
    orderYear;
    showTable;
    searchText = '';
    resetQuantities;
    currencyCode;

    _webstoreId;

    connectedCallback() {
        this.communityId = commId;
        this.showErrorMessage = false;
        this.showTable = false;
    }

    //Wire method that calls getOrderProducts() from the apex controller and stores the results
    //in the orderProducts variable
    @wire(getOrderProducts, {
        communityId: "$communityId",
        effectiveAccountId: "$resolvedEffectiveAccountId",
        productIdTest: '123'
    })
    getOrderProducts({ error, data }) {
        if (data && data.orderProducts.length) {
            this.orderProducts = data.orderProducts;
            this.currencyCode = data.orderProducts.currencyIsoCode;
            this._webstoreId = data.webstoreId;
            this.showErrorMessage = false;
        }
        else if (error) {
            console.log('Error received: ' + JSON.stringify(error));
        }
    }

    //Wire method that calls getCartSummary() from the apex controller and stores the results
    //in the cartSummary variable
    @wire(getCartSummary, {
        webstoreId: "$_webstoreId",
        effectiveAccountId: "$resolvedEffectiveAccountId"
    })
    getCartSummary({ error, data }) {
        if (data) {
            this.cartURL = this.cartBaseURL;
            this.cartItems = data.cartItems;

            console.log('Cart Items Test', JSON.stringify(this.cartItems));
        }
        else if (error) {
            console.log('Error received: ' + JSON.stringify(error));
        }
    }

    //Event handler for filtering the order products by year
    selectYearEventHandler(event) {
        this.orderYear = event.detail.orderYear;
    }

    //Event handler for searching for order products by name or SKU
    searchEventHandler(event) {
        this.searchText = event.detail.searchText;
    }

    //Event handler for sorting the order products
    sortEventHandler(event) {
        this.sortObject = event.detail;
    }

    //Event handler for resetting the product quantities in the table to 0
    resetQuantitiesEventHandler(event) {
        //Need a variable to pass down to the table so that I can call a method to reset the table quantities
        this.resetQuantities = event.detail.randomNumber;
    }

    //Event handler to show/hide the order grid based on the year selected.
    //If there are no orders for the year, the grid isn't shown.
    showTableEventHandler(event) {
        this.showTable = event.detail.showTable;
        console.log('showTable', this.showTable);
    }

    //Event handler for adding products to the user's cart.
    //This calls the addToCart() method in the apex controller.
    addToCartEventHandler(event) {
        const cartProducts = event.detail.cartProducts;
        let totalQuantity = 0;

        cartProducts.forEach((cartProduct) => {
            totalQuantity += cartProduct.quantity;
        })
        console.log('total quanity :', totalQuantity);
        addToCart({
            productsJSON: JSON.stringify(event.detail.cartProducts),
            communityId: this.communityId,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                console.log('result', result);

                if (result) {
                    // Refresh the cart icon

                    let title = '';
                    if (totalQuantity > 1) {
                        title = 'Items Added to Cart';
                    }
                    else {
                        title = 'Item Added to Cart';
                    }

                    let message = 'You have successfully added ' + totalQuantity;
                    if (totalQuantity > 1) {
                        message += ' products to your cart.';
                    }
                    else {
                        message += ' product to your cart.';
                    }

                    this.resetQuantities = Math.random();
                    this.showToast(title, message, 'success');
                }
                else {
                    this.showToast('Error When Adding to Cart',
                        'An error occurred when adding products to your cart. Please contact an administrator for assistance.',
                        'error',
                        'sticky');
                }
            })
            .catch((error) => {
                console.log('Error received: ' + error.errorCode);
            });
    }

    //Method to show a toat message based on the results of the addToCart() call
    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });

        this.dispatchEvent(event);
    }
}