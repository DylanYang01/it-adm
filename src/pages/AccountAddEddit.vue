<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        {{isEddit?"账户编辑":"账户添加"}}
      </div>
            <el-form  :model="formInfo" :rules="rules" class="custome-form-inline browser" ref="setForm" label-width="120px" >
              <!-- 项目名称 -->
              <el-form-item label="账户名称" prop="account_name">
                <el-input v-model="formInfo.account_name" placeholder="账户名称" style='width: 200px;'></el-input>
              </el-form-item>
              <!-- 姓名 -->
              <el-form-item label="姓名" prop="real_name">
                <el-input v-model="formInfo.real_name" placeholder="姓名" style='width: 200px;'></el-input>
              </el-form-item>
              <!-- 部门 -->
              <el-form-item label="部门"  style="position:relative;" prop="department_id">
                  <el-cascader
                    :options="departmentOptions"
                    v-model="formInfo.department_id"
                    change-on-select
                    placeholder="请选择部门"
                    :props="cascaderprops"
                    ref="cascader0"
                    ></el-cascader>
                    <el-tooltip content="点击编辑部门" placement="bottom" effect="light" style="margin-left:50px;">
                        <i class="el-icon-edit-outline" style="font-size:22px;cursor:pointer;" @click="handleAddEddit(2)"></i>
                    </el-tooltip>
                    <el-tooltip content="点击添加部门" placement="bottom" effect="light" style="margin-left:20px;">
                        <i class="el-icon-plus" style="font-size:22px;cursor:pointer;" @click="handleAddEddit(1)"></i>
                    </el-tooltip>
                     <el-tooltip content="点击删除部门" placement="bottom" effect="light" style="margin-left:20px;">
                        <i class="el-icon-delete" style="font-size:22px;cursor:pointer;" @click="handleDeleteDialog"></i>
                    </el-tooltip>
              </el-form-item>
               <!-- 邮箱 -->
              <el-form-item label="邮箱"  prop="email">
                <el-input v-model="formInfo.email" placeholder="邮箱" style='width: 200px;'></el-input>
              </el-form-item>
               <!-- 微信号 -->
              <el-form-item label="微信号" prop="wchart_id">
                <el-input v-model="formInfo.wchart_id" placeholder="微信号" style='width: 200px;'></el-input>
              </el-form-item>
              <!-- 电话 -->
              <el-form-item label="电话" prop="phone">
                <el-input v-model="formInfo.phone" placeholder="电话" style='width: 200px;'></el-input>
              </el-form-item>
              <!-- 启用  停用  0:停用 1:启用  改为： 2:停用 1:启用 -->
              <el-form-item label="账户状态">
                <el-switch
                    v-model="formInfo.status"
                    active-color="#13ce66"
                    inactive-color="#dfdfdf"
                    :active-value="1"
                    :inactive-value="2"
                    inactive-text="停用"
                    active-text="启用"
                    >
                </el-switch>
              </el-form-item>
              <!-- 创建 -->
                <el-form-item>
                 <el-button type="primary" size="medium"   @click="handleSubmit">完成</el-button>
              </el-form-item>
            </el-form>
                 <!-- 添加和编辑部门的弹框框 -->
        <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" width="500px" :center="true" >
          <el-form :model="dialogForm" :rules="rules" ref="dialogForm" >
            <el-form-item label="部门名称" label-width="100px" prop="name">
              <el-input v-model="dialogForm.name" auto-complete="off" style="width:300px;"></el-input>
            </el-form-item>
            <el-form-item label="上级部门" label-width="100px" prop="selectedDepartment" >
               <el-cascader
                    style="width:300px;"
                    :options="departmentOptions"
                    v-model="dialogForm.selectedDepartment"
                    placeholder="请选择部门"
                    change-on-select
                    :props="cascaderprops"
                    @change = "handleSelectChange"
                    ref="cascader1"
                    >
                </el-cascader>
            </el-form-item>
            <span v-if="edditAddType == 2" style="margin-left:35px;font-size:12px;color:#999;">注：请先点击部门进行选择，然后编辑部门名称</span>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleAddDepartment">确 定</el-button>
          </div>
        </el-dialog>

        <!-- 删除部门的弹窗 -->
        <el-dialog title="删除部门" :visible.sync="deleteDialogFormVisible" width="500px" :center="true" >
          <el-form :model="deleteDialogForm" :rules="rules" ref="deleteDialogForm">
            <el-form-item label="部门" label-width="100px" prop="selectedDeleteDepartment">
               <el-cascader
                    style="width:300px;"
                    :options="departmentOptions"
                    v-model="deleteDialogForm.selectedDeleteDepartment"
                    placeholder="请选择部门"
                    change-on-select
                    :props="cascaderprops"
                    ref="cascader1"
                    >
                </el-cascader>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="deleteDialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleDeleteDepartment">确 定</el-button>
          </div>
        </el-dialog>
    </div>
  </el-main>
