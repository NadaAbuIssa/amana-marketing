"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { LineChart } from '../../src/components/ui/line-chart';
import { Footer } from '../../src/components/ui/footer';
import { MarketingData, WeeklyPerformance } from '../../src/types/marketing';
import data from '../data/marketing.json';
export default function WeeklyView() {
  const marketingData = data as MarketingData;


  // Aggregate weekly data
  const aggregateWeeklyData = () => {
    if (!marketingData?.campaigns) return null;

    const weeklyData: { [key: string]: { revenue: number; spend: number } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.weekly_performance?.forEach(week => {
        const weekKey = week.week_start;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { revenue: 0, spend: 0 };
        }
        
        weeklyData[weekKey].revenue += week.revenue;
        weeklyData[weekKey].spend += week.spend;
      });
    });

    // Convert to arrays and sort by date
    const revenueData = Object.entries(weeklyData)
      .map(([weekStart, data]) => ({
        label: new Date(weekStart).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: data.revenue
      }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

    const spendData = Object.entries(weeklyData)
      .map(([weekStart, data]) => ({
        label: new Date(weekStart).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: data.spend
      }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

    return { revenueData, spendData };
  };

  const weeklyData = aggregateWeeklyData();

  if (!marketingData) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!marketingData) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error: { 'No data available' }</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View
              </h1>
              <p className="text-gray-300 mt-4 text-lg">
                Track marketing performance over time
              </p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {weeklyData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                title="Revenue by Week"
                data={weeklyData.revenueData}
                height={400}
                formatValue={(value) => `$${value.toLocaleString()}`}
              />
              <LineChart
                title="Spend by Week"
                data={weeklyData.spendData}
                height={400}
                formatValue={(value) => `$${value.toLocaleString()}`}
              />
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
