
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * LaserFlow Component
 * Premium Three.js Shader for SITC Travel Portal
 */

const LaserFlowShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#3e91e0') },
        uHorizontalBeamOffset: { value: 0.1 },
        uVerticalBeamOffset: { value: 0.0 },
        uHorizontalSizing: { value: 0.5 },
        uVerticalSizing: { value: 2.0 },
        uWispDensity: { value: 1.0 },
        uWispSpeed: { value: 15.0 },
        uWispIntensity: { value: 5.0 },
        uFlowSpeed: { value: 0.35 },
        uFlowStrength: { value: 0.25 },
        uFogIntensity: { value: 0.45 },
        uFogScale: { value: 0.3 },
        uFogFallSpeed: { value: 0.6 },
        uDecay: { value: 1.1 },
        uFalloffStart: { value: 1.2 },
        uResolution: { value: new THREE.Vector2() },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uHorizontalBeamOffset;
    uniform float uVerticalBeamOffset;
    uniform float uHorizontalSizing;
    uniform float uVerticalSizing;
    uniform float uWispDensity;
    uniform float uWispSpeed;
    uniform float uWispIntensity;
    uniform float uFlowSpeed;
    uniform float uFlowStrength;
    uniform float uFogIntensity;
    uniform float uFogScale;
    uniform float uFogFallSpeed;
    uniform float uDecay;
    uniform float uFalloffStart;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex noise inspired functions for performance
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = a0 * vec3(x0.x,x12.xz) + h * vec3(x0.y,x12.yw);
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Transform coordinates
      vec2 st = (uv - 0.5) * 2.0;
      st.x -= uHorizontalBeamOffset;
      st.y -= uVerticalBeamOffset;
      
      float t = uTime * uFlowSpeed;
      
      // Calculate laser flow with multiple octaves of scale-transformed noise
      float flow = 0.0;
      
      float noise1 = snoise(vec2(uv.x * uHorizontalSizing - t, uv.y * uVerticalSizing + t * 0.1));
      float noise2 = snoise(vec2(uv.x * uHorizontalSizing * 0.5 + t, uv.y * uVerticalSizing * 0.8 - t * 0.2));
      
      // Create high-intensity "wisps"
      float wisps = pow(abs(noise1 * noise2), uWispIntensity / uWispDensity);
      flow += wisps * uFlowStrength * 10.0;
      
      // Add more subtle layers
      flow += snoise(vec2(uv.x * 0.2, uv.y * 3.0 + uTime * 0.5)) * 0.1;

      // Fog / Atmospheric layer
      float fogBase = snoise(uv * uFogScale - uTime * uFogFallSpeed * 0.1) * 0.5 + 0.5;
      float fog = fogBase * uFogIntensity;
      
      // Vertical and radial falloff for premium edge softness
      float dist = length(st);
      float alpha = smoothstep(uFalloffStart, uFalloffStart - 0.7, dist * uDecay);
      
      // Enhance color vibrancy
      vec3 finalColor = uColor * (flow + fog + wisps * 2.0);
      
      // Add subtle chromatic aberration feel at edges
      finalColor.r += flow * 0.05 * smoothstep(0.0, 1.0, dist);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

const ShaderContent = (props: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    const uniforms = useMemo(() => {
        return {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(props.color || '#3e91e0') },
            uHorizontalBeamOffset: { value: props.horizontalBeamOffset ?? 0.1 },
            uVerticalBeamOffset: { value: props.verticalBeamOffset ?? 0.0 },
            uHorizontalSizing: { value: props.horizontalSizing ?? 0.5 },
            uVerticalSizing: { value: props.verticalSizing ?? 2.0 },
            uWispDensity: { value: props.wispDensity ?? 1.0 },
            uWispSpeed: { value: props.wispSpeed ?? 15.0 },
            uWispIntensity: { value: props.wispIntensity ?? 5.0 },
            uFlowSpeed: { value: props.flowSpeed ?? 0.35 },
            uFlowStrength: { value: props.flowStrength ?? 0.25 },
            uFogIntensity: { value: props.fogIntensity ?? 0.45 },
            uFogScale: { value: props.fogScale ?? 0.3 },
            uFogFallSpeed: { value: props.fogFallSpeed ?? 0.6 },
            uDecay: { value: props.decay ?? 1.1 },
            uFalloffStart: { value: props.falloffStart ?? 1.2 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
        };
    }, [props.color, size.width, size.height]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.getElapsedTime();

            // Sync props to uniforms smoothly
            material.uniforms.uHorizontalBeamOffset.value = THREE.MathUtils.lerp(
                material.uniforms.uHorizontalBeamOffset.value,
                props.horizontalBeamOffset ?? 0.1,
                0.05
            );
            material.uniforms.uColor.value.set(props.color || '#3e91e0');
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                key={JSON.stringify(props)}
                transparent
                uniforms={uniforms}
                vertexShader={LaserFlowShader.vertexShader}
                fragmentShader={LaserFlowShader.fragmentShader}
            />
        </mesh>
    );
};

export function LaserFlow(props: any) {
    return (
        <div
            className="laser-flow-container"
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 1] }}
                dpr={props.dpr || [1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <ShaderContent {...props} />
            </Canvas>
        </div>
    );
}

export default LaserFlow;
