import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const PATCH_MARKER = 'CAPGO_YOUTUBE_REFERER_PATCH';
const SUPPORTED_CAPACITOR_MAJOR = '8.';
const DEFAULT_REFERER = 'https://www.youtube.com';

const IOS_PACKAGE_JSON = path.join('node_modules', '@capacitor', 'ios', 'package.json');
const ANDROID_PACKAGE_JSON = path.join('node_modules', '@capacitor', 'android', 'package.json');

const IOS_HTTP_REQUEST_HANDLER = path.join(
  'node_modules',
  '@capacitor',
  'ios',
  'Capacitor',
  'Capacitor',
  'Plugins',
  'HttpRequestHandler.swift',
);
const IOS_WEBVIEW_ASSET_HANDLER = path.join(
  'node_modules',
  '@capacitor',
  'ios',
  'Capacitor',
  'Capacitor',
  'WebViewAssetHandler.swift',
);
const IOS_BRIDGE_VIEW_CONTROLLER = path.join(
  'node_modules',
  '@capacitor',
  'ios',
  'Capacitor',
  'Capacitor',
  'CAPBridgeViewController.swift',
);

const ANDROID_HTTP_REQUEST_HANDLER = path.join(
  'node_modules',
  '@capacitor',
  'android',
  'capacitor',
  'src',
  'main',
  'java',
  'com',
  'getcapacitor',
  'plugin',
  'util',
  'HttpRequestHandler.java',
);
const ANDROID_WEBVIEW_LOCAL_SERVER = path.join(
  'node_modules',
  '@capacitor',
  'android',
  'capacitor',
  'src',
  'main',
  'java',
  'com',
  'getcapacitor',
  'WebViewLocalServer.java',
);

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeText(file, content) {
  fs.writeFileSync(file, content);
}

function fileExists(file) {
  return fs.existsSync(file);
}

function readJSON(file) {
  return JSON.parse(readText(file));
}

function parseCapacitorConfig(rawValue) {
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    throw new Error(`Unable to parse CAPACITOR_CONFIG: ${error.message}`);
  }
}

function getPatchConfig(config) {
  const pluginConfig = config?.plugins?.YoutubePlayer ?? {};

  return {
    enabled: pluginConfig.patchRefererHeader === true,
    refererHeader: typeof pluginConfig.refererHeader === 'string' ? pluginConfig.refererHeader : DEFAULT_REFERER,
  };
}

function replaceOnce(content, searchValue, replacementValue, label) {
  if (!content.includes(searchValue)) {
    throw new Error(`Unable to apply patch: missing expected snippet for ${label}`);
  }

  return content.replace(searchValue, replacementValue);
}

function ensureSupportedCapacitorVersion(rootDir, packageJsonPath) {
  const file = path.join(rootDir, packageJsonPath);
  if (!fileExists(file)) {
    throw new Error(`Unable to find ${packageJsonPath}. Install Capacitor before running sync/update.`);
  }

  const { version } = readJSON(file);
  if (typeof version !== 'string' || !version.startsWith(SUPPORTED_CAPACITOR_MAJOR)) {
    throw new Error(
      `Unsupported Capacitor package version "${version}" in ${packageJsonPath}. This patch currently supports Capacitor 8.x only.`,
    );
  }
}

function isAlreadyPatched(rootDir) {
  return [IOS_HTTP_REQUEST_HANDLER, IOS_WEBVIEW_ASSET_HANDLER, IOS_BRIDGE_VIEW_CONTROLLER, ANDROID_HTTP_REQUEST_HANDLER, ANDROID_WEBVIEW_LOCAL_SERVER]
    .map((relativePath) => path.join(rootDir, relativePath))
    .filter(fileExists)
    .some((file) => readText(file).includes(PATCH_MARKER));
}

