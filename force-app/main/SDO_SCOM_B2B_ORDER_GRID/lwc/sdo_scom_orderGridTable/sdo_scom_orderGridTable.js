
import { LightningElement, api, track } from 'lwc';
import BASE_PATH from "@salesforce/community/basePath";

export default class SdoScomOrderGridTable extends LightningElement {
    @api orderProducts;
    @api currencyCode;
    @track totalProductQuantity = 0;
    @track totalProductQuantity1 = 0;
    @track tableRows = [];
    @track productQuantities1 = [];
    @track productQuantities = [];

    @api
    get sortObject() {
        return this._sortObject;
    }

    //Setter for sortObject that calls the sortTableRows() method 
    set sortObject(value) {
        this._sortObject = value;
        if (this._sortObject) {
            this.sortTableRows();
        }
    }
    _sortObject;

    @api
    get orderYear() {
        return this._orderYear;
    }

    //Setter for orderYear that calls the filterOrderProductsByYear() method 
    set orderYear(value) {
        this._orderYear = value;
        this.filterOrderProductsByYear();
    }
    _orderYear;

    @api
    get searchText() {
        return this._searchText;
    }

    @api cartURL;
    @api cartItems;


    get communityName() {
        let path = BASE_PATH;
        let pos = BASE_PATH.lastIndexOf("/s");
        if (pos >= 0) {
            path = BASE_PATH.substring(0, pos);
        }

        return path;
    }

    showTable = false;

    //Setter for searchText that calls the filterOrderProductsByNameSKU() method
    //if there is search text or shows all of the OPs again if there isn't any search text.
    set searchText(value) {
        this._searchText = value;
        if (this._searchText.length > 0) {
            this.filterOrderProductsByNameSKU();
        }
        else {
            this.filteredOrderProducts = this.filteredOrderProductsCopy;
            this.tableRows = [];
            this.productArray = [];
            this._sortObject = null;
            this.createTable();
            this.showNoOrdersMessage = false;
            this.showTable = true;
        }
    }
    _searchText;

    @api
    get resetQuantities() {
        return this._resetQuantities;
    }

    set resetQuantities(value) {
        this._resetQuantities = value;
        this.totalProductQuantity = 0;
        this.productQuantities = [];
    }
    _resetQuantities

    filteredOrderProducts = [];

    //Needed for searching to store the original order product list without filters
    filteredOrderProductsCopy = [];

    tableRowOne = {};
    productArray = [];
    showNoOrdersMessage = false;
    showNoMatchingProductsMessage = false;
    numberOfPages = 1;
    pageNumber = 1;

    //Filters the order products by year
    filterOrderProductsByYear() {
        if (!this._orderYear) {
            const today = new Date();
            this._orderYear = today.getFullYear();
        }

        this.filteredOrderProducts = [];
        this.orderProducts.forEach((op) => {
            const orderedDateRaw = new Date(op.orderedDate);
            const orderedDate = new Date(orderedDateRaw.getTime() + orderedDateRaw.getTimezoneOffset() * 60000);
            if (orderedDate.getFullYear() === this._orderYear) {
                this.filteredOrderProducts.push(op);
            }
        })

        if (this.filteredOrderProducts.length > 0) {
            this.filteredOrderProductsCopy = this.filteredOrderProducts;
            this.tableRows = [];
            this.productArray = [];
            this._sortObject = null;
            this.createTable();
            this.showNoOrdersMessage = false;
            this.showTable = true;
        }
        else {
            this.showTable = false;
            this.showNoOrdersMessage = true;
        }

        this.sendShowTableEvent();
    }

    //Filters the order products by name or SKU
    filterOrderProductsByNameSKU() {
        let filteredOrderProducts = [];
        this.filteredOrderProductsCopy.forEach((op) => {
            if (op.productName.toLowerCase().includes(this._searchText.toLowerCase())
                || op.productSKU.toLowerCase().includes(this._searchText.toLowerCase())) {

                filteredOrderProducts.push(op);
            }
        })

        this.filteredOrderProducts = filteredOrderProducts;

        if (this.filteredOrderProducts.length > 0) {
            this.tableRows = [];
            this.productArray = [];
            this._sortObject = null;
            this.createTable();
            this.showNoMatchingProductsMessage = false;
            this.showTable = true;
        }
        else {
            this.showTable = false;
            this.showNoMatchingProductsMessage = true;
        }
    }

