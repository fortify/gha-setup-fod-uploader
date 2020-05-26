const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const path = require('path');

const INPUT_VERSION = 'version';
const TOOL_NAME = 'FoDUpload';

function getDownloadUrl(version) {
	return version==='latest' 
	  ? 'https://github.com/fod-dev/fod-uploader-java/releases/latest/download/FodUpload.jar'
	  : 'https://github.com/fod-dev/fod-uploader-java/releases/download/'+version+'/FodUpload.jar';
}

async function download(url) {
  core.debug("Downloading "+url);
  const toolJar = await tc.downloadTool(url);
  return toolJar;
}

async function installAndCache(version) {
  const toolJar = await download(getDownloadUrl(version));
  const cachedToolJar = await tc.cacheFile(toolJar, TOOL_NAME, version);
  return cachedToolJar;
}

async function getCachedToolJar(version) {
  var cachedToolJar = version==='latest' ? null : tc.find(TOOL_NAME, version);
  if (!cachedToolJar) {
    cachedToolJar = await installAndCache(version);
    core.info('Successfully installed '+TOOL_NAME+" version "+version);
  }
  return cachedToolJar;
}

async function run() {
  try {
	core.startGroup('Setup FoDUploader');
	const version = core.getInput(INPUT_VERSION);
	const toolJar = await getCachedToolJar(version);
    core.exportVariable('FOD_UPLOAD_JAR', toolJar);
	core.exportVariable('FOD_UPLOAD_CMD', 'java -jar '+toolJar);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

run();