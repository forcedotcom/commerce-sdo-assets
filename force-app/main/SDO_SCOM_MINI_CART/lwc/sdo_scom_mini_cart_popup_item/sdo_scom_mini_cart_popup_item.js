import { LightningElement, api } from 'lwc';
import { resolve as resourceResolver } from 'experience/resourceResolver';
import communityPath from '@salesforce/community/basePath';
import { NavigationMixin } from 'lightning/navigation';

export default class sdo_scom_item extends NavigationMixin(LightningElement) {
    @api get item(){
        return this._item;
    }
    set item(value){
        this._item=value;
        this.isGenerateProductUrl = true;   
    }

    _item;
    isGenerateProductUrl = false;
    productUrl = '';
    incrementCounter = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#ban';
    decrementCounter = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#new';
    deleteIcon = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#delete';

    get thumbnailImageUrl(){
        const thumbnailUrl = this.item.cartItem?.productDetails.thumbnailImage?.thumbnailUrl || this.item.cartItem?.productDetails.thumbnailImage?.url || '';
        const cmsImageScalingProps = { height: 150, width: 150 };
        return resourceResolver(thumbnailUrl, false, cmsImageScalingProps);
    }

    get imgAltText() {
        return (
            this.item.cartItem?.productDetails?.thumbnailImage?.alternateText ||
            this.item.cartItem?.productDetails?.name ||
            'image alt text'
        );
    }

    get amount(){
        return  this.item.cartItem.unitAdjustedPriceWithItemAdj;
    }

    get itemCount(){
       return  this.item.cartItem.quantity;
    }

    connectedCallback(){
        if(this.isGenerateProductUrl){
            this.generateProductUrl();
        }
    }

    handleDelete() {
        const event = new CustomEvent('delete', {
            detail: { id: this.item.cartItem.cartItemId },
            bubbles: true,
        });
        this.dispatchEvent(event);
    }

    handleDecrement() {
        const event = new CustomEvent('decrease', {
            detail: { 
                id: this.item.cartItem.cartItemId,
                quantity: this.item.cartItem.quantity
             },
            bubbles: true,
        });
        this.dispatchEvent(event);
    }

    handleIncrement() {
        const event = new CustomEvent('increase', {
            detail: { 
                id: this.item.cartItem.cartItemId,
                quantity: this.item.cartItem.quantity
             },
            bubbles: true,
        });
        this.dispatchEvent(event);
    }

    generateProductUrl() {
        const productId = this.item.cartItem.productDetails.productId;
        if (productId) {
            this.caseHomePageRef = {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: productId,
                    actionName: 'view',
                },
            };
            this[NavigationMixin.GenerateUrl](this.caseHomePageRef)
            .then(url => {
                this.productUrl = url;
                this.isGenerateProductUrl= false;
            });
        }
    } 
}
