package com.activeworkforcepro.app;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class WakeLockModule extends ReactContextBaseJavaModule {

    public WakeLockModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "WakeLockModule";
    }


    @ReactMethod
    public void acquireWakeLock() {
        WakeLockService.acquireWakeLock(getReactApplicationContext());
    }

    @ReactMethod
    public void releaseWakeLock() {
        WakeLockService.releaseWakeLock();
    }
}