allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://repo.repsy.io/mvn/payhere/payhere-mobilesdk-android/") }
        maven { url = uri("https://jitpack.io") }
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)

    // ✅ FIX: Force all subprojects to use Maven Central instead of JCenter
    buildscript {
        repositories {
            google()
            mavenCentral()
            // Add the PayHere repository here as well, for extra safety
            maven { url = uri("https://repo.repsy.io/mvn/payhere/payhere-mobilesdk-android/") }
            maven { url = uri("https://jitpack.io") }
        }
    }

    // Also apply it to the regular repositories block
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://repo.repsy.io/mvn/payhere/payhere-mobilesdk-android/") }
        maven { url = uri("https://jitpack.io") }
    }
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}