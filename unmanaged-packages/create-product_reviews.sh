rm -rf bin/product_reviews.zip
sf project convert source --root-dir ../force-app/main/SDO_SCOM_PRODUCT_REVIEWS --output-dir bin/product_reviews
cd bin
zip -r product_reviews.zip product_reviews
cd ..
rm -rf bin/product_reviews
