/**
 * @title Animation Play
 * @category Animation
 */
import {
  Animator, Camera, DirectLight, MeshRenderer, AssetType,BackgroundMode,PrimitiveMesh, RenderFace, SystemInfo, Vector3, WebGLEngine, Script
} from "oasis-engine";
import { OrbitControl } from "@oasis-engine-toolkit/controls";
let curObj = {};
export async function init (obj) {
  const engine = new WebGLEngine("canvas");
  engine.canvas.width = window.innerWidth * SystemInfo.devicePixelRatio;
  engine.canvas.height = window.innerHeight * SystemInfo.devicePixelRatio;
  engine.canvas.resizeByClientSize();
  const scene = engine.sceneManager.activeScene;
  const { background } = scene;
  const rootEntity = scene.createRootEntity();
  const cameraEntity = rootEntity.createChild("camera_node");
  // 镜头居中
  cameraEntity.transform.setPosition(0, 5, -6);
  // cameraEntity.transform.setPosition(-20, 5, -6);
  cameraEntity.addComponent(Camera);
  const cameraControl = cameraEntity.addComponent(OrbitControl);
  cameraControl.target = new Vector3(0, 0, 5);
  // 控制镜头不旋转
  cameraControl.enableRotate = false;
  cameraControl.enablePan = false;
  const directLightNode = rootEntity.createChild("dir_light");
  const directLightNode2 = rootEntity.createChild("dir_light2");
  directLightNode.addComponent(DirectLight);
  directLightNode2.addComponent(DirectLight);
  directLightNode.transform.setRotation(30, 0, 0);
  directLightNode2.transform.setRotation(-30, 180, 0);
  // 背景图
  const backgroundImg = await engine.resourceManager.load('https://simple-1259493930.cos.ap-shanghai.myqcloud.com/simple-1259493930/06b41cd6656ec8c12af0420427139fe32319371d5cb98c57f332ade74b60c72f.png');
  background.sky.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2); // 设置天空盒网格
  background.texture = backgroundImg;
  background.mode = BackgroundMode.Texture;
  background.textureFillMode = 2; // 0 宽度填充 1 高度填充
  // 人物
  const peopleGltf = await engine.resourceManager.load('https://simple-1259493930.cos.ap-shanghai.myqcloud.com/simple-1259493930/3951422e4494c40a75ca228c737cae825e2a05a6364a4d5a059753f0ec28b83f.gltf');
  const { animations, defaultSceneRoot } = peopleGltf;
  rootEntity.addChild(defaultSceneRoot);
  // 保存人物的位置
  obj.peopleEntity = defaultSceneRoot;
  defaultSceneRoot.transform.setPosition(0, -1, 1);
  defaultSceneRoot.transform.setRotation(80, 0, 0);
  defaultSceneRoot.transform.setScale(0.1, 0.1, 0.1);
  const animator = defaultSceneRoot.getComponent(Animator);
  const animationNames = animations.filter((clip) => !clip.name.includes("pose")).map((clip) => clip.name);
  obj.animator = animator;
  obj.animationNames = animationNames;
  // animator.speed = 0;
  // animator.play(animationNames[1]);
  // 金币
  const coinGltf = await engine.resourceManager.load('https://testoss.zjairports.com/h5/static/images/coinLight/scene.gltf');
  const coinEntity = coinGltf.defaultSceneRoot;
  coinEntity.transform.setRotation(-90, 27, 0);
  coinEntity.transform.setPosition(1.3, -1.5, 18);
  obj.coinEntity = coinEntity.clone();
  // 雪糕筒
  const obstacleGltf = await engine.resourceManager.load('https://testoss.zjairports.com/h5/static/images/3D/roadObstacle/low_poly_traffic_cone/scene.gltf');
  const obstacle = obstacleGltf.defaultSceneRoot;
  obstacle.transform.setScale(0.4, 0.4, 0.4);
  obstacle.transform.setPosition(0, -1.8, 18);
  obstacle.transform.setRotation(-60, 0, 0);
  obj.obstacleEntity = obstacle.clone();
  // 桥
  const bridgeGltf = await engine.resourceManager.load('https://simple-1259493930.cos.ap-shanghai.myqcloud.com/simple-1259493930/adab5f593ab68fc1605200c06eff6ce9d5d0c25309f4a562fae9268cb27dc7cf.gltf');
  const bridgeEntity = bridgeGltf.defaultSceneRoot;
  rootEntity.addChild(bridgeEntity);
  bridgeEntity.transform.setPosition(0, -9, 12);
  bridgeEntity.transform.setRotation(12, 0, 0);
  rootEntity.addComponent(CoinAnimation);
    // 更改桥面贴图 
    const texture = await engine.resourceManager
    .load({
      url: "https://simple-1259493930.cos.ap-shanghai.myqcloud.com/simple-1259493930/8e81b6043c9cc4209835068e0fabb22c5316c168f0fc7e0e947f9b6e23e9a453.jpg",
      type: AssetType.Texture2D
    },
    );
  const bridge = bridgeEntity.findByName("polySurface19_2");
  const renderer = bridge.getComponent(MeshRenderer);
  const material = renderer.getMaterial();
  material.renderFace = RenderFace.Double;
  material.baseTexture = texture;
  bridge.material = material;
  obj.bridge = bridge;
  // 初始化道路金币摆放位置
  let vars = {};
  const leftLength = 5
  for (let i = 0; i < leftLength; i++) {
      let leftCoin = `left${i}`;
      vars[leftCoin] = coinEntity.clone();
      if(i===leftLength-1){
        vars[leftCoin].transform.setPosition(1.3, 0, 15);
      }else{
        vars[leftCoin].transform.setPosition(1.3, 0.5 + i / 3, 3 + 3 * i);
      }
      rootEntity.addChild(vars[leftCoin]);
      obj.leftList.push(vars[leftCoin]);
      let initLeftCoin = `initLeft${i}`;
      vars[initLeftCoin] = coinEntity.clone();
      if(i===leftLength-1){
        vars[initLeftCoin].transform.setPosition(1.3, 0, 15);
      }else{
        vars[initLeftCoin].transform.setPosition(1.3, 0.5 + i / 3, 3 + 3 * i);
      }
      vars[initLeftCoin].isActive = false;
      rootEntity.addChild(vars[initLeftCoin]);
      obj.initLeftList.push(vars[initLeftCoin]);
  }
  const lastCoin = coinEntity.clone();
  rootEntity.addChild(lastCoin);
  obj.leftList.push(lastCoin);
  const lastInitCoin = coinEntity.clone();
  lastInitCoin.isActive = false;
  rootEntity.addChild(lastInitCoin);
  obj.initLeftList.push(lastInitCoin);
  // 中间金币位置
  const midLength = 5
  for (let i = 0; i < midLength; i++) {
  let midCoin = `coin${i}`;
  vars[midCoin] = coinEntity.clone();
  if(i===midLength-1){
    vars[midCoin].transform.setPosition(0, 0, 15);
  }else{
    vars[midCoin].transform.setPosition(0, 0.5 + i / 3, 3 + 3 * i);
  }
  rootEntity.addChild(vars[midCoin]);
  obj.coinList.push(vars[midCoin]);

  let initMidCoin = `initCoin${i}`;
  vars[initMidCoin] = coinEntity.clone();
  if(i===midLength-1){
    vars[initMidCoin].transform.setPosition(0, 0, 15);
  }else{
    vars[initMidCoin].transform.setPosition(0, 0.5 + i / 3, 3 + 3 * i);
  }
  vars[initMidCoin].isActive = false;
  rootEntity.addChild(vars[initMidCoin]);
  obj.initCoinList.push(vars[initMidCoin]);
  }
  const lastObstacle = obstacle.clone();
  rootEntity.addChild(lastObstacle);
  obj.coinList.push(lastObstacle);
  const lastInitObstacle = obstacle.clone();
  lastInitObstacle.isActive = false;
  rootEntity.addChild(lastInitObstacle);
  obj.initCoinList.push(lastInitObstacle);
  engine.run();
  obj.initEngine = engine;
  obj.rootEntity = rootEntity;
  curObj = obj;
  var el = document.getElementsByTagName("canvas")[0];
  el.addEventListener("touchstart", onTouchStart);
  el.addEventListener("touchmove", onTouchMove);
  el.addEventListener("touchend", onTouchEnd);
}
let isDown = false;
// eslint-disable-next-line no-unused-vars
let isSwipe = false;
let x = 0;
function onTouchStart (e) {
  isDown = true;
  isSwipe = false;
  x = e.targetTouches[0].clientX;
}

