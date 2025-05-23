package com.example.vacantcourt.screens

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.PointF
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.doOnLayout
import androidx.core.view.updateLayoutParams
import com.example.vacantcourt.R
import com.example.vacantcourt.data.IndividualCourtData
import com.example.vacantcourt.data.PointData
import com.example.vacantcourt.data.TennisComplexData
import com.google.android.material.button.MaterialButton
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

class CourtConfigurationActivity : AppCompatActivity() {

    private lateinit var rootLayout: ConstraintLayout
    private lateinit var previewView: PreviewView
    private lateinit var regionDrawingOverlayView: RegionDrawingOverlayView
    private lateinit var unconfiguredCourtsButtonsContainer: LinearLayout
    private lateinit var courtButtonsScrollView: HorizontalScrollView
    private lateinit var buttonConfigureDoneFab: FloatingActionButton
    private lateinit var progressBar: ProgressBar
    private lateinit var textViewComplexNameTitleConfig: TextView
    private lateinit var textViewAllConfiguredMessage: TextView


    private lateinit var cameraExecutor: ExecutorService
    private var cameraProvider: ProcessCameraProvider? = null
    private var previewUseCase: Preview? = null
    private var isCameraSetupPending = false


    private var complexId: String? = null
    private var complexNameFromIntent: String? = null
    private var currentTennisComplex: TennisComplexData? = null


    private val db = Firebase.firestore
    private val TAG = "CourtConfigActivity"
    private val CAMERA_PERMISSION_REQUEST_CODE = 101
    private val TENNIS_COMPLEXES_COLLECTION_CONFIG = "Courts"
    private var currentlySelectedCourtButton: MaterialButton? = null

