// Audio and speech services
export class SpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Listen for voice list updates
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  speak(text: string, options: { rate?: number; pitch?: number; lang?: string } = {}) {
    // Stop current playback
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select appropriate voice
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en')
    );
    
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }
    
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1;
    utterance.lang = options.lang || 'en-US';
    
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }
}

// Simple audio manager for sound effects
export class AudioManager {
  private isMuted = false;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const settings = localStorage.getItem('audioSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.isMuted = parsed.isMuted || false;
    }
  }

  private saveSettings() {
    localStorage.setItem('audioSettings', JSON.stringify({
      isMuted: this.isMuted
    }));
  }

  async playAudio(url: string, volume = 1) {
    if (this.isMuted) return;

    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  playSuccessSound() {
    this.playAudio('/audio/success.mp3', 0.3);
  }

  playErrorSound() {
    this.playAudio('/audio/error.mp3', 0.3);
  }

  playLevelUpSound() {
    this.playAudio('/audio/levelup.mp3', 0.5);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    return this.isMuted;
  }

  get muted() {
    return this.isMuted;
  }
}

export const speechService = new SpeechService();
export const audioManager = new AudioManager();