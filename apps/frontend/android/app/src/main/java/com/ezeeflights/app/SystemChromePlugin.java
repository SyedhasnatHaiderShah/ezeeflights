package com.ezeeflights.app;

import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemChrome")
public class SystemChromePlugin extends Plugin {

    private int previousSystemUiVisibility = 0;
    private boolean isFullscreen = false;

    @PluginMethod
    public void applyAppearance(PluginCall call) {
        String backgroundColor = call.getString("backgroundColor", "#0e0e0e");
        boolean lightIcons = call.getBoolean("lightIcons", true);

        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            if (window == null) {
                call.reject("Window unavailable");
                return;
            }

            int parsedColor;
            try {
                parsedColor = Color.parseColor(backgroundColor);
            } catch (IllegalArgumentException error) {
                parsedColor = Color.parseColor("#0e0e0e");
            }

            window.setStatusBarColor(parsedColor);
            window.setNavigationBarColor(parsedColor);

            View decorView = window.getDecorView();
            int flags = decorView.getSystemUiVisibility();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (lightIcons) {
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                } else {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (lightIcons) {
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                } else {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                }
            }

            decorView.setSystemUiVisibility(flags);
            call.resolve();
        });
    }

    @PluginMethod
    public void enterFullscreen(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            if (window == null) {
                call.reject("Window unavailable");
                return;
            }

            View decorView = window.getDecorView();
            previousSystemUiVisibility = decorView.getSystemUiVisibility();

            int uiOptions =
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN;

            decorView.setSystemUiVisibility(uiOptions);
            isFullscreen = true;
            call.resolve();
        });
    }

    @PluginMethod
    public void exitFullscreen(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            if (window == null) {
                call.reject("Window unavailable");
                return;
            }

            View decorView = window.getDecorView();
            decorView.setSystemUiVisibility(previousSystemUiVisibility);
            isFullscreen = false;
            call.resolve();
        });
    }

    @PluginMethod
    public void isFullscreen(PluginCall call) {
        JSObject result = new JSObject();
        result.put("value", isFullscreen);
        call.resolve(result);
    }
}
