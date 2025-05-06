import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const BarChartComponent = () => {
  const namesArray = ['Completed', 'Payment', 'C', 'D'];
  const valuesArray = [3, 4, 1, 2]
  return (
    <BarChart
      series={[{ data: valuesArray, id: "cId", }]}
      grid={{ horizontal: true }}
      xAxis={[
        {
          data: namesArray,
          scaleType: "band",
          colorMap: {
            type: "ordinal",
            values: namesArray,
            colors: ['#82a8cd', '#08457e', '#66cdaa', '#ff819f'],
          },
        },
      ]}
      yAxis={[{ max: 5 }]}
      width={400}
      height={300}
    />
  );
}

export default BarChartComponent;