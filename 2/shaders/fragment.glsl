uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
varying vec2 vUv;

float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
}

float nebula(vec2 uv, float t) {
    vec3 p = vec3(uv * 5.0, t * 0.1);
    float n = noise(p) * 0.5 + noise(p * 2.0) * 0.25 + noise(p * 4.0) * 0.125;
    return n;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y);
    uv += mouse * 0.1; // Mouse distortion
    float t = time;
    float n1 = nebula(uv, t);
    float n2 = nebula(uv + vec2(0.1, 0.2), t * 1.2);
    vec3 color = mix(vec3(0.8, 0.3, 0.2), vec3(0.2, 0.1, 0.8), n1 * n2); // Cosmic colors
    gl_FragColor = vec4(color, 0.6); // Semi-transparent
}