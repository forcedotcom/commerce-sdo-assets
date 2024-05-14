import { LightningElement, api, track } from 'lwc';

export default class Sdo_scom_product_reviews_avg_rating extends LightningElement {
    @track starsArray = [
        { rating: 1, style: 'star-default' },
        { rating: 2, style: 'star-default' },
        { rating: 3, style: 'star-default' },
        { rating: 4, style: 'star-default' },
        { rating: 5, style: 'star-default' },
    ];

    @api averageReviewRating;

    get stars() {
        return this.starsArray.map((star) => ({
            ...star,
            style: star.rating <= this.averageReviewRating ? 'star-filled' : 'star-default',
        }));
    }
}