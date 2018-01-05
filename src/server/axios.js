import axios from "axios";
import { Message } from "element-ui";
import router from "../router";
import nProgress from 'nprogress';
nProgress.configure({
    parent: '.el-main',
    easing: 'ease',
    speed: 500
});
// 本地做了反向代理，不同环境使用不同的baseURL
let differentBaseUrl;
if (process.env.NODE_ENV == 'development') {
    //本地地址（200服务器）
    differentBaseUrl = "/index.php/api"
} else if (process.env.NODE_ENV == 'production') {
    //build后的线上地址
    differentBaseUrl = "/index.php/api"
}

export { differentBaseUrl }

// 创建 axios 实例
const Axios = axios.create({
    baseURL: differentBaseUrl,
    timeout: 30000,
    responseType: "json",
    withCredentials: true, // 是否允许带cookie这些
    headers: {
        //  "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        "Content-Type": "application/json;charset=utf-8"
    }
});

//通过拦截器，可以提前判断, 对错误进行预处理。
//POST传参序列化(添加请求拦截器)
Axios.interceptors.request.use(
    config => {
        // 在发送请求之前做某件事
        // 若是有做鉴权token , 就给头部带上token
        // 在login发送所有请求之前，清掉 sessionStorage 里的用户信息，因为登录之前是没有 token 的。
        let userInfo = JSON.parse(sessionStorage.getItem('loginUserBaseInfo'))
        if (userInfo && userInfo.token) {
            config.headers.Authorization = "Bearer " + userInfo.token;
        }
        //加载进度条
        nProgress.start();

        return config;
    },
    error => {
        // 当请求异常时做一些处理

        /*// 以前的处理
        //网络异常，及请求中断
        //todo 需分别处理
        if (error.code == 'ECONNABORTED' && error.message.indexOf('timeout') >= 0) {
          Message({
              message: 'Request timeout',
              type: 'error',
              iconClass: '',
              duration: 5 * 1000
          });
        } else {
          Message({
              message: '发生异常错误,请刷新页面重试',
              type: 'error',
              iconClass: '',
              duration: 5 * 1000
          });
        }*/

        //  Message({
        //    showClose: true,
        //    message: error.data.error.message,
        //    type: "error"
        //  });

        console.log('请求的错误拦截')

        return Promise.reject(error);
    }
);

//返回状态判断(添加响应拦截器)
Axios.interceptors.response.use(res => {
    nProgress.done();
    //对响应数据做一些处理
    if (!res.data) {
        Message({
            message: `responseType: ${res.config.responseType}`,
            type: "error"
        });
        return Promise.reject(res);
    } else {

        // token认证失败或超时
        if (res.data.errorcode == 999) {
            router.push({
                path: "/gmailLogin"
            });
        } else if (res.data.errorcode == 105) {
            //操作不当（比如缺少参数）
            Message({
                message: `${res.data.msg}`,
                type: "error"
            });
        }
    }

    return res;
}, error => {
    // 当响应异常时做一些处理

    // 用户登录的时候会拿到一个基础信息,比如用户名,token,过期时间戳
    // 直接丢localStorage或者sessionStorage
    // if (!window.sessionStorage.getItem("loginUserBaseInfo")) {
    //     // 若是接口访问的时候没有发现有鉴权的基础信息,直接返回登录页
    //     router.push({
    //         path: "/login"
    //     });
    // } else {

    //     // 下面是接口回调的 status ,因为没有做错误页面,所以给个 Message 错误提示
    //     if (error.response && error.response.status) {
    //         Message({
    //             message: error.response.statusText,
    //             type: "warning"
    //         });
    //         // 如果做了错误页面,跳转到对应的报错页面  token认证失败或超时
    //         if (error.response.status === 999) {
    //             router.push({
    //                 path: "/login"
    //             });
    //         }
    //     }


    // }
    // 返回 response 里的错误信息(现在是null)：error.response.data 
    //  let errorInfo = error.response.data.error ? error.response.data.error.message : error.response.data;
    console.log(error);
    return Promise.reject(error);
});

//如果项目的很多地方都用了某个库，或者希望全局可用，可以构建自己的 Vue插件: 把 Axios的实例封装成 Vue插件
export default {
    install: function(Vue, Option) {
        Object.defineProperty(Vue.prototype, "$http", {
            value: Axios
        });
    }
};