// set up the environment - 
let clock = null;
let cloneScene;
let cM;
let raycaster; let arrow;
let p = new THREE.Vector3(0, -1, 0);
// initiallize scene, camera, objects and renderer
let init = function() {
    // 1. create the scene
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xababab);
    clock = new THREE.Clock();
    // 2. create an locate the camera
    camera = new THREE.PerspectiveCamera(75,
                    window.innerWidth / window.innerHeight,
                    0.01, 1000);
    camera.position.set(3, 1, 2.5);
    camera.rotation.set(-0.5, 0.4, 0.2);

    // 3. create and locate the objects on the scene
    for (const model of Object.values(models)) 
      scene.add(model.gltf.scene);
    
    models.knight.gltf.scene.scale.set(1/8,1/8,1/8);
    models.knight.gltf.scene.position.set(14, 0, -20);
    models.knight.box = new THREE.Box3().setFromObject(models.knight.gltf.scene);
    
    models.skeleton.box = new THREE.Box3().setFromObject(models.skeleton.gltf.scene);
    models.skeleton.gltf.scene.position.set(14, 0, -15);
    
    models.tower.gltf.scene.position.set(5, 0, -3);
    
    models.valley.gltf.scene.rotation.x = -1.7;
    models.valley.gltf.scene.scale.set(50, 50, 50);
    models.valley.gltf.scene.position.y = 0;

    models.knight.life = 100;
    models.skeleton.life = 200;
    prepModelsAndAnimations();
     
    setBackground(); 
   // createGeometry();
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.x = -10; 
    helperL = new THREE.DirectionalLightHelper( light, 5 );
   

    light.castShadow = true;
    light.shadow.camera =  new THREE.PerspectiveCamera(50, 1, 10, 2500);
    light.shadow.bias = 0.0001;
    light.position.set(10, 20, 0);
    scene.add(light);

    let aLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(aLight);
    
    // 4. create the renderer   
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
   // controls.target = models.knight.gltf.scene.position;
    controls.enablePan = false;
    controls.minDistance = controls.maxDistance = 5;
    controls.mouseButtons.LEFT = 2;
    controls.mouseButtons.RIGHT = 0;
    //controls.maxPolarAngle = 1.5;
   
    document.body.appendChild(renderer.domElement);

    document.addEventListener("keydown", KnightControls);
    document,addEventListener("keyup", function(event){ if(keycodeMoveTest(event)){if(models.knight.life <= 0){return;} setAnimation(models.knight, "idle")}});
    document.addEventListener("click", knightAtack);
    models.skeleton.gltf.scene.position.y -=0.5;
    raycaster = new THREE.Raycaster();
    
    boxK = new THREE.Box3();
    boxT = new THREE.Box3();
    boxHK = new THREE.BoxHelper( models.knight.gltf.scene, 0xffffff );
    boxHT = new THREE.BoxHelper( models.tower.gltf.scene, 0xffffff );
    mainLoop();
};

// main animation loop - calls every 50-60 ms.
let mainLoop = function() {
  
  if(models.knight.life == 0){
    setAnimation(models.knight, "die");
    models.knight.mixer.update(clock.getDelta());
    document.getElementById("gm").innerHTML = "GAME OVER";
  }else{

  light.position.x = 50 * Math.sin(theta);
  light.position.y = 50 * Math.cos(theta);
  theta += add;
 
  setYpositionK(models.knight);
  
  controls.target = models.knight.gltf.scene.position;
  controls.update();
 // models.tower.gltf.scene.scale.set(1/6,1/6,1/6);
 // cameraOnKnight();
  
 
  setIdleAnimation();
  
  //updateMixers(clock.getDelta());
  models.knight.mixer.update(clock.getDelta());
  models.skeleton.mixer.update(clock.getDelta());
  skeletonUpdate();
  //console.log(models.knight.box.isIntersectionBox(models.skeleton.box));
  }
  renderer.render(scene, camera);
 // setAnimation(models.knight, "idle");
 // stats.update();
  
  requestAnimationFrame(mainLoop);
};

const manager = new THREE.LoadingManager();
manager.onLoad = init;
const models = {
  tower:      { url: "src/Tower.glb", animated: false, },
  valley:     { url: "src/valley.glb", animated: false },
  skeleton:   { url: "src/skeleton.glb", animated: true, action: {}},
  knight:     { url: "src/knight.glb", animated: true, action: {}}
};
{
  const gltfLoader = new THREE.GLTFLoader(manager);
  for (const model of Object.values(models)) {
    gltfLoader.load(model.url, (gltf) => {
      model.gltf = gltf;
    });
  }
}

function updateMixers(dT){
  models.knight.mixer.update(dT);
  models.skeleton.mixer.update(dT);
}

function colisionTower(){
  boxK.setFromObject(models.knight.gltf.scene);
  boxT.setFromObject(models.tower.gltf.scene);
  return boxK.intersectsBox(boxT);
}

function showHelpers(){
  if(!h){
    scene.remove(boxHK);
    scene.remove(helperL);
    scene.remove(boxHT);
    return;}
    boxHK.setFromObject(models.knight.gltf.scene);
    scene.add(boxHK);
    scene.add(helperL);
    scene.add(boxHT);  
}