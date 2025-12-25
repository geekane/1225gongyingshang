<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="供应商名称" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入供应商名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="infoList">
      <el-table-column label="供应商编号" align="center" prop="supplierCode" />
      <el-table-column label="供应商名称" align="center" prop="companyName" />
      <el-table-column label="分类" align="center" prop="type" />
      <el-table-column label="等级" align="center" prop="level">
        <template #default="scope">
          <el-rate v-model="scope.row.level" disabled />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" icon="Edit">修改</el-button>
          <el-button link type="primary" icon="Delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
const loading = ref(false);
const queryParams = ref({ companyName: '' });
const infoList = ref([
  { supplierCode: 'SUP001', companyName: '上海某某制造公司', type: '生产类', level: 4 },
  { supplierCode: 'SUP002', companyName: '北京某某商贸公司', type: '非生产类', level: 3 }
]);

function handleQuery() {}
function resetQuery() {}
</script>