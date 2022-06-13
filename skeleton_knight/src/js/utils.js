let scene, camera, renderer;
let plane, light, sphere;
let add = 0.005;
let theta = 0;
let controls;
let texture;
let d = new THREE.Vector3();
let sD = new THREE.Vector3();
let distK, boxK, boxT;
let y = 0;
let h = false;
let boxHK, boxHT, helperL;

function randomInRange(from, to){
    let x = Math.random() * (to - from);
    return x + from;
}

function keycodeMoveTest(event){
    let W = 87;
    let S = 83;
    let A = 65;
    let D = 68;
    let keyCode = event.which;

    if(keyCode == W | keyCode == S | keyCode == A | keyCode == D)
        return true;

    return false;
}