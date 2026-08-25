package io.github.c666249.studyhub

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var showingOfflinePage = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        hideSystemBars()

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = false
                allowContentAccess = false
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                loadWithOverviewMode = true
                useWideViewPort = true
                userAgentString = "$userAgentString StudyHubAndroid/${BuildConfig.VERSION_NAME}"
            }
            webViewClient = StudyHubWebViewClient()
        }

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        setContentView(webView)

        if (savedInstanceState == null) {
            webView.loadUrl(STUDY_HUB_URL)
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        webView.saveState(outState)
        super.onSaveInstanceState(outState)
    }

    override fun onResume() {
        super.onResume()
        hideSystemBars()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemBars()
    }

    @Deprecated("Handled for WebView history on the supported API range")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.stopLoading()
        webView.webViewClient = WebViewClient()
        webView.destroy()
        super.onDestroy()
    }

    @Suppress("DEPRECATION")
    private fun hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.apply {
                hide(WindowInsets.Type.systemBars())
                systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        }
    }

    private fun isStudyHubUrl(uri: Uri): Boolean {
        return uri.scheme == "https" &&
            uri.host.equals(STUDY_HUB_HOST, ignoreCase = true) &&
            (uri.path == STUDY_HUB_PATH.removeSuffix("/") ||
                uri.path.orEmpty().startsWith(STUDY_HUB_PATH))
    }

    private fun openExternal(uri: Uri) {
        runCatching {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
        }
    }

    private fun showOfflinePage() {
        if (showingOfflinePage) return
        showingOfflinePage = true
        val html = assets.open("offline.html").bufferedReader().use { it.readText() }
        webView.loadDataWithBaseURL(
            STUDY_HUB_URL,
            html,
            "text/html",
            "UTF-8",
            null
        )
    }

    private inner class StudyHubWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(
            view: WebView?,
            request: WebResourceRequest?
        ): Boolean {
            val uri = request?.url ?: return false
            if (isStudyHubUrl(uri)) return false
            openExternal(uri)
            return true
        }

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            if (url?.startsWith(STUDY_HUB_URL) == true) {
                showingOfflinePage = false
            }
            super.onPageStarted(view, url, favicon)
        }

        override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
        ) {
            if (request?.isForMainFrame == true && isStudyHubUrl(request.url)) {
                showOfflinePage()
                return
            }
            super.onReceivedError(view, request, error)
        }

        override fun onReceivedHttpError(
            view: WebView?,
            request: WebResourceRequest?,
            errorResponse: WebResourceResponse?
        ) {
            if (
                request?.isForMainFrame == true &&
                isStudyHubUrl(request.url) &&
                (errorResponse?.statusCode ?: 0) >= 400
            ) {
                showOfflinePage()
                return
            }
            super.onReceivedHttpError(view, request, errorResponse)
        }
    }

    companion object {
        private const val STUDY_HUB_HOST = "c666249.github.io"
        private const val STUDY_HUB_PATH = "/study-hub/"
        private const val STUDY_HUB_URL = "https://c666249.github.io/study-hub/"
    }
}
