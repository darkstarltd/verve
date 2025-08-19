
import { Element, ResponsiveStyles } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

export const findElementDeep = (elements: Element[], id: string): { element: Element | null, parent: Element | null, index: number } => {
    for (const [index, element] of elements.entries()) {
        if (element.id === id) return { element, parent: null, index };
        if (element.children) {
            const childResult = findElementDeep(element.children, id);
            if (childResult.element) return { ...childResult, parent: childResult.parent || element };
        }
    }
    return { element: null, parent: null, index: -1 };
};

export const findParentElement = (elements: Element[], id: string): Element | null => {
    for (const element of elements) {
      if (element.children?.some(child => child.id === id)) return element;
      if (element.children) {
        const found = findParentElement(element.children, id);
        if (found) return found;
      }
    }
    return null;
};

export const removeElement = (elements: Element[], id: string): Element[] => {
  return elements.reduce((acc, element) => {
    if (element.id === id) return acc;
    if (element.children) {
        const newChildren = removeElement(element.children, id);
        if (newChildren !== element.children) {
            acc.push({ ...element, children: newChildren });
            return acc;
        }
    }
    acc.push(element);
    return acc;
  }, [] as Element[]);
};

export const insertElementAtIndex = (elements: Element[], parentId: string | null, index: number, newElement: Element): Element[] => {
  if (parentId === null) {
    const newElements = [...elements];
    newElements.splice(index, 0, newElement);
    return newElements;
  }
  return elements.map(element => {
    if (element.id === parentId) {
      const newChildren = [...(element.children || [])];
      newChildren.splice(index, 0, newElement);
      return { ...element, children: newChildren };
    } else if (element.children) {
      const newChildren = insertElementAtIndex(element.children, parentId, index, newElement);
      if (newChildren !== element.children) {
        return { ...element, children: newChildren };
      }
    }
    return element;
  });
};

export const duplicateElement = (element: Element): Element => {
    const newId = uuidv4();
    const newName = element.name.includes('Copy') ? element.name : `${element.name} Copy`;
    const newChildren = element.children ? element.children.map(duplicateElement) : undefined;
    return { ...element, id: newId, name: newName, children: newChildren };
};

export const assignNewIdsToTree = (element: Element): Element => {
    return {
        ...element,
        id: uuidv4(),
        children: element.children ? element.children.map(assignNewIdsToTree) : undefined
    };
};

/**
 * Merges a main component's base element with an instance's overrides.
 * Returns a new, resolved element suitable for rendering or code generation.
 * @param main - The main element from the CustomComponent definition.
 * @param instance - The instance element from the page's element tree.
 */
export const mergeElements = (main: Element, instance: Element): Element => {
  return produce(main, draft => {
    // Instance-specific properties that must be preserved
    draft.id = instance.id;
    draft.componentId = instance.componentId;

    // Instance properties that override the main component's properties
    draft.name = instance.name;
    draft.styles = {
        desktop: { ...main.styles.desktop, ...instance.styles.desktop },
        tablet: { ...main.styles.tablet, ...instance.styles.tablet },
        mobile: { ...main.styles.mobile, ...instance.styles.mobile },
    };
    draft.props = { ...main.props, ...instance.props };

    // Use instance property if it exists, otherwise fall back to main component's property
    draft.content = instance.content ?? main.content;
    draft.tailwindClasses = instance.tailwindClasses ?? main.tailwindClasses;
    draft.animation = instance.animation ?? main.animation;
    draft.interactions = instance.interactions ?? main.interactions;
    draft.dataSource = instance.dataSource ?? main.dataSource;

    // Children are ALWAYS taken from the main component definition.
    // An instance cannot define its own children, it only inherits them.
    draft.children = main.children;
  });
};