    private var colorPrimaryActive: Int = 0
    private var colorForInactiveButtonText: Int = Color.WHITE
    private var colorForInactiveButtonStroke: Int = Color.WHITE


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
        }

        setContentView(R.layout.activity_court_configuration)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE

        try {
            val typedValue = TypedValue()
            if (theme.resolveAttribute(androidx.appcompat.R.attr.colorPrimary, typedValue, true)) {
                colorPrimaryActive = typedValue.data
            } else {
                colorPrimaryActive = ContextCompat.getColor(this, R.color.blue_500)
            }
        } catch (e: Exception) {
            colorPrimaryActive = ContextCompat.getColor(this, R.color.blue_500)
        }

        rootLayout = findViewById(R.id.root_court_configuration)
        previewView = findViewById(R.id.previewViewConfig)
        regionDrawingOverlayView = findViewById(R.id.regionDrawingOverlayView)
        unconfiguredCourtsButtonsContainer = findViewById(R.id.unconfiguredCourtsButtonsContainer)
        courtButtonsScrollView = findViewById(R.id.court_buttons_scrollview)
        buttonConfigureDoneFab = findViewById(R.id.buttonConfigureDoneFab)
        progressBar = findViewById(R.id.progressBarConfig)
        textViewComplexNameTitleConfig = findViewById(R.id.textViewComplexNameTitleConfig)
        textViewAllConfiguredMessage = findViewById(R.id.textViewAllConfiguredMessage)


        applyWindowInsets()

        complexId = intent.getStringExtra("COMPLEX_ID")
        complexNameFromIntent = intent.getStringExtra("COMPLEX_NAME")

        if (complexId.isNullOrEmpty()) {
            Toast.makeText(this, "Error: Complex ID missing or empty.", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        textViewComplexNameTitleConfig.text = complexNameFromIntent ?: getString(R.string.configure_courts_activity_title)
        cameraExecutor = Executors.newSingleThreadExecutor()

        fetchComplexDetails()
        buttonConfigureDoneFab.setOnClickListener {
            configureSelectedCourts()
        }

        if (allPermissionsGranted()) {
            setupCameraWhenPreviewReady()
        } else {
            ActivityCompat.requestPermissions(
                this, REQUIRED_PERMISSIONS, CAMERA_PERMISSION_REQUEST_CODE
            )
        }
    }

    private fun setupCameraWhenPreviewReady() {
        previewView.doOnLayout {
            if (it.display != null) {
                Log.d(TAG, "PreviewView is ready, display available. Proceeding with camera setup.")
                startCamera()
            } else {
                Log.w(TAG, "PreviewView laid out, but display is null. Retrying camera setup shortly via post.")
                previewView.post {
                    if (previewView.display != null) {
                        startCamera()
                    } else {
                        Log.e(TAG, "PreviewView display still null after post. Camera setup might fail.")
                        showError("Camera preview initialization failed. Please try again.")
                    }
                }
            }
        }
    }


    private fun applyWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(rootLayout) { _, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())

            textViewComplexNameTitleConfig.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                topMargin = insets.top + resources.getDimensionPixelSize(R.dimen.default_margin)
                leftMargin = insets.left + resources.getDimensionPixelSize(R.dimen.default_left_margin)
            }
            textViewAllConfiguredMessage.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                topMargin = insets.top + resources.getDimensionPixelSize(R.dimen.default_margin)
                leftMargin = (textViewComplexNameTitleConfig.right + resources.getDimensionPixelSize(R.dimen.default_margin)).toInt()

            }


            courtButtonsScrollView.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                leftMargin = insets.left + resources.getDimensionPixelSize(R.dimen.default_left_margin)
                bottomMargin = insets.bottom + resources.getDimensionPixelSize(R.dimen.default_margin)
            }

            buttonConfigureDoneFab.updateLayoutParams<ViewGroup.MarginLayoutParams> {
                rightMargin = insets.right + resources.getDimensionPixelSize(R.dimen.default_margin)
                bottomMargin = insets.bottom + resources.getDimensionPixelSize(R.dimen.default_margin)
            }
            WindowInsetsCompat.CONSUMED
        }
    }


    private fun fetchComplexDetails() {
        progressBar.visibility = View.VISIBLE
        db.collection(TENNIS_COMPLEXES_COLLECTION_CONFIG).document(complexId!!)
            .get()
            .addOnSuccessListener { document ->
                progressBar.visibility = View.GONE
                if (document.exists()) {
                    currentTennisComplex = document.toObject(TennisComplexData::class.java)?.copy(id = document.id)
                    currentTennisComplex?.let {
                        if (complexNameFromIntent.isNullOrEmpty() && it.name.isNotEmpty()) {
                            textViewComplexNameTitleConfig.text = it.name
                        } else {
                            textViewComplexNameTitleConfig.text = complexNameFromIntent ?: it.name
                        }
                        setupCourtButtons()
                    } ?: run {
                        showError("Failed to parse complex data after fetch.")
                    }
                } else {
                    showError("Complex document not found with ID: $complexId")
                }
            }
            .addOnFailureListener { e ->
                progressBar.visibility = View.GONE
                showError("Error fetching complex details: ${e.localizedMessage}")
            }
    }

    private fun setupCourtButtons() {
        unconfiguredCourtsButtonsContainer.removeAllViews()
        val courts = currentTennisComplex?.courts ?: emptyList()

        if (courts.isEmpty()) {
            textViewAllConfiguredMessage.text = getString(R.string.no_courts_configured_for_viewing_live)
            textViewAllConfiguredMessage.visibility = View.VISIBLE
            buttonConfigureDoneFab.hide()
            return
        }

        buttonConfigureDoneFab.show()
        var allConfigured = true

        for (courtData in courts) {
            if (!courtData.isConfigured) {
                allConfigured = false
            }
            val button = MaterialButton(this, null, com.google.android.material.R.attr.materialButtonOutlinedStyle).apply {
                text = courtData.name
                tag = courtData // Store the whole courtData object
                isCheckable = true // We'll manage selection state visually
                minHeight = 0
                minimumHeight = 0
                val lrPadding = (16 * resources.displayMetrics.density).toInt()
                val tbPadding = (8 * resources.displayMetrics.density).toInt()
                setPadding(lrPadding, tbPadding, lrPadding, tbPadding)
                textSize = 13f
                cornerRadius = (20 * resources.displayMetrics.density).toInt()

                if (courtData.isConfigured) {
                    setTextColor(Color.GREEN)
                    strokeColor = ColorStateList.valueOf(Color.GREEN)
                    setIconResource(R.drawable.ic_check)
                } else {
                    setTextColor(colorForInactiveButtonText)
                    strokeColor = ColorStateList.valueOf(colorForInactiveButtonStroke)
                    setIconResource(0)
                }

                strokeWidth = resources.getDimensionPixelSize(R.dimen.default_button_stroke_width)
                rippleColor = ColorStateList.valueOf(colorPrimaryActive)
                setBackgroundColor(Color.parseColor("#66333333"))
                typeface = Typeface.DEFAULT
                iconGravity = MaterialButton.ICON_GRAVITY_TEXT_START
                iconPadding = (6 * resources.displayMetrics.density).toInt()

                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                val marginInPixels = (6 * resources.displayMetrics.density).toInt()
                params.setMargins(marginInPixels, 0, marginInPixels, 0)
                layoutParams = params
                setOnClickListener {
                    onCourtButtonClicked(this, courtData)
                }
            }
            unconfiguredCourtsButtonsContainer.addView(button)
        }

        if (allConfigured) {
            textViewAllConfiguredMessage.text = getString(R.string.all_courts_configured_edit_mode)
            textViewAllConfiguredMessage.visibility = View.VISIBLE
        } else {
            textViewAllConfiguredMessage.visibility = View.GONE
        }
    }


    private fun onCourtButtonClicked(
        clickedButton: MaterialButton,
        court: IndividualCourtData
    ) {
        if (previewView.display == null || previewView.width <= 0 || previewView.height <= 0) {
            Toast.makeText(this, "Camera preview not fully initialized. Please wait.", Toast.LENGTH_SHORT).show()
            Log.w(TAG, "onCourtButtonClicked: Preview not ready.")
            return
        }
        regionDrawingOverlayView.setSourceDimensions(previewView.width, previewView.height)

        val isNewSelection = currentlySelectedCourtButton != clickedButton

        currentlySelectedCourtButton?.let { previousButton ->
            val previousCourtData = previousButton.tag as? IndividualCourtData
            previousButton.strokeWidth = resources.getDimensionPixelSize(R.dimen.default_button_stroke_width)
            if (previousCourtData?.isConfigured == true) {
                previousButton.setTextColor(Color.GREEN)
                previousButton.strokeColor = ColorStateList.valueOf(Color.GREEN)
                previousButton.setIconResource(R.drawable.ic_check)
            } else {
                previousButton.setTextColor(colorForInactiveButtonText)
                previousButton.strokeColor = ColorStateList.valueOf(colorForInactiveButtonStroke)
                previousButton.setIconResource(0)
            }
            previousButton.setBackgroundColor(Color.parseColor("#66333333")) // Reset background
            previousButton.typeface = Typeface.DEFAULT

            if (previousCourtData != null) {
                regionDrawingOverlayView.finalizeActiveRegionByName(previousCourtData.name)
            }
        }

        if (isNewSelection) {
            regionDrawingOverlayView.startDrawingRegion(
                court.name,
                if (court.isConfigured && court.regionPoints != null) {
                    court.regionPoints!!.map { PointF(it.x * previewView.width, it.y * previewView.height) }
                } else {
                    null
                }
            )
            clickedButton.strokeWidth = resources.getDimensionPixelSize(R.dimen.active_button_stroke_width)
            clickedButton.setTextColor(colorPrimaryActive)
            clickedButton.strokeColor = ColorStateList.valueOf(colorPrimaryActive)
            val activeBgColor = Color.argb(70, Color.red(colorPrimaryActive), Color.green(colorPrimaryActive), Color.blue(colorPrimaryActive))
            clickedButton.setBackgroundColor(activeBgColor)
            clickedButton.setIconResource(R.drawable.ic_draw_active)
            clickedButton.typeface = Typeface.DEFAULT_BOLD
            currentlySelectedCourtButton = clickedButton
        } else {
            regionDrawingOverlayView.removeRegion(court.name) // Deselecting
            currentlySelectedCourtButton = null
        }
    }


    private fun configureSelectedCourts() {
        currentlySelectedCourtButton?.let {
            val courtData = it.tag as? IndividualCourtData
            courtData?.let { cd -> regionDrawingOverlayView.finalizeActiveRegionByName(cd.name) }
        }

        val placedRegions = regionDrawingOverlayView.getPlacedRegions()
        if (placedRegions.isEmpty() && currentTennisComplex?.courts?.all { it.isConfigured } == true) {
            Toast.makeText(this, "No changes made to existing configurations.", Toast.LENGTH_LONG).show()
            return
        }
        if (placedRegions.isEmpty()) {
            Toast.makeText(this, "No courts have been configured on screen.", Toast.LENGTH_LONG).show()
            return
        }


        progressBar.visibility = View.VISIBLE
        val batch = db.batch()
        var courtsToUpdateCount = 0
        currentTennisComplex?.let { complex ->
            val updatedCourtsList = complex.courts.map { existingCourt ->
                val placedRegion = placedRegions.find { it.courtName == existingCourt.name }
                if (placedRegion != null && placedRegion.points.isNotEmpty()) {
                    courtsToUpdateCount++
                    val normalizedPoints = placedRegion.points.map { pointF ->
                        PointData(
                            x = pointF.x / previewView.width,
                            y = pointF.y / previewView.height
                        )
                    }
                    existingCourt.copy(
                        isConfigured = true,
                        regionPoints = normalizedPoints
                    )
                } else {
                    existingCourt
                }
            }
            batch.update(db.collection(TENNIS_COMPLEXES_COLLECTION_CONFIG).document(complexId!!), "courts", updatedCourtsList)
        }

        if (courtsToUpdateCount == 0) {
            Toast.makeText(this, "No new configurations to save.", Toast.LENGTH_SHORT).show()
            progressBar.visibility = View.GONE
            return
        }

        batch.commit()
            .addOnSuccessListener {
                progressBar.visibility = View.GONE
                Toast.makeText(this, "$courtsToUpdateCount court(s) configured/updated successfully!", Toast.LENGTH_LONG).show()
                finish()
            }
            .addOnFailureListener { e ->
                progressBar.visibility = View.GONE
                showError("Failed to save configuration: ${e.localizedMessage}")
            }
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun startCamera() {
        if (cameraProvider != null && previewView.display != null) {
            bindCameraUseCases()
            return
        }
        if (previewView.display == null) {
            Log.w(TAG, "startCamera called but previewView.display is null. Deferring.")
            isCameraSetupPending = true
            if (!previewView.isAttachedToWindow) {
                previewView.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
                    override fun onViewAttachedToWindow(v: View) {
                        previewView.removeOnAttachStateChangeListener(this)
                        setupCameraWhenPreviewReady()
                    }
                    override fun onViewDetachedFromWindow(v: View) {}
                })
            }
            return
        }


        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                if (previewView.display != null) {
                    bindCameraUseCases()
                } else {
                    Log.w(TAG, "CameraProvider ready, but previewView.display is null. Deferring bind.")
                    isCameraSetupPending = true
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get camera provider", e)
                showError("Failed to initialize camera: ${e.localizedMessage}")
            }
        }, ContextCompat.getMainExecutor(this))
    }
    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume called. isCameraSetupPending: $isCameraSetupPending")
        if (!allPermissionsGranted()) {
            Log.w(TAG, "onResume: Permissions not granted. Not starting camera.")
            return
        }
        if (isCameraSetupPending || cameraProvider == null || previewUseCase == null) {
            Log.d(TAG, "onResume: Attempting camera setup via setupCameraWhenPreviewReady.")
            setupCameraWhenPreviewReady()
        } else if (previewView.display != null) {
            Log.d(TAG, "onResume: Camera already set up and display available. Rebinding if necessary or ensuring preview is active.")
            bindCameraUseCases()
        } else {
            Log.w(TAG, "onResume: Camera provider and use case exist, but display is null. Waiting for layout.")
        }
    }


    @SuppressLint("UnsafeOptInUsageError")
    private fun bindCameraUseCases() {
        val currentCameraProvider = cameraProvider ?: run {
            Log.e(TAG, "bindCameraUseCases: CameraProvider not available.")
            isCameraSetupPending = true
            return
        }
        if (previewView.display == null) {
            Log.e(TAG, "bindCameraUseCases: previewView.display is null. Cannot bind.")
            isCameraSetupPending = true
            return
        }

        Log.d(TAG, "Attempting to bind camera use cases.")
        isCameraSetupPending = false


        val screenWidth = previewView.width
        val screenHeight = previewView.height
        if (screenWidth == 0 || screenHeight == 0) {
            Log.e(TAG, "bindCameraUseCases: PreviewView dimensions are zero. Deferring bind.")
            previewView.post { bindCameraUseCases() }
            return
        }

        val screenAspectRatio = aspectRatio(max(screenWidth, screenHeight), min(screenWidth,screenHeight))
        val rotation = previewView.display!!.rotation

        previewUseCase = Preview.Builder()
            .setTargetAspectRatio(screenAspectRatio)
            .setTargetRotation(rotation)
            .build()
            .also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

        regionDrawingOverlayView.setSourceDimensions(screenWidth, screenHeight)


        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        try {
            currentCameraProvider.unbindAll()
            currentCameraProvider.bindToLifecycle(this, cameraSelector, previewUseCase)
            Log.i(TAG, "Camera use cases bound successfully.")
        } catch (exc: Exception) {
            Log.e(TAG, "Use case binding failed", exc)
            showError("Camera binding failed: ${exc.localizedMessage}")
        }
    }

    private fun aspectRatio(width: Int, height: Int): Int {
        val previewRatio = max(width, height).toDouble() / min(width, height)
        return if (abs(previewRatio - RATIO_4_3_VALUE) <= abs(previewRatio - RATIO_16_9_VALUE)) {
            AspectRatio.RATIO_4_3
        } else {
            AspectRatio.RATIO_16_9
        }
    }

    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }

    @Deprecated("Deprecated in Java")
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
            if (allPermissionsGranted()) {
                setupCameraWhenPreviewReady()
            } else {
                Toast.makeText(this, "Camera permissions not granted.", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        Log.e(TAG, "Error shown: $message")
    }

    override fun onPause() {
        super.onPause()
        Log.d(TAG, "onPause called. Unbinding all camera use cases.")
        regionDrawingOverlayView.finalizeActiveRegion()
        currentlySelectedCourtButton?.let {
            val courtData = it.tag as? IndividualCourtData
            courtData?.let { cd -> regionDrawingOverlayView.finalizeActiveRegionByName(cd.name)}
        }
        cameraProvider?.unbindAll()
    }


    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy called. Shutting down camera executor.")
        cameraExecutor.shutdown()
    }

    companion object {
        private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
        private const val RATIO_4_3_VALUE = 4.0 / 3.0
        private const val RATIO_16_9_VALUE = 16.0 / 9.0
    }
}