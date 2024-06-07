import {LightningElement, api} from 'lwc';

export default class SdoScomOrderGridHeader extends LightningElement{
    @api showTable = false;
    
    yearValues = [];
    nameSortIcon = 'utility:sort';
    skuSortIcon = 'utility:sort';

    //Creates the year array when the component loads
    connectedCallback(){
        this.createYearArray();    
    }

    //Method to create an array of years going back 5 years
    createYearArray(){
        const today = new Date();
        const year = today.getFullYear();
        this.yearValues.push(year);
        this.yearValues.push(year - 1);
        this.yearValues.push(year - 2);
        this.yearValues.push(year - 3);
        this.yearValues.push(year - 4);
    }

    //Change handler for the year dropdown that sends the year value to orderGridMain
    selectYear(event){
        const detail = {
            orderYear: parseInt(event.target.value, 10)
        };

        const selectYearEvent = new CustomEvent('selectyearevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(selectYearEvent);
    }

    //Change handler for the search input box
    updateSearchText(event){
        const searchText = event.target.value;
        this.sendSearchEvent(searchText);
    }

    //Sends the search text to orderGridMain
    sendSearchEvent(searchText){
        const detail = {
            searchText: searchText
        };

        const searchEvent = new CustomEvent('searchevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(searchEvent);
    }

    //Sort by name button handler
    sortByProductName(){
        let sortDirection = '';
        if(this.nameSortIcon === 'utility:sort' || this.nameSortIcon === 'utility:arrowdown'){
            this.nameSortIcon = 'utility:arrowup';
            sortDirection = 'ASC';
        }
        else{
            this.nameSortIcon = 'utility:arrowdown';
            sortDirection = 'DESC';
        }

        this.skuSortIcon = 'utility:sort';
        this.sendSortEvent('name', sortDirection);
    }

    //Sort by SKU button handler
    sortByProductSKU(){
        let sortDirection = '';
        if(this.skuSortIcon === 'utility:sort' || this.skuSortIcon === 'utility:arrowdown'){
            this.skuSortIcon = 'utility:arrowup';
            sortDirection = 'ASC';
        }
        else{
            this.skuSortIcon = 'utility:arrowdown';
            sortDirection = 'DESC';
        }

        this.nameSortIcon = 'utility:sort';
        this.sendSortEvent('SKU', sortDirection);
    }

    //Sends a sort object to orderGridMain
    sendSortEvent(sortField, sortDirection){
        const detail = {
            sortField: sortField,
            sortDirection: sortDirection
        };

        const sortEvent = new CustomEvent('sortevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(sortEvent);
    }

    //Reset button handler that sends a reset event to orderGridMain
    resetQuantities(){
        const detail = {
            randomNumber: Math.random()
        };

        const resetQuantitiesEvent = new CustomEvent('resetquantitiesevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(resetQuantitiesEvent);
    }
}