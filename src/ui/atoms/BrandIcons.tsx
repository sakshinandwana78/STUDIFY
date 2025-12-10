import React from 'react';
import { Svg, Rect, Path, Polyline, Line } from 'react-native-svg';
import { theme } from '../tokens/theme';

type IconProps = {
  size?: number;
  strokeColor?: string;
  fillColor?: string;
  accentColor?: string;
  strokeWidth?: number;
};

const defaults = {
  size: 24,
  // Dark blue for clear, high-contrast line icons
  strokeColor: '#033545',
  // Use no fill to achieve simple line icon style
  fillColor: 'none',
  // Keep accents consistent with the main stroke color
  accentColor: '#033545',
  strokeWidth: 2,
};

export const StartLessonIcon: React.FC<IconProps> = (props) => {
  const { size, strokeColor, fillColor, accentColor, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={16} height={14} rx={3} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      <Line x1={12} y1={5} x2={12} y2={19} stroke={strokeColor} strokeWidth={strokeWidth} />
      {/* Accent bookmark */}
      <Path d="M7 6 v5 l2 -1 l2 1 V6" fill={accentColor} stroke={strokeColor} strokeWidth={1} />
    </Svg>
  );
};

export const TakeQuizIcon: React.FC<IconProps> = (props) => {
  const { size, strokeColor, fillColor, accentColor, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Clipboard */}
      <Rect x={6} y={7} width={12} height={12} rx={3} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      <Rect x={9} y={4} width={6} height={4} rx={2} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      {/* Quiz lines */}
      <Line x1={9} y1={12} x2={15} y2={12} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1={9} y1={15} x2={15} y2={15} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Accent check */}
      <Polyline points="7,12 8,13 10,11" fill="none" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const DownloadOfflineIcon: React.FC<IconProps> = (props) => {
  const { size, strokeColor, fillColor, accentColor, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={6} y={16} width={12} height={3} rx={1.2} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      <Path d="M12 4 v7" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Polyline points="8,10 12,14 16,10" fill="none" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const ARPlayerIcon: React.FC<IconProps> = (props) => {
  const { size, strokeColor, fillColor, accentColor, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Cube */}
      <Path d="M12 5 L17 8 V13 L12 16 L7 13 V8 Z" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      <Line x1={12} y1={5} x2={12} y2={16} stroke={strokeColor} strokeWidth={strokeWidth} />
      {/* Accent face edge */}
      <Line x1={17} y1={8} x2={12} y2={11} stroke={accentColor} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const TeacherReportsIcon: React.FC<IconProps> = (props) => {
  const { size, strokeColor, fillColor, accentColor, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={10} width={3} height={6} rx={1} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      <Rect x={10} y={8} width={3} height={8} rx={1} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      <Rect x={15} y={6} width={3} height={10} rx={1} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
      {/* Accent baseline */}
      <Line x1={5} y1={18} x2={20} y2={18} stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const AdminFlagsIcon: React.FC<IconProps> = (props) => {
  const { size, strokeColor, fillColor, accentColor, strokeWidth } = { ...defaults, ...props };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={6} y1={5} x2={6} y2={19} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 6 H17 L15 9 L17 12 H9 Z" fill={accentColor} stroke={strokeColor} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export type BrandIconName = 'StartLesson' | 'TakeQuiz' | 'DownloadOffline' | 'ARPlayer' | 'TeacherReports' | 'AdminFlags';

export const BrandIcons = {
  StartLesson: StartLessonIcon,
  TakeQuiz: TakeQuizIcon,
  DownloadOffline: DownloadOfflineIcon,
  ARPlayer: ARPlayerIcon,
  TeacherReports: TeacherReportsIcon,
  AdminFlags: AdminFlagsIcon,
};
