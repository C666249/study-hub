const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(projectRoot, 'android');

function read(relativePath) {
  return fs.readFileSync(path.join(androidRoot, relativePath), 'utf8');
}

test('Android app uses a unique permanent application id', () => {
  const buildFile = read('app/build.gradle.kts');
  assert.match(buildFile, /applicationId\s*=\s*"io\.github\.c666249\.studyhub"/);
  assert.doesNotMatch(buildFile, /com\.studyhub\.app/);
});

test('Android app loads the deployed Study Hub over HTTPS', () => {
  const activity = read(
    'app/src/main/java/io/github/c666249/studyhub/MainActivity.kt'
  );
  assert.match(activity, /https:\/\/c666249\.github\.io\/study-hub\//);
  assert.match(activity, /javaScriptEnabled\s*=\s*true/);
  assert.match(activity, /domStorageEnabled\s*=\s*true/);
});

test('Android app keeps Study Hub navigation in-app and external links outside', () => {
  const activity = read(
    'app/src/main/java/io/github/c666249/studyhub/MainActivity.kt'
  );
  assert.match(activity, /isStudyHubUrl/);
  assert.match(activity, /Intent\.ACTION_VIEW/);
});

test('Android app declares internet access and an exported launcher activity', () => {
  const manifest = read('app/src/main/AndroidManifest.xml');
  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.match(manifest, /android:exported="true"/);
  assert.match(manifest, /android\.intent\.category\.LAUNCHER/);
});

test('Android app has an offline fallback and browser back navigation', () => {
  const activity = read(
    'app/src/main/java/io/github/c666249/studyhub/MainActivity.kt'
  );
  assert.match(activity, /offline\.html/);
  assert.match(activity, /webView\.canGoBack\(\)/);
  assert.ok(fs.existsSync(path.join(androidRoot, 'app/src/main/assets/offline.html')));
});
