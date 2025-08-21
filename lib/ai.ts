
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Element, Style, ProjectType, ThemeState, DeepPartial, ElementTemplate, ActionStep, StateVariable, PageTemplate, PropDefinition, ThemeToken } from '../types';
import { toast } from 'react-hot-toast';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface Theme {
    variables?: { [key: string]: string };
    baseStyles: { [elementType: string]: Style };
}

// --- Common Schemas
const webProps = { src: { type: Type.STRING, nullable: true }, alt: { type: Type.STRING, nullable: true }, placeholder: { type: Type.STRING, nullable: true }, type: { type: Type.STRING, nullable: true } };
const nativeProps = { src: { type: Type.STRING, nullable: true }, placeholder: { type: Type.STRING, nullable: true } };
const flutterProps = { src: { type: Type.STRING, nullable: true }};

const webStyleProperties = { color: { type: Type.STRING, nullable: true }, backgroundColor: { type: Type.STRING, nullable: true }, background: { type: Type.STRING, nullable: true }, padding: { type: Type.STRING, nullable: true }, margin: { type: Type.STRING, nullable: true }, borderRadius: { type: Type.STRING, nullable: true }, fontSize: { type: Type.STRING, nullable: true }, fontWeight: { type: Type.STRING, nullable: true }, textAlign: { type: Type.STRING, nullable:true }, width: { type: Type.STRING, nullable: true }, height: { type: Type.STRING, nullable: true }, minHeight: { type: Type.STRING, nullable: true }, display: { type: Type.STRING, nullable: true }, flexDirection: { type: Type.STRING, nullable: true }, justifyContent: { type: Type.STRING, nullable: true }, alignItems: { type: Type.STRING, nullable: true }, gap: { type: Type.STRING, nullable: true }, border: { type: Type.STRING, nullable: true }, borderBottom: { type: Type.STRING, nullable: true }, objectFit: { type: Type.STRING, nullable: true }, cursor: { type: Type.STRING, nullable: true }, boxShadow: { type: Type.STRING, nullable: true }, lineHeight: { type: Type.STRING, nullable: true }, transition: { type: Type.STRING, nullable: true }, marginBottom: { type: Type.STRING, nullable: true }, flexGrow: { type: Type.STRING, nullable: true }, flexShrink: { type: Type.STRING, nullable: true }, flexBasis: { type: Type.STRING, nullable: true }, alignSelf: { type: Type.STRING, nullable: true }, transform: { type: Type.STRING, nullable: true }, };
const nativeStyleProperties = { color: { type: Type.STRING, nullable: true }, backgroundColor: { type: Type.STRING, nullable: true }, padding: { type: Type.NUMBER, nullable: true }, margin: { type: Type.NUMBER, nullable: true }, borderRadius: { type: Type.NUMBER, nullable: true }, fontSize: { type: Type.NUMBER, nullable: true }, fontWeight: { type: Type.STRING, nullable: true }, width: { type: Type.STRING, nullable: true }, height: { type: Type.NUMBER, nullable: true }, borderWidth: { type: Type.NUMBER, nullable: true }, borderColor: { type: Type.STRING, nullable: true }, flexDirection: { type: Type.STRING, nullable: true }, justifyContent: { type: Type.STRING, nullable: true }, alignItems: { type: Type.STRING, nullable: true }, gap: { type: Type.NUMBER, nullable: true }};
const flutterStyleProperties = {
  color: { type: Type.STRING, nullable: true, description: "Background color as a hex string e.g., '#FFFFFF'" },
  padding: { type: Type.OBJECT, nullable: true, properties: { all: { type: Type.NUMBER, nullable: true }, horizontal: { type: Type.NUMBER, nullable: true }, vertical: { type: Type.NUMBER, nullable: true }, top: { type: Type.NUMBER, nullable: true }, bottom: { type: Type.NUMBER, nullable: true }, left: { type: Type.NUMBER, nullable: true }, right: { type: Type.NUMBER, nullable: true } } },
  borderRadius: { type: Type.NUMBER, nullable: true },
  fontSize: { type: Type.NUMBER, nullable: true },
  fontWeight: { type: Type.STRING, nullable: true, description: "e.g., 'bold'" },
  width: { type: Type.NUMBER, nullable: true },
  height: { type: Type.NUMBER, nullable: true },
  mainAxisAlignment: { type: Type.STRING, nullable: true, description: "e.g., 'center', 'start', 'end', 'spaceBetween'" },
};

const animationKeyframeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique ID for the keyframe" },
        properties: { type: Type.OBJECT, properties: webStyleProperties, description: "CSS properties for this keyframe" },
        duration: { type: Type.NUMBER, description: "Duration in milliseconds" },
        delay: { type: Type.NUMBER, description: "Delay in milliseconds before this keyframe" },
        easing: { type: Type.STRING, description: "CSS easing function, e.g., 'ease-in-out'" }
    }
};

const elementAnimationSchema = {
    type: Type.ARRAY,
    nullable: true,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "Unique ID for the animation" },
            trigger: { type: Type.STRING, enum: ['onPageLoad', 'onClick', 'onHover', 'onScrollView'], description: "Event that triggers the animation" },
            name: { type: Type.STRING, description: "A descriptive name for the animation" },
            keyframes: { type: Type.ARRAY, items: animationKeyframeSchema }
        }
    }
};

const makeElementSchema = (projectType: ProjectType, depth: number = 2): any => {
    let elementTypes: string[], styleProps: object, props: object;
    switch(projectType) {
        case 'native': elementTypes = ['View', 'Text', 'Image', 'Button', 'TextInput', 'ScrollView', 'Icon', 'ARView']; styleProps = nativeStyleProperties; props = nativeProps; break;
        case 'flutter': elementTypes = ['Container', 'Column', 'Row', 'Text', 'Image', 'ElevatedButton']; styleProps = flutterStyleProperties; props = flutterProps; break;
        case 'kotlin': elementTypes = ['Column', 'Row', 'Text', 'Button', 'Image']; styleProps = {}; props = {}; break; // Kotlin schema simplified as it's not the focus
        case 'web': default: elementTypes = ['container', 'flex', 'grid', 'heading', 'text', 'button', 'image', 'icon', 'card', 'navbar', 'video', 'form', 'input', 'textarea', 'label', 'tabs', 'tab-panel', 'progress-bar']; styleProps = webStyleProperties; props = webProps; break;
    }
    const baseElement = {
        type: { type: Type.STRING, enum: elementTypes }, name: { type: Type.STRING },
        content: { type: Type.STRING, nullable: true },
        props: { type: Type.OBJECT, properties: props, nullable: true },
        styles: { type: Type.OBJECT, properties: { desktop: { type: Type.OBJECT, properties: styleProps } } },
        animations: projectType === 'web' ? elementAnimationSchema : { type: Type.NULL, nullable: true },
    };
    if (depth <= 0) return { type: Type.OBJECT, properties: { ...baseElement, children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} }, nullable: true } } };
    const recursiveSchema: any = { ...baseElement };
    recursiveSchema.children = { type: Type.ARRAY, items: makeElementSchema(projectType, depth - 1), nullable: true };
    return { type: Type.OBJECT, properties: recursiveSchema };
};

