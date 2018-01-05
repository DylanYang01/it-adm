<template>
  <div >
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>
<!--图标字体-->
<style src='./assets/iconfont/style.css'></style>
<!-- 网络字体 -->
<style src='./assets/webfont/fonts.css'></style>

<!-- 为了确保一致的提取和处理，建议从根App.vue组件导入全局独立样式文件 -->
<style src='normalize.css'></style>

<style src='element-ui/lib/theme-chalk/index.css'></style>
<style src='./style/global.scss' lang="scss"></style>
