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

async function install(version) {
  const toolJar = await tc.downloadTool(getDownloadUrl(version));
  core.info('Successfully installed '+TOOL_NAME+" version "+version);
  return toolJar;
}

async function getCachedToolJar(version) {
  var cachedToolJar = tc.find(TOOL_NAME, version);
  if (!cachedToolJar) {
    cachedToolJar = await install(version);
	cachedToolJar = await tc.cacheFile(toolJar, TOOL_NAME+'.jar', TOOL_NAME, version);
  }
  return cachedToolJar;
}

async function getToolJar(version) {
  const skipCache = version==='latest';
  if ( skipCache ) {
	return await install(version);
  } else {
    return await getCachedToolJar(version);
  }
}

async function run() {
  try {
	core.startGroup('Setup FoDUploader');
	const version = core.getInput(INPUT_VERSION);
	const toolJar = await getToolJar(version);
    core.exportVariable('FOD_UPLOAD_JAR', toolJar);
	core.exportVariable('FOD_UPLOAD_CMD', 'java -jar '+toolJar);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

run();