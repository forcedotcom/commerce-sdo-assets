import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getRule from "@salesforce/apex/sdo_scom_boost_and_bury_controller.getRule";
import getProductsById from "@salesforce/apex/sdo_scom_boost_and_bury_controller.getProductsById";
import deleteRule from "@salesforce/apex/sdo_scom_boost_and_bury_controller.deleteRule";
import BoostBury_Applicable_Product_Header from "@salesforce/label/c.BoostBury_Applicable_Product_Header";
import BoostBury_Applicable_Product_Cancel from "@salesforce/label/c.BoostBury_Applicable_Product_Cancel";
import BoostBury_Rule_Header_Name from "@salesforce/label/c.BoostBury_Rule_Header_Name";
import BoostBury_Rule_Header_Action from "@salesforce/label/c.BoostBury_Rule_Header_Action";
import BoostBury_Rule_Header_Level from "@salesforce/label/c.BoostBury_Rule_Header_Level";
import BoostBury_Rule_Header_StartDate from "@salesforce/label/c.BoostBury_Rule_Header_StartDate";
import BoostBury_Rule_Header_EndDate from "@salesforce/label/c.BoostBury_Rule_Header_EndDate";
import BoostBury_Rule_Header_RuleAction from "@salesforce/label/c.BoostBury_Rule_Header_RuleAction";
import BoostBury_Rule_Header_ViewProduct_Action from "@salesforce/label/c.BoostBury_Rule_Header_ViewProduct_Action";
import BoostBury_Rule_Header_Delete_Action from "@salesforce/label/c.BoostBury_Rule_Header_Delete_Action";
import BoostBury_Rule_Not_Found from "@salesforce/label/c.BoostBury_Rule_Not_Found";
import BoostBury_Rule_Delete from "@salesforce/label/c.BoostBury_Rule_Delete";

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'SKU', fieldName: 'StockKeepingUnit', type: 'string' }
];

export default class sdo_scom_boost_and_bury_view_rule extends LightningElement {
    @track ruleList = [];
    @api webStoreId;
    columns = columns;
    @track productList;

    @track isLoading = false;

    label = {
        BoostBury_Applicable_Product_Header,
        BoostBury_Applicable_Product_Cancel,
        BoostBury_Rule_Header_Name,
        BoostBury_Rule_Header_Action,
        BoostBury_Rule_Header_Level,
        BoostBury_Rule_Header_StartDate,
        BoostBury_Rule_Header_EndDate,
        BoostBury_Rule_Header_RuleAction,
        BoostBury_Rule_Header_ViewProduct_Action,
        BoostBury_Rule_Header_Delete_Action,
        BoostBury_Rule_Not_Found,
        BoostBury_Rule_Delete
    };

    connectedCallback(){
        this.getRuleList();
    }

    @track isProductModel = false;
    toggleConfigureModel() {  
        this.isProductModel = !this.isProductModel;
    }


    get ruleListAvailable() {
        return (!this.ruleList || this.ruleList.length == 0) ? false : true;
    }
    
    @api 
    refreshRuleList(){
        this.getRuleList();
    }

    getRuleList(){
        this.isLoading = true;
        getRule({'webStoreId' : this.webStoreId})
        .then((result) => {
            this.ruleList = JSON.parse(result).boostBuryRules;
        })
        .catch((error) => {
            this.showNotification('Error', error.body.message, 'error');
        }).finally(() => {
            this.isLoading = false;
        });
    }

    viewProducts(event){
        this.isLoading = true;
        var ruleRecord = this.ruleList[event.target.dataset.index];
        getProductsById({'productIds' : ruleRecord.targetExpression.conditions[0].values})
        .then((result) => {
            this.productList = result;
            this.toggleConfigureModel();
        })
        .catch((error) => {
            this.showNotification('Error', error.body.message, 'error');
        }).finally(() => {
            this.isLoading = false;
        });
    }

    deleteRule(event){
        this.isLoading = true;
        var ruleRecord = this.ruleList[event.target.dataset.index];
        deleteRule({'webStoreId' : this.webStoreId, 'ruleId' : ruleRecord.id})
        .then((result) => {
            this.showNotification('Success', this.label.BoostBury_Rule_Delete, 'success');
            this.getRuleList();
        })
        .catch((error) => {
            this.showNotification('Error', error.body.message, 'error');
        }).finally(() => {
            this.isLoading = false;
        });
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({title: title, message: message, variant: variant});
        this.dispatchEvent(evt);
    }
}