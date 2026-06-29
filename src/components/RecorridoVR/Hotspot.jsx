"use client";

import { useEffect, useRef } from "react";

const COLORS = {
  navigation: {
    fill: "#38bdf8",
    glow: "#7dd3fc",
    ring: "#e0f2fe",
  },
  info: {
    fill: "#facc15",
    glow: "#fde68a",
    ring: "#fff7cc",
  },
};

export default function Hotspot({ hotspot, onActivate }) {
  const ref = useRef(null);
  const colors = COLORS[hotspot.type] || COLORS.info;
  const label =
    hotspot.label.length > 20 ? `${hotspot.label.slice(0, 18).trim()}...` : hotspot.label;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const activate = (event) => {
      event.stopPropagation();
      onActivate(hotspot);
    };

    el.addEventListener("click", activate);
    return () => el.removeEventListener("click", activate);
  }, [hotspot, onActivate]);

  return (
    <a-entity
      ref={ref}
      className="hotspot"
      position={hotspot.position}
      face-camera=""
      geometry="primitive: circle; radius: 0.52"
      material="color: #ffffff; shader: flat; opacity: 0.001; transparent: true"
      data-hotspot-id={hotspot.id}
    >
      <a-light type="point" color={colors.glow} intensity="0.2" distance="2.4" />
      <a-circle
        radius="0.2"
        material={`color: ${colors.fill}; shader: flat; opacity: 0.95; transparent: true`}
        animation__pulse="property: scale; dir: alternate; dur: 980; easing: easeInOutSine; loop: true; to: 1.08 1.08 1.08"
      />
      <a-torus
        radius="0.27"
        radius-tubular="0.012"
        material={`color: ${colors.glow}; opacity: 0.88; transparent: true; shader: flat`}
        animation__spin="property: rotation; to: 0 0 360; dur: 4600; easing: linear; loop: true"
      />
      <a-ring
        radius-inner="0.35"
        radius-outer="0.38"
        material={`color: ${colors.ring}; shader: flat; opacity: 0.46; transparent: true`}
      />
      {hotspot.type === "navigation" ? (
        <a-cone
          radius-bottom="0.085"
          radius-top="0"
          height="0.22"
          position="0.03 0 0.03"
          rotation="0 0 -90"
          material="color: #ffffff; shader: flat; opacity: 0.95; transparent: true"
        />
      ) : (
        <a-text
          value="i"
          align="center"
          width="1.2"
          color="#17202a"
          position="0 -0.07 0.04"
          material="shader: flat"
        />
      )}
      <a-plane
        width="1.55"
        height="0.28"
        position="0 -0.5 -0.02"
        material="color: #071018; opacity: 0.76; transparent: true; shader: flat"
      />
      <a-text
        value={label}
        align="center"
        width="2.6"
        color="#f7fbff"
        position="0 -0.57 0.03"
        material="shader: flat"
      />
    </a-entity>
  );
}
