<template>
  <div class="login el-main">
    <div class="form-container">
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginForm">
        <!--logo-->
        <el-form-item>
          <div class="logo"><img src="../assets/logo.png" /></div>
        </el-form-item>
        <!--user name-->
        <el-form-item prop="name">
          <el-input size="large" placeholder="Email" v-model.trim='loginForm.name' @keyup.enter.native="doLogin">
            <span style="font-size: 20px;" slot="prepend" class="icon-user"></span>
          </el-input>
        </el-form-item>
        <!--password-->
        <el-form-item prop="pass">
          <el-input size="large" type="password" placeholder="Password" v-model='loginForm.pass' @keyup.enter.native="doLogin" auto-complete="off">
            <span style="font-size: 20px;" slot="prepend" class="icon-password"></span>
          </el-input>
        </el-form-item>

        <!--remember me-->
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">Keep me signed in</el-checkbox>
        </el-form-item>
        <!--login button-->
        <el-form-item>
          <el-button type='primary' class="btn-submit" size='large' @click="submitForm('loginForm')">Sign in</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import api from "../server/serverUrl";

export default {
  data() {
    var validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error("Required"));
      } else {
        var reg3 = /^([a-zA-Z0-9_-])+\@([a-zA-Z0-9_-])+.([a-zA-Z])+$/;
        if (reg3.test(this.loginForm.name)) {
          if (this.loginForm.name.length > 100) {
            callback(new Error("Email cannot exceed 100."));
          } else {
            callback();
          }
        } else {
          callback(new Error("Please input email."));
        }
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("Required"));
      } else if (value.length < 3) {
        callback(new Error("Please enter at least 3 characters"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        name: "",
        pass: "",
        rememberMe: false
      },
      loginFormRules: {
        name: [
          {
            validator: validateEmail,
            trigger: "blur"
          }
        ],
        pass: [
          {
            validator: validatePass,
            trigger: "blur"
          }
        ]
      }
    };
  },
  mounted() {
    // 在login发送所有请求之前，清掉 sessionStorage 里的用户信息，因为登录之前是没有 token 的。
    sessionStorage.removeItem("loginUserBaseInfo");
    sessionStorage.removeItem("who");

    //在这里把localstorage的用户名放到用户名的input里
    let shareadUsername = localStorage.getItem("sharead-username");
    if (!shareadUsername) return;
    this.loginForm.name = shareadUsername;
  },
  methods: {
    doLogin() {
      this.submitForm("loginForm");
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let param = {
            email: this.loginForm.name,
            password: this.loginForm.pass
          };
          // 登录
          this.$http({
            method: "post",
            url: api.doLogin,
            data: param
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              // 如果Remember me, 保存用户名
              if (this.loginForm.rememberMe) {
                localStorage.setItem("sharead-username", this.loginForm.name);
              } else {
                localStorage.removeItem("sharead-username");
              }

              //把用户基础信息存到sessionStorage里
              let userinfo = {
                email: res.data.email,
                id: res.data.id,//账户id
                name:res.data.account_name,//账户名
                realName:res.data.real_name,//真实名字
                departmentId:res.data.department_id,//部门id
                expire: res.expires_in, //token过期时间
                status: res.data.status, //状态，0：停用 1：启用
                token: res.access_token, //验证用户合法性的token
                type:res.data.type//授权类型 用户角色，1：管理员 2：普通用户
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
          });
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: url(../assets/login-bg.jpg) no-repeat center;
  background-size: cover;
  .el-input__inner {
    background-color: #2e3958;
    border-color: #2e3958;
    color: #fff;
  }
  .form-container {
    box-sizing: border-box;
    width: 460px;
    height: 454px;
    padding: 60px 60px 0;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border-radius: 5px;
    background: url(../assets/decorative-line.png) no-repeat left -7px #212942;
    & > .el-form {
      .logo {
        height: 50px;
        text-align: center;
      }
      .verificationcode-container {
        .verificationcode-input-box {
          width: 180px;
          float: left;
          input {
            padding-left: 20px;
          }
        }
        .verificationcode-img-box {
          float: right;
          line-height: 0;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          img {
            width: 140px;
            height: 40px;
          }
        }
      }
      .el-checkbox {
        .el-checkbox__input {
          &.is-checked {
            .el-checkbox__inner {
              background: #409eff;
              border-color: #409eff;
            }
          }
          &.is-focus {
            .el-checkbox__inner {
              border-color: #7c7de4;
            }
          }
        }
        .el-checkbox__label {
          font-size: 14px;
          color: #fff;
        }
      }
      .el-input-group__prepend {
        padding: 0 11px;
        font-size: 20px;
        background-color: #2e3958;
        border-color: #2e3958;
      }
      .btn-submit {
        width: 100%;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
}
</style>