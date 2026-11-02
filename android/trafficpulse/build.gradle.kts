plugins { id("com.android.application") }
android {
 namespace = "io.github.c666249.trafficpulse"
 compileSdk = 35
 defaultConfig {
  applicationId = "io.github.c666249.pulseflow"
  minSdk = 26
  targetSdk = 35
  versionCode = 4
  versionName = "0.3.1"
 }
 buildTypes { release { isMinifyEnabled = false } }
 compileOptions {
  sourceCompatibility = JavaVersion.VERSION_17
  targetCompatibility = JavaVersion.VERSION_17
 }
}
