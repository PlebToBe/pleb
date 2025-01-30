import * as THREE from "three";

export function createStarBackground() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    document.body.appendChild(renderer.domElement);

    // Load face textures
    const headTextures = [
        new THREE.TextureLoader().load("/star1.png"),
        new THREE.TextureLoader().load("/star2.png"),
        new THREE.TextureLoader().load("/star3.png"),
        new THREE.TextureLoader().load("/star4.png"),
        new THREE.TextureLoader().load("/star5.png"),
    ];

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        precision mediump float;
        varying vec2 vUv;
        uniform float time;
        uniform sampler2D textureSampler;

        void main() {
            vec4 baseColor = texture2D(textureSampler, vUv);
            float gradient = vUv.y;
            float pulse = 0.5 + 0.5 * sin(time + vUv.x * 10.0);
            vec3 dynamicColor = mix(vec3(0.1, 0.4, 0.8), vec3(1.0, 0.7, 0.2), gradient * pulse);
            vec3 finalColor = mix(baseColor.rgb, dynamicColor, 0.35);

            gl_FragColor = vec4(finalColor, baseColor.a);
        }
    `;

    const headsGroup = new THREE.Group();
    const rotatingHeads = [];

    for (let i = 0; i < 150; i++) {
        const headGeometry = new THREE.SphereGeometry(10, 64, 64);
        const randomTexture = headTextures[Math.floor(Math.random() * headTextures.length)];

        const headMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0 },
                textureSampler: { value: randomTexture },
            },
        });

        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
        head.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        rotatingHeads.push({
            mesh: head,
            rotationSpeed: { x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.05 },
        });

        headsGroup.add(head);
    }

    scene.add(headsGroup);

    // 🌟 LUZ DIFUMINADA: Horizonte cósmico
    const horizonLight = new THREE.PointLight(0x9966ff, 3, 1000);
    horizonLight.position.set(0, -500, -500);
    scene.add(horizonLight);

    // 🌌 Luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // 🔥 Luz de fondo simulando un resplandor lejano
    const horizonGlow = new THREE.Mesh(
        new THREE.SphereGeometry(500, 64, 64),
        new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vNormal;

                void main() {
                    float intensity = 0.4 + 0.6 * sin(time * 0.5);
                    vec3 color = vec3(0.5, 0.1, 0.8) * intensity;
                    gl_FragColor = vec4(color, 0.2);
                }
            `,
            transparent: true,
            depthWrite: false,
        })
    );
    horizonGlow.position.set(0, -600, -800);
    scene.add(horizonGlow);

    let angle = 0;

    const animate = () => {
        requestAnimationFrame(animate);

        headsGroup.rotation.y += 0.0005;
        rotatingHeads.forEach(({ mesh, rotationSpeed }) => {
            mesh.rotation.x += rotationSpeed.x;
            mesh.rotation.y += rotationSpeed.y;
        });

        // Movimiento del resplandor y la luz de horizonte
        angle += 0.01;
        horizonLight.position.y = -300 + Math.sin(angle) * 100;
        horizonLight.position.x = Math.cos(angle * 0.5) * 300;

        horizonGlow.material.uniforms.time.value += 0.02;

        renderer.render(scene, camera);
    };

    animate();

    document.addEventListener("mousemove", (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 50 - camera.position.y) * 0.05;
    });

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}
