# Setup Fortify on Demand Uploader

Build secure software fast with [Fortify](https://www.microfocus.com/en-us/solutions/application-security). This GitHub Action sets up the Fortify on Demand Uploader to integrate Static Application Security Testing (SAST) into your GitHub workflows. This action:
* Downloads and caches the specified version of the Fortify on Demand Uploader JAR file
* Adds the `FOD_UPLOAD_JAR` environment variable containing the full path to the Fortify on Demand Uploader JAR file

## Usage

FoD Uploader requires source code and dependencies to be packaged into a zip file. before invoking FoD Uploader, we recommend using the Fortify ScanCentral Client as illustrated in the following example workflow:

```yaml
name: FoD SAST scan                                     # Name of this workflow
on:
  push:                                                 # Perform Fortify SAST on push and/or pull requests
    branches:
      - master
  pull_request:
    branches:
      - master
jobs:                                                  
  build:
    runs-on: ubuntu-latest                              # Use the appropriate runner for building your source code

    steps:
      - uses: actions/checkout@v2                       # Check out source code
      - uses: actions/setup-java@v1                     # Set up Java 1.8; required by ScanCentral Client and FoD Uploader
        with:
          java-version: 1.8
      - uses: fortify/gha-setup-scancentral-client@v1   # Set up ScanCentral Client and add to system path
      - uses: fortify/gha-setup-fod-uploader@v1         # Set up FoD Uploader, set FOD_UPLOAD_JAR variable
      - run: scancentral package -bt mvn -o package.zip # Package source code using ScanCentral Client
      # Start Fortify on Demand SAST scan.
      - run: java -jar $FOD_UPLOAD_JAR -z package.zip -aurl https://api.ams.fortify.com/ -purl https://ams.fotify.com/ -rid "$FOD_RELEASE_ID" -tc "$FOD_TENANT" -uc "$FOD_USER" "$FOD_PAT" -ep 2 -pp 1
        env:                                            
          FOD_TENANT: ${{ secrets.FOD_TENANT }}
          FOD_USER: ${{ secrets.FOD_USER }}
          FOD_PAT: ${{ secrets.FOD_PAT }}
          FOD_RELEASE_ID: 250384  
      - uses: actions/upload-artifact@v2                # Archive ScanCentral logs for debugging purposes
        if: always()
        with:
          name: scancentral-logs
          path: ~/.fortify/scancentral/log
      - uses: actions/upload-artifact@v2                # Archive ScanCentral package for debugging purposes
        if: always()
        with:
          name: package
          path: package.zip
```

FoD Uploader is invoked using the `run` directive just like you would invoke the client from the command line or from a script. Please refer to the [FoD Uploader documentation](https://github.com/fod-dev/fod-uploader-java) for more information on configuration options.

Additional details on packaging code and dependencies with the ScanCentral client are available in the [Setup ScanCentral Client Action](https://github.com/fortify/gha-setup-scancentral-client) and the [ScanCentral documentation](https://www.microfocus.com/documentation/fortify-software-security-center/2010/ScanCentral_Help_20.1.0/index.htm#Submit_Job.htm%3FTocPath%3DSubmitting%2520Scan%2520Requests%7C_____0).

## Windows Runners
Note that the syntax is slightly different for Windows-based runners. In particular, environment variables 
in `run` steps are references as `$Env:var` instead of `$var` on Windows-based runners. As such, the command 
to invoke FoD Uploader would look like the following on Windows:

```
   - run: java -jar "$Env:FOD_UPLOAD_JAR" -z package.zip -aurl https://api.ams.fortify.com/ -purl https://ams.fotify.com/ -rid "$Env:FOD_RELEASE_ID" -tc "$Env:FOD_TENANT" -uc "$Env:FOD_USER" "$Env:FOD_PAT" -ep 2 -pp 1
```

Also note that ScanCentral logs are stored in a different location on Windows, so the upload-artifact step
would need to be adjusted accordingly if you wish to archive ScanCentral logs.

## Inputs

### `version`
**Required** The version of the Fortify Uploader to be set up. Default `latest`.

## Outputs

### `FOD_UPLOAD_JAR` environment variable
Specifies the location of the FoD Uploader JAR file

## Additional Considerations
* The environment variables in the example script can be modified to use API Key authentication instead of a Personal Access Tokens
* Be sure to consider the appropriate event triggers for your project and branching strategy
* .NET payloads must be packaged according to the Fortify on Demand guidelines as support for ScanCentral packaging is in development
* If you are not already a Fortify customer, check out our [Free Trial](https://www.microfocus.com/en-us/products/application-security-testing/free-trial)
