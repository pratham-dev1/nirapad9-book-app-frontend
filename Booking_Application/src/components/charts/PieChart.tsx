import React from 'react'
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { DefaultizedPieValueType } from '@mui/x-charts';



const getArcLabel = (params: DefaultizedPieValueType): any => {
    return `${params.percentage} %`
};

const PieChartComponent: React.FC<{data?: any}> = ({data}) => {
    return (
        <PieChart
            series={[
                {
                    data: data || [],
                    innerRadius: 50,
                    outerRadius: 100,
                    arcLabel: getArcLabel,
                },
            ]}
            sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',
                    fontSize: 14,
                },
            }}
            height={250}
            width={700}
        // slotProps={{
        //     legend: { hidden: true },
        // }}
        />
    )
}

export default PieChartComponent
