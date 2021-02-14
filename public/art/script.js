let container, stats;
let camera, scene, renderer, controls, heartGeometry, composer;
let hearts = [];

// options
let opts;


const MAX_ROTATIONS = 5;
const CLIP_LENGTH = 20;
const FPS = 30;


// Makes the lambert material behave like basic (ignores lighting), but with shadows.
THREE.ShaderLib['lambert'].fragmentShader = THREE.ShaderLib['lambert'].fragmentShader.replace(
    `vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;`,

    `#ifndef CUSTOM
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
    #else
        vec3 outgoingLight = diffuseColor.rgb * ( 1.0 - 0.1 * ( 1.0 - getShadowMask() ) ); // shadow intensity hardwired to 0.5 here
    #endif`
);


// micro random generator
let seedA;
function initRnd(seed) {
  seedA = seed;
}
function rnd() {
  seedA ^= seedA << 13;
  seedA ^= seedA >> 17;
  seedA ^= seedA << 5;

  return (((seedA < 0) ? ~seedA + 1 : seedA) % 1000) / 1000;
}

function init(_opts) {
  opts = _opts;

  initRnd(opts.seed);

  const bloom = rnd();
  const isMatte = rnd() < 0.4;
  const isThin = rnd() < 0.30;
  const isRough = rnd() < 0.15;
  const isWhite = (rnd() < 0.15) && !bloom;
  const fixedRotation = rnd() < 0.08 ? {
    x: rnd(),
    y: rnd(),
    z: rnd()
  } : null;

  let tokens = opts.tokens;

  container = document.createElement('div');
  container.id = "scene";
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, 1, 1, 300);
  camera.position.set(0, 0, 220);
  scene.add(camera);

  // controls = new THREE.OrbitControls(camera, container);
  // controls.target.set(0, 0, 0);
  // controls.update();

  // const axesHelper = new THREE.AxesHelper( 100 );
  // scene.add( axesHelper );

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffaaaa, 0.8);
  dirLight.castShadow = true;
  dirLight.position.set(10, 100, 100);
  dirLight.shadow.camera.left = -100;
  dirLight.shadow.camera.right = 100;
  dirLight.shadow.camera.top = 100;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.mapSize.width = 2024;
  dirLight.shadow.mapSize.height = 2024;
  scene.add(dirLight);

  // var helper = new THREE.DirectionalLightHelper( light, 5 );
  // scene.add(helper);
  // light.target.position.set(10, 0, -0)
  // scene.add( light.target );
  // const helper = new THREE.CameraHelper( light.shadow.camera );
  // scene.add( helper );

  // Backplane
  const texture = new THREE.Texture(generateTexture());
  texture.needsUpdate = true
  // Setting CUSTOM uses our version of the shader which does not react to light.
  const material = new THREE.MeshLambertMaterial({map: texture});
  material.defines = material.defines || {};
  material.defines.CUSTOM = "";

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(255, 255), material);
  mesh.position.z = -10 - (40 / tokens.length);
  mesh.receiveShadow = true;
  scene.add(mesh);

  heartGeometry = createHeart(isThin, isRough);


  let len = tokens.length;
  let useCircle = rnd() < 0.5;
  let shift45Degrees = rnd() < 0.5;
  let itemInCenter = rnd() < 0.7;
  let reverseRowsCols = rnd() < 0.5;

  if (len === 1) {
    useCircle = false;
  }
  else if (len % 2 != 0 || len == 8) {
    // Those do not work will in the grid
    useCircle = true;
  }
  else if (len == 4) {
    // More interesting, because otherwise looks like the grid layout.
    shift45Degrees = false;
  }
  if (len < 6) {
    itemInCenter = false;
  } else if (len == 9) {
    itemInCenter = true;
  }

  function add(token, x, y, scale) {
    const color = !token ? (isWhite ? '#fcfcfc' :'#3e3e3e') : '#ff0022';
    addShape(
        color, isMatte,
        x, y, 15,
        0, 0, Math.PI,
        scale,
        fixedRotation
    );
  }

  if (useCircle) {
    let scale = 0.15 + 0.38 / tokens.length;
    if (isRough) {
      scale = scale * 1.25;
    }

    let angledNum = tokens.length;
    if (itemInCenter) {
      add(tokens[tokens.length-1], 0, 0, scale);
      angledNum -= 1;
    }

    for (let i = 0; i < angledNum; i++) {
      const r = 45 + 2.6*angledNum;
      let a = (i/angledNum) * Math.PI*2;
      if (shift45Degrees) {
        a = a + Math.PI/4;
      }
      const x = 0 + r * Math.cos(a)
      const y = 0 + r * Math.sin(a)



      add(tokens[i], x, y, scale)
    }
  }
  else {
    let height = 220;
    let width = 220;
    let padding = 30;
    const numRows = Math.ceil(Math.sqrt(tokens.length));
    const perRow = Math.floor(Math.sqrt(tokens.length));

    let colHeight = (height - padding*2) / numRows;
    let idx = 0;
    for (let y = 0; y < numRows; y++) {
      // randomize this
      let loneRow = false ? 0 : numRows-1;
      let numCols = (y === loneRow && perRow !== numRows) ? tokens.length - (perRow ** 2) : perRow;
      let colWidth = (width - padding*2) / numCols;

      for (let x = 0; x < numCols; x++) {
        let cX = x * colWidth + colWidth / 2 - (width / 2) + padding;
        let cY = y * colHeight + colHeight / 2 - (height / 2) + padding;

        let scale = 0.6 / numRows;
        if (isRough) {
          scale = scale * 1.25;
        }

        if (reverseRowsCols) {
          const _ = cX;
          cX = cY;
          cY = _;
        }

        add(tokens[idx], cX, cY, scale)
        idx++;
      }
    }
  }


  // Render
  renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(opts.size || window.innerWidth, opts.size || window.innerWidth);
  container.appendChild(renderer.domElement);

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  if (bloom < 0.06) {
    // strength, radius, threshold
    bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( 100, 100 ))
    if (bloom < 0.03) {
      bloomPass.threshold = 0.1
      bloomPass.strength = 1.15
      bloomPass.radius = 0.85
    } else {
      bloomPass.threshold = 0.29
      bloomPass.strength = 0.4
      bloomPass.radius = 0.1
    }
    bloomPass.renderToScreen = true
    composer.addPass(bloomPass);
  }
}

