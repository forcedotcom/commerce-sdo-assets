import { LightningElement, api, track, wire } from 'lwc';
import getCustomObjects from '@salesforce/apex/Sdo_scom_product_reviews.getCustomObjects';
import PRODUCT_AVG_RATING from "@salesforce/schema/Product2.Product_Average_Rating__c";
import { SessionContextAdapter } from 'commerce/contextApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const ITEMS_PER_PAGE = 5;

export default class Sdo_scom_product_reviews_preview extends LightningElement {
    customObjects;

    totalPages;

    userName;

    averageReviewRating;

    hasUserPostedReview;


    get displayedData() {
        const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return this.reviewData.slice(start, end);
    }

    @track currentDate;
    
    @track reviewData = [];

    @track currentPage = 1;

    @track stars = [
        { rating: 1, style: 'star-default' },
        { rating: 2, style: 'star-default' },
        { rating: 3, style: 'star-default' },
        { rating: 4, style: 'star-default' },
        { rating: 5, style: 'star-default' },
    ];

    @api recordId;    

    @api sortOptions = [
        { label: 'Rating', value: 'rating' },
        { label: 'Date', value: 'date' }
    ];

    @api selectedSortOption;

    @wire(SessionContextAdapter) 
    sessionContext;

    @wire(getCustomObjects)
    wiredCustomObjects({ error, data }) {
        if (data) {
            this.customObjects = data;
            this.reviewData = this.customObjects.map((customObject) => ({
                id: customObject.Id,
                data: {
                    rating: customObject.Product_Rating__c,
                    description: customObject.Product_Review_Description__c,
                    title: customObject.Product_Review__c,
                    date: customObject.Product_Review_Date__c,
                    username: customObject.Username__c
                },
                stars: this.calculateStars(customObject.Product_Rating__c),
            }));
            this.averageReviewRating = this.calculateAverageRating(this.reviewData);
            this.stars = this.calculateStars(this.averageReviewRating);
            this.totalPages = Math.ceil(this.reviewData.length / ITEMS_PER_PAGE);
            this.checkPostedReviewByUserName(this.reviewData);

        } else if (error) {
            console.error('Error fetching custom objects:', error);
        }
    }

    //Template calling functions
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage += 1;
        }
    }

    handleShowModal() {
        const modal = this.template.querySelector("c-sdo_scom_product_reviews_rating");
        modal.show();
    }

    handleSubmitModal(event) {
        const dataReceived = event.detail;
        const newData = { id: this.reviewData.length + 1, data: dataReceived, stars: [] };
        newData.stars = this.calculateStars(dataReceived.rating);

        this.reviewData = [...this.reviewData, newData];
        this.totalPages = Math.ceil(this.reviewData.length / ITEMS_PER_PAGE);

        this.averageReviewRating = this.calculateAverageRating(this.reviewData);
        this.stars = this.calculateStars(this.averageReviewRating);

        this.checkPostedReviewByUserName(this.reviewData);
        this.updateAverageRating(this.averageReviewRating);
    }

    handleSortChange(event) {
        const selectedOption = event.detail.value;
        if (selectedOption === 'rating') {
            this.reviewData = this.reviewData.sort((a, b) => b.data.rating - a.data.rating);
        }

        if (selectedOption === 'date') {
            this.reviewData = this.reviewData.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
        }
    }

    //Utility functions
    calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) {
          return 0; 
        }
        const sumOfRatings = reviews.reduce((acc, review) => acc + Number(review.data.rating), 0);
        const averageRating = sumOfRatings / reviews.length;

        return (Math.round(averageRating * 100) / 100).toFixed(1);
    }

    calculateStars(rating) {
        return this.stars.map((star) => ({
            ...star,
            style: star.rating <= rating ? 'star-filled' : 'star-default',
        }));
    }

    checkPostedReviewByUserName(reviewData) {
        if(reviewData.some(item => item.data.username === this.sessionContext.data.userName)) {
            this.hasUserPostedReview = true;
        }
    }

    updateAverageRating(avgRating) {
        const fields = {
            Id: this.recordId
        };
        fields[PRODUCT_AVG_RATING.fieldApiName] = avgRating;
        const recordInput = { fields: fields }

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Success",
                    message: "Account created",
                    variant: "success",
                }),
            );
        })
        .catch(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error creating record",
                    message: error.body.message,
                    variant: "error",
                }),
            );
        })
    }
}