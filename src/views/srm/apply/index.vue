<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>供应商入驻申请审核</span>
        </div>
      </template>
      <el-table v-loading="loading" :data="applyList">
        <el-table-column label="企业名称" align="center" prop="companyName" />
        <el-table-column label="社会信用代码" align="center" prop="socialCode" />
        <el-table-column label="联系人" align="center" prop="contactName" />
        <el-table-column label="申请时间" align="center" prop="createTime" />
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'warning'">
              {{ scope.row.status === '1' ? '已通过' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="View">查看详情</el-button>
            <el-button link type="success" icon="Check" v-if="scope.row.status === '0'">通过</el-button>
            <el-button link type="danger" icon="Close" v-if="scope.row.status === '0'">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
const loading = ref(false);
const applyList = ref([
  { companyName: '模拟供应商A', socialCode: '91310000XXXXXX1', contactName: '王经理', createTime: '2025-12-25', status: '0' },
  { companyName: '模拟供应商B', socialCode: '91310000XXXXXX2', contactName: '李总', createTime: '2025-12-24', status: '1' }
]);
</script>