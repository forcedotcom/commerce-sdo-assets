#!/bin/bash
SOURCE=SDO_SCOM_TNC_ACKNOWLEDGEMENT
TARGET=tnc_acknowledgment

source ./make-package.sh
make_package $SOURCE $TARGET
