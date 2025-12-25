<template>
  <div class="dashboard-editor-container">
    <!-- 顶部数据面板 -->
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">访客</div>
            <div class="card-panel-num">102,400</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">消息</div>
            <div class="card-panel-num">81,212</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">金额</div>
            <div class="card-panel-num">9,280</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="shopping" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">订单</div>
            <div class="card-panel-num">13,600</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 折线图 -->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <div class="chart-title">
        <span>expected</span>
        <span class="dot actual"></span>
        <span>actual</span>
      </div>
      <div id="line-chart" style="height:350px;width:100%;"></div>
    </el-row>

    <!-- 底部图表 -->
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <div id="radar-chart" style="height:300px;"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <div id="pie-chart" style="height:300px;"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <div id="bar-chart" style="height:300px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import * as echarts from 'echarts';
import { onMounted, onBeforeUnmount } from 'vue';

let lineChart = null;
let pieChart = null;
let barChart = null;
let radarChart = null;

onMounted(() => {
  initCharts();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
});

function initCharts() {
  // 折线图
  lineChart = echarts.init(document.getElementById('line-chart'));
  lineChart.setOption({
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisTick: { show: false }
    },
    grid: {
      left: 10, right: 10, bottom: 20, top: 30, containLabel: true
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, padding: [5, 10] },
    yAxis: { axisTick: { show: false } },
    series: [{
      name: 'expected', itemStyle: { color: '#FF005A', lineStyle: { color: '#FF005A', width: 2 } },
      smooth: true, type: 'line', data: [100, 120, 161, 134, 105, 160, 165], animationDuration: 2800, animationEasing: 'cubicInOut'
    },
    {
      name: 'actual', smooth: true, type: 'line',
      itemStyle: { color: '#3888fa', areaStyle: { color: '#f3f8ff' }, lineStyle: { color: '#3888fa', width: 2 } },
      data: [120, 82, 91, 154, 162, 140, 145], animationDuration: 2800, animationEasing: 'quadraticOut'
    }]
  });

  // 饼图
  pieChart = echarts.init(document.getElementById('pie-chart'));
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    series: [{
      name: 'WEEKLY SALES', type: 'pie', roseType: 'radius', radius: [15, 95], center: ['50%', '38%'],
      data: [
        { value: 320, name: 'Industries' }, { value: 240, name: 'Technology' },
        { value: 149, name: 'Forecasting' }, { value: 100, name: 'Gold' }, { value: 59, name: 'Forecasts' }
      ],
      animationEasing: 'cubicInOut', animationDuration: 2600
    }]
  });

  // 柱状图
  barChart = echarts.init(document.getElementById('bar-chart'));
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 10, left: '2%', right: '2%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisTick: { alignWithLabel: true } }],
    yAxis: [{ type: 'value', axisTick: { show: false } }],
    series: [{ name: 'page A', type: 'bar', stack: 'vcharts', barWidth: '60%', data: [79, 52, 200, 334, 390, 330, 220], animationDuration: 6000 }]
  });

  // 雷达图
  radarChart = echarts.init(document.getElementById('radar-chart'));
  radarChart.setOption({
    tooltip: {},
    radar: {
      radius: '66%', center: ['50%', '42%'], splitNumber: 8,
      indicator: [
        { name: 'Sales', max: 10000 }, { name: 'Administration', max: 20000 },
        { name: 'Information Techology', max: 20000 }, { name: 'Customer Support', max: 20000 },
        { name: 'Development', max: 20000 }, { name: 'Marketing', max: 20000 }
      ]
    },
    series: [{
      type: 'radar', symbol: 'none', lineStyle: { width: 1 },
      data: [
        { value: [5000, 7000, 12000, 11000, 15000, 14000], name: 'Allocated Budget' },
        { value: [4000, 9000, 15000, 15000, 13000, 11000], name: 'Expected Spending' }
      ],
      animationDuration: 3000
    }]
  });
}

function resizeCharts() {
  lineChart?.resize();
  pieChart?.resize();
  barChart?.resize();
  radarChart?.resize();
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people { background: #40c9c6; }
      .icon-message { background: #36a3f7; }
      .icon-money { background: #f4516c; }
      .icon-shopping { background: #34bfa3 }
    }

    .icon-people { color: #40c9c6; }
    .icon-message { color: #36a3f7; }
    .icon-money { color: #f4516c; }
    .icon-shopping { color: #34bfa3 }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

.chart-title {
  text-align: center;
  padding-bottom: 10px;
  font-size: 14px;
  color: #666;
  span { margin: 0 10px; }
}
</style>
