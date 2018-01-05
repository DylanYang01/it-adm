<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/alert/alertList' }">预警列表</el-breadcrumb-item>
          <el-breadcrumb-item>{{isEddit?"预警编辑":"预警添加"}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
     

            <el-form  :model="formInfo" class="custome-form-inline browser" ref="setForm" label-width="120px" :rules="rules">
              <!-- 预警名称 -->
              <el-form-item label="预警名称" prop="name">
                <el-input v-model="formInfo.name" placeholder="预警名称" style='width: 200px;'></el-input>
              </el-form-item>
              <!-- 项目名称-->
              <el-form-item label="项目名称"  >
                <el-select filterable v-model="formInfo.project_id" placeholder="项目名称"  @change="setModuleAndAccounts(true)">
                   <el-option 
                    v-for="item in formInfo.projectInfo"  
                    :key="item.project_id" 
                    :label="item.project_name" 
                    :value="item.project_id">
                  </el-option>
                </el-select>
                <el-tooltip content="跳转至添加项目页" placement="right" effect="light">
                  <i class="el-icon-plus" style="font-size:22px;cursor:pointer;" @click="$router.push({name:'projectAddEddit'})"></i>
                </el-tooltip>
              </el-form-item>
              <!-- 项目模块 -->
              <el-form-item label="项目模块">
                <el-select filterable v-model="formInfo.module_id" placeholder="项目模块">
                  <el-option 
                    v-for="item in formInfo.moduleInfo"  
                    :key="item.module_id" 
                    :label="item.module_name" 
                    :value="item.module_id">
                  </el-option>
                </el-select>
                <el-tooltip content="点击添加模块" placement="right" effect="light">
                  <i class="el-icon-plus" style="font-size:22px;cursor:pointer;" @click="dialogFormVisible = true"></i>
                </el-tooltip>
              </el-form-item>
              <!-- 预警成员 -->
              <el-form-item label="预警成员" prop="account_ids">
                     <el-checkbox-group  v-model="formInfo.account_ids" class="name-select-box" >
                      <el-checkbox v-for="item in formInfo.accountsInfo" :label="item.id" :key="item.id" style="display:block;">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
              </el-form-item>
              <!-- 预警类型 -->
              <el-form-item label="预警类型" prop="typeInfo">
                  <el-checkbox-group  v-model="formInfo.typeInfo"  style="width:410px;" >
                    <el-checkbox v-for="item in formInfo.types" :label="item.type" :key="item.type" style="display:block;">{{item.name}}</el-checkbox>
                  </el-checkbox-group>
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
                 <el-button type="primary" size="medium"   @click="handleSubmit">完成</el-button>
              </el-form-item>

            </el-form>

             <!-- 添加模块的弹框框 -->
        <el-dialog title="添加模块" :visible.sync="dialogFormVisible" width="500px" :center="true">
          <el-form :model="dialogForm" :rules="rules" ref="dialogForm">
            <el-form-item label="模块名称" label-width="100px" prop="module_name">
              <el-input v-model="dialogForm.module_name" auto-complete="off" style="width:300px;"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleSubmitDialog">确 定</el-button>
          </div>
        </el-dialog>
    
 
    </div>
  </el-main>
</template>

<script>
//页面逻辑是************************
//先获取一下  项目模块联动列表  渲染出项目和模块的下拉以及第一个项目对应的所有成员，(注意 成员和模块是平级的，都在同一项目下)
//如果是编辑页面，再根据单个warning_id获取此条预警信息，然后根据返回的account_ids设置已选中的成员
//注意--------------项目和模块之间是联动的，并且项目和下面的成员 是联动的  但是模块和成员之间不联动

//点击 添加模块右边的加号 会弹出添加模块的弹窗，确认弹框之后请求根据项目id的更新接口， 成功后再刷新 项目模块联动 的接口，

import api from "../server/serverUrl";
export default {
  data() {
    return {
      activeName: "first",
      dialogFormVisible: false,
      formInfo: {
        name: "",
        projectInfo: [], //全部项目
        project_id: 0, //已选择的项目id
        moduleInfo: [], //全部模块
        module_id: 0, //已选择的模块id
        accountsInfo: [], //成员信息列表
        account_ids: [], //已选择的成员 id集合
        checkedTypes: [],
        types: [
          { type: 1, name: "微信" },
          { type: 2, name: "邮件" },
          { type: 4, name: "电话" },
          { type: 8, name: "短信" }
        ],
        typeInfo: [1], //用以盛放已选择的types
        remark: ""
      },
      projectModuleData: [],
      dialogForm: {
        module_name: ""
      },
      rules: {
        module_name: [{ required: true, message: "模块名不能为空", trigger: "blur" }],
        name: [{ required: true, message: "预警名不能为空", trigger: "blur" }],
        account_ids: [
          {
            required: true,
            message: "成员不能为空",
            trigger: "change",
            type: "array"
          }
        ],
        typeInfo: [
          {
            required: true,
            message: "类型不能为空",
            trigger: "change",
            type: "array"
          }
        ]
      }
    };
  },
  created() {
    this.getProjectModules();
  },

  computed: {
    isEddit() {
      return JSON.stringify(this.$route.query) != "{}";
    }
  },
  methods: {
    getWarning() {
      this.$http({
        method: "post",
        url: api.getWarning,
        data: { warning_id: this.$route.query.warning_id }
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          //设置一些回填渲染数据
          this.formInfo.name = res.data.name;
          this.formInfo.project_id = res.data.project_id;
          this.formInfo.module_id = res.data.module_id;
          this.formInfo.account_ids = res.data.account_ids;
          this.formInfo.typeInfo = res.data.type;
          this.formInfo.remark = res.data.remark;
          this.setProjectOptions();
        }
      });
    },
    //项目模块 联动列表
    getProjectModules() {
      this.$http({
        method: "post",
        url: api.getProjectModules
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.projectModuleData = res.data;
          if (!this.isEddit) {
            //如果是新增，就直接初始化项目select下拉
            this.setProjectOptions();
          } else {
            //如果是编辑页面，就获取单个预警信息 回填
            this.getWarning();
          }
        }
      });
    },
    //给项目选项的下拉赋值
    setProjectOptions() {
      this.formInfo.projectInfo = []; //因为页面中添加模块之后会刷新再重新获取，所以要清空一下
      this.projectModuleData.length > 0 &&
        this.projectModuleData.forEach(item => {
          this.formInfo.projectInfo.push({
            project_id: item.project_id,
            project_name: item.project_name
          });
        });
      //设置第一个为默认选中
      if (!this.isEddit) {
        this.formInfo.project_id = this.projectModuleData[0].project_id;
      }

      this.setModuleAndAccounts();
    },
    setModuleAndAccounts(operate) {
      this.formInfo.moduleInfo = []; //初始化一下模块下拉数组
      this.formInfo.accountsInfo = []; //初始化成员列表数组
      if (!this.isEddit && this.formInfo.account_ids.length>0) {
        this.formInfo.account_ids = []; //初始化成员选择的成员
      }

      this.projectModuleData.forEach(item => {
        if (this.formInfo.project_id == item.project_id) {
          //渲染模块
          item.modules &&
            item.modules.forEach(subItem => {
              this.formInfo.moduleInfo.push({
                module_id: subItem.id,
                module_name: subItem.name
              });
            });
          //默认展示第一个并设置项目负责人为选中者
          if (!this.isEddit || operate) {
            this.formInfo.module_id = item.modules[0].id;
          }

          //渲染成员的复选框区域数据
          item.accounts &&
            item.accounts.forEach(subItem => {
              this.formInfo.accountsInfo.push({
                id: subItem.id,
                name: subItem.name
              });
              //如果是在添加界面，并且此条成员和项目负责人ID相同就设为选中，
              if (subItem.id == item.project_owner.id && !this.isEddit) {
                this.formInfo.account_ids = [item.project_owner.id];
              }
            });
        }
      });
    },

    handleSubmit() {
      this.$refs["setForm"].validate(valid => {
        if (valid) {
          let param = {
            id: this.isEddit ? this.$route.query.warning_id : 0,
            name: this.formInfo.name,
            project_id: this.formInfo.project_id,
            module_id: this.formInfo.module_id,
            account_ids: this.formInfo.account_ids,
            type: this.formInfo.typeInfo,
            remark: this.formInfo.remark
          };
          this.$http({
            method: "post",
            url: this.isEddit ? api.warningAdit : api.warningAdd,
            data: param
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              //跳到预警设置的结果详情界面
              this.$router.push({
                name: "alertListAddEdditResult",
                query: { warning_id: res.data.warning_id }
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    handleSubmitDialog() {
      this.$refs["dialogForm"].validate(valid => {
        if (valid) {
          let param = {
            project_id: this.formInfo.project_id,
            name: this.dialogForm.module_name
          };
          this.$http({
            method: "post",
            url: api.moduleAdd,
            data: param
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              this.dialogFormVisible = false;
              this.getProjectModules(); //刷新 项目模块的接口请求
              this.dialogForm.module_name = ""; //清空上次记录
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
.name-select-box {
  width: 410px;
  height: auto;
  border: 1px solid #dfdfdf;
  border-radius: 5px;
  padding: 12px;
  box-sizing: border-box;
  text-align: left;
}
.el-checkbox + .el-checkbox {
  margin-left: 0;
  margin-right: 30px;
}
</style>