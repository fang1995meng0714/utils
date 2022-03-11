import axios from "axios";
import {message} from 'antd';
import AuthManager from "../auth/AuthManager";

const instance = axios.create({
    timeout: 10000, 
    baseURL: window.location.origin   
})

const MediaType = {
    APPLICATION_WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded',
    APPLICATION_JSON: 'application/json',
};

let hide = null;
instance.defaults.headers.post['Content-Type'] = MediaType;

let httpCode = {
    400: '请求参数错误',
    401: '权限不足, 请重新登录',
    403: '服务器拒绝本次访问',
    404: '请求资源未找到',
    500: '内部服务器错误',
    501: '服务器不支持该请求中使用的方法',
    502: '网关错误',
    504: '网关超时'
}
instance.interceptors.request.use(config => {
    if(!hide) {
        hide = message.loading({content: 'Loading...', duration: 0});
    }
    
    config.headers['Authorization'] = `Bearer ${AuthManager.getUser().pID}`
    
    if (config.url.includes('pur/contract/export')) {
        config.headers['responseType'] = 'blob'
    }
    if (config.url.includes('pur/contract/upload')) {
        config.headers['Content-Type'] = 'multipart/form-data'
    }
    return config
}, error => {
    return Promise.reject(error)
})

instance.interceptors.response.use(response => {
    hide();
    if (response.statusText === 'OK') {
        return Promise.resolve(response.data)
    } else {
        message.error('响应超时')
        return Promise.reject(response.data.message)
    }
}, error => {
    hide();
    if (error.response) {
        let tips = error.response.status in httpCode ? httpCode[error.response.status] : error.response.data.message
        message.error(tips)
        if (error.response.status === 401) {  
            AuthManager.logout()
            .then(() => {
                window.location.href = window.location.origin + "/login";
            })
        }
        return Promise.reject(error)
    } else {
        message.error('请求超时, 请刷新重试')
        return Promise.reject('请求超时, 请刷新重试');
    }
})

export const get = (url, params, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'get',
            url,
            params,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export const post = (url, data, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'post',
            url,
            data,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}

export const instanceDel = (url, params, config = {}) => {
    return new Promise((resolve, reject) => {
        instance({
            method: 'delete',
            url,
            params,
            ...config
        }).then(response => {
            resolve(response)
        }).catch(error => {
            reject(error)
        })
    })
}