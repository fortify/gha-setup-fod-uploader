import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

const INPUT_VERSION = 'version';
const TOOL_NAME = 'FoDUpload';

function getDownloadUrl(version: string): string {
  return version === 'latest'
    ? 'https://github.com/fod-dev/fod-uploader-java/releases/latest/download/FodUpload.jar'
    : 'https://github.com/fod-dev/fod-uploader-java/releases/download/' + version + '/FodUpload.jar';
}

function isSkipCache(version: string): boolean {
  return version === 'latest';
}

async function install(version: string): Promise<string> {
  const toolJar = await tc.downloadTool(getDownloadUrl(version));
  core.info('Successfully installed ' + TOOL_NAME + " version " + version);
  return toolJar;
}

async function installAndCache(version: string): Promise<string> {
  let toolJar = await install(version);
  if (!isSkipCache(version)) {
    toolJar = await tc.cacheFile(toolJar, TOOL_NAME + '.jar', TOOL_NAME, version);
  }
  return toolJar;
}

async function getToolJar(version: string): Promise<string> {
  let cachedToolJar = isSkipCache(version) ? null : tc.find(TOOL_NAME, version);
  if (!cachedToolJar) {
    cachedToolJar = await installAndCache(version);
  }
  return cachedToolJar;
}

async function main(): Promise<void> {
  try {
    core.startGroup('Setup FoDUploader');
    const version = core.getInput(INPUT_VERSION);
    const toolJar = await getToolJar(version);
    core.exportVariable('FOD_UPLOAD_JAR', toolJar);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

main();
