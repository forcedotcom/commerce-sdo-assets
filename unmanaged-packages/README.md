# Generate Unmanaged Packages  

This folder contains some scripts to generate and publish unmanaged packages.  

https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_project_commands_unified.htm#cli_reference_project_convert_source_unified  

To generate the scripts, make sure that the `sh` files in the folder are enabled for execution:  
```sh
chmod 755 *.sh
```

Then run the following command to generate all the packages:  
```sh
./create-all.sh
```

You can also generate individual packages by running:  
```sh
./create-<name-of-the-package>.sh
```

The resulting packages are generated in the `bin` folder. Note that this folder is *not* checked in Git.
