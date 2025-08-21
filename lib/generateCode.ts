
import { Element, Page, Style, ProjectType, NativeStyle, FlutterStyle, KotlinStyle, CustomComponent, ResponsiveStyles, ThemeState, ApiDataSource, ElementAnimation, DeepReadonly, StateVariable, MockApiEndpoint, LogicFlow } from '../types';
import { mergeElements } from './treeUtils';

function toKebabCase(str: string) { return str.replace(/([a-z09]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase(); }

function styleObjectToString(styles?: Readonly<Style>): string {
    if (!styles) return '';
    return Object.entries(styles).map(([key, value]) => {
      const kebabKey = toKebabCase(key);
      const styleValue = (key === 'transform' && typeof value === 'object' && value !== null) 
        ? Object.entries(value).map(([tKey, tValue]) => `${toKebabCase(tKey)}(${tValue})`).join(' ')
        : value;
      return `  ${kebabKey}: ${styleValue};`;
    }).join('\n');
}

function generateAnimationCss(animations: readonly ElementAnimation[] | undefined): { keyframes: string, classRules: string[] } {
    if (!animations || animations.length === 0) {
        return { keyframes: '', classRules: [] };
    }

    let keyframes = '';
    const classRules: string[] = [];

    animations.forEach(anim => {
        const animationName = `anim-${anim.id}`;
        let keyframeString = `@keyframes ${animationName} {\n`;
        
        let totalDuration = anim.keyframes.reduce((acc, kf) => acc + kf.duration + kf.delay, 0);
        if (totalDuration === 0) totalDuration = 1;
        
        let accumulatedOffset = 0;
        
        anim.keyframes.forEach(kf => {
            const startOffset = (accumulatedOffset + kf.delay) / totalDuration * 100;
            accumulatedOffset += kf.delay + kf.duration;
            const endOffset = accumulatedOffset / totalDuration * 100;

            const properties = Object.entries(kf.properties)
                .map(([key, value]) => `    ${toKebabCase(key)}: ${value};`)
                .join('\n');
            
            // To make smooth transitions, we add a frame at the start of the delay
            if (kf.delay > 0) {
                 keyframeString += `  ${startOffset.toFixed(2)}% { ${keyframeString.includes('0%') ? '' : '/* initial state */'} }\n`;
            }
            keyframeString += `  ${endOffset.toFixed(2)}% {\n${properties}\n  }\n`;
        });
        keyframeString += '}\n\n';
        keyframes += keyframeString;

        const animationClass = `.play-${animationName}`;
        const animationRule = `  animation: ${animationName} ${totalDuration}ms forwards;`;
        
        classRules.push(`${animationClass} {\n${animationRule}\n}`);
    });

    return { keyframes, classRules };
}

function generateElementCss(element: DeepReadonly<Element>, cssMap: Map<string, string[]>, customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>, animationData: { keyframes: string, classRules: string[] }): void {
  const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
  const resolvedElement: Element = mainComponent ? mergeElements(mainComponent.mainElement, element, mainComponent) : JSON.parse(JSON.stringify(element));

  const { styles, animations } = resolvedElement;

  const { keyframes: newKeyframes, classRules: newClassRules } = generateAnimationCss(animations as ElementAnimation[]);
  animationData.keyframes += newKeyframes;
  animationData.classRules.push(...newClassRules);


  const desktopStyles = styleObjectToString(styles.desktop);
  if (desktopStyles) {
    const selector = `.el-${element.id}`;
    if (!cssMap.has(selector)) cssMap.set(selector, []);
    cssMap.get(selector)!.push(desktopStyles);
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

  resolvedElement.children?.forEach(child => generateElementCss(child, cssMap, customComponents, theme, animationData));
}

function generateCssString(pages: readonly Page[], customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>): string {
  const cssMap = new Map<string, string[]>();
  const animationData = { keyframes: '', classRules: [] };
  
  const rootVars = [
      ...Object.entries(theme.variables).map(([key, value]) => `  ${key}: ${value};`),
      `  --font-primary: '${theme.fonts.primary}', sans-serif;`,
      `  --font-body: '${theme.fonts.body}', sans-serif;`
  ].join('\n');
  cssMap.set(':root', [rootVars]);

  const bodyStyles = "font-family: var(--font-body);\n  background-color: var(--color-background);\n  color: var(--color-text-primary);";
  cssMap.set('body', [bodyStyles]);
  cssMap.set('h1, h2, h3, h4, h5, h6', ["font-family: var(--font-primary);"]);

  Object.entries(theme.globalClasses).forEach(([className, styles]) => {
      cssMap.set(`.${className}`, [styleObjectToString(styles)]);
  });

  pages.forEach(page => {
    page.elements.forEach(el => generateElementCss(el, cssMap, customComponents, theme, animationData));
  });

  let cssString = '';
  for (const [selector, styles] of cssMap.entries()) {
    if (selector.startsWith('@media')) {
      cssString += `${selector} {\n${styles.join('\n')}\n  }\n}\n`;
    } else {
      cssString += `${selector} {\n${styles.join('\n')}\n}\n\n`;
    }
  }
  
  return cssString + '\n/* --- Animations --- */\n' + animationData.keyframes + '\n' + animationData.classRules.join('\n\n');
}

function generateElementHtml(element: DeepReadonly<Element>, customComponents: readonly CustomComponent[], indentLevel = 0): string {
  const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
  const resolvedElement: Element = mainComponent ? mergeElements(mainComponent.mainElement, element, mainComponent) : JSON.parse(JSON.stringify(element));

  const { type, content, props, children, interactions, tailwindClasses, dataSource, conditionalDisplay, animations } = resolvedElement;
  const indent = '  '.repeat(indentLevel);
  const tagMap: { [key: string]: string } = { heading: 'h1', text: 'p', button: 'button', image: 'img', container: 'div', flex: 'div', 'component-instance': 'div', modal: 'div', form: 'form', input: 'input', textarea: 'textarea', label: 'label', navbar: 'nav', card: 'div', video: 'iframe', icon: 'div', footer: 'footer', divider: 'hr', link: 'a', spacer: 'div', badge: 'span', list: 'ul', table: 'table', chart: 'div', 'progress-bar': 'div' };
  const Tag = (props?.as as string) || tagMap[type] || 'div';
  const isSelfClosing = ['img', 'input', 'hr'].includes(Tag);
  
  const classList = [`el-${element.id}`, props?.className, tailwindClasses];
  const classAttribute = `class="${classList.filter(Boolean).join(' ')}"`;

  let attributes = `${classAttribute} data-element-id="${element.id}"`;
  for (const [key, value] of Object.entries(props || {})) {
      if (['iconSet', 'iconName', 'size', 'color', 'className', 'as'].includes(key)) continue;
      attributes += ` ${toKebabCase(key)}="${String(value).replace(/"/g, '&quot;')}"`;
  }
  
  if (interactions?.length) {
    attributes += ` data-interactions='${JSON.stringify(interactions)}'`;
  }
  
  if (animations?.length) {
      animations.forEach(anim => {
          attributes += ` data-anim-${anim.trigger}="play-anim-${anim.id}"`;
      });
  }

  if (dataSource?.content) attributes += ` data-bind-content="${dataSource.content.replace(/\{\{|\}\}/g, '').trim()}"`;
  if (dataSource?.repeat?.dataKey) attributes += ` data-repeat-key="${dataSource.repeat.dataKey}" data-repeat-item-name="${dataSource.repeat.itemName || 'item'}"`;
  if (conditionalDisplay?.stateKey) {
    attributes += ` data-conditional-display='${JSON.stringify(conditionalDisplay)}'`;
  }
  
  if (isSelfClosing) return `${indent}<${Tag} ${attributes}>`;
  
  let childrenHtml = '';
  if (type === 'icon') childrenHtml = `<!-- Icon: ${props?.iconSet}/${props?.iconName} -->`;
  else if (type === 'list') childrenHtml = children?.length ? `\n${children.map(child => `    ${generateElementHtml({...child, type: 'text'}, customComponents, indentLevel + 1).replace(/^(\s*)<p/, '$1<li').replace(/p>$/, 'li>')}`).join('\n')}\n${indent}` : '';
  else childrenHtml = children?.length ? `\n${children.map(child => generateElementHtml(child, customComponents, indentLevel + 1)).join('\n')}\n${indent}` : (content || '');
  
  return `${indent}<${Tag} ${attributes}>${childrenHtml}</${Tag}>`;
}

export function generateHtmlForPage(page: DeepReadonly<Page>, pages: readonly Page[], customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>): string {
  const pageTitle = page.name;
  const bodyContent = page.elements.map(el => generateElementHtml(el, customComponents, 2)).join('\n');
  const pageName = page.name.toLowerCase().replace(/\s+/g, '-') + '.html';
  
  const primaryFont = theme.fonts.primary.replace(/ /g, '+');
  const bodyFont = theme.fonts.body.replace(/ /g, '+');
  const fontUrl = `https://fonts.googleapis.com/css2?family=${primaryFont}:wght@400;700&family=${bodyFont}:wght@400;500;600&display=swap`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${fontUrl}" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${bodyContent}
    <script src="script.js"></script>
</body>
</html>`;
}

async function generateJs(pages: readonly Page[], customComponents: readonly CustomComponent[], globalStateDefinition: readonly StateVariable[], mockApiEndpoints: readonly MockApiEndpoint[]): Promise<string> {
    const mainPage = pages[0]; // Assume first page is the entry point
    
    const getInitialValues = (defs: readonly StateVariable[]) => defs.reduce((acc, v) => ({...acc, [v.name]: v.initialValue}), {});

    const initialGlobalState = getInitialValues(globalStateDefinition);
    const initialPageState = getInitialValues(mainPage.stateDefinition);

    // --- Logic Flow Generation ---
    const allFlows = pages.flatMap(p => p.logicFlows);
    const flowFunctions = allFlows.map(flow => {
        // This is a simplified transpiler. A real one would be much more complex.
        const triggerNode = flow.nodes.find(n => n.type === 'on-trigger');
        if (!triggerNode) return `// Flow ${flow.name} has no trigger.`;

        let functionBody = '    // Logic for this flow\n';
        // Simple sequential execution for demo
        let currentNode = triggerNode;
        while(currentNode) {
            const connection = flow.connections.find(c => c.sourceNodeId === currentNode.id);
            if (!connection) break;
            const nextNode = flow.nodes.find(n => n.id === connection.targetNodeId);
            if(!nextNode) break;

            switch(nextNode.type) {
                case 'set-state':
                    functionBody += `    state['${nextNode.data.stateKey}'] = ${JSON.stringify(nextNode.data.value)};\n`;
                    break;
                case 'alert':
                    functionBody += `    alert('${nextNode.data.message}');\n`;
                    break;
            }
            currentNode = nextNode;
        }
        functionBody += '    render();\n';
        return `  async function run_flow_${flow.id.replace(/-/g, '_')}() {\n${functionBody}  }`;
    }).join('\n\n');

    return `
document.addEventListener('DOMContentLoaded', () => {
  const initialGlobalState = ${JSON.stringify(initialGlobalState, null, 2)};
  const initialPageState = ${JSON.stringify(initialPageState, null, 2)};
  
  let state = { ...initialGlobalState, ...initialPageState };
  let apiData = {};
  const apiDataSources = ${JSON.stringify(mainPage.apiDataSources, null, 2)};
  const mockApiEndpoints = ${JSON.stringify(mockApiEndpoints, null, 2)};

  // --- Mock API Server ---
  (function() {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      const endpoint = mockApiEndpoints.find(e => {
        const path = e.path.startsWith('/') ? e.path : '/' + e.path;
        return url.toString().endsWith(path) && e.method === (options?.method || 'GET');
      });

      if (endpoint) {
        console.log(\`[Mock API] Intercepted request to \${url}\`);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              const responseBody = JSON.parse(endpoint.responseBody);
              const response = new Response(JSON.stringify(responseBody), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
              resolve(response);
            } catch (e) {
              console.error('[Mock API] Invalid JSON in response body for', endpoint.path, e);
              reject(new Error('Invalid JSON in mock response.'));
            }
          }, 500); // Simulate network delay
        });
      }
      return originalFetch.apply(this, arguments);
    }
  })();

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

        if (!(container as any).template) {
            (container as any).template = container.firstElementChild ? container.firstElementChild.cloneNode(true) : null;
        }
        container.innerHTML = '';

        if (!Array.isArray(dataArray) || !(container as any).template) return;

        dataArray.forEach((item, index) => {
            const newItem = (container as any).template.cloneNode(true);
            const itemScope = { ...fullScope, [itemName]: item, index };
            
            // Bind content within the new item's scope
            newItem.querySelectorAll('[data-bind-content]').forEach((el: HTMLElement) => {
                const bindKey = el.getAttribute('data-bind-content');
                el.textContent = resolveContent(\`{{ \${bindKey} }}\`, itemScope);
            });
            
            // You can add more bindings here (e.g., for attributes like src, href)
            
            container.appendChild(newItem);
        });
    });
    
    document.querySelectorAll('[data-bind-content]').forEach(el => {
      if (el.closest('[data-repeat-key]')) return; // handled by repeater logic
      if ((el as HTMLElement).offsetParent === null) return;
      const key = el.getAttribute('data-bind-content');
      el.textContent = getNestedValue(fullScope, key) || \`{{ \${key} }}\`;
    });
  };

  // --- Logic Flow Functions ---
${flowFunctions}
  
  const executeActions = (actions: any[]) => {
    for (const action of actions) {
      const { type, payload } = action;
      switch (type) {
        case 'navigate_to_page': if (payload.pageId) window.location.href = payload.pageId + '.html'; break;
        case 'open_url': if (payload.url) window.open(payload.url, '_blank'); break;
        case 'set_state': if (payload.stateKey) state[payload.stateKey] = payload.value; break;
        case 'increment_state': if (payload.stateKey && typeof state[payload.stateKey] === 'number') state[payload.stateKey]++; break;
        case 'decrement_state': if (payload.stateKey && typeof state[payload.stateKey] === 'number') state[payload.stateKey]--; break;
        case 'toggle_state': if (payload.stateKey && typeof state[payload.stateKey] === 'boolean') state[payload.stateKey] = !state[payload.stateKey]; break;
        case 'trigger_flow':
            const flowFuncName = 'run_flow_' + payload.flowId.replace(/-/g, '_');
            if (typeof window[flowFuncName] === 'function') {
                window[flowFuncName]();
            }
            break;
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

  // Interaction listeners
  document.body.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('[data-interactions]');
    if (!target) return;
    const interactions = JSON.parse(target.getAttribute('data-interactions')!);
    executeActions(interactions);
  });

  // Animation triggers
  const playAnimation = (el: Element, animClass: string) => {
    el.classList.add(animClass);
    el.addEventListener('animationend', () => {
      el.classList.remove(animClass);
    }, { once: true });
  };

  document.querySelectorAll('[data-anim-onClick]').forEach(el => {
    el.addEventListener('click', () => {
      playAnimation(el, el.getAttribute('data-anim-onClick')!);
    });
  });

  document.querySelectorAll('[data-anim-onHover]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      playAnimation(el, el.getAttribute('data-anim-onHover')!);
    });
  });

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        playAnimation(entry.target, entry.target.getAttribute('data-anim-onScrollView')!);
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-anim-onScrollView]').forEach(el => {
    scrollObserver.observe(el);
  });
  
  document.querySelectorAll('[data-anim-onPageLoad]').forEach(el => {
    playAnimation(el, el.getAttribute('data-anim-onPageLoad')!);
  });

});`;
}

export async function generateProjectFiles(projectName: string, pages: readonly Page[], customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>, globalStateDefinition: readonly StateVariable[], mockApiEndpoints: readonly MockApiEndpoint[]): Promise<{ [fileName: string]: string }> {
  const files: { [fileName: string]: string } = {};
  
  for(const page of pages) {
    const pageName = page.name.toLowerCase().replace(/\s+/g, '-') + '.html';
    files[pageName] = generateHtmlForPage(page, pages, customComponents, theme);
  }
  
  files['style.css'] = generateCssString(pages, customComponents, theme);
  files['script.js'] = await generateJs(pages, customComponents, globalStateDefinition, mockApiEndpoints);

  // Add project scaffolding files
  files['README.md'] = `# ${projectName}\n\nGenerated by Pro-Verve.\n\nTo run this project locally:\n1. Ensure you have Node.js installed.\n2. Run \`npm install -g serve\`.\n3. Run \`serve\` in this directory.`;
  files['package.json'] = JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    scripts: {
      "start": "serve"
    },
    devDependencies: {
      "serve": "^14.2.1"
    }
  }, null, 2);

  return files;
}

