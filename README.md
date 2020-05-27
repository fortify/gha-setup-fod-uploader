# Setup Fortify on Demand Uploader

This GitHub Action sets up the Fortify on Demand Uploader for use in your GitHub workflows:
* Downloads and caches the specified version of the Fortify on Demand Uploader JAR file
* Adds the `FOD_UPLOAD_JAR` environment variable containing the full path to the Fortify on Demand Uploader JAR file

## Usage

```yaml
steps:
- uses: actions/setup-java@v1                 # Set up Java
  with:
    java-version: 1.8
- uses: fortify-actions/setup-fod-uploader@v1 # Set up FoD Uploader
  with:
    version: latest                           # Optional as 'latest' is the default
- env:
    FOD_BSI: ${{ secrets.FOD_BSI }}
    FOD_USER: ${{ secrets.FOD_USER }}
    FOD_PWD: ${{ secrets.FOD_PWD }}
  run: |
    # To-Do: Add steps to generate zip file to be uploaded to FoD
    java -jar $FOD_UPLOAD_JAR -bsi "$FOD_BSI" -z sample.zip -uc "$FOD_USER" "$FOD_PWD" -ep 2 -pp 1
```

As can be seen in this example, the FoD Uploader can simply be invoked by running `java -jar $FOD_UPLOAD_JAR`. The BSI, user and password (or Personal Access Token) are being passed in to the command via secret environment variables.

The most common approach for packaging source code into a zip file that can be uploaded to FoD is by utilizing Fortify ScanCentral Client. This scenario is described in more detail at https://github.com/fortify-actions/setup-scancentral-client#submit-scan-requests-to-fortify-on-demand.

## Inputs

### `version`
**Required** The version of the Fortify Uploader to be set up. Default `latest`.
