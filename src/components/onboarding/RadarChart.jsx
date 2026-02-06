/**
 * Radar Chart component using Chart.js
 * Displays the user's 5D personality vector
 */

import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { VECTOR_AXES } from '../../config/personas'

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
)

export function RadarChart({ userVector, accentColor = '#00FFCC', size = 280 }) {
  const chartRef = useRef(null)

  const data = {
    labels: VECTOR_AXES.map(axis => axis.short),
    datasets: [
      {
        label: 'Your Profile',
        data: userVector,
        backgroundColor: `${accentColor}30`,
        borderColor: accentColor,
        borderWidth: 2,
        pointBackgroundColor: accentColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          display: false,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          circular: true,
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'SF Mono', 'Fira Code', monospace",
            size: 11,
            weight: '500',
          },
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'SF Mono', monospace",
        },
        bodyFont: {
          family: "'SF Mono', monospace",
        },
        callbacks: {
          label: (context) => {
            const axis = VECTOR_AXES[context.dataIndex]
            const value = context.raw
            if (value >= 50) {
              return `${axis.right}: ${value}%`
            } else {
              return `${axis.left}: ${100 - value}%`
            }
          },
        },
      },
      legend: {
        display: false,
      },
    },
    animation: {
      duration: 300,
    },
  }

  return (
    <div style={{ width: size, height: size }} className="mx-auto">
      <Radar ref={chartRef} data={data} options={options} />
    </div>
  )
}
