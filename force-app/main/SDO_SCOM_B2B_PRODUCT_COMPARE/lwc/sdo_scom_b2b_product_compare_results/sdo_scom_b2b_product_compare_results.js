import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import fetchInitValues from "@salesforce/apex/SDO_SCOM_B2B_Product_Compare_Controller.fetchInitValues";
import getProducts from "@salesforce/apex/SDO_SCOM_B2B_Product_Compare_Controller.getProducts";

// STORE IDS
import USERID from "@salesforce/user/Id";
import COMMUNITYID from "@salesforce/community/Id";
import CURRENCY_CODE from "@salesforce/i18n/currency";
import BASE_PATH from "@salesforce/community/basePath";

export default class Sdo_scom_b2b_product_compare_results extends LightningElement {
    labels = {
		toast: {
			initErrorTitle: 'Initialization Error',
			processingErrorTitle: 'Error Detected'
		},
		component: {
			altPleaseWait: 'Please Wait',
			noProducts: 'No Products'
		}
	};

    communityId = COMMUNITYID;
	currencyCode = CURRENCY_CODE;
	userId = USERID;
	webstoreId;
	subscription = null;
	showLoadingSpinner = false;
    productIdList;
	_effectiveAccountId;

    @track products;
	@track facetableAttributeSettings;

    @api heading;
	@api headingSize;
	@api headingAlignment;
	@api headingColor;
	@api facetFields;
    @api hideSku = false;
    @api hideAddToCart = false;
    @api goToCart = false;
	@api displayPrices = false;
    @api hideSavings = false;
    @api hideListPrice = false;
    @api hideDescription = false;

	@api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }

    set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
        this.doInit();
    }

	get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.effectiveAccountId || '';
        let resolved = null;

        if (
            effectiveAcocuntId.length > 0 &&
            effectiveAcocuntId !== '000000000000000'
        ) {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    get communityName() {
		let path = BASE_PATH;
		let pos = BASE_PATH.lastIndexOf("/s");
		if (pos >= 0) {
			path = BASE_PATH.substring(0, pos);
		}
		return path;
	}

	get hasProducts() {
        if(this.products && this.products.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    get headerAlignmentClass() {
		let alignmentClass = "slds-text-align_";
		if (this.headingAlignment) {
			alignmentClass += this.headingAlignment.toLowerCase();
		}
		return alignmentClass;
	}

    get headerSizeClass() {
		let sizeClass = "slds-text-heading_";
		if (this.headingSize) {
			sizeClass += this.headingSize.toLowerCase();
		}
		return sizeClass;
	}

    get headingColorStyle() {
		return `color:${this.headingColor};`;
	}

    connectedCallback() {
        this.doInit();
	}

    doInit() {
        const urlParams = new URLSearchParams(window.location.search);
        const temp = urlParams.get("productIds");

        if(temp != undefined && temp != null) {
            this.productIdList = temp.split(",");
        }

		if (this.effectiveAccountId !== undefined && this.effectiveAccountId !== null) {
            this.fetchInitData();
        } else {
            this.doProductLoad();
        }
        
	}

	fetchInitData() {
        fetchInitValues({
            communityId: this.communityId,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
        .then((result) => {
            if (result) {
                this.webstoreId = result.webstoreId;
                this.doProductLoad();
            }
        })
        .catch((error) => {
            console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: this.labels.toast.initErrorTitle,
                    message: error.message,
                    variant: "error"
                })
            );
        });
    }

    doProductLoad() {
		let facetFieldList = [];

		if(this.facetFields && this.facetFields != null && this.facetFields != "") {
			facetFieldList = this.facetFields.split(",");
		}

		this.showLoadingSpinner = true;

		if (this.effectiveAccountId === undefined || this.effectiveAccountId === null || this.effectiveAccountId === "") {
			this.showLoadingSpinner = false;
		} else {
            if (this.productIdList === undefined || this.productIdList === null || this.productIdList.length <= 0) {
                return;
            }

			getProducts({
				productIdList: this.productIdList,
				displayPrices: this.displayPrices,
				webstoreId: this.webstoreId,
				effectiveAccountId: this.resolvedEffectiveAccountId,
				facetFields: facetFieldList
			})
			.then((result) => {
				this.processResult(result);

			})
			.catch((error) => {
				this.processError(error);
				this.showLoadingSpinner = false;

				this.dispatchEvent(
					new ShowToastEvent({
						title: this.labels.toast.processingErrorTitle,
						message: error.message,
						variant: "error"
					})
				);
			});
		}
	}

    processResult(result) {
		this.showLoadingSpinner = false;

		if (result) {
			if(result.products) {
				let products = result.products;
				this.processProducts(products);
			}
			if(result.facetableAttributeSettings) {
				this.facetableAttributeSettings = result.facetableAttributeSettings;
			}
		}
		this.processMessages(result);
	}

	processProducts(products) {
		for (let i = 0; i < products.length; i++) {
			let product = products[i];

			// format image url
			let url = product.productDetail.defaultImage.url;

			if (url.indexOf("/cms/delivery/media") >= 0) {
				const searchRegExp = /\/cms\/delivery\/media/g;
				url = url.replace(
					searchRegExp,
					this.communityName + "/cms/delivery/media"
				);
			}

			if (url.indexOf("/cms/media") >= 0) {
				const searchRegExp = /\/cms\/media/g;
				url = url.replace(
					searchRegExp,
					this.communityName + "/cms/delivery/media"
				);
			}

			product.productDetail.defaultImage.url = url;

			// format product link
			let communityName = this.communityName;
			let prodLink = communityName + "/s/product/" + product.productDetail.id;
			
			product.productDetail.productLink = prodLink;

			let productPrice = product.productPrice;
			let savings;

			// Calculate the savings
			if (productPrice.listPrice && productPrice.unitPrice) {
				const listPrice = parseInt(productPrice.listPrice, 10);
				const unitPrice = parseInt(productPrice.unitPrice, 10);
	
				savings = listPrice - unitPrice;
			}
			productPrice.savings = savings;
		}
		this.products = products;
	}

	processError(error) {
		let message = error.body ? error.body.message : error;

		this.showLoadingSpinner = false;
		this.dispatchEvent(
			new ShowToastEvent({
				title: this.labels.toast.searchErrorTitle,
				message: message,
				variant: "error"
			})
		);
	}

	processMessages(result) {
		if (result.messagesJson) {
			let messages = JSON.parse(result.messagesJson);

			// Process messages returned
			// Display toasts when applicable
			// Create content for the details section
			for (const message of messages) {
				if (message.toast) {
					this.dispatchEvent(
						new ShowToastEvent({
							title: message.title,
							message: message.message,
							variant: message.severity
						})
					);
				}
			}
			this.showProcessLog = true;
		}
	}
}