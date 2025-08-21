import { Template } from '../types';
import React from 'react';
import { LayoutDashboard, Presentation, User, ShoppingCart, MessageSquare, ChevronsUpDown } from 'lucide-react';

export const TEMPLATES: Template[] = [
    {
        name: 'User Profile Card',
        icon: React.createElement(User),
        category: 'Cards',
        elements: [{
            type: 'card', name: 'Profile Card', styles: { desktop: { width: '320px', textAlign: 'center' } },
            dataSource: { content: 'user' },
            children: [
                { type: 'image', name: 'Avatar', props: { src: '{{user.avatar}}' }, styles: { desktop: { width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 16px' } } },
                { type: 'heading', name: 'Full Name', content: '{{user.name}}', styles: { desktop: { fontSize: '24px' } } },
                { type: 'text', name: 'Job Title', content: '{{user.title}}', styles: { desktop: { color: 'var(--color-text-secondary)', margin: '4px 0 16px' } } },
                { type: 'button', name: 'View Profile', content: 'View Profile', styles: { desktop: { width: '100%' } } }
            ]
        }]
    },
    {
        name: 'Contact Form',
        icon: React.createElement(MessageSquare),
        category: 'Forms',
        elements: [{
            type: 'form', name: 'Contact Form', styles: { desktop: { maxWidth: '500px', margin: '0 auto', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: '12px' } },
            children: [
                { type: 'heading', name: 'Form Title', content: 'Contact Us', styles: { desktop: { textAlign: 'center', marginBottom: '24px' } } },
                { type: 'flex', name: 'Name Fields', styles: { desktop: { gap: '16px', marginBottom: '16px' } },
                    children: [
                        { type: 'container', name: 'First Name Wrapper', styles: { desktop: { flex: 1 } }, children: [
                            { type: 'label', name: 'First Name Label', content: 'First Name', styles: { desktop: {} } },
                            { type: 'input', name: 'First Name Input', dataSource: { bindValue: 'firstName' }, props: { placeholder: 'John' }, styles: { desktop: { marginTop: '8px' } } }
                        ]},
                        { type: 'container', name: 'Last Name Wrapper', styles: { desktop: { flex: 1 } }, children: [
                            { type: 'label', name: 'Last Name Label', content: 'Last Name', styles: { desktop: {} } },
                            { type: 'input', name: 'Last Name Input', dataSource: { bindValue: 'lastName' }, props: { placeholder: 'Doe' }, styles: { desktop: { marginTop: '8px' } } }
                        ]}
                    ]
                },
                { type: 'label', name: 'Email Label', content: 'Email Address', styles: { desktop: {} } },
                { type: 'input', name: 'Email Input', dataSource: { bindValue: 'email' }, props: { placeholder: 'you@example.com', type: 'email' }, styles: { desktop: { marginTop: '8px', marginBottom: '16px' } } },
                { type: 'label', name: 'Message Label', content: 'Message', styles: { desktop: {} } },
                { type: 'textarea', name: 'Message Textarea', dataSource: { bindValue: 'message' }, props: { placeholder: 'Your message...' }, styles: { desktop: { marginTop: '8px', marginBottom: '24px' } } },
                { type: 'button', name: 'Submit Button', content: 'Send Message', styles: { desktop: { width: '100%', padding: '16px' } } }
            ]
        }]
    },
    {
        name: 'Accordion',
        icon: React.createElement(ChevronsUpDown),
        category: 'Components',
        elements: [
            { type: 'accordion', name: 'Accordion 1', styles: { desktop: {} } },
            { type: 'accordion', name: 'Accordion 2', styles: { desktop: {} } },
        ]
    },
    {
        name: 'E-commerce Product Grid',
        icon: React.createElement(ShoppingCart),
        category: 'Grids',
        elements: [{
            type: 'grid', name: 'Product Grid', styles: { desktop: { gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' } },
            dataSource: { repeat: { dataKey: 'products', itemName: 'product' } },
            children: [
                {
                    type: 'card', name: 'Product Card', styles: { desktop: {} }, children: [
                        { type: 'image', name: 'Product Image', props: { src: '{{product.imageUrl}}' }, styles: { desktop: { width: '100%', height: '200px', objectFit: 'cover' } } },
                        { type: 'container', name: 'Card Content', styles: { desktop: { padding: '16px' } },
                            children: [
                                { type: 'heading', name: 'Product Name', content: '{{product.name}}', styles: { desktop: { fontSize: '18px' } } },
                                { type: 'text', name: 'Product Price', content: '${{product.price}}', styles: { desktop: { fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '8px 0' } } },
                                { type: 'button', name: 'Add to Cart', content: 'Add to Cart', styles: { desktop: { width: '100%' } } }
                            ]
                        }
                    ]
                }
            ]
        }]
    },
    {
        name: 'Landing Page',
        icon: React.createElement(Presentation),
        category: 'Full Pages',
        elements: [
            {
                type: 'container',
                name: 'Landing Page Wrapper',
                styles: { desktop: { backgroundColor: 'var(--color-background)' } },
                children: [
                    // Navbar
                    { type: 'navbar', name: 'Navbar', styles: { desktop: { padding: '16px 40px', position: 'sticky', top: '0', zIndex: '50', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(13, 15, 26, 0.5)' } } },
                    // Hero
                    {
                        type: 'container', name: 'Hero Section', styles: { desktop: { textAlign: 'center', padding: '100px 20px' } },
                        children: [
                            { type: 'heading', name: 'Main Headline', content: 'Build Your Next Idea Faster', styles: { desktop: { fontSize: '64px', fontWeight: 'bold' } } },
                            { type: 'text', name: 'Subtitle', content: 'The ultimate visual builder for modern applications, powered by AI.', styles: { desktop: { fontSize: '20px', color: 'var(--color-text-secondary)', marginTop: '16px', maxWidth: '600px', margin: '16px auto' } } },
                            { type: 'button', name: 'CTA Button', content: 'Start Building Now', styles: { desktop: { marginTop: '32px', padding: '16px 32px', fontSize: '18px' } } },
                        ]
                    },
                    // Features
                    {
                        type: 'container', name: 'Features Section', styles: { desktop: { padding: '80px 20px', backgroundColor: 'var(--color-surface)' } },
                        children: [
                             { type: 'heading', name: 'Features Title', content: 'Why Choose Pro-Verve?', styles: { desktop: { textAlign: 'center', fontSize: '42px', marginBottom: '60px' } } },
                             { type: 'grid', name: 'Features Grid', styles: { desktop: { gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', maxWidth: '1200px', margin: '0 auto' } },
                                children: [
                                    { type: 'card', name: 'Feature 1 Card', styles: { desktop: {} }, children: [
                                        { type: 'heading', name: 'Feature 1 Title', content: 'AI-Powered', styles: { desktop: { fontSize: '24px', marginBottom: '12px' } } },
                                        { type: 'text', name: 'Feature 1 Desc', content: 'Generate layouts, styles, and code with simple text prompts.', styles: { desktop: {} } }
                                    ]},
                                    { type: 'card', name: 'Feature 2 Card', styles: { desktop: {} }, children: [
                                        { type: 'heading', name: 'Feature 2 Title', content: 'Cross-Platform', styles: { desktop: { fontSize: '24px', marginBottom: '12px' } } },
                                        { type: 'text', name: 'Feature 2 Desc', content: 'Build for Web, React Native, Flutter, and Kotlin from one place.', styles: { desktop: {} } }
                                    ]},
                                    { type: 'card', name: 'Feature 3 Card', styles: { desktop: {} }, children: [
                                        { type: 'heading', name: 'Feature 3 Title', content: 'Live Preview', styles: { desktop: { fontSize: '24px', marginBottom: '12px' } } },
                                        { type: 'text', name: 'Feature 3 Desc', content: 'Instantly see your changes and interact with your app as you build.', styles: { desktop: {} } }
                                    ]},
                                ]
                             }
                        ]
                    },
                    // Footer
                    { type: 'footer', name: 'Footer', styles: { desktop: { marginTop: '0' } } }
                ]
            }
        ]
    },
    {
        name: 'Dashboard UI',
        icon: React.createElement(LayoutDashboard),
        category: 'Full Pages',
        elements: [
            {
                type: 'flex', name: 'Dashboard Layout', styles: { desktop: { height: '100vh', width: '100%', backgroundColor: 'var(--color-background)' } },
                children: [
                    // Sidebar
                    {
                        type: 'container', name: 'Dashboard Sidebar', styles: { desktop: { width: '250px', backgroundColor: 'var(--color-surface)', padding: '24px' } },
                        children: [
                            { type: 'heading', name: 'Dashboard Title', content: 'Dashboard', styles: { desktop: { marginBottom: '32px' } } },
                            { type: 'list', name: 'Nav List', styles: { desktop: {} }, children: [
                                { type: 'text', name: 'Overview Link', content: 'Overview', styles: { desktop: { padding: '12px 0', cursor: 'pointer' } } },
                                { type: 'text', name: 'Analytics Link', content: 'Analytics', styles: { desktop: { padding: '12px 0', cursor: 'pointer' } } },
                                { type: 'text', name: 'Settings Link', content: 'Settings', styles: { desktop: { padding: '12px 0', cursor: 'pointer' } } },
                            ]}
                        ]
                    },
                    // Main Content
                    {
                        type: 'container', name: 'Main Content', styles: { desktop: { flexGrow: '1', padding: '40px', overflowY: 'auto' } },
                        children: [
                            { type: 'heading', name: 'Content Title', content: 'Welcome Back!', styles: { desktop: { fontSize: '36px', marginBottom: '40px' } } },
                            { type: 'grid', name: 'Stats Grid', styles: { desktop: { gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' } },
                                children: [
                                    { type: 'card', name: 'Stat Card 1', styles: { desktop: {} }, children: [
                                        { type: 'text', name: 'Stat Title 1', content: 'Revenue', styles: { desktop: { color: 'var(--color-text-secondary)' } } },
                                        { type: 'heading', name: 'Stat Value 1', content: '$45,231', styles: { desktop: { fontSize: '28px' } } }
                                    ]},
                                    { type: 'card', name: 'Stat Card 2', styles: { desktop: {} }, children: [
                                        { type: 'text', name: 'Stat Title 2', content: 'New Users', styles: { desktop: { color: 'var(--color-text-secondary)' } } },
                                        { type: 'heading', name: 'Stat Value 2', content: '1,204', styles: { desktop: { fontSize: '28px' } } }
                                    ]},
                                    { type: 'card', name: 'Stat Card 3', styles: { desktop: {} }, children: [
                                        { type: 'text', name: 'Stat Title 3', content: 'Active Now', styles: { desktop: { color: 'var(--color-text-secondary)' } } },
                                        { type: 'heading', name: 'Stat Value 3', content: '72', styles: { desktop: { fontSize: '28px' } } }
                                    ]},
                                ]
                            },
                             { type: 'heading', name: 'Recent Activity', content: 'Recent Activity', styles: { desktop: { fontSize: '24px', marginBottom: '24px' } } },
                             { type: 'card', name: 'Activity Card', styles: { desktop: {} }, children: [
                                 { type: 'list', name: 'Activity List', styles: { desktop: {} }, children: [
                                     { type: 'text', name: 'Activity Item 1', content: 'User "alex" signed up.', styles: { desktop: {} } },
                                     { type: 'text', name: 'Activity Item 2', content: 'New sale recorded: $199.', styles: { desktop: {} } },
                                     { type: 'text', name: 'Activity Item 3', content: 'Server CPU usage at 85%.', styles: { desktop: {} } },
                                 ]}
                             ]}
                        ]
                    }
                ]
            }
        ]
    }
];
