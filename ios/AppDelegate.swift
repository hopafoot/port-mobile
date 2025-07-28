//
//  AppDelegate.swift
//  Port
//
//  Created by Abhinav on 2025-07-28.
//


import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import RNBootSplash

let  GROUP_IDENTIFIER = "group.tech.numberless.port"
let DATABASE_NAME = "numberless.db"


@main
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // MARKER: From the react-native template
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Port",
      in: window,
      launchOptions: launchOptions
    )
    
    // MARKER: not from the react-native-template
    FirebaseApp.configure()
    RNVoipPushNotificationManager.voipRegistration()

    // MARKER: from the react-native template
    return true
  }
  
  func applicationWillEnterForeground(_ application: UIApplication) {
      
      // App badge count shenanigans
    guard let suiteDefaults = UserDefaults(suiteName: GROUP_IDENTIFIER) else {
      return
    }
    suiteDefaults.set(1, forKey:"count")
      suiteDefaults.synchronize()
      UIApplication.shared.applicationIconBadgeNumber = 0
  }
  
  /**
   * Gets run when there's a new token  to update
   */
  func pushRegistry(
      _ registry: PKPushRegistry,
      didUpdate pushCredentials: PKPushCredentials,
      for type: PKPushType
  ) {
    // TODO: could probably bring this module in-house since it doesn't do much anymore
    // Pass the token on to the module to cache and pass on JS
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }
  
  func pushRegistry(
      _ registry: PKPushRegistry,
      didReceiveIncomingPushWith payload: PKPushPayload,
      for type: PKPushType,
      completion: @escaping () -> Void
  ) {
    let callHelper = PortCallHelper()
    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType:type.rawValue)
    let aps = payload.dictionaryPayload["aps"] as? [String: Any]
    guard let callFrom = aps!["call_from"] else {
      
    }
    
    
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
