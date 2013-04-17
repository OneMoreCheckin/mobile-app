package fr.webitup.OneMoreCheckIn.plugins;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaInterface;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;


import com.google.analytics.tracking.android.GAServiceManager;
import com.google.analytics.tracking.android.GoogleAnalytics;
import com.google.analytics.tracking.android.Tracker;

public class GoogleAnalyticsPlugin extends CordovaPlugin {
	public static final String START = "trackerWithTrackingId";
	public static final String TRACK_PAGE_VIEW = "trackView";
	public static final String TRACK_EVENT = "trackEventWithCategory";
	public static final String SET_CUSTOM_VARIABLE = "setCustomVariable";
    
	public static final int DISPATCH_INTERVAL = 20;
	private Tracker mGaTracker;
    private GoogleAnalytics mGaInstance;
    
    @Override
	public void initialize (CordovaInterface cordova, CordovaWebView webView) {
		mGaInstance = GoogleAnalytics.getInstance(cordova.getActivity());
	}

	@Override
	public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
		Boolean success = true;
		if (START.equals(action)) {
			try {
				start(data.getString(0));
				callbackContext.success();
			} catch (JSONException e) {
				success = false;
				callbackContext.error(e.toString());
			}
		} else if (TRACK_PAGE_VIEW.equals(action)) {
			try {
				trackPageView(data.getString(0));
				callbackContext.success();
			} catch (JSONException e) {
				success = false;
				callbackContext.error(e.toString());
			}
		} else if (TRACK_EVENT.equals(action)) {
			try {
				trackEvent(data.getString(0), data.getString(1), data.getString(2), data.getInt(3));
				callbackContext.success();
			} catch (JSONException e) {
				success = false;
				callbackContext.error(e.toString());
			}
		} else {
			success = false;
			callbackContext.error("Invalid action");
		}
		
		/*else if (SET_CUSTOM_VARIABLE.equals(action)){
		try {
			setCustomVar(data.getInt(0), data.getString(1), data.getString(2), data.getInt(3));
			result = new PluginResult(Status.OK);
		} catch (JSONException e) {
			result = new PluginResult(Status.JSON_EXCEPTION);
		}*/
		return success;
	}

	private void start(String accountId) {
		mGaTracker = mGaInstance.getTracker(accountId);
		GAServiceManager.getInstance().setDispatchPeriod(DISPATCH_INTERVAL);
	}

	private void trackPageView(String key) {
		mGaTracker.sendView(key);
	}

	private void trackEvent(String category, String action, String label, int value){
		mGaTracker.sendEvent(category, action, label, (long) value);
	}

/*	private void setCustomVar(int index, String label, String value, int scope) {
		mGaTracker.setCustomDimensionsAndMetrics(arg0, arg1)
		if(scope > 0) mGaTracker.setCustomVar(index, label, value, scope);
		else mGaTracker.setCustomVar(index, label, value);
	}*/
}
