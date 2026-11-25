require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'CapgoCapacitorYoutubePlayer'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  # WebViewNativeUIEngine is not on the CocoaPods trunk. CocoaPods apps must add
  # pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
  # in the app target (see README). iOS SPM consumers resolve the engine via Package.swift.
  s.swift_version = '5.1'
end
