import { render, screen } from '@testing-library/react';
import { fireEvent, act } from '@testing-library/react';
import NativeInput from './NativeInput';

function getInput() {
  return screen.getByPlaceholderText('Type');
}

function fireInput(el, { data, inputType = 'insertText' }) {
  fireEvent.input(el, { data, target: { value: data ?? '' }, nativeEvent: { data, inputType } });
}

test('typing a valid zhuyin character fires onSymbol with that character', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  fireInput(getInput(), { data: 'ㄚ' });
  expect(onSymbol).toHaveBeenCalledTimes(1);
  expect(onSymbol).toHaveBeenCalledWith('ㄚ');
});

test('typing an invalid character (letter) does not call onSymbol', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  fireInput(getInput(), { data: 'a' });
  expect(onSymbol).not.toHaveBeenCalled();
});

test('typing a tone mark fires onSymbol with the mark', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  fireInput(getInput(), { data: 'ˊ' });
  expect(onSymbol).toHaveBeenCalledWith('ˊ');
});

test('typing a period (".") is treated as the neutral tone mark "˙"', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  fireInput(getInput(), { data: '.' });
  expect(onSymbol).toHaveBeenCalledTimes(1);
  expect(onSymbol).toHaveBeenCalledWith('˙');
});

test('mixed valid+invalid string dispatches only valid characters in order', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  fireInput(getInput(), { data: 'aㄇbㄚ' });
  expect(onSymbol).toHaveBeenCalledTimes(2);
  expect(onSymbol).toHaveBeenNthCalledWith(1, 'ㄇ');
  expect(onSymbol).toHaveBeenNthCalledWith(2, 'ㄚ');
});

test('Backspace keydown calls onBackspace', () => {
  const onBackspace = jest.fn();
  render(<NativeInput onSymbol={() => {}} onBackspace={onBackspace} disabled={false} promptId="p1" placeholder="Type" />);
  fireEvent.keyDown(getInput(), { key: 'Backspace' });
  expect(onBackspace).toHaveBeenCalledTimes(1);
});

test('Other keys (Enter, ArrowLeft) do not call onBackspace', () => {
  const onBackspace = jest.fn();
  render(<NativeInput onSymbol={() => {}} onBackspace={onBackspace} disabled={false} promptId="p1" placeholder="Type" />);
  fireEvent.keyDown(getInput(), { key: 'Enter' });
  fireEvent.keyDown(getInput(), { key: 'ArrowLeft' });
  expect(onBackspace).not.toHaveBeenCalled();
});

test('disabled blocks all callbacks', () => {
  const onSymbol = jest.fn();
  const onBackspace = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={onBackspace} disabled={true} promptId="p1" placeholder="Type" />);
  fireInput(getInput(), { data: 'ㄚ' });
  fireEvent.keyDown(getInput(), { key: 'Backspace' });
  expect(onSymbol).not.toHaveBeenCalled();
  expect(onBackspace).not.toHaveBeenCalled();
});

test('input is cleared after each input event so the field stays empty', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  const input = getInput();
  fireInput(input, { data: 'ㄚ' });
  expect(input.value).toBe('');
});

test('insertCompositionText input events are ignored during composition', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  const input = getInput();
  fireEvent.compositionStart(input, { data: '' });
  fireInput(input, { data: 'ㄇ', inputType: 'insertCompositionText' });
  expect(onSymbol).not.toHaveBeenCalled();
});

test('compositionEnd commits the full string and clears the field', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  const input = getInput();
  fireEvent.compositionStart(input, { data: '' });
  fireInput(input, { data: 'ㄇ', inputType: 'insertCompositionText' });
  fireEvent.compositionEnd(input, { data: 'ㄇㄚ' });
  expect(onSymbol).toHaveBeenCalledTimes(2);
  expect(onSymbol).toHaveBeenNthCalledWith(1, 'ㄇ');
  expect(onSymbol).toHaveBeenNthCalledWith(2, 'ㄚ');
  expect(input.value).toBe('');
});

test('after compositionEnd, subsequent insertText events are processed again', () => {
  const onSymbol = jest.fn();
  render(<NativeInput onSymbol={onSymbol} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  const input = getInput();
  fireEvent.compositionStart(input, { data: '' });
  fireEvent.compositionEnd(input, { data: 'ㄇ' });
  fireInput(input, { data: 'ㄚ' });
  expect(onSymbol).toHaveBeenCalledTimes(2);
  expect(onSymbol).toHaveBeenNthCalledWith(1, 'ㄇ');
  expect(onSymbol).toHaveBeenNthCalledWith(2, 'ㄚ');
});

test('auto-focuses on mount', () => {
  render(<NativeInput onSymbol={() => {}} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  expect(getInput()).toHaveFocus();
});

test('re-focuses when promptId changes', () => {
  const { rerender } = render(<NativeInput onSymbol={() => {}} onBackspace={() => {}} disabled={false} promptId="p1" placeholder="Type" />);
  const input = getInput();
  act(() => { input.blur(); });
  expect(input).not.toHaveFocus();
  rerender(<NativeInput onSymbol={() => {}} onBackspace={() => {}} disabled={false} promptId="p2" placeholder="Type" />);
  expect(input).toHaveFocus();
});
