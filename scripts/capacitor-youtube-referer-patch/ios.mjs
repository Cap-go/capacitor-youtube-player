import path from 'node:path';

import { DEFAULT_REFERER, PATCH_MARKER, replaceOnce } from './shared.mjs';

export const IOS_HTTP_REQUEST_HANDLER = path.join(
  'node_modules',
  '@capacitor',
  'ios',
  'Capacitor',
  'Capacitor',
  'Plugins',
  'HttpRequestHandler.swift',
);
export const IOS_WEBVIEW_ASSET_HANDLER = path.join(
  'node_modules',
  '@capacitor',
  'ios',
  'Capacitor',
  'Capacitor',
  'WebViewAssetHandler.swift',
);
export const IOS_BRIDGE_VIEW_CONTROLLER = path.join(
  'node_modules',
  '@capacitor',
  'ios',
  'Capacitor',
  'Capacitor',
  'CAPBridgeViewController.swift',
);

export const IOS_PATCH_TARGETS = [
  [IOS_HTTP_REQUEST_HANDLER, patchIosHttpRequestHandler],
  [IOS_WEBVIEW_ASSET_HANDLER, patchIosWebViewAssetHandler],
  [IOS_BRIDGE_VIEW_CONTROLLER, patchIosBridgeViewController],
];

/**
 * Patch Capacitor's iOS native HTTP request handler.
 * @param {string} content
 * @returns {string}
 */
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
private func hasHeader(_ headers: [String: Any], named name: String) -> Bool {
    headers.keys.contains { $0.caseInsensitiveCompare(name) == .orderedSame }
}

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
    if let userAgentString = config?.overridenUserAgentString, !hasHeader(headers, named: "User-Agent") {
        headers["User-Agent"] = userAgentString
    }

    if
        isYoutubeHost(requestURL),
        !hasHeader(headers, named: "Referer"),
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

/**
 * Patch Capacitor's iOS WebView asset handler.
 * @param {string} content
 * @returns {string}
 */
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

/**
 * Patch the bridge view controller so intercepted requests get access to config.
 * @param {string} content
 * @returns {string}
 */
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
