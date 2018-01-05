import Vue from 'vue'
import Router from 'vue-router'
import { Message } from "element-ui";

/* ---------------------------------- 登录和布局组件(用自己单独的css，便于复用) ---------------------------- */
import Login from "@/components/Login" //登录
import GmailLogin from "@/components/gmailLogin" //登录
import Layout from "@/components/Layout" //布局

/* ---------------------------------- 页面组件 ---------------------------- */
//预警统计
import Layoutsub from "@/pages/Layoutsub" //包含左边栏和main区域的次顶层view
import AlertAnalysis from "@/pages/AlertAnalysis" //预警统计界面
import AlertAnalysisDetail from "@/pages/AlertAnalysisDetail" //预警统计的详情页 

//预警列表
import AlertList from "@/pages/AlertList" //预警列表页
import AlertListAddEddit from "@/pages/AlertListAddEddit" //预警添加和编辑页面
import AlertListAddEdditResult from "@/pages/AlertListAddEdditResult" //预警添加和编辑的完成页面

//项目管理
import ProjectList from "@/pages/ProjectList" //项目列表页
import ProjectAddEddit from "@/pages/ProjectAddEddit" //添加项目 和 项目编辑页面
import ProjectAddEdditResult from "@/pages/ProjectAddEdditResult" //项目编辑增加 结果页面

//账户管理
import AccountList from "@/pages/AccountList" //账户列表页
import AccountAddEddit from "@/pages/AccountAddEddit" //账户添加 编辑
//如果单一的理由承载不了后期的无限压力与束缚  那这个理由是完全可以割舍的
Vue.use(Router)

const router = new Router({
    routes: [{
        path: '/login',
        name: 'login',
        component: Login,
        beforeEnter: (to, from, next) => {
            document.title = '预警用户登录界面';
            next();
        }
    }, {
        path: '/gmailLogin',
        name: 'gmailLogin',
        component: GmailLogin,
        beforeEnter: (to, from, next) => {
            document.title = '预警用户登录界面';
            next();
        }
    }, {
        path: '/',
        name: 'layout',
        component: Layout,
        redirect: '/gmailLogin',
        children: [{
            path: '/alert',
            name: 'alert',
            redirect: to => {
                return {
                    name: "alertAnalysis",
                    params: to.params,
                    meta: { title: '预警统计报告', requiresAuth: true }
                }
            },
            component: Layoutsub,
            children: [{
                    path: 'alertAnalysisDetail',
                    name: 'alertAnalysisDetail',
                    component: AlertAnalysisDetail,
                    meta: { title: '预警统计详情', requiresAuth: true }
                }, {
                    path: 'alertAnalysis',
                    name: 'alertAnalysis',
                    component: AlertAnalysis,
                    meta: { title: '预警统计报告', requiresAuth: true }
                },
                {
                    path: 'alertList',
                    name: 'alertList',
                    component: AlertList,
                    meta: { title: '预警统计列表', requiresAuth: true }
                },
                {
                    path: 'alertListAddEddit',
                    name: 'alertListAddEddit',
                    component: AlertListAddEddit,
                    meta: { title: '预警统计增加编辑', requiresAuth: true }
                },
                {
                    path: 'alertListAddEdditResult',
                    name: 'alertListAddEdditResult',
                    component: AlertListAddEdditResult,
                    meta: { title: '预警统计编辑结果', requiresAuth: true }
                },
                {
                    path: 'projectList',
                    name: 'projectList',
                    component: ProjectList,
                    meta: { title: '项目列表', requiresAuth: true }
                },
                {
                    path: "projectAddEddit",
                    name: 'projectAddEddit',
                    component: ProjectAddEddit,
                    meta: { title: '项目新增编辑', requiresAuth: true }
                },
                {
                    path: 'projectAddEdditResult',
                    name: 'projectAddEdditResult',
                    component: ProjectAddEdditResult,
                    meta: { title: '项目新增编辑结果', requiresAuth: true }
                },
                {
                    path: 'accountList',
                    name: 'accountList',
                    component: AccountList,
                    meta: { title: '账户列表', requiresAuth: true }
                },
                {
                    path: 'accountAddEddit',
                    name: 'accountAddEddit',
                    component: AccountAddEddit,
                    meta: { title: '新增编辑账户', requiresAuth: true }
                }

            ]
        }]
    }]
})




export default router;