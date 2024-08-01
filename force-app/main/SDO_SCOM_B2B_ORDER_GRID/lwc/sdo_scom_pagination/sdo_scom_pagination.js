import {LightningElement, api} from 'lwc';

export default class pagination extends LightningElement{
    @api numberOfPages;
    @api currentPageNumber = 1;
    
    previousButtonDisabled = false;
    nextButtonDisabled = false;

    renderedCallback(){
        if(this.currentPageNumber === 1 && this.currentPageNumber !== this.numberOfPages){
            this.previousButtonDisabled = true;
            this.nextButtonDisabled = false;
        }

        else if(this.currentPageNumber === 1 && this.currentPageNumber === this.numberOfPages){
            this.previousButtonDisabled = true;
            this.nextButtonDisabled = true;
        }

        else if(this.currentPageNumber > 1 && this.currentPageNumber !== this.numberOfPages){
            this.previousButtonDisabled = false;
            this.nextButtonDisabled = false;
        }

        else if(this.currentPageNumber > 1 && this.currentPageNumber === this.numberOfPages){
            this.previousButtonDisabled = false;
            this.nextButtonDisabled = true;
        }

        // else{
        //     this.previousButtonDisabled = true;
        //     this.nextButtonDisabled = true;
        // }
    }

    previousPage(){
        let detail = {};
        detail.pageDirection = 'PREVIOUS';
        this.sendPaginationEvent(detail);
    }

    nextPage(){
        let detail = {};
        detail.pageDirection = 'NEXT';
        this.sendPaginationEvent(detail);
    }

    sendPaginationEvent(detail){
        const paginationEvent = new CustomEvent('paginationevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(paginationEvent);
    }
}