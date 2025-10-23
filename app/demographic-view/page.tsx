"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { Users, UserCheck, TrendingUp, Target, MousePointer, DollarSign, BarChart3 } from 'lucide-react';
import { MarketingData, DemographicBreakdown } from '../../src/types/marketing';
import data from '../data/marketing.json';

export default function DemographicView() {
  // Aggregate demographic data
  const aggregateDemographicData = () => {
    if (!data?.campaigns) return null;
    const marketingData = data;

    const maleData = { clicks: 0, spend: 0, revenue: 0 };
    const femaleData = { clicks: 0, spend: 0, revenue: 0 };
    const ageGroupSpend: { [key: string]: number } = {};
    const ageGroupRevenue: { [key: string]: number } = {};
    const maleAgeGroups: { [key: string]: any } = {};
    const femaleAgeGroups: { [key: string]: any } = {};

    data.campaigns.forEach(campaign => {
      campaign.demographic_breakdown?.forEach(breakdown => {
        const { age_group, gender, performance } = breakdown;
        
        // Calculate metrics for this demographic
        const impressions = performance.impressions;
        const clicks = performance.clicks;
        const conversions = performance.conversions;
        const spend = (campaign.spend * breakdown.percentage_of_audience) / 100;
        const revenue = (campaign.revenue * breakdown.percentage_of_audience) / 100;

        if (gender.toLowerCase() === 'male') {
          maleData.clicks += clicks;
          maleData.spend += spend;
          maleData.revenue += revenue;

          if (!maleAgeGroups[age_group]) {
            maleAgeGroups[age_group] = {
              ageGroup: age_group,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              spend: 0,
              revenue: 0
            };
          }
          maleAgeGroups[age_group].impressions += impressions;
          maleAgeGroups[age_group].clicks += clicks;
          maleAgeGroups[age_group].conversions += conversions;
          maleAgeGroups[age_group].spend += spend;
          maleAgeGroups[age_group].revenue += revenue;
        } else if (gender.toLowerCase() === 'female') {
          femaleData.clicks += clicks;
          femaleData.spend += spend;
          femaleData.revenue += revenue;

          if (!femaleAgeGroups[age_group]) {
            femaleAgeGroups[age_group] = {
              ageGroup: age_group,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              spend: 0,
              revenue: 0
            };
          }
          femaleAgeGroups[age_group].impressions += impressions;
          femaleAgeGroups[age_group].clicks += clicks;
          femaleAgeGroups[age_group].conversions += conversions;
          femaleAgeGroups[age_group].spend += spend;
          femaleAgeGroups[age_group].revenue += revenue;
        }

        // Aggregate by age group for charts
        ageGroupSpend[age_group] = (ageGroupSpend[age_group] || 0) + spend;
        ageGroupRevenue[age_group] = (ageGroupRevenue[age_group] || 0) + revenue;
      });
    });

    // Calculate CTR and conversion rates for tables
    const processAgeGroupData = (ageGroups: { [key: string]: any }) => {
      return Object.values(ageGroups).map((group: any) => ({
        ...group,
        ctr: group.impressions > 0 ? ((group.clicks / group.impressions) * 100).toFixed(2) : '0.00',
        conversionRate: group.clicks > 0 ? ((group.conversions / group.clicks) * 100).toFixed(2) : '0.00'
      }));
    };

    return {
      maleData,
      femaleData,
      ageGroupSpend: Object.entries(ageGroupSpend).map(([label, value]) => ({ label, value })),
      ageGroupRevenue: Object.entries(ageGroupRevenue).map(([label, value]) => ({ label, value })),
      maleAgeGroups: processAgeGroupData(maleAgeGroups),
      femaleAgeGroups: processAgeGroupData(femaleAgeGroups)
    };
  };

  const demographicData = aggregateDemographicData();

  if (!data) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) {
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
                Demographic View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {demographicData && (
            <>
              {/* Card Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <CardMetric
                  title="Total Clicks by Males"
                  value={demographicData.maleData.clicks.toLocaleString()}
                  icon={<MousePointer className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Spend by Males"
                  value={`$${demographicData.maleData.spend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Revenue by Males"
                  value={`$${demographicData.maleData.revenue.toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Clicks by Females"
                  value={demographicData.femaleData.clicks.toLocaleString()}
                  icon={<MousePointer className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Spend by Females"
                  value={`$${demographicData.femaleData.spend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <CardMetric
                  title="Total Revenue by Females"
                  value={`$${demographicData.femaleData.revenue.toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>

              {/* Bar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <BarChart
                  title="Total Spend by Age Group"
                  data={demographicData.ageGroupSpend}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
                <BarChart
                  title="Total Revenue by Age Group"
                  data={demographicData.ageGroupRevenue}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />
              </div>

              {/* Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Table
                  title="Campaign Performance by Male Age Groups"
                  columns={[
                    { key: 'ageGroup', header: 'Age Group', sortable: true },
                    { key: 'impressions', header: 'Impressions', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'clicks', header: 'Clicks', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'conversions', header: 'Conversions', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'ctr', header: 'CTR (%)', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'conversionRate', header: 'Conversion Rate (%)', sortable: true, sortType: 'number', align: 'right' }
                  ]}
                  data={demographicData.maleAgeGroups}
                />
                <Table
                  title="Campaign Performance by Female Age Groups"
                  columns={[
                    { key: 'ageGroup', header: 'Age Group', sortable: true },
                    { key: 'impressions', header: 'Impressions', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'clicks', header: 'Clicks', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'conversions', header: 'Conversions', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'ctr', header: 'CTR (%)', sortable: true, sortType: 'number', align: 'right' },
                    { key: 'conversionRate', header: 'Conversion Rate (%)', sortable: true, sortType: 'number', align: 'right' }
                  ]}
                  data={demographicData.femaleAgeGroups}
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
