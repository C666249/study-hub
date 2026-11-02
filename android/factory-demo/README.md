# App Factory · public build proof

This is a **small, original, independently written public Android demonstration**. It does **not** include, repackage or expose private personal-app-stack / FMV code. The actual FMV source resolver and source-identity tests are in the private repository branch `feature/app-factory-v1`. These two demos are separate verification targets.

App ID: io.github.c666249.appfactory.preview, versionCode 1.
Source: this isolated `factory/demo-v01` branch, without touching study-hub master or existing live web pages.
CI: `.github/workflows/app-factory-public-preview.yml` builds the Android debug APK and publishes it as a public GitHub prerelease. Debug key is ephemeral; uninstall before installing a later signed version.
Supported interactions: 420-ms switch indicator, swipe-to-remove proof of concept, toast diagnostics. This prototype is *not* the original FlowLedger FMV implementation and not Stable.
