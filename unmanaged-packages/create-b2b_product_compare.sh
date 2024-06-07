#!/bin/bash
SOURCE=SDO_SCOM_B2B_PRODUCT_COMPARE
TARGET=b2b_product_compare

source ./make-package.sh
make_package $SOURCE $TARGET
