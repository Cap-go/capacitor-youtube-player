// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapgoCapacitorYoutubePlayer",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapgoCapacitorYoutubePlayer",
            targets: ["YoutubePlayerPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        .package(url: "https://github.com/rinov/YoutubeKit.git", from: "0.5.1")
    ],
    targets: [
        .target(
            name: "YoutubePlayerPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "YoutubeKit", package: "YoutubeKit")
            ],
            path: "ios/Sources/YoutubePlayerPlugin"),
        .testTarget(
            name: "YoutubePlayerPluginTests",
            dependencies: ["YoutubePlayerPlugin"],
            path: "ios/Tests/YoutubePlayerPluginTests")
    ]
)
