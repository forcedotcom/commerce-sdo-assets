import LightningDatatable from 'lightning/datatable';
import imageTable from './sdo_scom_recordlist_customimage.html';

//This componenet is to make image working. As of now this component deactivated.
export default class SdoScomRecordlistCustom extends LightningDatatable {
    static customTypes = {
        IMAGE: {
            template: imageTable
        }
    };
}