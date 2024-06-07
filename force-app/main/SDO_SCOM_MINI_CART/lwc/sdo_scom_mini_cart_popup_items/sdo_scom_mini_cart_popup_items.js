import { LightningElement, api} from 'lwc';
import { deleteItemFromCart } from 'commerce/cartApi';
import { updateItemInCart } from 'commerce/cartApi';

export default class sdo_scom_items extends LightningElement {
    @api items;

    async handleItemDelete(event) {
        const cartItemId = event.detail.id;
        try {
            await deleteItemFromCart(cartItemId);
            this.items = this.items?.filter(item => item.cartItemId !== cartItemId);
        } catch (error) {
            console.error('Error deleting cart item: ', error);
        }
    }

    async handleItemDecrement(event) {
        const cartItemId = event.detail.id;
        const quantity = event.detail.quantity;
        try {
            if(Number(quantity) == 1) {
                this.handleItemDelete(event);
            } else {
                await updateItemInCart(cartItemId, Number(quantity) - 1);
            }
        } catch (error) {
            console.error('Error decreasing cart item: ', error);
        }
    }

    async handleItemIncrement(event) {
        const cartItemId = event.detail.id;
        const quantity = event.detail.quantity;
        try {
            await updateItemInCart(cartItemId, Number(quantity) + 1);
        } catch (error) {
            console.error('Error increasing cart item: ', error);
        }
    }
}

