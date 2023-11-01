# Deprecation Notice

This GitHub Action has been deprecated and will no longer be maintained as of December 31st, 2023. Similar functionality is now available through the consolidated [fortify/github-action](https://github.com/marketplace/actions/fortify-ast-scan) and its sub-actions; please update your GitHub workflows to use these actions instead.

# Setup Fortify on Demand Uploader

Build secure software fast with [Fortify](https://www.microfocus.com/en-us/solutions/application-security). Fortify offers end-to-end application security solutions with the flexibility of testing on-premises and on-demand to scale and cover the entire software development lifecycle.  With Fortify, find security issues early and fix at the speed of DevOps. This GitHub Action sets up the Fortify on Demand (FoD) Uploader - also referred to as the FoD Universal CI Tool - to integrate Static Application Security Testing (SAST) into your GitHub workflows. This action:
* Downloads and caches the specified version of the Fortify on Demand Uploader JAR file
* Adds the `FOD_UPLOAD_JAR` environment variable containing the full path to the Fortify on Demand Uploader JAR file

## Usage

FoD Uploader requires source code and dependencies to be packaged into a zip file. We recommend using the [Fortify ScanCentral Client](https://github.com/marketplace/actions/fortify-scancentral-scan) to perform the packaging before invoking FoD Uploader, as illustrated in the following example workflow:

```yaml
name: Fortify on Demand SAST Scan

on: 
  workflow_dispatch:
  push:
    branches: [master]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: [master]
    
  FoD-SAST-Scan:
    # Use the appropriate runner for building your source code. 
    # Use Windows runner for projects that use msbuild. Additional changes to RUN commands will be required.
    runs-on: ubuntu-latest

    steps:
      # Check out source code
      - name: Check Out Source Code
        uses: actions/checkout@v2
        with:
          # Fetch at least the immediate parents so that if this is a pull request then we can checkout the head.
          fetch-depth: 2
      # If this run was triggered by a pull request event, then checkout the head of the pull request instead of the merge commit.
      - run: git checkout HEAD^2
        if: ${{ github.event_name == 'pull_request' }}      

      # Java is required to run ScanCentral Client, and may be required for your build
      # Java version to use depends on the Java version required to run your build (if any),
      # and the Java version supported by the ScanCentral Client version that you are running
      - name: Setup Java
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      
      # Prepare source+dependencies for upload. 
      # Update PACKAGE_OPTS based on the ScanCentral Client documentation and your project's included tech stack(s).
      #   ScanCentral Client will download dependencies for maven, gradle and msbuild projects.
      #   For other build tools, add your build commands to the workflow to download necessary dependencies and prepare according to Fortify on Demand Packaging documentation.
      - name: Download Fortify ScanCentral Client
        uses: fortify/gha-setup-scancentral-client@v1
      - name: Package Code + Dependencies
        run: scancentral package $PACKAGE_OPTS -o package.zip
        env:
          PACKAGE_OPTS: "-bt mvn"
      
      # Start Fortify on Demand SAST scan. Be sure to set secrets/variables for your desired configuration.
      - name: Download Fortify on Demand Universal CI Tool
        uses: fortify/gha-setup-fod-uploader@v1
      - name: Perform SAST Scan
        run: java -jar $FOD_UPLOAD_JAR -z package.zip -aurl $FOD_API_URL -purl $FOD_URL -rid "$FOD_RELEASE_ID" -tc "$FOD_TENANT" -uc "$FOD_USER" "$FOD_PAT" $FOD_UPLOADER_OPTS -n "$FOD_UPLOADER_NOTES"
        env: 
          FOD_TENANT: ${{ secrets.FOD_TENANT }}  
          FOD_USER: ${{ secrets.FOD_USER }}
          FOD_PAT: ${{ secrets.FOD_PAT }}
          FOD_RELEASE_ID: ${{ secrets.FOD_RELEASE_ID }}
          FOD_URL: "https://ams.fortify.com/"
          FOD_API_URL: "https://api.ams.fortify.com/"
          FOD_UPLOADER_OPTS: "-ep 2 -pp 0"
          FOD_UPLOADER_NOTES: 'Triggered by GitHub Actions (${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})'
```

This example workflow demonstrates the use of the `fortify/gha-setup-scancentral-client` and `fortify/gha-setup-fod-uploader` actions to set up ScanCentral Client and FoD Uploader respectively, and then invoking these utilities similar to how you would manually run these commands from a command line. Configure the environment variables according to your needs. All potentially sensitive data should be stored in the GitHub secrets storage.

Please see the following resources for more information:

* [FoD Uploader documentation](https://github.com/fod-dev/fod-uploader-java)
* [ScanCentral documentation¹](https://www.microfocus.com/documentation/fortify-software-security-center/2010/ScanCentral_Help_20.1.0/index.htm#CLI.htm%3FTocPath%3DFortify%2520ScanCentral%2520Command%2520Options%7C_____0)  
* [GitHub Action to set up ScanCentral Client](https://github.com/fortify/gha-setup-scancentral-client)
* [GitHub Workflow documentation](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow)
* Sample workflows:
    * [EightBall](https://github.com/fortify/gha-sample-workflows-eightball/tree/master/.github/workflows)
	* [SSC JS SandBox](https://github.com/fortify/gha-sample-workflows-ssc-js-sandbox/tree/master/.github/workflows)


¹ Note that in combination with FoD Uploader, *only* the ScanCentral `Package` command is relevant. Other ScanCentral commands are not used in combination with FoD Uploader, and none of the other ScanCentral components like ScanCentral Controller or ScanCentral Sensor are used when submitting scans to FoD.

### Considerations

* Be sure to consider the appropriate event triggers in your workflows, based on your project and branching strategy.
* The command line arguments utilize job environment variables to simplify inputs that should be configured.
    * Use of GitHub Secrets for credential management are strongly recommended.
    * Personal Access Tokens require the `api-tenant` scope to invoke FoDUploader.  
    * Client credentials can be used in place of Personal Access Tokens and require the `Start Scans` (or higher) role.
* If you choose to use the polling option when invoking FoDUploader to wait for scan completion:
    * The FoD release should be configured for automated audit.
    * Consider the typical scan turnaround time for the project. Many project can be scanned in a matter of minutes once onboarded, but scan time is dependent on application size/complexity.
    * Recommended polling interval is 1 minute.
    * Use the -allowPolicyFail/apf option if you do **not** want to "break the build" when the scan results in the release failing the assigned Security Policy in FoD.
    * Example configuration: `FOD_UPLOADER_OPTS: "-ep 2 -pp 0 -I 1 -apf"`
* .NET applications that utilize msbuild need to use a Windows runner. Windows-based runners use different syntax and different file locations. In particular:
    * Environment variables are referenced as `$Env:var` instead of `$var`, for example `"$Env:FOD_UPLOAD_JAR"` instead of `$FOD_UPLOAD_JAR`
    * ScanCentral logs are stored in a different location, so the upload-artifact step would need to be adjusted accordingly if you wish to archive ScanCentral logs
* If you are not already a Fortify customer, check out our [Free Trial](https://www.microfocus.com/en-us/products/application-security-testing/free-trial)


## Inputs

### `version`
**Required** The version of the Fortify Uploader to be set up. Default is `latest` if not specified in the workflow. See [FoD Uploader Releases](https://github.com/fod-dev/fod-uploader-java/releases) for a list of available versions.

## Outputs

### `FOD_UPLOAD_JAR` environment variable
Specifies the location of the FoD Uploader JAR file


## Information for Developers

All commits to the `main` or `master` branch should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) convention. In particular, commits using the `feat: Some feature` and `fix: Some fix` convention are used to automatically manage version numbers and for updating the [CHANGELOG.md](https://github.com/fortify/gha-setup-fod-uploader/blob/master/CHANGELOG.md) file.

Whenever changes are pushed to the `main` or `master` branch, the [`.github/workflows/publish-release.yml`](https://github.com/fortify/gha-setup-fod-uploader/blob/master/.github/workflows/publish-release.yml) workflow will be triggered. If there have been any commits with the `feat:` or `fix:` prefixes, the [`release-please-action`](https://github.com/google-github-actions/release-please-action) will generate a pull request with the appropriate changes to the CHANGELOG.md file and version number in `package.json`. If there is already an existing pull request, based on earlier feature or fix commits, the pull request will be updated.

Once the pull request is accepted, the `release-please-action` will publish the new release to the GitHub Releases page and tag it with the appropriate `v{major}.{minor}.{patch}` tag. The two `richardsimko/update-tag` action instances referenced in the `publish-release.yml` workflow will create or update the appropriate `v{major}.{minor}` and `v{major}` tags, allowing users to reference the action by major, minor or patch version.
