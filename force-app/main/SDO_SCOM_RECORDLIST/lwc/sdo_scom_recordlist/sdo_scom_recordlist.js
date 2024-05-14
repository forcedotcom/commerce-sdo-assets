import { LightningElement,api,track,wire } from 'lwc';
import getFieldDetails from '@salesforce/apex/Sdo_scom_recordlist_controller.getFieldDetails';
import getTotalRecords from '@salesforce/apex/Sdo_scom_recordlist_controller.getTotalRecords';
import getRecords from '@salesforce/apex/Sdo_scom_recordlist_controller.getRecords';
import {
    _servercall,
    _toastcall,
    _reduceErrors
  } from "./sdo_scom_recordlist_helper";
import { deleteRecord } from "lightning/uiRecordApi";
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getApiNameOfChild from '@salesforce/apex/Sdo_scom_recordlist_controller.getApiNameOfChild';
import retrieveIconForObject from '@salesforce/apex/Sdo_scom_recordlist_controller.retrieveIconForObject';
import LightningConfirm from "lightning/confirm";
import ToastContainer from 'lightning/toastContainer';
import { SessionContextAdapter } from 'commerce/contextApi';
import { getListInfoByName } from "lightning/uiListsApi";

const editActions = [
    { label: "Edit", name: "edit" },
  ];

const deleteActions = [
    { label: "Delete", name: "delete" },
  ];

const bothActions = [
    { label: "Edit", name: "edit" },
    { label: "Delete", name: "delete" },
];

export default class SdoScomRecordlist extends LightningElement {
    @api sObjectName;
    @api queryType;
    @api listViewName;
    @api columns;
    @api filters;
    //@api paginationEnabled = false;
    @api paginationRecordsPerStep = 10;
    @api showRowNumberColumn = false;
    @api sortBy;
    @api sortDirection = 'asc';
    //@api hideSearchBar = false;
    @api recordId;
    //@api showCheckboxes;
    @api objectlabel;
    //@api searchText;
    @api newbutton=false;
    @api editbutton = false;
    @api deletebutton = false;
    @api isPreviewMode = false;
    //@api showHistory = false;
    @api tableHeight;
    @api viewMode;
    @track isShowModal = false;
    @track isEditClicked = false;
    @track isAddClicked = false;
    tableElement;
    _wiredResult;

     //Properties for Message / Alert // Add comment 
    @track hasMessage = false;
    @track pageMessageParentDivClass = 'slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_warning';
    @track pageMessageChildDivClass = 'slds-icon_container slds-icon-utility-warning slds-m-right_x-small'
    @track messageTitle = 'No Records';
    @track messageSummary = 'No records found.';
    @track messageIcon = 'utility:warning';
    @track isLoaded=false;
    @track totalRecordCount;
    @track records =[];
    @track error;
    @track queryOffset=0;
    @track headers=[];
    @track cssicon;
    @track urlicon;
    @track apiNameOfObject;
    @track relationShipName;

    //properties required to credit/edit object
    @track firstColumn;
    @track recordFormLabel;
    @track editRecordId;
    @track editObjectName;
    toastContainerObj;
    toastContainerObj = ToastContainer.instance();

    connectedCallback(){
        if (this.queryType.localeCompare('List View') != 0) {
            this.methodretrieveIconForObject();
            this.methodgetApiName();
            this.getFieldDetailsMethod();
            this.methodgetTotalRecords();
            this.loadData();
        }
        this.toastContainerObj.toastPosition = 'top-center';
    }

    renderedCallback() {
        this.setHeight();
    }

    //function which sets the height of the table
    setHeight () {
        //set the table height
        if (this.tableHeight) {
            this.template.querySelector('.recordList').style['height'] = this.tableHeight;
        } else {
            //if height is not specified give the default value
            this.template.querySelector('.recordList').style['height'] = "18em";
        }
    }

