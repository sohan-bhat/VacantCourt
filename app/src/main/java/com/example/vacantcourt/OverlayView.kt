package com.example.vacantcourt

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.RectF
import android.graphics.Typeface
import android.util.AttributeSet
import android.util.Log
import android.view.View
import com.example.vacantcourt.data.PointData

class OverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var detectionResults: List<DetectionResult>? = null
    private var configuredCourtNormalizedPoints: List<Pair<String, List<PointData>>> = emptyList()
    private var scaledCourtPolygons: List<Pair<String, List<PointF>>> = emptyList()

    private val detectionBoxPaint = Paint()
    private val detectionTextPaint = Paint()
    private val regionStrokePaint = Paint()
    private val regionFillPaint = Paint()
    private val regionTextPaint = Paint()
    private val path = Path()

    private var imageOriginalWidth: Int = 1
    private var imageOriginalHeight: Int = 1
    private var viewWidth: Int = 0
    private var viewHeight: Int = 0

    companion object {
        private const val TAG = "OverlayView"
    }

    init {
        detectionBoxPaint.color = Color.RED
        detectionBoxPaint.strokeWidth = 7F
        detectionBoxPaint.style = Paint.Style.STROKE

        detectionTextPaint.color = Color.WHITE
        detectionTextPaint.style = Paint.Style.FILL
        detectionTextPaint.textSize = 40f

        regionStrokePaint.color = Color.CYAN
        regionStrokePaint.strokeWidth = 7F
        regionStrokePaint.style = Paint.Style.STROKE
        regionStrokePaint.alpha = 200

        regionFillPaint.color = Color.CYAN
        regionFillPaint.style = Paint.Style.FILL
        regionFillPaint.alpha = 50


        regionTextPaint.color = Color.CYAN
        regionTextPaint.style = Paint.Style.FILL
        regionTextPaint.textSize = 30f
        regionTextPaint.alpha = 200
        regionTextPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        viewWidth = w
        viewHeight = h
        scaleConfiguredRegions()
    }

    private fun scaleConfiguredRegions() {
        if (viewWidth == 0 || viewHeight == 0 || configuredCourtNormalizedPoints.isEmpty()) {
            scaledCourtPolygons = emptyList()
            return
        }
        scaledCourtPolygons = configuredCourtNormalizedPoints.map { (name, normalizedPointsList) ->
            val absolutePoints = normalizedPointsList.map { pointData ->
                PointF(pointData.x * viewWidth, pointData.y * viewHeight)
            }
            Pair(name, absolutePoints)
        }
        Log.d(TAG, "Scaled ${scaledCourtPolygons.size} polygon regions for view dimensions: $viewWidth x $viewHeight")
        invalidate()
    }

    fun setConfiguredRegions(
        regions: List<Pair<String, List<PointData>>>,
        previewWidth: Int,
        previewHeight: Int
    ) {
        Log.d(TAG, "setConfiguredRegions called with ${regions.size} polygon regions. Preview: $previewWidth x $previewHeight")
        this.configuredCourtNormalizedPoints = regions
        if (this.viewWidth == 0 || this.viewHeight == 0) {
            this.viewWidth = previewWidth
            this.viewHeight = previewHeight
        }
        scaleConfiguredRegions()
    }


    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        for ((name, pointsList) in scaledCourtPolygons) {
            if (pointsList.size >= 3) {
                path.reset()
                path.moveTo(pointsList[0].x, pointsList[0].y)
                for (i in 1 until pointsList.size) {
                    path.lineTo(pointsList[i].x, pointsList[i].y)
                }
                path.close()
                canvas.drawPath(path, regionFillPaint)
                canvas.drawPath(path, regionStrokePaint)

                if (pointsList.isNotEmpty()) {
                    var cx = 0f
                    var cy = 0f
                    for (p in pointsList) {
                        cx += p.x
                        cy += p.y
                    }
                    val centroidX = cx / pointsList.size
                    val centroidY = cy / pointsList.size
                    regionTextPaint.textAlign = Paint.Align.CENTER
                    canvas.drawText(name, centroidX, centroidY + regionTextPaint.textSize / 3, regionTextPaint)
                }
            }
        }

        detectionResults?.let { currentResults ->
            if (imageOriginalWidth <= 1 || imageOriginalHeight <= 1 || width == 0 || height == 0) return

            val scaleX = width.toFloat() / imageOriginalWidth
            val scaleY = height.toFloat() / imageOriginalHeight

            for (detection in currentResults) {
                if (detection.className.equals("person", ignoreCase = true)) {
                    val boundingBox = detection.boundingBox
                    val left = boundingBox.left * scaleX
                    val top = boundingBox.top * scaleY
                    val right = boundingBox.right * scaleX
                    val bottom = boundingBox.bottom * scaleY
                    val drawableRect = RectF(left, top, right, bottom)
                    canvas.drawRect(drawableRect, detectionBoxPaint)
                    val label = "${detection.className} ${String.format("%.2f", detection.confidence)}"
                    detectionTextPaint.textAlign = Paint.Align.LEFT
                    canvas.drawText(label, left, top - 10, detectionTextPaint)
                }
            }
        }
    }

    fun setResults(
        newDetectionResults: List<DetectionResult>,
        imageHeight: Int,
        imageWidth: Int
    ) {
        this.detectionResults = newDetectionResults
        this.imageOriginalHeight = imageHeight
        this.imageOriginalWidth = imageWidth
        invalidate()
    }

    fun clear() {
        detectionResults = null
        configuredCourtNormalizedPoints = emptyList()
        scaledCourtPolygons = emptyList()
        invalidate()
    }
}