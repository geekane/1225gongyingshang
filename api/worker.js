export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 辅助函数：发送邮件 (使用 Resend)
      const sendEmail = async (to, subject, html) => {
        // 如果没有配置 API KEY，返回错误
        if (!env.RESEND_API_KEY) {
          console.error(`[Email Error] Missing RESEND_API_KEY. Cannot send email to ${to}`);
          return false;
        }
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: env.RESEND_FROM || "SRM System <onboarding@resend.dev>",
            to: [to],
            subject: subject,
            html: html,
          }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[Resend Error] ${res.status}: ${errorText}`);
        }
        return res.ok;
      };

      // 0. 发送邮箱验证码接口 /sendEmailCode
      if (path === "/sendEmailCode" && request.method === "POST") {
        const { email, type } = await request.json();
        if (!email) {
          return new Response(JSON.stringify({ code: 500, msg: "邮箱不能为空" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 生成6位验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10分钟有效

        // 存储到数据库
        await env.DB.prepare(
          "INSERT INTO sys_email_code (email, code, type, expire_time) VALUES (?, ?, ?, ?)"
        ).bind(email, code, type || 'register', expireTime).run();

        // 发送邮件
        const success = await sendEmail(
          email,
          "SRM 系统验证码",
          `<p>您的验证码是：<strong>${code}</strong>，有效期10分钟。如非本人操作请忽略。</p>`
        );

        if (success) {
          return new Response(JSON.stringify({ code: 200, msg: "验证码已发送" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ code: 500, msg: "邮件发送失败" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // 1. 登录接口 /login
      if (path === "/login" && request.method === "POST") {
        const { username, password, loginType, email, emailCode } = await request.json();
        
        let user;
        if (loginType === 'email') {
          // 校验邮箱验证码
          const record = await env.DB.prepare(
            "SELECT * FROM sys_email_code WHERE email = ? AND code = ? AND type = 'login' AND expire_time > ? ORDER BY create_time DESC"
          ).bind(email, emailCode, new Date().toISOString()).first();

          if (!record) {
            return new Response(JSON.stringify({ code: 500, msg: "验证码错误或已过期" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          // 根据邮箱查询用户 (假设 user_name 或 email 字段存储了邮箱)
          user = await env.DB.prepare(
            "SELECT * FROM sys_user WHERE user_name = ?"
          ).bind(email).first();
        } else {
          // 常规账号密码登录
          user = await env.DB.prepare(
            "SELECT * FROM sys_user WHERE user_name = ? AND password = ?"
          ).bind(username, password).first();
        }

        if (!user) {
          return new Response(JSON.stringify({ code: 500, msg: "账号不存在或密码错误" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 模拟生成 Token (实际生产应使用 JWT)
        const token = btoa(JSON.stringify({
          userId: user.user_id,
          username: user.user_name,
          roles: user.roles,
          time: Date.now()
        }));

        return new Response(JSON.stringify({ code: 200, msg: "操作成功", token: token }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. 获取用户信息 /getInfo
      if (path === "/getInfo" && request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ code: 401, msg: "未登录" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 简单解析模拟 Token
        const tokenData = JSON.parse(atob(authHeader.split(" ")[1]));
        const user = await env.DB.prepare(
          "SELECT * FROM sys_user WHERE user_id = ?"
        ).bind(tokenData.userId).first();

        if (!user) {
          return new Response(JSON.stringify({ code: 401, msg: "用户不存在" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 获取角色
        const roles = (user.roles || "common").split(",");
        const permissions = roles.includes("admin") ? ["*:*:*"] : ["srm:supplier:view"];

        return new Response(JSON.stringify({
          code: 200,
          msg: "操作成功",
          user: {
            userId: user.user_id,
            userName: user.user_name,
            nickName: user.nick_name || user.user_name,
            avatar: "",
            roles: roles
          },
          roles: roles,
          permissions: permissions
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 3. 获取路由接口 /getRouters
      if (path === "/getRouters" && request.method === "GET") {
        const authHeader = request.headers.get("Authorization");
        const tokenData = JSON.parse(atob(authHeader.split(" ")[1]));
        const isSupplier = tokenData.roles && tokenData.roles.includes("supplier");

        let menuData = [];
        if (isSupplier) {
          menuData = [
            {
              "name": "SupplierPortal",
              "path": "/supplier",
              "hidden": false,
              "redirect": "noRedirect",
              "component": "Layout",
              "alwaysShow": true,
              "meta": { "title": "供应商门户", "icon": "guide", "noCache": false, "link": null },
              "children": [
                {
                  "name": "SupplierProfile",
                  "path": "profile",
                  "hidden": false,
                  "component": "srm/supplier/profile",
                  "meta": { "title": "完善资料", "icon": "edit", "noCache": false, "link": null }
                }
              ]
            }
          ];
        } else {
          menuData = [
            {
              "name": "Srm",
              "path": "/srm",
              "hidden": false,
              "redirect": "noRedirect",
              "component": "Layout",
              "alwaysShow": true,
              "meta": { "title": "供应商管理", "icon": "peoples", "noCache": false, "link": null },
              "children": [
                {
                  "name": "SupplierApply",
                  "path": "apply",
                  "hidden": false,
                  "component": "srm/apply/index",
                  "meta": { "title": "入驻审核", "icon": "check", "noCache": false, "link": null }
                },
                {
                  "name": "SupplierInfo",
                  "path": "info",
                  "hidden": false,
                  "component": "srm/info/index",
                  "meta": { "title": "供应商档案", "icon": "user", "noCache": false, "link": null }
                }
              ]
            },
            {
              "name": "System",
              "path": "/system",
              "hidden": false,
              "redirect": "noRedirect",
              "component": "Layout",
              "alwaysShow": true,
              "meta": { "title": "系统管理", "icon": "system", "noCache": false, "link": null },
              "children": [
                { "name": "User", "path": "user", "hidden": false, "component": "system/user/index", "meta": { "title": "用户管理", "icon": "user", "noCache": false, "link": null } },
                { "name": "Role", "path": "role", "hidden": false, "component": "system/role/index", "meta": { "title": "角色管理", "icon": "peoples", "noCache": false, "link": null } },
                { "name": "Menu", "path": "menu", "hidden": false, "component": "system/menu/index", "meta": { "title": "菜单管理", "icon": "tree-table", "noCache": false, "link": null } }
              ]
            }
          ];
        }

        return new Response(JSON.stringify({
          code: 200,
          msg: "操作成功",
          data: menuData
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. 退出登录接口 /logout
      if (path === "/logout") {
        return new Response(JSON.stringify({ code: 200, msg: "退出成功" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. 验证码接口 /captchaImage (适配若依前端)
      if (path === "/captchaImage") {
        return new Response(JSON.stringify({
          code: 200,
          msg: "操作成功",
          captchaEnabled: false,
          img: "",
          uuid: ""
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 5. 供应商注册接口 /srm/supplier/register
      if (path === "/srm/supplier/register" && request.method === "POST") {
        const data = await request.json();
        const { email, emailCode, subjectType, socialCode, companyName, contactName } = data;

        // 校验验证码
        const record = await env.DB.prepare(
          "SELECT * FROM sys_email_code WHERE email = ? AND code = ? AND type = 'register' AND expire_time > ? ORDER BY create_time DESC"
        ).bind(email, emailCode, new Date().toISOString()).first();

        if (!record) {
          return new Response(JSON.stringify({ code: 500, msg: "验证码错误或已过期" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // 模拟生成账号密码 (实际应该在审核通过后，这里为了演示流程先创建账号)
        const tempPassword = Math.random().toString(36).slice(-8);

        // 1. 插入申请记录
        await env.DB.prepare(
          "INSERT INTO srm_supplier_apply (subject_type, social_code, company_name, contact_name, email) VALUES (?, ?, ?, ?, ?)"
        ).bind(subjectType, socialCode, companyName, contactName, email).run();

        // 2. 创建系统账号 (供应商角色)
        // 检查用户是否已存在
        const existingUser = await env.DB.prepare("SELECT * FROM sys_user WHERE user_name = ?").bind(email).first();
        if (!existingUser) {
          await env.DB.prepare(
            "INSERT INTO sys_user (user_name, nick_name, password, roles, status) VALUES (?, ?, ?, 'supplier', '0')"
          ).bind(email, companyName, tempPassword).run();
        }

        // 3. 发送邮件
        await sendEmail(
          email,
          "SRM 系统注册申请已提交",
          `<p>您的注册申请已提交审核。您的初始登录账号为您的邮箱：<strong>${email}</strong>，临时密码为：<strong>${tempPassword}</strong></p>`
        );

        return new Response(JSON.stringify({ code: 200, msg: "注册申请已提交" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ code: 404, msg: "接口未找到" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (e) {
      return new Response(JSON.stringify({ code: 500, msg: e.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};