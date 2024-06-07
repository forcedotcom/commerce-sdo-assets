#!/bin/bash
SOURCE=SDO_SCOM_RECORDLIST
TARGET=recordlist

source ./make-package.sh
make_package $SOURCE $TARGET
