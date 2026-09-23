// Clean Vietnamese Speech Synthesizer Engine with ElevenLabs AI Voice & Persistent IndexedDB Audio Cache

class AudioIndexedDB {
  constructor() {
    this.dbName = 'dincox_audio_cache_db';
    this.storeName = 'elevenlabs_audio_blobs';
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      req.onerror = (e) => reject(e);
    });
  }

  async getAudioBlob(key) {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async setAudioBlob(key, blob) {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put(blob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async clearAll() {
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.clear();
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      return false;
    }
  }
}

export const audioCacheDB = new AudioIndexedDB();

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
    this.audioCache = new Map(); // Memory Cache

    // ElevenLabs Config
    this.elevenLabsConfig = {
      apiKey: '',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      modelId: 'eleven_multilingual_v2',
      enabled: false,
      confirmBeforeApiCall: true
    };

    this.initVoices();
  }

  setElevenLabsConfig({ apiKey, voiceId, modelId, enabled, confirmBeforeApiCall }) {
    if (apiKey !== undefined) this.elevenLabsConfig.apiKey = apiKey.trim();
    if (voiceId !== undefined) this.elevenLabsConfig.voiceId = voiceId.trim() || '21m00Tcm4TlvDq8ikWAM';
    if (modelId !== undefined) this.elevenLabsConfig.modelId = modelId.trim() || 'eleven_multilingual_v2';
    if (enabled !== undefined) this.elevenLabsConfig.enabled = !!enabled;
    if (confirmBeforeApiCall !== undefined) this.elevenLabsConfig.confirmBeforeApiCall = !!confirmBeforeApiCall;
  }

  async fetchElevenLabsUserVoices(apiKey, filterVietnameseOnly = true) {
    const key = apiKey || this.elevenLabsConfig.apiKey;
    if (!key) return [];
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': key }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const allVoices = data.voices || [];

      if (!filterVietnameseOnly) return allVoices;

      // Strict Filter: Keep ONLY User Cloned Voices & Explicitly Tagged Vietnamese Voices
      return allVoices.filter(v => {
        const name = (v.name || '').toLowerCase();
        const category = (v.category || '').toLowerCase();
        const labels = JSON.stringify(v.labels || {}).toLowerCase();
        const verifiedLangs = JSON.stringify(v.verified_languages || []).toLowerCase();

        // 1. Keep user's custom cloned / generated voices from Voice Lab
        if (category.includes('cloned') || category.includes('generated') || category.includes('professional')) return true;

        // 2. Keep voices with explicit Vietnamese language/accent tag
        if (name.includes('viet') || name.includes('vn') || labels.includes('vietnam') || verifiedLangs.includes('vi')) return true;

        // Discard standard English premade voices (Roger, Sarah, Laura, Charlie, etc.)
        return false;
      });
    } catch (err) {
      console.error("Failed to fetch user voices from ElevenLabs:", err);
      return [];
    }
  }

  async fetchElevenLabsVietnameseSharedVoices(apiKey) {
    const key = apiKey || this.elevenLabsConfig.apiKey;
    try {
      const headers = key ? { 'xi-api-key': key } : {};
      const res = await fetch('https://api.elevenlabs.io/v1/shared-voices?language=vi&page_size=30', { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.voices || [];
    } catch (err) {
      console.warn("Could not fetch shared Vietnamese voices:", err);
      return [];
    }
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
      const cacheKey = `${voiceId}_${modelId}_${text.trim()}`;

      let audioUrl = null;

      // 1. Check RAM Memory Cache
      if (this.audioCache && this.audioCache.has(cacheKey)) {
        console.log("⚡ [Memory Cache Hit] Reusing loaded ElevenLabs audio! 0 Credits used.");
        audioUrl = this.audioCache.get(cacheKey);
        if (this.onStatusCallback) {
          this.onStatusCallback({ isCache: true, source: 'RAM Memory Cache', costCredits: 0, text });
        }
      } else {
        // 2. Check Permanent IndexedDB Storage (Persists across laptop shutdown!)
        const storedBlob = await audioCacheDB.getAudioBlob(cacheKey);
        if (storedBlob) {
          console.log("💾 [IndexedDB Cache Hit] Restored saved ElevenLabs audio from Disk Cache! 0 Credits used.");
          audioUrl = URL.createObjectURL(storedBlob);
          this.audioCache.set(cacheKey, audioUrl);
          if (this.onStatusCallback) {
            this.onStatusCallback({ isCache: true, source: 'IndexedDB Disk Cache', costCredits: 0, text });
          }
        } else {
          // 3. Fetch from ElevenLabs API (If not cached)
          if (this.elevenLabsConfig.confirmBeforeApiCall) {
            const cost = text.trim().length;
            const confirmMsg = `📡 [CẢNH BÁO TỐN CREDIT ELEVENLABS]\n\nCâu thoại này CHƯA CÓ trong bộ nhớ đệm (Cache) trên máy.\n\nSẽ cần khoảng ~${cost} Credit ElevenLabs để tạo tệp âm thanh mới cho câu thoại này.\n\n👉 Bạn có đồng ý gọi API ElevenLabs để tạo giọng AI không?\n(Nếu chọn Cancel / Hủy, hệ thống sẽ tự động phát bằng Giọng Mặc Định miễn phí của trình duyệt).`;
            const userAgreed = confirm(confirmMsg);
            if (!userAgreed) {
              console.log("User declined ElevenLabs API call for uncached text. Falling back to native TTS.");
              this.isSpeaking = false;
              return false;
            }
          }

          console.log("📡 [API Request] Fetching new speech audio from ElevenLabs...");
          if (this.onStatusCallback) {
            this.onStatusCallback({ isCache: false, source: 'ElevenLabs API', costCredits: text.trim().length, text });
          }
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
            let errDetail = `HTTP ${response.status}`;
            try {
              const errJson = await response.json();
              if (errJson.detail && errJson.detail.message) {
                errDetail = errJson.detail.message;
              } else if (errJson.message) {
                errDetail = errJson.message;
              }
            } catch (e) {}

            alert(`⚠️ Lỗi ElevenLabs API (${response.status}): ${errDetail}\n\nHệ thống sẽ tạm thời lùi về giọng đọc mặc định của trình duyệt.`);
            throw new Error(`ElevenLabs API ${response.status}: ${errDetail}`);
          }

          const audioBlob = await response.blob();
          audioUrl = URL.createObjectURL(audioBlob);

          // Save to RAM & Permanent IndexedDB Storage
          this.audioCache.set(cacheKey, audioUrl);
          await audioCacheDB.setAudioBlob(cacheKey, audioBlob);
        }
      }

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
