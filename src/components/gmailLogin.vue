<template>
    <div class="login el-main">
        <div class="login_wrapper_bg"></div>
        <span style="color: #ffffff;">
        </span>
        <div class="form-container">
            <div class="logo-wrapper">
                <img src="../assets/img/login/logo_blue.png" />
            </div>
            <div class="menu-desc-wrapper">
                <p>IT Resource Management Platform</p>
            </div>
            <div class="login-btn-wrapper" @click="handleOtherLogin">
                <span class="tag"></span>
                <img src="../assets/img/login/google_sign_in.png" />
                <span>Gmail 登录</span>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../server/serverUrl";

export default {
  data() {
    return {
      accountSuffix: "1",
      passFocus: false,
      veriCodeFocus: false,
      form: {
        accountSuffix: "@altamob.com",
        password: "",
        code: "",
        img: ""
      }
    };
  },
  props: [],
  watch: {},
  computed: {},
  filter: {},
  methods: {
    // 第三方登录（gmail）
    handleOtherLogin() {
      if (gapi.auth2) {
        this.googleSign();
      } else {
        gapi.load("client:auth2", () => {
          gapi.auth2
            .init({
              client_id:
                "375731297199-pus4c0h4fudt1o6r9fe5ua899mk8pu9m.apps.googleusercontent.com"
            })
            .then(() => {
              this.googleSign();
            });
        });
      }
    },
    googleSign() {
      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then(res => {
          // {El,Zi,w3}
          // 登录
          this.$http({
            method: "post",
            url: api.doLogin,
            data: { googleToken: res.Zi.id_token }
          })
            .then(res => {
              res = res.data;
              if (res.errorcode === 0) {

                //把用户基础信息存到sessionStorage里
                let userinfo = {
                  email: res.data.email,
                  id: res.data.id, //账户id
                  name: res.data.account_name, //账户名
                  realName: res.data.real_name, //真实名字
                  departmentId: res.data.department_id, //部门id
                  expire: res.expires_in, //token过期时间
                  status: res.data.status, //状态，0：停用 1：启用
                  token: res.access_token, //验证用户合法性的token
                  type: res.data.type, //授权类型 用户角色，1：管理员 2：普通用户
                  loginType:'gmail'//登陆类型为gmail
                };
                sessionStorage.setItem(
                  "loginUserBaseInfo",
                  JSON.stringify(userinfo)
                );

                //跳转到对应的平台
                this.$router.push({ name: "alertAnalysis" });
              } else if (res.errorcode === 1) {
                // this.handleGetCaptcha();
                this.$message({
                  message: res.message,
                  type: "error"
                });
              }
            })
            .catch(error => {
              //登陆失败
              console.log("登陆失败回调");
            });
        });
    }
  },
  created() {},
  mounted() {},
  components: {}
};
</script>
<style lang="scss">
.login {
  .form-container {
    .el-form {
      .form-item-username {
        .el-input-group__append {
          .el-input__inner {
            width: 145px;
          }
        }
      }
      .form-item-username.is-error,
      .form-item-password.is-error {
        .el-form-item__error {
          padding-left: 39px;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.login_wrapper_bg {
  width: 100vw;
  height: 100vh;
  position: relative;
  z-index: 0;
}
.login {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: url("../assets/img/login/login_bg_no_opacity.jpg") no-repeat
    center;
  .form-container {
    background: rgba(255, 255, 255, 0.7);
    width: 500px;
    height: 250px;
    padding: 67px 0;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border-radius: 15px;
    .logo-wrapper {
      text-align: center;
      margin-bottom: 20px;
    }
    .menu-desc-wrapper {
      p {
        line-height: 26px;
        font-size: 14px;
        text-align: center;
        color: #616287;
      }
      margin-bottom: 66px;
    }
    .login-btn-wrapper {
      width: 360px;
      height: 64px;
      margin: 0 auto;
      background: #6a93ff;
      border-radius: 30px;
      text-align: center;
      cursor: pointer;
      img,
      span {
        display: inline-block;
        vertical-align: middle;
      }
      img {
        width: 28px;
        height: 22px;
        margin-right: 18px;
      }
      span {
        font-size: 16px;
        color: #fff;
      }
      span.tag {
        height: 100%;
        width: 0;
        vertical-align: middle;
      }
    }
  }
}
</style>
