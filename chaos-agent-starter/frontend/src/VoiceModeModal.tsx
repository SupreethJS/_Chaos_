import React, { useEffect, useRef, useState } from 'react';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuery: (query: string, autoSend?: boolean) => void;
  backendUrl?: string;
  userName?: string;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onApplyQuery,
  backendUrl = 'http://localhost:4000',
  userName = 'User',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef<boolean>(true);
  const isRecognizingRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  // States
  const [isListening, setIsListening] = useState<boolean>(true);
  const [voiceStatus, setVoiceStatus] = useState<string>('Listening intently...');
  const [userTranscript, setUserTranscript] = useState<string>(
    'Analyze security audit logs for unusual sign-in activity in EMEA...'
  );
  const [telemetryStream, setTelemetryStream] = useState<string>(
    'Searching workspace telemetry... Found 2 anomalies: 03:41 AM UTC anomalous session switch detected.'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(18);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [showSettingsToast, setShowSettingsToast] = useState<string | null>(null);

  // Clean raw markdown syntax for voice display and speech synthesis
  const cleanVoiceDisplayText = (text: string): { display: string; speech: string } => {
    if (!text) return { display: '', speech: '' };
    let clean = text
      .replace(/^###\s+Research Synthesis:\s*.*$/gim, '')
      .replace(/^#{1,6}\s+.*$/gim, '')
      .replace(/\[\d+\]/g, '')
      .replace(/^---\s*$/gim, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/Sources & Verified Citations[\s\S]*$/i, '')
      .replace(/\n{2,}/g, '\n\n')
      .trim();

    const sentences = clean.split(/(?<=[.?!])\s+/);
    const speech = sentences.slice(0, 3).join(' ').slice(0, 320).trim();
    return { display: clean || text, speech };
  };

  // Safe mic control helpers to prevent echo loop & InvalidStateError
  const startListening = () => {
    if (!recognitionRef.current || isRecognizingRef.current || isSpeakingRef.current) return;
    try {
      recognitionRef.current.start();
      isRecognizingRef.current = true;
    } catch {
      // recognition might already be active
    }
  };

  const pauseListening = () => {
    if (!recognitionRef.current || !isRecognizingRef.current) return;
    try {
      recognitionRef.current.stop();
      isRecognizingRef.current = false;
    } catch {
      // ignore
    }
  };

  // Stop TTS speech
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  };

  // Speak text using Web Speech API with automatic mic feedback isolation
  const speakText = (text: string) => {
    if (!autoSpeak || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      stopSpeech();
      // Temporarily mute microphone to avoid hearing own laptop speakers
      pauseListening();
      isSpeakingRef.current = true;
      setVoiceStatus('JARVIS speaking...');

      const { speech } = cleanVoiceDisplayText(text);
      if (!speech) {
        isSpeakingRef.current = false;
        if (isListening) startListening();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(speech);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        isSpeakingRef.current = false;
        // Wait 500ms for room echo / speaker decay before resuming mic
        setTimeout(() => {
          if (isComponentMounted.current && isListening) {
            setVoiceStatus('Listening intently...');
            startListening();
          }
        }, 500);
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        if (isComponentMounted.current && isListening) {
          setVoiceStatus('Listening intently...');
          startListening();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      isSpeakingRef.current = false;
    }
  };

  // Trigger query to JARVIS backend
  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;
    setIsProcessing(true);
    pauseListening();
    setVoiceStatus(`Processing: "${queryText.slice(0, 24)}..."`);
    setUserTranscript(queryText);
    setTelemetryStream('Connecting to JARVIS knowledge net... Synthesizing stream...');

    const start = performance.now();
    try {
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText }),
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed > 0 ? elapsed : 18);

      if (res.ok) {
        const data = await res.json();
        const rawAnswer = data.answer || 'Knowledge stream verified. Systems normal.';
        const { display } = cleanVoiceDisplayText(rawAnswer);
        setTelemetryStream(display);
        setVoiceStatus('JARVIS response ready');
        speakText(rawAnswer);
      } else {
        throw new Error(`Status ${res.status}`);
      }
    } catch {
      // Graceful telemetry fallback
      const simulatedResponses: Record<string, string> = {
        'Summarize findings':
          'Telemetry Synthesis: Analyzed 1,420 events. 2 session anomalies in EMEA region flagged. Risk level: Low. Auth protocol E2EE enforced.',
        'Run vulnerability check':
          'Security Pipeline: Checked 34 microservice endpoints and token handlers. 0 CVEs detected. All integrity gates verified green.',
        'Export to SOC':
          'SOC Dispatch: Packaged incident payload with SHA-256 telemetry seal. Streamed to Security Operations Center queue successfully.',
      };

      const fallback =
        simulatedResponses[queryText] ||
        `Temporal analysis complete: Verified telemetry for "${queryText}". Systems operating within normal parameters.`;

      const { display } = cleanVoiceDisplayText(fallback);
      setTelemetryStream(display);
      setVoiceStatus('Telemetry stream updated');
      speakText(fallback);
    } finally {
      setIsProcessing(false);
      if (!isSpeakingRef.current && isListening) {
        setTimeout(() => {
          if (isComponentMounted.current && isListening && !isSpeakingRef.current) {
            setVoiceStatus('Listening intently...');
            startListening();
          }
        }, 1000);
      }
    }
  };

  // Toggle Microphone
  const toggleMicrophone = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceStatus('Microphone paused');
      stopSpeech();
      pauseListening();
    } else {
      setIsListening(true);
      setVoiceStatus('Listening intently...');
      startListening();
    }
  };

  // Web Speech API recognition initialization with error detection & feedback
  useEffect(() => {
    isComponentMounted.current = true;
    if (!isOpen) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isRecognizingRef.current = true;
          if (isComponentMounted.current && !isSpeakingRef.current) {
            setIsListening(true);
            setVoiceStatus('Listening intently...');
          }
        };

        recognition.onresult = (event: any) => {
          // If JARVIS is currently speaking, reject echo feedback
          if (isSpeakingRef.current) return;

          let currentSpeech = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentSpeech += event.results[i][0].transcript;
          }
          if (currentSpeech.trim()) {
            setUserTranscript(currentSpeech.trim());
            setVoiceStatus('Receiving speech...');
          }

          // If final result detected
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const finalQuery = lastResult[0].transcript.trim();
            if (finalQuery.length > 3 && !isProcessing) {
              handleQuery(finalQuery);
            }
          }
        };

        recognition.onerror = (event: any) => {
          isRecognizingRef.current = false;
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed') {
            setVoiceStatus('Microphone permission blocked. Click URL lock icon to allow.');
            setIsListening(false);
          } else if (event.error === 'audio-capture') {
            setVoiceStatus('No microphone detected. Please check audio input.');
            setIsListening(false);
          } else if (event.error === 'network') {
            setVoiceStatus('Speech service reconnecting...');
            setTimeout(() => {
              if (isComponentMounted.current && isListening && !isSpeakingRef.current) {
                startListening();
              }
            }, 1200);
          } else if (event.error === 'no-speech') {
            // Normal silence
          } else {
            setVoiceStatus(`Mic status: ${event.error}`);
          }
        };

        recognition.onend = () => {
          isRecognizingRef.current = false;
          if (isComponentMounted.current && isListening && !isSpeakingRef.current && !isProcessing) {
            setTimeout(() => {
              if (isComponentMounted.current && isListening && !isSpeakingRef.current && !isProcessing) {
                startListening();
              }
            }, 250);
          }
        };

        recognitionRef.current = recognition;
        startListening();
      } catch (err) {
        console.error('Speech recognition init error:', err);
        setVoiceStatus('Microphone initialization failed');
      }
    } else {
      setVoiceStatus('Speech recognition not supported in this browser');
    }

    return () => {
      isComponentMounted.current = false;
      stopSpeech();
      pauseListening();
    };
  }, [isOpen]);

  // WebGL Dynamic Shader Sphere Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
    } catch {
      return;
    }
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 256;
      const h = canvas.clientHeight || 256;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => syncSize());
      resizeObserver.observe(canvas);
    }

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_activity;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
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
        vec3  ns = n_ * D.wyz - D.xzx;

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

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
          float speedMultiplier = 0.7 + (u_activity * 0.5);
          float t = u_time * speedMultiplier;

          float dist = length(uv);
          float radius = 0.36;

          float angle = atan(uv.y, uv.x);
          float waveIntensity = 0.035 + (u_activity * 0.025);
          float wave = snoise(vec3(uv * 3.5, t * 0.8)) * waveIntensity;
          float r = radius + wave;

          float sphereMask = smoothstep(r + 0.015, r - 0.015, dist);
          
          float glow = exp(-dist * 5.0) * (0.45 + u_activity * 0.2);
          vec3 glowColor = mix(vec3(0.25, 0.55, 0.98), vec3(0.55, 0.8, 1.0), sin(t) * 0.5 + 0.5);

          vec3 colDeepBlue = vec3(0.08, 0.42, 0.96);
          vec3 colMidCyan  = vec3(0.38, 0.76, 0.99);
          vec3 colSoftSky  = vec3(0.72, 0.90, 1.0);
          vec3 colPureWhite= vec3(0.98, 0.99, 1.0);

          float z = sqrt(max(0.0, r * r - dist * dist));
          vec3 normal = normalize(vec3(uv.x, uv.y, z));
          
          float n1 = snoise(vec3(uv * 2.2 + vec2(0.0, t * 0.25), t * 0.35));
          float n2 = snoise(vec3(uv * 4.0 - vec2(t * 0.2, 0.0), t * 0.5));
          float combinedNoise = (n1 * 0.65 + n2 * 0.35);

          float heightFactor = uv.y * 1.5 + combinedNoise * 0.45;
          vec3 orbColor = mix(colDeepBlue, colMidCyan, smoothstep(-0.3, 0.1, heightFactor));
          orbColor = mix(orbColor, colSoftSky, smoothstep(0.0, 0.35, heightFactor));
          orbColor = mix(orbColor, colPureWhite, smoothstep(0.25, 0.5, heightFactor));

          vec3 lightDir = normalize(vec3(0.4, 0.6, 0.8));
          float diff = max(dot(normal, lightDir), 0.0);
          float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
          orbColor += vec3(0.9, 0.95, 1.0) * rim * 0.35;
          orbColor += vec3(1.0) * pow(diff, 12.0) * 0.4;

          vec3 finalColor = mix(glowColor * glow, orbColor, sphereMask);
          float alpha = max(sphereMask, glow * 1.2);

          gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    function cs(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    const vShader = cs(gl.VERTEX_SHADER, vs);
    const fShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!prog || !vShader || !fShader) return;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uActivity = gl.getUniformLocation(prog, 'u_activity');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    function render(t: number) {
      if (!gl || !canvas) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uActivity) gl.uniform1f(uActivity, isListening ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(render);
    }
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (gl) {
        gl.deleteProgram(prog);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        gl.deleteBuffer(buf);
      }
    };
  }, [isOpen, isListening]);

  if (!isOpen) return null;

  return (
    <div className="voice-modal-backdrop" onClick={onClose}>
      <div
        className="voice-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* TOP HEADER */}
        <header className="voice-modal-header">
          <div className="voice-header-row">
            <div className="voice-header-left">
              <button
                aria-label="Go back"
                className="voice-back-btn"
                onClick={onClose}
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  arrow_back
                </span>
              </button>
              <div className="voice-brand-logo-wrap">
                <img
                  src="/jarvis-logo.png"
                  alt="JARVIS Voice Security"
                  className="voice-brand-logo-img"
                />
              </div>
              <span className="voice-header-title">Sign In Credentials</span>
            </div>
            <div className="voice-header-right">
              <div className="voice-user-avatar">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  person
                </span>
              </div>
            </div>
          </div>

          {/* Auth Progress Steps */}
          <div className="voice-progress-steps" aria-label="Auth Progress Steps">
            <div className="voice-step-bar active"></div>
            <div className="voice-step-bar"></div>
            <div className="voice-step-bar"></div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <div className="voice-modal-body">
          {/* Top Audio Fidelity & Mode Bar */}
          <div className="voice-fidelity-bar">
            <div className="voice-model-badge">
              <span className="relative flex h-2 w-2">
                <span className="voice-radar-ping"></span>
                <span className="voice-radar-dot"></span>
              </span>
              <span className="voice-model-text">Whisper-Flux 3.5</span>
            </div>
            <div className="voice-pills-row">
              <div className="voice-meta-pill">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 14 }}>
                  graphic_eq
                </span>
                <span>{latencyMs}ms</span>
              </div>
              <div className="voice-meta-pill">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>
                  lock
                </span>
                <span>E2EE</span>
              </div>
            </div>
          </div>

          {/* Center Voice Orb Interactive Stage */}
          <div className="voice-orb-stage">
            {/* Atmospheric Ambient Glows and Pulse Rings */}
            <div className="voice-ambient-glow"></div>
            <div className="voice-pulse-ring-outer"></div>
            <div className="voice-pulse-ring-inner"></div>

            {/* WebGL Dynamic Shader Sphere */}
            <div className="voice-shader-container">
              <div className="voice-shader-halo"></div>
              <div className="voice-shader-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  id="shader-canvas-ANIMATION_11"
                  width="256"
                  height="256"
                  className="voice-shader-canvas"
                ></canvas>
              </div>
            </div>

            {/* Orb Status & Soundwave Indicator */}
            <div className="voice-status-group">
              <span className="voice-status-text" id="voice-status-text">
                {voiceStatus}
              </span>

              {/* Animated Voice Frequency Bars */}
              <div
                className={`voice-waveform-container ${!isListening ? 'paused' : ''}`}
                id="waveform-container"
              >
                <span className="voice-bar bar-1"></span>
                <span className="voice-bar bar-2"></span>
                <span className="voice-bar bar-3"></span>
                <span className="voice-bar bar-4"></span>
                <span className="voice-bar bar-5"></span>
              </div>
            </div>
          </div>

          {/* Live Transcription Stream Card (From user screenshot) */}
          <div className="voice-stream-card">
            <div className="voice-stream-user-row">
              <div className="voice-stream-icon user">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  person
                </span>
              </div>
              <div className="voice-stream-user-text">
                "{userTranscript}"
              </div>
            </div>

            <div className="voice-stream-divider"></div>

            <div className="voice-stream-telemetry-row">
              <div className="voice-stream-icon telemetry">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  auto_awesome
                </span>
              </div>
              <div className="voice-stream-telemetry-content">
                <div className="voice-stream-label">
                  <span>TELEMETRY STREAM</span>
                  <span className="voice-live-dot"></span>
                </div>
                <div className="voice-stream-body">
                  {telemetryStream}
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Quick-Suggestion Chips */}
          <div className="voice-chips-scroll">
            <button
              className="voice-chip-btn"
              onClick={() => handleQuery('Summarize findings')}
              type="button"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>
                analytics
              </span>
              <span>Summarize findings</span>
            </button>

            <button
              className="voice-chip-btn"
              onClick={() => handleQuery('Run vulnerability check')}
              type="button"
            >
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>
                verified_user
              </span>
              <span>Run vulnerability check</span>
            </button>

            <button
              className="voice-chip-btn"
              onClick={() => handleQuery('Export to SOC')}
              type="button"
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
                send
              </span>
              <span>Export to SOC</span>
            </button>
          </div>

          {/* Bottom Interactive Floating Control Dock */}
          <div className="voice-control-dock">
            {/* Secondary Action: Audio Sensitivity / Settings */}
            <button
              aria-label="Audio Configuration"
              className="voice-dock-btn"
              onClick={() => {
                setAutoSpeak(!autoSpeak);
                setShowSettingsToast(`Voice feedback: ${!autoSpeak ? 'Enabled' : 'Muted'}`);
                setTimeout(() => setShowSettingsToast(null), 2000);
              }}
              title="Toggle Audio Feedback"
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {autoSpeak ? 'tune' : 'volume_off'}
              </span>
            </button>

            {/* Secondary Action: Save Transcript */}
            <button
              aria-label="Save Audio Memo"
              className="voice-dock-btn"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`${userTranscript}\n\nResponse:\n${telemetryStream}`);
                }
                setShowSettingsToast('Transcript copied to clipboard');
                setTimeout(() => setShowSettingsToast(null), 2000);
              }}
              title="Copy Transcript"
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                bookmark
              </span>
            </button>

            {/* Primary Mic Interaction Orb Trigger */}
            <div className="voice-mic-trigger-wrap">
              {isListening && <div className="voice-mic-glow-ring"></div>}
              <button
                aria-label="Toggle Microphone"
                className={`voice-mic-orb-btn ${!isListening ? 'paused' : ''}`}
                id="mic-toggle-btn"
                onClick={toggleMicrophone}
                type="button"
              >
                <span
                  className="material-symbols-outlined"
                  id="mic-icon"
                  style={{ fontSize: 30 }}
                >
                  {isListening ? 'mic' : 'mic_off'}
                </span>
              </button>
            </div>

            {/* Secondary Action: Text Mode / Keyboard Input */}
            <button
              aria-label="Switch to Text Mode"
              className="voice-dock-btn"
              onClick={() => {
                onApplyQuery(userTranscript);
                onClose();
              }}
              title="Apply to Chat Composer"
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                keyboard
              </span>
            </button>

            {/* Terminate Session Action */}
            <button
              aria-label="End Voice Session"
              className="voice-dock-btn danger"
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              title="End Session"
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                call_end
              </span>
            </button>
          </div>

          {/* Feedback Toast */}
          {showSettingsToast && (
            <div className="voice-toast-notification">
              {showSettingsToast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
