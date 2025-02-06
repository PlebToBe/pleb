// stars.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Función auxiliar para generar una velocidad aleatoria en 3D (con mayor dispersión)
function randomVelocity(scale) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.sin(phi) * Math.sin(theta);
  const z = Math.cos(phi);
  const magnitude = scale * (0.5 + Math.random());
  return new THREE.Vector3(x, y, z).multiplyScalar(magnitude);
}

export function createStarBackground() {
  // -------------------------
  // Escena, cámara y renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xff0000, 100, 1500);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2500
  );
  camera.position.z = 500;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);

  // -------------------------
  // OrbitControls: ahora sin restricciones, se permite zoom, pan y rotación libre
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableZoom = true;
  controls.enablePan = true;
  // Ahora se permite la rotación vertical libre
  // (No se fijan minPolarAngle ni maxPolarAngle)

  // -------------------------
  // Suelo
  const groundGeometry = new THREE.PlaneGeometry(4000, 4000);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1000;
  ground.receiveShadow = true;
  scene.add(ground);

  // -------------------------
  // Iluminación
  const ambientLight = new THREE.AmbientLight(0x101010, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(200, 500, 300);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.left = -500;
  dirLight.shadow.camera.right = 500;
  dirLight.shadow.camera.top = 500;
  dirLight.shadow.camera.bottom = -500;
  dirLight.shadow.camera.far = 2000;
  scene.add(dirLight);

  const movingLight = new THREE.PointLight(0xff9900, 0.7, 2000);
  movingLight.position.set(-300, 100, 400);
  movingLight.castShadow = true;
  scene.add(movingLight);

  // -------------------------
  // Estrellas de fondo
  const starsGeometry = new THREE.BufferGeometry();
  const starVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2500;
    const y = (Math.random() - 0.5) * 2500;
    const z = -Math.random() * 1000 - 500;
    starVertices.push(x, y, z);
  }
  starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.8,
  });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // -------------------------
  // Cabezas – Usamos el shader original que te gustaba
  const headsGroup = new THREE.Group();
  let rotatingHeads = [];

  const sphereVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const sphereFragmentShader = `
    uniform sampler2D texture1;
    uniform float bumpIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vec4 texColor = texture2D(texture1, vUv);
      float grayscale = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      float bump = (1.0 - grayscale) * bumpIntensity;
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float lighting = dot(vNormal, lightDir);
      vec3 finalColor = texColor.rgb + bump * lighting * 0.5;
      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `;
  const headTextures = [
    new THREE.TextureLoader().load("/star1.png"),
    new THREE.TextureLoader().load("/star2.png"),
    new THREE.TextureLoader().load("/star3.png"),
    new THREE.TextureLoader().load("/star4.png"),
    new THREE.TextureLoader().load("/star5.png"),
  ];

  function createHead(position, texture) {
    const uniforms = {
      texture1: { value: texture },
      bumpIntensity: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: sphereVertexShader,
      fragmentShader: sphereFragmentShader,
    });
    const geometry = new THREE.SphereGeometry(20, 8, 8);
    const head = new THREE.Mesh(geometry, material);
    head.position.copy(position);
    head.receiveShadow = true;
    head.userData.exploding = false;
    head.userData.basePosition = position.clone();
    head.userData.oscillation = Math.random() * Math.PI * 2;
    return head;
  }

  // Crear 100 cabezas distribuidas aleatoriamente
  for (let i = 0; i < 100; i++) {
    const texture = headTextures[Math.floor(Math.random() * headTextures.length)];
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 1000
    );
    const head = createHead(pos, texture);
    const rotationSpeed = {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
    };
    rotatingHeads.push({ mesh: head, rotationSpeed: rotationSpeed });
    headsGroup.add(head);
  }
  scene.add(headsGroup);

  // -------------------------
  // Planetas de lava
  const planets = [];
  const lavaUniforms = {
    time: { value: 0 },
    texture1: { value: new THREE.TextureLoader().load("/lava.jpg") },
  };
  const lavaVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const lavaFragmentShader = `
    uniform float time;
    uniform sampler2D texture1;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float noise = sin(time * 5.0 + uv.x * 10.0) * 0.05;
      uv += noise;
      vec4 lavaColor = texture2D(texture1, uv);
      float gradient = smoothstep(0.3, 0.7, vUv.y);
      lavaColor.rgb = mix(lavaColor.rgb, vec3(0.1, 0.0, 0.0), gradient);
      gl_FragColor = vec4(lavaColor.rgb, 1.0);
    }
  `;
  for (let i = 0; i < 4; i++) {
    const planetGeometry = new THREE.SphereGeometry(150, 32, 32);
    const planetMaterial = new THREE.ShaderMaterial({
      uniforms: lavaUniforms,
      vertexShader: lavaVertexShader,
      fragmentShader: lavaFragmentShader,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    let x = (Math.random() - 0.5) * 2000;
    let y = (Math.random() - 0.5) * 1500;
    if (Math.abs(x) < 500 && Math.abs(y) < 300) {
      x += x > 0 ? 500 : -500;
      y += y > 0 ? 300 : -300;
    }
    planet.position.set(x, y, -Math.random() * 2500);
    planet.castShadow = true;
    planet.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
    planets.push(planet);
    scene.add(planet);
  }

  // -------------------------
  // Estrellas fugaces
  const shootingStars = [];
  const shootingStarTexture = new THREE.TextureLoader().load("/starfast.png");
  function addShootingStar() {
    const starGeometry = new THREE.PlaneGeometry(30, 10);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: shootingStarTexture,
      transparent: true,
      opacity: 0.8,
    });
    const shootingStar = new THREE.Mesh(starGeometry, starMaterial);
    const startX = Math.random() > 0.5 ? -1500 : 1500;
    const startY = Math.random() * 1000 - 500;
    shootingStar.position.set(startX, startY, -Math.random() * 1500 - 400);
    shootingStar.userData = {
      angle: Math.random() * Math.PI / 6 - Math.PI / 12,
      speed: Math.random() * 5 + 2,
    };
    scene.add(shootingStar);
    shootingStars.push(shootingStar);
  }
  setInterval(() => {
    if (shootingStars.length < 5) addShootingStar();
  }, 800);
  function updateShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const star = shootingStars[i];
      star.position.x += star.userData.speed * Math.cos(star.userData.angle);
      star.position.y += star.userData.speed * Math.sin(star.userData.angle);
      star.rotation.z = star.userData.angle;
      if (
        star.position.x < -1500 ||
        star.position.x > 1500 ||
        star.position.y < -1000 ||
        star.position.y > 1000
      ) {
        scene.remove(star);
        shootingStars.splice(i, 1);
      }
    }
  }

  // -------------------------
  // Explosión y reensamblaje
  let explosions = [];
  let reassemblies = [];
  // Asegúrate de que "/starfast.png" sea un sprite circular y luminoso
  const particleTexture = new THREE.TextureLoader().load("/starfast.png");

  // Explosión: la cabeza se desintegra en 300 partículas con trayectorias aleatorias
  function triggerExplosion(head) {
    if (head.userData.exploding) return;
    head.userData.exploding = true;
    const explosionCenter = head.position.clone();
    // Flash de luz para resaltar la explosión
    const flashLight = new THREE.PointLight(0xffeeaa, 10, 300);
    flashLight.position.copy(explosionCenter);
    scene.add(flashLight);
    setTimeout(() => scene.remove(flashLight), 300);
    
    headsGroup.remove(head);
    rotatingHeads = rotatingHeads.filter(item => item.mesh !== head);

    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = explosionCenter.x;
      positions[i * 3 + 1] = explosionCenter.y;
      positions[i * 3 + 2] = explosionCenter.z;
      velocities.push(randomVelocity(200));
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      map: particleTexture,
      size: 2,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    explosions.push({
      particles: particles,
      velocities: velocities,
      elapsed: 0,
      duration: 2.5,
      center: explosionCenter
    });

    // Iniciar reensamblaje tras 4 segundos: la nueva cabeza aparecerá escalando con easing "in bounce"
    setTimeout(() => {
      triggerReassembly(explosionCenter, head.material.uniforms.texture1.value);
      scene.remove(particles);
    }, 4000);
  }

  // Reensamblaje: la nueva cabeza aparece escalando desde 0 a 1 con easing "in bounce"
  function triggerReassembly(center, texture) {
    const newHead = createHead(center, texture);
    newHead.scale.set(0, 0, 0);
    headsGroup.add(newHead);
    const rotationSpeed = {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
    };
    reassemblies.push({ head: newHead, elapsed: 0, duration: 1, rotationSpeed: rotationSpeed });
  }

  // Función de easing easeOutBounce
  function easeOutBounce(t) {
    if (t < 1/2.75) {
      return 7.5625 * t * t;
    } else if (t < 2/2.75) {
      t = t - (1.5/2.75);
      return 7.5625 * t * t + 0.75;
    } else if (t < 2.5/2.75) {
      t = t - (2.25/2.75);
      return 7.5625 * t * t + 0.9375;
    } else {
      t = t - (2.625/2.75);
      return 7.5625 * t * t + 0.984375;
    }
  }
  
  // Definición de easeInBounce usando easeOutBounce
  function easeInBounce(t) {
    return 1 - easeOutBounce(1 - t);
  }

  // Actualiza la animación de explosiones
  function updateExplosions(delta) {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.elapsed += delta;
      const positions = exp.particles.geometry.attributes.position.array;
      for (let j = 0; j < exp.velocities.length; j++) {
        positions[j * 3] += exp.velocities[j].x * delta;
        positions[j * 3 + 1] += exp.velocities[j].y * delta;
        positions[j * 3 + 2] += exp.velocities[j].z * delta;
      }
      exp.particles.geometry.attributes.position.needsUpdate = true;
      exp.particles.material.opacity = Math.max(1 - exp.elapsed / exp.duration, 0);
      if (exp.elapsed > exp.duration) {
        scene.remove(exp.particles);
        explosions.splice(i, 1);
      }
    }
  }

  // Actualiza la animación de reensamblaje: la nueva cabeza aparece escalando con easing in bounce
  function updateReassemblies(delta) {
    for (let i = reassemblies.length - 1; i >= 0; i--) {
      const reassembly = reassemblies[i];
      reassembly.elapsed += delta;
      const t = Math.min(reassembly.elapsed / reassembly.duration, 1);
      const scale = easeInBounce(t);
      reassembly.head.scale.set(scale, scale, scale);
      if (t >= 1) {
        rotatingHeads.push({ mesh: reassembly.head, rotationSpeed: reassembly.rotationSpeed });
        reassemblies.splice(i, 1);
      }
    }
  }

  // -------------------------
  // Raycaster para disparar la explosión
  const raycaster = new THREE.Raycaster();
  const mouseVector = new THREE.Vector2();
  document.addEventListener("mousemove", (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseVector.set(mouseX, mouseY);
    raycaster.setFromCamera(mouseVector, camera);
    const intersects = raycaster.intersectObjects(headsGroup.children);
    intersects.forEach((intersect) => {
      triggerExplosion(intersect.object);
    });
  });

  // -------------------------
  // Bucle de animación
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Actualizar OrbitControls
    controls.update();

    // Actualizar movimiento de las cabezas restantes
    rotatingHeads.forEach((item) => {
      item.mesh.rotation.x += item.rotationSpeed.x;
      item.mesh.rotation.y += item.rotationSpeed.y;
      item.mesh.position.y =
        item.mesh.userData.basePosition.y +
        Math.sin(elapsed + item.mesh.userData.oscillation) * 10;
    });

    updateExplosions(delta);
    updateReassemblies(delta);

    // Rotación de los planetas
    planets.forEach((planet) => {
      planet.rotation.y += planet.userData.rotationSpeed;
    });

    updateShootingStars();

    // Movimiento de las luces
    movingLight.position.x = 200 * Math.sin(elapsed * 0.1);
    movingLight.position.z = 300 + 100 * Math.cos(elapsed * 0.1);
    dirLight.position.x = 200 + 50 * Math.sin(elapsed * 0.05);
    dirLight.position.z = 300 + 50 * Math.cos(elapsed * 0.05);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}