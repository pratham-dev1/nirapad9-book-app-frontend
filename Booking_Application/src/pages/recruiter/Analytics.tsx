import React from "react";
import PieChartComponent from "../../components/charts/PieChart";
import BarChartComponent from "../../components/charts/BarChart";
import LineChartComponent from "../../components/charts/LineChart";
import { useQuery } from "react-query";
import request from "../../services/http";
import { GET_SKILLS_FOR_BOOKED_SLOTS } from "../../constants/Urls";

const Analytics = () => {
  const colors = ['#008080', '#065535', '#133337', '#ffc0cb', '#ff80ed', '#b0e0e6', '#40e0d0', '#800080', '#003366', '#ffa500']
  const {data} = useQuery('get-skills-for-booked-slots', ()=> request(GET_SKILLS_FOR_BOOKED_SLOTS),{
    select: (data:any) => {
      const totalCount = data?.data?.reduce((acc: number, curr: any) => acc + +curr.count, 0)
      return data?.data.map((item: any, index:number) => ({label: item.skillName, value: item.count, percentage: ((item.count/totalCount)*100).toFixed(1) ,color: colors[index]}))
    }
  })
  return (
    <>
      <PieChartComponent data={data || []}/>
      <BarChartComponent />
      <LineChartComponent />
    </>
  );
};

export default Analytics;
