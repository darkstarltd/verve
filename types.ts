
import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Part 1: APK Analyzer & Dev Emulator Types
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  icon?: string;
}

export interface ApkInfo {
  name: string;
  packageName: string;
  version: string;
  size: string;
  permissions: string[];
  minSdk: string;
  targetSdk: string;
  activities: string[];
  services: string[];
  receivers: string[];
  features: string[];
}

export interface BuildTool {
  name: string;
  version: string;
  status: 'installed' | 'missing' | 'outdated';
}

export interface DeviceInfo {
  name: string;
  id: string;
  platform: string;
  status: 'connected' | 'disconnected';
  apiLevel?: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  message: string;
  source: string;
}


// Part 2: Pro-Verve UI Builder Types
export type ProjectType = 'web' | 'native' | 'flutter' | 'kotlin';

export type NativeStyle = ViewStyle | TextStyle | ImageStyle;
export type FlutterStyle = { [key: string]: any };
export type KotlinStyle = { [key: string]: any };
export type Style = React.CSSProperties | NativeStyle | FlutterStyle | KotlinStyle;

export type ResponsiveStyles = {
  desktop: Style;
  tablet?: Style;
  mobile?: Style;
};

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export interface AnimationProperties {
  type: string;
  duration?: string;
  delay?: string;
}

export type ActionType = 
  | 'navigate_to_page' 
  | 'open_url' 
  | 'show_modal' 
  | 'hide_modal' 
  | 'toggle_modal'
  | 'set_state'
  | 'increment_state'
  | 'decrement_state'
  | 'toggle_state';

export interface ActionStep {
  type: ActionType;
  payload: {
    // Navigation
    pageId?: string;
    url?: string;
    // Modals
    modalId?: string;
    // State
    stateKey?: string;
    value?: string | number | boolean;
  };
}


export interface ConditionalDisplay {
    stateKey: string;
    operator: '===' | '!==' | '>' | '<' | '>=' | '<=';
    value: string | number | boolean;
}

export interface DataSource {
  content?: string; // One-way binding (e.g., text content)
  bindValue?: string; // Two-way binding key (e.g., for input values)
  repeat?: {
    dataKey: string;
    itemName: string;
  };
}

export interface Element {
  id: string;
  type: 'heading' | 'text' | 'button' | 'image' | 'container' | 'flex' | 'grid' | 'form' | 'input' | 'textarea' | 'label' | 'modal' | 'hero-section' | 'stats-section' | 'testimonial' | 'pricing-table' | 'View' | 'Text' | 'Image' | 'Button' | 'TextInput' | 'Container' | 'Column' | 'Row' | 'ElevatedButton' | 'component-instance' | 'icon' | 'card' | 'navbar' | 'video' | 'scrollView' | 'ARView' | 'footer';
  name:string;
  componentId?: string; // ID of the custom component this is an instance of
  content?: string;
  props?: { 
    [key: string]: any;
    src?: string;
    alt?: string;
    placeholder?: string;
    value?: string;
    htmlFor?: string;
    className?: string; // For applying global CSS classes
    // Icon props
    iconSet?: 'md' | 'fa';
    iconName?: string;
    size?: number;
    color?: string;
  };
  children?: Element[];
  styles: ResponsiveStyles;
  tailwindClasses?: string;
  animation?: AnimationProperties;
  interactions?: ActionStep[];
  dataSource?: DataSource;
  conditionalDisplay?: ConditionalDisplay;
}

export type StateVariableType = 'string' | 'number' | 'boolean';

export interface StateVariable {
    name: string;
    type: StateVariableType;
    initialValue: string | number | boolean;
}

export interface ApiHeader {
  id: string;
  key: string;
  value: string;
}

export interface ApiDataSource {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers: ApiHeader[];
}


export interface Page {
  id: string;
  name: string;
  elements: Element[];
  dataState: { [key: string]: any }; // For API data
  stateDefinition: StateVariable[]; // For client-side logic
  apiDataSources: ApiDataSource[];
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'image';
  defaultValue: string | number | boolean;
}

export interface CustomComponent {
    id: string;
    name: string;
    icon: string;
    mainElement: Element;
    propsDefinition: PropDefinition[];
    defaultData: { [key: string]: any };
}

export interface Asset {
    id: string;
    name:string;
    url: string; // Base64 data URL
}

export interface CodeSnippet {
    id: string;
    name: string;
    language: string;
    content: string;
}

export interface ThemeState {
    variables: { [key: string]: string };
    baseStyles: { [elementType: string]: Style };
    globalClasses: { [className: string]: Style };
}

export interface AppState {
  projectName: string;
  projectType: ProjectType;
  pages: Page[];
  customComponents: CustomComponent[];
  assets: Asset[];
  codeSnippets: CodeSnippet[];
  activePageId: string | null;
  selectedElementId: string | null;
  editingComponentId: string | null;
  viewport: Viewport;
  theme: ThemeState;
  canvasWidth: number;
  // Non-history state for live interactions
  runtimeState: { [key: string]: any };
  visibleModalIds: string[];
  history: {
    past: PresentState[];
    future: PresentState[];
  };
}

// The data part of the state, which is what we record in history.
export type PresentState = Omit<AppState, 'runtimeState' | 'history' | 'visibleModalIds'>;


// A recursive type for element templates that don't have IDs yet.
export type ElementTemplate = Omit<Element, 'id' | 'dataSource' | 'children' | 'type' | 'conditionalDisplay'> & {
    type: string;
    children?: ElementTemplate[];
    icon?: ReactNode;
};


export interface ComponentDefinition {
  type: string;
  name: string;
  icon: ReactNode;
  category: string;
  defaultElement: ElementTemplate;
}

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;