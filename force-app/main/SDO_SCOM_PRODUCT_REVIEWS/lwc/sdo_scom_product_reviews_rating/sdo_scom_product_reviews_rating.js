import { LightningElement, api, track, wire } from 'lwc';
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { SessionContextAdapter } from 'commerce/contextApi';

import CUSTOMER_REVIEWS_OBJECT from "@salesforce/schema/SDO_SCOM_Customer_Review__c";
import RATING_FIELD from "@salesforce/schema/SDO_SCOM_Customer_Review__c.Product_Rating__c";
import REVIEW_TITLE_FIELD from "@salesforce/schema/SDO_SCOM_Customer_Review__c.Product_Review_Title__c";
import REVIEW_DESCRIPTION_FIELD from "@salesforce/schema/SDO_SCOM_Customer_Review__c.Product_Review_Description__c";
import PRODUCT_ID_FIELD from "@salesforce/schema/SDO_SCOM_Customer_Review__c.ProductId__c";
import PRODUCT_REVIEW_DATE_FIELD from "@salesforce/schema/SDO_SCOM_Customer_Review__c.Product_Review_Date__c";
import USERNAME_FIELD from "@salesforce/schema/SDO_SCOM_Customer_Review__c.Username__c";

export default class Sdo_scom_product_reviews_rating extends LightningElement {
    rating = 0;

    title;

    description;

    reviewId;

    userName;

    stars;

    currentDate;
    
    @track showPopUp = false;

    @api recordId;

    @api show() {
        this.showPopUp = true;
    }

    @wire(SessionContextAdapter) 
    sessionContext;

    renderedCallback() {
        this.stars = this.template.querySelectorAll(".product-rating span");
        this.stars.forEach(star => {
            star.addEventListener('click', () => {
                star.setAttribute('data-clicked', 'true');
                this.rating = star.dataset.rating;
            });
        });
    }

    handleDialogClose() {
        this.showPopUp = false;
    }

    handleTitleChange = (event) => {
        this.title = event.target.value;
    }

    handleDescriptionChange = (event) => {
        this.description = event.target.value;
    }

    handleSubmitReview() {
        const fields = {};
        this.currentDate = new Date();
        this.userName = this.sessionContext.data.userName ? this.sessionContext.data.userName : 'N/A';

        fields[RATING_FIELD.fieldApiName] = this.rating;
        fields[REVIEW_TITLE_FIELD.fieldApiName] = this.title;
        fields[REVIEW_DESCRIPTION_FIELD.fieldApiName] = this.description;
        fields[PRODUCT_ID_FIELD.fieldApiName] = this.recordId;
        fields[PRODUCT_REVIEW_DATE_FIELD.fieldApiName] = this.currentDate;
        fields[USERNAME_FIELD.fieldApiName] = this.userName;

        const recordInput = { apiName: CUSTOMER_REVIEWS_OBJECT.objectApiName, fields };
        createRecord(recordInput)
        .then((review) => {
            this.reviewId = review.id;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Success",
                    message: "Account created",
                    variant: "success",
                }),
            );
        })
        .catch((error) => {
            console.log("error", error)
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error creating record",
                    message: error.body.message,
                    variant: "error",
                }),
            );
        });

        const event = new CustomEvent('submitmodal', {
            detail: {
                rating: this.rating,
                title: this.title,
                description: this.description,
                productid: this.recordId,
                date: this.currentDate,
                username: this.userName
            }
        })

        this.dispatchEvent(event);
        this.handleDialogClose();
    }
}