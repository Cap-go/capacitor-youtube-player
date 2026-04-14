import path from 'node:path';

import { DEFAULT_REFERER, PATCH_MARKER, replaceOnce } from './shared.mjs';

export const ANDROID_HTTP_REQUEST_HANDLER = path.join(
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
export const ANDROID_WEBVIEW_LOCAL_SERVER = path.join(
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

export const ANDROID_PATCH_TARGETS = [
  [ANDROID_HTTP_REQUEST_HANDLER, patchAndroidHttpRequestHandler],
  [ANDROID_WEBVIEW_LOCAL_SERVER, patchAndroidWebViewLocalServer],
];

/**
 * Patch Capacitor's Android HTTP request handler.
 * @param {string} content
 * @returns {string}
 */
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

    private static boolean hasHeaderIgnoreCase(JSObject headers, String headerName) {
        Iterator<String> keys = headers.keys();
        while (keys.hasNext()) {
            if (headerName.equalsIgnoreCase(keys.next())) {
                return true;
            }
        }

        return false;
    }

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

    public static void applyYoutubePlayerDefaultRequestHeaders(JSObject headers, Bridge bridge, URL url) {
        // a workaround for the following android web view issue:
        // https://issues.chromium.org/issues/40450316
        // x-cap-user-agent contains the user agent set in JavaScript
        String userAgentValue = headers.getString("x-cap-user-agent");
        if (userAgentValue != null) {
            headers.put("User-Agent", userAgentValue);
        }
        headers.remove("x-cap-user-agent");

        if (!hasHeaderIgnoreCase(headers, "User-Agent")) {
            String overriddenUserAgentString = bridge.getConfig().getOverriddenUserAgentString();
            if (overriddenUserAgentString != null) {
                headers.put("User-Agent", overriddenUserAgentString);
            }
        }

        String refererValue = getYoutubePlayerReferer(bridge);
        if (refererValue != null && isYoutubeHost(url) && !hasHeaderIgnoreCase(headers, "Referer")) {
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

/**
 * Patch Capacitor's Android WebView local server interceptor.
 * @param {string} content
 * @returns {string}
 */
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