const generateLayout = async (prompt: string, projectType: ProjectType, theme: ThemeState, image?: string, url?: string): Promise<ElementTemplate[]> => {
    const platformName = projectType === 'native' ? 'React Native' : projectType.charAt(0).toUpperCase() + projectType.slice(1);
    const stylingInstruction = {
        'web': "Use CSS style values as strings.",
        'native': "Use React Native style values (numbers for sizes, strings for colors/enums).",
        'flutter': "Use Flutter style values (numbers for sizes, hex strings for colors, enums for alignment). For padding, use an object like {'all': 8}.",
        'kotlin': "For Kotlin/Compose, use appropriate style values (numbers for dp sizes, hex strings for colors)."
    };
    const websiteSchema = { type: Type.ARRAY, items: makeElementSchema(projectType, 3) };
    
    const themeSummary = `
        Current theme information for context:
        - Primary Color: ${theme.colors.find(c => c.name === 'Primary')?.value}
        - Background Color: ${theme.variables['--color-background']}
        - Surface Color: ${theme.variables['--color-surface']}
        - Primary Text Color: ${theme.colors.find(c => c.name === 'Text')?.value}
        - Primary Font: ${theme.fonts.primary}
        - Body Font: ${theme.fonts.body}
        
        Generate a layout that is visually consistent with this theme. When defining styles for elements, try to use these colors and font styles where appropriate.
        For colors, prefer using the CSS variables provided (e.g., 'var(--color-primary)').
    `;

    let fullPrompt: string;
    if (url) {
        fullPrompt = `You are an expert web developer. Analyze the layout, components, and general style of the website at the following URL: ${url}. 
        Do not copy content verbatim, but replicate the structure and visual hierarchy with placeholder text. 
        Generate a component tree in JSON format for a ${platformName} application that represents this website.
        ${themeSummary}
        Adhere to the following styling rules: ${stylingInstruction[projectType]}. 
        Ensure the generated JSON matches the provided schema precisely.
        Give every element a descriptive 'name' property.`;
    } else {
        fullPrompt = `Generate a component tree for a ${platformName} application based on the following prompt: "${prompt}". 
        ${themeSummary}
        The tree should be a hierarchical structure of components with properties for content, styling, and children. 
        Adhere to the following styling rules: ${stylingInstruction[projectType]}. 
        Ensure the generated JSON matches the provided schema precisely.
        Give every element a descriptive 'name' property.`;
    }


    const contents = image 
        ? { parts: [{ text: fullPrompt }, { inlineData: { mimeType: 'image/png', data: image.split(',')[1] } }] }
        : fullPrompt;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: websiteSchema,
      },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse AI response:", e);
        console.log("Raw response:", response.text);
        throw new Error("AI returned an invalid layout structure. Please try again.");
    }
};


export async function generateWebsiteFromPrompt(prompt: string, projectType: ProjectType, theme: ThemeState): Promise<ElementTemplate[]> {
  const toastId = toast.loading(`Generating ${projectType} layout...`);
  try {
      const result = await generateLayout(prompt, projectType, theme);
      toast.success('Layout generated!', { id: toastId });
      return result;
  } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Layout generation failed', { id: toastId });
      throw e;
  }
}

