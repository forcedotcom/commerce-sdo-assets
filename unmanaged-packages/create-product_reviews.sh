#!/bin/bash
SOURCE=SDO_SCOM_PRODUCT_REVIEWS
TARGET=product_reviews

source ./make-package.sh
make_package $SOURCE $TARGET
