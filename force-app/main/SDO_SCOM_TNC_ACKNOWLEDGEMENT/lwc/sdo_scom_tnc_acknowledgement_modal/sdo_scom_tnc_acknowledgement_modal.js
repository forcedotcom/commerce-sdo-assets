import { LightningElement, api, track } from 'lwc';
import communityPath from '@salesforce/community/basePath';

export default class Sdo_scom_tnc_acknowledgement_modal extends LightningElement {
    closeIcon = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#close';

    @track showTermsModal = false;

    @api termsAndConditions;

    @api termsAndConditionsHeading;

    @api show() {
        this.showTermsModal = !this.showTermsModal;
    }

    handleDialogClose() {
        this.showTermsModal = false;
    }
}