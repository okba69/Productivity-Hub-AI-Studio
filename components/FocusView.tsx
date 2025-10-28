
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Task, SubTask } from '../types';
import { useTimer } from '../hooks/useTimer';
import { Icon } from './Icon';

interface FocusViewProps {
  task: Task;
  onClose: () => void;
  onSessionComplete: (timeSpentInSeconds: number) => void;
  updateTask: (task: Task) => void;
}

const POMODORO_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;

// Sounds are now embedded as Base64 Data URIs to prevent any CORS issues.
const ambientSounds = [
    { name: 'Pluie', src: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATEFGgA/+xJ8ecAAR8AAAAIAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/86aUAAAQkdIbEFRgAAEACCQkBERUIcADkgyAAAAExf/9A5r/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJ-AQDAAABpAAAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' },
    { name: 'Café', src: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATEFGgA/+xJ8ecAAR8AAAAIAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/86aUAAAQkdIbEFRgAAEACCQkBERUIcADkgyAAAAExf/9A5r/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/-AQDAAABpAAAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' },
    { name: 'Forêt', src: 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATEFGgA/+xJ8ecAAR8AAAAIAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/86aUAAAQkdIbEFRgAAEACCQkBERUIcADkgyAAAAExf/9A5r/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/9AJr/-AQDAAABpAAAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' }
];

const SubtasksPanel: React.FC<{
    subTasks: SubTask[];
    onAdd: (text: string) => void;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}> = ({ subTasks, onAdd, onToggle, onDelete }) => {
    const [newSubTaskText, setNewSubTaskText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubTaskText.trim()) {
            onAdd(newSubTaskText.trim());
            setNewSubTaskText('');
        }
    };
    
    return (
        <div className="w-full max-w-lg mx-auto p-4">
             <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 text-center">Objectifs de la session</h3>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newSubTaskText}
                  onChange={(e) => setNewSubTaskText(e.target.value)}
                  placeholder="Ajouter un sous-objectif..."
                  className="flex-grow bg-gray-200 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent-blue focus:border-accent-blue"
                />
                <button type="submit" className="bg-accent-blue text-white p-2 rounded-md hover:bg-blue-500 shrink-0">
                    <Icon name="plus" className="w-5 h-5" />
                </button>
            </form>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {subTasks.map(st => (
                   <div key={st.id} className="flex items-center justify-between bg-gray-200 dark:bg-gray-900/50 p-2 rounded-md">
                       <div className="flex items-center gap-2">
                           <input type="checkbox" checked={st.completed} onChange={() => onToggle(st.id)} className="form-checkbox h-4 w-4 rounded bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-accent-blue focus:ring-accent-blue shrink-0" />
                           <span className={`text-sm ${st.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{st.text}</span>
                       </div>
                       <button onClick={() => onDelete(st.id)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white shrink-0">
                           &times;
                       </button>
                   </div>
                ))}
            </div>
        </div>
    );
};

const SoundsPanel: React.FC<{
    activeSoundName: string | null;
    onToggle: (sound: { name: string, src: string }) => void;
}> = ({ activeSoundName, onToggle }) => {
    return (
        <div className="w-full max-w-lg mx-auto p-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 text-center">Ambiance sonore</h3>
            <div className="flex justify-center gap-2 flex-wrap">
                {ambientSounds.map(sound => (
                    <button key={sound.name} onClick={() => onToggle(sound)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeSoundName === sound.name ? 'bg-accent-purple text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {sound.name}
                    </button>
                ))}
            </div>
        </div>
    );
};


export const FocusView: React.FC<FocusViewProps> = ({ task, onClose, onSessionComplete, updateTask }) => {
  const [sessionType, setSessionType] = useState<'focus' | 'break' | 'complete'>('focus');
  const timerDuration = useMemo(() => sessionType === 'focus' ? POMODORO_DURATION_SECONDS : BREAK_DURATION_SECONDS, [sessionType]);
  const { secondsLeft, isActive, start, pause, reset } = useTimer(timerDuration);
  
  const [subTasks, setSubTasks] = useState<SubTask[]>(task.subTasks || []);
  const [activeSoundName, setActiveSoundName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [activeTool, setActiveTool] = useState<'subtasks' | 'sounds' | null>(null);

  useEffect(() => {
    start();
  }, []);
  
  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
      if (secondsLeft === 0 && isActive) {
          pause();
          if (sessionType === 'focus') {
              onSessionComplete(POMODORO_DURATION_SECONDS);
              try { new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3').play(); } catch(e) { console.error(e); }
              setSessionType('break');
              reset(BREAK_DURATION_SECONDS);
              start();
          } else if (sessionType === 'break') {
              setSessionType('complete');
          }
      }
  }, [isActive, secondsLeft, onSessionComplete, pause, reset, sessionType, start]);

  const handleUpdateSubtasks = (newSubTasks: SubTask[]) => {
      setSubTasks(newSubTasks);
      updateTask({ ...task, subTasks: newSubTasks });
  };

  const handleAddSubTask = (text: string) => {
      handleUpdateSubtasks([...subTasks, { id: Date.now(), text, completed: false }]);
  };

  const handleToggleSubTask = (id: number) => {
      handleUpdateSubtasks(subTasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };
  
  const handleDeleteSubTask = (id: number) => {
      handleUpdateSubtasks(subTasks.filter(st => st.id !== id));
  };

  const toggleSound = (sound: { name: string; src: string }) => {
    // Stop any currently playing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If the intention was to stop the sound, we're done.
    if (activeSoundName === sound.name) {
      setActiveSoundName(null);
    } else {
      // Otherwise, start the new sound.
      const newAudio = new Audio(sound.src);
      newAudio.loop = true;
      
      const playPromise = newAudio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully.
            audioRef.current = newAudio;
            setActiveSoundName(sound.name);
          })
          .catch(error => {
            console.error("La lecture audio a échoué:", error);
            // Ensure state is clean on failure.
            setActiveSoundName(null);
          });
      }
    }
  };

  const handleToolToggle = (tool: 'subtasks' | 'sounds') => {
      setActiveTool(current => current === tool ? null : tool);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((timerDuration - secondsLeft) / timerDuration) * 100;
  
  if (sessionType === 'complete') {
      return (
          <div className="fixed inset-0 bg-gray-100 dark:bg-[#121212] flex flex-col items-center justify-center text-center text-gray-900 dark:text-white z-50">
              <Icon name="star" className="w-16 h-16 text-accent-yellow mb-6"/>
              <h2 className="text-4xl font-bold">Session terminée !</h2>
              <p className="mt-4 text-lg opacity-80">Excellent travail. Vous pouvez retourner au tableau de bord.</p>
              <button onClick={onClose} className="mt-12 bg-gray-500/20 dark:bg-white/20 hover:bg-gray-500/30 dark:hover:bg-white/30 font-semibold py-3 px-8 rounded-lg transition-colors">
                  Retour au Dashboard
              </button>
          </div>
      );
  }

  const progressColor = sessionType === 'focus' ? 'bg-accent-purple' : 'bg-accent-green';

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-[#121212] flex flex-col items-center justify-center p-4 z-50 text-gray-900 dark:text-white">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 dark:text-white/70 hover:text-gray-800 dark:hover:text-white z-20">
        <Icon name="close" className="w-8 h-8" />
      </button>

      <div className="w-full max-w-2xl flex flex-col items-center flex-grow justify-center text-center">
        <p className={`mb-2 font-semibold ${sessionType === 'focus' ? 'text-accent-purple' : 'text-accent-green'}`}>
            {sessionType === 'focus' ? 'Concentration' : 'Pause'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-10">{task.title}</h1>
        
        <div className="font-mono text-8xl md:text-9xl font-bold tracking-widest my-4">
            {formatTime(secondsLeft)}
        </div>

        <div className="w-full my-8">
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                <div 
                    className={`${progressColor} h-3 rounded-full transition-all duration-500 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={isActive ? pause : start}
                className="bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 w-40 justify-center"
            >
                <Icon name={isActive ? 'pause' : 'play'} className="w-5 h-5" />
                <span>{isActive ? 'Pause' : 'Reprendre'}</span>
            </button>
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
          <div className={`bg-white/70 dark:bg-[#1E1E1E]/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 w-full transition-all duration-300 ease-in-out ${activeTool ? 'max-h-80' : 'max-h-0'}`}>
              <div className={`transition-opacity duration-300 ${activeTool ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {activeTool === 'subtasks' && <SubtasksPanel subTasks={subTasks} onAdd={handleAddSubTask} onToggle={handleToggleSubTask} onDelete={handleDeleteSubTask} />}
                  {activeTool === 'sounds' && <SoundsPanel activeSoundName={activeSoundName} onToggle={toggleSound} />}
              </div>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-2 rounded-t-xl">
              <button onClick={() => handleToolToggle('subtasks')} className={`p-2 rounded-full transition-colors ${activeTool === 'subtasks' ? 'bg-accent-blue text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
                  <Icon name="list" className="w-6 h-6" />
              </button>
              <button onClick={() => handleToolToggle('sounds')} className={`p-2 rounded-full transition-colors ${activeTool === 'sounds' ? 'bg-accent-blue text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 5.858a9 9 0 0112.728 0m-12.728 0a9 9 0 010 12.728m-2.828-9.9a5 5 0 010-7.072m0 7.072a5 5 0 010 7.072" /></svg>
              </button>
          </div>
      </div>
    </div>
  );
};