    //wire adapter which gets metadata of the listView Name.
    @wire(getListInfoByName, { objectApiName: '$sObjectName', listViewApiName: '$listViewName' })
    getListViewNameRecords({error, data}){
        if(data){
            
            //First set the label
            this.objectlabel = data["label"]; 
            
            //get all the displayColumns
            let listViewColumns = [];
            for (let displayColumn in data["displayColumns"]) {
                let fieldApiName = data["displayColumns"][displayColumn]["fieldApiName"];
                listViewColumns.push (fieldApiName);
            }

            let filterLogicString = data["filterLogicString"];
            let finalfilterString = [];
            let filter =  '';
            //now get all the filter by information
            for (let filterInfo in data["filteredByInfo"]) {
                // add the fieldAPIName
                let filterFieldName =  data["filteredByInfo"][filterInfo]["fieldApiName"];
                
                //add the opeartor
                let filterOperator =  data["filteredByInfo"][filterInfo]["operator"];
                
                //add operator value
                let filterOperands =  data["filteredByInfo"][filterInfo]["operandLabels"];
                for (let filterOperand in filterOperands) {
                    let eachFilterOperand = data["filteredByInfo"][filterInfo]["operandLabels"][filterOperand];
                    let filterString = this.getFilterLogicString (filterFieldName, filterOperator, eachFilterOperand);
                    filter = filter + filterString;
                    if (filterOperand < filterOperands.length - 1) {
                        filter += ' AND ';
                    }
                }

                //If it is null then it is AND condition
                if (filterLogicString) {
                    filterLogicString = filterLogicString.replace(+filterInfo + 1,filter);
                } else {
                    finalfilterString.push (filter);
                }
                //reset the filter
                filter = '';
            }

            for (let orderInfo in data["orderedByInfo"]) {
                let orderByFieldName = data["orderedByInfo"][orderInfo]["fieldApiName"];
                let isAscending = data["orderedByInfo"][orderInfo]["isAscending"];

                //As of now we only support sigle Field order by so exit
                this.sortBy = orderByFieldName;
                this.sortDirection = isAscending ? 'asc' : 'desc';
                break;
            }

            if (filterLogicString) {
                this.filters = filterLogicString;
            } else {
                this.filters = finalfilterString.join(" AND ");
            }
            this.columns = listViewColumns.join(", ");
            this.queryOffset = 0;

            
            //After getting all the metadata now get the records
            this.getFieldDetailsMethod ();
            this.methodgetTotalRecords();
            this.loadData ();

        }else if(error){
            this.handleError (error);
        }
    }

     getFilterLogicString (filterFieldName,opeartor, operand) {
        switch (opeartor) {
            case "Equals" :
                return filterFieldName + ' = '+ '\''+ operand + '\'';
                break;
            case "NotEqual" :
                return filterFieldName + ' != '+ '\''+ operand + '\'';
                break; 
            case "Contains" :
                return filterFieldName + ' LIKE ' + '\'%' + operand + '%' + '\'';
                break;  
            case "NotContain" :
                return '(NOT (' + filterFieldName + ' LIKE ' + '\'%' + operand + '%' + '\'))';
                break; 
            case "Includes" :
                return filterFieldName + ' INCLUDES ' + '(' + '\ '+ operand + '\')';
                break; 
            case "Excludes" :
                return filterFieldName + ' EXCLUDES ' + '(' + '\ '+ operand + '\')';;
                break;     
            case "StartsWith" :
                return filterFieldName + ' LIKE ' + '\'' + operand + '%' + '\'';;
                break;       
            case "LessThan":
                return filterFieldName + ' < '+ '\ '+ operand + '\'';
                break; 
            case "LessOrEqual":
                return filterFieldName + ' <= '+ '\ '+ operand + '\'';
                break; 
            case "GreaterThan":
                return filterFieldName +' > '+ '\ '+ operand + '\'';
                break; 
            case "GreaterOrEqual":
                return filterFieldName + ' >= '+ '\ '+ operand + '\'';
                break;  
            default: 
                break;       
        }
    }

    //function which gets field details of the object
    getFieldDetailsMethod(){
        const params={
            objectName:this.sObjectName,
            queryType : this.queryType,
            fieldsToQuery:this.columns,
            filters:this.filters,
            recordId:this.recordId
        };
        _servercall(
            getFieldDetails,
            params,
            this.handleSuccess.bind(this),
            this.handleError.bind(this)
        );
    }

