<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
       项目列表
       <el-button style="margin-left:85%;" icon="el-icon-plus" type="primary" @click="handleAdd">添加项目</el-button>
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
                        label="项目名称">
                    </el-table-column>
                    <el-table-column
                        prop="type"
                        align="center"
                        :formatter="typeFormatter"
                        label="类型">
                    </el-table-column>
                    <el-table-column
                        prop="account_num"
                        align="center"
                        label="成员">
                    </el-table-column>
                    <el-table-column
                        align="center"
                        :show-overflow-tooltip="true"
                        label="模块">
                         <template slot-scope="scope">
                          <span v-for="(item,index) in scope.row.module" :key="'module-p-'+index">{{item}}{{index == scope.row.module.length-1?"":","}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        align="center"
                        label="操作">
                        <template slot-scope="scope">
                          <el-button
                            size="mini"
                            @click="$router.push({name:'projectAddEdditResult',query:{project_id:scope.row.id}})">查看</el-button>
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
//项目类型 1:业务项目 2:内部项目
import api from "../server/serverUrl";
export default {
  data() {
    const userInfo = JSON.parse(sessionStorage.getItem("loginUserBaseInfo"));
    return {
      userType: userInfo.type, //1：管理员 2：普通用户
      userId: userInfo.id,
      paging: {
        total: 101,
        page: 1,
        pageSize: 10
      },
      loading: true,
      tableData: []
    };
  },
  created() {
    this.getProjectList();
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
    // 隔行添加变色
    tableRowClassName(row, index) {
      if (index % 2 == 1) {
        return "positive-row";
      }
      return "";
    },
    typeFormatter(row, col) {
      return row.type == 1 ? "业务项目" : "内部项目";
    },
    // 分页相关
    handleSizeChange(size) {
      this.paging.pagesize = size;
      this.currentpage = 1;
      this.getProjectList();
    },
    // 分页相关
    handleCurrentChange(page) {
      this.paging.page = page;
      this.getProjectList();
    },
    getProjectList() {
      let param = {
        page: this.paging.page,
        pageSize: this.paging.pageSize
      };
      this.$http({
        method: "post",
        url: api.projectList,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.loading = false;
          this.paging = res.paging;
          this.tableData = res.data;
        }
      });
    },
    handleAdd() {
      this.$router.push({ name: "projectAddEddit" });
    },
    handleEdit(index, row) {
      this.$router.push({
        name: "projectAddEddit",
        query: { project_id: row.id }
      });
    },
    handleDelete(index, row) {
      this.$confirm("此操作将删除这条项目, 是否继续?", {
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
        url: api.projectDel,
        data: { project_id: id }
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          //再次刷新列表
          this.getProjectList();
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>