import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Tokens } from '../../utils/styles';

export const Background: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // OBJECTS
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshBasicMaterial({ 
      color: Tokens.Color.Accent.Surface[1], 
      wireframe: true,
      transparent: true,
      opacity: 0.1 
    });

    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      shape.scale.setScalar(Math.random() * 2 + 1);
      scene.add(shape);
      shapes.push(shape);
    }

    camera.position.z = 5;

    // ANIMATION LOOP
    const animate = () => {
      requestAnimationFrame(animate);
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.001 * (i + 1);
        shape.rotation.y += 0.001 * (i + 1);
      });
      renderer.render(scene, camera);
    };
    animate();

    // GSAP INTERACTIONS
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      gsap.to(camera.position, {
        x: x * 0.5,
        y: y * 0.5,
        duration: 2,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6,
        filter: 'blur(40px)'
      }}
    />
  );
};