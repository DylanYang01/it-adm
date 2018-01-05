<template>
  <el-main>
    <div class="main">
      <!-- 标题 -->
      <div class="content-title">
        创建项目完成
      </div>

            <el-form  class="custome-form-inline browser" ref="setForm" label-width="120px" >
              <!-- 项目名称 -->
              <el-form-item label="项目名称">
                <span class="show-result-text">{{dataBase.name}}</span>
              </el-form-item>
              <!-- 项目类型-->
              <el-form-item label="项目类型" >
                <span  class="show-result-text">{{dataBase.type == 1? "业务项目":"内部项目"}}</span>
              </el-form-item>
              <!-- 项目模块 -->
              <el-form-item label="项目模块">
                <span v-for="(item,index) in dataBase.modules" :key="item.id+'_module_span'" class="show-result-text">{{item.name}}{{index == dataBase.modules.length-1?"":","}}</span>
                
              </el-form-item>
              <!-- 项目成员 -->
              <el-form-item label="项目成员">
                <span  class="show-result-text">{{dataBase.account_names}}</span>
              </el-form-item>
              <!-- wx_agentid -->
              <el-form-item label="wx_agentid">
                <span  class="show-result-text">{{dataBase.wx_agentid}}</span>
              </el-form-item>
              <!-- wx_secret -->
              <el-form-item label="wx_secret">
                <span  class="show-result-text">{{dataBase.wx_secret}}</span>
              </el-form-item>
              <!-- 项目备注 -->
              <el-form-item label="项目备注">
                   <span class="show-result-text">{{dataBase.remark}}</span>
              </el-form-item>

              <!-- 返回列表 -->
                <el-form-item>
                 <el-button type="primary" size="medium"   @click="handleBackList">返回列表</el-button>
                 <el-button type="primary" size="medium"   @click="handleBackEddit">返回修改</el-button>
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
      dataBase: {
        id: 0,
        name: "",
        type: 1,
        remark: "",
        status: 1, //状态 0:停用(删除) 1:启用 暂时无用字段
        account_ids: [],
        modules: [{ id: 0, name: "" }]
      }
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
      let _project_id = this.$route.query.project_id;
      this.$http({
        method: "post",
        url: api.getProject,
        data: { project_id: _project_id }
      }).then(res => {
        res = res.data;
        if (res.errorcode === 0) {
          this.dataBase = res.data;
        }
      });
    },
    handleBackList() {
      this.$router.push({
        name: "projectList"
      });
    },
    handleBackEddit() {
      this.$router.push({
        name: "projectAddEddit",
        query: { project_id: this.$route.query.project_id }
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