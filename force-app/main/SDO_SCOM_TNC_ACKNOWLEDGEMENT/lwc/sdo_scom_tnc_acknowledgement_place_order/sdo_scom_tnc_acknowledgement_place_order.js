import { api } from 'lwc';
import { CheckoutComponentBase } from 'commerce/checkoutApi';

export default class Sdo_scom_tnc_acknowledgement_place_order extends CheckoutComponentBase {
    _checkedByDefault = false;
    checked = false;
    showError = false;
    checkoutDisabled = true;

    @api error = 'Please click the checkbox to accept the terms and conditions';

    @api termsAndConditions = "Sit amet mattis vulputate enim nulla aliquet porttitor lacus. Ut tristique et egestas quis ipsum suspendisse ultrices gravida. Ut porttitor leo a diam. Magna fermentum iaculis eu non. Sit amet justo donec enim. Quis eleifend quam adipiscing vitae. Amet nisl purus in mollis nunc sed id semper. Leo vel fringilla est ullamcorper. Quis vel eros donec ac odio tempor orci dapibus. Curabitur vitae nunc sed velit dignissim sodales ut. Maecenas sed enim ut sem viverra aliquet eget sit amet. Felis donec et odio pellentesque diam. Ultricies mi quis hendrerit dolor magna eget. Eu facilisis sed odio morbi. Aliquet enim tortor at auctor urna nunc id cursus metus.";

    @api checkoutDetails;

    @api buttonTitle = 'Place Order';

    @api termsAndConditionsHeading = 'Terms & Conditions';

    handleButtonClick(event) {
        event.stopPropagation();
        this.dispatchFinalizeAsync();
    }

    handleChange(event) {
        this.checked = event.target.checked || false;
        this.showError = !this.checked;
        this.checkoutDisabled = !this.checkoutDisabled;
    }

    get disabled() {
        return (this.checkoutDetails?.checkoutStatus !== 200) || this.checkoutDisabled;
    }

    get displayPlaceOrder() {
        return !this.checkoutDetails?.display?.hidePlaceOrderButton;
    }

    handleShowModal() {
        const modal = this.template.querySelector("c-sdo_scom_tnc_acknowledgement_modal");
        modal.show();
    }
}