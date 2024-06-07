import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import CURRENCY_CODE from "@salesforce/i18n/currency";
import addToCart from "@salesforce/apex/SDO_SCOM_B2B_Product_Compare_Controller.addToCart";

export default class Sdo_scom_b2b_product_compare_results_table extends LightningElement {
    labels = {
		toast: {
			cartUpdated: "Cart updated",
			productAdded: "Product added",
			errorDetected: "Error detected"
		},
		component: {
			altPleaseWait: "Please wait...",
			noProducts: "No products found",
			addToCartBtn: "Add to cart",
            addToCartQtyLabel: "Qty",

			productSpecsHeading: 'Product Specifications',
            name: 'Name',
            price: 'Price'
		}
	};

	currencyCode = CURRENCY_CODE;
	_effectiveAccountId;
	_webstoreId;
	tileHeight;
	showLoadingSpinner = false;

	@track qtyMap = new Map();

	@api products;
	@api facetableAttributeSettings;
	
	@api hideSku;
	@api hideAddToCart = false;
	@api goToCart;
	@api displayPrices;
	@api hideSavings;
	@api hideListPrice;
	@api hideDescription;

	@api headerAlignmentClass;
	@api headerSizeClass;
	@api headingColorStyle;

	
	@api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }

	set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
    }

	@api
    get webstoreId() {
        return this._webstoreId;
    }

	set webstoreId(newId) {
        this._webstoreId = newId;
    }

	get imageContainerHeightStyle() {
		let tileHeight = "200";

		if (this.tileHeight) {
			tileHeight = this.tileHeight.toString();
		}

		return `height:${tileHeight}px;`;
	}

	get imageMaxHeightStyle() {
		let imageMaxHeight = "200";

		if (this.tileHeight) {
			imageMaxHeight = this.tileHeight.toString();
		}

		return `max-height:${imageMaxHeight}px;`;
	}

	get columnWidthStyle() {
		let width = 0;
		let style;

		const length = this.products.length;

		if (length > 4) {
			width = 17;
		} else if (length > 3) {
			width = 21;
		} else if (length > 2) {
			width = 28;
		} else if (length > 1) {
			width = 42;
		} else {
			width = 85;
		}

		style = `width:${width}%;`;

		return style;
	}

	// Add Quantity in map for each product
	handleQTYChange(event) {
		this.qtyMap.set(event.target.id, event.target.value);
	}

	handleAddToCart(event) {
		this.showLoadingSpinner = true;
		let productId = event.target.dataset.productid;
		let qty = this.qtyMap.get(event.target.id);

		if (!qty) qty = 1;

		addToCart({
			webstoreId: this.webstoreId,
			productId: productId,
			quantity: qty,
			effectiveAccountId: this.effectiveAccountId
		})
		.then(() => {
			this.showLoadingSpinner = false;

			this.dispatchEvent(
				new ShowToastEvent({
					title: this.labels.toast.cartUpdated,
					message: this.labels.toast.productAdded,
					variant: "success"
				})
			);

			// Refresh the cart icon
			try {
				this.dispatchEvent(
					new CustomEvent("cartchanged", {
						bubbles: true,
						composed: true
					})
				);
			} catch (err) {
				console.log("error: " + err);
			}
		})
		.catch((error) => {
			this.showLoadingSpinner = false;
			this.error = error;
			
			this.dispatchEvent(
				new ShowToastEvent({
					title: this.labels.toast.errorDetected,
					message: error.message,
					variant: "error"
				})
			);
		});
	}
}