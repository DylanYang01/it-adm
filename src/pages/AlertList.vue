<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
       预警列表
      </div>

                <!-- 头部搜索部分 -->
          <div class="content-search clearfix">
            <el-form :inline="true" :model="formInline" class="custome-form-inline browser">
              <!-- 项目名称下拉 -->
              <el-form-item >
                <el-select filterable v-model="formInline.project_id" placeholder="项目名称"  @change="setModuleOptions">
                  <el-option 
                  v-for="item in formInline.projectInfo"  
                  :key="item.project_id" 
                  :label="item.project_name" 
                  :value="item.project_id">
                  </el-option>
                </el-select>
              </el-form-item>
              <!-- 模块 -->
              <el-form-item >
                <el-select filterable v-model="formInline.module_id" placeholder="模块" @change="reserchList">
                  <el-option v-for="item in formInline.moduleInfo"  :key="item.module_id" :label="item.module_name" :value="item.module_id"></el-option>
                </el-select>
              </el-form-item>
      
      
               <!-- 搜索预警 -->
              <el-form-item  >
                    <el-input class="search_input" suffix-icon="el-icon-search" v-model="formInline.search" placeholder="输入预警名称或项目名称"></el-input>
                    <el-button type="primary"  @click="reserchList">搜索</el-button>
              </el-form-item>

              <!-- 添加预警 -->
              <el-form-item  class="pull-right">
                    <el-button type="primary"  icon="el-icon-plus"  @click="handleAddAlert">添加预警</el-button>
              </el-form-item>
            </el-form>
          </div>
             <!-- 展示部分 -->
        <div class="ai_contxt" >
          <el-row :gutter="0">
            <el-col :span="24">
              <!-- 表格部分 -->
              <el-table v-loading="loading"
                :data="tableData" class="table-custom" :border="true" header-row-class-name="table-header" :row-class-name="tableRowClassName" tooltip-effect="dark">
                    <el-table-column
                        prop="name"
                        align="center"
                        label="预警名称">
                    </el-table-column>
                    <el-table-column
                        align="center"
                        label="项目以及模块">
                         <template slot-scope="scope">
                            {{scope.row.project_name + "/" + scope.row.module_name}}
                         </template>
                    </el-table-column>
                    <el-table-column
                        prop="type_names"
                        align="center"
                        label="预警类型">
                    </el-table-column>
                    <el-table-column
                        prop="account_names"
                        align="center"
                        :show-overflow-tooltip="true"
                        label="预警成员">
                    </el-table-column>
                    <el-table-column
                        align="center"
                        label="操作">
                        <template slot-scope="scope">
                           <el-button
                            size="mini"
                            @click="handleView(scope.$index, scope.row)">查看</el-button>
                           <el-button
                            size="mini"
                             :disabled="canOperate(scope.row)"
                            type="success"
                            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button
                            size="mini"
                            type="danger"
                             :disabled="canOperate(scope.row)"
                            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
            </el-table>
            <div class="table-pagination pull-right">
                <el-pagination 
                    :current-page.sync="paging.page" 
                    @size-change="handleSizeChange" 
                    @current-change="handleCurrentChange" 
                    :page-size="paging.pageSize" 
                    layout="total, sizes, prev, pager, next" 
                    :total="paging.total" 
                    class="ai_pagination"
                    :page-sizes="[10,20, 30, 50, 80]">
                </el-pagination>
            </div>
              
            </el-col>
          </el-row>
        </div>


    </div>
  </el-main>
</template>

