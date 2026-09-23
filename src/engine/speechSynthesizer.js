// Clean Vietnamese Speech Synthesizer Engine with ElevenLabs AI Voice Support

export class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.activeUtterance = null; // Retain reference to prevent Chrome GC bug
    this.activeAudio = null; // ElevenLabs HTML5 Audio element
    this.onLipSyncCallback = null;
    this.onEndCallback = null;
    this.speechAnimFrame = null;
    this.simulatedVolume = 0;

    // ElevenLabs Config
    this.elevenLabsConfig = {
      apiKey: '',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      modelId: 'eleven_multilingual_v2',
      enabled: false
    };

    this.initVoices();
  }

  setElevenLabsConfig({ apiKey, voiceId, enabled }) {
    if (apiKey !== undefined) this.elevenLabsConfig.apiKey = apiKey.trim();
    if (voiceId !== undefined) this.elevenLabsConfig.voiceId = voiceId.trim() || '21m00Tcm4TlvDq8ikWAM';
    if (enabled !== undefined) this.elevenLabsConfig.enabled = !!enabled;
  }

  initVoices() {
    if (!this.synth) return;
    const load = () => {
      this.voices = this.synth.getVoices();
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  getVietnameseVoice(gender = 'female') {
    if (this.synth && (!this.voices || !this.voices.length)) {
      this.voices = this.synth.getVoices();
    }

    const viVoices = this.voices.filter(v => v.lang.toLowerCase().includes('vi'));
    if (viVoices.length > 0) {
      if (gender === 'male') {
        const maleVi = viVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('hoai'));
        if (maleVi) return maleVi;
      } else {
        const femaleVi = viVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('nu') || v.name.toLowerCase().includes('an'));
        if (femaleVi) return femaleVi;
      }
      return viVoices[0];
    }

    return this.voices[0] || null;
  }

  async speak(text, options = {}) {
    this.stop();

    const { pitch = 1.0, rate = 1.0, gender = 'female', onLipSync, onEnd } = options;
    this.onLipSyncCallback = onLipSync;
    this.onEndCallback = onEnd;

    // Option 1: ElevenLabs AI Voice
    if (this.elevenLabsConfig.enabled && this.elevenLabsConfig.apiKey) {
      const success = await this.speakElevenLabs(text);
      if (success) return;
      console.warn("ElevenLabs TTS failed, falling back to Native WebSpeech.");
    }

    // Option 2: Fallback to Native Browser WebSpeech API
    this.speakNative(text, pitch, rate, gender);
  }

  async speakElevenLabs(text) {
    try {
      this.isSpeaking = true;
      const { apiKey, voiceId, modelId } = this.elevenLabsConfig;

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API HTTP Error ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;

      const startTime = Date.now();

      const updateLipSync = () => {
        if (!this.isSpeaking || !this.activeAudio) return;

        const elapsed = (Date.now() - startTime) / 1000;
        const vol = Math.max(0.15, Math.abs(Math.sin(elapsed * 14) * Math.cos(elapsed * 9) * 0.85 + Math.random() * 0.25));
        this.simulatedVolume = vol;

        if (this.onLipSyncCallback) {
          this.onLipSyncCallback(vol);
        }

        this.speechAnimFrame = requestAnimationFrame(updateLipSync);
      };

      audio.onended = () => {
        if (this.isSpeaking) {
          this.stop();
          if (this.onEndCallback) this.onEndCallback();
        }
      };

      audio.onerror = (err) => {
        console.warn("ElevenLabs Audio playback error:", err);
        this.stop();
      };

      await audio.play();
      updateLipSync();
      return true;
    } catch (err) {
      console.error("ElevenLabs TTS Exception:", err);
      return false;
    }
  }

  speakNative(text, pitch, rate, gender) {
    let finalPitch = pitch;
    let finalRate = rate;
    if (gender === 'male') {
      finalPitch = Math.min(pitch, 0.8);
      finalRate = Math.min(rate, 0.95);
    } else {
      finalPitch = Math.max(pitch, 1.1);
      finalRate = Math.max(rate, 1.05);
    }

    this.isSpeaking = true;

    const startTime = Date.now();
    const estDuration = Math.max(3000, (text.length * 75) / finalRate);

    const updateLipSync = () => {
      if (!this.isSpeaking) return;

      const elapsed = Date.now() - startTime;
      if (elapsed >= estDuration && !this.synth?.speaking) {
        this.stop();
        if (this.onEndCallback) this.onEndCallback();
        return;
      }

      const sec = elapsed / 1000;
      const vol = Math.max(0.15, Math.abs(Math.sin(sec * 14) * Math.cos(sec * 9) * 0.85 + Math.random() * 0.25));
      this.simulatedVolume = vol;

      if (this.onLipSyncCallback) {
        this.onLipSyncCallback(vol);
      }

      this.speechAnimFrame = requestAnimationFrame(updateLipSync);
    };

    if (this.synth) {
      try {
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.pitch = finalPitch;
        utterance.rate = finalRate;

        const voice = this.getVietnameseVoice(gender);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => {
          if (this.isSpeaking) {
            this.stop();
            if (this.onEndCallback) this.onEndCallback();
          }
        };

        utterance.onerror = (e) => {
          console.warn("Speech error:", e);
        };

        this.activeUtterance = utterance;
        this.synth.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis error:", err);
      }
    }

    updateLipSync();
  }

  stop() {
    this.isSpeaking = false;
    this.simulatedVolume = 0;
    this.activeUtterance = null;

    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }

    if (this.speechAnimFrame) {
      cancelAnimationFrame(this.speechAnimFrame);
      this.speechAnimFrame = null;
    }

    if (this.onLipSyncCallback) {
      this.onLipSyncCallback(0);
    }
  }
}

export const speechEngine = new SpeechEngine();
