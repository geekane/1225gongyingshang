-- 系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL UNIQUE,
  nick_name TEXT,
  password TEXT NOT NULL,
  roles TEXT DEFAULT 'common', -- 角色标识，逗号分隔
  status TEXT DEFAULT '0'
);

-- 初始化管理员账号 (密码: admin123)
INSERT INTO sys_user (user_name, nick_name, password, roles, status)
VALUES ('admin', '管理员', 'admin123', 'admin', '0');

-- 初始化供应商账号 (密码: supplier123)
INSERT INTO sys_user (user_name, nick_name, password, roles, status)
VALUES ('supplier_test', '演示供应商', 'supplier123', 'supplier', '0');

-- 供应商申请表 (初步)
CREATE TABLE IF NOT EXISTS srm_supplier_apply (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_type TEXT,
  social_code TEXT,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  status TEXT DEFAULT '0', -- 0: 待审核
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 邮箱验证码表
CREATE TABLE IF NOT EXISTS sys_email_code (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT, -- login, register, resetPwd
  expire_time DATETIME NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);