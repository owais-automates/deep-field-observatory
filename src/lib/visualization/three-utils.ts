import * as THREE from 'three';

// Create a star with given parameters
function createStar(radius: number, color: string): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  });
  return new THREE.Mesh(geometry, material);
}

// Create a planet with given parameters
function createPlanet(radius: number, color: string): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.2
  });
  return new THREE.Mesh(geometry, material);
}

// Create orbital path visualization
function createOrbitalPath(radius: number, color: string = '#444'): THREE.Line {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: color });
  return new THREE.Line(geometry, material);
}

// Create a scene with basic lighting
function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  return scene;
}

// Create a camera with given aspect ratio
function createCamera(aspectRatio: number = 1): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
  camera.position.z = 20;
  return camera;
}

// Create a renderer with given size
function createRenderer(width: number, height: number): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  return renderer;
}

export {
  createStar,
  createPlanet,
  createOrbitalPath,
  createScene,
  createCamera,
  createRenderer
};
