import { Element, Page, Style, ProjectType, NativeStyle, FlutterStyle, KotlinStyle, CustomComponent, ResponsiveStyles, ThemeState, ApiDataSource } from '../types';
import { mergeElements } from './treeUtils';

const ANIMATION_KEYFRAMES = `/* ... animations ... */`;

function toKebabCase(str: string) { return str.replace(/([a-z09]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase(); }

function styleObjectToString(styles?: Style): string {
    if (!styles) return '';
    return Object.entries(styles).map(([key, value]) => {
      const kebabKey = toKebabCase(key);
      return `  ${kebabKey}: ${value};`;
    }).join('\n');
}

function generateElementCss(element: Element, cssMap: Map<string, string[]>, customComponents: CustomComponent[], theme: ThemeState): void {
  const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
  const resolvedElement = mainComponent ? mergeElements(mainComponent.mainElement, element) : element;

  const { styles, animation } = resolvedElement;

  const desktopStyles = styleObjectToString(styles.desktop);
  if (desktopStyles) {
    const selector = `.el-${element.id}`;
    if (!cssMap.has(selector)) cssMap.set(selector, []);
    cssMap.get(selector)!.push(desktopStyles);
  }
  
  if (animation?.type && animation.type !== 'none') {
    const selector = `.el-${element.id}`;
    const animationStyles = `  animation: ${animation.type} ${animation.duration || '1s'} ${animation.delay || '0s'} forwards;`;
    if (!cssMap.has(selector)) cssMap.set(selector, []);
    cssMap.get(selector)!.push(animationStyles);
  }

  if (styles.tablet) {
    const tabletStyles = styleObjectToString(styles.tablet);
    if(tabletStyles) {
        const selector = `@media (max-width: 768px) {\n  .el-${element.id}`;
        if (!cssMap.has(selector)) cssMap.set(selector, []);
        cssMap.get(selector)!.push(tabletStyles);
    }
  }

  if (styles.mobile) {
      const mobileStyles = styleObjectToString(styles.mobile);
      if(mobileStyles) {
          const selector = `@media (max-width: 480px) {\n  .el-${element.id}`;
          if (!cssMap.has(selector)) cssMap.set(selector, []);
          cssMap.get(selector)!.push(mobileStyles);
      }
  }

  resolvedElement.children?.forEach(child => generateElementCss(child, cssMap, customComponents, theme));
}

function generateCssString(pages: Page[], customComponents: CustomComponent[], theme: ThemeState): string {
  const cssMap = new Map<string, string[]>();
  
  const rootVars = Object.entries(theme.variables).map(([key, value]) => `  ${key}: ${value};`).join('\n');
  cssMap.set(':root', [rootVars]);

  Object.entries(theme.globalClasses).forEach(([className, styles]) => {
      cssMap.set(`.${className}`, [styleObjectToString(styles)]);
  });

  pages.forEach(page => {
    page.elements.forEach(el => generateElementCss(el, cssMap, customComponents, theme));
  });

  let cssString = '';
  for (const [selector, styles] of cssMap.entries()) {
    if (selector.startsWith('@media')) {
      cssString += `${selector} {\n${styles.join('\n')}\n  }\n}\n`;
    } else {
      cssString += `${selector} {\n${styles.join('\n')}\n}\n\n`;
    }
  }
  
  return cssString + ANIMATION_KEYFRAMES;
}

function generateElementHtml(element: Element, customComponents: CustomComponent[], indentLevel = 0): string {
  const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
  const resolvedElement = mainComponent ? mergeElements(mainComponent.mainElement, element) : element;

  const { type, content, props, children, interactions, tailwindClasses, dataSource, conditionalDisplay } = resolvedElement;
  const indent = '  '.repeat(indentLevel);
  const tagMap: { [key: string]: string } = { heading: 'h1', text: 'p', button: 'button', image: 'img', container: 'div', flex: 'div', 'component-instance': 'div', modal: 'div', form: 'form', input: 'input', textarea: 'textarea', label: 'label', navbar: 'nav', card: 'div', video: 'iframe', icon: 'div', footer: 'footer' };
  const Tag = tagMap[type] || 'div';
  const isSelfClosing = ['img', 'input'].includes(Tag);
  
  const classList = [`el-${element.id}`, props?.className, tailwindClasses];
  const classAttribute = `class="${classList.filter(Boolean).join(' ')}"`;

  let attributes = `${classAttribute} data-element-id="${element.id}"`;
  for (const [key, value] of Object.entries(props || {})) {
      if (['iconSet', 'iconName', 'size', 'color', 'className'].includes(key)) continue;
      attributes += ` ${toKebabCase(key)}="${String(value).replace(/"/g, '&quot;')}"`;
  }
  
  if (interactions?.length) {
    attributes += ` data-interactions='${JSON.stringify(interactions)}'`;
  }

  if (dataSource?.content) attributes += ` data-bind-content="${dataSource.content.replace(/\{\{|\}\}/g, '').trim()}"`;
  if (dataSource?.repeat?.dataKey) attributes += ` data-repeat-key="${dataSource.repeat.dataKey}" data-repeat-item-name="${dataSource.repeat.itemName || 'item'}"`;
  if (conditionalDisplay?.stateKey) {
    attributes += ` data-conditional-display='${JSON.stringify(conditionalDisplay)}'`;
  }
  
  if (isSelfClosing) return `${indent}<${Tag} ${attributes}>`;
  
  let childrenHtml = '';
  if (type === 'icon') childrenHtml = `<!-- Icon: ${props?.iconSet}/${props?.iconName} -->`;
  else childrenHtml = children?.length ? `\n${children.map(child => generateElementHtml(child, customComponents, indentLevel + 1)).join('\n')}\n${indent}` : (content || '');
  
  return `${indent}<${Tag} ${attributes}>${childrenHtml}</${Tag}>`;
}

export function generateHtmlForPage(page: Page, pages: Page[], customComponents: CustomComponent[]): string {
  const pageTitle = page.name;
  const bodyContent = page.elements.map(el => generateElementHtml(el, customComponents, 2)).join('\n');
  const pageName = page.name.toLowerCase().replace(/\s+/g, '-') + '.html';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${bodyContent}
    <script src="script.js"></script>
</body>
</html>`;
}

async function generateJs(pages: Page[], customComponents: CustomComponent[]): Promise<string> {
    const mainPage = pages[0]; // Assume first page is the entry point
    const initialRuntimeState = {};
    mainPage.stateDefinition.forEach(v => {
        initialRuntimeState[v.name] = v.initialValue;
    });

    return `
document.addEventListener('DOMContentLoaded', () => {
  let state = ${JSON.stringify(initialRuntimeState, null, 2)};
  let apiData = {};
  const apiDataSources = ${JSON.stringify(mainPage.apiDataSources, null, 2)};

  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  const resolveContent = (content, scope) => {
      if (!content) return '';
      return content.replace(/\\{\\{\\s*(.*?)\\s*\\}\\}/g, (match, key) => {
          const value = getNestedValue(scope, key.trim());
          return value !== undefined ? String(value) : match;
      });
  };

  const evaluateCondition = (condition, currentState) => {
    if (!condition.stateKey) return true;
    const stateValue = currentState[condition.stateKey];
    let compareValue = condition.value;
    if (typeof stateValue === 'number') compareValue = Number(compareValue);
    if (typeof stateValue === 'boolean') compareValue = compareValue === 'true';

    switch (condition.operator) {
      case '===': return stateValue === compareValue;
      case '!==': return stateValue !== compareValue;
      case '>': return stateValue > compareValue;
      case '<': return stateValue < compareValue;
      case '>=': return stateValue >= compareValue;
      case '<=': return stateValue <= compareValue;
      default: return true;
    }
  };

  const render = () => {
    const fullScope = { ...apiData, ...state };
    
    document.querySelectorAll('[data-conditional-display]').forEach(el => {
        const condition = JSON.parse(el.getAttribute('data-conditional-display'));
        el.style.display = evaluateCondition(condition, state) ? '' : 'none';
    });
    
    document.querySelectorAll('[data-repeat-key]').forEach(container => {
        if (container.offsetParent === null) return;
        const dataKey = container.getAttribute('data-repeat-key');
        const itemName = container.getAttribute('data-repeat-item-name');
        const dataArray = getNestedValue(fullScope, dataKey);

        if (!container.template) {
            container.template = container.firstElementChild ? container.firstElementChild.cloneNode(true) : null;
        }
        container.innerHTML = '';

        if (!Array.isArray(dataArray) || !container.template) return;

        dataArray.forEach((item, index) => {
            const newItem = container.template.cloneNode(true);
            const itemScope = { ...fullScope, [itemName]: item, index };
            
            // Bind content within the new item's scope
            newItem.querySelectorAll('[data-bind-content]').forEach(el => {
                const bindKey = el.getAttribute('data-bind-content');
                el.textContent = resolveContent(\`{{ \${bindKey} }}\`, itemScope);
            });
            
            // You can add more bindings here (e.g., for attributes like src, href)
            
            container.appendChild(newItem);
        });
    });
    
    document.querySelectorAll('[data-bind-content]').forEach(el => {
      if (el.closest('[data-repeat-key]')) return; // handled by repeater logic
      if (el.offsetParent === null) return;
      const key = el.getAttribute('data-bind-content');
      el.textContent = getNestedValue(fullScope, key) || \`{{ \${key} }}\`;
    });
  };

  const executeActions = (actions) => {
    for (const action of actions) {
      const { type, payload } = action;
      switch (type) {
        case 'navigate_to_page': if (payload.pageId) window.location.href = payload.pageId; break;
        case 'open_url': if (payload.url) window.open(payload.url, '_blank'); break;
        case 'set_state': if (payload.stateKey) state[payload.stateKey] = payload.value; break;
        case 'increment_state': if (payload.stateKey && typeof state[payload.stateKey] === 'number') state[payload.stateKey]++; break;
        case 'decrement_state': if (payload.stateKey && typeof state[payload.stateKey] === 'number') state[payload.stateKey]--; break;
        case 'toggle_state': if (payload.stateKey && typeof state[payload.stateKey] === 'boolean') state[payload.stateKey] = !state[payload.stateKey]; break;
      }
    }
    render();
  };

  const fetchData = async () => {
    const fetchPromises = apiDataSources.map(source => {
        const headers = source.headers.reduce((acc, h) => ({...acc, [h.key]: h.value }), {});
        return fetch(source.url, { method: source.method, headers })
            .then(res => {
                if (!res.ok) throw new Error(\`Failed to fetch from \${source.name}\`);
                return res.json();
            })
            .then(data => ({ name: source.name, data }))
            .catch(error => ({ name: source.name, error: error.message }));
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(result => {
        if(result.data) apiData[result.name] = result.data;
        if(result.error) console.error(result.error);
    });
    render();
  };

  fetchData();

  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('[data-interactions]');
    if (!target) return;
    const interactions = JSON.parse(target.getAttribute('data-interactions'));
    executeActions(interactions);
  });
});`;
}

export async function generateProjectFiles(pages: Page[], customComponents: CustomComponent[], theme: ThemeState): Promise<{ [fileName: string]: string }> {
  const files: { [fileName: string]: string } = {};
  
  for(const page of pages) {
    const pageName = page.name.toLowerCase().replace(/\s+/g, '-') + '.html';
    files[pageName] = generateHtmlForPage(page, pages, customComponents);
  }
  
  files['style.css'] = generateCssString(pages, customComponents, theme);
  files['script.js'] = await generateJs(pages, customComponents);

  return files;
}

// --- React Native Generation ---
function nativeStyleToString(style: NativeStyle | undefined, indentLevel: number): string {
    if (!style || Object.keys(style).length === 0) return '{}';
    const indent = '  '.repeat(indentLevel);
    const styleString = Object.entries(style)
        .map(([key, value]) => {
            const valStr = typeof value === 'string' ? `'${value}'` : value;
            return `${'  '.repeat(indentLevel + 1)}${key}: ${valStr},`;
        })
        .join('\n');
    return `{\n${styleString}\n${indent}}`;
}

function generateElementJSX(element: Element, customComponents: CustomComponent[], indentLevel: number): string {
    const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
    const resolvedElement = mainComponent ? mergeElements(mainComponent.mainElement, element) : element;
    
    const { type, content, props, children } = resolvedElement;
    const indent = '  '.repeat(indentLevel);
    const Tag = type;
    
    let attributes = `style={styles.el${element.id}}`;
    if (type === 'Image' && props?.src) {
        attributes += ` source={{ uri: '${props.src}' }}`;
    }
    if (type === 'TextInput' && props?.placeholder) {
        attributes += ` placeholder='${props.placeholder}'`;
    }

    if (!children || children.length === 0) {
        if (content) {
            return `${indent}<${Tag} ${attributes}>${content}</${Tag}>`;
        }
        return `${indent}<${Tag} ${attributes} />`;
    }
    
    const childrenJsx = children.map(child => generateElementJSX(child, customComponents, indentLevel + 1)).join('\n');
    
    return `${indent}<${Tag} ${attributes}>\n${childrenJsx}\n${indent}</${Tag}>`;
}

function generateAllStyles(elements: Element[], customComponents: CustomComponent[]): string {
    let stylesMap: { [key: string]: NativeStyle } = {};

    function recurse(el: Element) {
        const mainComponent = el.componentId ? customComponents.find(c => c.id === el.componentId) : null;
        const resolvedEl = mainComponent ? mergeElements(mainComponent.mainElement, el) : el;
        
        if (resolvedEl.styles.desktop) {
            stylesMap[`el${el.id}`] = resolvedEl.styles.desktop as NativeStyle;
        }
        resolvedEl.children?.forEach(recurse);
    }

    elements.forEach(recurse);
    
    const stylesString = Object.entries(stylesMap)
        .map(([key, value]) => `  ${key}: ${nativeStyleToString(value, 2)}`)
        .join(',\n');
        
    return `const styles = StyleSheet.create({\n${stylesString}\n});`;
}


export function generateReactNativeFiles(pages: Page[], customComponents: CustomComponent[], theme: ThemeState): { [fileName: string]: string } { 
    const mainPage = pages[0]; // Assume first page is the entry point
    if (!mainPage) return { 'App.js': '// No pages to generate.' };

    const imports = new Set<string>(['React from \'react\'', 'StyleSheet from \'react-native\'']);
    
    function findImports(elements: Element[]) {
        elements.forEach(el => {
            if (el.type !== 'component-instance') {
                imports.add(el.type);
            }
            if (el.children) findImports(el.children);
        });
    }
    findImports(mainPage.elements);
    const { React, StyleSheet, ...components } = Array.from(imports).reduce((acc, curr) => {
        const name = curr.split(' ')[0];
        acc[name] = true;
        return acc;
    }, {} as {[key: string]: boolean});


    const importString = `import React from 'react';\nimport { StyleSheet, ${Object.keys(components).join(', ')} } from 'react-native';`;
    
    const componentJSX = mainPage.elements.map(el => generateElementJSX(el, customComponents, 2)).join('\n');
    const stylesString = generateAllStyles(mainPage.elements, customComponents);

    const appCode = `
${importString}

const App = () => {
  return (
    <View style={styles.container}>
${componentJSX}
    </View>
  );
};

${stylesString}

const containerBase = {
    flex: 1,
    backgroundColor: '${theme.variables['--color-background'] || '#fff'}',
    alignItems: 'center',
    justifyContent: 'center',
};
// Add base container style to the generated styles
styles.container = {...styles.container, ...containerBase};


export default App;
`;
    return { 'App.js': appCode };
}

// --- Flutter, Kotlin Generation (unchanged) ---
export function generateFlutterFiles(pages: Page[], customComponents: CustomComponent[], theme: ThemeState): { [fileName: string]: string } { return { 'main.dart': '// Flutter code generation is not fully implemented.' }; }
export function generateKotlinFiles(pages: Page[], customComponents: CustomComponent[], theme: ThemeState): { [fileName: string]: string } { return { 'MainActivity.kt': '// Kotlin code generation is not fully implemented.' }; }