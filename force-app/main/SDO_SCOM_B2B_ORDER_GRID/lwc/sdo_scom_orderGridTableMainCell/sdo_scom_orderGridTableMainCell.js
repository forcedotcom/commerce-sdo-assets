
import {LightningElement, api} from 'lwc';

export default class SdoScomOrderGridTableMainCell extends LightningElement{
    @api productName;
    @api productSKU;
    @api productImageURL;
    @api productAttributeMap;
    @api productAttributeSetInfo
    @api productAttributeDeveloperName
    @api productUnitPrice;
    @api productCurrencyCode;
    mapOfValues = [];

    connectedCallback() {
        if(this.productAttributeMap)
        {
            let attributeInfo = this.productAttributeSetInfo[this.productAttributeDeveloperName].attributeInfo;
            let attrMap = this.productAttributeMap;
            for(let key in attrMap) {
                if(attributeInfo[key]) {
                    let label = attributeInfo[key].label;
                    this.mapOfValues.push({value: attrMap[key], key:label});
                }
            }
        }
    }

}