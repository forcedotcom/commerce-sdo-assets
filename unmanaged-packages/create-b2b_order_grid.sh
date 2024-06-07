#!/bin/bash
SOURCE=SDO_SCOM_B2B_ORDER_GRID
TARGET=b2b_order_grid

source ./make-package.sh
make_package $SOURCE $TARGET
