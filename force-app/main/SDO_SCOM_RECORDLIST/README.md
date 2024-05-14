# lwc-reusable-assets
#  Reusable Asset - Dynamic Record List Admin Guide

Overview

Record lists in Salesforce offer a compact view of a record. There are different types of related lists but even the most advanced come with some limitations.

# Who is impacted?  
    * Agents are impacted who wish to look up specific information in the record. Also, for enterprise customers dealing with multiple business models, not all fields that are relevant to them are exposed while for some not all fields exposed to them are relevant.

# How does this tool help?
    * This reusable tool helps plug in these gaps and much more.
        * No limit to the number of rows that can be displayed both on desktop.
        * Query Type (Property) : Admin can choose a following option 
            1. Enity List -> Get list of Objects
            2. Related List -> Get list of related objects for a given field.
            3. List View -> Get all the records of the specified list view.
        * Entity (Property): sObject API name which is required for all the Query Type.
        * Related List Record Id (Property) : Parent object id. Should be specifed when Related List is selected.
        * List View API Name (Property) : List view Api name should only be specified when List View is selected.
        * Fields to display (Property) : Ability to choose what fields to be displayed as a user preference without impacting anyone else. This property should be always specified when Query Type is Enity List or Releated List.
        * Filters to add (Property): Ability to define and apply the filters, should only be specified when Enity List and Related List is selected.
        * Gives the ability for admin to choose whether to give end-users the ability to Add, Edit/Delete the records.
        * UX consistent with lightning experience on  desktop.
        * This component is built completely using lighning - datatable.
        * Up to second level Parent Record Fields can be shown on the table. For instance here in this table Related Account and Account’s owner info is shown.
        * Supports all types of fields including images, Currency, datetime.

# What is the cost associated with the tool (Performance, heavy custom, maintenance, etc.)
    * The tool utilizes the lightning web component along with apex code. This tool is tested against various network speeds and under conditions mentioned herein.

# Required editions and user permission

    * Available in: Lightning Experience
    * No special permission needed
        
# Initial Setup
    1. Just publish the component using SFDX commands. Ex : 
        sfdx force:source:deploy -u your@email.com -p force-app/main/SDO_SCOM_RECORDLIST
    2. Make sure the user logging into expereince site have access to following apex class. You can provide the access by (Users > {user name} > SDO-Customer Community Plus Profile > APEX Class Access > Click Edit > View = S > Select each of the class > SAVE)
        a. Sdo_scom_recordlist_controller
        b. Sdo_scom_recordlist_datatable_response
        c. Sdo_scom_recordlist_generic_datautility
        d. Sdo_scom_recordlist_lightning_response
        e. Sdo_scom_recordlist_remote_response
        f. Sdo_scom_recordlist_wrapper_controller

# Debug
    1. We do not show error messages instead we log the error messages in the console.
    2. So look for the error message starting with *SDO Record List Caught Error : * to debug further.

# Limitations
    1. Currently we need to manually enter the Object Name, Fields Name.