function patchIosHttpRequestHandler(content) {
  if (content.includes(PATCH_MARKER)) {
    return content;
  }

  const helperAnchor = `private func lowerCaseHeaderDictionary(_ headers: [AnyHashable: Any]) -> [String: Any] {
    // Lowercases the key of the headers dictionary.
    return Dictionary(uniqueKeysWithValues: headers.map({ (key: AnyHashable, value: Any) in
        return (String(describing: key).lowercased(), value)
    }))
}
`;

  const helperBlock = `${helperAnchor}
private func isYoutubeHost(_ url: URL?) -> Bool {
    guard let host = url?.host?.lowercased() else {
        return false
    }

    return host == "youtube.com" ||
        host.hasSuffix(".youtube.com") ||
        host == "youtube-nocookie.com" ||
        host.hasSuffix(".youtube-nocookie.com") ||
        host == "youtu.be" ||
        host.hasSuffix(".youtu.be")
}

private func isValidYoutubeReferer(_ referer: String?) -> Bool {
    guard
        let referer,
        let url = URL(string: referer),
        url.host != nil,
        let scheme = url.scheme?.lowercased(),
        scheme == "http" || scheme == "https"
    else {
        return false
    }

    return true
}

private func youtubeRefererValue(_ config: InstanceConfiguration?) -> String? {
    let pluginConfig = config?.getPluginConfig("YoutubePlayer")
    guard pluginConfig?.getBoolean("patchRefererHeader", false) == true else {
        return nil
    }

    let referer = pluginConfig?.getString("refererHeader", "${DEFAULT_REFERER}")
    return isValidYoutubeReferer(referer) ? referer : nil
}

private func applyYoutubePlayerDefaultRequestHeaders(_ headers: inout [String: Any], _ requestURL: URL?, _ config: InstanceConfiguration?) {
    if let userAgentString = config?.overridenUserAgentString, headers["User-Agent"] == nil, headers["user-agent"] == nil {
        headers["User-Agent"] = userAgentString
    }

    if
        isYoutubeHost(requestURL),
        headers["Referer"] == nil,
        headers["referer"] == nil,
        let referer = youtubeRefererValue(config)
    {
        headers["Referer"] = referer
    }
}

private func applyYoutubePlayerDefaultRequestHeaders(_ request: inout URLRequest, _ config: InstanceConfiguration?) {
    if
        isYoutubeHost(request.url),
        request.value(forHTTPHeaderField: "Referer") == nil,
        let referer = youtubeRefererValue(config)
    {
        request.setValue(referer, forHTTPHeaderField: "Referer")
    }
}

// ${PATCH_MARKER}: optional YouTube Referer support for Capacitor native requests.
`;

  content = replaceOnce(content, helperAnchor, helperBlock, 'iOS HttpRequestHandler helper block');

  const requestHeadersBlock = `        if let userAgentString = config?.overridenUserAgentString, headers["User-Agent"] == nil, headers["user-agent"] == nil {
            headers["User-Agent"] = userAgentString
        }

        request.setRequestHeaders(headers)
`;

  const patchedRequestHeadersBlock = `        applyYoutubePlayerDefaultRequestHeaders(&headers, request.url, config)

        request.setRequestHeaders(headers)
`;

  return replaceOnce(content, requestHeadersBlock, patchedRequestHeadersBlock, 'iOS HttpRequestHandler request headers');
}

function patchIosWebViewAssetHandler(content) {
  if (content.includes(PATCH_MARKER)) {
    return content;
  }

  content = replaceOnce(
    content,
    `open class WebViewAssetHandler: NSObject, WKURLSchemeHandler {
    private var router: Router
    private var serverUrl: URL?
`,
    `open class WebViewAssetHandler: NSObject, WKURLSchemeHandler {
    private var router: Router
    private var serverUrl: URL?
    private var requestConfiguration: InstanceConfiguration?
`,
    'iOS WebViewAssetHandler stored config',
  );

  content = replaceOnce(
    content,
    `    open func setServerUrl(_ serverUrl: URL?) {
        self.serverUrl = serverUrl
    }
`,
    `    open func setServerUrl(_ serverUrl: URL?) {
        self.serverUrl = serverUrl
    }

    open func setRequestConfiguration(_ config: InstanceConfiguration?) {
        self.requestConfiguration = config
    }

    // ${PATCH_MARKER}: stores the instance configuration for optional Referer injection.
`,
    'iOS WebViewAssetHandler setter',
  );

  content = replaceOnce(
    content,
    `        if let targetUrl = urlComponents?.queryItems?.first(where: { $0.name == CapacitorBridge.httpInterceptorUrlParam })?.value,
           !targetUrl.isEmpty {
            urlRequest.url = URL(string: targetUrl)
        }

        let urlSession = URLSession.shared
`,
    `        if let targetUrl = urlComponents?.queryItems?.first(where: { $0.name == CapacitorBridge.httpInterceptorUrlParam })?.value,
           !targetUrl.isEmpty {
            urlRequest.url = URL(string: targetUrl)
        }

        applyYoutubePlayerDefaultRequestHeaders(&urlRequest, requestConfiguration)

        let urlSession = URLSession.shared
`,
    'iOS WebViewAssetHandler request hook',
  );

  return content;
}

