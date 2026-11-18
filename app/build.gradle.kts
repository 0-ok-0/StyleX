plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.strelizia.launcher"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.strelizia.launcher"
        minSdk = 26
        targetSdk = 33
        versionCode = 6
        versionName = "1.4.1"
    }

    // Один и тот же ключ для всех сборок: новые APK ставятся поверх старых без потери настроек.
    signingConfigs {
        create("strelizia") {
            storeFile = file("strelizia.p12")
            storeType = "pkcs12"
            storePassword = "strelizia09"
            keyAlias = "strelizia"
            keyPassword = "strelizia09"
        }
    }

    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("strelizia")
        }
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("strelizia")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    lint {
        abortOnError = false
        checkReleaseBuilds = false
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.webkit:webkit:1.12.1")
}
