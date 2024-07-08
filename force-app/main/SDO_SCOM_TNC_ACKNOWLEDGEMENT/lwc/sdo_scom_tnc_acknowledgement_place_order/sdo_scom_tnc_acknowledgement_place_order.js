import { LightningElement, api } from 'lwc';
import { useCheckoutComponent } from "commerce/checkoutApi";

export default class Sdo_scom_tnc_acknowledgement_place_order extends useCheckoutComponent(LightningElement) {
    checked = false;
    showError = false;

    @api error = 'Please click the checkbox to accept the terms and conditions';

    @api termsAndConditions = "Sit amet mattis vulputate enim nulla aliquet porttitor lacus. Ut tristique et egestas quis ipsum suspendisse ultrices gravida. Ut porttitor leo a diam. Magna fermentum iaculis eu non. Sit amet justo donec enim. Quis eleifend quam adipiscing vitae. Amet nisl purus in mollis nunc sed id semper. Leo vel fringilla est ullamcorper. Quis vel eros donec ac odio tempor orci dapibus. Curabitur vitae nunc sed velit dignissim sodales ut. Maecenas sed enim ut sem viverra aliquet eget sit amet. Felis donec et odio pellentesque diam. Ultricies mi quis hendrerit dolor magna eget. Eu facilisis sed odio morbi. Aliquet enim tortor at auctor urna nunc id cursus metus.";

    @api termsAndConditionsHeading = 'Terms & Conditions';

    stageAction(checkoutStage) {
        if (checkoutStage === 'CHECK_VALIDITY_UPDATE') {
            return Promise.resolve(this.checkValidity());
        }

        else if(checkoutStage === 'REPORT_VALIDITY_SAVE') {
            return Promise.resolve(this.reportValidity());
        }

        return Promise.resolve(true);
    }

    handleChange(event) {
        this.checked = event.target.checked || false;
        this.showError = this.checkValidity();
    }

    handleShowModal() {
        const modal = this.template.querySelector("c-sdo_scom_tnc_acknowledgement_modal");
        modal.show();
    }

    checkValidity() {
      return !this.checked;
    }

    reportValidity() {
        this.showError = !this.checked;
    
        if (this.showError) {
          this.dispatchUpdateErrorAsync({
            groupId: "TermsAndConditions",
            type: "/commerce/errors/checkout-failure",
            exception: this.error,
          });
        }
    
        return this.checked;
      }
}