    //Parses the order items and creates the table
    createTable() {
        this.showNoMatchingProductsMessage = false;
        this.parseOrderItems();
        this.createTableRows();

    }

    calculateQuantity() {
        this.totalProductQuantity1 = 0;
        for (let i = 0; i < this.productArray.length; i++) {
            const productObject = this.productArray[i];
            this.totalProductQuantity1 += productObject.quantityLast;     
        }
    }

    //Creates the date column headers and product array needed for the table
    parseOrderItems() {
        this.createProductArray(this.filteredOrderProducts);
        this.numberOfPages = Math.ceil(this.filteredOrderProducts.length / 5);
    }


    createProductArray(filteredOrderProducts) {
        const offset = (this.pageNumber * 5) - 5;
        const orderArrayEndpoint = ((this.pageNumber * 5 < filteredOrderProducts.length) ? this.pageNumber * 5 : filteredOrderProducts.length);
        for (let a = offset; a < orderArrayEndpoint; a++) {
            const op = filteredOrderProducts[a];
            let productImageURL = '';
            if (op.productImageURL) {
                // format image url
                let url = op.productImageURL;
                if (url.indexOf("/cms/delivery/media") >= 0) {
                    const searchRegExp = /\/cms\/delivery\/media/g;
                    url = url.replace(searchRegExp, this.communityName + "/cms/delivery/media");
                }

                if (url.indexOf("/cms/media") >= 0) {
                    const searchRegExp = /\/cms\/media/g;

                    url = url.replace(searchRegExp, this.communityName + "/cms/delivery/media");
                }

                productImageURL = url;
            }
            let productDetailURL = BASE_PATH + "/product/" + op.productId;
            const productObject = {
                Id: op.productId,
                SKU: op.productSKU,
                name: op.productName,
                productImageURL: productImageURL,
                quantityLast: op.quantity,
                productDetailURL: productDetailURL,
                productUnitPrice: op.unitPrice,
                productSubTotal: '',
                productCurrencyIsoCode: op.currencyIsoCode,
                attributeMap: op.attributeMap,
                attributeSetInfo: op.attributeSetInfo,
                attributeDeveloperName: op.attributeDeveloperName
            }

            let productFound = false;
            for (let b = 0; b < this.productArray.length; b++) {
                if (this.productArray[b].Id === productObject.Id) {
                    productFound = true;
                    break;
                }
            }
            if (!productFound) {
                const productQuantity = {
                    productId: productObject.Id,
                    quantity: productObject.quantityLast
                }
                this.productQuantities1[a] = productQuantity;
                this.productArray.push(productObject);
            }
        }
        this.calculateQuantity();

        console.log('productQuantities1', this.productQuantities1);
    }

    //Creates the table row objects needed for the table
    createTableRows() {
        for (let i = 0; i < this.productArray.length; i++) {
            const productObject = this.productArray[i];
            for (let c = 0; c < this.filteredOrderProducts.length; c++) {
                if (this.filteredOrderProducts[c].productId === productObject.Id) {
                    productObject.quantityLast = this.filteredOrderProducts[c].quantity;
                    productObject.productSubTotal = this.filteredOrderProducts[c].unitPrice * productObject.quantityLast;
                   // console.log('total product quantity : ', this.totalProductQuantity1);
                    break;
                }
            }
            this.tableRows.push(productObject);
        }
        this.tableRowOne = this.tableRows[0];
    }

    //Main method to sort the table rows. Calls either the sortByFieldAscending() or sortByFieldDescending() method
    sortTableRows() {
        if (this._sortObject.sortDirection === 'ASC') {
            this.sortByFieldAscending(this._sortObject.sortField);
            return;
        }

        this.sortByFieldDescending(this._sortObject.sortField);
    }

    //Sorts the table rows in ascending order by product name or SKU
    sortByFieldAscending(fieldName) {
        function compare(a, b) {
            const valueA = a[fieldName];
            const valueB = b[fieldName];

            let comparison = 0;
            if (valueA != null && valueB != null) {
                if (valueA > valueB) {
                    comparison = 1;
                }
                else if (valueA < valueB) {
                    comparison = -1;
                }
            }
            else if (valueA == null && valueB != null) {
                comparison = 1;
            }
            else if (valueA != null && valueB == null) {
                comparison = -1;
            }

            return comparison;
        }

        this.tableRows.sort(compare);

        //Needed to refresh the UI due to the reactivity of LWCs
        this.tableRows = [...this.tableRows];
    }

