"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hotspot from "./Hotspot";
import InfoPanel from "./InfoPanel";
import LoadingScreen from "./LoadingScreen";
import SceneMenu from "./SceneMenu";
import styles from "./RecorridoVR.module.css";

const TOUR_URL = "/vr/data/tour.json";
const GAZE_MS = 1500;
const SCENE_FADE_MS = 2300;

function preloadPanorama(src) {
  if (!src) return Promise.resolve(false);

  return new Promise((resolve) => {
    let done = false;
    const image = new Image();
    const finish = (loaded) => {
      if (done) return;
      done = true;
      window.clearTimeout(timeout);
      resolve(loaded);
    };
    const timeout = window.setTimeout(() => finish(false), 1800);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = src;
  });
}

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

function registerPlaceInFrontOfCamera() {
  const aframe = window.AFRAME;
  if (!aframe || aframe.components["place-in-front-of-camera"]) return;

  aframe.registerComponent("place-in-front-of-camera", {
    schema: {
      distance: { type: "number", default: 2.2 },
    },
    init() {
      this.position = new aframe.THREE.Vector3();
      this.direction = new aframe.THREE.Vector3();

      const place = () => {
        const camera = this.el.sceneEl?.camera;
        if (!camera) return;

        camera.getWorldPosition(this.position);
        camera.getWorldDirection(this.direction);
        this.position.add(this.direction.multiplyScalar(this.data.distance));
        this.el.object3D.position.copy(this.position);
      };

      requestAnimationFrame(() => requestAnimationFrame(place));
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
  const audioRef = useRef(null);
  const vrCloseRef = useRef(null);
  const clickAudioRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const changingSceneRef = useRef(false);
  const lastActivationRef = useRef({ id: "", time: 0 });
  const [aframeReady, setAframeReady] = useState(false);
  const [tour, setTour] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState("");
  const [infoHotspot, setInfoHotspot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageBroken, setImageBroken] = useState(false);
  const [notice, setNotice] = useState("");
  const [cleanView, setCleanView] = useState(false);
  const [isVrMode, setIsVrMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [transitionName, setTransitionName] = useState("");

  useEffect(() => {
    let mounted = true;

    import("aframe")
      .then(() => {
        if (!mounted) return;
        registerFaceCamera();
        registerPlaceInFrontOfCamera();
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
  }, []);

  const playAudio = useCallback(() => {
    audioRef.current
      ?.play()
      .then(() => setAudioEnabled(true))
      .catch(() => setAudioEnabled(false));
  }, []);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      playAudio();
      return;
    }

    audio.pause();
    setAudioEnabled(false);
  }, [playAudio]);

  const playClick = useCallback(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = clickAudioRef.current || new AudioContext();
    clickAudioRef.current = context;
    context.resume?.();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.08);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.09);
  }, []);

  useEffect(() => {
    closeInfo();
  }, [currentNodeId, closeInfo]);

  useEffect(() => {
    if (!currentNode) return undefined;

    let alive = true;
    let done = false;
    const started = Date.now();
    const minTransitionMs = SCENE_FADE_MS;

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
    async (nodeId) => {
      const nextNode = nodesById[nodeId];
      if (!nextNode || nodeId === currentNodeId || changingSceneRef.current) return;

      changingSceneRef.current = true;
      window.clearTimeout(transitionTimerRef.current);
      setTransitionName(`Entrando a ${nextNode.title}`);
      setLoading(true);
      await Promise.all([
        preloadPanorama(nextNode.panorama),
        new Promise((resolve) => window.setTimeout(resolve, SCENE_FADE_MS)),
      ]);
      setCurrentNodeId(nodeId);
      window.setTimeout(() => {
        changingSceneRef.current = false;
      }, SCENE_FADE_MS);
      transitionTimerRef.current = window.setTimeout(() => {
        setTransitionName("");
      }, SCENE_FADE_MS);
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
      playClick();

      if (hotspot.type === "navigation") {
        changeScene(hotspot.target);
        return;
      }

      setInfoHotspot(hotspot);
    },
    [changeScene, playClick],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      return;
    }

    document.exitFullscreen?.();
  }, []);

  const enterVr = useCallback(() => {
    playAudio();
    sceneRef.current?.enterVR?.();
  }, [playAudio]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    const enter = () => {
      setIsVrMode(true);
      playAudio();
    };
    const exit = () => setIsVrMode(false);

    scene.addEventListener("enter-vr", enter);
    scene.addEventListener("exit-vr", exit);
    return () => {
      scene.removeEventListener("enter-vr", enter);
      scene.removeEventListener("exit-vr", exit);
    };
  }, [aframeReady, playAudio]);

  useEffect(() => {
    if (isVrMode) playAudio();
  }, [isVrMode, playAudio]);

  useEffect(() => {
    return () => {
      window.clearTimeout(transitionTimerRef.current);
      clickAudioRef.current?.close?.();
    };
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
      <audio ref={audioRef} src="/Sudo.mp3" loop preload="auto" />
      <div className={styles.viewer}>
        {aframeReady && currentNode ? (
          <a-scene
            ref={sceneRef}
            className={styles.scene}
            embedded
            renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true; sortObjects: true; precision: high; clearColor: #000000"
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
            {infoHotspot ? (
              <a-entity
                key={infoHotspot.id}
                place-in-front-of-camera="distance: 2.2"
                face-camera=""
              >
                <a-plane
                  width="1.72"
                  height="0.92"
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
                  position="0 -0.66 0.06"
                  geometry="primitive: circle; radius: 0.2"
                  material="color: #38bdf8; opacity: 0.95; transparent: true; shader: flat"
                  data-hotspot-id="cerrar-info-vr"
                >
                  <a-text
                    value="Cerrar"
                    align="center"
                    width="1.15"
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
          <button type="button" onClick={toggleAudio}>
            {audioEnabled ? "Pausar audio" : "Audio"}
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

      {transitionName ? <div className={styles.transitionName}>{transitionName}</div> : null}

      {currentNode ? (
        <SceneMenu nodes={nodes} currentNodeId={currentNode.id} onSelect={changeScene} />
      ) : null}

      {!isVrMode ? <InfoPanel hotspot={infoHotspot} onClose={closeInfo} /> : null}
      <LoadingScreen
        visible={loading || !aframeReady}
        message={!aframeReady ? "Iniciando visor VR" : "Cargando escena"}
      />
    </main>
  );
}
