<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/alert/alertList' }">预警列表</el-breadcrumb-item>
          <el-breadcrumb-item>设置预警完成</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

            <el-form  class="custome-form-inline browser" ref="setForm" label-width="120px" >
              <!-- 预警名称 -->
              <el-form-item label="预警名称">
                <span class="show-result-text">{{formInfo.name}}</span>
              </el-form-item>
              <!-- 项目名称-->
              <el-form-item label="项目名称" >
                <span class="show-result-text">{{formInfo.project_name}}</span>
              </el-form-item>
              <!-- 项目模块 -->
              <el-form-item label="项目模块">
                <span class="show-result-text">{{formInfo.module_name}}</span>
              </el-form-item>
              <!-- 预警成员 -->
              <el-form-item label="预警成员">
                <span class="show-result-text">{{formInfo.account_names}}</span>
              </el-form-item>
              <!-- 预警类型 -->
               <el-form-item label="预警类型">
                <span v-for="(item,index) in typeShow" :key="index" class="show-result-text">{{item}}{{index == typeShow.length-1?"":","}}</span>
              </el-form-item>

              <!-- 备注 -->
              <el-form-item  v-if="formInfo.remark" label="备注">
                <span  class="show-result-text">{{formInfo.remark}}</span>
              </el-form-item>

              <!-- 预警接口 -->
              <el-form-item label="预警接口">
                   <span class="show-result-text">{{formInfo.url}}</span>
              </el-form-item>

              <!-- 返回列表 -->
                <el-form-item>
                 <el-button type="primary" size="medium"   @click="handleBack">返回列表</el-button>
              </el-form-item>

            </el-form>
    
 
    </div>
  </el-main>
</template>

<script>
import api from "../server/serverUrl";
export default {
  data() {
    return {
      formInfo: {
        id: 1,
        name: "预警A",
        project_id: 1,
        project_name: "项目一",
        module_id: 1,
        module_name: "模块一",
        account_ids: [1, 2],
        account_names: "zhang,chen",
        type: [],
        remark: "备注",
        url: "http://xxxx.com/warn/?content={content}"
      },
      types: [
        { type: 1, name: "微信" },
        { type: 2, name: "邮件" },
        { type: 4, name: "电话" },
        { type: 8, name: "短信" }
      ]
    };
  },
  created() {
    this.getWarning();
  },
  components: {
    // IEcharts
  },
  computed: {
    typeShow() {
      let _newArray = [];
      this.types.forEach(item => {
        this.formInfo.type.forEach(subItem => {
          if (subItem == item.type) {
            _newArray.push(item.name);
          }
        });
      });
      return _newArray;
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
          this.formInfo = res.data;
        }
      });
    },
    handleBack() {
      this.$router.push({
        name: "alertList"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.show-result-text {
  color: #999999;
}
</style>