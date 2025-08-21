import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Part 1: APK Analyzer & Dev Emulator Types
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  icon?: ReactNode;
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


// --- NEW: LOW-CODE & IDE FEATURES ---
export type DataSourceType = 'rest' | 'postgres' | 'firestore';

interface BaseDataSource {
  id: string;
  name: string;
  type: DataSourceType;
}

export interface RestApiDataSource extends BaseDataSource {
  type: 'rest';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: ApiHeader[];
  authType: 'none' | 'bearer' | 'basic';
  bearerToken?: string;
  basicAuthUser?: string;
  basicAuthPass?: string;
}

export interface PostgresDataSource extends BaseDataSource {
    type: 'postgres';
    host: string;
    port: number;
    database: string;
    user: string;
}

export interface FirestoreDataSource extends BaseDataSource {
    type: 'firestore';
    projectId: string;
}

export type AnyDataSource = RestApiDataSource | PostgresDataSource | FirestoreDataSource;

export type BuildTarget = 'web' | 'android' | 'ios' | 'desktop';
export type BuildStatus = 'idle' | 'building' | 'success' | 'failed';
export interface BuildState {
    target: BuildTarget;
    status: BuildStatus;
    log: string[];
    outputUrl?: string;
    startTime?: number;
    endTime?: number;
}
// --- END: LOW-CODE & IDE FEATURES ---


// Part 2: Pro-Verve UI Builder Types
export type ProjectType = 'web' | 'native' | 'flutter' | 'kotlin';
export type AppMode = 'design' | 'logic' | 'code' | 'devtools';

export type NativeStyle = ViewStyle | TextStyle | ImageStyle;
export type FlutterStyle = { [key: string]: any };
export type KotlinStyle = { [key: string]: any };

export type WebStyle = React.CSSProperties & {
    // Transform properties for state management
    transformTranslateX?: string;
    transformTranslateY?: string;
    transformScale?: number;
    transformRotate?: string;
};

export type Style = WebStyle | NativeStyle | FlutterStyle | KotlinStyle;

export type ResponsiveStyles = {
  desktop: Style;
  tablet?: Style;
  mobile?: Style;
};

export type Viewport = 'desktop' | 'tablet' | 'mobile';

// --- NEW ADVANCED ANIMATION SYSTEM ---
export type AnimationTriggerType = 'onPageLoad' | 'onClick' | 'onHover' | 'onScrollView';

export interface AnimationKeyframe {
    id: string;
    properties: React.CSSProperties;
    duration: number; // in ms
    delay: number; // in ms
    easing: string;
}

export interface ElementAnimation {
    id: string;
    trigger: AnimationTriggerType;
    name: string;
    keyframes: AnimationKeyframe[];
}
// --- END NEW ANIMATION SYSTEM ---

export type ActionType = 
  | 'navigate_to_page' 
  | 'open_url' 
  | 'show_modal' 
  | 'hide_modal' 
  | 'toggle_modal'
  | 'set_state'
  | 'increment_state'
  | 'decrement_state'
  | 'toggle_state'
  | 'trigger_flow'
  | 'call_api';

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
    // Logic Flows
    flowId?: string;
    // API
    apiSourceId?: string;
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

export type ElementType = 'heading' | 'text' | 'button' | 'image' | 'container' | 'flex' | 'grid' | 'form' | 'input' | 'textarea' | 'label' | 'modal' | 'hero-section' | 'stats-section' | 'testimonial' | 'pricing-table' | 'View' | 'Text' | 'Image' | 'Button' | 'TextInput' | 'Container' | 'Column' | 'Row' | 'ElevatedButton' | 'component-instance' | 'icon' | 'card' | 'navbar' | 'video' | 'scrollView' | 'ARView' | 'footer' | 'custom-code' | 'link' | 'divider' | 'spacer' | 'tabs' | 'tab-panel' | 'badge' | 'list' | 'table' | 'chart' | 'progress-bar' | 'accordion' | 'slot';

