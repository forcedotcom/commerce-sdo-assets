import { LightningElement, track, api } from 'lwc';
import BoostBury_Configure_Description from "@salesforce/label/c.BoostBury_Configure_Description";
import BoostBury_Configure_Header from "@salesforce/label/c.BoostBury_Configure_Header";
import BoostBury_Configure_Cancel from "@salesforce/label/c.BoostBury_Configure_Cancel";
export default class sdo_scom_boost_and_bury_search_rule extends LightningElement {
    @track isConfigureModel = false;
    @api recordId;
    label = {
        BoostBury_Configure_Description,
        BoostBury_Configure_Header,
        BoostBury_Configure_Cancel
    };
    toggleConfigureModel() {  
        this.isConfigureModel = !this.isConfigureModel;
    }

    
    
    refreshList(event){
        this.template.querySelector('c-sdo_scom_boost_and_bury_view_rule').refreshRuleList();
    }
}