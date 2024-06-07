#!/bin/bash

make_package() {
    local SOURCE="$1"
    local TARGET="$2"

    rm -rf bin/$TARGET.zip
    sf project convert source --root-dir ../force-app/main/$SOURCE --output-dir bin/$TARGET
    cd bin
    zip -q -r $TARGET.zip $TARGET
    cd ..
    rm -rf bin/$TARGET
}
