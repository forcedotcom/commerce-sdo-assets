import { createElement } from 'lwc';
import Sdo_scom_product_reviews_preview from 'c/sdo_scom_product_reviews_preview';

describe('c-sdo-scom-product-reviews-preview', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-sdo-scom-product-reviews-preview', {
            is: Sdo_scom_product_reviews_preview
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});