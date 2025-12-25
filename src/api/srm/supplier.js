import request from '@/utils/request'

// 获取工商信息
export function getCompanyInfo(socialCode) {
  return request({
    url: '/srm/supplier/getCompanyInfo/' + socialCode,
    method: 'get'
  })
}

// 供应商自主注册
export function registerSupplier(data) {
  return request({
    url: '/srm/supplier/register',
    method: 'post',
    data: data
  })
}