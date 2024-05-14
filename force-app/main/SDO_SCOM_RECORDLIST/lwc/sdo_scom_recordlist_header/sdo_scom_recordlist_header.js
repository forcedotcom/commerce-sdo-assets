import { LightningElement,api,track } from 'lwc';
export default class SdoScomRecordlistHeader extends LightningElement{
    
    @api totalRecordCount;

    @api objectlabel;

    @api newbutton;

    @api filters;

    @api showhistory;

    handleNewClick (event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('addrecord',{

        }));
    }

    // handleSearchText (event) {
    //     event.preventDefault();
    //     console.log("In Header search handle ");
    //     console.log("Entered search text  " + event.target.value);
    //     this.dispatchEvent(new CustomEvent('search',{
    //         detail : {
    //             searchText : event.target.value,
    //         }
            
    //     }));
    // }

}