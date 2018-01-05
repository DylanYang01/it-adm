<template>
  <div>

    <el-container style='height: 100vh;'>
      <el-header class="el-header-custom">
        <el-menu :default-active="activeIndex" mode="horizontal" menu-trigger='hover'  background-color="#6a93ff" text-color="#fff" active-text-color="#fff">
          <img style="float: left;margin-top: 15px;width:106px;margin-left:22px;" src="../assets/logo.png" alt="logo" />
          <el-submenu index="3" class='pull-right'>
            <template slot="title">
              <span class="icon-user icon-custom"></span> <span>{{user}}</span>
            </template>
          
            <el-menu-item index="3-2" @click='signOut'>
              Sign out
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-header>
      <router-view/>
    </el-container>

  </div>
</template>

<script>
import api from "../server/serverUrl";

export default {
  name: "layout",
  data() {
    return {
      activeIndex: "3",
      user: "",
      userId: "",
      showChangeUserBox: false,
      changeUserSelected: "",
      changeUserList: [],
      isGmailLogin: true
    };
  },
  mounted() {
    let userInfo = JSON.parse(sessionStorage.getItem("loginUserBaseInfo"));
    if (userInfo) {
      this.user = userInfo.email || "";
      this.userId = userInfo.id || "";
    }
    this.isGmailLogin = userInfo.loginType == "gmail"; //是否为isGmailLogin登录
  },
  methods: {
    signOut() {
      var _this = this;
      if (this.isGmailLogin) {
        try {
          if (gapi) {
            if (gapi.auth2) {
              gapi.auth2.getAuthInstance().signOut();
              sessionStorage.removeItem("loginUserBaseInfo");
              _this.$router.push({
                name: "gmailLogin"
              });
            } else {
              gapi.load("client:auth2", () => {
                gapi.auth2
                  .init({
                    client_id:
                      "375731297199-pus4c0h4fudt1o6r9fe5ua899mk8pu9m.apps.googleusercontent.com"
                  })
                  .then(() => {
                    gapi.auth2.getAuthInstance().signOut();
                    sessionStorage.removeItem("loginUserBaseInfo");
                    _this.$router.push({
                      name: "gmailLogin"
                    });
                  });
              });
            }
          }
        } catch (error) {
          //清除缓存
          sessionStorage.removeItem("loginUserBaseInfo");
          this.$router.push({
            name: "gmailLogin"
          });
        }
      } else {
        this.$http({
          method: "post",
          url: api.doExit
        }).then(res => {
          res = res.data;
          if (res.errorcode === 0) {
            this.$router.push({
              name: "login"
            });
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.el-header-custom {
  background: #6a93ff;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 1500;
  padding-right: 0;
  .icon-custom {
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin-right: 5px;
    background: #fff;
    color: #6a93ff;
    border-radius: 50%;
  }
}
</style>

<style>
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  padding: 10px;
}

.el-header .el-submenu .el-menu-item {
  min-width: 100%;
}

.el-menu {
  border: none;
}

.el-submenu__title {
  font-size: 16px;
}

.el-menu-item {
  font-size: 16px;
}

.el-submenu__title i {
  color: #fff;
  font-size: 16px;
}
</style>