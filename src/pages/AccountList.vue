<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
       账户列表
        <el-button style="margin-left:85%;" icon="el-icon-plus" type="primary" @click="handleAdd">添加账户</el-button>
      </div>
             <!-- 展示部分 -->
        <div class="ai_contxt" >
          <el-row :gutter="0">
            <el-col :span="24">
              <!-- 表格部分 -->
              <el-table v-loading="loading"
                :data="tableData" class="table-custom" :border="true" header-row-class-name="table-header" :row-class-name="tableRowClassName" tooltip-effect="dark">
                    <el-table-column
                        prop="account_name"
                        align="center"
                        label="账户名称">
                    </el-table-column>
                    <el-table-column
                        prop="email"
                        align="center"
                        label="邮箱">
                    </el-table-column>
                    <el-table-column
                        prop="id"
                        align="center"
                        label="ID">
                    </el-table-column>
                    <el-table-column
                        prop="department"
                        align="center"
                        label="部门">
                    </el-table-column>
                     <el-table-column
                        prop="create_time"
                        align="center"
                        label="添加时间">
                    </el-table-column>
                    <el-table-column
                        align="center"
                        label="操作">
                        <template slot-scope="scope">
                           <el-button
                            size="mini"
                            type="success"
                            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button
                            :disabled="scope.row.type==1"
                            size="mini"
                            type="danger"
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
//类型 1：管理员 2普通用户   页面逻辑：账户删除的按钮  管理员的不渲染
import api from "../server/serverUrl";
export default {
  data() {
    return {
      activeName: "first",
      paging: {
        total: 2,
        pageSize: 10,
        page: 1
      },
      loading: true,
      tableData: []
    };
  },
  created() {
    this.getAccountList();
  },
  components: {
    // IEcharts
  },
  methods: {
    // 隔行添加变色
    tableRowClassName(row, index) {
      if (index % 2 == 1) {
        return "positive-row";
      }
      return "";
    },
    // 分页相关
    handleSizeChange(size) {
      this.paging.pageSize = size;
      this.paging.page = 1;
      this.getAccountList();
    },
    // 分页相关
    handleCurrentChange(page) {
      this.paging.page = page;
      this.getAccountList();
    },
    handleAdd() {
      this.$router.push({ name: "accountAddEddit" });
    },

    handleEdit(index, row) {
      this.$router.push({
        name: "accountAddEddit",
        query: { account_id: row.id }
      });
    },
    handleDelete(index, row) {
      this.$confirm("此操作将删除这个用户, 是否继续?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleteRequest(row.id);
        })
        .catch(() => {});
    },
    //列表的请求
    getAccountList() {
      let param = {
        page: this.paging.page,
        pageSize: this.paging.pageSize
      };
      this.$http({
        method: "post",
        url: api.accountList,
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
    //删除的请求
    deleteRequest(id) {
      this.$http({
        method: "post",
        url: api.userDel,
        data: { account_id: id }
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          //再次刷新列表
          this.getAccountList();
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>