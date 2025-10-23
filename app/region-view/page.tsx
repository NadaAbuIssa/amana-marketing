"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { BubbleMap } from '../../src/components/ui/bubble-map';
import { Footer } from '../../src/components/ui/footer';
import { MarketingData, RegionalPerformance } from '../../src/types/marketing';
import data from '../data/marketing.json';

export default function RegionView() {
  const marketingData = data as MarketingData;


  // Aggregate regional data
  const aggregateRegionalData = () => {
    if (!marketingData?.campaigns) return null;

    const regionalData: { [key: string]: { revenue: number; spend: number; country: string } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.regional_performance?.forEach(region => {
        const regionKey = region.region;
        
        if (!regionalData[regionKey]) {
          regionalData[regionKey] = { 
            revenue: 0, 
            spend: 0, 
            country: region.country 
          };
        }
        
        regionalData[regionKey].revenue += region.revenue;
        regionalData[regionKey].spend += region.spend;
      });
    });

    // Convert to array format for BubbleMap
    const bubbleMapData = Object.entries(regionalData).map(([region, data]) => ({
      region,
      revenue: data.revenue,
      spend: data.spend,
      country: data.country
    }));

    return bubbleMapData;
  };

  const regionalData = aggregateRegionalData();

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
                Region View
              </h1>
              <p className="text-gray-300 mt-4 text-lg">
                Explore marketing performance across different regions
              </p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {regionalData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BubbleMap
                data={regionalData}
                mode="revenue"
                title="Revenue by Region"
              />
              <BubbleMap
                data={regionalData}
                mode="spend"
                title="Spend by Region"
              />
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