<script>
import api from "../server/serverUrl";
export default {
  data() {
    const userInfo = JSON.parse(sessionStorage.getItem("loginUserBaseInfo"));
    return {
      userType: userInfo.type, //1：管理员 2：普通用户
      userId: userInfo.id,
      activeName: "first",
      formInline: {
        projectInfo: [{ project_id: 0, project_name: "全部项目" }],
        project_id: 0,
        moduleInfo: [{ module_id: 0, module_name: "全部模块" }],
        module_id: 0,
        search: ""
      },
      projectModuleData: [
        {
          project_id: 1,
          project_name: "项目一",
          modules: [
            {
              id: 1,
              name: "项目一的模块一"
            },
            {
              id: 2,
              name: "项目一的模块二"
            }
          ]
        },
        {
          project_id: 2,
          project_name: "项目二",
          modules: [
            {
              id: 2,
              name: "项目二的模块一"
            },
            {
              id: 3,
              name: "项目二的模块二"
            }
          ]
        }
      ],
      paging: {
        total: 0,
        page: 1,
        pageSize: 10
      },
      loading: true,
      tableData: [
        {
          id: 1,
          name: "warning-01",
          project_id: 1,
          project_name: "项目一",
          module_id: 1,
          module_name: "模块一",
          type: 3,
          type_names: "微信、电话",
          account_names: "Jm,Tom",
          create_time: "2017-12-20 10:10:00"
        }
      ]
    };
  },
  created() {
    this.getAlertList();
    this.getProjectModules();
  },
  components: {
    // IEcharts
  },
  methods: {
    canOperate(row) {
      //管理员不做限制，只针对普通用户限制
      if (this.userType == 2) {
        if (this.userId == row.account_id) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
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
          this.setProjectOptions();
        }
      });
    },
    //获取  预警列表
    getAlertList() {
      let param = {
        page: this.paging.page,
        pageSize: this.paging.pageSize,
        project_id: this.formInline.project_id,
        module_id: this.formInline.module_id,
        search: this.formInline.search
      };
      this.$http({
        method: "post",
        url: api.warninList,
        data: param
      }).then(res => {
        this.loading = false;
        res = res.data;
        if (res.errorcode === 0) {
          this.paging = res.paging;
          this.tableData = res.data;
        }
      });
    },
    //给项目选项的下拉赋值
    setProjectOptions() {
      this.projectModuleData.length > 0 &&
        this.projectModuleData.forEach(item => {
          this.formInline.projectInfo.push({
            project_id: item.project_id,
            project_name: item.project_name
          });
        });
    },
    //给模块名字下拉 赋值
    setModuleOptions() {
      this.formInline.moduleInfo = [{ module_id: 0, module_name: "全部模块" }]; //初始化一下模块下拉数组
      this.formInline.module_id = 0;
      this.projectModuleData.forEach(item => {
        if (this.formInline.project_id == item.project_id) {
          item.modules &&
            item.modules.forEach(subItem => {
              this.formInline.moduleInfo.push({
                module_id: subItem.id,
                module_name: subItem.name
              });
            });
        }
      });
      if (!this.formInline.project_id) {
        this.formInline.module_id = 0;
      }
      //触发一下搜索列表的事件
      this.reserchList();
    },
    reserchList() {
      this.paging.page = 1;
      this.getAlertList();
    },
    // 隔行添加变色
    tableRowClassName(row, index) {
      if (index % 2 == 1) {
        return "positive-row";
      }
      return "";
    },
    // 分页相关
    handleSizeChange(size) {
      this.paging.pagesize = size;
      this.currentpage = 1;
      this.getAlertList();
    },
    // 分页相关
    handleCurrentChange(page) {
      this.paging.page = page;
      this.getAlertList();
    },
    handleAddAlert() {
      this.$router.push({ name: "alertListAddEddit" });
    },
    handleView(index, row) {
      this.$router.push({
        name: "alertListAddEdditResult",
        query: { warning_id: row.id }
      });
    },
    handleEdit(index, row) {
      this.$router.push({
        name: "alertListAddEddit",
        query: { warning_id: row.id }
      });
    },
    handleDelete(index, row) {
      this.$confirm("此操作将删除这条预警, 是否继续?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleteRequest(row.id);
        })
        .catch(() => {});
    },
    //删除的请求
    deleteRequest(id) {
      this.$http({
        method: "post",
        url: api.warningDel,
        data: { warning_id: id }
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          //再次刷新列表
          this.paging.page = 1;
          this.getAlertList();
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>