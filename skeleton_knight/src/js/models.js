function setBackground(){
    texture = new THREE.CubeTextureLoader().load([
        "src/back/posx.jpg",
        "src/back/negx.jpg",
        "src/back/posy.jpg",
        "src/back/negy.jpg",
        "src/back/posz.jpg",
        "src/back/negz.jpg",
      ]);
    scene.background = texture;
}

//set animationAction for knight and skeleton
function animationsAction(model){
  if(model.url == "src/knight.glb"){
   // let speed = 1;
   
    model.action.atack = model.mixer.clipAction(model.gltf.animations[0]);
    model.action.atack.setLoop(THREE.LoopOnce);
    model.action.atack.clampWhenFinished = true;

    model.action.damaged = model.mixer.clipAction(model.gltf.animations[1]);
    model.action.damaged.setLoop(THREE.LoopOnce);
    
    model.action.die = model.mixer.clipAction(model.gltf.animations[2]);
    model.action.die.setLoop(THREE.LoopOnce);
    model.action.die.clampWhenFinished = true;

    model.action.idle = model.mixer.clipAction(model.gltf.animations[3]);
  
    model.action.walk = model.mixer.clipAction(model.gltf.animations[4]);
    model.action.walk.timeScale = 2;

    model.action.actual = model.action.idle;
    model.action.actual.play();
  }

  if(model.url == "src/skeleton.glb"){
    model.action.atack = model.mixer.clipAction(model.gltf.animations[0]);
    model.action.atack.setLoop(THREE.LoopOnce);
    model.action.atack.clampWhenFinished = true;
    model.action.atack.timeScale = 500;

    model.action.death = model.mixer.clipAction(model.gltf.animations[1]);
    model.action.death.setLoop(THREE.LoopOnce);
    model.action.death.clampWhenFinished = true;
    model.action.death.timeScale = 500;

    model.action.hit = model.mixer.clipAction(model.gltf.animations[2]);
    model.action.hit.timeScale = 500;

    model.action.idle = model.mixer.clipAction(model.gltf.animations[4]);
    model.action.idle.timeScale = 500;

    model.action.resu = model.mixer.clipAction(model.gltf.animations[5]);
    model.action.resu.setLoop(THREE.LoopOnce);
    model.action.resu.clampWhenFinished = true;
    model.action.resu.timeScale = 500;

    model.action.run = model.mixer.clipAction(model.gltf.animations[6]);
    model.action.run.timeScale = 500;

    model.action.actual = model.action.idle;
    model.action.actual.play();
  }
    
}

//Set the animation mixers for models
function prepModelsAndAnimations() {
 // cloneScene = THREE.SkeletonUtils.clone(models.skeleton.gltf.scene );
//  cM = cloneScene.getObjectByName( "Armature" );
 
  for (const model of Object.values(models)) {
    
    if(model.animated){
      model.mixer = new THREE.AnimationMixer(model.gltf.scene);
      animationsAction(model);
    }
  }
}

//Set an active animation
function setAnimation(model, clipName){
  if(model.action.actual == model.action[clipName])
    return;
  model.action.actual.stop();
  model.action.actual = model.action[clipName];
  model.action.actual.play();
}

//Control the character
function KnightControls(event){ 
  if(models.knight.life <= 0)
    return;

  let keyCode = event.which;
  models.knight.gltf.scene.getWorldDirection(d);
  d.divideScalar(clock.getDelta()*2500);
  
  let W = 87;
  let S = 83;
  let A = 65;
  let D = 68;
  let H = 72;
  if(colisionTower())
    d.set(0, 0, 0);

  if (keyCode == W) 
    {models.knight.gltf.scene.position.add(d); setAnimation(models.knight, "walk");}
  else if (keyCode == S) 
    {models.knight.gltf.scene.position.sub(d); setAnimation(models.knight, "walk");}
  else if (keyCode == A) 
    {models.knight.gltf.scene.rotation.y += clock.getDelta()*600; setAnimation(models.knight, "walk"); }
  else if (keyCode == D) 
    {models.knight.gltf.scene.rotation.y -= clock.getDelta()*600; setAnimation(models.knight, "walk");}
  else if (keyCode == H)
   { h = !h; showHelpers();}

}
//Set Camera position on player character
function cameraOnKnight(){
  camera.position.x = models.knight.gltf.scene.position.x;
  camera.position.y = models.knight.gltf.scene.position.y + 5;
  camera.position.z = models.knight.gltf.scene.position.z + 10;
  //camera.lookAt(models.knight.gltf.scene.position);
 // controls.update();
}

//Knight atack animation
function knightAtack(event){
  if(models.knight.life <= 0)
    return;
  buttonClick = event.which;
  if(buttonClick == 1)
    setAnimation(models.knight, "atack");
}

//Set idle animation for knight
function setIdleAnimation(){

  if(models.knight.action.atack == models.knight.action.actual && models.knight.action.atack.paused){
    setAnimation(models.knight, "idle");
    if(distK<=1)
      models.skeleton.life -= 25;
  }
}

//-------------------------------------Skeleton---------------------------------------------------
function skeletonUpdate(){
  distK = models.skeleton.gltf.scene.position.distanceTo(models.knight.gltf.scene.position);
  //Look at knight
  if(models.skeleton.life <= 0){
    setAnimation(models.skeleton, "death");
    document.getElementById("gm").innerHTML = "VICTORY";
    return;
  }
  if(models.skeleton.life == 100){
    if(models.skeleton.action.actual != models.skeleton.action.resu )
      setAnimation(models.skeleton, "death");
    if(models.skeleton.action.actual.paused)
      setAnimation(models.skeleton, "resu");
      if(models.skeleton.action.resu.paused)
        models.skeleton.life = 101;
    }
  else if(models.skeleton.action.actual != models.skeleton.action.death ){
    if(distK > 4){
    models.skeleton.gltf.scene.lookAt(
        models.knight.gltf.scene.position.x,
        models.knight.gltf.scene.position.y,
        models.knight.gltf.scene.position.z);
    }
    //--Walking dead
    if(distK > 1){
      models.skeleton.gltf.scene.getWorldDirection(sD);
      sD.divideScalar(25);
      sD.y = 0;
      models.skeleton.gltf.scene.position.add(sD);
      setAnimation(models.skeleton, "run");
      setYpositionS(models.skeleton);
    }else{
      setAnimation(models.skeleton, "atack");
      if(models.skeleton.action.actual.paused)
        {setAnimation(models.skeleton, "idle"); models.knight.life -= 5; document.getElementById("hpI").innerHTML = "<br>" + models.knight.life;}
    }
  }
}

function setYpositionK(model){

  raycaster.set(model.gltf.scene.position, p);
  raycaster.ray.origin.y-=1;
  let dt = clock.getDelta();
  let col = raycaster.intersectObjects(models.valley.gltf.scene.children);

  if(col[0] == undefined){
    model.gltf.scene.position.y += dt*500;
  }
  else if(col[0].distance > 0.5)
    model.gltf.scene.position.y -= dt*200;
}


function setYpositionS(model){

  raycaster.set(model.gltf.scene.position, p);
  raycaster.ray.origin.y-=1;
  let col = raycaster.intersectObjects(models.valley.gltf.scene.children);

  if(col[0] == undefined){
    model.gltf.scene.position.y += clock.getDelta()*0.8;
  }
  else if(col[0].distance > -0.5)
    model.gltf.scene.position.y -= clock.getDelta()*0.8;
}
