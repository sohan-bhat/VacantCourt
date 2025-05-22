package com.example.vacantcourt.screens

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.example.vacantcourt.R
import com.example.vacantcourt.data.TennisComplexData
import com.example.vacantcourt.LiveDetectionActivity
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase

class CourtSelectionActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: TennisComplexAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var textViewEmptyList: TextView
    private lateinit var toolbar: Toolbar
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout

    private val db = Firebase.firestore
    private val TAG = "CourtSelectionActivity"
    private val TENNIS_COMPLEXES_COLLECTION = "Courts"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_court_selection)

        toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)

        progressBar = findViewById(R.id.progressBar)
        textViewEmptyList = findViewById(R.id.textViewEmptyList)
        recyclerView = findViewById(R.id.recyclerViewTennisComplexes)
        recyclerView.layoutManager = LinearLayoutManager(this)

        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)

        adapter = TennisComplexAdapter(
            emptyList(),
            onEditClick = { selectedComplex ->
                Log.d(TAG, "Edit clicked for Tennis Complex: Name='${selectedComplex.name}', ID='${selectedComplex.id}'")
                val intent = Intent(this, CourtConfigurationActivity::class.java).apply {
                    putExtra("COMPLEX_ID", selectedComplex.id)
                    putExtra("COMPLEX_NAME", selectedComplex.name)
                }
                startActivity(intent)
            },
            onViewClick = { selectedComplex ->
                Log.d(TAG, "View clicked for Tennis Complex: Name='${selectedComplex.name}', ID='${selectedComplex.id}'")
                val configuredCourts = selectedComplex.courts.filter { it.isConfigured && it.regionPoints != null && it.regionPoints!!.isNotEmpty() }
                if (configuredCourts.isNotEmpty()) {
                    val intent = Intent(this, LiveDetectionActivity::class.java).apply {
                        putExtra("COMPLEX_ID", selectedComplex.id)
                        putExtra("COMPLEX_NAME", selectedComplex.name)
                    }
                    startActivity(intent)
                } else {
                    Toast.makeText(this, getString(R.string.no_courts_configured_for_viewing_live), Toast.LENGTH_SHORT).show()
                }
            }
        )
        recyclerView.adapter = adapter

        swipeRefreshLayout.setOnRefreshListener {
            Log.d(TAG, "Swipe to refresh triggered.")
            fetchTennisComplexes()
        }

        swipeRefreshLayout.setColorSchemeResources(
            android.R.color.holo_blue_bright,
            android.R.color.holo_green_light,
            android.R.color.holo_orange_light,
            android.R.color.holo_red_light
        )
    }

    override fun onResume() {
        super.onResume()
        Log.d(TAG, "onResume: Fetching tennis complexes.")
        fetchTennisComplexes()
    }

    private fun fetchTennisComplexes() {
        if (!swipeRefreshLayout.isRefreshing) {
            progressBar.visibility = View.VISIBLE
        }
        recyclerView.visibility = View.GONE
        textViewEmptyList.visibility = View.GONE

        db.collection(TENNIS_COMPLEXES_COLLECTION)
            .get()
            .addOnSuccessListener { result ->
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false

                val complexList = mutableListOf<TennisComplexData>()
                for (document in result) {
                    try {
                        val complex = document.toObject(TennisComplexData::class.java)
                        val complexWithId = complex.copy(id = document.id)
                        Log.d(TAG, "Fetched complex: ID=${complexWithId.id}, Name=${complexWithId.name}, Courts=${complexWithId.courts.size}")
                        complexList.add(complexWithId)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error converting document ${document.id} to TennisComplexData", e)
                    }
                }

                if (complexList.isEmpty()) {
                    textViewEmptyList.text = getString(R.string.no_tennis_complexes_found)
                    textViewEmptyList.visibility = View.VISIBLE
                    recyclerView.visibility = View.GONE
                } else {
                    textViewEmptyList.visibility = View.GONE
                    recyclerView.visibility = View.VISIBLE
                }
                adapter.updateData(complexList)
                Log.d(TAG, "Fetched ${complexList.size} tennis complexes.")
            }
            .addOnFailureListener { exception ->
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false

                textViewEmptyList.text = getString(R.string.error_fetching_data, exception.localizedMessage)
                textViewEmptyList.visibility = View.VISIBLE
                recyclerView.visibility = View.GONE
                Log.w(TAG, "Error getting documents from $TENNIS_COMPLEXES_COLLECTION: ", exception)
                Toast.makeText(this, getString(R.string.error_fetching_data, exception.localizedMessage), Toast.LENGTH_LONG).show()
            }
    }
}