export async function generateMultiPageWebsiteFromPrompt(prompt: string, projectType: ProjectType, theme: ThemeState): Promise<PageTemplate[]> {
    const toastId = toast.loading(`Generating multi-page ${projectType} website...`);
    try {
        const pageSchema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the page (e.g., 'Home', 'About Us')." },
                elements: { type: Type.ARRAY, items: makeElementSchema(projectType, 3) }
            }
        };

        const multiPageSchema = {
            type: Type.ARRAY,
            items: pageSchema
        };

        const fullPrompt = `Generate a component tree for a multi-page ${projectType} application based on the following business brief: "${prompt}". 
        Create a few logical pages like Home, About, Services, Contact, etc.
        For each page, provide a name and a hierarchical structure of components.
        A theme is provided for styling context: ${JSON.stringify(theme)}. Use CSS variables from the theme where possible.
        Ensure the generated JSON matches the provided schema precisely. Give every element a descriptive 'name' property.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: multiPageSchema,
            },
        });
        
        const result = JSON.parse(response.text.trim());
        toast.success('Multi-page website generated!', { id: toastId });
        return result;
    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Multi-page website generation failed', { id: toastId });
        throw e;
    }
}

export async function generateLayoutFromImage(prompt: string, image: string, projectType: ProjectType, theme: ThemeState): Promise<ElementTemplate[]> {
    const toastId = toast.loading(`Generating ${projectType} layout from image...`);
    try {
        const result = await generateLayout(prompt, projectType, theme, image);
        toast.success('Layout generated!', { id: toastId });
        return result;
    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Layout generation failed', { id: toastId });
        throw e;
    }
}

export async function generateLayoutFromUrl(url: string, projectType: ProjectType, theme: ThemeState): Promise<ElementTemplate[]> {
    const toastId = toast.loading(`Generating layout from URL...`);
    try {
        const result = await generateLayout(`A page based on the structure of ${url}`, projectType, theme, undefined, url);
        toast.success('Layout generated!', { id: toastId });
        return result;
    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Layout generation from URL failed', { id: toastId });
        throw e;
    }
}


export async function generateThemeFromPrompt(prompt: string, projectType: ProjectType): Promise<Theme> {
    const toastId = toast.loading(`Generating ${projectType} theme...`);
    
    const themeSchema = {
        type: Type.OBJECT,
        properties: {
            variables: {
                type: Type.OBJECT,
                properties: {
                    '--color-background': { type: Type.STRING },
                    '--color-surface': { type: Type.STRING },
                    '--color-primary': { type: Type.STRING },
                    '--color-primary-contrast': { type: Type.STRING },
                    '--color-text-primary': { type: Type.STRING },
                    '--color-text-secondary': { type: Type.STRING },
                }
            },
            baseStyles: {
                type: Type.OBJECT,
                properties: {
                    heading: { type: Type.OBJECT, properties: webStyleProperties },
                    text: { type: Type.OBJECT, properties: webStyleProperties },
                    button: { type: Type.OBJECT, properties: webStyleProperties },
                }
            }
        }
    };
    
    const fullPrompt = `Generate a theme for a ${projectType} app based on this description: "${prompt}". 
    Provide values for the CSS variables and base styles for common elements like headings, text, and buttons. 
    Ensure the JSON output matches the schema.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: themeSchema,
        },
      });

    try {
        toast.success('Theme generated!', { id: toastId });
        return JSON.parse(response.text.trim());
    } catch (e) {
        toast.error('Theme generation failed.', { id: toastId });
        throw new Error("AI returned an invalid theme structure.");
    }
}

export async function generateDesignSystemFromPrompt(prompt: string): Promise<Partial<ThemeState>> {
    const tokenSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique ID for the token (e.g., c1, f1, s1)" },
            name: { type: Type.STRING, description: "A descriptive name (e.g., Primary, Accent, Base, Large)" },
            value: { type: Type.STRING, description: "The CSS value (e.g., #FFFFFF, 16px, 1rem)" },
            description: { type: Type.STRING, nullable: true, description: "A brief explanation of the token's purpose." }
        }
    };

    const designSystemSchema = {
        type: Type.OBJECT,
        properties: {
            fonts: {
                type: Type.OBJECT,
                properties: {
                    primary: { type: Type.STRING, description: "The name of the primary font from Google Fonts (e.g., 'Roboto')." },
                    body: { type: Type.STRING, description: "The name of the body font from Google Fonts (e.g., 'Inter')." }
                }
            },
            colors: {
                type: Type.ARRAY,
                items: tokenSchema,
                description: "A palette of 6-8 colors, including primary, secondary, accent, surface, background, and text colors."
            },
            fontSizes: {
                type: Type.ARRAY,
                items: tokenSchema,
                description: "A typographic scale of 4-5 font sizes (e.g., sm, base, lg, xl, xxl) with pixel values."
            },
            spacing: {
                type: Type.ARRAY,
                items: tokenSchema,
                description: "A spacing scale of 4-5 sizes (e.g., sm, md, lg) with pixel values."
            },
            radii: {
                type: Type.ARRAY,
                items: tokenSchema,
                description: "A border radius scale of 3-4 sizes (e.g., sm, md, lg) with pixel values."
            }
        }
    };

    const fullPrompt = `
        You are an expert Brand and UI/UX Designer. Based on the following brand description, generate a complete and cohesive design system.
        
        Brand Description: "${prompt}"

        Your task is to generate a structured JSON object that defines the design system.
        - **Fonts:** Choose two appropriate and harmonious fonts from Google Fonts, one for headings (primary) and one for body text.
        - **Colors:** Create a palette of 6-8 colors. Ensure there are distinct colors for primary actions, background, surfaces, and text (primary and secondary). The 'name' for each color should be descriptive (e.g., 'Primary Action', 'Background', 'Subtle Border').
        - **Font Sizes, Spacing, Radii:** Create clear, consistent, and rhythmic scales for each. Use pixel values. Names should be descriptive (e.g., 'Small', 'Base', 'Large').
        - Ensure the output matches the provided JSON schema exactly.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: designSystemSchema,
        },
    });

    return JSON.parse(response.text.trim());
}


export async function generateTextFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short piece of text based on the following prompt, and only return the text itself without any extra formatting or labels: "${prompt}"`,
    });
    return response.text.trim();
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
}

