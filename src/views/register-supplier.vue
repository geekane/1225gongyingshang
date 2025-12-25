<template>
  <div class="register-container">
    <div class="register-box">
      <h3 class="title">SRM 供应商自主注册</h3>
      
      <el-steps :active="active" finish-status="success" align-center class="steps-box">
        <el-step title="准入选择" />
        <el-step title="协议签署" />
        <el-step title="身份核验" />
        <el-step title="账号激活" />
      </el-steps>

      <div class="form-content">
        <!-- 第一步：准入选择 -->
        <div v-if="active === 0">
          <el-form :model="registerForm" label-width="120px">
            <el-form-item label="主体类型">
              <el-radio-group v-model="registerForm.subjectType">
                <el-radio label="ENTERPRISE">企业法人</el-radio>
                <el-radio label="INDIVIDUAL">个人/个体工商户</el-radio>
                <el-radio label="INSTITUTION">学校/事业单位</el-radio>
                <el-radio label="OVERSEAS">境外主体</el-radio>
              </el-radio-group>
            </el-form-item>
            <div class="btn-group">
              <el-button type="primary" @click="nextStep">下一步</el-button>
            </div>
          </el-form>
        </div>

        <!-- 第二步：协议签署 -->
        <div v-if="active === 1">
          <div class="protocol-content">
            <h4>注册须知与平台协议</h4>
            <div class="protocol-text">
              <p>1. 供应商必须提供真实有效的资质证明文件。</p>
              <p>2. 遵守平台相关的采购管理制度。</p>
              <p>3. 保护平台商业秘密。</p>
              <!-- 更多协议内容... -->
            </div>
            <el-checkbox v-model="registerForm.agreed">我已阅读并同意以上协议</el-checkbox>
          </div>
          <div class="btn-group">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" :disabled="!registerForm.agreed" @click="nextStep">下一步</el-button>
          </div>
        </div>

        <!-- 第三步：身份核验 -->
        <div v-if="active === 2">
          <el-form :model="registerForm" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="社会信用代码" prop="socialCode">
              <el-input v-model="registerForm.socialCode" placeholder="请输入统一社会信用代码">
                <template #append>
                  <el-button @click="fetchCompanyInfo">获取公司信息</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="registerForm.companyName" placeholder="系统自动拉取" readonly />
            </el-form-item>
            <el-form-item label="法人代表">
              <el-input v-model="registerForm.legalPerson" readonly />
            </el-form-item>
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="registerForm.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
            <el-form-item label="联系人邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="用于接收账号密码" />
            </el-form-item>
          </el-form>
          <div class="btn-group">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="handleRegister">提交注册</el-button>
          </div>
        </div>

        <!-- 第四步：账号激活 -->
        <div v-if="active === 3" class="success-box">
          <el-result icon="success" title="注册申请已提交" sub-title="初始账号密码已发送至您的邮箱，请查收并登录系统完善资料">
            <template #extra>
              <el-button type="primary" @click="goToLogin">前往登录</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getCompanyInfo, registerSupplier } from "@/api/srm/supplier";

const router = useRouter();
const active = ref(0);
const formRef = ref(null);

const registerForm = ref({
  subjectType: 'ENTERPRISE',
  agreed: false,
  socialCode: '',
  companyName: '',
  legalPerson: '',
  contactName: '',
  email: ''
});

const rules = {
  socialCode: [{ required: true, message: '请输入社会信用代码', trigger: 'blur' }],
  companyName: [{ required: true, message: '请获取公司信息', trigger: 'change' }],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur', type: 'email' }]
};

const nextStep = () => {
  if (active.value < 3) active.value++;
};

const prevStep = () => {
  if (active.value > 0) active.value--;
};

const fetchCompanyInfo = () => {
  if (!registerForm.value.socialCode) {
    ElMessage.warning('请先输入社会信用代码');
    return;
  }
  // 这里的逻辑可以保留模拟，也可以尝试调用接口（虽然目前后端接口还没写）
  // 为了演示，我们先保留模拟逻辑，但通过API函数占位
  getCompanyInfo(registerForm.value.socialCode).then(res => {
    // 实际对接后的逻辑
    // registerForm.value.companyName = res.data.companyName;
  }).catch(() => {
    // 模拟演示逻辑
    ElMessage.success('公司信息拉取成功(模拟)');
    registerForm.value.companyName = '模拟某某科技股份有限公司';
    registerForm.value.legalPerson = '张三';
  });
};

const handleRegister = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      registerSupplier(registerForm.value).then(res => {
        nextStep();
      }).catch(() => {
        // 模拟提交成功
        nextStep();
      });
    }
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.register-box {
  width: 800px;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

  .title {
    text-align: center;
    margin-bottom: 40px;
    color: #303133;
    font-size: 24px;
  }

  .steps-box {
    margin-bottom: 40px;
  }

  .form-content {
    min-height: 300px;
  }

  .protocol-content {
    background: #fcfcfc;
    padding: 20px;
    border: 1px solid #ebeef5;
    margin-bottom: 20px;
    
    .protocol-text {
      height: 200px;
      overflow-y: auto;
      margin-bottom: 15px;
      color: #606266;
      line-height: 1.8;
    }
  }

  .btn-group {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 20px;
  }

  .success-box {
    padding-top: 20px;
  }
}
</style>