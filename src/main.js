// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

//把 Axios 封装成 Vue 插件
import AxiosPlugin from './server/axios.js';
Vue.use(AxiosPlugin);

//引入element-UI
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
Vue.use(ElementUI, { size: 'small', locale })
import 'nprogress/nprogress.css'
//引入 vue-Echarts 所有组件的方法
//import VueEcharts from 'vue-echarts'
//Vue.component('chart', VueEcharts)



Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
})