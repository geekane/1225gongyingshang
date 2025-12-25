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
      // 1. 登录接口 /login
      if (path === "/login" && request.method === "POST") {
        const { username, password } = await request.json();
        
        // 查询用户
        const user = await env.DB.prepare(
          "SELECT * FROM sys_user WHERE user_name = ? AND password = ?"
        ).bind(username, password).first();

        if (!user) {
          return new Response(JSON.stringify({ code: 500, msg: "账号或密码错误" }), {
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
        // 这里可以将数据存入 srm_supplier_apply 表
        // 目前先模拟成功
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