    //success handler for getFieldDetailsMethod
    handleSuccess(data) {
        data = data.fieldNameToDetailsMap;
        let columns = [];
			if (data) {
                let index = 0;
                let length = Object.keys(data).length;;
				for (let fieldName in data) {
                    
					let fieldLabel = data[fieldName]["label"];
					let fieldDisplaytype = data[fieldName]["displaytype"];
                    let fieldApiName = data[fieldName]["apiname"];
                    
                    //fieldDisplaytype is reference it is not supported in datatable so show it as text
                    if (fieldDisplaytype === 'reference') {
                        fieldDisplaytype = 'text';
                    }
                    if (index == length - 1) {
                        //for the first field insert an link
                        columns.push({
                            type: 'button',
                            label: fieldLabel,
                            fieldName: fieldApiName,
                            sortable: true,
                            sortDirection: (this.sortBy == fieldApiName && this.sortDirection=='asc') ? true :false,
                            sortedBy:this.sortBy == fieldApiName ? true : false,
                            typeAttributes: { 
                                label: { 
                                    fieldName: fieldApiName 
                                },
                                variant: 'base'
                            }
                        });
                    }
                    else {
                        if (fieldDisplaytype === 'currency') {
                            columns.push({
                                type: fieldDisplaytype,
                                label: fieldLabel,
                                fieldName: fieldApiName,
                                sortable: true,
                                sortDirection: (this.sortBy == fieldApiName && this.sortDirection=='asc') ? true :false,
                                sortedBy:this.sortBy == fieldApiName ? true : false ,
                                typeAttributes: {
                                    currencyCode: {
                                      fieldName: 'CurrencyIsoCode'
                                    },
                                    currencyDisplayAs: 'code',
                                    step: '0.01',
                                    maximumFractionDigits: '2'
                                  },
                                cellAttributes: {
                                    alignment: 'left'
                                  },  
                            });
                        } else {
                            columns.push({
                                type: fieldDisplaytype,
                                label: fieldLabel,
                                fieldName: fieldApiName,
                                sortable: true,
                                sortDirection: (this.sortBy == fieldApiName && this.sortDirection=='asc') ? true :false,
                                sortedBy:this.sortBy == fieldApiName ? true : false
                            });
                        }
                    }
                    index = index + 1;
                }
                //reverse the columns to preserve the order
                columns = columns.reverse()

                if (this.editbutton && this.deletebutton) {
                    columns.push({
                        type: "action",
                        typeAttributes: { rowActions: bothActions,menuAlignment: 'right' },
                    });

                }
                else if (this.editbutton) {
                    columns.push({
                        type: "action",
                        typeAttributes: { rowActions: editActions,menuAlignment: 'right' },
                    });
                }
                else if (this.deletebutton) {
                    columns.push({
                        type: "action",
                        typeAttributes: { rowActions: deleteActions,menuAlignment: 'right' },
                    });
                }
                this.headers=columns;
            }
    }

    //function to get the total records.
    methodgetTotalRecords(){
        const params=
        {
            objectName:this.sObjectName,
            filters : this.filters,
            recordId:this.recordId,
            queryType: this.queryType
        };
        _servercall(
            getTotalRecords,
            params,
            this.handleSuccesstotalrecords.bind(this),
            this.handleError.bind(this)
        );
    }

    //success handler for methodgetTotalRecords
    handleSuccesstotalrecords(data){
        this.totalRecordCount=data.totalrecords;
    }

    methodgetApiName(){
        const params={
            recordId:this.recordId,
            objectName:this.sObjectName,
        };
        _servercall(
            getApiNameOfChild,
            params,
            this.handleSuccessobjectname.bind(this),
            this.handleError.bind(this)
        );
    }

    handleSuccessobjectname(data){
        this.apiNameOfObject=data.maptoReturn.Apiname;
        this.relationShipName=data.maptoReturn.fieldname;
    }

    methodretrieveIconForObject(){
        const params={
            objectname:this.sObjectName,
            recordId:this.recordId
        };
        _servercall(
            retrieveIconForObject,
            params,
            this.handleSuccessicon.bind(this),
            this.handleError.bind(this)
        );
    }

    handleSuccessicon(data) {
        this.cssicon=data.iconPropertyMap.iconStyle;
        this.urlicon=data.iconPropertyMap.iconURL;
    }
    
