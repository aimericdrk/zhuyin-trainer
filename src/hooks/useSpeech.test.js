import { render, act, screen } from '@testing-library/react';
import { useSpeech } from './useSpeech';

function makeVoice(lang, name = lang) {
  return { lang, name, default: false, localService: true, voiceURI: name };
}

function installSynthMock(voices) {
  const listeners = {};
  const speakCalls = [];
  let cancelCalls = 0;
  let currentUtterance = null;
  const synth = {
    getVoices: () => voices,
    speak: (u) => {
      speakCalls.push(u);
      currentUtterance = u;
    },
    cancel: () => {
      cancelCalls += 1;
      currentUtterance = null;
    },
    addEventListener: (evt, cb) => { listeners[evt] = cb; },
    removeEventListener: (evt) => { delete listeners[evt]; },
    set onvoiceschanged(cb) { listeners.voiceschanged = cb; },
  };
  global.window.speechSynthesis = synth;
  global.window.SpeechSynthesisUtterance = function Utterance(text) {
    this.text = text;
    this.lang = '';
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  };
  return {
    fireVoicesChanged: () => listeners.voiceschanged && listeners.voiceschanged(),
    triggerStart: () => currentUtterance && currentUtterance.onstart && currentUtterance.onstart(),
    triggerEnd: () => currentUtterance && currentUtterance.onend && currentUtterance.onend(),
    getSpeakCalls: () => speakCalls,
    getCancelCalls: () => cancelCalls,
  };
}

function uninstallSynthMock() {
  delete global.window.speechSynthesis;
  delete global.window.SpeechSynthesisUtterance;
}

function Probe({ onReady }) {
  const speech = useSpeech();
  onReady(speech);
  return (
    <div>
      <p data-testid="supported">{String(speech.supported)}</p>
      <p data-testid="speakingId">{speech.speakingId ?? ''}</p>
    </div>
  );
}