function patchIosBridgeViewController(content) {
  if (content.includes(PATCH_MARKER)) {
    return content;
  }

  return replaceOnce(
    content,
    `        let assetHandler = WebViewAssetHandler(router: router())
        assetHandler.setAssetPath(configuration.appLocation.path)
        assetHandler.setServerUrl(configuration.serverURL)
`,
    `        let assetHandler = WebViewAssetHandler(router: router())
        assetHandler.setAssetPath(configuration.appLocation.path)
        assetHandler.setServerUrl(configuration.serverURL)
        assetHandler.setRequestConfiguration(configuration)
        // ${PATCH_MARKER}: enable optional YouTube Referer injection for intercepted requests.
`,
    'iOS CAPBridgeViewController asset handler config',
  );
}

function patchAndroidHttpRequestHandler(content) {
  if (content.includes(PATCH_MARKER)) {
    return content;
  }

  if (!content.includes('import com.getcapacitor.PluginConfig;')) {
    content = replaceOnce(
      content,
      `import com.getcapacitor.PluginCall;
`,
      `import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginConfig;
`,
      'Android HttpRequestHandler import',
    );
  }

  const helperAnchor = `    }

    /**
     * Internal builder class for building a CapacitorHttpUrlConnection
     */
`;

  const helperBlock = `    }

    private static boolean isYoutubeHost(URL url) {
        if (url == null || url.getHost() == null) {
            return false;
        }

        String host = url.getHost().toLowerCase(Locale.US);
        return host.equals("youtube.com") ||
            host.endsWith(".youtube.com") ||
            host.equals("youtube-nocookie.com") ||
            host.endsWith(".youtube-nocookie.com") ||
            host.equals("youtu.be") ||
            host.endsWith(".youtu.be");
    }

    private static boolean isValidYoutubeReferer(String refererValue) {
        if (refererValue == null || refererValue.isBlank()) {
            return false;
        }

        try {
            URL refererUrl = new URL(refererValue);
            String protocol = refererUrl.getProtocol();
            return
                refererUrl.getHost() != null &&
                !refererUrl.getHost().isBlank() &&
                ("http".equalsIgnoreCase(protocol) || "https".equalsIgnoreCase(protocol));
        } catch (MalformedURLException ex) {
            return false;
        }
    }

    private static String getYoutubePlayerReferer(Bridge bridge) {
        PluginConfig pluginConfig = bridge.getConfig().getPluginConfiguration("YoutubePlayer");
        if (!pluginConfig.getBoolean("patchRefererHeader", false)) {
            return null;
        }

        String refererValue = pluginConfig.getString("refererHeader", "${DEFAULT_REFERER}");
        return isValidYoutubeReferer(refererValue) ? refererValue : null;
    }

    public static void applyYoutubePlayerDefaultRequestHeaders(JSObject headers, Bridge bridge, URL url) throws JSONException {
        // a workaround for the following android web view issue:
        // https://issues.chromium.org/issues/40450316
        // x-cap-user-agent contains the user agent set in JavaScript
        String userAgentValue = headers.getString("x-cap-user-agent");
        if (userAgentValue != null) {
            headers.put("User-Agent", userAgentValue);
        }
        headers.remove("x-cap-user-agent");

        if (!headers.has("User-Agent") && !headers.has("user-agent")) {
            String overriddenUserAgentString = bridge.getConfig().getOverriddenUserAgentString();
            if (overriddenUserAgentString != null) {
                headers.put("User-Agent", overriddenUserAgentString);
            }
        }

        String refererValue = getYoutubePlayerReferer(bridge);
        if (refererValue != null && isYoutubeHost(url) && !headers.has("Referer") && !headers.has("referer")) {
            headers.put("Referer", refererValue);
        }
    }

    // ${PATCH_MARKER}: optional YouTube Referer support for Capacitor native requests.

    /**
     * Internal builder class for building a CapacitorHttpUrlConnection
     */
`;

  content = replaceOnce(content, helperAnchor, helperBlock, 'Android HttpRequestHandler helper block');

  const requestHeadersBlock = `        // a workaround for the following android web view issue:
        // https://issues.chromium.org/issues/40450316
        // x-cap-user-agent contains the user agent set in JavaScript
        String userAgentValue = headers.getString("x-cap-user-agent");
        if (userAgentValue != null) {
            headers.put("User-Agent", userAgentValue);
        }
        headers.remove("x-cap-user-agent");

        if (!headers.has("User-Agent") && !headers.has("user-agent")) {
            headers.put("User-Agent", bridge.getConfig().getOverriddenUserAgentString());
        }

        URL url = new URL(urlString);
`;

  const patchedRequestHeadersBlock = `        URL url = new URL(urlString);
        applyYoutubePlayerDefaultRequestHeaders(headers, bridge, url);
`;

  return replaceOnce(content, requestHeadersBlock, patchedRequestHeadersBlock, 'Android HttpRequestHandler request headers');
}

