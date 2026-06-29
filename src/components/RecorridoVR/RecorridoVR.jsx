"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hotspot from "./Hotspot";
import InfoPanel from "./InfoPanel";
import LoadingScreen from "./LoadingScreen";
import SceneMenu from "./SceneMenu";
import styles from "./RecorridoVR.module.css";

const TOUR_URL = "/vr/data/tour.json";
const GAZE_MS = 1500;

function registerFaceCamera() {
  const aframe = window.AFRAME;
  if (!aframe || aframe.components["face-camera"]) return;

  aframe.registerComponent("face-camera", {
    init() {
      this.cameraPosition = new aframe.THREE.Vector3();
    },
    tick() {
      const camera = this.el.sceneEl?.camera?.el;
      if (!camera) return;

      camera.object3D.getWorldPosition(this.cameraPosition);
      this.el.object3D.lookAt(this.cameraPosition);
    },
  });
}

function isUsableTour(data) {
  return data && Array.isArray(data.nodes) && data.nodes.length > 0;
}

function fitText(value, max = 145) {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max - 3).trim()}...` : value;
}

export default function RecorridoVR() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const vrCloseRef = useRef(null);
  const lastActivationRef = useRef({ id: "", time: 0 });
  const [aframeReady, setAframeReady] = useState(false);
  const [tour, setTour] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState("");
  const [infoHotspot, setInfoHotspot] = useState(null);
  const [infoPanelPose, setInfoPanelPose] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageBroken, setImageBroken] = useState(false);
  const [notice, setNotice] = useState("");
  const [cleanView, setCleanView] = useState(false);

  useEffect(() => {
    let mounted = true;

    import("aframe")
      .then(() => {
        if (!mounted) return;
        registerFaceCamera();
        setAframeReady(true);
      })
      .catch(() => {
        if (mounted) setNotice("No se pudo iniciar A-Frame en este navegador.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    fetch(TOUR_URL)
      .then((response) => {
        if (!response.ok) throw new Error("tour.json no disponible");
        return response.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (!isUsableTour(data)) throw new Error("tour.json sin nodos");

        const fallbackStart = data.nodes[0].id;
        const requestedStart = data.nodes.some((node) => node.id === data.startNode)
          ? data.startNode
          : fallbackStart;

        setTour(data);
        setCurrentNodeId(requestedStart);
      })
      .catch(() => {
        if (mounted) {
          setNotice("No se pudo cargar /vr/data/tour.json.");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const nodes = useMemo(() => (Array.isArray(tour?.nodes) ? tour.nodes : []), [tour]);

  const nodesById = useMemo(
    () => Object.fromEntries(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const currentNode = nodesById[currentNodeId] || nodes[0] || null;

  const closeInfo = useCallback(() => {
    setInfoHotspot(null);
    setInfoPanelPose(null);
  }, []);

  const getInfoPanelPose = useCallback(() => {
    const aframe = window.AFRAME;
    const camera = sceneRef.current?.camera?.el;
    if (!aframe || !camera) return "0 1.6 -2.2";

    const position = new aframe.THREE.Vector3();
    const direction = new aframe.THREE.Vector3();
    camera.object3D.getWorldPosition(position);
    camera.object3D.getWorldDirection(direction);
    position.add(direction.multiplyScalar(2.2));

    return `${position.x.toFixed(2)} ${position.y.toFixed(2)} ${position.z.toFixed(2)}`;
  }, []);

  useEffect(() => {
    closeInfo();
  }, [currentNodeId, closeInfo]);

  useEffect(() => {
    if (!currentNode) return undefined;

    let alive = true;
    let done = false;
    const started = Date.now();
    const minTransitionMs = 320;

    setLoading(true);
    setImageBroken(false);

    const finish = (broken) => {
      if (done) return;
      done = true;
      const remaining = Math.max(minTransitionMs - (Date.now() - started), 0);
      window.setTimeout(() => {
        if (!alive) return;
        setImageBroken(Boolean(broken));
        setLoading(false);
      }, remaining);
    };

    if (!currentNode.panorama) {
      finish(true);
      return () => {
        alive = false;
      };
    }

    const image = new Image();
    const timeout = window.setTimeout(() => finish(false), 1800);

    image.onload = () => {
      window.clearTimeout(timeout);
      finish(false);
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      finish(true);
    };
    image.src = currentNode.panorama;

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [currentNode]);

  const changeScene = useCallback(
    (nodeId) => {
      if (!nodeId || !nodesById[nodeId] || nodeId === currentNodeId) return;
      setCurrentNodeId(nodeId);
    },
    [currentNodeId, nodesById],
  );

  const activateHotspot = useCallback(
    (hotspot) => {
      const now = performance.now();
      if (
        lastActivationRef.current.id === hotspot.id &&
        now - lastActivationRef.current.time < 600
      ) {
        return;
      }

      lastActivationRef.current = { id: hotspot.id, time: now };

      if (hotspot.type === "navigation") {
        changeScene(hotspot.target);
        return;
      }

      setInfoPanelPose(getInfoPanelPose());
      setInfoHotspot(hotspot);
    },
    [changeScene, getInfoPanelPose],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
  }, []);

  const enterVr = useCallback(() => {
    sceneRef.current?.enterVR?.();
  }, []);

  useEffect(() => {
    const el = vrCloseRef.current;
    if (!el || !infoHotspot) return undefined;

    const close = (event) => {
      event.stopPropagation();
      closeInfo();
    };

    el.addEventListener("click", close);
    return () => el.removeEventListener("click", close);
  }, [closeInfo, infoHotspot]);

  if (notice && !currentNode) {
    return (
      <main className={styles.shell}>
        <div className={styles.emptyState}>
          <p>{notice}</p>
        </div>
      </main>
    );
  }

  const skyRotation = `0 ${Number(currentNode?.initialRotation || 0)} 0`;
  const hotspots = Array.isArray(currentNode?.hotspots) ? currentNode.hotspots : [];

  return (
    <main
      ref={containerRef}
      className={`${styles.shell} ${cleanView ? styles.cleanView : ""}`}
      onDoubleClick={() => setCleanView((value) => !value)}
    >
      <div className={styles.viewer}>
        {aframeReady && currentNode ? (
          <a-scene
            ref={sceneRef}
            className={styles.scene}
            embedded
            renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true; sortObjects: true; precision: high"
            vr-mode-ui="enabled: false"
            loading-screen="enabled: false"
            device-orientation-permission-ui="enabled: true"
          >
            {imageBroken ? (
              <a-sky key={`fallback-${currentNode.id}`} color="#152230" rotation={skyRotation} />
            ) : (
              <a-sky
                key={`panorama-${currentNode.id}`}
                src={currentNode.panorama}
                rotation={skyRotation}
              />
            )}

            {hotspots.map((hotspot) => (
              <Hotspot key={hotspot.id} hotspot={hotspot} onActivate={activateHotspot} />
            ))}

            <a-entity id="tour-camera-rig" position="0 1.6 0">
              <a-camera
                id="tour-camera"
                fov="82"
                wasd-controls="enabled: false"
                look-controls="mouseEnabled: true; touchEnabled: true; magicWindowTrackingEnabled: true"
              >
                <a-cursor
                  fuse="true"
                  fuse-timeout={String(GAZE_MS)}
                  raycaster="objects: .hotspot"
                  material="color: #ffffff; shader: flat; opacity: 0.9"
                  geometry="primitive: ring; radiusInner: 0.012; radiusOuter: 0.02"
                  animation__fusing="property: scale; startEvents: fusing; easing: easeInQuad; dur: 1500; from: 1 1 1; to: 1.8 1.8 1.8"
                  animation__reset="property: scale; startEvents: mouseleave; dur: 120; to: 1 1 1"
                />
              </a-camera>
            </a-entity>
            {infoHotspot && infoPanelPose ? (
              <a-entity position={infoPanelPose} face-camera="">
                <a-plane
                  width="1.72"
                  height="1"
                  material="color: #071018; opacity: 0.88; transparent: true; shader: flat"
                />
                <a-text
                  value="Punto informativo"
                  align="center"
                  width="1.45"
                  color="#93cde7"
                  position="0 0.35 0.02"
                  material="shader: flat"
                />
                <a-text
                  value={fitText(infoHotspot.title || infoHotspot.label, 38)}
                  align="center"
                  width="1.52"
                  color="#ffffff"
                  position="0 0.19 0.02"
                  material="shader: flat"
                />
                <a-text
                  value={fitText(infoHotspot.description, 120)}
                  align="center"
                  width="1.42"
                  color="#dbeafe"
                  position="0 -0.06 0.02"
                  material="shader: flat"
                />
                <a-entity
                  ref={vrCloseRef}
                  className="hotspot"
                  position="0 -0.36 0.04"
                  geometry="primitive: circle; radius: 0.16"
                  material="color: #38bdf8; opacity: 0.95; transparent: true; shader: flat"
                  data-hotspot-id="cerrar-info-vr"
                >
                  <a-text
                    value="Cerrar"
                    align="center"
                    width="1"
                    color="#071018"
                    position="0 -0.025 0.01"
                    material="shader: flat"
                  />
                </a-entity>
              </a-entity>
            ) : null}
          </a-scene>
        ) : null}
      </div>

      <section className={styles.topBar} aria-label="Información del recorrido">
        <div className={styles.titleBlock}>
          <p className={styles.kicker}>Recorrido virtual urbano</p>
          <h1>{currentNode?.title || "Recorrido VR"}</h1>
          <p>{currentNode?.description || "Preparando escena 360."}</p>
          <div className={styles.instructions}>
            <span>Mira alrededor</span>
            <span>Selecciona un punto</span>
            <span>Mantén la mirada para avanzar</span>
          </div>
        </div>

        <div className={styles.controls} aria-label="Controles del visor">
          <button type="button" onClick={toggleFullscreen}>
            Pantalla completa
          </button>
          <button type="button" onClick={enterVr} disabled={!aframeReady}>
            VR/Cardboard
          </button>
          <button type="button" onClick={() => setCleanView((value) => !value)}>
            {cleanView ? "Mostrar UI" : "Vista limpia"}
          </button>
        </div>
      </section>

      {imageBroken ? (
        <div className={styles.fallbackNotice}>
          Panorama no disponible. Mostrando fondo de respaldo.
        </div>
      ) : null}

      {currentNode ? (
        <SceneMenu nodes={nodes} currentNodeId={currentNode.id} onSelect={changeScene} />
      ) : null}

      <InfoPanel hotspot={infoHotspot} onClose={closeInfo} />
      <LoadingScreen
        visible={loading || !aframeReady}
        message={!aframeReady ? "Iniciando visor VR" : "Cargando escena"}
      />
    </main>
  );
}