export interface Element {
  id: string;
  type: ElementType;
  name:string;
  componentId?: string; // ID of the custom component this is an instance of
  snippetId?: string; // ID of the code snippet this element renders
  slotId?: string; // If this element is a slot definition
  slotTargetId?: string; // For an element inside an instance, which slot it targets
  content?: string;
  props?: { 
    [key: string]: any;
    src?: string;
    alt?: string;
    href?: string;
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
  animations?: ElementAnimation[];
  interactions?: ActionStep[];
  dataSource?: DataSource;
  conditionalDisplay?: ConditionalDisplay;
  isLocked?: boolean; 
  isHidden?: boolean; 
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

export interface MockApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  responseBody: string; // JSON string
}

// --- NEW LOGIC FLOW TYPES ---
export interface FlowHandle {
  id: string; name: string; type: 'exec' | 'data';
}
export interface FlowNode {
  id: string;
  type: string; // e.g., 'on-click', 'set-state', 'api-request'
  name: string;
  position: { x: number; y: number };
  inputs: FlowHandle[];
  outputs: FlowHandle[];
  data: { [key: string]: any };
}
export interface FlowConnection {
  id: string;
  sourceNodeId: string; sourceHandleId: string;
  targetNodeId: string; targetHandleId: string;
}
export interface LogicFlow {
  id: string;
  name: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
}
// --- END LOGIC FLOW TYPES ---

export interface Page {
  id: string;
  name: string;
  elements: Element[];
  dataState: { [key: string]: any }; // For API data
  stateDefinition: StateVariable[]; // For client-side logic
  apiDataSources: ApiDataSource[];
  logicFlows: LogicFlow[];
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'image';
  defaultValue: string | number | boolean;
  description?: string;
}

export interface ComponentSlot {
    id: string;
    name: string;
}

// --- NEW COMPONENT VARIANTS TYPES ---
export interface VariantOption {
  id: string;
  name: string;
}

export interface VariantPropertyGroup {
  id: string;
  name: string;
  options: VariantOption[];
}

export interface VariantStyleOverride {
  variantCombination: { [propertyId: string]: string }; // { propertyId: optionId }
  styles: ResponsiveStyles;
}
// --- END COMPONENT VARIANTS TYPES ---

export interface CustomComponent {
    id: string;
    name: string;
    icon: string;
    mainElement: Element;
    propsDefinition: PropDefinition[];
    slots: ComponentSlot[];
    // New Variant Properties
    variantProperties: VariantPropertyGroup[];
    variantStyleOverrides: VariantStyleOverride[];
    componentStateDefinition: StateVariable[];
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

export interface ThemeToken {
  id: string;
  name: string;
  value: string;
  description?: string;
}

export interface ThemeState {
    variables: { [key: string]: string };
    fonts: { primary: string; body: string };
    colors: ThemeToken[];
    fontSizes: ThemeToken[];
    spacing: ThemeToken[];
    radii: ThemeToken[];
    baseStyles: { [elementType: string]: Style };
    globalClasses: { [className: string]: Style };
}

export interface CopiedStyles {
    styles: ResponsiveStyles;
    tailwindClasses?: string;
    className?: string;
}

export interface Commit {
  id: string;
  message: string;
  timestamp: string;
  state: PresentState;
}

export interface MultiplayerCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}


export interface AppState {
  projectName: string;
  projectType: ProjectType;
  appMode: AppMode;
  previewMode: boolean;
  workspace: FileNode[];
  pages: Page[];
  dataSources: AnyDataSource[];
  buildState: BuildState;
  globalStateDefinition: StateVariable[]; 
  mockApiEndpoints: MockApiEndpoint[]; 
  customComponents: CustomComponent[];
  assets: Asset[];
  codeSnippets: CodeSnippet[];
  activePageId: string | null;
  selectedElementId: string | null;
  hoveredElementId: string | null; 
  editingComponentId: string | null;
  viewport: Viewport;
  theme: ThemeState;
  canvasWidth: number;
  canvasZoom: number;
  copiedStyles: CopiedStyles | null;
  altKeyPressed: boolean; 
  // Source Control
  unsavedChanges: number;
  commits: Commit[];
  // Panel & Window Management
  panelLayout: {
    leftSize: number;
    rightSize: number;
    bottomSize: number;
  };
  panels: {
    leftCollapsed: boolean;
    rightCollapsed: boolean;
    bottomActivePanel: 'terminal' | 'code' | null;
  };
  // Non-history state for live interactions
  multiplayerCursors: MultiplayerCursor[];
  runtimeState: { [key: string]: any };
  visibleModalIds: string[];
  history: {
    past: PresentState[];
    future: PresentState[];
  };
}

// The data part of the state, which is what we record in history.
export type PresentState = Omit<AppState, 'runtimeState' | 'history' | 'visibleModalIds' | 'copiedStyles' | 'altKeyPressed' | 'hoveredElementId' | 'unsavedChanges' | 'commits' | 'multiplayerCursors' | 'appMode' | 'previewMode' | 'panelLayout' | 'panels' | 'buildState'>;


// A recursive type for element templates that don't have IDs yet.
export type ElementTemplate = Omit<Element, 'id' | 'children' | 'type' | 'snippetId' | 'isLocked' | 'isHidden' | 'slotId' | 'slotTargetId'> & {
    type: string;
    children?: ElementTemplate[];
    icon?: ReactNode;
};

export type PageTemplate = { name: string; elements: ElementTemplate[] };

export interface ComponentDefinition {
  type: string;
  name: string;
  icon: ReactNode;
  category: string;
  defaultElement: ElementTemplate;
}

export interface Template {
  name: string;
  icon: ReactNode;
  category: string;
  elements: ElementTemplate[];
}

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Utility type for making all properties of an object readonly, recursively.
export type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};