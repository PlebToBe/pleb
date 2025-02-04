import * as THREE from "three";

export function createStarBackground() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog(0xFF0000, 100, 1000);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
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

    const groundGeometry = new THREE.PlaneGeometry(4000, 4000);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1000;
    ground.receiveShadow = true;
    scene.add(ground);

    // 🌠 Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Slightly reduced intensity
    ambientLight.castShadow = true;
    scene.add(ambientLight);

    // 🔥 Background light for depth
    const horizonLight = new THREE.PointLight(0x9966ff, 1.5, 2000);
    horizonLight.position.set(0, -500, -500);
    horizonLight.castShadow = true;
    scene.add(horizonLight);

    // 🌌 Create starry galaxy
    const starsGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2500;
        const y = (Math.random() - 0.5) * 2500;
        const z = -Math.random() * 1000 - 500; // Ensure stars are far in the background
        starVertices.push(x, y, z);
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ⭐ Load face textures
    const headTextures = [
        new THREE.TextureLoader().load("/star1.png"),
        new THREE.TextureLoader().load("/star2.png"),
        new THREE.TextureLoader().load("/star3.png"),
        new THREE.TextureLoader().load("/star4.png"),
        new THREE.TextureLoader().load("/star5.png"),
    ];
    
    const sphereVertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vUv = uv;
            vNormal = normal;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const sphereFragmentShader = `
        uniform sampler2D texture1;
        uniform float bumpIntensity;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

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

    const headsGroup = new THREE.Group();
    const rotatingHeads = [];

    for (let i = 0; i < 200; i++) {
        const headGeometry = new THREE.SphereGeometry(10, 8, 8);
        const randomTexture = headTextures[Math.floor(Math.random() * headTextures.length)];

        const bumpUniforms = {
            texture1: { value: randomTexture },
            bumpIntensity: { value: 1 }
        };

        const headMaterial = new THREE.ShaderMaterial({
            uniforms: bumpUniforms,
            vertexShader: sphereVertexShader,
            fragmentShader: sphereFragmentShader
        });

        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 0.5) * 1000
        );
        head.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        head.receiveShadow = true;
        rotatingHeads.push({
            mesh: head,
            rotationSpeed: { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 }
        });

        headsGroup.add(head);
    }

    scene.add(headsGroup);

    // 🪐 Planets with lava shader
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
            vec2 offset = vec2(sin(time * 1.5), cos(time * 1.5)) * 0.02;
            vec4 lavaColor = texture2D(texture1, uv + offset);
            lavaColor.rgb = mix(lavaColor.rgb, vec3(0.5, 0.1, 0.1), 0.8); // Add red tint
            gl_FragColor = vec4(lavaColor.rgb * 0.8, 1.0); // Darken and reduce brightness
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

        // Avoid the center of the screen
        let x = (Math.random() - 0.5) * 2000;
        let y = (Math.random() - 0.5) * 1500;
        if (Math.abs(x) < 500 && Math.abs(y) < 300) {
            x += x > 0 ? 500 : -500;
            y += y > 0 ? 300 : -300;
        }

        planet.position.set(x, y, -Math.random() * 2500);
        planet.castShadow = true;
        planets.push(planet);
        scene.add(planet);
    }

    // 🌠 Shooting stars logic remains unchanged
    const shootingStarTexture = new THREE.TextureLoader().load("/starfast.png");
    const shootingStars = [];
    const addShootingStar = () => {
        const starGeometry = new THREE.PlaneGeometry(30, 10);
        const starMaterial = new THREE.MeshBasicMaterial({ map: shootingStarTexture, transparent: true, opacity: 0.8 });
        const shootingStar = new THREE.Mesh(starGeometry, starMaterial);

        const startX = Math.random() > 0.5 ? -1500 : 1500;
        const startY = Math.random() * 1000 - 500;
        shootingStar.position.set(startX, startY, -Math.random() * 1500 - 400);
        shootingStar.userData = {
            angle: Math.random() * Math.PI / 6 - Math.PI / 12, // Slightly curved angle
            speed: Math.random() * 5 + 2, // Random speed
        };

        scene.add(shootingStar);
        shootingStars.push(shootingStar);
    };

    setInterval(() => {
        if (shootingStars.length < 5) addShootingStar();
    }, 800);

    const updateShootingStars = () => {
        shootingStars.forEach((star, index) => {
            star.position.x += star.userData.speed * Math.cos(star.userData.angle);
            star.position.y += star.userData.speed * Math.sin(star.userData.angle);
            star.rotation.z = star.userData.angle; // Align with trajectory

            if (star.position.x < -1500 || star.position.x > 1500 || star.position.y < -1000 || star.position.y > 1000) {
                scene.remove(star);
                shootingStars.splice(index, 1);
            }
        });
    };

     // 🚀 Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Rotate heads
        headsGroup.rotation.y += 0.0005;
        rotatingHeads.forEach(({ mesh, rotationSpeed }) => {
            mesh.rotation.x += rotationSpeed.x;
            mesh.rotation.y += rotationSpeed.y;
        });

        // Update shooting stars
        updateShootingStars();

        // Update lava shader
        lavaUniforms.time.value += 0.01;
        renderer.render(scene, camera);

    };

    animate();

    // 🌍 Mouse movement for camera
    document.addEventListener("mousemove", (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 50 - camera.position.y) * 0.05;
    });

    // 📏 Window resize handler
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}