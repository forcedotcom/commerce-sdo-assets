import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { subscribe, publish, MessageContext } from "lightning/messageService";

import fetchInitValues from "@salesforce/apex/SDO_SCOM_B2B_Product_Compare_Controller.fetchInitValues";

import PRODUCT_COMPARE_CHANNEL from "@salesforce/messageChannel/SDO_SCOM_B2B_Product_Compare_Selection__c";
import PRODUCT_UPDATE_CHANNEL from "@salesforce/messageChannel/SDO_SCOM_B2B_Product_Compare_Update__c";

// STORE IDS
import USERID from "@salesforce/user/Id";
import COMMUNITYID from "@salesforce/community/Id";
import CURRENCY_CODE from "@salesforce/i18n/currency";
import BASE_PATH from "@salesforce/community/basePath";

export default class Sdo_scom_b2b_product_compare_tray extends LightningElement {
    labels = {
		toast: {
			searchErrorTitle: 'Error Detected'
		},
		component: {
			altPleaseWait: 'Please Wait',
			noProducts: 'No Products',
			compareProductsBtn: 'Compare Products',
			clearAllBtn: 'Clear All'
		}
	};

    communityId = COMMUNITYID;
	currencyCode = CURRENCY_CODE;
	userId = USERID;
	webstoreId;
	subscription = null;

    templateWidth;
	templateSize;
	tileWidth;
	tileHeight;

    @track productList = [];

	@api showHeading;
	@api heading;
	@api headingSize;
	@api headingAlignment;
	@api headingColor;
	@api skuColor;
	@api comparePageUri;
    @api effectiveAccountId;

    constructor() {
        super();
        this.template.addEventListener('removeitem', this.handleRemoveItem.bind(this));
    }

    @wire(MessageContext)
	messageContext;

	subscribeToMessageChannel() {
		this.subscription = subscribe(
			this.messageContext,
			PRODUCT_COMPARE_CHANNEL,
			(message) => this.handleAddItem(message)
		);
	}

    connectedCallback() {
		this.subscribeToMessageChannel();
        this.doInit();
	}

    handleAddItem(message) {
        const productDetails = JSON.parse(message.productDetails);
        this.productList.push(productDetails);

        const payload = {
			productId: message.productId,
			isIncluded: true
		};
		publish(this.messageContext, PRODUCT_UPDATE_CHANNEL, payload);

    }

    handleRemoveItem(event) {
        const productId = event.detail;
		let index = -1;
		
        for(let i = 0; i < this.productList.length; i++) {
			if(this.productList[i].id === productId) {
				index = i;
				break;
			}
		}

		if(index >= 0) {
			this.productList.splice(index, 1);
		}

        const payload = {
			productId: productId,
			isIncluded: false
		};

		publish(this.messageContext, PRODUCT_UPDATE_CHANNEL, payload);
    }

    doInit() {
		fetchInitValues({
			communityId: this.communityId,
			effectiveAccountId: this.effectiveAccountId
		})
        .then((result) => {
            if (result) {
                this.webstoreId = result.webstoreId;
                this.effectiveAccountId = result.effectiveAccountId;
            }
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: this.labels.toast.searchErrorTitle,
                    message: error.message,
                    variant: "error"
                })
            );
        });
	}

    windowResize() {
		this.templateSize = null;

		const templateSelector = this.template.querySelector(".productsContainer");
		this.templateWidth = templateSelector.getBoundingClientRect().width;

		const tiles = this.template.querySelectorAll(".tile-column");

		for (const tile of tiles) {
			tile.classList.remove("slds-size_1-of-1");
			tile.classList.remove("slds-size_1-of-2");
			tile.classList.remove("slds-size_1-of-3");
			tile.classList.remove("slds-size_1-of-4");

			if (this.templateWidth < 480) {
				this.templateSize = "x-small";
				tile.classList.add("slds-size_1-of-1");
			}

			if (this.templateWidth >= 480 && this.templateWidth < 768) {
				this.templateSize = "small";
				tile.classList.add("slds-size_1-of-2");
			}

			if (this.templateWidth >= 768 && this.templateWidth < 1024) {
				this.templateSize = "medium";
				tile.classList.add("slds-size_1-of-3");
			}

			if (this.templateWidth >= 1024) {
				this.templateSize = "large";
				tile.classList.add("slds-size_1-of-4");
			}
		}
	}

	get imageContainerHeightStyle() {
		let tileHeight = "";

		if (this.tileHeight) {
			tileHeight = this.tileHeight.toString();
		}

		return `height:${tileHeight}px;`;
	}

	get imageMaxHeightStyle() {
		let imageMaxHeight = "";

		if (this.tileHeight) {
			imageMaxHeight = this.tileHeight.toString();
		}

		return `max-height:${imageMaxHeight}px;`;
	}

	get headingSizeClass() {
		let sizeClass = "slds-text-heading_";
		if (this.headingSize) {
			sizeClass += this.headingSize.toLowerCase();
		}
		return sizeClass;
	}

	get bodySizeClass() {
		let sizeClass = "slds-text-body_";
		if (this.bodySize) {
			sizeClass += this.bodySize.toLowerCase();
		}
		return sizeClass;
	}

	// ALIGNMENT GETTERS
	get headingAlignmentClass() {
		let alignmentClass = "slds-text-align_";
		if (this.headingAlignment) {
			alignmentClass += this.headingAlignment.toLowerCase();
		}
		return alignmentClass;
	}

	get bodyAlignmentClass() {
		let alignmentClass = "slds-text-align_";
		if (this.bodyAlignment) {
			alignmentClass += this.bodyAlignment.toLowerCase();
		}
		return alignmentClass;
	}

	// COLOR GETTERS
	get headingColorStyle() {
		return `color:${this.headingColor};`;
	}

	get skuColorStyle() {
		return `color:${this.skuColor};`;
	}

	get descriptionColorStyle() {
		return `color:${this.descriptionColor};`;
	}

	get priceColorStyle() {
		return `color:${this.priceColor};`;
	}

	get hasProducts() {
        if(this.productList && this.productList.length > 0) {
			console.log(this.productList);

            return true;
        }
        else {
            return false;
        }
    }

	handleCompareClick() {
		let paramValue = '';

		for(let i = 0; i < this.productList.length; i++) {
			if(paramValue !== "") {
				paramValue += ",";
			}
			paramValue += this.productList[i].id;
		}

		const param = '?productIds=' + paramValue;
		window.location = BASE_PATH + this.comparePageUri + param;
	}
}