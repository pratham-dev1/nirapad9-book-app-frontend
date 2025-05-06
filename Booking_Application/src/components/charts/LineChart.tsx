import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart';

const LineChartComponent = () => {
  return (
    <LineChart
      xAxis={[{ data: [0, 2, 3, 5, 8, 10] }]}
      grid={{ horizontal: true }}
      series={[
        {
          data: [0,2, 5.5, 2, 8.5, 1.5],
        },
      ]}
      width={800}
      height={300}
    />
  )
}

export default LineChartComponent
