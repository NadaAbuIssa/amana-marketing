"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { Monitor, Smartphone, MousePointer, DollarSign, TrendingUp, Target } from 'lucide-react';
import { MarketingData, DevicePerformance } from '../../src/types/marketing';
import data from '../data/marketing.json';

export default function DeviceView() {
  const marketingData = data as MarketingData;
  // Aggregate device data
  const aggregateDeviceData = () => {
    if (!marketingData?.campaigns) return null;

    const deviceData = {
      desktop: { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
      mobile: { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
    };

    marketingData.campaigns.forEach(campaign => {
      campaign.device_performance?.forEach(device => {
        const deviceType = device.device.toLowerCase();
        
        if (deviceType.includes('desktop') || deviceType.includes('pc')) {
          deviceData.desktop.impressions += device.impressions;
          deviceData.desktop.clicks += device.clicks;
          deviceData.desktop.conversions += device.conversions;
          deviceData.desktop.spend += device.spend;
          deviceData.desktop.revenue += device.revenue;
        } else if (deviceType.includes('mobile') || deviceType.includes('phone') || deviceType.includes('smartphone')) {
          deviceData.mobile.impressions += device.impressions;
          deviceData.mobile.clicks += device.clicks;
          deviceData.mobile.conversions += device.conversions;
          deviceData.mobile.spend += device.spend;
          deviceData.mobile.revenue += device.revenue;
        }
      });
    });

    // Calculate CTR and conversion rates
    const processDeviceData = (device: typeof deviceData.desktop) => ({
      ...device,
      ctr: device.impressions > 0 ? ((device.clicks / device.impressions) * 100).toFixed(2) : '0.00',
      conversionRate: device.clicks > 0 ? ((device.conversions / device.clicks) * 100).toFixed(2) : '0.00',
      roas: device.spend > 0 ? (device.revenue / device.spend).toFixed(2) : '0.00'
    });

    const processedDesktop = processDeviceData(deviceData.desktop);
    const processedMobile = processDeviceData(deviceData.mobile);

    // Prepare data for charts
    const spendData = [
      { label: 'Desktop', value: deviceData.desktop.spend },
      { label: 'Mobile', value: deviceData.mobile.spend }
    ];

    const revenueData = [
      { label: 'Desktop', value: deviceData.desktop.revenue },
      { label: 'Mobile', value: deviceData.mobile.revenue }
    ];

    // Prepare data for table
    const tableData = [
      {
        device: 'Desktop',
        impressions: processedDesktop.impressions,
        clicks: processedDesktop.clicks,
        conversions: processedDesktop.conversions,
        spend: processedDesktop.spend,
        revenue: processedDesktop.revenue,
        ctr: processedDesktop.ctr,
        conversionRate: processedDesktop.conversionRate,
        roas: processedDesktop.roas
      },
      {
        device: 'Mobile',
        impressions: processedMobile.impressions,
        clicks: processedMobile.clicks,
        conversions: processedMobile.conversions,
        spend: processedMobile.spend,
        revenue: processedMobile.revenue,
        ctr: processedMobile.ctr,
        conversionRate: processedMobile.conversionRate,
        roas: processedMobile.roas
      }
    ];

    return {
      deviceData,
      spendData,
      revenueData,
      tableData
    };
  };

  const deviceData = aggregateDeviceData();

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
                Device View
              </h1>
              <p className="text-gray-300 mt-4 text-lg">
                Analyze marketing performance across different devices
              </p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {deviceData && (
            <>
              {/* Card Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <CardMetric
                  title="Total Impressions"
                  value={(deviceData.deviceData.desktop.impressions + deviceData.deviceData.mobile.impressions).toLocaleString()}
                  icon={<Target className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Clicks"
                  value={(deviceData.deviceData.desktop.clicks + deviceData.deviceData.mobile.clicks).toLocaleString()}
                  icon={<MousePointer className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Spend"
                  value={`$${(deviceData.deviceData.desktop.spend + deviceData.deviceData.mobile.spend).toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Revenue"
                  value={`$${(deviceData.deviceData.desktop.revenue + deviceData.deviceData.mobile.revenue).toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>

              {/* Bar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <BarChart
                  title="Spend by Device"
                  data={deviceData.spendData}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
                <BarChart
                  title="Revenue by Device"
                  data={deviceData.revenueData}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              {/* Performance Table */}
              <Table
                title="Device Performance Details"
                columns={[
                  { key: 'device', header: 'Device', sortable: true },
                  { key: 'impressions', header: 'Impressions', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'clicks', header: 'Clicks', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'conversions', header: 'Conversions', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'spend', header: 'Spend ($)', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'revenue', header: 'Revenue ($)', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'ctr', header: 'CTR (%)', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'conversionRate', header: 'Conv. Rate (%)', sortable: true, sortType: 'number', align: 'right' },
                  { key: 'roas', header: 'ROAS', sortable: true, sortType: 'number', align: 'right' }
                ]}
                data={deviceData.tableData}
                defaultSort={{ key: 'revenue', direction: 'desc' }}
              />
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