    //Sorts the table rows in descending order by product name or SKU
    sortByFieldDescending(fieldName) {
        function compare(a, b) {
            const valueA = a[fieldName];
            const valueB = b[fieldName];

            let comparison = 0;
            if (valueA != null && valueB != null) {
                if (valueB > valueA) {
                    comparison = 1;
                }
                else if (valueB < valueA) {
                    comparison = -1;
                }
            }
            else if (valueA == null && valueB != null) {
                comparison = 1;
            }
            else if (valueA != null && valueB == null) {
                comparison = -1;
            }

            return comparison;
        }

        this.tableRows.sort(compare);

        //Needed to refresh the UI due to the reactivity of LWCs
        this.tableRows = [...this.tableRows];
    }

    //Uses the month number to return a abbreaviated month string
    getMonthString(monthNumber) {
        if (monthNumber === 0) {
            return 'Jan.';
        }
        else if (monthNumber === 1) {
            return 'Feb.';
        }
        else if (monthNumber === 2) {
            return 'Mar.';
        }
        else if (monthNumber === 3) {
            return 'Apr.';
        }
        else if (monthNumber === 4) {
            return 'May';
        }
        else if (monthNumber === 5) {
            return 'June';
        }
        else if (monthNumber === 6) {
            return 'July';
        }
        else if (monthNumber === 7) {
            return 'Aug.';
        }
        else if (monthNumber === 8) {
            return 'Sept.';
        }
        else if (monthNumber === 9) {
            return 'Oct.';
        }
        else if (monthNumber === 10) {
            return 'Nov.';
        }
        else if (monthNumber === 11) {
            return 'Dec.';
        } 
        return null;
    }


    //Handler to update productQuantities with the new product total from the quantity column
    changeProductQuantityHandler(event) {
        let totalProductQuantity = 0;
        for (let c = 0; c < this.tableRows.length; c++) {
            const productObject = this.tableRows[c];
            let unitPrice = productObject.productUnitPrice;

            if (productObject.Id === event.detail.productId) {
                if (event.detail.quantity) {
                    totalProductQuantity = totalProductQuantity + event.detail.quantity;
                    productObject.productSubTotal = unitPrice * event.detail.quantity;
                    productObject.quantityLast = event.detail.quantity;

            const productQuantity = {
                productId: event.detail.productId,
                quantity: event.detail.quantity
            }
            this.productQuantities1[c] = productQuantity;
                }
            }
            else {
                const productQuantity = {
                    productId: productObject.Id,
                    quantity: productObject.quantityLast
                }
                this.productQuantities1[c] = productQuantity;                    
                totalProductQuantity = totalProductQuantity + productObject.quantityLast;
            }
            this.tableRows[c] = productObject;
        }
        this.totalProductQuantity1 = totalProductQuantity;
    }

    //Sends the show table event to render the table along with the search bar, sort and reset buttons
    sendShowTableEvent() {
        const detail = {
            showTable: this.showTable
        };

        const showTableEvent = new CustomEvent('showtableevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(showTableEvent);
    }

    //Handler for the View Cart button that takes the user to the cart detail page
    viewCart() {
        window.open(BASE_PATH + '/' + this.cartURL, '_self');
    }

    paginationEventHandler(event) {
        this.pageNumber = (event.detail.pageDirection === 'NEXT' ? this.pageNumber + 1 : this.pageNumber - 1);
        this.filteredOrderProductsCopy = this.filteredOrderProducts;
        this.tableRows = [];
        this.productArray = [];
        this._sortObject = null;
        this.createTable();
        this.showNoOrdersMessage = false;
        this.showTable = true;
    }

    //Handler for the Add to Cart button that sends an event to orderGridMain
    //to call the apex method to add the products to the cart
    addToCart() {
        const detail = {
            cartProducts: this.productQuantities1
        };

        const addToCartEvent = new CustomEvent('addtocartevent', {
            detail: detail,
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(addToCartEvent);
    }
}