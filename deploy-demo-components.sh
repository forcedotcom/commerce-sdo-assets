#!/bin/bash

# Define the root directory
ROOT_DIR=$(pwd)

# Navigate to the force-app/main directory
cd "force-app/main" || exit

# Loop through each subfolder in the force-app/main directory
for DIR in */; do
    # Remove trailing slash from DIR name
    DIR_NAME=${DIR%/}

    # Create the new directory structure peer to the root directory
    TARGET_ROOT="$ROOT_DIR/../github/$DIR_NAME"
    TARGET_DIR="$TARGET_ROOT/force-app/main/default"

    if [ -d $TARGET_DIR ]; then
        rm -rf $TARGET_DIR
    else
        mkdir -p $TARGET_DIR
    fi

    # Copy the content of the current subfolder to the new directory
    cp -R "$DIR_NAME/"* $TARGET_DIR
    if [ -d $DIR_NAME/README.md ]; then
        cp -R "$DIR_NAME/README.md" $TARGET_ROOT
    fi

    # Create or refresh the other files
    cp "$ROOT_DIR/CODE_OF_CONDUCT.md" $TARGET_ROOT
    cp "$ROOT_DIR/CODEOWNERS" $TARGET_ROOT
    cp "$ROOT_DIR/CONTRIBUTING.md" $TARGET_ROOT
    cp "$ROOT_DIR/license_info.md" $TARGET_ROOT
    cp "$ROOT_DIR/LICENSE.txt" $TARGET_ROOT
    cp "$ROOT_DIR/SECURITY.md" $TARGET_ROOT
    cp "$ROOT_DIR/sfdx-project.json" $TARGET_ROOT

    cp -R "$ROOT_DIR/config" $TARGET_ROOT
    cp -R "$ROOT_DIR/manifest" $TARGET_ROOT

done

# Return to the original root directory
cd ../../..
