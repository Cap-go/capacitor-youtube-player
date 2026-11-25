// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapgoCapacitorYoutubePlayer",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapgoCapacitorYoutubePlayer",
            targets: ["YoutubePlayerPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/webview-native-ui/engine.git", exact: "1.0.11")
    ],
    targets: [
        .target(
            name: "YoutubePlayerPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "WebViewNativeUIEngine", package: "engine")
            ],
            path: "ios/Sources/YoutubePlayerPlugin"),
        .testTarget(
            name: "YoutubePlayerPluginTests",
            dependencies: ["YoutubePlayerPlugin"],
            path: "ios/Tests/YoutubePlayerPluginTests")
    ]
)
