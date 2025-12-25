<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>完善供应商资料</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业名称">
                  <el-input v-model="form.companyName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="注册资本">
                  <el-input v-model="form.capital" placeholder="万元" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="证照信息" name="license">
            <el-form-item label="营业执照">
              <image-upload v-model="form.licenseImg" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="银行信息" name="bank">
            <el-form-item label="开户行">
              <el-input v-model="form.bankName" />
            </el-form-item>
            <el-form-item label="银行账号">
              <el-input v-model="form.bankAccount" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        <div style="margin-top: 20px; text-align: center;">
          <el-button type="primary" @click="submit">提交资料</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import ImageUpload from '@/components/ImageUpload';
const activeTab = ref('basic');
const form = ref({
  companyName: '',
  capital: '',
  licenseImg: '',
  bankName: '',
  bankAccount: ''
});

function submit() {
  proxy.$modal.msgSuccess('资料提交成功，请等待审核');
}
</script>