    //function to get records Data
    loadData(){
        this.isLoaded=false;
        let flatData;
        const params={
            objectName : this.sObjectName, 
            queryType  : this.queryType,
            listViewName : this.listViewName,
            fieldsToQuery : this.columns, 
            filters : this.filters,
            sortField:this.sortBy,
            sortDirect: this.sortDirection,
            recordId:this.recordId,
            offset : this.queryOffset,
            limitrec:this.paginationRecordsPerStep
        };
        return  getRecords(params)
        .then(result => {
            if (result.message == 'Success') {
                if (result.payload != undefined && result.message == 'Success') {
                    let payload = JSON.parse(result.payload);
                    if (payload.lstDataTableRecs != undefined) {
                        result = payload.lstDataTableRecs.lstDataTableData;
                        flatData = JSON.parse(JSON.stringify(result));
                        console.log("Data " + JSON.stringify(flatData));
                        let updatedRecords = [...this.records, ...flatData];
                        this.records = updatedRecords;
                        this.isLoaded=true;
                        this.hasMessage=false;
                        let listOfObjects=[];
                        listOfObjects=this.records;
                        for(let i = 0; i < listOfObjects.length;i++){
                            let obj = listOfObjects[i];
                            for(let prop in obj){  
                                if(!obj.hasOwnProperty(prop)) continue;
                                if(typeof obj[prop] == 'object' && typeof obj[prop] != 'Array'){
                                    obj = Object.assign(obj, this.flattenObject(prop,obj[prop]));
                                }
                                else if(typeof obj[prop] == 'Array'){
                                    for(let j = 0; j < obj[prop].length; j++){
                                        obj[prop+'_'+j] = Object.assign(obj,this.flattenObject(prop,obj[prop]));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        .catch(error => {
           this.handleError(error);
        });
    }

    /**
     * Below are some helper (Handler) functions which helps to operate some functionality of lightning datatable.
     * Like sorting, handling row actions like Edit, Delete and Add.
     */

    flattenObject(propName,obj){
        let flatObject = [];
        for(let prop in obj){
            //if this property is an object, we need to flatten again
            let propIsNumber = isNaN(propName);
            let preAppend = propIsNumber ? propName+'_' : '';
            if(typeof obj[prop] == 'object'){
                flatObject[preAppend+prop] = Object.assign(flatObject, this.flattenObject(preAppend+prop,obj[prop]) );
            }    
            else{
                flatObject[preAppend+prop] = obj[prop];
            }
        }
        return flatObject;
    }

    loadMoreData(event) {
        this.tableElement = event.target;
        this.tableElement.isLoading = true;
        this.isLoaded=false;
        if(this.records.length > this.queryOffset){
            this.queryOffset = this.queryOffset + this.paginationRecordsPerStep;
            this.loadData()
                .then(()=> {
                    this.tableElement.isLoading = false;
                });
        } else {
            this.tableElement.isLoading = false;
            this.isLoaded=true;
            this.tableElement.enableInfiniteLoading = false;
        }
        this.isLoaded=true;
    }

    //The below commented code is to handle search functionality. 

    // handleSearchText(event) {
    //     this.isLoaded=false;
    //     this.searchText = event.detail.searchText;
    //     if(this.searchText.length>2){
    //         this.methodsearchrecords();
    //     }else{
    //         this.queryOffset=0;
    //         this.paginationRecordsPerStep=50000;
    //         this.records = [];
    //         this.loadData();
    //         this.methodgetTotalRecords();
    //     }
    //     this.isLoaded=true;
    // }

    // methodsearchrecords(){
    //     this.isLoaded=false;
    //     var params=
    //     { 
    //         objectName : this.sObjectName, 
    //         queryType: this.queryType ,
    //         fieldsToQuery : this.columns, 
    //         filters : this.filters,
    //         sortField:this.sortBy,
    //         sortDirect: this.sortDirection,
    //         recordId:this.recordId,
    //         offset : 0,
    //         limitrec:50000,
    //         searchSTring:this.searchText
    //     };
    //     utility._servercall(
    //         searchrecords,
    //         params,
    //         this.handleSuccesssearch.bind(this),
    //         this.handleError.bind(this)
    //     );
    //     this.isLoaded=true;
    // }

    // handleSuccesssearch(data){
    //     this.records = data.maptoReturn.records;
    //     this.totalRecordCount=data.maptoReturn.total;
    //     var listOfObjects=[];
    //     listOfObjects=this.records;
    //     for(var i = 0; i < listOfObjects.length;i++){
    //         var obj = listOfObjects[i];
    //         for(var prop in obj){      
    //             if(!obj.hasOwnProperty(prop)) continue;
    //             if(typeof obj[prop] == 'object' && typeof obj[prop] != 'Array'){
    //                 obj = Object.assign(obj, this.flattenObject(prop,obj[prop]));
    //             }
    //             else if(typeof obj[prop] == 'Array'){
    //                 for(var j = 0; j < obj[prop].length; j++){
    //                     obj[prop+'_'+j] = Object.assign(obj,this.flattenObject(prop,obj[prop]));
    //                 }
    //             }
    //         }
    //     }
    // }

    getError(error){
        if (error) {
            this.hasMessage = true;
            this.preparePageMessage(
                'slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_error',
                'slds-icon_container slds-icon-utility-error slds-m-right_x-small',
                'Error',
                JSON.stringify(error),
                'utility:error'
            );
            // display server exception in toast msg 
            this.isLoaded = true;
        }
    }

    @wire(SessionContextAdapter)
    updateSessionContext({ data }) {
        this.isPreviewMode = data?.isPreview === true;
    }

    handleError(data) {
        if (!this.isPreviewMode) {
            console.log ("SDO Record List Caught Error : " + JSON.stringify(data));
            this.getError(data);
            //Do not want show toast message
            //this.dispatchEvent(_toastcall('Something went wrong',_reduceErrors(data),'error','pester'));
            this.isLoaded = true;  
        }
    }

    preparePageMessage(pageMessageParentDivClass, pageMessageChildDivClass, messageTitle, messageSummary, messageIcon) {
        this.pageMessageParentDivClass = pageMessageParentDivClass;
        this.pageMessageChildDivClass = pageMessageChildDivClass;
        this.messageTitle = messageTitle;
        this.messageSummary = messageSummary;
        this.messageIcon = messageIcon;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === undefined) {
            //if the action is undefined then it is show details event
            this.showDetails (row);
        } else {
            switch (actionName) {
            case "edit":
                this.editRecord(row);
                break;
            case "delete":
                this.deleteRow(row);
                break;
            default:
                break;
            }
        }
    }

    showDetails(row) {
        this.isShowModal = true;
        this.isEditClicked = true;
        this.isAddClicked = false;
        this.recordFormLabel = "View " + this.sObjectName;
        this.viewMode = "view";
        this.editObjectName = this.sObjectName;
        this.editRecordId = row["Id"];
    }

    editRecord(row) {
        this.isShowModal = true;
        this.isEditClicked = true;
        this.isAddClicked = false;
        this.recordFormLabel = "Edit " + this.sObjectName;
        this.editRecordId = row["Id"];
        this.editObjectName = this.sObjectName;
        this.viewMode = "edit";
    }

    addRecord () {
        this.isShowModal = true;
        this.isEditClicked = false;
        this.isAddClicked = true;
        this.recordFormLabel = "Add " + this.sObjectName;
        this.editObjectName = this.sObjectName;
    }


    onAddHandleSuccess ( event ) {
        this.showToast(this.sObjectName + ' Created', 'Record ID: ' + event.detail.id, 'success');
        //reset the query
        this.queryOffset=0;
        this.records = [];
        this.loadData();
        this.methodgetTotalRecords();
    }

    onEditHandleSuccess ( event ) {
        this.showToast('Record Update', this.sObjectName + ' Updated Successfully', 'success');
        this.queryOffset=0;
        this.records = [];
        this.loadData();
    }

    hideModalBox() { 
        //reset everything
        this.isShowModal = false;
        this.isEditClicked = false;
        this.isAddClicked = false;
    }

    findRowIndexById(id) {
        let ret = -1;
        this.records.some((row, index) => {
          if (row.Id === id) {
            ret = index;
            return true;
          }
          return false;
        });
        return ret;
    }


    async deleteRow(row) {
        const result = await LightningConfirm.open({
            message: "Are you sure you want to delete the record?",
            variant: "headerless",
            label: "This is the aria-label value",
        });
        if (result == true) {
            let id = row["Id"],
            index = this.findRowIndexById(id);
            if (index !== -1) {
            deleteRecord(id)
                .then(() => {
                this.records = this.records
                    .slice(0, index)
                    .concat(this.records.slice(index + 1));
                //call the total records    
                this.methodgetTotalRecords();    
                this.showToast("Success", "Record deleted", "success");
                })
                .catch((error) => {
                this.showToast("Error deleting record", JSON.stringify(error), "error");
                });
            }
        }
   }
    

    showToast(title, message, variant) {
        this.dispatchEvent(
          new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
          })
        );
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    onHandleSort( event ) {
        this.isLoaded = false;
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const reverse = sortDirection === 'asc' ? 1 : -1;
        let cloneData = [...this.records];
        let table = JSON.parse(JSON.stringify(cloneData));
        table.sort((a,b) => 
              {return a[sortedBy] > b[sortedBy] ? 1 * reverse : -1 * reverse}
        );
        this.records = table;
        this.sortDirection = sortDirection;
        this.sortBy = sortedBy;
        this.isLoaded = true;
    }
}