// --- React Native Generation ---
function nativeStyleToString(style: DeepReadonly<NativeStyle> | undefined, indentLevel: number): string {
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

function generateElementJSX(element: DeepReadonly<Element>, customComponents: readonly CustomComponent[], indentLevel: number): string {
    const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
    const resolvedElement: Element = mainComponent ? mergeElements(mainComponent.mainElement, element, mainComponent) : JSON.parse(JSON.stringify(element));
    
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
    if (type === 'Button' && content) {
        attributes += ` title="${content}"`;
    }


    if (!children || children.length === 0) {
        if (content && type !== 'Button') {
            return `${indent}<${Tag} ${attributes}>${content}</${Tag}>`;
        }
        return `${indent}<${Tag} ${attributes} />`;
    }
    
    const childrenJsx = children.map(child => generateElementJSX(child, customComponents, indentLevel + 1)).join('\n');
    
    return `${indent}<${Tag} ${attributes}>\n${childrenJsx}\n${indent}</${Tag}>`;
}

function generateAllStyles(elements: readonly Element[], customComponents: readonly CustomComponent[]): string {
    let stylesMap: { [key: string]: NativeStyle } = {};

    function recurse(el: DeepReadonly<Element>) {
        const mainComponent = el.componentId ? customComponents.find(c => c.id === el.componentId) : null;
        const resolvedEl: Element = mainComponent ? mergeElements(mainComponent.mainElement, el, mainComponent) : JSON.parse(JSON.stringify(el));
        
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


export function generateReactNativeFiles(pages: readonly Page[], customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>): { [fileName: string]: string } { 
    const mainPage = pages[0]; // Assume first page is the entry point
    if (!mainPage) return { 'App.js': '// No pages to generate.' };

    const imports = new Set<string>(['React from \'react\'', 'StyleSheet from \'react-native\'', 'View from \'react-native\'']);
    
    function findImports(elements: readonly Element[]) {
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
styles.container = {...(styles.container || {}), ...containerBase};


export default App;
`;
    return { 'App.js': appCode };
}

// --- Flutter Generation ---
function flutterColor(hex: string | undefined): string {
  if (!hex) return 'Colors.transparent';
  const cleanHex = hex.replace('#', '');
  return `const Color(0xFF${cleanHex})`;
}

function flutterPadding(padding: any): string {
  if (!padding) return 'EdgeInsets.zero';
  if (padding.all) return `const EdgeInsets.all(${padding.all})`;
  return `const EdgeInsets.only(top: ${padding.top || padding.vertical || 0}, bottom: ${padding.bottom || padding.vertical || 0}, left: ${padding.left || padding.horizontal || 0}, right: ${padding.right || padding.horizontal || 0},)`;
}

function generateWidget(element: DeepReadonly<Element>, customComponents: readonly CustomComponent[], indentLevel: number): string {
  const mainComponent = element.componentId ? customComponents.find(c => c.id === element.componentId) : null;
  const resolvedElement: Element = mainComponent ? mergeElements(mainComponent.mainElement, element, mainComponent) : JSON.parse(JSON.stringify(element));

  const { type, content, props, children, styles } = resolvedElement;
  const style = styles.desktop as FlutterStyle;
  const indent = '  '.repeat(indentLevel);

  switch (type) {
    case 'Container': {
      const decoration = (style.color || style.borderRadius)
        ? `decoration: BoxDecoration(color: ${flutterColor(style.color)}, borderRadius: BorderRadius.circular(${style.borderRadius || 0})),`
        : '';
      const child = children?.[0] ? `child: ${generateWidget(children[0], customComponents, indentLevel + 1)},` : '';
      return `${indent}Container(\n${indent}  padding: ${flutterPadding(style.padding)},\n${indent}  ${decoration}\n${indent}  ${child}\n${indent})`;
    }
    case 'Column':
    case 'Row': {
      const childrenWidgets = children?.map(c => generateWidget(c, customComponents, indentLevel + 1)).join(',\n') || '';
      return `${indent}${type}(\n${indent}  children: [\n${childrenWidgets}\n${indent}  ],\n${indent})`;
    }
    case 'Text': {
      const textStyle = `style: TextStyle(color: ${flutterColor(style.color)}, fontSize: ${style.fontSize || 14.0}),`;
      return `${indent}Text('${content}', ${textStyle})`;
    }
    case 'ElevatedButton': {
      const child = children?.[0] ? `child: ${generateWidget(children[0], customComponents, indentLevel + 1)},` : 'child: const Text("Button"),';
      return `${indent}ElevatedButton(\n${indent}  onPressed: () {},\n${indent}  ${child}\n${indent})`;
    }
    case 'Image': {
        return `${indent}Image.network('${props?.src}', width: ${style.width || 100}, height: ${style.height || 100}, fit: BoxFit.cover)`;
    }
    default:
        return `${indent}// Unhandled widget type: ${type}`;
  }
}

export function generateFlutterFiles(pages: readonly Page[], customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>): { [fileName: string]: string } {
    const mainPage = pages[0];
    if (!mainPage) return { 'main.dart': '// No pages to generate.' };

    const bodyWidgets = mainPage.elements.map(el => generateWidget(el, customComponents, 4)).join(',\n');

    const dartCode = `
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${mainPage.name}',
      theme: ThemeData(
        scaffoldBackgroundColor: ${flutterColor(theme.variables['--color-background'] || '#FFFFFF')},
        brightness: Brightness.dark,
        fontFamily: '${theme.fonts.body}',
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${mainPage.name}'),
        backgroundColor: ${flutterColor(theme.variables['--color-surface'] || '#1E1E1E')},
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
${bodyWidgets}
          ],
        ),
      ),
    );
  }
}
`;
    return { 'main.dart': dartCode };
}

// --- Kotlin Generation ---
function generateComposable(element: DeepReadonly<Element>, customComponents: readonly CustomComponent[], indentLevel: number): string {
    const { type, content, children, props } = element;
    const indent = '  '.repeat(indentLevel);

    switch(type) {
        case 'Column':
            const columnChildren = children?.map(c => generateComposable(c, customComponents, indentLevel + 1)).join('\n') || '';
            return `${indent}Column {\n${columnChildren}\n${indent}}`;
        case 'Row':
            const rowChildren = children?.map(c => generateComposable(c, customComponents, indentLevel + 1)).join('\n') || '';
            return `${indent}Row {\n${rowChildren}\n${indent}}`;
        case 'Text':
            return `${indent}Text(text = "${content}")`;
        case 'Button':
            const buttonChild = children?.[0] ? generateComposable(children[0], customComponents, indentLevel + 1) : '';
            return `${indent}Button(onClick = { /* TODO */ }) {\n${buttonChild}\n${indent}}`;
        case 'Image':
            return `${indent}// Image composable for source: ${props?.src}\n${indent}// implementation would use a library like Coil:\n${indent}// AsyncImage(model = "${props?.src}", contentDescription = null)`;
        default:
            return `${indent}// Unsupported type: ${type}`;
    }
}

export function generateKotlinFiles(pages: readonly Page[], customComponents: readonly CustomComponent[], theme: DeepReadonly<ThemeState>): { [fileName: string]: string } {
    const mainPage = pages[0];
    if (!mainPage) return { 'Main.kt': '// No pages to generate.' };
    
    const bodyComposables = mainPage.elements.map(el => generateComposable(el, customComponents, 2)).join('\n');

    const kotlinCode = `
import androidx.compose.material.*
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable

@Composable
fun App() {
    MaterialTheme {
        MainScreen()
    }
}

@Composable
fun MainScreen() {
    Column {
${bodyComposables}
    }
}
`;
    return { 'Main.kt': kotlinCode };
}