function patchAndroidWebViewLocalServer(content) {
  if (content.includes(PATCH_MARKER)) {
    return content;
  }

  return replaceOnce(
    content,
    `        // a workaround for the following android web view issue:
        // https://issues.chromium.org/issues/40450316
        // x-cap-user-agent contains the user agent set in JavaScript
        String userAgentValue = headers.getString("x-cap-user-agent");
        if (userAgentValue != null) {
            headers.put("User-Agent", userAgentValue);
        }
        headers.remove("x-cap-user-agent");

        HttpRequestHandler.HttpURLConnectionBuilder connectionBuilder = new HttpRequestHandler.HttpURLConnectionBuilder()
`,
    `        HttpRequestHandler.applyYoutubePlayerDefaultRequestHeaders(headers, bridge, url);
        // ${PATCH_MARKER}: optional YouTube Referer support for Capacitor intercepted requests.

        HttpRequestHandler.HttpURLConnectionBuilder connectionBuilder = new HttpRequestHandler.HttpURLConnectionBuilder()
`,
    'Android WebViewLocalServer request headers',
  );
}

function applyPatch(rootDir, relativePath, patcher) {
  const file = path.join(rootDir, relativePath);
  if (!fileExists(file)) {
    throw new Error(`Unable to find ${relativePath} in ${rootDir}`);
  }

  const original = readText(file);
  const updated = patcher(original);

  if (updated !== original) {
    writeText(file, updated);
    return true;
  }

  return false;
}

export function applyCapacitorYoutubeRefererPatch(rootDir, config = {}) {
  const patchConfig = getPatchConfig(config);
  const alreadyPatched = isAlreadyPatched(rootDir);

  if (!patchConfig.enabled && !alreadyPatched) {
    return {
      applied: false,
      alreadyPatched: false,
      enabled: false,
      refererHeader: patchConfig.refererHeader,
      changedFiles: [],
    };
  }

  ensureSupportedCapacitorVersion(rootDir, IOS_PACKAGE_JSON);
  ensureSupportedCapacitorVersion(rootDir, ANDROID_PACKAGE_JSON);

  const changedFiles = [];

  if (applyPatch(rootDir, IOS_HTTP_REQUEST_HANDLER, patchIosHttpRequestHandler)) {
    changedFiles.push(IOS_HTTP_REQUEST_HANDLER);
  }
  if (applyPatch(rootDir, IOS_WEBVIEW_ASSET_HANDLER, patchIosWebViewAssetHandler)) {
    changedFiles.push(IOS_WEBVIEW_ASSET_HANDLER);
  }
  if (applyPatch(rootDir, IOS_BRIDGE_VIEW_CONTROLLER, patchIosBridgeViewController)) {
    changedFiles.push(IOS_BRIDGE_VIEW_CONTROLLER);
  }
  if (applyPatch(rootDir, ANDROID_HTTP_REQUEST_HANDLER, patchAndroidHttpRequestHandler)) {
    changedFiles.push(ANDROID_HTTP_REQUEST_HANDLER);
  }
  if (applyPatch(rootDir, ANDROID_WEBVIEW_LOCAL_SERVER, patchAndroidWebViewLocalServer)) {
    changedFiles.push(ANDROID_WEBVIEW_LOCAL_SERVER);
  }

  return {
    applied: true,
    alreadyPatched,
    enabled: patchConfig.enabled,
    refererHeader: patchConfig.refererHeader,
    changedFiles,
  };
}

function main() {
  const rootDir = process.env.CAPACITOR_ROOT_DIR;
  if (!rootDir) {
    console.log('[YoutubePlayer] Skipping Referer patch: CAPACITOR_ROOT_DIR is not set.');
    return;
  }

  const config = parseCapacitorConfig(process.env.CAPACITOR_CONFIG);
  const result = applyCapacitorYoutubeRefererPatch(rootDir, config);

  if (!result.applied) {
    console.log('[YoutubePlayer] Capacitor Referer patch is disabled. Set plugins.YoutubePlayer.patchRefererHeader=true to enable it.');
    return;
  }

  if (result.changedFiles.length > 0) {
    console.log(
      `[YoutubePlayer] Applied optional Capacitor Referer patch for YouTube hosts (${result.refererHeader}).`,
    );
    for (const file of result.changedFiles) {
      console.log(`[YoutubePlayer] Patched ${file}`);
    }
    return;
  }

  console.log(
    `[YoutubePlayer] Capacitor Referer patch support is already installed. Runtime flag is ${
      result.enabled ? 'enabled' : 'disabled'
    }.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
