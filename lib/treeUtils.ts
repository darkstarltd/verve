import { Element, ResponsiveStyles, CustomComponent, DeepReadonly, ComponentSlot } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

export const findElementDeep = (elements: readonly Element[], id: string): { element: Element | null, parent: Element | null, index: number } => {
    for (const [index, element] of elements.entries()) {
        if (element.id === id) return { element: element as Element, parent: null, index };
        if (element.children) {
            const childResult = findElementDeep(element.children, id);
            if (childResult.element) return { ...childResult, parent: (childResult.parent || element) as Element };
        }
    }
    return { element: null, parent: null, index: -1 };
};

export const findElementPath = (elements: readonly Element[], id: string): Element[] => {
    const path: Element[] = [];
    const find = (els: readonly Element[]): boolean => {
        for (const el of els) {
            path.push(el as Element);
            if (el.id === id) {
                return true;
            }
            if (el.children && find(el.children)) {
                return true;
            }
            path.pop();
        }
        return false;
    };
    find(elements);
    return path;
};

export const findParentElement = (elements: readonly Element[], id: string): Element | null => {
    for (const element of elements) {
      if (element.children?.some(child => child.id === id)) return element as Element;
      if (element.children) {
        const found = findParentElement(element.children, id);
        if (found) return found;
      }
    }
    return null;
};

export const removeElement = (elements: readonly Element[], id: string): Element[] => {
  return elements.reduce((acc, element) => {
    if (element.id === id) return acc;
    if (element.children) {
        const newChildren = removeElement(element.children, id);
        if (newChildren !== element.children) {
            acc.push({ ...(element as Element), children: newChildren });
            return acc;
        }
    }
    acc.push(element as Element);
    return acc;
  }, [] as Element[]);
};

export const insertElementAtIndex = (elements: readonly Element[], parentId: string | null, index: number, newElement: Element): Element[] => {
  if (parentId === null) {
    const newElements = [...(elements as Element[])];
    newElements.splice(index, 0, newElement);
    return newElements;
  }
  return (elements as Element[]).map(element => {
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
        slotId: element.type === 'slot' ? uuidv4() : undefined,
        children: element.children ? element.children.map(assignNewIdsToTree) : undefined
    };
};

const replaceSlots = (mainChildren: readonly Element[], instanceChildren: DeepReadonly<Element[]> | undefined = [], defaultSlotId: string | undefined): Element[] => {
    return mainChildren.map(mainChild => {
        if (mainChild.type !== 'slot') {
            const mutableChild = JSON.parse(JSON.stringify(mainChild)) as Element;
            // If it's a container, recurse
            if (mutableChild.children) {
                mutableChild.children = replaceSlots(mutableChild.children, instanceChildren, defaultSlotId);
            }
            return mutableChild;
        }

        // It's a slot, so replace it with children from the instance that target it
        const childrenForThisSlot = (instanceChildren || []).filter(instanceChild =>
            (instanceChild.slotTargetId || defaultSlotId) === mainChild.slotId
        );
        return JSON.parse(JSON.stringify(childrenForThisSlot)) as Element[];
    }).flat();
};


export const mergeElements = (main: Element, instance: DeepReadonly<Element>, mainComponentDef: CustomComponent): Element => {
  return produce(main, draft => {
    draft.id = instance.id;
    draft.componentId = instance.componentId;
    draft.name = instance.name;
    
    draft.styles = {
        desktop: { ...main.styles.desktop, ...instance.styles.desktop },
        tablet: { ...main.styles.tablet, ...instance.styles.tablet },
        mobile: { ...main.styles.mobile, ...instance.styles.mobile },
    };
    
    const defaultProps: { [key: string]: any } = {};
    if (mainComponentDef.propsDefinition) {
        mainComponentDef.propsDefinition.forEach(propDef => {
            defaultProps[propDef.name] = propDef.defaultValue;
        });
    }

    draft.props = { ...defaultProps, ...main.props, ...instance.props };
    draft.content = instance.content ?? main.content;
    draft.tailwindClasses = instance.tailwindClasses ?? main.tailwindClasses;
    draft.animations = instance.animations ? JSON.parse(JSON.stringify(instance.animations)) : main.animations;
    draft.interactions = instance.interactions ? JSON.parse(JSON.stringify(instance.interactions)) : main.interactions;
    draft.dataSource = instance.dataSource ? JSON.parse(JSON.stringify(instance.dataSource)) : main.dataSource;
    
    // New Slot Logic
    const defaultSlot = mainComponentDef.slots.find(s => s.name === 'Default Slot') || mainComponentDef.slots[0];
    if (draft.children) {
        draft.children = replaceSlots(draft.children, instance.children, defaultSlot?.id) as any;
    }
  });
};