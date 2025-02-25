package com.activeworkforcepro.app;

import android.app.KeyguardManager;
import android.content.Context;
import android.os.PowerManager;
import android.util.Log;

public class WakeLockService {
    private static PowerManager.WakeLock wakeLock;

    public static void acquireWakeLock(Context context) {
        try {
            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            KeyguardManager keyguardManager = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);

            if (powerManager != null) {
                // Release the previous wake lock if it exists
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }

                // Create a new wake lock
                wakeLock = powerManager.newWakeLock(
                        PowerManager.SCREEN_BRIGHT_WAKE_LOCK | 
                        PowerManager.ACQUIRE_CAUSES_WAKEUP, 
                        "MyApp:WakeLock"
                );

                wakeLock.acquire(5000); // Keep screen on for 5 seconds
                Log.d("WakeLockService", "Wake lock acquired");

                // Ensure keyguard is disabled (unlock screen)
                if (keyguardManager != null) {
                    KeyguardManager.KeyguardLock keyguardLock = keyguardManager.newKeyguardLock("MyApp:KeyguardLock");
                    keyguardLock.disableKeyguard();
                    Log.d("WakeLockService", "Keyguard disabled");
                }
            }
        } catch (Exception e) {
            Log.e("WakeLockService", "Failed to acquire wake lock: " + e.getMessage());
        }
    }

    public static void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
            Log.d("WakeLockService", "Wake lock released");
        }
    }
}
