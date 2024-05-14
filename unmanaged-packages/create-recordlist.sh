rm -rf bin/recordlist.zip
sf project convert source --root-dir ../force-app/main/SDO_SCOM_RECORDLIST --output-dir bin/recordlist
cd bin
zip -r recordlist.zip recordlist
cd ..
rm -rf bin/recordlist
