import React from 'react';
import { ComponentDefinition, Element, ElementTemplate, ProjectType } from './types';
import {
  Type, Text as TextIcon, Heading1, MousePointerClick, Image as ImageIcon, Box,
  Columns, Rows, Grid, CircleSlash,
  Video, CreditCard, FormInput, MessageSquare, Tag,
  Star, BarChart, Heart, Shield, List,
  ChevronsUpDown, Phone, Square, Code, GitCommit,
  Navigation, Server, HardDrive, Smartphone,
  Link as LinkIcon, Minus, MoveVertical, Users, Table as TableIcon, PieChart,
  Activity,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const createDefaultElement = (element: ElementTemplate): Element => {
  const { icon, children, ...restOfElement } = element;
  const newElement: Element = {
    ...restOfElement,
    id: uuidv4(),
    type: element.type as Element['type'], // Cast from string to union type
    children: children ? children.map(createDefaultElement) : [],
    styles: restOfElement.styles as any,
  };
  return newElement;
};

export const WEB_COMPONENT_LIBRARY: ComponentDefinition[] = [
  // Basic Elements
  {
    type: 'heading', name: 'Heading', icon: <Heading1 size={20}/>, category: 'Basic',
    defaultElement: { type: 'heading', name: 'Heading', content: 'Modern Heading', styles: { desktop: { color: 'var(--color-text-primary)', fontSize: '48px', fontWeight: '700', padding: '10px' } }, children: [] },
  },
  {
    type: 'text', name: 'Paragraph', icon: <TextIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'text', name: 'Paragraph', content: 'This is a paragraph of text. It can be edited to describe something interesting.', styles: { desktop: { color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: '1.6', padding: '10px' } }, children: [] },
  },
  {
    type: 'button', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Basic',
    defaultElement: { type: 'button', name: 'Button', content: 'Click Me', styles: { desktop: { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' } } },
  },
   {
    type: 'link', name: 'Link', icon: <LinkIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'link', name: 'Link', content: 'Learn More', props: { href: '#' }, styles: { desktop: { color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' } } },
  },
  {
    type: 'image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'image', name: 'Image', props: { src: 'https://via.placeholder.com/300x200', alt: 'Placeholder Image' }, styles: { desktop: { width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' } } },
  },
  {
    type: 'icon', name: 'Icon', icon: <Star size={20} />, category: 'Basic',
    defaultElement: { type: 'icon', name: 'Icon', props: { iconSet: 'md', iconName: 'MdStar', size: 24, color: 'var(--color-accent)' }, styles: { desktop: {} } }
  },
  {
    type: 'video', name: 'Video', icon: <Video size={20} />, category: 'Basic',
    defaultElement: { type: 'video', name: 'Video Player', props: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, styles: { desktop: { width: '560px', height: '315px', border: 'none', borderRadius: '8px' } } }
  },
  // Data
  {
    type: 'table', name: 'Table', icon: <TableIcon size={20} />, category: 'Data',
    defaultElement: {
      type: 'table', name: 'Data Table', styles: { desktop: { width: '100%', borderCollapse: 'collapse' } },
      children: [
        { type: 'container', name: 'Table Head', props: { as: 'thead'}, styles: { desktop: {} }, children: [
          { type: 'container', name: 'Header Row', props: { as: 'tr'}, styles: { desktop: {} }, children: [
            { type: 'text', name: 'Header 1', props: { as: 'th' }, content: 'Header 1', styles: { desktop: { padding: '12px', borderBottom: '1px solid var(--color-border)', textAlign: 'left' } } },
            { type: 'text', name: 'Header 2', props: { as: 'th' }, content: 'Header 2', styles: { desktop: { padding: '12px', borderBottom: '1px solid var(--color-border)', textAlign: 'left' } } }
          ]}
        ]},
        { type: 'container', name: 'Table Body', props: { as: 'tbody'}, styles: { desktop: {} }, children: [
          { type: 'container', name: 'Row 1', props: { as: 'tr'}, styles: { desktop: {} }, children: [
            { type: 'text', name: 'Cell 1.1', props: { as: 'td' }, content: 'Data 1', styles: { desktop: { padding: '12px', borderBottom: '1px solid var(--color-border-subtle)' } } },
            { type: 'text', name: 'Cell 1.2', props: { as: 'td' }, content: 'Data 2', styles: { desktop: { padding: '12px', borderBottom: '1px solid var(--color-border-subtle)' } } }
          ]}
        ]}
      ]
    }
  },
  {
    type: 'chart', name: 'Chart', icon: <PieChart size={20} />, category: 'Data',
    defaultElement: { type: 'chart', name: 'Chart', styles: { desktop: { width: '100%', height: '300px', backgroundColor: 'var(--color-surface-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, content: 'Chart Placeholder' }
  },
  // Layout
  {
    type: 'container', name: 'Container', icon: <Box size={20}/>, category: 'Layout',
    defaultElement: { type: 'container', name: 'Container', styles: { desktop: { padding: '20px', backgroundColor: 'var(--color-surface-light)', borderRadius: '12px' } }, children: [] },
  },
  {
    type: 'flex', name: 'Flexbox', icon: <Columns size={20}/>, category: 'Layout',
    defaultElement: { type: 'flex', name: 'Flex Container', styles: { desktop: { display: 'flex', flexDirection: 'row', gap: '16px', padding: '16px', alignItems: 'center' } }, children: [] },
  },
  {
    type: 'grid', name: 'Grid', icon: <Grid size={20}/>, category: 'Layout',
    defaultElement: { type: 'grid', name: 'Grid Container', styles: { desktop: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px' } }, children: [] },
  },
  {
    type: 'divider', name: 'Divider', icon: <Minus size={20}/>, category: 'Layout',
    defaultElement: { type: 'divider', name: 'Divider', styles: { desktop: { width: '100%', height: '1px', backgroundColor: 'var(--color-border)', margin: '16px 0' } } },
  },
  {
    type: 'spacer', name: 'Spacer', icon: <MoveVertical size={20}/>, category: 'Layout',
    defaultElement: { type: 'spacer', name: 'Spacer', styles: { desktop: { height: '20px', width: '20px' } } },
  },
  // UI Components
  {
    type: 'navbar', name: 'Navbar', icon: <Navigation size={20}/>, category: 'Components',
    defaultElement: { type: 'navbar', name: 'Navbar', styles: { desktop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--color-surface)' } },
      children: [
        { type: 'text', name: 'Logo', content: 'LOGO', styles: { desktop: { fontWeight: 'bold' } } },
        { type: 'flex', name: 'Nav Links', styles: { desktop: { gap: '24px' } }, children: [
          { type: 'link', name: 'Home', content: 'Home', props: { href: '#' }, styles: { desktop: { textDecoration: 'none' } } },
          { type: 'link', name: 'About', content: 'About', props: { href: '#' }, styles: { desktop: { textDecoration: 'none' } } },
          { type: 'link', name: 'Contact', content: 'Contact', props: { href: '#' }, styles: { desktop: { textDecoration: 'none' } } },
        ] }
      ]
    },
  },
  {
    type: 'card', name: 'Card', icon: <CreditCard size={20}/>, category: 'Components',
    defaultElement: {
      type: 'card', name: 'Card', styles: { desktop: { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } },
      children: [
        { type: 'slot', name: 'Card Content', styles: { desktop: { minHeight: '50px' } } }
      ]
    },
  },
    {
    type: 'testimonial', name: 'Testimonial', icon: <Users size={20}/>, category: 'Components',
    defaultElement: {
        type: 'testimonial', name: 'Testimonial', styles: { desktop: { padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', textAlign: 'center' } },
        children: [
            { type: 'image', name: 'Avatar', props: { src: 'https://via.placeholder.com/80' }, styles: { desktop: { width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px' } } },
            { type: 'text', name: 'Quote', content: '"An amazing experience that exceeded all expectations."', styles: { desktop: { fontStyle: 'italic', marginBottom: '16px' } } },
            { type: 'text', name: 'Author', content: 'Jane Doe, CEO', styles: { desktop: { fontWeight: 'bold' } } }
        ]
    }
  },
  {
    type: 'pricing-table', name: 'Pricing Plan', icon: <CreditCard size={20}/>, category: 'Components',
    defaultElement: {
        type: 'pricing-table', name: 'Pricing Plan', styles: { desktop: { padding: '32px', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center' } },
        children: [
            { type: 'heading', name: 'Plan Name', content: 'Pro Plan', styles: { desktop: { fontSize: '24px', marginBottom: '16px' } } },
            { type: 'heading', name: 'Price', content: '$49/mo', styles: { desktop: { fontSize: '48px', fontWeight: 'bold', marginBottom: '24px' } } },
            { type: 'text', name: 'Feature List', content: 'All Basic Features\nPriority Support\nAdvanced Analytics', styles: { desktop: { whiteSpace: 'pre-line', marginBottom: '32px', color: 'var(--color-text-secondary)' } } },
            { type: 'button', name: 'Select Plan', content: 'Select Plan', styles: { desktop: { width: '100%' } } }
        ]
    }
  },
  {
    type: 'badge', name: 'Badge', icon: <Tag size={20}/>, category: 'Components',
    defaultElement: { type: 'badge', name: 'Badge', content: 'New', styles: { desktop: { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', display: 'inline-block' } } }
  },
  {
    type: 'list', name: 'List', icon: <List size={20}/>, category: 'Components',
    defaultElement: { type: 'list', name: 'List Container', styles: { desktop: { listStyle: 'none', padding: '0', margin: '0' } },
      children: [
        { type: 'text', name: 'List Item 1', content: 'List Item 1', styles: { desktop: { padding: '8px 0', borderBottom: '1px solid var(--color-border)' } } },
        { type: 'text', name: 'List Item 2', content: 'List Item 2', styles: { desktop: { padding: '8px 0', borderBottom: '1px solid var(--color-border)' } } },
        { type: 'text', name: 'List Item 3', content: 'List Item 3', styles: { desktop: { padding: '8px 0' } } }
      ]
    }
  },
  {
    type: 'progress-bar', name: 'Progress Bar', icon: <Activity size={20} />, category: 'Components',
    defaultElement: { type: 'progress-bar', name: 'Progress Bar', styles: { desktop: { width: '100%', height: '8px', backgroundColor: 'var(--color-surface-light)', borderRadius: '4px', overflow: 'hidden' } },
      children: [
        { type: 'container', name: 'Progress Fill', styles: { desktop: { width: '60%', height: '100%', backgroundColor: 'var(--color-primary)' } } }
      ]
    }
  },
  {
    type: 'accordion', name: 'Accordion', icon: <ChevronsUpDown size={20} />, category: 'Components',
    defaultElement: {
      type: 'accordion', name: 'Accordion', styles: { desktop: { borderBottom: '1px solid var(--color-border)' } },
      children: [
        {
          type: 'flex', name: 'Accordion Header',
          styles: { desktop: { justifyContent: 'space-between', padding: '16px 0', cursor: 'pointer' } },
          interactions: [{ type: 'toggle_state', payload: { stateKey: 'accordionOpen' } }],
          children: [
            { type: 'text', name: 'Accordion Title', content: 'Accordion Title', styles: { desktop: { fontWeight: '600' } } },
            { type: 'icon', name: 'Accordion Icon', props: { iconSet: 'md', iconName: 'MdExpandMore' }, styles: { desktop: { transition: 'transform 0.3s' } } },
          ]
        },
        {
          type: 'container', name: 'Accordion Content',
          styles: { desktop: { padding: '0 0 16px 0', color: 'var(--color-text-secondary)' } },
          conditionalDisplay: { stateKey: 'accordionOpen', operator: '===', value: true },
          children: [{ type: 'text', name: 'Accordion Body', content: 'This is the content of the accordion. It can contain any other elements you need.', styles: { desktop: {} } }]
        }
      ]
    }
  },
  {
    type: 'footer', name: 'Footer', icon: <Server size={20}/>, category: 'Components',
    defaultElement: { type: 'footer', name: 'Footer', styles: { desktop: { padding: '40px 20px', backgroundColor: 'var(--color-surface)', marginTop: '40px', textAlign: 'center' } },
      children: [{ type: 'text', name: 'Copyright', content: '© 2024 Your Company. All rights reserved.', styles: { desktop: { fontSize: '14px' } } }]
    },
  },
  // Form Elements
  {
    type: 'form', name: 'Form', icon: <CreditCard size={20}/>, category: 'Forms',
    defaultElement: {
        type: 'form', name: 'Smart Form', styles: { desktop: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        children: [
            { type: 'container', name: 'Field Group: Email', styles: { desktop: {} }, children: [
                { type: 'label', name: 'Email Label', content: 'Email Address', props: { htmlFor: 'email-input' }, styles: { desktop: {} } },
                { type: 'input', name: 'Email Input', props: { id: 'email-input', placeholder: 'you@example.com', type: 'email' }, dataSource: { bindValue: 'form.email' }, styles: { desktop: { marginTop: '8px' } } },
                { type: 'text', name: 'Validation Message', content: '{{formErrors.email}}', styles: { desktop: { color: 'var(--color-danger)', fontSize: '12px', minHeight: '16px', marginTop: '4px' } }, conditionalDisplay: { stateKey: 'formErrors.email', operator: '!==', value: '' } }
            ]},
            { type: 'button', name: 'Submit Button', content: 'Submit', styles: { desktop: { marginTop: '8px' } } }
        ]
    }
  },
  {
    type: 'input', name: 'Input', icon: <FormInput size={20}/>, category: 'Forms',
    defaultElement: { type: 'input', name: 'Input Field', props: { placeholder: 'Enter your text...' }, styles: { desktop: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' } } }
  },
  {
    type: 'textarea', name: 'Text Area', icon: <MessageSquare size={20}/>, category: 'Forms',
    defaultElement: { type: 'textarea', name: 'Text Area', props: { placeholder: 'Enter a longer message...' }, styles: { desktop: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' } } }
  },
  {
    type: 'label', name: 'Label', icon: <Tag size={20}/>, category: 'Forms',
    defaultElement: { type: 'label', name: 'Label', content: 'Your Label', styles: { desktop: { marginBottom: '8px', display: 'block', color: 'var(--color-text-secondary)' } } }
  },
];

export const NATIVE_COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'View', name: 'View', icon: <Square size={20}/>, category: 'Layout',
    defaultElement: { type: 'View', name: 'View', styles: { desktop: { padding: 16, backgroundColor: '#2A2D42', borderRadius: 12 } }, children: [] },
  },
  {
    type: 'Text', name: 'Text', icon: <TextIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'Text', name: 'Text', content: 'Some text', styles: { desktop: { color: '#E0E0FF', fontSize: 16 } } },
  },
  {
    type: 'Image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'Image', name: 'Image', props: { src: 'https://via.placeholder.com/150' }, styles: { desktop: { width: 150, height: 150, borderRadius: 8 } } },
  },
  {
    type: 'Button', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Basic',
    defaultElement: { type: 'Button', name: 'Button', content: 'Press Me', styles: { desktop: {} } }, // Note: React Native Button has limited styling
  },
  {
    type: 'TextInput', name: 'Text Input', icon: <FormInput size={20}/>, category: 'Forms',
    defaultElement: { type: 'TextInput', name: 'Text Input', props: { placeholder: 'Enter text...' }, styles: { desktop: { borderWidth: 1, borderColor: '#3A3D5A', padding: 10, borderRadius: 6, color: 'white' } } },
  },
  {
    type: 'scrollView', name: 'Scroll View', icon: <ChevronsUpDown size={20} />, category: 'Layout',
    defaultElement: { type: 'scrollView', name: 'Scroll View', styles: { desktop: { width: '100%' } }, children: [] },
  },
];

export const FLUTTER_COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'Container', name: 'Container', icon: <Box size={20}/>, category: 'Layout',
    defaultElement: { type: 'Container', name: 'Container', styles: { desktop: { padding: { all: 16 }, color: '#2A2D42', borderRadius: 12.0 } }, children: [] },
  },
  {
    type: 'Column', name: 'Column', icon: <Rows size={20}/>, category: 'Layout',
    defaultElement: { type: 'Column', name: 'Column', styles: { desktop: { mainAxisAlignment: 'start' } }, children: [] },
  },
  {
    type: 'Row', name: 'Row', icon: <Columns size={20}/>, category: 'Layout',
    defaultElement: { type: 'Row', name: 'Row', styles: { desktop: { mainAxisAlignment: 'start' } }, children: [] },
  },
  {
    type: 'Text', name: 'Text', icon: <TextIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'Text', name: 'Text', content: 'Flutter Text', styles: { desktop: { color: '#E0E0FF', fontSize: 16.0 } } },
  },
  {
    type: 'ElevatedButton', name: 'Elevated Button', icon: <MousePointerClick size={20}/>, category: 'Basic',
    defaultElement: { type: 'ElevatedButton', name: 'Elevated Button', styles: { desktop: {} }, children: [{ type: 'Text', name: 'Button Text', content: 'Press Me', styles: { desktop: {} } }] },
  },
  {
    type: 'Image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'Image', name: 'Image', props: { src: 'https://via.placeholder.com/150' }, styles: { desktop: { width: 150, height: 150 } } },
  },
];

export const KOTLIN_COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'Column', name: 'Column', icon: <Rows size={20}/>, category: 'Layout',
    defaultElement: { type: 'Column', name: 'Column', styles: { desktop: { padding: 16 } }, children: [] },
  },
  {
    type: 'Row', name: 'Row', icon: <Columns size={20}/>, category: 'Layout',
    defaultElement: { type: 'Row', name: 'Row', styles: { desktop: { padding: 16 } }, children: [] },
  },
  {
    type: 'Text', name: 'Text', icon: <TextIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'Text', name: 'Text', content: 'Compose Text', styles: { desktop: { color: '#E0E0FF', fontSize: 16 } } },
  },
  {
    type: 'Button', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Basic',
    defaultElement: { type: 'Button', name: 'Button', styles: { desktop: {} }, children: [{ type: 'Text', name: 'Button Text', content: 'Click', styles: { desktop: {} } }] },
  },
  {
    type: 'Image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'Image', name: 'Image', props: { src: 'https://via.placeholder.com/150' }, styles: { desktop: { width: 150, height: 150 } } },
  },
];

export const componentLibrary: Record<ProjectType, ComponentDefinition[]> = {
  web: WEB_COMPONENT_LIBRARY,
  native: NATIVE_COMPONENT_LIBRARY,
  flutter: FLUTTER_COMPONENT_LIBRARY,
  kotlin: KOTLIN_COMPONENT_LIBRARY,
};