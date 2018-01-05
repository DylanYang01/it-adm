export default {
    // 登录注册
    getCaptcha: "/captchaInfo",
    doLogin: "/login", //账号密码登录
    doExit: "/loginout", //退出登录
    getAccount: '/get_account', //获取账户信息
    warningReport: '/warning_report', //预警统计报表


    //账户部门相关
    accountList: '/account_list', //账户列表
    userDel: '/user_del', //删除账户
    getAccount: '/get_account', //获取账户信息
    departmentList: '/department_list', //部门列表
    departmentAdd: '/department_add', //添加部门
    departmentDel: 'department_del', //删除部门
    departmentAccountList: '/department_account_list', //部门员工列表
    userEdit: '/user_edit', //编辑账户
    userAdd: '/user_add', //添加账户


    //项目相关
    projectList: '/project_list', //项目列表
    projectDel: '/project_del', //删除项目
    projectAdd: '/project_add', //添加项目
    projectEdit: '/project_edit', //编辑项目
    getProject: '/get_project', //获取单个项目
    getProjectModules: '/get_project_modules', //项目模块 联动列表
    moduleAdd: '/module_add', //模块的添加 小接口


    //预警相关
    warninList: '/warning_list', //预警列表
    warningDel: '/warning_del', //预警删除
    getWarning: '/get_warning', //获取单个预警
    warningAdd: '/warning_add', //添加预警 提交接口
    warningAdit: '/warning_edit', //编辑预警 提交接口

    //预警统计相关
    warningReportDetail: '/warning_report_detail', //预警统计详情（报表）
    getProjectAccounts: '/get_project_accounts', //获取项目创建人列表
    warningReport: '/warning_report', //获取预警报表的接口







    // 本地存储相关：暂时没用
    setItem(key, item) {
        let _item = typeof item == 'string' ? item : JSON.stringify(item);
        return localStorage.setItem(key, _item);
    },
    getItem(key, type) {
        let local = localStorage.getItem(key);
        return local;
    }
}