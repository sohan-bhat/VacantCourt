package com.example.vacantcourt.data
import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName

data class PointData(
    val x: Float = 0f,
    val y: Float = 0f
) {
    constructor() : this(0f, 0f)
}

data class IndividualCourtData(
    val name: String = "",
    @get:PropertyName("isConfigured") @set:PropertyName("isConfigured")
    var isConfigured: Boolean = false,
    var status: String = "available",
    val surface: String = "",
    var regionPoints: List<PointData>? = null,
    val lastUpdatedStatus: Long
) {
    constructor() : this(lastUpdatedStatus = System.currentTimeMillis())
}

data class TennisComplexData(
    @DocumentId val id: String = "",
    val name: String = "",
    val courts: List<IndividualCourtData> = emptyList()
) {
    constructor() : this("", "", emptyList())

    fun hasUnconfiguredIndividualCourts(): Boolean {
        return courts.any { !it.isConfigured }
    }
}