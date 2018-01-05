<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        <span>{{isEddit?"项目编辑":"项目添加"}}</span>
      </div>
     

            <el-form  :model="formInfo" class="custome-form-inline browser" ref="setForm" label-width="120px" :rules="rules" >
              <!-- 项目名称 -->
              <el-form-item label="项目名称" prop="name">
                <el-input v-model="formInfo.name" placeholder="项目名称" style='width: 200px;'></el-input>
              </el-form-item>
              <!-- 项目类型-->
              <el-form-item label="项目类型" >
                 <el-radio-group v-model="formInfo.type">
                    <el-radio :label="1">业务项目</el-radio>
                    <el-radio :label="2">内部项目</el-radio>
                </el-radio-group>
              </el-form-item>
          
              <!-- 项目成员 -->
              <el-form-item label="项目成员" >
                <div class="name-select-box">
                     <el-tree
                        :data="formInfo.treeData"
                        show-checkbox
                        node-key="id"
                        ref="tree"
                        :default-expanded-keys="expand_arr"
                        highlight-current
                        :props="formInfo.defaultProps">
                    </el-tree>
                </div>
              </el-form-item>

                <!-- 项目模块 -->
              <el-form-item  label="项目模块" prop="modules">
                  <div v-for="(nameItem,index) in formInfo.modules" :key="index" style="margin-bottom:5px;" >
                    <el-input  v-model="nameItem.name" placeholder="项目模块" style='width: 200px;' ></el-input>
                    <el-tooltip v-show="!isEddit && formInfo.modules.length>1" content="点击删除此模块" placement="bottom" effect="light">
                    <i class="el-icon-minus" style="font-size:22px;cursor:pointer;text-align:center" @click.stop="handleMinusModule(index)"></i>
                    </el-tooltip>
                    <el-tooltip  v-show="index == formInfo.modules.length-1" content="点击添加模块" placement="bottom" effect="light">
                    <i class="el-icon-plus" style="font-size:22px;cursor:pointer;" @click="handleAddModule"></i>
                    </el-tooltip>
                  </div>
               
              </el-form-item>
              <!-- Agentid -->
              <el-form-item label="Agentid" prop="wx_agentid">
                 <el-input
                    placeholder="请输入Agentid"
                    style='width: 200px;'
                    v-model="formInfo.wx_agentid">
                  </el-input>
              </el-form-item>
              <!-- Secret -->
              <el-form-item label="Secret" prop="wx_secret">
                 <el-input
                    placeholder="请输入Secret"
                    style='width: 200px;'
                    v-model="formInfo.wx_secret">
                  </el-input>
              </el-form-item>
              <!-- 备注 -->
                <el-form-item label="备注">
                 <el-input
                    type="textarea"
                    :rows="2"
                    placeholder="请输入内容"
                    style='width: 410px;'
                    v-model="formInfo.remark">
                  </el-input>
              </el-form-item>
              <!-- 创建 -->
                <el-form-item>
                 <el-button type="primary" size="medium"   @click="handleSubmit">创建</el-button>
              </el-form-item>
            </el-form>
    </div>
  </el-main>
</template>

<script>
//本编辑的逻辑***********************************
//最难的是z-tree这一块。因为 员工的id和 部门的额id   有可能重复，所以导致设置数据回填的时候，出现错乱
//我的解决办法是，把后台返回的员工id，刚接受到就给加上10000000，这样就和部门id区分开了。
//在提交数据的时候把员工id  在通过计算属性checkedAccount 减去 10000000处理

