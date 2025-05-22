package com.example.vacantcourt.screens

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.Typeface
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.MotionEvent
import android.view.View
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

data class PlacedRegion(
    val courtName: String,
    var points: MutableList<PointF>
)

class RegionDrawingOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private enum class DragMode {
        NONE, VERTEX, POLYGON_BODY
    }

    private val regionPaint = Paint().apply {
        style = Paint.Style.STROKE
        isAntiAlias = true
    }
    private val regionFillPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val handlePaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }
    private val activeHandlePaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val textPaint = Paint().apply {
        textAlign = Paint.Align.LEFT
        isAntiAlias = true
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    }

    private val labelBackgroundPaint = Paint().apply {
        style = Paint.Style.FILL
    }

    private var activeCourtName: String? = null
    private var activePolygonPoints: MutableList<PointF>? = null

    private var sourceWidth: Int = 0
    private var sourceHeight: Int = 0

    private val placedRegions = mutableListOf<PlacedRegion>()

    private var lastTouchX: Float = 0f
    private var lastTouchY: Float = 0f
    private var currentDragMode = DragMode.NONE
    private var draggedVertexIndex: Int = -1

    private var visualHandleRadius: Float
    private var touchableHandleRadius: Float

    companion object {
        private const val TAG_OVERLAY = "RegionDrawingOverlay"
        private const val INITIAL_REGION_WIDTH_RATIO = 0.4f
        private const val INITIAL_REGION_HEIGHT_RATIO = 0.3f
        private const val LABEL_TEXT_PADDING_HORIZONTAL = 10f
        private const val LABEL_TEXT_PADDING_VERTICAL = 5f
    }

    init {
        visualHandleRadius = dpToPx(6f)
        touchableHandleRadius = dpToPx(15f)
        textPaint.textSize = dpToPx(14f)
        regionPaint.strokeWidth = dpToPx(3f)

        val typedValue = TypedValue()
        if (context.theme.resolveAttribute(androidx.appcompat.R.attr.colorPrimary, typedValue, true)) {
            activeHandlePaint.color = typedValue.data
        } else {
            activeHandlePaint.color = Color.CYAN // Fallback color
        }
    }

    private fun dpToPx(dp: Float): Float {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, resources.displayMetrics)
    }

    fun setSourceDimensions(width: Int, height: Int) {
        if (width <= 0 || height <= 0) {
            Log.w(TAG_OVERLAY, "setSourceDimensions called with invalid dimensions: $width x $height.")
            return
        }
        if (this.sourceWidth != width || this.sourceHeight != height) {
            Log.d(TAG_OVERLAY, "setSourceDimensions: new $width x $height. Old: $sourceWidth x $sourceHeight.")
            this.sourceWidth = width
            this.sourceHeight = height
            invalidate()
        }
    }

    fun startDrawingRegion(courtName: String) {
        Log.d(TAG_OVERLAY, "startDrawingRegion for '$courtName'. Source: $sourceWidth x $sourceHeight")
        activeCourtName?.let { oldName ->
            activePolygonPoints?.let {
                if (oldName != courtName) {
                    finalizeActiveRegionByName(oldName)
                }
            }
        }

        val existingPlacedRegion = placedRegions.find { it.courtName == courtName }
        if (existingPlacedRegion != null) {
            activeCourtName = courtName
            activePolygonPoints = existingPlacedRegion.points.map { PointF(it.x, it.y) }.toMutableList()
            placedRegions.remove(existingPlacedRegion)
            Log.d(TAG_OVERLAY, "Reactivated existing region for $courtName with ${activePolygonPoints?.size} points.")
        } else {
            if (sourceWidth <= 0 || sourceHeight <= 0) {
                Log.e(TAG_OVERLAY, "Cannot start new region '$courtName', source dimensions are invalid: $sourceWidth x $sourceHeight.")
                activePolygonPoints = mutableListOf(
                    PointF(10f, 10f), PointF(110f, 10f),
                    PointF(110f, 110f), PointF(10f, 110f)
                )
            } else {
                val regionWidth = sourceWidth * INITIAL_REGION_WIDTH_RATIO
                val regionHeight = sourceHeight * INITIAL_REGION_HEIGHT_RATIO
                val centerX = sourceWidth / 2f
                val centerY = sourceHeight / 2f

                activePolygonPoints = mutableListOf(
                    PointF(centerX - regionWidth / 2f, centerY - regionHeight / 2f),
                    PointF(centerX + regionWidth / 2f, centerY - regionHeight / 2f),
                    PointF(centerX + regionWidth / 2f, centerY + regionHeight / 2f),
                    PointF(centerX - regionWidth / 2f, centerY + regionHeight / 2f)
                )
                Log.d(TAG_OVERLAY, "Started new region for '$courtName' with default rectangle shape.")
            }
            activeCourtName = courtName
        }
        currentDragMode = DragMode.NONE
        draggedVertexIndex = -1
        invalidate()
    }

    fun removeRegion(courtName: String) {
        Log.d(TAG_OVERLAY, "Removing region for '$courtName'")
        if (activeCourtName == courtName) {
            activeCourtName = null
            activePolygonPoints = null
            currentDragMode = DragMode.NONE
            draggedVertexIndex = -1
        }
        placedRegions.removeAll { it.courtName == courtName }
        invalidate()
    }

    fun finalizeActiveRegionByName(courtName: String) {
        activeCourtName?.let { currentActiveName ->
            activePolygonPoints?.let { currentPoints ->
                if (currentActiveName == courtName && currentPoints.isNotEmpty()) {
                    val existingIndex = placedRegions.indexOfFirst { it.courtName == courtName }
                    if (existingIndex != -1) {
                        placedRegions[existingIndex].points = currentPoints.map { PointF(it.x, it.y) }.toMutableList()
                    } else {
                        placedRegions.add(PlacedRegion(courtName, currentPoints.map { PointF(it.x, it.y) }.toMutableList()))
                    }
                    Log.d(TAG_OVERLAY, "Finalized and placed region '$courtName' with ${currentPoints.size} points.")
                }
            }
        }
    }

    fun getPlacedRegions(): List<PlacedRegion> {
        val allRegions = mutableListOf<PlacedRegion>()
        allRegions.addAll(placedRegions.map { PlacedRegion(it.courtName, it.points.map { p -> PointF(p.x, p.y) }.toMutableList()) })

        activeCourtName?.let { name ->
            activePolygonPoints?.let { points ->
                if (points.isNotEmpty()) {
                    val existing = allRegions.find { it.courtName == name }
                    if (existing == null) {
                        allRegions.add(PlacedRegion(name, points.map { p -> PointF(p.x, p.y) }.toMutableList()))
                    } else {
                        existing.points = points.map { p -> PointF(p.x, p.y) }.toMutableList()
                    }
                }
            }
        }
        Log.d(TAG_OVERLAY, "getPlacedRegions returning ${allRegions.size} regions.")
        return allRegions.distinctBy { it.courtName }
    }

    private fun getDragModeAndVertex(x: Float, y: Float, points: List<PointF>): Pair<DragMode, Int> {
        points.forEachIndexed { index, point ->
            if (hypot(x - point.x, y - point.y) <= touchableHandleRadius) {
                return Pair(DragMode.VERTEX, index)
            }
        }
        if (isPointInPolygon(PointF(x, y), points)) {
            return Pair(DragMode.POLYGON_BODY, -1)
        }
        return Pair(DragMode.NONE, -1)
    }

    private fun isPointInPolygon(test: PointF, points: List<PointF>): Boolean {
        if (points.size < 3) return false
        var crossings = 0
        for (i in points.indices) {
            val p1 = points[i]
            val p2 = points[(i + 1) % points.size]

            if (((p1.y <= test.y && test.y < p2.y) || (p2.y <= test.y && test.y < p1.y)) &&
                (test.x < (p2.x - p1.x) * (test.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                crossings++
            }
        }
        return crossings % 2 == 1
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        activePolygonPoints?.let { currentPoints ->
            if (currentPoints.isEmpty()) return super.onTouchEvent(event)

            val touchX = event.x
            val touchY = event.y

            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    val (mode, index) = getDragModeAndVertex(touchX, touchY, currentPoints)
                    currentDragMode = mode
                    draggedVertexIndex = index

                    if (currentDragMode != DragMode.NONE) {
                        lastTouchX = touchX
                        lastTouchY = touchY
                        parent.requestDisallowInterceptTouchEvent(true)
                        Log.d(TAG_OVERLAY, "ACTION_DOWN: Mode $currentDragMode, Vertex $draggedVertexIndex on $activeCourtName")
                        invalidate()
                        return true
                    }
                }
                MotionEvent.ACTION_MOVE -> {
                    if (currentDragMode != DragMode.NONE) {
                        val dx = touchX - lastTouchX
                        val dy = touchY - lastTouchY

                        when (currentDragMode) {
                            DragMode.VERTEX -> {
                                if (draggedVertexIndex != -1 && draggedVertexIndex < currentPoints.size) {
                                    val vertex = currentPoints[draggedVertexIndex]
                                    vertex.x = (vertex.x + dx).coerceIn(0f, sourceWidth.toFloat())
                                    vertex.y = (vertex.y + dy).coerceIn(0f, sourceHeight.toFloat())
                                }
                            }
                            DragMode.POLYGON_BODY -> {
                                var canMoveX = true
                                var canMoveY = true
                                for (p in currentPoints) {
                                    if (p.x + dx < 0f || p.x + dx > sourceWidth.toFloat()) {
                                        canMoveX = false
                                    }
                                    if (p.y + dy < 0f || p.y + dy > sourceHeight.toFloat()) {
                                        canMoveY = false
                                    }
                                }
                                currentPoints.forEach { point ->
                                    if (canMoveX) point.x += dx
                                    if (canMoveY) point.y += dy

                                    point.x = point.x.coerceIn(0f, sourceWidth.toFloat())
                                    point.y = point.y.coerceIn(0f, sourceHeight.toFloat())
                                }
                            }
                            DragMode.NONE -> {}
                        }
                        lastTouchX = touchX
                        lastTouchY = touchY
                        invalidate()
                        return true
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    if (currentDragMode != DragMode.NONE) {
                        Log.d(TAG_OVERLAY, "ACTION_UP/CANCEL: Mode $currentDragMode on $activeCourtName")
                        currentDragMode = DragMode.NONE
                        draggedVertexIndex = -1
                        parent.requestDisallowInterceptTouchEvent(false)
                        invalidate()
                        return true
                    }
                }
            }
        }
        currentDragMode = DragMode.NONE
        draggedVertexIndex = -1
        return super.onTouchEvent(event)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (sourceWidth <= 0 || sourceHeight <= 0) return

        placedRegions.forEach { region ->
            drawPolygon(canvas, region.points, region.courtName, false)
        }

        activePolygonPoints?.let { points ->
            activeCourtName?.let { name ->
                if (points.isNotEmpty()) {
                    drawPolygon(canvas, points, name, true)
                    if (currentDragMode != DragMode.POLYGON_BODY) {
                        drawHandles(canvas, points)
                    }
                }
            }
        }
    }

    private val path = Path()
    private fun drawPolygon(canvas: Canvas, points: List<PointF>, name: String, isActive: Boolean) {
        if (points.size < 2) return

        path.reset()
        path.moveTo(points[0].x, points[0].y)
        for (i in 1 until points.size) {
            path.lineTo(points[i].x, points[i].y)
        }
        path.close()

        val currentRegionColor = if (isActive) Color.YELLOW else Color.DKGRAY
        regionPaint.color = currentRegionColor
        regionFillPaint.color = currentRegionColor
        regionFillPaint.alpha = if (isActive) 50 else 30
        regionPaint.alpha = if (isActive) 255 else 150

        canvas.drawPath(path, regionFillPaint)
        canvas.drawPath(path, regionPaint)

        labelBackgroundPaint.color = currentRegionColor
        labelBackgroundPaint.alpha = if (isActive) 200 else 120

        val textHeight = textPaint.textSize
        val textWidth = textPaint.measureText(name)

        val labelX = points[0].x
        val labelY = points[0].y

        val labelBgLeftCandidate = labelX + LABEL_TEXT_PADDING_HORIZONTAL
        val labelBgTopCandidate = labelY - textHeight - (LABEL_TEXT_PADDING_VERTICAL * 2)

        val labelBgRightCandidate = labelBgLeftCandidate + textWidth + LABEL_TEXT_PADDING_HORIZONTAL
        val labelBgBottomCandidate = labelBgTopCandidate + textHeight + (LABEL_TEXT_PADDING_VERTICAL * 2)

        val finalLabelBgLeft = labelBgLeftCandidate.coerceIn(0f, (sourceWidth - (textWidth + LABEL_TEXT_PADDING_HORIZONTAL *2)).toFloat())
        val finalLabelBgTop = labelBgTopCandidate.coerceIn(0f, (sourceHeight - (textHeight + LABEL_TEXT_PADDING_VERTICAL * 2)).toFloat())
        val finalLabelBgRight = (finalLabelBgLeft + textWidth + LABEL_TEXT_PADDING_HORIZONTAL * 2).coerceAtMost(sourceWidth.toFloat())
        val finalLabelBgBottom = (finalLabelBgTop + textHeight + LABEL_TEXT_PADDING_VERTICAL * 2).coerceAtMost(sourceHeight.toFloat())


        if (finalLabelBgRight > finalLabelBgLeft && finalLabelBgBottom > finalLabelBgTop) {
            canvas.drawRect(finalLabelBgLeft, finalLabelBgTop, finalLabelBgRight, finalLabelBgBottom, labelBackgroundPaint)
        }

        textPaint.color = if (isActive) Color.BLACK else Color.LTGRAY
        canvas.drawText(
            name,
            finalLabelBgLeft + LABEL_TEXT_PADDING_HORIZONTAL,
            finalLabelBgBottom - LABEL_TEXT_PADDING_VERTICAL - textPaint.fontMetrics.descent,
            textPaint
        )
    }

    private fun drawHandles(canvas: Canvas, points: List<PointF>) {
        handlePaint.color = Color.WHITE
        handlePaint.alpha = 200
        activeHandlePaint.alpha = 255

        points.forEachIndexed { index, point ->
            if (currentDragMode == DragMode.VERTEX && index == draggedVertexIndex) {
                canvas.drawCircle(point.x, point.y, visualHandleRadius + dpToPx(1f), activeHandlePaint) // Slightly larger active handle
            } else {
                canvas.drawCircle(point.x, point.y, visualHandleRadius, handlePaint)
            }
        }
    }
}