function onTouchEnd () {
  isDown = false;
}

function onTouchMove (e) {
  if (!isDown) {
    return;
  }
  let mouseX = e.targetTouches[0].clientX;
  let deltaX = mouseX - x;
  if (deltaX > 20) {
    isDown = false; // 触发了滑动之后终止判断，避免连续滑动
    const { position } = curObj.peopleEntity.transform;
    if (position.x === 0) {
      // 右滑，控制人物往右移动
      position.x = -1.3;
    } else if (position.x === 1.3) {
      position.x = 0;
    }
  } else if (deltaX < -20) {
    isDown = false; // 触发了滑动之后终止判断，避免连续滑动
    const { position } = curObj.peopleEntity.transform;
    if (position.x === 0) {
      // 左滑，控制人物往左移动
      position.x = 1.3;
    } else if (position.x === -1.3) {
      position.x = 0;
    }
  }
}
class CoinAnimation extends Script {
  onUpdate () {
    if (!curObj.runCoinFlag) return;
    const { material } = curObj.bridge;
    // tilingOffset w 代表向后运动
    material.tilingOffset.w += 0.01;
    // 左边金币
    const leftLength = curObj.leftList.length;
    if (leftLength > 0) {
      curObj.leftList.forEach((item) => {
        const peoplePosition = curObj.peopleEntity.transform.position;
        const { position,rotation } = item.transform;
        if (position.z < 1.5 && Math.abs(peoplePosition.x - position.x) <= 0.1) {
          if(item.children[0].name ==='TrafficCone.fbx') {
            curObj.runCoinFlag = false;
            const { animator } = curObj;
            animator.speed = 0;
            curObj.visibleRestart = true;
            return;
          }
          curObj.score += 1;
          item.isActive = false;
          updateLeftCoinList(curObj.leftList, 1.3);
          return;
        }
        if (position.z <= 0) {
          item.isActive = false;
          updateLeftCoinList(curObj.leftList,1.3);
          return;
        }
        position.z -= 0.1;
                  // 雪糕筒不旋转
                  if(item.children[0].name ==='TrafficCone.fbx'){
                    // 桥中间金币位置的z坐标为 12，以中间为基准，大于12的 桶 需要向上移动，并调整角度
                    if(position.z<12){
                      position.y< -0.1 && (position.y+=0.3);
                    } else {
                      // 过桥之后降低 桶 向上移动的速度
                      position.y+=0.03;
                      rotation.x !== -90 && (rotation.x -= 0.5);
                    }
                  } else {
                    rotation.y += 1;
                    position.y<1.5 && (position.y+=0.05);
                  }
        
      })
    } else {
      curObj.runCoinFlag = false;
    }
    // 中间金币
    const initLength = curObj.coinList.length;
    if (initLength > 0) {
      curObj.coinList.forEach((item) => {
        const peoplePosition = curObj.peopleEntity.transform.position;
        const { position,rotation } = item.transform;
        if (position.z < 1.5 && Math.abs(peoplePosition.x - position.x) <= 0.1) {
          if(item.children[0].name ==='TrafficCone.fbx') {
            curObj.runCoinFlag = false;
            const { animator } = curObj;
            animator.speed = 0;
            curObj.visibleRestart = true;
            return;
          }
          curObj.score += 1;
          item.isActive = false;
          updateCoinList(curObj.coinList, 0);
          return;
        }
        if (position.z <= 0) {
          item.isActive = false;
          updateCoinList(curObj.coinList, 0);
          return;
        }
        // z 代表移动的速度
        position.z -= 0.1;
          // 雪糕筒不旋转
          if(item.children[0].name ==='TrafficCone.fbx'){
            // 桥中间金币位置的z坐标为 12，以中间为基准，大于12的 桶 需要向上移动，并调整角度
            if(position.z<12){
              position.y< -0.1 && (position.y+=0.3);
            } else {
              // 过桥之后降低 桶 向上移动的速度
              position.y+=0.03;
              rotation.x !== -90 && (rotation.x -= 0.5);
            }
          } else {
            rotation.y += 1;
            position.y<1.5 && (position.y+=0.05);
          }
      })
    } else {
      curObj.runCoinFlag = false;
    }
  }
}
/**
 * 金币消失后产生新的金币--中间
 * @param {*} list 
 * @param {*} length 
 */
