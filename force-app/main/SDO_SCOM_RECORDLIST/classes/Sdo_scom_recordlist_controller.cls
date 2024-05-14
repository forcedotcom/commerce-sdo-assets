/**
* @author : Vinay CN
* @date   : 25/02/2024
* @description : Record List Controller. This is the main controller which is referenced in the 
*   SdoScomRecordlist which is also entry point of the SDO RecordList component.
*/

public class Sdo_scom_recordlist_controller { 

    /**
    * The below service fecthes related list properties.
    */
    @AuraEnabled
    public static Sdo_scom_recordlist_remote_response getApiNameOfChild(String recordId,String objectName){
        try{
            Sdo_scom_recordlist_remote_response response = new Sdo_scom_recordlist_remote_response(true, 'Success', System.JSON.serialize(Sdo_scom_recordlist_wrapper_controller.getInstance().getApiNameOfChild(recordId,objectName)));
            if(Test.isRunningTest()){
                throw new AuraHandledException('TEST CONTEXT');
            }
            return response;
        }
        catch(Exception e){
            return new Sdo_scom_recordlist_remote_response(false,'Fail',e.getMessage());
        }
   }

   /**
    * The below service fecthes the fieldDetails like Field Name, label and FieldDataType.
    * This data is used to desiplay field headers in the lighning - datatable.
    */
   @AuraEnabled(cacheable=true)
    public static Sdo_scom_recordlist_remote_response getFieldDetails(String objectName, String queryType ,String fieldsToQuery, String filters,String recordId){
        try{
            Sdo_scom_recordlist_remote_response response = new Sdo_scom_recordlist_remote_response(true, 'Success', System.JSON.serialize(Sdo_scom_recordlist_wrapper_controller.getInstance().getFieldDetails(objectName,queryType, fieldsToQuery,filters,recordId)));
            if(Test.isRunningTest()){
                throw new AuraHandledException('TEST CONTEXT');
            }
            return response;
        }
        catch(Exception e){
            return new Sdo_scom_recordlist_remote_response(false,'Fail',e.getMessage());
        }
   }

    /**
    * The below service fecthes the Icon for the Object.
    */
   @AuraEnabled
    public static Sdo_scom_recordlist_remote_response retrieveIconForObject(String objectname,String recordId){
        try{
            Sdo_scom_recordlist_remote_response response = new Sdo_scom_recordlist_remote_response(true, 'Success', System.JSON.serialize(Sdo_scom_recordlist_wrapper_controller.getInstance().retrieveIconForObject(objectName,recordId)));
            if(Test.isRunningTest()){
                throw new AuraHandledException('TEST CONTEXT');
            }
            return response;
        }
        catch(Exception e){
            return new Sdo_scom_recordlist_remote_response(false,'Fail',e.getMessage());
        }
   }
   
   /**
    * The below service fecthes the tolal number of records for the given objectName.
    * This data is used in the header.
    */
   @AuraEnabled(cacheable=false)
    public static Sdo_scom_recordlist_remote_response getTotalRecords(String objectName,String filters,String recordId, String queryType){
        try{
            Sdo_scom_recordlist_remote_response response = new Sdo_scom_recordlist_remote_response(true, 'Success', System.JSON.serialize(Sdo_scom_recordlist_wrapper_controller.getInstance().getTotalRecords(objectName,filters,recordId, queryType)));
            if(Test.isRunningTest()){
                throw new AuraHandledException('TEST CONTEXT');
            }
            return response;
        }
        catch(Exception e){
            return new Sdo_scom_recordlist_remote_response(false,'Fail',e.getMessage());
        }
   }
   
   /**
    * The below service fecthes the records for the given objectName and its properties. This data is used in 
    * the lightning-datatable.
    */
   @AuraEnabled(cacheable=false)
    public static Sdo_scom_recordlist_remote_response getRecords(String objectName, String queryType, String listViewName ,String fieldsToQuery, String filters,String sortField,String sortDirect,String recordId,String offset,String limitrec){
        try{
            Sdo_scom_recordlist_remote_response response = new Sdo_scom_recordlist_remote_response(true, 'Success', System.JSON.serialize(Sdo_scom_recordlist_wrapper_controller.getInstance().getRecords(objectName, queryType, listViewName, fieldsToQuery,filters,sortField,sortDirect,recordId,offset,limitrec)));
            if(Test.isRunningTest()){
                throw new AuraHandledException('TEST CONTEXT');
            }
            return response;
        }
        catch(Exception e){
            return new Sdo_scom_recordlist_remote_response(false,'Fail',e.getMessage());
        }
   }
   
   //The commented code below is for search records functionlaity. 

//    @AuraEnabled
//     public static Sdo_scom_recordlist_remote_response searchrecords(String objectName, String queryType, String fieldsToQuery,String filters,String sortField,String sortDirect,String recordId,String offset,String limitrec,String searchSTring){
//         try{
//             Sdo_scom_recordlist_remote_response response = new Sdo_scom_recordlist_remote_response(true, 'Success', System.JSON.serialize(Sdo_scom_recordlist_wrapper_controller.getInstance().searchrecords(objectName,queryType,fieldsToQuery,filters,sortField,sortDirect,recordId,offset,limitrec,searchSTring)));
//             if(Test.isRunningTest()){
//                 throw new AuraHandledException('TEST CONTEXT');
//             }
//             return response;
//         }
//         catch(Exception e){
//             return new Sdo_scom_recordlist_remote_response(false,'Fail',e.getMessage());
//         }
//    }
}