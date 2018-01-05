<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/alert/alertAnalysis' }">预警统计</el-breadcrumb-item>
          <el-breadcrumb-item>预警信息列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

                <!-- 头部搜索部分 -->
          <div class="content-search clearfix">
            <el-form :inline="true" :model="formInline" class="custome-form-inline browser" >
              <!-- 时间范围 -->
              
              <el-form-item >
                <el-date-picker
                  v-model="formInline.dataRange"
                  type="daterange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change = "researchList"
                  :editable="false"
                  :clearable="false"
                  >
                </el-date-picker>
                
              </el-form-item>
              <!-- 项目名称下拉 -->
              <el-form-item >
                <el-select filterable v-model="formInline.project_id" placeholder="项目名称" @change="researchList">
                  <el-option v-for="item in formInline.projects" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <!-- 预警类型 -->
              <el-form-item >
                <el-select filterable v-model="formInline.type" placeholder="预警类型" @change="researchList">
                  <el-option v-for="item in formInline.types" :key="item.type" :label="item.name" :value="item.type"></el-option>
                </el-select>
              </el-form-item>
               <!-- 搜索预警 -->
              <el-form-item  >
                    <el-input class="search_input" icon="search" v-model="formInline.search" placeholder="输入成员搜索"></el-input>
                    <el-button type="primary" class="" icon="search" @click="researchList">搜索</el-button>
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
                        prop="create_time"
                        align="center"
                        label="时间">
                    </el-table-column>
                    <el-table-column
                        prop="project_name"
                        align="center"
                        label="项目">
                    </el-table-column>
                    <el-table-column
                        prop="type_name"
                        align="center"
                        label="预警类型">
                    </el-table-column>
                    <el-table-column
                        prop="account_names"
                        align="center"
                        label="预警对象">
                    </el-table-column>
                    <el-table-column
                        prop="content"
                        align="center"
                        :show-overflow-tooltip="true"
                        label="预警内容">
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
import format from "date-fns/format";
export default {
  data() {
    return {
      activeName: "first",
      formInline: {
        project_id: 0,
        projects: [{ id: 0, name: "全部项目" }],
        dataRange: [],
        types: [
          { type: 0, name: "全部类型" },
          { type: 1, name: "微信" },
          { type: 2, name: "邮件" },
          { type: 4, name: "电话" },
          { type: 8, name: "短信" }
        ],
        type: 0,
        search: ""
      },
      paging: {
        total: 0,
        page: 1,
        pageSize: 10
      },
      loading: true,
      tableData: []
    };
  },
  created() {
    this.init();
  },
  components: {
    // IEcharts
  },
  methods: {
    init() {
      // 初始化时间值(继承了上个页面的时间值)
      let _queryParam = this.$route.query;
      this.formInline.dataRange = [new Date(_queryParam.startdate), new Date(_queryParam.enddate)];

      //获取项目列表
      this.getProjectList();
      //获取预警详情信息
      this.getWarningReportDetail();
    },
    //获取预警详情信息
    getWarningReportDetail() {
      let startdate = this.formInline.dataRange[0]
        ? format(this.formInline.dataRange[0], "YYYYMMDD")
        : "";
      let enddate = this.formInline.dataRange[1]
        ? format(this.formInline.dataRange[1], "YYYYMMDD")
        : "";
      let param = {
        page: this.paging.page,
        pageSize: this.paging.pageSize,
        start_time: startdate,
        end_time: enddate,
        project_id: this.formInline.project_id,
        type: this.formInline.type,
        search: this.formInline.search
      };
      this.$http({
        method: "post",
        url: api.warningReportDetail,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.loading = false;
          this.tableData = res.data;
          this.paging = res.paging;
        }
      });
    },
    researchList() {
      this.paging.page = 1;
      this.getWarningReportDetail();
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
      this.paging.pageSize = size;
      this.currentpage = 1;
      this.getWarningReportDetail();
    },
    // 分页相关
    handleCurrentChange(page) {
      this.paging.page = page;
      this.getWarningReportDetail();
    },
    getProjectList() {
      this.$http({
        method: "post",
        url: api.projectList
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          res.data.length &&
            res.data.forEach(item => {
              this.formInline.projects.push({
                id: item.id,
                name: item.name
              });
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.scroll-content {
  display: block;
  max-height: 70px;
  width: 100%;
  overflow-y: scroll;
}
</style>