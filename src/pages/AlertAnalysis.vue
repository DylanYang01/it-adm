<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        预警统计
      </div>

                <!-- 头部搜索部分 -->
          <div class="content-search clearfix">
            <el-form :inline="true" :model="formInline" class="custome-form-inline browser">
              <!-- 时间范围 -->
              
              <el-form-item >
                <el-date-picker
                  v-model="formInline.dataRange"
                  type="daterange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                   @change="getChartetail"
                  :editable="false"
                  :clearable="false"
                  >
                </el-date-picker>
                
              </el-form-item>
             <!-- 项目名称下拉 -->
              <el-form-item >
                <el-select filterable v-model="formInline.project_id" placeholder="项目名称"  @change="getChartetail" >
                  <el-option v-for="item in formInline.projects" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <!-- 预警类型 -->
              <el-form-item >
                <el-select filterable v-model="formInline.type" placeholder="预警类型"  @change="getChartetail" >
                  <el-option v-for="item in formInline.types" :key="item.type" :label="item.name" :value="item.type"></el-option>
                </el-select>
              </el-form-item>
              <!-- 项目负责人 -->
              <el-form-item v-if="roletype == 1">
                <el-select filterable v-model="formInline.owner" placeholder="项目创建人" @change="getChartetail">
                  <el-option v-for="item in formInline.owners" :key="item.account_id" :label="item.name" :value="item.account_id"></el-option>
                </el-select>
              </el-form-item>
              <!-- 查看表格数据详情 -->
              <el-form-item >
                <el-button type="primary" icon="el-icon-view" @click.native = "handleViewDetail">查看详情</el-button>
              </el-form-item>
            </el-form>
          </div>
             <!-- 展示部分 -->
        <div class="ai_contxt" >
          <el-row :gutter="0">
            <el-col :span="24">
              <!-- 图表部分 -->
              <div class="alert-chart">
                   <IEcharts :option="chartOptions" :resizable="true"  :loadingOpts="loadingStyle" ref="myCharts"></IEcharts>
               </div>
            </el-col>
          </el-row>
        </div>

    </div>
  </el-main>
</template>

<script>
import api from "../server/serverUrl";
import IEcharts from "vue-echarts-v3/src/full.js";
import format from "date-fns/format";
export default {
  data() {
    const userInfo = JSON.parse(sessionStorage.getItem("loginUserBaseInfo"));
    return {
      roletype: userInfo.type,
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
        owners: [],
        owner: ""
      },
      loading: false,
      loadingStyle: {
        text: "loading",
        color: "#20a0ff",
        textColor: "#000",
        maskColor: "rgba(255, 255, 255, 0.8)",
        zlevel: 0
      },
      chartOptions: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          },
          formatter: function(params, ticket, callback) {
            let str = "",
              _total = 0;
            params.forEach((item, index) => {
              _total += item.value;
              if (index == 0) {
                str += item.name +"<br/>";
              }
              str +=
                item.marker + item.seriesName + "：" + item.value + "<br />";
            });
            str +="<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#ffffff;'></span>"+ "total："+_total;

            return str;
          }
        },
        calculable: true,
        legend: {
          data: []
        },

        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: []
        },
        yAxis: [
          {
            type: "value"
          }
        ],
        series: [
          {
            name: "",
            type: "line",
            stack: "总量",
            itemStyle: { normal: { areaStyle: { type: "default" } } },
            data: []
          }
        ]
      }
    };
  },
  created() {
    this.init();
  },
  components: {
    IEcharts
  },
  methods: {
    init() {
      // 初始化时间值
      let sTime = new Date().getTime() - 3600 * 1000 * 24 * 6;
      let eTime = new Date();
      this.formInline.dataRange = [sTime, eTime];

      //获取项目列表
      this.getProjectList();
      //获取项目负责人-----------------只有管理员 才获取
      if (this.roletype == 1) {
        this.getProjectAccounts();
      }
    },
    handleViewDetail() {
      let startdate = this.formInline.dataRange[0]
        ? format(this.formInline.dataRange[0], "YYYY-MM-DD")
        : "";
      let enddate = this.formInline.dataRange[1]
        ? format(this.formInline.dataRange[1], "YYYY-MM-DD")
        : "";
      this.$router.push({
        path: "alertAnalysisDetail",
        query: {
          startdate: startdate,
          enddate: enddate
        }
      });
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

          //获取报告详情
          this.getChartetail();
        }
      });
    },
    getProjectAccounts() {
      this.$http({
        method: "post",
        url: api.getProjectAccounts
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.formInline.owners = res.data;
        }
      });
    },
    getChartetail() {
      let startdate = this.formInline.dataRange[0]
        ? format(this.formInline.dataRange[0], "YYYYMMDD")
        : "";
      let enddate = this.formInline.dataRange[1]
        ? format(this.formInline.dataRange[1], "YYYYMMDD")
        : "";
      let param = {
        start_time: startdate,
        end_time: enddate,
        project_id: this.formInline.project_id,
        type: this.formInline.type,
        account_id: this.formInline.owner
      };
      this.$http({
        method: "post",
        url: api.warningReport,
        data: param
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          //清空图表
          this.clearTrend();
          //画出新的图表
          this.drawTrend(res);
        }
      });
    },
    clearTrend() {
      //初始化图表X轴
      this.chartOptions.xAxis.data = [];
      //初始化图表标题
      this.chartOptions.legend.data = [];
      //强制清空series图表数据
      this.$refs["myCharts"] &&
        this.$refs["myCharts"].clear &&
        this.$refs["myCharts"].clear();
      this.$nextTick(function() {
        this.$refs["myCharts"] && this.$refs["myCharts"].init();
      });
    },
    drawTrend(res) {
      let _dataArray = res.data.data; // 图表的数据
      let _seriesArray = [],
        _obj = {};
      //开始 给图表 赋值
      //x轴
      this.chartOptions.xAxis.data = res.data.date;
      _dataArray.length &&
        _dataArray.forEach((item, ind) => {
          //legend
          this.chartOptions.legend.data.push(item.name);
          _obj = {
            name: item.name,
            type: "line",
            stack: "总量",
            itemStyle: { normal: { areaStyle: { type: "default" } } },
            data: item.value
          };
          _seriesArray.push(_obj);
        });
      //坐标轴的实际数据
      this.chartOptions.series = _seriesArray;
      // this.$set(this.chartOptions,'series',_seriesArray);
    }
  }
};
</script>

<style lang="scss" scoped>
.alert-chart {
  height: 500px;
  padding-top: 20px;
  padding-bottom: 20px;
}
</style>