export async function generateIconFromPrompt(prompt: string): Promise<string> {
    const fullPrompt = `A simple, flat, single-color, SVG-style icon of ${prompt} on a transparent background.`;
    return generateImageFromPrompt(fullPrompt);
}

export async function generateStylesFromPrompt(prompt: string, elementType: string, projectType: ProjectType, mode: 'css' | 'tailwind' = 'css'): Promise<Style | string> {
    let responseSchema: any;
    let fullPrompt: string;
    
    if (mode === 'tailwind') {
        fullPrompt = `Generate a single string of Tailwind CSS utility classes for a '${elementType}' element, styled to look like: "${prompt}". Only return the string of class names.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        return response.text.trim().replace(/"/g, ''); // Clean up extra quotes
    } else {
        let styleProps: object;
        switch (projectType) {
            case 'native': styleProps = nativeStyleProperties; break;
            case 'flutter': styleProps = flutterStyleProperties; break;
            default: styleProps = webStyleProperties;
        }
        responseSchema = { type: Type.OBJECT, properties: styleProps };
        fullPrompt = `Generate a JSON object of styles for a '${elementType}' element based on the prompt: "${prompt}". Use appropriate keys and values for a ${projectType} application. The output must match the provided schema.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          },
        });
        
        return JSON.parse(response.text.trim());
    }
}

