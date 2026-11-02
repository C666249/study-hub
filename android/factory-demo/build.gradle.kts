plugins { id("com.android.application") }
android {
    namespace = "io.github.c666249.appfactory.preview"
    compileSdk = 35
    defaultConfig {
        applicationId = "io.github.c666249.appfactory.preview"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "0.1.1"
    }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
