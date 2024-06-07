import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createRule from "@salesforce/apex/sdo_scom_boost_and_bury_controller.createRule";
import getProducts from "@salesforce/apex/sdo_scom_boost_and_bury_controller.getProducts";
import BoostBury_SaveRule from "@salesforce/label/c.BoostBury_SaveRule";
import BoostBury_Field_Name from "@salesforce/label/c.BoostBury_Field_Name";
import BoostBury_Field_Level from "@salesforce/label/c.BoostBury_Field_Level";
import BoostBury_Field_StartDate from "@salesforce/label/c.BoostBury_Field_StartDate";
import BoostBury_Field_EndDate from "@salesforce/label/c.BoostBury_Field_EndDate";
import BoostBury_Field_BoostBury from "@salesforce/label/c.BoostBury_Field_BoostBury";
import BoostBury_Rule_Saved from "@salesforce/label/c.BoostBury_Rule_Saved";
import BoostBury_Field_ApplicableProducts from "@salesforce/label/c.BoostBury_Field_ApplicableProducts";

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'SKU', fieldName: 'StockKeepingUnit', type: 'string' }
];

export default class sdo_scom_boost_and_bury_add_rule extends LightningElement {
    @track conditionList = [];
    @track rule = {};
    @api webStoreId;
    @track productList = [];
    @track isLoading = false;

    label = {
        BoostBury_SaveRule,
        BoostBury_Field_Name,
        BoostBury_Field_Level,
        BoostBury_Field_StartDate,
        BoostBury_Field_EndDate,
        BoostBury_Field_BoostBury,
        BoostBury_Field_ApplicableProducts,
        BoostBury_Rule_Saved
    };

    columns = columns;

    connectedCallback(){
        this.init();
    }

    init(){
        this.rule = {};
        this.conditionList = [];
        this.rule.action = 'Boost';
        this.getProductList();
    }

    getProductList(){
        this.isLoading = true;
        getProducts()
        .then((result) => {
            this.productList = result;
        })
        .catch((error) => {
            this.showNotification('Error', error.body.message, 'error');
        }).finally(() => {
            this.isLoading = false;
        });
    }

    get conditionListAvailable() {
        return this.conditionList.length == 0 ? false : true;
    }

    submitRule(event){
        this.isLoading = true;
        this.rule.targetExpression = {};
        this.rule.targetExpression.conditions = [];
        var selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        var ids = [];
        if(selectedRecords.length > 0){
            selectedRecords.forEach(currentItem => {
                ids.push(currentItem.Id);
            });
        }

        this.rule.targetExpression.conditions.push({'attributeNameOrId' : 'Id', 'attributeType' : 'Product2', 'values' : ids});
        

        createRule({'webStoreId' : this.webStoreId, 'input' : JSON.stringify(this.rule)})
        .then((result) => {
            this.init();
            this.template.querySelector('lightning-datatable').selectedRows = [];
            this.dispatchEvent(new CustomEvent("save"));
            this.showNotification('Success', this.label.BoostBury_Rule_Saved, 'success');
        })
        .catch((error) => {
            console.log(error);
            this.showNotification('Error', error.body.message, 'error');
        }).finally(() => {
            this.isLoading = false;
        });
    }

    setCondition(event){
        let index = event.target.dataset.index;
        this.conditionList[index].value = event.target.value;
    }

    setName(event){
        this.rule.name = event.target.value;
    }

    setAction(event){
        this.rule.action = event.target.checked == true ? 'Bury' : 'Boost';
    }

    setLevel(event){
        this.rule.level = event.target.value;
    }

    setStartDate(event){
        this.rule.startDate = event.target.value;
    }

    setEndDate(event){
        this.rule.endDate = event.target.value;
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({title: title, message: message, variant: variant});
        this.dispatchEvent(evt);
    }
}