describe('useSpeech', () => {
  afterEach(() => {
    uninstallSynthMock();
  });

  test('supported is false when speechSynthesis is missing', () => {
    uninstallSynthMock();
    let captured;
    render(<Probe onReady={(s) => { captured = s; }} />);
    expect(screen.getByTestId('supported').textContent).toBe('false');
    expect(captured.supported).toBe(false);
  });

  test('supported is false when only non-zh voices exist', () => {
    installSynthMock([makeVoice('en-US'), makeVoice('fr-FR')]);
    render(<Probe onReady={() => {}} />);
    expect(screen.getByTestId('supported').textContent).toBe('false');
  });

  test('supported becomes true after voiceschanged delivers a zh-TW voice', () => {
    const ctrl = installSynthMock([]);
    render(<Probe onReady={() => {}} />);
    expect(screen.getByTestId('supported').textContent).toBe('false');
    global.window.speechSynthesis.getVoices = () => [makeVoice('zh-TW')];
    act(() => { ctrl.fireVoicesChanged(); });
    expect(screen.getByTestId('supported').textContent).toBe('true');
  });

  test('speak cancels current speech and defers speak() to a new task (Chrome cancel-speak race workaround)', () => {
    jest.useFakeTimers();
    try {
      const zhTW = makeVoice('zh-TW');
      const ctrl = installSynthMock([makeVoice('en-US'), zhTW, makeVoice('zh-CN')]);
      let captured;
      render(<Probe onReady={(s) => { captured = s; }} />);
      act(() => { captured.speak('媽', { id: 'headline' }); });
      // Cancel runs synchronously, speak is deferred.
      expect(ctrl.getCancelCalls()).toBe(1);
      expect(ctrl.getSpeakCalls()).toHaveLength(0);
      // Advance the deferred speak.
      act(() => { jest.advanceTimersByTime(150); });
      const calls = ctrl.getSpeakCalls();
      expect(calls).toHaveLength(1);
      expect(calls[0].text).toBe('媽');
      expect(calls[0].lang).toBe('zh-TW');
      expect(calls[0].voice).toBe(zhTW);
    } finally {
      jest.useRealTimers();
    }
  });

  test('rapid clicks coalesce: only the latest deferred speak runs', () => {
    jest.useFakeTimers();
    try {
      const ctrl = installSynthMock([makeVoice('zh-TW')]);
      let captured;
      render(<Probe onReady={(s) => { captured = s; }} />);
      // Three clicks within one task — only the last should actually be spoken.
      act(() => {
        captured.speak('媽', { id: 'a' });
        captured.speak('馬', { id: 'b' });
        captured.speak('嗎', { id: 'c' });
      });
      // Three cancels, zero speaks yet.
      expect(ctrl.getCancelCalls()).toBe(3);
      expect(ctrl.getSpeakCalls()).toHaveLength(0);
      act(() => { jest.advanceTimersByTime(150); });
      const calls = ctrl.getSpeakCalls();
      expect(calls).toHaveLength(1);
      expect(calls[0].text).toBe('嗎');
    } finally {
      jest.useRealTimers();
    }
  });

  test('speakingId reflects the currently-playing target and clears on end', () => {
    jest.useFakeTimers();
    try {
      installSynthMock([makeVoice('zh-TW')]);
      let captured;
      render(<Probe onReady={(s) => { captured = s; }} />);
      const ctrl = {
        triggerStart: () => global.window.speechSynthesis._lastUtter && global.window.speechSynthesis._lastUtter.onstart && global.window.speechSynthesis._lastUtter.onstart(),
        triggerEnd: () => global.window.speechSynthesis._lastUtter && global.window.speechSynthesis._lastUtter.onend && global.window.speechSynthesis._lastUtter.onend(),
      };
      const origSpeak = global.window.speechSynthesis.speak;
      global.window.speechSynthesis.speak = function (u) {
        global.window.speechSynthesis._lastUtter = u;
        return origSpeak.call(this, u);
      };
      act(() => { captured.speak('媽', { id: 'a' }); });
      act(() => { jest.advanceTimersByTime(150); });
      act(() => { ctrl.triggerStart(); });
      expect(screen.getByTestId('speakingId').textContent).toBe('a');
      act(() => { ctrl.triggerEnd(); });
      expect(screen.getByTestId('speakingId').textContent).toBe('');
    } finally {
      jest.useRealTimers();
    }
  });

  test('second speak before first ends switches speakingId to the new target', () => {
    jest.useFakeTimers();
    try {
      installSynthMock([makeVoice('zh-TW')]);
      let captured;
      render(<Probe onReady={(s) => { captured = s; }} />);
      const origSpeak = global.window.speechSynthesis.speak;
      global.window.speechSynthesis.speak = function (u) {
        global.window.speechSynthesis._lastUtter = u;
        return origSpeak.call(this, u);
      };
      act(() => { captured.speak('媽', { id: 'a' }); });
      act(() => { jest.advanceTimersByTime(150); });
      act(() => { global.window.speechSynthesis._lastUtter.onstart(); });
      expect(screen.getByTestId('speakingId').textContent).toBe('a');
      act(() => { captured.speak('馬', { id: 'b' }); });
      act(() => { jest.advanceTimersByTime(150); });
      act(() => { global.window.speechSynthesis._lastUtter.onstart(); });
      expect(screen.getByTestId('speakingId').textContent).toBe('b');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('useSpeech rate parameter', () => {
  function installRateSynth() {
    const speakCalls = [];
    const synth = {
      getVoices: () => [makeVoice('zh-TW')],
      speak: (u) => { speakCalls.push(u); },
      cancel: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      set onvoiceschanged(_) {},
    };
    global.window.speechSynthesis = synth;
    global.window.SpeechSynthesisUtterance = function Utterance(text) {
      this.text = text;
      this.lang = '';
      this.voice = null;
      this.rate = 1;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    };
    return { getSpeakCalls: () => speakCalls };
  }

  test('speak sets utterance.rate from the rate parameter', () => {
    jest.useFakeTimers();
    try {
      const ctrl = installRateSynth();
      let captured;
      function RateProbe({ rate }) {
        const speech = useSpeech({ rate });
        captured = speech;
        return null;
      }
      render(<RateProbe rate={0.6} />);
      act(() => { captured.speak('媽', { id: 'a' }); });
      act(() => { jest.advanceTimersByTime(150); });
      const calls = ctrl.getSpeakCalls();
      expect(calls).toHaveLength(1);
      expect(calls[0].rate).toBeCloseTo(0.6, 5);
    } finally {
      jest.useRealTimers();
    }
  });

  test('rate change after mount is picked up on the next speak call', () => {
    jest.useFakeTimers();
    try {
      const ctrl = installRateSynth();
      let captured;
      function RateProbe({ rate }) {
        const speech = useSpeech({ rate });
        captured = speech;
        return null;
      }
      const { rerender } = render(<RateProbe rate={1.0} />);
      act(() => { captured.speak('媽', { id: 'a' }); });
      act(() => { jest.advanceTimersByTime(150); });
      rerender(<RateProbe rate={0.5} />);
      act(() => { captured.speak('馬', { id: 'b' }); });
      act(() => { jest.advanceTimersByTime(150); });
      const calls = ctrl.getSpeakCalls();
      expect(calls).toHaveLength(2);
      expect(calls[0].rate).toBeCloseTo(1.0, 5);
      expect(calls[1].rate).toBeCloseTo(0.5, 5);
    } finally {
      jest.useRealTimers();
    }
  });

  test('useSpeech() with no args still works (default rate)', () => {
    jest.useFakeTimers();
    try {
      const ctrl = installRateSynth();
      let captured;
      function Probe() {
        const speech = useSpeech();
        captured = speech;
        return null;
      }
      render(<Probe />);
      act(() => { captured.speak('媽', { id: 'a' }); });
      act(() => { jest.advanceTimersByTime(150); });
      const calls = ctrl.getSpeakCalls();
      expect(calls).toHaveLength(1);
      expect(calls[0].rate).toBeCloseTo(1.0, 5);
    } finally {
      jest.useRealTimers();
    }
  });
});
