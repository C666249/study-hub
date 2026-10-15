plugins {
    id("com.android.application")
}

val stableSigned = listOf(
    "REWARDER_KEYSTORE_PATH", "REWARDER_STORE_PASSWORD",
    "REWARDER_KEY_ALIAS", "REWARDER_KEY_PASSWORD"
).all { !System.getenv(it).isNullOrBlank() }

android {
    namespace = "io.github.c666249.rewarder"
    compileSdk = 35
    defaultConfig {
        applicationId = "io.github.c666249.rewarder"
        minSdk = 26
        targetSdk = 34
        versionCode = 3
        versionName = "1.2.0"
    }
    if (stableSigned) {
        signingConfigs {
            create("longTerm") {
                storeFile = file(System.getenv("REWARDER_KEYSTORE_PATH"))
                storePassword = System.getenv("REWARDER_STORE_PASSWORD")
                keyAlias = System.getenv("REWARDER_KEY_ALIAS")
                keyPassword = System.getenv("REWARDER_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (stableSigned) signingConfig = signingConfigs.getByName("longTerm")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