export async function refineElementFromPrompt(prompt: string, element: Element, projectType: ProjectType): Promise<DeepPartial<Element>> {
    const toastId = toast.loading("AI is refining the element...");
    try {
        let styleProps: object;
        switch (projectType) {
            case 'native': styleProps = nativeStyleProperties; break;
            case 'flutter': styleProps = flutterStyleProperties; break;
            default: styleProps = webStyleProperties;
        }

        const refinementSchema = {
            type: Type.OBJECT,
            properties: {
                content: { type: Type.STRING, nullable: true, description: "New text content for the element, if applicable." },
                props: { type: Type.OBJECT, properties: webProps, nullable: true, description: "New props for the element." },
                styles: {
                    type: Type.OBJECT,
                    properties: { desktop: { type: Type.OBJECT, properties: styleProps, nullable: true } },
                    nullable: true,
                    description: "Style modifications. Only include properties that need to be changed or added."
                }
            }
        };

        const fullPrompt = `
            Given the following JSON representation of a UI element:
            ${JSON.stringify({ type: element.type, name: element.name, content: element.content, props: element.props, styles: element.styles }, null, 2)}

            And the following refinement request from a user:
            "${prompt}"

            Generate a JSON object containing only the properties that need to be changed or added to fulfill the request.
            For example, if the request is "make the text red", you should only return '{"styles": {"desktop": {"color": "red"}}}'.
            If the request is to change the text, only return '{"content": "new text"}'.
            The output must match the provided schema precisely.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: refinementSchema,
            },
        });

        toast.success("Element refined!", { id: toastId });
        return JSON.parse(response.text.trim());

    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'AI refinement failed.', { id: toastId });
        console.error("AI refinement failed:", e);
        throw e;
    }
}

export async function generateCodeFromPrompt(prompt: string, language: string): Promise<string> {
    const fullPrompt = `
      You are an expert code generator.
      Based on the following request, generate a block of code in the ${language} language.
      Do not include any markdown formatting, comments, or explanations.
      Only return the raw code itself.

      Request: "${prompt}"
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    return response.text.trim();
}

export async function generatePropDescription(propName: string, propType: PropDefinition['type'], componentName: string): Promise<string> {
    const fullPrompt = `
        You are an expert technical writer.
        For a UI component named "${componentName}", generate a concise and helpful description for a property (prop).
        
        Property Name: "${propName}"
        Property Type: "${propType}"

        The description should explain what the prop does in a single sentence. Do not include any extra formatting, just the description text.
        Example for a 'label' prop: "The text content to display inside the button."
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    
    return response.text.trim().replace(/"/g, ''); // Clean up quotes
}


export async function generateResponsiveStylesFromDesktop(desktopStyles: React.CSSProperties): Promise<{ tablet: React.CSSProperties, mobile: React.CSSProperties }> {
    const styleSchema = {
        type: Type.OBJECT,
        properties: {
            tablet: { type: Type.OBJECT, properties: webStyleProperties },
            mobile: { type: Type.OBJECT, properties: webStyleProperties }
        }
    };

    const fullPrompt = `
        Given the following desktop CSS styles for a UI element:
        ${JSON.stringify(desktopStyles, null, 2)}

        Generate appropriate and responsive CSS styles for 'tablet' and 'mobile' viewports.
        - For tablet, make adjustments for a slightly smaller screen.
        - For mobile, make more significant adjustments: reduce font sizes and padding, and consider changing flex-direction from 'row' to 'column' if it exists.
        Only return the properties that need to be changed for each viewport.
        The output must match the provided schema precisely.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: styleSchema,
        },
    });

    return JSON.parse(response.text.trim());
}

export async function generateInteractionsFromPrompt(prompt: string, context: { stateVars: readonly StateVariable[], pages: {id: string, name: string}[], modals: {id: string, name: string}[] }): Promise<ActionStep[]> {
    const interactionSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: ['navigate_to_page', 'open_url', 'show_modal', 'hide_modal', 'toggle_modal', 'set_state', 'increment_state', 'decrement_state', 'toggle_state'] },
                payload: {
                    type: Type.OBJECT,
                    properties: {
                        pageId: { type: Type.STRING, nullable: true },
                        url: { type: Type.STRING, nullable: true },
                        modalId: { type: Type.STRING, nullable: true },
                        stateKey: { type: Type.STRING, nullable: true },
                        value: { type: Type.STRING, description: "Can be string, number, or boolean represented as a string.", nullable: true }
                    }
                }
            }
        }
    };

    const fullPrompt = `
        You are an expert at creating application logic. Based on the user's request, generate a list of actions to perform.
        
        User Request: "${prompt}"

        Available context:
        - State Variables: ${JSON.stringify(context.stateVars.map(v => ({ name: v.name, type: v.type })))}
        - Pages: ${JSON.stringify(context.pages)}
        - Modals: ${JSON.stringify(context.modals)}

        Generate a JSON array of action steps that logically fulfills the user's request using the available context.
        For 'set_state', the 'value' should be a string, even for numbers and booleans (e.g., "true", "123").
        The output must match the provided JSON schema exactly.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interactionSchema,
        },
    });

    return JSON.parse(response.text.trim());
}