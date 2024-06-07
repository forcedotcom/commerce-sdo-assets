import { LightningElement, wire, api } from 'lwc';
import { CartAdapter } from 'commerce/cartApi';
import { NavigationMixin } from 'lightning/navigation';
import communityPath from '@salesforce/community/basePath';
import { CartItemsAdapter } from 'commerce/cartApi';

/**
* A UI control to display the cart badge.
*/
export default class sdo_scom_mini_cart_popup extends NavigationMixin(LightningElement) {

    static renderMode = 'light';

    @api showCount = false;
    @api iconUrl = '';
    @api iconLinkColor;
    @api iconLinkHoverColor;
    @api countType;

    cartItems;
    subtotal;
    cart;
    showPopup;
    _cartPageUrl = '';
    _checkoutUrl = '';
    
    iconUrl = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#cart';
    closeIcon = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#close';

    showData(event) {
        if (this.hasCartItems) {
            this.showPopup = true;
        }
    }

    hideData(event) {
        this.showPopup = false;
    }
    @wire(CartAdapter)
    wiredCart(response) {

        if (response.loaded && response.data) {
            this.cart = response;
        }
    }
    @wire(CartItemsAdapter, {
        sortOrder: 'CreatedDateDesc',
        productFieldNames: ['*'],
        pageNumber: '1',
        pageSize: '25',
    })
    wireCartItems({ data, error, loaded }) {
        if (loaded) {
            this.loaded = loaded;
            if (data) {
                this.cartItems = data.cartItems;
                this.subtotal = data.cartSummary.totalProductAmount;
            }
        } else {
            this.cartItems = undefined;
        }
    }

    get _totalCartCount() {
        return this.cart?.data ? this.setTotalCartCount(this.countType, this.cart.data) : DEFAULTS.totalCartCount;
    }

    get hasCartItems() {
        return this._totalCartCount > 0;
    }
    /**
     * @description Gets whether or not we should show the notification badge
     * @readonly
     */
    get showBadge() {
        return this.showCount && this.hasCartItems;
    }
    /**
     * @description The label for the cart header, in the form of "Cart: {0} items / Cart: {0} product types"
     * @readonly
     * @returns {string} The text description of the number of items in the cart.
     */
    get iconAssistiveText() {
        return generateLabel(this.countType, this._totalCartCount);
    }
    /**
     * @description Gets the total number of items or product types in the cart to be displayed in the cart badge.
     *
     * @returns {string}
     * The total number of items or product types in the cart.
     * If total number is greater than 999 (MAX_CART_ITEMS_COUNT), returns '999+'
     */
    get badgeItemsCount() {
        return badgeLabelGenerator(this._totalCartCount, MAX_CART_ITEMS_COUNT);
    }

    /**
    * @description Custom style options for the icon
    * @readonly
    */
    get customStyles() {
        return `
            --com-c-unified-cart-badge-link-color: ${this.iconLinkColor || 'initial'};
            --com-c-unified-cart-badge-link-color-hover: ${this.iconLinkHoverColor || 'initial'};
        `;
    }

    /**
     * @description Relative url for the active cart
     * @private
     */
    connectedCallback() {
        this.cartPageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Cart',
            }
        };
        this[NavigationMixin.GenerateUrl](this.cartPageRef)
            .then(url => this._cartPageUrl = url);

        this.checkoutPageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Checkout',
            }
        };
        this[NavigationMixin.GenerateUrl](this.checkoutPageRef)
            .then(url => this._checkoutUrl = url);
    }

    /**
     * @description Based on the type of count to be shown, retrieves the correct value and converts to a number if needed
     * If the value cannot be converted to a number, then 0 is returned.
     * @param {CountType | undefined | null} countType
     * @param {Record<string, unknown>} data response from CartAdapter
     * @return {number} Cart count
     * @memberof Badge
     */
    setTotalCartCount(countType, data) {
        let total = 0;
        if (countType === 'TotalProductCount') {
            total = Number(data.cartSummary?.totalProductCount);
        } else if (countType === 'UniqueProductCount') {
            total = Number(data.cartSummary?.uniqueProductCount);
        }
        if (isNaN(total)) {
            total = 0;
        }
        return total;
    }
}

function badgeLabelGenerator(count, maxLimit) {
    let returnValue;
    const countValueExists = count !== null && count !== undefined && count > 0;
    returnValue =
        count > maxLimit
            ? `${maxLimit}+`
            : count.toString();
    return returnValue;
}

const DEFAULTS = {
    totalCartCount: 0,
};
const MAX_CART_ITEMS_COUNT = 999;
const itemsInCart = 'itemsInCart';
const emptyCart = 'emptyCart';

function generateLabel(countType, count) {
    let text;
    let textSrc;
    count = Math.max(count || 0, 0);
    if (count === 0) {
        return emptyCart;
    }
    if (countType === 'Total') {
        textSrc = count === 1 ? itemInCart : itemsInCart;
    } else if (countType === 'Unique') {
        textSrc = count === 1 ? productTypeInCart : productTypesInCart;
    }
    if (textSrc) {
        text = textSrc.replace('{0}', count.toString());
    }
    return text;
}