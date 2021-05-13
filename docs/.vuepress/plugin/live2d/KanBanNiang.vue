<template>
  <div class="kanbanniang" v-if="isLoaded">
    <div class="banniang-container">
      <div class="message-box" v-show="isShowMessageBox">
        {{ lines[linesIndex] }}
      </div>
      <canvas id="banniang" class="live2d" width="150" height="230" @click="say"></canvas>
    </div>
  </div>
</template>

<script>
import live2dJSString from './live2d.js'
export default {
  name: 'KanBanNiang',
  data () {
    return {
      isLoaded: true,
      isShowMessageBox: false,
      lines: [
        // get
        "你好长官，我是Z系列驱逐舰Z16号，请选择我跟您一起战斗吧。",
        "1934A系列11号舰，弗雷德里克报道！啊不过，希望能叫我芙蕾德莉卡……",
        // day
        "Z1姐姐每天都那么努力，我也不能落后了！",
        "长官，布置水雷也是非常重要的工作，可别小瞧了！",
        "白天的时候要好好训练，这样晚上就可以睡一个好觉了。",
        // night
        "我，我一定会快些长大！这样就会……嘿嘿，没什么啦！",
        "每天和Z1姐姐布置水雷是很辛苦，不过也是很开心的事情啦！",
        "呜…有些累了，果然我的续航性能还是太弱了……",
        // other
        "啊，这是意料外的情况，完全不知道该做什么……	",
        "嗯——您喜欢什么样的女生呢？",
        "我会努力加油的！",
        "这次一定可以命中！",
        "鱼雷才是我的强项！",
        "还是不够努力呀……	",
        "似乎是完成了既定目标呢。",
        "接受长官的告白，好像做梦一样呢。今后，我也会继续努力加油的，为了、为了我们的未来！",
        // day‌
        "长官，Z16已经提前把今天的训练任务完成，这样就可以来帮您工作了。",
        "虽然Z16现在还不是很会照顾人，但是我一定会努力和港区的其它姐妹学习，一定可以成为一位合格的…合格的…这个词，有点不好意思说出口……",
        "虽然战斗方面不如别人，但是我可以依靠精准的布雷击倒敌人哦！这可是我独有的绝技！厉害吗？",
        // night
        "长官，今天德意志教了我一个饮料的做法，说你一定会喜欢的。首先要找大麦芽1斤，水5斤，鸡蛋清1—2个…啊，您脸色怎么不太好？",
        "长官，我未来也可以成为守护您的力量吗？……已经是了吗？还是说……知道啦，我会继续努力的，嘿嘿。",
        "书本里只要放一些糖果，每天就有打开书本的动力了！",
      ],
      linesIndex: -1,
      linesTimer: null
    }
  },
  methods: {
    // 初始化
    initBanNiang () {
      // 移动端不显示
      const isMobile = !!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      if (isMobile) {
        this.isLoaded = false
        return console.log('mobile do not load model')
      }
      if (!window.loadlive2d) {
        const script = document.createElement('script')
        script.innerHTML = live2dJSString
        document.body.appendChild(script)
      }
      window.loadlive2d(
        'banniang',
        'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-z16/assets/z16.model.json'
      )
    },
    
    // 随机台词
    say(){
      let i = Math.floor(Math.random()*this.lines.length);
      this.showLines(i)
    },
    // 显示台词
    showLines(i){
      if(this.isShowMessageBox) return;
      this.isShowMessageBox = true;
      this.linesIndex = i;
      
      this.linesTimer = setTimeout(()=>{
        this.isShowMessageBox = false;
      },6000)
    }
  },
  mounted () {
    // 初始化live2d模型
    this.initBanNiang()
    let i = Math.random()<0.5?1:0
    this.showLines(i)
  },
}
</script>

<style lang="stylus" scoped>
  .banniang-container
    position fixed
    left 30px
    bottom 0
    width 150px
    height 230px
    z-index 999
    .message-box
      position absolute
      left 145px
      top 20px
      padding 10px
      min-height 60px
      max-height 210px
      width 165px
      border-radius 8px
      background-color lighten($accentColor, 50%)
      color $textColor
      font-size 14px
      font-weight normal
      user-select none
      z-index 199
    .message-box::before
      content ""
      width 16px
      height 16px
      background-color lighten($accentColor, 50%)
      position absolute
      left -8px
      top 30px
      transform rotateZ(45deg)
      z-index 99
</style>
