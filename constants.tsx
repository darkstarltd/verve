
import React from 'react';
import { ComponentDefinition, Element, ElementTemplate } from './types';
import {
  Type, Text, Heading1, MousePointerClick, Image as ImageIcon, Box,
  Columns, Rows, Grid, CircleSlash,
  Video, CreditCard, FormInput, MessageSquare, Tag,
  Star, BarChart, Heart, Shield,
  ChevronsUpDown, Phone, Square, Code, GitCommit,
  Navigation,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const createDefaultElement = (element: ElementTemplate): Element => {
  const { icon, children, ...restOfElement } = element;
  const newElement: Element = {
    ...restOfElement,
    id: uuidv4(),
    type: element.type as Element['type'], // Cast from string to union type
    children: children ? children.map(createDefaultElement) : [],
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
    type: 'text', name: 'Paragraph', icon: <Text size={20}/>, category: 'Basic',
    defaultElement: { type: 'text', name: 'Paragraph', content: 'This is a well-crafted paragraph. Start editing to make it your own.', styles: { desktop: { color: 'var(--color-text-secondary)', fontSize: '16px', padding: '10px', lineHeight: '1.6' } }, children: [] },
  },
  {
    type: 'button', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Basic',
    defaultElement: { type: 'button', name: 'Button', content: 'Get Started', styles: { desktop: { color: 'var(--color-primary-contrast)', backgroundColor: 'var(--color-primary)', padding: '14px 28px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '16px' } }, children: [] },
  },
  {
    type: 'image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Basic',
    defaultElement: { type: 'image', name: 'Image', props: { src: 'https://picsum.photos/600/350', alt: 'Placeholder' }, styles: { desktop: { padding: '10px', width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', objectFit: 'cover' } }, children: [] },
  },
  {
    type: 'icon', name: 'Icon', icon: <Star size={20}/>, category: 'Basic',
    defaultElement: { type: 'icon', name: 'Icon', props: { iconSet: 'md', iconName: 'MdStar', size: 32, color: 'var(--color-primary)' }, styles: { desktop: { padding: '10px' } } },
  },
  {
    type: 'video', name: 'Video', icon: <Video size={20}/>, category: 'Basic',
    defaultElement: { type: 'video', name: 'Video', props: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }, styles: { desktop: { width: '100%', aspectRatio: '16 / 9', border: 'none', borderRadius: 'var(--radius-lg)' } } },
  },
  // Layout Elements
  {
    type: 'container', name: 'Container', icon: <Box size={20}/>, category: 'Layout',
    defaultElement: { type: 'container', name: 'Container', styles: { desktop: { padding: '24px', backgroundColor: 'var(--color-surface)', minHeight: '100px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' } }, children: [] },
  },
  {
    type: 'flex', name: 'Flex Layout', icon: <Columns size={20}/>, category: 'Layout',
    defaultElement: { type: 'flex', name: 'Flex Layout', styles: { desktop: { display: 'flex', gap: '20px', padding: '10px', minHeight: '100px', alignItems: 'flex-start', justifyContent: 'flex-start' } }, children: [] },
  },
  {
    type: 'grid', name: 'Grid', icon: <Grid size={20}/>, category: 'Layout',
    defaultElement: {
      type: 'grid', name: 'Grid', styles: {
        desktop: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '10px' },
        tablet: { gridTemplateColumns: 'repeat(2, 1fr)' },
        mobile: { gridTemplateColumns: '1fr' }
      },
      children: [
        { type: 'container', name: 'Grid Item 1', styles: { desktop: {} }, children: [{ type: 'text', name: 'Text', content: 'Grid Item 1', styles: { desktop: {} } }] },
        { type: 'container', name: 'Grid Item 2', styles: { desktop: {} }, children: [{ type: 'text', name: 'Text', content: 'Grid Item 2', styles: { desktop: {} } }] },
        { type: 'container', name: 'Grid Item 3', styles: { desktop: {} }, children: [{ type: 'text', name: 'Text', content: 'Grid Item 3', styles: { desktop: {} } }] }
      ]
    }
  },
  {
    type: 'navbar', name: 'Navbar', icon: <Navigation size={20}/>, category: 'Layout',
    defaultElement: {
      type: 'navbar', name: 'Navbar', styles: { desktop: { padding: '16px 32px', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      children: [
        { type: 'text', name: 'Logo', content: 'Proverve', styles: { desktop: { fontSize: '24px', fontWeight: 'bold' } } },
        { type: 'flex', name: 'Nav Links', styles: { desktop: { display: 'flex', gap: '24px' } }, children: [
          { type: 'text', name: 'Link 1', content: 'Home', styles: { desktop: { cursor: 'pointer' } } },
          { type: 'text', name: 'Link 2', content: 'About', styles: { desktop: { cursor: 'pointer' } } },
          { type: 'text', name: 'Link 3', content: 'Contact', styles: { desktop: { cursor: 'pointer' } } },
        ]}
      ]
    }
  },
  {
    type: 'card', name: 'Card', icon: <CreditCard size={20}/>, category: 'Layout',
    defaultElement: {
        type: 'card', name: 'Card', styles: { desktop: { backgroundColor: 'var(--color-surface-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' } },
        children: [
            { type: 'image', name: 'Card Image', props: { src: 'https://picsum.photos/400/250' }, styles: { desktop: { width: '100%', height: '200px', objectFit: 'cover' } } },
            { type: 'container', name: 'Card Body', styles: { desktop: { padding: '24px', gap: '12px' } }, children: [
                { type: 'heading', name: 'Card Title', content: 'Card Title', styles: { desktop: { fontSize: '24px' } } },
                { type: 'text', name: 'Card Content', content: 'This is a sample card component with an image and some text content.', styles: { desktop: { fontSize: '16px' } } }
            ]}
        ]
    }
  },
  {
    type: 'footer', name: 'Footer', icon: <GitCommit size={20}/>, category: 'Layout',
    defaultElement: {
        type: 'container', name: 'Footer', styles: { desktop: { padding: '40px', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' } },
        children: [
            { type: 'flex', name: 'Footer Content', styles: { desktop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' } }, children: [
                { type: 'text', name: 'Copyright', content: '© 2024 Proverve. All Rights Reserved.', styles: { desktop: { color: 'var(--color-text-secondary)', fontSize: '14px' } } },
                { type: 'flex', name: 'Footer Links', styles: { desktop: { display: 'flex', gap: '24px' } }, children: [
                    { type: 'text', name: 'Link 1', content: 'Privacy', styles: { desktop: { cursor: 'pointer', fontSize: '14px' } } },
                    { type: 'text', name: 'Link 2', content: 'Terms', styles: { desktop: { cursor: 'pointer', fontSize: '14px' } } },
                    { type: 'text', name: 'Link 3', content: 'Support', styles: { desktop: { cursor: 'pointer', fontSize: '14px' } } },
                ]},
                { type: 'flex', name: 'Social Icons', styles: { desktop: { display: 'flex', gap: '16px' } }, children: [
                    { type: 'icon', name: 'Twitter', props: { iconSet: 'fa', iconName: 'FaTwitter', size: 20 }, styles: { desktop: { cursor: 'pointer' } } },
                    { type: 'icon', name: 'GitHub', props: { iconSet: 'fa', iconName: 'FaGithub', size: 20 }, styles: { desktop: { cursor: 'pointer' } } },
                    { type: 'icon', name: 'LinkedIn', props: { iconSet: 'fa', iconName: 'FaLinkedin', size: 20 }, styles: { desktop: { cursor: 'pointer' } } },
                ]}
            ]}
        ]
    }
  },
  // Pro Components
  {
    type: 'hero-section', name: 'Hero Section', icon: <Shield size={20}/>, category: 'Pro',
    defaultElement: {
        type: 'container', name: 'Hero Section', styles: { desktop: { padding: '80px 40px', backgroundColor: 'var(--color-background)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' } },
        children: [
            { type: 'heading', name: 'Hero Title', content: 'Build The Future, Visually', styles: { desktop: { fontSize: '64px', fontWeight: 'bold' } } },
            { type: 'text', name: 'Hero Subtitle', content: 'The ultimate toolkit for creating stunning applications across web and mobile without writing a single line of code.', styles: { desktop: { fontSize: '20px', color: 'var(--color-text-secondary)', maxWidth: '700px' } } },
            { type: 'flex', name: 'CTA Buttons', styles: { desktop: { display: 'flex', gap: '16px', marginTop: '24px' } }, children: [
                { type: 'button', name: 'Primary CTA', content: 'Get Started Now', styles: { desktop: { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '16px 32px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '18px' } } },
                { type: 'button', name: 'Secondary CTA', content: 'Learn More', styles: { desktop: { backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-primary)', padding: '16px 32px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '18px' } } }
            ]}
        ]
    }
  },
  {
    type: 'stats-section', name: 'Stats', icon: <BarChart size={20}/>, category: 'Pro',
    defaultElement: {
      type: 'flex', name: 'Stats Section', styles: { desktop: { padding: '40px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', justifyContent: 'space-around', gap: '20px' } },
      children: [
        { type: 'flex', name: 'Stat Item 1', styles: { desktop: { flexDirection: 'column', alignItems: 'center', gap: '8px' } }, children: [
          { type: 'heading', name: 'Stat Number', content: '4M+', styles: { desktop: { fontSize: '48px', fontWeight: 'bold' } } },
          { type: 'text', name: 'Stat Label', content: 'Active Users', styles: { desktop: { color: 'var(--color-text-secondary)' } } }
        ]},
        { type: 'flex', name: 'Stat Item 2', styles: { desktop: { flexDirection: 'column', alignItems: 'center', gap: '8px' } }, children: [
          { type: 'heading', name: 'Stat Number', content: '100+', styles: { desktop: { fontSize: '48px', fontWeight: 'bold' } } },
          { type: 'text', name: 'Stat Label', content: 'Integrations', styles: { desktop: { color: 'var(--color-text-secondary)' } } }
        ]},
        { type: 'flex', name: 'Stat Item 3', styles: { desktop: { flexDirection: 'column', alignItems: 'center', gap: '8px' } }, children: [
          { type: 'heading', name: 'Stat Number', content: '99.9%', styles: { desktop: { fontSize: '48px', fontWeight: 'bold' } } },
          { type: 'text', name: 'Stat Label', content: 'Uptime', styles: { desktop: { color: 'var(--color-text-secondary)' } } }
        ]}
      ]
    }
  },
  {
    type: 'testimonial', name: 'Testimonial', icon: <Heart size={20}/>, category: 'Pro',
    defaultElement: {
      type: 'container', name: 'Testimonial', styles: { desktop: { padding: '40px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' } },
      children: [
        { type: 'image', name: 'Avatar', props: { src: 'https://picsum.photos/100' }, styles: { desktop: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' } } },
        { type: 'text', name: 'Quote', content: '"This tool has revolutionized our workflow. We can now prototype and ship ideas faster than ever before. Truly a game-changer!"', styles: { desktop: { fontSize: '20px', fontStyle: 'italic', color: 'var(--color-text-secondary)', maxWidth: '600px' } } },
        { type: 'flex', name: 'Author Info', styles: { desktop: { flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '16px' } }, children: [
          { type: 'text', name: 'Author Name', content: 'Jane Doe', styles: { desktop: { fontWeight: '600', fontSize: '18px' } } },
          { type: 'text', name: 'Author Title', content: 'CEO, Tech Innovators', styles: { desktop: { color: 'var(--color-text-tertiary)' } } }
        ]}
      ]
    }
  },
  {
    type: 'pricing-table', name: 'Pricing Table', icon: <CreditCard size={20}/>, category: 'Pro',
    defaultElement: {
      type: 'flex', name: 'Pricing Table', styles: { desktop: { padding: '40px', gap: '32px', alignItems: 'center', justifyContent: 'center' } },
      children: [
        // Basic Plan
        { type: 'container', name: 'Basic Plan', styles: { desktop: { padding: '32px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '24px', flex: '1', maxWidth: '350px' } }, children: [
          { type: 'heading', name: 'Plan Name', content: 'Basic', styles: { desktop: { fontSize: '24px', fontWeight: 'bold' } } },
          { type: 'heading', name: 'Price', content: '$10/mo', styles: { desktop: { fontSize: '48px', fontWeight: 'bold' } } },
          { type: 'text', name: 'Feature List', content: '✓ Feature One\n✓ Feature Two\n✓ Feature Three', styles: { desktop: { whiteSpace: 'pre-line', color: 'var(--color-text-secondary)', lineHeight: '2' } } },
          { type: 'button', name: 'CTA Button', content: 'Choose Plan', styles: { desktop: { width: '100%', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' } } }
        ]},
        // Pro Plan (Featured)
        { type: 'container', name: 'Pro Plan', styles: { desktop: { padding: '40px', border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '24px', flex: '1', maxWidth: '350px', transform: 'scale(1.05)', backgroundColor: 'var(--color-surface)' } }, children: [
          { type: 'heading', name: 'Plan Name', content: 'Pro', styles: { desktop: { fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' } } },
          { type: 'heading', name: 'Price', content: '$25/mo', styles: { desktop: { fontSize: '48px', fontWeight: 'bold' } } },
          { type: 'text', name: 'Feature List', content: '✓ All Basic Features\n✓ Feature Four\n✓ Feature Five', styles: { desktop: { whiteSpace: 'pre-line', color: 'var(--color-text-secondary)', lineHeight: '2' } } },
          { type: 'button', name: 'CTA Button', content: 'Choose Plan', styles: { desktop: { width: '100%', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' } } }
        ]}
      ]
    }
  },
  // Form Elements
  {
    type: 'form', name: 'Form', icon: <FormInput size={20}/>, category: 'Form',
    defaultElement: { type: 'form', name: 'Form', styles: { desktop: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' } }, children: [] },
  },
  {
    type: 'input', name: 'Input', icon: <Type size={20}/>, category: 'Form',
    defaultElement: { type: 'input', name: 'Input', props: { placeholder: 'Enter text...', type: 'text' }, styles: { desktop: { width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-primary)' } }, children: [] },
  },
  {
    type: 'textarea', name: 'Textarea', icon: <MessageSquare size={20}/>, category: 'Form',
    defaultElement: { type: 'textarea', name: 'Textarea', props: { placeholder: 'Enter more text...' }, styles: { desktop: { width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-primary)', minHeight: '100px' } }, children: [] },
  },
  {
    type: 'label', name: 'Label', icon: <Tag size={20}/>, category: 'Form',
    defaultElement: { type: 'label', name: 'Label', content: 'Field Label', styles: { desktop: { display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' } }, children: [] },
  },
];


export const NATIVE_COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'View', name: 'View', icon: <Square size={20}/>, category: 'Native',
    defaultElement: { type: 'View', name: 'View', styles: { desktop: { padding: 24, backgroundColor: '#1A1C2C', minHeight: 100, borderRadius: 12, borderWidth: 1, borderColor: '#3A3D5A' } }, children: [] },
  },
   {
    type: 'scrollView', name: 'Scroll View', icon: <ChevronsUpDown size={20}/>, category: 'Native',
    defaultElement: { type: 'scrollView', name: 'Scroll View', styles: { desktop: { padding: 10, flex: 1 } }, children: [] },
  },
  {
    type: 'Text', name: 'Text', icon: <Text size={20}/>, category: 'Native',
    defaultElement: { type: 'Text', name: 'Text', content: 'This is a Text component.', styles: { desktop: { color: '#E0E0FF', fontSize: 16, padding: 10 } }, children: [] },
  },
  {
    type: 'Image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Native',
    defaultElement: { type: 'Image', name: 'Image', props: { src: 'https://picsum.photos/300/200' }, styles: { desktop: { width: '100%', height: 200, borderRadius: 12 } }, children: [] },
  },
  {
    type: 'icon', name: 'Icon', icon: <Star size={20}/>, category: 'Native',
    defaultElement: { type: 'icon', name: 'Icon', props: { iconSet: 'md', iconName: 'MdStar', size: 32, color: '#8A42F4' }, styles: { desktop: {} } },
  },
  {
    type: 'Button', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Native',
    defaultElement: { type: 'Button', name: 'Button', styles: { desktop: { backgroundColor: '#8A42F4', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 8, alignItems: 'center' } }, children: [{ type: 'Text', name: 'Button Text', content: 'Press Me', styles: { desktop: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 } } }] },
  },
  {
    type: 'TextInput', name: 'Text Input', icon: <Type size={20}/>, category: 'Native',
    defaultElement: { type: 'TextInput', name: 'Text Input', props: { placeholder: 'Enter text...' }, styles: { desktop: { width: '100%', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#3A3D5A', backgroundColor: '#2A4D42', color: '#E0E0FF' } }, children: [] },
  },
   {
    type: 'ARView', name: 'AR View', icon: <Phone size={20}/>, category: 'Native',
    defaultElement: { type: 'ARView', name: 'AR View', styles: { desktop: { flex: 1, backgroundColor: '#000000' } }, children: [] },
  },
];

export const FLUTTER_COMPONENT_LIBRARY: ComponentDefinition[] = [
    {
        type: 'Container', name: 'Container', icon: <Box size={20}/>, category: 'Flutter',
        defaultElement: { type: 'Container', name: 'Container', styles: { desktop: { padding: { all: 16 }, color: '#1A1C2C', borderRadius: 12 } }, children: [] },
    },
    {
        type: 'Column', name: 'Column', icon: <Columns size={20}/>, category: 'Flutter',
        defaultElement: { type: 'Column', name: 'Column', styles: { desktop: { padding: { all: 8 }, mainAxisAlignment: 'start' } }, children: [] },
    },
    {
        type: 'Row', name: 'Row', icon: <Rows size={20}/>, category: 'Flutter',
        defaultElement: { type: 'Row', name: 'Row', styles: { desktop: { padding: { all: 8 }, mainAxisAlignment: 'start' } }, children: [] },
    },
    {
        type: 'Text', name: 'Text', icon: <Text size={20}/>, category: 'Flutter',
        defaultElement: { type: 'Text', name: 'Text', content: 'Hello, Flutter!', styles: { desktop: { color: '#E0E0FF', fontSize: 16 } }, children: [] },
    },
    {
        type: 'Image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Flutter',
        defaultElement: { type: 'Image', name: 'Image', props: { src: 'https://picsum.photos/300' }, styles: { desktop: { width: 150, height: 150 } }, children: [] },
    },
    {
        type: 'ElevatedButton', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Flutter',
        defaultElement: { type: 'ElevatedButton', name: 'Button', styles: { desktop: { backgroundColor: '#8A42F4', foregroundColor: '#FFFFFF', padding: { horizontal: 16, vertical: 8 } } }, children: [{ type: 'Text', name: 'Button Text', content: 'Press Me', styles: { desktop: { color: '#FFFFFF' } } }] },
    }
];

export const KOTLIN_COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'Column', name: 'Column', icon: <Columns size={20}/>, category: 'Kotlin',
    defaultElement: { type: 'Column', name: 'Column', styles: { desktop: { padding: 16, backgroundColor: '#1A1C2C', verticalArrangement: 'Top' } }, children: [] },
  },
  {
    type: 'Row', name: 'Row', icon: <Rows size={20}/>, category: 'Kotlin',
    defaultElement: { type: 'Row', name: 'Row', styles: { desktop: { padding: 16, horizontalArrangement: 'Start' } }, children: [] },
  },
  {
    type: 'Text', name: 'Text', icon: <Text size={20}/>, category: 'Kotlin',
    defaultElement: { type: 'Text', name: 'Text', content: 'Hello, Compose!', styles: { desktop: { color: '#E0E0FF', fontSize: 16 } }, children: [] },
  },
  {
    type: 'Button', name: 'Button', icon: <MousePointerClick size={20}/>, category: 'Kotlin',
    defaultElement: { type: 'Button', name: 'Button', styles: { desktop: { } }, children: [{ type: 'Text', name: 'Button Text', content: 'Click Me', styles: { desktop: { color: '#FFFFFF' } } }] },
  },
  {
    type: 'Image', name: 'Image', icon: <ImageIcon size={20}/>, category: 'Kotlin',
    defaultElement: { type: 'Image', name: 'Image', props: { src: 'https://picsum.photos/300' }, styles: { desktop: { width: 150, height: 150 } }, children: [] },
  },
];

export const componentLibrary = {
  web: WEB_COMPONENT_LIBRARY,
  native: NATIVE_COMPONENT_LIBRARY,
  flutter: FLUTTER_COMPONENT_LIBRARY,
  kotlin: KOTLIN_COMPONENT_LIBRARY,
};