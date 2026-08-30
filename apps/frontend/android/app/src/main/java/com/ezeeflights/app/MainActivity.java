package com.ezeeflights.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

/**
 * EzeeFlights MainActivity
 *
 * This is the single native Android entry point. All UI is rendered by the
 * Capacitor WebView which loads the built Next.js web app.
 * Native plugins (Push, Camera, Biometric, etc.) are auto-registered by Capacitor.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppSettingsPlugin.class);
        registerPlugin(MicrophonePlugin.class);
        registerPlugin(SystemChromePlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        disableWebViewOverscroll();
    }

    private void disableWebViewOverscroll() {
        if (getBridge() == null) {
            return;
        }

        WebView webView = getBridge().getWebView();
        if (webView == null) {
            return;
        }

        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(true);
        webView.setHorizontalScrollBarEnabled(false);

        View parent = (View) webView.getParent();
        if (parent != null) {
            parent.setOverScrollMode(View.OVER_SCROLL_NEVER);
        }
    }
}
