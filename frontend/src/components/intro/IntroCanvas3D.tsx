"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function IntroCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0e11, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 40, 180);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0b0e11, 1);
    container.appendChild(renderer.domElement);

    // 2. Wave Particle Grid (Financial Data Stream)
    const particleCount = 2800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorGold = new THREE.Color(0xf0b90b);
    const colorCyan = new THREE.Color(0x00f0ff);
    const colorGreen = new THREE.Color(0x0ecb81);
    const colorDim = new THREE.Color(0x2b313a);

    const gridX = 70;
    const gridZ = 40;
    const separation = 8;

    let index = 0;
    for (let ix = 0; ix < gridX; ix++) {
      for (let iz = 0; iz < gridZ; iz++) {
        const x = ix * separation - (gridX * separation) / 2;
        const z = iz * separation - (gridZ * separation) / 2 - 20;
        const y = 0;

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Gradient color palette
        const ratio = (ix + iz) / (gridX + gridZ);
        let c = colorDim;
        if (ratio < 0.35) c = colorGreen;
        else if (ratio < 0.7) c = colorGold;
        else c = colorCyan;

        colors[index * 3] = c.r;
        colors[index * 3 + 1] = c.g;
        colors[index * 3 + 2] = c.b;

        index++;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      size: 2.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, pMaterial);
    scene.add(particleSystem);

    // 3. Central Holographic Core (Wireframe Globe / Polyhedron)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 35, -40);

    // Outer Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(42, 2);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xf0b90b,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(icoMesh);

    // Inner Dodecahedron
    const innerGeo = new THREE.DodecahedronGeometry(26, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Orbiting rings
    const ringGeo = new THREE.TorusGeometry(56, 0.4, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0ecb81,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 4;
    coreGroup.add(ring2);

    scene.add(coreGroup);

    // 4. Mouse Interactivity (Parallax)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      mouseX = (event.clientX - halfWidth) / halfWidth;
      mouseY = (event.clientY - halfHeight) / halfHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 5. Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let animationFrameId: number;
    let count = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      count += 0.025;

      // Smooth mouse follow
      targetX += (mouseX * 40 - targetX) * 0.05;
      targetY += (-mouseY * 25 - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = 40 + targetY;
      camera.lookAt(0, 25, -40);

      // Rotate central holographic core
      coreGroup.rotation.y += 0.004;
      coreGroup.rotation.x += 0.002;
      innerMesh.rotation.y -= 0.008;
      ring1.rotation.z += 0.005;
      ring2.rotation.z -= 0.006;

      // Animate wave particles
      const posArray = geometry.attributes.position.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < gridX; ix++) {
        for (let iz = 0; iz < gridZ; iz++) {
          const y =
            Math.sin((ix + count) * 0.3) * 12 +
            Math.sin((iz + count) * 0.4) * 8 +
            Math.cos((ix + iz + count) * 0.2) * 6;
          posArray[i * 3 + 1] = y - 25;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      pMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
