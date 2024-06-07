#!/bin/bash

# run with
# chmod 755 *.sh
# ./package-all.sh

# Get the name of this script
script_name=$(basename "$0")

# Loop through all .sh files in the current directory
for file in *.sh; do
    # Skip the script itself
    if [ "$file" != "$script_name" ]; then
        # Make sure the file is executable
        # chmod +x "$file"
        # Execute the script
        ./"$file"
    fi
done
