<template>
  <el-container style='margin-top: 60px;'>
    <el-aside width="200px" style="background-color: #212942;padding-top: 56px;">
      <el-menu :default-active="activeNav" background-color='#212942' text-color='#565f79' active-text-color='#6287eb' router>
        <el-menu-item index="/alert/alertAnalysis">
          <span style="margin-right: 10px;" class="icon-ad-review"></span>
          <span slot="title">预警统计</span>
        </el-menu-item>
         <el-menu-item index="/alert/alertList">
          <i style="margin-right: 10px;margin-left: -6px;" class="el-icon-tickets"></i>
          <span slot="title">预警列表</span>
        </el-menu-item>
        <el-menu-item index="/alert/projectList">
          <i style="margin-right: 10px;margin-left: -6px;" class="el-icon-setting"></i>
          <span slot="title">项目管理</span>
        </el-menu-item>
        <el-menu-item v-if="type == 1" index="/alert/accountList">
          <i style="margin-right: 10px;margin-left: -6px;" class="el-icon-setting"></i>
          <span slot="title">账户管理</span>
        </el-menu-item>
  
      </el-menu>
    </el-aside>
    <router-view/>
  </el-container>
</template>

<script>
export default {
  data() {
    const userInfo = JSON.parse(sessionStorage.getItem("loginUserBaseInfo"));
    return {
      type: userInfo.type
    };
  },
  computed: {
    //页面刷新时，使激活项是所选项
    activeNav() {
      //路由的 path 名
      let index = this.$route.path;
      switch (index) {
        case "/alert/alertAnalysisDetail":
          return "/alert/alertAnalysis";
          break;
        case "/alert/alertListAddEddit":
        case "/alert/alertListAddEdditResult":
          return "/alert/alertList";
          break;
        case "/alert/projectAddEddit":
        case "/alert/projectAddEdditResult":
          return "/alert/projectList";
          break;
        case "/alert/accountAddEddit":
          return "/alert/accountList";
          break;
        default:
          return index;
          break;
      }
    }
  },
  watch: {
    $route(to, from) {
      document.title = to.meta.title && to.meta.title ;
    }
  },
  beforeRouteEnter(to, from, next) {
    document.title = to.meta.title && to.meta.title ;
    next();
  }
};
</script>

<style>

</style>