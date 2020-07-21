# Setup Fortify on Demand Uploader

This GitHub Action sets up the Fortify on Demand Uploader for use in your GitHub workflows:
* Downloads and caches the specified version of the Fortify on Demand Uploader JAR file
* Adds the `FOD_UPLOAD_JAR` environment variable containing the full path to the Fortify on Demand Uploader JAR file

## Usage

FoD Uploader requires source code and dependencies to be packaged into a zip file. A common approach for 
packaging source code and dependencies is to utilize Fortify ScanCentral Client, as illustrated in the
following example workflow:

```yaml
name: Start FoD scan                                    # Name of this workflow
on: [workflow_dispatch]                                 # Triggers for this workflow; we choose to invoke manually
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
      - run: java -jar $FOD_UPLOAD_JAR -z package.zip -aurl https://api.ams.fortify.com/ -purl https://ams.fotify.com/ -rid "$FOD_RELEASE_ID" -tc "$FOD_TENANT" -uc "$FOD_USER" "$FOD_PAT" -ep 2 -pp 1
        env:                                            # Upload package to FoD for scanning
          FOD_TENANT: FortifyPS  
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
