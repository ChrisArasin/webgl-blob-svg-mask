precision mediump float;
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d) 

#define TWO_PI 6.28318530718

uniform float u_time;
uniform float u_noiseFreq;
uniform float u_noiseSpeed;
uniform vec2 u_resolution;
uniform vec2 u_screenDimensions;
uniform vec2 u_mouse;
uniform bool u_animateGrain;
uniform float u_grainAmount;
uniform float u_smoothEdge;
uniform bool u_halo;
uniform float u_haloSize;

float mouseFactor = 0.4;
float freq = u_noiseFreq;
float noiseTimeFactor = u_noiseSpeed;

float random( vec2 p )
{
  vec2 K1 = vec2(
  23.14069263277926, // e^pi (Gelfond's constant)
  2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
);
  return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / u_resolution.x * 2. - 1., gl_FragCoord.y / u_resolution.x * 2. - u_resolution.y / u_resolution.x );
  vec2 mouse = vec2(u_mouse.x / u_screenDimensions.x * 2. - 1.,   u_mouse.y / u_screenDimensions.x * 2. - u_screenDimensions.y / u_screenDimensions.x );
  mouse.y *= -1.;

  // smooth step noise to make clearer blobs

  float noise = snoise3(vec3(uv.x * freq, uv.y * freq, u_time * noiseTimeFactor));
  float n = smoothstep(0.5, 0.6, noise / 2. + 0.5 );  

  

  vec2 center1A =  vec2(0, 0) + mouse * mouseFactor;
  vec2 center1B = vec2(1, -0.2);

  vec2 center2A = vec2(0, 0);
  vec2 center2B = vec2(0, 0);

  float distCenter1A = distance(uv, center1A );
  float distCenter1B =  distance(uv, center1B);

  // float distCenter2A = distance(uv, center2A);
  // float distCenter2B =  distance(uv, center2B);

  float baseSize = 0.4;
  float pct1 = smoothstep(baseSize, baseSize + u_smoothEdge, distCenter1A + noise / 3. ) ;
  
  float haloSize = u_haloSize;
  float pct2 =   smoothstep(baseSize , baseSize + u_smoothEdge + haloSize, distCenter1A + noise / 3. ) ;


  vec4 colorBlue = vec4(0.05, 0.4, 0.98, 1);
  vec4 colorPurple = vec4(0.39,0.14, 0.98, 1);
  vec4 colorGreen = vec4(0.15, 0.84, 0.64, 1);
  vec4 colorYellow = vec4(1 , 0.67, 0.098, 1.);
  vec4 colorYellowTrans = vec4(1 , 0.67, 0.098, 0);
  vec4 neutralGray = vec4(0.7, 0.74, 0.8, 1);
  vec4 neutralGrayBlue = vec4(0.65, 0.7, 1, 1);


  vec4 neutralGrayDark = vec4(0.1, 0.14, 0.14, 1);
  vec4 neutralGrayBlueDark = vec4(0.1, 0.1, 0.34, 1);

  vec4 neutralGrayLight = vec4(1, 1, 1, 1);
  vec4 neutralGrayBlueLight= vec4(0.98, 0.99, 1, 1);


  vec4 colorBlueDull = vec4(0.1, 0.55, 0.6, 1);
  vec4 colorGreenDull = vec4(0.2, 0.74, 0.54, 1);



  // mix purple and blue based on Y coord,
  //  then add yellow and subtract blue based on noise
  vec4 orbColor = mix(colorPurple, colorGreen,  ((uv.y  + 1.) / 2.)) 
    + vec4(noise / 1.0, noise / 1.5, -noise / 1.1 , 1.);

  vec4 haloColor = vec4(0.1, 0.5, 1., 1);

  vec4 bkColor =   mix(colorBlueDull, colorGreenDull,  uv.x);

  // Nested circles using pct1 and pct2 distances
  // vec4 colortest =  vec4(pct1, 1., 0.9, 1. ) * vec4(1., 1. - pct2 / 1.25, 1,  1. )  ;

  // Big soft pc2 circle
  // vec4 color =  mix(bkColor, neutralGray, pct2);


  vec4 orb =  mix(orbColor, bkColor, pct1 );

  vec4 halo =  mix(haloColor, bkColor, pct2 );

  vec4 color =  u_halo ? mix(orb, halo, pct1 ) : orb;
  


  // final noise
  vec2 uvRandom = uv;
  uvRandom.y *= random(vec2(uvRandom.y, u_time));

  float postNoise = u_animateGrain ?  random(uvRandom)  : random(uv);
  vec4 noiseColor = vec4( postNoise / 4.,  postNoise / 4., postNoise / 4., 1.) * u_grainAmount;

  gl_FragColor = color + noiseColor; 
}