/**
 * ============================================================================
 * MÓDULO DE ÁUDIO (WEB AUDIO API) — 100% OFFLINE
 * ============================================================================
 * Responsável pela síntese de efeitos sonoros educativos sem dependência de
 * arquivos externos de áudio ou servidor local (compatível com file://).
 *
 * Expõe a API pública em window.SaudeEscola.Audio.
 */
(function (global) {
  'use strict';

  var SaudeEscola = global.SaudeEscola = global.SaudeEscola || {};

  // Estado interno encapsulado para evitar poluição do escopo global
  var audioCtx = null;
  var soundEnabled = true;

  /**
   * Obtém ou inicializa sob demanda o contexto de áudio do navegador.
   * A criação tardia respeita políticas de autoplay e reativa o contexto
   * caso esteja suspenso antes da primeira interação na lousa ou tela.
   *
   * @returns {AudioContext|null} Instância ativa do AudioContext ou null se indisponível.
   */
  function getAudioContext() {
    if (!audioCtx) {
      var AudioContextClass = global.AudioContext || global.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Informa se os efeitos sonoros estão ativados no momento.
   *
   * @returns {boolean} true quando o som está ligado; false quando mudo.
   */
  function isEnabled() {
    return soundEnabled;
  }

  /**
   * Sintetiza uma nota musical simples com envelope suave de ataque e decaimento.
   *
   * @param {number} freq - Frequência da nota em Hertz (Hz).
   * @param {string} type - Forma de onda do oscilador ('sine', 'triangle', etc.).
   * @param {number} duration - Duração da nota em segundos.
   * @param {number} [delay=0] - Atraso inicial em segundos relativo ao tempo atual.
   * @param {number} [volume=0.16] - Ganho máximo do envelope (0.0 a 1.0).
   */
  function playTone(freq, type, duration, delay, volume) {
    if (typeof delay === 'undefined') {
      delay = 0;
    }
    if (typeof volume === 'undefined') {
      volume = 0.16;
    }

    if (!soundEnabled) {
      return;
    }

    var ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    var startTime = ctx.currentTime + delay;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Inicia em 0.001 (não zero) porque rampas exponenciais da Web Audio API exigem valores positivos
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /**
   * Reproduz um clique curto e suave para interações de botão e lousa touch.
   */
  function playClick() {
    playTone(520, 'sine', 0.08, 0, 0.14);
  }

  /**
   * Reproduz um som leve de "pop" ao selecionar sílabas, letras ou cartas.
   */
  function playPop() {
    playTone(660, 'triangle', 0.1, 0, 0.16);
  }

  /**
   * Reproduz um acorde alegre ascendente (Dó - Mi - Sol - Dó) para acertos.
   */
  function playSuccess() {
    playTone(523.25, 'triangle', 0.14, 0.00, 0.18);
    playTone(659.25, 'triangle', 0.14, 0.10, 0.18);
    playTone(783.99, 'triangle', 0.16, 0.20, 0.18);
    playTone(1046.50, 'sine', 0.35, 0.30, 0.22);
  }

  /**
   * Reproduz um som acolhedor de incentivo quando a criança precisa tentar de novo,
   * evitando efeito sonoro punitivo.
   */
  function playEncourage() {
    playTone(392.00, 'sine', 0.16, 0.00, 0.15);
    playTone(440.00, 'sine', 0.24, 0.14, 0.15);
  }

  /**
   * Reproduz uma fanfarra comemorativa de 6 notas ao concluir fases ou desafios.
   */
  function playFanfare() {
    var notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    var times = [0, 0.12, 0.24, 0.36, 0.52, 0.66];
    for (var i = 0; i < notes.length; i++) {
      playTone(notes[i], 'triangle', 0.22, times[i], 0.2);
    }
  }

  /**
   * Alterna entre som ligado e mudo, atualizando o ícone SVG e o rótulo na interface.
   * Reproduz um clique de confirmação quando o áudio é reativado.
   */
  function toggle() {
    soundEnabled = !soundEnabled;

    if (typeof document !== 'undefined') {
      var iconEl = document.getElementById('soundIcon');
      var svgs = SaudeEscola.WordBank && SaudeEscola.WordBank.SVGS;
      if (iconEl && svgs) {
        iconEl.innerHTML = soundEnabled ? svgs.SOUND_ON : svgs.SOUND_OFF;
      }

      var labelEl = document.getElementById('soundLabel');
      if (labelEl) {
        labelEl.textContent = soundEnabled ? 'SOM LIGADO' : 'SOM MUDO';
      }
    }

    if (soundEnabled) {
      playClick();
    }
  }

  // API pública do módulo de áudio
  SaudeEscola.Audio = {
    isEnabled: isEnabled,
    playTone: playTone,
    playClick: playClick,
    playPop: playPop,
    playSuccess: playSuccess,
    playEncourage: playEncourage,
    playFanfare: playFanfare,
    toggle: toggle
  };
})(typeof window !== 'undefined' ? window : globalThis);
