// Custom GLSL Shaders for particle morphing system
// Based on Resn/Lusion creative technical patterns

// Vertex shader for morphing between particle states
export const morphVertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uMorphProgress;
  
  attribute vec3 aTargetPosition;
  attribute vec3 aRandomness;
  attribute float aScale;
  
  varying vec3 vPosition;
  varying float vProgress;
  varying float vScale;
  
  // Noise function for organic movement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    // Smooth morph between positions
    float morphEase = smoothstep(0.0, 1.0, uMorphProgress);
    vec3 morphedPosition = mix(position, aTargetPosition, morphEase);
    
    // Add organic noise movement
    float noiseScale = 0.5;
    float noiseTime = uTime * 0.3;
    vec3 noise = vec3(
      snoise(morphedPosition * noiseScale + noiseTime),
      snoise(morphedPosition * noiseScale + noiseTime + 100.0),
      snoise(morphedPosition * noiseScale + noiseTime + 200.0)
    ) * aRandomness * (1.0 - morphEase * 0.5);
    
    vec3 finalPosition = morphedPosition + noise;
    
    // Vortex effect at start
    if (uProgress < 0.25) {
      float vortexStrength = 1.0 - uProgress * 4.0;
      float angle = atan(finalPosition.x, finalPosition.z);
      float radius = length(finalPosition.xz);
      angle += vortexStrength * 2.0 * sin(uTime + radius * 0.5);
      finalPosition.x = sin(angle) * radius;
      finalPosition.z = cos(angle) * radius;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    
    // Size attenuation with distance
    gl_PointSize = aScale * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 15.0);
    
    gl_Position = projectionMatrix * mvPosition;
    
    vPosition = finalPosition;
    vProgress = uProgress;
    vScale = aScale;
  }
`;

// Fragment shader with glow effect
export const morphFragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  
  varying vec3 vPosition;
  varying float vProgress;
  varying float vScale;
  
  void main() {
    // Circular particle shape with soft edges
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft glow falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);
    
    // Color gradient based on position and progress
    float colorMix = (vPosition.y + 10.0) / 20.0;
    colorMix = clamp(colorMix, 0.0, 1.0);
    vec3 color = mix(uColor1, uColor2, colorMix);
    
    // Add subtle pulsing
    float pulse = sin(uTime * 2.0 + vPosition.y * 0.5) * 0.1 + 0.9;
    
    // Intensity boost for bloom
    float intensity = 1.2 + vProgress * 0.3;
    
    gl_FragColor = vec4(color * pulse * intensity, alpha * 0.85);
  }
`;

// DNA flow shader for emissive texture effect
export const dnaVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const dnaFragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Flowing energy effect along DNA
    float flow = fract(vUv.x * 3.0 - uTime * 0.5);
    flow = pow(flow, 3.0);
    
    // Fresnel glow at edges
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
    
    // Combine base color with glow
    vec3 color = mix(uBaseColor, uGlowColor, flow * 0.7 + fresnel * 0.5);
    
    // Intensity for bloom pickup
    float intensity = 1.0 + flow * 0.5 + fresnel * 0.8;
    
    gl_FragColor = vec4(color * intensity, 1.0);
  }
`;

// Growth reveal shader with clipping plane
export const growthVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const growthFragmentShader = `
  uniform float uReveal;
  uniform float uTime;
  uniform vec3 uColor;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    // Clip based on Y position and reveal progress
    float revealHeight = mix(-10.0, 15.0, uReveal);
    if (vPosition.y > revealHeight) discard;
    
    // Soft edge at reveal line
    float edge = smoothstep(revealHeight - 1.0, revealHeight, vPosition.y);
    
    // Fresh glow at the growing edge
    vec3 color = uColor;
    color += vec3(0.2, 0.5, 0.2) * edge * 2.0;
    
    // Subtle pulse
    float pulse = sin(uTime * 3.0 + vPosition.y) * 0.1 + 1.0;
    
    gl_FragColor = vec4(color * pulse, 1.0 - edge * 0.3);
  }
`;
