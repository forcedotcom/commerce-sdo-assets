
public with sharing class Sdo_Scom_Order_Grid_Wrapper{
    @AuraEnabled
    public List<OrderProductWrapper> orderProducts{get;set;}

    @AuraEnabled
    public String webstoreId{get;set;}
}