import api from "../server/serverUrl";
export default {
  data() {
    var validatemodules = (rule, value, callback) => {
      if (value === []) {
        callback();
      } else {
        let _isMoreThanOne = false;
        value.forEach(item => {
          if (item.name != "" || item.name.trim() != "") {
            _isMoreThanOne = true;
          }
        });
        if (_isMoreThanOne) {
          callback();
        } else {
          callback(new Error("模块名至少为一个不为空"));
        }
      }
    };
    var _reg = /^[1-9]*[1-9][0-9]*$/;
    var validateNum = (rule, value, callback) => {
      value = value.trim();
      if (value === "") {
        callback();
      } else {
        if (_reg.test(value)) {
          callback();
        } else {
          callback(new Error("Agentid必须为正整数"));
        }
      }
    };

    return {
      activeName: "first",
      dialogFormVisible: false,
      expand_arr: [],
      formInfo: {
        name: "",
        modules: [{ id: 0, name: "" }],
        type: 2,
        create_time: "",
        account_ids: [],
        wx_secret: "",
        wx_agentid: "",
        treeData: [],
        defaultProps: {
          children: "children",
          label: "name",
          value: "id"
        },
        remark: ""
      },
      rules: {
        name: [{ required: true, message: "项目名不能为空", trigger: "blur" }],
        wx_agentid: [
          { required: true, message: "Agentid不能为空", trigger: "blur" },
          { validator: validateNum, trigger: "blur" }
        ],
        wx_secret: [{ required: true, message: "Secret不能为空", trigger: "blur" }],
        modules: [
          {
            required: true,
            message: "模块名不能为空",
            trigger: "blur",
            type: "array"
          },
          { validator: validatemodules, trigger: "blur" }
        ]
      }
    };
  },
  beforeMount() {
    this.getDepartmentAccountList();
    if (this.isEddit) {
      this.getProject();
    }
  },
  mounted() {
    if (!this.isEddit) {
      //如果是添加 就让z-tree展开默认勾选当前账户
      let _userInfo = JSON.parse(sessionStorage.getItem("loginUserBaseInfo"));
      this.formInfo.account_ids = [_userInfo.id];
      this._setZTreeCheckedKeys(this.formInfo.account_ids);
    }
  },
  computed: {
    isEddit() {
      return JSON.stringify(this.$route.query) != "{}";
    },
    addModulesArray() {
      let _moduleArray = this.formInfo.modules,
        _newArray = new Array();
      _moduleArray.forEach(item => {
        if (item.name != "") {
          _newArray.push(item.name);
        }
      });
      return _newArray;
    },
    checkedAccount() {
      let _checkedNodes = this.$refs["tree"].getCheckedNodes(true),
        _checkedAccounts = new Array();
      _checkedNodes.length &&
        _checkedNodes.forEach(item => {
          if (item.type == "account") {
            _checkedAccounts.push(item.id - 100000000); //剪掉 100000000
          }
        });
      return _checkedAccounts;
    }
  },
  methods: {
    //获取部门成员列表
    getDepartmentAccountList() {
      let param = {
        account_id: this.$route.query.account_id
      };
      this.$http({
        method: "post",
        url: api.departmentAccountList,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          //改变z-tree里面  员工的id

          var _arryBack = item => {
            if (
              Object.prototype.toString.call(item) == "[object Array]" &&
              item.length > 0
            ) {
              item.forEach(subitem => {
                if (subitem.type == "account") {
                  subitem.id = 100000000 + subitem.id;
                }
                if (subitem.children) {
                  _arryBack(subitem.children); //递归循环调用
                }
              });
            }
          };
          _arryBack(res.data);
          this.formInfo.treeData = res.data;
        }
      });
    },
    //获取单个项目的信息
    getProject() {
      let param = { project_id: this.$route.query.project_id };
      this.$http({
        method: "post",
        url: api.getProject,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.formInfo.name = res.data.name;
          this.formInfo.remark = res.data.remark;
          this.formInfo.modules = res.data.modules;
          this.formInfo.account_ids = res.data.account_ids;
          this.formInfo.type = res.data.type;
          this.formInfo.wx_secret = res.data.wx_secret;
          this.formInfo.wx_agentid = res.data.wx_agentid;
          //动态设置选中
          this._setZTreeCheckedKeys(this.formInfo.account_ids);
        }
      });
    },
    _setZTreeCheckedKeys(ids) {
      let _newArray = new Array();
      ids.length &&
        ids.forEach(item => {
          item = 100000000 + item;
          _newArray.push(item);
        });

      _newArray.length && this.$refs["tree"].setCheckedKeys(_newArray);
      //设置展开选中项
      this.expand_arr = _newArray;
    },
    //提交表单
    handleSubmit() {
      this.$refs["setForm"].validate(valid => {
        if (valid) {
          if (this.checkedAccount.length == 0) {
            this.$message({
              message: "项目成员名字不能为空",
              type: "error"
            });
            return false;
          }
          let _formData = this.formInfo;

          //处理modules的空值  删除
          this.removeBlankName();
          let param = {
            id: this.isEddit ? this.$route.query.project_id : 0,
            name: _formData.name,
            type: _formData.type,
            remark: _formData.remark,
            status: 1, //状态 0:停用(删除) 1:启用 暂时无用字段
            account_ids: this.checkedAccount, //因为选择的员工id需要处理一下 所以用了一个计算出来的字段 转化为int
            modules: this.isEddit ? _formData.modules : this.addModulesArray,
            wx_secret: _formData.wx_secret,
            wx_agentid: _formData.wx_agentid
          };
          this.$http({
            method: "post",
            url: this.isEddit ? api.projectEdit : api.projectAdd,
            data: param
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              //提交表单 成功返回
              this.$router.push({
                name: "projectAddEdditResult",
                query: { project_id: res.data.project_id }
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    removeBlankName() {
      this.formInfo.modules = this.formInfo.modules.filter(function(item) {
        if (item.name == "" || item.name.trim() == "") {
          return false;
        } else {
          return item;
        }
      });
    },
    //点击添加模块
    handleAddModule() {
      this.formInfo.modules.push({ id: 0, name: "" });
    },
    //点击删除模块
    handleMinusModule(ind) {
      //保留最后一个不被删除
      if (this.formInfo.modules.length <= 1) {
        return false;
      }
      //查找出此条模块 并删除
      this.formInfo.modules.splice(ind, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
.name-select-box {
  width: 50%;
  height: auto;
  border: 1px solid #dfdfdf;
  border-radius: 5px;
  padding: 12px;
  box-sizing: border-box;
  text-align: left;
}
</style>