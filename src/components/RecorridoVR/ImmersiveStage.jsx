"use client";

const THEMES = {
  entrada: {
    accent: "#38bdf8",
    warm: "#ffd166",
    ground: "#26343b",
    glass: "#6aa6bd",
  },
  "calle-principal": {
    accent: "#5eead4",
    warm: "#f8d36b",
    ground: "#28343b",
    glass: "#7ca7ba",
  },
  plaza: {
    accent: "#86efac",
    warm: "#ffe08a",
    ground: "#303c2e",
    glass: "#90b8a4",
  },
  "cruce-urbano": {
    accent: "#fb7185",
    warm: "#facc15",
    ground: "#2a363e",
    glass: "#8fb4c6",
  },
  "fachada-institucional": {
    accent: "#c4b5fd",
    warm: "#f5d48b",
    ground: "#36332d",
    glass: "#9db4c0",
  },
};

const BUILDING_LAYOUTS = {
  entrada: [
    ["-8 2.2 -9", "5", "4.4", "3", "#8797a1"],
    ["8 2.6 -10", "4", "5.2", "3.2", "#c3b69d"],
    ["-11 1.8 2", "3", "3.6", "3", "#a8b3b8"],
    ["10 2 3", "3.4", "4", "2.8", "#b7aa92"],
  ],
  "calle-principal": [
    ["-7 3 -10", "4.4", "6", "3", "#9aa9b2"],
    ["7 3.4 -10", "4.8", "6.8", "3", "#c7bca5"],
    ["-9 2.3 4", "3.2", "4.6", "2.8", "#87939b"],
    ["9 2.6 3", "3.4", "5.2", "2.8", "#b8aa91"],
  ],
  plaza: [
    ["-9 2.2 -8", "4", "4.4", "3", "#b9c2c3"],
    ["9 2.2 -8", "4", "4.4", "3", "#cbbf9f"],
    ["-10 1.8 4", "3", "3.6", "2.7", "#97a69c"],
    ["10 1.8 4", "3", "3.6", "2.7", "#a8b1b4"],
  ],
  "cruce-urbano": [
    ["-8 3 -8", "4.2", "6", "3", "#9aa7ad"],
    ["8 3 -8", "4.2", "6", "3", "#c3b59e"],
    ["-9 2.4 5", "3.4", "4.8", "3", "#84919a"],
    ["9 2.4 5", "3.4", "4.8", "3", "#b7a88f"],
  ],
  "fachada-institucional": [
    ["0 2.8 -10", "8", "5.6", "2.4", "#cfc4ad"],
    ["-9 1.9 -5", "3.2", "3.8", "2.5", "#8e9da5"],
    ["9 1.9 -5", "3.2", "3.8", "2.5", "#8e9da5"],
    ["-9 2 5", "3.4", "4", "2.8", "#a7b1b8"],
    ["9 2 5", "3.4", "4", "2.8", "#b7aa92"],
  ],
};

const TREES = [
  "-4 0 -5",
  "4 0 -5",
  "-6 0 5",
  "6 0 5",
];

const LIGHTS = [
  "-3.6 0 -7",
  "3.6 0 -7",
  "-5.2 0 1.8",
  "5.2 0 1.8",
];

function Building({ item, glass }) {
  const [position, width, height, depth, color] = item;
  const windowY = Number(height) * 0.12;

  return (
    <a-entity position={position}>
      <a-box
        width={width}
        height={height}
        depth={depth}
        position={`0 ${Number(height) / 2} 0`}
        material={`color: ${color}; roughness: 0.72; metalness: 0.02`}
        shadow="cast: true; receive: true"
      />
      <a-box
        width={Number(width) * 0.78}
        height={Number(height) * 0.58}
        depth="0.04"
        position={`0 ${Number(height) / 2 + windowY} ${-Number(depth) / 2 - 0.03}`}
        material={`color: ${glass}; opacity: 0.45; transparent: true; roughness: 0.25; metalness: 0.18`}
      />
      <a-box
        width={Number(width) * 0.78}
        height="0.08"
        depth="0.08"
        position={`0 ${Number(height) + 0.08} ${-Number(depth) / 2}`}
        material="color: #f4efe2; emissive: #d8c48f; emissiveIntensity: 0.25"
      />
    </a-entity>
  );
}

function Tree({ position }) {
  return (
    <a-entity position={position}>
      <a-cylinder
        radius="0.08"
        height="1.2"
        position="0 0.6 0"
        material="color: #6b4f35; roughness: 0.8"
      />
      <a-sphere
        radius="0.62"
        position="0 1.45 0"
        material="color: #3f7f52; roughness: 0.9"
      />
      <a-sphere
        radius="0.42"
        position="0.38 1.65 -0.05"
        material="color: #5a9968; roughness: 0.9"
      />
    </a-entity>
  );
}

function StreetLight({ position, color }) {
  return (
    <a-entity position={position}>
      <a-cylinder radius="0.035" height="2.4" position="0 1.2 0" material="color: #26333c" />
      <a-sphere
        radius="0.13"
        position="0 2.44 0"
        material={`color: ${color}; emissive: ${color}; emissiveIntensity: 1.4`}
      />
      <a-light type="point" color={color} intensity="0.35" distance="5" position="0 2.35 0" />
    </a-entity>
  );
}

export default function ImmersiveStage({ node }) {
  const theme = THEMES[node?.id] || THEMES.entrada;
  const buildings = BUILDING_LAYOUTS[node?.id] || BUILDING_LAYOUTS.entrada;

  return (
    <a-entity>
      <a-light type="ambient" color="#e8f4ff" intensity="0.98" />
      <a-light type="directional" color="#fff2d2" intensity="1.15" position="-3 7 4" />

      <a-circle
        radius="26"
        segments="128"
        rotation="-90 0 0"
        position="0 -0.03 0"
        material={`color: ${theme.ground}; roughness: 0.86; metalness: 0.02`}
        shadow="receive: true"
      />
      <a-ring
        radius-inner="2.4"
        radius-outer="2.46"
        rotation="-90 0 0"
        position="0 0.01 0"
        material={`color: ${theme.accent}; opacity: 0.38; transparent: true; shader: flat`}
      />
      <a-ring
        radius-inner="6.6"
        radius-outer="6.7"
        rotation="-90 0 0"
        position="0 0.012 0"
        material={`color: ${theme.accent}; opacity: 0.18; transparent: true; shader: flat`}
      />
      <a-plane
        width="2.4"
        height="22"
        rotation="-90 0 0"
        position="0 0.02 -2.2"
        material="color: #f2efe5; opacity: 0.08; transparent: true"
      />

      {buildings.map((item) => (
        <Building key={item.join("-")} item={item} glass={theme.glass} />
      ))}
      {TREES.map((position) => (
        <Tree key={position} position={position} />
      ))}
      {LIGHTS.map((position) => (
        <StreetLight key={position} position={position} color={theme.warm} />
      ))}

      <a-entity
        rotation="0 0 0"
        animation="property: rotation; to: 0 360 0; dur: 42000; easing: linear; loop: true"
      >
        <a-ring
          radius-inner="10.5"
          radius-outer="10.57"
          rotation="-90 0 0"
          position="0 0.035 0"
          material={`color: ${theme.accent}; opacity: 0.13; transparent: true; shader: flat`}
        />
      </a-entity>
    </a-entity>
  );
}
