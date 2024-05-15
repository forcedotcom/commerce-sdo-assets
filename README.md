# Demo Components for Solution Engineers  

## Overview  

This repository contains a collection of demo components developed by the solution engineers at Salesforce. These components are designed to showcase various features and capabilities, demonstrating how they can be implemented in different scenarios. They serve as illustrative examples and are intended for educational purposes.  


## Disclaimer  

These demo components are provided for demonstration purposes only and are not intended for production use. They are meant to serve as starting points for custom development and to inspire innovative solutions. While these demos can demonstrate key features and implementation strategies, they may not cover all aspects of security, performance, or scalability that a production environment would require.  


## Usage  

These components can be utilized by developers, solution architects, and other stakeholders to understand the implementation of specific features. They are also excellent resources for training and development sessions.  

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/forcedotcom/commerce-sdo-assets.git
   ```  
  Each feature is located in its own folder under `/force-app/main`, using a strict naming convention internalluy required by Salesforce processes.   
  - Each feature folder is named like `/force-app/mainSDO_SCOM_<featurename>`.  
  - Each asset in a folder, like LWC component or Apex classes, start with scom_sdo.  

2. Navigate to the component directory you wish to explore!  

3. Please follow the specific instructions provided in the feature's subdirectory for setup and execution.  


## Generating Unamanged Packages

The easiest way to deploy a feature is to generate an unmanaged package and deploy it using Workbench. To generate
the unmanaged packages using the CLI, go to the `unmanaged-packages` subdirectory and run the corresponding `.sh`, like `./create-recordlist.sh` (only tested on Mac). Make sure that the files are executable by running `chmod 755 *.sh` within that folder. `./create-all.sh` is also an automation for generating all the packages.  

The result packages are located in `unmanaged-packages/bin`. Note that this folder is not checked-in Git.


## Contributing  

We welcome contributions from the community! If you have improvements or bug fixes, please feel free to fork the repository and submit a pull request. For more detailed information, see the CONTRIBUTING.md file.  


## License
These demo components are released under the Apache 2.0 License. See the LICENSE file for more details.  


## Support  

These components are provided "as is", with no official support from Salesforce. However, feel free to submit fixes or additional features.  
