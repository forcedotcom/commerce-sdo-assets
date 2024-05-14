/**
* @author      : Vinay CN
* @description : Sdo_scom_recordlist_datablewrapper_controller is a service implementation class which
* contains main logic to getRecords, and getTotalRecords, getFielsDetails.
**/
public without sharing class Sdo_scom_recordlist_wrapper_controller {

    //constants
    public static final String RelatedQueryName = 'Related List';
    public static final String ListViewQueryName = 'List View';


    public static String parentobjectAPIName;
    public static Schema.SObjectType parentObjectType;
    public static Map<String, Schema.SObjectField> fieldMap;
    public static DescribeSObjectResult objectResult;
    public static String ApiobjectName;
    public static String relationshipName;
    private static Sdo_scom_recordlist_wrapper_controller instance;
    
    public static Sdo_scom_recordlist_wrapper_controller getInstance(){
        if(instance==null) instance = new Sdo_scom_recordlist_wrapper_controller();
        return instance;
    }
    
    /**
    * getApiNameOfChild gets the ApiObject name
    * @param recordId of the object
    * @param objectName of the object
    */
    public Sdo_scom_recordlist_lightning_response getApiNameOfChild(String recordId,String objectName){
        Sdo_scom_recordlist_lightning_response responseWrapper = new Sdo_scom_recordlist_lightning_response();
        //The final wrapper response to return to component
        Sdo_scom_recordlist_datatable_response response = new Sdo_scom_recordlist_datatable_response();
        //get defaultvalues
        getdefaultvalues(recordId,objectName);
        
        response.maptoReturn.put('Apiname',ApiobjectName);
        response.maptoReturn.put('fieldname',getRelationshipfieldname());
        responseWrapper.lstDataTableRecs=response;
        return responseWrapper;
    }
    
    public static String getRelationshipfieldname(){
       
       for(String fieldName:fieldMap.keyset()){
            Schema.DescribeFieldResult fieldDescribeResult = fieldMap.get(fieldName).getDescribe();
            Schema.DisplayType displayType = fieldDescribeResult.getType();
            Schema.SObjectType referenceField;
            
            if(ApiobjectName == 'Task' || ApiobjectName =='Event'){
                if(parentObjectType == contact.SObjectType|| parentObjectType == Lead.SObjectType){
                    relationshipName ='whoid';
                }else{
                    relationshipName ='whatid';
                }
           }
       }
     return relationshipName;
    }
    
    /**
    * getparentName gets the parentObject name
    * @param recordId of the object
    */
    public static void getparentName(String recordId){
        if(recordId!=null){
            String keyPrefix = recordId.substring(0,3);
             for( Schema.SObjectType obj : Schema.getGlobalDescribe().Values() ){
                 String prefix = obj.getDescribe().getKeyPrefix();
                 if(prefix!=null && prefix.equals(keyPrefix)){
                     parentObjectType = obj;
                     parentobjectAPIName = obj.getDescribe().getName();
                     break;
                 }
             }
        }
    }

    /**
    * getparentName gets the Object name
    * @param recordId of the object
    */
    public static String getObjectName(String objectName){
        if(parentobjectAPIName!=null){
             // to get the object apiName from Child relation name in objectName
            DescribeSObjectResult objectResult = Schema.getGlobalDescribe().get(parentobjectAPIName).getDescribe();
            List<Schema.ChildRelationship> children = objectResult.getChildRelationships();
            for(Schema.ChildRelationship child:children){
                if((child.getRelationshipName()==objectName) || (child.getRelationshipName() == objectName + 's')){
                     Schema.SObjectType obj= child.getChildSObject();
                     objectName  =  obj.getDescribe().getName(); 
                     // get api name of field of child relationship name
                     relationshipName = String.valueOf(child.getField());
                }
           }
        }
        
        return objectName;
    }

    public static string getfieldsToQuery(String fieldsToQuery){
         String fieldquery='';
         for (String fieldName : fieldsToQuery.split(',')) {
            fieldName = fieldName.replace(' ','');
            if (fieldMap.containsKey(fieldName)) {
                Schema.DescribeFieldResult fieldDescribeResult = fieldMap.get(fieldName).getDescribe();
                Schema.DisplayType displayType = fieldDescribeResult.getType();
                if(displayType == Schema.DisplayType.PICKLIST){
                    fieldquery+='toLabel('+fieldName + '),';
                }else{
                    fieldquery+=fieldName+',';
                }
            }
            //Check for relationship and get base field Name
            if (fieldName.contains('.')) {
                fieldquery+=fieldName+',';
            }
        }
       
        if(fieldquery.endsWith(',')){
            fieldquery=fieldquery.removeEnd(',');
        }
        return fieldquery;
    }

    /**
    * getFieldMap get the metadata information of fields of any object
    * @param objectname
    */
    public static void getFieldMap(String objectName){
         objectResult = Schema.getGlobalDescribe().get(objectName).getDescribe();
         fieldMap = objectResult.fields.getMap();
    }

    /**
    * getFieldDetails gets the details about Object fields
    * @param API Name of the Object
    * @param List of field in comma separated form
    * @param SOQL filter in String form
    * @return Map between object fields and their details that can be used on JS Controller
    */
    public Sdo_scom_recordlist_lightning_response getFieldDetails(String objectName, String queryType, String fieldsToQuery, String filters,String recordId){
        Sdo_scom_recordlist_lightning_response responseWrapper = new Sdo_scom_recordlist_lightning_response();
        //The final wrapper response to return to component
        Sdo_scom_recordlist_datatable_response response = new Sdo_scom_recordlist_datatable_response();
   
        if (isRelatedQuery(queryType, recordId)) {
            getdefaultvalues(recordId,objectName);  
        } else {
            getFieldMap(objectName);
        }
        fieldsToQuery = fieldsToQuery.toLowerCase();
        
        Map<Schema.DisplayType, String> fieldDisplayTypeToJsTypeMap = buildSFTypeToJsTypeMap();
        Map<String, Map<String, String>> fieldNameToDetailsMap = new Map<String, Map<String, String>>();
        Map<String,Schema.SObjectField> fieldToSchemaMap = new Map<String,Schema.SObjectField>();
        for (String fieldName : fieldsToQuery.split(',')) {
            fieldName = fieldName.replace(' ','');
            if (fieldMap.containsKey(fieldName)) {
                fieldToSchemaMap.put(fieldName, fieldMap.get(fieldName));
                Schema.DescribeFieldResult fieldDescribeResult = fieldMap.get(fieldName).getDescribe();
                Schema.DisplayType displayType = fieldDescribeResult.getType();
                String fieldLabel = fieldDescribeResult.getLabel();
                String apiName = fieldDescribeResult.getName();
                system.debug ('processing field ' + fieldName + 'with displayType as ' +displayType);
                if (fieldDisplayTypeToJsTypeMap.containsKey(displayType)) {
                    Map<String, String> fieldDetailsMap = new Map<String, String>(); 
                    fieldDetailsMap.put('label', fieldLabel);
                    fieldDetailsMap.put('apiname', apiName);
                    fieldDetailsMap.put('picklistValues',null);
                    if(fieldDescribeResult.isCalculated()){
                        if(fieldDescribeResult.getCalculatedFormula().contains('IMAGE')){
                            fieldDetailsMap.put('displaytype','IMAGE');
                        }else{
                            fieldDetailsMap.put('displaytype', 'formula');
                        }
                    }else{
                        fieldDetailsMap.put('displaytype', fieldDisplayTypeToJsTypeMap.get(displayType));
                    }
                    if(displayType==Schema.DisplayType.PICKLIST){
                        List<Object> pickListValuesList=new List<Object>();
                        List<Schema.PicklistEntry> ple = fieldDescribeResult.getPicklistValues();
                        for(Schema.PicklistEntry pickListVal : ple){
                            Map<String,String> picklistvalMap=new Map<String,String>();
                            picklistvalMap.put('value',pickListVal.getLabel());
                            picklistvalMap.put('label',pickListVal.getLabel());
                            pickListValuesList.add(picklistvalMap);
                        } 
                        fieldDetailsMap.put('picklistValues',JSON.serialize(pickListValuesList));  
                    }else{
                        fieldDetailsMap.put('picklistValues',null);
                    }
                    fieldDetailsMap.put('objectPluralName', objectResult.getLabelPlural());
                    fieldNameToDetailsMap.put(fieldName, fieldDetailsMap);
                }
            } else {
                //Check for relationship and get base field Name
                if (fieldName.contains('.')) {
                    List<String> splitFieldRelationshipAndName = fieldName.split('\\.');
                    String relationshipName = splitFieldRelationshipAndName.get(0);
                    String relatedField = splitFieldRelationshipAndName.get(1);
                    String relationshipField = getRelationshipFieldName(relationshipName);   
                    String relatedField2;
                    // 2nd level parent fields
                    if(splitFieldRelationshipAndName.size() > 2 && splitFieldRelationshipAndName.get(2)!=null){
                        String relationshipName2 = relatedField; 
                        relatedField2 = splitFieldRelationshipAndName.get(2);    
                        if (String.isnotBlank(relationshipField)) {
                            if (fieldMap.containsKey(relationshipField)) {
                                fieldToSchemaMap.put(fieldName, fieldMap.get(fieldName));
                                Schema.DescribeFieldResult fieldDescribeResult = fieldMap.get(relationshipField).getDescribe();
                                String relationShipFieldLabel = fieldDescribeResult.getLabel();
                                String relationFieldApiName = fieldDescribeResult.getRelationshipName();
                                Schema.sObjectType referencedObject = fieldDescribeResult.getReferenceTo().get(0);
                                Map<String, Schema.SObjectField> relationshipFieldMap = referencedObject.getDescribe().fields.getMap();     
                                String relationshipField2 = getRelationshipFieldName(relationshipName2);         
                                if (relationshipFieldMap.containsKey(relationshipField2)) {              
                                    Schema.DescribeFieldResult fieldDescribeResult2 = relationshipFieldMap.get(relationshipField2).getDescribe();
                                    String relationShipFieldLabel2 = fieldDescribeResult2.getLabel();
                                    String relationFieldApiName2 = fieldDescribeResult2.getRelationshipName();
                                    Schema.sObjectType referencedObject2 = fieldDescribeResult2.getReferenceTo().get(0);
                                    Map<String, Schema.SObjectField> relationshipFieldMap2 = referencedObject2.getDescribe().fields.getMap();   
                                    
                                    if(String.isnotBlank(relatedField2)) {
                                        if (relationshipFieldMap2.containsKey(relatedField2)) {
                                            Schema.DescribeFieldResult relationFieldDescribeResult = relationshipFieldMap2.get(relatedField2).getDescribe();
                                            Schema.DisplayType displayType = relationFieldDescribeResult.getType();
                                            String fieldLabel = relationFieldDescribeResult.getLabel();
                                            String apiName = relationFieldDescribeResult.getName();
                                            if (fieldDisplayTypeToJsTypeMap.containsKey(displayType)) {
                                                Map<String, String> fieldDetailsMap = new Map<String, String>(); 
                                                fieldDetailsMap.put('label', relationFieldApiName +'-'+ relationFieldApiName2 + '-' + fieldLabel);
                                                fieldDetailsMap.put('apiname',relationFieldApiName+'_'+ relationFieldApiName2 +'_'+apiName);
                                                fieldDetailsMap.put('displaytype','reference');
                                                fieldDetailsMap.put('objectPluralName', relationFieldApiName2);
                                                fieldNameToDetailsMap.put(fieldName, fieldDetailsMap);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                    }
                    else{
                        if (String.isnotBlank(relationshipField)) {
                            if (fieldMap.containsKey(relationshipField)) {
                                Schema.DescribeFieldResult fieldDescribeResult = fieldMap.get(relationshipField).getDescribe();
                                String relationShipFieldLabel = fieldDescribeResult.getLabel();
                                String relationFieldApiName = fieldDescribeResult.getRelationshipName();
                                Schema.sObjectType referencedObject = fieldDescribeResult.getReferenceTo().get(0);
                                Map<String, Schema.SObjectField> relationshipFieldMap = referencedObject.getDescribe().fields.getMap();
                                if (relationshipFieldMap.containsKey(relatedField)) {
                                    Schema.DescribeFieldResult relationFieldDescribeResult = relationshipFieldMap.get(relatedField).getDescribe();
                                    Schema.DisplayType displayType = relationFieldDescribeResult.getType();
                                    String fieldLabel = relationFieldDescribeResult.getLabel();
                                    String apiName = relationFieldDescribeResult.getName();
                                    if (fieldDisplayTypeToJsTypeMap.containsKey(displayType)) {
                                        Map<String, String> fieldDetailsMap = new Map<String, String>(); 
                                        fieldDetailsMap.put('label', relationShipFieldLabel + '-' + fieldLabel);
                                        fieldDetailsMap.put('apiname', relationFieldApiName + '_' + apiName);
                                        fieldDetailsMap.put('displaytype','reference');
                                        fieldDetailsMap.put('objectPluralName', objectResult.getLabelPlural());
                                        fieldNameToDetailsMap.put(fieldName, fieldDetailsMap);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        response.fieldNameToDetailsMap = fieldNameToDetailsMap;
        fieldToSchemaMap = fieldMap;
        responseWrapper.lstDataTableRecs=response;
        return responseWrapper;
    }

    /**
    * Get the Custom field name from the Relationship Name
    * @param Relationship Name
    * @return API Nme of the relationship field
    */
    private static String getRelationshipFieldName(String relationshipName) {
        String relationshipFieldName = '';
        //Verify if field contains the relationship
        if (relationshipName.endsWith('__r')) {
            relationshipFieldName = relationshipName.replace('__r', '__c');
        } else {
            relationshipFieldName = relationshipName + 'id';
        }
        return relationshipFieldName;
    }

    /**
    * Build a mapping between SF Data Type and JS Type
    * @param Relationship Name
    * @return API Nme of the relationship field
    */
    private static Map<Schema.DisplayType, String> buildSFTypeToJsTypeMap() {
        Map<Schema.DisplayType, String> fieldDisplayTypeToJsTypeMap = new Map<Schema.DisplayType, String>();
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.BOOLEAN, 'boolean');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.COMBOBOX, 'text');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.CURRENCY, 'currency');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.DATACATEGORYGROUPREFERENCE, 'text');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.DATE, 'date');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.DATETIME, 'datetime');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.DOUBLE, 'number');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.EMAIL, 'email');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.ID, 'text');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.INTEGER, 'number');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.LONG, 'number');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.MULTIPICKLIST, 'text');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.PERCENT, 'number');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.PHONE, 'phone');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.PICKLIST, 'picklist');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.REFERENCE, 'id');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.STRING, 'text');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.TEXTAREA, 'textarea');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.TIME, 'text');
        fieldDisplayTypeToJsTypeMap.put(Schema.DisplayType.URL, 'url');
        return fieldDisplayTypeToJsTypeMap;
    }
    /***
     * Explores the schema of the soject passed in and finds lightning icon style and image url for sObject
     * If nothing is found, defaults to the custom icon
     *
     * @param   sObjectTypeName       the sObject to find the icon for
     * @return  Map<String,String>    Map of properties about the icon to be consumed by the front end.
     *                                Right now, returns values for keys: iconStyle,iconURL
     */
    
    public Sdo_scom_recordlist_lightning_response retrieveIconForObject(String objectname,String recordId) { 
        Sdo_scom_recordlist_lightning_response responseWrapper = new Sdo_scom_recordlist_lightning_response();
        //The final wrapper response to return to component
        Sdo_scom_recordlist_datatable_response response = new Sdo_scom_recordlist_datatable_response();
        
        if (!String.isBlank(recordId)) {
            getdefaultvalues(recordId,objectName);   
        }
        String iconStyle;
        String iconURL;
        String iconTag;
        
        List<Schema.DescribeTabSetResult> tabSetDesc      = Schema.describeTabs();
        List<Schema.DescribeTabResult>    tabDesc         = new List<Schema.DescribeTabResult>();
        List<Schema.DescribeIconResult>   iconDesc        = new List<Schema.DescribeIconResult>();

        for(Schema.DescribeTabSetResult tsr : tabSetDesc){
            tabDesc.addAll(tsr.getTabs()); 
        }
        for(Schema.DescribeTabResult tr : tabDesc) {
            if( objectname == tr.getSobjectName() ) {
                if(!tr.getIcons().isEmpty()){
                    iconDesc.addAll(tr.getIcons());
                }else{
                    if( tr.isCustom() == true ) {
                        iconStyle = 'slds-icon-standard-custom';
                        iconURL   = '/img/icon/t4v35/standard/custom_120.png';
                    } else {
                        iconStyle = 'slds-icon-standard-' + objectname.toLowerCase();
                        iconURL   = '/img/icon/t4v35/standard/' + objectname.toLowerCase() + '_120.png';
                    }
                }
            }
        }
        for (Schema.DescribeIconResult ir : iconDesc) {
            if(ir.getTheme() =='custom' && !ir.getContentType().startsWith('image/svg')){//custom icon thats not an svg
                iconTag   = 'custom';
                iconURL   = ir.getURL();
                iconStyle = 'slds-icon-standard-custom';
                break;
            }else if(ir.getWidth() == 120 && ir.getTheme() =='theme4' && ir.getContentType() == 'image/png'){//large lightning icon image
                if(ir.getURL().contains('/custom/')){ //Icon is from the Custom Sprite
                    iconTag    = ir.getURL().substringBetween('custom/','.png').substringBefore('_');
                    iconURL    = '/img/icon/t4v35/custom/' + iconTag + '_120.png';
                    iconStyle  = 'slds-icon-custom-'+ iconTag;
                    break;
                }else if(ir.getURL().contains('/standard/')){//Icon is from the Standard Sprite
                    iconTag    = ir.getURL().substringBetween('standard/','.png').substringBefore('_');
                    iconURL    = '/img/icon/t4v35/standard/' + iconTag + '_120.png';
                    iconStyle  = 'slds-icon-standard-'+ iconTag;
                    break;
                }
            }
        }
        //if no icons are found, just default to the Custom lightning icon
        if(iconStyle == null){
            iconStyle = 'slds-icon-standard-custom';
            iconURL   = '/img/icon/t4v35/standard/custom_120.png';
            iconTag   = 'No Lightning Icon Found';
        }
        //return a map with our properties for the front end
        response.iconPropertyMap.put('iconStyle',iconStyle+' slds-icon_container slds-avatar');
        response.iconPropertyMap.put('iconURL',  iconURL);
        responseWrapper.lstDataTableRecs=response;
        return responseWrapper;
    }
    
    /**
    * getRecords build the SOQL query, exucutes it and return the results
    * @param API Name of the Object
    * @param List of field in comma separated form
    * @param SOQL filter in String form
    * @return SObject records returned after running the query
    */
    
    public Sdo_scom_recordlist_lightning_response getTotalRecords(String objectName,String filters,String recordId, String queryType){
       Sdo_scom_recordlist_lightning_response responseWrapper = new Sdo_scom_recordlist_lightning_response();
       //The final wrapper response to return to component
       Sdo_scom_recordlist_datatable_response response = new Sdo_scom_recordlist_datatable_response();
       
       String query;
       if (isRelatedQuery(queryType, recordId)) {
          getdefaultvalues(recordId,objectName);
          relationshipname = getRelationshipfieldname();     
       }
       
        if (isRelatedQuery(queryType, recordId)){
            query = 'SELECT Count(Id) total FROM ' + ApiobjectName;
            query += ' WHERE '+ relationshipname +'=\'' + recordId + '\'';
            if (!String.isBlank(filters)) {
                query += ' AND '+ filters;
            }
        } else {
            query = 'SELECT Count(Id) total FROM ' + objectName;
            if (!String.isBlank(filters)) {
               query += ' WHERE '+ filters;
            }
        } 
        system.debug('Total count '  + query);
        response.totalrecords = returnTotal(query);
        responseWrapper.lstDataTableRecs=response;
        return responseWrapper;
    }
    
    public static Integer returnTotal(string query){
        system.debug(query);
        aggregateresult[] results = Database.query(query);
        return (Integer)results[0].get('total');
    }
    /**
    * getRecords build the SOQL query, exucutes it and return the results
    * @param API Name of the Object
    * @param List of field in comma separated form
    * @param SOQL filter in String form
    * @return SObject records returned after running the query
    */
    public Sdo_scom_recordlist_lightning_response getRecords(String objectName, String queryType, String listViewName, String fieldsToQuery, String filters,String sortField,String sortDirect,String recordId,String offset,String limitrec){
       Sdo_scom_recordlist_lightning_response responseWrapper = new Sdo_scom_recordlist_lightning_response();
       //The final wrapper response to return to component
       Sdo_scom_recordlist_datatable_response response = new Sdo_scom_recordlist_datatable_response();
       
       if (isRelatedQuery(queryType, recordId)) {
        getdefaultvalues(recordId,objectName);
       } else {
        getFieldMap(objectName);
       }

       String fieldquery=getfieldsToQuery(fieldsToQuery);
       String query = 'SELECT ' + fieldquery + ' FROM ' + objectName;

       Integer limitRecords = Integer.valueOf(limitrec);
       Integer offsetRecords = Integer.valueOf(offset);

        if(sortField == Null || !fieldMap.containsKey(sortField)) {
            sortField = 'createdDate'; 
        }
        if(sortDirect == Null) { 
            sortDirect = 'ASC';
        }

        if (isRelatedQuery(queryType, recordId)){  

           relationshipname = getRelationshipfieldname();
           query += ' WHERE '+ relationshipname +'=\'' + recordId + '\'';
           if (String.isNotBlank(filters)) 
           {
              query += ' AND ' + filters;
           }
        } else {
           if (String.isNotBlank(filters)) {
              query += ' WHERE '+ filters;
           }
        }
        query +=' ORDER BY ' + sortField + ' '+sortDirect+ ' LIMIT '+ limitRecords + ' OFFSET ' + offsetRecords;

        system.debug(query);
        response.lstDataTableData = Database.query(query);
        system.debug(response.lstDataTableData);
        responseWrapper.lstDataTableRecs=response;
        return responseWrapper;
    }

    public static void getdefaultvalues(String recordId,String objectName){
        if (!String.isBlank(recordId)) {
            getparentName(recordId);
        }
        // get the api name of object from child relationship name
        ApiobjectName=getObjectName(objectName); 
        getFieldMap(ApiobjectName);
    }

    /**
     * The below commented code is service implementation for Search Records.
     */
    
    // public Sdo_scom_recordlist_lightning_response searchrecords(String objectName, String queryType, String fieldsToQuery,String filters,String sortField,String sortDirect,String recordId,String offset,String limitrec,String searchSTring){
    //     Sdo_scom_recordlist_lightning_response responseWrapper = new Sdo_scom_recordlist_lightning_response();
    //     //The final wrapper response to return to component
    //     Sdo_scom_recordlist_datatable_response response = new Sdo_scom_recordlist_datatable_response();
        
    //     getdefaultvalues(recordId,objectName);
    //     fieldsToQuery = fieldsToQuery.toLowerCase();
    //     Integer limitRecords = Integer.valueOf(limitrec);
    //     Integer offsetRecords = Integer.valueOf(offset);
       
    //     String searchQuery='(';
        
    //     if(searchSTring.length()>2){
    //         for (String fieldName : fieldsToQuery.split(',')) {
    //             fieldName = fieldName.replace(' ','');
    //             if (fieldMap.containsKey(fieldName)) {
    //                 Schema.DescribeFieldResult fieldDescribeResult = fieldMap.get(fieldName).getDescribe();
    //                 Schema.DisplayType displayType = fieldDescribeResult.getType();
    //                 if(displayType!=Schema.DisplayType.TEXTAREA && displayType!=Schema.DisplayType.ADDRESS && displayType!=Schema.DisplayType.CURRENCY && displayType!=Schema.DisplayType.DOUBLE && displayType!=Schema.DisplayType.INTEGER && displayType!=Schema.DisplayType.DATE && displayType!=Schema.DisplayType.DATETIME && displayType!=Schema.DisplayType.BOOLEAN){
    //                     searchQuery+=fieldName + ' Like \'%' + searchSTring + '%\''+' OR ';
    //                 }else if((displayType==Schema.DisplayType.CURRENCY || displayType==Schema.DisplayType.DOUBLE || displayType==Schema.DisplayType.INTEGER || displayType==Schema.DisplayType.BOOLEAN) && searchSTring.isNumeric()){
    //                     searchQuery+=fieldName + '=' + searchSTring +' OR ';
    //                 }
    //             }
    //         }
    //         if(searchQuery.endsWith(' OR ')){
    //             searchQuery=searchQuery.removeEnd(' OR ');
    //         }
    //         searchQuery+=')';
    //         String fieldquery=getfieldsToQuery(fieldsToQuery);
    //         String query = 'SELECT ' + fieldquery + ' FROM ' + objectName;
    //         String Squery = 'SELECT Count(Id) total FROM ' + objectName;
    //         if(sortField == Null || !fieldMap.containsKey(sortField)) {
    //             sortField = 'createdDate'; 
    //         }
    //         if(sortDirect == Null) { 
    //             sortDirect = 'ASC';
    //         }

    //         //update the filters
    //         if (!String.isBlank(filters)) {
    //             filters +=' AND '+ searchQuery;
    //         } else {
    //             filters += searchQuery;
    //         }

    //         if (isRelatedQuery(queryType, recordId)){
    //             String relationshipname = getRelationshipfieldname();
                
            
    //             query += ' WHERE ' + relationshipname +'=\'' + recordId + '\' AND '+ filters+' ORDER BY ' + sortField + ' '+sortDirect+ ' LIMIT '+ limitRecords + ' OFFSET ' + offsetRecords;
    //             Squery+=' WHERE ' + relationshipname +'=\'' + recordId + '\' AND '+ filters;
    //         } else {
    //             query +=  filters+' ORDER BY ' + sortField + ' '+sortDirect+ ' LIMIT '+ limitRecords + ' OFFSET ' + offsetRecords;
    //             Squery+= filters;
    //         }
    //         response.maptoReturn.put('total',(Integer)returnTotal(Squery));
    //         response.maptoReturn.put('records',Database.query(query));
    //     }
    //     responseWrapper.lstDataTableRecs=response;
    //     return responseWrapper;
    // }
    
    /**
     * Boolean method to check type of query isReleated or not.
     */
    private static Boolean isRelatedQuery (String queryType, String recordId) {
        if (!String.isBlank(queryType) && queryType.equals(RelatedQueryName) && !String.isBlank(recordId)) {
            return true;
        }
        return false;
    }
}