function addShape(color, isMatte, x, y, z, rx, ry, rz, s, fixedRotation) {
  let material;
  if (isMatte) {
    material = new THREE.MeshPhongMaterial({ color });
  }
  else {
    material = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0,
      clearcoat: 1
    });
  }
  const mesh = new THREE.Mesh(heartGeometry, material);

  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.scale.set(s, s, s);
  mesh.castShadow = true;

  const rotation = fixedRotation ? fixedRotation : {
    x: rnd(),
    y: rnd(),
    z: rnd()
  }
  hearts.push({shape: mesh, ...rotation});
  scene.add(mesh);
}

// Create a heart shape
function createHeart(isThin, isRough) {
  const x = -25, y = -250;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x + 25, y + 25);
  heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
  heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
  heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
  heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
  heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
  heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

  const extrudeSettings = {
    amount: 0,
    steps: 1,
    curveSegments: 49,
    bevelEnabled: true,
    bevelSegments: 99,
    bevelSize: isRough ? 5 : 30,
    bevelThickness: isThin ? 10 : 30,
    bevelOffset: 0
  };
  geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  geometry.center();
  return geometry;
}

function generateTexture() {
  const size = 512;
  canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  context.rect(0, 0, size, size);
  var gradient = context.createRadialGradient(size / 2, size / 2, 5, size / 2, size / 2, size);
  gradient.addColorStop(0, '#e24146');
  gradient.addColorStop(1, '#7c000a');
  context.fillStyle = gradient;
  context.fill();
  return canvas;
}


function setPosition(frame) {
  // `Math.ceil(el.x * MAX_ROTATIONS)` is the actual number of rotations within CLIP_LENGTH
  const percent = frame / (CLIP_LENGTH * FPS);
  hearts.forEach(el => {
    el.shape.rotation.x = Math.ceil(el.x * MAX_ROTATIONS) * (2 * Math.PI) * percent;
    el.shape.rotation.y = Math.ceil(el.y * MAX_ROTATIONS) * (2 * Math.PI) * percent;
    el.shape.rotation.z = Math.ceil(el.z * MAX_ROTATIONS) * (2 * Math.PI) * percent;
  });
}

function render() {
  // We cannot support deltaTime with our manual frame seek mechanism
  composer.render();
}

function loop(play) {
  function again(now) {
    if (play) {
      setPosition((now / 1000) % CLIP_LENGTH * FPS)
    }
    render();
    requestAnimationFrame(again);
  }
  requestAnimationFrame(again);
}