</template>

<script>
import api from "../server/serverUrl";
// 页面的逻辑是这样的
//在页面初始加载的时候，2个部门下拉的内容 都应该自动渲染好了
//然后 在点击添加的时候，完成编辑点击对话框的确定按钮的时候 给后端传{"name": "php","parent_id":1},在接口返回的时候 再次更新页面初始的2个下拉内容

//在回填部门的额时候 ，后端返回的是带有所有父级id的数组，前端这边 可以直接用数组渲染回填级联数组

//添加部门和编辑部门  不同的 type 1:添加   2:编辑
export default {
  data() {
    var emailRef = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; //邮箱验证正则
    // var wxreg = / ^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/; //微信验证 正则
    var wxreg = /^[a-zA-Z\d_]{5,}$/;
    var reg = /(1[0-9]{9})/; //电话号码的正则
    var validateTel = (rule, value, callback) => {
      value = value.trim();
      if (value === "") {
        callback();
      } else {
        if (reg.test(value)) {
          callback();
        } else {
          callback(new Error("请输入正确的手机号"));
        }
      }
    };
    var validateWchat = (rule, value, callback) => {
      value = value.trim();
      if (value === "") {
        callback();
      } else {
        if (wxreg.test(value)) {
          callback();
        } else {
          callback(new Error("请输入合法微信号"));
        }
      }
    };
    var validateEmail = (rule, value, callback) => {
      value = value.trim();
      if (value === "") {
        callback();
      } else {
        if (emailRef.test(value)) {
          callback();
        } else {
          callback(new Error("请输入正确的邮箱地址"));
        }
      }
    };
    var validateSelectedDepartment = (rule, value, callback) => {
      if (value === []) {
        callback();
      } else {
        if (this.edditAddType == 1) {
          callback();
        } else if (this.edditAddType == 2) {
          if (value.length != 0) {
            callback();
          } else {
            callback(new Error("请选择要编辑的部门"));
          }
        }
      }
    };
    return {
      activeName: "first",
      dialogFormVisible: false,
      deleteDialogFormVisible: false,
      edditAddType: 1, // 1:添加   2:编辑
      //由于组件内用的字段名和后端返回的不一致  要转化一下
      cascaderprops: {
        value: "id",
        label: "name"
      },
      paging: {
        total: 0,
        pagesize: 10,
        currentpage: 1
      },
      dialogForm: {
        name: "",
        selectedDepartment: []
      },
      deleteDialogForm: {
        selectedDeleteDepartment: []
      },
      formInfo: {
        id: 0,
        account_name: "",
        real_name: "",
        email: "",
        wchart_id: "",
        phone: "",
        status: 1,
        department_id: []
      },

      rules: {
        real_name: [
          { required: true, message: "不能为空", trigger: "blur" },
          { max: 50, message: "名字输入不能超过50个字符", trigger: "blur" }
        ],
        name: [{ required: true, message: "不能为空", trigger: "change" }],
        account_name: [{ required: true, message: "不能为空", trigger: "blur" }],
        email: [
          { required: true, message: "不能为空", trigger: "blur" },
          { validator: validateEmail, trigger: "blur" }
        ],
        phone: [
          { required: true, message: "不能为空", trigger: "blur" },
          { validator: validateTel, trigger: "blur" }
        ],
        wchart_id: [
          { required: true, message: "不能为空", trigger: "blur" },
          { validator: validateWchat, trigger: "blur" }
        ],
        department_id: [
          { required: true, message: "不能为空", trigger: "change", type: "array" }
        ],
        selectedDeleteDepartment: [
          { required: true, message: "不能为空", trigger: "change", type: "array" }
        ],
        selectedDepartment: [
          {
            // required: true,
            validator: validateSelectedDepartment,
            trigger: "blur",
            trigger: "change",
            type: "array"
          }
        ]
      },
      departmentOptions: []
    };
  },

  created() {
    if (this.isEddit) {
      this.getAccout();
    }
    this.getDepartmentList();
  },
  components: {
    // IEcharts
  },
  computed: {
    isEddit() {
      return JSON.stringify(this.$route.query) != "{}";
    },
    _last_id() {
      let _department_arr = this.formInfo.department_id;
      return _department_arr.length == 0
        ? 0
        : _department_arr[_department_arr.length - 1];
    },
    _last_id_dialog() {
      let _department_arr = this.dialogForm.selectedDepartment;
      return _department_arr.length == 0
        ? 0
        : _department_arr[_department_arr.length - 1];
    },
    dialogFormTitle() {
      return this.edditAddType == 1 ? "添加部门" : "编辑部门";
    },
    _last_id_deletDialog() {
      let _department_arr = this.deleteDialogForm.selectedDeleteDepartment;
      return _department_arr.length == 0
        ? 0
        : _department_arr[_department_arr.length - 1];
    }
  },

  methods: {
    //获取账户信息
    getAccout() {
      let param = {
        account_id: this.$route.query.account_id
      };
      this.$http({
        method: "post",
        url: api.getAccount,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.formInfo = res.data;
        }
      });
    },
    //获取部门列表
    getDepartmentList() {
      let param = {
        page: this.paging.currentpage,
        pageSize: this.paging.pagesize
      };
      this.$http({
        method: "post",
        url: api.departmentList,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.departmentOptions = res.data;
        }
      });
    },
    //处理 编辑或者添加状态
    handleAddEddit(type) {
      //情况上次新增或者编辑记录
      this.handleClearDialogForm();
      this.dialogFormVisible = true;
      this.edditAddType = type;
    },
    handleDeleteDialog() {
      this.deleteDialogFormVisible = true;
      this.deleteDialogForm.selectedDeleteDepartment = [];
    },
    //提交编辑或者新增
    handleSubmit() {
      this.$refs["setForm"].validate(valid => {
        if (valid) {
          let _formData = this.formInfo;
          let params = {
            id: this.isEddit ? _formData.id : 0,
            account_name: _formData.account_name,
            real_name: _formData.real_name,
            department_id: this._last_id,
            email: _formData.email,
            wchart_id: _formData.wchart_id,
            phone: _formData.phone,
            status: _formData.status
          };

          this.$http({
            method: "post",
            url: this.isEddit ? api.userEdit : api.userAdd,
            data: params
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              this.$router.push({
                name: "accountList"
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    handleSelectChange(val) {
      if (this.edditAddType == 1) {
        return;
      }
      //如果是编辑，就执行以下操作
      let _selectedId = this._last_id_dialog;
      let _arryBack = item => {
        if (
          Object.prototype.toString.call(item) == "[object Array]" &&
          item.length > 0
        ) {
          item.forEach(subitem => {
            if (subitem.id == _selectedId) {
              this.dialogForm.name = subitem.name;
            }
            if (subitem.children) {
              _arryBack(subitem.children); //递归循环调用
            }
          });
        }
      };
      _arryBack(this.departmentOptions);
    },
    //提交 添加部门的弹窗
    handleAddDepartment() {
      this.$refs["dialogForm"].validate(valid => {
        if (valid) {
          let _selectedDepartment = this.dialogForm.selectedDepartment;
          let param = {
            name: this.dialogForm.name,
            parent_id: this._last_id_dialog,
            type: this.edditAddType
          };
          this.$http({
            method: "post",
            url: api.departmentAdd,
            data: param
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              //添加成功
              this.dialogFormVisible = false;
              //刷新部门列表
              this.getDepartmentList();
            }
          });
        } else {
          return false;
        }
      });
    },
    //提交 删除部门的弹窗
    handleDeleteDepartment() {
      this.$refs["deleteDialogForm"].validate(valid => {
        if (valid) {
          let _selectedDepartment = this.deleteDialogForm
            .selectedDeleteDepartment;
          let param = {
            department_id: this._last_id_deletDialog
          };
          this.$http({
            method: "post",
            url: api.departmentDel,
            data: param
          }).then(res => {
            res = res.data;
            if (res.errorcode === 0) {
              //添加成功
              this.deleteDialogFormVisible = false;
              //刷新部门列表
              this.getDepartmentList();
            }
          });
        } else {
          return false;
        }
      });
    },
    handleClearDialogForm() {
      this.dialogForm.name = "";
      this.dialogForm.selectedDepartment = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.name-select-box {
  width: 40%;
  height: auto;
  border: 1px solid #dfdfdf;
  border-radius: 5px;
  padding: 12px;
  box-sizing: border-box;
  text-align: left;
}
.department_blk {
  display: block;
  font-size: 12px;
  color: red;
  position: absolute;
  left: 0;
  top: 25px;
}
.border-red {
  border-color: red !important;
}
</style>