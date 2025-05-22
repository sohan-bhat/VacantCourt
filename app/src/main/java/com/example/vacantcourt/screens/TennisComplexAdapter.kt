package com.example.vacantcourt.screens

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.vacantcourt.R
import com.example.vacantcourt.data.TennisComplexData

class TennisComplexAdapter(
    private var tennisComplexes: List<TennisComplexData>,
    private val onEditClick: (TennisComplexData) -> Unit,
    private val onViewClick: (TennisComplexData) -> Unit
) : RecyclerView.Adapter<TennisComplexAdapter.ViewHolder>() {

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val nameTextView: TextView = itemView.findViewById(R.id.textViewComplexName)
        private val unconfiguredCountTextView: TextView = itemView.findViewById(R.id.textViewUnconfiguredCount)
        private val buttonViewLive: ImageButton = itemView.findViewById(R.id.buttonViewLive)
        private val buttonEditConfiguration: ImageButton = itemView.findViewById(R.id.buttonEditConfiguration)

        fun bind(tennisComplex: TennisComplexData) {
            nameTextView.text = tennisComplex.name
            val unconfiguredCount = tennisComplex.courts.count { !it.isConfigured }

            val unconfiguredCourtsText = itemView.context.resources.getQuantityString(
                R.plurals.unconfigured_courts_count,
                unconfiguredCount,
                unconfiguredCount
            )
            unconfiguredCountTextView.text = if (unconfiguredCount > 0) {
                unconfiguredCourtsText
            } else {
                if (tennisComplex.courts.isEmpty()) {
                    "No courts defined"
                } else {
                    itemView.context.getString(R.string.all_courts_configured)
                }
            }

            buttonEditConfiguration.setOnClickListener { onEditClick(tennisComplex) }
            buttonViewLive.setOnClickListener { onViewClick(tennisComplex) }

            buttonViewLive.visibility = View.VISIBLE
            buttonEditConfiguration.visibility = View.VISIBLE
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_tennis_complex, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(tennisComplexes[position])
    }

    override fun getItemCount(): Int = tennisComplexes.size

    fun updateData(newTennisComplexes: List<TennisComplexData>) {
        this.tennisComplexes = newTennisComplexes
        notifyDataSetChanged()
    }
}