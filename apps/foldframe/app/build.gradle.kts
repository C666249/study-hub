plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "dev.foldframe.atelier"
    compileSdk = 35

    defaultConfig {
        applicationId = "dev.foldframe.atelier"
        minSdk = 29
        targetSdk = 35
        versionCode = 2
        versionName = "0.1.1-beta"
    }
    // MagicOS compatibility: AGP may omit v1 signing on minSdk 24+ builds.
    // Keep all supported APK signing schemes and fail CI if verification fails.
    signingConfigs {
        getByName("debug") {
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
    }
    buildTypes {
        getByName("debug") { signingConfig = signingConfigs.getByName("debug") }
        getByName("release") { isMinifyEnabled = false }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
    packaging { resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" } }
}


dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.04.01"))
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.animation:animation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("io.coil-kt:coil-compose:2.7.0")
    // Haze v1.6.10: Kotlin 2.1 compatible source-backed native blur.
    implementation("dev.chrisbanes.haze:haze:1.6.10")
    implementation("dev.chrisbanes.haze:haze-materials:1.6.10")
    // Backdrop liquid glass: optional optical layer; experimental integration behind flag.
    // Kotlin 2.4 metadata of backdrop 2.0.1 requires newer compiler than baseline.
    // For reliable first build, optical refraction implemented in isolation after toolchain upgrade.
    debugImplementation("androidx.compose.ui:ui-tooling")
}
