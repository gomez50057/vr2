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
  const rootRef = useRef(null);
  const hitRef = useRef(null);
  const colors = COLORS[hotspot.type] || COLORS.info;
  const label =
    hotspot.label.length > 20 ? `${hotspot.label.slice(0, 18).trim()}...` : hotspot.label;
  const iconY = hotspot.type === "info" ? 0.58 : 0;
  const labelY = hotspot.type === "info" ? 1.18 : -0.74;
  const textY = labelY - 0.035;
  const hitRadius = hotspot.type === "info" ? 0.42 : 0.48;

  useEffect(() => {
    const hit = hitRef.current;
    const root = rootRef.current;
    if (!hit || !root) return undefined;

    const activate = (event) => {
      event.stopPropagation();
      onActivate(hotspot);
    };
    const highlight = () => {
      root.setAttribute("scale", "1.14 1.14 1.14");
      root.querySelector("a-light")?.setAttribute("intensity", "0.55");
    };
    const reset = () => {
      root.setAttribute("scale", "1 1 1");
      root.querySelector("a-light")?.setAttribute("intensity", "0.2");
    };

    hit.addEventListener("click", activate);
    hit.addEventListener("mouseenter", highlight);
    hit.addEventListener("mouseleave", reset);
    return () => {
      hit.removeEventListener("click", activate);
      hit.removeEventListener("mouseenter", highlight);
      hit.removeEventListener("mouseleave", reset);
    };
  }, [hotspot, onActivate]);

  return (
    <a-entity
      ref={rootRef}
      position={hotspot.position}
      face-camera=""
      data-hotspot-id={hotspot.id}
    >
      <a-circle
        ref={hitRef}
        className="hotspot"
        radius={String(hitRadius)}
        position={`0 ${iconY} 0.08`}
        material="color: #ffffff; shader: flat; opacity: 0.001; transparent: true"
      />
      <a-light
        type="point"
        color={colors.glow}
        intensity="0.2"
        distance="2.4"
        position={`0 ${iconY} 0`}
      />
      <a-circle
        radius="0.2"
        position={`0 ${iconY} 0`}
        material={`color: ${colors.fill}; shader: flat; opacity: 0.95; transparent: true`}
        animation__pulse="property: scale; dir: alternate; dur: 980; easing: easeInOutSine; loop: true; to: 1.08 1.08 1.08"
      />
      <a-torus
        radius="0.27"
        radius-tubular="0.012"
        position={`0 ${iconY} 0`}
        material={`color: ${colors.glow}; opacity: 0.88; transparent: true; shader: flat`}
        animation__spin="property: rotation; to: 0 0 360; dur: 4600; easing: linear; loop: true"
      />
      <a-ring
        radius-inner="0.35"
        radius-outer="0.38"
        position={`0 ${iconY} 0`}
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
          position={`0 ${iconY - 0.07} 0.04`}
          material="shader: flat"
        />
      )}
      <a-plane
        width="1.42"
        height="0.24"
        position={`0 ${labelY} -0.02`}
        material="color: #071018; opacity: 0.76; transparent: true; shader: flat"
      />
      <a-text
        value={label}
        align="center"
        baseline="center"
        anchor="center"
        width="2.35"
        color="#f7fbff"
        position={`0 ${textY} 0.03`}
        material="shader: flat"
      />
    </a-entity>
  );
}