function updateCoinList (list, positionX) {
  const headerCoin = list.shift();
  curObj.rootEntity.removeChild(headerCoin);
  const sliceCoin =Math.round(Math.random()*20)!==7 ?curObj.coinEntity.clone():curObj.obstacleEntity.clone();
  // const sliceCoin =curObj.coinEntity.clone();
  curObj.rootEntity.addChild(sliceCoin);
  sliceCoin.isActive = true;
  if(sliceCoin.children[0].name ==='TrafficCone.fbx'){
    // sliceCoin.isActive = false;
    sliceCoin.transform.setPosition(positionX, -1.8, 18);
    sliceCoin.transform.setRotation(-60, 0, 0);
    // return;
  } else {
    sliceCoin.transform.setPosition(positionX, -1.5, 18);
  }
  list.push(sliceCoin);
}

/**
 * 金币消失后产生新的金币--左边
 * @param {*} list 
 * @param {*} length 
 */
function updateLeftCoinList (list, positionX) {
  const sliceCoin = list.shift();
  sliceCoin.isActive = true;
  // if(sliceCoin.children[0].name ==='TrafficCone.fbx'){
  //   sliceCoin.transform.setPosition(positionX, -0.6, 2 + paramZ * (length - 1));
  //   sliceCoin.transform.setRotation(-60, 0, 0);
  // } else {
    sliceCoin.transform.setPosition(positionX, -1.5, 18);
  // }
  list.push(sliceCoin);
}