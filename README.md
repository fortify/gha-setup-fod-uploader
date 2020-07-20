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
- uses: fortify/gha-setup-fod-uploader@v1     # Set up FoD Uploader
  with:
    version: latest                           # Optional as 'latest' is the default
- env:
    FOD_BSI: ${{ secrets.FOD_BSI }}           # Get FoD BSI from GitHub Secrets
    FOD_USER: ${{ secrets.FOD_USER }}         # Get FoD User from GitHub Secrets
    FOD_PWD: ${{ secrets.FOD_PWD }}           # Get FoD Password (or Personal Access Token) from GitHub Secrets
  run: |
    # To-Do: Add steps to generate zip file to be uploaded to FoD
    java -jar $FOD_UPLOAD_JAR -bsi "$FOD_BSI" -z sample.zip -uc "$FOD_USER" "$FOD_PWD" -ep 2 -pp 1
```

As can be seen in this example, the FoD Uploader can simply be invoked by running `java -jar $FOD_UPLOAD_JAR`. The BSI, user and password (or Personal Access Token) are being passed in to the command via secret environment variables. Obviously, a similar approach could be used to configure API credentails instead of user credentials.

The most common approach for packaging source code before invoking FoD Uploader is by utilizing Fortify ScanCentral Client. This scenario is described in more detail at https://github.com/fortify/gha-setup-scancentral-client#submit-scan-requests-to-fortify-on-demand.

## Inputs

### `version`
**Required** The version of the Fortify Uploader to be set up. Default `latest`.

## Outputs

### `FOD_UPLOAD_JAR` environment variable
Specifies the location of the FoD Uploader JAR file
