<template>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">{{ title }}</h3>
      
      <el-tabs v-model="loginType" class="login-tabs">
        <el-tab-pane label="账号登录" name="account">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
            >
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
        </el-tab-pane>
        
        <el-tab-pane label="邮箱登录" name="email">
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="邮箱地址"
            >
              <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="emailCode">
            <el-input
              v-model="loginForm.emailCode"
              size="large"
              auto-complete="off"
              placeholder="邮箱验证码"
              style="width: 63%"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="login-code">
              <el-button @click="handleSendEmailCode" :disabled="codeTimer > 0" style="height: 40px;">
                {{ codeTimer > 0 ? `${codeTimer}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
        <div style="float: left;">
          <router-link class="link-type" :to="'/register-supplier'">供应商注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, getCurrentInstance } from 'vue'
import { getCodeImg, sendEmailCode } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginType = ref("account")
const codeTimer = ref(0)
const loginForm = ref({
  username: "admin",
  password: "admin123",
  email: "",
  emailCode: "",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = computed(() => {
  if (loginType.value === 'account') {
    return {
      username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
      password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
      code: [{ required: false, trigger: "change", message: "请输入验证码" }]
    }
  } else {
    return {
      email: [{ required: true, trigger: "blur", message: "请输入您的邮箱" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
      emailCode: [{ required: true, trigger: "blur", message: "请输入邮箱验证码" }]
    }
  }
})

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(false)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 记住账号/邮箱逻辑
      if (loginForm.value.rememberMe) {
        if (loginType.value === 'account') {
          Cookies.set("username", loginForm.value.username, { expires: 30 })
          Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        } else {
          Cookies.set("email", loginForm.value.email, { expires: 30 })
        }
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
        Cookies.set("loginType", loginType.value, { expires: 30 })
      } else {
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("email")
        Cookies.remove("rememberMe")
        Cookies.remove("loginType")
      }
      // 组装登录参数
      const loginParams = {
        ...loginForm.value,
        loginType: loginType.value
      }
      // 调用action的登录方法
      userStore.login(loginParams).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
    }
  })
}

function handleSendEmailCode() {
  if (!loginForm.value.email) {
    proxy.$modal.msgWarning("请输入邮箱地址");
    return;
  }
  sendEmailCode(loginForm.value.email, "login").then(() => {
    proxy.$modal.msgSuccess("验证码已发送");
    codeTimer.value = 60;
    const timer = setInterval(() => {
      codeTimer.value--;
      if (codeTimer.value <= 0) clearInterval(timer);
    }, 1000);
  });
}

function getCode() {
  // 暂时禁用验证码，方便测试
  captchaEnabled.value = false;
  /* getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      loginForm.value.uuid = res.uuid
    }
  }) */
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const email = Cookies.get("email")
  const rememberMe = Cookies.get("rememberMe")
  const type = Cookies.get("loginType")
  
  if (type) loginType.value = type
  
  loginForm.value = {
    ...loginForm.value,
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    email: email === undefined ? loginForm.value.email : email,
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  z-index: 1;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
