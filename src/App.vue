<template>
  <div id="app">
    <div class="tip">
      <button @click="setCoinRun">开始</button>
      <button @click="reset">重置</button>
      <button>得分{{ obj.score }}</button>
      <button @click="leftMove">左边</button>
      <button @click="rightMove">右边</button>
    </div>
    <img
      src="../src/assets/restart.png"
      class="restart-img"
      @click="restart"
      v-show="obj.visibleRestart"
    />
    <canvas id="canvas" style="width: 100%; height: 100%"></canvas>
  </div>
</template>

<script>
import { init } from './oasis/index.js'
export default {
  name: 'App',
  components: {
  },
  data: function () {
    return {
      obj: {
        initEngine: null,
        rootEntity: null,
        score: 0,
        runCoinFlag: false,
        visibleRestart: false,
        coinList: [],
        initCoinList: [], // 初始化金币池
        coinPositionY: [],
        leftList: [],
        initLeftList: [], // 初始化左边金币池
        peopleEntity: {},
        bridge: {},
        animator: {},
        animationNames: [],
        obstacleEntity: null,
        pool: []
      },
    };
  },
  methods: {
    reset () {
      this.obj.score = 0;
      this.obj.runCoinFlag = false;
      const { initCoinList, initLeftList, peopleEntity, rootEntity } = this.obj;
      // 重置中间金币
      this.resetList(this.obj.coinList, initCoinList, rootEntity);
      // 重置左边金币
      this.resetList(this.obj.leftList, initLeftList, rootEntity);
      // 重置人物的位置在道路中间
      peopleEntity.transform.setPosition(0, 0, 1);
    },
    resetList (currentList, initList, rootEntity) {
      while (currentList.length) {
        const headerCoin = currentList.shift();
        rootEntity.removeChild(headerCoin);
      }
      initList.forEach((current) => {
        const item = current.clone();
        item.isActive = true;
        rootEntity.addChild(item);
        currentList.push(item);
      });
    },
    restart () {
      this.obj.visibleRestart = false;
      this.reset();
      // this.setCoinRun();
    },
    setCoinRun () {
      // 跑步之前 调整一下人物的角度
      this.obj.peopleEntity.transform.setRotation(50, 0, 0);
      this.obj.runCoinFlag = true;
      const { animator, animationNames } = this.obj;
      animator.play(animationNames[1]);
      animator.speed = 1.7;
    },
    leftMove () {
      const { position } = this.obj.peopleEntity.transform;

      if (position.x === 1.3) return;
      position.x += 1.3;
    },
    rightMove () {
      const { position } = this.obj.peopleEntity.transform;
      if (position.x === -1.3) return;
      this.obj.peopleEntity.transform.position.x -= 1.3;
    }
  },
  mounted () {
    init(this.obj);
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  text-align: center;
}
.tip {
  position: absolute;
  top: 0;
  left: 0;
}
.restart-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
