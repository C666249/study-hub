plugins {
    id("com.android.application")
}
android {
    namespace = "io.github.c666249.rewarder"
    compileSdk = 35
    defaultConfig {
        applicationId = "io.github.c666249.rewarder"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
